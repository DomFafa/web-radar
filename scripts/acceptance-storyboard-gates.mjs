import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = 'http://127.0.0.1:8790';
assert.equal((await (await fetch(origin + '/api/config')).json()).testMode, true);
const json = async (path, body, token, method = 'POST') => {
  const r = await fetch(origin + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await r.json();
  assert.ok(r.ok, `${path}: ${r.status}`);
  return result;
};
const owner = await json('/api/auth/test-login', { identity: 'owner' });
const platform = await json('/api/auth/test-login', { identity: 'platform' });
const quota = async (available) => {
  const d = await json('/api/projects/' + project.id, undefined, owner.token, 'GET');
  await json(
    '/api/admin/quotas/test-owner',
    {
      unlimited: false,
      imageLimit: d.quota.imageUsed + d.quota.imageReserved + available,
      videoLimit: d.quota.videoLimit,
    },
    platform.token,
    'PUT',
  );
};
let { project } = await json(
  '/api/projects',
  { name: 'Storyboard gate ' + Date.now(), requestId: crypto.randomUUID() },
  owner.token,
);
project.draft.products = [
  {
    id: 'test-product',
    name: 'Test product',
    description: 'Local fixture',
    material: 'Wood',
    dimensions: '',
  },
];
project.draft.primaryProductId = 'test-product';
project.draft.script = 'Three shots of the local test product.';
project.draft.scenes = [1, 2, 3].map((i) => ({
  id: 'scene-' + i,
  description: 'Local fixture shot ' + i,
  revision: 0,
}));
({ project } = await json(
  '/api/projects/' + project.id,
  { expectedVersion: project.version, draft: project.draft },
  owner.token,
  'PUT',
));
await quota(3);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await mkdir('artifacts/storyboard-debug/browser', { recursive: true });
try {
  await page.goto(origin);
  await page.getByRole('button', { name: '项目创建者', exact: true }).click();
  await page.getByLabel('搜索网站').fill(project.name);
  await page.locator('.project-card').click();
  await page
    .getByRole('navigation', { name: '网站编辑步骤' })
    .getByRole('button', { name: '首页视频' })
    .click();
  await expect(page.getByRole('button', { name: '生成缺少的分镜', exact: true })).toBeDisabled();
  const singles = page.getByRole('button', { name: '生成此分镜 · 1 次', exact: true });
  await expect(singles).toHaveCount(3);
  for (const single of await singles.all()) await expect(single).toBeDisabled();
  await expect(
    page.getByText('当前脚本尚未确认。先检查脚本和镜头内容，再保存并确认脚本。', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '前往确认脚本' }).click();
  await page.getByRole('button', { name: '保存并确认脚本', exact: true }).click();
  await expect(page.getByRole('button', { name: '生成缺少的分镜', exact: true })).toBeEnabled();
  await quota(0);
  await expect(
    page.getByText('图片可用额度为 0。请联系平台管理员分配额度后再生成。', { exact: true }),
  ).toBeVisible({ timeout: 10000 });
  for (const single of await singles.all()) await expect(single).toBeDisabled();
  await page.locator('.storyboard-status').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/storyboard-debug/browser/no-quota.png' });
  await quota(1);
  await expect(
    page.getByText(
      '还缺 3 张分镜，整组生成需要 3 次图片额度，当前可用 1 次。可以先生成单张，或补充额度。',
      { exact: true },
    ),
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: '生成缺少的分镜', exact: true })).toBeDisabled();
  for (const single of await singles.all()) await expect(single).toBeEnabled();
  await quota(3);
  await expect(page.getByRole('button', { name: '生成缺少的分镜', exact: true })).toBeEnabled({
    timeout: 10000,
  });
  await page.getByRole('button', { name: '生成缺少的分镜', exact: true }).click();
  await expect(page.locator('.scene-cover img')).toHaveCount(3, { timeout: 30000 });
  await expect(page.getByRole('button', { name: '生成缺少的分镜', exact: true })).toBeDisabled();
  await expect(
    page.getByText('全部分镜图片已就绪，请检查后确认当前整组分镜。', { exact: true }),
  ).toBeVisible();
  await json(
    '/api/admin/quotas/test-owner',
    { imageLimit: 0, videoLimit: 0, unlimited: true },
    platform.token,
    'PUT',
  );
  await expect(page.locator('.quota-card dd').first()).toHaveText('不限额', { timeout: 10000 });
  await expect(page.locator('.quota-card dd').last()).toHaveText('不限额');
  await expect(
    page.getByRole('button', { name: '重做此分镜 · 1 次', exact: true }).first(),
  ).toBeEnabled();
  await page.getByRole('button', { name: '确认当前整组分镜', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '生成 8 秒视频 · 1 次', exact: true }),
  ).toBeEnabled();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/storyboard-debug/browser/unlimited.png' });
  assert.deepEqual(errors, []);
  await writeFile(
    'artifacts/storyboard-debug/browser/result.json',
    JSON.stringify(
      {
        checks: [
          'unconfirmed script blocks batch and single',
          'visible confirmation link',
          'zero quota blocks both',
          'partial quota permits single only',
          'confirmed script and enough quota generate 3 local fixture images',
          'completed batch cannot be resubmitted',
          'unlimited image and video UI remain enabled with zero finite limits',
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log('Storyboard gating, visible reasons, quota boundaries and local generation passed.');
} finally {
  await browser.close();
}
