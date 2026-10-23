import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Hono } from 'hono';
import { testDb } from './helpers/db';
import rpa, { sweepExpiredRpaJobs } from '../src/worker/rpa/api';
import { normalizeRows } from '../src/worker/rpa/domains';
import type { AppEnv, HonoEnv } from '../src/worker/env';
import type { Principal } from '../src/shared/model';

const person = (id: string, workspaceId: string, appRole: Principal['appRole'] = 'member'): Principal => ({
  userId: id, authSubject: id, email: id + '@example.test', displayName: 'Verified ' + id,
  systemRole: 'user', workspaceId, workspaceName: workspaceId,
  workspaceRole: appRole === 'admin' ? 'admin' : 'member', appRole,
});
const users: Record<string, Principal> = {
  owner: person('owner', 'w1'),
  other: person('other', 'w1'),
  foreign: person('foreign', 'w2'),
  admin: person('admin', 'w1', 'admin'),
  viewer: person('viewer', 'w1', 'viewer'),
};
vi.mock('../src/worker/auth', () => ({
  authenticate: vi.fn(async (request: Request) => {
    const key = (request.headers.get('authorization') ?? '').replace(/^Bearer /, '');
    if (!users[key]) throw new (await import('../src/worker/http')).ApiError(401, 'session_required', 'Session required');
    return { principal: users[key], sessionHash: 'test', expiresAt: '' };
  }),
}));
const uuid = 'f1111111-1111-4111-8111-111111111111';
const id = 'a'.repeat(32);
const nextId = 'b'.repeat(32);
const fixture = new Uint8Array(readFileSync('tests/fixtures/rpa-batch.xlsx'));
const digest = createHash('sha256').update(fixture).digest('hex');
const domains = [
  { domain: 'example.com' },
  { domain: 'two.example', company: 'Second' },
];
const verification = {
  sha256: digest, domain_count: 2, total_contacts: 0,
  per_domain: [
    { domain: 'example.com', company: 'example.com', contact_rows: 0,
      complete_contact_rows: 0, collection_status: '', needs_review: true },
    { domain: 'two.example', company: 'Second', contact_rows: 0,
      complete_contact_rows: 0, collection_status: '', needs_review: true },
  ],
  zero_complete_contact_domains: ['example.com', 'two.example'],
  all_domains_have_contacts: false, structure_verified: true, business_reviewed: false,
};
const runEvidence = (jobId = id) => ({
  job_id: jobId, robot_uuid: uuid, input_sha256: digest, output_sha256: digest,
  mock: false, exit_code: 0, pid: 1234, engine_id: 'verified-run',
  run_log_tied_to_robot_uuid: true, all_io_paths_isolated: true,
});

let env: AppEnv;
let app: Hono<HonoEnv>;
let stored: Map<string, Uint8Array>;
beforeEach(async () => {
  const db = testDb();
  await db.exec(readFileSync('migrations/0017_rpa_jobs.sql', 'utf8'));
  stored = new Map();
  env = {
    DB: db, RPA_AGENT_TOKEN: 'agent-secret', RPA_APPROVED_ROBOT_UUID: uuid,
    MEDIA: {
      put: async (key: string, content: ArrayBuffer) => { stored.set(key, new Uint8Array(content)); },
      get: async (key: string) => {
        const data = stored.get(key);
        return data ? { body: new Response(data.slice().buffer).body } : null;
      },
    },
  } as unknown as AppEnv;
  app = new Hono<HonoEnv>();
  app.route('/api/rpa', rpa);
});

async function call(method: string, path: string, body?: unknown, bearer = 'owner', attempt?: string, hash?: string) {
  const headers: Record<string, string> = { authorization: 'Bearer ' + bearer };
  if (attempt) headers['X-Attempt-Id'] = attempt;
  if (hash) headers['X-Sha256'] = hash;
  const binary = body instanceof Uint8Array;
  if (body !== undefined) headers['Content-Type'] = binary ? 'application/octet-stream' : 'application/json';
  return app.request('https://web-radar.net/api/rpa' + path, {
    method, headers, body: body === undefined ? undefined
      : binary ? (body as Uint8Array).slice().buffer : JSON.stringify(body),
  }, env);
}
const create = (taskId = id, input: unknown = { domains }) => call('POST', '/jobs', { id: taskId, ...(input as object) });
async function claim() {
  const response = await call('POST', '/agent/claim', { robot_uuid: uuid }, 'agent-secret');
  expect(response.status).toBe(200);
  return (await response.json() as any).job;
}

