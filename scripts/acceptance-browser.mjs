import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:8788';
const config = await (await fetch(origin + '/api/config')).json();
assert.equal(config.testMode, true);
await mkdir('artifacts/browser', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
const page = await context.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const steps = [];
function record(step) {
  steps.push(step);
  console.log(step);
}
try {
  await page.goto(origin);
  await expect(page.getByText('本地测试环境', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/browser/login.png', fullPage: true });
  await page.getByRole('button', { name: '项目创建者', exact: true }).click();
  await page.getByRole('button', { name: '创建网站', exact: true }).click();
  await page.getByLabel('项目名称').fill('Browser Studio acceptance');
  await page.getByRole('button', { name: '创建并开始' }).click();
  await page.getByLabel('公司英文名称').fill('Browser Studio');
  await page.getByLabel('联系邮箱', { exact: false }).fill('browser@example.test');
  await page.getByLabel('联系人英文名').fill('Browser Tester');
  await page.getByLabel('公司简介与已知事实').fill('A fictional local browser acceptance company.');
  await page.getByLabel('销售国家 / 市场').fill('United States');
  await page.getByLabel('第二语言').selectOption('de');
  await page.getByRole('button', { name: '从 Product Radar 导入' }).click();
  await page.locator('.source-select-item input[type=checkbox]').check();
  await page.getByRole('button', { name: '导入所选产品' }).click();
  await expect(page.getByLabel('产品英文名称')).toHaveValue('测试木制平衡积木');
  record('browser create/company/source import');
  if (await page.getByRole('button', { name: '保存草稿', exact: true }).isEnabled())
    await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.screenshot({ path: 'artifacts/browser/editor-basics.png', fullPage: true });
  await page
    .getByRole('navigation', { name: '网站编辑步骤' })
    .getByRole('button', { name: '首页视频' })
    .click();
  await page.getByRole('button', { name: '12 秒 · 4 张分镜', exact: true }).click();
  await page
    .getByLabel('创作方向')
    .fill('Keep product identity; local test only; cinematic detail and a smooth loop.');
  await page.getByRole('button', { name: '生成视频脚本', exact: true }).click();
  await expect(page.getByLabel('可编辑的视频脚本')).toHaveValue(/LOCAL TEST/);
  await page.getByRole('button', { name: '保存并确认脚本' }).click();
  await page.getByRole('button', { name: '生成缺少的分镜' }).click();
  await expect(page.locator('.scene-cover img')).toHaveCount(4, { timeout: 30000 });
  await page.getByRole('button', { name: '确认当前整组分镜' }).click();
  await page.getByRole('button', { name: '生成 12 秒视频 · 1 次', exact: true }).click();
  await expect(page.locator('.video-result video')).toHaveCount(1, { timeout: 30000 });
  const video = page.locator('.video-result video');
  await video.evaluate((v) => v.play());
  await expect.poll(() => video.evaluate((v) => v.currentTime)).toBeGreaterThan(0);
  await page.getByRole('button', { name: '已预览，确认选用' }).click();
  record('script approval/four frames/12-second saved playable video');
  await page.screenshot({ path: 'artifacts/browser/editor-video.png', fullPage: true });
  await page
    .getByRole('navigation', { name: '网站编辑步骤' })
    .getByRole('button', { name: '网站文案' })
    .click();
  await page.getByRole('button', { name: '生成网站文案与译文' }).click();
  await expect(page.getByLabel('首页主标题').first()).toHaveValue('Browser Studio');
  record('editable English/German website and product copy');
  await page.getByRole('button', { name: '整站预览', exact: true }).click();
  await expect(page.locator('iframe')).toBeVisible();
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('h1')).toContainText('Browser Studio');
  await page.screenshot({ path: 'artifacts/browser/private-preview.png', fullPage: true });
  record('authenticated private full-site preview');
  // Preview toolbar controls are checked by accessible names after implementation; closing the modal keeps draft state.
  await page.getByRole('button', { name: /关闭/ }).last().click();
  await page
    .getByRole('navigation', { name: '网站编辑步骤' })
    .getByRole('button', { name: '预览与发布' })
    .click();
  await page.getByRole('button', { name: '发布网站', exact: true }).click();
  await page.getByRole('button', { name: '确认发布', exact: true }).click();
  await expect(page.getByText('当前发布版本', { exact: true })).toBeVisible();
  record('explicit local test publish from browser');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/browser/editor-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  record('390px editor no horizontal overflow');
  assert.deepEqual(errors, []);
  await writeFile(
    'artifacts/browser/result.json',
    JSON.stringify(
      { at: new Date().toISOString(), steps, errors, mode: 'explicit local test only' },
      null,
      2,
    ),
  );
} catch (error) {
  await page.screenshot({ path: 'artifacts/browser/failure.png', fullPage: true }).catch(() => {});
  await writeFile(
    'artifacts/browser/failure.json',
    JSON.stringify({ error: String(error), steps, errors }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
