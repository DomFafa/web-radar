import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

export interface ThemedFoodItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  material: string;
  dimensions: string;
  tagline: string;
  img: string;
}

export const FOOD_DEFAULT_PRODUCTS: ThemedFoodItem[] = [
  {
    id: 'food-1',
    name: 'Single-Origin Raw Wildflower Honey — 500g',
    desc: 'Unprocessed cold-extracted wildflower honey from high-altitude meadows, preserving natural enzymes and pollen. Tested for diastase activity and HMF compliance.',
    badge: 'Single Origin',
    material: 'Raw wildflower honey · diastase > 8 Gothe · HMF < 15 mg/kg',
    dimensions: '500 g glass jar · shelf life 36 months · batch traceable',
    tagline: 'Cold-Extracted Enzyme-Active Wildflower from High-Altitude Meadows',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'food-2',
    name: 'Extra Virgin Olive Oil — First Cold Press',
    desc: 'First cold-pressed EVOO from hand-harvested Koroneiki olives, acidity below 0.3%, rich in polyphenols, certified organic and PDO protected.',
    badge: 'Cold Press',
    material: 'Koroneiki EVOO · acidity < 0.3% · polyphenols > 350 mg/kg',
    dimensions: '500 ml dark glass bottle · PDO certified · organic',
    tagline: 'PDO-Protected Koroneiki with Polyphenol-Rich First Press',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'food-3',
    name: 'Sun-Dried Turkish Apricot — Jumbo Grade',
    desc: 'Sulphur-free sun-dried Malatya apricots, hand-sorted jumbo grade, naturally sweet with preserved carotenoids and fiber content.',
    badge: 'Sun Dried',
    material: 'Malatya apricots · no sulphur dioxide · jumbo grade > 35 mm',
    dimensions: '1 kg resealable pouch · shelf life 18 months',
    tagline: 'Sulphur-Free Sun-Dried Malatya Jumbo with Natural Carotenoids',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'food-4',
    name: 'Single-Estate Oolong Tea Collection — 6 Varietals',
    desc: 'Hand-rolled high-mountain oolong from single-estate terroirs between 800-1800m altitude, including Tie Guan Yin, Da Hong Pao, and Ali Shan varieties.',
    badge: 'High Mountain',
    material: 'Single-estate oolong · altitude 800-1800 m · hand-rolled',
    dimensions: '6 × 50 g vacuum-sealed tins · nitrogen-flushed',
    tagline: 'Hand-Rolled High-Mountain Estate Oolongs from 6 Terroirs',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'food-5',
    name: 'Artisan Spice Blend Gift Set — 8 Origins',
    desc: 'Globally-sourced small-batch spice blends: Ras el Hanout, Za\'atar, Garam Masala, Berbere, Dukkah, Shichimi, Baharat, and Herbes de Provence.',
    badge: '8 Origins',
    material: 'Whole spices ground to order · no anti-caking agents',
    dimensions: '8 × 45 g glass jars in wooden presentation box',
    tagline: 'Small-Batch Ground-to-Order Blends from 8 Global Origins',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'food-6',
    name: 'Bean-to-Bar Dark Chocolate — 72% Cacao',
    desc: 'Single-origin Trinitario cacao from Chuao, Venezuela. Stone-ground 72 hours, conched for smoothness, crafted in micro-batches of 200 bars.',
    badge: 'Bean to Bar',
    material: 'Chuao Trinitario cacao · 72% · 72-hour stone grind',
    dimensions: '80 g bar · micro-batch of 200 · compostable wrapper',
    tagline: 'Stone-Ground 72-Hour Chuao Trinitario in Micro Batches',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'food-7',
    name: 'Organic Maple Pecan Granola — Low Sugar',
    desc: 'Slow-baked organic granola clusters with Grade A dark maple syrup, roasted pecans, and toasted coconut. No refined sugar, high fiber.',
    badge: 'Low Sugar',
    material: 'Organic oats, pecans, maple syrup · no refined sugar',
    dimensions: '400 g kraft standup pouch · 12-month shelf life',
    tagline: 'Slow-Baked Organic Clusters with Grade A Dark Maple',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'food-8',
    name: 'Artisan Bronze-Die Pasta Set — 4 Shapes',
    desc: 'Slow-dried bronze-die extruded pasta from stone-milled Italian durum semolina, rough-textured for optimal sauce adhesion. 48-hour drying process.',
    badge: 'Bronze Die',
    material: 'Stone-milled Italian durum semolina · bronze-die extruded',
    dimensions: '4 × 500 g (rigatoni, fusilli, pappardelle, orecchiette)',
    tagline: '48-Hour Slow-Dried Stone-Milled Bronze-Die Texture',
    img: '/templates/senseng/products-8.jpg',
  },
];

