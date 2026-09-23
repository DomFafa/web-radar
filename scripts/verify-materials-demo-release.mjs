import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

// Local-only acceptance of emitted, re-bundled HTML. It never calls production.
const out = resolve('artifacts/materials-demo-release');
await mkdir(out, { recursive: true });
const entry = `export {getMaterialsTemplate} from './src/templates/materials';
export {renderSite} from './src/templates';
export {materialsDemoDraft} from './src/worker/template-guides/materials-demo';
export {projectPreviewRuntimeForDraft} from './src/worker/project-preview';
export {templateGuides} from './src/worker/template-guides/catalog';`;
await build({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, keepNames: true, platform: 'node', format: 'esm', target: 'es2022', outfile: resolve(out, 'render.mjs') });
const render = await import(pathToFileURL(resolve(out, 'render.mjs')).href);
const productRadar = process.env.PRODUCT_RADAR_REPO;
let previewClient;
if (productRadar) {
  const client = await build({ entryPoints: [resolve(productRadar, 'src/client/website-preview.ts')], bundle: true, format: 'iife', globalName: 'PreviewClient', platform: 'browser', target: 'es2022', write: false });
  previewClient = client.outputFiles[0].text;
}
const publicDir = resolve('public');
const primary = ['senseng-clean', 'tools-workshop-video'];
const ids = process.env.DEMO_TEMPLATE_IDS?.split(',') || render.templateGuides.map(guide => guide.templateId);
let missingRequests = [];
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://local.invalid');
  if (url.pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    return response.end('<!doctype html><body style="margin:0"><iframe id="preview" sandbox="allow-scripts" style="width:100%;height:960px;border:0"></iframe></body>');
  }
  const path = resolve(publicDir, '.' + decodeURIComponent(url.pathname));
  if (url.pathname.startsWith('/templates/') && path.startsWith(publicDir + sep)) try {
    const bytes = await readFile(path);
    const contentType = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf' }[extname(path)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    return response.end(bytes);
  } catch { /* A missing asset is a failed check, never an HTML fallback. */ }
  if (url.pathname !== '/favicon.ico') missingRequests.push(url.pathname);
  response.writeHead(404); response.end('Not found');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
