import { beforeEach, describe, expect, it, vi } from 'vitest';
import { testDb } from './helpers/db';
import { createAuthApp, mintSession } from '../src/worker/auth';
import { createIntegrationApp } from '../src/worker/integration';
import { prService, signInAtPr, testProduct, validateOrigin } from '../src/worker/product-radar';
import type { AppEnv } from '../src/worker/env';
import type { Principal } from '../src/shared/model';
const p: Principal = {
  userId: 'u1',
  authSubject: 's1',
  email: 'a@example.test',
  displayName: 'A',
  systemRole: 'user',
  workspaceId: 'w1',
  workspaceRole: 'member',
  workspaceName: 'Demo',
};
let env: AppEnv;
let creates: number;
const secret = 'test-only-integration-secret-32-characters';
beforeEach(() => {
  creates = 0;
  env = {
    DB: testDb(),
    PRODUCT_RADAR_BASE_URL: 'https://pr.example.test',
    PRODUCT_RADAR_INTEGRATION_SECRET: secret,
    PRODUCT_RADAR_PARENT_ORIGINS: 'https://pr.example.test',
    APP_ORIGIN: 'https://wr.example.test',
    COORDINATOR: {
      getByName: () => ({
        fetch: async () => {
          creates++;
          return Response.json({ project: { id: 'project-1' } });
        },
      }),
    },
  } as unknown as AppEnv;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ protocolVersion: 1, principal: p })),
  );
});
const payload = () => ({
  protocolVersion: 1,
  requestId: crypto.randomUUID(),
  intent: 'browse',
  parentOrigin: 'https://pr.example.test',
  principal: p,
  products: [],
});
function issue(app: ReturnType<typeof createIntegrationApp>, body: unknown) {
  return app.request(
    'https://wr.example.test/handoffs',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Web-Radar-Secret': secret },
      body: JSON.stringify(body),
    },
    env,
  );
}
function exchange(app: ReturnType<typeof createIntegrationApp>, body: unknown) {
  return app.request(
    'https://wr.example.test/exchange',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://wr.example.test' },
      body: JSON.stringify(body),
    },
    env,
  );
}
describe('integration grants', () => {
  it('preserves a batch of eight products with complete design context through authorization', async () => {
    const app = createIntegrationApp();
    const products = Array.from({ length: 8 }, (_, index) => ({
      ...testProduct(),
      id: `product-${index}`,
      image: { sourceProductId: `product-${index}`, contentType: null },
      conditions: {
        keep: ['original product structure'],
        source: { notes: 'Approved reference context. '.repeat(2500) },
        change: ['background only'],
      },
    }));
    const body = { ...payload(), intent: 'create', products };
    const bytes = new TextEncoder().encode(JSON.stringify(body)).byteLength;
    expect(bytes).toBeGreaterThan(256 * 1024);
    expect(bytes).toBeLessThan(1024 * 1024);
    const issued = await issue(app, body);
    expect(issued.status).toBe(200);
    const grant = (await issued.json()) as any;
    const row = await env.DB.prepare('SELECT payload FROM handoffs WHERE request_id=?')
      .bind(body.requestId)
      .first<{ payload: string }>();
    expect(JSON.parse(row!.payload).products).toEqual(products);
    const exchanged = await exchange(app, { ...grant, parentOrigin: body.parentOrigin });
    expect(exchanged.status).toBe(200);
    expect(((await exchanged.json()) as any).projectId).toBe('project-1');
  });
  it('rejects oversized handoffs before validating the upstream account', async () => {
    const app = createIntegrationApp();
    const product = testProduct();
    product.conditions = { source: { notes: 'x'.repeat(1024 * 1024) } };
    const response = await issue(app, { ...payload(), intent: 'create', products: [product] });
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ code: 'body_too_large' });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('recovers an unconsumed code, rejects changed payload and consumes once', async () => {
    const app = createIntegrationApp();
    const b = payload();
    const first = await issue(app, b);
    expect(first.status).toBe(200);
    const g = (await first.json()) as any;
    expect(((await (await issue(app, b)).json()) as any).code).toBe(g.code);
    expect((await issue(app, { ...b, intent: 'create' })).status).toBe(409);
    const body = { code: g.code, requestId: b.requestId, parentOrigin: b.parentOrigin };
    const r = await exchange(app, body);
    expect(r.status).toBe(200);
    expect(((await r.json()) as any).token).toBeTruthy();
    expect((await exchange(app, body)).status).toBe(409);
  });
  it('rejects foreign parent, mismatched request and expiration', async () => {
    const app = createIntegrationApp();
    const b = payload();
    expect((await issue(app, { ...b, parentOrigin: 'https://evil.test' })).status).toBe(403);
    const g = (await (await issue(app, b)).json()) as any;
    expect((await exchange(app, { ...g, parentOrigin: 'https://evil.test' })).status).toBe(403);
    await env.DB.prepare('UPDATE handoffs SET expires_at=0').run();
    expect((await exchange(app, { ...g, parentOrigin: b.parentOrigin })).status).toBe(410);
  });
  it('revalidates current membership instead of trusting supplied role', async () => {
    const app = createIntegrationApp();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'Forbidden' }, { status: 403 })),
    );
    expect((await issue(app, payload())).status).toBe(403);
  });
  it('rejects forged service credentials and origin request', async () => {
    const app = createIntegrationApp();
    expect(
      (
        await app.request(
          'https://wr.example.test/handoffs',
          { method: 'POST', body: JSON.stringify(payload()) },
          env,
        )
      ).status,
    ).toBe(401);
    const b = payload();
    const g = (await (await issue(app, b)).json()) as any;
    expect(
      (
        await app.request(
          'https://wr.example.test/exchange',
          {
            method: 'POST',
            headers: { Origin: 'https://evil.test', 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...g, parentOrigin: b.parentOrigin }),
          },
          env,
        )
      ).status,
    ).toBe(403);
  });
});
describe('session and network boundary', () => {
  it('denies stale roles on the next protected read', async () => {
    const token = await mintSession(env, p);
    const app = createAuthApp();
    expect(
      (await app.request('/me', { headers: { Authorization: `Bearer ${token.token}` } }, env))
        .status,
    ).toBe(200);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'Revoked' }, { status: 403 })),
    );
    expect(
      (await app.request('/me', { headers: { Authorization: `Bearer ${token.token}` } }, env))
        .status,
    ).toBe(403);
  });
  it('does not allow production test login or send secrets through redirects', async () => {
    const app = createAuthApp();
    expect(
      (
        await app.request(
          'https://wr.example.test/test-login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: 'owner' }),
          },
          env,
        )
      ).status,
    ).toBe(404);
    await prService(env, p, 'context', {});
    expect(vi.mocked(fetch).mock.calls[0][1]?.redirect).toBe('manual');
  });
  it.each([301, 302, 303, 307, 308])(
    'rejects HTTP %s without forwarding credentials',
    async (status) => {
      const upstream = vi.fn(
        async (_url: unknown, _init?: RequestInit) =>
          new Response(null, {
            status,
            headers: { Location: 'https://other.example.test/collect' },
          }),
      );
      vi.stubGlobal('fetch', upstream);
      await expect(prService(env, p, 'context')).rejects.toMatchObject({ status: 502 });
      expect(upstream).toHaveBeenCalledTimes(1);
      expect(upstream.mock.calls[0][1]?.redirect).toBe('manual');
      upstream.mockClear();
      await expect(signInAtPr(env, 'a@example.test', 'test-password')).rejects.toMatchObject({
        status: 502,
      });
      expect(upstream).toHaveBeenCalledTimes(1);
      expect(upstream.mock.calls[0][1]?.redirect).toBe('manual');
    },
  );
  it('validates exact safe origins', () => {
    expect(validateOrigin('https://example.test')).toBe('https://example.test');
    expect(() => validateOrigin('https://example.test/path')).toThrow();
    expect(() => validateOrigin('http://example.test')).toThrow();
    expect(() => validateOrigin('https://u:p@example.test')).toThrow();
    expect(validateOrigin('http://127.0.0.1:5174')).toBe('http://127.0.0.1:5174');
  });
});
describe('handoff recovery', () => {
  it('allows only one concurrent exchange to win', async () => {
    const app = createIntegrationApp();
    const b = payload();
    const g = (await (await issue(app, b)).json()) as any;
    const input = { ...g, parentOrigin: b.parentOrigin };
    const replies = await Promise.all(Array.from({ length: 20 }, () => exchange(app, input)));
    expect(replies.filter((r) => r.status === 200)).toHaveLength(1);
    expect(replies.filter((r) => r.status === 409)).toHaveLength(19);
  });
  it('renews consumed creation grants against the original project idempotency key', async () => {
    const app = createIntegrationApp();
    const b = { ...payload(), intent: 'create' };
    const one = (await (await issue(app, b)).json()) as any;
    const first = (await (
      await exchange(app, { ...one, parentOrigin: b.parentOrigin })
    ).json()) as any;
    const two = (await (await issue(app, b)).json()) as any;
    expect(two.code).not.toBe(one.code);
    const second = (await (
      await exchange(app, { ...two, parentOrigin: b.parentOrigin })
    ).json()) as any;
    expect(first.projectId).toBe('project-1');
    expect(second.projectId).toBe(first.projectId);
    expect(creates).toBe(2);
  });
  it('returns only a WR session after standalone credentials exchange', async () => {
    const app = createAuthApp();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) =>
        String(url).endsWith('/api/auth/sign-in')
          ? Response.json({ access_token: 'pr-access-test', refresh_token: 'pr-refresh-test' })
          : Response.json({ protocolVersion: 1, principal: p }),
      ),
    );
    const r = await app.request(
      'https://wr.example.test/sign-in',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@example.test', password: 'test-password' }),
      },
      env,
    );
    expect(r.status).toBe(200);
    const text = await r.text();
    expect(text).not.toContain('pr-access-test');
    expect(text).not.toContain('pr-refresh-test');
    expect(JSON.parse(text).token).toHaveLength(43);
    const sessions = await env.DB.prepare('SELECT * FROM sessions').all();
    expect(JSON.stringify(sessions)).not.toContain('pr-refresh-test');
  });
});
describe('authorization payload boundaries', () => {
  it('uses the revalidated role and stores only a hash of the grant', async () => {
    const app = createIntegrationApp();
    const b = { ...payload(), principal: { ...p, systemRole: 'super_admin' } };
    const issued = await issue(app, b);
    expect(issued.status).toBe(200);
    const grant = (await issued.json()) as any;
    const rows = await env.DB.prepare('SELECT * FROM handoffs').all();
    expect(JSON.stringify(rows)).not.toContain(grant.code);
    const exchanged = (await (
      await exchange(app, { ...grant, parentOrigin: b.parentOrigin })
    ).json()) as any;
    expect(exchanged.principal.systemRole).toBe('user');
  });
  it('never forwards client-controlled user/workspace overrides to Product Radar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ products: [], total: 0 })),
    );
    await prService(env, p, 'products', { userId: 'victim', workspaceId: 'foreign' });
    const input = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(input.userId).toBe(p.userId);
    expect(input.workspaceId).toBe(p.workspaceId);
  });
});
describe('test identities fail closed in production', () => {
  it('rejects persisted test session tokens outside explicit test environment', async () => {
    const session = await mintSession(env, p, 'owner');
    const response = await createAuthApp().request(
      '/me',
      { headers: { Authorization: `Bearer ${session.token}` } },
      env,
    );
    expect(response.status).toBe(401);
  });
  it('resolves test-prefixed principals with the real service in production', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'not a real account' }, { status: 403 })),
    );
    await expect(prService(env, { ...p, userId: 'test-owner' }, 'context')).rejects.toMatchObject({
      status: 403,
    });
    expect(fetch).toHaveBeenCalledOnce();
  });
});
