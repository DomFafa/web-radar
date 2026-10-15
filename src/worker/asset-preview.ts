import type { Asset } from '../shared/model';
import type { AppEnv } from './env';
import { DomainError } from './domain';

// Call only after the existing project and asset authorization checks.
export async function privateAssetPreview(
  request: Request,
  env: AppEnv,
  asset: Asset,
): Promise<Response> {
  if (
    !['image/png', 'image/jpeg', 'image/webp'].includes(asset.contentType) ||
    asset.size > 20 * 1024 * 1024
  )
    throw new DomainError(415, 'preview_unsupported', '该素材不支持图片预览。');
  const key = `${asset.key}/preview-v1.webp`;
  let preview = await env.MEDIA.get(key);
  if (!preview) {
    if (!env.SITE_BUILDER_URL || !env.SITE_BUILDER_KEY)
      throw new DomainError(503, 'preview_unavailable', '图片预览服务暂不可用，请稍后重试。');
    const base = new URL(env.SITE_BUILDER_URL);
    if (
      base.protocol !== 'https:' &&
      !(
        env.ENVIRONMENT !== 'production' &&
        base.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)
      )
    )
      throw new DomainError(503, 'preview_unavailable', '图片预览服务配置无效。');
    const original = await env.MEDIA.get(asset.key);
    if (!original) throw new DomainError(404, 'asset_unavailable', '素材文件不存在。');
    const response = await fetch(`${base.href.replace(/\/$/, '')}/v1/media/preview`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SITE_BUILDER_KEY}`,
        'Content-Type': asset.contentType,
      },
      body: original.body,
      // Workers supports manual redirects; reject non-2xx below without forwarding credentials.
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok || response.headers.get('content-type') !== 'image/webp')
      throw new DomainError(503, 'preview_unavailable', '图片预览暂时无法加载，请重试。');
    const reader = response.body?.getReader();
    if (!reader)
      throw new DomainError(503, 'preview_unavailable', '图片预览暂时无法加载，请重试。');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024 * 1024) {
        await reader.cancel();
        throw new DomainError(502, 'preview_size', '图片预览超出大小限制。');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (
      new TextDecoder().decode(bytes.slice(0, 4)) !== 'RIFF' ||
      new TextDecoder().decode(bytes.slice(8, 12)) !== 'WEBP'
    )
      throw new DomainError(502, 'preview_invalid', '图片预览格式无效。');
    await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: 'image/webp' } });
    preview = await env.MEDIA.get(key);
  }
  if (!preview) throw new DomainError(503, 'preview_unavailable', '图片预览暂时无法加载，请重试。');
  return new Response(request.method === 'HEAD' ? null : preview.body, {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(preview.size),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
