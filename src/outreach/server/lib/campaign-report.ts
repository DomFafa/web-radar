type ReportRow = {
  email: string | null; name: string | null; status: string;
  errorMessage: string | null; sesMessageId: string | null;
  sentAt: Date | null; deliveredAt: Date | null; openedAt: Date | null; clickedAt: Date | null;
};

export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function campaignReportResult(row: ReportRow): string {
  if (row.errorMessage?.startsWith("待核实")) return "待核实（禁止自动重发）";
  if (row.status === "bounced") return "退信";
  if (row.status === "failed") return row.sentAt || row.sesMessageId ? "待核实（存在发送记录）" : "失败（需核实后重试）";
  if (["sent", "delivered", "opened", "clicked", "replied", "complained", "unsubscribed"].includes(row.status)) return "发送成功";
  if (row.status === "sending") return "排队/发送中（结果未确认）";
  if (row.status === "queued") return "待启动";
  return "待核实";
}

export function buildCampaignReport(name: string, rows: ReportRow[]): string {
  const date = (value: Date | null) => value ? value.toISOString() : "";
  const lines = [["活动名称", "收件人邮箱", "联系人名称", "发送结果", "原始状态", "失败原因/处理信息", "服务商消息ID", "发送时间(UTC)", "送达时间(UTC)", "打开时间(UTC)", "点击时间(UTC)"].map(csvCell).join(",")];
  for (const row of rows) lines.push([
    name, row.email, row.name, campaignReportResult(row), row.status, row.errorMessage,
    row.sesMessageId, date(row.sentAt), date(row.deliveredAt), date(row.openedAt), date(row.clickedAt),
  ].map(csvCell).join(","));
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}
