import { Hono } from 'hono';
import { z } from 'zod';
import type { HonoEnv } from '../env';
import type { CrmActivityMetric, CrmActivityStats } from '../../shared/crm';
import { viewTeamData } from '../../shared/access';
import { ApiError } from '../http';
import { communicationQuery } from './sql';

const fail = (message: string) => new ApiError(400, 'customer_management_error', message);
const searchColumns = ['customer_label', 'email', 'website', 'business_name', 'company', 'subject', 'activity_group_name'];
function searchCondition(alias: string) {
  return searchColumns.map(column => `instr(lower(COALESCE(${alias}.${column},'')),lower(?))>0`).join(' OR ');
}
export function activityPaging(url: URL) {
  const page = Number(url.searchParams.get('page') || 1), pageSize = Number(url.searchParams.get('pageSize') || 50);
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 200)
    throw fail('分页参数无效，每页最多 200 条');
  return { page, pageSize, offset: (page - 1) * pageSize };
}
export function communicationFilters(url: URL, alias = 'q') {
  let sql = '1=1'; const args: unknown[] = [];
  const search = (url.searchParams.get('search') || '').trim().slice(0, 200), owner = url.searchParams.get('ownerId'), channel = url.searchParams.get('channel');
  if (search) {
    sql += ` AND (${searchCondition(alias)})`;
    args.push(...Array(searchColumns.length).fill(search));
  }
  if (owner === '__legacy__') sql += ` AND ${alias}.owner_id IS NULL`;
  else if (owner) { sql += ` AND ${alias}.owner_id=?`; args.push(owner); }
  if (channel) { if (!['edm', 'site'].includes(channel)) throw fail('渠道参数无效'); sql += ` AND ${alias}.source=?`; args.push(channel); }
  for (const [parameter, column] of [['groupId', 'group_id'], ['activityGroupId', 'activity_group_id'], ['businessId', 'business_id']] as const) {
    const value = url.searchParams.get(parameter); if (value) { sql += ` AND ${alias}.${column}=?`; args.push(value); }
  }
  const metric = url.searchParams.get('metric') || 'all';
  if (!['all', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'failed', 'uncertain'].includes(metric)) throw fail('效果筛选参数无效');
  if (metric !== 'all') sql += ` AND ${alias}.${metric}=1`;
  for (const parameter of ['from', 'to'] as const) {
    const value = url.searchParams.get(parameter);
    if (value) {
      if (!z.iso.datetime({ offset: true }).safeParse(value).success) throw fail('发送时间须为有效的 ISO 日期时间');
      sql += ` AND julianday(COALESCE(${alias}.sent_at,${alias}.attempted_at))${parameter === 'from' ? '>=' : '<='}julianday(?)`;
      args.push(value);
    }
  }
  const from = url.searchParams.get('from'), to = url.searchParams.get('to');
  if (from && to && Date.parse(from) > Date.parse(to)) throw fail('结束时间不能早于开始时间');
  return { sql, args };
}

const aggregateColumns = `COUNT(q.target_id) total,COUNT(DISTINCT q.customer_key) customers,
  COUNT(DISTINCT q.source||':'||q.business_id) batches,COUNT(DISTINCT q.activity_group_id) groups,
  COALESCE(SUM(q.sent),0) sent,COALESCE(SUM(q.failed),0) failed,COALESCE(SUM(q.uncertain),0) uncertain,
  MIN(CASE WHEN q.sent=1 THEN q.sent_at END) first_sent_at,MAX(CASE WHEN q.sent=1 THEN q.sent_at END) last_sent_at,
  COALESCE(SUM(q.source='edm' AND q.sent=1),0) email_eligible,
  COALESCE(SUM(q.sent=1),0) reply_eligible,
  COALESCE(SUM(q.source='edm' AND q.sent=1 AND q.engagement_available=1 AND q.missing_engagement=0 AND q.overall_only=0),0) engagement_tracked,
  COALESCE(SUM(q.source='edm' AND q.sent=1 AND q.engagement_available=1 AND q.engagement_source='resend' AND q.missing_engagement=0 AND q.overall_only=0),0) delivered_tracked,
  COALESCE(SUM(q.sent=1 AND q.tracked=1),0) reply_tracked,
  COALESCE(SUM(q.source='site'),0) site_count,
  COALESCE(SUM(q.source='edm'),0) email_count,
  COALESCE(SUM(q.overall_only),0) overall_count,
  COALESCE(SUM(q.delivered),0) delivered,COALESCE(SUM(q.opened),0) opened,
  COALESCE(SUM(q.clicked),0) clicked,COALESCE(SUM(q.replied),0) replied,
  GROUP_CONCAT(DISTINCT q.engagement_source) engagement_sources`;

