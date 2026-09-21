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
  fabricComposition: string;
  weightGsm: string;
  craftDetails: string;
  moq: string;
  tagline: string;
  img: string;
}

export const APPAREL_DEFAULT_PRODUCTS: ThemedProductItem[] = [
  {
    id: 'at-1',
    name: 'Technical StormShell 3-Layer Waterproof Parka',
    desc: '20,000mm waterproof & 15,000g/m² breathable 3L ripstop laminate with fully taped seams and YKK AquaGuard weatherproof zippers.',
    badge: 'Performance Outerwear',
    category: 'outerwear',
    categoryNameZh: '',
    categoryNameEn: 'Technical Outerwear',
    fabricComposition: '100% Recycled Nylon 70D + eVent PTFE Membrane',
    weightGsm: '165 GSM (3-Layer Laminate)',
    craftDetails: 'Laser-Cut Pockets, Seam-Sealed, DWR C0 Finish',
    moq: '300 Pcs per Color',
    tagline: 'All-Weather Atmospheric Shield',
    img: getIndustryPlaceholder('apparel', 0),
  },
  {
    id: 'at-2',
    name: '100% Australian Merino Wool Seamless Turtleneck',
    desc: '19.5-micron superfine Merino wool knit on WholeGarment 3D seamless machines for zero-friction next-to-skin luxury warmth.',
    badge: 'Haute Knitwear',
    category: 'knitwear',
    categoryNameZh: '',
    categoryNameEn: 'Luxury Knitwear',
    fabricComposition: '100% Superfine Australian Merino Wool (19.5μm)',
    weightGsm: '14-Gauge Fine Knit (280g/pc)',
    craftDetails: 'Shima Seiki WholeGarment 3D Knitting',
    moq: '200 Pcs per Color',
    tagline: 'Zero-Waste Seamless Luxury',
    img: getIndustryPlaceholder('apparel', 1),
  },
  {
    id: 'at-3',
    name: 'SilkBlend Fluid Double-Breasted Trench Coat',
    desc: 'Heavyweight Mulberry silk and TENCEL blend with natural fluid drape, horn buttons, and storm flap back for high-fashion silhouettes.',
    badge: 'Runway Tailoring',
    category: 'tailoring',
    categoryNameZh: '',
    categoryNameEn: 'Runway Tailoring',
    fabricComposition: '32% Grade 6A Mulberry Silk + 68% TENCEL Lyocell',
    weightGsm: '260 GSM Twill Weave',
    craftDetails: 'Hand-Finished Lapels, Custom Engraved Horn Buttons',
    moq: '150 Pcs per Style',
    tagline: 'Elegance with Fluid Movement',
    img: getIndustryPlaceholder('apparel', 2),
  },
  {
    id: 'at-4',
    name: 'Heavyweight 460GSM French Terry Vintage Hoodie',
    desc: 'Custom-developed 460GSM compact spun French terry cotton with pre-shrunk enzyme wash and double-needle cover-stitched seams.',
    badge: 'Streetwear Luxury',
    category: 'streetwear',
    categoryNameZh: '',
    categoryNameEn: 'Luxury Streetwear',
    fabricComposition: '100% Combed Compact Cotton (Zero Shrinkage)',
    weightGsm: '460 GSM Heavyweight Loopback Terry',
    craftDetails: 'Double-Layered Hood, Pigment Vintage Dye Wash',
    moq: '300 Pcs per Color',
    tagline: 'Structured Architectural Silhouette',
    img: getIndustryPlaceholder('apparel', 3),
  },
  {
    id: 'at-5',
    name: 'EcoDry Bamboo Charcoal Antibacterial Active Tee',
    desc: 'High-stretch micro-honeycomb mesh fabric infused with natural nano bamboo charcoal for odor control and sub-second moisture wicking.',
    badge: 'Eco Performance',
    category: 'activewear',
    categoryNameZh: '',
    categoryNameEn: 'High-Performance Activewear',
    fabricComposition: '65% Bamboo Charcoal Poly + 30% Polyamide + 5% Spandex',
    weightGsm: '140 GSM Moisture-Wicking Mesh',
    craftDetails: 'Flatlock Anti-Chafe Seaming, Reflective 3M Prints',
    moq: '500 Pcs per Style',
    tagline: 'Odor-Free Kinetic Dryness',
    img: getIndustryPlaceholder('apparel', 4),
  },
  {
    id: 'at-6',
    name: 'Artisanal 14oz Selvedge Raw Denim Chore Jacket',
    desc: 'Old-school shuttle loom woven 14oz ring-spun denim with red selvedge ID line, triple-stitched felled seams and antique brass hardware.',
    badge: 'Heritage Denim',
    category: 'denim',
    categoryNameZh: '',
    categoryNameEn: 'Heritage Denim',
    fabricComposition: '100% Long-Staple Cotton Ring-Spun Indigo Yarn',
    weightGsm: '14.5 oz Selvedge Denim',
    craftDetails: 'Vintage Shuttle Loom Woven, Union Special Chainstitch',
    moq: '250 Pcs per Style',
    tagline: 'Artisanal Heritage Patina',
    img: getIndustryPlaceholder('apparel', 5),
  },
  {
    id: 'at-7',
    name: 'GOTS Certified Pure French Linen Resort Shirt',
    desc: 'Pre-washed pure Normandy flax linen with relaxed Cuban collar, natural mother-of-pearl buttons, and airy breathable textured drape.',
    badge: 'Sustainable Resort',
    category: 'resort',
    categoryNameZh: '',
    categoryNameEn: 'Resort & Linen',
    fabricComposition: '100% Certified Organic Normandy Flax Linen',
    weightGsm: '175 GSM Plain Weave',
    craftDetails: 'Garment Enzyme Softened, Genuine Trocas Shell Buttons',
    moq: '300 Pcs per Color',
    tagline: 'Breathable European Riviera Chic',
    img: getIndustryPlaceholder('apparel', 6),
  },
  {
    id: 'at-8',
    name: 'Bonded ThermoCore Laser-Cut Base-Layer Set',
    desc: 'Ultralight micro-fleece thermal underwear engineered with zoned ventilation and stitch-free bonded hem tape for invisible second-skin warmth.',
    badge: 'Thermal Innovation',
    category: 'baselayer',
    categoryNameZh: '',
    categoryNameEn: 'Thermal Baselayers',
    fabricComposition: '55% Micro Acrylic + 38% Modal + 7% Spandex',
    weightGsm: '210 GSM Thermal Double-Brushed',
    craftDetails: 'Ultrasonic Bonding, Seamless Edge Lamination',
    moq: '500 Sets',
    tagline: 'Zero-Bulk Second Skin Thermal Heat',
    img: getIndustryPlaceholder('apparel', 7),
  },
];

