import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { getIndustryPlaceholder } from './industryPlaceholders';

export interface ThemedProductItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  material: string;
  dimensions: string;
  packaging: string;
  moq: string;
  tagline: string;
  img: string;
}

export const UNIVERSAL_DEFAULT_PRODUCTS: ThemedProductItem[] = [
  {
    id: 'u-p1',
    name: 'Multi-Port 140W GaN Smart Power Hub',
    desc: 'Ultra-compact gallium nitride charging station with intelligent power distribution and international safety certifications.',
    badge: 'Enterprise Export',
    category: 'electronics',
    categoryNameZh: '',
    categoryNameEn: 'Smart Electronics',
    material: 'Flame-Retardant Aerospace PC + GaN III',
    dimensions: '102 × 78 × 32 mm',
    packaging: 'Eco Kraft Color Gift Box (40 pcs/ctn)',
    moq: '500 Units (OEM / ODM)',
    tagline: 'High-Density Smart Power Station',
    img: getIndustryPlaceholder('universal', 0),
  },
  {
    id: 'u-p2',
    name: 'AeroGlide Hybrid Aluminum Luggage 20"',
    desc: 'Reinforced aviation-grade aluminum frame carry-on with 360° whisper-quiet dual spinner wheels and TSA-approved locks.',
    badge: 'B2B Best Seller',
    category: 'travel',
    categoryNameZh: '',
    categoryNameEn: 'Travel & Luggage',
    material: 'Polycarbonate Shell + 6063 Aluminum Frame',
    dimensions: '550 × 380 × 230 mm (38L)',
    packaging: 'Heavy-duty 5-ply Export Carton',
    moq: '200 Units',
    tagline: 'Rugged Lightweight Travel Engineering',
    img: getIndustryPlaceholder('universal', 1),
  },
  {
    id: 'u-p3',
    name: 'Precision Ceramic Chef Knife & Cutlery Set',
    desc: 'Zirconia ultra-sharp mirror polished blade set with ergonomic antimicrobial comfort handle for commercial culinary kitchens.',
    badge: 'Commercial Master',
    category: 'kitchen',
    categoryNameZh: '',
    categoryNameEn: 'Kitchen & Dining',
    material: 'Nano Zirconia Ceramic + Soft-Touch Grip',
    dimensions: '8" Chef + 6" Santoku + 5" Utility',
    packaging: 'Magnetic Luxury Presentation Box',
    moq: '1,000 Sets',
    tagline: 'Zero Corrosion Ultra-Sharp Precision',
    img: getIndustryPlaceholder('universal', 2),
  },
  {
    id: 'u-p4',
    name: 'ThermalLock Vacuum Insulated Sport Flask',
    desc: 'Double-wall 18/8 pro-grade stainless steel tumbler keeping liquids 24h chilled or 12h piping hot with leakproof lid.',
    badge: 'Eco Lifestyle',
    category: 'lifestyle',
    categoryNameZh: '',
    categoryNameEn: 'Home & Living',
    material: 'Food-Grade SUS304 Stainless Steel + Silicone',
    dimensions: '75 × 75 × 260 mm (750ml)',
    packaging: 'Individual Recycled Box (25 pcs/ctn)',
    moq: '1,000 Units',
    tagline: 'All-Day Temperature Master',
    img: getIndustryPlaceholder('universal', 3),
  },
  {
    id: 'u-p5',
    name: 'Modular Magnetic Ambient Desk Lamp',
    desc: 'Touch-dimmable minimalist architecture task lamp with 3000K-6000K CRI95+ natural spectrum and wireless phone charger.',
    badge: 'Modern Lighting',
    category: 'electronics',
    categoryNameZh: '',
    categoryNameEn: 'Smart Electronics',
    material: 'Anodized Aviation Aluminum + Optical Acrylic',
    dimensions: '380 × 120 × 420 mm',
    packaging: 'EPE Molded Cushion Carton',
    moq: '500 Sets',
    tagline: 'Minimalist Architectural Illumination',
    img: getIndustryPlaceholder('universal', 4),
  },
  {
    id: 'u-p6',
    name: 'Ergonomic Breathable Lumbar Support Chair',
    desc: 'Dynamic bionic lumbar tracking office chair with 3D adaptive armrests and high-density breathable German mesh fabric.',
    badge: 'Commercial Furniture',
    category: 'lifestyle',
    categoryNameZh: '',
    categoryNameEn: 'Home & Living',
    material: 'Reinforced Glass-Fiber Frame + Alloy Base',
    dimensions: '680 × 650 × 1180-1280 mm',
    packaging: 'Knock-Down Flat Pack Export Crate',
    moq: '100 Units',
    tagline: 'Scientific Spine Posture Support',
    img: getIndustryPlaceholder('universal', 5),
  },
  {
    id: 'u-p7',
    name: 'SonicClean Ultra-Quiet Oral Care Station',
    desc: '48,000 VPM acoustic sonic toothbrush with inductive wireless fast charging dock and IPX8 waterproof rating.',
    badge: 'Personal Health',
    category: 'electronics',
    categoryNameZh: '',
    categoryNameEn: 'Smart Electronics',
    material: 'DuPont Tynex Bristles + Matte ABS',
    dimensions: '28 × 28 × 245 mm',
    packaging: 'Retail Ready Window Blister Box',
    moq: '2,000 Units',
    tagline: 'Deep Sonic Plaque Removal',
    img: getIndustryPlaceholder('universal', 6),
  },
  {
    id: 'u-p8',
    name: 'Waterproof All-Terrain Tactical Duffel 60L',
    desc: 'Heavy-duty 840D TPU welded seam dry duffel backpack designed for marine, expedition and global adventure transit.',
    badge: 'Heavy Gear',
    category: 'travel',
    categoryNameZh: '',
    categoryNameEn: 'Travel & Luggage',
    material: '840D TPU Submersible Tarpaulin',
    dimensions: '620 × 340 × 340 mm (60L)',
    packaging: 'Polybagged in Master Carton (10 pcs/ctn)',
    moq: '300 Units',
    tagline: '100% Submersible Transit Protection',
    img: getIndustryPlaceholder('universal', 7),
  },
];

