import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { Hono } from 'hono';
import { d1 } from './sqlite';
import { cleanupEmailSnapshots, deleteCampaignWithSnapshots, hydrateEmailQueue, publishEmailOutbox } from '../../src/outreach/server/lib/email-outbox';
import { handleEmailQueue } from '../../src/outreach/server/queues/email-send.queue';
import { campaignRoutes } from '../../src/outreach/server/routes/campaign.routes';
import { seal } from '../../src/outreach/server/lib/credentials';
import { addCampaignRecipients } from '../../src/outreach/server/lib/campaign-recipient-batch';

let sqlite: DatabaseSync;
let env: any;
const objects = new Map<string, string>();

function campaignApp() {
  const app = new Hono<any>();
  app.use('*', async (c, next) => { c.set('user', { id: 'u', role: 'admin', teamRead: true }); await next(); });
  app.route('/campaigns', campaignRoutes);
  return app;
}

async function draftCampaign(count: number, body: string) {
  sqlite.prepare(`INSERT INTO edm_templates(id,user_id,name,subject,body_html,created_at,updated_at)
    VALUES ('t','u','Template','Approved subject',?,0,0)`).run(body);
  sqlite.prepare("UPDATE edm_campaigns SET status='draft',template_id='t',total_recipients=? WHERE id='c'").run(count);
  env.CREDENTIAL_KEY = 'unit-test-key';
  sqlite.prepare(`INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at)
    VALUES ('p','u','sendgrid','Test',?,1,0,0)`).run(await seal('test-only-provider-key', 'p', env));
  for (let i = 0; i < count; i++) {
    sqlite.prepare(`INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES (?,'u',?,0,0)`)
      .run(`customer-${i}`, `buyer-${i}@example.com`);
    sqlite.prepare(`INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,created_at) VALUES (?,'c',?,'queued',0)`)
      .run(`r${i}`, `customer-${i}`);
  }
}

function seed(count: number, body: string) {
  const key = `outreach/email-snapshots/c/frozen.json`;
  objects.set(key, JSON.stringify({ campaignId: 'c', subject: 'Large send', bodyHtml: body, bodyText: null }));
  const insert = sqlite.prepare(`INSERT INTO edm_email_outbox
    (recipient_id,campaign_id,snapshot_key,provider_id,to_email,from_email,from_name,variables,created_at)
    VALUES (?, 'c', ?, 'p', ?, 'sender@example.com', 'Sender', '{}', 0)`);
  const recipient = sqlite.prepare(`INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,created_at)
    VALUES (?, 'c', 'contact', 'sending', 0)`);
  for (let i = 0; i < count; i++) {
    const id = `r${i}`;
    recipient.run(id);
    insert.run(id, key, `customer${i}@example.com`);
  }
}

beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter(file => file.endsWith('.sql')).sort()) {
    sqlite.exec(readFileSync(`migrations/${file}`, 'utf8'));
  }
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('u','Test','u@example.com',0,0);
    INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','u','customer@example.com',0,0);
    INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,created_at,updated_at)
    VALUES ('c','u','Campaign','sender@example.com','Sender','sending',0,0);`);
  objects.clear();
  env = { DB: d1(sqlite), STORAGE: {
    get: async (key: string) => objects.has(key) ? { json: async () => JSON.parse(objects.get(key)!) } : null,
    put: async (key: string, value: string) => { objects.set(key, value); },
    delete: async (key: string) => { objects.delete(key); },
  } };
});
afterEach(() => { vi.restoreAllMocks(); sqlite.close(); });

test('99 recipients share one 512 KiB snapshot while Queue batches remain small', async () => {
  seed(99, `<p>${'A'.repeat(512 * 1024)}</p>`);
  const sendBatch = vi.fn(async (_messages: any[]) => undefined);
  env.EMAIL_QUEUE = { sendBatch };
  expect(await publishEmailOutbox(env, 10, 'c')).toBe(99);
  expect(sendBatch).toHaveBeenCalledTimes(1);
  const refs = sendBatch.mock.calls[0][0];
  expect(refs).toHaveLength(99);
  expect(new TextEncoder().encode(JSON.stringify(refs)).length).toBeLessThan(256 * 1024);
  expect(refs[0].body).toEqual({ kind: 'email-job', campaignId: 'c', recipientId: 'r0' });
  const message = await hydrateEmailQueue(env, refs[0].body);
  expect(message?.bodyHtml.length).toBeGreaterThan(512 * 1024);
  expect(message?.toEmail).toBe('customer0@example.com');
  expect(sqlite.prepare('SELECT count(*) as n FROM edm_email_outbox WHERE published_at IS NOT NULL').get()!.n).toBe(99);
});

test('five 58925-byte emails queue small references and retain the frozen approved content', async () => {
  const html = `<p>${'A'.repeat(58918)}</p>`;
  expect(new TextEncoder().encode(html).byteLength).toBe(58925);
  await draftCampaign(5, html);
  const sendBatch = vi.fn(async (_messages: any[]) => undefined);
  env.EMAIL_QUEUE = { sendBatch };

  const response = await campaignApp().request('/campaigns/c/send', { method: 'POST' }, env);
  expect(response.status).toBe(200);
  expect((await response.json() as any).data).toMatchObject({ status: 'sending', recipientsQueued: 5, publicationPending: false });
  expect(sendBatch).toHaveBeenCalledTimes(1);
  const messages = sendBatch.mock.calls[0][0];
  expect(messages).toHaveLength(5);
  expect(new TextEncoder().encode(JSON.stringify(messages)).byteLength).toBeLessThan(2000);
  expect(objects.size).toBe(1);
  sqlite.exec("UPDATE edm_templates SET subject='Edited',body_html='<p>Edited</p>' WHERE id='t'; UPDATE edm_contacts SET email='edited@example.com'");
  for (const message of messages) {
    expect(message.body).toEqual({ kind: 'email-job', campaignId: 'c', recipientId: expect.stringMatching(/^r[0-4]$/) });
    const hydrated = await hydrateEmailQueue(env, message.body);
    expect(hydrated).toMatchObject({ subject: 'Approved subject', bodyHtml: html,
      toEmail: `buyer-${message.body.recipientId.slice(1)}@example.com` });
  }
});

test.each([
  ['POST', '/campaigns/c/send', undefined, 409],
  ['PUT', '/campaigns/c', { name: 'Changed' }, 400],
  ['DELETE', '/campaigns/c', undefined, 400],
  ['POST', '/campaigns/c/recipients', { contactIds: ['contact'] }, 400],
  ['DELETE', '/campaigns/c/recipients/customer-0', undefined, 400],
] as const)('needs-review campaign rejects %s %s without losing its original evidence', async (method, path, body, status) => {
  await draftCampaign(1, '<p>Approved</p>');
  sqlite.exec("UPDATE edm_campaigns SET status='needs_review' WHERE id='c'");
  const sendBatch = vi.fn(); env.EMAIL_QUEUE = { sendBatch };
  const response = await campaignApp().request(path, {
    method, ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  }, env);
  expect(response.status).toBe(status);
  expect(sqlite.prepare("SELECT status,name,total_recipients FROM edm_campaigns WHERE id='c'").get())
    .toEqual({ status: 'needs_review', name: 'Campaign', total_recipients: 1 });
  expect(sqlite.prepare("SELECT id,status FROM edm_campaign_recipients WHERE campaign_id='c'").all()).toEqual([{ id: 'r0', status: 'queued' }]);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_email_outbox').get()!.n).toBe(0);
  expect(sendBatch).not.toHaveBeenCalled();
});

test('paused frozen campaign with an uncertain recipient cannot resume or republish', async () => {
  seed(1, '<p>Frozen</p>');
  sqlite.exec(`INSERT INTO edm_templates(id,user_id,name,subject,body_html,created_at,updated_at)
    VALUES ('t','u','Template','Hello','<p>Hello</p>',0,0);
    UPDATE edm_campaigns SET status='paused',template_id='t' WHERE id='c';
    UPDATE edm_campaign_recipients SET error_message='待核实：服务商结果未确认' WHERE id='r0';`);
  const sendBatch = vi.fn(); env.EMAIL_QUEUE = { sendBatch };
  const response = await campaignApp().request('/campaigns/c/send', { method: 'POST' }, env);
  expect(response.status).toBe(409);
  expect(sqlite.prepare("SELECT status FROM edm_campaigns WHERE id='c'").get()!.status).toBe('paused');
  expect(sqlite.prepare("SELECT published_at FROM edm_email_outbox WHERE recipient_id='r0'").get()!.published_at).toBeNull();
  expect(sendBatch).not.toHaveBeenCalled();
});

test('recipient storage rejects additions after a campaign enters needs-review', async () => {
  sqlite.exec("UPDATE edm_campaigns SET status='needs_review' WHERE id='c'");
  const result = await addCampaignRecipients(env.DB, 'c', 'u', [{ id: 'contact', name: null, company: null, industry: null }]);
  expect(result.added).toBe(0);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaign_recipients').get()!.n).toBe(0);
  expect(sqlite.prepare("SELECT status,total_recipients FROM edm_campaigns WHERE id='c'").get())
    .toEqual({ status: 'needs_review', total_recipients: 0 });
});

test('needs-review transition during snapshot upload prevents the send claim and all recipient writes', async () => {
  await draftCampaign(1, '<p>Approved</p>');
  env.STORAGE.put = async (key: string, value: string) => {
    objects.set(key, value);
    sqlite.exec("UPDATE edm_campaigns SET status='needs_review' WHERE id='c'");
  };
  const sendBatch = vi.fn(); env.EMAIL_QUEUE = { sendBatch };
  const response = await campaignApp().request('/campaigns/c/send', { method: 'POST' }, env);
  expect(response.status).toBe(409);
  expect(sqlite.prepare("SELECT status,started_at FROM edm_campaigns WHERE id='c'").get())
    .toEqual({ status: 'needs_review', started_at: null });
  expect(sqlite.prepare("SELECT status FROM edm_campaign_recipients WHERE id='r0'").get()!.status).toBe('queued');
  expect(sqlite.prepare('SELECT count(*) n FROM edm_email_outbox').get()!.n).toBe(0);
  expect(objects.size).toBe(0);
  expect(sendBatch).not.toHaveBeenCalled();
});

test('campaign deletion keeps a durable R2 cleanup key across storage failure', async () => {
  seed(2, '<p>Frozen campaign</p>');
  const key = 'outreach/email-snapshots/c/frozen.json';
  const remove = vi.fn()
    .mockRejectedValueOnce(new Error('R2 temporarily unavailable'))
    .mockImplementation(async (snapshotKey: string) => { objects.delete(snapshotKey); });
  env.STORAGE.delete = remove;

  await deleteCampaignWithSnapshots(env, 'c');
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(0);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_email_outbox').get()!.n).toBe(0);
  expect(sqlite.prepare('SELECT snapshot_key FROM edm_email_snapshot_cleanup').get()).toEqual({ snapshot_key: key });

  expect(await cleanupEmailSnapshots(env, 20, 'c')).toBe(0);
  expect(objects.has(key)).toBe(true);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_email_snapshot_cleanup').get()!.n).toBe(1);

  expect(await cleanupEmailSnapshots(env)).toBe(1);
  expect(objects.has(key)).toBe(false);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_email_snapshot_cleanup').get()!.n).toBe(0);
  expect(remove).toHaveBeenCalledTimes(2);
});

test('an uncertain Queue acceptance republishes only the original references after lease expiry', async () => {
  seed(3, `<p>${'A'.repeat(1024 * 1024)}</p>`);
  const failed = vi.fn(async (_messages: any[]) => { throw new Error('Queue connection lost'); });
  env.EMAIL_QUEUE = { sendBatch: failed };
  await expect(publishEmailOutbox(env, 1, 'c')).rejects.toThrow('Queue connection lost');
  expect(sqlite.prepare('SELECT count(*) as n FROM edm_email_outbox WHERE published_at IS NOT NULL').get()!.n).toBe(0);
  const prior = sqlite.prepare('SELECT publish_claimed_at FROM edm_email_outbox LIMIT 1').get()!.publish_claimed_at;
  expect(await publishEmailOutbox(env, 1, 'c')).toBe(0);
  sqlite.prepare('UPDATE edm_email_outbox SET publish_claimed_at=?').run(Number(prior) - 121000);
  const sent = vi.fn(async (_messages: any[]) => undefined);
  env.EMAIL_QUEUE = { sendBatch: sent };
  expect(await publishEmailOutbox(env, 1, 'c')).toBe(3);
  expect(sent.mock.calls[0][0][0].body).toEqual(failed.mock.calls[0][0][0].body);
});

test('missing frozen content quarantines the recipient without calling its provider', async () => {
  seed(1, '<p>Snapshot is deleted</p>');
  objects.clear();
  const providerSend = vi.fn();
  vi.stubGlobal('fetch', providerSend);
  const message = { body: { kind: 'email-job', campaignId: 'c', recipientId: 'r0' }, ack: vi.fn(), retry: vi.fn() };
  await handleEmailQueue({ messages: [message] } as any, env);
  expect(message.ack).toHaveBeenCalledOnce();
  expect(message.retry).not.toHaveBeenCalled();
  expect(providerSend).not.toHaveBeenCalled();
  expect(sqlite.prepare("SELECT status,error_message FROM edm_campaign_recipients WHERE id='r0'").get()).toMatchObject({
    status: 'failed', error_message: expect.stringContaining('待核实'),
  });
  expect(sqlite.prepare("SELECT status FROM edm_campaigns WHERE id='c'").get()!.status).toBe('needs_review');
  vi.unstubAllGlobals();
});

test('malformed immutable snapshot retries on primary queue and is quarantined on DLQ', async () => {
  seed(1, '<p>Frozen</p>');
  const key = 'outreach/email-snapshots/c/frozen.json';
  objects.set(key, '{malformed');
  const message = { body: { kind: 'email-job', campaignId: 'c', recipientId: 'r0' }, ack: vi.fn(), retry: vi.fn() };
  const providerSend = vi.fn();
  vi.stubGlobal('fetch', providerSend);

  await handleEmailQueue({ messages: [message] } as any, env);
  expect(message.retry).toHaveBeenCalledWith({ delaySeconds: 60 });
  expect(message.ack).not.toHaveBeenCalled();
  expect(sqlite.prepare("SELECT status FROM edm_campaign_recipients WHERE id='r0'").get()!.status).toBe('sending');

  message.retry.mockClear();
  await handleEmailQueue({ messages: [message], recovery: true } as any, env);
  expect(message.ack).toHaveBeenCalledOnce();
  expect(message.retry).not.toHaveBeenCalled();
  expect(providerSend).not.toHaveBeenCalled();
  expect(sqlite.prepare("SELECT status,error_message FROM edm_campaign_recipients WHERE id='r0'").get()).toMatchObject({
    status: 'failed', error_message: expect.stringContaining('待核实'),
  });
  expect(sqlite.prepare("SELECT status FROM edm_campaigns WHERE id='c'").get()!.status).toBe('needs_review');
  vi.unstubAllGlobals();
});
