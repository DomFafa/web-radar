import type { EdmDraft } from './edm-draft';

export function crmDraftKey(base: string | null, contactId: string): string | null {
  return base ? `${base}:crm:${encodeURIComponent(contactId)}` : null;
}

export function crmContactSelection(contact: any, expectedId: string): Pick<EdmDraft, 'selectedContacts' | 'selectedContactRecords' | 'selectedGroups' | 'selectedTags' | 'audienceMethod'> {
  if (contact?.id !== expectedId || typeof contact.email !== 'string') throw new Error('客户信息不存在或无权访问，请返回客户管理系统重新选择。');
  if (contact.subscriptionStatus !== 'subscribed') throw new Error('该客户未订阅邮件，不能加入发送名单。');
  return {
    audienceMethod: 'contact', selectedContacts: [contact.id], selectedGroups: [], selectedTags: [],
    selectedContactRecords: [{ id: contact.id, email: contact.email, name: contact.name, company: contact.company }],
  };
}