export function getUniversalProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Export Item ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'universal',
      categoryNameZh: '',
      categoryNameEn: 'Universal Trade & Export',
      material: p.material || '',
      dimensions: p.dimensions || '',
      packaging: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }

  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = UNIVERSAL_DEFAULT_PRODUCTS[idx % UNIVERSAL_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? ('Global Bestseller') : ('Trade Choice'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        material: p.material || fallback.material,
        dimensions: p.dimensions || fallback.dimensions,
        packaging: fallback.packaging,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return UNIVERSAL_DEFAULT_PRODUCTS;
}

export function renderUniversalHome(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const products = getUniversalProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || ('Global Export Supply Chain & Direct B2B Manufacturing Hub'),
    subtitle: userCopy?.subtitle || ('Direct factory manufacturing and integrated export fulfillment covering electronics, luggage, and home goods across 80+ international trade lanes.'),
    cta: userCopy?.cta || ('Explore Global Export Catalog'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-universal-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#0a192f;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.5;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(3,105,161,0.2) 0%, rgba(10,25,47,0.92) 80%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:980px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:9999px;background:rgba(3,105,161,0.2);backdrop-filter:blur(20px);border:1px solid rgba(56,189,248,0.4);font-size:0.82rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#38bdf8;margin-bottom:24px;">
            🌐 GLOBAL TRADE & CROSS-BORDER SUPPLY HUB
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.4rem, 5vw, 4.2rem);font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;margin:0 0 22px;">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.22rem);line-height:1.75;color:rgba(255,255,255,0.85);margin:0 auto 34px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:8px;font-size:0.95rem;box-shadow:0 10px 30px rgba(2,132,199,0.4);border:none;text-decoration:none;">
              ${esc(copy.cta)} ↗
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.1);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.25);font-weight:700;padding:15px 32px;border-radius:8px;font-size:0.95rem;text-decoration:none;">
              Container RFQ & Incoterms
            </a>
          </div>
          <!-- Global Trade Ribbon -->
          <div data-reveal="fade-up" style="margin-top:50px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;padding:24px;border-radius:16px;background:rgba(15,23,42,0.8);backdrop-filter:blur(24px);border:1px solid rgba(56,189,248,0.25);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
            <div>
              <div style="font-size:2rem;font-weight:900;color:#38bdf8;">85+</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Export Destinations</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#38bdf8;">45,000 m²</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Factory & Logistics Base</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#38bdf8;">FOB · CIF · DDP</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Flexible Incoterms</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#34d399;">100%</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">On-Time Dispatch SLA</div>
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
      ? `linear-gradient(135deg, rgba(10,25,47,0.92) 0%, rgba(15,23,42,0.96) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #0a192f 0%, #0f172a 100%)`;

    heroSectionHtml = `
      <section class="wr-universal-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid rgba(56,189,248,0.2);color:#ffffff;">
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:center;">
          <!-- Left Info -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:6px;background:rgba(2,132,199,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
              🌐 GLOBAL B2B EXPORT LOGISTICS HUB
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.3rem, 4.2vw, 3.6rem);font-weight:900;color:#ffffff;line-height:1.18;letter-spacing:-0.03em;margin:0 0 20px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.08rem;line-height:1.75;color:#94a3b8;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#ffffff;font-weight:800;padding:15px 34px;border-radius:6px;font-size:0.95rem;box-shadow:0 8px 24px rgba(2,132,199,0.35);text-decoration:none;">
                ${esc(copy.cta)} ↗
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.06);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);font-weight:700;padding:14px 30px;border-radius:6px;font-size:0.95rem;text-decoration:none;">
                Logistics Infrastructure →
              </a>
            </div>
          </div>

          <!-- Right Container Loading Spec Card -->
          <div data-reveal="fade-up" style="position:relative;">
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.5);border-top:4px solid #0284c7;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <span style="background:rgba(56,189,248,0.12);color:#38bdf8;padding:4px 10px;border-radius:4px;font-size:0.75rem;font-weight:800;">
                  ${esc(heroProduct.badge)}
                </span>
                <span style="font-size:0.78rem;color:#64748b;">HS CODE: 8504.40</span>
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, #1e293b 30%, #0a192f 100%);border-radius:12px;margin-bottom:20px;padding:20px;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:240px;object-fit:contain;" fetchpriority="high">
              </div>
              <h2 style="font-size:1.25rem;font-weight:900;color:#ffffff;margin:0 0 8px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.86rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#1e293b;color:#ffffff;font-weight:800;padding:10px;border-radius:6px;font-size:0.85rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:10px;border-radius:6px;font-size:0.85rem;text-decoration:none;">
                  ${esc(ui.inquire)} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // 5-Stage Supply Chain Matrix
  const supplyChainHtml = `
    <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;">
        <span style="font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;color:#0284c7;font-weight:800;">GLOBAL VALUE CHAIN MATRIX</span>
        <h2 style="font-size:clamp(1.9rem, 3.4vw, 2.6rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:10px 0 14px;">
          5-Stage Global Supply Chain Execution Matrix
        </h2>
        <p style="font-size:1rem;color:#64748b;margin:0;">
          From origin facility audit to bonded warehousing and overseas destination port clearance.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #0284c7;">
          <div style="font-size:0.75rem;font-weight:900;color:#0284c7;margin-bottom:6px;">01 DIRECT SOURCING</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Factory Audit & Sourcing</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Direct factory pricing with audited ethical certifications.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #0284c7;">
          <div style="font-size:0.75rem;font-weight:900;color:#0284c7;margin-bottom:6px;">02 AUTO PRODUCTION</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Automated Production</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">High-capacity CNC lines ensuring stable daily output.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #0284c7;">
          <div style="font-size:0.75rem;font-weight:900;color:#0284c7;margin-bottom:6px;">03 QC & COMPLIANCE</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">QC & Global Compliance</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Tested to international CE, FCC, RoHS, and REACH benchmarks.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #0284c7;">
          <div style="font-size:0.75rem;font-weight:900;color:#0284c7;margin-bottom:6px;">04 CONSOLIDATION</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Container Packing</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">3D container loading optimization for 20GP/40HQ saves freight.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;border-top:3px solid #0284c7;">
          <div style="font-size:0.75rem;font-weight:900;color:#0284c7;margin-bottom:6px;">05 CUSTOMS CLEARANCE</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Port Clearance & DDP</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Dedicated customs brokers supporting seamless DDP delivery.</p>
        </div>
      </div>
    </section>
  `;

  // Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.78rem;font-weight:800;color:#0284c7;letter-spacing:0.08em;text-transform:uppercase;">EXPORT COMMODITY VAULT</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:6px 0 0;">
            Global Export B2B Commodity Catalog
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#0284c7;text-decoration:none;font-size:0.92rem;">
          View Full Catalog (8 Items) ↗
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
            <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #f1f5f9 100%);display:flex;align-items:center;justify-content:center;padding:24px;">
              <span style="position:absolute;top:12px;left:12px;background:#0f172a;color:#ffffff;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:4px;">
                ${esc(p.badge)}
              </span>
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:200px;max-width:100%;object-fit:contain;" loading="lazy">
              </a>
            </div>
            <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
              <div style="font-size:0.75rem;font-weight:800;color:#0284c7;text-transform:uppercase;margin-bottom:6px;">
                ${p.categoryNameEn}
              </div>
              <h3 style="font-size:1.1rem;font-weight:900;color:#0f172a;margin:0 0 8px;line-height:1.35;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
              </h3>
              <p style="font-size:0.85rem;color:#64748b;line-height:1.5;margin:0 0 16px;flex:1;">
                ${esc(p.desc)}
              </p>
              <div style="background:#f8fafc;border-radius:8px;padding:10px 12px;font-size:0.78rem;color:#475569;margin-bottom:14px;">
                <div><strong>Dim:</strong> ${esc(p.dimensions)}</div>
                <div style="margin-top:2px;"><strong>Pack:</strong> ${esc(p.packaging)}</div>
                <div style="margin-top:2px;"><strong>MOQ:</strong> <span style="color:#0284c7;font-weight:800;">${esc(p.moq)}</span></div>
              </div>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
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
    <main class="wr-inner wr-universal-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${supplyChainHtml}
      ${productsGridHtml}
    </main>
  `;
}

