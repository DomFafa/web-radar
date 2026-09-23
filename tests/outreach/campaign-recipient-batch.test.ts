import { DatabaseSync } from "node:sqlite";
import { test } from "vitest";
import assert from "node:assert/strict";
import { addCampaignRecipients } from "../../src/outreach/server/lib/campaign-recipient-batch";

test("large recipient preparation is batched, idempotent, tenant and subscription scoped", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE edm_contacts (id TEXT PRIMARY KEY, user_id TEXT, subscription_status TEXT);
    CREATE INDEX idx_contacts_user ON edm_contacts(user_id);
    CREATE INDEX idx_contacts_subscription ON edm_contacts(subscription_status);
    CREATE TABLE edm_campaigns (id TEXT PRIMARY KEY, user_id TEXT, status TEXT, total_recipients INTEGER, updated_at INTEGER);
    CREATE TABLE edm_campaign_recipients (id TEXT PRIMARY KEY, campaign_id TEXT, contact_id TEXT, variables TEXT, status TEXT, created_at INTEGER);
    CREATE INDEX recipients_campaign ON edm_campaign_recipients(campaign_id);
    INSERT INTO edm_campaigns VALUES ('campaign', 'user', 'draft', 0, 0);
    INSERT INTO edm_contacts VALUES ('foreign', 'other', 'subscribed'), ('optout', 'user', 'unsubscribed');`);
  let statementCount = 0;
  const adapter = {
    prepare(sql: string) { return { bind(...params: any[]) { return { sql, params }; } }; },
    async batch(statements: { sql: string; params: any[] }[]) {
      statementCount += statements.length;
      db.exec("BEGIN");
      try {
        const results = statements.map(({ sql, params }) => {
          if (sql.startsWith("INSERT")) {
            const plan = db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...params);
            assert.ok(plan.some((row) => String(row.detail).includes("SEARCH c USING INDEX sqlite_autoindex_edm_contacts_1 (id=?)")), JSON.stringify(plan));
          }
          return { meta: { changes: Number(db.prepare(sql).run(...params).changes) } };
        });
        db.exec("COMMIT");
        return results;
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    },
  } as unknown as D1Database;
  try {
    const rows = Array.from({ length: 15032 }, (_, i) => ({ id: `contact${i}`, name: `Name ${i}`, company: null, industry: null }));
    const insert = db.prepare("INSERT INTO edm_contacts VALUES (?, 'user', 'subscribed')");
    db.exec("BEGIN");
    rows.forEach((row) => insert.run(row.id));
    db.exec("COMMIT");
    assert.equal((await addCampaignRecipients(adapter, "campaign", "user", rows)).added, 15032);
    assert.equal(statementCount, 32);
    assert.equal(db.prepare("SELECT total_recipients FROM edm_campaigns").get()!.total_recipients, 15032);
    assert.equal(db.prepare("SELECT status FROM edm_campaigns").get()!.status, "draft");
    assert.equal((await addCampaignRecipients(adapter, "campaign", "user", rows)).added, 0);
    const excluded = ["foreign", "optout"].map((id) => ({ id, name: null, company: null, industry: null }));
    assert.equal((await addCampaignRecipients(adapter, "campaign", "user", excluded)).added, 0);
    assert.equal((await addCampaignRecipients(adapter, "campaign", "other", rows)).added, 0);
    const variables = JSON.parse(String(db.prepare("SELECT variables FROM edm_campaign_recipients LIMIT 1").get()!.variables));
    assert.equal(variables.name, "Name 0");
    db.exec("UPDATE edm_campaigns SET status = 'sending'; INSERT INTO edm_contacts VALUES ('new', 'user', 'subscribed')");
    assert.equal((await addCampaignRecipients(adapter, "campaign", "user", [{ ...rows[0], id: "new" }])).added, 0);
    db.exec("UPDATE edm_campaigns SET status = 'completed'");
    assert.equal((await addCampaignRecipients(adapter, "campaign", "user", [{ ...rows[0], id: "new" }])).added, 1);
    assert.equal(db.prepare("SELECT status FROM edm_campaigns").get()!.status, "paused");
  } finally { db.close(); }
});
