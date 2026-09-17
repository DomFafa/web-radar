import { CloneQualityReport } from './CloneQualityReport';
import { UploadProgress, type UploadState } from './UploadProgress';
import { hasCloneOutput } from '../shared/clone-output';
import { CloneTaskPanel } from './CloneTaskPanel';
import { useState, useRef, useEffect } from 'react';
import { guessCloneImageRole, normalizeCloneImages } from '../shared/clone';
import type { CloneConfig, CloneUiImage, CloneUiImageRole, Draft, Project, Job, ProjectDetail } from '../shared/model';
import { api, post, upload } from './api';
import { AssetView, Button, Notice } from './components';

interface CloneEditorProps {
  onActivityChange?: (active: boolean) => void;
  projectId: string;
  testMode: boolean;
  onGenerate: (config: CloneConfig) => Promise<Project>;
  onPublish: (project: Project) => Promise<Job>;
  draft: Draft;
  onUpdateDraft: (patch: Partial<Draft>) => void;
  onProceedToPublish: () => void;
  onBackToBasics: () => void;
  onRefresh?: () => Promise<unknown>;
}

const ROLE_LABELS: Record<CloneUiImageRole, string> = {
  home: '🏠 首页 (Home / Index)',
  catalog: '📦 产品列表 (Products / Catalog)',
  detail: '🔍 产品详情 (Product Detail)',
  about: '🏢 关于我们 (About Us)',
  contact: '✉️ 联系我们 (Contact Us)',
  asset: '🎨 核心素材 (Asset)',
};

