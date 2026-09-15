import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Principal, Project, ServiceStatus } from '../shared/model';
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

export default function App() {
  const [config, setConfig] = useState<Config | null>(null),
    [configError, setConfigError] = useState('');
  const [principal, setPrincipal] = useState<Principal | null>(null),
    [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'projects' | 'admin' | 'services'>('projects'),
    [embedError, setEmbedError] = useState('');
  const [authBusy, setAuthBusy] = useState(false),
    [sessionMessage, setSessionMessage] = useState('');
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const exchanging = useRef(new HandoffAttempts());
  const expires = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previousActor = useRef<string | null>(null);
  const expire = useCallback(() => {
    clearSession();
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
      setSession(result.token);
      setPrincipal(result.principal);
      setSessionMessage('');
      setEmbedError('');
      if (result.projectId) setSelected(result.projectId);
      if (expires.current) clearTimeout(expires.current);
      const expireAt = new Date(result.expiresAt).getTime();
      if (Number.isFinite(expireAt))
        expires.current = setTimeout(expire, Math.max(0, expireAt - Date.now()));
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
      setPrincipal(null);
      setSelected(null);
      if (expires.current) clearTimeout(expires.current);
    }
  }
  const [lastPrincipal, setLastPrincipal] = useState<Principal | null>(null);
  useEffect(() => {
    if (principal) setLastPrincipal(principal);
  }, [principal]);
  const editorPrincipal = principal || lastPrincipal;
  const needsLogin = !principal;
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
  const [projects, setProjects] = useState<Project[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false),
    [name, setName] = useState(''),
    [creating, setCreating] = useState(false),
    [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'offline'>(
    'all',
  );
  const createRequest = useRef(requestId());
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProjects((await api<{ projects: Project[] }>('/api/projects')).projects);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function create(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const result = await post<{ project: Project }>('/api/projects', {
        name: name.trim(),
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
  const filtered = projects.filter(
    (project) =>
      (statusFilter === 'all' || projectStatus(project) === statusFilter) &&
      `${project.name} ${project.draft.company.name}`
        .toLowerCase()
        .includes(filter.trim().toLowerCase()),
  );
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
                onClick={() => setStatusFilter(id)}
              >
                {label}
                <span>
                  {loading
                    ? '—'
                    : id === 'all'
                      ? projects.length
                      : projects.filter((p) => projectStatus(p) === id).length}
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
      ) : projects.length === 0 ? (
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
        <div className="project-grid">
          {filtered.map((project) => (
            <button key={project.id} className="project-card" onClick={() => onOpen(project.id)}>
              <div className={`project-cover ${project.draft.template}`}>
                {project.draft.siteDesign?.pages.home?.imageAssetId ||
                project.draft.posterAssetId ||
                project.draft.products[0]?.imageAssetId ? (
                  <AssetView
                    projectId={project.id}
                    assetId={
                      project.draft.siteDesign?.pages.home?.imageAssetId ||
                      project.draft.posterAssetId ||
                      project.draft.products[0]?.imageAssetId
                    }
                    alt={project.name}
                  />
                ) : (
                  <div className="project-cover-art">
                    <div className="cover-orbit" />
                    <span>{project.draft.company.name || '尚未添加产品图片'}</span>
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
                <p>{project.draft.company.name || '尚未填写公司名称'}</p>
                <div>
                  <span>
                    {project.draft.products.length} 个产品 ·{' '}
                    {
                      { natural: '温暖自然', technology: '现代科技', explorer: '户外探索' }[
                        project.draft.template
                      ]
                    }
                  </span>
                  <time dateTime={project.updatedAt}>{dateTime(project.updatedAt)}</time>
                </div>
                <div className="project-next">
                  <span>
                    {projectStatus(project) === 'published'
                      ? '编辑网站'
                      : `继续：${workflowSteps.find(([id]) => id === nextDraftStep(project.draft))?.[1]}`}
                  </span>
                  <Icon name="arrow" size={15} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {createOpen && (
        <Modal title="创建网站项目" onClose={() => setCreateOpen(false)}>
          <form onSubmit={create}>
            <p className="muted">给这个项目起一个好辨认的名字。它只在工作台显示，稍后可以修改。</p>
            <Field label="项目名称" required>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
                placeholder="例如：春季户外系列官网"
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
    </>
  );
}
