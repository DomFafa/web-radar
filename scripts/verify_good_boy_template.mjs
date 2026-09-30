import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
const output = resolve('artifacts/good-boy-qa');
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
d.template = 'good-boy-pals';
d.brandColor = '#ffcd1e';
d.company = {
  ...d.company,
  name: 'Good Boy Supply Co.',
  email: 'hello@example.test',
  contactName: 'Alex',
  description: 'Thoughtful supplies for your favourite companion.',
  phone: '+44 20 1234 5678',
  address: 'Customer supplied shop address',
};
d.products = [
  {
    id: 'rope',
    name: 'Cotton Rope',
    description: 'A sturdy cotton rope for everyday play.',
    material: '',
    dimensions: '',
    imageAssetId: 'hero-dog-DxsknfB3.jpg',
    sellingPoints: ['Cotton construction', 'A useful everyday toy'],
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
        {
          '.jpg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.woff2': 'font/woff2',
          '.css': 'text/css',
        }[extname(p)] || 'application/octet-stream',
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
    assetUrl: (id) => origin + '/templates/good-boy-pals/' + id,
    inquiryUrl: origin + '/inquiry',
    publicBaseUrl: origin,
    preview: false,
  });
  const demo = defaultDraft();
  demo.template = 'good-boy-pals';
  demo.brandColor = '#ffcd1e';
  files['__demo/home'] = renderSite(demo, {
    projectId: 'good-boy-demo',
    lang: 'en',
    page: 'home',
    assetUrl: (id) => id,
    inquiryUrl: '',
    preview: false,
  });
  files['__preview/contact'] = renderSite(d, {
    projectId: 'customer-project',
    lang: 'en',
    page: 'contact',
    preview: true,
    assetUrl: (id) => origin + '/templates/good-boy-pals/' + id,
    inquiryUrl: origin + '/inquiry',
  });
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [1440, 900, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const route of [
      'index.html',
      'catalog/index.html',
      'products/rope/index.html',
      'about/index.html',
      'contact/index.html',
    ]) {
      await page.goto(origin + '/en/' + route);
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'));
        await document.fonts.ready;
        await Promise.all(
          [...document.images].filter((i) => i.getAttribute('src')).map((i) => i.decode()),
        );
      });
      const metrics = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        broken: [...document.images].filter(
          (i) => i.getAttribute('src') && (!i.complete || !i.naturalWidth),
        ).length,
        fonts: document.fonts.check('800 18px "Nunito"'),
      }));
      assert.equal(metrics.h1, 1);
      assert.equal(metrics.overflow, false, `overflow ${width} ${route}`);
      assert.equal(metrics.broken, 0);
      assert.equal(metrics.fonts, true);
      if (route === 'index.html') {
        await page.screenshot({ path: output + `/home-${width}.png`, fullPage: true });
      }
      if (route === 'products/rope/index.html') {
        await page.locator('#wr-detail-main-img').click();
        assert.equal(await page.locator('#wr-product-image-viewer').getAttribute('open'), '');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#wr-product-image-viewer').getAttribute('open'), null);
        await page.getByRole('link', { name: 'Ask about this product' }).click();
        assert.match(page.url(), /productId=rope/);
      }
      if (route === 'contact/index.html') {
        assert.equal(await page.locator('#inquiry button[type=submit]').isDisabled(), false);
        await page.screenshot({ path: output + `/contact-${width}.png`, fullPage: true });
      }
      results.push({ width, route, ...metrics });
    }
    await page.goto(origin + '/en/contact/index.html?productId=rope');
    let payload;
    await page.route('**/inquiry', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.locator('[name=name]').fill('QA visitor');
    await page.locator('[name=email]').fill('qa@example.test');
    await page.locator('[name=message]').fill('Please tell me about this product.');
    await page.locator('button[type=submit]').click();
    await page.waitForFunction(() =>
      document.querySelector('.form-status')?.textContent?.includes('Thank'),
    );
    assert.equal(payload.productId, 'rope');
    assert.equal(payload.email, 'qa@example.test');
    await page.goto(origin + '/en/catalog/index.html');
    await page.locator('[data-gb-search]').fill('missing-product');
    assert.equal(await page.locator('[data-gb-product]:visible').count(), 0);
    assert.equal(await page.locator('[data-gb-empty]').isVisible(), true);
    await page.locator('[data-gb-search]').fill('');
    assert.equal(await page.locator('[data-gb-product]:visible').count(), 1);
    if (width < 768) {
      await page.locator('[data-gb-menu] summary').click();
      assert.equal(await page.locator('[data-gb-menu]').getAttribute('open'), '');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('[data-gb-menu]').getAttribute('open'), null);
    }
    await page.goto(origin + '/en/about/index.html');
    await page.locator('.gb-faq summary').first().click();
    assert.equal(await page.locator('.gb-faq details').first().getAttribute('open'), '');
    await page.goto(origin + '/__demo/home');
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'));
      await document.fonts.ready;
      await Promise.all(
        [...document.images].filter((i) => i.getAttribute('src')).map((i) => i.decode()),
      );
    });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
    );
    await page.screenshot({ path: output + `/demo-${width}.png`, fullPage: true });
    await page.goto(origin + '/__preview/contact');
    assert.equal(await page.locator('#inquiry button[type=submit]').isDisabled(), true);
    assert.deepEqual(errors, []);
    await page.close();
  }
  await writeFile(output + '/report.json', JSON.stringify(results, null, 2));
  console.log(
    `Verified ${results.length} desktop/mobile pages, navigation, search, mobile menu, FAQ, fonts and disabled preview form.`,
  );
} finally {
  await browser?.close();
  await new Promise((r) => server?.close(r));
}
