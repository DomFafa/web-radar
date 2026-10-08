export interface OutboundSnapshot {
  workspaceId: string;
  ownerId?: string | null;
  source: 'edm' | 'site';
  businessId: string;
  targetId: string;
  attemptId: string;
  contactId?: string | null;
  websiteUrl?: string | null;
  recipientEmail?: string | null;
  senderEmail?: string | null;
  senderName?: string | null;
  replyTo?: string | null;
  subject: string;
  bodyHtml?: string | null;
  bodyText?: string | null;
  provider: string;
}

/** Save the actual prepared content before its external side effect. Retries cannot replace it. */
export async function captureOutbound(db: D1Database, snapshot: OutboundSnapshot): Promise<string> {
  const id = `${snapshot.source}/${encodeURIComponent(snapshot.targetId)}/${encodeURIComponent(snapshot.attemptId)}`;
  await db.prepare(`INSERT INTO wr_crm_outbound_snapshots
    (id,workspace_id,owner_id,source,business_id,target_id,attempt_id,contact_id,website_url,subject,body_html,body_text,provider,status,created_at,recipient_email,sender_email,sender_name,reply_to)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'prepared',?,?,?,?,?) ON CONFLICT(source,target_id,attempt_id) DO NOTHING`)
    .bind(id, snapshot.workspaceId, snapshot.ownerId ?? null, snapshot.source, snapshot.businessId,
      snapshot.targetId, snapshot.attemptId, snapshot.contactId ?? null, snapshot.websiteUrl ?? null,
      snapshot.subject, snapshot.bodyHtml ?? null, snapshot.bodyText ?? '', snapshot.provider, new Date().toISOString(),
      snapshot.recipientEmail ?? null, snapshot.senderEmail ?? null, snapshot.senderName ?? null, snapshot.replyTo ?? null).run();
  return id;
}

export async function completeOutbound(db: D1Database, id: string, outcome: {
  status: 'sent' | 'submitted' | 'submitted_unconfirmed' | 'failed' | 'uncertain';
  providerMessageId?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  await db.prepare(`UPDATE wr_crm_outbound_snapshots SET status=?,provider_message_id=?,error_message=?,completed_at=?
    WHERE id=? AND status NOT IN ('sent','submitted')`)
    .bind(outcome.status, outcome.providerMessageId ?? null, outcome.errorMessage ?? null, new Date().toISOString(), id).run();
}

export const readOutboundReceipt = (db: D1Database, targetId: string) => db.prepare(`
  SELECT provider_message_id,completed_at FROM wr_crm_outbound_snapshots
  WHERE source='edm' AND target_id=? AND status='sent' AND provider_message_id IS NOT NULL
  ORDER BY created_at DESC LIMIT 1`).bind(targetId).first<{ provider_message_id: string; completed_at: string }>();
