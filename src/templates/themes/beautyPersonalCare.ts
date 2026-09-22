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
    name: 'Gel-Effect Long-Wear Polish Collection',
    desc: 'Salon-quality gel-effect nail polish with chip-free 14-day wear, quick-dry formula, and 10-free non-toxic ingredients.',
    badge: 'Gel Effect',
    category: 'nail',
    categoryNameZh: '',
    categoryNameEn: 'Nail Care',
    material: '10-Free Vegan Formula',
    dimensions: '10ml × 6 Colors',
    extra: '14-Day Chip-Free',
    moq: '1000 Sets',
    tagline: '10-Free Salon-Quality Gel',
    img: getIndustryPlaceholder('beauty', 5),
  },
  {
    id: 'bt-7',
    name: 'Fermented Rice Water Repair Essence',
    desc: 'Traditional sake-brewing fermentation process concentrating amino acids, vitamins, and minerals for skin renewal.',
    badge: 'Ferment Tech',
    category: 'essence',
    categoryNameZh: '',
    categoryNameEn: 'Treatment Essences',
    material: 'Saccharomyces Rice Ferment Filtrate',
    dimensions: '150ml Glass Bottle',
    extra: 'First Treatment Step',
    moq: '600 Units',
    tagline: 'Sake-Brewing Fermentation Process',
    img: getIndustryPlaceholder('beauty', 6),
  },
  {
    id: 'bt-8',
    name: 'PH-Balanced Micellar Cleansing Oil',
    desc: 'Lightweight cleansing oil with micellar technology for effortless makeup removal without disrupting skin pH balance.',
    badge: 'Gentle Cleanse',
    category: 'cleanser',
    categoryNameZh: '',
    categoryNameEn: 'Cleansers',
    material: 'Plant-Derived Micellar Complex',
    dimensions: '200ml Pump Bottle',
    extra: 'pH 5.5 Balanced',
    moq: '1000 Units',
    tagline: 'pH 5.5 Micellar Technology',
    img: getIndustryPlaceholder('beauty', 7),
  }
];

export function getBeautyProducts(ctx: ThemeContext): ThemedBeautyItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'beauty',
      categoryNameZh: '',
      categoryNameEn: 'Active Serums',
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
      const fallback = BEAUTY_DEFAULT_PRODUCTS[idx % BEAUTY_DEFAULT_PRODUCTS.length]!;
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
  return BEAUTY_DEFAULT_PRODUCTS;
}

export function renderBeautyPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getBeautyProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'GlowScience Active Lab' : 'Derma Luxe Skincare Lab');
  const brandTagline = isVideo ? 'Luminous Glow & Active Ingredients' : 'Clinical-Grade Skincare Formulations';

  const theme = isVideo
    ? {
      bg: '#faf5ff', cardBg: '#ffffff', cardBorder: 'rgba(147,51,234,0.12)',
      primary: '#9333ea', primaryHover: '#7e22ce', text: '#1c1917', textMuted: '#57534e', textSub: '#78716c',
      glassBg: 'rgba(250,245,255,0.92)', pillBg: '#f3e8ff', pillText: '#7e22ce',
      btnGradient: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)', accentGlow: 'rgba(147,51,234,0.18)',
    }
    : {
      bg: '#fff5f7', cardBg: '#ffffff', cardBorder: 'rgba(190,24,93,0.10)',
      primary: '#be185d', primaryHover: '#9d174d', text: '#1c1917', textMuted: '#57534e', textSub: '#78716c',
      glassBg: 'rgba(255,245,247,0.92)', pillBg: '#fce7f3', pillText: '#9d174d',
      btnGradient: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)', accentGlow: 'rgba(190,24,93,0.18)',
    };

  const headerHtml = `
    <header class="beauty-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.04);">
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
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Holographic Glow Lab
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Luminous Glow: Advanced Active Ingredient Technology')}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:620px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Next-generation encapsulated retinol, niacinamide delivery systems, and bio-fermented essence technology.')}
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
                  ${[['GMP', 'Manufacturing'], ['99.7%', 'Purity Grade'], ['0%', 'Animal Testing']].map(([v, l]) => `
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
        <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Hero Banner -->
          <section style="position:relative;overflow:hidden;padding:100px 0 80px;">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ Luminous Skincare Studio
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.6rem);font-weight:900;line-height:1.1;color:${theme.text};letter-spacing:-0.03em;margin:0 0 20px;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Clinical Precision Meets Botanical Luxury')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Pharmaceutical-grade hyaluronic acid, ceramide NP complex, and ethically sourced botanical extracts.')}
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
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">GMP</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Manufacturing</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">ISO 22716 certified</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">99.7%</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Purity Grade</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">HPLC verified actives</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">0%</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Animal Testing</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">Leaping Bunny certified</div>
              </div>

              <div style="text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">ISO 5</div>
                <div style="font-size:0.78rem;font-weight:700;color:${theme.text};margin:4px 0 2px;">Clean Room</div>
                <div style="font-size:0.72rem;color:${theme.textSub};">Aseptic filling class</div>
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
      <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
      <main class="beauty-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
    const headline = getAboutHeadline(company, `${company.name} · Botanical Innovation`);
    const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2018', num: parseInt(company.establishedYear || '2018', 10), label: 'Established', desc: 'ISO 22716 certified' },
      { value: 'GMP', num: 100, label: 'Manufacturing', desc: 'ISO 22716 certified' },
      { value: '99.7%', num: 99, label: 'Purity Grade', desc: 'HPLC verified actives' },
      { value: 'ISO 5', num: 100, label: 'Clean Room', desc: 'Aseptic filling class' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');
    const pipeline = isVideo ? [['Active Discovery', 'Encapsulated retinol and peptide research'], ['Nano Emulsion', 'High-pressure homogenization for nano delivery'], ['Bio Fermentation', 'Controlled fermentation of botanical extracts'], ['Photostability', 'UV exposure and oxidation resistance testing'], ['Clinical Trials', 'Double-blind placebo-controlled efficacy studies']] : [['R&D Formulation', 'Clinical-grade ingredient sourcing and stability testing'], ['Batch Compounding', 'GMP-certified clean-room formulation processing'], ['Quality Assay', 'HPLC active ingredient concentration verification'], ['Aseptic Filling', 'ISO Class 5 clean-room airless packaging'], ['Derma Testing', 'Dermatologist patch testing and efficacy validation']];
    mainHtml = `
      <main class="beauty-main" data-wr-page="about" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
    const fields = isVideo ? [{ label: 'Active Ingredient', options: 'Retinol|Niacinamide|Vitamin C|Peptides|Custom' }, { label: 'Delivery System', options: 'Liposomal|Nano Emulsion|Encapsulated|Standard' }, { label: 'Target Market', options: 'US FDA|EU CPNP|Japan PMDA|Korea MFDS' }] : [{ label: 'Product Category', options: 'Skincare|Makeup|Hair Care|Body Care|Custom' }, { label: 'Formulation', options: 'Serum|Cream|Lotion|Gel|Oil|Powder' }, { label: 'Certification', options: 'Vegan|Cruelty-Free|Organic|Halal|All' }];
    mainHtml = `
      <main class="beauty-main" data-wr-page="contact" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding-top:40px;">
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
    <footer class="beauty-footer" style="background:${theme.cardBg};border-top:1px solid ${theme.cardBorder};padding:50px 0 30px;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;">${esc(brandName)}</div>
            <p style="font-size:0.86rem;color:${theme.textMuted};max-width:380px;line-height:1.6;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'GlowScience Active Lab' : 'Derma Luxe Skincare Lab'))}
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
    <div class="beauty-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
