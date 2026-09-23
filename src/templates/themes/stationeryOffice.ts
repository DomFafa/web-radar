import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

export interface ThemedStationeryItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  material: string;
  dimensions: string;
  tagline: string;
  img: string;
}

export const STATIONERY_DEFAULT_PRODUCTS: ThemedStationeryItem[] = [
  {
    id: 'sta-1',
    name: 'Thread-Bound A5 Dotted Notebook — 160 gsm',
    desc: 'Lay-flat thread-sewn binding with 192 pages of premium 160 gsm ivory acid-free paper, fountain-pen friendly, numbered pages, and rear pocket.',
    badge: 'Editor Pick',
    material: '160 gsm FSC-certified acid-free ivory paper + linen cover',
    dimensions: 'A5 (148 × 210 mm) · 192 pages · 5 mm dot grid',
    tagline: 'Fountain-Pen Friendly Lay-Flat Thread Binding',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'sta-2',
    name: 'Precision Gel Ink Roller Pen Set — 0.5 mm',
    desc: 'Ultra-smooth gel ink roller with needle-tip precision, quick-dry formula for smudge-free writing, ergonomic triangular grip, and replaceable ink cartridge.',
    badge: 'Smooth Flow',
    material: 'Polycarbonate barrel + tungsten carbide ball tip',
    dimensions: '142 mm length · 0.5 mm tip · 800 m ink life per refill',
    tagline: 'Quick-Dry Smudge-Free Ultra-Smooth Gel Ink Flow',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'sta-3',
    name: 'Bamboo Desktop Organizer — 6-Compartment',
    desc: 'Hand-finished Moso bamboo desk organizer with 6 compartments, removable dividers, phone slot, and felt-lined drawer for clips and pins.',
    badge: 'Eco Bamboo',
    material: '100% sustainable Moso bamboo + felt lining',
    dimensions: '280 × 180 × 120 mm · 6 compartments + 1 drawer',
    tagline: 'Handcrafted Sustainable Bamboo with Felt-Lined Drawer',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'sta-4',
    name: 'Italian Vegetable-Tanned Leather Planner Cover',
    desc: 'Full-grain Tuscan vegetable-tanned leather planner cover with brass snap closure, 4-ring binder mechanism, card slots, and pen loop.',
    badge: 'Artisan Leather',
    material: 'Full-grain vegetable-tanned Tuscan cowhide + brass hardware',
    dimensions: 'A5 compatible · 30 mm ring diameter · 2 card slots',
    tagline: 'Tuscan Full-Grain Leather That Ages Beautifully',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'sta-5',
    name: 'Japanese Washi Tape Collection — 12 Rolls',
    desc: 'Curated set of 12 Japanese washi masking tapes in botanical and geometric patterns, repositionable adhesive, hand-tearable, acid-free archival safe.',
    badge: 'Craft Essential',
    material: 'Japanese rice paper + natural rubber adhesive',
    dimensions: '15 mm × 10 m per roll · 12 assorted designs',
    tagline: 'Repositionable Archival-Safe Japanese Rice Paper',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'sta-6',
    name: 'Heavy-Duty Metal Stapler — 100 Sheet Capacity',
    desc: 'Industrial-grade metal stapler with chrome-plated mechanism, adjustable paper guide, rubber non-slip base, and 100-sheet flat-clinch capacity.',
    badge: 'Heavy Duty',
    material: 'Cold-rolled steel body + chrome-plated mechanism',
    dimensions: '190 × 55 × 95 mm · accepts standard 23/6 to 23/13 staples',
    tagline: 'Flat-Clinch 100-Sheet Industrial-Grade Chrome Finish',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'sta-7',
    name: 'Magnetic Whiteboard Calendar — Monthly Planner',
    desc: 'Dry-erase magnetic whiteboard calendar with aluminum frame, includes 4 markers, eraser, and 6 magnetic clips. Fits standard cubicle and home office.',
    badge: 'Office Essential',
    material: 'Lacquered steel whiteboard + anodized aluminum frame',
    dimensions: '600 × 450 mm · magnetic surface · includes accessories',
    tagline: 'Magnetic Dry-Erase Surface with Aluminum Frame',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'sta-8',
    name: 'Cork & Kraft Memo Board with Push Pins',
    desc: 'Dual-surface cork and kraft paper memo board with pine wood frame, includes 20 rose-gold push pins, ideal for offices, studios, and cafes.',
    badge: 'Creative Space',
    material: 'Natural Portuguese cork + recycled kraft paper + pine frame',
    dimensions: '450 × 300 mm · 8 mm cork thickness · 20 pins included',
    tagline: 'Natural Portuguese Cork with Rose-Gold Push Pins',
    img: '/templates/senseng/products-8.jpg',
  },
];

