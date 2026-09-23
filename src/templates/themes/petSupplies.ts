import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

export interface ThemedPetItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  material: string;
  dimensions: string;
  tagline: string;
  img: string;
}

export const PET_DEFAULT_PRODUCTS: ThemedPetItem[] = [
  {
    id: 'pet-1',
    name: 'Premium Braided Nylon Adjustable Dog Collar',
    desc: 'Triple-layer braided nylon collar with aerospace-grade aluminum D-ring, reflective stitching for night visibility, and quick-release magnetic buckle.',
    badge: 'Best Seller',
    material: 'Military-grade 900D nylon + anodized aluminum hardware',
    dimensions: 'S/M/L/XL adjustable · 2.5 cm width · 100 kg tensile strength',
    tagline: 'Night-Visible Safety with Reflective Triple Stitching',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'pet-2',
    name: 'Ergonomic Memory Foam Orthopedic Pet Bed',
    desc: 'Veterinarian-recommended orthopedic pet bed with dual-density memory foam core, waterproof inner liner, and machine-washable micro-suede cover.',
    badge: 'Vet Approved',
    material: 'CertiPUR-US certified memory foam + OEKO-TEX micro-suede',
    dimensions: '90 × 70 × 22 cm · supports up to 45 kg',
    tagline: 'Joint-Relief Comfort Endorsed by Veterinary Orthopedists',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'pet-3',
    name: 'Interactive Treat-Dispensing Puzzle Ball',
    desc: 'BPA-free natural rubber puzzle ball with adjustable difficulty chambers, designed to slow feeding and stimulate cognitive development in dogs.',
    badge: 'Brain Training',
    material: '100% natural rubber · FDA-compliant food-safe dyes',
    dimensions: 'Diameter 10 cm · 3 difficulty levels · dishwasher safe',
    tagline: 'Slow-Feeding Cognitive Stimulation for Active Minds',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'pet-4',
    name: 'Stainless Steel Elevated Double Bowl Stand',
    desc: 'Anti-slip elevated feeding station with twin 304 stainless steel bowls, silicone splash guard, and bamboo frame designed for comfortable dining posture.',
    badge: 'Ergonomic Design',
    material: '304 stainless steel bowls + sustainable Moso bamboo frame',
    dimensions: '38 × 18 × 12 cm · 2 × 400 ml capacity',
    tagline: 'Posture-Perfect Elevated Dining for Healthier Digestion',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'pet-5',
    name: 'Airline-Approved Expandable Pet Carrier',
    desc: 'TSA and IATA compliant soft-shell carrier with mesh ventilation panels, expandable side compartment, and integrated luggage sleeve for travel.',
    badge: 'Travel Ready',
    material: 'Water-resistant Oxford fabric + breathable mesh panels',
    dimensions: '45 × 28 × 28 cm (expandable to 60 cm) · up to 9 kg',
    tagline: 'IATA-Compliant Ventilated Travel Freedom',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'pet-6',
    name: 'Self-Cleaning Slicker Grooming Brush',
    desc: 'One-click self-cleaning slicker brush with flexible stainless steel pins, anti-static coating, and ergonomic rubberized grip for effortless grooming.',
    badge: 'Pro Grooming',
    material: 'Flexible SS304 pins + TPR anti-fatigue handle',
    dimensions: '19 × 8 × 5 cm · 140 fine pins · all coat types',
    tagline: 'One-Button Self-Cleaning for Effortless Daily Grooming',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'pet-7',
    name: 'Retractable Heavy-Duty Dog Leash with LED',
    desc: 'Spring-loaded retractable leash with 5 m tape, built-in LED flashlight, ergonomic one-hand brake-and-lock system, and waste bag dispenser.',
    badge: 'LED Equipped',
    material: 'ABS impact-resistant casing + nylon reinforced tape',
    dimensions: '5 m retractable length · supports up to 50 kg · rechargeable LED',
    tagline: 'One-Handed Control with Built-in LED Illumination',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'pet-8',
    name: 'Reflective Waterproof Dog Raincoat',
    desc: 'Lightweight waterproof raincoat with sealed seams, 3M reflective strips, adjustable Velcro belly strap, and built-in harness hole for leash attachment.',
    badge: 'All Weather',
    material: 'PU-coated ripstop fabric + 3M Scotchlite reflective strips',
    dimensions: 'XS to XXL · waterproof rating 10,000 mm H2O',
    tagline: 'Sealed-Seam Storm Protection with 3M Reflective Visibility',
    img: '/templates/senseng/products-8.jpg',
  },
];

