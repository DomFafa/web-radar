import { Hono, type Context, type MiddlewareHandler } from 'hono';
import type { AppEnv, HonoEnv } from '../env';
import type { Principal } from '../../shared/model';
import { authenticate } from '../auth';
import { ApiError, errorResponse, jsonBody, sha256 } from '../http';
import { manageUsers, viewTeamData, writeBusiness } from '../../shared/access';
import { normalizeRows, type DomainRow } from './domains';
import { looksLikeXlsx } from './xlsx';

const ID = /^[a-f0-9]{32}$/;
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const SHA = /^[a-f0-9]{64}$/;
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const LEASE_MS = 120_000;
const MAX_ARTIFACT_BYTES = 20 * 1024 * 1024;
const COLUMNS = 'id,workspace_id,created_by,robot_uuid,status,attempt_id,lease_until,updated_at,created_at,domain_count,input_sha256,input_artifact_key,result_sha256,artifact_key,evidence_json,verification_json';

type Job = {
  id: string; workspace_id: string; created_by: string; robot_uuid: string;
  status: string; attempt_id: string | null; lease_until: number | null;
  created_at: number; updated_at: number; domain_count: number;
  input_sha256: string | null; input_artifact_key: string | null;
  result_sha256: string | null; artifact_key: string | null;
  evidence_json: string | null; verification_json: string | null;
};

function fail(status: number, code: string, message: string): never {
  throw new ApiError(status, code, message);
}

function ensureId(value: string) {
  if (!ID.test(value)) fail(400, 'invalid_job_id', '任务 ID 必须是 32 位小写十六进制字符。');
}

function approvedRobot(env: AppEnv): string {
  if (!env.RPA_APPROVED_ROBOT_UUID || !UUID.test(env.RPA_APPROVED_ROBOT_UUID))
    fail(503, 'robot_unconfigured', '经过审查的影刀机器人尚未配置，任务提交暂不可用。');
  return env.RPA_APPROVED_ROBOT_UUID;
}

async function one(env: AppEnv, id: string): Promise<Job | null> {
  return env.DB.prepare(`SELECT ${COLUMNS} FROM wr_rpa_jobs WHERE id=?`).bind(id).first<Job>();
}

function canRead(principal: Principal, job: Job): boolean {
  return job.workspace_id === principal.workspaceId &&
    (job.created_by === principal.userId || viewTeamData(principal));
}

function canWrite(principal: Principal, job: Job): boolean {
  return job.workspace_id === principal.workspaceId && writeBusiness(principal) &&
    (job.created_by === principal.userId || manageUsers(principal));
}

async function owned(env: AppEnv, id: string, principal: Principal, write = false): Promise<Job> {
  ensureId(id);
  const job = await one(env, id);
  if (!job || !(write ? canWrite(principal, job) : canRead(principal, job)))
    fail(404, 'job_not_found', '任务不存在或无权查看。');
  return job;
}

function summarize(job: Job) {
  const { input_artifact_key, artifact_key, evidence_json, verification_json, attempt_id, ...safe } = job;
  return { ...safe, has_input: !!input_artifact_key, has_result: !!artifact_key,
    verification: verification_json ? JSON.parse(verification_json) : null,
    evidence: evidence_json ? JSON.parse(evidence_json) : null };
}

