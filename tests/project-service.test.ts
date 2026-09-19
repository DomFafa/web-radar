import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createIntegrationApp } from '../src/worker/integration';
import { DomainService } from '../src/worker/domain-service';
import { DomainStore } from '../src/worker/domain-store';
import { fixtureProviders } from '../src/worker/providers/fixtures';
import { ProviderError } from '../src/worker/provider-contract';
import { materialsFixture, materialsPng } from './fixtures/materials';
import { testDb } from './helpers/db';
import { listProjectSummaries } from '../src/worker/project-queries';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { draftFromMaterials } from '../src/worker/materials-service';
import { templateMediaRequirements } from '../src/shared/template-media';
import type { AppEnv } from '../src/worker/env';
import type { Job, Principal, Project } from '../src/shared/model';

// Exercise the actual service boundary, durable receiver, renderer and publication queue.
describe('Product Radar private project service', () => {
  let env: AppEnv, domain: DomainService, store: DomainStore;
  let fixture: Awaited<ReturnType<typeof materialsFixture>>, current: Principal, revoked: boolean;
  let providers: ReturnType<typeof fixtureProviders>;
  const app = createIntegrationApp();
  const secret = 's'.repeat(40);
  const objects = new Map<string, { bytes: Uint8Array; options: any }>();
  beforeEach(async () => {
    fixture = await materialsFixture(2); current = structuredClone(fixture.principal); revoked = false; objects.clear();
    const db = testDb();
    for (const file of readdirSync('migrations').filter(f => f.endsWith('.sql') && !f.startsWith('0001')).sort()) await db.exec(readFileSync('migrations/' + file, 'utf8'));
    const bucket = {
      async put(key: string, value: any, options: any) { objects.set(key, { bytes: new Uint8Array(await new Response(value).arrayBuffer()), options }); },
      async get(key: string) { const o = objects.get(key); return o ? { size: o.bytes.length, body: new Response(o.bytes.slice()).body, httpMetadata: o.options?.httpMetadata, customMetadata: o.options?.customMetadata, arrayBuffer: async () => o.bytes.slice().buffer, text: async () => new TextDecoder().decode(o.bytes) } : null; },
      async head(key: string) { return this.get(key); },
      async delete(keys: string | string[]) { for (const key of typeof keys === 'string' ? [keys] : keys) objects.delete(key); },
    };
    env = { DB: db, MEDIA: bucket, ENVIRONMENT: 'test', TEST_PROVIDERS: 'true', APP_ORIGIN: 'http://127.0.0.1:8788', PRODUCT_RADAR_BASE_URL: 'https://product.example.com', PRODUCT_RADAR_PARENT_ORIGINS: fixture.parentOrigin, PRODUCT_RADAR_INTEGRATION_SECRET: secret } as unknown as AppEnv;
    providers = fixtureProviders(env);
    vi.spyOn(providers, 'publish'); vi.spyOn(providers, 'resolveHostingTarget');
    domain = new DomainService(env, { schedule: async () => {} }, providers); store = new DomainStore(db);
    env.COORDINATOR = { getByName: () => ({ fetch: (request: Request) => domain.fetch(request) }) } as unknown as AppEnv['COORDINATOR'];
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).endsWith('/context') ? revoked ? Response.json({}, { status: 403 }) : Response.json({ protocolVersion: 1, principal: current }) : new Response(materialsPng, { headers: { 'content-type': 'image/png' } })));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  const post = (path: string, body: object = {}, key = secret) => app.request('http://127.0.0.1:8788' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Web-Radar-Secret': key }, body: JSON.stringify({ principal: { userId: current.userId, workspaceId: current.workspaceId }, ...body }) }, env);
  const call = (id: string, action: string, body = {}) => post(`/projects/${id}/${action}`, body);
  const accepted = async () => {
    expect((await post('/materials-submissions', fixture)).status).toBe(202);
    await domain.tick();
    const receipt: any = await (await post(`/materials-submissions/${fixture.submissionId}/status`, { principal: fixture.principal })).json();
    expect(receipt).toMatchObject({ state: 'accepted', autoPublish: false, nextAction: 'open-web-radar' });
    return (await store.one<Project>('projects', receipt.projectId))!;
  };
  it('renders confirmed pages with authenticated media and navigation without generation or publication', async () => {
    const project = await accepted();
    const state = await call(project.id, 'status'); expect(state.status).toBe(200);
    expect(await state.json()).toMatchObject({ schemaVersion: 'wr-project-service-v1', projectVersion: 1, languages: ['en'], products: [{ id: 'p0' }, { id: 'p1' }], publication: { status: 'idle' } });
    const base = `/api/web-radar/projects/${project.id}`;
    for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
      const response = await call(project.id, 'preview', { page, productId: 'p1', expectedVersion: 1, proxyBasePath: base }); expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.html).toContain('True Brand'); expect(data.html).toContain('noindex');
      expect(data.html).not.toContain(`/api/projects/${project.id}/assets/`);
      expect(data.html).toContain(base + '/preview?');
      if (page === 'detail') expect(data.html).toContain('Actual toy 1');
      if (page === 'contact') expect(data.html).toContain(' disabled');
    }
    const id = project.draft.products[0].imageAssetId!;
    const asset = await call(project.id, 'assets/' + id); expect(asset.status).toBe(200); expect(asset.headers.get('Cache-Control')).toBe('no-store'); expect(new Uint8Array(await asset.arrayBuffer())).toEqual(materialsPng);
    expect(await store.list('jobs')).toHaveLength(0); expect(await store.list('releases')).toHaveLength(0); expect(providers.publish).not.toHaveBeenCalled(); expect(providers.resolveHostingTarget).not.toHaveBeenCalled();
  });
  it('returns a fixed trusted runtime independent of customer content or page scripts', async () => {
    const p = await accepted();
    const first: any = await (await call(p.id, 'preview')).json();
    p.draft.company.name = 'CUSTOMER_CODE_MUST_NOT_ENTER_RUNTIME';
    await store.update('projects', p).run();
    const second: any = await (await call(p.id, 'preview', { page: 'detail' })).json();
    expect(first.runtime).toBe(second.runtime); expect(second.runtime).not.toContain(p.draft.company.name);
    expect(first.runtime).toContain('const __name='); expect(first.runtime).toContain('data-wr-banner');
    expect(first.runtime).not.toContain('<script'); expect(first.runtime).not.toContain(secret);
    expect(() => new Function(first.runtime)).not.toThrow();
  });
  it('rejects stale versions, unknown page/product/language and unsafe proxy prefixes', async () => {
    const p = await accepted();
    for (const body of [{ page: 'missing' }, { lang: 'de' }, { productId: 'foreign' }, { proxyBasePath: '//evil.test' }, { proxyBasePath: '/api/../admin' }]) expect((await call(p.id, 'preview', body)).status).toBe(400);
    expect((await call(p.id, 'preview', { expectedVersion: 2 })).status).toBe(409);
    expect((await call(p.id, 'publish', { requestId: crypto.randomUUID(), expectedVersion: 2 })).status).toBe(409);
  });
  it('refreshes roles for every surface, enforces the owner whitelist and current workspace', async () => {
    const p = await accepted(), asset = p.draft.products[0].imageAssetId!;
    const actions: [string, object][] = [['status', {}], ['preview', {}], ['assets/' + asset, {}], ['publication-status', {}], ['publish', { requestId: crypto.randomUUID(), expectedVersion: p.version }]];
    const check = async (status: number) => { for (const [action, body] of actions) expect((await call(p.id, action, body)).status, action).toBe(status); };
    await check(200); // queues publication; all later denial paths must remain side-effect free
    current.workspaceId = 'other-workspace'; await check(404);
    current.systemRole = 'super_admin'; expect((await call(p.id, 'status')).status).toBe(200);
    current.systemRole = 'user'; current.workspaceId = p.workspaceId; current.userId = 'company-admin'; current.workspaceRole = 'admin'; expect((await call(p.id, 'status')).status).toBe(200);
    current.workspaceRole = 'member'; await check(404);
    current.userId = p.ownerId; current.email = 'other@example.com'; await check(403);
    current.email = fixture.principal.email; revoked = true; await check(403);
    expect(providers.publish).not.toHaveBeenCalled();
    expect((await post(`/projects/${p.id}/status`, {}, 'wrong')).status).toBe(401);
  });
  it('scopes project lists to the current company even when the same user owns both', async () => {
    const p = await accepted();
    const foreign = { ...p, id: crypto.randomUUID(), workspaceId: 'another-company' }; await store.insert('projects', foreign).run();
    const list = (principal: Principal) => listProjectSummaries(env.DB, principal, new URL('https://wr.invalid/api/projects'));
    expect((await list(current)).projects.map(p => p.id)).toEqual([p.id]);
    expect((await list({ ...current, workspaceRole: 'member' })).projects.map(p => p.id)).toEqual([p.id]);
    expect((await list({ ...current, userId: 'colleague', workspaceRole: 'member' })).total).toBe(0);
    expect((await list({ ...current, userId: 'company-admin' })).total).toBe(1);
    expect((await list({ ...current, systemRole: 'super_admin' })).total).toBe(2);
  });
  it('rechecks refreshed role at the legacy project, asset and deletion boundaries', async () => {
    const p = await accepted();
    const stale = { ...current, userId: 'company-admin', workspaceRole: 'admin' as const };
    current = { ...stale, workspaceRole: 'member' };
    const request = (suffix = '', method = 'GET') => domain.fetch(new Request(`https://coordinator.internal/api/projects/${p.id}${suffix}`, { method, headers: { 'X-WR-Principal': encodeURIComponent(JSON.stringify(stale)) } }));
    expect((await request()).status).toBe(404);
    expect((await request('/assets/' + p.draft.products[0].imageAssetId)).status).toBe(404);
    expect((await request('', 'DELETE')).status).toBe(404);
    expect(await store.one('projects', p.id)).toBeTruthy();
  });
  it.each(Object.keys(templateMediaRequirements))('preserves media and navigation hooks for current %s materials', async template => {
    const p = await accepted(), input = await typedMaterialsFixture(template, 2);
    p.draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(m => [m.id, { id: 'stored-' + m.id } as any])));
    await store.update('projects', p).run();
    for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
      const response = await call(p.id, 'preview', { page, productId: 'p1' }); expect(response.status).toBe(200);
      const { html } = await response.json() as any;
      expect(html).toContain('data-wr-page='); expect(html).toContain(`/api/web-radar/projects/${p.id}/preview?`);
      expect(html).not.toContain('/api/projects/');
      expect(html).not.toMatch(/(?:src|poster|srcset)=["']\/templates\//);
      if (page === 'detail') expect(html).toContain(`/api/web-radar/projects/${p.id}/assets/stored-m1`);
    }
    expect(await store.list('jobs')).toHaveLength(0);
  });
  it('does not accept claimed roles and rejects foreign assets and jobs', async () => {
    const p = await accepted(); current.userId = 'other-member'; current.workspaceRole = 'member';
    expect((await call(p.id, 'status', { principal: { ...current, systemRole: 'super_admin', workspaceRole: 'admin' } })).status).toBe(404);
    current = structuredClone(fixture.principal);
    expect((await call(p.id, 'assets/foreign')).status).toBe(404);
    expect((await call(p.id, 'publication-status', { jobId: crypto.randomUUID() })).status).toBe(404);
  });
  it('publishes explicitly, deduplicates replay and returns a sanitized terminal URL', async () => {
    const p = await accepted(), body = { requestId: crypto.randomUUID(), expectedVersion: p.version };
    const first: any = await (await call(p.id, 'publish', body)).json();
    expect(first.publication.status).toBe('queued');
    const replay: any = await (await call(p.id, 'publish', body)).json(); expect(replay.publication.jobId).toBe(first.publication.jobId);
    await domain.tick();
    const done: any = await (await call(p.id, 'publication-status', { jobId: first.publication.jobId })).json(); expect(done.publication).toMatchObject({ status: 'succeeded', phase: 'complete' }); expect(done.publication.url).toBeTruthy(); expect(done.projectVersion).toBeGreaterThan(p.version); expect(done.publishedUrl).toBe(done.publication.url);
    expect(JSON.stringify(done)).not.toMatch(/"draft"|"principal"|"hostingTarget"/); expect(providers.publish).toHaveBeenCalledTimes(1);
    expect((await call(p.id, 'publish', body)).status).toBe(200); expect(await store.list('jobs')).toHaveLength(1);
    expect((await call(p.id, 'publish', { ...body, expectedVersion: 999 })).status).toBe(409);
  });
  it('does not dispatch when a company administrator is demoted after queueing', async () => {
    const p = await accepted(); current = { ...current, userId: 'company-admin' };
    expect((await call(p.id, 'publish', { requestId: crypto.randomUUID(), expectedVersion: p.version })).status).toBe(200);
    current.workspaceRole = 'member'; await domain.tick();
    expect(providers.publish).not.toHaveBeenCalled(); expect((await store.list<Job>('jobs'))[0].status).toBe('failed');
  });
  it('exposes an uncertain saved result without replacing the publication on replay', async () => {
    const p = await accepted();
    await env.DB.exec("CREATE TRIGGER reject_activation BEFORE UPDATE ON projects WHEN json_extract(NEW.data, '$.publishedReleaseId') IS NOT NULL BEGIN SELECT RAISE(ABORT, 'activation failed'); END");
    const body = { requestId: crypto.randomUUID(), expectedVersion: p.version };
    await call(p.id, 'publish', body); await domain.tick();
    const status: any = await (await call(p.id, 'publication-status')).json();
    expect(status.publication).toMatchObject({ status: 'unknown', phase: 'recovering', retryable: false });
    expect(status.publication.url).toBeUndefined(); expect(status.publishedUrl).toBeUndefined();
    const replay: any = await (await call(p.id, 'publish', body)).json();
    expect(replay.publication.jobId).toBe(status.publication.jobId); expect(providers.publish).toHaveBeenCalledTimes(1);
    expect(await store.list('releases')).toHaveLength(1);
  });
  it('blocks a queued publish after role revocation and allows a fresh request after a known failure', async () => {
    const p = await accepted();
    await call(p.id, 'publish', { requestId: crypto.randomUUID(), expectedVersion: p.version });
    current = { ...current, userId: p.ownerId, email: 'disabled@example.com' }; await domain.tick();
    expect(providers.publish).not.toHaveBeenCalled(); expect((await store.list<Job>('jobs'))[0].status).toBe('failed');
    current = structuredClone(fixture.principal);
    vi.mocked(providers.publish).mockRejectedValueOnce(new ProviderError('unavailable', 'Temporary provider failure', false));
    await call(p.id, 'publish', { requestId: crypto.randomUUID(), expectedVersion: p.version }); await domain.tick();
    const failed: any = await (await call(p.id, 'publication-status')).json(); expect(failed.publication).toMatchObject({ status: 'failed', retryable: true });
    await call(p.id, 'publish', { requestId: crypto.randomUUID(), expectedVersion: p.version }); await domain.tick();
    expect((await (await call(p.id, 'publication-status')).json() as any).publication.status).toBe('succeeded');
  });
});
