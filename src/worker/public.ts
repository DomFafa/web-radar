import { Hono } from 'hono';
import type { Asset, Project, Release } from '../shared/model';
import type { AppEnv, HonoEnv } from './env';
import { publicAssetReferences } from './domain';

const unavailable = (status = 503) =>
  new Response('Website temporarily unavailable', {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
  });

async function activeRelease(env: AppEnv, projectId: string): Promise<Release | undefined> {
  // Read the publication pointer and its immutable snapshot in one D1 read.
  const row = await env.DB.prepare(
    `SELECT p.data AS project, r.data AS release FROM projects p
     JOIN releases r ON r.id=json_extract(p.data, '$.publishedReleaseId') AND r.project_id=p.id
     WHERE p.id=?`,
  )
    .bind(projectId)
    .first<{ project: string; release: string }>();
  if (!row) return undefined;
  const project: Project = JSON.parse(row.project);
  const release: Release = JSON.parse(row.release);
  return !project.offline &&
    project.publishedReleaseId === release.id &&
    release.status === 'succeeded' &&
    release.projectId === projectId
    ? release
    : undefined;
}

async function mediaResponse(request: Request, env: AppEnv, asset: Asset): Promise<Response> {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': asset.contentType,
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    'Content-Disposition': `inline; filename="${asset.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
  });
  let range: { offset: number; length: number } | undefined;
  const requested = request.headers.get('Range');
  if (requested) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(requested);
    const start = match?.[1] ? Number(match[1]) : Math.max(0, asset.size - Number(match?.[2]));
    const end =
      match?.[1] && match?.[2] ? Math.min(Number(match[2]), asset.size - 1) : asset.size - 1;
    if (
      !match ||
      (!match[1] && !match[2]) ||
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start >= asset.size ||
      end < start
    ) {
      headers.set('Content-Range', `bytes */${asset.size}`);
      return new Response(null, { status: 416, headers });
    }
    range = { offset: start, length: end - start + 1 };
    headers.set('Content-Range', `bytes ${start}-${end}/${asset.size}`);
  }
  let object: R2Object | null;
  let body: ReadableStream<Uint8Array> | null = null;
  if (request.method === 'HEAD') object = await env.MEDIA.head(asset.key);
  else {
    const file = await env.MEDIA.get(asset.key, range ? { range } : undefined);
    object = file;
    body = file?.body ?? null;
  }
  if (!object) return unavailable(404);
  headers.set('Content-Length', String(range?.length ?? asset.size));
  headers.set('ETag', object.httpEtag);
  return new Response(body, {
    status: range ? 206 : 200,
    headers,
  });
}

export function createPublicApp(): Hono<HonoEnv> {
  const app = new Hono<HonoEnv>();
  app.onError(() => unavailable());
  app.on(['GET', 'HEAD'], '/:id/gate/:releaseId', async (c) => {
    const release = await activeRelease(c.env, c.req.param('id'));
    if (!release) return unavailable();
    if (release.id !== c.req.param('releaseId')) return unavailable(404);
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  });
  app.on(['GET', 'HEAD'], '/:id/assets/:assetId', async (c) => {
    const projectId = c.req.param('id'),
      assetId = c.req.param('assetId');
    const release = await activeRelease(c.env, projectId);
    if (!release) return unavailable();
    if (!publicAssetReferences(release.draft).includes(assetId)) return unavailable(404);
    const row = await c.env.DB.prepare('SELECT data FROM assets WHERE id=? AND project_id=?')
      .bind(assetId, projectId)
      .first<{ data: string }>();
    if (!row) return unavailable(404);
    const asset: Asset = JSON.parse(row.data);
    if (asset.projectId !== projectId) return unavailable(404);
    return mediaResponse(c.req.raw, c.env, asset);
  });
  app.all('/:id/gate/:releaseId', () => unavailable(405));
  app.all('/:id/assets/:assetId', () => unavailable(405));
  return app;
}
