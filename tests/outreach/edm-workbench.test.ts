import { beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { draftStorageKey, readEdmDraft, writeEdmDraft, type EdmDraft } from '../../src/outreach/client/lib/edm-draft';

const auth = vi.hoisted(() => ({ user: { id: 'workspace-a', actorId: 'member-a', name: 'Customer', role: 'member' } }));
vi.mock('../../src/outreach/client/App', () => ({ useAuth: () => auth, useToast: () => ({ addToast: vi.fn() }) }));
vi.mock('react-quill-new', () => ({ default: () => null }));
vi.mock('../../src/outreach/client/components/EmailPreview', () => ({ EmailPreview: () => React.createElement('div', null, '邮件预览') }));
import { SendingCenterPage } from '../../src/outreach/client/pages/SendingCenterPage';
import { CampaignsPage } from '../../src/outreach/client/pages/CampaignsPage';
import { ContactsPage } from '../../src/outreach/client/pages/ContactsPage';
import { TemplatesPage } from '../../src/outreach/client/pages/TemplatesPage';
import { EmailGuidePage } from '../../src/outreach/client/pages/EmailGuidePage';

const sample: EdmDraft = {
  step: 1, audienceMethod: 'contact', selectedContacts: ['contact-1'],
  selectedContactRecords: [{ id: 'contact-1', email: 'person@example.com', name: 'Person' }], selectedGroups: [], selectedTags: [],
  form: { name: '客户跟进', templateId: 'template-1', senderEmail: 'sales@example.com', senderName: '公司', replyTo: '', sendRate: 50, replyTracking: true },
  campaignId: null, submissionStage: '', submissionPending: false,
};
const memoryStorage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
};

beforeEach(() => { auth.user.role = 'member'; vi.stubGlobal('sessionStorage', memoryStorage()); });

describe('EDM drafts', () => {
  test('keeps the selected audience and content while isolating workspace and actor', () => {
    const storage = memoryStorage();
    const key = draftStorageKey('workspace-a', 'member-a');
    writeEdmDraft(storage, key, sample);
    expect(readEdmDraft(storage, key)).toEqual(sample);
    expect(readEdmDraft(storage, draftStorageKey('workspace-a', 'member-b'))).toBeNull();
    expect(readEdmDraft(storage, draftStorageKey('workspace-b', 'member-a'))).toBeNull();
    expect(draftStorageKey('workspace-a', '')).toBeNull();
  });
  test('restores the task link and pending submission instead of offering another send', () => {
    const storage = memoryStorage();
    const key = draftStorageKey('workspace-a', 'member-a');
    const submitted = { ...sample, step: 2 as const, campaignId: 'campaign-1', submissionPending: true, submissionStage: '正在提交发送队列' };
    writeEdmDraft(storage, key, submitted);
    expect(readEdmDraft(storage, key)).toEqual(submitted);
  });
  test('ignores malformed or obsolete drafts and unavailable browser storage', () => {
    const storage = memoryStorage();
    const key = draftStorageKey('workspace-a', 'member-a')!;
    for (const value of ['broken', JSON.stringify({ version: 0, draft: sample }), JSON.stringify({ version: 1, draft: { ...sample, selectedContacts: 'not-an-array' } })]) {
      storage.setItem(key, value);
      expect(readEdmDraft(storage, key)).toBeNull();
    }
    const denied = { getItem() { throw new Error('disabled'); }, setItem() { throw new Error('disabled'); }, removeItem() {} };
    expect(readEdmDraft(denied, key)).toBeNull();
    expect(() => writeEdmDraft(denied, key, sample)).not.toThrow();
  });
});

describe('EDM workbench entry and permissions', () => {
  test('shows sender readiness before any audience is selected', () => {
    expect(renderToStaticMarkup(React.createElement(SendingCenterPage))).toContain('正在检查发信配置');
  });
  test('opens a template composer in place with a save-and-use action', () => {
    const html = renderToStaticMarkup(React.createElement<NonNullable<Parameters<typeof TemplatesPage>[0]>>(TemplatesPage, { createInline: true }));
    expect(html).toContain('保存并使用');
    expect(html).not.toContain('template-tabs');
  });
  test('read-only viewers do not receive mutation entry points', () => {
    auth.user.role = 'viewer';
    const cases: [React.ComponentType<any>, string[]][] = [
      [CampaignsPage, ['新建邮件', '新建活动']],
      [TemplatesPage, ['新建模板', '保存并使用']],
      [ContactsPage, ['添加联系人', '批量导入', '清空联系人库', '分组管理']],
      [SendingCenterPage, ['下一步', '确认发送']],
    ];
    for (const [component, actions] of cases) {
      const html = renderToStaticMarkup(React.createElement(component));
      for (const action of actions) expect(html).not.toContain(action);
    }
  });
  test('restored submissions lead to the existing record rather than another confirmation', () => {
    writeEdmDraft(sessionStorage, draftStorageKey(auth.user.id, auth.user.actorId), { ...sample, step: 2, campaignId: 'campaign-existing', submissionPending: true, submissionStage: '正在准备收件人' });
    const html = renderToStaticMarkup(React.createElement(SendingCenterPage));
    expect(html).toContain('查看发送记录');
    expect(html).not.toContain('>确认发送</button>');
  });
  test('the guide describes prerequisites without asserting a particular configured domain', () => {
    const html = renderToStaticMarkup(React.createElement(EmailGuidePage, { onNavigate: vi.fn() }));
    expect(html).not.toContain('wuyueer.com');
    expect(html).not.toContain('发信环境已配置');
    expect(html).toContain('发送记录');
  });
});
