import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  preparePublicVariant,
  preparedImageVariants,
  publicMediaPolicy,
} from '../src/worker/public-media';
import type { AppEnv } from '../src/worker/env';
import type { Asset } from '../src/shared/model';
// Real Pillow WebP output: 4 × 3, intentionally smaller than every requested width.
const webp = Uint8Array.from(
  Buffer.from(
    'UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoEAAMAAUAiJaACdLoB+AADsAD+8Gyv/2Vj6ln6Vj94L/5+Z3bi/nMAAAA=',
    'base64',
  ),
);
const asset: Asset = {
  id: 'a',
  projectId: 'p',
  key: 'original/a',
  sha256: 'a'.repeat(64),
  size: 10,
  contentType: 'image/png',
  filename: 'a.png',
  origin: 'import',
  createdAt: '',
};
function setup() {
  const objects = new Map<
    string,
    {
      bytes: Uint8Array;
      customMetadata: Record<string, string>;
      httpMetadata: { contentType: string };
    }
  >();
  const put = vi.fn(async (key: string, bytes: Uint8Array, options: any) => {
    objects.set(key, { bytes, ...options });
    return {};
  });
  const env = {
    ENVIRONMENT: 'test',
    SITE_BUILDER_URL: 'https://builder.example',
    SITE_BUILDER_KEY: 'key',
    MEDIA: {
      get: vi.fn(async () => ({
        body: new Response('0123456789').body,
        httpEtag: '"original"',
        size: 10,
      })),
      head: vi.fn(async (key: string) => {
        const o = objects.get(key);
        return o ? { ...o, size: o.bytes.length } : null;
      }),
      put,
    },
  } as unknown as AppEnv;
  const fetcher = vi.fn(
    async (_url: string, _options: unknown) =>
      new Response(webp, {
        headers: { 'Content-Type': 'image/webp', 'X-Source-Width': '4', 'X-Source-Height': '3' },
      }),
  );
  vi.stubGlobal('fetch', fetcher);
  return { env, put, objects, fetcher };
}
afterEach(() => vi.unstubAllGlobals());
describe('prepared immutable public variants', () => {
  it('stores actual output dimensions, hash and bytes without overwriting the original; reuses verified R2 metadata', async () => {
    const { env, put, fetcher } = setup();
    const result = await preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 320);
    expect(result.width).toBe(4);
    expect(result.height).toBe(3);
    expect(result.bytes).toBe(webp.length);
    expect(result.sha256).toBe(
      Buffer.from(await crypto.subtle.digest('SHA-256', webp)).toString('hex'),
    );
    expect(result.key).toContain(publicMediaPolicy);
    expect(result.key).not.toBe(asset.key);
    expect(fetcher.mock.calls[0][0]).toBe('https://builder.example/v1/media/preview?width=320');
    expect(await preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 320)).toEqual(result);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledTimes(1);
  });
  it('never substitutes original bytes on busy, malformed output, or unsupported size', async () => {
    const { env, put, fetcher } = setup();
    fetcher.mockResolvedValueOnce(new Response('busy', { status: 503 }));
    await expect(
      preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 640),
    ).rejects.toMatchObject({ code: 'public_media_retry' });
    fetcher.mockResolvedValueOnce(
      new Response('original', {
        headers: { 'Content-Type': 'image/webp', 'X-Source-Width': '4', 'X-Source-Height': '3' },
      }),
    );
    await expect(
      preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 640),
    ).rejects.toMatchObject({ code: 'public_media_invalid' });
    await expect(
      preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 333),
    ).rejects.toMatchObject({ code: 'public_media_invalid' });
    expect(put).not.toHaveBeenCalled();
  });
  it('treats oversized or truncated output as a permanent preparation failure and retries interrupted storage', async () => {
    const { env, put, fetcher } = setup();
    fetcher.mockResolvedValueOnce(
      new Response('x', {
        headers: {
          'Content-Type': 'image/webp',
          'X-Source-Width': '4',
          'X-Source-Height': '3',
          'Content-Length': String(2 * 1024 * 1024 + 1),
        },
      }),
    );
    await expect(
      preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 320),
    ).rejects.toMatchObject({ code: 'public_media_invalid' });
    fetcher.mockResolvedValueOnce(
      new Response(webp.slice(0, 30), {
        headers: { 'Content-Type': 'image/webp', 'X-Source-Width': '4', 'X-Source-Height': '3' },
      }),
    );
    await expect(
      preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 320),
    ).rejects.toMatchObject({ code: 'public_media_invalid' });
    put.mockRejectedValueOnce(Error('R2 write unavailable'));
    await expect(
      preparePublicVariant(env, asset, 'sha256:' + asset.sha256, 320),
    ).rejects.toMatchObject({ code: 'public_media_retry' });
  });

  it('offers the verified original above prepared widths for large displays without making cards download it', () => {
    const entry = {
      sourceKey: 'original/a',
      sourceIdentity: 'sha256:' + asset.sha256,
      original: { width: 2560, height: 930 },
      widths: [640, 1280, 1600],
      variants: [
        {
          requestedWidth: 1600,
          width: 1600,
          height: 581,
          key: 'variant',
          sha256: 'b'.repeat(64),
          bytes: 10,
        },
      ],
    };
    const manifest = { policy: publicMediaPolicy, ready: true, assets: { a: entry } };
    const resolve = preparedImageVariants(manifest, (id) => '/assets/' + id);
    expect(resolve('a', [640, 1280, 1600], true)).toEqual([
      { url: '/assets/a?width=1600', width: 1600, height: 581 },
      { url: '/assets/a', width: 2560, height: 930 },
    ]);
    expect(resolve('a', [640, 1280, 1600])).toHaveLength(1);
    delete (entry as { original?: unknown }).original;
    expect(resolve('a', [640, 1280, 1600], true)).toBeUndefined();
  });
});