function verificationMatches(report: any, digest: string, rows: DomainRow[]): boolean {
  if (!report || report.sha256 !== digest || report.structure_verified !== true ||
    report.business_reviewed !== false || report.domain_count !== rows.length ||
    !Array.isArray(report.per_domain) || report.per_domain.length !== rows.length) return false;
  let contacts = 0;
  const empty: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const v = report.per_domain[i];
    if (!v || v.domain !== rows[i].domain || v.company !== rows[i].company ||
      !Number.isSafeInteger(v.contact_rows) || v.contact_rows < 0 ||
      !Number.isSafeInteger(v.complete_contact_rows) || v.complete_contact_rows < 0 ||
      v.complete_contact_rows > v.contact_rows || typeof v.collection_status !== 'string' ||
      v.collection_status.length > 200 || v.needs_review !== (v.complete_contact_rows === 0)) return false;
    contacts += v.contact_rows;
    if (!v.complete_contact_rows) empty.push(v.domain);
  }
  return Number.isSafeInteger(report.total_contacts) && contacts === report.total_contacts &&
    report.all_domains_have_contacts === (empty.length === 0) &&
    JSON.stringify(report.zero_complete_contact_domains) === JSON.stringify(empty);
}

// The trusted Windows Agent checks the engine log and local files before signing off.
// Persist the evidence alongside the file fingerprints for subsequent human review.
function runEvidenceMatches(evidence: any, jobId: string, robot: string,
                            inputSha: string | null, resultSha: string): boolean {
  return !!evidence && evidence.mock === false && evidence.job_id === jobId &&
    evidence.robot_uuid === robot && evidence.input_sha256 === inputSha &&
    evidence.output_sha256 === resultSha && evidence.exit_code === 0 &&
    Number.isSafeInteger(evidence.pid) && evidence.pid > 0 &&
    typeof evidence.engine_id === 'string' && evidence.engine_id.length > 0 &&
    evidence.engine_id.length <= 200 &&
    evidence.run_log_tied_to_robot_uuid === true &&
    evidence.run_log_tied_to_copy_uuid !== true &&
    evidence.all_io_paths_isolated === true;
}

async function readXlsx(request: Request): Promise<ArrayBuffer> {
  const size = Number(request.headers.get('content-length'));
  if (size > MAX_ARTIFACT_BYTES) fail(413, 'artifact_too_large', 'Excel 文件超过 20 MB。');
  const reader = request.body?.getReader();
  if (!reader) fail(400, 'missing_artifact', '缺少 Excel 文件。');
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_ARTIFACT_BYTES) {
      await reader.cancel();
      fail(413, 'artifact_too_large', 'Excel 文件超过 20 MB。');
    }
    chunks.push(value);
  }
  if (!total) fail(422, 'invalid_xlsx', 'Excel 文件为空。');
  const data = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
  return data.buffer;
}

const rpa = new Hono<HonoEnv>();
rpa.onError(errorResponse);
// Match on the child routes, avoiding any dependence on Hono's mounted URL prefix.
rpa.use('/agent/*', async (c, next) => {
  const token = c.env.RPA_AGENT_TOKEN;
  if (!token || c.req.header('Authorization') !== `Bearer ${token}`)
    fail(401, 'agent_unauthorized', 'Agent 凭据无效。');
  await next();
});
const userAuth: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const { principal } = await authenticate(c.req.raw, c.env);
  c.set('principal', principal);
  await next();
};
rpa.use('/jobs', userAuth);
rpa.use('/jobs/*', userAuth);

