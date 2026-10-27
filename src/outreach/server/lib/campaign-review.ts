import type { Bindings } from '../../shared/types';
import { unseal } from './credentials';
import { applyResendEvent, RESEND_EVENTS, resendRequest, ResendApiError } from './resend';
import { saveAttempt } from './email-attempt';

export type CampaignReviewMessage = { kind: 'campaign-review'; campaignId: string; runId: string };
const uncertain = "error_message LIKE '待核实%'";

import { settleReviewedCampaign } from './campaign-review-state';
export async function getCampaignReview(db: D1Database, campaignId: string) {
  const run = await db
    .prepare(
      `SELECT run_id,status,started_at,updated_at,checked,resolved,error,
    (SELECT COUNT(*) FROM edm_campaign_recipients WHERE campaign_id=? AND ${uncertain}) remaining
    FROM edm_campaign_reviews WHERE campaign_id=?`,
    )
    .bind(campaignId, campaignId)
    .first<any>();
  return run;
}
export async function startCampaignReview(env: Bindings, campaignId: string) {
  if (!env.EMAIL_QUEUE) throw new Error('核实队列尚未配置');
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO edm_campaign_reviews(campaign_id,run_id,status,started_at,updated_at)
    VALUES (?,?,'running',?,?) ON CONFLICT(campaign_id) DO UPDATE SET run_id=excluded.run_id,
    status='running',started_at=excluded.started_at,updated_at=excluded.updated_at,checked=0,resolved=0,
    recipient_after='',cursor='',candidates='[]',pages=0,error=NULL,lease_until=0,lease_token=NULL
    WHERE status!='running' OR (updated_at<? AND lease_until<=?)`,
  )
    .bind(campaignId, crypto.randomUUID(), now, now, now - 600000, now)
    .run();
  const run = await getCampaignReview(env.DB, campaignId);
  try {
    await env.EMAIL_QUEUE.send({
      kind: 'campaign-review',
      campaignId,
      runId: run.run_id,
    } satisfies CampaignReviewMessage);
  } catch {
    await env.DB.prepare(
      "UPDATE edm_campaign_reviews SET status='failed',error='核实任务入队失败，请重试',updated_at=? WHERE campaign_id=? AND run_id=? AND lease_until<=?",
    )
      .bind(Date.now(), campaignId, run.run_id, Date.now())
      .run();
    throw new Error('核实任务入队失败，请重试');
  }
  return getCampaignReview(env.DB, campaignId);
}
const mailbox = (value: string) =>
  String(value || '')
    .match(/<([^<>]+)>/)?.[1]
    ?.trim()
    .toLowerCase() ||
  String(value || '')
    .trim()
    .toLowerCase();
const tagId = (info: any) =>
  Array.isArray(info.tags)
    ? info.tags.find((t: any) => t.name === 'wr_recipient_id')?.value
    : info.tags?.wr_recipient_id;
const sameAddresses = (info: any, r: any) =>
  mailbox(info.from) === mailbox(r.from_email) &&
  Array.isArray(info.to) &&
  info.to.length === 1 &&
  mailbox(info.to[0]) === mailbox(r.to_email);

// A review job only retrieves existing emails. It never queues recipients, resets an
// attempt, or calls POST /emails. Unknown outcomes must never be guessed or resent.
export async function handleCampaignReview(message: CampaignReviewMessage, env: Bindings) {
  const db = env.DB,
    now = Date.now(),
    token = crypto.randomUUID();
  const claim = await db
    .prepare(
      `UPDATE edm_campaign_reviews SET lease_token=?,lease_until=?,updated_at=?
    WHERE campaign_id=? AND run_id=? AND status='running' AND lease_until<=?`,
    )
    .bind(token, now + 180000, now, message.campaignId, message.runId, now)
    .run();
  if (!claim.meta.changes) {
    const run = await db
      .prepare(
        "SELECT lease_until FROM edm_campaign_reviews WHERE campaign_id=? AND run_id=? AND status='running'",
      )
      .bind(message.campaignId, message.runId)
      .first<any>();
    return run ? Math.max(1, Math.ceil((run.lease_until - now) / 1000)) : undefined;
  }
  let delay: number | undefined = 1;
  const update = async (sql: string, ...values: any[]) =>
    db
      .prepare(
        `UPDATE edm_campaign_reviews SET ${sql},updated_at=? WHERE campaign_id=? AND run_id=? AND lease_token=?`,
      )
      .bind(...values, Date.now(), message.campaignId, message.runId, token)
      .run();
  try {
    const run = await db
      .prepare('SELECT * FROM edm_campaign_reviews WHERE campaign_id=?')
      .bind(message.campaignId)
      .first<any>();
    const recipient = await db
      .prepare(
        `SELECT r.id,r.ses_message_id,d.email_id,o.from_email,o.to_email,
      p.id provider_id,p.provider,p.api_key,p.status provider_status FROM edm_campaign_recipients r
      JOIN edm_campaigns c ON c.id=r.campaign_id LEFT JOIN edm_email_outbox o ON o.recipient_id=r.id
      LEFT JOIN edm_resend_deliveries d ON d.recipient_id=r.id
      LEFT JOIN edm_providers p ON p.id=COALESCE(o.provider_id,d.provider_id) AND p.user_id=c.user_id
      WHERE r.campaign_id=? AND r.id>? AND r.${uncertain} ORDER BY r.id LIMIT 1`,
      )
      .bind(message.campaignId, run.recipient_after)
      .first<any>();
    if (!recipient) {
      await settleReviewedCampaign(db, message.campaignId);
      await update("status='completed'");
      return;
    }
    const next = async (error: string | null) =>
      update(
        "recipient_after=?,cursor='',candidates='[]',pages=0,error=COALESCE(?,error)",
        recipient.id,
        error,
      );
    if (
      recipient.provider !== 'resend' ||
      recipient.provider_status !== 'active' ||
      !recipient.from_email ||
      !recipient.to_email
    ) {
      await next('部分记录缺少原始 Resend 通道或发信快照，仍需人工核实');
      return delay;
    }
    const key = await unseal(recipient.api_key, recipient.provider_id, env);
    const get = async (path: string) => {
      // Coordinate with sending and engagement sync; 5 requests/sec account budget.
      const at = Date.now();
      const lease = await db
        .prepare(
          'UPDATE edm_campaign_reviews SET lease_until=?,updated_at=? WHERE campaign_id=? AND run_id=? AND lease_token=? AND lease_until>?',
        )
        .bind(at + 180000, at, message.campaignId, message.runId, token, at)
        .run();
      if (!lease.meta.changes) throw new Error('核实任务租约已失效');
      const slot = await db
        .prepare(
          `INSERT INTO edm_email_clocks(id,next_at) VALUES ('dispatch:account:resend',?)
        ON CONFLICT(id) DO UPDATE SET next_at=excluded.next_at WHERE next_at<=?`,
        )
        .bind(at + 200, at)
        .run();
      if (!slot.meta.changes) throw new ResendApiError('等待服务商请求额度', 429, 1);
      return resendRequest(key, path);
    };
    const confirm = async (info: any, knownId?: string) => {
      if (
        !info.id ||
        !sameAddresses(info, recipient) ||
        (knownId ? info.id !== knownId : tagId(info) !== recipient.id)
      )
        return false;
      // A persisted mapping is the receipt; otherwise the exact recipient tag is required.
      const type = RESEND_EVENTS.includes('email.' + info.last_event)
        ? 'email.' + info.last_event
        : 'email.sent';
      if (
        !(await applyResendEvent(db, recipient.provider_id, {
          type,
          data: { email_id: info.id, tags: { wr_recipient_id: recipient.id } },
        }))
      )
        return false;
      await saveAttempt(db, recipient.id, info.id);
      await update('resolved=resolved+1');
      return true;
    };
    const knownId = recipient.email_id || recipient.ses_message_id;
    if (knownId) {
      const info = await get('/emails/' + encodeURIComponent(knownId));
      await next(
        (await confirm(info, knownId)) ? null : '服务商记录与原始收件人不匹配，未更改发送结果',
      );
      return delay;
    }
    if (run.pages >= 1000) {
      await next('已达到本次查询上限，结果仍待核实');
      return delay;
    }
    const list = await get(
      '/emails?limit=100' + (run.cursor ? '&after=' + encodeURIComponent(run.cursor) : ''),
    );
    if (!Array.isArray(list.data)) throw new Error('服务商列表格式无效');
    const candidates = new Set<string>(JSON.parse(run.candidates));
    // Persist a page only after every candidate has been checked; interrupted pages
    // are safe to replay. Addresses alone are never evidence of acceptance.
    for (const item of list.data.filter((info: any) => sameAddresses(info, recipient))) {
      await new Promise((resolve) => setTimeout(resolve, 210));
      const info = await get('/emails/' + encodeURIComponent(item.id));
      if (info.id === item.id && sameAddresses(info, recipient) && tagId(info) === recipient.id)
        candidates.add(item.id);
    }
    if (list.has_more) {
      const cursor = list.data.at(-1)?.id;
      if (!cursor || cursor === run.cursor) throw new Error('服务商分页异常');
      await update(
        'cursor=?,candidates=?,checked=checked+?,pages=pages+1',
        cursor,
        JSON.stringify([...candidates]),
        list.data.length,
      );
    } else {
      await update('checked=checked+?', list.data.length);
      if (candidates.size === 1) {
        await new Promise((resolve) => setTimeout(resolve, 210));
        const info = await get('/emails/' + encodeURIComponent([...candidates][0]));
        await next((await confirm(info)) ? null : '服务商记录未通过验证，结果仍待核实');
      } else
        await next(
          candidates.size
            ? '发现多个匹配记录，请人工核对；未重发邮件'
            : '未找到带有原始收件人标识的记录，仍待核实；未重发邮件',
        );
    }
  } catch (error) {
    if (error instanceof ResendApiError && error.status === 429)
      delay = Math.max(1, error.retryAfter);
    else {
      await update("status='failed',error=?", '服务商核实失败，请检查权限或网络后重试');
      delay = undefined;
    }
  } finally {
    await db
      .prepare(
        'UPDATE edm_campaign_reviews SET lease_until=0,lease_token=NULL WHERE campaign_id=? AND lease_token=?',
      )
      .bind(message.campaignId, token)
      .run();
  }
  return delay;
}
