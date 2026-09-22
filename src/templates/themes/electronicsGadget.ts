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
    name: 'Bone Conduction Open-Ear Headset',
    desc: 'Premium titanium frame bone conduction sports headphones with open-ear safety, IP67 dust/waterproof, and 10-hour battery.',
    badge: 'Open-Ear Pro',
    category: 'audio',
    categoryNameZh: '',
    categoryNameEn: 'Bone Conduction',
    material: 'Full Titanium Memory Alloy',
    dimensions: '135 × 105 × 45 mm · 29g',
    extra: 'IP67 Waterproof',
    moq: '1000 Units',
    tagline: 'Full Titanium Open-Ear Comfort',
    img: getIndustryPlaceholder('electronics', 5),
  },
  {
    id: 'el-7',
    name: 'Matter Smart Security Camera 2K',
    desc: '2K QHD indoor smart security camera with on-device AI person detection, dual-band WiFi 6, color night vision, and privacy shutter.',
    badge: 'AI Vision',
    category: 'security',
    categoryNameZh: '',
    categoryNameEn: 'Smart Cameras',
    material: 'Sony STARVIS 2 CMOS Sensor',
    dimensions: '70 × 70 × 115 mm',
    extra: 'On-Device AI NPU',
    moq: '500 Units',
    tagline: '2K QHD STARVIS Color Night Vision',
    img: getIndustryPlaceholder('electronics', 6),
  },
  {
    id: 'el-8',
    name: 'MagSafe Qi2 3-in-1 Foldable Stand',
    desc: 'Official Qi2 certified 15W magnetic wireless charging stand for phone, watch, and earbuds. Premium aerospace aluminum folding design.',
    badge: 'Qi2 15W',
    category: 'wireless',
    categoryNameZh: '',
    categoryNameEn: 'Wireless Charging',
    material: '6063 Aerospace Aluminum Alloy',
    dimensions: '140 × 70 × 18 mm (folded)',
    extra: 'Qi2 15W Fast Charge',
    moq: '1000 Units',
    tagline: 'Qi2 15W Magnetic Fast Charge',
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

  const brandName = company.name || (isVideo ? 'NexusIoT Smart Solutions' : 'ApexAudio Consumer Tech');
  const brandTagline = isVideo ? 'Matter & Zigbee Smart Living Electronics' : 'Precision Audio & Mobile Accessories';

  // Light Palettes Only - No dark mode!
  const theme = isVideo
    ? {
      bg: '#f1f5f9',
      cardBg: '#ffffff',
      cardBorder: 'rgba(13,148,136,0.16)',
      primary: '#0d9488',
      primaryHover: '#0f766e',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(241,245,249,0.92)',
      pillBg: '#ccfbf1',
      pillText: '#0f766e',
      btnGradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
      accentGlow: 'rgba(13,148,136,0.2)',
    }
    : {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      cardBorder: 'rgba(37,99,235,0.14)',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(248,250,252,0.92)',
      pillBg: '#eff6ff',
      pillText: '#2563eb',
      btnGradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      accentGlow: 'rgba(37,99,235,0.2)',
    };

  // Distinct Header
  const headerHtml = isVideo ? `
    <header class="electronics-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(13,148,136,0.04);">
      <div style="background:#ccfbf1;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;">
        <div style="display:flex;gap:16px;">
          <span>MATTER 1.3 CERTIFIED</span>
          <span>ZIGBEE 3.0 MESH</span>
          <span>THREAD LOW-POWER</span>
        </div>
        <div>GLOBAL FCC / CE / TELEC COMPLIANT</div>
      </div>
      <div class="wrap" style="height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:36px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.15rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};">${esc(brandName)}</span>
            <span style="font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;color:${theme.primary};font-weight:700;">${esc(brandTagline)}</span>
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 20px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.84rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            IoT Solution RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="electronics-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:74px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:36px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.22rem;font-weight:900;letter-spacing:-0.03em;color:${theme.text};">${esc(brandName)}</span>
            <span style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};font-weight:700;">${esc(brandTagline)}</span>
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Request Spec Sheet ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // SMART LIVING IOT ECOSYSTEM CANVAS WITH VIDEO CONSOLE
      mainHtml = `
        <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;padding:70px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Matter 1.3 Certified · Thread & Zigbee Mesh Topology
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Matter Smart Home Ecosystem: Seamless Local Mesh IoT')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Next-generation smart sensors, lighting controllers, and gateway hubs featuring ultra-low latency, multi-admin pairing, and zero cloud dependency.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore IoT Hardware ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Developer SDK & API
                  </a>
                </div>
                <!-- Ecosystem Specs -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">&lt;10 ms</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Local Automation Latency</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">128 Nodes</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Per Thread Border Router</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">5 Years</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Sensor Battery Autonomy</div>
                  </div>
                </div>
              </div>

              <!-- IoT Hub Display Console -->
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:2px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(13,148,136,0.12);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:contain;padding:24px;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:${theme.glassBg};backdrop-filter:blur(10px);color:${theme.primary};padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;border:1px solid ${theme.cardBorder};">
                    THREAD BORDER ROUTER
                  </div>
                </div>
                <div style="position:absolute;bottom:-18px;left:20px;right:20px;background:#ffffff;border-radius:12px;padding:16px 20px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div>
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Connected Hardware Node</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                  </div>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">Node Specs ↗</a>
                </div>
              </div>
            </div>
          </section>

          <!-- IoT Architecture Matrix -->
          <section style="padding:70px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:44px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Network Architecture</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 0;">Unified Multi-Protocol Topology</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Matter Multi-Admin</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Simultaneous native control from Apple Home, Google Home, Amazon Alexa, and SmartThings without cloud skill bridge.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Self-Healing Mesh</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Thread and Zigbee nodes dynamically re-route signals around physical obstructions for commercial-grade uptime.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">On-Device Cryptography</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Hardware security element (CC EAL6+) for certificate validation, AES-128 encryption, and zero eavesdropping.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Product Catalog -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Connected Hardware Lineup</div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Sensors, Hubs & Controllers</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${theme.primary};">All IoT Devices →</a>
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
                          <span style="font-size:0.8rem;font-weight:800;color:${theme.primary};">Protocol Specs ↗</span>
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
      // MODULAR INDUSTRIAL BENTO GRID HERO LAYOUT
      mainHtml = `
        <main class="electronics-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Bento Box Hero Section -->
          <section style="position:relative;padding:70px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="margin-bottom:30px;">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;">
                  ✦ Precision Industrial Engineering · Bluetooth 5.4 LE Audio
                </div>
                <h1 style="font-size:clamp(2.3rem, 4.5vw, 3.6rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 12px;max-width:820px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Precision Mobile Audio & Wireless Electronics')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0;max-width:640px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with custom 11mm acoustic biocellulose drivers, hybrid -42dB active noise cancellation, and aerospace aluminum unibody construction.')}
                </p>
              </div>

              <!-- Bento Grid Showcase -->
              <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px;">
                <!-- Main Bento Tile -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 12px 36px rgba(37,99,235,0.06);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                    <div>
                      <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Flagship Acoustics</div>
                      <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};margin:4px 0 0;">${esc(heroProduct.name)}</h2>
                    </div>
                    <span style="background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;padding:6px 14px;border-radius:999px;">-42dB ANC</span>
                  </div>
                  <div style="aspect-ratio:1.6;display:flex;align-items:center;justify-content:center;background:#f8fafc;border-radius:18px;margin-bottom:24px;overflow:hidden;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:contain;padding:24px;" fetchpriority="high">
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="font-size:0.85rem;color:${theme.textMuted};"><strong>Material:</strong> ${esc(heroProduct.material)}</div>
                    <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:12px 24px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.88rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">Explore Model ↗</a>
                  </div>
                </div>

                <!-- Right Stacked Bento Tiles -->
                <div style="display:grid;grid-template-rows:1fr 1fr;gap:24px;">
                  <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
                    <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">Acoustic Tuning</div>
                    <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;">11mm Biocellulose Driver</div>
                    <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;">Rigid biocellulose diaphragm delivers studio-accurate bass transients down to 18 Hz with zero harmonic distortion.</p>
                    <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">Frequency Response 18Hz - 40kHz →</div>
                  </div>

                  <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
                    <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">Wireless Power</div>
                    <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;">Qi2 Magnetic 15W Fast Charge</div>
                    <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;">Certified Qi2 magnetic inductive charging with high-grade N52 neodymium magnets and aerospace aluminum casing.</p>
                    <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">EPR 140W USB-PD 3.1 Support →</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 4-Part Bento Spec Matrix -->
          <section style="padding:70px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:40px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Engineering Benchmark</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 0;">Hardware Architecture & Reliability</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">-42dB ANC</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Hybrid Dual Feedforward</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Dual mic cancellation cancels environmental rumble up to 3kHz.</div>
                </div>
                <div style="padding:24px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">48H Battery</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Continuous Playback</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">High-density lithium polymer cells with 10-minute fast charging.</div>
                </div>
                <div style="padding:24px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">IPX7 Rated</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Nanotech Waterproofing</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Full submersion hydrophobic coating on PCB and transducer membranes.</div>
                </div>
                <div style="padding:24px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">38ms Latency</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin-bottom:4px;">Ultra-Low Gaming Codec</div>
                  <div style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;">Synchronized binaural transmission without lip-sync delay.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Modular Product Shelf -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Hardware Catalog</div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Wireless Audio & Smart Gadgets</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${theme.primary};">All Models (RFQ) →</a>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.05;background:${theme.bg};position:relative;overflow:hidden;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:20px;">
                        <span style="position:absolute;top:12px;left:12px;background:${theme.primary};color:#fff;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="padding:20px;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <div style="font-size:0.8rem;color:${theme.textSub};margin-bottom:12px;">${esc(p.material)} · ${esc(p.dimensions)}</div>
                        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid ${theme.cardBorder};">
                          <span style="font-size:0.78rem;font-weight:700;color:${theme.textMuted};">MOQ: ${esc(p.moq)}</span>
                          <span style="font-size:0.8rem;font-weight:800;color:${theme.primary};">Datasheet ↗</span>
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
      <main class="electronics-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.catalog)} · Complete Hardware Lineup
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">
              ${isVideo ? 'Smart IoT & Connected Living Electronics' : 'Consumer Electronics & Precision Audio'}
            </h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Turnkey ODM manufacturing, custom firmware flashing, and global certification compliance.</p>
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
                    <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">Hardware Specs & MOQ ↗</div>
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
      <main class="electronics-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:24px;">
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${theme.primary};">← Back to Catalog</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:30px;position:relative;">
              <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:420px;object-fit:contain;display:block;" fetchpriority="high">
              <div class="wr-detail-thumbs" style="display:flex;gap:12px;margin-top:20px;">
                <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:50px;height:50px;object-fit:cover;">
                </button>
              </div>
            </div>
            <div>
              <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${esc(p.categoryNameEn)} · ${esc(p.badge)}</div>
              <h1 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">${esc(p.name)}</h1>
              <p style="font-size:1.02rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">${esc(p.desc)}</p>
              
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                <h3 style="font-size:0.88rem;font-weight:800;text-transform:uppercase;color:${theme.text};margin:0 0 14px;">Hardware & Protocol Specifications</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.85rem;color:${theme.textMuted};">
                  <div><strong>Chipset / Codec:</strong><br>${esc(p.material)}</div>
                  <div><strong>Form Factor:</strong><br>${esc(p.dimensions)}</div>
                  <div><strong>Compliance:</strong><br>${esc(p.extra)}</div>
                  <div><strong>Production MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                </div>
              </div>

              <div style="display:flex;gap:14px;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                  Request Hardware Sample ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:10px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                  Custom Firmware ODM
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, `${company.name} · Certified Hardware Manufacturing Lab`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2016', num: 2016, label: 'Established', desc: 'Hardware engineering' },
      { value: 'SMT Cleanroom', num: 100, label: 'Production', desc: 'High-speed SMT placement' },
      { value: 'Bluetooth SIG', num: 5, label: 'Certified Member', desc: 'BT 5.4 / Matter ready' },
      { value: '70+ Markets', num: 70, label: 'Export Reach', desc: 'FCC, CE, RoHS verified' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="electronics-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                ${esc(ui.about)} · Engineering Laboratory
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;">
                ${esc(headline)}
              </h1>
              ${storyParagraphs.map(p => `<p style="font-size:1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(0,0,0,0.06);">
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
            <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Collaborate With Our Hardware Engineers</h2>
            <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 20px;">We support rapid turnkey prototyping, custom tooling & injection molds, and full compliance certification testing.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:12px 28px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.9rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
              Initiate Hardware RFQ ↗
            </a>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'contact') {
    mainHtml = `
      <main class="electronics-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <header style="text-align:center;max-width:620px;margin:0 auto 48px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.contact)} · OEM/ODM Engineering Desk
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">Submit Your Hardware Specification</h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory response with BOM costing, tooling lead times, and compliance roadmap within 24 hours.</p>
          </header>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
              <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Request For Quotation</h2>
              <form style="display:grid;gap:16px;">
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Hardware Model / Category</label>
                  <select name="productId" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    <option value="">— Select Hardware SKU (Optional) —</option>
                    ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Annual Volume Target</label>
                    <input type="text" disabled placeholder="e.g. 5,000 Units" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Certification Required</label>
                    <input type="text" disabled placeholder="FCC / CE / RoHS / Telec" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                </div>
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Technical Requirements</label>
                  <textarea disabled rows="4" placeholder="Describe protocol requirements (BT 5.4, Zigbee, Matter), custom tooling needs, or firmware specifications..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                </div>
                <button type="submit" disabled style="padding:14px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 14px ${theme.accentGlow};">
                  Submit Hardware Inquiry ↗
                </button>
              </form>
            </div>

            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 16px;">OEM Factory Engineering Office</h2>
                <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.7;margin:0 0 20px;">
                  Our electronics manufacturing lines feature Yamaha high-speed SMT pick-and-place lines, 3D AOI inspection, in-circuit test fixtures, and certified anechoic acoustic test chambers.
                </p>
                <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.8;">
                  <div><strong>Company:</strong> ${esc(company.name || brandName)}</div>
                  <div><strong>Email:</strong> ${esc(company.email || 'hardware@electronicssourcing.com')}</div>
                  <div><strong>Facility:</strong> ISO 9001 & ISO 14001 Electronics SMT Park</div>
                  <div><strong>Certifications:</strong> Bluetooth SIG, Matter CSA, FCC, CE</div>
                </div>
              </div>
              <div style="padding:16px;background:${theme.bg};border-radius:10px;font-size:0.78rem;color:${theme.textSub};line-height:1.5;margin-top:24px;">
                ⚡ Rapid Turnaround: EVT/DVT hardware functional prototypes ready within 14 business days from Gerber sign-off.
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="electronics-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;color:${theme.textSub};font-size:0.84rem;">
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
          <div style="font-weight:800;color:${theme.text};margin-bottom:12px;text-transform:uppercase;font-size:0.75rem;">Compliance Standards</div>
          <div style="line-height:1.7;">
            <div>✓ FCC & CE Radio Equipment Directive</div>
            <div>✓ RoHS 2.0 & WEEE Environmental</div>
            <div>✓ Bluetooth SIG Qualified Design</div>
          </div>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;align-items:center;justify-content:space-between;font-size:0.78rem;">
        <div>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved. Electronics Export Portal.</div>
        <div style="display:flex;gap:16px;">
          <span>ISO 9001 Certified</span>
          <span>Matter 1.3 Certified</span>
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