rpa.post('/jobs', async c => {
  const p = c.get('principal');
  if (!writeBusiness(p)) fail(403, 'access_denied', '当前角色无法创建采集任务。');
  const body = await jsonBody(c.req.raw, 65_536);
  const data = body as Record<string, unknown>;
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail(400, 'invalid_input', '任务格式无效。');
  const id = data.id;
  if (typeof id !== 'string') fail(400, 'invalid_job_id', '请提供任务 ID。');
  ensureId(id);
  const robot = approvedRobot(c.env);
  if (data.robot_uuid !== undefined && data.robot_uuid !== robot)
    fail(400, 'robot_mismatch', '只能选择已审核的影刀机器人。');
  let rows: DomainRow[];
  try { rows = normalizeRows(data); }
  catch (error) { fail(400, 'invalid_domains', error instanceof Error ? error.message : '域名无效。'); }
  const serialized = JSON.stringify(rows);
  const now = Date.now();
  const result = await c.env.DB.prepare("INSERT INTO wr_rpa_jobs (id,workspace_id,created_by,robot_uuid,input_json,domain_count,status,created_at,updated_at) VALUES(?,?,?,?,?,?,'queued',?,?) ON CONFLICT(id) DO NOTHING")
    .bind(id, p.workspaceId, p.userId, robot, serialized, rows.length, now, now).run();
  const existing = await c.env.DB.prepare('SELECT workspace_id,created_by,input_json,robot_uuid FROM wr_rpa_jobs WHERE id=?')
    .bind(id).first<{ workspace_id: string; created_by: string; input_json: string; robot_uuid: string }>();
  if (!existing || existing.workspace_id !== p.workspaceId || existing.created_by !== p.userId ||
      existing.input_json !== serialized || existing.robot_uuid !== robot)
    fail(409, 'job_id_conflict', '该任务 ID 已被其他内容占用。');
  return c.json({ job: summarize((await one(c.env, id))!), created: result.meta.changes === 1 }, result.meta.changes === 1 ? 201 : 200);
});

rpa.get('/jobs', async c => {
  const p = c.get('principal');
  const status = c.req.query('status');
  const params: unknown[] = [p.workspaceId];
  let where = 'workspace_id=?';
  if (!viewTeamData(p)) { where += ' AND created_by=?'; params.push(p.userId); }
  if (status) {
    if (!['queued','claimed','running','unverified','awaiting_review','business_accepted','needs_reconciliation'].includes(status))
      fail(400, 'invalid_status', '任务状态无效。');
    where += ' AND status=?'; params.push(status);
  }
  const rows = await c.env.DB.prepare(`SELECT ${COLUMNS} FROM wr_rpa_jobs WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT 100`)
    .bind(...params).all<Job>();
  return c.json({ jobs: (rows.results || []).map(summarize) });
});

rpa.get('/jobs/:id', async c => {
  const job = await owned(c.env, c.req.param('id') ?? '', c.get('principal'));
  return c.json({ job: { ...summarize(job), verification_sha256: job.verification_json ? await sha256(job.verification_json) : null } });
});

async function download(c: Context<HonoEnv>, kind: 'input' | 'result') {
  const job = await owned(c.env, c.req.param('id') ?? '', c.get('principal'));
  const key = kind === 'input' ? job.input_artifact_key : job.artifact_key;
  if (!key) fail(404, 'artifact_missing', 'Excel 文件尚未生成。');
  const object = await c.env.MEDIA.get(key);
  if (!object) fail(404, 'artifact_missing', '文件尚未存储或已丢失。');
  return new Response(object.body, { headers: {
    'Content-Type': XLSX,
    'Content-Disposition': `attachment; filename="${job.id}-${kind}.xlsx"`,
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  } });
}
rpa.get('/jobs/:id/input-artifact', c => download(c, 'input'));
rpa.get('/jobs/:id/artifact', c => download(c, 'result'));

rpa.post('/jobs/:id/review', async c => {
  const job = await owned(c.env, c.req.param('id'), c.get('principal'), true);
  const body = await jsonBody(c.req.raw, 4096) as Record<string, unknown>;
  if (!body || body.business_reviewed !== true || body.technical_verified !== true ||
      typeof body.result_sha256 !== 'string' || !SHA.test(body.result_sha256) ||
      typeof body.verification_sha256 !== 'string' || !SHA.test(body.verification_sha256))
    fail(422, 'review_required', '需要人工核查和对应的结果文件、验证报告指纹。');
  if (job.status !== 'awaiting_review' || !job.artifact_key || !job.verification_json ||
      job.result_sha256 !== body.result_sha256 || await sha256(job.verification_json) !== body.verification_sha256)
    fail(409, 'review_conflict', '结果文件或验证报告与待复核任务不一致。');
  const result = await c.env.DB.prepare("UPDATE wr_rpa_jobs SET status='business_accepted',evidence_json=?,updated_at=? WHERE id=? AND workspace_id=? AND status='awaiting_review' AND verification_json=? AND result_sha256=?")
    .bind(JSON.stringify({ ...(job.evidence_json ? JSON.parse(job.evidence_json) : {}), technical_verified: true, business_reviewed: true, reviewer: c.get('principal').displayName, reviewer_id: c.get('principal').userId, verification_sha256: body.verification_sha256 }),
      Date.now(), job.id, job.workspace_id, job.verification_json, body.result_sha256).run();
  if (result.meta.changes !== 1) fail(409, 'review_conflict', '任务状态已发生变化。');
  return c.json({ accepted: true });
});

