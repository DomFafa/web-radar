export interface EmailOverview {
  resendSync?: {
    providerName: string;
    status: string;
    checked: number;
    failed: number;
    error: string | null;
    updatedAt: number | null;
  }[];
  totalCampaigns: number;
  totalContacts: number;
  subscribedContacts: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  deliveryRate: number | null;
  openRate: number | null;
  clickRate: number | null;
  bounceRate: number | null;
}
export interface SiteOverview {
  totalJobs: number;
  totalTargets: number;
  totalSubmitted: number;
  totalSkipped: number;
  totalFailed: number;
  totalNoContact: number;
  totalInaccessible: number;
  totalPending: number;
  totalUncertain: number;
  totalAbnormal: number;
}
export function percentage(count: number, total: number): number | null {
  return total > 0 ? Math.round(Math.max(0, Math.min(1, count / total)) * 1000) / 10 : null;
}
