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
              if (failModel) {
                failModel = false;
                response = Response.json({ error: 'fixture outage' }, { status: 503 });
              } else {
                const input = JSON.parse(JSON.parse(body).messages.at(-1).content);
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
                              bodyHtml:
                                '<p>Hello, we make stainless steel bottles. May I share our catalog?</p>',
                              bodyText: 'We make stainless steel bottles. May I share our catalog?',
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
    const address = String(url);
    if (address.startsWith('https://model.fixture.invalid/'))
      return originalFetch(address.replace('https://model.fixture.invalid', origin), init);
    return originalFetch(url, init);
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
  await page
    .getByLabel('给助手的消息')
    .fill('我们生产不锈钢水杯，想给客户发英文新品目录邀请，也向网站留言，请写得自然些。');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await expect(page.getByRole('region', { name: '发送前预览' })).toBeVisible();
  expect(queues.email.length + queues.site.length).toBe(0);
  await page.getByRole('button', { name: '补充名单和联系资料' }).click();
  await page.getByLabel('客户分组').selectOption('null');
  await page.getByLabel('目标网站', { exact: true }).fill('https://buyer.example.com/contact');
  await page.getByLabel('发件人名称', { exact: true }).fill('Alex');
  await page.getByLabel('发件人邮箱', { exact: true }).fill('sales@example.com');
  // Unsaved necessary fields survive reload, and imports refresh without clearing them.
  await page.reload();
  await page.getByRole('button', { name: '补充名单和联系资料' }).click();
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveValue('Alex');
  await expect(page.getByLabel('目标网站', { exact: true })).toHaveValue(
    'https://buyer.example.com/contact',
  );
  sqlite.exec(
    "INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES('imported','workspace','Newly imported',0,0)",
  );
  await page.getByRole('button', { name: '刷新客户名单' }).click();
  await expect(
    page.getByLabel('客户分组').locator('option', { hasText: 'Newly imported' }),
  ).toHaveCount(1);
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveValue('Alex');
  await page.getByRole('button', { name: '保存资料，继续聊天' }).click();
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
  await expect(page.getByRole('region', { name: '发送前预览' })).toBeVisible();
  await expect(page.getByLabel('给助手的消息')).toHaveValue('');
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
        passed: true,
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS: real assistant routes, dual-channel conversation, required fields, exact preview, reload, model outage, lost confirmation recovery, CSV, viewer and mobile. Queues and model are fixtures; no external delivery.',
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
