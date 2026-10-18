import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { d1 } from './sqlite';
import { outreachFetch } from '../../src/worker/outreach';
import { mintSession } from '../../src/worker/auth';
import type { AppEnv } from '../../src/worker/env';
import type { Principal } from '../../src/shared/model';

let sqlite: DatabaseSync;
let env: AppEnv;
let token: string;
let emailQueue: unknown[];
let siteQueue: unknown[];
const html = '<!doctype html><html><head><style>td { color: #315b88; }</style></head><body><table style="width:600px"><tr><td><img src="https://images.example.com/product.jpg" alt="Product"><p>Hello {{name}} at {{company}},</p><a href="https://example.com/catalog" style="background:#315b88;color:white">View our catalog</a></td></tr></table></body></html>';
const subject = 'A catalog for {{company}}';
const bodyText = 'Hello {{name}}, here is the catalog for {{company}} in {{industry}}.';

const request = (path = '', method = 'GET', body?: unknown) => outreachFetch(new Request(
  'https://wr.example.test/api/outreach/assistant/sessions' + path,
  { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) },
), env, {} as any);

beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  const principal: Principal = { userId: 'member', workspaceId: 'w1', workspaceRole: 'member', systemRole: 'user',
    authSubject: 'member', email: 'member@example.com', displayName: 'Member', workspaceName: 'Workspace' };
  emailQueue = []; siteQueue = [];
  env = { DB: d1(sqlite), PRODUCT_RADAR_BASE_URL: 'https://account.example.test', ASSET_SIGNING_KEY: 'only-a-unit-test-key',
    EDM_EMAIL_QUEUE: { send: async (body: unknown) => emailQueue.push(body) },
    EDM_SITE_QUEUE: { send: async (body: unknown) => siteQueue.push(body) }, BROWSER: {},
    PRODUCT_RADAR_INTEGRATION_SECRET: 'test-integration-secret-at-least-32-characters' } as unknown as AppEnv;
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ protocolVersion: 1, principal })));
  token = (await mintSession(env, principal)).token;
});
afterEach(() => { sqlite.close(); vi.unstubAllGlobals(); });

async function create(channels = ['email', 'site']) {
  const response = await request('', 'POST', { requestId: crypto.randomUUID(), channels });
  expect(response.status).toBe(201);
  return (await response.json() as any).data;
}
function saveTemplate(id = 'visual-template', workspaceId = 'w1', content = html, text: string | null = bodyText) {
  sqlite.prepare('INSERT INTO edm_users(id,name,email,role,created_at,updated_at) VALUES(?,?,?,?,0,0) ON CONFLICT(id) DO NOTHING')
    .run(workspaceId, 'Workspace', workspaceId + '@workspace.invalid', 'member');
  sqlite.prepare('INSERT INTO edm_templates(id,user_id,name,subject,body_html,body_text,category,created_at,updated_at) VALUES(?,?,?,?,?,?,?,0,0)')
    .run(id, workspaceId, 'Saved visual template', subject, content, text, 'My templates');
}
const select = (session: any, templateId = 'visual-template', requestId: string = crypto.randomUUID()) => request('/' + session.id + '/template', 'POST', {
  requestId, expectedVersion: session.version, templateId,
});

test('selecting a saved template keeps its visual HTML and variables without model generation or sending', async () => {
  const session = await create();
  saveTemplate();
  const saved = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'identity', expectedVersion: session.version,
    draft: { sender: { name: 'Seller', email: 'sales@example.com' }, email: { replyTo: 'replies@example.com', sendRate: 12 },
      site: { targets: ['https://buyer.example.com/contact'], message: 'Could we share our catalog with your team?' } } })).json() as any).data;
  const response = await select(saved);
  expect(response.status).toBe(200);
  const selected = (await response.json() as any).data;
  expect(selected.draft.email).toMatchObject({ templateId: 'visual-template', subject, bodyHtml: html, bodyText, replyTo: 'replies@example.com', sendRate: 12 });
  expect(selected.draft.sender).toEqual(saved.draft.sender);
  expect(selected.draft.site).toEqual(saved.draft.site);
  expect(selected.messages.at(-1)).toMatchObject({ role: 'assistant', draftingStatus: 'ready', draftingChannels: ['email'] });
  expect(selected.version).toBe(saved.version + 1);
  expect((await (await request('/' + session.id)).json() as any).data.draft.email.bodyHtml).toBe(html);
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
  expect(vi.mocked(fetch).mock.calls.every(([input]) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith('https://account.example.test/');
  })).toBe(true);
});

