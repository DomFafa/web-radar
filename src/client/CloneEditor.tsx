import { useState, useRef } from 'react';
import type { CloneConfig, CloneUiImage, CloneUiImageRole, Draft, Project, Job, ProjectDetail } from '../shared/model';
import { api, post } from './api';
import { AssetView, Button, Notice } from './components';

interface CloneEditorProps {
  projectId: string;
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
  projectId,
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
  const [uiImages, setUiImages] = useState<CloneUiImage[]>(cloneConfig.uiImages || []);
  const [scrapedData, setScrapedData] = useState(cloneConfig.scrapedData);
  const [selectedModel, setSelectedModel] = useState<string>(cloneConfig.model || 'gpt-6-astra');

  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [generating, setGenerating] = useState(cloneConfig.status === 'generating');
  const [genStep, setGenStep] = useState(1);
  const [genError, setGenError] = useState(cloneConfig.error || '');
  const [isSuccess, setIsSuccess] = useState(
    Boolean(cloneConfig.generatedHtml || cloneConfig.status === 'ready'),
  );

  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string>('');
  const [deployError, setDeployError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state up to project draft
  function syncConfig(updated: Partial<CloneConfig>) {
    const nextConfig: CloneConfig = {
      ...cloneConfig,
      targetUrl,
      instructions,
      uiImages,
      scrapedData,
      model: selectedModel,
      ...updated,
    };
    onUpdateDraft({
      buildBranch: 'clone',
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

  // Handle mockup image upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');

    try {
      const newImages: CloneUiImage[] = [...uiImages];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        const uploadResult = await api<{ asset: { id: string } }>(
          `/api/projects/${encodeURIComponent(projectId)}/uploads`,
          {
            method: 'POST',
            body: form,
          },
        );
        // Automatically guess role based on file name
        let role: CloneUiImageRole = 'asset';
        const lower = file.name.toLowerCase();
        if (/index|home|main/i.test(lower)) role = 'home';
        else if (/catalog|products|list|shop/i.test(lower)) role = 'catalog';
        else if (/detail|product|item/i.test(lower)) role = 'detail';
        else if (/about/i.test(lower)) role = 'about';
        else if (/contact/i.test(lower)) role = 'contact';

        newImages.push({
          id: Math.random().toString(36).slice(2, 10),
          assetId: uploadResult.asset.id,
          name: file.name,
          role,
        });
      }
      setUiImages(newImages);
      syncConfig({ uiImages: newImages });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '图片上传失败。';
      setUploadError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRoleChange(imageId: string, newRole: CloneUiImageRole) {
    const next = uiImages.map((img) => (img.id === imageId ? { ...img, role: newRole } : img));
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
    if (!targetUrl.trim() && uiImages.length === 0) {
      setGenError('请至少输入目标网站 URL 或上传一张页面设计稿。');
      return;
    }

    setGenerating(true);
    setGenError('');
    setIsSuccess(false);
    setGenStep(1);
    setDeploying(false);
    setDeployedUrl('');
    setDeployError('');

    const stepInterval = setInterval(() => {
      setGenStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 4500);

    try {
      const payloadConfig: CloneConfig = {
        targetUrl: targetUrl.trim() || undefined,
        scrapedData,
        uiImages,
        instructions: instructions.trim() || undefined,
        model: selectedModel,
      };

      const generated = await onGenerate(payloadConfig);
      clearInterval(stepInterval);
      setGenStep(4);
      setIsSuccess(true);

      // Automatically trigger deployment to Cloudflare Pages
      setDeploying(true);
      try {
        const job = await onPublish(generated);
        // Only this job's release confirms success; an older siteUrl is not completion.
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const latest = await api<ProjectDetail>(`/api/projects/${encodeURIComponent(projectId)}`);
          const currentJob = latest.jobs.find(item => item.id === job.id);
          if (currentJob?.status === 'failed') throw new Error(currentJob.error || '发布失败，请在发布页重试。');
          const release = latest.releases.find(item => item.id === currentJob?.input.releaseId);
          if (currentJob?.status === 'succeeded' && release?.status === 'succeeded' && release.url) {
            setDeployedUrl(release.url);
            break;
          }
          if (i === 29) setDeployError('发布任务仍在处理中，可前往发布页查看进度。');
        }
        if (onRefresh) await onRefresh();
      } catch (depErr: unknown) {
        const dmsg = depErr instanceof Error ? depErr.message : '自动发布任务排队中';
        setDeployError(dmsg);
      } finally {
        setDeploying(false);
      }
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : '像素级克隆生成失败，请稍后重试。';
      setGenError(msg);

    } finally {
      setGenerating(false);
    }
  }

  return (
    <fieldset disabled={generating || uploading} className="clone-editor" style={{ maxWidth: '1100px', width: '100%', minWidth: 0, border: 0, margin: '0 auto', padding: '1.5rem 0' }}>
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
              100% 像素级克隆与还原模式
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
              OPENAI VISION POWERED
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            🎯 目标网站/设计稿 1:1 像素级复刻
          </h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '13px', maxWidth: '680px' }}>
            输入您喜欢的竞品或参考网站 URL，或上传 Figma/原型设计图，AI 将 1:1 像素级逆向还原全站结构、Hero 展台、商品列表、导航交互与视觉规范。
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
              已自动同步企业资料与商品（将 100% 注入新网站）：
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
              目标参考网站 URL (可选)
            </h3>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
            输入需要 1:1 像素级克隆的目标站点地址，系统将自动嗅探抓取网站标题、导航链接、栏目排版与主体内容。
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="url"
              placeholder="例如: https://squishytoys.store 或 https://example.com"
              value={targetUrl}
              onChange={(e) => {
                setTargetUrl(e.target.value);
                syncConfig({ targetUrl: e.target.value });
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
              {scraping ? '嗅探中...' : '⚡ 实时嗅探抓取'}
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
                  ✅ 已成功解析目标站点结构
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
            支持同时拖入或多选页面设计图（index、products、product-detail、contact 等）及商品展台图。AI 将根据 Vision 视觉模型 1:1 精确复刻图片中的所有像素级排版细节。
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
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
            placeholder={`例如：\n100% 像素级还原参考设计稿的布局结构、配色与商品展台。\n将品牌名称设为「${draft.company.name || '我的品牌'}」，联系方式设为「${draft.company.email || 'contact@brand.com'}」。\n首页商品卡片保持紧凑纯净，点击后平滑跳转或展开商品详情。`}
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
              🤖 视觉逆向与生图/代码模型:
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

          {isSuccess && !generating && (
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
                    100% 像素级生成完成，且已自动部署至 Cloudflare！
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '3px' }}>
                    {deployedUrl ? (
                      <span>
                        线上访问地址:{' '}
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
                      <span>正在向 Cloudflare Pages 同步发布中，请稍候…</span>
                    ) : (
                      <span>已成功生成全站独立代码并同步至部署管线。</span>
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
                    🌐 打开线上网站 ↗
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
            <div style={{ padding: '24px 0' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e2e8f0',
                  borderTopColor: '#6366f1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '16px',
                }}
              />
              <div
                style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '8px' }}
              >
                OpenAI {selectedModel} 像素级逆向生成与自动部署中...
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    color: genStep >= 1 ? '#4f46e5' : '#94a3b8',
                    fontWeight: genStep === 1 ? 700 : 500,
                  }}
                >
                  ① 目标站点与设计图解析
                </span>
                <span style={{ color: '#cbd5e1' }}>→</span>
                <span
                  style={{
                    fontSize: '13px',
                    color: genStep >= 2 ? '#4f46e5' : '#94a3b8',
                    fontWeight: genStep === 2 ? 700 : 500,
                  }}
                >
                  ② 深度视觉分析
                </span>
                <span style={{ color: '#cbd5e1' }}>→</span>
                <span
                  style={{
                    fontSize: '13px',
                    color: genStep >= 3 ? '#4f46e5' : '#94a3b8',
                    fontWeight: genStep === 3 ? 700 : 500,
                  }}
                >
                  ③ 像素级代码逆向
                </span>
                <span style={{ color: '#cbd5e1' }}>→</span>
                <span
                  style={{
                    fontSize: '13px',
                    color: genStep >= 4 ? '#4f46e5' : '#94a3b8',
                    fontWeight: genStep === 4 ? 700 : 500,
                  }}
                >
                  ④ 自动部署至 Cloudflare
                </span>
              </div>
            </div>
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
                ? '🔄 重新 100% 像素级逆向生成并部署'
                : '🎯 开始 100% 像素级克隆生成并部署 (OpenAI Vision)'}
            </Button>
          )}
        </div>
      </div>
    </fieldset>
  );
}
