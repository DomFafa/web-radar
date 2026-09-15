import { useState } from 'react';
import type { DesignPage, Draft, Job } from '../shared/model';
import { designPageIds, designsConfirmed, homeConfirmed } from '../shared/site-design';
import { pageLabel, plannedPages } from '../shared/site-brief';
import { AssetView, Button, Field, Icon, Modal, Notice, SectionTitle } from './components';

export function PageDesign({
  projectId,
  draft,
  jobs,
  disabled,
  contentReady,
  availableImages,
  imageConfigured,
  onBackToBrief,
  onGenerate,
  onConfirm,
  onNext,
}: {
  projectId: string;
  draft: Draft;
  jobs: Job[];
  disabled: boolean;
  contentReady: boolean;
  availableImages: number;
  imageConfigured: boolean;
  onBackToBrief: () => void;
  onGenerate: (page: DesignPage | 'remaining', instructions?: string) => void;
  onConfirm: (target: 'home' | 'all') => void;
  onNext: () => void;
}) {
  const [instructions, setInstructions] = useState<Partial<Record<DesignPage, string>>>({});
  const [view, setView] = useState<DesignPage | null>(null);
  const design = draft.siteDesign;
  const pages = design?.pageIds ? [...designPageIds(design)] : plannedPages(draft);
  const homeReady = homeConfirmed(design);
  const allReady = pages.every((id) => !!design?.pages[id]?.imageAssetId);
  const confirmed = designsConfirmed(design);
  const active = (page: DesignPage) =>
    jobs.some(
      (j) =>
        j.id === design?.pages[page]?.jobId && ['queued', 'running', 'unknown'].includes(j.status),
    );
  const pending = pages.some(active);
  const missing = pages.filter((id) => id !== 'home' && !design?.pages[id]?.imageAssetId).length;
  const blocked = disabled || !contentReady || !imageConfigured;
  const card = (page: DesignPage, index: number) => {
    const label = pageLabel(draft, page);
    return (
      <article
        className={`scene-card page-design-card ${page === 'home' ? 'page-design-home' : ''}`}
        key={page}
      >
        <div className="scene-cover page-design-cover">
          {design?.pages[page]?.imageAssetId ? (
            <AssetView
              projectId={projectId}
              assetId={design.pages[page]!.imageAssetId}
              alt={`${label}设计稿`}
              variant="preview"
              lazy={page !== 'home'}
              onOpen={() => setView(page)}
            />
          ) : (
            <div className="page-design-placeholder">
              <Icon name={active(page) ? 'clock' : 'image'} size={32} />
              <strong>{active(page) ? '正在生成设计稿' : label}</strong>
              <small>{page === 'home' ? '先确定首页的视觉风格' : '沿用已确认首页的风格'}</small>
            </div>
          )}
          <span>PAGE {String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="scene-fields">
          <div className="panel-title">
            <h3>{label}</h3>
            {page === 'home' && homeReady && <span className="pill green">风格已确认</span>}
          </div>
          <Field label="本页修改要求">
            <textarea
              rows={2}
              maxLength={4000}
              value={instructions[page] ?? ''}
              onChange={(e) =>
                setInstructions((current) => ({ ...current, [page]: e.target.value }))
              }
              placeholder="例如：增大产品图片、调整标题位置、减少装饰"
            />
          </Field>
          <Button
            disabled={
              blocked ||
              active(page) ||
              availableImages < 1 ||
              (page !== 'home' && !homeReady) ||
              (page === 'home' && pending)
            }
            onClick={() => onGenerate(page, instructions[page])}
          >
            <Icon name="spark" size={15} />
            {active(page)
              ? '生成中…'
              : design?.pages[page]?.imageAssetId
                ? '重新生成 · 1 张'
                : '生成设计稿 · 1 张'}
          </Button>
          {page === 'home' && (
            <Button
              kind="primary"
              disabled={
                disabled || !design?.pages.home?.imageAssetId || active('home') || homeReady
              }
              onClick={() => onConfirm('home')}
            >
              <Icon name="check" size={15} />
              {homeReady ? '首页风格已确认' : '确认首页风格'}
            </Button>
          )}
        </div>
      </article>
    );
  };
  return (
    <>
      <SectionTitle
        eyebrow="第 4 步 / 共 5 步"
        title="页面设计稿"
        description={`先确定首页，再沿用统一风格生成方案中的其余 ${pages.length - 1} 类页面。确认设计后制作静态网站。`}
      />
      <section className="panel">
        <div className="panel-title">
          <span className="section-index">A</span>
          <h3>已确认的设计方向</h3>
          <div className="panel-title-actions">
            <Button kind="quiet" onClick={onBackToBrief} disabled={disabled}>
              返回修改方案
            </Button>
          </div>
        </div>
        <p>{draft.consultation?.brief?.visualDirection || draft.direction}</p>
        {draft.consultation?.brief?.layout && (
          <p className="muted">{draft.consultation.brief.layout}</p>
        )}
        {!contentReady && (
          <Notice tone="warning">请先完成需求沟通并确认网站方案，再生成页面设计稿。</Notice>
        )}
        {!imageConfigured && <Notice tone="warning">图片生成服务尚未配置，请联系管理员。</Notice>}
        {availableImages < 1 && (
          <Notice tone="warning">图片额度不足，请联系管理员增加额度。</Notice>
        )}
      </section>
      <section className="panel">
        <div className="panel-title">
          <span className="section-index">B</span>
          <h3>首页 · 确定视觉方向</h3>
        </div>
        {card('home', 0)}
      </section>
      <section className="panel">
        <div className="panel-title">
          <span className="section-index">C</span>
          <h3>其余页面</h3>
          <div className="panel-title-actions">
            <Button
              disabled={blocked || !homeReady || pending || !missing || availableImages < missing}
              onClick={() => onGenerate('remaining')}
            >
              <Icon name="spark" />
              生成缺少的页面 · {missing} 张
            </Button>
          </div>
        </div>
        {!homeReady && <Notice>确认首页后，再沿用相同的字体、配色和导航生成其余页面。</Notice>}
        <div className="page-design-grid">
          {pages.slice(1).map((page, index) => card(page, index + 1))}
        </div>
        <div className="step-footer">
          <p>产品详情设计会应用到每个产品。检查图片和资料一致性；重做任意页面后需要再次确认。</p>
          <Button
            kind="primary"
            disabled={disabled || !homeReady || !allReady || pending || confirmed}
            onClick={() => onConfirm('all')}
          >
            <Icon name="check" />
            {confirmed ? '整组设计稿已确认' : `确认 ${pages.length} 张设计稿`}
          </Button>
        </div>
      </section>
      <div className="step-footer">
        <p>{confirmed ? '设计稿已确认，可以开始制作网站。' : '完成设计确认后进入网站生成。'}</p>
        <Button disabled={!confirmed || disabled} onClick={onNext}>
          生成与预览网站
          <Icon name="arrow" />
        </Button>
      </div>
      {view && (
        <Modal wide title={`${pageLabel(draft, view)}设计稿`} onClose={() => setView(null)}>
          <div className="design-image-preview">
            <AssetView
              projectId={projectId}
              assetId={design?.pages[view]?.imageAssetId}
              alt={`${pageLabel(draft, view)}设计稿`}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
