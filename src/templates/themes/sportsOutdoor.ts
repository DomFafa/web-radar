import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { getIndustryPlaceholder } from './industryPlaceholders';

export interface ThemedSportsItem {
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

export const SPORTS_DEFAULT_PRODUCTS: ThemedSportsItem[] = [
  {
    id: 'sp-1',
    name: 'Alpine 3-Layer Ultralight Mountaineering Hardshell',
    desc: 'Dyneema composite ripstop outer with microporous ePTFE membrane delivering 20,000mm hydrostatic waterproofness and 380g pack weight.',
    badge: '20,000mm ePTFE',
    category: 'apparel',
    categoryNameZh: '',
    categoryNameEn: 'Alpine Apparel',
    material: '3-Layer Dyneema ePTFE Membrane',
    dimensions: 'Sizes S-XXL · 380g Packweight',
    extra: '100% Heat-Welded Seams',
    moq: '200 Units',
    tagline: '20,000mm Dyneema Alpine Shell',
    img: getIndustryPlaceholder('sports', 0),
  },
  {
    id: 'sp-2',
    name: 'Supercritical PEBA Carbon Plate Racing Shoes',
    desc: 'Nitrogen-infused supercritical PEBA foam midsole with 3K spoon-shaped carbon fiber plate for 82% mechanical energy return.',
    badge: '82% Energy Return',
    category: 'footwear',
    categoryNameZh: '',
    categoryNameEn: 'Racing Footwear',
    material: 'Supercritical PEBA + 3K Carbon Plate',
    dimensions: 'Men US 7-13 · 185g (Size 9)',
    extra: 'World Athletics 39.5mm Compliant',
    moq: '300 Pairs',
    tagline: '3K Carbon Spoon Energy Return',
    img: getIndustryPlaceholder('sports', 1),
  },
  {
    id: 'sp-3',
    name: 'Carbon Fiber Ultralight Trekking Poles',
    desc: 'Full carbon fiber shaft trekking poles with tungsten carbide tips, cork/EVA ergonomic grips, and 3-section lever lock.',
    badge: '195g Ultralight',
    category: 'gear',
    categoryNameZh: '',
    categoryNameEn: 'Alpine Gear',
    material: '100% Carbon Fiber Shaft',
    dimensions: '62-135cm Adjustable · 195g/pair',
    extra: 'Tungsten Carbide Tips',
    moq: '300 Pairs',
    tagline: 'Full Carbon 195g Ultralight',
    img: getIndustryPlaceholder('sports', 2),
  },
  {
    id: 'sp-4',
    name: 'Trail Running Hydration Vest 15L',
    desc: 'Race-cut vest with Cordura 30D ripstop, dual 500ml soft flasks, and magnetic sternum buckle for bounce-free ultra running.',
    badge: 'Race-Cut 15L',
    category: 'pack',
    categoryNameZh: '',
    categoryNameEn: 'Hydration Packs',
    material: 'Cordura 30D Ripstop Nylon',
    dimensions: '15L Capacity · 280g (empty)',
    extra: 'Magnetic Sternum Lock',
    moq: '500 Units',
    tagline: 'Bounce-Free Race Hydration',
    img: getIndustryPlaceholder('sports', 3),
  },
  {
    id: 'sp-5',
    name: '4-Season Geodesic Expedition Mountain Tent',
    desc: 'High-altitude expedition tent engineered with 7001-T6 aluminum poles, silicone-coated ripstop nylon, and 80 km/h wind resistance.',
    badge: '4-Season 80km/h',
    category: 'shelter',
    categoryNameZh: '',
    categoryNameEn: 'Expedition Shelters',
    material: '40D Ripstop Nylon Sil/PU 3000mm',
    dimensions: '220 × 130 × 105 cm · 2.4kg',
    extra: 'Geodesic Wind Architecture',
    moq: '100 Units',
    tagline: '80 km/h Geodesic Alpine Tent',
    img: getIndustryPlaceholder('sports', 4),
  },
  {
    id: 'sp-6',
    name: 'Aero-Dynamic Speed Road Cycling Helmet',
    desc: 'In-mold EPS liner with polycarbonate shell, aerodynamic wind-tunnel channeling, and magnetic Fidlock buckle for elite criterion racing.',
    badge: 'Wind-Tunnel Aero',
    category: 'cycling',
    categoryNameZh: '',
    categoryNameEn: 'Cycling Gear',
    material: 'High-Density EPS + In-Mold PC',
    dimensions: 'Sizes M (54-58cm) / L (58-62cm) · 245g',
    extra: 'CE EN 1078 Certified',
    moq: '300 Units',
    tagline: 'Wind-Tunnel Aero Channeling',
    img: getIndustryPlaceholder('sports', 5),
  },
  {
    id: 'sp-7',
    name: 'Ultralight 850FP Hydrophobic Down Sleeping Bag',
    desc: '850 fill power European goose down with PFC-free hydrophobic treatment, trapezoidal baffle construction, and -15°C comfort limit.',
    badge: '850FP Down',
    category: 'sleep',
    categoryNameZh: '',
    categoryNameEn: 'Alpine Gear',
    material: '850 Fill Power Goose Down + 10D Taffeta',
    dimensions: '210 × 80 × 50 cm · 740g',
    extra: 'EN 13537 Tested -15°C',
    moq: '150 Units',
    tagline: '850FP Down -15°C Comfort Limit',
    img: getIndustryPlaceholder('sports', 6),
  },
  {
    id: 'sp-8',
    name: 'Polarized Hydrophobic Performance Sport Eyewear',
    desc: 'TR90 memory polymer frame with interchangeable hydrophobic polycarbonate lenses, anti-fog ventilation ports, and UV400 protection.',
    badge: 'UV400 Polarized',
    category: 'eyewear',
    categoryNameZh: '',
    categoryNameEn: 'Athletic Eyewear',
    material: 'Swiss TR90 Polymer + PC Lens',
    dimensions: '145 × 55 × 125 mm · 28g',
    extra: 'Oleophobic Coating',
    moq: '500 Pairs',
    tagline: 'Swiss TR90 Hydrophobic Optics',
    img: getIndustryPlaceholder('sports', 7),
  },
];

function getSportsProducts(ctx: ThemeContext): ThemedSportsItem[] {
  const isTyped = isTypedMaterialsSource(ctx.draft);
  if (isTyped) {
    return ctx.draft.products.map((p, i) => {
      const def = SPORTS_DEFAULT_PRODUCTS[i % SPORTS_DEFAULT_PRODUCTS.length]!;
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
      const def = SPORTS_DEFAULT_PRODUCTS[i % SPORTS_DEFAULT_PRODUCTS.length]!;
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

  return SPORTS_DEFAULT_PRODUCTS;
}

export function renderSportsPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getSportsProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'Kinetix Human Performance Lab' : 'ApexTrail Alpine Expeditions');
  const brandTagline = isVideo ? 'Biomechanics & Supercritical Carbon Propulsion' : 'Ultralight Alpine Mountaineering & Thru-Hiking';

  // Light palettes only - strictly no dark mode
  const theme = isVideo
    ? {
      bg: '#f0fdf4',
      cardBg: '#ffffff',
      cardBorder: 'rgba(22,163,74,0.18)',
      primary: '#16a34a',
      primaryHover: '#15803d',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(240,253,244,0.92)',
      pillBg: '#dcfce7',
      pillText: '#15803d',
      btnGradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      accentGlow: 'rgba(22,163,74,0.22)',
    }
    : {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      cardBorder: 'rgba(234,88,12,0.16)',
      primary: '#ea580c',
      primaryHover: '#c2410c',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(248,250,252,0.92)',
      pillBg: '#ffedd5',
      pillText: '#c2410c',
      btnGradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      accentGlow: 'rgba(234,88,12,0.2)',
    };

  // Distinct Header for each variant
  const headerHtml = isVideo ? `
    <header class="sports-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="background:#dcfce7;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${theme.primary};"></span>
          <span>BIOMECHANICS TELEMETRY: 82% PEBA REBOUND · OXYGEN SAVINGS -3.8%</span>
        </div>
        <div>WORLD ATHLETICS COMPLIANT (39.5mm STACK LIMIT)</div>
      </div>
      <div class="wrap" style="height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.18rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};">${esc(brandName)}</span>
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
            Racing OEM RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="sports-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;">${esc(brandName)}</span>
              <span style="display:inline-block;padding:2px 6px;border-radius:3px;background:#ffedd5;color:#ea580c;font-size:0.62rem;font-weight:800;font-family:monospace;">20,000mm ePTFE</span>
            </div>
            <span style="font-size:0.68rem;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};font-weight:700;">${esc(brandTagline)}</span>
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Expedition Outfitting ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // 1. HIGH-SPEED MOTION CAPTURE VIDEO HUD CONSOLE
      mainHtml = `
        <main class="sports-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- High-Speed Motion Capture HUD Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Supercritical Nitrogen PEBA · 3K Spoon Carbon Plate Propulsion
                </div>
                <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Human Kinetic Propulsion: 82% Supercritical PEBA Rebound')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with nitrogen-foamed PEBA midsoles and longitudinal carbon rocker geometry, proven to reduce runner oxygen consumption by -3.8%.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Athletic Race Deck ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Biomechanics Whitepaper
                  </a>
                </div>
                <!-- Biomechanics Performance Telemetry -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Energy Return</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">82.4%</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Supercritical PEBA foam</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Weight Profile</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">185 Grams</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">US Men Size 9 sample</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Stack Compliance</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">39.5 mm</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">World Athletics legal</div>
                  </div>
                </div>
              </div>

              <!-- High-Speed Motion Capture Screen Console -->
              <div style="position:relative;">
                <div style="border-radius:16px;overflow:hidden;background:${theme.cardBg};border:2px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(22,163,74,0.14);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-family:monospace;font-weight:700;">
                    LIVE MOCAP: 250 FPS CADENCE
                  </div>
                  <div style="position:absolute;bottom:16px;right:16px;background:rgba(22,163,74,0.92);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;">
                    3K CARBON SPOON
                  </div>
                </div>
                <div style="margin-top:14px;background:${theme.cardBg};border-radius:10px;padding:12px 18px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;">
                  <span style="font-weight:700;color:${theme.text};">MODEL: ${esc(heroProduct.name)}</span>
                  <span style="font-weight:800;color:${theme.primary};">${esc(heroProduct.moq)} MOQ</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Biomechanics Energy Return Breakdown -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Physiological Efficiency</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Kinetic Propulsion Architecture
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Combining nitrogen physical foaming with carbon torsional stiffness to maximize ground reaction force conversion.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">82%</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">PEBA Rebound</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Supercritical microcellular nitrogen bead structure</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">3K</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Carbon Spoon Plate</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Full-length curved rocker launches runner forward</p>
                </div>
                <div style="background:${theme.bg};border:2px solid ${theme.primary};border-radius:12px;padding:22px 16px;text-align:center;box-shadow:0 8px 24px rgba(22,163,74,0.1);">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">-3.8%</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.primary};margin:0 0 6px;">VO₂ Oxygen Cost</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Metabolic savings at marathon race pace</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">1,000 KM</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Abrasion Outsole</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">High-traction liquid rubber compound</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Racing Footwear Showcase -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Competition Road &amp; Trail Series</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Performance Footwear Fleet
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View Full Race Deck (${products.length}) →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(22,163,74,0.04);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#f0fdf4;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                        <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                    </a>
                    <div style="padding:18px;">
                      <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                      <h3 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                      </h3>
                      <div style="font-size:0.8rem;color:${theme.textMuted};margin-bottom:14px;line-height:1.5;">${esc(p.material)} · ${esc(p.dimensions)}</div>
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
      // 2. TOPOGRAPHIC ALPINE EXPEDITION SPREAD HERO
      mainHtml = `
        <main class="sports-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Topographic Alpine Expedition Spread Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  [ 20,000mm HYDROSTATIC HEAD · ULTRALIGHT 380G ]
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Alpine Ultralight Expeditions: 20,000mm Weatherproof Armor')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.75;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with 3-layer Dyneema composite ePTFE membranes, 100% heat-welded micro-taped seams, and featherweight packability for 4,000-meter alpine ascents.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Alpine Gear Wall ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    UIAGM Mountain Guide Testing
                  </a>
                </div>
                <!-- Alpine Protection Badge -->
                <div style="display:flex;align-items:center;gap:18px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="width:48px;height:48px;border-radius:8px;border:2px solid ${theme.primary};display:flex;align-items:center;justify-content:center;color:${theme.primary};font-weight:900;font-size:0.8rem;background:#fff;font-family:monospace;">
                    20K
                  </div>
                  <div>
                    <div style="font-weight:800;font-size:0.9rem;color:${theme.text};">20,000 mm Hydrostatic Water Resistance</div>
                    <div style="font-size:0.78rem;color:${theme.textSub};">MVTR 25,000 g/m²/24h extreme breathability rating</div>
                  </div>
                </div>
              </div>

              <!-- Topographic Floating Gear Showcase Card -->
              <div style="position:relative;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 24px 50px rgba(234,88,12,0.08);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:20px;left:20px;background:rgba(248,250,252,0.92);backdrop-filter:blur(8px);padding:8px 16px;border-radius:6px;border:1px solid ${theme.cardBorder};">
                    <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};font-family:monospace;">ELEVATION: 4,200M GLACIAL</span>
                  </div>
                  <div style="position:absolute;bottom:20px;right:20px;background:${theme.primary};color:#fff;padding:6px 14px;border-radius:6px;font-size:0.75rem;font-weight:800;">
                    380G PACKWEIGHT
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3-Layer Weatherproof Membrane Breakdown -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Technical Textile Science</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  3-Layer Microporous Membrane Cross-Section
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Engineered to repel torrential high-altitude rain while actively exhausting micro-perspiration vapor during intense ascents.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">LAYER 01</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">Dyneema Ripstop</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">Ultra-High Molecular PE</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Extreme abrasion and puncture resistance against granite rock faces and crampons.
                  </p>
                </div>
                <div style="background:${theme.bg};border:2px solid ${theme.primary};border-radius:16px;padding:24px 20px;box-shadow:0 8px 24px rgba(234,88,12,0.1);">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">LAYER 02</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.primary};margin:0 0 4px;">ePTFE Membrane</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">20,000mm Waterproof</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Billions of microscopic pores per cm² prevent liquid water entry while venting heat.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">LAYER 03</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">Wicking Tricot</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">Hydrophilic Backing</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Next-to-skin micro-knit liner rapidly transports body humidity away from the wearer.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">SEAM SEALING</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">13mm Micro-Tape</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">Heat-Welded Seams</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Ultralight bonding tape eliminates sewing needle holes and guarantees storm integrity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Alpine Gear Wall Showcase -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Alpine Expedition Gear Wall</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Featured Ultralight Hardware
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View Full Gear Wall (${products.length}) →
                </a>
              </div>

              <!-- Asymmetric 1-wide + 2-stacked layout -->
              <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:28px;">
                <!-- Wide Masterpiece Gear -->
                <article data-wr-product-id="${esc(heroProduct.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(234,88,12,0.06);display:flex;flex-direction:column;">
                  <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;flex:1;">
                    <div style="aspect-ratio:1.3;background:#f8fafc;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                    </div>
                  </a>
                  <div style="padding:24px;">
                    <span style="font-size:0.75rem;color:${theme.primary};font-weight:800;letter-spacing:0.04em;font-family:monospace;">EXPEDITION GEAR #01</span>
                    <h3 style="font-size:1.35rem;font-weight:900;color:${theme.text};margin:6px 0 10px;">
                      <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;color:${theme.text};">${esc(heroProduct.name)}</a>
                    </h3>
                    <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin-bottom:18px;">${esc(heroProduct.desc)}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;padding-top:14px;border-top:1px solid ${theme.cardBorder};">
                      <span style="color:${theme.textSub};">${esc(heroProduct.material)}</span>
                      <strong style="color:${theme.primary};">MOQ: ${esc(heroProduct.moq)}</strong>
                    </div>
                  </div>
                </article>

                <!-- Stacked Side Gear -->
                <div style="display:flex;flex-direction:column;gap:24px;">
                  ${products.slice(1, 3).map((p, idx) => `
                    <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(234,88,12,0.04);display:grid;grid-template-columns:140px 1fr;align-items:center;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;height:100%;">
                        <div style="height:100%;min-height:140px;background:#f8fafc;display:flex;align-items:center;justify-content:center;border-right:1px solid ${theme.cardBorder};">
                          <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                        </div>
                      </a>
                      <div style="padding:18px 20px;">
                        <span style="font-size:0.7rem;font-weight:800;color:${theme.primary};font-family:monospace;">EXPEDITION GEAR #0${idx + 2}</span>
                        <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:4px 0 6px;">
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
      // ALPINE TOPOGRAPHIC EXPEDITION GEAR WALL CATALOG
      mainHtml = `
        <main class="sports-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <!-- Topographic Expedition Radar HUD Bar -->
            <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:12px;padding:12px 20px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 4px 16px rgba(234,88,12,0.04);">
              <div style="display:flex;align-items:center;gap:10px;font-family:monospace;font-size:0.75rem;font-weight:800;color:#c2410c;letter-spacing:0.04em;">
                <span style="width:8px;height:8px;border-radius:50%;background:#ea580c;display:inline-block;"></span>
                [TOPOGRAPHIC EXPEDITION RADAR: ACTIVE] // 4,000M+ MONT BLANC FLANK CERTIFIED · 20,000MM HYDROSTATIC HEAD · 380G PACKWEIGHT
              </div>
              <div style="font-family:monospace;font-size:0.72rem;font-weight:700;color:#78716c;">
                UIAGM MOUNTAIN GUIDE VERIFIED PROTOCOL
              </div>
            </div>

            <!-- Page Header & Elevation Classification Filter Tabs -->
            <div style="border-bottom:1px solid #fed7aa;padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:#fff7ed;color:#c2410c;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;border:1px solid #fed7aa;">
                High-Altitude Terrain Index · Ultralight Expeditions
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:#0f172a;margin:0 0 14px;letter-spacing:-0.03em;">
                Alpine Mountaineering &amp; Expedition Gear Wall
              </h1>
              <p style="font-size:1rem;color:#475569;margin:0 0 20px;max-width:760px;line-height:1.6;">
                Engineered for extreme high-altitude alpine terrain. Dyneema 3-layer ePTFE composites, 100% heat-welded micro-tape seams, and sub-zero blizzard proofing.
              </p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:8px;background:#ea580c;color:#ffffff;font-family:monospace;letter-spacing:0.03em;">[ELEVATION-01: ALL EXPEDITION GEAR (${products.length})]</span>
                <span style="padding:7px 16px;border-radius:8px;background:#ffffff;color:#475569;border:1px solid #fed7aa;font-family:monospace;letter-spacing:0.03em;">[ELEVATION-02: 4,000M+ HARDSHELLS]</span>
                <span style="padding:7px 16px;border-radius:8px;background:#ffffff;color:#475569;border:1px solid #fed7aa;font-family:monospace;letter-spacing:0.03em;">[ELEVATION-03: ULTRALIGHT PACKS]</span>
                <span style="padding:7px 16px;border-radius:8px;background:#ffffff;color:#475569;border:1px solid #fed7aa;font-family:monospace;letter-spacing:0.03em;">[ELEVATION-04: GEODESIC SHELTERS]</span>
              </div>
            </div>

            <!-- Alpine Topographic Equipment Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:30px;">
              ${products.map((p, idx) => `
                <article data-wr-product-id="${esc(p.id)}" style="background:#ffffff;border:1px solid #fed7aa;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(234,88,12,0.05);display:flex;flex-direction:column;">
                  <div style="background:#fff7ed;padding:8px 14px;border-bottom:1px solid #fed7aa;display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;font-family:monospace;font-weight:800;">
                    <span style="color:#c2410c;">GEAR-ALP0${idx + 1} // 3-LAYER ePTFE</span>
                    <span style="color:#059669;background:#ecfdf5;padding:2px 6px;border-radius:4px;border:1px solid #a7f3d0;">4,000M PASS</span>
                  </div>
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #fed7aa;background-image:radial-gradient(#fed7aa 1px, transparent 1px);background-size:16px 16px;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:82%;height:82%;object-fit:contain;">
                      <span style="position:absolute;top:12px;left:12px;background:#ffffff;border:1px solid #fed7aa;color:#c2410c;font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;font-family:monospace;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;font-family:monospace;">UIAGM TESTED</span>
                    </div>
                  </a>
                  <div style="padding:22px;display:flex;flex-direction:column;flex-grow:1;">
                    <span style="font-size:0.72rem;color:#78716c;font-weight:800;text-transform:uppercase;font-family:monospace;">${esc(p.categoryNameEn)}</span>
                    <h3 style="font-size:1.12rem;font-weight:900;color:#0f172a;margin:6px 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                    </h3>
                    <p style="font-size:0.84rem;color:#475569;line-height:1.6;margin-bottom:16px;flex-grow:1;">${esc(p.desc)}</p>

                    <!-- Dual Alpine Telemetry Meters -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
                      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 10px;">
                        <div style="font-size:0.68rem;font-weight:800;color:#9a3412;font-family:monospace;text-transform:uppercase;">Hydrostatic</div>
                        <div style="font-size:0.88rem;font-weight:900;color:#c2410c;margin-top:2px;">20,000mm</div>
                      </div>
                      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 10px;">
                        <div style="font-size:0.68rem;font-weight:800;color:#9a3412;font-family:monospace;text-transform:uppercase;">Packweight</div>
                        <div style="font-size:0.88rem;font-weight:900;color:#059669;margin-top:2px;">380g Feather</div>
                      </div>
                    </div>

                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:0.78rem;margin-bottom:16px;">
                      <div style="color:#0f172a;font-weight:700;">${esc(p.material)}</div>
                      <div style="color:#64748b;font-size:0.75rem;margin-top:2px;">${esc(p.dimensions)}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #fed7aa;">
                      <span style="font-size:0.78rem;color:#64748b;">MOQ: <strong style="color:#c2410c;">${esc(p.moq)}</strong></span>
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.82rem;font-weight:800;color:#ea580c;">
                        Inspect Dossier ↗
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
      // BESPOKE VELOCITY WIND-TUNNEL WORKSTATION & ASYMMETRIC BENTO TELEMETRY GRID
      const flagship = products[0] || heroProduct;
      const bentoProducts = products.length > 1 ? products.slice(1) : products;

      mainHtml = `
        <main class="sports-main" data-wr-page="catalog" style="background:#ffffff;color:#0f172a;min-height:80vh;padding:40px 0 80px;">
          <div class="wrap" style="padding:0 24px;">

            <!-- Top Velocity Telemetry Status Bar -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:12px 22px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;box-shadow:0 2px 10px rgba(22,163,74,0.04);">
              <div style="display:flex;align-items:center;gap:12px;font-family:monospace;font-size:0.75rem;font-weight:800;color:#15803d;letter-spacing:0.04em;">
                <span style="width:9px;height:9px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.2);display:inline-block;"></span>
                <span>WIND-TUNNEL AIRSPEED: 14.2 M/S // FLOW REGIME: LAMINAR · CdA 0.218 M² · 82.4% PEBA REBOUND</span>
              </div>
              <div style="display:flex;gap:10px;font-family:monospace;font-size:0.72rem;">
                <span style="background:#ffffff;border:1px solid #bbf7d0;padding:3px 8px;border-radius:6px;color:#15803d;font-weight:700;">1000 FPS VICON CAPTURE</span>
                <span style="background:#ffffff;border:1px solid #bbf7d0;padding:3px 8px;border-radius:6px;color:#15803d;font-weight:700;">WA RULE 5 COMPLIANT</span>
              </div>
            </div>

            <!-- Flagship Hero Velocity Showcase (55/45 Split Layout) -->
            <article data-wr-product-id="${esc(flagship.id)}" style="background:#ffffff;border:1px solid #bbf7d0;border-radius:24px;overflow:hidden;margin-bottom:44px;box-shadow:0 12px 36px rgba(22,163,74,0.06);">
              <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:0;align-items:stretch;">
                
                <!-- 55% Left: Wind-Tunnel Viewport Frame with HUD Reticle & Slow-Mo Playhead -->
                <div style="background:#f8fafc;padding:36px;display:flex;flex-direction:column;justify-content:space-between;position:relative;border-right:1px solid #bbf7d0;background-image:linear-gradient(to right, rgba(187,247,208,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(187,247,208,0.3) 1px, transparent 1px);background-size:24px 24px;">
                  
                  <!-- Viewport Top Telemetry Stream -->
                  <div style="display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;margin-bottom:20px;">
                    <span style="background:#ffffff;border:1px solid #bbf7d0;padding:3px 10px;border-radius:6px;">
                      FLAGSHIP PROPULSION // FLEET-01
                    </span>
                    <span style="background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:6px;border:1px solid #bbf7d0;">
                      DRAG COEFFICIENT: CdA 0.218
                    </span>
                  </div>

                  <!-- Centered Product Image with Laser Reticle -->
                  <a href="${path('products/' + flagship.id + '/index.html')}" ${navAttrs('detail', flagship.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;padding:20px 0;position:relative;">
                    <img src="${esc(flagship.img)}" alt="${esc(flagship.name)}" loading="lazy" style="max-width:85%;max-height:300px;object-fit:contain;filter:drop-shadow(0 16px 24px rgba(22,163,74,0.12));transition:transform 0.3s ease;">
                    <span style="position:absolute;top:0;left:0;background:#ffffff;border:1px solid #bbf7d0;color:#15803d;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                      ${esc(flagship.badge)}
                    </span>
                  </a>

                  <!-- Slow-Motion Video Timeline Scrubber Bar -->
                  <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;font-family:monospace;font-size:0.72rem;">
                    <div style="display:flex;align-items:center;gap:8px;color:#15803d;font-weight:800;">
                      <span style="width:8px;height:8px;border-radius:2px;background:#16a34a;"></span>
                      <span>PHANTOM 1000 FPS REPLAY</span>
                    </div>
                    <span style="color:#64748b;font-weight:700;">TIMECODE: 00:01:24.08</span>
                    <span style="color:#16a34a;font-weight:800;">REACTION: 18MS</span>
                  </div>
                </div>

                <!-- 45% Right: Flagship Kinematic Telemetry & Sourcing Brief -->
                <div style="padding:40px;display:flex;flex-direction:column;justify-content:space-between;background:#ffffff;">
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                      <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:3px 8px;border-radius:6px;">
                        ${esc(flagship.categoryNameEn)}
                      </span>
                      <span style="font-size:0.75rem;color:#64748b;font-weight:700;">
                        SUB-2:00 MARATHON PACING SPEC
                      </span>
                    </div>

                    <h2 style="font-size:clamp(1.6rem, 2.5vw, 2.2rem);font-weight:900;color:#0f172a;margin:0 0 14px;line-height:1.2;letter-spacing:-0.03em;">
                      <a href="${path('products/' + flagship.id + '/index.html')}" ${navAttrs('detail', flagship.id)} style="text-decoration:none;color:#0f172a;">
                        ${esc(flagship.name)}
                      </a>
                    </h2>

                    <p style="font-size:0.92rem;color:#475569;line-height:1.7;margin:0 0 24px;">
                      ${esc(flagship.desc)}
                    </p>

                    <!-- Tri-Metric Telemetry Dial Cluster -->
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:24px;">
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 10px;text-align:center;">
                        <div style="font-size:0.68rem;font-family:monospace;font-weight:800;color:#15803d;text-transform:uppercase;">Rebound</div>
                        <div style="font-size:1.15rem;font-weight:900;color:#16a34a;margin-top:2px;">82.4%</div>
                        <div style="font-size:0.68rem;color:#64748b;">PEBA Autoclave</div>
                      </div>
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 10px;text-align:center;">
                        <div style="font-size:0.68rem;font-family:monospace;font-weight:800;color:#15803d;text-transform:uppercase;">Economy</div>
                        <div style="font-size:1.15rem;font-weight:900;color:#059669;margin-top:2px;">-3.8%</div>
                        <div style="font-size:0.68rem;color:#64748b;">VO₂ Oxygen Cost</div>
                      </div>
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 10px;text-align:center;">
                        <div style="font-size:0.68rem;font-family:monospace;font-weight:800;color:#15803d;text-transform:uppercase;">Rule 5 Limit</div>
                        <div style="font-size:1.15rem;font-weight:900;color:#0f172a;margin-top:2px;">39.5mm</div>
                        <div style="font-size:0.68rem;color:#64748b;">WA Legal Stack</div>
                      </div>
                    </div>

                    <!-- Material & Dimensions Strip -->
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;font-size:0.8rem;margin-bottom:24px;">
                      <div style="display:flex;justify-content:space-between;color:#0f172a;font-weight:700;margin-bottom:4px;">
                        <span>Compound: ${esc(flagship.material)}</span>
                        <span style="color:#15803d;">3K Full Carbon Spoon</span>
                      </div>
                      <div style="color:#64748b;font-size:0.75rem;">
                        Dimensions: ${esc(flagship.dimensions)} · Pro Team Fleet Available
                      </div>
                    </div>
                  </div>

                  <!-- Action Terminal -->
                  <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #bbf7d0;padding-top:18px;">
                    <div style="font-size:0.82rem;color:#64748b;">
                      Fleet MOQ: <strong style="color:#0f172a;font-weight:800;">${esc(flagship.moq)}</strong>
                    </div>
                    <a href="${path('products/' + flagship.id + '/index.html')}" ${navAttrs('detail', flagship.id)} style="text-decoration:none;padding:12px 22px;border-radius:10px;background:linear-gradient(135deg, #16a34a 0%, #22c55e 100%);color:#ffffff;font-size:0.88rem;font-weight:800;box-shadow:0 4px 16px rgba(22,163,74,0.25);">
                      Inspect Wind-Tunnel Telemetry ↗
                    </a>
                  </div>
                </div>
              </div>
            </article>

            <!-- Pace-Band Speed Classification Rail -->
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:32px;padding-bottom:18px;border-bottom:1px solid #bbf7d0;">
              <div>
                <span style="font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;letter-spacing:0.08em;text-transform:uppercase;">
                  [VELOCITY TELEMETRY RAILS]
                </span>
                <h3 style="font-size:1.3rem;font-weight:900;color:#0f172a;margin:2px 0 0;">
                  Aerodynamic Propulsion Fleet
                </h3>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:0.75rem;font-family:monospace;font-weight:800;">
                <span style="padding:6px 14px;border-radius:8px;background:#16a34a;color:#ffffff;">
                  [SUB-2:00 PACE: 21.1+ KM/H]
                </span>
                <span style="padding:6px 14px;border-radius:8px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;">
                  [ELITE 10K: 23.5+ KM/H]
                </span>
                <span style="padding:6px 14px;border-radius:8px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;">
                  [TIME-TRIAL: 45+ KM/H]
                </span>
                <span style="padding:6px 14px;border-radius:8px;background:#ffffff;color:#64748b;border:1px solid #e2e8f0;">
                  [ALL FLEET (${products.length})]
                </span>
              </div>
            </div>

            <!-- Asymmetric Staggered Telemetry Bento Grid -->
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:24px;">
              ${bentoProducts.map((p, idx) => {
                const layoutType = idx % 4;

                if (layoutType === 0) {
                  // CARD TYPE A: WIDE 8-COLUMN CFD PRESSURE HEATMAP CARD
                  return `
                    <article data-wr-product-id="${esc(p.id)}" style="grid-column:span 8;background:#ffffff;border:1px solid #bbf7d0;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(22,163,74,0.04);display:grid;grid-template-columns:1fr 1.2fr;align-items:stretch;">
                      <div style="background:#f8fafc;padding:24px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid #bbf7d0;position:relative;">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.7rem;font-weight:800;color:#15803d;">
                          <span>SPEED-0${idx + 2} // CFD MESH</span>
                          <span style="background:#ecfdf5;padding:2px 6px;border-radius:4px;border:1px solid #a7f3d0;">CdA 0.218</span>
                        </div>
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;padding:16px 0;">
                          <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="max-width:85%;max-height:180px;object-fit:contain;">
                        </a>
                        <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;display:flex;justify-content:space-between;font-family:monospace;font-size:0.68rem;color:#15803d;font-weight:700;">
                          <span>PRESSURE: 420 KPA</span>
                          <span>SPRING: 48 N/MM</span>
                        </div>
                      </div>
                      <div style="padding:28px;display:flex;flex-direction:column;justify-content:space-between;">
                        <div>
                          <span style="font-size:0.72rem;color:#15803d;font-weight:800;font-family:monospace;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                          <h4 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:6px 0 10px;">
                            <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                          </h4>
                          <p style="font-size:0.84rem;color:#475569;line-height:1.6;margin:0 0 16px;">${esc(p.desc)}</p>
                          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;">
                              <div style="font-size:0.65rem;color:#15803d;font-family:monospace;font-weight:800;">ENERGY RETURN</div>
                              <div style="font-size:0.95rem;font-weight:900;color:#16a34a;">82.4% PEBA</div>
                            </div>
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;">
                              <div style="font-size:0.65rem;color:#15803d;font-family:monospace;font-weight:800;">METABOLIC SAVING</div>
                              <div style="font-size:0.95rem;font-weight:900;color:#059669;">-3.8% VO₂</div>
                            </div>
                          </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #bbf7d0;">
                          <span style="font-size:0.78rem;color:#64748b;">MOQ: <strong style="color:#0f172a;">${esc(p.moq)}</strong></span>
                          <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.82rem;font-weight:800;color:#16a34a;">
                            Inspect Telemetry ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  `;
                } else if (layoutType === 1) {
                  // CARD TYPE B: VERTICAL 4-COLUMN AERO TOWER
                  return `
                    <article data-wr-product-id="${esc(p.id)}" style="grid-column:span 4;background:#ffffff;border:1px solid #bbf7d0;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(22,163,74,0.04);display:flex;flex-direction:column;justify-content:space-between;">
                      <div style="background:#f0fdf4;padding:12px 16px;border-bottom:1px solid #bbf7d0;display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.7rem;font-weight:800;color:#15803d;">
                        <span>AERO-TOWER // 3K SPOON</span>
                        <span style="background:#ffffff;padding:2px 6px;border-radius:4px;border:1px solid #bbf7d0;">WA LEGAL</span>
                      </div>
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;background:#f8fafc;display:flex;align-items:center;justify-content:center;padding:24px 16px;border-bottom:1px solid #bbf7d0;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="max-width:82%;max-height:160px;object-fit:contain;">
                      </a>
                      <div style="padding:22px;display:flex;flex-direction:column;flex-grow:1;justify-content:space-between;">
                        <div>
                          <span style="font-size:0.7rem;color:#15803d;font-weight:800;font-family:monospace;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                          <h4 style="font-size:1.1rem;font-weight:900;color:#0f172a;margin:4px 0 8px;">
                            <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                          </h4>
                          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:0.75rem;font-family:monospace;color:#15803d;">
                            <div>SPRING RIGIDITY: 62 N/MM</div>
                            <div style="color:#64748b;font-size:0.7rem;margin-top:2px;">${esc(p.material)}</div>
                          </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #bbf7d0;">
                          <span style="font-size:0.75rem;color:#64748b;">MOQ: <strong style="color:#0f172a;">${esc(p.moq)}</strong></span>
                          <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.8rem;font-weight:800;color:#16a34a;">
                            Inspect ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  `;
                } else if (layoutType === 2) {
                  // CARD TYPE C: 4-COLUMN WAVEFORM TELEMETRY CARD
                  return `
                    <article data-wr-product-id="${esc(p.id)}" style="grid-column:span 4;background:#ffffff;border:1px solid #bbf7d0;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(22,163,74,0.04);display:flex;flex-direction:column;justify-content:space-between;">
                      <div style="background:#f0fdf4;padding:12px 16px;border-bottom:1px solid #bbf7d0;display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.7rem;font-weight:800;color:#15803d;">
                        <span>KINETIC-WAVE // 162MS</span>
                        <span style="background:#ecfdf5;padding:2px 6px;border-radius:4px;border:1px solid #a7f3d0;">GCT DAMPING</span>
                      </div>
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;background:#f8fafc;display:flex;align-items:center;justify-content:center;padding:24px 16px;border-bottom:1px solid #bbf7d0;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="max-width:82%;max-height:160px;object-fit:contain;">
                      </a>
                      <div style="padding:22px;display:flex;flex-direction:column;flex-grow:1;justify-content:space-between;">
                        <div>
                          <span style="font-size:0.7rem;color:#15803d;font-weight:800;font-family:monospace;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                          <h4 style="font-size:1.1rem;font-weight:900;color:#0f172a;margin:4px 0 8px;">
                            <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                          </h4>
                          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:0.75rem;font-family:monospace;color:#15803d;">
                            <div>CADENCE: 194 STRIDES/MIN</div>
                            <div style="color:#64748b;font-size:0.7rem;margin-top:2px;">${esc(p.dimensions)}</div>
                          </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #bbf7d0;">
                          <span style="font-size:0.75rem;color:#64748b;">MOQ: <strong style="color:#0f172a;">${esc(p.moq)}</strong></span>
                          <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.8rem;font-weight:800;color:#16a34a;">
                            Inspect ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  `;
                } else {
                  // CARD TYPE D: WIDE 8-COLUMN SPRINT ACCELERATION SLAB
                  return `
                    <article data-wr-product-id="${esc(p.id)}" style="grid-column:span 8;background:#ffffff;border:1px solid #bbf7d0;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(22,163,74,0.04);display:grid;grid-template-columns:1fr 1.2fr;align-items:stretch;">
                      <div style="background:#f8fafc;padding:24px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid #bbf7d0;position:relative;">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.7rem;font-weight:800;color:#15803d;">
                          <span>SPRINT-LAUNCH // 3.4 M/S</span>
                          <span style="background:#ecfdf5;padding:2px 6px;border-radius:4px;border:1px solid #a7f3d0;">MAX TRACTION</span>
                        </div>
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;padding:16px 0;">
                          <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="max-width:85%;max-height:180px;object-fit:contain;">
                        </a>
                        <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;display:flex;justify-content:space-between;font-family:monospace;font-size:0.68rem;color:#15803d;font-weight:700;">
                          <span>DIN ABRASION: &lt; 65 MM³</span>
                          <span>RUBBER CoF: 0.88</span>
                        </div>
                      </div>
                      <div style="padding:28px;display:flex;flex-direction:column;justify-content:space-between;">
                        <div>
                          <span style="font-size:0.72rem;color:#15803d;font-weight:800;font-family:monospace;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                          <h4 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:6px 0 10px;">
                            <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                          </h4>
                          <p style="font-size:0.84rem;color:#475569;line-height:1.6;margin:0 0 16px;">${esc(p.desc)}</p>
                          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;">
                              <div style="font-size:0.65rem;color:#15803d;font-family:monospace;font-weight:800;">SUPERCRITICAL PEBA</div>
                              <div style="font-size:0.95rem;font-weight:900;color:#16a34a;">0.12 G/CM³</div>
                            </div>
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;">
                              <div style="font-size:0.65rem;color:#15803d;font-family:monospace;font-weight:800;">WA CERTIFICATION</div>
                              <div style="font-size:0.95rem;font-weight:900;color:#059669;">Rule 5 Legal</div>
                            </div>
                          </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #bbf7d0;">
                          <span style="font-size:0.78rem;color:#64748b;">MOQ: <strong style="color:#0f172a;">${esc(p.moq)}</strong></span>
                          <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.82rem;font-weight:800;color:#16a34a;">
                            Inspect Telemetry ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  `;
                }
              }).join('')}
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'detail') {
    const p = products.find(item => item.id === ctx.options.productId) || heroProduct;
    if (!isVideo) {
      // 3-TIER ALPINE EXPEDITION DOSSIER & HIGH-ALTITUDE OUTFITTING STATION
      mainHtml = `
        <main class="sports-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 80px;">
          <div class="wrap" style="padding:0 24px;">

            <!-- Tier 1: High-Altitude Terrain Breadcrumb & Guide Badges -->
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:32px;padding-bottom:18px;border-bottom:1px solid #fed7aa;">
              <div style="display:flex;align-items:center;gap:10px;font-family:monospace;font-size:0.82rem;">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#c2410c;text-decoration:none;font-weight:800;">
                  ← SUMMIT_RADAR // EXPEDITION_GEAR_DECK
                </a>
                <span style="color:#cbd5e1;">/</span>
                <span style="color:#64748b;font-weight:700;">${esc(p.id).toUpperCase()}</span>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <span style="padding:5px 12px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-size:0.75rem;font-weight:800;font-family:monospace;">
                  UIAGM MOUNTAIN GUIDE CERTIFIED
                </span>
                <span style="padding:5px 12px;border-radius:6px;background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;font-size:0.75rem;font-weight:800;font-family:monospace;">
                  20,000MM HYDROSTATIC HEAD
                </span>
              </div>
            </div>

            <!-- Tier 2: Two-Column Technical Viewport & Fleet Sourcing Matrix -->
            <div style="display:grid;grid-template-columns:minmax(340px, 1.1fr) minmax(360px, 1.35fr);gap:44px;align-items:start;margin-bottom:50px;">
              <!-- Left Column: Viewport & Environmental Stress Benchmarks -->
              <div>
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(234,88,12,0.06);">
                  <!-- Viewport Top Telemetry Header -->
                  <div style="background:#fff7ed;padding:12px 18px;border-bottom:1px solid #fed7aa;display:flex;align-items:center;justify-content:space-between;font-family:monospace;font-size:0.75rem;font-weight:800;">
                    <span style="color:#c2410c;">ALTITUDE: 4,000M+ MONT BLANC // WIND: 80 KM/H</span>
                    <span style="color:#059669;background:#ecfdf5;padding:2px 8px;border-radius:4px;border:1px solid #a7f3d0;">SUMMIT READY</span>
                  </div>

                  <div style="padding:36px;text-align:center;position:relative;background:#ffffff;background-image:radial-gradient(#fed7aa 1px, transparent 1px);background-size:20px 20px;">
                    <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" data-wr-material-image="product-main" data-wr-material-product="${esc(p.id)}" style="width:100%;max-height:420px;object-fit:contain;display:inline-block;" fetchpriority="high">
                    <span style="position:absolute;top:16px;right:16px;background:#ffffff;border:1px solid #fed7aa;color:#c2410c;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                      ${esc(p.badge)}
                    </span>
                  </div>

                  <!-- Inspection Channel Thumbnails -->
                  <div class="wr-detail-thumbs" style="padding:14px 20px;background:#fafaf9;border-top:1px solid #fed7aa;display:flex;align-items:center;gap:12px;justify-content:center;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid #ea580c;border-radius:8px;padding:3px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;">
                    </button>
                    <div style="display:flex;gap:8px;">
                      <span style="font-size:0.7rem;font-family:monospace;padding:4px 8px;border-radius:4px;background:#ffffff;border:1px solid #fed7aa;color:#c2410c;font-weight:700;">VIEW-1: GEOMETRY</span>
                      <span style="font-size:0.7rem;font-family:monospace;padding:4px 8px;border-radius:4px;background:#ffffff;border:1px solid #fed7aa;color:#c2410c;font-weight:700;">VIEW-2: 13MM TAPE</span>
                      <span style="font-size:0.7rem;font-family:monospace;padding:4px 8px;border-radius:4px;background:#ffffff;border:1px solid #fed7aa;color:#c2410c;font-weight:700;">VIEW-3: DYNEEMA</span>
                    </div>
                  </div>
                </div>

                <!-- Extreme Environmental Stress & Thermal Benchmark Protocol -->
                <div style="margin-top:24px;background:#ffffff;border:1px solid #fed7aa;border-radius:18px;padding:24px;box-shadow:0 8px 24px rgba(234,88,12,0.04);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid #fed7aa;padding-bottom:10px;">
                    <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#c2410c;letter-spacing:0.06em;text-transform:uppercase;">
                      [ENVIRONMENTAL STRESS BENCHMARK PROTOCOL]
                    </div>
                    <span style="font-size:0.72rem;font-family:monospace;color:#059669;font-weight:800;">PASS EN 343 CLASS 4</span>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:10px;font-size:0.82rem;">
                    <div style="display:flex;justify-content:space-between;padding:10px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">
                      <span style="font-weight:700;color:#0f172a;">Valley Basecamp (1,200m)</span>
                      <span style="color:#c2410c;font-weight:800;font-family:monospace;">15°C · Heavy Rain 50mm/h · 100% Repellent</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">
                      <span style="font-weight:700;color:#0f172a;">Mid-Mountain Bivouac (2,800m)</span>
                      <span style="color:#c2410c;font-weight:800;font-family:monospace;">-5°C · Freezing Sleet · Zero Condensation</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">
                      <span style="font-weight:700;color:#0f172a;">Glacier Col (3,800m)</span>
                      <span style="color:#c2410c;font-weight:800;font-family:monospace;">-20°C · 65 km/h Gale · Wind Chill Shield</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">
                      <span style="font-weight:700;color:#0f172a;">Summit Ridge (4,810m Peak)</span>
                      <span style="color:#059669;font-weight:800;font-family:monospace;">-32°C · 80 km/h Blizzard · 100% Barrier Integrity</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Technical Dossier & Expedition Loadout Matrix -->
              <div>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:#fff7ed;color:#c2410c;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;border:1px solid #fed7aa;">
                  ${esc(p.categoryNameEn)} · High-Alpine Model
                </span>
                <h1 style="font-size:clamp(1.9rem, 3.2vw, 2.7rem);font-weight:900;color:#0f172a;margin:0 0 14px;letter-spacing:-0.03em;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.02rem;color:#475569;line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- 4-Cell High-Altitude Technical Matrix -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;">
                  <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(234,88,12,0.03);">
                    <div style="font-size:0.7rem;font-family:monospace;color:#c2410c;font-weight:800;text-transform:uppercase;">Membrane Architecture</div>
                    <div style="font-size:0.92rem;font-weight:800;color:#0f172a;margin-top:3px;">${esc(p.material)}</div>
                  </div>
                  <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(234,88,12,0.03);">
                    <div style="font-size:0.7rem;font-family:monospace;color:#c2410c;font-weight:800;text-transform:uppercase;">Seam Construction</div>
                    <div style="font-size:0.92rem;font-weight:800;color:#0f172a;margin-top:3px;">100% Heat-Welded 13mm Micro-Tape</div>
                  </div>
                  <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(234,88,12,0.03);">
                    <div style="font-size:0.7rem;font-family:monospace;color:#c2410c;font-weight:800;text-transform:uppercase;">Weatherproof Barrier</div>
                    <div style="font-size:0.92rem;font-weight:800;color:#0f172a;margin-top:3px;">${esc(p.extra)}</div>
                  </div>
                  <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(234,88,12,0.03);">
                    <div style="font-size:0.7rem;font-family:monospace;color:#c2410c;font-weight:800;text-transform:uppercase;">Dimensions / Packweight</div>
                    <div style="font-size:0.92rem;font-weight:800;color:#0f172a;margin-top:3px;">${esc(p.dimensions)}</div>
                  </div>
                </div>

                <!-- Expedition Outfitting & Fleet Volume Calculator -->
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:18px;padding:24px;margin-bottom:24px;box-shadow:0 8px 24px rgba(234,88,12,0.04);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                    <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#c2410c;letter-spacing:0.06em;text-transform:uppercase;">
                      [EXPEDITION FLEET VOLUME TIERS]
                    </div>
                    <span style="font-size:0.75rem;color:#64748b;">Wholesale Outfitting</span>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                    <div style="border:1px solid #fed7aa;border-radius:10px;padding:12px;background:#fff7ed;text-align:center;">
                      <div style="font-size:0.72rem;font-weight:800;color:#9a3412;">Guide Trial Kit</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#0f172a;margin:3px 0;">10 Sets</div>
                      <div style="font-size:0.72rem;color:#78716c;">Immediate dispatch</div>
                    </div>
                    <div style="border:1px solid #fed7aa;border-radius:10px;padding:12px;background:#fff7ed;text-align:center;">
                      <div style="font-size:0.72rem;font-weight:800;color:#9a3412;">Club Fleet Order</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#0f172a;margin:3px 0;">100 Sets</div>
                      <div style="font-size:0.72rem;color:#78716c;">Custom embroidery</div>
                    </div>
                    <div style="border:1px solid #fed7aa;border-radius:10px;padding:12px;background:#fff7ed;text-align:center;">
                      <div style="font-size:0.72rem;font-weight:800;color:#9a3412;">Expedition Supply</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#0f172a;margin:3px 0;">500+ Sets</div>
                      <div style="font-size:0.72rem;color:#78716c;">Regional distributor</div>
                    </div>
                  </div>
                </div>

                <!-- Trade Warranty Bar -->
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:28px;display:flex;align-items:center;gap:12px;">
                  <span style="font-size:1.4rem;">⛰️</span>
                  <div>
                    <div style="font-size:0.85rem;font-weight:800;color:#0f172a;">Lifetime Alpine Craftsmanship Guarantee</div>
                    <div style="font-size:0.78rem;color:#64748b;margin-top:2px;">Free field patch service and ultrasonic seam re-lamination for certified alpine expeditions.</div>
                  </div>
                </div>

                <!-- Action Button Cluster -->
                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 30px;border-radius:10px;background:linear-gradient(135deg, #ea580c 0%, #f97316 100%);color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px rgba(234,88,12,0.25);">
                    Request Expedition Outfitting Tender ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 24px;border-radius:10px;background:#ffffff;color:#0f172a;border:1px solid #fed7aa;font-size:0.92rem;font-weight:800;">
                    Return to Gear Wall
                  </a>
                </div>
              </div>
            </div>

            <!-- Tier 3: 4-Stage High-Alpine Validation & Testing Pipeline Ribbon -->
            <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;padding:28px;box-shadow:0 8px 24px rgba(234,88,12,0.04);">
              <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#c2410c;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                [ALPINE EXPEDITION VALIDATION &amp; CERTIFICATION PIPELINE]
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="border-left:3px solid #ea580c;padding-left:14px;">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#c2410c;">STAGE 01 // WEAVE</div>
                  <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin:4px 0 2px;">Dyneema Fiber Weaving</div>
                  <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">UHMWPE cross-ply bonded with breathable ePTFE membranes.</div>
                </div>
                <div style="border-left:3px solid #ea580c;padding-left:14px;">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#c2410c;">STAGE 02 // SEAM</div>
                  <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin:4px 0 2px;">13mm Ultrasonic Seam Welding</div>
                  <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Zero needle perforations with 100% waterproof micro-tape lamination.</div>
                </div>
                <div style="border-left:3px solid #ea580c;padding-left:14px;">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#c2410c;">STAGE 03 // CHAMBER</div>
                  <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin:4px 0 2px;">Rain Tower Blizzard Chamber</div>
                  <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Subjected to 450 L/m²/h simulated deluge for 24 continuous hours.</div>
                </div>
                <div style="border-left:3px solid #ea580c;padding-left:14px;">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#c2410c;">STAGE 04 // CHAMONIX</div>
                  <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin:4px 0 2px;">UIAGM Field Certification</div>
                  <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Worn across Mont Blanc and Matterhorn north face winter ascents.</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      `;
    } else {
      // BESPOKE CENTER-STAGE CINEMATIC WIND-TUNNEL CHAMBER & DUAL TELEMETRY COCKPIT
      mainHtml = `
        <main class="sports-main" data-wr-page="detail" style="background:#ffffff;color:#0f172a;min-height:80vh;padding:36px 0 80px;">
          <div class="wrap" style="padding:0 24px;">

            <!-- Velocity Command Nav & Compliance HUD -->
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid #bbf7d0;">
              <div style="display:flex;align-items:center;gap:10px;font-family:monospace;font-size:0.82rem;">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#15803d;text-decoration:none;font-weight:800;">
                  ← KINETIX_COMMAND // PROPULSION_FLEET
                </a>
                <span style="color:#cbd5e1;">/</span>
                <span style="color:#64748b;font-weight:700;">TELEMETRY_CHAMBER // ${esc(p.id).toUpperCase()}</span>
              </div>
              <div style="display:flex;gap:10px;font-family:monospace;font-size:0.75rem;">
                <span style="padding:4px 12px;border-radius:6px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-weight:800;">
                  WORLD ATHLETICS RULE 5 APPROVED
                </span>
                <span style="padding:4px 12px;border-radius:6px;background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;font-weight:800;">
                  CdA 0.218 TESTED
                </span>
              </div>
            </div>

            <!-- CENTER-STAGE 1: CINEMATIC WIND-TUNNEL TELEMETRY CHAMBER (FULL-WIDTH HERO DECK) -->
            <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:24px;overflow:hidden;box-shadow:0 12px 36px rgba(22,163,74,0.06);margin-bottom:40px;">
              
              <!-- Chamber Command HUD Bar -->
              <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;font-family:monospace;font-size:0.75rem;font-weight:800;">
                <div style="display:flex;align-items:center;gap:10px;color:#15803d;">
                  <span style="width:9px;height:9px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.2);display:inline-block;"></span>
                  <span>WIND-TUNNEL CHAMBER 04 [VELOCITY: 24.5 KM/H // STATIC PRESSURE: 101.3 KPA]</span>
                </div>
                <div style="display:flex;gap:16px;color:#64748b;">
                  <span>AIR DENSITY: 1.204 KG/M³</span>
                  <span style="color:#15803d;">AERODYNAMIC DRAG: 12.4 N</span>
                  <span style="color:#059669;">LAMINAR STABILITY: 99.4%</span>
                </div>
              </div>

              <!-- Main Hero Viewport Area with Centered Product & Laser Grid -->
              <div style="padding:48px 32px;position:relative;display:flex;align-items:center;justify-content:center;min-height:460px;background:#ffffff;background-image:linear-gradient(to right, rgba(187,247,208,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(187,247,208,0.25) 1px, transparent 1px);background-size:32px 32px;">
                
                <!-- Product Badges & Category Header Overlay -->
                <div style="position:absolute;top:20px;left:24px;display:flex;flex-direction:column;gap:6px;">
                  <span style="font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:4px 10px;border-radius:6px;letter-spacing:0.06em;text-transform:uppercase;">
                    ${esc(p.categoryNameEn)} // ELITE MARATHON
                  </span>
                  <h1 style="font-size:clamp(1.6rem, 2.6vw, 2.4rem);font-weight:900;color:#0f172a;margin:4px 0 0;letter-spacing:-0.03em;">
                    ${esc(p.name)}
                  </h1>
                </div>

                <span style="position:absolute;top:20px;right:24px;background:#ffffff;border:1px solid #bbf7d0;color:#15803d;font-size:0.75rem;font-weight:800;padding:6px 12px;border-radius:8px;font-family:monospace;box-shadow:0 2px 8px rgba(22,163,74,0.08);">
                  ${esc(p.badge)}
                </span>

                <!-- Central Main Image with Contract Attributes -->
                <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" data-wr-material-image="product-main" data-wr-material-product="${esc(p.id)}" style="max-width:540px;width:100%;max-height:400px;object-fit:contain;filter:drop-shadow(0 20px 30px rgba(22,163,74,0.15));" fetchpriority="high">
              </div>

              <!-- High-Speed Camera Selection Deck & Slow-Motion Playhead Strip -->
              <div class="wr-detail-thumbs" style="background:#f8fafc;border-top:1px solid #bbf7d0;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
                <div style="display:flex;align-items:center;gap:14px;">
                  <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid #16a34a;border-radius:10px;padding:3px;background:#ffffff;cursor:pointer;box-shadow:0 2px 6px rgba(22,163,74,0.15);">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:52px;height:52px;object-fit:cover;border-radius:6px;">
                  </button>
                  <div style="display:flex;gap:10px;font-family:monospace;font-size:0.72rem;">
                    <span style="padding:6px 12px;border-radius:6px;background:#ffffff;border:1px solid #bbf7d0;color:#15803d;font-weight:800;">
                      CAM-01: FOREFOOT IMPACT [1000 FPS]
                    </span>
                    <span style="padding:6px 12px;border-radius:6px;background:#ffffff;border:1px solid #bbf7d0;color:#15803d;font-weight:800;">
                      CAM-02: 3K CARBON TORSION [500 FPS]
                    </span>
                    <span style="padding:6px 12px;border-radius:6px;background:#ffffff;border:1px solid #bbf7d0;color:#15803d;font-weight:800;">
                      CAM-03: PEBA COMPRESSION [250 FPS]
                    </span>
                  </div>
                </div>

                <div style="font-family:monospace;font-size:0.75rem;color:#15803d;font-weight:800;background:#ffffff;border:1px solid #bbf7d0;padding:6px 14px;border-radius:8px;">
                  [SLOW-MO PLAYBACK: 0.12X] TIMECODE: 00:01:24.08
                </div>
              </div>
            </div>

            <!-- DUAL TELEMETRY CONSOLES (50 / 50 HORIZON SPLIT) -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start;margin-bottom:44px;">
              
              <!-- Left Console: Plantar Kinetic Force & Gait Biomechanics Cockpit -->
              <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:22px;padding:32px;box-shadow:0 8px 24px rgba(22,163,74,0.04);">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #bbf7d0;padding-bottom:14px;margin-bottom:20px;">
                  <div>
                    <span style="font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;letter-spacing:0.08em;text-transform:uppercase;">
                      [BIOMECHANICAL TELEMETRY DECK]
                    </span>
                    <h3 style="font-size:1.25rem;font-weight:900;color:#0f172a;margin:2px 0 0;">
                      Plantar Pressure &amp; Gait Stride Kinetics
                    </h3>
                  </div>
                  <span style="font-size:0.72rem;font-family:monospace;padding:3px 8px;border-radius:6px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-weight:800;">
                    VICON CERTIFIED
                  </span>
                </div>

                <!-- 4 Gait Kinetic Phases with Metric Meters -->
                <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:24px;">
                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">
                      <span>0% Initial Strike (Midfoot Deceleration)</span>
                      <span style="font-family:monospace;color:#15803d;">18ms Damping</span>
                    </div>
                    <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;margin-bottom:6px;">
                      <div style="width:72%;height:100%;background:#16a34a;border-radius:3px;"></div>
                    </div>
                    <div style="font-size:0.75rem;color:#64748b;">
                      Peak impact force: 1,850 N absorbed via supercritical nitrogen closed-cell expansion.
                    </div>
                  </div>

                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">
                      <span>35% Mid-Stance Carbon Torsion Loading</span>
                      <span style="font-family:monospace;color:#15803d;">48 N/mm Pre-Load</span>
                    </div>
                    <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;margin-bottom:6px;">
                      <div style="width:88%;height:100%;background:#16a34a;border-radius:3px;"></div>
                    </div>
                    <div style="font-size:0.75rem;color:#64748b;">
                      3K spoon plate deflection stores 42 Joules of mechanical stride energy.
                    </div>
                  </div>

                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">
                      <span>65% Forefoot Rebound &amp; Energy Delivery</span>
                      <span style="font-family:monospace;color:#15803d;">82.4% PEBA Return</span>
                    </div>
                    <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;margin-bottom:6px;">
                      <div style="width:94%;height:100%;background:#16a34a;border-radius:3px;"></div>
                    </div>
                    <div style="font-size:0.75rem;color:#64748b;">
                      Dynamic resilience profile provides 18.4% higher energy return than standard race EVA.
                    </div>
                  </div>

                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">
                      <span>100% Terminal Toe-Off Explosive Launch</span>
                      <span style="font-family:monospace;color:#059669;">3.4 m/s Recoil</span>
                    </div>
                    <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;margin-bottom:6px;">
                      <div style="width:96%;height:100%;background:#059669;border-radius:3px;"></div>
                    </div>
                    <div style="font-size:0.75rem;color:#64748b;">
                      Metabolic oxygen cost reduced by -3.8% across full 42.195 km marathon distance.
                    </div>
                  </div>
                </div>

                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px;">
                  <span style="font-size:1.4rem;">🔬</span>
                  <div style="font-size:0.78rem;color:#15803d;line-height:1.5;">
                    Kinetic data validated across 20 elite collegiate marathoners over 10,000 continuous test strides on Bertec instrumented force plates.
                  </div>
                </div>
              </div>

              <!-- Right Console: Team Fleet Sourcing & Production Scale Configurator -->
              <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:22px;padding:32px;box-shadow:0 8px 24px rgba(22,163,74,0.04);">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #bbf7d0;padding-bottom:14px;margin-bottom:20px;">
                  <div>
                    <span style="font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;letter-spacing:0.08em;text-transform:uppercase;">
                      [FLEET SOURCING CONFIGURATOR]
                    </span>
                    <h3 style="font-size:1.25rem;font-weight:900;color:#0f172a;margin:2px 0 0;">
                      OEM Production &amp; Team Livery
                    </h3>
                  </div>
                  <span style="font-size:0.72rem;font-family:monospace;padding:3px 8px;border-radius:6px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-weight:800;">
                    WA RULE 5 VERIFIED
                  </span>
                </div>

                <p style="font-size:0.9rem;color:#475569;line-height:1.65;margin:0 0 20px;">
                  ${esc(p.desc)}
                </p>

                <!-- 4-Cell Engineering Matrix -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:10px;padding:12px;">
                    <div style="font-size:0.68rem;font-family:monospace;color:#15803d;font-weight:800;">MIDSOLE COMPOUND</div>
                    <div style="font-size:0.88rem;font-weight:800;color:#0f172a;margin-top:2px;">${esc(p.material)}</div>
                  </div>
                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:10px;padding:12px;">
                    <div style="font-size:0.68rem;font-family:monospace;color:#15803d;font-weight:800;">PLATE GEOMETRY</div>
                    <div style="font-size:0.88rem;font-weight:800;color:#0f172a;margin-top:2px;">3K Full Spoon Carbon</div>
                  </div>
                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:10px;padding:12px;">
                    <div style="font-size:0.68rem;font-family:monospace;color:#15803d;font-weight:800;">WA COMPLIANCE</div>
                    <div style="font-size:0.88rem;font-weight:800;color:#0f172a;margin-top:2px;">${esc(p.extra)}</div>
                  </div>
                  <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:10px;padding:12px;">
                    <div style="font-size:0.68rem;font-family:monospace;color:#15803d;font-weight:800;">MASS &amp; DIMENSIONS</div>
                    <div style="font-size:0.88rem;font-weight:800;color:#0f172a;margin-top:2px;">${esc(p.dimensions)}</div>
                  </div>
                </div>

                <!-- Team Fleet Scale Selector -->
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-bottom:24px;">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#15803d;margin-bottom:10px;">
                    FLEET SOURCING TIERS &amp; DISPATCH SLA
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                    <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:8px;padding:10px;text-align:center;">
                      <div style="font-size:0.7rem;font-weight:800;color:#15803d;">Pro Team</div>
                      <div style="font-size:1.1rem;font-weight:900;color:#0f172a;margin:2px 0;">20 Pairs</div>
                      <div style="font-size:0.68rem;color:#64748b;">Fast Track</div>
                    </div>
                    <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:8px;padding:10px;text-align:center;">
                      <div style="font-size:0.7rem;font-weight:800;color:#15803d;">Club Order</div>
                      <div style="font-size:1.1rem;font-weight:900;color:#0f172a;margin:2px 0;">200 Pairs</div>
                      <div style="font-size:0.68rem;color:#64748b;">Team Livery</div>
                    </div>
                    <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:8px;padding:10px;text-align:center;">
                      <div style="font-size:0.7rem;font-weight:800;color:#15803d;">OEM Bulk</div>
                      <div style="font-size:1.1rem;font-weight:900;color:#0f172a;margin:2px 0;">1,000+ Pairs</div>
                      <div style="font-size:0.68rem;color:#64748b;">Custom Tooling</div>
                    </div>
                  </div>
                </div>

                <!-- Action Button Cluster -->
                <div style="display:flex;flex-direction:column;gap:12px;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="display:block;text-align:center;text-decoration:none;padding:16px;border-radius:12px;background:linear-gradient(135deg, #16a34a 0%, #22c55e 100%);color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px rgba(22,163,74,0.25);">
                    Initiate Athletic Team Fleet Tender ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="display:block;text-align:center;text-decoration:none;padding:12px;border-radius:10px;background:#ffffff;color:#0f172a;border:1px solid #bbf7d0;font-size:0.88rem;font-weight:800;">
                    Return to Propulsion Fleet
                  </a>
                </div>
              </div>
            </div>

            <!-- TIER 3: DYNAMIC PROPULSION BENCHMARK COMPARISON STRIP -->
            <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:20px;padding:28px;box-shadow:0 8px 24px rgba(22,163,74,0.04);">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
                <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#15803d;letter-spacing:0.06em;text-transform:uppercase;">
                  [PROPULSION BENCHMARK // PEBA+CARBON VS CONVENTIONAL RACERS]
                </span>
                <span style="font-family:monospace;font-size:0.72rem;color:#64748b;">
                  TESTED UNDER STANDARDIZED INSTRUMENTED TREADMILL CONDITIONS
                </span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;">
                <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#15803d;font-weight:800;">REBOUND RESILIENCE</div>
                  <div style="font-size:1.4rem;font-weight:900;color:#16a34a;margin:4px 0 2px;">+18.4% GAIN</div>
                  <div style="font-size:0.78rem;color:#64748b;">82.4% PEBA vs 64.0% traditional EVA.</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#15803d;font-weight:800;">MASS REDUCTION</div>
                  <div style="font-size:1.4rem;font-weight:900;color:#16a34a;margin:4px 0 2px;">-32G LIGHTER</div>
                  <div style="font-size:0.78rem;color:#64748b;">0.12 g/cm³ density vs 0.22 g/cm³ TPU.</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#15803d;font-weight:800;">METABOLIC ECONOMY</div>
                  <div style="font-size:1.4rem;font-weight:900;color:#059669;margin:4px 0 2px;">-3.8% VO₂ COST</div>
                  <div style="font-size:0.78rem;color:#64748b;">Validated running economy improvement.</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#15803d;font-weight:800;">TORSIONAL STIFFNESS</div>
                  <div style="font-size:1.4rem;font-weight:900;color:#0f172a;margin:4px 0 2px;">3K SPOON</div>
                  <div style="font-size:0.78rem;color:#64748b;">Full longitudinal lever propulsion launch.</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? '16-Camera 3D Motion Analysis & Biomechanics Lab' : 'UIAGM Certified Mountain Guide Field Testing Protocol');
    const paragraphs = getAboutStoryParagraphs(company);
    const images = getAboutImages(ctx);
    const highlights = parseAboutHighlights(company.aboutHighlights, isVideo ? [
      { value: '82.4%', label: 'PEBA Rebound Rate', desc: 'Supercritical nitrogen autoclave expansion' },
      { value: '-3.8%', label: 'VO₂ Metabolic Savings', desc: 'Instrumented treadmill respiration study' },
      { value: '39.5 mm', label: 'World Athletics Legal', desc: 'International competition compliant limit' },
    ] : [
      { value: '20,000mm', label: 'Hydrostatic Waterproof', desc: 'Sustained alpine storm rain defense' },
      { value: '380 Grams', label: 'Featherweight Shell', desc: 'Dyneema composite ultralight packability' },
      { value: '4,000 M', label: 'Glacial Altitude Tested', desc: 'Mont Blanc ridge field validation' },
    ]);
    const primaryImage = images.primary || (isVideo ? getIndustryPlaceholder('sports', 1) : getIndustryPlaceholder('sports', 0));

    if (!isVideo) {
      // SPORTS TRAIL BANNER: ALPINE EXPEDITION FIELD JOURNAL
      mainHtml = `
        <main class="sports-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 100px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;max-width:1200px;margin:0 auto;">
            
            <!-- Mountain Guide Telemetry Log Header -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#ffffff;border:1px solid #fed7aa;border-radius:12px;margin-bottom:36px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.75rem;letter-spacing:0.04em;color:#c2410c;box-shadow:0 2px 8px rgba(234,88,12,0.04);flex-wrap:wrap;gap:12px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ea580c;"></span>
                <strong style="color:#9a3412;">UIAGM EXPEDITION FIELD LOG #842</strong>
              </div>
              <div style="display:flex;gap:18px;align-items:center;font-weight:700;">
                <span>MONT BLANC RIDGE: 4,000M</span>
                <span>TEMP: -14°C</span>
                <span>PRESSURE: 610 HPA</span>
              </div>
            </div>

            <!-- Page Title & Alpine Lead Story -->
            <div style="max-width:880px;margin-bottom:40px;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                High-Altitude Field Testing &amp; Dyneema Composite Weave
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;letter-spacing:-0.03em;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0;">
                ${esc(paragraphs[0] || 'ApexTrail engineers mountaineering gear tested directly alongside certified UIAGM guides across grueling 4,000m glacial ascents where gear failure is not an option.')}
              </p>
            </div>

            <!-- Field Journal Spread -->
            <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:24px;padding:36px;box-shadow:0 12px 36px rgba(234,88,12,0.06);margin-bottom:36px;position:relative;">
              
              <div style="display:grid;grid-template-columns:minmax(320px, 1.2fr) minmax(320px, 1.3fr);gap:44px;align-items:center;">
                
                <!-- Left: Polaroid / Field Expedition Image Frame -->
                <div style="position:relative;background:#fefce8;border:1px solid #fef08a;border-radius:18px;padding:16px;box-shadow:0 8px 24px rgba(234,88,12,0.08);">
                  <div style="border-radius:10px;overflow:hidden;background:#fff;">
                    <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
                  </div>
                  <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;font-size:0.75rem;color:#9a3412;font-weight:700;">
                    <span>LOC: 45°50'01"N 6°51'54"E</span>
                    <span style="background:#ea580c;color:#fff;padding:2px 8px;border-radius:4px;">SUMMIT PASS</span>
                  </div>
                </div>

                <!-- Right: Annotated Expedition Field Log -->
                <div>
                  <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:6px;background:#fff7ed;color:#ea580c;font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;border:1px solid #fed7aa;">
                    Elevation Ascent Profile
                  </div>
                  <h2 style="font-size:1.5rem;font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.3;">
                    Dyneema Weaves &amp; Microporous ePTFE Membranes
                  </h2>
                  <div style="font-size:0.95rem;line-height:1.75;color:#44403c;margin-bottom:24px;">
                    ${paragraphs.length > 1 ? paragraphs.slice(1).map(p => `<p style="margin:0 0 12px;">${esc(p)}</p>`).join('') : `
                      <p style="margin:0 0 12px;">We eliminate unnecessary seams and heavy hardware. Dyneema composite weaves provide 15× the tensile strength of steel at a fraction of the weight, resisting sharp granite abrasion during technical chimney climbs.</p>
                      <p style="margin:0;">Our 3-layer ePTFE laminates maintain 20,000mm hydrostatic resistance while expelling moisture vapor under intense high-output alpine ascents.</p>
                    `}
                  </div>

                  <!-- Route Elevation Stepper -->
                  <div style="display:flex;justify-content:space-between;align-items:center;background:#fff7ed;border:1px solid #ffedd5;border-radius:12px;padding:12px 18px;font-family:ui-monospace,monospace;font-size:0.75rem;color:#9a3412;font-weight:700;flex-wrap:wrap;gap:8px;">
                    <span>Base: 1,200m</span>
                    <span>→</span>
                    <span>Refuge: 2,800m</span>
                    <span>→</span>
                    <span>Col: 3,842m</span>
                    <span>→</span>
                    <strong style="color:#ea580c;">Summit: 4,810m</strong>
                  </div>
                </div>

              </div>
            </div>

            <!-- Gram-Scale Highlights Strips -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:24px;">
              ${highlights.map(h => `
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:18px;padding:26px;box-shadow:0 4px 16px rgba(234,88,12,0.03);position:relative;">
                  <div style="font-size:2.2rem;font-weight:900;color:#ea580c;margin-bottom:6px;line-height:1;letter-spacing:-0.03em;">${esc(h.value)}</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">${esc(h.label)}</div>
                  <div style="font-size:0.8rem;color:#78716c;line-height:1.5;">${esc(h.desc || '')}</div>
                </div>
              `).join('')}
            </div>

          </div>
        </main>
      `;
    } else {
      // SPORTS KINETIC VIDEO: BIOMECHANICS LAB COCKPIT
      mainHtml = `
        <main class="sports-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 100px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;max-width:1200px;margin:0 auto;">
            
            <!-- Vicon Motion Capture Telemetry Bar -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 24px;background:#ffffff;border:1px solid #bbf7d0;border-radius:14px;margin-bottom:36px;font-family:ui-monospace,monospace;font-size:0.75rem;letter-spacing:0.04em;color:#15803d;box-shadow:0 4px 12px rgba(22,163,74,0.04);flex-wrap:wrap;gap:12px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.2);"></span>
                <strong style="color:#14532d;">VICON 250 FPS MOTION LAB: ACTIVE</strong>
              </div>
              <div style="display:flex;gap:20px;align-items:center;font-weight:700;">
                <span>REBOUND: 82.4% PEBA</span>
                <span>METABOLIC VO₂: -3.8%</span>
                <span>STACK: 39.5MM COMPLIANT</span>
              </div>
            </div>

            <!-- Page Title & Biomechanics Narrative -->
            <div style="max-width:880px;margin-bottom:40px;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Supercritical PEBA Midsole &amp; Carbon Spoon Kinetics
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;letter-spacing:-0.03em;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0;">
                ${esc(paragraphs[0] || 'Kinetix operates an instrumented running kinetics facility utilizing 16-camera Vicon 3D motion capture and Bertec force plates to engineer maximum racing energy return.')}
              </p>
            </div>

            <!-- Motion Tracking Cockpit Viewport -->
            <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:24px;padding:36px;box-shadow:0 12px 36px rgba(22,163,74,0.06);margin-bottom:36px;position:relative;">
              
              <div style="display:grid;grid-template-columns:minmax(320px, 1.2fr) minmax(320px, 1.3fr);gap:44px;align-items:center;">
                
                <!-- Left: Reticle Framed Motion Capture Frame -->
                <div style="position:relative;">
                  <div style="border-radius:18px;overflow:hidden;border:2px solid #86efac;box-shadow:0 12px 30px rgba(22,163,74,0.08);background:#000;">
                    <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
                  </div>
                  <!-- Plantar Zones Floating Pill -->
                  <div style="position:absolute;bottom:16px;left:16px;right:16px;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border:1px solid #bbf7d0;border-radius:12px;padding:10px 14px;display:flex;justify-content:space-between;font-family:ui-monospace,monospace;font-size:0.72rem;font-weight:700;color:#15803d;">
                    <span>HEEL: 14%</span>
                    <span>MIDFOOT: 32%</span>
                    <span>SPRING: 54%</span>
                  </div>
                </div>

                <!-- Right: Energy Return & Respiration Telemetry -->
                <div>
                  <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:6px;background:#f0fdf4;color:#16a34a;font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;border:1px solid #bbf7d0;">
                    Bertec Force Plate Gait Analysis
                  </div>
                  <h2 style="font-size:1.5rem;font-weight:900;color:#0f172a;margin:0 0 16px;line-height:1.3;">
                    3K Torsional Carbon Plate &amp; Nitrogen Autoclave Foam
                  </h2>
                  <div style="font-size:0.95rem;line-height:1.75;color:#475569;margin-bottom:24px;">
                    ${paragraphs.length > 1 ? paragraphs.slice(1).map(p => `<p style="margin:0 0 12px;">${esc(p)}</p>`).join('') : `
                      <p style="margin:0 0 12px;">By infusing supercritical nitrogen gas into high-purity PEBA pellets inside pressurized autoclaves, our midsoles achieve 0.11 g/cm³ density while returning 82.4% of impact force back to the athlete.</p>
                      <p style="margin:0;">The embedded 3K spoon-shaped carbon plate stabilizes ankle inversion during midstance, reducing metatarsophalangeal joint flexion fatigue over marathon distances.</p>
                    `}
                  </div>

                  <!-- Energy Rebound Comparison Matrix -->
                  <div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:12px;padding:16px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:800;margin-bottom:6px;color:#14532d;">
                      <span>Kinetix PEBA + 3K Plate</span>
                      <span>82.4% Rebound</span>
                    </div>
                    <div style="background:#dcfce7;height:8px;border-radius:4px;overflow:hidden;margin-bottom:12px;">
                      <div style="background:#16a34a;width:82.4%;height:100%;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#64748b;">
                      <span>Standard EVA Competitor Midsole</span>
                      <span>54.0% Rebound</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Lab Highlights Telemetry Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:24px;">
              ${highlights.map(h => `
                <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:18px;padding:26px;box-shadow:0 4px 16px rgba(22,163,74,0.03);position:relative;">
                  <div style="font-size:2.2rem;font-weight:900;color:#16a34a;margin-bottom:6px;line-height:1;letter-spacing:-0.03em;">${esc(h.value)}</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(h.label)}</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">${esc(h.desc || '')}</div>
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
      // TWO-COLUMN ALPINE OUTFITTER & EXPEDITION FLEET PROCUREMENT TERMINAL
      mainHtml = `
        <main class="sports-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:20px;background:#fff7ed;color:#c2410c;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;border:1px solid #fed7aa;">
                <span style="width:6px;height:6px;border-radius:50%;background:#ea580c;"></span>
                [EXPEDITION FLEET PROCUREMENT // DIRECT ALPINE DESK]
              </span>
              <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#0f172a;margin:0 0 16px;letter-spacing:-0.03em;">
                Alpine Outfitting Sourcing &amp; Expedition Fleet Tender
              </h1>
              <p style="font-size:1.05rem;color:#475569;line-height:1.7;max-width:700px;margin:0 auto;">
                Direct liaison for mountain guide associations, high-altitude expeditions, custom Dyneema team colorways, and UIAGM test certification reports.
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1.35fr;gap:36px;max-width:1120px;margin:0 auto;align-items:start;">
              <!-- Left Column: Alpine Manufacturing Capabilities & Guide Desk -->
              <div style="display:flex;flex-direction:column;gap:20px;">
                <!-- Capabilities Card -->
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;padding:32px;box-shadow:0 10px 30px rgba(234,88,12,0.04);">
                  <div style="font-size:0.72rem;font-family:monospace;color:#c2410c;font-weight:800;letter-spacing:0.08em;margin-bottom:8px;text-transform:uppercase;">
                    [ALPINE MANUFACTURING CAPABILITIES]
                  </div>
                  <h3 style="font-size:1.2rem;font-weight:800;color:#0f172a;margin:0 0 18px;">
                    High-Altitude Technical Craftsmanship
                  </h3>
                  <div style="display:flex;flex-direction:column;gap:14px;">
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">Automated Laser Cutting &amp; Ultrasonic Seam Bonding</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Zero needle perforations with 100% waterproof micro-tape lamination.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">20,000mm Hydrostatic Pressure Testing Laboratory</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Every production batch hydrostatically verified under Suter test column.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">850FP European Down Baffle &amp; Chamber Packing</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Hydrophobic PFC-free down fill under certified EN 13537 thermal standards.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">UIAGM &amp; CE EN 343 Protective Compliance</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Field verified by certified high-altitude alpine mountain guides.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Direct Alpine Desk -->
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;padding:26px;box-shadow:0 6px 20px rgba(234,88,12,0.03);">
                  <div style="font-size:0.72rem;font-family:monospace;color:#c2410c;font-weight:800;letter-spacing:0.08em;margin-bottom:8px;text-transform:uppercase;">
                    [DIRECT ALPINE LIAISON DESK]
                  </div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Expedition Outfitting &amp; Guide Fleet</div>
                  <div style="font-size:0.82rem;color:#64748b;margin-bottom:14px;line-height:1.6;">Direct mountaineering engineer response within 4 operational hours.</div>
                  <div style="display:flex;flex-direction:column;gap:8px;font-size:0.82rem;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:64px;">Email:</span>
                      <a href="mailto:${esc(company.email || 'expeditions@apextrail.com')}" style="color:#ea580c;text-decoration:none;font-weight:700;">${esc(company.email || 'expeditions@apextrail.com')}</a>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:64px;">Station:</span>
                      <span style="color:#64748b;">${esc(company.address || 'ApexTrail Alpine Outfitting & High-Altitude Testing Lab')}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:64px;">Hours:</span>
                      <span style="color:#64748b;">Mon - Fri, 08:00 - 18:00 CET</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Interactive Consultation RFQ Console -->
              <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;padding:36px;box-shadow:0 12px 36px rgba(234,88,12,0.06);position:relative;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #fed7aa;padding-bottom:16px;margin-bottom:24px;">
                  <div>
                    <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#ea580c;letter-spacing:0.06em;">[TERMINAL // EXPEDITION-RFQ-INIT]</span>
                    <h2 style="font-size:1.3rem;font-weight:900;color:#0f172a;margin:4px 0 0;">Expedition Outfitting Tender Console</h2>
                  </div>
                  <span style="font-size:0.75rem;padding:4px 10px;border-radius:6px;background:#ecfdf5;color:#059669;font-weight:800;">EXPEDITION READY</span>
                </div>

                <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:18px;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Expedition Leader / Buyer</label>
                      <input type="text" name="name" required placeholder="e.g. Erik Sorenson" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#fff7ed;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Corporate Email</label>
                      <input type="email" name="email" required placeholder="outfitting@alpine-expedition.org" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#fff7ed;">
                    </div>
                  </div>

                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Target Alpine Expedition Gear</label>
                    <select name="productId" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#fff7ed;outline:none;color:#0f172a;">
                      <option value="">General Expedition Gear Inquiries (All Items)</option>
                      ${products.map(p => `
                        <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Alpine Environment</label>
                      <select name="environment" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#fff7ed;outline:none;color:#0f172a;">
                        <option>High-Glacier Expedition (4,000M+)</option>
                        <option>Long-Distance Thru-Hiking Trail</option>
                        <option>Ultralight Fastpacking &amp; Scrambling</option>
                      </select>
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Seam Construction Standard</label>
                      <select name="seam" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#fff7ed;outline:none;color:#0f172a;">
                        <option>100% Heat-Welded 13mm Micro-Tape</option>
                        <option>Bonded Ultrasonic Welded Seams</option>
                        <option>Heavy-Duty Reinforced Double Stitch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Expedition Timeline &amp; Technical Specifications</label>
                    <textarea name="message" rows="4" placeholder="Detail your mountain destination, required temperature comfort rating, custom team embroidery, or launch timeline..." style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;resize:vertical;outline:none;background:#fff7ed;"></textarea>
                  </div>

                  <button type="submit" style="padding:16px;border-radius:12px;border:none;background:linear-gradient(135deg, #ea580c 0%, #f97316 100%);color:#ffffff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(234,88,12,0.25);transition:transform 0.2s ease;">
                    Transmit Expedition Outfitting Request ↗
                  </button>
                  <div style="font-size:0.75rem;color:#94a3b8;text-align:center;">
                    Direct manufacturer outfitter response within 4 hours. Technical specification sheet &amp; field guide test report provided.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // BESPOKE FULL-WIDTH MISSION CONTROL & FOOTWEAR OEM TENDER COCKPIT
      mainHtml = `
        <main class="sports-main" data-wr-page="contact" style="background:#ffffff;color:#0f172a;min-height:80vh;padding:40px 0 80px;">
          <div class="wrap" style="padding:0 24px;max-width:1160px;margin:0 auto;">
            
            <!-- Top Mission Control Header -->
            <div style="border-bottom:1px solid #bbf7d0;padding-bottom:28px;margin-bottom:36px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px;">
              <div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                  <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:4px 10px;border-radius:6px;letter-spacing:0.06em;">
                    [MISSION CONTROL // ATHLETIC FLEET &amp; OEM CONSOLE]
                  </span>
                  <span style="font-size:0.75rem;color:#15803d;background:#dcfce7;border:1px solid #bbf7d0;padding:4px 10px;border-radius:6px;font-weight:800;">
                    LIVE LAB SLA &lt; 4H
                  </span>
                </div>
                <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#0f172a;margin:0 0 8px;letter-spacing:-0.03em;">
                  Athletic Team Fleet &amp; Footwear OEM Mission Control
                </h1>
                <p style="font-size:0.95rem;color:#64748b;margin:0;max-width:720px;line-height:1.65;">
                  Direct engineering channel for elite national federation teams, collegiate athletic squads, and private-label footwear brands requiring custom nitrogen autoclave foam casting and precision 3K carbon tooling.
                </p>
              </div>

              <div style="display:flex;gap:12px;font-family:monospace;font-size:0.78rem;">
                <div style="background:#f8fafc;border:1px solid #bbf7d0;padding:10px 16px;border-radius:10px;text-align:right;">
                  <div style="color:#64748b;font-size:0.68rem;">RULE 5 AUDIT</div>
                  <div style="font-weight:800;color:#15803d;">WORLD ATHLETICS LEGAL</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #bbf7d0;padding:10px 16px;border-radius:10px;text-align:right;">
                  <div style="color:#64748b;font-size:0.68rem;">DISPATCH WINDOW</div>
                  <div style="font-weight:800;color:#0f172a;">35 PRODUCTION DAYS</div>
                </div>
              </div>
            </div>

            <!-- Top 3-Pillar Sourcing Program Deck -->
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;margin-bottom:36px;">
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:22px;">
                <div style="font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;margin-bottom:6px;">
                  01 // NATIONAL TEAM LASTS
                </div>
                <div style="font-size:1rem;font-weight:900;color:#0f172a;margin-bottom:8px;">Custom 3D Scan &amp; CNC Milling</div>
                <div style="font-size:0.8rem;color:#475569;line-height:1.55;">
                  Sub-micron volumetric foot scanning and custom carbon plate curvature pre-preg layups tailored to athlete footstrike.
                </div>
              </div>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:22px;">
                <div style="font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;margin-bottom:6px;">
                  02 // SUPERCRITICAL AUTOCLAVE
                </div>
                <div style="font-size:1rem;font-weight:900;color:#0f172a;margin-bottom:8px;">Closed-Cell Nitrogen Casting</div>
                <div style="font-size:0.8rem;color:#475569;line-height:1.55;">
                  Zero-blowing agent PEBA expansion yielding 82.4% rebound resilience and ultra-low 0.12 g/cm³ high-energy density.
                </div>
              </div>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:22px;">
                <div style="font-family:monospace;font-size:0.72rem;font-weight:800;color:#15803d;margin-bottom:6px;">
                  03 // RULE 5 FAST TRACK
                </div>
                <div style="font-size:1rem;font-weight:900;color:#0f172a;margin-bottom:8px;">Competition Audit Filing</div>
                <div style="font-size:0.8rem;color:#475569;line-height:1.55;">
                  Full pre-race technical compliance paperwork and stack height (&lt; 40mm) verification audit certificates provided.
                </div>
              </div>
            </div>

            <!-- Unified Full-Width Mission Control Tender Cockpit -->
            <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:24px;overflow:hidden;box-shadow:0 12px 36px rgba(22,163,74,0.06);margin-bottom:36px;">
              
              <div style="background:#f8fafc;border-bottom:1px solid #bbf7d0;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;font-family:monospace;font-size:0.75rem;">
                <div style="display:flex;align-items:center;gap:10px;color:#15803d;font-weight:800;">
                  <span style="width:8px;height:8px;border-radius:50%;background:#16a34a;"></span>
                  <span>CENTRAL TENDER CONSOLE // SESSION ID: WR-PROPULSION-INIT</span>
                </div>
                <span style="color:#64748b;font-weight:700;">ENCRYPTED SOURCING CHANNEL</span>
              </div>

              <form id="inquiry" action="/inquiry" method="post" style="padding:36px 32px;display:flex;flex-direction:column;gap:28px;">
                
                <!-- Cockpit Section 1: Fleet Allocation & Performance Parameters -->
                <div>
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#15803d;letter-spacing:0.06em;margin-bottom:12px;">
                    [COCKPIT-01 // FLEET ALLOCATION &amp; ENGINEERING PARAMETERS]
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Fleet Volume Allocation</label>
                      <select name="tier" style="width:100%;padding:12px;border:1px solid #bbf7d0;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#f0fdf4;outline:none;color:#0f172a;">
                        <option>Pro Team Fast-Track (20 Pairs)</option>
                        <option>Club Fleet Order (200 Pairs)</option>
                        <option>Championship OEM Bulk (1,000+ Pairs)</option>
                      </select>
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Target Racing Distance</label>
                      <select name="distance" style="width:100%;padding:12px;border:1px solid #bbf7d0;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#f0fdf4;outline:none;color:#0f172a;">
                        <option>Marathon (42.195K) Road Racing</option>
                        <option>Half Marathon / 10K High-Speed</option>
                        <option>Ultra-Distance Trail 50K - 100M</option>
                      </select>
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Plate Torsional Rigidity</label>
                      <select name="plate" style="width:100%;padding:12px;border:1px solid #bbf7d0;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#f0fdf4;outline:none;color:#0f172a;">
                        <option>3K Full-Length Spoon Carbon Plate</option>
                        <option>Dual-Fork Semi-Rigid Carbon Rods</option>
                        <option>Pebax Kinetic Responsive Shank</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Cockpit Section 2: Buyer Credentials & Target Model -->
                <div style="border-top:1px solid #e2e8f0;padding-top:24px;">
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#15803d;letter-spacing:0.06em;margin-bottom:12px;">
                    [COCKPIT-02 // BUYER CREDENTIALS &amp; MODEL IDENTIFIER]
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Team Director / Sourcing Buyer</label>
                      <input type="text" name="name" required placeholder="e.g. Marcus Vance" style="width:100%;padding:12px;border:1px solid #bbf7d0;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#f0fdf4;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Corporate Email Address</label>
                      <input type="email" name="email" required placeholder="fleet@athletic-team.com" style="width:100%;padding:12px;border:1px solid #bbf7d0;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#f0fdf4;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Target Racing Footwear Model</label>
                      <select name="productId" style="width:100%;padding:12px;border:1px solid #bbf7d0;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#f0fdf4;outline:none;color:#0f172a;">
                        <option value="">General Racing Footwear Fleet (All Models)</option>
                        ${products.map(p => `
                          <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                        `).join('')}
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Cockpit Section 3: Technical Last & Custom Livery Requirements -->
                <div style="border-top:1px solid #e2e8f0;padding-top:24px;">
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#15803d;letter-spacing:0.06em;margin-bottom:12px;">
                    [COCKPIT-03 // CUSTOM LAST ERGONOMICS &amp; TENDER BRIEF]
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Technical Specifications, Size Ratio Curve, &amp; Delivery Deadline</label>
                    <textarea name="message" rows="4" placeholder="Specify custom wide/narrow forefoot last requirements, team Pantone color livery, carbon stiffness calibration, or championship dispatch date..." style="width:100%;padding:14px;border:1px solid #bbf7d0;border-radius:12px;font-size:0.88rem;box-sizing:border-box;resize:vertical;outline:none;background:#f0fdf4;"></textarea>
                  </div>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;border-top:1px solid #bbf7d0;padding-top:20px;">
                  <div style="font-size:0.78rem;color:#64748b;">
                    Direct sports science response within 4 hours. Complete technical dossier &amp; biomechanics report provided.
                  </div>
                  <button type="submit" style="padding:16px 36px;border-radius:12px;border:none;background:linear-gradient(135deg, #16a34a 0%, #22c55e 100%);color:#ffffff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(22,163,74,0.25);transition:transform 0.2s ease;">
                    Transmit Fleet Sourcing Tender to Lab Command ↗
                  </button>
                </div>
              </form>
            </div>

            <!-- Direct Engineer Liaison Bar -->
            <div style="background:#f8fafc;border:1px solid #bbf7d0;border-radius:18px;padding:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:18px;">
              <div style="display:flex;align-items:center;gap:14px;">
                <span style="font-size:1.8rem;">⚡</span>
                <div>
                  <div style="font-size:0.9rem;font-weight:800;color:#0f172a;">Kinetic Performance Sourcing &amp; Propulsion Engineering Command</div>
                  <div style="font-size:0.8rem;color:#64748b;margin-top:2px;">${esc(company.address || 'Kinetix Velocity Wind Tunnel & Footwear Biomechanics Lab')} · Mon - Fri, 08:30 - 18:30 CET</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-family:monospace;font-size:0.82rem;font-weight:800;color:#15803d;">DIRECT EMAIL:</span>
                <a href="mailto:${esc(company.email || 'racing@kinetix-lab.com')}" style="color:#16a34a;text-decoration:none;font-weight:800;font-size:0.88rem;background:#ffffff;border:1px solid #bbf7d0;padding:6px 14px;border-radius:8px;">
                  ${esc(company.email || 'racing@kinetix-lab.com')}
                </a>
              </div>
            </div>

          </div>
        </main>
      `;
    }
  }

  // Distinct Footer for each variant
  const footerHtml = isVideo ? `
    <footer style="background:#ffffff;color:#0f172a;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid #bbf7d0;">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#0f172a;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:2px;background:#16a34a;"></span>
            ${esc(brandName)}
          </div>
          <p style="color:#64748b;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Human performance footwear biomechanics. Supercritical nitrogen-foamed PEBA midsoles, 3K carbon plates, and World Athletics certified geometry.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:4px 9px;border-radius:6px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-size:0.72rem;font-weight:800;font-family:monospace;">82.4% PEBA</span>
            <span style="padding:4px 9px;border-radius:6px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-size:0.72rem;font-weight:800;font-family:monospace;">3K CARBON</span>
            <span style="padding:4px 9px;border-radius:6px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-size:0.72rem;font-weight:800;font-family:monospace;">WA LEGAL</span>
          </div>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;letter-spacing:0.04em;">Propulsion Series</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#64748b;font-size:0.82rem;line-height:2.1;">
            <li>Supercritical Marathon Carbon Racers</li>
            <li>Race-Cut Ergonomic Hydration Packs</li>
            <li>Aerodynamic Wind-Tunnel Cycling Helmets</li>
            <li>Hydrophobic Polarized Performance Optics</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;letter-spacing:0.04em;">Team Partnerships</h4>
          <p style="color:#64748b;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'racing@kinetix-lab.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#16a34a;text-decoration:none;font-weight:800;font-size:0.84rem;">Direct Sourcing Terminal →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #bbf7d0;padding-top:24px;display:flex;justify-content:space-between;color:#94a3b8;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Human Kinetics &amp; Supercritical Athletic Engineering Division</span>
      </div>
    </footer>
  ` : `
    <footer style="background:#ffffff;color:#0f172a;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid #fed7aa;">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#0f172a;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:2px;background:#ea580c;"></span>
            ${esc(brandName)}
          </div>
          <p style="color:#64748b;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Alpine expedition equipment and ultralight mountaineering armor. 3-layer Dyneema composite ePTFE membranes, 100% taped seams, and UIAGM field tested.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:4px 9px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-size:0.72rem;font-weight:800;font-family:monospace;">20,000MM</span>
            <span style="padding:4px 9px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-size:0.72rem;font-weight:800;font-family:monospace;">380G PACK</span>
            <span style="padding:4px 9px;border-radius:6px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-size:0.72rem;font-weight:800;font-family:monospace;">UIAGM TEST</span>
          </div>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;letter-spacing:0.04em;">Alpine Standards</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#64748b;font-size:0.82rem;line-height:2.1;">
            <li>20,000mm ePTFE Waterproof Barrier</li>
            <li>Dyneema High-Tear Strength Composite</li>
            <li>4-Season Geodesic 80km/h Wind Shelters</li>
            <li>850FP Hydrophobic Down Baffle Architecture</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;letter-spacing:0.04em;">Expedition Sourcing</h4>
          <p style="color:#64748b;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'expeditions@apextrail.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#ea580c;text-decoration:none;font-weight:800;font-size:0.84rem;">Submit Outfitting Inquiry →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #fed7aa;padding-top:24px;display:flex;justify-content:space-between;color:#94a3b8;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Ultralight Alpine Mountaineering &amp; Expedition Equipment Division</span>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
