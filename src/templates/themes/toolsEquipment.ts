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
    name: 'Fiberglass Anti-Shock Dead Blow Hammer',
    desc: 'Shot-filled dead blow hammer with fiberglass handle, non-marring polyurethane head, and anti-shock vibration dampening.',
    badge: 'Dead Blow',
    category: 'hammer',
    categoryNameZh: '',
    categoryNameEn: 'Specialty Hammers',
    material: 'Fiberglass + Polyurethane Head',
    dimensions: '340mm Length · 900g',
    extra: 'Non-Marring Dead Blow',
    moq: '500 Units',
    tagline: 'Non-Marring Anti-Shock Design',
    img: getIndustryPlaceholder('tools', 5),
  },
  {
    id: 'tl-7',
    name: 'Rolling Tool Cabinet 7-Drawer',
    desc: 'Heavy-duty rolling tool cabinet with 7 ball-bearing slide drawers, EVA foam liner, and 350kg load capacity.',
    badge: 'Pro Storage',
    category: 'toolbox',
    categoryNameZh: '',
    categoryNameEn: 'Tool Storage',
    material: 'Cold-Rolled Steel 1.2mm',
    dimensions: '680 × 460 × 1000 mm · 42kg',
    extra: '350kg Load Capacity',
    moq: '100 Units',
    tagline: '350kg Heavy-Duty Ball-Bearing',
    img: getIndustryPlaceholder('tools', 6),
  },
  {
    id: 'tl-8',
    name: 'IGBT 200A MIG/TIG Inverter Welder',
    desc: 'Dual-process MIG/TIG inverter welder with IGBT technology, digital display, and gas/gasless flux-core capability.',
    badge: 'IGBT Dual',
    category: 'welder',
    categoryNameZh: '',
    categoryNameEn: 'Inverter Welders',
    material: 'IGBT Inverter Module',
    dimensions: '480 × 210 × 360 mm · 11kg',
    extra: '200A IGBT MIG/TIG',
    moq: '100 Units',
    tagline: '200A IGBT Dual-Process',
    img: getIndustryPlaceholder('tools', 7),
  }
];

