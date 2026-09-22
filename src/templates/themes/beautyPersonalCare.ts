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
    if (!isVideo) {
      // Botanical Skincare Formulation Catalog
      mainHtml = `
        <main class="beauty-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${theme.cardBorder};padding-bottom:24px;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">
                  Bio-Active Archive · Clean Skincare Dossier
                </div>
                <h1 style="font-size:clamp(1.9rem, 3.5vw, 2.6rem);font-weight:900;color:${theme.text};margin:0;letter-spacing:-0.02em;">
                  Botanical Skincare &amp; Formulation Catalog
                </h1>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.8rem;font-weight:700;">
                <span style="padding:6px 14px;border-radius:20px;background:${theme.primary};color:#fff;">All Formulations (${products.length})</span>
                <span style="padding:6px 14px;border-radius:20px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Serums &amp; Elixirs</span>
                <span style="padding:6px 14px;border-radius:20px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Barrier Creams</span>
                <span style="padding:6px 14px;border-radius:20px;background:${theme.cardBg};color:${theme.textMuted};border:1px solid ${theme.cardBorder};">Clean Cleansers</span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:28px;">
              ${products.map(p => `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(157,78,221,0.04);transition:transform 0.2s ease;">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.05;background:#fcfbf9;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:80%;height:80%;object-fit:contain;transition:transform 0.3s ease;">
                      <span style="position:absolute;top:12px;left:12px;background:#fff;border:1px solid ${theme.cardBorder};color:${theme.primary};font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:4px;">${esc(p.badge)}</span>
                      <span style="position:absolute;bottom:12px;right:12px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;">100% Vegan</span>
                    </div>
                    <div style="padding:20px;">
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${esc(p.categoryNameEn)}</div>
                      <h2 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h2>
                      <p style="font-size:0.82rem;color:${theme.textMuted};margin:0 0 14px;line-height:1.5;">${esc(p.desc)}</p>
                      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px dashed ${theme.cardBorder};padding-top:12px;font-size:0.78rem;">
                        <span style="color:${theme.textSub};font-weight:600;">MOQ: <strong style="color:${theme.text};">${esc(p.moq)}</strong></span>
                        <span style="color:${theme.primary};font-weight:800;">Request Formula Sample ↗</span>
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
      // Clinical Aesthetic Device Catalog
      mainHtml = `
        <main class="beauty-main" data-wr-page="catalog" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:24px 32px;margin-bottom:32px;box-shadow:0 4px 20px rgba(99,102,241,0.03);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
                  Phototherapy &amp; Microcurrent Devices · Active SKUs (${products.length})
                </div>
                <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);font-weight:900;color:${theme.text};margin:0;">
                  Clinical Beauty &amp; Aesthetic Devices
                </h1>
              </div>
              <div style="display:flex;gap:12px;align-items:center;font-size:0.8rem;color:${theme.textMuted};">
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Spectra:</strong> 630nm / 415nm / 850nm
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};">
                  <strong>Probe:</strong> Medical Titanium
                </span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:24px;">
              ${products.map(p => `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(99,102,241,0.04);">
                  <a href="${path('products/' + p.id + '/index.html')}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;">
                    <div style="aspect-ratio:1.2;background:#fbfbfe;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${theme.cardBorder};">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:75%;height:75%;object-fit:contain;">
                      <div style="position:absolute;top:10px;left:10px;display:flex;gap:6px;">
                        <span style="background:${theme.primary};color:#fff;font-size:0.68rem;font-weight:800;padding:2px 6px;border-radius:4px;">${esc(p.badge)}</span>
                      </div>
                      <div style="position:absolute;bottom:8px;left:10px;right:10px;display:flex;justify-content:space-between;background:rgba(255,255,255,0.92);backdrop-filter:blur(4px);padding:4px 8px;border-radius:6px;font-size:0.68rem;font-weight:700;color:${theme.primary};">
                        <span>LED PHOTOTHERAPY</span>
                        <span>MICROCURRENT 1-5</span>
                      </div>
                    </div>
                    <div style="padding:18px;">
                      <div style="font-size:0.7rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${esc(p.categoryNameEn)}</div>
                      <h2 style="font-size:1rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.3;">${esc(p.name)}</h2>
                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:${theme.bg};padding:10px;border-radius:8px;margin-bottom:14px;font-size:0.75rem;color:${theme.textMuted};">
                        <div><strong>Active Tech:</strong> ${esc(p.material.slice(0, 18))}...</div>
                        <div><strong>MOQ:</strong> <span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                        <div><strong>Form:</strong> ${esc(p.dimensions.slice(0, 16))}</div>
                        <div><strong>Standard:</strong> CE / Medical</div>
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;font-weight:700;color:${theme.primary};">
                        <span>Inspect Clinical Efficacy Dossier</span>
                        <span>↗</span>
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
      // Botanical Skincare Detail Page
      mainHtml = `
        <main class="beauty-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Botanical Skincare Archive
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(300px, 1fr) minmax(340px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:24px;padding:36px;position:relative;box-shadow:0 12px 32px rgba(157,78,221,0.05);text-align:center;">
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:460px;object-fit:contain;display:inline-block;" fetchpriority="high">
                  <div style="position:absolute;top:16px;right:16px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:6px;">
                    Organic Botanical Active
                  </div>
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:54px;height:54px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <div style="margin-top:24px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:20px;display:flex;justify-content:space-around;text-align:center;font-size:0.78rem;">
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">ISO 22716</div>
                    <div style="color:${theme.textSub};">GMP Cleanroom</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">100% Vegan</div>
                    <div style="color:${theme.textSub};">Cruelty-Free</div>
                  </div>
                  <div style="width:1px;background:${theme.cardBorder};"></div>
                  <div>
                    <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">${esc(p.moq)}</div>
                    <div style="color:${theme.textSub};">Batch Minimum</div>
                  </div>
                </div>
              </div>

              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · Cosmeceutical Formula
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.05rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:24px;margin-bottom:28px;">
                  <h3 style="font-size:0.9rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};margin:0 0 16px;">
                    Formulation &amp; Regulatory Dossier
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.85rem;">
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Bio-Active Complex</span>
                      <strong style="color:${theme.text};">${esc(p.material)}</strong>
                    </div>
                    <div style="border-bottom:1px dashed ${theme.cardBorder};padding-bottom:10px;">
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Packaging Format</span>
                      <strong style="color:${theme.text};">${esc(p.dimensions)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Safety Certification</span>
                      <strong style="color:${theme.text};">${esc(p.extra)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;margin-bottom:3px;">Production Batch MOQ</span>
                      <strong style="color:${theme.primary};">${esc(p.moq)}</strong>
                    </div>
                  </div>
                </div>

                <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:16px;padding:20px;margin-bottom:28px;">
                  <h4 style="font-size:0.85rem;font-weight:800;color:#6b21a8;margin:0 0 6px;">Private Label Turnkey Services</h4>
                  <p style="font-size:0.82rem;color:#581c87;margin:0;line-height:1.6;">
                    We provide stock and custom formula compounding, EU CPNP cosmetic notification, US FDA VCRP listing, and sustainable PCR cosmetic packaging with bespoke silk-screen printing.
                  </p>
                </div>

                <div style="display:flex;gap:16px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:15px 34px;border-radius:12px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    Request Lab Batch Samples ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 26px;border-radius:12px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                    Download Safety Dossier (MSDS)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // Clinical Aesthetic Device Detail Page
      mainHtml = `
        <main class="beauty-main" data-wr-page="detail" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:28px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.88rem;font-weight:800;color:${theme.primary};display:inline-flex;align-items:center;gap:6px;">
                ← Return to Clinical Aesthetic Device Catalog
              </a>
            </div>

            <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:50px;align-items:start;margin-bottom:60px;">
              <div>
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:32px;box-shadow:0 8px 30px rgba(99,102,241,0.05);position:relative;">
                  <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:${theme.primary};font-weight:800;margin-bottom:12px;">
                    <span>OPTICAL SPECTRUM: 630/415/850nm</span>
                    <span>TITANIUM PROBE</span>
                  </div>
                  <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:440px;object-fit:contain;display:block;" fetchpriority="high">
                  <div class="wr-detail-thumbs" style="display:flex;justify-content:center;gap:12px;margin-top:20px;">
                    <button type="button" class="wr-detail-thumb active" data-wr-material-thumb="" style="border:2px solid ${theme.primary};border-radius:8px;padding:4px;background:#fff;cursor:pointer;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:50px;height:50px;object-fit:cover;">
                    </button>
                  </div>
                </div>

                <div style="margin-top:20px;background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:20px;">
                  <div style="font-size:0.78rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:10px;">
                    28-Day Human Clinical Trial Metrics (n=64)
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;text-align:center;font-size:0.75rem;">
                    <div style="background:${theme.bg};padding:10px 4px;border-radius:8px;">
                      <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;">+42%</div>
                      <div style="color:${theme.textSub};">Collagen Density</div>
                    </div>
                    <div style="background:${theme.bg};padding:10px 4px;border-radius:8px;">
                      <div style="font-weight:900;color:${theme.text};font-size:1.1rem;">-31%</div>
                      <div style="color:${theme.textSub};">Fine Line Depth</div>
                    </div>
                    <div style="background:${theme.bg};padding:10px 4px;border-radius:8px;">
                      <div style="font-weight:900;color:${theme.text};font-size:1.1rem;">96%</div>
                      <div style="color:${theme.textSub};">Firmness Index</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:8px;">
                  ${esc(p.categoryNameEn)} · ${esc(p.badge)}
                </div>
                <h1 style="font-size:clamp(1.9rem, 3vw, 2.7rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">
                  ${esc(p.name)}
                </h1>
                <p style="font-size:1.02rem;color:${theme.textMuted};line-height:1.7;margin:0 0 24px;">
                  ${esc(p.desc)}
                </p>

                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:22px;margin-bottom:24px;">
                  <h3 style="font-size:0.88rem;font-weight:800;text-transform:uppercase;color:${theme.primary};margin:0 0 16px;">
                    Bio-Photonic &amp; Electronic Hardware Specs
                  </h3>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.82rem;color:${theme.textMuted};">
                    <div><strong>Optical Emission:</strong><br>${esc(p.material)}</div>
                    <div><strong>Battery &amp; Charging:</strong><br>${esc(p.dimensions)}</div>
                    <div><strong>Regulatory Class:</strong><br>CE Medical, FDA 510(k) Ready</div>
                    <div><strong>OEM Batch MOQ:</strong><br><span style="color:${theme.primary};font-weight:800;">${esc(p.moq)}</span></div>
                  </div>
                </div>

                <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:14px;padding:18px;margin-bottom:28px;">
                  <h4 style="font-size:0.82rem;font-weight:800;color:#3730a3;margin:0 0 4px;">Hardware Customization &amp; International Adapters</h4>
                  <p style="font-size:0.8rem;color:#312e81;margin:0;line-height:1.5;">
                    Supported OEM configurations: CNC anodized alloy handle, custom OLED screen animation, multi-voltage inductive charging cradle, and international plug adapters (US/EU/UK/AU).
                  </p>
                </div>

                <div style="display:flex;gap:16px;flex-wrap:wrap;">
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;padding:15px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 6px 18px ${theme.accentGlow};">
                    Submit Clinical Device RFQ ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 24px;border-radius:10px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.92rem;font-weight:700;">
                    Download Clinical Trial Report
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? `${company.name} · Bio-Photonic Aesthetic Laboratory` : `${company.name} · Botanical Cosmeceutical Laboratory`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, isVideo ? [
      { value: company.establishedYear || '2016', num: 2016, label: 'Established', desc: 'Aesthetic device R&D' },
      { value: 'ISO 13485', num: 13485, label: 'Medical Quality', desc: 'Device quality system' },
      { value: 'CE Medical', num: 1, label: 'Safety Certified', desc: 'EMC & Biocompatibility pass' },
      { value: '50+ Patents', num: 50, label: 'Proprietary Optics', desc: 'Light & microcurrent tech' },
    ] : [
      { value: company.establishedYear || '2015', num: 2015, label: 'Lab Est.', desc: 'Continuous lab compounding' },
      { value: 'ISO 22716', num: 22716, label: 'GMP Cleanroom', desc: 'Class 100K cosmetic facility' },
      { value: '100% Vegan', num: 100, label: 'Cruelty-Free', desc: 'Clean beauty formulation' },
      { value: '60+ Markets', num: 60, label: 'Global Exports', desc: 'FDA VCRP & EU CPNP ready' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    if (!isVideo) {
      // Botanical Skincare About
      mainHtml = `
        <main class="beauty-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:50px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                  ${esc(ui.about)} · Clean Formulation Heritage
                </div>
                <h1 style="font-size:clamp(2rem, 4vw, 2.9rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 18px;">
                  ${esc(headline)}
                </h1>
                ${storyParagraphs.map(p => `<p style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 16px;">${esc(p)}</p>`).join('')}
              </div>
              <div style="border-radius:20px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(157,78,221,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:400px;object-fit:cover;display:block;" loading="lazy">
              </div>
            </div>

            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;margin-bottom:50px;">
              <h2 style="font-size:1.25rem;font-weight:900;color:${theme.text};margin:0 0 24px;text-align:center;">Botanical Extraction &amp; Green Formulation Pipeline</h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.2rem;margin-bottom:4px;">01. Organic Sourcing</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">Single-origin botanical harvests certified non-GMO and pesticide-free.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.2rem;margin-bottom:4px;">02. Cold-Bio Fermentation</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">Low-temperature enzyme extraction maintaining molecular bio-activity.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.2rem;margin-bottom:4px;">03. Stability Challenge</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">12-week accelerated heat, light, and preservative challenge testing.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="color:${theme.primary};font-weight:900;font-size:1.2rem;margin-bottom:4px;">04. Turnkey Export Pack</div>
                  <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">Class 100K cleanroom aseptic filling into airless PCR cosmetic bottles.</p>
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:20px;margin-bottom:60px;">
              ${highlights.map(h => `
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:24px;text-align:center;">
                  <div style="font-size:1.9rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:4px 0 2px;">${esc(h.label)}</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc)}</div>
                </div>
              `).join('')}
            </div>

            <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Formulate Your Clean Beauty Line With Us</h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};margin:0 0 20px;max-width:560px;margin-left:auto;margin-right:auto;">From custom active complexes to bulk concentrate export and regulatory dossier registration.</p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                Initiate Formulation Dialogue ↗
              </a>
            </div>
          </section>
        </main>
      `;
    } else {
      // Clinical Aesthetic Device About
      mainHtml = `
        <main class="beauty-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 24px 80px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:50px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:14px;">
                  ${esc(ui.about)} · Aesthetic Device Engineering
                </div>
                <h1 style="font-size:clamp(2rem, 4vw, 2.9rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 18px;">
                  ${esc(headline)}
                </h1>
                ${storyParagraphs.map(p => `<p style="font-size:1.02rem;line-height:1.75;color:${theme.textMuted};margin:0 0 16px;">${esc(p)}</p>`).join('')}
              </div>
              <div style="border-radius:20px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(99,102,241,0.08);">
                <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:400px;object-fit:cover;display:block;" loading="lazy">
              </div>
            </div>

            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;margin-bottom:50px;">
              <h2 style="font-size:1.25rem;font-weight:900;color:${theme.text};margin:0 0 20px;text-align:center;">Bio-Photonic Optical Testing &amp; Medical Engineering</h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;margin-bottom:6px;">Spectroradiometer Calibration</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;">Exact peak wavelength verification for 630nm red, 415nm blue, and 850nm NIR chips.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;margin-bottom:6px;">ISO 10993 Biocompatibility</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;">Medical titanium probe contact testing for zero skin sensitization or cytotoxicity.</p>
                </div>
                <div style="background:${theme.bg};padding:20px;border-radius:12px;border:1px solid ${theme.cardBorder};">
                  <div style="font-weight:900;color:${theme.primary};font-size:1.1rem;margin-bottom:6px;">EMC &amp; Electrical Safety</div>
                  <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;">Full CE Medical Directive and FCC Part 15 Class B radiation and immunity compliance.</p>
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:20px;margin-bottom:60px;">
              ${highlights.map(h => `
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:24px;text-align:center;">
                  <div style="font-size:1.9rem;font-weight:900;color:${theme.primary};">${esc(h.value)}</div>
                  <div style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:4px 0 2px;">${esc(h.label)}</div>
                  <div style="font-size:0.75rem;color:${theme.textSub};">${esc(h.desc)}</div>
                </div>
              `).join('')}
            </div>

            <div style="text-align:center;background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};margin:0 0 10px;">Aesthetic Device OEM &amp; Brand Partnership</h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};margin:0 0 20px;max-width:560px;margin-left:auto;margin-right:auto;">Turnkey hardware manufacturing, customized charging bases, and distributor documentation.</p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
                Initiate Device Sourcing RFQ ↗
              </a>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'contact') {
    if (!isVideo) {
      // Botanical Skincare Inquiry
      mainHtml = `
        <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section class="wrap" style="padding:40px 24px 80px;">
            <header style="text-align:center;max-width:640px;margin:0 auto 48px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
                ${esc(ui.contact)} · Clean Formulation Salon
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 12px;">Request Formulation Samples &amp; Private Label Quotes</h1>
              <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Consult directly with our cosmetic chemists for stock formula sampling, custom compounding, and turnkey packaging.</p>
            </header>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(157,78,221,0.04);">
                <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Cosmetic Sourcing Quotation</h2>
                <form id="inquiry" action="${esc(ctx.options.inquiryUrl)}" method="post" style="display:grid;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Select Formula / Product SKU</label>
                    <select name="productId" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                      <option value="">— Choose a Target Formulation —</option>
                      ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)} (${esc(p.categoryNameEn)})</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Batch Volume</label>
                      <input type="text" name="quantity" placeholder="e.g. 1,000 Units" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Packaging Preference</label>
                      <input type="text" name="customization" placeholder="Airless pump / Dropper" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Business Email</label>
                    <input type="email" name="email" placeholder="brand@cleanbeauty.com" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Specific Ingredients &amp; Target Regulatory Markets</label>
                    <textarea name="message" rows="4" placeholder="Detail your active botanical preferences, fragrance-free requirements, or target market compliance (CPNP/FDA)..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                  </div>
                  <button type="submit" style="padding:14px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    Submit Formulation Inquiry ↗
                  </button>
                </form>
              </div>

              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Regulatory &amp; Laboratory Compliance</h2>
                  <p style="font-size:0.92rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                    We support B2B clients with complete CPSR safety dossiers, microbial challenge testing, stability reports, and customs export clearance.
                  </p>
                  <div style="font-size:0.85rem;color:${theme.textMuted};line-height:2;">
                    <div><strong>Laboratory:</strong> ${esc(company.name || brandName)}</div>
                    <div><strong>Formulation Contact:</strong> ${esc(company.email || 'cosmetics@beautysourcing.com')}</div>
                    <div><strong>Facility Location:</strong> ${esc(company.address || 'Bio-Cosmetic Science Park')}</div>
                    <div><strong>Cleanroom Standard:</strong> ISO 22716 Cosmetics GMP</div>
                  </div>
                </div>
                <div style="background:#faf5ff;border:1px solid ${theme.cardBorder};border-radius:12px;padding:18px;font-size:0.8rem;color:${theme.primary};line-height:1.6;margin-top:24px;">
                  🌿 Stability Assurance: Custom lab batch samples with certified certificates of analysis (CoA) dispatch within 5 business days.
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // Clinical Aesthetic Device Inquiry
      mainHtml = `
        <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 80px;">
          <section class="wrap" style="padding:40px 24px 80px;">
            <header style="text-align:center;max-width:640px;margin:0 auto 48px;">
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">
                ${esc(ui.contact)} · Aesthetic Device OEM Portal
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 12px;">Submit Device Engineering RFQ &amp; Distributor Inquiries</h1>
              <p style="font-size:1rem;color:${theme.textMuted};margin:0;">Receive factory-direct pricing, tooling timelines, optical test certificates, and distributor territory terms within 24 hours.</p>
            </header>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:40px;">
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:36px;box-shadow:0 8px 30px rgba(99,102,241,0.04);">
                <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 20px;">Device Hardware Procurement</h2>
                <form id="inquiry" action="${esc(ctx.options.inquiryUrl)}" method="post" style="display:grid;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Select Device Architecture</label>
                    <select name="productId" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                      <option value="">— Choose a Device Model —</option>
                      ${products.map(p => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)} (${esc(p.categoryNameEn)})</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Target Quantity</label>
                      <input type="text" name="quantity" placeholder="e.g. 500 Units" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                      <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Plug Standard &amp; Shell</label>
                      <input type="text" name="customization" placeholder="US/EU plug / Anodized finish" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                    </div>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Corporate Email</label>
                    <input type="email" name="email" placeholder="devices@brandclinic.com" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;">Clinical Specs &amp; Regulatory Dossier Needs</label>
                    <textarea name="message" rows="4" placeholder="Specify optical wavelength configurations, custom gift box requirements, destination country certifications (CE / FDA)..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid ${theme.cardBorder};background:${theme.bg};font-size:0.88rem;box-sizing:border-box;"></textarea>
                  </div>
                  <button type="submit" style="padding:14px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.95rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    Submit Device Hardware RFQ ↗
                  </button>
                </form>
              </div>

              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:36px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <h2 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Medical Device Engineering Center</h2>
                  <p style="font-size:0.92rem;color:${theme.textMuted};line-height:1.75;margin:0 0 24px;">
                    ISO 13485 certified production lines with automated laser optical calibration, high-voltage insulation testers, and ultrasonic shell welding.
                  </p>
                  <div style="font-size:0.85rem;color:${theme.textMuted};line-height:2;">
                    <div><strong>Enterprise:</strong> ${esc(company.name || brandName)}</div>
                    <div><strong>Device Division:</strong> ${esc(company.email || 'devices@medcosmetics.com')}</div>
                    <div><strong>Factory Facility:</strong> ${esc(company.address || 'Optoelectronic Technology Zone')}</div>
                    <div><strong>Regulatory Support:</strong> CE Medical, FDA 510(k), FCC, RoHS</div>
                  </div>
                </div>
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:18px;font-size:0.8rem;color:${theme.primary};line-height:1.6;margin-top:24px;">
                  ⚡ Rapid Prototype: Factory-calibrated optical evaluation devices dispatch internationally within 72 hours.
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
    }
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
