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
    if (!isVideo) {
      // Ceramic Artisan Exhibition Catalog
      mainHtml = `
        <main class="drinkware-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${theme.cardBorder};padding-bottom:24px;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">
                  Atelier Collection · Kiln Batch 2026-A
                </div>
                <h1 style="font-size:clamp(1.9rem, 3.5vw, 2.6rem);font-weight:900;color:${theme.text};margin:0;letter-spacing:-0.02em;">
                  Artisan Ceramic &amp; Stoneware Catalog
                </h1>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:6px 14px;border-radius:20px;background:${theme.primary};color:#fff;">All Studio Ware (${products.length})</span>
                <span style="padding:6px 14px;border-radius:20px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Stoneware Mugs</span>
                <span style="padding:6px 14px;border-radius:20px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Pour-Over Sets</span>
                <span style="padding:6px 14px;border-radius:20px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">High-Fire Porcelain</span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(180,83,9,0.04);transition:transform 0.2s ease;">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#fcfaf6;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:85%;height:85%;object-fit:contain;transition:transform 0.3s ease;">
                      <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;letter-spacing:0.04em;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">1280°C Fired</span>
                    </div>
                    <div style="padding:20px;">
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                      <h2 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h2>
                      <p style="font-size:0.82rem;color:${theme.textMuted};margin:0 0 14px;line-height:1.5;">${esc(p.desc)}</p>
                      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px dashed ${theme.cardBorder};padding-top:12px;font-size:0.78rem;">
                        <span style="color:${theme.textSub};font-weight:600;">MOQ: <strong style="color:${theme.text};">${esc(p.moq)}</strong></span>
                        <span style="color:${theme.primary};font-weight:800;">Request Studio Sample ↗</span>
                      </div>
                    </div>
                  </a>
                </article>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    } else {
      // Thermal Engineering Spec Catalog
      mainHtml = `
        <main class="drinkware-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 32px;margin-bottom:32px;box-shadow:0 4px 20px rgba(0,0,0,0.02);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
                  Thermal Telemetry Matrix · Active SKUs (${products.length})
                </div>
                <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);font-weight:900;color:${theme.text};margin:0;">
                  Engineered Thermal Drinkware Catalog
                </h1>
              </div>
              <div style="display:flex;gap:12px;align-items:center;font-size:0.8rem;color:${theme.textMuted};">
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Standard Liner:</strong> 18/8 &amp; 316 Medical
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Vacuum Spec:</strong> 0.001 Pa Tested
                </span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:24px;">
              ${products.map(p => `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(2,132,199,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.2;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                      <div style="position:absolute;top:10px;left:10px;display:flex;gap:6px;">
                        <span style="background:${theme.primary};color:#fff;font-size:0.68rem;font-weight:800;padding:2px 6px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="position:absolute;bottom:8px;left:10px;right:10px;display:flex;justify-content:space-between;background:rgba(255,255,255,0.9);backdrop-filter:blur(4px);padding:4px 8px;border-radius:6px;font-size:0.68rem;font-weight:700;color:${theme.primary};">
                        <span>24H HOT: 58°C+</span>
                        <span>48H COLD: 8°C-</span>
                      </div>
                    </div>
                    <div style="padding:18px;">
                      <div style="font-size:0.7rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                      <h2 style="font-size:1rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h2>
                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;margin-bottom:14px;font-size:0.75rem;color:${theme.textMuted};">
                        <div><strong>Material:</strong> ${esc(p.material.slice(0, 20))}...</div>
                        <div><strong>MOQ:</strong> <span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                        <div><strong>Dimensions:</strong> ${esc(p.dimensions.slice(0, 16))}</div>
                        <div><strong>Grade:</strong> Surgical Liner</div>
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;font-weight:700;color:${theme.primary};">
                        <span>Inspect Telemetry &amp; CAD Data</span>
                        <span>↗</span>
                      </div>
                    </div>
                  </a>
                </article>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'detail') {
    const p = products.find(item => item.id === ctx.options.productId) || heroProduct;
    if (!isVideo) {
      // Ceramic Artisan Detail Page
      mainHtml = `
        <main class="drinkware-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Ceramic Exhibition Archive
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(300px, 1fr) minmax(340px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;position:relative;box-shadow:0 12px 32px rgba(180,83,9,0.05);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;">
                    1280°C Vitrified Clay
                  </div>
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">1280°C</div>
                    <div style="color:${theme.textSub};">Kiln Vitrification</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">0% Lead</div>
                    <div style="color:${theme.textSub};">FDA / LFGB Safe</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">Studio Minimum</div>
                  </div>
                </div>
              </div>

              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Hand-Thrown Studio Model
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;margin-bottom:28px;">
                  <h3 style="font-size:0.9rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Ceramic &amp; Material Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.85rem;">
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Clay Composition</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Vessel Dimensions &amp; Vol</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Glaze Certification</span>
                      <strong style="color:${theme.text};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Studio Export MOQ</span>
                      <strong style="color:${theme.primary};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <div style="background:#fff9f0;border:1px solid #fde68a;border-radius:16px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:#92400e;margin:0 0 6px;">Bespoke Glaze &amp; Custom Bottom Stamp</h4>
                  <p style="font-size:0.82rem;color:#78350f;margin:0;line-height:1.6;">
                    We support private retail brands with custom reactive glaze development, laser-engraved raw stoneware foot stamps, and FSC wood gift box packaging.
                  </p>
                </div>

                <div style="display:flex;gap:16px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:15px 34px;border-radius:12px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Request Studio Sample &amp; Pricing ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 26px;border-radius:12px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                    Download Glaze Catalog
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // Thermal Vacuum Spec Detail Page
      mainHtml = `
        <main class="drinkware-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Thermal Engineering Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:32px;box-shadow:0 8px 30px rgba(2,132,199,0.05);position:relative;">
                  <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:800;margin-bottom:12px;">
                    <span>CALIBRATED: 0.001 Pa VACUUM</span>
                    <span>360° INSPECTION</span>
                  </div>
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:440px;object-fit:contain;display:block;" fetchpriority="high">
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:20px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:50px;height:50px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <div style="margin-top:20px;background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;">
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:10px;">
                    24-Hour Thermal Retention Degradation Curve
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;text-align:center;font-size:0.75rem;">
                    <div style="background:${theme.bg};padding:8px 4px;border-radius:6px;">
                      <div style="font-weight:900;color:${theme.text};">98°C</div>
                      <div style="color:${theme.textSub};">0h Initial</div>
                    </div>
                    <div style="background:${theme.bg};padding:8px 4px;border-radius:6px;">
                      <div style="font-weight:900;color:${theme.text};">84°C</div>
                      <div style="color:${theme.textSub};">6h Bench</div>
                    </div>
                    <div style="background:${theme.bg};padding:8px 4px;border-radius:6px;">
                      <div style="font-weight:900;color:${theme.text};">72°C</div>
                      <div style="color:${theme.textSub};">12h Field</div>
                    </div>
                    <div style="background:${theme.bg};padding:8px 4px;border-radius:6px;">
                      <div style="font-weight:900;color:${theme.primary};">58°C</div>
                      <div style="color:${theme.textSub};">24h Limit</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · ${esc(p.badge)}
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.02rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:22px;margin-bottom:24px;">
                  <h3 style="font-size:0.88rem;font-weight:800;text-transform:uppercase;color:${theme.primary};margin:0 0 16px;">
                    5-Layer Thermal Barrier Architecture
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.82rem;color:${theme.textMuted};">
                    <div><strong>Alloy Liner:</strong><br>${esc(p.material)}</div>
                    <div><strong>Form Factor:</strong><br>${esc(p.dimensions)}</div>
                    <div><strong>Barrier Core:</strong><br>0.001 Pa Vacuum + Cu Shield</div>
                    <div><strong>Batch MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                  </div>
                </div>

                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-bottom:28px;">
                  <h4 style="font-size:0.82rem;font-weight:800;color:#166534;margin:0 0 4px;">Bulk Export &amp; Custom Branding Options</h4>
                  <p style="font-size:0.8rem;color:#15803d;margin:0;line-height:1.5;">
                    Supported OEM finishes: Electrostatic matte powder coating, 360° laser rotary engraving, Tritan leakproof cap variants, and retail color master boxes.
                  </p>
                </div>

                <div style="display:flex;gap:16px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:15px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 18px ${theme.accentGlow};">
                    Submit Thermal RFQ &amp; Sample Request ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 24px;border-radius:10px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Download Test Dossier
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? `${company.name} · Precision Thermal Testing Lab` : `${company.name} · Master Ceramic Atelier`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, isVideo ? [
      { value: company.establishedYear || '2017', num: 2017, label: 'Established', desc: 'Cryogenic lab operation' },
      { value: '0.001 Pa', num: 1, label: 'Vacuum Seal', desc: 'Helium spectrometer pass' },
      { value: '18/8 & 316', num: 316, label: 'Alloy Purity', desc: 'Surgical food contact' },
      { value: '48h Hot/Cold', num: 48, label: 'Thermal Retention', desc: 'Dual-wall copper barrier' },
    ] : [
      { value: company.establishedYear || '2014', num: 2014, label: 'Atelier Est.', desc: 'Continuous kiln heritage' },
      { value: '1280°C', num: 1280, label: 'Kiln Temp', desc: 'High-fire vitrification' },
      { value: '100% Lead-Free', num: 100, label: 'Food-Safe', desc: 'FDA & LFGB compliant' },
      { value: '45+ Countries', num: 45, label: 'Global Retailers', desc: 'Direct export shipments' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    if (!isVideo) {
      // Ceramic Artisan About
      mainHtml = `
        <main class="drinkware-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:50px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                  ${esc(ui.about)} · Ceramic Atelier Heritage
                </div>
                <h1 style="font-size:clamp(2rem, 4vw, 2.9rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 18px;">
                  ${esc(headline)}
                </h1>
                ${storyParagraphs.map(p => `<p style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 16px;">${esc(p)}</p>`).join('')}
              </div>
              <div style="border-radius:20px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(180,83,9,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:400px;object-fit:cover;display:block;" loading="lazy">
              </div>
            </div>

            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;margin-bottom:50px;">
              <h2 style="font-size:1.25rem;font-weight:900;color:${theme.text};margin:0 0 24px;text-align:center;">Four-Stage Kiln Process &amp; Firing Profile</h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.3rem;margin-bottom:4px;">01. Clay Selection</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">Single-origin feldspathic stoneware clay with zero heavy metal contaminants.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.3rem;margin-bottom:4px;">02. Kick-Wheel Throw</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">Master artisan shaping for balanced thermal mass and ergonomic vessel lip.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.3rem;margin-bottom:4px;">03. Bisque &amp; Glaze</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">800°C primary firing followed by mineral-rich natural ash dip.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.3rem;margin-bottom:4px;">04. 1280°C Kiln Fire</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">High-fire vitrification eliminating porosity for lifetime durability.</p>
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:20px;margin-bottom:60px;">
              ${highlights.map(h => `
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:24px;text-align:center;">
                  <div style="font-size:1.9rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:4px 0 2px;">${esc(h.label)}</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc)}</div>
                </div>
              `).join('')}
            </div>

            <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Collaborate on Custom Ceramic Assortments</h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};margin:0 0 20px;max-width:560px;margin-left:auto;margin-right:auto;">Direct atelier export pricing, specialized glaze formulation, and global palletized logistics.</p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                Inquire With Studio Team ↗
              </a>
            </div>
          </section>
        </main>
      `;
    } else {
      // Thermal Laboratory About
      mainHtml = `
        <main class="drinkware-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:50px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                  ${esc(ui.about)} · Thermal Engineering Facility
                </div>
                <h1 style="font-size:clamp(2rem, 4vw, 2.9rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 18px;">
                  ${esc(headline)}
                </h1>
                ${storyParagraphs.map(p => `<p style="font-size:1.02rem;line-height:1.75;color:${theme.textMuted};margin:0 0 16px;">${esc(p)}</p>`).join('')}
              </div>
              <div style="border-radius:20px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(2,132,199,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:400px;object-fit:cover;display:block;" loading="lazy">
              </div>
            </div>

            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;margin-bottom:50px;">
              <h2 style="font-size:1.25rem;font-weight:900;color:${theme.text};margin:0 0 20px;text-align:center;">Thermal Testing Rig &amp; Certification Standards</h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;margin-bottom:6px;">Helium Mass Spectrometry</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;">Every batch is verified through automated 0.001 Pa vacuum chambers to eliminate thermal leakage.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;margin-bottom:6px;">Drop Shock Integrity</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;">2-meter angled drop impact test on concrete to ensure vacuum wall structural integrity.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;margin-bottom:6px;">FDA / LFGB / Prop 65</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;">Full chemical migration safety testing on inner liners, silicone seals, and Tritan lids.</p>
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:20px;margin-bottom:60px;">
              ${highlights.map(h => `
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:24px;text-align:center;">
                  <div style="font-size:1.9rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:4px 0 2px;">${esc(h.label)}</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc)}</div>
                </div>
              `).join('')}
            </div>

            <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Engineering &amp; OEM Contract Manufacturing</h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};margin:0 0 20px;max-width:560px;margin-left:auto;margin-right:auto;">Volume procurement, rapid 3D prototyping, and turnkey factory-direct export operations.</p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                Initiate Engineering RFQ ↗
              </a>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'contact') {
    if (!isVideo) {
      // Ceramic Studio Inquiry
      mainHtml = `
        <main class="drinkware-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section class="wrap" style="padding:40px 24px 80px;">
            <header style="text-align:center;max-width:640px;margin:0 auto 48px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
                ${esc(ui.contact)} · Ceramic Sourcing Desk
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 12px;">Request Studio Samples &amp; Glaze Consultation</h1>
              <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Connect directly with our master ceramicists for custom batch inquiries, private backstamps, and international freight quotes.</p>
            </header>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(180,83,9,0.04);">
                <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Ceramic Order Quotation</h2>
                <form id="inquiry" action="${esc(ctx.options.inquiryUrl)}" method="post" style="display:grid;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Select Ceramic Vessel</label>
                    <select name="productId" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                      <option value="">— Choose a Ceramic Product —</option>
                      ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)} (${esc(p.categoryNameEn)})</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Batch Quantity</label>
                      <input type="text" name="quantity" placeholder="e.g. 300 Sets" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Custom Glaze / Stamp</label>
                      <input type="text" name="customization" placeholder="Reactive glaze / Bottom logo" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Business Email</label>
                    <input type="email" name="email" placeholder="purchasing@company.com" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Specific Requirements / Packaging</label>
                    <textarea name="message" rows="4" placeholder="Mention drop-test packaging requirements, retail wooden crates, or target delivery port..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                  </div>
                  <button type="submit" style="padding:14px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    Submit Studio RFQ ↗
                  </button>
                </form>
              </div>

              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Ceramic Export Dispatch Desk</h2>
                  <p style="font-size:0.92rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                    We handle international palletized crating, moisture-barrier wrapping, and food-grade LFGB certification documentation for containerized sea shipments.
                  </p>
                  <div style="font-size:0.85rem;color:${theme.textMuted};line-height:2;">
                    <div><strong>Atelier Name:</strong> ${esc(company.name || brandName)}</div>
                    <div><strong>Inquiry Email:</strong> ${esc(company.email || 'export@ceramicatelier.com')}</div>
                    <div><strong>Kiln Location:</strong> ${esc(company.address || 'Artisan Ceramic Zone')}</div>
                    <div><strong>Lead Times:</strong> 7 Days for Samples · 30 Days for Production</div>
                  </div>
                </div>
                <div style="background:#fcfaf6;border:1px solid ${theme.cardBorder};border-radius:12px;padding:18px;font-size:0.8rem;color:${theme.primary};line-height:1.6;margin-top:24px;">
                  🏺 Studio Verification: Custom glaze swatches and pre-production physical samples ship internationally within 5 business days.
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // Thermal Engineering Inquiry
      mainHtml = `
        <main class="drinkware-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section class="wrap" style="padding:40px 24px 80px;">
            <header style="text-align:center;max-width:640px;margin:0 auto 48px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
                ${esc(ui.contact)} · Thermal Procurement Telemetry
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 12px;">Submit Engineering RFQ &amp; Volume Pricing</h1>
              <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Receive factory-direct FOB unit costs, mold tooling schedules, and laboratory temperature validation within 24 hours.</p>
            </header>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:36px;box-shadow:0 8px 30px rgba(2,132,199,0.04);">
                <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 20px;">B2B Specification Request</h2>
                <form id="inquiry" action="${esc(ctx.options.inquiryUrl)}" method="post" style="display:grid;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Thermal SKU / Hardware Platform</label>
                    <select name="productId" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                      <option value="">— Select Target Hardware SKU —</option>
                      ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)} (${esc(p.categoryNameEn)})</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Order Volume</label>
                      <input type="text" name="quantity" placeholder="e.g. 2,000 Units" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Branding / Powder Coat</label>
                      <input type="text" name="customization" placeholder="Pantone color / Laser etch" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" placeholder="procurement@brand.com" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Thermal Specs &amp; Logistics Port</label>
                    <textarea name="message" rows="4" placeholder="Specify liner requirements (SUS304 vs SUS316), lid mechanism, destination port (FOB/DDP)..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                  </div>
                  <button type="submit" style="padding:14px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    Submit Thermal Procurement RFQ ↗
                  </button>
                </form>
              </div>

              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:36px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Thermal Engineering Hub</h2>
                  <p style="font-size:0.92rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                    Automated manufacturing with robotic laser welding, vacuum annealing, and computerized drop testing rigs.
                  </p>
                  <div style="font-size:0.85rem;color:${theme.textMuted};line-height:2;">
                    <div><strong>Enterprise:</strong> ${esc(company.name || brandName)}</div>
                    <div><strong>Lab Contact:</strong> ${esc(company.email || 'thermal-rfq@sourcingspec.com')}</div>
                    <div><strong>Engineering Facility:</strong> ${esc(company.address || 'Cryogenic Manufacturing Park')}</div>
                    <div><strong>Testing Lead:</strong> 24 Hours for Quotation · 3 Days for Rapid Prototype</div>
                  </div>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:18px;font-size:0.8rem;color:${theme.primary};line-height:1.6;margin-top:24px;">
                  ⚡ Rapid Dispatch: Certified vacuum testing samples with factory calibration data dispatch within 48 hours.
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
    }
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
