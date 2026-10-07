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
      onGenerate: vi.fn(),
      onConfirm: vi.fn(),
    }),
  );
}
test('new email guide displays audience alone, with progress and no sending action', () => {
  const html = render(session('email'));
  expect(html).toContain('data-guidance-step="emailAudience"');
  expect(html).toContain('步骤 1 / 7');
  expect(html).toContain('下一步');
  expect(html).not.toContain('aria-label="发件人名称"');
  expect(html).not.toContain('aria-label="发件人邮箱"');
  expect(html).not.toContain('确认发送');
});
test('new website guide displays target URLs alone, without EDM contact selection', () => {
  const html = render(session('site'));
  expect(html).toContain('data-guidance-step="siteTargets"');
  expect(html).toContain('aria-label="目标网站"');
  expect(html).not.toContain('客户分组');
  expect(html).not.toContain('aria-label="发件人邮箱"');
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
