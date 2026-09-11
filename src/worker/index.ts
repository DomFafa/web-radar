import { Hono } from 'hono';
import type { HonoEnv } from './env';
import { testMode } from './env';
import { createAuthApp, authenticate } from './auth';
import { createIntegrationApp } from './integration';
import { ApiError, errorResponse } from './http';
import { integrationConfig, parentOrigins, isLoopback } from './product-radar';
import { createProviders } from './providers';
import { createPublicApp } from './public';
export { Coordinator } from './coordinator';
const app = new Hono<HonoEnv>();
app.onError(errorResponse);
app.use('*', async (c, next) => {
  if (testMode(c.env) && !isLoopback(new URL(c.req.url).hostname))
    throw new ApiError(403, 'test_local_only', '测试环境仅允许本地访问。');
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  const path = c.req.path;
  if (path.startsWith('/api/') || path.startsWith('/preview/'))
    c.header('Cache-Control', 'no-store');
  if (!path.startsWith('/public/')) {
    let ancestors = "'none'";
    if (path.startsWith('/embed/')) {
      try {
        ancestors = parentOrigins(c.env).join(' ') || "'none'";
      } catch {
        ancestors = "'none'";
      }
    }
    c.header(
      'Content-Security-Policy',
      `frame-ancestors ${ancestors}; base-uri 'self'; object-src 'none'`,
    );
  }
});
app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'web-radar', testMode: testMode(c.env) }),
);
app.get('/api/config', (c) => {
  let configured = false,
    origins: string[] = [];
  try {
    integrationConfig(c.env);
    configured = true;
  } catch {}
  try {
    origins = parentOrigins(c.env);
  } catch {}
  return c.json({
    testMode: testMode(c.env),
    parentOrigins: origins,
    services: [
      {
        name: 'Product Radar',
        configured,
        mode: testMode(c.env) ? 'test' : configured ? 'live' : 'unconfigured',
        detail: configured ? '账号衔接已配置，实际连通性待登录核验。' : '账号衔接尚未配置。',
      },
      ...createProviders(c.env).status(),
    ],
  });
});
app.route('/api/auth', createAuthApp());
app.route('/api/integrations/product-radar', createIntegrationApp());
app.route('/public/sites', createPublicApp());
app.all('/public/*', async (c) => {
  const headers = new Headers(c.req.raw.headers);
  headers.delete('X-WR-Principal');
  return c.env.COORDINATOR.getByName('global').fetch(new Request(c.req.raw, { headers }));
});
app.all('/api/public/*', async (c) => {
  const headers = new Headers(c.req.raw.headers);
  headers.delete('X-WR-Principal');
  return c.env.COORDINATOR.getByName('global').fetch(new Request(c.req.raw, { headers }));
});
app.all('/api/*', async (c) => {
  const { principal } = await authenticate(c.req.raw, c.env);
  const headers = new Headers(c.req.raw.headers);
  headers.set('X-WR-Principal', encodeURIComponent(JSON.stringify(principal)));
  headers.delete('Authorization');
  return c.env.COORDINATOR.getByName('global').fetch(new Request(c.req.raw, { headers }));
});
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));
export default app;
