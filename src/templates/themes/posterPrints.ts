import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

export interface ThemedPosterItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  material: string;
  dimensions: string;
  tagline: string;
  img: string;
}

export const POSTER_DEFAULT_PRODUCTS: ThemedPosterItem[] = [
  {
    id: 'pst-1',
    name: 'Archival Giclée Fine Art Print — Matte',
    desc: '12-color giclée printing on 310 gsm museum-grade cotton rag paper with archival inks rated for 200+ years. Acid-free, OBA-free, ICC profiled.',
    badge: 'Museum Grade',
    material: '310 gsm 100% cotton rag + Epson UltraChrome HDX inks',
    dimensions: 'A3 / A2 / A1 / Custom · 200+ year lightfastness',
    tagline: 'Museum-Grade Cotton Rag with 200-Year Archival Inks',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'pst-2',
    name: 'Holographic Die-Cut Vinyl Sticker Pack',
    desc: 'Premium holographic vinyl stickers with rainbow shift effect, waterproof lamination, kiss-cut precision, and strong permanent adhesive. UV resistant.',
    badge: 'Holographic',
    material: 'Holographic PET vinyl + UV-resistant matte lamination',
    dimensions: '50 × 50 mm to 100 × 100 mm · waterproof · UV stable 5+ years',
    tagline: 'Rainbow-Shift Holographic with UV-Resistant Lamination',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'pst-3',
    name: 'Gallery-Wrapped Stretched Canvas Print',
    desc: 'Museum-quality poly-cotton canvas with 1.5" solid pine stretcher bars, mirrored edges, wire hanging hardware, and protective UV varnish coating.',
    badge: 'Gallery Ready',
    material: 'Poly-cotton 400 gsm canvas + kiln-dried pine stretcher',
    dimensions: '30 × 40 cm to 100 × 150 cm · 3.8 cm depth · wire-hung',
    tagline: 'Stretched Pine Frame with UV Protective Varnish',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'pst-4',
    name: 'Custom Frosted Clear Vinyl Decal Sheet',
    desc: 'Semi-transparent frosted vinyl decals with micro-perforated backing for bubble-free application, removable repositionable adhesive, indoor/outdoor rated.',
    badge: 'Frosted Effect',
    material: 'Frosted PVC vinyl + repositionable micro-dot adhesive',
    dimensions: 'Custom sizes · removable · indoor/outdoor rated 3+ years',
    tagline: 'Bubble-Free Micro-Dot Repositionable Application',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'pst-5',
    name: 'Letterpress Greeting Card Set — Cotton Stock',
    desc: 'Blind debossed and 2-color letterpress printed on 600 gsm cotton stock with deckled edges, paired with kraft paper envelopes.',
    badge: 'Letterpress',
    material: '600 gsm Crane Lettra cotton + Pantone spot inks',
    dimensions: 'A6 folded (105 × 148 mm) · 12 cards + 12 envelopes',
    tagline: 'Deep-Impression Letterpress on 600 gsm Cotton',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'pst-6',
    name: 'Removable Fabric Wall Decal — Matte Polyester',
    desc: 'Repositionable self-adhesive polyester fabric wall decal with matte finish, leaves no residue, safe for painted walls, eco-solvent printed.',
    badge: 'Wall Safe',
    material: 'Woven polyester fabric + residue-free adhesive',
    dimensions: 'Custom die-cut · repositionable · wall-safe adhesive',
    tagline: 'Residue-Free Repositionable Woven Polyester Fabric',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'pst-7',
    name: 'Risograph Art Zine — Soy Ink Edition',
    desc: 'Two-color soy-based risograph printed art zine on 120 gsm recycled uncoated stock, saddle-stitched with hand-numbered limited edition run.',
    badge: 'Limited Edition',
    material: '120 gsm recycled uncoated stock + soy-based riso inks',
    dimensions: 'A5 (148 × 210 mm) · 24 pages · saddle-stitched',
    tagline: 'Soy-Based Risograph on 100% Recycled Uncoated Stock',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'pst-8',
    name: 'Metallic Foil Embossed Photo Print',
    desc: 'Photographic print with selective metallic foil stamping and blind emboss on 350 gsm coated art paper, creating a premium tactile finish.',
    badge: 'Foil Embossed',
    material: '350 gsm C2S art paper + hot-stamped metallic foil',
    dimensions: 'A4 / A3 / Custom · selective gold/silver/rose-gold foil',
    tagline: 'Hot-Stamped Metallic Foil with Blind Emboss Texture',
    img: '/templates/senseng/products-8.jpg',
  },
];

