import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { d1 } from './sqlite';
import { seal } from '../../src/outreach/server/lib/credentials';
import { claimAttempt, saveAttempt } from '../../src/outreach/server/lib/email-attempt';
import { handleEmailQueue, type EmailSendMessage } from '../../src/outreach/server/queues/email-send.queue';

vi.mock('../../src/outreach/server/lib/network', () => ({ publicFetch: (...args: any[]) => globalThis.fetch(args[0], args[1]) }));

let sqlite: DatabaseSync;
let env: any;
const body: EmailSendMessage = { recipientId: 'r', campaignId: 'c', providerId: 'p', toEmail: 'buyer@example.com', toName: 'Buyer',
  fromEmail: 'sender@example.com', fromName: 'Seller', replyTo: null, subject: 'A sample', bodyHtml: '<p>Hello</p>', bodyText: 'Hello', variables: {} };
const message = () => ({ body: { ...body }, ack: vi.fn(), retry: vi.fn() });
const saved = () => JSON.parse(String(sqlite.prepare("SELECT result FROM edm_email_send_attempts WHERE recipient_id='r'").get()!.result));

beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter(file => file.endsWith('.sql')).sort()) sqlite.exec(readFileSync(`migrations/${file}`, 'utf8'));
  env = { DB: d1(sqlite), CREDENTIAL_KEY: 'unit-test-key', BETTER_AUTH_SECRET: 'unit-test-secret', BETTER_AUTH_URL: 'https://example.com' };
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('u','User','user@example.com',0,0);
    INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','u','buyer@example.com',0,0);
    INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,created_at,updated_at)
      VALUES ('c','u','Campaign','sender@example.com','Seller','sending',0,0);
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,created_at) VALUES ('r','c','contact','sending',0);`);
  sqlite.prepare(`INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at)
    VALUES ('p','u','mailchimp','Transactional',?,1,0,0)`).run(await seal('test-provider-key', 'p', env));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); sqlite.close(); });

test.each([
  ['queued', 'hourly quota'], ['scheduled', 'scheduled delivery'], ['sent', undefined], ['unknown-accepted', undefined],
] as const)('Mailchimp %s receipt survives recipient persistence failure and replay without another send', async (providerStatus, queuedReason) => {
  const send = vi.fn(async () => Response.json([{ _id: 'provider-message', status: providerStatus, queued_reason: queuedReason }]));
  vi.stubGlobal('fetch', send);
  const database = d1(sqlite);
  let failRecipientReceipt = true;
  env.DB = { ...database, prepare(sql: string) {
    const statement = database.prepare(sql);
    if (!sql.startsWith('update "edm_campaign_recipients"') || !sql.includes('"ses_message_id"')) return statement;
    const wrap = (current: any): any => ({ ...current, bind: (...values: any[]) => wrap(current.bind(...values)), run: async () => {
      if (failRecipientReceipt) { failRecipientReceipt = false; throw new Error('Recipient receipt write interrupted'); }
      return current.run();
    } });
    return wrap(statement);
  } };
  const first = message();
  await handleEmailQueue({ messages: [first] }, env);
  expect(first.retry).toHaveBeenCalledWith({ delaySeconds: 60 });
  expect(first.ack).not.toHaveBeenCalled();
  const accepted = saved();
  expect(accepted).toMatchObject({ messageId: 'provider-message', providerStatus });
  if (queuedReason) expect(accepted.queuedReason).toBe(queuedReason);
  else expect(accepted.queuedReason).toBeUndefined();

  env.DB = database;
  const replay = message();
  await handleEmailQueue({ messages: [replay] }, env);
  expect(replay.ack).toHaveBeenCalledOnce();
  expect(replay.retry).not.toHaveBeenCalled();
  expect(send).toHaveBeenCalledOnce();
  expect(saved()).toEqual(accepted);
  expect(sqlite.prepare("SELECT status,ses_message_id FROM edm_campaign_recipients WHERE id='r'").get())
    .toEqual({ status: 'sent', ses_message_id: 'provider-message' });
});

test('saving an existing accepted receipt without new metadata preserves its provider status and reason', async () => {
  await claimAttempt(env.DB, 'r');
  await saveAttempt(env.DB, 'r', 'provider-message', { providerStatus: 'queued', queuedReason: 'hourly quota' });
  const original = saved();
  await saveAttempt(env.DB, 'r', 'provider-message');
  expect(saved()).toEqual(original);
});

test('a later provider state clears an obsolete queue reason while retaining the original acceptance time', async () => {
  await claimAttempt(env.DB, 'r');
  await saveAttempt(env.DB, 'r', 'provider-message', { providerStatus: 'queued', queuedReason: 'hourly quota' });
  const original = saved();
  await saveAttempt(env.DB, 'r', 'provider-message', { providerStatus: 'sent' });
  expect(saved()).toEqual({ messageId: 'provider-message', sentAt: original.sentAt, providerStatus: 'sent' });
});

test('legacy accepted receipts replay unchanged without inventing a provider queue status', async () => {
  const legacy = { messageId: 'legacy-message', sentAt: 1792743462000 };
  sqlite.prepare('INSERT INTO edm_email_send_attempts(recipient_id,started_at,result) VALUES (?,0,?)').run('r', JSON.stringify(legacy));
  const send = vi.fn(); vi.stubGlobal('fetch', send);
  const replay = message();
  await handleEmailQueue({ messages: [replay] }, env);
  expect(saved()).toEqual(legacy);
  expect(replay.ack).toHaveBeenCalledOnce();
  expect(send).not.toHaveBeenCalled();
});

test('an explicit rejected response does not create an accepted receipt', async () => {
  const send = vi.fn(async () => Response.json([{ _id: 'rejected-message', status: 'rejected', reject_reason: 'recipient-domain-mismatch' }]));
  vi.stubGlobal('fetch', send);
  const rejected = message();
  await handleEmailQueue({ messages: [rejected] }, env);
  expect(sqlite.prepare("SELECT result FROM edm_email_send_attempts WHERE recipient_id='r'").get()!.result).toBeNull();
  expect(sqlite.prepare("SELECT status,sent_at,ses_message_id FROM edm_campaign_recipients WHERE id='r'").get())
    .toEqual({ status: 'failed', sent_at: null, ses_message_id: null });
  expect(send).toHaveBeenCalledOnce();
});

test('reconciliation saves the provider queue state and reason without resending', async () => {
  sqlite.exec("INSERT INTO edm_email_send_attempts(recipient_id,started_at) VALUES ('r',0)");
  const search = vi.fn(async (url: unknown) => {
    expect(String(url)).toMatch(/\/messages\/search$/);
    return Response.json([{ _id: 'found-message', email: 'buyer@example.com', state: 'queued', queued_reason: 'hourly quota', ts: 1792743462 }]);
  });
  vi.stubGlobal('fetch', search);
  const recovered = message();
  await handleEmailQueue({ messages: [recovered], recovery: true }, env);
  expect(recovered.ack).toHaveBeenCalledOnce();
  expect(search).toHaveBeenCalledOnce();
  expect(saved()).toMatchObject({ messageId: 'found-message', providerStatus: 'queued', queuedReason: 'hourly quota' });
});
