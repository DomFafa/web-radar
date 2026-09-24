import { eq } from 'drizzle-orm';
import { createDb } from '../../db';
import { providers } from '../../db/schema';
import type { Bindings } from '../../shared/types';
import { decodeProvider, seal } from './credentials';
import {
  RESEND_EVENTS,
  resendRequest,
  listResendResources,
  listResendDomains,
  applyResendEvent,
  ResendApiError,
} from './resend';
import { resendCooldown } from './email-pacing';

export async function connectResendWebhook(
  env: Bindings,
  p: { id: string; apiKey: string; config: string | null },
) {
  const config = JSON.parse(p.config || '{}');
  const endpoint = new URL('/api/outreach/webhooks/resend/' + p.id, env.BETTER_AUTH_URL).toString();
  if (!endpoint.startsWith('https://')) throw new Error('请在 HTTPS 生产环境连接 Resend 回调');
  const list = await listResendResources(p.apiKey, 'webhooks');
  const existing = list.find((w: any) => w.endpoint === endpoint);
  let hook: any;
  if (existing) {
    await resendRequest(p.apiKey, '/webhooks/' + encodeURIComponent(existing.id), {
      method: 'PATCH',
      body: JSON.stringify({ events: RESEND_EVENTS, status: 'enabled' }),
    });
    hook = await resendRequest(p.apiKey, '/webhooks/' + encodeURIComponent(existing.id));
  } else {
    hook = await resendRequest(p.apiKey, '/webhooks', {
      method: 'POST',
      body: JSON.stringify({ endpoint, events: RESEND_EVENTS }),
    });
  }
  const secret =
    hook.signing_secret || (hook.id === config.resendWebhookId ? config.resendWebhookSecret : null);
  if (!secret) throw new Error('Resend 未返回回调签名密钥，请检查权限');
  config.resendWebhookId = hook.id;
  config.resendWebhookSecret = secret;
  config.resendWebhookConnectedAt = new Date().toISOString();
  await createDb(env.DB)
    .update(providers)
    .set({
      config: await seal(JSON.stringify(config), p.id + ':config', env),
      updatedAt: new Date(),
    })
    .where(eq(providers.id, p.id));
  return { endpoint, connected: true };
}

export async function prepareResendTracking(
  env: Bindings,
  p: { id: string; apiKey: string; config: string | null },
  sender: string,
) {
  await connectResendWebhook(env, p);
  const domain = sender.split('@').at(-1)?.toLowerCase();
  const domains = await listResendDomains(p.apiKey);
  const matched = domains.find(
    (d: any) => d.name?.toLowerCase() === domain && d.status === 'verified',
  );
  if (!matched) throw new Error('Resend 发信域名尚未验证');
  if (!matched.open_tracking || !matched.click_tracking) {
    await resendRequest(p.apiKey, '/domains/' + encodeURIComponent(matched.id), {
      method: 'PATCH',
      body: JSON.stringify({ open_tracking: true, click_tracking: true }),
    });
  }
}

