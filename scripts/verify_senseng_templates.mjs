import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const output = resolve(root, 'artifacts/senseng-review');
await mkdir(output, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates/index'; export {defaultDraft} from './src/worker/domain';`, resolveDir: root }, bundle: true, platform: 'node', format: 'esm', outfile: resolve(output, 'renderer.mjs') });
const { renderSite, defaultDraft } = await import(resolve(output, 'renderer.mjs') + `?t=${Date.now()}`);
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/templates/')) {
      const file = resolve(root, 'public', '.' + url.pathname);
      if (!file.startsWith(resolve(root, 'public/templates') + '/')) throw Error();
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      res.end(data); return;
    }
    const draft = defaultDraft();
    draft.company.name = 'senseng';
    draft.template = url.pathname.includes('video') ? 'senseng-video' : 'senseng-clean';
    const page = url.searchParams.get('page') || 'home';
    const html = renderSite(draft, { projectId: 'senseng-review', lang: 'en', page, preview: url.searchParams.has('preview'), assetUrl: id => '/templates/senseng/' + id, inquiryUrl: '/api/subscription-test' });
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' }); res.end(html);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(r => server.listen(4178, '127.0.0.1', r));
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const results = [];
try {
  // Capture a real frame of the supplied video as the no-motion/loading poster.
  await page.goto('http://127.0.0.1:4178/video');
  await page.locator('video').evaluate(async v => {
    v.play().catch(() => {});
    if (v.readyState < 2) await Promise.race([new Promise(r => v.addEventListener('loadeddata', r, { once: true })), new Promise((_,reject) => setTimeout(() => reject(Error('Video did not load')),15000))]);
    v.pause(); v.currentTime = 1;
    await new Promise(r => v.addEventListener('seeked', r, { once: true }));
    v.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;object-fit:cover;z-index:9999;max-width:none';
  });
  await page.locator('video').screenshot({ path: resolve(root, 'public/templates/senseng/video-poster.jpg'), type: 'jpeg', quality: 88 });
  for (const template of ['clean', 'video']) {
    for (const width of [1536, 2560, 5034, 768, 390]) {
      console.log('Checking', template, width);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
      await page.goto(`http://127.0.0.1:4178/${template}`);
      await page.evaluate(() => Promise.all(Array.from(document.images, i => { i.loading='eager'; return i.decode().catch(() => {}); })));
      if (template === 'video') {
        await page.waitForFunction(() => document.querySelector('video').readyState >= 2, undefined, { timeout: 15000 });
        await page.locator('video').evaluate(v => v.pause());
        const geometry = await page.locator('video').evaluate(v => {
          const r=v.getBoundingClientRect(),h=v.parentElement.getBoundingClientRect();
          return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, heroLeft:h.left, heroRight:h.right, heroTop:h.top, heroBottom:h.bottom, fit:getComputedStyle(v).objectFit, source:v.currentSrc };
        });
        assert.ok(geometry.left <= 0); assert.ok(geometry.right >= width);
        assert.equal(geometry.top, geometry.heroTop); assert.equal(geometry.bottom, geometry.heroBottom);
        assert.equal(geometry.fit, 'cover'); assert.ok(geometry.source.endsWith('/templates/senseng/hero-video.mp4'));
      }
      const scroll = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }));
      assert.ok(scroll.width <= scroll.viewport, `${template} ${width}px overflows: ${JSON.stringify(scroll)}`);
      assert.equal(await page.locator('.senseng-newsletter').count(), 1);
      if ([1536, 390].includes(width)) await page.screenshot({ path: resolve(output, `${template}-${width}.png`), fullPage: true });
      if (width === 1536) await page.screenshot({path:resolve(root, `public/templates/previews/senseng-${template}.jpg`),type:'jpeg',quality:88});
      results.push(`${template} ${width}px: no overflow${template === 'video' ? ', video covers entire hero' : ''}`);
    }
    await page.setViewportSize({ width: 1536, height: 1024 });
    for (const route of ['home', 'catalog', 'detail', 'about', 'contact']) {
      console.log('Checking shared footer', template, route);
      await page.goto(`http://127.0.0.1:4178/${template}?page=${route}&preview`);
      assert.equal(await page.locator('.senseng-newsletter').count(), 1);
      assert.ok(await page.locator('#senseng-newsletter button').isDisabled());
      assert.ok(await page.locator('.senseng-newsletter').evaluate(n => n.nextElementSibling?.tagName === 'FOOTER'));
      if (template === 'clean' && route !== 'home') await page.screenshot({ path: resolve(output, `${template}-${route}.png`), fullPage: true });
      await page.setViewportSize({width:390,height:844});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${template} ${route} mobile overflow: ${JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0,8).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width}))))}`);
      await page.setViewportSize({width:1536,height:1024});
    }
  }
  await page.goto('http://127.0.0.1:4178/clean');
  let requests = [];
  await page.route('**/api/subscription-test', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: requests.length === 1 ? 503 : 200, contentType: 'application/json', body: '{}' });
  });
  await page.locator('#newsletter-email').fill('buyer@example.com');
  await page.locator('#senseng-newsletter button').click();
  await page.getByRole('status').filter({ hasText: 'Unable to send' }).waitFor();
  await page.locator('#senseng-newsletter button').click();
  await page.getByRole('status').filter({ hasText: 'has been received' }).waitFor();
  assert.equal(requests.length, 2); assert.equal(requests[0].requestId, requests[1].requestId);
  assert.equal(requests[1].email, 'buyer@example.com'); assert.ok(requests[1].message.includes('subscribe'));
  assert.equal(await page.locator('#newsletter-email').inputValue(), '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4178/video');
  assert.equal(await page.locator('video').evaluate(v => v.paused), true);
  assert.ok((await page.locator('.senseng-hero-video-full').evaluate(h => getComputedStyle(h).backgroundImage)).includes('video-poster.jpg'));
  assert.deepEqual(errors, []);
  results.push('All five pages in both templates: shared subscription directly before footer; preview submission disabled.', 'Subscription failure/retry/success verified with intercepted requests; no email sent.', 'Reduced motion: paused video with poster fallback; no JavaScript errors.');
  await writeFile(resolve(output, 'verification.txt'), results.join('\n') + '\n');
  console.log(results.join('\n'));
} finally { await browser.close(); server.close(); }
