export const REVIEW_STALE_MS = 10 * 60_000;
export const REVIEW_TIMEOUT_MS = 30 * 60_000;

export type CampaignVerification = {
  status: string;
  started_at: number;
  updated_at: number;
  checked: number;
  resolved: number;
  remaining: number;
  error?: string | null;
};

/** Verification completion is independent of whether a send receipt was found. */
export function verificationState(review?: CampaignVerification | null, now = Date.now()) {
  if (!review) return 'pending';
  if (review.status !== 'running') return review.status;
  if (now - review.updated_at >= REVIEW_STALE_MS || now - review.started_at >= REVIEW_TIMEOUT_MS)
    return 'interrupted';
  return 'running';
}

export function verificationBadge(review?: CampaignVerification | null, now = Date.now()) {
  switch (verificationState(review, now)) {
    case 'completed': return { label: '已核实', badge: 'badge-info' };
    case 'running': return { label: '核实中', badge: 'badge-warning' };
    case 'failed': return { label: '核实未完成', badge: 'badge-warning' };
    case 'interrupted': return { label: '核实中断', badge: 'badge-warning' };
    default: return { label: '待核实', badge: 'badge-warning' };
  }
}
