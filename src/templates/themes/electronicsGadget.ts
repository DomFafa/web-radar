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
    name: '140W GaN III Fast Desktop Charger',
    desc: 'Gallium Nitride III architecture delivering 140W PD 3.1 ultra-fast charging across 3 USB-C and 1 USB-A ports with dynamic power allocation.',
    badge: 'GaN III 140W',
    category: 'power',
    categoryNameZh: '',
    categoryNameEn: 'Fast Charging',
    material: 'Gallium Nitride III + 6063 Aluminum Enclosure',
    dimensions: '105 × 75 × 32 mm · 295g',
    extra: 'PD 3.1 & QC 5.0 Protocols',
    moq: '500 Units',
    tagline: '140W PD 3.1 Gallium Nitride',
    img: getIndustryPlaceholder('electronics', 0),
  },
  {
    id: 'el-2',
    name: 'Matter over Thread Smart Home Gateway',
    desc: 'Unified local smart home controller supporting Matter 1.3, Thread border routing, Zigbee 3.0, and sub-15ms local response times.',
    badge: 'Matter 1.3',
    category: 'smart',
    categoryNameZh: '',
    categoryNameEn: 'Smart Living',
    material: 'Polycarbonate + Dual-Band Wi-Fi 6',
    dimensions: '110 × 110 × 26 mm · 180g',
    extra: 'Zero-Cloud Local Mesh Hub',
    moq: '300 Units',
    tagline: 'Matter & Thread Local Mesh Hub',
    img: getIndustryPlaceholder('electronics', 1),
  },
  {
    id: 'el-3',
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
    img: getIndustryPlaceholder('electronics', 2),
  },
  {
    id: 'el-4',
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
    tagline: '1.43 AMOLED 14-Day Battery',
    img: getIndustryPlaceholder('electronics', 3),
  },
  {
    id: 'el-5',
    name: 'Magnetic Wireless Power Bank 10,000mAh',
    desc: 'Qi2 certified 15W magnetic snap-on wireless power bank with 20W USB-C bi-directional fast charging and LED battery display.',
    badge: 'Qi2 Certified',
    category: 'power',
    categoryNameZh: '',
    categoryNameEn: 'Power Banks',
    material: 'Fireproof PC/ABS + N52 Neodymium',
    dimensions: '104 × 68 × 16 mm · 210g',
    extra: '15W Magnetic Fast Charge',
    moq: '1000 Units',
    tagline: 'Qi2 15W Magnetic Snap Power',
    img: getIndustryPlaceholder('electronics', 4),
  },
  {
    id: 'el-6',
    name: '10-in-1 USB4 CNC Aluminum Docking Station',
    desc: '40Gbps USB4 dual 4K/120Hz display dock with 100W PD pass-through, 2.5G Ethernet, SD 4.0, and unibody heat-dissipating CNC aluminum.',
    badge: 'USB4 40Gbps',
    category: 'dock',
    categoryNameZh: '',
    categoryNameEn: 'Hubs & Docks',
    material: 'Unibody 6063 Anodized Aluminum',
    dimensions: '160 × 60 × 20 mm · 240g',
    extra: 'Dual 4K/120Hz DisplayPort',
    moq: '300 Units',
    tagline: '40Gbps Dual 4K Aluminum Dock',
    img: getIndustryPlaceholder('electronics', 5),
  },
  {
    id: 'el-7',
    name: 'Smart Thread Climate & Environmental Sensor',
    desc: 'Ultra-low power Matter over Thread temperature, humidity, and atmospheric pressure sensor with 5-year coin cell battery lifespan.',
    badge: 'Thread Sensor',
    category: 'smart',
    categoryNameZh: '',
    categoryNameEn: 'Smart Living',
    material: 'Matte ABS + Sensirion Micro Sensor',
    dimensions: '42 × 42 × 13 mm · 28g',
    extra: '5-Year CR2450 Battery Life',
    moq: '1000 Units',
    tagline: 'Sub-15ms Thread Local Sensor',
    img: getIndustryPlaceholder('electronics', 6),
  },
  {
    id: 'el-8',
    name: 'Smart Biometric Door Lock with Matter',
    desc: '3D biometric fingerprint scanner with keypad, NFC card entry, and Matter over Thread remote status monitoring and emergency key.',
    badge: 'Matter Security',
    category: 'smart',
    categoryNameZh: '',
    categoryNameEn: 'Smart Security',
    material: 'Zinc Alloy + Tempered Glass Keypad',
    dimensions: '360 × 75 × 25 mm · 3.2kg',
    extra: 'Class-C Anti-Theft Lock Body',
    moq: '200 Units',
    tagline: 'Matter 1.3 Biometric Smart Lock',
    img: getIndustryPlaceholder('electronics', 7),
  },
];

