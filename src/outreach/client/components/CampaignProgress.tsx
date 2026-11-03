/** @jsxImportSource react */
import React from "react";

export function CampaignProgress({ campaign }: { campaign: any }) {
  if (!campaign?.progress) return null;
  const { processed, queued, sending, failed, unconfirmed = 0, providerQueued = 0 } = campaign.progress;
  const total = Number(campaign.totalRecipients || 0);
  const percent = total ? Math.min(100, Math.max(0, processed / total * 100)) : 0;
  return <div style={{ minWidth: 160, width: "100%", padding: "8px 0" }} aria-live="polite">
    <div>提交进度 {processed} / {total}（{percent.toFixed(1)}%）</div>
    <progress aria-label="邮件提交进度" max={100} value={percent} style={{ width: "100%", height: 8 }} />
    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", overflowWrap: "anywhere" }}>
      待提交 {queued} · 提交中 {sending} · 失败 {failed}
      {unconfirmed > 0 && <> · 结果未确认 {unconfirmed}</>}
      {providerQueued > 0 && <> · 服务商排队/定时发送 {providerQueued}</>}
    </div>
    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>提交完成不代表邮件已送达。</div>
  </div>;
}
