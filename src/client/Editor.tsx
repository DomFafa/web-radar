import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type {
  Asset,
  Company,
  Draft,
  Inquiry,
  Job,
  Language,
  Principal,
  Product,
  ProductSnapshot,
  Project,
  ProjectDetail,
  ServiceStatus,
  SiteCopy,
  TemplateId,
} from '../shared/model';
import { api, ApiError, errorMessage, post, put, requestId, PendingOperations } from './api';
import {
  AssetView,
  Brand,
  Button,
  Empty,
  Field,
  Icon,
  Modal,
  Notice,
  SectionTitle,
  dateTime,
  statusNames,
} from './components';
import { mergeVersions } from './merge';
import { SitePreview } from './Preview';

const languageNames: Record<Language, string> = {
  en: 'English · 英语',
  de: 'Deutsch · 德语',
  fr: 'Français · 法语',
  es: 'Español · 西班牙语',
  pt: 'Português · 葡萄牙语',
  it: 'Italiano · 意大利语',
};
const tabs = [
  ['basics', '资料与产品', 'folder'],
  ['style', '网站风格', 'grid'],
  ['video', 'Hero 视频', 'play'],
  ['content', '内容编辑', 'edit'],
  ['publish', '预览与发布', 'globe'],
  ['inquiries', '客户询盘', 'mail'],
] as const;
type Tab = (typeof tabs)[number][0];
type SourceChange = { productId: string; before: ProductSnapshot; after: ProductSnapshot };
const jobKinds: Record<string, string> = {
  script: '脚本生成',
  copy: '文案与译文',
  image: '分镜图片',
  video: '完整视频',
  publish: '网站发布',
  email: '询盘邮件',
};

