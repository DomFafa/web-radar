import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

const identity = vi.hoisted(() => ({ role: 'viewer' }));
vi.mock('../../src/outreach/client/App', () => ({
  useAuth: () => ({ user: { id: 'workspace', actorId: 'actor', role: identity.role } }),
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock('../../src/client/ChannelOverview', () => ({ SiteOverviewPanel: () => createElement('span', null, '网站执行统计') }));
import { SiteMessagesPage } from '../../src/outreach/client/pages/SiteMessagesPage';

test('a read-only role sees the site purpose and no creation action', () => {
  identity.role = 'viewer';
  const html = renderToStaticMarkup(createElement(SiteMessagesPage));
  expect(html).toContain('网站留言');
  expect(html).toContain('联系表单');
  expect(html).not.toContain('新建任务');
});

test('a writable role can prepare a draft and detailed statistics stay secondary', () => {
  identity.role = 'member';
  const html = renderToStaticMarkup(createElement(SiteMessagesPage));
  expect(html).toContain('新建任务');
  expect(html).toContain('确认后才会提交');
  expect(html).toContain('<summary>查看执行统计</summary>');
});
