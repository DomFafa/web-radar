import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { GuidedDraft } from '../../src/outreach/client/assistant/GuidedDraft';
import { emptyDraft } from '../../src/outreach/server/lib/assistant';
import type { AssistantChannel, AssistantSession } from '../../src/outreach/shared/assistant';

vi.mock('../../src/outreach/client/components/EmailPreview', () => ({ EmailPreview: () => null }));

function session(channel: AssistantChannel): AssistantSession {
  return {
    id: 'guide',
    title: 'Guide',
    version: 1,
    status: 'draft',
    draft: emptyDraft([channel]),
    messages: [],
    operations: [],
    pendingChannels: [channel],
    missingFields: [],
    confirmationToken: null,
    preview: {
      email: { recipients: [], count: 0 },
      site: { targets: [], count: 0, invalid: [], duplicates: [] },
    },
    createdAt: '',
    updatedAt: '',
  };
}
function render(value: AssistantSession) {
  return renderToStaticMarkup(
    React.createElement(GuidedDraft, {
      session: value,
      options: null,
      busy: false,
      storageKey: 'guide:test',
      onRefreshOptions: vi.fn(),
      onSave: vi.fn(),
      onComposerContext: vi.fn(),
      onConfirm: vi.fn(),
      onManageContacts: vi.fn(),
    }),
  );
}
test('new email guide displays audience alone, with progress and no sending action', () => {
  const html = render(session('email'));
  expect(html).toContain('data-guidance-step="emailAudience"');
  expect(html).toContain('步骤 1 / 5');
  expect(html).toContain('下一步');
  expect(html).not.toContain('aria-label="发件人名称"');
  expect(html).not.toContain('aria-label="发件人邮箱"');
  expect(html).not.toContain('确认发送');
});
test('audience preparation has visible same-tab contact creation, import and group management actions', () => {
  const html = render(session('email'));
  expect(html).toContain('添加联系人');
  expect(html).toContain('批量导入名单');
  expect(html).toContain('管理分组');
  expect(html).not.toContain('target="_blank"');
});
test('new website guide displays target URLs alone, without EDM contact selection', () => {
  const html = render(session('site'));
  expect(html).toContain('data-guidance-step="siteTargets"');
  expect(html).toContain('步骤 1 / 5');
  expect(html).toContain('aria-label="目标网站"');
  expect(html).not.toContain('客户分组');
  expect(html).not.toContain('aria-label="发件人邮箱"');
});
test('a dual-channel guide displays seven steps while collecting only its first audience', () => {
  const value = session('email');
  value.draft.channels = ['email', 'site'];
  value.pendingChannels = ['email', 'site'];
  const html = render(value);
  expect(html).toContain('data-guidance-step="emailAudience"');
  expect(html).toContain('步骤 1 / 7');
  expect(html).not.toContain('aria-label="目标网站"');
  expect(html).not.toContain('aria-label="发件人名称"');
});
test('a saved draft resumes at its next missing field and folds completed audience into a summary', () => {
  const saved = session('email');
  saved.draft.email.contactIds = ['buyer'];
  const html = render(saved);
  expect(html).toContain('data-guidance-step="senderName"');
  expect(html).toContain('已选 1 位联系人');
  expect(html).not.toContain('aria-label="客户分组"');
  expect(html).not.toContain('aria-label="发件人邮箱"');
});

test('unfinished email content asks for its source without duplicating the chat input or manual subject/body steps', () => {
  const saved = session('email');
  saved.draft.email.contactIds = ['buyer'];
  saved.draft.sender.name = 'Seller';
  saved.draft.sender.email = 'seller@example.com';
  const html = render(saved);
  expect(html).toContain('data-guidance-step="emailContent"');
  expect(html).toContain('步骤 4 / 5');
  expect(html).not.toContain('aria-label="内容要求"');
  expect(html).not.toContain('aria-label="邮件主题"');
  expect(html).not.toContain('aria-label="邮件正文"');
  expect(html).not.toContain('确认向');
});

test('a needs-facts message cannot expose a previous complete email as ready for sending', () => {
  const saved = session('email');
  saved.draft.email.contactIds = ['buyer'];
  saved.draft.sender.name = 'Seller';
  saved.draft.sender.email = 'seller@example.com';
  saved.draft.email.subject = 'Previous proposal';
  saved.draft.email.bodyHtml = '<p>Hello, please see our previous proposal.</p>';
  saved.draft.email.bodyText = 'Hello, please see our previous proposal.';
  saved.draftingStates = { email: 'needs_facts' };
  const html = render(saved);
  expect(html).toContain('data-guidance-step="emailContent"');
  expect(html).not.toContain('aria-label="发送前预览"');
  expect(html).not.toContain('确认向');
});

test('a complete legacy email requires explicitly using its saved content before review', () => {
  const saved = session('email');
  saved.draft.email.contactIds = ['buyer'];
  saved.draft.sender.name = 'Seller';
  saved.draft.sender.email = 'seller@example.com';
  saved.draft.email.subject = 'Previous proposal';
  saved.draft.email.bodyHtml = '<p>Hello, please see our previous proposal.</p>';
  saved.draft.email.bodyText = 'Hello, please see our previous proposal.';
  const html = render(saved);
  expect(html).toContain('data-guidance-step="emailContent"');
  expect(html).toContain('aria-label="已保存的发送内容"');
  expect(html).toContain('使用这封邮件，继续');
  expect(html).not.toContain('aria-label="发送前预览"');
  expect(html).not.toContain('确认向');
});

test('a saved audience enlarged beyond the server limit returns to audience selection with its content intact', () => {
  const saved = session('email');
  saved.draft.email.groupId = 'grown-group';
  saved.draft.sender.name = 'Seller';
  saved.draft.sender.email = 'seller@example.com';
  saved.draft.email.subject = 'Reviewed email';
  saved.draft.email.bodyHtml = '<p>Our original proposal is unchanged.</p>';
  saved.draft.email.bodyText = 'Our original proposal is unchanged.';
  saved.draftingStates = { email: 'ready' };
  saved.preview.email.count = 20001;
  saved.missingFields = [{ key: 'email.audience', type: 'contacts', channel: 'email', label: '选择收件联系人（最多 20000 人）' }];
  const html = render(saved);
  expect(html.includes('data-guidance-step="emailAudience"')).toBe(true);
  expect(html.includes('20,001 位可发送客户')).toBe(true);
  expect(html.includes('每次最多 20,000 位')).toBe(true);
  expect(html.includes('确认向')).toBe(false);
  expect(saved.draft.email.subject).toBe('Reviewed email');
});
