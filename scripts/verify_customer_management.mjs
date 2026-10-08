// Real local Worker, isolated D1 migrations and signed inbound mail. No delivery or AI call.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash, createHmac } from 'node:crypto';
import { unstable_startWorker } from 'wrangler';
import { chromium, expect } from '@playwright/test';

const output = process.env.CRM_ACCEPTANCE_OUTPUT || 'artifacts/customer-management';
await mkdir(output, { recursive: true });
const persist = output + '/state-' + Date.now(),
  origin = 'http://127.0.0.1:8796';
const started = performance.now(),
  timings = {},
  cases = [],
  screenshots = [],
  pageErrors = [],
  forbidden = [];
const sourceInputs = [
  'src/client/CustomerManagement.tsx',
  'src/client/CrmActivity.tsx',
  'src/client/customer-management.css',
  'src/client/App.tsx',
  'src/client/CustomerInbox.tsx',
  'src/shared/crm.ts',
  'src/worker/crm/api.ts',
  'src/worker/crm/sql.ts',
  'src/worker/crm/activity.ts',
  'src/worker/crm/capture.ts',
  'migrations/0014_crm_activity_groups.sql',
  'src/outreach/client/pages/SendingCenterPage.tsx',
  'src/outreach/client/lib/crm-email-handoff.ts',
  'src/outreach/server/queues/email-send.queue.ts',
  'src/outreach/server/routes/campaign.routes.ts',
  'scripts/verify_customer_management.mjs',
];
const hashes = async () =>
  Object.fromEntries(
    await Promise.all(
      sourceInputs.map(async (path) => [
        path,
        createHash('sha256')
          .update(await readFile(path))
          .digest('hex'),
      ]),
    ),
  );
