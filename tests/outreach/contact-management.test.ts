import { d1 } from "./sqlite";
import { test } from "vitest";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { Hono } from "hono";
import { contactRoutes } from "../../src/outreach/server/routes/contact.routes";

test("import reports, retries, ownership, bulk selection and group deletion", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync("migrations/0007_outreach.sql","utf8"));
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES
    ('u','test','u@example.com',0,0), ('v','other','v@example.com',0,0);
    INSERT INTO edm_contact_groups(id,user_id,name,contact_count,created_at,updated_at) VALUES
    ('g','u','Group',999,0,0), ('other','v','Other',0,0,0), ('move','u','Move',0,0,0);`);
  const db = d1(sqlite);
  const app = new Hono<any>();
  app.use("*", async (c, next) => {
    c.set("user", { id: c.req.header("x-test-user") || "u", role: "owner" });
    await next();
  });
  app.route("/contacts", contactRoutes);
  const req = (path: string, method = "GET", body?: any, user = "u") => app.request(`/contacts${path}`, {
    method, headers: { "Content-Type": "application/json", "x-test-user": user },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }, { DB: db });
  try {
    const created = await req("/imports", "POST", { name: "test.csv", groupId: "g", total: 1000 });
    assert.equal(created.status, 201);
    const { data: { id } } = await created.json() as any;
    const chunk = Array.from({ length: 500 }, (_, n) => ({ email: `person${n}@example.com` }));
    const first = await req(`/imports/${id}/batches`, "POST", { batchIndex: 0, contacts: chunk });
    assert.equal(first.status, 200);
    assert.equal(((await first.json()) as any).data.imported, 500);
    const retry = await req(`/imports/${id}/batches`, "POST", { batchIndex: 0, contacts: chunk });
    assert.equal(retry.status, 200);
    assert.equal(((await retry.json()) as any).data.imported, 500);
    const second = await req(`/imports/${id}/batches`, "POST", { batchIndex: 1,
      contacts: [...chunk.slice(0, 498), { email: "bad" }, { email: "=formula@example.com" }] });
    assert.equal(second.status, 200);
    const summary = ((await second.json()) as any).data;
    assert.equal(summary.imported, 1);
    assert.equal(summary.skipped, 498);
    assert.equal(summary.failed, 1);
    const details = await req(`/imports/${id}/rows?page=6`);
    assert.equal(details.status, 200);
    const report = await details.json() as any;
    assert.equal(report.job.processed, 1000);
    assert.equal(report.job.imported, 501);
    assert.equal(report.data[0].row_number, 501);
    const failures = await (await req(`/imports/${id}/rows?status=failed`)).json() as any;
    assert.equal(failures.meta.total, 1);
    assert.equal(failures.data[0].email, "bad");
    const csv = await req(`/imports/${id}/export`);
    const content = await csv.text();
    assert.match(content, /失败/);
    assert.match(content, /邮箱为空或格式无效/);
    assert.match(content, /'=formula@example.com/);
    assert.equal(content.trim().split("\r\n").length, 1001);
    assert.equal((await req(`/imports/${id}/export`, "GET", undefined, "v")).status, 404);
    assert.equal((await req(`/imports/${id}/batches`, "POST", { batchIndex: 0, contacts: chunk }, "v")).status, 404);
    assert.equal(((await (await req("/imports", "GET", undefined, "v")).json()) as any).data.length, 0);
    const groupResponse = await (await req("/groups")).json() as any;
    assert.equal(groupResponse.data.find((g: any) => g.id === "g").contactCount, 501);
    assert.equal((await req("/batch-delete", "POST", {})).status, 400);
    assert.equal((await req("/batch-move", "POST", { all: true, groupId: "other" })).status, 404);
    const one = sqlite.prepare("SELECT id FROM edm_contacts WHERE email='person0@example.com'").get()!.id;
    const moved = await req("/batch-move", "POST", { all: true, filters: { groupId: "g" }, excludedIds: [one], groupId: "move" });
    assert.equal(((await moved.json()) as any).data.moved, 500);
    assert.equal(sqlite.prepare("SELECT contact_count FROM edm_contact_groups WHERE id='g'").get()!.contact_count, 1);
    assert.equal(sqlite.prepare("SELECT contact_count FROM edm_contact_groups WHERE id='move'").get()!.contact_count, 500);
    sqlite.exec(`INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('other-contact','v','private@example.com',0,0);
      INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,created_at,updated_at)
      VALUES ('campaign','u','test','from@example.com','test','paused',0,0);`);
    sqlite.prepare("INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,created_at) VALUES ('recipient','campaign',?,'queued',0)").run(one);
    const deleted = await req("/batch-delete", "POST", { all: true, filters: {} });
    assert.deepEqual((await deleted.json() as any).data, { deleted: 500, protected: 1 });
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM edm_contacts WHERE user_id='v'").get()!.n, 1);
    assert.equal(sqlite.prepare("SELECT contact_count FROM edm_contact_groups WHERE id='move'").get()!.contact_count, 0);
    const protectedGroup = await req("/groups/g?deleteContacts=true", "DELETE");
    assert.equal((await protectedGroup.json() as any).data.deleted, false);
    const removedGroup = await req("/groups/g", "DELETE");
    assert.equal((await removedGroup.json() as any).data.deleted, true);
    assert.equal(sqlite.prepare("SELECT group_id FROM edm_contacts WHERE id=?").get(one)!.group_id, null);
    assert.equal((await req("/groups/other?deleteContacts=true", "DELETE")).status, 404);
    assert.equal((await req("/groups/move?deleteContacts=true", "DELETE")).status, 200);
  } finally { sqlite.close(); }
});
