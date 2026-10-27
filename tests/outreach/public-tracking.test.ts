import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import api from "../../src/outreach/server/public";
import type { Bindings } from "../../src/outreach/shared/types";
import { d1 } from "./sqlite";

const secret = "public-tracking-test-secret";
const destination = "https://example.com/catalog?source=email#products";
let sqlite: DatabaseSync;
let env: Bindings;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-27T01:00:00Z"));
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE edm_campaigns (
      id TEXT PRIMARY KEY, total_opened INTEGER NOT NULL DEFAULT 0,
      total_clicked INTEGER NOT NULL DEFAULT 0, updated_at INTEGER
    );
    CREATE TABLE edm_campaign_recipients (
      id TEXT PRIMARY KEY, campaign_id TEXT, contact_id TEXT, variables TEXT,
      status TEXT, ses_message_id TEXT, sent_at INTEGER, delivered_at INTEGER,
      opened_at INTEGER, clicked_at INTEGER, replied_at INTEGER,
      error_message TEXT, created_at INTEGER
    );
    INSERT INTO edm_campaigns (id) VALUES ('campaign');
    INSERT INTO edm_campaign_recipients (id, campaign_id, contact_id, status, sent_at, created_at)
      VALUES ('recipient', 'campaign', 'contact', 'sent', 1, 1);
  `);
  env = { DB: d1(sqlite), BETTER_AUTH_SECRET: secret } as unknown as Bindings;
});

afterEach(() => { sqlite.close(); vi.useRealTimers(); });

async function sign(payload: Record<string, string>) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded));
  return `${encoded}.${Buffer.from(signature).toString("base64url")}`;
}

const request = (event: "click" | "open", token: string) => api.request(
  `https://radar.example.test/api/outreach/tracking/${event}?token=${encodeURIComponent(token)}`, {}, env,
);
const recipient = () => sqlite.prepare("SELECT status, opened_at, clicked_at FROM edm_campaign_recipients WHERE id = 'recipient'").get()!;
const counts = () => sqlite.prepare("SELECT total_opened, total_clicked FROM edm_campaigns WHERE id = 'campaign'").get()!;

test("clicks redirect and count each recipient once without inventing an open", async () => {
  const token = await sign({ rid: "recipient", url: destination });
  const first = await request("click", token);
  expect(first.status).toBe(302);
  expect(first.headers.get("Location")).toBe(destination);
  expect(recipient()).toMatchObject({ status: "clicked", opened_at: null, clicked_at: 1793062800 });
  expect(counts()).toMatchObject({ total_opened: 0, total_clicked: 1 });

  vi.setSystemTime(new Date("2026-10-27T01:05:00Z"));
  expect((await request("click", token)).status).toBe(302);
  expect(recipient()).toMatchObject({ opened_at: null, clicked_at: 1793062800 });
  expect(counts()).toMatchObject({ total_opened: 0, total_clicked: 1 });
});

test("a real open before a click records both events once", async () => {
  const open = await sign({ rid: "recipient" });
  const response = await request("open", open);
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("image/gif");
  expect(response.headers.get("Cache-Control")).toContain("no-store");
  expect(recipient()).toMatchObject({ status: "opened", opened_at: 1793062800, clicked_at: null });

  vi.setSystemTime(new Date("2026-10-27T01:05:00Z"));
  await request("open", open);
  const click = await sign({ rid: "recipient", url: destination });
  await request("click", click);
  await request("click", click);
  expect(recipient()).toMatchObject({ status: "clicked", opened_at: 1793062800, clicked_at: 1793063100 });
  expect(counts()).toMatchObject({ total_opened: 1, total_clicked: 1 });
});

test("a real open after a click records its own timestamp without regressing clicked status", async () => {
  await request("click", await sign({ rid: "recipient", url: destination }));
  vi.setSystemTime(new Date("2026-10-27T01:05:00Z"));
  const open = await sign({ rid: "recipient" });
  await request("open", open);
  expect(recipient()).toMatchObject({ status: "clicked", opened_at: 1793063100, clicked_at: 1793062800 });
  expect(counts()).toMatchObject({ total_opened: 1, total_clicked: 1 });

  vi.setSystemTime(new Date("2026-10-27T01:10:00Z"));
  await request("open", open);
  expect(recipient()).toMatchObject({ status: "clicked", opened_at: 1793063100, clicked_at: 1793062800 });
  expect(counts()).toMatchObject({ total_opened: 1, total_clicked: 1 });
});

test("overlapping repeated clicks and real opens retain unique recipient counts", async () => {
  const click = await sign({ rid: "recipient", url: destination });
  const open = await sign({ rid: "recipient" });
  const responses = await Promise.all(Array.from({ length: 8 }, () => [request("click", click), request("open", open)]).flat());
  expect(responses.every(response => response.status === 200 || response.status === 302)).toBe(true);
  expect(recipient()).toMatchObject({ status: "clicked", opened_at: 1793062800, clicked_at: 1793062800 });
  expect(counts()).toMatchObject({ total_opened: 1, total_clicked: 1 });
});

test("invalid tracking tokens cannot mutate engagement", async () => {
  const valid = await sign({ rid: "recipient", url: destination });
  const tampered = `${Buffer.from(JSON.stringify({ rid: "recipient", url: "https://other.example.com" })).toString("base64url")}.${valid.split(".")[1]}`;
  for (const token of ["", "invalid", tampered]) {
    expect((await request("click", token)).status).toBe(400);
    expect((await request("open", token)).status).toBe(200);
  }
  expect(recipient()).toMatchObject({ status: "sent", opened_at: null, clicked_at: null });
  expect(counts()).toMatchObject({ total_opened: 0, total_clicked: 0 });
});

test("signed clicks still reject unsafe destinations and redirect unknown recipients without counting", async () => {
  for (const url of ["javascript:alert(1)", "/relative-path"]) {
    expect((await request("click", await sign({ rid: "recipient", url }))).status).toBe(400);
  }
  const response = await request("click", await sign({ rid: "unknown", url: destination }));
  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toBe(destination);
  expect(recipient()).toMatchObject({ status: "sent", opened_at: null, clicked_at: null });
  expect(counts()).toMatchObject({ total_opened: 0, total_clicked: 0 });
});
