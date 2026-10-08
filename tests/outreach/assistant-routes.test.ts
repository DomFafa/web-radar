import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { d1 } from './sqlite';
import { outreachFetch } from '../../src/worker/outreach';
import { mintSession } from '../../src/worker/auth';
import type { AppEnv } from '../../src/worker/env';
import type { Principal } from '../../src/shared/model';
import { seal } from '../../src/outreach/server/lib/credentials';
import { outreachBindings } from '../../src/worker/outreach';
import { emptyDraft, mergeDraft } from '../../src/outreach/server/lib/assistant';

let sqlite: DatabaseSync;
let env: AppEnv;
let principal: Principal;
let token: string;
let emailQueue: any[], siteQueue: any[];
const request = (path = '', method = 'GET', body?: unknown) => outreachFetch(new Request(
  'https://wr.example.test/api/outreach/assistant/sessions' + path,
  { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) },
), env, {} as any);

beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  principal = { userId: 'member', workspaceId: 'w1', workspaceRole: 'member', systemRole: 'user',
    authSubject: 'member', email: 'member@example.com', displayName: 'Member', workspaceName: 'Workspace' };
  emailQueue = []; siteQueue = [];
  env = { DB: d1(sqlite), PRODUCT_RADAR_BASE_URL: 'https://account.example.test', ASSET_SIGNING_KEY: 'only-a-unit-test-key',
    EDM_EMAIL_QUEUE: { send: async (body: any) => emailQueue.push(body), sendBatch: async (batch: any[]) => emailQueue.push(...batch.map(item => item.body)) },
    EDM_SITE_QUEUE: { send: async (body: any) => siteQueue.push(body) }, BROWSER: {},
    PRODUCT_RADAR_INTEGRATION_SECRET: 'test-integration-secret-at-least-32-characters' } as unknown as AppEnv;
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ protocolVersion: 1, principal })));
  token = (await mintSession(env, principal)).token;
});

async function create(channels: string[] = ['email']) {
  const response = await request('', 'POST', { requestId: crypto.randomUUID(), channels });
  expect(response.status).toBe(201); return (await response.json() as any).data;
}
async function ready(channels: string[] = ['email']) {
  const session = await create(channels);
  sqlite.exec("INSERT OR IGNORE INTO edm_contacts(id,user_id,email,name,created_at,updated_at) VALUES('contact','w1','buyer@example.com','Buyer',0,0)");
  const response = await request('/' + session.id + '/draft', 'PATCH', { requestId: crypto.randomUUID(), expectedVersion: session.version,
    draft: { brief: 'Introduce our sample product', sender: { name: 'Seller', email: 'sales@example.com' },
      email: { contactIds: ['contact'], subject: 'Sample proposal', bodyHtml: '<p>Hello {{name}}, would you like a sample?</p>', bodyText: 'Would you like a sample?' },
      site: { targets: ['https://buyer.example.com/contact'], subject: 'Sample proposal', message: 'Hello, would your team like a product sample?' } } });
  expect(response.status).toBe(200); return (await response.json() as any).data;
}
async function emailProvider() {
  const key = await seal('unit-test-provider-key', 'provider', outreachBindings(env));
  sqlite.prepare("INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at) VALUES('provider','w1','sendgrid','Unit test',?,1,0,0)").run(key);
}
function insertRecipientGroup(id: string, count: number) {
  sqlite.prepare("INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES(?,'w1',?,0,0)").run(id, 'Bulk customers');
  sqlite.exec('BEGIN');
  const insert = sqlite.prepare("INSERT INTO edm_contacts(id,user_id,group_id,email,created_at,updated_at) VALUES(?,'w1',?,?,0,0)");
  const ids = Array.from({ length: count }, (_, index) => id + '-' + index);
  for (const contactId of ids) insert.run(contactId, id, contactId + '@example.com');
  sqlite.exec('COMMIT');
  return ids;
}
const confirmation = (session: any, requestId: string = crypto.randomUUID()) => ({ requestId, expectedVersion: session.version, confirmationToken: session.confirmationToken, siteAuthorized: true });
const mockAiReply = (data: unknown) => {
  env.TEXT_API_BASE_URL = 'https://text.example.com/v1'; env.TEXT_API_KEY = 'unit-test-text-key'; env.TEXT_MODEL = 'unit-test-model';
  vi.stubGlobal('fetch', vi.fn(async (url: unknown) => String(url).includes('text.example.com')
    ? Response.json({ choices: [{ message: { content: JSON.stringify(data) } }] })
    : Response.json({ protocolVersion: 1, principal })));
};

