import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { unstable_startWorker } from 'wrangler';
import { chromium } from '@playwright/test';

const root = 'artifacts/project-service-review';
await mkdir(root, { recursive: true });
await build({ entryPoints: ['tests/fixtures/materials.ts'], outfile: root + '/fixture.mjs', bundle: true, platform: 'node', format: 'esm' });
const { materialsFixture, materialsPng } = await import(pathToFileURL(resolve(root + '/fixture.mjs')));
const fixture = await materialsFixture(2);
const state = root + '/state-' + Date.now();
execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'migrations', 'apply', 'web-radar', '--local', '--env', 'test', '--persist-to', state], { stdio: 'pipe' });
const origin = 'http://127.0.0.1:8799', secret = 'isolated-project-service-secret-'.repeat(2);
let current = structuredClone(fixture.principal), worker, browser, reads = 0;
const prefix = '/api/integrations/product-radar';
try {
  worker = await unstable_startWorker({ config: 'wrangler.jsonc', env: 'test', bindings: {
    APP_ORIGIN: { type: 'plain_text', value: origin },
    PRODUCT_RADAR_BASE_URL: { type: 'plain_text', value: fixture.parentOrigin },
    PRODUCT_RADAR_PARENT_ORIGINS: { type: 'plain_text', value: fixture.parentOrigin },
    PRODUCT_RADAR_INTEGRATION_SECRET: { type: 'secret_text', value: secret },
  }, dev: { remote: false, server: { hostname: '127.0.0.1', port: 8799 }, persist: state, inspector: false, watch: false, logLevel: 'error', outboundService: async request => {
    assert.equal(new URL(request.url).origin, fixture.parentOrigin);
    assert.equal(request.headers.get('X-Web-Radar-Secret'), secret);
    if (new URL(request.url).pathname.endsWith('/context')) return Response.json({ protocolVersion: 1, principal: current });
    assert.equal(new URL(request.url).pathname, '/api/web-radar/service/material-assets'); reads++;
    return new Response(materialsPng, { headers: { 'content-type': 'image/png' } });
  } } });
  await worker.ready;
  const post = (path, body = {}, key = secret) => fetch(origin + prefix + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Web-Radar-Secret': key }, body: JSON.stringify({ principal: { userId: current.userId, workspaceId: current.workspaceId }, ...body }) });
  assert.equal((await post('/materials-submissions', fixture)).status, 202);
  let receipt;
  for (let i = 0; i < 80; i++) {
    const response = await post(`/materials-submissions/${fixture.submissionId}/status`, { principal: fixture.principal });
    receipt = await response.json();
    if (receipt.state !== 'receiving') break;
    await new Promise(r => setTimeout(r, 100));
  }
  assert.equal(receipt.state, 'accepted', JSON.stringify(receipt)); assert.equal(receipt.autoPublish, false); assert.equal(reads, 2);
  const project = '/projects/' + receipt.projectId;
  const status = await (await post(project + '/status')).json();
  assert.equal(status.publication.status, 'idle'); assert.equal(status.publishedUrl, undefined);
  const rendered = {};
  for (const page of status.pages) {
    const response = await post(project + '/preview', { page, productId: 'p1', expectedVersion: receipt.projectVersion });
    assert.equal(response.status, 200); assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const preview = await response.json(); assert.match(preview.html, /True Brand/); assert.match(preview.html, /noindex/);
    rendered[page] = { html: preview.html, runtime: preview.runtime };
    await writeFile(`${root}/${page}.html`, preview.html);
  }
  const asset = 'materials-' + fixture.submissionId + '-0';
  const image = await post(project + '/assets/' + asset); assert.equal(image.status, 200); assert.deepEqual(new Uint8Array(await image.arrayBuffer()), materialsPng);
  assert.equal((await post(project + '/preview', { expectedVersion: 999 })).status, 409);
  assert.equal((await post(project + '/status', {}, 'invalid')).status, 401);
  assert.equal((await fetch(origin + prefix + project + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
  current = { ...current, workspaceId: 'other-company' }; assert.equal((await post(project + '/status')).status, 404);
  current = { ...fixture.principal, email: 'other@example.com' };
  for (const path of ['/status', '/preview', '/assets/' + asset, '/publication-status', '/publish']) assert.equal((await post(project + path, path === '/publish' ? { requestId: 'denied', expectedVersion: 1 } : {})).status, 403);
  current = structuredClone(fixture.principal);
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const [name, { html, runtime }] of Object.entries(rendered)) {
      // Mirror the parent bridge's authenticated media loading, then feed an opaque-origin sandbox.
      const hydrated = html.replace(/\/api\/web-radar\/projects\/[A-Za-z0-9_-]+\/assets\/[A-Za-z0-9_-]+/g, 'data:image/png;base64,' + Buffer.from(materialsPng).toString('base64'));
      await page.setContent('<iframe sandbox="allow-scripts" style="width:100%;height:900px;border:0"></iframe>');
      await page.locator('iframe').evaluate((frame, { html, runtime }) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('script').forEach(node => node.remove());
        doc.querySelectorAll('*').forEach(node => { for (const a of [...node.attributes]) if (/^on/i.test(a.name)) node.removeAttribute(a.name); });
        const script = doc.createElement('script'); script.textContent = runtime; doc.body.append(script);
        frame.srcdoc = '<!doctype html>' + doc.documentElement.outerHTML;
      }, { html: hydrated, runtime });
      const frame = page.frames()[1]; await frame.waitForSelector('body');
      await frame.waitForFunction(() => document.body.innerText.includes('True Brand'));
      assert.ok(await frame.locator('[data-wr-page]').count());
      const broken = await frame.locator('img').evaluateAll(images => images.filter(i => i.complete && !i.naturalWidth && i.getAttribute('src')).length);
      assert.equal(broken, 0, `${name}:${width} broken images`);
      await page.screenshot({ path: `${root}/${name}-${width}.png` });
    }
  }
  assert.deepEqual(errors, []);
  assert.equal((await (await post(project + '/status')).json()).publication.status, 'idle');
  // Fixture provider only: this cannot access or publish a customer Cloudflare site.
  const body = { requestId: 'local-explicit-publish', expectedVersion: receipt.projectVersion };
  const queued = await (await post(project + '/publish', body)).json(); assert.ok(queued.publication.jobId);
  let done;
  for (let i = 0; i < 80; i++) {
    done = await (await post(project + '/publication-status', { jobId: queued.publication.jobId })).json();
    if (done.publication.status === 'succeeded') break;
    await new Promise(r => setTimeout(r, 100));
  }
  assert.equal(done.publication.status, 'succeeded', JSON.stringify(done));
  assert.equal((await (await post(project + '/publish', body)).json()).publication.jobId, queued.publication.jobId);
  const result = { passed: true, runtime: 'local workerd with isolated D1/R2 and fixture publishing', projectId: receipt.projectId, projectVersion: receipt.projectVersion, previewPages: Object.keys(rendered), widths: [390, 1440], jsErrors: errors, anonymousDenied: true, wrongWorkspaceDenied: true, nonOwnerAccountDenied: true, previewPublicationStatus: 'idle', explicitFixturePublication: done.publication.status, checkedAt: new Date().toISOString() };
  await writeFile(root + '/result.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} finally { await browser?.close(); await worker?.dispose(); }
