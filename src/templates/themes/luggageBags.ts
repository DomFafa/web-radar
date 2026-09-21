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
    "id": "lug-1",
    "name": "Full-Grain Italian Saddle Leather Weekender Duffle",
    "description": "Hand-buffed vegetable-tanned Tuscan saddle leather bag with solid brass hardware, YKK Excella zippers, and reinforced canvas lining.",
    "badge": "Artisanal Heirloom",
    "category": "duffle",
    "categoryNameZh": "托斯卡纳植鞣全粒面马鞍皮旅行手提包",
    "categoryNameEn": "Heritage Leather Duffles",
    "spec1": "100% Certified Italian Full-Grain Vegetable-Tanned Cowhide",
    "spec2": "52 × 28 × 30 cm · 42L Capacity · 2.1 kg",
    "moq": "50 Pcs per Colorway",
    "tagline": "A Century of Patina in Every Stitch",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "lug-2",
    "name": "Aerospace Grade Makrolon Polycarbonate Carry-On Spinner",
    "description": "Three-layer German Covestro Makrolon impact-absorbing shell, Japanese Hinomoto silent 360° wheels, and TSA-approved biometric lock.",
    "badge": "Aerospace Tech",
    "category": "carryon",
    "categoryNameZh": "航空级德国拜耳PC超轻万向轮登机箱",
    "categoryNameEn": "Ultralight Polycarbonate Spinners",
    "spec1": "100% Virgin Covestro Makrolon® PC Shell",
    "spec2": "55 × 38 × 23 cm · 39L Volume · 2.85 kg · IATA Cabin Approved",
    "moq": "200 Pcs per Batch",
    "tagline": "Ultralight Resilience in Flight",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "lug-3",
    "name": "Artisanal Vegetable-Tanned Leather Briefcase Satchel",
    "description": "Double-gusset executive briefcase crafted from hand-waxed vegetable leather with dedicated 16-inch padded laptop sleeve and umbrella loops.",
    "badge": "Executive Heritage",
    "category": "briefcase",
    "categoryNameZh": "意式手工蜡变原色双层商务公文包",
    "categoryNameEn": "Executive Leather Briefcases",
    "spec1": "Full-Grain Vachetta Leather + Microfiber Suede Lining",
    "spec2": "41 × 31 × 11 cm · Fits 16\" MacBook Pro",
    "moq": "80 Pcs per Order",
    "tagline": "Architectural Elegance for Connoisseurs",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "lug-4",
    "name": "Waterproof Cordura Ballistic Tech Travel Backpack",
    "description": "1000D DuPont Cordura ballistic nylon exterior with Fidlock magnetic quick-release buckles and ergonomic EVA molded airflow back panel.",
    "badge": "Urban Tactical",
    "category": "backpack",
    "categoryNameZh": "军规级防泼水考杜拉弹道尼龙双肩包",
    "categoryNameEn": "Ballistic Urban Backpacks",
    "spec1": "1000D Cordura® Ballistic Nylon + DWR C0 Waterproofing",
    "spec2": "48 × 32 × 18 cm · 28L Expandable to 34L",
    "moq": "150 Pcs per Style",
    "tagline": "All-Weather Commute Shield",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "lug-5",
    "name": "Aviation Grade Aluminum Frame Hard-Shell Trunk Luggage",
    "description": "Deep-trunk luggage with reinforced 6063 aerospace aluminum frame, riveted alloy corners, and dual butterfly latches with TSA keylocks.",
    "badge": "Armor Vault",
    "category": "trunk",
    "categoryNameZh": "航空铝镁合金防撞复古铝框大容量托运箱",
    "categoryNameEn": "Heavy-Duty Aluminum Trunks",
    "spec1": "6063 Anodized Aluminum-Magnesium Alloy Extrusion Frame",
    "spec2": "75 × 42 × 38 cm · 96L Volumetric Trunk Format",
    "moq": "100 Pcs per Run",
    "tagline": "Fortress-Level Armor for Global Explorers",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "lug-6",
    "name": "Waxed Canvas & Bridle Leather Heritage Tote Bag",
    "description": "Heavyweight 18oz Scottish paraffin-waxed canvas combined with English bridle leather handles and solid copper hand-hammered rivets.",
    "badge": "Rugged Vintage",
    "category": "tote",
    "categoryNameZh": "苏格兰重磅油蜡帆布配马缰革托特包",
    "categoryNameEn": "Heavyweight Waxed Canvas Totes",
    "spec1": "18oz Paraffin-Treated Duck Canvas + English Bridle Leather",
    "spec2": "42 × 36 × 16 cm · Reinforced Water-Resistant Base",
    "moq": "120 Pcs per Batch",
    "tagline": "Rugged Charm That Weather Any Storm",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "lug-7",
    "name": "Expandable Double-Spinner Checked Voyage Suitcase",
    "description": "Polycarbonate scratch-resistant textured check-in suitcase with 5cm zipper expansion, integrated scale handle, and removable garment folder.",
    "badge": "Long-Haul Pro",
    "category": "checkin",
    "categoryNameZh": "防刮磨砂大容量商务长途拉链托运箱",
    "categoryNameEn": "Checked Voyage Expandables",
    "spec1": "Virgin Polycarbonate with Diamond-Shield Anti-Scratch Finish",
    "spec2": "68 × 46 × 29 (+5) cm · 85L Expandable to 98L",
    "moq": "200 Pcs per Batch",
    "tagline": "Expansive Capacity Without Compromise",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "lug-8",
    "name": "Hand-Burnished Bridle Leather Minimalist Passport Folio",
    "description": "Slim travel organizer featuring RFID-shielding mesh, ticket sleeve, SIM card slot, and hand-finished glass-smooth burnished edges.",
    "badge": "Travel Accoutrements",
    "category": "smallgoods",
    "categoryNameZh": "手工打磨马缰革RFID防盗刷护照收纳夹",
    "categoryNameEn": "Bridle Leather Travel Folios",
    "spec1": "Sedgwick English Bridle Leather + RFID Blocking Foil",
    "spec2": "14.5 × 10.5 × 1.2 cm · 4 Card Slots + Passport Pocket",
    "moq": "300 Pcs per Color",
    "tagline": "Quiet Discretion in International Transit",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderLuggagePage(ctx: ThemeContext, isVideo: boolean): string {
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
            categoryNameZh: '高端箱包手袋与出行装备',
            categoryNameEn: 'Luxury Luggage & Travel Goods',
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
  // isVideo = false: luggage-leather-banner (Warm Tuscan saddle leather & ivory canvas atelier)
  // isVideo = true: luggage-voyage-video (Dark aerospace graphite & electric cyan jetsetter)
  const theme = isVideo ? {
    name: 'voyage-video',
    bg: '#090d14',
    bgSoft: '#111722',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textSub: '#64748b',
    primary: '#00e5ff', // Electric ice cyan
    accent: '#38bdf8',
    headerBg: 'rgba(9, 13, 20, 0.88)',
    headerBorder: 'rgba(255, 255, 255, 0.12)',
    inputBg: 'rgba(15, 23, 42, 0.65)',
    inputBorder: 'rgba(255, 255, 255, 0.18)',
    inputText: '#ffffff',
    badgeBg: 'rgba(0, 229, 255, 0.12)',
    badgeText: '#00e5ff',
    badgeBorder: 'rgba(0, 229, 255, 0.28)',
    btnGradient: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
    btnText: '#ffffff',
    pillActive: '#00e5ff',
    pillText: '#090d14',
    footerBg: '#05070a',
    footerBorder: '#172030',
  } : {
    name: 'leather-banner',
    bg: '#faf7f2',
    bgSoft: '#f2ece2',
    cardBg: '#ffffff',
    cardBorder: '#e8dfd5',
    text: '#231915',
    textMuted: '#6b5b54',
    textSub: '#8a7971',
    primary: '#8a4924', // Tuscan Saddle Tan
    accent: '#b8860b', // Antique Brass
    headerBg: 'rgba(250, 247, 242, 0.92)',
    headerBorder: 'rgba(226, 217, 207, 0.85)',
    inputBg: '#ffffff',
    inputBorder: '#d8cdc2',
    inputText: '#231915',
    badgeBg: 'rgba(138, 73, 36, 0.08)',
    badgeText: '#8a4924',
    badgeBorder: 'rgba(138, 73, 36, 0.25)',
    btnGradient: 'linear-gradient(135deg, #8a4924 0%, #6b3416 100%)',
    btnText: '#ffffff',
    pillActive: '#231915',
    pillText: '#ffffff',
    footerBg: '#231915',
    footerBorder: '#3b2b24',
  };

  const heroTitle = isVideo
    ? (isZh ? '极轻航空聚碳酸酯与万向静音出行装备' : 'CyberVoyage Ultralight Aerodynamic Luggage')
    : (isZh ? '意式传承 · 托斯卡纳植鞣马鞍皮工坊' : 'Tuscan Full-Grain Saddle Leather Atelier');

  const heroSubtitle = isVideo
    ? (isZh ? '德国拜耳 Makrolon 抗冲击外壳与日本 Hinomoto 360° 静音万向轮，经受 1.5 米极限跌落与 50 公里负重路试，为全球商旅精英提供坚如磐石的轻盈保障。'
            : 'Engineered with German Makrolon polycarbonate, Japanese Hinomoto silent wheels, and biometric TSA locks. Tested for 50km endurance across continents.')
    : (isZh ? '甄选意大利托斯卡纳认证全粒面牛皮，手工蜂蜡双针马鞍缝合，辅以实心黄铜五金。随着时光流转，沉淀出温润独一的自然包浆。'
            : 'Handcrafted with Tuscan certified vegetable-tanned full-grain leather, saddle-stitched with waxed linen thread and solid antiqued brass hardware.');

  // Header Component
  const headerHtml = `
    <header class="theme-header" style="position:sticky;top:0;z-index:99;background:${theme.headerBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.headerBorder};">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:8px;background:${theme.btnGradient};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
          </div>
          <div>
            <div style="font-size:1.15rem;font-weight:900;letter-spacing:-0.02em;color:${isVideo ? '#ffffff' : '#231915'};line-height:1.1;">
              ${esc(company.name || (isVideo ? 'CyberVoyage Luggage Lab' : 'Tuscan Leather Guild'))}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};font-weight:800;">
              ${isZh ? (isVideo ? '航天轻量机能出行' : '托斯卡纳手工皮具') : (isVideo ? 'Aerospace Travel Systems' : 'Tuscan Leather Guild')}
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
            <span>${isZh ? '索样与集装箱报价' : 'Wholesale RFQ'}</span>
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
      // 1. VIDEO TEMPLATE: CyberVoyage Aerodynamic High-Tech
      // -------------------------------------------------------------
      const videoAsset = ctx.asset(draft.heroAssetId);
      const heroPoster = '/templates/senseng/hero-sky.jpg';

      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Jetsetter High-Speed Aerodynamic Video -->
          <section style="position:relative;width:100%;min-height:85vh;overflow:hidden;background:#05080e;display:flex;align-items:center;">
            <video autoplay loop muted playsinline poster="${esc(heroPoster)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.4;z-index:1;">
              ${videoAsset ? `<source src="${esc(videoAsset)}" type="video/mp4">` : ''}
            </video>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 65% 35%, rgba(0,229,255,0.15) 0%, rgba(9,13,20,0.85) 75%, #090d14 100%);z-index:2;"></div>
            
            <div class="wrap" style="position:relative;z-index:3;padding:90px 20px;max-width:980px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:20px;" data-reveal="fade-up">
                <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};box-shadow:0 0 8px ${theme.primary};"></span>
                <span style="color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                  ${isZh ? '航天工程级超轻机能出行矩阵' : 'AEROSPACE RESILIENCE IN MOTION'}
                </span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 5vw, 4rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 22px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.7;color:${theme.textMuted};margin:0 0 36px;max-width:740px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:8px;font-size:0.98rem;font-weight:800;color:#ffffff;background:${theme.btnGradient};box-shadow:0 8px 24px rgba(0,180,216,0.35);">
                  ${isZh ? '探索航空登机箱系列' : 'Explore Voyage Spinners'} ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;font-size:0.98rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);">
                  ${isZh ? '航空公司与大宗OEM采购' : 'Airline Fleet RFQ'}
                </a>
              </div>
            </div>
          </section>

          <!-- Extreme Durability & Torture Lab Metrics -->
          <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
            <div style="background:${theme.bgSoft};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">LAB TESTING DATA</span>
                  <h2 style="font-size:clamp(1.6rem, 2.5vw, 2.2rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                    ${isZh ? '极端环境严苛可靠性实验指标' : 'Extreme Torture Lab Standards'}
                  </h2>
                </div>
                <div style="font-size:0.88rem;color:${theme.textMuted};">
                  ${isZh ? '符合 IATA 国际航协与严苛 DIN 航空标准' : 'Fully Compliant with IATA Cabin & DIN Drop Standards'}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};" data-counter="50" data-suffix=" km">50 km</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '轮组静音耐磨连续路跑' : 'Wheel Abrasion Road Test'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Hinomoto Japanese Bearings</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;" data-counter="150" data-suffix=" cm">150 cm</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '满载多角度抗跌落冲击' : 'Full-Load Free Drop Height'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Zero crack at -20°C ambient</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};" data-counter="10000" data-suffix=" Reps">10,000</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '拉杆往复疲劳寿命' : 'Telescoping Handle Cycles'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Multi-stop ergonomic lock</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;">TSA 008</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '最新防破坏海关锁' : 'Next-Gen Master Lock'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Red-dot transit security</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Aerospace Travel Gear Grid -->
          <section class="wrap" style="padding:50px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">VOYAGE FLEET</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                  ${isZh ? '机能旅行箱与出行装备精选' : 'Ultralight Voyage Fleet'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '浏览全系 ↗' : 'View Full Fleet ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:#0d1017;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(9,13,20,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);color:#ffffff;">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                      <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                        ${esc(meta.categoryNameEn || 'Voyage Gear')}
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
        </main>
      `;
    } else {
      // -------------------------------------------------------------
      // 2. BANNER TEMPLATE: Tuscan Heritage Leather Atelier
      // -------------------------------------------------------------
      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Tuscan Leather Banner with Craft Manifesto -->
          <section style="position:relative;padding:90px 0 80px;border-bottom:1px solid ${theme.cardBorder};background:linear-gradient(180deg, #faf7f2 0%, #f3ebe0 100%);">
            <div class="wrap" style="display:grid;grid-template-columns:1.15fr 1fr;gap:50px;align-items:center;">
              <div data-reveal="fade-up">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:18px;">
                  <span style="font-size:0.75rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${theme.badgeText};">
                    TUSCAN LEATHER ATELIER · 100% VEGETABLE TANNED
                  </span>
                </div>
                <h1 style="font-size:clamp(2.4rem, 4.4vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#231915;line-height:1.15;margin:0 0 20px;">
                  ${esc(heroTitle)}
                </h1>
                <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(heroSubtitle)}
                </p>
                <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:8px;font-size:0.95rem;font-weight:800;color:#ffffff;background:${theme.btnGradient};box-shadow:0 6px 18px rgba(138,73,36,0.25);">
                    ${isZh ? '品鉴手作皮具全系' : 'Explore Leather Goods'} ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:13px 26px;border-radius:8px;font-size:0.95rem;font-weight:700;color:#231915;background:#ffffff;border:1px solid #d4c8bd;">
                    ${isZh ? '百年植鞣鞣制哲学' : 'The Tanning Heritage'}
                  </a>
                </div>
              </div>

              <!-- Hero Featured Duffle Card -->
              <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #dfd4c7;border-radius:20px;padding:24px;box-shadow:0 12px 36px rgba(35,25,21,0.06);">
                <div style="position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#f0eae0;margin-bottom:20px;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:cover;">
                  <span style="position:absolute;bottom:12px;left:12px;padding:4px 12px;border-radius:4px;background:#231915;color:#ffffff;font-size:0.75rem;font-weight:800;">
                    Certified Tuscan Cowhide
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <h3 style="font-size:1.15rem;font-weight:900;color:#231915;margin:0 0 4px;">
                      ${esc(heroProduct.name)}
                    </h3>
                    <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;">
                      ${esc(heroMeta.spec1)}
                    </p>
                  </div>
                  <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:8px 16px;border-radius:6px;background:#231915;color:#ffffff;font-size:0.82rem;font-weight:700;">
                    ${esc(ui.details)} ↗
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- The Patina Evolution Timeline (Unique to Leather Banner) -->
          <section class="wrap" style="padding:80px 0 50px;" data-reveal="fade-up">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};">TIMELESS PATINA</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#231915;margin:8px 0 14px;">
                ${isZh ? '天然植鞣皮的时光包浆蜕变' : 'The Vegetable-Tanned Patina Journey'}
              </h2>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0;">
                ${isZh ? '随着日照、空气湿度与主人掌心油脂的温和滋养，皮革色泽由原木初生浅杏逐渐沉淀为温润的琥珀蜜蜡色。'
                        : 'Enriched by sunlight, atmospheric moisture, and natural oils, developing a rich caramel amber patina over decades.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">STAGE 01 / DAY 1</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#231915;margin:0 0 10px;">
                  ${isZh ? '原色新生：淡雅杏白与清幽木香' : 'Virgin Honey: Raw Natural Tan'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '纯天然栗木栲胶浸泡两个月，皮质紧密饱满，毛孔细腻清晰，带有天然植鞣皮独有的森林草木清香。'
                          : 'Tanned for two months in natural chestnut bark extract, presenting silky pore textures and forest scent.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">STAGE 02 / YEAR 3</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#231915;margin:0 0 10px;">
                  ${isZh ? '岁月洗礼：光润琥珀马鞍金' : 'Seasoned Patina: Rich Saddle Gold'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '吸收岁月与触摸，皮革纤维自然软化，表面形成一层光彩熠熠的温润油脂层，抗刮耐水性显著提升。'
                          : 'Fibers soften under daily touch, forming a lustrous protective amber shield resistant to scratches.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">STAGE 03 / YEAR 10+</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#231915;margin:0 0 10px;">
                  ${isZh ? '传世珍藏：浓醇深棕古董光泽' : 'Antique Heirloom: Deep Vintage Cognac'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '沉淀为深沉醉人的古董咖啡色，马鞍双针缝线与纯铜五金氧化泛出复古微光，成为可传承三代的艺术品。'
                          : 'Transforms into an exquisite heirloom cognac shade, with brass hardware oxidized to vintage perfection.'}
                </p>
              </div>
            </div>
          </section>

          <!-- Leather Goods Catalog Grid -->
          <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#231915;margin:6px 0 0;">
                  ${isZh ? '手工植鞣皮具精品系列' : 'Artisanal Leather Goods Collection'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '浏览全部 8 款手作 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 16px rgba(35,25,21,0.03);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:78%;overflow:hidden;background:#efeae2;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:3px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:#ffffff;color:#231915;border:1px solid #d4c8bd;">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.12rem;font-weight:800;color:#231915;line-height:1.3;margin:0 0 8px;">
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
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'CyberVoyage Luggage Lab' : 'Tuscan Leather Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${isVideo ? '#ffffff' : '#231915'};margin:0 0 14px;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '浏览全系高标准出行箱包品类，支持品牌激光刻印、定制内胆分区与全球集装箱货运履约。'
                      : 'Explore our complete luggage and leather collection, engineered to international travel standards and custom OEM/ODM specifications.'}
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
                    ${meta.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};background:${isVideo ? 'rgba(0,0,0,0.6)' : '#ffffff'};border:1px solid ${isVideo ? 'rgba(255,255,255,0.2)' : '#d4c8bd'};">${esc(meta.badge)}</span>` : ''}
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Travel Goods')}
                    </div>
                    <h2 style="font-size:1.12rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};line-height:1.35;margin:0 0 8px;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.description || '')}
                    </p>
                    <div style="background:${isVideo ? 'rgba(255,255,255,0.03)' : '#f5efe6'};padding:10px 12px;border-radius:8px;font-size:0.78rem;color:${theme.textSub};margin-bottom:16px;">
                      <strong>${isZh ? '材质规格' : 'Spec'}:</strong> ${esc(meta.spec1 || 'Standard')}
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
    // DETAIL PAGE: Rich Product Specs with id="wr-detail-main-img"
    // -------------------------------------------------------------
    const meta = (selectedProduct as ThemedItem).spec1 ? (selectedProduct as ThemedItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img;

    mainHtml = `
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:40px 0 100px;">
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
            <div style="border-radius:18px;overflow:hidden;background:${isVideo ? '#0d1017' : '#ffffff'};border:1px solid ${theme.cardBorder};box-shadow:0 8px 30px rgba(0,0,0,${isVideo ? '0.3' : '0.06'});">
              <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
            </div>

            <!-- Product Specs & Inquiries -->
            <div>
              <div style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.categoryNameEn || 'Luggage & Bag Specification')}
              </div>
              <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:${isVideo ? '#ffffff' : '#231915'};line-height:1.2;margin:0 0 16px;">
                ${esc(selectedProduct.name)}
              </h1>
              <p style="font-size:1.05rem;line-height:1.75;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(selectedProduct.description || '')}
              </p>

              <!-- Technical Specifications Table -->
              <div style="padding:22px;border-radius:14px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};margin-bottom:28px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.88rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '材质等级' : 'Material Spec'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#231915'};">${esc(meta.spec1 || (selectedProduct as any).material || 'Certified Grade')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '规格尺寸' : 'Dimensions'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#231915'};">${esc(meta.spec2 || (selectedProduct as any).dimensions || 'Standard Export Spec')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '测试认证' : 'Quality Testing'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#231915'};">DIN Drop & Abrasion Certified</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '起订批次' : 'MOQ'}:</span>
                    <strong style="color:${isVideo ? '#ffffff' : '#231915'};">${esc(meta.moq || '50 Pcs')}</strong>
                  </div>
                </div>
              </div>

              <!-- High Contrast Sample & Quotation Form -->
              <div style="padding:28px;border-radius:16px;background:${isVideo ? 'rgba(255,255,255,0.04)' : '#ffffff'};border:1px solid ${theme.cardBorder};box-shadow:0 6px 24px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
                <h3 style="font-size:1.15rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};margin:0 0 6px;">
                  ${isZh ? '申请此品类实物样品与报价' : 'Request Sample & Bulk Quotation'}
                </h3>
                <p style="font-size:0.86rem;color:${theme.textMuted};margin:0 0 16px;">
                  ${isZh ? '支持专属皮质压印烫金、拉链激光刻字与集装箱出海报价交付。' : 'Support custom leather debossing, laser zipper pullers, and global FOB quotations.'}
                </p>
                <form action="${path('contact/index.html')}" method="GET" style="display:flex;flex-direction:column;gap:12px;">
                  <input type="hidden" name="productId" value="${esc(selectedProduct.id)}" />
                  <input type="email" placeholder="${isZh ? '输入您的企业采购邮箱' : 'Enter your corporate business email'}" required style="padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;outline:none;box-sizing:border-box;" />
                  <button type="submit" style="padding:13px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;border:none;cursor:pointer;">
                    ${isZh ? '提交样品打样申请' : 'Submit Sample Request'} ↗
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
    // ABOUT PAGE: Craft Heritage & Factory Tour
    // -------------------------------------------------------------
    const aboutHeadline = getAboutHeadline(company, isZh ? '匠心传承 · 高端箱包手袋与出行装备' : 'Artisanal Craft & Travel Goods Heritage');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Generations of craft' },
      { value: '100% Full-Grain', num: 100, suffix: '%', label: isZh ? '认证植鞣头层真皮纯度' : 'Certified Tuscan Cowhide', desc: 'Vegetable-tanned provenance' },
      { value: '50 km', num: 50, suffix: ' km', label: isZh ? '日立静音万向轮耐久测试' : 'Hinomoto Wheel Test', desc: 'Zero noise fatigue' },
      { value: '7-10 Days', num: 7, suffix: ' Days', label: isZh ? '快反样品打版与五金开模' : 'Fast Prototype Delivery', desc: 'In-house tooling workshop' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:820px;margin:0 auto 60px;text-align:center;">
            <div style="display:inline-block;padding:4px 16px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
              ${isZh ? '关于我们的匠心制造' : 'ABOUT OUR CRAFT GUILD'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${isVideo ? '#ffffff' : '#231915'};line-height:1.2;margin:0 0 24px;">
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
                <div style="font-size:0.86rem;color:${isVideo ? '#ffffff' : '#231915'};margin-top:10px;font-weight:700;">${esc(h.label)}</div>
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
    // CONTACT PAGE: High-Contrast Form & Clean Spacing
    // -------------------------------------------------------------
    mainHtml = `
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:800px;margin:0 auto 50px;text-align:center;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'CyberVoyage Luggage Lab' : 'Tuscan Leather Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${isVideo ? '#ffffff' : '#231915'};margin:0 0 16px;">
              ${esc(ui.contact)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;">
              ${isZh ? '直接与我们的箱包研发与出口贸易团队对接，获取皮质手感样卡、拉杆箱跌落实验报告与大宗采购批价。'
                      : 'Connect directly with our luggage engineering and export teams for swatches, test reports, and container FOB pricing.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:40px;align-items:flex-start;">
            <!-- Contact Details Card -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
              <h3 style="font-size:1.25rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};margin:0 0 20px;">
                ${isZh ? '全球商务与制造基地' : 'Global Headquarters & Atelier'}
              </h3>
              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:${theme.textMuted};">
                <div>
                  <strong style="color:${isVideo ? '#ffffff' : '#231915'};display:block;margin-bottom:2px;">Direct Email:</strong>
                  <a style="color:${theme.primary};font-weight:700;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
                </div>
                ${company.phone ? `
                  <div>
                    <strong style="color:${isVideo ? '#ffffff' : '#231915'};display:block;margin-bottom:2px;">Phone / Tel:</strong>
                    <a style="color:${theme.textMuted};text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
                  </div>
                ` : ''}
                ${company.address ? `
                  <div>
                    <strong style="color:${isVideo ? '#ffffff' : '#231915'};display:block;margin-bottom:2px;">Facility Address:</strong>
                    <span style="line-height:1.5;">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>

              <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:8px;">
                  ${isZh ? '交付保障' : 'MANUFACTURING COMMITMENT'}
                </div>
                <ul style="margin:0;padding-left:18px;font-size:0.84rem;color:${theme.textSub};line-height:1.7;">
                  <li>${isZh ? '7个工作日完成定制皮料与开模打样' : '7 business days custom sample prototyping'}</li>
                  <li>${isZh ? '提供全批次德国拜耳PC材质与DIN跌落检测' : 'Full-batch Covestro PC & DIN drop compliance'}</li>
                  <li>${isZh ? '保税区集装箱直发，全球门到门海运履约' : 'Bonded warehouse container direct dispatch'}</li>
                </ul>
              </div>
            </div>

            <!-- Contact Form Card with Crisp High-Contrast Fields -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,${isVideo ? '0.2' : '0.04'});">
              <h3 style="font-size:1.25rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};margin:0 0 20px;">
                ${isZh ? '填写采购询盘与定制需求' : 'Submit Project Inquiry'}
              </h3>
              <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};margin-bottom:6px;">
                      ${isZh ? '联系人姓名' : 'Your Name'} *
                    </label>
                    <input name="name" autocomplete="name" required maxlength="120" type="text" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};margin-bottom:6px;">
                      ${isZh ? '企业电子邮箱' : 'Business Email'} *
                    </label>
                    <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};margin-bottom:6px;">
                    ${isZh ? '意向产品' : 'Interested Product'} (${esc(ui.optional)})
                  </label>
                  <select name="productId" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;">
                    <option value="">— ${isZh ? '选择感兴趣的产品' : 'Select Product of Interest'} —</option>
                    ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:${isVideo ? '#ffffff' : '#231915'};margin-bottom:6px;">
                    ${isZh ? '项目说明与技术要求' : 'Project Details & Specifications'} *
                  </label>
                  <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请说明目标订单数量、皮质成色、期望交期或LOGO定制需求...' : 'Please specify order quantities, leather/hardware specs, delivery terms...'}" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;resize:vertical;box-sizing:border-box;outline:none;font-family:inherit;"></textarea>
                </div>

                <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>

                <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:15px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:1rem;font-weight:900;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.18);">
                  ${isZh ? '发送箱包采购询盘' : 'Send Luggage Inquiry'} ↗
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Luxury Luggage Guild')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0 0 16px;max-width:320px;">
            ${isZh ? '高端箱包手袋与出行装备 · 全球品质贸易工坊' : 'Luxury Luggage & Travel Goods · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '托斯卡纳植鞣马鞍皮手提包' : 'Heritage Leather Duffles'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '航空级超轻万向轮登机箱' : 'Ultralight PC Spinners'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '航空铝镁合金防撞托运箱' : 'Aluminum Frame Trunks'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺实力' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('100% Full-Grain')} ${isZh ? '意大利认证植鞣真皮' : 'Certified Tuscan Cowhide'}</li>
            <li>✓ ${esc('50 km')} ${isZh ? '日立静音万向轮耐久测试' : 'Hinomoto Wheel Endurance'}</li>
            <li>✓ ${esc('DIN Drop Tested')} ${isZh ? '德国标准防爆防摔认证' : 'German Drop Compliance'}</li>
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
        <div>✦ ${isZh ? '高端箱包手袋与出行装备旗舰版' : 'Luxury Luggage & Travel Goods Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
