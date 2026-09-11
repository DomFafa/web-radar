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
          onBack={() => setSelected(null)}
        />
      ) : !needsLogin ? (
        <div className="app-shell">
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
            <div className="workspace-label">你的工作空间</div>
            <div className="workspace-switch">
              <span>{principal.workspaceName.slice(0, 1) || 'W'}</span>
              <div>
                <strong>{principal.workspaceName}</strong>
                <small>{principal.workspaceRole === 'admin' ? '工作区管理员' : '工作区成员'}</small>
              </div>
            </div>
            <nav aria-label="工作台导航">
              <button
                className={view === 'projects' ? 'active' : ''}
                onClick={() => setView('projects')}
              >
                <Icon name="grid" />
                网站项目<span>01</span>
              </button>
              <button
                className={view === 'services' ? 'active' : ''}
                onClick={() => setView('services')}
              >
                <Icon name="globe" />
                服务状态
                <Icon name="external" size={13} />
              </button>
              {principal.systemRole === 'super_admin' && (
                <button
                  className={view === 'admin' ? 'active' : ''}
                  onClick={() => setView('admin')}
                >
                  <Icon name="settings" />
                  平台管理
                </button>
              )}
            </nav>
            <div className="sidebar-bottom">
              <div className="quiet-card">
                <Icon name="lock" />
                <strong>从草稿，到正式网站</strong>
                <p>
                  内容在你确认发布之后，
                  <br />
                  才会对访客可见。
                </p>
              </div>
              <div className="account">
                <span className="avatar">{principal.displayName.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{principal.displayName}</strong>
                  <small>{principal.email}</small>
                </div>
                {!embedded && (
                  <button onClick={signOut} aria-label="退出登录">
                    <Icon name="logout" size={16} />
                  </button>
                )}
              </div>
            </div>
          </aside>
          <main className="workspace-main">
            {view === 'projects' ? (
              <Projects principal={principal} onOpen={setSelected} />
            ) : view === 'admin' ? (
              <Admin />
            ) : (
              <>
                <div className="page-heading">
                  <span className="eyebrow">CONNECTIONS</span>
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
    <div className={`login-page ${compact ? 'compact' : ''}`}>
      {!compact && (
        <section className="login-story">
          <Brand />
          <div className="login-story-content">
            <span className="eyebrow">FROM PRODUCT TO PRESENCE</span>
            <h1>
              好产品，
              <br />
              值得一个
              <br />
              <em>好网站。</em>
            </h1>
            <p>
              把你的产品与故事，
              <br />
              变成面向世界的品牌网站。
            </p>
            <div className="login-art" aria-hidden="true">
              <div className="art-browser">
                <div className="art-browser-toolbar">
                  <i />
                  <i />
                  <i />
                  <span>YOUR NEXT CHAPTER</span>
                </div>
                <div className="art-hero">
                  <span>
                    Made for
                    <br />
                    <em>what’s next.</em>
                  </span>
                  <div className="art-orbit" />
                  <i className="art-play">▷</i>
                  <small>YOUR BRAND · YOUR STORY</small>
                </div>
                <div className="art-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="art-caption">一份资料 · 三种风格 · 面向世界</div>
            </div>
          </div>
          <footer>
            WEB RADAR <span>A workspace for your next chapter.</span>
          </footer>
        </section>
      )}
      <section className="login-form-area">
        <div className="login-form">
          <span className="eyebrow">YOUR WEBSITE STARTS HERE</span>
          <h2>{embedded ? '正在连接你的工作空间' : '欢迎回来'}</h2>
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
                进入工作室
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

function Projects({ principal, onOpen }: { principal: Principal; onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false),
    [name, setName] = useState(''),
    [creating, setCreating] = useState(false),
    [filter, setFilter] = useState('');
  const createRequest = useRef(requestId());
  useEffect(() => {
    api<{ projects: Project[] }>('/api/projects')
      .then((result) => setProjects(result.projects))
      .catch((error) => setError(errorMessage(error)))
      .finally(() => setLoading(false));
  }, []);
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
  const filtered = projects.filter((p) =>
    `${p.name} ${p.draft.company.name}`.toLowerCase().includes(filter.toLowerCase()),
  );
  const published = projects.filter((p) => p.publishedReleaseId && !p.offline).length;
  return (
    <>
      <header className="dashboard-header">
        <div className="breadcrumb">
          工作台<span>/</span>网站项目
        </div>
        <span className="workspace-status">
          <i />
          你的内容，仅授权成员可见
        </span>
      </header>
      <div className="page-heading dashboard-title">
        <div>
          <span className="eyebrow">YOUR DIGITAL SHOWROOM</span>
          <h1>
            让好产品，<em>被世界看见。</em>
          </h1>
          <p>早上好，{principal.displayName}。从这里继续你的品牌故事。</p>
        </div>
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
      <div className="overview-strip">
        <div>
          <span>全部网站</span>
          <strong>
            {String(projects.length).padStart(2, '0')}
            <small>个项目</small>
          </strong>
        </div>
        <div>
          <span>已发布</span>
          <strong>
            {String(published).padStart(2, '0')}
            <small>向世界开放</small>
          </strong>
        </div>
        <div>
          <span>制作中</span>
          <strong>
            {String(projects.length - published).padStart(2, '0')}
            <small>值得期待</small>
          </strong>
        </div>
        <div className="overview-message">
          <Icon name="globe" size={33} />
          <p>
            英文起步，连接全球。
            <br />
            <span>可再添加一种网站语言。</span>
          </p>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="project-list-heading">
        <h2>
          我的网站 <span>{projects.length}</span>
        </h2>
        <input
          type="search"
          aria-label="搜索网站"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索网站名称…"
        />
      </div>
      {loading ? (
        <div className="loading-area">
          <span className="spinner" />
          正在读取网站项目…
        </div>
      ) : projects.length === 0 ? (
        <div className="first-project">
          <div className="first-project-copy">
            <span className="eyebrow">START SOMETHING GOOD</span>
            <h2>
              下一个好故事，
              <br />
              从你的产品开始。
            </h2>
            <p>
              上传产品、选择风格，做一个有动态视频
              <br />
              封面的外贸公司网站。每一步都能预览、调整。
            </p>
            <Button kind="primary" onClick={() => setCreateOpen(true)}>
              创建第一个网站
              <Icon name="arrow" />
            </Button>
            <small>已有 Product Radar 产品？进入项目后直接导入。</small>
          </div>
          <div className="first-project-art" aria-hidden="true">
            <div className="mini-site natural">
              <span className="mini-nav">
                YOUR BRAND <i>☰</i>
              </span>
              <h3>
                A little closer
                <br />
                to nature.
              </h3>
              <div className="mini-form" />
              <small>Thoughtfully made. Naturally yours.</small>
            </div>
            <div className="floating-note">
              <Icon name="play" />
              动态视频 Hero
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <Empty title="没有找到匹配的网站">试试其他名称。</Empty>
      ) : (
        <div className="project-grid">
          {filtered.map((project) => (
            <button key={project.id} className="project-card" onClick={() => onOpen(project.id)}>
              <div className={`project-cover ${project.draft.template}`}>
                {project.draft.posterAssetId || project.draft.products[0]?.imageAssetId ? (
                  <AssetView
                    projectId={project.id}
                    assetId={project.draft.posterAssetId || project.draft.products[0]?.imageAssetId}
                    alt={project.name}
                  />
                ) : (
                  <div className="project-cover-art">
                    <div className="cover-orbit" />
                    <span>{project.draft.company.name || 'Your next chapter.'}</span>
                  </div>
                )}
                <span
                  className={`pill ${project.publishedReleaseId && !project.offline ? 'green' : 'light'}`}
                >
                  {!project.publishedReleaseId ? '草稿' : project.offline ? '已下线' : '已发布'}
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
                  <time>{dateTime(project.updatedAt)}</time>
                </div>
              </div>
            </button>
          ))}
          <button className="new-project-card" onClick={() => setCreateOpen(true)}>
            <span>
              <Icon name="plus" size={27} />
            </span>
            <strong>创建新网站</strong>
            <small>另一个故事，另一种可能。</small>
          </button>
        </div>
      )}
      <div className="workspace-footer">
        <Brand />
        <span>Built around your products. Made for your business.</span>
      </div>
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