export function getApparelProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Garment ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'apparel',
      categoryNameZh: '',
      categoryNameEn: 'Apparel & Textiles',
      fabricComposition: p.material || '',
      weightGsm: '',
      craftDetails: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }

  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = APPAREL_DEFAULT_PRODUCTS[idx % APPAREL_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? ('Runway Spotlight') : ('Fabric Tech Choice'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        fabricComposition: p.material || fallback.fabricComposition,
        weightGsm: fallback.weightGsm,
        craftDetails: fallback.craftDetails,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return APPAREL_DEFAULT_PRODUCTS;
}

export function renderApparelHome(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const products = getApparelProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || ('Haute Couture Tailoring & High-Performance Textile Manufacturing'),
    subtitle: userCopy?.subtitle || ('Specializing in technical 3-layer outerwear, WholeGarment seamless knitwear, and GOTS certified luxury textiles. Fast-response supply chain for global fashion houses.'),
    cta: userCopy?.cta || ('Explore Runway Collection'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-apparel-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#18181b;color:#fafafa;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.5;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(180,83,9,0.1) 0%, rgba(24,24,27,0.9) 75%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:960px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:9999px;background:rgba(255,255,255,0.1);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.25);font-size:0.8rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#d97706;margin-bottom:24px;">
            ✨ HAUTE RUNWAY ATELIER & TEXTILE MILL
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.4rem, 4.8vw, 4.2rem);font-weight:800;line-height:1.18;letter-spacing:-0.03em;color:#ffffff;margin:0 0 22px;font-family:Georgia, serif;">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.2rem);line-height:1.75;color:rgba(255,255,255,0.85);margin:0 auto 34px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:#d97706;color:#ffffff;font-weight:700;padding:15px 36px;border-radius:4px;font-size:0.95rem;text-decoration:none;letter-spacing:0.04em;">
              ${esc(copy.cta)} ↗
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.12);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.3);font-weight:700;padding:14px 32px;border-radius:4px;font-size:0.95rem;text-decoration:none;">
              Request Fabric Swatch Book
            </a>
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
      ? `linear-gradient(135deg, rgba(24,24,27,0.88) 0%, rgba(39,39,42,0.94) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #18181b 0%, #27272a 100%)`;

    heroSectionHtml = `
      <section class="wr-apparel-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid #3f3f46;color:#ffffff;">
        <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:60px;align-items:center;">
          <!-- Left Editorial Manifesto -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 14px;border:1px solid rgba(217,119,6,0.5);color:#d97706;font-size:0.75rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:20px;">
              EDITORIAL RUNWAY ATELIER
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.3rem, 4.2vw, 3.6rem);font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.02em;margin:0 0 20px;font-family:Georgia, serif;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.05rem;line-height:1.8;color:#a1a1aa;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:#d97706;color:#ffffff;font-weight:700;padding:15px 34px;border-radius:4px;font-size:0.92rem;text-decoration:none;letter-spacing:0.04em;">
                ${esc(copy.cta)} ↗
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:transparent;color:#ffffff;border:1px solid #71717a;font-weight:700;padding:14px 30px;border-radius:4px;font-size:0.92rem;text-decoration:none;">
                Mill Craft & GOTS Standards →
              </a>
            </div>
          </div>

          <!-- Right Lookbook Portrait Showcase -->
          <div data-reveal="fade-up" style="position:relative;">
            <div style="background:#27272a;border:1px solid #3f3f46;border-radius:4px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
              <div style="aspect-ratio:3/4;background:#18181b;border-radius:2px;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;height:100%;object-fit:cover;" fetchpriority="high">
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:0.75rem;color:#d97706;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">${esc(heroProduct.badge)}</div>
                  <h2 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:4px 0 0;font-family:Georgia, serif;">${esc(heroProduct.name)}</h2>
                </div>
                <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="color:#d97706;text-decoration:none;font-size:0.88rem;font-weight:700;">
                  Lookbook ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Fabric Technology Ribbon
  const fabricTechHtml = `
    <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;">
        <span style="font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:#b45309;font-weight:800;">FABRIC INNOVATION MATRIX</span>
        <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:800;color:#18181b;letter-spacing:-0.02em;margin:10px 0 14px;font-family:Georgia, serif;">
          High-Performance Weaves & Eco-Textile Innovations
        </h2>
        <p style="font-size:1rem;color:#71717a;margin:0;">
          From 3-layer waterproof membranes to WholeGarment Merino and GOTS organic flax linen.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;padding:24px;">
          <div style="font-size:0.75rem;font-weight:800;color:#d97706;letter-spacing:0.08em;margin-bottom:8px;">MEMBRANE TECH</div>
          <h3 style="font-size:1.1rem;font-weight:800;color:#18181b;margin:0 0 8px;font-family:Georgia, serif;">3L StormShell Laminate</h3>
          <p style="font-size:0.85rem;color:#71717a;line-height:1.6;margin:0;">20k waterproof and 15k breathability with zero seam leakage.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;padding:24px;">
          <div style="font-size:0.75rem;font-weight:800;color:#d97706;letter-spacing:0.08em;margin-bottom:8px;">SEAMLESS 3D KNIT</div>
          <h3 style="font-size:1.1rem;font-weight:800;color:#18181b;margin:0 0 8px;font-family:Georgia, serif;">WholeGarment 3D Knit</h3>
          <p style="font-size:0.85rem;color:#71717a;line-height:1.6;margin:0;">Zero-waste seamless 3D knit from 19.5μm Australian Merino.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;padding:24px;">
          <div style="font-size:0.75rem;font-weight:800;color:#d97706;letter-spacing:0.08em;margin-bottom:8px;">HEAVYWEIGHT COTTON</div>
          <h3 style="font-size:1.1rem;font-weight:800;color:#18181b;margin:0 0 8px;font-family:Georgia, serif;">460GSM French Terry</h3>
          <p style="font-size:0.85rem;color:#71717a;line-height:1.6;margin:0;">Heavyweight compact loopback cotton with pre-shrunk enzyme wash.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;padding:24px;">
          <div style="font-size:0.75rem;font-weight:800;color:#d97706;letter-spacing:0.08em;margin-bottom:8px;">ORGANIC FLUIDITY</div>
          <h3 style="font-size:1.1rem;font-weight:800;color:#18181b;margin:0 0 8px;font-family:Georgia, serif;">Silk-TENCEL Luxury Twill</h3>
          <p style="font-size:0.85rem;color:#71717a;line-height:1.6;margin:0;">Natural liquid drape with GOTS certification and botanical dye.</p>
        </div>
      </div>
    </section>
  `;

  // Lookbook Gallery
  const lookbookHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.78rem;font-weight:800;color:#b45309;letter-spacing:0.12em;text-transform:uppercase;">LOOKBOOK ARCHIVE</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:800;color:#18181b;letter-spacing:-0.02em;margin:6px 0 0;font-family:Georgia, serif;">
            Seasonal Lookbook & Garment Collection
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:700;color:#d97706;text-decoration:none;font-size:0.92rem;">
          View Full Lookbook (8 Items) ↗
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:24px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.02);display:flex;flex-direction:column;">
            <div style="position:relative;aspect-ratio:3/4;background:#f4f4f5;overflow:hidden;">
              <span style="position:absolute;top:12px;left:12px;background:#18181b;color:#ffffff;font-size:0.7rem;font-weight:700;padding:3px 8px;border-radius:2px;letter-spacing:0.04em;">
                ${esc(p.badge)}
              </span>
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;width:100%;height:100%;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
              </a>
            </div>
            <div style="padding:18px;display:flex;flex-direction:column;flex:1;">
              <div style="font-size:0.72rem;font-weight:800;color:#b45309;text-transform:uppercase;margin-bottom:4px;letter-spacing:0.06em;">
                ${p.categoryNameEn}
              </div>
              <h3 style="font-size:1.05rem;font-weight:800;color:#18181b;margin:0 0 6px;line-height:1.35;font-family:Georgia, serif;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
              </h3>
              <p style="font-size:0.82rem;color:#71717a;line-height:1.5;margin:0 0 12px;flex:1;">
                ${esc(p.desc)}
              </p>
              <div style="border-top:1px solid #f4f4f5;padding-top:10px;font-size:0.75rem;color:#52525b;margin-bottom:12px;">
                <div><strong>Comp:</strong> ${esc(p.fabricComposition.slice(0, 30))}</div>
                <div style="margin-top:2px;"><strong>GSM:</strong> ${esc(p.weightGsm)}</div>
              </div>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f4f4f5;color:#18181b;font-weight:700;padding:8px;border-radius:2px;font-size:0.8rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#18181b;color:#ffffff;font-weight:700;padding:8px;border-radius:2px;font-size:0.8rem;text-decoration:none;">
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
    <main class="wr-inner wr-apparel-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${fabricTechHtml}
      ${lookbookHtml}
    </main>
  `;
}

