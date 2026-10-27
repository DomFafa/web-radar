import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { Hono } from 'hono';
import { d1 } from './sqlite';
import { seal } from '../../src/outreach/server/lib/credentials';
import {
  startCampaignReview,
  handleCampaignReview,
  getCampaignReview,
} from '../../src/outreach/server/lib/campaign-review';
import { campaignRoutes } from '../../src/outreach/server/routes/campaign.routes';
import { applyResendEvent } from '../../src/outreach/server/lib/resend';
vi.mock('../../src/outreach/server/lib/network', () => ({
  publicFetch: (...args: any[]) => globalThis.fetch(args[0], args[1]),
}));
let sqlite: DatabaseSync, env: any;
const recipient = () => sqlite.prepare("SELECT * FROM edm_campaign_recipients WHERE id='r'").get()!;
const campaign = () => sqlite.prepare("SELECT * FROM edm_campaigns WHERE id='c'").get()!;
const email = (id = 'e', tag = 'r') => ({
  id,
  from: 'Sender <sender@example.com>',
  to: ['buyer@example.com'],
  last_event: 'delivered',
  tags: [{ name: 'wr_recipient_id', value: tag }],
});
const app = (role = 'admin', id = 'u') => {
  const h = new Hono<any>();
  h.use('*', async (c, next) => {
    c.set('user', { id, role, teamRead: true });
    await next();
  });
  h.route('/campaigns', campaignRoutes);
  return h;
};
beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const f of readdirSync('migrations')
    .filter((f) => f.endsWith('.sql'))
    .sort())
    sqlite.exec(readFileSync('migrations/' + f, 'utf8'));
  env = { DB: d1(sqlite), CREDENTIAL_KEY: 'test', EMAIL_QUEUE: { send: vi.fn(async () => {}) } };
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('u','test','u@example.com',0,0);
 INSERT INTO edm_providers(id,user_id,provider,name,api_key,created_at,updated_at) VALUES ('p','u','resend','test','unused',0,0);
 INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','u','buyer@example.com',0,0);
 INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,created_at,updated_at) VALUES ('c','u','test','sender@example.com','Sender','needs_review',0,0);
 INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,error_message,created_at) VALUES ('r','c','contact','failed','待核实：timeout',0);
 INSERT INTO edm_email_send_attempts(recipient_id,started_at) VALUES ('r',1);
 INSERT INTO edm_resend_deliveries(recipient_id,provider_id,created_at) VALUES ('r','p',0);
 INSERT INTO edm_email_outbox(recipient_id,campaign_id,snapshot_key,provider_id,to_email,from_email,from_name,variables,created_at,published_at) VALUES ('r','c','snapshot','p','buyer@example.com','sender@example.com','Sender','{}',0,1);`);
  sqlite
    .prepare("UPDATE edm_providers SET api_key=? WHERE id='p'")
    .run(await seal('re_test', 'p', env));
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw Error('Unexpected fetch');
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  sqlite.close();
});
async function step(run: any) {
  sqlite.exec('DELETE FROM edm_email_clocks');
  return handleCampaignReview({ kind: 'campaign-review', campaignId: 'c', runId: run.run_id }, env);
}
test('durable pagination finds exact tag, restores receipt once and settles campaign without sending', async () => {
  const mock = vi.fn(async (url: any, init: any) => {
    expect(init.method || 'GET').toBe('GET');
    return Response.json(
      String(url).includes('/emails/e')
        ? email()
        : String(url).includes('after=older')
          ? { data: [email()], has_more: false }
          : {
              data: [{ id: 'older', from: 'other@example.com', to: ['else@example.com'] }],
              has_more: true,
            },
    );
  });
  vi.stubGlobal('fetch', mock);
  const run = await startCampaignReview(env, 'c');
  expect(await step(run)).toBe(1);
  expect(recipient().ses_message_id).toBeNull();
  expect(await step(run)).toBe(1);
  await step(run);
  await step(run);
  expect(recipient()).toMatchObject({
    ses_message_id: 'e',
    status: 'delivered',
    error_message: null,
  });
  expect(campaign()).toMatchObject({ status: 'completed', total_sent: 1, total_delivered: 1 });
  expect(await getCampaignReview(env.DB, 'c')).toMatchObject({
    status: 'completed',
    resolved: 1,
    remaining: 0,
  });
  expect(
    JSON.parse(String(sqlite.prepare('SELECT result FROM edm_email_send_attempts').get()!.result))
      .messageId,
  ).toBe('e');
  expect(env.EMAIL_QUEUE.send.mock.calls.every(([m]: any) => m.kind === 'campaign-review')).toBe(
    true,
  );
});
for (const mode of ['wrong-tag', 'wrong-address', 'ambiguous', 'empty'])
  test(`${mode} evidence never confirms or resends an uncertain email`, async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: any) =>
        Response.json(
          String(url).includes('?')
            ? {
                data:
                  mode === 'empty'
                    ? []
                    : mode === 'ambiguous'
                      ? [email('e1'), email('e2')]
                      : [email()],
                has_more: false,
              }
            : mode === 'wrong-tag'
              ? email('e', 'other')
              : mode === 'wrong-address'
                ? { ...email(), to: ['another@example.com'] }
                : email(String(url).split('/').pop()),
        ),
      ),
    );
    const run = await startCampaignReview(env, 'c');
    await step(run);
    await step(run);
    expect(recipient()).toMatchObject({ status: 'failed', sent_at: null, ses_message_id: null });
    expect(campaign().status).toBe('needs_review');
    expect(await getCampaignReview(env.DB, 'c')).toMatchObject({
      status: 'completed',
      remaining: 1,
      resolved: 0,
    });
    expect(sqlite.prepare('SELECT result FROM edm_email_send_attempts').get()!.result).toBeNull();
  });
test('rate limit retries, auth errors are visible and rerunnable', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({}, { status: 429, headers: { 'retry-after': '30' } })),
  );
  const run = await startCampaignReview(env, 'c');
  expect(await step(run)).toBe(30);
  expect((await getCampaignReview(env.DB, 'c')).status).toBe('running');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({}, { status: 403 })),
  );
  await step(run);
  expect((await getCampaignReview(env.DB, 'c')).status).toBe('failed');
  expect((await startCampaignReview(env, 'c')).run_id).not.toBe(run.run_id);
  expect(recipient().sent_at).toBeNull();
});
test('duplicate requests reuse run and active leases prevent competing lookups', async () => {
  const run = await startCampaignReview(env, 'c');
  expect((await startCampaignReview(env, 'c')).run_id).toBe(run.run_id);
  sqlite.prepare('UPDATE edm_campaign_reviews SET lease_until=?').run(Date.now() + 10000);
  expect(await step(run)).toBeGreaterThan(0);
  expect(fetch).not.toHaveBeenCalled();
});
test('API checks workspace, roles and status before enqueue; GET cannot mutate', async () => {
  expect(
    (await app('viewer').request('/campaigns/c/reconcile', { method: 'POST' }, env)).status,
  ).toBe(403);
  expect(
    (await app('admin', 'foreign').request('/campaigns/c/reconcile', { method: 'POST' }, env))
      .status,
  ).toBe(404);
  expect((await app().request('/campaigns/c/reconcile', {}, env)).status).toBe(200);
  expect(env.EMAIL_QUEUE.send).not.toHaveBeenCalled();
  expect((await app().request('/campaigns/c/reconcile', { method: 'POST' }, env)).status).toBe(200);
  sqlite.exec("UPDATE edm_campaigns SET status='paused'");
  expect((await app().request('/campaigns/c/reconcile', { method: 'POST' }, env)).status).toBe(409);
});
test('verified callback settles needs_review automatically but preserves paused campaigns', async () => {
  await applyResendEvent(env.DB, 'p', {
    type: 'email.delivered',
    data: { email_id: 'e', tags: { wr_recipient_id: 'r' } },
  });
  expect(campaign().status).toBe('completed');
  sqlite.exec("UPDATE edm_campaigns SET status='paused'");
  await applyResendEvent(env.DB, 'p', { type: 'email.clicked', data: { email_id: 'e' } });
  expect(campaign().status).toBe('paused');
});
