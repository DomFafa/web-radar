import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCampaignReport, campaignReportResult, csvCell } from "./campaign-report";

const base = { email: "a@example.com", name: "测试", status: "sent", errorMessage: null, sesMessageId: null, sentAt: null, deliveredAt: null, openedAt: null, clickedAt: null };
test("report distinguishes successful, failed, pending and ambiguous deliveries", () => {
  for (const status of ["sent", "delivered", "opened", "clicked"]) assert.equal(campaignReportResult({ ...base, status }), "发送成功");
  assert.match(campaignReportResult({ ...base, status: "sending" }), /未确认/);
  assert.match(campaignReportResult({ ...base, status: "failed" }), /需核实/);
  assert.match(campaignReportResult({ ...base, status: "failed", sentAt: new Date() }), /待核实/);
  assert.match(campaignReportResult({ ...base, status: "failed", sesMessageId: "provider-id" }), /待核实/);
  assert.equal(campaignReportResult({ ...base, status: "bounced" }), "退信");
});
test("CSV includes all 15030 recipients and preserves error text safely", () => {
  const rows = Array.from({ length: 15030 }, (_, i) => ({ ...base, email: `${i}@example.com` }));
  const csv = buildCampaignReport("测试", rows);
  assert.equal(csv.split("\r\n").length, 15032);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("15029@example.com"));
  assert.equal(csvCell('Error: "x",y\nz'), '"Error: ""x"",y\nz"');
  for (const value of ["=1+2", "+SUM(A1)", "@cmd", " -2", "\tx"]) assert.ok(csvCell(value).startsWith('"\''));
  const failure = buildCampaignReport("x", [{ ...base, status: "failed", errorMessage: "数据库写入失败", sentAt: new Date("2026-09-11T02:36:26Z") }]);
  assert.ok(failure.includes("数据库写入失败"));
  assert.ok(failure.includes("2026-09-11T02:36:26.000Z"));
});
