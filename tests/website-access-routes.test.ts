import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { d1 } from './outreach/sqlite';
import { mintSession } from '../src/worker/auth';
import { applyUserAccess } from '../src/worker/user-access';
import type { Principal } from '../src/shared/model';
import type { AppEnv } from '../src/worker/env';
vi.mock('../src/worker/coordinator', () => ({ Coordinator: class {} }));
import app from '../src/worker/index';

let sqlite: DatabaseSync, env: AppEnv, actor: Principal;
const forwarded = vi.fn(async (_request: Request) => Response.json({ forwarded: true }));
const context = { waitUntil: vi.fn(), passThroughOnException: vi.fn(), props: {} } as unknown as ExecutionContext;
const person = (email: string, appRole: Principal['appRole'] = 'member', systemRole: Principal['systemRole'] = 'user'): Principal => ({
  userId: email, authSubject: email, email, displayName: email, systemRole,
  workspaceId: 'workspace', workspaceRole: appRole === 'admin' ? 'admin' : 'member', workspaceName: 'Demo', appRole,
});
beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter(file => file.endsWith('.sql')).sort()) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  env = {
    DB: d1(sqlite), ENVIRONMENT: 'production', TEST_PROVIDERS: 'false',
    PRODUCT_RADAR_BASE_URL: 'https://account.example.test', PRODUCT_RADAR_INTEGRATION_SECRET: 'test-secret-at-least-32-characters',
    COORDINATOR: { getByName: () => ({ fetch: forwarded }) },
  } as unknown as AppEnv;
  actor = person('customer@example.test');
  forwarded.mockClear();
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ protocolVersion: 1, principal: actor })));
});
afterEach(() => { sqlite.close(); vi.unstubAllGlobals(); });
async function request(path: string, method = 'GET', headers: Record<string, string> = {}) {
  const { token } = await mintSession(env, actor);
  return app.fetch(new Request('https://web-radar.net' + path, { method, headers: { Authorization: 'Bearer ' + token, ...headers } }), env, context);
}

it.each(['member', 'admin', 'analyst', 'viewer', 'super_admin'] as const)('does not grant website access to another %s account', async role => {
  actor = person('other@example.test', role === 'super_admin' ? 'admin' : role, role === 'super_admin' ? 'super_admin' : 'user');
  await applyUserAccess(env, actor);
  sqlite.prepare('UPDATE wr_members SET role=? WHERE user_id=?').run(actor.appRole!, actor.userId);
  for (const [path, method] of [
    ['/api/projects', 'GET'], ['/api/projects', 'POST'], ['/api/projects/project/preview', 'POST'],
    ['/api/projects/project/assets/image', 'GET'], ['/api/source-products', 'GET'], ['/api/admin', 'GET'],
    ['/api/admin/metrics', 'GET'], ['/api/admin/provider-accounts', 'GET'],
  ]) {
    const response = await request(path, method);
    expect(response.status, path).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'website_access_denied' });
  }
  expect(forwarded).not.toHaveBeenCalled();
});

it('forwards the verified owner and replaces the browser supplied internal principal', async () => {
  actor = person('vc.ddom@gmail.com', 'admin', 'super_admin');
  const response = await request('/api/projects', 'GET', { 'X-WR-Principal': JSON.stringify(person('forged@example.test')) });
  expect(response.status).toBe(200);
  expect(forwarded).toHaveBeenCalledOnce();
  const incoming = forwarded.mock.calls[0][0];
  expect(JSON.parse(decodeURIComponent(incoming.headers.get('X-WR-Principal')!)).email).toBe('vc.ddom@gmail.com');
  expect(incoming.headers.has('Authorization')).toBe(false);
});

it('keeps customers able to read contacts, email campaigns, site message jobs and inbox settings', async () => {
  for (const path of ['/api/outreach/contacts', '/api/outreach/campaigns', '/api/outreach/site-messages', '/api/inbox/configs']) {
    const response = await request(path);
    expect(response.status, path).toBe(200);
  }
  expect(forwarded).not.toHaveBeenCalled();
});