function getFoodProducts(ctx: ThemeContext): ThemedFoodItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Food Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      material: p.material || '',
      dimensions: p.dimensions || '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = FOOD_DEFAULT_PRODUCTS[idx % FOOD_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: fallback.badge,
        material: p.material || fallback.material,
        dimensions: p.dimensions || fallback.dimensions,
        tagline: p.tagline || fallback.tagline,
        img: ctx.productMainImage(p) || fallback.img,
      };
    });
  }
  return FOOD_DEFAULT_PRODUCTS;
}

export function renderFoodPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getFoodProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'Harvest Table Co.' : 'Terra Artisan Foods');

  const theme = isVideo
    ? {
        bg: '#fafbf5',
        cardBg: '#ffffff',
        cardBorder: 'rgba(76, 107, 34, 0.12)',
        primary: '#4c6b22',
        primaryHover: '#3d5a18',
        text: '#2a3517',
        textMuted: '#5a6b48',
        textSub: '#7e8c6c',
        glassBg: 'rgba(250, 251, 245, 0.93)',
        pillBg: '#eef3e4',
        pillText: '#3d5a18',
        btnGradient: 'linear-gradient(135deg, #6b8e23 0%, #4c6b22 100%)',
        accentGlow: 'rgba(107, 142, 35, 0.20)',
        accent2: '#d4a843',
        heroOverlay: 'linear-gradient(135deg, rgba(107,142,35,0.04) 0%, rgba(212,168,67,0.03) 100%)',
      }
    : {
        bg: '#fdf8f3',
        cardBg: '#ffffff',
        cardBorder: 'rgba(194, 112, 62, 0.12)',
        primary: '#b85c2a',
        primaryHover: '#a04f22',
        text: '#3b2712',
        textMuted: '#7a5e42',
        textSub: '#a08868',
        glassBg: 'rgba(253, 248, 243, 0.93)',
        pillBg: '#f5e8d8',
        pillText: '#a04f22',
        btnGradient: 'linear-gradient(135deg, #c2703e 0%, #b85c2a 100%)',
        accentGlow: 'rgba(194, 112, 62, 0.20)',
        accent2: '#6b8e23',
        heroOverlay: 'linear-gradient(135deg, rgba(194,112,62,0.04) 0%, rgba(107,142,35,0.03) 100%)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // ── Header ──
  const headerHtml = `
    <header style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="max-width:1280px;margin:0 auto;height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:36px;width:auto;">` : ''}
          <span style="font-size:1.2rem;font-weight:900;color:${theme.text};font-family:'DM Serif Display',Georgia,serif;letter-spacing:0.01em;">${esc(brandName)}</span>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:26px;">
          ${['home', 'catalog', 'about', 'contact'].map(p => `<a href="${path(p === 'home' ? 'index.html' : p + '/index.html')}" ${navAttrs(p)} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${page === p ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui[p as 'home' | 'catalog' | 'about' | 'contact'])}</a>`).join('')}
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.84rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">Order Samples ↗</a>
        </div>
      </div>
    </header>
  `;

  // ── Footer ──
  const footerHtml = `
    <footer style="background:${theme.text};color:#fff;padding:56px 24px 28px;">
      <div style="max-width:1280px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:36px;margin-bottom:36px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;margin-bottom:10px;font-family:'DM Serif Display',Georgia,serif;">${esc(brandName)}</div>
            <p style="font-size:0.86rem;line-height:1.65;color:rgba(255,255,255,0.65);max-width:280px;">${esc(company.description || 'Artisan food products and premium packaging solutions for specialty retailers and food service distributors worldwide.')}</p>
            <div style="display:flex;gap:10px;margin-top:14px;">${ctx.socials}</div>
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${theme.accent2};margin-bottom:12px;">Navigate</div>
            ${['home', 'catalog', 'about', 'contact'].map(p => `<a href="${path(p === 'home' ? 'index.html' : p + '/index.html')}" ${navAttrs(p)} style="display:block;color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.86rem;padding:3px 0;">${esc(ui[p as 'home' | 'catalog' | 'about' | 'contact'])}</a>`).join('')}
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${theme.accent2};margin-bottom:12px;">Contact</div>
            <a href="mailto:${esc(company.email)}" style="display:block;color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.86rem;padding:3px 0;">${esc(company.email)}</a>
            ${company.phone ? `<span style="display:block;color:rgba(255,255,255,0.65);font-size:0.86rem;padding:3px 0;">${esc(company.phone)}</span>` : ''}
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${theme.accent2};margin-bottom:12px;">Location</div>
            <p style="font-size:0.86rem;color:rgba(255,255,255,0.65);line-height:1.5;">${esc(company.address || 'Worldwide Distribution')}</p>
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">&copy; ${new Date().getUTCFullYear()} ${esc(brandName)}. ${esc(ui.rights)}</span>
          <div class="languages" style="display:flex;gap:8px;">${ctx.languageLinks}</div>
        </div>
      </div>
    </footer>
  `;

  const animScript = `
    <script>
    (function(){
      var els=document.querySelectorAll('[data-reveal]');
      if(!els.length)return;
      var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';io.unobserve(e.target);}});},{threshold:0.12});
      els.forEach(function(el){el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='opacity 0.65s ease-out, transform 0.65s ease-out';io.observe(el);});
    })();
    </script>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // ── FOOD HARVEST VIDEO HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;">
            <div style="position:absolute;inset:0;background:${theme.heroOverlay};pointer-events:none;"></div>
            <div style="max-width:1280px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  <span style="display:inline-block;font-size:0.9rem;">🌾</span>
                  Farm-to-Table Artisan Foods
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.12;color:${theme.text};letter-spacing:-0.02em;margin:0 0 16px;font-family:'DM Serif Display',Georgia,serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Harvest-Fresh Artisan Foods & Specialty Ingredients')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:540px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Single-origin honey, cold-pressed oils, and hand-crafted specialty foods with full traceability for gourmet retailers and food service distributors.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 24px ${theme.accentGlow};">Explore Products ↗</a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:10px;background:#fff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">Import Inquiry</a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div><div style="font-size:1.5rem;font-weight:900;color:${theme.primary};">HACCP</div><div style="font-size:0.72rem;color:${theme.textSub};">Certified Production</div></div>
                  <div><div style="font-size:1.5rem;font-weight:900;color:${theme.primary};">100%</div><div style="font-size:0.72rem;color:${theme.textSub};">Batch Traceable</div></div>
                  <div><div style="font-size:1.5rem;font-weight:900;color:${theme.primary};">35+</div><div style="font-size:0.72rem;color:${theme.textSub};">Export Markets</div></div>
                </div>
              </div>
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 20px 56px rgba(0,0,0,0.06);">
                  <div style="position:relative;padding-top:66%;background:#1a1508;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(42,53,23,0.7) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;color:#fff;">
                      <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${theme.accent2};background:rgba(212,168,67,0.2);padding:3px 10px;border-radius:4px;">Harvest Showcase</span>
                      <div style="font-size:0.95rem;font-weight:800;margin-top:6px;">From Farm to Global Table</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1280px;margin:0 auto;">
            <h2 style="font-size:2rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 12px;font-family:'DM Serif Display',Georgia,serif;">Artisan Collection</h2>
            <p style="font-size:0.95rem;color:${theme.textMuted};text-align:center;margin:0 0 48px;">Specialty foods crafted with tradition and transparency</p>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
              ${products.slice(0, 8).map((p) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.07)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                  <div style="padding-top:100%;position:relative;background:#fafcf5;"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;transition:transform 0.4s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'"></div>
                  <div style="padding:16px;">
                    ${p.badge ? `<span style="font-size:0.66rem;font-weight:800;color:${theme.accent2};text-transform:uppercase;letter-spacing:0.06em;">${esc(p.badge)}</span>` : ''}
                    <h3 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:4px 0 4px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>

          <section data-reveal style="padding:60px 24px 80px;background:rgba(107,142,35,0.03);">
            <div style="max-width:1280px;margin:0 auto;">
              <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 40px;font-family:'DM Serif Display',Georgia,serif;">Import Advantages</h2>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;">
                ${[
                  { icon: '🔬', title: 'Lab Tested', desc: 'Full COA with heavy metals, pesticides, and microbiology testing per batch.' },
                  { icon: '📋', title: 'Export Ready', desc: 'FDA, EU, and FSMA compliant documentation for seamless import clearance.' },
                  { icon: '📦', title: 'Custom Packaging', desc: 'Private label, gift sets, and retail-ready packaging with your brand.' },
                ].map(f => `
                  <div style="padding:28px;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};text-align:center;">
                    <div style="font-size:2rem;margin-bottom:10px;">${f.icon}</div>
                    <h3 style="font-size:1rem;font-weight:800;color:${theme.text};margin:0 0 6px;">${f.title}</h3>
                    <p style="font-size:0.84rem;color:${theme.textMuted};margin:0;line-height:1.55;">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // ── FOOD ARTISAN BANNER HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:100px 0 120px;background:${theme.heroOverlay};">
            <div style="position:absolute;top:15%;right:8%;width:200px;height:200px;border-radius:50%;background:rgba(194,112,62,0.06);pointer-events:none;animation:wrFloat 6s ease-in-out infinite;"></div>
            <div style="position:absolute;bottom:10%;left:4%;width:120px;height:120px;border-radius:50%;background:rgba(107,142,35,0.05);pointer-events:none;animation:wrFloat 5s ease-in-out infinite 1s;"></div>
            <div style="max-width:1280px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  <span style="display:inline-block;font-size:0.9rem;">🍯</span>
                  Artisan Food &amp; Packaging
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.8rem);font-weight:900;line-height:1.08;color:${theme.text};letter-spacing:-0.02em;margin:0 0 20px;font-family:'DM Serif Display',Georgia,serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'From Ancient Terroirs to Modern Pantries')}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:520px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Artisan-crafted specialty foods with provenance, purity, and packaging engineered for premium retail and food service distribution worldwide.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 34px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:1rem;font-weight:800;box-shadow:0 8px 28px ${theme.accentGlow};">Browse Products ↗</a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 28px;border-radius:10px;background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);color:${theme.text};border:1px solid ${theme.cardBorder};font-size:1rem;font-weight:700;">Request Samples</a>
                </div>
              </div>
              <div style="position:relative;">
                <div style="border-radius:24px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 64px rgba(0,0,0,0.06);padding:20px;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:16px;">
                </div>
                <div style="position:absolute;top:-12px;left:-12px;padding:8px 16px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.76rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};animation:wrFloat 3.5s ease-in-out infinite;">
                  🌿 Certified Organic
                </div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1280px;margin:0 auto;">
            <h2 style="font-size:2.2rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 12px;font-family:'DM Serif Display',Georgia,serif;">Artisan Selection</h2>
            <p style="font-size:0.95rem;color:${theme.textMuted};text-align:center;margin:0 0 48px;">Small-batch, provenance-guaranteed specialty foods</p>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">
              ${products.slice(0, 8).map((p) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:18px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.35s, box-shadow 0.35s;" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 14px 36px rgba(194,112,62,0.1)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                  <div style="padding-top:100%;position:relative;background:linear-gradient(135deg, #fdf6f0 0%, #fff 100%);"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:18px;transition:transform 0.4s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>
                  <div style="padding:16px;">
                    ${p.badge ? `<span style="font-size:0.66rem;font-weight:800;color:${theme.accent2};text-transform:uppercase;letter-spacing:0.06em;">${esc(p.badge)}</span>` : ''}
                    <h3 style="font-size:0.9rem;font-weight:800;color:${theme.text};margin:4px 0 4px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.78rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.tagline || p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>

          <section data-reveal style="padding:60px 24px 80px;background:${theme.heroOverlay};">
            <div style="max-width:1280px;margin:0 auto;">
              <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 40px;font-family:'DM Serif Display',Georgia,serif;">Sourcing Principles</h2>
              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
                ${[
                  { icon: '🌍', title: 'Direct Trade', desc: 'Sourced directly from farmers and cooperatives, cutting middlemen.' },
                  { icon: '🧪', title: 'Lab Certified', desc: 'Third-party tested for purity, heavy metals, and adulteration.' },
                  { icon: '📦', title: 'Retail Packaging', desc: 'Shelf-ready packaging with your branding and regulatory labels.' },
                  { icon: '🚢', title: 'Global Export', desc: 'Temperature-controlled logistics with full cold-chain documentation.' },
                ].map(f => `
                  <div style="padding:24px;border-radius:16px;background:rgba(255,255,255,0.85);backdrop-filter:blur(12px);border:1px solid ${theme.cardBorder};text-align:center;">
                    <div style="font-size:1.8rem;margin-bottom:8px;">${f.icon}</div>
                    <h3 style="font-size:0.92rem;font-weight:800;color:${theme.text};margin:0 0 4px;">${f.title}</h3>
                    <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <section data-reveal style="padding:60px 24px;max-width:1280px;margin:0 auto;text-align:center;">
            <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 14px;font-family:'DM Serif Display',Georgia,serif;">Ready to Curate Your Selection?</h2>
            <p style="font-size:0.95rem;color:${theme.textMuted};margin:0 0 28px;">Request a complimentary tasting kit and wholesale price list.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 40px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:1rem;font-weight:800;box-shadow:0 8px 28px ${theme.accentGlow};">Request Tasting Kit ↗</a>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:60px 24px 20px;text-align:center;">
          <h1 style="font-size:2.2rem;font-weight:900;font-family:'DM Serif Display',Georgia,serif;margin:0 0 10px;">${esc(ui.catalog)}</h1>
          <p style="font-size:0.95rem;color:${theme.textMuted};">Complete range of artisan food products</p>
        </section>
        <section style="padding:20px 24px 80px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
            ${products.map((p) => `
              <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                <div style="padding-top:100%;position:relative;background:${theme.bg};"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;"></div>
                <div style="padding:14px;">
                  ${p.badge ? `<span style="font-size:0.64rem;font-weight:800;color:${theme.accent2};text-transform:uppercase;letter-spacing:0.05em;">${esc(p.badge)}</span>` : ''}
                  <h3 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:4px 0 4px;">${esc(p.name)}</h3>
                  <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  } else if (page === 'detail') {
    const tp = products.find((p) => p.id === selectedProduct.id) || heroProduct;
    const translated = ctx.translateProduct(selectedProduct);
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:60px 24px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;">
            <div style="border-radius:20px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};padding:24px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <img id="wr-detail-main-img" data-wr-material-image="product-main" data-wr-material-product="${esc(tp.id)}" src="${esc(tp.img)}" alt="${esc(tp.name)}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:14px;">
            </div>
            <div style="padding-top:16px;">
              ${tp.badge ? `<span style="display:inline-block;padding:4px 12px;border-radius:8px;background:${theme.pillBg};color:${theme.pillText};font-size:0.74rem;font-weight:800;margin-bottom:14px;">${esc(tp.badge)}</span>` : ''}
              <h1 style="font-size:1.9rem;font-weight:900;color:${theme.text};margin:0 0 12px;line-height:1.2;font-family:'DM Serif Display',Georgia,serif;">${esc(translated.name || tp.name)}</h1>
              <p style="font-size:0.98rem;line-height:1.7;color:${theme.textMuted};margin:0 0 20px;">${esc(translated.description || tp.desc)}</p>
              ${tp.material ? `<div style="padding:14px;border-radius:12px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:12px;"><span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Composition</span><p style="font-size:0.88rem;color:${theme.text};margin:4px 0 0;">${esc(tp.material)}</p></div>` : ''}
              ${tp.dimensions ? `<div style="padding:14px;border-radius:12px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:20px;"><span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Packaging</span><p style="font-size:0.88rem;color:${theme.text};margin:4px 0 0;">${esc(tp.dimensions)}</p></div>` : ''}
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;display:inline-block;padding:13px 28px;border-radius:10px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">Request Sample ↗</a>
            </div>
          </div>
        </section>
        <section data-reveal style="padding:40px 24px 80px;max-width:1280px;margin:0 auto;">
          <h2 style="font-size:1.5rem;font-weight:900;color:${theme.text};margin:0 0 24px;font-family:'DM Serif Display',Georgia,serif;">More Products</h2>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:18px;">
            ${products.filter(p => p.id !== tp.id).slice(0, 4).map(p => `
              <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;border-radius:14px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
                <div style="padding-top:100%;position:relative;background:${theme.bg};"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:14px;"></div>
                <div style="padding:12px;"><h3 style="font-size:0.84rem;font-weight:800;color:${theme.text};margin:0;">${esc(p.name)}</h3></div>
              </a>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, `About ${brandName}`);
    const aboutParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const defaultAbout = company.description || 'We connect artisan food producers with global markets, ensuring every product meets the highest standards of purity, provenance, and packaging excellence.';
    const highlights = parseAboutHighlights(company.aboutHighlights);
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:80px 24px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;">
            <div>
              <h1 style="font-size:2.2rem;font-weight:900;color:${theme.text};margin:0 0 18px;font-family:'DM Serif Display',Georgia,serif;">${esc(aboutHeadline)}</h1>
              ${aboutParagraphs.length > 0
                ? aboutParagraphs.map(p => `<p style="font-size:0.98rem;line-height:1.75;color:${theme.textMuted};margin:0 0 14px;">${esc(p)}</p>`).join('')
                : `<p style="font-size:0.98rem;line-height:1.75;color:${theme.textMuted};margin:0 0 14px;">${esc(defaultAbout)}</p>`
              }
            </div>
            <div style="border-radius:20px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 10px 36px rgba(0,0,0,0.04);">
              <img src="${esc(heroProduct.img)}" alt="${esc(aboutHeadline)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;">
            </div>
          </div>
        </section>
        ${highlights.length > 0 ? `
          <section data-reveal style="padding:40px 24px 80px;max-width:1280px;margin:0 auto;">
            <div style="display:grid;grid-template-columns:repeat(${Math.min(highlights.length, 4)}, 1fr);gap:22px;">
              ${highlights.map(h => `
                <div style="text-align:center;padding:24px;border-radius:14px;background:#fff;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:4px;">${esc(h.value)}</div>
                  <div style="font-size:0.9rem;font-weight:700;color:${theme.text};margin-bottom:2px;">${esc(h.label)}</div>
                  ${h.desc ? `<div style="font-size:0.78rem;color:${theme.textMuted};">${esc(h.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </main>
    `;
  } else {
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:80px 24px;max-width:760px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:36px;">
            <h1 style="font-size:2.2rem;font-weight:900;color:${theme.text};font-family:'DM Serif Display',Georgia,serif;margin:0 0 10px;">${esc(ui.contact)}</h1>
            <p style="font-size:0.95rem;color:${theme.textMuted};">Import inquiries, sample requests, and private label projects.</p>
          </div>
          <div style="border-radius:20px;background:#fff;border:1px solid ${theme.cardBorder};padding:36px;box-shadow:0 6px 24px rgba(0,0,0,0.03);">
            ${ctx.inquiryFormHtml}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-top:36px;">
            ${[
              { icon: '📧', label: 'Email', value: company.email },
              { icon: '📞', label: 'Phone', value: company.phone || 'On request' },
              { icon: '📍', label: 'Address', value: company.address || 'Global Distribution' },
            ].map(c => `
              <div style="text-align:center;padding:20px;border-radius:12px;background:#fff;border:1px solid ${theme.cardBorder};">
                <div style="font-size:1.3rem;margin-bottom:6px;">${c.icon}</div>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.text};">${c.label}</div>
                <span style="font-size:0.8rem;color:${theme.textMuted};">${esc(c.value)}</span>
              </div>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  }

  return headerHtml + mainHtml + footerHtml + animScript;
}