const results = [];
const failures = [];
try {
  for (const templateId of ids) {
    const contract = render.getMaterialsTemplate(templateId);
    const draft = render.materialsDemoDraft(contract, 'en');
    for (const pageName of process.env.DEMO_PAGES?.split(',') || (process.env.DEMO_ALL_PAGES === '1' || primary.includes(templateId) ? ['home', 'catalog', 'detail', 'about', 'contact'] : ['home'])) {
      const assets = new Map();
      const options = { projectId: 'demo-repair', lang: 'en', page: pageName, productId: draft.products[0]?.id, assetUrl: id => id, inquiryUrl: '/inquiry', preview: true };
      const raw = render.renderSite(draft, options);
      const projectHtml = previewClient && primary.includes(templateId) ? render.renderSite(draft, { ...options, assetUrl: id => {
        const key = createHash('sha256').update(id).digest('hex').slice(0,20);
        assets.set(key, id); return `/api/web-radar/projects/demo-repair/assets/${key}`;
      } }) : undefined;
      for (const mode of projectHtml ? ['raw-demo', 'project-preview'] : ['raw-demo']) for (const width of process.env.DEMO_VIEWPORTS?.split(',').map(Number) || [1440, 390]) {
        const context = await browser.newContext({ viewport: { width, height: 960 } });
        const page = await context.newPage();
        const errors = [], missingAssets = [];
        missingRequests = missingAssets;
        page.on('pageerror', error => errors.push(error.message));
        await context.route('**/*', async route => {
          const url = new URL(route.request().url());
          if (url.origin === origin) return route.continue();
          missingAssets.push(url.href);
          return route.abort();
        });
        await page.goto(origin, { waitUntil: 'load' });
        let frame = page.mainFrame();
        if (mode === 'raw-demo') {
          await page.evaluate(({ raw, origin }) => { document.getElementById('preview').srcdoc = raw.replace('<head>', `<head><base href="${origin}/">`); }, { raw, origin });
          frame = page.frames().find(candidate => candidate !== page.mainFrame());
          await frame.waitForSelector('body.wr-materials-site', { state: 'attached' });
          await frame.waitForLoadState('load');
        }
        if (mode === 'project-preview') {
          await page.addScriptTag({ content: previewClient });
          const preview = { projectId: 'demo-repair', html: projectHtml, runtime: render.projectPreviewRuntimeForDraft(draft), assetBaseUrl: origin + '/templates/', proxyBasePath: '/api/web-radar/projects/demo-repair', page: pageName, lang: 'en', productId: options.productId };
          const media = await Promise.all([...assets].map(async ([id, path]) => {
            if (!path.startsWith('/templates/')) throw Error('Unexpected fixture media ' + path);
            const bytes = await readFile(resolve(publicDir, '.' + path));
            return { id, type: path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.png') ? 'image/png' : 'image/jpeg', base64: bytes.toString('base64') };
          }));
          await page.evaluate(({ preview, media }) => {
            window.previewSignals = [];
            const iframe = document.getElementById('preview');
            addEventListener('message', event => {
              if (event.source !== iframe.contentWindow || event.data?.channel !== 'demo-verification') return;
              window.previewSignals.push(event.data.type);
              if (event.data.type === 'pr:preview-ready') iframe.contentWindow.postMessage({ type: 'pr:preview-media', channel: 'demo-verification', complete: true, media: media.map(entry => ({ id: entry.id, blob: new Blob([Uint8Array.from(atob(entry.base64), c => c.charCodeAt(0))], { type: entry.type }) })) }, '*');
            });
            iframe.srcdoc = PreviewClient.prepareWebsitePreview(preview, 'demo-verification', location.origin).html;
          }, { preview, media });
          await page.waitForFunction(() => window.previewSignals.includes('pr:preview-rendered') || window.previewSignals.includes('pr:preview-error'), { timeout: 20000 });
          frame = page.frames().find(candidate => candidate !== page.mainFrame());
        }
        const metrics = await frame.evaluate(async () => {
          document.querySelectorAll('img').forEach(img => img.loading = 'eager');
          await document.fonts.ready;
          const brokenBackgrounds = [];
          const backgrounds = [...new Set([...document.querySelectorAll('*')].flatMap(element => [null, '::before', '::after'].flatMap(pseudo => [...getComputedStyle(element, pseudo).backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g)].map(match => match[1]))))];
          await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
          await Promise.all(backgrounds.map(src => new Promise(resolve => {
            const image = new Image(); image.onload = resolve; image.onerror = () => { brokenBackgrounds.push(src); resolve(); }; image.src = src;
          })));
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return { overflow: document.documentElement.scrollWidth > innerWidth + 1, documentWidth: document.documentElement.scrollWidth,
            overflowElements: document.documentElement.scrollWidth <= innerWidth + 1 ? [] : [...document.querySelectorAll('body *')].filter(node => { const rect = node.getBoundingClientRect(); return rect.width && rect.right > innerWidth + 1; }).slice(0, 8).map(node => ({ tag: node.tagName, className: node.className, style: node.getAttribute('style'), parent: node.parentElement?.outerHTML.slice(0, 190), right: node.getBoundingClientRect().right, text: node.textContent?.trim().slice(0, 100) })),
            loadedImages: [...document.images].filter(img => img.naturalWidth > 0).length,
            brokenImages: [...document.images].filter(img => img.getAttribute('src') && !img.naturalWidth).map(img => img.getAttribute('src')),
            backgrounds: backgrounds.length, brokenBackgrounds, failedFonts: [...document.fonts].filter(font => font.status === 'error').map(font => font.family), deferredMedia: document.querySelectorAll('[data-pr-media]').length,
            headings: [...document.querySelectorAll('h1')].map(node => node.textContent?.trim()) };
        });
        const signals = mode === 'project-preview' ? await page.evaluate(() => window.previewSignals) : [];
        let mobileMenuWorks;
        const menu = frame.locator('[data-wr-mobile-menu]');
        if (width === 390 && await menu.count()) {
          await menu.locator('summary').click();
          mobileMenuWorks = await menu.evaluate(element => element.open && Boolean(element.querySelector('a[data-wr-page="catalog"]')));
          await menu.locator('summary').click();
        }
        const result = { templateId, contractRevision: contract.contractRevision, page: pageName, mode, viewportWidth: width, errors, missingAssets, ...metrics, signals, mobileMenuWorks };
        results.push(result);
        if (primary.includes(templateId) || process.env.DEMO_SCREENSHOTS === '1') await page.screenshot({ path: resolve(out, `${templateId}-${pageName}-${mode}-${width}.png`) });
        if (errors.length || missingAssets.length || metrics.overflow || metrics.brokenImages.length || metrics.brokenBackgrounds.length || metrics.failedFonts.length || metrics.deferredMedia || !metrics.headings.some(Boolean) || signals.includes('pr:preview-error') || mobileMenuWorks === false) failures.push(result);
        await context.close();
      }
    }
  }
} finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
await writeFile(resolve(out, 'verification.json'), JSON.stringify({ scope: 'Local re-bundled renderer fixtures. Raw demo scripts execute; optional project path uses the Product Radar sanitizer, frozen trusted runtime and media bridge in a sandbox. Does not verify signed-in parent navigation or production.',
  renderBundleSha256: createHash('sha256').update(await readFile(resolve(out, 'render.mjs'))).digest('hex'),
  rendererSnapshotSha256: createHash('sha256').update(await readFile(resolve('src/templates/releases/demo-20260923.mjs'))).digest('hex'),
  productRadar: Boolean(previewClient), results }, null, 2));
console.log(JSON.stringify({ cases: results.length, failed: failures.length, failures: failures.map(({templateId,page,mode,viewportWidth,errors,missingAssets,overflow,brokenImages,brokenBackgrounds,failedFonts})=>({templateId,page,mode,viewportWidth,errors,missingAssets,overflow,brokenImages,brokenBackgrounds,failedFonts})) }, null, 2));
if (failures.length) process.exitCode = 1;
