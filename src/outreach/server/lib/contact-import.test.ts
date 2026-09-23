import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import assert from "node:assert/strict";
import { importContactsBatch } from "./contact-import";
import { readFileSync } from "node:fs";

test("batch import skips duplicates, overwrites in place and keeps group counts", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE edm_contacts (
    id TEXT PRIMARY KEY, user_id TEXT, email TEXT, name TEXT, company TEXT, website TEXT,
    industry TEXT, region TEXT, tags TEXT, group_id TEXT, source TEXT,
    subscription_status TEXT DEFAULT 'subscribed', created_at INTEGER, updated_at INTEGER);
    CREATE INDEX contacts_email ON contacts(email);
    CREATE TABLE edm_contact_groups (id TEXT PRIMARY KEY, user_id TEXT, contact_count INTEGER);
    INSERT INTO edm_contact_groups VALUES ('old', 'u', 1), ('new', 'u', 0);
    INSERT INTO edm_contacts(id,user_id,email,name,group_id,subscription_status)
      VALUES ('existing','u','a@example.com','Old','old','unsubscribed'),
             ('other-user','v','a@example.com','Other',NULL,'subscribed');`);
  let statementCount = 0;
  const adapter = {
    prepare(sql: string) {
      return { bind(...params: any[]) { return { sql, params }; } };
    },
    async batch(statements: { sql: string; params: any[] }[]) {
      statementCount += statements.length;
      db.exec("BEGIN");
      try {
        const results = statements.map(({ sql, params }) => /^\s*SELECT/i.test(sql)
          ? { results: db.prepare(sql).all(...params), meta: { changes: 0 } }
          : { results: [], meta: { changes: Number(db.prepare(sql).run(...params).changes) } });
        db.exec("COMMIT");
        return results;
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    },
  } as unknown as D1Database;
  try {
    const skipped = await importContactsBatch(adapter, "u", [
      { email: " A@EXAMPLE.COM ", name: "Ignored" },
      { email: "b@example.com" }, { email: "b@example.com" }, { email: "" },
    ], "new", false);
    assert.deepEqual(skipped, { imported: 1, updated: 0, skipped: 2, failed: 1, total: 4 });
    const result = await importContactsBatch(adapter, "u", [
      { email: "A@example.com", name: "Updated" }, { email: "a@example.com", name: "Last" },
    ], "new", true);
    assert.deepEqual(result, { imported: 0, updated: 1, skipped: 1, failed: 0, total: 2 });
    const row = db.prepare("SELECT * FROM edm_contacts WHERE id='existing'").get()!;
    assert.equal(row.name, "Last");
    assert.equal(row.subscription_status, "unsubscribed");
    assert.equal(row.group_id, "new");
    assert.equal(row.company, null);
    assert.equal(db.prepare("SELECT name FROM edm_contacts WHERE id='other-user'").get()!.name, "Other");
    assert.equal(db.prepare("SELECT contact_count FROM edm_contact_groups WHERE id='old'").get()!.contact_count, 0);
    assert.equal(db.prepare("SELECT contact_count FROM edm_contact_groups WHERE id='new'").get()!.contact_count, 2);
    statementCount = 0;
    const bulk = await importContactsBatch(adapter, "u",
      Array.from({ length: 500 }, (_, i) => ({ email: `bulk${i}@example.com` })), "new", false);
    assert.equal(bulk.imported, 500);
    assert.equal(statementCount, 3);
    const repeat = await importContactsBatch(adapter, "u", [{ email: "a@example.com", name: "No move" }], undefined, true);
    assert.equal(repeat.updated, 1);
    assert.equal(db.prepare("SELECT group_id FROM edm_contacts WHERE id='existing'").get()!.group_id, "new");
    db.exec("CREATE TABLE edm_users(id TEXT PRIMARY KEY); INSERT INTO edm_users VALUES ('u');");
    db.exec(readFileSync("src/db/migrations/0007_contact_import_reports.sql", "utf8"));
    db.prepare(`INSERT INTO edm_contact_import_jobs(id,user_id,name,group_name,total,created_at,updated_at)
      VALUES ('job','u','test','new',3,0,0)`).run();
    const input = [{ email: "report@example.com" }, { email: "a@example.com" }, { email: "bad" }];
    const persisted = await importContactsBatch(adapter, "u", input, "new", false, { id: "job", batchIndex: 0 });
    assert.deepEqual(persisted, { imported: 1, updated: 0, skipped: 1, failed: 1, total: 3 });
    assert.deepEqual({ ...db.prepare("SELECT processed, imported, skipped, failed FROM edm_contact_import_jobs WHERE id='job'").get() },
      { processed: 3, imported: 1, skipped: 1, failed: 1 });
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM edm_contact_import_rows WHERE job_id='job'").get()!.n, 3);
    assert.match(String(db.prepare("SELECT reason FROM edm_contact_import_rows WHERE row_number=2").get()!.reason), /保留原分组/);
    await assert.rejects(() => importContactsBatch(adapter, "u", input, "new", true, { id: "job", batchIndex: 0 }));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM edm_contacts WHERE email='report@example.com'").get()!.n, 1);
    db.exec(`CREATE TRIGGER reject_contact BEFORE INSERT ON contacts WHEN NEW.email='reject@example.com'
      BEGIN SELECT RAISE(ABORT, 'test failure'); END;`);
    await assert.rejects(() => importContactsBatch(adapter, "u", [{ email: "reject@example.com" }], "new", false, { id: "job", batchIndex: 1 }));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM edm_contact_import_rows WHERE row_number=501").get()!.n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM edm_contact_import_batches WHERE batch_index=1").get()!.n, 0);
  } finally { db.close(); }
});
