export const readAttempt = (db: D1Database, id: string) => db.prepare(
  "SELECT started_at, result FROM edm_email_send_attempts WHERE recipient_id = ?"
).bind(id).first<{ started_at: number; result: string | null }>();

export async function claimAttempt(db: D1Database, id: string) {
  const result = await db.prepare("INSERT OR IGNORE INTO edm_email_send_attempts (recipient_id, started_at) VALUES (?, ?)").bind(id, Date.now()).run();
  return Number(result.meta.changes) === 1;
}

export interface ProviderReceiptMetadata {
  providerStatus?: string;
  queuedReason?: string;
}

export const saveAttempt = (db: D1Database, id: string, messageId: string, metadata: ProviderReceiptMetadata = {}) => {
  const now = Date.now();
  const result = JSON.stringify({ messageId, sentAt: now, ...metadata });
  const patch = JSON.stringify({ messageId, sentAt: now, ...metadata,
    ...(metadata.providerStatus !== undefined && metadata.queuedReason === undefined ? { queuedReason: null } : {}),
  });
  // An ID-only receipt replay must retain the original provider state and
  // acceptance time. A different message ID starts its own receipt metadata.
  return db.prepare(`UPDATE edm_email_send_attempts SET result = CASE
    WHEN json_extract(result,'$.messageId')=? THEN
      json_set(json_patch(result,?), '$.sentAt', COALESCE(json_extract(result,'$.sentAt'),?))
    ELSE ? END WHERE recipient_id=?`)
    .bind(messageId, patch, now, result, id).run();
};
