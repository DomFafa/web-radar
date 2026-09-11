import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv, HonoEnv } from './env';
import { testMode } from './env';
import type { Principal } from '../shared/model';
import { ApiError, errorResponse, jsonBody, randomToken, sha256 } from './http';
import { currentPrincipal, isLoopback, signInAtPr, testPrincipal } from './product-radar';
const SESSION_MS = 15 * 60 * 1000;
export async function mintSession(env: AppEnv, principal: Principal, testIdentity?: string) {
  const token = randomToken();
  const now = Date.now();
  const expiresAt = now + SESSION_MS;
  await env.DB.prepare(
    'INSERT INTO sessions(token_hash,user_id,workspace_id,expires_at,test_identity,created_at) VALUES(?,?,?,?,?,?)',
  )
    .bind(
      await sha256(token),
      principal.userId,
      principal.workspaceId,
      expiresAt,
      testIdentity ?? null,
      now,
    )
    .run();
  return { token, expiresAt: new Date(expiresAt).toISOString(), principal };
}
export async function authenticate(
  request: Request,
  env: AppEnv,
): Promise<{ principal: Principal; sessionHash: string }> {
  const token = request.headers
    .get('Authorization')
    ?.match(/^Bearer ([A-Za-z0-9_-]{40,100})$/)?.[1];
  if (!token) throw new ApiError(401, 'session_required', '请登录 Web Radar。');
  const hash = await sha256(token);
  const row = await env.DB.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?')
    .bind(hash, Date.now())
    .first<{ user_id: string; workspace_id: string; test_identity: string | null }>();
  if (!row) throw new ApiError(401, 'session_expired', '登录已过期，请重新连接。');
  let principal: Principal;
  if (row.test_identity) {
    if (!testMode(env) || !isLoopback(new URL(request.url).hostname))
      throw new ApiError(401, 'test_session_invalid', '测试登录仅供本地测试环境使用。');
    principal = testPrincipal(row.test_identity);
  } else {
    principal = await currentPrincipal(env, {
      userId: row.user_id,
      workspaceId: row.workspace_id,
    } as Principal);
  }
  return { principal, sessionHash: hash };
}
async function loginRateLimit(request: Request, env: AppEnv) {
  const id = await sha256('sign-in:' + (request.headers.get('CF-Connecting-IP') ?? 'local'));
  const now = Date.now();
  const row = await env.DB.prepare(
    'INSERT INTO auth_attempts(id,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN reset_at<? THEN 1 ELSE attempts+1 END, reset_at=CASE WHEN reset_at<? THEN ? ELSE reset_at END RETURNING attempts',
  )
    .bind(id, now + 60000, now, now, now + 60000)
    .first<{ attempts: number }>();
  if ((row?.attempts ?? 11) > 10)
    throw new ApiError(429, 'login_rate_limit', '登录尝试过于频繁，请稍后重试。');
}
export function createAuthApp() {
  const app = new Hono<HonoEnv>();
  app.onError(errorResponse);
  app.post('/sign-in', async (c) => {
    await loginRateLimit(c.req.raw, c.env);
    const body = z
      .object({ email: z.email().max(320), password: z.string().min(1).max(1024) })
      .safeParse(await jsonBody(c.req.raw, 4096));
    if (!body.success) throw new ApiError(400, 'invalid_login', '请填写有效邮箱和密码。');
    const principal = await signInAtPr(c.env, body.data.email, body.data.password);
    return c.json(await mintSession(c.env, principal));
  });
  app.post('/test-login', async (c) => {
    if (!testMode(c.env) || !isLoopback(new URL(c.req.url).hostname))
      throw new ApiError(404, 'not_found', '页面不存在。');
    const body = z
      .object({ identity: z.enum(['owner', 'admin', 'member', 'outsider', 'platform']) })
      .safeParse(await jsonBody(c.req.raw, 1024));
    if (!body.success) throw new ApiError(400, 'invalid_identity', '请选择测试身份。');
    return c.json(await mintSession(c.env, testPrincipal(body.data.identity), body.data.identity));
  });
  app.get('/me', async (c) =>
    c.json({ principal: (await authenticate(c.req.raw, c.env)).principal }),
  );
  app.post('/sign-out', async (c) => {
    const auth = await authenticate(c.req.raw, c.env);
    await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(auth.sessionHash).run();
    return c.json({ ok: true });
  });
  return app;
}
