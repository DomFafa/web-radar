import type { Bindings } from '../../shared/types';
import type { EmailSendMessage } from '../queues/email-send.queue';

export type EmailJobRef = { kind: 'email-job'; campaignId: string; recipientId: string };
export type EmailQueueBody = EmailSendMessage | EmailJobRef;
export type EmailContentSnapshot = Pick<EmailSendMessage, 'subject' | 'bodyHtml' | 'bodyText'> & { campaignId: string };

const LEASE_MS = 120_000;

/** Limit each invocation's Cloudflare Queue/D1 calls. The cron drains the rest. */
export async function publishEmailOutbox(env: Bindings, maxBatches = 10, campaignId?: string): Promise<number> {
  if (!env.EMAIL_QUEUE) throw new Error('Email queue unavailable');
  let published = 0;
  for (let i = 0; i < maxBatches; i++) {
    const now = Date.now();
    // The UPDATE/RETURNING is an atomic lease, including across cron/request overlaps.
    const claimed = await env.DB.prepare(`UPDATE edm_email_outbox SET publish_claimed_at=?
      WHERE recipient_id IN (SELECT recipient_id FROM edm_email_outbox
        WHERE published_at IS NULL AND publish_claimed_at < ?
        ${campaignId ? 'AND campaign_id=?' : ''}
        ORDER BY created_at, recipient_id LIMIT 100)
      AND published_at IS NULL AND publish_claimed_at < ?
      RETURNING recipient_id, campaign_id`)
      .bind(...(campaignId ? [now, now - LEASE_MS, campaignId, now - LEASE_MS] : [now, now - LEASE_MS, now - LEASE_MS]))
      .all<{ recipient_id: string; campaign_id: string }>();
    if (!claimed.results.length) break;
    const messages = claimed.results.map(row => ({ body: { kind: 'email-job' as const, recipientId: row.recipient_id, campaignId: row.campaign_id } }));
    try {
      await env.EMAIL_QUEUE.sendBatch(messages);
    } catch (error) {
      // Queue acceptance could be ambiguous. A future lease may republish safely.
      console.error('Email outbox publication uncertain:', error instanceof Error ? error.name : 'unknown');
      throw error;
    }
    // If this write fails, cron can republish; the recipient attempt is still idempotent.
    await env.DB.prepare(`UPDATE edm_email_outbox SET published_at=?
      WHERE publish_claimed_at=? AND recipient_id IN (SELECT value FROM json_each(?))`)
      .bind(now, now, JSON.stringify(claimed.results.map(row => row.recipient_id))).run();
    published += messages.length;
  }
  return published;
}

export async function hydrateEmailQueue(env: Bindings, ref: EmailJobRef, cache = new Map<string, Promise<EmailContentSnapshot | null>>()): Promise<EmailSendMessage | null> {
  const job = await env.DB.prepare(`SELECT * FROM edm_email_outbox WHERE recipient_id=? AND campaign_id=?`)
    .bind(ref.recipientId, ref.campaignId).first<any>();
  if (!job) throw new Error('Email outbox entry missing');
  if (!cache.has(job.snapshot_key)) {
    cache.set(job.snapshot_key, (async () => {
      const object = await env.STORAGE.get(job.snapshot_key);
      return object ? await object.json<EmailContentSnapshot>() : null;
    })());
  }
  const content = await cache.get(job.snapshot_key)!;
  if (!content) return null;
  if (content.campaignId !== ref.campaignId || typeof content.subject !== 'string' || typeof content.bodyHtml !== 'string')
    throw new Error('Email snapshot integrity mismatch');
  return {
    recipientId: ref.recipientId, campaignId: ref.campaignId,
    providerId: job.provider_id, toEmail: job.to_email, toName: job.to_name,
    fromEmail: job.from_email, fromName: job.from_name, replyTo: job.reply_to,
    subject: content.subject, bodyHtml: content.bodyHtml, bodyText: content.bodyText,
    variables: JSON.parse(job.variables), engagementTrackingSource: job.engagement_tracking_source || undefined,
  };
}
