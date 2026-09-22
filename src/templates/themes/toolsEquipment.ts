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
      // METROLOGY & PRECISION CNC TOOLING CATALOG
      mainHtml = `
        <main class="tools-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Machining &amp; Metrology Index · Sub-Micron Precision
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                Precision CNC Tooling &amp; Metrology Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Precision Tooling (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Solid Carbide End Mills</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">PCD Diamond Inserts</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Digital Metrology Calipers</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">72-Tooth CrV Ratchets</span>
              </div>
            </div>

            <!-- Blueprint Technical Tool Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:32px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(2,132,199,0.05);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#f5f9ff;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:82%;height:82%;object-fit:contain;">
                      <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;font-family:monospace;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">DIN IT5</span>
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
                        Tooling Dossier →
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
      // CONTRACTOR HEAVY EQUIPMENT CATALOG
      mainHtml = `
        <main class="tools-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:24px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Contractor Power Equipment · Heavy-Duty Fleet
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                Jobsite Power &amp; Pneumatic Tool Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Equipment (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Brushless Rotary Hammers</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">High-Torque Impact Drivers</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Pneumatic Impact Wrenches</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Magnesium Circular Saws</span>
              </div>
            </div>

            <!-- Heavy Equipment Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(217,119,6,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.1;background:#fffdf5;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                      <span style="position:absolute;top:10px;left:10px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">IP56 SEALED</span>
                    </div>
                  </a>
                  <div style="padding:20px;">
                    <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};margin:0 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;font-size:0.75rem;margin-bottom:14px;">
                      <div>
                        <span style="color:${theme.textSub};display:block;">Housing:</span>
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
      // METROLOGY & PRECISION CNC TOOLING DETAIL: CAD DOSSIER + HARDNESS WEAR CURVE
      mainHtml = `
        <main class="tools-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Precision Machining Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Tooling Portrait & Macro Flute View -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;position:relative;box-shadow:0 12px 32px rgba(2,132,199,0.05);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    DIN EN ISO 286
                  </div>
                  <!-- Thumbnails container -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Metrology Calibration Metrics -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">±0.002mm</div>
                    <div style="color:${theme.textSub};">Diameter Runout</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">HRC 65+</div>
                    <div style="color:${theme.textSub};">Substrate Hardness</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">Tooling MOQ</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Engineering CAD Specifications & Nanocoating Dossier -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Sub-Micron Precision Class
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Tooling CAD Specifications Table -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;margin-bottom:28px;">
                  <h3 style="font-size:0.95rem;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Metrology &amp; Substrate Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.85rem;">
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Substrate Metallurgy</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">CAD Flute Dimensions</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Coating &amp; Hardness</span>
                      <strong style="color:${theme.text};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Batch Production MOQ</span>
                      <strong style="color:${theme.primary};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- Calibration Traceability Dossier -->
                <div style="background:#f0f7ff;border:1px solid #bae6fd;border-radius:16px;padding:22px;margin-bottom:28px;">
                  <h4 style="font-size:0.88rem;font-weight:800;color:#0369a1;margin:0 0 8px;">ISO 17025 Metrology Inspection Certificate</h4>
                  <p style="font-size:0.82rem;color:#075985;margin:0 0 14px;line-height:1.6;">
                    Supplied with serialized laser-etched batch code and full 3D CMM inspection report indicating individual flute pitch, core diameter, and radial runout.
                  </p>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <span style="padding:6px 14px;background:#fff;border:1px solid #7dd3fc;color:#0369a1;border-radius:6px;font-size:0.75rem;font-weight:700;">[ Zeiss 3D CMM Report ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #7dd3fc;color:#0369a1;border-radius:6px;font-size:0.75rem;font-weight:700;">[ Serialized Laser Code ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #7dd3fc;color:#0369a1;border-radius:6px;font-size:0.75rem;font-weight:700;">[ AlTiN PVD Cert ]</span>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Request CAD Model &amp; Quote ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    View All Tooling
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // CONTRACTOR HEAVY EQUIPMENT DETAIL: EXPLODED GEARBOX + PALLET FLEET CALCULATOR
      mainHtml = `
        <main class="tools-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Jobsite Equipment Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Tool Portrait & Gallery -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;position:relative;box-shadow:0 12px 32px rgba(217,119,6,0.06);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    HEAVY IMPACT RATED
                  </div>
                  <!-- Thumbnails -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Motor Telemetry Benchmark -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">180 N·m</div>
                    <div style="color:${theme.textSub};">Max Torque</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">IP56</div>
                    <div style="color:${theme.textSub};">Jobsite Seal</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">Fleet MOQ</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Contractor Specs & Fleet Logistics -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Commercial Contractor Model
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
                    Equipment Engineering Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Housing &amp; Motor</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Dimensions &amp; Net Weight</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Torque / Impact Rating</span>
                      <strong style="color:${theme.primary};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Production MOQ</span>
                      <strong style="color:${theme.text};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- Heavy Fleet Pallet Calculator -->
                <div style="background:#fffbeb;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:0 0 10px;">Wholesale Pallet &amp; Fleet Logistics</h4>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:0.8rem;text-align:center;">
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Master Ctn</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">4 Sets / Ctn</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Pallet Load</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">36 Ctns (144 Units)</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">20GP Container</div>
                      <strong style="color:${theme.primary};font-size:0.95rem;">1,800 Units</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Submit Fleet Wholesale RFQ ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Explore All Equipment
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? 'Contractor Power Tool Endurance & Testing Center' : 'Temperature-Controlled Metrology Laboratory (20°C)');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || (isVideo ? 'Built for extreme jobsite environments, TitanWorks subjects every brushless powertrain to 500-hour continuous dynamometer torture cycles and 2.5-meter concrete drop impacts.' : 'Our ISO/IEC 17025 accredited metrology center is maintained at an exacting 20.0°C ±0.5°C with active humidity filtering. High-precision laser scanning micrometers and Zeiss 3D coordinate measuring machines verify cutting tool tolerances down to ±0.002mm.'));
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
      // METROLOGY & PRECISION LAB ABOUT
      mainHtml = `
        <main class="tools-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Temperature-Controlled Metrology Standards
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(2,132,199,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">Our metrology center operates under strict international calibration protocols, maintaining a constant 20.0°C ±0.5°C atmosphere and 45% relative humidity to eliminate thermal expansion variance during sub-micron measurement.</p>
                    <p style="margin:0 0 18px;">Equipped with high-precision Zeiss 3D coordinate measuring machines (CMM) and Mitutoyo roundness testers, we provide ISO 17025 accredited calibration reports with every batch of precision tooling and inspection gages.</p>
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
      // CONTRACTOR EQUIPMENT TESTING ABOUT
      mainHtml = `
        <main class="tools-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Heavy Equipment Endurance &amp; Motor Winding Facility
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(217,119,6,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">TitanForge engineers commercial contractor tools using automated armature winding robotics, balancing motor rotors to grade G1.0 standards to minimize vibration fatigue on jobsites.</p>
                    <p style="margin:0 0 18px;">Our heavy equipment testing center subjects every power tool chassis to continuous concrete drilling dynamometer torture cycles and 2.5-meter drop tests, ensuring long service life for commercial trade fleets.</p>
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
      // METROLOGY & PRECISION CNC TOOLING CAD DESK
      mainHtml = `
        <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Precision Engineering &amp; CAD Model Portal
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Submit Tooling Drawing &amp; CAD Request
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Upload part specifications or workpiece materials (Titanium, Inconel, Pre-Hardened Steel) to receive custom carbide tool designs and STEP CAD models.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(2,132,199,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Tooling Engineer / Buyer</label>
                    <input type="text" name="name" required placeholder="CNC Production Manager" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email Address</label>
                    <input type="email" name="email" required placeholder="machining@precision-aero.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Precision Tool</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Tooling Inquiries (All Diameters)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Workpiece Hardness Class</label>
                    <select name="workpiece" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Hardened Steel (HRC 45 - 68)</option>
                      <option>Titanium &amp; High-Temp Inconel</option>
                      <option>Non-Ferrous Aluminum &amp; Copper Alloys</option>
                      <option>Carbon Fiber Composites (CFRP)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Tolerance Requirement</label>
                    <select name="tolerance" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>DIN IT5 Precision (±0.002 mm)</option>
                      <option>DIN IT7 Standard (±0.005 mm)</option>
                      <option>Special Micro-Runout TIR &lt; 0.001 mm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Workpiece Drawings &amp; Application Parameters</label>
                  <textarea name="message" rows="4" placeholder="Specify milling spindle speed (RPM), feed rate, depth of cut (Ap/Ae), or coolant requirements..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Transmit CAD Drawing Request ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      // CONTRACTOR FLEET & DISTRIBUTOR WHOLESALE DESK
      mainHtml = `
        <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Contractor Fleet &amp; Wholesale Equipment Desk
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Submit Equipment Fleet RFQ
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Inquire about container loadouts, private label contractor branding, regional safety certifications (UL, CSA, CE), and battery platform OEM.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(217,119,6,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Wholesale Buyer</label>
                    <input type="text" name="name" required placeholder="Fleet Procurement Manager" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" required placeholder="buyer@contractor-fleet.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Selected Power Equipment Model</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Fleet Inquiries (All Power Tools)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Container Order Tier</label>
                    <select name="volume" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>LCL Trial Fleet (200 - 500 Units)</option>
                      <option>20GP Full Container (~1,800 Units)</option>
                      <option>40HQ High Cube (~4,200 Units)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Battery Platform</label>
                    <select name="battery" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>20V Max Lithium 4.0Ah / 5.0Ah</option>
                      <option>40V Extreme Heavy Concrete Pack</option>
                      <option>Tool Body Only (Bare Tool Fleet)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Contractor Fleet Branding &amp; Shipping Port</label>
                  <textarea name="message" rows="4" placeholder="Specify destination port, private label dual-shot mold colors, or custom heavy blow-molded case requirements..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Transmit Fleet RFQ Specification ↗
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
            Commercial contractor power tools and pneumatic heavy equipment. Brushless motors, IP56 jobsite sealing, and 180 N·m peak torque endurance.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f59e0b;font-size:0.7rem;font-weight:700;">IP56</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f59e0b;font-size:0.7rem;font-weight:700;">BRUSHLESS</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f59e0b;font-size:0.7rem;font-weight:700;">2.5M DROP</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Equipment Series</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>3.2J Brushless Rotary Hammers</li>
            <li>180 N·m Compact Impact Drivers</li>
            <li>Twin-Hammer Pneumatic Wrenches</li>
            <li>Magnesium 5800 RPM Circular Saws</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Fleet Procurement</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'fleet@titanforge-tools.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#f59e0b;text-decoration:none;font-weight:700;font-size:0.82rem;">Direct Sourcing Terminal →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Commercial Contractor Power &amp; Pneumatic Equipment Division</span>
      </div>
    </footer>
  ` : `
    <footer style="background:#0f172a;color:#f8fafc;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid rgba(255,255,255,0.08);">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#fff;margin-bottom:8px;">${esc(brandName)}</div>
          <p style="color:#94a3b8;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Sub-micron solid carbide cutting tools and optical metrology systems. DIN IT5 tolerance class, AlTiN nanocoatings, and ISO 17025 laboratory calibration.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">DIN IT5</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">HRC 65+</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">ISO 17025</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Tooling Standards</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>±0.002mm Diameter Runout TIR</li>
            <li>0.4μm Ultra-Fine Grain Carbide</li>
            <li>AlTiN Multilayer PVD Nanocoating</li>
            <li>Zeiss 3D CMM Metrology Verified</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Tooling Engineering</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'tooling@vektor-precision.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#38bdf8;text-decoration:none;font-weight:700;font-size:0.82rem;">Submit Technical CAD Inquiry →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Sub-Micron Precision Tooling &amp; Metrology Laboratory</span>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
