import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = resolve('artifacts/reference-motion-browser');
await mkdir(out, { recursive: true });
await build({
  stdin: {
    contents: `export {renderSite} from './src/templates';export {getMaterialsTemplate} from './src/templates/materials';export {materialsDemoDraft} from './src/worker/template-guides/materials-demo';export {projectPreviewHtml,projectPreviewRuntime} from './src/worker/project-preview';export {referenceTemplatePreviewRuntime} from './src/client/reference-template-preview';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  keepNames: true,
  format: 'esm',
  platform: 'node',
  outfile: resolve(out, 'render.mjs'),
});
const r = await import(pathToFileURL(resolve(out, 'render.mjs')).href);
// Exercise production minification before serialising trusted scripts into the iframe.
await build({entryPoints:['src/client/reference-template-preview.ts'], bundle:true, minify:true, format:'esm', platform:'browser', outfile:resolve(out,'client-runtime.mjs')});
const client = await import(pathToFileURL(resolve(out,'client-runtime.mjs')).href);
const html = new Map(),
  publicDir = resolve('public');
let origin;
const server = createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://local.test');
    if (u.pathname === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }
    if (u.pathname.startsWith('/templates/')) {
      const file = resolve(publicDir, '.' + decodeURIComponent(u.pathname));
      if (!file.startsWith(publicDir + sep)) throw Error('path');
      const b = await readFile(file);
      res.writeHead(200, {
        'Content-Type':
          {
            '.css': 'text/css',
            '.mp4': 'video/mp4',
            '.webp': 'image/webp',
            '.avif': 'image/avif',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.woff2': 'font/woff2',
            '.woff': 'font/woff',
            '.ttf': 'font/ttf',
            '.otf': 'font/otf',
          }[extname(file)] || 'application/octet-stream',
      });
      return res.end(b);
    }
    const [, template, page = 'home'] = u.pathname.split('/');
    if (!['auravell', 'careflow-healthcare'].includes(template)) throw Error('route');
    const key = u.pathname + u.search;
    if (!html.has(key)) {
      const draft = r.materialsDemoDraft(r.getMaterialsTemplate(template), 'en');
      let value = r.renderSite(draft, {
        projectId: 'materials-demo',
        lang: 'en',
        page: page === 'plans' ? 'extra-plans' : page,
        preview: u.searchParams.has('private'),
        assetUrl: (id) => id,
        inquiryUrl: '/inquiry',
      });
      if (u.searchParams.has('private')) {
        const previewRuntime = await client.referenceTemplatePreviewRuntime(draft);
        value = r
          .projectPreviewHtml(value, '/api/projects/fixture', origin, {
            page,
            lang: 'en',
            expectedVersion: 1,
          })
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(
            '<head>',
            `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${origin} data: blob:; media-src ${origin} blob:; style-src 'unsafe-inline' ${origin}; script-src 'nonce-reference-test'; font-src ${origin} data:; frame-src https://www.youtube-nocookie.com; form-action 'none'; base-uri 'none'">`,
          )
          .replace(
            '</body>',
            // Keep minified code literal: replacement strings interpret tokens such as $&.
            () => `<script nonce="reference-test">${r.projectPreviewRuntime}${previewRuntime}</script></body>`,
          );
      }
      html.set(key, value);
    }
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    res.end(html.get(key));
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {}),
  results = [];