describe('Web Radar RPA integration', () => {
  it('normalizes single and batch inputs and blocks duplicates or formula injection', () => {
    expect(normalizeRows({ domain: 'EXAMPLE.com.' })[0].domain).toBe('example.com');
    expect(normalizeRows({ domains }).map(row => row.company)).toEqual(['example.com', 'Second']);
    for (const invalid of [
      { domains: ['example.com', 'EXAMPLE.com'] },
      { domains: [{ domain: 'one.example', company: 'X' }, { domain: 'two.example', company: 'X' }] },
      { domain: 'https://example.com' },
      { domains: [{ domain: 'one.example', company: '=1+1' }] },
      { domains: Array.from({ length: 101 }, (_, i) => 'example' + i + '.test') },
    ]) expect(() => normalizeRows(invalid)).toThrow();
  });

  it('separates user sessions from Agent token and isolates workspaces', async () => {
    expect((await call('POST', '/agent/claim', { robot_uuid: uuid })).status).toBe(401);
    expect((await call('GET', '/jobs', undefined, 'agent-secret')).status).toBe(401);
    expect((await call('POST', '/jobs', { id, domains }, 'viewer')).status).toBe(403);
    expect((await create()).status).toBe(201);
    expect((await create()).status).toBe(200);
    expect((await call('POST', '/jobs', { id, domains: [{ domain: 'other.example' }] })).status).toBe(409);
    expect((await call('POST', '/jobs', { id, domains }, 'foreign')).status).toBe(409);
    expect((await call('GET', `/jobs/${id}`, undefined, 'other')).status).toBe(404);
    expect((await call('GET', `/jobs/${id}`, undefined, 'foreign')).status).toBe(404);
    expect((await call('GET', '/jobs', undefined, 'other').then(r => r.json()) as any).jobs).toEqual([]);
    expect((await call('GET', '/jobs', undefined, 'admin').then(r => r.json()) as any).jobs).toHaveLength(1);
    expect((await call('GET', `/jobs/${id}`, undefined, 'admin')).status).toBe(200);
    expect((await call('GET', `/jobs/${id}/artifact`, undefined, 'foreign')).status).toBe(404);
  });

  it('binds Excel artifacts, lease, genuine-run attestation and manual reviewer identity', async () => {
    expect((await create()).status).toBe(201);
    expect((await create(nextId, { domain: 'other.example' })).status).toBe(201);
    const [claimed, simultaneous] = await Promise.all([claim(), claim()]);
    expect([claimed, simultaneous].filter(Boolean)).toHaveLength(1);
    const attempt = (claimed || simultaneous).attempt_id as string;
    expect((await call('GET', `/agent/${id}/input`, undefined, 'agent-secret', crypto.randomUUID())).status).toBe(409);
    const input = await call('GET', `/agent/${id}/input`, undefined, 'agent-secret', attempt);
    expect((await input.json() as any).domains.map((row: any) => row.domain)).toEqual(['example.com', 'two.example']);
    expect((await call('POST', `/agent/${id}/start`, {}, 'agent-secret', attempt)).status).toBe(409);
    expect((await call('PUT', `/agent/${id}/input-artifact`, new Uint8Array([80, 75]), 'agent-secret', attempt,
      createHash('sha256').update(new Uint8Array([80, 75])).digest('hex'))).status).toBe(422);
    expect((await call('PUT', `/agent/${id}/input-artifact`, fixture, 'agent-secret', attempt, digest)).status).toBe(200);
    expect((await call('PUT', `/agent/${id}/input-artifact`, fixture, 'agent-secret', attempt, digest)
      .then(r => r.json()) as any).idempotent).toBe(true);
    expect((await call('POST', `/agent/${id}/start`, {}, 'agent-secret', attempt)).status).toBe(200);
    expect((await call('PUT', `/agent/${id}/artifact`, fixture, 'agent-secret', attempt, digest)).status).toBe(200);
    const result = { status: 'awaiting_review', technical_verified: true,
      business_reviewed: false, result_sha256: digest, verification };
    expect((await call('POST', `/agent/${id}/finish`, result, 'agent-secret', attempt)).status).toBe(422);
    expect((await call('POST', `/agent/${id}/finish`, { ...result, run_evidence: {
      ...runEvidence(), mock: true } }, 'agent-secret', attempt)).status).toBe(422);
    expect((await call('POST', `/agent/${id}/finish`, { ...result, run_evidence: {
      ...runEvidence(), run_log_tied_to_robot_uuid: false, run_log_tied_to_copy_uuid: true,
    } }, 'agent-secret', attempt)).status).toBe(422);
    expect((await call('POST', `/agent/${id}/finish`, { ...result, run_evidence: {
      ...runEvidence(), run_log_tied_to_copy_uuid: true,
    } }, 'agent-secret', attempt)).status).toBe(422);
    expect((await call('POST', `/agent/${id}/finish`, { ...result, run_evidence: {
      ...runEvidence(), output_sha256: 'f'.repeat(64) } }, 'agent-secret', attempt)).status).toBe(422);
    expect((await call('POST', `/agent/${id}/finish`, { ...result,
      verification: { ...verification, per_domain: [] },
      run_evidence: runEvidence() }, 'agent-secret', attempt)).status).toBe(422);
    expect((await call('POST', `/agent/${id}/finish`, {
      ...result, run_evidence: runEvidence() }, 'agent-secret', attempt)).status).toBe(200);
    const saved = (await (await call('GET', `/jobs/${id}`)).json() as any).job;
    expect(saved.status).toBe('awaiting_review');
    expect(saved.evidence.execution.job_id).toBe(id);
    expect((await call('GET', `/jobs/${id}/artifact`)).status).toBe(200);
    expect((await call('GET', `/jobs/${id}/input-artifact`)).status).toBe(200);
    const review = { business_reviewed: true, technical_verified: true,
      result_sha256: digest, verification_sha256: saved.verification_sha256, reviewer: 'IMPERSONATED' };
    expect((await call('POST', `/jobs/${id}/review`, {
      ...review, verification_sha256: '0'.repeat(64) })).status).toBe(409);
    expect((await call('POST', `/jobs/${id}/review`, review, 'other')).status).toBe(404);
    expect((await call('POST', `/jobs/${id}/review`, review)).status).toBe(200);
    const accepted = (await (await call('GET', `/jobs/${id}`)).json() as any).job;
    expect(accepted.status).toBe('business_accepted');
    expect(accepted.evidence.reviewer).toBe('Verified owner');
    expect(accepted.evidence.execution.output_sha256).toBe(digest);
    expect((await claim()).id).toBe(nextId);
  });

  it('rejects a lease that expires while R2 is storing an artifact', async () => {
    await create();
    const job = await claim();
    const put = env.MEDIA.put.bind(env.MEDIA);
    (env.MEDIA as any).put = async (key: string, contents: ArrayBuffer) => {
      await put(key, contents);
      await env.DB.prepare('UPDATE wr_rpa_jobs SET lease_until=0 WHERE id=?').bind(id).run();
    };
    const response = await call('PUT', `/agent/${id}/input-artifact`, fixture,
      'agent-secret', job.attempt_id, digest);
    expect(response.status).toBe(409);
    const saved = await env.DB.prepare('SELECT input_sha256,input_artifact_key FROM wr_rpa_jobs WHERE id=?')
      .bind(id).first<{ input_sha256: string | null; input_artifact_key: string | null }>();
    expect(saved?.input_sha256).toBeNull();
    expect(saved?.input_artifact_key).toBeNull();
    expect(stored.size).toBe(1); // Forensic orphan, never presented as a committed artifact.
    await sweepExpiredRpaJobs(env);
    expect((await (await call('GET', `/jobs/${id}`)).json() as any).job.status)
      .toBe('needs_reconciliation');
  });

  it('does not commit an artifact when R2 upload fails', async () => {
    await create();
    const job = await claim();
    (env.MEDIA as any).put = async () => { throw new Error('R2 unavailable'); };
    const response = await call('PUT', `/agent/${id}/input-artifact`, fixture,
      'agent-secret', job.attempt_id, digest);
    expect(response.status).toBe(500);
    const saved = await env.DB.prepare('SELECT input_sha256,input_artifact_key FROM wr_rpa_jobs WHERE id=?')
      .bind(id).first<{ input_sha256: string | null; input_artifact_key: string | null }>();
    expect(saved?.input_sha256).toBeNull();
    expect(saved?.input_artifact_key).toBeNull();
  });

  it('never automatically retries an expired execution and requires administrator reconciliation', async () => {
    await create();
    await create(nextId, { domain: 'other.example' });
    const job = await claim();
    await env.DB.prepare('UPDATE wr_rpa_jobs SET lease_until=0 WHERE id=?').bind(id).run();
    expect((await call('POST', `/agent/${id}/heartbeat`, {}, 'agent-secret', job.attempt_id)).status).toBe(409);
    await sweepExpiredRpaJobs(env);
    expect((await claim())).toBeNull();
    expect((await call('POST', `/jobs/${id}/reconcile`, {
      engine_stopped: true, execution_status_checked: true, notes: 'Checked the actual engine' })).status).toBe(403);
    expect((await call('POST', `/jobs/${id}/reconcile`, {
      engine_stopped: false, execution_status_checked: true, notes: 'Not stopped' }, 'admin')).status).toBe(422);
    expect((await call('POST', `/jobs/${id}/reconcile`, {
      engine_stopped: true, execution_status_checked: true, notes: 'Verified engine stopped' }, 'admin')).status).toBe(200);
    expect((await claim()).id).toBe(nextId);
    expect((await (await call('GET', `/jobs/${id}`)).json() as any).job.status).toBe('unverified');
  });
});
