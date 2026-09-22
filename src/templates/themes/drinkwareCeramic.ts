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

  // Light palettes only - strictly no dark mode
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
      <div style="background:#e0f2fe;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;letter-spacing:0.04em;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${theme.primary};"></span>
          <span>LAB CALIBRATION: VACUUM 10⁻⁵ PA · CRYOGENIC HELIUM TEST PASS</span>
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
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.01em;">${esc(brandName)}</span>
              <span style="display:inline-block;padding:2px 6px;border-radius:3px;border:1px solid ${theme.primary};color:${theme.primary};font-size:0.62rem;font-weight:800;letter-spacing:0.06em;">KILN</span>
            </div>
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
      // 1. THERMAL LAB HUD & TELEMETRY CONSOLE HERO
      mainHtml = `
        <main class="drinkware-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Telemetry Command Center Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Cryogenic Vacuum Metallurgy · 18/8 & 316 Stainless
                </div>
                <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Precision Thermal Insulation: 24H Hot, 48H Cold')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Surgical grade 304 and 316 stainless steel with copper-plated vacuum barrier layers, engineered for extreme thermal endurance in any climate.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Parametric Catalog ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Download Technical Whitepaper
                  </a>
                </div>
                <!-- Realtime Lab Metrics Telemetry -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Vacuum Seal</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">10⁻⁵ Pa</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">High-vacuum furnace</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Hot Retention</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">> 68°C / 24H</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Tested from 98°C</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Cold Retention</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">< 8°C / 48H</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Tested from 0°C</div>
                  </div>
                </div>
              </div>

              <!-- 16:9 Central Telemetry Screen Monitor -->
              <div style="position:relative;">
                <div style="border-radius:16px;overflow:hidden;background:${theme.cardBg};border:2px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(2,132,199,0.14);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-family:monospace;font-weight:700;letter-spacing:0.05em;">
                    LIVE LAB SENSOR: OK
                  </div>
                  <div style="position:absolute;bottom:16px;right:16px;background:rgba(2,132,199,0.92);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;">
                    316 SURGICAL LINER
                  </div>
                </div>
                <div style="margin-top:14px;background:${theme.cardBg};border-radius:10px;padding:12px 18px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;">
                  <span style="font-weight:700;color:${theme.text};">MODEL: ${esc(heroProduct.name)}</span>
                  <span style="font-weight:800;color:${theme.primary};">${esc(heroProduct.moq)} MOQ</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 5-Layer Exploded Thermal Architecture Diagram -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Engineering Cross-Section</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  5-Layer Vacuum Thermal Shield Architecture
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Every vessel incorporates multi-stage isolation metallurgy designed to eliminate radiation, convection, and conduction heat transfer.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:16px;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">01</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Powder Coat</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Anti-scratch electrostatic textured exterior</p>
                </div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">02</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">18/8 Steel Wall</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Food-grade 304 outer structural casing</p>
                </div>
                <div style="background:${theme.cardBg};border:2px solid ${theme.primary};border-radius:12px;padding:22px 16px;text-align:center;box-shadow:0 8px 24px rgba(2,132,199,0.1);">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">03</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.primary};margin:0 0 6px;">Cryo Vacuum</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">10⁻⁵ Pa vacuum space prevents convective loss</p>
                </div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">04</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Copper Plating</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Reflective copper shield reflects infrared radiation</p>
                </div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">05</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">316 Core Liner</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Medical surgical interior with electrolytic polishing</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 24H Thermal Decay Telemetry Chart -->
          <section style="padding:70px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;">
              <div>
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Telemetry Benchmark</span>
                <h3 style="font-size:clamp(1.6rem, 2.5vw, 2.2rem);font-weight:900;color:${theme.text};margin:8px 0 14px;">
                  Laboratory Temperature Decay Curves
                </h3>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;margin-bottom:24px;">
                  Continuous telemetry tests conducted in 20°C ambient atmosphere with boiling water at 98°C and ice water at 0°C.
                </p>
                <div style="space-y:16px;">
                  <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;margin-bottom:6px;">
                      <span>ThermalTech 316 Double-Wall (24H)</span>
                      <strong style="color:${theme.primary};">68.5°C</strong>
                    </div>
                    <div style="height:10px;border-radius:5px;background:#e2e8f0;overflow:hidden;">
                      <div style="width:70%;height:100%;background:${theme.btnGradient};border-radius:5px;"></div>
                    </div>
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;margin-bottom:6px;">
                      <span>Industry Standard Vacuum Bottle (24H)</span>
                      <strong style="color:${theme.textSub};">48.2°C</strong>
                    </div>
                    <div style="height:10px;border-radius:5px;background:#e2e8f0;overflow:hidden;">
                      <div style="width:49%;height:100%;background:#94a3b8;border-radius:5px;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;margin-bottom:6px;">
                      <span>Single Wall Stainless Bottle (6H)</span>
                      <strong style="color:${theme.textSub};">24.0°C (Ambient)</strong>
                    </div>
                    <div style="height:10px;border-radius:5px;background:#e2e8f0;overflow:hidden;">
                      <div style="width:24%;height:100%;background:#cbd5e1;border-radius:5px;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Telemetry Curve Visualization Box -->
              <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                  <strong style="font-size:0.85rem;color:${theme.text};font-family:monospace;">HEAT DECAY CURVE (0 - 24 HOURS)</strong>
                  <span style="font-size:0.7rem;color:${theme.primary};font-weight:700;background:${theme.pillBg};padding:3px 8px;border-radius:4px;">CALIBRATED</span>
                </div>
                <svg viewBox="0 0 500 200" style="width:100%;height:auto;display:block;">
                  <line x1="40" y1="20" x2="40" y2="170" stroke="#cbd5e1" stroke-width="1.5" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" stroke-width="1.5" />
                  <text x="5" y="25" fill="#64748b" font-size="10" font-family="monospace">100°C</text>
                  <text x="12" y="95" fill="#64748b" font-size="10" font-family="monospace">50°C</text>
                  <text x="18" y="170" fill="#64748b" font-size="10" font-family="monospace">0°C</text>
                  <text x="40" y="188" fill="#64748b" font-size="10" font-family="monospace">0h</text>
                  <text x="140" y="188" fill="#64748b" font-size="10" font-family="monospace">6h</text>
                  <text x="250" y="188" fill="#64748b" font-size="10" font-family="monospace">12h</text>
                  <text x="360" y="188" fill="#64748b" font-size="10" font-family="monospace">18h</text>
                  <text x="460" y="188" fill="#64748b" font-size="10" font-family="monospace">24h</text>
                  <!-- Standard Bottle Curve -->
                  <path d="M 40 25 Q 140 100, 470 145" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4" />
                  <!-- ThermalTech Curve -->
                  <path d="M 40 25 Q 200 45, 470 78" fill="none" stroke="${theme.primary}" stroke-width="3.5" />
                  <circle cx="470" cy="78" r="5" fill="${theme.primary}" />
                  <text x="410" y="68" fill="${theme.primary}" font-weight="bold" font-size="11" font-family="monospace">68.5°C</text>
                </svg>
              </div>
            </div>
          </section>

          <!-- Parametric Products Showcase -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Certified Production Models</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Thermal Laboratory Fleet
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View Full Parametric Grid (${products.length}) →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.03);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                        <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;font-family:monospace;">${esc(p.badge)}</span>
                      </div>
                    </a>
                    <div style="padding:18px;">
                      <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                      <h3 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                      </h3>
                      <div style="font-size:0.8rem;color:${theme.textMuted};margin-bottom:14px;line-height:1.5;">${esc(p.dimensions)} · ${esc(p.material)}</div>
                      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid ${theme.cardBorder};font-size:0.78rem;">
                        <span style="font-weight:700;color:${theme.primary};">${esc(p.extra)}</span>
                        <span style="font-weight:800;color:${theme.text};">MOQ: ${esc(p.moq)}</span>
                      </div>
                    </div>
                  </article>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // 2. ARTISAN CERAMIC ATELIER EDITORIAL CANVAS HERO
      mainHtml = `
        <main class="drinkware-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Asymmetric Editorial Atelier Canvas Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  [ ATELIER HAND-CRAFTED · 1280°C KILN FIRED ]
                </div>
                <h1 style="font-family:Georgia,serif;font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.16;color:${theme.text};letter-spacing:-0.02em;margin:0 0 18px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Artisan Kiln-Fired Stoneware: Craft Meets Pure Mineral Glazes')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.75;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Hand-thrown on traditional kick wheels with single-origin natural clay, raw wood-ash reduction glazes, and days of sustained wood fire.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Exhibition Archive ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 26px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Our Mountain Kiln Story
                  </a>
                </div>
                <!-- Master Potter Craft Seal & Signature -->
                <div style="display:flex;align-items:center;gap:18px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="width:48px;height:48px;border-radius:50%;border:2px solid ${theme.primary};display:flex;align-items:center;justify-content:center;color:${theme.primary};font-weight:900;font-size:0.8rem;background:#fff;">
                    1280°
                  </div>
                  <div>
                    <div style="font-weight:800;font-size:0.9rem;color:${theme.text};">Single-Batch Reduction Firing</div>
                    <div style="font-size:0.78rem;color:${theme.textSub};">Lead-free, food-safe raw mineral glaze composition</div>
                  </div>
                </div>
              </div>

              <!-- Asymmetric Floating Studio Card -->
              <div style="position:relative;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;overflow:hidden;box-shadow:0 24px 50px rgba(180,83,9,0.08);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:20px;left:20px;background:rgba(253,251,247,0.92);backdrop-filter:blur(8px);padding:8px 16px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.04em;">ATELIER MASTERPIECE #01</span>
                  </div>
                  <div style="position:absolute;bottom:20px;right:20px;background:${theme.primary};color:#fff;padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:800;">
                    WOOD-ASH SHINO
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 4-Stage Kiln Craft Horizontal Process Timeline -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">The Ceramic Journey</span>
                <h2 style="font-family:Georgia,serif;font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Four Sacred Stages of Reduction Craft
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  From riverbed natural clay preparation to the intense transformation inside our climbing wood kiln.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">STAGE 01</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Clay Wedging</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Single-origin mountain clay aged for 90 days and hand-kneaded to expel all micro air bubbles.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">STAGE 02</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Kick-Wheel Forming</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Thrown manually on weighted wooden flywheels, preserving subtle hand throwing spiral ridges.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">STAGE 03</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Natural Ash Glaze</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Brushed with pine wood ash and pulverized feldspar minerals for rich tactile texture.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">STAGE 04</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;">1280°C Vitrification</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    72 hours of oxygen-reduced wood firing transforms clay into durable vitrified stoneware.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Curated Asymmetric Exhibition Plates -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Seasonal Kiln Release</span>
                  <h2 style="font-family:Georgia,serif;font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Featured Studio Pieces
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  Explore Full Archive (${products.length}) →
                </a>
              </div>

              <!-- Asymmetric 1-wide + 2-stacked layout -->
              <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:28px;">
                <!-- Wide Masterpiece Plate -->
                <article data-wr-product-id="${esc(heroProduct.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(180,83,9,0.06);display:flex;flex-direction:column;">
                  <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;flex:1;">
                    <div style="aspect-ratio:1.3;background:#fcfaf6;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                    </div>
                  </a>
                  <div style="padding:24px;">
                    <span style="font-size:0.75rem;color:${theme.primary};font-weight:800;letter-spacing:0.04em;">ATELIER MASTERPLATE #01</span>
                    <h3 style="font-family:Georgia,serif;font-size:1.35rem;font-weight:900;color:${theme.text};margin:6px 0 10px;">
                      <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;color:${theme.text};">${esc(heroProduct.name)}</a>
                    </h3>
                    <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin-bottom:18px;">${esc(heroProduct.desc)}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;padding-top:14px;border-top:1px solid ${theme.cardBorder};">
                      <span style="color:${theme.textSub};">${esc(heroProduct.material)}</span>
                      <strong style="color:${theme.primary};">MOQ: ${esc(heroProduct.moq)}</strong>
                    </div>
                  </div>
                </article>

                <!-- Stacked Side Plates -->
                <div style="display:flex;flex-direction:column;gap:24px;">
                  ${products.slice(1, 3).map((p, idx) => `
                    <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(180,83,9,0.04);display:grid;grid-template-columns:140px 1fr;align-items:center;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;height:100%;">
                        <div style="height:100%;min-height:140px;background:#fcfaf6;display:flex;align-items:center;justify-content:center;border-right:1px solid ${theme.cardBorder};">
                          <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                        </div>
                      </a>
                      <div style="padding:18px 20px;">
                        <span style="font-size:0.7rem;font-weight:800;color:${theme.primary};">STUDIO SELECTION #0${idx + 2}</span>
                        <h4 style="font-family:Georgia,serif;font-size:1.05rem;font-weight:900;color:${theme.text};margin:4px 0 6px;">
                          <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                        </h4>
                        <div style="font-size:0.78rem;color:${theme.textMuted};margin-bottom:8px;">${esc(p.dimensions)}</div>
                        <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};">${esc(p.moq)}</div>
                      </div>
                    </article>
                  `).join('')}
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    if (!isVideo) {
      // CERAMIC MUSEUM EXHIBITION ARCHIVE CATALOG
      mainHtml = `
        <main class="drinkware-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Atelier Collection Archive · Kiln Firing Batch
              </div>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.02em;">
                Handcrafted Ceramic Exhibition Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:999px;background:${theme.primary};color:#fff;">All Studio Vessels (${products.length})</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Wood-Ash Shino</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Longquan Celadon</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Tenmoku Iron</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Raw Bisque</span>
              </div>
            </div>

            <!-- Gallery Cards with Clay Origin, Temperature, and Studio Edition -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:32px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(180,83,9,0.05);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#fcfaf6;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:82%;height:82%;object-fit:contain;">
                      <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">1280°C Fired</span>
                    </div>
                  </a>
                  <div style="padding:22px;">
                    <span style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                    <h3 style="font-family:Georgia,serif;font-size:1.15rem;font-weight:900;color:${theme.text};margin:6px 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;margin-bottom:16px;">${esc(p.desc)}</p>
                    <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:8px;padding:10px 12px;font-size:0.78rem;margin-bottom:16px;">
                      <div style="color:${theme.text};font-weight:700;">${esc(p.material)}</div>
                      <div style="color:${theme.textSub};">${esc(p.dimensions)}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid ${theme.cardBorder};">
                      <span style="font-size:0.78rem;color:${theme.textSub};">MOQ: <strong style="color:${theme.primary};">${esc(p.moq)}</strong></span>
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.82rem;font-weight:800;color:${theme.primary};">
                        Vessel Dossier →
                      </a>
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    } else {
      // THERMAL HARDWARE PARAMETRIC SPEC CATALOG
      mainHtml = `
        <main class="drinkware-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:24px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Lab Certified Fleet · Parametric Specifications
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                Vacuum Insulated Hardware Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Thermal Capacities (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">350ml Compact</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">500ml Commuter</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">750ml Field Flask</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">1200ml Expedition Growler</span>
              </div>
            </div>

            <!-- Parametric Hardware Cards with Spec Matrix -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(2,132,199,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.1;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                      <span style="position:absolute;top:10px;left:10px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-family:monospace;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">VACUUM 10⁻⁵ PA</span>
                    </div>
                  </a>
                  <div style="padding:20px;">
                    <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};margin:0 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;font-size:0.75rem;margin-bottom:14px;">
                      <div>
                        <span style="color:${theme.textSub};display:block;">Steel Alloy:</span>
                        <strong style="color:${theme.text};">${esc(p.material)}</strong>
                      </div>
                      <div>
                        <span style="color:${theme.textSub};display:block;">Dimensions:</span>
                        <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                      </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid ${theme.cardBorder};font-size:0.78rem;">
                      <span style="color:${theme.primary};font-weight:800;">${esc(p.extra)}</span>
                      <strong style="color:${theme.text};">MOQ: ${esc(p.moq)}</strong>
                    </div>
                  </div>
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
      // CERAMIC ARTISAN DETAIL PAGE: FILMSTRIP + HANKO STAMP SELECTOR
      mainHtml = `
        <main class="drinkware-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Ceramic Exhibition Archive
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Vessel Portrait & Macro Filmstrip -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;position:relative;box-shadow:0 12px 32px rgba(180,83,9,0.05);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;">
                    1280°C Vitrified Clay
                  </div>
                  <!-- Thumbnails filmstrip container -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Kiln Craft Metrics -->
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

              <!-- Right Column: Atelier Specifications & Bottom Seal Selector -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Hand-Thrown Studio Model
                </div>
                <h1 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Ceramic Material Specifications Table -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;margin-bottom:28px;">
                  <h3 style="font-family:Georgia,serif;font-size:0.95rem;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
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

                <!-- Interactive Bottom Hanko Seal Selector -->
                <div style="background:#fff9f0;border:1px solid #fde68a;border-radius:16px;padding:22px;margin-bottom:28px;">
                  <h4 style="font-size:0.88rem;font-weight:800;color:#92400e;margin:0 0 8px;">Bespoke Glaze &amp; Custom Bottom Stamp</h4>
                  <p style="font-size:0.82rem;color:#78350f;margin:0 0 14px;line-height:1.6;">
                    Each piece can be stamped on the unglazed foot ring with your studio mark, private brand monogram, or master kiln chop.
                  </p>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <span style="padding:6px 14px;background:#fff;border:1px solid #d97706;color:#92400e;border-radius:6px;font-size:0.75rem;font-weight:700;">[ Studio Seal Mark ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #d97706;color:#92400e;border-radius:6px;font-size:0.75rem;font-weight:700;">[ Master Potter Hanko ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #d97706;color:#92400e;border-radius:6px;font-size:0.75rem;font-weight:700;">[ Custom Client Monogram ]</span>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Commission Studio Batch ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    View Other Vessels
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // THERMAL HARDWARE DETAIL PAGE: 24H SVG CURVE + EXPLODED LID SCHEMATIC + PALLET CALCULATOR
      mainHtml = `
        <main class="drinkware-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Vacuum Hardware Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Vessel Image & Gallery -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;position:relative;box-shadow:0 12px 32px rgba(2,132,199,0.06);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    VACUUM TEST: PASS
                  </div>
                  <!-- Thumbnails -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- 24H Decay SVG Telemetry Curve Graph -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.04em;">24H TEMPERATURE PROBE CURVE</span>
                    <span style="font-size:0.7rem;font-family:monospace;color:${theme.textSub};">ISO 20°C AMBIENT</span>
                  </div>
                  <svg viewBox="0 0 400 120" style="width:100%;height:auto;display:block;">
                    <line x1="30" y1="10" x2="30" y2="100" stroke="#cbd5e1" stroke-width="1" />
                    <line x1="30" y1="100" x2="380" y2="100" stroke="#cbd5e1" stroke-width="1" />
                    <text x="5" y="15" fill="#64748b" font-size="8">98°</text>
                    <text x="5" y="55" fill="#64748b" font-size="8">68°</text>
                    <text x="5" y="98" fill="#64748b" font-size="8">20°</text>
                    <path d="M 30 15 Q 180 35, 380 55" fill="none" stroke="${theme.primary}" stroke-width="2.5" />
                    <circle cx="380" cy="55" r="4" fill="${theme.primary}" />
                    <text x="330" y="48" fill="${theme.primary}" font-weight="bold" font-size="10">68.5°C</text>
                  </svg>
                </div>
              </div>

              <!-- Right Column: Technical Dossier & Shipping Pallet Calculator -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Commercial Model
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Technical Spec Grid -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;margin-bottom:24px;">
                  <h3 style="font-size:0.9rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Hardware Engineering Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Steel Grade</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Capacity &amp; Dimensions</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Thermal Retention</span>
                      <strong style="color:${theme.primary};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Production MOQ</span>
                      <strong style="color:${theme.text};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- Export Pallet Logistics Calculator -->
                <div style="background:#f8fafc;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:0 0 10px;">Export Shipping &amp; Pallet Logistics</h4>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:0.8rem;text-align:center;">
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Carton Pack</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">24 Pcs / Ctn</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Standard Pallet</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">48 Ctns (1,152 Pcs)</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">20GP Container</div>
                      <strong style="color:${theme.primary};font-size:0.95rem;">12,000 Pcs</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Submit Technical RFQ ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Explore All Hardware
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? 'Precision Thermal Engineering & Sourcing Facility' : 'Generations of Kiln Fire & Handcrafted Heritage');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || (isVideo ? 'Founded on strict thermodynamics principles, ThermalTech operates high-vacuum braze furnaces reaching 10⁻⁵ Pa vacuum purity. Every thermal tumbler and flask undergoes 100% helium mass spectrometry leak detection.' : 'Our studio rests on the mountain slopes where natural stoneware clay has been dug by hand for over two centuries. Every vessel begins with unrefined earth, wedged and thrown on human-powered kick wheels.'));
    const images = getAboutImages(ctx);
    const highlights = parseAboutHighlights(company.aboutHighlights, isVideo ? [
    { value: '10⁻⁵ Pa', label: 'Vacuum Integrity', desc: 'Cryogenic vacuum furnace rating' },
    { value: '24 Hours', label: 'Thermal Retention', desc: 'Sustained hot beverage performance' },
    { value: '100%', label: 'Helium Leak Tested', desc: 'Mass spectrometry verified' },
  ] : [
    { value: '1280°C', label: 'Kiln Vitrification', desc: 'High-temperature reduction wood fire' },
    { value: '200+ Yrs', label: 'Clay Quarry Heritage', desc: 'Single-origin mountain stoneware' },
    { value: '0% Lead', label: 'Pure Mineral Glazes', desc: 'Natural wood-ash food-safe craft' },
  ]);
    const primaryImage = images.primary || (isVideo ? getIndustryPlaceholder('drinkware', 2) : getIndustryPlaceholder('drinkware', 0));

    if (!isVideo) {
      // CERAMIC MOUNTAIN KILN ABOUT: CHRONICLE TIMELINE
      mainHtml = `
        <main class="drinkware-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Wood Kiln Chronicle &amp; Master Craft
              </span>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:24px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(180,83,9,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:440px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.05rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">Our studio rests on the mountain slopes where natural stoneware clay has been dug by hand for over two centuries. Every vessel begins with unrefined earth, wedged and thrown on human-powered kick wheels.</p>
                    <p style="margin:0 0 18px;">We do not use synthetic pigments. Our glazes are blended strictly from pine wood ash, feldspar rock, and river sediment, vitrifying into durable ceramic art at 1280°C.</p>
                  `}
                </div>
              </div>
            </div>

            <!-- Highlights Matrix -->
            ${highlights.length > 0 ? `
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;margin-bottom:50px;">
                ${highlights.map(h => `
                  <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:2rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">${esc(h.value)}</div>
                    <div style="font-size:0.85rem;font-weight:800;color:${theme.text};margin-bottom:4px;">${esc(h.label)}</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc || "")}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </main>
      `;
    } else {
      // THERMAL CRYOGENIC LAB ABOUT: HELIUM SPECTROMETRY STORY
      mainHtml = `
        <main class="drinkware-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Laboratory Overview · Vacuum Metallurgy
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(2,132,199,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">Founded on strict thermodynamics principles, ThermalTech operates high-vacuum braze furnaces reaching 10⁻⁵ Pa vacuum purity. Every thermal tumbler and flask undergoes 100% helium mass spectrometry leak detection.</p>
                    <p style="margin:0 0 18px;">We supply international brand partners with audited surgical-grade 304 and 316 stainless steel vessels, adhering to FDA, LFGB, and California Prop 65 food-safety standards.</p>
                  `}
                </div>
              </div>
            </div>

            <!-- Highlights Matrix -->
            ${highlights.length > 0 ? `
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;margin-bottom:50px;">
                ${highlights.map(h => `
                  <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:24px;text-align:center;">
                    <div style="font-size:2rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">${esc(h.value)}</div>
                    <div style="font-size:0.85rem;font-weight:800;color:${theme.text};margin-bottom:4px;">${esc(h.label)}</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc || "")}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </main>
      `;
    }
  } else if (page === 'contact') {
    const selectedProd = ctx.options.productId || '';
    if (!isVideo) {
      // CERAMIC ATELIER COMMISSION DESK
      mainHtml = `
        <main class="drinkware-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Atelier Commission &amp; Wholesale Inquiries
              </span>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Commission Handcrafted Stoneware
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Connect with our master potters to discuss kiln firing schedules, custom clay bodies, bespoke bottom stamps, and wooden gift box sets.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:40px;box-shadow:0 12px 36px rgba(180,83,9,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Your Name / Studio Representative</label>
                    <input type="text" name="name" required placeholder="Master Potter / Sourcing Director" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Direct Email Address</label>
                    <input type="email" name="email" required placeholder="artisan@client-atelier.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Selected Ceramic Piece</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Ceramic Inquiry (All Studio Pieces)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Glaze Preference</label>
                    <select name="glaze" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Wood-Ash Shino (Warm Russet)</option>
                      <option>Longquan Celadon (Jade Crackle)</option>
                      <option>Tenmoku Iron (Oil Spot)</option>
                      <option>Raw Bisque Sand (Unglazed Tactile)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Packaging Specification</label>
                    <select name="packaging" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Paulownia Wooden Presentation Box</option>
                      <option>Recycled Kraft Retail Gift Carton</option>
                      <option>Standard Bulk Protective Export Carton</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Project Notes &amp; Custom Seal Requirements</label>
                  <textarea name="message" rows="4" placeholder="Detail your project timeline, desired vessel modifications, or custom bottom stamp marks..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:999px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Transmit Atelier Commission Request ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      // THERMAL LABORATORY TECHNICAL RFQ TERMINAL
      mainHtml = `
        <main class="drinkware-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                ThermalTech Engineering &amp; OEM Sourcing Desk
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Submit Thermal Hardware RFQ
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Request container pricing, laser engraving samples, custom Pantone powder coat finishes, and full ISO/FDA compliance dossiers.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(2,132,199,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Procurement Contact</label>
                    <input type="text" name="name" required placeholder="Senior Hardware Buyer" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" required placeholder="sourcing@enterprise.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Thermal Model</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Hardware Inquiries (All Thermal Capacities)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Estimated Container Volume</label>
                    <select name="volume" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>LCL Trial Batch (500 - 2,000 Pcs)</option>
                      <option>20GP Full Container (~12,000 Pcs)</option>
                      <option>40HQ High Cube (~28,000 Pcs)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Customization Modality</label>
                    <select name="finish" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Pantone Electrostatic Powder Coat</option>
                      <option>360° Seamless Laser Etching</option>
                      <option>Raw Brushed Surgical Steel Finish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Technical Requirements &amp; Target Destination Port</label>
                  <textarea name="message" rows="4" placeholder="Specify destination port (FOB / CIF), thermal testing protocol requirements, or custom lid engineering specifications..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Submit Technical RFQ Specification ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    }
  }

  // Distinct Footer for each variant
  const footerHtml = isVideo ? `
    <footer style="background:#0f172a;color:#f8fafc;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.2rem;font-weight:900;color:#fff;margin-bottom:8px;">${esc(brandName)}</div>
          <p style="color:#94a3b8;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Engineered cryogenic vacuum thermal vessels. Double-wall surgical stainless steel laboratory calibration.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">ISO 9001</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">FDA / LFGB</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">BPA FREE</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Telemetry Standards</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>Vacuum Test: 10⁻⁵ Pa Purity</li>
            <li>Surgical 316 Stainless Liner</li>
            <li>Helium Mass Spectrometry 100%</li>
            <li>Thermal Shock Cycle: -20°C ~ 120°C</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">OEM Procurement</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'rfq@thermaltech-lab.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#38bdf8;text-decoration:none;font-weight:700;font-size:0.82rem;">Direct Sourcing Terminal →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Laboratory Cryogenic Vacuum Engineering Division</span>
      </div>
    </footer>
  ` : `
    <footer style="background:#1c1917;color:#fdfbf7;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid rgba(255,255,255,0.08);">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:#fff;margin-bottom:8px;">${esc(brandName)}</div>
          <p style="color:#a8a29e;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Single-origin wood-fired stoneware and porcelain vessels. Vitrified at 1280°C with natural ash reduction glazes.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#292524;color:#fde68a;font-size:0.7rem;font-weight:700;">1280°C KILN</span>
            <span style="padding:3px 8px;border-radius:4px;background:#292524;color:#fde68a;font-size:0.7rem;font-weight:700;">LEAD FREE</span>
            <span style="padding:3px 8px;border-radius:4px;background:#292524;color:#fde68a;font-size:0.7rem;font-weight:700;">KICK WHEEL</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Studio Archive</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#a8a29e;font-size:0.82rem;line-height:2;">
            <li>Wood-Ash Shino Stoneware</li>
            <li>Longquan Ice-Crackle Celadon</li>
            <li>Barista Pour-Over Extraction Sets</li>
            <li>Traditional Gongfu Tea Vessels</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Atelier Sourcing</h4>
          <p style="color:#a8a29e;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'atelier@kilnclay.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#fde68a;text-decoration:none;font-weight:700;font-size:0.82rem;">Commission Studio Batch →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #292524;padding-top:24px;display:flex;justify-content:space-between;color:#78716c;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Artisan Kiln-Fired Ceramics &amp; Stoneware Atelier</span>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