rpa.post('/jobs/:id/reconcile', async c => {
  const p = c.get('principal');
  const job = await owned(c.env, c.req.param('id'), p, true);
  if (!manageUsers(p)) fail(403, 'access_denied', '只有管理员可以关闭异常任务。');
  const body = await jsonBody(c.req.raw, 4096) as Record<string, unknown>;
  if (!body || body.engine_stopped !== true || body.execution_status_checked !== true ||
      typeof body.notes !== 'string' || !body.notes.trim() || body.notes.length > 500)
    fail(422, 'reconciliation_required', '须人工核查引擎已停止并填写对账记录。');
  const result = await c.env.DB.prepare("UPDATE wr_rpa_jobs SET status='unverified',lease_until=NULL,evidence_json=?,updated_at=? WHERE id=? AND workspace_id=? AND status='needs_reconciliation'")
    .bind(JSON.stringify({ ...(job.evidence_json ? JSON.parse(job.evidence_json) : {}), operator: p.displayName, operator_id: p.userId, engine_stopped: true, execution_status_checked: true, notes: body.notes.trim() }), Date.now(), job.id, job.workspace_id).run();
  if (result.meta.changes !== 1) fail(409, 'reconciliation_conflict', '任务尚未进入人工对账状态。');
  return c.json({ reconciled: true, status: 'unverified' });
});

rpa.post('/agent/claim', async c => {
  const data = await jsonBody(c.req.raw, 4096) as Record<string, unknown>;
  const robot = approvedRobot(c.env);
  if (!data || data.robot_uuid !== robot) fail(400, 'robot_mismatch', '未审核的影刀机器人。');
  const now = Date.now(), attempt = crypto.randomUUID();
  const row = await c.env.DB.prepare(
    "UPDATE wr_rpa_jobs SET status='claimed',attempt_id=?,lease_until=?,updated_at=? " +
    "WHERE id=(SELECT id FROM wr_rpa_jobs WHERE status='queued' AND robot_uuid=? ORDER BY created_at,id LIMIT 1) " +
    "AND status='queued' AND NOT EXISTS (SELECT 1 FROM wr_rpa_jobs WHERE robot_uuid=? AND status IN ('claimed','running','needs_reconciliation')) " +
    'RETURNING id,robot_uuid,status,attempt_id,lease_until')
    .bind(attempt, now + LEASE_MS, now, robot, robot).first();
  return c.json({ job: row || null });
});

// Agent operations are guarded by both a server-only token and an active, unique lease.
rpa.use('/agent/:id/*', async (c, next) => {
  ensureId(c.req.param('id'));
  const attempt = c.req.header('X-Attempt-Id');
  if (!attempt || !UUID.test(attempt)) fail(400, 'invalid_attempt', '缺少有效执行租约。');
  const job = await c.env.DB.prepare('SELECT status,attempt_id,lease_until FROM wr_rpa_jobs WHERE id=?')
    .bind(c.req.param('id')).first<{ status: string; attempt_id: string; lease_until: number }>();
  if (!job || job.attempt_id !== attempt || job.lease_until <= Date.now() ||
      !['claimed','running'].includes(job.status))
    fail(409, 'lease_lost', '执行租约无效或已过期，必须人工对账。');
  await next();
});

