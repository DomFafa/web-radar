import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { getIndustryPlaceholder } from './industryPlaceholders';

export interface ThemedFootwearItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  midsoleTech: string;
  upperMaterial: string;
  outsoleGrip: string;
  dropStack: string;
  moq: string;
  tagline: string;
  img: string;
}

export const FOOTWEAR_DEFAULT_PRODUCTS: ThemedFootwearItem[] = [
  {
    id: 'fw-1',
    name: 'AeroCarbon Pro Marathon Carbon-Plate Running Shoes',
    desc: 'Dual-density supercritical Pebax nitrogen foaming with full-length 3D curved carbon fiber plate delivering 85%+ energy return and supreme forward propulsion.',
    badge: 'Carbon Racer',
    category: 'running',
    categoryNameZh: '',
    categoryNameEn: 'Carbon-Plate Racers',
    midsoleTech: 'Supercritical Pebax Nitrogen Foam + Full-Length 3D Carbon Plate',
    upperMaterial: 'Ultra-Breathable Monofilament Jacquard Mesh with Heat-Melt TPU Cage',
    outsoleGrip: 'CPU Anti-Abrasion Lightweight Wet-Grip Rubber (1000km+ Durability)',
    dropStack: '8mm Drop (Heel 38mm / Forefoot 30mm) · 185g (US 8.5)',
    moq: '500 Pairs per Colorway',
    tagline: 'Defy Friction, Harness Pure Forward Momentum',
    img: getIndustryPlaceholder('footwear', 0),
  },
  {
    id: 'fw-2',
    name: 'ApexGrip All-Terrain Vibram Trail & Alpine Boot',
    desc: 'Gore-Tex waterproof bootie with Vibram Megagrip traction lug outsole, Kevlar reinforced mudguards, and dual-density EVA rock-plate midsole.',
    badge: 'Trail Alpine',
    category: 'trail',
    categoryNameZh: '',
    categoryNameEn: 'Vibram Trail & Hiking',
    midsoleTech: 'High-Density Anti-Perforation Rock Plate + Dual-Density EVA Midsole',
    upperMaterial: 'Hydrophobic Cordura 1000D + Seamless Heat-Bonded TPU Wrap',
    outsoleGrip: 'Vibram Megagrip Compound with 5mm Directional Traction Lugs',
    dropStack: '6mm Drop (Heel 33mm / Forefoot 27mm) · SATRA Slip Resistance Passed',
    moq: '300 Pairs per Colorway',
    tagline: 'Engineered for Harsh Mountain Ridges & Muddy Trails',
    img: getIndustryPlaceholder('footwear', 1),
  },
  {
    id: 'fw-3',
    name: 'Artisan Heritage 360° Goodyear Welted Chelsea Boots',
    desc: 'Master handcrafted Goodyear welted construction with French vegetable-tanned full-grain calfskin, cork filler bed, and Dainite studded rubber soles.',
    badge: 'Goodyear Welt',
    category: 'heritage',
    categoryNameZh: '',
    categoryNameEn: 'Heritage Handcrafted Boots',
    midsoleTech: 'Natural Cork Cushion Bed with Tempered Spring Steel Shank',
    upperMaterial: '1.8mm French Full-Grain Vegetable-Tanned Calfskin Leather',
    outsoleGrip: 'British Dainite Studded Rubber Outsole with 360° Storm Welt',
    dropStack: 'Traditional Dress Heel (28mm Stack) · Resolable for Lifetime Wear',
    moq: '200 Pairs per Colorway',
    tagline: 'Generational Craftsmanship, Built to Last Decades',
    img: getIndustryPlaceholder('footwear', 2),
  },
  {
    id: 'fw-4',
    name: 'Lumina Cloud Zero-Gravity Everyday Court Sneaker',
    desc: 'Minimalist Italian silhouette cut from buttery Nappa leather, featuring OrthoLite hybrid memory foam insole and recycled cupsole construction.',
    badge: 'Luxury Sneaker',
    category: 'sneakers',
    categoryNameZh: '',
    categoryNameEn: 'Luxury Minimalist Sneakers',
    midsoleTech: 'Cushioned Strobel Board with OrthoLite High-Rebound Memory Foam',
    upperMaterial: 'Full-Grain Buttery Soft Nappa Leather + Perforated Breathable Lining',
    outsoleGrip: 'Margom-Style Italian Rubber Cupsole with 360° Sidewall Stitching',
    dropStack: 'Zero-Drop Balanced Footbed (Heel 24mm / Forefoot 24mm)',
    moq: '300 Pairs per Colorway',
    tagline: 'Quiet Luxury Tailored for Metropolitan Commuters',
    img: getIndustryPlaceholder('footwear', 3),
  },
  {
    id: 'fw-5',
    name: 'AeroBounce Recovery Slide & Ergonomic Mule',
    desc: 'One-piece injection molded supercritical aliphatic E-TPU recovery slide with anatomically sculpted deep heel cup and arch support cradle.',
    badge: 'Recovery Slide',
    category: 'recovery',
    categoryNameZh: '',
    categoryNameEn: 'Supercritical Recovery Slides',
    midsoleTech: '100% Supercritical Injected Aliphatic E-TPU (60% Cushion Rebound)',
    upperMaterial: 'Integrated Monolithic Molded Foam with Anti-Chafing Soft Texture',
    outsoleGrip: 'Hexagonal Wave Drainage Pattern for Wet Bath & Pool Deck Traction',
    dropStack: '12mm Ergonomic Arch Drop (Heel 36mm / Forefoot 24mm)',
    moq: '800 Pairs per Colorway',
    tagline: 'Immediate Post-Race Muscle Relief & Cloud Comfort',
    img: getIndustryPlaceholder('footwear', 4),
  },
  {
    id: 'fw-6',
    name: 'Vortex Kinetic Indoor Court & Badminton Shoe',
    desc: 'Non-marking natural gum rubber outsole with lateral anti-roll TPU outrigger, carbon anti-torsion shank, and high-elastic forefoot bounce module.',
    badge: 'Court Pro',
    category: 'running',
    categoryNameZh: '',
    categoryNameEn: 'Indoor Court Footwear',
    midsoleTech: 'Forefoot EnergyGel Pad + Rearfoot Absorbing Cushion + Carbon Shank',
    upperMaterial: 'High-Strength Microfiber Synthetic Leather with KPU Armor Lattice',
    outsoleGrip: 'Non-Marking Raw Gum Honeycomb Tread for Instant Stop-and-Go',
    dropStack: '9mm Drop (Heel 28mm / Forefoot 19mm) · Anti-Rollover Outrigger',
    moq: '400 Pairs per Colorway',
    tagline: 'Lightning Fast Direction Changes Without Heel Slippage',
    img: getIndustryPlaceholder('footwear', 5),
  },
  {
    id: 'fw-7',
    name: 'Nordic Sherpa Lined Thermal Winter Chukka',
    desc: 'Water-resistant waxed suede upper lined with 100% genuine Australian shearling fleece, thermal foil sub-insole, and ice-grip composite lugs.',
    badge: 'Arctic Winter',
    category: 'heritage',
    categoryNameZh: '',
    categoryNameEn: 'Thermal Winter Boots',
    midsoleTech: 'Thermal Reflective Aluminum Layer + Shock-Absorbing Molded PU Bed',
    upperMaterial: 'Water-Repellent Hydro-Treated Split Suede with Genuine Shearling',
    outsoleGrip: 'Arctic Grip Compound with Micro-Glass Fiber Lugs for Ice Traction',
    dropStack: 'Comfort Platform (Heel 32mm / Forefoot 20mm) · Rated to -30°C',
    moq: '300 Pairs per Colorway',
    tagline: 'Sub-Zero Warmth Encased in Modern Scandinavian Silhouette',
    img: getIndustryPlaceholder('footwear', 6),
  },
  {
    id: 'fw-8',
    name: 'Spectre Cyber-Mesh Future Knit Runner',
    desc: 'Seamless 3D computerized knit upper reinforced with exoskeleton TPU lacing ribbons, paired with sculpted open-cavity geometric spring soles.',
    badge: 'Cyber Kinetic',
    category: 'sneakers',
    categoryNameZh: '',
    categoryNameEn: 'Futuristic Knit Sneakers',
    midsoleTech: 'Hollow-Core Mechanical Structural Spring Chambers + Bio-TPU Frame',
    upperMaterial: 'Multi-Density Engineered FlyKnit with Integrated Reflective Yarn',
    outsoleGrip: 'Segmented Zonal Pod Outsole for Adaptive Natural Foot Articulation',
    dropStack: '10mm Dynamic Drop (Heel 35mm / Forefoot 25mm)',
    moq: '400 Pairs per Colorway',
    tagline: 'Kinetic Architecture in Motion on Urban Concrete',
    img: getIndustryPlaceholder('footwear', 7),
  },
];