test('compose clarification blocks the old email confirmation and drafting state stays channel-specific after data edits and reload', async () => {
  let session = await ready(['email', 'site']);
  const oldToken = session.confirmationToken;
  mockAiReply({ message: '请补充具体产品与沟通目的。', draftingStatus: 'needs_facts', draft: {} });
  const response = await request('/' + session.id + '/messages', 'POST', { requestId: 'compose-email', expectedVersion: session.version,
    message: '请起草邮件', intent: 'compose', composeChannels: ['email'] });
  expect(response.status).toBe(200); session = (await response.json() as any).data;
  expect(session.draftingStates).toEqual({ email: 'needs_facts' }); expect(session.status).toBe('draft');
  expect(session.confirmationToken).toBeNull();
  expect(session.messages.at(-1)).toMatchObject({ draftingStatus: 'needs_facts', draftingChannels: ['email'] });
  expect((await request('/' + session.id + '/confirm', 'POST', { ...confirmation(session), confirmationToken: oldToken })).status).toBe(409);
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'identity-edit', expectedVersion: session.version,
    draft: { sender: { name: 'Updated Seller' }, email: { groupId: 'null' } } })).json() as any).data;
  expect(session.draftingStates).toEqual({ email: 'needs_facts' }); expect(session.confirmationToken).toBeNull();
  const restored = (await (await request('/' + session.id)).json() as any).data;
  expect(restored.draftingStates).toEqual({ email: 'needs_facts' }); expect(restored.confirmationToken).toBeNull();
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('only explicit complete manual content ends the requested channel drafting clarification', async () => {
  let session = await ready(['email', 'site']);
  mockAiReply({ message: '请补充具体产品。', draftingStatus: 'needs_facts', draft: {} });
  session = (await (await request('/' + session.id + '/messages', 'POST', { requestId: 'compose-both', expectedVersion: session.version,
    message: '请起草邮件和留言', intent: 'compose', composeChannels: ['email', 'site'] })).json() as any).data;
  expect(session.draftingStates).toEqual({ email: 'needs_facts', site: 'needs_facts' });
  const partial = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'partial-manual', expectedVersion: session.version,
    contentSource: 'manual', contentChannel: 'email', draft: { email: { subject: 'A manual proposal' } } });
  expect(partial.status).toBe(400);
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'ordinary-content-edit', expectedVersion: session.version,
    draft: { email: { subject: 'Edited subject', bodyHtml: '<p>A revised proposal</p>' } } })).json() as any).data;
  expect(session.draftingStates).toEqual({ email: 'needs_facts', site: 'needs_facts' });
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'manual-email', expectedVersion: session.version,
    contentSource: 'manual', contentChannel: 'email', draft: { email: { subject: 'A manual proposal', bodyHtml: '<p>Would you like our catalog?</p>', bodyText: 'Would you like our catalog?' } } })).json() as any).data;
  expect(session.draftingStates).toEqual({ email: 'ready', site: 'needs_facts' }); expect(session.confirmationToken).toBeNull();
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'manual-site', expectedVersion: session.version,
    contentSource: 'manual', contentChannel: 'site', draft: { site: { message: 'Would your team like our catalog?' } } })).json() as any).data;
  expect(session.draftingStates).toEqual({ email: 'ready', site: 'ready' }); expect(session.confirmationToken).toBeTruthy();
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test.each(['email', 'site'] as const)('compose partial clarification preserves the restorable complete draft (%s)', async channel => {
  const session = await ready(['email', 'site']);
  mockAiReply({ message: '请补充具体产品。', draftingStatus: 'needs_facts', draft: { [channel]: { subject: 'Partial subject' } } });
  const response = await request('/' + session.id + '/messages', 'POST', { requestId: 'partial-clarification', expectedVersion: session.version,
    message: '请帮我起草', intent: 'compose', composeChannels: [channel] });
  expect(response.status).toBe(200);
  const next = (await response.json() as any).data;
  expect(next.draft).toEqual(session.draft); expect(next.draftingStates[channel]).toBe('needs_facts');
  const restoredResponse = await request('/' + session.id);
  expect(restoredResponse.status).toBe(200); expect((await restoredResponse.json() as any).data.draft).toEqual(session.draft);
});

