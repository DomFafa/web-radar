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
    tagline: 'Bio-Identical Lipid Barrier Restore',
    img: getIndustryPlaceholder('beauty', 1),
  },
  {
    id: 'bt-3',
    name: 'Velvet Matte Transfer-Proof Lip Color',
    desc: 'Micro-milled pigment in a weightless velvet-matte formula with vitamin E conditioning and 12-hour transfer-proof wear.',
    badge: 'Long-Wear Matte',
    category: 'lipstick',
    categoryNameZh: '',
    categoryNameEn: 'Lip Colors',
    material: 'Micro-Milled Pigment + Vitamin E',
    dimensions: '3.5g Magnetic Tube',
    extra: '12H Transfer-Proof',
    moq: '2000 Units',
    tagline: 'Weightless Velvet-Matte Finish',
    img: getIndustryPlaceholder('beauty', 2),
  },
  {
    id: 'bt-4',
    name: 'Pro 18-Shade Eyeshadow Palette',
    desc: 'Curated palette with 18 micro-milled shades in matte, shimmer, and metallic finishes with buildable color payoff.',
    badge: 'Artistry Palette',
    category: 'palette',
    categoryNameZh: '',
    categoryNameEn: 'Eye Palettes',
    material: 'Talc-Free Micro-Milled Pigments',
    dimensions: '180 × 120 × 15 mm',
    extra: 'Vegan & Cruelty-Free',
    moq: '500 Units',
    tagline: 'Talc-Free Micro-Milled Formula',
    img: getIndustryPlaceholder('beauty', 3),
  },
  {
    id: 'bt-5',
    name: 'Bio-Cellulose Hydrating Sheet Mask',
    desc: 'Coconut-fermented bio-cellulose fiber mask saturated with centella asiatica and panthenol for intensive hydration.',
    badge: 'Fermented Fiber',
    category: 'mask',
    categoryNameZh: '',
    categoryNameEn: 'Sheet Masks',
    material: 'Coconut Bio-Cellulose Fiber',
    dimensions: '25ml Per Sheet · Box of 10',
    extra: 'Centella + Panthenol',
    moq: '3000 Boxes',
    tagline: 'Coconut-Fermented Bio Fiber',
    img: getIndustryPlaceholder('beauty', 4),
  },
  {
    id: 'bt-6',
    name: 'Gentle Amino Acid Foam Cleanser',
    desc: 'pH 5.5 balanced facial cleanser with apple amino acids and chamomile extract for thorough cleansing without stripping moisture.',
    badge: 'pH 5.5 Balanced',
    category: 'cleanser',
    categoryNameZh: '',
    categoryNameEn: 'Cleansers',
    material: 'Apple Amino Acid + Chamomile',
    dimensions: '150ml Pump Bottle',
    extra: 'Sulfate & Paraben Free',
    moq: '1000 Units',
    tagline: 'pH 5.5 Barrier-Safe Cleansing',
    img: getIndustryPlaceholder('beauty', 5),
  },
  {
    id: 'bt-7',
    name: 'Rose Quartz Facial Sculpting Gua Sha',
    desc: 'Hand-carved 100% natural Grade-A rose quartz gua sha tool for lymphatic drainage, facial contouring, and serum absorption.',
    badge: 'Natural Crystal',
    category: 'tools',
    categoryNameZh: '',
    categoryNameEn: 'Beauty Tools',
    material: 'Grade-A Natural Rose Quartz',
    dimensions: '80 × 55 × 6 mm',
    extra: 'Hand-Polished Finish',
    moq: '500 Pcs',
    tagline: 'Hand-Carved Grade-A Crystal',
    img: getIndustryPlaceholder('beauty', 6),
  },
  {
    id: 'bt-8',
    name: 'Mineral Zinc Sheer Sunscreen SPF 50+',
    desc: 'Non-nano zinc oxide mineral sunscreen with broad-spectrum UVA/UVB SPF 50+ PA++++ protection and zero white cast.',
    badge: 'Reef Safe',
    category: 'sunscreen',
    categoryNameZh: '',
    categoryNameEn: 'Sun Protection',
    material: 'Non-Nano Zinc Oxide (20.5%)',
    dimensions: '50ml Airless Tube',
    extra: 'Reef-Safe Formula',
    moq: '1500 Units',
    tagline: 'Non-Nano Mineral Sun Shield',
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

  const brandName = company.name || (isVideo ? 'DermaGlow Clinical Tech' : 'Botanica Pure Skincare Lab');
  const brandTagline = isVideo ? 'Clinical Aesthetic Devices & Phototherapy' : 'Clean Botanical Formulations & Bio-Actives';

  // Light Palettes Only - No dark mode
  const theme = isVideo
    ? {
      bg: '#faf8ff',
      cardBg: '#ffffff',
      cardBorder: 'rgba(124,58,237,0.14)',
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      text: '#1e1b4b',
      textMuted: '#4b5563',
      textSub: '#6b7280',
      glassBg: 'rgba(250,248,255,0.92)',
      pillBg: '#ede9fe',
      pillText: '#6d28d9',
      btnGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      accentGlow: 'rgba(124,58,237,0.18)',
    }
    : {
      bg: '#fffafb',
      cardBg: '#ffffff',
      cardBorder: 'rgba(190,18,60,0.12)',
      primary: '#be123c',
      primaryHover: '#9f1239',
      text: '#1c1917',
      textMuted: '#4b5563',
      textSub: '#6b7280',
      glassBg: 'rgba(255,250,251,0.92)',
      pillBg: '#ffe4e6',
      pillText: '#be123c',
      btnGradient: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)',
      accentGlow: 'rgba(190,18,60,0.18)',
    };

  // Distinct Header
  const headerHtml = isVideo ? `
    <header class="beauty-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(124,58,237,0.04);">
      <div style="background:#ede9fe;padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:700;">
        <div>CLINICAL BEAUTY DEVICES · CE & FDA CERTIFIED FACTORY</div>
        <div>OEM/ODM MOLD CUSTOMIZATION READY</div>
      </div>
      <div class="wrap" style="height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.18rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};">${esc(brandName)}</span>
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
            Device RFQ ↗
          </a>
        </div>
      </div>
    </header>
  ` : `
    <header class="beauty-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 24px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
            Request Samples ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // CLINICAL BEAUTY DEVICE SPLIT-SCREEN VIDEO CONSOLE
      mainHtml = `
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;padding:70px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Clinical Aesthetic Engineering · RF + Microcurrent + LED
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Clinical Facial Contouring: Multi-Wavelength Phototherapy')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Engineered with 1.2 MHz bipolar radio frequency, 350 μA microcurrent, and dual-band 630nm/850nm phototherapy for non-invasive skin tightening.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:34px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Explore Beauty Devices ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    Clinical Trial Dossier
                  </a>
                </div>
                <!-- Technical Parameters -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">1.2 MHz</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Bipolar RF Energy</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">630/850nm</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">LED Dual Phototherapy</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">ISO 13485</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};font-weight:600;">Medical Cleanroom Facility</div>
                  </div>
                </div>
              </div>

              <!-- Video Console Display -->
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:2px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(124,58,237,0.12);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:380px;object-fit:contain;padding:24px;display:block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;left:16px;background:${theme.glassBg};backdrop-filter:blur(10px);color:${theme.primary};padding:6px 12px;border-radius:6px;font-size:0.72rem;font-weight:800;border:1px solid ${theme.cardBorder};">
                    CLINICAL DEMO
                  </div>
                </div>
                <div style="position:absolute;bottom:-18px;left:20px;right:20px;background:#ffffff;border-radius:12px;padding:16px 20px;border:1px solid ${theme.cardBorder};display:flex;align-items:center;justify-content:space-between;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div>
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Flagship Aesthetic Apparatus</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                  </div>
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;">View Specs ↗</a>
                </div>
              </div>
            </div>
          </section>

          <!-- Clinical Efficacy Proof -->
          <section style="padding:70px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;margin-bottom:44px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Clinical Benchmarks</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:8px 0 0;">Dermatological Laboratory Testing</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">+38% Collagen Density</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Thermal collagen remodeling at 42°C measured via high-frequency ultrasonic dermal scanning.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">-24% Fine Line Depth</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">3D profilometry analysis demonstrating visible smoothing of periorbital and nasolabial wrinkles.</div>
                </div>
                <div style="padding:24px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">Biocompatible Probes</div>
                  <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;">Medical-grade titanium contact electrodes with hypoallergenic micro-current conduction surfaces.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Product Catalog -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;">Clinical Apparatus Catalog</div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Aesthetic & Personal Care Devices</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${theme.primary};">All Devices (RFQ) →</a>
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
                          <span style="font-size:0.8rem;font-weight:800;color:${theme.primary};">Device Inquiry ↗</span>
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
      // CENTERED EDITORIAL MAGAZINE & BOTANICAL TRIPTYCH HERO
      mainHtml = `
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Centered Editorial Botanical Hero -->
          <section style="position:relative;padding:90px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;text-align:center;max-width:880px;margin:0 auto;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;">
                ✦ Clean Botanical Formulations · Dermatologist Certified
              </div>
              <h1 style="font-family:Georgia,serif;font-size:clamp(2.5rem, 5vw, 4rem);font-weight:900;line-height:1.1;color:${theme.text};letter-spacing:-0.02em;margin:0 0 20px;">
                ${esc(draft.copy[ctx.lang]?.headline || 'Pure Botanical Bio-Actives: Clean Skincare Science')}
              </h1>
              <p style="font-size:1.12rem;line-height:1.8;color:${theme.textMuted};margin:0 auto 34px;max-width:680px;">
                ${esc(draft.copy[ctx.lang]?.subtitle || 'Formulated with bio-identical ceramides, multi-weight hyaluronic complexes, and cold-pressed botanical extracts for radiant skin barrier health.')}
              </p>
              <div style="display:flex;justify-content:center;gap:16px;margin-bottom:50px;flex-wrap:wrap;">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 36px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 24px ${theme.accentGlow};">
                  Explore Skincare Formulations ↗
                </a>
                <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:16px 30px;border-radius:999px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                  Ingredient Transparency
                </a>
              </div>
            </div>

            <!-- Triptych Botanical Showcase -->
            <div class="wrap" style="padding:0 24px;">
              <div style="display:grid;grid-template-columns:1fr 1.6fr 1fr;gap:24px;align-items:center;max-width:1080px;margin:0 auto;">
                <div style="aspect-ratio:3/4;border-radius:20px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 30px rgba(0,0,0,0.04);">
                  <img src="${esc(products[1]?.img || heroProduct.img)}" alt="Botanical Active Extract" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </div>
                <div style="aspect-ratio:4/5;border-radius:28px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(190,18,60,0.08);position:relative;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:cover;" fetchpriority="high">
                  <div style="position:absolute;bottom:20px;left:20px;right:20px;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border-radius:14px;padding:14px 20px;border:1px solid ${theme.cardBorder};text-align:left;">
                    <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">Flagship Formulation</div>
                    <div style="font-family:Georgia,serif;font-size:1.05rem;font-weight:800;color:${theme.text};">${esc(heroProduct.name)}</div>
                  </div>
                </div>
                <div style="aspect-ratio:3/4;border-radius:20px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 30px rgba(0,0,0,0.04);">
                  <img src="${esc(products[2]?.img || heroProduct.img)}" alt="Clinical Lab Purity" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </div>
              </div>
            </div>
          </section>

          <!-- Ingredient Transparency Index -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:640px;margin:0 auto 48px;">
                <span style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;">Bio-Active Index</span>
                <h2 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};margin:8px 0 12px;">Active Ingredient Transparency</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
                <div style="padding:26px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.8rem;color:${theme.primary};margin-bottom:6px;">2.5% HA</div>
                  <h3 style="font-size:0.92rem;font-weight:800;margin:0 0 6px;">Triple-Weight Hyaluronic</h3>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">Deep dermal water binding with three distinct molecular weight distributions.</p>
                </div>
                <div style="padding:26px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.8rem;color:${theme.primary};margin-bottom:6px;">1.8% Ceramide</div>
                  <h3 style="font-size:0.92rem;font-weight:800;margin:0 0 6px;">Bio-Identical NP/AP</h3>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">Lipid barrier replenishing complex matching human skin lipid ratios.</p>
                </div>
                <div style="padding:26px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.8rem;color:${theme.primary};margin-bottom:6px;">95% Purity</div>
                  <h3 style="font-size:0.92rem;font-weight:800;margin:0 0 6px;">Centella Asiatica</h3>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">Concentrated madecassoside for rapid soothing of environmental stress.</p>
                </div>
                <div style="padding:26px;border-radius:16px;background:${theme.bg};border:1px solid ${theme.cardBorder};text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:1.8rem;color:${theme.primary};margin-bottom:6px;">5.0% B3</div>
                  <h3 style="font-size:0.92rem;font-weight:800;margin:0 0 6px;">Niacinamide Vitamin</h3>
                  <p style="font-size:0.8rem;color:${theme.textMuted};line-height:1.6;margin:0;">Clinical strength tone evening and pore refinement with zero flushing.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Editorial Skincare Shelf -->
          <section style="padding:90px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:48px;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;">Curated Formulations</div>
                  <h2 style="font-family:Georgia,serif;font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:${theme.text};margin:6px 0 0;">Skin & Personal Care Formulations</h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${theme.primary};">Full Formula Catalog →</a>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 8).map(p => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(190,18,60,0.04);transition:transform 0.3s;">
                    <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                      <div style="aspect-ratio:1;background:${theme.bg};position:relative;overflow:hidden;">
                        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;padding:20px;">
                        <span style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,0.92);color:${theme.primary};font-size:0.7rem;font-weight:800;padding:4px 12px;border-radius:999px;border:1px solid ${theme.cardBorder};">${esc(p.badge)}</span>
                      </div>
                      <div style="padding:22px;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                        <h3 style="font-family:Georgia,serif;font-size:1.05rem;font-weight:900;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h3>
                        <p style="font-size:0.82rem;color:${theme.textMuted};line-height:1.6;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid ${theme.cardBorder};">
                          <span style="font-size:0.78rem;color:${theme.textSub};">MOQ: ${esc(p.moq)}</span>
                          <span style="font-size:0.82rem;font-weight:800;color:${theme.primary};">Formulation Details ↗</span>
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
      <main class="beauty-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.catalog)} · Complete Export Assortment
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">
              ${isVideo ? 'Clinical Beauty & Aesthetic Devices' : 'Botanical Skincare & Personal Care Formulations'}
            </h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Custom packaging, private label branding, and clinical dossier support on all SKUs.</p>
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
                    <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">Formulation & MOQ ↗</div>
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
      <main class="beauty-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
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
                <h3 style="font-size:0.88rem;font-weight:800;text-transform:uppercase;color:${theme.text};margin:0 0 14px;">Formulation & Packaging Specs</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.85rem;color:${theme.textMuted};">
                  <div><strong>Active Complex:</strong><br>${esc(p.material)}</div>
                  <div><strong>Packaging:</strong><br>${esc(p.dimensions)}</div>
                  <div><strong>Certification:</strong><br>${esc(p.extra)}</div>
                  <div><strong>Production MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                </div>
              </div>

              <div style="display:flex;gap:14px;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                  Request Sample Batch ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:10px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                  Private Label OEM
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, `${company.name} · Certified Cosmeceutical Laboratory`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2015', num: 2015, label: 'Established', desc: 'Continuous lab operation' },
      { value: 'ISO 22716', num: 22716, label: 'GMP Cleanroom', desc: 'Cosmetic ISO certified' },
      { value: '100% Vegan', num: 100, label: 'Cruelty-Free', desc: 'Clean formulations' },
      { value: '60+ Markets', num: 60, label: 'Global Compliance', desc: 'FDA & CPNP registered' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="beauty-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                ${esc(ui.about)} · Lab Heritage
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
            <h2 style="font-size:1.3rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Formulate With Our Chemists</h2>
            <p style="font-size:0.92rem;color:${theme.textMuted};margin:0 0 20px;">Contact our laboratory for bulk active formulas, stability testing, custom fragrance blends, and turnkey export packaging.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:12px 28px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.9rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
              Initiate Cosmetic RFQ ↗
            </a>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'contact') {
    mainHtml = `
      <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
        <section class="wrap" style="padding:40px 24px 80px;">
          <header style="text-align:center;max-width:620px;margin:0 auto 48px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
              ${esc(ui.contact)} · B2B Sourcing Desk
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 10px;">Submit Your Formulation Request</h1>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Direct factory formulation consultation with stability sample dispatch within 5 business days.</p>
          </header>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
              <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Request For Quotation</h2>
              <form style="display:grid;gap:16px;">
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Product / Formulation of Interest</label>
                  <select name="productId" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    <option value="">— Select Formula / SKU (Optional) —</option>
                    ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Target Batch Size</label>
                    <input type="text" disabled placeholder="e.g. 1000 Units" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Packaging Preference</label>
                    <input type="text" disabled placeholder="Airless Pump / Dropper / Jar" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                </div>
                <div>
                  <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:6px;">Custom Formulation Requirements</label>
                  <textarea disabled rows="4" placeholder="Mention desired active ingredients, fragrance-free requirements, or target market regulatory needs (FDA / EU CPNP)..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                </div>
                <button type="submit" disabled style="padding:14px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 14px ${theme.accentGlow};">
                  Submit Cosmetic Inquiry ↗
                </button>
              </form>
            </div>

            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <h2 style="font-size:1.15rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Regulatory & Lab Compliance</h2>
                <p style="font-size:0.9rem;color:${theme.textMuted};line-height:1.7;margin:0 0 20px;">
                  We provide complete CPSR (Cosmetic Product Safety Report), MSDS documentation, PIF dossier preparation, and heavy metal challenge testing for international market compliance.
                </p>
                <div style="font-size:0.85rem;color:${theme.textMuted};line-height:1.8;">
                  <div><strong>Company:</strong> ${esc(company.name || brandName)}</div>
                  <div><strong>Email:</strong> ${esc(company.email || 'cosmetics@beautysourcing.com')}</div>
                  <div><strong>Cleanroom Standard:</strong> Class 100,000 ISO 22716 GMP</div>
                  <div><strong>Certifications:</strong> FDA VCRP, EU CPNP, Vegan Registered</div>
                </div>
              </div>
              <div style="padding:16px;background:${theme.bg};border-radius:10px;font-size:0.78rem;color:${theme.textSub};line-height:1.5;margin-top:24px;">
                🌿 Stability Verified: Every formulation undergoes 12-week accelerated thermal stability & preservative efficacy challenge testing.
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="beauty-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;color:${theme.textSub};font-size:0.84rem;">
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
            <div>✓ ISO 22716 Cosmetics GMP</div>
            <div>✓ Cruelty-Free & Vegan Formulation</div>
            <div>✓ FDA & EU CPNP Dossier Ready</div>
          </div>
        </div>
      </div>
      <div class="wrap" style="padding:0 24px;border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;align-items:center;justify-content:space-between;font-size:0.78rem;">
        <div>© ${new Date().getFullYear()} ${esc(brandName)}. All rights reserved. Cosmeceutical Export Portal.</div>
        <div style="display:flex;gap:16px;">
          <span>Class 100K Cleanroom</span>
          <span>Dermatologist Tested</span>
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
