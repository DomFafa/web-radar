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

export const TOYS_DEFAULT_PRODUCTS: ThemedProductItem[] = [
  {
    id: 'toy-p1',
    name: 'Apex Mecha-01 Cyber Samurai Articulated Figure',
    desc: '1/6 scale cybernetic warrior featuring 48 points of diecast alloy articulation, LED illuminated optical visor, and magnetic plasma blade weaponry.',
    badge: '1/6 Collector Edition',
    category: 'mecha',
    categoryNameZh: '',
    categoryNameEn: 'Articulated Mecha',
    material: 'Diecast Zinc Alloy + High-Impact ABS + POM Joints',
    dimensions: '320 × 140 × 85 mm (1/6 Scale)',
    packaging: 'Magnetic Collector Hardcover Box with Foam Cradle',
    moq: '300 Units (OEM / ODM)',
    tagline: 'Diecast Alloy 48-Point Articulation',
    img: getIndustryPlaceholder('toys', 0),
  },
  {
    id: 'toy-p2',
    name: 'Lumina Spirit Translucent Gradient Sofubi',
    desc: 'Artisan soft vinyl designer toy crafted with multi-layer translucent gradient crystal casting and airbrushed pearlescent shimmer coat.',
    badge: 'Designer Vinyl',
    category: 'designer',
    categoryNameZh: '',
    categoryNameEn: 'Designer Sofubi',
    material: 'Medical Grade Slush Mold PVC Soft Vinyl',
    dimensions: '180 × 120 × 110 mm',
    packaging: 'Header Card + Polybag with Holographic Seal',
    moq: '500 Units',
    tagline: 'Hand-Cast Iridescent Soft Vinyl',
    img: getIndustryPlaceholder('toys', 1),
  },
  {
    id: 'toy-p3',
    name: 'Void Walker Heavy Exoskeleton Polystone Statue',
    desc: 'Museum-grade cold cast resin statue with hand-applied battle weathering, metallic oil stains, and integrated acrylic base plate.',
    badge: '1/4 Master Statue',
    category: 'statue',
    categoryNameZh: '',
    categoryNameEn: 'Resin Statues',
    material: 'High-Density Cold Cast Polystone + PU Resin',
    dimensions: '420 × 260 × 240 mm (1/4 Scale)',
    packaging: 'Molded EPE Protective Box + Premium Color Crate',
    moq: '100 Units',
    tagline: 'Hand-Weathered Museum Quality',
    img: getIndustryPlaceholder('toys', 2),
  },
  {
    id: 'toy-p4',
    name: 'Neon Phantom Magnetic Swappable Blind Box Series',
    desc: 'Collectible desktop blind box series featuring 8 regular characters and 1 secret chase edition with magnetic snap-on masks and accessories.',
    badge: 'Blind Box Bestseller',
    category: 'blindbox',
    categoryNameZh: '',
    categoryNameEn: 'Blind Box Series',
    material: 'Non-Toxic PVC + N52 Neodymium Magnets',
    dimensions: '85 × 60 × 55 mm per figure',
    packaging: 'Foil Blind Bag in Counter Display Box (12 pcs/box)',
    moq: '2,400 Units (200 Master Cartons)',
    tagline: 'Modular Magnetic Faceplate Unboxing',
    img: getIndustryPlaceholder('toys', 3),
  },
  {
    id: 'toy-p5',
    name: 'Stellar Chrono UV-Reactive Dynamic Action Figure',
    desc: 'Futuristic time-traveler figure with UV fluorescent cyber markings, interchangeable hands, and ballistic acrylic energy shield.',
    badge: '1/12 Action Master',
    category: 'mecha',
    categoryNameZh: '',
    categoryNameEn: 'Articulated Mecha',
    material: 'UV Reactive PVC + Nylon Polymer Core',
    dimensions: '210 × 90 × 50 mm (1/12 Scale)',
    packaging: 'Window Blister Pack with Collector Card',
    moq: '1,000 Units',
    tagline: 'UV-Luminescent Cyber Graphics',
    img: getIndustryPlaceholder('toys', 4),
  },
  {
    id: 'toy-p6',
    name: 'Retro Future Desktop Bipedal Clockwork Robot',
    desc: 'Precision mechanical escapement walker toy constructed from CNC brass, polished aluminum, and tinted transparent acrylic hull.',
    badge: 'Kinetic Art Toy',
    category: 'designer',
    categoryNameZh: '',
    categoryNameEn: 'Designer Sofubi',
    material: 'H62 Brass + 6061 Aluminum + Cast Acrylic',
    dimensions: '145 × 95 × 80 mm',
    packaging: 'Laser Engraved Wooden Presentation Box',
    moq: '300 Units',
    tagline: 'Bionic Mechanical Walking Motion',
    img: getIndustryPlaceholder('toys', 5),
  },
  {
    id: 'toy-p7',
    name: 'Celestial Beast Mythological Sofubi Art Toy',
    desc: 'East-meets-cyberpunk mythical beast figure rendered in double-pour Japanese Sofubi technique with metallic violet and cyan overspray.',
    badge: 'Limited Run Art',
    category: 'designer',
    categoryNameZh: '',
    categoryNameEn: 'Designer Sofubi',
    material: 'Rotomolded Slush Vinyl Compound',
    dimensions: '230 × 170 × 150 mm',
    packaging: 'Japanese Washi Screen Printed Box',
    moq: '200 Units',
    tagline: 'Double-Pour Slush Mold Craft',
    img: getIndustryPlaceholder('toys', 6),
  },
  {
    id: 'toy-p8',
    name: 'Hyper-Speed Chibi Cyber Pilot Model Kit',
    desc: 'Snap-fit precision molded color-separated model kit with waterslide decal sheet and articulated cockpit hatch.',
    badge: 'Snap-Fit Model Kit',
    category: 'blindbox',
    categoryNameZh: '',
    categoryNameEn: 'Blind Box Series',
    material: 'Multi-Color Injected Polystyrene (PS/PE)',
    dimensions: '110 × 85 × 75 mm assembled',
    packaging: 'Offset Printed Color Box with Manual',
    moq: '1,500 Sets',
    tagline: 'Zero-Glue Precision Snap-Fit Assembly',
    img: getIndustryPlaceholder('toys', 7),
  },
];

