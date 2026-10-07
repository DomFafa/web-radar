import { z } from 'zod';
import type { AssistantChannel, AssistantDraft, AssistantDraftingStatus, AssistantDraftPatch, AssistantField, AssistantMessage, AssistantOperation, AssistantPreview, AssistantRecipient, AssistantSession } from '../../shared/assistant';
import type { Bindings, Variables } from '../../shared/types';
import { normalizeSiteTargets } from '../../shared/site-targets';
import { sha256 } from '../../../worker/http';
import { findBlockedEmailTerms } from '../../shared/email-content-policy';

export type AssistantUser = NonNullable<Variables['user']>;
export class AssistantError extends Error {
  constructor(public status: 400 | 403 | 404 | 409 | 503, public code: string, message: string) { super(message); }
}
export interface SessionRow {
  id: string; user_id: string; created_by: string; title: string; version: number;
  draft: string; messages: string; operations: string; pending_request_id: string | null;
  pending_since: number | null; created_at: string; updated_at: string;
}
const text = (max = 1000) => z.string().max(max);
const senderSchema = z.strictObject({ name: text(200), email: text(320), company: text(300), phone: text(100), address: text(), country: text(100), city: text(100) });
const emailSchema = z.strictObject({ subject: text(500), bodyHtml: text(50000), bodyText: text(20000),
  contactIds: z.array(text(100)).max(15000), groupId: text(100), tag: text(200), replyTo: text(320),
  replyTracking: z.boolean(), sendRate: z.number().int().min(1).max(200) });
const siteSchema = z.strictObject({ subject: text(500), message: text(5000), targets: z.array(text(2048)).max(1000), replyTracking: z.boolean() });
export const draftPatchSchema = z.strictObject({ channels: z.array(z.enum(['email', 'site'])).max(2), brief: text(12000), language: z.enum(['en', 'zh']),
  sender: senderSchema.partial(), email: emailSchema.partial(), site: siteSchema.partial() }).partial();
