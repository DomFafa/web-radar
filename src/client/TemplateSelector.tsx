import React, { useState } from 'react';
import type { Draft, TemplateId } from '../shared/model';
import { Button, Icon } from './components';
import { templateMediaRequirements } from '../shared/template-media';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  englishName: string;
  tagline: string;
  category: 'consumer' | 'tech' | 'enterprise' | 'creative';
  industries: string[];
  features: string[];
  accentColor: string;
  badge: string;
  hasVideo?: boolean;
  previewImg: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'senseng-clean',
    name: 'Senseng 经典工贸',
    englishName: 'Senseng Clean Trade',
    tagline: '参考 webimg 原案；高雅明亮排版，强化货架视觉与批发询盘',
    category: 'consumer',
    industries: ['跨境工贸', '消费玩具', '日用百货', '家居收纳', '快消品'],
    features: ['按设计图重建', '左文右图 Hero 展位', '8宫格品类橱窗', '快速询盘表单'],
    accentColor: '#089ced',
    badge: '参考设计图 · 首选模版',
    previewImg: '/templates/previews/senseng-clean.jpg',
  },
  {
    id: 'senseng-video',
    name: 'Senseng 全屏视频版',
    englishName: 'Senseng Immersive Video',
    tagline: '模版 1 动感升级：首屏 100vh 全屏视频背景铺满，带呼吸感大标题与平滑下滚',
    category: 'consumer',
    industries: ['品牌出海', '精品独立站', '潮流消费品', '生态家居', '外贸工厂'],
    features: ['100vh 动态视频全屏铺满', '半透明磨砂质感浮层', '平滑下滚引导箭头', '声画动效控制'],
    accentColor: '#0284c7',
    badge: '首屏动态视频 · 沉浸震撼',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'senseng-candy',
    name: 'Senseng 缤纷糖果乐园',
    englishName: 'Senseng Candy Pop & Play',
    tagline: '专为儿童萌趣玩具与触感解压公仔定制；马卡龙粉彩体系、立体圆角泡泡与感官触觉矩阵',
    category: 'consumer',
    industries: ['儿童玩具', '萌宠解压', '感官潮玩', '亲子母婴', '外贸出口'],
    features: ['马卡龙糖果配色', '左右分栏萌趣舞台', '4大感官魔力标签', '立体糖果展台网格'],
    accentColor: '#ff6b8b',
    badge: '童趣感官玩具 · 爆款首选',
    previewImg: '/templates/previews/senseng-candy.jpg',
  },
  {
    id: 'senseng-wonder',
    name: 'Senseng 北欧温润工坊',
    englishName: 'Senseng Nordic Wonder Studio',
    tagline: '专为品质玩具独立站与全龄桌面疗愈设计；温暖奶油大地色、北欧便当盒画廊与波浪有机曲线',
    category: 'consumer',
    industries: ['益智玩具', '治愈解压', '精品独立站', '生活美学潮玩', '品牌代工'],
    features: ['全屏画卷轮播', '北欧便当盒画廊', '波浪有机曲线分割', '材质工艺与FAQ'],
    accentColor: '#f77f00',
    badge: '北欧温润绘本 · 精品独立站',
    previewImg: '/templates/previews/senseng-wonder.jpg',
  },
  {
    id: 'senseng-arcade',
    name: 'Senseng 霓虹赛博潮玩',
    englishName: 'Senseng Cyber Arcade & Pop',
    tagline: '机能潮玩机甲 HUD 与电光霓虹；物理触感动态进度条、实时跑数与赛博盲盒展台',
    category: 'consumer',
    industries: ['潮流盲盒', '机能玩具', '极客解压', '电竞桌面潮玩', '外贸直采'],
    features: ['赛博HUD仪表台', '物理参数动态进度条', '实时跑数计数器', '街机芯片卡片'],
    accentColor: '#00f5d4',
    badge: '机能赛博潮玩 · 动态跑数',
    previewImg: '/templates/previews/senseng-arcade.jpg',
  },
  {
    id: 'senseng-nature',
    name: 'Senseng 森林原野工坊',
    englishName: 'Senseng Botanical & Forest',
    tagline: '零塑环保自然主义；晨露鼠尾草绿、生态减碳动态进度条、波浪曲线与植物画册瀑布流',
    category: 'consumer',
    industries: ['母婴玩具', '环保可降解', '自然生活美学', '绿色供应链', '亲子早教'],
    features: ['柔和波浪弧线', '生态减碳进度条', '晨雾滑入动效', '植物标本瀑布流'],
    accentColor: '#4a7c59',
    badge: '零塑环保自然 · 动态减碳条',
    previewImg: '/templates/previews/senseng-nature.jpg',
  },
  {
    id: 'senseng-minimal',
    name: 'Senseng 瑞士极简生活馆',
    englishName: 'Senseng Swiss Minimal Gallery',
    tagline: '瑞士现代主义大留白与艺术品展台；精密阻尼刻度条、典藏编号序列与奢品解构详情',
    category: 'creative',
    industries: ['艺术潮玩', '设计师买手店', '奢品感官生活', '现代家居', '高端礼品'],
    features: ['艺术馆聚光灯展台', '精密材料学阻尼刻度', '编号典藏展签', '奢品级单品解构'],
    accentColor: '#c59b27',
    badge: '瑞士极简画廊 · 奢品级解构',
    previewImg: '/templates/previews/senseng-minimal.jpg',
  },
  {
    id: 'juno-toys',
    name: 'Juno 儿童童趣玩具',
    englishName: 'Juno Playful Toys',
    tagline: '参考 Juno Toys；天空蓝云朵首屏、圆润字体与童趣选品卡片',
    category: 'consumer',
    industries: ['儿童玩具', '母婴亲子', '益智教具', '文具礼品', '少儿生活消费'],
    features: ['天空蓝云朵首屏', 'Quicksand 圆润字体', '圆形分类卡片', '自动绑定产品图片'],
    accentColor: '#267cce',
    badge: '温暖童趣 · 亲子家庭最爱',
    previewImg: '/templates/previews/juno-toys.jpg',
  },
  {
    id: 'saas-automation',
    name: 'SaaS 智能自动化',
    englishName: 'Automation SaaS Tailwind',
    tagline: '参考 automation-saas-tailwind；浅色视频首屏、悬浮胶囊导航与玻璃面板',
    category: 'tech',
    industries: ['SaaS 软件', '云计算', '开发者工具', '自动化平台', '出海软件'],
    features: ['参考站原版视频', '悬浮圆角导航', '玻璃展示面板', '自动绑定产品图片'],
    accentColor: '#bef264',
    badge: '原版动态视频 · 清透浅色',
    hasVideo: true,
    previewImg: '/templates/previews/saas-automation.jpg',
  },
  {
    id: 'fintech-platform',
    name: '金融资产管理平台',
    englishName: 'Fintech Management',
    tagline: '参考 financial-management-platform；蓝色渐变圆角首屏，叠层展示与通透卡片',
    category: 'enterprise',
    industries: ['金融科技', '跨境支付', '财富管理', '数字银行', '企业财资'],
    features: ['蓝色渐变首屏', '叠层产品视觉', '圆角胶囊导航', '自动绑定产品图片'],
    accentColor: '#142e6e',
    badge: '金融蓝渐变 · 通透叠层',
    previewImg: '/templates/previews/fintech-platform.jpg',
  },
  {
    id: 'digital-marketing',
    name: '数字营销增长机构',
    englishName: 'Digital Growth Agency',
    tagline: '参考 digital-marketing；灰白机械背景、黑色大标题与留白排版',
    category: 'creative',
    industries: ['数字营销', '广告代投', '品牌出海 Agency', 'SEO/内容服务', '创意设计'],
    features: ['灰白机械首屏', '黑白圆角按钮', '服务与案例版块', '自动绑定产品图片'],
    accentColor: '#202020',
    badge: '高转化视觉 · 增长首选',
    previewImg: '/templates/previews/digital-marketing.jpg',
  },
  {
    id: 'porto-accounting',
    name: 'Porto 经典财税会计',
    englishName: 'Porto Corporate Accounting',
    tagline: '参考 Porto demo-accounting-1；按指定浅粉配色还原，大圆角双栏首屏',
    category: 'enterprise',
    industries: ['会计审计', '涉外财税', '法律咨询', '企业并购顾问', '专业服务大所'],
    features: ['浅粉与深红配色', 'Lexend 字体', '圆角双栏首屏', '自动绑定产品图片'],
    accentColor: '#d90a2c',
    badge: '经典大所风范 · 严谨沉稳',
    previewImg: '/templates/previews/porto-accounting.jpg',
  },
  {
    id: 'crafto-corporate',
    name: 'Crafto 现代企业集团',
    englishName: 'Crafto Flagship Corporate',
    tagline: '参考 Themezaa Crafto；商务摄影、深蓝同心圆与橙紫渐变按钮',
    category: 'creative',
    industries: ['跨国集团', '高端咨询', '大型上市公司', '现代工业投资', '城市基建'],
    features: ['商务摄影首屏', '深蓝同心圆', '橙紫渐变按钮', '自动绑定产品图片'],
    accentColor: '#3c2fc0',
    badge: '商务摄影 · 现代企业',
    previewImg: '/templates/previews/crafto-corporate.jpg',
  },
  {
    id: 'corpox-ai-agency',
    name: 'Corpox AI 智能工坊',
    englishName: 'Corpox Next-Gen AI Studio',
    tagline: '参考 Corpox AI Agency；浅粉同心拱形背景、珊瑚红按钮与居中大字',
    category: 'tech',
    industries: ['AI 大模型', '具身智能 / 机器人', '机器视觉', '算法实验室', '硬核前沿科技'],
    features: ['浅粉同心拱形', '珊瑚红强调色', '居中大字排版', '自动绑定产品图片'],
    accentColor: '#ef6464',
    badge: '浅粉珊瑚 · AI 创意',
    previewImg: '/templates/previews/corpox-ai-agency.jpg',
  },
  {
    id: 'corpox-consulting',
    name: 'Corpox 顶级战略咨询',
    englishName: 'Corpox Strategic Advisory',
    tagline: '参考 Corpox Consulting；全宽商务摄影、深色蒙层与紫色强调',
    category: 'enterprise',
    industries: ['管理咨询', '战略规划', '商业智库', '组织变革', '高管领导力'],
    features: ['全宽商务摄影', '紫色高亮标题', '深色渐变蒙层', '自动绑定产品图片'],
    accentColor: '#5237f9',
    badge: '商务咨询 · 紫色强调',
    previewImg: '/templates/previews/corpox-consulting.jpg',
  },
];

