import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = process.cwd(), output = resolve(root, 'artifacts/product-gallery-review');
await mkdir(output, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates'; export {draftFromMaterials} from './src/worker/materials-service'; export {typedMaterialsFixture} from './tests/fixtures/materials-typed'; export {withProductImageViewer} from './src/shared/product-image-viewer'; export {projectPreviewRuntime} from './src/worker/project-preview'; export {templateMediaRequirements} from './src/shared/template-media';`, resolveDir: root }, bundle: true, platform: 'node', format: 'esm', outfile: resolve(output, 'renderer.mjs') });
const { renderSite, draftFromMaterials, typedMaterialsFixture, withProductImageViewer, projectPreviewRuntime, templateMediaRequirements } = await import(resolve(output, 'renderer.mjs'));
const input = await typedMaterialsFixture('senseng-candy', 2);
const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(m => [m.id, { id: m.id }])));
const svg = id => `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><defs><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#25455b" stroke-width="3"/></pattern></defs><rect width="1600" height="1000" fill="${id.includes('gallery') ? '#f7b8b0' : '#abdce5'}"/><circle cx="800" cy="500" r="310" fill="#f6d369"/><rect width="1600" height="1000" fill="url(#grid)"/><text x="800" y="500" text-anchor="middle" font-size="86" font-family="sans-serif">${id} · ORIGINAL</text></svg>`;
const typed = renderSite(draft, { projectId: 'fixture', lang: 'en', page: 'detail', productId: 'p1', assetUrl: id => `/images/${id}`, inquiryUrl: '/inquiry' });
const clone = withProductImageViewer('<!doctype html><html lang="en"><head><style>body{margin:64px;font-family:system-ui}.gallery{width:500px}#product-image img{width:500px;height:420px;object-fit:contain;background:#f5f5f5}.thumb{width:70px}</style></head><body><h1>Generated product page</h1><section class="gallery"><div id="product-image"><img src="/images/m1" alt="Main product"></div><div class="thumbnails"><button><img src="/images/m1" alt="Front view"></button><button id="switch"><img src="/images/gallery-p1" alt="Side view"></button></div></section><script>document.querySelector("#switch").onclick=()=>document.querySelector("#product-image img").src="/images/gallery-p1"</script></body></html>', '/images/m1');
const templates = new Map();
for (const template of Object.keys(templateMediaRequirements).filter(name => name !== 'senseng-candy')) {
  const materials = await typedMaterialsFixture(template, 2);
  const site = draftFromMaterials(materials, Object.fromEntries(materials.materials.media.map(m => [m.id, { id: m.id }])));
  templates.set(template, renderSite(site, { projectId: 'fixture', lang: 'en', page: 'detail', productId: 'p1', assetUrl: id => `/images/${id}`, inquiryUrl: '/inquiry' }));
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/images/')) { res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); res.end(svg(url.pathname.split('/').pop())); return; }
    if (url.pathname.startsWith('/templates/')) {
      const file = resolve(root, 'public', '.' + url.pathname);
      assert.ok(file.startsWith(resolve(root, 'public/templates') + '/'));
      res.writeHead(200, { 'Content-Type': ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream' }); res.end(await readFile(file)); return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' }); res.end(url.pathname === '/clone' ? clone : templates.get(url.pathname.slice(1)) || typed);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = [], errors = [];
try {
  for (const mode of ['typed', 'clone', 'sandbox', ...templates.keys()]) {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: mobile, hasTouch: mobile });
      const page = await context.newPage(); page.on('pageerror', error => errors.push(mode + ': ' + error.message));
      await page.goto(origin + ('/' + mode));
      let scope = page;
      if (mode === 'sandbox') {
        const hydrated = typed.replace(/\/images\/([\w-]+)/g, (_, id) => 'data:image/svg+xml;base64,' + Buffer.from(svg(id)).toString('base64'));
        await page.setContent('<iframe sandbox="allow-scripts" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>');
        await page.locator('iframe').evaluate((frame, { html, runtime }) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          doc.querySelectorAll('script,meta[http-equiv="Content-Security-Policy"]').forEach(n => n.remove());
          for (const node of doc.querySelectorAll('*')) for (const attr of [...node.attributes]) if (attr.name.startsWith('on')) node.removeAttribute(attr.name);
          const script = doc.createElement('script'); script.textContent = runtime; doc.body.append(script); frame.srcdoc = '<!doctype html>' + doc.documentElement.outerHTML;
        }, { html: hydrated, runtime: projectPreviewRuntime });
        scope = page.frameLocator('iframe');
      }
      const main = scope.locator('[data-wr-image-zoom]').first(); await main.waitFor();
      await main.evaluate(image => image.decode()); await main.scrollIntoViewIfNeeded();
      if (mobile) {
        await main.tap(); assert.ok(await scope.locator('#wr-product-image-viewer').evaluate(d => d.open));
        await scope.locator('.wr-image-scale').tap(); assert.equal(await scope.locator('.wr-image-scale').getAttribute('aria-pressed'), 'true');
        await page.screenshot({ path: resolve(output, `${mode}-mobile.png`) });
        await scope.locator('.wr-image-close').tap();
        assert.equal(await scope.locator('#wr-product-image-viewer').evaluate(d => d.open), false);
      } else {
        await main.hover(); await scope.locator('#wr-product-image-detail').waitFor({ state: 'visible' });
        const geometry = await main.evaluate(image => {
          const rect = n => { const r = n.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
          return { image: rect(image), lens: rect(document.querySelector('#wr-product-image-lens')), pane: rect(document.querySelector('#wr-product-image-detail')), original: image.src === document.querySelector('#wr-product-image-detail img').src, modal: document.querySelector('dialog').open };
        });
        assert.equal(geometry.original, true); assert.equal(geometry.modal, false);
        assert.ok(geometry.pane.left >= geometry.image.right); assert.ok(geometry.lens.left >= geometry.image.left); assert.ok(geometry.lens.right <= geometry.image.right + 1);
        await page.screenshot({ path: resolve(output, `${mode}-desktop.png`) });
        await main.focus(); await main.press('Escape'); await scope.locator('#wr-product-image-detail').waitFor({ state: 'hidden' });
        await main.press('Enter'); await scope.locator('#wr-product-image-viewer[open]').waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await main.evaluate(i => document.activeElement === i), true);
        if (mode === 'clone') {
          await page.locator('#switch').click(); await main.evaluate(image => image.decode()); await main.hover();
          assert.match(await scope.locator('#wr-product-image-detail img').getAttribute('src'), /gallery-p1/);
        }
      }
      // Both click and keyboard open the gallery, independently of hover magnification.
      if (mobile) await main.tap(); else await main.click();
      const dialog = scope.locator('#wr-product-image-viewer');
      assert.equal(await dialog.evaluate(d => d.open), true);
      await scope.locator('.wr-image-stage img').evaluate(i => i.decode());
      assert.equal(await main.getAttribute('aria-haspopup'), 'dialog');
      const thumbnails = scope.locator('.wr-image-thumbnail');
      assert.ok(await thumbnails.count() >= 2);
      assert.ok(await scope.locator('.wr-image-title').innerText());
      const second = await thumbnails.nth(1).locator('img').getAttribute('src');
      await thumbnails.nth(1).click();
      await scope.locator('.wr-image-stage img').evaluate(i => i.decode());
      assert.equal(await scope.locator('.wr-image-stage img').getAttribute('src'), second);
      assert.equal(await thumbnails.nth(1).getAttribute('aria-pressed'), 'true');
      assert.equal(await thumbnails.nth(0).getAttribute('aria-pressed'), 'false');
      assert.equal(await scope.locator('.wr-image-stage img').evaluate(i => i.naturalWidth), 1600);
      await page.screenshot({ path: resolve(output, `${mode}-${mobile ? 'mobile' : 'desktop'}-gallery.png`) });
      if (mobile) await scope.locator('.wr-image-close').tap();
      else {
        await page.keyboard.press('Escape');
        assert.equal(await main.evaluate(i => document.activeElement === i), true);
        await main.press(' '); assert.equal(await dialog.evaluate(d => d.open), true);
        await page.mouse.click(2, 2); // Outside the desktop dialog.
      }
      assert.equal(await dialog.evaluate(d => d.open), false);
      assert.equal(await main.evaluate(i => document.activeElement === i), true);
      if (!mobile) { await main.hover(); await scope.locator('#wr-product-image-detail').waitFor({ state: 'visible' }); }
      // Native close events are queued: reopen before the old event arrives.
      await main.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const previousOverflow = await main.evaluate(() => document.body.style.overflow);
      await main.evaluate(image => { image.click(); document.querySelector('dialog').close(); image.click(); });
      await main.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await dialog.evaluate(d => d.open), true);
      assert.equal(await scope.locator('.wr-image-stage img').evaluate(i => i.src), await main.evaluate(i => i.src));
      await dialog.evaluate(d => d.close());
      await main.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await main.evaluate(() => document.body.style.overflow), previousOverflow);
      results.push({ mode, mobile, passed: true }); await context.close();
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'result.json'), JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }));
} finally { await browser.close(); await new Promise(done => server.close(done)); }