export function renderUniversalCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getUniversalProducts(ctx);

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="catalog" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:760px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(2,132,199,0.1);color:#0284c7;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            GLOBAL EXPORT COMMODITY CATALOG
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 14px;">
            Export Commodities & Bulk Procurement
          </h1>
          <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
            Explore full-category export goods with container loadability and worldwide DDP fulfillment.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
              <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #f1f5f9 100%);display:flex;align-items:center;justify-content:center;padding:24px;">
                <span style="position:absolute;top:12px;left:12px;background:#0f172a;color:#ffffff;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:4px;">
                  ${esc(p.badge)}
                </span>
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:220px;max-width:100%;object-fit:contain;" loading="lazy">
                </a>
              </div>
              <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                <div style="font-size:0.75rem;font-weight:800;color:#0284c7;text-transform:uppercase;margin-bottom:6px;">
                  ${p.categoryNameEn} · ${esc(p.tagline)}
                </div>
                <h2 style="font-size:1.15rem;font-weight:900;color:#0f172a;margin:0 0 8px;line-height:1.35;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
                </h2>
                <p style="font-size:0.86rem;color:#64748b;line-height:1.55;margin:0 0 16px;flex:1;">
                  ${esc(p.desc)}
                </p>
                <div style="background:#f8fafc;border-radius:8px;padding:10px 12px;font-size:0.78rem;color:#334155;margin-bottom:16px;display:grid;gap:4px;">
                  <div><strong>Material:</strong> ${esc(p.material)}</div>
                  <div><strong>Dimensions:</strong> ${esc(p.dimensions)}</div>
                  <div><strong>Packaging:</strong> ${esc(p.packaging)}</div>
                  <div><strong>MOQ:</strong> <span style="color:#0284c7;font-weight:800;">${esc(p.moq)}</span></div>
                </div>
                <div style="display:flex;gap:8px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:10px;border-radius:6px;font-size:0.82rem;text-decoration:none;">
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