test('ordinary chat scopes drafting clarification to email without invalidating a ready website message', async () => {
  let session = await ready(['email', 'site']);
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'ready-site', expectedVersion: session.version,
    contentSource: 'manual', contentChannel: 'site', draft: { site: { message: session.draft.site.message } } })).json() as any).data;
  expect(session.draftingStates).toEqual({ site: 'ready' });
  mockAiReply({ message: '这封邮件要介绍什么产品？', draftingStatus: 'needs_facts', draftingChannels: ['email'], draft: {} });
  const response = await request('/' + session.id + '/messages', 'POST', { requestId: 'email-question', expectedVersion: session.version,
    message: 'Help me with the email content' });
  expect(response.status).toBe(200); session = (await response.json() as any).data;
  expect(session.draftingStates).toEqual({ site: 'ready', email: 'needs_facts' });
  expect(session.messages.at(-1)).toMatchObject({ draftingStatus: 'needs_facts', draftingChannels: ['email'] });
  expect(session.confirmationToken).toBeNull(); expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('compose only accepts requested pending channels and leaves confirmed email snapshots untouched', async () => {
  let session = await ready(['email']); await emailProvider();
  session = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session))).json() as any).data;
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'new-site', expectedVersion: session.version,
    draft: { channels: ['email', 'site'], site: { targets: ['https://buyer.example.com/contact'] } } })).json() as any).data;
  const email = session.draft.email, operation = session.operations[0];
  mockAiReply({ message: '网站留言已起草。', draftingStatus: 'ready', draft: {
    email: { subject: 'Do not alter the email', bodyHtml: '<p>Do not replace the approved email</p>' },
    site: { message: 'Would your team like our catalog?' } } });
  expect((await request('/' + session.id + '/messages', 'POST', { requestId: 'confirmed-channel', expectedVersion: session.version,
    message: '请重新起草已发邮件', intent: 'compose', composeChannels: ['email'] })).status).toBe(400);
  const response = await request('/' + session.id + '/messages', 'POST', { requestId: 'pending-site', expectedVersion: session.version,
    message: '请起草网站留言', intent: 'compose', composeChannels: ['site'] });
  expect(response.status).toBe(200); session = (await response.json() as any).data;
  expect(session.pendingChannels).toEqual(['site']); expect(session.draftingStates).toEqual({ site: 'ready' });
  expect(session.draft.email).toEqual(email); expect(session.operations[0]).toEqual(operation);
  expect(session.draft.site.targets).toEqual(['https://buyer.example.com/contact']);
  expect(emailQueue).toHaveLength(1); expect(siteQueue).toEqual([]);
});

test('manual unchanged template content and subject edits preserve its visual HTML', async () => {
  let session = await ready();
  const html = '<style>.offer{color:purple}</style><table><tr><td class="offer" style="padding:20px"><img src="https://assets.example.com/banner.png"><p>Our catalog</p></td></tr></table>';
  session.draft.email = { ...session.draft.email, subject: 'Catalog', bodyHtml: html, bodyText: 'Our catalog', templateId: 'verified-template' };
  sqlite.prepare('UPDATE edm_assistant_sessions SET draft=? WHERE id=?').run(JSON.stringify(session.draft), session.id);
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'keep-template', expectedVersion: session.version,
    contentSource: 'manual', contentChannel: 'email', draft: { email: { subject: 'Catalog', bodyHtml: html, bodyText: 'Our catalog' } } })).json() as any).data;
  expect(session.draft.email.bodyHtml).toBe(html); expect(session.draft.email.templateId).toBe('verified-template');
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'subject-only', expectedVersion: session.version,
    draft: { email: { subject: 'Updated catalog', bodyHtml: html, bodyText: 'Our catalog' } } })).json() as any).data;
  expect(session.draft.email.bodyHtml).toBe(html); expect(session.draft.email.templateId).toBeUndefined();
  expect((await request('/' + session.id + '/draft', 'PATCH', { requestId: 'forged-template', expectedVersion: session.version,
    draft: { email: { templateId: 'forged' } } })).status).toBe(400);
});

test('CAS rejects a stale edit and repeat request replays without incrementing twice', async () => {
  const session = await create();
  const body = { requestId: 'edit', expectedVersion: session.version, draft: { brief: 'A sample request' } };
  const response = await request('/' + session.id + '/draft', 'PATCH', body); expect(response.status).toBe(200);
  expect((await response.json() as any).data.version).toBe(2);
  const replay = await request('/' + session.id + '/draft', 'PATCH', body); expect(replay.status).toBe(200); expect((await replay.json() as any).data.version).toBe(2);
  expect((await request('/' + session.id + '/draft', 'PATCH', { ...body, requestId: 'stale' })).status).toBe(409);
  expect((await request('/' + session.id + '/draft', 'PATCH', { ...body, draft: { brief: 'Changed' } })).status).toBe(409);
});

test('members cannot inspect another actor or workspace conversation and viewers cannot edit', async () => {
  const session = await create();
  principal = { ...principal, userId: 'other', authSubject: 'other', email: 'other@example.com' }; token = (await mintSession(env, principal)).token;
  expect((await request('/' + session.id)).status).toBe(404);
  expect((await request('/' + session.id + '/results')).status).toBe(404);
  expect((await request()).status).toBe(200); expect((await (await request()).json() as any).data).toEqual([]);
  principal = { ...principal, userId: 'member', workspaceId: 'w2' }; token = (await mintSession(env, principal)).token;
  expect((await request('/' + session.id)).status).toBe(404);
  principal = { ...principal, workspaceId: 'w1' }; token = (await mintSession(env, principal)).token;
  sqlite.exec("UPDATE wr_members SET role='viewer' WHERE workspace_id='w1' AND user_id='member'");
  await expect(request('/' + session.id + '/draft', 'PATCH', { requestId: 'write', expectedVersion: 1, draft: {} })).rejects.toMatchObject({ status: 403 });
});