export function renderApparelCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getApparelProducts(ctx);

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="catalog" style="padding-top:90px;background:#faf9f6;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:740px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 12px;border:1px solid rgba(217,119,6,0.4);color:#d97706;font-size:0.75rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">
            HAUTE RUNWAY CATALOG
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:800;color:#18181b;letter-spacing:-0.02em;margin:0 0 12px;font-family:Georgia, serif;">
            Haute Apparel & Performance Textiles Catalog
          </h1>
          <p style="font-size:1.02rem;color:#71717a;line-height:1.65;margin:0;">
            Browse luxury outerwear, WholeGarment knitwear, heavy French terry, and sustainable linen silhouettes.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.02);display:flex;flex-direction:column;">
              <div style="position:relative;aspect-ratio:3/4;background:#f4f4f5;overflow:hidden;">
                <span style="position:absolute;top:12px;left:12px;background:#18181b;color:#ffffff;font-size:0.7rem;font-weight:700;padding:3px 8px;border-radius:2px;">
                  ${esc(p.badge)}
                </span>
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;width:100%;height:100%;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              </div>
              <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                <div style="font-size:0.72rem;font-weight:800;color:#b45309;text-transform:uppercase;margin-bottom:4px;letter-spacing:0.06em;">
                  ${p.categoryNameEn}
                </div>
                <h2 style="font-size:1.1rem;font-weight:800;color:#18181b;margin:0 0 6px;line-height:1.35;font-family:Georgia, serif;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
                </h2>
                <p style="font-size:0.82rem;color:#71717a;line-height:1.5;margin:0 0 12px;flex:1;">
                  ${esc(p.desc)}
                </p>
                <div style="background:#fafafa;border:1px solid #f4f4f5;padding:10px 12px;font-size:0.75rem;color:#52525b;margin-bottom:14px;border-radius:2px;">
                  <div><strong>Composition:</strong> ${esc(p.fabricComposition)}</div>
                  <div style="margin-top:2px;"><strong>Weight:</strong> ${esc(p.weightGsm)}</div>
                  <div style="margin-top:2px;"><strong>MOQ:</strong> <span style="color:#b45309;font-weight:700;">${esc(p.moq)}</span></div>
                </div>
                <div style="display:flex;gap:8px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f4f4f5;color:#18181b;font-weight:700;padding:8px;border-radius:2px;font-size:0.8rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#18181b;color:#ffffff;font-weight:700;padding:8px;border-radius:2px;font-size:0.8rem;text-decoration:none;">
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

