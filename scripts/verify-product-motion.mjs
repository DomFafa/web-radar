// Offline browser acceptance for the five revised product templates.
// Filters reproduce one failure; the default matrix covers real pages at desktop/mobile widths.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = resolve('artifacts/product-motion');
await mkdir(out, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates';
export {getMaterialsTemplate} from './src/templates/materials';
export {materialsDemoDraft} from './src/worker/template-guides/materials-demo';
export {projectPreviewHtml} from './src/worker/project-preview';
export {productMotionSource} from './src/templates/themes/product-motion-source';`, resolveDir: process.cwd() }, bundle: true, keepNames: true, platform: 'node', format: 'esm', outfile: resolve(out, 'render.mjs') });
// Test the same minified client source used in production, rather than Function.toString in Node.
const client = await build({ stdin: { contents: `export {referenceTemplatePreviewRuntime,referenceTemplatePreviewPrepare} from './src/client/reference-template-preview';`, resolveDir: process.cwd() }, bundle: true, minify: true, platform: 'node', format: 'esm', write: false });
const runtime = await import('data:text/javascript;base64,' + Buffer.from(client.outputFiles[0].text).toString('base64'));
const render = await import(pathToFileURL(resolve(out, 'render.mjs')).href);
const templates = process.env.MOTION_TEMPLATES?.split(',') || ['auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee'];
const pages = process.env.MOTION_PAGES?.split(',') || ['home', 'catalog', 'about', 'contact', 'detail'];
const widths = process.env.MOTION_WIDTHS?.split(',').map(Number) || [1440, 390];
const presentations = process.env.MOTION_PRESENTATIONS?.split(',') || ['public', 'private'];
const responses = new Map();
const publicDir = resolve('public');
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (responses.has(url.pathname)) { response.setHeader('Content-Type', 'text/html'); return response.end(responses.get(url.pathname)); }
  if (url.pathname === '/favicon.ico') { response.writeHead(204); return response.end(); }
  const file = resolve(publicDir, '.' + decodeURIComponent(url.pathname));
  if (file.startsWith(publicDir + sep)) {
    try { const bytes = await readFile(file); response.setHeader('Content-Type', { '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.avif':'image/avif', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.otf':'font/otf' }[extname(file)] || 'application/octet-stream'); return response.end(bytes); } catch { /* Missing assets remain observable. */ }
  }
  response.writeHead(404); response.end('Missing');
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
// Isolated automation browser. Never attach to the user's Chrome profile or CDP session.
const browser = await chromium.launch({ headless: true, ...(process.env.MOTION_CHROMIUM_EXECUTABLE ? { executablePath: process.env.MOTION_CHROMIUM_EXECUTABLE } : {}) });
const results = [], failures = [], fallbackResults = [];
const frames = page => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
const finish = page => page.evaluate(() => document.getAnimations().filter(animation => animation.id.startsWith('product-scroll-enter:')).forEach(animation => animation.finish()));
const scroll = async (page, top) => { await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), top); await frames(page); };
const stats = page => page.evaluate(() => {
  const counts = new Map();
  for (const { target, animation } of window.productMotionHistory) if (animation.id.startsWith('product-scroll-enter:')) counts.set(target, (counts.get(target) || 0) + 1);
  return { count: [...counts.values()].reduce((total, count) => total + count, 0), repeated: [...counts.values()].some(count => count > 1) };
});
const scan = async (page, reverse = false) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const stops = Array.from({ length: Math.ceil(height / 650) + 1 }, (_, i) => Math.min(i * 650, height));
  if (reverse) stops.reverse();
  for (const top of stops) { await scroll(page, top); await finish(page); }
};
const prepareCase = async (template, pageName, presentation) => {
  const revision = `2026-10-03.${template}-materials.3`;
  const profile = render.getMaterialsTemplate(template, revision);
  assert.equal(profile.contractRevision, revision, `Candidate ${revision} must exist`);
  const draft = render.materialsDemoDraft(profile, 'en');
  let html = render.renderSite(draft, { projectId: 'motion-browser', lang: 'en', page: pageName, productId: draft.products[0]?.id, assetUrl: id => id.startsWith('/') ? origin + id : id, inquiryUrl: origin + '/inquiry', preview: presentation === 'private' });
  if (presentation === 'private') {
    html = render.projectPreviewHtml(html, '/preview-api', origin, { page: pageName, lang: 'en', productId: draft.products[0]?.id, expectedVersion: 1 });
    // Simulate the worker's strict script policy while preserving its transformed DOM/head prepare.
    const nonce = 'motion-browser-nonce';
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
    html = html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="default-src 'self' data:; script-src 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'">`);
    // projectPreviewHtml can include a prepare script, which strict stripping above removes.
    const prepareSource = runtime.referenceTemplatePreviewPrepare(draft);
    html = html.replace('</head>', `<script nonce="${nonce}">${prepareSource || ''}</script></head>`);
    const clientRuntime = await runtime.referenceTemplatePreviewRuntime(draft);
    html = html.replace('</body>', `<script nonce="${nonce}">${clientRuntime}</script></body>`);
  }
  return html;
};
try {
  for (const template of templates) for (const pageName of pages) for (const width of widths) for (const presentation of presentations) {
    const label = `${template}/${pageName}/${width}/${presentation}`;
    console.log(`Checking ${label}`);
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await context.addInitScript(() => {
      window.productMotionHistory = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (...args) { const transform = getComputedStyle(this).transform; const animation = animate.apply(this, args); window.productMotionHistory.push({ target: this, animation, transform }); return animation; };
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      responses.set('/case', await prepareCase(template, pageName, presentation));
      await page.goto(origin + '/case', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => Boolean(document.body.dataset.productMotion));
      await page.evaluate(() => document.fonts.ready);
      await frames(page);
      const initial = await stats(page);
      assert(initial.count > 0, `${label}: initial entrance must run`);
      const maskInterpolation = await page.evaluate(() => {
        const item = window.productMotionHistory.find(({ animation }) => animation.id.startsWith('product-scroll-enter:') && animation.effect.getKeyframes()[0].clipPath?.startsWith('inset('));
        if (!item) return { exercised: false };
        const keyframes = item.animation.effect.getKeyframes();
        const probe = item.target.animate(keyframes, { duration: 1000, fill: 'both' });
        probe.pause(); probe.currentTime = 250;
        const first = getComputedStyle(item.target).clipPath;
        probe.currentTime = 750;
        const second = getComputedStyle(item.target).clipPath;
        probe.cancel();
        return { exercised: true, first, second };
      });
      if (maskInterpolation.exercised) assert(maskInterpolation.first !== 'none' && maskInterpolation.second !== 'none' && maskInterpolation.first !== maskInterpolation.second, `${label}: masks must open continuously, without a discrete jump: ${JSON.stringify(maskInterpolation)}`);
      assert.equal(await page.evaluate(() => document.getElementById('product-motion-prepaint') !== null), false, `${label}: global prepaint mask must be removed`);
      const navAnimations = await page.evaluate(() => window.productMotionHistory.filter(({ target, animation }) => animation.id.startsWith('product-scroll-enter:') && target.closest('header')).length);
      assert.equal(navAnimations, 0, `${label}: navigation must retain its stable pose`);
      const checkFocus = () => page.evaluate(() => {
        const controls = [...document.querySelectorAll('main a[href],main button:not([disabled]),main input:not([type="hidden"]):not([disabled]),main select,main textarea')];
        const control = controls.find(control => {
          if (!control.getBoundingClientRect().width || !control.getBoundingClientRect().height) return false;
          for (let el = control; el && el !== document.body; el = el.parentElement) {
            if (el.style.opacity === '0' || el.getAnimations().some(animation => animation.id.startsWith('product-scroll-enter:') && animation.playState === 'running')) return true;
          }
          return false;
        });
        if (!control) return { exercised: false };
        control.focus();
        let hidden = false, entering = false;
        for (let el = control; el && el !== document.body; el = el.parentElement) {
          hidden ||= Number(getComputedStyle(el).opacity) < .99;
          entering ||= el.getAnimations().some(animation => animation.id.startsWith('product-scroll-enter:') && animation.playState === 'running');
        }
        return { exercised: true, hidden, entering, focused: document.activeElement === control };
      });
      // Off-screen content has its initial hidden state before scrolling, avoiding final-pose flashes.
      const pending = await page.evaluate(() => [...document.querySelectorAll('body [style*="opacity"]')].filter(el => el.style.opacity === '0' && el.offsetHeight > 0 && !el.closest('[hidden]') && el.getBoundingClientRect().top > innerHeight).length);
      const pendingTop = await page.evaluate(() => {
        window.productMotionPendingTarget = [...document.querySelectorAll('body [style*="opacity"]')].find(el => el.style.opacity === '0' && el.offsetHeight > 0 && !el.closest('[hidden]') && el.getBoundingClientRect().top > innerHeight);
        let top = 0; for (let node = window.productMotionPendingTarget; node; node = node.offsetParent) top += node.offsetTop;
        return top;
      });
      await finish(page);
      if (pending) {
        await scroll(page, pendingTop - 900 * .95);
        assert.equal(await page.evaluate(() => getComputedStyle(window.productMotionPendingTarget).opacity), '0', `${label}: partially visible content must retain the entrance start pose before threshold`);
        await scroll(page, pendingTop - 900 * .88);
        const crossing = await page.evaluate(() => ({ started: window.productMotionHistory.some(({ target, animation }) => target === window.productMotionPendingTarget && animation.id.startsWith('product-scroll-enter:')), top: window.productMotionPendingTarget.getBoundingClientRect().top, height: window.productMotionPendingTarget.offsetHeight, className: window.productMotionPendingTarget.className, scrollY, totalHeight: document.documentElement.scrollHeight }));
        assert(crossing.started, `${label}: crossing the threshold must start its entrance: ${JSON.stringify(crossing)}`);
      }
      const focusResult = await checkFocus();
      if (focusResult.exercised) assert(focusResult.focused && !focusResult.hidden && !focusResult.entering, `${label}: keyboard focus must immediately settle its entrance: ${JSON.stringify(focusResult)}`);
      await scan(page);
      const first = await stats(page);
      if (pending) assert(first.count > initial.count, `${label}: later sections must enter on scrolling`);
      await scan(page, true);
      await scan(page);
      assert.deepEqual(await stats(page), first, `${label}: scrolling back and forth must not replay entrances`);
      await page.setViewportSize({ width: width === 390 ? 420 : 1360, height: 900 });
      await frames(page);
      assert.equal((await stats(page)).repeated, false, `${label}: resizing must not rearm entrances`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await frames(page);
      assert.equal(await page.evaluate(() => [...document.querySelectorAll('main [style*="opacity"]')].filter(el => el.style.opacity === '0').length), 0, `${label}: reduced motion must expose all prepared content`);
      const alteredTransforms = await page.evaluate(() => window.productMotionHistory.filter(({ target, animation, transform }) => animation.id.startsWith('product-scroll-enter:') && getComputedStyle(target).transform !== transform).map(({ target }) => target.className));
      assert.deepEqual(alteredTransforms, [], `${label}: settled entrances must preserve the renderer's CSS transforms`);
      assert.equal(errors.length, 0, `${label}: ${errors.join('; ')}`);
      results.push({ label, initialEntrances: initial.count, totalEntrances: first.count, thresholdExercised: pending > 0, focusExercised: focusResult.exercised, repeated: false, errors });
    } catch (error) {
      failures.push({ label, error: String(error), errors });
      await page.screenshot({ path: resolve(out, label.replaceAll('/', '-') + '-failed.png'), fullPage: true }).catch(() => {});
    } finally { await context.close(); }
  }
  if (process.env.MOTION_CHECK_FALLBACK !== '0') for (const template of templates) {
    const label = `${template}/fallback`;
    const raw = await prepareCase(template, 'home', 'public');
    const noJsContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    await noJsContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const noJsPage = await noJsContext.newPage();
    const slowContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    await slowContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const slowPage = await slowContext.newPage();
    slowPage.setDefaultTimeout(5000);
    try {
      responses.set('/no-js', raw);
      await noJsPage.goto(origin + '/no-js', { waitUntil: 'domcontentloaded' });
      assert.equal(await noJsPage.locator('main').evaluate(el => getComputedStyle(el).opacity), '1', `${label}: JavaScript-disabled content must remain visible`);
      const bodyIndex = raw.indexOf('<body');
      const withoutRuntime = raw.slice(0, bodyIndex) + raw.slice(bodyIndex).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
      responses.set('/slow', withoutRuntime);
      await slowPage.goto(origin + '/slow', { waitUntil: 'domcontentloaded' });
      assert.equal(await slowPage.locator('main').evaluate(el => getComputedStyle(el).opacity), '0', `${label}: cold page must be masked before a late motion bundle`);
      assert.equal(await slowPage.locator('body > header').evaluate(el => getComputedStyle(el).opacity), '1', `${label}: cold mask must leave the navigation visible`);
      await slowPage.waitForFunction(() => Boolean(document.documentElement.dataset.productMotionUnavailable));
      assert.equal(await slowPage.locator('main').evaluate(el => getComputedStyle(el).opacity), '1', `${label}: missing runtime must fail open`);
      await slowPage.addScriptTag({ content: render.productMotionSource });
      await frames(slowPage);
      assert.equal(await slowPage.evaluate(() => Boolean(document.body.dataset.productMotion)), false, `${label}: a late bundle must not re-hide already displayed content`);
      fallbackResults.push({ template, noJsVisible: true, prepaintHidden: true, stableNavigation: true, timeoutVisible: true, lateRuntimeSkipped: true });
    } catch (error) { failures.push({ label, error: String(error) }); }
    finally { await noJsContext.close(); await slowContext.close(); }
  }
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
  await writeFile(resolve(out, 'results.json'), JSON.stringify({ passed: results.length, failed: failures.length, results, fallbackResults, failures }, null, 2));
}
console.log(JSON.stringify({ passed: results.length, fallbackPassed: fallbackResults.length, failed: failures.length, thresholdCases: results.filter(result => result.thresholdExercised).length, keyboardCases: results.filter(result => result.focusExercised).length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