test('both channels require one exact confirmation and duplicate confirmation does not create or queue again', async () => {
  const session = await ready(['email', 'site']); await emailProvider();
  expect(session.missingFields).toEqual([]); expect(session.confirmationToken).toBeTruthy();
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
  const body = confirmation(session, 'confirm-once');
  const responses = await Promise.all([request('/' + session.id + '/confirm', 'POST', body), request('/' + session.id + '/confirm', 'POST', body)]);
  expect(responses.some(response => response.status === 200)).toBe(true);
  const latest = (await (await request('/' + session.id)).json() as any).data;
  expect(latest.operations.map((op: any) => op.status)).toEqual(['submitted', 'submitted']);
  expect(emailQueue).toHaveLength(1); expect(siteQueue).toHaveLength(1);
  expect(emailQueue[0]).toMatchObject({ toEmail: 'buyer@example.com', fromEmail: 'sales@example.com', subject: 'Sample proposal' });
  expect((await request('/' + session.id + '/confirm', 'POST', body)).status).toBe(200);
  expect(emailQueue).toHaveLength(1); expect(siteQueue).toHaveLength(1);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(1);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_site_message_jobs').get()!.n).toBe(1);
  const results = (await (await request('/' + session.id + '/results')).json() as any).data;
  expect(results.summary.total).toBe(2); expect(results.summary.sent).toBe(0);
  expect(results.channels.every((channel: any) => channel.exportPath.endsWith('/export'))).toBe(true);
});

test('target or content changes invalidate confirmation and test mode never queues', async () => {
  const session = await ready();
  sqlite.exec("UPDATE edm_contacts SET email='changed@example.com' WHERE id='contact'");
  expect((await request('/' + session.id + '/confirm', 'POST', confirmation(session))).status).toBe(409);
  const latest = (await (await request('/' + session.id)).json() as any).data;
  env.ENVIRONMENT = 'test'; env.TEST_PROVIDERS = 'true';
  // The sending guard is tested directly with the same route context to avoid changing authentication modes.
  const { assistantRoutes } = await import('../../src/outreach/server/routes/assistant.routes');
  const { Hono } = await import('hono');
  const app = new Hono<any>(); app.use('*', async (c, next) => { c.set('user', { id: 'w1', actorId: 'member', role: 'member' }); await next(); }); app.route('/', assistantRoutes);
  const response = await app.request('/sessions/' + latest.id + '/confirm', { method: 'POST', body: JSON.stringify(confirmation(latest)), headers: { 'Content-Type': 'application/json' } }, outreachBindings(env));
  expect(response.status).toBe(503); expect((await response.json() as any).code).toBe('outreach_test_mode');
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(0);
});

test('adding a website channel after email submission preserves the original email task', async () => {
  let session = await ready(); await emailProvider();
  session = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session))).json() as any).data;
  const emailTask = session.operations[0].taskId;
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'add-site', expectedVersion: session.version,
    draft: { channels: ['email', 'site'], site: { targets: ['https://buyer.example.com/contact'], message: 'Hello, would your team like a product sample?' } } })).json() as any).data;
  expect(session.pendingChannels).toEqual(['site']);
  session = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session))).json() as any).data;
  expect(session.operations[0].taskId).toBe(emailTask); expect(emailQueue).toHaveLength(1); expect(siteQueue).toHaveLength(1);
});

test('removing and re-enabling a channel does not restore its old audience or content', async () => {
  let session = await ready(['email', 'site']);
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'settings', expectedVersion: session.version,
    draft: { language: 'zh', email: { replyTo: 'reply@example.com', replyTracking: true, sendRate: 12 }, site: { replyTracking: true } } })).json() as any).data;
  const email = session.draft.email;
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'email-only', expectedVersion: session.version,
    draft: { channels: ['email'] } })).json() as any).data;
  expect(session.draft.site).toEqual({ subject: '', message: '', targets: [], replyTracking: true });
  expect(session.draft.email).toEqual(email);
  expect(session.draft.sender).toMatchObject({ name: 'Seller', email: 'sales@example.com' });
  expect(session.draft.language).toBe('zh'); expect(session.draft.brief).toBe('');
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'site-again', expectedVersion: session.version,
    draft: { channels: ['email', 'site'] } })).json() as any).data;
  expect(session.preview.site.count).toBe(0);
  expect(session.draft.site.message).toBe('');
  expect(session.confirmationToken).toBeNull();
  expect(session.missingFields.map((field: any) => field.key)).toEqual(['site.targets', 'site.content']);
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('newly selected channel uses only explicitly supplied content and targets', async () => {
  let session = await ready(['email']);
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'switch-site', expectedVersion: session.version,
    draft: { channels: ['site'], brief: 'Ask about a new catalog', site: { message: 'May we send your team a catalog?' } } })).json() as any).data;
  expect(session.draft.site).toEqual({ subject: '', message: 'May we send your team a catalog?', targets: [], replyTracking: false });
  expect(session.draft.email).toMatchObject({ contactIds: [], groupId: '', tag: '', subject: '', bodyHtml: '', bodyText: '' });
  expect(session.draft.brief).toBe('Ask about a new catalog');
  expect(session.preview.site.count).toBe(0); expect(session.preview.email.count).toBe(0);
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'switch-email', expectedVersion: session.version,
    draft: { channels: ['email'], email: { subject: 'New request' } } })).json() as any).data;
  expect(session.draft.email).toMatchObject({ subject: 'New request', bodyHtml: '', bodyText: '', contactIds: [] });
  expect(session.draft.site.message).toBe(''); expect(session.draft.brief).toBe('');
});