const inputHashes = await hashes();
const cli = async (args) => {
  const result = await promisify(execFile)(
    process.execPath,
    [
      'node_modules/wrangler/bin/wrangler.js',
      'd1',
      ...args,
      '--local',
      '--env',
      'test',
      '--persist-to',
      persist,
    ],
    { timeout: 45000, maxBuffer: 4 * 1024 * 1024 },
  );
  return result.stdout;
};
const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";
let worker, browser;
const stage = async (name, action) => {
  const begin = performance.now();
  const result = await action();
  timings[name] = Math.round(performance.now() - begin);
  return result;
};
try {
  await stage('migrationsMs', () => cli(['migrations', 'apply', 'web-radar']));
  await stage('workerStartupMs', async () => {
    worker = await unstable_startWorker({
      config: 'wrangler.jsonc',
      env: 'test',
      dev: {
        server: { hostname: '127.0.0.1', port: 8796 },
        persist,
        inspector: false,
        watch: false,
        logLevel: 'error',
      },
    });
    await worker.ready;
  });
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });
  const login = async (identity, viewport = { width: 1440, height: 1000 }) => {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const response = await context.request.post(origin + '/api/auth/test-login', {
      data: { identity },
    });
    assert.equal(response.status(), 200, 'local test login');
    context.on('page', (page) => {
      page.on('pageerror', (error) => pageErrors.push({ identity, error: error.message }));
    });
    await context.route('**/*', (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (url.origin !== origin && !['about:', 'blob:', 'data:'].includes(url.protocol)) {
        forbidden.push(url.href);
        return route.abort();
      }
      if (/\/api\/outreach\/(campaigns|site-messages)\/.+\/(send|start)$/.test(url.pathname)) {
        forbidden.push(url.pathname);
        return route.abort();
      }
      return route.continue();
    });
    return context;
  };
  const admin = await login('admin'),
    owner = await login('owner'),
    analyst = await login('member');
  const getJson = async (context, path) => {
    const response = await context.request.get(origin + path);
    assert.equal(response.status(), 200, path);
    return response.json();
  };
  const configResponse = await admin.request.post(origin + '/api/inbox/configs', {
    data: {
      domain: 'reply.crm.example',
      forwardTo: 'sales@work.example',
      trackEdm: true,
      trackSites: true,
      teamBody: false,
    },
  });
  assert.equal(configResponse.status(), 200);
  const config = await configResponse.json();
  const now = new Date().toISOString(),
    epoch = Math.floor(Date.now() / 1000),
    address = 'crm-track@reply.crm.example';
  const exactHtml =
    '<h1>ACTUAL FIRST OFFER</h1><p>10 complete sets, price USD 20.</p><img src="https://never-load.crm-test.invalid/pixel"><script>parent.postMessage("forbidden-preview-script","*")</script><a href="https://never-load.crm-test.invalid">External</a>';
  const seed = `
    INSERT OR IGNORE INTO edm_users(id,name,email,created_at,updated_at) VALUES('test-workspace','CRM fixture','crm-fixture@example.test',${epoch},${epoch});
    INSERT INTO edm_contact_groups(id,user_id,name,contact_count,created_at,updated_at) VALUES('crm-group','test-workspace','CRM 验收分组',53,${epoch},${epoch});
    INSERT INTO edm_contacts(id,user_id,group_id,email,name,company,website,created_at,updated_at) VALUES('crm-contact','test-workspace','crm-group','buyer@client.example','CRM Buyer','Client Company','https://client.example/',${epoch},${epoch}),('crm-new','test-workspace','crm-group','new@client.example','Untouched Buyer','Client Company',NULL,${epoch},${epoch});
    WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<51) INSERT INTO edm_contacts(id,user_id,group_id,email,name,created_at,updated_at) SELECT 'crm-fill-'||printf('%03d',x),'test-workspace','crm-group','filler'||x||'@client.example','Filler '||x,${epoch},${epoch} FROM n;
    INSERT INTO edm_campaigns(id,user_id,created_by,name,sender_email,sender_name,created_at,updated_at) VALUES('crm-campaign-admin','test-workspace','test-admin','Admin customer offer','sales@work.example','Sales',${epoch},${epoch}),('crm-campaign-owner','test-workspace','test-owner','Owner follow-up','sales@work.example','Sales',${epoch},${epoch});
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,sent_at,created_at) VALUES('crm-recipient-admin','crm-campaign-admin','crm-contact','sent',${epoch},${epoch}),('crm-recipient-failed','crm-campaign-admin','crm-contact','failed',NULL,${epoch}),('crm-recipient-owner','crm-campaign-owner','crm-contact','sent',${epoch},${epoch});
    WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<51) INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,sent_at,created_at) SELECT 'crm-rec-fill-'||printf('%03d',x),'crm-campaign-admin','crm-fill-'||printf('%03d',x),'sent',${epoch},${epoch} FROM n;
    INSERT INTO edm_site_message_jobs(id,user_id,created_by,name,sender_name,sender_email,subject,message,created_at,updated_at) VALUES('crm-job','test-workspace','test-admin','Client site enquiry','Sales','employee-not-customer@work.example','Site subject','MUTABLE CURRENT FORM',${epoch},${epoch});
    INSERT INTO edm_site_message_targets(id,job_id,website_url,normalized_host,status,completed_at,created_at,updated_at) VALUES('crm-target','crm-job','https://client.example/','client.example','submitted',${epoch},${epoch},${epoch});
    INSERT INTO wr_inbox_routes(id,config_id,workspace_id,owner_id,source,business_id,target_id,address,original_email,subject,snapshot,created_at) VALUES('crm-route',${quote(config.id)},'test-workspace','test-admin','edm','crm-campaign-admin','crm-recipient-admin',${quote(address)},'buyer@client.example','Legacy route subject','Legacy route partial content',${quote(now)});
    INSERT INTO wr_crm_outbound_snapshots(id,workspace_id,owner_id,source,business_id,target_id,attempt_id,contact_id,subject,body_html,body_text,provider,status,provider_message_id,created_at,completed_at,recipient_email,sender_email,sender_name,reply_to) VALUES('crm-snapshot','test-workspace','test-admin','edm','crm-campaign-admin','crm-recipient-admin','crm-attempt','crm-contact','ACTUAL FIRST OFFER',${quote(exactHtml)},'10 complete sets, price USD 20.','resend','sent','fixture-provider-receipt',${quote(now)},${quote(now)},'buyer@client.example','sales@work.example','Sales',${quote(address)});
    INSERT INTO edm_contact_groups(id,user_id,name,contact_count,created_at,updated_at) VALUES('crm-group-two','test-workspace','CRM 第二分组',11,${epoch},${epoch});
    UPDATE wr_crm_outbound_snapshots SET group_id_at_send='crm-group',group_name_at_send='CRM 验收分组',group_snapshot_available=1,engagement_tracking_available=1,engagement_tracking_source='resend' WHERE id='crm-snapshot';
    WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<51)
      INSERT INTO wr_crm_outbound_snapshots(id,workspace_id,owner_id,source,business_id,target_id,attempt_id,contact_id,subject,body_text,provider,status,created_at,completed_at,recipient_email,group_id_at_send,group_name_at_send,group_snapshot_available,engagement_tracking_available,engagement_tracking_source)
      SELECT 'crm-fill-snapshot-'||x,'test-workspace','test-admin','edm','crm-campaign-admin','crm-rec-fill-'||printf('%03d',x),'fixture', 'crm-fill-'||printf('%03d',x),'Fixture customer offer','One shared offer','resend','sent',${quote(now)},${quote(now)},'filler'||x||'@client.example',CASE WHEN x<=50 THEN 'crm-group' ELSE 'crm-group-two' END,CASE WHEN x<=50 THEN 'CRM 验收分组' ELSE 'CRM 第二分组' END,1,1,'resend' FROM n;
    UPDATE edm_campaign_recipients SET opened_at=${epoch},clicked_at=${epoch} WHERE id='crm-recipient-admin' OR id BETWEEN 'crm-rec-fill-001' AND 'crm-rec-fill-020';
    UPDATE edm_campaign_recipients SET opened_at=${epoch} WHERE id BETWEEN 'crm-rec-fill-021' AND 'crm-rec-fill-040';
    UPDATE wr_members SET role='analyst' WHERE user_id='test-member';
  `;
  const seedFile = output + '/seed.sql';
  await writeFile(seedFile, seed);
  await stage('seedMs', () => cli(['execute', 'web-radar', '--file', seedFile]));
  const mail =
    'From: Buyer <buyer@client.example>\r\nTo: ' +
    address +
    '\r\nMessage-ID: <crm-signed@client.example>\r\nSubject: Re: ACTUAL FIRST OFFER\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nPlease send the quotation for 200 units.';
  const time = String(Date.now()),
    digest = createHash('sha256').update(mail).digest('hex'),
    signature = createHmac('sha256', config.secret)
      .update(
        [
          config.id,
          time,
          address,
          'buyer@client.example',
          'forwarded',
          'sales@work.example',
          digest,
        ].join('\n'),
      )
      .digest('hex');
  const inboundHeaders = {
    'Content-Type': 'message/rfc822',
    'X-Inbox-Time': time,
    'X-Inbox-To': address,
    'X-Inbox-From': 'buyer@client.example',
    'X-Inbox-Forward': 'forwarded',
    'X-Inbox-Forward-To': 'sales@work.example',
    'X-Inbox-Signature': signature,
  };
  const receivePath = origin + '/api/inbox/receive/' + config.id;
  assert.equal(
    (await admin.request.post(receivePath, { headers: inboundHeaders, data: mail })).status(),
    200,
  );
  assert.equal(
    (await admin.request.post(receivePath, { headers: inboundHeaders, data: mail })).status(),
    200,
  );
  const threads = await getJson(admin, '/api/inbox/threads');
  assert.equal(threads.total, 1);
  const threadId = threads.threads[0].id;
  const reply = await getJson(admin, '/api/inbox/threads/' + threadId);
  assert.equal(reply.messages.length, 1);
  assert.equal(
    (
      await admin.request.put(origin + '/api/inbox/messages/' + reply.messages[0].id + '/kind', {
        data: { kind: 'human' },
      })
    ).status(),
    200,
  );
  cases.push({
    name: 'signed inbound ingestion and duplicate callback',
    passed: true,
    receivedMessages: 1,
  });
  const page = await admin.newPage(),
    navigation = page.getByRole('navigation', { name: '工作台导航' });
  let siteLinkPutCount = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/crm/site-link' && request.method() === 'PUT')
      siteLinkPutCount++;
  });
  const shot = async (name) => {
    await page.screenshot({ path: output + '/' + name, animations: 'disabled' });
    screenshots.push(name);
  };
  const checkMobileTable = async (name) => {
    const container = page.locator('.crm-table-scroll').first();
    await expect(container.locator('tbody td').first()).toBeVisible();
    const cell = await container.locator('tbody td').first().boundingBox();
    assert.ok(cell.width >= 220, 'Mobile table first column must remain readable');
    const scroll = await container.evaluate((element) => {
      element.scrollLeft = 180;
      const result = {
        viewport: element.clientWidth,
        content: element.scrollWidth,
        scrollLeft: element.scrollLeft,
      };
      element.scrollLeft = 0;
      return result;
    });
    assert.ok(
      scroll.content > scroll.viewport && scroll.scrollLeft > 0,
      'Table must scroll horizontally',
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
    );
    await container.scrollIntoViewIfNeeded();
    await shot(name);
  };
  await stage('browserMs', async () => {
    await page.goto(origin + '/?view=crm');
    await expect(page.getByRole('heading', { name: '客户管理系统', exact: true })).toBeVisible();
    await expect(
      navigation.getByRole('button', { name: '客户管理系统', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    for (const tab of ['员工活动', '客户资料', '全部沟通记录', '客户回复'])
      await expect(page.getByRole('tab', { name: tab, exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: '员工活动', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: '客户资料', exact: true }).click();
    await expect(page.locator('.crm-table tbody tr')).toHaveCount(50);
    await expect(page.getByText('共 54 条 · 第 1 / 2 页', { exact: true })).toBeVisible();
    await shot('crm-customers-desktop.png');
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.locator('.crm-table tbody tr')).toHaveCount(4);
    cases.push({ name: 'customer pagination beyond first 50', passed: true, total: 54 });
    await page.getByLabel('搜索客户', { exact: true }).fill('CRM Buyer');
    await page.getByRole('button', { name: '搜索', exact: true }).click();
    await page.getByRole('button', { name: 'CRM Buyer', exact: true }).click();
    await expect(page.getByRole('heading', { name: '客户沟通时间线', exact: true })).toBeVisible();
    await expect(
      page.getByText('Please send the quotation for 200 units.', { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('.crm-event').filter({ hasText: 'Please send the quotation for 200 units.' }),
    ).toContainText('来自 buyer@client.example · 关联员工 工作区管理员');
    await page
      .getByLabel('跟进记录', { exact: true })
      .fill('Discuss the customer request tomorrow.');
    await page.getByLabel('下次跟进时间（可选）', { exact: true }).fill('2026-10-09T09:00');
    await page.getByRole('button', { name: '保存跟进记录', exact: true }).click();
    await expect(
      page.locator('.crm-note').filter({ hasText: 'Discuss the customer request tomorrow.' }),
    ).toBeVisible();
    await page
      .locator('.crm-note')
      .filter({ hasText: 'Discuss the customer request tomorrow.' })
      .getByRole('button', { name: '标记完成', exact: true })
      .click();
    await expect(
      page.locator('.crm-note').filter({ hasText: 'Discuss the customer request tomorrow.' }),
    ).toContainText('已完成');
    await page.reload();
    await expect(page.getByRole('heading', { name: '客户沟通时间线', exact: true })).toBeVisible();
    await expect(
      page.locator('.crm-note').filter({ hasText: 'Discuss the customer request tomorrow.' }),
    ).toContainText('已完成');
    await shot('crm-profile-desktop.png');
    await page.locator('.crm-audit > summary').click();
    await expect(page.locator('.crm-audit')).toContainText('完成客户跟进');
    await expect(page.locator('.crm-audit')).toContainText('工作区管理员');
    await page.locator('.crm-audit > summary').click();
    cases.push({
      name: 'on-demand audit uses actual staff names and persisted readable actions',
      passed: true,
    });
    cases.push({
      name: 'same customer cross campaign, inbound reply, note and followup persist',
      passed: true,
    });
    await page
      .locator('.crm-event')
      .filter({ has: page.getByRole('heading', { name: 'ACTUAL FIRST OFFER', exact: true }) })
      .getByRole('button', { name: '查看发送内容与结果 →', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: '发送内容与结果', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'ACTUAL FIRST OFFER', level: 3, exact: true }),
    ).toBeVisible();
    const frame = page.frameLocator('.crm-communication-detail > iframe[title="发送时的邮件内容"]');
    await expect(
      frame.getByRole('heading', { name: 'ACTUAL FIRST OFFER', exact: true }),
    ).toBeVisible();
    await expect(frame.locator('script')).toHaveCount(0);
    await expect(frame.locator('img')).not.toHaveAttribute('src', /https:/);
    await expect(frame.locator('a')).not.toHaveAttribute('href', /https:/);
    await shot('crm-actual-content-desktop.png');
    cases.push({
      name: 'immutable actual content safe preview and provider receipt',
      passed: true,
    });
    await page.getByRole('button', { name: '返回上一页', exact: true }).click();
    await page.getByRole('button', { name: '打开客户回复 →', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: '客户回复', exact: true })).toBeVisible();
    await expect(
      page.getByText('Please send the quotation for 200 units.', { exact: true }),
    ).toBeVisible();
    assert.equal(new URL(page.url()).searchParams.get('inboxThread'), threadId);
    await page.reload();
    await expect(
      page.getByText('Please send the quotation for 200 units.', { exact: true }),
    ).toBeVisible();
    cases.push({ name: 'reply tab, direct thread and reload', passed: true });
    await page.getByRole('tab', { name: '客户资料', exact: true }).click();
    await page.getByLabel('搜索客户', { exact: true }).fill('client.example');
    await page.getByRole('button', { name: '搜索', exact: true }).click();
    await page.getByRole('button', { name: 'https://client.example/', exact: true }).click();
    await page.getByLabel('搜索联系人邮箱或名称', { exact: true }).fill('buyer@client.example');
    await page.getByRole('button', { name: '查找联系人', exact: true }).click();
    await expect(
      page.getByLabel('确认关联的客户', { exact: true }).locator('option[value="crm-contact"]'),
    ).toHaveCount(1);
    assert.equal(siteLinkPutCount, 0, 'Contact search must not associate a customer');
    await page.getByLabel('确认关联的客户', { exact: true }).selectOption('crm-contact');
    const linkResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/crm/site-link') && response.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: '确认关联', exact: true }).click();
    assert.equal((await linkResponse).status(), 200);
    assert.equal(siteLinkPutCount, 1, 'Explicit confirmation must associate exactly once');
    await page.getByRole('tab', { name: '客户资料', exact: true }).click();
    await page.getByLabel('搜索客户', { exact: true }).fill('CRM Buyer');
    await page.getByRole('button', { name: '搜索', exact: true }).click();
    await page.getByRole('button', { name: 'CRM Buyer', exact: true }).click();
    await expect(page.locator('.crm-timeline')).toContainText('站内信发送');
    assert.equal((await getJson(admin, '/api/crm/customers')).total, 53);
    cases.push({ name: 'explicit site to contact association unifies two channels', passed: true });
    await page.getByRole('tab', { name: '全部沟通记录', exact: true }).click();
    await page.getByLabel('员工', { exact: true }).selectOption('test-owner');
    await expect(page.locator('.crm-table tbody tr')).toHaveCount(1);
    await page.getByLabel('员工', { exact: true }).selectOption('');
    await expect(page.locator('.crm-table tbody tr')).toHaveCount(50);
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: '导出全部记录', exact: true }).click();
    const download = await downloadEvent;
    const csvFile = output + '/communications.csv';
    await download.saveAs(csvFile);
    const csv = await readFile(csvFile, 'utf8');
    assert.equal(csv.trim().split('\r\n').length, 56);
    cases.push({
      name: 'employee dedup counts drilldown and export includes beyond page 50',
      passed: true,
      exportedRecords: 55,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('tab', { name: '客户资料', exact: true }).click();
    await expect(page.getByRole('heading', { name: '客户管理系统', exact: true })).toBeVisible();
    await shot('crm-customers-mobile.png');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
    );
    await checkMobileTable('crm-customers-mobile-table.png');
    await page.getByRole('tab', { name: '全部沟通记录', exact: true }).click();
    await expect(page.locator('.crm-table tbody tr')).toHaveCount(50);
    await checkMobileTable('crm-communications-mobile-table.png');
    await page.getByRole('tab', { name: '员工活动', exact: true }).click();
    const employeeData = await getJson(admin, '/api/crm/activity/employees');
    assert.deepEqual(employeeData.employees.map((employee) => employee.userId).sort(), [
      'test-admin', 'test-member', 'test-owner',
    ]);
    const inactiveEmployee = employeeData.employees.find(employee => employee.userId === 'test-member');
    assert.equal(inactiveEmployee.sent, 0);
    assert.equal(inactiveEmployee.customers, 0);
    await expect(page.locator('.crm-table tbody tr')).toHaveCount(employeeData.employees.length);
    await shot('crm-employees-mobile.png');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.getByRole('tab', { name: '客户资料', exact: true }).click();
    await page.getByLabel('搜索客户', { exact: true }).fill('CRM Buyer');
    await page.getByRole('button', { name: '搜索', exact: true }).click();
    await page.getByRole('button', { name: 'CRM Buyer', exact: true }).click();
    await expect(page.getByRole('heading', { name: '客户沟通时间线', exact: true })).toBeVisible();
    await shot('crm-profile-mobile.png');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
    );
    cases.push({
      name: '390px readable customer, communication and employee tables plus profile',
      passed: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    // A bulk draft exists before opening the single customer mail entry; it must not carry over.
    await page.evaluate(() =>
      sessionStorage.setItem(
        'edm-draft:v1:test-workspace:test-admin',
        JSON.stringify({
          version: 1,
          draft: {
            step: 0,
            form: {
              name: 'Bulk draft',
              templateId: '',
              senderEmail: '',
              senderName: '',
              replyTo: '',
              sendRate: 50,
              replyTracking: true,
            },
            audienceMethod: 'group',
            selectedContacts: [],
            selectedContactRecords: [],
            selectedGroups: ['crm-group'],
            selectedTags: [],
            campaignId: null,
            submissionStage: '',
            submissionPending: false,
          },
        }),
      ),
    );
    await page.getByRole('link', { name: '写邮件给客户', exact: true }).click();
    await expect(page.getByRole('radio', { name: /单独选择联系人/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.locator('.recipient-selected-contacts > button')).toHaveCount(1);
    await expect(page.locator('.recipient-selected-contacts')).toContainText(
      'buyer@client.example',
    );
    await expect(page.locator('.recipient-summary')).toContainText('预计 1 位联系人');
    assert.deepEqual(
      await page.evaluate(
        () =>
          JSON.parse(sessionStorage.getItem('edm-draft:v1:test-workspace:test-admin')).draft
            .selectedGroups,
      ),
      ['crm-group'],
    );
    cases.push({
      name: 'CRM mail handoff exactly one contact, independent from bulk draft',
      passed: true,
    });
  });
  await stage('activityBrowserMs', async () => {
    await page.goto(origin + '/?view=crm');
    await expect(page.getByRole('tab', { name: '员工活动', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('button', { name: '工作区管理员', exact: true }).click();
    await expect(page.getByRole('button', { name: 'CRM 验收分组', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'CRM 第二分组', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '历史分组未记录', exact: true })).toBeVisible();
    await shot('crm-activity-groups-desktop.png');
    await page.getByRole('button', { name: 'CRM 验收分组', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Admin customer offer', exact: true })).toBeVisible();
    await shot('crm-activity-batches-desktop.png');
    await page.getByRole('button', { name: 'Admin customer offer', exact: true }).click();
    const scope = '/api/crm/activity/batches/edm/crm-campaign-admin?ownerId=test-admin&activityGroupId=crm-group';
    const detail = await getJson(admin, scope);
    assert.equal(detail.batch.sent, 51);
    assert.equal(detail.batch.opened.value, 41);
    assert.equal(detail.batch.clicked.value, 21);
    assert.equal(detail.batch.replied.value, 1);
    assert.equal(detail.batch.opened.coverage, 'full');
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(50);
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(1);
    const secondPageUrl = page.url();
    await page.reload();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(1);
    assert.equal(page.url(), secondPageUrl);
    await page.locator('[data-metric="opened"]').click();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(41);
    await expect(page.locator('.crm-activity-records')).toContainText('CRM Buyer');
    const openedUrl = page.url();
    await page.locator('[data-metric="clicked"]').click();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(21);
    await expect(page.locator('.crm-activity-records')).toContainText('CRM Buyer');
    await page.goBack();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(41);
    assert.equal(page.url(), openedUrl);
    await page.reload();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(41);
    await shot('crm-activity-opened-desktop.png');
    await page.getByRole('button', { name: 'CRM Buyer', exact: true }).click();
    await expect(page.getByRole('heading', { name: '客户沟通时间线', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: '客户沟通时间线', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '返回效果与客户', exact: true }).click();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(41);
    await page.locator('[data-metric="replied"]').click();
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(1);
    await expect(page.locator('.crm-activity-records')).toContainText('CRM Buyer');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: /导出/ }).click();
    const download = await downloadEvent;
    const csvFile = output + '/activity-replied.csv';
    await download.saveAs(csvFile);
    const csv = await readFile(csvFile, 'utf8');
    assert.equal(csv.trim().split('\r\n').length, 2);
    assert.ok(csv.includes('buyer@client.example'));
    assert.ok(!csv.includes('filler1@client.example'));
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await shot('crm-activity-detail-mobile.png');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin + '/?view=crm&crmTab=activity&crmOwner=test-admin&crmGroup=__history__&crmSource=site&crmBatch=crm-job');
    await expect(page.locator('[data-metric="opened"]')).toBeDisabled();
    await expect(page.locator('[data-metric="clicked"]')).toBeDisabled();
    await expect(page.locator('[data-metric="opened"]')).toContainText('不适用');
    await expect(page.locator('.crm-activity-records tbody tr')).toHaveCount(1);
    await shot('crm-activity-site-desktop.png');
    cases.push({ name: 'employee → send-time group → activity → independently filtered customer metrics', passed: true, groupRecipients: 51, openedRecipients: 41, clickedRecipients: 21, repliedRecipients: 1 });
    cases.push({ name: 'scoped pagination, export, profile reload, browser back and mobile, site engagement inapplicable', passed: true });
  });
  const ownerRecords = await getJson(owner, '/api/crm/communications');
  assert.equal(ownerRecords.total, 1);
  assert.equal(ownerRecords.records[0].targetId, 'crm-recipient-owner');
  assert.equal(
    (await owner.request.get(origin + '/api/crm/communications/edm/crm-recipient-admin')).status(),
    404,
  );
  const ownerPage = await owner.newPage();
  await ownerPage.goto(origin + '/?view=crm&crmTab=customers');
  await ownerPage.getByLabel('搜索客户', { exact: true }).fill('Untouched Buyer');
  await ownerPage.getByRole('button', { name: '搜索', exact: true }).click();
  await ownerPage.getByRole('button', { name: 'Untouched Buyer', exact: true }).click();
  await expect(ownerPage.getByLabel('跟进记录', { exact: true })).toBeVisible();
  await ownerPage.getByLabel('跟进记录', { exact: true }).fill('Own note for a new customer');
  await ownerPage.getByRole('button', { name: '保存跟进记录', exact: true }).click();
  await expect(ownerPage.locator('.crm-note')).toContainText('Own note for a new customer');
  const analystDetail = await getJson(analyst, '/api/crm/communications/edm/crm-recipient-admin');
  assert.equal(analystDetail.canBody, false);
  assert.equal(analystDetail.record.bodyHtml, null);
  assert.equal(JSON.stringify(analystDetail).includes('10 complete sets'), false);
  cases.push({
    name: 'member isolation, own notes before any send and analyst body denial',
    passed: true,
  });
  await cli([
    'execute',
    'web-radar',
    '--command',
    "UPDATE wr_members SET role='viewer' WHERE user_id='test-member'",
  ]);
  const viewerPage = await analyst.newPage();
  await viewerPage.goto(origin + '/?view=crm');
  await expect(
    viewerPage.getByRole('heading', { name: '客户管理系统', exact: true }),
  ).toBeVisible();
  await expect(viewerPage.getByRole('button', { name: '导入客户', exact: true })).toHaveCount(0);
  await expect(viewerPage.getByRole('button', { name: '新增客户', exact: true })).toHaveCount(0);
  assert.equal(
    (
      await analyst.request.post(
        origin + '/api/crm/customers/' + encodeURIComponent('contact:crm-contact') + '/notes',
        { data: { content: 'FORBIDDEN' } },
      )
    ).status(),
    403,
  );
  const other = await login('outsider');
  assert.equal(
    (await other.request.get(origin + '/api/crm/communications/edm/crm-recipient-admin')).status(),
    404,
  );
  assert.equal(
    (await other.request.get(origin + '/api/crm/customers?workspaceId=test-workspace')).status(),
    403,
  );
  cases.push({ name: 'viewer actions hidden and workspace isolation', passed: true });
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(forbidden, []);
  assert.deepEqual(await hashes(), inputHashes);
  await writeFile(
    output + '/evidence.json',
    JSON.stringify(
      {
        passed: true,
        sourceSha256: inputHashes,
        elapsedMs: Math.round(performance.now() - started),
        timings,
        cases,
        screenshots,
        pageErrors,
        forbidden,
        noRealDelivery: true,
        volumeScope:
          '54 customer rows and 55 communications through actual Worker; 20,000 export covered by customer-management.test.ts',
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS: CRM customer pages, two staff, original contents, signed reply, explicit association, followup, export, permissions, single-contact mail handoff, desktop/mobile. No real mail sent.',
  );
} catch (error) {
  await writeFile(
    output + '/failure.json',
    JSON.stringify(
      {
        error: String(error),
        stack: error.stack,
        elapsedMs: Math.round(performance.now() - started),
        timings,
        cases,
        screenshots,
        pageErrors,
        forbidden,
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser?.close();
  await worker?.dispose();
}
