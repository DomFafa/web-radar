import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readAttempt, claimAttempt, saveAttempt } from "./email-attempt";

test("duplicate queue deliveries cannot claim the same send; saved results survive retry", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("CREATE TABLE edm_email_send_attempts(recipient_id TEXT PRIMARY KEY, started_at INTEGER, result TEXT)");
  const db = { prepare(sql: string) { return { bind(...params: any[]) { return {
    async first() { return sqlite.prepare(sql).get(...params) || null; },
    async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...params).changes) } }; },
  }; } }; } } as unknown as D1Database;
  try {
    assert.equal(await readAttempt(db, "one"), null);
    const results = await Promise.all(Array.from({ length: 10 }, () => claimAttempt(db, "one")));
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal((await readAttempt(db, "one"))!.result, null);
    await saveAttempt(db, "one", "provider-result");
    assert.equal(JSON.parse((await readAttempt(db, "one"))!.result!).messageId, "provider-result");
    assert.equal(await claimAttempt(db, "one"), false);
    assert.equal(await claimAttempt(db, "two"), true);
  } finally { sqlite.close(); }
});
