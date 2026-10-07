import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../../shared/types';
import type { AssistantDraft, AssistantMessage, AssistantOperation, AssistantOptions, AssistantSessionSummary } from '../../shared/assistant';
import { requireAuth } from '../middleware/auth';
import { createDb } from '../../db';
import { loadProviders } from '../lib/credentials';
import { resolveSenderDomains } from '../lib/sender-domains';
import { AssistantError, beginRequest, draftPatchSchema, emptyDraft, ensureContent, failRequest, finishRequest, mergeDraft, message, presentSession, requestHash, requestSchema, sessionRow, type AssistantUser, type SessionRow } from '../lib/assistant';
import { assistantAiConfigured, generateAssistantDraft } from '../lib/assistant-ai';
import { assistantEmailReport, assistantResults, dispatchOperations, ensureSendingConfigured, materializeOperations, verifyRetrySnapshot } from '../lib/assistant-execution';
import { safeAssistantHtml } from '../lib/assistant-content';

export const assistantRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();
assistantRoutes.use('*', requireAuth);
assistantRoutes.use('*', async (c, next) => {
  if (!['GET', 'HEAD'].includes(c.req.method) && !['owner', 'admin', 'member'].includes(c.get('user')!.role))
    return c.json({ success: false, error: '当前角色仅可查看会话，不能修改或发送。', code: 'read_only_role' }, 403);
  await next();
});
assistantRoutes.onError((error, c) => error instanceof AssistantError
  ? c.json({ success: false, code: error.code, error: error.message }, error.status)
  : c.json({ success: false, code: 'assistant_unavailable', error: '会话操作未完成，请刷新查看已保存的状态后重试。' }, 503));

