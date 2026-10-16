// Isolated client acceptance: requests are fulfilled with fixtures; no real site is contacted.
import { createServer } from 'vite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';

const fixturePlugin = {
  name: 'site-workbench-fixture',
  enforce: 'pre',
  resolveId(source, importer) {
    if (source === 'site-workbench-entry') return '\0site-workbench-entry';
    if (source === 'site-workbench-auth' || (importer?.endsWith('/SiteMessagesPage.tsx') && source === '../App')) return '\0site-workbench-auth';
    if (importer?.endsWith('/SiteMessagesPage.tsx') && source === '../../../client/ChannelOverview') return '\0site-workbench-overview';
  },
  load(id) {
    if (id === "\0site-workbench-entry") return `import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AuthContext} from 'site-workbench-auth';
import {SiteMessagesPage} from '/src/outreach/client/pages/SiteMessagesPage.tsx';
import '/src/client/styles.css';
import '/src/client/radar-ui.css';
import '/src/outreach/client/styles/index.css';
import '/src/outreach/client/styles/workbench.css';
function Fixture(){const [user,setUser]=useState({id:'workspace',actorId:'actor',role:'admin'});window.changeSiteIdentity=setUser;return React.createElement(AuthContext.Provider,{value:{user}},React.createElement('div',{className:'outreach'},React.createElement(SiteMessagesPage)));}createRoot(document.getElementById('root')).render(React.createElement(Fixture));
`;
    if (id === '\0site-workbench-auth') return `import {createContext,useContext} from 'react'; export const AuthContext=createContext({user:null}); export const useAuth=()=>useContext(AuthContext); export const useToast=()=>({addToast:()=>{}});`;
    if (id === '\0site-workbench-overview') return `export const SiteOverviewPanel=()=>null;`;
  },
  configureServer(server) {
    server.middlewares.use('/__site_workbench_test', (_request, response) => {
      response.setHeader('Content-Type', 'text/html');
      response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body><div id="root"></div><script type="module" src="/@id/__x00__site-workbench-entry"></script></body></html>');
    });
  },
};

const cacheDir = mkdtempSync(join(tmpdir(), 'site-workbench-vite-'));
const server = await createServer({ cacheDir, configFile: false, plugins: [fixturePlugin], server: { host: '127.0.0.1', port: 0 }, optimizeDeps: { include: ['react', 'react-dom/client'] } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', error => console.error('Browser error:', error.message));
  const jobs = [];
  let starts = 0;
  const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
  const address = `${origin}/__site_workbench_test`;
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) return route.abort();
    if (!url.pathname.startsWith('/api/')) return route.continue();
    let data;
    if (url.pathname.endsWith('/site-messages') && request.method() === 'POST') {
      const form = request.postDataJSON();
      const job = { ...form, id: 'fixture-job', status: 'draft', totalTargets: form.targets.length, totalSubmitted: 0, targets: form.targets.map((websiteUrl, index) => ({ id: `target-${index}`, websiteUrl, normalizedHost: new URL(websiteUrl).hostname, status: 'queued' })) };
      jobs.push(job);
      data = job;
    } else if (url.pathname.endsWith('/start')) {
      starts++;
      jobs[0].status = 'queued';
      data = { queued: 1 };
    } else if (url.pathname.endsWith('/site-messages')) data = jobs;
    else if (url.pathname.endsWith('/fixture-job')) data = jobs[0];
    else return route.fulfill({ status: 404, json: { error: `Unexpected fixture request: ${url.pathname}` } });
    return route.fulfill({ json: { success: true, data } });
  });
  await page.goto(address);
  await page.getByRole('button', { name: '新建第一个任务', exact: true }).click();
  await page.getByLabel('目标网站 *', { exact: true }).fill('https://example.com/contact\nhttps://www.example.com/about\nhttp://localhost');
  await expect(page.locator('.site-workbench-target-counts')).toContainText('有效域名 1');
  await expect(page.locator('.site-workbench-target-counts')).toContainText('重复 1');
  await expect(page.locator('.site-workbench-target-counts')).toContainText('无效 1');
  await page.getByRole('button', { name: '下一步：联系资料' }).click();
  await expect(page.getByRole('alert')).toContainText('无效网址');
  await page.getByRole('button', { name: '移除无效和重复地址' }).click();
  await page.getByRole('button', { name: '下一步：联系资料' }).click();
  await page.getByLabel('姓名 *', { exact: true }).fill('Fixture Contact');
  await page.getByLabel('邮箱 *', { exact: true }).fill('contact@example.com');
  await page.getByRole('button', { name: '下一步：留言' }).click();
  await page.getByLabel('任务名称 *', { exact: true }).fill('Fixture inquiry');
  await page.getByLabel('留言内容 *', { exact: true }).fill('A relevant business inquiry from our fixture company.');
  await page.reload();
  await page.getByRole('button', { name: '继续填写草稿', exact: true }).first().click();
  await expect(page.getByLabel('留言内容 *', { exact: true })).toHaveValue('A relevant business inquiry from our fixture company.');
  await page.evaluate(() => window.changeSiteIdentity({ id: 'other-workspace', actorId: 'other-actor', role: 'admin' }));
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('site-message-draft:v1:other-actor:other-workspace'))).toBeNull();
  await page.evaluate(() => window.changeSiteIdentity({ id: 'workspace', actorId: 'actor', role: 'admin' }));
  await page.getByRole('button', { name: '继续填写草稿', exact: true }).first().click();
  await page.getByRole('button', { name: '下一步：预览确认' }).click();
  await page.getByRole('checkbox', { name: /我确认这些网站/ }).check();
  await page.getByRole('button', { name: '保存草稿并查看' }).click();
  await expect(page.getByRole('dialog').getByText('尚未发送。', { exact: false })).toBeVisible();
  expect(jobs).toHaveLength(1);
  expect(starts).toBe(0);
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: '确认提交留言', exact: true }).click();
  expect(starts).toBe(0);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '确认提交留言', exact: true }).click();
  await expect.poll(() => starts).toBe(1);
  await page.reload();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Fixture inquiry' })).toBeVisible();
  await page.evaluate(() => window.changeSiteIdentity({ id: 'workspace', actorId: 'actor', role: 'viewer' }));
  await expect(page.getByRole('button', { name: '暂停任务', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '编辑资料与留言', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '关闭任务详情' }).click();
  await expect(page.getByRole('button', { name: '新建任务', exact: true })).toHaveCount(0);
  await page.evaluate(() => window.changeSiteIdentity({ id: 'workspace', actorId: 'actor', role: 'admin' }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '新建任务', exact: true }).click();
  await expect(page.getByRole('button', { name: '下一步：联系资料' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/site-workbench-mobile.png', fullPage: true });
  console.log('PASS: validation, draft recovery, actor/workspace isolation, save without sending, explicit confirmation, linked detail, read-only actions and 390px layout');
} finally {
  await browser?.close();
  await server.close();
  rmSync(cacheDir, { recursive: true, force: true });
}
