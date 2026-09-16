import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd(),
  out = resolve(root, 'artifacts/reference-review');
await mkdir(out, { recursive: true });
await build({
  stdin: {
    contents: `export {renderSite} from './src/templates/index'; export {defaultDraft} from './src/worker/domain'; export {referenceInteractions} from './src/templates/themes/referenceInteractions';`,
    resolveDir: root,
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: resolve(out, 'renderer.mjs'),
});
const { renderSite, defaultDraft, referenceInteractions } = await import(
  resolve(out, 'renderer.mjs') + `?t=${Date.now()}`
);
const ids = [
  'saas-automation',
  'fintech-platform',
  'digital-marketing',
  'porto-accounting',
  'crafto-corporate',
  'juno-toys',
  'corpox-ai-agency',
  'corpox-consulting',
];
const headlines = [
  'Automate your workflows eliminate manual tasks.',
  'Build & grow with scalable financial tools',
  'Fuel your growth with data-driven digital marketing',
  'Trusted Financial Guidance for Your Business Success.',
  'Awesome solutions for your business',
  'Pick the best toy for your kid',
  'Transform your business with the Intelligence',
  'Build a Strong Consulting Agency.',
];
const mime = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
const server = createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname.startsWith('/templates/')) {
      const p = resolve(root, 'public', '.' + u.pathname);
      if (!p.startsWith(resolve(root, 'public/templates') + '/')) throw Error();
      res.writeHead(200, { 'Content-Type': mime[extname(p)] || 'application/octet-stream' });
      res.end(await readFile(p));
      return;
    }
    const id = u.pathname.split('/')[1],
      d = defaultDraft();
    d.template = id;
    d.company.name = u.searchParams.has('products')
      ? 'senseng'
      : ['saas-automation', 'fintech-platform', 'digital-marketing'].includes(id)
        ? 'Nexsas'
        : id.startsWith('corpox')
          ? 'Corpox'
          : id === 'juno-toys'
            ? 'Juno'
            : id === 'porto-accounting'
              ? 'Porto'
              : 'Corporate';
    d.copy.en = {
      headline: headlines[ids.indexOf(id)],
      subtitle: 'Explore our products and discover what we can build together.',
      about: 'Product design, thoughtful service and dependable partnerships.',
      cta: 'Explore products',
    };
    if (u.searchParams.has('products')) {
      d.products = Array.from({ length: 8 }, (_, i) => ({
        id: `p-${i + 1}`,
        name: `senseng-${i + 1}`,
        description: 'Character-led squishy toys with shelf-ready packaging.',
        imageAssetId: `products-${i + 1}.jpg`,
      }));
      d.primaryProductId = 'p-3';
    }
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    let html = renderSite(d, {
      projectId: 'review',
      lang: 'en',
      page: u.searchParams.get('page') || 'home',
      productId: 'p-3',
      preview: true,
      assetUrl: (id) => '/templates/senseng/' + id,
      inquiryUrl: '/api/test-inquiry',
    });
    if (u.searchParams.has('sandbox')) {
      html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
      const csp =
        "default-src 'none'; img-src blob: data: https: http:; media-src blob: data: https: http:; style-src 'unsafe-inline' http://127.0.0.1:4182; font-src data: https: http://127.0.0.1:4182; script-src 'nonce-review'; base-uri 'none'; form-action 'none'";
      html = html.replace(
        '<head>',
        '<head><meta http-equiv="Content-Security-Policy" content="' +
          csp +
          '"><script nonce="review">window.violations=[];document.addEventListener("securitypolicyviolation",e=>window.violations.push(e.violatedDirective+":"+e.blockedURI))</script>',
      );
      html = html.replace(
        '</body>',
        '<script nonce="review">(' +
          referenceInteractions.toString() +
          ')();const v=document.getElementById("hero-video");if(v){v.muted=true;v.play().catch(()=>{});document.getElementById("video-toggle")?.addEventListener("click",()=>v.paused?v.play():v.pause());}</script></body>',
      );
      html =
        '<!doctype html><html><body style="margin:0"><iframe id="fixture-frame" sandbox="allow-scripts" style="width:100vw;height:100vh;border:0" srcdoc="' +
        html.replaceAll('&', '&amp;').replaceAll('"', '&quot;') +
        '"></iframe></body></html>';
    }
    res.end(html);
  } catch (e) {
    res.writeHead(404);
    res.end(String(e));
  }
});
await new Promise((r) => server.listen(4182, '127.0.0.1', r));
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const results = [];
try {
  for (const id of ids.filter(
    (id) => !process.env.TEMPLATES || process.env.TEMPLATES.split(',').includes(id),
  )) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [],
      failed = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('response', (r) => {
      if (r.status() >= 400) failed.push(r.url());
    });
    await p
      .goto(`http://127.0.0.1:4182/${id}`, { waitUntil: 'load', timeout: 25000 })
      .catch(() => {});
    await p.evaluate(() =>
      Promise.all(
        [...document.images].map((i) => {
          i.loading = 'eager';
          return i.decode().catch(() => {});
        }),
      ),
    );
    await p.screenshot({ path: resolve(out, id + '-desktop.png') });
    await p.screenshot({ path: resolve(out, id + '-full.png'), fullPage: true });
    const geometry = await p.evaluate(() => ({
      height: document.body.scrollHeight,
      services: [
        ...document.querySelectorAll(
          '.carousel-half-full-width-right,.carousel-half-full-width-right > div:first-child,.carousel-half-full-width-right > div:first-child .thumb-info,.carousel-half-full-width-right > div:first-child .thumb-info-wrapper,.carousel-half-full-width-right > div:first-child .thumb-info-content-inner,.wr-owl-controls',
        ),
      ].map((e) => ({ cls: e.className, rect: e.getBoundingClientRect().toJSON() })),
      width: document.documentElement.scrollWidth,
      headings: [...document.querySelectorAll('h1,h2')]
        .slice(0, 60)
        .map((e) => ({ text: e.innerText, rect: e.getBoundingClientRect().toJSON() })),
      broken: [...document.images]
        .filter((i) => !i.naturalWidth && i.getBoundingClientRect().width > 0)
        .map((i) => i.src),
    }));
    await p
      .goto(`http://127.0.0.1:4182/${id}?products`, { waitUntil: 'load', timeout: 25000 })
      .catch(() => {});
    await p.screenshot({ path: resolve(out, id + '-products.png') });
    await p.screenshot({
      path: resolve(root, 'public/templates/previews', id + '.jpg'),
      type: 'jpeg',
      quality: 88,
    });
    assert.equal(await p.locator('.wr-product-card').count(), 8, id + ' binds every product');
    await p.setViewportSize({ width: 390, height: 844 });
    await p.screenshot({ path: resolve(out, id + '-mobile-first.png') });
    await p.screenshot({ path: resolve(out, id + '-mobile.png'), fullPage: true });
    const mobile = await p.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      overflow: [...document.querySelectorAll('body *')]
        .filter(
          (e) =>
            e.getBoundingClientRect().right > innerWidth + 2 &&
            getComputedStyle(e).position !== 'absolute',
        )
        .slice(0, 12)
        .map((e) => ({
          tag: e.tagName,
          cls: typeof e.className === 'string' ? e.className : 'svg',
          width: e.getBoundingClientRect().width,
          right: e.getBoundingClientRect().right,
        })),
    }));
    if (process.argv.includes('--all-pages'))
      for (const page of ['catalog', 'about', 'detail', 'contact']) {
        await p.goto(`http://127.0.0.1:4182/${id}?products&page=${page}`, {
          waitUntil: 'domcontentloaded',
        });
        assert.equal(await p.locator('h1').count(), 1, `${id} ${page} heading`);
        assert.ok(await p.locator('a[data-wr-page="catalog"]').count());
        if (['detail', 'contact'].includes(page))
          await p.screenshot({ path: resolve(out, id + '-' + page + '-mobile.png') });
        if (page === 'contact')
          assert.equal(await p.locator('#inquiry button[type="submit"]').isDisabled(), true);
      }
    assert.ok(mobile.width <= 390, id + ' mobile must not overflow');
    assert.ok(geometry.width <= 1440, id + ' desktop must not overflow');
    assert.deepEqual(geometry.broken, [], id + ' visible images must load');
    if (process.argv.includes('--sandbox')) {
      await p.setViewportSize({ width: 1440, height: 1000 });
      await p.goto(`http://127.0.0.1:4182/${id}?products&sandbox`, {
        waitUntil: 'load',
        timeout: 30000,
      });
      const f = p.frames().find((f) => f.parentFrame());
      await f.evaluate(() => document.fonts.ready);
      assert.deepEqual(await f.evaluate(() => window.violations), [], id + ' preview CSP');
      const slider = f.locator('[data-wr-slider]').first();
      if (await slider.count()) {
        await slider.locator('[data-wr-next]').click();
        assert.equal(await slider.locator('[data-wr-slide]:not([hidden])').count(), 1);
        assert.equal(await slider.locator('[data-wr-slide]').nth(1).isVisible(), true);
      }
      const accordion = f.locator('.accordion-action,.accordion-button').last();
      if (await accordion.count()) {
        const state = await accordion.getAttribute('aria-expanded');
        await accordion.click();
        assert.equal(
          await accordion.getAttribute('aria-expanded'),
          state === 'true' ? 'false' : 'true',
        );
      }
      if (id === 'porto-accounting') {
        const carousel = f.locator('.owl-carousel.carousel-half-full-width-right');
        assert.equal(await carousel.locator(':scope > div').count(), 6);
        assert.ok(await carousel.locator('.thumb-info-content-inner').first().isVisible());
        await f.locator('.wr-owl-controls button').last().click();
        await f.waitForFunction(
          () =>
            document.querySelector('.owl-carousel.carousel-half-full-width-right').scrollLeft > 0,
        );
      }
      if (id === 'corpox-consulting') {
        await f.waitForFunction(() => document.querySelector('video').readyState >= 2);
        assert.ok(
          (await f.locator('video').getAttribute('src')) ||
            (await f.locator('video source').getAttribute('src')),
        );
        assert.ok(
          (await f.locator('video').evaluate((v) => v.currentSrc)).includes(
            '/templates/references/',
          ),
        );
      }
      if (id === 'saas-automation') {
        await f.waitForFunction(() => document.querySelector('video').readyState >= 2);
        await f.locator('#video-toggle').click();
        assert.equal(await f.locator('video').evaluate((v) => v.paused), true);
        await p.setViewportSize({ width: 3440, height: 1440 });
        const g = await f.locator('video').evaluate((v) => ({
          left: v.getBoundingClientRect().left,
          right: v.getBoundingClientRect().right,
          fit: getComputedStyle(v).objectFit,
        }));
        assert.ok(g.left <= 0 && g.right >= 3440);
        assert.equal(g.fit, 'cover');
      }
    }
    assert.deepEqual(errors, [], id + ' JavaScript errors');
    assert.deepEqual(failed, [], id + ' failed network responses');
    results.push({ id, geometry, mobile, errors, failed: [...new Set(failed)] });
    console.log(
      id,
      JSON.stringify({
        height: geometry.height,
        desktop: geometry.width,
        mobile: mobile.width,
        errors: errors.length,
        failed: failed.length,
        sandbox: process.argv.includes('--sandbox'),
      }),
    );
    await p.close();
  }
  await writeFile(resolve(out, 'verification.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