export type ResendSyncMessage = { kind: 'resend-sync'; providerId: string; runId: string };
export async function startResendSync(env: Bindings, providerId: string) {
  if (!env.EMAIL_QUEUE) throw new Error('邮件数据同步队列尚未配置');
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO edm_resend_sync_runs(provider_id,run_id,status,started_at,updated_at)
    VALUES (?,?,'running',?,?) ON CONFLICT(provider_id) DO UPDATE SET run_id=excluded.run_id,status='running',
    started_at=excluded.started_at,updated_at=excluded.updated_at,checked=0,failed=0,error=NULL,lease_until=0,lease_token=NULL
    WHERE status!='running' OR updated_at<?`,
  )
    .bind(providerId, crypto.randomUUID(), now, now, now - 3600000)
    .run();
  const run = await env.DB.prepare('SELECT run_id FROM edm_resend_sync_runs WHERE provider_id=?')
    .bind(providerId)
    .first<{ run_id: string }>();
  await env.EMAIL_QUEUE.send({
    kind: 'resend-sync',
    providerId,
    runId: run!.run_id,
  } satisfies ResendSyncMessage);
}

// Retrieval only: this job never calls POST /emails or creates send attempts.
export async function handleResendSync(message: ResendSyncMessage, env: Bindings) {
  const db = env.DB,
    now = Date.now(),
    token = crypto.randomUUID();
  const claim = await db
    .prepare(
      `UPDATE edm_resend_sync_runs SET lease_token=?,lease_until=?,updated_at=?
    WHERE provider_id=? AND run_id=? AND status='running' AND lease_until<=?`,
    )
    .bind(token, now + 180000, now, message.providerId, message.runId, now)
    .run();
  if (!claim.meta.changes) {
    const active = await db
      .prepare(
        "SELECT lease_until FROM edm_resend_sync_runs WHERE provider_id=? AND run_id=? AND status='running'",
      )
      .bind(message.providerId, message.runId)
      .first<{ lease_until: number }>();
    return active ? Math.max(1, Math.ceil((active.lease_until - now) / 1000)) : undefined;
  }
  let delay = 0;
  try {
    const run = await db
      .prepare('SELECT started_at FROM edm_resend_sync_runs WHERE provider_id=?')
      .bind(message.providerId)
      .first<{ started_at: number }>();
    const row = await createDb(db)
      .select()
      .from(providers)
      .where(eq(providers.id, message.providerId))
      .get();
    if (!row || row.provider !== 'resend' || row.status !== 'active')
      throw new Error('Resend 帐号不可用');
    const p = await decodeProvider(row, env);
    const records = await db
      .prepare(
        `SELECT d.recipient_id,d.email_id FROM edm_resend_deliveries d
      JOIN edm_campaign_recipients r ON r.id=d.recipient_id JOIN edm_campaigns c ON c.id=r.campaign_id
      WHERE d.provider_id=? AND c.user_id=? AND d.email_id IS NOT NULL AND d.created_at<=?
      AND (d.checked_at IS NULL OR d.checked_at<?) ORDER BY d.recipient_id LIMIT 10`,
      )
      .bind(p.id, p.userId, Math.floor(run!.started_at / 1000), run!.started_at)
      .all<{ recipient_id: string; email_id: string }>();
    if (!records.results.length) {
      await db
        .prepare(
          "UPDATE edm_resend_sync_runs SET status='completed',updated_at=? WHERE provider_id=? AND lease_token=?",
        )
        .bind(Date.now(), p.id, token)
        .run();
      return;
    }
    for (const item of records.results) {
      // Share the dispatch clock with Resend sends; leave headroom for domain/config APIs.
      const clock = await db
        .prepare("SELECT next_at FROM edm_email_clocks WHERE id='dispatch:account:resend'")
        .first<{ next_at: number }>();
      const wait = Math.max(0, (clock?.next_at || 0) - Date.now());
      if (wait > 500) {
        delay = Math.ceil(wait / 1000);
        break;
      }
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      const at = Date.now();
      const slot = await db
        .prepare(
          `INSERT INTO edm_email_clocks(id,next_at) VALUES ('dispatch:account:resend',?)
        ON CONFLICT(id) DO UPDATE SET next_at=excluded.next_at WHERE next_at<=?`,
        )
        .bind(at + 200, at)
        .run();
      if (!slot.meta.changes) break;
      try {
        const info = await resendRequest(p.apiKey, '/emails/' + encodeURIComponent(item.email_id));
        if (info.id !== item.email_id) throw new Error('Resend 返回的邮件 ID 不匹配');
        const type = 'email.' + info.last_event;
        if (!RESEND_EVENTS.includes(type))
          throw new Error('当前邮件事件无法转换，请检查 Resend 控制台');
        await applyResendEvent(db, p.id, { type, data: { email_id: item.email_id } });
        await db.batch([
          db
            .prepare('UPDATE edm_resend_deliveries SET checked_at=? WHERE recipient_id=?')
            .bind(Date.now(), item.recipient_id),
          db
            .prepare(
              'UPDATE edm_resend_sync_runs SET checked=checked+1,updated_at=? WHERE provider_id=? AND lease_token=?',
            )
            .bind(Date.now(), p.id, token),
        ]);
      } catch (error) {
        if (error instanceof ResendApiError && error.status === 429) {
          delay = error.retryAfter;
          await resendCooldown(db, delay);
          break;
        }
        if (error instanceof ResendApiError && [401, 403].includes(error.status)) throw error;
        await db.batch([
          db
            .prepare('UPDATE edm_resend_deliveries SET checked_at=? WHERE recipient_id=?')
            .bind(Date.now(), item.recipient_id),
          db
            .prepare(
              'UPDATE edm_resend_sync_runs SET checked=checked+1,failed=failed+1,error=?,updated_at=? WHERE provider_id=? AND lease_token=?',
            )
            .bind(String((error as Error).message).slice(0, 300), Date.now(), p.id, token),
        ]);
      }
    }
    await env.EMAIL_QUEUE.send(message, { delaySeconds: Math.min(86400, Math.max(0, delay)) });
  } catch (error) {
    // Make queue/network failures visible and restartable with the sync button.
    await db
      .prepare(
        "UPDATE edm_resend_sync_runs SET status='failed',error=?,updated_at=? WHERE provider_id=? AND lease_token=?",
      )
      .bind(String((error as Error).message).slice(0, 300), Date.now(), message.providerId, token)
      .run();
  } finally {
    await db
      .prepare(
        'UPDATE edm_resend_sync_runs SET lease_until=0,lease_token=NULL WHERE provider_id=? AND lease_token=?',
      )
      .bind(message.providerId, token)
      .run();
  }
}
