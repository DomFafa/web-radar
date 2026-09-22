import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { getIndustryPlaceholder } from './industryPlaceholders';

export interface ThemedDrinkwareItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  material: string;
  dimensions: string;
  extra: string;
  moq: string;
  tagline: string;
  img: string;
}

export const DRINKWARE_DEFAULT_PRODUCTS: ThemedDrinkwareItem[] = [
  {
    id: 'dw-1',
    name: 'Artisan Kiln-Fired Stoneware Mug',
    desc: 'Hand-thrown on a traditional kick wheel with single-origin Shigaraki clay, wood-ash reactive glaze, and kiln-fired at 1280°C.',
    badge: 'Kiln Master',
    category: 'mug',
    categoryNameZh: '',
    categoryNameEn: 'Stoneware Mugs',
    material: 'Shigaraki Natural Clay, Feldspar Ash Glaze',
    dimensions: '95 × 85 × 110 mm · 380ml',
    extra: 'Food-Safe Lead-Free Glaze',
    moq: '200 Pcs',
    tagline: '1280°C Wood-Fired Kiln Craft',
    img: getIndustryPlaceholder('drinkware', 0),
  },
  {
    id: 'dw-2',
    name: 'Bone China Pour-Over Dripper Set',
    desc: 'Ultra-thin bone china dripper with precision-cut V60 spiral ribs, matching server, and heat-resistant borosilicate glass carafe.',
    badge: 'Barista Grade',
    category: 'pourover',
    categoryNameZh: '',
    categoryNameEn: 'Pour-Over Sets',
    material: 'Bone China + Borosilicate 3.3 Glass',
    dimensions: '125 × 125 × 140 mm · 600ml',
    extra: 'Spiral Rib Extraction',
    moq: '150 Sets',
    tagline: 'Precision Spiral Rib Extraction',
    img: getIndustryPlaceholder('drinkware', 1),
  },
  {
    id: 'dw-3',
    name: 'Double-Wall Vacuum Insulated Tumbler',
    desc: '18/8 surgical stainless steel with copper-plated vacuum barrier, BPA-free Tritan lid, and condensation-proof exterior.',
    badge: 'Thermal Pro',
    category: 'tumbler',
    categoryNameZh: '',
    categoryNameEn: 'Insulated Tumblers',
    material: '304 (18/8) Stainless Steel, Copper Plating',
    dimensions: '75 × 75 × 220 mm · 590ml',
    extra: '24H Hot / 48H Cold',
    moq: '500 Pcs',
    tagline: 'Copper-Barrier Vacuum Insulation',
    img: getIndustryPlaceholder('drinkware', 2),
  },
  {
    id: 'dw-4',
    name: 'Celadon Glaze Gongfu Tea Set',
    desc: 'Traditional celadon jade-green crackle glaze gaiwan with six matching cups, bamboo tea tray, and cotton carrying case.',
    badge: 'Heritage Celadon',
    category: 'teaset',
    categoryNameZh: '',
    categoryNameEn: 'Gongfu Tea Sets',
    material: 'Longquan Celadon Porcelain',
    dimensions: 'Gaiwan 100ml · Cups 45ml × 6',
    extra: 'Ice-Crackle Jade Finish',
    moq: '100 Sets',
    tagline: 'Longquan Ice-Crackle Jade Glaze',
    img: getIndustryPlaceholder('drinkware', 3),
  },
  {
    id: 'dw-5',
    name: 'Borosilicate Cold Brew Coffee Carafe',
    desc: 'Laboratory-grade borosilicate glass with fine-mesh stainless steel cold-brew filter, silicone seal lid, and calibrated volume markings.',
    badge: 'Lab Grade',
    category: 'carafe',
    categoryNameZh: '',
    categoryNameEn: 'Cold Brew Carafes',
    material: 'Schott Borosilicate Glass 3.3',
    dimensions: '100 × 100 × 280 mm · 1000ml',
    extra: 'Thermal Shock Resistant',
    moq: '300 Pcs',
    tagline: 'Thermal-Shock Lab Glass',
    img: getIndustryPlaceholder('drinkware', 4),
  },
  {
    id: 'dw-6',
    name: 'Matte Ceramic Travel Tumbler',
    desc: 'Insulated ceramic travel tumbler with silicone grip sleeve, leak-proof magnetic flip lid, and car cup holder compatible base.',
    badge: 'Commuter Pro',
    category: 'travel',
    categoryNameZh: '',
    categoryNameEn: 'Travel Tumblers',
    material: 'High-Fired Stoneware, Food-Grade Silicone',
    dimensions: '82 × 82 × 175 mm · 450ml',
    extra: 'Zero Flavor Retention',
    moq: '300 Pcs',
    tagline: 'Ceramic Purity On The Move',
    img: getIndustryPlaceholder('drinkware', 5),
  },
  {
    id: 'dw-7',
    name: 'Titanium Ultralight Camping Mug',
    desc: 'Grade 1 pure titanium single-wall backpacking mug with folding handles, measuring marks, and ultralight mesh storage sack.',
    badge: 'Ultralight Ti',
    category: 'titanium',
    categoryNameZh: '',
    categoryNameEn: 'Titanium Mugs',
    material: 'Grade 1 Pure Titanium (99.8%)',
    dimensions: '80 × 80 × 90 mm · 450ml',
    extra: 'Ultralight 68g Net Weight',
    moq: '200 Pcs',
    tagline: 'Ultralight Pure Titanium',
    img: getIndustryPlaceholder('drinkware', 6),
  },
  {
    id: 'dw-8',
    name: 'Minimalist Porcelain Espresso Cup Set',
    desc: 'Stackable thick-wall porcelain espresso cups with matching saucers, designed for optimal thermal retention and crema preservation.',
    badge: 'Barista Essential',
    category: 'espresso',
    categoryNameZh: '',
    categoryNameEn: 'Espresso Cups',
    material: 'Hard-Paste European Porcelain',
    dimensions: '60 × 60 × 55 mm · 80ml × 4',
    extra: 'Crema-Enhancing Egg Shape',
    moq: '500 Sets',
    tagline: 'European Hard-Paste Porcelain',
    img: getIndustryPlaceholder('drinkware', 7),
  },
];