test('restating the current channel preserves content and audience when changing sender details', async () => {
  const session = await ready(['email', 'site']);
  const response = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'same-channels', expectedVersion: session.version,
    draft: { channels: ['site', 'email'], sender: { name: 'Updated Seller' } } });
  expect(response.status).toBe(200);
  const next = (await response.json() as any).data;
  expect(next.draft.email).toEqual(session.draft.email); expect(next.draft.site).toEqual(session.draft.site);
  expect(next.draft.brief).toBe(session.draft.brief); expect(next.draft.sender.name).toBe('Updated Seller');
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('partial queue failure stays uncertain and repeat confirmation only reads the original tasks', async () => {
  const session = await ready(['email', 'site']); await emailProvider();
  env.EDM_SITE_QUEUE = { send: async () => { throw new Error('transport-lost'); } } as any;
  const body = confirmation(session);
  const response = await request('/' + session.id + '/confirm', 'POST', body); expect(response.status).toBe(200);
  const data = (await response.json() as any).data;
  expect(data.operations.map((op: any) => op.status)).toEqual(['submitted', 'uncertain']);
  expect((await request('/' + session.id + '/confirm', 'POST', body)).status).toBe(200);
  expect(emailQueue).toHaveLength(1); expect(sqlite.prepare('SELECT count(*) n FROM edm_site_message_jobs').get()!.n).toBe(1);
});

test('an explicit group selection is retained when the data card clears the other sources', async () => {
  const session = await create();
  sqlite.exec("INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES('group','w1','Buyers',0,0); INSERT INTO edm_contacts(id,user_id,group_id,email,created_at,updated_at) VALUES('group-contact','w1','group','group-buyer@example.com',0,0)");
  const response = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'select-group', expectedVersion: 1, draft: { email: { groupId: 'group', tag: '', contactIds: [] } } });
  expect(response.status).toBe(200); const data = (await response.json() as any).data;
  expect(data.draft.email.groupId).toBe('group'); expect(data.preview.email.count).toBe(1);
});

test('the conversation list distinguishes a ready draft and a failed operation', async () => {
  const session = await ready();
  expect((await (await request()).json() as any).data[0].status).toBe('ready');
  await request('/' + session.id + '/confirm', 'POST', confirmation(session));
  expect((await (await request()).json() as any).data[0].status).toBe('needs_attention');
});

test('only a known failed channel retries on its original task with the approved snapshot', async () => {
  let session = await ready(['email', 'site']);
  session = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session))).json() as any).data;
  expect(session.operations.map((op: any) => op.status)).toEqual(['failed', 'submitted']);
  expect(session.operations[0].retryable).toBe(true);
  const taskId = session.operations[0].taskId;
  await emailProvider();
  sqlite.exec("UPDATE edm_contacts SET email='changed@example.com',name='Changed buyer' WHERE id='contact'");
  const body = { requestId: 'retry-email', expectedVersion: session.version, channel: 'email' };
  const response = await request('/' + session.id + '/retry', 'POST', body); expect(response.status).toBe(200);
  session = (await response.json() as any).data;
  expect(session.operations[0]).toMatchObject({ taskId, status: 'submitted', retryable: false });
  expect(emailQueue).toHaveLength(1); expect(siteQueue).toHaveLength(1);
  expect(emailQueue[0]).toMatchObject({ toEmail: 'buyer@example.com', toName: 'Buyer' });
  expect((await request('/' + session.id + '/retry', 'POST', body)).status).toBe(200);
  expect(emailQueue).toHaveLength(1);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(1);
});

test('stale dispatch becomes uncertain while a prepared second channel can resume without repeating the first', async () => {
  let session = await ready(['email', 'site']); await emailProvider();
  session = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session, 'interrupted'))).json() as any).data;
  const operations = session.operations.map((op: any) => ({ ...op, status: op.channel === 'email' ? 'dispatching' : 'prepared', retryable: false }));
  sqlite.prepare('UPDATE edm_assistant_sessions SET operations=?,pending_request_id=?,pending_since=? WHERE id=?')
    .run(JSON.stringify(operations), 'interrupted', Date.now() - 180000, session.id);
  sqlite.prepare("UPDATE edm_assistant_requests SET status='processing' WHERE session_id=? AND request_id='interrupted'").run(session.id);
  // Simulate the second operation's durable preparation before any queue submission.
  sqlite.prepare("UPDATE edm_site_message_jobs SET status='draft' WHERE id=?").run(operations[1].taskId); siteQueue = [];
  session = (await (await request('/' + session.id)).json() as any).data;
  expect(session.operations[0]).toMatchObject({ status: 'uncertain', retryable: false });
  expect(session.operations[1]).toMatchObject({ status: 'prepared', retryable: true });
  expect((await request('/' + session.id + '/retry', 'POST', { requestId: 'unsafe-retry', expectedVersion: session.version, channel: 'email' })).status).toBe(409);
  expect((await request('/' + session.id + '/retry', 'POST', { requestId: 'resume-site', expectedVersion: session.version, channel: 'site' })).status).toBe(200);
  expect(emailQueue).toHaveLength(1); expect(siteQueue).toHaveLength(1);
});

