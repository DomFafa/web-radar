/** D1 batches are serialized transactions. No in-memory counters or worker sleeps. */
export const validSendRate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 200;

// Resend's documented default is 10 requests/sec/team. Reserve at most 4/sec
// for sends so a 200/minute campaign fits while retaining headroom for reads.
// Every API key still shares this clock; 429 Retry-After remains authoritative.
const RESEND_INTERVAL = 250;

/** Run these before a conditional paused-campaign rate update in the same batch.
 * Existing attempts and other campaigns' reservations must remain untouched.
 */
export function pausedCampaignPacingReset(db: D1Database, campaignId: string, previousRate: number | null, now = Date.now()): D1PreparedStatement[] {
  const guard = `EXISTS(SELECT 1 FROM edm_campaigns WHERE id=? AND status='paused' AND send_rate IS ?)`;
  return [
    db.prepare(`DELETE FROM edm_email_schedule WHERE recipient_id IN
      (SELECT r.id FROM edm_campaign_recipients r WHERE r.campaign_id=? AND r.status IN ('queued','sending')
        AND r.sent_at IS NULL AND r.ses_message_id IS NULL
        AND NOT EXISTS(SELECT 1 FROM edm_email_send_attempts a WHERE a.recipient_id=r.id)) AND ${guard}`)
      .bind(campaignId, campaignId, previousRate),
    db.prepare(`UPDATE edm_email_clocks SET next_at=MAX(?,
        COALESCE((SELECT next_at FROM edm_email_clocks WHERE id=?),0),
        COALESCE((SELECT next_at FROM edm_email_clocks WHERE id=?),0))
      WHERE id IN (?,?) AND ${guard}`)
      .bind(now, `dispatch:campaign:${campaignId}`, `dispatch:account:campaign:${campaignId}`,
        `reserve:campaign:${campaignId}`, `reserve:account:campaign:${campaignId}`, campaignId, previousRate),
    // The dispatch clock retains any shared 429 cooldown, including clocks
    // written by older releases. Remaining rows retain every other Resend slot,
    // but other providers cannot advance this clock beyond its existing tail.
    db.prepare(`UPDATE edm_email_clocks SET next_at=MAX(?,
        COALESCE((SELECT next_at FROM edm_email_clocks WHERE id='dispatch:account:resend'),0),
        MIN(next_at,COALESCE((SELECT MAX(due_at)+? FROM edm_email_schedule),0)))
      WHERE id='reserve:account:resend' AND ${guard}`)
      .bind(now, RESEND_INTERVAL, campaignId, previousRate),
  ];
}

export async function emailSendDelay(
  db: D1Database,
  recipientId: string,
  campaignId: string,
  rate: number | null,
  resend: boolean,
  now = Date.now(),
): Promise<number> {
  const interval = Math.ceil(60000 / (validSendRate(rate) ? rate : 50));
  // All Resend sends in this installation share a conservative 4 requests/sec
  // ceiling, including different keys for the same team. Other API clients may
  // still exhaust the team's allowance; Retry-After adds a shared cooldown.
  const account = resend ? 'resend' : `campaign:${campaignId}`;
  const reserveCampaign = `reserve:campaign:${campaignId}`;
  const reserveAccount = `reserve:account:${account}`;
  const dispatchCampaign = `dispatch:campaign:${campaignId}`;
  const dispatchAccount = `dispatch:account:${account}`;
  const accountInterval = resend ? RESEND_INTERVAL : interval;
  const statement = (sql: string, ...values: (string | number)[]) =>
    db.prepare(sql).bind(...values);
  await db.batch([
    ...[reserveCampaign, reserveAccount, dispatchCampaign, dispatchAccount].map((id) =>
      statement('INSERT OR IGNORE INTO edm_email_clocks(id) VALUES (?)', id),
    ),
    statement(
      `UPDATE edm_email_clocks SET next_at=MAX(next_at,?,(SELECT next_at FROM edm_email_clocks WHERE id=?))+?
      WHERE id=? AND NOT EXISTS(SELECT 1 FROM edm_email_schedule WHERE recipient_id=?)`,
      now,
      reserveAccount,
      interval,
      reserveCampaign,
      recipientId,
    ),
    statement(
      `UPDATE edm_email_clocks SET next_at=(SELECT next_at FROM edm_email_clocks WHERE id=?)-?+?
      WHERE id=? AND NOT EXISTS(SELECT 1 FROM edm_email_schedule WHERE recipient_id=?)`,
      reserveCampaign,
      interval,
      accountInterval,
      reserveAccount,
      recipientId,
    ),
    statement(
      `INSERT OR IGNORE INTO edm_email_schedule(recipient_id,due_at)
      SELECT ?,next_at-? FROM edm_email_clocks WHERE id=?`,
      recipientId,
      interval,
      reserveCampaign,
    ),
  ]);
  const schedule = await statement(
    'SELECT due_at FROM edm_email_schedule WHERE recipient_id=?',
    recipientId,
  ).first<{ due_at: number }>();
  if (!schedule) throw new Error('Email schedule unavailable');
  if (schedule.due_at > now) return schedule.due_at - now;

  // Check again at dispatch time: delayed queue deliveries must never catch up
  // by bursting. A fresh reservation spreads late/retried messages back out.
  const token = crypto.randomUUID();
  const result = await db.batch([
    statement(
      `UPDATE edm_email_clocks SET next_at=?+?,token=? WHERE id=? AND next_at<=?
      AND (SELECT next_at FROM edm_email_clocks WHERE id=?)<=?`,
      now,
      interval,
      token,
      dispatchCampaign,
      now,
      dispatchAccount,
      now,
    ),
    statement(
      `UPDATE edm_email_clocks SET next_at=?+? WHERE id=?
      AND EXISTS(SELECT 1 FROM edm_email_clocks WHERE id=? AND token=?)`,
      now,
      accountInterval,
      dispatchAccount,
      dispatchCampaign,
      token,
    ),
  ]);
  if (result[0].meta.changes) return 0;
  await statement('DELETE FROM edm_email_schedule WHERE recipient_id=?', recipientId).run();
  // Re-reserve on the next delivery; do not consume Queue failure retries.
  return interval;
}

export async function resendCooldown(db: D1Database, seconds: number) {
  const until = Date.now() + seconds * 1000;
  await db.batch(
    ['reserve:account:resend', 'dispatch:account:resend'].map((id) =>
      db
        .prepare(
          'INSERT INTO edm_email_clocks(id,next_at) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET next_at=MAX(next_at,excluded.next_at)',
        )
        .bind(id, until),
    ),
  );
}

export async function deferEmail(
  env: any,
  message: { body: unknown; ack(): void; retry(options: any): void },
  milliseconds: number,
) {
  const delaySeconds = Math.min(86400, Math.max(1, Math.ceil(milliseconds / 1000)));
  if (!env.EMAIL_QUEUE) {
    message.retry({ delaySeconds });
    return;
  }
  // Publish first. If publishing fails the original remains unacknowledged.
  // Duplicate publications are safe because dispatch has a durable attempt lock.
  await env.EMAIL_QUEUE.send((message as typeof message & { queueBody?: unknown }).queueBody ?? message.body, { delaySeconds });
  message.ack();
}