rpa.get('/agent/:id/input', async c => {
  const row = await c.env.DB.prepare('SELECT status,robot_uuid,input_json,domain_count FROM wr_rpa_jobs WHERE id=?')
    .bind(c.req.param('id')).first<{ status: string; robot_uuid: string; input_json: string; domain_count: number }>();
  if (!row || row.status !== 'claimed') fail(409, 'already_started', '任务已启动。');
  return c.json({ id: c.req.param('id'), robot_uuid: row.robot_uuid,
    domains: JSON.parse(row.input_json), domain_count: row.domain_count,
    workbook: 'input.xlsx', result_workbook: 'result.xlsx' });
});

rpa.post('/agent/:id/heartbeat', async c => {
  const id = c.req.param('id'), attempt = c.req.header('X-Attempt-Id'), now = Date.now();
  const updated = await c.env.DB.prepare("UPDATE wr_rpa_jobs SET lease_until=?,updated_at=? WHERE id=? AND attempt_id=? AND lease_until>? AND status IN ('claimed','running')")
    .bind(now + LEASE_MS, now, id, attempt, now).run();
  if (updated.meta.changes !== 1) fail(409, 'lease_lost', '租约已丢失。');
  return c.json({ lease_until: now + LEASE_MS });
});

rpa.post('/agent/:id/start', async c => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT input_sha256,input_artifact_key FROM wr_rpa_jobs WHERE id=?').bind(id)
    .first<{ input_sha256: string | null; input_artifact_key: string | null }>();
  if (!row?.input_sha256 || !row.input_artifact_key) fail(409, 'input_missing', '必须先上传 input.xlsx。');
  const updated = await c.env.DB.prepare("UPDATE wr_rpa_jobs SET status='running',updated_at=? WHERE id=? AND attempt_id=? AND lease_until>? AND status='claimed'")
    .bind(Date.now(), id, c.req.header('X-Attempt-Id'), Date.now()).run();
  if (updated.meta.changes !== 1) fail(409, 'invalid_stage', '任务启动状态无效。');
  return c.json({ started: true });
});

async function uploadXlsx(c: Context<HonoEnv>, kind: 'input' | 'result') {
  const isInput = kind === 'input';
  const id = c.req.param('id'), attempt = c.req.header('X-Attempt-Id');
  const row = await c.env.DB.prepare('SELECT status,input_sha256,result_sha256 FROM wr_rpa_jobs WHERE id=?').bind(id)
    .first<{ status: string; input_sha256: string | null; result_sha256: string | null }>();
  if (!row || row.status !== (isInput ? 'claimed' : 'running'))
    fail(409, 'invalid_stage', '当前任务状态不允许上传该文件。');
  const claimedSha = c.req.header('X-Sha256') || '';
  if (!SHA.test(claimedSha)) fail(400, 'invalid_sha', 'SHA256 指纹无效。');
  const data = await readXlsx(c.req.raw);
  if (!looksLikeXlsx(data)) fail(422, 'invalid_xlsx', 'Excel ZIP 工作簿结构无效。');
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))]
    .map(b => b.toString(16).padStart(2, '0')).join('');
  if (sha !== claimedSha) fail(422, 'hash_mismatch', 'Excel 指纹与请求不一致。');
  const previous = isInput ? row.input_sha256 : row.result_sha256;
  if (previous) {
    if (previous !== sha) fail(409, 'immutable_artifact', '已经上传的 Excel 不可覆盖。');
    // Reading the request can outlast the lease checked by the route middleware.
    const active = await c.env.DB.prepare("SELECT 1 AS active FROM wr_rpa_jobs WHERE id=? AND attempt_id=? AND lease_until>? AND status=?")
      .bind(id, attempt, Date.now(), isInput ? 'claimed' : 'running').first();
    if (!active) fail(409, 'lease_lost', '上传期间租约状态发生变化，需要人工对账。');
    return c.json({ uploaded: true, sha256: sha, kind, idempotent: true });
  }
  const key = `rpa/${id}/${attempt}/${kind}-${sha}.xlsx`;
  await c.env.MEDIA.put(key, data, { httpMetadata: { contentType: XLSX }, customMetadata: { sha256: sha } });
  const sql = isInput
    ? "UPDATE wr_rpa_jobs SET input_sha256=?,input_artifact_key=?,updated_at=? WHERE id=? AND attempt_id=? AND lease_until>? AND status='claimed' AND input_sha256 IS NULL"
    : "UPDATE wr_rpa_jobs SET result_sha256=?,artifact_key=?,updated_at=? WHERE id=? AND attempt_id=? AND lease_until>? AND status='running' AND result_sha256 IS NULL";
  // Recheck the lease at the D1 commit, after the request body and R2 write.
  const commitTime = Date.now();
  const updated = await c.env.DB.prepare(sql).bind(sha, key, commitTime, id, attempt, commitTime).run();
  if (updated.meta.changes !== 1) fail(409, 'lease_lost', '上传期间租约状态发生变化，需要人工对账。');
  return c.json({ uploaded: true, sha256: sha, kind });
}
rpa.put('/agent/:id/input-artifact', c => uploadXlsx(c, 'input'));
rpa.put('/agent/:id/artifact', c => uploadXlsx(c, 'result'));

