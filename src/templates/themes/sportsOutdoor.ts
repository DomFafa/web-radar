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
    name: 'Carbon Fiber Ultralight Trekking Poles',
    desc: 'Full carbon fiber shaft trekking poles with tungsten carbide tips, cork/EVA ergonomic grips, and 3-section lever lock.',
    badge: 'Ultralight',
    category: 'trekking',
    categoryNameZh: '',
    categoryNameEn: 'Trekking Poles',
    material: '100% Carbon Fiber Shaft',
    dimensions: '62-135cm Adjustable · 195g/pair',
    extra: 'Tungsten Carbide Tips',
    moq: '300 Pairs',
    tagline: 'Full Carbon 195g Ultralight',
    img: getIndustryPlaceholder('sports', 0),
  },
  {
    id: 'sp-2',
    name: 'Trail Running Hydration Vest 15L',
    desc: 'Race-cut vest with Cordura 30D ripstop, dual 500ml soft flasks, and magnetic sternum buckle for bounce-free running.',
    badge: 'Race-Cut',
    category: 'backpack',
    categoryNameZh: '',
    categoryNameEn: 'Hydration Vests',
    material: 'Cordura 30D Ripstop Nylon',
    dimensions: '15L Capacity · 280g (empty)',
    extra: 'Magnetic Sternum Lock',
    moq: '500 Units',
    tagline: 'Cordura 30D Race-Cut 280g',
    img: getIndustryPlaceholder('sports', 1),
  },
  {
    id: 'sp-3',
    name: 'Dyneema Composite 2-Person Tent',
    desc: 'Freestanding double-wall tent with Dyneema Composite Fabric fly, DAC Featherlite poles, and 3-season wind rating.',
    badge: 'DCF Ultralight',
    category: 'tent',
    categoryNameZh: '',
    categoryNameEn: 'Ultralight Tents',
    material: 'Dyneema Composite Fabric (DCF)',
    dimensions: '220 × 130 × 105 cm · 680g',
    extra: 'DAC Featherlite Poles',
    moq: '100 Units',
    tagline: 'Dyneema DCF 680g Freestanding',
    img: getIndustryPlaceholder('sports', 2),
  },
  {
    id: 'sp-4',
    name: 'UIAA Certified Dynamic Climbing Rope',
    desc: '9.8mm dynamic single rope with dry treatment, optimized impact force, and UIAA fall rating for sport and trad climbing.',
    badge: 'UIAA Certified',
    category: 'climbing',
    categoryNameZh: '',
    categoryNameEn: 'Climbing Ropes',
    material: 'Nylon 6.6 Core + Polyester Sheath',
    dimensions: '9.8mm × 70m · 62g/m',
    extra: 'Dry Treated Sheath',
    moq: '200 Ropes',
    tagline: 'UIAA 9.8mm Dynamic Dry-Treated',
    img: getIndustryPlaceholder('sports', 3),
  },
  {
    id: 'sp-5',
    name: 'MIPS Enduro Trail Helmet',
    desc: 'MIPS rotational impact protection helmet with extended rear coverage, adjustable visor, and GoPro mount compatibility.',
    badge: 'MIPS Safety',
    category: 'cycling',
    categoryNameZh: '',
    categoryNameEn: 'Cycling Helmets',
    material: 'In-Mold EPS + PC Shell + MIPS',
    dimensions: 'M/L: 55-61cm · 330g',
    extra: 'EN 1078 + MIPS Liner',
    moq: '500 Units',
    tagline: 'MIPS Rotational Protection',
    img: getIndustryPlaceholder('sports', 4),
  },
  {
    id: 'sp-6',
    name: 'Military-Grade Inflatable Stand-Up Paddleboard',
    desc: 'Drop-stitch dual-layer PVC paddleboard with EVA diamond deck pad, triple removable fin system, and travel backpack kit.',
    badge: 'Drop-Stitch',
    category: 'water',
    categoryNameZh: '',
    categoryNameEn: 'Paddleboards',
    material: 'Military Dual-Layer Drop-Stitch PVC',
    dimensions: '320 × 81 × 15 cm · Max 150kg',
    extra: '15 PSI High Pressure',
    moq: '100 Sets',
    tagline: 'Military Dual-Layer Drop-Stitch',
    img: getIndustryPlaceholder('sports', 5),
  },
  {
    id: 'sp-7',
    name: '800 Fill Power Down Mummy Sleeping Bag',
    desc: 'RDS certified 800FP hydrophobic goose down sleeping bag with Pertex Quantum shell, trapezoidal baffles, and -10°C comfort rating.',
    badge: '800FP Down',
    category: 'sleep',
    categoryNameZh: '',
    categoryNameEn: 'Sleeping Bags',
    material: 'Pertex Quantum 10D + 800FP Goose Down',
    dimensions: '210 × 80 × 50 cm · 890g',
    extra: 'RDS Certified 800FP',
    moq: '200 Units',
    tagline: 'Pertex Quantum 800FP -10°C',
    img: getIndustryPlaceholder('sports', 6),
  },
  {
    id: 'sp-8',
    name: 'Polarized Hydrophobic Sports Sunglasses',
    desc: 'TR90 memory polymer frame sports sunglasses with hydrophobic polarized TAC lenses, anti-slip rubber nose pad, and UV400.',
    badge: 'TR90 Polarized',
    category: 'eyewear',
    categoryNameZh: '',
    categoryNameEn: 'Sports Eyewear',
    material: 'TR90 Swiss Memory Polymer',
    dimensions: '145 × 130 × 50 mm · 26g',
    extra: 'UV400 Polarized TAC',
    moq: '1000 Pairs',
    tagline: 'TR90 Swiss Memory Polarized',
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

  const brandName = company.name || (isVideo ? 'KineticMotion Athletic Pro' : 'SummitPeak Alpine Expeditions');
  const brandTagline = isVideo ? 'High-Performance Sports & Fitness Gear' : 'Ultralight Mountaineering & Expedition Gear';

  // Light Palettes Only - No dark mode!
  const theme = isVideo
    ? {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      cardBorder: 'rgba(2,132,199,0.16)',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(248,250,252,0.92)',
      pillBg: '#e0f2fe',
      pillText: '#0284c7',
      btnGradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
      accentGlow: 'rgba(2,132,199,0.2)',
    }
    : {
      bg: '#f6f8f5',
      cardBg: '#ffffff',
      cardBorder: 'rgba(21,128,61,0.14)',
      primary: '#15803d',
      primaryHover: '#166534',
      text: '#14532d',
      textMuted: '#374151',
      textSub: '#4b5563',
      glassBg: 'rgba(246,248,245,0.92)',
      pillBg: '#dcfce7',
      pillText: '#15803d',
      btnGradient: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
      accentGlow: 'rgba(21,128,61,0.2)',
    };

  // Distinct Header
  const headerHtml = isVideo ? `
    <header class="sports-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(2,132,199,0.04);">
      <div style="background:#e0f2fe;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:800;">
        <div>KINETIC BIOMECHANICAL TESTED · 85% ENERGY RETURN CERTIFIED</div>
        <div>COMMERCIAL ATHLETIC CLUB WHOLESALE PROGRAM</div>
      </div>
      <div class="wrap" style="height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:36px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.18rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};">${esc(brandName)}</span>
            <span style="font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;color:${theme.primary};font-weight:800;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:26px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 20px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.84rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Athletic RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="sports-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:74px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:36px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:${theme.text};">${esc(brandName)}</span>
            <span style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};font-weight:800;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:30px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Expedition Gear ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // ASYMMETRIC KINETIC ACTION VIDEO HERO WITH VELOCITY HUD
      mainHtml = `
        <main class="sports-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;padding:70px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Biomechanical Athletics · High-Energy Return Matrix
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Unleash Kinetic Power: Professional Athletic Gear')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with carbon composite propulsion, drop-stitch high-pressure matrix, and shock-absorbing dual-density polymers.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore Kinetic Equipment ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:6px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Commercial Club Pricing
                  </a>
                </div>
                <!-- Performance Telemetry -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">85%</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Energy Return Efficiency</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">300 kg</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Max Load Capacity</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">15 PSI</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">High-Pressure Drop-Stitch</div>
                  </div>
                </div>
              </div>

              <!-- Kinetic Action Video Console Display -->
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:2px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(2,132,199,0.12);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:contain;padding:24px;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.85);backdrop-filter:blur(10px);color:#fff;padding:6px 12px;border-radius:4px;font-size:0.72rem;font-weight:800;">
                    ATHLETIC FIELD DEMO
                  </div>
                </div>
                <div style="position:absolute;bottom:-18px;left:20px;right:20px;background:#ffffff;border-radius:10px;padding:16px 20px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div>
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Performance Apparatus</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                  </div>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:4px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">View Specs ↗</a>
                </div>
              </div>
            </div>
          </section>

          <!-- Biomechanical Impact Absorption Matrix -->
          <section style="padding:70px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:44px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Biomechanical Testing</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 0;">Impact Dispersion & Dynamic Energy Transfer</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Dual-Density EVA</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Progressive durometer cushioning absorbs 70% of ground reaction force for joint fatigue mitigation.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Carbon Composite Plate</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Full-length curved carbon plate delivers spring-like forward propulsion and lateral torsional rigidity.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Military Drop-Stitch</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Tensile thread matrix permits 15 PSI inflation without bulging for rigid board planar geometry.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Product Catalog -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Athletic Equipment Catalog</div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Fitness, Water & Training Gear</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${theme.primary};">All Gear (RFQ) →</a>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.05;background:${theme.bg};position:relative;overflow:hidden;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:18px;">
                        <span style="position:absolute;top:12px;left:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="padding:20px;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <div style="font-size:0.8rem;color:${theme.textSub};margin-bottom:12px;">${esc(p.material)} · ${esc(p.dimensions)}</div>
                        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid ${theme.cardBorder};">
                          <span style="font-size:0.78rem;font-weight:700;color:${theme.textMuted};">MOQ: ${esc(p.moq)}</span>
                          <span style="font-size:0.8rem;font-weight:800;color:${theme.primary};">Gear Details ↗</span>
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
      // ALPINE EXPEDITION PANORAMIC & TOPOGRAPHIC CONTOUR HERO
      mainHtml = `
        <main class="sports-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Panoramic Mountain Expedition Hero -->
          <section style="position:relative;padding:80px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Alpine Expedition Standards · 5,000m Elevation Certified
                </div>
                <h1 style="font-size:clamp(2.3rem, 4.5vw, 3.6rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Alpine Expedition Gear: Ultralight, Stormproof & Field Proven')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with Dyneema composite fabrics, 800FP goose down, and Cordura ripstop nylon for high-altitude mountain trekking and ultralight expeditions.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore Alpine Gear ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 26px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Field Test Log
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">20,000 mm</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">H₂O Waterproof Column</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">195 g</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Full Carbon Trekking Pole</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">800 FP</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">RDS Hydrophobic Down</div>
                  </div>
                </div>
              </div>

              <!-- Expedition Field Showcase -->
              <div style="position:relative;">
                <div style="border-radius:24px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 50px rgba(21,128,61,0.08);padding:24px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;font-size:0.75rem;color:${theme.primary};font-weight:800;">
                    <span>COORDINATES: 45°50′N 6°51′E</span>
                    <span>ALT: 4,809 M</span>
                  </div>
                  <div style="aspect-ratio:4/3;background:#f8fafc;border-radius:14px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:contain;padding:16px;" fetchpriority="high">
                  </div>
                  <div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;">
                    <div>
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Ultralight Trail Work</div>
                      <div style="font-size:0.95rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                    </div>
                    <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">Gear Dossier ↗</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Field Performance Environmental Matrix -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:640px;margin:0 auto 48px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;">Extreme Climate Standards</span>
                <h2 style="font-size:clamp(1.9rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">Field Performance Environmental Matrix</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:24px;">
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">20,000mm H₂O</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Hydrostatic Head Waterproof</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Fully taped hot-melt seams withstand monsoon torrential rain downpours.</div>
                </div>
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">RET &lt; 6 Breathability</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Microporous Air Permeability</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Continuous moisture vapor evacuation prevents internal sweat condensation.</div>
                </div>
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">-40°C Flex Test</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Sub-Zero Polymer Flexibility</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Buckles, poles, and fabric membranes resist embrittlement in Arctic blizzards.</div>
                </div>
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">PFC-Free DWR</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Bluesign Environmental Standard</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Bio-based durable water repellency without harmful fluorochemical runoff.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Alpine Gear Catalog Shelf -->
          <section style="padding:90px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:48px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;">Expedition Lineup</div>
                  <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Ultralight Trail & Trekking Gear</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${theme.primary};">All Expedition Gear →</a>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(21,128,61,0.04);transition:transform 0.3s;">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1;background:${theme.bg};position:relative;overflow:hidden;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:20px;">
                        <span style="position:absolute;top:12px;left:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:999px;">${esc(p.badge)}</span>
                      </div>
                      <div style="padding:22px;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-size:1.02rem;font-weight:900;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid ${theme.cardBorder};">
                          <span style="font-size:0.78rem;color:${theme.textSub};">MOQ: ${esc(p.moq)}</span>
                          <span style="font-size:0.82rem;font-weight:800;color:${theme.primary};">Gear Specs ↗</span>
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
      <main class="sports-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.catalog)} · Complete Outdoor Assortment
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">
              ${isVideo ? 'Kinetic Athletic & Fitness Equipment Lineup' : 'Alpine Mountaineering & Outdoor Expedition Gear'}
            </h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Custom colorways, private label branding, and bulk wholesale logistics support.</p>
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
                    <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">View Specs & MOQ ↗</div>
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
      <main class="sports-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:24px;">
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${theme.primary};">← Back to Outdoor Catalog</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:30px;position:relative;">
              <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:420px;object-fit:contain;display:block;" fetchpriority="high">
              <div class="wr-detail-thumbs" style="display:flex;gap:12px;margin-top:20px;">
                <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:6px;padding:4px;background:#fff;cursor:pointer;">
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
                  <div><strong>Fabric / Alloy:</strong><br>${esc(p.material)}</div>
                  <div><strong>Dimensions / Weight:</strong><br>${esc(p.dimensions)}</div>
                  <div><strong>Performance:</strong><br>${esc(p.extra)}</div>
                  <div><strong>Production MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                </div>
              </div>

              <div style="display:flex;gap:14px;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:14px 32px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                  Request Sample Batch ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                  OEM Brand Customization
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, `${company.name} · Certified Expedition Gear Works`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2014', num: 2014, label: 'Established', desc: 'Continuous field testing' },
      { value: '5,000 M', num: 5000, label: 'Elevation Tested', desc: 'High alpine validation' },
      { value: 'UIAA / CE', num: 100, label: 'Safety Certified', desc: 'Climbing standard certified' },
      { value: '50+ Expeditions', num: 50, label: 'Worldwide Expeditions', desc: 'Karakoram & Alps tested' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="sports-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                ${esc(ui.about)} · Alpine Heritage
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;">
                ${esc(headline)}
              </h1>
              ${storyParagraphs.map(p => `<p style="font-size:1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-radius:20px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(0,0,0,0.06);">
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
            <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Direct Outdoor Factory Partnership</h2>
            <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 20px;">We support private label technical outdoor apparel, custom backpack colorways, branded tent kits, and wholesale export programs.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:12px 28px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.9rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
              Initiate Gear RFQ ↗
            </a>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'contact') {
    mainHtml = `
      <main class="sports-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <header style="text-align:center;max-width:620px;margin:0 auto 48px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.contact)} · Outdoor Sourcing Desk
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">Submit Your Outdoor Gear Inquiry</h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory response with container volume pricing, fabric sample swatches, and OEM lead times.</p>
          </header>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
              <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Request For Quotation</h2>
              <form style="display:grid;gap:16px;">
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Gear Category / SKU</label>
                  <select name="productId" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    <option value="">— Select Outdoor Equipment (Optional) —</option>
                    ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Order Quantity</label>
                    <input type="text" disabled placeholder="e.g. 300 Sets" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Custom Logo / Branding</label>
                    <input type="text" disabled placeholder="Heat Transfer / Embroidery" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                </div>
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Technical Requirements</label>
                  <textarea disabled rows="4" placeholder="Detail required fabric specs (Dyneema, Cordura, Pertex), waterproof ratings (10K/20K), or field test certifications..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                </div>
                <button type="submit" disabled style="padding:14px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 14px ${theme.accentGlow};">
                  Submit Gear Inquiry ↗
                </button>
              </form>
            </div>

            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Export Factory Office</h2>
                <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.7;margin:0 0 20px;">
                  Equipped with automated laser cutting tables, hot-air seam taping machines, high-frequency ultrasonic welding, and computerized hydrostatic pressure test columns.
                </p>
                <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.8;">
                  <div><strong>Company:</strong> ${esc(company.name || brandName)}</div>
                  <div><strong>Email:</strong> ${esc(company.email || 'export@outdoorequipment.com')}</div>
                  <div><strong>Factory Location:</strong> High-Tech Textile & Gear Manufacturing Zone</div>
                  <div><strong>Certifications:</strong> UIAA, CE EN 1078, RDS Down, Bluesign</div>
                </div>
              </div>
              <div style="padding:16px;background:${theme.bg};border-radius:10px;font-size:0.78rem;color:${theme.textSub};line-height:1.5;margin-top:24px;">
                🏔️ Field Proven: All production runs undergo rain chamber simulation and fabric tear tensile testing before container loading.
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="sports-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;color:${theme.textSub};font-size:0.84rem;">
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
            <div>✓ Hydrostatic 20,000mm Tested</div>
            <div>✓ UIAA & CE Safety Approved</div>
            <div>✓ Responsible Down Standard (RDS)</div>
          </div>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;align-items:center;justify-content:space-between;font-size:0.78rem;">
        <div>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved. Outdoor Equipment Export Portal.</div>
        <div style="display:flex;gap:16px;">
          <span>ISO 9001:2015</span>
          <span>Bluesign Certified</span>
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
