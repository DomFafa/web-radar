const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/Users/world/.gemini/antigravity-ide/brain/5475d162-acb6-4727-9666-e9876a722bc5';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // 1. Visit homepage & log in
  await page.goto('http://127.0.0.1:8788/', { waitUntil: 'networkidle' });
  const loginBtn = page.locator('button:has-text("项目创建者")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForLoadState('networkidle');
  }

  // 2. Open project "senseng"
  await page.locator('.project-card:has-text("senseng")').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Open Preview Modal
  await page.locator('button:has-text("整站预览")').first().click();
  await page.waitForTimeout(2000);

  // Get preview iframe
  const iframeHandle = await page.$('iframe');
  const frame = await iframeHandle.contentFrame();

  // Test Product Detail Page
  console.log('Navigating to detail page...');
  await frame.goto('http://127.0.0.1:8788/api/projects/e0a43e38-eb54-4a91-948e-1ccc1e3cfad6/preview/en/products/senseng-1/index.html');
  await page.waitForTimeout(2000);
  const detailScreenshot = path.join(ARTIFACTS_DIR, 'verify_06_senseng_detail.png');
  await page.screenshot({ path: detailScreenshot, fullPage: false });
  console.log('Saved Detail screenshot:', detailScreenshot);

  // Test About Us Page
  console.log('Navigating to about page...');
  await frame.goto('http://127.0.0.1:8788/api/projects/e0a43e38-eb54-4a91-948e-1ccc1e3cfad6/preview/en/about/index.html');
  await page.waitForTimeout(2000);
  const aboutScreenshot = path.join(ARTIFACTS_DIR, 'verify_07_senseng_about.png');
  await page.screenshot({ path: aboutScreenshot, fullPage: false });
  console.log('Saved About screenshot:', aboutScreenshot);

  // Test Contact Page
  console.log('Navigating to contact page...');
  await frame.goto('http://127.0.0.1:8788/api/projects/e0a43e38-eb54-4a91-948e-1ccc1e3cfad6/preview/en/contact/index.html');
  await page.waitForTimeout(2000);
  const contactScreenshot = path.join(ARTIFACTS_DIR, 'verify_08_senseng_contact.png');
  await page.screenshot({ path: contactScreenshot, fullPage: false });
  console.log('Saved Contact screenshot:', contactScreenshot);

  await browser.close();
}

main().catch(console.error);