export function renderUniversalDetail(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getUniversalProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0];

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="detail" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <div style="margin-bottom:20px;">
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-size:0.86rem;font-weight:800;color:#0284c7;text-decoration:none;">
            ← Back to Trade Catalog
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
          <div style="background:radial-gradient(circle, #f8fafc 30%, #f1f5f9 100%);border-radius:14px;padding:40px;display:flex;align-items:center;justify-content:center;border:1px solid #cbd5e1;position:relative;">
            <span style="position:absolute;top:20px;left:20px;background:#0f172a;color:#ffffff;font-size:0.75rem;font-weight:800;padding:5px 12px;border-radius:4px;">
              ${esc(p.badge)}
            </span>
            <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;" fetchpriority="high">
          </div>

          <div>
            <div style="font-size:0.82rem;font-weight:800;color:#0284c7;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">
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
                Export & Container Loading Specifications
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.84rem;color:#334155;">
                <div><strong>Material:</strong><br>${esc(p.material)}</div>
                <div><strong>Dimensions:</strong><br>${esc(p.dimensions)}</div>
                <div><strong>Export Carton:</strong><br>${esc(p.packaging)}</div>
                <div><strong>MOQ:</strong><br><span style="color:#0284c7;font-weight:800;">${esc(p.moq)}</span></div>
                <div><strong>Origin Port:</strong><br>Shanghai / Ningbo / Shenzhen</div>
                <div><strong>Incoterms:</strong><br>FOB / CIF / DDP / DAP</div>
              </div>
            </div>

            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="background:#0284c7;color:#ffffff;font-weight:800;padding:14px 32px;border-radius:6px;font-size:0.92rem;text-decoration:none;">
                Request Container Quote ↗
              </a>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#f1f5f9;color:#0f172a;font-weight:700;padding:14px 24px;border-radius:6px;font-size:0.92rem;text-decoration:none;">
                Request Sample
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderUniversalAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const headline = getAboutHeadline(company, `${company.name} · Global Trade & Supply Chain`);
  const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2012', num: parseInt(company.establishedYear || '2012', 10), label: 'Established', desc: 'Over a decade of international trade' },
    { value: '45,000 m\u00b2', label: 'Factory Campus', desc: 'Modern manufacturing & bonded storage' },
    { value: '85+', num: 85, suffix: '+', label: 'Export Destinations', desc: 'Europe, Americas, Asia-Pacific' },
    { value: '100%', num: 100, suffix: '%', label: 'Compliance Rate', desc: 'ISO9001 / BSCI verified' },
  ]);
  const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="about" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <!-- SPLIT HERO: LEFT PROFILE + RIGHT PHOTO -->
        <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:center;margin-bottom:60px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(2,132,199,0.1);color:#0284c7;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:16px;">
              GLOBAL MANUFACTURING ENTERPRISE
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;line-height:1.2;margin:0 0 20px;">
              ${esc(headline)}
            </h1>
            <div style="color:#475569;font-size:1.02rem;line-height:1.8;display:flex;flex-direction:column;gap:14px;margin-bottom:28px;">
              ${storyParagraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-left:3px solid #0284c7;padding-left:16px;">
              <div style="font-weight:800;color:#0f172a;font-size:0.92rem;">"Uncompromising quality is the only foundation for enduring global trade."</div>
              <div style="color:#64748b;font-size:0.8rem;margin-top:4px;">${esc(company.name)} · Quality Committee</div>
            </div>
          </div>
          <div style="position:relative;">
            <div style="border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;background:#ffffff;box-shadow:0 16px 40px rgba(0,0,0,0.06);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
            </div>
            <div style="position:absolute;bottom:20px;left:20px;background:rgba(15,23,42,0.9);backdrop-filter:blur(16px);color:#ffffff;padding:10px 18px;border-radius:8px;font-size:0.8rem;font-weight:800;">
              \u2713 Verified Manufacturing Facility
            </div>
          </div>
        </div>

        <!-- 4-COLUMN KPI DATA BLOCKS -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e2e8f0;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:60px;">
          ${highlights.map((h) => `
            <div style="background:#ffffff;padding:28px 20px;text-align:center;">
              <div style="font-size:2.4rem;font-weight:900;color:#0284c7;line-height:1;margin-bottom:8px;">
                ${esc(h.value)}
              </div>
              <div style="font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:4px;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.75rem;color:#64748b;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- FULL-WIDTH OPERATIONS PANEL WITH 3-COL LOGISTICS CARDS -->
        <div style="background:#0f172a;border-radius:20px;padding:40px;margin-bottom:40px;color:#ffffff;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
            <div>
              <span style="font-size:0.75rem;font-weight:800;color:#38bdf8;letter-spacing:0.1em;text-transform:uppercase;">OPERATIONS & LOGISTICS</span>
              <h2 style="font-size:1.5rem;font-weight:900;color:#ffffff;margin:6px 0 0;">Comprehensive Quality & Reliability Testing</h2>
            </div>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0284c7;color:#ffffff;font-weight:800;padding:12px 28px;border-radius:6px;font-size:0.86rem;text-decoration:none;white-space:nowrap;">
              Request Test Reports
            </a>
          </div>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.7;margin:0 0 28px;max-width:700px;">
            Equipped with temperature/humidity test chambers, salt spray corrosion testers, and drop impact rigs for strict quality assurance across all export markets.
          </p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
            ${[
              ['ISO 9001','International quality management system','#0284c7'],
              ['BSCI Audit','European social compliance verified','#06b6d4'],
              ['Bonded Storage','45,000m\u00b2 bonded logistics hub','#0ea5e9'],
              ['Incoterms','FOB / CIF / DDP supported','#10b981'],
              ['AQL Sampling','Standard AQL 2.5 inspection','#38bdf8'],
              ['40+ Countries','Active export routes worldwide','#f59e0b']
            ].map(([title, desc, color]) => `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;">
                <div style="width:6px;height:6px;border-radius:50%;background:${color};margin-bottom:10px;"></div>
                <div style="font-size:0.86rem;font-weight:800;color:#ffffff;margin-bottom:4px;">${title}</div>
                <div style="font-size:0.76rem;color:#94a3b8;line-height:1.4;">${desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CTA BANNER STRIP -->
        <div style="background:#0284c7;border-radius:12px;padding:28px 36px;display:flex;justify-content:space-between;align-items:center;">
          <div style="color:#ffffff;font-size:1.1rem;font-weight:800;">Ready to start your global sourcing partnership?</div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#ffffff;color:#0284c7;font-weight:800;padding:12px 32px;border-radius:6px;font-size:0.88rem;text-decoration:none;">
            Get Started \u2192
          </a>
        </div>
      </section>
    </main>
  `;
}

export function renderUniversalContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="contact" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:720px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(2,132,199,0.1);color:#0284c7;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            ${esc(ui.contact)} · GLOBAL PROCUREMENT RFP
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 14px;">
            Global Procurement RFP & Container Quotation
          </h1>
          <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
            Submit your bulk purchasing RFQ or sample requests. Response within 12 business hours.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;max-width:1040px;margin:0 auto;">
          <!-- Left Export Desk -->
          <div style="background:#0a192f;color:#ffffff;border-radius:18px;padding:36px;box-shadow:0 12px 40px rgba(0,0,0,0.15);border-top:4px solid #0284c7;">
            <h2 style="font-size:1.35rem;font-weight:900;margin:0 0 16px;color:#ffffff;">${esc(company.name)}</h2>
            <p style="font-size:0.9rem;color:#94a3b8;line-height:1.65;margin:0 0 28px;">
              International direct manufacturing and export logistics hub serving global retail chains.
            </p>

            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:18px;margin-bottom:28px;">
              <h3 style="font-size:0.84rem;font-weight:800;color:#38bdf8;text-transform:uppercase;margin:0 0 10px;">Trade Commitments</h3>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#cbd5e1;line-height:1.7;">
                <li>Full packing list and tiered FOB quote in 12h</li>
                <li>Third-party SGS / TÜV / BV inspection support</li>
                <li>Support L/C, T/T and escrow payment terms</li>
              </ul>
            </div>

            <div style="display:grid;gap:16px;font-size:0.9rem;">
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;">Email Direct</div>
                <a href="mailto:${esc(company.email)}" style="color:#ffffff;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
              </div>
              ${company.phone ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;">Phone / WhatsApp</div>
                  <div style="color:#ffffff;font-weight:700;">${esc(company.phone)}</div>
                </div>
              ` : ''}
              ${company.address ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;">Factory & Warehouse Address</div>
                  <div style="color:#94a3b8;line-height:1.5;">${esc(company.address)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right RFP Form -->
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:36px;box-shadow:0 6px 20px rgba(0,0,0,0.02);">
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;gap:16px;">
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Your Name *</label>
                <input name="name" autocomplete="name" required maxlength="120" placeholder="e.g. David Miller" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Business Email *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="procurement@buyer.com" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Commodity of Interest (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="">— Select Commodity Item —</option>
                  ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Preferred Incoterms (${esc(ui.optional)})</label>
                <select name="incoterm" style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="FOB">FOB (Free on Board)</option>
                  <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                  <option value="EXW">EXW (Ex Works)</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Inquiry Message *</label>
                <textarea name="message" required maxlength="5000" rows="3" placeholder="State your target volume, destination port, packaging requirements, and timeline..." style="width:100%;padding:11px 14px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="background:#0284c7;color:#ffffff;font-weight:800;padding:13px;border-radius:6px;font-size:0.95rem;border:none;cursor:pointer;margin-top:4px;">
                Submit Procurement RFP ↗
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderUniversalPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const page = ctx.page;

  const company = draft.company;

  const brand = company.logoAssetId
    ? `<img src="${esc(ctx.asset(company.logoAssetId))}" alt="${esc(company.name)}" style="height:34px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#0f172a;">${esc(company.name)}</span>`;

  const depth = ctx.depth;
  const languageLinks = (draft.languages || ['zh', 'en'])
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:4px;text-decoration:none;${l === ctx.lang ? 'background:#0284c7;color:#ffffff;' : 'color:#64748b;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-universal-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(20px);border-bottom:1px solid #e2e8f0;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;gap:16px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:26px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'home' ? '#0284c7' : '#0f172a'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'catalog' ? '#0284c7' : '#0f172a'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'about' ? '#0284c7' : '#0f172a'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'contact' ? '#0284c7' : '#0f172a'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0284c7;color:#ffffff;font-weight:800;padding:8px 18px;border-radius:6px;font-size:0.84rem;text-decoration:none;">
            Inquire RFQ ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';
  switch (page) {
    case 'catalog': mainHtml = renderUniversalCatalog(ctx); break;
    case 'detail': mainHtml = renderUniversalDetail(ctx); break;
    case 'about': mainHtml = renderUniversalAbout(ctx); break;
    case 'contact': mainHtml = renderUniversalContact(ctx); break;
    default: mainHtml = renderUniversalHome(ctx, isVideo); break;
  }

  const footerHtml = `
    <footer style="background:#0a192f;color:#94a3b8;padding:48px 0 24px;font-size:0.86rem;border-top:1px solid #1e293b;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:36px;margin-bottom:32px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#ffffff;margin-bottom:10px;">${esc(company.name)}</div>
          <p style="font-size:0.84rem;line-height:1.65;color:#94a3b8;margin:0 0 12px;">
            Global manufacturing and export supply chain hub servicing trade buyers across 80+ countries.
          </p>
          <div style="font-size:0.78rem;color:#38bdf8;font-weight:700;">ISO9001 · BSCI · CE · FCC · RoHS · REACH</div>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Smart Electronics</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Travel & Luggage</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Kitchen & Dining</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Home & Living</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">Supply Metrics</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li>✓ 45,000 m² Manufacturing & Logistics</li>
            <li>✓ 100% On-Time Delivery Guarantee</li>
            <li>✓ FOB / CIF / DDP Available</li>
            <li>✓ 85+ Export Ports Worldwide</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 6px;"><strong>Email:</strong> <a style="color:#38bdf8;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 6px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.8rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1e293b;padding-top:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:0.8rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>🌐 Universal Trade Global Export Edition</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
