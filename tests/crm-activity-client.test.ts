import { expect, test } from 'vitest';
import {
  activityLevel,
  activityMetricText,
  activityRecordParams,
  activityUrl,
  parseActivityRoute,
  crmScrollKey,
} from '../src/client/CrmActivity';

test('activity hierarchy requires employee, then group, then activity', () => {
  expect(activityLevel(parseActivityRoute(''))).toBe('employees');
  expect(activityLevel(parseActivityRoute('?crmOwner=owner'))).toBe('groups');
  expect(activityLevel(parseActivityRoute('?crmOwner=owner&crmGroup=__history__'))).toBe('batches');
  expect(
    activityLevel(
      parseActivityRoute('?crmOwner=owner&crmGroup=__history__&crmBatch=batch&crmSource=edm'),
    ),
  ).toBe('detail');
  expect(activityLevel(parseActivityRoute('?crmBatch=batch&crmSource=edm'))).toBe('employees');
});

test('activity routes keep workspace, filters and ancestor pagination when returning a level', () => {
  const route = parseActivityRoute(
    '?crmOwner=owner&crmGroup=g&crmBatch=b&crmSource=edm&crmChannel=edm&crmFrom=2026-10-01&crmMetric=clicked&crmStaffPage=2&crmGroupPage=3&crmBatchPage=4&crmPage=5',
  );
  const url = activityUrl(
    { ...route, batch: '', source: '', metric: 'all' },
    'https://web-radar.net/?view=crm&crmWorkspace=team&crmCustomer=contact:c',
  );
  expect(url.searchParams.get('crmWorkspace')).toBe('team');
  expect(url.searchParams.get('crmChannel')).toBe('edm');
  expect(url.searchParams.get('crmFrom')).toBe('2026-10-01');
  expect(url.searchParams.get('crmBatchPage')).toBe('4');
  expect(url.searchParams.has('crmCustomer')).toBe(false);
  expect(activityLevel(parseActivityRoute(url.search))).toBe('batches');
});

test('metric display distinguishes missing tracking and aggregate-only data from zero', () => {
  const base = {
    value: 0,
    tracked: 0,
    eligible: 10,
    sources: [],
    detailAvailable: false,
    rate: null,
  } as const;
  expect(activityMetricText({ ...base, sources: [], coverage: 'unknown' })).toEqual({
    value: '未追踪',
    rate: null,
    note: '没有可用的客户追踪数据',
  });
  expect(activityMetricText({ ...base, sources: [], coverage: 'not_applicable' }).value).toBe(
    '不适用',
  );
  expect(
    activityMetricText({
      ...base,
      value: 8,
      sources: ['mailchimp_marketing'],
      coverage: 'overall_only',
    }).note,
  ).toContain('不提供具体客户名单');
  expect(
    activityMetricText({ ...base, tracked: 10, sources: [], coverage: 'full', rate: 0 }).rate,
  ).toBe('0.0%');
});

test('malformed URL dates and page numbers do not enter requests', () => {
  const route = parseActivityRoute(
    '?crmFrom=2026-99-99&crmTo=2026-02-30&crmStaffPage=Infinity&crmGroupPage=100001&crmBatchPage=-2&crmPage=1.2',
  );
  expect(route.from).toBe('');
  expect(route.to).toBe('');
  expect([route.staffPage, route.groupPage, route.batchPage, route.page]).toEqual([1, 1, 1, 1]);
  expect(parseActivityRoute('?crmFrom=2024-02-29&crmPage=100000').from).toBe('2024-02-29');
  expect(parseActivityRoute('?crmPage=100000').page).toBe(100000);
});

test('ancestor scroll positions survive preserved child pagination and query ordering', () => {
  expect(
    crmScrollKey('https://web-radar.net/?view=crm&crmTab=activity&crmOwner=owner&crmGroupPage=2'),
  ).toBe(
    crmScrollKey(
      'https://web-radar.net/?crmBatchPage=4&crmPage=5&crmGroupPage=2&crmOwner=owner&crmTab=activity&view=crm',
    ),
  );
});

test('staff lookup remains separate from activity search and survives entry and return', () => {
  const staff = parseActivityRoute('?crmStaffSearch=Owner&crmStaffPage=2');
  const group = { ...staff, owner: 'owner', search: '' };
  const url = activityUrl(group, 'https://web-radar.net/?view=crm');
  expect(url.searchParams.get('crmStaffSearch')).toBe('Owner');
  expect(url.searchParams.has('crmSearch')).toBe(false);
  expect(group.staffPage).toBe(2);
});

test('activity download keeps the selected recipient scope without limiting it to one page', () => {
  const route = parseActivityRoute(
    '?crmOwner=staff-a&crmGroup=group-a&crmBatch=campaign-a&crmSource=edm&crmChannel=site&crmMetric=replied&crmSearch=invoice&crmStaffSearch=Other&crmFrom=2026-10-01&crmTo=2026-10-08&crmPage=3',
  );
  const parameters = activityRecordParams(route);
  expect(Object.fromEntries(parameters)).toEqual({
    ownerId: 'staff-a',
    activityGroupId: 'group-a',
    channel: 'edm',
    search: 'invoice',
    from: new Date('2026-10-01T00:00:00').toISOString(),
    to: new Date('2026-10-08T23:59:59.999').toISOString(),
    businessId: 'campaign-a',
    metric: 'replied',
  });
  expect(parameters.has('page')).toBe(false);
  expect(parameters.has('pageSize')).toBe(false);
});
