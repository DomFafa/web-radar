import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { getIndustryPlaceholder } from './industryPlaceholders';

export interface ThemedElectronicsItem {
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

export const ELECTRONICS_DEFAULT_PRODUCTS: ThemedElectronicsItem[] = [
  {
    id: 'el-1',
    name: 'Hybrid ANC True Wireless Earbuds',
    desc: 'Adaptive hybrid active noise cancellation with -42dB reduction, custom 11mm dynamic drivers, and Bluetooth 5.4 multipoint.',
    badge: 'ANC Pro',
    category: 'audio',
    categoryNameZh: '',
    categoryNameEn: 'Wireless Audio',
    material: 'Hi-Res Audio Codec + BT 5.4',
    dimensions: '24 × 20 × 22 mm · 5.2g each',
    extra: '-42dB Hybrid ANC',
    moq: '1000 Units',
    tagline: 'Hybrid ANC -42dB Adaptive',
    img: getIndustryPlaceholder('electronics', 0),
  },
  {
    id: 'el-2',
    name: 'AMOLED Smart Health Watch',
    desc: '1.43-inch AMOLED always-on display with blood oxygen, ECG, and sleep tracking. IP68 waterproof with 14-day battery.',
    badge: 'Health Monitor',
    category: 'wearable',
    categoryNameZh: '',
    categoryNameEn: 'Smart Wearables',
    material: 'Titanium Alloy + Sapphire Crystal',
    dimensions: '47 × 47 × 11.8 mm',
    extra: 'SpO2 + ECG + HRV',
    moq: '500 Units',
    tagline: 'AMOLED Always-On Health Tracking',
    img: getIndustryPlaceholder('electronics', 1),
  },
  {
    id: 'el-3',
    name: 'GaN 140W 4-Port Fast Charger',
    desc: 'Gallium nitride 140W USB-PD 3.1 charger with 4 ports (2C+2A), foldable prongs, and intelligent power distribution.',
    badge: 'GaN Power',
    category: 'charger',
    categoryNameZh: '',
    categoryNameEn: 'GaN Chargers',
    material: 'GaN FET Technology',
    dimensions: '72 × 72 × 34 mm · 192g',
    extra: 'PD 3.1 EPR 140W',
    moq: '2000 Units',
    tagline: 'GaN 140W PD 3.1 EPR',
    img: getIndustryPlaceholder('electronics', 2),
  },
  {
    id: 'el-4',
    name: 'Tunable CCT Smart LED Panel',
    desc: 'WiFi and Bluetooth mesh smart panel light with 2700K-6500K tunable color temperature, CRI 97+, and circadian rhythm modes.',
    badge: 'Smart Light',
    category: 'lighting',
    categoryNameZh: '',
    categoryNameEn: 'Smart Lighting',
    material: 'Samsung LM301H LEDs',
    dimensions: '600 × 600 × 10 mm · 40W',
    extra: 'CRI 97+ Tunable CCT',
    moq: '300 Units',
    tagline: 'CRI 97+ Circadian Lighting',
    img: getIndustryPlaceholder('electronics', 3),
  },
  {
    id: 'el-5',
    name: 'LiFePO4 Portable Power Station',
    desc: '1024Wh lithium iron phosphate battery with 2000W pure sine wave inverter, MPPT solar input, and UPS function.',
    badge: 'Off-Grid Power',
    category: 'power',
    categoryNameZh: '',
    categoryNameEn: 'Power Stations',
    material: 'LiFePO4 3500+ Cycles',
    dimensions: '340 × 262 × 226 mm · 12.5kg',
    extra: '2000W Pure Sine Wave',
    moq: '100 Units',
    tagline: 'LiFePO4 3500-Cycle Capacity',
    img: getIndustryPlaceholder('electronics', 4),
  },
  {
    id: 'el-6',
    name: 'Qi2 MagSafe Battery Pack 10000mAh',
    desc: '10000mAh magnetic wireless battery with Qi2 15W and USB-C PD 27W fast charging, airline-safe lithium polymer.',
    badge: 'MagSafe Pro',
    category: 'accessory',
    categoryNameZh: '',
    categoryNameEn: 'Mobile Accessories',
    material: 'Lithium Polymer + N52 Magnets',
    dimensions: '96 × 70 × 16 mm · 218g',
    extra: 'Qi2 15W + PD 27W',
    moq: '2000 Units',
    tagline: 'Qi2 Magnetic Fast Charge',
    img: getIndustryPlaceholder('electronics', 5),
  },
  {
    id: 'el-7',
    name: '15.6" Portable USB-C OLED Monitor',
    desc: 'Ultra-slim portable OLED display with 100% DCI-P3, USB-C single-cable connection, HDR10, and built-in speakers.',
    badge: 'OLED Display',
    category: 'display',
    categoryNameZh: '',
    categoryNameEn: 'Portable Monitors',
    material: 'OLED Panel, Aluminum Alloy',
    dimensions: '357 × 225 × 5.2 mm · 650g',
    extra: '100% DCI-P3 HDR10',
    moq: '200 Units',
    tagline: '100% DCI-P3 OLED Portable',
    img: getIndustryPlaceholder('electronics', 6),
  },
  {
    id: 'el-8',
    name: 'Hot-Swap Gasket Mechanical Keyboard',
    desc: 'Gasket-mounted hot-swappable mechanical keyboard with south-facing RGB, PBT keycaps, and tri-mode connectivity.',
    badge: 'Custom Mech',
    category: 'gaming',
    categoryNameZh: '',
    categoryNameEn: 'Mechanical Keyboards',
    material: 'Aluminum CNC Case + PBT Keycaps',
    dimensions: '325 × 145 × 42 mm · 1.2kg',
    extra: 'Gasket + Hot-Swap',
    moq: '500 Units',
    tagline: 'Gasket-Mount Hot-Swap RGB',
    img: getIndustryPlaceholder('electronics', 7),
  }
];

export function getElectronicsProducts(ctx: ThemeContext): ThemedElectronicsItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'electronics',
      categoryNameZh: '',
      categoryNameEn: 'Wireless Audio',
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
      const fallback = ELECTRONICS_DEFAULT_PRODUCTS[idx % ELECTRONICS_DEFAULT_PRODUCTS.length]!;
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
  return ELECTRONICS_DEFAULT_PRODUCTS;
}

