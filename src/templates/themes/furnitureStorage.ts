import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export interface ThemedItem {
  id: string;
  name: string;
  description: string;
  desc?: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  spec1: string;
  spec2: string;
  moq: string;
  tagline: string;
  img: string;
}

export const DEFAULT_PRODUCTS: ThemedItem[] = [
  {
    "id": "fur-1",
    "name": "FAS American Black Walnut Floating Dining Table",
    "description": "Cantilevered floating design crafted from continuous-grain FAS American black walnut slabs, finished with organic zero-VOC hardwax oil.",
    "badge": "Master Timber",
    "category": "table",
    "categoryNameZh": "北美FAS级黑胡桃木悬浮隐形抽屉实木餐桌",
    "categoryNameEn": "Solid Walnut Dining Tables",
    "spec1": "100% Solid FAS American Walnut (Moisture 8-10%)",
    "spec2": "200 × 90 × 75 cm · 45mm Top · Concealed Cutlery Drawers",
    "moq": "30 Pcs per Batch",
    "tagline": "Continuous Grain Horizon",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "fur-2",
    "name": "Modular Aluminum Frame Architectural Bookshelf Unit",
    "description": "Precision extruded black anodized aluminum uprights with micro-adjustable smoked glass and solid oak storage modules.",
    "badge": "Architectural Grid",
    "category": "bookshelf",
    "categoryNameZh": "模块化自由组合铝框极简置物书架系统",
    "categoryNameEn": "Modular Aluminum Bookshelves",
    "spec1": "6063-T6 Aerospace Aluminum + Tempered Smoked Glass",
    "spec2": "240 × 38 × 220 cm · 150kg/Tier Rated",
    "moq": "20 Sets per Run",
    "tagline": "Open Grid Spatial Harmony",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "fur-3",
    "name": "Ergonomic Bentwood Bouclé Cloud Lounge Armchair",
    "description": "Sculptural curved ash wood internal frame draped in plush high-density Italian bouclé wool fleece, paired with 360° memory-swivel pedestal.",
    "badge": "Ergonomic Cloud",
    "category": "chair",
    "categoryNameZh": "人体工学曲木羊羔绒云朵单人休闲躺椅",
    "categoryNameEn": "Bouclé Cloud Armchairs",
    "spec1": "Solid Ash Bentwood + High-Resilience Molded Foam",
    "spec2": "92 × 88 × 82 cm · Seat Height 42cm · 360° Swivel",
    "moq": "50 Pcs per Color",
    "tagline": "Cocoon of Tactile Warmth",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "fur-4",
    "name": "Suspended Minimalist Floating Entryway Storage Credenza",
    "description": "Wall-hung floating entryway console featuring fluted tambour sliding fronts, built-in wireless charging pad, and concealed shoe ventilation.",
    "badge": "Floating Entryway",
    "category": "credenza",
    "categoryNameZh": "悬空极简入户玄关多功能鞋包收纳柜",
    "categoryNameEn": "Floating Entryway Credenzas",
    "spec1": "E0 Moisture-Resistant Core + Natural Oak Wood Slats",
    "spec2": "160 × 35 × 45 cm · Heavy-Duty Wall Anchors Included",
    "moq": "40 Pcs per Order",
    "tagline": "Airy Weightlessness in Arrival",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "fur-5",
    "name": "Italian Sintered Stone Extendable Lift-Top Coffee Table",
    "description": "Scratch-proof heat-resistant 12mm sintered stone table with silent pneumatic lift-top mechanism revealing deep hidden storage compartments.",
    "badge": "Pneumatic Lift",
    "category": "coffeetable",
    "categoryNameZh": "意式超薄岩板防刮耐磨伸缩岛台茶几",
    "categoryNameEn": "Lift-Top Coffee Tables",
    "spec1": "12mm Italian Sintered Stone (Mohs 7) + Black Steel Base",
    "spec2": "120-150 × 60 × 42-62 cm Lift Range",
    "moq": "50 Pcs per Batch",
    "tagline": "Effortless Work & Living Fusion",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "fur-6",
    "name": "Stackable Modular High-Clarity Acrylic Storage Box System",
    "description": "Optical-grade thick acrylic transparent display containers with magnetic side-drop doors and stackable interlocking grooves.",
    "badge": "Clear Storage",
    "category": "storage",
    "categoryNameZh": "模块化抽屉式透明高透防尘收纳整理箱组",
    "categoryNameEn": "Modular Acrylic Storage",
    "spec1": "4mm Cast Virgin Acrylic (94% Optical Clarity)",
    "spec2": "38 × 28 × 22 cm · Modular Interlocking Base",
    "moq": "200 Sets (6 Pcs/Set)",
    "tagline": "Museum-Quality Clear Organization",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "fur-7",
    "name": "Solid Oak Magnetic Modular Walk-In Wardrobe System",
    "description": "Open architectural closet system featuring magnetic adjustable garment rails, LED sensor strip channels, and leather-lined jewelry inserts.",
    "badge": "Wardrobe System",
    "category": "wardrobe",
    "categoryNameZh": "极简实木磁吸模块化走入式衣帽间系统",
    "categoryNameEn": "Modular Walk-In Wardrobes",
    "spec1": "Solid White Oak + Extruded Anodized Rail Tracks",
    "spec2": "Custom Modular Configuration (Height up to 280 cm)",
    "moq": "15 Full Sets per Project",
    "tagline": "Haute Couture Dressing Architecture",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "fur-8",
    "name": "Bauhaus Tubular Chrome & Tempered Glass Folding Side Table",
    "description": "Classic modernist homage featuring mirror-polished tubular chrome steel frame and 8mm shatter-proof tempered glass floating tray.",
    "badge": "Bauhaus Classic",
    "category": "table",
    "categoryNameZh": "包豪斯风格弯管镀铬网格折叠杂志边几",
    "categoryNameEn": "Bauhaus Side Tables",
    "spec1": "Seamless Mirror-Polished Tubular Stainless Steel",
    "spec2": "48 × 48 × 54 cm · Folds Flat for Storage",
    "moq": "100 Pcs per Order",
    "tagline": "Form Follows Function Timelessness",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderFurniturePage(ctx: ThemeContext, isVideo: boolean): string {
  const {
    draft,
    options,
    color,
    brandInk,
    lang,
    page,
    path,
    navAttrs,
    ui,
  } = ctx;
  const isZh = (lang as string) === 'zh';
  const company = draft.company;

  const products = (draft.products && draft.products.length > 0
    ? (isTypedMaterialsSource(draft)
        ? draft.products.map((p) => ({
            id: p.id,
            imageAssetId: p.imageAssetId,
            name: ctx.translateProduct(p).name || p.name,
            description: ctx.translateProduct(p).description || p.description,
            desc: ctx.translateProduct(p).description || p.description,
            badge: '',
            category: 'default',
            categoryNameZh: '包豪斯家具与空间收纳',
            categoryNameEn: 'Architectural Furniture & Spatial Systems',
            spec1: p.material || '',
            spec2: p.dimensions || '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : DEFAULT_PRODUCTS) as (Product | ThemedItem)[];

  const defaultMeta = DEFAULT_PRODUCTS[0];
  const isDetail = page === 'detail';
  const selectedProduct = (isDetail
    ? products.find((p) => p.id === options.productId) || products[0]
    : products[0]) || defaultMeta;

  const pMeta = (selectedProduct as ThemedItem)?.spec1
    ? (selectedProduct as ThemedItem)
    : defaultMeta;

  // Visual Theme Configuration
  // isVideo = false: furniture-minimal-banner (Light Bauhaus architectural solid timber & ivory)
  // isVideo = true: furniture-spatial-video (Dark industrial steel matrix & electric safety orange)
  const theme = isVideo ? {
    name: 'spatial-video',
    bg: '#13161f',
    bgSoft: '#1a1f2c',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textSub: '#64748b',
    primary: '#f97316', // Industrial orange
    accent: '#38bdf8',
    headerBg: 'rgba(19, 22, 31, 0.85)',
    headerBorder: 'rgba(255, 255, 255, 0.12)',
    inputBg: 'rgba(15, 23, 42, 0.65)',
    inputBorder: 'rgba(255, 255, 255, 0.18)',
    inputText: '#ffffff',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    badgeText: '#fb923c',
    badgeBorder: 'rgba(249, 115, 22, 0.3)',
    btnGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    btnText: '#ffffff',
    pillActive: '#f97316',
    pillText: '#ffffff',
    footerBg: '#0b0d13',
    footerBorder: '#1e2433',
  } : {
    name: 'minimal-banner',
    bg: '#f7f5f0',
    bgSoft: '#ede8e1',
    cardBg: '#ffffff',
    cardBorder: '#e2ded7',
    text: '#1f1a17',
    textMuted: '#57534e',
    textSub: '#78716c',
    primary: '#1d4ed8', // Bauhaus Cobalt Blue
    accent: '#854d0e', // Warm Walnut
    headerBg: 'rgba(247, 245, 240, 0.9)',
    headerBorder: 'rgba(214, 211, 206, 0.8)',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    inputText: '#1f1a17',
    badgeBg: 'rgba(29, 78, 216, 0.08)',
    badgeText: '#1d4ed8',
    badgeBorder: 'rgba(29, 78, 216, 0.2)',
    btnGradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    btnText: '#ffffff',
    pillActive: '#1f1a17',
    pillText: '#ffffff',
    footerBg: '#1f1a17',
    footerBorder: '#352e2a',
  };

  const heroTitle = isVideo
    ? (isZh ? '极简折叠与多维模块化空间收纳系统' : 'Spatial Matrix & Modular Kinetic Furniture')
    : (isZh ? '包豪斯建筑力学 · 原木榫卯与现代极简家具' : 'Bauhaus Architectural Joinery & Solid Timber Living');

  const heroSubtitle = isVideo
    ? (isZh ? '航空级 6063-T6 铝框与 Blum 阻尼气压折叠系统，提升空间 45% 有效坪效。专为现代都会大平层与高阶公寓打造的变形收纳矩阵。'
            : 'Aerospace 6063-T6 aluminum frames and silent pneumatic lift systems, maximizing spatial efficiency by 45% in luxury residences.')
    : (isZh ? '严选北美 FAS 级黑胡桃与纯植物硬质木蜡油，传承无钉传统榫卯与 150kg 悬臂受力工程，打造历久弥新的经典建筑级家具。'
            : 'Sustainably sourced FAS American Walnut with traditional blind tenon joinery and BIFMA structural load compliance for architectural spaces.');

  // Header Component
  const headerHtml = `
    <header class="theme-header" style="position:sticky;top:0;z-index:99;background:${theme.headerBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.headerBorder};">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:8px;background:${theme.btnGradient};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><path d="M20 7h-9M14 17H5M3 3v18M21 3v18M7 7v10M17 7v10"/></svg>
          </div>
          <div>
            <div style="font-size:1.15rem;font-weight:900;letter-spacing:-0.02em;color:${isVideo ? '#ffffff' : '#1f1a17'};line-height:1.1;">
              ${esc(company.name || (isVideo ? 'Spatial Modular Matrix' : 'Bauhaus Timber Guild'))}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};font-weight:800;">
              ${isZh ? (isVideo ? '多维空间模块收纳' : '包豪斯原木建筑家具') : (isVideo ? 'Spatial Storage Systems' : 'Bauhaus Timber Architecture')}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:26px;" class="theme-nav-links">
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

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 20px;border-radius:8px;font-size:0.86rem;font-weight:800;color:${theme.btnText};background:${theme.btnGradient};box-shadow:0 4px 14px rgba(0,0,0,0.12);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
            <span>${isZh ? '项目工程询价' : 'Project RFQ'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    const heroProduct = (products[0] || defaultMeta) as (Product | ThemedItem);
    const heroImg = (heroProduct as any).img || ctx.productMainImage(heroProduct as Product) || defaultMeta.img;
    const heroMeta = (heroProduct as ThemedItem).spec1 ? (heroProduct as ThemedItem) : defaultMeta;
    if (isVideo) {
      // -------------------------------------------------------------
      // 1. VIDEO TEMPLATE HOME: High-Tech Spatial Matrix
      // -------------------------------------------------------------
      const videoAsset = ctx.asset(draft.heroAssetId);
      const heroPoster = '/templates/senseng/hero-sky.jpg';

      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: High-Tech Spatial Matrix Video -->
          <section style="position:relative;width:100%;min-height:85vh;overflow:hidden;background:#090b10;display:flex;align-items:center;">
            <video autoplay loop muted playsinline poster="${esc(heroPoster)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.42;z-index:1;">
              ${videoAsset ? `<source src="${esc(videoAsset)}" type="video/mp4">` : ''}
            </video>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 60% 40%, rgba(249,115,22,0.15) 0%, rgba(19,22,31,0.85) 75%, #13161f 100%);z-index:2;"></div>
            
            <div class="wrap" style="position:relative;z-index:3;padding:90px 20px;max-width:1000px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:20px;" data-reveal="fade-up">
                <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};box-shadow:0 0 8px ${theme.primary};"></span>
                <span style="color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">
                  ${isZh ? '工业4.0 空间折叠与模块收纳系统' : 'SPATIAL ARCHITECTURE & KINETIC SYSTEMS'}
                </span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 5vw, 4rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 22px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.7;color:${theme.textMuted};margin:0 0 36px;max-width:760px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:8px;font-size:0.98rem;font-weight:800;color:#ffffff;background:${theme.btnGradient};box-shadow:0 8px 24px rgba(234,88,12,0.35);">
                  ${isZh ? '浏览全系收纳矩阵' : 'Explore Storage Matrix'} ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;font-size:0.98rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);">
                  ${isZh ? '大宗地产工程样板' : 'Commercial Contract'}
                </a>
              </div>
            </div>
          </section>

          <!-- Spatial Volume Efficiency Matrix (Unique to Video Template) -->
          <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
            <div style="background:${theme.bgSoft};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">SPATIAL METRICS</span>
                  <h2 style="font-size:clamp(1.6rem, 2.5vw, 2.2rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                    ${isZh ? '多维空间坪效倍增核心指标' : 'Spatial Efficiency Engineering'}
                  </h2>
                </div>
                <div style="font-size:0.88rem;color:${theme.textMuted};">
                  ${isZh ? '经德国 TÜV 莱茵与 BIFMA 联合荷载检测' : 'Certified by TÜV Rheinland & BIFMA Structural Test'}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};" data-counter="45" data-suffix="%">+45%</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '有效地面使用率提升' : 'Usable Floor Space Gain'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Via pneumatic lift & folding</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;" data-counter="150" data-suffix=" kg">150 kg</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '单层铝框层板极限承载' : 'Per-Shelf Structural Rating'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">6063-T6 architectural alloy</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};" data-counter="100000" data-suffix=" Cycles">100,000</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '阻尼五金疲劳测试' : 'Dampened Hardware Cycles'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Zero-failure pneumatic life</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;" data-counter="7" data-suffix=" Days">7-10 Days</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '数控工程打样周期' : 'CNC Sample Turnaround'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">5-Axis automated milling</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Modular Product Grid -->
          <section class="wrap" style="padding:50px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">CATALOG SHOWCASE</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                  ${isZh ? '精选模块化收纳系统' : 'Engineered Modular Collection'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '查看全部品项 ↗' : 'View Full Matrix ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:transform 0.3s ease, border-color 0.3s ease;" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:#0d1017;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(19,22,31,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);color:#ffffff;">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                      <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                        ${esc(meta.categoryNameEn || 'Modular Systems')}
                      </div>
                      <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;line-height:1.3;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.55;margin:0 0 16px;flex:1;">
                        ${esc(item.description || '')}
                      </p>
                      <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;color:${theme.textSub};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:6px 14px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                          ${esc(ui.details)} ↗
                        </a>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>

          <!-- Engineering Capabilities & Aluminum Extrusion Core -->
          <section class="wrap" style="padding:0 0 80px;" data-reveal="fade-up">
            <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:40px;background:${theme.bgSoft};border:1px solid ${theme.cardBorder};border-radius:24px;padding:48px;align-items:center;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">MATERIAL SCIENCE</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:#ffffff;line-height:1.2;margin:10px 0 18px;">
                  ${isZh ? '6063-T6 航天级铝合金与静音阻尼五金' : '6063-T6 Extrusions & Silent Pneumatics'}
                </h2>
                <p style="font-size:0.95rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                  ${isZh ? '高强度阳极氧化黑砂铝合金立柱，表面微米级防刮电泳涂层。配备奥地利原装 Blum 阻尼铰链与静音气动顶撑，确保 100,000 次启闭平顺如初。'
                          : 'High-strength anodized aluminum uprights with micro-texture scratch-resistant coating, paired with genuine Blum soft-close hinges.'}
                </p>
                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <span style="padding:6px 14px;border-radius:6px;background:rgba(255,255,255,0.06);font-size:0.82rem;font-weight:700;color:#ffffff;">✓ 莫氏硬度 7 级岩板</span>
                  <span style="padding:6px 14px;border-radius:6px;background:rgba(255,255,255,0.06);font-size:0.82rem;font-weight:700;color:#ffffff;">✓ 94% 透光原生亚克力</span>
                  <span style="padding:6px 14px;border-radius:6px;background:rgba(255,255,255,0.06);font-size:0.82rem;font-weight:700;color:#ffffff;">✓ E0 级耐水防潮芯材</span>
                </div>
              </div>
              <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">
                <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 14px;">
                  ${isZh ? '全球工程定制方案对接' : 'Global Project Engineering'}
                </h3>
                <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 20px;">
                  ${isZh ? '支持 CAD 图纸快速深化、3D 渲染效果图确认与保税集装箱直发。' : 'Direct support for CAD integration, architectural BIM files, and global FOB delivery.'}
                </p>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;display:block;text-align:center;padding:12px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.9rem;font-weight:800;">
                  ${isZh ? '申请空间深化设计与打样' : 'Request Engineering Specs'} ↗
                </a>
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // -------------------------------------------------------------
      // 2. BANNER TEMPLATE HOME: Light Bauhaus Architectural Timber
      // -------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Bauhaus Architectural Timber Banner -->
          <section style="position:relative;padding:90px 0 80px;border-bottom:1px solid ${theme.cardBorder};overflow:hidden;background:linear-gradient(180deg, #f7f5f0 0%, #ede7de 100%);">
            <div class="wrap" style="display:grid;grid-template-columns:1.1fr 1fr;gap:50px;align-items:center;">
              <div data-reveal="fade-up">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:18px;">
                  <span style="font-size:0.75rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${theme.badgeText};">
                    BAUHAUS STRUCTURAL TIMBER GUILD · EST. 2008
                  </span>
                </div>
                <h1 style="font-size:clamp(2.4rem, 4.4vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#1f1a17;line-height:1.15;margin:0 0 20px;">
                  ${esc(heroTitle)}
                </h1>
                <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(heroSubtitle)}
                </p>
                <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:8px;font-size:0.95rem;font-weight:800;color:#ffffff;background:${theme.btnGradient};box-shadow:0 6px 18px rgba(29,78,216,0.25);">
                    ${isZh ? '探索实木家具系列' : 'Explore Furniture Collection'} ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:13px 26px;border-radius:8px;font-size:0.95rem;font-weight:700;color:#1f1a17;background:#ffffff;border:1px solid #d6d1c9;">
                    ${isZh ? '百年榫卯与工艺标准' : 'Joinery Standards'}
                  </a>
                </div>
              </div>

              <!-- Hero Featured Product Card (Clean White Bauhaus Style) -->
              <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #dfdad2;border-radius:20px;padding:24px;box-shadow:0 12px 36px rgba(31,26,23,0.06);">
                <div style="position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#f0eae0;margin-bottom:20px;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:cover;">
                  <span style="position:absolute;bottom:12px;left:12px;padding:4px 12px;border-radius:4px;background:#1f1a17;color:#ffffff;font-size:0.75rem;font-weight:800;">
                    FAS Grade American Walnut
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <h3 style="font-size:1.15rem;font-weight:900;color:#1f1a17;margin:0 0 4px;">
                      ${esc(heroProduct.name)}
                    </h3>
                    <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;">
                      ${esc(heroMeta.spec1)}
                    </p>
                  </div>
                  <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:8px 16px;border-radius:6px;background:#1f1a17;color:#ffffff;font-size:0.82rem;font-weight:700;">
                    ${esc(ui.details)} ↗
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- Joinery & Craftsmanship Manifesto (Unique to Banner Template) -->
          <section class="wrap" style="padding:80px 0 50px;" data-reveal="fade-up">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};">STRUCTURAL PURITY</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#1f1a17;margin:8px 0 14px;">
                ${isZh ? '隐形高强力学榫卯与无醛木蜡油' : 'Precision Joinery & Zero-VOC Botanical Hardwax'}
              </h2>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0;">
                ${isZh ? '舍弃廉价五金胶水，采用精密数控公母榫嵌合与悬臂预应力结构，自然对抗木材干缩湿胀。'
                        : 'Eliminating synthetic glues and nails with precision CNC mortise & tenon joinery, finished with organic plant-based hardwax oil.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">01 / FAS TIMBER</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#1f1a17;margin:0 0 10px;">
                  ${isZh ? '北美原产地 FAS 特级黑胡桃' : 'FAS American Walnut Timber'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '含水率恒定控制在 8%–10%，历经二次真空平衡干燥，确保跨洲海运与高纬度采暖季零开裂。'
                          : 'Moisture content strictly stabilized at 8-10% through secondary vacuum balance kilns, preventing warping.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">02 / BIFMA 150KG</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#1f1a17;margin:0 0 10px;">
                  ${isZh ? 'BIFMA X5.5 重载静压破坏试验' : 'BIFMA X5.5 Load Compliance'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '悬浮大餐桌与置物架通过 150kg 集中载荷及 20,000 次往复推拉冲击测试，结构稳定性达商用级。'
                          : 'Cantilever tables withstand 150kg concentrated load and 20,000 dynamic cycles with zero deflection.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">03 / FLAT-PACK</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#1f1a17;margin:0 0 10px;">
                  ${isZh ? '平板化外销防刮蜂窝装箱' : 'Export Flat-Pack Engineering'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '平整化模块拆装使集装箱装载体积精简 60%，配合高抗冲蜂窝纸角与发泡膜，海运零货损。'
                          : 'Volume reduced by 60% with heavy-duty honeycomb edge protection and custom moisture-barrier liners.'}
                </p>
              </div>
            </div>
          </section>

          <!-- Architectural Products Grid -->
          <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#1f1a17;margin:6px 0 0;">
                  ${isZh ? '包豪斯原木建筑家具全系' : 'Architectural Furniture Collection'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '查看全部 8 款经典 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 16px rgba(31,26,23,0.03);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:78%;overflow:hidden;background:#efeae2;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:3px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:#ffffff;color:#1f1a17;border:1px solid #d6d1c9;">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.12rem;font-weight:800;color:#1f1a17;line-height:1.3;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.description || '')}
                      </p>
                      <div style="padding-top:14px;border-top:1px solid #f0ebe4;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;font-weight:700;color:${theme.textSub};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
    // CATALOG PAGE: Dedicated Filtering & Grid with High Contrast
    // -------------------------------------------------------------
    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || 'Architectural Furniture & Spatial Systems')}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${isVideo ? '#ffffff' : '#1f1a17'};margin:0 0 14px;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '浏览工程全系实木与模块化收纳体系，提供完整规格图纸、BIFMA 检测报告与小批量 OEM 定制。'
                      : 'Explore full manufacturing collection, engineered to architectural specifications and global compliance.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
              return `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:${isVideo ? '#0d1017' : '#efeae2'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    ${meta.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};background:${isVideo ? 'rgba(0,0,0,0.6)' : '#ffffff'};border:1px solid ${isVideo ? 'rgba(255,255,255,0.2)' : '#d6d1c9'};">${esc(meta.badge)}</span>` : ''}
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Architectural Furniture')}
                    </div>
                    <h2 style="font-size:1.12rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};line-height:1.35;margin:0 0 8px;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.description || '')}
                    </p>
                    <div style="background:${isVideo ? 'rgba(255,255,255,0.03)' : '#f7f5f0'};padding:10px 12px;border-radius:8px;font-size:0.78rem;color:${theme.textSub};margin-bottom:16px;">
                      <strong>${isZh ? '规格' : 'Spec'}:</strong> ${esc(meta.spec1 || 'Standard')}
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
    // DETAIL PAGE: High-Contrast Technical Specs & Sample Request
    // -------------------------------------------------------------
    const meta = (selectedProduct as ThemedItem).spec1 ? (selectedProduct as ThemedItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img;

    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:40px 0 100px;">
        <div class="wrap">
          <!-- Breadcrumb -->
          <nav aria-label="Breadcrumb" style="font-size:0.84rem;color:${theme.textSub};margin-bottom:28px;">
            <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
            <span style="margin:0 8px;">/</span>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
            <span style="margin:0 8px;">/</span>
            <span style="color:${theme.primary};font-weight:700;">${esc(selectedProduct.name)}</span>
          </nav>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
            <!-- Main Product Image -->
            <div style="border-radius:18px;overflow:hidden;background:${isVideo ? '#0d1017' : '#ffffff'};border:1px solid ${theme.cardBorder};box-shadow:0 8px 30px rgba(0,0,0,${isVideo ? '0.3' : '0.06'});">
              <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
            </div>

            <!-- Product Specs & Inquiries -->
            <div>
              <div style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.categoryNameEn || 'Architectural Specification')}
              </div>
              <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:${isVideo ? '#ffffff' : '#1f1a17'};line-height:1.2;margin:0 0 16px;">
                ${esc(selectedProduct.name)}
              </h1>
              <p style="font-size:1.05rem;line-height:1.75;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(selectedProduct.description || '')}
              </p>

              <!-- Technical Specifications Table -->
              <div style="padding:22px;border-radius:14px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};margin-bottom:28px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.88rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '材质标准' : 'Material Spec'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#1f1a17'};">${esc(meta.spec1 || (selectedProduct as any).material || 'Architectural Grade')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '尺寸容量' : 'Dimensions'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#1f1a17'};">${esc(meta.spec2 || (selectedProduct as any).dimensions || 'Standard Export Spec')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '结构认证' : 'Structural Rating'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#1f1a17'};">BIFMA X5.5 / 150kg Static Load</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '订货起订量' : 'MOQ'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#1f1a17'};">${esc(meta.moq || '30 Pcs')}</strong>
                  </div>
                </div>
              </div>

              <!-- High Contrast Sample & Quotation Form -->
              <div style="padding:28px;border-radius:16px;background:${isVideo ? 'rgba(255,255,255,0.04)' : '#ffffff'};border:1px solid ${theme.cardBorder};box-shadow:0 6px 24px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
                <h3 style="font-size:1.15rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};margin:0 0 6px;">
                  ${isZh ? '索取实物样品与外销报价单' : 'Request Quotation & Physical Samples'}
                </h3>
                <p style="font-size:0.86rem;color:${theme.textMuted};margin:0 0 16px;">
                  ${isZh ? '提供原木木块色板、阳极氧化铝样段寄送及 3D BIM/CAD 图纸支持。' : 'Physical material swatches and CAD/BIM packages dispatched within 48h.'}
                </p>
                <form action="${path('contact/index.html')}" method="GET" style="display:flex;flex-direction:column;gap:12px;">
                  <input type="hidden" name="productId" value="${esc(selectedProduct.id)}" />
                  <input type="email" placeholder="${isZh ? '输入您的企业采购邮箱' : 'Enter your corporate business email'}" required style="padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;outline:none;box-sizing:border-box;" />
                  <button type="submit" style="padding:13px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;border:none;cursor:pointer;">
                    ${isZh ? '申请项目工程打样' : 'Submit Sample Request'} ↗
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    // -------------------------------------------------------------
    // ABOUT PAGE: Manufacturing Heritage & Precision Engineering
    // -------------------------------------------------------------
    const aboutHeadline = getAboutHeadline(company, isZh ? '空间构筑 · 现代极简家具与模块收纳系统' : 'Spatial Architecture & Modular Furniture Guild');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Craftsmanship heritage' },
      { value: 'FAS Grade', num: 100, suffix: ' FAS', label: isZh ? '北美黑胡桃原产地纯度' : 'Genuine American Timber', desc: 'Sustainably harvested' },
      { value: '150 kg', num: 150, suffix: ' kg', label: isZh ? '单层模块化隔板静载极限' : 'Per-Shelf Load Rating', desc: 'BIFMA certified' },
      { value: '7-10 Days', num: 7, suffix: ' Days', label: isZh ? '快速结构工程打样与开料' : 'Rapid Engineering Samples', desc: '5-Axis CNC center' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:820px;margin:0 auto 60px;text-align:center;">
            <div style="display:inline-block;padding:4px 16px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
              ${isZh ? '关于我们的匠心制造' : 'ABOUT OUR CRAFT GUILD'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${isVideo ? '#ffffff' : '#1f1a17'};line-height:1.2;margin:0 0 24px;">
              ${esc(aboutHeadline)}
            </h1>
            <div style="display:flex;flex-direction:column;gap:18px;font-size:1.05rem;line-height:1.8;color:${theme.textMuted};text-align:left;">
              ${paragraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
          </div>

          <!-- Metric Counters Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;margin-bottom:60px;">
            ${highlights.map((h) => `
              <div style="padding:28px 20px;border-radius:14px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};text-align:center;box-shadow:0 4px 16px rgba(0,0,0,${isVideo ? '0.2' : '0.03'});">
                <div style="font-size:2.6rem;font-weight:900;color:${theme.primary};line-height:1;"><span>${esc(h.value)}</span></div>
                <div style="font-size:0.86rem;color:${isVideo ? '#ffffff' : '#1f1a17'};margin-top:10px;font-weight:700;">${esc(h.label)}</div>
                ${h.desc ? `<div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">${esc(h.desc)}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Factory Imagery -->
          <div style="border-radius:18px;overflow:hidden;background:${isVideo ? '#0d1017' : '#ffffff'};border:1px solid ${theme.cardBorder};margin-bottom:40px;">
            <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:440px;object-fit:cover;display:block;" loading="lazy">
          </div>
        </div>
      </main>
    `;
  } else if (page === 'contact') {
    // -------------------------------------------------------------
    // CONTACT PAGE: High-Contrast Form & Distinct Clean Layout
    // -------------------------------------------------------------
    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:800px;margin:0 auto 50px;text-align:center;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || 'Architectural Furniture & Spatial Systems')}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${isVideo ? '#ffffff' : '#1f1a17'};margin:0 0 16px;">
              ${esc(ui.contact)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;">
              ${isZh ? '直接与我们的工程制造团队对接，获取技术参数、项目深化与外销集装箱货运报价。'
                      : 'Connect directly with our engineering and production teams for quotes, BIM models, and physical material samples.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:40px;align-items:flex-start;">
            <!-- Contact Details Card -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
              <h3 style="font-size:1.25rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};margin:0 0 20px;">
                ${isZh ? '工程总部与智造基地' : 'Global Headquarters & Manufacturing Base'}
              </h3>
              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:${theme.textMuted};">
                <div>
                  <strong style="color:${isVideo ? '#ffffff' : '#1f1a17'};display:block;margin-bottom:2px;">Direct Email:</strong>
                  <a style="color:${theme.primary};font-weight:700;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
                </div>
                ${company.phone ? `
                  <div>
                    <strong style="color:${isVideo ? '#ffffff' : '#1f1a17'};display:block;margin-bottom:2px;">Phone / Tel:</strong>
                    <a style="color:${theme.textMuted};text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
                  </div>
                ` : ''}
                ${company.address ? `
                  <div>
                    <strong style="color:${isVideo ? '#ffffff' : '#1f1a17'};display:block;margin-bottom:2px;">Facility Address:</strong>
                    <span style="line-height:1.5;">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>

              <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:8px;">
                  ${isZh ? '交付保障' : 'ENGINEERING COMMITMENT'}
                </div>
                <ul style="margin:0;padding-left:18px;font-size:0.84rem;color:${theme.textSub};line-height:1.7;">
                  <li>${isZh ? '7个工作日快速完成 5 轴数控实体样板打样' : '7 business days 5-Axis CNC physical sample'}</li>
                  <li>${isZh ? '提供 SGS / TÜV / BIFMA 结构荷载力学报告' : 'BIFMA / TÜV structural load compliance test'}</li>
                  <li>${isZh ? '全平整外销包装，集装箱海运零货损' : 'Flat-pack containerized zero-damage packing'}</li>
                </ul>
              </div>
            </div>

            <!-- Contact Form Card with Crisp High-Contrast Fields -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
              <h3 style="font-size:1.25rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};margin:0 0 20px;">
                ${isZh ? '填写采购询盘与定制需求' : 'Submit Project Inquiry'}
              </h3>
              <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};margin-bottom:6px;">
                      ${isZh ? '联系人姓名' : 'Your Name'} *
                    </label>
                    <input name="name" autocomplete="name" required maxlength="120" type="text" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};margin-bottom:6px;">
                      ${isZh ? '企业电子邮箱' : 'Business Email'} *
                    </label>
                    <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};margin-bottom:6px;">
                    ${isZh ? '意向产品' : 'Interested Product'} (${esc(ui.optional)})
                  </label>
                  <select name="productId" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;">
                    <option value="">— ${isZh ? '选择感兴趣的产品' : 'Select Product of Interest'} —</option>
                    ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#1f1a17'};margin-bottom:6px;">
                    ${isZh ? '项目说明与工程技术要求' : 'Project Details & Specifications'} *
                  </label>
                  <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请描述您的项目数量、期望材质工艺、交货地点或图纸要求...' : 'Please specify project quantities, custom timber/hardware specs, delivery terms...'}" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;resize:vertical;box-sizing:border-box;outline:none;font-family:inherit;"></textarea>
                </div>

                <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>

                <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:15px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:1rem;font-weight:900;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.18);">
                  ${isZh ? '发送项目工程询盘' : 'Send Project Inquiry'} ↗
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  // Footer Component
  const footerHtml = `
    <footer style="background:${theme.footerBg};border-top:1px solid ${theme.footerBorder};padding:60px 0 30px;color:#94a3b8;font-size:0.88rem;">
      <div class="wrap" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="width:34px;height:34px;border-radius:8px;background:${theme.btnGradient};display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M20 7h-9M14 17H5M3 3v18M21 3v18M7 7v10M17 7v10"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Architectural Furniture & Spatial Systems')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0 0 16px;max-width:320px;">
            ${isZh ? '包豪斯实木家具与空间收纳 · 全球品质工程供应链' : 'Architectural Furniture & Spatial Systems · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '北美FAS级黑胡桃木悬浮实木餐桌' : 'Solid Walnut Dining Tables'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '模块化铝框极简置物书架系统' : 'Modular Aluminum Bookshelves'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '人体工学曲木羊羔绒单人休闲椅' : 'Bouclé Cloud Armchairs'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺实力' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('FAS Grade')} ${isZh ? '北美黑胡桃原产地纯度' : 'Genuine American Timber'}</li>
            <li>✓ ${esc('150 kg')} ${isZh ? '单层模块化隔板静载极限' : 'Per-Shelf Load Rating'}</li>
            <li>✓ ${esc('BIFMA X5.5')} ${isZh ? '欧美商用重载工程认证' : 'Commercial Load Certified'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:${theme.primary};text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#94a3b8;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid ${theme.footerBorder};padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '包豪斯家具与空间收纳旗舰版' : 'Architectural Furniture & Spatial Systems Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
