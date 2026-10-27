import { actorScope, creatorFilter } from '../lib/actor-scope';
import { pausedCampaignPacingReset, validSendRate } from '../lib/email-pacing';
import { prepareResendTracking, startResendSync } from '../lib/resend-tracking';
import {resolveSenderDomains} from '../lib/sender-domains';
import { replyAddressSchema } from '../lib/reply-address';
import { emailOverview } from "../lib/overview";
import { publicFetch as fetch } from "../lib/network";
import { loadProviders } from "../lib/credentials";
import { Hono } from "hono";
import { eq, and, desc, count, sql, inArray, isNull } from "drizzle-orm";
import { createDb } from "../../db";
import {
  campaigns,
  campaignRecipients,
  templates,
  contacts,
  providers,
} from "../../db/schema";
import type { Bindings, Variables } from "../../shared/types";
import { requireAuth, requirePermission } from "../middleware/auth";
import { cleanupEmailSnapshots, deleteCampaignWithSnapshots, publishEmailOutbox, type EmailContentSnapshot } from "../lib/email-outbox";
import { blockedEmailMessage, findBlockedEmailTerms } from "../../shared/email-content-policy";
import { selectEmailProviderForSender } from "../lib/email-provider-selection";
import { addCampaignRecipients } from "../lib/campaign-recipient-batch";
import { buildCampaignReport } from "../lib/campaign-report";

type Env = { Bindings: Bindings; Variables: Variables };

export const campaignRoutes = new Hono<Env>();

campaignRoutes.use("/*", requireAuth);

const MAILCHIMP_MARKETING_KEY_SUFFIX = /-[a-z]{2}\d+$/i;
const EMAIL_PROVIDER_TYPES = ["resend", "amazon_ses", "mailchimp", "mailgun", "brevo", "sendgrid", "smtp"] as const;
// The durable attempt receipt owns provider acknowledgement metadata. Legacy
// receipts may be plain text; never infer a provider queue state from them.
const recipientProviderStatus = sql<string | null>`(SELECT CASE WHEN json_valid(a.result) THEN json_extract(a.result, '$.providerStatus') END FROM edm_email_send_attempts a WHERE a.recipient_id=${campaignRecipients.id})`;
const recipientQueuedReason = sql<string | null>`(SELECT CASE WHEN json_valid(a.result) THEN json_extract(a.result, '$.queuedReason') END FROM edm_email_send_attempts a WHERE a.recipient_id=${campaignRecipients.id})`;
const providerQueuedCount = sql<number>`SUM(CASE WHEN ${campaignRecipients.status}='sent' AND ${recipientProviderStatus} IN ('queued','scheduled') THEN 1 ELSE 0 END)`;

function getMailchimpApiType(provider: any): "marketing" | "transactional" {
  let config: any = {};
  try { config = provider.config ? JSON.parse(provider.config) : {}; } catch {}
  return config.apiType || (MAILCHIMP_MARKETING_KEY_SUFFIX.test(provider.apiKey.trim()) ? "marketing" : "transactional");
}

