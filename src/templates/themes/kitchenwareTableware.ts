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
    "id": "kt-1",
    "name": "67-Layer Hammered Damascus Steel 8-Inch Chef Knife",
    "description": "VG-10 Japanese super steel cutting core clad in 66 layers of stainless Damascus steel, cryogenically treated to 60±2 HRC with ergonomic Pakkawood handle.",
    "badge": "Master Cutlery",
    "category": "knife",
    "categoryNameZh": "67层大马士革钢VG10主厨料理刀",
    "categoryNameEn": "Damascus Chef Knives",
    "spec1": "VG-10 Core (60±2 HRC) + 67-Layer Forged Damascus Cladding",
    "spec2": "8-Inch Blade (205mm) · 15° Double-Bevel Edge · 245g",
    "moq": "50 Pcs per Run",
    "tagline": "Razor-Sharp Precision in Every Slice",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "kt-2",
    "name": "French Enamelled Cast Iron 5.5-Quart Round Dutch Oven",
    "description": "Heavy sand-cast iron core coated with three layers of vitreous enamel, self-basting condensation spikes under lid, and stainless steel oven-safe knob.",
    "badge": "Artisan Cocotte",
    "category": "cookware",
    "categoryNameZh": "法式自循环水珠微压加厚珐琅铸铁锅",
    "categoryNameEn": "Enamelled Dutch Ovens",
    "spec1": "Heavy Cast Iron + Triple-Fired Glass Vitreous Enamel",
    "spec2": "26cm Dia · 5.2L (5.5 Qt) · Oven-Safe up to 260°C (500°F)",
    "moq": "100 Pcs per Color",
    "tagline": "Thermal Heritage of Slow Simmering",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "kt-3",
    "name": "Handcrafted Reactive Glaze Ceramic Coupe Dinnerware Set",
    "description": "High-fired vitrified stoneware featuring one-of-a-kind sea salt reactive glaze, organically curved coupe rim, and scratch-resistant satin matte finish.",
    "badge": "Artisanal Table",
    "category": "tableware",
    "categoryNameZh": "手工窑变渐变海盐釉轻奢陶瓷餐盘组",
    "categoryNameEn": "Coupe Ceramic Dinnerware",
    "spec1": "1280°C Vitrified Stoneware (Lead & Cadmium Free)",
    "spec2": "16-Piece Set (4 Dinner, 4 Salad, 4 Bowls, 4 Mugs)",
    "moq": "50 Sets per Design",
    "tagline": "Culinary Plating as Pure Art",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "kt-4",
    "name": "Commercial Tri-Ply Stainless Steel Heavy Sauté Pan",
    "description": "Commercial-grade 3-ply construction with responsive aluminum core between 18/10 stainless steel, featuring stay-cool riveted handle and helper loop.",
    "badge": "Commercial Pro",
    "category": "cookware",
    "categoryNameZh": "商用级三层复合钢加厚导热煎炒锅",
    "categoryNameEn": "Tri-Ply Sauté Pans",
    "spec1": "18/10 Stainless Steel + Pure Aluminum Core (3.0mm)",
    "spec2": "28cm Dia · 4.5L Capacity · Induction & Broiler Compatible",
    "moq": "80 Pcs per Batch",
    "tagline": "Unrivaled Heat Distribution Across Surfaces",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "kt-5",
    "name": "End-Grain Hard Rock Maple Heavy Duty Butcher Block",
    "description": "Self-healing end-grain construction crafted from sustainably harvested North American hard rock maple, finished with food-grade mineral oil and beeswax.",
    "badge": "Heirloom Board",
    "category": "board",
    "categoryNameZh": "北美硬枫木端切加厚自愈重型砧板",
    "categoryNameEn": "End-Grain Butcher Blocks",
    "spec1": "100% Solid Northern Hard Rock Maple (End-Grain Layout)",
    "spec2": "50 × 38 × 6 cm · Deep Juice Groove + Finger Grip Slots",
    "moq": "40 Pcs per Order",
    "tagline": "Blade-Friendly Endurance for Master Chefs",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "kt-6",
    "name": "Mirror-Polished 18/10 Stainless Steel Forged Flatware Set",
    "description": "Heavy-gauge hot-drop forged flatware with balanced teardrop handles, micro-serrated steak knife blades, and high-lustre mirror polish.",
    "badge": "Michelin Dining",
    "category": "flatware",
    "categoryNameZh": "18-10医用级热锻镜面抛光刀叉勺餐具",
    "categoryNameEn": "Forged Stainless Flatware",
    "spec1": "18/10 Chromium-Nickel Food-Grade Stainless Steel",
    "spec2": "24-Piece Table Service for 6 · Dishwasher Safe",
    "moq": "100 Sets per Style",
    "tagline": "Ergonomic Weight in Every Handful",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "kt-7",
    "name": "Double-Wall Insulated Matte Black Pour-Over Gooseneck Kettle",
    "description": "Precision-flow counterbalanced gooseneck spout for optimal pour-over extraction, dual-wall vacuum insulation, and integrated analog temperature dial.",
    "badge": "Barista Grade",
    "category": "coffee",
    "categoryNameZh": "手冲控流哑光黑恒温鹅颈咖啡细口壶",
    "categoryNameEn": "Gooseneck Pour-Over Kettles",
    "spec1": "304 Food-Grade Stainless Steel + Matte Powder Coating",
    "spec2": "1.0L Capacity · Ergonomic Walnut Wood Accent Handle",
    "moq": "120 Pcs per Batch",
    "tagline": "Millimeter Flow Control for Coffee Artisans",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "kt-8",
    "name": "Traditional Non-Stick Carbon Steel Hand-Hammered Wok",
    "description": "Heavy 1.8mm hand-hammered carbon steel round-bottom wok pre-seasoned with natural plant oils, featuring riveted beechwood handle for wok-hei searing.",
    "badge": "Wok Hei Master",
    "category": "cookware",
    "categoryNameZh": "纯手工锻打熟铁圆底无涂层天然开锅镬",
    "categoryNameEn": "Hand-Hammered Carbon Woks",
    "spec1": "1.8mm Heavy Heavy-Gauge Spun Carbon Steel",
    "spec2": "36cm Dia · Natural Flax Oil Pre-Seasoned · 1.6 kg",
    "moq": "100 Pcs per Run",
    "tagline": "Breath of Wok-Hei in Pure Metallurgy",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderKitchenPage(ctx: ThemeContext, isVideo: boolean): string {
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
            categoryNameZh: '高端厨具刀具与餐桌器皿',
            categoryNameEn: 'Culinary Cookware & Tableware',
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
  // isVideo = false: kitchen-culinary-banner (Forged Steel Slate & Damascus Copper Rust Michelin)
  // isVideo = true: kitchen-gourmet-video (Roasted Truffle Charcoal & Honey Amber Tabletop Feast)
  const theme = isVideo ? {
    name: 'gourmet-video',
    bg: '#181412',
    bgSoft: '#231d1a',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(229, 142, 38, 0.22)',
    text: '#f7f3ed',
    textMuted: '#a89d95',
    textSub: '#786e66',
    primary: '#e58e26', // Honey Amber Feast
    accent: '#f39c12',
    headerBg: 'rgba(24, 20, 18, 0.88)',
    headerBorder: 'rgba(229, 142, 38, 0.22)',
    inputBg: 'rgba(35, 29, 26, 0.7)',
    inputBorder: 'rgba(229, 142, 38, 0.3)',
    inputText: '#ffffff',
    badgeBg: 'rgba(229, 142, 38, 0.12)',
    badgeText: '#e58e26',
    badgeBorder: 'rgba(229, 142, 38, 0.3)',
    btnGradient: 'linear-gradient(135deg, #e58e26 0%, #ba6d12 100%)',
    btnText: '#181412',
    pillActive: '#e58e26',
    pillText: '#181412',
    footerBg: '#0e0b0a',
    footerBorder: '#28201c',
  } : {
    name: 'culinary-banner',
    bg: '#101318',
    bgSoft: '#181d24',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(194, 94, 46, 0.25)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textSub: '#64748b',
    primary: '#c25e2e', // Damascus Copper Rust
    accent: '#4b5e43', // Rosemary Olive
    headerBg: 'rgba(16, 19, 24, 0.9)',
    headerBorder: 'rgba(194, 94, 46, 0.25)',
    inputBg: 'rgba(24, 29, 36, 0.7)',
    inputBorder: 'rgba(194, 94, 46, 0.3)',
    inputText: '#ffffff',
    badgeBg: 'rgba(194, 94, 46, 0.12)',
    badgeText: '#e07d4f',
    badgeBorder: 'rgba(194, 94, 46, 0.3)',
    btnGradient: 'linear-gradient(135deg, #c25e2e 0%, #99431c 100%)',
    btnText: '#ffffff',
    pillActive: '#c25e2e',
    pillText: '#ffffff',
    footerBg: '#090b0e',
    footerBorder: '#1c222b',
  };

  const heroTitle = isVideo
    ? (isZh ? '法式温润陶艺料理 · 米其林餐桌美学与飨宴' : 'Gourmet Tabletop Feast & Artisanal Reactive Stoneware')
    : (isZh ? '大马士革钢锻打刀具与重型珐琅铸铁工坊' : '67-Layer Damascus Metallurgy & Enamelled Cast Iron');

  const heroSubtitle = isVideo
    ? (isZh ? '1280°C 高温窑变海盐釉、锻造 18/10 镜面刀叉与原矿手冲器具，为全球顶级餐厅与私享家宴创造沉浸式美食仪式感。'
            : 'Artisanal reactive sea salt glazes, forged 18/10 mirror flatware, and temperature-controlled pour-over coffee systems.')
    : (isZh ? 'VG-10 核心 60±2 HRC 超凡硬度，15° 手工开刃锋芒毕露；加厚珐琅自循环微压铸铁锅，锁住每一道食材鲜美肉汁。'
            : 'VG-10 core hardened to 60±2 HRC with 15° hand-honed double bevels, paired with heavy self-basting enamelled cocottes.');

  // Header Component
  const headerHtml = `
    <header class="theme-header" style="position:sticky;top:0;z-index:99;background:${theme.headerBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.headerBorder};">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:8px;background:${theme.btnGradient};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.2);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><path d="M18 2l4 4-10 10-4-4L18 2zM14 6l4 4M2 22l7-7"/></svg>
          </div>
          <div>
            <div style="font-size:1.15rem;font-weight:900;letter-spacing:-0.02em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || (isVideo ? 'Gourmet Table Atelier' : 'Damascus Culinary Guild'))}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:${theme.primary};font-weight:800;">
              ${isZh ? (isVideo ? '法式陶艺飨宴餐具' : '大马士革主厨刀具铸铁') : (isVideo ? 'Gourmet Dining Atelier' : 'Damascus Culinary Guild')}
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 20px;border-radius:8px;font-size:0.86rem;font-weight:800;color:${theme.btnText};background:${theme.btnGradient};box-shadow:0 4px 14px rgba(0,0,0,0.25);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
            <span>${isZh ? '餐饮集团采购询价' : 'Hospitality RFQ'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // -------------------------------------------------------------
      // 1. VIDEO TEMPLATE: Gourmet Dining & Sizzling Tabletop Feast
      // -------------------------------------------------------------
      const videoAsset = ctx.asset(draft.heroAssetId);
      const heroPoster = '/templates/senseng/hero-sky.jpg';

      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Gourmet Sizzling Plating Video -->
          <section style="position:relative;width:100%;min-height:85vh;overflow:hidden;background:#0d0908;display:flex;align-items:center;">
            <video autoplay loop muted playsinline poster="${esc(heroPoster)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.42;z-index:1;">
              ${videoAsset ? `<source src="${esc(videoAsset)}" type="video/mp4">` : ''}
            </video>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 65% 35%, rgba(229,142,38,0.18) 0%, rgba(24,20,18,0.85) 75%, #181412 100%);z-index:2;"></div>
            
            <div class="wrap" style="position:relative;z-index:3;padding:90px 20px;max-width:980px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:20px;" data-reveal="fade-up">
                <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};box-shadow:0 0 8px ${theme.primary};"></span>
                <span style="color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                  ${isZh ? '米其林餐桌美学 · 温润窑变陶艺与飨宴器皿' : 'GOURMET TABLETOP & MICHELIN DINING EXPERIENCE'}
                </span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 5vw, 4rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 22px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.7;color:${theme.textMuted};margin:0 0 36px;max-width:740px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:8px;font-size:0.98rem;font-weight:800;color:${theme.btnText};background:${theme.btnGradient};box-shadow:0 8px 24px rgba(229,142,38,0.35);">
                  ${isZh ? '探索餐桌美学全系' : 'Explore Tableware'} ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;font-size:0.98rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);">
                  ${isZh ? '酒店餐厅工程定制' : 'Restaurant Hospitality Sourcing'}
                </a>
              </div>
            </div>
          </section>

          <!-- Food Safety & Tabletop Durability Standards -->
          <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
            <div style="background:${theme.bgSoft};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">CULINARY STANDARDS</span>
                  <h2 style="font-size:clamp(1.6rem, 2.5vw, 2.2rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                    ${isZh ? '国际食品接触卫生与耐热抗冲击指标' : 'Food-Grade Hygiene & Thermal Resilience'}
                  </h2>
                </div>
                <div style="font-size:0.88rem;color:${theme.textMuted};">
                  ${isZh ? '通过美国 FDA、德国 LFGB 及国际 NSF 严苛卫生检测' : 'Certified by FDA, LFGB, and NSF Food Equipment Standards'}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};" data-counter="1280" data-suffix="°C">1280°C</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '窑变矿物结晶煅烧温控' : 'High-Temperature Kiln Vitrification'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Lead-free & zero porosity</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;" data-counter="260" data-suffix="°C">260°C</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '烤箱急冷急热耐受差' : 'Thermal Shock Resilience'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Microwave & dishwasher safe</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};">18/10</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '医用级镍铬防锈不锈钢' : 'Chromium-Nickel Flatware'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">High mirror corrosion resistance</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;">NSF Pro</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '商用厨房无死角清洗' : 'Commercial Hygiene Certified'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Zero-crevice seamless weld</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Tableware & Gourmet Collection Grid -->
          <section class="wrap" style="padding:50px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">TABLETOP COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                  ${isZh ? '陶艺餐具与私享料理器皿' : 'Gourmet Tableware & Kitchen Arsenal'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '浏览全部 ↗' : 'View Full Collection ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:#100d0b;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(24,20,18,0.85);backdrop-filter:blur(8px);border:1px solid ${theme.primary};color:${theme.primary};">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                      <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                        ${esc(meta.categoryNameEn || 'Gourmet Pieces')}
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
      // 2. BANNER TEMPLATE: Damascus Cutlery & Cast Iron Michelin Atelier
      // -------------------------------------------------------------
      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Forged Steel & Copper Rust Damascus Banner -->
          <section style="position:relative;padding:90px 0 80px;border-bottom:1px solid ${theme.cardBorder};background:radial-gradient(circle at 70% 30%, rgba(194,94,46,0.12) 0%, #101318 70%);">
            <div class="wrap" style="display:grid;grid-template-columns:1.15fr 1fr;gap:50px;align-items:center;">
              <div data-reveal="fade-up">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:18px;">
                  <span style="font-size:0.75rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${theme.badgeText};">
                    67-LAYER DAMASCUS STEEL METALLURGY · 60±2 HRC
                  </span>
                </div>
                <h1 style="font-size:clamp(2.4rem, 4.4vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 20px;">
                  ${esc(heroTitle)}
                </h1>
                <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(heroSubtitle)}
                </p>
                <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:8px;font-size:0.95rem;font-weight:800;color:#ffffff;background:${theme.btnGradient};box-shadow:0 6px 18px rgba(194,94,46,0.25);">
                    ${isZh ? '探索主厨刀具全系' : 'Explore Cutlery & Cookware'} ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:13px 26px;border-radius:8px;font-size:0.95rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);border:1px solid rgba(194,94,46,0.3);">
                    ${isZh ? '金相热处理与开刃哲学' : 'Metallurgy Standards'}
                  </a>
                </div>
              </div>

              <!-- Hero Featured Damascus Knife Card -->
              <div data-reveal="fade-up" style="background:#161c24;border:1px solid rgba(194,94,46,0.3);border-radius:20px;padding:24px;box-shadow:0 12px 36px rgba(0,0,0,0.5);">
                <div style="position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#0d1015;margin-bottom:20px;">
                  <img src="${esc(defaultMeta.img)}" alt="${esc(defaultMeta.name)}" style="width:100%;height:100%;object-fit:cover;">
                  <span style="position:absolute;bottom:12px;left:12px;padding:4px 12px;border-radius:4px;background:#101318;color:${theme.primary};font-size:0.75rem;font-weight:800;border:1px solid ${theme.primary};">
                    VG-10 Core · 67-Layer Damascus
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 4px;">
                      ${esc(defaultMeta.name)}
                    </h3>
                    <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;">
                      ${esc(defaultMeta.spec1)}
                    </p>
                  </div>
                  <a href="${path(`products/${defaultMeta.id}/index.html`)}" ${navAttrs('detail', defaultMeta.id)} style="text-decoration:none;padding:8px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
                    ${esc(ui.details)} ↗
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- The Metallurgy of Sharpness (Unique to Culinary Banner) -->
          <section class="wrap" style="padding:80px 0 50px;" data-reveal="fade-up">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};">METALLURGY SCIENCE</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:8px 0 14px;">
                ${isZh ? '金相淬火工艺与极致锋芒刃线' : 'Cryogenic Heat Treatment & 15° Double Bevel'}
              </h2>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0;">
                ${isZh ? '深冷处理重构钢材晶格排列，消除内应力；资深研磨师 3,000 目水磨石手工双面开刃，丝滑破皮破肉不碎组织。'
                        : 'Sub-zero cryo-tempering aligns molecular grain structures for relentless sharpness and stain resistance.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              <div style="background:#161c24;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">HARDNESS / 60±2 HRC</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                  ${isZh ? 'VG-10 超级钢核心硬度' : 'VG-10 Super Steel Core'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '高碳高钼合金配比，洛氏硬度达 60±2 HRC，实现出色的长效保锋性，切削自如无需频繁磨刀。'
                          : 'High-carbon alloy matrix holds a scalpel-grade razor edge through thousands of commercial prep cuts.'}
                </p>
              </div>

              <div style="background:#161c24;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">BEVEL / 15° HONING</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                  ${isZh ? '15度双面手工开刃' : '15° Hand-Honed Geometry'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '采用日本传统手工研磨技艺，微凸研磨刃线大幅降低切割阻力，食材切面平整光亮、营养汁水不流失。'
                          : 'Traditional Japanese convex grind minimizes drag across meats and fibrous vegetables without cell bruising.'}
                </p>
              </div>

              <div style="background:#161c24;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">ENAMEL / CAST IRON</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                  ${isZh ? '自循环水珠微压锁水' : 'Self-Basting Condensation'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '加厚铸铁锅盖均匀密布水滴凸点，蒸汽上升凝结为水珠如雨丝般回落食材表面，原汁原味慢炖醇香。'
                          : 'Evenly distributed lid nodules redistribute condensating vapors continuously for uncompromised tenderness.'}
                </p>
              </div>
            </div>
          </section>

          <!-- Culinary Cutlery Catalog Grid -->
          <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">CULINARY ARSENAL</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                  ${isZh ? '专业主厨刀具与铸铁锅全系' : 'Professional Cutlery & Cookware Fleet'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '浏览全部 8 款专业刀锅 ↗' : 'View Full Arsenal ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:#161c24;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:78%;overflow:hidden;background:#0d1015;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:3px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:#101318;color:${theme.primary};border:1px solid ${theme.primary};">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.12rem;font-weight:800;color:#ffffff;line-height:1.3;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.description || '')}
                      </p>
                      <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;font-weight:700;color:${theme.textSub};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:800;">
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
    // CATALOG PAGE: High-Contrast Dark Slate/Truffle Cards
    // -------------------------------------------------------------
    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Gourmet Table Atelier' : 'Damascus Culinary Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 14px;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '探索全系大马士革钢料理刀、法式珐琅铸铁锅与餐桌器皿，支持餐厅集团定制刻字与全球出海直发。'
                      : 'Explore our complete cutlery and culinary tableware collection, engineered for commercial Michelin kitchens and private home dining.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
              return `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.3);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:#0d1015;">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    ${meta.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;color:${theme.primary};background:rgba(16,19,24,0.85);border:1px solid ${theme.primary};">${esc(meta.badge)}</span>` : ''}
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Culinary Gear')}
                    </div>
                    <h2 style="font-size:1.12rem;font-weight:800;color:#ffffff;line-height:1.35;margin:0 0 8px;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.description || '')}
                    </p>
                    <div style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:8px;font-size:0.78rem;color:${theme.textSub};margin-bottom:16px;">
                      <strong>${isZh ? '材质规格' : 'Spec'}:</strong> ${esc(meta.spec1 || 'Standard')}
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.82rem;font-weight:800;">
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
    // DETAIL PAGE: Metallurgy Specs & id="wr-detail-main-img"
    // -------------------------------------------------------------
    const meta = (selectedProduct as ThemedItem).spec1 ? (selectedProduct as ThemedItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img;

    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:40px 0 100px;">
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
            <div style="border-radius:18px;overflow:hidden;background:#0d1015;border:1px solid ${theme.cardBorder};box-shadow:0 8px 30px rgba(0,0,0,0.5);">
              <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
            </div>

            <!-- Product Specs & Inquiries -->
            <div>
              <div style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.categoryNameEn || 'Culinary Specification')}
              </div>
              <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 16px;">
                ${esc(selectedProduct.name)}
              </h1>
              <p style="font-size:1.05rem;line-height:1.75;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(selectedProduct.description || '')}
              </p>

              <!-- Technical Specifications Table -->
              <div style="padding:22px;border-radius:14px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};margin-bottom:28px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.88rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '金相材质' : 'Material Spec'}:</span>
                    <strong style="color:#ffffff;">${esc(meta.spec1 || (selectedProduct as any).material || 'VG-10 Damascus Core')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '尺寸规格' : 'Dimensions'}:</span>
                    <strong style="color:#ffffff;">${esc(meta.spec2 || (selectedProduct as any).dimensions || 'Standard Export Spec')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '食品认证' : 'Certification'}:</span>
                    <strong style="color:#ffffff;">FDA / LFGB / NSF Sanitation</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '采购起订量' : 'MOQ'}:</span>
                    <strong style="color:#ffffff;">${esc(meta.moq || '50 Pcs')}</strong>
                  </div>
                </div>
              </div>

              <!-- High Contrast Sample & Quotation Form -->
              <div style="padding:28px;border-radius:16px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 6px 24px rgba(0,0,0,0.3);">
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 6px;">
                  ${isZh ? '申请此款刀具样件与餐饮批发报价' : 'Request Cutlery Sample & Hospitality Quote'}
                </h3>
                <p style="font-size:0.86rem;color:${theme.textMuted};margin:0 0 16px;">
                  ${isZh ? '支持激光镭雕刀面 LOGO、专属礼盒包装与集装箱海运报价交付。' : 'Support custom laser engraving, gift packaging, and international container freight.'}
                </p>
                <form action="${path('contact/index.html')}" method="GET" style="display:flex;flex-direction:column;gap:12px;">
                  <input type="hidden" name="productId" value="${esc(selectedProduct.id)}" />
                  <input type="email" placeholder="${isZh ? '输入您的企业采购邮箱' : 'Enter your corporate business email'}" required style="padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;outline:none;box-sizing:border-box;" />
                  <button type="submit" style="padding:13px;border-radius:8px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.95rem;font-weight:800;border:none;cursor:pointer;">
                    ${isZh ? '提交主厨样件打样申请' : 'Submit Sample Request'} ↗
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
    // ABOUT PAGE: Cutlery Smithing Heritage & NSF Standards
    // -------------------------------------------------------------
    const aboutHeadline = getAboutHeadline(company, isZh ? '匠心熔铸 · 顶级大马士革刀具与餐桌美学' : 'Master Smithing & Culinary Tableware Heritage');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '工坊创办' : 'Established', desc: 'Bladesmithing heritage' },
      { value: '60±2 HRC', num: 60, suffix: ' HRC', label: isZh ? '深冷真空淬火核心硬度' : 'Rockwell Core Hardness', desc: 'Cryogenic vacuum treatment' },
      { value: 'NSF / FDA', num: 100, suffix: '', label: isZh ? '食品接触国际卫生安全认证' : 'Food-Grade Compliance', desc: 'Commercial kitchen approved' },
      { value: '7-10 Days', num: 7, suffix: ' Days', label: isZh ? '快速开刃打版与包装定制' : 'Fast Prototype Delivery', desc: 'In-house CNC milling' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:820px;margin:0 auto 60px;text-align:center;">
            <div style="display:inline-block;padding:4px 16px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
              ${isZh ? '关于我们的匠心锻造工坊' : 'ABOUT OUR FORGE ATELIER'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 24px;">
              ${esc(aboutHeadline)}
            </h1>
            <div style="display:flex;flex-direction:column;gap:18px;font-size:1.05rem;line-height:1.8;color:${theme.textMuted};text-align:left;">
              ${paragraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
          </div>

          <!-- Metric Counters Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;margin-bottom:60px;">
            ${highlights.map((h) => `
              <div style="padding:28px 20px;border-radius:14px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
                <div style="font-size:2.6rem;font-weight:900;color:${theme.primary};line-height:1;"><span>${esc(h.value)}</span></div>
                <div style="font-size:0.86rem;color:#ffffff;margin-top:10px;font-weight:700;">${esc(h.label)}</div>
                ${h.desc ? `<div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">${esc(h.desc)}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Factory Imagery -->
          <div style="border-radius:18px;overflow:hidden;background:#0d1015;border:1px solid ${theme.cardBorder};margin-bottom:40px;">
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
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:800px;margin:0 auto 50px;text-align:center;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Gourmet Table Atelier' : 'Damascus Culinary Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${esc(ui.contact)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;">
              ${isZh ? '直接与我们的刀剑锻造师及餐饮器具工程师对接，获取大马士革钢测试报告、餐饮批发价目表与大宗采购支持。'
                      : 'Connect directly with our bladesmiths and cookware engineers for metallurgical reports, wholesale pricing, and custom OEM orders.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:40px;align-items:flex-start;">
            <!-- Contact Details Card -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.3);">
              <h3 style="font-size:1.25rem;font-weight:800;color:#ffffff;margin:0 0 20px;">
                ${isZh ? '全球锻造基地与商务中心' : 'Global Forge & Culinary Center'}
              </h3>
              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:${theme.textMuted};">
                <div>
                  <strong style="color:#ffffff;display:block;margin-bottom:2px;">Direct Email:</strong>
                  <a style="color:${theme.primary};font-weight:700;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
                </div>
                ${company.phone ? `
                  <div>
                    <strong style="color:#ffffff;display:block;margin-bottom:2px;">Phone / Tel:</strong>
                    <a style="color:${theme.textMuted};text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
                  </div>
                ` : ''}
                ${company.address ? `
                  <div>
                    <strong style="color:#ffffff;display:block;margin-bottom:2px;">Forge Address:</strong>
                    <span style="line-height:1.5;">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>

              <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:8px;">
                  ${isZh ? '工坊承诺' : 'FORGE COMMITMENT'}
                </div>
                <ul style="margin:0;padding-left:18px;font-size:0.84rem;color:${theme.textSub};line-height:1.7;">
                  <li>${isZh ? '7个工作日完成定制金相材质测试与刻字样件' : '7 business days custom sample and laser logo prototyping'}</li>
                  <li>${isZh ? '提供权威 FDA / LFGB / NSF 食品级检测报告' : 'Full FDA / LFGB / NSF food sanitation compliance reports'}</li>
                  <li>${isZh ? '刀具加厚护刃套与外销抗冲击独立包装' : 'Blade sheath and heavy-duty export shockproof packaging'}</li>
                </ul>
              </div>
            </div>

            <!-- Contact Form Card with Crisp High-Contrast Fields -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.3);">
              <h3 style="font-size:1.25rem;font-weight:800;color:#ffffff;margin:0 0 20px;">
                ${isZh ? '填写采购询盘与定制需求' : 'Submit Project Inquiry'}
              </h3>
              <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                      ${isZh ? '联系人姓名' : 'Your Name'} *
                    </label>
                    <input name="name" autocomplete="name" required maxlength="120" type="text" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                      ${isZh ? '企业电子邮箱' : 'Business Email'} *
                    </label>
                    <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                    ${isZh ? '意向品项' : 'Interested Culinary Gear'} (${esc(ui.optional)})
                  </label>
                  <select name="productId" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;">
                    <option value="">— ${isZh ? '选择感兴趣的刀具、锅具或餐具' : 'Select Product of Interest'} —</option>
                    ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                    ${isZh ? '项目说明与技术要求' : 'Project Details & Specifications'} *
                  </label>
                  <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请说明目标订单数量、刀柄材质偏好、期望交期或LOGO激光刻字要求...' : 'Please specify order quantities, handle materials, packaging or laser engraving...'}" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;resize:vertical;box-sizing:border-box;outline:none;font-family:inherit;"></textarea>
                </div>

                <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>

                <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:15px;border-radius:8px;background:${theme.btnGradient};color:${theme.btnText};font-size:1rem;font-weight:900;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.3);">
                  ${isZh ? '发送厨具采购询盘' : 'Send Culinary Inquiry'} ↗
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><path d="M18 2l4 4-10 10-4-4L18 2zM14 6l4 4M2 22l7-7"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Damascus Culinary Guild')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0 0 16px;max-width:320px;">
            ${isZh ? '高端厨具刀具与餐桌器皿 · 全球主厨与餐饮供应链' : 'Culinary Cookware & Tableware · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '67层大马士革钢主厨刀' : 'Damascus Chef Knives'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '法式珐琅加厚铸铁炖锅' : 'Enamelled Dutch Ovens'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '手工窑变海盐釉餐盘组' : 'Coupe Ceramic Dinnerware'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心制造认证' : 'Quality Standards'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('60±2 HRC')} ${isZh ? '深冷真空热处理硬度' : 'Cryo Vacuum Hardness'}</li>
            <li>✓ ${esc('NSF / FDA')} ${isZh ? '国际食品卫生安全认证' : 'NSF Sanitation Certified'}</li>
            <li>✓ ${esc('18/10 Steel')} ${isZh ? '耐酸碱高耐蚀医用级钢' : '18/10 Stainless Steel'}</li>
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
        <div>✦ ${isZh ? '高端厨具刀具与餐桌器皿旗舰版' : 'Culinary Cookware & Tableware Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