export function getToysProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Figure Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: `1/${idx % 2 === 0 ? '6' : '12'} Scale`,
      category: 'toys',
      categoryNameZh: '',
      categoryNameEn: 'Toys & Figures',
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
      const fallback = TOYS_DEFAULT_PRODUCTS[idx % TOYS_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? ('1/6 Flagship Edition') : ('Collector Choice'),
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
  return TOYS_DEFAULT_PRODUCTS;
}

export function renderToysHome(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const products = getToysProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || ('Articulated Figures & Designer Vinyl Toy Engineering Studio'),
    subtitle: userCopy?.subtitle || ('Precision engineered 1/6 diecast articulated figures, designer vinyl art toys, blind boxes, and museum statues. Powered by master sculptors, dust-free paint lines, and global collector fulfillment.'),
    cta: userCopy?.cta || ('Explore Figure Gallery'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-toys-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#090d16;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.55;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(6,182,212,0.12) 0%, rgba(9,13,22,0.92) 80%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:980px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:9999px;background:rgba(6,182,212,0.15);backdrop-filter:blur(20px);border:1px solid rgba(6,182,212,0.4);box-shadow:0 0 25px rgba(6,182,212,0.25);font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#38bdf8;margin-bottom:24px;">
            <span style="width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 10px #38bdf8;"></span>
            COLLECTIBLE FIGURE & MECHA MOTION SHOWCASE
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.4rem, 5vw, 4.2rem);font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;margin:0 0 22px;text-shadow:0 4px 30px rgba(0,0,0,0.8);">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.22rem);line-height:1.75;color:rgba(255,255,255,0.85);margin:0 auto 34px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:12px;font-size:0.95rem;box-shadow:0 10px 30px rgba(2,132,199,0.45);border:none;text-decoration:none;">
              ${esc(copy.cta)} ↗
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.08);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.25);font-weight:700;padding:15px 32px;border-radius:12px;font-size:0.95rem;text-decoration:none;">
              3D CAD Tooling RFQ
            </a>
          </div>
          <!-- Real-Time Cyber Toy Metrics Glass HUD -->
          <div data-reveal="fade-up" style="margin-top:50px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;padding:24px;border-radius:20px;background:rgba(15,23,42,0.75);backdrop-filter:blur(24px);border:1px solid rgba(56,189,248,0.25);box-shadow:0 20px 60px rgba(0,0,0,0.6);">
            <div>
              <div style="font-size:2rem;font-weight:900;color:#38bdf8;">48 Pts</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Max Articulation</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#f59e0b;">±0.01mm</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">CNC Tooling Tolerance</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#38bdf8;">600,000+</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Monthly Output</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#34d399;">ISO 8124 / CE</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Toy Safety Standard</div>
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
      ? `linear-gradient(135deg, rgba(11,15,25,0.92) 0%, rgba(15,23,42,0.96) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)`;

    heroSectionHtml = `
      <section class="wr-toys-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid rgba(56,189,248,0.2);color:#ffffff;">
        <div style="position:absolute;top:-10%;right:10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%);filter:blur(60px);pointer-events:none;"></div>
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:center;">
          <!-- Left Info -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:8px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
              ⚡ PRECISION FIGURE & DIECAST MECHA ATELIER
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.3rem, 4vw, 3.6rem);font-weight:900;color:#ffffff;line-height:1.18;letter-spacing:-0.03em;margin:0 0 20px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.08rem;line-height:1.75;color:#94a3b8;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:15px 34px;border-radius:12px;font-size:0.95rem;box-shadow:0 8px 24px rgba(2,132,199,0.35);text-decoration:none;">
                ${esc(copy.cta)} ↗
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.06);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);font-weight:700;padding:14px 30px;border-radius:12px;font-size:0.95rem;text-decoration:none;">
                Studio Craft & Prototyping →
              </a>
            </div>
            <!-- Technical Spec Line -->
            <div style="margin-top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;">
              <div>
                <div style="font-size:1.5rem;font-weight:900;color:#38bdf8;">15 Yrs</div>
                <div style="font-size:0.75rem;color:#94a3b8;margin-top:2px;">Sculpting Mastery</div>
              </div>
              <div>
                <div style="font-size:1.5rem;font-weight:900;color:#f59e0b;">±0.01mm</div>
                <div style="font-size:0.75rem;color:#94a3b8;margin-top:2px;">CNC Precision</div>
              </div>
              <div>
                <div style="font-size:1.5rem;font-weight:900;color:#34d399;">AQL 0.4</div>
                <div style="font-size:0.75rem;color:#94a3b8;margin-top:2px;">Collector QC</div>
              </div>
            </div>
          </div>

          <!-- Right Toy Window Box Display Frame -->
          <div data-reveal="fade-up" style="position:relative;">
            <div class="wr-card-hover" style="position:relative;background:#0f172a;border:1px solid #334155;border-radius:24px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.6);border-top:4px solid #38bdf8;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:4px 12px;border-radius:6px;font-size:0.75rem;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;">
                  ${esc(heroProduct.badge)}
                </span>
                <span style="font-size:0.78rem;color:#64748b;font-family:monospace;">ITEM #${esc(heroProduct.id)}</span>
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, #1e293b 30%, #0b0f19 100%);border-radius:18px;margin-bottom:20px;padding:20px;border:1px solid #1e293b;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:260px;object-fit:contain;" fetchpriority="high">
              </div>
              <div style="font-size:0.78rem;color:#f59e0b;font-weight:800;text-transform:uppercase;margin-bottom:6px;">
                ${heroProduct.categoryNameEn} · ${esc(heroProduct.tagline)}
              </div>
              <h2 style="font-size:1.25rem;font-weight:900;color:#ffffff;margin:0 0 8px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.86rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#1e293b;color:#ffffff;font-weight:800;padding:12px;border-radius:10px;font-size:0.85rem;text-decoration:none;border:1px solid #334155;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:12px;border-radius:10px;font-size:0.85rem;text-decoration:none;">
                  ${esc(ui.inquire)} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // 5-Stage Precision Mold Craft Timeline
  const pipelineHtml = `
    <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;">
        <span style="font-size:0.8rem;font-weight:800;color:#0284c7;letter-spacing:0.1em;text-transform:uppercase;">PRECISION TOOLING WORKFLOW</span>
        <h2 style="font-size:clamp(1.9rem, 3.4vw, 2.6rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:10px 0 14px;">
          5-Stage Industrial Figure Engineering Pipeline
        </h2>
        <p style="font-size:1rem;color:#64748b;margin:0;">
          From 2D concept sketches to master collector vitrines with full CNC tolerance control.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:22px;border-top:3px solid #0284c7;">
          <div style="font-size:0.75rem;font-weight:900;color:#0284c7;margin-bottom:8px;">STAGE 01</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Digital 3D Sculpting</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">High-poly digital modeling with joint kinematics pre-simulation.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:22px;border-top:3px solid #06b6d4;">
          <div style="font-size:0.75rem;font-weight:900;color:#06b6d4;margin-bottom:8px;">STAGE 02</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">Wax & Silicone Prototypes</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">SLA high-resolution rapid prototyping in 7 business days.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:22px;border-top:3px solid #f59e0b;">
          <div style="font-size:0.75rem;font-weight:900;color:#f59e0b;margin-bottom:8px;">STAGE 03</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">S136 Steel CNC Tooling</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">5-Axis high-speed milling with ±0.01mm tolerance.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:22px;border-top:3px solid #8b5cf6;">
          <div style="font-size:0.75rem;font-weight:900;color:#8b5cf6;margin-bottom:8px;">STAGE 04</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">16-Color Pad & Clean Paint</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">Dust-free cleanroom coating with pearlescent & UV finishes.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:22px;border-top:3px solid #10b981;">
          <div style="font-size:0.75rem;font-weight:900;color:#10b981;margin-bottom:8px;">STAGE 05</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#0f172a;margin:0 0 6px;">AQL 0.4 Collector QC</h3>
          <p style="font-size:0.82rem;color:#64748b;line-height:1.5;margin:0;">100% surface QC, anti-counterfeit labels, and drop testing.</p>
        </div>
      </div>
    </section>
  `;

  // Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.8rem;font-weight:800;color:#0284c7;letter-spacing:0.08em;text-transform:uppercase;">COLLECTIBLE VAULT</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:6px 0 0;">
            Featured Toy & Mecha Collection
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#0284c7;text-decoration:none;font-size:0.92rem;">
          View Full Figure Catalog (8 Items) ↗
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
            <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #f1f5f9 100%);display:flex;align-items:center;justify-content:center;padding:24px;overflow:hidden;">
              <span style="position:absolute;top:12px;left:12px;background:#0f172a;color:#ffffff;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:6px;">
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
              <div style="background:#f8fafc;border-radius:10px;padding:10px 12px;font-size:0.78rem;color:#475569;margin-bottom:14px;">
                <div><strong>Scale:</strong> ${esc(p.dimensions)}</div>
                <div style="margin-top:2px;"><strong>MOQ:</strong> <span style="color:#0284c7;font-weight:800;">${esc(p.moq)}</span></div>
              </div>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:8px;font-size:0.82rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:10px;border-radius:8px;font-size:0.82rem;text-decoration:none;">
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
    <main class="wr-inner wr-toys-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${pipelineHtml}
      ${productsGridHtml}
    </main>
  `;
}