rpa.post('/agent/:id/finish', async c => {
  const id = c.req.param('id');
  const body = await jsonBody(c.req.raw, 65_536) as Record<string, any>;
  if (!body || !['awaiting_review', 'unverified'].includes(body.status))
    fail(400, 'invalid_stage', '任务结束状态无效。');
  const row = await c.env.DB.prepare('SELECT status,robot_uuid,input_sha256,result_sha256,input_json FROM wr_rpa_jobs WHERE id=?').bind(id)
    .first<{ status: string; robot_uuid: string; input_sha256: string | null; result_sha256: string | null; input_json: string }>();
  if (!row || (body.status === 'awaiting_review' && (row.status !== 'running' || !row.result_sha256 ||
      body.technical_verified !== true || body.business_reviewed !== false ||
      row.result_sha256 !== body.result_sha256 ||
      !verificationMatches(body.verification, row.result_sha256, JSON.parse(row.input_json)) ||
      !runEvidenceMatches(body.run_evidence, id, row.robot_uuid, row.input_sha256, row.result_sha256))))
    fail(422, 'verification_failed', '结果缺少对应的 XLSX 校验摘要。');
  const updated = await c.env.DB.prepare("UPDATE wr_rpa_jobs SET status=?,evidence_json=?,verification_json=?,lease_until=NULL,updated_at=? WHERE id=? AND attempt_id=? AND lease_until>? AND status IN ('claimed','running')")
    .bind(body.status, JSON.stringify({ technical_verified: body.technical_verified === true,
      business_reviewed: false, reason: String(body.reason || '').slice(0, 250),
      ...(body.status === 'awaiting_review' ? { execution: body.run_evidence } : {}) }),
      body.status === 'awaiting_review' ? JSON.stringify(body.verification) : null,
      Date.now(), id, c.req.header('X-Attempt-Id'), Date.now()).run();
  if (updated.meta.changes !== 1) fail(409, 'lease_lost', '提交期间租约已丢失。');
  return c.json({ finalized: true, status: body.status });
});

// The production Worker scheduled handler calls this every five minutes.
export async function sweepExpiredRpaJobs(env: AppEnv): Promise<void> {
  await env.DB.prepare("UPDATE wr_rpa_jobs SET status='needs_reconciliation',updated_at=? WHERE status IN ('claimed','running') AND lease_until<?")
    .bind(Date.now(), Date.now()).run();
}

export default rpa;
