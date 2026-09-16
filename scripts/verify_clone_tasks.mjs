import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { unstable_startWorker } from 'wrangler';
import { chromium } from '@playwright/test';
const origin = 'http://127.0.0.1:8795';
await mkdir('artifacts/task-review', { recursive: true });
let calls = 0,
  worker,
  browser;
const timers = new Set();
try {
  worker = await unstable_startWorker({
    config: 'wrangler.jsonc',
    env: 'test',
    bindings: {
      OPENAI_API_KEY: { type: 'secret_text', value: 'isolated-test-key' },
      CLONE_TEST_FIXTURE: { type: 'plain_text', value: 'false' },
      APP_ORIGIN: { type: 'plain_text', value: origin },
    },
    dev: {
      server: { hostname: '127.0.0.1', port: 8795 },
      persist: 'artifacts/upload-review/state',
      inspector: false,
      watch: false,
      logLevel: 'error',
      outboundService: async (request) => {
        // No external model requests. Exercise the actual worker + streaming parser against this isolated fixture.
        assert.equal(new URL(request.url).hostname, 'api.openai.com');
        calls++;
        const input = await request.json();
        assert.equal(input.stream, true);
        const body =
          '<header>Test reference</header><main><h1>Persistent task test</h1><p>This mock provider only tests task behavior, not visual fidelity or a paid model.</p></main>';
        const content = JSON.stringify({
          css: 'body{margin:0}',
          pages: {
            en: Object.fromEntries(
              ['home', 'catalog', 'detail', 'about', 'contact'].map((k) => [k, body]),
            ),
          },
        });
        const chunks = content.match(/.{1,70}/gs);
        let index = 0,
          timer;
        return new Response(
          new ReadableStream({
            start(controller) {
              timer = setInterval(() => {
                const text = chunks[index++];
                controller.enqueue(
                  new TextEncoder().encode(
                    'data: ' +
                      JSON.stringify({
                        choices: [
                          {
                            delta: { content: text || '' },
                            finish_reason: index > chunks.length ? 'stop' : null,
                          },
                        ],
                      }) +
                      '\n\n',
                  ),
                );
                if (index > chunks.length) {
                  clearInterval(timer);
                  timers.delete(timer);
                  controller.close();
                }
              }, 600);
              timers.add(timer);
            },
            cancel() {
              clearInterval(timer);
              timers.delete(timer);
            },
          }),
          { headers: { 'Content-Type': 'text/event-stream' } },
        );
      },
    },
  });
  await worker.ready;
  browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  assert.equal(
    (
      await context.request.post(origin + '/api/auth/test-login', { data: { identity: 'owner' } })
    ).status(),
    200,
  );
  const created = await context.request.post(origin + '/api/projects', {
    data: {
      name: 'Persistent clone task regression',
      requestId: crypto.randomUUID(),
      buildBranch: 'clone',
    },
  });
  const { project } = await created.json();
  assert.ok(project?.id);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const url = origin + '/?project=' + project.id + '&tab=clone-generate';
  await page.goto(url);
  await page
    .locator('.clone-editor input[type=file]')
    .setInputFiles('artifacts/clone-fidelity/references/index.jpg');
  await page.getByText('已上传 1 个页面/素材文件').waitFor();
  await page.getByRole('button', { name: '🎯 按设计稿生成并部署', exact: true }).click();
  const panel = page.getByRole('region', { name: '设计生成任务进度' });
  await panel.getByRole('button', { name: '暂停', exact: true }).waitFor();
  await panel.getByText(/已耗时/).waitFor();
  await page.reload();
  await panel.getByRole('button', { name: '暂停', exact: true }).waitFor();
  assert.ok((await panel.innerText()).includes('预计还需'));
  await panel.getByRole('button', { name: '暂停', exact: true }).click();
  await panel.getByRole('heading', { name: '任务已暂停', exact: true }).waitFor({ timeout: 45000 });
  await page.reload();
  await panel.getByRole('button', { name: '继续', exact: true }).waitFor();
  await panel.screenshot({ path: 'artifacts/task-review/paused-after-reload.png' });
  const callsBefore = calls;
  await panel.getByRole('button', { name: '继续', exact: true }).click();
  await panel.getByRole('link', { name: '打开网站 ↗' }).waitFor({ timeout: 45000 });
  assert.equal(calls, callsBefore);
  await panel.screenshot({ path: 'artifacts/task-review/completed.png' });
  // A new run can be stopped while output is arriving, and stays stopped after reload.
  await page.getByRole('button', { name: '🔄 重新按设计稿生成并部署', exact: true }).click();
  await panel.getByRole('button', { name: '停止', exact: true }).waitFor();
  await panel.getByRole('button', { name: '停止', exact: true }).click();
  await panel.getByRole('heading', { name: '任务已停止', exact: true }).waitFor();
  await page.reload();
  await panel.getByRole('heading', { name: '任务已停止', exact: true }).waitFor();
  await panel.screenshot({ path: 'artifacts/task-review/stopped-after-reload.png' });
  assert.deepEqual(errors, []);
  console.log(
    'PASS: live streaming progress + ETA; reload while running/paused/stopped; pause checkpoint and resume without second model call; server-owned auto-publication.',
  );
} finally {
  for (const timer of timers) clearInterval(timer);
  await browser?.close();
  await worker?.dispose();
}
