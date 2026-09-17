import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { unstable_startWorker } from 'wrangler';
import { chromium } from '@playwright/test';
const origin = 'http://127.0.0.1:8795';
await mkdir('artifacts/task-review', { recursive: true });
const statePath = 'artifacts/task-review/state';
execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'migrations', 'apply', 'web-radar', '--local', '--env', 'test', '--persist-to', statePath], { stdio: 'pipe' });
await writeFile('artifacts/task-review/index.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1e0AAAAASUVORK5CYII=', 'base64'));
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
      SITE_BUILDER_URL: { type: 'plain_text', value: 'https://renderer.test' },
      SITE_BUILDER_KEY: { type: 'secret_text', value: 'isolated-render-key' },
      CLONE_TEST_FIXTURE: { type: 'plain_text', value: 'false' },
      APP_ORIGIN: { type: 'plain_text', value: origin },
    },
    dev: {
      server: { hostname: '127.0.0.1', port: 8795 },
      persist: statePath,
      inspector: false,
      watch: false,
      logLevel: 'error',
      outboundService: async (request) => {
        // No external model requests. Exercise the actual worker + streaming parser against this isolated fixture.
        if (new URL(request.url).hostname === 'renderer.test') {
          assert.equal(new URL(request.url).pathname,'/v1/clone-quality');
          assert.equal(request.headers.get('authorization'),'Bearer isolated-render-key');
          const payload = await request.json();
          return Response.json({status:'passed',sampledPages:Object.keys(payload.files).length,widths:[390,1440,2560],records:Object.keys(payload.files).flatMap(path=>[390,1440,2560].map(width=>({path,width,height:1800,textLength:800,issues:[],warnings:[]}))),screenshots:{},visuallyVerified:false});
        }
        assert.equal(new URL(request.url).hostname, 'api.openai.com');
        calls++;
        const input = await request.json();
        assert.equal(input.stream, true);
      if (calls === 1) { assert.ok(input.messages[1].content[0].text.includes('SMART COMPLETION MODE')); assert.ok(input.messages[1].content[0].text.includes('保留第一屏，补充采购流程')); }
        const body =
          '<header>Test reference</header><main><h1>Persistent task test</h1><p>This mock provider only tests task behavior, not visual fidelity or a paid model.</p><form data-wr-inquiry><input aria-label="Preview email" type="email" name="email" required><button type="submit">Preview submit</button></form></main>';
        const content = JSON.stringify({
          css: 'body{margin:0}',
          pages: {
            en: Object.fromEntries(
              ['home', 'catalog', 'detail', 'about', 'contact'].map((k) => [k, body]),
            ),
          },
        });
        const chunks = content.match(/.{1,150}/gs);
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
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
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
    .setInputFiles('artifacts/task-review/index.png');
  await page.getByText('已上传 1 个页面/素材文件').waitFor();
  assert.equal(await page.getByLabel('页面完善方式').inputValue(), 'smart');
  await page.locator('.clone-editor textarea').last().fill('保留第一屏，补充采购流程与联系方式。');
  await page.getByRole('button', { name: '🎯 按设计稿生成并部署', exact: true }).click();
  const panel = page.getByRole('region', { name: '设计生成任务进度' });
  let statusRequests = 0;
  page.on('request', request => { const path = new URL(request.url()).pathname; if (request.method() === 'GET' && [`/api/projects/${project.id}`, `/api/projects/${project.id}/clone/task`].includes(path)) statusRequests++; });
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
  await new Promise(resolve => setTimeout(resolve, 2500));
  const atCompletion = statusRequests;
  await new Promise(resolve => setTimeout(resolve, 8000));
  assert.equal(statusRequests, atCompletion, 'completed task and project must stop polling');
  await panel.getByRole('button', {name:'预览与发布管理'}).click();
  assert.equal(await page.getByRole('button',{name:'当前内容已上线',exact:true}).isDisabled(), true);
  let inquiryRequests=0;
  page.on('request',request=>{if(request.method()==='POST'&&request.url().includes('/inquiries'))inquiryRequests++;});
  await page.getByRole('button',{name:'整站预览',exact:true}).click();
  const preview=page.frameLocator('iframe[title$="私有预览"]');
  await preview.getByLabel('Preview email').fill('buyer@example.com');
  await preview.getByRole('button',{name:'Preview submit'}).click();
  await preview.getByRole('status').filter({hasText:'No message was sent'}).waitFor();
  assert.equal(inquiryRequests,0);
  await page.getByRole('button',{name:'关闭预览',exact:true}).click();

  const latest = await (await context.request.get(origin+'/api/projects/'+project.id)).json();
  assert.equal(latest.releases.length,1);
  assert.equal(latest.project.draft.cloneConfig.generation.quality.status,'passed');
  const qualityReport=await context.request.get(origin+'/api/projects/'+project.id+'/clone/quality-report');
  assert.equal(qualityReport.status(),200);
  assert.deepEqual((await qualityReport.json()).widths,[390,1440,2560]);
  const duplicate = await context.request.post(origin+'/api/projects/'+project.id+'/publish',{data:{expectedVersion:latest.project.version,requestId:crypto.randomUUID()}});
  assert.equal(duplicate.status(),200);
  assert.equal((await (await context.request.get(origin+'/api/projects/'+project.id)).json()).releases.length,1);
  await page.goto(url);

  // A new run can be stopped while output is arriving, and stays stopped after reload.
  await page.getByRole('button', { name: '🔄 重新按设计稿生成并部署', exact: true }).click();
  await panel.getByRole('button', { name: '停止', exact: true }).waitFor();
  await panel.getByRole('button', { name: '停止', exact: true }).click();
  await panel.getByRole('heading', { name: '任务已停止', exact: true }).waitFor();
  await page.reload();
  await panel.getByRole('heading', { name: '任务已停止', exact: true }).waitFor();
  await panel.screenshot({ path: 'artifacts/task-review/stopped-after-reload.png' });
  // Preview-only generation must save the result without creating another deployment.
  await page.getByLabel('生成完成后自动发布').uncheck();
  await page.getByRole('button', { name: '🔄 重新生成页面并预览', exact: true }).click();
  await panel.getByRole('heading', { name: '页面代码已生成，待预览与发布', exact: true }).waitFor({ timeout: 45000 });
  assert.equal((await (await context.request.get(origin+'/api/projects/'+project.id)).json()).releases.length, 1);
  assert.equal(await panel.getByRole('link', { name: '打开网站 ↗' }).count(), 0);
  await new Promise(resolve => setTimeout(resolve, 2500));
  const afterPreview = statusRequests;
  await new Promise(resolve => setTimeout(resolve, 6000));
  assert.equal(statusRequests, afterPreview, 'preview-only completion must stop polling');
  assert.deepEqual(errors, []);
  console.log(
    'PASS: live streaming progress + ETA; reload while running/paused/stopped; pause checkpoint and resume without second model call; server-owned auto-publication; terminal polling stops; identical content reuses the release; smart-mode instructions are forwarded.',
  );
} catch (error) {
  const page = browser?.contexts()[0]?.pages()[0];
  if (page) {
    await page.screenshot({ path: 'artifacts/task-review/failure.png', fullPage: true }).catch(() => {});
    await writeFile('artifacts/task-review/failure.txt', await page.locator('body').innerText()).catch(() => {});
    for (const frame of page.frames().slice(1)) await writeFile('artifacts/task-review/failure-frame.txt', await frame.content()).catch(() => {});
  }
  throw error;
} finally {
  for (const timer of timers) clearInterval(timer);
  await browser?.close();
  await worker?.dispose();
}
