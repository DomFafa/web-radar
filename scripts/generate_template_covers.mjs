import { createHash } from 'node:crypto';
import { createServer as createHttpServer } from 'node:http';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import { verifyTemplateCovers } from './verify_template_covers.mjs';

// Each cover is the actual current materials-demo homepage. No mock images or copied templates.
const output = resolve('artifacts/template-covers');
const publicRoot = resolve('public');
const selected = process.argv.find(arg => arg.startsWith('--templates='))?.slice('--templates='.length).split(',');
let browser, server;
try {
  await mkdir(output, { recursive: true });
  const rendererPath = resolve(output, 'renderer.mjs');
  // Match Wrangler's keepNames bundling: direct TS execution can hide serialized helper errors.
  await build({
    stdin: { contents: [
      "export { templateGuides } from './src/worker/template-guides/catalog';",
      "export { availableMaterialsTemplateReleases } from './src/templates/materials-releases';",
      "export { getMaterialsTemplate } from './src/templates/materials';",
      "export { materialsDemoDraft } from './src/worker/template-guides/materials-demo';",
      "export { getMaterialsDemoSamples } from './src/worker/template-guides/materials-demo-samples';",
      "export { renderSite } from './src/templates';",
    ].join('\n'), resolveDir: process.cwd(), loader: 'ts' },
    outfile: rendererPath, bundle: true, format: 'esm', platform: 'node', target: 'es2022', keepNames: true,
  });
  const { templateGuides, availableMaterialsTemplateReleases, getMaterialsTemplate, materialsDemoDraft, getMaterialsDemoSamples, renderSite } = await import(pathToFileURL(rendererPath).href);
  const ids = [...new Set([
    ...templateGuides.map(guide => guide.templateId),
    ...availableMaterialsTemplateReleases().map(release => release.contract.templateId),
  ])].sort().filter(id => !selected || selected.includes(id));
  if (!ids.length || selected?.some(id => !ids.includes(id))) throw Error('Unknown template selection');
  const profiles = new Map(ids.map(id => [id, getMaterialsTemplate(id)]));
  const pages = new Map(ids.map(id => {
    const draft = materialsDemoDraft(profiles.get(id), 'en');
    return [`/__cover/${id}`, renderSite(draft, {
      projectId: 'materials-demo', lang: 'en', page: 'home', productId: draft.primaryProductId,
      assetUrl: id => id, inquiryUrl: '', preview: true,
    })];
  }));
  const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript', '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
  server = createHttpServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pages.has(pathname)) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return response.end(pages.get(pathname));
    }
    const path = resolve(publicRoot, `.${pathname}`);
    if (!path.startsWith(publicRoot + sep)) { response.writeHead(403); return response.end(); }
    try {
      const bytes = await readFile(path);
      response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
      response.end(bytes);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
  const manifest = {}, results = [];
  for (const id of ids) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Bundled demo assets are local. A remote dependency cannot silently substitute an unrelated cover.
    await page.route('**/*', route => new URL(route.request().url()).origin === baseUrl ? route.continue() : route.abort());
    try {
      await page.goto(`${baseUrl}/__cover/${id}`, { waitUntil: 'networkidle' });
      const metrics = await page.evaluate(async () => {
        document.querySelectorAll('video').forEach(video => video.pause());
        await document.fonts.ready;
        const visible = element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight; };
        const images = [...document.images].filter(visible);
        const brokenImages = [];
        await Promise.all(images.map(async image => {
          try { await image.decode(); } catch { brokenImages.push(image.getAttribute('src')); }
        }));
        const backgrounds = [...new Set([...document.querySelectorAll('*')].filter(visible).flatMap(element => [null, '::before', '::after'].flatMap(pseudo => [...getComputedStyle(element, pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match => match[1]))))];
        const brokenBackgrounds = [];
        await Promise.all(backgrounds.map(async url => {
          const image = new Image(); image.src = url;
          try { await image.decode(); } catch { brokenBackgrounds.push(url); }
        }));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return { title: document.title, headings: [...document.querySelectorAll('h1')].map(node => node.textContent), visibleImages: images.length, backgrounds: backgrounds.length, brokenImages, brokenBackgrounds, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      const bytes = await page.screenshot({ type: 'jpeg', quality: 84, animations: 'disabled' });
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      const filename = `${id}.${sha256.slice(0, 16)}.jpg`;
      await writeFile(resolve(output, filename), bytes);
      manifest[id] = { url: `/templates/previews/${filename}`, sha256, width: 1440, height: 1000, contractRevision: profiles.get(id).contractRevision };
      const sample = getMaterialsDemoSamples(id, profiles.get(id).contractRevision);
      results.push({ templateId: id, ...metrics, errors, screenshot: filename, contractRevision: profiles.get(id).contractRevision, sampleStatus: sample?.status, sampleLimitation: sample?.limitation });
      console.log(`${id}: ${errors.length} script errors, ${metrics.brokenImages.length + metrics.brokenBackgrounds.length} broken visible images`);
    } finally { await page.close(); }
  }
  const report = { scope: 'Local original materials-demo HTML in headless Chrome; not an authenticated parent-application end-to-end test.', viewport: { width: 1440, height: 1000 }, results };
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  if (results.some(result => result.errors.length || result.brokenImages.length || result.brokenBackgrounds.length || result.overflow || !result.headings.some(Boolean))) throw Error('Template cover rendering failed; inspect artifacts/template-covers/report.json. Manifest not published.');
  if (selected) { console.log('Selected-template inspection only; manifest not published.'); }
  else {
    for (const cover of Object.values(manifest)) await copyFile(resolve(output, cover.url.split('/').at(-1)), resolve(publicRoot, `.${cover.url}`));
    report.assets = await verifyTemplateCovers(baseUrl, manifest, browser);
    await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    await writeFile(resolve('src/worker/template-guides/covers.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(`Published ${ids.length} actual template screenshots after HTTP MIME, hash and browser-decode verification.`);
  }
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
