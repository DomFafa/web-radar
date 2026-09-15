import { chromium, expect as baseExpect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const expect = baseExpect.configure({ timeout: 30000 });
const origin = process.env.STATIC_TEST_ORIGIN || 'http://127.0.0.1:8791';
assert.equal(new URL(origin).hostname, '127.0.0.1');
assert.equal((await (await fetch(origin + '/api/config')).json()).testMode, true);
const testLogin = async (identity) =>
  await (
    await fetch(origin + '/api/auth/test-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity }),
    })
  ).json();
const owner = await testLogin('owner'),
  platform = await testLogin('platform');
const quotaResponse = await fetch(`${origin}/api/admin/quotas/${owner.principal.userId}`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${platform.token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageLimit: 100, videoLimit: 0 }),
});
assert.equal(quotaResponse.status, 200);
const dir = 'artifacts/static-site/browser';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(30000);
const errors = [],
  checks = [];
page.on('pageerror', (error) => errors.push(error.message));
const shot = (name) => page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
try {
  await page.goto(origin);
  await page.getByRole('button', { name: '项目创建者', exact: true }).click();
  await page.getByRole('button', { name: '创建网站', exact: true }).click();
  await page.getByLabel('项目名称').fill('Static showcase acceptance ' + Date.now());
  await page.getByRole('button', { name: '创建并开始' }).click();
  const nav = page.getByRole('navigation', { name: '网站编辑步骤' });
  await expect(nav.getByRole('button')).toHaveCount(5);
  assert.deepEqual(await nav.locator('button > span:nth-child(2)').allTextContents(), [
    '资料与产品',
    '网站风格',
    '网站文案',
    '页面设计稿',
    '预览与发布',
  ]);
  await page.getByLabel('公司英文名称').fill('Static Studio');
  await page.getByLabel('联系邮箱', { exact: false }).fill('acceptance@example.test');
  await page.getByLabel('联系人英文名').fill('Sam');
  await page.getByLabel('销售国家 / 市场').fill('United States');
  await page.getByLabel('第二语言').selectOption('de');
  await page.getByRole('button', { name: '从 Product Radar 导入' }).click();
  await page.locator('.source-select-item input[type=checkbox]').check();
  await page.getByRole('button', { name: '导入所选产品' }).click();
  await expect(page.getByLabel('产品英文名称')).toHaveValue('测试木制平衡积木');
  await nav.getByRole('button', { name: /网站文案/ }).click();
  await page.getByRole('button', { name: '生成网站文案与译文', exact: true }).click();
  await expect(page.locator('.job-row').filter({ hasText: '文案与译文' })).toContainText('已完成');
  await page.getByRole('button', { name: '准备页面设计稿', exact: true }).click();
  await expect(page.getByRole('button', { name: /生成缺少的页面/ })).toBeDisabled();
  const home = page.locator('.page-design-home');
  await home.getByRole('button', { name: '生成设计稿 · 1 张', exact: true }).click();
  await expect(home.locator('img')).toBeVisible();
  await expect(page.getByRole('button', { name: /生成缺少的页面/ })).toBeDisabled();
  await home.getByRole('button', { name: '确认首页风格', exact: true }).click();
  await page.getByRole('button', { name: /生成缺少的页面/ }).click();
  await expect(page.locator('.page-design-card img')).toHaveCount(5);
  await expect(page.getByRole('button', { name: '确认五张设计稿', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: '确认五张设计稿', exact: true }).click();
  await expect(page.getByRole('button', { name: '整组设计稿已确认', exact: true })).toBeVisible();
  await shot('five-designs-desktop');
  checks.push(
    'existing five-step UI, homepage confirmation gate, five image jobs, full-group confirmation',
  );
  await page.getByRole('button', { name: '生成与预览网站', exact: true }).click();
  await expect(page.getByRole('button', { name: '发布网站', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '从设计稿生成网站', exact: true }).click();
  await expect(page.getByRole('button', { name: '打开私有整站预览', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: '打开私有整站预览', exact: true }).click();
  const frame = page.frameLocator('iframe');
  for (const lang of ['en', 'de']) {
    await page.getByLabel('预览语言').selectOption(lang);
    for (const type of ['home', 'catalog', 'detail', 'about', 'contact']) {
      await page.getByLabel('预览页面').selectOption(type);
      await expect(frame.locator('h1')).toContainText(`Static Studio · ${type}`);
      await expect
        .poll(() =>
          frame
            .locator('img')
            .evaluateAll((images) =>
              images.every((image) => image.complete && image.naturalWidth > 0),
            ),
        )
        .toBe(true);
    }
  }
  await shot('private-preview');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '发布网站', exact: true }).click();
  await page.getByRole('button', { name: '确认发布', exact: true }).click();
  await expect(page.getByText('当前发布版本', { exact: true })).toBeVisible();
  const publicUrl = await page.locator('.publication-hero a').getAttribute('href');
  assert.ok(publicUrl);
  const site = await browser.newPage();
  await site.goto(publicUrl);
  await expect(site.locator('h1')).toContainText('Static Studio');
  await site.getByRole('link', { name: 'catalog', exact: true }).click();
  await expect(site.locator('h1')).toContainText('catalog');
  await expect
    .poll(() =>
      site
        .locator('img')
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
    )
    .toBe(true);
  await site.close();
  checks.push(
    'static build without video, ten private language/page routes with decoded original images, public catalog navigation and media',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await nav.getByRole('button', { name: /页面设计稿/ }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await shot('five-designs-mobile');
  await page.getByLabel('网站设计要求', { exact: false }).fill('Updated design direction');
  await expect(page.getByRole('button', { name: /生成缺少的页面/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: '生成与预览网站', exact: true })).toBeDisabled();
  await nav.getByRole('button', { name: /预览与发布/ }).click();
  await expect(page.getByRole('button', { name: '发布当前草稿', exact: true })).toBeDisabled();
  checks.push(
    '390px design layout without overflow; local edits immediately invalidate design and publication readiness',
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${dir}/result.json`,
    JSON.stringify({ checks, errors, mode: 'local fixtures only' }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors }));
} catch (error) {
  await shot('failure');
  throw error;
} finally {
  await browser.close();
}
