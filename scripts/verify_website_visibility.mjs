// Actual App in an isolated Chrome session; GET-only fixtures, no live account or delivery.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';

const output = process.env.WEBSITE_VISIBILITY_OUTPUT || '/tmp/web-radar-website-visibility';
mkdirSync(output, { recursive: true });
const inputs = ['src/client/App.tsx', 'src/client/Dashboard.tsx', 'src/client/UserManagement.tsx',
  'src/shared/access.ts', 'index.html', 'scripts/verify_website_visibility.mjs'];
const hashes = () => Object.fromEntries(inputs.map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
const sourceSha256 = hashes(), cases = [], screenshots = [], pageErrors = [], unexpected = [];
const started = performance.now();
const services = ['text', 'image', 'video', 'publish', 'site-builder', 'email'].map(name => ({
  name, configured: true, mode: 'live', detail: name === 'email' ? 'Fixture outreach mail service' : 'Fixture website-only service',
}));
const emptyEmail = Object.fromEntries(['totalCampaigns', 'totalContacts', 'subscribedContacts', 'totalSent',
  'totalDelivered', 'totalOpened', 'totalClicked', 'totalBounced'].map(key => [key, 0]));
const emptySite = Object.fromEntries(['totalJobs', 'totalTargets', 'totalSubmitted', 'totalSkipped', 'totalFailed',
  'totalNoContact', 'totalInaccessible', 'totalPending', 'totalUncertain', 'totalAbnormal'].map(key => [key, 0]));
const actor = (role, email = 'other@example.com') => ({
  userId: `fixture-${role}`, authSubject: `fixture-${role}`, email, displayName: role,
  systemRole: role === 'super_admin' ? 'super_admin' : 'user',
  appRole: role === 'super_admin' ? 'admin' : role,
  workspaceId: 'workspace', workspaceRole: role === 'admin' || role === 'super_admin' ? 'admin' : 'member',
  workspaceName: '隔离验收工作区',
});
const member = {
  workspace_id: 'workspace', user_id: 'member', email: 'member@example.com', display_name: 'Fixture Member',
  workspace_name: '隔离验收工作区', upstream_role: 'member', is_super: 0, role: 'member', status: 'active',
  version: 1, created_at: '2026-10-08T00:00:00Z', last_seen_at: null,
  projects: 99, drafts: 88, published: 11, campaigns: 0, sent: 0, replied: 0, messages: 0,
};
const options = { groups: [], contacts: [], tags: [], senderDomains: [],
  replyTracking: { enabled: false, email: false, site: false }, aiConfigured: true, testMode: false };
const list = { success: true, data: [], meta: { total: 0, page: 1, pageSize: 50, totalPages: 1 } };
const summary = { id: 'fixture-project', name: 'Fixture Website Project', companyName: 'Fixture Co', productCount: 0,
  template: 'senseng-clean', offline: false, createdAt: '2026-10-08T00:00:00Z', updatedAt: '2026-10-08T00:00:00Z' };
let browser, draft;
const server = await createServer({ configFile: false, cacheDir: output + '/vite-cache', server: { host: '127.0.0.1', port: 0 } });
try {
  draft = (await server.ssrLoadModule('/src/worker/domain.ts')).defaultDraft();
  await server.listen();
  const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
  browser = await chromium.launch({ channel: 'chrome', headless: true });

  async function scenario(principal, path = '/', viewport = { width: 1440, height: 1000 }) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const requests = [], modules = [];
    page.on('pageerror', error => pageErrors.push({ role: principal.appRole, email: principal.email, path, error: error.message }));
    await page.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin !== origin) { unexpected.push({ type: 'external', url: url.href }); return route.abort(); }
      if (!url.pathname.startsWith('/api/')) {
        if (url.pathname.includes('/src/client/')) modules.push(url.pathname);
        return route.continue();
      }
      requests.push({ path: url.pathname, query: url.search, method: request.method() });
      if (request.method() !== 'GET') { unexpected.push({ type: 'mutation', path: url.pathname }); return route.fulfill({ status: 403, json: { error: 'Mutations disabled' } }); }
      let response;
      switch (url.pathname) {
        case '/api/config': response = { testMode: false, services }; break;
        case '/api/auth/me': response = { principal }; break;
        case '/api/projects': response = { projects: [summary], total: 1, page: 1, pageSize: 20, counts: { all: 1, draft: 1, published: 0, offline: 0 } }; break;
        case '/api/projects/fixture-project': response = {
          project: { ...summary, workspaceId: 'workspace', ownerId: principal.userId, version: 1, draft },
          assets: [], jobs: [], releases: [], quota: { unlimited: true, imageUsed: 0, imageReserved: 0, imageLimit: 0, videoUsed: 0, videoReserved: 0, videoLimit: 0 },
        }; break;
        case '/api/outreach/campaigns/stats/overview': response = { success: true, data: { ...emptyEmail, deliveryRate: null, openRate: null, clickRate: null, bounceRate: null } }; break;
        case '/api/outreach/site-messages/stats/overview': response = { success: true, data: emptySite }; break;
        case '/api/management/members': response = { members: [member], total: 1, page: 1, pageSize: 50, canManage: principal.appRole === 'admin' }; break;
        case '/api/management/records': response = { records: [], total: 0 }; break;
        case '/api/management/audit': response = { events: [] }; break;
        case '/api/outreach/assistant/sessions': response = { success: true, data: [] }; break;
        case '/api/outreach/assistant/options': response = { success: true, data: options }; break;
        case '/api/outreach/contacts':
        case '/api/outreach/contacts/groups':
        case '/api/outreach/contacts/tags':
        case '/api/outreach/templates':
        case '/api/outreach/campaigns':
        case '/api/outreach/site-messages': response = list; break;
        case '/api/outreach/providers/sender-domains': response = { success: true, data: [], errors: [] }; break;
        case '/api/inbox/workspaces': response = { workspaces: [{ id: 'workspace', name: '隔离验收工作区' }] }; break;
        case '/api/inbox/configs': response = { configs: [] }; break;
        case '/api/inbox/members': response = { members: [] }; break;
        case '/api/inbox/threads': response = { threads: [], total: 0, stats: {} }; break;
        case '/api/inbox/report': response = { reports: [] }; break;
        case '/api/crm/employees': response = { employees: [] }; break;
        case '/api/crm/customers': response = { customers: [], total: 0, page: 1, pageSize: 50 }; break;
        default: unexpected.push({ type: 'unhandled-api', path: url.pathname, query: url.search }); return route.fulfill({ status: 500, json: { error: 'Unhandled fixture: ' + url.pathname } });
      }
      return route.fulfill({ status: 200, json: response });
    });
    await page.goto(origin + path);
    return { context, page, requests, modules };
  }
  const navigation = page => page.getByRole('navigation', { name: '工作台导航' });
  const assertHidden = async ({ page, requests, modules }) => {
    await expect(navigation(page).getByRole('button', { name: '网站项目', exact: true })).toHaveCount(0);
    await expect(navigation(page).getByRole('button', { name: '平台管理', exact: true })).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/网站项目|网站管理|网站工作室|搭建网站|创建网站|网站：创建/);
    assert.doesNotMatch(await page.title(), /网站|建站/);
    assert.equal(requests.filter(r => /^\/api\/(projects|admin)(\/|$)/.test(r.path)).length, 0, 'Hidden account requested website API');
    assert.equal(requests.filter(r => r.path === '/api/management/records' && new URLSearchParams(r.query).get('kind') === 'projects').length, 0, 'Hidden account requested website business data');
    assert.equal(modules.filter(p => /\/(Editor|Admin)\.tsx$/.test(p)).length, 0, 'Hidden account mounted a website component');
  };
  const screenshot = async (page, name) => { await page.screenshot({ path: output + '/' + name, fullPage: true }); screenshots.push(name); };

  // Every role obeys the exact-email boundary while retaining existing outreach permissions.
  for (const role of ['super_admin', 'admin', 'analyst', 'member', 'viewer']) {
    const state = await scenario(actor(role));
    const { page } = state;
    await expect(page.getByRole('heading', { name: '控制台', exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'EDM 邮件概览' })).toBeVisible();
    await expect(page.getByRole('region', { name: '站内信概览' })).toBeVisible();
    await assertHidden(state);
    for (const name of ['联系人管理', 'EDM 邮件', '站内信', '客户管理系统', '懒人模式'])
      await expect(navigation(page).getByRole('button', { name, exact: true })).toBeVisible();
    if (role === 'member') await screenshot(page, 'hidden-member-dashboard-desktop.png');
    if (['super_admin', 'admin', 'analyst'].includes(role)) {
      await navigation(page).getByRole('button', { name: '业务数据', exact: true }).click();
      await expect(page.getByRole('heading', { name: '业务数据', exact: true })).toBeVisible();
      await expect(page.getByText('Fixture Member', { exact: true })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /网站/ })).toHaveCount(0);
      await page.getByRole('button', { name: '查看业务数据', exact: true }).click();
      await expect.poll(() => state.requests.filter(r => r.path === '/api/management/records').length).toBeGreaterThan(0);
      await assertHidden(state);
      if (role === 'super_admin') await screenshot(page, 'hidden-super-admin-business-desktop.png');
    }
    if (['super_admin', 'admin'].includes(role)) {
      await navigation(page).getByRole('button', { name: '用户管理', exact: true }).click();
      await expect(page.getByRole('heading', { name: '用户管理', exact: true })).toBeVisible();
      await expect(page.getByText('角色权限', { exact: true })).toBeVisible();
      await assertHidden(state);
    }
    await navigation(page).getByRole('button', { name: '服务状态', exact: true }).click();
    await expect(page.getByRole('heading', { name: '服务状态', exact: true })).toBeVisible();
    await expect(page.locator('.service-row strong')).not.toHaveText(['text', 'image', 'video', 'publish', 'site-builder', 'email']);
    await expect(page.locator('.service-row strong').filter({ hasText: /^(image|video|publish|site-builder)$/ })).toHaveCount(0);
    await assertHidden(state);
    await navigation(page).getByRole('button', { name: '联系人管理', exact: true }).click();
    await expect(page.getByRole('heading', { name: '联系人管理', exact: true })).toBeVisible();
    if (role === 'viewer' || role === 'analyst') await expect(page.getByRole('button', { name: /添加联系人|批量导入/ })).toHaveCount(0);
    else await expect(page.getByRole('button', { name: /添加联系人/ })).toBeVisible();
    await navigation(page).getByRole('button', { name: 'EDM 邮件', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'EDM 邮件', exact: true })).toBeVisible();
    if (role === 'viewer' || role === 'analyst') await expect(page.getByRole('navigation', { name: 'EDM 邮件功能' }).getByRole('button', { name: '发送邮件', exact: true })).toHaveCount(0);
    else await expect(page.getByRole('heading', { name: '发送邮件', exact: true })).toBeVisible();
    await navigation(page).getByRole('button', { name: '站内信', exact: true }).click();
    await expect(page.getByRole('heading', { name: '网站留言', exact: true })).toBeVisible();
    await navigation(page).getByRole('button', { name: '客户管理系统', exact: true }).click();
    await expect(page.getByRole('heading', { name: '客户管理系统', exact: true })).toBeVisible();
    await page.getByRole('tab', { name: '客户回复', exact: true }).click();
    await expect(page.getByRole('heading', { name: '客户回复', exact: true })).toBeVisible();
    await navigation(page).getByRole('button', { name: '懒人模式', exact: true }).click();
    await expect(page.getByRole('region', { name: '懒人模式', exact: true })).toBeVisible();
    await assertHidden(state);
    cases.push({ role, email: 'other@example.com', retainedOutreachViews: true, websiteRequests: 0 });
    await state.context.close();
  }
  // A bookmarked editor, project list or administration page never mounts before redirection.
  for (const path of ['/?view=projects&project=fixture-project&tab=publish', '/?view=admin', '/?project=fixture-project']) {
    const state = await scenario(actor('super_admin'), path);
    await expect(state.page.getByRole('heading', { name: '控制台', exact: true })).toBeVisible();
    await expect.poll(() => new URL(state.page.url()).searchParams.get('project')).toBeNull();
    await assertHidden(state);
    cases.push({ role: 'super_admin', deepLink: path, safeDashboard: true, websiteRequests: 0 });
    await state.context.close();
  }
  const similar = await scenario(actor('super_admin', 'vc.ddom+another@gmail.com'));
  await expect(similar.page.getByRole('heading', { name: '控制台', exact: true })).toBeVisible();
  await assertHidden(similar);
  cases.push({ email: 'vc.ddom+another@gmail.com', exactAccountOnly: true });
  await similar.context.close();

  const mobile = await scenario(actor('member'), '/', { width: 390, height: 844 });
  await expect(mobile.page.getByRole('heading', { name: '控制台', exact: true })).toBeVisible();
  await assertHidden(mobile);
  await screenshot(mobile.page, 'hidden-member-dashboard-mobile.png');
  await mobile.context.close();
  cases.push({ viewport: '390x844', hiddenWebsite: true });

  // The single allowed account retains website lists and project/editor access.
  const allowed = await scenario(actor('super_admin', 'vc.ddom@gmail.com'));
  await expect(allowed.page.getByRole('region', { name: '网站项目概览' })).toBeVisible();
  await expect(navigation(allowed.page).getByRole('button', { name: '网站项目', exact: true })).toBeVisible();
  await expect(navigation(allowed.page).getByRole('button', { name: '平台管理', exact: true })).toBeVisible();
  await screenshot(allowed.page, 'allowed-account-dashboard-desktop.png');
  await navigation(allowed.page).getByRole('button', { name: '网站项目', exact: true }).click();
  await expect(allowed.page.getByRole('heading', { name: '网站项目', exact: true })).toBeVisible();
  await expect(allowed.page.getByRole('button', { name: '创建网站', exact: true })).toBeEnabled();
  await expect(allowed.page.getByText('Fixture Website Project', { exact: true })).toBeVisible();
  cases.push({ email: 'vc.ddom@gmail.com', retainedWebsiteOverviewAndList: true });
  await allowed.context.close();
  const editor = await scenario(actor('viewer', 'vc.ddom@gmail.com'), '/?view=projects&project=fixture-project');
  await expect(editor.page.getByRole('heading', { name: 'Fixture Website Project', exact: true })).toBeVisible();
  await expect(editor.page.getByText('当前角色仅可查看项目，不能修改、生成或发布。', { exact: true })).toBeVisible();
  assert.ok(editor.requests.some(r => r.path === '/api/projects/fixture-project'));
  await screenshot(editor.page, 'allowed-account-viewer-editor-desktop.png');
  cases.push({ email: 'vc.ddom@gmail.com', retainedEditor: true, viewerPermissionsPreserved: true });
  await editor.context.close();

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(unexpected, []);
  assert.deepEqual(hashes(), sourceSha256, 'Source changed during acceptance; rerun against frozen source');
  const evidence = { verified: true, elapsedMs: Math.round(performance.now() - started), cases, screenshots,
    pageErrors, unexpectedRequests: unexpected, sourceSha256,
    boundary: 'Local real App with GET-only network fixtures; no production account, model, queue or outbound delivery.' };
  writeFileSync(output + '/evidence.json', JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({ verified: true, cases: cases.length, screenshots: screenshots.length, elapsedMs: evidence.elapsedMs, evidence: output + '/evidence.json' }));
} catch (error) {
  writeFileSync(output + '/failure.json', JSON.stringify({ verified: false, error: error.stack, cases, pageErrors, unexpectedRequests: unexpected, sourceSha256 }, null, 2));
  throw error;
} finally {
  await browser?.close();
  await server.close();
}
