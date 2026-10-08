export type CrmChannel = 'edm' | 'site';
export type CrmCaptureStatus = 'captured' | 'legacy_partial' | 'unavailable';
export type CrmCustomer = {
  key: string; label: string; contactId: string | null; email: string | null;
  website: string | null; company: string | null; groupId: string | null; groupName: string | null;
  sent: number; replied: number; failed: number; uncertain: number; lastActivityAt: string | null;
};
export type CrmCommunication = {
  id: string; source: CrmChannel; targetId: string; businessId: string; businessName: string;
  customerKey: string; customerLabel: string; contactId: string | null; email: string | null;
  website: string | null; ownerId: string | null; ownerName: string | null;
  subject: string | null; status: string; sent: number; replied: number; failed: number; uncertain: number;
  tracked: boolean; createdAt: string; sentAt: string | null;
  captureStatus: CrmCaptureStatus; bodyText?: string | null; bodyHtml?: string | null;
  provider?: string | null; providerMessageId?: string | null; errorMessage?: string | null;
  senderEmail?: string | null; senderName?: string | null; replyTo?: string | null;
};
export type CrmNote = {
  id: string; customerKey: string; authorId: string; authorName: string | null;
  content: string | null; followUpAt: string | null; status: 'pending' | 'done';
  createdAt: string; updatedAt: string; canWrite: boolean; canBody: boolean;
};
export type CrmTimelineEvent = {
  id: string; direction: 'outbound' | 'inbound' | 'note'; source: CrmChannel | null;
  occurredAt: string; subject: string | null; bodyText: string | null; bodyHtml: string | null;
  ownerId: string | null; ownerName: string | null; status: string; kind: string | null;
  threadId: string | null; targetId: string | null; canBody: boolean;
  captureStatus: CrmCaptureStatus | null; sender?: string | null;
};
export type CrmEmployee = { userId: string | null; name: string; email: string | null;
  customers: number; sent: number; replied: number; failed: number; uncertain: number; total: number; };
export type CrmPage<T> = { total: number; page: number; pageSize: number } & T;
export type CrmCustomerPage = CrmPage<{ customers: CrmCustomer[] }>;
export type CrmCommunicationPage = CrmPage<{ records: CrmCommunication[] }>;
export type CrmCustomerProfile = CrmPage<{ customer: CrmCustomer; timeline: CrmTimelineEvent[];
  notes: CrmNote[]; notesTotal: number; notesPage: number; notesPageSize: number;
  canWrite: boolean; canBody: boolean; }>;
export type CrmCommunicationDetail = { record: CrmCommunication; canBody: boolean; attemptsTotal: number;
  attempts: Array<{ id: string; attemptId: string; createdAt: string; completedAt: string | null;
    status: string; provider: string | null; providerMessageId: string | null;
    subject: string; bodyText: string | null; bodyHtml: string | null; errorMessage: string | null;
    recipientEmail?: string | null; senderEmail?: string | null; senderName?: string | null; replyTo?: string | null }>; };
