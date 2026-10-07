import { expect, test, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DraftPreview, ResultCards } from '../../src/outreach/client/assistant/AssistantCards';
import type { AssistantOptions, AssistantResults, AssistantSession } from '../../src/outreach/shared/assistant';

// The iframe preview needs browser DOMParser; these checks cover the surrounding confirmation contract.
vi.mock('../../src/outreach/client/components/EmailPreview', () => ({ EmailPreview: () => null }));

function readySession(): AssistantSession {
  return {
    id: 'conversation', title: 'Sample outreach', version: 2, status: 'ready',
    draft: {
      channels: ['email', 'site'], brief: 'Introduce our samples', language: 'en',
      sender: { name: 'Seller', email: 'seller@example.com', company: '', phone: '', address: '', country: '', city: '' },
      email: { subject: 'Sample proposal', bodyHtml: '<p>Would you like a sample?</p>', bodyText: 'Would you like a sample?', contactIds: ['buyer'], groupId: '', tag: '', replyTo: 'replies@example.com', replyTracking: false, sendRate: 50 },
      site: { subject: 'Sample proposal', message: 'Would your team like a product sample?', targets: ['https://buyer.example.com/contact'], replyTracking: false },
    },
    operations: [], messages: [], pendingChannels: ['email', 'site'], missingFields: [], confirmationToken: 'reviewed-content-token',
    preview: { email: { recipients: [{ id: 'buyer', email: 'buyer@example.com', name: 'Buyer', company: '', industry: '' }], count: 1 }, site: { targets: ['https://buyer.example.com/contact'], count: 1, invalid: [], duplicates: [] } },
    createdAt: '2026-10-03T00:00:00.000Z', updatedAt: '2026-10-03T00:00:00.000Z',
  };
}
const options: AssistantOptions = {
  groups: [], tags: [], contacts: [], senderDomains: [],
  replyTracking: { enabled: true, email: true, site: true }, aiConfigured: true, testMode: false,
};
function preview(session: AssistantSession, config: AssistantOptions = options) {
  return renderToStaticMarkup(React.createElement(DraftPreview, {
    session, options: config, busy: false, writable: true, onConfirm() {}, onEdit() {},
  }));
}

test('configured inbox does not claim tracking for an opted-out draft, and the actual reply addresses are visible', () => {
  const html = preview(readySession());
  expect(html).toContain('<dt>邮件回复</dt><dd>回复至 replies@example.com</dd>');
  expect(html).toContain('<dt>留言回复</dt><dd>回复至 seller@example.com</dd>');
  expect(html).not.toContain('本次回复将汇入客户收件箱');
});

test('each channel needs both its own tracking choice and its own enabled inbox configuration', () => {
  const session = readySession();
  session.draft.email.replyTracking = true;
  session.draft.site.replyTracking = true;
  const emailOnly = preview(session, { ...options, replyTracking: { enabled: true, email: true, site: false } });
  expect(emailOnly).toContain('<dt>邮件回复</dt><dd>本次回复将汇入客户收件箱</dd>');
  expect(emailOnly).toContain('<dt>留言回复</dt><dd>回复至 seller@example.com</dd>');
  const siteOnly = preview(session, { ...options, replyTracking: { enabled: true, email: false, site: true } });
  expect(siteOnly).toContain('<dt>邮件回复</dt><dd>回复至 replies@example.com</dd>');
  expect(siteOnly).toContain('<dt>留言回复</dt><dd>本次回复将汇入客户收件箱</dd>');
});

test('without a custom reply address the email preview shows the sender address', () => {
  const session = readySession();
  session.draft.email.replyTo = '';
  expect(preview(session)).toContain('<dt>邮件回复</dt><dd>回复至 seller@example.com</dd>');
});

test('a large audience previews only one page while preserving the full confirmation count and data', () => {
  const session = readySession();
  session.pendingChannels = ['email'];
  session.preview.email.recipients = Array.from({ length: 20000 }, (_, index) => ({
    id: `buyer-${index}`, email: `buyer${index}@example.com`, name: '', company: '', industry: '',
  }));
  session.preview.email.count = 20000;
  const html = preview(session);
  expect(html).toContain('确认向 20000 位客户发送');
  expect(html).toContain('buyer99@example.com');
  expect(html).not.toContain('buyer100@example.com');
  expect(html).toContain('第 1 / 200 页');
  expect(html).toContain('下一页名单');
  expect(session.preview.email.recipients).toHaveLength(20000);
  expect(session.confirmationToken).toBe('reviewed-content-token');
});

test.each([
  ['needs_review', '结果待核实'],
  ['unavailable', '暂时无法读取'],
])('actual result status %s takes priority over a previously submitted operation', (status, label) => {
  const results: AssistantResults = {
    sessionId: 'conversation',
    channels: [{ channel: 'email', taskId: 'task', name: 'Sample outreach', status, operationStatus: 'submitted', total: 1, sent: 0, pending: 0, failed: 1, uncertain: 1, retryable: false, detailPath: '/api/outreach/campaigns/task', exportPath: '/api/outreach/assistant/sessions/conversation/email/export' }],
    summary: { total: 1, sent: 0, pending: 0, failed: 1, uncertain: 1 },
  };
  const html = renderToStaticMarkup(React.createElement(ResultCards, {
    results, busy: false, writable: true, onRetry() {}, onRefresh() {}, onWorkbench() {}, onError() {},
  }));
  expect(html).toContain(`<span class="wr-lazy-status">${label}</span>`);
  expect(html).not.toContain('已提交队列');
  expect(html).not.toContain('重试这个渠道');
});
