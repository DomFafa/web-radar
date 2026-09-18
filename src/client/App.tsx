import type { ProjectSummary, ProjectList } from '../shared/model';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Principal, Project, ServiceStatus, TemplateId } from '../shared/model';
import {
  api,
  post,
  requestId,
  setSession,
  clearSession,
  errorMessage,
  parentOrigin,
  validHandoff,
  HandoffAttempts,
  type SessionResult,
} from './api';
import {
  AssetView,
  Brand,
  Button,
  Empty,
  Field,
  Icon,
  Mark,
  Modal,
  Notice,
  ServiceList,
  dateTime,
} from './components';
import { Editor } from './Editor';
import { Admin } from './Admin';
import { nextDraftStep, projectStatus, workflowSteps } from './workflow';

type Config = { testMode: boolean; services: ServiceStatus[]; parentOrigins?: string[] };
const embedded = window.location.pathname === '/embed/product-radar';
const embedOrigin = parentOrigin(new URLSearchParams(window.location.search).get('parentOrigin'));

const TEMPLATE_PREVIEWS: Record<string, string> = {
  'senseng-clean': '/templates/previews/senseng-clean.jpg',
  'senseng-video': '/templates/previews/senseng-video.jpg',
  'saas-automation': '/templates/previews/saas-automation.jpg',
  'fintech-platform': '/templates/previews/fintech-platform.jpg',
  'digital-marketing': '/templates/previews/digital-marketing.jpg',
  'porto-accounting': '/templates/previews/porto-accounting.jpg',
  'crafto-corporate': '/templates/previews/crafto-corporate.jpg',
  'juno-toys': '/templates/previews/juno-toys.jpg',
  'corpox-ai-agency': '/templates/previews/corpox-ai-agency.jpg',
  'corpox-consulting': '/templates/previews/corpox-consulting.jpg',
  'senseng-candy': '/templates/previews/senseng-candy.jpg',
  'senseng-wonder': '/templates/previews/senseng-wonder.jpg',
  natural: '/templates/previews/senseng-clean.jpg',
  technology: '/templates/previews/saas-automation.jpg',
  explorer: '/templates/previews/crafto-corporate.jpg',
};

