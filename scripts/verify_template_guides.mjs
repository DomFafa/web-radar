import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { unstable_startWorker } from 'wrangler';
const artifacts = 'artifacts/template-guides-review';
await mkdir(artifacts, { recursive: true });
const state = artifacts + '/state';
execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'migrations', 'apply', 'web-radar', '--local', '--env', 'test', '--persist-to', state], { stdio: 'pipe' });
const key = 'wrtg_' + 'test'.repeat(12);
let worker;
try {
  worker = await unstable_startWorker({ config: 'wrangler.jsonc', env: 'test', bindings: { TEMPLATE_GUIDES_API_KEY: { type: 'secret_text', value: key } }, dev: { server: { hostname: '127.0.0.1', port: 8796 }, persist: state, inspector: false, watch: false, logLevel: 'error' } });
  await worker.ready;
  const origin = 'http://127.0.0.1:8796';
  const request = (path, credential = key, options = {}) => fetch(origin + path, { ...options, headers: { ...(credential ? { Authorization: 'Bearer ' + credential } : {}), ...options.headers } });
  const prefix = '/api/internal/template-guides';
  assert.equal((await request(prefix, '')).status, 401);
  const listResponse = await request(prefix);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert.equal(list.total, 10);
  for (const template of list.templates) {
    const response = await request(template.document);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    const guide = await response.json();
    assert.equal(guide.templateId, template.templateId);
    assert.ok(guide.assets.length >= 6);
    assert.ok(guide.textSlots.length >= 10);
    const md = await request(template.markdown);
    assert.equal(md.status, 200);
    assert.ok((await md.text()).includes(guide.name));
  }
  assert.equal((await request(prefix + '/schema')).status, 200);
  assert.equal((await request(prefix + '/output-schema')).status, 200);
  assert.equal((await request(prefix, key, { method: 'POST' })).status, 405);
  assert.equal((await request('/api/projects')).status, 401);
  for (const identity of ['owner', 'admin', 'platform']) {
    const login = await request('/api/auth/test-login', '', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity }) });
    assert.equal(login.status, 200);
    const session = await login.json();
    assert.equal((await request(prefix, session.token)).status, identity === 'platform' ? 200 : 403);
  }
  const entry = await readFile('dist/index.html', 'utf8');
  for (const [, path] of entry.matchAll(/src="(\/assets\/[^\"]+\.js)"/g)) {
    const js = await readFile('dist' + path, 'utf8');
    assert.ok(!js.includes('内部 AI 素材与文案生成规范'));
    assert.ok(!js.includes('TEMPLATE_GUIDES_API_KEY'));
    assert.ok(!js.includes('untrustedInputPolicy'));
  }
  const forbidden = (await readdir('dist', { recursive: true })).filter(path => /template-guides/.test(path));
  assert.deepEqual(forbidden, []);
  const result = { passed: true, templates: list.templates.map(t => t.templateId), checks: ['protected JSON and Markdown for all ten templates', 'JSON schemas', 'no anonymous/ordinary/workspace-admin access', 'read-only key cannot access projects or mutate', 'platform admin allowed', 'no documents or secrets in public bundle'], checkedAt: new Date().toISOString() };
  await writeFile(artifacts + '/result.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally { await worker?.dispose(); }