export function Editor({
  projectId,
  principal,
  services,
  testMode,
  onBack,
}: {
  projectId: string;
  principal: Principal;
  services: ServiceStatus[];
  testMode: boolean;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null),
    [project, setProject] = useState<Project | null>(null),
    [tab, setTab] = useState<Tab>('basics');
  const [dirty, setDirty] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState('');
  const [conflict, setConflict] = useState<Project | null>(null),
    [choices, setChoices] = useState<Record<string, 'mine' | 'theirs'>>({}),
    [leaveOpen, setLeaveOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false),
    [sourceProducts, setSourceProducts] = useState<ProductSnapshot[]>([]),
    [sourceIds, setSourceIds] = useState<string[]>([]),
    [sourceTotal, setSourceTotal] = useState(0),
    [sourceOffset, setSourceOffset] = useState(0);
  const [sourceChanges, setSourceChanges] = useState<SourceChange[] | null>(null),
    [applyIds, setApplyIds] = useState<string[]>([]),
    [previewOpen, setPreviewOpen] = useState(false);
  const [videoTab, setVideoTab] = useState<'generate' | 'upload'>('generate');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [releaseAction, setReleaseAction] = useState<'publish' | 'restore' | 'offline' | null>(
    null,
  );
  const projectRef = useRef<Project | null>(null),
    baseRef = useRef<Project | null>(null),
    dirtyRef = useRef(false),
    busyRef = useRef('');
  const actionRequests = useRef(new PendingOperations());
  projectRef.current = project;
  dirtyRef.current = dirty;
  busyRef.current = busy;
  const endpoint = `/api/projects/${encodeURIComponent(projectId)}`;

  const install = useCallback((next: Project) => {
    setProject(next);
    projectRef.current = next;
    baseRef.current = next;
    dirtyRef.current = false;
    setDirty(false);
  }, []);
  const refresh = useCallback(
    async (force = false) => {
      const next = await api<ProjectDetail>(endpoint);
      setDetail(next);
      if (force || !dirtyRef.current) {
        install(next.project);
      }
      return next;
    },
    [endpoint, install],
  );
  useEffect(() => {
    let active = true;
    api<ProjectDetail>(endpoint)
      .then((next) => {
        if (active) {
          setDetail(next);
          install(next.project);
        }
      })
      .catch((error) => {
        if (active) setError(errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [endpoint, install]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!busyRef.current)
        void refresh().catch((error) => {
          if (error instanceof ApiError && error.status !== 401) setError(errorMessage(error));
        });
    }, 5000);
    return () => clearInterval(timer);
  }, [refresh]);
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, []);
  function update(updater: (draft: Draft) => Draft) {
    setProject((current) => {
      if (!current) return current;
      const next = { ...current, draft: updater(current.draft) };
      projectRef.current = next;
      const changed =
        JSON.stringify({ name: next.name, draft: next.draft }) !==
        JSON.stringify({ name: baseRef.current?.name, draft: baseRef.current?.draft });
      setDirty(changed);
      dirtyRef.current = changed;
      return next;
    });
  }
  function patch(fields: Partial<Draft>) {
    update((draft) => ({ ...draft, ...fields }));
  }
  function company(fields: Partial<Company>) {
    update((draft) => ({ ...draft, company: { ...draft.company, ...fields } }));
  }
  function productChange(id: string, fields: Partial<Product>) {
    update((draft) => ({
      ...draft,
      products: draft.products.map((product) =>
        product.id === id ? { ...product, ...fields } : product,
      ),
    }));
  }
  async function save(): Promise<Project> {
    const snapshot = projectRef.current;
    if (!snapshot) throw new Error('项目尚未载入。');
    if (!dirtyRef.current) return snapshot;
    try {
      const result = await put<{ project: Project }>(endpoint, {
        expectedVersion: snapshot.version,
        name: snapshot.name,
        draft: snapshot.draft,
      });
      if (projectRef.current === snapshot) install(result.project);
      else {
        baseRef.current = result.project;
        setProject((current) =>
          current ? { ...current, version: result.project.version } : result.project,
        );
      }
      return result.project;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const next = await api<ProjectDetail>(endpoint);
        setConflict(next.project);
        setChoices({});
      }
      throw error;
    }
  }
  async function action(key: string, fn: () => Promise<unknown>, success?: string) {
    if (busyRef.current) return;
    setBusy(key);
    busyRef.current = key;
    setError('');
    setNotice('');
    try {
      await fn();
      if (success) setNotice(success);
    } catch (error) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500)
        actionRequests.current.complete(key);
      setError(errorMessage(error));
    } finally {
      setBusy('');
      busyRef.current = '';
    }
  }
  async function saveClick() {
    await action('save', save, '草稿已保存。线上网站保持当前发布版本。');
  }
  async function command(path: string, body: Record<string, unknown> = {}) {
    const saved = await save();
    if (dirtyRef.current) throw new Error('保存期间又有新的修改，请先保存当前内容再继续。');
    const sent = projectRef.current!;
    const result = await post<{ project: Project }>(`${endpoint}/${path}`, {
      expectedVersion: saved.version,
      ...body,
    });
    const local = projectRef.current!;
    if (local === sent) install(result.project);
    else {
      const merged = mergeVersions(sent, local, result.project);
      if (merged.conflicts.length) {
        setConflict(result.project);
        setChoices({});
      } else {
        baseRef.current = result.project;
        projectRef.current = merged.value;
        setProject(merged.value);
      }
      // Input typed while the request was in flight remains an explicit unsaved edit.
      dirtyRef.current = true;
      setDirty(true);
    }
    await refresh();
  }
  async function generate(
    kind: 'script' | 'copy' | 'image' | 'video',
    sceneId?: string,
    instructions?: string,
  ) {
    const key = `job:${kind}:${sceneId || 'all'}`;
    await action(
      key,
      async () => {
        const saved = await save();
        if (dirtyRef.current) throw new Error('请保存最新修改后再次开始。');
        await post(
          `${endpoint}/jobs`,
          actionRequests.current.body(key, {
            expectedVersion: saved.version,
            kind,
            ...(sceneId ? { sceneId } : {}),
            ...(instructions ? { instructions } : {}),
          }),
        );
        actionRequests.current.complete(key);
        await refresh();
      },
      '任务已提交。你可以离开页面，稍后回来查看进度。',
    );
  }
  async function upload(file: File, apply: (asset: Asset) => void) {
    await action(
      'upload',
      async () => {
        const form = new FormData();
        form.append('file', file);
        const result = await api<{ asset: Asset }>(`${endpoint}/uploads`, {
          method: 'POST',
          body: form,
        });
        setDetail((current) =>
          current ? { ...current, assets: [...current.assets, result.asset] } : current,
        );
        apply(result.asset);
      },
      '素材已上传，请保存草稿或确认选用。',
    );
  }
  async function getSources(offset = 0) {
    await action('sources', async () => {
      const result = await api<{ products: ProductSnapshot[]; total: number }>(
        `/api/source-products?offset=${offset}&limit=20`,
      );
      setSourceProducts(result.products);
      setSourceTotal(result.total);
      setSourceOffset(offset);
      setSourceOpen(true);
    });
  }
  async function importSources() {
    await action(
      'import',
      async () => {
        await command('import', { productIds: sourceIds });
        setSourceOpen(false);
        setSourceIds([]);
      },
      '所选产品和图片已复制为网站独立快照。',
    );
  }
  async function checkSources() {
    await action('source-check', async () => {
      await save();
      const result = await post<{ changes: SourceChange[] }>(`${endpoint}/source-check`);
      setSourceChanges(result.changes);
      setApplyIds([]);
    });
  }
  async function loadInquiries() {
    try {
      const result = await api<{ inquiries: Inquiry[] }>(`${endpoint}/inquiries`);
      setInquiries(result.inquiries);
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  useEffect(() => {
    if (tab === 'inquiries') {
      void loadInquiries();
      const timer = setInterval(() => void loadInquiries(), 10000);
      return () => clearInterval(timer);
    }
  }, [tab, endpoint]);
  async function openPreview() {
    await action('preview', async () => {
      await save();
      setPreviewOpen(true);
    });
  }
  async function publishAction() {
    if (!releaseAction) return;
    const name = releaseAction;
    await action(
      name,
      async () => {
        if (name === 'offline') {
          await command('offline');
        } else if (name === 'publish') {
          const saved = await save();
          if (dirtyRef.current) throw new Error('请先保存当前修改，再发布。');
          await post(
            `${endpoint}/publish`,
            actionRequests.current.body('publish', { expectedVersion: saved.version }),
          );
          actionRequests.current.complete('publish');
          await refresh();
        } else {
          await post(`${endpoint}/restore`, actionRequests.current.body('restore', {}));
          actionRequests.current.complete('restore');
          await refresh();
        }
        setReleaseAction(null);
      },
      name === 'offline'
        ? '网站已下线。项目和询盘记录已保留。'
        : '发布任务已提交，请等待发布记录确认结果。',
    );
  }
  function downloadLocal() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(projectRef.current, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-radar-unsaved-${projectId}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const merger =
    conflict && project && baseRef.current
      ? mergeVersions(
          { name: baseRef.current.name, draft: baseRef.current.draft },
          { name: project.name, draft: project.draft },
          { name: conflict.name, draft: conflict.draft },
          choices,
        )
      : null;
  async function saveMerge() {
    if (!conflict || !merger || merger.conflicts.length) return;
    await action(
      'merge',
      async () => {
        const result = await put<{ project: Project }>(endpoint, {
          expectedVersion: conflict.version,
          ...merger.value,
        });
        install(result.project);
        setConflict(null);
        await refresh();
      },
      '合并后的草稿已保存。',
    );
  }

  if (!project || !detail)
    return (
      <div className="editor-loading">
        <Brand />
        {error ? (
          <Notice tone="error">{error}</Notice>
        ) : (
          <p>
            <span className="spinner" />
            正在打开网站工作室…
          </p>
        )}
        <Button onClick={onBack}>
          <Icon name="back" />
          返回网站列表
        </Button>
      </div>
    );
  const draft = project.draft;
  const base = baseRef.current?.draft;
  const unchangedScriptInputs =
    !!base &&
    draft.script === base.script &&
    draft.direction === base.direction &&
    draft.duration === base.duration &&
    draft.template === base.template &&
    draft.primaryProductId === base.primaryProductId &&
    JSON.stringify(draft.products) === JSON.stringify(base.products);
  const scriptConfirmed =
    !!draft.script.trim() &&
    draft.scriptConfirmedRevision === draft.scriptRevision &&
    unchangedScriptInputs;
  const storyboardConfirmed =
    draft.scenes.length >= (draft.duration === 8 ? 3 : 4) &&
    draft.scenes.every((scene) => scene.imageAssetId) &&
    draft.storyboardConfirmedRevision === draft.storyboardRevision &&
    scriptConfirmed &&
    JSON.stringify(draft.scenes) === JSON.stringify(base?.scenes);
  const activeJobs = detail.jobs.filter((job) =>
    ['queued', 'running', 'unknown'].includes(job.status),
  );
  const availableImages = Math.max(
      0,
      detail.quota.imageLimit - detail.quota.imageUsed - detail.quota.imageReserved,
    ),
    availableVideos = Math.max(
      0,
      detail.quota.videoLimit - detail.quota.videoUsed - detail.quota.videoReserved,
    );
  const publicationMissing = [
    !draft.company.name.trim() && '公司名称',
    !draft.company.email.trim() && '联系邮箱',
    !draft.company.contactName.trim() && '联系人英文名',
    !draft.country.trim() && '销售国家 / 市场',
    !draft.products.length && '至少一个产品',
    draft.products.some((product) => !product.name.trim() || !product.imageAssetId) &&
      '所有产品的名称与图片',
    !draft.primaryProductId && '主产品',
    !draft.heroAssetId && 'Hero 视频',
    !draft.heroAccepted && '视频选用确认',
    ...draft.languages
      .filter(
        (lang) =>
          !draft.copy[lang]?.headline?.trim() ||
          !draft.copy[lang]?.subtitle?.trim() ||
          !draft.copy[lang]?.cta?.trim() ||
          !draft.copy[lang]?.about?.trim(),
      )
      .map((lang) => `${languageNames[lang]}网站文案`),
  ].filter(Boolean) as string[];
  const stepDone: Record<Tab, boolean> = {
    basics:
      !!draft.company.name &&
      !!draft.company.email &&
      !!draft.company.contactName &&
      draft.products.length > 0,
    style: !!draft.template,
    video: !!draft.heroAccepted,
    content: !!draft.copy.en?.headline,
    publish: !!project.publishedReleaseId && !project.offline,
    inquiries: false,
  };
  return (
    <div className="editor-shell">
      <header className="editor-topbar">
        <div className="editor-brand">
          <Button
            kind="quiet"
            onClick={() => (dirty ? setLeaveOpen(true) : onBack())}
            aria-label="返回网站列表"
          >
            <Icon name="back" />
          </Button>
          <Brand />
          <span className="editor-slash">/</span>
          <div className="editor-project-name">
            <strong>{project.name}</strong>
            <span className="pill muted">
              {!project.publishedReleaseId
                ? '未发布草稿'
                : project.offline
                  ? '已下线'
                  : '已发布 · 编辑草稿'}
            </span>
          </div>
        </div>
        <div className="editor-top-actions">
          <span className={`save-state ${dirty ? 'unsaved' : ''}`}>
            <i />
            {dirty ? '有未保存修改' : `已保存 · V${project.version}`}
          </span>
          <Button onClick={saveClick} busy={busy === 'save'} disabled={!dirty || !!busy}>
            保存草稿
          </Button>
          <Button kind="primary" onClick={openPreview} busy={busy === 'preview'} disabled={!!busy}>
            <Icon name="eye" />
            整站预览
          </Button>
        </div>
      </header>
      <div className="editor-body">
        <aside className="editor-sidebar">
          <div className="editor-sidebar-caption">
            WEBSITE WORKSPACE<span>搭建你的网站</span>
          </div>
          <nav aria-label="网站编辑步骤">
            {tabs.map(([id, label, icon], index) => (
              <button
                key={id}
                className={tab === id ? 'active' : ''}
                onClick={() => {
                  setTab(id);
                  setError('');
                  setNotice('');
                }}
              >
                <span className="step-number">
                  {stepDone[id] ? (
                    <Icon name="check" size={14} />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <span>{label}</span>
                <Icon name={icon} size={16} />
              </button>
            ))}
          </nav>
          <div className="editor-sidebar-bottom">
            <div className="quota-card">
              <div>
                <Icon name="spark" />
                <strong>你的可用额度</strong>
              </div>
              <dl>
                <dt>分镜图片</dt>
                <dd>
                  {availableImages}
                  <span>张</span>
                </dd>
                <dt>完整视频</dt>
                <dd>
                  {availableVideos}
                  <span>条</span>
                </dd>
              </dl>
              <p>
                生成按发起账号计数
                <br />
                技术失败自动退回
              </p>
              {(detail.quota.imageReserved > 0 || detail.quota.videoReserved > 0) && (
                <small>
                  处理中预留：图片 {detail.quota.imageReserved} · 视频 {detail.quota.videoReserved}
                </small>
              )}
            </div>
            <div className="editor-owner">
              <span className="avatar">{principal.displayName.slice(0, 1)}</span>
              <div>
                <strong>{principal.displayName}</strong>
                <small>{principal.workspaceName}</small>
              </div>
            </div>
          </div>
        </aside>
        <main className="editor-main">
          <div className="editor-breadcrumb">
            {project.name}
            <span>/</span>
            {tabs.find((t) => t[0] === tab)?.[1]}
            <span className="private-tag">
              <Icon name="lock" size={12} />
              私有草稿
            </span>
          </div>
          {services.some((service) => service.mode === 'unconfigured') && (
            <details className="editor-services">
              <summary>部分服务尚未接通 · 点击查看</summary>
              {services
                .filter((service) => service.mode === 'unconfigured')
                .map((service) => (
                  <p key={service.name}>
                    <strong>{service.name}</strong> {service.detail}
                  </p>
                ))}
            </details>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          {notice && <Notice tone="success">{notice}</Notice>}
          {detail.project.version !== project.version && dirty && (
            <Notice tone="warning">
              服务器上已有更新。你的本地修改已保留，保存时会显示版本差异。
            </Notice>
          )}
          {tab === 'basics' && (
            <>
              <SectionTitle
                eyebrow="01 / FOUNDATION"
                title="先把好产品，介绍清楚。"
                description="真实资料是好网站的起点。先填基础信息，随时保存，稍后继续。"
              />
              <section className="panel">
                <div className="panel-title">
                  <span className="section-index">A</span>
                  <h3>公司资料</h3>
                  <span>用于网站介绍与客户联系</span>
                </div>
                <div className="form-grid">
                  <Field label="公司英文名称" required>
                    <input
                      value={draft.company.name}
                      onChange={(e) => company({ name: e.target.value })}
                      placeholder="例如：Evergreen Trading Co., Ltd."
                      maxLength={160}
                    />
                  </Field>
                  <Field label="联系邮箱" required hint="询盘通知会发送到此邮箱">
                    <input
                      type="email"
                      value={draft.company.email}
                      onChange={(e) => company({ email: e.target.value })}
                      placeholder="sales@yourcompany.com"
                      maxLength={254}
                    />
                  </Field>
                  <Field label="联系人英文名" required>
                    <input
                      value={draft.company.contactName}
                      onChange={(e) => company({ contactName: e.target.value })}
                      placeholder="例如：Alex Chen"
                      maxLength={100}
                    />
                  </Field>
                  <Field label="公司方向">
                    <div className="segmented">
                      <button
                        className={draft.company.type === 'trader' ? 'selected' : ''}
                        onClick={() => company({ type: 'trader' })}
                      >
                        贸易商 / Trading
                      </button>
                      <button
                        className={draft.company.type === 'factory' ? 'selected' : ''}
                        onClick={() => company({ type: 'factory' })}
                      >
                        工厂 / Manufacturing
                      </button>
                    </div>
                  </Field>
                  <Field
                    className="full-width"
                    label="公司简介与已知事实"
                    hint="提供你确认过的信息。没有提供的认证、产能、客户等事实不会凭空补写。"
                  >
                    <textarea
                      rows={3}
                      value={draft.company.description}
                      onChange={(e) => company({ description: e.target.value })}
                      placeholder="介绍你们做什么、服务哪些客户，以及可以公开展示的优势。"
                    />
                  </Field>
                </div>
                <div className="logo-upload-row">
                  <AssetView
                    projectId={project.id}
                    assetId={draft.company.logoAssetId}
                    alt="公司 Logo"
                  />
                  <div>
                    <strong>
                      公司 Logo <span className="optional">选填</span>
                    </strong>
                    <p>没有 Logo 时，网站会使用公司名称。</p>
                    <UploadButton
                      label="上传 Logo"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={!!busy}
                      onFile={(file) => upload(file, (asset) => company({ logoAssetId: asset.id }))}
                    />
                    {draft.company.logoAssetId && (
                      <Button kind="quiet" onClick={() => company({ logoAssetId: undefined })}>
                        移除
                      </Button>
                    )}
                  </div>
                </div>
              </section>
              <section className="panel">
                <div className="panel-title">
                  <span className="section-index">B</span>
                  <h3>产品与主角</h3>
                  <span>{draft.products.length} / 20 个产品</span>
                  <div className="panel-title-actions">
                    {draft.products.some((p) => p.source) && (
                      <Button
                        kind="quiet"
                        onClick={checkSources}
                        busy={busy === 'source-check'}
                        disabled={!!busy}
                      >
                        <Icon name="refresh" />
                        检查来源更新
                      </Button>
                    )}
                    <Button
                      onClick={() => getSources()}
                      busy={busy === 'sources'}
                      disabled={!!busy || draft.products.length >= 20}
                    >
                      从 Product Radar 导入
                      <Icon name="arrow" size={15} />
                    </Button>
                  </div>
                </div>
                {draft.products.length === 0 ? (
                  <Empty
                    icon="image"
                    title="添加产品，选出你的主角"
                    action={
                      <Button onClick={() => addProduct()}>
                        <Icon name="plus" />
                        手动添加产品
                      </Button>
                    }
                  >
                    上传产品照片，或导入 Product Radar 中有权限的产品。每站最多 20 个。
                  </Empty>
                ) : (
                  <div className="product-edit-list">
                    {draft.products.map((product, index) => (
                      <article className="product-edit-card" key={product.id}>
                        <div className="product-image-column">
                          <AssetView
                            projectId={project.id}
                            assetId={product.imageAssetId}
                            alt={product.name}
                          />
                          <UploadButton
                            label="更换图片"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={!!busy}
                            onFile={(file) =>
                              upload(file, (asset) =>
                                productChange(product.id, { imageAssetId: asset.id }),
                              )
                            }
                          />
                        </div>
                        <div className="product-edit-fields">
                          <div className="product-row-top">
                            <span className="product-index">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <button
                              className={`primary-product ${draft.primaryProductId === product.id ? 'selected' : ''}`}
                              onClick={() => patch({ primaryProductId: product.id })}
                            >
                              <span />
                              {draft.primaryProductId === product.id
                                ? '主产品 · 视频主角'
                                : '设为主产品'}
                            </button>
                            {product.source && (
                              <span className="source-tag">Product Radar 快照</span>
                            )}
                            <div className="product-tools">
                              <Button
                                kind="quiet"
                                aria-label={`上移产品 ${index + 1}`}
                                disabled={index === 0}
                                onClick={() => moveProduct(index, -1)}
                              >
                                <Icon name="up" size={14} />
                              </Button>
                              <Button
                                kind="quiet"
                                aria-label={`下移产品 ${index + 1}`}
                                disabled={index === draft.products.length - 1}
                                onClick={() => moveProduct(index, 1)}
                              >
                                <Icon name="down" size={14} />
                              </Button>
                              <Button
                                kind="quiet"
                                aria-label={`移除产品 ${index + 1}`}
                                onClick={() => removeProduct(product.id)}
                              >
                                <Icon name="close" size={15} />
                              </Button>
                            </div>
                          </div>
                          <Field label="产品英文名称">
                            <input
                              value={product.name}
                              onChange={(e) => productChange(product.id, { name: e.target.value })}
                              placeholder="Product name"
                              maxLength={160}
                            />
                          </Field>
                          <Field label="产品介绍">
                            <textarea
                              rows={2}
                              value={product.description}
                              onChange={(e) =>
                                productChange(product.id, { description: e.target.value })
                              }
                              placeholder="描述产品用途、外观和经过确认的特点"
                            />
                          </Field>
                          <div className="form-grid">
                            <Field label="材质">
                              <input
                                value={product.material}
                                onChange={(e) =>
                                  productChange(product.id, { material: e.target.value })
                                }
                                placeholder="Known material"
                              />
                            </Field>
                            <Field label="尺寸">
                              <input
                                value={product.dimensions}
                                onChange={(e) =>
                                  productChange(product.id, { dimensions: e.target.value })
                                }
                                placeholder="Known dimensions"
                              />
                            </Field>
                          </div>
                          {product.source && (
                            <details className="source-details">
                              <summary>查看来源与设计条件</summary>
                              <p>
                                来源版本：{product.source.version.slice(0, 16)} ·
                                生成概念，需自行核实规格
                              </p>
                              <p>{product.source.designDirection}</p>
                              <pre>{JSON.stringify(product.source.conditions, null, 2)}</pre>
                            </details>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {draft.products.length > 0 && (
                  <Button
                    className="add-product"
                    onClick={addProduct}
                    disabled={draft.products.length >= 20}
                  >
                    <Icon name="plus" />
                    手动添加产品
                  </Button>
                )}
              </section>
              <section className="panel">
                <div className="panel-title">
                  <span className="section-index">C</span>
                  <h3>市场与网站语言</h3>
                  <span>英文为基础，可添加一种第二语言</span>
                </div>
                <div className="form-grid three">
                  <Field label="产品类目">
                    <select
                      value={draft.category}
                      onChange={(e) => patch({ category: e.target.value })}
                    >
                      {[
                        ['toys', '玩具'],
                        ['electronics', '电子产品'],
                        ['outdoor', '户外用品'],
                        ['kitchen', '厨房用品'],
                        ['general', '通用 / 其他'],
                      ].map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="销售国家 / 市场">
                    <input
                      value={draft.country}
                      onChange={(e) => patch({ country: e.target.value })}
                      placeholder="例如：United States, Germany"
                    />
                  </Field>
                  <Field label="第二语言">
                    <select
                      value={draft.languages.find((l) => l !== 'en') || ''}
                      onChange={(e) =>
                        patch({
                          languages: e.target.value ? ['en', e.target.value as Language] : ['en'],
                        })
                      }
                    >
                      <option value="">仅英语</option>
                      {Object.entries(languageNames)
                        .filter(([id]) => id !== 'en')
                        .map(([id, label]) => (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
              </section>
              <StepFooter
                hint="资料可以稍后完善，先找一个适合你的风格。"
                next="选择网站风格"
                onNext={() => setTab('style')}
              />
            </>
          )}
          {tab === 'style' && (
            <>
              <SectionTitle
                eyebrow="02 / VISUAL DIRECTION"
                title="给品牌，一个鲜明的样子。"
                description="三套原创模板，保留成熟布局。风格不限制产品类目。"
              />
              <div className="template-grid">
                {(
                  [
                    {
                      id: 'natural',
                      name: '温暖自然',
                      en: 'WARM & NATURAL',
                      title: 'Naturally,\nbetter together.',
                      description: '温暖留白、柔和大地色与细腻衬线字，讲述产品背后的用心。',
                      tags: '家居 · 玩具 · 生活方式',
                    },
                    {
                      id: 'technology',
                      name: '现代科技',
                      en: 'MODERN & PRECISE',
                      title: 'Designed for\nwhat comes next.',
                      description: '利落网格、克制暗色与清晰信息层级，呈现产品的精密与效率。',
                      tags: '电子 · 工具 · 创新产品',
                    },
                    {
                      id: 'explorer',
                      name: '户外探索',
                      en: 'BOLD & EXPLORING',
                      title: 'Ready for\nthe outside.',
                      description: '开阔构图、鲜明对比与大幅画面，让产品走向更宽广的场景。',
                      tags: '户外 · 运动 · 探索装备',
                    },
                  ] as const
                ).map((template) => (
                  <button
                    key={template.id}
                    className={`template-card ${draft.template === template.id ? 'selected' : ''}`}
                    onClick={() => patch({ template: template.id as TemplateId })}
                  >
                    <div className={`template-preview ${template.id}`}>
                      <span className="template-nav">
                        YOUR BRAND <i>ABOUT &nbsp; PRODUCTS &nbsp; CONTACT</i>
                      </span>
                      <div className="template-hero-visual">
                        <span>
                          {template.title.split('\n').map((line, index) => (
                            <span key={index}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </span>
                        <div className="template-sculpture" />
                        <span className="template-play">
                          <Icon name="play" size={22} />
                        </span>
                      </div>
                      <div className="template-bottom">
                        <strong>{template.en}</strong>
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                    <div className="template-description">
                      <div>
                        <span className="eyebrow">{template.en}</span>
                        <h3>{template.name}</h3>
                      </div>
                      <span className="template-choice">
                        {draft.template === template.id ? <Icon name="check" size={15} /> : null}
                      </span>
                      <p>{template.description}</p>
                      <small>风格参考：{template.tags}</small>
                    </div>
                  </button>
                ))}
              </div>
              <Notice>
                所有模板都包含动态视频首页、产品目录、产品详情、公司介绍与联系询盘。你可以修改内容和品牌色，模板布局保持一致。
              </Notice>
              <StepFooter
                hint="风格会影响视频脚本与网站氛围，建议先选定再生成。"
                next="准备 Hero 视频"
                onNext={() => setTab('video')}
              />
            </>
          )}
          {tab === 'video' && (
            <>
              <SectionTitle
                eyebrow="03 / MOTION & STORY"
                title="用一段好画面，让产品开场。"
                description="从已确认的脚本到整组分镜，最后生成一条完整视频。也可以直接上传已有视频。"
              />
              <div className="video-methods">
                <button
                  className={videoTab === 'generate' ? 'active' : ''}
                  onClick={() => setVideoTab('generate')}
                >
                  <Icon name="spark" />
                  <div>
                    <strong>用 AI 制作视频</strong>
                    <span>方向 → 脚本 → 分镜 → 视频</span>
                  </div>
                  {videoTab === 'generate' && <Icon name="check" />}
                </button>
                <button
                  className={videoTab === 'upload' ? 'active' : ''}
                  onClick={() => setVideoTab('upload')}
                >
                  <Icon name="upload" />
                  <div>
                    <strong>上传已有视频</strong>
                    <span>跳过 AI，直接预览与选用</span>
                  </div>
                  {videoTab === 'upload' && <Icon name="check" />}
                </button>
              </div>
              {videoTab === 'generate' ? (
                <>
                  <section className="panel">
                    <div className="panel-title">
                      <span className="section-index">01</span>
                      <h3>主产品与创作方向</h3>
                    </div>
                    <div className="form-grid">
                      <Field label="视频主产品">
                        <select
                          value={draft.primaryProductId}
                          onChange={(e) => patch({ primaryProductId: e.target.value })}
                        >
                          <option value="">请选择主产品</option>
                          {draft.products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name || '未命名产品'}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="完整视频时长">
                        <div className="segmented">
                          <button
                            className={draft.duration === 8 ? 'selected' : ''}
                            onClick={() => patch({ duration: 8 })}
                          >
                            8 秒 · 至少 3 张分镜
                          </button>
                          <button
                            className={draft.duration === 12 ? 'selected' : ''}
                            onClick={() => patch({ duration: 12 })}
                          >
                            12 秒 · 4 张分镜
                          </button>
                        </div>
                      </Field>
                      <Field
                        className="full-width"
                        label="创作方向"
                        hint="描述使用场景、镜头变化、想保留的产品特征与不希望出现的内容。"
                      >
                        <textarea
                          rows={3}
                          value={draft.direction}
                          onChange={(e) => patch({ direction: e.target.value })}
                          placeholder="例如：自然光下的桌面场景，从产品细节平滑过渡到使用画面；保持产品配色和结构，适合首页静音循环。"
                        />
                      </Field>
                    </div>
                    <div className="section-action">
                      <small>
                        模板：
                        {
                          { natural: '温暖自然', technology: '现代科技', explorer: '户外探索' }[
                            draft.template
                          ]
                        }
                      </small>
                      <Button
                        kind="primary"
                        onClick={() => generate('script')}
                        disabled={
                          !!busy ||
                          !draft.primaryProductId ||
                          activeJobs.some((j) => j.kind === 'script')
                        }
                        busy={busy === 'job:script:all'}
                      >
                        <Icon name="spark" />
                        {draft.script ? '重新生成脚本' : '生成视频脚本'}
                      </Button>
                    </div>
                  </section>
                  <section className="panel">
                    <div className="panel-title">
                      <span className="section-index">02</span>
                      <h3>脚本确认</h3>
                      <span className={`pill ${scriptConfirmed ? 'green' : 'muted'}`}>
                        {scriptConfirmed ? '当前脚本已确认' : '等待确认'}
                      </span>
                    </div>
                    <Field
                      label="可编辑的视频脚本"
                      hint="确认前可自由修改；改变脚本或视频输入后，需要重新确认。"
                    >
                      <textarea
                        className="script-editor"
                        rows={7}
                        value={draft.script}
                        onChange={(e) => patch({ script: e.target.value })}
                        placeholder="生成的脚本会显示在这里。你可以修改文字，并检查下方的分镜描述后确认。"
                      />
                    </Field>
                    <div className="section-action">
                      <p>分镜跟随脚本节奏，不固定每张图的出现秒数。</p>
                      <Button
                        onClick={() =>
                          action(
                            'confirm-script',
                            () => command('confirm-script'),
                            '当前脚本已确认，可以生成分镜。',
                          )
                        }
                        disabled={!!busy || !draft.script.trim()}
                        busy={busy === 'confirm-script'}
                      >
                        <Icon name="check" />
                        保存并确认脚本
                      </Button>
                    </div>
                  </section>
                  <section className="panel">
                    <div className="panel-title">
                      <span className="section-index">03</span>
                      <h3>整组分镜</h3>
                      <span>
                        {draft.scenes.filter((s) => s.imageAssetId).length} /{' '}
                        {draft.scenes.length || (draft.duration === 8 ? 3 : 4)} 张已就绪
                      </span>
                      <div className="panel-title-actions">
                        <Button
                          onClick={() => generate('image')}
                          disabled={
                            !!busy || !scriptConfirmed || activeJobs.some((j) => j.kind === 'image')
                          }
                          busy={busy === 'job:image:all'}
                        >
                          <Icon name="spark" />
                          生成缺少的分镜
                        </Button>
                      </div>
                    </div>
                    {!draft.scenes.length ? (
                      <Empty icon="image" title="确认脚本后，开始分镜制作">
                        8 秒至少 3 张，12 秒 4 张。每张生成图片计 1 次额度。
                      </Empty>
                    ) : (
                      <div className="scene-grid">
                        {draft.scenes.map((scene, index) => (
                          <SceneCard
                            key={scene.id}
                            projectId={project.id}
                            scene={scene}
                            index={index}
                            disabled={
                              !!busy ||
                              activeJobs.some(
                                (j) => j.kind === 'image' && j.input.sceneId === scene.id,
                              )
                            }
                            onDescription={(description) =>
                              update((d) => ({
                                ...d,
                                scenes: d.scenes.map((s) =>
                                  s.id === scene.id ? { ...s, description } : s,
                                ),
                              }))
                            }
                            onRegenerate={(instructions) =>
                              generate('image', scene.id, instructions)
                            }
                          />
                        ))}
                      </div>
                    )}
                    <div className="section-action">
                      <p>
                        {storyboardConfirmed
                          ? '当前整组分镜已确认。'
                          : '检查产品一致性、画面顺序和整体节奏。重做任意一张后需要再次确认整组。'}
                      </p>
                      <Button
                        onClick={() =>
                          action(
                            'confirm-storyboard',
                            () => command('confirm-storyboard'),
                            '当前整组分镜已确认，可以生成完整视频。',
                          )
                        }
                        disabled={
                          !!busy ||
                          !scriptConfirmed ||
                          !draft.scenes.length ||
                          draft.scenes.some((s) => !s.imageAssetId)
                        }
                        busy={busy === 'confirm-storyboard'}
                      >
                        <Icon name="check" />
                        确认当前整组分镜
                      </Button>
                    </div>
                  </section>
                  <section className="panel video-generate-panel">
                    <div>
                      <span className="eyebrow">ONE COMPLETE FILM</span>
                      <h3>让整组分镜，成为一条完整视频。</h3>
                      <p>Agnes 一次提交全部已确认分镜。全平台同时生成一条，其余自动排队。</p>
                      <small>关闭页面不影响任务；状态不确定时先核对，不重复提交。</small>
                    </div>
                    <Button
                      kind="primary"
                      onClick={() => generate('video')}
                      disabled={
                        !!busy ||
                        !storyboardConfirmed ||
                        !scriptConfirmed ||
                        activeJobs.some((j) => j.kind === 'video') ||
                        availableVideos < 1
                      }
                      busy={busy === 'job:video:all'}
                    >
                      <Icon name="play" />
                      生成 {draft.duration} 秒视频 · 1 次
                    </Button>
                  </section>
                </>
              ) : (
                <section className="panel">
                  <div className="video-upload-zone">
                    <Icon name="upload" size={36} />
                    <h3>你的画面，直接上场。</h3>
                    <p>上传可播放的 MP4 或 WebM 视频。建议横向 16:9，适合静音循环。</p>
                    <UploadButton
                      label="选择并上传视频"
                      accept="video/mp4,video/webm"
                      disabled={!!busy}
                      onFile={(file) => upload(file, () => {})}
                    />
                    <small>上传已有素材不扣生成额度；上传完成后仍需预览并确认选用。</small>
                  </div>
                </section>
              )}
              <section className="panel">
                <div className="panel-title">
                  <span className="section-index">04</span>
                  <h3>预览与选用</h3>
                  <span>{draft.heroAccepted ? '已选定首页视频' : '尚未确认视频'}</span>
                </div>
                {detail.assets.filter((a) => a.contentType.startsWith('video/')).length === 0 ? (
                  <Empty icon="play" title="视频完成后，会出现在这里">
                    先看一遍产品外观、画面变化与循环衔接，再确认用作网站 Hero。
                  </Empty>
                ) : (
                  <div className="video-results">
                    {detail.assets
                      .filter((a) => a.contentType.startsWith('video/'))
                      .map((asset) => (
                        <div
                          className={`video-result ${draft.heroAssetId === asset.id && draft.heroAccepted ? 'selected' : ''}`}
                          key={asset.id}
                        >
                          <AssetView projectId={project.id} assetId={asset.id} video />
                          <div>
                            <strong>{asset.filename}</strong>
                            <small>
                              {dateTime(asset.createdAt)} · {(asset.size / 1024 / 1024).toFixed(1)}{' '}
                              MB {asset.origin === 'test' && '· 测试素材'}
                            </small>
                            <Button
                              onClick={() =>
                                action(
                                  'accept-video',
                                  () => command('accept-video', { assetId: asset.id }),
                                  '视频已确认选用，网站将使用这条 Hero 视频。',
                                )
                              }
                              disabled={!!busy}
                              kind={
                                draft.heroAssetId === asset.id && draft.heroAccepted
                                  ? 'secondary'
                                  : 'primary'
                              }
                            >
                              <Icon
                                name={
                                  draft.heroAssetId === asset.id && draft.heroAccepted
                                    ? 'check'
                                    : 'play'
                                }
                              />
                              {draft.heroAssetId === asset.id && draft.heroAccepted
                                ? '当前已选用'
                                : '已预览，确认选用'}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <div className="poster-row">
                  <div>
                    <strong>视频海报图</strong>
                    <p>用于加载和减少动态效果时的回退；正常发布仍需可用视频。</p>
                    <UploadButton
                      label="上传海报图"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={!!busy}
                      onFile={(file) => upload(file, (asset) => patch({ posterAssetId: asset.id }))}
                    />
                  </div>
                  <AssetView projectId={project.id} assetId={draft.posterAssetId} alt="视频海报" />
                </div>
              </section>
              <JobList
                jobs={detail.jobs.filter((j) => ['script', 'image', 'video'].includes(j.kind))}
                busy={busy}
                onRetry={(job) =>
                  action(
                    `retry:${job.id}`,
                    async () => {
                      await post(`${endpoint}/jobs/${job.id}/retry`);
                      await refresh();
                    },
                    '已请求恢复原任务。',
                  )
                }
              />
              <StepFooter
                hint="视频确认后，完善网站文案与品牌细节。"
                next="编辑网站内容"
                onNext={() => setTab('content')}
              />
            </>
          )}
          {tab === 'content' && (
            <>
              <SectionTitle
                eyebrow="04 / WORDS & DETAILS"
                title="把你的品牌，写进每一处。"
                description="编辑网站文案、品牌色与社交链接。所有语言共用同一条已确认视频。"
              />
              <section className="panel">
                <div className="panel-title">
                  <span className="section-index">A</span>
                  <h3>网站文案与译文</h3>
                  <div className="panel-title-actions">
                    <Button
                      kind="primary"
                      onClick={() => generate('copy')}
                      disabled={
                        !!busy || !draft.company.name || activeJobs.some((j) => j.kind === 'copy')
                      }
                      busy={busy === 'job:copy:all'}
                    >
                      <Icon name="spark" />
                      生成网站文案与译文
                    </Button>
                  </div>
                </div>
                <Notice>仅依据已提供的公司与产品资料。请检查事实和译文，再发布给访客。</Notice>
                {draft.languages.map((lang) => (
                  <CopyEditor
                    key={lang}
                    lang={lang}
                    copy={draft.copy[lang] || { headline: '', subtitle: '', about: '', cta: '' }}
                    onChange={(copy) =>
                      update((d) => ({ ...d, copy: { ...d.copy, [lang]: copy } }))
                    }
                  />
                ))}
              </section>
              {draft.languages.length > 1 && (
                <section className="panel">
                  <SectionTitle
                    title="产品译文"
                    description="第二语言的产品标题和描述。材质与尺寸使用已确认规格。"
                  />
                  {draft.products.map((product) => (
                    <div className="product-translation" key={product.id}>
                      <h4>{product.name || '未命名产品'}</h4>
                      {draft.languages
                        .filter((l) => l !== 'en')
                        .map((lang) => (
                          <div className="form-grid" key={lang}>
                            <Field label={`${languageNames[lang]} · 名称`}>
                              <input
                                value={product.translations?.[lang]?.name || ''}
                                onChange={(e) =>
                                  productChange(product.id, {
                                    translations: {
                                      ...product.translations,
                                      [lang]: {
                                        name: e.target.value,
                                        description:
                                          product.translations?.[lang]?.description || '',
                                      },
                                    },
                                  })
                                }
                              />
                            </Field>
                            <Field label={`${languageNames[lang]} · 介绍`}>
                              <textarea
                                rows={2}
                                value={product.translations?.[lang]?.description || ''}
                                onChange={(e) =>
                                  productChange(product.id, {
                                    translations: {
                                      ...product.translations,
                                      [lang]: {
                                        name: product.translations?.[lang]?.name || '',
                                        description: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            </Field>
                          </div>
                        ))}
                    </div>
                  ))}
                </section>
              )}
              <section className="panel">
                <div className="panel-title">
                  <span className="section-index">B</span>
                  <h3>品牌细节</h3>
                </div>
                <div className="form-grid">
                  <Field label="品牌色" hint="应用到模板按钮与强调色">
                    <div className="color-input">
                      <input
                        type="color"
                        value={
                          /^#[0-9a-fA-F]{6}$/.test(draft.brandColor) ? draft.brandColor : '#345a43'
                        }
                        onChange={(e) => patch({ brandColor: e.target.value })}
                      />
                      <input
                        aria-label="品牌色十六进制"
                        value={draft.brandColor}
                        onChange={(e) => patch({ brandColor: e.target.value })}
                        pattern="#[0-9a-fA-F]{6}"
                        maxLength={7}
                      />
                    </div>
                  </Field>
                  <Field label="项目名称" hint="只显示在工作台，不作为网站标题">
                    <input
                      value={project.name}
                      onChange={(e) => {
                        setProject({ ...project, name: e.target.value });
                        setDirty(true);
                        dirtyRef.current = true;
                      }}
                      maxLength={120}
                    />
                  </Field>
                  <Field label="Facebook">
                    <input
                      type="url"
                      value={draft.company.facebook}
                      onChange={(e) => company({ facebook: e.target.value })}
                      placeholder="https://facebook.com/yourbrand"
                    />
                  </Field>
                  <Field label="Instagram">
                    <input
                      type="url"
                      value={draft.company.instagram}
                      onChange={(e) => company({ instagram: e.target.value })}
                      placeholder="https://instagram.com/yourbrand"
                    />
                  </Field>
                  <Field label="X">
                    <input
                      type="url"
                      value={draft.company.x}
                      onChange={(e) => company({ x: e.target.value })}
                      placeholder="https://x.com/yourbrand"
                    />
                  </Field>
                </div>
              </section>
              <JobList
                jobs={detail.jobs.filter((j) => j.kind === 'copy')}
                busy={busy}
                onRetry={(job) =>
                  action(`retry:${job.id}`, async () => {
                    await post(`${endpoint}/jobs/${job.id}/retry`);
                    await refresh();
                  })
                }
              />
              <StepFooter
                hint="准备好后，预览所有页面与语言，确认再发布。"
                next="预览与发布"
                onNext={() => setTab('publish')}
              />
            </>
          )}
          {tab === 'publish' && (
            <>
              <SectionTitle
                eyebrow="05 / READY FOR THE WORLD"
                title="检查一遍，然后面向世界。"
                description="草稿与线上版本各自保存。只有发布成功，公开网站才会更新。"
              />
              <section className="publication-hero">
                <div>
                  <span className="eyebrow">YOUR WEBSITE</span>
                  <h3>{draft.company.name || project.name}</h3>
                  <p>
                    {project.siteUrl ? (
                      <a href={project.siteUrl} target="_blank" rel="noreferrer">
                        {project.siteUrl}
                        <Icon name="external" size={15} />
                      </a>
                    ) : (
                      '首次发布成功后，会在这里显示网站地址。'
                    )}
                  </p>
                  <div className="publication-pills">
                    <span className="pill light">
                      {
                        { natural: '温暖自然', technology: '现代科技', explorer: '户外探索' }[
                          draft.template
                        ]
                      }
                    </span>
                    <span className="pill light">{draft.products.length} 个产品</span>
                    <span className="pill light">
                      {draft.languages.map((l) => l.toUpperCase()).join(' + ')}
                    </span>
                    {testMode && <span className="pill light">测试发布</span>}
                  </div>
                </div>
                <Button onClick={openPreview} disabled={!!busy} busy={busy === 'preview'}>
                  <Icon name="eye" />
                  打开私有整站预览
                </Button>
              </section>
              <section className="panel">
                <SectionTitle
                  title="发布前检查"
                  description="预览首页、目录、产品详情、公司介绍与联系页面，检查所有网站语言。"
                />
                <div className="publish-checklist">
                  {[
                    [
                      '公司与联系资料',
                      !!draft.company.name && !!draft.company.email && !!draft.company.contactName,
                      '访客联系你时使用这些真实信息',
                    ],
                    [
                      '产品与主产品',
                      draft.products.length > 0 && !!draft.primaryProductId,
                      `${draft.products.length} 个产品，最多 20 个`,
                    ],
                    [
                      'Hero 视频已人工选用',
                      !!draft.heroAssetId && draft.heroAccepted,
                      '检查产品一致性、画面变化和循环衔接',
                    ],
                    [
                      '各语言网站文案',
                      draft.languages.every((l) => draft.copy[l]?.headline && draft.copy[l]?.about),
                      '包含网站标题、介绍与联系按钮',
                    ],
                  ].map(([label, ok, description]) => (
                    <div key={String(label)}>
                      <span className={`check-circle ${ok ? 'complete' : ''}`}>
                        <Icon name={ok ? 'check' : 'clock'} size={15} />
                      </span>
                      <div>
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </div>
                      <span>{ok ? '已准备' : '待完善'}</span>
                    </div>
                  ))}
                </div>
                {publicationMissing.length > 0 && (
                  <Notice tone="warning">
                    仍需完善：{publicationMissing.join('、')}。服务端会在发布时校验全部要求。
                  </Notice>
                )}
                <div className="publish-actions">
                  <Button
                    kind="primary"
                    onClick={() => setReleaseAction('publish')}
                    disabled={
                      !!busy ||
                      publicationMissing.length > 0 ||
                      activeJobs.some((j) => j.kind === 'publish')
                    }
                  >
                    <Icon name="globe" />
                    {project.publishedReleaseId ? '发布当前草稿' : '发布网站'}
                  </Button>
                  <Button
                    onClick={() => setReleaseAction('restore')}
                    disabled={
                      !!busy ||
                      !project.previousReleaseId ||
                      activeJobs.some((j) => j.kind === 'publish')
                    }
                  >
                    <Icon name="refresh" />
                    恢复上一次成功版本
                  </Button>
                  <Button
                    kind="danger"
                    onClick={() => setReleaseAction('offline')}
                    disabled={!!busy || !project.publishedReleaseId || project.offline}
                  >
                    下线网站
                  </Button>
                </div>
                <small className="muted">
                  恢复历史版本会保留当前草稿、账号额度和询盘。下线后网址暂不可用，并停止接收新询盘。
                </small>
              </section>
              <section className="panel">
                <SectionTitle title="发布记录" />
                {detail.releases.length === 0 ? (
                  <Empty icon="globe" title="还没有发布记录">
                    完成预览后，发布你的第一个版本。
                  </Empty>
                ) : (
                  <div className="release-list">
                    {detail.releases.map((release) => (
                      <div key={release.id}>
                        <span className="release-icon">
                          <Icon name="globe" />
                        </span>
                        <div>
                          <strong>
                            草稿 V{release.draftVersion}
                            {release.testMode && <span className="inline-test">测试</span>}
                          </strong>
                          <small>
                            {dateTime(release.createdAt)} · {release.id}
                          </small>
                          {release.error && <p className="error-text">{release.error}</p>}
                        </div>
                        <span
                          className={`pill ${release.status === 'succeeded' ? 'green' : release.status === 'failed' ? 'red' : 'muted'}`}
                        >
                          {release.id === project.publishedReleaseId
                            ? '当前发布版本'
                            : statusNames[release.status] || release.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <JobList
                jobs={detail.jobs.filter((j) => j.kind === 'publish')}
                busy={busy}
                onRetry={(job) =>
                  action(`retry:${job.id}`, async () => {
                    await post(`${endpoint}/jobs/${job.id}/retry`);
                    await refresh();
                  })
                }
              />
            </>
          )}
          {tab === 'inquiries' && (
            <>
              <SectionTitle
                eyebrow="06 / NEW CONNECTIONS"
                title="每一次询盘，都是新的可能。"
                description={`询盘完整内容发送到 ${draft.company.email || '你填写的公司联系邮箱'}，后台独立保存记录。`}
                actions={
                  <Button onClick={loadInquiries}>
                    <Icon name="refresh" />
                    刷新
                  </Button>
                }
              />
              {inquiries.length === 0 ? (
                <div className="panel">
                  <Empty icon="mail" title="等待你的第一位访客">
                    网站发布后，访客可以通过联系表单留言。发信失败也不会丢失询盘记录。
                  </Empty>
                </div>
              ) : (
                <div className="inquiry-list">
                  {inquiries.map((inquiry) => (
                    <article className="panel inquiry-card" key={inquiry.id}>
                      <div className="inquiry-head">
                        <span className="avatar">{inquiry.name.slice(0, 1).toUpperCase()}</span>
                        <div>
                          <h3>
                            {inquiry.name}
                            <span>{inquiry.company}</span>
                          </h3>
                          <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                        </div>
                        <time>{dateTime(inquiry.createdAt)}</time>
                        <span
                          className={`pill ${inquiry.emailStatus === 'sent' ? 'green' : inquiry.emailStatus === 'failed' ? 'red' : 'muted'}`}
                        >
                          邮件{statusNames[inquiry.emailStatus]}
                        </span>
                      </div>
                      <p className="inquiry-message">{inquiry.message}</p>
                      <div className="inquiry-meta">
                        <span>
                          来源：
                          <a href={inquiry.siteUrl} target="_blank" rel="noreferrer">
                            {inquiry.siteUrl}
                          </a>
                        </span>
                        {inquiry.productId && (
                          <span>
                            相关产品：
                            {draft.products.find((p) => p.id === inquiry.productId)?.name ||
                              inquiry.productId}
                          </span>
                        )}
                        <span>发送尝试：{inquiry.emailAttempts}</span>
                        {inquiry.emailStatus === 'failed' && (
                          <Button
                            disabled={!!busy}
                            onClick={() =>
                              action(
                                `mail:${inquiry.id}`,
                                async () => {
                                  await post(`${endpoint}/inquiries/${inquiry.id}/retry`);
                                  await loadInquiries();
                                },
                                '已请求重试邮件投递，询盘记录保持不变。',
                              )
                            }
                          >
                            重试邮件
                          </Button>
                        )}
                      </div>
                      {inquiry.emailError && <Notice tone="warning">{inquiry.emailError}</Notice>}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {activeJobs.length > 0 && tab !== 'video' && (
            <div className="background-job">
              <span className="spinner" />
              {activeJobs.length} 个任务在后台处理{' '}
              <button
                onClick={() =>
                  setTab(activeJobs.some((j) => j.kind === 'publish') ? 'publish' : 'video')
                }
              >
                查看进度
                <Icon name="arrow" size={14} />
              </button>
            </div>
          )}
          <footer className="editor-footer">
            <span>WEB RADAR STUDIO</span>
            <span>真实的产品 · 你确认的故事</span>
          </footer>
        </main>
      </div>
      {sourceOpen && (
        <Modal title="从 Product Radar 导入产品" onClose={() => setSourceOpen(false)} wide>
          <p className="muted">
            只显示当前账号有权限的产品。图片与设计条件将复制为独立快照，不影响原产品库。
          </p>
          <div className="source-select-list">
            {sourceProducts.length === 0 ? (
              <Empty title="暂无可导入的产品" />
            ) : (
              sourceProducts.map((p) => (
                <label className="source-select-item" key={p.id}>
                  <input
                    type="checkbox"
                    checked={sourceIds.includes(p.id)}
                    disabled={
                      draft.products.some((existing) => existing.source?.id === p.id) ||
                      (!sourceIds.includes(p.id) && sourceIds.length + draft.products.length >= 20)
                    }
                    onChange={(e) =>
                      setSourceIds((current) =>
                        e.target.checked ? [...current, p.id] : current.filter((id) => id !== p.id),
                      )
                    }
                  />
                  <div>
                    <strong>{p.name}</strong>
                    <p>{p.description}</p>
                    <small>
                      {p.material} {p.dimensions} ·{' '}
                      {p.factsOrigin === 'generated-concept' ? '生成概念，请核实产品事实' : ''}
                    </small>
                  </div>
                  <span className="pill muted">
                    {draft.products.some((existing) => existing.source?.id === p.id)
                      ? '已导入'
                      : p.workflow === 'build'
                        ? 'Build'
                        : 'Create'}
                  </span>
                </label>
              ))
            )}
          </div>
          <div className="source-pagination">
            <Button
              disabled={sourceOffset === 0 || !!busy}
              onClick={() => getSources(Math.max(0, sourceOffset - 20))}
            >
              上一页
            </Button>
            <span>
              {sourceOffset + 1}–{Math.min(sourceOffset + 20, sourceTotal)} / {sourceTotal}
            </span>
            <Button
              disabled={sourceOffset + 20 >= sourceTotal || !!busy}
              onClick={() => getSources(sourceOffset + 20)}
            >
              下一页
            </Button>
          </div>
          <div className="modal-actions">
            <span>
              已选择 {sourceIds.length} 个 · 可再添加 {20 - draft.products.length} 个
            </span>
            <Button
              kind="primary"
              onClick={importSources}
              busy={busy === 'import'}
              disabled={!sourceIds.length || !!busy}
            >
              导入所选产品
            </Button>
          </div>
        </Modal>
      )}
      {sourceChanges && (
        <Modal title="检查来源更新" onClose={() => setSourceChanges(null)} wide>
          {sourceChanges.length === 0 ? (
            <Empty icon="check" title="已导入来源没有更新">
              网站中的手动编辑保持不变。
            </Empty>
          ) : (
            <>
              <p className="muted">
                逐项选择后才会应用到草稿。应用会替换所选产品快照与图片，请留意网站中的自行修改。
              </p>
              {sourceChanges.map((change) => (
                <label className="source-diff" key={change.productId}>
                  <input
                    type="checkbox"
                    checked={applyIds.includes(change.productId)}
                    onChange={(e) =>
                      setApplyIds((ids) =>
                        e.target.checked
                          ? [...ids, change.productId]
                          : ids.filter((id) => id !== change.productId),
                      )
                    }
                  />
                  <div>
                    <strong>{change.after.name}</strong>
                    <div className="diff-columns">
                      <div>
                        <small>上次导入</small>
                        <p>{change.before.name}</p>
                        <p>{change.before.description}</p>
                        <p>
                          {change.before.material} · {change.before.dimensions}
                        </p>
                        <p>{change.before.designDirection}</p>
                        <small>来源版本 {change.before.version.slice(0, 16)}</small>
                        <pre>{JSON.stringify(change.before.conditions, null, 2)}</pre>
                      </div>
                      <div>
                        <small>当前来源</small>
                        <p>{change.after.name}</p>
                        <p>{change.after.description}</p>
                        <p>
                          {change.after.material} · {change.after.dimensions}
                        </p>
                        <p>{change.after.designDirection}</p>
                        <small>
                          来源版本 {change.after.version.slice(0, 16)} · 应用时同步复制当前来源图片
                        </small>
                        <pre>{JSON.stringify(change.after.conditions, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
              <div className="modal-actions">
                <Button onClick={() => setSourceChanges(null)}>保持现状</Button>
                <Button
                  kind="primary"
                  disabled={!applyIds.length || !!busy}
                  busy={busy === 'source-apply'}
                  onClick={() =>
                    action(
                      'source-apply',
                      async () => {
                        await command('source-apply', { productIds: applyIds });
                        setSourceChanges(null);
                      },
                      '所选来源更新已应用到草稿，线上版本未变。',
                    )
                  }
                >
                  应用所选更新
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
      {conflict && merger && (
        <Modal title="草稿有新版本，请合并修改" onClose={() => setConflict(null)} wide>
          <Notice tone="warning">
            另一个入口或后台任务已保存 V{conflict.version}
            。你的未保存内容完整保留。互不冲突的字段将合并；相同字段的不同改动由你选择。
          </Notice>
          {merger.conflicts.map((item) => (
            <div className="merge-conflict" key={item.path}>
              <strong>{item.path}</strong>
              <div>
                <label>
                  <input
                    type="radio"
                    name={item.path}
                    onChange={() => setChoices({ ...choices, [item.path]: 'mine' })}
                  />
                  <span>
                    保留我的修改
                    <pre>
                      {typeof item.mine === 'string'
                        ? item.mine
                        : JSON.stringify(item.mine, null, 2)}
                    </pre>
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name={item.path}
                    onChange={() => setChoices({ ...choices, [item.path]: 'theirs' })}
                  />
                  <span>
                    采用服务器版本
                    <pre>
                      {typeof item.theirs === 'string'
                        ? item.theirs
                        : JSON.stringify(item.theirs, null, 2)}
                    </pre>
                  </span>
                </label>
              </div>
            </div>
          ))}
          {merger.conflicts.length === 0 && (
            <Notice tone="success">所有字段已准备合并，可以保存。</Notice>
          )}
          <div className="modal-actions wrap">
            <Button onClick={downloadLocal}>下载本地编辑备份</Button>
            <Button
              onClick={() => {
                install(conflict);
                setConflict(null);
              }}
            >
              放弃本地修改，载入服务器版本
            </Button>
            <Button
              kind="primary"
              onClick={saveMerge}
              busy={busy === 'merge'}
              disabled={!!busy || merger.conflicts.length > 0}
            >
              保存合并结果
            </Button>
          </div>
        </Modal>
      )}
      {leaveOpen && (
        <Modal title="还有未保存的修改" onClose={() => setLeaveOpen(false)}>
          <p>保存后返回网站列表，可以稍后从相同草稿继续。</p>
          <div className="modal-actions">
            <Button onClick={onBack}>放弃修改并返回</Button>
            <Button
              kind="primary"
              busy={busy === 'save-leave'}
              onClick={() =>
                action('save-leave', async () => {
                  await save();
                  onBack();
                })
              }
            >
              保存并返回
            </Button>
          </div>
        </Modal>
      )}
      {previewOpen && <SitePreview project={project} onClose={() => setPreviewOpen(false)} />}
      {releaseAction && (
        <Modal
          title={
            releaseAction === 'publish'
              ? '发布当前网站草稿'
              : releaseAction === 'restore'
                ? '恢复上一次成功发布'
                : '下线公开网站'
          }
          onClose={() => setReleaseAction(null)}
        >
          <p>
            {releaseAction === 'publish'
              ? `将发布已保存的草稿 V${project.version}${testMode ? '（本地测试发布）' : ''}。请确认你已检查整站预览、联系方式与所有语言。`
              : releaseAction === 'restore'
                ? '公开网站将使用上一次成功版本的内容与素材；当前草稿、询盘和额度继续保留。'
                : '公开网址将显示暂不可用，停止接收新询盘。项目资料和历史询盘保留，之后可以重新发布。'}
          </p>
          <div className="modal-actions">
            <Button onClick={() => setReleaseAction(null)}>取消</Button>
            <Button
              kind={releaseAction === 'offline' ? 'danger' : 'primary'}
              busy={busy === releaseAction}
              disabled={!!busy}
              onClick={publishAction}
            >
              {releaseAction === 'publish'
                ? '确认发布'
                : releaseAction === 'restore'
                  ? '确认恢复'
                  : '确认下线'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );

  function addProduct() {
    if (draft.products.length >= 20) return;
    const id = requestId();
    patch({
      products: [
        ...draft.products,
        { id, name: '', description: '', material: '', dimensions: '' },
      ],
      primaryProductId: draft.primaryProductId || id,
    });
  }
  function removeProduct(id: string) {
    const products = draft.products.filter((p) => p.id !== id);
    patch({
      products,
      primaryProductId:
        draft.primaryProductId === id ? products[0]?.id || '' : draft.primaryProductId,
    });
  }
  function moveProduct(index: number, direction: number) {
    const products = [...draft.products];
    [products[index], products[index + direction]] = [products[index + direction], products[index]];
    patch({ products });
  }
}

function UploadButton({
  label,
  accept,
  onFile,
  disabled,
}: {
  label: string;
  accept: string;
  onFile: (file: File) => void;
  disabled: boolean;
}) {
  return (
    <label className={`button secondary upload-button ${disabled ? 'disabled' : ''}`}>
      <Icon name="upload" size={15} />
      {label}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </label>
  );
}
function StepFooter({ hint, next, onNext }: { hint: string; next: string; onNext: () => void }) {
  return (
    <div className="step-footer">
      <p>{hint}</p>
      <Button kind="primary" onClick={onNext}>
        {next}
        <Icon name="arrow" />
      </Button>
    </div>
  );
}
function CopyEditor({
  lang,
  copy,
  onChange,
}: {
  lang: Language;
  copy: SiteCopy;
  onChange: (copy: SiteCopy) => void;
}) {
  return (
    <div className="copy-editor">
      <h4>
        <span>{lang.toUpperCase()}</span>
        {languageNames[lang]}
        {lang === 'en' && <small>基础语言</small>}
      </h4>
      <div className="form-grid">
        <Field label="首页主标题">
          <input
            value={copy.headline}
            onChange={(e) => onChange({ ...copy, headline: e.target.value })}
            placeholder="A clear headline for your brand"
          />
        </Field>
        <Field label="联系按钮文字">
          <input
            value={copy.cta}
            onChange={(e) => onChange({ ...copy, cta: e.target.value })}
            placeholder="Get in touch"
          />
        </Field>
        <Field className="full-width" label="首页副标题">
          <textarea
            rows={2}
            value={copy.subtitle}
            onChange={(e) => onChange({ ...copy, subtitle: e.target.value })}
          />
        </Field>
        <Field className="full-width" label="公司介绍正文">
          <textarea
            rows={4}
            value={copy.about}
            onChange={(e) => onChange({ ...copy, about: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}
function SceneCard({
  projectId,
  scene,
  index,
  disabled,
  onDescription,
  onRegenerate,
}: {
  projectId: string;
  scene: Draft['scenes'][number];
  index: number;
  disabled: boolean;
  onDescription: (value: string) => void;
  onRegenerate: (instructions: string) => void;
}) {
  const [instructions, setInstructions] = useState('');
  return (
    <article className="scene-card">
      <div className="scene-cover">
        <AssetView projectId={projectId} assetId={scene.imageAssetId} alt={`分镜 ${index + 1}`} />
        <span>SCENE {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="scene-fields">
        <Field label="镜头内容">
          <textarea
            rows={4}
            value={scene.description}
            onChange={(e) => onDescription(e.target.value)}
          />
        </Field>
        <Field label="单张修改要求">
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="想调整哪里？仅重做这一张"
          />
        </Field>
        <Button disabled={disabled} onClick={() => onRegenerate(instructions)}>
          <Icon name="refresh" size={15} />
          {scene.imageAssetId ? '重做此分镜 · 1 次' : '生成此分镜 · 1 次'}
        </Button>
      </div>
    </article>
  );
}
function JobList({
  jobs,
  busy,
  onRetry,
}: {
  jobs: Job[];
  busy: string;
  onRetry: (job: Job) => void;
}) {
  if (!jobs.length) return null;
  return (
    <section className="panel jobs-panel">
      <SectionTitle title="任务与恢复" description="任务保存于服务端；刷新和查询不会重复扣额度。" />
      <div className="job-list">
        {[...jobs]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((job) => (
            <div className="job-row" key={job.id}>
              <span className={`job-status-icon ${job.status}`}>
                {['running', 'queued'].includes(job.status) ? (
                  <span className="spinner" />
                ) : (
                  <Icon
                    name={
                      job.status === 'succeeded'
                        ? 'check'
                        : job.status === 'failed'
                          ? 'close'
                          : 'clock'
                    }
                  />
                )}
              </span>
              <div>
                <strong>
                  {jobKinds[job.kind]}
                  {job.testMode && <span className="inline-test">测试</span>}
                </strong>
                <small>
                  {dateTime(job.createdAt)} ·{' '}
                  {job.upstreamId ? `上游任务 ${job.upstreamId}` : `任务 ${job.id.slice(0, 12)}`}
                </small>
                {job.error && <p className="error-text">{job.error}</p>}
                {job.status === 'unknown' && (
                  <p>上游结果待核对。恢复将查询原任务，不重新提交视频。</p>
                )}
              </div>
              <span
                className={`pill ${job.status === 'succeeded' ? 'green' : job.status === 'failed' ? 'red' : 'muted'}`}
              >
                {statusNames[job.status]}
              </span>
              {['failed', 'unknown'].includes(job.status) && (
                <Button disabled={!!busy} onClick={() => onRetry(job)}>
                  恢复 / 重试
                </Button>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}
