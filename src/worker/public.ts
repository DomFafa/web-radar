import { Hono } from 'hono';
import type { Asset, Draft, PublicMediaAsset } from '../shared/model';
import type { AppEnv, HonoEnv } from './env';
import { publicAssetReferences } from './domain';
import { limitedBytes } from './providers/http';

const unavailable = (status = 503) =>
  new Response('Website temporarily unavailable', {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
  });
const activePublication = `FROM projects p JOIN releases r
  ON r.id=json_extract(p.data,'$.publishedReleaseId') AND r.project_id=p.id`;
const publicationConditions = `p.id=? AND json_extract(p.data,'$.id')=p.id
  AND coalesce(json_extract(p.data,'$.offline'),0)=0
  AND json_extract(r.data,'$.id')=r.id AND json_extract(r.data,'$.projectId')=p.id
  AND json_extract(r.data,'$.status')='succeeded'`;
const maxCachedBytes = 2 * 1024 * 1024;
const matches = (value: string | null, etag: string) =>
  Boolean(
    value &&
    value
      .split(',')
      .some((part) => part.trim() === '*' || part.trim().replace(/^W\//, '') === etag),
  );

async function mediaResponse(
  request: Request,
  env: AppEnv,
  asset: Asset,
  releaseId: string,
  entry?: PublicMediaAsset,
): Promise<Response> {
  const width = new URL(request.url).searchParams.get('width');
  const variant =
    width === null ? undefined : entry?.variants.find((v) => String(v.requestedWidth) === width);
  if (width !== null && !variant) return unavailable(404);
  const key = variant?.key ?? asset.key,
    size = variant?.bytes ?? asset.size;
  const mime = variant ? 'image/webp' : asset.contentType;
  const hash = variant?.sha256 ?? asset.sha256;
  let etag = hash && /^[a-f0-9]{64}$/.test(hash) ? `"${hash}"` : '';
  const headers = new Headers({
    'Cache-Control': 'private, no-cache',
    'Content-Type': mime,
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    'Content-Disposition': `inline; filename="${asset.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
  });
  // Cache bytes only; this function is entered after the fresh publication/membership read.
  const cache =
    mime.startsWith('image/') && size <= maxCachedBytes && typeof caches !== 'undefined'
      ? (caches as CacheStorage & { default: Cache }).default
      : undefined;
  const cacheKey = new Request(
    `${new URL(request.url).origin}/__private-media/${encodeURIComponent(asset.projectId)}/${encodeURIComponent(releaseId)}/${encodeURIComponent(asset.id)}/${encodeURIComponent(key)}/${encodeURIComponent(hash ?? entry?.sourceIdentity ?? 'immutable-original')}`,
  );
  let cached: Response | undefined;
  if (etag && matches(request.headers.get('If-None-Match'), etag)) {
    headers.set('ETag', etag);
    return new Response(null, { status: 304, headers });
  }
  try {
    cached = await cache?.match(cacheKey);
  } catch {
    /* Authorized R2 fallback. */
  }
  if (!etag) etag = cached?.headers.get('etag') ?? '';
  // Legacy objects have no stored SHA. A cold conditional/HEAD/If-Range needs exact R2 metadata.
  if (
    !etag &&
    (request.method === 'HEAD' ||
      request.headers.has('If-None-Match') ||
      request.headers.has('If-Range'))
  ) {
    const object = await env.MEDIA.head(key);
    if (!object) return unavailable(404);
    etag = object.httpEtag;
  }
  if (etag) headers.set('ETag', etag);
  if (etag && matches(request.headers.get('If-None-Match'), etag))
    return new Response(null, { status: 304, headers });
  let range: { offset: number; length: number } | undefined;
  const ifRange = request.headers.get('If-Range');
  const requested = !ifRange || (etag && ifRange === etag) ? request.headers.get('Range') : null;
  if (requested) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(requested);
    const start = match?.[1] ? Number(match[1]) : Math.max(0, size - Number(match?.[2]));
    const end = match?.[1] && match?.[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (
      !match ||
      (!match[1] && !match[2]) ||
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start >= size ||
      end < start
    ) {
      headers.set('Content-Range', `bytes */${size}`);
      headers.set('Cache-Control', 'no-store');
      return new Response(null, { status: 416, headers });
    }
    range = { offset: start, length: end - start + 1 };
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  }
  headers.set('Content-Length', String(range?.length ?? size));
  if (request.method === 'HEAD') {
    if (hash && !cached && !(await env.MEDIA.head(key))) return unavailable(404);
    return new Response(null, { status: range ? 206 : 200, headers });
  }
  if (cached) {
    if (!range) return new Response(cached.body, { headers });
    const bytes = new Uint8Array(await cached.arrayBuffer());
    return new Response(bytes.slice(range.offset, range.offset + range.length), {
      status: 206,
      headers,
    });
  }
  const object = await env.MEDIA.get(key, range ? { range } : undefined);
  if (!object) return unavailable(404);
  if (!etag && object.httpEtag) headers.set('ETag', object.httpEtag);
  if (cache && !range) {
    // Buffer only bounded image representations, never a video or a partial response.
    const bytes = new Uint8Array(
      await limitedBytes(new Response(object.body), Math.min(size + 1, maxCachedBytes)),
    );
    if (bytes.byteLength !== size || bytes.byteLength > maxCachedBytes) return unavailable();
    const internalHeaders = new Headers(headers);
    internalHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    try {
      await cache.put(cacheKey, new Response(bytes, { headers: internalHeaders }));
    } catch {
      /* Bytes remain available for this authorized request. */
    }
    return new Response(bytes, { headers });
  }
  return new Response(object.body, { status: range ? 206 : 200, headers });
}

export function createPublicApp(): Hono<HonoEnv> {
  const app = new Hono<HonoEnv>();
  app.onError(() => unavailable());
  app.on(['GET', 'HEAD'], '/:id/gate/:releaseId', async (c) => {
    const row = await c.env.DB.prepare(
      `SELECT r.id ${activePublication} WHERE ${publicationConditions}`,
    )
      .bind(c.req.param('id'))
      .first<{ id: string }>();
    if (!row) return unavailable();
    if (row.id !== c.req.param('releaseId')) return unavailable(404);
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  });
  app.on(['GET', 'HEAD'], '/:id/assets/:assetId', async (c) => {
    const projectId = c.req.param('id'),
      assetId = c.req.param('assetId');
    // New releases return only this asset's small entry. Legacy membership retains its original semantics.
    const row = await c.env.DB.prepare(
      `SELECT r.id AS releaseId, a.data AS asset,
      json_extract(r.data, '$.publicMedia.ready') AS ready,
      json_extract(r.data, ?) AS media,
      CASE WHEN json_extract(r.data,'$.publicMedia.ready')=1 THEN NULL ELSE json_extract(r.data,'$.draft') END AS draft
      ${activePublication} LEFT JOIN assets a ON a.id=? AND a.project_id=p.id
      WHERE ${publicationConditions}`,
    )
      .bind(`$.publicMedia.assets.${JSON.stringify(assetId)}`, assetId, projectId)
      .first<{
        releaseId: string;
        asset: string | null;
        ready: number | null;
        media: string | null;
        draft: string | null;
      }>();
    if (!row) return unavailable();
    const entry: PublicMediaAsset | undefined = row.media ? JSON.parse(row.media) : undefined;
    if (
      row.ready ? !entry : !publicAssetReferences(JSON.parse(row.draft!) as Draft).includes(assetId)
    )
      return unavailable(404);
    if (!row.asset) return unavailable(404);
    const asset: Asset = JSON.parse(row.asset);
    if (
      asset.id !== assetId ||
      asset.projectId !== projectId ||
      (entry && entry.sourceKey !== asset.key)
    )
      return unavailable(404);
    return mediaResponse(c.req.raw, c.env, asset, row.releaseId, entry);
  });
  app.all('/:id/gate/:releaseId', () => unavailable(405));
  app.all('/:id/assets/:assetId', () => unavailable(405));
  return app;
}
