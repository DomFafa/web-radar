import { useEffect, useState } from 'react';
import type {
  CrmActivityBatchDetail,
  CrmActivityBatchPage,
  CrmActivityEmployeePage,
  CrmActivityGroupPage,
  CrmActivityMetric,
  CrmCommunicationPage,
} from '../shared/crm';
import { api, errorMessage } from './api';
import { Button, Empty, Field, Icon, Notice, dateTime } from './components';

type Metric = 'all' | 'sent' | 'opened' | 'clicked' | 'replied' | 'failed' | 'uncertain';
type Source = '' | 'edm' | 'site';
export type ActivityRoute = {
  owner: string;
  group: string;
  batch: string;
  source: Source;
  channel: Source;
  metric: Metric;
  from: string;
  to: string;
  search: string;
  staffSearch: string;
  staffPage: number;
  groupPage: number;
  batchPage: number;
  page: number;
};
const metrics: Array<[Metric, string]> = [
  ['all', '全部客户'],
  ['sent', '已发送 / 提交'],
  ['opened', '已打开'],
  ['clicked', '已点击'],
  ['replied', '确认回复'],
  ['failed', '失败'],
  ['uncertain', '待核实'],
];
const routeKeys: Record<keyof ActivityRoute, string> = {
  owner: 'crmOwner',
  group: 'crmGroup',
  batch: 'crmBatch',
  source: 'crmSource',
  channel: 'crmChannel',
  metric: 'crmMetric',
  from: 'crmFrom',
  to: 'crmTo',
  search: 'crmSearch',
  staffSearch: 'crmStaffSearch',
  staffPage: 'crmStaffPage',
  groupPage: 'crmGroupPage',
  batchPage: 'crmBatchPage',
  page: 'crmPage',
};
export function parseActivityRoute(search: string): ActivityRoute {
  const params = new URLSearchParams(search),
    owner = params.get('crmOwner') || '',
    group = owner ? params.get('crmGroup') || '' : '';
  const source = params.get('crmSource'),
    channel = params.get('crmChannel'),
    metric = params.get('crmMetric');
  const page = (key: string) => {
    const value = Number(params.get(key));
    return Number.isSafeInteger(value) && value > 0 && value <= 100000 ? value : 1;
  };
  const date = (key: string) => {
    const value = params.get(key) || '',
      parsed = new Date(value + 'T00:00:00.000Z');
    return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
      ? value
      : '';
  };
  return {
    owner,
    group,
    batch: group && (source === 'edm' || source === 'site') ? params.get('crmBatch') || '' : '',
    source: source === 'edm' || source === 'site' ? source : '',
    channel: channel === 'edm' || channel === 'site' ? channel : '',
    metric: metrics.some(([key]) => key === metric) ? (metric as Metric) : 'all',
    from: date('crmFrom'),
    to: date('crmTo'),
    search: params.get('crmSearch') || '',
    staffSearch: params.get('crmStaffSearch') || '',
    staffPage: page('crmStaffPage'),
    groupPage: page('crmGroupPage'),
    batchPage: page('crmBatchPage'),
    page: page('crmPage'),
  };
}
export function activityLevel(route: ActivityRoute) {
  return !route.owner ? 'employees' : !route.group ? 'groups' : !route.batch ? 'batches' : 'detail';
}
export function activityUrl(route: ActivityRoute, href: string): URL {
  const url = new URL(href);
  url.searchParams.set('view', 'crm');
  url.searchParams.set('crmTab', 'activity');
  for (const [key, param] of Object.entries(routeKeys)) {
    const value = route[key as keyof ActivityRoute];
    if (value === '' || value === 'all' || value === 1) url.searchParams.delete(param);
    else url.searchParams.set(param, String(value));
  }
  for (const param of ['crmCustomer', 'crmRecordSource', 'crmRecordTarget'])
    url.searchParams.delete(param);
  return url;
}
export function activityMetricText(metric: CrmActivityMetric) {
  const value =
    metric.coverage === 'not_applicable'
      ? '不适用'
      : metric.coverage === 'unknown'
        ? '未追踪'
        : metric.value === null
          ? '未知'
          : metric.value.toLocaleString();
  const note =
    metric.coverage === 'not_applicable'
      ? '此渠道不提供这项指标'
      : metric.coverage === 'unknown'
        ? '没有可用的客户追踪数据'
        : metric.coverage === 'overall_only'
          ? '服务商总体报告，不提供具体客户名单'
          : metric.coverage === 'partial'
            ? `部分追踪：${metric.tracked.toLocaleString()} / ${metric.eligible.toLocaleString()}，名单仅显示已记录的客户`
            : '按已发送客户统计';
  return { value, rate: metric.rate === null ? null : `${(metric.rate * 100).toFixed(1)}%`, note };
}
export function navigateCrm(url: URL) {
  try {
    sessionStorage.setItem('crm-scroll:' + crmScrollKey(location.href), String(window.scrollY));
  } catch {}
  history.pushState({}, '', url.pathname + url.search);
  window.dispatchEvent(new Event('crm:navigate'));
  window.scrollTo(0, 0);
}
export function crmScrollKey(href: string): string {
  const url = new URL(href),
    level = activityLevel(parseActivityRoute(url.search));
  if (
    url.searchParams.get('crmTab') === 'activity' ||
    url.searchParams.get('crmTab') === 'employees'
  ) {
    const unused =
      level === 'employees'
        ? ['crmGroupPage', 'crmBatchPage', 'crmPage']
        : level === 'groups'
          ? ['crmBatchPage', 'crmPage']
          : level === 'batches'
            ? ['crmPage']
            : [];
    for (const key of unused) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.pathname + url.search;
}
export function restoreCrmScroll() {
  try {
    const value = Number(sessionStorage.getItem('crm-scroll:' + crmScrollKey(location.href)) || 0);
    requestAnimationFrame(() => window.scrollTo(0, value));
  } catch {}
}
function currentRoute() {
  return parseActivityRoute(typeof location === 'undefined' ? '' : location.search);
}
function Pager({
  data,
  busy,
  onPage,
}: {
  data: { total: number; page: number; pageSize: number } | null;
  busy: boolean;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 50))),
    page = data?.page || 1;
  return (
    <div className="crm-pagination">
      <span>
        {data ? `共 ${data.total.toLocaleString()} 条 · 第 ${page} / ${pages} 页` : '正在读取记录…'}
      </span>
      <div>
        <Button disabled={busy || page === 1} onClick={() => onPage(page - 1)}>
          上一页
        </Button>
        <Button disabled={busy || !data || page >= pages} onClick={() => onPage(page + 1)}>
          下一页
        </Button>
      </div>
    </div>
  );
}
export default function CrmActivity({
  request = api,
  revision,
  onCustomer,
  onRecord,
  statusLabel,
}: {
  request?: typeof api;
  revision: number;
  onCustomer: (key: string) => void;
  onRecord: (source: 'edm' | 'site', targetId: string) => void;
  statusLabel: (status: string) => string;
}) {
  const [route, setRoute] = useState(currentRoute),
    [form, setForm] = useState(currentRoute);
  const [employees, setEmployees] = useState<CrmActivityEmployeePage | null>(null),
    [groups, setGroups] = useState<CrmActivityGroupPage | null>(null),
    [batches, setBatches] = useState<CrmActivityBatchPage | null>(null),
    [detail, setDetail] = useState<CrmActivityBatchDetail | null>(null),
    [records, setRecords] = useState<CrmCommunicationPage | null>(null);
  const [owner, setOwner] = useState<{ id: string; name: string } | null>(null),
    [loadedScope, setLoadedScope] = useState(''),
    [busy, setBusy] = useState(true),
    [error, setError] = useState('');
  const level = activityLevel(route);
  const scope = JSON.stringify(route),
    ready = !busy && !error && loadedScope === scope;
  const ownerName = owner?.id === route.owner ? owner.name : '';
  useEffect(() => {
    const sync = () => {
      const next = currentRoute();
      setRoute(next);
      setForm(next);
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('crm:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('crm:navigate', sync);
    };
  }, []);
  useEffect(() => {
    if (!route.owner) {
      setOwner(null);
      return;
    }
    const controller = new AbortController();
    request<CrmActivityEmployeePage>(
      '/api/crm/activity/employees?ownerId=' + encodeURIComponent(route.owner),
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted)
          setOwner({ id: route.owner, name: result.employees[0]?.name || '所选员工' });
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      });
    return () => controller.abort();
  }, [route.owner, request]);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError('');
    const params = new URLSearchParams({
      ownerId: route.owner,
      activityGroupId: route.group,
      channel: route.channel,
      search: level === 'employees' ? route.staffSearch : route.search,
      pageSize: '50',
    });
    if (route.from) params.set('from', new Date(route.from + 'T00:00:00').toISOString());
    if (route.to) params.set('to', new Date(route.to + 'T23:59:59.999').toISOString());
    const options = { signal: controller.signal };
    let task: Promise<void>;
    if (level === 'employees') {
      params.set('page', String(route.staffPage));
      task = request<CrmActivityEmployeePage>(
        '/api/crm/activity/employees?' + params,
        options,
      ).then((result) => {
        if (!controller.signal.aborted) setEmployees(result);
      });
    } else if (level === 'groups') {
      params.set('page', String(route.groupPage));
      task = request<CrmActivityGroupPage>('/api/crm/activity/groups?' + params, options).then(
        (result) => {
          if (!controller.signal.aborted) setGroups(result);
        },
      );
    } else if (level === 'batches') {
      params.set('page', String(route.batchPage));
      task = request<CrmActivityBatchPage>('/api/crm/activity/batches?' + params, options).then(
        (result) => {
          if (!controller.signal.aborted) setBatches(result);
        },
      );
    } else {
      const detailParams = new URLSearchParams(params);
      params.set('businessId', route.batch);
      params.set('channel', route.source);
      params.set('metric', route.metric);
      params.set('page', String(route.page));
      task = Promise.all([
        request<CrmActivityBatchDetail>(
          `/api/crm/activity/batches/${route.source}/${encodeURIComponent(route.batch)}?${detailParams}`,
          options,
        ),
        request<CrmCommunicationPage>('/api/crm/communications?' + params, options),
      ]).then(([nextDetail, nextRecords]) => {
        if (!controller.signal.aborted) {
          setDetail(nextDetail);
          setRecords(nextRecords);
        }
      });
    }
    task
      .then(() => {
        if (!controller.signal.aborted) setLoadedScope(scope);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setBusy(false);
          restoreCrmScroll();
        }
      });
    return () => controller.abort();
  }, [route, level, revision, request]);
  function go(next: ActivityRoute) {
    navigateCrm(activityUrl(next, location.href));
  }
  const employeeRoot = {
    ...route,
    owner: '',
    search: '',
    group: '',
    batch: '',
    source: '' as Source,
    metric: 'all' as Metric,
  };
  const groupRoot = {
    ...route,
    group: '',
    batch: '',
    source: '' as Source,
    metric: 'all' as Metric,
  };
  const batchRoot = { ...route, batch: '', source: '' as Source, metric: 'all' as Metric };
  const list =
    level === 'employees'
      ? employees
      : level === 'groups'
        ? groups
        : level === 'batches'
          ? batches
          : records;
  const batch = ready ? detail?.batch : null;
  const selectedMetric = metrics.find(([key]) => key === route.metric)?.[1] || '全部客户';
  return (
    <div className="crm-activity" data-level={level}>
      <nav aria-label="员工活动层级" className="crm-breadcrumbs">
        <button
          onClick={() => go(employeeRoot)}
          aria-current={level === 'employees' ? 'page' : undefined}
        >
          员工活动
        </button>
        {route.owner && (
          <>
            <span>›</span>
            <button
              onClick={() => go(groupRoot)}
              aria-current={level === 'groups' ? 'page' : undefined}
            >
              {ownerName || '所选员工'} · 客户分组
            </button>
          </>
        )}
        {route.group && (
          <>
            <span>›</span>
            <button
              onClick={() => go(batchRoot)}
              aria-current={level === 'batches' ? 'page' : undefined}
            >
              发送活动
            </button>
          </>
        )}
        {route.batch && (
          <>
            <span>›</span>
            <span aria-current="page">效果与客户</span>
          </>
        )}
      </nav>
      <form
        className="crm-activity-filters"
        onSubmit={(event) => {
          event.preventDefault();
          const changedChannel = form.channel !== route.channel;
          go({
            ...route,
            from: form.from,
            to: form.to,
            channel: form.channel,
            search: form.search.trim(),
            staffSearch: form.staffSearch.trim(),
            staffPage: 1,
            groupPage: 1,
            batchPage: 1,
            page: 1,
            ...(changedChannel && route.batch
              ? { batch: '', source: '' as Source, metric: 'all' as Metric }
              : {}),
          });
        }}
      >
        <Field label="开始日期">
          <input
            type="date"
            value={form.from}
            max={form.to || undefined}
            onChange={(event) => setForm({ ...form, from: event.target.value })}
          />
        </Field>
        <Field label="结束日期">
          <input
            type="date"
            value={form.to}
            min={form.from || undefined}
            onChange={(event) => setForm({ ...form, to: event.target.value })}
          />
        </Field>
        <Field label="沟通渠道">
          <select
            aria-label="沟通渠道"
            value={form.channel}
            onChange={(event) => setForm({ ...form, channel: event.target.value as Source })}
          >
            <option value="">全部渠道</option>
            <option value="edm">EDM 邮件</option>
            <option value="site">站内信</option>
          </select>
        </Field>
        <Field label={level === 'employees' ? '查找员工' : '搜索活动或客户'}>
          <input
            value={level === 'employees' ? form.staffSearch : form.search}
            onChange={(event) =>
              setForm({
                ...form,
                [level === 'employees' ? 'staffSearch' : 'search']: event.target.value,
              })
            }
            placeholder={level === 'employees' ? '姓名、邮箱或关联活动' : '活动、客户或主题'}
          />
        </Field>
        <Button type="submit">
          <Icon name="search" />
          筛选
        </Button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}
      {level !== 'employees' && (
        <Button
          kind="quiet"
          onClick={() =>
            go(level === 'groups' ? employeeRoot : level === 'batches' ? groupRoot : batchRoot)
          }
        >
          <Icon name="arrow-left" />
          {level === 'groups'
            ? '返回员工活动'
            : level === 'batches'
              ? '返回客户分组'
              : '返回发送活动'}
        </Button>
      )}
      <div className="crm-activity-heading">
        <h2>
          {level === 'employees'
            ? '员工活动'
            : level === 'groups'
              ? `${ownerName || '所选员工'}负责的客户分组`
              : level === 'batches'
                ? '该分组的发送活动'
                : batch?.name || '发送活动效果'}
        </h2>
        {level !== 'employees' && (
          <p className="muted">
            {level === 'groups'
              ? '选择发送时的客户分组，查看该员工负责的发送活动。'
              : level === 'batches'
                ? '查看该员工在所选客户分组中的发送活动，再进入效果与客户名单。'
                : '每个发送活动累计统计其中的客户；向同一活动追加收件人，会累加到同一活动。当前只显示所选员工、分组及时间范围。'}
          </p>
        )}
      </div>
      {!ready && !error && <p role="status">正在加载…</p>}
      {level === 'detail' && batch && (
        <>
          <dl className="crm-activity-facts">
            <div>
              <dt>负责人</dt>
              <dd>{batch.ownerName || '历史负责人未记录'}</dd>
            </div>
            <div>
              <dt>客户分组</dt>
              <dd>{batch.activityGroupName}</dd>
            </div>
            <div>
              <dt>渠道</dt>
              <dd>{batch.source === 'edm' ? 'EDM 邮件' : '站内信'}</dd>
            </div>
            <div>
              <dt>创建时间</dt>
              <dd>{batch.createdAt ? dateTime(batch.createdAt) : '历史创建时间未记录'}</dd>
            </div>
            <div>
              <dt>首次发送</dt>
              <dd>{batch.firstSentAt ? dateTime(batch.firstSentAt) : '尚无确认发送记录'}</dd>
            </div>
            <div>
              <dt>最近发送</dt>
              <dd>{batch.lastSentAt ? dateTime(batch.lastSentAt) : '尚无确认发送记录'}</dd>
            </div>
          </dl>
          <div className="crm-activity-metrics" aria-label="发送活动效果">
            {metrics.map(([key, label]) => {
              const metric =
                key === 'opened' || key === 'clicked' || key === 'replied' ? batch[key] : null;
              const text = metric
                ? activityMetricText(metric)
                : {
                    value: (key === 'all'
                      ? batch.total
                      : batch[key as 'sent' | 'failed' | 'uncertain']
                    ).toLocaleString(),
                    rate: null,
                    note: key === 'all' ? '当前范围内的客户发送记录' : '',
                  };
              const disabled = !!metric && !metric.detailAvailable;
              return (
                <button
                  key={key}
                  data-metric={key}
                  aria-label={label}
                  aria-pressed={route.metric === key}
                  disabled={disabled}
                  className="crm-metric-card"
                  onClick={() => go({ ...route, metric: key, page: 1 })}
                >
                  <span>{label}</span>
                  <strong>{text.value}</strong>
                  {text.rate && <span>{text.rate}</span>}
                  <small>{text.note}</small>
                </button>
              );
            })}
          </div>
          <p className="crm-scope">
            打开、点击与回复按客户分别统计，同一客户可以同时出现在多个名单；未追踪不代表没有打开、点击或回复。百分比仅在完整追踪时显示。
          </p>
        </>
      )}
      <div className={`panel crm-table-panel ${level === 'detail' ? 'crm-activity-records' : ''}`}>
        <div className="crm-table-scroll">
          <table className="crm-table">
            <thead>
              <tr>
                {(level === 'employees'
                  ? ['员工', '客户分组', '发送活动', '活动客户', '最近发送']
                  : level === 'groups'
                    ? ['客户分组', '发送活动', '活动客户', '最近发送']
                    : level === 'batches'
                      ? ['发送活动', '渠道', '活动客户', '首次 / 最近发送']
                      : ['客户', '发送结果', '打开', '点击', '回复', '实际内容']
                ).map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ready &&
                level === 'employees' &&
                employees?.employees.map((employee) => (
                  <tr key={employee.userId || '__legacy__'}>
                    <td>
                      <button
                        className="crm-link crm-customer-name"
                        onClick={() =>
                          go({
                            ...route,
                            owner: employee.userId || '__legacy__',
                            group: '',
                            batch: '',
                            source: '',
                            search: '',
                            metric: 'all',
                            groupPage: 1,
                            batchPage: 1,
                            page: 1,
                          })
                        }
                      >
                        {employee.name}
                      </button>
                      <small>{employee.email}</small>
                      {employee.batches === 0 && <small>尚无发送活动</small>}
                    </td>
                    <td>{employee.groups}</td>
                    <td>{employee.batches}</td>
                    <td>{employee.customers}</td>
                    <td>{employee.lastSentAt ? dateTime(employee.lastSentAt) : '尚无确认发送'}</td>
                  </tr>
                ))}
              {ready &&
                level === 'groups' &&
                groups?.groups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <button
                        className="crm-link crm-customer-name"
                        onClick={() =>
                          go({
                            ...route,
                            group: group.id,
                            batch: '',
                            source: '',
                            metric: 'all',
                            batchPage: 1,
                            page: 1,
                          })
                        }
                      >
                        {group.name}
                      </button>
                      <small>
                        {group.basis === 'history_unknown'
                          ? '历史资料缺失'
                          : group.basis === 'ungrouped'
                            ? '发送时明确未分组'
                            : '发送时保存的分组'}
                      </small>
                    </td>
                    <td>{group.batches}</td>
                    <td>{group.customers}</td>
                    <td>{group.lastSentAt ? dateTime(group.lastSentAt) : '尚无确认发送'}</td>
                  </tr>
                ))}
              {ready &&
                level === 'batches' &&
                batches?.batches.map((item) => (
                  <tr key={item.source + ':' + item.businessId}>
                    <td>
                      <button
                        className="crm-link crm-customer-name"
                        onClick={() =>
                          go({
                            ...route,
                            batch: item.businessId,
                            source: item.source,
                            metric: 'all',
                            page: 1,
                          })
                        }
                      >
                        {item.name}
                      </button>
                      <small>{item.ownerName || '历史负责人未记录'}</small>
                    </td>
                    <td>{item.source === 'edm' ? 'EDM 邮件' : '站内信'}</td>
                    <td>{item.customers}</td>
                    <td>
                      {item.firstSentAt ? dateTime(item.firstSentAt) : '尚无确认发送'}
                      <small>{item.lastSentAt ? dateTime(item.lastSentAt) : ''}</small>
                    </td>
                  </tr>
                ))}
              {ready &&
                level === 'detail' &&
                records?.records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <button
                        className="crm-link crm-customer-name"
                        onClick={() => onCustomer(record.customerKey)}
                      >
                        {record.customerLabel}
                      </button>
                      <small>{record.email || record.website || '历史联系方式未记录'}</small>
                    </td>
                    <td>
                      {statusLabel(record.status)}
                      <small>{record.sentAt ? dateTime(record.sentAt) : '尚无确认发送'}</small>
                    </td>
                    <td>
                      {record.source === 'site'
                        ? '不适用'
                        : record.opened
                          ? '已打开'
                          : record.engagementCoverage === 'unknown' ||
                              record.engagementCoverage === 'overall_only'
                            ? '未追踪'
                            : '未记录'}
                      <small>{record.openedAt ? dateTime(record.openedAt) : ''}</small>
                    </td>
                    <td>
                      {record.source === 'site'
                        ? '不适用'
                        : record.clicked
                          ? '已点击'
                          : record.engagementCoverage === 'unknown' ||
                              record.engagementCoverage === 'overall_only'
                            ? '未追踪'
                            : '未记录'}
                      <small>{record.clickedAt ? dateTime(record.clickedAt) : ''}</small>
                    </td>
                    <td>
                      {record.replied ? '已回复' : record.tracked ? '未记录回复' : '未追踪'}
                      <small>{record.repliedAt ? dateTime(record.repliedAt) : ''}</small>
                    </td>
                    <td>
                      <button
                        className="crm-link"
                        onClick={() => onRecord(record.source, record.targetId)}
                      >
                        查看实际内容 →
                      </button>
                      <small>{record.subject || '历史主题未保存'}</small>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {ready && list?.total === 0 && (
          <Empty
            title={
              level === 'employees'
                ? '暂无可查看的员工活动'
                : level === 'groups'
                  ? '暂无发送分组'
                  : level === 'batches'
                    ? '暂无符合条件的发送活动'
                    : `暂无${selectedMetric === '全部客户' ? '' : selectedMetric}客户记录`
            }
          >
            {level === 'groups'
              ? '该员工没有符合条件的发送活动；客户资料中的联系人与分组仍然保留。'
              : '调整日期、渠道或搜索条件后再查看。尚未追踪的指标不会生成客户名单。'}
          </Empty>
        )}
        <Pager
          data={ready ? list : null}
          busy={!ready}
          onPage={(page) =>
            go({
              ...route,
              ...(level === 'employees'
                ? { staffPage: page }
                : level === 'groups'
                  ? { groupPage: page }
                  : level === 'batches'
                    ? { batchPage: page }
                    : { page }),
            })
          }
        />
      </div>
    </div>
  );
}
