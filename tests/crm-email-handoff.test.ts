import { describe, expect, it } from 'vitest';
import { crmDraftKey, crmContactSelection } from '../src/outreach/client/lib/crm-email-handoff';

describe('CRM email handoff', () => {
  it('isolates each customer and actor from an existing bulk-send draft', () => {
    expect(crmDraftKey('edm-draft:v1:w:actor', 'customer')).toBe('edm-draft:v1:w:actor:crm:customer');
    expect(crmDraftKey('edm-draft:v1:w:actor', 'customer')).not.toBe(crmDraftKey('edm-draft:v1:w:other', 'customer'));
    expect(crmDraftKey('edm-draft:v1:w:actor', 'customer')).not.toBe(crmDraftKey('edm-draft:v1:w:actor', 'other'));
    expect(crmDraftKey(null, 'customer')).toBeNull();
  });
  it('selects only the exact subscribed customer returned by the authenticated contact lookup', () => {
    expect(crmContactSelection({ id: 'c', email: 'buyer@example.test', name: 'Buyer', subscriptionStatus: 'subscribed' }, 'c')).toEqual({
      selectedContacts: ['c'], selectedContactRecords: [{ id: 'c', email: 'buyer@example.test', name: 'Buyer', company: undefined }], selectedGroups: [], selectedTags: [], audienceMethod: 'contact',
    });
    expect(() => crmContactSelection({ id: 'other', email: 'buyer@example.test', subscriptionStatus: 'subscribed' }, 'c')).toThrow('客户信息');
    expect(() => crmContactSelection({ id: 'c', email: 'buyer@example.test', subscriptionStatus: 'unsubscribed' }, 'c')).toThrow('订阅');
  });
});
