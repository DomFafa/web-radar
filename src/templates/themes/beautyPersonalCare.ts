import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { getIndustryPlaceholder } from './industryPlaceholders';

export interface ThemedBeautyItem {
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

export const BEAUTY_DEFAULT_PRODUCTS: ThemedBeautyItem[] = [
  {
    id: 'bt-1',
    name: 'Hyaluronic Acid Triple-Weight Serum',
    desc: 'Three molecular weights of hyaluronic acid (high, medium, low) for multi-layer hydration penetrating from epidermis to dermis.',
    badge: 'Clinical Hydration',
    category: 'serum',
    categoryNameZh: '',
    categoryNameEn: 'Active Serums',
    material: 'HA Triple-Weight Complex',
    dimensions: '30ml Dropper Bottle',
    extra: 'Dermatologist Tested',
    moq: '1000 Units',
    tagline: 'Triple-Layer Molecular Hydration',
    img: getIndustryPlaceholder('beauty', 0),
  },
  {
    id: 'bt-2',
    name: 'Ceramide Barrier Repair Night Cream',
    desc: 'Bio-identical ceramide NP/AP/EOS complex with cholesterol and fatty acids to restore the skin lipid barrier overnight.',
    badge: 'Barrier Repair',
    category: 'cream',
    categoryNameZh: '',
    categoryNameEn: 'Moisturizers',
    material: 'Ceramide NP + Cholesterol Complex',
    dimensions: '50ml Airless Pump',
    extra: 'Non-Comedogenic',
    moq: '800 Units',
    tagline: 'Lipid-Barrier Night Restoration',
    img: getIndustryPlaceholder('beauty', 1),
  },
  {
    id: 'bt-3',
    name: '7-Wavelength LED Phototherapy Mask',
    desc: 'Medical-grade silicone LED face mask with 7 clinically validated wavelengths for anti-aging, acne, pigmentation, and skin rejuvenation.',
    badge: 'Medical LED',
    category: 'device',
    categoryNameZh: '',
    categoryNameEn: 'Beauty Devices',
    material: 'Medical Silicone, 120 Optical LEDs',
    dimensions: '280 × 200 × 5 mm · 340g',
    extra: 'FDA Cleared Class II',
    moq: '200 Units',
    tagline: 'Clinical Phototherapy at Home',
    img: getIndustryPlaceholder('beauty', 2),
  },
  {
    id: 'bt-4',
    name: 'Centella Asiatica Soothing Toner',
    desc: '92% organic Centella Asiatica extract with madecassoside and panthenol to calm redness, inflammation, and sensitive skin.',
    badge: 'Calming Cica',
    category: 'toner',
    categoryNameZh: '',
    categoryNameEn: 'Essence & Toners',
    material: '92% Centella Asiatica Extract',
    dimensions: '200ml Frosted Bottle',
    extra: 'pH 5.5 Balanced',
    moq: '1500 Units',
    tagline: 'Pure Botanical Cica Calming',
    img: getIndustryPlaceholder('beauty', 3),
  },
  {
    id: 'bt-5',
    name: 'RF Multi-Polar Skin Tightening Device',
    desc: 'Bipolar radiofrequency with EMS microcurrent, red light therapy (630nm), and thermal collagen stimulation for visible facial contouring.',
    badge: 'Pro RF Device',
    category: 'device',
    categoryNameZh: '',
    categoryNameEn: 'Beauty Devices',
    material: 'Titanium Probe, Medical ABS',
    dimensions: '185 × 52 × 48 mm · 210g',
    extra: '1MHz Multi-Polar RF',
    moq: '300 Units',
    tagline: 'Bipolar RF Collagen Tightening',
    img: getIndustryPlaceholder('beauty', 4),
  },
  {
    id: 'bt-6',
    name: 'Vitamin C 20% + Ferulic Acid Glow Drops',
    desc: 'L-ascorbic acid 20% stabilized with 1% ferulic acid and pure vitamin E in an amber dropper bottle to prevent photolysis oxidation.',
    badge: 'Potent Glow',
    category: 'serum',
    categoryNameZh: '',
    categoryNameEn: 'Active Serums',
    material: '20% Pure L-Ascorbic Acid + 1% Ferulic',
    dimensions: '30ml UV Amber Bottle',
    extra: 'Antioxidant Shield',
    moq: '1000 Units',
    tagline: 'High-Potency Ferulic Antioxidant',
    img: getIndustryPlaceholder('beauty', 5),
  },
  {
    id: 'bt-7',
    name: 'Sonic Cleansing & Infusion Wand',
    desc: 'Ultra-soft hygienic silicone sonic facial brush with 12,000 vibrations/min and thermal heat plate for deep pore unclogging.',
    badge: 'Sonic Clean',
    category: 'device',
    categoryNameZh: '',
    categoryNameEn: 'Beauty Devices',
    material: 'Food-Grade Antibacterial Silicone',
    dimensions: '140 × 45 × 30 mm · 125g',
    extra: 'IPX7 Waterproof',
    moq: '500 Units',
    tagline: '12,000 VPM Sonic Deep Cleansing',
    img: getIndustryPlaceholder('beauty', 6),
  },
  {
    id: 'bt-8',
    name: 'Green Tea + Bakuchiol Anti-Aging Oil',
    desc: 'Natural retinol alternative bakuchiol 2% blended with cold-pressed camellia sinensis seed oil and squalane for cell renewal.',
    badge: 'Phyto Retinol',
    category: 'oil',
    categoryNameZh: '',
    categoryNameEn: 'Facial Oils',
    material: 'Organic Cold-Pressed Camellia Seed Oil',
    dimensions: '30ml Glass Bottle',
    extra: 'Pregnancy-Safe Retinol Alt',
    moq: '1200 Units',
    tagline: 'Natural Phyto-Retinol Cell Renewal',
    img: getIndustryPlaceholder('beauty', 7),
  },
];

function getBeautyProducts(ctx: ThemeContext): ThemedBeautyItem[] {
  const isTyped = isTypedMaterialsSource(ctx.draft);
  if (isTyped) {
    return ctx.draft.products.map((p, i) => {
      const def = BEAUTY_DEFAULT_PRODUCTS[i % BEAUTY_DEFAULT_PRODUCTS.length]!;
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
      const def = BEAUTY_DEFAULT_PRODUCTS[i % BEAUTY_DEFAULT_PRODUCTS.length]!;
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

  return BEAUTY_DEFAULT_PRODUCTS;
}

export function renderBeautyPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getBeautyProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'BioGlow Clinical Phototherapy Lab' : 'PureBotanica Bio-Active Skincare');
  const brandTagline = isVideo ? 'Medical Aesthetic LED & RF Technologies' : 'Certified Organic Bio-Active Actives';

  // Light palettes only - strictly no dark mode
  const theme = isVideo
    ? {
      bg: '#fff1f2',
      cardBg: '#ffffff',
      cardBorder: 'rgba(225,29,72,0.16)',
      primary: '#e11d48',
      primaryHover: '#be123c',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(255,241,242,0.92)',
      pillBg: '#ffe4e6',
      pillText: '#be123c',
      btnGradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
      accentGlow: 'rgba(225,29,72,0.22)',
    }
    : {
      bg: '#fafaf9',
      cardBg: '#ffffff',
      cardBorder: 'rgba(4,120,87,0.14)',
      primary: '#047857',
      primaryHover: '#065f46',
      text: '#1c1917',
      textMuted: '#57534e',
      textSub: '#78716c',
      glassBg: 'rgba(250,250,249,0.92)',
      pillBg: '#ecfdf5',
      pillText: '#047857',
      btnGradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
      accentGlow: 'rgba(4,120,87,0.2)',
    };

  // Distinct Header for each variant
  const headerHtml = isVideo ? `
    <header class="beauty-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="background:#ffe4e6;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${theme.primary};"></span>
          <span>CLINICAL AESTHETIC SPECTRUM: 415nm / 590nm / 630nm / 830nm NEAR-IR</span>
        </div>
        <div>ISO 13485 MEDICAL CLEANROOM CERTIFIED</div>
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
            Device OEM RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="beauty-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.01em;">${esc(brandName)}</span>
            <span style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};font-weight:700;">${esc(brandTagline)}</span>
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Formulation Desk ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // 1. CLINICAL PHOTOTHERAPY & RF DEVICE COMMAND CENTER
      mainHtml = `
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Clinical Device Command Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  ✦ Medical Aesthetic Devices · Multi-Polar RF &amp; LED Dermal Fusion
                </div>
                <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Clinical Phototherapy & Radiofrequency Aesthetic Technologies')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with titanium medical probes, 4MHz radiofrequency waveforms, and calibrated multi-wavelength LEDs for deep dermal collagen remodeling.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Aesthetic Modality Deck ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Request Clinical Whitepaper
                  </a>
                </div>
                <!-- Clinical Trial Benchmarks -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Collagen Boost</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">+42.8%</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">28-day clinical trial</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">Wrinkle Depth</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">-31.4%</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Periorbital analysis</div>
                  </div>
                  <div style="background:${theme.cardBg};padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <div style="font-size:0.7rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">RF Frequency</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">4.0 MHz</div>
                    <div style="font-size:0.7rem;color:${theme.textMuted};">Multi-polar titanium</div>
                  </div>
                </div>
              </div>

              <!-- Realtime Clinical Monitor Console -->
              <div style="position:relative;">
                <div style="border-radius:16px;overflow:hidden;background:${theme.cardBg};border:2px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(225,29,72,0.14);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-family:monospace;font-weight:700;">
                    LIVE DERMAL MONITOR: 42.0°C
                  </div>
                  <div style="position:absolute;bottom:16px;right:16px;background:rgba(225,29,72,0.92);color:#fff;padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;">
                    CLASS II MEDICAL CE
                  </div>
                </div>
                <div style="margin-top:14px;background:${theme.cardBg};border-radius:10px;padding:12px 18px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;">
                  <span style="font-weight:700;color:${theme.text};">DEVICE: ${esc(heroProduct.name)}</span>
                  <span style="font-weight:800;color:${theme.primary};">${esc(heroProduct.moq)} MOQ</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 4-Wavelength Spectrum Bar -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Calibrated Bio-Photonic Spectrum</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Targeted Wavelength Dermal Penetration
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Four precise optical wavelengths penetrate from the outer stratum corneum down to the subcutaneous tissue layers.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.5rem;font-weight:900;color:#2563eb;margin-bottom:6px;">415 nm</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Blue Spectrum</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Epidermal acne sterilization &amp; sebum balance</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.5rem;font-weight:900;color:#d97706;margin-bottom:6px;">590 nm</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Amber Spectrum</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Cellular turnover, redness &amp; lymphatic drainage</p>
                </div>
                <div style="background:${theme.bg};border:2px solid ${theme.primary};border-radius:12px;padding:22px 16px;text-align:center;box-shadow:0 8px 24px rgba(225,29,72,0.1);">
                  <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">630 nm</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.primary};margin:0 0 6px;">Deep Red Spectrum</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Fibroblast activation &amp; deep collagen synthesis</p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:22px 16px;text-align:center;">
                  <div style="font-size:1.5rem;font-weight:900;color:#9333ea;margin-bottom:6px;">830 nm</div>
                  <h4 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 6px;">Near-Infrared</h4>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;">Subcutaneous wound healing &amp; micro-circulation</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Aesthetic Devices Showcase -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Clinical Modality Range</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Aesthetic Hardware Portfolio
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View Full Device Deck (${products.length}) →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(225,29,72,0.04);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#fff5f5;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
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
      // 2. BOTANICAL BIO-ACTIVE EDITORIAL SPREAD HERO
      mainHtml = `
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Editorial Botanical Spread Hero -->
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  [ ECOCERT ORGANIC · SUPERCRITICAL CO₂ EXTRACTION ]
                </div>
                <h1 style="font-family:Georgia,serif;font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.16;color:${theme.text};letter-spacing:-0.02em;margin:0 0 18px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Pure Botanical Bio-Actives: Clean Skincare Science')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.75;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Sustainably farmed botanical extracts, cold-pressed seed lipids, and high-potency bio-ferments formulated to restore the skin barrier without synthetic compromise.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Botanical Archive ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 26px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Organic Farm Sourcing
                  </a>
                </div>
                <!-- Clean Beauty Standards Bar -->
                <div style="display:flex;align-items:center;gap:18px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div style="width:48px;height:48px;border-radius:50%;border:2px solid ${theme.primary};display:flex;align-items:center;justify-content:center;color:${theme.primary};font-weight:900;font-size:0.8rem;background:#fff;">
                    pH 5.5
                  </div>
                  <div>
                    <div style="font-weight:800;font-size:0.9rem;color:${theme.text};">100% Vegan &amp; Leaping Bunny Cruelty-Free</div>
                    <div style="font-size:0.78rem;color:${theme.textSub};">0% Parabens · 0% Silicones · 100% Recyclable Glass</div>
                  </div>
                </div>
              </div>

              <!-- Floating Serum Dropper Bottle Visual -->
              <div style="position:relative;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;overflow:hidden;box-shadow:0 24px 50px rgba(4,120,87,0.08);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:20px;left:20px;background:rgba(250,250,249,0.92);backdrop-filter:blur(8px);padding:8px 16px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                    <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};">CENTELLA ASIATICA · 95% PURITY</span>
                  </div>
                  <div style="position:absolute;bottom:20px;right:20px;background:${theme.primary};color:#fff;padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:800;">
                    BIO-ACTIVE FORMULA
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Active Botanical Extraction Matrix -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Phytochemical Science</span>
                <h2 style="font-family:Georgia,serif;font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Active Botanical Extraction Matrix
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Clinically researched Latin binomial ingredients extracted under low-temperature supercritical CO₂ to preserve bioactive phytonutrients.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">EXTRACT 01</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">Centella Asiatica</h4>
                  <div style="font-size:0.75rem;font-style:italic;color:${theme.textSub};margin-bottom:8px;">Madecassoside 95%</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Rapidly calms reactive erythema and accelerates dermal tissue repair.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">EXTRACT 02</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">Camellia Sinensis</h4>
                  <div style="font-size:0.75rem;font-style:italic;color:${theme.textSub};margin-bottom:8px;">EGCG Polyphenols 85%</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Potent free-radical scavenger shielding against environmental UV and pollution stress.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">EXTRACT 03</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">Bakuchiol Seed</h4>
                  <div style="font-size:0.75rem;font-style:italic;color:${theme.textSub};margin-bottom:8px;">Phyto Retinoid 99%</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Stimulates cellular renewal without erythema, photosensitivity, or peeling.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">EXTRACT 04</div>
                  <h4 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 4px;">Squalane Esters</h4>
                  <div style="font-size:0.75rem;font-style:italic;color:${theme.textSub};margin-bottom:8px;">Olive Phytochemicals</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Biocompatible lipid mimic locking in moisture and reinforcing the stratum corneum.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Botanical Shelf Curation -->
          <section style="padding:70px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Sustainable Skincare Formulations</span>
                  <h2 style="font-family:Georgia,serif;font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Bio-Active Dispensary Shelf
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};">
                  View All Formulations (${products.length}) →
                </a>
              </div>

              <!-- Asymmetric 1-wide + 2-stacked layout -->
              <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:28px;">
                <!-- Wide Masterpiece Formulation -->
                <article data-wr-product-id="${esc(heroProduct.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(4,120,87,0.06);display:flex;flex-direction:column;">
                  <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;flex:1;">
                    <div style="aspect-ratio:1.3;background:#f5fdfa;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                    </div>
                  </a>
                  <div style="padding:24px;">
                    <span style="font-size:0.75rem;color:${theme.primary};font-weight:800;letter-spacing:0.04em;">SIGNATURE SERUM #01</span>
                    <h3 style="font-family:Georgia,serif;font-size:1.35rem;font-weight:900;color:${theme.text};margin:6px 0 10px;">
                      <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;color:${theme.text};">${esc(heroProduct.name)}</a>
                    </h3>
                    <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin-bottom:18px;">${esc(heroProduct.desc)}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;padding-top:14px;border-top:1px solid ${theme.cardBorder};">
                      <span style="color:${theme.textSub};">${esc(heroProduct.material)}</span>
                      <strong style="color:${theme.primary};">MOQ: ${esc(heroProduct.moq)}</strong>
                    </div>
                  </div>
                </article>

                <!-- Stacked Side Formulations -->
                <div style="display:flex;flex-direction:column;gap:24px;">
                  ${products.slice(1, 3).map((p, idx) => `
                    <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(4,120,87,0.04);display:grid;grid-template-columns:140px 1fr;align-items:center;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;height:100%;">
                        <div style="height:100%;min-height:140px;background:#f5fdfa;display:flex;align-items:center;justify-content:center;border-right:1px solid ${theme.cardBorder};">
                          <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                        </div>
                      </a>
                      <div style="padding:18px 20px;">
                        <span style="font-size:0.7rem;font-weight:800;color:${theme.primary};">DISPENSARY LOT #0${idx + 2}</span>
                        <h4 style="font-family:Georgia,serif;font-size:1.05rem;font-weight:900;color:${theme.text};margin:4px 0 6px;">
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
      // BOTANICAL ACTIVE ARCHIVE CATALOG
      mainHtml = `
        <main class="beauty-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Bio-Active Dispensary Archive · Clean Clinical Batch
              </div>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.02em;">
                Botanical Skincare Formulations Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:999px;background:${theme.primary};color:#fff;">All Formulations (${products.length})</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Skin Barrier Repair</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Deep Multi-HA Hydration</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Phyto-Retinol Age Defense</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Soothing Cica Toners</span>
              </div>
            </div>

            <!-- Botanical Product Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:32px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(4,120,87,0.05);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#f5fdfa;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:82%;height:82%;object-fit:contain;">
                      <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">pH 5.5 Balanced</span>
                    </div>
                  </a>
                  <div style="padding:22px;">
                    <span style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                    <h3 style="font-family:Georgia,serif;font-size:1.15rem;font-weight:900;color:${theme.text};margin:6px 0 10px;line-height:1.3;">
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
                        Formulation Dossier →
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
      // CLINICAL AESTHETIC MODALITY DECK CATALOG
      mainHtml = `
        <main class="beauty-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:24px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Medical Aesthetics Portfolio · Hardware Modalities
              </div>
              <h1 style="font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                Clinical Phototherapy &amp; RF Device Catalog
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:6px;background:${theme.primary};color:#fff;">All Device Modalities (${products.length})</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Multi-Polar RF</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Medical LED Masks</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Sonic Infusion Wands</span>
                <span style="padding:7px 16px;border-radius:6px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Microcurrent EMS</span>
              </div>
            </div>

            <!-- Aesthetic Hardware Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(225,29,72,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.1;background:#fff5f5;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                      <span style="position:absolute;top:10px;left:10px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">ISO 13485</span>
                    </div>
                  </a>
                  <div style="padding:20px;">
                    <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                    <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};margin:0 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;font-size:0.75rem;margin-bottom:14px;">
                      <div>
                        <span style="color:${theme.textSub};display:block;">Hardware Specs:</span>
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
      // BOTANICAL BIO-ACTIVE DETAIL: DROPLET VISCOSITY + PH METER + PCR GLASS BREAKDOWN
      mainHtml = `
        <main class="beauty-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Botanical Formulations Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Formulation Vial & Droplet Swatch -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;position:relative;box-shadow:0 12px 32px rgba(4,120,87,0.05);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;">
                    pH 5.5 Balanced
                  </div>
                  <!-- Thumbnails container -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- Viscosity & Clean Beauty Indicators -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">Viscosity 3/5</div>
                    <div style="color:${theme.textSub};">Fast-Absorbing Serum</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">100% Vegan</div>
                    <div style="color:${theme.textSub};">ECOCERT Certified</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">Private Label Batch</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Formulation Dossier & PCR Glass Packaging -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Clean Bio-Active Formulation
                </div>
                <h1 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <!-- Phytochemical Specifications Table -->
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;margin-bottom:28px;">
                  <h3 style="font-family:Georgia,serif;font-size:0.95rem;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Bio-Active Phytochemical Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.85rem;">
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Key Active Complexes</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Dispenser &amp; Volume</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Clinical Safety</span>
                      <strong style="color:${theme.text};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Production MOQ</span>
                      <strong style="color:${theme.primary};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- PCR Recyclable Packaging Breakdown -->
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:22px;margin-bottom:28px;">
                  <h4 style="font-size:0.88rem;font-weight:800;color:#166534;margin:0 0 8px;">100% Recyclable Glass Packaging Architecture</h4>
                  <p style="font-size:0.82rem;color:#14532d;margin:0 0 14px;line-height:1.6;">
                    Supplied in UV-inhibiting frosted borosilicate glass bottles with food-grade silicone pipette bulbs and recyclable aluminum collars.
                  </p>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <span style="padding:6px 14px;background:#fff;border:1px solid #86efac;color:#166534;border-radius:6px;font-size:0.75rem;font-weight:700;">[ UV-Shield Frosted Glass ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #86efac;color:#166534;border-radius:6px;font-size:0.75rem;font-weight:700;">[ Biodegradable Bamboo Pipette ]</span>
                    <span style="padding:6px 14px;background:#fff;border:1px solid #86efac;color:#166534;border-radius:6px;font-size:0.75rem;font-weight:700;">[ Soy-Ink Printed FSC Box ]</span>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Request Formulation Sample ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    View All Actives
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // CLINICAL AESTHETIC DEVICE DETAIL: 28-DAY TRIAL CHARTS + TITANIUM PROBE SCHEMATIC
      mainHtml = `
        <main class="beauty-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Aesthetic Device Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <!-- Left Column: Device Portrait & Gallery -->
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;position:relative;box-shadow:0 12px 32px rgba(225,29,72,0.06);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;font-family:monospace;">
                    MEDICAL CE 0123
                  </div>
                  <!-- Thumbnails -->
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <!-- 28-Day Clinical Trial Efficacy Bar Chart -->
                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.04em;">28-DAY CLINICAL TRIAL EFFICACY</span>
                    <span style="font-size:0.7rem;font-family:monospace;color:${theme.textSub};">N=60 PATIENTS</span>
                  </div>
                  <div style="space-y:10px;">
                    <div style="margin-bottom:10px;">
                      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:700;margin-bottom:4px;">
                        <span>Dermal Collagen Density</span>
                        <strong style="color:${theme.primary};">+42.8%</strong>
                      </div>
                      <div style="height:8px;border-radius:4px;background:#ffe4e6;overflow:hidden;">
                        <div style="width:85%;height:100%;background:${theme.btnGradient};border-radius:4px;"></div>
                      </div>
                    </div>
                    <div style="margin-bottom:10px;">
                      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:700;margin-bottom:4px;">
                        <span>Periorbital Fine Line Reduction</span>
                        <strong style="color:${theme.primary};">-31.4%</strong>
                      </div>
                      <div style="height:8px;border-radius:4px;background:#ffe4e6;overflow:hidden;">
                        <div style="width:68%;height:100%;background:${theme.btnGradient};border-radius:4px;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:700;margin-bottom:4px;">
                        <span>Skin Elasticity &amp; Bounce</span>
                        <strong style="color:${theme.primary};">+28.5%</strong>
                      </div>
                      <div style="height:8px;border-radius:4px;background:#ffe4e6;overflow:hidden;">
                        <div style="width:62%;height:100%;background:${theme.btnGradient};border-radius:4px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Engineering Specs & Charging Dock -->
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Commercial Aesthetic Hardware
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
                    Device Engineering Specifications
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Contact Probe Material</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px solid ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Dimensions &amp; Net Weight</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">Regulatory Clearance</span>
                      <strong style="color:${theme.primary};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:2px;">OEM Production MOQ</span>
                      <strong style="color:${theme.text};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <!-- Worldwide Multi-Voltage & Safety Thermal Cutoff -->
                <div style="background:#fff1f2;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:${theme.text};margin:0 0 10px;">Thermal Safety &amp; Electrical Architecture</h4>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:0.8rem;text-align:center;">
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Thermal Sensor</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">42.0°C Cutoff</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Battery Life</div>
                      <strong style="color:${theme.text};font-size:0.95rem;">2,200 mAh Li-Ion</strong>
                    </div>
                    <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid ${theme.cardBorder};">
                      <div style="color:${theme.textSub};">Input Power</div>
                      <strong style="color:${theme.primary};font-size:0.95rem;">100-240V USB-C</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                    Submit Device OEM RFQ ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Explore All Modalities
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? 'Bio-Photonic Aesthetic Device R&D Institute' : 'Certified Organic Botanical Farm & Clean Lab');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || (isVideo ? 'Engineered at the intersection of medical photonics and bio-compatible materials, Lumina operates Class 10,000 cleanroom manufacturing certified to ISO 13485 standards.' : 'We cultivate certified organic botanicals on mineral-rich agricultural estates, harvesting active plants at peak seasonal potency. Our solvent-free supercritical CO₂ extraction facility preserves delicate secondary plant metabolites without chemical residue.'));
    const images = getAboutImages(ctx);
    const highlights = parseAboutHighlights(company.aboutHighlights, isVideo ? [
      { value: '4.0 MHz', label: 'RF Waveform Frequency', desc: 'Medical-grade multi-polar collagen stimulation' },
      { value: '4 Wavelengths', label: 'Phototherapy Precision', desc: 'Calibrated optical nanometer outputs' },
      { value: 'ISO 13485', label: 'Cleanroom Certified', desc: 'International medical device manufacturing' },
    ] : [
      { value: '95% Purity', label: 'Supercritical CO₂', desc: 'Phytochemical extract potency benchmark' },
      { value: 'pH 5.5', label: 'Skin Barrier Harmony', desc: 'Dermatologically calibrated micro-environment' },
      { value: '100% Vegan', label: 'Clean Formulation', desc: 'Zero parabens, sulfates, or animal testing' },
    ]);
    const primaryImage = images.primary || (isVideo ? getIndustryPlaceholder('beauty', 2) : getIndustryPlaceholder('beauty', 0));

