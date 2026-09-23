/** @jsxImportSource react */
import React from "react";

export function CampaignProgress({ campaign }: { campaign: any }) {
  if (!campaign?.progress) return null;
  const { processed, queued, sending, failed } = campaign.progress;
  const total = Number(campaign.totalRecipients || 0);
  const percent = total ? Math.min(100, Math.max(0, processed / total * 100)) : 0;
  return <div style={{ minWidth: 160, width: "100%", padding: "8px 0" }} aria-live="polite">
    <div>处理进度 {processed} / {total}（{percent.toFixed(1)}%）</div>
    <progress aria-label="邮件处理进度" max={100} value={percent} style={{ width: "100%", height: 8 }} />
    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", overflowWrap: "anywhere" }}>
      待启动 {queued} · 排队/发送中 {sending} · 失败 {failed}
    </div>
  </div>;
}