function getDrinkwareProducts(ctx: ThemeContext): ThemedDrinkwareItem[] {
  const isTyped = isTypedMaterialsSource(ctx.draft);
  if (isTyped) {
    return ctx.draft.products.map((p, i) => {
      const def = DRINKWARE_DEFAULT_PRODUCTS[i % DRINKWARE_DEFAULT_PRODUCTS.length]!;
      return {
        id: p.id,
        name: p.name || def.name,
        desc: p.description || def.desc,
        badge: def.badge,
        category: def.category,
        categoryNameZh: '',
        categoryNameEn: def.categoryNameEn,
        material: p.material || def.material,
        dimensions: p.dimensions || def.dimensions,
        extra: def.extra,
        moq: def.moq,
        tagline: def.tagline,
        img: p.imageAssetId ? safeUrl(ctx.options.assetUrl(p.imageAssetId), ctx.options.preview) : def.img,
      };
    });
  }

  if (ctx.draft.products && ctx.draft.products.length > 0) {
    return ctx.draft.products.map((p, i) => {
      const def = DRINKWARE_DEFAULT_PRODUCTS[i % DRINKWARE_DEFAULT_PRODUCTS.length]!;
      const imgUrl = p.imageAssetId ? safeUrl(ctx.options.assetUrl(p.imageAssetId), ctx.options.preview) : def.img;
      return {
        id: p.id,
        name: p.name || def.name,
        desc: p.description || def.desc,
        badge: def.badge,
        category: def.category,
        categoryNameZh: '',
        categoryNameEn: def.categoryNameEn,
        material: p.material || def.material,
        dimensions: p.dimensions || def.dimensions,
        extra: def.extra,
        moq: def.moq,
        tagline: def.tagline,
        img: imgUrl,
      };
    });
  }

  return DRINKWARE_DEFAULT_PRODUCTS;
}