    if (!isVideo) {
      // BOTANICAL SUSTAINABLE FARM ABOUT
      mainHtml = `
        <main class="beauty-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Sustainable Agriculture &amp; Extraction Science
              </span>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:24px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(4,120,87,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:440px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.05rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">We cultivate certified organic botanicals on mineral-rich agricultural estates, harvesting active plants at peak seasonal potency. Our solvent-free supercritical CO₂ extraction facility preserves delicate secondary plant metabolites without chemical residue.</p>
                    <p style="margin:0 0 18px;">Every batch is verified by high-performance liquid chromatography (HPLC) to guarantee bioactive percentage standardization, delivering consistent dermatological efficacy for international private labels.</p>
                  `}
                </div>
              </div>
            </div>

            <!-- Highlights Matrix -->
            ${highlights.length > 0 ? `
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;margin-bottom:50px;">
                ${highlights.map(h => `
                  <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:2rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">${esc(h.value)}</div>
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
      // CLINICAL PHOTOTHERAPY R&D INSTITUTE ABOUT
      mainHtml = `
        <main class="beauty-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <div style="max-width:840px;margin:0 auto 50px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Bio-Photonic R&amp;D Cleanroom Facilities
              </span>
              <h1 style="font-size:clamp(2.1rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 20px;line-height:1.2;">
                ${esc(headline)}
              </h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:64px;">
              <div style="border-radius:18px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(225,29,72,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                  ${paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">Operating in ISO 13485 medical cleanrooms, our optical engineering team develops patented aesthetic technologies combining RF capacitive coupling, high-energy LED matrices, and ultrasonic cavitation.</p>
                    <p style="margin:0 0 18px;">We provide comprehensive OEM/ODM solutions for clinical medspas and global consumer brands, offering full regulatory clearance packages including CE Medical, FDA 510(k), and RoHS compliance.</p>
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
      // BOTANICAL PRIVATE LABEL FORMULATION DESK
      mainHtml = `
        <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Private Label Formulation &amp; Sourcing Consultation
              </span>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Initiate Custom Formulation Dialogue
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Collaborate with our cosmetic chemists to formulate custom active concentrations, bespoke viscosity textures, and sustainable glass packaging.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:40px;box-shadow:0 12px 36px rgba(4,120,87,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Your Name / Brand Founder</label>
                    <input type="text" name="name" required placeholder="Beauty Brand Director" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Direct Email Address</label>
                    <input type="email" name="email" required placeholder="founder@cleanbeauty.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Botanical Formulation</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Custom Formulation Inquiries</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.moq)})</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Texture Viscosity Profile</label>
                    <select name="texture" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Watery Essence / Micro-Droplet</option>
                      <option>Hydrating Serum Gel</option>
                      <option>Biomimetic Lipid Emulsion</option>
                      <option>Rich Velvet Barrier Cream</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Packaging Specification</label>
                    <select name="packaging" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Frosted Borosilicate Dropper Bottle</option>
                      <option>Airless Dual-Chamber Pump Vial</option>
                      <option>UV-Amber Dropper with Bamboo Collar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Active Ingestion Requirements &amp; Target Certifications</label>
                  <textarea name="message" rows="4" placeholder="Detail your desired hero active percentage, target market certification (ECOCERT, Leaping Bunny), or launch timeline..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:999px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Transmit Formulation Consultation Request ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      // CLINICAL AESTHETIC DEVICE OEM/ODM RFQ TERMINAL
      mainHtml = `
        <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Medical Aesthetics OEM/ODM Procurement
              </span>
              <h1 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Submit Aesthetic Device RFQ
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Inquire about custom tooling, titanium probe modifications, private label firmware apps, and medical regulatory dossier support.
              </p>
            </div>

            <div style="max-width:800px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:40px;box-shadow:0 12px 36px rgba(225,29,72,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Procurement Contact</label>
                    <input type="text" name="name" required placeholder="Device Sourcing Director" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" required placeholder="sourcing@medspa-enterprise.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Selected Aesthetic Modality</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">General Hardware Inquiries (All Device Modalities)</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Order Volume Tier</label>
                    <select name="volume" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Evaluation Batch (200 - 500 Units)</option>
                      <option>Commercial Scale (1,000 - 5,000 Units)</option>
                      <option>Global Distribution (10,000+ Units)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Regulatory Package Required</label>
                    <select name="compliance" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>CE Medical (MDR 2017/745)</option>
                      <option>FDA 510(k) Pre-Market Clearance</option>
                      <option>Standard Consumer Electronics (CE/FCC/RoHS)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Custom Tooling &amp; Technical Requirements</label>
                  <textarea name="message" rows="4" placeholder="Specify custom handle ergonomics, Pantone silicone finishes, or custom companion software requirements..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:8px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Submit Device OEM RFQ Specification ↗
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
            Medical aesthetic device manufacturing. Calibrated optical phototherapy, multi-polar RF waveforms, and ISO 13485 cleanroom precision.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f43f5e;font-size:0.7rem;font-weight:700;">ISO 13485</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f43f5e;font-size:0.7rem;font-weight:700;">CE MEDICAL</span>
            <span style="padding:3px 8px;border-radius:4px;background:#1e293b;color:#f43f5e;font-size:0.7rem;font-weight:700;">FDA 510(K)</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Optical &amp; RF Modalities</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#94a3b8;font-size:0.82rem;line-height:2;">
            <li>4-Wavelength Calibrated Phototherapy</li>
            <li>4.0 MHz Multi-Polar RF Waveforms</li>
            <li>Grade 5 Titanium Contact Probes</li>
            <li>IPX7 Waterproof Sonic Cleaners</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">OEM Procurement</h4>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'device-oem@bioglow-med.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#f43f5e;text-decoration:none;font-weight:700;font-size:0.82rem;">Direct Sourcing Terminal →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #1e293b;padding-top:24px;display:flex;justify-content:space-between;color:#64748b;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Bio-Photonic Aesthetic Device R&amp;D Division</span>
      </div>
    </footer>
  ` : `
    <footer style="background:#1c1917;color:#fafaf9;padding:60px 0 40px;font-size:0.88rem;border-top:1px solid rgba(255,255,255,0.08);">
      <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:#fff;margin-bottom:8px;">${esc(brandName)}</div>
          <p style="color:#a8a29e;font-size:0.84rem;line-height:1.6;margin:0 0 16px;max-width:360px;">
            Clean botanical bio-active skincare. Supercritical CO₂ extraction, certified organic active phytonutrients, and sustainable glass dispensary.
          </p>
          <div style="display:flex;gap:8px;">
            <span style="padding:3px 8px;border-radius:4px;background:#292524;color:#86efac;font-size:0.7rem;font-weight:700;">ECOCERT</span>
            <span style="padding:3px 8px;border-radius:4px;background:#292524;color:#86efac;font-size:0.7rem;font-weight:700;">CRUELTY FREE</span>
            <span style="padding:3px 8px;border-radius:4px;background:#292524;color:#86efac;font-size:0.7rem;font-weight:700;">100% RECYCLABLE</span>
          </div>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Formulation Archive</h4>
          <ul style="list-style:none;padding:0;margin:0;color:#a8a29e;font-size:0.82rem;line-height:2;">
            <li>Triple-Molecular Hyaluronic Serums</li>
            <li>Bio-Identical Ceramide Night Creams</li>
            <li>Cold-Pressed Camellia Bakuchiol Oils</li>
            <li>Organic Centella Asiatica Toners</li>
          </ul>
        </div>
        <div>
          <h4 style="color:#fff;font-size:0.85rem;font-weight:800;text-transform:uppercase;margin:0 0 16px;">Private Label Inquiries</h4>
          <p style="color:#a8a29e;font-size:0.82rem;line-height:1.6;margin:0 0 12px;">${esc(company.email || 'formulations@purebotanica.com')}</p>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#86efac;text-decoration:none;font-weight:700;font-size:0.82rem;">Consult Formulation Chemist →</a>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid #292524;padding-top:24px;display:flex;justify-content:space-between;color:#78716c;font-size:0.75rem;flex-wrap:wrap;gap:12px;">
        <span>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
        <span>Bio-Active Botanical Skincare &amp; Phytochemical Laboratory</span>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
