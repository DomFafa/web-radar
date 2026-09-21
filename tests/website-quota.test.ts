import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { testDb } from './helpers/db';
import { DomainService } from '../src/worker/domain-service';
import { fixtureProviders } from '../src/worker/providers/fixtures';
import type { AppEnv } from '../src/worker/env';
import type { Principal, Project } from '../src/shared/model';

const principal: Principal = { userId: 'owner', workspaceId: 'workspace', authSubject: 'owner', email: 'owner@example.com', displayName: 'Owner', systemRole: 'user', workspaceRole: 'member', workspaceName: 'Workspace' };
let env: AppEnv, service: DomainService;
let exhausted: boolean, committed: number;
const ledger = new Map<string, { projectId: string; reservationId: string; status: string }>();
const calls: string[] = [];
beforeEach(async () => {
  exhausted = false; committed = 0; ledger.clear(); calls.length = 0;
  const DB = testDb();
  for (const file of readdirSync('migrations').filter(file => file.endsWith('.sql')).sort()) await DB.exec(readFileSync('migrations/' + file, 'utf8'));
  env = { DB, MEDIA: { put: vi.fn(), delete: vi.fn() }, PRODUCT_RADAR_BASE_URL: 'https://product.example', PRODUCT_RADAR_INTEGRATION_SECRET: 's'.repeat(40), ENVIRONMENT: 'production' } as unknown as AppEnv;
  service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env));
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const action = url.split('/').pop()!, body = JSON.parse(String(init.body)); calls.push(action);
    let row = ledger.get(body.projectId);
    if (action === 'status') return row ? Response.json(row) : Response.json({ message: 'No reservation' }, { status: 404 });
    if (action === 'reserve') {
      if (exhausted) return Response.json({ message: '本月网站额度已用完。' }, { status: 429 });
      if (!row || row.status === 'released') { row = { projectId: body.projectId, reservationId: crypto.randomUUID(), status: 'reserved' }; ledger.set(body.projectId, row); }
    } else {
      if (!row || body.reservationId !== row.reservationId) return Response.json({ message: 'Token conflict' }, { status: 409 });
      if (action === 'commit' && row.status === 'reserved') { row.status = 'charged'; committed++; }
      if (action === 'release' && row.status !== 'charged') row.status = 'released';
    }
    return Response.json(row);
  }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const create = (requestId = 'quota-create', buildBranch = 'template') => service.fetch(new Request('https://worker.test/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-WR-Principal': encodeURIComponent(JSON.stringify(principal)) }, body: JSON.stringify({ requestId, name: 'Website', buildBranch }) }));
