import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { ContactsPage } from '../../src/outreach/client/pages/ContactsPage';

const auth = vi.hoisted(() => ({ role: 'member' }));
vi.mock('../../src/outreach/client/App', () => ({
  useAuth: () => ({ user: { role: auth.role } }),
  useToast: () => ({ addToast: vi.fn() }),
}));

function render(initialAction: 'add' | 'import' | 'groups', role = 'member') {
  auth.role = role;
  return renderToStaticMarkup(React.createElement<NonNullable<Parameters<typeof ContactsPage>[0]>>(ContactsPage, {
    initialAction,
    onContinue: vi.fn(),
  }));
}

test('opening import from recipient selection shows file upload and group choice immediately', () => {
  const html = render('import');
  expect(html).toContain('批量导入联系人');
  expect(html).toContain('下载 CSV 导入模板');
  expect(html).toContain('导入到分组');
  expect(html).toContain('2 万人');
  expect(html).not.toContain('建议不超过 1,000');
});

test('opening add from recipient selection shows the single contact form', () => {
  const html = render('add');
  expect(html).toContain('contact@example.com');
  expect(html).toContain('返回懒人模式');
});

test('opening group management from recipient selection shows group creation immediately', () => {
  const html = render('groups');
  expect(html).toContain('分组名称 *');
  expect(html).toContain('添加分组');
});

test('read-only users cannot open importing, adding or group editing via the action parameter', () => {
  for (const action of ['add', 'import', 'groups'] as const) {
    const html = render(action, 'viewer');
    expect(html).not.toContain('下载 CSV 导入模板');
    expect(html).not.toContain('contact@example.com');
    expect(html).not.toContain('分组名称 *');
  }
});
