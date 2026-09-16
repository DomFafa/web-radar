const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/Users/world/.gemini/antigravity-ide/brain/5475d162-acb6-4727-9666-e9876a722bc5';

async function main() {
  console.log('Launching browser to capture all 5 Senseng pages...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Visit homepage & log in
  await page.goto('http://127.0.0.1:8788/', { waitUntil: 'networkidle' });
  const loginBtn = page.locator('button:has-text("项目创建者")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForLoadState('networkidle');
  }

  // 2. Open project "senseng"
  console.log('Opening project senseng...');
  await page.locator('.project-card:has-text("senseng")').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Open Preview Modal via 整站预览 button
  console.log('Opening 整站预览 modal...');
  await page.locator('button:has-text("整站预览")').first().click();
  await page.waitForSelector('select[aria-label="预览页面"]', { timeout: 10000 });
  await page.waitForTimeout(1500);

  const pageSelect = page.locator('select[aria-label="预览页面"]');

  // Page 1: Home (首页)
  console.log('1. Capturing Home page...');
  await pageSelect.selectOption('home');
  await page.waitForTimeout(1500);
  const homeShot = path.join(ARTIFACTS_DIR, 'verify_04_senseng_home.png');
  await page.screenshot({ path: homeShot });
  console.log('Saved Home screenshot:', homeShot);

  // Page 2: Catalog (产品页)
  console.log('2. Capturing Catalog page...');
  await pageSelect.selectOption('catalog');
  await page.waitForTimeout(1500);
  const catalogShot = path.join(ARTIFACTS_DIR, 'verify_05_senseng_catalog.png');
  await page.screenshot({ path: catalogShot });
  console.log('Saved Catalog screenshot:', catalogShot);

  // Page 3: Detail (产品详情页)
  console.log('3. Capturing Detail page...');
  await pageSelect.selectOption('detail');
  await page.waitForTimeout(1500);
  const detailShot = path.join(ARTIFACTS_DIR, 'verify_06_senseng_detail.png');
  await page.screenshot({ path: detailShot });
  console.log('Saved Detail screenshot:', detailShot);

  // Page 4: About (关于我们)
  console.log('4. Capturing About Us page...');
  await pageSelect.selectOption('about');
  await page.waitForTimeout(1500);
  const aboutShot = path.join(ARTIFACTS_DIR, 'verify_07_senseng_about.png');
  await page.screenshot({ path: aboutShot });
  console.log('Saved About screenshot:', aboutShot);

  // Page 5: Contact (联系我们)
  console.log('5. Capturing Contact page...');
  await pageSelect.selectOption('contact');
  await page.waitForTimeout(1500);
  const contactShot = path.join(ARTIFACTS_DIR, 'verify_08_senseng_contact.png');
  await page.screenshot({ path: contactShot });
  console.log('Saved Contact screenshot:', contactShot);

  console.log('All 5 Senseng pages captured successfully!');
  await browser.close();
}

main().catch(console.error);
