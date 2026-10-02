// Replay the accepted online project locally; never regenerate its HTML or media.
// node scripts/preview-pawfect-motion.mjs [--check] [--evidence DIR] [--port 4211]
import { build } from 'esbuild';
import { parse } from 'parse5';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const root = fileURLToPath(new URL('..', import.meta.url));
const evidence = resolve(option('--evidence', '/Users/dom/Desktop/website-materials-system-20261002'));
const port = Number(option('--port', '4211'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async path => JSON.parse(await readFile(resolve(evidence, path), 'utf8'));
const [responses, sourceReceipts, generatedReceipts, report] = await Promise.all([
  json('live-preview/online-preview-responses.json'),
  json('visual-qa/source-image-receipt.json'),
  json('visual-qa/generated-image-receipt.json'),
  json('live-preview/report.json'),
]);
const receipts = new Map([...sourceReceipts, ...generatedReceipts].map(item => [item.sha256, item]));
const resources = new Map();
const mediaUrls = new Map();
for (const media of report.media) {
  const receipt = receipts.get(media.sha256);
  if (!receipt) throw new Error(`Missing local receipt for ${media.url}`);
  const bytes = await readFile(receipt.path);
  if (hash(bytes) !== media.sha256 || bytes.length !== media.bytes) throw new Error(`Media integrity mismatch: ${receipt.path}`);
  const pathname = `/media/${media.sha256}.jpg`;
  resources.set(pathname, { bytes, type: receipt.mime });
  mediaUrls.set(media.url, pathname);
}
if (resources.size !== 11) throw new Error(`Expected 3 source images and 8 scenes; found ${resources.size}`);

const pages = new Map();
const pageKey = (page, productId) => page === 'detail' ? `${page}:${productId}` : page;
const allowedPages = new Set(['home', 'catalog', 'detail', 'about', 'contact']);
const detailIds = new Set(responses.filter(item => item.page === 'detail').map(item => item.productId));
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const escapeAttr = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

function replayHtml(record, baseline) {
  const { body } = record;
  const document = parse(body.html, { sourceCodeLocationInfo: true });
  const edits = [];
  const visit = node => {
    if (node.tagName === 'script') {
      const location = node.sourceCodeLocation;
      if (location) edits.push({ start: location.startOffset, end: location.endOffset, text: '' });
      return;
    }
    const headerNav = node.tagName === 'nav' && node.parentNode?.tagName === 'header';
    if (headerNav) {
      const end = node.sourceCodeLocation.startTag.endOffset - 1;
      edits.push({ start: end, end, text: ' style="margin-left:auto"' });
    }
    if (node.tagName === 'a' && node.parentNode?.tagName === 'nav' && node.parentNode.parentNode?.tagName === 'header') {
      const location = node.sourceCodeLocation;
      const destination = attr(node, 'data-wr-page');
      if (!['catalog', 'about'].includes(destination)) {
        edits.push({ start: location.startOffset, end: location.endOffset, text: '' });
        return;
      }
      if (destination === 'about') {
        edits.push({ start: location.startTag.endOffset, end: location.endTag.startOffset, text: 'About us' });
      }
    }
    if (node.tagName === 'a' && attr(node, 'class') === 'pg-button' && attr(node.parentNode, 'class') === 'pg-process') {
      const location = node.sourceCodeLocation.attrs.class;
      edits.push({ start: location.startOffset, end: location.endOffset, text: 'class="pg-text-link"' });
    }
    if (node.tagName === 'a' && attr(node, 'data-wr-page')) {
      const page = attr(node, 'data-wr-page');
      if (!allowedPages.has(page)) throw new Error(`Unexpected saved page: ${page}`);
      const oldUrl = new URL(attr(node, 'href'), 'http://preview.invalid');
      const productId = attr(node, 'data-wr-product-id') || oldUrl.searchParams.get('productId');
      if (page === 'detail' && !detailIds.has(productId)) throw new Error(`Missing detail snapshot: ${productId}`);
      const params = new URLSearchParams({ page });
      if (productId && (page === 'detail' || page === 'contact')) params.set('productId', productId);
      if (baseline) params.set('baseline', '1');
      const fragment = /^#[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(oldUrl.hash) ? oldUrl.hash : '';
      const location = node.sourceCodeLocation?.attrs?.href;
      if (!location) throw new Error('Saved navigation link has no href location');
      edits.push({ start: location.startOffset, end: location.endOffset, text: `href="${escapeAttr('/?' + params + fragment)}"` });
    }
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(document);
  let html = body.html;
  for (const edit of edits.sort((a, b) => b.start - a.start)) html = html.slice(0, edit.start) + edit.text + html.slice(edit.end);
  for (const [original, local] of mediaUrls) html = html.replaceAll(original, local);
  if (/\/api\/web-radar\/projects\//.test(html)) throw new Error(`Unmapped production resource in ${record.page}`);
  // Only the supplied reviewed preview runtime is replayed; saved inquiry scripts are excluded.
  const runtime = body.runtime.replace(/<\/script/gi, '<\\/script');
  const productOrder = [...detailIds].indexOf(record.productId);
  const additions = `<script src="/preview-guard.js"></script><script>${runtime}</script>${baseline ? '' : `<script src="/pawfect-motion.js" data-pawfect-product-order="${productOrder}"></script>`}`;
  if (!baseline) {
    // Cover the first paint while the external motion script loads. Without JS or
    // with reduced motion, content stays visible; a failed/slow script fails open.
    const prepare = `<script>(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||!Element.prototype.animate)return;const style=document.createElement('style');style.id='pawfect-motion-prepaint';style.textContent='main,.pg-booking{opacity:0!important}';document.head.append(style);setTimeout(()=>{if(style.isConnected){document.documentElement.dataset.pawfectMotionUnavailable='true';style.remove();}},1500);})();</script>`;
    html = html.replace('</head>', prepare + '</head>');
  }
  return html.replace('</body>', additions + '</body>');
}

for (const record of responses) {
  const { body } = record;
  if (body.projectId !== report.projectId || body.projectVersion !== 1 || !body.html.includes('data-wr-materials-revision="2026-10-02.pawfect-groom-materials.2"')) throw new Error('Unexpected project snapshot or materials revision');
  for (const fontPath of new Set(body.html.match(/\/templates\/[\w./-]+\.(?:ttf|woff2?)/g) || [])) {
    resources.set(fontPath, { bytes: await readFile(resolve(root, 'public', '.' + fontPath)), type: fontPath.endsWith('.ttf') ? 'font/ttf' : 'font/woff2' });
  }
  const baseline = replayHtml(record, true);
  const motion = replayHtml(record, false);
  const originalStyles = body.html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi);
  if (JSON.stringify(originalStyles) !== JSON.stringify(motion.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi))) throw new Error('Preview changed original styles');
  pages.set(pageKey(record.page, record.productId), { baseline, motion });
}
if (pages.size !== 7 || detailIds.size !== 3) throw new Error(`Expected seven saved page variants, found ${pages.size}`);
const manifest = { projectId: report.projectId, projectVersion: 1, pages: [...pages.keys()], images: mediaUrls.size, fonts: resources.size - mediaUrls.size, source: resolve(evidence, 'live-preview/online-preview-responses.json'), baseline: '/?baseline=1' };
console.log(JSON.stringify({ verified: true, ...manifest }));
if (args.includes('--check')) process.exit(0);

const motionPath = resolve(root, 'src/templates/themes/pawfect/motion.ts');
let motionModified = -1;
let motionBundle;
async function currentMotionBundle() {
  const modified = (await stat(motionPath)).mtimeMs;
  if (modified !== motionModified) {
    const result = await build({ stdin: { contents: "import { pawfectMotionRuntime } from './src/templates/themes/pawfect/motion'; pawfectMotionRuntime();", resolveDir: root, loader: 'ts' }, bundle: true, platform: 'browser', format: 'iife', write: false });
    motionBundle = result.outputFiles[0].contents;
    motionModified = modified;
  }
  return motionBundle;
}
await currentMotionBundle();

const guard = `document.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();},true);
document.addEventListener('click',event=>{const a=event.target.closest?.('a');if(!a)return;const href=a.getAttribute('href')||'';if(!href.startsWith('#')&&!href.startsWith('/?'))event.preventDefault();},true);
for(const button of document.querySelectorAll('form button[type="submit"]'))button.disabled=true;
const selected=new URLSearchParams(location.search).get('productId');if(selected){const field=document.querySelector('select[name="productId"]');if(field&&Array.from(field.options).some(option=>option.value===selected))field.value=selected;}
addEventListener('load',async()=>{if(/^#[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(location.hash)){await Promise.all([...document.images].map(image=>{image.loading='eager';return image.decode().catch(()=>{});}));await document.fonts.ready;document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'});}});`;
const server = createServer(async (request, response) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'");
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); return response.end('Read-only preview'); }
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    let bytes, type;
    if (url.pathname === '/') {
      const page = url.searchParams.get('page') || 'home';
      const saved = pages.get(pageKey(page, url.searchParams.get('productId')));
      if (!saved) { response.writeHead(404); return response.end('No saved preview for this page'); }
      bytes = url.searchParams.get('baseline') === '1' ? saved.baseline : saved.motion;
      type = 'text/html; charset=utf-8';
    } else if (url.pathname === '/pawfect-motion.js') {
      bytes = await currentMotionBundle(); type = 'text/javascript';
    } else if (url.pathname === '/preview-guard.js') {
      bytes = guard; type = 'text/javascript';
    } else if (url.pathname === '/__manifest') {
      bytes = JSON.stringify(manifest); type = 'application/json';
    } else {
      const resource = resources.get(url.pathname);
      if (!resource) { response.writeHead(404); return response.end(); }
      ({ bytes, type } = resource);
    }
    response.setHeader('Content-Type', type);
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch (error) {
    console.error(error); response.writeHead(500); response.end('Local preview failed; see server log');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Motion preview: http://127.0.0.1:${port}/\nBaseline: http://127.0.0.1:${port}/?baseline=1`));