export function getToolsProducts(ctx: ThemeContext): ThemedToolsItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'tools',
      categoryNameZh: '',
      categoryNameEn: 'Ratchet Wrenches',
      material: p.material || '',
      dimensions: p.dimensions || '',
      extra: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = TOOLS_DEFAULT_PRODUCTS[idx % TOOLS_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: fallback.badge,
        category: fallback.category,
        categoryNameZh: '',
        categoryNameEn: fallback.categoryNameEn,
        material: p.material || fallback.material,
        dimensions: p.dimensions || fallback.dimensions,
        extra: fallback.extra,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
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

  const brandName = company.name || (isVideo ? 'IronSpark Fabrication Lab' : 'PrecisionForge Tool Works');
  const brandTagline = isVideo ? 'Heavy-Duty Fabrication & Welding' : 'Professional-Grade Precision Tools';

  const theme = isVideo
    ? {
      bg: '#1c1917', cardBg: '#292524', cardBorder: 'rgba(251,146,60,0.20)',
      primary: '#fb923c', primaryHover: '#f97316', text: '#fafaf9', textMuted: '#a8a29e', textSub: '#78716c',
      glassBg: 'rgba(28,25,23,0.92)', pillBg: 'rgba(251,146,60,0.15)', pillText: '#fb923c',
      btnGradient: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)', accentGlow: 'rgba(251,146,60,0.25)',
    }
    : {
      bg: '#f4f4f5', cardBg: '#ffffff', cardBorder: 'rgba(234,88,12,0.14)',
      primary: '#ea580c', primaryHover: '#c2410c', text: '#18181b', textMuted: '#52525b', textSub: '#71717a',
      glassBg: 'rgba(244,244,245,0.92)', pillBg: '#fff7ed', pillText: '#c2410c',
      btnGradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', accentGlow: 'rgba(234,88,12,0.18)',
    };

  const headerHtml = `
    <header class="tools-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.04);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};">${esc(brandName)}</span>
            <span style="font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;color:${theme.primary};font-weight:700;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
            B2B Sourcing RFQ ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      mainHtml = `
        <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Forge & Fabrication Lab
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Heavy-Duty Fabrication: IGBT Welding & CNC Precision')}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:620px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'IGBT inverter welders, brushless angle grinders, and industrial-grade CNC machining accessories.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};transition:transform 0.2s;">
                    Explore Products ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:10px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    Request Pricing
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  ${[['HRC 52', 'Steel Hardness'], ['ISO', '9001 QMS'], ['CE', 'Certified']].map(([v, l]) => `
                    <div><div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">${v}</div><div style="font-size:0.75rem;color:${theme.textSub};">${l}</div></div>
                  `).join('')}
                </div>
              </div>
              <div style="position:relative;">
                <div style="aspect-ratio:4/3;border-radius:20px;overflow:hidden;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 20px 50px rgba(0,0,0,0.15);">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:cover;" fetchpriority="high">
                </div>
                <div style="position:absolute;bottom:-16px;left:24px;right:24px;background:${theme.glassBg};backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);border-radius:14px;padding:16px 20px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;">
                  <div>
                    <div style="font-size:0.82rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;">${esc(heroProduct.categoryNameEn)}</div>
                    <div style="font-size:0.92rem;font-weight:700;color:${theme.text};margin-top:2px;">${esc(heroProduct.name)}</div>
                  </div>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">View ↗</a>
                </div>
              </div>
            </div>
          </section>

          <!-- Product Grid -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:50px;">
                <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">Featured Products</div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};margin:0;">Our Product Range</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;transition:transform 0.3s,box-shadow 0.3s;">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1;overflow:hidden;background:${theme.bg};position:relative;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:16px;transition:transform 0.4s;">
                        ${p.badge ? `<span style="position:absolute;top:12px;left:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:6px;">${esc(p.badge)}</span>` : ''}
                      </div>
                      <div style="padding:18px;">
                        <div style="font-size:0.72rem;font-weight:700;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.5;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                        <div style="font-size:0.78rem;color:${theme.primary};font-weight:700;">View Details →</div>
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
      mainHtml = `
        <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Hero Banner -->
          <section style="position:relative;overflow:hidden;padding:100px 0 80px;">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Industrial Precision Workshop
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.6rem);font-weight:900;line-height:1.1;color:${theme.text};letter-spacing:-0.03em;margin:0 0 20px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Professional-Grade CrV Steel & BLDC Power Tools')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Chrome vanadium 72-tooth ratchets, brushless motor drills, and laser-calibrated measuring instruments.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:12px;background:${theme.btnGradient};color:#ffffff;font-size:0.98rem;font-weight:800;box-shadow:0 6px 24px ${theme.accentGlow};transition:transform 0.2s;">
                    Explore Collection ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:15px 28px;border-radius:12px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.98rem;font-weight:700;">
                    Our Story
                  </a>
                </div>
              </div>
              <div style="position:relative;">
                <div style="aspect-ratio:4/3;border-radius:24px;overflow:hidden;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(0,0,0,0.08);">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:contain;padding:20px;" fetchpriority="high">
                </div>
              </div>
            </div>
          </section>

          <!-- Stats Row -->
          <section style="padding:50px 0;border-top:1px solid ${theme.cardBorder};border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">HRC 52</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Steel Hardness</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">Heat-treated CrV alloy</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">ISO</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">9001 QMS</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">Quality management system</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">CE</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Certified</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">EU safety compliance</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">GS</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Mark</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">German safety standard</div>
              </div>
            </div>
          </section>

          <!-- Product Grid -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:50px;">
                <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">Product Showcase</div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};margin:0;">Featured Products</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;transition:transform 0.3s,box-shadow 0.3s;">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1;overflow:hidden;background:linear-gradient(135deg, ${theme.bg}, ${theme.cardBg});position:relative;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:20px;transition:transform 0.4s;">
                        ${p.badge ? `<span style="position:absolute;top:12px;right:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:6px;">${esc(p.badge)}</span>` : ''}
                      </div>
                      <div style="padding:18px;">
                        <div style="font-size:0.72rem;font-weight:700;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.5;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                        <div style="font-size:0.78rem;color:${theme.primary};font-weight:700;">View Details →</div>
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
      <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <header style="margin-bottom:40px;">
            <h1 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 8px;">${esc(ui.catalog)}</h1>
            <p style="font-size:0.95rem;color:${theme.textMuted};margin:0;">Browse our complete range of products for B2B wholesale and OEM sourcing.</p>
          </header>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px;">
            ${products.map(p => `
              <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;transition:transform 0.3s,box-shadow 0.3s;">
                <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                  <div style="aspect-ratio:1;overflow:hidden;background:${theme.bg};">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:16px;transition:transform 0.3s;">
                  </div>
                  <div style="padding:16px;">
                    <div style="font-size:0.72rem;font-weight:700;color:${theme.primary};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h3 style="font-size:0.92rem;font-weight:800;color:${theme.text};margin:0 0 6px;line-height:1.3;">${esc(p.name)}</h3>
                    <p style="font-size:0.8rem;color:${theme.textMuted};margin:0 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.74rem;color:${theme.textSub};">MOQ: ${esc(p.moq)}</span>
                      <span style="font-size:0.78rem;color:${theme.primary};font-weight:700;">Details →</span>
                    </div>
                  </div>
                </a>
              </article>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  } else if (page === 'detail') {
    const prodId = ctx.options.productId || products[0].id;
    const p = products.find(item => item.id === prodId) || products[0];
    mainHtml = `
      <main class="tools-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <div style="margin-bottom:20px;">
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-size:0.86rem;font-weight:800;color:${theme.primary};text-decoration:none;">← Back to Catalog</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:start;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;box-shadow:0 10px 30px rgba(0,0,0,0.04);">
            <div style="background:${theme.bg};border-radius:20px;padding:40px;display:flex;align-items:center;justify-content:center;border:1px solid ${theme.cardBorder};position:relative;">
              ${p.badge ? `<span style="position:absolute;top:20px;left:20px;background:${theme.primary};color:#fff;font-size:0.75rem;font-weight:800;padding:5px 12px;border-radius:6px;">${esc(p.badge)}</span>` : ''}
              <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;" loading="eager" fetchpriority="high">
            </div>
            <div>
              <div style="font-size:0.82rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">${p.categoryNameEn} · ${esc(p.tagline)}</div>
              <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 14px;">${esc(p.name)}</h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.65;margin:0 0 24px;">${esc(p.desc)}</p>
              <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;margin-bottom:28px;">
                <h3 style="font-size:0.92rem;font-weight:900;color:${theme.text};margin:0 0 14px;text-transform:uppercase;letter-spacing:0.04em;">Specifications</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.84rem;color:${theme.textMuted};">
                  <div><strong>Material:</strong><br>${esc(p.material)}</div>
                  <div><strong>Dimensions:</strong><br>${esc(p.dimensions)}</div>
                  <div><strong>Feature:</strong><br>${esc(p.extra)}</div>
                  <div><strong>MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                </div>
              </div>
              <div style="display:flex;gap:14px;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:${theme.btnGradient};color:#ffffff;font-weight:800;padding:15px 32px;border-radius:10px;font-size:0.92rem;box-shadow:0 6px 20px ${theme.accentGlow};text-decoration:none;">
                  Request Quote & Sample ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-weight:800;padding:15px 28px;border-radius:10px;font-size:0.92rem;text-decoration:none;">
                  Custom OEM Inquiry
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, `${company.name} · Industrial Mastery`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2018', num: parseInt(company.establishedYear || '2018', 10), label: 'Established', desc: 'Heat-treated CrV alloy' },
      { value: 'HRC 52', num: 100, label: 'Steel Hardness', desc: 'Heat-treated CrV alloy' },
      { value: 'ISO', num: 99, label: '9001 QMS', desc: 'Quality management system' },
      { value: 'GS', num: 100, label: 'Mark', desc: 'German safety standard' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');
    const pipeline = isVideo ? [['IGBT Assembly', 'Power semiconductor module assembly and bonding'], ['Arc Calibration', 'Welding arc stability and spatter optimization'], ['Thermal Cycling', 'Accelerated thermal cycling stress testing'], ['EMC Shielding', 'Electromagnetic interference suppression testing'], ['Field Trials', 'Professional welder field durability validation']] : [['Steel Forging', 'CrV and CrMo alloy hot-forging and heat treatment'], ['CNC Machining', 'Multi-axis CNC milling and precision grinding'], ['Heat Treatment', 'Induction hardening and tempering to HRC 48-52'], ['Surface Finish', 'Chrome plating, powder coating, and laser marking'], ['Torque Testing', 'Calibrated torque and fatigue cycle testing']];
    mainHtml = `
      <main class="tools-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
        <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
          <!-- Hero Section -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:16px;">
                ${esc(ui.about)}
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;">
                ${esc(headline)}
              </h1>
              ${storyParagraphs.map(p => `<p style="font-size:0.98rem;line-height:1.7;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.08);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:400px;object-fit:cover;display:block;" loading="lazy">
            </div>
          </div>

          <!-- Highlight Stats -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;margin-bottom:60px;">
            ${highlights.map(h => `
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;text-align:center;backdrop-filter:blur(10px);">
                <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                <div style="font-size:0.82rem;font-weight:700;color:${theme.text};margin:6px 0 4px;">${esc(h.label)}</div>
                <div style="font-size:0.74rem;color:${theme.textSub};">${esc(h.desc)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Pipeline -->
          <div style="margin-bottom:60px;">
            <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 36px;">
              ${isVideo ? 'Engineering & Quality Pipeline' : 'Craftsmanship Pipeline'}
            </h2>
            <div style="display:flex;align-items:flex-start;justify-content:center;gap:12px;flex-wrap:wrap;">
              ${pipeline.map(([title, desc], i) => `
                <div style="text-align:center;flex:1;min-width:140px;">
                  <div style="width:44px;height:44px;border-radius:50%;background:${theme.pillBg};display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:1.1rem;font-weight:900;color:${theme.primary};">${i + 1}</div>
                  <div style="font-size:0.82rem;font-weight:800;color:${theme.text};margin-bottom:4px;">${title}</div>
                  <div style="font-size:0.76rem;color:${theme.textSub};line-height:1.5;">${desc}</div>
                </div>
                ${i < pipeline.length - 1 ? `<div style="width:40px;height:2px;background:${theme.cardBorder};flex-shrink:0;margin-top:22px;"></div>` : ''}
              `).join('')}
            </div>
          </div>

          <!-- CTA -->
          <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;backdrop-filter:blur(10px);">
            <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 12px;">Ready to Partner?</h2>
            <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 24px;">Contact our B2B team for wholesale pricing, OEM customization, and sample requests.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
              Start a Conversation ↗
            </a>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'contact') {
    const fields = isVideo ? [{ label: 'Welding Process', options: 'MIG|TIG|Stick/MMA|Flux-Core|Multi-Process' }, { label: 'Amperage Range', options: '140A|160A|200A|250A|300A' }, { label: 'Gas Type', options: 'Argon|CO2|Ar/CO2 Mix|Gasless Flux-Core' }] : [{ label: 'Tool Category', options: 'Hand Tools|Power Tools|Measuring|Storage|Custom' }, { label: 'Material Grade', options: 'CrV Steel|CrMo Steel|S2 Steel|Carbide' }, { label: 'Voltage Standard', options: '20V DC|110V AC|220V AC|Dual Voltage' }];
    mainHtml = `
      <main class="tools-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <header style="text-align:center;margin-bottom:50px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.contact)}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 12px;">Start Your B2B Sourcing Inquiry</h1>
            <p style="font-size:1.02rem;color:${theme.textMuted};margin:0;">Submit your requirements and our team will respond within 24 hours with pricing and sample options.</p>
          </header>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:40px;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
              <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Inquiry Form</h2>
              <form style="display:grid;gap:18px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;color:${theme.text};margin-bottom:6px;">Company Name</label>
                    <input type="text" disabled value="${esc(company.name)}" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;color:${theme.text};margin-bottom:6px;">Email</label>
                    <input type="email" disabled value="${esc(company.email)}" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                </div>
                ${fields.map(f => `
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;color:${theme.text};margin-bottom:6px;">${f.label}</label>
                    <select disabled style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.88rem;box-sizing:border-box;">
                      ${f.options.split('|').map(o => `<option>${o}</option>`).join('')}
                    </select>
                  </div>
                `).join('')}
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;color:${theme.text};margin-bottom:6px;">
                    ${esc(ui.product)} (${esc(ui.optional)})
                  </label>
                  <select name="productId" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.88rem;box-sizing:border-box;">
                    <option value="">— Select Product of Interest (Optional) —</option>
                    ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;color:${theme.text};margin-bottom:6px;">Requirements</label>
                  <textarea disabled rows="4" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.88rem;resize:vertical;box-sizing:border-box;" placeholder="Describe your sourcing requirements, target quantity, and timeline..."></textarea>
                </div>
                <button type="submit" disabled style="padding:14px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.96rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Submit Inquiry ↗
                </button>
              </form>
            </div>

            <div>
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:32px;margin-bottom:24px;">
                <h2 style="font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 16px;">${esc(company.name)}</h2>
                <div style="display:grid;gap:14px;font-size:0.88rem;color:${theme.textMuted};">
                  <div>✉ ${esc(company.email)}</div>
                  ${company.phone ? `<div>☎ ${esc(company.phone)}</div>` : ''}
                  ${company.address ? `<div>📍 ${esc(company.address)}</div>` : ''}
                  ${company.whatsapp ? `<div>💬 WhatsApp: ${esc(company.whatsapp)}</div>` : ''}
                </div>
              </div>
              <div style="background:${theme.pillBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;">
                <h3 style="font-size:0.92rem;font-weight:800;color:${theme.primary};margin:0 0 10px;">Why Choose Us?</h3>
                <ul style="margin:0;padding:0 0 0 18px;font-size:0.86rem;color:${theme.textMuted};line-height:1.8;">
                  <li>Experienced export team with global logistics</li>
                  <li>Flexible MOQ for trial orders</li>
                  <li>OEM/ODM customization support</li>
                  <li>Quality assurance & compliance certification</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="tools-footer" style="background:${theme.cardBg};border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;">${esc(brandName)}</div>
            <p style="font-size:0.86rem;color:${theme.textMuted};max-width:380px;line-height:1.6;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'IronSpark Fabrication Lab' : 'PrecisionForge Tool Works'))}
            </p>
          </div>
          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">Navigation</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.home)}</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.catalog)}</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.about)}</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.contact)}</a>
            </div>
          </div>
          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">Business Contact</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.85rem;color:${theme.textMuted};">
              <div>${esc(company.email)}</div>
              ${company.phone ? `<div>${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div>${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>
        <div style="border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;color:${theme.textSub};">
          <div>© ${new Date().getUTCFullYear()} ${esc(brandName)}. All rights reserved.</div>
          <div>Quality Certified · ISO9001</div>
        </div>
      </div>
    </footer>
  `;

  return `
    <div class="tools-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