export function CloneEditor({
  onActivityChange,
  projectId,
  testMode,
  onGenerate,
  onPublish,
  draft,
  onUpdateDraft,
  onProceedToPublish,
  onBackToBasics,
  onRefresh,
}: CloneEditorProps) {
  const cloneConfig: CloneConfig = draft.cloneConfig || {
    targetUrl: '',
    instructions: '',
    uiImages: [],
    status: 'idle',
  };

  const [targetUrl, setTargetUrl] = useState(cloneConfig.targetUrl || '');
  const [instructions, setInstructions] = useState(cloneConfig.instructions || '');
  const [enhancementMode, setEnhancementMode] = useState<'faithful' | 'smart'>(cloneConfig.enhancementMode || (cloneConfig.targetUrl ? 'faithful' : 'smart'));
  const [autoPublish, setAutoPublish] = useState(cloneConfig.autoPublish === true);
  const [uiImages, setUiImages] = useState<CloneUiImage[]>(normalizeCloneImages(cloneConfig.uiImages));
  const [scrapedData, setScrapedData] = useState(cloneConfig.scrapedData);
  const [selectedModel, setSelectedModel] = useState<string>(cloneConfig.model || 'gpt-6-astra');

  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const [transfer, setTransfer] = useState<UploadState | null>(null);
  const uploadController = useRef<AbortController | null>(null);
  useEffect(() => () => uploadController.current?.abort(), []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const uploadBusy = useRef(false);
  const [uploadProgress, setUploadProgress] = useState<{
    name: string; completed: number; total: number; percent: number; processing: boolean;
  } | null>(null);

  const [generating, setGenerating] = useState(false);
  const [generationInfo, setGenerationInfo] = useState(cloneConfig.generation);
  const [genError, setGenError] = useState(cloneConfig.error || '');
  const [isSuccess, setIsSuccess] = useState(
    hasCloneOutput(cloneConfig),
  );

  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string>('');
  const [deployError, setDeployError] = useState<string>('');

  useEffect(() => {
    onActivityChange?.(uploading || scraping || generating || deploying);
    return () => onActivityChange?.(false);
  }, [uploading, scraping, generating, deploying, onActivityChange]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const launching = useRef(false);
  useEffect(() => {
    setGenerationInfo(cloneConfig.generation);
    setIsSuccess(hasCloneOutput(cloneConfig));
  }, [cloneConfig.generatedAt, cloneConfig.generation, cloneConfig.artifact]);

  useEffect(() => {setUiImages(normalizeCloneImages(cloneConfig.uiImages));}, [cloneConfig.generatedAt]);

  // Sync state up to project draft
  function syncConfig(updated: Partial<CloneConfig>) {
    const nextConfig: CloneConfig = {
      ...cloneConfig,
      targetUrl,
      instructions,
      uiImages,
      scrapedData,
      model: selectedModel,
      enhancementMode,
      autoPublish,
      ...updated,
    };
    onUpdateDraft({
      cloneConfig: nextConfig,
    });
  }

  // Handle target URL scraping
  async function handleScrape() {
    if (!targetUrl.trim()) return;
    setScraping(true);
    setScrapeError('');
    try {
      const result = await post<{ scraped: NonNullable<CloneConfig['scrapedData']> }>(
        `/api/projects/${encodeURIComponent(projectId)}/clone/scrape`,
        { url: targetUrl.trim() },
      );
      setScrapedData(result.scraped);
      syncConfig({ targetUrl: targetUrl.trim(), scrapedData: result.scraped });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '嗅探抓取失败，请检查网址。';
      setScrapeError(msg);
    } finally {
      setScraping(false);
    }
  }

  async function handleFileUpload(files: File[]) {
    if (!files.length || uploadBusy.current || generating) return;
    uploadBusy.current = true;
    setUploading(true);
    const controller = new AbortController();
    uploadController.current = controller;
    const startedAt = Date.now();
    setUploadError('');
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0) || 1;
    let completedBytes = 0;
    let completed = 0;
    let currentName = '';
    const newImages = [...uiImages];
    try {
      for (const file of files) {
        if (controller.signal.aborted) throw new Error('上传已取消。');
        currentName = file.name;
        const updateProgress = (fraction: number) => {
          setTransfer({ name: file.name, fraction: (completedBytes + file.size * fraction) / totalBytes, startedAt });
          setUploadProgress({
          name: file.name, completed, total: files.length,
          // Completion is confirmed by the server, not just the last transmitted byte.
          percent: Math.min(99, Math.floor((completedBytes + file.size * fraction) / totalBytes * 100)),
          processing: fraction === 1,
        }); };
        updateProgress(0);
        const form = new FormData();
        form.append('file', file);
        const result = await upload<{ asset: { id: string } }>(
          `/api/projects/${encodeURIComponent(projectId)}/uploads`, form, updateProgress, controller.signal,
        );
        newImages.push({
          id: crypto.randomUUID(), assetId: result.asset.id, name: file.name,
          role: guessCloneImageRole(file.name), roleSource: 'auto',
        });
        completed++;
        completedBytes += file.size;
        setUiImages([...newImages]);
        syncConfig({ uiImages: [...newImages] });
      }
      setUploadProgress({ name: '', completed, total: files.length, percent: 100, processing: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '图片上传失败。';
      setUploadError(`${currentName}：${msg} 已保留本次成功上传的 ${completed} 张图片；可重新选择未完成的图片。`);
    } finally {
      uploadController.current = null;
      setTransfer(null);
      uploadBusy.current = false;
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRoleChange(imageId: string, newRole: CloneUiImageRole) {
    const next = uiImages.map((img) => (img.id === imageId ? { ...img, role: newRole, roleSource: 'manual' as const } : img));
    setUiImages(next);
    syncConfig({ uiImages: next });
  }

  function handleRemoveImage(imageId: string) {
    const next = uiImages.filter((img) => img.id !== imageId);
    setUiImages(next);
    syncConfig({ uiImages: next });
  }

  // Handle clone generation via OpenAI
  async function handleGenerate() {
    if (!targetUrl.trim() && !uiImages.some(i=>i.role!=='asset')) {
      setGenError('请输入参考网址，或上传并标注至少一张页面设计图。');
      return;
    }

    if (launching.current) return;
    launching.current = true;
    setGenerating(true);
    setGenError('');
    setIsSuccess(false);
    setDeploying(false);
    setDeployedUrl('');
    setDeployError('');

    try {
      const payloadConfig: CloneConfig = {
        targetUrl: targetUrl.trim() || undefined,
        scrapedData,
        uiImages,
        instructions: instructions.trim() || undefined,
        model: selectedModel,
      enhancementMode,
      autoPublish,
      };

      await onGenerate(payloadConfig);
      // The server now owns generation and publication; polling survives reloads.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '像素级克隆生成失败，请稍后重试。';
      setGenError(msg);
      setGenerating(false);
    } finally {
      launching.current = false;
    }
  }

  return (
    <>
    <>
    {transfer && <UploadProgress state={transfer} onCancel={() => uploadController.current?.abort()} />}
    <fieldset disabled={generating || uploading} className="clone-editor" style={{ maxWidth: '1100px', width: '100%', minWidth: 0, border: 0, margin: '0 auto', padding: '1.5rem 0' }}>
      {cloneConfig.referenceCapture && <div className="notice">已自动采集 {cloneConfig.referenceCapture.screenshotCount} 张截图、{cloneConfig.referenceCapture.assets.length} 个素材。{cloneConfig.referenceCapture.warnings.join('；')} 生成完成后请对照参考网站预览。</div>}
      {/* Mode Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
          borderRadius: '16px',
          padding: '24px 32px',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.25)',
                letterSpacing: '0.05em',
              }}
            >
              设计稿还原模式
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#10b981',
                color: '#fff',
              }}
            >
              DESIGN TO WEBSITE
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            🎯 按设计稿重建网站
          </h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '13px', maxWidth: '680px' }}>
            上传每个页面的设计图和独立产品素材，按参考布局生成可编辑的网站。生成后请对照预览检查，还原程度以实际页面为准。
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={onBackToBasics} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
            ← 返回基础资料
          </Button>
        </div>
      </div>

      {/* Synced Business Data from Step 1 */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              将使用当前企业资料与商品：
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 9px', background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
              🏢 {draft.company.name || '未填公司名'}
            </span>
            {draft.company.email && (
              <span style={{ padding: '3px 9px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '12px' }}>
                ✉️ {draft.company.email}
              </span>
            )}
            {draft.company.whatsapp && (
              <span style={{ padding: '3px 9px', background: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '12px' }}>
                💬 WA: {draft.company.whatsapp}
              </span>
            )}
            {draft.company.phone && (
              <span style={{ padding: '3px 9px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '12px' }}>
                📞 {draft.company.phone}
              </span>
            )}
            <span style={{ padding: '3px 9px', background: '#fef3c7', color: '#b45309', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
              📦 {draft.products.length} 个产品已录入
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onBackToBasics}
          style={{
            background: 'none',
            border: 'none',
            color: '#4f46e5',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          修改资料与产品 →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Section 1: Target URL */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px' }}>🌐</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
              参考网址
            </h3>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
            只需输入公开网址，系统自动采集电脑与手机截图、主要内页和可用素材，再由模型分析重建。也可直接上传设计图。
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="url"
              placeholder="例如: https://squishytoys.store 或 https://example.com"
              aria-label="参考网址"
              value={targetUrl}
              onChange={(e) => {
                setTargetUrl(e.target.value);
                setEnhancementMode('faithful');
                syncConfig({ targetUrl: e.target.value, enhancementMode:'faithful' });
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <Button
              kind="primary"
              busy={scraping}
              onClick={handleScrape}
              disabled={!targetUrl.trim() || scraping}
              style={{ minWidth: '130px' }}
            >
              {scraping ? '嗅探中...' : '读取文字摘要（选填）'}
            </Button>
          </div>

          {scrapeError && (
            <div style={{ marginTop: '12px' }}>
              <Notice tone="error">{scrapeError}</Notice>
            </div>
          )}

          {/* Scraped Result Badge */}
          {scrapedData && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px 18px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  ✅ 已提取网页文字与导航
                </div>
                <button
                  onClick={() => {
                    setScrapedData(undefined);
                    syncConfig({ scrapedData: undefined });
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  清除重置
                </button>
              </div>
              <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
                <strong>网页标题：</strong> {scrapedData.title || '(无标题)'}
              </div>
              {scrapedData.description && (
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  <strong>Meta 描述：</strong> {scrapedData.description}
                </div>
              )}
              {scrapedData.navLinks && scrapedData.navLinks.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', alignSelf: 'center' }}>导航结构：</span>
                  {scrapedData.navLinks.map((link, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        fontWeight: 600,
                      }}
                    >
                      {link.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Upload UI Designs / Mockups */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🖼️</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                高保真 UI 设计稿与多页面原型图
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              已上传 {uiImages.length} 个页面/素材文件
            </span>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
            支持多选页面设计图（index、product-page、product-detail、contact 等）与独立商品图片。请确认页面角色；products-1、products-2 等编号图片会识别为素材，所有上传图片都会参与生成。
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => void handleFileUpload(Array.from(e.target.files || []))}
            style={{ display: 'none' }}
          />

          <div
            onClick={() => { if (!uploadBusy.current && !generating) fileInputRef.current?.click(); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); void handleFileUpload(Array.from(e.dataTransfer.files)); }}
            role="button"
            tabIndex={uploading || generating ? -1 : 0}
            aria-disabled={uploading || generating}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !uploadBusy.current && !generating) {
                e.preventDefault(); fileInputRef.current?.click();
              }
            }}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              cursor: uploading ? 'wait' : 'pointer',
              background: '#f8fafc',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f8fafc')}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📤</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              {uploading ? '正在上传图片...' : '点击或拖拽上传设计稿图片（支持多选）'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              支持 PNG、JPG、WEBP 格式高保真效果图
            </div>
          </div>

          {uploadProgress && (
            <div style={{ marginTop: '14px', color: '#475569', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <span role="status" aria-live="polite">
                  {uploadError ? '上传中断' : !uploading ? '上传完成' : uploadProgress.processing ? '图片已传输，正在保存…' : '正在上传图片…'}
                  {' '}已完成 {uploadProgress.completed} / {uploadProgress.total} 张
                </span>
                <strong style={{ color: '#4f46e5' }}>{uploadProgress.percent}%</strong>
              </div>
              <progress aria-label="图片上传总进度" value={uploadProgress.percent} max={100}
                style={{ width: '100%', height: '10px', accentColor: '#6366f1', display: 'block' }} />
              {uploading && <div style={{ marginTop: '8px', overflowWrap: 'anywhere', color: '#64748b' }}>{uploadProgress.name}</div>}
            </div>
          )}

          {uploadError && (
            <div style={{ marginTop: '12px' }}>
              <Notice tone="error">{uploadError}</Notice>
            </div>
          )}

          {/* Uploaded Image List */}
          {uiImages.length > 0 && (
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {uiImages.map((img) => (
                <div
                  key={img.id}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div
                    className="clone-image-thumb"
                    style={{
                      height: '110px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#e2e8f0',
                      position: 'relative',
                    }}
                  >
                    <AssetView
                      projectId={projectId}
                      assetId={img.assetId}
                      alt={img.name}
                      variant="original"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '140px',
                      }}
                      title={img.name}
                    >
                      {img.name}
                    </span>
                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                      title="移除"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      页面角色标定:
                    </label>
                    <select
                      value={img.role}
                      onChange={(e) => handleRoleChange(img.id, e.target.value as CloneUiImageRole)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        background: '#fff',
                      }}
                    >
                      {Object.entries(ROLE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Customization Instructions */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <label style={{ display: 'block', marginBottom: 16, color: '#334155', fontWeight: 600 }}>
            页面完善方式
            <select aria-label="页面完善方式" value={enhancementMode} onChange={event => {
              const value = event.target.value as 'faithful' | 'smart'; setEnhancementMode(value); syncConfig({ enhancementMode: value });
            }} style={{ display: 'block', width: '100%', marginTop: 8, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }}>
              <option value="smart">智能完善：保留风格，补足内容与页面层次</option>
              <option value="faithful">忠实还原：以设计图为准</option>
            </select>
          </label>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {enhancementMode === 'smart' ? '设计图内容偏少时，根据已有产品与品牌资料补充产品展示、选购说明、合作流程或联系引导，调整段落节奏与页面层次。不会用空白拉长页面，也不会编造资质和客户评价。' : '保留设计图的布局和内容密度；仅按下方明确指令调整。'}
            下方微调指令优先，例如“保留第一屏，补充产品分类与采购流程”。修改指令后需重新生成页面才会生效。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>✍️</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
              品牌定制与微调指令 (可选)
            </h3>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
            可注明需要微调的品牌名、联系邮箱、特定区域文案或特殊交互（如保持顶部固定导航、展台一体化排版等）：
          </p>
          <textarea
            rows={4}
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              syncConfig({ instructions: e.target.value });
            }}
            placeholder={`例如：\n保留参考设计稿的布局结构、配色与商品展台。\n将品牌名称设为「${draft.company.name || '我的品牌'}」，联系方式设为「${draft.company.email || 'contact@brand.com'}」。\n首页商品卡片保持紧凑纯净，点击后平滑跳转或展开商品详情。`}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              lineHeight: '1.6',
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

          {/* Section 4: Trigger Generation & Progress */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            textAlign: 'center',
          }}
        >
          {/* Model Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              🤖 视觉分析与代码生成模型：
            </span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                syncConfig({ model: e.target.value });
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1.5px solid #6366f1',
                fontSize: '13px',
                fontWeight: 700,
                background: '#f8fafc',
                color: '#4338ca',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 3px rgba(99, 102, 241, 0.1)',
              }}
            >
              <option value="gpt-6-astra">⚡ GPT-6 Astra (默认推荐 · 下一代多模态旗舰)</option>
              <option value="gpt-5.6-sol">🌟 GPT-5.6 Sol (高阶视觉解析与精细还原)</option>
              <option value="gpt-5.5">🎯 GPT-5.5 (深度视觉与代码还原)</option>
              <option value="gpt-5.5-pro">🔬 GPT-5.5 Pro (超高精度专业推理)</option>
              <option value="gpt-4o">🛠️ GPT-4o (兼容模式)</option>
            </select>
          </div>

          <label style={{ display: 'block', textAlign: 'left', marginBottom: 16, color: '#475569' }}>
            <input type="checkbox" checked={autoPublish} onChange={event => { setAutoPublish(event.target.checked); syncConfig({ autoPublish: event.target.checked }); }} />
            {' '}生成完成后自动发布
            <small style={{ display: 'block', marginTop: 6 }}>{autoPublish ? '生成成功后自动发布；若检查发现布局或图片问题，会保留页面供预览并暂停自动发布。' : '生成后先预览，确认页面后再到发布页上线。'}</small>
          </label>
          {generationInfo && <p style={{ fontSize: '13px', color: '#475569', textAlign: 'left' }}>
            {generationInfo.mode === 'fixture' ? '测试演示：没有调用视觉模型，不代表设计还原结果。' : generationInfo.mode === 'reference-rebuild' ? '按设计稿直接重建的页面，未调用视觉模型。' : `实际模型：${generationInfo.model}；读取 ${generationInfo.imageCount} 张图片。`}
            {' '}{generationInfo.pageCount} 个页面文件。{generationInfo.visuallyVerified ? '已进行人工视觉检查。' : '尚未进行视觉验收。'}
          </p>}
          {generationInfo?.quality && <CloneQualityReport projectId={projectId} quality={generationInfo.quality} />}
          {!!generationInfo?.improvements?.length && <div style={{ textAlign: 'left', color: '#475569', fontSize: 13 }}><strong>本次页面优化</strong><ul>{generationInfo.improvements.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
          {!generationInfo && isSuccess && <Notice tone="warning">这是旧版生成结果，缺少视觉生成记录。请检查页面是否使用了设计图后再发布。</Notice>}

          {genError && (
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <Notice tone="error">{genError}</Notice>
            </div>
          )}

          {deployError && (
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <Notice tone="warning">自动部署通知：{deployError}</Notice>
            </div>
          )}

          {isSuccess && !generating && !cloneConfig.taskId && (
            <div
              style={{
                marginBottom: '20px',
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                border: '1.5px solid #a7f3d0',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>🚀</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>
                    {deployedUrl ? (testMode ? '页面已生成，并已发布到本地测试站点' : '页面已生成，并已完成发布') : '页面代码已生成，发布状态请查看下方'}
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '3px' }}>
                    {deployedUrl ? (
                      <span>
                        {testMode ? '本地测试地址：' : '网站地址：'}{' '}
                        <a
                          href={deployedUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontWeight: 700,
                            textDecoration: 'underline',
                            color: '#047857',
                          }}
                        >
                          {deployedUrl}
                        </a>
                      </span>
                    ) : deploying ? (
                      <span>正在发布，请稍候…</span>
                    ) : (
                      <span>代码已保存。请先检查预览；生成完成不代表视觉还原已通过验证。</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {deployedUrl && (
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#059669',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                    }}
                  >
                    🌐 打开网站 ↗
                  </a>
                )}
                <Button
                  kind="primary"
                  onClick={onProceedToPublish}
                  style={{ padding: '8px 20px', fontSize: '14px' }}
                >
                  👀 预览与发布管理 →
                </Button>
              </div>
            </div>
          )}

          {generating ? (
            <p style={{ color: '#64748b' }}>后台任务执行中，可在下方查看进度、暂停或停止。</p>
          ) : (
            <Button
              kind="primary"
              onClick={handleGenerate}
              disabled={(!targetUrl.trim() && uiImages.length === 0) || generating}
              style={{
                padding: '14px 36px',
                fontSize: '16px',
                fontWeight: 700,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              }}
            >
              {isSuccess
                ? (autoPublish ? '🔄 重新生成并发布' : '🔄 重新生成页面并预览')
                : (autoPublish ? '🎯 生成并发布网站' : '🎯 生成页面并预览')}
            </Button>
          )}
        </div>
      </div>
    </fieldset>
    </>
    <CloneTaskPanel projectId={projectId} taskId={cloneConfig.taskId} onOpenPublish={onProceedToPublish} onState={active => { if (!launching.current) setGenerating(active); }} onFinished={onRefresh} />
    </>
  );
}
