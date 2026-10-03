import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtemp, readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';

// Optional local candidate verifies real customer-image geometry without network access.
const output = resolve(process.env.ABOUT_MOBILE_OUTPUT || 'artifacts/about-mobile-six');
const candidate = process.env.ABOUT_COLLECTION_IMAGE;
const image = candidate ? await readFile(candidate) : Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1000"><rect width="1800" height="1000" fill="#eee9df"/>' + Array.from({ length: 10 }, (_, i) => `<rect x="${20 + i * 175}" y="300" width="160" height="400" rx="5" fill="hsl(${i * 36} 60% 65%)"/><text x="${100 + i * 175}" y="530" text-anchor="middle" font-size="60">${i + 1}</text>`).join('') + '</svg>');
const cases = [
  ['pawfect-groom', 'about-primary-image', '.pg-scene-media'],
  ['auravell', 'about-hero-scene', '.avp-about-media'],
  ['careflow-healthcare', 'about-wide-scene', '.cfp-mosaic-wide'],
  ['toorun-early-learning', 'about-primary-image', '.tr-about-image'],
  ['lumi-business', 'about-wide', '.lp-about-wide'],
  ['mello-coffee', 'about-primary-image', '.mp-about-story > figure'],
].filter(([id]) => process.argv.length === 2 || process.argv.slice(2).includes(id));
assert.ok(cases.length, 'Select at least one known template');
const directory = await mkdtemp(resolve(tmpdir(), 'about-mobile-'));
let browser, server;
try {
  await mkdir(output, { recursive: true });
  const bundle = resolve(directory, 'api.mjs');
  await build({ stdin: { contents: "export {renderSite} from './src/templates';export {typedMaterialsFixture} from './tests/fixtures/materials-typed';export {draftFromMaterials} from './src/worker/materials-service';", resolveDir: process.cwd(), loader: 'ts' }, outfile: bundle, bundle: true, platform: 'node', format: 'esm', target: 'node22', keepNames: true });
  const api = await import(pathToFileURL(bundle).href);
  const pages = new Map();
  for (const [id, slot] of cases) for (const version of [4, 5]) {
    const input = await api.typedMaterialsFixture(id, 10, `2026-10-03.${id}-materials.${version}`);
    const draft = api.draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id }])));
    const about = draft.materials.imageBindings.find(binding => binding.slotId === slot);
    pages.set(`/${id}/${version}`, api.renderSite(draft, { projectId: 'about-mobile', lang: 'en', page: 'about', preview: true, assetUrl: asset => asset === about.assetId ? '/candidate' : '/placeholder', inquiryUrl: '/inquiry' }));
  }
  server = createServer(async (request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (pages.has(path)) { response.setHeader('Content-Type', 'text/html'); return response.end(pages.get(path)); }
    if (path === '/candidate' || path === '/placeholder') {
      response.setHeader('Content-Type', candidate && extname(candidate) !== '.svg' ? 'image/jpeg' : 'image/svg+xml'); return response.end(image);
    }
    if (path.startsWith('/templates/') && !path.includes('..')) {
      try { const bytes = await readFile(resolve('public', '.' + path)); response.setHeader('Content-Type', ({ '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' })[extname(path)] || 'application/octet-stream'); return response.end(bytes); } catch {}
    }
    response.writeHead(404); response.end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
  const results = [], failures = [];
  for (const [id, slot, frame] of cases) {
    const observations = {};
    for (const width of [390, 1440]) for (const version of [4, 5]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
      await page.goto(`http://127.0.0.1:${server.address().port}/${id}/${version}`, { waitUntil: 'load' });
      const img = page.locator(`img[data-wr-material-image="${slot}"]`);
      await img.evaluate(async image => { await image.decode(); });
      await img.scrollIntoViewIfNeeded();
      const measured = await img.evaluate((image, frameSelector) => {
        const frame = image.closest(frameSelector), css = getComputedStyle(image);
        const imageRect = image.getBoundingClientRect(), header = document.querySelector('header'), headerRect = header?.getBoundingClientRect();
        const bounds = element => ({ width: element.clientWidth, height: element.clientHeight });
        return { image: bounds(image), frame: bounds(frame), natural: { width: image.naturalWidth, height: image.naturalHeight }, fit: css.objectFit,
          headerOverlap: !!header && getComputedStyle(header).position === 'fixed' && headerRect.bottom > imageRect.top && headerRect.top < imageRect.bottom,
          overlay: getComputedStyle(frame, '::after').backgroundImage,
          others: [...document.querySelectorAll('img[data-wr-material-image]')].filter(other => other !== image).map(other => ({ slot: other.dataset.wrMaterialImage, ...bounds(other), fit: getComputedStyle(other).objectFit })),
          overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      }, frame);
      if (version === 5) await page.locator(frame).screenshot({ path: resolve(output, `${id}-${width}.png`) });
      observations[`${width}-${version}`] = measured;
      results.push({ id, version, width, ...measured, errors });
      await page.close();
      if (errors.length) failures.push(`${id}/${width}/v${version}: ${errors.join('; ')}`);
    }
    try {
      const mobile = observations['390-5'];
      assert.ok(Math.abs(mobile.image.width / mobile.image.height - mobile.natural.width / mobile.natural.height) < .01, `${id}: mobile image must retain its natural aspect ratio`);
      assert.equal(mobile.fit, 'contain', `${id}: mobile object-fit must never crop the collection`);
      assert.ok(Math.abs(mobile.frame.height - mobile.image.height) < 2, `${id}: frame must shrink to the complete natural image without empty bands`);
      assert.equal(mobile.overflow, false, `${id}: no horizontal overflow`);
      assert.equal(mobile.headerOverlap, false, `${id}: fixed navigation must not hide the first product row`);
      if (id === 'auravell') assert.equal(mobile.overlay, 'none', 'Auravell: the collection must remain visible above its separate dark title area');
      assert.deepEqual(mobile.others, observations['390-4'].others, `${id}: secondary About images keep their native dimensions and fit`);
      assert.deepEqual(observations['1440-5'], observations['1440-4'], `${id}: desktop layout remains unchanged`);
    } catch (error) { failures.push(error.message); }
  }
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ candidateSha256: createHash('sha256').update(image).digest('hex'), actualCandidate: !!candidate, results, failures }, null, 2) + '\n');
  console.log(JSON.stringify({ cases: results.length, failures, output }));
  assert.equal(failures.length, 0, 'About mobile regression failed');
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(directory, { recursive: true, force: true });
}
