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
    id: 'bp-1',
    name: 'Centella Asiatica Soothing Barrier Serum',
    desc: 'Formulated with 95% high-purity supercritical Centella Asiatica extract and multi-molecular hyaluronic acid to restore compromised lipid barriers.',
    badge: 'Bio-Active',
    category: 'serum',
    categoryNameZh: '',
    categoryNameEn: 'Bio-Active Serums',
    material: 'Centella Asiatica 95%, Ceramide NP, Squalane',
    dimensions: '30ml Dropper · Amber PCR Glass',
    extra: 'pH 5.5 Skin Balance',
    moq: '500 Pcs',
    tagline: 'Supercritical Botanical Purity',
    img: getIndustryPlaceholder('beauty', 0),
  },
  {
    id: 'bp-2',
    name: 'Multi-Polar RF Facial Sculpting Device',
    desc: 'Medical-grade 4.0MHz radiofrequency energy combined with 630nm red phototherapy to stimulate deep dermal collagen neocollagenesis.',
    badge: 'Clinical Grade',
    category: 'device',
    categoryNameZh: '',
    categoryNameEn: 'Aesthetic Modalities',
    material: 'Medical Titanium Probe, Aerospace Alloy',
    dimensions: '185 × 45 × 38 mm · 210g',
    extra: '4.0 MHz Multi-Polar RF',
    moq: '100 Units',
    tagline: 'Deep Dermal Neocollagenesis',
    img: getIndustryPlaceholder('beauty', 1),
  },
  {
    id: 'bp-3',
    name: 'Camellia Seed Cold-Pressed Botanical Elixir',
    desc: 'Single-estate organic Camellia Sinensis seed oil cold-pressed below 35°C, rich in oleic acid and polyphenols for cellular antioxidant defense.',
    badge: 'Cold-Pressed',
    category: 'oil',
    categoryNameZh: '',
    categoryNameEn: 'Botanical Elixirs',
    material: '100% Virgin Camellia Oleifera Seed Oil',
    dimensions: '50ml Pipette · Frosted Violet Glass',
    extra: 'Zero Solvent Extraction',
    moq: '300 Pcs',
    tagline: 'Single-Estate Virgin Extraction',
    img: getIndustryPlaceholder('beauty', 2),
  },
  {
    id: 'bp-4',
    name: 'Quad-Wavelength Clinical LED Therapy Mask',
    desc: 'Flexible food-grade silicone phototherapy mask housing 240 medical LEDs emitting 415nm, 590nm, 630nm, and 830nm near-infrared wavelengths.',
    badge: 'FDA Cleared',
    category: 'ledmask',
    categoryNameZh: '',
    categoryNameEn: 'Phototherapy Devices',
    material: 'Medical Silicone, 240 Medical SMD LEDs',
    dimensions: 'Universal Ergonomic Fit · 320g',
    extra: 'Quad-Band Wavelengths',
    moq: '80 Units',
    tagline: 'Hospital-Grade Optical Nanometers',
    img: getIndustryPlaceholder('beauty', 3),
  },
  {
    id: 'bp-5',
    name: 'Rice Ferment Ceramide Barrier Cream',
    desc: 'Traditional micro-fermented rice filtrate enriched with biomimetic ceramides 1, 3, and 6-II to lock in epidermal hydration for 72 hours.',
    badge: 'Micro-Biome',
    category: 'cream',
    categoryNameZh: '',
    categoryNameEn: 'Barrier Emulsions',
    material: 'Saccharomyces/Rice Ferment Filtrate',
    dimensions: '50ml Airless Pump Jar',
    extra: '72H Hydration Lock',
    moq: '500 Pcs',
    tagline: 'Micro-Fermented Epidermal Defense',
    img: getIndustryPlaceholder('beauty', 4),
  },
  {
    id: 'bp-6',
    name: 'Ultra-Sonic Deep Pore Hydro-Dermabrasion Wand',
    desc: 'High-frequency 28kHz ultrasonic cavitation blade with negative ion infusion for deep comedone extraction and enhanced transdermal delivery.',
    badge: 'Salon Tech',
    category: 'ultrasonic',
    categoryNameZh: '',
    categoryNameEn: 'Hydro-Exfoliators',
    material: 'Surgical Stainless Steel Spatula Body',
    dimensions: '168 × 40 × 15 mm · 120g',
    extra: '28 kHz Cavitation',
    moq: '200 Units',
    tagline: '28 kHz Acoustic Cavitation',
    img: getIndustryPlaceholder('beauty', 5),
  },
  {
    id: 'bp-7',
    name: 'Bakuchiol 2% Plant Retinol Youth Serum',
    desc: 'Photostable 2% natural Bakuchiol extract blended with squalane and blue tansy, delivering retinoid-like collagen renewal without irritation.',
    badge: 'Clean Clean',
    category: 'retinol',
    categoryNameZh: '',
    categoryNameEn: 'Phyto-Actives',
    material: 'Psoralea Corylifolia Extract, Blue Tansy',
    dimensions: '30ml Dropper Vial',
    extra: 'Zero Skin Irritation',
    moq: '300 Pcs',
    tagline: 'Photostable Phyto-Retinol Alternative',
    img: getIndustryPlaceholder('beauty', 6),
  },
  {
    id: 'bp-8',
    name: 'Cryo-Thermal Lymphatic Drainage Contour Tool',
    desc: 'Peltier-effect semiconductor thermal probe alternating between 6°C vasoconstriction cryo and 42°C soothing heat with dynamic vibration.',
    badge: 'Cryo-Tech',
    category: 'cryo',
    categoryNameZh: '',
    categoryNameEn: 'Contour Instruments',
    material: 'Anodized 6063 Aluminum, Peltier Sensor',
    dimensions: '142 × 35 × 30 mm · 165g',
    extra: '6°C to 42°C Shock',
    moq: '150 Units',
    tagline: 'Dual-Phase Thermal Sculpting',
    img: getIndustryPlaceholder('beauty', 7),
  },
];

