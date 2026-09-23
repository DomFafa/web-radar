export type ContactSelection = {
  ids?: string[];
  all?: boolean;
  excludedIds?: string[];
  filters?: { search?: string; groupId?: string; tag?: string };
};

export function contactSelection(userId: string, selection: ContactSelection) {
  const clauses = ["edm_contacts.user_id = ?"];
  const params: unknown[] = [userId];
  const ids = selection.ids;
  if (selection.all === true) {
    const filters = selection.filters || {};
    if (filters.search) { clauses.push("edm_contacts.email LIKE ?"); params.push(`%${filters.search}%`); }
    if (filters.groupId === "null") clauses.push("edm_contacts.group_id IS NULL");
    else if (filters.groupId) { clauses.push("edm_contacts.group_id = ?"); params.push(filters.groupId); }
    if (filters.tag) {
      clauses.push(`EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(edm_contacts.tags) THEN edm_contacts.tags ELSE '[]' END)
        WHERE CAST(value AS TEXT) = ?)`);
      params.push(filters.tag);
    }
    if (selection.excludedIds?.length) {
      clauses.push("edm_contacts.id NOT IN (SELECT value FROM json_each(?))");
      params.push(JSON.stringify(selection.excludedIds));
    }
  } else if (Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === "string")) {
    clauses.push("edm_contacts.id IN (SELECT value FROM json_each(?))");
    params.push(JSON.stringify(ids));
  } else throw new Error("请选择联系人");
  return { sql: clauses.join(" AND "), params };
}

export const refreshContactCounts = (database: D1Database, userId: string) => database.prepare(`
  UPDATE edm_contact_groups SET contact_count = (SELECT COUNT(*) FROM edm_contacts
    WHERE edm_contacts.group_id = edm_contact_groups.id AND edm_contacts.user_id = ?)
  WHERE user_id = ?`).bind(userId, userId);

// Keep recipients of unfinished campaigns intact, including paused campaigns.
export const deletableContact = `NOT EXISTS (SELECT 1 FROM edm_campaign_recipients r
  JOIN edm_campaigns c ON c.id = r.campaign_id WHERE r.contact_id = edm_contacts.id
  AND c.status NOT IN ('completed', 'cancelled', 'failed', 'draft'))`;

export async function bulkContacts(database: D1Database, userId: string, selection: ContactSelection,
  operation: "delete" | "move", groupId?: string | null) {
  const where = contactSelection(userId, selection);
  const result = await database.batch([
    database.prepare(`SELECT COUNT(*) AS n FROM edm_contacts WHERE ${where.sql}`).bind(...where.params),
    operation === "delete"
      ? database.prepare(`DELETE FROM edm_contacts WHERE ${where.sql} AND ${deletableContact}`).bind(...where.params)
      : database.prepare(`UPDATE edm_contacts SET group_id = ?, updated_at = ? WHERE ${where.sql}`)
        .bind(groupId || null, Math.floor(Date.now() / 1000), ...where.params),
    refreshContactCounts(database, userId),
  ]);
  const matched = Number((result[0].results[0] as any).n);
  const changed = result[1].meta.changes;
  return { changed, protected: matched - changed };
}
