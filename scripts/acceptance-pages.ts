import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { createPagesGateway } from '../src/worker/providers/pages';
import { labels, renderSiteFiles } from '../src/templates';

// Local Pages runtime emulator: static ASSETS are rendered release artifacts;
// gate, public media and inquiry persistence use the actual local Worker/D1/R2.
const origin = 'http://127.0.0.1:8788';
const canonical = 'https://wr.local.test';
assert.equal((await (await fetch(origin + '/api/config')).json()).testMode, true);
const token = (
  await (
    await fetch(origin + '/api/auth/test-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'owner' }),
    })
  ).json()
).token;
async function api(path: string, body?: unknown) {
  const response = await fetch(origin + path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  assert.equal(response.ok, true, `${path}: ${response.status}`);
  return response.json();
}
const { projects } = await api('/api/projects');
const project = projects.find(
  (p: any) => p.name === 'Browser Studio acceptance' && p.publishedReleaseId && !p.offline,
);
assert.ok(project, 'Run acceptance-browser.mjs first to create its dedicated local fixture');
const detail = await api(`/api/projects/${project.id}`);
const release = detail.releases.find((r: any) => r.id === project.publishedReleaseId);
const files = renderSiteFiles(release.draft, {
  projectId: project.id,
  publicBaseUrl: `${origin}/public/sites/${project.id}`,
  assetUrl: (id) => `${origin}/public/sites/${project.id}/assets/${id}`,
  inquiryUrl: `/api/public/sites/${project.id}/inquiries`,
});
const upstream: string[] = [],
  assets: string[] = [],
  steps: string[] = [],
  errors: string[] = [];
let submittedInquiry: { id: string } | undefined;
const proxyFetch = async (input: string, init?: RequestInit) => {
  assert.ok(input.startsWith(canonical));
  const path = input.slice(canonical.length);
  upstream.push(path);
  const response = await fetch(origin + path, init);
  if (path.endsWith('/inquiries') && response.ok) submittedInquiry = await response.clone().json();
  return response;
};
const makeGateway = (releaseId: string, previousReleaseId?: string) =>
  new Function(
    'fetch',
    createPagesGateway(canonical, project.id, releaseId, previousReleaseId, {
      current: Object.keys(files).filter((path) => !path.startsWith('__wr_previous/')),
      previous: Object.keys(files)
        .filter((path) => path.startsWith('__wr_previous/'))
        .map((path) => path.slice('__wr_previous/'.length)),
    }).replace('export default', 'return'),
  )(proxyFetch);
let gateway = makeGateway(release.id);
const environment = {
  ASSETS: {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname.slice(1);
      assets.push(path);
      const html = files[path];
      return new Response(request.method === 'HEAD' ? null : (html ?? 'Not found'), {
        status: html ? 200 : 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    },
  },
};
const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
    const request = new Request(`http://127.0.0.1:${port}${incoming.url}`, {
      method: incoming.method,
      headers: incoming.headers as Record<string, string>,
      body: chunks.length ? Buffer.concat(chunks) : undefined,
    });
    const response = await gateway.fetch(request, environment);
    // Node fetch has decompressed the Worker response; do not label those bytes as gzip.
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');
    outgoing.writeHead(response.status, Object.fromEntries(headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    outgoing.writeHead(500);
    outgoing.end(String(error));
  }
});
await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert.ok(address && typeof address !== 'string');
const port = address.port,
  site = `http://127.0.0.1:${port}`;
await mkdir('artifacts/pages-browser', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto(site);
  assert.equal(new URL(page.url()).pathname, '/en/index.html');
  await expect(page.locator('h1')).toHaveText(release.draft.copy.en.headline);
  await page.locator('#hero-video').evaluate((video: HTMLVideoElement) => video.play());
  await expect
    .poll(() =>
      page.locator('#hero-video').evaluate((video: HTMLVideoElement) => video.currentTime),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: 'artifacts/pages-browser/home.png', fullPage: true });
  steps.push('stable Pages root redirects locally and serves static HTML; published R2 Hero plays');
  await page.locator('header [data-wr-page="catalog"]').click();
  await page.locator('[data-wr-page="detail"]').first().click();
  await expect(page.locator('section.detail h1')).toHaveText(release.draft.products[0].name);
  await page.screenshot({ path: 'artifacts/pages-browser/detail.png', fullPage: true });
  steps.push('static catalog navigation opens the selected product detail');
  await page.locator('header [data-wr-lang="de"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.locator('header [data-wr-page="contact"]').click();
  await page.locator('input[name=name]').fill('LOCAL Pages Buyer');
  await page.locator('input[name=email]').fill('pages-buyer@example.test');
  await page
    .locator('textarea[name=message]')
    .fill('LOCAL TEST: complete inquiry through static Pages gateway.');
  const submitted = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().endsWith('/inquiries'),
  );
  const accepted = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().endsWith('/inquiries'),
  );
  await page.locator('form button[type=submit]').click();
  const body = (await submitted).postDataJSON();
  const response = await accepted;
  assert.equal(response.status(), 200);
  await expect(page.locator('form [role=status]')).toHaveText(labels.de.sent);
  const inquiry = submittedInquiry;
  assert.ok(inquiry);
  const duplicate = await fetch(`${site}/api/public/sites/${project.id}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).id, inquiry.id);
  const saved = await api(`/api/projects/${project.id}/inquiries`);
  assert.equal(saved.inquiries.filter((i: any) => i.id === inquiry.id).length, 1);
  steps.push(
    'German contact form submits same-origin and duplicate request creates one D1 inquiry',
  );
  await page.screenshot({ path: 'artifacts/pages-browser/inquiry.png', fullPage: true });
  assert.ok(assets.includes('en/index.html'));
  assert.ok(
    upstream.every(
      (path) =>
        path === `/public/sites/${project.id}/gate/${release.id}` ||
        path === `/api/public/sites/${project.id}/inquiries`,
    ),
  );
  steps.push('canonical Worker receives only gate and inquiry calls; HTML uses ASSETS binding');
  for (const [path, html] of Object.entries(files)) files[`__wr_previous/${path}`] = html;
  files['en/index.html'] = files['en/index.html'].replace(
    release.draft.copy.en.headline,
    'NOT ACTIVATED NEW RELEASE',
  );
  gateway = makeGateway('promoted-but-not-activated-release', release.id);
  await page.goto(site);
  await expect(page.locator('h1')).toHaveText(release.draft.copy.en.headline);
  assert.ok(assets.includes('__wr_previous/en/index.html'));
  assert.equal((await fetch(site + '/__wr_previous/en/index.html')).status, 404);
  steps.push(
    'new deployment with uncommitted D1 activation keeps the previous static website live',
  );
  gateway = makeGateway('old-deployment-alias');
  assert.equal((await fetch(site, { redirect: 'manual' })).status, 404);
  assert.equal((await fetch(site + '/en/index.html')).status, 404);
  steps.push('stale deployment alias fails closed');
  gateway = makeGateway(release.id);
  const current = await api(`/api/projects/${project.id}`);
  await api(`/api/projects/${project.id}/offline`, { expectedVersion: current.project.version });
  for (const path of ['/', '/en/index.html', '/de/contact/index.html'])
    assert.equal((await fetch(site + path)).status, 503);
  assert.equal(
    (
      await fetch(`${site}/api/public/sites/${project.id}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, requestId: crypto.randomUUID() }),
      })
    ).status,
    503,
  );
  assert.equal(
    (await fetch(`${origin}/public/sites/${project.id}/assets/${release.draft.heroAssetId}`))
      .status,
    503,
  );
  steps.push('offline blocks static pages, alias inquiries and direct R2 media');
  assert.deepEqual(errors, []);
  await writeFile(
    'artifacts/pages-browser/result.json',
    JSON.stringify(
      {
        at: new Date().toISOString(),
        mode: 'local Pages runtime emulator; actual local Worker/D1/R2; no external deployment or mail',
        projectId: project.id,
        releaseId: release.id,
        steps,
        errors,
        staticRequests: assets.length,
        gateRequests: upstream.filter((path) => path.includes('/gate/')).length,
      },
      null,
      2,
    ),
  );
  console.log(steps.join('\n'));
} catch (error) {
  await page
    .screenshot({ path: 'artifacts/pages-browser/failure.png', fullPage: true })
    .catch(() => {});
  throw error;
} finally {
  await browser.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
