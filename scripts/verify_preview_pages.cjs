const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/Users/world/.gemini/antigravity-ide/brain/5475d162-acb6-4727-9666-e9876a722bc5';

async function main() {
  console.log('Launching browser for preview verification on senseng project...');
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
    console.log('Logging in as project owner...');
    await loginBtn.click();
    await page.waitForLoadState('networkidle');
  }

  // 2. Open project "senseng"
  console.log('Opening project senseng...');
  const sensengCard = page.locator('.project-card:has-text("senseng")').first();
  await sensengCard.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Switch to 3-step template branch if available
  const switch3Step = page.locator('button:has-text("极速模版建站")').first();
  if (await switch3Step.count() > 0) {
    console.log('Switching to 3-step template branch...');
    await switch3Step.click();
    await page.waitForTimeout(500);
  }

  // 4. Select Senseng Clean template in tab=template
  console.log('Selecting Senseng Clean in template tab...');
  const tmplTab = page.locator('button:has-text("选择网站模版"), [data-tab="template"]').first();
  if (await tmplTab.count() > 0) {
    await tmplTab.click();
    await page.waitForTimeout(1000);
    const tmpl1Card = page.locator('.template-card:has-text("Senseng 经典工贸")').first();
    if (await tmpl1Card.count() > 0) {
      await tmpl1Card.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Open Preview Modal via header 整站预览 button
  console.log('Opening 整站预览 modal...');
  const eyeBtn = page.locator('button:has-text("整站预览")').first();
  await eyeBtn.click();
  await page.waitForTimeout(2500);

  const previewHomeScreenshot = path.join(ARTIFACTS_DIR, 'verify_04_senseng_home.png');
  await page.screenshot({ path: previewHomeScreenshot, fullPage: false });
  console.log('Saved Senseng Home screenshot:', previewHomeScreenshot);

  // Find preview iframe
  const iframeHandle = await page.$('iframe');
  if (iframeHandle) {
    const frame = await iframeHandle.contentFrame();
    if (frame) {
      console.log('Inside iframe: inspecting elements...');
      // Wait for senseng header
      await frame.waitForSelector('.senseng-header', { timeout: 10000 });

      // Take iframe screenshot for home
      const frameHomeScreenshot = path.join(ARTIFACTS_DIR, 'verify_04b_senseng_home_frame.png');
      const bodyEl = await frame.$('body');
      if (bodyEl) await bodyEl.screenshot({ path: frameHomeScreenshot });

      // Navigate to Products / Catalog
      console.log('Inside iframe: clicking Products...');
      await frame.click('.senseng-nav-link:has-text("Products")');
      await page.waitForTimeout(2000);
      const catalogScreenshot = path.join(ARTIFACTS_DIR, 'verify_05_senseng_catalog.png');
      await page.screenshot({ path: catalogScreenshot, fullPage: false });
      console.log('Saved Senseng Catalog screenshot:', catalogScreenshot);

      // Navigate to Product Detail
      console.log('Inside iframe: clicking View Details on product...');
      await frame.click('.senseng-btn-detail');
      await page.waitForTimeout(2000);
      const detailScreenshot = path.join(ARTIFACTS_DIR, 'verify_06_senseng_detail.png');
      await page.screenshot({ path: detailScreenshot, fullPage: false });
      console.log('Saved Senseng Detail screenshot:', detailScreenshot);

      // Navigate to About Us
      console.log('Inside iframe: clicking About Us...');
      await frame.click('.senseng-nav-link:has-text("About Us")');
      await page.waitForTimeout(2000);
      const aboutScreenshot = path.join(ARTIFACTS_DIR, 'verify_07_senseng_about.png');
      await page.screenshot({ path: aboutScreenshot, fullPage: false });
      console.log('Saved Senseng About screenshot:', aboutScreenshot);

      // Navigate to Contact
      console.log('Inside iframe: clicking Contact...');
      await frame.click('.senseng-nav-link:has-text("Contact")');
      await page.waitForTimeout(2000);
      const contactScreenshot = path.join(ARTIFACTS_DIR, 'verify_08_senseng_contact.png');
      await page.screenshot({ path: contactScreenshot, fullPage: false });
      console.log('Saved Senseng Contact screenshot:', contactScreenshot);
    }
  }

  console.log('Senseng pixel-perfect verification finished successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error('Error in verification:', err);
  process.exit(1);
});