test('selection is idempotent and freezes template content even when the original is later edited', async () => {
  const session = await create(); saveTemplate();
  const response = await select(session, 'visual-template', 'select-once');
  expect(response.status).toBe(200);
  const first = (await response.json() as any).data;
  sqlite.prepare('UPDATE edm_templates SET subject=?,body_html=? WHERE id=?').run('Changed later', '<p>Changed later</p>', 'visual-template');
  const replay = await select(session, 'visual-template', 'select-once');
  expect(replay.status).toBe(200);
  const replayed = (await replay.json() as any).data;
  expect(replayed.version).toBe(first.version);
  expect(replayed.draft.email.bodyHtml).toBe(html);
  expect(replayed.messages).toEqual(first.messages);
  expect((await select(session, 'visual-template', 'stale-selection')).status).toBe(409);
  expect((await select(session, 'different-template', 'select-once')).status).toBe(409);
});

test('manually changing only a selected template subject preserves its visual HTML and ready state', async () => {
  const session = await create(['email']); saveTemplate();
  const selected = (await (await select(session)).json() as any).data;
  const response = await request('/' + session.id + '/draft', 'PATCH', {
    requestId: 'manual-subject', expectedVersion: selected.version,
    draft: { email: { subject: 'Our updated catalog for {{company}}', bodyHtml: html, bodyText } },
    contentSource: 'manual', contentChannel: 'email',
  });
  expect(response.status).toBe(200);
  const saved = (await response.json() as any).data;
  expect(saved.draft.email).toMatchObject({ subject: 'Our updated catalog for {{company}}', bodyHtml: html, bodyText });
  expect(saved.draft.email.templateId).toBeUndefined();
  expect(saved.draftingStates).toMatchObject({ email: 'ready' });
  expect(saved.messages.at(-1)).toMatchObject({ role: 'assistant', draftingStatus: 'ready', draftingChannels: ['email'] });
  const reloaded = (await (await request('/' + session.id)).json() as any).data;
  expect(reloaded.draft.email.bodyHtml).toBe(html);
  expect(reloaded.draftingStates).toMatchObject({ email: 'ready' });
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('foreign and missing template IDs are hidden and leave the existing draft intact', async () => {
  const session = await create(); saveTemplate('foreign-template', 'w2');
  for (const id of ['foreign-template', 'missing-template']) {
    const response = await select(session, id);
    expect(response.status).toBe(404);
    expect((await response.json() as any).code).toBe('template_not_found');
  }
  const latest = (await (await request('/' + session.id)).json() as any).data;
  expect(latest.version).toBe(session.version);
  expect(latest.draft).toEqual(session.draft);
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('a submitted email and a site-only conversation cannot be overwritten by selecting a template', async () => {
  const session = await create(); saveTemplate();
  sqlite.prepare('UPDATE edm_assistant_sessions SET operations=? WHERE id=?').run(JSON.stringify([
    { channel: 'email', taskId: 'confirmed-email', name: 'Confirmed email', status: 'submitted', retryable: false, confirmedVersion: session.version },
  ]), session.id);
  const confirmedResponse = await select(session);
  expect(confirmedResponse.status).toBe(409);
  expect((await confirmedResponse.json() as any).code).toBe('email_already_confirmed');
  const siteOnly = await create(['site']);
  expect((await select(siteOnly)).status).toBe(400);
  expect((await (await request('/' + session.id)).json() as any).data.draft.email).toEqual(session.draft.email);
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('selection uses the existing content policy and normalizes a missing plain-text version', async () => {
  const session = await create(); saveTemplate('blocked', 'w1', '<p>Guns for sale</p>');
  const blocked = await select(session, 'blocked');
  expect(blocked.status).toBe(400);
  expect((await blocked.json() as any).code).toBe('blocked_content');
  saveTemplate('html-only', 'w1', html, null);
  const response = await select(session, 'html-only');
  expect(response.status).toBe(200);
  expect((await response.json() as any).data.draft.email).toMatchObject({ bodyHtml: html, bodyText: '', templateId: 'html-only' });
});
