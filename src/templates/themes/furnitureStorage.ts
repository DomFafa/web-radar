import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export interface ThemedFurnitureItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  timberHardwareSpec: string;
  dimensionsLoadSpec: string;
  joineryMechanismDetail: string;
  moq: string;
  tagline: string;
  img: string;
}

export const FURNITURE_DEFAULT_PRODUCTS: ThemedFurnitureItem[] = [
  {
    id: 'fur-1',
    name: 'Solid North American Black Walnut Bauhaus Lounge Chair',
    desc: 'Architectural lounge armchair crafted from 100% FAS grade American walnut with interlocking mortise and tenon joinery, upholstered in full-grain vegetable-tanned saddle leather.',
    badge: 'Bauhaus Heritage',
    category: 'chair',
    categoryNameZh: '北美FAS黑胡桃木包豪斯手工榫卯休闲椅',
    categoryNameEn: 'Architectural Chairs',
    timberHardwareSpec: '100% Solid FAS American Black Walnut + Full-Grain Saddle Leather',
    dimensionsLoadSpec: 'W 78 × D 82 × H 74 cm · 220 kg Static Load Tested',
    joineryMechanismDetail: 'Traditional interlocking mortise & tenon with concealed hardwood dowels',
    moq: '20 Pcs per Run',
    tagline: 'Pure Structural Honesty Without a Single Exposed Screw',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'fur-2',
    name: 'Pneumatic Transforming Wall-Bed & Integrated Workstation',
    desc: 'Space-optimizing dual-function system featuring German gas-piston balancing struts that transforms from a 2-meter executive desk to a queen-size bed in 3 seconds.',
    badge: 'Space Transformer',
    category: 'transforming',
    categoryNameZh: '德国气压助推隐形折叠壁床多功能工作台',
    categoryNameEn: 'Smart Transforming Beds',
    timberHardwareSpec: 'E0 Baltic Birch Plywood + German Suspa® 1200N Gas Pistons',
    dimensionsLoadSpec: 'Desk: 205 × 60 cm · Bed: 200 × 150 cm Queen · 400 kg Rating',
    joineryMechanismDetail: 'Counterbalanced pneumatic scissor mechanism tested to 50,000 cycles',
    moq: '15 Units Batch',
    tagline: 'Yielding +45% Usable Living Floor Area in Urban Condos',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'fur-3',
    name: 'Modular Floating Media Credenza & Sliding Storage Unit',
    desc: 'Wall-hung modular architectural storage with acoustic slatted tambour sliding doors, concealed cable management channels, and Blum soft-close suspension brackets.',
    badge: 'Modular Floating',
    category: 'storage',
    categoryNameZh: '悬浮模块化实木格栅电视柜隐藏收纳系统',
    categoryNameEn: 'Modular Storage Systems',
    timberHardwareSpec: 'Rift-Cut Natural White Oak + Powder-Coated Aluminum Rails',
    dimensionsLoadSpec: 'W 240 × D 42 × H 38 cm · 120 kg Distributed Load',
    joineryMechanismDetail: 'French cleat heavy-duty wall mounting with micro-leveling adjustments',
    moq: '25 Units Order',
    tagline: 'Zero-Footprint Visual Levitation for Modern Living Rooms',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'fur-4',
    name: 'Solid White Oak Expandable Butterfly Leaf Dining Table',
    desc: 'Monolithic solid white oak dining table with patented internal gear-synchronized expanding butterfly mechanism that extends from 6 to 12 seats smoothly.',
    badge: 'Butterfly Extension',
    category: 'table',
    categoryNameZh: '北美白橡木内置齿轮联动伸缩折叠大餐桌',
    categoryNameEn: 'Extendable Dining Tables',
    timberHardwareSpec: 'FAS Appalachian White Oak + German Steel Ball-Bearing Slides',
    dimensionsLoadSpec: '180 cm to 260 cm Extended × W 95 × H 76 cm · 82 kg',
    joineryMechanismDetail: 'Precision cogwheel cable synchronization for effortless single-person pull',
    moq: '20 Pcs Run',
    tagline: 'Seamlessly Adapting from Intimate Dinners to Grand Banquets',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'fur-5',
    name: 'Architectural Minimalist Sideboard with Push-Latch Drawers',
    desc: 'Clean-lined sideboard featuring 45-degree mitered cabinet edges, solid walnut drawer boxes with English dovetail joinery, and Blum Movento undermount runners.',
    badge: 'Mitered Minimalism',
    category: 'sideboard',
    categoryNameZh: '45度斜边斜切实木收纳餐边柜斗柜',
    categoryNameEn: 'Architectural Sideboards',
    timberHardwareSpec: 'FAS American Walnut Veneer over High-Density E0 Core',
    dimensionsLoadSpec: 'W 180 × D 48 × H 78 cm · 4 Soft-Close Dovetail Drawers',
    joineryMechanismDetail: 'Continuous grain wrapping across all drawer fronts and seamless miter joints',
    moq: '30 Pcs Order',
    tagline: 'Unbroken Continuous Grain Across Every Architectural Surface',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'fur-6',
    name: 'Modular Sectional Sofa with Hydraulic Storage Underchassis',
    desc: 'Multi-configuration deep seating sofa with high-resilience foam core, breathable linen upholstery, and hydraulic easy-lift storage underneath all chaise modules.',
    badge: 'Hidden Storage Sofa',
    category: 'sofa',
    categoryNameZh: '全拆洗液压储物模块化大深度羽绒沙发',
    categoryNameEn: 'Modular Storage Sofas',
    timberHardwareSpec: 'Kiln-Dried Larch Hardwood Frame + High-Density Resilience Foam',
    dimensionsLoadSpec: '310 × 175 × 82 cm · 320L Internal Storage Capacity',
    joineryMechanismDetail: 'Interlocking invisible steel alligator connectors with gas-assisted chaise lift',
    moq: '15 Sets Production',
    tagline: 'De-Cluttering Living Spaces with Invisible Volumetric Vaults',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'fur-7',
    name: 'Cantilever Tubular Steel & Saddle Leather Dining Armchair',
    desc: 'Iconic cantilever tubular steel frame armchair offering gentle ergonomic bounce, paired with thick cognac saddle leather sling seat and walnut armrest pads.',
    badge: 'Cantilever Icon',
    category: 'chair',
    categoryNameZh: '包豪斯悬臂钢管马鞍皮人体工学餐椅',
    categoryNameEn: 'Cantilever Armchairs',
    timberHardwareSpec: 'Seamless 25mm Cold-Drawn Chromed Steel Tube + 3.5mm Bridle Leather',
    dimensionsLoadSpec: 'W 58 × D 59 × H 81 cm · 180 kg Fatigue Tested',
    joineryMechanismDetail: 'Precision mandrel CNC bending with zero weld seams on main curve',
    moq: '40 Pcs Order',
    tagline: 'Defying Mass with Floating Elastic Structural Suspension',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'fur-8',
    name: 'Hydraulic Lift-Top Coffee Table with Concealed Workstation',
    desc: 'Multi-functional living room coffee table with dual bi-directional hydraulic lifting leaves that raise to standard desk height while revealing deep storage trays.',
    badge: 'Lift-Top Workstation',
    category: 'table',
    categoryNameZh: '双向液压升降茶几带隐藏式居家办公桌面',
    categoryNameEn: 'Lift-Top Coffee Tables',
    timberHardwareSpec: 'FAS Natural White Oak + Heavy-Duty Damped Gas Struts',
    dimensionsLoadSpec: '120 × 70 × 42 cm (Lifts to 65 cm Ergonomic Height)',
    joineryMechanismDetail: 'Smooth pneumatic anti-pinch scissor linkage with soft-closing dampers',
    moq: '50 Pcs Run',
    tagline: 'Transforming Lounge Space into Productive Home Office in Seconds',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getFurnitureProducts(ctx: ThemeContext): ThemedFurnitureItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Furniture Piece ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'furniture',
      categoryNameZh: '家具与空间收纳',
      categoryNameEn: 'Furniture & Storage',
      timberHardwareSpec: p.material || '',
      dimensionsLoadSpec: p.dimensions || '',
      joineryMechanismDetail: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = FURNITURE_DEFAULT_PRODUCTS[idx % FURNITURE_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '包豪斯典藏' : 'Bauhaus Master') : (isZh ? '空间优选' : 'Spatial Choice'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        timberHardwareSpec: p.material || fallback.timberHardwareSpec,
        dimensionsLoadSpec: p.dimensions || fallback.dimensionsLoadSpec,
        joineryMechanismDetail: fallback.joineryMechanismDetail,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return FURNITURE_DEFAULT_PRODUCTS;
}

export function renderFurnitureStorageTemplate(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const page = ctx.page;
  const products = getFurnitureProducts(ctx);
  const heroProduct = products[0]!;
  const defaultMeta = FURNITURE_DEFAULT_PRODUCTS[0]!;

  // 100% LIGHT PALETTES FOR BOTH VARIANTS:
  // Banner: Bauhaus Clean Slate & Warm Cognac Walnut
  // Video: Studio Slate Pale & Industrial Flame Orange
  const theme = isVideo
    ? {
        bg: '#f8fafc',
        cardBg: '#ffffff',
        cardBorder: 'rgba(234, 88, 12, 0.15)',
        primary: '#ea580c',
        primaryHover: '#c2410c',
        text: '#0f172a',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(255, 255, 255, 0.88)',
        glassBorder: 'rgba(255, 255, 255, 0.95)',
        pillBg: '#ffedd5',
        pillText: '#c2410c',
        btnGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        accentGlow: 'rgba(234, 88, 12, 0.18)',
        tagBadge: 'Smart Space Optimization Lab',
      }
    : {
        bg: '#ffffff',
        cardBg: '#f8f8f9',
        cardBorder: 'rgba(24, 24, 27, 0.08)',
        primary: '#a16207',
        primaryHover: '#854d0e',
        text: '#18181b',
        textMuted: '#52525b',
        textSub: '#71717a',
        glassBg: 'rgba(255, 255, 255, 0.88)',
        glassBorder: 'rgba(255, 255, 255, 0.95)',
        pillBg: '#fef3c7',
        pillText: '#92400e',
        btnGradient: 'linear-gradient(135deg, #a16207 0%, #854d0e 100%)',
        accentGlow: 'rgba(161, 98, 7, 0.16)',
        tagBadge: 'Bauhaus Architectural Woodworking',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // Header with Apple Liquid Glass
  const headerHtml = `
    <header class="furniture-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(company.name)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.25rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'Spatial Kinetic Lab' : 'Bauhaus Woodcraft Atelier'))}
            </span>
            <span style="font-size:0.68rem;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};font-weight:700;">
              ${isVideo ? 'Space Optimization & Pneumatics' : 'Solid FAS Hardwood & Mortise Joinery'}
            </span>
          </div>
        </a>

        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:8px;font-size:0.8rem;font-weight:700;">
            ${ctx.languageLinks}
          </div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:9999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:700;box-shadow:0 4px 14px ${theme.accentGlow};">
            ${isZh ? '项目询价 / 方案' : 'Request B2B Quote'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  // Footer
  const footerHtml = `
    <footer style="background:#ffffff;border-top:1px solid ${theme.cardBorder};color:${theme.text};padding:60px 0 30px;margin-top:auto;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.3rem;font-weight:900;margin-bottom:10px;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'Spatial Kinetic Lab' : 'Bauhaus Woodcraft Atelier'))}
            </div>
            <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.7;max-width:340px;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'Engineering space-transforming pneumatic furniture and dynamic micro-apartment storage systems for urban developments worldwide.' : 'Bauhaus-inspired architectural solid wood furniture crafted with generational mortise-tenon joinery and CARB P2/E0 sustainability compliance.'))}
            </p>
            <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:700;">
              ✓ ${isZh ? 'FSC 100% 纯实木可持续林木 · CARB P2 / E0 认证' : 'FSC 100% Solid Hardwood · CARB P2 & E0 Certified'}
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${esc(ui.menu)}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.about)}</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.contact)}</a>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '制造类目' : 'Categories'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;color:${theme.textMuted};">
              <span>${isZh ? '包豪斯黑胡桃休闲椅' : 'Bauhaus Lounge Armchairs'}</span>
              <span>${isZh ? '德国气压折叠壁床' : 'Pneumatic Wall-Beds'}</span>
              <span>${isZh ? '模块化悬浮收纳柜' : 'Floating Media Credenzas'}</span>
              <span>${isZh ? '齿轮联动伸缩餐桌' : 'Extendable Dining Tables'}</span>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${esc(ui.contact)}</div>
            <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.7;">
              <div><strong>Atelier Email:</strong> <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;">${esc(company.email)}</a></div>
              ${company.phone ? `<div><strong>Phone:</strong> ${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div style="margin-top:8px;">${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="padding-top:24px;border-top:1px solid #eef2f6;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:${theme.textSub};">
          <div>© ${new Date().getFullYear()} ${esc(company.name)}. ${esc(ui.rights)}.</div>
          <div>${isZh ? '国际建筑与室内家具工程标准 · ISO9001 / BIFMA 5.1 强度认证' : 'ANSI/BIFMA X5.1 Certified · ISO9001 Manufacturing Standards'}</div>
        </div>
      </div>
    </footer>
  `;

  let mainHtml = '';

  if (page === 'home') {
    const videoAsset = ctx.asset(draft.heroAssetId);
    const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';
    const heroImg = (heroProduct as any).img || ctx.productMainImage(heroProduct as unknown as Product) || defaultMeta.img;

    if (isVideo) {
      // -------------------------------------------------------------
      // TEMPLATE 8: furniture-spatial-video (Space Transforming Video Loop)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Space Transformation Video Showcase with Liquid Glass Card -->
          <section style="position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;padding:80px 0;">
            <video id="hero-video" autoplay muted loop playsinline poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.75;filter:brightness(0.95) saturate(1.1);z-index:1;" aria-hidden="true">
              ${videoAsset ? `<source src="${esc(videoAsset)}">` : `<source src="https://assets.mixkit.co/videos/preview/mixkit-modern-minimalist-living-room-with-wooden-furniture-42616-large.mp4" type="video/mp4">`}
            </video>
            <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.72) 50%, rgba(248,250,252,0.4) 100%);z-index:2;"></div>

            <div class="wrap" style="position:relative;z-index:3;width:100%;padding:0 24px;">
              <div style="max-width:680px;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${theme.glassBorder};border-radius:24px;padding:48px;box-shadow:0 20px 50px -10px rgba(234,88,12,0.12);">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.primary};animation:wrPulse 2s infinite;"></span>
                  ${isZh ? '高密度城市微公寓空间折叠系统' : 'Kinetic Space Transformation Lab'}
                </div>

                <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '空间折叠 · 气压助推隐形壁床与模块化家具工程' : 'Spatial Yield: Kinetic Transforming Wall-Beds & Modular Storage'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '通过德国精密气压平衡活塞与隐藏式折叠联动五金，在有限面积中释放 +45% 可用活动空间。专为全球微公寓开发商、长租公寓与高端精品酒店提供批量工程定制。' : 'Unlocking +45% usable floor area through German pneumatic gas pistons and dynamic kinetic linkages. Engineered for micro-apartment developers and multi-unit projects.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:32px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:12px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索折叠变形家具 ↗' : 'View Transforming Systems ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:12px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '获取工程配套报价' : 'Request Developer Pricing'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid #e2e8f0;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">+45%</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '空间净使用面积提升' : 'Floor Space Efficiency'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">50,000</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '德国气压活塞开合测试' : 'Pneumatic Cycles Tested'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">3 Sec</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '书桌变大床瞬时切换' : 'Desk-to-Bed Transition'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Spatial Optimization Technology Grid -->
          <section class="wrap" style="padding:70px 24px;">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">ENGINEERING MATRIX</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 14px;">
                ${isZh ? '微公寓空间折叠的三大工程力学突破' : 'Three Structural Innovations in Spatial Engineering'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '告别笨重繁琐的手动搬动，以毫米级阻尼配重和自锁结构，实现丝滑单手开合与坚若磐石的承重表现。' : 'Eliminating mechanical friction through counterbalanced German gas struts and failsafe locks.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;">01</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '德国 Suspa 1200N 双气压活塞' : 'German Suspa® 1200N Gas Struts'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '精密充氮双向缓冲阻尼活塞，完全平衡床架自重，即使单手轻轻一推亦能优雅升降，带防坠落紧急自锁保护。' : 'Nitrogen-charged dual pistons counterbalancing heavy bed frames for effortless single-finger lifting with anti-drop lock.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '通过 50,000 次耐久疲劳老化测试' : '50,000 Fatigue Cycles Certified'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;">02</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '水平均衡保持机构（无需清理桌面）' : 'Level-Sync Desk Mechanism'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '四连杆四边形机械结构使桌面在翻下过程中始终保持绝对水平，桌面水杯、笔记本电脑无需收拾即可直接下沉为床底。' : 'Four-bar linkage keeps the working desk perfectly horizontal during deployment, leaving items undisturbed.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '桌面承重达 45kg · 下沉后离地 18cm' : '45kg Dynamic Working Surface Load'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;">03</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '冷弯高强航空钢管骨架' : 'Cold-Drawn Structural Steel Frame'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '全焊接高强度冷拔矩形钢管底盘，辅以桦木多层排骨条，整体静载承受高达 400kg，翻身零杂音零晃动。' : 'Cold-drawn tubular chassis with birch slat suspension supporting 400kg static weight with zero squeaking.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '符合欧盟 EN 1129 壁床安全强制标准' : 'Meets EN 1129 European Safety Standard'}</div>
              </div>
            </div>
          </section>

          <!-- 3. Smart Furniture Showcase Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">SPATIAL FLEET</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                  ${isZh ? '模块化变形与空间收纳矩阵' : 'Transforming Furniture Fleet'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全系 8 款系统 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedFurnitureItem).timberHardwareSpec ? (item as ThemedFurnitureItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(234,88,12,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f1f5f9;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="padding:10px 12px;background:#f8fafc;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '材质/五金' : 'Hardware'}:</strong> ${esc(meta.timberHardwareSpec)}
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
                          ${esc(ui.details)} ↗
                        </a>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>
        </main>
      `;
    } else {
      // -------------------------------------------------------------
      // TEMPLATE 7: furniture-minimal-banner (Bauhaus Solid Wood Craft Banner)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Bauhaus Solid Timber Hero Showcase with Clean Architectural Layout -->
          <section class="wrap" style="padding:60px 24px 80px;">
            <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ ${isZh ? '包豪斯建筑学构型 · 纯实木榫卯大匠工坊' : 'Bauhaus Architectural Woodworking Atelier'}
                </div>

                <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.12;color:${theme.text};margin:0 0 18px;letter-spacing:-0.03em;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '结构诚实 · 北美 FAS 黑胡桃纯实木手工榫卯家具' : 'Structural Honesty: FAS Solid Walnut & Architectural Mortise Joinery'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '坚守包豪斯“形式追随功能”的纯粹理念，全系列精选北美特级 FAS 黑胡桃木与白橡木，传统燕尾榫与双重抱头榫紧密咬合，零螺丝外露，呈现温润厚重的建筑级家具原真之美。' : 'Adhering to strict Bauhaus functional minimalism. Crafted from 100% solid North American FAS black walnut and white oak with interlocking dovetail mortise-tenon joinery.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '品鉴纯实木家具矩阵' : 'Explore Solid Woodworks'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:8px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '获取木料样品与大宗报价' : 'Request Timber Swatches'}
                  </a>
                </div>

                <div style="display:flex;gap:32px;padding-top:24px;border-top:1px solid #e4e4e7;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">FAS Grade</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '全美特级天然纯实木' : 'North American Timber'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">0 Screws</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '主承重传统穿插榫卯' : 'Zero Exposed Screws'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">CARB E0</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '纯天然欧诗木植物木蜡油' : 'Zero-VOC Plant Wax Finish'}</div>
                  </div>
                </div>
              </div>

              <!-- Hero Image Box -->
              <div style="position:relative;" class="wr-card-hover">
                <div style="position:relative;border-radius:24px;overflow:hidden;box-shadow:0 25px 60px -15px rgba(161,98,7,0.18);border:1px solid ${theme.cardBorder};background:#f4f4f5;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:520px;object-fit:cover;display:block;">
                </div>
                <div style="position:absolute;bottom:24px;left:24px;right:24px;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ${theme.glassBorder};border-radius:14px;padding:18px 22px;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">${esc(defaultMeta.badge)}</div>
                      <div style="font-size:1.05rem;font-weight:900;color:${theme.text};margin-top:2px;">${esc(heroProduct.name)}</div>
                    </div>
                    <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                      ${isZh ? '查看榫卯' : 'Inspect'} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Traditional Mortise & Tenon Craftsmanship Timeline -->
          <section class="wrap" style="padding:60px 24px 70px;">
            <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">THE WOODCRAFT DISCIPLINE</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                ${isZh ? '包豪斯实木工坊的三大制造法则' : 'Three Pillars of Architectural Woodworking'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '真正的实木家具不需要浮华的装饰，木材与生俱来的年轮与精密咬合的榫头本身就是极致的艺术。' : 'Celebrating structural honesty, natural grain flow, and centuries-old interlocking joinery.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">PILLAR 01 / JOINERY</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '传统双重抱头榫与燕尾穿插' : 'Interlocking Mortise & Tenon'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '公母榫精准留出0.1mm手工公差，通过木纤维在胶水微胀下的物理自锁，经百年干燥与重压仍不松不散。' : 'Interlocking tongue-and-groove joints engineered to 0.1mm tolerances, defying joint loosening over decades.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">PILLAR 02 / TIMBER</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '北美原产 FAS 特级黑胡桃大板' : '100% Solid FAS North American Timber'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '仅选用大口径老龄原木直拼，杜绝碎木指接与贴皮伪装，山形木纹完整舒展，触感温润饱满。' : 'Sourced from sustainably managed Appalachian forests, dried to 8-10% moisture content for zero cracking.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">PILLAR 03 / FINISH</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '德国欧诗木天然环保植物木蜡油' : 'German Osmo® Natural Wax-Oil'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '深层渗透木质导管孔隙，保留实木自由呼吸的毛孔，不形成塑料漆膜，具备极佳的防水耐热与抗划伤性能。' : 'Open-pore natural plant wax finish allowing timber to breathe, free from artificial plastic resin lacquers.'}
                </p>
              </div>
            </div>
          </section>

          <!-- 3. Furniture Collection Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">THE PORTFOLIO</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                  ${isZh ? '包豪斯建筑学纯实木系列' : 'Bauhaus Architectural Woodworks'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全部 8 款家具 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedFurnitureItem).timberHardwareSpec ? (item as ThemedFurnitureItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(161,98,7,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f4f4f5;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="padding:10px 12px;background:#f8f8f9;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '材质规格' : 'Material'}:</strong> ${esc(meta.timberHardwareSpec)}
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
                          ${esc(ui.details)} ↗
                        </a>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    // -------------------------------------------------------------
    // CATALOG PAGE: Clean High-Contrast Light Grid
    // -------------------------------------------------------------
    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Spatial Kinetic Lab' : 'Bauhaus Woodcraft Atelier'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? (isVideo ? '浏览智能折叠壁床、液压升降茶几、模块化悬浮收纳柜与齿轮伸缩餐桌，专为现代城市公寓与多单元开发项目提供高坪效整装方案。' : '探索北美FAS黑胡桃木休闲椅、传统大榫卯餐桌、悬臂钢管马鞍皮椅与斜边餐边柜，支持大宗工程配套与定制开模。') : (isVideo ? 'Explore our space-saving transforming wall-beds, kinetic lift tables, and modular storage units.' : 'Browse our solid hardwood Bauhaus furniture collection built with generational mortise-tenon joinery.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedFurnitureItem).timberHardwareSpec ? (item as ThemedFurnitureItem) : FURNITURE_DEFAULT_PRODUCTS[idx % FURNITURE_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.04);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#f1f5f9' : '#f4f4f5'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                      ${esc(meta.badge)}
                    </span>
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn)}
                    </div>
                    <h2 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.desc || '')}
                    </p>
                    <div style="background:${isVideo ? '#f8fafc' : '#f8f8f9'};padding:10px 12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;">
                      <div><strong>${isZh ? '核心用料' : 'Material'}:</strong> ${esc(meta.timberHardwareSpec)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '规格承重' : 'Specs & Load'}:</strong> ${esc(meta.dimensionsLoadSpec)}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
                        ${esc(ui.details)} ↗
                      </a>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </main>
    `;
  } else if (page === 'detail') {
    // -------------------------------------------------------------
    // DETAIL PAGE: Rich Product Specs with id="wr-detail-main-img"
    // -------------------------------------------------------------
    const meta = (selectedProduct as unknown as ThemedFurnitureItem).timberHardwareSpec ? (selectedProduct as unknown as ThemedFurnitureItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;

    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:${theme.textSub};margin-bottom:30px;">
            <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
            <span style="margin:0 8px;">/</span>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
            <span style="margin:0 8px;">/</span>
            <span style="color:${theme.text};font-weight:700;">${esc(selectedProduct.name)}</span>
          </nav>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:start;margin-bottom:70px;">
            <div>
              <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 36px rgba(0,0,0,0.06);position:relative;">
                <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;max-height:560px;object-fit:cover;display:block;">
              </div>
            </div>

            <div>
              <div style="display:inline-block;padding:5px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.badge || (isVideo ? 'Spatial Kinetic Lab' : 'Bauhaus Heritage'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc((selectedProduct as any).desc || selectedProduct.description || defaultMeta.desc)}
              </p>

              <!-- Technical Specifications Grid -->
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                  ${isZh ? '实木材质工艺与力学工程参数' : 'Structural Materials & Engineering Specs'}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '选用木料 / 五金' : 'Timber / Hardware'}</span>
                    <strong style="color:${theme.text};">${esc(meta.timberHardwareSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '规格尺寸与承重' : 'Dimensions & Dynamic Load'}</span>
                    <strong style="color:${theme.text};">${esc(meta.dimensionsLoadSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '榫卯咬合/折叠机构' : 'Joinery / Mechanism'}</span>
                    <strong style="color:${theme.text};">${esc(meta.joineryMechanismDetail)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '项目起订量 / 交付' : 'MOQ & Lead Time'}</span>
                    <strong style="color:${theme.primary};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(selectedProduct.id))}" ${navAttrs('contact', selectedProduct.id)} style="text-decoration:none;padding:15px 32px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};flex:1;text-align:center;">
                  ${isZh ? '发起工程采购询价 / 索样' : 'Inquire for Project Quotation'} ↗
                </a>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 24px;border-radius:10px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                  ← ${esc(ui.back)}
                </a>
              </div>
            </div>
          </div>

          <!-- Related Products -->
          <section style="padding-top:40px;border-top:1px solid #e2e8f0;">
            <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 24px;">${esc(ui.related)}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:24px;">
              ${products.filter((p) => p.id !== selectedProduct.id).slice(0, 3).map((item) => `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,0.03);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:70%;overflow:hidden;border-radius:10px;margin-bottom:12px;background:#f8fafc;">
                    <img src="${esc((item as any).img || ctx.productMainImage(item as unknown as Product))}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                  </div>
                  <h3 style="font-size:0.96rem;font-weight:800;color:${theme.text};margin:0 0 6px;">${esc(item.name)}</h3>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:${theme.primary};text-decoration:none;font-size:0.82rem;font-weight:700;">
                    ${esc(ui.details)} ↗
                  </a>
                </article>
              `).join('')}
            </div>
          </section>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    // -------------------------------------------------------------
    // ABOUT PAGE: High-Contrast Factory & Joinery Legacy
    // -------------------------------------------------------------
    const headline = getAboutHeadline(company, company.name);
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const aboutImg = ctx.asset(company.aboutImageAssetId) || (products[1] ? (products[1] as any).img : defaultMeta.img);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '50+ Yrs', num: 50, suffix: '+ Yrs', label: isZh ? '木工制造传承' : 'Woodworking Legacy', desc: isZh ? '数十年传统榫卯与数控五轴积淀' : 'Generations of master cabinetmakers' },
      { value: '100% FAS', num: 100, suffix: '%', label: isZh ? '特级北美全实木' : 'FAS Certified Hardwood', desc: isZh ? '直采可持续森林优质大径原木' : 'Sustainably harvested virgin logs' },
      { value: '400 kg', num: 400, suffix: ' kg', label: isZh ? '极限静态承重标准' : 'Static Load Testing', desc: isZh ? '远超欧美商业家具严苛测试要求' : 'ANSI/BIFMA load compliance' },
      { value: '60+ Countries', num: 60, suffix: '+ Countries', label: isZh ? '全球集装箱货运直发' : 'Export Destinations', desc: isZh ? '服务跨国地产与高端连锁品牌' : 'Delivered to global developers' },
    ]);

    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:50px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '工坊底蕴与空间工程学哲学' : 'ATELIER HERITAGE & SPATIAL ENGINEERING'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;">
              ${esc(headline)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:720px;">
              ${esc(company.slogan || (isVideo ? '以极致工程力学解放城市居所的每一寸地面空间。' : '用坚不可摧的榫卯结构和真挚木纹，让家具成为可传承百年的空间建筑。'))}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                  <p style="margin:0 0 18px;">
                    ${isZh ? '我们拥有占地 45,000 平方米的现代智能化实木与五金加工生产基地，配备德国豪迈全自动封边与数控五轴加工中心，以及严格的恒温恒湿木材真空烘干窑。' : 'Operating a 45,000 m² state-of-the-art timber and hardware manufacturing campus equipped with German Homag 5-axis CNC routers and precision vacuum drying kilns.'}
                  </p>
                  <p style="margin:0 0 18px;">
                    ${isZh ? '从木料含水率严格控制在 8-10%，到五金活塞的数万次循环疲劳测试，我们深度融合传统手作木工与现代精密机械，为全球建筑师和开发商提供卓越的家具工程解决方案。' : 'From strict 8-10% moisture equilibrium control to 50,000-cycle pneumatic endurance verification, our commitment to engineering perfection ensures generational durability.'}
                  </p>
                `}
              </div>
              <div style="margin-top:28px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                  ${isZh ? '预约验厂考察 / 工程洽谈' : 'Schedule Factory Audit'} ↗
                </a>
              </div>
            </div>

            <div>
              <div style="border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid ${theme.cardBorder};background:#ffffff;">
                <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="width:100%;height:380px;object-fit:cover;display:block;">
              </div>
            </div>
          </div>

          <!-- Statistics Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
            ${stats.map((s) => `
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:26px;box-shadow:0 6px 20px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">${esc(s.value)}</div>
                <div style="font-size:0.92rem;font-weight:800;color:${theme.text};margin-bottom:4px;">${esc(s.label)}</div>
                <div style="font-size:0.8rem;color:${theme.textSub};">${esc(s.desc || '')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </main>
    `;
  } else if (page === 'contact') {
    // -------------------------------------------------------------
    // CONTACT PAGE: Direct Factory Engineering Quote Form
    // -------------------------------------------------------------
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '大宗地产工程与专属定制洽谈' : 'COMMERCIAL ARCHITECT & OEM INQUIRY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的工程采购清单或定制图纸需求，我们的家具结构工程师将在 24 小时内与您接洽，并提供三维 CAD 拆单、BOM 成本核算与木样寄送。' : 'Submit your project specifications or architectural drawings. Our structural engineering team will respond within 24 hours with complete CAD details and volume pricing.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <!-- Contact Card Details -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;">
                ${esc(company.name || (isVideo ? 'Spatial Kinetic Lab HQ' : 'Bauhaus Woodcraft Atelier'))}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(company.description || (isZh ? '专注高品质实木家具制造与微公寓变形家具外贸，支持OEM/ODM/OBM全球集装箱货运履约。' : 'Direct manufacturing facility supplying residential developers and architectural projects globally.'))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Export Engineering Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Project Hotline</span>
                    <a href="tel:${esc(company.phone)}" style="color:${theme.text};text-decoration:none;font-weight:700;">${esc(company.phone)}</a>
                  </div>
                ` : ''}

                ${waDigits ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">WhatsApp Rapid Response</span>
                    <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:none;font-weight:700;">+${esc(waDigits)} (Chat Now ↗)</a>
                  </div>
                ` : ''}

                ${company.address ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Manufacturing Facility</span>
                    <div style="color:${theme.textMuted};">${esc(company.address)}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Inquiry Form -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.name)} *</label>
                  <input name="name" required maxlength="120" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.email)} *</label>
                  <input name="email" type="email" required maxlength="254" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.company)} (${esc(ui.optional)})</label>
                  <input name="company" maxlength="200" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.product)} (${esc(ui.optional)})</label>
                  <select name="productId" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                    <option value="">${isZh ? '— 选择意向家具 / 系统型号 —' : '— Select Furniture System —'}</option>
                    ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>

                <div style="grid-column:span 2;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.message)} *</label>
                  <textarea name="message" required maxlength="5000" rows="5" placeholder="${isZh ? '请描述您的工程套数要求、木材种类偏好（黑胡桃/白橡等）、图纸规格或目标交付期...' : 'Describe your project units, timber species preferences, CAD specifications or target delivery milestone...'}" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;resize:vertical;"></textarea>
                </div>

                <div style="display:none;" aria-hidden="true">
                  <input name="website" tabindex="-1" autocomplete="off">
                </div>

                <div style="grid-column:span 2;display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                  <button type="submit" ${ctx.options.preview ? 'disabled' : ''} style="padding:14px 34px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;border:none;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    ${esc(ui.send)} ↗
                  </button>
                  <span style="font-size:0.78rem;color:${theme.textSub};">${isZh ? '工程技术团队直连 · 24小时内提供报价' : 'Direct Engineering Response · 24h'}</span>
                </div>
                <p class="form-status" role="status" aria-live="polite" style="grid-column:span 2;font-size:0.86rem;margin:0;"></p>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
