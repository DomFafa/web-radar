export type AudienceMethod = 'group' | 'tag' | 'contact';
export interface EdmDraft {
  step: number;
  audienceMethod: AudienceMethod;
  selectedContacts: string[];
  selectedContactRecords: { id: string; email: string; name?: string; company?: string }[];
  selectedGroups: string[];
  selectedTags: string[];
  form: { name: string; templateId: string; senderEmail: string; senderName: string; replyTo: string; sendRate: number; replyTracking: boolean };
  campaignId: string | null;
  submissionStage: string;
  submissionPending: boolean;
}
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function draftStorageKey(workspaceId: string, actorId: string): string | null {
  return workspaceId && actorId ? `edm-draft:v1:${encodeURIComponent(workspaceId)}:${encodeURIComponent(actorId)}` : null;
}

export function readEdmDraft(storage: DraftStorage | undefined, key: string | null): EdmDraft | null {
  if (!storage || !key) return null;
  try {
    const stored = JSON.parse(storage.getItem(key) || 'null');
    if (stored?.version !== 1) return null;
    const draft = stored.draft;
    const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
    if (!draft || !Number.isInteger(draft.step) || draft.step < 0 || draft.step > 2 || !['group', 'tag', 'contact'].includes(draft.audienceMethod)) return null;
    if (!strings(draft.selectedContacts) || !strings(draft.selectedGroups) || !strings(draft.selectedTags)) return null;
    if (!Array.isArray(draft.selectedContactRecords) || !draft.selectedContactRecords.every((contact: any) => typeof contact?.id === 'string' && typeof contact.email === 'string')) return null;
    if (!draft.form || !['name', 'templateId', 'senderEmail', 'senderName', 'replyTo'].every(field => typeof draft.form[field] === 'string')) return null;
    if (!Number.isInteger(draft.form.sendRate) || draft.form.sendRate < 1 || draft.form.sendRate > 200 || typeof draft.form.replyTracking !== 'boolean') return null;
    if (draft.campaignId !== null && typeof draft.campaignId !== 'string') return null;
    if (typeof draft.submissionStage !== 'string' || typeof draft.submissionPending !== 'boolean') return null;
    return draft;
  } catch { return null; }
}

export function writeEdmDraft(storage: DraftStorage | undefined, key: string | null, draft: EdmDraft) {
  if (!storage || !key) return;
  try { storage.setItem(key, JSON.stringify({ version: 1, draft })); } catch { /* Editing remains available when browser storage is disabled. */ }
}

export function browserDraftStorage(): Storage | undefined {
  try { return typeof sessionStorage === 'undefined' ? undefined : sessionStorage; } catch { return undefined; }
}
