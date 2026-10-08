import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { Principal } from '../src/shared/model';
import CustomerManagement, {
  communicationStatus,
  emailPreviewDocument,
  auditActionLabel,
  trackingStatus,
  timelineParticipantLabel,
  crmTabFromSearch,
} from '../src/client/CustomerManagement';

const principal: Principal = {
  userId: 'member',
  authSubject: 'member',
  email: 'member@example.test',
  displayName: 'Member',
  workspaceId: 'workspace',
  workspaceName: 'Workspace',
  workspaceRole: 'member',
  appRole: 'member',
  systemRole: 'user',
};

test('CRM starts from staff activities and keeps customer data and replies as auxiliary entries', () => {
  const html = renderToStaticMarkup(
    React.createElement(CustomerManagement, { principal, onManageContacts() {} }),
  );
  for (const text of ['客户管理系统', '客户资料', '全部沟通记录', '客户回复', '员工活动'])
    expect(html).toContain(text);
  expect(html).not.toContain('暂无客户');
  expect(html).not.toContain('导入客户');
  expect(html).toContain('id="crm-tab-activity"');
});

test('legacy staff tab enters activities while explicit customer and reply deep links remain available', () => {
  expect(crmTabFromSearch('')).toBe('activity');
  expect(crmTabFromSearch('?crmTab=employees')).toBe('activity');
  expect(crmTabFromSearch('?crmTab=customers')).toBe('customers');
  expect(crmTabFromSearch('?crmTab=replies')).toBe('replies');
});

test('customer audit uses readable actions without exposing raw identity or payload', () => {
  expect(auditActionLabel('note.status', '{"after":"done","id":"internal-id"}')).toBe(
    '完成客户跟进',
  );
  expect(auditActionLabel('message.classify', '{"kind":"human"}')).toBe('将来信分类为客户回复');
  expect(auditActionLabel('customer.link', '{"contactId":"internal-id"}')).toBe(
    '关联网站与客户资料',
  );
});

test('read only accounts cannot add or import contacts from CRM', () => {
  const html = renderToStaticMarkup(
    React.createElement(CustomerManagement, {
      principal: { ...principal, appRole: 'viewer' },
      onManageContacts() {},
    }),
  );
  expect(html).toContain('客户管理系统');
  expect(html).not.toContain('导入客户');
  expect(html).not.toContain('新增客户');
});

test('tracking does not turn absent or partial tracking into a confirmed no reply', () => {
  expect(trackingStatus(0, 4)).toBe('未追踪');
  expect(trackingStatus(2, 4)).toBe('部分追踪');
  expect(trackingStatus(4, 4)).toBe('已追踪');
  expect(trackingStatus(0, 0)).toBe('尚未发送');
  expect(communicationStatus('submitted')).toBe('已提交');
  expect(communicationStatus('unknown')).toBe('结果待确认');
  expect(communicationStatus('uncertain')).toBe('待核实');
  expect(communicationStatus('submitted_unconfirmed')).toBe('提交待核实');
});

test('inbound timeline identifies the actual customer sender separately from the assigned staff', () => {
  expect(
    timelineParticipantLabel({
      direction: 'inbound',
      sender: 'buyer@client.example',
      ownerName: 'Dom',
    }),
  ).toBe('来自 buyer@client.example · 关联员工 Dom');
  expect(timelineParticipantLabel({ direction: 'inbound', ownerName: null })).toBe(
    '来自 历史客户发件信息未保存 · 关联员工 历史负责人未记录',
  );
  expect(timelineParticipantLabel({ direction: 'outbound', ownerName: 'Dom' })).toBe('Dom');
});

test('email historical preview restricts network, scripts, navigation and forms with a CSP', () => {
  const html = '<p>Hello</p><img src="https://tracking.test/pixel"><script>alert(1)</script>';
  const document = emailPreviewDocument(html);
  expect(document).toContain('default-src &#39;none&#39;');
  expect(document).toContain('img-src data:');
  expect(document).toContain('script-src &#39;none&#39;');
  expect(document.indexOf('Content-Security-Policy')).toBeLessThan(document.indexOf('<body>'));
  expect(document).not.toContain('<script>alert(1)</script>');
});
