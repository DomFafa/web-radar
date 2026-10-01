import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const arg = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const output = resolve('artifacts/mello-gallery-fix');
await mkdir(output, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates'; export {defaultDraft} from './src/worker/domain'; export {typedMaterialsFixture} from './tests/fixtures/materials-typed'; export {draftFromMaterials} from './src/worker/materials-service'; export {projectPreviewRuntime} from './src/worker/project-preview';`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', outfile: `${output}/renderer.mjs` });
const { renderSite, defaultDraft, typedMaterialsFixture, draftFromMaterials, projectPreviewRuntime } = await import(`${output}/renderer.mjs`);
const fixture = await typedMaterialsFixture('mello-coffee', 2);
const materials = draftFromMaterials(fixture, Object.fromEntries(fixture.materials.media.map(m => [m.id, { id: m.id }])));
const regular = { ...defaultDraft(), template: 'mello-coffee', products: [{ id: 'coffee', name: 'Coffee selection', description: 'All product views', imageAssetId: 'main', gallery: ['main', ...Array.from({ length: 8 }, (_, i) => `side-${i}`)].map(assetId => ({ assetId, sourceImageId: assetId, kind: 'detail', caption: assetId })) }] };
const drafts = new Map([['regular', regular], ['materials', materials]]);
const project = arg('project') ? JSON.parse(await readFile(arg('project'), 'utf8')) : null;
if (project) drafts.set('customer', project.draft);
const documents = new Map();
for (const [name, draft] of drafts) {
  const customer = name === 'customer';
  documents.set('/' + name, renderSite(draft, { projectId: customer ? project.id : 'gallery-test', lang: 'en', page: 'detail', productId: draft.products[0].id, preview: false, inquiryUrl: '/inquiry', assetUrl: id => id.startsWith('/') || id.startsWith('https:') ? id : customer ? `https://web-radar.net/public/sites/${project.id}/assets/${id}` : `/images/${id}` }));
}
const svg = id => `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="${id.includes('main') || id === 'm1' ? '#eec674' : '#b3d4c0'}"/><text x="100" y="300" font-size="60">${id}</text></svg>`;
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (documents.has(path)) { res.setHeader('Content-Type', 'text/html'); return res.end(documents.get(path)); }
  if (path.startsWith('/images/')) { res.setHeader('Content-Type', 'image/svg+xml'); return res.end(svg(path.slice(8))); }
  try {
    const file = resolve('public', '.' + path);
    assert.ok(file.startsWith(resolve('public') + '/'));
    res.setHeader('Content-Type', ({ '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.avif': 'image/avif' })[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ channel: process.platform === 'darwin' ? 'chrome' : undefined });
const report = [];
try {
  const routes = arg('live') ? ['live'] : [...drafts.keys()];
  for (const name of routes) for (const sandbox of arg('live') ? [false] : [false, true]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, isMobile: width === 390, hasTouch: width === 390, reducedMotion: 'reduce' });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(arg('live') || `${origin}/${name}`, { waitUntil: 'domcontentloaded' });
    let scope = page;
    if (sandbox) {
      await page.setContent('<iframe sandbox="allow-scripts" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>');
      await page.locator('iframe').evaluate((frame, { html, runtime, origin }) => {
        const document = new DOMParser().parseFromString(html, 'text/html');
        document.querySelectorAll('script').forEach(node => node.remove());
        const base = document.createElement('base'); base.href = origin; document.head.prepend(base);
        const script = document.createElement('script'); script.textContent = runtime; document.body.append(script);
        frame.srcdoc = '<!doctype html>' + document.documentElement.outerHTML;
      }, { html: documents.get('/' + name), runtime: projectPreviewRuntime, origin });
      scope = page.frameLocator('iframe');
    }
    const main = scope.locator('#wr-detail-main-img');
    await main.waitFor(); await main.evaluate(image => image.decode());
    const controls = scope.locator('.mello-gallery [data-wr-material-thumb]');
    const count = await controls.count();
    assert.ok(count >= 2, `${name}: missing functional gallery controls`);
    // Published pages may initially serve a resized srcset candidate. Switching
    // back must restore the full original, not that optimized initial response.
    const original = await controls.first().locator('img').evaluate(image => image.src);
    const geometry = await main.boundingBox();
    for (let index = 0; index < count; index++) {
      const button = controls.nth(index);
      const expected = await button.locator('img').evaluate(image => ({ src: image.src, alt: image.alt }));
      if (width === 390) await button.tap(); else await button.click();
      await main.evaluate(image => image.decode());
      assert.equal(await main.evaluate(image => image.currentSrc), expected.src);
      assert.equal(await main.getAttribute('alt'), expected.alt);
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
      assert.equal(await scope.locator('.mello-gallery [aria-pressed="true"]').count(), 1);
      const rect = await main.boundingBox();
      assert.ok(Math.abs(rect.width - geometry.width) < 2 && Math.abs(rect.height - geometry.height) < 2, 'Main image dimensions changed');
    }
    await controls.first().focus(); await controls.first().press('Enter');
    assert.equal(await main.evaluate(image => image.currentSrc), original);
    await controls.nth(1).focus(); await controls.nth(1).press('Space');
    assert.equal(await controls.nth(1).getAttribute('aria-pressed'), 'true');
    // The magnified viewer must start on the selected image and include every view.
    await main.click();
    const dialog = scope.locator('#wr-product-image-viewer');
    assert.equal(await dialog.evaluate(element => element.open), true);
    assert.equal(await scope.locator('.wr-image-stage img').evaluate(image => image.src), await main.evaluate(image => image.src));
    assert.equal(await scope.locator('.wr-image-thumbnail').count(), count);
    await scope.locator('.wr-image-close').click();
    assert.deepEqual(errors, []);
    await scope.locator('.mello-detail-image').screenshot({ path: `${output}/${name}-${sandbox ? 'preview' : 'published'}-${width}.png` });
    report.push({ name, sandbox, width, imageCount: count, errors });
    console.log(`${name} ${sandbox ? 'preview' : 'published'} ${width}: ${count} images, click/tap/keyboard/zoom passed`);
    await context.close();
  }
  await writeFile(`${output}/${arg('live') ? 'live' : 'local'}-report.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); await new Promise(done => server.close(done)); }
