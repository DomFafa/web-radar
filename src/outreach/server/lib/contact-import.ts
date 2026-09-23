type ImportContact = {
  email: string;
  name?: string;
  company?: string;
  website?: string;
  industry?: string;
  region?: string;
  tags?: string[];
};

export async function importContactsBatch(database: D1Database, userId: string,
  input: ImportContact[], groupId: string | undefined, overwrite: boolean,
  job?: { id: string; batchIndex: number }) {
  const rows = new Map<string, Record<string, unknown>>();
  const report = input.map((item, index) => ({
    row: (job?.batchIndex || 0) * 500 + index + 1,
    email: typeof item?.email === "string" ? item.email.trim().toLowerCase() : "",
    status: "", reason: "",
  }));
  const lastIndex = new Map<string, number>();
  for (const [index, item] of input.entries()) {
    const entry = report[index];
    const { email } = entry;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      entry.status = "failed"; entry.reason = "邮箱为空或格式无效"; continue;
    }
    const previous = lastIndex.get(email);
    if (previous !== undefined) {
      const duplicate = overwrite ? report[previous] : entry;
      duplicate.status = "skipped";
      duplicate.reason = overwrite ? "同批邮箱重复，采用最后一行" : "同批邮箱重复，采用第一行";
      if (!overwrite) continue;
    }
    lastIndex.set(email, index);
    rows.set(email, {
      id: crypto.randomUUID(), email,
      name: item.name?.trim() || null, company: item.company?.trim() || null,
      website: item.website?.trim() || null, industry: item.industry?.trim() || null,
      region: item.region?.trim() || null,
      tags: item.tags?.length ? JSON.stringify(item.tags) : null,
    });
  }
  const json = JSON.stringify([...rows.values()]);
  const now = Math.floor(Date.now() / 1000);
  const statements: D1PreparedStatement[] = [];
  if (job) {
    // Duplicate retries fail before any writes; the entire batch rolls back.
    statements.push(database.prepare("INSERT INTO edm_contact_import_batches(job_id, batch_index) VALUES (?, ?)")
      .bind(job.id, job.batchIndex));
  }
  const reportSql = `SELECT json_extract(j.value, '$.row') AS row_number,
    json_extract(j.value, '$.email') AS email,
    CASE WHEN json_extract(j.value, '$.status') <> '' THEN json_extract(j.value, '$.status')
      WHEN EXISTS(SELECT 1 FROM edm_contacts WHERE user_id = ? AND email = json_extract(j.value, '$.email'))
      THEN ? ELSE 'imported' END AS status,
    CASE WHEN json_extract(j.value, '$.reason') <> '' THEN json_extract(j.value, '$.reason')
      WHEN EXISTS(SELECT 1 FROM edm_contacts WHERE user_id = ? AND email = json_extract(j.value, '$.email'))
      THEN ? ELSE '' END AS reason FROM json_each(?) j`;
  const reportParams = [userId, overwrite ? "updated" : "skipped", userId,
    overwrite ? "已覆盖；保留原订阅状态" : "邮箱已存在，未覆盖，保留原分组", JSON.stringify(report)];
  if (job) {
    statements.push(database.prepare(`INSERT INTO edm_contact_import_rows(job_id, row_number, email, status, reason)
      SELECT ?, r.* FROM (${reportSql}) r`).bind(job.id, ...reportParams));
  }
  const reportIndex = statements.length;
  statements.push(database.prepare(reportSql).bind(...reportParams));
  if (overwrite) {
    statements.push(database.prepare(`UPDATE edm_contacts SET
      name = json_extract(j.value, '$.name'), company = json_extract(j.value, '$.company'),
      website = json_extract(j.value, '$.website'), industry = json_extract(j.value, '$.industry'),
      region = json_extract(j.value, '$.region'), tags = json_extract(j.value, '$.tags'),
      group_id = COALESCE(?, edm_contacts.group_id), updated_at = ?
      FROM json_each(?) AS j
      WHERE edm_contacts.user_id = ? AND edm_contacts.email = json_extract(j.value, '$.email')`)
      .bind(groupId || null, now, json, userId));
  }
  statements.push(database.prepare(`INSERT INTO edm_contacts
    (id, user_id, email, name, company, website, industry, region, tags, group_id, source, created_at, updated_at)
    SELECT json_extract(j.value, '$.id'), ?, json_extract(j.value, '$.email'),
      json_extract(j.value, '$.name'), json_extract(j.value, '$.company'),
      json_extract(j.value, '$.website'), json_extract(j.value, '$.industry'),
      json_extract(j.value, '$.region'), json_extract(j.value, '$.tags'), ?, 'csv_import', ?, ?
    FROM json_each(?) AS j WHERE NOT EXISTS
      (SELECT 1 FROM edm_contacts WHERE user_id = ? AND email = json_extract(j.value, '$.email'))`)
    .bind(userId, groupId || null, now, now, json, userId));
  if (groupId) {
    statements.push(database.prepare(`UPDATE edm_contact_groups SET contact_count =
      (SELECT COUNT(*) FROM edm_contacts WHERE edm_contacts.group_id = edm_contact_groups.id AND edm_contacts.user_id = ?)
      WHERE user_id = ?`).bind(userId, userId));
  }
  if (job) {
    statements.push(database.prepare(`UPDATE edm_contact_import_jobs SET
      processed = (SELECT COUNT(*) FROM edm_contact_import_rows WHERE job_id = ?),
      imported = (SELECT COUNT(*) FROM edm_contact_import_rows WHERE job_id = ? AND status = 'imported'),
      updated = (SELECT COUNT(*) FROM edm_contact_import_rows WHERE job_id = ? AND status = 'updated'),
      skipped = (SELECT COUNT(*) FROM edm_contact_import_rows WHERE job_id = ? AND status = 'skipped'),
      failed = (SELECT COUNT(*) FROM edm_contact_import_rows WHERE job_id = ? AND status = 'failed'),
      error = NULL, updated_at = ? WHERE id = ? AND user_id = ?`)
      .bind(job.id, job.id, job.id, job.id, job.id, now, job.id, userId));
  }
  // Results, contact writes and counts commit together, including invalid rows.
  const results = await database.batch(statements);
  const details = results[reportIndex].results as Array<{ status: string }>;
  const count = (status: string) => details.filter((row) => row.status === status).length;
  return { imported: count("imported"), updated: count("updated"), skipped: count("skipped"),
    failed: count("failed"), total: input.length };
}
