export async function addCampaignRecipients(database: D1Database, campaignId: string, userId: string, contacts: { id: string; name: string | null; company: string | null; industry: string | null }[]) {
  const rows = Array.from(new Map(contacts.map((contact) => [contact.id, contact])).values()).map((contact) => ({
    id: crypto.randomUUID(), contactId: contact.id,
    variables: JSON.stringify({ name: contact.name || "", company: contact.company || "", industry: contact.industry || "" }),
  }));
  const now = Math.floor(Date.now() / 1000);
  // One transaction avoids per-recipient network round trips and partial totals.
  const statements: D1PreparedStatement[] = [];
  for (let offset = 0; offset < rows.length; offset += 500) {
    // Keep JSON rows outermost: subscription indexes otherwise make SQLite
    // scan the entire JSON batch once for every subscribed contact.
    statements.push(database.prepare(`INSERT INTO edm_campaign_recipients (id, campaign_id, contact_id, variables, status, created_at)
      SELECT json_extract(j.value, '$.id'), ?, c.id, json_extract(j.value, '$.variables'), 'queued', ?
      FROM json_each(?) j CROSS JOIN edm_contacts c ON c.id = json_extract(j.value, '$.contactId')
      WHERE c.user_id = ? AND c.subscription_status = 'subscribed'
      AND EXISTS (SELECT 1 FROM edm_campaigns WHERE id = ? AND user_id = ? AND status != 'sending')
      AND c.id NOT IN (SELECT contact_id FROM edm_campaign_recipients WHERE campaign_id = ?)`)
      .bind(campaignId, now, JSON.stringify(rows.slice(offset, offset + 500)), userId, campaignId, userId, campaignId));
  }
  const results = await database.batch([
    ...statements,
    database.prepare(`UPDATE edm_campaigns SET total_recipients = (SELECT COUNT(*) FROM edm_campaign_recipients WHERE campaign_id = ?),
      status = CASE WHEN status IN ('completed', 'failed') AND EXISTS
        (SELECT 1 FROM edm_campaign_recipients WHERE campaign_id = edm_campaigns.id AND status = 'queued') THEN 'paused' ELSE status END,
      updated_at = ? WHERE id = ? AND user_id = ?`).bind(campaignId, now, campaignId, userId),
  ]);
  const added = results.slice(0, -1).reduce((sum, result) => sum + Number(result.meta.changes || 0), 0);
  return { added, skipped: contacts.length - added, total: contacts.length };
}
