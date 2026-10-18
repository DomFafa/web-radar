import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, test, vi } from 'vitest';
import type { Principal } from '../src/shared/model';

const overviewReads = vi.hoisted(() => vi.fn());
vi.mock('../src/client/ChannelOverview', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/client/ChannelOverview')>();
  return {
    ...actual,
    useOverview: (url: string) => {
      overviewReads(url);
      return { data: { counts: { all: 0, draft: 0, published: 0, offline: 0 }, projects: [] }, loading: false, error: '', reload() {} };
    },
  };
});
import Dashboard from '../src/client/Dashboard';
import UserManagement, { type Member } from '../src/client/UserManagement';

const customer: Principal = {
  userId: 'customer', authSubject: 'customer', email: 'customer@example.test', displayName: 'Customer',
  workspaceId: 'workspace', workspaceName: 'Workspace', workspaceRole: 'admin', appRole: 'admin', systemRole: 'super_admin',
};
const owner = { ...customer, userId: 'owner', email: 'vc.ddom@gmail.com' };
const member = { workspace_id: 'workspace', user_id: 'customer', email: customer.email } as Member;
beforeEach(() => overviewReads.mockClear());

test('other accounts see outreach statistics without mounting or reading website projects', () => {
  const html = renderToStaticMarkup(React.createElement(Dashboard, { principal: customer, onNavigate() {}, onOpenProject() {} }));
  expect(html).toContain('EDM 邮件概览');
  expect(html).toContain('站内信概览');
  expect(html).not.toContain('网站项目');
  expect(html).not.toContain('创建网站');
  expect(overviewReads).not.toHaveBeenCalled();
});

test('the designated account retains website projects and their statistics query', () => {
  const html = renderToStaticMarkup(React.createElement(Dashboard, { principal: owner, onNavigate() {}, onOpenProject() {} }));
  expect(html).toContain('网站项目概览');
  expect(html).toContain('前往创建网站');
  expect(overviewReads).toHaveBeenCalledWith('/api/projects?page=1&pageSize=5&status=all');
});

test('other administrators have outreach business tabs and no website count column', () => {
  const html = renderToStaticMarkup(React.createElement(UserManagement, { principal: customer, section: 'business' }));
  expect(html).toContain('EDM 邮件');
  expect(html).toContain('站内信');
  expect(html).not.toContain('网站项目');
  expect(html).not.toContain('网站：创建');
  expect(html).not.toContain('按用户查看网站');
});

test('viewing a member starts on EDM records instead of hidden website projects', () => {
  const html = renderToStaticMarkup(React.createElement(UserManagement, { principal: customer, section: 'business', initialMember: member }));
  expect(html).toContain('收件人 / 已发送 / 送达 / 打开 / 点击 / 回复');
  expect(html).not.toContain('网站项目');
  expect(html).not.toContain('项目 ID');
});

test('the designated account retains website management classifications', () => {
  const html = renderToStaticMarkup(React.createElement(UserManagement, { principal: owner, section: 'business', initialMember: member }));
  expect(html).toContain('网站项目');
  expect(html).toContain('项目 ID');
});

test('ordinary account administration descriptions do not advertise website building', () => {
  const html = renderToStaticMarkup(React.createElement(UserManagement, { principal: customer, section: 'users' }));
  expect(html).toContain('用户管理');
  expect(html).toContain('邮件活动和站内信任务');
  expect(html).not.toContain('网站');
});