function getStationeryProducts(ctx: ThemeContext): ThemedStationeryItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Stationery Item ${idx + 1}`,
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
      const fallback = STATIONERY_DEFAULT_PRODUCTS[idx % STATIONERY_DEFAULT_PRODUCTS.length]!;
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
  return STATIONERY_DEFAULT_PRODUCTS;
}

export function renderStationeryPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getStationeryProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'Bureau & Co.' : 'PaperCraft Studio');

  const theme = isVideo
    ? {
        bg: '#f5f7fa',
        cardBg: '#ffffff',
        cardBorder: 'rgba(30, 58, 95, 0.12)',
        primary: '#1e3a5f',
        primaryHover: '#15294a',
        text: '#1e3a5f',
        textMuted: '#5a7394',
        textSub: '#8096b0',
        glassBg: 'rgba(245, 247, 250, 0.94)',
        pillBg: '#e8eef6',
        pillText: '#1e3a5f',
        btnGradient: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
        accentGlow: 'rgba(30, 58, 95, 0.18)',
        accent2: '#c99a2e',
        heroOverlay: 'linear-gradient(160deg, rgba(30,58,95,0.04) 0%, rgba(44,82,130,0.02) 100%)',
      }
    : {
        bg: '#f8faf6',
        cardBg: '#ffffff',
        cardBorder: 'rgba(107, 143, 113, 0.14)',
        primary: '#5a7d5f',
        primaryHover: '#486748',
        text: '#1a2e1a',
        textMuted: '#5a6e5a',
        textSub: '#7e947e',
        glassBg: 'rgba(248, 250, 246, 0.93)',
        pillBg: '#e8f0e8',
        pillText: '#486748',
        btnGradient: 'linear-gradient(135deg, #5a7d5f 0%, #486748 100%)',
        accentGlow: 'rgba(107, 143, 113, 0.18)',
        accent2: '#a0b48a',
        heroOverlay: 'linear-gradient(160deg, rgba(107,143,113,0.04) 0%, rgba(160,180,138,0.02) 100%)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // ── Header ──
  const headerHtml = `
    <header style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="max-width:1280px;margin:0 auto;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:34px;width:auto;">` : ''}
          <span style="font-size:1.15rem;font-weight:800;letter-spacing:0.02em;color:${theme.text};font-family:'Playfair Display',Georgia,serif;">${esc(brandName)}</span>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:28px;">
          ${['home', 'catalog', 'about', 'contact'].map(p => `<a href="${path(p === 'home' ? 'index.html' : p + '/index.html')}" ${navAttrs(p)} style="text-decoration:none;font-size:0.88rem;font-weight:600;color:${page === p ? theme.primary : theme.textMuted};transition:color 0.2s;letter-spacing:0.02em;">${esc(ui[p as 'home' | 'catalog' | 'about' | 'contact'])}</a>`).join('')}
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 20px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.84rem;font-weight:700;box-shadow:0 3px 12px ${theme.accentGlow};">Inquire ↗</a>
        </div>
      </div>
    </header>
  `;

  // ── Footer ──
  const footerHtml = `
    <footer style="background:${isVideo ? '#0f1b2d' : '#1a2e1a'};color:#fff;padding:56px 24px 28px;">
      <div style="max-width:1280px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:36px;margin-bottom:36px;">
          <div>
            <div style="font-size:1.2rem;font-weight:800;margin-bottom:10px;font-family:'Playfair Display',Georgia,serif;">${esc(brandName)}</div>
            <p style="font-size:0.86rem;line-height:1.65;color:rgba(255,255,255,0.65);max-width:280px;">${esc(company.description || 'Premium stationery and office supplies for modern workspaces and creative professionals.')}</p>
            <div style="display:flex;gap:10px;margin-top:14px;">${ctx.socials}</div>
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${isVideo ? theme.accent2 : theme.accent2};margin-bottom:12px;">Navigate</div>
            ${['home', 'catalog', 'about', 'contact'].map(p => `<a href="${path(p === 'home' ? 'index.html' : p + '/index.html')}" ${navAttrs(p)} style="display:block;color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.86rem;padding:3px 0;">${esc(ui[p as 'home' | 'catalog' | 'about' | 'contact'])}</a>`).join('')}
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${isVideo ? theme.accent2 : theme.accent2};margin-bottom:12px;">Contact</div>
            <a href="mailto:${esc(company.email)}" style="display:block;color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.86rem;padding:3px 0;">${esc(company.email)}</a>
            ${company.phone ? `<span style="display:block;color:rgba(255,255,255,0.65);font-size:0.86rem;padding:3px 0;">${esc(company.phone)}</span>` : ''}
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${isVideo ? theme.accent2 : theme.accent2};margin-bottom:12px;">Office</div>
            <p style="font-size:0.86rem;color:rgba(255,255,255,0.65);line-height:1.5;">${esc(company.address || 'Worldwide Delivery')}</p>
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
      els.forEach(function(el){el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='opacity 0.6s ease, transform 0.6s ease';io.observe(el);});
    })();
    </script>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // ── STATIONERY STUDIO VIDEO HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:90px 0 110px;">
            <div style="position:absolute;inset:0;background:${theme.heroOverlay};pointer-events:none;"></div>
            <div style="max-width:1280px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:0.55fr 0.45fr;gap:52px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.76rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;border-left:3px solid ${theme.accent2};">
                  Premium Desk &amp; Writing Studio
                </div>
                <h1 style="font-size:clamp(2rem, 4.2vw, 3.2rem);font-weight:800;line-height:1.14;color:${theme.text};letter-spacing:-0.02em;margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Executive Writing Instruments & Luxury Desk Collections')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 28px;max-width:520px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Curated premium stationery and desk accessories for corporate gifting programs, boutique retailers, and luxury hotel amenity collections.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:32px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:13px 28px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:700;box-shadow:0 4px 16px ${theme.accentGlow};">View Collection ↗</a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:13px 24px;border-radius:8px;background:#fff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:600;">Corporate Inquiry</a>
                </div>
                <div style="display:flex;gap:28px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                  ${[{ val: 'ISO 14001', lab: 'Eco Certified' }, { val: '200+', lab: 'SKU Range' }, { val: '72hr', lab: 'Sample Lead Time' }].map(s => `
                    <div><div style="font-size:1.3rem;font-weight:800;color:${theme.primary};">${s.val}</div><div style="font-size:0.72rem;color:${theme.textSub};">${s.lab}</div></div>
                  `).join('')}
                </div>
              </div>
              <div style="position:relative;">
                <div style="border-radius:16px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 16px 48px rgba(0,0,0,0.08);">
                  <div style="position:relative;padding-top:68%;background:#0f1b2d;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,27,45,0.7) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;color:#fff;">
                      <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${theme.accent2};">Studio Collection</span>
                      <div style="font-size:0.95rem;font-weight:700;margin-top:4px;">${esc(heroProduct.name)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1280px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:48px;">
              <h2 style="font-size:1.9rem;font-weight:800;color:${theme.text};font-family:'Playfair Display',Georgia,serif;">Studio Collection</h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};margin-top:8px;">Executive-grade writing and desk accessories</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
              ${products.slice(0, 8).map((p) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:14px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                  <div style="padding-top:100%;position:relative;background:${theme.bg};"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;"></div>
                  <div style="padding:16px;border-top:1px solid ${theme.cardBorder};">
                    ${p.badge ? `<span style="font-size:0.66rem;font-weight:700;color:${theme.accent2};text-transform:uppercase;letter-spacing:0.06em;">${esc(p.badge)}</span>` : ''}
                    <h3 style="font-size:0.88rem;font-weight:700;color:${theme.text};margin:4px 0 4px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>

          <section data-reveal style="padding:60px 24px 80px;background:rgba(30,58,95,0.03);">
            <div style="max-width:1280px;margin:0 auto;">
              <h2 style="font-size:1.6rem;font-weight:800;color:${theme.text};text-align:center;margin:0 0 40px;font-family:'Playfair Display',Georgia,serif;">B2B Services</h2>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;">
                ${[
                  { icon: '🖋️', title: 'Custom Engraving', desc: 'Laser engraving and hot-stamp foiling for corporate gifting programs.' },
                  { icon: '📦', title: 'Private Label', desc: 'Full white-label packaging with your brand identity and collateral.' },
                  { icon: '🌿', title: 'Eco Materials', desc: 'FSC-certified paper, recycled plastics, and sustainable bamboo options.' },
                ].map(f => `
                  <div style="padding:28px;border-radius:14px;background:#fff;border:1px solid ${theme.cardBorder};text-align:center;">
                    <div style="font-size:2rem;margin-bottom:10px;">${f.icon}</div>
                    <h3 style="font-size:1rem;font-weight:700;color:${theme.text};margin:0 0 6px;">${f.title}</h3>
                    <p style="font-size:0.84rem;color:${theme.textMuted};margin:0;line-height:1.55;">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // ── STATIONERY CRAFT BANNER HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:100px 0 110px;background:${theme.heroOverlay};">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;background:repeating-linear-gradient(90deg, ${theme.cardBorder} 0, ${theme.cardBorder} 8px, transparent 8px, transparent 16px);"></div>
            <div style="max-width:1280px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.76rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:18px;">
                  <span style="display:inline-block;font-size:0.9rem;">✏️</span>
                  Stationery &amp; Office Supplies
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.8vw, 3.6rem);font-weight:900;line-height:1.1;color:${theme.text};letter-spacing:-0.02em;margin:0 0 18px;font-family:'Playfair Display',Georgia,serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Thoughtfully Crafted Stationery for Inspired Workspaces')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:520px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'FSC-certified notebooks, precision writing instruments, and sustainable desk accessories for retailers, corporate buyers, and creative studios.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">Shop Collection ↗</a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:#fff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">Wholesale Inquiry</a>
                </div>
              </div>
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 56px rgba(0,0,0,0.05);padding:20px;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:12px;">
                </div>
                <div style="position:absolute;bottom:-12px;right:-12px;width:80px;height:80px;border-radius:12px;background:${theme.pillBg};border:2px dashed ${theme.primary};opacity:0.5;"></div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1280px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:48px;">
              <h2 style="font-size:2rem;font-weight:900;color:${theme.text};font-family:'Playfair Display',Georgia,serif;">Featured Stationery</h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};margin-top:8px;">Eco-friendly materials meet timeless design</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">
              ${products.slice(0, 8).map((p) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                  <div style="padding-top:100%;position:relative;background:#fafcf8;"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;transition:transform 0.4s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'"></div>
                  <div style="padding:16px;border-top:1px solid ${theme.cardBorder};">
                    ${p.badge ? `<span style="font-size:0.66rem;font-weight:700;color:${theme.primary};text-transform:uppercase;letter-spacing:0.05em;">${esc(p.badge)}</span>` : ''}
                    <h3 style="font-size:0.9rem;font-weight:800;color:${theme.text};margin:4px 0 4px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.78rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>

          <section data-reveal style="padding:60px 24px 80px;background:rgba(107,143,113,0.04);">
            <div style="max-width:1280px;margin:0 auto;">
              <h2 style="font-size:1.6rem;font-weight:800;color:${theme.text};text-align:center;margin:0 0 40px;font-family:'Playfair Display',Georgia,serif;">Wholesale Advantages</h2>
              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
                ${[
                  { icon: '🌱', title: 'Sustainable', desc: 'FSC paper, plant-based inks, and biodegradable packaging.' },
                  { icon: '🎁', title: 'Gift Sets', desc: 'Pre-curated and bespoke gift box configurations.' },
                  { icon: '🏷️', title: 'White Label', desc: 'Complete private label with custom branding.' },
                  { icon: '✈️', title: 'Fast Shipping', desc: 'Express worldwide logistics in 3-5 business days.' },
                ].map(f => `
                  <div style="padding:24px;border-radius:14px;background:#fff;border:1px solid ${theme.cardBorder};text-align:center;">
                    <div style="font-size:1.8rem;margin-bottom:10px;">${f.icon}</div>
                    <h3 style="font-size:0.92rem;font-weight:700;color:${theme.text};margin:0 0 4px;">${f.title}</h3>
                    <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;line-height:1.5;">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:60px 24px 20px;text-align:center;">
          <h1 style="font-size:2.2rem;font-weight:800;font-family:'Playfair Display',Georgia,serif;margin:0 0 10px;">${esc(ui.catalog)}</h1>
          <p style="font-size:0.95rem;color:${theme.textMuted};">Full range of stationery and office products</p>
        </section>
        <section style="padding:20px 24px 80px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
            ${products.map((p) => `
              <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:14px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                <div style="padding-top:100%;position:relative;background:${theme.bg};"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;"></div>
                <div style="padding:14px;border-top:1px solid ${theme.cardBorder};">
                  <h3 style="font-size:0.88rem;font-weight:700;color:${theme.text};margin:0 0 4px;">${esc(p.name)}</h3>
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
              <img id="wr-detail-main-img" data-wr-material-image="product-main" data-wr-material-product="${esc(tp.id)}" src="${esc(tp.img)}" alt="${esc(tp.name)}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:12px;">
            </div>
            <div style="padding-top:16px;">
              ${tp.badge ? `<span style="display:inline-block;padding:4px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.74rem;font-weight:700;margin-bottom:14px;">${esc(tp.badge)}</span>` : ''}
              <h1 style="font-size:1.9rem;font-weight:800;color:${theme.text};margin:0 0 12px;line-height:1.2;font-family:'Playfair Display',Georgia,serif;">${esc(translated.name || tp.name)}</h1>
              <p style="font-size:0.98rem;line-height:1.7;color:${theme.textMuted};margin:0 0 20px;">${esc(translated.description || tp.desc)}</p>
              ${tp.material ? `<div style="padding:14px;border-radius:12px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:12px;"><span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Material</span><p style="font-size:0.88rem;color:${theme.text};margin:4px 0 0;">${esc(tp.material)}</p></div>` : ''}
              ${tp.dimensions ? `<div style="padding:14px;border-radius:12px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:20px;"><span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Specifications</span><p style="font-size:0.88rem;color:${theme.text};margin:4px 0 0;">${esc(tp.dimensions)}</p></div>` : ''}
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;display:inline-block;padding:13px 28px;border-radius:8px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:700;box-shadow:0 4px 16px ${theme.accentGlow};">Request Quote ↗</a>
            </div>
          </div>
        </section>
        <section data-reveal style="padding:40px 24px 80px;max-width:1280px;margin:0 auto;">
          <h2 style="font-size:1.5rem;font-weight:800;color:${theme.text};margin:0 0 24px;font-family:'Playfair Display',Georgia,serif;">Related Products</h2>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:18px;">
            ${products.filter(p => p.id !== tp.id).slice(0, 4).map(p => `
              <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;border-radius:12px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
                <div style="padding-top:100%;position:relative;background:${theme.bg};"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:14px;"></div>
                <div style="padding:12px;"><h3 style="font-size:0.84rem;font-weight:700;color:${theme.text};margin:0;">${esc(p.name)}</h3></div>
              </a>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, `About ${brandName}`);
    const aboutParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const defaultAbout = company.description || 'We design and manufacture premium stationery and office supplies, combining traditional craftsmanship with sustainable materials. Our products are trusted by retailers, corporations, and creative professionals worldwide.';
    const highlights = parseAboutHighlights(company.aboutHighlights);
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:80px 24px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;">
            <div>
              <h1 style="font-size:2.2rem;font-weight:800;color:${theme.text};margin:0 0 18px;font-family:'Playfair Display',Georgia,serif;">${esc(aboutHeadline)}</h1>
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
                  <div style="font-size:1.8rem;font-weight:800;color:${theme.primary};margin-bottom:4px;">${esc(h.value)}</div>
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
            <h1 style="font-size:2.2rem;font-weight:800;color:${theme.text};font-family:'Playfair Display',Georgia,serif;margin:0 0 10px;">${esc(ui.contact)}</h1>
            <p style="font-size:0.95rem;color:${theme.textMuted};">We welcome wholesale inquiries, corporate gifting projects, and OEM partnerships.</p>
          </div>
          <div style="border-radius:20px;background:#fff;border:1px solid ${theme.cardBorder};padding:36px;box-shadow:0 6px 24px rgba(0,0,0,0.03);">
            ${ctx.inquiryFormHtml}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-top:36px;">
            ${[
              { icon: '📧', label: 'Email', value: company.email },
              { icon: '📞', label: 'Phone', value: company.phone || 'On request' },
              { icon: '📍', label: 'Address', value: company.address || 'Global Delivery' },
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