export function renderApparelDetail(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getApparelProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0];

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="detail" style="padding-top:90px;background:#faf9f6;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <div style="margin-bottom:20px;">
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-size:0.86rem;font-weight:700;color:#b45309;text-decoration:none;">
            ← Back to Lookbook Catalog
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.02);">
          <div style="aspect-ratio:3/4;background:#f4f4f5;border-radius:2px;overflow:hidden;position:relative;">
            <span style="position:absolute;top:16px;left:16px;background:#18181b;color:#ffffff;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:2px;">
              ${esc(p.badge)}
            </span>
            <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;" fetchpriority="high">
          </div>

          <div>
            <div style="font-size:0.75rem;font-weight:800;color:#b45309;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
              ${p.categoryNameEn} · ${esc(p.tagline)}
            </div>
            <h1 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:800;color:#18181b;line-height:1.2;margin:0 0 14px;font-family:Georgia, serif;">
              ${esc(p.name)}
            </h1>
            <p style="font-size:1rem;color:#52525b;line-height:1.7;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:2px;padding:20px;margin-bottom:28px;">
              <h3 style="font-size:0.88rem;font-weight:800;color:#18181b;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.06em;">
                Fabric Composition & Tech Pack Specs
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.84rem;color:#3f3f46;">
                <div><strong>Composition:</strong><br>${esc(p.fabricComposition)}</div>
                <div><strong>Weight (GSM):</strong><br>${esc(p.weightGsm)}</div>
                <div><strong>Craft & Finish:</strong><br>${esc(p.craftDetails)}</div>
                <div><strong>MOQ:</strong><br><span style="color:#b45309;font-weight:800;">${esc(p.moq)}</span></div>
              </div>
            </div>

            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="background:#18181b;color:#ffffff;font-weight:700;padding:14px 32px;border-radius:2px;font-size:0.92rem;text-decoration:none;">
                Request Bulk Quote ↗
              </a>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:transparent;color:#18181b;border:1px solid #d4d4d8;font-weight:700;padding:13px 24px;border-radius:2px;font-size:0.92rem;text-decoration:none;">
                Request Swatches
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderApparelAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const headline = getAboutHeadline(company, `${company.name} · Modern Garment Atelier & Textile Mill`);
  const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2012', num: parseInt(company.establishedYear || '2012', 10), label: 'Established', desc: 'Over a decade of textile craftsmanship' },
    { value: '450,000 pcs', num: 450000, suffix: ' pcs', label: 'Monthly Garment Capacity', desc: 'Automated laser cutting lines' },
    { value: 'OEKO-TEX 100', label: 'Eco Dyeing Standard', desc: 'Zero toxic chemical discharge' },
    { value: 'GOTS Certified', label: 'Organic Textile Standard', desc: 'Traceable organic supply chain' },
  ]);
  const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="about" style="padding-top:90px;background:#faf9f6;min-height:100vh;">
      <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:60px 0 80px;" data-reveal="fade-up">
        <!-- CENTERED EDITORIAL MASTHEAD -->
        <header style="text-align:center;max-width:680px;margin:0 auto 56px;">
          <div style="display:inline-block;width:40px;height:1px;background:#d97706;margin-bottom:20px;"></div>
          <div style="font-size:0.72rem;font-weight:800;color:#d97706;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px;">MILL RETROSPECTIVE & SUSTAINABILITY</div>
          <h1 style="font-size:clamp(2.4rem, 4.5vw, 3.8rem);font-weight:800;color:#18181b;letter-spacing:-0.02em;line-height:1.15;margin:0;font-family:Georgia,'Times New Roman',serif;">
            ${esc(headline)}
          </h1>
        </header>

        <!-- FULL-BLEED PANORAMIC ATELIER PHOTO -->
        <div style="margin:0 -20px 64px;overflow:hidden;">
          <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:480px;object-fit:cover;display:block;" loading="lazy">
        </div>

        <!-- EDITORIAL SUBTITLE -->
        <div style="text-align:center;max-width:620px;margin:0 auto 48px;">
          <p style="font-size:1.15rem;color:#71717a;line-height:1.8;margin:0;font-style:italic;font-family:Georgia,'Times New Roman',serif;">
            Dedicated to sustainable fiber sourcing, 3D seamless knitting, and luxury private label garment manufacturing.
          </p>
        </div>

        <!-- FLOWING PROSE STORY -->
        <div style="max-width:720px;margin:0 auto 64px;color:#3f3f46;font-size:1.02rem;line-height:1.9;font-family:Georgia,'Times New Roman',serif;">
          ${storyParagraphs.map((p) => `<p style="margin:0 0 20px;text-indent:2em;">${esc(p)}</p>`).join('')}
        </div>

        <!-- BORDERLESS STAT ROW WITH THIN RULES -->
        <div style="border-top:1px solid #d4d4d8;border-bottom:1px solid #d4d4d8;padding:40px 0;margin-bottom:64px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:32px;">
            ${highlights.map((h, i) => `
              <div style="text-align:center;${i > 0 ? 'border-left:1px solid #e4e4e7;' : ''}">
                <div style="font-size:2rem;font-weight:800;color:#18181b;line-height:1;margin-bottom:6px;font-family:Georgia,'Times New Roman',serif;">
                  ${esc(h.value)}
                </div>
                <div style="font-size:0.8rem;font-weight:700;color:#b45309;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:2px;">${esc(h.label)}</div>
                ${h.desc ? `<div style="font-size:0.75rem;color:#a1a1aa;">${esc(h.desc)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- WIDE SUSTAINABLE MILL SHOWCASE -->
        <div style="background:#18181b;border-radius:4px;padding:48px;display:grid;grid-template-columns:2fr 1fr;gap:48px;align-items:center;color:#ffffff;">
          <div>
            <div style="font-size:0.7rem;font-weight:800;color:#d97706;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">DIGITAL ATELIER</div>
            <h2 style="font-size:1.6rem;font-weight:800;color:#ffffff;margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;">Precision Laser Cutting & Zero-Water Dyeing</h2>
            <p style="color:#a1a1aa;font-size:0.95rem;line-height:1.75;margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;">
              Equipped with automated CAD laser cutting beds and ultrasonic seam sealing machinery. Supporting 15-day fast-response trial runs and high-volume seasonal production with shrinkage controlled below 1%.
            </p>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="display:inline-block;background:#d97706;color:#ffffff;font-weight:700;padding:12px 32px;font-size:0.86rem;text-decoration:none;letter-spacing:0.04em;">
              Book Atelier Visit
            </a>
          </div>
          <div style="display:grid;gap:12px;font-size:0.82rem;">
            ${[['OEKO-TEX 100','Infant-safe eco dyeing'],['GOTS Organic','Traceable organic fibers'],['GRS Recycled','Low-carbon recycled yarn'],['ISO 9001','Quality management system']].map(([title, desc]) => `
              <div style="background:#27272a;border:1px solid #3f3f46;padding:16px 18px;">
                <div style="color:#d97706;font-weight:800;margin-bottom:3px;">${title}</div>
                <div style="color:#a1a1aa;font-size:0.78rem;">${desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderApparelContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="contact" style="padding-top:90px;background:#faf9f6;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:720px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 12px;border:1px solid rgba(217,119,6,0.4);color:#d97706;font-size:0.75rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">
            ${esc(ui.contact)} · FASHION TECH PACK ATELIER
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:800;color:#18181b;letter-spacing:-0.02em;margin:0 0 12px;font-family:Georgia, serif;">
            Garment Manufacturing Inquiry & Swatch Kit
          </h1>
          <p style="font-size:1.02rem;color:#71717a;line-height:1.65;margin:0;">
            Submit your garment tech pack or request physical fabric swatches. Response within 12 hours.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;max-width:1040px;margin:0 auto;">
          <!-- Left Swatch Kit & Production Commitments -->
          <div style="background:#18181b;color:#ffffff;border-radius:4px;padding:36px;box-shadow:0 12px 40px rgba(0,0,0,0.15);">
            <h2 style="font-size:1.35rem;font-weight:800;margin:0 0 16px;color:#ffffff;font-family:Georgia, serif;">${esc(company.name)}</h2>
            <p style="font-size:0.88rem;color:#a1a1aa;line-height:1.65;margin:0 0 28px;">
              Haute couture garment manufacturer serving international designer labels and outdoor brands.
            </p>

            <div style="background:#27272a;border:1px solid #3f3f46;border-radius:2px;padding:18px;margin-bottom:28px;">
              <h3 style="font-size:0.82rem;font-weight:800;color:#d97706;text-transform:uppercase;margin:0 0 10px;">Atelier Commitments</h3>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#d4d4d8;line-height:1.7;">
                <li>5 business days fast prototype garment sampling</li>
                <li>Complimentary seasonal fabric swatch cards</li>
                <li>Color fastness grade 4.5+ & shrinkage <1%</li>
              </ul>
            </div>

            <div style="display:grid;gap:16px;font-size:0.88rem;">
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#d97706;text-transform:uppercase;margin-bottom:4px;">Email Direct</div>
                <a href="mailto:${esc(company.email)}" style="color:#ffffff;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
              </div>
              ${company.phone ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#d97706;text-transform:uppercase;margin-bottom:4px;">Phone / Atelier Line</div>
                  <div style="color:#ffffff;font-weight:700;">${esc(company.phone)}</div>
                </div>
              ` : ''}
              ${company.address ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#d97706;text-transform:uppercase;margin-bottom:4px;">Atelier & Mill Address</div>
                  <div style="color:#a1a1aa;line-height:1.5;">${esc(company.address)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Tech Pack Form -->
          <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;padding:36px;box-shadow:0 4px 16px rgba(0,0,0,0.02);">
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;gap:16px;">
              <div>
                <label style="display:block;font-size:0.82rem;font-weight:800;color:#18181b;margin-bottom:6px;">Your Name *</label>
                <input name="name" autocomplete="name" required maxlength="120" placeholder="e.g. Emma Watson" style="width:100%;padding:10px 12px;border-radius:2px;border:1px solid #d4d4d8;font-size:0.9rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.82rem;font-weight:800;color:#18181b;margin-bottom:6px;">Business Email *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="brand@fashionhouse.com" style="width:100%;padding:10px 12px;border-radius:2px;border:1px solid #d4d4d8;font-size:0.9rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.82rem;font-weight:800;color:#18181b;margin-bottom:6px;">Reference Silhouette (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:10px 12px;border-radius:2px;border:1px solid #d4d4d8;font-size:0.9rem;background:#ffffff;box-sizing:border-box;">
                  <option value="">— Select Silhouette —</option>
                  ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.82rem;font-weight:800;color:#18181b;margin-bottom:6px;">Fabric Category (${esc(ui.optional)})</label>
                <select name="fabricCategory" style="width:100%;padding:10px 12px;border-radius:2px;border:1px solid #d4d4d8;font-size:0.9rem;background:#ffffff;box-sizing:border-box;">
                  <option value="tech_outerwear">3-Layer Technical Shell / Outerwear</option>
                  <option value="seamless_knit">WholeGarment Merino Knitwear</option>
                  <option value="heavyweight_cotton">Heavyweight French Terry Cotton</option>
                  <option value="organic_linen">GOTS Organic Linen & Silk</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.82rem;font-weight:800;color:#18181b;margin-bottom:6px;">Inquiry Message *</label>
                <textarea name="message" required maxlength="5000" rows="3" placeholder="Describe your target quantities, fabric weight, colors, and deadline..." style="width:100%;padding:10px 12px;border-radius:2px;border:1px solid #d4d4d8;font-size:0.9rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="background:#18181b;color:#ffffff;font-weight:700;padding:12px;border-radius:2px;font-size:0.92rem;border:none;cursor:pointer;margin-top:4px;">
                Submit Apparel RFQ ↗
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderApparelPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const page = ctx.page;

  const company = draft.company;

  const brand = company.logoAssetId
    ? `<img src="${esc(ctx.asset(company.logoAssetId))}" alt="${esc(company.name)}" style="height:32px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:1.15rem;font-weight:800;letter-spacing:0.04em;color:#18181b;font-family:Georgia, serif;">${esc(company.name)}</span>`;

  const depth = ctx.depth;
  const languageLinks = (draft.languages || ['zh', 'en'])
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.75rem;font-weight:700;padding:3px 6px;border-radius:2px;text-decoration:none;${l === ctx.lang ? 'background:#18181b;color:#ffffff;' : 'color:#71717a;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-apparel-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(250,249,246,0.92);backdrop-filter:blur(16px);border-bottom:1px solid #e4e4e7;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;gap:16px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:24px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.86rem;font-weight:700;color:${page === 'home' ? '#d97706' : '#18181b'};letter-spacing:0.04em;">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.86rem;font-weight:700;color:${page === 'catalog' ? '#d97706' : '#18181b'};letter-spacing:0.04em;">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.86rem;font-weight:700;color:${page === 'about' ? '#d97706' : '#18181b'};letter-spacing:0.04em;">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.86rem;font-weight:700;color:${page === 'contact' ? '#d97706' : '#18181b'};letter-spacing:0.04em;">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="languages" style="display:flex;gap:3px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#18181b;color:#ffffff;font-weight:700;padding:7px 16px;border-radius:2px;font-size:0.8rem;text-decoration:none;letter-spacing:0.04em;">
            Swatches ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';
  switch (page) {
    case 'catalog': mainHtml = renderApparelCatalog(ctx); break;
    case 'detail': mainHtml = renderApparelDetail(ctx); break;
    case 'about': mainHtml = renderApparelAbout(ctx); break;
    case 'contact': mainHtml = renderApparelContact(ctx); break;
    default: mainHtml = renderApparelHome(ctx, isVideo); break;
  }

  const footerHtml = `
    <footer style="background:#18181b;color:#a1a1aa;padding:48px 0 24px;font-size:0.84rem;border-top:1px solid #27272a;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:36px;margin-bottom:32px;">
        <div>
          <div style="font-size:1.15rem;font-weight:800;color:#ffffff;margin-bottom:10px;font-family:Georgia, serif;">${esc(company.name)}</div>
          <p style="font-size:0.82rem;line-height:1.65;color:#a1a1aa;margin:0 0 12px;">
            Haute couture atelier and high-performance textile mill for global fashion brands.
          </p>
          <div style="font-size:0.75rem;color:#d97706;font-weight:700;">GOTS · OEKO-TEX 100 · GRS · ISO9001</div>
        </div>

        <div>
          <h4 style="font-size:0.82rem;font-weight:800;color:#ffffff;margin:0 0 10px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.8rem;">
            <li><a style="text-decoration:none;color:#a1a1aa;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Technical Outerwear</a></li>
            <li><a style="text-decoration:none;color:#a1a1aa;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>WholeGarment Knitwear</a></li>
            <li><a style="text-decoration:none;color:#a1a1aa;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Runway Tailoring</a></li>
            <li><a style="text-decoration:none;color:#a1a1aa;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Luxury French Terry</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.82rem;font-weight:800;color:#ffffff;margin:0 0 10px;text-transform:uppercase;">Atelier Metrics</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.8rem;">
            <li>✓ 450,000 Pcs Monthly Output</li>
            <li>✓ 5-Day Fast Sample Turnaround</li>
            <li>✓ 100% Automated Laser Cutting</li>
            <li>✓ Grade 4.5+ Color Fastness</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.82rem;font-weight:800;color:#ffffff;margin:0 0 10px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 6px;"><strong>Email:</strong> <a style="color:#d97706;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 6px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.78rem;color:#71717a;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #27272a;padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:0.78rem;color:#71717a;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>👗 Apparel & Textiles Haute Runway Edition</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
