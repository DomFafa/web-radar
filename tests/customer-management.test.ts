import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { d1 } from './outreach/sqlite';
import crm from '../src/worker/crm/api';
vi.mock('../src/worker/auth', () => ({
  authenticate: async (req: Request) => {
    const userId = req.headers.get('X-Test-User') || 'admin';
    return { principal: { userId, workspaceId: userId === 'outsider' ? 'other' : 'w',
      systemRole: 'user', workspaceRole: userId === 'admin' ? 'admin' : 'member',
      appRole: ['admin', 'analyst', 'viewer'].includes(userId) ? userId : 'member' } };
  },
}));
let sqlite: DatabaseSync, env: any;
async function req(path: string, method = 'GET', body?: unknown, user = 'admin') {
  return crm.request('https://app.example' + path, { method,
    headers: { 'X-Test-User': user, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body), }, env);
}
beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  for (const f of readdirSync('migrations').filter(f => f.endsWith('.sql')).sort())
    sqlite.exec(readFileSync('migrations/' + f, 'utf8'));
  env = { DB: d1(sqlite) };
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES('w','Workspace','w@example.test',1,1),('other','Other','other@example.test',1,1);
    INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES('group','w','Buyers',1,1);
    INSERT INTO edm_contacts(id,user_id,email,name,company,group_id,created_at,updated_at) VALUES('contact','w','customer@client.example','Customer','Client','group',1,1),('foreign','other','outside@example.test','Outside','Foreign',NULL,1,1);
    INSERT INTO wr_members(workspace_id,user_id,email,display_name,created_at) VALUES('w','owner','owner@work.example','Owner','2026-10-08'),('w','member','member@work.example','Member','2026-10-08');
    INSERT INTO edm_campaigns(id,user_id,created_by,name,sender_email,sender_name,created_at,updated_at) VALUES('campaign','w','owner','Campaign','sales@example.com','Sales',1,1),('campaign2','w','owner','Second','sales@example.com','Sales',2,2),('campaign3','w','member','Member campaign','sales@example.com','Sales',3,3);
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,sent_at,created_at) VALUES('recipient','campaign','contact','sent',1,1),('recipient2','campaign2','contact','failed',NULL,2),('recipient3','campaign3','contact','sent',3,3);
    INSERT INTO edm_site_message_jobs(id,user_id,created_by,name,sender_name,sender_email,message,created_at,updated_at) VALUES('job','w','owner','Site job','Sales','sales@example.com','MUTABLE CURRENT FORM',1,1);
    INSERT INTO edm_site_message_targets(id,job_id,website_url,normalized_host,status,completed_at,created_at,updated_at) VALUES('target','job','https://client.example/','client.example','submitted',4,1,1);
    INSERT INTO wr_inbox_configs(id,workspace_id,domain,forward_to,secret,created_at) VALUES('cfg','w','reply.example.com','sales@example.com','secret','2026-10-08');
    INSERT INTO wr_inbox_routes(id,config_id,workspace_id,owner_id,source,business_id,target_id,address,original_email,subject,snapshot,created_at) VALUES('route','cfg','w','owner','edm','campaign','recipient','tracked@reply.example.com','customer@client.example','Original subject','Original partial body','2026-10-08');
    INSERT INTO wr_inbox_threads(id,workspace_id,config_id,route_id,owner_id,assignee_id,subject,last_received_at,created_at) VALUES('thread','w','cfg','route','owner','assigned','Reply','2026-10-08T12:00:00Z','2026-10-08T12:00:00Z');
    INSERT INTO wr_inbox_messages(id,workspace_id,config_id,thread_id,dedupe_key,sender,recipient,subject,text_body,raw_key,kind,received_at) VALUES('reply','w','cfg','thread','dedupe','customer@client.example','tracked@reply.example.com','Re: Original subject','CUSTOMER SECRET REPLY','raw','human','2026-10-08T12:00:00Z'),('auto','w','cfg','thread','dedupe2','customer@client.example','tracked@reply.example.com','Automatic','AUTO SECRET','raw2','automatic','2026-10-08T13:00:00Z');`);
});
afterEach(() => sqlite.close());
describe('customer management', () => {
  it('lists shared contacts and explicit site customers without using employee sender email', async () => {
    const response = await req('/customers'); expect(response.status).toBe(200);
    const body: any = await response.json(); expect(body.total).toBe(2);
    expect(body.customers.map((c: any) => c.key).sort()).toEqual(['contact:contact', 'site:https://client.example/']);
    expect(JSON.stringify(body)).not.toContain('sales@example.com');
    expect(body.customers.find((c: any) => c.key === 'contact:contact')).toMatchObject({ sent: 2, replied: 1, failed: 1 });
  });
  it('paginates records with exact totals and rejects invalid limits', async () => {
    const body: any = await (await req('/communications?page=2&pageSize=2')).json();
    expect(body.total).toBe(4); expect(body.records).toHaveLength(2); expect(body.page).toBe(2);
    expect((await req('/communications?pageSize=0')).status).toBe(400);
    expect((await req('/communications?pageSize=1001')).status).toBe(400);
  });
  it('isolates workspace and owner records while allowing explicitly assigned communication', async () => {
    const own: any = await (await req('/communications', 'GET', undefined, 'member')).json();
    expect(own.records.map((r: any) => r.targetId)).toEqual(['recipient3']);
    const assigned: any = await (await req('/communications', 'GET', undefined, 'assigned')).json();
    expect(assigned.records.map((r: any) => r.targetId)).toEqual(['recipient']);
    expect((await req('/communications/edm/recipient', 'GET', undefined, 'outsider')).status).toBe(404);
    expect((await req('/communications?workspaceId=other')).status).toBe(403);
  });
  it('redacts body for analysts, preserves legacy partial snapshot and never fabricates current form history', async () => {
    const analyst: any = await (await req('/communications/edm/recipient', 'GET', undefined, 'analyst')).json();
    expect(analyst.canBody).toBe(false); expect(analyst.record.bodyText).toBeNull();
    expect(JSON.stringify(analyst)).not.toContain('Original partial body');
    const legacy: any = await (await req('/communications/edm/recipient')).json();
    expect(legacy.record.captureStatus).toBe('legacy_partial'); expect(legacy.record.bodyText).toBe('Original partial body');
    const missing: any = await (await req('/communications/site/target')).json();
    expect(missing.record.captureStatus).toBe('unavailable'); expect(missing.record.bodyText).toBeNull();
    expect(JSON.stringify(missing)).not.toContain('MUTABLE CURRENT FORM');
  });
  it('shows cross-campaign timeline, notes, confirmed and automatic replies distinctly', async () => {
    const body: any = await (await req('/customers/' + encodeURIComponent('contact:contact'))).json();
    expect(body.timeline.filter((r: any) => r.direction === 'outbound')).toHaveLength(3);
    expect(body.timeline.filter((r: any) => r.direction === 'inbound').map((r: any) => r.kind).sort()).toEqual(['automatic', 'human']);
    expect(body.customer.replied).toBe(1);
  });
  it('counts distinct successfully contacted customers per employee rather than send attempts', async () => {
    const body: any = await (await req('/employees')).json();
    expect(body.employees.find((e: any) => e.userId === 'owner')).toMatchObject({ customers: 2, sent: 2, failed: 1, replied: 1 });
    const own: any = await (await req('/employees', 'GET', undefined, 'member')).json();
    expect(own.employees.map((e: any) => e.userId)).toEqual(['member']);
  });
  it('creates audited follow-up notes, completes them and refuses viewer writes', async () => {
    const path = '/customers/' + encodeURIComponent('contact:contact') + '/notes';
    expect((await req(path, 'POST', { content: 'Call tomorrow', followUpAt: '2026-10-09T09:00:00Z' }, 'viewer')).status).toBe(403);
    const saved: any = await (await req(path, 'POST', { content: 'Call tomorrow', followUpAt: '2026-10-09T09:00:00Z' }, 'owner')).json();
    expect(saved.note.content).toBe('Call tomorrow');
    expect((await req('/notes/' + saved.note.id, 'PUT', { status: 'done' }, 'owner')).status).toBe(200);
    expect(sqlite.prepare('SELECT action FROM wr_crm_audit ORDER BY created_at,id').all()).toHaveLength(2);
    expect((await req('/notes/' + saved.note.id, 'PUT', { status: 'pending' }, 'member')).status).toBe(404);
  });
  it('unifies site and EDM history only after explicit workspace-validated association', async () => {
    expect((await req('/site-link', 'PUT', { websiteUrl: 'https://client.example/', contactId: 'foreign' })).status).toBe(404);
    expect((await req('/site-link', 'PUT', { websiteUrl: 'https://client.example/', contactId: 'contact' }, 'member')).status).toBe(403);
    expect((await req('/site-link', 'PUT', { websiteUrl: 'https://client.example/', contactId: 'contact' })).status).toBe(200);
    const body: any = await (await req('/customers/' + encodeURIComponent('contact:contact'))).json();
    expect(body.timeline.filter((r: any) => r.source === 'site')).toHaveLength(1);
    expect((await (await req('/customers')).json() as any).total).toBe(1);
  });
  it('preserves captured content across edits, exposes attempts and applies body grants to timeline and detail', async () => {
    sqlite.exec(`INSERT INTO wr_crm_outbound_snapshots(id,workspace_id,owner_id,source,business_id,target_id,attempt_id,contact_id,subject,body_html,body_text,provider,status,provider_message_id,created_at,completed_at) VALUES('snapshot','w','owner','edm','campaign','recipient','attempt','contact','ACTUAL SUBJECT','<p>ACTUAL CONTENT</p>','ACTUAL CONTENT','resend','sent','provider-receipt','2026-10-08T09:00:00Z','2026-10-08T09:00:01Z');
      UPDATE edm_campaigns SET name='Edited campaign' WHERE id='campaign';
      UPDATE wr_inbox_routes SET snapshot='EDITED ROUTE' WHERE id='route';`);
    const detail: any = await (await req('/communications/edm/recipient')).json();
    expect(detail.record).toMatchObject({ subject: 'ACTUAL SUBJECT', bodyText: 'ACTUAL CONTENT', captureStatus: 'captured', providerMessageId: 'provider-receipt' });
    expect(detail.attempts[0].bodyHtml).toBe('<p>ACTUAL CONTENT</p>');
    const analyst: any = await (await req('/customers/' + encodeURIComponent('contact:contact'), 'GET', undefined, 'analyst')).json();
    expect(JSON.stringify(analyst)).not.toContain('ACTUAL CONTENT'); expect(JSON.stringify(analyst)).not.toContain('CUSTOMER SECRET REPLY');
    sqlite.exec("UPDATE wr_inbox_configs SET team_body=1 WHERE id='cfg'");
    const shared: any = await (await req('/communications/edm/recipient', 'GET', undefined, 'analyst')).json();
    expect(shared.canBody).toBe(true); expect(shared.record.bodyText).toBe('ACTUAL CONTENT');
  });
  it('filters customer counts by employee and channel and distinguishes automatic replies from human replies', async () => {
    const body: any = await (await req('/customers?ownerId=owner&channel=edm')).json();
    expect(body.total).toBe(1); expect(body.customers[0]).toMatchObject({ sent: 1, replied: 1, failed: 1 });
    sqlite.exec("UPDATE wr_inbox_messages SET kind='automatic' WHERE id='reply'");
    const automatic: any = await (await req('/customers')).json();
    expect(automatic.customers.find((c: any) => c.key === 'contact:contact').replied).toBe(0);
  });
  it('retains site followup history after explicit association and places notes in customer chronology', async () => {
    const note: any = await (await req('/customers/' + encodeURIComponent('site:https://client.example/') + '/notes', 'POST', { content: 'SITE NOTE' }, 'owner')).json();
    expect(note.note.content).toBe('SITE NOTE');
    await req('/site-link', 'PUT', { websiteUrl: 'https://client.example/', contactId: 'contact' });
    const profile: any = await (await req('/customers/' + encodeURIComponent('contact:contact'))).json();
    expect(profile.notes[0].content).toBe('SITE NOTE');
    expect(profile.timeline.find((r: any) => r.direction === 'note').bodyText).toBe('SITE NOTE');
    const analyst: any = await (await req('/customers/' + encodeURIComponent('contact:contact'), 'GET', undefined, 'analyst')).json();
    expect(JSON.stringify(analyst)).not.toContain('SITE NOTE');
  });
  it('exports all 20,000 scoped records in bounded pages and escapes spreadsheet formulas', async () => {
    sqlite.exec("DELETE FROM edm_campaign_recipients; DELETE FROM edm_site_message_targets; UPDATE edm_contacts SET name='=DANGEROUS' WHERE id='contact'");
    const insert = sqlite.prepare("INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,sent_at,created_at) VALUES(?,'campaign','contact','sent',1,1)");
    sqlite.exec('BEGIN'); for (let i = 0; i < 20000; i++) insert.run('bulk-' + String(i).padStart(5, '0')); sqlite.exec('COMMIT');
    const response = await req('/communications/export'); expect(response.status).toBe(200);
    const text = await response.text(); expect(text.trim().split('\r\n')).toHaveLength(20001); expect(text).toContain("\"'=DANGEROUS\"");
    const outsider = await req('/communications/export', 'GET', undefined, 'outsider'); expect((await outsider.text()).trim().split('\r\n')).toHaveLength(1);
  });
  it('does not count recipients suppressed before dispatch as sent and orders activity by newest fact', async () => {
    sqlite.exec("UPDATE edm_campaign_recipients SET status='unsubscribed',sent_at=NULL WHERE id='recipient3'; UPDATE edm_campaign_recipients SET sent_at=1791547200 WHERE id='recipient'");
    const profile: any = await (await req('/customers/' + encodeURIComponent('contact:contact'))).json();
    expect(profile.customer.sent).toBe(1); expect(profile.customer.lastActivityAt).toBe('2026-10-09T12:00:00Z');
  });
  it('paginates notes and audits without losing history and blocks foreign workspace audit access', async () => {
    for (let i = 0; i < 3; i++) await req('/customers/' + encodeURIComponent('contact:contact') + '/notes', 'POST', { content: 'Note ' + i }, 'owner');
    const page: any = await (await req('/customers/' + encodeURIComponent('contact:contact') + '/notes?page=2&pageSize=2')).json();
    expect(page.total).toBe(3); expect(page.notes).toHaveLength(1);
    const audit: any = await (await req('/customers/' + encodeURIComponent('contact:contact') + '/audit')).json();
    expect(audit.total).toBe(3); expect(audit.events[0].action).toBe('note.create');
    expect((await req('/customers/' + encodeURIComponent('contact:contact') + '/audit', 'GET', undefined, 'outsider')).status).toBe(404);
  });
  it('includes inbox classification and assignment changes in the same scoped audit history', async () => {
    sqlite.exec(`INSERT INTO wr_inbox_audit(id,workspace_id,thread_id,actor_id,action,detail,created_at) VALUES('inbox-audit','w','thread','owner','message.classify','{"messageId":"reply","kind":"human"}','2026-10-08T14:00:00Z');`);
    const body: any = await (await req('/customers/' + encodeURIComponent('contact:contact') + '/audit')).json();
    expect(body.events.map((e: any) => e.action)).toEqual(['message.classify']);
    const member: any = await (await req('/customers/' + encodeURIComponent('contact:contact') + '/audit', 'GET', undefined, 'member')).json();
    expect(member.events).toHaveLength(0);
  });
  it('does not describe shared Mailchimp reply addresses as per-recipient tracked replies', async () => {
    sqlite.exec("UPDATE edm_campaigns SET mailchimp_campaign_id='remote-campaign' WHERE id='campaign'");
    const body: any = await (await req('/communications/edm/recipient')).json();
    expect(body.record.tracked).toBe(false);
  });
  it('neutralizes spreadsheet formulas after whitespace and control prefixes', async () => {
    for (const label of ['\t=cmd()', '\rDANGEROUS', '  +SUM(1,1)']) {
      sqlite.prepare("UPDATE edm_contacts SET name=? WHERE id='contact'").run(label);
      const csv = await (await req('/communications/export')).text();
      expect(csv).toContain('"\'' + label + '"');
    }
  });
  it('keeps the captured recipient and send history after a contact is edited and deleted', async () => {
    sqlite.exec(`INSERT INTO wr_crm_outbound_snapshots(id,workspace_id,owner_id,source,business_id,target_id,attempt_id,contact_id,recipient_email,sender_email,sender_name,reply_to,subject,body_html,body_text,provider,status,provider_message_id,created_at,completed_at)
      VALUES('snapshot','w','owner','edm','campaign','recipient','attempt','contact','original@client.example','sales@work.example','Sales','reply@work.example','Captured subject','<p>Captured body</p>','Captured body','resend','sent','receipt','2026-10-08T09:00:00Z','2026-10-08T09:00:01Z');
      UPDATE edm_contacts SET email='edited@client.example' WHERE id='contact';`);
    const before: any = await (await req('/communications/edm/recipient')).json();
    expect(before.record.email).toBe('original@client.example'); expect(before.record.senderEmail).toBe('sales@work.example');
    sqlite.exec("DELETE FROM edm_contacts WHERE id='contact'");
    const after: any = await (await req('/communications/edm/recipient', 'GET', undefined, 'owner')).json();
    expect(after.record).toMatchObject({ email: 'original@client.example', bodyText: 'Captured body', status: 'sent', sent: 1 });
    const customers: any = await (await req('/customers', 'GET', undefined, 'owner')).json();
    expect(customers.customers.find((c: any) => c.key === 'contact:contact').email).toBe('original@client.example');
    expect((await req('/communications/edm/recipient', 'GET', undefined, 'member')).status).toBe(404);
  });
  it('searches historical subjects and company while preserving matching customer counts', async () => {
    sqlite.exec("UPDATE edm_contacts SET company='Industrial Wholesale' WHERE id='contact'");
    const company: any = await (await req('/customers?search=Industrial%20Wholesale')).json();
    expect(company.customers.find((c: any) => c.key === 'contact:contact')).toMatchObject({ sent: 2, failed: 1 });
    const subjects: any = await (await req('/communications?search=Original%20subject')).json();
    expect(subjects.records.map((r: any) => r.targetId)).toEqual(['recipient']);
  });
  it('separates uncertain submissions from confirmed failure and success without changing business status', async () => {
    sqlite.exec(`UPDATE edm_campaign_recipients SET status='failed',sent_at=NULL,error_message='待核实：request timeout' WHERE id='recipient';
      UPDATE edm_site_message_targets SET result_code='submitted_unconfirmed' WHERE id='target';`);
    const mail: any = await (await req('/communications/edm/recipient')).json();
    const site: any = await (await req('/communications/site/target')).json();
    expect(mail.record).toMatchObject({ status: 'uncertain', failed: 0, uncertain: 1, sent: 0 });
    expect(site.record).toMatchObject({ status: 'uncertain', failed: 0, uncertain: 1, sent: 0 });
    const employee: any = await (await req('/employees')).json();
    expect(employee.employees.find((e: any) => e.userId === 'owner')).toMatchObject({ failed: 1, uncertain: 2, sent: 0 });
    expect(sqlite.prepare("SELECT status FROM edm_campaign_recipients WHERE id='recipient'").get()?.status).toBe('failed');
  });
  it('keeps customer name search and counts with a different captured recipient address', async () => {
    sqlite.exec(`UPDATE edm_contacts SET name='Alice' WHERE id='contact';
      INSERT INTO wr_crm_outbound_snapshots(id,workspace_id,owner_id,source,business_id,target_id,attempt_id,contact_id,recipient_email,subject,body_text,provider,status,created_at)
      VALUES('snapshot','w','owner','edm','campaign','recipient','attempt','contact','different@client.example','Subject','Body','resend','sent','2026-10-08T09:00:00Z');`);
    const body: any = await (await req('/customers?search=Alice')).json();
    expect(body.total).toBe(1); expect(body.customers[0].sent).toBe(2);
  });
});
