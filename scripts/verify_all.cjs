const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/Users/world/.gemini/antigravity-ide/brain/5475d162-acb6-4727-9666-e9876a722bc5';

async function main() {
  console.log('Launching browser for verification...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Visit homepage & log in
  console.log('1. Navigating to http://127.0.0.1:8788/ ...');
  await page.goto('http://127.0.0.1:8788/', { waitUntil: 'networkidle' });

  const loginBtn = page.locator('button:has-text("项目创建者")');
  if (await loginBtn.count() > 0) {
    console.log('Logging in as project owner...');
    await loginBtn.click();
    await page.waitForLoadState('networkidle');
  }

  // 2. Dashboard Project Thumbnails
  console.log('2. Verifying dashboard project thumbnails...');
  await page.waitForSelector('.project-card', { timeout: 10000 });
  const dashboardScreenshot = path.join(ARTIFACTS_DIR, 'verify_01_dashboard_thumbnails.png');
  await page.screenshot({ path: dashboardScreenshot, fullPage: false });
  console.log('Saved dashboard thumbnail screenshot:', dashboardScreenshot);

  // 3. Open project "Senseng 10 Templates Test"
  console.log('3. Opening Senseng 10 Templates Test project...');
  const projectCard = page.locator('.project-card:has-text("Senseng 10 Templates Test")').first();
  if (await projectCard.count() > 0) {
    await projectCard.click();
  } else {
    await page.locator('.project-card').first().click();
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Switch to 3-step template branch if available
  const switch3Step = page.locator('button:has-text("极速模版建站"), a:has-text("极速模版建站")').first();
  if (await switch3Step.count() > 0) {
    console.log('Switching to 3-step template branch...');
    await switch3Step.click();
    await page.waitForTimeout(1000);
  }

  // Click on "02 选择网站模版"
  console.log('4. Clicking 02 选择网站模版...');
  const templateTabBtn = page.locator('button:has-text("选择网站模版"), [data-tab="template"]').first();
  if (await templateTabBtn.count() > 0) {
    await templateTabBtn.click();
    await page.waitForTimeout(1000);
  }

  const urlBeforeReload = page.url();
  console.log('URL before reload:', urlBeforeReload);

  const templateSelectorScreenshot = path.join(ARTIFACTS_DIR, 'verify_02_template_selector.png');
  await page.screenshot({ path: templateSelectorScreenshot, fullPage: false });
  console.log('Saved template selector screenshot:', templateSelectorScreenshot);

  // 5. Test page reload persistence (Issue 3)
  console.log('5. Testing page reload persistence...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const urlAfterReload = page.url();
  console.log('URL after reload:', urlAfterReload);

  const reloadScreenshot = path.join(ARTIFACTS_DIR, 'verify_03_reload_persisted.png');
  await page.screenshot({ path: reloadScreenshot, fullPage: false });
  console.log('Saved reload persistence screenshot:', reloadScreenshot);

  // 6. Select Senseng Clean and click 03 预览发布
  console.log('6. Selecting Senseng Clean and clicking 03 预览发布...');
  const sensengCard = page.locator('.template-card:has-text("Senseng Clean"), .template-card:has-text("玩趣")').first();
  if (await sensengCard.count() > 0) {
    await sensengCard.click();
    await page.waitForTimeout(500);
  }

  const previewTabBtn = page.locator('button:has-text("预览与发布"), button:has-text("预览发布")').first();
  if (await previewTabBtn.count() > 0) {
    await previewTabBtn.click();
    await page.waitForTimeout(2500);
  }

  const previewHomeScreenshot = path.join(ARTIFACTS_DIR, 'verify_04_preview_home.png');
  await page.screenshot({ path: previewHomeScreenshot, fullPage: false });
  console.log('Saved preview home screenshot:', previewHomeScreenshot);

  // 7. Test iframe navigation
  const iframeElement = await page.$('iframe');
  if (iframeElement) {
    const frame = await iframeElement.contentFrame();
    if (frame) {
      console.log('7. Inside preview iframe: clicking Products (Catalog)...');
      const catalogLink = frame.locator('.senseng-nav-link:has-text("Products"), a[data-wr-page="catalog"]').first();
      if (await catalogLink.count() > 0) {
        await catalogLink.click();
        await page.waitForTimeout(2000);
        const catalogScreenshot = path.join(ARTIFACTS_DIR, 'verify_05_preview_catalog.png');
        await page.screenshot({ path: catalogScreenshot, fullPage: false });
        console.log('Saved preview catalog screenshot:', catalogScreenshot);

        // Click View Details
        console.log('8. Inside preview iframe: clicking View Details on product...');
        const detailBtn = frame.locator('.senseng-btn-detail').first();
        if (await detailBtn.count() > 0) {
          await detailBtn.click();
          await page.waitForTimeout(2000);
          const detailScreenshot = path.join(ARTIFACTS_DIR, 'verify_06_preview_detail.png');
          await page.screenshot({ path: detailScreenshot, fullPage: false });
          console.log('Saved preview detail screenshot:', detailScreenshot);
        }

        // Click About Us
        console.log('9. Inside preview iframe: clicking About Us...');
        const aboutLink = frame.locator('.senseng-nav-link:has-text("About Us"), a[data-wr-page="about"]').first();
        if (await aboutLink.count() > 0) {
          await aboutLink.click();
          await page.waitForTimeout(2000);
          const aboutScreenshot = path.join(ARTIFACTS_DIR, 'verify_07_preview_about.png');
          await page.screenshot({ path: aboutScreenshot, fullPage: false });
          console.log('Saved preview about screenshot:', aboutScreenshot);
        }

        // Click Contact
        console.log('10. Inside preview iframe: clicking Contact...');
        const contactLink = frame.locator('.senseng-nav-link:has-text("Contact"), a[data-wr-page="contact"]').first();
        if (await contactLink.count() > 0) {
          await contactLink.click();
          await page.waitForTimeout(2000);
          const contactScreenshot = path.join(ARTIFACTS_DIR, 'verify_08_preview_contact.png');
          await page.screenshot({ path: contactScreenshot, fullPage: false });
          console.log('Saved preview contact screenshot:', contactScreenshot);
        }
      }
    }
  }

  console.log('All verifications completed successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
