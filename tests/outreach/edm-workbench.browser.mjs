// Isolated client acceptance: all API responses are fixtures and outbound hosts are blocked.
import { createServer } from 'vite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';

const fixturePlugin = {
  name: 'edm-workbench-fixture', enforce: 'pre',
  resolveId(source, importer) {
    if (source === 'edm-workbench-entry') return '\0edm-workbench-entry';
    if (source === 'edm-workbench-auth' || (importer?.includes('/outreach/client/') && source === '../App')) return '\0edm-workbench-auth';
  },
  load(id) {
    if (id === '\0edm-workbench-auth') return `import {createContext,useContext} from 'react'; export const AuthContext=createContext({user:null}); export const useAuth=()=>useContext(AuthContext); const addToast=(type,message)=>{(window.fixtureToasts ||= []).push({type,message})}; export const useToast=()=>({addToast});`;
    if (id === '\0edm-workbench-entry') return `
import React,{useState} from 'react'; import {createRoot} from 'react-dom/client';
import {AuthContext} from 'edm-workbench-auth';
import {SendingCenterPage} from '/src/outreach/client/pages/SendingCenterPage.tsx';
import '/src/client/styles.css'; import '/src/client/radar-ui.css';
import '/src/outreach/client/styles/index.css'; import '/src/outreach/client/styles/workbench.css'; import '/src/outreach/client/styles/quill.css';
function Fixture(){const [user,setUser]=useState({id:'workspace',actorId:'actor',role:'admin'});window.changeEdmIdentity=setUser;return React.createElement(AuthContext.Provider,{value:{user}},React.createElement('div',{className:'outreach'},React.createElement(SendingCenterPage,{onNavigate:next=>{window.lastEdmNavigation=next}})));}createRoot(document.getElementById('root')).render(React.createElement(Fixture));`;
  },
  configureServer(server) {
    server.middlewares.use('/__edm_workbench_test', (_request, response) => {
      response.setHeader('Content-Type', 'text/html');
      response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body><div id="root"></div><script type="module" src="/@id/__x00__edm-workbench-entry"></script></body></html>');
    });
  },
};
const cacheDir = mkdtempSync(join(tmpdir(), 'edm-workbench-vite-'));
const server = await createServer({ cacheDir, configFile: false, plugins: [fixturePlugin], server: { host: '127.0.0.1', port: 0 }, optimizeDeps: { include: ['react', 'react-dom/client', 'react-quill-new'] } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  page.on('pageerror', error => console.error('Browser error:', error.message));
  const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
  const address = `${origin}/__edm_workbench_test`;
  const templates = [];
  let created = 0;
  let sent = 0;
  let prepared;
  let campaign;
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) return route.abort();
    if (!url.pathname.startsWith('/api/')) return route.continue();
    const path = url.pathname.replace('/api/outreach', '');
    let response;
    if (path === '/contacts/groups') response = { data: [{ id: 'partners', name: '合作客户', contactCount: 2 }], meta: { defaultContactCount: 0 } };
    else if (path === '/contacts/tags') response = { data: [] };
    else if (path === '/contacts') response = { data: [{ id: 'alice', email: 'alice@example.com', name: 'Alice', company: 'Fixture Buyer', subscriptionStatus: 'subscribed' }] };
    else if (path === '/providers/sender-domains') response = { data: [{ domain: 'verified.test', providerId: 'provider', providerName: 'Fixture', providerType: 'resend', isDefault: true }], errors: [] };
    else if (path === '/templates' && request.method() === 'POST') {
      const template = { ...request.postDataJSON(), id: 'fixture-template', createdAt: new Date().toISOString() };
      templates.push(template); response = { data: template };
    } else if (path === '/templates') response = { data: templates, meta: { totalPages: 1 } };
    else if (path === '/templates/fixture-template') response = { data: templates[0] };
    else if (path === '/campaigns' && request.method() === 'POST') { created++; campaign = { ...request.postDataJSON(), id: 'fixture-campaign', status: 'draft', totalRecipients: 1, totalSent: 0, totalFailed: 0 }; response = { data: campaign }; }
    else if (path === '/campaigns/fixture-campaign/recipients') { prepared = request.postDataJSON(); response = { data: { added: 1 } }; }
    else if (path === '/campaigns/fixture-campaign/send') { sent++; campaign.status = 'sending'; response = { data: { queued: 1 } }; }
    else if (path === '/campaigns/fixture-campaign') response = { data: campaign };
    else return route.fulfill({ status: 404, json: { error: `Unexpected fixture request: ${path}` } });
    return route.fulfill({ json: { success: true, ...response } });
  });
  await page.goto(address);
  await expect(page.getByText('发信域名已就绪', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: /单独选择联系人/ }).click();
  await page.getByPlaceholder('输入邮箱搜索，至少 2 个字符').fill('alice');
  await page.locator('.recipient-search-results').getByRole('button', { name: /alice@example.com/ }).click();
  await page.getByRole('button', { name: '下一步：准备邮件', exact: true }).click();
  await page.getByRole('button', { name: '新建模板', exact: true }).click();
  await page.getByPlaceholder('新客户开发模板').fill('Fixture customer inquiry');
  await page.getByPlaceholder('Hi {{name}}, Partnership Opportunity').fill('Product partnership discussion');
  await page.locator('.ql-editor[contenteditable="true"]').fill('Hello, we would like to discuss your product requirements.');
  await page.getByRole('button', { name: '保存并使用', exact: true }).click();
  await expect(page.locator('.template-editor-modal')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Fixture customer inquiry/ })).toBeVisible();
  expect(templates).toHaveLength(1);
  expect(created).toBe(0);
  expect(sent).toBe(0);
  await page.getByRole('button', { name: '上一步', exact: true }).click();
  await expect(page.locator('.recipient-summary')).toContainText('1 位联系人');
  await expect(page.locator('.recipient-selected-contacts')).toContainText('alice@example.com');
  await page.getByRole('button', { name: '下一步：准备邮件', exact: true }).click();
  await page.getByLabel('发件人名称 *', { exact: true }).fill('Fixture Company');
  await page.getByRole('button', { name: '下一步：预览确认', exact: true }).click();
  await expect(page.locator('.sending-review')).toContainText('alice@example.com');
  await page.reload();
  await expect(page.getByRole('button', { name: '确认发送', exact: true })).toBeEnabled();
  await expect(page.locator('.sending-review')).toContainText('alice@example.com');
  await expect(page.locator('.sending-review')).toContainText('Product partnership discussion');
  expect(created).toBe(0);
  expect(sent).toBe(0);
  await page.screenshot({ path: '/tmp/edm-workbench-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.frameLocator('iframe[title="邮件内容预览"]').getByText('Hello, we would like to discuss your product requirements.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/edm-workbench-mobile.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: '确认发送', exact: true }).click();
  await expect.poll(() => sent).toBe(1);
  expect(created).toBe(1);
  expect(prepared).toEqual({ contactIds: ['alice'] });
  await page.reload();
  await expect(page.getByRole('button', { name: '查看发送记录', exact: true })).toBeVisible();
  expect(created).toBe(1);
  expect(sent).toBe(1);
  await page.evaluate(() => window.changeEdmIdentity({ id: 'workspace', actorId: 'actor', role: 'viewer' }));
  await expect(page.getByText('当前角色为只读，可在发送记录中查看进度和下载报表。', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '确认发送', exact: true })).toHaveCount(0);
  await page.evaluate(() => window.changeEdmIdentity({ id: 'other-workspace', actorId: 'other-actor', role: 'admin' }));
  await expect(page.getByRole('heading', { name: '发给谁？', exact: true })).toBeVisible();
  await expect(page.locator('.recipient-summary')).toHaveCount(0);
  console.log('PASS: current sender configuration, inline template creation preserving recipients, refresh recovery, confirmation boundary, no repeat after reload, read-only access, scoped draft and 390px layout');
  await page.getByRole('button', { name: /合作客户/ }).click();
  await page.getByRole('button', { name: '下一步：准备邮件', exact: true }).click();
  await page.getByRole('button', { name: '请选择模板', exact: false }).click();
  await page.getByRole('button', { name: /Fixture customer inquiry/ }).click();
  await page.getByLabel('发件人名称 *', { exact: true }).fill('Fixture Company');
  await page.getByRole('button', { name: '下一步：预览确认', exact: true }).click();
  await expect(page.locator('.sending-review')).toContainText('Product partnership discussion');
  templates[0] = { ...templates[0], subject: 'Different offer edited elsewhere', bodyHtml: '<p>This new content has not been reviewed.</p>' };
  const previousToastCount = await page.evaluate(() => (window.fixtureToasts || []).length);
  await page.getByRole('button', { name: '确认发送', exact: true }).click();
  // Wait for the send attempt to finish: the footer switches to records while it is pending.
  await expect.poll(() => page.evaluate(() => (window.fixtureToasts || []).length)).toBeGreaterThan(previousToastCount);
  expect(created, 'changed template content must be reviewed again before creating another campaign').toBe(1);
  expect(sent, 'the previous confirmation must not authorize changed content').toBe(1);
  await expect(page.getByRole('button', { name: '下一步：预览确认', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '确认发送', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '下一步：预览确认', exact: true }).click();
  await expect(page.locator('.sending-review')).toContainText('Different offer edited elsewhere');
  await expect(page.frameLocator('iframe[title="邮件内容预览"]').getByText('This new content has not been reviewed.')).toBeVisible();
  await page.getByRole('button', { name: '确认发送', exact: true }).click();
  await expect.poll(() => sent).toBe(2);
  expect(created).toBe(2);
  console.log('PASS: a template changed after preview cannot be sent with the earlier confirmation');
} finally {
  await browser?.close();
  await server.close();
  rmSync(cacheDir, { recursive: true, force: true });
}