function getPetProducts(ctx: ThemeContext): ThemedPetItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Pet Product ${idx + 1}`,
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
      const fallback = PET_DEFAULT_PRODUCTS[idx % PET_DEFAULT_PRODUCTS.length]!;
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
  return PET_DEFAULT_PRODUCTS;
}

export function renderPetSuppliesPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const page = ctx.page;
  const products = getPetProducts(ctx);
  const heroProduct = products[0]!;

  const brandName = company.name || (isVideo ? 'PetWell Studio' : 'PawCraft Co.');

  const theme = isVideo
    ? {
        bg: '#f0fdfa',
        cardBg: '#ffffff',
        cardBorder: 'rgba(13, 148, 136, 0.14)',
        primary: '#0d9488',
        primaryHover: '#0f766e',
        text: '#134e4a',
        textMuted: '#5f7a78',
        textSub: '#7c9e9c',
        glassBg: 'rgba(240, 253, 250, 0.92)',
        pillBg: '#ccfbf1',
        pillText: '#0f766e',
        btnGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        accentGlow: 'rgba(13, 148, 136, 0.20)',
        heroOverlay: 'linear-gradient(135deg, rgba(13,148,136,0.06) 0%, rgba(20,184,166,0.04) 100%)',
        accent2: '#14b8a6',
      }
    : {
        bg: '#fef7f4',
        cardBg: '#ffffff',
        cardBorder: 'rgba(255, 107, 107, 0.14)',
        primary: '#e85d5d',
        primaryHover: '#dc2626',
        text: '#3b1f0e',
        textMuted: '#7a5a45',
        textSub: '#a08272',
        glassBg: 'rgba(254, 247, 244, 0.92)',
        pillBg: '#fde8e0',
        pillText: '#dc2626',
        btnGradient: 'linear-gradient(135deg, #e85d5d 0%, #dc2626 100%)',
        accentGlow: 'rgba(255, 107, 107, 0.20)',
        heroOverlay: 'linear-gradient(135deg, rgba(255,107,107,0.06) 0%, rgba(251,146,60,0.04) 100%)',
        accent2: '#fb923c',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // ── Shared header ──
  const headerHtml = `
    <header style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 1px 12px rgba(0,0,0,0.03);">
      <div style="max-width:1280px;margin:0 auto;height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:36px;width:auto;object-fit:contain;">` : ''}
          <span style="font-size:1.3rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:'Nunito','Quicksand',system-ui,sans-serif;">${esc(brandName)}</span>
        </a>
        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:26px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 16px ${theme.accentGlow};">
            Get a Quote ↗
          </a>
        </div>
      </div>
    </header>
  `;

  // ── Shared footer ──
  const footerHtml = `
    <footer style="background:${theme.text};color:#ffffff;padding:60px 24px 32px;">
      <div style="max-width:1280px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.3rem;font-weight:900;margin-bottom:12px;font-family:'Nunito','Quicksand',system-ui,sans-serif;">${esc(brandName)}</div>
            <p style="font-size:0.88rem;line-height:1.65;color:rgba(255,255,255,0.7);max-width:300px;">
              ${esc(company.description || 'Premium pet supplies engineered for comfort, safety, and the wellbeing of your beloved companions.')}
            </p>
            <div style="display:flex;gap:12px;margin-top:16px;">${ctx.socials}</div>
          </div>
          <div>
            <div style="font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${theme.primary};margin-bottom:14px;">Quick Links</div>
            <a href="${path('index.html')}" ${navAttrs('home')} style="display:block;color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.88rem;padding:4px 0;">${esc(ui.home)}</a>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="display:block;color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.88rem;padding:4px 0;">${esc(ui.catalog)}</a>
            <a href="${path('about/index.html')}" ${navAttrs('about')} style="display:block;color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.88rem;padding:4px 0;">${esc(ui.about)}</a>
          </div>
          <div>
            <div style="font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${theme.primary};margin-bottom:14px;">Support</div>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:block;color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.88rem;padding:4px 0;">${esc(ui.contact)}</a>
            <a href="mailto:${esc(company.email)}" style="display:block;color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.88rem;padding:4px 0;">${esc(company.email)}</a>
          </div>
          <div>
            <div style="font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${theme.primary};margin-bottom:14px;">Location</div>
            <p style="font-size:0.88rem;color:rgba(255,255,255,0.7);line-height:1.5;">${esc(company.address || 'Global Shipping Available')}</p>
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:24px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:rgba(255,255,255,0.5);">&copy; ${new Date().getUTCFullYear()} ${esc(brandName)}. ${esc(ui.rights)}</span>
          <div class="languages" style="display:flex;gap:8px;">${ctx.languageLinks}</div>
        </div>
      </div>
    </footer>
  `;

  // ── Scroll reveal + paw animation script ──
  const animScript = `
    <script>
    (function(){
      var els=document.querySelectorAll('[data-reveal]');
      if(!els.length)return;
      var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';io.unobserve(e.target);}});},{threshold:0.12});
      els.forEach(function(el){el.style.opacity='0';el.style.transform='translateY(28px)';el.style.transition='opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)';io.observe(el);});
    })();
    </script>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // ── PET WELLNESS VIDEO HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;">
            <div style="position:absolute;inset:0;background:${theme.heroOverlay};pointer-events:none;"></div>
            <div style="position:absolute;top:-60px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%);pointer-events:none;"></div>
            <div style="max-width:1280px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;position:relative;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};animation:wrPulse 2s infinite;"></span>
                  Pet Wellness & Care Essentials
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.12;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;font-family:'Nunito','Quicksand',system-ui,sans-serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Veterinary-Grade Pet Care & Wellness Supplies')}
                </h1>
                <p style="font-size:1.1rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;max-width:540px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'Scientifically formulated nutrition, ergonomic comfort systems, and certified-safe accessories for professional breeders and pet care distributors worldwide.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 24px ${theme.accentGlow};">
                    Explore Collection ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:999px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    Partnership Inquiry
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div><div style="font-size:1.5rem;font-weight:900;color:${theme.primary};">500+</div><div style="font-size:0.75rem;color:${theme.textSub};">SKUs Available</div></div>
                  <div><div style="font-size:1.5rem;font-weight:900;color:${theme.primary};">ISO 9001</div><div style="font-size:0.75rem;color:${theme.textSub};">Certified Production</div></div>
                  <div><div style="font-size:1.5rem;font-weight:900;color:${theme.primary};">48hr</div><div style="font-size:0.75rem;color:${theme.textSub};">Sample Dispatch</div></div>
                </div>
              </div>
              <div style="position:relative;">
                <div style="border-radius:24px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 60px rgba(0,0,0,0.06);">
                  <div style="position:relative;padding-top:66%;background:#0f172a;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.88;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(13,148,136,0.6) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#fff;">
                      <span style="font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${theme.accent2};background:rgba(20,184,166,0.2);padding:3px 10px;border-radius:4px;">Pet Wellness Showcase</span>
                      <div style="font-size:1rem;font-weight:800;margin-top:6px;">${esc(heroProduct.name)}</div>
                    </div>
                  </div>
                </div>
                <div style="position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:${theme.pillBg};opacity:0.6;animation:wrFloat 4s ease-in-out infinite;"></div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1280px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:48px;">
              <h2 style="font-size:2rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;margin:0 0 12px;">Featured Products</h2>
              <p style="font-size:1rem;color:${theme.textMuted};max-width:500px;margin:0 auto;">Curated wellness-focused solutions for modern pet care businesses</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">
              ${products.slice(0, 8).map((p, i) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:20px;background:#ffffff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;box-shadow:0 4px 16px rgba(0,0,0,0.04);" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.04)'">
                  <div style="padding-top:100%;position:relative;background:${theme.bg};overflow:hidden;">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
                    ${p.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;letter-spacing:0.04em;">${esc(p.badge)}</span>` : ''}
                  </div>
                  <div style="padding:16px;">
                    <h3 style="font-size:0.92rem;font-weight:800;color:${theme.text};margin:0 0 6px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.78rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
            <div style="text-align:center;margin-top:40px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 36px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.94rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">View Full Catalog ↗</a>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;background:rgba(13,148,136,0.03);">
            <div style="max-width:1280px;margin:0 auto;">
              <h2 style="font-size:1.8rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 48px;">Why Partner With Us</h2>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;">
                ${[
                  { icon: '🏭', title: 'OEM/ODM Capability', desc: 'Full-cycle custom manufacturing with your branding, packaging, and specifications.' },
                  { icon: '🔬', title: 'Safety Certified', desc: 'All products pass FDA, REACH, and CPSIA safety testing for global distribution.' },
                  { icon: '🚚', title: 'Global Logistics', desc: 'DDP/FOB shipping with consolidated container solutions for bulk orders.' },
                ].map(f => `
                  <div style="padding:32px;border-radius:20px;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 4px 16px rgba(0,0,0,0.03);text-align:center;">
                    <div style="font-size:2.4rem;margin-bottom:14px;">${f.icon}</div>
                    <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};margin:0 0 8px;">${f.title}</h3>
                    <p style="font-size:0.88rem;color:${theme.textMuted};margin:0;line-height:1.6;">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // ── PET SUPPLIES BANNER HERO ──
      mainHtml = `
        <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:100px 0 120px;background:${theme.heroOverlay};">
            <div style="position:absolute;top:10%;left:5%;width:160px;height:160px;border-radius:50%;background:rgba(255,107,107,0.06);animation:wrFloat 5s ease-in-out infinite;pointer-events:none;"></div>
            <div style="position:absolute;bottom:10%;right:8%;width:120px;height:120px;border-radius:50%;background:rgba(251,146,60,0.06);animation:wrFloat 6s ease-in-out infinite 1s;pointer-events:none;"></div>
            <div style="max-width:1280px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;position:relative;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="display:inline-block;font-size:1rem;">🐾</span>
                  Premium Pet Supplies
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.8rem);font-weight:900;line-height:1.08;color:${theme.text};letter-spacing:-0.03em;margin:0 0 20px;font-family:'Nunito','Quicksand',system-ui,sans-serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || 'Crafted with Love, Engineered for Comfort')}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;max-width:520px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || 'B2B wholesale pet accessories featuring safety-certified materials, ergonomic designs, and customizable branding for global pet retailers and distributors.')}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:14px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:16px 34px;border-radius:999px;background:${theme.btnGradient};color:#ffffff;font-size:1rem;font-weight:800;box-shadow:0 8px 28px ${theme.accentGlow};transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    Browse Collection ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:16px 28px;border-radius:999px;background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);color:${theme.text};border:1px solid ${theme.cardBorder};font-size:1rem;font-weight:700;">
                    Our Story
                  </a>
                </div>
              </div>
              <div style="position:relative;">
                <div style="border-radius:28px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 64px rgba(0,0,0,0.06);padding:24px;">
                  <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:16px;">
                </div>
                <div style="position:absolute;top:-16px;right:-16px;padding:10px 18px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.78rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};animation:wrFloat 3s ease-in-out infinite;">
                  🐾 New Arrival
                </div>
              </div>
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;max-width:1280px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:52px;">
              <h2 style="font-size:2.2rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;margin:0 0 12px;">Our Best-Selling Products</h2>
              <p style="font-size:1rem;color:${theme.textMuted};max-width:480px;margin:0 auto;">Safety-tested, eco-conscious pet supplies designed for wholesale distribution</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">
              ${products.slice(0, 8).map((p, i) => `
                <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:24px;background:#ffffff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s;box-shadow:0 2px 12px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-8px) rotate(-0.5deg)';this.style.boxShadow='0 16px 40px rgba(255,107,107,0.12)'" onmouseout="this.style.transform='translateY(0) rotate(0)';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.03)'">
                  <div style="padding-top:100%;position:relative;background:linear-gradient(135deg, #fff5f3 0%, #fff 100%);overflow:hidden;">
                    <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:20px;transition:transform 0.5s cubic-bezier(.22,1,.36,1);">
                    ${p.badge ? `<span style="position:absolute;top:14px;left:14px;padding:5px 12px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.7rem;font-weight:800;">${esc(p.badge)}</span>` : ''}
                  </div>
                  <div style="padding:18px;">
                    <h3 style="font-size:0.94rem;font-weight:800;color:${theme.text};margin:0 0 6px;line-height:1.35;">${esc(p.name)}</h3>
                    <p style="font-size:0.8rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.tagline || p.desc)}</p>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>

          <section data-reveal style="padding:80px 24px;background:linear-gradient(135deg, rgba(255,107,107,0.04) 0%, rgba(251,146,60,0.03) 100%);">
            <div style="max-width:1280px;margin:0 auto;">
              <h2 style="font-size:1.8rem;font-weight:900;color:${theme.text};text-align:center;margin:0 0 48px;">B2B Advantages</h2>
              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">
                ${[
                  { icon: '🎨', title: 'Custom Branding', desc: 'Logo imprinting, custom color, and bespoke packaging for your brand.' },
                  { icon: '✅', title: 'Quality Assured', desc: 'Every batch undergoes 6-point safety and durability testing.' },
                  { icon: '📦', title: 'Low MOQ', desc: 'Flexible minimum order quantities starting from 100 units.' },
                  { icon: '🌍', title: 'Worldwide Shipping', desc: 'DHL/FedEx express and sea freight to 120+ countries.' },
                ].map(f => `
                  <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.85);backdrop-filter:blur(16px);border:1px solid ${theme.cardBorder};text-align:center;transition:transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size:2rem;margin-bottom:12px;">${f.icon}</div>
                    <h3 style="font-size:1rem;font-weight:800;color:${theme.text};margin:0 0 6px;">${f.title}</h3>
                    <p style="font-size:0.84rem;color:${theme.textMuted};margin:0;line-height:1.55;">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <section data-reveal style="padding:60px 24px;max-width:1280px;margin:0 auto;text-align:center;">
            <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 16px;">Ready to Stock Premium Pet Supplies?</h2>
            <p style="font-size:1rem;color:${theme.textMuted};margin:0 0 28px;">Request your free sample kit and wholesale price list today.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 40px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:1rem;font-weight:800;box-shadow:0 8px 28px ${theme.accentGlow};">Request Samples ↗</a>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:60px 24px 20px;text-align:center;">
          <h1 style="font-size:2.4rem;font-weight:900;letter-spacing:-0.02em;margin:0 0 12px;">${esc(ui.catalog)}</h1>
          <p style="font-size:1rem;color:${theme.textMuted};max-width:500px;margin:0 auto;">Complete range of premium pet supplies for wholesale buyers</p>
        </section>
        <section style="padding:20px 24px 80px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">
            ${products.map((p, i) => `
              <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} data-reveal style="text-decoration:none;border-radius:20px;background:#ffffff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s, box-shadow 0.3s;box-shadow:0 2px 12px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.03)'">
                <div style="padding-top:100%;position:relative;background:${theme.bg};overflow:hidden;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;">
                  ${p.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.68rem;font-weight:800;">${esc(p.badge)}</span>` : ''}
                </div>
                <div style="padding:16px;">
                  <h3 style="font-size:0.92rem;font-weight:800;color:${theme.text};margin:0 0 6px;">${esc(p.name)}</h3>
                  <p style="font-size:0.78rem;color:${theme.textMuted};margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
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
            <div style="border-radius:24px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.04);">
              <img id="wr-detail-main-img" data-wr-material-image="product-main" data-wr-material-product="${esc(tp.id)}" src="${esc(tp.img)}" alt="${esc(tp.name)}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:16px;">
            </div>
            <div style="padding-top:20px;">
              ${tp.badge ? `<span style="display:inline-block;padding:5px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.76rem;font-weight:800;margin-bottom:16px;">${esc(tp.badge)}</span>` : ''}
              <h1 style="font-size:2rem;font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;">${esc(translated.name || tp.name)}</h1>
              <p style="font-size:1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">${esc(translated.description || tp.desc)}</p>
              ${tp.material ? `<div style="padding:16px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:16px;"><span style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Material</span><p style="font-size:0.9rem;color:${theme.text};margin:6px 0 0;">${esc(tp.material)}</p></div>` : ''}
              ${tp.dimensions ? `<div style="padding:16px;border-radius:14px;background:${theme.bg};border:1px solid ${theme.cardBorder};margin-bottom:24px;"><span style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${theme.primary};">Specifications</span><p style="font-size:0.9rem;color:${theme.text};margin:6px 0 0;">${esc(tp.dimensions)}</p></div>` : ''}
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;display:inline-block;padding:14px 32px;border-radius:999px;background:${theme.btnGradient};color:#fff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">Request Quote ↗</a>
            </div>
          </div>
        </section>
        <section data-reveal style="padding:40px 24px 80px;max-width:1280px;margin:0 auto;">
          <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 28px;">More Products</h2>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;">
            ${products.filter(p => p.id !== tp.id).slice(0, 4).map(p => `
              <a href="${path(`products/${encodeURIComponent(p.id)}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};overflow:hidden;transition:transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="padding-top:100%;position:relative;background:${theme.bg};"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:14px;"></div>
                <div style="padding:14px;"><h3 style="font-size:0.86rem;font-weight:800;color:${theme.text};margin:0;">${esc(p.name)}</h3></div>
              </a>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, `About ${brandName}`);
    const aboutParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const defaultAbout = company.description || 'We are a dedicated manufacturer and exporter of premium pet supplies, committed to quality craftsmanship and animal wellbeing. Our products meet international safety standards and are trusted by distributors worldwide.';
    const highlights = parseAboutHighlights(company.aboutHighlights);
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:80px 24px;max-width:1280px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;">
            <div>
              <h1 style="font-size:2.4rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;margin:0 0 20px;">${esc(aboutHeadline)}</h1>
              ${aboutParagraphs.length > 0
                ? aboutParagraphs.map(p => `<p style="font-size:1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 16px;">${esc(p)}</p>`).join('')
                : `<p style="font-size:1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 16px;">${esc(defaultAbout)}</p>`
              }
            </div>
            <div style="border-radius:24px;overflow:hidden;background:#fff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 40px rgba(0,0,0,0.04);">
              <img src="${esc(heroProduct.img)}" alt="${esc(aboutHeadline)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;">
            </div>
          </div>
        </section>
        ${highlights.length > 0 ? `
          <section data-reveal style="padding:40px 24px 80px;max-width:1280px;margin:0 auto;">
            <div style="display:grid;grid-template-columns:repeat(${Math.min(highlights.length, 4)}, 1fr);gap:24px;">
              ${highlights.map(h => `
                <div style="text-align:center;padding:28px;border-radius:20px;background:#fff;border:1px solid ${theme.cardBorder};">
                  <div style="font-size:2rem;font-weight:900;color:${theme.primary};margin-bottom:6px;">${esc(h.value)}</div>
                  <div style="font-size:0.92rem;font-weight:700;color:${theme.text};margin-bottom:4px;">${esc(h.label)}</div>
                  ${h.desc ? `<div style="font-size:0.8rem;color:${theme.textMuted};">${esc(h.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </main>
    `;
  } else {
    // contact page
    mainHtml = `
      <main style="background:${theme.bg};color:${theme.text};min-height:80vh;">
        <section style="padding:80px 24px;max-width:800px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:40px;">
            <h1 style="font-size:2.4rem;font-weight:900;color:${theme.text};letter-spacing:-0.02em;margin:0 0 12px;">${esc(ui.contact)}</h1>
            <p style="font-size:1rem;color:${theme.textMuted};max-width:480px;margin:0 auto;">Reach out for wholesale pricing, product samples, or OEM partnership inquiries.</p>
          </div>
          <div style="border-radius:24px;background:#fff;border:1px solid ${theme.cardBorder};padding:40px;box-shadow:0 8px 32px rgba(0,0,0,0.04);">
            ${ctx.inquiryFormHtml}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;margin-top:40px;">
            <div style="text-align:center;padding:24px;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};">
              <div style="font-size:1.4rem;margin-bottom:8px;">📧</div>
              <div style="font-size:0.82rem;font-weight:700;color:${theme.text};">Email</div>
              <a href="mailto:${esc(company.email)}" style="font-size:0.82rem;color:${theme.primary};text-decoration:none;">${esc(company.email)}</a>
            </div>
            <div style="text-align:center;padding:24px;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};">
              <div style="font-size:1.4rem;margin-bottom:8px;">📱</div>
              <div style="font-size:0.82rem;font-weight:700;color:${theme.text};">Phone</div>
              <span style="font-size:0.82rem;color:${theme.textMuted};">${esc(company.phone || 'Available on request')}</span>
            </div>
            <div style="text-align:center;padding:24px;border-radius:16px;background:#fff;border:1px solid ${theme.cardBorder};">
              <div style="font-size:1.4rem;margin-bottom:8px;">📍</div>
              <div style="font-size:0.82rem;font-weight:700;color:${theme.text};">Address</div>
              <span style="font-size:0.82rem;color:${theme.textMuted};">${esc(company.address || 'Global Shipping')}</span>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  return headerHtml + mainHtml + footerHtml + animScript;
}