it('filters website providers for anonymous, customer and expired sessions, but preserves owner status', async () => {
  const config = async (headers: Record<string, string> = {}) => app.fetch(new Request('https://web-radar.net/api/config', { headers }), env, context);
  const visible = async (response: Response) => {
    expect(response.status).toBe(200);
    return (await response.json() as { services: { name: string }[] }).services.map(service => service.name);
  };
  expect(await visible(await config())).toEqual(['Product Radar', 'text']);
  expect(await visible(await request('/api/config'))).toEqual(['Product Radar', 'text']);
  expect(await visible(await config({ Cookie: '__Host-wr_session=' + 'x'.repeat(48) }))).toEqual(['Product Radar', 'text']);
  actor = person('vc.ddom@gmail.com', 'admin', 'super_admin');
  expect(await visible(await request('/api/config'))).toEqual(['Product Radar', 'text', 'image', 'agnes', 'site-builder', 'pages', 'email']);
});

it('propagates unavailable or disabled authenticated status instead of converting it to anonymous config', async () => {
  const { token } = await mintSession(env, actor);
  const read = () => app.fetch(new Request('https://web-radar.net/api/config', { headers: { Authorization: 'Bearer ' + token } }), env, context);
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({}, { status: 503 })));
  expect((await read()).status).toBe(503);
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ protocolVersion: 1, principal: actor })));
  expect((await read()).status).toBe(200);
  sqlite.prepare('UPDATE wr_members SET status=? WHERE user_id=?').run('disabled', actor.userId);
  expect((await read()).status).toBe(403);
});

it('keeps public site and public inquiry forwarding separate from customer website restrictions', async () => {
  expect((await request('/public/provider-assets/signed-image')).status).toBe(200);
  expect((await request('/api/public/sites/site/inquiries', 'POST')).status).toBe(200);
  expect(forwarded).toHaveBeenCalledTimes(2);
  for (const [incoming] of forwarded.mock.calls) expect(incoming.headers.has('X-WR-Principal')).toBe(false);
});

it('returns an uploaded email image URL that an anonymous recipient can read', async () => {
  const objects = new Map<string, { bytes: ArrayBuffer; contentType: string }>();
  const put = vi.fn(async (key: string, bytes: ArrayBuffer, options: any) => {
    objects.set(key, { bytes, contentType: options.httpMetadata.contentType });
  });
  env.MEDIA = { put, get: vi.fn(async (key: string) => {
    const value = objects.get(key);
    return value ? { body: value.bytes, httpEtag: 'test-image',
      writeHttpMetadata: (headers: Headers) => headers.set('Content-Type', value.contentType) } : null;
  }) } as unknown as R2Bucket;
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const form = new FormData(); form.set('image', new File([bytes], 'email.png', { type: 'image/png' }));
  const { token } = await mintSession(env, actor);
  const uploaded = await app.fetch(new Request('https://web-radar.net/api/outreach/upload', {
    method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form,
  }), env, context);
  expect(uploaded.status).toBe(200);
  const { url } = await uploaded.json() as { url: string };
  expect(url).toMatch(/^https:\/\/web-radar.net\/api\/outreach\/images\/[a-f0-9-]+\.png$/);
  const publicImage = await app.fetch(new Request(url), env, context);
  expect(publicImage.status).toBe(200);
  expect(publicImage.headers.get('Content-Type')).toBe('image/png');
  expect(new Uint8Array(await publicImage.arrayBuffer())).toEqual(bytes);
  expect(put).toHaveBeenCalledOnce();
  expect([...objects.keys()][0]).toMatch(/^outreach\/uploads\/[a-f0-9-]+\.png$/);
});

it.each([
  ['/api/outreach/upload', 'POST'], ['/api/outreach/contacts', 'GET'],
  ['/api/images/00000000-0000-4000-8000-000000000001.png', 'GET'],
  ['/api/outreach/images/projects%2Fprivate%2Fsecret.png', 'GET'],
  ['/api/projects/private/assets/secret', 'GET'],
])('preserves anonymous authentication boundaries at %s', async (path, method) => {
  const get = vi.fn(); env.MEDIA = { get } as unknown as R2Bucket;
  const response = await app.fetch(new Request('https://web-radar.net' + path, { method }), env, context);
  expect(response.status).toBe(401);
  expect(get).not.toHaveBeenCalled();
  expect(forwarded).not.toHaveBeenCalled();
});
