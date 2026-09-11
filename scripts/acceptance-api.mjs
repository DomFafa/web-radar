import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.WR_TEST_ORIGIN ?? 'http://127.0.0.1:8788';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const steps = [];
const record = (name) => steps.push(name);
async function req(path, token, body, method) {
  const r = await fetch(origin + path, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${path}: ${data.message}`);
  return data;
}
async function login(identity) {
  return (await req('/api/auth/test-login', null, { identity })).token;
}
assert.equal((await req('/api/config')).testMode, true);
const platform = await login('platform'),
  owner = await login('owner'),
  admin = await login('admin'),
  member = await login('member'),
  outsider = await login('outsider');
await req('/api/admin/quotas/test-owner', platform, { imageLimit: 100, videoLimit: 100 }, 'PUT');
await req('/api/admin/quotas/test-admin', platform, { imageLimit: 20, videoLimit: 20 }, 'PUT');
const source = await req('/api/source-products', owner);
let { project } = await req('/api/projects', owner, {
  name: 'Studio local acceptance',
  requestId: crypto.randomUUID(),
  products: source.products,
});
const id = project.id;
record('import snapshot and copy source bytes to private R2');
const route = '/api/projects/' + id;
const baseline = (await req(route, owner)).quota;
let draft = structuredClone(project.draft);
draft.company = {
  ...draft.company,
  name: 'Local Studio',
  email: 'inquiries@example.test',
  contactName: 'Local Tester',
  description: 'An explicitly fictional local test company.',
};
draft.country = 'United States';
draft.languages = ['en', 'de'];
draft.direction = 'Show the supplied product at its true scale. Preserve all references.';
({ project } = await req(route, owner, { expectedVersion: project.version, draft }, 'PUT'));
async function detail(token = owner) {
  return req(route, token);
}
async function action(name, body = {}, token = owner) {
  const current = await detail(token);
  const result = await req(route + '/' + name, token, {
    expectedVersion: current.project.version,
    ...body,
  });
  if (result.project) project = result.project;
  return result;
}
async function waitJobs(kind) {
  for (let attempt = 0; attempt < 150; attempt++) {
    const d = await detail();
    const jobs = d.jobs.filter((j) => j.kind === kind);
    if (jobs.length && jobs.every((j) => j.status === 'succeeded')) return d;
    if (jobs.some((j) => ['failed', 'unknown'].includes(j.status)))
      throw new Error(
        `${kind}: ${JSON.stringify(jobs.map((j) => ({ status: j.status, error: j.error })))}`,
      );
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timed out: ${kind}`);
}
await action('jobs', { kind: 'script', requestId: crypto.randomUUID() });
await waitJobs('script');
await action('confirm-script');
record('generate and confirm current script');
await action('jobs', { kind: 'image', requestId: crypto.randomUUID() });
let d = await waitJobs('image');
assert.equal(d.project.draft.scenes.length, 3);
assert.equal(d.quota.imageUsed, baseline.imageUsed + 3);
await action('confirm-storyboard');
record('three saved storyboard frames and owner quota');
await action('jobs', { kind: 'video', requestId: crypto.randomUUID() });
d = await waitJobs('video');
assert.ok(d.project.draft.heroAssetId);
assert.equal(d.quota.videoUsed, baseline.videoUsed + 1);
await action('accept-video', { assetId: d.project.draft.heroAssetId });
record('one complete 8s video saved and selected');
await action('jobs', { kind: 'copy', requestId: crypto.randomUUID() });
await waitJobs('copy');
const preview = await req(route + '/preview?lang=de&page=home', owner);
assert.ok(preview.html.includes('Local Studio'));
record('German authenticated site preview');
for (const token of [member, outsider]) {
  const denied = await fetch(origin + route, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(denied.status, 404);
}
assert.equal((await detail(admin)).project.id, id);
record('creator/admin/member/other-workspace permissions');
const assetId = d.project.draft.heroAssetId;
const denied = await fetch(origin + route + '/assets/' + assetId);
assert.equal(denied.status, 401);
const range = await fetch(origin + route + '/assets/' + assetId, {
  headers: { Authorization: `Bearer ${owner}`, Range: 'bytes=0-99' },
});
assert.equal(range.status, 206);
assert.equal((await range.arrayBuffer()).byteLength, 100);
record('private media auth and range');
await action('publish', { requestId: crypto.randomUUID() });
d = await waitJobs('publish');
assert.ok(d.project.publishedReleaseId);
const release1 = d.project.publishedReleaseId;
let live = await fetch(origin + '/public/sites/' + id);
assert.equal(live.status, 200);
record('activate immutable test release');
const inquiryBody = {
  requestId: crypto.randomUUID(),
  name: 'Test Buyer',
  email: 'buyer@example.test',
  company: 'Example buyer',
  message: 'LOCAL TEST inquiry; no real mail should be sent.',
};
const inquiry = await req('/api/public/sites/' + id + '/inquiries', null, inquiryBody);
const again = await req('/api/public/sites/' + id + '/inquiries', null, inquiryBody);
assert.equal(again.id, inquiry.id);
await waitJobs('email');
record('inquiry persistence/idempotency and explicitly simulated email');
d = await detail();
draft = structuredClone(d.project.draft);
draft.copy.en.headline = 'Second local release';
({ project } = await req(route, owner, { expectedVersion: d.project.version, draft }, 'PUT'));
live = await fetch(origin + '/public/sites/' + id);
assert.ok(!(await live.text()).includes('Second local release'));
record('draft changes do not change published content');
await action('publish', { requestId: crypto.randomUUID() });
d = await waitJobs('publish');
assert.notEqual(d.project.publishedReleaseId, release1);
await action('restore', { requestId: crypto.randomUUID() });
d = await waitJobs('publish');
assert.equal(d.project.draft.copy.en.headline, 'Second local release');
record('restore previous release while preserving draft');
await action('offline');
live = await fetch(origin + '/public/sites/' + id);
assert.equal(live.status, 503);
const stopped = await fetch(origin + '/api/public/sites/' + id + '/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...inquiryBody, requestId: crypto.randomUUID() }),
});
assert.equal(stopped.status, 409);
record('offline gates public pages and new inquiries');
await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/api-acceptance.json',
  JSON.stringify(
    { at: new Date().toISOString(), mode: 'explicit local test only', projectId: id, steps },
    null,
    2,
  ),
);
console.log(JSON.stringify({ projectId: id, passed: steps.length, steps }, null, 2));
