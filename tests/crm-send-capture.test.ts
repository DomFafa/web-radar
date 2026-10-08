import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { d1 } from './outreach/sqlite';
import { seal } from '../src/outreach/server/lib/credentials';
import { captureOutbound, completeOutbound } from '../src/worker/crm/capture';
vi.mock('../src/outreach/server/lib/network', () => ({ publicFetch: (...args: any[]) => globalThis.fetch(args[0], args[1]) }));
import { handleEmailQueue, type EmailSendMessage } from '../src/outreach/server/queues/email-send.queue';
import { fillAndSubmit } from '../src/outreach/server/queues/site-message.queue';

let sqlite: DatabaseSync;
let env: any;
beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of ['0007_outreach.sql', '0008_resend_tracking.sql', '0009_email_scheduling.sql', '0011_customer_inbox.sql', '0013_customer_management.sql', '0014_crm_activity_groups.sql']) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  sqlite.exec('ALTER TABLE edm_campaigns ADD COLUMN created_by TEXT; ALTER TABLE edm_site_message_jobs ADD COLUMN created_by TEXT;');
  env = { DB: d1(sqlite), CREDENTIAL_KEY: 'test-key', BETTER_AUTH_SECRET: 'test-secret', BETTER_AUTH_URL: 'https://app.example.test' };
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('workspace','Test','test@example.com',0,0);
    INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at) VALUES ('provider','workspace','smtp','SMTP','placeholder',1,0,0);
    INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','workspace','customer@example.com',0,0);
    INSERT INTO edm_campaigns(id,user_id,created_by,name,sender_email,sender_name,status,created_at,updated_at) VALUES ('campaign','workspace','employee','Confirmed mail','sales@example.com','Sender','sending',0,0);
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,created_at) VALUES ('recipient','campaign','contact','sending',0);`);
  sqlite.prepare('UPDATE edm_providers SET api_key=?,config=?').run(await seal('test-password', 'provider', env), await seal(JSON.stringify({ host: 'smtp-gateway.example.com', port: 443, username: 'test' }), 'provider:config', env));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); sqlite.close(); });

const queued = () => ({
  body: { recipientId: 'recipient', campaignId: 'campaign', providerId: 'provider', toEmail: 'customer@example.com', toName: 'Customer', fromEmail: 'sales@example.com', fromName: 'Sender', replyTo: null, subject: 'Hello {{name}}', bodyHtml: '<p>Hello {{name}}</p>', bodyText: 'Hello {{name}}', variables: { name: 'Customer' } } satisfies EmailSendMessage,
  ack: vi.fn(), retry: vi.fn(),
});
const snapshots = () => sqlite.prepare('SELECT * FROM wr_crm_outbound_snapshots ORDER BY created_at').all();

test('actual recipient and sender metadata survive subsequent contact edits without rewriting history', async () => {
  const message = queued();
  const request = vi.fn(async () => Response.json({ id: 'original-recipient-receipt' }));
  vi.stubGlobal('fetch', request);
  await handleEmailQueue({ messages: [message] }, env);
  sqlite.exec("UPDATE edm_contacts SET email='changed@example.com' WHERE id='contact'");
  expect(snapshots()[0]).toMatchObject({ recipient_email: 'customer@example.com', sender_email: 'sales@example.com', sender_name: 'Sender', reply_to: null });
  expect(request).toHaveBeenCalledTimes(1);
});

test('snapshot content is immutable and each genuine attempt has its own outcome', async () => {
  const input = { workspaceId: 'workspace', ownerId: 'employee', source: 'site' as const, businessId: 'job', targetId: 'target', attemptId: 'attempt-1', websiteUrl: 'https://customer.example/contact', subject: 'Inquiry', bodyText: 'Original message', provider: 'browser' };
  const id = await captureOutbound(env.DB, input);
  expect(await captureOutbound(env.DB, { ...input, bodyText: 'Later edited message' })).toBe(id);
  await completeOutbound(env.DB, id, { status: 'submitted_unconfirmed', errorMessage: 'No website acknowledgement' });
  await captureOutbound(env.DB, { ...input, attemptId: 'attempt-2', bodyText: 'Second attempt' });
  expect(snapshots()).toHaveLength(2);
  expect(snapshots()[0]).toMatchObject({ body_text: 'Original message', status: 'submitted_unconfirmed', owner_id: 'employee', contact_id: null, website_url: 'https://customer.example/contact' });
});

test('actual personalized SMTP HTML is durable before delivery and includes its final footer', async () => {
  let actual: any;
  const request = vi.fn(async (_url: any, init: any) => {
    actual = JSON.parse(init.body);
    expect(snapshots()).toHaveLength(1);
    expect(snapshots()[0]).toMatchObject({ workspace_id: 'workspace', owner_id: 'employee', contact_id: 'contact', subject: actual.subject, body_html: actual.html, body_text: '', status: 'prepared', provider: 'smtp' });
    return Response.json({ id: 'smtp-receipt' });
  });
  vi.stubGlobal('fetch', request);
  const message = queued();
  await handleEmailQueue({ messages: [message] }, env);
  await handleEmailQueue({ messages: [message] }, env);
  expect(actual.html).toContain('data-growthos-compliance-footer');
  expect(actual.html).toContain('Hello Customer');
  expect(snapshots()[0]).toMatchObject({ status: 'sent', provider_message_id: 'smtp-receipt', body_html: actual.html });
  expect(request).toHaveBeenCalledTimes(1);
});

test('a snapshot write failure prevents the provider side effect and remains safely retryable', async () => {
  sqlite.exec("CREATE TRIGGER fail_snapshot BEFORE INSERT ON wr_crm_outbound_snapshots BEGIN SELECT RAISE(ABORT,'snapshot unavailable'); END;");
  const request = vi.fn(); vi.stubGlobal('fetch', request);
  const message = queued(); await handleEmailQueue({ messages: [message] }, env);
  expect(request).not.toHaveBeenCalled();
  expect(message.retry).toHaveBeenCalledWith({ delaySeconds: 60 });
  expect(sqlite.prepare('SELECT count(*) n FROM edm_email_send_attempts').get()?.n).toBe(0);
  sqlite.exec('DROP TRIGGER fail_snapshot');
  // The real queue waits before retrying; release the existing dispatch reservation in this fixture.
  sqlite.exec('UPDATE edm_email_clocks SET next_at=0');
  request.mockResolvedValue(Response.json({ id: 'recovered' }));
  await handleEmailQueue({ messages: [message] }, env);
  expect(request).toHaveBeenCalledTimes(1);
  expect(snapshots()[0]).toMatchObject({ status: 'sent', provider_message_id: 'recovered' });
});

test('a failed CRM receipt write cannot resend a provider-confirmed message', async () => {
  sqlite.exec("CREATE TRIGGER fail_receipt BEFORE UPDATE ON wr_crm_outbound_snapshots BEGIN SELECT RAISE(ABORT,'receipt unavailable'); END;");
  const request = vi.fn(async () => Response.json({ id: 'accepted' })); vi.stubGlobal('fetch', request);
  const message = queued(); await handleEmailQueue({ messages: [message] }, env);
  await handleEmailQueue({ messages: [message] }, env);
  expect(request).toHaveBeenCalledTimes(1);
  expect(sqlite.prepare('SELECT status,ses_message_id FROM edm_campaign_recipients').get()).toMatchObject({ status: 'sent', ses_message_id: 'accepted' });
});

test('an interrupted provider request records uncertain outcome and never submits again automatically', async () => {
  const request = vi.fn(async () => { throw new Error('Request interrupted'); }); vi.stubGlobal('fetch', request);
  const message = queued(); await handleEmailQueue({ messages: [message] }, env);
  expect(snapshots()[0]).toMatchObject({ status: 'uncertain', error_message: 'Request interrupted' });
  sqlite.exec('UPDATE edm_email_send_attempts SET started_at=0');
  await handleEmailQueue({ messages: [message] }, env);
  expect(request).toHaveBeenCalledTimes(1);
});

test('a confirmed CRM receipt recovers an interrupted business-status write without another send', async () => {
  sqlite.exec("CREATE TRIGGER fail_attempt_result BEFORE UPDATE ON edm_email_send_attempts BEGIN SELECT RAISE(ABORT,'attempt storage unavailable'); END;");
  const request = vi.fn(async () => Response.json({ id: 'accepted-once' })); vi.stubGlobal('fetch', request);
  const message = queued(); await handleEmailQueue({ messages: [message] }, env);
  expect(snapshots()[0]).toMatchObject({ status: 'sent', provider_message_id: 'accepted-once' });
  sqlite.exec('DROP TRIGGER fail_attempt_result');
  await handleEmailQueue({ messages: [message] }, env);
  expect(request).toHaveBeenCalledTimes(1);
  expect(sqlite.prepare('SELECT status,ses_message_id FROM edm_campaign_recipients').get()).toMatchObject({ status: 'sent', ses_message_id: 'accepted-once' });
});

test('Mailchimp snapshot contains the exact submitted tracking URLs and pixel', async () => {
  sqlite.prepare("UPDATE edm_providers SET provider='mailchimp',api_key=?,config=?").run(await seal('mandrill-test-key', 'provider', env), await seal(JSON.stringify({ apiType: 'transactional' }), 'provider:config', env));
  const request = vi.fn(async (_url: any, init: any) => {
    const payload = JSON.parse(init.body).message;
    expect(snapshots()[0]).toMatchObject({ subject: payload.subject, body_html: payload.html, body_text: payload.text, provider: 'mailchimp' });
    expect(payload.html).toContain('/api/outreach/tracking/open?token=');
    return Response.json([{ _id: 'mandrill-receipt', status: 'sent' }]);
  });
  vi.stubGlobal('fetch', request);
  await handleEmailQueue({ messages: [queued()] }, env);
  expect(snapshots()[0]).toMatchObject({ status: 'sent', provider_message_id: 'mandrill-receipt' });
});

test.each(['amazon_ses', 'sendgrid', 'mailgun', 'brevo', 'resend'])('%s snapshot equals its actual personalized provider payload', async provider => {
  sqlite.prepare('UPDATE edm_providers SET provider=?,api_key=?,config=?').run(provider, await seal('test-api-key', 'provider', env), await seal(JSON.stringify({ secretKey: 'ses-secret', domain: 'mail.example.test' }), 'provider:config', env));
  const request = vi.fn(async (_url: any, init: any) => {
    let content: { subject: string; html: string; text: string };
    if (provider === 'mailgun') {
      content = { subject: init.body.get('subject'), html: init.body.get('html'), text: init.body.get('text') };
    } else {
      const body = JSON.parse(init.body);
      if (provider === 'amazon_ses') content = { subject: body.Content.Simple.Subject.Data, html: body.Content.Simple.Body.Html.Data, text: body.Content.Simple.Body.Text.Data };
      else if (provider === 'sendgrid') content = { subject: body.personalizations[0].subject, html: body.content.find((item: any) => item.type === 'text/html').value, text: body.content.find((item: any) => item.type === 'text/plain').value };
      else if (provider === 'brevo') content = { subject: body.subject, html: body.htmlContent, text: body.textContent };
      else content = body;
    }
    expect(content.subject).toBe('Hello Customer');
    expect(content.html).toContain('data-growthos-compliance-footer');
    expect(snapshots()[0]).toMatchObject({ subject: content.subject, body_html: content.html, body_text: content.text, provider, status: 'prepared' });
    return Response.json({ id: 'provider-receipt', MessageId: 'provider-receipt', messageId: 'provider-receipt' }, { headers: { 'X-Message-Id': 'provider-receipt' } });
  });
  vi.stubGlobal('fetch', request);
  await handleEmailQueue({ messages: [queued()] }, env);
  expect(request).toHaveBeenCalledTimes(1);
  expect(snapshots()[0]).toMatchObject({ status: 'sent', provider_message_id: 'provider-receipt' });
});

test('an explicit rate rejection remains a separate failed attempt before a safe successful retry', async () => {
  sqlite.prepare("UPDATE edm_providers SET provider='resend',api_key=?").run(await seal('test-api-key', 'provider', env));
  const request = vi.fn().mockResolvedValueOnce(Response.json({ message: 'rate limited' }, { status: 429 })).mockResolvedValueOnce(Response.json({ id: 'accepted-retry' }));
  vi.stubGlobal('fetch', request);
  const message = queued(); await handleEmailQueue({ messages: [message] }, env);
  expect(snapshots()[0].status).toBe('failed');
  sqlite.exec('UPDATE edm_email_clocks SET next_at=0');
  await handleEmailQueue({ messages: [message] }, env);
  expect(request).toHaveBeenCalledTimes(2);
  expect(snapshots()).toHaveLength(2);
  expect(new Set(snapshots().map(item => item.attempt_id)).size).toBe(2);
  expect(snapshots().find(item => item.status === 'sent')?.provider_message_id).toBe('accepted-retry');
});

test('CRM does not present an internal fallback UUID as a provider receipt', async () => {
  sqlite.prepare("UPDATE edm_providers SET provider='amazon_ses',api_key=?,config=?").run(await seal('test-api-key', 'provider', env), await seal(JSON.stringify({ secretKey: 'ses-secret' }), 'provider:config', env));
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({})));
  await handleEmailQueue({ messages: [queued()] }, env);
  expect(snapshots()[0]).toMatchObject({ status: 'sent', provider_message_id: null });
  // Existing provider handling still records its internal acceptance identifier.
  expect(sqlite.prepare('SELECT status,ses_message_id FROM edm_campaign_recipients').get()?.status).toBe('sent');
});

function contactForm(captcha = false) {
  const click = vi.fn();
  const controls = new Map<string, any>();
  const fields = [
    { index: 0, kind: 'email' as const, tag: 'input', type: 'email', label: 'Email', required: true },
    { index: 1, kind: 'subject' as const, tag: 'input', type: 'text', label: 'Subject', required: true },
    { index: 2, kind: 'message' as const, tag: 'textarea', type: 'text', label: 'Message', required: true },
  ];
  for (const field of fields) controls.set(`[data-growthos-field="0-${field.index}"]`, { value: '', dispatchEvent() {} });
  controls.set('[data-growthos-submit="0"]', { scrollIntoView() {}, click });
  vi.stubGlobal('document', {
    body: { get innerText() { return click.mock.calls.length ? 'Thank you, your message has been sent.' : 'Contact'; } },
    querySelector: (selector: string) => controls.get(selector) || (captcha && selector.includes('captcha') ? {} : null),
    querySelectorAll: () => [],
  });
  const page = { isClosed: () => false, url: () => 'https://customer.example/contact',
    evaluate: async (fn: any, ...args: any[]) => fn(...args), waitForNavigation: async () => null };
  return { page, form: { fields, formIndex: 0 }, click, controls };
}

test('site capture uses the actual filled subject/message and explicit URL before the submit click', async () => {
  const { page, form, click, controls } = contactForm();
  const job = { senderName: 'Employee', senderEmail: 'employee@example.com', subject: 'Product inquiry', message: 'Please send your catalog' };
  click.mockImplementation(() => expect(snapshots()[0]).toMatchObject({ body_text: 'Please send your catalog', contact_id: null, website_url: 'https://customer.example/contact', status: 'prepared' }));
  const result = await fillAndSubmit(page, form, job, undefined, async content => {
    expect(controls.get('[data-growthos-field="0-0"]').value).toBe('employee@example.com');
    await captureOutbound(env.DB, { workspaceId: 'workspace', ownerId: 'employee', source: 'site', businessId: 'job', targetId: 'site-target', attemptId: 'submission', websiteUrl: 'https://customer.example/contact', ...content, provider: 'browser' });
  });
  expect(click).toHaveBeenCalledTimes(1);
  expect(result.code).toBe('confirmed');
  expect(snapshots()[0].subject).toBe('Product inquiry');
});

test('site capture failure stops submission; a captcha skip is not a fabricated outgoing message', async () => {
  const job = { senderEmail: 'employee@example.com', subject: 'Inquiry', message: 'Please reply' };
  const first = contactForm();
  await expect(fillAndSubmit(first.page, first.form, job, undefined, async () => { throw new Error('Storage unavailable'); })).rejects.toThrow('Storage unavailable');
  expect(first.click).not.toHaveBeenCalled();
  const second = contactForm(true); const capture = vi.fn();
  expect((await fillAndSubmit(second.page, second.form, job, undefined, capture)).code).toBe('captcha_detected');
  expect(second.click).not.toHaveBeenCalled(); expect(capture).not.toHaveBeenCalled();
});
