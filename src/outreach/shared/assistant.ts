export type AssistantChannel = 'email' | 'site';
export type AssistantDraftingStatus = 'ready' | 'needs_facts';
export interface AssistantDraft {
  channels: AssistantChannel[];
  brief: string;
  language: 'en' | 'zh';
  sender: { name: string; email: string; company: string; phone: string; address: string; country: string; city: string };
  email: { subject: string; bodyHtml: string; bodyText: string; contactIds: string[]; groupId: string; tag: string;
    replyTo: string; replyTracking: boolean; sendRate: number; templateId?: string };
  site: { subject: string; message: string; targets: string[]; replyTracking: boolean };
}
export type AssistantDraftPatch = Partial<Omit<AssistantDraft, 'sender' | 'email' | 'site'>> & {
  sender?: Partial<AssistantDraft['sender']>; email?: Partial<Omit<AssistantDraft['email'], 'templateId'>>; site?: Partial<AssistantDraft['site']>;
};
export interface AssistantField {
  key: string; label: string; type: 'text' | 'email' | 'contacts' | 'websites' | 'content' | 'channels';
  channel?: AssistantChannel;
}
export interface AssistantMessage { id: string; role: 'user' | 'assistant'; content: string; createdAt: string;
  draftingStatus?: AssistantDraftingStatus; draftingChannels?: AssistantChannel[] }
export interface AssistantRecipient { id: string; email: string; name: string; company: string; industry: string }
export interface AssistantOperation {
  channel: AssistantChannel; taskId: string; name: string;
  status: 'prepared' | 'dispatching' | 'submitted' | 'failed' | 'uncertain';
  error?: string; retryable: boolean; confirmedVersion: number;
}
export interface AssistantPreview {
  email: { recipients: AssistantRecipient[]; count: number };
  site: { targets: string[]; count: number; invalid: string[]; duplicates: string[] };
}
export interface AssistantSession {
  id: string; title: string; version: number;
  status: 'draft' | 'ready' | 'dispatching' | 'submitted' | 'needs_attention';
  draft: AssistantDraft; messages: AssistantMessage[]; operations: AssistantOperation[];
  missingFields: AssistantField[]; preview: AssistantPreview; confirmationToken: string | null;
  pendingChannels: AssistantChannel[]; createdAt: string; updatedAt: string;
  draftingStates?: Partial<Record<AssistantChannel, AssistantDraftingStatus>>;
}
export interface AssistantSessionSummary {
  id: string; title: string; version: number; status: AssistantSession['status'];
  channels: AssistantChannel[]; createdAt: string; updatedAt: string;
}
export interface AssistantOptions {
  groups: { id: string; name: string; contactCount: number }[]; tags: string[];
  senderDomains: { domain: string; providerName: string; verified: boolean }[];
  contacts: { id: string; email: string; name: string; company: string }[];
  replyTracking: { enabled: boolean; email: boolean; site: boolean }; aiConfigured: boolean; testMode: boolean;
}
export interface AssistantChannelResult {
  channel: AssistantChannel; taskId: string; name: string; status: string;
  operationStatus: AssistantOperation['status']; total: number; sent: number; pending: number;
  failed: number; uncertain: number; error?: string; retryable: boolean;
  detailPath: string; exportPath: string;
}
export interface AssistantResults {
  sessionId: string; channels: AssistantChannelResult[];
  summary: { total: number; sent: number; pending: number; failed: number; uncertain: number };
}
