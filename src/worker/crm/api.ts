import { Hono, type Context } from 'hono';
import { z } from 'zod';
import type { HonoEnv } from '../env';
import type { Principal } from '../../shared/model';
import type { CrmCommunication, CrmCustomer, CrmNote, CrmTimelineEvent } from '../../shared/crm';
import { authenticate } from '../auth';
import { ApiError, errorResponse, jsonBody } from '../http';
import { manageUsers, viewTeamData, writeBusiness } from '../../shared/access';
import { communicationQuery, customerQuery } from './sql';
import { activity, activityPaging as paging, communicationFilters as filters } from './activity';
const crm = new Hono<HonoEnv>();
crm.onError(errorResponse);
const fail = (status: number, message: string) => new ApiError(status, 'customer_management_error', message);
const now = () => new Date().toISOString();
crm.use('*', async (c, next) => {
  const { principal } = await authenticate(c.req.raw, c.env);
  const workspace = c.req.query('workspaceId');
  if (workspace && workspace !== principal.workspaceId && principal.systemRole !== 'super_admin')
    throw fail(403, '无权访问其他工作区');
  c.set('principal', workspace ? { ...principal, workspaceId: workspace } : principal);
  await next();
});
crm.route('/activity', activity);
function communication(r: any, withBody = false): CrmCommunication {
  return { id: `${r.source}:${r.target_id}`, source: r.source, targetId: r.target_id, businessId: r.business_id,
    businessName: r.business_name, customerKey: r.customer_key, customerLabel: r.customer_label,
    contactId: r.contact_id, email: r.email, website: r.website, ownerId: r.owner_id, ownerName: r.owner_name,
    subject: r.subject, status: r.status, sent: r.sent, replied: r.replied, failed: r.failed, uncertain: r.uncertain, tracked: !!r.tracked,
    createdAt: r.created_at, sentAt: r.sent_at, captureStatus: r.capture_status,
    activityGroupId: r.activity_group_id, activityGroupName: r.activity_group_name, activityGroupBasis: r.activity_group_basis,
    delivered: r.delivered, opened: r.opened, clicked: r.clicked,
    deliveredAt: r.delivered_at, openedAt: r.opened_at, clickedAt: r.clicked_at, repliedAt: r.replied_at,
    engagementCoverage: r.source === 'site' ? 'not_applicable' : r.overall_only ? 'overall_only' : r.engagement_available && !r.missing_engagement ? 'full' : r.opened || r.clicked || r.delivered ? 'observed' : 'unknown',
    engagementSource: r.engagement_source,
    ...(withBody ? { bodyText: r.can_body ? r.body_text : null, bodyHtml: r.can_body ? r.body_html : null,
      provider: r.provider, providerMessageId: r.provider_message_id, errorMessage: r.error_message,
      senderEmail: r.sender_email, senderName: r.sender_name, replyTo: r.reply_to } : {}) };
}
function customer(r: any): CrmCustomer {
  return { key: r.customer_key, label: r.label, contactId: r.contact_id, email: r.email, website: r.website,
    company: r.company, groupId: r.group_id, groupName: r.group_name, sent: r.sent || 0,
    replied: r.replied || 0, failed: r.failed || 0, uncertain: r.uncertain || 0, lastActivityAt: r.last_activity_at || null };
}
async function findCustomer(c: any, key: string) {
  const q = customerQuery(c.get('principal'));
  const row = await c.env.DB.prepare(`${q.sql} SELECT c.*,s.sent,s.replied,s.failed,s.uncertain,s.last_activity_at FROM customers c LEFT JOIN customer_stats s ON s.customer_key=c.customer_key WHERE c.customer_key=?`).bind(...q.args, key).first();
  if (!row) throw fail(404, '客户不存在或无权访问');
  return customer(row);
}
async function findCommunication(c: any, source: string, targetId: string) {
  if (!['edm', 'site'].includes(source)) throw fail(400, '渠道无效');
  const q = communicationQuery(c.get('principal'));
  const row = await c.env.DB.prepare(`${q.sql} SELECT * FROM communication WHERE source=? AND target_id=?`).bind(...q.args, source, targetId).first();
  if (!row) throw fail(404, '沟通记录不存在或无权访问');
  return row;
}
async function audit(c: any, key: string, action: string, detail: unknown) {
  const p = c.get('principal');
  return c.env.DB.prepare('INSERT INTO wr_crm_audit VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(), p.workspaceId, p.userId, key, action, JSON.stringify(detail), now());
}
crm.get('/customers', async c => {
  const p = c.get('principal'), url = new URL(c.req.url), pagination = paging(url), f = filters(url), q = customerQuery(p, f);
  let where = '1=1'; const args: unknown[] = [];
  const search = (url.searchParams.get('search') || '').trim().slice(0, 200);
  if (search) { where += " AND (instr(lower(c.label),lower(?))>0 OR instr(lower(COALESCE(c.email,'')),lower(?))>0 OR instr(lower(COALESCE(c.website,'')),lower(?))>0 OR instr(lower(COALESCE(c.company,'')),lower(?))>0)"; args.push(search, search, search, search); }
  const group = url.searchParams.get('groupId'); if (group) { where += ' AND c.group_id=?'; args.push(group); }
  if (url.searchParams.get('ownerId') || url.searchParams.get('channel')) { where += ` AND EXISTS(SELECT 1 FROM communication q WHERE q.customer_key=c.customer_key AND ${f.sql})`; args.push(...f.args); }
  const joins = `FROM customers c LEFT JOIN customer_stats s ON s.customer_key=c.customer_key WHERE ${where}`;
  const [total, rows] = await Promise.all([
    c.env.DB.prepare(`${q.sql} SELECT COUNT(*) n ${joins}`).bind(...q.args, ...args).first<{ n: number }>(),
    c.env.DB.prepare(`${q.sql} SELECT c.*,s.sent,s.replied,s.failed,s.uncertain,s.last_activity_at ${joins} ORDER BY s.last_activity_at DESC,c.customer_key LIMIT ? OFFSET ?`).bind(...q.args, ...args, pagination.pageSize, pagination.offset).all(),
  ]);
  return c.json({ customers: rows.results.map(customer), total: total?.n || 0, page: pagination.page, pageSize: pagination.pageSize });
});
crm.get('/communications', async c => {
  const q = communicationQuery(c.get('principal')), url = new URL(c.req.url), f = filters(url), pagination = paging(url);
  const [total, rows] = await Promise.all([
    c.env.DB.prepare(`${q.sql} SELECT COUNT(*) n FROM communication q WHERE ${f.sql}`).bind(...q.args, ...f.args).first<{ n: number }>(),
    c.env.DB.prepare(`${q.sql} SELECT source,target_id,business_id,business_name,customer_key,customer_label,contact_id,email,website,owner_id,owner_name,subject,status,sent,replied,failed,uncertain,tracked,created_at,sent_at,capture_status,activity_group_id,activity_group_name,activity_group_basis,delivered,opened,clicked,delivered_at,opened_at,clicked_at,replied_at,overall_only,engagement_available,missing_engagement,engagement_source FROM communication q WHERE ${f.sql} ORDER BY q.last_activity_at DESC,q.source,q.target_id LIMIT ? OFFSET ?`).bind(...q.args, ...f.args, pagination.pageSize, pagination.offset).all(),
  ]);
  return c.json({ records: rows.results.map(r => communication(r)), total: total?.n || 0, page: pagination.page, pageSize: pagination.pageSize });
});
crm.get('/communications/export', async c => {
  const q = communicationQuery(c.get('principal')), f = filters(new URL(c.req.url));
  const encode = new TextEncoder(); let offset = 0, header = true;
  const csv = (value: unknown) => { let s = String(value ?? ''); if (/^\s*[=+@-]|^[\t\r\n]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
  const stream = new ReadableStream({ async pull(controller) {
    try {
      if (header) { controller.enqueue(encode.encode('\uFEFF渠道,客户,收件邮箱,目标网站,负责人,任务,主题,状态,已发送,人工回复,发送时间,内容记录,发送时分组,分组记录,已打开,已点击,打开时间,点击时间,回复时间\r\n')); header = false; }
      const rows = await c.env.DB.prepare(`${q.sql} SELECT source,customer_label,email,website,owner_name,owner_id,business_name,subject,status,sent,replied,sent_at,capture_status,activity_group_name,activity_group_basis,opened,clicked,opened_at,clicked_at,replied_at FROM communication q WHERE ${f.sql} ORDER BY q.source,q.target_id LIMIT 1000 OFFSET ?`).bind(...q.args, ...f.args, offset).all();
      if (!rows.results.length) { controller.close(); return; }
      controller.enqueue(encode.encode(rows.results.map((r: any) => [r.source, r.customer_label, r.email, r.website, r.owner_name || r.owner_id, r.business_name, r.subject, r.status, r.sent, r.replied, r.sent_at, r.capture_status, r.activity_group_name, r.activity_group_basis, r.opened, r.clicked, r.opened_at, r.clicked_at, r.replied_at].map(csv).join(',')).join('\r\n') + '\r\n'));
      offset += rows.results.length;
    } catch (error) { controller.error(error); }
  } });
  return new Response(stream, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="customer-communications.csv"', 'Cache-Control': 'no-store' } });
});
crm.get('/communications/:source/:targetId', async c => {
  const r = await findCommunication(c, c.req.param('source'), c.req.param('targetId')), p = c.get('principal');
  const [attempts, total] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM wr_crm_outbound_snapshots WHERE workspace_id=? AND source=? AND target_id=? ORDER BY created_at DESC,id DESC LIMIT 200').bind(p.workspaceId, r.source, r.target_id).all<any>(),
    c.env.DB.prepare('SELECT COUNT(*) n FROM wr_crm_outbound_snapshots WHERE workspace_id=? AND source=? AND target_id=?').bind(p.workspaceId, r.source, r.target_id).first<{ n: number }>(),
  ]);
  return c.json({ record: communication(r, true), canBody: !!r.can_body, attemptsTotal: total?.n || 0, attempts: attempts.results.map(a => ({ id: a.id, attemptId: a.attempt_id, createdAt: a.created_at, completedAt: a.completed_at, status: a.status, provider: a.provider, providerMessageId: a.provider_message_id, subject: a.subject, bodyText: r.can_body ? a.body_text : null, bodyHtml: r.can_body ? a.body_html : null, errorMessage: a.error_message, recipientEmail: a.recipient_email, senderEmail: a.sender_email, senderName: a.sender_name, replyTo: a.reply_to })) });
});
crm.get('/employees', async c => {
  const p = c.get('principal'), q = communicationQuery(p);
  const rows = await c.env.DB.prepare(`${q.sql}, owners AS (SELECT user_id owner_id,display_name name,email FROM wr_members WHERE workspace_id=? ${viewTeamData(p) ? '' : 'AND user_id=?'} UNION SELECT owner_id,CASE WHEN owner_id IS NULL THEN '历史未归属' ELSE owner_id END,NULL FROM communication WHERE owner_id IS NULL OR owner_id NOT IN (SELECT user_id FROM wr_members WHERE workspace_id=?)) SELECT o.owner_id userId,o.name,o.email,COUNT(DISTINCT CASE WHEN q.sent=1 THEN q.customer_key END) customers,COALESCE(SUM(q.sent),0) sent,COALESCE(SUM(q.replied),0) replied,COALESCE(SUM(q.failed),0) failed,COALESCE(SUM(q.uncertain),0) uncertain,COUNT(q.target_id) total FROM owners o LEFT JOIN communication q ON q.owner_id IS o.owner_id GROUP BY o.owner_id,o.name,o.email ORDER BY sent DESC,o.name`).bind(...q.args, p.workspaceId, ...(viewTeamData(p) ? [] : [p.userId]), p.workspaceId).all();
  return c.json({ employees: rows.results, canViewTeam: viewTeamData(p) });
});
function customerHistoryKey(alias: string) {
  return `(${alias}.customer_key=? OR EXISTS(SELECT 1 FROM wr_crm_customer_links l WHERE l.workspace_id=${alias}.workspace_id AND 'contact:'||l.contact_id=? AND ${alias}.customer_key='site:'||l.site_url))`;
}
async function notes(c: Context<HonoEnv>, key: string, page = { page: 1, pageSize: 200, offset: 0 }): Promise<{ notes: CrmNote[]; total: number; page: number; pageSize: number }> {
  const p = c.get('principal') as Principal;
  const scope = `n.workspace_id=? AND ${customerHistoryKey('n')} ${viewTeamData(p) ? '' : 'AND n.author_id=?'}`;
  const args = [p.workspaceId, key, key, ...(viewTeamData(p) ? [] : [p.userId])];
  const [rows, total] = await Promise.all([
    c.env.DB.prepare(`SELECT n.*,m.display_name author_name FROM wr_crm_notes n LEFT JOIN wr_members m ON m.workspace_id=n.workspace_id AND m.user_id=n.author_id WHERE ${scope} ORDER BY n.created_at DESC,n.id LIMIT ? OFFSET ?`).bind(...args, page.pageSize, page.offset).all(),
    c.env.DB.prepare(`SELECT COUNT(*) n FROM wr_crm_notes n WHERE ${scope}`).bind(...args).first<{ n: number }>(),
  ]);
  return { notes: rows.results.map((n: any) => ({ id: n.id, customerKey: n.customer_key, authorId: n.author_id, authorName: n.author_name,
    content: manageUsers(p) || n.author_id === p.userId ? n.content : null, followUpAt: n.follow_up_at, status: n.status,
    createdAt: n.created_at, updatedAt: n.updated_at, canWrite: writeBusiness(p) && (manageUsers(p) || n.author_id === p.userId), canBody: manageUsers(p) || n.author_id === p.userId })), total: total?.n || 0, page: page.page, pageSize: page.pageSize };
}
crm.get('/customers/:key/notes', async c => {
  const key = c.req.param('key'); await findCustomer(c, key);
  return c.json(await notes(c, key, paging(new URL(c.req.url))));
});
crm.get('/customers/:key/audit', async c => {
  const p = c.get('principal'), key = c.req.param('key'); await findCustomer(c, key);
  const page = paging(new URL(c.req.url)), q = communicationQuery(p);
  const sql = `${q.sql}, events AS (
    SELECT a.id,a.workspace_id,a.actor_id,a.customer_key,a.action,a.detail,a.created_at FROM wr_crm_audit a WHERE a.workspace_id=? AND ${customerHistoryKey('a')} ${viewTeamData(p) ? '' : 'AND a.actor_id=?'}
    UNION ALL SELECT a.id,a.workspace_id,a.actor_id,q.customer_key,a.action,a.detail,a.created_at FROM wr_inbox_audit a JOIN communication q ON q.thread_id=a.thread_id AND q.workspace_id=a.workspace_id WHERE q.customer_key=?
  )`;
  const args = [...q.args, p.workspaceId, key, key, ...(viewTeamData(p) ? [] : [p.userId]), key];
  const [rows, total] = await Promise.all([
    c.env.DB.prepare(`${sql} SELECT e.*,m.display_name actor_name FROM events e LEFT JOIN wr_members m ON m.workspace_id=e.workspace_id AND m.user_id=e.actor_id ORDER BY e.created_at DESC,e.id DESC LIMIT ? OFFSET ?`).bind(...args, page.pageSize, page.offset).all(),
    c.env.DB.prepare(`${sql} SELECT COUNT(*) n FROM events`).bind(...args).first<{ n: number }>(),
  ]);
  return c.json({ events: rows.results, total: total?.n || 0, page: page.page, pageSize: page.pageSize });
});
crm.get('/customers/:key', async c => {
  const p = c.get('principal'), key = c.req.param('key'), profile = await findCustomer(c, key), q = communicationQuery(p), pagination = paging(new URL(c.req.url));
  const timelineSql = `${q.sql}, timeline AS (
    SELECT 'outbound:'||q.source||':'||q.target_id id,'outbound' direction,q.source,COALESCE(q.sent_at,q.created_at) occurred_at,q.subject,q.body_text,q.body_html,q.owner_id,q.owner_name,q.status,NULL kind,q.thread_id,q.target_id,q.can_body,q.capture_status,NULL sender FROM communication q WHERE q.customer_key=?
    UNION ALL SELECT 'inbound:'||m.id,'inbound',q.source,m.received_at,m.subject,m.text_body,NULL,q.owner_id,q.owner_name,m.kind,m.kind,t.id,q.target_id,q.can_body,NULL,m.sender FROM communication q JOIN wr_inbox_threads t ON t.id=q.thread_id AND t.workspace_id=q.workspace_id JOIN wr_inbox_messages m ON m.thread_id=t.id AND m.workspace_id=q.workspace_id WHERE q.customer_key=?
    UNION ALL SELECT 'note:'||n.id,'note',NULL,n.created_at,CASE WHEN n.follow_up_at IS NULL THEN '客户备注' ELSE '客户跟进' END,n.content,NULL,n.author_id,m.display_name,n.status,NULL,NULL,NULL,${manageUsers(p) ? '1' : 'n.author_id=?'},NULL,NULL FROM wr_crm_notes n LEFT JOIN wr_members m ON m.workspace_id=n.workspace_id AND m.user_id=n.author_id WHERE n.workspace_id=? AND ${customerHistoryKey('n')} ${viewTeamData(p) ? '' : 'AND n.author_id=?'}
  )`;
  const timelineArgs = [...q.args, key, key, ...(manageUsers(p) ? [] : [p.userId]), p.workspaceId, key, key, ...(viewTeamData(p) ? [] : [p.userId])];
  const [total, rows, customerNotes] = await Promise.all([
    c.env.DB.prepare(`${timelineSql} SELECT COUNT(*) n FROM timeline`).bind(...timelineArgs).first<{ n: number }>(),
    c.env.DB.prepare(`${timelineSql} SELECT * FROM timeline ORDER BY occurred_at DESC,id DESC LIMIT ? OFFSET ?`).bind(...timelineArgs, pagination.pageSize, pagination.offset).all(),
    notes(c, key),
  ]);
  const timeline: CrmTimelineEvent[] = rows.results.map((r: any) => ({ id: r.id, direction: r.direction, source: r.source,
    occurredAt: r.occurred_at, subject: r.subject, bodyText: r.can_body ? r.body_text : null, bodyHtml: r.can_body ? r.body_html : null,
    ownerId: r.owner_id, ownerName: r.owner_name, status: r.status, kind: r.kind, threadId: r.thread_id,
    targetId: r.target_id, canBody: !!r.can_body, captureStatus: r.capture_status, sender: r.sender }));
  return c.json({ customer: profile, timeline, notes: customerNotes.notes, notesTotal: customerNotes.total, notesPage: customerNotes.page, notesPageSize: customerNotes.pageSize, total: total?.n || 0, page: pagination.page,
    pageSize: pagination.pageSize, canWrite: writeBusiness(p), canBody: timeline.some(r => r.canBody) || manageUsers(p) });
});
const noteSchema = z.strictObject({ content: z.string().trim().min(1).max(10000), followUpAt: z.iso.datetime({ offset: true }).nullable().optional() });
crm.post('/customers/:key/notes', async c => {
  const p = c.get('principal'); if (!writeBusiness(p)) throw fail(403, '当前账号不能添加跟进记录');
  const key = c.req.param('key'); await findCustomer(c, key);
  const body = noteSchema.safeParse(await jsonBody(c.req.raw)); if (!body.success) throw fail(400, '备注或跟进日期无效');
  const id = crypto.randomUUID(), date = now();
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO wr_crm_notes VALUES(?,?,?,?,?,?,?,?,?)').bind(id, p.workspaceId, key, p.userId, body.data.content, body.data.followUpAt || null, 'pending', date, date),
    await audit(c, key, 'note.create', { id, followUpAt: body.data.followUpAt || null }),
  ]);
  return c.json({ note: (await notes(c, key)).notes.find(n => n.id === id) }, 201);
});
crm.put('/notes/:id', async c => {
  const p = c.get('principal'); if (!writeBusiness(p)) throw fail(403, '当前账号不能修改跟进记录');
  const body = z.strictObject({ status: z.enum(['pending', 'done']) }).safeParse(await jsonBody(c.req.raw)); if (!body.success) throw fail(400, '跟进状态无效');
  const note = await c.env.DB.prepare(`SELECT * FROM wr_crm_notes WHERE id=? AND workspace_id=? ${manageUsers(p) ? '' : 'AND author_id=?'}`).bind(c.req.param('id'), p.workspaceId, ...(manageUsers(p) ? [] : [p.userId])).first<any>();
  if (!note) throw fail(404, '跟进记录不存在或无权修改');
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE wr_crm_notes SET status=?,updated_at=? WHERE id=? AND workspace_id=?').bind(body.data.status, now(), note.id, p.workspaceId),
    await audit(c, note.customer_key, 'note.status', { id: note.id, before: note.status, after: body.data.status }),
  ]);
  return c.json({ ok: true });
});
crm.put('/site-link', async c => {
  const p = c.get('principal'); if (!writeBusiness(p)) throw fail(403, '当前账号不能关联客户');
  const body = z.strictObject({ websiteUrl: z.url().max(2000), contactId: z.string().min(1).max(200) }).safeParse(await jsonBody(c.req.raw));
  if (!body.success || !/^https?:\/\//i.test(body.data.websiteUrl)) throw fail(400, '客户网址或联系人无效');
  const { websiteUrl, contactId } = body.data;
  const contact = await c.env.DB.prepare('SELECT id FROM edm_contacts WHERE id=? AND user_id=?').bind(contactId, p.workspaceId).first();
  if (!contact) throw fail(404, '联系人不存在或不属于当前工作区');
  const owned = await c.env.DB.prepare(`SELECT b.created_by FROM edm_site_message_targets t JOIN edm_site_message_jobs b ON b.id=t.job_id WHERE b.user_id=? AND t.website_url=? ${manageUsers(p) ? '' : 'AND b.created_by=?'} LIMIT 1`).bind(p.workspaceId, websiteUrl, ...(manageUsers(p) ? [] : [p.userId])).first();
  if (!owned) throw fail(403, '此网站没有您可管理的沟通记录');
  const prior = await c.env.DB.prepare('SELECT contact_id FROM wr_crm_customer_links WHERE workspace_id=? AND site_url=?').bind(p.workspaceId, websiteUrl).first<{ contact_id: string }>();
  if (prior && prior.contact_id !== contactId && !manageUsers(p)) throw fail(403, '仅管理员可修改已有客户关联');
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO wr_crm_customer_links VALUES(?,?,?,?,?) ON CONFLICT(workspace_id,site_url) DO UPDATE SET contact_id=excluded.contact_id,created_by=excluded.created_by,created_at=excluded.created_at').bind(p.workspaceId, websiteUrl, contactId, p.userId, now()),
    await audit(c, 'contact:' + contactId, 'customer.link', { websiteUrl, contactId, previousContactId: prior?.contact_id || null }),
  ]);
  return c.json({ ok: true, customerKey: 'contact:' + contactId });
});
export default crm;
