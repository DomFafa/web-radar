import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { Hono } from 'hono';
import { d1 } from './sqlite';
import { seal } from '../../src/outreach/server/lib/credentials';
import { campaignRoutes } from '../../src/outreach/server/routes/campaign.routes';

vi.mock('../../src/outreach/server/lib/network', () => ({ publicFetch: (...args: any[]) => globalThis.fetch(args[0], args[1]) }));
let sqlite: DatabaseSync, env: any;
const app = () => { const result = new Hono<any>(); result.use('*', async (c, next) => { c.set('user', { id: 'u', role: 'admin', teamRead: true }); await next(); }); result.route('/campaigns', campaignRoutes); return result; };
const campaign = () => sqlite.prepare("SELECT * FROM edm_campaigns WHERE id='c'").get()!;
const recipient = () => sqlite.prepare("SELECT * FROM edm_campaign_recipients WHERE id='r'").get()!;
const attempt = () => JSON.parse(String(sqlite.prepare("SELECT result FROM edm_email_send_attempts WHERE recipient_id='r'").get()!.result));

beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of ['0007_outreach.sql', '0008_resend_tracking.sql', '0009_email_scheduling.sql', '0011_customer_inbox.sql', '0012_outreach_assistant.sql', '0013_customer_management.sql', '0014_crm_activity_groups.sql', '0015_email_outbox.sql', '0016_email_snapshot_cleanup.sql', '0018_campaign_review.sql']) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  sqlite.exec('ALTER TABLE edm_campaigns ADD COLUMN created_by TEXT');
  env = { DB: d1(sqlite), CREDENTIAL_KEY: 'test-key' };
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('u','User','user@example.com',0,0);
    INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','u','person@example.com',0,0);
    INSERT INTO edm_providers(id,user_id,provider,name,api_key,config,is_default,created_at,updated_at) VALUES
      ('frozen','u','mailchimp','Original','unused','{}',0,0,0),('current','u','mailchimp','New default','unused','{}',1,0,0);
    INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,total_recipients,total_sent,created_at,updated_at) VALUES ('c','u','Campaign','sales@example.com','Sender','completed',1,1,0,0);
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,ses_message_id,sent_at,created_at) VALUES ('r','c','contact','sent','message-1',1,0);
    INSERT INTO edm_email_outbox(recipient_id,campaign_id,snapshot_key,provider_id,to_email,from_email,from_name,variables,created_at) VALUES ('r','c','snapshot','frozen','person@example.com','sales@example.com','Sender','{}',0);`);
  sqlite.prepare('INSERT INTO edm_email_send_attempts(recipient_id,started_at,result) VALUES (?,?,?)').run('r', 1000, JSON.stringify({ messageId: 'message-1', sentAt: 1000, retained: 'evidence' }));
  for (const id of ['frozen', 'current']) sqlite.prepare('UPDATE edm_providers SET api_key=?,config=? WHERE id=?').run(await seal(id + '-key', id, env), await seal(JSON.stringify({ apiType: 'transactional' }), id + ':config', env), id);
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network call'); }));
});
afterEach(() => { vi.unstubAllGlobals(); sqlite.close(); });

test('local recipient, progress and CSV reads expose known provider queue metadata without claiming delivery', async () => {
  sqlite.prepare("UPDATE edm_email_send_attempts SET result=json_set(result,'$.providerStatus','queued','$.queuedReason','hourly_quota') WHERE recipient_id='r'").run();
  const rows = await (await app().request('/campaigns/c/recipients', {}, env)).json() as any;
  expect(rows.data[0]).toMatchObject({ status: 'sent', sesMessageId: 'message-1', providerStatus: 'queued', queuedReason: 'hourly_quota', deliveredAt: null });
  for (const path of ['/campaigns/c', '/campaigns']) {
    const body = await (await app().request(path, {}, env)).json() as any;
    const data = Array.isArray(body.data) ? body.data[0] : body.data;
    expect(data).toMatchObject({ totalSent: 1, totalDelivered: 0, progress: { processed: 1, providerQueued: 1 } });
  }
  const csv = await (await app().request('/campaigns/c/export', {}, env)).text();
  expect(csv).toContain('服务商排队中'); expect(csv).toContain('hourly_quota'); expect(csv).toContain('尚未发出'); expect(csv).not.toContain('发送成功');
  expect(fetch).not.toHaveBeenCalled();
});

test('missing or malformed historical metadata remains accepted with unknown delivery', async () => {
  sqlite.prepare("UPDATE edm_email_send_attempts SET result='legacy-message-id' WHERE recipient_id='r'").run();
  const response = await app().request('/campaigns/c/recipients', {}, env);
  expect(response.status).toBe(200);
  const body = await response.json() as any;
  expect(body.data[0]).toMatchObject({ status: 'sent', providerStatus: null, queuedReason: null });
  const csv = await (await app().request('/campaigns/c/export', {}, env)).text();
  expect(csv).toContain('已受理'); expect(csv).toContain('送达待确认'); expect(csv).not.toContain('服务商排队中');
});

test.each(['queued', 'scheduled'])('manual sync reads the frozen provider and persists %s without changing accepted counts', async (state) => {
  const request = vi.fn(async (_url: any, init: any) => {
    expect(JSON.parse(init.body)).toEqual({ key: 'frozen-key', id: 'message-1' });
    return Response.json({ _id: 'message-1', state, queued_reason: 'hourly_quota', opens: 0, clicks: 0 });
  });
  vi.stubGlobal('fetch', request);
  expect((await app().request('/campaigns/c?sync=1', {}, env)).status).toBe(200);
  expect(request).toHaveBeenCalledTimes(1);
  expect(recipient()).toMatchObject({ status: 'sent', sent_at: 1, delivered_at: null });
  expect(campaign()).toMatchObject({ total_sent: 1, total_delivered: 0 });
  expect(attempt()).toMatchObject({ messageId: 'message-1', sentAt: 1000, providerStatus: state, queuedReason: 'hourly_quota', retained: 'evidence' });
});

test('provider sent without a delivery receipt remains accepted; partial sync preserves prior totals and delivery evidence', async () => {
  sqlite.exec(`INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('other','u','other@example.com',0,0);
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,ses_message_id,sent_at,delivered_at,created_at) VALUES ('r2','c','other','delivered','message-2',1,2,0);
    UPDATE edm_campaigns SET total_recipients=2,total_sent=2,total_delivered=1 WHERE id='c';`);
  vi.stubGlobal('fetch', vi.fn(async (_url: any, init: any) => JSON.parse(init.body).id === 'message-1'
    ? Response.json({ _id: 'message-1', state: 'sent', opens: 0, clicks: 0, smtp_events: [] })
    : Response.json({ name: 'Unknown_Message' }, { status: 404 })));
  expect((await app().request('/campaigns/c?sync=1', {}, env)).status).toBe(200);
  expect(recipient()).toMatchObject({ status: 'sent', delivered_at: null });
  expect(campaign()).toMatchObject({ total_sent: 2, total_delivered: 1 });
  expect(attempt()).toMatchObject({ providerStatus: 'sent' });
});

test('a recipient-server SMTP acceptance event establishes delivery', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ _id: 'message-1', state: 'sent', opens: 0, clicks: 0,
    smtp_events: [{ type: 'sent', destination_ip: '203.0.113.8', diag: '250 2.0.0 Accepted' }] })));
  expect((await app().request('/campaigns/c?sync=1', {}, env)).status).toBe(200);
  expect(recipient().status).toBe('delivered'); expect(recipient().delivered_at).not.toBeNull();
  expect(campaign()).toMatchObject({ total_sent: 1, total_delivered: 1 });
});

test.each([
  { type: 'sent', destination_ip: '', diag: '250 internal processing' },
  { type: 'sent', destination_ip: '203.0.113.8', diag: '450 4.2.0 Temporarily deferred' },
  { type: 'bounced', destination_ip: '203.0.113.8', diag: '550 5.1.1 Unknown recipient' },
  { type: 'sent', destination_ip: '203.0.113.8' },
])('internal, deferred, bounced or missing SMTP diagnostics do not establish delivery: %j', async event => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ _id: 'message-1', state: 'sent', opens: 0, clicks: 0, smtp_events: [event] })));
  expect((await app().request('/campaigns/c?sync=1', {}, env)).status).toBe(200);
  expect(recipient()).toMatchObject({ status: 'sent', delivered_at: null });
  expect(campaign()).toMatchObject({ total_sent: 1, total_delivered: 0 });
});
