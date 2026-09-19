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
const publication = base.extend({ jobId: z.uuid().optional() });

export function registerProjectIntegration(app: Hono<HonoEnv>) {
  for (const action of ['status', 'preview', 'publish', 'publication-status', 'assets/:assetId'] as const) {
    app.post('/projects/:projectId/' + action, async c => {
      await verifyMaterialsSecret(c.req.raw, c.env);
      const projectId = c.req.param('projectId')!;
      const assetId = c.req.param('assetId');
      if (!z.uuid().safeParse(projectId).success || (assetId && !/^[A-Za-z0-9_-]{1,200}$/.test(assetId)))
        throw new ApiError(400, 'invalid_project_service', '项目或素材标识无效。');
      const schema = action === 'preview' ? preview : action === 'publish' ? publish : action === 'publication-status' ? publication : base;
      const parsed = schema.safeParse(await jsonBody(c.req.raw, 4096));
      if (!parsed.success) throw new ApiError(400, 'invalid_project_service', '项目服务参数无效。');
      const { principal: identity, ...options } = parsed.data;
      const principal = await currentMaterialsPrincipal(c.env, identity);
      const url = new URL(`https://coordinator.internal/internal/product-radar-projects/${projectId}/${assetId ? 'assets/' + assetId : action}`);
      const headers = new Headers({ 'X-WR-Principal': encodeURIComponent(JSON.stringify(principal)), 'Content-Type': 'application/json' });
      if (assetId && c.req.header('Range')) headers.set('Range', c.req.header('Range')!);
      // Read operations stay GET internally, so preview/status never start background work.
      if (action !== 'publish') for (const [key, value] of Object.entries(options)) url.searchParams.set(key, String(value));
      const response = await c.env.COORDINATOR.getByName('global').fetch(new Request(url, {
        method: action === 'publish' ? 'POST' : 'GET', headers,
        body: action === 'publish' ? JSON.stringify(options) : undefined,
      }));
      const result = new Response(response.body, response);
      result.headers.set('Cache-Control', 'no-store');
      result.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return result;
    });
  }
}