async function syncMailchimpMarketingReports(db: any, userId: string, env: Bindings) {
  const configuredProviders = (await loadProviders(db,env,userId)).filter(p=>p.status==="active" && p.provider==="mailchimp");
  const marketingProviders = configuredProviders.filter((provider: any) => getMailchimpApiType(provider) === "marketing");
  if (!marketingProviders.length) return;

  const reportCampaigns = await db
    .select({ id: campaigns.id, remoteId: campaigns.mailchimpCampaignId, senderEmail: campaigns.senderEmail })
    .from(campaigns)
    .where(and(eq(campaigns.userId, userId), sql`${campaigns.mailchimpCampaignId} IS NOT NULL`));

  await Promise.all(reportCampaigns.map(async (campaign: any) => {
    try {
      const provider = selectEmailProviderForSender(marketingProviders, userId, campaign.senderEmail).provider;
      if (!provider) return;
      let config: any = {};
      try { config = provider.config ? JSON.parse(provider.config) : {}; } catch {}
      const dataCenter = String(config.dataCenter || config.server || provider.apiKey.trim().match(/-([a-z]{2}\d+)$/i)?.[1] || "").trim();
      if (!dataCenter) return;
      const response = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/reports/${campaign.remoteId}`, {
        headers: { Authorization: `Basic ${btoa(`anystring:${provider.apiKey}`)}` },
      });
      if (!response.ok) return;
      const report: any = await response.json();
      await db.update(campaigns).set({
        totalSent: Number(report.emails_sent || 0),
        totalDelivered: Math.max(0, Number(report.emails_sent || 0) - Number(report.bounces || 0)),
        totalOpened: Number(report.unique_opens || 0),
        totalClicked: Number(report.unique_clicks || 0),
        totalBounced: Number(report.bounces || 0),
        totalUnsubscribed: Number(report.unsubscribed || 0),
        updatedAt: new Date(),
      }).where(eq(campaigns.id, campaign.id));
    } catch (error) {
      console.error(`Failed to sync Mailchimp report ${campaign.remoteId}:`, error);
    }
  }));
}

async function syncMailchimpTransactionalMessages(db: any, userId: string, env: Bindings) {
  const configuredProviders = (await loadProviders(db,env,userId)).filter(p=>p.status==="active" && p.provider==="mailchimp");
  const transactionalProviders = configuredProviders.filter((provider: any) => getMailchimpApiType(provider) === "transactional");
  if (!transactionalProviders.length) return;

  const pendingMessages = await db
    .select({ recipientId: campaignRecipients.id, campaignId: campaignRecipients.campaignId, messageId: campaignRecipients.sesMessageId, deliveredAt: campaignRecipients.deliveredAt, openedAt: campaignRecipients.openedAt, clickedAt: campaignRecipients.clickedAt, status: campaignRecipients.status, senderEmail: campaigns.senderEmail,
      frozenProviderId: sql<string | null>`(SELECT provider_id FROM edm_email_outbox WHERE recipient_id=${campaignRecipients.id})` })
    .from(campaignRecipients)
    .innerJoin(campaigns, eq(campaignRecipients.campaignId, campaigns.id))
    .where(and(eq(campaigns.userId, userId), sql`${campaignRecipients.sesMessageId} IS NOT NULL`, sql`NOT EXISTS (SELECT 1 FROM edm_resend_deliveries d WHERE d.recipient_id=${campaignRecipients.id})`));

  const updatedCampaigns = new Set<string>();

  await Promise.all(pendingMessages.map(async (item: any) => {
    try {
      const provider = item.frozenProviderId
        ? transactionalProviders.find(provider => provider.id === item.frozenProviderId)
        : selectEmailProviderForSender(transactionalProviders, userId, item.senderEmail).provider;
      if (!provider) return;
      const response = await fetch("https://mandrillapp.com/api/1.0/messages/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: provider.apiKey, id: item.messageId }),
      });
      if (!response.ok) return;
      const info: any = await response.json();
      if (info._id && info._id !== item.messageId) return;
      const providerStatus = String(info.state || '').trim().toLowerCase();
      const hasOpen = Number(info.opens || 0) > 0;
      const hasClick = Number(info.clicks || 0) > 0;
      const isBounce = ["bounced", "rejected", "soft-bounced"].includes(providerStatus);
      // Mandrill's smtp_events.diag may also describe internal processing.
      // Require a successful external SMTP response, not state="sent" alone.
      const smtpDelivered = Array.isArray(info.smtp_events) && info.smtp_events.some((event: any) =>
        ['sent', 'delivered'].includes(event?.type) && typeof event.destination_ip === 'string' && event.destination_ip.trim() &&
        typeof event.diag === 'string' && /^\s*2\d\d(?:[ -]|$)/.test(event.diag));
      const isDelivered = smtpDelivered || hasOpen || hasClick;
      if (providerStatus) {
        const queuedReason = typeof info.queued_reason === 'string' ? info.queued_reason : null;
        await env.DB.prepare(`UPDATE edm_email_send_attempts SET result=json_set(result,'$.providerStatus',?,
          '$.queuedReason',CASE WHEN ? IN ('queued','scheduled') THEN COALESCE(?,json_extract(result,'$.queuedReason')) ELSE NULL END)
          WHERE recipient_id=? AND CASE WHEN json_valid(result) THEN json_extract(result,'$.messageId') END=?`)
          .bind(providerStatus, providerStatus, queuedReason, item.recipientId, item.messageId).run();
      }
      updatedCampaigns.add(item.campaignId);

      // Keep open and click evidence independent of later status changes.
      const recipientUpdate: Record<string, any> = {};
      if (hasOpen && !item.openedAt) recipientUpdate.openedAt = new Date();
      if (hasClick && !item.clickedAt) recipientUpdate.clickedAt = new Date();
      if (isDelivered && !isBounce && !item.deliveredAt) recipientUpdate.deliveredAt = new Date();
      if (isBounce) {
        recipientUpdate.status = "bounced";
        recipientUpdate.errorMessage = `Mailchimp message state: ${info.state}`;
      } else if (hasClick) {
        recipientUpdate.status = "clicked";
      } else if (hasOpen) {
        recipientUpdate.status = "opened";
      } else if (isDelivered && ["sent", "sending"].includes(item.status)) {
        recipientUpdate.status = "delivered";
      }
      if (Object.keys(recipientUpdate).length) {
        await db.update(campaignRecipients).set(recipientUpdate).where(eq(campaignRecipients.id, item.recipientId));
      }
    } catch (error) {
      console.error(`Failed to sync Mandrill message ${item.messageId}:`, error);
    }
  }));

  // Partial/Unknown_Message responses must not erase existing accepted or
  // engagement totals. Reconcile new evidence from persisted recipient rows.
  await Promise.all(Array.from(updatedCampaigns).map(campaignId => env.DB.prepare(`UPDATE edm_campaigns SET
    total_delivered=MAX(total_delivered,(SELECT COUNT(*) FROM edm_campaign_recipients WHERE campaign_id=? AND (delivered_at IS NOT NULL OR status IN ('delivered','opened','clicked')))),
    total_opened=MAX(total_opened,(SELECT COUNT(*) FROM edm_campaign_recipients WHERE campaign_id=? AND (opened_at IS NOT NULL OR status='opened'))),
    total_clicked=MAX(total_clicked,(SELECT COUNT(*) FROM edm_campaign_recipients WHERE campaign_id=? AND (clicked_at IS NOT NULL OR status='clicked'))),
    total_bounced=MAX(total_bounced,(SELECT COUNT(*) FROM edm_campaign_recipients WHERE campaign_id=? AND status='bounced')),
    updated_at=? WHERE id=?`).bind(campaignId, campaignId, campaignId, campaignId, Math.floor(Date.now() / 1000), campaignId).run()));
}

async function syncProviderStats(db: any, userId: string, env: Bindings) {
  await syncMailchimpMarketingReports(db, userId, env);
  await syncMailchimpTransactionalMessages(db, userId, env);
  const resend = (await loadProviders(db,env,userId)).filter(p=>p.provider==='resend' && p.status==='active');
  for (const p of resend) await startResendSync(env,p.id);
}

// 获取活动列表
campaignRoutes.get("/", requirePermission("campaigns:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;

  const page = parseInt(c.req.query("page") || "1");
  const pageSize = Math.min(parseInt(c.req.query("pageSize") || "20"), 100);
  const status = c.req.query("status");

  const conditions = [actorScope(campaigns, user)];
  if (status) {
    conditions.push(eq(campaigns.status, status as any));
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(campaigns)
    .where(whereClause);

  const total = totalResult?.count || 0;

  const campaignsList = await db
    .select()
    .from(campaigns)
    .where(whereClause)
    .orderBy(desc(campaigns.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const campaignIds = campaignsList.map((c) => c.id);
  const statsMap: Record<string, { total: number; sent: number; opened: number; clicked: number; bounced: number; queued: number; sending: number; failed: number; providerQueued: number }> = {};

  if (campaignIds.length > 0) {
    const recipientStats = await db
      .select({
        campaignId: campaignRecipients.campaignId,
        total: count(),
        queued: sql<number>`SUM(CASE WHEN ${campaignRecipients.status} = 'queued' THEN 1 ELSE 0 END)`,
        sending: sql<number>`SUM(CASE WHEN ${campaignRecipients.status} = 'sending' THEN 1 ELSE 0 END)`,
        providerQueued: providerQueuedCount,
        failed: sql<number>`SUM(CASE WHEN ${campaignRecipients.status} = 'failed' THEN 1 ELSE 0 END)`,
        sent: sql<number>`SUM(CASE WHEN ${campaignRecipients.status} IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 ELSE 0 END)`,
        opened: sql<number>`SUM(CASE WHEN ${campaignRecipients.openedAt} IS NOT NULL OR ${campaignRecipients.status} = 'opened' THEN 1 ELSE 0 END)`,
        clicked: sql<number>`SUM(CASE WHEN ${campaignRecipients.status} = 'clicked' THEN 1 ELSE 0 END)`,
        bounced: sql<number>`SUM(CASE WHEN ${campaignRecipients.status} IN ('failed', 'bounced') THEN 1 ELSE 0 END)`,
      })
      .from(campaignRecipients)
      .where(inArray(campaignRecipients.campaignId, campaignIds))
      .groupBy(campaignRecipients.campaignId);

    for (const stat of recipientStats) {
      statsMap[stat.campaignId] = {
        total: Number(stat.total || 0),
        queued: Number(stat.queued || 0),
        sending: Number(stat.sending || 0),
        providerQueued: Number(stat.providerQueued || 0),
        failed: Number(stat.failed || 0),
        sent: Number(stat.sent || 0),
        opened: Number(stat.opened || 0),
        clicked: Number(stat.clicked || 0),
        bounced: Number(stat.bounced || 0),
      };
    }
  }

  const data = campaignsList.map((c) => ({
    ...c,
    progress: { queued: statsMap[c.id]?.queued || 0, sending: statsMap[c.id]?.sending || 0, failed: statsMap[c.id]?.failed || 0, providerQueued: statsMap[c.id]?.providerQueued || 0,
      processed: (statsMap[c.id]?.total || 0) - (statsMap[c.id]?.queued || 0) - (statsMap[c.id]?.sending || 0) },
    totalRecipients: Math.max(Number(c.totalRecipients || 0), Number(statsMap[c.id]?.total || 0)),
    totalSent: Math.max(Number(c.totalSent || 0), Number(statsMap[c.id]?.sent || 0)),
    totalOpened: Math.max(Number(c.totalOpened || 0), Number(statsMap[c.id]?.opened || 0)),
    totalClicked: Math.max(Number(c.totalClicked || 0), Number(statsMap[c.id]?.clicked || 0)),
    totalBounced: Math.max(Number(c.totalBounced || 0), Number(statsMap[c.id]?.bounced || 0)),
  }));

  return c.json({
    success: true,
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// Export local records only; never synchronize or resend during a download.
campaignRoutes.get("/:id/export", requirePermission("campaigns:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const id = c.req.param("id");
  const [campaign] = await db.select().from(campaigns)
    .where(and(eq(campaigns.id, id), actorScope(campaigns, user)));
  if (!campaign) return c.json({ success: false, error: "活动不存在" }, 404);
  const rows = await db.select({
    email: contacts.email, name: contacts.name, status: campaignRecipients.status,
    errorMessage: campaignRecipients.errorMessage, sesMessageId: campaignRecipients.sesMessageId,
    sentAt: campaignRecipients.sentAt, deliveredAt: campaignRecipients.deliveredAt,
    openedAt: campaignRecipients.openedAt, clickedAt: campaignRecipients.clickedAt,
    providerStatus: recipientProviderStatus, queuedReason: recipientQueuedReason,
  }).from(campaignRecipients)
    .leftJoin(contacts, eq(contacts.id, campaignRecipients.contactId))
    .where(eq(campaignRecipients.campaignId, id))
    .orderBy(campaignRecipients.createdAt, campaignRecipients.id);
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", 'attachment; filename="campaign-report.csv"');
  c.header("Cache-Control", "no-store");
  return c.body(buildCampaignReport(campaign.name, rows));
});

// 获取单个活动详情
campaignRoutes.get("/:id", requirePermission("campaigns:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");

  if (c.req.query("sync") === "1") await syncProviderStats(db, user.id, c.env);

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!campaign) {
    return c.json({ success: false, error: "活动不存在" }, 404);
  }

  const recipients = await db
    .select({
      status: campaignRecipients.status,
      total: count(),
      providerQueued: providerQueuedCount,
    })
    .from(campaignRecipients)
    .where(eq(campaignRecipients.campaignId, campaignId))
    .groupBy(campaignRecipients.status);

  const counts = Object.fromEntries(recipients.map((r) => [r.status, Number(r.total)]));
  let totalRecipients = recipients.reduce((sum, r) => sum + Number(r.total), 0);
  let totalSent = campaign.totalSent;
  let totalOpened = campaign.totalOpened;
  let totalClicked = campaign.totalClicked;
  let totalBounced = campaign.totalBounced;

  totalSent = Math.max(totalSent, ["sent", "delivered", "opened", "clicked", "replied", "unsubscribed", "complained"].reduce((sum, status) => sum + (counts[status] || 0), 0));

  return c.json({
    success: true,
    data: {
      ...campaign,
      progress: { queued: counts.queued || 0, sending: counts.sending || 0, failed: counts.failed || 0, providerQueued: recipients.reduce((sum, row) => sum + Number(row.providerQueued || 0), 0),
        processed: totalRecipients - (counts.queued || 0) - (counts.sending || 0) },
      totalRecipients,
      totalSent,
      totalOpened,
      totalClicked,
      totalBounced,
    },
  });
});

// 创建活动
campaignRoutes.post("/", requirePermission("campaigns:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const body = await c.req.json<{
    name: string;
    templateId?: string;
    senderEmail: string;
    senderName: string;
    replyTo?: string;
    replyTracking?: boolean;
    sendRate?: number;
    scheduledAt?: string;
  }>();

  if (body.replyTracking !== undefined && typeof body.replyTracking !== "boolean") return c.json({error:"回复追踪选项无效"},400);
  const replyAddress = replyAddressSchema.safeParse(body.replyTo);
  if (!replyAddress.success) return c.json({error:"请填写有效的回复邮箱"},400);
  if (body.sendRate !== undefined && !validSendRate(body.sendRate)) return c.json({error:'发送速率须为 1–200 封/分钟的整数'},400);
  if (!body.name?.trim() || !body.senderEmail?.trim() || !body.senderName?.trim()) {
    return c.json(
      { success: false, error: "活动名称、发件人邮箱和发件人名称不能为空" },
      400
    );
  }

  if (body.templateId) {
    const [template] = await db.select().from(templates).where(and(eq(templates.id, body.templateId),eq(templates.userId,user.id)));
    if (!template) return c.json({ success: false, error: "邮件模板不存在" }, 404);
    const blockedTerms = findBlockedEmailTerms(template.subject, template.bodyHtml, template.bodyText);
    if (blockedTerms.length) {
      return c.json({ success: false, error: blockedEmailMessage(blockedTerms), blockedTerms }, 400);
    }
  }

  const id = crypto.randomUUID();
  await db.insert(campaigns).values({
    id,
    userId: user.id,
    createdBy: user.actorId || user.id,
    templateId: body.templateId || null,
    name: body.name.trim(),
    senderEmail: body.senderEmail.trim(),
    senderName: body.senderName.trim(),
    replyTo: replyAddress.data || null,
    replyTracking: body.replyTracking === true,
    sendRate: body.sendRate || 50,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
  });

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  return c.json({ success: true, data: campaign }, 201);
});

// 更新活动
campaignRoutes.put("/:id", requirePermission("campaigns:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!existing) {
    return c.json({ success: false, error: "活动不存在" }, 404);
  }

  if (existing.status === "sending" || existing.status === "needs_review") {
    return c.json(
      { success: false, error: "发送中或待核实的活动无法编辑" },
      400
    );
  }

  if (body.replyTracking !== undefined && typeof body.replyTracking !== "boolean") return c.json({error:"回复追踪选项无效"},400);
  const replyAddress = replyAddressSchema.safeParse(body.replyTo);
  if (!replyAddress.success) return c.json({error:"请填写有效的回复邮箱"},400);
  if (body.sendRate !== undefined && !validSendRate(body.sendRate)) return c.json({error:'发送速率须为 1–200 封/分钟的整数'},400);
  const updateData: Record<string, any> = { updatedAt: new Date() };
  const allowedFields = [
    "name", "templateId", "senderEmail", "senderName",
    "replyTo", "sendRate", "replyTracking",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  if (body.replyTo !== undefined) updateData.replyTo = replyAddress.data || null;
  if (body.scheduledAt !== undefined) {
    updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  }

  if (existing.status === 'paused' && body.sendRate !== undefined && body.sendRate !== existing.sendRate) {
    const update = db.update(campaigns).set(updateData).where(and(eq(campaigns.id, campaignId),
      eq(campaigns.status, 'paused'), sql`${campaigns.sendRate} IS ${existing.sendRate}`)).toSQL();
    const result = await c.env.DB.batch([
      ...pausedCampaignPacingReset(c.env.DB, campaignId, existing.sendRate),
      c.env.DB.prepare(update.sql).bind(...update.params),
    ]);
    if (!result[result.length - 1].meta.changes) return c.json({ success: false, error: '活动状态或速率已变化，请刷新后再修改' }, 409);
  } else {
    await db.update(campaigns).set(updateData).where(eq(campaigns.id, campaignId));
  }

  const [updated] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
  return c.json({ success: true, data: updated });
});

// 删除活动
campaignRoutes.delete("/:id", requirePermission("campaigns:delete"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!existing) {
    return c.json({ success: false, error: "活动不存在" }, 404);
  }

  if (existing.status === "sending" || existing.status === "needs_review") {
    return c.json({ success: false, error: "发送中或待核实的活动无法删除" }, 400);
  }

  const frozen = await c.env.DB.prepare('SELECT DISTINCT snapshot_key FROM edm_email_outbox WHERE campaign_id=?')
    .bind(campaignId).all<{ snapshot_key: string }>();
  if (frozen.results.length && !c.env.STORAGE) {
    return c.json({ success: false, error: '邮件快照存储不可用，暂时无法彻底删除活动' }, 503);
  }

  // Commit deletion and cleanup keys together; a transient R2 failure is
  // retried by cron even after the campaign rows have disappeared.
  await deleteCampaignWithSnapshots(c.env, campaignId);
  await cleanupEmailSnapshots(c.env, 20, campaignId).catch(error => {
    console.error('Email snapshot cleanup scheduled for retry:', error instanceof Error ? error.name : 'unknown');
  });

  return c.json({ success: true, data: { deleted: true } });
});

// ====== 活动收件人管理 ======

// 获取活动收件人列表
campaignRoutes.get("/:id/recipients", requirePermission("campaigns:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");

  // 验证活动所有权
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!campaign) {
    return c.json({ success: false, error: "活动不存在" }, 404);
  }

  const page = parseInt(c.req.query("page") || "1");
  const pageSize = Math.min(parseInt(c.req.query("pageSize") || "50"), 200);

  const [totalResult] = await db
    .select({ count: count() })
    .from(campaignRecipients)
    .where(eq(campaignRecipients.campaignId, campaignId));

  const total = totalResult?.count || 0;

  // 联表查询获取联系人信息
  const data = await db
    .select({
      id: campaignRecipients.id,
      contactId: campaignRecipients.contactId,
      status: campaignRecipients.status,
      sesMessageId: campaignRecipients.sesMessageId,
      providerStatus: recipientProviderStatus,
      queuedReason: recipientQueuedReason,
      sentAt: campaignRecipients.sentAt,
      deliveredAt: campaignRecipients.deliveredAt,
      openedAt: campaignRecipients.openedAt,
      clickedAt: campaignRecipients.clickedAt,
      errorMessage: campaignRecipients.errorMessage,
      contactEmail: contacts.email,
      contactName: contacts.name,
      contactCompany: contacts.company,
    })
    .from(campaignRecipients)
    .innerJoin(contacts, eq(campaignRecipients.contactId, contacts.id))
    .where(eq(campaignRecipients.campaignId, campaignId))
    .orderBy(desc(campaignRecipients.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return c.json({
    success: true,
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// 添加收件人到活动 (从联系人选择)
campaignRoutes.post("/:id/recipients", requirePermission("campaigns:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");
  const body = await c.req.json<{
    contactIds?: string[];
    groupId?: string; // 按分组添加
    tag?: string; // 按标签添加
  }>();

  // 验证活动
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!campaign) {
    return c.json({ success: false, error: "活动不存在" }, 404);
  }

  if (campaign.status === "sending" || campaign.status === "needs_review") {
    return c.json({ success: false, error: "发送中或待核实的活动无法添加收件人" }, 400);
  }

  let contactList: { id: string; email: string; name: string | null; company: string | null; industry: string | null }[] = [];

  if (body.groupId) {
    // 按分组获取联系人
    const groupCondition = body.groupId === "null" ? isNull(contacts.groupId) : eq(contacts.groupId, body.groupId);

    contactList = await db
      .select({
        id: contacts.id,
        email: contacts.email,
        name: contacts.name,
        company: contacts.company,
        industry: contacts.industry,
      })
      .from(contacts)
      .where(
        and(
          groupCondition,
          eq(contacts.userId, user.id),
          eq(contacts.subscriptionStatus, "subscribed")
        )
      );
  } else if (body.tag) {
    contactList = await db
      .select({
        id: contacts.id,
        email: contacts.email,
        name: contacts.name,
        company: contacts.company,
        industry: contacts.industry,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, user.id),
          eq(contacts.subscriptionStatus, "subscribed"),
          sql`EXISTS (
            SELECT 1
            FROM json_each(CASE WHEN json_valid(${contacts.tags}) THEN ${contacts.tags} ELSE '[]' END)
            WHERE CAST(value AS TEXT) = ${body.tag}
          )`
        )
      );
  } else if (body.contactIds?.length) {
    contactList = await db
      .select({
        id: contacts.id,
        email: contacts.email,
        name: contacts.name,
        company: contacts.company,
        industry: contacts.industry,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, user.id),
          eq(contacts.subscriptionStatus, "subscribed"),
          sql`${contacts.id} IN (SELECT value FROM json_each(${JSON.stringify(body.contactIds)}))`
        )
      );
  } else {
    return c.json({ success: false, error: "请选择联系人、分组或标签" }, 400);
  }

  const result = await addCampaignRecipients(c.env.DB, campaignId, user.id, contactList);

  return c.json({
    success: true,
    data: result,
  });
});

// 删除活动收件人 (按联系人)
campaignRoutes.delete("/:id/recipients/:contactId", requirePermission("campaigns:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");
  const contactId = c.req.param("contactId");

  // 验证活动
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!campaign) {
    return c.json({ success: false, error: "活动不存在" }, 404);
  }

  if (campaign.status === "sending" || campaign.status === "needs_review") {
    return c.json({ success: false, error: "发送中或待核实的活动无法删除收件人" }, 400);
  }

  // Check if recipient exists and is queued/failed
  const [recipient] = await db
    .select()
    .from(campaignRecipients)
    .where(
      and(
        eq(campaignRecipients.campaignId, campaignId),
        eq(campaignRecipients.contactId, contactId)
      )
    );

  if (!recipient) {
    return c.json({ success: false, error: "未找到该收件人" }, 404);
  }

  if (recipient.status === "sending" || recipient.status === "sent") {
    return c.json({ success: false, error: "该收件人已经发送或正在发送中，无法删除" }, 400);
  }

  await db
    .delete(campaignRecipients)
    .where(eq(campaignRecipients.id, recipient.id));

  // Update campaign total recipients
  await db
    .update(campaigns)
    .set({
      totalRecipients: sql`${campaigns.totalRecipients} - 1`,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  return c.json({ success: true, data: { deleted: true } });
});

// ====== 发送活动 ======

// 启动发送
campaignRoutes.post("/:id/send", requirePermission("campaigns:send"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!campaign) {
    return c.json({ success: false, error: "活动不存在" }, 404);
  }

  if (!campaign.templateId) {
    return c.json({ success: false, error: "请先选择邮件模板" }, 400);
  }

  if (campaign.status === 'sending' || campaign.status === 'needs_review') {
    return c.json({ success: false, error: campaign.status === 'needs_review'
      ? '活动发送结果待核实，请查看原任务；核实前不能重复启动。'
      : '活动已经在发送中，请查看发送进度，不要重复启动' }, 409);
  }
  // A paused campaign may still contain an unresolved provider result.
  // Resuming its frozen outbox must not erase that uncertainty.
  const unconfirmed = await c.env.DB.prepare(`SELECT 1 FROM edm_campaign_recipients
    WHERE campaign_id=? AND error_message LIKE '%待核实%' LIMIT 1`).bind(campaignId).first();
  if (unconfirmed) return c.json({ success: false, error: '活动存在发送结果待核实的邮件，核实前不能重复启动。' }, 409);

  const pendingStatuses = ["queued", "sending"];

  // 检查是否有待发送/发送中的收件人
  const [recipientCount] = await db
    .select({ count: count() })
    .from(campaignRecipients)
    .where(
      and(
        eq(campaignRecipients.campaignId, campaignId),
        inArray(campaignRecipients.status, pendingStatuses as any)
      )
    );

  if (!recipientCount?.count) {
    return c.json({ success: false, error: "没有待发送的收件人" }, 400);
  }

  // Never create a second send operation for a previously published recipient.
  // Outbox rows remain durable even after Queue delivery is acknowledged.
  const prior = await c.env.DB.prepare(`SELECT 1 FROM edm_email_outbox o
    JOIN edm_campaign_recipients r ON r.id=o.recipient_id
    WHERE r.campaign_id=? AND r.status IN ('queued','sending') LIMIT 1`).bind(campaignId).first();
  if (prior) {
    if (campaign.status !== 'paused') return c.json({ success: false, error: '已有收件人处于发送或待核实状态，请先检查发送记录，勿重复提交' }, 409);
    if (!c.env.STORAGE || !c.env.EMAIL_QUEUE) return c.json({ success: false, error: '邮件持久化存储或发送队列未配置' }, 503);
    const unmatched = await c.env.DB.prepare(`SELECT 1 FROM edm_campaign_recipients r
      WHERE r.campaign_id=? AND r.status IN ('queued','sending')
        AND NOT EXISTS (SELECT 1 FROM edm_email_outbox o WHERE o.recipient_id=r.id) LIMIT 1`)
      .bind(campaignId).first();
    if (unmatched) return c.json({ success: false, error: '暂停期间新增了未冻结的收件人，请核对任务后再发送' }, 409);
    // Wake the same frozen operation: old Queue references may be delayed for
    // hours at the previous rate. Never reset an attempt or rebuild its content.
    // Atomic status guards stop a concurrent resume from publishing twice.
    const resumeGuard = `EXISTS(SELECT 1 FROM edm_campaigns c WHERE c.id=? AND c.status='paused' AND NOT EXISTS
      (SELECT 1 FROM edm_campaign_recipients r WHERE r.campaign_id=c.id AND r.error_message LIKE '%待核实%'))`;
    const resumedBatch = await c.env.DB.batch([
      c.env.DB.prepare(`UPDATE edm_email_outbox SET published_at=NULL,publish_claimed_at=0
        WHERE campaign_id=? AND recipient_id IN
          (SELECT r.id FROM edm_campaign_recipients r WHERE r.campaign_id=? AND r.status IN ('queued','sending')
            AND r.sent_at IS NULL AND r.ses_message_id IS NULL
            AND NOT EXISTS(SELECT 1 FROM edm_email_send_attempts a WHERE a.recipient_id=r.id))
        AND ${resumeGuard}`).bind(campaignId, campaignId, campaignId),
      c.env.DB.prepare(`UPDATE edm_campaigns SET status='sending',updated_at=?
        WHERE id=? AND status='paused' AND NOT EXISTS
          (SELECT 1 FROM edm_campaign_recipients WHERE campaign_id=edm_campaigns.id AND error_message LIKE '%待核实%')`)
        .bind(Math.floor(Date.now() / 1000), campaignId),
    ]);
    const resumed = resumedBatch[1];
    if (!resumed.meta.changes) return c.json({ success: false, error: '活动状态已变化，请刷新发送进度' }, 409);
    let publicationPending = false;
    try {
      await publishEmailOutbox(c.env, 10, campaignId);
      publicationPending = !!await c.env.DB.prepare('SELECT 1 FROM edm_email_outbox WHERE campaign_id=? AND published_at IS NULL LIMIT 1')
        .bind(campaignId).first();
    } catch { publicationPending = true; }
    return c.json({ success: true, data: { campaignId, status: 'sending', recipientsQueued: recipientCount.count, publicationPending } });
  }

  // 获取模板
  const [template] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, campaign.templateId),eq(templates.userId,user.id)));

  if (!template) {
    return c.json({ success: false, error: "邮件模板不存在" }, 404);
  }

  // Assistant confirmations carry an already-approved snapshot, independent of
  // later contact/template edits. This binding is injected internally, never from HTTP.
  const approved = (c.env as any).APPROVED_EMAIL_CONTENT as (EmailContentSnapshot & {
    taskId: string; recipientCount: number; senderEmail: string; senderName: string; replyTo: string | null;
  }) | undefined;
  const trustedApproved = approved?.taskId === campaignId ? approved : undefined;
  if (trustedApproved) {
    const match = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM edm_campaign_recipients r
      INNER JOIN edm_assistant_recipients a ON a.recipient_id=r.id AND a.task_id=r.campaign_id
      WHERE r.campaign_id=? AND r.status IN ('queued','sending')`).bind(campaignId).first<{ n: number }>();
    if (Number(match?.n) !== recipientCount.count || Number(match?.n) !== trustedApproved.recipientCount) {
      return c.json({ success: false, error: '待发收件人与已确认名单不一致，请重新确认任务' }, 409);
    }
  }
  const content = trustedApproved || template;
  const senderEmail = trustedApproved?.senderEmail ?? campaign.senderEmail;
  const senderName = trustedApproved?.senderName ?? campaign.senderName;
  const replyTo = trustedApproved ? trustedApproved.replyTo : campaign.replyTo;
  const blockedTerms = findBlockedEmailTerms(content.subject, content.bodyHtml, content.bodyText);
  if (blockedTerms.length) {
    return c.json({ success: false, error: blockedEmailMessage(blockedTerms), blockedTerms }, 400);
  }

  const emailProviders = (await loadProviders(db,c.env,user.id)).filter(p=>p.status==="active" && (EMAIL_PROVIDER_TYPES as readonly string[]).includes(p.provider));
  const senderAccounts = await resolveSenderDomains(emailProviders);
  const senderSelection = selectEmailProviderForSender(senderAccounts.providers, user.id, senderEmail);
  // An unavailable Resend account must not silently fall back to another provider.
  const requiresDomainMatch = emailProviders.some(provider=>provider.provider==='resend');
  const selectedProvider = requiresDomainMatch && !senderSelection.matchedDomain ? undefined : senderSelection.provider;
  if (!selectedProvider) {
    return c.json({ success: false, error: senderAccounts.errors.length ? "无法验证发信帐号域名，请在发信域名页面检查帐号权限后重试" : "没有与发件人域名匹配的可用发信帐号，请检查域名验证状态" }, 400);
  }

  if (selectedProvider.provider === 'resend') {
    try { await prepareResendTracking(c.env, selectedProvider, senderEmail); }
    catch (error) { return c.json({error:'Resend 数据追踪未准备好：'+(error as Error).message},400); }
  }

  if (!c.env.STORAGE || !c.env.EMAIL_QUEUE) return c.json({ success: false, error: '邮件持久化存储或发送队列未配置' }, 503);
  const snapshotKey = `outreach/email-snapshots/${campaignId}/${crypto.randomUUID()}.json`;
  const snapshot: EmailContentSnapshot = { campaignId, subject: content.subject, bodyHtml: content.bodyHtml, bodyText: content.bodyText };
  await c.env.STORAGE.put(snapshotKey, JSON.stringify(snapshot), { httpMetadata: { contentType: 'application/json' } });

  // Commit the campaign claim and all frozen per-recipient envelopes atomically.
  // This single INSERT SELECT supports 20k recipients without materializing 20k HTML copies.
  const now = Math.floor(Date.now() / 1000);
  let results: D1Result[];
  try {
    results = await c.env.DB.batch([
    c.env.DB.prepare(`UPDATE edm_campaigns SET status='sending',started_at=COALESCE(started_at,?),updated_at=?
      WHERE id=? AND status=? AND NOT EXISTS
        (SELECT 1 FROM edm_campaign_recipients WHERE campaign_id=edm_campaigns.id AND error_message LIKE '%待核实%')`)
      .bind(now, now, campaignId, campaign.status),
    c.env.DB.prepare(`INSERT INTO edm_email_outbox
      (recipient_id,campaign_id,snapshot_key,provider_id,to_email,to_name,from_email,from_name,reply_to,variables,engagement_tracking_source,created_at)
      SELECT r.id,r.campaign_id,?,?,COALESCE(a.email,c.email),COALESCE(a.name,c.name),?,?,?,
        CASE WHEN a.recipient_id IS NULL THEN COALESCE(r.variables,'{}')
          ELSE json_object('name',COALESCE(a.name,''),'company',COALESCE(a.company,''),'industry',COALESCE(a.industry,'')) END,
        ?,? FROM edm_campaign_recipients r
      JOIN edm_contacts c ON c.id=r.contact_id
      LEFT JOIN edm_assistant_recipients a ON a.recipient_id=r.id AND a.task_id=r.campaign_id
      WHERE r.campaign_id=? AND r.status IN ('queued','sending') AND changes()>0`)
      .bind(snapshotKey, selectedProvider.id, senderEmail, senderName, replyTo, selectedProvider.provider === 'resend' ? 'resend' : null, now, campaignId),
    // Only envelopes frozen by this transaction may advance recipient state.
    // changes() above reads the immediately preceding campaign claim.
    c.env.DB.prepare(`UPDATE edm_campaign_recipients SET status='sending'
      WHERE campaign_id=? AND status IN ('queued','sending') AND EXISTS
        (SELECT 1 FROM edm_email_outbox o WHERE o.recipient_id=edm_campaign_recipients.id AND o.snapshot_key=?)`)
      .bind(campaignId, snapshotKey),
    ]);
  } catch (error) {
    await c.env.STORAGE.delete(snapshotKey).catch(() => {});
    const claimedByAnother = await c.env.DB.prepare(`SELECT 1 FROM edm_email_outbox o
      JOIN edm_campaigns c ON c.id=o.campaign_id
      JOIN edm_campaign_recipients r ON r.id=o.recipient_id
      WHERE o.campaign_id=? AND c.status='sending' AND r.status IN ('queued','sending') LIMIT 1`)
      .bind(campaignId).first().catch(() => null);
    if (claimedByAnother) return c.json({ success: false, error: '活动已经在发送中，请查看发送进度，不要重复启动' }, 409);
    throw error;
  }
  if (!results[0].meta.changes) {
    await c.env.STORAGE.delete(snapshotKey).catch(() => {});
    return c.json({ success: false, error: '活动已经在发送中，请查看发送进度，不要重复启动' }, 409);
  }

  // Durable outbox lets cron finish publication after timeout, partial Queue
  // acceptance or client disconnect; the original 99 emails are never retried here.
  let publicationPending = false;
  try {
    await publishEmailOutbox(c.env, 10, campaignId);
    publicationPending = !!await c.env.DB.prepare('SELECT 1 FROM edm_email_outbox WHERE campaign_id=? AND published_at IS NULL LIMIT 1')
      .bind(campaignId).first();
  }
  catch { publicationPending = true; }

  return c.json({
    success: true,
    data: {
      campaignId,
      status: "sending",
      recipientsQueued: recipientCount.count,
      publicationPending,
    },
  });
});

// 暂停活动
campaignRoutes.post("/:id/pause", requirePermission("campaigns:send"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const campaignId = c.req.param("id");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), actorScope(campaigns, user)));

  if (!campaign || campaign.status !== "sending") {
    return c.json({ success: false, error: "只能暂停发送中的活动" }, 400);
  }

  await db
    .update(campaigns)
    .set({ status: "paused", updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  return c.json({ success: true, data: { status: "paused" } });
});

// ====== 仪表盘统计 ======

campaignRoutes.get("/stats/overview", requirePermission("campaigns:read"), async (c) => {
  return c.json({success:true,data:await emailOverview(c.env.DB,c.get("user")!.id,creatorFilter(c.get("user")!))});
});

// Reconcile only known accepted emails, scoped to the caller's workspace.
campaignRoutes.post('/stats/resend-sync', requirePermission('campaigns:read'), async (c) => {
  const configured = (await loadProviders(createDb(c.env.DB),c.env,c.get('user')!.id))
    .filter(p=>p.provider==='resend' && p.status==='active');
  try {
    for (const p of configured) await startResendSync(c.env,p.id);
    return c.json({success:true,data:{accounts:configured.length}});
  } catch (error) { return c.json({error:(error as Error).message},503); }
});
