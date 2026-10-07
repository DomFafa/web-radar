// Real browser + real assistant routes + isolated SQLite. Model and queues are fixtures.
// No customer message or external website submission leaves this process.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'vite';
import { Hono } from 'hono';
import { chromium, expect } from '@playwright/test';

const artifacts = '/tmp/web-radar-assistant-acceptance';
mkdirSync(artifacts, { recursive: true });
const sourceFiles = ['src/outreach/client/assistant/GuidedDraft.tsx', 'src/outreach/client/assistant/AssistantPage.tsx',
  'src/outreach/client/assistant/assistant.css', 'scripts/verify_outreach_assistant.mjs',
  'src/outreach/server/lib/assistant-ai.ts', 'src/outreach/server/lib/assistant.ts',
  'src/outreach/server/routes/assistant.routes.ts', 'src/outreach/shared/assistant.ts'];
const sourceHashes = () => Object.fromEntries(sourceFiles.map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
const sourceSha256 = sourceHashes();
const screenshots = [];
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
const fixtureTemplates = [
  { id: 'builtin-fixture', name: 'Fixture built-in offer', category: '产品推广', subject: 'Built-in catalog invitation',
    html: "<table data-growthos-template='en-v2' style='background:#efeeff;width:100%'><tbody><tr><td style='padding:24px'><h1>Fixture built-in offer</h1><p>Please review our product catalog.</p><img alt='Built-in product' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3pqdAAAAAASUVORK5CYII='><a href='https://catalog.example.com'>View our catalog</a></td></tr></tbody></table>" },
  { id: 'mine-fixture', name: 'Fixture personal catalog', category: 'My templates', subject: 'Personal catalog invitation',
    html: "<table style='background:#e8f5f1;width:100%'><tbody><tr><td style='padding:24px'><h1>Fixture personal catalog</h1><p>May we share our catalog with your team?</p><img alt='Personal product' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3pqdAAAAAASUVORK5CYII='><a href='https://catalog.example.com'>Open our catalog</a></td></tr></tbody></table>" },
];
const addTemplate = sqlite.prepare('INSERT INTO edm_templates(id,user_id,name,category,subject,body_html,body_text,created_at,updated_at) VALUES(?,?,?,?,?,?,?,0,0)');
for (const template of fixtureTemplates) addTemplate.run(template.id, 'workspace', template.name, template.category, template.subject, template.html, 'Review our catalog.');
// A known starter marks this isolated account as initialized, avoiding unrelated template seeding.
addTemplate.run('starter-fixture', 'workspace', 'Welcome email', 'My templates', 'Welcome', '<p>Welcome.</p>', 'Welcome.');
let app,
  env,
  browser,
  origin,
  confirmations = 0,
  modelRequests = 0,
  nextDraftingStatus = 'ready',
  nextOrdinaryFactChannels,
  failModel = false,
  loseConfirmation = false;
const confirmationIds = new Set();
const messageRequests = [];
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
                const composeChannels = input.composeChannels || [];
                const draftingStatus = nextDraftingStatus;
                nextDraftingStatus = 'ready';
                const ordinaryFactChannels = nextOrdinaryFactChannels;
                nextOrdinaryFactChannels = undefined;
                const draft = !composeChannels.length ? { channels: input.draft.channels.length ? input.draft.channels : ['email', 'site'] }
                  : { channels: ['email', 'site'], brief: input.latestInput };
                if (composeChannels.includes('email')) draft.email = draftingStatus === 'needs_facts'
                  ? { subject: 'Stale generic email', bodyHtml: '<p>Hello.</p>', bodyText: 'Hello.' }
                  : { subject: 'Catalog for your retail team', bodyHtml: '<p>Hello, we make stainless steel bottles. May I share our catalog?</p>', bodyText: 'We make stainless steel bottles. May I share our catalog?' };
                if (composeChannels.includes('site')) draft.site = draftingStatus === 'needs_facts'
                  ? { subject: 'Stale generic message', message: 'Hello, we would like to contact your team.' }
                  : { subject: 'Catalog inquiry', message: 'Hello, we make stainless steel bottles. May I share our catalog with your team?' };
                response = Response.json({
                  choices: [
                    {
                      message: {
                        content: JSON.stringify({
                          message: draftingStatus === 'needs_facts' && (composeChannels.length || ordinaryFactChannels?.length) ? '请补充产品材质，以及希望客户采取的行动。' : !composeChannels.length ? '先确定客户名单、目标网站和联系身份，再一起准备内容。' : '内容已准备，请查看真实预览并确认。',
                          draft,
                          ...(composeChannels.length || ordinaryFactChannels?.length ? { draftingStatus } : {}),
                          ...(ordinaryFactChannels?.length ? { draftingChannels: ordinaryFactChannels } : {}),
                        }),
                      },
                    },
                  ],
                });
              }
            } else {
              if (req.url.endsWith('/messages')) messageRequests.push(JSON.parse(body));
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
  const { templateRoutes } = await server.ssrLoadModule('/src/outreach/server/routes/template.routes.ts');
  const { seal } = await server.ssrLoadModule('/src/outreach/server/lib/credentials.ts');
  app = new Hono();
  app.use('*', async (c, next) => {
    c.set('user', { id: 'workspace', actorId: 'actor', role: principal.appRole, teamRead: true });
    await next();
  });
  app.route('/api/outreach/assistant', assistantRoutes);
  app.route('/api/outreach/campaigns', campaignRoutes);
  app.route('/api/outreach/site-messages', siteMessageRoutes);
  app.route('/api/outreach/templates', templateRoutes);
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
  const guided = page.getByRole('region', { name: '逐步准备发送' });
  const composer = page.getByLabel('给助手的消息', { exact: true });
  const atStep = async (step) => expect(guided).toHaveAttribute('data-guidance-step', step);
  const nextStep = async (step) => {
    const queued = queues.email.length + queues.site.length;
    await guided.getByRole('button', { name: '下一步', exact: true }).click();
    await atStep(step);
    expect(queues.email.length + queues.site.length).toBe(queued);
  };
  const selectSource = async (source) => guided.locator('[data-content-source="' + source + '"]').click();
  const sendChat = async (text, channel) => {
    await expect(composer).toHaveCount(1);
    await expect(page.getByLabel('内容要求', { exact: true })).toHaveCount(0);
    await composer.fill(text);
    await page.getByRole('button', { name: channel === 'email' ? '生成邮件' : channel === 'site' ? '生成网站留言' : '发给助手', exact: true }).click();
  };
  const verifyComposeRequest = (channel) => {
    expect(messageRequests.at(-1)).toMatchObject({ intent: 'compose', composeChannels: [channel] });
  };
  const noConfirm = async () => expect(page.getByRole('button', { name: /^确认.*(发送|提交|留言)/ })).toHaveCount(0);
  const newChannel = async (channel) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole('button', { name: '新建会话', exact: true }).click();
    await page.getByRole('button', { name: channel === 'email' ? /给客户发一封邮件/ : /向客户网站留言/ }).click();
    await atStep(channel === 'email' ? 'emailAudience' : 'siteTargets');
  };
  const completeIdentity = async (channel, name = 'Manual Seller') => {
    if (channel === 'email') await page.getByLabel('客户分组').selectOption('null');
    else await page.getByLabel('目标网站', { exact: true }).fill('https://buyer.example.com/contact');
    await nextStep('senderName');
    await page.getByLabel('发件人名称', { exact: true }).fill(name);
    await nextStep('senderEmail');
    if (channel === 'site') await expect(guided.getByText(/无需配置 EDM 发信域名/)).toBeVisible();
    await page.getByLabel('发件人邮箱', { exact: true }).fill('manual@example.com');
    await nextStep(channel === 'email' ? 'emailContent' : 'siteContent');
  };
  const readySession = async () => {
    const id = new URL(page.url()).searchParams.get('conversationId');
    const response = await page.request.get(origin + '/api/outreach/assistant/sessions/' + id);
    expect(response.status()).toBe(200);
    return (await response.json()).data;
  };
  const screenshot = async (name, options = {}) => {
    await page.screenshot({ path: artifacts + '/' + name, ...options });
    screenshots.push(name);
  };

  await page.goto(origin + '/?view=lazy-mode');
  await expect(page.getByRole('heading', { name: '今天想完成什么？' })).toBeVisible();
  await screenshot('welcome.png');
  // A first-message failure keeps one composer and recovers the same new conversation.
  failModel = true;
  const firstMessage = '请同时准备英文邮件和网站留言，介绍我们的不锈钢水杯。';
  await sendChat(firstMessage);
  await expect(page.getByRole('alert')).toContainText('原草稿已保留');
  await expect(composer).toHaveValue(firstMessage);
  await page.getByRole('button', { name: '重试这条消息', exact: true }).click();
  await atStep('emailAudience');
  await expect(composer).toHaveCount(0);
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('目标网站', { exact: true })).toHaveCount(0);
  await page.getByLabel('客户分组').selectOption('null');
  // A typed step is preserved across refresh and contact-list imports.
  await page.reload();
  await atStep('emailAudience');
  await expect(page.getByLabel('客户分组')).toHaveValue('null');
  sqlite.exec("INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES('imported','workspace','Newly imported',0,0)");
  await page.getByRole('button', { name: '刷新客户名单' }).click();
  await expect(page.getByLabel('客户分组').locator('option', { hasText: 'Newly imported' })).toHaveCount(1);
  await expect(page.getByLabel('客户分组')).toHaveValue('null');
  await nextStep('siteTargets');
  await page.getByLabel('目标网站', { exact: true }).fill('https://buyer.example.com/contact');
  await nextStep('senderName');
  await page.getByLabel('发件人名称', { exact: true }).fill('Alex');
  await page.reload();
  await atStep('senderName');
  await expect(page.getByLabel('发件人名称', { exact: true })).toHaveValue('Alex');
  await nextStep('senderEmail');
  await page.getByLabel('发件人邮箱', { exact: true }).fill('sales@example.com');
  await guided.getByRole('button', { name: '上一步', exact: true }).click();
  await atStep('senderName');
  await nextStep('senderEmail');
  await expect(page.getByLabel('发件人邮箱', { exact: true })).toHaveValue('sales@example.com');
  await nextStep('emailContent');
  await selectSource('ai');
  await expect(composer).toHaveCount(1);
  await expect(guided.locator('textarea')).toHaveCount(0);
  await expect(page.getByLabel('邮件主题', { exact: true })).toHaveCount(0);
  nextDraftingStatus = 'needs_facts';
  await sendChat('我们生产水杯，请帮我写邮件。', 'email');
  await atStep('emailContent');
  verifyComposeRequest('email');
  await expect(page.getByRole('log').getByText('请补充产品材质，以及希望客户采取的行动。', { exact: true })).toBeVisible();
  await noConfirm();
  await expect(page.getByRole('region', { name: '发送前预览' })).toHaveCount(0);
  let current = await readySession();
  expect(current.draftingStates.email).toBe('needs_facts'); expect(current.confirmationToken).toBeNull();
  await composer.fill('材质为不锈钢，希望客户回复索取目录。');
  await page.reload();
  await atStep('emailContent');
  await expect(composer).toHaveValue('材质为不锈钢，希望客户回复索取目录。');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await selectSource('manual');
  await expect(composer).toHaveCount(0);
  await expect(page.getByLabel('邮件正文', { exact: true })).toBeVisible();
  await selectSource('ai');
  await expect(composer).toHaveCount(1);
  await expect(composer).toHaveValue('材质为不锈钢，希望客户回复索取目录。');
  await composer.scrollIntoViewIfNeeded();
  await screenshot('ai-clarification-mobile.png');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await sendChat('材质为不锈钢，希望客户回复索取目录。', 'email');
  await atStep('siteContent');
  verifyComposeRequest('email');
  await expect(page.getByLabel('邮件正文', { exact: true })).toHaveCount(0);
  current = await readySession();
  expect(current.draftingStates.email).toBe('ready'); expect(current.draft.channels).toEqual(['email', 'site']);
  await selectSource('ai');
  await sendChat('介绍我们的不锈钢水杯，邀请客户回复索取目录。', 'site');
  await atStep('review');
  verifyComposeRequest('site');
  current = await readySession();
  expect(current.draftingStates).toMatchObject({ email: 'ready', site: 'ready' });
  // A review-stage clarification scopes its facts to email and preserves the prepared site content.
  nextDraftingStatus = 'needs_facts';
  nextOrdinaryFactChannels = ['email'];
  await sendChat('只修改邮件，改为另一款产品，请先问我需要哪些产品资料。');
  await atStep('emailContent');
  expect(messageRequests.at(-1).intent).toBeUndefined();
  expect(messageRequests.at(-1).composeChannels).toBeUndefined();
  current = await readySession();
  expect(current.draftingStates).toMatchObject({ email: 'needs_facts', site: 'ready' });
  expect(current.confirmationToken).toBeNull();
  await noConfirm();
  await sendChat('另一款同样为不锈钢水杯，请邀请客户回复索取目录。', 'email');
  await atStep('review');
  verifyComposeRequest('email');
  current = await readySession();
  expect(current.draftingStates).toMatchObject({ email: 'ready', site: 'ready' });
  await expect(page.getByRole('region', { name: '发送前预览' })).toBeVisible();
  await expect(page.frameLocator('iframe[title="邮件内容预览"]').locator('body')).toContainText('Hello, we make stainless steel bottles.');
  await expect(page.getByLabel('邮件主题', { exact: true })).toHaveCount(0);
  expect(queues.email.length + queues.site.length).toBe(0); expect(confirmations).toBe(0);
  const confirm = page.getByRole('button', { name: '确认发送 1 封邮件并向 1 个网站留言', exact: true });
  await expect(confirm).toBeDisabled();
  await page.getByRole('checkbox', { name: /这些网站允许提交/ }).check();
  await expect(confirm).toBeEnabled();
  await page.reload();
  await atStep('review');
  await expect(confirm).toBeDisabled();
  await expect(page.getByText('Alex · sales@example.com', { exact: true })).toBeVisible();
  await screenshot('preview.png', { fullPage: true });
  // Outage preserves the reviewed draft and the user's request without making another send task.
  failModel = true;
  await sendChat('再短一点');
  await expect(page.getByRole('alert')).toContainText('原草稿已保留');
  await expect(composer).toHaveValue('再短一点');
  await page.reload();
  await expect(composer).toHaveValue('再短一点');
  await page.getByRole('checkbox', { name: /这些网站允许提交/ }).check();
  loseConfirmation = true;
  await confirm.click();
  await expect(page.getByRole('region', { name: '任务结果' })).toBeVisible();
  expect(confirmationIds.size).toBe(1); expect(queues.email).toHaveLength(1); expect(queues.site).toHaveLength(1);
  const recoveredRequests = confirmations;
  await page.reload();
  await expect(page.getByRole('region', { name: '任务结果' })).toBeVisible();
  expect(confirmations).toBe(recoveredRequests);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载结果 CSV', exact: true }).first().click();
  await (await downloadPromise).saveAs(artifacts + '/results.csv');
  assert.match(readFileSync(artifacts + '/results.csv', 'utf8'), /buyer@example.com/);
  await screenshot('results.png', { fullPage: true });
  await page.getByRole('button', { name: '在工作台查看', exact: true }).last().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  assert.ok(new URL(page.url()).searchParams.get('siteJobId'));
  await page.getByRole('button', { name: '关闭任务详情' }).click();
  await page.getByRole('navigation', { name: '工作台导航' }).getByRole('button', { name: '懒人模式', exact: true }).click();
  await expect(page.getByRole('region', { name: '任务结果' })).toBeVisible();
  principal = { ...principal, appRole: 'viewer' };
  await page.reload();
  await expect(composer).toHaveCount(0);
  await expect(page.getByText(/当前角色仅可查看会话/)).toBeVisible();
  principal = { ...principal, appRole: 'admin' };
  await page.reload();

  // Manual entry is an optional content editor, rather than mandatory subject/body wizard pages.
  for (const channel of ['email', 'site']) {
    await newChannel(channel);
    if (channel === 'site') {
      await page.getByLabel('目标网站', { exact: true }).fill('https://buyer.example.com/contact\nnot-a-website');
      await guided.getByRole('button', { name: '下一步', exact: true }).click();
      await expect(guided.getByRole('alert')).toContainText('请修改无效网址');
      await atStep('siteTargets');
    }
    await completeIdentity(channel);
    await selectSource('manual');
    await expect(composer).toHaveCount(0);
    await expect(page.getByLabel(channel === 'email' ? '邮件主题' : '留言主题', { exact: true })).toHaveValue('');
    if (channel === 'email') await page.getByLabel('邮件主题', { exact: true }).fill('Manual catalog proposal');
    await page.getByLabel(channel === 'email' ? '邮件正文' : '网站留言', { exact: true }).fill('Hello, may we send your team our catalog?');
    // Refresh restores the optional editor and its unsaved subject/body together.
    await page.reload();
    await atStep(channel === 'email' ? 'emailContent' : 'siteContent');
    await expect(page.getByLabel(channel === 'email' ? '邮件正文' : '网站留言', { exact: true })).toHaveValue('Hello, may we send your team our catalog?');
    const beforeModels = modelRequests;
    await guided.getByRole('button', { name: /^保存(邮件|留言)，(继续|查看预览)$/ }).click();
    await atStep('review');
    expect(modelRequests).toBe(beforeModels);
    const singleConfirm = page.getByRole('button', { name: channel === 'email' ? '确认向 1 位客户发送' : '确认向 1 个网站提交', exact: true });
    if (channel === 'email') {
      await expect(singleConfirm).toBeEnabled();
      await expect(page.getByRole('checkbox', { name: /这些网站允许提交/ })).toHaveCount(0);
      await expect(page.frameLocator('iframe[title="邮件内容预览"]').locator('body')).toContainText('Hello, may we send your team our catalog?');
      // Asking to rewrite an old complete draft requires facts; the old text must not authorize sending.
      await guided.getByRole('button', { name: '修改邮件或换模板', exact: true }).click();
      await atStep('emailContent');
      // A candidate template is only a preview. Leaving it restores the saved content.
      await selectSource('template');
      await guided.locator('[data-template-id="builtin-fixture"]').click();
      await expect(guided.locator('[aria-label="所选模板预览"]')).toBeVisible();
      await selectSource('ai');
      await expect(guided.locator('[aria-label="所选模板预览"]')).toHaveCount(0);
      await expect(guided.locator('[aria-label="已保存的发送内容"]')).toBeVisible();
      await expect(guided.getByRole('button', { name: '使用这封邮件，继续', exact: true })).toBeVisible();
      await selectSource('manual');
      await expect(composer).toHaveCount(0);
      await expect(page.getByLabel('邮件正文', { exact: true })).toHaveValue('Hello, may we send your team our catalog?');
      await selectSource('ai');
      await expect(composer).toHaveCount(1);
      await expect(composer).toHaveValue('');
      await expect(page.getByRole('button', { name: '生成邮件', exact: true })).toBeDisabled();
      nextDraftingStatus = 'needs_facts';
      await sendChat('换成介绍另一款产品，请先问我需要什么资料。', 'email');
      await atStep('emailContent'); await noConfirm();
      current = await readySession();
      expect(current.draftingStates.email).toBe('needs_facts'); expect(current.confirmationToken).toBeNull();
      await page.reload();
      await atStep('emailContent'); await noConfirm();
      await expect(composer).toHaveCount(1);
      await screenshot('old-draft-needs-facts.png', { fullPage: true });
      await sendChat('另一款也是不锈钢水杯，邀请对方回复索取目录。', 'email');
      await atStep('review'); verifyComposeRequest('email');
      await expect(singleConfirm).toBeEnabled();
    } else {
      await expect(singleConfirm).toBeDisabled();
      await page.getByRole('checkbox', { name: /这些网站允许提交/ }).check();
      await expect(singleConfirm).toBeEnabled();
      await page.reload();
      await atStep('review'); await expect(singleConfirm).toBeDisabled();
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await screenshot(channel + '-only-review.png', { fullPage: true });
    expect(confirmationIds.size).toBe(1); expect(queues.email).toHaveLength(1); expect(queues.site).toHaveLength(1);
  }

  // Built-in and workspace templates retain their existing table, style and image markup without AI.
  for (const template of fixtureTemplates) {
    await newChannel('email');
    await completeIdentity('email', 'Template Seller');
    const beforeModels = modelRequests;
    await selectSource('template');
    const tabs = guided.locator('[aria-label="模板类型"]');
    await tabs.getByRole('button', { name: template.id === 'builtin-fixture' ? '内置模板' : '我的模板', exact: true }).click();
    await guided.locator('[data-template-id="' + template.id + '"]').click();
    const selectedPreview = guided.locator('[aria-label="所选模板预览"]');
    await expect(selectedPreview).toBeVisible();
    await expect(composer).toHaveCount(0);
    if (template.id === 'builtin-fixture') {
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await selectedPreview.scrollIntoViewIfNeeded();
      await screenshot('template-picker-mobile.png');
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await guided.getByRole('button', { name: '使用这个模板，查看预览', exact: true }).click();
    await atStep('review');
    expect(modelRequests).toBe(beforeModels);
    current = await readySession();
    expect(current.draft.email.templateId).toBe(template.id);
    expect(current.draft.email.bodyHtml).toBe(template.html);
    expect(current.draftingStates.email).toBe('ready');
    expect(sqlite.prepare('SELECT body_html FROM edm_templates WHERE id=?').get(template.id).body_html).toBe(template.html);
    const preview = page.frameLocator('iframe[title="邮件内容预览"]');
    await expect(preview.getByRole('heading', { name: template.name, exact: true })).toBeVisible();
    await expect(preview.locator('table')).toHaveCSS('background-color', template.id === 'builtin-fixture' ? 'rgb(239, 238, 255)' : 'rgb(232, 245, 241)');
    await expect(preview.getByRole('img')).toHaveCount(1);
    await expect(page.getByRole('button', { name: '确认向 1 位客户发送', exact: true })).toBeEnabled();
    await page.reload(); await atStep('review');
    current = await readySession(); expect(current.draft.email.bodyHtml).toBe(template.html);
    await screenshot(template.id + '-review.png', { fullPage: true });
    expect(confirmationIds.size).toBe(1); expect(queues.email).toHaveLength(1); expect(queues.site).toHaveLength(1);
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(sourceHashes(), sourceSha256, 'Acceptance inputs changed while the fixture was running');
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
        aiComposeSkipsManualSteps: true,
        needsFactsRevokesOldConfirmation: true,
        reviewClarificationPreservesOtherReadyChannel: true,
        templatesPreserveHtmlWithoutAi: true,
        candidateTemplateSourceSwitchRestoresSavedContent: true,
        mobileContentSourceSwitch: true,
        uniqueChatComposer: true,
        screenshots,
        sourceSha256,
        passed: true,
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS: real assistant routes, coherent email/site/both AI and manual journeys, single composer, explicit clarification, direct preview, visual templates without AI, back/reload, outage, lost-confirmation recovery, CSV, viewer and mobile. Queues and model are fixtures; no external delivery.',
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
