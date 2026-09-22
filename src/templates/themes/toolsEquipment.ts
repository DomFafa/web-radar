import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { getIndustryPlaceholder } from './industryPlaceholders';

export interface ThemedToolsItem {
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

export const TOOLS_DEFAULT_PRODUCTS: ThemedToolsItem[] = [
  {
    id: 'tl-1',
    name: 'Precision Solid Carbide 4-Flute End Mill',
    desc: 'Ultra-micrograin tungsten carbide with AlTiN multilayer PVD nanocoating, sub-micron DIN tolerance, and 38° variable helix geometry.',
    badge: '±0.002mm DIN',
    category: 'milling',
    categoryNameZh: '',
    categoryNameEn: 'Precision Tooling',
    material: 'Micrograin Tungsten Carbide (0.4μm, 10% Co)',
    dimensions: 'Ø 12.000 × 35 × 85 mm · 4 Flutes',
    extra: 'HRC 65+ Hardened Steel',
    moq: '50 Pcs',
    tagline: 'Sub-Micron DIN Tolerance Tooling',
    img: getIndustryPlaceholder('tools', 0),
  },
  {
    id: 'tl-2',
    name: 'Heavy-Duty 20V Max Brushless Rotary Hammer',
    desc: 'Industrial-grade brushless motor delivering 3.2 Joules impact energy with anti-vibration counterweight system and magnesium gearbox.',
    badge: 'Jobsite Pro 3.2J',
    category: 'hammer',
    categoryNameZh: '',
    categoryNameEn: 'Power Equipment',
    material: 'Magnesium Gearbox + Glass-Fiber Polyamide',
    dimensions: '340 × 220 × 90 mm · 3.4kg',
    extra: 'IP56 Ingress Protection',
    moq: '200 Units',
    tagline: 'Brushless 3.2J Concrete Impact',
    img: getIndustryPlaceholder('tools', 1),
  },
  {
    id: 'tl-3',
    name: 'CrV 72-Tooth Metric Ratchet Wrench Set',
    desc: 'Drop-forged Chrome Vanadium steel 72-tooth fine ratchet mechanism with 5° swing arc, mirror-polished finish, and blow-molded case.',
    badge: '72-Tooth CrV',
    category: 'wrench',
    categoryNameZh: '',
    categoryNameEn: 'Hand Tools',
    material: 'Chrome Vanadium Steel 6140',
    dimensions: '1/4" + 3/8" + 1/2" · 94pc Set',
    extra: '5° Fine Ratchet Arc',
    moq: '200 Sets',
    tagline: '72-Tooth 5° Swing CrV Steel',
    img: getIndustryPlaceholder('tools', 2),
  },
  {
    id: 'tl-4',
    name: 'Brushless 20V Cordless Circular Saw',
    desc: '20V brushless motor circular saw with 5800 RPM no-load speed, magnesium baseplate, laser cutting guide, and integrated dust chute.',
    badge: '5800 RPM BLDC',
    category: 'saw',
    categoryNameZh: '',
    categoryNameEn: 'Power Equipment',
    material: 'Magnesium Alloy Guard + BLDC Motor',
    dimensions: '355 × 250 × 240 mm · 3.6kg',
    extra: '5800 RPM Brushless Motor',
    moq: '300 Units',
    tagline: 'Magnesium Base 5800 RPM Saw',
    img: getIndustryPlaceholder('tools', 3),
  },
  {
    id: 'tl-5',
    name: 'Digital Optical Metrology Caliper 0-150mm',
    desc: 'Stainless steel digital vernier caliper with 0.001mm resolution, IP67 coolant-proof inductive measuring system, and SPC data output.',
    badge: '0.001mm Res',
    category: 'metrology',
    categoryNameZh: '',
    categoryNameEn: 'Precision Metrology',
    material: 'Hardened Stainless Steel (HRC 53-55)',
    dimensions: '235 × 75 × 15 mm · 185g',
    extra: 'IP67 Coolant Proof',
    moq: '300 Pcs',
    tagline: 'IP67 Digital Metrology 0.001mm',
    img: getIndustryPlaceholder('tools', 4),
  },
  {
    id: 'tl-6',
    name: '180 N·m High-Torque Brushless Impact Driver',
    desc: 'Compact 1/4-inch hex impact driver with 180 N·m peak torque, 3-speed selector, and smart screw tap mode to prevent thread stripping.',
    badge: '180 N·m Peak',
    category: 'impact',
    categoryNameZh: '',
    categoryNameEn: 'Power Equipment',
    material: 'High-Impact PA6-GF30 Composite',
    dimensions: '130 × 65 × 195 mm · 1.1kg',
    extra: '3-Speed Smart Mode',
    moq: '500 Units',
    tagline: '180 N·m Compact Impact Driver',
    img: getIndustryPlaceholder('tools', 5),
  },
  {
    id: 'tl-7',
    name: 'PCD Diamond Tipped Precision Indexable Insert',
    desc: 'Polycrystalline diamond (PCD) cutting edge for mirror-finish high-speed machining of aluminum alloys, brass, and composite materials.',
    badge: 'PCD Diamond',
    category: 'insert',
    categoryNameZh: '',
    categoryNameEn: 'Precision Tooling',
    material: 'Polycrystalline Diamond + Carbide Base',
    dimensions: 'CNMG 120408 PCD Standard',
    extra: 'Sub-Ra 0.2 Surface Finish',
    moq: '100 Pcs',
    tagline: 'PCD Mirror Finish Turning',
    img: getIndustryPlaceholder('tools', 6),
  },
  {
    id: 'tl-8',
    name: 'Industrial Continuous Pneumatic Air Impact Wrench',
    desc: '1/2-inch square drive pneumatic twin-hammer impact wrench delivering 1200 N·m breakaway torque with magnesium housing.',
    badge: '1200 N·m Air',
    category: 'pneumatic',
    categoryNameZh: '',
    categoryNameEn: 'Pneumatic Tools',
    material: 'Forged Twin Hammer + Magnesium Shell',
    dimensions: '185 × 70 × 190 mm · 2.1kg',
    extra: 'Twin-Hammer Mechanism',
    moq: '200 Units',
    tagline: 'Twin Hammer 1200 N·m Torque',
    img: getIndustryPlaceholder('tools', 7),
  },
];

function getToolsProducts(ctx: ThemeContext): ThemedToolsItem[] {
  const isTyped = isTypedMaterialsSource(ctx.draft);
  if (isTyped) {
    return ctx.draft.products.map((p, i) => {
      const def = TOOLS_DEFAULT_PRODUCTS[i % TOOLS_DEFAULT_PRODUCTS.length]!;
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
      const def = TOOLS_DEFAULT_PRODUCTS[i % TOOLS_DEFAULT_PRODUCTS.length]!;
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

  return TOOLS_DEFAULT_PRODUCTS;
}

export function renderToolsPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getToolsProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'TitanForge Contractor Power Equipment' : 'Vektor Metrology & Precision CNC Tooling');
  const brandTagline = isVideo ? 'Heavy-Duty Contractor Power & Pneumatics' : 'Sub-Micron DIN Tolerance & Solid Carbide';

  // Light palettes only - strictly no dark mode
  const theme = isVideo
    ? {
      bg: '#fffbeb',
      cardBg: '#ffffff',
      cardBorder: 'rgba(217,119,6,0.18)',
      primary: '#d97706',
      primaryHover: '#b45309',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(255,251,235,0.92)',
      pillBg: '#fef3c7',
      pillText: '#b45309',
      btnGradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      accentGlow: 'rgba(217,119,6,0.22)',
    }
    : {
      bg: '#f0f7ff',
      cardBg: '#ffffff',
      cardBorder: 'rgba(2,132,199,0.18)',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(240,247,255,0.92)',
      pillBg: '#e0f2fe',
      pillText: '#0369a1',
      btnGradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
      accentGlow: 'rgba(2,132,199,0.2)',
    };

  // Distinct Header for each variant
  const headerHtml = isVideo ? `
    <header class="tools-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="background:#fef3c7;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${theme.primary};"></span>
          <span>DYNAMOMETER TEST: 180 N·m PEAK TORQUE PASS · IP56 JOBSITE SEALED</span>
        </div>
        <div>CONTRACTOR FLEET WARRANTY: 3-YEAR HEAVY DUTY GUARANTEED</div>
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
            Contractor Fleet RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="tools-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;">${esc(brandName)}</span>
              <span style="display:inline-block;padding:2px 6px;border-radius:3px;background:#e0f2fe;color:#0284c7;font-size:0.62rem;font-weight:800;font-family:monospace;">DIN ±0.002mm</span>
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
            CAD Model Desk ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // 1. CONTRACTOR JOBSITE DYNAMOMETER SHOWCASE HERO
      mainHtml = `
        <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Dynamometer Showcase Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Heavy-Duty Contractor Power · 20V Max Brushless Platform
                </div>
                <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Extreme Jobsite Power: 180 N·m High-Torque Brushless')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered for commercial contractors with reinforced glass-fiber polyamide shells, all-metal planetary gearboxes, and IP56 dust & water sealing.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Heavy Equipment Deck ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Fleet Wholesale Pricing
                  </a>
                </div>
                <!-- Jobsite Dynamometer Telemetry -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Peak Torque</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">180 N·m</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Dynamometer verified</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Impact Energy</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">3.2 Joules</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Concrete drilling rate</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Torture Rating</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">2.5m Drop</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Concrete impact survival</div>
                  </div>
                </div>
              </div>

              <!-- Realtime Jobsite Monitor Screen Console -->
              <div style="position:relative;">
                <div style="border-radius:16px;overflow:hidden;background:${theme.cardBg};border:2px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(217,119,6,0.14);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-family:monospace;font-weight:700;">
                    DYNAMOMETER HUD: 2400 RPM
                  </div>
                  <div style="position:absolute;bottom:16px;right:16px;background:rgba(217,119,6,0.92);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;">
                    IP56 JOBSITE SEALED
                  </div>
                </div>
                <div style="margin-top:14px;background:${theme.cardBg};border-radius:10px;padding:12px 18px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;">
                  <span style="font-weight:700;color:${theme.text};">EQUIPMENT: ${esc(heroProduct.name)}</span>
                  <span style="font-weight:800;color:${theme.primary};">${esc(heroProduct.moq)} MOQ</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Jobsite Torture Test Matrix -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Commercial Durability</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Jobsite Torture Test Matrix
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Built to withstand extreme contractor conditions, vibration cycles, abrasive silica dust, and torrential weather.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">2.5 M</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Concrete Drop Survival</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">PA6-GF30 composite absorbs extreme drop impacts</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">IP56</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Silica Dust &amp; Water</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Full silicone gasket seal prevents abrasive ingress</p>
                </div>
                <div style="background:${theme.bg};border:2px solid ${theme.primary};border-radius:12px;padding:22px 16px;text-align:center;box-shadow:0 8px 24px rgba(217,119,6,0.1);">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">500 H</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.primary};margin:0 0 6px;">Continuous Run Cycle</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Heavy-duty armature winding and dual ball bearings</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">-20°C</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Sub-Zero Start</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Cold-weather lithium cell management circuitry</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Contractor Tools Showcase -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Commercial Equipment Series</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Contractor Power Fleet
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View Full Equipment Deck (${products.length}) →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(217,119,6,0.04);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#fffdf5;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
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
      // 2. METROLOGY & PRECISION CNC TOOLING BLUEPRINT CANVAS HERO
      mainHtml = `
        <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Engineering Blueprint Drafting Table Canvas Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  [ DIN EN ISO 286 · SUB-MICRON TOLERANCE CLASS IT5 ]
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Sub-Micron Precision Tooling: Solid Carbide & PCD Diamond')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.75;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Precision engineered tungsten carbide tooling manufactured with ±0.002mm runout tolerance, AlTiN multilayer PVD nanocoatings, and 100% optical CMM inspection.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Machining Catalog ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Metrology Cleanroom (20°C)
                  </a>
                </div>
                <!-- Precision Metrology Badge -->
                <div style="display:flex;align-items:center;gap:18px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="width:48px;height:48px;border-radius:8px;border:2px solid ${theme.primary};display:flex;align-items:center;justify-content:center;color:${theme.primary};font-weight:900;font-size:0.8rem;background:#fff;font-family:monospace;">
                    ±2μm
                  </div>
                  <div>
                    <div style="font-weight:800;font-size:0.9rem;color:${theme.text};">ISO 17025 Traceable Metrology</div>
                    <div style="font-size:0.78rem;color:${theme.textSub};">Zeiss 3D CMM verified runout TIR &lt; 0.003mm</div>
                  </div>
                </div>
              </div>

              <!-- Blueprint-Framed Tool Showcase Card -->
              <div style="position:relative;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 24px 50px rgba(2,132,199,0.08);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:20px;left:20px;background:rgba(240,247,255,0.92);backdrop-filter:blur(8px);padding:8px 16px;border-radius:6px;border:1px solid ${theme.cardBorder};">
                    <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};font-family:monospace;">CAD: Ø 12.000 ±0.002mm</span>
                  </div>
                  <div style="position:absolute;bottom:20px;right:20px;background:${theme.primary};color:#fff;padding:6px 14px;border-radius:6px;font-size:0.75rem;font-weight:800;">
                    HRC 65+ HARDENED
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Sub-Micron Precision Comparator Matrix -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Sub-Micron Benchmark</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Engineering Tolerance &amp; Metallurgy Matrix
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Comparing conventional tooling against Vektor sub-micron tungsten carbide geometries under high-speed milling loads.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">TOLERANCE CLASS</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">±0.002 mm DIN</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">IT5 Precision Grade</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Eliminates tool deflection and chatter marks during high-speed aerospace finishing.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">CARBIDE GRAIN</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">0.4 μm Ultra-Fine</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">10% Cobalt Binder</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    TRS 4,200 MPa high transverse rupture strength prevents cutting edge micro-chipping.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">PVD COATING</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">AlTiN Multilayer</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">Thermal Barrier 900°C</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    3,300 HV nano-hardness resists abrasive flank wear during dry high-feed milling.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">SHAFT RUNOUT</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">TIR &lt; 0.003 mm</h4>
                  <div style="font-size:0.75rem;font-family:monospace;color:${theme.textSub};margin-bottom:8px;">Dynamic Laser Balanced</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    G2.5 balance rating certified up to 30,000 RPM spindle velocity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Blueprint Tools Showcase -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Machining &amp; Metrology Fleet</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Featured Precision Tooling
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View Full Machining Matrix (${products.length}) →
                </a>
              </div>

              <!-- Asymmetric 1-wide + 2-stacked layout -->
              <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:28px;">
                <!-- Wide Masterpiece Tool -->
                <article data-wr-product-id="${esc(heroProduct.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(2,132,199,0.06);display:flex;flex-direction:column;">
                  <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;flex:1;">
                    <div style="aspect-ratio:1.3;background:#f5f9ff;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                    </div>
                  </a>
                  <div style="padding:24px;">
                    <span style="font-size:0.75rem;color:${theme.primary};font-weight:800;letter-spacing:0.04em;font-family:monospace;">DRAWING #VEK-01</span>
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

                <!-- Stacked Side Tools -->
                <div style="display:flex;flex-direction:column;gap:24px;">
                  ${products.slice(1, 3).map((p, idx) => `
                    <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(2,132,199,0.04);display:grid;grid-template-columns:140px 1fr;align-items:center;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;height:100%;">
                        <div style="height:100%;min-height:140px;background:#f5f9ff;display:flex;align-items:center;justify-content:center;border-right:1px solid ${theme.cardBorder};">
                          <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                        </div>
                      </a>
                      <div style="padding:18px 20px;">
                        <span style="font-size:0.7rem;font-weight:800;color:${theme.primary};font-family:monospace;">SCHEMATIC #0${idx + 2}</span>
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
      // METROLOGY & PRECISION CNC TOOLING CAD DECK
      mainHtml = `
        <main class="tools-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 80px;">
          <div class="wrap" style="padding:0 24px;">

            <!-- Top Blueprint CAD HUD -->
            <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.2);border-radius:12px;padding:12px 20px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 2px 10px rgba(2,132,199,0.04);">
              <div style="display:flex;align-items:center;gap:10px;font-family:monospace;font-size:0.75rem;font-weight:800;color:#0284c7;letter-spacing:0.06em;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7;box-shadow:0 0 8px #0284c7;"></span>
                <span>[DIN EN ISO 286 METROLOGY: ACTIVE] // 5-AXIS CNC · RUNOUT TIR &lt; 0.002MM · SPINDLE BALANCED G2.5 40,000 RPM · 100% CMM INSPECTED</span>
              </div>
              <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#64748b;">
                CALIBRATION LAB: ISO 17025 ACCREDITED
              </div>
            </div>

            <!-- Page Title & Engineering Filter Matrix -->
            <div style="border-bottom:2px solid rgba(2,132,199,0.18);padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border-radius:6px;background:#e0f2fe;color:#0369a1;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;border:1px solid #bae6fd;">
                <span style="font-family:monospace;font-weight:900;">CAD-REF // 2026-IT5</span>
                <span>• Sub-Micron Solid Carbide &amp; Metrology Registry</span>
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.9rem);font-weight:900;color:#0f172a;margin:0 0 16px;letter-spacing:-0.03em;">
                Industrial Hardware &amp; Precision CNC Tooling Deck
              </h1>
              <p style="font-size:1.02rem;color:#475569;line-height:1.7;max-width:820px;margin:0 0 20px;">
                Aerospace-grade solid micrograin carbide end mills, indexable PCD/CBN inserts, and calibrated digital optical micrometers engineered for CNC machining centers under continuous heavy-feed conditions.
              </p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:800;font-family:monospace;">
                <span style="padding:8px 18px;border-radius:8px;background:#0284c7;color:#fff;box-shadow:0 4px 12px rgba(2,132,199,0.25);">[TOOL-01: ALL PRECISION HARDWARE (${products.length})]</span>
                <span style="padding:8px 18px;border-radius:8px;background:#fff;color:#475569;border:1px solid #cbd5e1;">[TOOL-02: SOLID CARBIDE END MILLS]</span>
                <span style="padding:8px 18px;border-radius:8px;background:#fff;color:#475569;border:1px solid #cbd5e1;">[TOOL-03: PCD / CBN INSERT SERIES]</span>
                <span style="padding:8px 18px;border-radius:8px;background:#fff;color:#475569;border:1px solid #cbd5e1;">[TOOL-04: DIGITAL MICROMETERS &amp; CALIPERS]</span>
              </div>
            </div>

            <!-- Blueprint Technical Tool Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:28px;">
              ${products.map((p, idx) => `
                <article data-wr-product-id="${esc(p.id)}" style="background:#ffffff;border:1px solid rgba(2,132,199,0.22);border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(2,132,199,0.06);display:flex;flex-direction:column;position:relative;transition:transform 0.2s ease, box-shadow 0.2s ease;">
                  <!-- Card Header Blueprint HUD -->
                  <div style="background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;font-family:monospace;font-size:0.72rem;">
                    <span style="font-weight:800;color:#0284c7;">TL-DIN0${idx + 1} // 4-FLUTE SOLID CARBIDE</span>
                    <span style="padding:2px 6px;border-radius:4px;background:#ecfdf5;color:#059669;font-weight:800;border:1px solid #a7f3d0;">ISO 17025 PASS</span>
                  </div>

                  <!-- Technical CAD Blueprint Viewport Frame -->
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;position:relative;">
                    <div style="aspect-ratio:1.05;background:radial-gradient(circle at center, #ffffff 0%, #f0f7ff 100%);position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #e2e8f0;overflow:hidden;">
                      <!-- Blueprint Grid Subtle Lines -->
                      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(2,132,199,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(2,132,199,0.06) 1px, transparent 1px);background-size:20px 20px;pointer-events:none;"></div>
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;position:relative;z-index:1;transition:transform 0.3s ease;">
                      <span style="position:absolute;top:12px;left:12px;background:#ffffff;border:1px solid #bae6fd;color:#0369a1;font-size:0.7rem;font-weight:800;padding:3px 10px;border-radius:6px;font-family:monospace;z-index:2;box-shadow:0 2px 6px rgba(2,132,199,0.1);">
                        ${esc(p.badge)}
                      </span>
                      <span style="position:absolute;bottom:12px;right:12px;background:#e0f2fe;color:#0369a1;font-size:0.7rem;font-weight:800;padding:3px 10px;border-radius:6px;font-family:monospace;z-index:2;border:1px solid #bae6fd;">
                        DIN IT5 (±0.002mm)
                      </span>
                    </div>
                  </a>

                  <!-- Card Body -->
                  <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                      <div style="font-family:monospace;font-size:0.72rem;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">
                        ${esc(p.categoryNameEn)}
                      </div>
                      <h3 style="font-size:1.18rem;font-weight:900;color:#0f172a;margin:0 0 10px;line-height:1.35;">
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                      </h3>
                      <p style="font-size:0.86rem;color:#475569;line-height:1.6;margin:0 0 18px;">
                        ${esc(p.desc)}
                      </p>

                      <!-- Dual Metrology Telemetry Gauge -->
                      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                          <div style="font-size:0.7rem;font-family:monospace;color:#64748b;margin-bottom:3px;">RUNOUT (TIR):</div>
                          <div style="font-size:0.92rem;font-weight:900;color:#0284c7;font-family:monospace;">&lt; 0.002 mm</div>
                        </div>
                        <div>
                          <div style="font-size:0.7rem;font-family:monospace;color:#64748b;margin-bottom:3px;">HARDNESS:</div>
                          <div style="font-size:0.92rem;font-weight:900;color:#ea580c;font-family:monospace;">HRC 68+</div>
                        </div>
                      </div>

                      <!-- Spec Strip -->
                      <div style="display:flex;flex-direction:column;gap:6px;font-size:0.78rem;margin-bottom:18px;">
                        <div style="display:flex;justify-content:space-between;color:#64748b;border-bottom:1px dashed #e2e8f0;padding-bottom:4px;">
                          <span>Substrate / Matrix:</span>
                          <strong style="color:#0f172a;">${esc(p.material)}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;color:#64748b;border-bottom:1px dashed #e2e8f0;padding-bottom:4px;">
                          <span>Dimensions / Geometry:</span>
                          <strong style="color:#0f172a;">${esc(p.dimensions)}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;color:#64748b;padding-bottom:2px;">
                          <span>Surface Nanocoating:</span>
                          <strong style="color:#0284c7;">${esc(p.extra)}</strong>
                        </div>
                      </div>
                    </div>

                    <!-- Footer Action Strip -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid #e2e8f0;">
                      <span style="font-size:0.8rem;color:#64748b;font-family:monospace;">MOQ: <strong style="color:#0284c7;">${esc(p.moq)}</strong></span>
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.84rem;font-weight:800;color:#0284c7;display:inline-flex;align-items:center;gap:4px;">
                        INSPECT TOOLING BLUEPRINT ↗
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
      // CONTRACTOR JOBSITE POWER EQUIPMENT & HEAVY MACHINERY DECK
      mainHtml = `
        <main class="tools-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 80px;">
          <div class="wrap" style="padding:0 24px;">

            <!-- Top Dynamometer Heavy Lab HUD -->
            <div style="background:#ffffff;border:1px solid rgba(217,119,6,0.22);border-radius:12px;padding:12px 20px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 2px 10px rgba(217,119,6,0.04);">
              <div style="display:flex;align-items:center;gap:10px;font-family:monospace;font-size:0.75rem;font-weight:800;color:#d97706;letter-spacing:0.06em;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d97706;box-shadow:0 0 8px #d97706;"></span>
                <span>[HEAVY POWER &amp; DYNAMOMETER LAB: ACTIVE] // 180 N·M TORQUE PEAK · IP56 JOBSITE SEALED · 2.5M IMPACT DROP TESTED · 3-YEAR FLEET WARRANTY</span>
              </div>
              <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#64748b;">
                COMMERCIAL FLEET: CONTRACTOR GRADE
              </div>
            </div>

            <!-- Page Title & Classification Filter Matrix -->
            <div style="border-bottom:2px solid rgba(217,119,6,0.2);padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border-radius:6px;background:#fef3c7;color:#b45309;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;border:1px solid #fde68a;">
                <span style="font-family:monospace;font-weight:900;">RIG-FLEET // 2026-HEAVY</span>
                <span>• Commercial Contractor Jobsite Machinery Registry</span>
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.9rem);font-weight:900;color:#0f172a;margin:0 0 16px;letter-spacing:-0.03em;">
                Contractor Power Equipment &amp; Heavy Machinery Deck
              </h1>
              <p style="font-size:1.02rem;color:#475569;line-height:1.7;max-width:820px;margin:0 0 20px;">
                High-torque 4-pole brushless demolition hammers, twin-hammer pneumatic wrenches, and magnesium-chassis circular saws engineered for abusive continuous concrete and structural steel jobsite environments.
              </p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:800;font-family:monospace;">
                <span style="padding:8px 18px;border-radius:8px;background:#d97706;color:#fff;box-shadow:0 4px 12px rgba(217,119,6,0.25);">[MACHINERY-01: ALL CONTRACTOR FLEET (${products.length})]</span>
                <span style="padding:8px 18px;border-radius:8px;background:#fff;color:#475569;border:1px solid #cbd5e1;">[MACHINERY-02: BRUSHLESS ROTARY HAMMERS]</span>
                <span style="padding:8px 18px;border-radius:8px;background:#fff;color:#475569;border:1px solid #cbd5e1;">[MACHINERY-03: HIGH-TORQUE IMPACT DRIVERS]</span>
                <span style="padding:8px 18px;border-radius:8px;background:#fff;color:#475569;border:1px solid #cbd5e1;">[MACHINERY-04: HEAVY PNEUMATIC WRENCHES]</span>
              </div>
            </div>

            <!-- Heavy Contractor Equipment Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:28px;">
              ${products.map((p, idx) => `
                <article data-wr-product-id="${esc(p.id)}" style="background:#ffffff;border:1px solid rgba(217,119,6,0.22);border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(217,119,6,0.06);display:flex;flex-direction:column;position:relative;transition:transform 0.2s ease, box-shadow 0.2s ease;">
                  <!-- Card Header HUD -->
                  <div style="background:#fffbeb;border-bottom:1px solid #fef3c7;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;font-family:monospace;font-size:0.72rem;">
                    <span style="font-weight:800;color:#d97706;">RIG-HD0${idx + 1} // BLDC MOTOR FLEET</span>
                    <span style="padding:2px 6px;border-radius:4px;background:#fef2f2;color:#dc2626;font-weight:800;border:1px solid #fecaca;">DROP PASS 2.5M</span>
                  </div>

                  <!-- Workshop Forged Viewport Frame -->
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;position:relative;">
                    <div style="aspect-ratio:1.05;background:radial-gradient(circle at center, #ffffff 0%, #fffdf7 100%);position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #fde68a;overflow:hidden;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;position:relative;z-index:1;transition:transform 0.3s ease;">
                      <span style="position:absolute;top:12px;left:12px;background:#ffffff;border:1px solid #fde68a;color:#b45309;font-size:0.7rem;font-weight:800;padding:3px 10px;border-radius:6px;font-family:monospace;z-index:2;box-shadow:0 2px 6px rgba(217,119,6,0.1);">
                        ${esc(p.badge)}
                      </span>
                      <span style="position:absolute;bottom:12px;right:12px;background:#fef3c7;color:#b45309;font-size:0.7rem;font-weight:800;padding:3px 10px;border-radius:6px;font-family:monospace;z-index:2;border:1px solid #fde68a;">
                        IP56 SEALED
                      </span>
                    </div>
                  </a>

                  <!-- Card Body -->
                  <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                      <div style="font-family:monospace;font-size:0.72rem;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">
                        ${esc(p.categoryNameEn)}
                      </div>
                      <h3 style="font-size:1.18rem;font-weight:900;color:#0f172a;margin:0 0 10px;line-height:1.35;">
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                      </h3>
                      <p style="font-size:0.86rem;color:#475569;line-height:1.6;margin:0 0 18px;">
                        ${esc(p.desc)}
                      </p>

                      <!-- Dual Dynamometer Telemetry Gauge -->
                      <div style="background:#fffdfa;border:1px solid #fed7aa;border-radius:12px;padding:12px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                          <div style="font-size:0.7rem;font-family:monospace;color:#64748b;margin-bottom:3px;">PEAK TORQUE:</div>
                          <div style="font-size:0.92rem;font-weight:900;color:#d97706;font-family:monospace;">180 N·m Peak</div>
                        </div>
                        <div>
                          <div style="font-size:0.7rem;font-family:monospace;color:#64748b;margin-bottom:3px;">VIBRATION (HAV):</div>
                          <div style="font-size:0.92rem;font-weight:900;color:#059669;font-family:monospace;">&lt; 1.2 m/s²</div>
                        </div>
                      </div>

                      <!-- Spec Strip -->
                      <div style="display:flex;flex-direction:column;gap:6px;font-size:0.78rem;margin-bottom:18px;">
                        <div style="display:flex;justify-content:space-between;color:#64748b;border-bottom:1px dashed #fed7aa;padding-bottom:4px;">
                          <span>Motor &amp; Enclosure:</span>
                          <strong style="color:#0f172a;">${esc(p.material)}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;color:#64748b;border-bottom:1px dashed #fed7aa;padding-bottom:4px;">
                          <span>Dimensions &amp; Weight:</span>
                          <strong style="color:#0f172a;">${esc(p.dimensions)}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;color:#64748b;padding-bottom:2px;">
                          <span>Rating / Capacity:</span>
                          <strong style="color:#d97706;">${esc(p.extra)}</strong>
                        </div>
                      </div>
                    </div>

                    <!-- Footer Action Strip -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid #fde68a;">
                      <span style="font-size:0.8rem;color:#64748b;font-family:monospace;">MOQ: <strong style="color:#d97706;">${esc(p.moq)}</strong></span>
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.84rem;font-weight:800;color:#d97706;display:inline-flex;align-items:center;gap:4px;">
                        INSPECT CONTRACTOR RIG ↗
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
    const p = products.find(item => item.id === ctx.options.productId) || heroProduct;
    if (!isVideo) {
      // 3-TIER CAD METROLOGY DOSSIER & TOOLING WORKSTATION
      mainHtml = `
        <main class="tools-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 80px;">
          <div class="wrap" style="padding:0 24px;">

            <!-- Tier 1: Metrology Breadcrumb & Tolerance Badges -->
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid rgba(2,132,199,0.18);">
              <div style="display:flex;align-items:center;gap:8px;font-family:monospace;font-size:0.82rem;font-weight:800;">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:#0284c7;">METROLOGY_LAB</a>
                <span style="color:#94a3b8;">//</span>
                <span style="color:#64748b;">CNC_TOOLING_DECK</span>
                <span style="color:#94a3b8;">//</span>
                <span style="color:#0f172a;">${esc(p.id).toUpperCase()}</span>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span style="padding:4px 12px;border-radius:20px;background:#e0f2fe;color:#0369a1;font-size:0.72rem;font-weight:800;border:1px solid #bae6fd;font-family:monospace;">
                  DIN IT5 CERTIFIED (±0.002MM)
                </span>
                <span style="padding:4px 12px;border-radius:20px;background:#fef3c7;color:#b45309;font-size:0.72rem;font-weight:800;border:1px solid #fde68a;font-family:monospace;">
                  ISO 17025 CMM SERIALIZED
                </span>
              </div>
            </div>

            <!-- Tier 2: Two-Column Metrology Workbench -->
            <div style="display:grid;grid-template-columns:minmax(340px, 1.05fr) minmax(360px, 1.25fr);gap:44px;align-items:start;margin-bottom:48px;">
              <!-- Left Column: Drafting Viewport, Spindle Telemetry & Wear Benchmarks -->
              <div>
                <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.22);border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(2,132,199,0.06);position:relative;">
                  <!-- Top Telemetry Status Header -->
                  <div style="background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;font-family:monospace;font-size:0.72rem;">
                    <span style="font-weight:800;color:#0284c7;">BALANCED: G2.5 @ 40,000 RPM // RUNOUT &lt; 0.002MM</span>
                    <span style="color:#059669;font-weight:800;">PASS CMM</span>
                  </div>

                  <!-- Image Viewport with Blueprint Drafting Backdrop -->
                  <div style="aspect-ratio:1.05;background:radial-gradient(circle at center, #ffffff 0%, #f0f7ff 100%);position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #e2e8f0;overflow:hidden;padding:24px;">
                    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(2,132,199,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(2,132,199,0.06) 1px, transparent 1px);background-size:24px 24px;pointer-events:none;"></div>
                    <img id="wr-detail-main-img" data-wr-material-image="product-main" data-wr-material-product="${esc(p.id)}" src="${esc(p.img)}" alt="${esc(p.name)}" style="max-width:85%;max-height:85%;object-fit:contain;position:relative;z-index:1;" fetchpriority="high">
                    <div style="position:absolute;top:16px;right:16px;background:#ffffff;border:1px solid #bae6fd;color:#0369a1;font-size:0.75rem;font-weight:800;padding:4px 12px;border-radius:6px;font-family:monospace;z-index:2;box-shadow:0 2px 6px rgba(2,132,199,0.1);">
                      DIN EN ISO 286
                    </div>
                  </div>

                  <!-- Channel / Viewpoint Thumbs Container -->
                  <div class="wr-detail-thumbs" style="padding:16px 20px;display:flex;gap:12px;background:#ffffff;justify-content:center;border-bottom:1px solid #e2e8f0;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid #0284c7;border-radius:8px;padding:3px;background:#ffffff;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:monospace;font-size:0.72rem;font-weight:800;color:#0284c7;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:36px;height:36px;object-fit:contain;">
                      <span>CH-1: PROFILE</span>
                    </button>
                    <button type="button" class="wr-detail-thumb" style="border:1px solid #cbd5e1;border-radius:8px;padding:3px;background:#ffffff;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:monospace;font-size:0.72rem;font-weight:800;color:#64748b;">
                      <span style="display:inline-block;width:36px;height:36px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#0284c7;font-size:0.75rem;">30°</span>
                      <span>CH-2: HELIX</span>
                    </button>
                    <button type="button" class="wr-detail-thumb" style="border:1px solid #cbd5e1;border-radius:8px;padding:3px;background:#ffffff;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:monospace;font-size:0.72rem;font-weight:800;color:#64748b;">
                      <span style="display:inline-block;width:36px;height:36px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#ea580c;font-size:0.75rem;">PVD</span>
                      <span>CH-3: COATING</span>
                    </button>
                  </div>

                  <!-- Metrology Calibration Quick Strip -->
                  <div style="padding:16px 20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;background:#f8fafc;text-align:center;font-size:0.78rem;">
                    <div>
                      <div style="font-weight:900;color:#0284c7;font-size:1.15rem;font-family:monospace;">±0.002 mm</div>
                      <div style="color:#64748b;font-size:0.72rem;font-family:monospace;">DIAMETER RUNOUT</div>
                    </div>
                    <div style="border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                      <div style="font-weight:900;color:#ea580c;font-size:1.15rem;font-family:monospace;">HRC 68+</div>
                      <div style="color:#64748b;font-size:0.72rem;font-family:monospace;">MICROGRAIN WC</div>
                    </div>
                    <div>
                      <div style="font-weight:900;color:#0284c7;font-size:1.15rem;font-family:monospace;">${esc(p.moq)}</div>
                      <div style="color:#64748b;font-size:0.72rem;font-family:monospace;">TOOLING MOQ</div>
                    </div>
                  </div>
                </div>

                <!-- Multi-Material Tool Wear & Cutting Speed Step Benchmark -->
                <div style="margin-top:20px;background:#ffffff;border:1px solid rgba(2,132,199,0.2);border-radius:18px;padding:22px;box-shadow:0 4px 16px rgba(2,132,199,0.04);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                    <div style="font-size:0.74rem;font-family:monospace;font-weight:800;color:#0284c7;letter-spacing:0.06em;text-transform:uppercase;">
                      [CUTTING SPEED (Vc) &amp; TOOL WEAR BENCHMARK]
                    </div>
                    <span style="font-size:0.7rem;padding:2px 8px;border-radius:4px;background:#e0f2fe;color:#0369a1;font-weight:800;">WALTER 5-AXIS VERIFIED</span>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:12px;">
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">Aluminum 6061-T6 (High-Speed Finishing)</span>
                        <span style="color:#0284c7;font-weight:800;">Vc = 450 m/min · 180+ hrs</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:94%;background:linear-gradient(90deg, #0284c7, #38bdf8);border-radius:3px;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">Pre-Hardened P20 Mold Steel</span>
                        <span style="color:#0284c7;font-weight:800;">Vc = 220 m/min · 120+ hrs</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:76%;background:linear-gradient(90deg, #0284c7, #38bdf8);border-radius:3px;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">D2 High-Carbon Tool Steel (HRC 58)</span>
                        <span style="color:#ea580c;font-weight:800;">Vc = 140 m/min · 85+ hrs</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:58%;background:linear-gradient(90deg, #ea580c, #f59e0b);border-radius:3px;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">Aerospace Inconel 718 Superalloy</span>
                        <span style="color:#b91c1c;font-weight:800;">Vc = 75 m/min · 45+ hrs</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:38%;background:linear-gradient(90deg, #dc2626, #f87171);border-radius:3px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Metallurgy Matrix & Fleet Volume Calculator -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:#e0f2fe;color:#0369a1;font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;border:1px solid #bae6fd;">
                  <span>${esc(p.categoryNameEn)}</span>
                  <span>• DIN IT5 Sub-Micron Precision Class</span>
                </div>
                <h1 style="font-size:clamp(1.9rem, 3.2vw, 2.7rem);font-weight:900;color:#0f172a;margin:0 0 14px;line-height:1.2;letter-spacing:-0.03em;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:#475569;line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- 4-Cell Tooling Metallurgy & Geometry Matrix -->
                <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.2);border-radius:18px;padding:24px;margin-bottom:24px;box-shadow:0 6px 20px rgba(2,132,199,0.04);">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#0284c7;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px;">
                    [METROLOGY &amp; SUBSTRATE ARCHITECTURE MATRIX]
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
                    <div style="background:#f8fafc;padding:14px;border-radius:10px;border:1px solid #e2e8f0;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">SUBSTRATE METALLURGY</span>
                      <strong style="color:#0f172a;font-size:0.88rem;display:block;">${esc(p.material)}</strong>
                      <span style="font-size:0.72rem;color:#64748b;">0.4μm ultra-fine grain sintered matrix</span>
                    </div>
                    <div style="background:#f8fafc;padding:14px;border-radius:10px;border:1px solid #e2e8f0;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">FLUTE GEOMETRY</span>
                      <strong style="color:#0f172a;font-size:0.88rem;display:block;">${esc(p.dimensions)}</strong>
                      <span style="font-size:0.72rem;color:#64748b;">30° variable helix anti-vibration pitch</span>
                    </div>
                    <div style="background:#f8fafc;padding:14px;border-radius:10px;border:1px solid #e2e8f0;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">PVD NANOCOATING</span>
                      <strong style="color:#0284c7;font-size:0.88rem;display:block;">${esc(p.extra)}</strong>
                      <span style="font-size:0.72rem;color:#64748b;">3,400 HV surface hardness, 900°C resist</span>
                    </div>
                    <div style="background:#f8fafc;padding:14px;border-radius:10px;border:1px solid #e2e8f0;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">RUNOUT &amp; BALANCING</span>
                      <strong style="color:#059669;font-size:0.88rem;display:block;">G2.5 @ 40,000 RPM</strong>
                      <span style="font-size:0.72rem;color:#64748b;">Radial runout TIR &lt; 0.002mm at flute</span>
                    </div>
                  </div>
                </div>

                <!-- Factory CNC Machining Fleet Volume Calculator -->
                <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.2);border-radius:18px;padding:24px;margin-bottom:24px;box-shadow:0 6px 20px rgba(2,132,199,0.04);">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#ea580c;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
                    [FACTORY CNC TOOLING FLEET VOLUME CALCULATOR]
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:12px;text-align:center;background:#f8fafc;">
                      <div style="font-size:0.72rem;font-family:monospace;color:#64748b;margin-bottom:4px;">EVALUATION TRIAL</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#0284c7;">10 Pcs</div>
                      <div style="font-size:0.72rem;color:#64748b;">Immediate dispatch</div>
                    </div>
                    <div style="border:2px solid #0284c7;border-radius:12px;padding:12px;text-align:center;background:#e0f2fe;">
                      <div style="font-size:0.72rem;font-family:monospace;color:#0369a1;font-weight:800;margin-bottom:4px;">PRODUCTION BATCH</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#0369a1;">200 Pcs</div>
                      <div style="font-size:0.72rem;color:#0369a1;">Standard tool crib stock</div>
                    </div>
                    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:12px;text-align:center;background:#f8fafc;">
                      <div style="font-size:0.72rem;font-family:monospace;color:#64748b;margin-bottom:4px;">ANNUAL CONTRACT</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#0284c7;">1,000+ Pcs</div>
                      <div style="font-size:0.72rem;color:#64748b;">Custom flute &amp; regrind</div>
                    </div>
                  </div>
                </div>

                <!-- Traceability & Calibration Dossier Badge Bar -->
                <div style="background:#f0f7ff;border:1px solid #bae6fd;border-radius:16px;padding:18px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                  <div>
                    <div style="font-size:0.85rem;font-weight:800;color:#0369a1;">ISO 17025 Metrology Inspection Certificate Included</div>
                    <div style="font-size:0.78rem;color:#075985;">Laser serialized tool shank with individual Zeiss 3D CMM inspection profile.</div>
                  </div>
                  <div style="display:flex;gap:6px;">
                    <span style="padding:4px 8px;background:#ffffff;border:1px solid #7dd3fc;color:#0369a1;border-radius:6px;font-size:0.72rem;font-weight:800;font-family:monospace;">CMM 3D</span>
                    <span style="padding:4px 8px;background:#ffffff;border:1px solid #7dd3fc;color:#0369a1;border-radius:6px;font-size:0.72rem;font-weight:800;font-family:monospace;">PVD CERT</span>
                  </div>
                </div>

                <!-- Action Strip -->
                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 32px;border-radius:12px;background:linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px rgba(2,132,199,0.25);">
                    REQUEST STEP CAD &amp; CUSTOM REGRIND QUOTE ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 24px;border-radius:12px;background:#ffffff;color:#0f172a;border:1px solid #cbd5e1;font-size:0.95rem;font-weight:800;">
                    Browse All Tooling
                  </a>
                </div>
              </div>
            </div>

            <!-- Tier 3: 4-Stage Precision CNC Tooling Life-Cycle Pipeline Ribbon -->
            <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.2);border-radius:20px;padding:32px;box-shadow:0 8px 24px rgba(2,132,199,0.04);">
              <div style="text-align:center;max-width:700px;margin:0 auto 28px;">
                <span style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#0284c7;letter-spacing:0.08em;text-transform:uppercase;background:#e0f2fe;padding:4px 12px;border-radius:20px;">
                  [PRECISION MANUFACTURING WORKFLOW]
                </span>
                <h3 style="font-size:1.35rem;font-weight:900;color:#0f172a;margin:10px 0 6px;">
                  Sub-Micron CNC Tooling Fabrication Lifecycle
                </h3>
                <p style="font-size:0.88rem;color:#64748b;margin:0;">
                  From ultra-fine powder vacuum metallurgy to 100% automated optical CMM quality gates.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#0284c7;font-weight:800;margin-bottom:6px;">STAGE 01</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Vacuum HIP Sintering</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">0.4μm tungsten carbide sintered under 100 bar isostatic pressure at 1,450°C.</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#0284c7;font-weight:800;margin-bottom:6px;">STAGE 02</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">5-Axis Walter Flute Grinding</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">Diamond grinding wheels with oil coolant maintaining ±0.002mm web core concentricity.</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#ea580c;font-weight:800;margin-bottom:6px;">STAGE 03</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Cathodic Arc PVD Nanocoating</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">AlTiN multilayers deposited at 480°C giving 3,400 HV hardness and 0.3 friction coefficient.</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#059669;font-weight:800;margin-bottom:6px;">STAGE 04</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Zeiss 3D CMM Serial Inspection</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">100% automated optical profile scan with laser engraving of serialized QR batch codes.</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      `;
    } else {
      // 3-TIER HEAVY EQUIPMENT TELEMETRY & FLEET WORKSTATION
      mainHtml = `
        <main class="tools-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 80px;">
          <div class="wrap" style="padding:0 24px;">

            <!-- Tier 1: Heavy Equipment Breadcrumb & Jobsite Badges -->
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid rgba(217,119,6,0.2);">
              <div style="display:flex;align-items:center;gap:8px;font-family:monospace;font-size:0.82rem;font-weight:800;">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:#d97706;">HEAVY_FORGE</a>
                <span style="color:#94a3b8;">//</span>
                <span style="color:#64748b;">FLEET_RIG_DECK</span>
                <span style="color:#94a3b8;">//</span>
                <span style="color:#0f172a;">${esc(p.id).toUpperCase()}</span>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span style="padding:4px 12px;border-radius:20px;background:#fef3c7;color:#b45309;font-size:0.72rem;font-weight:800;border:1px solid #fde68a;font-family:monospace;">
                  IP56 DUST/INGRESS SEALED
                </span>
                <span style="padding:4px 12px;border-radius:20px;background:#fee2e2;color:#b91c1c;font-size:0.72rem;font-weight:800;border:1px solid #fecaca;font-family:monospace;">
                  2.5-METER DROP RATED
                </span>
              </div>
            </div>

            <!-- Tier 2: Two-Column Heavy Equipment Telemetry Deck -->
            <div style="display:grid;grid-template-columns:minmax(340px, 1.05fr) minmax(360px, 1.25fr);gap:44px;align-items:start;margin-bottom:48px;">
              <!-- Left Column: Workshop Viewport, Dynamometer Telemetry & Thermal Duty Cycle -->
              <div>
                <div style="background:#ffffff;border:1px solid rgba(217,119,6,0.22);border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(217,119,6,0.06);position:relative;">
                  <!-- Top Telemetry Status Header -->
                  <div style="background:#fffbeb;border-bottom:1px solid #fef3c7;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;font-family:monospace;font-size:0.72rem;">
                    <span style="font-weight:800;color:#d97706;">DYNAMO: 180 N·M STALL // MOTOR: BRUSHLESS 4-POLE</span>
                    <span style="color:#059669;font-weight:800;">CALIBRATED 100%</span>
                  </div>

                  <!-- Image Viewport -->
                  <div style="aspect-ratio:1.05;background:radial-gradient(circle at center, #ffffff 0%, #fffdf5 100%);position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #fde68a;overflow:hidden;padding:24px;">
                    <img id="wr-detail-main-img" data-wr-material-image="product-main" data-wr-material-product="${esc(p.id)}" src="${esc(p.img)}" alt="${esc(p.name)}" style="max-width:85%;max-height:85%;object-fit:contain;position:relative;z-index:1;" fetchpriority="high">
                    <div style="position:absolute;top:16px;right:16px;background:#ffffff;border:1px solid #fde68a;color:#b45309;font-size:0.75rem;font-weight:800;padding:4px 12px;border-radius:6px;font-family:monospace;z-index:2;box-shadow:0 2px 6px rgba(217,119,6,0.1);">
                      HEAVY IMPACT RATED
                    </div>
                  </div>

                  <!-- Channel / Viewpoint Thumbs Container -->
                  <div class="wr-detail-thumbs" style="padding:16px 20px;display:flex;gap:12px;background:#ffffff;justify-content:center;border-bottom:1px solid #fde68a;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid #d97706;border-radius:8px;padding:3px;background:#ffffff;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:monospace;font-size:0.72rem;font-weight:800;color:#d97706;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:36px;height:36px;object-fit:contain;">
                      <span>CH-1: RIG PROFILE</span>
                    </button>
                    <button type="button" class="wr-detail-thumb" style="border:1px solid #cbd5e1;border-radius:8px;padding:3px;background:#ffffff;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:monospace;font-size:0.72rem;font-weight:800;color:#64748b;">
                      <span style="display:inline-block;width:36px;height:36px;background:#fef3c7;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#b45309;font-size:0.75rem;">BLDC</span>
                      <span>CH-2: MOTOR</span>
                    </button>
                    <button type="button" class="wr-detail-thumb" style="border:1px solid #cbd5e1;border-radius:8px;padding:3px;background:#ffffff;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:monospace;font-size:0.72rem;font-weight:800;color:#64748b;">
                      <span style="display:inline-block;width:36px;height:36px;background:#fef3c7;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#b45309;font-size:0.75rem;">AZ91D</span>
                      <span>CH-3: GEARBOX</span>
                    </button>
                  </div>

                  <!-- Quick Telemetry Strip -->
                  <div style="padding:16px 20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;background:#fffdfa;text-align:center;font-size:0.78rem;">
                    <div>
                      <div style="font-weight:900;color:#d97706;font-size:1.15rem;font-family:monospace;">180 N·m</div>
                      <div style="color:#64748b;font-size:0.72rem;font-family:monospace;">STALL TORQUE</div>
                    </div>
                    <div style="border-left:1px solid #fed7aa;border-right:1px solid #fed7aa;">
                      <div style="font-weight:900;color:#059669;font-size:1.15rem;font-family:monospace;">IP56</div>
                      <div style="color:#64748b;font-size:0.72rem;font-family:monospace;">SILICA SEALED</div>
                    </div>
                    <div>
                      <div style="font-weight:900;color:#d97706;font-size:1.15rem;font-family:monospace;">${esc(p.moq)}</div>
                      <div style="color:#64748b;font-size:0.72rem;font-family:monospace;">FLEET MOQ</div>
                    </div>
                  </div>
                </div>

                <!-- Thermal Rise & Continuous Torque Duty Cycle Benchmark -->
                <div style="margin-top:20px;background:#ffffff;border:1px solid rgba(217,119,6,0.22);border-radius:18px;padding:22px;box-shadow:0 4px 16px rgba(217,119,6,0.04);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                    <div style="font-size:0.74rem;font-family:monospace;font-weight:800;color:#d97706;letter-spacing:0.06em;text-transform:uppercase;">
                      [DYNAMOMETER THERMAL RISE &amp; SUSTAINED TORQUE CURVE]
                    </div>
                    <span style="font-size:0.7rem;padding:2px 8px;border-radius:4px;background:#fef3c7;color:#b45309;font-weight:800;">500H CERTIFIED</span>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:12px;">
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">0 - 5 Min: Cold Inrush &amp; Peak Breakaway</span>
                        <span style="color:#d97706;font-weight:800;">180 N·m · 42°C Armature</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:96%;background:linear-gradient(90deg, #d97706, #f59e0b);border-radius:3px;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">15 Min: Heavy Continuous Concrete Chipping</span>
                        <span style="color:#d97706;font-weight:800;">165 N·m · 68°C Armature</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:84%;background:linear-gradient(90deg, #d97706, #f59e0b);border-radius:3px;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">45 Min: Structural Core Drilling Load</span>
                        <span style="color:#d97706;font-weight:800;">155 N·m · 78°C Thermal Equilibrium</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:74%;background:linear-gradient(90deg, #d97706, #f59e0b);border-radius:3px;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-family:monospace;margin-bottom:4px;">
                        <span style="color:#0f172a;font-weight:800;">240 Min: All-Day Shift Continuous Fleet Operation</span>
                        <span style="color:#059669;font-weight:800;">Sustained 150 N·m · Zero Throttling</span>
                      </div>
                      <div style="height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
                        <div style="height:100%;width:68%;background:linear-gradient(90deg, #059669, #10b981);border-radius:3px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Engineering Matrix & Pallet Logistics Calculator -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:#fef3c7;color:#b45309;font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;border:1px solid #fde68a;">
                  <span>${esc(p.categoryNameEn)}</span>
                  <span>• Commercial Contractor Specification</span>
                </div>
                <h1 style="font-size:clamp(1.9rem, 3.2vw, 2.7rem);font-weight:900;color:#0f172a;margin:0 0 14px;line-height:1.2;letter-spacing:-0.03em;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:#475569;line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- 4-Cell Heavy Industrial Engineering Matrix -->
                <div style="background:#ffffff;border:1px solid rgba(217,119,6,0.22);border-radius:18px;padding:24px;margin-bottom:24px;box-shadow:0 6px 20px rgba(217,119,6,0.04);">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#d97706;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px;">
                    [HEAVY CONTRACTOR POWERTRAIN ARCHITECTURE]
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
                    <div style="background:#fffdfa;padding:14px;border-radius:10px;border:1px solid #fed7aa;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">MOTOR TOPOLOGY</span>
                      <strong style="color:#0f172a;font-size:0.88rem;display:block;">${esc(p.material)}</strong>
                      <span style="font-size:0.72rem;color:#64748b;">4-pole brushless BLDC with neodymium magnets</span>
                    </div>
                    <div style="background:#fffdfa;padding:14px;border-radius:10px;border:1px solid #fed7aa;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">GEARBOX ENCLOSURE</span>
                      <strong style="color:#0f172a;font-size:0.88rem;display:block;">${esc(p.dimensions)}</strong>
                      <span style="font-size:0.72rem;color:#64748b;">Die-cast magnesium AZ91D heat dissipation housing</span>
                    </div>
                    <div style="background:#fffdfa;padding:14px;border-radius:10px;border:1px solid #fed7aa;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">TORQUE &amp; SAFETY RATING</span>
                      <strong style="color:#d97706;font-size:0.88rem;display:block;">${esc(p.extra)}</strong>
                      <span style="font-size:0.72rem;color:#64748b;">Dual mechanical overload clutch with electronic cut-off</span>
                    </div>
                    <div style="background:#fffdfa;padding:14px;border-radius:10px;border:1px solid #fed7aa;">
                      <span style="font-size:0.72rem;font-family:monospace;color:#64748b;display:block;margin-bottom:4px;">SEAL &amp; DROP RATING</span>
                      <strong style="color:#059669;font-size:0.88rem;display:block;">IP56 · 2.5m Concrete Drop</strong>
                      <span style="font-size:0.72rem;color:#64748b;">Silica dust labyrinth defense with rubberized bumper</span>
                    </div>
                  </div>
                </div>

                <!-- Contractor Commercial Pallet & Container Loadout Calculator -->
                <div style="background:#ffffff;border:1px solid rgba(217,119,6,0.22);border-radius:18px;padding:24px;margin-bottom:24px;box-shadow:0 6px 20px rgba(217,119,6,0.04);">
                  <div style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#d97706;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
                    [COMMERCIAL PALLET &amp; CONTAINER FLEET CALCULATOR]
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                    <div style="border:1px solid #fed7aa;border-radius:12px;padding:12px;text-align:center;background:#fffdfa;">
                      <div style="font-size:0.72rem;font-family:monospace;color:#64748b;margin-bottom:4px;">LCL TRIAL FLEET</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#d97706;">200 Sets</div>
                      <div style="font-size:0.72rem;color:#64748b;">50 master cartons</div>
                    </div>
                    <div style="border:2px solid #d97706;border-radius:12px;padding:12px;text-align:center;background:#fef3c7;">
                      <div style="font-size:0.72rem;font-family:monospace;color:#b45309;font-weight:800;margin-bottom:4px;">20GP CONTAINER</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#b45309;">1,800 Sets</div>
                      <div style="font-size:0.72rem;color:#b45309;">Dual-shot custom brand</div>
                    </div>
                    <div style="border:1px solid #fed7aa;border-radius:12px;padding:12px;text-align:center;background:#fffdfa;">
                      <div style="font-size:0.72rem;font-family:monospace;color:#64748b;margin-bottom:4px;">40HQ HIGH CUBE</div>
                      <div style="font-size:1.15rem;font-weight:900;color:#d97706;">4,200 Sets</div>
                      <div style="font-size:0.72rem;color:#64748b;">Full commercial rollout</div>
                    </div>
                  </div>
                </div>

                <!-- Trade Warranty & Certification Bar -->
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:18px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                  <div>
                    <div style="font-size:0.85rem;font-weight:800;color:#b45309;">3-Year Commercial Fleet Warranty Guaranteed</div>
                    <div style="font-size:0.78rem;color:#78350f;">Complete spare parts consignment and regional service center calibration support.</div>
                  </div>
                  <div style="display:flex;gap:6px;">
                    <span style="padding:4px 8px;background:#ffffff;border:1px solid #fde68a;color:#b45309;border-radius:6px;font-size:0.72rem;font-weight:800;font-family:monospace;">UL / CSA</span>
                    <span style="padding:4px 8px;background:#ffffff;border:1px solid #fde68a;color:#b45309;border-radius:6px;font-size:0.72rem;font-weight:800;font-family:monospace;">CE RED</span>
                  </div>
                </div>

                <!-- Action Strip -->
                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 32px;border-radius:12px;background:linear-gradient(135deg, #d97706 0%, #f59e0b 100%);color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px rgba(217,119,6,0.25);">
                    REQUEST FLEET OEM SPECIFICATION &amp; QUOTE ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 24px;border-radius:12px;background:#ffffff;color:#0f172a;border:1px solid #cbd5e1;font-size:0.95rem;font-weight:800;">
                    Explore All Equipment
                  </a>
                </div>
              </div>
            </div>

            <!-- Tier 3: 4-Stage Heavy Industrial Testing & Validation Pipeline Ribbon -->
            <div style="background:#ffffff;border:1px solid rgba(217,119,6,0.22);border-radius:20px;padding:32px;box-shadow:0 8px 24px rgba(217,119,6,0.04);">
              <div style="text-align:center;max-width:700px;margin:0 auto 28px;">
                <span style="font-size:0.75rem;font-family:monospace;font-weight:800;color:#d97706;letter-spacing:0.08em;text-transform:uppercase;background:#fef3c7;padding:4px 12px;border-radius:20px;">
                  [HEAVY INDUSTRIAL RIGOROUS TESTING STANDARDS]
                </span>
                <h3 style="font-size:1.35rem;font-weight:900;color:#0f172a;margin:10px 0 6px;">
                  Jobsite Abuse Validation &amp; Quality Gates
                </h3>
                <p style="font-size:0.88rem;color:#64748b;margin:0;">
                  Every power tool model undergoes grueling cyclic endurance testing before commercial container dispatch.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="background:#fffdfa;border:1px solid #fed7aa;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#d97706;font-weight:800;margin-bottom:6px;">STAGE 01</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Armature Dynamic Balancing</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">Rotors dynamically trimmed to Grade G1.0 at 30,000 RPM, keeping user vibration below 1.2 m/s².</div>
                </div>
                <div style="background:#fffdfa;border:1px solid #fed7aa;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#d97706;font-weight:800;margin-bottom:6px;">STAGE 02</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Dynamometer Stall Testing</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">Full-load computer brake dyno verification confirming 180 N·m stall torque and zero clutch slip.</div>
                </div>
                <div style="background:#fffdfa;border:1px solid #fed7aa;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#b91c1c;font-weight:800;margin-bottom:6px;">STAGE 03</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">2.5-Meter Concrete Drop</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">Repeated drop impacts on solid concrete pad across 6 structural axes validating magnesium alloy integrity.</div>
                </div>
                <div style="background:#fffdfa;border:1px solid #fed7aa;border-radius:14px;padding:20px;">
                  <div style="font-size:0.72rem;font-family:monospace;color:#059669;font-weight:800;margin-bottom:6px;">STAGE 04</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Silica Dust Chamber Slurry</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">500-hour continuous silica dust slurry circulating chamber test certifying IP56 seal defense.</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? 'Contractor Power Tool Endurance & Testing Center' : 'Temperature-Controlled Metrology Laboratory (20°C)');
    const paragraphs = getAboutStoryParagraphs(company);
    const images = getAboutImages(ctx);
    const highlights = parseAboutHighlights(company.aboutHighlights, isVideo ? [
      { value: '180 N·m', label: 'Dynamometer Peak Torque', desc: 'Continuous commercial duty test pass' },
      { value: '500 Hours', label: 'Continuous Run Cycle', desc: 'Motor armature thermal endurance rating' },
      { value: 'IP56 Sealed', label: 'Dust & Ingress Defense', desc: 'Abrasive silica jobsite barrier certified' },
    ] : [
      { value: '±0.002mm', label: 'DIN Tolerance Class', desc: 'Sub-micron CNC machining precision standard' },
      { value: 'HRC 65+', label: 'Tungsten Hardness', desc: 'Ultra-micrograin substrate wear resistance' },
      { value: '20.0°C', label: 'Metrology Lab Stability', desc: 'Maintained at ±0.5°C with Zeiss 3D CMM' },
    ]);
    const primaryImage = images.primary || (isVideo ? getIndustryPlaceholder('tools', 1) : getIndustryPlaceholder('tools', 0));

    if (!isVideo) {
      // TOOLS PRECISION BANNER: TECHNICAL BLUEPRINT DRAFTING TABLE
      mainHtml = `
        <main class="tools-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 100px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;max-width:1200px;margin:0 auto;">
            
            <!-- Technical Coordinate Blueprint Header -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#ffffff;border:1px solid #bae6fd;border-radius:12px;margin-bottom:36px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.75rem;letter-spacing:0.04em;color:#0284c7;box-shadow:0 2px 8px rgba(2,132,199,0.04);flex-wrap:wrap;gap:12px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7;"></span>
                <strong style="color:#0369a1;">DIN EN ISO 2768-mK METROLOGY DRAFT</strong>
              </div>
              <div style="display:flex;gap:18px;align-items:center;font-weight:700;">
                <span>STABILITY: 20.0°C ±0.5°C</span>
                <span>ZEISS 3D CMM: ACTIVE</span>
                <span>RUNOUT: &lt; 0.003MM</span>
              </div>
            </div>

            <!-- Page Title & Engineering Lead Narrative -->
            <div style="max-width:880px;margin-bottom:40px;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Sub-Micron Calibration &amp; Tungsten Substrate Science
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;letter-spacing:-0.03em;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0;">
                ${esc(paragraphs[0] || 'Our temperature-controlled metrology laboratory operates under constant 20.0°C conditions to eliminate thermal expansion variance during sub-micron dimensional verification.')}
              </p>
            </div>

            <!-- Technical Drafting Table Canvas -->
            <div style="background:#ffffff;border:1px solid #bae6fd;border-radius:24px;padding:36px;box-shadow:0 12px 36px rgba(2,132,199,0.06);margin-bottom:36px;background-image:linear-gradient(to right, rgba(2,132,199,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,132,199,0.06) 1px, transparent 1px);background-size:24px 24px;position:relative;">
              
              <div style="display:grid;grid-template-columns:minmax(320px, 1.2fr) minmax(320px, 1.3fr);gap:44px;align-items:center;">
                
                <!-- Left: Blueprint Framed Primary Image with Corner Ticks -->
                <div style="position:relative;background:#f8fafc;border:2px dashed #0284c7;border-radius:18px;padding:12px;">
                  <!-- Corner Tick Marks -->
                  <span style="position:absolute;top:-8px;left:-8px;background:#0284c7;color:#fff;font-family:monospace;font-size:0.65rem;font-weight:900;padding:1px 6px;border-radius:3px;">⌜ 0,0</span>
                  <span style="position:absolute;bottom:-8px;right:-8px;background:#0284c7;color:#fff;font-family:monospace;font-size:0.65rem;font-weight:900;padding:1px 6px;border-radius:3px;">⌟ 120,45</span>

                  <div style="border-radius:12px;overflow:hidden;background:#ffffff;">
                    <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
                  </div>

                  <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;font-size:0.72rem;color:#0369a1;font-weight:700;">
                    <span>COATING: AlTiN NANO-PVD</span>
                    <span>TOLERANCE: ±0.002MM</span>
                  </div>
                </div>

                <!-- Right: Metrology Inspection Clipboard -->
                <div>
                  <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:6px;background:#f0f9ff;color:#0284c7;font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;border:1px solid #bae6fd;">
                    Zeiss 3D CMM &amp; Optical Profilometry
                  </div>
                  <h2 style="font-size:1.5rem;font-weight:900;color:#0f172a;margin:0 0 16px;line-height:1.3;">
                    ISO 17025 Accredited Calibration Protocol
                  </h2>
                  <div style="font-size:0.95rem;line-height:1.75;color:#475569;margin-bottom:24px;">
                    ${paragraphs.length > 1 ? paragraphs.slice(1).map(p => `<p style="margin:0 0 12px;">${esc(p)}</p>`).join('') : `
                      <p style="margin:0 0 12px;">Every carbide cutter and measuring standard is measured using Zeiss PRISMO 3D coordinate measuring machines with continuous high-speed scanning probes accurate to 0.5μm.</p>
                      <p style="margin:0;">Substrates undergo deep cryo-stabilization treatment at -196°C to convert retained austenite into ultra-stable martensite, preventing dimensional creep across years of high-volume CNC cutting.</p>
                    `}
                  </div>

                  <!-- Metrology Verification Checks -->
                  <div style="display:flex;flex-direction:column;gap:10px;">
                    <div style="display:flex;align-items:center;gap:10px;font-size:0.85rem;color:#0f172a;font-weight:700;">
                      <span style="color:#0284c7;font-weight:900;">✓</span>
                      <span>100% Optical Runout Inspection (&lt; 0.003mm)</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;font-size:0.85rem;color:#0f172a;font-weight:700;">
                      <span style="color:#0284c7;font-weight:900;">✓</span>
                      <span>Sub-Micron Laser Diffraction Grain Size Verification</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;font-size:0.85rem;color:#0f172a;font-weight:700;">
                      <span style="color:#0284c7;font-weight:900;">✓</span>
                      <span>Full Batch Traceability Certificate Included</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Metrology Highlights Benchmark Strips -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:24px;">
              ${highlights.map(h => `
                <div style="background:#ffffff;border:1px solid #bae6fd;border-radius:18px;padding:26px;box-shadow:0 4px 16px rgba(2,132,199,0.03);position:relative;">
                  <div style="font-size:2.2rem;font-weight:900;color:#0284c7;margin-bottom:6px;line-height:1;letter-spacing:-0.03em;">${esc(h.value)}</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(h.label)}</div>
                  <div style="font-size:0.8rem;color:#64748b;line-height:1.5;">${esc(h.desc || '')}</div>
                </div>
              `).join('')}
            </div>

          </div>
        </main>
      `;
    } else {
      // TOOLS WORKSHOP VIDEO: JOBSITE TORTURE DOSSIER & FLEET RIG
      mainHtml = `
        <main class="tools-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 100px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;max-width:1200px;margin:0 auto;">
            
            <!-- Warning Hazard Stripe Banner Header -->
            <div style="background:#1c1917;color:#fef08a;border-radius:12px;padding:12px 20px;margin-bottom:36px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);font-family:ui-monospace,monospace;font-size:0.75rem;letter-spacing:0.05em;border-left:8px solid #d97706;">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="background:#d97706;color:#ffffff;padding:2px 8px;border-radius:4px;font-weight:900;">TORTURE RIG</span>
                <strong>HEAVY EQUIPMENT DEPLOYMENT LAB</strong>
              </div>
              <div style="display:flex;gap:18px;align-items:center;font-weight:700;color:#e7e5e4;">
                <span>DROP TEST: 2.5M PASSED</span>
                <span>ARMATURE: G1.0 DYNAMIC</span>
                <span>SEAL: IP56 DUSTPROOF</span>
              </div>
            </div>

            <!-- Page Title & Contractor Fleet Narrative -->
            <div style="max-width:880px;margin-bottom:40px;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Industrial Jobsite Endurance &amp; Motor Engineering
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;letter-spacing:-0.03em;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0;">
                ${esc(paragraphs[0] || 'TitanForge tests commercial power tools on robotic torture benches, conducting continuous concrete drilling and 2.5m steel-plate drop drops to guarantee survival on brutal job sites.')}
              </p>
            </div>

            <!-- Heavy Equipment Chassis Rig Split -->
            <div style="background:#ffffff;border:2px solid #fed7aa;border-radius:24px;padding:36px;box-shadow:0 12px 36px rgba(217,119,6,0.06);margin-bottom:36px;position:relative;">
              
              <div style="display:grid;grid-template-columns:minmax(320px, 1.2fr) minmax(320px, 1.3fr);gap:44px;align-items:center;">
                
                <!-- Left: Stamped Heavy-Duty Image -->
                <div style="position:relative;">
                  <div style="border-radius:18px;overflow:hidden;border:3px solid #1c1917;box-shadow:0 12px 28px rgba(0,0,0,0.12);background:#000;">
                    <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
                  </div>
                  <!-- Rubber Stamp Badge -->
                  <div style="position:absolute;top:16px;right:16px;background:#dc2626;color:#ffffff;border:2px solid #ffffff;border-radius:8px;padding:6px 14px;font-family:ui-monospace,monospace;font-size:0.72rem;font-weight:900;letter-spacing:0.08em;transform:rotate(4deg);box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                    PASSED 2.5M IMPACT
                  </div>
                </div>

                <!-- Right: Commercial Trade Fleet Dossier -->
                <div>
                  <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:6px;background:#fef3c7;color:#b45309;font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;border:1px solid #fde68a;">
                    Commercial Fleet Specifications
                  </div>
                  <h2 style="font-size:1.5rem;font-weight:900;color:#1c1917;margin:0 0 16px;line-height:1.3;">
                    Robotic Armature Balancing &amp; Dynamometer Validation
                  </h2>
                  <div style="font-size:0.95rem;line-height:1.75;color:#57534e;margin-bottom:24px;">
                    ${paragraphs.length > 1 ? paragraphs.slice(1).map(p => `<p style="margin:0 0 12px;">${esc(p)}</p>`).join('') : `
                      <p style="margin:0 0 12px;">Each motor rotor is dynamically balanced to Grade G1.0, slashing operator hand-arm vibration (HAV) below 1.2 m/s² for all-day continuous trade comfort.</p>
                      <p style="margin:0;">Magnesium-alloy gear housings dissipate internal heat 3.4× faster than aluminum, protecting the precision helical gearing during full-load demolition hammer tasks.</p>
                    `}
                  </div>

                  <!-- Fleet Feature Matrix -->
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px;">
                      <div style="font-size:0.72rem;font-weight:800;color:#b45309;text-transform:uppercase;">Motor Topology</div>
                      <div style="font-size:0.95rem;font-weight:900;color:#1c1917;margin-top:2px;">Brushless BLDC</div>
                    </div>
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px;">
                      <div style="font-size:0.72rem;font-weight:800;color:#b45309;text-transform:uppercase;">Gearbox Alloy</div>
                      <div style="font-size:0.95rem;font-weight:900;color:#1c1917;margin-top:2px;">Magnesium AZ91D</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Highlights Test Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:24px;">
              ${highlights.map(h => `
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:18px;padding:26px;box-shadow:0 4px 16px rgba(217,119,6,0.03);position:relative;">
                  <div style="font-size:2.2rem;font-weight:900;color:#d97706;margin-bottom:6px;line-height:1;letter-spacing:-0.03em;">${esc(h.value)}</div>
                  <div style="font-size:0.95rem;font-weight:800;color:#1c1917;margin-bottom:6px;">${esc(h.label)}</div>
                  <div style="font-size:0.8rem;color:#78716c;line-height:1.5;">${esc(h.desc || '')}</div>
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
      // TWO-COLUMN PRECISION MACHINING & CAD TOOLING DRAWING TERMINAL
      mainHtml = `
        <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:20px;background:#e0f2fe;color:#0369a1;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;border:1px solid #bae6fd;">
                <span style="width:6px;height:6px;border-radius:50%;background:#0284c7;"></span>
                DIN IT5 Precision Engineering &amp; CAD Model Portal
              </span>
              <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#0f172a;margin:0 0 16px;letter-spacing:-0.03em;">
                Submit Tooling Drawing &amp; CAD Specification Request
              </h1>
              <p style="font-size:1.05rem;color:#475569;line-height:1.7;max-width:700px;margin:0 auto;">
                Connect directly with our senior tooling design engineers for custom tungsten carbide geometry, 3D STEP/IGES CAD models, and volume regrind contract scheduling.
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1.35fr;gap:36px;max-width:1120px;margin:0 auto;align-items:start;">
              <!-- Left Column: Tooling Capabilities & Applications Desk -->
              <div style="display:flex;flex-direction:column;gap:20px;">
                <!-- Capabilities Card -->
                <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.22);border-radius:20px;padding:32px;box-shadow:0 10px 30px rgba(2,132,199,0.04);">
                  <div style="font-size:0.72rem;font-family:monospace;color:#0284c7;font-weight:800;letter-spacing:0.08em;margin-bottom:8px;text-transform:uppercase;">
                    [FACTORY TOOLROOM CAPABILITIES]
                  </div>
                  <h3 style="font-size:1.2rem;font-weight:800;color:#0f172a;margin:0 0 18px;">
                    Sub-Micron Machining &amp; Metrology
                  </h3>
                  <div style="display:flex;flex-direction:column;gap:14px;">
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">5-Axis Walter Helitronic Flute Grinding</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Simultaneous 5-axis robotic grinding maintaining ±0.002mm core web runout.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">Zeiss PRISMO Ultra-Precision 3D CMM</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Sub-micron tactile and optical verification with ISO 17025 inspection certificates.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">In-House Cathodic Arc PVD Coating</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">AlTiN, TiAlSiN, and DLC diamond coatings tailored for titanium and Inconel.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">Custom Step CAD &amp; Regrind Program</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Fast 3D STEP delivery and automated CNC regrinding restoring 98% original tool life.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Direct Liaison Desk -->
                <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.2);border-radius:20px;padding:26px;box-shadow:0 6px 20px rgba(2,132,199,0.03);">
                  <div style="font-size:0.72rem;font-family:monospace;color:#ea580c;font-weight:800;letter-spacing:0.08em;margin-bottom:8px;text-transform:uppercase;">
                    [APPLICATIONS ENGINEERING DESK]
                  </div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Tooling Applications &amp; CAD Support</div>
                  <div style="font-size:0.82rem;color:#64748b;margin-bottom:14px;line-height:1.6;">Direct tooling engineer response within 4 operational hours.</div>
                  <div style="display:flex;flex-direction:column;gap:8px;font-size:0.82rem;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:60px;">Direct:</span>
                      <a href="mailto:${esc(company.email || 'tooling@vektor-precision.com')}" style="color:#0284c7;text-decoration:none;font-weight:700;">${esc(company.email || 'tooling@vektor-precision.com')}</a>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:60px;">Location:</span>
                      <span style="color:#64748b;">${esc(company.address || 'Vektor Precision Toolroom & Metrology Center')}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:60px;">Hours:</span>
                      <span style="color:#64748b;">Mon - Fri, 08:00 - 19:00 CET</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Interactive Consultation RFQ Console -->
              <div style="background:#ffffff;border:1px solid rgba(2,132,199,0.22);border-radius:20px;padding:36px;box-shadow:0 12px 36px rgba(2,132,199,0.06);position:relative;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:24px;">
                  <div>
                    <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#0284c7;letter-spacing:0.06em;">[TERMINAL // CAD-SPEC-INIT]</span>
                    <h2 style="font-size:1.3rem;font-weight:900;color:#0f172a;margin:4px 0 0;">Request Tooling STEP &amp; Quotation</h2>
                  </div>
                  <span style="font-size:0.75rem;padding:4px 10px;border-radius:6px;background:#ecfdf5;color:#059669;font-weight:800;">ENCRYPTED TLS</span>
                </div>

                <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:18px;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Tooling Engineer / Buyer</label>
                      <input type="text" name="name" required placeholder="e.g. Marcus Vance" style="width:100%;padding:12px;border:1px solid #bae6fd;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#f0f7ff;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Corporate Email</label>
                      <input type="email" name="email" required placeholder="engineering@aerocnc-corp.com" style="width:100%;padding:12px;border:1px solid #bae6fd;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#f0f7ff;">
                    </div>
                  </div>

                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Target Precision Tool</label>
                    <select name="productId" style="width:100%;padding:12px;border:1px solid #bae6fd;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#f0f7ff;outline:none;color:#0f172a;">
                      <option value="">General Tooling Inquiries (All Diameters)</option>
                      ${products.map(p => `
                        <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Workpiece Hardness Class</label>
                      <select name="workpiece" style="width:100%;padding:12px;border:1px solid #bae6fd;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#f0f7ff;outline:none;color:#0f172a;">
                        <option>Hardened Steel (HRC 45 - 68)</option>
                        <option>Titanium &amp; High-Temp Inconel</option>
                        <option>Non-Ferrous Aluminum &amp; Copper Alloys</option>
                        <option>Carbon Fiber Composites (CFRP)</option>
                      </select>
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Tolerance Class</label>
                      <select name="tolerance" style="width:100%;padding:12px;border:1px solid #bae6fd;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#f0f7ff;outline:none;color:#0f172a;">
                        <option>DIN IT5 Precision (±0.002 mm)</option>
                        <option>DIN IT7 Standard (±0.005 mm)</option>
                        <option>Special Micro-Runout TIR &lt; 0.001 mm</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Workpiece Drawings &amp; Application Parameters</label>
                    <textarea name="message" rows="4" placeholder="Specify milling spindle speed (RPM), feed rate, depth of cut (Ap/Ae), or coolant requirements..." style="width:100%;padding:12px;border:1px solid #bae6fd;border-radius:10px;font-size:0.88rem;box-sizing:border-box;resize:vertical;outline:none;background:#f0f7ff;"></textarea>
                  </div>

                  <button type="submit" style="padding:16px;border-radius:12px;border:none;background:linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);color:#ffffff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(2,132,199,0.25);transition:transform 0.2s ease;">
                    Transmit CAD Drawing Request ↗
                  </button>
                  <div style="font-size:0.75rem;color:#94a3b8;text-align:center;">
                    Secure engineering transmission. Non-disclosure agreement guaranteed on uploaded drawings.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // TWO-COLUMN CONTRACTOR FLEET & WHOLESALE EQUIPMENT PROCUREMENT TERMINAL
      mainHtml = `
        <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:20px;background:#fffbeb;color:#b45309;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;border:1px solid #fde68a;">
                <span style="width:6px;height:6px;border-radius:50%;background:#d97706;"></span>
                [CONTRACTOR FLEET PROCUREMENT // DIRECT FACTORY DESK]
              </span>
              <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#0f172a;margin:0 0 16px;letter-spacing:-0.03em;">
                Wholesale Equipment Sourcing &amp; Fleet Tender
              </h1>
              <p style="font-size:1.05rem;color:#475569;line-height:1.7;max-width:700px;margin:0 auto;">
                Direct manufacturer liaison for commercial contractor distributors, container loadout scheduling, private-label branding, and ISO 9001 / UL 60745 testing compliance.
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1.35fr;gap:36px;max-width:1120px;margin:0 auto;align-items:start;">
              <!-- Left Column: Workshop Manufacturing Capabilities & Direct Fleet Desk -->
              <div style="display:flex;flex-direction:column;gap:20px;">
                <!-- Capabilities Card -->
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;padding:32px;box-shadow:0 10px 30px rgba(217,119,6,0.04);">
                  <div style="font-size:0.72rem;font-family:monospace;color:#d97706;font-weight:800;letter-spacing:0.08em;margin-bottom:8px;text-transform:uppercase;">
                    [HEAVY WORKSHOP CAPABILITIES]
                  </div>
                  <h3 style="font-size:1.2rem;font-weight:800;color:#0f172a;margin:0 0 18px;">
                    Contractor Rig Engineering &amp; Assembly
                  </h3>
                  <div style="display:flex;flex-direction:column;gap:14px;">
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fffbeb;color:#d97706;border:1px solid #fde68a;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">Automated SMT &amp; BLDC Armature Winding</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Computerized multi-pole copper winding with 100% high-speed dynamic balancing.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fffbeb;color:#d97706;border:1px solid #fde68a;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">AZ91D Magnesium Die-Casting &amp; Gearbox CNC</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Lightweight high-dissipation housings protecting planetary reduction gears.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fffbeb;color:#d97706;border:1px solid #fde68a;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">Full Dynamometer Stall &amp; Thermal Burn-in</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">Every production lot verified under 180 N·m stall resistance and thermal rise tests.</div>
                      </div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <div style="width:24px;height:24px;border-radius:6px;background:#fffbeb;color:#d97706;border:1px solid #fde68a;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">✓</div>
                      <div>
                        <div style="font-size:0.88rem;font-weight:800;color:#0f172a;">Global Trade Safety Certifications (UL/CSA/CE)</div>
                        <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">UL 60745, CSA C22.2, CE-LVD, and IP56 jobsite dust/water laboratory verified.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Direct Fleet Desk -->
                <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;padding:26px;box-shadow:0 6px 20px rgba(217,119,6,0.03);">
                  <div style="font-size:0.72rem;font-family:monospace;color:#b45309;font-weight:800;letter-spacing:0.08em;margin-bottom:8px;text-transform:uppercase;">
                    [DIRECT FLEET DESK]
                  </div>
                  <div style="font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Wholesale Equipment &amp; OEM Liaison</div>
                  <div style="font-size:0.82rem;color:#64748b;margin-bottom:14px;line-height:1.6;">Direct manufacturer response within 4 operational hours.</div>
                  <div style="display:flex;flex-direction:column;gap:8px;font-size:0.82rem;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:64px;">Email:</span>
                      <a href="mailto:${esc(company.email || 'fleet@titanforge-tools.com')}" style="color:#d97706;text-decoration:none;font-weight:700;">${esc(company.email || 'fleet@titanforge-tools.com')}</a>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:64px;">Terminal:</span>
                      <span style="color:#64748b;">${esc(company.address || 'TitanForge Commercial Logistics & Heavy Lab')}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-weight:700;color:#475569;min-width:64px;">Hours:</span>
                      <span style="color:#64748b;">Mon - Fri, 07:00 - 19:00 EST</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Interactive Consultation RFQ Console -->
              <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:20px;padding:36px;box-shadow:0 12px 36px rgba(217,119,6,0.06);position:relative;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #fed7aa;padding-bottom:16px;margin-bottom:24px;">
                  <div>
                    <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#d97706;letter-spacing:0.06em;">[TERMINAL // FLEET-RFQ-INIT]</span>
                    <h2 style="font-size:1.3rem;font-weight:900;color:#0f172a;margin:4px 0 0;">Contractor Equipment Tender Console</h2>
                  </div>
                  <span style="font-size:0.75rem;padding:4px 10px;border-radius:6px;background:#ecfdf5;color:#059669;font-weight:800;">DISPATCH READY</span>
                </div>

                <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:18px;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Wholesale Buyer / Manager</label>
                      <input type="text" name="name" required placeholder="e.g. David Vance" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#fffbeb;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Corporate Email</label>
                      <input type="email" name="email" required placeholder="procurement@contractor-fleet.com" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;outline:none;background:#fffbeb;">
                    </div>
                  </div>

                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Selected Power Equipment Model</label>
                    <select name="productId" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#fffbeb;outline:none;color:#0f172a;">
                      <option value="">General Fleet Inquiries (All Power Equipment)</option>
                      ${products.map(p => `
                        <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra || p.moq)}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Container Order Tier</label>
                      <select name="volume" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#fffbeb;outline:none;color:#0f172a;">
                        <option>LCL Trial Fleet (200 - 500 Units)</option>
                        <option>20GP Full Container (~1,800 Units)</option>
                        <option>40HQ High Cube (~4,200 Units)</option>
                      </select>
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Battery Platform</label>
                      <select name="battery" style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;background:#fffbeb;outline:none;color:#0f172a;">
                        <option>20V Max Lithium 4.0Ah / 5.0Ah</option>
                        <option>40V Extreme Heavy Concrete Pack</option>
                        <option>Tool Body Only (Bare Tool Fleet)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Contractor Livery Branding &amp; Shipping Port</label>
                    <textarea name="message" rows="4" placeholder="Specify destination port, private label dual-shot mold colors, or custom heavy blow-molded case requirements..." style="width:100%;padding:12px;border:1px solid #fed7aa;border-radius:10px;font-size:0.88rem;box-sizing:border-box;resize:vertical;outline:none;background:#fffbeb;"></textarea>
                  </div>

                  <button type="submit" style="padding:16px;border-radius:12px;border:none;background:linear-gradient(135deg, #d97706 0%, #f59e0b 100%);color:#ffffff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(217,119,6,0.25);transition:transform 0.2s ease;">
                    Transmit Fleet Tender Specification ↗
                  </button>
                  <div style="font-size:0.75rem;color:#94a3b8;text-align:center;">
                    Direct manufacturer tender response within 4 hours. Technical specification sheet &amp; pallet packing list provided with quote.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  }

  // Distinct Footer for each variant
  const footerHtml = isVideo ? `
    <footer style="background:#ffffff;color:#0f172a;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid #fed7aa;">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.2rem;font-weight:900;color:#0f172a;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:2px;background:#d97706;"></span>
            ${esc(brandName)}
          </div>
          <p style="color:#64748b;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Commercial contractor power tools and pneumatic heavy equipment. Brushless motors, IP56 jobsite sealing, and 180 N·m peak torque endurance.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:4px 9px;border-radius:6px;background:#fffbeb;color:#b45309;border:1px solid #fde68a;font-size:0.72rem;font-weight:800;font-family:monospace;">IP56 SEALED</span>
            <span style="padding:4px 9px;border-radius:6px;background:#fffbeb;color:#b45309;border:1px solid #fde68a;font-size:0.72rem;font-weight:800;font-family:monospace;">BLDC 4-POLE</span>
            <span style="padding:4px 9px;border-radius:6px;background:#fffbeb;color:#b45309;border:1px solid #fde68a;font-size:0.72rem;font-weight:800;font-family:monospace;">2.5M DROP</span>
          </div>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;letter-spacing:0.04em;">Equipment Series</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#64748b;font-size:0.82rem;line-height:2.1;">
            <li>3.2J Brushless Rotary Hammers</li>
            <li>180 N·m Compact Impact Drivers</li>
            <li>Twin-Hammer Pneumatic Wrenches</li>
            <li>Magnesium 5800 RPM Circular Saws</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;letter-spacing:0.04em;">Fleet Procurement</h4>
          <p style="color:#64748b;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'fleet@titanforge-tools.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#d97706;text-decoration:none;font-weight:800;font-size:0.84rem;">Direct Fleet Sourcing Terminal →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #fed7aa;padding-top:24px;display:flex;justify-content:space-between;color:#94a3b8;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Commercial Contractor Power &amp; Pneumatic Equipment Division</span>
      </div>
    </footer>
  ` : `
    <footer style="background:#ffffff;color:#0f172a;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid rgba(2,132,199,0.18);">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#0f172a;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:50%;background:#0284c7;"></span>
            ${esc(brandName)}
          </div>
          <p style="color:#64748b;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Sub-micron solid carbide cutting tools and optical metrology systems. DIN IT5 tolerance class, AlTiN nanocoatings, and ISO 17025 laboratory calibration.
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="padding:4px 10px;border-radius:6px;background:#e0f2fe;color:#0369a1;font-size:0.7rem;font-weight:800;">DIN IT5</span>
            <span style="padding:4px 10px;border-radius:6px;background:#fef3c7;color:#b45309;font-size:0.7rem;font-weight:800;">HRC 68+</span>
            <span style="padding:4px 10px;border-radius:6px;background:#f8fafc;color:#475569;font-size:0.7rem;font-weight:800;border:1px solid #e2e8f0;">ISO 17025</span>
          </div>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 16px;">Tooling Standards</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#64748b;font-size:0.82rem;line-height:2.1;">
            <li>• ±0.002mm Diameter Runout TIR</li>
            <li>• 0.4μm Ultra-Fine Grain Carbide</li>
            <li>• AlTiN Multilayer PVD Nanocoating</li>
            <li>• Zeiss 3D CMM Metrology Verified</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#0f172a;font-size:0.85rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 16px;">Tooling Engineering</h4>
          <p style="color:#64748b;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'tooling@vektor-precision.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;padding:8px 16px;background:#e0f2fe;color:#0369a1;text-decoration:none;font-weight:800;font-size:0.8rem;border-radius:8px;border:1px solid #bae6fd;">Submit Technical CAD Inquiry →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #e2e8f0;padding-top:24px;display:flex;justify-content:space-between;color:#94a3b8;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Sub-Micron Precision Tooling &amp; Metrology Laboratory</span>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
