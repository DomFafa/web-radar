import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

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

function sanitizeCopy(text: string | undefined, fallbackEn: string, fallbackZh: string, isZh: boolean): string {
  if (!text || !text.trim()) return isZh ? fallbackZh : fallbackEn;
  if (!isZh && /[\u4e00-\u9fa5]/.test(text)) return fallbackEn;
  return text;
}

export function getKitchenProducts(ctx: ThemeContext): ThemedKitchenItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Kitchenware Item ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'kitchen',
      categoryNameZh: '厨具餐具与刀剪器皿',
      categoryNameEn: 'Kitchenware & Tableware',
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
        badge: idx === 0 ? (isZh ? '大马士革旗舰' : 'Master Damascus') : (isZh ? '主厨严选' : 'Chef Pick'),
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

  const brandName = sanitizeCopy(
    company.name,
    isVideo ? 'Royal Banquet Porcelain Salon' : 'Foundry Metallurgy & Cutlery Atelier',
    isVideo ? '皇家国宴骨瓷定制沙龙' : '先锋冶金刀剪锻造工坊',
    isZh,
  );

  const brandTagline = isVideo
    ? (isZh ? '米其林高端餐厅45%骨瓷与国宴餐具' : 'Michelin 45% Bone China & Haute Tableware')
    : (isZh ? '67层大马士革主厨刀与五层纯铜锅具' : '67-Layer Damascus Steel & 5-Ply Copper Cookware');

  const theme = isVideo
    ? {
        bg: '#fefce8',
        cardBg: '#ffffff',
        cardBorder: 'rgba(202, 138, 4, 0.16)',
        primary: '#ca8a04',
        primaryHover: '#a16207',
        text: '#1c1917',
        textMuted: '#57534e',
        textSub: '#78716c',
        glassBg: 'rgba(254, 252, 232, 0.92)',
        pillBg: '#fef08a',
        pillText: '#854d0e',
        btnGradient: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
        accentGlow: 'rgba(202, 138, 4, 0.18)',
      }
    : {
        bg: '#f8fafc',
        cardBg: '#ffffff',
        cardBorder: 'rgba(153, 27, 27, 0.12)',
        primary: '#991b1b',
        primaryHover: '#7f1d1d',
        text: '#0f172a',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(248, 250, 252, 0.92)',
        pillBg: '#fee2e2',
        pillText: '#991b1b',
        btnGradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
        accentGlow: 'rgba(153, 27, 27, 0.16)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  const headerHtml = `
    <header class="kitchen-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.02);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:${isVideo ? 'Georgia, serif' : 'system-ui, sans-serif'};">
              ${esc(brandName)}
            </span>
            <span style="font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;color:${theme.primary};font-weight:700;">
              ${esc(brandTagline)}
            </span>
          </div>
        </a>

        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.contact)}</a>
        </nav>

        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
            ${isZh ? '主厨定制与询价' : 'Commercial RFQ'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // -------------------------------------------------------------
      // GOURMET VIDEO: Michelin Banquet Bone China Salon Hero
      // -------------------------------------------------------------
      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ ${isZh ? '米其林星厨国宴骨瓷餐具' : 'Fine Banquet Bone China & Porcelain'}
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.02em;margin:0 0 18px;font-family:Georgia, serif;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Translucent Refinement: 45% Bone China & Banquet Vitrification', '凝光温润 · 45% 高纯骨瓷与国宴釉中彩瓷器', isZh))}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:620px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Crafted with 45% high-grade bovine bone ash and fired at 1320°C. Delivering signature optical translucency, chip-resistant rims, and hand-gilded 24K pure gold rims for luxury banquet hospitality.', '采用 45% 特级牛骨粉经 1320°C 二次素烧与釉烧，兼具通透如玉的透光度与极高抗冲击韧性。全手工描金 24K 纯金边，专为五星级酒店宴会与米其林餐厅定制。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索全套国宴餐瓷 ↗' : 'View Banquet Collections ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '申请餐厅样品寄送' : 'Request Hospitality Samples'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">45%</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '高纯天然骨粉含量' : 'Bone Ash Purity'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">1320°C</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '高温釉中彩烧结' : 'In-Glaze Vitrification'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">1,000+</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '商用洗碗机洗涤循环' : 'Commercial Cycles'}</div>
                  </div>
                </div>
              </div>

              <!-- Dining Video Card -->
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(0,0,0,0.06);">
                  <div style="position:relative;padding-top:72%;background:#1c1917;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(28,25,23,0.85) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <span style="font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#fef08a;background:rgba(202,138,4,0.3);padding:3px 8px;border-radius:4px;">
                          Translucency Optical Test
                        </span>
                        <span style="font-size:0.75rem;font-family:serif;color:rgba(255,255,255,0.8);">45% Bone China</span>
                      </div>
                      <div style="font-size:1.05rem;font-weight:800;font-family:serif;line-height:1.3;">Ethereal Light Transmission</div>
                      <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-top:2px;">Backlight reveals warm ivory translucency and flawless vitrification.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3 Banquet Pillars -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;font-family:serif;">
                  HAUTE HOSPITALITY CRAFTSMANSHIP
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;font-family:Georgia, serif;">
                  ${isZh ? '国宴级骨瓷餐具的三大工艺标准' : 'Three Standards of Royal Banquet Porcelain'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.7;">
                  ${isZh ? '融汇自然矿物之骨与烈火淬炼，为全球奢华宴会与高端米其林主厨呈献无与伦比的就餐仪式感。' : 'Balancing ethereal translucency with high-impact commercial durability for premier global banquets.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">I.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '45% 纯天然煅烧骨粉' : '45% Calcined Bone Ash'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '精选高纯度脱脂牛骨粉，赋予瓷体如羊脂白玉般的通透光泽与轻盈质感，击打声音清脆如磬。' : 'High-calcium bovine bone ash imparting milk-white translucency and bell-like resonance.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">II.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '1320°C 釉中彩抗划伤' : '1320°C In-Glaze Vitrification'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '色料完全沉入玻璃釉质内部，耐受商业刀叉刮擦零划痕，铅镉溶出量为零，符合FDA与LFGB标准。' : 'Pigments meld entirely into the glaze layer, resisting steak knife abrasions with zero lead or cadmium.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">III.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '纯手工描绘 24K 纯金边' : 'Hand-Gilded 24K Pure Gold'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '由经验丰富的工匠手工描边，经高温牢固附着，在商业高压洗碗机上千次洗涤后依然灿烂夺目。' : 'Hand-painted 24K pure liquid gold rims engineered for over 1,000 cycles in commercial dishwashers.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Gourmet Tableware Grid -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;font-family:serif;">
                    ROYAL BANQUET EDITIONS
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;font-family:Georgia, serif;">
                    ${isZh ? '国宴餐瓷与米其林器皿' : 'Banquet Dinnerware Collections'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};font-family:serif;">
                  ${isZh ? '浏览全系餐瓷目录 ↗' : 'View Full Catalog ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedKitchenItem).alloyThermalSpec ? (item as ThemedKitchenItem) : KITCHEN_DEFAULT_PRODUCTS[idx % KITCHEN_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(202,138,4,0.04);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:74%;overflow:hidden;background:#fefce8;">
                        <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                        <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};font-family:serif;">
                          ${esc(meta.badge)}
                        </span>
                      </div>
                      <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;font-family:serif;">
                          ${esc(meta.categoryNameEn)}
                        </div>
                        <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                          ${esc(item.name)}
                        </h3>
                        <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                          ${esc(item.desc || '')}
                        </p>
                        <div style="background:#fefce8;padding:10px 12px;border-radius:6px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;border:1px solid ${theme.cardBorder};">
                          <strong>${isZh ? '材质参数' : 'Material Spec'}:</strong> ${esc(meta.alloyThermalSpec)}
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
          </section>
        </main>
      `;
    } else {
      // -------------------------------------------------------------
      // CULINARY BANNER: Chef Cutlery & Metallurgy Forge Hero
      // -------------------------------------------------------------
      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:90px 0 110px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.2fr 0.8fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ ${isZh ? '先锋主厨刀剪与微米级金相冶金工程' : 'Master Chef Metallurgy & Cryogenic Cutlery'}
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.8rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Razor Precision: 67-Layer VG-10 Damascus & Cryogenic Quench', '锋芒毕露 · 67层大马士革VG-10核心深冷金相主厨刀', isZh))}
                </h1>
                <p style="font-size:1.12rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:640px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Forged from 67 alternating layers of high-carbon steel cryogenically tempered at -196°C to 60±2 HRC. Honed to a razor 15° double bevel for effortless protein slicing and cellular preservation.', '以微米级开刃与-196°C深冷金相处理，洛氏硬度达60±2 HRC。双面15°激光引导手工水磨研磨，专为全球米其林主厨与星级餐厅定制无阻力切割体验。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:40px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索全系先锋刀剪' : 'Explore Cutlery Line'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:8px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '索取餐厅批量报价与激光刻标' : 'Request Commercial Quote'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;padding-top:28px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">60±2 HRC</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '洛氏深冷硬度标准' : 'Rockwell Hardness'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">15° Edge</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '激光引导手工双面水磨' : 'Laser Honed Bevel'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">-196°C</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '液氮深冷金相淬火' : 'Cryogenic Quenching'}</div>
                  </div>
                </div>
              </div>

              <!-- Editorial Damascus Knife Display -->
              <div style="position:relative;">
                <div style="border-radius:18px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(15,23,42,0.08);padding:14px;">
                  <div style="border-radius:12px;overflow:hidden;position:relative;padding-top:105%;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.75) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#fca5a5;margin-bottom:4px;">
                        FLAGSHIP METALLURGY
                      </div>
                      <div style="font-size:1.15rem;font-weight:900;line-height:1.3;">
                        ${esc(heroProduct.name)}
                      </div>
                      <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-top:4px;">
                        ${esc(heroProduct.alloyThermalSpec)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3 Metallurgy Pillars -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">
                  METALLURGICAL PRECISION & CRAFTSMANSHIP
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;">
                  ${isZh ? '专业主厨级刀剪的三大金相法则' : 'Three Metallurgical Pillars of Culinary Cutlery'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.7;">
                  ${isZh ? '从微观马氏体晶相重排到手工水磨开刃，将坚硬与锋利、韧性与平衡推向极致。' : 'Achieving peak edge retention, ductility, and frictionless cutting balance.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:32px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-weight:900;margin-bottom:14px;">01</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '-196°C 液氮深冷处理' : 'Cryogenic Nitrogen Quench'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '真空炉热处理后迅速置入-196°C液氮隧道，促使残留奥氏体彻底转化为坚韧马氏体，硬度与耐磨性大幅跃升。' : 'Sub-zero quenching transforms residual austenite into hard martensite, elevating edge retention 3x.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-weight:900;margin-bottom:14px;">02</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '15° 手工双面水磨刃角' : '15° Hand-Honed Bevel'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '经验丰富的开刃师傅在水冷砂轮上纯手工精磨，形成超镜面开刃线，食材切口平整完好，牢牢锁住鲜美肉汁。' : 'Water-cooled grinding wheels produce razor 15° edges that slice without crushing delicate cell walls.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-weight:900;margin-bottom:14px;">03</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '一体锻造全贯通龙骨' : 'Full-Tang Balance Bolster'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '钢材从刀尖贯通至手柄末端，完美重心置于指托交界处，长时间密集切配手腕轻松不疲惫。' : 'Continuous steel tang balanced at the pinch-grip bolster, eliminating fatigue during heavy kitchen service.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Cutlery Pieces -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;">
                    PROFESSIONAL CUTLERY FLEET
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;">
                    ${isZh ? '主厨锻造刀剪系列' : 'Forged Culinary Cutlery & Cookware'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};">
                  ${isZh ? '浏览全系 8 款器具 ↗' : 'View Full Catalog ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedKitchenItem).alloyThermalSpec ? (item as ThemedKitchenItem) : KITCHEN_DEFAULT_PRODUCTS[idx % KITCHEN_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(15,23,42,0.03);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f8fafc;">
                        <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                        <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};">
                          ${esc(meta.badge)}
                        </span>
                      </div>
                      <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                        <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                          ${esc(item.name)}
                        </h3>
                        <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                          ${esc(item.desc || '')}
                        </p>
                        <div style="padding:10px 12px;background:#f8fafc;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;border:1px solid ${theme.cardBorder};">
                          <strong>${isZh ? '钢材规格' : 'Steel Spec'}:</strong> ${esc(meta.alloyThermalSpec)}
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
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;border-bottom:1px solid ${theme.cardBorder};padding-bottom:28px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isVideo ? 'ROYAL BANQUET DINNERWARE' : 'PRECISION CULINARY METALLURGY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'Georgia, serif' : 'system-ui, sans-serif'};">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:700px;line-height:1.7;">
              ${isZh ? (isVideo ? '品鉴高纯骨瓷餐盘、汤盅、茶具与宴会套组，为全球五星级酒店宴会与高级餐厅提供定制烧制。' : '探索67层大马士革主厨刀、法国珐琅铸铁炖锅、纯铜芯导热锅与日式菜切料理刀，支持餐饮定制与激光镭雕。') : (isVideo ? 'Explore our fine translucent bone china collections engineered for premier banquet hospitality.' : 'Browse our forged Damascus cutlery and multi-ply clad cookware engineered for professional commercial kitchens.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedKitchenItem).alloyThermalSpec ? (item as ThemedKitchenItem) : KITCHEN_DEFAULT_PRODUCTS[idx % KITCHEN_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#fefce8' : '#f8fafc'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};">
                      ${esc(meta.badge)}
                    </span>
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn)}
                    </div>
                    <h2 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:${isVideo ? 'Georgia, serif' : 'system-ui, sans-serif'};">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                      ${esc(item.desc || '')}
                    </p>
                    <div style="background:${isVideo ? '#fefce8' : '#f8fafc'};padding:12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;border:1px solid ${theme.cardBorder};">
                      <div><strong>${isZh ? '材质规格' : 'Material Spec'}:</strong> ${esc(meta.alloyThermalSpec)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '性能参数' : 'Performance'}:</strong> ${esc(meta.hardnessCoatingSpec)}</div>
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

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;margin-bottom:70px;">
            <div>
              <div style="border-radius:18px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 36px rgba(0,0,0,0.05);position:relative;">
                <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;max-height:540px;object-fit:cover;display:block;">
              </div>
            </div>

            <div>
              <div style="display:inline-block;padding:5px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.badge || (isVideo ? 'Royal Bone China' : 'Damascus Metallurgy'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:${isVideo ? 'Georgia, serif' : 'system-ui, sans-serif'};">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(sanitizeCopy((selectedProduct as any).desc || selectedProduct.description, meta.desc, meta.desc, isZh))}
              </p>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                  ${isZh ? (isVideo ? '国宴餐瓷用料与高温烧结参数' : '微米级金相参数与热处理规格') : (isVideo ? 'Bone China Chemistry & Vitrification Specs' : 'Cutlery Metallurgy & Heat Treatment Specs')}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.86rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '用料构成' : 'Core Composition'}</span>
                    <strong style="color:${theme.text};">${esc(meta.alloyThermalSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '硬度/热性能' : 'Hardness & Thermal'}</span>
                    <strong style="color:${theme.text};">${esc(meta.hardnessCoatingSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '刃口/器型' : 'Geometry / Profile'}</span>
                    <strong style="color:${theme.text};">${esc(meta.bladeGeometryDetail)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '起订门槛' : 'Production MOQ'}</span>
                    <strong style="color:${theme.text};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                  ${isZh ? '索取该款样品与开模定制报价' : 'Request Item Sample & Pricing'} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    // -------------------------------------------------------------
    // ABOUT PAGE: COMPLETELY DIFFERENT LAYOUTS FOR BANNER & VIDEO
    // ZERO SQUISHY CAT FALLBACK!
    // -------------------------------------------------------------
    const headline = sanitizeCopy(
      getAboutHeadline(company, company.name),
      isVideo ? 'Royal Porcelain Manufacture & Banquet Tableware Atelier' : 'Foundry Metallurgy Heritage & Cryogenic Blade Philosophy',
      isVideo ? '皇家国宴骨瓷烧造厂与餐具美学工坊' : '微米级先锋刀剪锻造厂与深冷金相实验室',
      isZh,
    );

    const customAboutImg = company.aboutImageAssetId ? ctx.asset(company.aboutImageAssetId) : '';
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '45+ Yrs', num: 45, suffix: '+ Yrs', label: isZh ? '冶金与陶瓷传承' : 'Metallurgy & Ceramic Heritage', desc: isZh ? '逾四十年高标准厨具出海积淀' : 'Decades of commercial kitchenware export' },
      { value: '42,000 m²', num: 42000, suffix: ' m²', label: isZh ? '智能智造园区' : 'Smart Production Facility', desc: isZh ? '德国等静压成型与电脑梭式窑' : 'Advanced isostatic presses & kilns' },
      { value: '100%', num: 100, suffix: '%', label: isZh ? '食品接触级合规' : 'Food Grade Certified', desc: isZh ? '全线通过 LFGB / FDA 权威安全检测' : 'Certified non-toxic & food contact safe' },
      { value: '60+ Mkts', num: 60, suffix: '+ Mkts', label: isZh ? '全球出口国家' : 'Global Export Markets', desc: isZh ? '服务国际星级酒店与名厨餐馆' : 'Supplying international hospitality chains' },
    ]);

    if (isVideo) {
      // GOURMET VIDEO ABOUT: Royal Porcelain Cleanroom & Translucency Lab
      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;font-family:serif;">
                ROYAL TABLEWARE & CERAMIC CHEMISTRY
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;font-family:Georgia, serif;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '以温润高透的天然牛骨粉与1320°C高温釉中彩，为全球主厨构筑盛放美食灵感的传世器物。' : 'Blending 45% calcined bone ash with 1320°C high-temperature in-glaze vitrification to create luminous porcelain canvases for global culinary masters.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的皇家骨瓷制造厂占地 42,000 平方米，拥有全自动德国多通道等静压干压成型流水线与全封闭无尘高温梭式窑炉。' : 'Operating an advanced 42,000 m² porcelain manufacturing facility equipped with German isostatic pressing lines and computerized atmospheric shuttle kilns.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '骨粉原料均经过严格脱脂精细研磨，白度高达 88 度以上。每件器皿均经过 12 道人工质检与冲击韧性测试，确保在五星级酒店宴会高频使用中不掉色、不崩边。' : 'Every piece passes 12 strict optical clarity and edge chip-impact tests, ensuring lifetime color brilliance and commercial dishwasher resilience in luxury banquet service.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约宴会餐瓷打样考察' : 'Schedule Banquet Atelier Evaluation'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:18px;background:#ffffff;padding:36px;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(202,138,4,0.08);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:serif;">
                      ROYAL BONE CHINA CERTIFICATE
                    </div>
                    <div style="font-size:1.35rem;font-weight:900;color:${theme.text};font-family:serif;margin-bottom:14px;">
                      Optic Translucency & LFGB Safe
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.86rem;color:${theme.textMuted};">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Bone Ash Concentration</span>
                        <strong style="color:${theme.text};font-family:serif;">45.2% High Purity</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Firing Atmosphere</span>
                        <strong style="color:${theme.text};font-family:serif;">1320°C Reducing Kiln</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Heavy Metal Leaching</span>
                        <strong style="color:${theme.text};font-family:serif;">0.00% Lead & Cadmium</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>Hospitality Clients</span>
                        <strong style="color:${theme.primary};font-family:serif;">5-Star International Hotels</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Porcelain Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:26px;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};font-family:serif;margin-bottom:4px;">${esc(s.value)}</div>
                  <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(s.label)}</div>
                  ${s.desc ? `<div style="font-size:0.8rem;color:${theme.textSub};margin-top:4px;">${esc(s.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    } else {
      // CULINARY BANNER ABOUT: Cutlery Metallurgy & Cryogenic Quench Foundry
      mainHtml = `
        <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;">
                FOUNDRY HERITAGE & CHEF PHILOSOPHY
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '以微米级开刃与深冷金相，为全球主厨打造如手臂延伸般的人刀合一体验。' : 'Engineering seamless knife-to-hand integration through sub-micron edge beveling and cryogenic nitrogen metallurgy.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们拥有占地 48,000 平方米的现代餐厨刀剪制造基地，配备高精度真空热处理炉、-196°C 液氮深冷隧道以及全自动数控精磨开刃机组。' : 'Operating a 48,000 m² cookware and cutlery manufacturing campus equipped with automated vacuum heat-treatment furnaces, -196°C cryogenic liquid nitrogen tunnels, and robotic precision grinding rigs.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '从每一批次大马士革钢材的光谱仪成分复验，到开刃师傅手工在 3000 目砥石上的精细微研磨，我们对专业烹饪器具的品质坚守始终如一。' : 'From spectroscopic alloy verification to manual whetstone sharpening on 3,000-grit water stones, our metallurgical rigor guarantees relentless edge endurance in high-volume restaurant kitchens.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约实地验厂与洽谈' : 'Schedule Factory Evaluation'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:18px;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:36px;color:#ffffff;box-shadow:0 16px 40px rgba(0,0,0,0.12);border:1px solid rgba(153,27,27,0.3);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ef4444;margin-bottom:8px;">
                      METALLURGY FOUNDRY TELEMETRY
                    </div>
                    <div style="font-size:1.4rem;font-weight:900;margin-bottom:16px;">
                      Cryogenic Vacuum Quench Lab
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.85rem;color:rgba(255,255,255,0.8);">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Liquid Nitrogen Temperature</span>
                        <strong style="color:#ffffff;">-196°C Sub-Zero Quench</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Rockwell Target Hardness</span>
                        <strong style="color:#ffffff;">60 ± 2 HRC</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Double-Bevel Symmetry</span>
                        <strong style="color:#ffffff;">15° ± 0.5° Laser Verified</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>Food Contact Certification</span>
                        <strong style="color:#ef4444;">NSF & LFGB Passed</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Metallurgy Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:26px;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:4px;">${esc(s.value)}</div>
                  <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(s.label)}</div>
                  ${s.desc ? `<div style="font-size:0.8rem;color:${theme.textSub};margin-top:4px;">${esc(s.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'contact') {
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="kitchen-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '餐饮大宗直供与定制询盘' : 'COMMERCIAL PROCUREMENT & CUSTOM BRANDING'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'Georgia, serif' : 'system-ui, sans-serif'};">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的采购需求或定制规格，我们的外贸专家将在 24 小时内与您接洽，并提供正式报价单、激光镭雕效果图与外贸样品寄送方案。' : 'Submit your procurement specifications or private-label requests. Our export team will respond within 24 hours with volume pricing and sample dispatch.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;font-family:${isVideo ? 'Georgia, serif' : 'system-ui, sans-serif'};">
                ${esc(brandName)}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(sanitizeCopy(company.description, isVideo ? 'Direct fine bone china porcelain manufacture supplying premier luxury banquet hotel chains worldwide.' : 'Direct cutlery and cookware foundry providing custom Damascus blades and heavy cookware globally.', isVideo ? '专注高品质国宴骨瓷餐具制造与米其林餐厅出海定制，支持全球集装箱货运履约。' : '专注专业大马士革刀剪与重型锅具制造外贸，支持OEM/ODM全球直供。', isZh))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Direct Export Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Factory Hotline</span>
                    <a href="tel:${esc(company.phone)}" style="color:${theme.text};text-decoration:none;font-weight:700;">${esc(company.phone)}</a>
                  </div>
                ` : ''}

                ${company.whatsapp ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">WhatsApp Rapid Response</span>
                    <a href="https://wa.me/${waDigits}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:none;font-weight:700;">+${waDigits} (Chat Now ↗)</a>
                  </div>
                ` : ''}

                ${company.address ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Manufacturing Facility</span>
                    <span style="color:${theme.text};">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- RFQ Form with select name=productId -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <form action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" class="kitchen-inquiry-form" style="display:flex;flex-direction:column;gap:20px;">
                <input type="hidden" name="projectId" value="${esc(ctx.options.projectId || '')}">
                <input type="hidden" name="template" value="${isVideo ? 'kitchen-gourmet-video' : 'kitchen-culinary-banner'}">

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '您的姓名 / 职务' : 'Full Name & Title'} *
                    </label>
                    <input type="text" name="name" required placeholder="${isZh ? '例如：Chef Pierre (行政总厨)' : 'e.g. Executive Chef Pierre'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '商务电子邮箱' : 'Corporate Email Address'} *
                    </label>
                    <input type="email" name="email" required placeholder="chef@restaurant.com" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '公司名称 / 餐厅品牌' : 'Company Name / Brand'}
                    </label>
                    <input type="text" name="company" placeholder="${isZh ? '例如：Grand Palace Hotel' : 'e.g. Grand Palace Hotel'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${esc(ui.product)} (${esc(ui.optional)})
                    </label>
                    <select name="productId" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                      <option value="">${isZh ? '— 选择咨询的产品（可选） —' : '— Select Product of Interest (Optional) —'}</option>
                      ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                    ${isZh ? '详细采购清单或规格要求' : 'Specifications & Required Quantities'} *
                  </label>
                  <textarea name="message" required rows="5" placeholder="${isZh ? '请描述您所需的餐厨款式、钢材材质偏好（如VG10大马士革、德国1.4116）、开刃角度要求、是否需要激光雕刻餐厅LOGO、外包装需求等...' : 'Describe requested models, steel alloys (VG10, German 1.4116), custom logo etching requirements, target delivery port, and required quantities...'}" style="width:100%;box-sizing:border-box;padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;resize:vertical;"></textarea>
                </div>

                <div>
                  <button type="submit" style="width:100%;padding:15px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '提交大宗采购询盘需求' : 'Submit Commercial RFQ & Inquire'} ↗
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="kitchen-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:60px 0 40px;color:${theme.textSub};font-size:0.88rem;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;font-family:${isVideo ? 'Georgia, serif' : 'system-ui, sans-serif'};">
              ${esc(brandName)}
            </div>
            <p style="font-size:0.86rem;color:${theme.textMuted};max-width:380px;line-height:1.6;margin:0 0 16px;">
              ${esc(sanitizeCopy(company.description, isVideo ? 'Fine bone china porcelain manufacture supplying premier luxury banquet hotel chains worldwide.' : 'Precision cutlery and heavy cookware forge supplying professional kitchens globally.', isVideo ? '专注于高端宴会骨瓷餐具与米其林餐厅定制器皿研发与制造。' : '专注于专业大马士革刀剪与重型锅具制造外贸，支持OEM/ODM全球直供。', isZh))}
            </p>
            <div style="font-size:0.8rem;color:${theme.textSub};">
              <strong>${isZh ? '权威国际认证' : 'Certifications'}:</strong> ${isVideo ? 'FDA Food Safe · LFGB · ISO9001 · 0% Lead & Cadmium' : 'NSF Commercial Food Equipment · LFGB · ISO9001 · 60 HRC'}
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '快捷导航' : 'Navigation'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.home)}</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.catalog)}</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.about)}</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.contact)}</a>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '业务接洽' : 'Business Liaison'}</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.85rem;">
              <div>${esc(company.email)}</div>
              ${company.phone ? `<div>${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div>${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;">
          <div>© ${new Date().getUTCFullYear()} ${esc(brandName)}. All rights reserved.</div>
          <div>${isZh ? '国际专业烹饪器具安全标准 · NSF / FDA / LFGB 认证' : 'NSF & LFGB Certified · International Food Contact Compliance'}</div>
        </div>
      </div>
    </footer>
  `;

  return `
    <div class="kitchen-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
