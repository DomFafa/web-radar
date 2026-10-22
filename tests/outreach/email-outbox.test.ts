import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { d1 } from './sqlite';
import { hydrateEmailQueue, publishEmailOutbox } from '../../src/outreach/server/lib/email-outbox';
import { handleEmailQueue } from '../../src/outreach/server/queues/email-send.queue';

let sqlite: DatabaseSync;
let env: any;
const objects = new Map<string, string>();

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
  for (const file of ['0007_outreach.sql', '0012_outreach_assistant.sql', '0015_email_outbox.sql']) {
    sqlite.exec(readFileSync(`migrations/${file}`, 'utf8'));
  }
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('u','Test','u@example.com',0,0);
    INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','u','customer@example.com',0,0);
    INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,created_at,updated_at)
    VALUES ('c','u','Campaign','sender@example.com','Sender','sending',0,0);`);
  objects.clear();
  env = { DB: d1(sqlite), STORAGE: { get: async (key: string) => objects.has(key)
    ? { json: async () => JSON.parse(objects.get(key)!) } : null } };
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
