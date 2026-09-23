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

// Standalone login uses an HttpOnly cookie; embeds retain their tab-scoped bearer.
let session = (() => {
  try {
    return sessionStorage.getItem('wr_session') || '';
  } catch {
    return '';
  }
})();
let sessionEpoch = 0;
const expiredCode = (code?: string) =>
  ['session_required', 'session_expired', 'test_session_invalid'].includes(code || '');
type AssetVariant = 'original' | 'preview';
const assetCache = new Map<string, { blob: Blob; expires: number }>();
const assetReads = new Map<string, { promise: Promise<Blob>; controller: AbortController }>();
function clearAssets() {
  assetCache.clear();
  for (const read of assetReads.values()) read.controller.abort();
  assetReads.clear();
}
export function setSession(value: string) {
  sessionEpoch++;
  if (session !== value) clearAssets();
  session = value;
  try {
    if (value) sessionStorage.setItem('wr_session', value);
    else sessionStorage.removeItem('wr_session');
  } catch {}
}
export function clearSession() {
  clearAssets();
  session = '';
  sessionEpoch++;
  try {
    sessionStorage.removeItem('wr_session');
  } catch {}
}

export function sessionHeaders(): HeadersInit { return session ? { Authorization: `Bearer ${session}` } : {}; }

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const epoch = sessionEpoch;
  const headers = new Headers(options.headers);
  if (session) headers.set('Authorization', `Bearer ${session}`);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...options, headers, cache: 'no-store' });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string; code?: string };
    if (response.status === 401 && epoch === sessionEpoch && expiredCode(body.code))
      window.dispatchEvent(new CustomEvent('wr:session-expired'));
    throw new ApiError(
      body.message || body.error || `请求失败（${response.status}）`,
      response.status,
      body.code,
    );
  }
  return response.json() as Promise<T>;
}

/** XHR exposes actual upload bytes; fetch does not expose upload progress. */
export function upload<T>(path: string, body: FormData, onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<T> {
  const epoch = sessionEpoch;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    if (signal?.aborted) { reject(new ApiError('上传已取消。', 0, 'upload_cancelled')); return; }
    const abort = () => xhr.abort();
    signal?.addEventListener('abort', abort, { once: true });
    xhr.onloadend = () => signal?.removeEventListener('abort', abort);
    xhr.open('POST', path);
    xhr.timeout = 5 * 60 * 1000;
    if (session) xhr.setRequestHeader('Authorization', `Bearer ${session}`);
    // Same-origin cookies are included by XHR. The browser supplies the multipart boundary.
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0)
        onProgress(Math.min(1, Math.max(0, event.loaded / event.total)));
    };
    xhr.upload.onload = () => onProgress(1);
    xhr.onerror = () => reject(new ApiError('图片上传连接中断，请检查网络后重试。', 0));
    xhr.ontimeout = () => reject(new ApiError('图片上传超时，请重试。', 0));
    xhr.onabort = () => reject(new ApiError('上传已取消。', 0, 'upload_cancelled'));
    xhr.onload = () => {
      let result;
      try { result = JSON.parse(xhr.responseText); } catch {
        reject(new ApiError('上传接口返回了无效响应，请重试。', xhr.status)); return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        if (xhr.status === 401 && epoch === sessionEpoch && expiredCode(result?.code))
          window.dispatchEvent(new CustomEvent('wr:session-expired'));
        reject(new ApiError(result?.message || `上传失败（${xhr.status}）`, xhr.status, result?.code));
      } else resolve(result as T);
    };
    xhr.send(body);
  });
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
  entry?: 'prepared-materials';
};

export async function privateAssetBlob(
  projectId: string,
  assetId: string,
  variant: AssetVariant = 'original',
): Promise<Blob> {
  const path = `/api/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}${variant === 'preview' ? '?variant=preview' : ''}`;
  const cached = assetCache.get(path);
  if (cached && cached.expires > Date.now()) {
    assetCache.delete(path);
    assetCache.set(path, cached);
    return cached.blob;
  }
  assetCache.delete(path);
  const pending = assetReads.get(path);
  if (pending) return pending.promise;
  const token = session;
  const epoch = sessionEpoch;
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error('素材加载超时，请重试。')),
    variant === 'preview' ? 30_000 : 120_000,
  );
  const promise = (async () => {
    try {
      const response = await fetch(path, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { code?: string };
        if (response.status === 401 && epoch === sessionEpoch && expiredCode(body.code))
          window.dispatchEvent(new CustomEvent('wr:session-expired'));
        throw new ApiError(
          response.status === 401 ? '登录已过期，请重新登录。' : '图片读取失败，请重试。',
          response.status,
        );
      }
      const blob = await response.blob();
      if (controller.signal.aborted || session !== token) throw new Error('登录状态已变化。');
      // Private images stay only in this session's memory, bounded to 32 MB and five minutes.
      if (blob.type.startsWith('image/') && blob.size <= 8 * 1024 * 1024) {
        assetCache.set(path, { blob, expires: Date.now() + 5 * 60 * 1000 });
        let bytes = [...assetCache.values()].reduce((sum, entry) => sum + entry.blob.size, 0);
        for (const [key, entry] of assetCache) {
          if (bytes <= 32 * 1024 * 1024 && assetCache.size <= 60) break;
          assetCache.delete(key);
          bytes -= entry.blob.size;
        }
      }
      return blob;
    } catch (error) {
      if (controller.signal.aborted) throw controller.signal.reason;
      throw error;
    } finally {
      clearTimeout(timer);
      if (assetReads.get(path)?.controller === controller) assetReads.delete(path);
    }
  })();
  assetReads.set(path, { promise, controller });
  return promise;
}
export async function privateAsset(
  projectId: string,
  assetId: string,
  variant: AssetVariant = 'original',
): Promise<string> {
  return URL.createObjectURL(await privateAssetBlob(projectId, assetId, variant));
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
