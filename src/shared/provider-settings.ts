export interface ProviderAccount {
  id: string;
  kind: 'cloudflare' | 'resend';
  scope: string;
  label: string;
  mailFrom?: string;
  isDefault: boolean;
  createdAt: string;
}
export interface CloudflareZone {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  status: string;
}
export interface DomainBinding {
  hostname: string;
  status: string;
  credentialId: string;
  zoneName: string;
  createdAt: string;
}
export interface SiteConnections {
  accounts: ProviderAccount[];
  defaultCloudflareAccountId: string | null;
  domains: DomainBinding[];
  resendAccountId: string | null;
  environmentEmail: boolean;
  published: boolean;
}
