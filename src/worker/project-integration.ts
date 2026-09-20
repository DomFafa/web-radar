import type { Hono } from 'hono';
import { z } from 'zod';
import type { HonoEnv } from './env';
import { currentMaterialsPrincipal, verifyMaterialsSecret } from './materials-auth';
import { ApiError, jsonBody } from './http';

const identity = z.object({ userId: z.string().min(1).max(200), workspaceId: z.string().min(1).max(200) });
const base = z.strictObject({ principal: identity });
const version = z.number().int().positive();
const preview = base.extend({
  page: z.enum(['home', 'catalog', 'detail', 'about', 'contact']).optional(),
  lang: z.string().min(2).max(10).optional(),
  productId: z.string().min(1).max(200).optional(),
  expectedVersion: version.optional(),
  proxyBasePath: z.string().max(500).regex(/^\/api\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/).optional(),
});
const publish = base.extend({ requestId: z.string().min(4).max(120).regex(/^[\w-]+$/), expectedVersion: version });
const refresh = publish.extend({ expectedPublishedReleaseId: z.uuid() });
const publication = base.extend({ jobId: z.uuid().optional() });

export function registerProjectIntegration(app: Hono<HonoEnv>) {
  for (const action of ['status', 'preview', 'publish', 'refresh-publication', 'publication-status', 'assets/:assetId'] as const) {
    app.post('/projects/:projectId/' + action, async c => {
      await verifyMaterialsSecret(c.req.raw, c.env);
      const projectId = c.req.param('projectId')!;
      const assetId = c.req.param('assetId');
      if (!z.uuid().safeParse(projectId).success || (assetId && !/^[A-Za-z0-9_-]{1,200}$/.test(assetId)))
        throw new ApiError(400, 'invalid_project_service', '项目或素材标识无效。');
      const schema = action === 'preview' ? preview : action === 'publish' ? publish : action === 'refresh-publication' ? refresh : action === 'publication-status' ? publication : base;
      const parsed = schema.safeParse(await jsonBody(c.req.raw, 4096));
      if (!parsed.success) throw new ApiError(400, 'invalid_project_service', '项目服务参数无效。');
      const { principal: identity, ...options } = parsed.data;
      const authStarted = performance.now();
      const principal = await currentMaterialsPrincipal(c.env, identity);
      const coordinatorStarted = performance.now();
      const url = new URL(`https://coordinator.internal/internal/product-radar-projects/${projectId}/${assetId ? 'assets/' + assetId : action}`);
      const headers = new Headers({ 'X-WR-Principal': encodeURIComponent(JSON.stringify(principal)), 'Content-Type': 'application/json' });
      if (assetId && c.req.header('Range')) headers.set('Range', c.req.header('Range')!);
      // Read operations stay GET internally, so preview/status never start background work.
      const mutating = action === 'publish' || action === 'refresh-publication';
      if (!mutating) for (const [key, value] of Object.entries(options)) url.searchParams.set(key, String(value));
      const response = await c.env.COORDINATOR.getByName('global').fetch(new Request(url, {
        method: mutating ? 'POST' : 'GET', headers,
        body: mutating ? JSON.stringify(options) : undefined,
      }));
      const result = new Response(response.body, response);
      result.headers.append('Server-Timing', `wr-auth;dur=${(coordinatorStarted - authStarted).toFixed(1)}, wr-coordinator;dur=${(performance.now() - coordinatorStarted).toFixed(1)}`);
      result.headers.set('Cache-Control', 'no-store');
      result.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return result;
    });
  }
}