export const requestSchema = z.object({ requestId: z.string().min(1).max(100), expectedVersion: z.number().int().positive() });
export function emptyDraft(channels: AssistantDraft['channels'] = []): AssistantDraft {
  return { channels: [...new Set(channels)], brief: '', language: 'en',
    sender: { name: '', email: '', company: '', phone: '', address: '', country: '', city: '' },
    email: { subject: '', bodyHtml: '', bodyText: '', contactIds: [], groupId: '', tag: '', replyTo: '', replyTracking: false, sendRate: 50 },
    site: { subject: '', message: '', targets: [], replyTracking: false } };
}
export function mergeDraft(current: AssistantDraft, patch: AssistantDraftPatch): AssistantDraft {
  const parsed = draftPatchSchema.safeParse(patch);
  if (!parsed.success) throw new AssistantError(400, 'invalid_draft', '草稿字段或长度不正确，请检查输入。');
  const changedChannels = parsed.data.channels
    ? (['email', 'site'] as const).filter(channel => current.channels.includes(channel) !== parsed.data.channels!.includes(channel))
    : [];
  const defaults = emptyDraft();
  // Changing channels starts its audience and content afresh; only explicitly supplied fields carry over.
  const email = changedChannels.includes('email')
    ? { ...defaults.email, replyTo: current.email.replyTo, replyTracking: current.email.replyTracking, sendRate: current.email.sendRate }
    : current.email;
  const site = changedChannels.includes('site')
    ? { ...defaults.site, replyTracking: current.site.replyTracking }
    : current.site;
  const draft = { ...current, ...parsed.data, sender: { ...current.sender, ...parsed.data.sender },
    email: { ...email, ...parsed.data.email }, site: { ...site, ...parsed.data.site } };
  if (changedChannels.length && parsed.data.brief === undefined) draft.brief = '';
  draft.channels = [...new Set(draft.channels)];
  draft.email.contactIds = [...new Set(draft.email.contactIds)];
  // Switching recipient source replaces the previous selection instead of silently preferring it.
  if (parsed.data.email?.contactIds?.length) { draft.email.groupId = ''; draft.email.tag = ''; }
  else if (parsed.data.email?.groupId) { draft.email.contactIds = []; draft.email.tag = ''; }
  else if (parsed.data.email?.tag) { draft.email.contactIds = []; draft.email.groupId = ''; }
  if (parsed.data.email && (['subject', 'bodyHtml', 'bodyText'] as const).some(key =>
    parsed.data.email![key] !== undefined && parsed.data.email![key] !== current.email[key])) delete draft.email.templateId;
  return draft;
}
export function hasCompleteAssistantContent(draft: AssistantDraftPatch, channel: AssistantChannel): boolean {
  if (channel === 'site') return !!draft.site?.message && draft.site.message.trim().length >= 10 && draft.site.message.length <= 5000;
  const html = draft.email?.bodyHtml || '';
  return !!draft.email?.subject?.trim() && !!html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;|&#x0*a0;/gi, ' ').trim();
}
export async function sessionRow(db: D1Database, user: AssistantUser, id: string): Promise<SessionRow> {
  const row = await db.prepare(`SELECT * FROM edm_assistant_sessions WHERE id=? AND user_id=? ${user.teamRead ? '' : 'AND created_by=?'}`)
    .bind(id, user.id, ...(user.teamRead ? [] : [user.actorId || user.id])).first<SessionRow>();
  if (!row) throw new AssistantError(404, 'session_not_found', '会话不存在。');
  return row;
}
export async function previewDraft(db: D1Database, user: AssistantUser, draft: AssistantDraft, countOnly = false): Promise<AssistantPreview> {
  let recipients: AssistantRecipient[] = [];
  let recipientCount = 0;
  if (draft.channels.includes('email')) {
    let filter = '0', value = '';
    if (draft.email.contactIds.length) { filter = 'id IN (SELECT value FROM json_each(?))'; value = JSON.stringify(draft.email.contactIds); }
    else if (draft.email.groupId) { filter = draft.email.groupId === 'null' ? 'group_id IS NULL' : 'group_id=?'; value = draft.email.groupId; }
    else if (draft.email.tag) { filter = "EXISTS(SELECT 1 FROM json_each(CASE WHEN json_valid(tags) THEN tags ELSE '[]' END) WHERE value=?)"; value = draft.email.tag; }
    if (countOnly) {
      const count = await db.prepare(`SELECT count(*) n FROM edm_contacts WHERE user_id=? AND subscription_status='subscribed' AND ${filter}`)
        .bind(user.id, ...(filter.includes('?') ? [value] : [])).first<{ n: number }>();
      recipientCount = count?.n || 0;
    } else {
      const rows = await db.prepare(`SELECT id,email,COALESCE(name,'') name,COALESCE(company,'') company,COALESCE(industry,'') industry FROM edm_contacts WHERE user_id=? AND subscription_status='subscribed' AND ${filter} ORDER BY id LIMIT 15001`)
      .bind(user.id, ...(filter.includes('?') ? [value] : [])).all<AssistantRecipient>();
      recipients = rows.results;
      recipientCount = recipients.length;
      if (recipients.length > 15000) throw new AssistantError(400, 'too_many_recipients', '一次最多选择 15000 位联系人，请缩小分组。');
    }
  }
  const sites = normalizeSiteTargets(draft.site.targets);
  return { email: { recipients, count: recipientCount }, site: { targets: [...sites.normalized.values()].map(v => v.url),
    count: sites.normalized.size, invalid: sites.invalid, duplicates: sites.duplicates } };
}
export function missingFields(draft: AssistantDraft, preview: AssistantPreview, pendingChannels: AssistantDraft['channels']): AssistantField[] {
  const fields: AssistantField[] = [];
  if (!draft.channels.length) fields.push({ key: 'channels', label: '选择邮件或网站留言', type: 'channels' });
  if (pendingChannels.length) {
    if (!draft.sender.name.trim()) fields.push({ key: 'sender.name', label: '发件人姓名', type: 'text' });
    if (!z.email().safeParse(draft.sender.email).success) fields.push({ key: 'sender.email', label: '发件人邮箱', type: 'email' });
  }
  if (pendingChannels.includes('email')) {
    if (!preview.email.count || preview.email.count > 15000) fields.push({ key: 'email.audience', label: '选择收件联系人（最多 15000 人）', type: 'contacts', channel: 'email' });
    if (!draft.email.subject.trim() || !draft.email.bodyHtml.trim()) fields.push({ key: 'email.content', label: '邮件主题与正文', type: 'content', channel: 'email' });
  }
  if (pendingChannels.includes('site')) {
    if (!preview.site.count || preview.site.count > 500 || preview.site.invalid.length) fields.push({ key: 'site.targets', label: '填写有效的目标网站（最多 500 个域名）', type: 'websites', channel: 'site' });
    if (draft.site.message.trim().length < 10) fields.push({ key: 'site.content', label: '留言内容（至少 10 个字符）', type: 'content', channel: 'site' });
  }
  return fields;
}
export async function presentSession(db: D1Database, user: AssistantUser, row: SessionRow, countOnly = false): Promise<AssistantSession> {
  const draft = JSON.parse(row.draft) as AssistantDraft, operations = JSON.parse(row.operations) as AssistantOperation[];
  const messages = JSON.parse(row.messages) as AssistantMessage[];
  const draftingStates: Partial<Record<AssistantChannel, AssistantDraftingStatus>> = {};
  for (const item of messages) if (item.role === 'assistant' && item.draftingStatus)
    for (const channel of item.draftingChannels || []) draftingStates[channel] = item.draftingStatus;
  const pendingChannels = draft.channels.filter(channel => !operations.some(op => op.channel === channel));
  const preview = await previewDraft(db, user, draft, countOnly), fields = missingFields(draft, preview, pendingChannels);
  if (pendingChannels.some(channel => draftingStates[channel] === 'needs_facts'))
    fields.push({ key: 'content.requirements', label: '补充本次内容所需的业务资料', type: 'content' });
  const confirmationToken = !countOnly && pendingChannels.length && !fields.length && !row.pending_request_id
    ? await sha256(JSON.stringify({ id: row.id, version: row.version, draft, preview, pendingChannels })) : null;
  const status = row.pending_request_id || operations.some(op => op.status === 'dispatching') ? 'dispatching'
    : operations.some(op => ['failed', 'uncertain'].includes(op.status)) ? 'needs_attention'
      : pendingChannels.length ? fields.length ? 'draft' : 'ready' : operations.length ? 'submitted' : 'draft';
  return { id: row.id, title: row.title, version: row.version, status, draft, operations,
    messages, draftingStates, pendingChannels, missingFields: fields, preview, confirmationToken,
    createdAt: row.created_at, updatedAt: row.updated_at };
}
export function ensureContent(draft: AssistantDraft) {
  if (draft.channels.includes('email') && findBlockedEmailTerms(draft.email.subject, draft.email.bodyHtml, draft.email.bodyText).length)
    throw new AssistantError(400, 'blocked_content', '邮件内容包含不支持的词语，请先修改内容。');
  if (draft.email.replyTo && !z.email().safeParse(draft.email.replyTo).success)
    throw new AssistantError(400, 'invalid_reply_to', '回复邮箱格式不正确。');
}
export function message(role: AssistantMessage['role'], content: string): AssistantMessage {
  return { id: crypto.randomUUID(), role, content, createdAt: new Date().toISOString() };
}
export async function requestHash(kind: string, body: unknown) { return sha256(JSON.stringify({ kind, body })); }
export async function beginRequest(db: D1Database, row: SessionRow, requestId: string, expectedVersion: number, hash: string, kind: string): Promise<boolean> {
  const previous = await db.prepare('SELECT request_hash,status FROM edm_assistant_requests WHERE session_id=? AND request_id=?').bind(row.id, requestId).first<{ request_hash: string; status: string }>();
  if (previous) {
    if (previous.request_hash !== hash) throw new AssistantError(409, 'request_changed', '同一请求编号不能提交不同内容。');
    if (previous.status === 'done') return false;
    throw new AssistantError(409, 'request_in_progress', previous.status === 'failed' ? '上次请求未完成，请刷新后使用新的请求编号重试。' : '请求仍在处理中，请刷新会话查看结果。');
  }
  const claimed = await db.prepare('UPDATE edm_assistant_sessions SET pending_request_id=?,pending_since=? WHERE id=? AND version=? AND pending_request_id IS NULL RETURNING id')
    .bind(requestId, Date.now(), row.id, expectedVersion).first();
  if (!claimed) throw new AssistantError(409, 'version_conflict', '会话已更新或正在处理，请刷新后重试。');
  await db.prepare('INSERT INTO edm_assistant_requests(session_id,request_id,request_hash,kind,status,created_at) VALUES(?,?,?,?,?,?)')
    .bind(row.id, requestId, hash, kind, 'processing', new Date().toISOString()).run();
  return true;
}
export async function finishRequest(db: D1Database, row: SessionRow, requestId: string, draft: AssistantDraft, messages: AssistantMessage[], operations: AssistantOperation[], title = row.title) {
  const draftJson = JSON.stringify(draft), messagesJson = JSON.stringify(messages), operationsJson = JSON.stringify(operations);
  if (new TextEncoder().encode(draftJson + messagesJson + operationsJson + title).byteLength > 1800000)
    throw new AssistantError(400, 'session_full', '会话已很长，请新建会话继续。原有内容已保留。');
  await db.batch([
    db.prepare('UPDATE edm_assistant_sessions SET draft=?,messages=?,operations=?,title=?,version=version+1,pending_request_id=NULL,pending_since=NULL,updated_at=? WHERE id=? AND pending_request_id=?')
      .bind(draftJson, messagesJson, operationsJson, title, new Date().toISOString(), row.id, requestId),
    db.prepare("UPDATE edm_assistant_requests SET status='done' WHERE session_id=? AND request_id=?").bind(row.id, requestId),
  ]);
}
export async function failRequest(db: D1Database, row: SessionRow, requestId: string) {
  const current = await db.prepare('SELECT operations FROM edm_assistant_sessions WHERE id=? AND pending_request_id=?')
    .bind(row.id, requestId).first<{ operations: string }>();
  if (!current) return;
  const operations = (JSON.parse(current.operations) as AssistantOperation[]).map(operation =>
    operation.status === 'dispatching' ? { ...operation, status: 'uncertain' as const, retryable: false, error: '提交结果尚未确认，请查看原任务状态，避免重复发送。' }
      : operation.status === 'prepared' ? { ...operation, retryable: true } : operation);
  await db.batch([
    db.prepare('UPDATE edm_assistant_sessions SET operations=?,pending_request_id=NULL,pending_since=NULL WHERE id=? AND pending_request_id=?').bind(JSON.stringify(operations), row.id, requestId),
    db.prepare("UPDATE edm_assistant_requests SET status='failed' WHERE session_id=? AND request_id=? AND status='processing'").bind(row.id, requestId),
  ]);
}
