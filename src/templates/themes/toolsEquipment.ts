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
    name: 'CrV 72-Tooth Ratchet Wrench Set',
    desc: 'Chrome vanadium steel 72-tooth fine ratchet mechanism with 5° swing arc, mirror-polished finish, and blow-molded case.',
    badge: '72-Tooth CrV',
    category: 'wrench',
    categoryNameZh: '',
    categoryNameEn: 'Ratchet Wrenches',
    material: 'Chrome Vanadium Steel (CrV)',
    dimensions: '1/4" + 3/8" + 1/2" · 94pc Set',
    extra: '5° Fine Ratchet Arc',
    moq: '200 Sets',
    tagline: '72-Tooth 5° Swing CrV Steel',
    img: getIndustryPlaceholder('tools', 0),
  },
  {
    id: 'tl-2',
    name: 'Brushless 20V Circular Saw',
    desc: '20V brushless motor circular saw with 5800 RPM no-load speed, laser guide, and dust extraction port.',
    badge: 'BLDC Pro',
    category: 'saw',
    categoryNameZh: '',
    categoryNameEn: 'Circular Saws',
    material: 'Magnesium Alloy Guard + BLDC Motor',
    dimensions: '355 × 250 × 240 mm · 3.6kg',
    extra: '5800 RPM Brushless',
    moq: '300 Units',
    tagline: '20V BLDC 5800RPM Precision',
    img: getIndustryPlaceholder('tools', 1),
  },
  {
    id: 'tl-3',
    name: '20V Brushless Impact Driver Kit',
    desc: 'High-torque brushless impact driver with 800N·m max torque, 3-speed electronic clutch, and anti-vibration grip.',
    badge: '800N·m Torque',
    category: 'drill',
    categoryNameZh: '',
    categoryNameEn: 'Impact Drivers',
    material: 'BLDC Motor + Anti-Vibe Housing',
    dimensions: '175 × 75 × 210 mm · 1.8kg',
    extra: '800N·m Max Torque',
    moq: '500 Units',
    tagline: '800N·m BLDC Impact Power',
    img: getIndustryPlaceholder('tools', 2),
  },
  {
    id: 'tl-4',
    name: 'Laser Distance Meter 100M',
    desc: 'Professional laser distance meter with ±1.5mm accuracy, Pythagorean calculation, area/volume mode, and Bluetooth data transfer.',
    badge: 'Laser Pro',
    category: 'measure',
    categoryNameZh: '',
    categoryNameEn: 'Laser Measurers',
    material: 'Class II Laser Diode 635nm',
    dimensions: '120 × 55 × 30 mm · 130g',
    extra: '100M ±1.5mm Accuracy',
    moq: '500 Units',
    tagline: '100M ±1.5mm Laser Accuracy',
    img: getIndustryPlaceholder('tools', 3),
  },
  {
    id: 'tl-5',
    name: 'Anti-Vibration 125mm Angle Grinder',
    desc: '1400W angle grinder with anti-vibration side handle, restart protection, and tool-free disc change system.',
    badge: 'Anti-Vibe',
    category: 'grinder',
    categoryNameZh: '',
    categoryNameEn: 'Angle Grinders',
    material: 'Armored Gear Housing',
    dimensions: '300 × 135 × 105 mm · 2.3kg',
    extra: '1400W Anti-Vibration',
    moq: '400 Units',
    tagline: '1400W Vibration-Dampened',
    img: getIndustryPlaceholder('tools', 4),
  },
  {
    id: 'tl-6',
    name: 'Heavy-Duty Cantilever Tool Chest',
    desc: '5-tray cantilever steel toolbox with powder-coated rust-proof finish, dual padlock eyes, and full-length steel piano hinges.',
    badge: 'Steel Armor',
    category: 'storage',
    categoryNameZh: '',
    categoryNameEn: 'Tool Storage',
    material: 'Cold-Rolled Steel 1.2mm SPCC',
    dimensions: '530 × 200 × 210 mm · 5.8kg',
    extra: '5-Tray Cantilever Design',
    moq: '200 Units',
    tagline: 'Cold-Rolled SPCC Steel Armor',
    img: getIndustryPlaceholder('tools', 5),
  },
  {
    id: 'tl-7',
    name: 'Digital Display Inverter Welder 200A',
    desc: 'IGBT digital inverter arc welder with hot start, arc force, anti-stick, and digital amperage display. 110V/220V dual voltage.',
    badge: 'IGBT Inverter',
    category: 'welder',
    categoryNameZh: '',
    categoryNameEn: 'Welding Machines',
    material: 'IGBT Inverter Module + Copper Coil',
    dimensions: '290 × 120 × 198 mm · 4.2kg',
    extra: '200A Dual Voltage 110/220V',
    moq: '100 Units',
    tagline: '200A IGBT Dual Voltage Arc',
    img: getIndustryPlaceholder('tools', 6),
  },
  {
    id: 'tl-8',
    name: 'Auto-Ranging True-RMS Multimeter',
    desc: '6000-count true-RMS digital multimeter with NCV non-contact voltage detection, capacitance, temperature, and CAT III 600V safety.',
    badge: 'True RMS',
    category: 'meter',
    categoryNameZh: '',
    categoryNameEn: 'Digital Multimeters',
    material: 'Double-Molded Rugged ABS Armor',
    dimensions: '147 × 71 × 45 mm · 220g',
    extra: 'CAT III 600V True-RMS',
    moq: '500 Units',
    tagline: '6000-Count True-RMS CAT III',
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

  const brandName = company.name || (isVideo ? 'ForgeMaster Workshop Tools' : 'PrecisionTech Industrial Tools');
  const brandTagline = isVideo ? 'Heavy-Duty Power Tools & Fabrication Gear' : 'German Standard Precision Mechanics & Hand Tools';

  // Light Palettes Only - No dark mode!
  const theme = isVideo
    ? {
      bg: '#f5f5f4',
      cardBg: '#ffffff',
      cardBorder: 'rgba(234,88,12,0.16)',
      primary: '#ea580c',
      primaryHover: '#c2410c',
      text: '#1c1917',
      textMuted: '#52525b',
      textSub: '#71717a',
      glassBg: 'rgba(245,245,244,0.92)',
      pillBg: '#ffedd5',
      pillText: '#c2410c',
      btnGradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      accentGlow: 'rgba(234,88,12,0.2)',
    }
    : {
      bg: '#f4f4f6',
      cardBg: '#ffffff',
      cardBorder: 'rgba(2,132,199,0.16)',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(244,244,246,0.92)',
      pillBg: '#e0f2fe',
      pillText: '#0369a1',
      btnGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      accentGlow: 'rgba(2,132,199,0.2)',
    };

  // Distinct Header
  const headerHtml = isVideo ? `
    <header class="tools-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(234,88,12,0.04);">
      <div style="background:#ffedd5;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:800;">
        <div>20V MAX BLDC BRUSHLESS PLATFORM · CE / GS / UL CERTIFIED</div>
        <div>CONTAINER WHOLESALE EXPORT PROGRAM</div>
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
            Workshop RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="tools-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Tooling Catalog ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // WORKSHOP ACTION VIDEO & HIGH-TORQUE GAUGE HUD
      mainHtml = `
        <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;padding:70px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Heavy-Duty Workshop Fabrication · 20V BLDC Platform
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Heavy-Duty Power Tools: High-Torque Brushless Performance')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with 800 N·m brushless motor power, all-metal planetary gearboxes, and anti-vibration ergonomic housings for rigorous job-site demands.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore Workshop Lineup ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:6px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Distributor Program
                  </a>
                </div>
                <!-- Mechanical HUD Telemetry -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">800 N·m</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Max Breakaway Torque</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">5800 RPM</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Brushless High-Speed Motor</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">IP56 Rated</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Dust & Water Protection</div>
                  </div>
                </div>
              </div>

              <!-- Power Tool Console Display -->
              <div style="position:relative;">
                <div style="border-radius:18px;overflow:hidden;background:#ffffff;border:2px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(234,88,12,0.12);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:contain;padding:24px;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:rgba(28,25,23,0.85);backdrop-filter:blur(10px);color:#fff;padding:6px 12px;border-radius:4px;font-size:0.72rem;font-weight:800;">
                    JOB-SITE TESTED
                  </div>
                </div>
                <div style="position:absolute;bottom:-18px;left:20px;right:20px;background:#ffffff;border-radius:10px;padding:16px 20px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div>
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Brushless Impact Platform</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                  </div>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:4px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">View Specs ↗</a>
                </div>
              </div>
            </div>
          </section>

          <!-- Extreme Environment Durability Matrix -->
          <section style="padding:70px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:44px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Rigorous Reliability</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 0;">Job-Site Durability & Stress Testing</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">2.5m Concrete Drop Test</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Glass-filled polyamide housing absorbs repetitive impacts without hairline fractures or battery release.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">All-Metal Gear Train</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Precision powdered metallurgy gears with hardened planetary pinions for zero tooth strip under heavy torque.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Extreme Climate Ready</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Sub-zero -20°C starting capability and high-temperature 60°C continuous motor thermal dissipation.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Product Catalog -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Workshop Equipment Catalog</div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Power Tools & Fabrication Gear</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${theme.primary};">All Models (RFQ) →</a>
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
                          <span style="font-size:0.8rem;font-weight:800;color:${theme.primary};">Tool Details ↗</span>
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
      // ENGINEERING BLUEPRINT & DIMENSION MEASUREMENT DRAFTING TABLE
      mainHtml = `
        <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Blueprint Drafting Hero -->
          <section style="position:relative;padding:80px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ German Standard Precision Mechanics · DIN / ISO 9001
                </div>
                <h1 style="font-size:clamp(2.3rem, 4.5vw, 3.6rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Micron Precision Mechanics: Professional Tooling Systems')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Drop-forged chrome vanadium steel, sub-micron dimensional tolerances, and cryogenic hardening for industrial assembly lines.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore Precision Tools ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 26px;border-radius:6px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Metallurgy Standards
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">±0.001mm</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Tolerance Calibration</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">HRC 65+</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Hardened Tool Steel</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">DIN 863</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Metrology Compliant</div>
                  </div>
                </div>
              </div>

              <!-- Blueprint Drawing Card -->
              <div style="position:relative;">
                <div style="border-radius:16px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 50px rgba(2,132,199,0.08);padding:24px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;font-size:0.75rem;color:${theme.primary};font-weight:800;">
                    <span>TECHNICAL DRAWING NO. 884-A</span>
                    <span>SCALE 1:1</span>
                  </div>
                  <div style="aspect-ratio:4/3;background:#f8fafc;border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:contain;padding:16px;" fetchpriority="high">
                  </div>
                  <div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;">
                    <div>
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Master Mechanical Grade</div>
                      <div style="font-size:0.95rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                    </div>
                    <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:4px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">Spec Sheet ↗</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Tolerances & Metallurgy Testing Laboratory -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:640px;margin:0 auto 48px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;">Quality Assurance</span>
                <h2 style="font-size:clamp(1.9rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">Metallurgy & Precision Verification</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:24px;">
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Cryogenic Hardening</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">-196°C Liquid Nitrogen</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Converts retained austenite to martensite for maximum edge retention.</div>
                </div>
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Optical Zeiss CMM</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Multi-Sensor Coordinate Check</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Computer controlled 3D verification ensuring batch repeatability under 3 microns.</div>
                </div>
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Salt Spray 400H</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Electrostatic Chrome Finish</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">High-density microporous trivalent chromium barrier prevents shop corrosion.</div>
                </div>
                <div style="padding:26px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Torsion Life 50,000x</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Proof Torque Compliance</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Exceeds ASME and DIN test limits by at least 150% without permanent distortion.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Precision Catalog Shelf -->
          <section style="padding:90px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:48px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;">Industrial Tooling Lineup</div>
                  <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Precision Mechanics & Hand Tools</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${theme.primary};">Full Tooling Catalog →</a>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(2,132,199,0.04);transition:transform 0.3s;">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1;background:${theme.bg};position:relative;overflow:hidden;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:20px;">
                        <span style="position:absolute;top:12px;left:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="padding:22px;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-size:1.02rem;font-weight:900;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid ${theme.cardBorder};">
                          <span style="font-size:0.78rem;color:${theme.textSub};">MOQ: ${esc(p.moq)}</span>
                          <span style="font-size:0.82rem;font-weight:800;color:${theme.primary};">Technical Specs ↗</span>
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
      // Precision Metrology & Tooling Catalog
      mainHtml = `
        <main class="tools-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 32px;margin-bottom:32px;box-shadow:0 4px 20px rgba(2,132,199,0.04);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
                  ${esc(ui.catalog)} · Metrology &amp; Industrial Tooling (${products.length} SKUs)
                </div>
                <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);font-weight:900;color:${theme.text};margin:0;">
                  Precision Tooling &amp; Metrology Systems
                </h1>
              </div>
              <div style="display:flex;gap:12px;align-items:center;font-size:0.8rem;color:${theme.textMuted};flex-wrap:wrap;">
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Tolerance:</strong> &plusmn;0.005mm DIN
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Metallurgy:</strong> HRC 62-65 Carbide
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Surface:</strong> Ra 0.2&mu;m Mirror Lap
                </span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:24px;">
              ${products.map(p => `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(2,132,199,0.03);position:relative;">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.15;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:78%;height:78%;object-fit:contain;">
                      <div style="position:absolute;top:10px;left:10px;display:flex;gap:6px;">
                        <span style="background:${theme.primary};color:#fff;font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="position:absolute;bottom:8px;left:10px;right:10px;display:flex;justify-content:space-between;background:rgba(255,255,255,0.92);backdrop-filter:blur(4px);padding:4px 8px;border-radius:6px;font-size:0.68rem;font-weight:700;color:${theme.primary};">
                        <span>CALIBRATION: ISO 17025</span>
                        <span>HARDNESS: 62 HRC</span>
                      </div>
                    </div>
                    <div style="padding:18px;">
                      <div style="font-size:0.7rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                      <h2 style="font-size:0.98rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h2>
                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;margin-bottom:12px;font-size:0.75rem;color:${theme.textMuted};">
                        <div><strong>Material:</strong> ${esc(p.material.slice(0, 16))}</div>
                        <div><strong>MOQ:</strong> <span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                        <div><strong>Standard:</strong> ${esc(p.extra.slice(0, 16))}</div>
                        <div><strong>Accuracy:</strong> &plusmn;0.005mm</div>
                      </div>
                      <p style="font-size:0.8rem;color:${theme.textMuted};margin:0 0 12px;line-height:1.5;">${esc(p.desc)}</p>
                      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px dashed ${theme.cardBorder};padding-top:10px;font-size:0.78rem;">
                        <span style="color:${theme.textSub};">Tooling Dossier</span>
                        <span style="color:${theme.primary};font-weight:800;">Blueprint &amp; Tolerances &rarr;</span>
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
      // Heavy-Duty Power Tools & Jobsite Workshop Equipment Catalog
      mainHtml = `
        <main class="tools-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 32px;margin-bottom:32px;box-shadow:0 4px 20px rgba(217,119,6,0.04);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
                  ${esc(ui.catalog)} · Contractor Machinery &amp; Power Tools (${products.length} SKUs)
                </div>
                <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);font-weight:900;color:${theme.text};margin:0;">
                  Heavy-Duty Power Tools &amp; Jobsite Gear
                </h1>
              </div>
              <div style="display:flex;gap:12px;align-items:center;font-size:0.8rem;color:${theme.textMuted};flex-wrap:wrap;">
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Drive:</strong> Brushless High-Torque
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Impact:</strong> 2.0m Drop Concrete
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Rating:</strong> IP56 Jobsite Certified
                </span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:24px;">
              ${products.map(p => `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(217,119,6,0.03);position:relative;">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.15;background:#fafaf9;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:78%;height:78%;object-fit:contain;">
                      <div style="position:absolute;top:10px;left:10px;display:flex;gap:6px;">
                        <span style="background:${theme.primary};color:#fff;font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="position:absolute;bottom:8px;left:10px;right:10px;display:flex;justify-content:space-between;background:rgba(255,255,255,0.92);backdrop-filter:blur(4px);padding:4px 8px;border-radius:6px;font-size:0.68rem;font-weight:700;color:${theme.primary};">
                        <span>TORQUE: 180 N&middot;m PEAK</span>
                        <span>PLATFORM: 20V MAX</span>
                      </div>
                    </div>
                    <div style="padding:18px;">
                      <div style="font-size:0.7rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                      <h2 style="font-size:0.98rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h2>
                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;margin-bottom:12px;font-size:0.75rem;color:${theme.textMuted};">
                        <div><strong>Platform:</strong> ${esc(p.material.slice(0, 16))}</div>
                        <div><strong>MOQ:</strong> <span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                        <div><strong>Dimensions:</strong> ${esc(p.dimensions.slice(0, 16))}</div>
                        <div><strong>Standard:</strong> CE / GS / ETL</div>
                      </div>
                      <p style="font-size:0.8rem;color:${theme.textMuted};margin:0 0 12px;line-height:1.5;">${esc(p.desc)}</p>
                      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px dashed ${theme.cardBorder};padding-top:10px;font-size:0.78rem;">
                        <span style="color:${theme.textSub};">Contractor Line</span>
                        <span style="color:${theme.primary};font-weight:800;">Performance HUD &rarr;</span>
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
      // Precision Metrology Detail
      mainHtml = `
        <main class="tools-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:24px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${theme.primary};">&larr; Back to Precision Tooling Catalog</a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;margin-bottom:48px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(2,132,199,0.04);position:relative;">
                <div style="position:absolute;top:16px;right:16px;background:#f0f9ff;border:1px solid #bae6fd;color:#0284c7;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:4px;letter-spacing:0.04em;">
                  METROLOGY TOLERANCE &plusmn;0.005MM
                </div>
                <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:400px;object-fit:contain;display:block;margin:16px 0;" fetchpriority="high">
                <div class="wr-detail-thumbs" style="display:flex;gap:12px;margin-top:20px;justify-content:center;">
                  <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:6px;padding:4px;background:#fff;cursor:pointer;">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:52px;height:52px;object-fit:cover;">
                  </button>
                </div>
              </div>

              <div>
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
                  ${esc(p.categoryNameEn)} &middot; ${esc(p.badge)}
                </div>
                <h1 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Blueprint & Metrology Spec Dossier -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px;margin-bottom:28px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:0.82rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;">
                    <span>📐 Metrology &amp; Metallurgy Specification Dossier</span>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;color:${theme.textMuted};">
                    <div><strong>Dimensional Tolerance:</strong><br><span style="color:${theme.text};font-weight:700;">&plusmn;0.005mm (ISO 2768-mK)</span></div>
                    <div><strong>Metallurgy / Alloy:</strong><br><span style="color:${theme.text};font-weight:700;">${esc(p.material)}</span></div>
                    <div><strong>Surface Finish:</strong><br><span style="color:${theme.text};font-weight:700;">Ra 0.2&mu;m Precision Lapped</span></div>
                    <div><strong>Hardness Rating:</strong><br><span style="color:${theme.text};font-weight:700;">HRC 62-65 Rockwell C</span></div>
                    <div><strong>Form Factor / Dimensions:</strong><br><span style="color:${theme.text};font-weight:700;">${esc(p.dimensions)}</span></div>
                    <div><strong>Production MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                  </div>
                </div>

                <div style="background:#f8fafc;border-left:4px solid ${theme.primary};padding:16px;border-radius:0 8px 8px 0;margin-bottom:28px;font-size:0.84rem;color:${theme.textMuted};line-height:1.6;">
                  <strong>100% CMM Optical Inspection:</strong> Every master tooling piece undergoes multi-axis coordinate measurement and spectral hardness analysis prior to protective oil dipping and crate export.
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:14px 32px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                    Request Metrology Sample &rarr;
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:6px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Submit Engineering CAD (STEP/IGES)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // Heavy-Duty Power Tools Detail
      mainHtml = `
        <main class="tools-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:24px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${theme.primary};">&larr; Back to Contractor Equipment Lineup</a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;margin-bottom:48px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(217,119,6,0.04);position:relative;">
                <div style="position:absolute;top:16px;right:16px;background:#fffbeb;border:1px solid #fde68a;color:#d97706;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:4px;letter-spacing:0.04em;">
                  2.0M CONCRETE DROP TESTED
                </div>
                <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:400px;object-fit:contain;display:block;margin:16px 0;" fetchpriority="high">
                <div class="wr-detail-thumbs" style="display:flex;gap:12px;margin-top:20px;justify-content:center;">
                  <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:6px;padding:4px;background:#fff;cursor:pointer;">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:52px;height:52px;object-fit:cover;">
                  </button>
                </div>
              </div>

              <div>
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
                  ${esc(p.categoryNameEn)} &middot; ${esc(p.badge)}
                </div>
                <h1 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Jobsite Durability & Motor HUD -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;padding:24px;margin-bottom:28px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:0.82rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;">
                    <span>⚡ Jobsite Performance &amp; Motor Telemetry HUD</span>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;color:${theme.textMuted};">
                    <div><strong>Peak Torque Output:</strong><br><span style="color:${theme.text};font-weight:700;">180 N&middot;m Brushless Drive</span></div>
                    <div><strong>Continuous Duty Life:</strong><br><span style="color:${theme.text};font-weight:700;">500h Heavy Load Tested</span></div>
                    <div><strong>Ingress Sealing:</strong><br><span style="color:${theme.text};font-weight:700;">IP56 Dust &amp; Water Seal</span></div>
                    <div><strong>Battery Ecosystem:</strong><br><span style="color:${theme.text};font-weight:700;">20V Universal Li-Ion Rail</span></div>
                    <div><strong>Housing Armor:</strong><br><span style="color:${theme.text};font-weight:700;">Glass-Filled Nylon &amp; TPR</span></div>
                    <div><strong>Production MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                  </div>
                </div>

                <div style="background:#fefce8;border-left:4px solid ${theme.primary};padding:16px;border-radius:0 8px 8px 0;margin-bottom:28px;font-size:0.84rem;color:${theme.textMuted};line-height:1.6;">
                  <strong>Contractor Durability Standard:</strong> All-metal planetary gearsets, anti-kickback electronic sensors, and conformal coated motor electronics ensure uninterrupted performance on commercial construction jobsites.
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:14px 32px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                    Request Contractor Evaluation Unit &rarr;
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:6px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Distributor Container Program (FOB)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo
      ? `${company.name} · Industrial Power Tool Manufacturing Facility`
      : `${company.name} · Certified Precision Tooling & Metrology Works`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    if (!isVideo) {
      // Precision Metrology Lab About
      const highlights = parseAboutHighlights(company.aboutHighlights, [
        { value: '±0.003mm', num: 3, label: 'Metrology Precision', desc: 'Zeiss CMM laser scanned' },
        { value: '120+ Units', num: 120, label: 'CNC Machining Centers', desc: '5-axis German & Japanese mills' },
        { value: 'ISO 17025', num: 17025, label: 'Calibration Lab', desc: 'Accredited inspection standard' },
        { value: '65+ Markets', num: 65, label: 'Industrial Supply', desc: 'Aerospace & automotive clients' },
      ]);
      mainHtml = `
        <main class="tools-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                  ${esc(ui.about)} · Metrology &amp; Tooling Lab
                </div>
                <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;">
                  ${esc(headline)}
                </h1>
                ${storyParagraphs.map(p => `<p style="font-size:1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')}
              </div>
              <div style="border-radius:16px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(2,132,199,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:20px;margin-bottom:60px;">
              ${highlights.map(h => `
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px;text-align:center;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                  <div style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:4px 0 2px;">${esc(h.label)}</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc)}</div>
                </div>
              `).join('')}
            </div>

            <!-- 4-Stage Metrology Verification Module -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:36px;margin-bottom:60px;">
              <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 6px;">Sub-Micron Tooling Quality Protocol</h2>
              <p style="font-size:0.9rem;color:${theme.textMuted};margin:0 0 24px;">From incoming vacuum degassed alloy bars to finished micron-lapped inspection tools.</p>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Stage 01</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">Optical Spectroscopy</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">OES spectral verification of chromium-vanadium, molybdenum, and tungsten carbide grain structure.</div>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Stage 02</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">5-Axis CNC &amp; Wire EDM</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">Sub-micron precision contouring with oil-cooled Japanese wire EDM and German multi-axis tooling.</div>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Stage 03</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">Cryogenic Quenching</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">Vacuum furnace heat treatment down to -196&deg;C deep freeze to stabilize martensitic phase hardness.</div>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Stage 04</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">Zeiss CMM Calibration</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">Temperature-controlled (20&deg;C &plusmn;0.5&deg;C) coordinate measurement and dimensional calibration certificate issue.</div>
                </div>
              </div>
            </div>

            <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:36px;">
              <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Contract Manufacturing &amp; Private Label Metrology</h2>
              <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 20px;">We engineer custom precision tools, calibrated gauge blocks, and turnkey OEM master sets with private label laser serialization.</p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:12px 28px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.9rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                Initiate Metrology Consultation &rarr;
              </a>
            </div>
          </section>
        </main>
      `;
    } else {
      // Heavy Power Equipment Manufacturing Facility About
      const highlights = parseAboutHighlights(company.aboutHighlights, [
        { value: '250,000 Pcs', num: 250000, label: 'Monthly Capacity', desc: 'Brushless power tools' },
        { value: '12 Lines', num: 12, label: 'Robotic Motor Winding', desc: 'Automated armature production' },
        { value: '100% Tested', num: 100, label: 'Torque Dynamometer', desc: 'Pre-shipment bench testing' },
        { value: '75+ Countries', num: 75, label: 'Global Shipments', desc: 'Contractor tool distribution' },
      ]);
      mainHtml = `
        <main class="tools-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                  ${esc(ui.about)} · Motor &amp; Assembly Plant
                </div>
                <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;">
                  ${esc(headline)}
                </h1>
                ${storyParagraphs.map(p => `<p style="font-size:1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')}
              </div>
              <div style="border-radius:16px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(217,119,6,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:20px;margin-bottom:60px;">
              ${highlights.map(h => `
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px;text-align:center;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                  <div style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:4px 0 2px;">${esc(h.label)}</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc)}</div>
                </div>
              `).join('')}
            </div>

            <!-- Heavy Durability Test Rig Module -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:36px;margin-bottom:60px;">
              <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 6px;">Industrial Jobsite Reliability Standards</h2>
              <p style="font-size:0.9rem;color:${theme.textMuted};margin:0 0 24px;">Automated stress-testing protocols validating every brushless armature, planetary gearbox, and battery controller.</p>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Test 01</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">Dynamometer Torque Peak</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">Continuous full-load torque profiling and thermal heat-dissipation curve monitoring under heavy current.</div>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Test 02</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">Drop &amp; Vibration Shake Table</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">Multi-axis high-frequency harmonic vibration and 2-meter repeated concrete impact drop qualification.</div>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Test 03</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">IP56 Ingress Enclosure</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">Pressurized water jet spray and silica dust chamber testing ensuring impenetrable motor cavity seals.</div>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:10px;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">Test 04</div>
                  <div style="font-size:0.95rem;font-weight:800;color:${theme.text};margin-bottom:6px;">Li-Ion BMS Aging Racks</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.5;">1,000-cycle high-draw charge/discharge validation with over-current and temperature shutdown triggers.</div>
                </div>
              </div>
            </div>

            <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:36px;">
              <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Contractor Brand ODM &amp; Distributor Supply</h2>
              <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 20px;">We support custom housing color molding, full pallet container load-outs, CE/GS/ETL certification transfers, and spare parts supply agreements.</p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:12px 28px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.9rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                Initiate Distributor RFQ &rarr;
              </a>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'contact') {
    if (!isVideo) {
      // Precision Metrology Contact
      mainHtml = `
        <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section class="wrap" style="padding:40px 24px 80px;">
            <header style="text-align:center;max-width:620px;margin:0 auto 48px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
                ${esc(ui.contact)} &middot; Precision Engineering Desk
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">Submit Engineering Drawings &amp; RFQ</h1>
              <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory engineering response with CMM dimensional tolerance feasibility, alloy options, and export crate MOQ.</p>
            </header>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;box-shadow:0 8px 24px rgba(2,132,199,0.03);">
                <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Precision Tooling Request</h2>
                <form id="inquiry" style="display:grid;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Tool SKU / Reference Model</label>
                    <select name="productId" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                      <option value="">— Select Precision SKU (Optional) —</option>
                      ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                      <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Tolerance Requirement</label>
                      <input type="text" disabled placeholder="&plusmn;0.005mm / DIN 2768" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Alloy / Steel Grade</label>
                      <input type="text" disabled placeholder="Cr-V / S2 / Tungsten Carbide" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">CAD File &amp; Technical Notes</label>
                    <textarea disabled rows="4" placeholder="Share STEP / IGES drawing links, required Rockwell hardness (HRC), calibration certificate needs, or destination port..." style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                  </div>
                  <button type="submit" disabled style="padding:14px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Submit Metrology Inquiry &rarr;
                  </button>
                </form>
              </div>

              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Precision Engineering Plant Office</h2>
                  <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.7;margin:0 0 20px;">
                    ISO 17025 accredited metrology lab equipped with multi-sensor Zeiss CMM machines, Mitutoyo surface roughness testers, and optical profile projectors.
                  </p>
                  <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.8;">
                    <div><strong>Facility:</strong> ${esc(company.name || brandName)} Precision Works</div>
                    <div><strong>Engineering:</strong> ${esc(company.email || 'engineering@precisiontools.com')}</div>
                    <div><strong>Calibration Lab:</strong> Temperature Controlled (20&deg;C &plusmn;0.5&deg;C)</div>
                    <div><strong>Certifications:</strong> ISO 9001:2015, ISO 17025, DIN, ASME</div>
                  </div>
                </div>
                <div style="padding:16px;background:${theme.bg};border-radius:8px;font-size:0.78rem;color:${theme.textSub};line-height:1.5;margin-top:24px;">
                  📐 Factory Guarantee: 100% CMM dimensional inspection and full material batch trace reports provided with export orders.
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // Heavy-Duty Power Tools Contact
      mainHtml = `
        <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section class="wrap" style="padding:40px 24px 80px;">
            <header style="text-align:center;max-width:620px;margin:0 auto 48px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
                ${esc(ui.contact)} &middot; Contractor Fleet &amp; Distributor Desk
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">Contractor Fleet &amp; Wholesale RFQ</h1>
              <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory container wholesale pricing, customized housing Pantone matching, and regional distributor support.</p>
            </header>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;box-shadow:0 8px 24px rgba(217,119,6,0.03);">
                <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Equipment Wholesale Quotation</h2>
                <form id="inquiry" style="display:grid;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Power Tool / Machine SKU</label>
                    <select name="productId" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                      <option value="">— Select Equipment SKU (Optional) —</option>
                      ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                      <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Container Order Volume</label>
                      <input type="text" disabled placeholder="e.g. 1x 20GP / 1x 40HQ" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Voltage / Battery Platform</label>
                      <input type="text" disabled placeholder="20V Max / 230V EU / 110V US" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Customization &amp; Distributor Scope</label>
                    <textarea disabled rows="4" placeholder="Detail private label branding, blow-molded tool case specs, battery cell brand preferences (Samsung/LG/Domestic), or target port..." style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                  </div>
                  <button type="submit" disabled style="padding:14px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Submit Contractor RFQ &rarr;
                  </button>
                </form>
              </div>

              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Power Equipment Manufacturing Headquarters</h2>
                  <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.7;margin:0 0 20px;">
                    Automated motor armature winding lines, robotic assembly workcells, and high-volume automated battery testing racks with container FOB logistics.
                  </p>
                  <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.8;">
                    <div><strong>Headquarters:</strong> ${esc(company.name || brandName)} Heavy Machinery Hub</div>
                    <div><strong>Commercial Desk:</strong> ${esc(company.email || 'wholesale@powerequipment.com')}</div>
                    <div><strong>Compliance:</strong> CE, GS, EMC, RoHS, UL, ETL Certified</div>
                    <div><strong>Warranty Support:</strong> 2-Year Commercial Contractor Warranty</div>
                  </div>
                </div>
                <div style="padding:16px;background:${theme.bg};border-radius:8px;font-size:0.78rem;color:${theme.textSub};line-height:1.5;margin-top:24px;">
                  ⚡ Distributor Advantage: 100% dynamometer torque testing and complete spare-parts supply programs provided for worldwide importers.
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
    }
  }

  const footerHtml = `
    <footer class="tools-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;color:${theme.textSub};font-size:0.84rem;">
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
            <div>✓ DIN / ISO Metric Tolerances</div>
            <div>✓ Proof Torque Tested</div>
            <div>✓ GS & CE Certified</div>
          </div>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;align-items:center;justify-content:space-between;font-size:0.78rem;">
        <div>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved. Industrial Tools Export Portal.</div>
        <div style="display:flex;gap:16px;">
          <span>ISO 9001:2015</span>
          <span>TÜV GS Tested</span>
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