test('email CSV reports the approved address after a contact is edited and remains actor scoped', async () => {
  const session = await ready(); await emailProvider();
  const submitted = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session))).json() as any).data;
  sqlite.exec("UPDATE edm_contacts SET email='new-address@example.com',name='New name' WHERE id='contact'");
  sqlite.prepare("UPDATE edm_campaign_recipients SET status='sent',sent_at=1,ses_message_id='recorded-provider-id' WHERE campaign_id=?").run(submitted.operations[0].taskId);
  const response = await request('/' + session.id + '/email/export'); expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toContain('text/csv');
  const csv = await response.text(); expect(csv).toContain('buyer@example.com'); expect(csv).not.toContain('new-address@example.com'); expect(csv).toContain('发送成功');
  principal = { ...principal, userId: 'other', authSubject: 'other' }; token = (await mintSession(env, principal)).token;
  expect((await request('/' + session.id + '/email/export')).status).toBe(404);
});

test('new conversations default reply tracking only for verified enabled channel settings', async () => {
  const initial = await create(['email', 'site']);
  expect(initial.draft.email.replyTracking).toBe(false); expect(initial.draft.site.replyTracking).toBe(false);
  sqlite.exec("INSERT INTO wr_inbox_configs(id,workspace_id,domain,forward_to,secret,enabled,track_edm,track_sites,verified_at,created_at) VALUES('inbox','w1','reply.example.com','owner@example.com','unit-test',1,1,0,'2026-10-03','2026-10-03')");
  const session = await create(['email', 'site']);
  expect(session.draft.email.replyTracking).toBe(true); expect(session.draft.site.replyTracking).toBe(false);
  const response = await outreachFetch(new Request('https://wr.example.test/api/outreach/assistant/options', { headers: { Authorization: 'Bearer ' + token } }), env, {} as any);
  expect((await response.json() as any).data.replyTracking).toEqual({ enabled: true, email: true, site: false });
  sqlite.exec('UPDATE wr_inbox_configs SET enabled=0');
  const disabled = await create(['email', 'site']);
  expect(disabled.draft.email.replyTracking).toBe(false); expect(disabled.draft.site.replyTracking).toBe(false);
});

test('confirmation refuses claimed reply tracking after its verified configuration is disabled', async () => {
  let session = await ready(); await emailProvider();
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'tracking', expectedVersion: session.version, draft: { email: { replyTracking: true } } })).json() as any).data;
  const response = await request('/' + session.id + '/confirm', 'POST', confirmation(session));
  expect(response.status).toBe(400); expect((await response.json() as any).code).toBe('reply_tracking_unavailable');
  expect(emailQueue).toEqual([]); expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(0);
});

test('reusing a create request with different channel choices is a conflict', async () => {
  expect((await request('', 'POST', { requestId: 'create-once', channels: ['email'] })).status).toBe(201);
  expect((await request('', 'POST', { requestId: 'create-once', channels: ['site'] })).status).toBe(409);
  expect((await request('', 'POST', { requestId: 'create-once', channels: ['email'] })).status).toBe(200);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_assistant_sessions').get()!.n).toBe(1);
});

