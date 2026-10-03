import { Hono } from 'hono';
import type { AssistantChannel, AssistantDraft, AssistantOperation, AssistantRecipient, AssistantResults, AssistantSession } from '../../shared/assistant';
import type { Bindings, Variables } from '../../shared/types';
import { campaignRoutes } from '../routes/campaign.routes';
import { siteMessageRoutes } from '../routes/site-message.routes';
import { AssistantError, type AssistantUser, type SessionRow } from './assistant';
import { buildCampaignReport } from './campaign-report';

interface Snapshot { draft: AssistantDraft; recipients: (AssistantRecipient & { recipientId: string })[]; targets: string[] }
export async function materializeOperations(env: Bindings, user: AssistantUser, row: SessionRow, session: AssistantSession): Promise<AssistantOperation[]> {
  const operations = [...session.operations], statements: D1PreparedStatement[] = [], now = Math.floor(Date.now() / 1000);
  for (const channel of session.pendingChannels) {
    const taskId = crypto.randomUUID(), name = `${session.title} · ${channel === 'email' ? '邮件' : '网站留言'}`;
    const snapshot: Snapshot = { draft: session.draft, recipients: session.preview.email.recipients.map(recipient => ({ ...recipient, recipientId: crypto.randomUUID() })), targets: session.preview.site.targets };
    const sender = snapshot.draft.sender;
    if (channel === 'email') {
      const templateId = crypto.randomUUID(), email = snapshot.draft.email;
      statements.push(env.DB.prepare('INSERT INTO edm_templates(id,user_id,name,subject,body_html,body_text,category,is_ai_generated,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)')
        .bind(templateId, user.id, name, email.subject, email.bodyHtml, email.bodyText || null, '懒人模式', 1, now, now));
      statements.push(env.DB.prepare('INSERT INTO edm_campaigns(id,user_id,created_by,template_id,name,sender_email,sender_name,reply_to,reply_tracking,send_rate,total_recipients,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(taskId, user.id, row.created_by, templateId, name, sender.email, sender.name, email.replyTo || null, Number(email.replyTracking), email.sendRate, snapshot.recipients.length, now, now));
      for (let start = 0; start < snapshot.recipients.length; start += 500) {
        const recipients = snapshot.recipients.slice(start, start + 500);
        const rows = recipients.map(recipient => ({ id: recipient.recipientId, contactId: recipient.id, variables: JSON.stringify({ name: recipient.name, company: recipient.company, industry: recipient.industry }) }));
        statements.push(env.DB.prepare(`INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,variables,status,created_at)
          SELECT json_extract(value,'$.id'),?,json_extract(value,'$.contactId'),json_extract(value,'$.variables'),'queued',? FROM json_each(?)`)
          .bind(taskId, now, JSON.stringify(rows)));
        statements.push(env.DB.prepare(`INSERT INTO edm_assistant_recipients(session_id,task_id,recipient_id,contact_id,email,name,company,industry)
          SELECT ?,?,json_extract(value,'$.recipientId'),json_extract(value,'$.id'),json_extract(value,'$.email'),json_extract(value,'$.name'),json_extract(value,'$.company'),json_extract(value,'$.industry') FROM json_each(?)`)
          .bind(row.id, taskId, JSON.stringify(recipients)));
      }
    } else {
      const site = snapshot.draft.site;
      statements.push(env.DB.prepare('INSERT INTO edm_site_message_jobs(id,user_id,created_by,name,sender_name,sender_email,sender_phone,company,address,country,city,subject,message,reply_tracking,total_targets,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(taskId, user.id, row.created_by, name, sender.name, sender.email, sender.phone || null, sender.company || null, sender.address || null, sender.country || null, sender.city || null, site.subject || null, site.message, Number(site.replyTracking), snapshot.targets.length, now, now));
      statements.push(env.DB.prepare(`INSERT INTO edm_site_message_targets(id,job_id,position,website_url,normalized_host,created_at,updated_at)
        SELECT json_extract(value,'$.id'),?,CAST(key AS INTEGER),json_extract(value,'$.url'),json_extract(value,'$.host'),?,? FROM json_each(?)`)
        .bind(taskId, now, now, JSON.stringify(snapshot.targets.map(url => ({ id: crypto.randomUUID(), url, host: new URL(url).hostname.toLowerCase().replace(/^www\./, '') })))));
    }
    statements.push(env.DB.prepare('INSERT INTO edm_assistant_snapshots(session_id,channel,task_id,snapshot) VALUES(?,?,?,?)').bind(row.id, channel, taskId, JSON.stringify({ draft: snapshot.draft, targets: snapshot.targets })));
    operations.push({ channel, taskId, name, status: 'prepared', retryable: true, confirmedVersion: row.version });
  }
  statements.push(env.DB.prepare('UPDATE edm_assistant_sessions SET operations=? WHERE id=? AND pending_request_id=?').bind(JSON.stringify(operations), row.id, row.pending_request_id));
  await env.DB.batch(statements);
  return operations;
}

async function callTask(env: Bindings, user: AssistantUser, channel: AssistantChannel, taskId: string, action: boolean, snapshot?: Snapshot): Promise<Response> {
  let bindings = env;
  if (action && channel === 'email' && snapshot) {
    const approved = new Map(snapshot.recipients.map(recipient => [recipient.recipientId, recipient]));
    const email = snapshot.draft.email, sender = snapshot.draft.sender, original = env.EMAIL_QUEUE;
    const seal = (body: any) => {
      const recipient = approved.get(body.recipientId);
      if (!recipient || body.campaignId !== taskId) throw new Error('Recipient does not match the confirmed snapshot');
      return { ...body, toEmail: recipient.email, toName: recipient.name, fromEmail: sender.email, fromName: sender.name,
        replyTo: email.replyTo || null, subject: email.subject, bodyHtml: email.bodyHtml, bodyText: email.bodyText || null,
        variables: { name: recipient.name, company: recipient.company, industry: recipient.industry } };
    };
    bindings = { ...env, EMAIL_QUEUE: {
      send: (body: any, options: any) => original.send(seal(body), options),
      sendBatch: (batch: any[], options: any) => original.sendBatch(batch.map(item => ({ ...item, body: seal(item.body) })), options),
    } as Queue };
  }
  const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
  app.use('*', async (c, next) => { c.set('user', user); await next(); });
  app.route('/campaigns', campaignRoutes); app.route('/site-messages', siteMessageRoutes);
  app.onError(() => Response.json({ success: false, error: '任务提交结果未确认，请查看原任务状态。' }, { status: 500 }));
  const path = channel === 'email' ? `/campaigns/${taskId}${action ? '/send' : ''}` : `/site-messages/${taskId}${action ? '/start' : ''}`;
  return app.request('https://outreach.internal' + path, { method: action ? 'POST' : 'GET' }, bindings);
}
export function ensureSendingConfigured(env: Bindings, channels: AssistantChannel[]) {
  if (env.TEST_MODE) throw new AssistantError(503, 'outreach_test_mode', '测试环境仅支持保存草稿，不执行真实发送。');
  if (channels.includes('email') && !env.EMAIL_QUEUE) throw new AssistantError(503, 'outreach_not_configured', '邮件发送队列尚未配置。');
  if (channels.includes('site') && (!env.SITE_MESSAGE_QUEUE || !env.BROWSER)) throw new AssistantError(503, 'outreach_not_configured', '网站留言队列或浏览器服务尚未配置。');
}
export async function dispatchOperations(env: Bindings, user: AssistantUser, row: SessionRow, operations: AssistantOperation[], channels: AssistantChannel[]) {
  for (const op of operations) {
    if (op.status !== 'prepared' || !channels.includes(op.channel)) continue;
    const saved = await env.DB.prepare('SELECT snapshot FROM edm_assistant_snapshots WHERE session_id=? AND channel=?').bind(row.id, op.channel).first<{ snapshot: string }>();
    if (!saved) throw new Error('Missing confirmed snapshot');
    const snapshot = JSON.parse(saved.snapshot) as Snapshot;
    snapshot.recipients = (await env.DB.prepare('SELECT contact_id id,recipient_id recipientId,email,name,company,industry FROM edm_assistant_recipients WHERE task_id=? ORDER BY recipient_id').bind(op.taskId).all<Snapshot['recipients'][number]>()).results;
    op.status = 'dispatching'; op.retryable = false; delete op.error;
    const claimed = await env.DB.prepare('UPDATE edm_assistant_sessions SET operations=? WHERE id=? AND pending_request_id=?').bind(JSON.stringify(operations), row.id, row.pending_request_id).run();
    if (!claimed.meta.changes) throw new AssistantError(409, 'request_superseded', '会话已恢复到新的状态，请刷新查看原任务。');
    try {
      const response = await callTask(env, user, op.channel, op.taskId, true, snapshot);
      const body = await response.json() as { success?: boolean; error?: string };
      if (response.ok && body.success !== false) { op.status = 'submitted'; }
      else {
        // 4xx responses happen before dispatch in the existing routes. Queue/network failures may be partial.
        op.status = response.status < 500 ? 'failed' : 'uncertain';
        op.retryable = response.status === 400;
        op.error = response.status < 500 ? body.error || '任务未启动，请查看任务详情。' : '提交结果暂未确认，请查看原任务；不会自动重复发送。';
      }
    } catch { op.status = 'uncertain'; op.error = '连接中断，提交结果暂未确认；请查看原任务，不要重新创建发送。'; }
    if (op.status === 'uncertain') op.retryable = false;
    await env.DB.prepare('UPDATE edm_assistant_sessions SET operations=? WHERE id=? AND pending_request_id=?').bind(JSON.stringify(operations), row.id, row.pending_request_id).run();
  }
  return operations;
}
export async function assistantResults(env: Bindings, user: AssistantUser, row: SessionRow): Promise<AssistantResults> {
  const channels: AssistantResults['channels'] = [];
  for (const op of JSON.parse(row.operations) as AssistantOperation[]) {
    const response = await callTask(env, user, op.channel, op.taskId, false);
    const body = await response.json() as any, task = response.ok ? body.data : null;
    const base = op.channel === 'email' ? '/api/outreach/campaigns/' : '/api/outreach/site-messages/';
    let total = 0, sent = 0, pending = 0, failed = 0, uncertain = 0;
    if (task && op.channel === 'email') {
      total = task.totalRecipients || 0; sent = task.totalSent || 0; pending = (task.progress?.queued || 0) + (task.progress?.sending || 0); failed = task.progress?.failed || 0;
      const count = await env.DB.prepare("SELECT count(*) n FROM edm_campaign_recipients WHERE campaign_id=? AND status='failed' AND (sent_at IS NOT NULL OR ses_message_id IS NOT NULL OR error_message LIKE '%待核实%')").bind(op.taskId).first<{ n: number }>();
      uncertain = (count?.n || 0) + (op.status === 'uncertain' ? pending : 0);
    } else if (task) {
      total = task.totalTargets || 0; sent = task.totalSubmitted || 0;
      pending = (task.targets || []).filter((target: any) => ['queued', 'discovering', 'submitting'].includes(target.status)).length;
      uncertain = (task.targets || []).filter((target: any) => ['submission_uncertain', 'submitted_unconfirmed'].includes(target.resultCode)).length;
      failed = (task.totalFailed || 0) + (task.totalNoContact || 0) + (task.totalInaccessible || 0);
    }
    channels.push({ channel: op.channel, taskId: op.taskId, name: op.name, status: task?.status || 'unavailable',
      operationStatus: op.status, total, sent, pending, failed, uncertain, retryable: op.retryable && !!task && task.status === 'draft',
      ...(op.error ? { error: op.error } : !task ? { error: '原任务已删除或无法读取。' } : {}), detailPath: base + op.taskId,
      exportPath: op.channel === 'email' ? `/api/outreach/assistant/sessions/${row.id}/email/export` : base + op.taskId + '/export' });
  }
  const summary = channels.reduce((sum, channel) => ({ total: sum.total + channel.total, sent: sum.sent + channel.sent,
    pending: sum.pending + channel.pending, failed: sum.failed + channel.failed, uncertain: sum.uncertain + channel.uncertain }), { total: 0, sent: 0, pending: 0, failed: 0, uncertain: 0 });
  return { sessionId: row.id, channels, summary };
}

export async function verifyRetrySnapshot(env: Bindings, row: SessionRow, operation: AssistantOperation) {
  const saved = await env.DB.prepare('SELECT snapshot FROM edm_assistant_snapshots WHERE session_id=? AND task_id=?').bind(row.id, operation.taskId).first<{ snapshot: string }>();
  if (!saved) throw new AssistantError(409, 'snapshot_missing', '原确认记录不可用，不能重试。');
  const snapshot = JSON.parse(saved.snapshot) as Snapshot, sender = snapshot.draft.sender;
  let valid = false;
  if (operation.channel === 'email') {
    const task = await env.DB.prepare('SELECT c.*,t.subject,t.body_html,t.body_text FROM edm_campaigns c LEFT JOIN edm_templates t ON t.id=c.template_id WHERE c.id=? AND c.user_id=?').bind(operation.taskId, row.user_id).first<any>();
    const content = snapshot.draft.email;
    const changed = await env.DB.prepare(`SELECT count(*) n FROM edm_campaign_recipients r LEFT JOIN edm_assistant_recipients a ON a.recipient_id=r.id AND a.task_id=r.campaign_id WHERE r.campaign_id=? AND (a.recipient_id IS NULL OR r.status!='queued')`).bind(operation.taskId).first<{ n: number }>();
    const totals = await env.DB.prepare('SELECT (SELECT count(*) FROM edm_campaign_recipients WHERE campaign_id=?) actual,(SELECT count(*) FROM edm_assistant_recipients WHERE task_id=?) approved').bind(operation.taskId, operation.taskId).first<{ actual: number; approved: number }>();
    valid = !!task && task.status === 'draft' && task.sender_email === sender.email && task.sender_name === sender.name && (task.reply_to || '') === content.replyTo
      && !!task.reply_tracking === content.replyTracking && task.send_rate === content.sendRate && task.subject === content.subject && task.body_html === content.bodyHtml && (task.body_text || '') === content.bodyText
      && !changed?.n && !!totals?.actual && totals.actual === totals.approved;
  } else {
    const task = await env.DB.prepare('SELECT * FROM edm_site_message_jobs WHERE id=? AND user_id=?').bind(operation.taskId, row.user_id).first<any>();
    const targets = await env.DB.prepare('SELECT website_url,status FROM edm_site_message_targets WHERE job_id=? ORDER BY position').bind(operation.taskId).all<{ website_url: string; status: string }>();
    valid = !!task && task.status === 'draft' && task.sender_name === sender.name && task.sender_email === sender.email && (task.sender_phone || '') === sender.phone
      && (task.company || '') === sender.company && (task.address || '') === sender.address && (task.country || '') === sender.country && (task.city || '') === sender.city
      && (task.subject || '') === snapshot.draft.site.subject && task.message === snapshot.draft.site.message && !!task.reply_tracking === snapshot.draft.site.replyTracking
      && targets.results.every(target => target.status === 'queued') && JSON.stringify(targets.results.map(target => target.website_url)) === JSON.stringify(snapshot.targets);
  }
  if (!valid) throw new AssistantError(409, 'task_changed', '原任务已执行或内容发生变化，请到工作台核对；不会按旧确认自动重试。');
}

export async function assistantEmailReport(env: Bindings, row: SessionRow): Promise<string> {
  const operation = (JSON.parse(row.operations) as AssistantOperation[]).find(op => op.channel === 'email');
  if (!operation) throw new AssistantError(404, 'report_not_found', '尚未创建邮件任务。');
  const rows = await env.DB.prepare(`SELECT a.email,a.name,COALESCE(r.status,'missing') status,r.error_message errorMessage,r.ses_message_id sesMessageId,
    r.sent_at sentAt,r.delivered_at deliveredAt,r.opened_at openedAt,r.clicked_at clickedAt
    FROM edm_assistant_recipients a LEFT JOIN edm_campaign_recipients r ON r.id=a.recipient_id AND r.campaign_id=a.task_id WHERE a.task_id=? ORDER BY a.recipient_id`)
    .bind(operation.taskId).all<any>();
  const date = (value: number | null) => value === null ? null : new Date(value * 1000);
  return buildCampaignReport(operation.name, rows.results.map(item => ({ ...item,
    errorMessage: item.status === 'missing' ? '原收件记录已删除，请核对历史发送结果。' : item.errorMessage,
    sentAt: date(item.sentAt), deliveredAt: date(item.deliveredAt), openedAt: date(item.openedAt), clickedAt: date(item.clickedAt) })));
}
