import type { Asset, PublicMediaManifest, PublicMediaVariant } from '../shared/model';
import type { AppEnv } from './env';
import { DomainError } from './domain';
import { dimensions } from './materials-media';
import { limitedBytes } from './providers/http';
import { ProviderError } from './provider-contract';

export const publicMediaPolicy = 'webp82-v1';
export const typedRendererVersion = 'typed-responsive-2026-09-20.1';
const widths = new Set([320, 640, 1280, 1600]);
const maxInput = 20 * 1024 * 1024,
  maxOutput = 2 * 1024 * 1024;
const invalid = () => new DomainError(422, 'public_media_invalid', '发布图片格式或尺寸无效。');
const retry = () =>
  new DomainError(503, 'public_media_retry', '发布图片准备暂不可用，将自动重试。');
const digest = async (bytes: Uint8Array) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes)))]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');

export function preparedImageVariants(
  manifest: PublicMediaManifest | undefined,
  assetUrl: (id: string) => string,
) {
  return (id: string, requested: number[], includeOriginal = false) => {
    if (!manifest?.ready || manifest.policy !== publicMediaPolicy) return undefined;
    const entry = manifest.assets[id];
    if (includeOriginal && !entry?.original) return undefined;
    const variants = entry?.variants.filter((v) => requested.includes(v.requestedWidth)) || [];
    const seen = new Set<number>();
    const result = variants
      .sort((a, b) => a.width - b.width)
      .filter((v) => {
        if (seen.has(v.width)) return false;
        seen.add(v.width);
        return true;
      })
      .map((v) => ({
        url: `${assetUrl(id)}?width=${v.requestedWidth}`,
        width: v.width,
        height: v.height,
      }));
    if (includeOriginal && entry?.original && !seen.has(entry.original.width))
      result.push({ url: assetUrl(id), ...entry.original });
    return result.sort((a, b) => a.width - b.width);
  };
}

export async function preparePublicVariant(
  env: AppEnv,
  asset: Asset,
  sourceIdentity: string,
  requestedWidth: number,
): Promise<PublicMediaVariant & { original: { width: number; height: number } }> {
  if (
    !widths.has(requestedWidth) ||
    !['image/png', 'image/jpeg', 'image/webp'].includes(asset.contentType) ||
    asset.size > maxInput
  )
    throw invalid();
  const identity = await digest(new TextEncoder().encode(sourceIdentity));
  const key = `${asset.key}/responsive-${publicMediaPolicy}-${identity}/${requestedWidth}.webp`;
  try {
    const existing = await env.MEDIA.head(key),
      m = existing?.customMetadata;
    if (
      existing &&
      m?.policy === publicMediaPolicy &&
      m.sourceIdentity === sourceIdentity &&
      m.requestedWidth === String(requestedWidth) &&
      existing.httpMetadata?.contentType === 'image/webp' &&
      Number(m.bytes) === existing.size &&
      existing.size > 0 &&
      existing.size <= maxOutput &&
      /^[a-f0-9]{64}$/.test(m.sha256) &&
      Number(m.width) > 0 &&
      Number(m.width) <= requestedWidth &&
      Number(m.height) > 0 &&
      Number(m.originalWidth) >= Number(m.width) &&
      Number(m.originalHeight) >= Number(m.height)
    ) {
      return {
        key,
        requestedWidth,
        width: Number(m.width),
        height: Number(m.height),
        bytes: existing.size,
        sha256: m.sha256,
        original: { width: Number(m.originalWidth), height: Number(m.originalHeight) },
      };
    }
    if (!env.SITE_BUILDER_URL || !env.SITE_BUILDER_KEY)
      throw new DomainError(503, 'public_media_unconfigured', '发布图片服务未配置。');
    const base = new URL(env.SITE_BUILDER_URL);
    if (
      base.username ||
      base.password ||
      base.search ||
      base.hash ||
      !(
        base.protocol === 'https:' ||
        (env.ENVIRONMENT !== 'production' &&
          base.protocol === 'http:' &&
          ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))
      )
    )
      throw new DomainError(503, 'public_media_unconfigured', '发布图片服务地址无效。');
    const original = await env.MEDIA.get(asset.key);
    if (!original) throw new DomainError(404, 'public_media_missing', '发布原图不存在。');
    if (original.size !== asset.size) {
      await original.body.cancel();
      throw invalid();
    }
    const response = await fetch(
      `${base.href.replace(/\/$/, '')}/v1/media/preview?width=${requestedWidth}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.SITE_BUILDER_KEY}`,
          'Content-Type': asset.contentType,
        },
        body: original.body,
        redirect: 'manual',
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      if ([408, 429, 500, 502, 503, 504].includes(response.status)) throw retry();
      throw invalid();
    }
    if (response.headers.get('content-type')?.split(';')[0] !== 'image/webp') {
      await response.body?.cancel();
      throw invalid();
    }
    const originalSize = {
      width: Number(response.headers.get('X-Source-Width')),
      height: Number(response.headers.get('X-Source-Height')),
    };
    const bytes = await limitedBytes(response, maxOutput),
      size = dimensions(bytes, 'image/webp');
    if (
      !size ||
      !Number.isSafeInteger(originalSize.width) ||
      !Number.isSafeInteger(originalSize.height) ||
      originalSize.width < size.width ||
      originalSize.height < size.height ||
      originalSize.width * originalSize.height > 20_000_000 ||
      new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8 !==
        bytes.length ||
      size.width < 1 ||
      size.height < 1 ||
      size.width > requestedWidth ||
      size.width * size.height > 20_000_000
    )
      throw invalid();
    const result: PublicMediaVariant = {
      key,
      requestedWidth,
      ...size,
      bytes: bytes.length,
      sha256: await digest(bytes),
    };
    await env.MEDIA.put(key, bytes, {
      httpMetadata: { contentType: 'image/webp' },
      customMetadata: {
        policy: publicMediaPolicy,
        sourceIdentity,
        requestedWidth: String(requestedWidth),
        width: String(size.width),
        height: String(size.height),
        bytes: String(bytes.length),
        sha256: result.sha256,
        originalWidth: String(originalSize.width),
        originalHeight: String(originalSize.height),
      },
    });
    return { ...result, original: originalSize };
  } catch (error) {
    if (error instanceof DomainError) throw error;
    if (
      error instanceof ProviderError &&
      ['provider_payload_too_large', 'provider_empty_response'].includes(error.code)
    )
      throw invalid();
    throw retry();
  }
}