export function renderDrinkwarePage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getDrinkwareProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'ThermalTech Sourcing Lab' : 'Kiln & Clay Ceramic Atelier');
  const brandTagline = isVideo ? 'Precision Vacuum Engineering' : 'Handcrafted Stoneware & Porcelain';

  // Light palettes only - No dark mode
  const theme = isVideo
    ? {
      bg: '#f0f9ff',
      cardBg: '#ffffff',
      cardBorder: 'rgba(2,132,199,0.16)',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(240,249,255,0.92)',
      pillBg: '#e0f2fe',
      pillText: '#0369a1',
      btnGradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
      accentGlow: 'rgba(2,132,199,0.22)',
    }
    : {
      bg: '#fdfbf7',
      cardBg: '#ffffff',
      cardBorder: 'rgba(180,83,9,0.14)',
      primary: '#b45309',
      primaryHover: '#92400e',
      text: '#1c1917',
      textMuted: '#57534e',
      textSub: '#78716c',
      glassBg: 'rgba(253,251,247,0.92)',
      pillBg: '#fef3c7',
      pillText: '#92400e',
      btnGradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
      accentGlow: 'rgba(180,83,9,0.2)',
    };

  // Distinct Header for each variant
  const headerHtml = isVideo ? `
    <header class="drinkware-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.04);">
      <div style="background:#e0f2fe;padding:4px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${theme.primary};"></span>
          <span>LAB CALIBRATION: VACUUM TEST PASS (0.001 Pa)</span>
        </div>
        <div>24H HOT / 48H COLD GUARANTEED</div>
      </div>
      <div class="wrap" style="height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:36px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.15rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};">${esc(brandName)}</span>
            <span style="font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;color:${theme.primary};font-weight:700;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:24px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 18px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.84rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Thermal RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="drinkware-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.01em;">${esc(brandName)}</span>
            <span style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};font-weight:700;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:32px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Request Catalog ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // TECHNICAL HUD & LAB CONSOLE HERO FOR THERMAL FLASKS
      mainHtml = `
        <main class="drinkware-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Technical Hero Stage -->
          <section style="position:relative;padding:70px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:44px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Engineered Vacuum Metallurgy · Double-Wall 18/8
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Precision Thermal Insulation: 24H Hot, 48H Cold')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:600px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Surgical grade 304/316 stainless steel with copper-plated vacuum barrier layers, engineered for extreme thermal endurance.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore Flasks & Tumblers ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Download Technical Specs
                  </a>
                </div>
                <!-- Telemetry Matrix -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">0.001 Pa</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Vacuum Pressure</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">18/8 & 316</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Surgical Stainless Steel</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">48 Hours</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Cold Retention Test</div>
                  </div>
                </div>
              </div>

              <!-- Thermal Video / Screen Console -->
              <div style="position:relative;">
                <div style="border-radius:18px;overflow:hidden;background:${theme.cardBg};border:2px solid ${theme.cardBorder};box-shadow:0 20px 50px rgba(2,132,199,0.12);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:rgba(15,23,42,0.85);backdrop-filter:blur(10px);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;letter-spacing:0.06em;">
                    LIVE LAB DEMO
                  </div>
                </div>
                <div style="position:absolute;bottom:-18px;left:20px;right:20px;background:${theme.cardBg};border-radius:12px;padding:16px 20px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;box-shadow:0 12px 32px rgba(0,0,0,0.06);">
                  <div>
                    <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Copper Thermal Shield</div>
                    <div style="font-size:0.9rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                  </div>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">Specs ↗</a>
                </div>
              </div>
            </div>
          </section>

          <!-- Thermal Benchmark Comparison Matrix -->
          <section style="padding:70px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:44px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Engineering Superiority</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 0;">Thermal Benchmark vs Conventional Flasks</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Triple-Layer Shield</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Inner 304 liner + copper radiant reflective coating + outer 304 wall stops 99.7% of radiation heat loss.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Sweat-Free Exterior</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Zero condensation with ice drinks and zero exterior heating with boiling liquids. Powder-coat durable finish.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Food-Grade Sealing</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">BPA-free Eastman Tritan and LFGB/FDA silicone gaskets for 100% leakproof inverted transport.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Technical Catalog Grid -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Product Catalog</div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Vacuum Flasks & Drinkware</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${theme.primary};">View Full Lineup →</a>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.05;background:#f8fafc;position:relative;overflow:hidden;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:18px;">
                        <span style="position:absolute;top:12px;left:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="padding:20px;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <div style="font-size:0.8rem;color:${theme.textSub};margin-bottom:12px;">${esc(p.material)} · ${esc(p.dimensions)}</div>
                        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid ${theme.cardBorder};">
                          <span style="font-size:0.78rem;font-weight:700;color:${theme.textMuted};">MOQ: ${esc(p.moq)}</span>
                          <span style="font-size:0.8rem;font-weight:800;color:${theme.primary};">RFQ Details ↗</span>
                        </div>
                      </div>
                    </a>
                  </article>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // ASYMMETRIC CERAMIC ART GALLERY & EDITORIAL HERO
      mainHtml = `
        <main class="drinkware-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Asymmetric Editorial Hero -->
          <section style="position:relative;padding:90px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;">
                  ✦ Single-Origin Ceramic Pottery · Kiln Fired at 1280°C
                </div>
                <h1 style="font-family:Georgia,serif;font-size:clamp(2.4rem, 4.8vw, 3.8rem);font-weight:900;line-height:1.1;color:${theme.text};letter-spacing:-0.02em;margin:0 0 22px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Artisan Stoneware Pottery: Master Craft Meets Pure Form')}
                </h1>
                <p style="font-size:1.1rem;line-height:1.8;color:${theme.textMuted};margin:0 0 34px;max-width:540px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Hand-thrown on traditional kick wheels with natural Shigaraki clay and reactive wood-ash glazes for heirloom-grade tableware.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:40px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 36px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 24px ${theme.accentGlow};">
                    Explore Ceramic Collection ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:16px 30px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    Kiln Craftsmanship
                  </a>
                </div>
                <div style="display:flex;gap:32px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-family:Georgia,serif;font-size:1.8rem;font-weight:900;color:${theme.primary};">1280°C</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;text-transform:uppercase;">Wood-Fired Vitrification</div>
                  </div>
                  <div>
                    <div style="font-family:Georgia,serif;font-size:1.8rem;font-weight:900;color:${theme.primary};">100%</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;text-transform:uppercase;">Hand-Thrown Ceramics</div>
                  </div>
                  <div>
                    <div style="font-family:Georgia,serif;font-size:1.8rem;font-weight:900;color:${theme.primary};">Lead-Free</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;text-transform:uppercase;">Natural Mineral Glaze</div>
                  </div>
                </div>
              </div>

              <!-- Arch Shaped Feature Showcase -->
              <div style="position:relative;display:flex;justify-content:center;">
                <div style="width:100%;max-width:480px;aspect-ratio:3/4;border-radius:200px 200px 24px 24px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(180,83,9,0.1);padding:16px;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:184px 184px 16px 16px;" fetchpriority="high">
                </div>
                <div style="position:absolute;bottom:20px;left:20px;background:${theme.glassBg};backdrop-filter:blur(16px);border:1px solid ${theme.cardBorder};border-radius:16px;padding:14px 20px;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Artisan Selection</div>
                  <div style="font-family:Georgia,serif;font-size:0.95rem;font-weight:700;color:${theme.text};">${esc(heroProduct.name)}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Craftsmanship Heritage Process -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:640px;margin:0 auto 50px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Four-Stage Pottery Heritage</span>
                <h2 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">From Single-Origin Clay to Heirloom Tableware</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
                <div style="padding:28px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.6rem;color:${theme.primary};margin-bottom:10px;">01. Sourcing</div>
                  <h3 style="font-size:0.95rem;font-weight:800;margin:0 0 8px;">Single-Origin Clay</h3>
                  <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0;">Naturally weathered Shigaraki clay with rich mineral iron content.</p>
                </div>
                <div style="padding:28px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.6rem;color:${theme.primary};margin-bottom:10px;">02. Shaping</div>
                  <h3 style="font-size:0.95rem;font-weight:800;margin:0 0 8px;">Kick-Wheel Wheelwork</h3>
                  <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0;">Every vessel thrown individually by master potters for tactile harmony.</p>
                </div>
                <div style="padding:28px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.6rem;color:${theme.primary};margin-bottom:10px;">03. Glazing</div>
                  <h3 style="font-size:0.95rem;font-weight:800;margin:0 0 8px;">Wood-Ash Minerals</h3>
                  <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0;">Custom feldspar and organic reactive glazes produce unique kiln-flower patterns.</p>
                </div>
                <div style="padding:28px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.6rem;color:${theme.primary};margin-bottom:10px;">04. Firing</div>
                  <h3 style="font-size:0.95rem;font-weight:800;margin:0 0 8px;">1280°C Vitrification</h3>
                  <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0;">72-hour reduction kiln cycle achieves complete stone vitrification.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Art Gallery Product Showcase -->
          <section style="padding:90px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:48px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;">Exhibition Lineup</div>
                  <h2 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Tableware & Artisan Drinkware</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${theme.primary};">All Works (RFQ) →</a>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(180,83,9,0.04);transition:transform 0.3s;">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1;background:${theme.bg};position:relative;overflow:hidden;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;padding:20px;">
                        <span style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,0.9);color:${theme.primary};font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:999px;border:1px solid ${theme.cardBorder};">${esc(p.badge)}</span>
                      </div>
                      <div style="padding:22px;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-family:Georgia,serif;font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid ${theme.cardBorder};">
                          <span style="font-size:0.78rem;color:${theme.textSub};">MOQ: ${esc(p.moq)}</span>
                          <span style="font-size:0.82rem;font-weight:800;color:${theme.primary};">Inspect Piece ↗</span>
                        </div>
                      </div>
                    </a>
                  </article>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    mainHtml = `
      <main class="drinkware-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.catalog)} · Complete Export Assortment
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">
              ${isVideo ? 'Engineered Thermal Drinkware Catalog' : 'Artisan Ceramic & Stoneware Catalog'}
            </h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory export pricing, custom branding, and sample requests available on all SKUs.</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
            ${products.map(p => `
              <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                  <div style="aspect-ratio:1;background:#f8fafc;position:relative;">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:16px;">
                    <span style="position:absolute;top:10px;left:10px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                  </div>
                  <div style="padding:18px;">
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h2 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 6px;line-height:1.3;">${esc(p.name)}</h2>
                    <p style="font-size:0.8rem;color:${theme.textMuted};margin:0 0 10px;line-height:1.5;">${esc(p.desc)}</p>
                    <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">View Specifications & MOQ ↗</div>
                  </div>
                </a>
              </article>
            `).join('')}
          </div>
        </div>
      </main>
    `;
  } else if (page === 'detail') {
    const p = products.find(item => item.id === ctx.options.productId) || heroProduct;
    mainHtml = `
      <main class="drinkware-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:24px;">
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${theme.primary};">← Back to Catalog</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:30px;position:relative;">
              <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:420px;object-fit:contain;display:block;" fetchpriority="high">
              <div class="wr-detail-thumbs" style="display:flex;gap:12px;margin-top:20px;">
                <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:50px;height:50px;object-fit:cover;">
                </button>
              </div>
            </div>
            <div>
              <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${esc(p.categoryNameEn)} · ${esc(p.badge)}</div>
              <h1 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">${esc(p.name)}</h1>
              <p style="font-size:1.02rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">${esc(p.desc)}</p>
              
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                <h3 style="font-size:0.88rem;font-weight:800;text-transform:uppercase;color:${theme.text};margin:0 0 14px;">Technical Specifications</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.85rem;color:${theme.textMuted};">
                  <div><strong>Material:</strong><br>${esc(p.material)}</div>
                  <div><strong>Dimensions:</strong><br>${esc(p.dimensions)}</div>
                  <div><strong>Feature:</strong><br>${esc(p.extra)}</div>
                  <div><strong>MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                </div>
              </div>

              <div style="display:flex;gap:14px;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                  Request Sample & Pricing ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:10px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                  OEM Branding Options
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, `${company.name} · Export Manufacturing Excellence`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2016', num: 2016, label: 'Established', desc: 'Continuous operation' },
      { value: '1280°C', num: 1280, label: 'Kiln Temp', desc: 'Vitrification firing' },
      { value: '100%', num: 100, label: 'Food-Safe', desc: 'FDA & LFGB compliant' },
      { value: '50+ Countries', num: 50, label: 'Global Reach', desc: 'Overseas shipments' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="drinkware-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                ${esc(ui.about)} · Quality Credentials
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;">
                ${esc(headline)}
              </h1>
              ${storyParagraphs.map(p => `<p style="font-size:1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(0,0,0,0.06);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:20px;margin-bottom:60px;">
            ${highlights.map(h => `
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;text-align:center;">
                <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                <div style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:4px 0 2px;">${esc(h.label)}</div>
                <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc)}</div>
              </div>
            `).join('')}
          </div>

          <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:36px;">
            <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Partner With Our Sourcing Team</h2>
            <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 20px;">Contact our B2B team for wholesale volume pricing, OEM custom packaging, and sample verification.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:12px 28px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.9rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
              Initiate RFQ ↗
            </a>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'contact') {
    mainHtml = `
      <main class="drinkware-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <header style="text-align:center;max-width:620px;margin:0 auto 48px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.contact)} · Direct Factory RFQ
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">Submit Your Sourcing Inquiry</h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory response within 24 hours with FOB pricing, MOQ tiers, and sample lead times.</p>
          </header>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
              <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Request For Quotation</h2>
              <form style="display:grid;gap:16px;">
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Product of Interest</label>
                  <select name="productId" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    <option value="">— Select Product (Optional) —</option>
                    ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Quantity</label>
                    <input type="text" disabled placeholder="e.g. 500 Pcs" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Custom Logo / OEM</label>
                    <input type="text" disabled placeholder="Laser / Silk / Decal" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                </div>
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Message / Specifications</label>
                  <textarea disabled rows="4" placeholder="Detail your packaging, destination port, or specific testing requirements..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                </div>
                <button type="submit" disabled style="padding:14px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 14px ${theme.accentGlow};">
                  Submit Sourcing Inquiry ↗
                </button>
              </form>
            </div>

            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Export Sourcing Office</h2>
                <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.7;margin:0 0 20px;">
                  Our export desk provides complete turnkey support including sample air shipment, drop testing reports, and FOB/DDP logistics support.
                </p>
                <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.8;">
                  <div><strong>Company:</strong> ${esc(company.name || brandName)}</div>
                  <div><strong>Email:</strong> ${esc(company.email || 'export@drinkwaresourcing.com')}</div>
                  <div><strong>Factory Location:</strong> ${esc(company.address || 'Industrial Manufacturing Zone')}</div>
                  <div><strong>Inspection Standards:</strong> AQL 2.5 General Inspection</div>
                </div>
              </div>
              <div style="padding:16px;background:${theme.bg};border-radius:10px;font-size:0.78rem;color:${theme.textSub};line-height:1.5;margin-top:24px;">
                ⚡ Fast Sample Dispatch: Verified inventory samples dispatch within 48 hours via DHL/FedEx.
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="drinkware-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;color:${theme.textSub};font-size:0.84rem;">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:32px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.05rem;font-weight:900;color:${theme.text};margin-bottom:10px;">${esc(brandName)}</div>
          <div style="line-height:1.6;max-width:280px;">${esc(brandTagline)}</div>
        </div>
        <div>
          <div style="font-weight:800;color:${theme.text};margin-bottom:12px;text-transform:uppercase;font-size:0.75rem;">Navigation</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textSub};">${esc(ui.home)}</a>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textSub};">${esc(ui.catalog)}</a>
            <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textSub};">${esc(ui.about)}</a>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textSub};">${esc(ui.contact)}</a>
          </div>
        </div>
        <div>
          <div style="font-weight:800;color:${theme.text};margin-bottom:12px;text-transform:uppercase;font-size:0.75rem;">Quality Guarantees</div>
          <div style="line-height:1.7;">
            <div>✓ FDA & LFGB Compliant</div>
            <div>✓ AQL 2.5 Quality Inspection</div>
            <div>✓ Drop Test & Thermal Certified</div>
          </div>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;align-items:center;justify-content:space-between;font-size:0.78rem;">
        <div>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved. B2B Export Portal.</div>
        <div style="display:flex;gap:16px;">
          <span>ISO 9001 Certified</span>
          <span>Lead-Free Tested</span>
        </div>
      </div>
    </footer>
  `;

  return `
    ${headerHtml}
    ${mainHtml}
    ${footerHtml}
  `;
}
