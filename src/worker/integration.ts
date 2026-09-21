import { Hono } from 'hono';
import { z } from 'zod';
import type { HonoEnv, AppEnv } from './env';
import { testMode } from './env';
import type { Principal, Project } from '../shared/model';
import { ApiError, errorResponse, jsonBody, sha256, hmac, randomToken, canonical } from './http';
import {
  currentPrincipal,
  integrationConfig,
  parentOrigins,
  principalSchema,
} from './product-radar';
import { mintSession } from './auth';
import { importProductSnapshotSchema } from '../shared/product-snapshot';
import { registerProjectIntegration } from './project-integration';
import { registerMaterialsIntegration } from './materials-integration';
const handoffSchema = z
  .object({
    protocolVersion: z.literal(1),
    requestId: z.uuid(),
    intent: z.enum(['create', 'browse', 'open']),
    projectId: z.string().min(1).max(200).optional(),
    parentOrigin: z.string().max(500),
    principal: principalSchema,
    products: z.array(importProductSnapshotSchema).max(20),
  })
  .superRefine((v, ctx) => {
    if (v.intent === 'open' && (!v.projectId || v.products.length))
      ctx.addIssue({ code: 'custom', message: 'open requires projectId and no products' });
    if (v.intent !== 'open' && v.projectId)
      ctx.addIssue({ code: 'custom', message: 'unexpected projectId' });
    if (v.intent !== 'create' && v.products.length)
      ctx.addIssue({ code: 'custom', message: 'unexpected products' });
    if (new Set(v.products.map((p) => p.id)).size !== v.products.length)
      ctx.addIssue({ code: 'custom', message: 'duplicate product' });
    if (v.products.some((p) => p.id !== p.image.sourceProductId))
      ctx.addIssue({ code: 'custom', message: 'mismatched source image' });
  });