export default function App() {
  const [config, setConfig] = useState<Config | null>(null),
    [configError, setConfigError] = useState('');
  const [restoring, setRestoring] = useState(true);
  const [principal, setPrincipal] = useState<Principal | null>(null),
    [selected, setSelected] = useState<string | null>(() => {
      try {
        return new URL(window.location.href).searchParams.get('project');
      } catch {
        return null;
      }
    });
  const [view, setView] = useState<'projects' | 'admin' | 'services'>(() => {
      try {
        const v = new URL(window.location.href).searchParams.get('view');
        if (v === 'admin' || v === 'services') return v;
      } catch {}
      return 'projects';
    }),
    [embedError, setEmbedError] = useState('');
  const [authBusy, setAuthBusy] = useState(false),
    [sessionMessage, setSessionMessage] = useState('');
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selected) {
        url.searchParams.set('project', selected);
      } else {
        url.searchParams.delete('project');
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [selected]);
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (view !== 'projects') {
        url.searchParams.set('view', view);
      } else {
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [view]);
  const exchanging = useRef(new HandoffAttempts());
  const authEpoch = useRef(0);
  const previousActor = useRef<string | null>(null);
  const expire = useCallback(() => {
    authEpoch.current++;
    clearSession();
    try {
      sessionStorage.removeItem('wr_principal');
    } catch {}
    setPrincipal(null);
    setSessionMessage('登录已过期，请重新验证身份。当前页面的编辑内容仍保留。');
    if (embedded && embedOrigin)
      window.parent.postMessage(
        {
          type: 'web-radar:session-expired',
          protocolVersion: 1,
          ...(selectedRef.current ? { projectId: selectedRef.current } : {}),
        },
        embedOrigin,
      );
  }, []);
  const accept = useCallback(
    (result: SessionResult) => {
      const actor = `${result.principal.userId}:${result.principal.workspaceId}`;
      if (previousActor.current && previousActor.current !== actor) {
        setSelected(null);
        setLastPrincipal(null);
      }
      previousActor.current = actor;
      authEpoch.current++;
      setSession(embedded ? result.token : '');
      setPrincipal(result.principal);
      try {
        sessionStorage.setItem('wr_principal', JSON.stringify(result.principal));
      } catch {}
      setSessionMessage('');
      setEmbedError('');
      if (result.projectId) {
        if(result.entry==='prepared-materials'){
          const url=new URL(window.location.href);url.searchParams.set('tab','publish');window.history.replaceState({},'',url.toString());
        }
        setSelected(result.projectId);
      }

    },
    [expire],
  );
  useEffect(() => {
    api<Config>('/api/config')
      .then(setConfig)
      .catch((error) => setConfigError(errorMessage(error)));
  }, []);
  useEffect(() => {
    window.addEventListener('wr:session-expired', expire);
    return () => window.removeEventListener('wr:session-expired', expire);
  }, [expire]);
  useEffect(() => {
    let active = true;
    const epoch = authEpoch.current;
    api<{ principal: Principal }>('/api/auth/me')
      .then(result => {
        if (!active || authEpoch.current !== epoch) return;
        previousActor.current = `${result.principal.userId}:${result.principal.workspaceId}`;
        setPrincipal(result.principal);
        setSessionMessage('');
      })
      .catch(error => {
        if (active) setSessionMessage(error.status === 401 ? '' : errorMessage(error));
      })
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!principal) return;
    let pending = false;
    const refreshSession = async () => {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      const epoch = authEpoch.current;
      try {
        const result = await api<{ principal: Principal }>('/api/auth/me');
        if (authEpoch.current === epoch) setPrincipal(result.principal);
      } catch { /* Only a confirmed session error clears login via the API event. */ }
      finally { pending = false; }
    };
    const timer = setInterval(refreshSession, 5 * 60 * 1000);
    window.addEventListener('focus', refreshSession);
    document.addEventListener('visibilitychange', refreshSession);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refreshSession);
      document.removeEventListener('visibilitychange', refreshSession);
    };
  }, [principal?.userId, principal?.workspaceId]);
  useEffect(() => {
    if (!embedded || !config) return;
    if (!embedOrigin || window.parent === window || !config.parentOrigins?.includes(embedOrigin)) {
      setEmbedError('请从 Product Radar 的建站入口打开此页面。嵌入来源无效或尚未获准。');
      return;
    }
    const receive = async (event: MessageEvent) => {
      if (!validHandoff(event, embedOrigin, window.parent)) return;
      const { code, requestId: grantId } = event.data as { code: string; requestId: string };
      if (!exchanging.current.begin(grantId, code)) return;
      setAuthBusy(true);
      setEmbedError('');
      try {
        const result = await post<SessionResult>('/api/integrations/product-radar/exchange', {
          code,
          requestId: grantId,
          parentOrigin: embedOrigin,
        });
        accept(result);
        window.parent.postMessage(
          {
            type: 'web-radar:authenticated',
            protocolVersion: 1,
            requestId: grantId,
            ...(result.projectId ? { projectId: result.projectId } : {}),
          },
          embedOrigin,
        );
      } catch (error) {
        exchanging.current.failed(grantId, code);
        const message = errorMessage(error);
        setEmbedError(message);
        window.parent.postMessage(
          { type: 'web-radar:error', protocolVersion: 1, message },
          embedOrigin,
        );
      } finally {
        setAuthBusy(false);
      }
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'web-radar:ready', protocolVersion: 1 }, embedOrigin);
    return () => window.removeEventListener('message', receive);
  }, [accept, config]);
  async function signOut() {
    try {
      await post('/api/auth/sign-out');
    } finally {
      clearSession();
      try {
        sessionStorage.removeItem('wr_principal');
      } catch {}
      setPrincipal(null);
      setSelected(null);
      authEpoch.current++;
      previousActor.current = null;
      setLastPrincipal(null);
    }
  }
  const [lastPrincipal, setLastPrincipal] = useState<Principal | null>(null);
  useEffect(() => {
    if (principal) setLastPrincipal(principal);
  }, [principal]);
  const editorPrincipal = principal || lastPrincipal;
  const needsLogin = !principal;
  if (restoring) return <div className="preview-loading"><span className="spinner" />正在恢复登录状态…</div>;
  return (
    <>
      {config?.testMode && (
        <div className="test-banner">
          <span className="test-label">本地测试环境</span>
          生成、邮件与发布使用明确标记的测试适配器；未连接真实服务。
          <span className="test-banner-end">TEST MODE</span>
        </div>
      )}
      {selected && editorPrincipal ? (
        <Editor
          key={`${editorPrincipal.userId}:${editorPrincipal.workspaceId}:${selected}`}
          projectId={selected}
          principal={editorPrincipal}
          services={config?.services || []}
          testMode={!!config?.testMode}
          embedded={embedded}
          onBack={() => setSelected(null)}
        />
      ) : !needsLogin ? (
        <div className={`app-shell ${embedded ? 'is-embedded' : ''}`}>
          <aside className="sidebar">
            <a
              className="brand-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setView('projects');
              }}
            >
              <Brand />
            </a>
            <div className="workspace-label">网站管理</div>
            <nav aria-label="工作台导航">
              <button
                className={view === 'projects' ? 'active' : ''}
                aria-current={view === 'projects' ? 'page' : undefined}
                onClick={() => setView('projects')}
              >
                <Icon name="grid" />
                网站项目
              </button>
              <button
                className={view === 'services' ? 'active' : ''}
                aria-current={view === 'services' ? 'page' : undefined}
                onClick={() => setView('services')}
              >
                <Icon name="globe" />
                服务状态
              </button>
              {principal.systemRole === 'super_admin' && (
                <button
                  className={view === 'admin' ? 'active' : ''}
                  aria-current={view === 'admin' ? 'page' : undefined}
                  onClick={() => setView('admin')}
                >
                  <Icon name="settings" />
                  平台管理
                </button>
              )}
            </nav>
            <div className="sidebar-bottom">
              <span className="muted">Web Radar · 网站管理</span>
            </div>
          </aside>
          <main className="workspace-main">
            <header className="workspace-header">
              <div>
                <span>工作区</span>
                <strong>{principal.workspaceName}</strong>
              </div>
              <div className="workspace-account">
                <span className="avatar">{principal.displayName.slice(0, 1).toUpperCase()}</span>
                <span>{principal.displayName}</span>
                {!embedded && (
                  <Button kind="quiet" onClick={signOut} aria-label="退出登录">
                    <Icon name="logout" size={16} />
                  </Button>
                )}
              </div>
            </header>
            {view === 'projects' ? (
              <Projects onOpen={setSelected} />
            ) : view === 'admin' ? (
              <Admin />
            ) : (
              <>
                <div className="page-heading">
                  <h1>服务状态</h1>
                  <p>接入由平台管理员配置。客户无需填写 AI 密钥。</p>
                </div>
                <div className="panel">
                  <ServiceList services={config?.services || []} />
                </div>
                <Notice>
                  “已配置”表示已提供连接配置；真实模型调用、发信和发布仍以实际任务结果为准。
                </Notice>
              </>
            )}
          </main>
        </div>
      ) : null}
      {needsLogin &&
        (selected && editorPrincipal ? (
          <div className="reauth-overlay">
            <Login
              config={config}
              onAccept={accept}
              embedded={embedded}
              embedError={embedError || sessionMessage}
              busy={authBusy}
              compact
            />
          </div>
        ) : (
          <Login
            config={config}
            onAccept={accept}
            embedded={embedded}
            embedError={embedError || sessionMessage || configError}
            busy={authBusy}
          />
        ))}
    </>
  );
}

