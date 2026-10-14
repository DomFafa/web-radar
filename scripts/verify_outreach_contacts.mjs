// Real browser, existing application and contact/assistant routes, isolated SQLite.
// No account, paid model, delivery queue, or external request is used.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'vite';
import { Hono } from 'hono';
import { chromium, expect } from '@playwright/test';

const artifacts = process.env.CONTACTS_ACCEPTANCE_OUTPUT || '/tmp/web-radar-contacts-acceptance';
mkdirSync(artifacts, { recursive: true });
const inputs = [
  'src/client/App.tsx', 'src/outreach/client/App.tsx',
  'src/outreach/client/pages/ContactsPage.tsx', 'src/outreach/client/pages/ContactImportReports.tsx',
  'src/outreach/client/assistant/AssistantPage.tsx', 'src/outreach/client/assistant/GuidedDraft.tsx',
  'src/outreach/client/assistant/AssistantCards.tsx', 'src/outreach/shared/assistant.ts',
  'src/outreach/client/styles/index.css', 'src/outreach/client/assistant/assistant.css',
  'src/outreach/server/lib/assistant.ts', 'src/outreach/server/routes/assistant.routes.ts',
  'src/outreach/server/routes/contact.routes.ts', 'src/outreach/server/routes/contact-import.routes.ts',
  'src/outreach/server/lib/contact-import.ts', 'scripts/verify_outreach_contacts.mjs',
];
const hashes = () => Object.fromEntries(inputs.map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
const sourceSha256 = hashes(), screenshots = [], errors = [], batches = [], forbidden = [];
const sqlite = new DatabaseSync(':memory:');
for (const file of readdirSync('migrations').filter((name) => name.endsWith('.sql')).sort())
  sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
sqlite.exec("INSERT INTO edm_users(id,name,email,role,created_at,updated_at) VALUES('workspace','Fixture','fixture@example.com','member',0,0)");
const principal = {
  userId: 'actor', workspaceId: 'workspace', workspaceRole: 'admin', appRole: 'admin',
  systemRole: 'user', authSubject: 'actor', email: 'fixture@example.com', displayName: '联系人验收', workspaceName: '隔离测试工作区',
};
const originalFetch = globalThis.fetch;
let app, env, browser, origin, releaseFirstBatch;
let firstBatchGate = null;
const server = await createServer({
  configFile: false, cacheDir: artifacts + '/vite-cache', server: { host: '127.0.0.1', port: 0 },
  plugins: [{
    name: 'isolated-contacts-acceptance',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();
        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = Buffer.concat(chunks).toString();
          let response;
          if (req.url === '/api/config') response = Response.json({ testMode: false, services: [] });
          else if (req.url === '/api/auth/me') response = Response.json({ principal });
          else {
            if (req.url.endsWith('/confirm') || req.url.endsWith('/messages')) {
              forbidden.push(req.url);
              throw new Error('No model generation or sending is allowed in contacts acceptance');
            }
            if (req.url.endsWith('/batches')) {
              const input = JSON.parse(body);
              batches.push({ batchIndex: input.batchIndex, count: input.contacts.length });
              if (input.batchIndex === 0 && firstBatchGate) {
                await firstBatchGate;
                firstBatchGate = null;
              }
            }
            response = await app.fetch(new Request(origin + req.url, {
              method: req.method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body } : {}),
            }), env);
          }
          res.statusCode = response.status;
          for (const [key, value] of response.headers) res.setHeader(key, value);
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          errors.push(String(error));
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  }],
});
const started = performance.now();
try {
  const modules = {};
  for (const name of ['assistant', 'contact', 'contact-import'])
    modules[name] = await server.ssrLoadModule('/src/outreach/server/routes/' + name + '.routes.ts');
  const { d1 } = await server.ssrLoadModule('/tests/outreach/sqlite.ts');
  const { seal } = await server.ssrLoadModule('/src/outreach/server/lib/credentials.ts');
  app = new Hono();
  app.use('*', async (c, next) => {
    c.set('user', { id: 'workspace', actorId: 'actor', role: 'admin', teamRead: true });
    await next();
  });
  app.route('/api/outreach/contacts/imports', modules['contact-import'].contactImportRoutes);
  app.route('/api/outreach/contacts', modules.contact.contactRoutes);
  app.route('/api/outreach/assistant', modules.assistant.assistantRoutes);
  const noQueue = async () => { forbidden.push('queue'); throw new Error('Delivery disabled'); };
  env = {
    DB: d1(sqlite), TEST_MODE: false, ENCRYPTION_KEY: 'fixture-key-long-enough-for-acceptance',
    CREDENTIAL_KEY: 'fixture-key-long-enough-for-acceptance', JWT_SECRET: 'fixture-jwt-secret-long-enough',
    EMAIL_QUEUE: { send: noQueue, sendBatch: noQueue }, SITE_MESSAGE_QUEUE: { send: noQueue }, BROWSER: {},
  };
  const credential = await seal('fixture-only', 'provider', env);
  sqlite.prepare("INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at) VALUES('provider','workspace','sendgrid','Fixture mail',?,1,0,0)").run(credential);
  await server.listen();
  origin = server.resolvedUrls.local[0].replace(/\/$/, '');
  globalThis.fetch = (url, init) => {
    const address = url instanceof Request ? url.url : String(url);
    if (new URL(address).origin === origin) return originalFetch(url, init);
    forbidden.push(address);
    throw new Error('External requests disabled');
  };
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', (route) => new URL(route.request().url()).origin === origin
    || route.request().url().startsWith('blob:') ? route.continue() : route.abort());
  const guided = page.getByRole('region', { name: '逐步准备发送' });
  const atStep = async (name) => expect(guided).toHaveAttribute('data-guidance-step', name);
  const modal = (heading) => page.locator('.modal').filter({ has: page.getByRole('heading', { name: heading, exact: true }) });
  const screenshot = async (name, options = {}) => {
    await page.screenshot({ path: artifacts + '/' + name, ...options }); screenshots.push(name);
  };
  const returnToConversation = async (id) => {
    await page.getByRole('button', { name: /返回.*(会话|懒人模式).*|回到.*(会话|懒人模式).*|继续.*(邮件|准备发送|发送)/ }).click();
    await atStep('emailAudience');
    expect(new URL(page.url()).searchParams.get('conversationId')).toBe(id);
    expect(new URL(page.url()).searchParams.get('view')).toBe('lazy-mode');
  };
  await page.goto(origin + '/?view=lazy-mode');
  await expect(page.getByRole('heading', { name: '今天想完成什么？' })).toBeVisible();
  await page.getByRole('button', { name: /给客户发一封邮件/ }).click();
  await atStep('emailAudience');
  const conversationId = new URL(page.url()).searchParams.get('conversationId');
  expect(conversationId).toBeTruthy();
  await expect(page.getByRole('navigation', { name: '工作台导航' }).getByRole('button', { name: /联系人/ })).toBeVisible();
  await screenshot('audience-entry-desktop.png');

  // Create a group and one contact through the prominent audience-step entries.
  await guided.getByRole('button', { name: /新建分组|管理分组/ }).click();
  await expect(page.getByRole('heading', { name: '联系人管理', exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('view')).toBe('contacts');
  expect(new URL(page.url()).searchParams.get('conversationId')).toBe(conversationId);
  const groupsModal = modal('分组管理');
  await expect(groupsModal).toBeVisible();
  await groupsModal.getByPlaceholder('分组名称 *').fill('VIP 客户');
  await groupsModal.getByRole('button', { name: '添加分组', exact: true }).click();
  await expect(groupsModal.locator('tbody')).toContainText('VIP 客户');
  await groupsModal.locator('.modal-header button').click();
  await returnToConversation(conversationId);
  await expect(page.getByLabel('客户分组').locator('option', { hasText: 'VIP 客户' })).toHaveCount(1);

  await guided.getByRole('button', { name: /添加联系人|添加客户/ }).click();
  const addModal = modal('添加联系人');
  await expect(addModal).toBeVisible();
  await addModal.getByPlaceholder('contact@example.com').fill('vip@example.com');
  await addModal.getByPlaceholder('John Doe').fill('VIP Buyer');
  const vip = sqlite.prepare("SELECT id FROM edm_contact_groups WHERE user_id='workspace' AND name='VIP 客户'").get();
  await addModal.locator('select').selectOption(vip.id);
  await addModal.locator('button[type=submit]').click();
  await expect(addModal).toHaveCount(0);
  expect(sqlite.prepare("SELECT group_id FROM edm_contacts WHERE email='vip@example.com'").get().group_id).toBe(vip.id);
  const moveGroup = page.locator('select').filter({ has: page.getByRole('option', { name: '移动到...', exact: true }) });
  await page.getByRole('checkbox', { name: '选择 vip@example.com', exact: true }).check();
  await moveGroup.selectOption('null');
  await page.getByRole('button', { name: '确认移动', exact: true }).click();
  await expect.poll(() => sqlite.prepare("SELECT group_id FROM edm_contacts WHERE email='vip@example.com'").get().group_id).toBeNull();
  await expect(page.getByRole('checkbox', { name: '选择 vip@example.com', exact: true })).not.toBeChecked();
  await page.getByRole('checkbox', { name: '选择 vip@example.com', exact: true }).check();
  await moveGroup.selectOption(vip.id);
  await page.getByRole('button', { name: '确认移动', exact: true }).click();
  await expect.poll(() => sqlite.prepare("SELECT group_id FROM edm_contacts WHERE email='vip@example.com'").get().group_id).toBe(vip.id);
  await returnToConversation(conversationId);
  await expect(page.getByLabel('客户分组').locator('option', { hasText: 'VIP 客户' })).toHaveText(/1 位联系人/);

  // Download the existing standard CSV, then upload 20,000 rows from the actual file input.
  await guided.getByRole('button', { name: /批量导入/ }).click();
  const importModal = modal('批量导入联系人');
  await expect(importModal).toBeVisible();
  const templateDownload = page.waitForEvent('download');
  await importModal.getByRole('button', { name: /下载 CSV 导入模板/ }).click();
  const downloadedTemplate = await templateDownload;
  const templatePath = artifacts + '/downloaded-template.csv';
  await downloadedTemplate.saveAs(templatePath);
  const template = readFileSync(templatePath, 'utf8');
  expect(template).toContain('"邮箱","名称","公司","网站","行业","地区","标签"');
  const lines = ['邮箱,名称,公司,网站,行业,地区,标签'];
  for (let index = 1; index <= 20000; index++)
    lines.push(`buyer${String(index).padStart(5, '0')}@example.com,"Buyer ${index}, Retail",Fixture Co,https://example.com,Toys,US,大名单|验收`);
  await importModal.locator('input[type=file]').setInputFiles({ name: 'buyers-20000.csv', mimeType: 'text/csv', buffer: Buffer.from('\uFEFF' + lines.join('\r\n')) });
  await expect(importModal.getByText('已识别 20000 行联系人数据', { exact: true })).toBeVisible();
  await importModal.locator('select').selectOption('__create_import_group__');
  await importModal.getByLabel('新分组名称').fill('大批量客户');
  await importModal.getByRole('button', { name: '创建并选择', exact: true }).click();
  await expect.poll(() => sqlite.prepare("SELECT COUNT(*) AS count FROM edm_contact_groups WHERE user_id='workspace' AND name='大批量客户'").get().count).toBe(1);
  const bulkGroup = sqlite.prepare("SELECT id FROM edm_contact_groups WHERE user_id='workspace' AND name='大批量客户'").get();
  expect(bulkGroup).toBeTruthy();
  await expect(importModal.locator('select')).toHaveValue(bulkGroup.id);
  firstBatchGate = new Promise((resolve) => { releaseFirstBatch = resolve; });
  const importStarted = performance.now();
  await importModal.getByRole('button', { name: '开始导入', exact: true }).click();
  await expect.poll(() => batches.length).toBe(1);
  const navigation = page.getByRole('navigation', { name: '工作台导航' });
  await expect(navigation.getByRole('button', { name: '懒人模式', exact: true })).toBeDisabled();
  await navigation.getByRole('button', { name: '懒人模式', exact: true }).evaluate((node) => node.click());
  expect(new URL(page.url()).searchParams.get('view')).toBe('contacts');
  await screenshot('import-in-progress-desktop.png');
  releaseFirstBatch();
  await expect(importModal.getByText('导入完成：成功 20000，跳过 0，失败 0', { exact: true })).toBeVisible({ timeout: 120000 });
  const importElapsedMs = Math.round(performance.now() - importStarted);
  expect(batches).toEqual(Array.from({ length: 40 }, (_, batchIndex) => ({ batchIndex, count: 500 })));
  const job = sqlite.prepare("SELECT * FROM edm_contact_import_jobs WHERE name='buyers-20000.csv'").get();
  expect(job).toMatchObject({ total: 20000, processed: 20000, imported: 20000, skipped: 0, failed: 0 });
  expect(sqlite.prepare('SELECT COUNT(*) AS count FROM edm_contacts WHERE group_id=?').get(bulkGroup.id).count).toBe(20000);
  await screenshot('import-complete-desktop.png');

  // Results and CSV come from the actual persistent import job, not the UI progress count.
  await importModal.getByRole('button', { name: '查看进度与报告', exact: true }).click();
  const report = page.getByRole('dialog', { name: '导入进度与报告' });
  await expect(report).toBeVisible();
  await expect(report.getByText('20000 / 20000 (100%)', { exact: false })).toBeVisible();
  await report.getByRole('button', { name: '查看明细', exact: true }).click();
  await expect(report.locator('tbody tr')).toHaveCount(100);
  const firstReportEmail = await report.locator('tbody tr').first().textContent();
  await report.getByRole('button', { name: '下一页', exact: true }).click();
  await expect(report.getByText('第 2 页', { exact: true })).toBeVisible();
  expect(await report.locator('tbody tr').first().textContent()).not.toBe(firstReportEmail);
  const reportDownload = page.waitForEvent('download');
  await report.getByRole('button', { name: '下载完整报告', exact: true }).click();
  const downloadedReport = await reportDownload;
  const reportPath = artifacts + '/import-report.csv';
  await downloadedReport.saveAs(reportPath);
  const reportCsv = readFileSync(reportPath, 'utf8');
  expect(reportCsv.split('\r\n').filter(Boolean)).toHaveLength(20001);
  expect(reportCsv).toContain('buyer00001@example.com'); expect(reportCsv).toContain('buyer20000@example.com');
  await report.getByRole('button', { name: '关闭报告', exact: true }).click();
  await importModal.getByRole('button', { name: '关闭窗口', exact: true }).click();
  await returnToConversation(conversationId);
  await page.getByLabel('客户分组').selectOption(bulkGroup.id);
  await guided.getByRole('button', { name: '下一步', exact: true }).click(); await atStep('senderName');
  await page.getByLabel('发件人名称', { exact: true }).fill('Fixture Seller');
  await guided.getByRole('button', { name: '下一步', exact: true }).click(); await atStep('senderEmail');
  await page.getByLabel('发件人邮箱', { exact: true }).fill('seller@example.com');
  await guided.getByRole('button', { name: '下一步', exact: true }).click(); await atStep('emailContent');
  await guided.locator('[data-content-source=manual]').click();
  await page.getByLabel('邮件主题', { exact: true }).fill('Catalog for your retail team');
  await page.getByLabel('邮件正文', { exact: true }).fill('Hello, may we share our product catalog with your retail team?');
  await guided.getByRole('button', { name: '保存邮件，继续', exact: true }).click(); await atStep('review');
  const preview = page.getByRole('region', { name: '发送前预览' });
  await expect(preview.getByRole('heading', { name: 'EDM 邮件 · 20000 位客户', exact: true })).toBeVisible();
  await expect(preview.getByRole('button', { name: '确认向 20000 位客户发送', exact: true })).toBeEnabled();
  await preview.getByText('查看本次收件名单', { exact: true }).click();
  const recipients = preview.locator('.wr-lazy-contact-list p');
  expect(await recipients.count()).toBeGreaterThan(0); expect(await recipients.count()).toBeLessThanOrEqual(100);
  const recipientDomPageSize = await recipients.count();
  const firstRecipient = await recipients.first().textContent();
  await preview.getByRole('button', { name: '下一页名单', exact: true }).click();
  await expect(recipients.first()).not.toHaveText(firstRecipient);
  const sessionResponse = await page.request.get(origin + '/api/outreach/assistant/sessions/' + conversationId);
  expect(sessionResponse.status()).toBe(200);
  const session = (await sessionResponse.json()).data;
  expect(session.preview.email.count).toBe(20000); expect(session.draft.email.groupId).toBe(bulkGroup.id);
  expect(session.pendingChannels).toEqual(['email']);
  await screenshot('recipient-preview-desktop.png');

  // Mobile flow retains visible entry points, avoids page overflow and keeps the upload controls readable.
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot('recipient-preview-mobile.png');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: '修改选择客户', exact: true }).click();
  await atStep('emailAudience');
  await guided.scrollIntoViewIfNeeded();
  await screenshot('audience-entry-mobile.png');
  await guided.getByRole('button', { name: /批量导入/ }).click();
  await expect(importModal).toBeVisible();
  await screenshot('import-mobile.png');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const modalRect = await importModal.boundingBox();
  expect(modalRect.width).toBeLessThanOrEqual(390);
  await importModal.getByRole('button', { name: '关闭窗口', exact: true }).click();
  await returnToConversation(conversationId);

  // An existing ready group can grow between visits. The original draft must remain editable.
  sqlite.prepare("INSERT INTO edm_contacts(id,user_id,email,name,group_id,created_at,updated_at) VALUES('dynamic-extra','workspace','extra@example.com','Additional Buyer',?,0,0)").run(bulkGroup.id);
  sqlite.prepare('UPDATE edm_contact_groups SET contact_count=contact_count+1 WHERE id=?').run(bulkGroup.id);
  await page.reload();
  await atStep('emailAudience');
  await expect(guided.getByRole('alert')).toContainText('20,001');
  await expect(page.getByRole('button', { name: /^确认向.*客户发送$/ })).toHaveCount(0);
  const oversizedResponse = await page.request.get(origin + '/api/outreach/assistant/sessions/' + conversationId);
  expect(oversizedResponse.status()).toBe(200);
  const oversized = (await oversizedResponse.json()).data;
  expect(oversized.preview.email.count).toBe(20001); expect(oversized.preview.email.recipients).toEqual([]);
  expect(oversized.confirmationToken).toBeNull(); expect(oversized.draft.email.subject).toBe(session.draft.email.subject);
  await screenshot('grown-group-recovery-mobile.png');
  await page.getByLabel('客户分组').selectOption(vip.id);
  for (const step of ['senderName', 'senderEmail', 'emailContent']) {
    await guided.getByRole('button', { name: '下一步', exact: true }).click(); await atStep(step);
  }
  await guided.locator('[data-content-source=manual]').click();
  await expect(page.getByLabel('邮件主题', { exact: true })).toHaveValue(session.draft.email.subject);
  await expect(page.getByLabel('邮件正文', { exact: true })).toHaveValue(session.draft.email.bodyText);
  await guided.getByRole('button', { name: '保存邮件，继续', exact: true }).click(); await atStep('review');
  await expect(preview.getByRole('heading', { name: 'EDM 邮件 · 1 位客户', exact: true })).toBeVisible();
  await expect(preview.getByRole('button', { name: '确认向 1 位客户发送', exact: true })).toBeEnabled();
  expect(new URL(page.url()).searchParams.get('conversationId')).toBe(conversationId);
  expect(forbidden).toEqual([]); expect(errors).toEqual([]);
  assert.deepEqual(hashes(), sourceSha256, 'Acceptance inputs changed while the browser was running');
  const evidence = {
    passed: true, sourceSha256, screenshots, contactsImported: 20000, importBatches: batches,
    importElapsedMs, conversationPreserved: true, previewCount: session.preview.email.count,
    recipientDomPageSize, reports: { rows: 20000, downloaded: true, paginated: true },
    cases: ['global-navigation', 'create-group', 'add-contact', 'move-contact-group', 'template-download', 'real-20000-csv-import',
      'import-navigation-lock', 'import-report-download', 'return-original-conversation', '20000-recipient-preview',
      'recipient-dom-pagination', 'mobile', 'dynamic-grown-group-preserves-editable-draft'], errors, forbidden, elapsedMs: Math.round(performance.now() - started),
    realSending: false, paidGeneration: false, liveCustomerAccount: false,
  };
  writeFileSync(artifacts + '/evidence.json', JSON.stringify(evidence, null, 2));
  process.stdout.write(JSON.stringify({ passed: true, contacts: 20000, batches: batches.length, importElapsedMs, artifacts, elapsedMs: evidence.elapsedMs }) + '\n');
} catch (error) {
  const failedPage = browser?.contexts()[0]?.pages()[0];
  if (failedPage) await failedPage.screenshot({ path: artifacts + '/failure.png', fullPage: true }).catch(() => {});
  writeFileSync(artifacts + '/failure.json', JSON.stringify({ error: String(error), stack: error.stack, sourceSha256, batches, errors, forbidden, screenshots }, null, 2));
  throw error;
} finally {
  releaseFirstBatch?.();
  await browser?.close(); await server.close(); globalThis.fetch = originalFetch; sqlite.close();
}
