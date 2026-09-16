import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:8791';
const out = 'artifacts/session-review';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const login = await context.request.post(origin + '/api/auth/test-login', {
    data: { identity: 'owner' },
  });
  assert.equal(login.status(), 200);
  const cookies = await context.cookies();
  assert.ok(
    cookies.some((c) => c.name === 'wr_session' && c.httpOnly && c.expires > Date.now() / 1000),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await page.getByRole('button', { name: '创建网站', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => sessionStorage.getItem('wr_session')), null);
  await page.reload();
  await page.getByRole('button', { name: '创建网站', exact: true }).waitFor();
  const second = await context.newPage();
  await second.goto(origin);
  await second.getByRole('button', { name: '创建网站', exact: true }).waitFor();
  await second.close();
  results.push(
    'HttpOnly cookie restores login after reload and in a new tab without a stored bearer.',
  );
  const created = await context.request.post(origin + '/api/projects', {
    data: {
      name: 'Session and preview regression',
      requestId: crypto.randomUUID(),
      buildBranch: 'template',
    },
  });
  let project = (await created.json()).project;
  assert.ok(project?.id);
  project.draft.company.name = 'Preview Product Company';
  project.draft.products = [
    {
      id: 'item',
      name: 'Live Product',
      description: 'Current product data',
      material: '',
      dimensions: '',
    },
  ];
  project = (
    await (
      await context.request.put(origin + '/api/projects/' + project.id, {
        data: { expectedVersion: project.version, draft: project.draft },
      })
    ).json()
  ).project;
  await page.goto(origin + '/?project=' + project.id + '&tab=template');
  const previewButtons = page.getByRole('button', { name: /^预览 / });
  await previewButtons.first().waitFor();
  assert.equal(await previewButtons.count(), 10);
  for (let i = 0; i < 10; i++) {
    await previewButtons.nth(i).click();
    await page.locator('.preview-overlay iframe').waitFor();
    const frame = page.frameLocator('.preview-overlay iframe');
    await frame.locator('body').waitFor();
    assert.ok((await frame.locator('body').innerText()).length > 100);
    if (i === 0) {
      await page.getByRole('button', { name: '手机', exact: true }).click();
      await page.getByLabel('预览页面').selectOption('catalog');
      await frame.getByText('Live Product', { exact: true }).first().waitFor();
      await page.screenshot({ path: out + '/template-preview-mobile.png' });
    }
    if (i === 2) {
      await frame.locator('video').waitFor();
      await frame.locator('video').evaluate(async (video) => {
        if (video.readyState >= 2) return;
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Preview video did not load')), 25000);
          video.addEventListener(
            'loadeddata',
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true },
          );
          video.addEventListener(
            'error',
            () => {
              clearTimeout(timer);
              reject(new Error('Preview video failed'));
            },
            { once: true },
          );
        });
      });
      await page.screenshot({ path: out + '/template-preview-desktop.png' });
    }
    await page.getByLabel('关闭预览').click();
  }
  const unchanged = (
    await (await context.request.get(origin + '/api/projects/' + project.id)).json()
  ).project;
  assert.equal(unchanged.version, project.version);
  assert.equal(unchanged.draft.template, project.draft.template);
  results.push(
    'All 10 preview buttons render; mobile catalog shows current products; preview never changes the stored version/template.',
  );
  project.draft.buildBranch = 'clone';
  project.draft.cloneConfig = { targetUrl: 'https://example.com', status: 'idle' };
  project = (
    await (
      await context.request.put(origin + '/api/projects/' + project.id, {
        data: { expectedVersion: project.version, draft: project.draft },
      })
    ).json()
  ).project;
  await page.goto(origin + '/?project=' + project.id + '&tab=clone-generate');
  await page
    .getByPlaceholder('例如: https://squishytoys.store 或 https://example.com')
    .fill('https://example.org');
  await page.locator('.clone-editor textarea').fill('Keep the reference structure.');
  // Simulate an unrelated concurrent edit while this form has unsaved changes.
  const latest = (await (await context.request.get(origin + '/api/projects/' + project.id)).json())
    .project;
  await context.request.put(origin + '/api/projects/' + project.id, {
    data: { expectedVersion: latest.version, draft: latest.draft, name: 'Concurrent project name' },
  });
  const sent = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && /\/(clone\/generate|publish)$/.test(r.url()))
      sent.push({ path: new URL(r.url()).pathname, body: r.postDataJSON() });
  });
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: /按设计稿生成并部署/ }).click();
    await page.waitForFunction(
      () =>
        !!document
          .querySelector('.clone-editor a[target="_blank"]')
          ?.getAttribute('href')
          ?.includes('/public/sites/'),
      undefined,
      { timeout: 90000 },
    );
    await page.locator('.clone-editor').evaluate((el) => el.scrollIntoView({ block: 'end' }));
    await page.screenshot({ path: out + '/clone-published-' + i + '.png' });
  }
  assert.equal(sent.length, 4);
  for (let i = 0; i < sent.length; i += 2) {
    assert.equal(typeof sent[i].body.expectedVersion, 'number');
    assert.equal(sent[i + 1].body.expectedVersion, sent[i].body.expectedVersion + 1);
    assert.ok(sent[i + 1].body.requestId);
  }
  const final = (await (await context.request.get(origin + '/api/projects/' + project.id)).json())
    .project;
  assert.equal(final.name, 'Concurrent project name');
  assert.equal(final.draft.cloneConfig.targetUrl, 'https://example.org');
  results.push(
    'Two consecutive clone generations publish the returned version; publication has a request ID; unrelated concurrent edits merge without data loss.',
  );
  assert.deepEqual(errors, []);
  await context.request.post(origin + '/api/auth/sign-out');
  await page.reload();
  assert.equal((await context.request.get(origin + '/api/auth/me')).status(), 401);
  results.push('Logout revokes the cookie session; browser reports no JavaScript errors.');
  await writeFile(
    out + '/browser-verification.json',
    JSON.stringify({ results, requests: sent }, null, 2),
  );
  console.log(results.join('\n'));
} finally {
  await browser.close();
}
