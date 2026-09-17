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
  const targets: { id: BannerTarget; label: string }[] = [
    ...plannedPages(draft).map((page) => ({
      id: page,
      label: page === 'detail' ? '全部产品详情页' : pageLabel(draft, page),
    })),
    ...draft.products.map((p) => ({
      id: `product:${p.id}` as BannerTarget,
      label: `产品：${p.name || p.id}`,
    })),
  ];
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
        上传媒体后指定页面。同一组可用于多个页面；特定产品的配置优先于「全部产品详情页」。制作中或生成后均可修改，无需重新生成，保存预览后发布生效。
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