it('denies new websites before any project or media side effects with a clear quota message', async () => {
  exhausted = true; const response = await create();
  expect(response.status).toBe(429); expect(await response.json()).toMatchObject({ message: '本月网站创建额度已用完，请联系管理员调整账号或工作区额度。' });
  expect(await service.store.list('projects')).toHaveLength(0); expect(env.MEDIA.put).not.toHaveBeenCalled();
});
it.each([
  [429, 'The monthly website creation allowance for this account or workspace has been reached.', '本月网站创建额度已用完，请联系管理员调整账号或工作区额度。'],
  [403, 'Website creation is not enabled for this account.', '当前账号尚未开通网站创建权限，请联系管理员。'],
  [409, 'The website reservation changed. Reload its current status before retrying.', '网站创建状态已变化，请重试原创建请求；若仍失败，请联系管理员。'],
  [503, 'Internal database details', '网站额度服务暂时不可用，请稍后重试原创建请求。'],
])('translates upstream %s failures without exposing service details', async (status, message, expected) => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ message }, { status: Number(status) })));
  const response = await create();
  expect(response.status).toBe(status); expect(await response.json()).toMatchObject({ message: expected });
});
it.each(['template', 'custom', 'clone'])('charges one %s website despite concurrent identical creates and restart replay', async mode => {
  const responses = await Promise.all([create('same', mode), create('same', mode)]);
  expect(responses.map(r => r.status)).toEqual([200, 200]);
  const bodies = await Promise.all(responses.map(r => r.json())) as any[];
  expect(bodies[0].project.id).toBe(bodies[1].project.id); expect(committed).toBe(1);
  service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env));
  expect((await create('same', mode)).status).toBe(200); expect(committed).toBe(1);
});
it('recovers a lost reserve response with the original project ID and no second pre-allocation', async () => {
  const fetcher = fetch; let lost = false;
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const response = await fetcher(url, init);
    if (url.endsWith('/reserve') && !lost) { lost = true; throw new Error('Response lost after reserve'); }
    return response;
  }));
  expect((await create()).status).toBe(503); expect(await service.store.list('projects')).toHaveLength(0);
  const id = [...ledger.keys()][0];
  service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env));
  const replay = await create(); expect(replay.status).toBe(200); expect((await replay.json() as any).project.id).toBe(id);
  expect(calls.filter(c => c === 'reserve')).toHaveLength(1); expect(committed).toBe(1); expect(calls).not.toContain('release');
});
it('recovers a lost commit response without losing the project or charging twice', async () => {
  const fetcher = fetch; let lost = false;
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const response = await fetcher(url, init);
    if (url.endsWith('/commit') && !lost) { lost = true; throw new Error('Response lost after charge'); }
    return response;
  }));
  expect((await create()).status).toBe(503); expect(await service.store.list('projects')).toHaveLength(1); expect(committed).toBe(1);
  service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env));
  expect((await create()).status).toBe(200); expect(committed).toBe(1); expect(calls).not.toContain('release');
});
it('retains an atomic D1 success when its response is lost', async () => {
  const batch = service.store.batch.bind(service.store);
  vi.spyOn(service.store, 'batch').mockImplementationOnce(async statements => { await batch(statements); throw new Error('D1 response lost'); });
  expect((await create()).status).toBe(200); expect(committed).toBe(1); expect(await service.store.list('projects')).toHaveLength(1);
  expect(env.MEDIA.delete).not.toHaveBeenCalled(); expect(calls).not.toContain('release');
});
it('releases a verified failed creation and reuses its project ID with a new token on retry', async () => {
  vi.spyOn(service.store, 'batch').mockRejectedValueOnce(new Error('Atomic batch rolled back'));
  expect((await create()).status).toBe(500); expect(await service.store.list('projects')).toHaveLength(0);
  const first = structuredClone([...ledger.values()][0]); expect(first.status).toBe('released');
  const response = await create(); expect(response.status).toBe(200);
  const project = (await response.json() as any).project;
  expect(project.id).toBe(first.projectId); expect(ledger.get(project.id)?.reservationId).not.toBe(first.reservationId); expect(committed).toBe(1);
});
it('finishes a persisted commit outbox on restart without a client retry', async () => {
  const fetcher = fetch; let unavailable = true;
  vi.stubGlobal('fetch', vi.fn((url: string, init: RequestInit) => unavailable && url.endsWith('/commit') ? Promise.reject(new Error('Offline')) : fetcher(url, init)));
  expect((await create()).status).toBe(503); expect(committed).toBe(0);
  unavailable = false; service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env));
  await service.tick(); expect(committed).toBe(1); expect(calls).not.toContain('release');
});
it('still charges a created website deleted while quota settlement is unavailable', async () => {
  const fetcher = fetch; let unavailable = true;
  vi.stubGlobal('fetch', vi.fn((url: string, init: RequestInit) => unavailable && url.endsWith('/commit') ? Promise.reject(new Error('Offline')) : fetcher(url, init)));
  expect((await create()).status).toBe(503);
  const [project] = await service.store.list<Project>('projects');
  const deleted = await service.fetch(new Request('https://worker.test/api/projects/' + project.id, { method: 'DELETE', headers: { 'X-WR-Principal': encodeURIComponent(JSON.stringify(principal)) } }));
  expect(deleted.status).toBe(200);
  unavailable = false; service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env));
  await service.tick();
  expect(await service.store.list('projects')).toHaveLength(0); expect(committed).toBe(1); expect(calls).not.toContain('release');
});
it('recovers a lost release response on restart before reserving a fresh token', async () => {
  const fetcher = fetch; let lost = false;
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const response = await fetcher(url, init);
    if (url.endsWith('/release') && !lost) { lost = true; throw new Error('Response lost after release'); }
    return response;
  }));
  vi.spyOn(service.store, 'batch').mockRejectedValueOnce(new Error('Atomic batch rolled back'));
  expect((await create()).status).toBe(500);
  const first = structuredClone([...ledger.values()][0]); expect(first.status).toBe('released');
  service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env));
  const response = await create(); expect(response.status).toBe(200);
  expect((await response.json() as any).project.id).toBe(first.projectId);
  expect(ledger.get(first.projectId)?.reservationId).not.toBe(first.reservationId); expect(committed).toBe(1);
});
it('does not retroactively charge historical idempotency results', async () => {
  expect((await create()).status).toBe(200);
  await env.DB.prepare("DELETE FROM idempotency WHERE scope LIKE 'website-quota:%'").run(); calls.length = 0;
  expect((await create()).status).toBe(200); expect(calls).toEqual([]);
});
it('covers handoff creation and never charges an unchanged replay', async () => {
  const body = { requestId: 'handoff-stable', products: [] };
  const send = () => service.fetch(new Request('https://worker.test/internal/handoff-project', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-WR-Principal': encodeURIComponent(JSON.stringify(principal)) }, body: JSON.stringify(body) }));
  expect((await send()).status).toBe(200); expect((await send()).status).toBe(200); expect(committed).toBe(1);
});