function getElectronicsProducts(ctx: ThemeContext): ThemedElectronicsItem[] {
  const isTyped = isTypedMaterialsSource(ctx.draft);
  if (isTyped) {
    return ctx.draft.products.map((p, i) => {
      const def = ELECTRONICS_DEFAULT_PRODUCTS[i % ELECTRONICS_DEFAULT_PRODUCTS.length]!;
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
      const def = ELECTRONICS_DEFAULT_PRODUCTS[i % ELECTRONICS_DEFAULT_PRODUCTS.length]!;
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

  return ELECTRONICS_DEFAULT_PRODUCTS;
}

export function renderElectronicsPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getElectronicsProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'MatterLink Smart Living Systems' : 'AeroPower CNC Hardware & GaN Labs');
  const brandTagline = isVideo ? 'Matter 1.3 & Thread Mesh Protocols' : 'Unibody CNC Aluminum & GaN III Fast Charge';

  // Light palettes only - strictly no dark mode
  const theme = isVideo
    ? {
      bg: '#faf5ff',
      cardBg: '#ffffff',
      cardBorder: 'rgba(124,58,237,0.16)',
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(250,245,255,0.92)',
      pillBg: '#f3e8ff',
      pillText: '#6d28d9',
      btnGradient: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
      accentGlow: 'rgba(124,58,237,0.22)',
    }
    : {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      cardBorder: 'rgba(15,23,42,0.12)',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(248,250,252,0.92)',
      pillBg: '#e0f2fe',
      pillText: '#0369a1',
      btnGradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
      accentGlow: 'rgba(2,132,199,0.2)',
    };

  // Distinct Header for each variant
  const headerHtml = isVideo ? `
    <header class="electronics-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="background:#f3e8ff;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${theme.primary};"></span>
          <span>THREAD MESH: 32 NODES CONNECTED · LOCAL LATENCY: 12ms</span>
        </div>
        <div>MATTER 1.3 COMPLIANT · APPLE HOME / GOOGLE HOME CERTIFIED</div>
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
            Smart Living RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="electronics-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;">${esc(brandName)}</span>
              <span style="display:inline-block;padding:2px 6px;border-radius:3px;background:#e2e8f0;color:#0f172a;font-size:0.62rem;font-weight:800;font-family:monospace;">6063 CNC</span>
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
            Hardware ODM Desk ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // 1. MATTER 1.3 & THREAD SMART LIVING SCENARIO CONSOLE
      mainHtml = `
        <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Smart Living Scenario Console Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Matter 1.3 Standard · Thread Self-Healing Mesh Topology
                </div>
                <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Seamless Smart Living: Matter 1.3 over Thread Mesh')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Zero-cloud local mesh networking with sub-15ms trigger latency, universal ecosystem compatibility across Apple Home, Google Home, and SmartThings.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Smart Subsystem Index ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Gateway Firmware SDK
                  </a>
                </div>
                <!-- Thread Mesh Telemetry Indicators -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Mesh Latency</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">&lt; 15 ms</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Local Thread network</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Battery Life</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">5 Years</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Single CR2450 cell</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Max Node Count</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">254 Nodes</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Self-healing routing</div>
                  </div>
                </div>
              </div>

              <!-- Interactive Scenario Monitor Console -->
              <div style="position:relative;">
                <div style="border-radius:16px;overflow:hidden;background:${theme.cardBg};border:2px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(124,58,237,0.14);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-family:monospace;font-weight:700;">
                    SCENARIO: ACTIVE LIVING
                  </div>
                  <div style="position:absolute;bottom:16px;right:16px;background:rgba(124,58,237,0.92);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;">
                    MATTER 1.3 CERTIFIED
                  </div>
                </div>
                <div style="margin-top:14px;background:${theme.cardBg};border-radius:10px;padding:12px 18px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;">
                  <span style="font-weight:700;color:${theme.text};">DEVICE: ${esc(heroProduct.name)}</span>
                  <span style="font-weight:800;color:${theme.primary};">${esc(heroProduct.moq)} MOQ</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Matter Ecosystem Topology Breakdown -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Protocol Architecture</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Multi-Ecosystem Local Control
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  One unified protocol standard eliminates cloud outages and enables native voice control across all major platforms.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">01</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Apple HomeKit</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Native Siri voice triggers and Home app automations</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">02</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Google Home</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Seamless Fast Pair and Nest Hub integration</p>
                </div>
                <div style="background:${theme.bg};border:2px solid ${theme.primary};border-radius:12px;padding:22px 16px;text-align:center;box-shadow:0 8px 24px rgba(124,58,237,0.1);">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">03</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.primary};margin:0 0 6px;">Thread Mesh Hub</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Border router bridge uniting IP-based accessories</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">04</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Home Assistant</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Full local telemetry via WebSocket and REST APIs</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Smart Devices Showcase -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Connected Hardware Subsystems</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Smart Living Fleet
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View Full Smart Ecosystem (${products.length}) →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(124,58,237,0.04);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#faf5ff;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
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
      // 2. APPLE-STYLE CNC HARDWARE & GAN BENTO GRID HERO
      mainHtml = `
        <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Apple Bento Grid Canvas Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="max-width:760px;margin-bottom:40px;">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px;">
                  ✦ Unibody 6063 Aluminum · GaN III Semiconductor Architecture
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Precision Engineered Power: 140W PD 3.1 GaN III')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0;max-width:620px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Precision CNC machined from aerospace 6063 aluminum alloy with multi-point graphene thermal dissipation and automated SMT packaging.')}
                </p>
              </div>

              <!-- Bento Grid Architecture -->
              <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:24px;margin-bottom:28px;">
                <!-- Bento Cell 1: Hero Hardware Lead -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;box-shadow:0 16px 40px rgba(15,23,42,0.06);display:grid;grid-template-columns:1.1fr 0.9fr;gap:24px;align-items:center;">
                  <div>
                    <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.04em;">AEROSPACE UNIBODY</span>
                    <h3 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:8px 0 12px;line-height:1.2;">
                      ${esc(heroProduct.name)}
                    </h3>
                    <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin-bottom:20px;">
                      ${esc(heroProduct.desc)}
                    </p>
                    <div style="display:flex;gap:12px;">
                      <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:12px 24px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.85rem;font-weight:800;">
                        Engineering Dossier →
                      </a>
                    </div>
                  </div>
                  <div style="background:#f1f5f9;border-radius:16px;padding:20px;text-align:center;border:1px solid ${theme.cardBorder};">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:220px;object-fit:contain;" fetchpriority="high">
                  </div>
                </div>

                <!-- Bento Cell 2: GaN III Efficiency Telemetry -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 16px 40px rgba(15,23,42,0.04);">
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                      <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Semiconductor Telemetry</span>
                      <span style="font-family:monospace;font-size:0.72rem;background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;">94.5% EFFICIENCY</span>
                    </div>
                    <div style="font-size:3rem;font-weight:900;color:${theme.text};line-height:1;margin-bottom:8px;">140W</div>
                    <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;">Full USB-C Power Delivery 3.1 Extended Power Range (EPR) 28V/5A output.</div>
                  </div>
                  <div style="padding-top:20px;border-top:1px solid ${theme.cardBorder};display:flex;justify-content:space-between;font-size:0.78rem;">
                    <span>Operating Temp: <strong style="color:${theme.primary};">&lt; 48°C</strong></span>
                    <span>SMT Yield: <strong style="color:${theme.text};">99.8%</strong></span>
                  </div>
                </div>
              </div>

              <!-- Bento Lower Row: 3 Modular Specs -->
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">PORT ARCHITECTURE</div>
                  <h4 style="font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 6px;">3C + 1A Dynamic Split</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">Simultaneous high-speed fast charging for 2 laptops and 2 mobile devices.</p>
                </div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">THERMAL DISSIPATION</div>
                  <h4 style="font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 6px;">Graphene Phase Change</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">Internal copper potting and dual graphene sheets for uniform thermal dissipation.</p>
                </div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">GLOBAL COMPLIANCE</div>
                  <h4 style="font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 6px;">UL / CE / FCC / PSE</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">Over-voltage, over-current, short-circuit, and anti-interference protections.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Modular Hardware Grid -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">CNC Hardware Models</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Production Hardware Series
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  Explore Full Hardware Matrix (${products.length}) →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(15,23,42,0.04);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
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
    }
  } else if (page === 'catalog') {
    if (!isVideo) {
      // CNC HARDWARE POWER MATRIX CATALOG
      mainHtml = `
        <main class="electronics-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Aerospace Hardware Matrix · SMT Certified Fleet
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                CNC Aluminum &amp; GaN Hardware Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Power Hardware (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">140W PD 3.1 GaN III</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">USB4 40Gbps Docks</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Qi2 Magnetic Batteries</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Hybrid ANC Audio</span>
              </div>
            </div>

            <!-- Hardware Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(15,23,42,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.1;background:#f8fafc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                      <span style="position:absolute;top:10px;left:10px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-family:monospace;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">6063 CNC</span>
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
                        <span style="color:${theme.textSub};display:block;">Dimensions:</span>
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
    } else {
      // SMART LIVING SUBSYSTEM INDEX CATALOG
      mainHtml = `
        <main class="electronics-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:24px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Matter over Thread Ecosystem · Protocol Devices
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                Smart Living Subsystem Index
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Smart Subsystems (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Border Gateways</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Climate Sensors</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Biometric Locks</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Wearable Health</span>
              </div>
            </div>

            <!-- Smart Hardware Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(124,58,237,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.1;background:#faf5ff;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                      <span style="position:absolute;top:10px;left:10px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-family:monospace;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">MATTER 1.3</span>
                    </div>
                  </a>
                  <div style="padding:20px;">
                    <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};margin:0 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;font-size:0.75rem;margin-bottom:14px;">
                      <div>
                        <span style="color:${theme.textSub};display:block;">Protocol/Mesh:</span>
                        <strong style="color:${theme.text};">${esc(p.material)}</strong>
                      </div>
                      <div>
                        <span style="color:${theme.textSub};display:block;">Dimensions:</span>
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
      // CNC HARDWARE DETAIL: MULTI-PORT POWER SPLIT TABLE + 180-MESH SANDBLAST GALLERY
      mainHtml = `
        <main class="electronics-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to CNC Hardware Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Hardware Macro Inspection & Gallery -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;position:relative;box-shadow:0 12px 32px rgba(15,23,42,0.06);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    180-MESH SANDBLAST
                  </div>
                  <!-- Thumbnails -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Hardware Performance Metrics -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">94.5%</div>
                    <div style="color:${theme.textSub};">GaN III Efficiency</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">&lt; 48°C</div>
                    <div style="color:${theme.textSub};">Full Load Temp</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">OEM MOQ</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Engineering Specs & Multi-Port Power Split -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Commercial Hardware
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Hardware Engineering Spec Grid -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;margin-bottom:24px;">
                  <h3 style="font-size:0.9rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Hardware Engineering Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Enclosure &amp; Silicon</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Dimensions &amp; Weight</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Fast Charging Protocols</span>
                      <strong style="color:${theme.primary};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Production MOQ</span>
                      <strong style="color:${theme.text};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- Dynamic Multi-Port Power Split Table -->
                <div style="background:#f1f5f9;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:0 0 10px;">Dynamic Power Distribution Split Matrix</h4>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:0.8rem;text-align:center;">
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Single Port</div>
                      <strong style="color:${theme.primary};font-size:0.95rem;">USB-C1: 140W</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Dual Port</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">100W + 40W</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Triple Port</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">65W + 45W + 22.5W</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Request Hardware CAD &amp; RFQ ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    View All Hardware
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // SMART LIVING DETAIL: MATTER TOPOLOGY + REST/MQTT API GUIDE
      mainHtml = `
        <main class="electronics-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Smart Subsystem Index
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Smart Device Portrait & Gallery -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;position:relative;box-shadow:0 12px 32px rgba(124,58,237,0.06);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    THREAD 1.3 NODE
                  </div>
                  <!-- Thumbnails -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Local Mesh Telemetry Stats -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">12 ms</div>
                    <div style="color:${theme.textSub};">Local Latency</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">100 m</div>
                    <div style="color:${theme.textSub};">Thread Range</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">System MOQ</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Ecosystem Specs & White-Label Integration -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Matter over Thread Ecosystem
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Hardware Engineering Spec Grid -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;margin-bottom:24px;">
                  <h3 style="font-size:0.9rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Smart Device Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Wireless Protocol</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Dimensions &amp; Enclosure</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Ecosystem Features</span>
                      <strong style="color:${theme.primary};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Production MOQ</span>
                      <strong style="color:${theme.text};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- White-Label App & REST/MQTT Integration -->
                <div style="background:#faf5ff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:0 0 10px;">White-Label App &amp; Gateway Firmware Architecture</h4>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:0.8rem;text-align:center;">
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Commissioning</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">BLE &amp; QR Code</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Local Control</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">REST / MQTT API</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">OTA Updates</div>
                      <strong style="color:${theme.primary};font-size:0.95rem;">Encrypted Dual-Bank</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Inquire Smart Living OEM ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Explore All Subsystems
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? 'IoT Wireless Protocol Testing & Anechoic Chamber Lab' : 'Robotic SMT Surface Mount & 3D AOI Inspection Lines');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || (isVideo ? 'Aether Living leads connected hardware architecture, standardizing on Matter 1.3 over Thread mesh topologies for zero-cloud latency and local security.' : 'VoltCraft operates 8 high-speed surface mount technology (SMT) lines capable of mounting 01005 passives and ultra-fine pitch BGA ICs with sub-10 micron placement repeatability.'));
    const images = getAboutImages(ctx);
    const highlights = parseAboutHighlights(company.aboutHighlights, isVideo ? [
      { value: 'Matter 1.3', label: 'Protocol Certified', desc: 'Cross-platform native ecosystem interoperability' },
      { value: '< 15 ms', label: 'Local Mesh Latency', desc: 'Zero-cloud Thread RF response benchmark' },
      { value: '254 Nodes', label: 'Self-Healing Capacity', desc: 'Enterprise smart installation scaling' },
    ] : [
      { value: '94.5%', label: 'GaN III Efficiency', desc: 'Semiconductor power conversion benchmark' },
      { value: '6063 CNC', label: 'Unibody Aluminum', desc: 'Aerospace grade precision machined enclosures' },
      { value: '72 Hours', label: 'Burn-In Aging Test', desc: '100% full load thermal validation' },
    ]);
    const primaryImage = images.primary || (isVideo ? getIndustryPlaceholder('electronics', 1) : getIndustryPlaceholder('electronics', 0));

    if (!isVideo) {
      // CNC HARDWARE SMT & AOI ABOUT
      mainHtml = `
        <main class="electronics-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Manufacturing Precision &amp; Engineering Quality
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(15,23,42,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">Our facility houses automated high-speed Surface Mount Technology (SMT) lines equipped with 3D solder paste inspection (SPI) and 3D automated optical inspection (AOI) to guarantee zero cold-solder defects on high-density GaN PCB assemblies.</p>
                    <p style="margin:0 0 18px;">Every production batch undergoes 72 hours of continuous full-load burn-in testing in environmental chambers cycling between -20°C and 70°C, ensuring mission-critical reliability for tier-one global consumer brands.</p>
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
      // SMART LIVING PROTOCOL LAB ABOUT
      mainHtml = `
        <main class="electronics-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                IoT Wireless Protocols &amp; RF Verification
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(124,58,237,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">Our specialized IoT laboratory operates 3-meter semi-anechoic chambers for electromagnetic compatibility (EMC) testing and Thread radio-frequency (RF) calibration across 2.4GHz IEEE 802.15.4 channels.</p>
                    <p style="margin:0 0 18px;">We offer end-to-end turnkey firmware customization, assisting partners in obtaining official Connectivity Standards Alliance (CSA) Matter certifications and Apple HomeKit MFi pre-audits.</p>
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
      // CNC HARDWARE ODM & RFQ PORTAL
      mainHtml = `
        <main class="electronics-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Hardware ODM &amp; Custom Anodization Portal
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Submit Hardware RFQ &amp; CAD Request
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Request STEP/IGES 3D models, custom Pantone anodized aluminum samples, laser logo engraving, and certified packaging designs.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(15,23,42,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Hardware Engineer / Buyer</label>
                    <input type="text" name="name" required placeholder="Senior Hardware Program Manager" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email Address</label>
                    <input type="email" name="email" required placeholder="engineering@client-hardware.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Hardware Product</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Hardware ODM Inquiries (All Models)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Enclosure Surface Finish</label>
                    <select name="finish" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Space Grey 180-Mesh Anodized</option>
                      <option>Silver Frost Ceramic Sandblast</option>
                      <option>Matte Stealth Black Anodized</option>
                      <option>Custom Pantone Anodized Color</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Regional Certification</label>
                    <select name="compliance" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>North America (UL / FCC / DOE VI)</option>
                      <option>European Union (CE / RoHS / REACH)</option>
                      <option>Japan / Korea (PSE / KC)</option>
                      <option>Global Universal Safety Bundle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Technical Requirements &amp; Target Launch Timeline</label>
                  <textarea name="message" rows="4" placeholder="Specify custom port split wattage requirements, thermal limits, or tooling timeline..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Submit Hardware ODM Technical Request ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      // SMART LIVING OEM & GATEWAY FIRMWARE DESK
      mainHtml = `
        <main class="electronics-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Matter 1.3 OEM &amp; Firmware Gateway Desk
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Inquire Smart Living OEM Ecosystem
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Connect with our IoT system architects regarding Matter commissioning QR codes, custom iOS/Android companion app shells, and volume hardware pricing.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(124,58,237,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">System Architect / Buyer</label>
                    <input type="text" name="name" required placeholder="Smart Home Platform Director" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" required placeholder="iot@smartliving-enterprise.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Smart Subsystem</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Smart Living Ecosystem Inquiries</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Estimated Deployment Scale</label>
                    <select name="volume" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Developer Sample Kit (10 - 50 Units)</option>
                      <option>Pilot Installation (500 - 2,000 Units)</option>
                      <option>Volume Commercial Rollout (5,000+ Units)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Software Integration Level</label>
                    <select name="integration" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Standard Matter Direct Commissioning</option>
                      <option>Custom White-Label iOS & Android App</option>
                      <option>Open REST / WebSocket API Gateway</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Project Specifications &amp; RF Frequency Customization</label>
                  <textarea name="message" rows="4" placeholder="Detail your target smart ecosystem requirements, custom cloud integration, or Thread routing topology..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Submit Smart Living OEM Inquiry ↗
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
            Matter over Thread smart living hardware and gateway systems. Local mesh networking, sub-15ms trigger latency, and zero-cloud dependency.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#a855f7;font-size:0.7rem;font-weight:700;">MATTER 1.3</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#a855f7;font-size:0.7rem;font-weight:700;">THREAD MESH</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#a855f7;font-size:0.7rem;font-weight:700;">APPLE HOME</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Supported Ecosystems</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>Apple HomeKit (Siri Voice)</li>
            <li>Google Home & Nest Ecosystem</li>
            <li>Samsung SmartThings Hub</li>
            <li>Home Assistant Local API</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">OEM Procurement</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'iot-oem@matterlink.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#a855f7;text-decoration:none;font-weight:700;font-size:0.82rem;">Direct Sourcing Terminal →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Matter &amp; Thread Smart Living Protocol Division</span>
      </div>
    </footer>
  ` : `
    <footer style="background:#0f172a;color:#f8fafc;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid rgba(255,255,255,0.08);">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#fff;margin-bottom:8px;">${esc(brandName)}</div>
          <p style="color:#94a3b8;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Aerospace unibody 6063 aluminum hardware and Gallium Nitride III power electronics. High-speed automated SMT lines and 100% burn-in validation.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">GAN III</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">PD 3.1 140W</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#38bdf8;font-size:0.7rem;font-weight:700;">6063 CNC</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Engineering Standards</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>GaN III 94.5% Power Conversion</li>
            <li>180-Mesh Sandblasted Anodizing</li>
            <li>72-Hour Full-Load Thermal Burn-In</li>
            <li>Dynamic C1+C2 Multi-Port Split</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Hardware ODM Inquiries</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'odm@aeropower-hardware.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#38bdf8;text-decoration:none;font-weight:700;font-size:0.82rem;">Submit Technical CAD Inquiry →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Precision CNC Hardware &amp; Gallium Nitride Engineering Division</span>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
