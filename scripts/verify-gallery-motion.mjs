// Six gallery contracts, actual published HTML, and both trusted preview consumers.
// Uses isolated Chrome and labelled local images; no customer writes or external requests.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const prRoot = resolve(args[args.indexOf('--product-radar-root') + 1] || process.env.PRODUCT_RADAR_ROOT || '');
assert(prRoot !== process.cwd(), 'Supply --product-radar-root for the actual preview consumer.');
const revision = process.env.GALLERY_REVISION || '4';
assert(['4', '5'].includes(revision), 'Choose a supported gallery release.');
const out = resolve(revision === '5' ? 'artifacts/about-collection-motion' : 'artifacts/gallery-motion');
await mkdir(out, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates';export {typedMaterialsFixture} from './tests/fixtures/materials-typed';export {draftFromMaterials} from './src/worker/materials-service';export {projectPreviewHtml,projectPreviewRuntime,projectPreviewRuntimeForDraft,projectPreviewPrepareForDraft} from './src/worker/project-preview';`, resolveDir: process.cwd() }, bundle: true, keepNames: true, platform: 'node', format: 'esm', outfile: resolve(out, 'renderer.mjs') });
await build({ entryPoints: ['src/client/reference-template-preview.ts'], bundle: true, minify: true, platform: 'browser', format: 'esm', outfile: resolve(out, 'client.mjs') });
await build({ entryPoints: [resolve(prRoot, 'src/client/website-preview.ts')], bundle: true, minify: true, platform: 'browser', format: 'iife', globalName: 'prConsumer', outfile: resolve(out, 'pr-consumer.js') });
await build({ entryPoints: [resolve(prRoot, 'src/worker/website-preview-frame.ts')], bundle: true, platform: 'node', format: 'esm', outfile: resolve(out, 'pr-frame.mjs') });
const api = await import(pathToFileURL(resolve(out, 'renderer.mjs')).href);
const client = await import(pathToFileURL(resolve(out, 'client.mjs')).href);
const { websitePreviewFrame } = await import(pathToFileURL(resolve(out, 'pr-frame.mjs')).href);
const templates = process.env.GALLERY_TEMPLATES?.split(',') || ['pawfect-groom', 'auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee'];
const widths = process.env.GALLERY_WIDTHS?.split(',').map(Number) || [1440, 390];
const modes = process.env.GALLERY_MODES?.split(',') || ['public', 'wr', 'pr'];
const drafts = new Map();
for (const id of templates) {
  const input = await api.typedMaterialsFixture(id, 3, `2026-10-03.${id}-materials.${revision}`);
  const m = input.materials;
  for (const product of m.products) {
    const mediaId = `second-${product.id}`;
    m.media.push({ ...m.media.find(item => item.id === product.galleryMediaIds[1]), id: mediaId });
    product.galleryMediaIds.push(mediaId);
    m.imageBindings.push({ ...m.imageBindings.find(b => b.slotId === 'product-gallery' && b.productId === product.id), mediaId, itemIndex: 2, alt: { en: `Second angle of ${product.id}` } });
  }
  drafts.set(id, api.draftFromMaterials(input, Object.fromEntries(m.media.map(asset => [asset.id, { id: asset.id }]))));
}
function installGalleryProbe() {
      if (window.galleryProbe) return;
      window.galleryProbe = []; window.galleryPaints = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (...args) { const animation = animate.apply(this, args); window.galleryProbe.push({ target: this, animation }); return animation; };
      const sample = () => {
        const h1 = document.querySelector('main h1');
        if (h1 && window.galleryPaints.length < 180) {
          let opacity = 1; for (let node = h1; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
          window.galleryPaints.push({ opacity, prepared: !!(document.body.dataset.productMotion || document.body.dataset.pawfectMotion) });
        }
        requestAnimationFrame(sample);
      }; requestAnimationFrame(sample);
}
const probeSource = `;(${installGalleryProbe.toString()})();`;
const publicDir = resolve('public');
const consumer = await readFile(resolve(out, 'pr-consumer.js'), 'utf8');
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
let origin;
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, origin);
    const send = (type, body) => { response.setHeader('Content-Type', type.startsWith('text/') ? `${type}; charset=utf-8` : type); response.end(body); };
    if (url.pathname.startsWith('/api/web-radar/projects/gallery-test/assets/')) {
      const id = url.pathname.split('/').at(-1), color = id.startsWith('second-') ? '#8b9f52' : id.startsWith('gallery-') ? '#cc8855' : '#5585b5';
      return send('image/svg+xml', `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="${color}"/><text x="40" y="100" font-size="35" fill="white">${id.replace(/[^a-zA-Z0-9-]/g, '')}</text></svg>`);
    }
    if (url.pathname === '/pr-consumer.js') return send('text/javascript', consumer);
    if (url.pathname === '/frame') return send('text/html', websitePreviewFrame(origin));
    if (url.pathname === '/favicon.ico') { response.writeHead(204); return response.end(); }
    if (url.pathname.startsWith('/templates/')) {
      const file = resolve(publicDir, '.' + decodeURIComponent(url.pathname));
      assert(file.startsWith(publicDir + sep));
      response.setHeader('Access-Control-Allow-Origin', '*');
      return send({ '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' }[extname(file)] || 'application/octet-stream', await readFile(file));
    }
    const template = url.searchParams.get('template') || templates[0];
    const draft = drafts.get(template); assert(draft);
    const page = url.searchParams.get('page') || 'detail', productId = url.searchParams.get('product') || 'p0';
    const mode = url.pathname.slice(1), base = '/api/web-radar/projects/gallery-test';
    const html = api.renderSite(draft, { projectId: 'gallery-test', lang: 'en', page, productId, preview: mode !== 'public', assetUrl: id => `${mode === 'pr' ? '' : origin}${base}/assets/${id}`, inquiryUrl: '/inquiry' });
    if (mode === 'public') return send('text/html', html.replace('<head>', `<head><script>${probeSource}</script>`));
    assert(['wr', 'pr'].includes(mode));
    const preview = { schemaVersion: 'wr-project-service-v1', projectId: 'gallery-test', projectVersion: 1, page, lang: 'en', productId, assetBaseUrl: origin, proxyBasePath: base, runtime: api.projectPreviewRuntimeForDraft(draft), prepareRuntime: probeSource + api.projectPreviewPrepareForDraft(draft), html: api.projectPreviewHtml(html, base, origin, { page, lang: 'en', productId, expectedVersion: 1 }) };
    const bootstrap = mode === 'pr' ? `
      const prepared=prConsumer.prepareWebsitePreview(${json(preview)},'gallery-test',location.origin);
      const blobs=await Promise.all(prepared.assetIds.map(async id=>({id,blob:await (await fetch(${json(base)}+'/assets/'+id)).blob()})));
      addEventListener('message',event=>{
        if(event.source!==frame.contentWindow||event.data?.channel!=='gallery-test')return;
        if(event.data.type==='pr:preview-shell-ready')frame.contentWindow.postMessage({type:'pr:preview-document',channel:'gallery-test',html:prepared.html},'*');
        if(event.data.type==='pr:preview-ready')frame.contentWindow.postMessage({type:'pr:preview-media',channel:'gallery-test',media:blobs,complete:true},'*');
        if(event.data.type==='pr:preview-rendered')document.body.dataset.previewReady='true';
        if(event.data.type==='pr:preview-error')document.body.dataset.previewError='true';
      });frame.src='/frame?bridge=2&frame=gallery-test';
    ` : `
      const doc=new DOMParser().parseFromString(${json(html)},'text/html');
      doc.querySelectorAll('script,base,meta[http-equiv="refresh"],meta[http-equiv="Content-Security-Policy"]').forEach(node=>node.remove());
      const csp=doc.createElement('meta');csp.httpEquiv='Content-Security-Policy';csp.content="default-src 'none'; img-src ${origin} data: blob:; style-src 'unsafe-inline' ${origin}; script-src 'nonce-gallery-test'; font-src ${origin} data:; base-uri 'none'; form-action 'none'";doc.head.prepend(csp);
      const prepare=doc.createElement('script');prepare.setAttribute('nonce','gallery-test');prepare.textContent=${json(probeSource + client.referenceTemplatePreviewPrepare(draft))};doc.head.appendChild(prepare);
      const runtime=doc.createElement('script');runtime.setAttribute('nonce','gallery-test');runtime.textContent=${json(api.projectPreviewRuntime + '\n;' + await client.referenceTemplatePreviewRuntime(draft))};doc.body.appendChild(runtime);
      frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;
    `;
    await writeFile(resolve(out, `${mode}-bootstrap.js`), `(async()=>{const frame=document.getElementById('preview');${bootstrap}})();`);
    send('text/html', `<!doctype html><html><head><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%}</style></head><body><iframe id="preview" sandbox="allow-scripts allow-forms"></iframe><script src="/pr-consumer.js"></script><script>(async()=>{const frame=document.getElementById('preview');${bootstrap.replace(/<\/script/gi, '<\\/script')}})();</script></body></html>`);
  } catch (error) { response.writeHead(500); response.end(String(error)); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
const results = [], errors = [], started = Date.now();
const tick = frame => frame.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
const finish = frame => frame.evaluate(() => document.getAnimations().filter(a => a.id === 'pawfect-scroll-enter' || a.id.startsWith('product-scroll-enter:')).forEach(a => a.finish()));
const counts = frame => frame.evaluate(() => {
  const counts = new Map();
  for (const { target, animation } of window.galleryProbe) if (animation.id === 'pawfect-scroll-enter' || animation.id.startsWith('product-scroll-enter:')) counts.set(target, (counts.get(target) || 0) + 1);
  return { total: [...counts.values()].reduce((a, b) => a + b, 0), repeats: [...counts.values()].filter(n => n > 1).length };
});
try {
  for (const template of templates) for (const width of widths) for (const mode of modes) {
    const label = `${template}/${width}/${mode}`;
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await context.addInitScript(installGalleryProbe);
    const page = await context.newPage(); page.setDefaultTimeout(8000);
    page.on('pageerror', error => errors.push(`${label}: ${error.stack || error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`${label}: ${message.text()}`); });
    try {
      for (const pageName of revision === '5' ? ['home', 'about', 'detail'] : ['home', 'detail']) {
        await page.goto(`${origin}/${mode}?template=${template}&page=${pageName}`, { waitUntil: 'domcontentloaded' });
        let frame = page.mainFrame();
        if (mode !== 'public') { await page.waitForFunction(() => document.querySelector('#preview')?.getAttribute('srcdoc') || document.querySelector('#preview')?.getAttribute('src')); frame = await page.locator('#preview').elementHandle().then(el => el.contentFrame()); }
        assert(frame);
        await frame.waitForFunction(() => document.body?.dataset.productMotion || document.body?.dataset.pawfectMotion);
        if (mode === 'pr') { await page.waitForFunction(() => document.body.dataset.previewReady || document.body.dataset.previewError); assert.notEqual(await page.locator('body').getAttribute('data-preview-error'), 'true'); }
        await frame.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all([...document.querySelectorAll('img[src]')].map(i => i.decode())); });
        await tick(frame);
        await frame.waitForFunction(() => window.galleryProbe.some(({animation}) => animation.id === 'pawfect-scroll-enter' || animation.id.startsWith('product-scroll-enter:'))).catch(async error => { await writeFile(resolve(out,'motion-diagnostic.json'),JSON.stringify(await frame.evaluate(()=>({hidden:document.hidden,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,animate:Element.prototype.animate.toString(),paints:window.galleryPaints.slice(0,4),innerWidth,innerHeight,probe:window.galleryProbe.map(({target,animation})=>({target:target.className,id:animation.id})),h1:document.querySelector('main h1')?.outerHTML,body:document.body.dataset,rect:document.querySelector('main h1')?.getBoundingClientRect().toJSON()})),null,2)); throw error; });
        assert((await counts(frame)).total > 0, `${label}/${pageName}: entrance animations run`);
        const paints = await frame.evaluate(() => window.galleryPaints);
        assert(paints.length && paints.every(p => p.prepared || p.opacity < .05), `${label}: headline does not flash before preparation`);
        await finish(frame);
        if (pageName === 'about') {
          const slot = { 'pawfect-groom': 'about-primary-image', auravell: 'about-hero-scene', 'careflow-healthcare': 'about-wide-scene', 'toorun-early-learning': 'about-primary-image', 'lumi-business': 'about-wide', 'mello-coffee': 'about-primary-image' }[template];
          const draft = drafts.get(template), binding = draft.materials.imageBindings.find(image => image.slotId === slot);
          assert(binding, `${label}: About opening binding exists`);
          assert.deepEqual([...binding.depictedProductIds].sort(), draft.products.map(product => product.id).sort());
          const image = frame.locator(`img[data-wr-material-image="${slot}"]`);
          assert.equal(await image.count(), 1, `${label}: one About collection photograph`);
          assert.equal(await image.getAttribute('alt'), binding.alt.en);
          assert(await image.evaluate(image => image.naturalWidth > 0));
          if (mode !== 'pr') assert((await image.getAttribute('src')).includes(binding.assetId));
          await page.screenshot({ path: resolve(out, `${template}-${width}-${mode}-about.png`) });
        }
        if (pageName === 'detail') {
          const thumbs = frame.locator('[data-wr-product-gallery] [data-wr-material-thumb]'), main = frame.locator('#wr-detail-main-img');
          assert.equal(await thumbs.count(), 3, `${label}: original plus two auxiliaries`);
          assert(await frame.locator('[data-wr-product-gallery] img').evaluateAll(images => images.every(image => image.hasAttribute('src') && image.naturalWidth > 0)), 'Every gallery image is loaded');
          const initialSrc = await main.getAttribute('src');
          await thumbs.nth(1).click();
          await frame.waitForFunction(src => document.querySelector('#wr-detail-main-img').getAttribute('src') !== src, initialSrc);
          assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'), 'true');
          assert(await frame.evaluate(() => window.galleryProbe.some(({target,animation}) => target.id === 'wr-detail-main-img' && !animation.id && animation.effect.getTiming().duration > 0)), 'Image switching animates');
          const selectedSrcset = await main.getAttribute('srcset');
          if (mode === 'pr') assert.equal(selectedSrcset, null, 'Private previews use authorized blobs');
          else assert(!selectedSrcset || selectedSrcset.split(',').every(item => item.includes('gallery-p0')), 'Selected responsive sources belong to the auxiliary');
          const secondSrc = await main.getAttribute('src');
          await thumbs.nth(2).focus(); await page.keyboard.press('Enter');
          await frame.waitForFunction(src => document.querySelector('#wr-detail-main-img').getAttribute('src') !== src, secondSrc);
          assert.notEqual(await main.getAttribute('src'), secondSrc, 'Keyboard selects the next auxiliary');
          assert.equal(await thumbs.nth(2).getAttribute('aria-pressed'), 'true');
          assert.match(await main.getAttribute('alt'), /Second angle of p0/);
          await main.evaluate(i => i.decode());
          await thumbs.first().click(); await frame.waitForFunction(src => document.querySelector('#wr-detail-main-img').getAttribute('src') === src, initialSrc);
          await thumbs.first().focus(); await page.keyboard.press('ArrowRight');
          await frame.waitForFunction(() => document.querySelectorAll('[data-wr-product-gallery] [data-wr-material-thumb]')[1].getAttribute('aria-pressed') === 'true');
          assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'), 'true', 'Arrow keys switch auxiliary images');
          await thumbs.first().click(); await frame.waitForFunction(src => document.querySelector('#wr-detail-main-img').getAttribute('src') === src, initialSrc);
          const srcs = await thumbs.locator('img').evaluateAll(images => images.map(i => i.src));
          if (mode !== 'pr') assert(srcs.every(src => !src.includes('p1') && !src.includes('p2')), 'No other product image enters the gallery');
          await main.click();
          await frame.locator('#wr-product-image-viewer[open]').waitFor();
          assert.equal(await frame.locator('#wr-product-image-viewer .wr-image-thumbnail').count(), 3, 'Full image viewer retains the entire product gallery');
          await page.keyboard.press('Escape');
          await frame.evaluate(() => document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime)).forEach(animation => animation.finish()));
          await page.screenshot({ path: resolve(out, `${template}-${width}-${mode}.png`) });
        }
        for (let top = 0, height = await frame.evaluate(() => document.documentElement.scrollHeight); top <= height; top += 650) { await frame.evaluate(top => scrollTo({ top, behavior: 'instant' }), top); await tick(frame); await finish(frame); }
        const first = await counts(frame); assert.equal(first.repeats, 0);
        await frame.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await tick(frame); await finish(frame);
        assert.deepEqual(await counts(frame), first, 'Scroll-back does not replay entrances');
        assert(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: no horizontal overflow`);
        await page.emulateMedia({ reducedMotion: 'reduce' }); await tick(frame);
        assert.equal(await frame.locator('main').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
        if (pageName === 'detail') { await frame.locator('[data-wr-product-gallery] [data-wr-material-thumb]').nth(1).click(); await frame.waitForFunction(() => document.querySelectorAll('[data-wr-product-gallery] [data-wr-material-thumb]')[1].getAttribute('aria-pressed') === 'true'); }
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await frame.waitForFunction(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
        await tick(frame);
        results.push({ template, width, mode, page: pageName, entrances: first.total, gallery: pageName === 'detail', aboutCollection: pageName === 'about', onceOnly: true, reducedMotion: true });
      }
      console.log(`PASS ${label}: gallery and motion`);
    } catch (error) { await writeFile(resolve(out, 'failed-page.html'), await page.content()); await writeFile(resolve(out, 'failed-frames.json'), JSON.stringify(await Promise.all(page.frames().map(async frame => ({url:frame.url(),html:await frame.content()}))), null, 2)); await page.screenshot({ path: resolve(out, label.replaceAll('/', '-') + '-failed.png') }).catch(() => {}); throw error; }
    finally { await context.close(); }
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(out, 'report.json'), JSON.stringify({ passed: true, results, cases: results.length, errors, elapsedMs: Date.now() - started }, null, 2));
  console.log(JSON.stringify({ passed: true, cases: results.length, elapsedMs: Date.now() - started }));
} catch (error) { await writeFile(resolve(out, 'failure.json'), JSON.stringify({ error: String(error), errors, results }, null, 2)); throw error; }
finally { await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); }
