import { useEffect, useRef, useState } from 'react';
import type { Principal } from '../shared/model';
import type {
  CrmCaptureStatus,
  CrmCommunicationDetail,
  CrmCommunicationPage,
  CrmCustomerPage,
  CrmCustomerProfile,
  CrmEmployee,
  CrmNote,
  CrmTimelineEvent,
} from '../shared/crm';
import { viewTeamData, writeBusiness } from '../shared/access';
import {
  api as request,
  errorMessage,
  post as requestPost,
  put as requestPut,
  sessionHeaders,
} from './api';
import { Button, Empty, Field, Icon, Notice, dateTime } from './components';
import CustomerInbox from './CustomerInbox';
import CrmActivity, {
  activityUrl,
  navigateCrm,
  parseActivityRoute,
  restoreCrmScroll,
} from './CrmActivity';
import './customer-management.css';

type Tab = 'activity' | 'customers' | 'communications' | 'replies';
const tabs: Array<[Tab, string]> = [
  ['activity', '员工活动'],
  ['customers', '客户资料'],
  ['replies', '客户回复'],
  ['communications', '全部沟通记录'],
];
const kinds: Record<string, string> = {
  human: '客户回复',
  unknown: '待确认来信',
  automatic: '自动回执',
  bounce: '退信',
};
const channels = { edm: 'EDM 邮件', site: '站内信' };
function scopedWorkspace(): string {
  return typeof location === 'undefined'
    ? ''
    : new URL(location.href).searchParams.get('crmWorkspace') || '';
}
function scoped(path: string): string {
  const workspace = scopedWorkspace();
  if (!workspace || !path.startsWith('/api/crm')) return path;
  const url = new URL(path, location.origin);
  url.searchParams.set('workspaceId', workspace);
  return url.pathname + url.search;
}
const api = <T,>(path: string, options: RequestInit = {}) => request<T>(scoped(path), options);
const post = <T,>(path: string, body: unknown) => requestPost<T>(scoped(path), body);
const put = <T,>(path: string, body: unknown) => requestPut<T>(scoped(path), body);

export function communicationStatus(status: string): string {
  return (
    (
      {
        pending: '待发送',
        queued: '等待发送',
        sending: '发送中',
        sent: '已发送',
        delivered: '已送达',
        opened: '已打开',
        clicked: '已点击',
        replied: '已回复',
        failed: '失败',
        bounced: '退信',
        bounce: '退信',
        skipped: '已跳过',
        submitted: '已提交',
        success: '已提交',
        cancelled: '已取消',
        unknown: '结果待确认',
        unverified: '结果待确认',
        uncertain: '待核实',
        submitted_unconfirmed: '提交待核实',
        submission_uncertain: '提交待核实',
      } as Record<string, string>
    )[status] || '结果待确认'
  );
}
export function trackingStatus(tracked: number, sent: number): string {
  return sent === 0
    ? '尚未发送'
    : tracked === 0
      ? '未追踪'
      : tracked < sent
        ? '部分追踪'
        : '已追踪';
}
export function timelineParticipantLabel(
  event: Pick<CrmTimelineEvent, 'direction' | 'sender' | 'ownerName'>,
): string {
  return event.direction === 'inbound'
    ? `来自 ${event.sender || '历史客户发件信息未保存'} · 关联员工 ${event.ownerName || '历史负责人未记录'}`
    : event.ownerName || '历史负责人未记录';
}
function captureLabel(status: CrmCaptureStatus): string {
  return status === 'captured'
    ? '发送时保存的内容'
    : status === 'legacy_partial'
      ? '历史内容（部分记录）'
      : '历史内容未保存';
}
function statusTone(status: string): string {
  return ['failed', 'bounced', 'bounce'].includes(status)
    ? 'error'
    : ['sent', 'delivered', 'submitted', 'success', 'replied'].includes(status)
      ? 'success'
      : 'warning';
}
export function auditActionLabel(action: string, detailText: string): string {
  let detail: Record<string, unknown> = {};
  try {
    detail = JSON.parse(detailText);
  } catch {}
  const handling = { pending: '待处理', following: '跟进中', done: '已完成' } as Record<
    string,
    string
  >;
  if (action === 'note.create') return '添加客户备注与跟进';
  if (action === 'note.status')
    return detail.after === 'done' ? '完成客户跟进' : '重新开始客户跟进';
  if (action === 'customer.link') return '关联网站与客户资料';
  if (action === 'message.classify') return `将来信分类为${kinds[String(detail.kind)] || '待确认'}`;
  if (action === 'thread.update')
    return detail.status
      ? `更新回复处理状态为${handling[String(detail.status)] || '待确认'}`
      : '更新回复负责人';
  if (action === 'thread.link') return '关联或更正来信业务来源';
  if (action === 'attachment.download') return '下载邮件附件';
  return '更新客户沟通记录';
}
const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export function emailPreviewDocument(html: string): string {
  const policy =
    "default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'none'; base-uri 'none'; form-action 'none'";
  const head = `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(policy)}"><meta name="referrer" content="no-referrer"><style>body{margin:0;padding:18px;font-family:Arial,sans-serif;color:#352e40;overflow-wrap:anywhere}*{max-width:100%;box-sizing:border-box}table{width:100%!important;table-layout:fixed}img{height:auto}pre{white-space:pre-wrap}</style>`;
  if (typeof DOMParser === 'undefined')
    return `<!doctype html><html><head>${head}</head><body><pre>${escapeHtml(html)}</pre></body></html>`;
  const document = new DOMParser().parseFromString(html, 'text/html');
  document
    .querySelectorAll('script,base,meta,iframe,frame,object,embed,link')
    .forEach((node) => node.remove());
  document.querySelectorAll('*').forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      if (
        /^on/i.test(attribute.name) ||
        ['href', 'action', 'formaction', 'target', 'srcset', 'poster', 'background'].includes(
          attribute.name,
        )
      )
        node.removeAttribute(attribute.name);
      if (attribute.name === 'src' && !/^data:/i.test(attribute.value.trim()))
        node.removeAttribute('src');
    }
  });
  return `<!doctype html><html><head>${head}${document.head.innerHTML}</head><body>${document.body.innerHTML}</body></html>`;
}