test('imports 20000 contacts in 40 batches, selects the new group and queues its confirmed snapshot exactly once', async () => {
  let session = await ready(); await emailProvider();
  const contacts = (path: string, method = 'GET', body?: unknown) => outreachFetch(new Request(
    'https://wr.example.test/api/outreach/contacts' + path,
    { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) },
  ), env, {} as any);
  const groupResponse = await contacts('/groups', 'POST', { name: 'Imported customers' });
  expect(groupResponse.status).toBe(201);
  const groupId = (await groupResponse.json() as any).data.id;
  const importResponse = await contacts('/imports', 'POST', { name: 'customers.csv', groupId, total: 20000 });
  expect(importResponse.status).toBe(201);
  const importId = (await importResponse.json() as any).data.id;
  for (let batchIndex = 0; batchIndex < 40; batchIndex++) {
    const chunk = Array.from({ length: 500 }, (_, offset) => ({
      email: `buyer-${batchIndex * 500 + offset}@example.com`, name: 'Customer '.repeat(12),
      company: 'Company '.repeat(20), industry: 'Industry '.repeat(12),
    }));
    const response = await contacts(`/imports/${importId}/batches`, 'POST', { batchIndex, contacts: chunk });
    expect(response.status).toBe(200);
    expect((await response.json() as any).data).toEqual({ imported: 500, updated: 0, skipped: 0, failed: 0, total: 500 });
    if (batchIndex === 0) {
      const repeated = await contacts(`/imports/${importId}/batches`, 'POST', { batchIndex, contacts: chunk });
      expect(repeated.status).toBe(200);
      expect((await repeated.json() as any).data.imported).toBe(500);
    }
  }
  expect(sqlite.prepare('SELECT count(*) n FROM edm_contact_import_batches WHERE job_id=?').get(importId)!.n).toBe(40);
  expect(sqlite.prepare('SELECT processed,imported,skipped,failed FROM edm_contact_import_jobs WHERE id=?').get(importId))
    .toEqual({ processed: 20000, imported: 20000, skipped: 0, failed: 0 });
  expect(sqlite.prepare('SELECT contact_count n FROM edm_contact_groups WHERE id=?').get(groupId)!.n).toBe(20000);
  const groups = (await (await contacts('/groups')).json() as any).data;
  expect(groups.find((group: any) => group.id === groupId).contactCount).toBe(20000);
  const selected = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'all', expectedVersion: session.version,
    draft: { email: { groupId, tag: '', contactIds: [] } } });
  expect(selected.status).toBe(200);
  session = (await selected.json() as any).data;
  expect(session.preview.email.count).toBe(20000);
  expect(session.missingFields).toEqual([]); expect(session.confirmationToken).toBeTruthy();
  const queueBatchSizes: number[] = [];
  const queue = env.EDM_EMAIL_QUEUE!;
  env.EDM_EMAIL_QUEUE = { ...queue, sendBatch: async (batch: any[]) => {
    queueBatchSizes.push(batch.length); return queue.sendBatch(batch);
  } } as any;
  const confirmed = confirmation(session, 'confirm-imported');
  const response = await request('/' + session.id + '/confirm', 'POST', confirmed);
  expect(response.status).toBe(200);
  expect(emailQueue).toHaveLength(20000);
  expect(queueBatchSizes).toHaveLength(200); expect(queueBatchSizes.every(size => size === 100)).toBe(true);
  expect(new Set(emailQueue.map(item => item.toEmail)).size).toBe(20000);
  expect(new Set(emailQueue.map(item => item.recipientId)).size).toBe(20000);
  expect(emailQueue.every(item => /^buyer-\d+@example\.com$/.test(item.toEmail))).toBe(true);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_assistant_recipients').get()!.n).toBe(20000);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaign_recipients').get()!.n).toBe(20000);
  const saved = sqlite.prepare('SELECT max(length(snapshot)) n FROM edm_assistant_snapshots').get()!;
  expect(Number(saved.n)).toBeLessThan(2000000);
  expect((await request('/' + session.id + '/confirm', 'POST', confirmed)).status).toBe(200);
  expect(emailQueue).toHaveLength(20000);
});

test('accepts exactly 20000 explicit recipient IDs in the saved assistant draft', () => {
  const contactIds = Array.from({ length: 20000 }, (_, index) => 'contact-' + index);
  expect(mergeDraft(emptyDraft(['email']), { email: { contactIds } }).email.contactIds).toHaveLength(20000);
});

test('rejects 20001 recipients by group or explicit selection without dispatching or changing the saved audience', async () => {
  const session = await ready();
  const ids = insertRecipientGroup('oversized', 20001);
  const groupResponse = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'oversized-group', expectedVersion: session.version,
    draft: { email: { groupId: 'oversized', contactIds: [] } } });
  expect(groupResponse.status).toBe(400);
  expect((await groupResponse.json() as any).code).toBe('too_many_recipients');
  const explicitResponse = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'oversized-explicit', expectedVersion: session.version,
    draft: { email: { contactIds: ids } } });
  expect(explicitResponse.status).toBe(400);
  expect((await explicitResponse.json() as any).code).toBe('invalid_request');
  const restored = (await (await request('/' + session.id)).json() as any).data;
  expect(restored.draft.email.contactIds).toEqual(['contact']); expect(restored.version).toBe(session.version);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(0);
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('a saved recipient group that grows to 20001 stays editable without a confirmation token', async () => {
  let session = await ready();
  insertRecipientGroup('growing', 0);
  sqlite.exec("UPDATE edm_contacts SET group_id='growing' WHERE id='contact'");
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'select-growing', expectedVersion: session.version,
    draft: { email: { groupId: 'growing', contactIds: [] } } })).json() as any).data;
  expect(session.preview.email.count).toBe(1); expect(session.confirmationToken).toBeTruthy();
  sqlite.exec('BEGIN');
  const insert = sqlite.prepare("INSERT INTO edm_contacts(id,user_id,group_id,email,created_at,updated_at) VALUES(?,'w1','growing',?,0,0)");
  for (let index = 0; index < 20000; index++) insert.run('added-' + index, `added-${index}@example.com`);
  sqlite.exec('COMMIT');
  const response = await request('/' + session.id);
  expect(response.status).toBe(200);
  const expanded = (await response.json() as any).data;
  expect(expanded.status).toBe('draft'); expect(expanded.confirmationToken).toBeNull();
  expect(expanded.preview.email.count).toBe(20001);
  expect(expanded.missingFields.some((field: any) => field.key === 'email.audience')).toBe(true);
  const repaired = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'shrink-audience', expectedVersion: expanded.version,
    draft: { email: { contactIds: ['contact'], groupId: '', tag: '' } } });
  expect(repaired.status).toBe(200);
  const small = (await repaired.json() as any).data;
  expect(small.preview.email.count).toBe(1); expect(small.status).toBe('ready'); expect(small.confirmationToken).toBeTruthy();
  expect(emailQueue).toEqual([]);
});

