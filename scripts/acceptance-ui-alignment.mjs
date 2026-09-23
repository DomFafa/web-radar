import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';

// Run against a local test worker only; no production accounts or paid providers.
const origin = process.env.UI_TEST_ORIGIN || 'http://127.0.0.1:8790';
assert.equal(new URL(origin).hostname, '127.0.0.1');
assert.equal((await (await fetch(origin + '/api/config')).json()).testMode, true);
const artifact = 'artifacts/ui-alignment/review';
await mkdir(artifact, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
let parentServer;
const errors = [],
  checks = [];
page.on('pageerror', (error) => errors.push(error.message));
const steps = ['资料与产品', '网站风格', '网站文案', '首页视频', '预览与发布'];
const capture = async (name) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${artifact}/${name}.png`, fullPage: false });
};
const noOverflow = async (target) =>
  assert.ok(await target.locator('html').evaluate((el) => el.scrollWidth <= innerWidth + 1));
try {
  await page.goto(origin+'/?view=projects');
  await capture('login');
  await page.getByRole('button', { name: '项目创建者', exact: true }).click();
  await expect(page.getByRole('heading', { name: '网站项目' })).toBeVisible();
  await expect(page.locator('.loading-area')).toHaveCount(0);
  await capture('projects-desktop');
  await page
    .getByRole('group', { name: '按发布状态筛选' })
    .getByRole('button', { name: /^已下线/ })
    .click();
  await expect(page.getByRole('heading', { name: '没有符合条件的网站' })).toBeVisible();
  await page.getByRole('button', { name: '清除筛选' }).click();
  await page.getByRole('button', { name: '创建网站', exact: true }).click();
  const name = 'UI workflow ' + Date.now();
  await page.getByLabel('项目名称').fill(name);
  await page.getByRole('button', { name: '创建并开始' }).click();
  const nav = page.getByRole('navigation', { name: '网站编辑步骤' });
  await expect(nav.getByRole('button')).toHaveCount(5);
  assert.deepEqual(await nav.locator('button > span:nth-child(2)').allTextContents(), steps);
  await expect(
    page
      .getByRole('navigation', { name: '网站管理', exact: true })
      .getByRole('button', { name: '客户询盘' }),
  ).toBeVisible();
  await page.getByLabel('公司英文名称').fill('Workflow test company');
  await page.getByLabel('联系邮箱', { exact: false }).fill('invalid-email');
  await page.getByLabel('联系人英文名').fill('Sam');
  await page.getByRole('button', { name: '选择网站风格', exact: true }).click();
  await expect(page.locator('.editor-main > .section-title h2')).toHaveText('网站风格');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await capture('style-desktop');
  await page.getByRole('button', { name: '编辑网站文案', exact: true }).click();
  await expect(page.locator('.editor-main > .section-title h2')).toHaveText('网站文案');
  await page.getByRole('button', { name: '准备首页视频', exact: true }).click();
  await expect(page.locator('.editor-main > .section-title h2')).toHaveText('首页视频');
  await capture('video-desktop');
  await page
    .locator('.step-footer')
    .getByRole('button', { name: '预览与发布', exact: true })
    .click();
  await expect(page.getByRole('button', { name: '发布网站', exact: true })).toBeDisabled();
  const companyCheck = page
    .locator('.publish-checklist button')
    .filter({ hasText: '公司与联系资料' });
  await expect(companyCheck).toContainText('去完善');
  await capture('publish-desktop');
  await companyCheck.click();
  await expect(page.getByLabel('联系邮箱', { exact: false })).toHaveValue('invalid-email');
  await page.getByLabel('联系邮箱', { exact: false }).fill('sales@example.test');
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await capture('editor-desktop');
  checks.push(
    'five ordered preparation steps; inquiry management separate; footer navigation resets scroll; checklist returns to missing source fields; save persists',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (let index = 0; index < steps.length; index++) {
    await nav.getByRole('button').nth(index).click();
    await noOverflow(page);
    await expect(page.locator('.save-state')).toBeVisible();
    await expect(page.locator('.editor-project-name')).toBeVisible();
    await expect(page.locator('.quota-card')).toBeVisible();
    const fonts = await page
      .locator('.editor-main input:not([type=checkbox], [type=radio], [type=color])')
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).fontSize)));
    assert.ok(fonts.every((size) => size >= 13));
    await capture(`mobile-${index + 1}`);
  }
  await page.getByRole('button', { name: '返回网站列表' }).click();
  await page.getByLabel('搜索网站').fill(name);
  await expect(page.locator('.project-card')).toHaveCount(1);
  await noOverflow(page);
  await capture('projects-mobile');
  await page.locator('.project-card').click();
  await expect(page.getByLabel('公司英文名称')).toHaveValue('Workflow test company');
  checks.push(
    '390px all five steps and project list without horizontal overflow; readable form text; status and name filters; saved project reopens at missing step',
  );

  // Isolated parent fixture supplies a test session at the handoff boundary.
  const session = await (
    await fetch(origin + '/api/auth/test-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identity: 'owner' }),
    })
  ).json();
  const parent = 'http://127.0.0.1:4189';
  parentServer = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      `<!doctype html><body style="margin:0"><iframe title="Web Radar" style="border:0;width:100%;height:100vh" src="${origin}/embed/product-radar?parentOrigin=${encodeURIComponent(parent)}"></iframe><script>addEventListener('message',e=>{if(e.origin===${JSON.stringify(origin)}&&e.data.type==='web-radar:ready')e.source.postMessage({type:'product-radar:handoff',protocolVersion:1,code:'local-ui-review',requestId:'local-ui-review'},e.origin)})</script>`,
    );
  });
  await new Promise((resolve, reject) => {
    parentServer.once('error', reject);
    parentServer.listen(4189, '127.0.0.1', resolve);
  });
  await page.route(origin + '/api/integrations/product-radar/exchange', (route) =>
    route.fulfill({ json: session }),
  );
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(parent + '/ui-alignment-fixture');
  const frame = page.frameLocator('iframe');
  await expect(frame.getByRole('heading', { name: '网站项目' })).toBeVisible();
  await frame.getByLabel('搜索网站').fill(name);
  await frame.locator('.project-card').click();
  await expect(frame.getByLabel('公司英文名称')).toHaveValue('Workflow test company');
  await expect(frame.locator('.editor-owner')).toBeHidden();
  await expect(frame.locator('.quota-card')).toBeVisible();
  assert.equal(
    await frame.locator('.editor-sidebar').evaluate((el) => getComputedStyle(el).position),
    'static',
  );
  await noOverflow(frame);
  await capture('embedded-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(frame);
  await capture('embedded-mobile');
  checks.push(
    'embedded workbench uses horizontal steps, hides duplicate account chrome, preserves quota display; desktop and mobile render in a local parent fixture',
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${artifact}/result.json`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        checks,
        errors,
        mode: 'local test worker; simulated Product Radar handoff only',
      },
      null,
      2,
    ),
  );
  console.log(checks.join('\n'));
} catch (error) {
  await capture('failure').catch(() => {});
  throw error;
} finally {
  await browser.close();
  if (parentServer?.listening) await new Promise((resolve) => parentServer.close(resolve));
}