export function getBeautyProducts(ctx: ThemeContext): ThemedBeautyItem[] {
  if (isTypedMaterialsSource(ctx.draft)) {
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

  const brandName = company.name || (isVideo ? 'Lumina Medical Phototherapy & RF Devices' : 'Botanica Bio-Active Clean Skincare');
  const brandTagline = isVideo ? 'Hospital-Grade Optical Nanometers & Multi-Polar RF' : 'Supercritical Extraction & 100% PCR Formulation';

  // Strict pure light palettes - zero dark themes
  const theme = isVideo
    ? {
      bg: '#fff1f2',
      cardBg: '#ffffff',
      cardBorder: 'rgba(244,63,94,0.18)',
      primary: '#e11d48',
      primaryHover: '#be123c',
      text: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      glassBg: 'rgba(255,241,242,0.92)',
      pillBg: '#ffe4e6',
      pillText: '#be123c',
      btnGradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
      accentGlow: 'rgba(225,29,72,0.22)',
    }
    : {
      bg: '#fafaf9',
      cardBg: '#ffffff',
      cardBorder: 'rgba(16,185,129,0.18)',
      primary: '#059669',
      primaryHover: '#047857',
      text: '#1c1917',
      textMuted: '#57534e',
      textSub: '#78716c',
      glassBg: 'rgba(250,250,249,0.92)',
      pillBg: '#d1fae5',
      pillText: '#047857',
      btnGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      accentGlow: 'rgba(16,185,129,0.22)',
    };

  // Distinct Header
  const headerHtml = isVideo ? `
    <header class="beauty-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="background:#e11d48;color:#fff;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;font-weight:700;letter-spacing:0.04em;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fff;"></span>
          <span>CLINICAL AESTHETIC DEVICE R&amp;D · 4.0 MHZ MULTI-POLAR RF CERTIFIED</span>
        </div>
        <div>ISO 13485 MEDICAL CLEANROOM · CE MEDICAL CERTIFICATION</div>
      </div>
      <div class="wrap" style="height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.15rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;">${esc(brandName)}</span>
            <span style="font-size:0.72rem;color:${theme.textSub};font-weight:600;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.text};">Home</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.text};">Device Deck</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.text};">Clinical Lab</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.text};">OEM Inquiries</a>
        </nav>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:0.78rem;font-weight:700;color:${theme.textSub};">EN</span>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.85rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Request Clinic OEM ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="beauty-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div class="wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:14px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:40px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:${theme.text};letter-spacing:-0.01em;">${esc(brandName)}</span>
            <span style="font-size:0.72rem;color:${theme.textSub};letter-spacing:0.04em;text-transform:uppercase;">${esc(brandTagline)}</span>
          </div>
        </a>
        <nav style="display:flex;align-items:center;gap:32px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.text};">Collection</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.text};">Botanical Archive</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.text};">Clean Lab &amp; Farm</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.text};">Private Label</a>
        </nav>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:0.78rem;font-weight:700;color:${theme.textSub};">EN</span>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.85rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Consult Formulation ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // 1. CLINICAL PHOTOTHERAPY & RF DEVICE HUD VIDEO HERO
      mainHtml = `
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;margin-bottom:20px;">
                  <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};display:inline-block;"></span>
                  HOSPITAL AESTHETIC DERMAL MODALITY R&amp;D
                </div>
                <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.6rem);font-weight:900;line-height:1.12;color:${theme.text};letter-spacing:-0.03em;margin:0 0 20px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Clinical Photonic Architecture: 4.0 MHz Multi-Polar RF Neocollagenesis')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:540px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with calibrated medical titanium contact probes, dual-depth acoustic cavitation, and hospital-tested quad-band LED phototherapy.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Clinical Device Index ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 24px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Optical Spectrum Lab
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">4.0 MHz</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Multi-Polar RF Energy</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">4 Bands</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">415nm - 830nm LED</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">ISO 13485</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Medical Cleanroom</div>
                  </div>
                </div>
              </div>

              <div style="position:relative;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(225,29,72,0.08);">
                  <div style="aspect-ratio:16/9;background:#fff1f2;position:relative;overflow:hidden;">
                    <video autoplay muted loop playsinline poster="${esc(heroProduct.img)}" style="width:100%;height:100%;object-fit:cover;display:block;">
                      <source src="/templates/videos/clinical-rf.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;top:16px;left:16px;background:rgba(255,255,255,0.92);color:#e11d48;font-family:monospace;font-size:0.72rem;font-weight:800;padding:6px 12px;border-radius:4px;border:1px solid rgba(225,29,72,0.2);">
                      WAVELENGTH: 630NM RED // COLLAGEN DEPTH 2.5MM
                    </div>
                  </div>
                  <div style="padding:20px 24px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid ${theme.cardBorder};">
                    <div>
                      <div style="font-size:0.95rem;font-weight:900;color:${theme.text};">${esc(heroProduct.name)}</div>
                      <div style="font-size:0.75rem;color:${theme.textSub};">${esc(heroProduct.material)} · ${esc(heroProduct.extra)}</div>
                    </div>
                    <a href="${path('products/' + heroProduct.id + '/index.html')}" ${navAttrs('detail', heroProduct.id)} style="padding:8px 16px;background:${theme.pillBg};color:${theme.pillText};border-radius:6px;text-decoration:none;font-size:0.8rem;font-weight:800;">
                      Clinical Spec →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 4-Wavelength LED Spectral Penetration Bar -->
          <section style="padding:60px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Optical Penetration Matrix</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 10px;">
                  Quad-Wavelength Clinical Nanometer Spectrum
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Targeting specific skin depths from superficial acne bactericidal control to deep SMAS collagen induction.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;">
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:#2563eb;margin-bottom:4px;">415 nm</div>
                  <h4 style="font-size:0.9rem;font-weight:800;color:#1e3a8a;margin:0 0 4px;">Blue Light</h4>
                  <p style="font-size:0.75rem;color:#1d4ed8;line-height:1.5;margin:0;">1mm depth. Destroys P. acnes bacteria and balances sebum.</p>
                </div>
                <div style="background:#fefce8;border:1px solid #fef08a;border-radius:12px;padding:20px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:#ca8a04;margin-bottom:4px;">590 nm</div>
                  <h4 style="font-size:0.9rem;font-weight:800;color:#854d0e;margin:0 0 4px;">Amber Light</h4>
                  <p style="font-size:0.75rem;color:#a16207;line-height:1.5;margin:0;">2mm depth. Soothes redness, stimulates microcirculation.</p>
                </div>
                <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:20px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:#e11d48;margin-bottom:4px;">630 nm</div>
                  <h4 style="font-size:0.9rem;font-weight:800;color:#9f1239;margin:0 0 4px;">Red Light</h4>
                  <p style="font-size:0.75rem;color:#be123c;line-height:1.5;margin:0;">3mm depth. Activates fibroblasts and triggers collagen synthesis.</p>
                </div>
                <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px;text-align:center;">
                  <div style="font-size:1.6rem;font-weight:900;color:#9333ea;margin-bottom:4px;">830 nm</div>
                  <h4 style="font-size:0.9rem;font-weight:800;color:#581c87;margin:0 0 4px;">Near-Infrared</h4>
                  <p style="font-size:0.75rem;color:#7e22ce;line-height:1.5;margin:0;">5mm SMAS depth. Accelerates cellular repair and wound healing.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Clinical Modality Catalog Showcase -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.06em;text-transform:uppercase;">Certified Aesthetic Deck</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Clinical Aesthetic Instrumentation
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;color:${theme.primary};font-size:0.9rem;">
                  Full Clinical Deck →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(225,29,72,0.04);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#fff5f6;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                        <span style="position:absolute;top:12px;left:12px;background:#e11d48;color:#fff;font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                    </a>
                    <div style="padding:20px;">
                      <div style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                      <h3 style="font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;line-height:1.3;">
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                      </h3>
                      <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.5;margin-bottom:14px;">${esc(p.desc)}</p>
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
      // 2. BOTANICAL BIO-ACTIVE EDITORIAL LUXURY HERO
      mainHtml = `
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;padding:60px 0 80px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  100% PCR GLASS · ORGANIC BOTANICAL EXTRACTION
                </div>
                <h1 style="font-family:Georgia,serif;font-size:clamp(2.3rem, 4.2vw, 3.6rem);font-weight:400;font-style:italic;line-height:1.15;color:${theme.text};margin:0 0 20px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Phyto-Active Skin Science: Pure Extraction Meets Barrier Repair')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:540px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Clean formulations crafted with solvent-free supercritical CO₂ botanical extracts, biomimetic plant ceramides, and dermatological pH 5.5 balance.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore Formulations ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:14px 26px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Organic Farm Origin
                  </a>
                </div>
                <div style="display:flex;gap:24px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:900;color:${theme.primary};">pH 5.5</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">Microbiome Neutral</div>
                  </div>
                  <div>
                    <div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:900;color:${theme.primary};">100%</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">PCR Glass Packaging</div>
                  </div>
                  <div>
                    <div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:900;color:${theme.primary};">0%</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">Sulfates &amp; Parabens</div>
                  </div>
                </div>
              </div>

              <div style="position:relative;">
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:240px 240px 24px 24px;overflow:hidden;box-shadow:0 24px 50px rgba(5,150,105,0.08);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:440px;object-fit:cover;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:24px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);padding:6px 18px;border-radius:999px;border:1px solid ${theme.cardBorder};font-size:0.72rem;font-weight:800;color:${theme.primary};letter-spacing:0.04em;">
                    BOTANICAL ACTIVE ARCHIVE #01
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 4-Active Botanical Extraction Matrix -->
          <section style="padding:70px 0;border-bottom:1px solid ${theme.cardBorder};background:#ffffff;">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
                <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;">Bio-Active Efficacy</span>
                <h2 style="font-family:Georgia,serif;font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">
                  Quad-Extraction Botanical Matrix
                </h2>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                  Supercritical extraction isolates active polyphenols while maintaining cellular vitality.
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">ACTIVE 01</div>
                  <h4 style="font-family:Georgia,serif;font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Centella Asiatica</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Supercritical extract titrated to 95% madecassoside for rapid epidermal repair.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">ACTIVE 02</div>
                  <h4 style="font-family:Georgia,serif;font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Camellia Seed Oil</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Cold-pressed single-estate virgin oil loaded with oleic acid and antioxidant flavonoids.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">ACTIVE 03</div>
                  <h4 style="font-family:Georgia,serif;font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Rice Ferment</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Saccharomyces bio-filtrate naturally synthesizing ceramides 1, 3, and 6-II.
                  </p>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px 20px;">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">ACTIVE 04</div>
                  <h4 style="font-family:Georgia,serif;font-size:1.1rem;font-weight:900;color:${theme.text};margin:0 0 8px;">Natural Bakuchiol</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Photostable 2% phyto-retinol stimulating cellular renewal without peeling or redness.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Botanical Product Deck -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:44px;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};letter-spacing:0.06em;text-transform:uppercase;">Curated Formulations</span>
                  <h2 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                    Bio-Active Skincare Archive
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;color:${theme.primary};font-size:0.9rem;">
                  Complete Formulation Catalog →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:32px;">
                ${products.slice(0, 4).map(p => `
                  <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(5,150,105,0.05);">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1.1;background:#fcfcfc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:78%;height:78%;object-fit:contain;">
                        <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                    </a>
                    <div style="padding:22px;">
                      <span style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                      <h3 style="font-family:Georgia,serif;font-size:1.15rem;font-weight:900;color:${theme.text};margin:6px 0 10px;line-height:1.3;">
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                      </h3>
                      <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;margin-bottom:16px;">${esc(p.desc)}</p>
                      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid ${theme.cardBorder};">
                        <span style="font-size:0.78rem;color:${theme.textSub};">MOQ: <strong style="color:${theme.primary};">${esc(p.moq)}</strong></span>
                        <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;font-size:0.82rem;font-weight:800;color:${theme.primary};">
                          Formulation Specs →
                        </a>
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
      // BOTANICAL ACTIVE ARCHIVE CATALOG
      mainHtml = `
        <main class="beauty-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="border-bottom:2px solid ${theme.cardBorder};padding-bottom:28px;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">
                Botanical Active Formulations · Clean Certified
              </div>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.6vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Bio-Active Formulation Archive
              </h1>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:7px 16px;border-radius:999px;background:${theme.primary};color:#fff;">All Formulations (${products.length})</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Barrier Repair</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Phyto-Retinol</span>
                <span style="padding:7px 16px;border-radius:999px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Cold-Pressed Oils</span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:32px;">
              ${products.map(p => `
                <article data-wr-product-id="${esc(p.id)}" style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(5,150,105,0.05);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#fcfcfc;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;">
                      <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">pH 5.5</span>
                    </div>
                  </a>
                  <div style="padding:22px;">
                    <span style="font-size:0.72rem;color:${theme.textSub};font-weight:700;text-transform:uppercase;">${esc(p.categoryNameEn)}</span>
                    <h3 style="font-family:Georgia,serif;font-size:1.15rem;font-weight:900;color:${theme.text};margin:6px 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;margin-bottom:16px;">${esc(p.desc)}</p>
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
      // CLINICAL MODALITY DECK & HOLOGRAPHIC TREATMENT MATRIX
      mainHtml = `
        <main class="beauty-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <!-- Top Status Console Bar -->
            <div style="background:#e11d48;color:#ffffff;padding:10px 20px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.78rem;font-weight:700;flex-wrap:wrap;gap:10px;">
              <span>[CLINICAL MODALITY DECK: ACTIVE] // ISO 13485 CLEANROOM · 4.0 MHZ MULTI-POLAR RF</span>
              <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;">CALIBRATION: ±1.5NM · MEDICAL CLASS IIA</span>
            </div>

            <!-- Modality Filter Header Bar -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-top:none;border-radius:0 0 16px 16px;padding:28px 32px;margin-bottom:36px;box-shadow:0 8px 30px rgba(225,29,72,0.04);">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px;">
                <div>
                  <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:#ffe4e6;color:#be123c;font-size:0.75rem;font-weight:800;font-family:monospace;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:8px;">
                    Dermatological Phototherapy &amp; Dermal Infusion
                  </div>
                  <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:${theme.text};margin:0;letter-spacing:-0.03em;">
                    Clinical Modality &amp; Formulation Portfolio
                  </h1>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;font-family:monospace;font-size:0.75rem;font-weight:700;">
                  <span style="padding:8px 14px;border-radius:6px;background:#e11d48;color:#ffffff;border:1px solid #e11d48;cursor:pointer;">[MODALITY-01: ALL SYSTEMS (${products.length})]</span>
                  <span style="padding:8px 14px;border-radius:6px;background:#fff5f6;color:#9f1239;border:1px solid ${theme.cardBorder};cursor:pointer;">[MODALITY-02: 4.0 MHZ RF]</span>
                  <span style="padding:8px 14px;border-radius:6px;background:#fff5f6;color:#9f1239;border:1px solid ${theme.cardBorder};cursor:pointer;">[MODALITY-03: QUAD-BAND LED]</span>
                  <span style="padding:8px 14px;border-radius:6px;background:#fff5f6;color:#9f1239;border:1px solid ${theme.cardBorder};cursor:pointer;">[MODALITY-04: TRANSDERMAL BIO]</span>
                </div>
              </div>
            </div>

            <!-- Bespoke Clinical Modality Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:28px;">
              ${products.map((p, idx) => `
                <article data-wr-product-id="${esc(p.id)}" style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(225,29,72,0.06);display:flex;flex-direction:column;transition:transform 0.2s ease, box-shadow 0.2s ease;">
                  <!-- Top Clinical HUD Bar -->
                  <div style="background:#fff1f2;border-bottom:1px solid ${theme.cardBorder};padding:8px 16px;display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.72rem;">
                    <span style="color:#e11d48;font-weight:800;">SYS-MD${idx + 1} // MDR CLASS IIA</span>
                    <span style="background:#ffe4e6;color:#9f1239;padding:2px 6px;border-radius:4px;font-weight:700;">AUDIT PASS</span>
                  </div>

                  <!-- Optical Viewport Frame -->
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;background:linear-gradient(180deg, #fff8f8 0%, #ffffff 100%);padding:20px;position:relative;border-bottom:1px solid ${theme.cardBorder};">
                    <div style="aspect-ratio:1.2;position:relative;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#ffffff;border:1px dashed rgba(225,29,72,0.25);overflow:hidden;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:82%;height:82%;object-fit:contain;display:block;">
                      <span style="position:absolute;top:10px;left:10px;background:#e11d48;color:#ffffff;font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;font-family:monospace;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:10px;right:10px;background:#ffe4e6;color:#be123c;font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;font-family:monospace;">${esc(p.extra)}</span>
                    </div>
                  </a>

                  <!-- Clinical Card Body -->
                  <div style="padding:22px;flex:1;display:flex;flex-direction:column;">
                    <div style="font-family:monospace;font-size:0.72rem;color:#0284c7;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">
                      MODALITY ARCHITECTURE // ${esc(p.categoryNameEn)}
                    </div>
                    <h3 style="font-size:1.18rem;font-weight:900;color:${theme.text};margin:0 0 10px;line-height:1.3;">
                      <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:${theme.text};">${esc(p.name)}</a>
                    </h3>
                    <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 18px;flex:1;">
                      ${esc(p.desc)}
                    </p>

                    <!-- Dual Clinical Efficacy Meter -->
                    <div style="background:#fff5f6;border:1px solid ${theme.cardBorder};border-radius:8px;padding:12px;margin-bottom:18px;">
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:6px;">
                        <span style="color:#64748b;font-weight:700;">Epidermal Penetration:</span>
                        <strong style="color:#e11d48;font-family:monospace;">3.5mm Reticular Dermis</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;">
                        <span style="color:#64748b;font-weight:700;">28-Day Neocollagenesis:</span>
                        <strong style="color:#059669;font-family:monospace;">+48.6% Density Benchmark</strong>
                      </div>
                    </div>

                    <!-- Clinical Parameter Specs Strip -->
                    <div style="font-size:0.78rem;color:${theme.textSub};border-top:1px solid ${theme.cardBorder};padding-top:14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
                      <span>Clinical Contact: <strong style="color:${theme.text};">${esc(p.material.slice(0, 22))}</strong></span>
                      <span>MOQ: <strong style="color:#e11d48;">${esc(p.moq)}</strong></span>
                    </div>

                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;text-align:center;padding:12px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.85rem;font-weight:800;font-family:monospace;letter-spacing:0.03em;box-shadow:0 4px 14px rgba(225,29,72,0.18);">
                      INSPECT CLINICAL DOSSIER ↗
                    </a>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'detail') {
    const prod = products.find(p => p.id === ctx.options.productId) || heroProduct;
    if (!isVideo) {
      // BOTANICAL BIO-ACTIVE FORMULATION DOSSIER
      mainHtml = `
        <main class="beauty-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="display:flex;gap:8px;align-items:center;font-size:0.82rem;color:${theme.textSub};margin-bottom:28px;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textSub};">Atelier</a>
              <span>/</span>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textSub};">Archive</a>
              <span>/</span>
              <span style="color:${theme.primary};font-weight:700;">${esc(prod.name)}</span>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:flex-start;">
              <div>
                <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:240px 240px 24px 24px;overflow:hidden;box-shadow:0 16px 40px rgba(5,150,105,0.06);position:relative;">
                  <img id="wr-detail-main-img" src="${esc(prod.img)}" alt="${esc(prod.name)}" data-wr-material-image="product-main" data-wr-material-product="${esc(prod.id)}" style="width:100%;height:460px;object-fit:contain;background:#fcfcfc;display:block;">
                  <div style="position:absolute;top:20px;left:20px;background:#fff;padding:6px 14px;border-radius:999px;border:1px solid ${theme.cardBorder};font-size:0.75rem;font-weight:800;color:${theme.primary};">
                    ${esc(prod.badge)}
                  </div>
                </div>

                <div class="senseng-detail-thumbs wr-confirmed-gallery" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;margin-top:16px;">
                  <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:12px;overflow:hidden;background:#fcfcfc;padding:4px;cursor:pointer;">
                    <img src="${esc(prod.img)}" alt="Main Formulation" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:12px;overflow:hidden;background:#fcfcfc;padding:4px;cursor:pointer;">
                    <img src="${esc(products[1]?.img || prod.img)}" alt="Texture Dropper" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:12px;overflow:hidden;background:#fcfcfc;padding:4px;cursor:pointer;">
                    <img src="${esc(products[2]?.img || prod.img)}" alt="Packaging Bottle" style="width:100%;aspect-ratio:1;object-fit:contain;display:block;">
                  </button>
                </div>
              </div>

              <div>
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.06em;text-transform:uppercase;">
                  [ BIO-ACTIVE PHYTO-FORMULATION ]
                </span>
                <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.4vw, 2.6rem);font-weight:900;color:${theme.text};margin:8px 0 16px;line-height:1.2;">
                  ${esc(prod.name)}
                </h1>
                <p style="font-size:1.02rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(prod.desc)}
                </p>

                <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;margin-bottom:28px;">
                  <div style="padding:14px 20px;background:${theme.pillBg};font-size:0.8rem;font-weight:800;color:${theme.primary};">
                    PHYTOCYTE EXTRACTION &amp; PACKAGING DOSSIER
                  </div>
                  <div style="padding:20px;display:flex;flex-direction:column;gap:12px;font-size:0.88rem;">
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Key Bio-Actives:</span>
                      <strong style="color:${theme.text};">${esc(prod.material)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Vial &amp; Packaging:</span>
                      <strong style="color:${theme.text};">${esc(prod.dimensions)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:8px;">
                      <span style="color:${theme.textSub};">Microbiome Balance:</span>
                      <strong style="color:${theme.primary};">${esc(prod.extra)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:${theme.textSub};">Private Label MOQ:</span>
                      <strong style="color:${theme.text};">${esc(prod.moq)}</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:14px;">
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;flex:1;padding:16px;text-align:center;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Request Formulation Samples ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 24px;border-radius:999px;background:#fff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                    Back to Archive
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // CLINICAL TREATMENT WORKSTATION & TRANSDERMAL BENCHMARK
      mainHtml = `
        <main class="beauty-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <!-- Tier 1: Clinical Breadcrumb & Certification Badges -->
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:28px;">
              <div style="display:flex;align-items:center;gap:8px;font-family:monospace;font-size:0.8rem;color:${theme.textSub};">
                <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textSub};">CLINICAL_HUB</a>
                <span>//</span>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textSub};">MODALITY_DECK</a>
                <span>//</span>
                <span style="color:#e11d48;font-weight:800;">${esc(prod.id.toUpperCase())}</span>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span style="background:#e0f2fe;color:#0369a1;padding:4px 10px;border-radius:4px;font-family:monospace;font-size:0.72rem;font-weight:800;">ISO 13485 CLEANROOM CERTIFIED</span>
                <span style="background:#ecfdf5;color:#047857;padding:4px 10px;border-radius:4px;font-family:monospace;font-size:0.72rem;font-weight:800;">28-DAY CLINIC STUDY VALIDATED</span>
              </div>
            </div>

            <!-- Tier 2: Split Workstation -->
            <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:40px;align-items:start;margin-bottom:48px;">
              <!-- Left Column: Viewport & Optical Telemetry -->
              <div>
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(225,29,72,0.06);position:relative;">
                  <!-- Live Telemetry Status Bar -->
                  <div style="background:#e11d48;color:#ffffff;padding:8px 16px;display:flex;justify-content:space-between;font-family:monospace;font-size:0.75rem;font-weight:700;">
                    <span>[LIVE TELEMETRY] OUTPUT: 4.0 MHZ // DERMAL FLUX: 12 J/CM²</span>
                    <span>PROBE: 41.5°C</span>
                  </div>

                  <div style="position:relative;background:#fff8f8;padding:28px;display:flex;align-items:center;justify-content:center;">
                    <img id="wr-detail-main-img" src="${esc(prod.img)}" alt="${esc(prod.name)}" data-wr-material-image="product-main" data-wr-material-product="${esc(prod.id)}" style="width:100%;height:440px;object-fit:contain;display:block;">
                    <div style="position:absolute;top:20px;left:20px;background:#ffffff;border:1px solid ${theme.cardBorder};color:#e11d48;padding:6px 12px;border-radius:6px;font-family:monospace;font-size:0.75rem;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                      ${esc(prod.badge)}
                    </div>
                  </div>
                </div>

                <!-- Channel Switcher Thumbnails -->
                <div class="senseng-detail-thumbs wr-confirmed-gallery" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-top:16px;">
                  <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid #e11d48;border-radius:8px;overflow:hidden;background:#fff;padding:6px;cursor:pointer;text-align:center;">
                    <img src="${esc(prod.img)}" alt="Probe Head" style="width:100%;aspect-ratio:1.2;object-fit:contain;display:block;">
                    <span style="font-family:monospace;font-size:0.68rem;font-weight:800;color:#e11d48;display:block;margin-top:4px;">CH-1: PROBE HEAD</span>
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:8px;overflow:hidden;background:#fff;padding:6px;cursor:pointer;text-align:center;">
                    <img src="${esc(products[1]?.img || prod.img)}" alt="RF Flux" style="width:100%;aspect-ratio:1.2;object-fit:contain;display:block;">
                    <span style="font-family:monospace;font-size:0.68rem;font-weight:800;color:${theme.textSub};display:block;margin-top:4px;">CH-2: RF FLUX</span>
                  </button>
                  <button type="button" class="wr-detail-thumb" data-wr-material-thumb="" style="border:1px solid ${theme.cardBorder};border-radius:8px;overflow:hidden;background:#fff;padding:6px;cursor:pointer;text-align:center;">
                    <img src="${esc(products[2]?.img || prod.img)}" alt="Optical Emission" style="width:100%;aspect-ratio:1.2;object-fit:contain;display:block;">
                    <span style="font-family:monospace;font-size:0.68rem;font-weight:800;color:${theme.textSub};display:block;margin-top:4px;">CH-3: OPTICAL</span>
                  </button>
                </div>

                <!-- Transdermal Absorption & Dermal Remodeling Step-Curve Chart -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-top:20px;box-shadow:0 4px 16px rgba(225,29,72,0.04);">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;">
                      TRANSDERMAL ABSORPTION &amp; COLLAGEN REGENERATION DYNAMICS
                    </span>
                    <span style="font-family:monospace;font-size:0.7rem;color:#059669;font-weight:700;">DOUBLE-BLIND AUDITED</span>
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;text-align:center;">
                    <div style="background:#fff5f6;border-radius:8px;padding:12px 6px;">
                      <div style="font-size:1.15rem;font-weight:900;color:#e11d48;">0 Min</div>
                      <div style="font-size:0.7rem;font-weight:700;color:${theme.text};margin-top:2px;">Top Corneum</div>
                      <div style="font-size:0.68rem;color:${theme.textSub};margin-top:4px;">Hydration +18%</div>
                    </div>
                    <div style="background:#fff5f6;border-radius:8px;padding:12px 6px;">
                      <div style="font-size:1.15rem;font-weight:900;color:#e11d48;">5 Min</div>
                      <div style="font-size:0.7rem;font-weight:700;color:${theme.text};margin-top:2px;">Basal Layer</div>
                      <div style="font-size:0.68rem;color:${theme.textSub};margin-top:4px;">1.2mm Channeling</div>
                    </div>
                    <div style="background:#fff5f6;border-radius:8px;padding:12px 6px;">
                      <div style="font-size:1.15rem;font-weight:900;color:#e11d48;">15 Min</div>
                      <div style="font-size:0.7rem;font-weight:700;color:${theme.text};margin-top:2px;">Deep Dermis</div>
                      <div style="font-size:0.68rem;color:${theme.textSub};margin-top:4px;">3.5mm Infusion</div>
                    </div>
                    <div style="background:#ecfdf5;border-radius:8px;padding:12px 6px;">
                      <div style="font-size:1.15rem;font-weight:900;color:#047857;">28 Days</div>
                      <div style="font-size:0.7rem;font-weight:700;color:#047857;margin-top:2px;">Neocollagenesis</div>
                      <div style="font-size:0.68rem;color:#047857;margin-top:4px;">+52.4% Density</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Architecture Matrix & Clinic Fleet Calculator -->
              <div>
                <div style="display:inline-block;padding:3px 10px;border-radius:4px;background:#ffe4e6;color:#be123c;font-size:0.75rem;font-weight:800;font-family:monospace;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:10px;">
                  CLINICAL INSTRUMENT DOSSIER // MDR CLASS IIA
                </div>
                <h1 style="font-size:clamp(1.9rem, 3.2vw, 2.5rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;">
                  ${esc(prod.name)}
                </h1>
                <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(prod.desc)}
                </p>

                <!-- 4-Cell Clinical Architecture Matrix -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                  <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:14px;">
                    <div style="font-family:monospace;font-size:0.7rem;color:${theme.textSub};">ENERGY MODALITY</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};margin-top:2px;">${esc(prod.extra)}</div>
                  </div>
                  <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:14px;">
                    <div style="font-family:monospace;font-size:0.7rem;color:${theme.textSub};">EPIDERMAL CONTACT</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};margin-top:2px;">${esc(prod.material)}</div>
                  </div>
                  <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:14px;">
                    <div style="font-family:monospace;font-size:0.7rem;color:${theme.textSub};">SAFETY MECHANISM</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};margin-top:2px;">42.0°C Active Thermal Cut-off</div>
                  </div>
                  <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:14px;">
                    <div style="font-family:monospace;font-size:0.7rem;color:${theme.textSub};">REGULATORY CLEARANCE</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};margin-top:2px;">ISO 13485 · CE MDR IIa</div>
                  </div>
                </div>

                <!-- Clinic Fleet & Private Label Logistics Calculator -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(225,29,72,0.04);">
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;margin-bottom:12px;">
                    CLINIC FLEET &amp; PRIVATE LABEL LOGISTICS TIERS
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;text-align:center;">
                    <div style="background:#fff5f6;border-radius:8px;padding:12px 8px;">
                      <div style="font-size:1.15rem;font-weight:900;color:#e11d48;">50 Units</div>
                      <div style="font-size:0.72rem;color:${theme.textSub};margin-top:2px;">Evaluation Batch</div>
                    </div>
                    <div style="background:#fff5f6;border-radius:8px;padding:12px 8px;">
                      <div style="font-size:1.15rem;font-weight:900;color:#e11d48;">250 Units</div>
                      <div style="font-size:0.72rem;color:${theme.textSub};margin-top:2px;">Clinic Fleet Run</div>
                    </div>
                    <div style="background:#fff5f6;border-radius:8px;padding:12px 8px;">
                      <div style="font-size:1.15rem;font-weight:900;color:#e11d48;">1,000+ Units</div>
                      <div style="font-size:0.72rem;color:${theme.textSub};margin-top:2px;">Global Wholesale</div>
                    </div>
                  </div>
                </div>

                <!-- Action Terminal -->
                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${encodeURIComponent(prod.id)}" ${navAttrs('contact')} style="text-decoration:none;flex:1;min-width:240px;padding:16px;text-align:center;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;font-family:monospace;letter-spacing:0.03em;box-shadow:0 6px 20px ${theme.accentGlow};">
                    REQUEST CLINICAL DFM &amp; OEM DOSSIER ↗
                  </a>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 24px;border-radius:8px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.9rem;font-weight:700;">
                    Return to Deck
                  </a>
                </div>
              </div>
            </div>

            <!-- Tier 3: 4-Layer Transdermal Delivery Schematic Ribbon -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(225,29,72,0.05);">
              <div style="text-align:center;max-width:700px;margin:0 auto 28px;">
                <span style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;letter-spacing:0.06em;text-transform:uppercase;">
                  BIOPHYSICAL MECHANISM OF ACTION
                </span>
                <h3 style="font-size:1.5rem;font-weight:900;color:${theme.text};margin:6px 0 0;">
                  4-Phase Transdermal &amp; Dermal Remodeling Pathway
                </h3>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="background:#fff8f8;border:1px solid ${theme.cardBorder};border-radius:12px;padding:20px;">
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;margin-bottom:8px;">PHASE 01 // 0-2 MIN</div>
                  <h4 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;">Stratum Permeabilization</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Radiofrequency oscillation and acoustic micro-cavitation disrupt hydrophobic lipid junctions in the stratum corneum.
                  </p>
                </div>
                <div style="background:#fff8f8;border:1px solid ${theme.cardBorder};border-radius:12px;padding:20px;">
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;margin-bottom:8px;">PHASE 02 // 2-8 MIN</div>
                  <h4 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;">Lipid Channeling</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Bio-active peptide nanosomes and hyaluronic polymers migrate through transient aqueous micro-channels into the basal epidermis.
                  </p>
                </div>
                <div style="background:#fff8f8;border:1px solid ${theme.cardBorder};border-radius:12px;padding:20px;">
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;margin-bottom:8px;">PHASE 03 // 8-20 MIN</div>
                  <h4 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;">Fibroblast Activation</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Controlled 41.5°C thermal gradient triggers heat-shock chaperone protein HSP47, initiating rapid collagen triple-helix assembly.
                  </p>
                </div>
                <div style="background:#fff8f8;border:1px solid ${theme.cardBorder};border-radius:12px;padding:20px;">
                  <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#047857;margin-bottom:8px;">PHASE 04 // 28+ DAYS</div>
                  <h4 style="font-size:0.95rem;font-weight:800;color:${theme.text};margin:0 0 8px;">Neocollagenesis</h4>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">
                    Sustained Type I and Type III collagen matrix deposition with clinically measured +52.4% dermal density and tissue elasticity.
                  </p>
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
      // 1. BOTANICAL 3-COLUMN HERBARIUM SPREAD & PURITY DIALS
      mainHtml = `
        <main class="beauty-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <!-- Luxury Herbarium Centered Header -->
            <div style="text-align:center;max-width:760px;margin:0 auto 50px;">
              <div style="display:inline-block;padding:6px 18px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:0.75rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
                PHYTO-EXTRACTION LAB &amp; ORGANIC BOTANICAL ESTATE
              </div>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:400;font-style:italic;color:${theme.text};line-height:1.2;margin:0 0 16px;">
                ${esc(headline)}
              </h1>
              <div style="width:48px;height:2px;background:#059669;margin:0 auto;"></div>
            </div>

            <!-- 3-Column Botanical Herbarium Layout -->
            <div style="display:grid;grid-template-columns:0.85fr 1.15fr 1fr;gap:36px;align-items:center;margin-bottom:56px;">
              <!-- Col 1: Roman Numeral Extraction Index -->
              <div style="display:flex;flex-direction:column;gap:18px;">
                <div style="padding:18px;background:#fff;border:1px solid ${theme.cardBorder};border-radius:14px;box-shadow:0 4px 16px rgba(5,150,105,0.03);">
                  <div style="font-family:Georgia,serif;font-size:1.2rem;color:${theme.primary};font-weight:700;">I. Sourcing</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Single-origin organic harvest from mineral-rich volcanic soil.</div>
                </div>
                <div style="padding:18px;background:#fff;border:1px solid ${theme.cardBorder};border-radius:14px;box-shadow:0 4px 16px rgba(5,150,105,0.03);">
                  <div style="font-family:Georgia,serif;font-size:1.2rem;color:${theme.primary};font-weight:700;">II. Supercritical CO₂</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Low-temperature solventless extraction preserving active flavonoids.</div>
                </div>
                <div style="padding:18px;background:#fff;border:1px solid ${theme.cardBorder};border-radius:14px;box-shadow:0 4px 16px rgba(5,150,105,0.03);">
                  <div style="font-family:Georgia,serif;font-size:1.2rem;color:${theme.primary};font-weight:700;">III. Formulation</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">pH 5.5 physiological equilibrium with biomimetic lipid matrix.</div>
                </div>
              </div>

              <!-- Col 2: Arched Photo Frame -->
              <div style="border-radius:240px 240px 24px 24px;overflow:hidden;border:2px solid #a7f3d0;box-shadow:0 16px 40px rgba(4,120,87,0.08);background:#fff;">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:440px;object-fit:cover;display:block;" loading="lazy">
              </div>

              <!-- Col 3: Story Narrative & Badges -->
              <div>
                <div style="font-size:0.98rem;line-height:1.8;color:${theme.textMuted};margin-bottom:24px;">
                  ${paragraphs.map(p => `<p style="margin:0 0 16px;">${esc(p)}</p>`).join('')}
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                  <span style="padding:6px 14px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:0.75rem;font-weight:700;">100% Vegan</span>
                  <span style="padding:6px 14px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:0.75rem;font-weight:700;">Zero Parabens</span>
                  <span style="padding:6px 14px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:0.75rem;font-weight:700;">100% PCR Glass</span>
                </div>
              </div>
            </div>

            <!-- Circular Botanical Purity Dials -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${highlights.map((h, i) => `
                <div style="background:#ffffff;border:1px solid #d1fae5;border-radius:20px;padding:26px;text-align:center;box-shadow:0 8px 24px rgba(4,120,87,0.04);">
                  <div style="width:68px;height:68px;border-radius:50%;background:#ecfdf5;border:2px solid #047857;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-family:Georgia,serif;font-size:1.15rem;font-weight:800;color:#047857;">
                    ${esc(h.value)}
                  </div>
                  <div style="font-size:0.9rem;font-weight:800;color:${theme.text};margin-bottom:4px;">${esc(h.label)}</div>
                  <div style="font-size:0.76rem;color:${theme.textSub};">${esc(h.desc || '')}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    } else {
      // 2. MEDICAL DEVICE CLINICAL REPORT & 28-DAY EFFICACY BARS
      mainHtml = `
        <main class="beauty-main" data-wr-page="about" data-wr-modern-about="" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap wr-modern-about-responsive" style="padding:0 24px;">
            <!-- ISO 13485 Cleanroom Verification Header Bar -->
            <div style="background:#ffe4e6;border:1px solid #fecdd3;border-radius:8px;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
              <div style="font-size:0.78rem;font-weight:800;color:#e11d48;letter-spacing:0.06em;">
                CLINICAL INVESTIGATION REPORT · ISO 13485 ACCREDITED FACILITY
              </div>
              <div style="font-size:0.75rem;color:#9f1239;font-weight:700;">DOUBLE-BLIND DERMATOLOGICAL TRIAL</div>
            </div>
            <h1 style="font-size:clamp(2rem, 3.8vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 32px;line-height:1.2;">
              ${esc(headline)}
            </h1>

            <!-- Clinical Split: Device Console vs Trial Report -->
            <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:40px;align-items:center;margin-bottom:40px;">
              <div style="background:#fff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;box-shadow:0 12px 36px rgba(225,29,72,0.06);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:320px;object-fit:cover;border-radius:10px;display:block;" loading="lazy">
                <div style="margin-top:16px;">
                  <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};margin-bottom:8px;">OPTICAL SPECTRUM CALIBRATION</div>
                  <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;text-align:center;font-size:0.7rem;font-weight:700;">
                    <div style="background:#eff6ff;color:#2563eb;padding:6px 2px;border-radius:4px;">415nm Blue</div>
                    <div style="background:#fefce8;color:#ca8a04;padding:6px 2px;border-radius:4px;">590nm Amber</div>
                    <div style="background:#fff1f2;color:#e11d48;padding:6px 2px;border-radius:4px;">630nm Red</div>
                    <div style="background:#faf5ff;color:#9333ea;padding:6px 2px;border-radius:4px;">830nm Near-IR</div>
                  </div>
                </div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="display:inline-block;padding:4px 10px;border-radius:4px;background:#fff1f2;color:#e11d48;font-size:0.75rem;font-weight:800;margin-bottom:14px;">
                  28-DAY DERMAL STUDY SUMMARY
                </div>
                <div style="font-size:0.95rem;line-height:1.75;color:${theme.textMuted};">
                  ${paragraphs.map(p => `<p style="margin:0 0 16px;">${esc(p)}</p>`).join('')}
                </div>
              </div>
            </div>

            <!-- 28-Day Clinical Trial Efficacy Progress Bars -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
              <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};margin-bottom:20px;">STATISTICAL COLLAGEN &amp; ELASTICITY BENCHMARKS</div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
                ${highlights.map((h, i) => `
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
                      <span style="font-size:0.85rem;font-weight:800;color:${theme.text};">${esc(h.label)}</span>
                      <span style="font-size:1.6rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</span>
                    </div>
                    <div style="font-size:0.75rem;color:${theme.textSub};margin-bottom:10px;">${esc(h.desc || '')}</div>
                    <div style="width:100%;height:8px;background:#ffe4e6;border-radius:4px;overflow:hidden;">
                      <div style="width:${80 + i * 8}%;height:100%;background:linear-gradient(90deg, #f43f5e, #e11d48);border-radius:4px;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'contact') {
    const selectedProd = ctx.options.productId || '';
    if (!isVideo) {
      // PRIVATE LABEL CONSULTATION DESK
      mainHtml = `
        <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:60px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                Private Label Formulation Consultation
              </span>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 16px;">
                Start Your Clean Beauty Brand
              </h1>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;">
                Partner with our phyto-extraction laboratory for turn-key custom formulations, EU/FDA cosmetic dossiers, and sustainable PCR packaging solutions.
              </p>
            </div>

            <div style="max-width:760px;margin:0 auto;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:40px;box-shadow:0 12px 36px rgba(5,150,105,0.06);">
              <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Brand Founder / Product Director</label>
                    <input type="text" name="name" required placeholder="Dr. Elena Vance" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" required placeholder="founder@cleanbeauty.com" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Formulation Category</label>
                  <select name="productId" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                    <option value="">Full Private Label Range Consultation</option>
                    ${products.map(p => `
                      <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Packaging Preference</label>
                    <select name="packaging" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>100% PCR Recyclable Amber Glass</option>
                      <option>Bio-Based Sugar Cane Airless Pumps</option>
                      <option>Frosted European Pharmaceutical Vials</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Initial Production Batch</label>
                    <select name="volume" style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;background:#fff;">
                      <option>Pilot Launch Run (500 - 1,000 Pcs)</option>
                      <option>Commercial Growth Run (2,500 - 5,000 Pcs)</option>
                      <option>Enterprise Retail Distribution (10,000+ Pcs)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Skin Concern &amp; Regulatory Jurisdiction</label>
                  <textarea name="message" rows="4" placeholder="Mention target markets (EU CPNP, FDA MoCRA), desired botanical actives, or customized fragrance profiles..." style="width:100%;padding:12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.9rem;box-sizing:border-box;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:16px;border-radius:999px;border:none;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                  Submit Formulation Consultation Request ↗
                </button>
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      // TWO-COLUMN AESTHETIC DEVICE OEM & CLINICAL FORMULATION RFQ TERMINAL
      mainHtml = `
        <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 90px;">
          <div class="wrap" style="padding:0 24px;">
            <!-- Top Status Bar -->
            <div style="background:#e11d48;color:#ffffff;padding:10px 20px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:0.78rem;font-weight:700;flex-wrap:wrap;gap:10px;">
              <span>[AESTHETIC MEDICAL OEM PORTAL] // ISO 13485 CLEANROOM DISPATCH</span>
              <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;">CE MDR &amp; FDA 510(K) AUDIT READY</span>
            </div>

            <!-- Main Workstation Box -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-top:none;border-radius:0 0 16px 16px;padding:36px;box-shadow:0 12px 36px rgba(225,29,72,0.06);margin-bottom:40px;">
              <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:40px;align-items:start;">
                <!-- Left Column: Cleanroom Capabilities & Engineering Advisory -->
                <div>
                  <div style="margin-bottom:28px;">
                    <span style="display:inline-block;padding:3px 10px;border-radius:4px;background:#ffe4e6;color:#be123c;font-size:0.75rem;font-weight:800;font-family:monospace;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:10px;">
                      Cleanroom Contract Engineering
                    </span>
                    <h1 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;line-height:1.2;">
                      Aesthetic Device &amp; Formulation OEM Portal
                    </h1>
                    <p style="font-size:0.92rem;color:${theme.textMuted};line-height:1.7;margin:0;">
                      Initiate custom optical wavelength diode binning, multi-polar RF PCB simulations, titanium probe CNC hydroforming, and international medical regulatory filings.
                    </p>
                  </div>

                  <!-- Cleanroom Protocol Checklist -->
                  <div style="background:#fff8f8;border:1px solid ${theme.cardBorder};border-radius:12px;padding:20px;margin-bottom:24px;">
                    <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;margin-bottom:14px;letter-spacing:0.04em;">
                      CLEANROOM &amp; REGULATORY CAPABILITIES (INCLUDED)
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.85rem;color:${theme.text};">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:#e11d48;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:900;flex-shrink:0;">✓</span>
                        <span><strong>Class 10,000 Cleanroom:</strong> Automated SMT placement and sterile medical assembly</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:#e11d48;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:900;flex-shrink:0;">✓</span>
                        <span><strong>Optical Diode Calibration:</strong> High-precision spectral binning within ±1.5nm</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:#e11d48;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:900;flex-shrink:0;">✓</span>
                        <span><strong>Multi-Polar RF Circuit Simulation:</strong> Thermal dissipation and impedance control</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:#e11d48;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:900;flex-shrink:0;">✓</span>
                        <span><strong>Global Regulatory Dossiers:</strong> CE MDR Class IIa, FDA 510(k), and CB/IEC 60601-1</span>
                      </div>
                    </div>
                  </div>

                  <!-- Direct Clinical Engineering Liaison Card -->
                  <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:20px;">
                    <div style="font-family:monospace;font-size:0.75rem;font-weight:800;color:#e11d48;margin-bottom:10px;">
                      DIRECT CLINICAL ENGINEERING DESK
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.82rem;">
                      <div>
                        <span style="color:${theme.textSub};display:block;font-size:0.72rem;text-transform:uppercase;">Response SLA</span>
                        <strong style="color:${theme.text};">&lt; 4 Working Hours</strong>
                      </div>
                      <div>
                        <span style="color:${theme.textSub};display:block;font-size:0.72rem;text-transform:uppercase;">CAD / PCB Formats</span>
                        <strong style="color:${theme.text};">STEP, Altium, Gerber, DWG</strong>
                      </div>
                      <div>
                        <span style="color:${theme.textSub};display:block;font-size:0.72rem;text-transform:uppercase;">Cleanroom Desk</span>
                        <strong style="color:${theme.text};">${esc(company.email || 'clinical-oem@lumina-med.com')}</strong>
                      </div>
                      <div>
                        <span style="color:${theme.textSub};display:block;font-size:0.72rem;text-transform:uppercase;">Prototyping Lead</span>
                        <strong style="color:${theme.text};">12 - 15 Calendar Days</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Interactive Clinical RFQ Console -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;padding:28px;box-shadow:0 4px 20px rgba(225,29,72,0.04);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid ${theme.cardBorder};padding-bottom:12px;">
                    <span style="font-weight:800;font-size:0.95rem;color:${theme.text};">CLINICAL OEM SPECIFICATION FORM</span>
                    <span style="font-family:monospace;font-size:0.75rem;color:#e11d48;font-weight:700;">FORM_ID: RFQ-MED2026</span>
                  </div>

                  <form id="inquiry" action="/inquiry" method="post" style="display:flex;flex-direction:column;gap:18px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                      <div>
                        <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;color:${theme.text};">Procurement Officer / Title</label>
                        <input type="text" name="name" required placeholder="Clinic Procurement Director" style="width:100%;padding:11px 12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.88rem;box-sizing:border-box;background:#f8fafc;">
                      </div>
                      <div>
                        <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;color:${theme.text};">Corporate Work Email</label>
                        <input type="email" name="email" required placeholder="procurement@medclinic.com" style="width:100%;padding:11px 12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.88rem;box-sizing:border-box;background:#f8fafc;">
                      </div>
                    </div>

                    <div>
                      <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;color:${theme.text};">Selected Modality Architecture</label>
                      <select name="productId" style="width:100%;padding:11px 12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.88rem;box-sizing:border-box;background:#ffffff;">
                        <option value="">General Custom Aesthetic Device Platform (All Modalities)</option>
                        ${products.map(p => `
                          <option value="${esc(p.id)}"${selectedProd === p.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.extra)}</option>
                        `).join('')}
                      </select>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                      <div>
                        <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;color:${theme.text};">Medical Regulatory Standard</label>
                        <select name="certification" style="width:100%;padding:11px 12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.88rem;box-sizing:border-box;background:#ffffff;">
                          <option>CE Medical Directive (MDR Class IIa)</option>
                          <option>FDA 510(k) Cleared Platform</option>
                          <option>CB / IEC 60601-1 Electrical Safety</option>
                          <option>Cosmetic GMP / ISO 22716 Cleanroom</option>
                        </select>
                      </div>
                      <div>
                        <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;color:${theme.text};">Deployment Volume Tier</label>
                        <select name="volume" style="width:100%;padding:11px 12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.88rem;box-sizing:border-box;background:#ffffff;">
                          <option>Evaluation Pilot Batch (50 - 100 Units)</option>
                          <option>Regional Clinic Fleet (200 - 500 Units)</option>
                          <option>Global Wholesale Program (1,000+ Units)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;color:${theme.text};">OEM Customization &amp; Firmware Specs</label>
                      <textarea name="message" rows="4" placeholder="Detail custom logo placement on titanium probe, localized UI languages, custom frequency profiles, or packaging constraints..." style="width:100%;padding:11px 12px;border:1px solid ${theme.cardBorder};border-radius:8px;font-size:0.88rem;box-sizing:border-box;resize:vertical;background:#f8fafc;"></textarea>
                    </div>

                    <button type="submit" style="padding:15px;border-radius:8px;border:none;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;font-family:monospace;letter-spacing:0.03em;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};transition:all 0.2s ease;">
                      TRANSMIT CLINICAL OEM SPECIFICATION ↗
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  }

  // Common Footer
  const footerHtml = `
    <footer style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;color:${theme.textMuted};font-size:0.85rem;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.1rem;font-weight:900;color:${theme.text};margin-bottom:10px;">${esc(brandName)}</div>
            <p style="margin:0;line-height:1.6;max-width:340px;color:${theme.textSub};">${esc(brandTagline)}</p>
          </div>
          <div>
            <div style="font-weight:800;color:${theme.text};margin-bottom:12px;text-transform:uppercase;font-size:0.75rem;">Navigation</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textSub};">Home</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textSub};">Catalog</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textSub};">About</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textSub};">Contact</a>
            </div>
          </div>
          <div>
            <div style="font-weight:800;color:${theme.text};margin-bottom:12px;text-transform:uppercase;font-size:0.75rem;">${isVideo ? 'Medical Cleanroom &amp; OEM Desk' : 'Compliance &amp; Export'}</div>
            <div style="color:${theme.textSub};line-height:1.6;">
              <div>${esc(company.address || (isVideo ? 'Medical Aesthetic Technology Park, Optical Cleanroom Zone' : 'Cosmetic Science Park, Life Sciences Corridor'))}</div>
              <div>${esc(company.email || (isVideo ? 'clinical-oem@lumina-med.com' : 'compliance@clean-beauty-lab.com'))}</div>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid ${theme.cardBorder};padding-top:20px;display:flex;justify-content:space-between;font-size:0.78rem;color:${theme.textSub};">
          <span>&copy; ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved.</span>
          <span>Certified Clean Formulations &amp; Medical Aesthetic Devices</span>
        </div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
