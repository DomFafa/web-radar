import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

// Actual renderer + confirmed-materials fixture + private-preview sanitizer. No live customer services.
const out = resolve('artifacts/careflow-browser');
await mkdir(out, { recursive: true });
await build({
  stdin: {
    contents: `export {renderSite} from './src/templates';export {getMaterialsTemplate} from './src/templates/materials';export {materialsDemoDraft} from './src/worker/template-guides/materials-demo';export {typedMaterialsFixture} from './tests/fixtures/materials-typed';export {draftFromMaterials} from './src/worker/materials-service';export {projectPreviewHtml,projectPreviewRuntimeForDraft} from './src/worker/project-preview';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  keepNames: true,
  platform: 'node',
  format: 'esm',
  outfile: resolve(out, 'render.mjs'),
});
const r = await import(pathToFileURL(resolve(out, 'render.mjs')).href);
const input = await r.typedMaterialsFixture('careflow-healthcare', 7);
const customer = r.draftFromMaterials(
  input,
  Object.fromEntries(input.materials.media.map((m) => [m.id, { id: m.id }])),
);
customer.company.name = 'Careflow community health and consultation services';
customer.materials.textBindings.find((b) => b.slotId === 'hero-headline').text =
  'Thoughtful support and clear information to help you explore the next step in your care and wellbeing';
customer.materials.textBindings.find((b) => b.slotId === 'hero-subtitle').text =
  'Explore the services available to you, learn about your options, and get in touch with our team to discuss your questions and confirm appointment arrangements.';
customer.materials.visual.palette.primary = '#eab308';
const hero = customer.materials.imageBindings.find((b) => b.slotId === 'home-hero');
hero.mobileAssetId = 'mobile-hero';
hero.mobileFocalPoint = { x: 0.8, y: 0.25 };
const demo = r.materialsDemoDraft(r.getMaterialsTemplate('careflow-healthcare'), 'en');
const publicDir = resolve('public'),
  fixture = await readFile(resolve(publicDir, 'templates/careflow/54c37cd4aefe107d.avif'));
let origin,
  submissions = 0;
const htmlCache = new Map();
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://local.test');
  if (url.pathname === '/inquiry') {
    submissions++;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end('{"ok":true}');
  }
  if (url.pathname.startsWith('/media/')) {
    res.writeHead(200, { 'Content-Type': 'image/avif' });
    return res.end(fixture);
  }
  if (url.pathname.startsWith('/templates/')) {
    const file = resolve(publicDir, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(publicDir + sep)) {
      res.writeHead(403);
      return res.end();
    }
    try {
      const bytes = await readFile(file);
      res.writeHead(200, {
        'Content-Type':
          {
            '.avif': 'image/avif',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.woff2': 'font/woff2',
            '.woff': 'font/woff',
            '.ttf': 'font/ttf',
          }[extname(file)] || 'application/octet-stream',
      });
      return res.end(bytes);
    } catch {
      res.writeHead(404);
      return res.end();
    }
  }
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }
  const match = url.pathname.match(
    /^\/(demo|customer|private)\/(home|catalog|detail|about|contact)$/,
  );
  if (!match) {
    res.writeHead(404);
    return res.end();
  }
  const [, mode, page] = match,
    key = `${mode}/${page}`;
  if (!htmlCache.has(key)) {
    const draft = mode === 'demo' ? demo : customer;
    let html = r.renderSite(draft, {
      projectId: mode === 'demo' ? 'materials-demo' : 'customer',
      lang: 'en',
      page,
      productId: 'p1',
      assetUrl: (id) => (id.startsWith('/templates/') ? id : origin + '/media/' + id),
      inquiryUrl: origin + '/inquiry',
      preview: mode === 'private',
    });
    if (mode === 'private')
      html = r
        .projectPreviewHtml(html, '/api/projects/fixture', origin, {
          page,
          lang: 'en',
          expectedVersion: 1,
        })
        .replace(
          '</body>',
          `<script>var __name=(v)=>v;${r.projectPreviewRuntimeForDraft(draft)}</script></body>`,
        );
    htmlCache.set(key, html);
  }
  res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  res.end(htmlCache.get(key));
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {}),
  results = [];
try {
  for (const mode of ['demo', 'customer', 'private']) {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.route('**/*', (route) =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
    );
    for (const pageName of ['home', 'catalog', 'detail', 'about', 'contact'])
      for (const width of [1440, 1024, 768, 390, 320]) {
        const page = await context.newPage(),
          errors = [],
          missing = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('response', (res) => {
          if (res.status() >= 400) missing.push(res.url());
        });
        await page.setViewportSize({ width, height: 960 });
        await page.goto(`${origin}/${mode}/${pageName}`, { waitUntil: 'load' });
        const metrics = await page.evaluate(async () => {
          document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'));
          await document.fonts.ready;
          const broken = [];
          await Promise.all(
            [...document.images]
              .filter(
                (i) =>
                  !i.closest(
                    '#wr-product-image-viewer:not([open]),#wr-product-image-detail[hidden]',
                  ),
              )
              .map(async (i) => {
                try {
                  await i.decode();
                } catch {
                  broken.push(i.getAttribute('src'));
                }
              }),
          );
          const headings = [...document.querySelectorAll('h1,h2,h3')].filter(
            (h) => h.getBoundingClientRect().width > 0,
          );
          const squeezed = headings
            .filter((h) => h.clientWidth > 0 && h.scrollWidth > h.clientWidth + 2)
            .map((h) => h.textContent);
          const opaque = headings
            .filter(
              (h) =>
                !['rgba(0, 0, 0, 0)', 'transparent'].includes(getComputedStyle(h).backgroundColor),
            )
            .map((h) => h.textContent);
          const luminosity = (color) => {
            const v = color
              .match(/[\d.]+/g)
              .slice(0, 3)
              .map(Number)
              .map((v) => {
                v /= 255;
                return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
              });
            return v[0] * 0.2126 + v[1] * 0.7152 + v[2] * 0.0722;
          };
          const contrasts = [...document.querySelectorAll('.primary-button')]
            .filter((b) => b.getBoundingClientRect().width > 0)
            .map((b) => {
              const s = getComputedStyle(b),
                l = [luminosity(s.color), luminosity(s.backgroundColor)].sort((a, b) => b - a);
              return (l[0] + 0.05) / (l[1] + 0.05);
            });
          return {
            width: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            broken,
            squeezed,
            opaque,
            contrasts,
            headings: headings.length,
            firstImage: document.querySelector('[data-careflow-image="home-hero"]')?.currentSrc,
          };
        });
        assert.deepEqual(errors, [], `${mode}/${pageName}/${width} script errors`);
        assert.deepEqual(missing, [], `${mode}/${pageName}/${width} missing assets`);
        assert.deepEqual(metrics.broken, [], `${mode}/${pageName}/${width} broken images`);
        assert.ok(
          metrics.documentWidth <= width + 1,
          `${mode}/${pageName}/${width} overflow: ${metrics.documentWidth}`,
        );
        assert.deepEqual(metrics.squeezed, [], `${mode}/${pageName}/${width} compressed text`);
        assert.deepEqual(
          metrics.opaque,
          [],
          `${mode}/${pageName}/${width} unexpected heading backgrounds`,
        );
        assert.ok(
          metrics.contrasts.every((c) => c >= 4.5),
          `${mode}/${pageName}/${width} button contrast ${metrics.contrasts}`,
        );
        if (width === 390) {
          const toggle = page.locator('[data-careflow-menu]');
          await toggle.click();
          assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
          assert.equal(await page.locator('#careflow-navigation').isVisible(), true);
          const menuBounds = await page.locator('#careflow-navigation').boundingBox();
          assert.ok(
            menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= width + 1,
            `${mode}/${pageName} mobile menu outside viewport`,
          );
          const icon = await page.locator('.cf-menu-icon').boundingBox();
          assert.ok(icon.width >= 18 && icon.height >= 12, 'visible hamburger icon');

          await page.keyboard.press('Escape');
          assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
          if (mode !== 'demo' && pageName === 'home')
            assert.ok(metrics.firstImage.endsWith('/mobile-hero'), 'mobile-specific image binding');
        }
        if (width === 390 && pageName === 'contact') {
          const headings = page.locator('.accordion-heading');
          await headings.last().click();
          assert.equal(await headings.last().getAttribute('aria-expanded'), 'true');
          await headings.last().press('Enter');
          assert.equal(await headings.last().getAttribute('aria-expanded'), 'false');
        }
        if (width === 1440 && pageName === 'about' && mode === 'demo') {
          const tabs = page.locator('.w-tab-link');
          await tabs.last().click();
          assert.equal(await tabs.last().getAttribute('aria-selected'), 'true');
          await tabs.last().press('ArrowLeft');
          assert.equal(await tabs.first().getAttribute('aria-selected'), 'true');
        }
        if (width === 1440 && pageName === 'home' && mode === 'demo') {
          await page.getByRole('button', { name: 'Next specialists' }).click();
          assert.ok(
            (await page.locator('.w-slider-mask').evaluate((e) => e.scrollLeft)) > 0,
            'specialists slider advances',
          );
        }
        if (width === 390 && pageName === 'detail' && mode !== 'demo') {
          const thumbs = page.locator('.senseng-detail-thumbs [data-wr-material-thumb]');
          await thumbs.last().click();
          assert.ok(
            (await page.locator('#wr-detail-main-img').getAttribute('src')).endsWith('/gallery-p1'),
          );
          await page.locator('#wr-detail-main-img').click();
          await page.locator('#wr-product-image-viewer[open]').waitFor();
          await page.keyboard.press('Escape');
        }
        if (width === 390 && pageName === 'contact' && mode !== 'demo') {
          const form = page.locator('form[data-careflow-form]');
          await form.locator('[name=name]').fill('Template verification');
          await form.locator('[name=email]').fill('test@example.invalid');
          await form.locator('[name=message]').fill('Local automated check.');
          const before = submissions;
          if (mode === 'private') {
            assert.equal(await form.locator('[type=submit]').isDisabled(), true);
            await form.evaluate((f) =>
              f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
            );
            assert.equal(submissions, before);
          } else {
            await form.locator('[type=submit]').click();
            await page.waitForFunction(() =>
              document
                .querySelector('[role=status]')
                ?.textContent.includes('inquiry has been sent'),
            );
            assert.equal(submissions, before + 1);
          }
        }
        if ((mode === 'demo' || mode === 'customer') && [1440, 390].includes(width)) {
          await page.screenshot({
            path: resolve(out, `${mode}-${pageName}-${width}.png`),
            fullPage: true,
          });
          await page.screenshot({
            path: resolve(out, `${mode}-${pageName}-${width}-viewport.png`),
          });
        }
        console.log(`PASS ${mode}/${pageName}/${width}`);
        results.push({ mode, page: pageName, viewport: width, ...metrics });
        await page.close();
      }
    await context.close();
  }
  await writeFile(
    resolve(out, 'results.json'),
    JSON.stringify({ cases: results.length, submissions, results }, null, 2) + '\n',
  );
  console.log(
    `PASS: ${results.length} Careflow cases: responsive layout, long copy, contrast, gallery, native interactions and private form isolation.`,
  );
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise((done) => server.close(done));
}
