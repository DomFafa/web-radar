import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = process.env.WR_TEST_ORIGIN ?? 'http://127.0.0.1:8788';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname))
  throw new Error('Load acceptance is local-only');
async function request(path, token, body, method) {
  const response = await fetch(origin + path, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${data.message}`);
  return data;
}
const config = await request('/api/config');
assert.equal(config.testMode, true);
const measurements = [];
for (const count of [20, 50]) {
  const started = performance.now();
  const timings = [];
  let errors = 0;
  const ids = [];
  await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const start = performance.now();
      try {
        const { token } = await request('/api/auth/test-login', undefined, { identity: 'owner' });
        const { project } = await request('/api/projects', token, {
          name: `LOCAL TEST ${count} ${i}`,
          requestId: crypto.randomUUID(),
        });
        ids.push(project.id);
        const draft = {
          ...project.draft,
          products: [
            {
              id: 'load-product',
              name: 'Local test product',
              description: 'Explicit local fixture',
              material: 'Test',
              dimensions: 'Test',
            },
          ],
          primaryProductId: 'load-product',
          company: {
            ...project.draft.company,
            name: `Local validation ${i}`,
            email: 'validation@example.test',
            contactName: 'Local Tester',
          },
        };
        const saved = await request(
          `/api/projects/${project.id}`,
          token,
          { expectedVersion: project.version, draft },
          'PUT',
        );
        assert.equal(saved.project.draft.company.name, `Local validation ${i}`);
        const preview = await request(
          `/api/projects/${project.id}/preview?lang=en&page=home`,
          token,
        );
        assert.ok(preview.html.includes('Local validation'));
        const current = await request(`/api/projects/${project.id}`, token);
        assert.equal(current.project.version, saved.project.version);
        // Text jobs exercise durable queue admission without paid media calls.
        const queued = await request(`/api/projects/${project.id}/jobs`, token, {
          requestId: crypto.randomUUID(),
          expectedVersion: current.project.version,
          kind: 'copy',
        });
        assert.ok(queued.job.id);
      } catch (error) {
        errors++;
        process.stderr.write(String(error) + '\n');
      } finally {
        timings.push(performance.now() - start);
      }
    }),
  );
  timings.sort((a, b) => a - b);
  measurements.push({
    sessions: count,
    operations: 'login/create/save/preview/refresh/text-queue',
    errors,
    errorRate: errors / count,
    elapsedMs: Math.round(performance.now() - started),
    p50JourneyMs: Math.round(timings[Math.floor(count * 0.5)]),
    p95JourneyMs: Math.round(timings[Math.ceil(count * 0.95) - 1]),
    projectIds: ids,
  });
}
await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/load-acceptance.json',
  JSON.stringify(
    { at: new Date().toISOString(), environment: 'explicit local test', measurements },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    measurements.map(({ projectIds, ...result }) => result),
    null,
    2,
  ),
);
assert.ok(
  measurements.every((m) => m.errors === 0),
  'Load acceptance had errors',
);