test('ordinary assistant chat rejects an oversized group before replacing the saved audience', async () => {
  const session = await ready();
  insertRecipientGroup('oversized', 20001);
  mockAiReply({ message: '选择客户分组。', draft: {}, audience: { groupId: 'oversized' } });
  const response = await request('/' + session.id + '/messages', 'POST', { requestId: 'oversized-chat', expectedVersion: session.version,
    message: '选择 Bulk customers 分组发送邮件' });
  expect(response.status).toBe(400); expect((await response.json() as any).code).toBe('too_many_recipients');
  const restoredResponse = await request('/' + session.id);
  expect(restoredResponse.status).toBe(200);
  const restored = (await restoredResponse.json() as any).data;
  expect(restored.draft.email).toEqual(session.draft.email); expect(restored.version).toBe(session.version);
  expect(restored.messages).toEqual(session.messages); expect(restored.preview.email.count).toBe(1);
  expect(emailQueue).toEqual([]); expect(siteQueue).toEqual([]);
});

test('saving a draft preserves the complete existing conversation instead of truncating old messages', async () => {
  const session = await create();
  const messages = Array.from({ length: 105 }, (_, index) => ({ id: String(index), role: 'user', content: 'Message ' + index, createdAt: '2026-10-03' }));
  sqlite.prepare('UPDATE edm_assistant_sessions SET messages=? WHERE id=?').run(JSON.stringify(messages), session.id);
  const response = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'retain-history', expectedVersion: session.version, draft: { brief: 'Keep this conversation' } });
  expect(response.status).toBe(200); const data = (await response.json() as any).data;
  expect(data.messages).toHaveLength(105); expect(data.messages[0].content).toBe('Message 0');
});

test('failure cleanup quarantines an in-flight dispatch even when it clears the request lock', async () => {
  let session = await ready(); await emailProvider();
  session = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session, 'cleanup'))).json() as any).data;
  const operations = session.operations.map((op: any) => ({ ...op, status: 'dispatching' }));
  sqlite.prepare('UPDATE edm_assistant_sessions SET operations=?,pending_request_id=?,pending_since=? WHERE id=?').run(JSON.stringify(operations), 'cleanup', Date.now(), session.id);
  const { failRequest, sessionRow } = await import('../../src/outreach/server/lib/assistant');
  const row = await sessionRow(env.DB, { id: 'w1', actorId: 'member', name: 'Member', email: 'member@example.com', role: 'member' }, session.id);
  await failRequest(env.DB, row, 'cleanup');
  session = (await (await request('/' + session.id)).json() as any).data;
  expect(session.status).toBe('needs_attention'); expect(session.operations[0]).toMatchObject({ status: 'uncertain', retryable: false });
  expect(emailQueue).toHaveLength(1);
});

test('a conversation near the row limit rejects growth and keeps its previous content', async () => {
  const session = await create();
  const messages = Array.from({ length: 300 }, (_, index) => ({ id: String(index), role: 'user', content: 'x'.repeat(6000), createdAt: '2026-10-03' }));
  sqlite.prepare('UPDATE edm_assistant_sessions SET messages=? WHERE id=?').run(JSON.stringify(messages), session.id);
  const response = await request('/' + session.id + '/draft', 'PATCH', { requestId: 'too-long', expectedVersion: session.version, draft: { brief: 'New draft content' } });
  expect(response.status).toBe(400); expect((await response.json() as any).code).toBe('session_full');
  const restored = (await (await request('/' + session.id)).json() as any).data;
  expect(restored.messages).toEqual(messages); expect(restored.draft.brief).toBe(session.draft.brief); expect(restored.version).toBe(session.version);
});
afterEach(() => { sqlite.close(); vi.unstubAllGlobals(); });

test('creates a restorable actor-owned conversation without sending or creating a campaign', async () => {
  const response = await request('', 'POST', { requestId: 'new-session', channels: ['email', 'site'] });
  expect(response.status).toBe(201);
  const { data } = await response.json() as any;
  expect(data.version).toBe(1);
  expect(data.draft.channels).toEqual(['email', 'site']);
  expect(data.missingFields.map((field: any) => field.key)).toContain('sender.email');
  expect((await request('/' + data.id)).status).toBe(200);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(0);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_site_message_jobs').get()!.n).toBe(0);
});
