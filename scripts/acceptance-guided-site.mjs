import { chromium, expect as baseExpect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const expect = baseExpect.configure({ timeout: 30000 });
const origin = process.env.STATIC_TEST_ORIGIN || 'http://127.0.0.1:8791';
assert.equal(new URL(origin).hostname, '127.0.0.1');
assert.equal((await (await fetch(origin + '/api/config')).json()).testMode, true);
const login = async (identity) =>
  (
    await fetch(origin + '/api/auth/test-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity }),
    })
  ).json();
const owner = await login('owner'),
  platform = await login('platform');
assert.equal(
  (
    await fetch(`${origin}/api/admin/quotas/${owner.principal.userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${platform.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageLimit: 200, videoLimit: 0 }),
    })
  ).status,
  200,
);
const dir = 'artifacts/guided-site/browser';
await mkdir(dir, { recursive: true });
const fixtureSource = await readFile('src/worker/providers/fixture-data.ts', 'utf8');
const productImage = Buffer.from(
  fixtureSource.match(/testImageBase64\s*=\s*'([^']+)'/)[1],
  'base64',
);
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
  await page.getByLabel('项目名称').fill('Guided acceptance ' + Date.now());
  const createdResponse = page.waitForResponse(
    (response) =>
      response.url() === origin + '/api/projects' && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: '创建并开始' }).click();
  const { project: created } = await (await createdResponse).json();
  const nav = page.getByRole('navigation', { name: '网站编辑步骤' });
  await expect(nav.getByRole('button')).toHaveCount(5);
  assert.deepEqual(await nav.locator('button > span:nth-child(2)').allTextContents(), [
    '资料与产品',
    '需求沟通',
    '网站方案',
    '页面设计稿',
    '预览与发布',
  ]);
  await page.getByLabel('公司英文名称').fill('Guided Studio');
  await page.getByLabel('联系邮箱', { exact: false }).fill('acceptance@example.test');
  await page.getByLabel('联系人英文名').fill('Sam');
  await page.getByLabel('销售国家 / 市场').fill('United States');
  await page.getByLabel('第二语言').selectOption('de');
  await page.getByRole('button', { name: '手动添加产品', exact: true }).click();
  await page.getByLabel('产品英文名称').fill('Original product');
  await page
    .locator('.product-edit-card input[type=file]')
    .setInputFiles({ name: 'original-product.png', mimeType: 'image/png', buffer: productImage });
  await expect(page.getByText('素材已上传，请保存草稿或确认选用。', { exact: true })).toBeVisible();
  await nav.getByRole('button', { name: /需求沟通/ }).click();
  await page.getByRole('button', { name: '开始需求沟通', exact: true }).click();
  const choices = page.getByRole('radiogroup');
  await expect(choices).toHaveCount(1);
  await expect(choices.getByRole('radio')).toHaveCount(5);
  await expect(page.getByLabel('你的回答', { exact: false })).toHaveCount(0);
  await expect(choices.locator('label').last()).toHaveText('都不是，我要自定义');
  await shot('question-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await choices.getByRole('radio', { name: '都不是，我要自定义', exact: true }).check();
  await page
    .getByLabel('你的回答', { exact: false })
    .fill('面向进口商和批发采购，展示原产品，保留品牌。');
  await shot('question-custom-mobile');
  await page.getByRole('button', { name: '提交回答并继续', exact: true }).click();
  await expect(page.getByRole('button', { name: '检查网站方案', exact: true })).toBeEnabled();
  await expect(page.getByRole('radiogroup')).toHaveCount(0);
  await expect(page.locator('.consultation-history')).toContainText('面向进口商和批发采购');
  checks.push(
    'uploaded original image; one question, four model choices plus exact custom fifth; custom text persisted; mobile without overflow',
  );
  await page.getByRole('button', { name: '检查网站方案', exact: true }).click();
  await expect(page.locator('.brief-pages article')).toHaveCount(6);
  await expect(page.locator('.brief-pages')).toContainText('批发合作');
  await expect(page.getByRole('button', { name: '准备页面设计稿', exact: true })).toBeDisabled();
  await shot('brief-mobile');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: '确认网站方案', exact: true }).click();
  await expect(page.getByRole('button', { name: '网站方案已确认', exact: true })).toBeVisible();
  const acceptedResponse = await fetch(`${origin}/api/projects/${created.id}`, {
    headers: { Authorization: `Bearer ${owner.token}` },
  });
  assert.equal(acceptedResponse.status, 200);
  const acceptedDraft = (await acceptedResponse.json()).project.draft;
  const approvedPages = acceptedDraft.consultation.brief.pages;
  const pageContent = (type, lang) =>
    approvedPages.find((entry) => entry.id === type).content[lang];
  await writeFile(
    `${dir}/approved-fixture.json`,
    JSON.stringify({ projectId: created.id, draft: acceptedDraft }, null, 2),
  );
  await shot('brief-desktop');
  await page.getByRole('button', { name: '准备页面设计稿', exact: true }).click();
  const home = page.locator('.page-design-home');
  await expect(page.getByRole('button', { name: /生成缺少的页面/ })).toBeDisabled();
  await home.getByRole('button', { name: '生成设计稿 · 1 张', exact: true }).click();
  await expect(home.locator('img')).toBeVisible();
  await expect(page.getByRole('button', { name: /生成缺少的页面/ })).toBeDisabled();
  await home.getByRole('button', { name: '确认首页风格', exact: true }).click();
  await page.getByRole('button', { name: /生成缺少的页面/ }).click();
  await expect(page.locator('.page-design-card img')).toHaveCount(6);
  await page.getByRole('button', { name: '确认 6 张设计稿', exact: true }).click();
  await expect(page.getByRole('button', { name: '整组设计稿已确认', exact: true })).toBeVisible();
  await shot('six-designs');
  checks.push(
    'customer approved six-page brief; homepage approval gate; five remaining images and group confirmation',
  );
  await page.getByRole('button', { name: '生成与预览网站', exact: true }).click();
  await page.getByRole('button', { name: '从设计稿生成网站', exact: true }).click();
  await expect(page.getByRole('button', { name: '打开私有整站预览', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: '打开私有整站预览', exact: true }).click();
  const frame = page.frameLocator('iframe');
  const pages = ['home', 'catalog', 'detail', 'about', 'contact', 'extra-wholesale'];
  for (const lang of ['en', 'de']) {
    await page.getByLabel('预览语言').selectOption(lang);
    for (const type of pages) {
      await page.getByLabel('预览页面').selectOption(type);
      await expect(frame.locator('h1')).toHaveText(pageContent(type, lang).title);
      for (const section of pageContent(type, lang).sections) {
        await expect(frame.locator('main')).toContainText(section.heading);
        await expect(frame.locator('main')).toContainText(section.body);
      }
      await expect(frame.locator('[data-wr-headline]')).toHaveText(
        acceptedDraft.copy[lang].headline,
      );
      await expect(frame.locator('[data-wr-product-name]').first()).toHaveText(
        acceptedDraft.products[0].translations[lang].name,
      );
      await expect(frame.locator('nav [data-wr-page="extra-wholesale"]')).toHaveText(
        pageContent('extra-wholesale', lang).title,
      );
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
  await frame.locator('nav [data-wr-page=home]').click();
  await expect(frame.locator('h1')).toHaveText(pageContent('home', 'de').title);
  await frame.locator('nav [data-wr-page=extra-wholesale]').click();
  await expect(frame.locator('h1')).toHaveText(pageContent('extra-wholesale', 'de').title);
  await shot('extra-private-preview');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '发布网站', exact: true }).click();
  await page.getByRole('button', { name: '确认发布', exact: true }).click();
  await expect(page.getByText('当前发布版本', { exact: true })).toBeVisible();
  const publicUrl = await page.locator('.publication-hero a').getAttribute('href');
  const site = await browser.newPage();
  await site.goto(publicUrl);
  await expect(site.locator('nav [data-wr-page=extra-wholesale]')).toHaveText(
    pageContent('extra-wholesale', 'en').title,
  );
  await site.locator('nav [data-wr-page=extra-wholesale]').click();
  await expect(site.locator('h1')).toHaveText(pageContent('extra-wholesale', 'en').title);
  await site.close();
  checks.push(
    '12 private language/page previews with approved localized headings, sections, copy, product names and navigation; decoded original media; extra-page iframe navigation and local-test public route',
  );
  await nav.getByRole('button', { name: /网站方案/ }).click();
  await page
    .getByLabel('方案修改意见', { exact: false })
    .fill('请让首页更突出原产品，保留批发合作页面。');
  await page.getByRole('button', { name: '提交修改意见', exact: true }).click();
  await expect(page.getByRole('button', { name: '确认网站方案', exact: true })).toBeEnabled();
  await nav.getByRole('button', { name: /页面设计稿/ }).click();
  await expect(page.locator('.page-design-card img')).toHaveCount(0);
  await expect(home.getByRole('button', { name: '生成设计稿 · 1 张', exact: true })).toBeDisabled();
  checks.push('revised brief clears dependent images and requires new approval');
  assert.deepEqual(errors, []);
  await writeFile(
    `${dir}/result.json`,
    JSON.stringify(
      { checks, errors, mode: 'local fixtures only; no paid image or video calls' },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks, errors }));
} catch (error) {
  await shot('failure');
  throw error;
} finally {
  await browser.close();
}
