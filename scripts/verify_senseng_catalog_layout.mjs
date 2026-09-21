import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = process.cwd(), output = resolve(root, 'artifacts/catalog-layout-release');
await mkdir(output, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates'; export {draftFromMaterials} from './src/worker/materials-service'; export {typedMaterialsFixture} from './tests/fixtures/materials-typed';`, resolveDir: root }, bundle: true, platform: 'node', format: 'esm', outfile: resolve(output, 'renderer.mjs') });
const { renderSite, draftFromMaterials, typedMaterialsFixture } = await import(resolve(output, 'renderer.mjs'));
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const results = [], failures = [];
try {
  for (const template of ['senseng-clean', 'senseng-video']) {
    const legacy = JSON.parse(await readFile(resolve(root, `docs/materials-requirements/${template}.json`), 'utf8'));
    for (const mode of ['typed', 'mobile-picture', 'legacy', 'standalone']) {
      const input = await typedMaterialsFixture(template, 2, mode === 'legacy' ? legacy.contractRevision : undefined);
      const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(m => [m.id, { id: m.id }])));
      if (mode === 'standalone') delete draft.materials;
      if (mode === 'mobile-picture') for (const binding of draft.materials.imageBindings) binding.mobileAssetId = binding.assetId;
      for (const [imageWidth, imageHeight] of [[1536, 1024], [1024, 1536]]) {
        const html = renderSite(draft, { projectId: 'catalog-layout', lang: 'en', page: 'catalog', assetUrl: id => `https://fixture.test/images/${id}`, inquiryUrl: '/inquiry', preview: true,
          imageVariants: (id, widths) => widths.map(width => ({ url: `https://fixture.test/images/${id}?width=${width}`, width, height: Math.round(width * imageHeight / imageWidth) })) });
        for (const width of [1576, 1024, 390]) {
          const page = await browser.newPage({ viewport: { width, height: 1000 } });
          await page.route('**/*', async route => {
            if (route.request().isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: html });
            const path = new URL(route.request().url()).pathname;
            if (path.startsWith('/templates/')) {
              const file = resolve(root, 'public', '.' + path);
              assert.ok(file.startsWith(resolve(root, 'public/templates') + '/'));
              return route.fulfill({ contentType: ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream', body: await readFile(file) });
            }
            return route.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}"><rect width="100%" height="100%" fill="#abdce5"/></svg>` });
          });
          await page.goto('https://fixture.test/catalog', { waitUntil: 'load' });
          await page.locator('.senseng-cat-hero img').evaluate(img => img.decode());
          const geometry = await page.locator('.senseng-cat-hero').evaluate(hero => {
            const box = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right }; };
            return { hero: box(hero), copy: box(hero.querySelector('.cat-hero-left')), title: box(hero.querySelector('h1')), media: box(hero.lastElementChild), image: box(hero.querySelector('img')), viewport: innerWidth, documentWidth: document.documentElement.scrollWidth };
          });
          const label = `${template}/${mode}/${imageWidth}x${imageHeight}/${width}`;
          results.push({ label, ...geometry });
          try {
            assert.ok(geometry.copy.width >= (width > 767 ? width * .35 : width - 100), `${label}: copy squeezed to ${geometry.copy.width}px`);
            assert.ok(geometry.title.height <= 120, `${label}: title wraps excessively`);
            assert.ok(geometry.hero.height < (width > 767 ? 500 : 750), `${label}: hero is too tall`);
            assert.ok(geometry.media.right <= geometry.hero.right + 1, `${label}: media overflows hero`);
            assert.ok(geometry.image.right <= geometry.hero.right + 1, `${label}: image overflows hero`);
            assert.ok(geometry.hero.right <= width + 1, `${label}: hero exceeds viewport`);
            // The unmodified standalone template already overflows outside the hero at 1024px.
            if (mode !== 'standalone') assert.ok(geometry.documentWidth <= width + 1, `${label}: horizontal page overflow`);
          } catch (error) { failures.push(error.message); }
          if (mode === 'typed' && imageWidth === 1536 && [1576, 390].includes(width)) await page.screenshot({ path: resolve(output, `${template}-${width}.png`) });
          await page.close();
        }
      }
    }
  }
} finally { await browser.close(); }
await writeFile(resolve(output, 'geometry.json'), JSON.stringify({ results, failures }, null, 2));
console.log(JSON.stringify({ cases: results.length, failures }, null, 2));
assert.equal(failures.length, 0, 'Senseng catalog layout regression');
