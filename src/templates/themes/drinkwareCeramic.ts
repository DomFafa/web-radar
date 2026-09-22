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
    tagline: 'Stackable Porcelain Crema Craft',
    img: getIndustryPlaceholder('drinkware', 7),
  },
];

export function getDrinkwareProducts(ctx: ThemeContext): ThemedDrinkwareItem[] {
  if (isTypedMaterialsSource(ctx.draft)) {
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

  const brandName = company.name || (isVideo ? 'ThermalTech Cryogenic Engineering' : 'Kurogane Artisan Kiln Atelier');
  const brandTagline = isVideo ? 'Precision Vacuum Insulation & Thermal Telemetry' : 'Handcrafted Wood-Fired Stoneware & Mineral Glazes';

  // Strict pure light palettes - zero dark themes
  const theme = isVideo
    ? {
      bg: '#f0f9ff',
      cardBg: '#ffffff',
      cardBorder: 'rgba(2,132,199,0.18)',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(240,249,255,0.92)',
      pillBg: '#e0f2fe',
      pillText: '#0369a1',
      btnGradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
      accentGlow: 'rgba(2,132,199,0.2)',
    }
    : {
      bg: '#fdfbf7',
      cardBg: '#ffffff',
      cardBorder: 'rgba(217,119,6,0.18)',
      primary: '#b45309',
      primaryHover: '#92400e',
      text: '#1c1917',
      textMuted: '#57534e',
      textSub: '#78716c',
      glassBg: 'rgba(253,251,247,0.92)',
      pillBg: '#fef3c7',
      pillText: '#b45309',
      btnGradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
      accentGlow: 'rgba(180,83,9,0.22)',
    };

  // Distinct Header
  const headerHtml = isVideo ? `
    <header class="drinkware-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="background:#0284c7;color:#fff;padding:6px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;font-weight:700;letter-spacing:0.04em;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#38bdf8;animation:pulse 2s infinite;"></span>
          <span>CRYOGENIC VACUUM CHAMBER TELEMETRY ACTIVE · 10⁻⁵ PA INTEGRITY</span>
        </div>
        <div style="font-family:monospace;">STAINLESS SURGICAL 316L · FDA LFGB AUDITED</div>
      </div>
      <div class="wrap" style="height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.15rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;">${esc(brandName)}</span>
            <span style="font-size:0.72rem;color:${theme.textSub};font-weight:600;letter-spacing:0.02em;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.text};">Home</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.text};">Engineering Catalog</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.text};">Telemetry Lab</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.text};">Technical RFQ</a>
        </nav>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:0.78rem;font-weight:700;color:${theme.textSub};">EN</span>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.85rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Request Spec Sheet ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="drinkware-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:14px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:40px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.01em;">${esc(brandName)}</span>
            <span style="font-size:0.72rem;color:${theme.textSub};letter-spacing:0.04em;text-transform:uppercase;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav style="display:flex;align-items:center;gap:32px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.text};">Atelier Home</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.text};">Exhibition Archive</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.text};">Mountain Kiln Story</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.text};">Commission Desk</a>
        </nav>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:0.78rem;font-weight:700;color:${theme.textSub};">EN</span>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.85rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Commission Batch ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // 1. CRYOGENIC THERMAL VIDEO TELEMETRY COCKPIT HERO
      mainHtml = `
        <main class="drinkware-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1fr 1.15fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.04em;margin-bottom:20px;">
                  <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};display:inline-block;"></span>
                  VACUUM METALLURGY · CRYOGENIC THERMAL LAB
                </div>
                <h1 style="font-size:clamp(2.4rem, 4.4vw, 3.8rem);font-weight:900;line-height:1.1;color:${theme.text};letter-spacing:-0.03em;margin:0 0 20px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Precision Thermodynamics: 48-Hour Vacuum Flask Engineering')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:540px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with double-wall copper-shielded vacuum insulation, surgical 316 stainless steel liner, and helium spectrometry leak detection.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Inspect Hardware Fleet ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Telemetry Chamber Specs
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">0.001 Pa</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">High-Vacuum Braze</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">48 Hours</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Thermal Sub-Zero Hold</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">316L Surgical</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Electropolished Liner</div>
                  </div>
                </div>
              </div>

              <div style="position:relative;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(2,132,199,0.08);position:relative;">
                  <div style="aspect-ratio:16/9;background:#e0f2fe;position:relative;overflow:hidden;">
                    <video autoplay muted loop playsinline poster="${esc(heroProduct.img)}" style="width:100%;height:100%;object-fit:cover;display:block;">
                      <source src="/templates/videos/thermal-chamber.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);color:#38bdf8;font-family:monospace;font-size:0.72rem;padding:6px 12px;border-radius:4px;border:1px solid rgba(56,189,248,0.3);">
                      LIVE TELEMETRY: SENSOR 04 // 4.2°C HOLD
                    </div>
                  </div>
                  <div style="padding:20px 24px;background:#ffffff;display:flex;align-items:center;justify-content:space-between;border-top:1px solid ${theme.cardBorder};">
                    <div>
                      <div style="font-size:0.9rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                      <div style="font-size:0.75rem;color:${theme.textSub};">${esc(heroProduct.material)} · ${esc(heroProduct.dimensions)}</div>
                    </div>
                    <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="padding:8px 16px;background:${theme.pillBg};color:${theme.pillText};border-radius:6px;text-decoration:none;font-size:0.8rem;font-weight:800;">
                      View Specs →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 5-Layer Exploded Thermal Architecture Section -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Patented Thermodynamics</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};margin:8px 0 12px;letter-spacing:-0.02em;">
                  5-Layer Exploded Cryogenic Barrier
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Eliminating radiant, convective, and conductive heat transfer across deep vacuum seals.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:16px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px 18px;text-align:center;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">01</div>
                  <h4 style="font-size:0.95rem;font-weight:800;margin:0 0 6px;">316L Core</h4>
                  <p style="font-size:0.78rem;color:${theme.textMuted};line-height:1.5;margin:0;">Electropolished inner surface prevents flavor retention.</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px 18px;text-align:center;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">02</div>
                  <h4 style="font-size:0.95rem;font-weight:800;margin:0 0 6px;">Copper Barrier</h4>
                  <p style="font-size:0.78rem;color:${theme.textMuted};line-height:1.5;margin:0;">Reflective mirror coating blocks thermal radiation loss.</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px 18px;text-align:center;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">03</div>
                  <h4 style="font-size:0.95rem;font-weight:800;margin:0 0 6px;">Vacuum Gap</h4>
                  <p style="font-size:0.78rem;color:${theme.textMuted};line-height:1.5;margin:0;">10⁻⁵ Pa vacuum space eliminates gas conduction.</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px 18px;text-align:center;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">04</div>
                  <h4 style="font-size:0.95rem;font-weight:800;margin:0 0 6px;">Gettering Pill</h4>
                  <p style="font-size:0.78rem;color:${theme.textMuted};line-height:1.5;margin:0;">Chemical getter absorbs micro gas over 10-year lifespan.</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px 18px;text-align:center;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:8px;">05</div>
                  <h4 style="font-size:0.95rem;font-weight:800;margin:0 0 6px;">304 Armor</h4>
                  <p style="font-size:0.78rem;color:${theme.textMuted};line-height:1.5;margin:0;">Heavy impact-resistant structural steel body shell.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Telemetry Performance Grid -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.06em;text-transform:uppercase;">Parametric Catalog</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Audited Cryogenic Fleet
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;color:${theme.primary};font-size:0.9rem;">
                  Full Hardware Spec Sheet →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(2,132,199,0.04);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                        <span style="position:absolute;top:12px;left:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
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
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Wood-Ash Glazing</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Formulated from pine and oak ash mixed with feldspar, creating organic crystallization patterns.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">STAGE 04</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;">1280°C Reduction</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Sealed mountain kiln starved of oxygen, pulling iron minerals to the surface in fiery crimson flashes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Asymmetric Exhibition Plates Showcase -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:44px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.06em;text-transform:uppercase;">Curated Exhibition</span>
                  <h2 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Atelier Exhibition Plates
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;color:${theme.primary};font-size:0.9rem;">
                  Browse Complete Collection →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:32px;align-items:stretch;">
                <article data-wr-product-id="${esc(heroProduct.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(180,83,9,0.06);display:flex;flex-direction:column;">
                  <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.35;background:#fcfaf6;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                    </div>
                  </a>
                  <div style="padding:28px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                      <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">MASTER VESSEL #01</div>
                      <h3 style="font-family:Georgia,serif;font-size:1.4rem;font-weight:900;color:${theme.text};margin:0 0 10px;">
                        <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;color:${theme.text};">${esc(heroProduct.name)}</a>
                      </h3>
                      <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;">${esc(heroProduct.desc)}</p>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid ${theme.cardBorder};font-size:0.85rem;">
                      <span>${esc(heroProduct.dimensions)} · ${esc(heroProduct.material)}</span>
                      <strong style="color:${theme.primary};">MOQ: ${esc(heroProduct.moq)}</strong>
                    </div>
                  </div>
                </article>

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
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">316L Surgical Grade</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Copper Vacuum Barrier</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Pure Titanium Grade 1</span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(2,132,199,0.05);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.15;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:78%;height:78%;object-fit:contain;">
                      <span style="position:absolute;top:10px;left:10px;background:#0284c7;color:#fff;font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:#e0f2fe;color:#0369a1;font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.extra)}</span>
                    </div>
                  </a>
                  <div style="padding:20px;">
                    <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h3 style="font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 8px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.5;margin-bottom:14px;">${esc(p.desc)}</p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.75rem;background:#f0f9ff;padding:10px;border-radius:6px;margin-bottom:14px;">
                      <div><span style="color:${theme.textSub};">Volume:</span> <strong style="color:${theme.text};">${esc(p.dimensions.split('·')[1] || p.dimensions)}</strong></div>
                      <div><span style="color:${theme.textSub};">Liner:</span> <strong style="color:${theme.text};">316L Stainless</strong></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid ${theme.cardBorder};font-size:0.8rem;">
                      <span style="font-weight:700;color:${theme.textSub};">MOQ: <strong style="color:${theme.primary};">${esc(p.moq)}</strong></span>
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-weight:800;color:${theme.primary};">
                        Full Telemetry →
                      </a>
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
    const prod = products.find(p => p.id === ctx.options.productId) || heroProduct;
    if (!isVideo) {
      // CERAMIC ATELIER VESSEL DOSSIER WITH HANKO STAMP & FILMSTRIP
      mainHtml = `
        <main class="drinkware-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="display:flex;gap:8px;align-items:center;font-size:0.82rem;color:${theme.textSub};margin-bottom:28px;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textSub};">Atelier</a>
              <span>/</span>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textSub};">Exhibition Archive</a>
              <span>/</span>
              <span style="color:${theme.primary};font-weight:700;">${esc(prod.name)}</span>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:flex-start;">
              <!-- Master Vessel Gallery with Thumbnails Tray -->
              <div>
                <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:24px;overflow:hidden;box-shadow:0 16px 40px rgba(180,83,9,0.06);position:relative;">
                  <img id="wr-detail-main-img" src="${esc(prod.img)}" alt="${esc(prod.name)}" data-wr-material-image="product-main" data-wr-material-product="${esc(prod.id)}" style="width:100%;height:460px;object-fit:contain;background:#fcfaf6;display:block;">
                  <div style="position:absolute;top:20px;left:20px;background:rgba(253,251,247,0.92);backdrop-filter:blur(8px);padding:6px 14px;border-radius:6px;border:1px solid ${theme.cardBorder};font-size:0.75rem;font-weight:800;color:${theme.primary};">
                    ${esc(prod.badge)}
                  </div>
                  <div style="position:absolute;bottom:20px;right:20px;background:#b45309;color:#fff;padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:800;">
                    1280°C REDUCTION
                  </div>
                </div>

                <div class="senseng-detail-thumbs wr-confirmed-gallery" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;margin-top:16px;">
                  <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:10px;overflow:hidden;background:#fcfaf6;padding:4px;cursor:pointer;">
                    <img src="${esc(prod.img)}" alt="Main Vessel" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:10px;overflow:hidden;background:#fcfaf6;padding:4px;cursor:pointer;">
                    <img src="${esc(products[1]?.img || prod.img)}" alt="Detail View" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:10px;overflow:hidden;background:#fcfaf6;padding:4px;cursor:pointer;">
                    <img src="${esc(products[2]?.img || prod.img)}" alt="Glaze Texture" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                </div>
              </div>

              <!-- Vessel Specifications and Commission Desk -->
              <div>
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.06em;text-transform:uppercase;">
                  [ ATELIER VESSEL DOSSIER ]
                </span>
                <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.4vw, 2.6rem);font-weight:900;color:${theme.text};margin:8px 0 16px;line-height:1.2;">
                  ${esc(prod.name)}
                </h1>
                <p style="font-size:1.02rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(prod.desc)}
                </p>

                <!-- Technical Specification Table -->
                <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;margin-bottom:28px;">
                  <div style="padding:14px 20px;background:${theme.pillBg};font-size:0.8rem;font-weight:800;color:${theme.primary};">
                    CLAY &amp; FIRING SPECIFICATIONS
                  </div>
                  <div style="padding:20px;display:flex;flex-direction:column;gap:12px;font-size:0.88rem;">
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Clay Body:</span>
                      <strong style="color:${theme.text};">${esc(prod.material)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Vessel Dimensions:</span>
                      <strong style="color:${theme.text};">${esc(prod.dimensions)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Glaze Chemistry:</span>
                      <strong style="color:${theme.primary};">${esc(prod.extra)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:${theme.textSub};">Kiln Batch Minimum:</span>
                      <strong style="color:${theme.text};">${esc(prod.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- Hanko Master Stamp Verification -->
                <div style="background:#fef3c7;border:1px solid rgba(217,119,6,0.3);border-radius:12px;padding:18px 20px;display:flex;align-items:center;gap:16px;margin-bottom:32px;">
                  <div style="width:44px;height:44px;border:2px solid ${theme.primary};border-radius:6px;display:flex;align-items:center;justify-content:center;color:${theme.primary};font-weight:900;font-size:0.75rem;background:#fff;flex-shrink:0;">
                    HANKO
                  </div>
                  <div>
                    <div style="font-weight:800;font-size:0.88rem;color:${theme.text};">Master Potter Bottom Seal Guarantee</div>
                    <div style="font-size:0.76rem;color:${theme.textMuted};">Each vessel carries an authentic impressed Hanko stamp on the unglazed footring.</div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;">
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;flex:1;padding:16px;text-align:center;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Commission This Vessel Batch ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 24px;border-radius:999px;background:#fff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                    Back to Archive
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // THERMAL TELEMETRY HARDWARE SPECIFICATION DOSSIER
      mainHtml = `
        <main class="drinkware-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="display:flex;gap:8px;align-items:center;font-size:0.82rem;color:${theme.textSub};margin-bottom:28px;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textSub};">Engineering Hub</a>
              <span>/</span>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textSub};">Parametric Fleet</a>
              <span>/</span>
              <span style="color:${theme.primary};font-weight:700;">${esc(prod.name)}</span>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:flex-start;">
              <!-- Product Telemetry Viewer -->
              <div>
                <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(2,132,199,0.06);position:relative;">
                  <img id="wr-detail-main-img" src="${esc(prod.img)}" alt="${esc(prod.name)}" data-wr-material-image="product-main" data-wr-material-product="${esc(prod.id)}" style="width:100%;height:460px;object-fit:contain;background:#f8fafc;display:block;">
                  <div style="position:absolute;top:20px;left:20px;background:#0284c7;color:#fff;padding:6px 12px;border-radius:6px;font-size:0.75rem;font-weight:800;">
                    ${esc(prod.badge)}
                  </div>
                  <div style="position:absolute;bottom:20px;right:20px;background:#e0f2fe;color:#0369a1;padding:6px 14px;border-radius:6px;font-size:0.75rem;font-weight:800;">
                    ${esc(prod.extra)}
                  </div>
                </div>

                <div class="senseng-detail-thumbs wr-confirmed-gallery" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;margin-top:16px;">
                  <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;overflow:hidden;background:#f8fafc;padding:4px;cursor:pointer;">
                    <img src="${esc(prod.img)}" alt="Front Angle" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:8px;overflow:hidden;background:#f8fafc;padding:4px;cursor:pointer;">
                    <img src="${esc(products[1]?.img || prod.img)}" alt="Cross Section" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:8px;overflow:hidden;background:#f8fafc;padding:4px;cursor:pointer;">
                    <img src="${esc(products[2]?.img || prod.img)}" alt="Lid Seal" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                </div>
              </div>

              <!-- Engineering Specification Sheet -->
              <div>
                <div style="display:inline-block;padding:4px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                  HARDWARE DOSSIER #TR-800
                </div>
                <h1 style="font-size:clamp(2rem, 3.4vw, 2.6rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;">
                  ${esc(prod.name)}
                </h1>
                <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(prod.desc)}
                </p>

                <!-- Parameter Spec Table -->
                <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;margin-bottom:28px;">
                  <div style="padding:14px 20px;background:#f0f9ff;border-bottom:1px solid ${theme.cardBorder};font-size:0.8rem;font-weight:800;color:${theme.primary};">
                    PARAMETRIC TELEMETRY SPECIFICATION
                  </div>
                  <div style="padding:20px;display:flex;flex-direction:column;gap:12px;font-size:0.88rem;">
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Material Architecture:</span>
                      <strong style="color:${theme.text};">${esc(prod.material)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Dimensional Bounds:</span>
                      <strong style="color:${theme.text};">${esc(prod.dimensions)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Insulation Decay Rating:</span>
                      <strong style="color:${theme.primary};">${esc(prod.extra)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:${theme.textSub};">Production Lot MOQ:</span>
                      <strong style="color:${theme.text};">${esc(prod.moq)}</strong>
                    </div>
                  </div>
                </div>

                <div style="background:#f0f9ff;border:1px solid rgba(2,132,199,0.25);border-radius:10px;padding:18px 20px;margin-bottom:32px;">
                  <div style="font-weight:800;font-size:0.88rem;color:${theme.text};margin-bottom:4px;">Wholesale Pallet &amp; Shipping Optimization</div>
                  <div style="font-size:0.78rem;color:${theme.textMuted};line-height:1.5;">Master export cartons packed 24 units/case. Standard 40HQ container accommodates 28,800 units with drop-tested honeycomb palletizing.</div>
                </div>

                <div style="display:flex;gap:14px;">
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;flex:1;padding:16px;text-align:center;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Submit RFQ Specification ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 24px;border-radius:8px;background:#fff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                    Back to Fleet
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
      // 1. CERAMIC ASYMMETRIC EDITORIAL ATELIER & KILN CHRONICLE
      mainHtml = `
        <main class="drinkware-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <!-- Asymmetric Editorial Atelier Header with Hanko Seal -->
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;border-bottom:2px solid ${theme.cardBorder};padding-bottom:32px;">
              <div style="max-width:760px;">
                <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
                  EST. 1826 · MOUNTAIN WOOD KILN CHRONICLE
                </div>
                <h1 style="font-family:Georgia,serif;font-size:clamp(2.2rem, 4vw, 3.4rem);font-weight:900;color:${theme.text};line-height:1.15;margin:0;">
                  ${esc(headline)}
                </h1>
              </div>
              <div style="width:76px;height:76px;border:2px solid #b45309;border-radius:8px;padding:4px;display:flex;align-items:center;justify-content:center;color:#b45309;font-weight:900;font-size:0.75rem;text-align:center;letter-spacing:0.05em;background:#fff9f2;transform:rotate(-3deg);flex-shrink:0;">
                HANKO<br>SEAL
              </div>
            </div>

            <!-- Asymmetric 3-Part Exhibition Spread -->
            <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:center;margin-bottom:56px;">
              <!-- Framed Exhibition Piece with Placard -->
              <div style="border-radius:16px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(180,83,9,0.06);background:#fff;padding:16px;">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;border-radius:10px;display:block;" loading="lazy">
                <div style="margin-top:14px;padding:12px 14px;background:${theme.bg};border-radius:6px;border-left:3px solid ${theme.primary};">
                  <div style="font-family:Georgia,serif;font-size:0.95rem;font-weight:800;color:${theme.text};">Kiln Reduction Batch No. 84</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">Wood Ash Glaze · Single-Origin Mountain Stoneware</div>
                </div>
              </div>

              <!-- Editorial Story with Lead Quote -->
              <div>
                <div style="font-family:Georgia,serif;font-size:1.25rem;line-height:1.7;color:${theme.text};margin-bottom:24px;border-left:3px solid ${theme.primary};padding-left:20px;font-style:italic;">
                  "${esc(paragraphs[0] || 'Every vessel begins with unrefined earth, wedged and thrown on human-powered kick wheels.')}"
                </div>
                <div style="font-size:0.98rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.slice(1).map(p => `<p style="margin:0 0 16px;">${esc(p)}</p>`).join('')}
                </div>
              </div>
            </div>

            <!-- Horizontal Reduction Kiln Milestone Timeline -->
            <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:36px;box-shadow:0 8px 30px rgba(180,83,9,0.04);">
              <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:20px;">
                1280°C Wood Firing Reduction Timeline &amp; Benchmarks
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
                ${highlights.map((h, i) => `
                  <div style="border-left:3px solid ${theme.primary};padding-left:18px;">
                    <div style="font-family:Georgia,serif;font-size:2rem;font-weight:900;color:${theme.primary};margin-bottom:4px;">${esc(h.value)}</div>
                    <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">${esc(h.label)}</div>
                    <div style="font-size:0.76rem;color:${theme.textSub};">${esc(h.desc || '')}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // 2. THERMAL CRYOGENIC TELEMETRY COCKPIT & METALLURGY DOSSIER
      mainHtml = `
        <main class="drinkware-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <!-- Monospace Telemetry Header Bar -->
            <div style="background:#0284c7;color:#fff;padding:8px 20px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;font-family:monospace;font-size:0.78rem;font-weight:700;">
              <span>[TELEMETRY CONSOLE: CRYOGENIC METALLURGY LAB · 10⁻⁵ PA PURITY]</span>
              <span>SYS_VER: 2026.09 // QA PASSED</span>
            </div>
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-top:none;padding:32px;border-radius:0 0 16px 16px;margin-bottom:40px;box-shadow:0 12px 36px rgba(2,132,199,0.06);">
              <div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
                <span style="background:#e0f2fe;color:#0369a1;padding:3px 10px;border-radius:4px;font-size:0.75rem;font-weight:800;font-family:monospace;">TEST REPORT #TR-9942</span>
                <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:${theme.text};margin:0;">${esc(headline)}</h1>
              </div>

              <!-- Technical Cockpit Split -->
              <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:40px;align-items:center;margin-top:28px;">
                <!-- Blueprint Frame with Crosshairs -->
                <div style="position:relative;background:#f0f9ff;border:2px dashed #0284c7;border-radius:12px;padding:12px;">
                  <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;border-radius:8px;display:block;" loading="lazy">
                  <div style="position:absolute;top:20px;left:20px;background:rgba(2,132,199,0.9);color:#fff;padding:4px 10px;border-radius:4px;font-family:monospace;font-size:0.7rem;font-weight:700;">
                    SPEC_REF: 316L VACUUM BRAZE
                  </div>
                </div>

                <!-- Tabbed Insulation Verification Report -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px;">
                  <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:1px solid ${theme.cardBorder};padding-bottom:12px;">
                    <span style="background:#0284c7;color:#fff;padding:4px 12px;border-radius:4px;font-size:0.75rem;font-weight:800;">TEST PROTOCOL</span>
                    <span style="background:#f1f5f9;color:#475569;padding:4px 12px;border-radius:4px;font-size:0.75rem;font-weight:700;">HELIUM MASS SPEC</span>
                  </div>
                  <div style="font-size:0.95rem;line-height:1.75;color:${theme.textMuted};">
                    ${paragraphs.map(p => `<p style="margin:0 0 16px;">${esc(p)}</p>`).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Telemetry Parameter Dashboard with Channel Gauges -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
              ${highlights.map((h, i) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px;box-shadow:0 4px 16px rgba(2,132,199,0.04);">
                  <div style="font-family:monospace;font-size:0.7rem;color:${theme.primary};font-weight:700;margin-bottom:6px;">CHANNEL 0${i + 1} // CALIBRATED</div>
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.text};margin-bottom:4px;">${esc(h.value)}</div>
                  <div style="font-size:0.85rem;font-weight:800;color:${theme.primary};margin-bottom:4px;">${esc(h.label)}</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc || '')}</div>
                  <div style="width:100%;height:4px;background:#e0f2fe;border-radius:2px;margin-top:14px;overflow:hidden;">
                    <div style="width:${75 + i * 10}%;height:100%;background:${theme.primary};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
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
                Direct Atelier Commission &amp; Wholesale Batch
              </span>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Request Custom Kiln Batch
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Inquire about single-origin mountain clay sourcing, bespoke ash glazes, custom café dinnerware collections, or master potter collaborations.
              </p>
            </div>

            <div style="max-width:760px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;box-shadow:0 12px 36px rgba(180,83,9,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Your Name / Representative</label>
                    <input type="text" name="name" required placeholder="Master Sommelier or Buyer" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Email Address</label>
                    <input type="email" name="email" required placeholder="curator@atelier.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Commission Vessel Edition</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Custom Studio Batch (All Ceramic Forms)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Glaze Formulation</label>
                    <select name="glaze" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Wood-Ash Reduction Shino (1280°C)</option>
                      <option>Longquan Jade Ice-Crackle Celadon</option>
                      <option>Tenmoku Hare's Fur Metallic Glaze</option>
                      <option>Raw Natural Stoneware Slip</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Projected Edition Volume</label>
                    <select name="volume" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Small Batch Studio Run (100 - 300 Pcs)</option>
                      <option>Boutique Hospitality Run (500 - 1,200 Pcs)</option>
                      <option>Flagship Brand Distribution (2,000+ Pcs)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Custom Hanko Stamp &amp; Functional Notes</label>
                  <textarea name="message" rows="4" placeholder="Detail custom logo bottom stamps, stacking constraints, or food-safe certifications required..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
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
      // THERMAL CRYOGENIC LAB TECHNICAL RFQ TERMINAL
      mainHtml = `
        <main class="drinkware-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                ThermalTech Engineering RFQ Terminal
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Request Technical Proposal
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Inquire about custom tooling, vacuum brazing cycles, OEM dual-wall hydroforming, and international laboratory compliance certifications.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:40px;box-shadow:0 12px 36px rgba(2,132,199,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Procurement Contact</label>
                    <input type="text" name="name" required placeholder="Lead Hardware Engineer" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" required placeholder="procurement@brand.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Thermal Vessel Architecture</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Custom Hardware Program</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Stainless Grade</label>
                    <select name="grade" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Surgical 316L Inner + 304 Outer</option>
                      <option>Standard 304 Dual-Wall Stainless</option>
                      <option>Grade 1 Pure Titanium (Backpacking)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Annual Production Volume</label>
                    <select name="volume" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>LCL Pilot Lot (1,000 - 3,000 Units)</option>
                      <option>20GP Full Container (~15,000 Units)</option>
                      <option>40HQ Enterprise Program (~45,000+ Units)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Engineering Notes &amp; Destination Port</label>
                  <textarea name="message" rows="4" placeholder="Specify insulation hours, powder-coating pantones, laser engraving, or custom tooling requirements..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Transmit Technical RFQ Specification ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    }
  }

  // Common Footer
  const footerHtml = `
    <footer style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;color:${theme.textMuted};font-size:0.85rem;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.1rem;font-weight:900;color:${theme.text};margin-bottom:10px;">${esc(brandName)}</div>
            <p style="margin:0;line-height:1.6;max-width:340px;color:${theme.textSub};">${esc(brandTagline)}</p>
          </div>
          <div>
            <div style="font-weight:800;color:${theme.text};margin-bottom:12px;text-transform:uppercase;font-size:0.75rem;">Navigation</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textSub};">Home</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textSub};">Catalog</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textSub};">About</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textSub};">Contact</a>
            </div>
          </div>
          <div>
            <div style="font-weight:800;color:${theme.text};margin-bottom:12px;text-transform:uppercase;font-size:0.75rem;">Atelier Inquiry</div>
            <div style="color:${theme.textSub};line-height:1.6;">
              <div>${esc(company.address || 'Export Craft District, Global Logistics Center')}</div>
              <div>${esc(company.email || 'export@atelier-craft.com')}</div>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid ${theme.cardBorder};padding-top:20px;display:flex;justify-content:space-between;font-size:0.78rem;color:${theme.textSub};">
          <span>&copy; ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
          <span>B2B Global Supply &amp; Manufacturing</span>
        </div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