type Handoff = z.infer<typeof handoffSchema>;
type HandoffRow = {
  id: string;
  user_id: string;
  request_id: string;
  fingerprint: string;
  code_hash: string;
  code_nonce: string;
  expires_at: number;
  consumed_at: number | null;
  payload: string;
  project_id: string | null;
};
async function internal(
  env: AppEnv,
  path: string,
  principal: Principal,
  body?: unknown,
): Promise<{ project: Project }> {
  const r = await env.COORDINATOR.getByName('global').fetch(
    new Request('https://coordinator.internal' + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-WR-Principal': encodeURIComponent(JSON.stringify(principal)),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
  if (!r.ok) {
    const data = (await r.json()) as { message?: string };
    throw new ApiError(r.status, 'project_unavailable', data.message ?? '项目暂时不可用。');
  }
  return r.json();
}
async function grantCode(row: Pick<HandoffRow, 'id' | 'code_nonce'>, secret: string) {
  return hmac('web-radar-grant-v1:' + row.id + ':' + row.code_nonce, secret);
}
function assertParent(env: AppEnv, parentOrigin: string) {
  if (!parentOrigins(env).includes(parentOrigin))
    throw new ApiError(403, 'origin_forbidden', '此来源不允许打开 Web Radar。');
}
function assertSameOrigin(request: Request, env: AppEnv) {
  const origin = request.headers.get('Origin');
  const expected = env.APP_ORIGIN ?? new URL(request.url).origin;
  if (origin && origin !== expected)
    throw new ApiError(403, 'origin_forbidden', '请求来源不匹配。');
  if (!origin && request.headers.get('Sec-Fetch-Site') === 'cross-site')
    throw new ApiError(403, 'origin_forbidden', '请求来源不匹配。');
}
export function createIntegrationApp() {
  const app = new Hono<HonoEnv>();
  app.onError(errorResponse);
  registerMaterialsIntegration(app);
  registerProjectIntegration(app);
  app.post('/handoffs', async (c) => {
    const config = integrationConfig(c.env);
    const supplied = c.req.header('X-Web-Radar-Secret') ?? '';
    if ((await sha256(supplied)) !== (await sha256(config.secret)))
      throw new ApiError(401, 'integration_key_invalid', '集成凭据无效。');
    // Imported products carry their full design context; match the project body's 1 MiB limit.
    const parsed = handoffSchema.safeParse(await jsonBody(c.req.raw, 1024 * 1024));
    if (!parsed.success) throw new ApiError(400, 'invalid_handoff', '建站授权内容有误。');
    const payload = parsed.data;
    assertParent(c.env, payload.parentOrigin);
    const principal = await currentPrincipal(c.env, payload.principal);
    if (payload.intent === 'open')
      await internal(
        c.env,
        '/internal/check-project/' + encodeURIComponent(payload.projectId!),
        principal,
      );
    const fingerprint = await sha256(canonical(payload));
    const existing = await c.env.DB.prepare(
      'SELECT * FROM handoffs WHERE user_id=? AND request_id=?',
    )
      .bind(principal.userId, payload.requestId)
      .first<HandoffRow>();
    let row = existing;
    const now = Date.now();
    if (existing && existing.fingerprint !== fingerprint)
      throw new ApiError(409, 'handoff_payload_conflict', '同一请求标识的内容已改变，请重新操作。');
    if (!row) {
      const id = crypto.randomUUID();
      const nonce = randomToken();
      const code = await grantCode({ id, code_nonce: nonce }, config.secret);
      await c.env.DB.prepare(
        'INSERT OR IGNORE INTO handoffs(id,user_id,request_id,fingerprint,code_hash,code_nonce,expires_at,payload) VALUES(?,?,?,?,?,?,?,?)',
      )
        .bind(
          id,
          principal.userId,
          payload.requestId,
          fingerprint,
          await sha256(code),
          nonce,
          now + 120000,
          JSON.stringify(payload),
        )
        .run();
      row = await c.env.DB.prepare('SELECT * FROM handoffs WHERE user_id=? AND request_id=?')
        .bind(principal.userId, payload.requestId)
        .first<HandoffRow>();
      if (!row || row.fingerprint !== fingerprint)
        throw new ApiError(409, 'handoff_payload_conflict', '请求内容冲突。');
    } else if (row.consumed_at !== null || row.expires_at <= now) {
      const nonce = randomToken();
      const code = await grantCode({ id: row.id, code_nonce: nonce }, config.secret);
      await c.env.DB.prepare(
        'UPDATE handoffs SET code_hash=?,code_nonce=?,expires_at=?,consumed_at=NULL WHERE id=? AND code_nonce=?',
      )
        .bind(await sha256(code), nonce, now + 120000, row.id, row.code_nonce)
        .run();
      row = await c.env.DB.prepare('SELECT * FROM handoffs WHERE id=?')
        .bind(row.id)
        .first<HandoffRow>();
      if (!row) throw new ApiError(409, 'handoff_conflict', '授权已改变，请重试。');
    }
    return c.json({
      requestId: payload.requestId,
      code: await grantCode(row, config.secret),
      expiresAt: new Date(row.expires_at).toISOString(),
    });
  });
  app.post('/exchange', async (c) => {
    assertSameOrigin(c.req.raw, c.env);
    integrationConfig(c.env);
    const parsed = z
      .object({
        code: z.string().min(40).max(100),
        requestId: z.uuid(),
        parentOrigin: z.string().max(500),
      })
      .safeParse(await jsonBody(c.req.raw, 4096));
    if (!parsed.success) throw new ApiError(400, 'invalid_exchange', '授权交换内容有误。');
    const input = parsed.data;
    assertParent(c.env, input.parentOrigin);
    const hash = await sha256(input.code);
    const row = await c.env.DB.prepare('SELECT * FROM handoffs WHERE code_hash=?')
      .bind(hash)
      .first<HandoffRow>();
    if (!row) throw new ApiError(401, 'grant_invalid', '授权凭证无效，请重新连接。');
    if (row.consumed_at !== null)
      throw new ApiError(409, 'grant_consumed', '此授权已使用，请重新连接。');
    if (row.expires_at <= Date.now())
      throw new ApiError(410, 'grant_expired', '授权已过期，请重新连接。');
    const payload = JSON.parse(row.payload) as Handoff;
    if (payload.requestId !== input.requestId || payload.parentOrigin !== input.parentOrigin)
      throw new ApiError(403, 'grant_binding_mismatch', '授权来源或请求不匹配。');
    const principal = await currentPrincipal(c.env, payload.principal);
    let entry:'prepared-materials'|undefined;
    if (payload.intent === 'open') {
      const opened=await internal(
        c.env,
        '/internal/check-project/' + encodeURIComponent(payload.projectId!),
        principal,
      );
      if(opened.project.materials)entry='prepared-materials';
    }
    const consumed = await c.env.DB.prepare(
      'UPDATE handoffs SET consumed_at=? WHERE id=? AND code_hash=? AND consumed_at IS NULL AND expires_at>? RETURNING id',
    )
      .bind(Date.now(), row.id, hash, Date.now())
      .first<{ id: string }>();
    if (!consumed) throw new ApiError(409, 'grant_consumed', '此授权已使用，请重新连接。');
    let projectId = payload.projectId;
    if (payload.intent === 'create') {
      const result = await internal(c.env, '/internal/handoff-project', principal, {
        requestId: payload.requestId,
        principal,
        products: payload.products,
      });
      projectId = result.project.id;
      await c.env.DB.prepare('UPDATE handoffs SET project_id=? WHERE id=?')
        .bind(projectId, row.id)
        .run();
    }
    const session = await mintSession(
      c.env,
      principal,
      testMode(c.env) && principal.userId.startsWith('test-')
        ? principal.userId.replace('test-', '')
        : undefined,
    );
    return c.json({ ...session, projectId, target: projectId ? 'project' : 'browse',...(entry?{entry}:{}) });
  });
  return app;
}
