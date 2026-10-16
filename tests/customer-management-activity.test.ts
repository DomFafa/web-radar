import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { d1 } from './outreach/sqlite';
import crm from '../src/worker/crm/api';
import { captureOutbound, completeOutbound } from '../src/worker/crm/capture';
vi.mock('../src/worker/auth', () => ({ authenticate: async (req: Request) => {
  const userId = req.headers.get('X-Test-User') || 'admin';
  return { principal: { userId, workspaceId: userId === 'outside' ? 'other' : 'w', systemRole: 'user',
    workspaceRole: userId === 'admin' ? 'admin' : 'member', appRole: userId === 'admin' ? 'admin' : 'member' } };
} }));
let sqlite: DatabaseSync, env: any;
async function req(path: string, user = 'admin') {
  return crm.request('https://app.example' + path, { headers: { 'X-Test-User': user } }, env);
}
async function snapshot(targetId: string, contactId: string, attemptId = 'first', provider = 'mailchimp') {
  const id = await captureOutbound(env.DB, { workspaceId: 'w', ownerId: 'owner', source: 'edm', businessId: 'campaign', targetId,
    attemptId, contactId, recipientEmail: `${contactId}@client.example`, subject: 'Actual subject',
    bodyHtml: provider === 'mailchimp' ? '<img src="https://app.example/api/outreach/tracking/open?token=token">' : '<p>Body</p>', bodyText: 'Body', provider });
  await completeOutbound(env.DB, id, { status: 'sent', providerMessageId: 'receipt-' + targetId });
}
beforeEach(async () => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  env = { DB: d1(sqlite) };
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES('w','Work','w@work.example',1,1),('other','Other','other@work.example',1,1);
    INSERT INTO wr_members(workspace_id,user_id,email,display_name,created_at) VALUES('w','owner','owner@work.example','Owner','2026-10-08'),('w','second','second@work.example','Second','2026-10-08'),('w','empty','empty@work.example','No activity','2026-10-08');
    INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES('g1','w','Group One',1,1),('g2','w','Group Two',1,1);
    INSERT INTO edm_contacts(id,user_id,email,name,group_id,created_at,updated_at) VALUES('c1','w','c1@client.example','One','g1',1,1),('c2','w','c2@client.example','Two','g2',1,1),('c3','w','c3@client.example','Ungrouped',NULL,1,1),('old','w','old@client.example','Old','g1',1,1);
    INSERT INTO edm_campaigns(id,user_id,created_by,name,sender_email,sender_name,status,created_at,updated_at) VALUES('campaign','w','owner','Multi group','sales@work.example','Sales','completed',1791446400,1791446400),('second-campaign','w','second','Second campaign','sales@work.example','Sales','completed',1791446400,1791446400);
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,sent_at,opened_at,clicked_at,created_at) VALUES('r1','campaign','c1','clicked',1791446400,1791446500,1791446600,1791446400),('r2','campaign','c2','sent',1791446401,NULL,NULL,1791446400),('r3','campaign','c3','sent',1791446402,NULL,NULL,1791446400),('rold','campaign','old','opened',1791446403,1791446503,NULL,1791446400),('rsecond','second-campaign','c1','sent',1791446400,NULL,NULL,1791446400);`);
  await snapshot('r1', 'c1'); await snapshot('r2', 'c2'); await snapshot('r3', 'c3');
});
afterEach(() => sqlite.close());
describe('CRM employee group activity hierarchy', () => {
  it('lists owners including employees with no activity and isolates members/workspaces', async () => {
    const response = await req('/activity/employees'); expect(response.status).toBe(200);
    const body: any = await response.json(); expect(body.employees.find((e: any) => e.userId === 'owner')).toMatchObject({ total: 4, sent: 4, batches: 1 });
    expect(body.employees.find((e: any) => e.userId === 'empty').total).toBe(0);
    const own: any = await (await req('/activity/employees', 'owner')).json(); expect(own.employees.map((e: any) => e.userId)).toEqual(['owner']);
    expect((await req('/activity/groups?ownerId=owner&workspaceId=other')).status).toBe(403);
    expect((await (await req('/activity/groups?ownerId=owner', 'second')).json() as any).groups).toHaveLength(0);
  });
  it('searches employees or their visible activity without clearing the matching employee totals', async () => {
    for (const search of ['Owner', 'Multi group', 'Actual subject', 'Group One']) {
      const body: any = await (await req('/activity/employees?search=' + encodeURIComponent(search))).json();
      expect(body.employees.find((e: any) => e.userId === 'owner')).toMatchObject({ total: 4, sent: 4, groups: 4 });
    }
    const employee: any = await (await req('/activity/employees?ownerId=owner')).json();
    expect(employee.employees.map((e: any) => e.userId)).toEqual(['owner']);
    const foreign: any = await (await req('/activity/employees?search=Owner', 'second')).json();
    expect(foreign.employees).toHaveLength(0);
  });
  it('includes the responsible employee for a specifically assigned thread but only its assigned records', async () => {
    sqlite.exec(`INSERT INTO wr_inbox_configs(id,workspace_id,domain,forward_to,secret,created_at) VALUES('cfg','w','reply.example.com','sales@example.com','secret','2026-10-08');
      INSERT INTO wr_inbox_routes(id,config_id,workspace_id,owner_id,source,business_id,target_id,address,original_email,created_at) VALUES('route','cfg','w','owner','edm','campaign','r1','tracked@reply.example.com','c1@client.example','2026-10-08');
      INSERT INTO wr_inbox_threads(id,workspace_id,config_id,route_id,owner_id,assignee_id,subject,last_received_at,created_at) VALUES('thread','w','cfg','route','owner','second','Reply','2026-10-08T09:00:00Z','2026-10-08');`);
    const body: any = await (await req('/activity/employees', 'second')).json();
    expect(body.employees.find((e: any) => e.userId === 'owner')).toMatchObject({ name: 'Owner', total: 1, sent: 1, groups: 1 });
    const groups: any = await (await req('/activity/groups?ownerId=owner', 'second')).json();
    expect(groups.groups.map((g: any) => g.id)).toEqual(['g1']);
  });
  it('keeps send-time group snapshots immutable across moves, renames and retries, never backfills old records', async () => {
    sqlite.exec("UPDATE edm_contacts SET group_id='g2' WHERE id='c1'; UPDATE edm_contact_groups SET name='Renamed' WHERE id='g1'");
    await snapshot('r1', 'c1', 'retry');
    const body: any = await (await req('/activity/groups?ownerId=owner')).json();
    expect(body.groups.find((g: any) => g.id === 'g1')).toMatchObject({ name: 'Group One', total: 1 });
    expect(body.groups.find((g: any) => g.id === 'g2').total).toBe(1);
    expect(body.groups.find((g: any) => g.id === '__ungrouped__').total).toBe(1);
    expect(body.groups.find((g: any) => g.id === '__history__')).toMatchObject({ name: '历史分组未记录', total: 1 });
  });
  it('counts each activity group slice and drills into overlapping open/click customers with identical scope', async () => {
    const page: any = await (await req('/activity/batches?ownerId=owner&activityGroupId=g1')).json();
    expect(page.batches).toHaveLength(1); expect(page.batches[0]).toMatchObject({ total: 1, sent: 1, businessId: 'campaign' });
    expect(page.batches[0].opened).toMatchObject({ value: 1, coverage: 'full', rate: 1 });
    const detail: any = await (await req('/activity/batches/edm/campaign?ownerId=owner&activityGroupId=g1')).json(); expect(detail.batch.total).toBe(1);
    for (const metric of ['opened', 'clicked']) {
      const records: any = await (await req('/communications?ownerId=owner&activityGroupId=g1&businessId=campaign&channel=edm&metric=' + metric)).json();
      expect(records.records.map((r: any) => r.targetId)).toEqual(['r1']);
    }
    expect((await req('/communications?metric=unsafe')).status).toBe(400);
    expect((await req('/activity/batches/edm/campaign?ownerId=owner')).status).toBe(400);
    expect(detail.batch.createdAt).toBe('2026-10-08T08:00:00Z');
    const all: any = await (await req('/activity/batches?ownerId=owner')).json();
    expect(all.batches.reduce((n: number, b: any) => n + b.sent, 0)).toBe(4);
    const pages = await Promise.all([1, 2, 3, 4].map(async page => (await (await req('/activity/batches?ownerId=owner&pageSize=1&page=' + page)).json() as any).batches[0].activityGroupId));
    expect(new Set(pages).size).toBe(4);
  });
  it('shows observed historical engagement as partial, supported zero as zero and excludes site metrics', async () => {
    const history: any = await (await req('/activity/batches/edm/campaign?ownerId=owner&activityGroupId=__history__')).json();
    expect(history.batch.opened).toMatchObject({ value: 1, coverage: 'partial', rate: null });
    const trackedZero: any = await (await req('/activity/batches/edm/campaign?ownerId=owner&activityGroupId=g2')).json();
    expect(trackedZero.batch.opened).toMatchObject({ value: 0, coverage: 'full', rate: 0 });
    const noTracking: any = await (await req('/activity/batches/edm/second-campaign?ownerId=second&activityGroupId=__history__')).json();
    expect(noTracking.batch.opened).toMatchObject({ value: null, coverage: 'unknown', rate: null });
    expect(trackedZero.batch.delivered).toMatchObject({ value: null, coverage: 'unknown', tracked: 0, rate: null });
  });
  it('derives open and click independently, including a click when the separate open timestamp is absent', async () => {
    sqlite.exec("UPDATE edm_campaign_recipients SET opened_at=NULL WHERE id='r1'");
    const details: any = await (await req('/communications?businessId=campaign&activityGroupId=g1&metric=opened')).json();
    expect(details.records[0]).toMatchObject({ targetId: 'r1', opened: 1, clicked: 1, openedAt: '2026-10-08T08:03:20Z', clickedAt: '2026-10-08T08:03:20Z', engagementCoverage: 'full', engagementSource: 'mailchimp_first_party' });
  });
  it('keeps whole Mailchimp Marketing reports separate from group recipient metrics and marks site engagement inapplicable', async () => {
    sqlite.exec("UPDATE edm_campaigns SET mailchimp_campaign_id='marketing-remote' WHERE id='second-campaign'; INSERT INTO edm_site_message_jobs(id,user_id,created_by,name,sender_name,sender_email,message,created_at,updated_at) VALUES('site-job','w','owner','Site job','Sales','sales@example.com','Hello',1791446400,1791446400); INSERT INTO edm_site_message_targets(id,job_id,website_url,normalized_host,status,completed_at,created_at,updated_at) VALUES('site-target','site-job','https://client.example/','client.example','submitted',1791446400,1791446400,1791446400)");
    const marketing: any = await (await req('/activity/batches/edm/second-campaign?ownerId=second&activityGroupId=__history__')).json();
    expect(marketing.batch.opened).toMatchObject({ value: null, coverage: 'overall_only', detailAvailable: false });
    const site: any = await (await req('/activity/batches/site/site-job?ownerId=owner&activityGroupId=__history__')).json();
    expect(site.batch.opened).toMatchObject({ value: null, coverage: 'not_applicable', detailAvailable: false });
    expect(site.batch.clicked.coverage).toBe('not_applicable');
  });
  it('counts only confirmed human replies in the same group and provides the concrete customers', async () => {
    sqlite.exec(`INSERT INTO wr_inbox_configs(id,workspace_id,domain,forward_to,secret,created_at) VALUES('cfg','w','reply.example.com','sales@example.com','secret','2026-10-08');
      INSERT INTO wr_inbox_routes(id,config_id,workspace_id,owner_id,source,business_id,target_id,address,original_email,created_at) VALUES('route','cfg','w','owner','edm','campaign','r1','tracked@reply.example.com','c1@client.example','2026-10-08');
      INSERT INTO wr_inbox_threads(id,workspace_id,config_id,route_id,owner_id,subject,last_received_at,created_at) VALUES('thread','w','cfg','route','owner','Reply','2026-10-08T09:00:00Z','2026-10-08');
      INSERT INTO wr_inbox_messages(id,workspace_id,config_id,thread_id,dedupe_key,sender,recipient,subject,text_body,raw_key,kind,received_at) VALUES('reply','w','cfg','thread','dedupe','c1@client.example','tracked@reply.example.com','Reply','Thanks','raw','human','2026-10-08T09:00:00Z'),('auto','w','cfg','thread','dedupe2','c1@client.example','tracked@reply.example.com','Auto','Automatic','raw2','automatic','2026-10-08T10:00:00Z');`);
    const batch: any = await (await req('/activity/batches/edm/campaign?ownerId=owner&activityGroupId=g1')).json();
    expect(batch.batch.replied).toMatchObject({ value: 1, coverage: 'full', rate: 1, sources: ['customer_inbox'] });
    const records: any = await (await req('/communications?ownerId=owner&businessId=campaign&activityGroupId=g1&metric=replied')).json();
    expect(records.records[0]).toMatchObject({ targetId: 'r1', repliedAt: '2026-10-08T09:00:00Z' });
    sqlite.exec("UPDATE wr_inbox_messages SET kind='automatic' WHERE id='reply'");
    const updated: any = await (await req('/activity/batches/edm/campaign?ownerId=owner&activityGroupId=g1')).json();
    expect(updated.batch.replied.value).toBe(0);
  });
  it('filters by actual sending date, paginates groups and exports exactly the selected metric slice', async () => {
    const dates: any = await (await req('/activity/groups?ownerId=owner&from=2026-10-09T00:00:00Z')).json(); expect(dates.groups).toHaveLength(0);
    const page: any = await (await req('/activity/groups?ownerId=owner&page=2&pageSize=2')).json(); expect(page.total).toBe(4); expect(page.groups).toHaveLength(2);
    const csv = await (await req('/communications/export?ownerId=owner&activityGroupId=g1&businessId=campaign&channel=edm&metric=clicked')).text();
    expect(csv.trim().split('\r\n')).toHaveLength(2); expect(csv).toContain('c1@client.example'); expect(csv).not.toContain('c2@client.example');
    expect((await req('/activity/groups?from=invalid')).status).toBe(400);
  });
  it('compares actual send times across ISO offsets and includes the final second of the selected day', async () => {
    sqlite.exec("UPDATE edm_campaign_recipients SET sent_at=1791503999 WHERE id='r1'");
    const body: any = await (await req('/communications?ownerId=owner&activityGroupId=g1&from=2026-10-08T00%3A00%3A00%2B00%3A00&to=2026-10-08T23%3A59%3A59.999Z')).json();
    expect(body.total).toBe(1); expect(body.records[0].sentAt).toBe('2026-10-08T23:59:59Z');
    const offset: any = await (await req('/communications?activityGroupId=g1&from=2026-10-09T07%3A59%3A59%2B08%3A00&to=2026-10-09T08%3A00%3A00%2B08%3A00')).json();
    expect(offset.total).toBe(1);
  });
  it('paginates and exports all 20,000 customers in exactly the same employee, group, activity, date and channel scope', async () => {
    sqlite.exec("DELETE FROM wr_crm_outbound_snapshots; DELETE FROM edm_campaign_recipients WHERE campaign_id='campaign'");
    const recipient = sqlite.prepare("INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,sent_at,created_at) VALUES(?,'campaign',?,'sent',1791446400,1791446400)");
    const snap = sqlite.prepare("INSERT INTO wr_crm_outbound_snapshots(id,workspace_id,owner_id,source,business_id,target_id,attempt_id,contact_id,recipient_email,subject,provider,status,created_at,completed_at,group_id_at_send,group_name_at_send,group_snapshot_available) VALUES(?,'w','owner','edm','campaign',?,'first',?,'actual@client.example','Bulk subject','smtp','sent','2026-10-08T08:00:00Z','2026-10-08T08:00:00Z',?, ?,1)");
    sqlite.exec('BEGIN');
    for (let i = 0; i < 20000; i++) {
      const id = 'bulk-' + String(i).padStart(5, '0');
      recipient.run(id, 'c1'); snap.run('snapshot-' + id, id, 'c1', 'g1', 'Group One');
    }
    recipient.run('other-group', 'c2'); snap.run('snapshot-other-group', 'other-group', 'c2', 'g2', 'Group Two');
    sqlite.exec('COMMIT');
    const scope = 'ownerId=owner&activityGroupId=g1&businessId=campaign&channel=edm&metric=sent&from=2026-10-08T08:00:00Z&to=2026-10-08T08:00:00Z';
    const page: any = await (await req('/communications?' + scope + '&page=2&pageSize=50')).json();
    expect(page.total).toBe(20000); expect(page.records).toHaveLength(50); expect(page.records[0].targetId).toBe('bulk-00050');
    const group: any = await (await req('/activity/batches/edm/campaign?' + scope)).json();
    expect(group.batch.sent).toBe(page.total); expect(group.batch.total).toBe(page.total);
    const csv = await (await req('/communications/export?' + scope)).text();
    expect(csv.trim().split('\r\n')).toHaveLength(20001); expect(csv).not.toContain('Group Two');
    const unauthorized = await (await req('/communications/export?' + scope, 'second')).text();
    expect(unauthorized.trim().split('\r\n')).toHaveLength(1);
  });
});

describe('CRM automatic send-time capture', () => {
  it('freezes group after the first successful send, allowing a first rejected attempt to use the later actual group', async () => {
    const capture = async (attemptId: string, provider: string, html = '<p>Body</p>') => captureOutbound(env.DB, { workspaceId: 'w', ownerId: 'owner', source: 'edm', businessId: 'second-campaign', targetId: 'rsecond', contactId: 'c1', attemptId, subject: attemptId, bodyHtml: html, provider });
    const failed = await capture('old-failed', 'mailchimp'); await completeOutbound(env.DB, failed, { status: 'failed' });
    sqlite.exec("UPDATE edm_contacts SET group_id='g2' WHERE id='c1'");
    const success = await capture('new-success', 'mailchimp', '<img src="https://app.example/api/outreach/tracking/open?token=new">');
    await completeOutbound(env.DB, success, { status: 'sent' });
    const rows = sqlite.prepare('SELECT attempt_id,group_id_at_send,engagement_tracking_available,engagement_tracking_source FROM wr_crm_outbound_snapshots WHERE target_id=? ORDER BY attempt_id').all('rsecond');
    expect(rows).toEqual([
      { attempt_id: 'new-success', group_id_at_send: 'g2', engagement_tracking_available: 1, engagement_tracking_source: 'mailchimp_first_party' },
      { attempt_id: 'old-failed', group_id_at_send: 'g1', engagement_tracking_available: 0, engagement_tracking_source: null },
    ]);
    sqlite.exec("UPDATE edm_contacts SET group_id='g1' WHERE id='c1'");
    const later = await capture('later-rejected', 'smtp'); await completeOutbound(env.DB, later, { status: 'failed' });
    expect(sqlite.prepare('SELECT group_id_at_send,engagement_tracking_available FROM wr_crm_outbound_snapshots WHERE id=?').get(later)).toEqual({ group_id_at_send: 'g2', engagement_tracking_available: 0 });
    const detail: any = await (await req('/communications/edm/rsecond')).json();
    expect(detail.record).toMatchObject({ subject: 'new-success', activityGroupId: 'g2', engagementCoverage: 'full' });
  });
  it('captures site groups only from explicit same-workspace associations and keeps new unlinked sites ungrouped', async () => {
    const site = (targetId: string, websiteUrl: string) => captureOutbound(env.DB, { workspaceId: 'w', ownerId: 'owner', source: 'site', businessId: 'site-job', targetId, websiteUrl, attemptId: 'first', subject: '', bodyText: 'Hello', provider: 'browser' });
    const before = await site('before', 'https://client.example/'); await completeOutbound(env.DB, before, { status: 'submitted' });
    sqlite.exec("INSERT INTO wr_crm_customer_links VALUES('w','https://client.example/','c1','owner','2026-10-08'); INSERT INTO wr_crm_customer_links VALUES('other','https://foreign.example/','c2','owner','2026-10-08')");
    const linked = await site('linked', 'https://client.example/'), foreign = await site('foreign-site', 'https://foreign.example/');
    expect(sqlite.prepare('SELECT group_id_at_send,group_snapshot_available FROM wr_crm_outbound_snapshots WHERE id=?').get(linked)).toEqual({ group_id_at_send: 'g1', group_snapshot_available: 1 });
    for (const id of [before, foreign]) expect(sqlite.prepare('SELECT group_id_at_send,group_snapshot_available FROM wr_crm_outbound_snapshots WHERE id=?').get(id)).toEqual({ group_id_at_send: null, group_snapshot_available: 1 });
    const unlinked: any = await (await req('/activity/batches/site/site-job?ownerId=owner&activityGroupId=__ungrouped__')).json();
    expect(unlinked.batch.activityGroupName).toBe('发送时未分组');
  });
  it('trusts Resend tracking only for the actual matching provider and treats orphan engagement as unavailable', async () => {
    for (const provider of ['resend', 'smtp']) {
      const id = await captureOutbound(env.DB, { workspaceId: 'w', ownerId: 'owner', source: 'edm', businessId: 'second-campaign', targetId: 'rsecond', contactId: 'c1', attemptId: provider, subject: provider, provider, engagementTrackingSource: 'resend' });
      expect(sqlite.prepare('SELECT engagement_tracking_available FROM wr_crm_outbound_snapshots WHERE id=?').get(id)?.engagement_tracking_available).toBe(Number(provider === 'resend'));
      await completeOutbound(env.DB, id, { status: provider === 'resend' ? 'sent' : 'failed' });
    }
    sqlite.exec("DELETE FROM edm_campaign_recipients WHERE id='rsecond'");
    const orphan: any = await (await req('/activity/batches/edm/second-campaign?ownerId=owner&activityGroupId=g1')).json();
    expect(orphan.batch.opened).toMatchObject({ value: null, coverage: 'unknown', rate: null });
  });
});
