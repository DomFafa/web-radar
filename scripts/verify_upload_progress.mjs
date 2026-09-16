import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const origin = 'http://127.0.0.1:8794';
await mkdir('artifacts/upload-review', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  assert.equal((await context.request.post(origin + '/api/auth/test-login', { data: { identity: 'owner' } })).status(), 200);
  const created = await context.request.post(origin + '/api/projects', { data: { name: 'Upload progress regression', requestId: crypto.randomUUID(), buildBranch: 'clone' } });
  const { project } = await created.json(); assert.ok(project?.id);
  const page = await context.newPage();
  await page.goto(`${origin}/?project=${project.id}&tab=clone-generate`);
  const input = page.locator('.clone-editor input[type=file]'); await input.waitFor({state:'attached'});
  let calls = 0;
  let releaseFirst;
  const firstGate = new Promise(resolve => { releaseFirst = resolve; });
  await page.route(`**/api/projects/${project.id}/uploads`, async route => {
    calls++;
    if (calls === 2) {
      await firstGate;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: '测试上传中断' }) });
    } else await route.continue();
  });
  await input.setInputFiles(['artifacts/clone-fidelity/references/index.jpg', 'artifacts/clone-fidelity/references/products-1.jpg']);
  const progress = page.getByRole('progressbar', { name: '图片上传总进度' });
  await progress.waitFor();
  assert.ok(Number(await progress.getAttribute('value')) < 100);
  await page.getByText('已完成 1 / 2 张', {exact:false}).waitFor();
  await page.screenshot({ path: 'artifacts/upload-review/in-progress.png', fullPage: true });
  releaseFirst();
  await page.getByText('已保留本次成功上传的 1 张图片', {exact:false}).waitFor().catch(async e => { console.log((await page.locator('.clone-editor').innerText()).slice(-4000)); throw e; });
  await page.getByText('已上传 1 个页面/素材文件').waitFor();
  await page.screenshot({ path: 'artifacts/upload-review/partial-failure.png', fullPage: true });
  await input.setInputFiles('artifacts/clone-fidelity/references/products-1.jpg');
  await page.getByText('上传完成 已完成 1 / 1 张').waitFor();
  assert.equal(await progress.getAttribute('value'), '100');
  await page.getByText('已上传 2 个页面/素材文件').waitFor();
  await page.screenshot({ path: 'artifacts/upload-review/complete.png', fullPage: true });
  console.log('PASS: real cookie-authenticated image uploads, visible progress, delayed server confirmation, partial failure retention, successful retry.');
} finally { await browser.close(); }
