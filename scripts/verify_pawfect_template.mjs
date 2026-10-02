import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
const output = resolve('artifacts/pawfect-qa');
await mkdir(output, { recursive: true });
await build({
  stdin: {
    contents:
      "export {renderSite,renderSiteFiles} from './src/templates';export {defaultDraft} from './src/worker/domain';",
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  outfile: output + '/renderer.mjs',
  bundle: true,
  format: 'esm',
  platform: 'node',
  keepNames: true,
});
const { renderSite, renderSiteFiles, defaultDraft } = await import(output + '/renderer.mjs');
const d = defaultDraft();
d.template = 'pawfect-groom';
d.brandColor = '#38929a';
d.company = {
  ...d.company,
  name: 'Pawfect Groom',
  email: 'hello@example.test',
  contactName: 'Alex',
  description: 'Thoughtful grooming for your favourite companion.',
  phone: '+44 20 1234 5678',
  address: 'Customer supplied salon address',
};
d.products = [
  {
    id: 'groom',
    name: 'The Full Groom',
    description: 'A bath, coat-friendly dry and a style discussed with your groomer.',
    material: '',
    dimensions: '',
    imageAssetId: 'hero.jpg',
    sellingPoints: ['Discuss your preferred style', 'Share your dog’s coat and temperament'],
  },
];
let server, browser;
const results = [];
try {
  let files;
  server = createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://localhost');
      if (files[u.pathname.slice(1)]) {
        res.setHeader('Content-Type', 'text/html');
        return res.end(files[u.pathname.slice(1)]);
      }
      const p = resolve('public', '.' + u.pathname);
      if (!p.startsWith(resolve('public') + sep)) throw Error();
      const data = await readFile(p);
      res.setHeader(
        'Content-Type',
        { '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf', '.css': 'text/css' }[
          extname(p)
        ] || 'application/octet-stream',
      );
      res.end(data);
    } catch {
      res.statusCode = 404;
      res.end('Not found');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  files = renderSiteFiles(d, {
    projectId: 'customer-project',
    assetUrl: (id) => origin + '/templates/pawfect-groom/' + id,
    inquiryUrl: origin + '/inquiry',
    publicBaseUrl: origin,
    preview: false,
  });
  files['__preview/contact'] = renderSite(d, {
    projectId: 'customer-project',
    lang: 'en',
    page: 'contact',
    preview: true,
    assetUrl: (id) => origin + '/templates/pawfect-groom/' + id,
    inquiryUrl: origin + '/inquiry',
  });
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const route of [
      'index.html',
      'catalog/index.html',
      'products/groom/index.html',
      'about/index.html',
      'contact/index.html',
    ]) {
      await page.goto(origin + '/en/' + route);
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'));
        await document.fonts.ready;
        await Promise.all([...document.images].map((i) => i.decode()));
      });
      const metrics = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        broken: [...document.images].filter((i) => !i.complete || !i.naturalWidth).length,
        fonts: document.fonts.check('800 18px "Plus Jakarta Sans"'),
      }));
      assert.equal(metrics.h1, 1);
      assert.equal(metrics.overflow, false, `overflow ${width} ${route}`);
      assert.equal(metrics.broken, 0);
      assert.equal(metrics.fonts, true);
      if (route === 'index.html') {
        await page.locator('#faq summary').first().click();
        assert.equal(await page.locator('#faq details').first().getAttribute('open'), '');
        await page.screenshot({ path: output + `/home-${width}.png`, fullPage: true });
      }
      if (route === 'products/groom/index.html') {
        await page.getByRole('link', { name: 'Enquire about this service' }).click();
        assert.match(page.url(), /productId=groom/);
      }
      if (route === 'contact/index.html') {
        assert.equal(await page.locator('#inquiry button[type=submit]').isDisabled(), false);
        await page.screenshot({ path: output + `/contact-${width}.png`, fullPage: true });
      }
      results.push({ width, route, ...metrics });
    }
    await page.goto(origin + '/__preview/contact');
    assert.equal(await page.locator('#inquiry button[type=submit]').isDisabled(), true);
    assert.deepEqual(errors, []);
    await page.close();
  }
  await writeFile(output + '/report.json', JSON.stringify(results, null, 2));
  console.log(
    `Verified ${results.length} desktop/mobile pages, navigation, FAQ, fonts and disabled preview form.`,
  );
} finally {
  await browser?.close();
  await new Promise((r) => server?.close(r));
}
