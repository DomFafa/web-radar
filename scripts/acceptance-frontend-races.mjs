import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import http from 'node:http';
const base = 'http://127.0.0.1:8788',
  parent = 'http://127.0.0.1:5173';
const json = async (path, body, token, method = 'POST') => {
  const r = await fetch(base + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${path} ${r.status} ${JSON.stringify(j)}`);
  return j;
};
const cfg = await (await fetch(base + '/api/config')).json();
if (cfg.testMode !== true) throw new Error('local test mode required');
const owner = await json('/api/auth/test-login', { identity: 'owner' }),
  admin = await json('/api/auth/test-login', { identity: 'admin' });
let { project } = await json(
  '/api/projects',
  { name: 'Frontend independent review ' + Date.now(), requestId: crypto.randomUUID() },
  owner.token,
);
project.draft.company.name = 'SAVED REVIEW COMPANY';
project.draft.script = 'Saved review script';
project.draft.scenes = [0, 1, 2].map((i) => ({
  id: 'review-scene-' + i,
  description: 'Review scene ' + i,
  revision: 0,
}));
({ project } = await json(
  '/api/projects/' + project.id,
  { expectedVersion: project.version, draft: project.draft },
  owner.token,
  'PUT',
));
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let exchanged = 0;
const host = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(
    `<!doctype html><iframe style="width:100%;height:95vh" id="wr" src="${base}/embed/product-radar?parentOrigin=${encodeURIComponent(parent)}"></iframe>`,
  );
});
await new Promise((resolve) => host.listen(5173, '127.0.0.1', resolve));
await page.route(base + '/api/integrations/product-radar/exchange', async (route) => {
  const body = route.request().postDataJSON();
  const session = body.code === 'review-owner' ? owner : admin;
  exchanged++;
  await route.fulfill({ json: { ...session, projectId: project.id, target: 'project' } });
});
await page.goto(parent + '/frontend-review');
const frame = page.frameLocator('#wr');
await page.waitForTimeout(900);
const handoff = async (code, id) =>
  page.evaluate(
    ({ code, id, target }) =>
      document
        .querySelector('#wr')
        .contentWindow.postMessage(
          { type: 'product-radar:handoff', protocolVersion: 1, code, requestId: id },
          target,
        ),
    { code, id, target: base },
  );
await handoff('review-owner', 'review-1');
await frame.getByLabel('公司英文名称', { exact: false }).fill('OWNER UNSAVED PRIVATE DRAFT');
const before = await frame.getByLabel('公司英文名称', { exact: false }).inputValue();
await handoff('review-admin', 'review-2');
await page.waitForTimeout(800);
const after = await frame.getByLabel('公司英文名称', { exact: false }).inputValue();
const dirtyAfter = await frame.locator('.save-state').innerText();
console.log('accountSwitch reached', JSON.stringify({ before, after, dirtyAfter, exchanged }));
const result = {
  projectId: project.id,
  accountSwitch: {
    before,
    after,
    expected: 'SAVED REVIEW COMPANY',
    dirtyAfter,
    exchangeCount: exchanged,
    ownerId: owner.principal.userId,
    adminId: admin.principal.userId,
  },
};
await fs.mkdir('artifacts/frontend-races', { recursive: true });
await page.screenshot({ path: 'artifacts/frontend-races/account-switch.png' });
// Reset only our own unsaved field, then exercise a real mutation with its response held.
await frame.getByLabel('公司英文名称', { exact: false }).fill('SAVED REVIEW COMPANY');
await frame.getByRole('button', { name: 'Hero 视频', exact: false }).click();
let release;
const waiting = new Promise((r) => (release = r));
let received;
const held = new Promise((r) => (received = r));
await page.route(base + '/api/projects/' + project.id + '/confirm-script', async (route) => {
  const response = await route.fetch();
  const body = await response.text();
  received({ status: response.status() });
  await waiting;
  await route.fulfill({ status: response.status(), contentType: 'application/json', body });
});
console.log('before confirm', await frame.locator('.save-state').innerText());
await frame.getByRole('button', { name: '保存并确认脚本', exact: true }).click();
console.log('confirm clicked');
const status = await Promise.race([
  held,
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('confirm response not reached')), 10000),
  ),
]);
await frame
  .getByLabel('可编辑的视频脚本', { exact: false })
  .fill('NEW TEXT TYPED WHILE CONFIRMING');
const during = await frame.getByLabel('可编辑的视频脚本', { exact: false }).inputValue();
release();
await page.waitForTimeout(700);
const final = await frame.getByLabel('可编辑的视频脚本', { exact: false }).inputValue();
result.inFlightEdit = {
  upstreamStatus: status.status,
  during,
  after: final,
  dirtyAfter: await frame.locator('.save-state').innerText(),
};
result.pageErrors = errors;
await page.screenshot({ path: 'artifacts/frontend-races/command.png' });
await fs.writeFile('artifacts/frontend-races/result.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
host.close();

assert.equal(after, 'SAVED REVIEW COMPANY');
assert.equal(final, 'NEW TEXT TYPED WHILE CONFIRMING');
assert.equal(result.inFlightEdit.dirtyAfter, '有未保存修改');
assert.deepEqual(errors, []);
