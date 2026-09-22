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
    mainHtml = `
      <main class="tools-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.catalog)} · Industrial Export Catalog
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">
              ${isVideo ? 'Power Tools & Workshop Equipment Lineup' : 'Precision Mechanical & Hand Tool Systems'}
            </h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Custom colorways, laser branded serialization, and container wholesale programs.</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
            ${products.map(p => `
              <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                  <div style="aspect-ratio:1;background:#f8fafc;position:relative;">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:16px;">
                    <span style="position:absolute;top:10px;left:10px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                  </div>
                  <div style="padding:18px;">
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h2 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 6px;line-height:1.3;">${esc(p.name)}</h2>
                    <p style="font-size:0.8rem;color:${theme.textMuted};margin:0 0 10px;line-height:1.5;">${esc(p.desc)}</p>
                    <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">View Dimensions & MOQ ↗</div>
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
      <main class="tools-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:24px;">
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${theme.primary};">← Back to Tooling Catalog</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:30px;position:relative;">
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
              
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:20px;margin-bottom:28px;">
                <h3 style="font-size:0.88rem;font-weight:800;text-transform:uppercase;color:${theme.text};margin:0 0 14px;">Machining & Material Standards</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.85rem;color:${theme.textMuted};">
                  <div><strong>Alloy Grade:</strong><br>${esc(p.material)}</div>
                  <div><strong>Dimensions / Weight:</strong><br>${esc(p.dimensions)}</div>
                  <div><strong>Standard:</strong><br>${esc(p.extra)}</div>
                  <div><strong>Production MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                </div>
              </div>

              <div style="display:flex;gap:14px;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:14px 32px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                  Request Commercial Sample ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:6px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                  OEM Brand Packaging
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, `${company.name} · Certified Industrial Tool Works`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2012', num: 2012, label: 'Established', desc: 'Precision manufacturing' },
      { value: 'ISO 9001:2015', num: 9001, label: 'Quality System', desc: 'Audited production lines' },
      { value: '500,000 Sq Ft', num: 500000, label: 'Manufacturing', desc: 'Drop-forge & CNC facility' },
      { value: '80+ Countries', num: 80, label: 'Global Shipments', desc: 'Industrial supply networks' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="tools-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                ${esc(ui.about)} · Plant & Facilities
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;">
                ${esc(headline)}
              </h1>
              ${storyParagraphs.map(p => `<p style="font-size:1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-radius:16px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(0,0,0,0.06);">
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

          <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:36px;">
            <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Direct Tooling Factory Partnership</h2>
            <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 20px;">We support contract manufacturing, private label blow-molded tool sets, customized laser etchings, and container FOB shipments.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:12px 28px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.9rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
              Initiate Commercial RFQ ↗
            </a>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'contact') {
    mainHtml = `
      <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <header style="text-align:center;max-width:620px;margin:0 auto 48px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.contact)} · Industrial Sourcing Desk
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">Submit Your Tooling Request</h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory response with container load quantities, pallet configurations, and OEM lead times.</p>
          </header>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
              <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Request For Quotation</h2>
              <form style="display:grid;gap:16px;">
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Product / Tool Model</label>
                  <select name="productId" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    <option value="">— Select Tooling SKU (Optional) —</option>
                    ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Order Volume (Sets/Units)</label>
                    <input type="text" disabled placeholder="e.g. 500 Sets" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Custom Packaging</label>
                    <input type="text" disabled placeholder="Blow Mold / Color Box" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                </div>
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Technical Requirements & Certifications</label>
                  <textarea disabled rows="4" placeholder="Specify required alloy grade (CrV, CrMo, S2, HSS), DIN standards, testing reports, or port of destination..." style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                </div>
                <button type="submit" disabled style="padding:14px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 14px ${theme.accentGlow};">
                  Submit Tooling Inquiry ↗
                </button>
              </form>
            </div>

            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Export Plant Engineering Office</h2>
                <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.7;margin:0 0 20px;">
                  Equipped with 2500T hydraulic drop-forge presses, automated continuous quenching furnaces, CNC 5-axis machining centers, and comprehensive torque test benches.
                </p>
                <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.8;">
                  <div><strong>Company:</strong> ${esc(company.name || brandName)}</div>
                  <div><strong>Email:</strong> ${esc(company.email || 'export@toolsmachinery.com')}</div>
                  <div><strong>Facility:</strong> National Heavy Tool Industrial Zone</div>
                  <div><strong>Standards:</strong> DIN, ISO, ASME, GS, CE</div>
                </div>
              </div>
              <div style="padding:16px;background:${theme.bg};border-radius:8px;font-size:0.78rem;color:${theme.textSub};line-height:1.5;margin-top:24px;">
                🛠️ Pre-Shipment Inspection: 100% torque failure and dimensional inspection reports issued with every production run.
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
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