async function audienceOptions(env: Bindings, user: AssistantUser) {
  const groups = await env.DB.prepare("SELECT g.id,g.name,(SELECT count(*) FROM edm_contacts c WHERE c.group_id=g.id AND c.user_id=? AND c.subscription_status='subscribed') contactCount FROM edm_contact_groups g WHERE user_id=? ORDER BY name").bind(user.id, user.id).all<AssistantOptions['groups'][number]>();
  const ungrouped = await env.DB.prepare("SELECT count(*) n FROM edm_contacts WHERE user_id=? AND group_id IS NULL AND subscription_status='subscribed'").bind(user.id).first<{ n: number }>();
  const tags = await env.DB.prepare("SELECT DISTINCT CAST(j.value AS TEXT) tag FROM edm_contacts c,json_each(CASE WHEN json_valid(c.tags) THEN c.tags ELSE '[]' END) j WHERE c.user_id=? ORDER BY tag LIMIT 500").bind(user.id).all<{ tag: string }>();
  return { groups: [{ id: 'null', name: '未分组联系人', contactCount: ungrouped?.n || 0 }, ...groups.results], tags: tags.results.map(row => row.tag) };
}
async function replyTrackingOptions(env: Bindings, workspaceId: string): Promise<AssistantOptions['replyTracking']> {
  const inbox = await env.DB.prepare('SELECT track_edm,track_sites FROM wr_inbox_configs WHERE workspace_id=? AND enabled=1 AND verified_at IS NOT NULL LIMIT 1').bind(workspaceId).first<{ track_edm: number; track_sites: number }>();
  return { enabled: !!inbox, email: !!inbox?.track_edm, site: !!inbox?.track_sites };
}
async function ensureReplyTracking(env: Bindings, workspaceId: string, draft: AssistantDraft, channels: AssistantDraft['channels']) {
  const tracking = await replyTrackingOptions(env, workspaceId);
  if (channels.some(channel => draft[channel].replyTracking && !tracking[channel]))
    throw new AssistantError(400, 'reply_tracking_unavailable', '所选渠道的回复追踪尚未启用或验证，请在资料卡关闭该选项，或请管理员完成配置。');
}
assistantRoutes.get('/options', async c => {
  const user = c.get('user')!, audience = await audienceOptions(c.env, user);
  const search = (c.req.query('search') || '').slice(0, 200);
  const contacts = await c.env.DB.prepare("SELECT id,email,COALESCE(name,'') name,COALESCE(company,'') company FROM edm_contacts WHERE user_id=? AND subscription_status='subscribed' AND (email LIKE ? OR name LIKE ? OR company LIKE ?) ORDER BY email LIMIT 100")
    .bind(user.id, '%' + search + '%', '%' + search + '%', '%' + search + '%').all<AssistantOptions['contacts'][number]>();
  const providers = await loadProviders(createDb(c.env.DB), c.env, user.id);
  const domains = await resolveSenderDomains(providers);
  const options: AssistantOptions = { ...audience, contacts: contacts.results,
    senderDomains: domains.domains.map(({ domain, providerName }) => ({ domain, providerName, verified: true })),
    replyTracking: await replyTrackingOptions(c.env, user.id), aiConfigured: await assistantAiConfigured(c.env, user.id), testMode: c.env.TEST_MODE };
  return c.json({ success: true, data: options });
});
assistantRoutes.get('/sessions', async c => {
  const user = c.get('user')!;
  const rows = await c.env.DB.prepare(`SELECT * FROM edm_assistant_sessions WHERE user_id=? ${user.teamRead ? '' : 'AND created_by=?'} ORDER BY updated_at DESC LIMIT 100`)
    .bind(user.id, ...(user.teamRead ? [] : [user.actorId || user.id])).all<SessionRow>();
  const data: AssistantSessionSummary[] = await Promise.all(rows.results.map(async row => {
    const session = await presentSession(c.env.DB, user, row, true);
    return { id: row.id, title: row.title, version: row.version, status: session.status,
      channels: session.draft.channels, createdAt: row.created_at, updatedAt: row.updated_at };
  }));
  return c.json({ success: true, data });
});
assistantRoutes.post('/sessions', async c => {
  const parsed = z.strictObject({ requestId: z.string().min(1).max(100), channels: z.array(z.enum(['email', 'site'])).max(2).optional() }).safeParse(await c.req.json());
  if (!parsed.success) throw new AssistantError(400, 'invalid_request', '会话请求格式无效。');
  const user = c.get('user')!, actor = user.actorId || user.id, now = new Date().toISOString(), id = crypto.randomUUID();
  const draft = emptyDraft(parsed.data.channels), tracking = await replyTrackingOptions(c.env, user.id);
  draft.email.replyTracking = tracking.email; draft.site.replyTracking = tracking.site;
  const createHash = await requestHash('create', { channels: draft.channels });
  await c.env.DB.batch([c.env.DB.prepare('INSERT OR IGNORE INTO edm_assistant_sessions(id,user_id,created_by,create_request_id,title,draft,messages,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)')
    .bind(id, user.id, actor, parsed.data.requestId, '新的外联会话', JSON.stringify(draft),
      JSON.stringify([message('assistant', '我们一步一步准备。先选择要联系的客户或目标网站，资料和内容可以随时返回修改，最后由你确认发送。')]), now, now),
    c.env.DB.prepare("INSERT OR IGNORE INTO edm_assistant_requests(session_id,request_id,request_hash,kind,status,created_at) SELECT id,'__create__',?,'create','done',? FROM edm_assistant_sessions WHERE user_id=? AND created_by=? AND create_request_id=?")
      .bind(createHash, now, user.id, actor, parsed.data.requestId),
  ]);
  const row = await c.env.DB.prepare('SELECT * FROM edm_assistant_sessions WHERE user_id=? AND created_by=? AND create_request_id=?').bind(user.id, actor, parsed.data.requestId).first<SessionRow>();
  const receipt = await c.env.DB.prepare("SELECT request_hash FROM edm_assistant_requests WHERE session_id=? AND request_id='__create__'").bind(row!.id).first<{ request_hash: string }>();
  if (receipt?.request_hash !== createHash) throw new AssistantError(409, 'request_changed', '同一新会话请求编号不能提交不同渠道。');
  return c.json({ success: true, data: await presentSession(c.env.DB, user, row!) }, row!.id === id ? 201 : 200);
});

async function recoverStaleRequest(env: Bindings, user: AssistantUser, id: string) {
  let row = await sessionRow(env.DB, user, id);
  if (row.pending_request_id && row.pending_since && Date.now() - row.pending_since > 120000) {
    const operations = JSON.parse(row.operations) as AssistantOperation[];
    for (const op of operations) {
      if (op.status === 'dispatching') { op.status = 'uncertain'; op.retryable = false; op.error = '上次提交连接中断，请查看原任务；不会自动重复发送。'; }
      else if (op.status === 'prepared') op.retryable = true;
    }
    await env.DB.batch([
      env.DB.prepare('UPDATE edm_assistant_sessions SET operations=?,pending_request_id=NULL,pending_since=NULL,version=version+1 WHERE id=? AND pending_request_id=? AND pending_since=?').bind(JSON.stringify(operations), row.id, row.pending_request_id, row.pending_since),
      env.DB.prepare("UPDATE edm_assistant_requests SET status='failed' WHERE session_id=? AND request_id=? AND status='processing'").bind(row.id, row.pending_request_id),
    ]);
    row = await sessionRow(env.DB, user, id);
  }
  return row;
}
assistantRoutes.get('/sessions/:id', async c => {
  const user = c.get('user')!, row = await recoverStaleRequest(c.env, user, c.req.param('id'));
  return c.json({ success: true, data: await presentSession(c.env.DB, user, row) });
});
assistantRoutes.get('/sessions/:id/results', async c => {
  const user = c.get('user')!, row = await recoverStaleRequest(c.env, user, c.req.param('id'));
  return c.json({ success: true, data: await assistantResults(c.env, user, row) });
});
assistantRoutes.get('/sessions/:id/email/export', async c => {
  const row = await sessionRow(c.env.DB, c.get('user')!, c.req.param('id'));
  return new Response(await assistantEmailReport(c.env, row), { headers: { 'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="outreach-email-report.csv"', 'Cache-Control': 'no-store' } });
});