function Preview({ html }: { html: string }) {
  return (
    <>
      <iframe
        className="crm-email-preview"
        title="发送时的邮件内容"
        sandbox=""
        referrerPolicy="no-referrer"
        srcDoc={emailPreviewDocument(html)}
      />
      <p className="crm-preview-caption">为保护客户隐私，预览不会加载远程图片或打开邮件链接。</p>
    </>
  );
}
function Pagination({
  data,
  busy,
  onPage,
}: {
  data: { page: number; pageSize: number; total: number } | null;
  busy: boolean;
  onPage: (page: number) => void;
}) {
  const page = data?.page || 1,
    pages = Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 50)));
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
function CustomerAudit({ customerKey, revision }: { customerKey: string; revision: number }) {
  const [open, setOpen] = useState(false),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [data, setData] = useState<{
    events: Array<{
      id: string;
      actor_name?: string | null;
      action: string;
      detail: string;
      created_at: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setBusy(true);
    setError('');
    api<typeof data>(
      `/api/crm/customers/${encodeURIComponent(customerKey)}/audit?page=${page}&pageSize=50`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [open, customerKey, page, revision]);
  return (
    <details className="panel crm-audit" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>操作记录 · 查看客户关联、回复处理与跟进变更</summary>
      {open && (
        <>
          {error && <Notice tone="error">{error}</Notice>}
          {busy && <p role="status">正在读取操作记录…</p>}
          <div className="crm-table-scroll">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>操作人</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data?.events.map((event) => (
                  <tr key={event.id}>
                    <td>{dateTime(event.created_at)}</td>
                    <td>{event.actor_name || '历史操作人未记录'}</td>
                    <td>{auditActionLabel(event.action, event.detail)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && !data.events.length && !busy && <p className="muted">暂无操作记录</p>}
          <Pagination data={data} busy={busy} onPage={setPage} />
        </>
      )}
    </details>
  );
}
export function crmTabFromSearch(search: string): Tab {
  const value = new URLSearchParams(search).get('crmTab');
  return tabs.some(([key]) => key === value) ? (value as Tab) : 'activity';
}
function initialTab(): Tab {
  return crmTabFromSearch(typeof location === 'undefined' ? '' : location.search);
}
function selectedRecordFromUrl(): { source: 'edm' | 'site'; targetId: string } | null {
  if (typeof location === 'undefined') return null;
  const params = new URLSearchParams(location.search),
    source = params.get('crmRecordSource'),
    targetId = params.get('crmRecordTarget');
  return targetId && (source === 'edm' || source === 'site') ? { source, targetId } : null;
}

export default function CustomerManagement({
  principal,
  onManageContacts,
}: {
  principal: Principal;
  onManageContacts: (action: 'add' | 'import' | 'groups') => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab),
    [search, setSearch] = useState(''),
    [query, setQuery] = useState(''),
    [ownerId, setOwnerId] = useState(''),
    [channel, setChannel] = useState(''),
    [groupId, setGroupId] = useState('');
  const [page, setPage] = useState(1),
    [revision, setRevision] = useState(0),
    [customers, setCustomers] = useState<CrmCustomerPage | null>(null),
    [communications, setCommunications] = useState<CrmCommunicationPage | null>(null),
    [employees, setEmployees] = useState<CrmEmployee[] | null>(null),
    [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(() =>
      typeof location === 'undefined'
        ? ''
        : new URLSearchParams(location.search).get('crmCustomer') || '',
    ),
    [selectedCommunication, setSelectedCommunication] = useState<{
      source: 'edm' | 'site';
      targetId: string;
    } | null>(selectedRecordFromUrl),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [exporting, setExporting] = useState(false),
    [workspaces, setWorkspaces] = useState<Array<{ id: string; name: string }>>([]);
  const ownWorkspace = !scopedWorkspace() || scopedWorkspace() === principal.workspaceId;
  const writable = writeBusiness(principal) && ownWorkspace,
    team = viewTeamData(principal);
  useEffect(() => {
    const sync = () => {
      setTab(initialTab());
      setSelectedCustomer(new URLSearchParams(location.search).get('crmCustomer') || '');
      setSelectedCommunication(selectedRecordFromUrl());
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('crm:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('crm:navigate', sync);
    };
  }, []);
  useEffect(() => {
    if (principal.systemRole !== 'super_admin') return;
    const controller = new AbortController();
    request<{ workspaces: Array<{ id: string; name: string }> }>('/api/inbox/workspaces', {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setWorkspaces(result.workspaces);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      });
    return () => controller.abort();
  }, [principal.systemRole]);
  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get('view') === 'crm') {
      url.searchParams.set('crmTab', tab);
      history.replaceState({}, '', url);
    }
  }, [tab]);
  useEffect(() => {
    if (tab !== 'customers' && tab !== 'communications') return;
    const controller = new AbortController();
    api<{ employees: CrmEmployee[] }>('/api/crm/employees', { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setEmployees(result.employees);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      });
    if (ownWorkspace)
      api<{ data: Array<{ id: string; name: string }> }>('/api/outreach/contacts/groups', {
        signal: controller.signal,
      })
        .then((result) => {
          if (!controller.signal.aborted) setGroups(result.data);
        })
        .catch((reason) => {
          if (!controller.signal.aborted) setError(errorMessage(reason));
        });
    return () => controller.abort();
  }, [revision, tab]);
  useEffect(() => {
    if (tab !== 'customers' && tab !== 'communications') {
      setBusy(false);
      return;
    }
    const controller = new AbortController();
    setBusy(true);
    setError('');
    const parameters = new URLSearchParams({
      search: query,
      ownerId,
      channel,
      groupId,
      page: String(page),
      pageSize: '50',
    });
    const path = `/api/crm/${tab}?${parameters}`;
    (tab === 'customers'
      ? api<CrmCustomerPage>(path, { signal: controller.signal }).then((result) => {
          if (!controller.signal.aborted) setCustomers(result);
        })
      : api<CrmCommunicationPage>(path, { signal: controller.signal }).then((result) => {
          if (!controller.signal.aborted) setCommunications(result);
        })
    )
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [tab, query, ownerId, channel, groupId, page, revision]);
  function changeTab(next: Tab) {
    const url = new URL(location.href);
    url.searchParams.set('crmTab', next);
    url.searchParams.delete('crmCustomer');
    url.searchParams.delete('crmRecordSource');
    url.searchParams.delete('crmRecordTarget');
    navigateCrm(url);
    setPage(1);
  }
  function selectCustomer(key: string) {
    const url = new URL(location.href);
    if (key) url.searchParams.set('crmCustomer', key);
    else url.searchParams.delete('crmCustomer');
    url.searchParams.delete('crmRecordSource');
    url.searchParams.delete('crmRecordTarget');
    navigateCrm(url);
  }
  function selectRecord(source?: 'edm' | 'site', targetId?: string) {
    const url = new URL(location.href);
    if (source && targetId) {
      url.searchParams.set('crmRecordSource', source);
      url.searchParams.set('crmRecordTarget', targetId);
    } else {
      url.searchParams.delete('crmRecordSource');
      url.searchParams.delete('crmRecordTarget');
    }
    navigateCrm(url);
  }
  function returnToActivity(level: 'employees' | 'groups' | 'batches' | 'detail') {
    const route = parseActivityRoute(location.search);
    navigateCrm(
      activityUrl(
        {
          ...route,
          ...(level === 'employees'
            ? {
                owner: '',
                group: '',
                batch: '',
                source: '' as const,
                search: '',
                metric: 'all' as const,
              }
            : level === 'groups'
              ? { group: '', batch: '', source: '' as const, metric: 'all' as const }
              : level === 'batches'
                ? { batch: '', source: '' as const, metric: 'all' as const }
                : {}),
        },
        location.href,
      ),
    );
  }
  function changeFilter(set: (value: string) => void, value: string) {
    set(value);
    setPage(1);
  }
  async function exportCommunications(explicitParameters?: URLSearchParams) {
    setExporting(true);
    setError('');
    try {
      const parameters =
        explicitParameters || new URLSearchParams({ search: query, ownerId, channel, groupId });
      const response = await fetch(scoped('/api/crm/communications/export?' + parameters), {
        headers: sessionHeaders(),
        cache: 'no-store',
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(body.error || body.message || '导出失败，请重试');
      }
      const url = URL.createObjectURL(await response.blob()),
        anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = '客户沟通记录.csv';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setExporting(false);
    }
  }
  const list = tab === 'customers' ? customers : communications;
  return (
    <div className="customer-management">
      <header className="crm-heading">
        <div className="page-heading">
          <h1>客户管理系统</h1>
          <p>先选员工，再看分组与发送效果。</p>
        </div>
        <div className="crm-actions">
          <Button onClick={() => setRevision((value) => value + 1)} disabled={busy}>
            <Icon name="refresh" />
            刷新
          </Button>
          {writable && tab === 'customers' && (
            <>
              <Button onClick={() => onManageContacts('import')}>
                <Icon name="upload" />
                导入客户
              </Button>
              <Button kind="primary" onClick={() => onManageContacts('add')}>
                <Icon name="plus" />
                新增客户
              </Button>
            </>
          )}
        </div>
      </header>
      <nav className="crm-tabs" role="tablist" aria-label="客户管理功能">
        {tabs.map(([key, label]) => (
          <button
            role="tab"
            key={key}
            id={`crm-tab-${key}`}
            aria-controls={`crm-panel-${key}`}
            aria-selected={tab === key}
            className={key === 'activity' ? 'crm-main-tab' : 'crm-aux-tab'}
            onClick={() => changeTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {principal.systemRole === 'super_admin' && (
        <Field label="客户工作区">
          <select
            aria-label="客户工作区"
            value={scopedWorkspace() || principal.workspaceId}
            onChange={(event) => {
              const url = new URL(location.href);
              url.searchParams.set('crmWorkspace', event.target.value);
              url.searchParams.set('inboxWorkspace', event.target.value);
              url.searchParams.delete('inboxThread');
              for (const key of [
                'crmOwner',
                'crmGroup',
                'crmBatch',
                'crmSource',
                'crmCustomer',
                'crmRecordSource',
                'crmRecordTarget',
                'crmMetric',
                'crmStaffPage',
                'crmGroupPage',
                'crmBatchPage',
                'crmPage',
              ])
                url.searchParams.delete(key);
              location.href = url.pathname + url.search;
            }}
          >
            {workspaces.length ? (
              workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name || workspace.id}
                </option>
              ))
            ) : (
              <option value={principal.workspaceId}>{principal.workspaceName}</option>
            )}
          </select>
        </Field>
      )}
      {!ownWorkspace && (
        <Notice>
          正在查看其他工作区的客户数据。导入名单、管理分组和写邮件，请先返回当前账号的工作区。
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {tab === 'activity' && (selectedCustomer || selectedCommunication) && (
        <nav className="crm-breadcrumbs" aria-label="员工活动层级">
          <button onClick={() => returnToActivity('employees')}>员工活动</button>
          <span>›</span>
          <button onClick={() => returnToActivity('groups')}>客户分组</button>
          <span>›</span>
          <button onClick={() => returnToActivity('batches')}>发送活动</button>
          <span>›</span>
          <button onClick={() => returnToActivity('detail')}>效果与客户</button>
          <span>›</span>
          {selectedCustomer && selectedCommunication ? (
            <>
              <button onClick={() => selectRecord()}>客户资料</button>
              <span>›</span>
            </>
          ) : null}
          <span aria-current="page">{selectedCommunication ? '发送内容' : '客户资料'}</span>
        </nav>
      )}
      <section role="tabpanel" id={`crm-panel-${tab}`} aria-labelledby={`crm-tab-${tab}`}>
        {tab === 'replies' ? (
          <CustomerInbox principal={principal} embedded />
        ) : selectedCommunication ? (
          <CommunicationDetail
            selection={selectedCommunication}
            onClose={() => selectRecord()}
            backLabel={
              tab === 'activity'
                ? selectedCustomer
                  ? '返回客户资料'
                  : '返回效果与客户'
                : undefined
            }
          />
        ) : selectedCustomer ? (
          <CustomerProfile
            key={selectedCustomer}
            customerKey={selectedCustomer}
            principal={principal}
            onBack={() => selectCustomer('')}
            onCustomer={selectCustomer}
            onRecord={selectRecord}
            backLabel={tab === 'activity' ? '返回效果与客户' : undefined}
          />
        ) : tab === 'activity' ? (
          <CrmActivity
            request={api}
            revision={revision}
            onCustomer={selectCustomer}
            onRecord={selectRecord}
            onExport={exportCommunications}
            exporting={exporting}
            statusLabel={communicationStatus}
          />
        ) : (
          <>
            <p className="crm-scope">
              {team
                ? '当前显示本工作区的客户沟通；可按员工筛选。'
                : '发送与回复记录按你的访问权限显示。联系人沿用工作区共享名单。'}
              确认回复仅统计已关联并确认的客户来信，未追踪不代表没有回复。
            </p>
            {
              <>
                <form
                  className="crm-toolbar"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setQuery(search.trim());
                    setPage(1);
                  }}
                >
                  <Field
                    className="crm-search-field"
                    label={tab === 'customers' ? '搜索客户' : '搜索沟通记录'}
                  >
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={
                        tab === 'customers' ? '姓名、邮箱、公司或网站' : '客户、主题、活动或网站'
                      }
                    />
                  </Field>
                  {team && (
                    <Field label="员工">
                      <select
                        aria-label="员工"
                        value={ownerId}
                        onChange={(event) => changeFilter(setOwnerId, event.target.value)}
                      >
                        <option value="">全部员工</option>
                        {employees
                          ?.filter((employee) => employee.userId)
                          .map((employee) => (
                            <option key={employee.userId} value={employee.userId!}>
                              {employee.name}
                            </option>
                          ))}
                      </select>
                    </Field>
                  )}
                  <Field label="沟通渠道">
                    <select
                      aria-label="沟通渠道"
                      value={channel}
                      onChange={(event) => changeFilter(setChannel, event.target.value)}
                    >
                      <option value="">全部渠道</option>
                      <option value="edm">EDM 邮件</option>
                      <option value="site">站内信</option>
                    </select>
                  </Field>
                  {tab === 'customers' && ownWorkspace && (
                    <Field label="客户分组">
                      <select
                        aria-label="客户分组"
                        value={groupId}
                        onChange={(event) => changeFilter(setGroupId, event.target.value)}
                      >
                        <option value="">全部分组</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Button type="submit">
                    <Icon name="search" />
                    搜索
                  </Button>
                </form>
                {tab === 'customers' && writable && (
                  <div className="crm-section-heading">
                    <span className="muted">
                      客户名单包含共享联系人和站内信目标。网站关联到联系人后，可统一查看两个渠道。
                    </span>
                    <Button kind="quiet" onClick={() => onManageContacts('groups')}>
                      <Icon name="tag" />
                      管理分组
                    </Button>
                  </div>
                )}
                {tab === 'communications' && (
                  <div className="crm-section-heading">
                    <span className="muted">
                      点击主题查看发送当时的内容；导出包含当前筛选的全部记录。
                    </span>
                    <Button
                      disabled={exporting}
                      busy={exporting}
                      onClick={() => exportCommunications()}
                    >
                      <Icon name="down" />
                      导出全部记录
                    </Button>
                  </div>
                )}
                <div className="panel crm-table-panel">
                  {busy && (
                    <p role="status" style={{ padding: '0 18px' }}>
                      正在加载…
                    </p>
                  )}
                  {tab === 'customers' ? (
                    <CustomerTable data={customers} onCustomer={selectCustomer} />
                  ) : (
                    <CommunicationTable
                      data={communications}
                      onCustomer={selectCustomer}
                      onRecord={selectRecord}
                    />
                  )}
                  {list &&
                    !(tab === 'customers'
                      ? customers?.customers.length
                      : communications?.records.length) &&
                    !busy && (
                      <Empty title={tab === 'customers' ? '暂无符合条件的客户' : '暂无沟通记录'}>
                        {tab === 'customers'
                          ? '可以导入客户名单，或调整搜索与筛选条件。'
                          : '发送邮件或提交站内信后，记录会自动出现在这里。'}
                      </Empty>
                    )}
                  <Pagination data={list} busy={busy} onPage={setPage} />
                </div>
              </>
            }
          </>
        )}
      </section>
    </div>
  );
}

function CustomerTable({
  data,
  onCustomer,
}: {
  data: CrmCustomerPage | null;
  onCustomer: (key: string) => void;
}) {
  return (
    <div className="crm-table-scroll">
      <table className="crm-table">
        <thead>
          <tr>
            <th>客户</th>
            <th>分组</th>
            <th className="crm-number">已发送 / 提交</th>
            <th className="crm-number">确认回复</th>
            <th className="crm-number">失败</th>
            <th className="crm-number">待核实</th>
            <th>最近沟通</th>
          </tr>
        </thead>
        <tbody>
          {data?.customers.map((customer) => (
            <tr key={customer.key}>
              <td>
                <button
                  className="crm-link crm-customer-name"
                  onClick={() => onCustomer(customer.key)}
                >
                  {customer.label}
                </button>
                <small>{customer.email || customer.website || '联系方式未填写'}</small>
                {customer.company && <small>{customer.company}</small>}
              </td>
              <td>{customer.groupName || '未分组'}</td>
              <td className="crm-number">{customer.sent}</td>
              <td className="crm-number">{customer.replied}</td>
              <td className="crm-number">{customer.failed}</td>
              <td className="crm-number">{customer.uncertain}</td>
              <td>{customer.lastActivityAt ? dateTime(customer.lastActivityAt) : '尚无记录'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function CommunicationTable({
  data,
  onCustomer,
  onRecord,
}: {
  data: CrmCommunicationPage | null;
  onCustomer: (key: string) => void;
  onRecord: (source: 'edm' | 'site', targetId: string) => void;
}) {
  return (
    <div className="crm-table-scroll">
      <table className="crm-table">
        <thead>
          <tr>
            <th>客户 / 发送内容</th>
            <th>员工</th>
            <th>渠道 / 活动</th>
            <th>结果</th>
            <th>回复追踪</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {data?.records.map((record) => (
            <tr key={record.id}>
              <td>
                <button
                  className="crm-link crm-customer-name"
                  onClick={() => onCustomer(record.customerKey)}
                >
                  {record.customerLabel}
                </button>
                <small>
                  <button
                    className="crm-link"
                    onClick={() => onRecord(record.source, record.targetId)}
                  >
                    {record.subject || '查看发送内容'}
                  </button>
                </small>
              </td>
              <td>{record.ownerName || '历史负责人未记录'}</td>
              <td>
                {channels[record.source]}
                <small>{record.businessName}</small>
              </td>
              <td>
                <span className={`crm-badge ${statusTone(record.status)}`}>
                  {communicationStatus(record.status)}
                </span>
                {record.replied > 0 && <small>已确认客户回复</small>}
              </td>
              <td>
                <span className="crm-badge">
                  {record.uncertain > 0
                    ? record.tracked
                      ? '已追踪，发送待核实'
                      : '发送待核实'
                    : trackingStatus(record.tracked ? record.sent : 0, record.sent)}
                </span>
              </td>
              <td>{dateTime(record.sentAt || record.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function CustomerProfile({
  customerKey,
  principal,
  onBack,
  onCustomer,
  onRecord,
  backLabel = '返回列表',
}: {
  customerKey: string;
  principal: Principal;
  onBack: () => void;
  onCustomer: (key: string) => void;
  onRecord: (source: 'edm' | 'site', targetId: string) => void;
  backLabel?: string;
}) {
  const scrollRestored = useRef(false);
  const [data, setData] = useState<CrmCustomerProfile | null>(null),
    [page, setPage] = useState(1),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(true);
  const [note, setNote] = useState(''),
    [followUp, setFollowUp] = useState(''),
    [saving, setSaving] = useState(false),
    [linkSearch, setLinkSearch] = useState(''),
    [linkContacts, setLinkContacts] = useState<Array<{ id: string; email: string; name?: string }>>(
      [],
    ),
    [linkContactId, setLinkContactId] = useState('');
  const [notesPage, setNotesPage] = useState(1),
    [notesBusy, setNotesBusy] = useState(false),
    [olderNotes, setOlderNotes] = useState<{
      notes: CrmNote[];
      total: number;
      page: number;
      pageSize: number;
    } | null>(null);
  useEffect(() => {
    if (data && !busy && !scrollRestored.current) {
      scrollRestored.current = true;
      restoreCrmScroll();
    }
  }, [data, busy]);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError('');
    api<CrmCustomerProfile>(
      `/api/crm/customers/${encodeURIComponent(customerKey)}?page=${page}&pageSize=30`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [customerKey, page, revision]);
  useEffect(() => {
    if (notesPage === 1) {
      setOlderNotes(null);
      return;
    }
    const controller = new AbortController();
    setNotesBusy(true);
    api<{ notes: CrmNote[]; total: number; page: number; pageSize: number }>(
      `/api/crm/customers/${encodeURIComponent(customerKey)}/notes?page=${notesPage}&pageSize=200`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted) setOlderNotes(result);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setNotesBusy(false);
      });
    return () => controller.abort();
  }, [customerKey, notesPage, revision]);
  async function action(run: () => Promise<unknown>) {
    setSaving(true);
    setError('');
    try {
      await run();
      setRevision((value) => value + 1);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }
  function viewReplies(threadId: string) {
    const url = new URL(location.href);
    url.searchParams.set('view', 'crm');
    url.searchParams.set('crmTab', 'replies');
    url.searchParams.set('inboxThread', threadId);
    location.href = url.pathname + url.search;
  }
  if (!data)
    return (
      <div className="crm-profile">
        <Button kind="quiet" onClick={onBack}>
          <Icon name="back" />
          {backLabel}
        </Button>
        {error ? <Notice tone="error">{error}</Notice> : <p role="status">正在读取客户资料…</p>}
      </div>
    );
  const customer = data.customer;
  const currentWorkspace = !scopedWorkspace() || scopedWorkspace() === principal.workspaceId;
  const noteList = olderNotes || {
    notes: data.notes,
    total: data.notesTotal,
    page: data.notesPage,
    pageSize: data.notesPageSize,
  };
  return (
    <div className="crm-profile">
      <Button kind="quiet" onClick={onBack}>
        <Icon name="back" />
        {backLabel}
      </Button>
      <header className="crm-profile-heading">
        <div>
          <h2>{customer.label}</h2>
          <p>{[customer.company, customer.email, customer.website].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="crm-actions">
          {writeBusiness(principal) && currentWorkspace && customer.contactId && customer.email && (
            <a
              className="button primary"
              href={`/?view=edm&edmTab=send&crmContactId=${encodeURIComponent(customer.contactId)}`}
            >
              <Icon name="mail" />
              写邮件给客户
            </a>
          )}
        </div>
      </header>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="crm-summary">
        {[
          ['已发送 / 提交', customer.sent],
          ['确认回复', customer.replied],
          ['失败', customer.failed],
          ['待核实', customer.uncertain],
          ['客户分组', customer.groupName || '未分组'],
        ].map(([label, value]) => (
          <div className="panel" key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {!data.canBody && <Notice>当前权限可查看沟通概要，正文与跟进备注由管理员授权。</Notice>}
      <div className="crm-profile-grid">
        <section className="panel">
          <div className="crm-section-heading">
            <h3>客户沟通时间线</h3>
            <span className="muted">按时间倒序</span>
          </div>
          {busy && <p role="status">正在加载…</p>}
          <ol className="crm-timeline">
            {data.timeline.map((event) => (
              <TimelineEvent
                key={event.id}
                event={event}
                onRecord={onRecord}
                onReplies={viewReplies}
              />
            ))}
          </ol>
          {!data.timeline.length && !busy && (
            <Empty title="尚无沟通记录">发送内容、客户来信和跟进备注会汇总在这里。</Empty>
          )}
          <Pagination data={data} busy={busy} onPage={setPage} />
        </section>
        <aside className="panel">
          <div className="crm-section-heading">
            <h3>备注与跟进</h3>
          </div>
          {data.canWrite && (
            <form
              className="crm-note-form"
              onSubmit={(event) => {
                event.preventDefault();
                action(async () => {
                  await post(`/api/crm/customers/${encodeURIComponent(customerKey)}/notes`, {
                    content: note.trim(),
                    followUpAt: followUp ? new Date(followUp).toISOString() : null,
                  });
                  setNote('');
                  setFollowUp('');
                  setNotesPage(1);
                });
              }}
            >
              <Field label="跟进记录">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="记录沟通情况、客户需求或下一步安排"
                  required
                  maxLength={10000}
                />
              </Field>
              <Field label="下次跟进时间（可选）">
                <input
                  type="datetime-local"
                  value={followUp}
                  onChange={(event) => setFollowUp(event.target.value)}
                />
              </Field>
              <Button type="submit" kind="primary" disabled={!note.trim() || saving} busy={saving}>
                保存跟进记录
              </Button>
            </form>
          )}
          {noteList.notes.map((item) => (
            <Note
              key={item.id}
              note={item}
              busy={saving}
              onStatus={(status) =>
                action(() => put(`/api/crm/notes/${encodeURIComponent(item.id)}`, { status }))
              }
            />
          ))}
          {!noteList.notes.length && <p className="muted">暂无跟进记录</p>}
          {noteList.total > noteList.pageSize && (
            <Pagination data={noteList} busy={notesBusy} onPage={setNotesPage} />
          )}
          {data.canWrite && currentWorkspace && customer.website && !customer.contactId && (
            <form
              className="crm-link-form"
              onSubmit={(event) => {
                event.preventDefault();
                action(async () => {
                  await put('/api/crm/site-link', {
                    websiteUrl: customer.website,
                    contactId: linkContactId,
                  });
                  onCustomer('contact:' + linkContactId);
                });
              }}
            >
              <h4 style={{ margin: 0 }}>关联已有客户</h4>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                选择这个网站对应的联系人，统一查看邮件和站内信记录。
              </p>
              <Field label="搜索联系人邮箱或名称">
                <input value={linkSearch} onChange={(event) => setLinkSearch(event.target.value)} />
              </Field>
              <Button
                type="button"
                disabled={saving || !linkSearch.trim()}
                onClick={() =>
                  action(async () => {
                    const result = await api<{
                      data: Array<{ id: string; email: string; name?: string }>;
                    }>(
                      `/api/outreach/contacts?search=${encodeURIComponent(linkSearch.trim())}&pageSize=30`,
                    );
                    setLinkContacts(result.data);
                    setLinkContactId('');
                  })
                }
              >
                查找联系人
              </Button>
              <Field label="确认关联的客户">
                <select
                  aria-label="确认关联的客户"
                  value={linkContactId}
                  onChange={(event) => setLinkContactId(event.target.value)}
                >
                  <option value="">请选择已有联系人</option>
                  {linkContacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name ? `${contact.name} · ` : ''}
                      {contact.email}
                    </option>
                  ))}
                </select>
              </Field>
              <Button type="submit" disabled={saving || !linkContactId}>
                确认关联
              </Button>
            </form>
          )}
        </aside>
      </div>
      <CustomerAudit customerKey={customerKey} revision={revision} />
    </div>
  );
}
function Note({
  note,
  busy,
  onStatus,
}: {
  note: CrmNote;
  busy: boolean;
  onStatus: (status: 'pending' | 'done') => void;
}) {
  return (
    <article className="crm-note">
      <small>
        {note.authorName || '历史负责人未记录'} · {dateTime(note.createdAt)}
      </small>
      <p>{note.canBody ? note.content : '当前权限无法查看备注内容'}</p>
      {note.followUpAt && (
        <p className="muted">
          <Icon name="clock" size={14} /> 跟进时间：{dateTime(note.followUpAt)}
        </p>
      )}
      <div className="crm-actions">
        <span className={`crm-badge ${note.status === 'done' ? 'success' : 'warning'}`}>
          {note.status === 'done' ? '已完成' : '待跟进'}
        </span>
        {note.canWrite && note.canBody && (
          <Button
            kind="quiet"
            disabled={busy}
            onClick={() => onStatus(note.status === 'done' ? 'pending' : 'done')}
          >
            {note.status === 'done' ? '重新跟进' : '标记完成'}
          </Button>
        )}
      </div>
    </article>
  );
}
function TimelineEvent({
  event,
  onRecord,
  onReplies,
}: {
  event: CrmTimelineEvent;
  onRecord: (source: 'edm' | 'site', targetId: string) => void;
  onReplies: (threadId: string) => void;
}) {
  const label =
    event.direction === 'outbound'
      ? `${event.source ? channels[event.source] : ''}发送`
      : event.direction === 'inbound'
        ? kinds[event.kind || 'unknown'] || '待确认来信'
        : '跟进记录';
  return (
    <li className="crm-event">
      <div className="crm-event-heading">
        <strong>{label}</strong>
        <time>{dateTime(event.occurredAt)}</time>
      </div>
      <p>
        {timelineParticipantLabel(event)}
        {event.direction === 'outbound' && (
          <>
            {' '}
            ·{' '}
            <span className={`crm-badge ${statusTone(event.status)}`}>
              {communicationStatus(event.status)}
            </span>
          </>
        )}
      </p>
      {event.subject && <h4>{event.subject}</h4>}
      {event.canBody && event.bodyText && <pre className="crm-event-text">{event.bodyText}</pre>}
      {!event.canBody && <p>正文未授权</p>}
      {event.direction === 'outbound' && event.captureStatus && (
        <p>{captureLabel(event.captureStatus)}</p>
      )}
      <div className="crm-actions">
        {event.direction === 'outbound' && event.source && event.targetId && (
          <button className="crm-link" onClick={() => onRecord(event.source!, event.targetId!)}>
            查看发送内容与结果 →
          </button>
        )}
        {event.threadId && (
          <button className="crm-link" onClick={() => onReplies(event.threadId!)}>
            打开客户回复 →
          </button>
        )}
      </div>
    </li>
  );
}
function CommunicationDetail({
  selection,
  onClose,
  backLabel = '返回上一页',
}: {
  selection: { source: 'edm' | 'site'; targetId: string };
  onClose: () => void;
  backLabel?: string;
}) {
  const [data, setData] = useState<CrmCommunicationDetail | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    api<CrmCommunicationDetail>(
      `/api/crm/communications/${selection.source}/${encodeURIComponent(selection.targetId)}`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          restoreCrmScroll();
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      });
    return () => controller.abort();
  }, [selection.source, selection.targetId]);
  const record = data?.record;
  const envelope = data?.attempts[0];
  return (
    <section className="panel crm-communication-detail" aria-label="发送内容详情">
      <div className="crm-section-heading">
        <h2>发送内容与结果</h2>
        <Button kind="quiet" onClick={onClose}>
          <Icon name="back" />
          {backLabel}
        </Button>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {!record && !error && <p role="status">正在读取发送记录…</p>}
      {record && (
        <>
          <dl className="crm-detail-facts">
            <dt>客户</dt>
            <dd>
              {record.customerLabel} · {record.email || record.website}
            </dd>
            <dt>员工</dt>
            <dd>{record.ownerName || '历史负责人未记录'}</dd>
            <dt>实际收件人</dt>
            <dd>
              {envelope?.recipientEmail ||
                (record.source === 'site' ? record.website : '历史收件地址未保存')}
            </dd>
            <dt>实际发件人</dt>
            <dd>
              {record.senderEmail
                ? [record.senderName, record.senderEmail].filter(Boolean).join(' · ')
                : '历史发件信息未保存'}
            </dd>
            <dt>实际回复地址</dt>
            <dd>{record.replyTo || '历史回复地址未保存'}</dd>
            <dt>渠道 / 活动</dt>
            <dd>
              {channels[record.source]} · {record.businessName}
            </dd>
            <dt>发送结果</dt>
            <dd>
              {communicationStatus(record.status)} · {dateTime(record.sentAt || record.createdAt)}
            </dd>
            <dt>回复追踪</dt>
            <dd>
              {record.uncertain > 0
                ? '发送结果待核实；请先核对执行回执'
                : record.sent === 0
                  ? '尚未发送'
                  : record.tracked
                    ? '已追踪'
                    : '未追踪；无法判断是否收到客户回复'}
            </dd>
          </dl>
          {record.errorMessage && <Notice tone="error">{record.errorMessage}</Notice>}
          <h3>{record.subject || '发送内容'}</h3>
          <p className="crm-preview-caption">
            {captureLabel(record.captureStatus)}。内容记录保留发送当时版本。
          </p>
          {!data!.canBody ? (
            <Notice>当前权限无法查看发送正文。</Notice>
          ) : record.bodyHtml ? (
            <Preview html={record.bodyHtml} />
          ) : record.bodyText ? (
            <pre className="crm-event-text">{record.bodyText}</pre>
          ) : (
            <Notice>这条历史记录没有保存完整发送内容。</Notice>
          )}
          {!!data?.attempts.length && (
            <details>
              <summary>
                查看执行结果（共 {data.attemptsTotal} 次
                {data.attemptsTotal > data.attempts.length
                  ? `，当前显示最近 ${data.attempts.length} 次`
                  : ''}
                ）
              </summary>
              {data.attempts.map((attempt) => (
                <article className="crm-note" key={attempt.id}>
                  <div className="crm-event-heading">
                    <span className={`crm-badge ${statusTone(attempt.status)}`}>
                      {communicationStatus(attempt.status)}
                    </span>
                    <time>{dateTime(attempt.completedAt || attempt.createdAt)}</time>
                  </div>
                  <p className="crm-preview-caption">
                    {attempt.provider || '服务商未记录'} · 回执：
                    {attempt.providerMessageId || '未返回'}
                  </p>
                  <p className="crm-preview-caption">
                    收件人：
                    {attempt.recipientEmail ||
                      (record.source === 'site' ? record.website : '未保存')}{' '}
                    · 发件人：{attempt.senderEmail || '未保存'} · 回复地址：
                    {attempt.replyTo || '未保存'}
                  </p>
                  {attempt.errorMessage && <p>{attempt.errorMessage}</p>}
                  <h4>{attempt.subject}</h4>
                  {data.canBody &&
                    (attempt.bodyHtml ? (
                      <Preview html={attempt.bodyHtml} />
                    ) : (
                      <pre className="crm-event-text">{attempt.bodyText || '未保存正文'}</pre>
                    ))}
                </article>
              ))}
            </details>
          )}
        </>
      )}
    </section>
  );
}
