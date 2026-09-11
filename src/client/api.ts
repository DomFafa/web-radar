import type { Principal, Project, ProjectDetail } from '../shared/model';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

// The WR session deliberately lives only in this module's memory, including in embeds.
let session = '';
export function setSession(value: string) {
  session = value;
}
export function clearSession() {
  session = '';
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (session) headers.set('Authorization', `Bearer ${session}`);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...options, headers, cache: 'no-store' });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
    if (response.status === 401 && session)
      window.dispatchEvent(new CustomEvent('wr:session-expired'));
    throw new ApiError(
      body.message || `请求失败（${response.status}）`,
      response.status,
      body.code,
    );
  }
  return response.json() as Promise<T>;
}

export function post<T>(path: string, body: unknown = {}) {
  return api<T>(path, { method: 'POST', body: JSON.stringify(body) });
}
export function put<T>(path: string, body: unknown) {
  return api<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}
export const requestId = () => crypto.randomUUID();
export type SessionResult = {
  token: string;
  expiresAt: string;
  principal: Principal;
  projectId?: string;
  target?: 'project' | 'browse';
};

export async function privateAssetBlob(projectId: string, assetId: string): Promise<Blob> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}`,
    {
      headers: { Authorization: `Bearer ${session}` },
      cache: 'no-store',
    },
  );
  if (!response.ok) throw new ApiError('私有素材暂时无法读取，请重新登录后重试。', response.status);
  return response.blob();
}
export async function privateAsset(projectId: string, assetId: string): Promise<string> {
  return URL.createObjectURL(await privateAssetBlob(projectId, assetId));
}

export function parentOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.origin !== value || parsed.username || parsed.password) return null;
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    return parsed.protocol === 'https:' || (parsed.protocol === 'http:' && loopback) ? value : null;
  } catch {
    return null;
  }
}

export function validHandoff(
  event: Pick<MessageEvent, 'origin' | 'source' | 'data'>,
  origin: string,
  parent: MessageEventSource,
): boolean {
  const data = event.data;
  return (
    event.origin === origin &&
    event.source === parent &&
    !!data &&
    data.type === 'product-radar:handoff' &&
    data.protocolVersion === 1 &&
    typeof data.code === 'string' &&
    data.code.length > 0 &&
    typeof data.requestId === 'string' &&
    data.requestId.length > 0
  );
}

/** Keep completed grants deduplicated while permitting a failed or rotated grant retry. */
export class HandoffAttempts {
  private attempts = new Set<string>();
  begin(requestId: string, code: string): boolean {
    const key = `${requestId}:${code}`;
    if (this.attempts.has(key)) return false;
    this.attempts.add(key);
    return true;
  }
  failed(requestId: string, code: string) {
    this.attempts.delete(`${requestId}:${code}`);
  }
}

/** A transport retry must send the identical operation, even if the form changed meanwhile. */
export class PendingOperations {
  private operations = new Map<string, Record<string, unknown>>();
  body(key: string, value: Record<string, unknown>): Record<string, unknown> {
    if (!this.operations.has(key))
      this.operations.set(key, { ...structuredClone(value), requestId: requestId() });
    return this.operations.get(key)!;
  }
  complete(key: string) {
    this.operations.delete(key);
  }
}

// Do not replace a user's local form when a background generation or another tab saves.
export function reconcileDetail(
  incoming: ProjectDetail,
  current: Project,
  dirty: boolean,
): ProjectDetail {
  return dirty ? { ...incoming, project: current } : incoming;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作未完成，请稍后重试。';
}