export function renderToysCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getToysProducts(ctx);

  return `
    <main class="wr-inner wr-toys-inner" data-wr-page="catalog" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:760px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(2,132,199,0.1);color:#0284c7;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            COLLECTIBLE FIGURE CATALOG
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 14px;">
            Articulated Mecha, Designer Vinyl & Blind Boxes
          </h1>
          <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
            Explore all 8 collectible toys and figures with complete OEM/ODM tooling, 3D prototyping, and collector packaging options.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
              <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #f1f5f9 100%);display:flex;align-items:center;justify-content:center;padding:24px;">
                <span style="position:absolute;top:12px;left:12px;background:#0f172a;color:#ffffff;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:6px;">
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
                <div style="background:#f8fafc;border-radius:10px;padding:10px 12px;font-size:0.78rem;color:#334155;margin-bottom:16px;display:grid;gap:4px;">
                  <div><strong>Material:</strong> ${esc(p.material)}</div>
                  <div><strong>Dimensions:</strong> ${esc(p.dimensions)}</div>
                  <div><strong>MOQ:</strong> <span style="color:#0284c7;font-weight:800;">${esc(p.moq)}</span></div>
                </div>
                <div style="display:flex;gap:8px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:8px;font-size:0.82rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:10px;border-radius:8px;font-size:0.82rem;text-decoration:none;">
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

export function renderToysDetail(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;

  const products = getToysProducts(ctx);
  const prodId = ctx.options.productId || products[0].id;
  const p = products.find((item) => item.id === prodId) || products[0];

  return `
    <main class="wr-inner wr-toys-inner" data-wr-page="detail" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <div style="margin-bottom:20px;">
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-size:0.86rem;font-weight:800;color:#0284c7;text-decoration:none;">
            ← Back to Figure Catalog
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #e2e8f0;border-radius:28px;padding:36px;box-shadow:0 10px 30px rgba(0,0,0,0.04);">
          <!-- Left Showcase Stage -->
          <div style="background:radial-gradient(circle, #f8fafc 30%, #e2e8f0 100%);border-radius:22px;padding:40px;display:flex;align-items:center;justify-content:center;border:1px solid #cbd5e1;position:relative;">
            <span style="position:absolute;top:20px;left:20px;background:#0f172a;color:#ffffff;font-size:0.75rem;font-weight:800;padding:5px 12px;border-radius:6px;">
              ${esc(p.badge)}
            </span>
            <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;" fetchpriority="high">
          </div>

          <!-- Right Product Detail Specs -->
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

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:28px;">
              <h3 style="font-size:0.92rem;font-weight:900;color:#0f172a;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.04em;">
                Engineering & Export Specifications
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.84rem;color:#334155;">
                <div><strong>Core Material:</strong><br>${esc(p.material)}</div>
                <div><strong>Scale & Dimensions:</strong><br>${esc(p.dimensions)}</div>
                <div><strong>Packaging:</strong><br>${esc(p.packaging)}</div>
                <div><strong>MOQ:</strong><br><span style="color:#0284c7;font-weight:800;">${esc(p.moq)}</span></div>
                <div><strong>QC Standard:</strong><br>AQL 0.4 Full Check</div>
                <div><strong>Safety Compliance:</strong><br>CE / ISO 8124 / REACH</div>
              </div>
            </div>

            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="background:linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:15px 32px;border-radius:10px;font-size:0.92rem;box-shadow:0 6px 20px rgba(2,132,199,0.3);text-decoration:none;">
                Request Quote & Sample ↗
              </a>
              <a href="${path('contact/index.html')}?inquiry=oem" ${navAttrs('contact')} class="button" style="background:#0f172a;color:#ffffff;font-weight:800;padding:15px 28px;border-radius:10px;font-size:0.92rem;text-decoration:none;">
                Custom IP Tooling Inquiry
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderToysAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  const headline = getAboutHeadline(company, 'High-End Figure Sculpting & Tooling Engineering');
  const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2015', num: parseInt(company.establishedYear || '2015', 10), label: 'Established', desc: 'Figure engineering excellence' },
    { value: '500+ Sets', num: 500, suffix: '+ Sets', label: 'Precision Tooling Molds', desc: 'S136 mold steel machining' },
    { value: '\u00b10.01mm', num: 0.01, prefix: '\u00b1', suffix: 'mm', label: 'Tooling CNC Tolerance', desc: 'Zero gap seamless fit' },
    { value: '100%', num: 100, suffix: '%', label: 'Safety Compliance', desc: 'ISO 8124 & REACH passed' },
  ]);
  const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

  return `
    <main class="wr-inner wr-toys-inner" data-wr-page="about" style="padding-top:90px;background:#0b0f19;color:#ffffff;min-height:100vh;">
      <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <!-- FULL-WIDTH HERO IMAGE WITH HUD OVERLAY -->
        <div style="position:relative;border-radius:20px;overflow:hidden;margin-bottom:60px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
          <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:520px;object-fit:cover;display:block;filter:brightness(0.7);" loading="lazy">
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(11,15,25,0.3) 0%, rgba(11,15,25,0.85) 100%);"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:40px 48px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:0.75rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;">
              STUDIO DOSSIER & CRAFT
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.4rem);font-weight:900;color:#ffffff;letter-spacing:-0.03em;line-height:1.15;margin:0;">
              ${esc(headline)}
            </h1>
          </div>
          <!-- Corner HUD Coordinates -->
          <div style="position:absolute;top:20px;right:20px;font-family:'Courier New',monospace;font-size:0.7rem;color:rgba(56,189,248,0.6);text-align:right;line-height:1.6;">
            LOC: ENGINEERING HQ<br>
            SYS: CNC 5-AXIS READY<br>
            STATUS: OPERATIONAL
          </div>
        </div>

        <!-- ASYMMETRIC 2-COL STORY (60/40) -->
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:48px;align-items:start;margin-bottom:60px;">
          <div>
            <div style="color:#94a3b8;font-size:1.02rem;line-height:1.85;display:flex;flex-direction:column;gap:16px;">
              ${storyParagraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
          </div>
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(56,189,248,0.2);border-radius:20px;padding:28px;backdrop-filter:blur(12px);">
            <div style="border-left:3px solid #38bdf8;padding-left:16px;margin-bottom:20px;">
              <div style="font-weight:800;color:#ffffff;font-size:0.95rem;line-height:1.6;font-style:italic;">"Bridging digital concept art and tangible collector masterpieces with 5-axis CNC precision."</div>
              <div style="color:#38bdf8;font-size:0.78rem;margin-top:6px;">${esc(company.name)} · Engineering Committee</div>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.8rem;">
              <div><span style="color:#38bdf8;font-weight:800;">Format:</span><span style="color:#94a3b8;margin-left:6px;">.STEP / .STL / .OBJ</span></div>
              <div><span style="color:#38bdf8;font-weight:800;">Tolerance:</span><span style="color:#94a3b8;margin-left:6px;">\u00b10.01mm</span></div>
              <div><span style="color:#38bdf8;font-weight:800;">Scales:</span><span style="color:#94a3b8;margin-left:6px;">1/4 · 1/6 · 1/12</span></div>
              <div><span style="color:#38bdf8;font-weight:800;">Steel:</span><span style="color:#94a3b8;margin-left:6px;">S136 Mold Grade</span></div>
            </div>
          </div>
        </div>

        <!-- HORIZONTAL TIMELINE PIPELINE -->
        <div style="margin-bottom:60px;background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.15);border-radius:18px;padding:32px 28px;">
          <div style="font-size:0.75rem;font-weight:800;color:#f59e0b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;">5-STAGE PRECISION TOOLING PIPELINE</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0;position:relative;">
            <div style="position:absolute;top:20px;left:8%;right:8%;height:2px;background:linear-gradient(90deg,#38bdf8,#06b6d4,#0284c7,#f59e0b,#34d399);opacity:0.4;"></div>
            ${['Concept Sculpt|Digital ZBrush sculpt & anatomy review','Silicone Mold|RTV silicone master pattern split','Steel Tooling|S136 CNC 5-axis precision mold','Pad Printing|16-color automated pad & spray','QC & Pack|Safety test, needle check, sealed pack'].map((s, i) => {
              const [title, desc] = s.split('|');
              return `
              <div style="text-align:center;position:relative;">
                <div style="width:40px;height:40px;border-radius:50%;background:#0f172a;border:2px solid #38bdf8;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:0.8rem;font-weight:900;color:#38bdf8;position:relative;z-index:1;">0${i+1}</div>
                <div style="font-size:0.82rem;font-weight:800;color:#ffffff;margin-bottom:4px;">${title}</div>
                <div style="font-size:0.72rem;color:#64748b;line-height:1.4;">${desc}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- METRIC PODS -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:60px;">
          ${highlights.map((h) => `
            <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.2);border-radius:18px;padding:28px 20px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem;font-weight:900;color:#38bdf8;line-height:1;margin-bottom:8px;">
                ${esc(h.value)}
              </div>
              <div style="font-size:0.88rem;font-weight:800;color:#ffffff;margin-bottom:4px;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.78rem;color:#94a3b8;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- DARK GLASS MACHINERY GRID (3 columns) -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
          ${[
            ['Makino 5-Axis','CNC precision mold machining center','#38bdf8'],
            ['16-Color Pad Print','Automated multi-color tampo printing','#f59e0b'],
            ['Cleanroom Paint','Class 100K dust-free spray coating','#06b6d4'],
            ['Dual-Shot Inject','Bi-material injection molding line','#a78bfa'],
            ['Optical CMM','Coordinate measuring quality inspection','#34d399'],
            ['Safety Lab','CE / ISO 8124 / REACH compliance','#fb923c']
          ].map(([title, desc, color]) => `
            <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:22px;transition:border-color 0.2s;">
              <div style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color};margin-bottom:12px;"></div>
              <div style="font-size:0.88rem;font-weight:800;color:#ffffff;margin-bottom:4px;">${title}</div>
              <div style="font-size:0.78rem;color:#64748b;line-height:1.5;">${desc}</div>
            </div>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

export function renderToysContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;

  return `
    <main class="wr-inner wr-toys-inner" data-wr-page="contact" style="padding-top:90px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:720px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(2,132,199,0.1);color:#0284c7;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            ${esc(ui.contact)} · 3D ENGINEERING WORKBENCH
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 14px;">
            Start Your Figure Tooling & Wholesale RFQ
          </h1>
          <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
            Submit your 3D files or custom figure specs. Our engineering team responds within 24 hours with tooling quotes and sample timelines.
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;max-width:1040px;margin:0 auto;">
          <!-- Left Engineering Guide Panel -->
          <div style="background:#090d16;color:#ffffff;border-radius:24px;padding:36px;box-shadow:0 12px 40px rgba(0,0,0,0.2);border-top:4px solid #0284c7;">
            <h2 style="font-size:1.35rem;font-weight:900;margin:0 0 16px;color:#ffffff;">${esc(company.name)}</h2>
            <p style="font-size:0.9rem;color:#94a3b8;line-height:1.65;margin:0 0 28px;">
              High-end collectible toy and figure manufacturing base. Supporting .STEP / .STL / .OBJ 3D CAD files.
            </p>

            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;margin-bottom:28px;">
              <h3 style="font-size:0.84rem;font-weight:800;color:#38bdf8;text-transform:uppercase;margin:0 0 10px;">Engineering Specifications</h3>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#cbd5e1;line-height:1.7;">
                <li>Machining Tolerance: ±0.01mm 5-axis CNC</li>
                <li>Scales: 1/6, 1/12, 1/4 Statues, Blind Boxes</li>
                <li>Prototypes: 3D printed white model in 7 days</li>
                <li>Mold Lifespan: S136 steel >300k shots</li>
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
                  <div style="font-size:0.75rem;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;">Studio & Facility</div>
                  <div style="color:#94a3b8;line-height:1.5;">${esc(company.address)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Interactive RFQ Form -->
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;gap:16px;">
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Your Name *</label>
                <input name="name" autocomplete="name" required maxlength="120" placeholder="e.g. John Doe" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Business Email *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="buyer@brand.com" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Selected Figure Product (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid #cbd5e1;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="">— Select Reference Product —</option>
                  ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Prototyping Stage (${esc(ui.optional)})</label>
                <select name="prototypeStage" style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid #cbd5e1;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="concept">2D Concept Sketch / Need 3D Modeling</option>
                  <option value="cad_ready">3D CAD Ready / Need SLA White Prototype</option>
                  <option value="tooling">Prototype Approved / Need CNC Steel Mold</option>
                  <option value="mass_production">Mass Production & Painting (OEM/ODM)</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Inquiry Message *</label>
                <textarea name="message" required maxlength="5000" rows="3" placeholder="Describe your project scale, quantity, materials, and target delivery deadline..." style="width:100%;padding:11px 14px;border-radius:8px;border:1px solid #cbd5e1;font-size:0.92rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="background:linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:13px;border-radius:8px;font-size:0.95rem;border:none;cursor:pointer;margin-top:4px;box-shadow:0 6px 20px rgba(2,132,199,0.3);">
                Submit Figure RFQ ↗
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderToysFigureThemePage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const page = ctx.page;

  const company = draft.company;

  const brand = company.logoAssetId
    ? `<img src="${esc(ctx.asset(company.logoAssetId))}" alt="${esc(company.name)}" style="height:36px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#0f172a;">${esc(company.name)}</span>`;

  const depth = ctx.depth;
  const languageLinks = (draft.languages || ['zh', 'en'])
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:6px;text-decoration:none;${l === ctx.lang ? 'background:#0284c7;color:#ffffff;' : 'color:#64748b;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-toys-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.88);backdrop-filter:blur(20px);border-bottom:1px solid #e2e8f0;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
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
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0f172a;color:#ffffff;font-weight:800;padding:8px 18px;border-radius:8px;font-size:0.84rem;text-decoration:none;">
            Tooling RFQ ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';
  switch (page) {
    case 'catalog': mainHtml = renderToysCatalog(ctx); break;
    case 'detail': mainHtml = renderToysDetail(ctx); break;
    case 'about': mainHtml = renderToysAbout(ctx); break;
    case 'contact': mainHtml = renderToysContact(ctx); break;
    default: mainHtml = renderToysHome(ctx, isVideo); break;
  }

  const footerHtml = `
    <footer style="background:#090d16;color:#94a3b8;padding:50px 0 24px;font-size:0.86rem;border-top:1px solid #1a2035;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:36px;margin-bottom:36px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#ffffff;margin-bottom:10px;">${esc(company.name)}</div>
          <p style="font-size:0.84rem;line-height:1.65;color:#94a3b8;margin:0 0 12px;">
            High-end collectible toy & figure manufacturing studio serving global brands and collectors.
          </p>
          <div style="font-size:0.78rem;color:#38bdf8;font-weight:700;">CE Safety · ISO 8124 · REACH · CCC · ISO9001</div>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Articulated Mecha</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Designer Sofubi</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Resin Statues</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Blind Boxes</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">Studio Capabilities</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li>✓ 600,000 Pcs Monthly Figure Output</li>
            <li>✓ ±0.01mm 5-Axis CNC Tooling</li>
            <li>✓ 7-Day Fast 3D SLA Prototype</li>
            <li>✓ AQL 0.4 Collector Inspection</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 6px;"><strong>Email:</strong> <a style="color:#38bdf8;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 6px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.8rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1a2035;padding-top:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:0.8rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>🎮 Toys & Figures Global Trade Edition</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
