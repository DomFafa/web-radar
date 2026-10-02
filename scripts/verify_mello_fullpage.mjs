import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';

const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const out = resolve('artifacts/mello-fullpage-fix');
await mkdir(out, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates'; export {materialsDemoDraft} from './src/worker/template-guides/materials-demo'; export {getMaterialsTemplate} from './src/templates/materials';`, resolveDir: process.cwd(), loader: 'ts' }, outfile: `${out}/renderer.mjs`, bundle: true, platform: 'node', format: 'esm' });
const { renderSite, materialsDemoDraft, getMaterialsTemplate } = await import(pathToFileURL(`${out}/renderer.mjs`));
const demo = materialsDemoDraft(getMaterialsTemplate('mello-coffee'), 'en');
const drafts = new Map([['demo', demo], ['dark', { ...demo, brandColor: '#343c39' }]]);
const project = arg('project') ? JSON.parse(await readFile(arg('project'), 'utf8')) : null;
if (project) drafts.set('customer', project.draft);
const pages = new Map();
for (const [name, draft] of drafts) for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
  const projectId = name === 'customer' ? project.id : name === 'demo' ? 'materials-demo' : 'customer';
  pages.set(`/${name}/${page}`, renderSite(draft, { projectId, lang: 'en', page, productId: draft.products[0]?.id, assetUrl: id => id.startsWith('/') || id.startsWith('https:') ? id : `https://web-radar.net/public/sites/${projectId}/assets/${id}`, inquiryUrl: '/inquiry', preview: true }));
}
const mime = { '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pages.has(pathname)) { res.setHeader('Content-Type', 'text/html'); return res.end(pages.get(pathname)); }
  try { const file = resolve('public', '.' + pathname); if (!file.startsWith(resolve('public') + '/')) throw Error(); res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream'); res.end(await readFile(file)); } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ channel: process.platform === 'darwin' ? 'chrome' : undefined });
const report = [];
const regions = { featured: '.products-content', mood: '[data-mello-mood]', workflow: '[data-mello-time]', philosophy: '.philosophy-content', atmosphere: '#place', visit: '#visit', collection: '.wr-confirmed-products', company: '.wr-confirmed-company', footer: '.footer' };
// Check useful widths as well as overflow: collapsed grids often wrap text without overflowing.
const inspect = () => {
  const issues = [], contrast = [];
  const rect = el => el.getBoundingClientRect();
  const visible = el => rect(el).width > 0 && rect(el).height > 0 && getComputedStyle(el).visibility !== 'hidden';
  for (const selector of ['.wheel-product > *', '.time-wrapper-info > *', '.spot-content > *', '.visit-info > *', '.section-heading > .heading-title']) {
    for (const el of document.querySelectorAll(selector)) if (visible(el) && rect(el).width < Math.min(220, rect(el.parentElement).width * .6)) issues.push(`Narrow column ${selector}: ${rect(el).width}`);
  }
  for (const el of document.querySelectorAll('.spot-image,.heading-h2,.wheel-text,.time-name,.spot-tab .display-s,.hotspot-content,.spot-details h3,.photo-text-wrapper,.location-info,.email-block-text,.receipt-item > *,.receipt-total > *,.footer-link,.mello-detail-info,.field')) {
    if (!visible(el)) continue;
    if (el.scrollWidth > el.clientWidth + 2) issues.push(`Clipped text ${el.className}`);
    if (rect(el).left < -2 || rect(el).right > innerWidth + 2) issues.push(`Outside viewport ${el.className}: ${JSON.stringify({left:rect(el).left,right:rect(el).right,parent:el.parentElement.className,parentWidth:rect(el.parentElement).width})}`);
  }
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1; const ctx = canvas.getContext('2d');
  const rgba = str => { ctx.clearRect(0,0,1,1); ctx.fillStyle = str; ctx.fillRect(0,0,1,1); const [r,g,b,a] = ctx.getImageData(0,0,1,1).data; return [r,g,b,a/255]; };
  const luminance = c => c.slice(0,3).reduce((s,v,i) => s + (v/255 <= .04045 ? v/255/12.92 : ((v/255+.055)/1.055)**2.4) * [.2126,.7152,.0722][i],0);
  for (const el of document.querySelectorAll('.section.black p,.section.black .h2.accent,.wheel-text > *, .time .display-l,.time-tab .display-s,.spot-tab .display-s,.spot-details p,.spot-details h3,.location-block h3,.email-block h3,.ticker .display-s,.button .emphasis-l')) {
    if (!visible(el)) continue;
    let bg = [255,255,255,1];
    for (let p = el; p; p = p.parentElement) { const c = rgba(getComputedStyle(p).backgroundColor); if (c.length===3 || c[3]===1) { bg=c; break; } }
    const fg = rgba(getComputedStyle(el).color), a = luminance(fg), b = luminance(bg), ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const font = parseFloat(getComputedStyle(el).fontSize);
    if (ratio < (font >= 24 ? 3 : 4.5)) contrast.push({ cls: el.className, text: el.textContent.trim().slice(0,32), ratio: Math.round(ratio*100)/100 });
  }
  return { issues, contrast, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
};
try {
  for (const route of pages.keys()) for (const width of (arg('widths') || '1440,1024,768,390,320').split(',').map(Number)) {
    if (arg('only') && !route.includes(arg('only'))) continue;
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('https://web-radar.net/templates/**', async r => { try { const p = new URL(r.request().url()).pathname; await r.fulfill({ body: await readFile(resolve('public', '.' + decodeURIComponent(p))), contentType: mime[extname(p)] || 'application/octet-stream', headers: { 'Access-Control-Allow-Origin': '*' } }); } catch(e) { errors.push('Template asset: ' + e.message); await r.abort(); } });
    const liveBase = arg('live');
    const suffix = route.endsWith('/home') ? '/en/' : `/en/${route.split('/').pop()}/`;
    await page.goto(liveBase ? liveBase + suffix : `http://127.0.0.1:${server.address().port}${route}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const states = [await page.evaluate(inspect)];
    if (route.endsWith('/home')) {
      for (const [trigger, pane, active] of [['[data-mood]', '[data-prod-card]', '.active'], ['[data-time-tab]', '[data-mello-time] .w-tab-pane', '.w--tab-active'], ['[data-spot-btn]', '[data-mello-spot] .w-tab-pane', '.w--tab-active']]) {
        const tabs = page.locator(trigger);
        for (let i = 0; i < await tabs.count(); i++) {
          await tabs.nth(i).click();
          await page.waitForTimeout(350);
          assert.equal(await page.locator(pane+active).count(), 1, `${route} ${trigger} ${i}`);
          assert.ok(await page.locator(pane).nth(i).isVisible(), `${route} ${trigger} ${i}`);
          states.push(await page.evaluate(inspect));
        }
        if (await tabs.count()) await tabs.first().click();
      }
    }
    if (arg('screenshots') && ([1440,390].includes(width) || arg('only'))) {
      await page.evaluate(() => document.activeElement?.blur());
      // Load lazy images by visiting every section before the full-page capture.
      for (const [name, selector] of Object.entries(regions)) {
        const el = page.locator(selector).first();
        if (!(await el.count())) continue;
        await el.scrollIntoViewIfNeeded();
        await el.evaluate(el => Promise.race([Promise.all([...el.querySelectorAll('img')].map(img => img.decode().catch(()=>{}))), new Promise(r=>setTimeout(r,8000))]));
        await el.screenshot({ path: `${out}/${route.slice(1).replaceAll('/','-')}-${width}-${name}.png` });
      }
      await page.screenshot({ path: `${out}/${route.slice(1).replaceAll('/','-')}-${width}-full.png`, fullPage: true });
    }
    report.push({ route, width, errors, states });
    console.log(`${route} ${width}: ${states.reduce((n,s)=>n+s.issues.length+s.contrast.length+Number(s.overflow),0)} issues`);
    await writeFile(`${out}/${arg('report') || 'fullpage-report'}.json`, JSON.stringify(report,null,2));
    await page.close();
  }
  for (const r of report) { assert.deepEqual(r.errors, [], JSON.stringify(r)); for(const s of r.states) { assert.equal(s.overflow,false,JSON.stringify(r)); assert.deepEqual(s.issues,[],JSON.stringify(r)); assert.deepEqual(s.contrast,[],JSON.stringify(r)); } }
  console.log(`${report.length} full-page/inner-page responsive checks passed, including all mood, workflow and atmosphere states.`);
} finally { await browser.close(); await new Promise(r => server.close(r)); }
