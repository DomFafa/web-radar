export const readAttempt = (db: D1Database, id: string) => db.prepare(
  "SELECT started_at, result FROM edm_email_send_attempts WHERE recipient_id = ?"
).bind(id).first<{ started_at: number; result: string | null }>();

export async function claimAttempt(db: D1Database, id: string) {
  const result = await db.prepare("INSERT OR IGNORE INTO edm_email_send_attempts (recipient_id, started_at) VALUES (?, ?)").bind(id, Date.now()).run();
  return Number(result.meta.changes) === 1;
}

export const saveAttempt = (db: D1Database, id: string, messageId: string) => db.prepare(
  "UPDATE edm_email_send_attempts SET result = ? WHERE recipient_id = ?"
).bind(JSON.stringify({ messageId, sentAt: Date.now() }), id).run();
