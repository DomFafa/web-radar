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
      // TOPOGRAPHIC ALPINE GEAR WALL CATALOG
      mainHtml = `
        <main class="sports-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Alpine Terrain Index · Ultralight Hardware Fleet
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                Alpine Mountaineering &amp; Trail Gear Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Mountain Gear (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">3-Layer Hardshells</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Geodesic Tents</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">850FP Down Bags</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Carbon Trekking Poles</span>
              </div>
            </div>

            <!-- Alpine Gear Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:32px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(234,88,12,0.05);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:82%;height:82%;object-fit:contain;">
                      <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;font-family:monospace;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">4,000M RATED</span>
                    </div>
                  </a>
                  <div style="padding:22px;">
                    <span style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                    <h3 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:6px 0 10px;line-height:1.3;">
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
                        Gear Dossier →
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
      // ATHLETIC RACE DECK CATALOG
      mainHtml = `
        <main class="sports-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:24px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Human Performance Race Fleet · Biomechanics Engineering
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                Supercritical Footwear &amp; Racing Gear Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Racing Gear (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Marathon Carbon Racers</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Race-Cut Hydration Vests</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Aero Cycling Helmets</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Hydrophobic Sport Optics</span>
              </div>
            </div>

            <!-- Racing Product Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(22,163,74,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.1;background:#f0fdf4;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                      <span style="position:absolute;top:10px;left:10px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">PEBA REBOUND</span>
                    </div>
                  </a>
                  <div style="padding:20px;">
                    <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};margin:0 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;font-size:0.75rem;margin-bottom:14px;">
                      <div>
                        <span style="color:${theme.textSub};display:block;">Materials:</span>
                        <strong style="color:${theme.text};">${esc(p.material)}</strong>
                      </div>
                      <div>
                        <span style="color:${theme.textSub};display:block;">Specs:</span>
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
      // TOPOGRAPHIC ALPINE DETAIL: HEAT-WELDED SEAMS + HYDROSTATIC PRESSURE CERT
      mainHtml = `
        <main class="sports-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Alpine Gear Wall
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Gear Portrait & Weatherproofing -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;position:relative;box-shadow:0 12px 32px rgba(234,88,12,0.05);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    20,000mm WATERPROOF
                  </div>
                  <!-- Thumbnails container -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Weatherproof Performance Metrics -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">20,000mm</div>
                    <div style="color:${theme.textSub};">Hydrostatic Head</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">380g</div>
                    <div style="color:${theme.textSub};">Ultralight Packweight</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">Expedition MOQ</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Technical Dossier & Guide Notes -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · High-Alpine Model
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Technical Gear Specifications Table -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;margin-bottom:28px;">
                  <h3 style="font-size:0.95rem;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Alpine Material &amp; Construction Dossier
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.85rem;">
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Membrane Textile</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Dimensions / Weight</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Weatherproof Rating</span>
                      <strong style="color:${theme.text};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Production MOQ</span>
                      <strong style="color:${theme.primary};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- UIAGM Guide Field Certification -->
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:22px;margin-bottom:28px;">
                  <h4 style="font-size:0.88rem;font-weight:800;color:#c2410c;margin:0 0 8px;">UIAGM Mountain Guide Field Testing Certification</h4>
                  <p style="font-size:0.82rem;color:#9a3412;margin:0 0 14px;line-height:1.6;">
                    Field tested across 4,000-meter Mont Blanc ridges through blizzard conditions (-30°C, 80 km/h gusts), maintaining complete seam water tightness and wind resistance.
                  </p>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <span style="padding:6px 14px;background:#fff;border:1px solid #fdba74;color:#c2410c;border-radius:6px;font-size:0.75rem;font-weight:700;">[ 4,000M Glacier Pass ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #fdba74;color:#c2410c;border-radius:6px;font-size:0.75rem;font-weight:700;">[ -30°C Blizzard Rated ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #fdba74;color:#c2410c;border-radius:6px;font-size:0.75rem;font-weight:700;">[ 100% Taped Seams ]</span>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Order Expedition Outfitting ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    View All Alpine Gear
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // ATHLETIC RACE DETAIL: BIOMECHANICS HUD + 3K CARBON SPOON CURVE + 1,000KM OUTSOLE REPORT
      mainHtml = `
        <main class="sports-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Performance Footwear Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Footwear Portrait & Gallery -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;position:relative;box-shadow:0 12px 32px rgba(22,163,74,0.06);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    WORLD ATHLETICS LEGAL
                  </div>
                  <!-- Thumbnails -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Biomechanics Energy Rebound Indicator -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">82.4%</div>
                    <div style="color:${theme.textSub};">Energy Return</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">39.5mm</div>
                    <div style="color:${theme.textSub};">Max Stack Height</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">Team MOQ</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Kinematics Specs & Outsole Abrasion Report -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Supercritical Nitrogen Platform
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
                    Biomechanics Engineering Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Midsole Foam &amp; Plate</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Size Range &amp; Weight</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Propulsion Rating</span>
                      <strong style="color:${theme.primary};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Production MOQ</span>
                      <strong style="color:${theme.text};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- 1,000km Outsole Abrasion Report -->
                <div style="background:#f0fdf4;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:0 0 10px;">1,000km Outsole Rubber Endurance Report</h4>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:0.8rem;text-align:center;">
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Wet Traction</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">CoF 0.85</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Volume Loss</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">&lt; 65 mm³</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Midsole Creep</div>
                      <strong style="color:${theme.primary};font-size:0.95rem;">&lt; 4.2%</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Submit Racing Team RFQ ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    View All Footwear
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? '16-Camera 3D Motion Analysis & Biomechanics Lab' : 'UIAGM Certified Mountain Guide Field Testing Protocol');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || (isVideo ? 'At our high-speed sports science research complex, instrumented force plates and high-speed infrared motion capture cameras track kinetic energy transfer and joint angles down to 0.1 degrees.' : 'Our alpine expedition laboratory partners with UIAGM certified mountain guides across Chamonix and the Karakoram to test weatherproofing membranes under real glacial storms and hurricane winds.'));
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
      // ALPINE EXPEDITION GUIDE ABOUT
      mainHtml = `
        <main class="sports-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                High-Altitude Testing &amp; Alpine Integrity
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(234,88,12,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">ApexTrail designs mountaineering equipment tested directly by UIAGM mountain guides along high-alpine routes across the European Alps, Patagonia, and the Himalayas.</p>
                    <p style="margin:0 0 18px;">We reject heavy redundant hardware. By pioneering Dyneema composite weaves and microporous ePTFE membranes, our gear delivers extreme blizzard protection at minimal pack weights for thru-hikers and alpine climbers.</p>
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
                    <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc || '')}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </main>
      `;
    } else {
      // BIOMECHANICS LAB ABOUT
      mainHtml = `
        <main class="sports-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Human Kinetics &amp; 3D Motion Analysis Lab
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(22,163,74,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">Kinetix operates a state-of-the-art human kinetics research center equipped with 16-camera Vicon 3D motion capture, Bertec instrumented treadmills, and dynamic foot plantar pressure mapping.</p>
                    <p style="margin:0 0 18px;">Our footwear engineering team collaborates with elite marathon runners and sports science institutes to optimize carbon plate torsional flex and supercritical nitrogen foaming density for maximum competitive energy conversion.</p>
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
                    <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc || '')}</div>
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
      // ALPINE OUTFITTER SOURCING DESK
      mainHtml = `
        <main class="sports-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Alpine Outfitter &amp; Expedition Sourcing Desk
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Submit Alpine Outfitting RFQ
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Inquire about mountaineering club fleet orders, custom Dyneema colorways, expedition team gear specifications, and volume pricing.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(234,88,12,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Expedition Leader / Buyer</label>
                    <input type="text" name="name" required placeholder="Alpine Sourcing Director" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email Address</label>
                    <input type="email" name="email" required placeholder="outfitting@alpine-expedition.org" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Expedition Gear</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Alpine Gear Inquiries (All Items)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Alpine Environment</label>
                    <select name="environment" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>High-Glacier Expedition (4,000M+)</option>
                      <option>Long-Distance Thru-Hiking Trail</option>
                      <option>Ultralight Fastpacking &amp; Scrambling</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Seam Construction Standard</label>
                    <select name="seam" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>100% Heat-Welded 13mm Micro-Tape</option>
                      <option>Bonded Ultrasonic Welded Seams</option>
                      <option>Heavy-Duty Reinforced Double Stitch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Expedition Timeline &amp; Technical Requirements</label>
                  <textarea name="message" rows="4" placeholder="Detail your mountain destination, required temperature comfort rating, custom embroidery, or launch timeline..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Transmit Expedition Outfitting Request ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      // RACING TEAM & FOOTWEAR OEM DESK
      mainHtml = `
        <main class="sports-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Athletic Team Fleet &amp; Footwear OEM Partnership Desk
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Inquire Footwear OEM &amp; Team Fleet
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Connect with our biomechanics engineers regarding custom racing lasts, team colorways, World Athletics compliance certificates, and volume production.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(22,163,74,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Team Director / Sourcing Buyer</label>
                    <input type="text" name="name" required placeholder="Athletic Fleet Director" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email Address</label>
                    <input type="email" name="email" required placeholder="racing@athletic-team.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Racing Footwear Model</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Racing Footwear Inquiries</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Racing Distance</label>
                    <select name="distance" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Marathon (42.195K) Road Racing</option>
                      <option>Half Marathon / 10K High-Speed</option>
                      <option>Ultra-Distance Trail 50K - 100M</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Plate Torsional Rigidity</label>
                    <select name="plate" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>3K Full-Length Spoon Carbon Plate</option>
                      <option>Dual-Fork Semi-Rigid Carbon Rods</option>
                      <option>Pebax Kinetic Responsive Shank</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Custom Last Ergonomics &amp; Production Scale</label>
                  <textarea name="message" rows="4" placeholder="Specify custom wide/narrow forefoot last requirements, team Pantone livery, or championship delivery date..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Submit Racing Fleet OEM Inquiry ↗
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
            Human performance footwear biomechanics. Supercritical nitrogen-foamed PEBA midsoles, 3K carbon plates, and World Athletics certified geometry.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#22c55e;font-size:0.7rem;font-weight:700;">82% PEBA</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#22c55e;font-size:0.7rem;font-weight:700;">3K CARBON</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#22c55e;font-size:0.7rem;font-weight:700;">WA LEGAL</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Propulsion Series</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>Supercritical Marathon Carbon Racers</li>
            <li>Race-Cut Ergonomic Hydration Packs</li>
            <li>Aerodynamic Wind-Tunnel Cycling Helmets</li>
            <li>Hydrophobic Polarized Performance Optics</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Team Partnerships</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'racing@kinetix-lab.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#22c55e;text-decoration:none;font-weight:700;font-size:0.82rem;">Direct Sourcing Terminal →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Human Kinetics &amp; Supercritical Athletic Engineering Division</span>
      </div>
    </footer>
  ` : `
    <footer style="background:#0f172a;color:#f8fafc;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid rgba(255,255,255,0.08);">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#fff;margin-bottom:8px;">${esc(brandName)}</div>
          <p style="color:#94a3b8;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Alpine expedition equipment and ultralight mountaineering armor. 3-layer Dyneema composite ePTFE membranes, 100% taped seams, and UIAGM field tested.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f97316;font-size:0.7rem;font-weight:700;">20,000MM</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f97316;font-size:0.7rem;font-weight:700;">380G PACK</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f97316;font-size:0.7rem;font-weight:700;">UIAGM TEST</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Alpine Standards</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>20,000mm ePTFE Waterproof Barrier</li>
            <li>Dyneema High-Tear Strength Composite</li>
            <li>4-Season Geodesic 80km/h Wind Shelters</li>
            <li>850FP Hydrophobic Down Baffle Architecture</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Expedition Sourcing</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'expeditions@apextrail.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#f97316;text-decoration:none;font-weight:700;font-size:0.82rem;">Submit Outfitting Inquiry →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Ultralight Alpine Mountaineering &amp; Expedition Equipment Division</span>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
