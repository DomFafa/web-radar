/** D1 batches are serialized transactions. No in-memory counters or worker sleeps. */
export const validSendRate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 200;

export async function emailSendDelay(
  db: D1Database,
  recipientId: string,
  campaignId: string,
  rate: number | null,
  resend: boolean,
  now = Date.now(),
): Promise<number> {
  const interval = Math.ceil(60000 / (validSendRate(rate) ? rate : 50));
  // All Resend sends in this installation share a conservative 2 requests/sec
  // ceiling, including different keys for the same team. Other API clients may
  // still exhaust the team's allowance; Retry-After adds a shared cooldown.
  const account = resend ? 'resend' : `campaign:${campaignId}`;
  const reserveCampaign = `reserve:campaign:${campaignId}`;
  const reserveAccount = `reserve:account:${account}`;
  const dispatchCampaign = `dispatch:campaign:${campaignId}`;
  const dispatchAccount = `dispatch:account:${account}`;
  const accountInterval = resend ? 500 : interval;
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
  await env.EMAIL_QUEUE.send(message.body, { delaySeconds });
  message.ack();
}
