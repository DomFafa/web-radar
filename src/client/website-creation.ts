import { requestId } from './api';
export type WebsiteCreateBody = { name: string; buildBranch: 'template' | 'clone'; targetUrl?: string; requestId: string };

/** A reload after a lost response must retry the original website, not start another. */
export class PendingWebsiteCreation {
  readonly key: string;
  pending?: WebsiteCreateBody;
  constructor(userId: string, workspaceId: string) {
    this.key = 'wr:website-create:' + JSON.stringify([userId, workspaceId]);
    try {
      const saved = JSON.parse(sessionStorage.getItem(this.key) || 'null');
      if (saved && typeof saved.requestId === 'string' && typeof saved.name === 'string' && ['template', 'clone'].includes(saved.buildBranch) && (saved.targetUrl === undefined || typeof saved.targetUrl === 'string')) this.pending = saved;
    } catch { /* Storage may be unavailable; the active component still retains retries. */ }
  }
  body(value: Omit<WebsiteCreateBody, 'requestId'>): WebsiteCreateBody {
    if (!this.pending) {
      this.pending = { ...value, requestId: requestId() };
      try { sessionStorage.setItem(this.key, JSON.stringify(this.pending)); } catch {}
    }
    return this.pending;
  }
  complete() {
    this.pending = undefined;
    try { sessionStorage.removeItem(this.key); } catch {}
  }
}
