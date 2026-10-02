import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';

const out = resolve('artifacts/mello-layout-fix');
await mkdir(out, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates'; export {defaultDraft} from './src/worker/domain'; export {melloLayoutStyles} from './src/templates/themes/melloLayout';`, resolveDir: process.cwd(), loader: 'ts' }, outfile: `${out}/renderer.mjs`, bundle: true, platform: 'node', format: 'esm' });
const { renderSite, defaultDraft, melloLayoutStyles } = await import(pathToFileURL(`${out}/renderer.mjs`));
const draft = { ...defaultDraft(), template: 'mello-coffee', brandColor: '#78bf30', languages: ['en'] };
const options = { projectId: 'preview', lang: 'en', page: 'home', assetUrl: id => id, inquiryUrl: '/inquiry', preview: true };
const pages = new Map([['/demo', renderSite(draft, options)], ['/dark', renderSite({ ...draft, brandColor: '#343c39' }, { ...options, projectId: 'customer' })]]);
const fixture = process.argv.find(a => a.startsWith('--published='))?.slice(12);
if (fixture) pages.set('/published', (await readFile(fixture, 'utf8')).replace('</head>', `<style>${melloLayoutStyles}</style></head>`).replace('style="--accent:#343c39"', 'style="--accent:#343c39;--mello-accent-ink:#ffffff;--mello-accent-icon:brightness(0) invert(1)"'));
const mime = { '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pages.has(pathname)) { res.setHeader('Content-Type', 'text/html'); return res.end(pages.get(pathname)); }
  try { const file = resolve('public', '.' + pathname); if (!file.startsWith(resolve('public') + '/')) throw Error(); res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream'); res.end(await readFile(file)); } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ channel: process.platform === 'darwin' ? 'chrome' : undefined });
const report = [];
try {
  for (const route of pages.keys()) for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    // Use local copies of template assets for deterministic font and image layout.
    await page.route('https://web-radar.net/templates/**', async r => { try { const p = new URL(r.request().url()).pathname; await r.fulfill({ body: await readFile(resolve('public', '.' + decodeURIComponent(p))), contentType: mime[extname(p)] || 'application/octet-stream', headers: { 'Access-Control-Allow-Origin': '*' } }); } catch(e) { errors.push('Template asset: ' + e.message); await r.abort(); } });
    await page.goto(`http://127.0.0.1:${server.address().port}${route}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const rect = e => e.getBoundingClientRect();
      const issues = [];
      for (const row of document.querySelectorAll('.menu-item,.text-and-volume-wrapper')) {
        const label = row.querySelector('p'), prices = row.querySelector('.volumes-wrapper');
        const columns = [label, ...row.querySelectorAll('.volume-text')].filter(Boolean);
        if (columns.some((el, index) => el.scrollWidth > el.clientWidth + 1 || rect(el).right > rect(row).right + 1 || (index && rect(columns[index-1]).right > rect(el).left + 1))) issues.push(row.textContent.trim());
      }
      const image = document.querySelector('.hero-image > .image');
      const annotations = [...document.querySelectorAll('.hero-image > .product,.hero-image > .quality-badge')];
      const annotationsOverlap = image && annotations.some(e => rect(e).bottom > rect(image).top + 1);
      return { overflow: document.documentElement.scrollWidth > innerWidth + 1, overflowElements: [...document.querySelectorAll('body *')].filter(e => { if(rect(e).right <= innerWidth + 1) return false; for(let p=e.parentElement;p && p !== document.body;p=p.parentElement) if(['hidden','clip','auto','scroll'].includes(getComputedStyle(p).overflowX)) return false; return true; }).slice(0,12).map(e => ({tag:e.tagName,cls:e.className,width:rect(e).width,right:rect(e).right})), menuOverlaps: issues, annotationsOverlap: !!annotationsOverlap, menuWidth: document.querySelector('.menu-categories')?.getBoundingClientRect().width };
    });
    const link = page.locator('.menu-link').first();
    if (await link.isVisible()) {
      await link.hover();
      result.navContrast = await link.evaluate(e => {
        const rgb = s => (s.match(/[\d.]+/g) || []).slice(0,3).map(Number).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
        const luminance = s => rgb(s).reduce((sum, v, i) => sum + v * [.2126,.7152,.0722][i], 0);
        const c = getComputedStyle(e), a = luminance(c.color), b = luminance(c.backgroundColor); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      });
    }
    if ([1440, 390].includes(width)) {
      await page.mouse.move(0, 0);
      await page.screenshot({ path: `${out}/${route.slice(1)}-${width}-hero.png` });
      const menu = page.locator('#menu'); if (await menu.count()) { await menu.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${out}/${route.slice(1)}-${width}-menu.png` }); }
    }
    report.push({ route, width, ...result, errors });
    await page.close();
  }
  await writeFile(`${out}/layout-report.json`, JSON.stringify(report, null, 2));
  for (const r of report) { assert.equal(r.overflow, false, JSON.stringify(r)); assert.equal(r.annotationsOverlap, false, JSON.stringify(r)); assert.deepEqual(r.menuOverlaps, [], JSON.stringify(r)); assert.deepEqual(r.errors, [], JSON.stringify(r)); if (r.navContrast) assert.ok(r.navContrast >= 4.5, JSON.stringify(r)); }
  console.log(`${report.length} Mello desktop/mobile layouts passed: menu alignment, annotation placement, navigation contrast, overflow and script errors.`);
} finally { await browser.close(); await new Promise(r => server.close(r)); }