const PRESET_COLORS = [
  { label: '品牌天蓝', value: '#089ced' },
  { label: '科技靛蓝', value: '#6366f1' },
  { label: '波尔多红', value: '#d90a2c' },
  { label: '克莱因蓝', value: '#0047ff' },
  { label: '活力暖黄', value: '#eab308' },
  { label: '霓虹青碧', value: '#06b6d4' },
  { label: '洋红极光', value: '#d946ef' },
  { label: '庄严深蓝', value: '#0f2b59' },
  { label: '自然墨绿', value: '#416851' },
];

const CATEGORIES = [
  { id: 'all', label: '全部模版 (15)' },
  { id: 'consumer', label: '潮玩玩具与工贸 (6)' },
  { id: 'tech', label: '科技与 SaaS (2)' },
  { id: 'enterprise', label: '金融与企服 (3)' },
  { id: 'creative', label: '艺术与创意生活 (4)' },
] as const;

export function TemplateSelector({
  draft,
  onUpdateDraft,
  onProceedToPublish,
  onBackToBasics,
  onSwitchToClone,
  onPreview,
}: {
  draft: Draft;
  onUpdateDraft: (patch: Partial<Draft>) => void;
  onProceedToPublish: () => void;
  onBackToBasics: () => void;
  onSwitchToClone?: () => void;
  onPreview: (template: TemplateDefinition) => void;
}) {
  const currentTemplate = draft.template || 'senseng-clean';
  const media = templateMediaRequirements[currentTemplate];
  const selectedTemplate = TEMPLATES.find((template) => template.id === currentTemplate);
  const currentColor = draft.brandColor || '#089ced';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = TEMPLATES.filter((tmpl) =>
    selectedCategory === 'all' ? true : tmpl.category === selectedCategory,
  );

  return (
    <div className="template-selector-container">
      <div className="template-step-header">
        <div>
          <span className="step-tag">极速建站分支 · 第 2 步 / 共 3 步</span>
          <h2>选择网站模版与品牌调色</h2>
          <p className="step-subtitle">
            共提供 15
            套精心设计的高保真行业模版（含赛博机能潮玩、森林原野、瑞士极简画廊、童趣糖果乐园、北欧温润、动态视频等）。选中后将自动灌注你的公司与产品数据。
          </p>
        </div>

        <div
          className="branch-switch-badge"
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {onSwitchToClone && (
            <Button
              kind="quiet"
              onClick={onSwitchToClone}
              style={{ color: '#4f46e5', fontWeight: 700 }}
            >
              <span>🎯 切换为 设计稿还原</span>
            </Button>
          )}
        </div>
      </div>

      {/* 像素级克隆专属横幅 */}
      {onSwitchToClone && (
        <div
          onClick={onSwitchToClone}
          style={{
            background:
              'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1.5px dashed #6366f1',
            borderRadius: '14px',
            padding: '16px 20px',
            margin: '16px 0 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = '#4338ca')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px' }}>🎯</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>
                没有看中现成模版？试试「设计稿还原模式」
              </div>
              <div style={{ fontSize: '12px', color: '#4338ca', marginTop: '3px' }}>
                上传整套页面设计图与产品素材，参考网址可补充文字内容；生成后对照预览检查布局与图片。
              </div>
            </div>
          </div>
          <Button
            kind="primary"
            style={{ background: '#4f46e5', fontSize: '13px', padding: '6px 16px' }}
          >
            立即开启克隆模式 →
          </Button>
        </div>
      )}

      {media && (
        <section className="template-media-guide" aria-label="当前模板素材清单">
          <h3>{selectedTemplate?.name} · 素材准备清单</h3>
          <p>
            产品主图每款 1
            张，已有产品图片会自动使用；同一图片可以复用到多个展示位置。以下为建议尺寸（宽 ×
            高，单位 px），无需按展示位置重复上传。
          </p>
          <dl className="template-media-summary">
            <div>
              <dt>产品图片</dt>
              <dd>
                建议 {media.productCount} 张不同产品主图 · {media.productSize}
              </dd>
              <small>按实际产品数量准备，少于建议数量也可使用模板。</small>
            </div>
            <div>
              <dt>首页 Banner（选填）</dt>
              <dd>{media.bannerSize} · 1 张；轮播 2–12 张</dd>
              <small>{media.bannerNote} 多图保持相同比例。</small>
            </div>
            <div>
              <dt>视频背景（选填）</dt>
              <dd>{media.videos ? `内置 ${media.videos} 段视频；无需额外上传` : '默认无需视频'}</dd>
              <small>
                自定义全屏背景：每组 1 段 MP4 / WebM，建议 2560 × 1440（16:9，适配 27–32 寸大屏及 4K），另备 1
                张同尺寸封面。超宽屏可用 3840 × 2160，边缘预留安全裁切空间。
              </small>
            </div>
            <div>
              <dt>品牌素材（选填）</dt>
              <dd>Logo 1 张 · 建议 600 × 200；网站图标 1 张 · 建议 512 × 512</dd>
              <small>图片支持 PNG / JPEG / WebP；透明 Logo 优先 PNG。网站图标也支持 ICO。</small>
            </div>
          </dl>
          <details key={currentTemplate}>
            <summary>
              查看模板展示图的数量与原始尺寸（
              {media.slots.reduce((sum, slot) => sum + slot.count, 0)} 处）
            </summary>
            <p>
              这些位置由产品主图自动填充；没有产品图片时使用内置示例图。尺寸用于了解原设计比例，不是分别上传的入口。装饰图与背景已内置。
            </p>
            <ul className="template-slot-sizes">
              {media.slots.map((slot) => (
                <li key={`${slot.width}-${slot.height}`}>
                  <strong>{slot.count} 处</strong>
                  <span>
                    {slot.width} × {slot.height} px
                  </span>
                </li>
              ))}
            </ul>
          </details>
          <p className="template-media-help">
            产品图在「资料与产品」上传；替换首页或独立页面的背景、轮播及视频，在「页面 Banner /
            视频」设置。背景上的文字与按钮由页面呈现，建议上传不带文字的素材。
          </p>
        </section>
      )}

      {/* 分类筛选 Tab 栏 */}
      <div className="template-category-filters" role="group" aria-label="模板分类">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 模版卡片选择区域 */}
      <div
        className="template-cards-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))' }}
      >
        {filteredTemplates.map((tmpl) => {
          const requirements = templateMediaRequirements[tmpl.id];
          const isSelected = currentTemplate === tmpl.id;
          return (
            <div
              key={tmpl.id}
              className={`template-card ${isSelected ? 'selected' : ''}`}
              onClick={() =>
                onUpdateDraft({
                  buildBranch: 'template',
                  template: tmpl.id,
                  brandColor: tmpl.accentColor,
                })
              }
              onKeyDown={(event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === 'Enter' || event.key === ' ')
                ) {
                  event.preventDefault();
                  onUpdateDraft({
                    buildBranch: 'template',
                    template: tmpl.id,
                    brandColor: tmpl.accentColor,
                  });
                }
              }}
              role="button"
              tabIndex={0}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div
                className="template-card-badge"
                style={{ background: tmpl.hasVideo ? '#4f46e5' : undefined }}
              >
                {tmpl.badge}
              </div>

              {/* 真实模版视觉缩略图 */}
              <div
                className="template-mockup-preview"
                style={{
                  position: 'relative',
                  height: '210px',
                  overflow: 'hidden',
                  borderRadius: '8px 8px 0 0',
                  background: '#f8fafc',
                }}
              >
                <img
                  src={tmpl.previewImg}
                  alt={tmpl.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    transition: 'transform 0.3s ease',
                  }}
                />
                {tmpl.hasVideo && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(7, 59, 145, 0.88)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      zIndex: 2,
                    }}
                  >
                    <span>▶</span> 动态视频首屏
                  </div>
                )}
              </div>

              <div className="template-card-body" style={{ flex: 1 }}>
                <div className="template-name-row">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{tmpl.name}</h3>
                    <span className="template-en-name">{tmpl.englishName}</span>
                  </div>
                  {isSelected && (
                    <span className="selected-indicator">
                      <Icon name="check" size={16} /> 已选用
                    </span>
                  )}
                </div>

                <p className="template-tagline" style={{ minHeight: '44px' }}>
                  {tmpl.tagline}
                </p>

                <div className="template-tags">
                  {tmpl.industries.map((ind) => (
                    <span key={ind} className="industry-tag">
                      {ind}
                    </span>
                  ))}
                </div>

                {requirements && (
                  <div className="template-media-card" aria-label={`${tmpl.name}素材要求`}>
                    <strong>图片 / 视频准备</strong>
                    <span>
                      产品图：建议 {requirements.productCount} 张 · {requirements.productSize}
                    </span>
                    <span>Banner：选填 1 张 · {requirements.bannerSize}</span>
                    <span>
                      视频：
                      {requirements.videos
                        ? `已内置 ${requirements.videos} 段 · 可用 2560 × 1440 替换首页背景`
                        : '默认 0 段；可自行添加全屏背景'}
                    </span>
                    <small>选中模板查看完整清单；产品图会自动复用。</small>
                  </div>
                )}

                <ul className="template-feature-list">
                  {tmpl.features.map((feat) => (
                    <li key={feat}>
                      <Icon name="check" size={13} /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="template-card-footer"
                style={{ marginTop: 'auto', display: 'flex', gap: 10 }}
              >
                <Button
                  kind="quiet"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPreview(tmpl);
                  }}
                  aria-label={`预览 ${tmpl.name}`}
                >
                  <Icon name="eye" size={16} /> 预览模版
                </Button>
                <button
                  type="button"
                  className={`select-tmpl-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateDraft({
                      buildBranch: 'template',
                      template: tmpl.id,
                      brandColor: tmpl.accentColor,
                    });
                  }}
                >
                  {isSelected ? '✓ 当前已选用' : '选用此模版'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 品牌主色调选择 */}
      <div className="brand-color-section panel" style={{ marginTop: '32px' }}>
        <div className="panel-title">
          <span className="section-index">★</span>
          <h3>品牌主色调 (Brand Color)</h3>
          <span>应用于网站导航高亮、按钮、视觉线条与联系卡片</span>
        </div>

        <div className="brand-color-controls">
          <div className="color-preset-pills">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`color-pill ${currentColor === c.value ? 'selected' : ''}`}
                onClick={() => onUpdateDraft({ brandColor: c.value })}
              >
                <span className="color-circle" style={{ backgroundColor: c.value }} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="custom-color-picker">
            <span>自定义取色：</span>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onUpdateDraft({ brandColor: e.target.value })}
              title="选择自定义主色调"
            />
            <code className="color-code">{currentColor.toUpperCase()}</code>
          </div>
        </div>
      </div>

      {/* 底部导航与操作栏 */}
      <div className="template-action-bar">
        <Button kind="quiet" onClick={onBackToBasics}>
          <Icon name="back" />
          返回修改资料与产品
        </Button>

        <div className="action-bar-right">
          <Button
            kind="primary"
            onClick={() => {
              onUpdateDraft({ templateConfirmed: true });
              onProceedToPublish();
            }}
          >
            生成并进入预览发布 (第 3 步)
            <Icon name="arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}
