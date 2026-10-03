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
const confirmation = (session: any, requestId: string = crypto.randomUUID()) => ({ requestId, expectedVersion: session.version, confirmationToken: session.confirmationToken, siteAuthorized: true });

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
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'add-site', expectedVersion: session.version, draft: { channels: ['email', 'site'] } })).json() as any).data;
  expect(session.pendingChannels).toEqual(['site']);
  session = (await (await request('/' + session.id + '/confirm', 'POST', confirmation(session))).json() as any).data;
  expect(session.operations[0].taskId).toBe(emailTask); expect(emailQueue).toHaveLength(1); expect(siteQueue).toHaveLength(1);
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

test('a large recipient snapshot stays below D1 row limits and queues every approved recipient once', async () => {
  let session = await ready(); await emailProvider();
  sqlite.exec('BEGIN');
  const insert = sqlite.prepare("INSERT INTO edm_contacts(id,user_id,email,name,company,industry,created_at,updated_at) VALUES(?,?,?,?,?,?,0,0)");
  for (let index = 0; index < 15000; index++) insert.run('bulk-' + index, 'w1', 'buyer-' + index + '@example.com', 'Customer '.repeat(12), 'Company '.repeat(20), 'Industry '.repeat(12));
  sqlite.exec("DELETE FROM edm_contacts WHERE id='contact'; COMMIT");
  session = (await (await request('/' + session.id + '/draft', 'PATCH', { requestId: 'all', expectedVersion: session.version, draft: { email: { groupId: 'null', tag: '', contactIds: [] } } })).json() as any).data;
  expect(session.preview.email.count).toBe(15000);
  const response = await request('/' + session.id + '/confirm', 'POST', confirmation(session)); expect(response.status).toBe(200);
  expect(emailQueue).toHaveLength(15000);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_assistant_recipients').get()!.n).toBe(15000);
  const saved = sqlite.prepare('SELECT max(length(snapshot)) n FROM edm_assistant_snapshots').get()!;
  expect(Number(saved.n)).toBeLessThan(2000000);
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
