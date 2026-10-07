// Real browser + real assistant routes + isolated SQLite. Model and queues are fixtures.
// No customer message or external website submission leaves this process.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'vite';
import { Hono } from 'hono';
import { chromium, expect } from '@playwright/test';

const artifacts = '/tmp/web-radar-assistant-acceptance';
mkdirSync(artifacts, { recursive: true });
const sqlite = new DatabaseSync(':memory:');
for (const file of readdirSync('migrations')
  .filter((file) => file.endsWith('.sql'))
  .sort())
  sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
sqlite.exec(
  "INSERT INTO edm_users(id,name,email,role,created_at,updated_at) VALUES('workspace','Fixture','workspace@example.com','member',0,0)",
);
sqlite.exec(
  "INSERT INTO edm_contacts(id,user_id,email,name,created_at,updated_at) VALUES('buyer','workspace','buyer@example.com','Buyer',0,0)",
);
let app,
  env,
  browser,
  origin,
  confirmations = 0,
  modelRequests = 0,
  emptyModelBody = false,
  failModel = false,
  loseConfirmation = false;
const confirmationIds = new Set();
const queues = { email: [], site: [] },
  errors = [];
const originalFetch = globalThis.fetch;
let principal = {
  userId: 'actor',
  workspaceId: 'workspace',
  workspaceRole: 'admin',
  appRole: 'admin',
  systemRole: 'user',
  authSubject: 'actor',
  email: 'admin@example.com',
  displayName: '验收用户',
  workspaceName: '演示工作区',
};
const server = await createServer({
  configFile: false,
  cacheDir: artifacts + '/vite-cache',
  server: { host: '127.0.0.1', port: 0 },
  plugins: [
    {
      name: 'isolated-assistant-acceptance',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url.startsWith('/api/') && !req.url.startsWith('/model/')) return next();
          try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const body = Buffer.concat(chunks).toString();
            let response;
            if (req.url === '/api/config')
              response = Response.json({ testMode: false, services: [] });
            else if (req.url === '/api/auth/me') response = Response.json({ principal });
            else if (req.url.startsWith('/model/')) {
              modelRequests++;
              if (failModel) {
                failModel = false;
                response = Response.json({ error: 'fixture outage' }, { status: 503 });
              } else {
                const input = JSON.parse(JSON.parse(body).messages.at(-1).content);
                const blankBody = emptyModelBody;
                emptyModelBody = false;
                response = Response.json({
                  choices: [
                    {
                      message: {
                        content: JSON.stringify({
                          message: '已按你的产品信息准备邮件和网站留言，请补充名单与联系信息。',
                          draft: {
                            channels: ['email', 'site'],
                            brief: input.latestInput,
                            email: {
                              subject: 'Catalog for your retail team',
                              bodyHtml: blankBody ? '<p><br></p>' :
                                '<p>Hello, we make stainless steel bottles. May I share our catalog?</p>',
                              bodyText: blankBody ? '' : 'We make stainless steel bottles. May I share our catalog?',
                            },
                            site: {
                              subject: 'Catalog inquiry',
                              message:
                                'Hello, we make stainless steel bottles. May I share our catalog with your team?',
                            },
                          },
                        }),
                      },
                    },
                  ],
                });
              }
            } else {
              if (req.url.endsWith('/confirm')) {
                confirmations++;
                confirmationIds.add(JSON.parse(body).requestId);
              }
              response = await app.fetch(
                new Request(origin + req.url, {
                  method: req.method,
                  headers: { 'Content-Type': 'application/json' },
                  ...(body ? { body } : {}),
                }),
                env,
              );
              if (req.url.endsWith('/confirm') && loseConfirmation) {
                loseConfirmation = false;
                req.socket.destroy();
                return;
              }
            }
            res.statusCode = response.status;
            for (const [key, value] of response.headers) res.setHeader(key, value);
            res.end(Buffer.from(await response.arrayBuffer()));
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(error) }));
          }
        });
      },
    },
  ],
});
try {
  const { d1 } = await server.ssrLoadModule('/tests/outreach/sqlite.ts');
  const { assistantRoutes } = await server.ssrLoadModule(
    '/src/outreach/server/routes/assistant.routes.ts',
  );
  const { campaignRoutes } = await server.ssrLoadModule(
    '/src/outreach/server/routes/campaign.routes.ts',
  );
  const { siteMessageRoutes } = await server.ssrLoadModule(
    '/src/outreach/server/routes/site-message.routes.ts',
  );
  const { seal } = await server.ssrLoadModule('/src/outreach/server/lib/credentials.ts');
  app = new Hono();
  app.use('*', async (c, next) => {
    c.set('user', { id: 'workspace', actorId: 'actor', role: principal.appRole, teamRead: true });
    await next();
  });
  app.route('/api/outreach/assistant', assistantRoutes);
  app.route('/api/outreach/campaigns', campaignRoutes);
  app.route('/api/outreach/site-messages', siteMessageRoutes);
  env = {
    DB: d1(sqlite),
    TEST_MODE: false,
    ENCRYPTION_KEY: 'fixture-key-long-enough-for-acceptance',
    JWT_SECRET: 'fixture-jwt-secret-long-enough',
    EMAIL_QUEUE: {
      send: async (body) => queues.email.push(body),
      sendBatch: async (batch) => queues.email.push(...batch.map((item) => item.body)),
    },
    SITE_MESSAGE_QUEUE: { send: async (body) => queues.site.push(body) },
    BROWSER: {},
    TEXT_API_KEY: 'fixture-only',
    TEXT_MODEL: 'fixture',
  };
  env.CREDENTIAL_KEY = 'fixture-key-long-enough-for-acceptance';
  const sealed = await seal('fixture-only', 'provider', env);
  sqlite
    .prepare(
      "INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at) VALUES('provider','workspace','sendgrid','Fixture mail',?,1,0,0)",
    )
    .run(sealed);
  await server.listen();
  origin = server.resolvedUrls.local[0].replace(/\/$/, '');
  env.TEXT_API_BASE_URL = 'https://model.fixture.invalid/model';
  globalThis.fetch = (url, init) => {
    const address = url instanceof Request ? url.url : String(url);
    if (address.startsWith('https://model.fixture.invalid/'))
      return originalFetch(address.replace('https://model.fixture.invalid', origin), init);
    if (new URL(address).origin === origin) return originalFetch(url, init);
    throw new Error('External requests are disabled in assistant acceptance fixtures');
  };
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', (route) =>
    new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
  );
  await page.goto(origin + '/?view=lazy-mode');
  await expect(page.getByRole('heading', { name: '今天想完成什么？' })).toBeVisible();
  await page.screenshot({ path: artifacts + '/welcome.png' });
  await page.getByRole('button', { name: /给客户发一封邮件/ }).click();
  const guided = page.getByRole('region', { name: '逐步准备发送' });
  const atStep = async (step) => expect(guided).toHaveAttribute('data-guidance-step', step);
  const nextStep = async (step) => {
    const queued = queues.email.length + queues.site.length;
    await guided.getByRole('button', { name: /^(下一步|跳过，下一步)$/ }).click();
    await atStep(step);
    expect(queues.email.length + queues.site.length).toBe(queued);
  };
  await atStep('emailAudience');
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('目标网站', { exact: true })).toHaveCount(0);
  await page
    .getByLabel('给助手的消息')
    .fill('我们生产不锈钢水杯，想给客户发英文新品目录邀请，也向网站留言，请写得自然些。');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await atStep('emailAudience');
  expect(queues.email.length + queues.site.length).toBe(0);
  await page.getByLabel('客户分组').selectOption('null');
  // Unsaved step inputs and the current position survive reload and list refresh.
  await page.reload();
  await atStep('emailAudience');
  await expect(page.getByLabel('客户分组')).toHaveValue('null');
  sqlite.exec(
    "INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES('imported','workspace','Newly imported',0,0)",
  );
  await page.getByRole('button', { name: '刷新客户名单' }).click();
  await expect(
    page.getByLabel('客户分组').locator('option', { hasText: 'Newly imported' }),
  ).toHaveCount(1);
  await expect(page.getByLabel('客户分组')).toHaveValue('null');
  await nextStep('siteTargets');
  await page.getByLabel('目标网站', { exact: true }).fill('https://buyer.example.com/contact');
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveCount(0);
  await nextStep('senderName');
  await page.getByLabel('发件人名称', { exact: true }).fill('Alex');
  await page.reload();
  await atStep('senderName');
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveValue('Alex');
  await nextStep('senderEmail');
  await page.getByLabel('发件人邮箱', { exact: true }).fill('sales@example.com');
  // Moving back and saving a different step must retain this unsaved email address.
  await guided.getByRole('button', { name: '上一步', exact: true }).click();
  await atStep('senderName');
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveValue('Alex');
  await nextStep('senderEmail');
  await expect(page.getByLabel('发件人邮箱', { exact: true })).toHaveValue('sales@example.com');
  await page.screenshot({ path: artifacts + '/guided-email.png', fullPage: true });
  await nextStep('contentSource');
  await guided.getByRole('button', { name: '自己填写', exact: true }).click();
  await nextStep('emailSubject');
  await expect(page.getByLabel('邮件主题', { exact: true })).toHaveValue('Catalog for your retail team');
  await nextStep('emailBody');
  await expect(page.getByLabel('邮件正文', { exact: true })).toHaveValue('We make stainless steel bottles. May I share our catalog?');
  await nextStep('siteSubject');
  await nextStep('siteBody');
  await nextStep('review');
  await expect(page.getByRole('region', { name: '发送前预览' })).toBeVisible();
  await expect(page.frameLocator('iframe[title="邮件内容预览"]').locator('body')).toContainText('Hello, we make stainless steel bottles.');
  // Edit a completed summary without losing other completed steps.
  await guided.getByRole('button', { name: '修改邮件主题', exact: true }).click();
  await atStep('emailSubject');
  await page.getByLabel('邮件主题', { exact: true }).fill('Product catalog for your retail team');
  await nextStep('emailBody');
  await expect(page.getByLabel('邮件正文', { exact: true })).toHaveValue('We make stainless steel bottles. May I share our catalog?');
  await nextStep('siteSubject');
  await nextStep('siteBody');
  await nextStep('review');
  await expect(page.getByText('Product catalog for your retail team', { exact: true }).last()).toBeVisible();
  // A chat update can leave the current review open, but empty HTML must not remain sendable.
  emptyModelBody = true;
  await page.getByLabel('给助手的消息').fill('重新整理这次邮件正文。');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await atStep('review');
  await expect(guided.getByRole('alert')).toContainText('请填写邮件正文');
  await expect(page.getByRole('button', { name: '确认发送 1 封邮件并向 1 个网站留言', exact: true })).toHaveCount(0);
  expect(confirmations).toBe(0); expect(queues.email.length + queues.site.length).toBe(0);
  await page.screenshot({ path: artifacts + '/empty-body-review-blocked.png', fullPage: true });
  await page.getByLabel('给助手的消息').fill('恢复有效的邮件正文。');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await atStep('review');
  await expect(guided.getByRole('alert')).toHaveCount(0);
  await expect(page.frameLocator('iframe[title="邮件内容预览"]').locator('body')).toContainText('Hello, we make stainless steel bottles.');
  const confirm = page.getByRole('button', {
    name: '确认发送 1 封邮件并向 1 个网站留言',
    exact: true,
  });
  await expect(confirm).toBeDisabled();
  await page.getByRole('checkbox', { name: /这些网站允许提交/ }).check();
  await expect(confirm).toBeEnabled();
  await page.reload();
  await expect(confirm).toBeDisabled();
  await expect(page.getByText('Alex · sales@example.com', { exact: true })).toBeVisible();
  await page.screenshot({ path: artifacts + '/preview.png', fullPage: true });
  // A model outage preserves the current draft and typed request.
  failModel = true;
  await page.getByLabel('给助手的消息').fill('再短一点');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('原草稿已保留');
  await expect(page.getByLabel('给助手的消息')).toHaveValue('再短一点');
  await page.reload();
  await expect(page.getByLabel('给助手的消息')).toHaveValue('再短一点');
  // Lost response after successful submission must recover original tasks, never resend.
  await page.getByRole('checkbox', { name: /这些网站允许提交/ }).check();
  loseConfirmation = true;
  await confirm.click();
  await expect(page.getByRole('region', { name: '任务结果' })).toBeVisible();
  expect(confirmationIds.size).toBe(1);
  expect(queues.email).toHaveLength(1);
  expect(queues.site).toHaveLength(1);
  const recoveredRequests = confirmations;
  await page.reload();
  await expect(page.getByRole('region', { name: '任务结果' })).toBeVisible();
  expect(confirmations).toBe(recoveredRequests);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载结果 CSV', exact: true }).first().click();
  const download = await downloadPromise;
  await download.saveAs(artifacts + '/results.csv');
  assert.match(readFileSync(artifacts + '/results.csv', 'utf8'), /buyer@example.com/);
  await page.screenshot({ path: artifacts + '/results.png', fullPage: true });
  await page.getByRole('button', { name: '在工作台查看', exact: true }).last().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  assert.ok(new URL(page.url()).searchParams.get('siteJobId'));
  await page.getByRole('button', { name: '关闭任务详情' }).click();
  await page
    .getByRole('navigation', { name: '工作台导航' })
    .getByRole('button', { name: '懒人模式', exact: true })
    .click();
  await expect(page.getByRole('region', { name: '任务结果' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: artifacts + '/mobile.png', fullPage: true });
  await page.getByRole('button', { name: '会话列表', exact: true }).click();
  await expect(page.getByRole('navigation', { name: '我的会话' })).toBeVisible();
  principal = { ...principal, appRole: 'viewer' };
  await page.reload();
  await expect(page.getByLabel('给助手的消息')).toHaveCount(0);
  await expect(page.getByText(/当前角色仅可查看会话/)).toBeVisible();
  // First message can create a session directly; an AI failure must keep it retryable.
  principal = { ...principal, appRole: 'admin' };
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + '/?view=lazy-mode');
  failModel = true;
  await page.getByLabel('给助手的消息').fill('为我们的不锈钢水杯准备邮件和网站留言。');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('原草稿已保留');
  await expect(page.getByLabel('给助手的消息')).toHaveValue(
    '为我们的不锈钢水杯准备邮件和网站留言。',
  );
  await page.getByRole('button', { name: '重试这条消息', exact: true }).click();
  await atStep('emailAudience');
  await expect(page.getByLabel('给助手的消息')).toHaveValue('');
  // Each single-channel manual journey has only its own fields and never queues while preparing.
  for (const channel of ['email', 'site']) {
    await page.getByRole('button', { name: '新建会话', exact: true }).click();
    await page.getByRole('button', {
      name: channel === 'email' ? /给客户发一封邮件/ : /向客户网站留言/,
    }).click();
    await atStep(channel === 'email' ? 'emailAudience' : 'siteTargets');
    if (channel === 'email') {
      await page.getByLabel('客户分组').selectOption('null');
    } else {
      await page.getByLabel('目标网站', { exact: true }).fill('https://buyer.example.com/contact\nnot-a-website');
      await guided.getByRole('button', { name: '下一步', exact: true }).click();
      await expect(guided.getByRole('alert')).toContainText('请修改无效网址');
      await atStep('siteTargets');
      await page.getByLabel('目标网站', { exact: true }).fill('https://buyer.example.com/contact\nhttps://www.buyer.example.com/contact');
      await expect(guided.getByText('有效 1 个 · 重复 1 个 · 无效 0 个', { exact: true })).toBeVisible();
    }
    await nextStep('senderName');
    await expect(page.getByLabel('发件人名称', { exact: true })).toHaveValue('');
    await page.getByLabel('发件人名称', { exact: true }).fill('Manual Seller');
    await nextStep('senderEmail');
    if (channel === 'site') await expect(guided.getByText('对方可通过这个邮箱回复你，无需配置 EDM 发信域名。', { exact: true })).toBeVisible();
    await page.getByLabel('发件人邮箱', { exact: true }).fill('manual@example.com');
    await nextStep('contentSource');
    await guided.getByRole('button', { name: '自己填写', exact: true }).click();
    await nextStep(channel === 'email' ? 'emailSubject' : 'siteSubject');
    if (channel === 'email') {
      await expect(page.getByLabel('邮件主题', { exact: true })).toHaveValue('');
      await guided.getByRole('button', { name: '下一步', exact: true }).click();
      await expect(guided.getByRole('alert')).toContainText('请填写邮件主题');
      await atStep('emailSubject');
      await page.getByLabel('邮件主题', { exact: true }).fill('Manual catalog proposal');
      await nextStep('emailBody');
      await page.getByLabel('邮件正文', { exact: true }).fill('Hello, may we send your team our catalog?');
    } else {
      await expect(page.getByLabel('留言主题', { exact: true })).toHaveValue('');
      await nextStep('siteBody');
      await page.getByLabel('网站留言', { exact: true }).fill('Hello, may we send your team our catalog?');
    }
    await nextStep('review');
    const singleConfirm = page.getByRole('button', {
      name: channel === 'email' ? '确认向 1 位客户发送' : '确认向 1 个网站提交', exact: true,
    });
    if (channel === 'email') {
      await expect(singleConfirm).toBeEnabled();
      await expect(page.getByRole('checkbox', { name: /这些网站允许提交/ })).toHaveCount(0);
      await expect(page.frameLocator('iframe[title="邮件内容预览"]').locator('body')).toContainText('Hello, may we send your team our catalog?');
      // Existing manual content does not satisfy the brief needed for an AI redraft.
      await guided.getByRole('button', { name: '修改准备内容', exact: true }).click();
      await atStep('contentSource');
      await guided.getByRole('button', { name: '让助手起草', exact: true }).click();
      await expect(page.getByLabel('内容要求', { exact: true })).toHaveValue('');
      const beforeModels = modelRequests;
      await guided.getByRole('button', { name: '起草内容，下一步', exact: true }).click();
      await expect(guided.getByRole('alert')).toContainText(/请说明.*产品或服务/);
      await atStep('contentSource');
      expect(modelRequests).toBe(beforeModels);
      await page.screenshot({ path: artifacts + '/ai-brief-required.png', fullPage: true });
      await guided.getByRole('button', { name: '自己填写', exact: true }).click();
      await nextStep('emailSubject');
      await nextStep('emailBody');
      await expect(page.getByLabel('邮件正文', { exact: true })).toHaveValue('Hello, may we send your team our catalog?');
      await nextStep('review');
      await expect(singleConfirm).toBeEnabled();
    } else {
      await expect(singleConfirm).toBeDisabled();
      await page.getByRole('checkbox', { name: /这些网站允许提交/ }).check();
      await expect(singleConfirm).toBeEnabled();
      await page.reload();
      await atStep('review');
      await expect(singleConfirm).toBeDisabled();
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.screenshot({ path: artifacts + '/' + channel + '-only-review.png', fullPage: true });
    expect(confirmationIds.size).toBe(1);
    expect(queues.email).toHaveLength(1); expect(queues.site).toHaveLength(1);
  }
  assert.deepEqual(errors, []);
  writeFileSync(
    artifacts + '/evidence.json',
    JSON.stringify(
      {
        confirmationRequests: confirmations,
        uniqueConfirmations: confirmationIds.size,
        queuedEmail: queues.email.length,
        queuedSite: queues.site.length,
        externalDelivery: false,
        guidedChannels: ['email', 'site', 'both'],
        manualJourneysQueued: false,
        emptyBodyReviewBlocked: true,
        emptyAiBriefBlockedWithoutModelRequest: true,
        passed: true,
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS: real assistant routes, guided email/site/both journeys, one-question steps, back and summary edits, unsaved reload, required fields, exact preview, model outage, lost confirmation recovery, CSV, viewer and mobile. Queues and model are fixtures; no external delivery.',
  );
} catch (error) {
  console.error('Browser errors:', errors);
  if (browser) {
    const page = browser.contexts()[0]?.pages()[0];
    await page?.screenshot({ path: artifacts + '/failure.png', fullPage: true });
    if (page) writeFileSync(artifacts + '/failure.txt', await page.locator('body').innerText());
  }
  throw error;
} finally {
  globalThis.fetch = originalFetch;
  await browser?.close();
  await server.close();
  sqlite.close();
}
