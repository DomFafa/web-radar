// Real renderer + both preview boundaries. No customer data, writes or external requests.
// node scripts/verify-pawfect-production-motion.mjs --product-radar-root /path/to/product-radar
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2), prPath = args.includes('--product-radar-root') ? args[args.indexOf('--product-radar-root') + 1] : process.env.PRODUCT_RADAR_ROOT;
const prRoot = prPath && resolve(prPath);
assert.ok(prRoot, 'Supply --product-radar-root for the actual Product Radar preview consumer.');
const started = Date.now(), out = resolve('artifacts/pawfect-production-motion');
await mkdir(out, { recursive: true });
const sources = ['src/templates/index.ts', 'src/templates/themes/pawfect/renderer.ts', 'src/templates/themes/pawfect/materials.ts', 'src/templates/themes/pawfect/motion.ts', 'src/templates/themes/pawfect/motion-source.ts', 'src/client/Preview.tsx', 'src/client/reference-template-preview.ts', 'src/worker/project-preview.ts'];
const sha = value => createHash('sha256').update(value).digest('hex');
const hashes = async () => Object.fromEntries(await Promise.all(sources.map(async file => [file, sha(await readFile(file))])));
const sourceFiles = await hashes();
await build({ stdin: { contents: `export {renderSite} from './src/templates';export {typedMaterialsFixture} from './tests/fixtures/materials-typed';export {draftFromMaterials} from './src/worker/materials-service';export {projectPreviewHtml,projectPreviewRuntime,projectPreviewRuntimeForDraft} from './src/worker/project-preview';`, resolveDir: process.cwd() }, bundle: true, keepNames: true, platform: 'node', format: 'esm', outfile: resolve(out, 'renderer.mjs') });
await build({ entryPoints: ['src/client/reference-template-preview.ts'], bundle: true, minify: true, platform: 'browser', format: 'esm', outfile: resolve(out, 'client.mjs') });
// Product Radar's Vite frontend uses default name minification, without keepNames.
await build({ entryPoints: [resolve(prRoot, 'src/client/website-preview.ts')], bundle: true, minify: true, platform: 'browser', format: 'iife', globalName: 'prConsumer', outfile: resolve(out, 'pr-consumer.js') });
await build({ entryPoints: [resolve(prRoot, 'src/worker/website-preview-frame.ts')], bundle: true, platform: 'node', format: 'esm', outfile: resolve(out, 'pr-frame.mjs') });
const api = await import(pathToFileURL(resolve(out, 'renderer.mjs')).href);
const client = await import(pathToFileURL(resolve(out, 'client.mjs')).href);
const { websitePreviewFrame } = await import(pathToFileURL(resolve(out, 'pr-frame.mjs')).href);
const input = await api.typedMaterialsFixture('pawfect-groom', 3);
assert.equal(input.materials.template.contractRevision, '2026-10-02.pawfect-groom-materials.3');
const draft = api.draftFromMaterials(input, Object.fromEntries(input.materials.media.map(asset => [asset.id, { id: asset.id }])));
const clientPrepare = client.referenceTemplatePreviewPrepare(draft), clientRuntime = await client.referenceTemplatePreviewRuntime(draft);
const publicDir = resolve('public'), image = await readFile(resolve(publicDir, 'templates/senseng/products-1.jpg'));
const prConsumer = await readFile(resolve(out, 'pr-consumer.js'), 'utf8');
const routes = ['home', 'catalog', 'about', 'contact', 'detail:p0', 'detail:p1', 'detail:p2'];
const scriptText = text => text.replace(/<\/script/gi, '<\\/script');
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
let origin;
const render = (route, preview = false) => {
  const [page, productId] = route.split(':');
  return api.renderSite(draft, { projectId: 'motion-fixture', lang: 'en', page, productId, preview, assetUrl: id => `/api/web-radar/projects/motion-fixture/assets/${id}`, inquiryUrl: '/inquiry' });
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, origin);
    const send = (type, body) => { response.setHeader('Content-Type', type.startsWith('text/') ? `${type};charset=utf-8` : type); response.end(body); };
    if (url.pathname.startsWith('/api/web-radar/projects/')) return send('image/jpeg', image);
    if (url.pathname === '/pr-consumer.js') return send('text/javascript', prConsumer);
    if (url.pathname === '/frame') return send('text/html', websitePreviewFrame(origin));
    if (url.pathname.startsWith('/templates/')) {
      const path = resolve(publicDir, '.' + decodeURIComponent(url.pathname));
      assert.ok(path.startsWith(publicDir + sep));
      response.setHeader('Access-Control-Allow-Origin', '*');
      return send({ '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' }[extname(path)] || 'application/octet-stream', await readFile(path));
    }
    if (url.pathname === '/favicon.ico') { response.writeHead(204); return response.end(); }
    const route = url.searchParams.get('route') || 'home';
    assert.ok(routes.includes(route));
    const mode = url.pathname.slice(1), html = render(route, mode !== 'public');
    if (mode === 'public') return send('text/html', html);
    if (mode === 'failopen') {
      // A stalled runtime after body parsing reproduces the production fail-open boundary.
      return send('text/html', html.replace(/<script>[^]*?<\/script>/g, script => script.includes('expressive-v3') ? '<script src="/late-motion.js"></script>' : script));
    }
    if (mode === 'late-motion.js') return setTimeout(() => send('text/javascript', clientRuntime), 1900);
    assert.ok(['wr', 'pr'].includes(mode));
    const [page, productId] = route.split(':'), base = '/api/web-radar/projects/motion-fixture';
    const preview = { schemaVersion: 'wr-project-service-v1', projectId: 'motion-fixture', projectVersion: 1, page, lang: 'en', productId, assetBaseUrl: origin, proxyBasePath: base, runtime: api.projectPreviewRuntimeForDraft(draft), html: api.projectPreviewHtml(html, base, origin, { page, lang: 'en', productId, expectedVersion: 1 }) };
    const bootstrap = mode === 'pr' ? `
      const prepared=prConsumer.prepareWebsitePreview(${json(preview)},'motion-test',location.origin);
      const blobs=await Promise.all(prepared.assetIds.map(async id=>({id,blob:await (await fetch(${json(base)}+'/assets/'+id)).blob()})));
      addEventListener('message',event=>{
        if(event.source!==frame.contentWindow||event.data?.channel!=='motion-test')return;
        if(event.data.type==='pr:preview-shell-ready')frame.contentWindow.postMessage({type:'pr:preview-document',channel:'motion-test',html:prepared.html},'*');
        if(event.data.type==='pr:preview-ready')frame.contentWindow.postMessage({type:'pr:preview-media',channel:'motion-test',media:blobs,complete:true},'*');
        if(event.data.type==='pr:preview-rendered')document.body.dataset.previewReady='true';
        if(event.data.type==='pr:preview-error')document.body.dataset.previewError='true';
      });
      frame.src='/frame?bridge=2&frame=motion-test';
    ` : `
      const doc=new DOMParser().parseFromString(${json(html)},'text/html');
      doc.querySelectorAll('script,base,meta[http-equiv="refresh"],meta[http-equiv="Content-Security-Policy"]').forEach(node=>node.remove());
      const csp=doc.createElement('meta');csp.httpEquiv='Content-Security-Policy';
      csp.content="default-src 'none'; img-src ${origin} data: blob:; style-src 'unsafe-inline' ${origin}; script-src 'nonce-motion-test'; font-src ${origin} data:; base-uri 'none'; form-action 'none'";doc.head.insertBefore(csp,doc.head.firstChild);
      const prepare=doc.createElement('script');prepare.setAttribute('nonce','motion-test');prepare.textContent=${json(clientPrepare)};doc.head.appendChild(prepare);
      const runtime=doc.createElement('script');runtime.setAttribute('nonce','motion-test');runtime.textContent=${json(api.projectPreviewRuntime + '\n;' + clientRuntime)};doc.body.appendChild(runtime);
      frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;
    `;
    await writeFile(resolve(out, `${mode}-bootstrap.js`), `(async()=>{const frame=document.getElementById('preview');${bootstrap}})();`);
    return send('text/html', `<!doctype html><html><head><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%}</style></head><body><iframe id="preview" sandbox="allow-scripts allow-forms"></iframe><script src="/pr-consumer.js"></script><script>(async()=>{const frame=document.getElementById('preview');${scriptText(bootstrap)}})();</script></body></html>`);
  } catch (error) { response.writeHead(500); response.end(String(error)); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
const results = [], errors = [], external = [];
const frameTick = frame => frame.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const finish = frame => frame.evaluate(() => document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime)).forEach(animation => animation.finish()));
const scroll = async (frame, y) => { await frame.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y); await frameTick(frame); };
const counts = frame => frame.evaluate(() => {
  const map = new Map();
  for (const { target, animation } of window.motionProbe.history) if (animation.id === 'pawfect-scroll-enter') map.set(target, (map.get(target) || 0) + 1);
  return { total: [...map.values()].reduce((sum, count) => sum + count, 0), repeats: [...map.values()].filter(count => count > 1).length };
});
const sweep = async (frame, reverse = false) => {
  const max = await frame.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const points = Array.from({ length: Math.ceil(max / 650) + 1 }, (_, i) => Math.min(i * 650, max));
  if (reverse) points.reverse();
  for (const point of points) { await scroll(frame, point); await finish(frame); }
};
const pose = (frame, selector) => frame.locator(selector).evaluate(el => {
  let opacity = 1;
  for (let node = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
  return { opacity, active: el.getAnimations().filter(animation => animation.id === 'pawfect-scroll-enter').length };
});
const setup = async options => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', ...options });
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    external.push(route.request().url());return route.abort();
  });
  await context.addInitScript(() => {
    window.motionProbe = { history: [], frames: [] };
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) { const animation = animate.apply(this, args); window.motionProbe.history.push({ target: this, animation }); return animation; };
    const sample = () => {
      const h1 = document.querySelector('.wr-pawfect-materials h1');
      if (h1 && window.motionProbe.frames.length < 180) {
        let opacity = 1;
        for (let node = h1; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
        window.motionProbe.frames.push({ opacity, prepared: !!document.body.dataset.pawfectMotion, entrances: window.motionProbe.history.filter(item => item.animation.id === 'pawfect-scroll-enter').length });
      }
      requestAnimationFrame(sample);
    };requestAnimationFrame(sample);
  });
  return context;
};
try {
  for (const width of [1440, 390]) for (const mode of ['public', 'wr', 'pr']) {
    const context = await setup({ viewport: { width, height: 900 } }), page = await context.newPage();
    page.setDefaultTimeout(10000);page.on('pageerror', error => errors.push(`${mode}/${width}: ${error.stack || error.message}`));
    const combinations = [];
    for (const route of routes) {
      await page.goto(`${origin}/${mode}?route=${encodeURIComponent(route)}`, { waitUntil: 'domcontentloaded' });
      const frame = mode === 'public' ? page.mainFrame() : await page.waitForSelector('#preview').then(async () => {
        await page.waitForFunction(() => document.querySelector('#preview')?.getAttribute('srcdoc') || document.querySelector('#preview')?.getAttribute('src'));
        return page.frames().find(frame => frame !== page.mainFrame());
      });
      assert.ok(frame);
      await frame.waitForSelector('body[data-pawfect-motion="expressive-v3"]').catch(async error => {
        const state = await frame.evaluate(() => ({ url: location.href, html: document.documentElement.outerHTML.slice(0, 400), body: document.body?.dataset, scripts: [...document.scripts].map(script => ({ nonce: script.nonce, length: script.textContent.length })), csp: document.querySelector('meta[http-equiv]')?.getAttribute('content') }));
        throw Error(`${error.message}\n${JSON.stringify(state)}`);
      });
      if (mode === 'pr') await page.waitForFunction(() => document.body.dataset.previewReady || document.body.dataset.previewError);
      assert.notEqual(await page.locator('body').getAttribute('data-preview-error'), 'true');
      await frame.evaluate(async () => { document.querySelectorAll('img').forEach(image => image.loading = 'eager'); await Promise.all([...document.querySelectorAll('img[src]')].map(async image => { try { await image.decode(); } catch { throw Error(`Image failed: ${image.outerHTML}`); } })); await document.fonts.ready; });
      await frameTick(frame);
      const frames = await frame.evaluate(() => window.motionProbe.frames);
      assert.ok(frames.length, `${mode}/${route}: first-frame sampler observed the page`);
      assert.ok(frames.every(sample => sample.prepared || sample.opacity < .05), `${mode}/${route}: no visible final headline before preparation`);
      if (route === 'home') {
        const selector = '.pg-gallery-section .pg-section-title h2';
        const top = await frame.locator(selector).evaluate(el => { let top = 0; for (let node = el; node; node = node.offsetParent) top += node.offsetTop; return top; });
        await scroll(frame, top - 900 * .94);
        assert.ok((await pose(frame, selector)).opacity < .05, `${mode}: below-trigger content is already hidden`);
        await scroll(frame, top - 900 * .86);
        assert.ok((await pose(frame, selector)).active > 0, `${mode}: entrance starts at the scroll trigger`);
      }
      await finish(frame);await sweep(frame);
      const first = await counts(frame);assert.ok(first.total > 0);assert.equal(first.repeats, 0);
      const trajectories = await frame.evaluate(() => window.motionProbe.history.filter(item => item.animation.id === 'pawfect-scroll-enter').map(({ target, animation }) => ({ selector: target.matches('.pg-detail>div:first-child img') ? 'detail-image' : target.tagName, frames: animation.effect.getKeyframes(), duration: animation.effect.getTiming().duration })));
      combinations.push(JSON.stringify([...new Set(trajectories.map(item => JSON.stringify(item.frames)))].sort()));
      await sweep(frame, true);await sweep(frame);
      assert.deepEqual(await counts(frame), first, `${mode}/${route}: no replay while scrolling back and forth`);
      assert.ok(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${mode}/${route}: horizontal overflow`);
      assert.equal(await frame.locator('img[src]').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).length), 0);
      assert.equal(await frame.locator('.pg-header nav a').count(), 2);
      assert.equal(await frame.locator('.pg-header nav a').nth(1).textContent(), 'About us');
      assert.equal(await frame.locator('.pg-process .pg-button').count(), 0);
      if (route.startsWith('detail:')) {
        assert.equal(await frame.locator('body').getAttribute('data-pawfect-product-order'), route.at(-1));
        assert.ok(trajectories.some(item => item.selector === 'detail-image'));
      }
      if (route === 'home') {
        await scroll(frame, 0);await page.screenshot({ path: resolve(out, `${mode}-${width}.png`) });
        await page.emulateMedia({ reducedMotion: 'reduce' });await frameTick(frame);
        assert.equal(await frame.evaluate(() => document.getAnimations().filter(animation => animation.id === 'pawfect-scroll-enter').length), 0);
        await page.emulateMedia({ reducedMotion: 'no-preference' });await frameTick(frame);
        assert.deepEqual(await counts(frame), first);
      }
      results.push({ mode, route, width, onceOnly: true, firstPaint: 'prepared-before-visible', entrances: first.total, detailTrajectory: trajectories.find(item => item.selector === 'detail-image')?.frames });
    }
    assert.equal(new Set(combinations).size, 7, `${mode}/${width}: all seven routes have distinct motion combinations`);
    await context.close();
    console.log(`PASS ${mode} ${width}: seven routes, distinct combinations, first paint, once-only`);
  }
  const reducedContext = await setup({ reducedMotion: 'reduce' }), reduced = await reducedContext.newPage();
  await reduced.goto(`${origin}/public`);await frameTick(reduced);
  assert.equal((await counts(reduced)).total, 0);assert.ok((await pose(reduced, 'h1')).opacity > .99);
  await reducedContext.close();
  const noJsContext = await setup({ javaScriptEnabled: false }), noJs = await noJsContext.newPage();
  await noJs.goto(`${origin}/public`);assert.ok((await pose(noJs, 'h1')).opacity > .99);await noJsContext.close();
  const slowContext = await setup(), slow = await slowContext.newPage();
  await slow.goto(`${origin}/failopen`, { waitUntil: 'commit' });
  await slow.waitForSelector('h1', { state: 'attached' });
  await slow.waitForTimeout(300);
  assert.ok((await pose(slow, 'h1')).opacity < .05, 'Cold body is covered while runtime is delayed');
  await slow.waitForFunction(() => document.documentElement.dataset.pawfectMotionUnavailable === 'true');
  assert.ok((await pose(slow, 'h1')).opacity > .99, 'Slow-runtime fallback reveals content');
  await slow.waitForLoadState('load');await frameTick(slow);
  assert.ok((await pose(slow, 'h1')).opacity > .99);assert.equal((await counts(slow)).total, 0, 'Late runtime does not hide content again');
  await slowContext.close();
  assert.deepEqual(errors, []);assert.deepEqual(external, []);assert.deepEqual(await hashes(), sourceFiles, 'Source changed during receipt generation');
  const report = { scope: 'pawfect-browser', passed: true, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceFiles, productRadarConsumer: { root: prRoot, sha256: sha(await readFile(resolve(prRoot, 'src/client/website-preview.ts'))), frameSha256: sha(await readFile(resolve(prRoot, 'src/worker/website-preview-frame.ts'))) }, minifiedClient: true, cases: results.length, results, reducedMotion: true, noJavaScript: true, delayedRuntimeFailOpen: true, errors, externalRequests: external, elapsedMs: Date.now() - started };
  await writeFile(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, scope: report.scope, cases: report.cases, elapsedMs: report.elapsedMs }));
} catch (error) {
  await writeFile(resolve(out, 'failure.json'), JSON.stringify({ error: String(error), errors, external, results }, null, 2) + '\n');
  console.error(JSON.stringify({ errors, external }));
  throw error;
} finally { await browser.close();server.closeAllConnections();await new Promise(done => server.close(done)); }
