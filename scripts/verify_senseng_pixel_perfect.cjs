const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const artifactDir = '/Users/world/.gemini/antigravity-ide/brain/5475d162-acb6-4727-9666-e9876a722bc5';
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const context = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  // Part 1: Verify AutoSite/workspaces/web-senseng/index.html
  const sensengPath = 'file://' + path.resolve('/Volumes/DAIDAI/AutomationProject/AutoSite/workspaces/web-senseng/index.html');
  await page.goto(sensengPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Home
  await page.screenshot({ path: path.join(artifactDir, 'render_senseng_home.png') });
  console.log('Captured render_senseng_home.png');

  // 2. Products / Catalog
  await page.click('[data-nav="products"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactDir, 'render_senseng_catalog.png') });
  console.log('Captured render_senseng_catalog.png');

  // 3. Detail
  await page.click('#page-products [data-product-btn="1"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactDir, 'render_senseng_detail.png') });
  console.log('Captured render_senseng_detail.png');

  // 4. About
  await page.click('[data-nav="about"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactDir, 'render_senseng_about.png') });
  console.log('Captured render_senseng_about.png');

  // 5. Contact
  await page.click('[data-nav="contact"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactDir, 'render_senseng_contact.png') });
  console.log('Captured render_senseng_contact.png');

  // Part 2: Verify in Web Radar Preview
  console.log('Now capturing Web-Radar site preview...');
  await page.goto('http://127.0.0.1:8788/?tab=basics&project=e0a43e38-eb54-4a91-948e-1ccc1e3cfad6', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Site Preview button
  const previewBtn = await page.locator('button:has-text("预览"), button:has-text("Preview")').first();
  if (await previewBtn.isVisible()) {
    await previewBtn.click();
    await page.waitForTimeout(1200);

    const frameElement = await page.$('iframe');
    if (frameElement) {
      const frame = await frameElement.contentFrame();
      if (frame) {
        await page.waitForTimeout(1000);
        await frameElement.screenshot({ path: path.join(artifactDir, 'radar_preview_home.png') });
        console.log('Captured radar_preview_home.png');

        // Switch to Catalog in preview
        const pageSelect = await page.$('select[aria-label="页面选择"], select');
        // Or check header select
        const selects = await page.$$('select');
        for (const s of selects) {
          const options = await s.$$eval('option', opts => opts.map(o => o.value));
          if (options.includes('catalog')) {
            await s.selectOption('catalog');
            await page.waitForTimeout(1000);
            await frameElement.screenshot({ path: path.join(artifactDir, 'radar_preview_catalog.png') });
            console.log('Captured radar_preview_catalog.png');

            await s.selectOption('about');
            await page.waitForTimeout(1000);
            await frameElement.screenshot({ path: path.join(artifactDir, 'radar_preview_about.png') });
            console.log('Captured radar_preview_about.png');

            await s.selectOption('contact');
            await page.waitForTimeout(1000);
            await frameElement.screenshot({ path: path.join(artifactDir, 'radar_preview_contact.png') });
            console.log('Captured radar_preview_contact.png');
            break;
          }
        }
      }
    }
  }

  await browser.close();
  console.log('All captures complete!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
