import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { d1 } from './sqlite';
import { seal } from '../../src/outreach/server/lib/credentials';
vi.mock('../../src/outreach/server/lib/network', () => ({ publicFetch: (...args: any[]) => globalThis.fetch(args[0], args[1]) }));
import { handleEmailQueue, type EmailSendMessage } from '../../src/outreach/server/queues/email-send.queue';

let sqlite: DatabaseSync;
let env: any;
beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of ['0007_outreach.sql', '0008_resend_tracking.sql', '0009_email_scheduling.sql', '0011_customer_inbox.sql', '0013_customer_management.sql', '0014_crm_activity_groups.sql']) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  sqlite.exec('ALTER TABLE edm_campaigns ADD COLUMN created_by TEXT; ALTER TABLE edm_site_message_jobs ADD COLUMN created_by TEXT;');
  env = { DB: d1(sqlite), CREDENTIAL_KEY: 'test-key', BETTER_AUTH_SECRET: 'test-secret', BETTER_AUTH_URL: 'https://app.example.test' };
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('workspace','Test','test@example.com',0,0);
    INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at) VALUES ('smtp','workspace','smtp','SMTP gateway','placeholder',1,0,0);
    INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','workspace','customer@example.com',0,0);
    INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,created_at,updated_at) VALUES ('campaign','workspace','Confirmed mail','sales@example.com','Sender','sending',0,0);
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,created_at) VALUES ('recipient','campaign','contact','sending',0);`);
  sqlite.prepare('UPDATE edm_providers SET api_key=?,config=?').run(await seal('unit-test-password', 'smtp', env), await seal(JSON.stringify({ host: 'smtp-gateway.example.com', port: 443, username: 'test' }), 'smtp:config', env));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); sqlite.close(); });

const message = () => ({
  body: { recipientId: 'recipient', campaignId: 'campaign', providerId: 'smtp', toEmail: 'customer@example.com', toName: 'Customer', fromEmail: 'sales@example.com', fromName: 'Sender', replyTo: null, subject: 'Hello {{name}}', bodyHtml: '<p>Hello {{name}}</p>', bodyText: null, variables: { name: 'Customer' } } satisfies EmailSendMessage,
  ack: vi.fn(), retry: vi.fn(),
});
const recipient = () => sqlite.prepare('SELECT status,ses_message_id,sent_at,error_message FROM edm_campaign_recipients').get();

test.each(['HTTP rejection', 'network failure', 'missing message id'])('SMTP does not invent delivery success after %s', async (failure) => {
  const request = vi.fn(async () => {
    if (failure === 'network failure') throw new Error('Connection interrupted');
    return failure === 'HTTP rejection' ? Response.json({ error: 'gateway unavailable' }, { status: 503 }) : Response.json({ accepted: true });
  });
  vi.stubGlobal('fetch', request);
  const queued = message();
  await handleEmailQueue({ messages: [queued] }, env);
  expect(recipient()).toMatchObject({ status: 'failed', ses_message_id: null, sent_at: null });
  expect(recipient()?.error_message).toContain('待核实');
  expect(sqlite.prepare('SELECT status,total_sent FROM edm_campaigns').get()).toMatchObject({ status: 'needs_review', total_sent: 0 });
  expect(sqlite.prepare('SELECT result FROM edm_email_send_attempts').get()?.result).toBeNull();
  expect(queued.retry).toHaveBeenCalledWith({ delaySeconds: 180 });
  // A queue redelivery must reconcile the durable attempt, never make another send request.
  sqlite.exec('UPDATE edm_email_send_attempts SET started_at=0');
  await handleEmailQueue({ messages: [queued] }, env);
  expect(request).toHaveBeenCalledTimes(1);
  expect(recipient()?.sent_at).toBeNull();
});

test('SMTP records the provider acknowledgement once and preserves the compliance footer', async () => {
  const request = vi.fn(async (_url: any, init: any) => {
    const body = JSON.parse(init.body);
    expect(body.subject).toBe('Hello Customer');
    expect(body.html).toContain('data-growthos-compliance-footer');
    return Response.json({ id: 'smtp-confirmed-message' });
  });
  vi.stubGlobal('fetch', request);
  const queued = message();
  await handleEmailQueue({ messages: [queued] }, env);
  await handleEmailQueue({ messages: [queued] }, env);
  expect(request).toHaveBeenCalledTimes(1);
  expect(recipient()).toMatchObject({ status: 'sent', ses_message_id: 'smtp-confirmed-message' });
  expect(sqlite.prepare('SELECT total_sent FROM edm_campaigns').get()?.total_sent).toBe(1);
  expect(queued.retry).not.toHaveBeenCalled();
});
