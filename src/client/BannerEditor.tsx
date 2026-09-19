import type { BannerTarget, Draft, PageBanner } from '../shared/model';
import { newBanner, pageBanners } from '../shared/banner-config';
import { plannedPages, pageLabel } from '../shared/site-brief';
import { AssetView, Button, Field, Icon } from './components';
export type BannerUploadSlot = 'slides' | 'video' | 'poster';
export const editableBanners = (draft: Draft) =>
  pageBanners(draft).length ? pageBanners(draft) : [newBanner('new-home', ['home'])];
export function BannerEditor({
  projectId,
  draft,
  disabled,
  onUpload,
  onChange,
}: {
  projectId: string;
  draft: Draft;
  disabled: boolean;
  onUpload: (id: string, slot: BannerUploadSlot, files: File[]) => void;
  onChange: (banners: PageBanner[]) => void;
}) {
  const banners = editableBanners(draft);
  const targets: { id: BannerTarget; label: string }[] = plannedPages(draft)
    .filter((page) => page !== 'detail')
    .map((page) => ({
      id: page,
      label: page === 'catalog' ? '产品列表页' : pageLabel(draft, page),
    }));
  const change = (id: string, patch: Partial<PageBanner>) =>
    onChange(banners.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const upload = (banner: PageBanner, slot: BannerUploadSlot, label: string) => (
    <label className={`button secondary upload-button ${disabled ? 'disabled' : ''}`}>
      <Icon name="upload" size={15} />
      {label}
      <input
        aria-label={label}
        type="file"
        disabled={disabled}
        multiple={slot === 'slides'}
        accept={slot === 'video' ? 'video/mp4,video/webm' : 'image/png,image/jpeg,image/webp'}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length) onUpload(banner.id, slot, files);
        }}
      />
    </label>
  );
  return (
    <section className="panel banner-editor">
      <div className="panel-title">
        <h3>页面 Banner / Hero 媒体</h3>
        <span>多页面 · 多图轮播 · 全屏视频</span>
      </div>
      <p className="muted">
        上传媒体后指定首页或独立页面，同一组可用于多个页面。商品详情页保持原设计。制作中或生成后均可修改，无需重新生成，保存预览后发布生效。
      </p>
      <div className="banner-config-list">
        {banners.map((banner, groupIndex) => (
          <article
            className="banner-config"
            key={banner.id}
            aria-label={`Banner 配置 ${groupIndex + 1}`}
          >
            <div className="panel-title">
              <h4>Banner {groupIndex + 1}</h4>
              <Button
                kind="quiet"
                disabled={disabled}
                onClick={() => onChange(banners.filter((b) => b.id !== banner.id))}
              >
                删除配置并恢复原设计
              </Button>
            </div>
            <fieldset disabled={disabled} className="banner-targets">
              <legend>应用到页面</legend>
              {targets.map((target) => {
                const used = banners.some(
                  (b) => b.id !== banner.id && b.targets.includes(target.id),
                );
                return (
                  <label key={target.id}>
                    <input
                      type="checkbox"
                      checked={banner.targets.includes(target.id)}
                      disabled={used || disabled}
                      onChange={(e) =>
                        change(banner.id, {
                          targets: e.target.checked
                            ? [...banner.targets, target.id]
                            : banner.targets.filter((id) => id !== target.id),
                        })
                      }
                    />
                    {target.label}
                    {used ? '（其他组已使用）' : ''}
                  </label>
                );
              })}
            </fieldset>
            {!banner.targets.length && (
              <p className="muted">尚未指定页面，媒体会保存到草稿，暂不显示在网站上。</p>
            )}
            <div className="form-grid">
              <Field label="媒体类型">
                <select
                  aria-label="媒体类型"
                  disabled={disabled}
                  value={banner.kind}
                  onChange={(e) =>
                    change(banner.id, { kind: e.target.value as PageBanner['kind'] })
                  }
                >
                  <option value="images">图片 / 多图轮播</option>
                  <option value="video">全屏视频背景</option>
                </select>
              </Field>
              {banner.kind === 'images' && (
                <Field label="展示方式">
                  <select
                    aria-label="展示方式"
                    disabled={disabled}
                    value={banner.mode}
                    onChange={(e) =>
                      change(banner.id, { mode: e.target.value as PageBanner['mode'] })
                    }
                  >
                    <option value="background">背景 · 保留标题与按钮</option>
                    <option value="image">整张图片 · 不叠加文字</option>
                  </select>
                </Field>
              )}
              {banner.kind === 'images' && (
                <Field label="区域高度">
                  <select
                    aria-label="区域高度"
                    disabled={disabled}
                    value={banner.height}
                    onChange={(e) =>
                      change(banner.id, { height: e.target.value as PageBanner['height'] })
                    }
                  >
                    <option value="auto">跟随页面 / 图片</option>
                    <option value="screen">全屏首屏</option>
                  </select>
                </Field>
              )}
              {banner.kind === 'images' && (
                <Field label="图片填充">
                  <select
                    aria-label="图片填充"
                    disabled={disabled}
                    value={banner.fit}
                    onChange={(e) =>
                      change(banner.id, { fit: e.target.value as PageBanner['fit'] })
                    }
                  >
                    <option value="cover">铺满（可能裁切）</option>
                    <option value="contain">完整显示（可能留边）</option>
                  </select>
                </Field>
              )}
              {(banner.kind === 'video' || banner.mode === 'background') && (
                <Field label="文字可读性">
                  <select
                    aria-label="文字可读性"
                    disabled={disabled}
                    value={banner.contrast}
                    onChange={(e) =>
                      change(banner.id, { contrast: e.target.value as PageBanner['contrast'] })
                    }
                  >
                    <option value="light">浅色遮罩 · 深色文字</option>
                    <option value="dark">深色遮罩 · 浅色文字</option>
                    <option value="none">原始颜色 · 无遮罩</option>
                  </select>
                </Field>
              )}
              <Field label="画面重点位置">
                <select
                  aria-label="画面重点位置"
                  disabled={disabled}
                  value={banner.position}
                  onChange={(e) =>
                    change(banner.id, { position: e.target.value as PageBanner['position'] })
                  }
                >
                  <option value="top">顶部</option>
                  <option value="center">居中</option>
                  <option value="bottom">底部</option>
                </select>
              </Field>
            </div>
            {banner.kind === 'images' && banner.mode === 'image' && (
              <div
                className="banner-mode-notice"
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  margin: '14px 0',
                  color: '#166534',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <span>🖼️</span>
                  <span>已启用「整张图片 · 不叠加文字」模式</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#15803d', lineHeight: 1.5 }}>
                  前台页面将仅展示完整的 Banner 图片，并自动隐藏模板原有的文字标题、副标题、按钮、卖点标签与浮动微卡片。
                  {banner.slides.length === 0 && (
                    <strong style={{ display: 'block', marginTop: '6px', color: '#b91c1c' }}>
                      ⚠️ 当前尚未上传图片：请在下方点击「上传 Banner 图片」添加图片。在上传图片前，前台也会隐藏默认文字与浮动卡片。
                    </strong>
                  )}
                </p>
              </div>
            )}
            {(banner.mode === 'background' || banner.kind === 'video') && (
              <details
                className="banner-custom-copy-details"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  margin: '16px 0',
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: '14px 18px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    fontWeight: 600,
                    listStyle: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>✏️</span>
                    <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#1e293b' }}>
                      首屏文字与按钮自定义（选填）
                    </span>
                    {(banner.eyebrow ||
                      banner.headline ||
                      banner.subtitle ||
                      banner.primaryButtonText ||
                      banner.primaryButtonUrl ||
                      banner.secondaryButtonText ||
                      banner.secondaryButtonUrl ||
                      (banner.tags && banner.tags.some(Boolean)) ||
                      (banner.floatingPills && banner.floatingPills.some(Boolean))) && (
                      <span
                        style={{
                          background: '#e0e7ff',
                          color: '#3730a3',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        已自定义
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    点击展开 / 折叠 ▾
                  </span>
                </summary>

                <div style={{ padding: '16px 18px', borderTop: '1px solid #e2e8f0' }}>
                  <p className="muted" style={{ margin: '0 0 14px', fontSize: '0.82rem' }}>
                    留空时使用整站默认文案与设置。填写后将直接覆盖所选页面的首屏徽标、标题、副标题、按钮及卖点标签。
                  </p>

                <div className="form-grid">
                  <Field label="顶部小徽标 (Eyebrow Badge)">
                    <input
                      aria-label="顶部小徽标"
                      maxLength={120}
                      placeholder="如：🧸 COMPACT SQUISHY FRIEND COLLECTION"
                      disabled={disabled}
                      value={banner.eyebrow || ''}
                      onChange={(e) => change(banner.id, { eyebrow: e.target.value })}
                    />
                  </Field>

                  <Field label="首屏主标题 (Headline)">
                    <input
                      aria-label="首屏主标题"
                      maxLength={200}
                      placeholder={draft.copy?.[draft.languages[0] || 'en']?.headline || '留空时使用全站主标题'}
                      disabled={disabled}
                      value={banner.headline || ''}
                      onChange={(e) => change(banner.id, { headline: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="首屏副标题 / 描述 (Subtitle)">
                  <textarea
                    aria-label="首屏副标题"
                    rows={3}
                    maxLength={500}
                    placeholder={draft.copy?.[draft.languages[0] || 'en']?.subtitle || '留空时使用全站副标题'}
                    disabled={disabled}
                    value={banner.subtitle || ''}
                    onChange={(e) => change(banner.id, { subtitle: e.target.value })}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                      主操作按钮 (Primary CTA)
                    </span>
                    <Field label="主按钮文字">
                      <input
                        aria-label="主按钮文字"
                        maxLength={50}
                        placeholder="如：探索全部萌趣玩具 ↗"
                        disabled={disabled}
                        value={banner.primaryButtonText || ''}
                        onChange={(e) => change(banner.id, { primaryButtonText: e.target.value })}
                      />
                    </Field>
                    <Field label="主按钮链接">
                      <input
                        aria-label="主按钮链接"
                        maxLength={200}
                        placeholder="如：catalog/index.html"
                        disabled={disabled}
                        value={banner.primaryButtonUrl || ''}
                        onChange={(e) => change(banner.id, { primaryButtonUrl: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                      次要按钮 (Secondary CTA)
                    </span>
                    <Field label="次按钮文字">
                      <input
                        aria-label="次按钮文字"
                        maxLength={50}
                        placeholder="如：索取样品与定制咨询 →"
                        disabled={disabled}
                        value={banner.secondaryButtonText || ''}
                        onChange={(e) => change(banner.id, { secondaryButtonText: e.target.value })}
                      />
                    </Field>
                    <Field label="次按钮链接">
                      <input
                        aria-label="次按钮链接"
                        maxLength={200}
                        placeholder="如：contact/index.html"
                        disabled={disabled}
                        value={banner.secondaryButtonUrl || ''}
                        onChange={(e) => change(banner.id, { secondaryButtonUrl: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '2px' }}>
                    特色卖点标签 (Quality Tags · 3项)
                  </span>
                  <p className="muted" style={{ margin: '0 0 8px', fontSize: '0.78rem' }}>
                    显示在按钮下方，用于体现安全认证、材质特质等。
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        aria-label={`卖点标签 ${idx + 1}`}
                        maxLength={60}
                        placeholder={['如：🌱 100% 无毒不含BPA', '如：🛡️ ASTM & EN71 认证', '如：☁️ 5秒柔和慢回弹'][idx]}
                        disabled={disabled}
                        value={banner.tags?.[idx] || ''}
                        onChange={(e) => {
                          const nextTags = [...(banner.tags || ['', '', ''])];
                          while (nextTags.length < 3) nextTags.push('');
                          nextTags[idx] = e.target.value;
                          change(banner.id, { tags: nextTags });
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '2px' }}>
                    右侧 3D 浮动微标签 (Floating Pills · 3项)
                  </span>
                  <p className="muted" style={{ margin: '0 0 8px', fontSize: '0.78rem' }}>
                    针对特色模版（如童趣乐园等）首屏右侧卡片上的浮动小标签。
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        aria-label={`浮动标签 ${idx + 1}`}
                        maxLength={60}
                        placeholder={['如：✨ 独家微爆珠软充', '如：🌈 温感变色黑科技', '如：☁️ 5s Slow-Rise'][idx]}
                        disabled={disabled}
                        value={banner.floatingPills?.[idx] || ''}
                        onChange={(e) => {
                          const nextPills = [...(banner.floatingPills || ['', '', ''])];
                          while (nextPills.length < 3) nextPills.push('');
                          nextPills[idx] = e.target.value;
                          change(banner.id, { floatingPills: nextPills });
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              </details>
            )}
            {banner.kind === 'images' ? (
              <>
                <div className="banner-slides">
                  {banner.slides.map((slide, index) => (
                    <div className="banner-slide-editor" key={`${slide.assetId}:${index}`}>
                      <AssetView
                        projectId={projectId}
                        assetId={slide.assetId}
                        alt={slide.alt || `Banner 图片 ${index + 1}`}
                      />
                      <Field label={`图片 ${index + 1} 的说明（Alt）`}>
                        <input
                          aria-label={`图片 ${index + 1} 的说明（Alt）`}
                          maxLength={300}
                          disabled={disabled}
                          value={slide.alt}
                          onChange={(e) =>
                            change(banner.id, {
                              slides: banner.slides.map((s, i) =>
                                i === index ? { ...s, alt: e.target.value } : s,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label={`幻灯片 ${index + 1} 顶部徽标（选填）`}>
                        <input
                          aria-label={`幻灯片 ${index + 1} 顶部徽标`}
                          maxLength={120}
                          placeholder="留空时使用 Banner 或全站设置"
                          disabled={disabled}
                          value={slide.eyebrow || ''}
                          onChange={(e) =>
                            change(banner.id, {
                              slides: banner.slides.map((s, i) =>
                                i === index ? { ...s, eyebrow: e.target.value } : s,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label={`幻灯片 ${index + 1} 独立主标题（选填）`}>
                        <input
                          aria-label={`幻灯片 ${index + 1} 独立主标题`}
                          maxLength={150}
                          placeholder="留空时使用整站默认主标题"
                          disabled={disabled}
                          value={slide.headline || ''}
                          onChange={(e) =>
                            change(banner.id, {
                              slides: banner.slides.map((s, i) =>
                                i === index ? { ...s, headline: e.target.value } : s,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label={`幻灯片 ${index + 1} 独立描述（选填）`}>
                        <input
                          aria-label={`幻灯片 ${index + 1} 独立描述`}
                          maxLength={300}
                          placeholder="留空时使用整站默认副标题"
                          disabled={disabled}
                          value={slide.subtitle || ''}
                          onChange={(e) =>
                            change(banner.id, {
                              slides: banner.slides.map((s, i) =>
                                i === index ? { ...s, subtitle: e.target.value } : s,
                              ),
                            })
                          }
                        />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <Field label="主按钮文字（选填）">
                          <input
                            aria-label={`幻灯片 ${index + 1} 按钮文字`}
                            maxLength={50}
                            placeholder="如：立即咨询"
                            disabled={disabled}
                            value={slide.buttonText || ''}
                            onChange={(e) =>
                              change(banner.id, {
                                slides: banner.slides.map((s, i) =>
                                  i === index ? { ...s, buttonText: e.target.value } : s,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="主按钮链接（选填）">
                          <input
                            aria-label={`幻灯片 ${index + 1} 按钮链接`}
                            maxLength={200}
                            placeholder="如：contact/index.html"
                            disabled={disabled}
                            value={slide.buttonUrl || ''}
                            onChange={(e) =>
                              change(banner.id, {
                                slides: banner.slides.map((s, i) =>
                                  i === index ? { ...s, buttonUrl: e.target.value } : s,
                                ),
                              })
                            }
                          />
                        </Field>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <Field label="次按钮文字（选填）">
                          <input
                            aria-label={`幻灯片 ${index + 1} 次按钮文字`}
                            maxLength={50}
                            placeholder="如：索取样品"
                            disabled={disabled}
                            value={slide.secondaryButtonText || ''}
                            onChange={(e) =>
                              change(banner.id, {
                                slides: banner.slides.map((s, i) =>
                                  i === index ? { ...s, secondaryButtonText: e.target.value } : s,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="次按钮链接（选填）">
                          <input
                            aria-label={`幻灯片 ${index + 1} 次按钮链接`}
                            maxLength={200}
                            placeholder="如：contact/index.html"
                            disabled={disabled}
                            value={slide.secondaryButtonUrl || ''}
                            onChange={(e) =>
                              change(banner.id, {
                                slides: banner.slides.map((s, i) =>
                                  i === index ? { ...s, secondaryButtonUrl: e.target.value } : s,
                                ),
                              })
                            }
                          />
                        </Field>
                      </div>
                      <div className="banner-slide-actions">
                        <Button
                          kind="quiet"
                          disabled={disabled || index === 0}
                          onClick={() => {
                            const slides = [...banner.slides];
                            [slides[index - 1], slides[index]] = [slides[index], slides[index - 1]];
                            change(banner.id, { slides });
                          }}
                        >
                          前移
                        </Button>
                        <Button
                          kind="quiet"
                          disabled={disabled || index === banner.slides.length - 1}
                          onClick={() => {
                            const slides = [...banner.slides];
                            [slides[index + 1], slides[index]] = [slides[index], slides[index + 1]];
                            change(banner.id, { slides });
                          }}
                        >
                          后移
                        </Button>
                        <Button
                          kind="quiet"
                          disabled={disabled}
                          onClick={() =>
                            change(banner.id, {
                              slides: banner.slides.filter((_, i) => i !== index),
                            })
                          }
                        >
                          移除图片
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {banner.slides.length < 12 &&
                  upload(banner, 'slides', '上传 Banner 图片（可多选）')}
                <p className="muted">
                  支持 PNG、JPEG、WebP；每组最多 12
                  张。多张自动组成轮播，支持手动切换和暂停。单张保持静态；整图轮播使用统一宽高比，可选择完整显示避免裁切。
                </p>
                {banner.slides.length > 1 && (
                  <Field label="轮播间隔（秒）">
                    <select
                      aria-label="轮播间隔（秒）"
                      disabled={disabled}
                      value={banner.interval}
                      onChange={(e) => change(banner.id, { interval: Number(e.target.value) })}
                    >
                      {[3, 5, 8, 10, 15, 20, 30].map((n) => (
                        <option key={n} value={n}>
                          {n} 秒
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </>
            ) : (
              <>
                <div className="banner-video-editor">
                  <AssetView
                    projectId={projectId}
                    assetId={banner.videoAssetId}
                    alt="Banner 背景视频"
                    video
                  />
                  {upload(banner, 'video', banner.videoAssetId ? '替换背景视频' : '上传背景视频')}
                </div>
                <p className="muted">
                  MP4 /
                  WebM，静音循环，覆盖屏幕宽高并裁切画面，避免左右留边。建议上传轻量横屏视频；减少动态效果或自动播放受限时，可手动播放。
                </p>
                <div className="banner-poster-editor">
                  {banner.posterAssetId && (
                    <AssetView
                      projectId={projectId}
                      assetId={banner.posterAssetId}
                      alt="视频封面"
                    />
                  )}
                  {upload(
                    banner,
                    'poster',
                    banner.posterAssetId ? '替换视频封面' : '上传视频封面（建议）',
                  )}
                  {banner.posterAssetId && (
                    <Button
                      kind="quiet"
                      disabled={disabled}
                      onClick={() => change(banner.id, { posterAssetId: undefined })}
                    >
                      移除封面
                    </Button>
                  )}
                </div>
              </>
            )}
            {(banner.kind === 'video' || banner.slides.length > 1) && (
              <label className="banner-autoplay">
                <input
                  type="checkbox"
                  checked={banner.autoplay}
                  disabled={disabled}
                  onChange={(e) => change(banner.id, { autoplay: e.target.checked })}
                />
                自动播放（遵循系统减少动态效果设置）
              </label>
            )}
          </article>
        ))}
      </div>
      {banners.length < 20 && (
        <Button
          disabled={disabled}
          onClick={() => onChange([...banners, newBanner(crypto.randomUUID())])}
        >
          <Icon name="plus" />
          添加 Banner 配置
        </Button>
      )}
    </section>
  );
}
