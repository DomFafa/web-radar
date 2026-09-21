import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export interface ThemedKitchenItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  alloyThermalSpec: string;
  hardnessCoatingSpec: string;
  bladeGeometryDetail: string;
  moq: string;
  tagline: string;
  img: string;
}

export const KITCHEN_DEFAULT_PRODUCTS: ThemedKitchenItem[] = [
  {
    id: 'kit-1',
    name: '67-Layer VG-10 Damascus 8-Inch Master Chef Knife',
    desc: 'Forged from 67 alternating layers of high-carbon stainless steel over a Japanese Takefu VG-10 core, cryogenically heat treated to 60±2 HRC with razor-sharp 15° hand-honed double bevel.',
    badge: 'VG-10 Damascus',
    category: 'knife',
    categoryNameZh: '67层大马士革VG10核心八寸主厨刀',
    categoryNameEn: 'Damascus Chef Knives',
    alloyThermalSpec: '67-Layer VG-10 High-Carbon Core + 410 Stainless Cladding',
    hardnessCoatingSpec: '60±2 HRC Rockwell Hardness · Cryogenic Liquid Nitrogen Quenched',
    bladeGeometryDetail: '15° per side hand-honed bevel with octagonal desert ironwood handle',
    moq: '50 Pcs per Batch',
    tagline: 'Surgical Precision Born from Ancient Swordmaking Metallurgy',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'kit-2',
    name: 'Heavy Enameled Cast Iron 5.5-Quart Heritage Dutch Oven',
    desc: 'Dense molten gray iron casting coated in triple-fired vitreous French enamel, engineered with self-basting condensation spikes under the lid and safe up to 500°F (260°C).',
    badge: 'Vitreous Enamel',
    category: 'cookware',
    categoryNameZh: '法国传统三层珐琅重型铸铁炖锅',
    categoryNameEn: 'Enameled Dutch Ovens',
    alloyThermalSpec: 'Heavy Grey Cast Iron · Triple-Fired Glass Enamel Glaze',
    hardnessCoatingSpec: 'Oven-Safe to 500°F (260°C) · Induction, Gas & Ceramic Compatible',
    bladeGeometryDetail: 'Spiked rainfall condensation self-basting lid with ergonomic brass knob',
    moq: '100 Pcs per Run',
    tagline: 'Centuries of Simmering Depth in Timeless French Enamel',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'kit-3',
    name: '5-Ply Copper-Core Stainless Steel 11-Inch Sauté Skillet',
    desc: 'Professional multi-ply skillet featuring a 100% pure copper core bonded between aluminum layers and magnetic 18/10 stainless steel for instant zero-hotspot heat distribution.',
    badge: '5-Ply Copper Core',
    category: 'cookware',
    categoryNameZh: '五层纯铜芯导热不锈钢平底煎炒锅',
    categoryNameEn: 'Copper-Core Skillets',
    alloyThermalSpec: '5-Ply Bonded: 18/10 Steel + Pure Copper Core + 3003 Aluminum',
    hardnessCoatingSpec: 'Thermal Response Rate 2.5x Faster than Standard Aluminum',
    bladeGeometryDetail: 'Stay-cool hollow cast stainless handle riveted with dual solid aircraft rivets',
    moq: '80 Pcs Batch',
    tagline: 'Instantaneous Flame Control for Michelin-Star Deglazing',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'kit-4',
    name: 'Damascus Nakiri Vegetable Cleaver with Rosewood Handle',
    desc: 'Traditional Japanese rectangular blade designed for rapid push-cutting and paper-thin vegetable slices, featuring a water-drop hammered tsuchime anti-stick finish.',
    badge: 'Tsuchime Hammered',
    category: 'knife',
    categoryNameZh: '手工锤纹大马士革日式菜切料理刀',
    categoryNameEn: 'Nakiri Cleavers',
    alloyThermalSpec: 'AUS-10 Japanese Core Steel + 33 Damascus Clad Layers',
    hardnessCoatingSpec: '59-61 HRC · Convex Ground Tsuchime Anti-Suction Surface',
    bladeGeometryDetail: 'Flat cutting edge with balanced forward weight for effortless chopping',
    moq: '60 Pcs Order',
    tagline: 'Whisper-Clean Slicing Without Bruising Delicate Fibers',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'kit-5',
    name: 'Hand-Hammered Carbon Steel 32cm Wok with Beech Handle',
    desc: 'Traditional spun and hand-hammered 1.6mm heavy-gauge blue carbon steel wok, developing natural non-stick wok hei seasoning over high open burner flames.',
    badge: 'Wok Hei Carbon Steel',
    category: 'cookware',
    categoryNameZh: '传统手工锻打熟铁蓝碳钢圆底炒锅',
    categoryNameEn: 'Carbon Steel Woks',
    alloyThermalSpec: '1.6mm Heavy-Gauge Virgin Blue Carbon Steel (Zero Chemical Coating)',
    hardnessCoatingSpec: 'Natural Oleic Acid Polymerization Seasoning · 800°F Tolerant',
    bladeGeometryDetail: 'Deep spherical bowl with detachable lathe-turned German beechwood handle',
    moq: '150 Pcs Production',
    tagline: 'Capturing the High-Heat Breath of Ancient Asian Culinary Masters',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'kit-6',
    name: 'Artisanal Ceramic French Stoneware Rectangular Baker',
    desc: 'Dense natural Burgundy stoneware clay dish with scratch-resistant porcelain enamel finish, resisting thermal shock from -20°C freezer directly into a 250°C hot oven.',
    badge: 'Burgundy Stoneware',
    category: 'bakeware',
    categoryNameZh: '法国勃艮第耐热高温陶瓷烤盘',
    categoryNameEn: 'French Ceramic Bakeware',
    alloyThermalSpec: 'High-Density Burgundian Clay + Vitrified Glass Enamel',
    hardnessCoatingSpec: 'Thermal Shock Resisting -20°C to 250°C · LFGB Food Safe Passed',
    bladeGeometryDetail: 'Generous molded easy-grip handles with flared anti-spill rim',
    moq: '120 Pcs Run',
    tagline: 'Oven-to-Table Elegance with Flawless Heat Retention',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'kit-7',
    name: 'End-Grain Canadian Hard Rock Maple Butcher Block Board',
    desc: 'Substantial 6cm thick chopping block crafted from vertically aligned end-grain sugar maple, preserving knife sharpness while self-healing from blade incisions.',
    badge: 'End-Grain Maple',
    category: 'board',
    categoryNameZh: '加拿大端面硬枫木自愈级专业砧板',
    categoryNameEn: 'Butcher Block Boards',
    alloyThermalSpec: '100% Solid Certified Canadian Sugar Maple (Acer Saccharum)',
    hardnessCoatingSpec: 'Food-Grade Mineral Oil & Organic Beeswax Deep Saturation',
    bladeGeometryDetail: 'Perimeter deep juice reservoir groove with routed side finger grips',
    moq: '40 Pcs Order',
    tagline: 'Self-Healing Fibers Protecting the Keens of Fine Blades',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'kit-8',
    name: 'Forged 6-Piece Non-Serrated Damascus Steak Knife Set',
    desc: 'Set of six full-tang straight-edge steak knives engineered to slice through seared tenderloins cleanly without tearing delicate meat juices, presented in a solid walnut box.',
    badge: 'Non-Serrated Precision',
    category: 'knife',
    categoryNameZh: '大马士革非微齿手工锻打牛排刀六件套',
    categoryNameEn: 'Steak Knife Sets',
    alloyThermalSpec: 'German 1.4116 High-Molybdenum Stainless Damascus Clad',
    hardnessCoatingSpec: '58 HRC Toughness · Razor Straight Edge (Zero Juice Loss)',
    bladeGeometryDetail: 'Full-tang triple brass mosaic rivets with dark pakkawood scales',
    moq: '30 Sets Run',
    tagline: 'Gliding Through Prime Steaks with Effortless Hydraulic Grace',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getKitchenProducts(ctx: ThemeContext): ThemedKitchenItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Kitchenware Item ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'kitchenware',
      categoryNameZh: '厨具餐具与刀剪器皿',
      categoryNameEn: 'Kitchenware & Cutlery',
      alloyThermalSpec: p.material || '',
      hardnessCoatingSpec: p.dimensions || '',
      bladeGeometryDetail: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = KITCHEN_DEFAULT_PRODUCTS[idx % KITCHEN_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '米其林主厨选' : 'Michelin Select') : (isZh ? '典藏炊具' : 'Culinary Choice'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        alloyThermalSpec: p.material || fallback.alloyThermalSpec,
        hardnessCoatingSpec: p.dimensions || fallback.hardnessCoatingSpec,
        bladeGeometryDetail: fallback.bladeGeometryDetail,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return KITCHEN_DEFAULT_PRODUCTS;
}

export function renderKitchenwareTablewareTemplate(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const page = ctx.page;
  const products = getKitchenProducts(ctx);
  const heroProduct = products[0]!;
  const defaultMeta = KITCHEN_DEFAULT_PRODUCTS[0]!;

  // 100% LIGHT PALETTES FOR BOTH VARIANTS:
  // Banner: Damascus Steel Ice Pale & Gastronomy Crimson Forge
  // Video: Warm French Bakery Ivory & Searing Copper Bronze
  const theme = isVideo
    ? {
        bg: '#fffbeb',
        cardBg: '#ffffff',
        cardBorder: 'rgba(194, 65, 12, 0.14)',
        primary: '#c2410c',
        primaryHover: '#9a3412',
        text: '#271b12',
        textMuted: '#5c4d44',
        textSub: '#8c7b70',
        glassBg: 'rgba(255, 255, 255, 0.9)',
        glassBorder: 'rgba(255, 255, 255, 0.98)',
        pillBg: '#fed7aa',
        pillText: '#9a3412',
        btnGradient: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
        accentGlow: 'rgba(194, 65, 12, 0.16)',
        tagBadge: 'French Culinary Foundry',
      }
    : {
        bg: '#f8fafc',
        cardBg: '#ffffff',
        cardBorder: 'rgba(185, 28, 28, 0.14)',
        primary: '#b91c1c',
        primaryHover: '#991b1b',
        text: '#0f172a',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(255, 255, 255, 0.9)',
        glassBorder: 'rgba(255, 255, 255, 0.98)',
        pillBg: '#fee2e2',
        pillText: '#991b1b',
        btnGradient: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
        accentGlow: 'rgba(185, 28, 28, 0.16)',
        tagBadge: 'Michelin Damascus Forge',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // Header with Apple Liquid Glass
  const headerHtml = `
    <header class="kitchen-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(company.name)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.25rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'Gourmet French Foundry' : 'Damascus Knife Forge'))}
            </span>
            <span style="font-size:0.68rem;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};font-weight:700;">
              ${isVideo ? 'Enameled Cast Iron & 5-Ply Copper' : '67-Layer VG-10 Cutlery & Chef Steel'}
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
            ${isZh ? '餐饮采购 / 索样' : 'Culinary B2B Quote'} ↗
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
              ${esc(company.name || (isVideo ? 'Gourmet French Foundry' : 'Damascus Knife Forge'))}
            </div>
            <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.7;max-width:340px;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'Artisanal French enameled cast iron and 5-ply copper cookware engineered for Michelin-star restaurant endurance.' : 'Master forged 67-layer VG-10 Damascus chef cutlery and butcher blocks crafted to professional gastronomy tolerances.'))}
            </p>
            <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:700;">
              ✓ ${isZh ? '食品接触级 LFGB / FDA 严苛认证' : 'LFGB & FDA Food Contact Certified'}
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '专业品类' : 'Categories'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;color:${theme.textMuted};">
              <span>${isZh ? '大马士革主厨刀' : 'Damascus Chef Cutlery'}</span>
              <span>${isZh ? '重型珐琅铸铁锅' : 'Enameled Dutch Ovens'}</span>
              <span>${isZh ? '五层铜芯不锈钢煎锅' : '5-Ply Copper Skillets'}</span>
              <span>${isZh ? '端面硬枫木自愈砧板' : 'End-Grain Maple Blocks'}</span>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${esc(ui.contact)}</div>
            <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.7;">
              <div><strong>Forge Email:</strong> <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;">${esc(company.email)}</a></div>
              ${company.phone ? `<div><strong>Phone:</strong> ${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div style="margin-top:8px;">${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="padding-top:24px;border-top:1px solid #eef2f6;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:${theme.textSub};">
          <div>© ${new Date().getFullYear()} ${esc(company.name)}. ${esc(ui.rights)}.</div>
          <div>${isZh ? '国际厨具与餐刀制造标准 · ISO9001 质量认证体系' : 'ISO9001 Certified · International Cookware Metallurgy'}</div>
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
      // TEMPLATE 10: kitchen-gourmet-video (French Culinary Video Loop)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. French Culinary Video Showcase with Patisserie Glaze Glass Card -->
          <section style="position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;padding:80px 0;">
            <video id="hero-video" autoplay muted loop playsinline poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.75;filter:brightness(0.95) saturate(1.1);z-index:1;" aria-hidden="true">
              ${videoAsset ? `<source src="${esc(videoAsset)}">` : `<source src="https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-over-high-flames-42619-large.mp4" type="video/mp4">`}
            </video>
            <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(255,251,235,0.94) 0%, rgba(255,251,235,0.74) 50%, rgba(255,251,235,0.4) 100%);z-index:2;"></div>

            <div class="wrap" style="position:relative;z-index:3;width:100%;padding:0 24px;">
              <div style="max-width:680px;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${theme.glassBorder};border-radius:24px;padding:48px;box-shadow:0 20px 50px -10px rgba(194,65,12,0.12);">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.primary};animation:wrPulse 2s infinite;"></span>
                  ${isZh ? '法国经典铸铁与铜芯炊具研制工坊' : 'French Culinary Foundry & Cookware Lab'}
                </div>

                <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;letter-spacing:-0.02em;font-family:serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '法式美馔 · 重型珐琅铸铁炖锅与五层铜芯煎炒锅' : 'Gastronomy Foundry: Enameled Cast Iron & 5-Ply Copper'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '传承法国百年珐琅浸润烧结工艺，厚重灰口铸铁锁温蓄热，雨滴凸点自循环汲水。更有五层纯铜芯导热黑科技，为全球米其林餐厅与高端厨具品牌提供大宗直供。' : 'Triple-fired vitreous enamel over heavy gray iron castings, paired with 5-ply pure copper core sauté skillets. Engineered for culinary precision and lifelong restaurant durability.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:32px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:12px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索经典炊具矩阵 ↗' : 'View Gourmet Cookware ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:12px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '索取厨具样品与报价' : 'Request Cookware Samples'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid #fed7aa;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">500 °F</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '烤箱耐温极限 (260°C)' : 'Oven-Safe Heat Rating'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">2.5x</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '纯铜芯热敏响应倍率' : 'Copper Thermal Conduction'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">100% Non-Toxic</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? 'LFGB 食品级安全珐琅' : 'LFGB Food-Grade Certified'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Thermal Conduction & Metallurgy Grid -->
          <section class="wrap" style="padding:70px 24px;">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">THERMAL METALLURGY</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 14px;font-family:serif;">
                ${isZh ? '顶级法式厨具的三大导热蓄能法则' : 'Three Principles of High-Performance Gastronomy'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '从纯铜芯的极速瞬态温度响应，到厚重铸铁的恒定深层蓄热，为每一道顶级菜肴提供精准火力掌控。' : 'Balancing lightning-fast copper conductivity with dense cast iron heat reservoir capacity.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">01</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '五层金属共生纯铜芯夹层' : '5-Ply Pure Copper Core'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '导热系数高达390 W/(m·K)的纯红铜被紧密包覆于食品级不锈钢中，火焰微调瞬间传导至锅壁全域，彻底消除局部糊底热点。' : 'Copper layer with 390 W/(m·K) conductivity spreads heat instantly up the walls with zero localized hot spots.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '专业米其林酱汁收汁与嫩煎首选' : 'Flawless Searing & Delicate Reduction'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">02</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '三层无孔微晶玻璃质珐琅' : 'Vitreous Microcrystalline Enamel'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '在800°C高温下与铸铁胎体共融结晶，形成完全不与食物酸性发生反应的抗刮光洁表面，极易清洗且无需繁琐开锅养护。' : 'Fused to cast iron at 800°C, providing an impermeable non-reactive shield resistant to citrus, tomatoes, and wines.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '完全不含铅镉及 PTFE/PFOA 有害化学物' : 'Zero Lead, Cadmium, PTFE or PFOA'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">03</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '锅盖内部凸点自循环凝水花洒' : 'Self-Basting Condensation Spikes'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '数十枚水滴状凝水钉引导炖煮蒸汽均匀凝结，化为细雨持续滴落回食材肉质深处，使肉质多汁软烂，锁鲜提香。' : 'Array of cast spikes evenly redistributes condensed juices back over meats, ensuring perpetual moist basting.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '水分蒸发流失率降低 40%' : '40% Greater Moisture Retention'}</div>
              </div>
            </div>
          </section>

          <!-- 3. Gourmet Cookware Showcase Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">CULINARY FLEET</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;font-family:serif;">
                  ${isZh ? '法式高定炊具与餐厨矩阵' : 'Gourmet Cookware Fleet'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全系 8 款器具 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedKitchenItem).alloyThermalSpec ? (item as ThemedKitchenItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(194,65,12,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#fef3c7;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="padding:10px 12px;background:#fffbeb;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '材质/工艺' : 'Material'}:</strong> ${esc(meta.alloyThermalSpec)}
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
      // TEMPLATE 9: kitchen-culinary-banner (Michelin Damascus Cutlery Banner)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Michelin Damascus Cutlery Hero Showcase -->
          <section class="wrap" style="padding:60px 24px 80px;">
            <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ ${isZh ? '日本武生 VG-10 核心 · 67层大马士革手工研磨锻造' : 'Takefu VG-10 67-Layer Hand-Honed Damascus'}
                </div>

                <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.12;color:${theme.text};margin:0 0 18px;letter-spacing:-0.03em;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '极刃无瑕 · 67层大马士革手工开刃米其林主厨刀' : 'Culinary Razor: 67-Layer Damascus 15° Hand-Honed Chef Knives'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '传承古法千锤百炼折叠锻打，芯钢采用日本武生 VG-10 高碳合金，深冷液氮淬火达到 60±2 HRC 极致硬度。双面 15° 手工水磨开刃，滑切如同切豆腐般流畅无阻。' : 'Cryogenically liquid-nitrogen treated to 60±2 HRC with 67 layers of folded Damascus steel. Hand-honed on Japanese waterstones to an unforgiving 15° per side bevel edge.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '鉴赏主厨刀具全系' : 'Explore Cutlery Range'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:8px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '定制激光印标与采购' : 'Custom Laser Engraving Quote'}
                  </a>
                </div>

                <div style="display:flex;gap:32px;padding-top:24px;border-top:1px solid #e2e8f0;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">60±2 HRC</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '洛氏硬度持刃性能' : 'Rockwell Hardness'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">15° Edge</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '纯手工水磨镜面锋刃' : 'Hand-Honed Waterstone Bevel'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">67 Layers</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '折叠锻打天然羽毛花纹' : 'Folded Damascus Cladding'}</div>
                  </div>
                </div>
              </div>

              <!-- Hero Image Box -->
              <div style="position:relative;" class="wr-card-hover">
                <div style="position:relative;border-radius:24px;overflow:hidden;box-shadow:0 25px 60px -15px rgba(185,28,28,0.18);border:1px solid ${theme.cardBorder};background:#f1f5f9;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:520px;object-fit:cover;display:block;">
                </div>
                <div style="position:absolute;bottom:24px;left:24px;right:24px;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ${theme.glassBorder};border-radius:14px;padding:18px 22px;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">${esc(defaultMeta.badge)}</div>
                      <div style="font-size:1.05rem;font-weight:900;color:${theme.text};margin-top:2px;">${esc(heroProduct.name)}</div>
                    </div>
                    <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                      ${isZh ? '查看刃线' : 'Inspect'} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Damascus Cutlery Metallurgy Matrix -->
          <section class="wrap" style="padding:60px 24px 70px;">
            <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">THE METALLURGICAL ART</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                ${isZh ? '米其林主厨刀的三大金相冶金法则' : 'Three Pillars of Gastronomic Metallurgy'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '从碳化物微观均匀分布，到深冷结晶强化，每一柄刀身都是刀匠汗水与尖端冶金的凝结。' : 'Perfect carbide dispersion, sub-zero liquid nitrogen bath, and surgical edge retention.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">STAGE 01 / CORE</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '日本武生特钢 VG-10 钴钼合金' : 'VG-10 Cobalt Alloy Core'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '含碳量高达1.0%，并添加1.5%钴元素以细化晶粒，使刃口在保持极度锋利的同时具备抗崩口的强悍韧性。' : '1.0% high carbon with 1.5% cobalt alloy, refining grain structure for relentless razor sharpness without chipping.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">STAGE 02 / CRYO</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '-196°C 液氮深冷晶相稳定处理' : '-196°C Sub-Zero Liquid Nitrogen'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '在真空气淬后立即浸入零下196°C液氮槽，将残余奥氏体彻底转变为超硬马氏体，消除内部应力。' : 'Immediate cryo-quench converting retained austenite to ultra-hard martensite, guaranteeing 60±2 HRC consistency.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">STAGE 03 / EDGE</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '双面 15° 水磨千目手工开刃' : '15° Dual Bevel Honed on Waterstone'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '由拥有二十年经验的开刃师在8000目天然水磨石上手工研磨，形成平滑如镜的蛤刃倒角，划破食材纤维不挤压肉汁。' : 'Hand-honed on 8000-grit whetstones, producing mirror-polished convex edges that glide without crushing cell walls.'}
                </p>
              </div>
            </div>
          </section>

          <!-- 3. Culinary Cutlery Showcase Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">THE KNIFE VAULT</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                  ${isZh ? '米其林专业刀剪与料理器具' : 'Master Culinary Knife Fleet'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全部 8 款刀具 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedKitchenItem).alloyThermalSpec ? (item as ThemedKitchenItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(185,28,28,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f8fafc;">
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
                        <strong>${isZh ? '钢材硬度' : 'Steel & Hardness'}:</strong> ${esc(meta.hardnessCoatingSpec)}
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
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Gourmet French Foundry' : 'Damascus Knife Forge'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'serif' : 'inherit'};">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? (isVideo ? '浏览法式珐琅铸铁荷兰锅、五层纯铜芯导热煎锅、耐热陶瓷烤盘与手工熟铁锅，支持全球星级餐饮机构与高端厨具品牌大宗外贸采购。' : '探索67层VG-10大马士革主厨刀、锤纹菜切料理刀、非微齿牛排刀套组与端面硬枫木自愈砧板，支持专属激光镭雕开模。') : (isVideo ? 'Explore our French enameled cast iron Dutch ovens, 5-ply copper skillets, and ceramic bakeware.' : 'Browse our 67-layer Damascus chef knives, cleavers, and Canadian maple butcher blocks.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedKitchenItem).alloyThermalSpec ? (item as ThemedKitchenItem) : KITCHEN_DEFAULT_PRODUCTS[idx % KITCHEN_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.04);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#fef3c7' : '#f8fafc'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                      ${esc(meta.badge)}
                    </span>
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn)}
                    </div>
                    <h2 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:${isVideo ? 'serif' : 'inherit'};">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.desc || '')}
                    </p>
                    <div style="background:${isVideo ? '#fffbeb' : '#f8fafc'};padding:10px 12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;">
                      <div><strong>${isZh ? '材质金相' : 'Metallurgy'}:</strong> ${esc(meta.alloyThermalSpec)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '硬度/耐温' : 'Hardness & Rating'}:</strong> ${esc(meta.hardnessCoatingSpec)}</div>
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
    const meta = (selectedProduct as unknown as ThemedKitchenItem).alloyThermalSpec ? (selectedProduct as unknown as ThemedKitchenItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;

    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
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
                ${esc(meta.badge || (isVideo ? 'French Vitreous Enamel' : '67-Layer Damascus'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:${isVideo ? 'serif' : 'inherit'};">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc((selectedProduct as any).desc || selectedProduct.description || defaultMeta.desc)}
              </p>

              <!-- Technical / Metallurgy Specifications Grid -->
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                  ${isZh ? '金相冶金与专业烹饪技术参数' : 'Metallurgical Specifications & Kitchen Performance'}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '合金与材质构造' : 'Alloy Composition'}</span>
                    <strong style="color:${theme.text};">${esc(meta.alloyThermalSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '洛氏硬度 / 耐热等级' : 'Hardness / Heat Rating'}</span>
                    <strong style="color:${theme.text};">${esc(meta.hardnessCoatingSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '开刃角度/手柄工效学' : 'Blade Bevel & Ergonomics'}</span>
                    <strong style="color:${theme.text};">${esc(meta.bladeGeometryDetail)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '项目起订量 / 交付' : 'MOQ & Production Lead Time'}</span>
                    <strong style="color:${theme.primary};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(selectedProduct.id))}" ${navAttrs('contact', selectedProduct.id)} style="text-decoration:none;padding:15px 32px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};flex:1;text-align:center;">
                  ${isZh ? '发起 B2B 刀具/锅具采购询价' : 'Inquire for Custom Cookware Order'} ↗
                </a>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 24px;border-radius:10px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                  ← ${esc(ui.back)}
                </a>
              </div>
            </div>
          </div>

          <!-- Related Products -->
          <section style="padding-top:40px;border-top:1px solid #e2e8f0;">
            <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 24px;font-family:${isVideo ? 'serif' : 'inherit'};">${esc(ui.related)}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:24px;">
              ${products.filter((p) => p.id !== selectedProduct.id).slice(0, 3).map((item) => `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,0.03);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:70%;overflow:hidden;border-radius:10px;margin-bottom:12px;background:#f8fafc;">
                    <img src="${esc((item as any).img || ctx.productMainImage(item as unknown as Product))}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                  </div>
                  <h3 style="font-size:0.96rem;font-weight:800;color:${theme.text};margin:0 0 6px;font-family:${isVideo ? 'serif' : 'inherit'};">${esc(item.name)}</h3>
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
    // ABOUT PAGE: High-Contrast Culinary Metallurgy Legacy
    // -------------------------------------------------------------
    const headline = getAboutHeadline(company, company.name);
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const aboutImg = ctx.asset(company.aboutImageAssetId) || (products[1] ? (products[1] as any).img : defaultMeta.img);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '40+ Yrs', num: 40, suffix: '+ Yrs', label: isZh ? '刀剪铸造匠心历史' : 'Foundry Craft History', desc: isZh ? '数十万把主厨刀具全球实战检验' : 'Decades of professional knife forging' },
      { value: '60±2 HRC', num: 60, suffix: ' HRC', label: isZh ? '稳定洛氏硬度基准' : 'Target Rockwell Hardness', desc: isZh ? '深冷淬火晶粒细化卓越持刃' : 'Cryogenic liquid nitrogen tempered' },
      { value: '100% LFGB', num: 100, suffix: '%', label: isZh ? '食品接触欧盟认证' : 'Food Safety Standard', desc: isZh ? '严格杜绝铅镉及化学涂层脱落' : 'Zero toxic migration tested' },
      { value: '80+ Hotels', num: 80, suffix: '+ Groups', label: isZh ? '全球高端酒店后厨直供' : 'Culinary Groups Supplied', desc: isZh ? '服务国际米其林与豪华游轮主厨' : 'Equipping Michelin kitchens globally' },
    ]);

    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:50px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '冶金锻造传承与米其林主厨哲学' : 'FOUNDRY HERITAGE & CHEF PHILOSOPHY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'serif' : 'inherit'};">
              ${esc(headline)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:720px;">
              ${esc(company.slogan || (isVideo ? '让每一位烹饪艺术家在精准控温中挥洒味觉灵感。' : '以微米级开刃与深冷金相，为全球主厨打造如手臂延伸般的人刀合一体验。'))}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                  <p style="margin:0 0 18px;">
                    ${isZh ? '我们的刀剪与炊具制造基地拥有超过 50,000 平方米的专业厂区，配备真空高温热处理炉、-196°C 液氮深冷隧道、数控水磨开刃流水线以及全自动重型静压铸造机。' : 'Operating a 50,000 m² cookware and cutlery manufacturing facility equipped with vacuum heat-treatment furnaces, -196°C cryogenic liquid nitrogen tunnels, and automated precision casting rigs.'}
                  </p>
                  <p style="margin:0 0 18px;">
                    ${isZh ? '从特种合金钢材的金相光谱分析，到每一把刀具在千目水磨石上的手工出刃，我们恪守对烹饪艺术的敬畏，确保每一件出厂器具都能承受高强度后厨考验。' : 'From spectroscopic alloy verification to manual whetstone sharpening, our commitment to professional gastronomy metallurgy guarantees relentless reliability.'}
                  </p>
                `}
              </div>
              <div style="margin-top:28px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                  ${isZh ? '预约验厂洽谈 / 样品评估' : 'Schedule Factory Evaluation'} ↗
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
                <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:6px;font-family:${isVideo ? 'serif' : 'inherit'};">${esc(s.value)}</div>
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
    // CONTACT PAGE: Direct Commercial Kitchenware Inquiry Form
    // -------------------------------------------------------------
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '餐饮后厨大宗直采与品牌代工' : 'COMMERCIAL FOODSERVICE & OEM INQUIRY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'serif' : 'inherit'};">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的后厨采购需求或品牌定制规格，我们的厨具外贸团队将在 24 小时内与您接洽，并提供刀具锋利度测试样刀及大宗阶梯报价。' : 'Submit your procurement schedule or brand OEM requirements. Our export cutlery team will respond within 24 hours with testing samples and tier pricing.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <!-- Contact Card Details -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;font-family:${isVideo ? 'serif' : 'inherit'};">
                ${esc(company.name || (isVideo ? 'Gourmet French Foundry HQ' : 'Damascus Knife Forge'))}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(company.description || (isZh ? '专注高端专业厨具与大马士革刀剪出口，支持OEM/ODM/OBM全球集装箱海运履约。' : 'Direct factory manufacturer supplying commercial gastronomy groups and retail brands worldwide.'))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Direct Export Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Procurement Phone</span>
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
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Foundry Facility</span>
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
                    <option value="">${isZh ? '— 选择意向刀剪 / 锅具型号 —' : '— Select Cutlery or Cookware —'}</option>
                    ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>

                <div style="grid-column:span 2;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.message)} *</label>
                  <textarea name="message" required maxlength="5000" rows="5" placeholder="${isZh ? '请描述您的餐厅后厨规模、预计采购数量、钢材或珐琅颜色定制要求、目标交期等...' : 'Describe your restaurant scale, order volume, custom steel or enamel colorway requirements, target milestone...'}" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;resize:vertical;"></textarea>
                </div>

                <div style="display:none;" aria-hidden="true">
                  <input name="website" tabindex="-1" autocomplete="off">
                </div>

                <div style="grid-column:span 2;display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                  <button type="submit" ${ctx.options.preview ? 'disabled' : ''} style="padding:14px 34px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;border:none;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    ${esc(ui.send)} ↗
                  </button>
                  <span style="font-size:0.78rem;color:${theme.textSub};">${isZh ? '严格保密 · 24小时内极速回复' : 'Strict NDA · 24h Response'}</span>
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
