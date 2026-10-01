import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

// Exercise emitted customer HTML, not demo-only markup. No customer/network data is used.
const output = resolve('artifacts/native-gallery');
await mkdir(output, { recursive: true });
await build({ stdin: { contents: `export {typedMaterialsFixture} from './tests/fixtures/materials-typed';
export {draftFromMaterials} from './src/worker/materials-service';
export {renderSite} from './src/templates';`, resolveDir: process.cwd() }, bundle: true,
keepNames: true, platform: 'node', format: 'esm', outfile: resolve(output, 'render.mjs') });
const { typedMaterialsFixture, draftFromMaterials, renderSite } = await import(pathToFileURL(resolve(output, 'render.mjs')).href);
const publicDir = resolve('public'), fixtureImage = await readFile(resolve(publicDir, 'templates/senseng/products-1.jpg'));
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://local.invalid');
  if (url.pathname === '/') { response.setHeader('Content-Type', 'text/html'); return response.end('<!doctype html><html><body></body></html>'); }
  if (url.pathname.startsWith('/media/')) { response.setHeader('Content-Type', 'image/jpeg'); return response.end(fixtureImage); }
  const path = resolve(publicDir, '.' + decodeURIComponent(url.pathname));
  if (url.pathname.startsWith('/templates/') && path.startsWith(publicDir + sep)) try {
    response.setHeader('Content-Type', { '.css':'text/css', '.woff2':'font/woff2', '.ttf':'font/ttf', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.avif':'image/avif' }[extname(path)] || 'application/octet-stream');
    return response.end(await readFile(path));
  } catch {}
  response.writeHead(404); response.end();
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
let cases = 0;
try {
  const heroResults = [];
  for (const count of [2, 6]) {
    const input = await typedMaterialsFixture('toorun-early-learning', count);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(asset => [asset.id, { id: asset.id }])));
    const html = renderSite(draft, { projectId: 'native-hero-regression', lang: 'en', page: 'home', assetUrl: id => origin + '/media/' + id, inquiryUrl: origin + '/inquiry', preview: true });
    for (const width of [1580, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      await page.goto(origin);
      await page.setContent(html.replace('<head>', `<head><base href="${origin}/">`));
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => {
        const hero = document.querySelector('.tr-hero'), title = hero.querySelector('h1').getBoundingClientRect();
        return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, heroHeight: hero.getBoundingClientRect().height,
          titleTop: title.top, titleBottom: title.bottom, cards: hero.querySelectorAll('.tr-portrait').length,
          genericHeroes: document.querySelectorAll('.wr-confirmed-hero').length,
          images: [...hero.querySelectorAll('img')].map(image => ({ visible: image.getBoundingClientRect().width > 0,
            loaded: image.complete && image.naturalWidth > 0, product: image.dataset.wrMaterialProduct, fit: getComputedStyle(image).objectFit })) };
      });
      assert.equal(metrics.scrollWidth, width);
      assert.equal(metrics.cards, 4);
      assert.equal(metrics.genericHeroes, 0);
      assert(metrics.titleTop >= 0 && metrics.titleBottom < 960, 'Confirmed title remains in the first viewport');
      assert(metrics.heroHeight < 1100, 'Portrait images must not become a full-width banner');
      assert.deepEqual(metrics.images.map(image => image.product), Array.from({ length: 4 }, (_, i) => `p${i % count}`));
      assert(metrics.images.every(image => (!image.visible || image.loaded) && image.fit === 'contain'));
      assert.deepEqual(errors, [], 'Toorun confirmed-materials runtime errors');
      await page.screenshot({ path: resolve(output, `toorun-${count}-${width}.png`) });
      heroResults.push({ productCount: count, ...metrics });
      await page.close();
    }
  }
  await writeFile(resolve(output, 'toorun-hero.json'), JSON.stringify(heroResults, null, 2) + '\n');
  for (const template of ['auravell','careflow-healthcare','lumi-business','papernote','pawfect-groom']) {
    const input = await typedMaterialsFixture(template, 2);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(asset => [asset.id, { id:asset.id }])));
    for (const materials of [draft.materials, undefined]) {
      const errors = [];
      const context = await browser.newContext({ viewport: { width:1440, height:960 } });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const html = renderSite({...draft, materials}, { projectId:'native-gallery-regression', lang:'en', page:'detail', productId:'p1', assetUrl:id=>origin+'/media/'+id, inquiryUrl:origin+'/inquiry' });
      await page.goto(origin);
      await page.setContent(html.replace('<head>', `<head><base href="${origin}/">`));
      for (const width of [1440,390,1440]) {
        await page.setViewportSize({ width, height:960 });
        const main = page.locator('#wr-detail-main-img');
        await main.waitFor({state:'visible'});
        const thumbs = page.locator('.senseng-detail-thumbs [data-wr-material-thumb]');
        assert.ok(await thumbs.count() >= 2, `${template}: original and supplemental thumbnail`);
        await thumbs.last().click();
        await page.waitForFunction(() => document.querySelector('#wr-detail-main-img').src.endsWith('/gallery-p1'));
        assert.equal(await thumbs.last().getAttribute('aria-pressed'), 'true');
        await main.click();
        await page.locator('#wr-product-image-viewer[open]').waitFor();
        assert.equal(await page.locator('#wr-product-image-viewer .wr-image-stage img').getAttribute('src'), origin+'/media/gallery-p1');
        await page.keyboard.press('Escape');
        await thumbs.first().click();
        await page.waitForFunction(() => document.querySelector('#wr-detail-main-img').src.endsWith('/m1'));
        assert.equal(await thumbs.first().getAttribute('aria-pressed'), 'true');
        assert.deepEqual(errors, [], `${template}: runtime errors`);
        cases++;
      }
      await context.close();
    }
  }
} finally { await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); }
console.log(`PASS: 4 confirmed Toorun hero cases and ${cases} native gallery cases, including desktop/mobile resize, main/secondary switching and the image viewer.`);