function Login({
  config,
  onAccept,
  embedded,
  embedError,
  busy,
  compact = false,
}: {
  config: Config | null;
  onAccept: (result: SessionResult) => void;
  embedded: boolean;
  embedError: string;
  busy: boolean;
  compact?: boolean;
}) {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [loading, setLoading] = useState(false),
    [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      onAccept(await post<SessionResult>('/api/auth/sign-in', { email, password }));
      setPassword('');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  async function test(identity: string) {
    setLoading(true);
    setError('');
    try {
      onAccept(await post<SessionResult>('/api/auth/test-login', { identity }));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={`login-page ${compact ? 'compact' : ''} ${embedded ? 'is-embedded' : ''}`}>
      {!compact && (
        <header className="login-brand">
          <Brand />
          <span>网站管理工作台</span>
        </header>
      )}
      <section className="login-form-area">
        <div className="login-form">
          <h2>{embedded ? '正在连接网站工作区' : '登录 Web Radar'}</h2>
          <p>
            {embedded
              ? '通过 Product Radar 安全验证身份后，继续同一份网站草稿。'
              : '使用现有 Product Radar 账号，进入网站工作室。'}
          </p>
          {(error || embedError) && <Notice tone="error">{error || embedError}</Notice>}
          {embedded ? (
            <div className="embed-wait">
              <Mark />
              <strong>
                {busy
                  ? '正在验证一次性授权…'
                  : embedError
                    ? '连接暂未完成'
                    : '等待 Product Radar 授权…'}
              </strong>
              <p>
                {embedError
                  ? '请使用 Product Radar 页面上的重新连接按钮。'
                  : '无需再次输入账号密码。'}
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <Field label="邮箱">
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </Field>
              <Field label="密码">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入 Product Radar 密码"
                />
              </Field>
              <Button type="submit" kind="primary" busy={loading} className="login-submit">
                登录
                <Icon name="arrow" />
              </Button>
              <div className="login-note">
                <Icon name="lock" size={14} />
                沿用现有账号与工作区权限
              </div>
            </form>
          )}
          {config?.testMode && !embedded && (
            <div className="test-logins">
              <strong>本地验收身份</strong>
              <p>仅测试环境可用，数据与额度均为测试用途。</p>
              <div>
                {[
                  ['owner', '项目创建者'],
                  ['admin', '公司管理员'],
                  ['member', '普通成员'],
                  ['outsider', '其他公司'],
                  ['platform', '平台管理员'],
                ].map(([id, label]) => (
                  <Button key={id} onClick={() => test(id)} busy={loading}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="login-footer">
            测试期向现有 Product Radar 客户开放
            <br />
            没有账号？请联系你的工作区管理员。
          </div>
        </div>
      </section>
    </div>
  );
}

function Projects({ onOpen }: { onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false),
    [createMode, setCreateMode] = useState<'template' | 'clone'>('template'),
    [name, setName] = useState(''),
    [creating, setCreating] = useState(false),
    [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'offline'>(
    'all',
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createUrl,setCreateUrl]=useState('');
  const createRequest = useRef(requestId());
  const [page, setPage] = useState(1), [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({all:0,draft:0,published:0,offline:0});
  const [search, setSearch] = useState('');
  const loadEpoch = useRef(0);
  useEffect(() => { const timer = setTimeout(() => { setPage(1); setSearch(filter.trim()); }, 300); return () => clearTimeout(timer); }, [filter]);
  const load = useCallback(async () => {
    const epoch = ++loadEpoch.current;
    setLoading(true); setError('');
    try {
      const result = await api<ProjectList>(`/api/projects?${new URLSearchParams({page:String(page),pageSize:'20',status:statusFilter,search})}`);
      if (epoch !== loadEpoch.current) return;
      setProjects(result.projects); setTotal(result.total); setCounts(result.counts); setSelectedIds(new Set());
      if (!result.projects.length && page > 1) setPage(page - 1);
    } catch (error) { if (epoch === loadEpoch.current) setError(errorMessage(error)); }
    finally { if (epoch === loadEpoch.current) setLoading(false); }
  }, [page, statusFilter, search]);
  useEffect(() => { void load(); return () => { loadEpoch.current++; }; }, [load]);
  async function create(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const result = await post<{ project: Project }>('/api/projects', {
        name: name.trim() || (createMode==='clone' && createUrl ? new URL(createUrl).hostname : '未命名网站'),
        targetUrl:createMode==='clone'?createUrl.trim():undefined,
        buildBranch: createMode,
        requestId: createRequest.current,
      });
      createRequest.current = requestId();
      onOpen(result.project.id);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const deleteSingle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await api(`/api/projects/${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const deleteBatch = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    setError('');
    try {
      await post('/api/projects/batch-delete', { ids: Array.from(selectedIds) });
      setSelectedIds(new Set());
      setBatchDeleteOpen(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };
  const filtered = projects;
  const statusLabels = {
    all: '全部',
    draft: '草稿',
    published: '已发布',
    offline: '已下线',
  } as const;
  return (
    <>
      <div className="page-heading dashboard-title">
        <div>
          <h1>网站项目</h1>
          <p>准备公司与产品资料，编辑网站内容，预览确认后发布。</p>
        </div>
        <div className="title-actions">
          <Button onClick={load} busy={loading} aria-label="刷新网站列表">
            <Icon name="refresh" />
            刷新
          </Button>
          <Button
            kind="primary"
            onClick={() => {
              setName('');
              setCreateOpen(true);
            }}
          >
            <Icon name="plus" />
            创建网站
          </Button>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="project-list-heading">
        <div className="project-filters" role="group" aria-label="按发布状态筛选">
          {(Object.entries(statusLabels) as [keyof typeof statusLabels, string][]).map(
            ([id, label]) => (
              <button
                key={id}
                aria-pressed={statusFilter === id}
                onClick={() => { setPage(1); setStatusFilter(id); }}
              >
                {label}
                <span>
                  {loading
                    ? '—'
                    : counts[id]}
                </span>
              </button>
            ),
          )}
        </div>
        <input
          type="search"
          aria-label="搜索网站"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索项目或公司名称"
        />
      </div>
      {loading ? (
        <div className="loading-area">
          <span className="spinner" />
          正在读取网站项目…
        </div>
      ) : counts.all === 0 && !search ? (
        <div className="project-empty">
          <Empty
            icon="folder"
            title="还没有网站项目"
            action={
              <Button
                kind="primary"
                onClick={() => {
                  setName('');
                  setCreateOpen(true);
                }}
              >
                <Icon name="plus" />
                创建第一个网站
              </Button>
            }
          >
            创建项目后，填写公司资料并上传产品，也可以导入 Product Radar 产品。
          </Empty>
        </div>
      ) : filtered.length === 0 ? (
        <div className="project-empty">
          <Empty
            title="没有符合条件的网站"
            action={
              <Button
                onClick={() => {
                  setFilter('');
                  setStatusFilter('all');
                }}
              >
                清除筛选
              </Button>
            }
          >
            调整发布状态或搜索名称后重试。
          </Empty>
        </div>
      ) : (
        <>
          {/* Batch Actions Toolbar */}
          <div className="projects-batch-bar">
            <div className="projects-batch-left">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="project-select-checkbox"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                />
                <span>全选当前页 ({filtered.length})</span>
              </label>
              {selectedIds.size > 0 && (
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>
                  已选中 {selectedIds.size} 项
                </span>
              )}
            </div>
            <div className="projects-batch-right">
              {selectedIds.size > 0 && (
                <>
                  <Button kind="quiet" onClick={deselectAll}>
                    取消选择
                  </Button>
                  <Button
                    kind="danger"
                    onClick={() => setBatchDeleteOpen(true)}
                    busy={deleting}
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    🗑️ 批量删除 ({selectedIds.size})
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="project-grid">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => onOpen(project.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(project.id);
                  }
                }}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <div className={`project-cover ${project.template}`}>
                  {/* Selection Checkbox Overlay */}
                  <div
                    className="project-card-select-overlay"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="project-select-checkbox"
                      checked={selectedIds.has(project.id)}
                      onChange={() => toggleSelect(project.id)}
                      aria-label={`选择 ${project.name}`}
                    />
                  </div>

                  {/* Single Delete Button Overlay */}
                  <div
                    className="project-card-delete-overlay"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(project);
                    }}
                  >
                    <button
                      type="button"
                      className="project-card-delete-btn"
                      title={`删除「${project.name}」`}
                      aria-label={`删除「${project.name}」`}
                    >
                      ✕
                    </button>
                  </div>

                  {project.coverAssetId ? (
                    <AssetView projectId={project.id} assetId={project.coverAssetId} alt={project.name} />
                  ) : TEMPLATE_PREVIEWS[project.template] ? (
                    <img
                      src={TEMPLATE_PREVIEWS[project.template]}
                      alt={project.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="project-cover-art">
                      <div className="cover-orbit" />
                      <span>{project.companyName || '尚未添加产品图片'}</span>
                    </div>
                  )}
                  <span
                    className={`pill ${project.publishedReleaseId && !project.offline ? 'green' : 'light'}`}
                  >
                    {statusLabels[projectStatus(project)]}
                  </span>
                  <div className="cover-open">
                    <Icon name="arrow" />
                  </div>
                </div>
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p>{project.companyName || '尚未填写公司名称'}</p>
                  <div>
                    <span>
                      {project.productCount} 个产品 ·{' '}
                      {
                        ({
                          natural: '现代典雅',
                          technology: '先锋科技',
                          explorer: '硬核工业',
                          'senseng-clean': 'Senseng 经典工贸',
                          'senseng-video': 'Senseng 全屏视频',
                          'saas-automation': 'SaaS 智能自动化',
                          'fintech-platform': '金融资产管理平台',
                          'digital-marketing': '数字营销增长机构',
                          'porto-accounting': 'Porto 经典财税会计',
                          'crafto-corporate': 'Crafto 现代企业集团',
                          'juno-toys': 'Juno 儿童童趣玩具',
                          'corpox-ai-agency': 'Corpox AI 智能工坊',
                          'corpox-consulting': 'Corpox 顶级战略咨询',
                          'senseng-candy': 'Senseng 缤纷糖果乐园',
                          'senseng-wonder': 'Senseng 北欧温润工坊',
                        } as Record<TemplateId, string>)[project.template] || '专业模版'
                      }
                    </span>
                    <time dateTime={project.updatedAt}>{dateTime(project.updatedAt)}</time>
                  </div>
                  <div className="project-next">
                    <span>
                      {projectStatus(project) === 'published'
                        ? '编辑网站'
                        : '继续编辑'}
                    </span>
                    <Icon name="arrow" size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {total > 20 && <div className="project-pagination" style={{display:'flex',gap:16,alignItems:'center',justifyContent:'center',margin:'24px 0'}}>
        <Button disabled={loading || page === 1} onClick={() => setPage(page-1)}>上一页</Button>
        <span>第 {page} / {Math.ceil(total/20)} 页 · 共 {total} 个项目</span>
        <Button disabled={loading || page*20 >= total} onClick={() => setPage(page+1)}>下一页</Button>
      </div>}
      {createOpen && (
        <Modal title="创建网站项目" onClose={() => setCreateOpen(false)}>
          <form onSubmit={create}>
            <p className="muted" style={{ marginBottom: '16px' }}>
              选择建站方式，即可开始创建：
            </p>

            <div className="create-mode-options" role="radiogroup" aria-label="建站方式">
              {([['template','模板建站','选择现成风格，填入公司和产品资料。'],['clone','网址 / 设计稿建站','输入网址自动分析重建，或上传设计稿。']] as const).map(([id,title,description])=><label key={id} className={createMode===id?'selected':''}><input type="radio" name="create-mode" checked={createMode===id} onChange={()=>setCreateMode(id)}/><strong>{title}</strong><small>{description}</small></label>)}
            </div>
            {createMode==='clone'&&<Field label="参考网址" hint="输入网址即可开始；有设计图也可以创建后上传。"><input aria-label="参考网址" type="url" value={createUrl} onChange={e=>setCreateUrl(e.target.value)} placeholder="https://example.com" maxLength={2000}/></Field>}
            <Field label="项目名称（选填）" hint="仅用于工作台管理，留空自动命名。">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder={createMode === 'clone' ? '例如：Senseng 像素级克隆官网' : '例如：春季户外系列官网'}
              />
            </Field>
            {error && <Notice tone="error">{error}</Notice>}
            <div className="modal-actions">
              <Button type="button" onClick={() => setCreateOpen(false)}>
                取消
              </Button>
              <Button kind="primary" busy={creating} type="submit">
                创建并开始
                <Icon name="arrow" />
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Single Project Delete Modal */}
      {deleteTarget && (
        <Modal title="确认删除网站项目" onClose={() => setDeleteTarget(null)}>
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#1e293b', margin: 0 }}>
              确定要删除项目 <strong>「{deleteTarget.name}」</strong> 吗？
            </p>
            <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '10px', lineHeight: '1.5' }}>
              ⚠️ 此操作将永久删除该项目及其所有的草稿、关联素材、发布快照与数据库记录，无法恢复。
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
                取消
              </Button>
              <Button
                kind="danger"
                onClick={deleteSingle}
                busy={deleting}
                style={{ background: '#ef4444', color: '#ffffff', fontWeight: 700 }}
              >
                确认删除
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Batch Delete Modal */}
      {batchDeleteOpen && (
        <Modal title="确认批量删除项目" onClose={() => setBatchDeleteOpen(false)}>
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#1e293b', margin: 0 }}>
              确定要批量删除选中的 <strong>{selectedIds.size}</strong> 个网站项目吗？
            </p>
            <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '10px', lineHeight: '1.5' }}>
              ⚠️ 此操作将永久清理这些项目的所有草稿、关联素材与发布快照，无法恢复。
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <Button onClick={() => setBatchDeleteOpen(false)} disabled={deleting}>
                取消
              </Button>
              <Button
                kind="danger"
                onClick={deleteBatch}
                busy={deleting}
                style={{ background: '#ef4444', color: '#ffffff', fontWeight: 700 }}
              >
                确认批量删除 ({selectedIds.size})
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