function metric(row: any, name: 'delivered' | 'opened' | 'clicked' | 'replied'): CrmActivityMetric {
  const email = name !== 'replied', value = Number(row[name] || 0);
  const eligible = Number(row[email ? 'email_eligible' : 'reply_eligible'] || 0);
  const tracked = Number(row[email ? name === 'delivered' ? 'delivered_tracked' : 'engagement_tracked' : 'reply_tracked'] || 0);
  const sources: string[] = email ? String(row.engagement_sources || '').split(',').filter(Boolean) : tracked || value ? ['customer_inbox'] : [];
  if (email && !Number(row.email_count || 0) && Number(row.site_count || 0))
    return { value: null, eligible, tracked, sources: [], coverage: 'not_applicable', detailAvailable: false, rate: null };
  const coverage = eligible > 0 && tracked === eligible ? 'full' : tracked > 0 || value > 0 ? 'partial' : email && Number(row.overall_count || 0) ? 'overall_only' : 'unknown';
  return { value: coverage === 'unknown' || coverage === 'overall_only' ? null : value, eligible, tracked, sources,
    coverage, detailAvailable: tracked > 0 || value > 0, rate: coverage === 'full' && eligible > 0 ? value / eligible : null };
}
function stats(row: any): CrmActivityStats {
  return { total: Number(row.total || 0), customers: Number(row.customers || 0), batches: Number(row.batches || 0),
    sent: Number(row.sent || 0), failed: Number(row.failed || 0), uncertain: Number(row.uncertain || 0),
    firstSentAt: row.first_sent_at || null, lastSentAt: row.last_sent_at || null,
    delivered: metric(row, 'delivered'), opened: metric(row, 'opened'), clicked: metric(row, 'clicked'), replied: metric(row, 'replied') };
}
function query(c: any, ignoreSearch = false) {
  const url = new URL(c.req.url);
  if (ignoreSearch) url.searchParams.delete('search');
  const p = c.get('principal'), base = communicationQuery(p), f = communicationFilters(url);
  return { p, sql: `${base.sql}, filtered AS (SELECT * FROM communication q WHERE ${f.sql})`, args: [...base.args, ...f.args] };
}
function batch(row: any) {
  return { ...stats(row), source: row.source, businessId: row.business_id, name: row.business_name,
    ownerId: row.owner_id, ownerName: row.owner_name, activityGroupId: row.activity_group_id,
    activityGroupName: row.activity_group_name, status: row.business_status || null, createdAt: row.business_created_at || null };
}
export const activity = new Hono<HonoEnv>();
activity.get('/employees', async c => {
  const q = query(c, true), page = activityPaging(new URL(c.req.url)), owner = c.req.query('ownerId'), search = (c.req.query('search') || '').trim().slice(0, 200);
  const owners = `SELECT user_id owner_id,display_name name,email FROM wr_members WHERE workspace_id=? ${viewTeamData(q.p) ? '' : 'AND user_id=?'} UNION SELECT q.owner_id,COALESCE(m.display_name,CASE WHEN q.owner_id IS NULL THEN '历史未归属' ELSE q.owner_id END),m.email FROM filtered q LEFT JOIN wr_members m ON m.workspace_id=? AND m.user_id=q.owner_id`;
  const args: unknown[] = [...q.args, q.p.workspaceId, ...(viewTeamData(q.p) ? [] : [q.p.userId]), q.p.workspaceId];
  let ownerFilter = '1=1';
  if (owner === '__legacy__') ownerFilter += ' AND o.owner_id IS NULL'; else if (owner) { ownerFilter += ' AND o.owner_id=?'; args.push(owner); }
  if (search) {
    ownerFilter += ` AND (instr(lower(o.name),lower(?))>0 OR instr(lower(COALESCE(o.email,'')),lower(?))>0 OR EXISTS(SELECT 1 FROM filtered matching WHERE matching.owner_id IS o.owner_id AND (${searchCondition('matching')})))`;
    args.push(search, search, ...Array(searchColumns.length).fill(search));
  }
  const sql = `${q.sql}, owners AS (${owners}), employees AS (SELECT o.owner_id,o.name,o.email,${aggregateColumns} FROM owners o LEFT JOIN filtered q ON q.owner_id IS o.owner_id WHERE ${ownerFilter} GROUP BY o.owner_id,o.name,o.email)`;
  const [total, rows] = await Promise.all([
    c.env.DB.prepare(`${sql} SELECT COUNT(*) n FROM employees`).bind(...args).first<{ n: number }>(),
    c.env.DB.prepare(`${sql} SELECT * FROM employees ORDER BY sent DESC,name,owner_id LIMIT ? OFFSET ?`).bind(...args, page.pageSize, page.offset).all(),
  ]);
  return c.json({ employees: rows.results.map((r: any) => ({ ...stats(r), userId: r.owner_id, name: r.name, email: r.email, groups: Number(r.groups || 0) })), total: total?.n || 0, page: page.page, pageSize: page.pageSize, canViewTeam: viewTeamData(q.p) });
});
activity.get('/groups', async c => {
  const q = query(c), page = activityPaging(new URL(c.req.url));
  const sql = `${q.sql}, grouped AS (SELECT q.activity_group_id,MAX(q.activity_group_basis) basis,
    (SELECT latest.activity_group_name FROM filtered latest WHERE latest.activity_group_id=q.activity_group_id ORDER BY COALESCE(latest.sent_at,latest.attempted_at) DESC,latest.target_id DESC LIMIT 1) name,
    ${aggregateColumns} FROM filtered q GROUP BY q.activity_group_id)`;
  const [total, rows] = await Promise.all([
    c.env.DB.prepare(`${sql} SELECT COUNT(*) n FROM grouped`).bind(...q.args).first<{ n: number }>(),
    c.env.DB.prepare(`${sql} SELECT * FROM grouped ORDER BY last_sent_at DESC,activity_group_id LIMIT ? OFFSET ?`).bind(...q.args, page.pageSize, page.offset).all(),
  ]);
  return c.json({ groups: rows.results.map((r: any) => ({ ...stats(r), id: r.activity_group_id, name: r.name, basis: r.basis })), total: total?.n || 0, page: page.page, pageSize: page.pageSize });
});
activity.get('/batches', async c => {
  const q = query(c), page = activityPaging(new URL(c.req.url));
  const sql = `${q.sql}, batches AS (SELECT q.source,q.business_id,MAX(q.business_name) business_name,q.owner_id,MAX(q.owner_name) owner_name,q.activity_group_id,MAX(q.activity_group_name) activity_group_name,MAX(q.business_status) business_status,MIN(q.business_created_at) business_created_at,${aggregateColumns} FROM filtered q GROUP BY q.source,q.business_id,q.owner_id,q.activity_group_id)`;
  const [total, rows] = await Promise.all([
    c.env.DB.prepare(`${sql} SELECT COUNT(*) n FROM batches`).bind(...q.args).first<{ n: number }>(),
    c.env.DB.prepare(`${sql} SELECT * FROM batches ORDER BY COALESCE(last_sent_at,business_created_at) DESC,source,business_id,activity_group_id,owner_id LIMIT ? OFFSET ?`).bind(...q.args, page.pageSize, page.offset).all(),
  ]);
  return c.json({ batches: rows.results.map(batch), total: total?.n || 0, page: page.page, pageSize: page.pageSize });
});
activity.get('/batches/:source/:businessId', async c => {
  const q = query(c), source = c.req.param('source');
  if (!['edm', 'site'].includes(source)) throw fail('渠道参数无效');
  if (!c.req.query('activityGroupId')) throw fail('请先选择发送时的客户分组');
  const row = await c.env.DB.prepare(`${q.sql} SELECT q.source,q.business_id,MAX(q.business_name) business_name,q.owner_id,MAX(q.owner_name) owner_name,q.activity_group_id,MAX(q.activity_group_name) activity_group_name,MAX(q.business_status) business_status,MIN(q.business_created_at) business_created_at,${aggregateColumns} FROM filtered q WHERE q.source=? AND q.business_id=? GROUP BY q.source,q.business_id,q.owner_id,q.activity_group_id`).bind(...q.args, source, c.req.param('businessId')).first();
  if (!row) throw new ApiError(404, 'customer_management_error', '发送活动不存在或无权访问');
  return c.json({ batch: batch(row) });
});
