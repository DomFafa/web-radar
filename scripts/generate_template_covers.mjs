import { createHash } from 'node:crypto';
import { createServer as createHttpServer } from 'node:http';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import { verifyTemplateCovers } from './verify_template_covers.mjs';

// Each cover is the actual rendered template homepage, matching live preview.
const output = resolve('artifacts/template-covers');
const publicRoot = resolve('public');
const selected = process.argv.find(arg => arg.startsWith('--templates='))?.slice('--templates='.length).split(',');
const useMaterialsDemo = process.argv.includes('--materials-demo');
let browser, server;
try {
  await mkdir(output, { recursive: true });
  const rendererPath = resolve(output, 'renderer.mjs');
  await build({
    stdin: { contents: [
      "export { TEMPLATES } from './src/client/TemplateSelector';",
      "export { currentMaterialsTemplate as getMaterialsTemplate } from './src/worker/template-guides/current-materials';",
      "export { renderSite } from './src/templates';",
      "export { defaultDraft } from './src/worker/domain';",
      "export { materialsDemoDraft } from './src/worker/template-guides/materials-demo';",
    ].join('\n'), resolveDir: process.cwd(), loader: 'ts' },
    outfile: rendererPath, bundle: true, format: 'esm', platform: 'node', target: 'es2022', keepNames: true,
  });
  const { TEMPLATES, getMaterialsTemplate, renderSite, defaultDraft, materialsDemoDraft } = await import(pathToFileURL(rendererPath).href);
  const ids = TEMPLATES.map(t => t.id).filter(id => !selected || selected.includes(id));
  if (!ids.length || selected?.some(id => !ids.includes(id))) throw Error('Unknown template selection');
  const templateMap = new Map(TEMPLATES.map(t => [t.id, t]));
  const profiles = new Map(ids.map(id => [id, getMaterialsTemplate(id)]));
  const pages = new Map(ids.map(id => {
    const tmpl = templateMap.get(id);
    const profile = profiles.get(id);
    if (useMaterialsDemo && !profile) throw Error(`Materials demo is unavailable: ${id}`);
    const draft = useMaterialsDemo ? materialsDemoDraft(profile, 'en') : {
      ...defaultDraft(),
      template: tmpl.id,
      brandColor: tmpl.accentColor,
      languages: ['en'],
    };
    if (useMaterialsDemo && draft.materials?.contractRevision !== profile.contractRevision) {
      throw Error(`Materials demo does not bind the advertised contract: ${id}`);
    }
    return [`/__cover/${id}`, renderSite(draft, {
      projectId: 'preview', lang: 'en', page: 'home',
      assetUrl: id => id, inquiryUrl: '/inquiry', preview: false,
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
    try {
      await page.goto(`${baseUrl}/__cover/${id}`, { waitUntil: 'load', timeout: 30000 });
      const metrics = await page.evaluate(async () => {
        document.querySelectorAll('video').forEach(video => { video.pause(); video.currentTime = 0; });
        try { await document.fonts.ready; } catch {}
        const visible = element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight; };
        const images = [...document.images].filter(visible);
        const brokenImages = [];
        await Promise.all(images.map(async image => {
          try { await image.decode(); } catch { brokenImages.push(image.getAttribute('src')); }
        }));
        await new Promise(resolve => setTimeout(resolve, 150));
        return {
          title: document.title,
          headings: [...document.querySelectorAll('h1, h2')].map(node => node.textContent?.trim()).filter(Boolean),
          visibleImages: images.length,
          brokenImages,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      const bytes = await page.screenshot({ type: 'jpeg', quality: 85, animations: 'disabled' });
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      const filename = `${id}.${sha256.slice(0, 16)}.jpg`;
      await writeFile(resolve(output, filename), bytes);
      const contractRevision = profiles.get(id)?.contractRevision || `2026-09-22.${id}-materials.5`;
      manifest[id] = { url: `/templates/previews/${filename}`, sha256, width: 1440, height: 1000, contractRevision };
      results.push({ templateId: id, ...metrics, errors, screenshot: filename, contractRevision });
      console.log(`${id}: ${errors.length} script errors, ${metrics.brokenImages.length} broken visible images`);
    } finally { await page.close(); }
  }
  const report = { scope: useMaterialsDemo ? 'Rendered versioned materials demo homepages in headless Chrome, matching the materials preview route.' : 'Rendered template homepage screenshots in headless Chrome matching live preview.', viewport: { width: 1440, height: 1000 }, results };
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  if (results.some(result => result.errors.length || result.brokenImages.length || result.overflow || !result.headings.length)) {
    throw Error('Template cover rendering failed; inspect artifacts/template-covers/report.json. Manifest not published.');
  }
  if (selected) {
    console.log('Selected-template inspection only; manifest not published.');
  } else {
    for (const cover of Object.values(manifest)) {
      await copyFile(resolve(output, cover.url.split('/').at(-1)), resolve(publicRoot, `.${cover.url}`));
    }
    report.assets = await verifyTemplateCovers(baseUrl, manifest, browser);
    await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    await writeFile(resolve('src/worker/template-guides/covers.json'), JSON.stringify(manifest, null, 2) + '\n');
    // Also update previewImg in TemplateSelector.tsx
    let selectorContent = await readFile(resolve('src/client/TemplateSelector.tsx'), 'utf8');
    for (const [id, cover] of Object.entries(manifest)) {
      const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?previewImg:\\s*['"])([^'"]+)(['"])`);
      selectorContent = selectorContent.replace(regex, `$1${cover.url}$3`);
    }
    await writeFile(resolve('src/client/TemplateSelector.tsx'), selectorContent);
    console.log(`Published ${ids.length} actual template screenshots after HTTP MIME, hash and browser-decode verification.`);
  }
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