function getPosterProducts(ctx: ThemeContext): ThemedPosterItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Print Product ${idx + 1}`,
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
      const fallback = POSTER_DEFAULT_PRODUCTS[idx % POSTER_DEFAULT_PRODUCTS.length]!;
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
  return POSTER_DEFAULT_PRODUCTS;
}

export function renderPosterPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getPosterProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'Gallery Press' : 'PrintCraft Studio');

  const theme = isVideo
    ? {
        bg: '#fffaf5',
        cardBg: '#ffffff',
        cardBorder: 'rgba(255, 107, 53, 0.12)',
        primary: '#e84820',
        primaryHover: '#c53b18',
        text: '#3b1a0a',
        textMuted: '#7a5a48',
        textSub: '#a68874',
        glassBg: 'rgba(255, 250, 245, 0.94)',
        pillBg: '#fff0e6',
        pillText: '#c53b18',
        btnGradient: 'linear-gradient(135deg, #ff6b35 0%, #e84820 50%, #ff4081 100%)',
        accentGlow: 'rgba(255, 107, 53, 0.22)',
        accent2: '#ff4081',
        heroOverlay: 'linear-gradient(135deg, rgba(255,107,53,0.05) 0%, rgba(255,64,129,0.03) 100%)',
      }
    : {
        bg: '#fefbff',
        cardBg: '#ffffff',
        cardBorder: 'rgba(233, 30, 140, 0.10)',
        primary: '#d41876',
        primaryHover: '#b5145f',
        text: '#2d1040',
        textMuted: '#6b4a78',
        textSub: '#9474a0',
        glassBg: 'rgba(254, 251, 255, 0.93)',
        pillBg: '#fce4f4',
        pillText: '#b5145f',
        btnGradient: 'linear-gradient(135deg, #e91e8c 0%, #d41876 50%, #00bcd4 100%)',
        accentGlow: 'rgba(233, 30, 140, 0.18)',
        accent2: '#00bcd4',
        heroOverlay: 'linear-gradient(135deg, rgba(233,30,140,0.04) 0%, rgba(0,188,212,0.03) 100%)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // ── Header ──
  const headerHtml = `
    <header style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};">
      <div style="max-width:1320px;margin:0 auto;height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:34px;width:auto;">` : ''}
          <span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.01em;color:${theme.text};font-family:'Space Grotesk','Inter',system-ui,sans-serif;">${esc(brandName)}</span>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:24px;">
          ${['home', 'catalog', 'about', 'contact'].map(p => `<a href="${path(p === 'home' ? 'index.html' : p + '/index.html')}" ${navAttrs(p)} style="text-decoration:none;font-size:0.88rem;font-weight:700;color:${page === p ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui[p as 'home' | 'catalog' | 'about' | 'contact'])}</a>`).join('')}
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 20px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.84rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">Order Now ↗</a>
        </div>
      </div>
    </header>
  `;

  // ── Footer ──
  const footerHtml = `
    <footer style="background:${theme.text};color:#fff;padding:56px 24px 28px;">
      <div style="max-width:1320px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:36px;margin-bottom:36px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;margin-bottom:10px;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">${esc(brandName)}</div>
            <p style="font-size:0.86rem;line-height:1.65;color:rgba(255,255,255,0.65);max-width:280px;">${esc(company.description || 'Premium printing and graphic products for artists, brands, and retail distributors worldwide.')}</p>
            <div style="display:flex;gap:10px;margin-top:14px;">${ctx.socials}</div>
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${theme.accent2};margin-bottom:12px;">Pages</div>
            ${['home', 'catalog', 'about', 'contact'].map(p => `<a href="${path(p === 'home' ? 'index.html' : p + '/index.html')}" ${navAttrs(p)} style="display:block;color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.86rem;padding:3px 0;">${esc(ui[p as 'home' | 'catalog' | 'about' | 'contact'])}</a>`).join('')}
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${theme.accent2};margin-bottom:12px;">Contact</div>
            <a href="mailto:${esc(company.email)}" style="display:block;color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.86rem;padding:3px 0;">${esc(company.email)}</a>
            ${company.phone ? `<span style="display:block;color:rgba(255,255,255,0.65);font-size:0.86rem;padding:3px 0;">${esc(company.phone)}</span>` : ''}
          </div>
          <div>
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${theme.accent2};margin-bottom:12px;">Location</div>
            <p style="font-size:0.86rem;color:rgba(255,255,255,0.65);line-height:1.5;">${esc(company.address || 'Global Shipping')}</p>
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
      var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0) scale(1)';io.unobserve(e.target);}});},{threshold:0.1});
      els.forEach(function(el){el.style.opacity='0';el.style.transform='translateY(32px) scale(0.97)';el.style.transition='opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1)';io.observe(el);});
    })();
    </script>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // ── POSTER GALLERY VIDEO HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;">
            <div style="position:absolute;inset:0;background:${theme.heroOverlay};pointer-events:none;"></div>
            <div style="position:absolute;top:20%;left:-5%;width:300px;height:300px;border-radius:50%;background:rgba(255,64,129,0.05);pointer-events:none;animation:wrFloat 6s ease-in-out infinite;"></div>
            <div style="max-width:1320px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;border:1px solid ${theme.cardBorder};box-shadow:0 20px 56px rgba(0,0,0,0.08);">
                  <div style="position:relative;padding-top:66%;background:#1a0a08;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(59,26,10,0.6) 0%, transparent 60%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;color:#fff;">
                      <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${theme.accent2};background:rgba(255,64,129,0.2);padding:3px 10px;border-radius:4px;">Gallery Exhibition</span>
                      <div style="font-size:0.95rem;font-weight:800;margin-top:6px;">Print Production Showcase</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};animation:wrPulse 2s infinite;"></span>
                  Gallery-Quality Print Production
                </div>
                <h1 style="font-size:clamp(2rem, 4.2vw, 3.2rem);font-weight:900;line-height:1.12;color:${theme.text};letter-spacing:-0.03em;margin:0 0 16px;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Exhibition-Grade Art Prints & Graphic Products')}
                </h1>
                <p style="font-size:1.05rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;max-width:520px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Museum-quality giclée prints, holographic stickers, and luxury packaging for galleries, art retailers, and merchandising brands worldwide.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 24px ${theme.accentGlow};">Browse Gallery ↗</a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:999px;background:#fff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">Custom Print Inquiry</a>
                </div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1320px;margin:0 auto;">
            <h2 style="font-size:2rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 12px;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">Gallery Collection</h2>
            <p style="font-size:0.95rem;color:${theme.textMuted};text-align:center;margin:0 0 48px;">Museum-quality prints and graphic products</p>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
              ${products.slice(0, 8).map((p) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:16px;background:#fff;overflow:hidden;border:1px solid ${theme.cardBorder};transition:transform 0.35s, box-shadow 0.35s;" onmouseover="this.style.transform='translateY(-6px) rotate(0.5deg)';this.style.boxShadow='0 14px 36px rgba(255,107,53,0.12)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                  <div style="padding-top:100%;position:relative;background:linear-gradient(135deg, #fff8f3 0%, #fff 100%);"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;transition:transform 0.4s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'"></div>
                  <div style="padding:16px;">
                    ${p.badge ? `<span style="font-size:0.66rem;font-weight:800;color:${theme.accent2};text-transform:uppercase;letter-spacing:0.06em;">${esc(p.badge)}</span>` : ''}
                    <h3 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:4px 0 4px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>

          <section data-reveal style="padding:60px 24px 80px;background:${theme.heroOverlay};">
            <div style="max-width:1320px;margin:0 auto;">
              <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 40px;">Printing Capabilities</h2>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;">
                ${[
                  { icon: '🖼️', title: 'Giclée & Fine Art', desc: '12-color archival printing on museum-grade cotton rag and canvas substrates.' },
                  { icon: '✨', title: 'Specialty Finishes', desc: 'Holographic, metallic foil, spot UV, embossing, and die-cut processing.' },
                  { icon: '📐', title: 'Custom Sizes', desc: 'From miniature sticker sheets to 2-meter wide-format gallery prints.' },
                ].map(f => `
                  <div style="padding:28px;border-radius:16px;background:rgba(255,255,255,0.85);backdrop-filter:blur(12px);border:1px solid ${theme.cardBorder};text-align:center;">
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
      // ── POSTER GRAPHIC BANNER HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:100px 0 120px;background:${theme.heroOverlay};">
            <div style="position:absolute;top:-40px;right:10%;width:200px;height:200px;border-radius:50%;border:3px solid rgba(233,30,140,0.1);pointer-events:none;animation:wrFloat 5s ease-in-out infinite;"></div>
            <div style="position:absolute;bottom:5%;left:5%;width:80px;height:80px;background:rgba(0,188,212,0.08);transform:rotate(45deg);pointer-events:none;"></div>
            <div style="position:absolute;top:30%;right:3%;width:60px;height:60px;border-radius:50%;background:rgba(233,30,140,0.06);pointer-events:none;animation:wrFloat 4s ease-in-out infinite 1s;"></div>
            <div style="max-width:1320px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;">
                  <span style="display:inline-block;font-size:0.9rem;">🎨</span>
                  Art Prints &amp; Graphic Products
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 4rem);font-weight:900;line-height:1.06;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Bold Graphics. Premium Prints. Unlimited Creativity.')}
                </h1>
                <p style="font-size:1.08rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:520px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Wholesale printing solutions: archival art prints, holographic stickers, die-cut decals, and luxury packaging for creative brands and retail merchandisers.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 34px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:1rem;font-weight:800;box-shadow:0 8px 28px ${theme.accentGlow};">Explore Prints ↗</a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 28px;border-radius:999px;background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);color:${theme.text};border:1px solid ${theme.cardBorder};font-size:1rem;font-weight:700;">Custom Quote</a>
                </div>
              </div>
              <div style="position:relative;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  ${products.slice(0, 4).map((p, i) => `
                    <div style="border-radius:16px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 8px 24px rgba(0,0,0,0.04);transform:rotate(${i % 2 === 0 ? '-1' : '1'}deg);transition:transform 0.3s;" onmouseover="this.style.transform='rotate(0) scale(1.03)'" onmouseout="this.style.transform='rotate(${i % 2 === 0 ? '-1' : '1'}deg)'">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:contain;padding:12px;">
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1320px;margin:0 auto;">
            <h2 style="font-size:2.2rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 12px;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">Product Catalog</h2>
            <p style="font-size:0.95rem;color:${theme.textMuted};text-align:center;margin:0 0 48px;">Art prints, stickers, decals, and graphic merchandise</p>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
              ${products.slice(0, 8).map((p) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 12px 32px rgba(233,30,140,0.1)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                  <div style="padding-top:100%;position:relative;background:linear-gradient(135deg, #fef5ff 0%, #fff 100%);"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;"></div>
                  <div style="padding:16px;">
                    ${p.badge ? `<span style="font-size:0.66rem;font-weight:800;color:${theme.primary};text-transform:uppercase;letter-spacing:0.05em;padding:2px 8px;border-radius:4px;background:${theme.pillBg};">${esc(p.badge)}</span>` : ''}
                    <h3 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:6px 0 4px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.76rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>

          <section data-reveal style="padding:60px 24px 80px;background:${theme.heroOverlay};">
            <div style="max-width:1320px;margin:0 auto;">
              <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 40px;">Why Choose Us</h2>
              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
                ${[
                  { icon: '🎯', title: 'Precision Color', desc: 'ICC-profiled G7 Master certified color management.' },
                  { icon: '♻️', title: 'Eco Printing', desc: 'Soy inks, FSC substrates, carbon-neutral production.' },
                  { icon: '⚡', title: 'Fast Turnaround', desc: '48-hour rush production available for urgent orders.' },
                  { icon: '🛡️', title: 'Quality Control', desc: '100% visual inspection with spectrophotometer verification.' },
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

          <section data-reveal style="padding:60px 24px;max-width:1320px;margin:0 auto;text-align:center;">
            <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 14px;">Start Your Custom Print Project</h2>
            <p style="font-size:0.95rem;color:${theme.textMuted};margin:0 0 28px;">Share your artwork and we will provide a detailed quote within 24 hours.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 40px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:1rem;font-weight:800;box-shadow:0 8px 28px ${theme.accentGlow};">Get a Quote ↗</a>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:60px 24px 20px;text-align:center;">
          <h1 style="font-size:2.4rem;font-weight:900;font-family:'Space Grotesk','Inter',system-ui,sans-serif;margin:0 0 10px;">${esc(ui.catalog)}</h1>
          <p style="font-size:0.95rem;color:${theme.textMuted};">Full range of printing and graphic products</p>
        </section>
        <section style="padding:20px 24px 80px;max-width:1320px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;">
            ${products.map((p) => `
              <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.07)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                <div style="padding-top:100%;position:relative;background:${theme.bg};"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;"></div>
                <div style="padding:14px;">
                  <h3 style="font-size:0.88rem;font-weight:800;color:${theme.text};margin:0 0 4px;">${esc(p.name)}</h3>
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
            <div style="border-radius:20px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};padding:20px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <img id="wr-detail-main-img" data-wr-material-image="product-main" data-wr-material-product="${esc(tp.id)}" src="${esc(tp.img)}" alt="${esc(tp.name)}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:12px;">
            </div>
            <div style="padding-top:16px;">
              ${tp.badge ? `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.74rem;font-weight:800;margin-bottom:14px;">${esc(tp.badge)}</span>` : ''}
              <h1 style="font-size:1.9rem;font-weight:900;color:${theme.text};margin:0 0 12px;line-height:1.2;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">${esc(translated.name || tp.name)}</h1>
              <p style="font-size:0.98rem;line-height:1.7;color:${theme.textMuted};margin:0 0 20px;">${esc(translated.description || tp.desc)}</p>
              ${tp.material ? `<div style="padding:14px;border-radius:12px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:12px;"><span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Material</span><p style="font-size:0.88rem;color:${theme.text};margin:4px 0 0;">${esc(tp.material)}</p></div>` : ''}
              ${tp.dimensions ? `<div style="padding:14px;border-radius:12px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:20px;"><span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Specifications</span><p style="font-size:0.88rem;color:${theme.text};margin:4px 0 0;">${esc(tp.dimensions)}</p></div>` : ''}
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;display:inline-block;padding:13px 28px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">Request Quote ↗</a>
            </div>
          </div>
        </section>
        <section data-reveal style="padding:40px 24px 80px;max-width:1280px;margin:0 auto;">
          <h2 style="font-size:1.5rem;font-weight:900;color:${theme.text};margin:0 0 24px;">More Products</h2>
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
    const defaultAbout = company.description || 'We are a professional printing and graphic products manufacturer, delivering museum-grade art prints, premium stickers, and custom packaging to creative brands and retailers worldwide.';
    const highlights = parseAboutHighlights(company.aboutHighlights);
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:80px 24px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;">
            <div>
              <h1 style="font-size:2.2rem;font-weight:900;color:${theme.text};margin:0 0 18px;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">${esc(aboutHeadline)}</h1>
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
            <h1 style="font-size:2.2rem;font-weight:900;color:${theme.text};font-family:'Space Grotesk','Inter',system-ui,sans-serif;margin:0 0 10px;">${esc(ui.contact)}</h1>
            <p style="font-size:0.95rem;color:${theme.textMuted};">Custom print quotes, wholesale orders, and partnership inquiries.</p>
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
