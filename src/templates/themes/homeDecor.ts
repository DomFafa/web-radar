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
    "id": "dec-1",
    "name": "Hand-Thrown Textured Wabi-Sabi Ceramic Vessel Vase",
    "description": "Wheel-thrown coarse stoneware with volcanic ash reactive glaze, organic asymmetric silhouette, and unglazed tactile matte exterior.",
    "badge": "Artisan Stoneware",
    "category": "vase",
    "categoryNameZh": "侘寂风手工拉坯火山岩粗陶花器",
    "categoryNameEn": "Wabi-Sabi Ceramic Vases",
    "spec1": "High-Fire Natural Stoneware (1280°C Kiln)",
    "spec2": "28 × 18 × 18 cm · Unglazed Volcanic Texture",
    "moq": "60 Pcs per Batch",
    "tagline": "Embracing Organic Imperfection",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "dec-2",
    "name": "Architectural Fluted Smoked Glass Ambient Pendant Light",
    "description": "Mouth-blown fluted borosilicate smoked glass shade accented with brushed champagne gold hardware and warm 2700K dimmable LED core.",
    "badge": "Ambient Luminaire",
    "category": "lighting",
    "categoryNameZh": "波浪条纹烟熏玻璃中古氛围吊灯",
    "categoryNameEn": "Fluted Glass Pendants",
    "spec1": "Mouth-Blown Borosilicate Glass + Solid Brass Canopy",
    "spec2": "32cm Dia · 2700K Dimmable Warm Glow · 150cm Braided Cord",
    "moq": "40 Pcs per Order",
    "tagline": "Sculptural Atmosphere in Soft Shadows",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "dec-3",
    "name": "Solid Travertine Minimalist Sculptural Bookend Pair",
    "description": "Carved from solid Italian Roman unpolished travertine marble with natural porous cavities and hand-chamfered geometric facets.",
    "badge": "Natural Stone",
    "category": "sculpture",
    "categoryNameZh": "意大利天然米黄洞石几何书立摆件",
    "categoryNameEn": "Travertine Sculptural Bookends",
    "spec1": "100% Natural Italian Beige Travertine Stone",
    "spec2": "18 × 12 × 7 cm (Each) · 3.4 kg Combined Weight",
    "moq": "50 Pairs per Batch",
    "tagline": "Millennia of Geological Architecture",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "dec-4",
    "name": "Pure French Flax Stonewashed Linen Throw Blanket",
    "description": "Woven from 100% certified Normandy flax with relaxed fringed edges, enzyme-softened for lived-in drape and breathable year-round comfort.",
    "badge": "Normandy Linen",
    "category": "textile",
    "categoryNameZh": "法国诺曼底水洗亚麻流苏沙发盖毯",
    "categoryNameEn": "French Linen Blankets",
    "spec1": "100% GOTS & Masters of Linen® French Flax (240 GSM)",
    "spec2": "140 × 200 cm · Pre-Shrunk & Enzyme Softened",
    "moq": "80 Pcs per Color",
    "tagline": "Tactile Sanctuary of Natural Fibers",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "dec-5",
    "name": "Brushed Champagne Brass Kinetic Tabletop Mobile",
    "description": "Delicately counterbalanced kinetic sculpture engineered from solid brushed brass vanes that drift in subtle indoor air currents.",
    "badge": "Kinetic Art",
    "category": "sculpture",
    "categoryNameZh": "包豪斯风微风动态平衡黄铜桌面风动仪",
    "categoryNameEn": "Kinetic Brass Mobiles",
    "spec1": "Solid Precision-Turned Brass + Stainless Steel Pivot",
    "spec2": "45 × 38 cm Sweep · Solid Marble Pedestal Base",
    "moq": "30 Pcs per Run",
    "tagline": "Meditative Movement in Spatial Balance",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "dec-6",
    "name": "Organic Mineral Plaster Textured Wall Art Triptych",
    "description": "Hand-troweled natural lime mineral plaster on linen-wrapped wood panel featuring serene relief ridges and neutral earthy warmth.",
    "badge": "Mineral Canvas",
    "category": "wallart",
    "categoryNameZh": "天然矿物微水泥肌理浮雕三联壁画",
    "categoryNameEn": "Mineral Textured Wall Art",
    "spec1": "Eco Lime Plaster + Solid Oak Float Frame",
    "spec2": "60 × 80 cm (Set of 3 Panels) · Zero-VOC Formulation",
    "moq": "20 Sets per Order",
    "tagline": "Architectural Relief of Organic Serenity",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "dec-7",
    "name": "Hand-Poured Botanical Soy Wax Amber Glass Candle Set",
    "description": "Clean-burning soy wax infused with essential oils of cedarwood, fig leaf, and amber, poured into heavy apothecary amber jars with wooden wicks.",
    "badge": "Aromatherapy",
    "category": "fragrance",
    "categoryNameZh": "天然大豆蜡琥珀药剂师精油香薰蜡烛",
    "categoryNameEn": "Botanical Amber Candles",
    "spec1": "100% Non-GMO Soy Wax + FSC Certified Crackling Wood Wick",
    "spec2": "280g / 65h Burn Time (Trio Gift Box Presentation)",
    "moq": "150 Sets per Fragrance",
    "tagline": "Olfactory Atmosphere of Forest & Sun",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "dec-8",
    "name": "Nordic Hand-Knotted Wool Berber Low-Pile Area Rug",
    "description": "Hand-spun unbleached New Zealand wool woven by master weavers into subtle asymmetric linear motifs with plush tactile warmth.",
    "badge": "Hand-Knotted Wool",
    "category": "rug",
    "categoryNameZh": "新西兰纯羊毛手工打结北欧极简地毯",
    "categoryNameEn": "Nordic Hand-Knotted Rugs",
    "spec1": "100% Natural Unbleached New Zealand Wool + Cotton Warp",
    "spec2": "200 × 300 cm · 18mm Plush Pile · GoodWeave Certified",
    "moq": "15 Pcs per Size",
    "tagline": "Underfoot Warmth of Timeless Architecture",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderHomeDecorPage(ctx: ThemeContext, isVideo: boolean): string {
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
            categoryNameZh: '家居装饰与生活美学',
            categoryNameEn: 'Home Decor & Living Aesthetics',
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
  // isVideo = false: homedecor-aesthetic-banner (Warm Oat Milk Japandi & Terracotta Sanctuary)
  // isVideo = true: homedecor-living-video (Dark Smoked Charcoal & Champagne Bronze Ambient Light)
  const theme = isVideo ? {
    name: 'living-video',
    bg: '#121316',
    bgSoft: '#1a1c22',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(224, 169, 109, 0.22)',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    textSub: '#6b7280',
    primary: '#e0a96d', // Champagne Bronze Ambient Light
    accent: '#d49b5c',
    headerBg: 'rgba(18, 19, 22, 0.88)',
    headerBorder: 'rgba(224, 169, 109, 0.22)',
    inputBg: 'rgba(26, 28, 34, 0.7)',
    inputBorder: 'rgba(224, 169, 109, 0.3)',
    inputText: '#ffffff',
    badgeBg: 'rgba(224, 169, 109, 0.12)',
    badgeText: '#e0a96d',
    badgeBorder: 'rgba(224, 169, 109, 0.3)',
    btnGradient: 'linear-gradient(135deg, #e0a96d 0%, #b87a3e 100%)',
    btnText: '#121316',
    pillActive: '#e0a96d',
    pillText: '#121316',
    footerBg: '#0b0b0d',
    footerBorder: '#23252d',
  } : {
    name: 'aesthetic-banner',
    bg: '#fbf9f5',
    bgSoft: '#f3ede4',
    cardBg: '#ffffff',
    cardBorder: '#e8dfd2',
    text: '#2d2926',
    textMuted: '#685e56',
    textSub: '#8a7d74',
    primary: '#a85d42', // Terracotta Clay
    accent: '#6b7c66', // Sage Green
    headerBg: 'rgba(251, 249, 245, 0.92)',
    headerBorder: 'rgba(232, 223, 210, 0.85)',
    inputBg: '#ffffff',
    inputBorder: '#ded5c7',
    inputText: '#2d2926',
    badgeBg: 'rgba(168, 93, 66, 0.08)',
    badgeText: '#a85d42',
    badgeBorder: 'rgba(168, 93, 66, 0.25)',
    btnGradient: 'linear-gradient(135deg, #a85d42 0%, #87432c 100%)',
    btnText: '#ffffff',
    pillActive: '#2d2926',
    pillText: '#ffffff',
    footerBg: '#2d2926',
    footerBorder: '#423b37',
  };

  const heroTitle = isVideo
    ? (isZh ? '现代都会光影 · 建筑氛围照明与雕塑空间美学' : 'Contemporary Ambient Living & Sculptural Lighting')
    : (isZh ? '北欧质朴侘寂 · 天然粗陶器物与有机居室美学' : 'Nordic Japandi & Organic Living Sanctuary');

  const heroSubtitle = isVideo
    ? (isZh ? '2700K 晨昏自然暖调、流光烟熏玻璃与平衡动态风动仪，为现代都会平层与精品酒店塑造富有层次的幽玄光影空间。'
            : 'Sculptural fluted glass luminaires, kinetic brass mobiles, and ambient 2700K warm illumination crafted for architectural interiors.')
    : (isZh ? '1280°C 高温自然窑变粗陶花器、法国水洗亚麻与天然米黄洞石，用手作温度抚平喧嚣，构筑身心回归宁静的居家避风港。'
            : 'Hand-thrown wabi-sabi stoneware, pure French Normandy flax linen, and natural Italian travertine bookends celebrating tactile warmth.');

  // Header Component
  const headerHtml = `
    <header class="theme-header" style="position:sticky;top:0;z-index:99;background:${theme.headerBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.headerBorder};">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:8px;background:${theme.btnGradient};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.15);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"/></svg>
          </div>
          <div>
            <div style="font-size:1.15rem;font-weight:900;letter-spacing:-0.02em;color:${isVideo ? '#ffffff' : '#2d2926'};line-height:1.1;">
              ${esc(company.name || (isVideo ? 'Ambient Living Studio' : 'Nordic Japandi Guild'))}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};font-weight:800;">
              ${isZh ? (isVideo ? '都会光影与空间雕塑' : '北欧侘寂家居美学') : (isVideo ? 'Ambient Living Studio' : 'Nordic Japandi Guild')}
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
            <span>${isZh ? '软装工程合作' : 'Trade Program'}</span>
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
      // 1. VIDEO TEMPLATE: Contemporary Ambient Living & Sculptural Lighting
      // -------------------------------------------------------------
      const videoAsset = ctx.asset(draft.heroAssetId);
      const heroPoster = '/templates/senseng/hero-sky.jpg';

      mainHtml = `
        <main class="homedecor-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Ambient Light Shift Video -->
          <section style="position:relative;width:100%;min-height:85vh;overflow:hidden;background:#0b0c0e;display:flex;align-items:center;">
            <video autoplay loop muted playsinline poster="${esc(heroPoster)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.42;z-index:1;">
              ${videoAsset ? `<source src="${esc(videoAsset)}" type="video/mp4">` : ''}
            </video>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 65% 35%, rgba(224,169,109,0.15) 0%, rgba(18,19,22,0.85) 75%, #121316 100%);z-index:2;"></div>
            
            <div class="wrap" style="position:relative;z-index:3;padding:90px 20px;max-width:980px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:20px;" data-reveal="fade-up">
                <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};box-shadow:0 0 8px ${theme.primary};"></span>
                <span style="color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                  ${isZh ? '都会空间光影 · 建筑雕塑与现代居室美学' : 'ARCHITECTURAL ILLUMINATION & SCULPTURAL LIVING'}
                </span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 5vw, 4rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 22px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.7;color:${theme.textMuted};margin:0 0 36px;max-width:740px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:8px;font-size:0.98rem;font-weight:800;color:${theme.btnText};background:${theme.btnGradient};box-shadow:0 8px 24px rgba(224,169,109,0.35);">
                  ${isZh ? '探索都会光影系列' : 'Explore Ambient Pieces'} ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;font-size:0.98rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);">
                  ${isZh ? '建筑室内软装合作' : 'Design Trade Program'}
                </a>
              </div>
            </div>
          </section>

          <!-- Ambient Lighting & Spatial Balance Showcase -->
          <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
            <div style="background:${theme.bgSoft};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">LIGHT & ACOUSTICS</span>
                  <h2 style="font-size:clamp(1.6rem, 2.5vw, 2.2rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                    ${isZh ? '建筑级光环境与感官平衡' : 'Sensory Balance & Architectural Illumination'}
                  </h2>
                </div>
                <div style="font-size:0.88rem;color:${theme.textMuted};">
                  ${isZh ? '无频闪温润色温与欧盟 CE/RoHS 环保安全认证' : 'Flicker-Free 2700K Core & CE/RoHS Certified'}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};">2700 K</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '日暮温润黄金光色温' : 'Dusk Warm Ambient Temp'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Zero-glare diffused optics</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;" data-counter="95" data-suffix=" Ra">Ra 95+</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '全光谱高显色指数' : 'High Color Rendering Index'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">True-to-life interior hues</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};" data-counter="100" data-suffix="%">100%</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '实心黄铜精密车削' : 'Solid Turned Brass'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Hand-brushed protective clear coat</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;">0 VOC</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '天然矿物石膏环保配方' : 'Zero-VOC Lime Plasters'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Organic air-purifying relief</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Ambient Sculptural Pieces Grid -->
          <section class="wrap" style="padding:50px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">GALLERY EXHIBITION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                  ${isZh ? '现代居室艺术摆件与光影精选' : 'Curated Ambient Artworks'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '浏览全部 ↗' : 'View Full Gallery ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:#0e1014;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(18,19,22,0.85);backdrop-filter:blur(8px);border:1px solid ${theme.primary};color:${theme.primary};">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                      <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                        ${esc(meta.categoryNameEn || 'Ambient Decor')}
                      </div>
                      <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;line-height:1.3;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.55;margin:0 0 16px;flex:1;">
                        ${esc(item.description || '')}
                      </p>
                      <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;color:${theme.textSub};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:6px 14px;border-radius:6px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.8rem;font-weight:800;">
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
      // 2. BANNER TEMPLATE: Nordic Japandi & Ceramic Warm Sanctuary
      // -------------------------------------------------------------
      mainHtml = `
        <main class="homedecor-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Japandi Warm Sanctuary Banner -->
          <section style="position:relative;padding:90px 0 80px;border-bottom:1px solid ${theme.cardBorder};background:linear-gradient(180deg, #fbf9f5 0%, #f4eee5 100%);">
            <div class="wrap" style="display:grid;grid-template-columns:1.15fr 1fr;gap:50px;align-items:center;">
              <div data-reveal="fade-up">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:18px;">
                  <span style="font-size:0.75rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${theme.badgeText};">
                    JAPANDI CERAMIC GUILD · RAW TEXTURES
                  </span>
                </div>
                <h1 style="font-size:clamp(2.4rem, 4.4vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#2d2926;line-height:1.15;margin:0 0 20px;">
                  ${esc(heroTitle)}
                </h1>
                <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(heroSubtitle)}
                </p>
                <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:8px;font-size:0.95rem;font-weight:800;color:#ffffff;background:${theme.btnGradient};box-shadow:0 6px 18px rgba(168,93,66,0.25);">
                    ${isZh ? '探索质朴居室好物' : 'Explore Sanctuary Pieces'} ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:13px 26px;border-radius:8px;font-size:0.95rem;font-weight:700;color:#2d2926;background:#ffffff;border:1px solid #ddd4c7;">
                    ${isZh ? '粗陶拉坯与慢生活哲学' : 'Wabi-Sabi Craft Philosophy'}
                  </a>
                </div>
              </div>

              <!-- Hero Featured Vessel Card -->
              <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #ded5c7;border-radius:20px;padding:24px;box-shadow:0 12px 36px rgba(45,41,38,0.06);">
                <div style="position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#f0eae0;margin-bottom:20px;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:cover;">
                  <span style="position:absolute;bottom:12px;left:12px;padding:4px 12px;border-radius:4px;background:#2d2926;color:#ffffff;font-size:0.75rem;font-weight:800;">
                    1280°C High-Fire Stoneware
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <h3 style="font-size:1.15rem;font-weight:900;color:#2d2926;margin:0 0 4px;">
                      ${esc(heroProduct.name)}
                    </h3>
                    <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;">
                      ${esc(heroMeta.spec1)}
                    </p>
                  </div>
                  <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:8px 16px;border-radius:6px;background:#2d2926;color:#ffffff;font-size:0.82rem;font-weight:700;">
                    ${esc(ui.details)} ↗
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- Sensory Materials Manifesto (Unique to Aesthetic Banner) -->
          <section class="wrap" style="padding:80px 0 50px;" data-reveal="fade-up">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};">RAW MATERIALS</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#2d2926;margin:8px 0 14px;">
                ${isZh ? '取材大地的质朴触感与天然材质' : 'Tactile Sanctuary of Natural Materials'}
              </h2>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0;">
                ${isZh ? '拒绝工业化塑料合成物，专注于高温原矿陶土、未漂白诺曼底亚麻与意大利古老洞石的纯粹生命力。'
                        : 'Rejecting synthetic polymers in favor of high-fire minerals, unbleached Normandy linen, and raw travertine stone.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">01 / STONEWARE</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#2d2926;margin:0 0 10px;">
                  ${isZh ? '手工拉坯火山岩粗陶' : 'Wheel-Thrown Stoneware'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '含铁矿物原浆手工拉坯，保留轮盘旋转的微妙手作指痕，经柴窑高温煅烧呈现自然结晶肌理。'
                          : 'Hand-thrown on traditional wheels with mineral-rich clay, capturing the organic fingerprints of the artisan.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">02 / NORMANDY LINEN</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#2d2926;margin:0 0 10px;">
                  ${isZh ? '法国诺曼底水洗亚麻' : 'French Normandy Flax Linen'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? 'GOTS 认证纯天然亚麻，天然雨露沤麻工艺，经环保酵素软化，越洗越柔和，四季亲肤透气。'
                          : 'Dew-retted certified French flax, softened with bio-enzymes for an airy, lived-in textural drape.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">03 / TRAVERTINE</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#2d2926;margin:0 0 10px;">
                  ${isZh ? '意大利天然未抛光洞石' : 'Natural Roman Travertine'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '地质温泉沉淀数万年的碳酸钙多孔石材，不作人工树脂填孔，保留自然风化洞隙与哑光古拙感。'
                          : 'Unfilled natural travertine stone preserving geological voids formed over millennia in thermal springs.'}
                </p>
              </div>
            </div>
          </section>

          <!-- Sanctuary Collection Grid -->
          <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#2d2926;margin:6px 0 0;">
                  ${isZh ? '日式侘寂居室器物全系' : 'Organic Living Sanctuary Pieces'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '品鉴全部 8 款器物 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 16px rgba(45,41,38,0.03);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:78%;overflow:hidden;background:#efeae2;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:3px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:#ffffff;color:#2d2926;border:1px solid #ded5c7;">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.12rem;font-weight:800;color:#2d2926;line-height:1.3;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.description || '')}
                      </p>
                      <div style="padding-top:14px;border-top:1px solid #f2ece4;display:flex;justify-content:space-between;align-items:center;">
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
    // CATALOG PAGE: High-Contrast Cards & Clear Typography
    // -------------------------------------------------------------
    mainHtml = `
      <main class="homedecor-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Ambient Living Studio' : 'Nordic Japandi Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${isVideo ? '#ffffff' : '#2d2926'};margin:0 0 14px;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '探索全系手作粗陶、法国亚麻与空间光影装饰品，支持设计事务所软装打样与外销大宗定制。'
                      : 'Explore our complete home decor and ambient living collection, engineered for interior designers and hospitality procurement.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
              return `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:${isVideo ? '#0e1014' : '#efeae2'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    ${meta.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;color:${isVideo ? theme.primary : '#2d2926'};background:${isVideo ? 'rgba(18,19,22,0.85)' : '#ffffff'};border:1px solid ${isVideo ? theme.primary : '#ded5c7'};">${esc(meta.badge)}</span>` : ''}
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Living Decor')}
                    </div>
                    <h2 style="font-size:1.12rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};line-height:1.35;margin:0 0 8px;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.description || '')}
                    </p>
                    <div style="background:${isVideo ? 'rgba(255,255,255,0.03)' : '#f6f0e6'};padding:10px 12px;border-radius:8px;font-size:0.78rem;color:${theme.textSub};margin-bottom:16px;">
                      <strong>${isZh ? '材质参数' : 'Spec'}:</strong> ${esc(meta.spec1 || 'Standard')}
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.82rem;font-weight:700;">
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
    // DETAIL PAGE: High-Contrast Specs & id="wr-detail-main-img"
    // -------------------------------------------------------------
    const meta = (selectedProduct as ThemedItem).spec1 ? (selectedProduct as ThemedItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img;

    mainHtml = `
      <main class="homedecor-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:40px 0 100px;">
        <div class="wrap">
          <nav aria-label="Breadcrumb" style="font-size:0.84rem;color:${theme.textSub};margin-bottom:28px;">
            <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
            <span style="margin:0 8px;">/</span>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
            <span style="margin:0 8px;">/</span>
            <span style="color:${theme.primary};font-weight:700;">${esc(selectedProduct.name)}</span>
          </nav>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
            <!-- Main Product Image -->
            <div style="border-radius:18px;overflow:hidden;background:${isVideo ? '#0e1014' : '#ffffff'};border:1px solid ${theme.cardBorder};box-shadow:0 8px 30px rgba(0,0,0,${isVideo ? '0.3' : '0.06'});">
              <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
            </div>

            <!-- Product Specs & Inquiries -->
            <div>
              <div style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.categoryNameEn || 'Home Decor Specification')}
              </div>
              <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:${isVideo ? '#ffffff' : '#2d2926'};line-height:1.2;margin:0 0 16px;">
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
                    <strong style="color:${isVideo ? '#ffffff' : '#2d2926'};">${esc(meta.spec1 || (selectedProduct as any).material || 'Artisanal Natural')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '尺寸重量' : 'Dimensions'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#2d2926'};">${esc(meta.spec2 || (selectedProduct as any).dimensions || 'Standard Export Spec')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '环保认证' : 'Sustainability'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#2d2926'};">GOTS / Zero-VOC Certified</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '采购起订量' : 'MOQ'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#2d2926'};">${esc(meta.moq || '50 Pcs')}</strong>
                  </div>
                </div>
              </div>

              <!-- High Contrast Sample & Quotation Form -->
              <div style="padding:28px;border-radius:16px;background:${isVideo ? 'rgba(255,255,255,0.04)' : '#ffffff'};border:1px solid ${theme.cardBorder};box-shadow:0 6px 24px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
                <h3 style="font-size:1.15rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};margin:0 0 6px;">
                  ${isZh ? '申请实物陶艺样件与软装报价' : 'Request Material Sample & Project Quote'}
                </h3>
                <p style="font-size:0.86rem;color:${theme.textMuted};margin:0 0 16px;">
                  ${isZh ? '支持设计师专属定制、陶土色卡邮寄与海运安全防震木箱托运。' : 'Physical swatches, custom glazes, and secure export crating available.'}
                </p>
                <form action="${path('contact/index.html')}" method="GET" style="display:flex;flex-direction:column;gap:12px;">
                  <input type="hidden" name="productId" value="${esc(selectedProduct.id)}" />
                  <input type="email" placeholder="${isZh ? '输入您的企业采购邮箱' : 'Enter your corporate business email'}" required style="padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;outline:none;box-sizing:border-box;" />
                  <button type="submit" style="padding:13px;border-radius:8px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.95rem;font-weight:800;border:none;cursor:pointer;">
                    ${isZh ? '提交实物样品申请' : 'Submit Sample Request'} ↗
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
    // ABOUT PAGE: Craft Kiln Heritage & Studio Story
    // -------------------------------------------------------------
    const aboutHeadline = getAboutHeadline(company, isZh ? '质朴美学 · 家居装饰与生活美学工坊' : 'Organic Living & Home Decor Atelier');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '工坊创办' : 'Established', desc: 'Handcrafted legacy' },
      { value: '1280°C', num: 1280, suffix: '°C', label: isZh ? '天然原矿粗陶窑变温控' : 'High-Fire Stoneware Kiln', desc: 'Lead-free volcanic glaze' },
      { value: 'GOTS', num: 100, suffix: '', label: isZh ? '有机法国亚麻纺织认证' : 'Certified Organic Flax', desc: 'Masters of Linen®' },
      { value: '7-10 Days', num: 7, suffix: ' Days', label: isZh ? '陶艺打样与微水泥定制' : 'Studio Prototype Samples', desc: 'Dedicated artisan studio' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="homedecor-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:820px;margin:0 auto 60px;text-align:center;">
            <div style="display:inline-block;padding:4px 16px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
              ${isZh ? '关于我们的质朴工坊' : 'ABOUT OUR STUDIO ATELIER'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${isVideo ? '#ffffff' : '#2d2926'};line-height:1.2;margin:0 0 24px;">
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
                <div style="font-size:0.86rem;color:${isVideo ? '#ffffff' : '#2d2926'};margin-top:10px;font-weight:700;">${esc(h.label)}</div>
                ${h.desc ? `<div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">${esc(h.desc)}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Factory Imagery -->
          <div style="border-radius:18px;overflow:hidden;background:${isVideo ? '#0e1014' : '#ffffff'};border:1px solid ${theme.cardBorder};margin-bottom:40px;">
            <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:440px;object-fit:cover;display:block;" loading="lazy">
          </div>
        </div>
      </main>
    `;
  } else if (page === 'contact') {
    // -------------------------------------------------------------
    // CONTACT PAGE: High-Contrast Form & Clean Spacing
    // -------------------------------------------------------------
    mainHtml = `
      <main class="homedecor-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:800px;margin:0 auto 50px;text-align:center;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Ambient Living Studio' : 'Nordic Japandi Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${isVideo ? '#ffffff' : '#2d2926'};margin:0 0 16px;">
              ${esc(ui.contact)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;">
              ${isZh ? '直接与我们的陶艺工作室及空间软装设计师对接，获取手作器物样品、定制尺寸与外销托运批发报价。'
                      : 'Connect directly with our pottery kilns and interior design specialists for custom finishes, wholesale catalogs, and project quotes.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:40px;align-items:flex-start;">
            <!-- Contact Details Card -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
              <h3 style="font-size:1.25rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};margin:0 0 20px;">
                ${isZh ? '设计工作室与窑炉基地' : 'Studio Atelier & Pottery Kiln Base'}
              </h3>
              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:${theme.textMuted};">
                <div>
                  <strong style="color:${isVideo ? '#ffffff' : '#2d2926'};display:block;margin-bottom:2px;">Direct Email:</strong>
                  <a style="color:${theme.primary};font-weight:700;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
                </div>
                ${company.phone ? `
                  <div>
                    <strong style="color:${isVideo ? '#ffffff' : '#2d2926'};display:block;margin-bottom:2px;">Phone / Tel:</strong>
                    <a style="color:${theme.textMuted};text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
                  </div>
                ` : ''}
                ${company.address ? `
                  <div>
                    <strong style="color:${isVideo ? '#ffffff' : '#2d2926'};display:block;margin-bottom:2px;">Studio Address:</strong>
                    <span style="line-height:1.5;">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>

              <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:8px;">
                  ${isZh ? '工坊承诺' : 'STUDIO COMMITMENT'}
                </div>
                <ul style="margin:0;padding-left:18px;font-size:0.84rem;color:${theme.textSub};line-height:1.7;">
                  <li>${isZh ? '7个工作日完成定制釉色与拉坯实体打样' : '7 business days custom glaze and pottery prototyping'}</li>
                  <li>${isZh ? '天然无铅无镉食品级矿物釉料安全检测' : 'Lead-free food-safe glaze testing compliance'}</li>
                  <li>${isZh ? '加厚防震环保蜂窝包装，破损全额补发' : 'Zero-breakage export crating with full transit insurance'}</li>
                </ul>
              </div>
            </div>

            <!-- Contact Form Card with Crisp High-Contrast Fields -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
              <h3 style="font-size:1.25rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};margin:0 0 20px;">
                ${isZh ? '填写采购询盘与定制需求' : 'Submit Project Inquiry'}
              </h3>
              <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};margin-bottom:6px;">
                      ${isZh ? '联系人姓名' : 'Your Name'} *
                    </label>
                    <input name="name" autocomplete="name" required maxlength="120" type="text" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};margin-bottom:6px;">
                      ${isZh ? '企业电子邮箱' : 'Business Email'} *
                    </label>
                    <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};margin-bottom:6px;">
                    ${isZh ? '意向器物' : 'Interested Pieces'} (${esc(ui.optional)})
                  </label>
                  <select name="productId" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;">
                    <option value="">— ${isZh ? '选择感兴趣的器物或摆件' : 'Select Product of Interest'} —</option>
                    ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#2d2926'};margin-bottom:6px;">
                    ${isZh ? '项目说明与技术要求' : 'Project Details & Specifications'} *
                  </label>
                  <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请说明目标采购数量、期望材质色号、包装交期或设计图纸要求...' : 'Please specify project quantities, custom glaze/material specs, delivery terms...'}" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;resize:vertical;box-sizing:border-box;outline:none;font-family:inherit;"></textarea>
                </div>

                <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>

                <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:15px;border-radius:8px;background:${theme.btnGradient};color:${theme.btnText};font-size:1rem;font-weight:900;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.18);">
                  ${isZh ? '发送家居软装询盘' : 'Send Project Inquiry'} ↗
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Home Decor Studio')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0 0 16px;max-width:320px;">
            ${isZh ? '家居装饰与生活美学 · 全球品质工坊供应链' : 'Home Decor & Living Aesthetics · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '侘寂风手工粗陶花器' : 'Wabi-Sabi Ceramic Vases'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '波浪纹烟熏玻璃吊灯' : 'Fluted Glass Pendants'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '法国诺曼底水洗亚麻盖毯' : 'French Linen Blankets'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺认证' : 'Craft Certifications'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('1280°C')} ${isZh ? '原矿粗陶无铅结晶釉' : 'Lead-Free Stoneware Glaze'}</li>
            <li>✓ ${esc('GOTS')} ${isZh ? '法国有机亚麻纺织标准' : 'Organic French Linen'}</li>
            <li>✓ ${esc('Ra 95+')} ${isZh ? '高显色护眼氛围照明' : 'High CRI Ambient Light'}</li>
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
        <div>✦ ${isZh ? '家居装饰与生活美学旗舰版' : 'Home Decor & Living Aesthetics Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
