import type { Secrets } from '../env';
import { ProviderError, type MediaResult } from '../provider-contract';
export function endpoint(base: string | undefined, path: string): string {
  if (!base) throw new ProviderError('provider_unconfigured', '服务地址未配置');
  let u: URL;
  try {
    u = new URL(base);
  } catch {
    throw new ProviderError('provider_unconfigured', '服务地址格式无效');
  }
  if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash)
    throw new ProviderError('provider_unconfigured', '服务地址必须使用无凭据的 HTTPS URL');
  return `${u.href.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
export async function limitedBytes(response: Response, max: number): Promise<Uint8Array> {
  if (Number(response.headers.get('content-length') || 0) > max) {
    await response.body?.cancel();
    throw new ProviderError('provider_payload_too_large', '服务返回内容超过大小限制');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new ProviderError('provider_empty_response', '服务返回空内容');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max)
        throw new ProviderError('provider_payload_too_large', '服务返回内容超过大小限制');
      chunks.push(value);
    }
  } catch (e) {
    await reader.cancel().catch(() => {});
    throw e;
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}
export async function requestJson(
  url: string,
  init: RequestInit = {},
  options: { mutation?: boolean; maxBytes?: number; provider?: string; timeoutMs?: number } = {},
): Promise<any> {
  const provider = options.provider ?? 'provider';
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      redirect: 'manual',
      signal: AbortSignal.timeout(options.timeoutMs ?? 45_000),
    });
  } catch {
    throw new ProviderError(
      `${provider}_network_uncertain`,
      '服务连接中断，请先核对原任务状态',
      Boolean(options.mutation),
    );
  }
  if (!response.ok) {
    const retryAfter = response.headers.get('retry-after');
    const retryAfterMs = retryAfter
      ? /^\d+$/.test(retryAfter)
        ? Number(retryAfter) * 1000
        : Math.max(0, Date.parse(retryAfter) - Date.now())
      : undefined;
    const detail = await providerErrorDetail(response, init);
    throw new ProviderError(
      `${provider}_http_${response.status}`,
      `${provider} 服务请求失败（HTTP ${response.status}）${detail ? `：${detail}` : ''}`,
      Boolean(options.mutation) &&
        (response.status >= 500 ||
          response.status === 408 ||
          (response.status >= 300 && response.status < 400)),
      Number.isFinite(retryAfterMs) ? retryAfterMs : undefined,
    );
  }
  try {
    return JSON.parse(
      new TextDecoder().decode(await limitedBytes(response, options.maxBytes ?? 2_000_000)),
    );
  } catch (e) {
    if (e instanceof ProviderError && e.code === 'provider_payload_too_large')
      throw new ProviderError(e.code, e.message, Boolean(options.mutation));
    throw new ProviderError(
      `${provider}_invalid_response`,
      '服务返回内容无效，请核对原任务状态',
      Boolean(options.mutation),
    );
  }
}

async function providerErrorDetail(response: Response, init: RequestInit): Promise<string> {
  const credentials: string[] = [];
  new Headers(init.headers).forEach((value, name) => {
    if (/authorization|cookie|key|token|secret/i.test(name)) {
      credentials.push(value, value.replace(/^(?:Bearer|Basic)\s+/i, ''));
    }
  });
  const redact = (value: unknown, max: number): string => {
    if (typeof value !== 'string') return '';
    let text = value;
    for (const secret of credentials.filter(Boolean))
      text = text
        .replaceAll(secret, '[redacted]')
        .replaceAll(encodeURIComponent(secret), '[redacted]');
    return text
      .replace(/https?:\/\/[^\s<>"']+/gi, '[url]')
      .replace(/\b(?:Bearer|Basic)\s+[^\s,;]+/gi, '[redacted]')
      .replace(/\bsk-[a-zA-Z0-9_-]+/g, '[redacted]')
      .replace(
        /(["']?(?:api[_-]?key|token|secret|password)["']?\s*[:=]\s*)["']?[^\s,;"']+["']?/gi,
        '$1[redacted]',
      )
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .slice(0, max);
  };
  const requestId = redact(
    response.headers.get('x-request-id') ?? response.headers.get('cf-ray'),
    100,
  );
  let detail = '';
  try {
    // Error pages and echoed payloads must not become unbounded job records.
    const data = JSON.parse(new TextDecoder().decode(await limitedBytes(response, 16_384)));
    const error = data?.error;
    if (error && typeof error === 'object') {
      detail = [redact(error.code, 80), redact(error.param, 80), redact(error.message, 600)]
        .filter(Boolean)
        .join(' · ');
    }
  } catch {
    // Reading diagnostics must never replace the original HTTP classification.
  }
  return [detail, requestId ? `请求编号 ${requestId}` : ''].filter(Boolean).join('；');
}
export function jsonRequest(key: string, payload: unknown, idempotencyKey?: string): RequestInit {
  return {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  };
}
export function mediaUrl(env: Secrets, value: string): string {
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    throw new ProviderError('unsafe_media_url', '服务返回的素材地址无效');
  }
  const allowed = new Set((env.PROVIDER_MEDIA_ORIGINS ?? '').split(/[\s,]+/).filter(Boolean));
  if (env.APP_ORIGIN) allowed.add(env.APP_ORIGIN.replace(/\/$/, ''));
  if (u.protocol !== 'https:' || u.username || u.password || !allowed.has(u.origin))
    throw new ProviderError('unsafe_media_url', '素材地址不在配置的 HTTPS 来源白名单中');
  return u.href;
}
export async function downloadMedia(
  env: Secrets,
  url: string,
  kind: 'image' | 'video',
): Promise<MediaResult> {
  const approved = mediaUrl(env, url);
  let response: Response;
  try {
    response = await fetch(approved, { redirect: 'manual', signal: AbortSignal.timeout(90_000) });
  } catch {
    throw new ProviderError('media_download_failed', '生成结果下载失败，可以恢复原任务下载');
  }
  const contentType = (response.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  const types =
    kind === 'image' ? ['image/png', 'image/jpeg', 'image/webp'] : ['video/mp4', 'video/webm'];
  if (!response.ok || !types.includes(contentType) || !response.body) {
    await response.body?.cancel();
    throw new ProviderError('media_invalid_response', '生成结果不是可接受的图片或视频');
  }
  const max = kind === 'image' ? 20 * 1024 * 1024 : 100 * 1024 * 1024;
  const length = Number(response.headers.get('content-length') || 0);
  if (length > max) {
    await response.body.cancel();
    throw new ProviderError('media_too_large', '生成素材超过大小限制');
  }
  let count = 0;
  const body = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        count += chunk.length;
        if (count > max) throw new ProviderError('media_too_large', '生成素材超过大小限制');
        controller.enqueue(chunk);
      },
    }),
  );
  return {
    body,
    contentType,
    filename: `generated.${contentType.split('/')[1]}`,
    size: length || undefined,
    testMode: false,
  };
}
export const bytesFromBase64 = (base64: string) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
export function base64FromBytes(bytes: Uint8Array): string {
  let value = '';
  for (let i = 0; i < bytes.length; i += 8192)
    value += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(value);
}
export function nonempty(value: unknown, max = 20_000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