try {
  for (const privatePreview of process.env.MOTION_PRIVATE_ONLY ? [true] : [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'no-preference',
    });
    const external = [];
    await context.route('**/*', (route) => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      external.push(route.request().url());
      if (route.request().url().startsWith('https://www.youtube-nocookie.com/embed/'))
        return route.fulfill({ contentType: 'text/html', body: 'Video test double' });
      return route.abort();
    });
    const page = await context.newPage(),
      errors = [];
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(20000);
    page.on('pageerror', (e) => errors.push(e.message));
    const url = (template, p = 'home') =>
      `${origin}/${template}/${p}${privatePreview ? '?private' : ''}`;
    await page.goto(url('auravell'), { waitUntil: 'domcontentloaded' });
    assert.ok(
      await page
        .locator('[data-banner-blur]')
        .first()
        .evaluate((el) => el.getAnimations().length > 0),
      'Auravell hero animates on entry',
    );
    await page.waitForTimeout(1700);
    await page.screenshot({
      path: resolve(out, `auravell-${privatePreview ? 'private' : 'public'}-hero.png`),
    });
    const hero = page.locator('.rt-hero-image'),
      before = await hero.evaluate((el) => getComputedStyle(el).translate);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(250);
    assert.notEqual(
      await hero.evaluate((el) => getComputedStyle(el).translate),
      before,
      'hero parallax follows scroll',
    );
    const offerings = page.locator('.rt-offerings-card-v1');
    await offerings.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await offerings.first().hover();
    await page.waitForTimeout(180);
    assert.equal(
      await offerings.first().evaluate((el) => el.classList.contains('av-active')),
      true,
    );
    assert.ok(
      await offerings
        .first()
        .locator('.rt-offerings-card-content')
        .evaluate((el) => el.getAnimations().some((a) => a.playState === 'running')),
      'offering panel actually transitions',
    );
    await page.waitForTimeout(650);
    await page.screenshot({
      path: resolve(out, `auravell-${privatePreview ? 'private' : 'public'}-offerings.png`),
    });
    console.log('PASS offering hover', privatePreview);
    const rows = page.locator('.rt-practice-top-part > div');
    await rows.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await rows.first().focus();
    await page.keyboard.press('Enter');
    assert.equal(await rows.first().getAttribute('aria-pressed'), 'true');
    assert.equal(
      await page
        .locator('.rt-practice-photocol-v1 img')
        .first()
        .evaluate((el) => getComputedStyle(el).visibility),
      'visible',
    );
    console.log('PASS practice image', privatePreview);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    const video = page.locator('video').first();
    await page.waitForTimeout(1400);
    // The private preview sanitizer must keep local video controls as well as the source file.
    const control = page.locator('[data-w-bg-video-control]').first();
    await control.click();
    await page.waitForTimeout(150);
    const paused = await video.evaluate((v) => v.paused);
    await control.click();
    await page.waitForTimeout(250);
    assert.notEqual(await video.evaluate((v) => v.paused), paused, 'video pause/play toggles');
    console.log('PASS video', privatePreview);
    await page.goto(url('auravell', 'plans'));
    const tabs = page.locator('.w-tabs').first().locator('.w-tab-link');
    await tabs.nth(1).click();
    assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await tabs.nth(2).getAttribute('aria-selected'), 'true');
    console.log('PASS plans', privatePreview);
    await page.goto(url('auravell', 'contact'));
    const faq = page.locator('.rt-faq-top-content').first();
    await faq.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await faq.click();
    assert.equal(await faq.getAttribute('aria-expanded'), 'true');
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.rt-faq-answer').first().isVisible(), true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url('auravell'));
    await page.waitForTimeout(1700);
    await page.locator('[data-auravell-menu]').click();
    assert.equal(await page.locator('[data-auravell-nav]').isVisible(), true);
    await page.keyboard.press('Escape');
    await page.screenshot({
      path: resolve(out, `auravell-${privatePreview ? 'private' : 'public'}-mobile.png`),
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url('careflow-healthcare'), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1400);
    await page.screenshot({
      path: resolve(out, `careflow-${privatePreview ? 'private' : 'public'}-hero.png`),
    });
    const btn = page.locator('.header .primary-button').first();
    await btn.hover();
    await page.waitForTimeout(150);
    assert.ok(
      await btn.evaluate((el) =>
        el.getAnimations({ subtree: true }).some((a) => a.playState === 'running'),
      ),
      'Careflow button characters animate',
    );
    await page.mouse.move(5, 5);
    await page.locator('.cf-pages-toggle').click();
    assert.equal(await page.locator('.cf-pages-panel').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.cf-pages-panel').isVisible(), false);
    const accordion = page.locator('.accordion-heading').nth(1);
    await accordion.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await accordion.click();
    await page.waitForTimeout(100);
    assert.ok(
      await page
        .locator('.accordion-body')
        .nth(1)
        .evaluate((el) => el.getAnimations().length > 0),
      'accordion has height transition',
    );
    await page.waitForTimeout(350);
    const carousel = page.locator('.w-slider-mask').first();
    await carousel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const carouselBefore = await carousel.evaluate((el) => el.scrollLeft);
    await page.locator('.w-slider-arrow-right').first().click();
    await page.waitForTimeout(700);
    assert.ok(
      (await carousel.evaluate((el) => el.scrollLeft)) > carouselBefore,
      'team carousel advances',
    );
    await page.screenshot({
      path: resolve(out, `careflow-${privatePreview ? 'private' : 'public'}-team.png`),
    });
    await page.locator('[data-careflow-video]').click();
    assert.equal(await page.locator('.cf-video-dialog').isVisible(), true);
    await page.keyboard.press('Escape');
    await expect(page.locator('.cf-video-dialog')).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url('careflow-healthcare'));
    await page.waitForTimeout(1200);
    await page.locator('[data-careflow-menu]').click();
    assert.equal(await page.locator('.cf-menu-open').isVisible(), true);
    await page.keyboard.press('Escape');
    await page.screenshot({
      path: resolve(out, `careflow-${privatePreview ? 'private' : 'public'}-mobile.png`),
    });
    assert.deepEqual(errors, [], 'no native/private script errors');
    assert.ok(
      external.every((u) => u.startsWith('https://www.youtube-nocookie.com/embed/')),
      'all template media is local; video embed is click-only',
    );
    results.push({ privatePreview, animationAndInteractionChecks: 'passed' });
    await context.close();
  }
  for (const template of ['auravell','careflow-healthcare']) {
    const context = await browser.newContext();const page = await context.newPage();const errors = [];
    page.on('pageerror',error=>errors.push(error.message));
    const script = await client.referenceTemplatePreviewRuntime({template,materials:{contractRevision:`2026-10-01.${template}-materials.1`}});
    const controls = template==='auravell' ? '<button data-auravell-menu aria-expanded="false">Menu</button><nav data-auravell-nav></nav>' : '<button data-careflow-menu aria-expanded="false">Menu</button><nav id="careflow-navigation"></nav>';
    await page.setContent(`<body data-template="${template}">${controls}<script>${script}</script></body>`);
    await page.getByRole('button',{name:'Menu',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded'),'true');
    assert.deepEqual(errors,[],`${template}: minified legacy preview must not depend on renamed module helpers`);await context.close();
  }
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const p = await reduced.newPage();
  await p.goto(`${origin}/auravell/home`);
  await p.waitForTimeout(300);
  assert.equal(
    await p
      .locator('video')
      .first()
      .evaluate((v) => v.paused),
    true,
  );
  assert.equal(
    await p
      .locator('[data-banner-blur]')
      .first()
      .evaluate((el) => el.getAnimations().length),
    0,
  );
  await reduced.close();
  await writeFile(
    resolve(out, 'results.json'),
    JSON.stringify({ results, reducedMotion: 'passed' }, null, 2),
  );
  console.log(
    'PASS reference motion: both templates, public and private previews, desktop/mobile, video, hover, tabs, accordion, carousel, keyboard and reduced motion.',
  );
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise((done) => server.close(done));
}