export function getFootwearProducts(ctx: ThemeContext): ThemedFootwearItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Footwear Model ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: 'Athletic Tech',
      category: 'footwear',
      categoryNameZh: '',
      categoryNameEn: 'Footwear & Athletic Shoes',
      midsoleTech: p.material || '',
      upperMaterial: '',
      outsoleGrip: '',
      dropStack: p.dimensions || '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }

  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = FOOTWEAR_DEFAULT_PRODUCTS[idx % FOOTWEAR_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? ('Carbon Flagship') : ('Kinetic Choice'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        midsoleTech: p.material || fallback.midsoleTech,
        upperMaterial: fallback.upperMaterial,
        outsoleGrip: fallback.outsoleGrip,
        dropStack: p.dimensions || fallback.dropStack,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return FOOTWEAR_DEFAULT_PRODUCTS;
}

export function renderFootwearHome(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const products = getFootwearProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || ('Biomechanical Footwear Engineering & Performance Athletic Shoe Factory'),
    subtitle: userCopy?.subtitle || ('Specializing in full-length carbon plate racing shoes, supercritical nitrogen midsoles, and Goodyear welted craftsmanship. 3,000+ proprietary athletic lasts.'),
    cta: userCopy?.cta || ('Explore Performance Lineup'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-footwear-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#0d1117;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.55;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(132,204,22,0.1) 0%, rgba(13,17,23,0.92) 80%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:980px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:9999px;background:rgba(132,204,22,0.15);backdrop-filter:blur(20px);border:1px solid rgba(132,204,22,0.4);font-size:0.82rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#84cc16;margin-bottom:24px;">
            ⚡ KINETIC BIOMECHANICS & PERFORMANCE FOOTWEAR
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.4rem, 5vw, 4.2rem);font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;margin:0 0 22px;">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.22rem);line-height:1.75;color:rgba(255,255,255,0.85);margin:0 auto 34px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:#84cc16;color:#0d1117;font-weight:900;padding:16px 36px;border-radius:8px;font-size:0.95rem;box-shadow:0 10px 30px rgba(132,204,22,0.35);border:none;text-decoration:none;">
              ${esc(copy.cta)} ⚡
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.1);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.25);font-weight:700;padding:15px 32px;border-radius:8px;font-size:0.95rem;text-decoration:none;">
              Shoe Last & Mold Prototyping
            </a>
          </div>
          <!-- Kinetic Metrics Bar -->
          <div data-reveal="fade-up" style="margin-top:50px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;padding:24px;border-radius:16px;background:rgba(17,24,39,0.8);backdrop-filter:blur(24px);border:1px solid rgba(132,204,22,0.25);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
            <div>
              <div style="font-size:2rem;font-weight:900;color:#84cc16;">85%+</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Cushion Energy Return</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#38bdf8;">100,000+</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Flex Cycle Passed</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#84cc16;">3,000+</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Proprietary Lasts</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#34d399;">SATRA Passed</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Footwear Testing Lab</div>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:24px;right:24px;z-index:10;">
          <button type="button" id="video-toggle" class="video-control" aria-label="${esc(ui.pause)}" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;cursor:pointer;">Ⅱ</button>
        </div>
      </section>
    `;
  } else {
    const customBanner = draft.banner ? ctx.asset(draft.banner.assetId) : null;
    const heroBg = customBanner
      ? `linear-gradient(135deg, rgba(13,17,23,0.92) 0%, rgba(17,24,39,0.96) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #0d1117 0%, #111827 100%)`;

    heroSectionHtml = `
      <section class="wr-footwear-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid rgba(132,204,22,0.2);color:#ffffff;">
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:center;">
          <!-- Left Info -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:6px;background:rgba(132,204,22,0.15);border:1px solid rgba(132,204,22,0.35);color:#84cc16;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
              ⚡ KINETIC FOOTWEAR & LAST ENGINEERING
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.3rem, 4.2vw, 3.6rem);font-weight:900;color:#ffffff;line-height:1.18;letter-spacing:-0.03em;margin:0 0 20px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.08rem;line-height:1.75;color:#94a3b8;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:#84cc16;color:#0d1117;font-weight:900;padding:15px 34px;border-radius:6px;font-size:0.95rem;box-shadow:0 8px 24px rgba(132,204,22,0.3);text-decoration:none;">
                ${esc(copy.cta)} ⚡
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.06);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);font-weight:700;padding:14px 30px;border-radius:6px;font-size:0.95rem;text-decoration:none;">
                Last Workshop & Labs →
              </a>
            </div>
          </div>

          <!-- Right Kinetic Shoe Showcase Card -->
          <div data-reveal="fade-up" style="position:relative;">
            <div style="background:#111827;border:1px solid #1f2937;border-radius:18px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);border-top:4px solid #84cc16;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <span style="background:rgba(132,204,22,0.15);color:#84cc16;padding:4px 10px;border-radius:4px;font-size:0.75rem;font-weight:800;">
                  ${esc(heroProduct.badge)}
                </span>
                <span style="font-size:0.78rem;color:#94a3b8;">ENERGY: 85%+</span>
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, #1f2937 30%, #0d1117 100%);border-radius:12px;margin-bottom:20px;padding:20px;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:240px;object-fit:contain;" fetchpriority="high">
              </div>
              <h2 style="font-size:1.25rem;font-weight:900;color:#ffffff;margin:0 0 8px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.86rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#1f2937;color:#ffffff;font-weight:800;padding:10px;border-radius:6px;font-size:0.85rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#84cc16;color:#0d1117;font-weight:800;padding:10px;border-radius:6px;font-size:0.85rem;text-decoration:none;">
                  ${esc(ui.inquire)} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Sole & Upper Craft Pipeline
  const craftPipelineHtml = `
    <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;">
        <span style="font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;color:#84cc16;font-weight:800;">BIOMECHANICAL SHOE CRAFT</span>
        <h2 style="font-size:clamp(1.9rem, 3.4vw, 2.6rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:10px 0 14px;">
          5-Stage Biomechanical Footwear Pipeline
        </h2>
        <p style="font-size:1rem;color:#64748b;margin:0;">
          From kinetic foot mapping to nitrogen foam expansion and flex cycle endurance.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #84cc16;">
          <div style="font-size:0.75rem;font-weight:900;color:#84cc16;margin-bottom:6px;">01 FOOT LAST MAPPING</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">3D Last Engineering</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">3,000+ ergonomic lasts tailored for global arch contours.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #84cc16;">
          <div style="font-size:0.75rem;font-weight:900;color:#84cc16;margin-bottom:6px;">02 NITROGEN FOAMING</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Supercritical Foaming</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Pebax nitrogen expansion delivering 85%+ energy return.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #84cc16;">
          <div style="font-size:0.75rem;font-weight:900;color:#84cc16;margin-bottom:6px;">03 3D CARBON EMBED</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">3D Carbon Plate Embed</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Curved aerospace carbon fiber for forward propulsion.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #84cc16;">
          <div style="font-size:0.75rem;font-weight:900;color:#84cc16;margin-bottom:6px;">04 SEAMLESS UPPER</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Jacquard & FlyKnit Upper</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Featherweight breathable mesh with heat-melt TPU cage.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #84cc16;">
          <div style="font-size:0.75rem;font-weight:900;color:#84cc16;margin-bottom:6px;">05 SATRA LAB QC</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">100k Flex Cycle Testing</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Tested to SATRA wet-slip and 100k flex durability.</p>
        </div>
      </div>
    </section>
  `;

  // Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.78rem;font-weight:800;color:#84cc16;letter-spacing:0.08em;text-transform:uppercase;">PERFORMANCE FOOTWEAR VAULT</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:6px 0 0;">
            Featured Performance Footwear Lineup
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#65a30d;text-decoration:none;font-size:0.92rem;">
          View Full Footwear Catalog (8 Items) ↗
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
            <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #f1f5f9 100%);display:flex;align-items:center;justify-content:center;padding:24px;">
              <span style="position:absolute;top:12px;left:12px;background:#0f172a;color:#84cc16;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:4px;">
                ${esc(p.badge)}
              </span>
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:200px;max-width:100%;object-fit:contain;" loading="lazy">
              </a>
            </div>
            <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
              <div style="font-size:0.75rem;font-weight:800;color:#65a30d;text-transform:uppercase;margin-bottom:6px;">
                ${p.categoryNameEn}
              </div>
              <h3 style="font-size:1.1rem;font-weight:900;color:#0f172a;margin:0 0 8px;line-height:1.35;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
              </h3>
              <p style="font-size:0.85rem;color:#64748b;line-height:1.5;margin:0 0 16px;flex:1;">
                ${esc(p.desc)}
              </p>
              <div style="background:#f8fafc;border-radius:8px;padding:10px 12px;font-size:0.78rem;color:#475569;margin-bottom:14px;">
                <div><strong>Midsole:</strong> ${esc(p.midsoleTech.slice(0, 30))}</div>
                <div style="margin-top:2px;"><strong>MOQ:</strong> <span style="color:#65a30d;font-weight:800;">${esc(p.moq)}</span></div>
              </div>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0f172a;color:#84cc16;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
                  ${esc(ui.inquire)} ↗
                </a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-footwear-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${craftPipelineHtml}
      ${productsGridHtml}
    </main>
  `;
}