function preserveConfirmedChannels(draft: AssistantDraft, previous: AssistantDraft, operations: AssistantOperation[]) {
  for (const operation of operations) {
    if (operation.channel === 'email') draft.email = previous.email;
    else draft.site = previous.site;
    if (!draft.channels.includes(operation.channel)) draft.channels.push(operation.channel);
  }
  return draft;
}
assistantRoutes.patch('/sessions/:id/draft', async c => {
  const parsed = requestSchema.extend({ draft: draftPatchSchema }).strict().safeParse(await c.req.json());
  if (!parsed.success) throw new AssistantError(400, 'invalid_request', '草稿请求格式无效。');
  const body = parsed.data, user = c.get('user')!, row = await recoverStaleRequest(c.env, user, c.req.param('id'));
  const hash = await requestHash('draft', body);
  if (!await beginRequest(c.env.DB, row, body.requestId, body.expectedVersion, hash, 'draft')) return c.json({ success: true, data: await presentSession(c.env.DB, user, row) });
  try {
    const previous = JSON.parse(row.draft) as AssistantDraft, operations = JSON.parse(row.operations) as AssistantOperation[];
    let draft = mergeDraft(previous, body.draft);
    if (body.draft.email?.bodyHtml) draft.email.bodyHtml = safeAssistantHtml(draft.email.bodyHtml);
    draft = preserveConfirmedChannels(draft, previous, operations);
    ensureContent(draft);
    await finishRequest(c.env.DB, row, body.requestId, draft, JSON.parse(row.messages), operations);
  } catch (error) { await failRequest(c.env.DB, row, body.requestId); throw error; }
  return c.json({ success: true, data: await presentSession(c.env.DB, user, await sessionRow(c.env.DB, user, row.id)) });
});
assistantRoutes.post('/sessions/:id/messages', async c => {
  const parsed = requestSchema.extend({ message: z.string().trim().min(1).max(12000) }).strict().safeParse(await c.req.json());
  if (!parsed.success) throw new AssistantError(400, 'invalid_request', '请输入 1–12000 字的对话内容。');
  const body = parsed.data, user = c.get('user')!, row = await recoverStaleRequest(c.env, user, c.req.param('id'));
  if (!await beginRequest(c.env.DB, row, body.requestId, body.expectedVersion, await requestHash('message', body), 'message')) return c.json({ success: true, data: await presentSession(c.env.DB, user, row) });
  try {
    const previous = JSON.parse(row.draft) as AssistantDraft, messages = JSON.parse(row.messages) as AssistantMessage[], operations = JSON.parse(row.operations) as AssistantOperation[];
    const result = await generateAssistantDraft(c.env, user.id, previous, messages, body.message, await audienceOptions(c.env, user));
    const draft = preserveConfirmedChannels(result.draft, previous, operations);
    ensureContent(draft);
    await finishRequest(c.env.DB, row, body.requestId, draft, [...messages, message('user', body.message), message('assistant', result.content)], operations,
      row.title === '新的外联会话' ? body.message.slice(0, 40) : row.title);
  } catch (error) { await failRequest(c.env.DB, row, body.requestId); throw error; }
  return c.json({ success: true, data: await presentSession(c.env.DB, user, await sessionRow(c.env.DB, user, row.id)) });
});
assistantRoutes.post('/sessions/:id/confirm', async c => {
  const parsed = requestSchema.extend({ confirmationToken: z.string().min(1).max(100), siteAuthorized: z.boolean().optional() }).strict().safeParse(await c.req.json());
  if (!parsed.success) throw new AssistantError(400, 'invalid_confirmation', '请在预览当前收件对象与内容后确认。');
  const body = parsed.data, user = c.get('user')!, row = await recoverStaleRequest(c.env, user, c.req.param('id'));
  const session = await presentSession(c.env.DB, user, row), hash = await requestHash('confirm', body);
  const previous = await c.env.DB.prepare('SELECT request_hash,status FROM edm_assistant_requests WHERE session_id=? AND request_id=?').bind(row.id, body.requestId).first<{ request_hash: string; status: string }>();
  if (previous?.request_hash === hash) return c.json({ success: true, data: session });
  if (!session.confirmationToken || session.confirmationToken !== body.confirmationToken || session.version !== body.expectedVersion)
    throw new AssistantError(409, 'confirmation_changed', '收件对象或内容已变化，请重新预览确认。');
  if (session.pendingChannels.includes('site') && body.siteAuthorized !== true) throw new AssistantError(400, 'site_authorization_required', '请确认目标网站允许提交业务咨询。');
  ensureContent(session.draft);
  ensureSendingConfigured(c.env, session.pendingChannels);
  await ensureReplyTracking(c.env, user.id, session.draft, session.pendingChannels);
  if (!await beginRequest(c.env.DB, row, body.requestId, body.expectedVersion, hash, 'confirm')) return c.json({ success: true, data: session });
  try {
    const claimedRow = { ...row, pending_request_id: body.requestId };
    const operations = await materializeOperations(c.env, user, claimedRow, session);
    await dispatchOperations(c.env, user, claimedRow, operations, session.pendingChannels);
    await finishRequest(c.env.DB, row, body.requestId, session.draft, [...session.messages, message('user', '已确认当前收件对象及内容，开始执行。'),
      message('assistant', operations.some(op => ['failed', 'uncertain'].includes(op.status)) ? '部分任务需要处理，请查看下面的真实任务状态。已提交的渠道不会重复执行。' : '已提交任务，请在结果卡查看实际执行进度和下载记录。')], operations);
  } catch (error) { await failRequest(c.env.DB, row, body.requestId); throw error; }
  return c.json({ success: true, data: await presentSession(c.env.DB, user, await sessionRow(c.env.DB, user, row.id)) });
});
assistantRoutes.post('/sessions/:id/retry', async c => {
  const parsed = requestSchema.extend({ channel: z.enum(['email', 'site']) }).strict().safeParse(await c.req.json());
  if (!parsed.success) throw new AssistantError(400, 'invalid_retry', '重试请求格式无效。');
  const body = parsed.data, user = c.get('user')!, row = await recoverStaleRequest(c.env, user, c.req.param('id'));
  const hash = await requestHash('retry', body);
  const previous = await c.env.DB.prepare('SELECT request_hash FROM edm_assistant_requests WHERE session_id=? AND request_id=?').bind(row.id, body.requestId).first<{ request_hash: string }>();
  if (previous?.request_hash === hash) return c.json({ success: true, data: await presentSession(c.env.DB, user, row) });
  const operations = JSON.parse(row.operations) as AssistantOperation[], operation = operations.find(op => op.channel === body.channel);
  if (!operation?.retryable || !['prepared', 'failed'].includes(operation.status)) throw new AssistantError(409, 'retry_not_safe', '该渠道已提交或结果未确认，只能查看原任务状态，不能自动重发。');
  ensureSendingConfigured(c.env, [body.channel]);
  await ensureReplyTracking(c.env, user.id, JSON.parse(row.draft), [body.channel]);
  await verifyRetrySnapshot(c.env, row, operation);
  if (!await beginRequest(c.env.DB, row, body.requestId, body.expectedVersion, hash, 'retry')) return c.json({ success: true, data: await presentSession(c.env.DB, user, row) });
  try {
    operation.status = 'prepared';
    await dispatchOperations(c.env, user, { ...row, pending_request_id: body.requestId }, operations, [body.channel]);
    await finishRequest(c.env.DB, row, body.requestId, JSON.parse(row.draft), [...JSON.parse(row.messages), message('user', `重试原${body.channel === 'email' ? '邮件' : '网站留言'}任务。`),
      message('assistant', operations.find(op => op.channel === body.channel)?.status === 'submitted' ? '已提交原任务，请查看实际执行进度。' : '原任务尚未完成，请查看结果卡中的原因。')], operations);
  } catch (error) { await failRequest(c.env.DB, row, body.requestId); throw error; }
  return c.json({ success: true, data: await presentSession(c.env.DB, user, await sessionRow(c.env.DB, user, row.id)) });
});