export function renderElectronicsPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getElectronicsProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'NeonPulse Smart Device Lab' : 'TechForge Electronics Lab');
  const brandTagline = isVideo ? 'Next-Gen Smart Device Innovation' : 'Consumer Electronics & Smart Devices';

  const theme = isVideo
    ? {
      bg: '#09090b', cardBg: '#18181b', cardBorder: 'rgba(99,102,241,0.25)',
      primary: '#6366f1', primaryHover: '#4f46e5', text: '#fafafa', textMuted: '#a1a1aa', textSub: '#71717a',
      glassBg: 'rgba(9,9,11,0.92)', pillBg: 'rgba(99,102,241,0.15)', pillText: '#818cf8',
      btnGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', accentGlow: 'rgba(99,102,241,0.30)',
    }
    : {
      bg: '#18181b', cardBg: '#27272a', cardBorder: 'rgba(59,130,246,0.20)',
      primary: '#3b82f6', primaryHover: '#2563eb', text: '#f4f4f5', textMuted: '#a1a1aa', textSub: '#71717a',
      glassBg: 'rgba(24,24,27,0.92)', pillBg: 'rgba(59,130,246,0.15)', pillText: '#60a5fa',
      btnGradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', accentGlow: 'rgba(59,130,246,0.25)',
    };

  const headerHtml = `
    <header class="electronics-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.04);">
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
        <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Smart Device Lab
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Next-Generation Smart Device Technology')}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:620px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Cutting-edge IoT, AI-powered wearables, and USB-PD 3.1 power delivery systems.')}
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
                  ${[['FCC', 'Certified'], ['99.8%', 'QC Pass Rate'], ['RoHS', 'Compliant']].map(([v, l]) => `
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
        <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Hero Banner -->
          <section style="position:relative;overflow:hidden;padding:100px 0 80px;">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Precision Tech Showcase
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.6rem);font-weight:900;line-height:1.1;color:${theme.text};letter-spacing:-0.03em;margin:0 0 20px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Precision Engineered Consumer Electronics')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'From GaN fast-charging to hybrid ANC audio, engineered for the connected lifestyle.')}
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
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">FCC</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Certified</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">US market compliance</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">99.8%</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">QC Pass Rate</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">Automated AOI testing</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">RoHS</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Compliant</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">Lead-free manufacturing</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">ISO</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">14001 EMS</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">Environmental management</div>
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
      <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
      <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
    const headline = getAboutHeadline(company, `${company.name} · Precision Engineering`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2018', num: parseInt(company.establishedYear || '2018', 10), label: 'Established', desc: 'US market compliance' },
      { value: 'FCC', num: 100, label: 'Certified', desc: 'US market compliance' },
      { value: '99.8%', num: 99, label: 'QC Pass Rate', desc: 'Automated AOI testing' },
      { value: 'ISO', num: 100, label: '14001 EMS', desc: 'Environmental management' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');
    const pipeline = isVideo ? [['AI/ML Training', 'On-device machine learning model optimization'], ['PCB Design', 'Multi-layer HDI PCB with impedance control'], ['EMC Testing', 'Electromagnetic compatibility chamber testing'], ['Thermal Analysis', 'CFD simulation and thermal management validation'], ['OTA Update', 'Over-the-air firmware update infrastructure']] : [['IC Design', 'Custom ASIC and firmware development'], ['SMT Assembly', 'Automated surface-mount placement and reflow'], ['QC & Testing', 'Automated optical and functional test stations'], ['Firmware Flash', 'Production firmware programming and calibration'], ['Certification', 'FCC/CE/UL/RoHS compliance testing']];
    mainHtml = `
      <main class="electronics-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
    const fields = isVideo ? [{ label: 'Smart Platform', options: 'Matter/Thread|Alexa|Google Home|HomeKit|Custom' }, { label: 'Battery Chemistry', options: 'Li-Po|LiFePO4|Li-Ion|Supercapacitor' }, { label: 'OEM/ODM Scope', options: 'Full Turnkey|Semi-CKD|Design Only|Certification Only' }] : [{ label: 'Product Type', options: 'Audio|Wearable|Charger|Lighting|Power|Accessory' }, { label: 'Certification', options: 'FCC|CE|UL|MFi|Qi|All' }, { label: 'Connectivity', options: 'Bluetooth|WiFi|USB-C|Lightning|Combo' }];
    mainHtml = `
      <main class="electronics-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
    <footer class="electronics-footer" style="background:${theme.cardBg};border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;">${esc(brandName)}</div>
            <p style="font-size:0.86rem;color:${theme.textMuted};max-width:380px;line-height:1.6;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'NeonPulse Smart Device Lab' : 'TechForge Electronics Lab'))}
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
    <div class="electronics-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