export function renderFootwearCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getFootwearProducts(ctx);

  return `
    <main class="wr-inner wr-footwear-inner" data-wr-page="catalog" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:760px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(132,204,22,0.15);color:#65a30d;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            PERFORMANCE FOOTWEAR CATALOG
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 14px;">
            Racing Shoes, Trail Boots & Handcrafted Footwear
          </h1>
          <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
            Explore high-rebound marathon racers, Vibram alpine boots, and handcrafted welted silhouettes.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
              <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #f1f5f9 100%);display:flex;align-items:center;justify-content:center;padding:24px;">
                <span style="position:absolute;top:12px;left:12px;background:#0f172a;color:#84cc16;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:4px;">
                  ${esc(p.badge)}
                </span>
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:220px;max-width:100%;object-fit:contain;" loading="lazy">
                </a>
              </div>
              <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                <div style="font-size:0.75rem;font-weight:800;color:#65a30d;text-transform:uppercase;margin-bottom:6px;">
                  ${p.categoryNameEn} · ${esc(p.tagline)}
                </div>
                <h2 style="font-size:1.15rem;font-weight:900;color:#0f172a;margin:0 0 8px;line-height:1.35;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
                </h2>
                <p style="font-size:0.86rem;color:#64748b;line-height:1.55;margin:0 0 16px;flex:1;">
                  ${esc(p.desc)}
                </p>
                <div style="background:#f8fafc;border-radius:8px;padding:10px 12px;font-size:0.78rem;color:#334155;margin-bottom:16px;display:grid;gap:4px;">
                  <div><strong>Midsole:</strong> ${esc(p.midsoleTech.slice(0, 32))}</div>
                  <div><strong>Upper:</strong> ${esc(p.upperMaterial.slice(0, 32))}</div>
                  <div><strong>MOQ:</strong> <span style="color:#65a30d;font-weight:800;">${esc(p.moq)}</span></div>
                </div>
                <div style="display:flex;gap:8px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0f172a;color:#84cc16;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
                    ${esc(ui.inquire)} ↗
                  </a>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

export function renderFootwearDetail(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getFootwearProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0];

  return `
    <main class="wr-inner wr-footwear-inner" data-wr-page="detail" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <div style="margin-bottom:20px;">
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-size:0.86rem;font-weight:800;color:#65a30d;text-decoration:none;">
            ← Back to Footwear Catalog
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
          <div style="background:radial-gradient(circle, #f8fafc 30%, #f1f5f9 100%);border-radius:14px;padding:40px;display:flex;align-items:center;justify-content:center;border:1px solid #cbd5e1;position:relative;">
            <span style="position:absolute;top:20px;left:20px;background:#0f172a;color:#84cc16;font-size:0.75rem;font-weight:800;padding:5px 12px;border-radius:4px;">
              ${esc(p.badge)}
            </span>
            <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;" fetchpriority="high">
          </div>

          <div>
            <div style="font-size:0.82rem;font-weight:800;color:#65a30d;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">
              ${p.categoryNameEn} · ${esc(p.tagline)}
            </div>
            <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#0f172a;line-height:1.2;margin:0 0 14px;">
              ${esc(p.name)}
            </h1>
            <p style="font-size:1rem;color:#475569;line-height:1.65;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:28px;">
              <h3 style="font-size:0.92rem;font-weight:900;color:#0f172a;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.04em;">
                Biomechanical & Tooling Specifications
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.84rem;color:#334155;">
                <div><strong>Midsole Tech:</strong><br>${esc(p.midsoleTech)}</div>
                <div><strong>Upper Material:</strong><br>${esc(p.upperMaterial)}</div>
                <div><strong>Outsole Grip:</strong><br>${esc(p.outsoleGrip)}</div>
                <div><strong>Drop & Stack:</strong><br>${esc(p.dropStack)}</div>
                <div><strong>MOQ:</strong><br><span style="color:#65a30d;font-weight:800;">${esc(p.moq)}</span></div>
                <div><strong>QC Standard:</strong><br>SATRA 100k Flex Passed</div>
              </div>
            </div>

            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="background:#0f172a;color:#84cc16;font-weight:800;padding:14px 32px;border-radius:6px;font-size:0.92rem;text-decoration:none;">
                Request Footwear Quote ↗
              </a>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#f1f5f9;color:#0f172a;font-weight:700;padding:14px 24px;border-radius:6px;font-size:0.92rem;text-decoration:none;">
                Request Fitting Sample
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderFootwearAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const headline = getAboutHeadline(company, `${company.name} · Biomechanical Footwear Engineering Hub`);
  const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2014', num: parseInt(company.establishedYear || '2014', 10), label: 'Established', desc: 'A decade of biomechanical footwear craft' },
    { value: '3,000+ Lasts', label: 'Ergonomic Lasts', desc: 'Global foot morphology database' },
    { value: '100,000 Cycles', label: 'Flex Endurance', desc: 'Zero sole delamination guarantee' },
    { value: '45,000 Pairs', label: 'Daily Shoe Output', desc: 'Automated cementing & vulcanized lines' },
  ]);
  const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

  return `
    <main class="wr-inner wr-footwear-inner" data-wr-page="about" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <!-- ANGLED SECTION HEADER WITH DIAGONAL ACCENT -->
        <div style="position:relative;margin-bottom:48px;padding-bottom:20px;">
          <div style="position:absolute;top:0;left:0;width:120px;height:4px;background:linear-gradient(135deg,#84cc16,#65a30d);transform:skewX(-20deg);"></div>
          <div style="padding-top:20px;">
            <div style="font-size:0.75rem;font-weight:800;color:#65a30d;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">BIOMECHANICAL ENGINEERING LAB</div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;line-height:1.15;margin:0;">
              ${esc(headline)}
            </h1>
          </div>
        </div>

        <!-- 2x2 LAB TEST PHOTO MOSAIC + STORY -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:60px;align-items:start;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="grid-column:1/-1;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.06);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:300px;object-fit:cover;display:block;" loading="lazy">
            </div>
            <div style="background:#0f172a;border-radius:12px;padding:20px;display:flex;flex-direction:column;justify-content:center;">
              <div style="font-size:1.8rem;font-weight:900;color:#84cc16;margin-bottom:4px;">SATRA</div>
              <div style="font-size:0.78rem;color:#94a3b8;">Member Laboratory</div>
            </div>
            <div style="background:linear-gradient(135deg,#65a30d,#84cc16);border-radius:12px;padding:20px;display:flex;flex-direction:column;justify-content:center;">
              <div style="font-size:1.8rem;font-weight:900;color:#ffffff;margin-bottom:4px;">ISO 20344</div>
              <div style="font-size:0.78rem;color:rgba(255,255,255,0.8);">Footwear Testing</div>
            </div>
          </div>
          <div>
            <div style="color:#475569;font-size:1rem;line-height:1.85;margin-bottom:24px;">
              ${storyParagraphs.map((p) => `<p style="margin:0 0 14px;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-left:3px solid #84cc16;padding-left:16px;margin-bottom:24px;">
              <div style="font-weight:800;color:#0f172a;font-size:0.92rem;">"Every gram reduced and every percentage of rebound is driven by pure biomechanical reverence."</div>
              <div style="color:#64748b;font-size:0.8rem;margin-top:4px;">${esc(company.name)} · Biomechanics Lab</div>
            </div>
          </div>
        </div>

        <!-- HORIZONTAL GAUGE STATS (progress-bar style) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:60px;">
          ${highlights.map((h) => `
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
                <div style="font-size:0.84rem;font-weight:800;color:#0f172a;">${esc(h.label)}</div>
                <div style="font-size:1.4rem;font-weight:900;color:#65a30d;">${esc(h.value)}</div>
              </div>
              <div style="height:4px;background:#f1f5f9;border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${Math.min(100, Math.max(20, h.num > 1000 ? 95 : h.num > 100 ? 85 : h.num))}%;background:linear-gradient(90deg,#84cc16,#65a30d);border-radius:2px;"></div>
              </div>
              ${h.desc ? `<div style="font-size:0.75rem;color:#64748b;margin-top:8px;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- TECHNICAL SPEC TABLE -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:48px;">
          <div style="background:#0f172a;padding:20px 28px;">
            <span style="font-size:0.75rem;font-weight:800;color:#84cc16;letter-spacing:0.1em;text-transform:uppercase;">LAST & MOLD SPECIFICATIONS</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
            ${[
              ['Proprietary Lasts','3,000+ ergonomic shapes for marathon, trail, and barefoot categories'],
              ['Flex Endurance','100,000 cycles without sole delamination (SATRA TM92)'],
              ['Eco Cementing','Water-based adhesive bonding, zero-solvent cold attach process'],
              ['Outsole Compounds','Vibram, Phylon, EVA, TPU multi-density injection molds'],
              ['Size Standards','US / EU / UK / JP / KR conversion matrix available'],
              ['Daily Capacity','45,000 pairs across automated cementing and vulcanization lines']
            ].map(([label, value], i) => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:14px 28px;font-weight:700;color:#0f172a;width:30%;background:${i%2===0?'#fafafa':'#ffffff'}">${label}</td>
                <td style="padding:14px 28px;color:#475569;background:${i%2===0?'#fafafa':'#ffffff'}">${value}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <!-- LAB EQUIPMENT STRIP -->
        <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;">
          ${[
            ['3D Foot Scanner','Digital morphology capture'],
            ['Universal Tensile','Pull strength testing'],
            ['Sole Flex Rig','SATRA TM92 endurance'],
            ['Slip Resist','Wet & dry coefficient'],
            ['Abrasion Drum','DIN outsole wear test']
          ].map(([title, desc]) => `
            <div style="min-width:180px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;flex-shrink:0;">
              <div style="font-size:0.84rem;font-weight:800;color:#65a30d;margin-bottom:4px;">${title}</div>
              <div style="font-size:0.75rem;color:#64748b;">${desc}</div>
            </div>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

export function renderFootwearContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  return `
    <main class="wr-inner wr-footwear-inner" data-wr-page="contact" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:720px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(132,204,22,0.15);color:#65a30d;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            ${esc(ui.contact)} · FOOTWEAR DEVELOPMENT LAB
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 14px;">
            Start Your Footwear Tooling & Manufacturing RFQ
          </h1>
          <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
            Submit your footwear design, tooling specs, or bulk orders. Engineering response within 12 hours.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;max-width:1040px;margin:0 auto;">
          <!-- Left Tooling Guide Panel -->
          <div style="background:#0d1117;color:#ffffff;border-radius:18px;padding:36px;box-shadow:0 12px 40px rgba(0,0,0,0.15);border-top:4px solid #84cc16;">
            <h2 style="font-size:1.35rem;font-weight:900;margin:0 0 16px;color:#ffffff;">${esc(company.name)}</h2>
            <p style="font-size:0.9rem;color:#94a3b8;line-height:1.65;margin:0 0 28px;">
              Professional athletic and technical footwear manufacturing base serving global performance brands.
            </p>

            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:18px;margin-bottom:28px;">
              <h3 style="font-size:0.84rem;font-weight:800;color:#84cc16;text-transform:uppercase;margin:0 0 10px;">Tooling Commitments</h3>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#cbd5e1;line-height:1.7;">
                <li>7 business days for 3D printed prototype samples</li>
                <li>Full grade sizing runs from US 4 to 15 (EU 36-48)</li>
                <li>Tooling amortization rebate on volume orders</li>
              </ul>
            </div>

            <div style="display:grid;gap:16px;font-size:0.9rem;">
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#84cc16;text-transform:uppercase;margin-bottom:4px;">Email Direct</div>
                <a href="mailto:${esc(company.email)}" style="color:#ffffff;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
              </div>
              ${company.phone ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#84cc16;text-transform:uppercase;margin-bottom:4px;">Phone / WhatsApp</div>
                  <div style="color:#ffffff;font-weight:700;">${esc(company.phone)}</div>
                </div>
              ` : ''}
              ${company.address ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#84cc16;text-transform:uppercase;margin-bottom:4px;">Factory & R&D Campus</div>
                  <div style="color:#94a3b8;line-height:1.5;">${esc(company.address)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Tooling RFQ Form -->
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:36px;box-shadow:0 6px 20px rgba(0,0,0,0.02);">
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;gap:16px;">
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Your Name *</label>
                <input name="name" autocomplete="name" required maxlength="120" placeholder="e.g. Alex Jordan" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Business Email *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="alex@footwearbrand.com" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Selected Silhouette (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="">— Select Silhouette —</option>
                  ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Footwear Category (${esc(ui.optional)})</label>
                <select name="footwearCategory" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="carbon_racing">Carbon Plate Racing Shoes</option>
                  <option value="trail_outdoor">Vibram Traction Trail Boots</option>
                  <option value="goodyear_boots">Goodyear Welted Handcrafted Boots</option>
                  <option value="supercritical_slide">Supercritical Foam Recovery Slides</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Inquiry Message *</label>
                <textarea name="message" required maxlength="5000" rows="3" placeholder="State your target pairs, sizing system (US/EU), tooling requirements, and target timeline..." style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="background:#0f172a;color:#84cc16;font-weight:900;padding:13px;border-radius:6px;font-size:0.95rem;border:none;cursor:pointer;margin-top:4px;">
                Submit Footwear RFQ ↗
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderFootwearPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const page = ctx.page;

  const company = draft.company;

  const brand = company.logoAssetId
    ? `<img src="${esc(ctx.asset(company.logoAssetId))}" alt="${esc(company.name)}" style="height:34px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#0f172a;">${esc(company.name)}</span>`;

  const depth = ctx.depth;
  const languageLinks = (draft.languages || ['zh', 'en'])
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:4px;text-decoration:none;${l === ctx.lang ? 'background:#84cc16;color:#0d1117;' : 'color:#64748b;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-footwear-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(20px);border-bottom:1px solid #e2e8f0;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;gap:16px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:26px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'home' ? '#65a30d' : '#0f172a'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'catalog' ? '#65a30d' : '#0f172a'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'about' ? '#65a30d' : '#0f172a'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'contact' ? '#65a30d' : '#0f172a'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0f172a;color:#84cc16;font-weight:900;padding:8px 18px;border-radius:6px;font-size:0.84rem;text-decoration:none;">
            Tooling RFQ ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';
  switch (page) {
    case 'catalog': mainHtml = renderFootwearCatalog(ctx); break;
    case 'detail': mainHtml = renderFootwearDetail(ctx); break;
    case 'about': mainHtml = renderFootwearAbout(ctx); break;
    case 'contact': mainHtml = renderFootwearContact(ctx); break;
    default: mainHtml = renderFootwearHome(ctx, isVideo); break;
  }

  const footerHtml = `
    <footer style="background:#0d1117;color:#94a3b8;padding:48px 0 24px;font-size:0.86rem;border-top:1px solid #1f2937;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:36px;margin-bottom:32px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#ffffff;margin-bottom:10px;">${esc(company.name)}</div>
          <p style="font-size:0.84rem;line-height:1.65;color:#94a3b8;margin:0 0 12px;">
            Biomechanical athletic and technical footwear manufacturing base serving international performance brands.
          </p>
          <div style="font-size:0.78rem;color:#84cc16;font-weight:700;">SATRA Member · ISO 20344 · CE Safety · BSCI · ISO9001</div>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Carbon Plate Racers</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Vibram Trail Boots</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Goodyear Welted Boots</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Recovery Slides</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">Performance Specs</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li>✓ 85%+ Energy Return Midsoles</li>
            <li>✓ 100,000 Flex Cycles Passed</li>
            <li>✓ 3,000+ Ergonomic Shoe Lasts</li>
            <li>✓ 45,000 Pairs Daily Capacity</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 6px;"><strong>Email:</strong> <a style="color:#84cc16;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 6px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.8rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1f2937;padding-top:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:0.8rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>👟 Footwear & Athletic Shoes Global Trade Edition</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
