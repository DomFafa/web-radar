import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, test, vi } from 'vitest';
import type { Principal } from '../../src/shared/model';

vi.mock('../../src/outreach/client/pages/ContactsPage', () => ({
  ContactsPage: ({ initialAction, onContinue }: { initialAction?: string; onContinue?: () => void }) =>
    React.createElement('section', { 'aria-label': '联系人管理', 'data-initial-action': initialAction },
      onContinue && React.createElement('button', { onClick: onContinue }, '返回原会话')),
}));
vi.mock('react-quill-new', () => ({ default: () => null }));
import Outreach from '../../src/outreach/client/App';

const principal: Principal = {
  userId: 'actor', workspaceId: 'workspace', displayName: 'Customer', email: 'actor@example.com',
  appRole: 'member', systemRole: 'user', workspaceName: 'Workspace',
} as Principal;
beforeEach(() => vi.stubGlobal('location', { href: 'https://fixture.test/?view=contacts&conversationId=original' }));

test('the standalone contacts entry reuses the manager without EDM sending navigation', () => {
  const html = renderToStaticMarkup(React.createElement(Outreach, {
    principal, section: 'contacts', contactsAction: 'import', onContinueContacts: () => {},
  }));
  expect(html).toContain('aria-label="联系人管理"');
  expect(html).toContain('data-initial-action="import"');
  expect(html).toContain('返回原会话');
  expect(html).not.toContain('aria-label="EDM 邮件功能"');
  expect(html).not.toContain('客户来信在');
});

test('read-only users retain the standalone contacts view without a creation action', () => {
  const html = renderToStaticMarkup(React.createElement(Outreach, {
    principal: { ...principal, appRole: 'viewer' }, section: 'contacts', contactsAction: 'add',
  }));
  expect(html).toContain('当前角色为只读');
  expect(html).toContain('aria-label="联系人管理"');
  expect(html).not.toContain('data-initial-action="add"');
});
