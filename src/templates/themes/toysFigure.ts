import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

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
    badge: 'Limited Collector Edition',
    category: 'mecha',
    categoryNameZh: '机动装甲机甲',
    categoryNameEn: 'Articulated Mecha',
    material: 'Diecast Zinc Alloy + High-Impact ABS + POM Joints',
    dimensions: '320 × 140 × 85 mm (1/6 Scale)',
    packaging: 'Magnetic Luxury Hardcover Box with Foam Cradle',
    moq: '300 Units (OEM / ODM)',
    tagline: 'Diecast Alloy 48-Point Articulation',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'toy-p2',
    name: 'Lumina Spirit Translucent Gradient Sofubi',
    desc: 'Artisan soft vinyl designer toy crafted with multi-layer translucent gradient crystal casting and airbrushed pearlescent shimmer coat.',
    badge: 'Designer Vinyl',
    category: 'designer',
    categoryNameZh: '潮玩艺术家公仔',
    categoryNameEn: 'Designer Sofubi',
    material: 'Eco-Friendly Medical Grade PVC Soft Vinyl',
    dimensions: '180 × 120 × 110 mm',
    packaging: 'Header Card + Polybag with Holographic Seal',
    moq: '500 Units',
    tagline: 'Hand-Cast Iridescent Soft Vinyl',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'toy-p3',
    name: 'Void Walker Heavy Exoskeleton Polystone Statue',
    desc: 'Museum-grade cold cast resin statue with hand-applied battle weathering, metallic oil stains, and integrated acrylic base plate.',
    badge: 'Master Statue',
    category: 'statue',
    categoryNameZh: '收藏级雕像手办',
    categoryNameEn: 'Resin Statues',
    material: 'High-Density Cold Cast Polystone + PU Resin',
    dimensions: '420 × 260 × 240 mm (1/4 Scale)',
    packaging: 'Molded EPE Protective Box + Premium Color Crate',
    moq: '100 Units',
    tagline: 'Hand-Weathered Museum Quality',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'toy-p4',
    name: 'Neon Phantom Magnetic Swappable Blind Box Series',
    desc: 'Collectible desktop blind box series featuring 8 regular characters and 1 secret chase edition with magnetic snap-on masks and accessories.',
    badge: 'Blind Box Bestseller',
    category: 'blindbox',
    categoryNameZh: '潮流艺术盲盒',
    categoryNameEn: 'Blind Box Series',
    material: 'Non-Toxic PVC + N52 Neodymium Magnets',
    dimensions: '85 × 60 × 55 mm per figure',
    packaging: 'Foil Blind Bag in Counter Display Box (12 pcs/box)',
    moq: '2,400 Units (200 Master Cartons)',
    tagline: 'Modular Magnetic Faceplate Unboxing',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'toy-p5',
    name: 'Stellar Chrono UV-Reactive Dynamic Action Figure',
    desc: 'Futuristic time-traveler figure with UV fluorescent cyber markings, interchangeable hands, and ballistic acrylic energy shield.',
    badge: 'Action Master',
    category: 'mecha',
    categoryNameZh: '机动装甲机甲',
    categoryNameEn: 'Articulated Mecha',
    material: 'UV Reactive PVC + Nylon Polymer Core',
    dimensions: '210 × 90 × 50 mm (1/12 Scale)',
    packaging: 'Window Blister Pack with Collector Card',
    moq: '1,000 Units',
    tagline: 'UV-Luminescent Cyber Graphics',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'toy-p6',
    name: 'Retro Future Desktop Bipedal Clockwork Robot',
    desc: 'Precision mechanical escapement walker toy constructed from CNC brass, polished aluminum, and tinted transparent acrylic hull.',
    badge: 'Kinetic Art',
    category: 'designer',
    categoryNameZh: '潮玩艺术家公仔',
    categoryNameEn: 'Designer Sofubi',
    material: 'H62 Brass + 6061 Aluminum + Cast Acrylic',
    dimensions: '145 × 95 × 80 mm',
    packaging: 'Laser Engraved Wooden Presentation Box',
    moq: '300 Units',
    tagline: 'Bionic Mechanical Walking Motion',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'toy-p7',
    name: 'Celestial Beast Mythological Sofubi Art Toy',
    desc: 'East-meets-cyberpunk mythical beast figure rendered in double-pour Japanese Sofubi technique with metallic violet and cyan overspray.',
    badge: 'Limited Run',
    category: 'designer',
    categoryNameZh: '潮玩艺术家公仔',
    categoryNameEn: 'Designer Sofubi',
    material: 'Rotomolded Japanese Grade Slush Vinyl',
    dimensions: '230 × 170 × 150 mm',
    packaging: 'Japanese Washi Screen Printed Box',
    moq: '200 Units',
    tagline: 'Double-Pour Slush Mold Craft',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'toy-p8',
    name: 'Hyper-Speed Chibi Cyber Pilot Model Kit',
    desc: 'Snap-fit precision molded color-separated model kit with waterslide decal sheet and articulated cockpit hatch.',
    badge: 'DIY Kit',
    category: 'blindbox',
    categoryNameZh: '潮流艺术盲盒',
    categoryNameEn: 'Blind Box Series',
    material: 'Multi-Color Injected Polystyrene (PS/PE)',
    dimensions: '110 × 85 × 75 mm assembled',
    packaging: 'Offset Printed Color Box with Manual',
    moq: '1,500 Sets',
    tagline: 'Zero-Glue Precision Snap-Fit Assembly',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getToysProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'toys',
      categoryNameZh: '玩具与公仔',
      categoryNameEn: 'Toys & Figures',
      material: p.material || '',
      dimensions: p.dimensions || '',
      packaging: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = TOYS_DEFAULT_PRODUCTS[idx % TOYS_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '全球限量旗舰' : 'Flagship Edition') : (isZh ? '藏家精选' : 'Collector Choice'),
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
  const isZh = (ctx.lang as string) === 'zh';
  const products = getToysProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || (isZh ? '潮玩艺术手办与可动机甲研发制造旗舰' : 'Articulated Figures & Designer Vinyl Toy Engineering Studio'),
    subtitle: userCopy?.subtitle || (isZh
      ? '专注于 1/6 合金可动机甲、高端潮玩 Sofubi、艺术盲盒与收藏级雕像的工业级精密开发。十万级无尘涂装、高刚性合金骨架与全球限量潮玩出海供应链。'
      : 'Precision engineered 1/6 diecast articulated figures, designer vinyl art toys, blind boxes, and museum statues. Powered by master sculptors, dust-free paint lines, and global collector fulfillment.'),
    cta: userCopy?.cta || (isZh ? '探索潮玩手办货盘' : 'Explore Figure Gallery'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-toys-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#060810;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.6;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <!-- Cyber Neon Glow & Particle Grid Overlays -->
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, rgba(6,8,16,0.88) 85%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:980px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:8px 22px;border-radius:9999px;background:rgba(139,92,246,0.16);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(139,92,246,0.4);box-shadow:0 0 25px rgba(139,92,246,0.3);font-size:0.84rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#c084fc;margin-bottom:24px;">
            <span style="width:8px;height:8px;border-radius:50%;background:#06b6d4;box-shadow:0 0 12px #06b6d4;"></span>
            ${isZh ? '机动潮玩动感视界 · 旗舰展演' : 'INTERACTIVE TOYS & MECHA MOTION SHOWCASE'}
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.5rem, 5.2vw, 4.4rem);font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;margin:0 0 24px;text-shadow:0 4px 30px rgba(0,0,0,0.7);">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.75;color:rgba(255,255,255,0.85);margin:0 auto 36px;max-width:780px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:18px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:1rem;box-shadow:0 10px 30px rgba(139,92,246,0.45);border:none;text-decoration:none;">
              ${esc(copy.cta)} ↗
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.1);color:#ffffff;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.25);font-weight:700;padding:15px 32px;border-radius:9999px;font-size:1rem;text-decoration:none;">
              ${isZh ? '手办开模与定制咨询' : 'Custom Sculpting & Tooling RFQ'}
            </a>
          </div>
          <!-- Real-Time Cyber Toy Metrics Glass HUD -->
          <div data-reveal="fade-up" style="margin-top:54px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;padding:26px;border-radius:24px;background:rgba(15,18,32,0.65);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(139,92,246,0.3);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#c084fc;" data-counter="48" data-suffix=" Pts">48 Pts</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '合金关节活动自由度' : 'Max Diecast Articulation'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#06b6d4;" data-counter="0.02" data-suffix="mm">±0.02mm</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '高精度模具公差' : 'Tooling CNC Tolerance'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#f59e0b;" data-counter="600000" data-suffix="+">600,000+</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '月综合手办产能' : 'Monthly Figure Capacity'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#34d399;">EN71 / ASTM</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '全球玩具安全标准' : 'Toy Safety Certified'}</div>
            </div>
          </div>
          <div style="margin-top:32px;">
            <a href="#toys-categories" class="wr-scroll-down" aria-label="Scroll down" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#ffffff;font-size:1.2rem;text-decoration:none;transition:transform 0.2s;">↓</a>
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
      ? `linear-gradient(135deg, rgba(15,18,32,0.92) 0%, rgba(9,11,20,0.96) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #0f1220 0%, #060810 100%)`;

    heroSectionHtml = `
      <section class="wr-toys-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:110px 0 120px;position:relative;overflow:hidden;border-bottom:1px solid rgba(139,92,246,0.25);color:#ffffff;">
        <!-- Cyber Neon Glow Backdrops -->
        <div style="position:absolute;top:-15%;left:25%;width:600px;height:400px;border-radius:50%;background:radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(6,182,212,0.08) 60%, transparent 100%);filter:blur(70px);pointer-events:none;"></div>
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:60px;align-items:center;">
          <!-- Left Info -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:9999px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.35);color:#c084fc;font-size:0.84rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:22px;">
              ⚡ ${isZh ? '先锋潮玩手办与机甲制造殿堂' : 'CYBER TOYS & MASTER SCULPTING HUB'}
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.4rem, 4.2vw, 3.8rem);font-weight:900;color:#ffffff;line-height:1.15;letter-spacing:-0.035em;margin:0 0 22px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.1rem;line-height:1.75;color:#94a3b8;margin:0 0 34px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 26px rgba(139,92,246,0.4);text-decoration:none;">
                ${esc(copy.cta)} ↗
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.08);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);font-weight:700;padding:15px 32px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '车间工艺与原型实验室 →' : 'Sculpting & Prototyping →'}
              </a>
            </div>
            <!-- Neon Spec Points -->
            <div style="margin-top:44px;display:flex;gap:24px;align-items:center;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;">
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#c084fc;" data-counter="15" data-suffix=" Yrs">15 Yrs</div>
                <div style="font-size:0.75rem;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '手办原型雕刻经验' : 'Sculpting Mastery'}</div>
              </div>
              <div style="width:1px;height:36px;background:rgba(255,255,255,0.15);"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#06b6d4;" data-counter="100000" data-suffix=" Class">100k Class</div>
                <div style="font-size:0.75rem;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '十万级无尘喷涂车间' : 'Cleanroom Coating'}</div>
              </div>
              <div style="width:1px;height:36px;background:rgba(255,255,255,0.15);"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#34d399;">RoHS / REACH</div>
                <div style="font-size:0.75rem;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '环保无毒出海认证' : 'Eco-Safe Certified'}</div>
              </div>
            </div>
          </div>

          <!-- Right Layered Acrylic Neon Glass Card -->
          <div data-reveal="fade-up" style="position:relative;">
            <div class="wr-card-hover" style="position:relative;background:rgba(18,22,38,0.7);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(139,92,246,0.35);border-radius:32px;padding:32px;box-shadow:0 24px 70px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.15);">
              <div style="position:absolute;top:24px;right:24px;background:linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);color:#ffffff;padding:6px 16px;border-radius:9999px;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;box-shadow:0 4px 12px rgba(139,92,246,0.4);">
                ${esc(heroProduct.badge)}
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, rgba(139,92,246,0.15) 20%, rgba(10,12,22,0.95) 100%);border-radius:24px;margin-bottom:24px;padding:24px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:280px;object-fit:contain;" fetchpriority="high">
              </div>
              <div style="font-size:0.8rem;color:#06b6d4;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">
                ${isZh ? heroProduct.categoryNameZh : heroProduct.categoryNameEn} · ${esc(heroProduct.tagline)}
              </div>
              <h2 style="font-size:1.35rem;font-weight:900;color:#ffffff;margin:0 0 10px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.9rem;color:#94a3b8;line-height:1.6;margin:0 0 20px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px;background:rgba(255,255,255,0.05);border-radius:16px;font-size:0.8rem;color:#cbd5e1;margin-bottom:20px;border:1px solid rgba(255,255,255,0.08);">
                <div><strong style="color:#ffffff;">${isZh ? '材质与工艺' : 'Materials'}:</strong><br>${esc(heroProduct.material)}</div>
                <div><strong style="color:#ffffff;">${isZh ? '起订起订量' : 'MOQ'}:</strong><br>${esc(heroProduct.moq)}</div>
              </div>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="display:block;text-align:center;background:linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:14px;border-radius:16px;text-decoration:none;box-shadow:0 6px 20px rgba(139,92,246,0.3);">
                ${isZh ? '针对该款手办洽谈采购 ↗' : 'Inquire For This Figure ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Categories Section
  const categoriesHtml = `
    <section id="toys-categories" class="wrap" style="padding:80px 0 40px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 48px;">
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:rgba(139,92,246,0.12);color:#a855f7;font-size:0.8rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
          ${isZh ? '潮玩手办制造矩阵' : 'COLLECTIBLE FIGURE MATRIX'}
        </div>
        <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 16px;">
          ${isZh ? '精密模具工程 · 潮玩与手办出海全栈供应链' : 'Precision Mold Engineering & Collector Figure Supply Chain'}
        </h2>
        <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
          ${isZh ? '从 1/6 高可动合金骨架机甲到艺术搪胶 Sofubi，十万级静电喷漆、高精度移印及盲盒模块化组装，赋能全球 IP 潮玩出海。' : 'Spanning 1/6 diecast mecha, designer Sofubi, and magnetic blind boxes. Engineered for global IP brands, anime distributors, and collector markets.'}
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:60px;">
        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🤖</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '机动装甲机甲' : 'Articulated Mecha'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '锌合金压铸骨架，40+ 处紧致阻尼活动关节，LED 发光件与磁吸配件组合。' : 'Diecast zinc alloy skeletons, 40+ damping joints, and magnetic snap weapons.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#8b5cf6;">1/6 & 1/12 Scale Specs →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🎨</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '潮玩艺术家公仔' : 'Designer Sofubi'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '传统日式双层搪胶工艺、半透渐变珠光浇注，支持独立艺术家限量客制。' : 'Japanese double-pour slush vinyl with iridescent pearlescent hand spray finish.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#8b5cf6;">Artisan Slush Mold →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🏛️</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '收藏级雕像手办' : 'Resin Statues'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '高密度冷铸宝丽石搭配手绘做旧战损纹理，内置亚克力地台与金属铭牌。' : 'High-density cold-cast polystone statues with hand-applied battle damage paint.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#8b5cf6;">Museum Quality Polystone →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🎁</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '潮流艺术盲盒' : 'Blind Box Series'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '磁吸可拆换表情、隐藏款概率配比防作弊技术，一站式吸塑彩盒全套包装。' : 'Modular magnetic swappable faceplates, anti-counterfeit packaging, and full display kits.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#8b5cf6;">Turnkey Blind Box Solutions →</span>
        </div>
      </div>
    </section>
  `;

  // Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.82rem;font-weight:800;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase;">${esc(ui.products)}</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:8px 0 0;">
            ${isZh ? '旗舰手办与潮玩精选展品' : 'Featured Figure & Toy Collection'}
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#8b5cf6;text-decoration:none;font-size:0.95rem;">
          ${isZh ? '浏览完整 8 款手办货盘 ↗' : 'View Full Figure Catalog (8 Items) ↗'}
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
        ${products.map((p, idx) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
            <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #e2e8f0 100%);display:flex;align-items:center;justify-content:center;padding:24px;overflow:hidden;">
              <span style="position:absolute;top:16px;left:16px;background:rgba(15,23,42,0.8);backdrop-filter:blur(8px);color:#ffffff;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:9999px;">
                ${esc(p.badge)}
              </span>
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:220px;max-width:100%;object-fit:contain;transition:transform 0.3s ease;" loading="lazy">
            </div>
            <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
              <div style="font-size:0.75rem;font-weight:800;color:#8b5cf6;text-transform:uppercase;margin-bottom:6px;">
                ${isZh ? p.categoryNameZh : p.categoryNameEn}
              </div>
              <h3 style="font-size:1.12rem;font-weight:900;color:#0f172a;margin:0 0 8px;line-height:1.4;">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
              </h3>
              <p style="font-size:0.86rem;color:#64748b;line-height:1.55;margin:0 0 16px;flex:1;">
                ${esc(p.desc)}
              </p>
              <div style="background:#f8fafc;border-radius:12px;padding:10px 14px;font-size:0.78rem;color:#475569;margin-bottom:16px;">
                <div><strong>${isZh ? '规格比例' : 'Scale'}:</strong> ${esc(p.dimensions)}</div>
                <div style="margin-top:4px;"><strong>${isZh ? '起订门槛' : 'MOQ'}:</strong> ${esc(p.moq)}</div>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0f172a;color:#ffffff;font-weight:800;padding:10px;border-radius:12px;font-size:0.85rem;text-decoration:none;">
                  ${isZh ? '开模/批发询价' : 'Inquire RFQ'}
                </a>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog', p.id)} style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:12px;border:1px solid #cbd5e1;color:#0f172a;text-decoration:none;font-weight:800;">
                  ↗
                </a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;

  // Quality & Safety Section
  const assuranceHtml = `
    <section style="background:linear-gradient(135deg, #090d16 0%, #131728 100%);color:#ffffff;padding:80px 0;position:relative;overflow:hidden;" data-reveal="fade-up">
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
          <span style="font-size:0.82rem;font-weight:800;color:#c084fc;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '全球权威玩具合规标准' : 'GLOBAL SAFETY & COMPLIANCE'}</span>
          <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;margin:12px 0 16px;color:#ffffff;">
            ${isZh ? '通过 EN71 / ASTM F963 / CCC / CPSIA 严苛测试' : 'Tested to International Toy Safety & Quality Benchmarks'}
          </h2>
          <p style="font-size:1.02rem;color:#94a3b8;line-height:1.65;margin:0;">
            ${isZh ? '所有手办、玩具及盲盒出厂前均历经跌落冲击测试、拉力撕裂检验、有害邻苯二甲酸盐及重金属检测。' : 'Every collectible undergoes drop tests, tension tests, phthalate scans, and heavy metal testing to guarantee full safety.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
          <div style="background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:24px;">
            <div style="font-size:1.5rem;margin-bottom:10px;">🛡️</div>
            <h4 style="font-size:1.1rem;font-weight:800;margin:0 0 6px;color:#ffffff;">EN71 Part 1, 2, 3</h4>
            <p style="font-size:0.85rem;color:#94a3b8;margin:0;">${isZh ? '欧盟玩具机械物理性能、阻燃性及重金属元素溶出严苛检验合格。' : 'European standard for toy mechanical properties, flammability, and heavy metal migration.'}</p>
          </div>
          <div style="background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:24px;">
            <div style="font-size:1.5rem;margin-bottom:10px;">🔬</div>
            <h4 style="font-size:1.1rem;font-weight:800;margin:0 0 6px;color:#ffffff;">ASTM F963 / CPSIA</h4>
            <p style="font-size:0.85rem;color:#94a3b8;margin:0;">${isZh ? '美国消费品安全委员会玩具标准，无铅环保环保无毒涂料。' : 'US consumer product safety commission toy standards with total lead and phthalate compliance.'}</p>
          </div>
          <div style="background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:24px;">
            <div style="font-size:1.5rem;margin-bottom:10px;">⚙️</div>
            <h4 style="font-size:1.1rem;font-weight:800;margin:0 0 6px;color:#ffffff;">CNC Steel Tooling</h4>
            <p style="font-size:0.85rem;color:#94a3b8;margin:0;">${isZh ? 'S136 高耐磨模具钢数控加工，寿命超 300,000 模次，细节毛边率低于 0.01%。' : 'S136 high-wear mold steel CNC machining ensuring zero flash and flawless parting lines.'}</p>
          </div>
          <div style="background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:24px;">
            <div style="font-size:1.5rem;margin-bottom:10px;">🎯</div>
            <h4 style="font-size:1.1rem;font-weight:800;margin:0 0 6px;color:#ffffff;">AQL 0.4 Inspection</h4>
            <p style="font-size:0.85rem;color:#94a3b8;margin:0;">${isZh ? '严苛收藏级出厂验货标准，十万级无尘喷漆确保面漆无杂质尘点。' : 'Collector-grade inspection standards with 100% surface paint check under daylight lamps.'}</p>
          </div>
        </div>
      </div>
    </section>
  `;

  return `${heroSectionHtml}${categoriesHtml}${productsGridHtml}${assuranceHtml}`;
}

export function renderToysCatalog(ctx: ThemeContext): string {
  const { path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getToysProducts(ctx);

  return `
    <main class="wrap" style="padding:120px 20px 80px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:760px;margin:0 auto 48px;">
        <span style="font-size:0.84rem;font-weight:800;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '全系潮玩产品目录' : 'COMPLETE FIGURE CATALOG'}</span>
        <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:12px 0 16px;">
          ${isZh ? '潮玩手办、机甲模型与艺术盲盒展厅' : 'Articulated Mecha, Designer Vinyl & Blind Boxes'}
        </h1>
        <p style="font-size:1.05rem;color:#64748b;line-height:1.7;margin:0;">
          ${isZh ? '汇聚 8 款高精度潮玩产品，提供 OEM/ODM 模具开发、3D 快速打样、专属吸塑与彩盒定制服务。' : 'Explore all 8 collectible toys and figures with complete OEM/ODM tooling, 3D prototyping, and collector packaging options.'}
        </p>
      </div>

      <!-- Categories Filter Tabs -->
      <div style="display:flex;gap:12px;justify-content:center;margin-bottom:40px;flex-wrap:wrap;">
        <button class="button" style="background:#0f172a;color:#ffffff;padding:10px 22px;border-radius:9999px;font-weight:800;font-size:0.86rem;border:none;">${isZh ? '全部产品 (8)' : 'All Figures (8)'}</button>
        <button class="button" style="background:#f1f5f9;color:#334155;padding:10px 22px;border-radius:9999px;font-weight:800;font-size:0.86rem;border:none;">${isZh ? '机动装甲机甲' : 'Articulated Mecha'}</button>
        <button class="button" style="background:#f1f5f9;color:#334155;padding:10px 22px;border-radius:9999px;font-weight:800;font-size:0.86rem;border:none;">${isZh ? '潮玩艺术家公仔' : 'Designer Sofubi'}</button>
        <button class="button" style="background:#f1f5f9;color:#334155;padding:10px 22px;border-radius:9999px;font-weight:800;font-size:0.86rem;border:none;">${isZh ? '收藏级雕像手办' : 'Resin Statues'}</button>
        <button class="button" style="background:#f1f5f9;color:#334155;padding:10px 22px;border-radius:9999px;font-weight:800;font-size:0.86rem;border:none;">${isZh ? '潮流艺术盲盒' : 'Blind Boxes'}</button>
      </div>

      <!-- Product List with Rich Spec Badges -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:32px;">
        ${products.map((p) => `
          <article class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
            <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #f8fafc 40%, #e2e8f0 100%);display:flex;align-items:center;justify-content:center;padding:28px;">
              <span style="position:absolute;top:16px;right:16px;background:rgba(139,92,246,0.12);color:#8b5cf6;font-size:0.75rem;font-weight:800;padding:4px 12px;border-radius:9999px;">
                ${esc(p.badge)}
              </span>
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:240px;max-width:100%;object-fit:contain;" loading="lazy">
            </div>
            <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
              <div style="font-size:0.78rem;font-weight:800;color:#8b5cf6;text-transform:uppercase;margin-bottom:6px;">
                ${isZh ? p.categoryNameZh : p.categoryNameEn} · ${esc(p.tagline)}
              </div>
              <h2 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 10px;line-height:1.4;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
              </h2>
              <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 18px;flex:1;">
                ${esc(p.desc)}
              </p>
              <div style="background:#f8fafc;border-radius:14px;padding:12px 16px;font-size:0.8rem;color:#334155;margin-bottom:20px;display:grid;gap:6px;">
                <div><strong>${isZh ? '材质参数' : 'Material'}:</strong> ${esc(p.material)}</div>
                <div><strong>${isZh ? '比例尺寸' : 'Dimensions'}:</strong> ${esc(p.dimensions)}</div>
                <div><strong>${isZh ? '包装规格' : 'Packaging'}:</strong> ${esc(p.packaging)}</div>
                <div><strong>${isZh ? '起订门槛' : 'MOQ'}:</strong> <span style="color:#0284c7;font-weight:800;">${esc(p.moq)}</span></div>
              </div>
              <div style="display:flex;gap:10px;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:12px;border-radius:12px;font-size:0.88rem;text-decoration:none;">
                  ${isZh ? '索取手办样品与开模报价' : 'Request RFQ & Samples'}
                </a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </main>
  `;
}

export function renderToysDetail(ctx: ThemeContext): string {
  const { path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getToysProducts(ctx);
  const prodId = ctx.options.productId || products[0].id;
  const p = products.find((item) => item.id === prodId) || products[0];

  return `
    <main class="wrap" style="padding:120px 20px 80px;" data-reveal="fade-up">
      <div style="margin-bottom:24px;">
        <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-size:0.88rem;font-weight:800;color:#8b5cf6;text-decoration:none;">
          ← ${isZh ? '返回潮玩手办目录' : 'Back to Figure Catalog'}
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:60px;align-items:start;margin-bottom:80px;">
        <!-- Left Showcase Stage -->
        <div style="background:radial-gradient(circle, #f8fafc 30%, #e2e8f0 100%);border-radius:32px;padding:48px;display:flex;align-items:center;justify-content:center;border:1px solid #cbd5e1;box-shadow:0 12px 40px rgba(0,0,0,0.06);position:relative;">
          <span style="position:absolute;top:24px;left:24px;background:#0f172a;color:#ffffff;font-size:0.78rem;font-weight:800;padding:6px 14px;border-radius:9999px;">
            ${esc(p.badge)}
          </span>
          <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:420px;object-fit:contain;" fetchpriority="high">
        </div>

        <!-- Right Product Detail Specs -->
        <div>
          <div style="font-size:0.85rem;font-weight:800;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">
            ${isZh ? p.categoryNameZh : p.categoryNameEn} · ${esc(p.tagline)}
          </div>
          <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#0f172a;line-height:1.2;margin:0 0 16px;">
            ${esc(p.name)}
          </h1>
          <p style="font-size:1.05rem;color:#475569;line-height:1.7;margin:0 0 24px;">
            ${esc(p.desc)}
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:24px;margin-bottom:32px;">
            <h3 style="font-size:1rem;font-weight:900;color:#0f172a;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.04em;">
              ${isZh ? '工贸制造与出口参数' : 'Engineering & Export Specifications'}
            </h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.88rem;color:#334155;">
              <div><strong>${isZh ? '主要材质' : 'Core Material'}:</strong><br>${esc(p.material)}</div>
              <div><strong>${isZh ? '产品比例与尺寸' : 'Scale & Dimensions'}:</strong><br>${esc(p.dimensions)}</div>
              <div><strong>${isZh ? '包装形式' : 'Packaging'}:</strong><br>${esc(p.packaging)}</div>
              <div><strong>${isZh ? '起订起订量' : 'MOQ'}:</strong><br><span style="color:#8b5cf6;font-weight:800;">${esc(p.moq)}</span></div>
              <div><strong>${isZh ? '出厂检验标准' : 'QC Standard'}:</strong><br>AQL 0.4 Full Inspection</div>
              <div><strong>${isZh ? '合规资质证书' : 'Safety Compliance'}:</strong><br>EN71 / ASTM F963 / CE</div>
            </div>
          </div>

          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="background:linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 24px rgba(139,92,246,0.3);text-decoration:none;">
              ${isZh ? '索取批发报价与 3D 样板 ↗' : 'Request Quote & 3D Sample ↗'}
            </a>
            <a href="${path('contact/index.html')}?inquiry=oem" ${navAttrs('contact')} class="button" style="background:#0f172a;color:#ffffff;font-weight:800;padding:16px 32px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
              ${isZh ? 'IP 开模深度定制洽谈' : 'Custom IP Tooling Inquiry'}
            </a>
          </div>
        </div>
      </div>
    </main>
  `;
}

export function renderToysAbout(ctx: ThemeContext): string {
  const { draft, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';

  const headline = getAboutHeadline(company, isZh ? '15年专注高端潮玩手办与机甲精密研发' : '15 Years of High-End Figure Sculpting & Tooling Engineering');
  const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2015', num: parseInt(company.establishedYear || '2015', 10), label: isZh ? '创办年份' : 'Established', desc: 'Figure engineering excellence' },
    { value: '500+ Sets', num: 500, suffix: '+ Sets', label: isZh ? '累计精密开模' : 'Precision Molds', desc: 'High-speed CNC tooling' },
    { value: '±0.02mm', num: 0.02, prefix: '±', suffix: 'mm', label: isZh ? '极致装配精度' : 'Assembly Tolerance', desc: 'Zero gap seamless fit' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '无毒环保检测' : 'Safety Compliance', desc: 'Non-Toxic Certified' },
  ]);
  const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

  return `
    <main class="wrap" style="padding:120px 20px 80px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:760px;margin:0 auto 54px;">
        <span style="font-size:0.84rem;font-weight:800;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '关于潮玩制造基地' : 'ABOUT OUR STUDIO'}</span>
        <h1 style="font-size:clamp(2.2rem, 4vw, 3.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:12px 0 16px;">
          ${esc(headline)}
        </h1>
        <p style="font-size:1.1rem;color:#64748b;line-height:1.75;margin:0;">
          ${isZh ? '集原型雕刻、3D 数模渲染、精密数控钢模加工、十万级静电喷漆与全自动包装于一体的高端潮玩制造基地。' : 'An integrated manufacturing powerhouse combining digital sculpting, CNC steel tooling, dust-free paint lines, and collector packaging.'}
        </p>
      </div>

      <!-- Highlights Metric Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-bottom:60px;" data-reveal="fade-up">
        ${highlights.map((h) => `
          <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
            <div style="font-size:2.4rem;font-weight:900;color:#8b5cf6;line-height:1;margin-bottom:10px;">
              <span>${esc(h.value)}</span>
            </div>
            <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin-bottom:4px;">${esc(h.label)}</div>
            ${h.desc ? `<div style="font-size:0.8rem;color:#64748b;">${esc(h.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Workshop Editorial Lead Image -->
      <div class="wr-card-hover" style="border:1px solid #e2e8f0;border-radius:28px;overflow:hidden;background:#ffffff;box-shadow:0 16px 40px rgba(0,0,0,0.06);margin-bottom:64px;" data-reveal="fade-up">
        <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:460px;object-fit:cover;display:block;" loading="lazy">
      </div>

      <!-- Story Section -->
      <div style="max-width:840px;margin:0 auto 80px;background:#ffffff;border:1px solid #e2e8f0;border-radius:32px;padding:48px;box-shadow:0 10px 30px rgba(0,0,0,0.04);">
        <h2 style="font-size:1.6rem;font-weight:900;color:#0f172a;margin:0 0 20px;">
          ${isZh ? '从手绘设定到全球藏家展柜的工业美学' : 'From Concept Sketches to Global Collector Vitrines'}
        </h2>
        ${paragraphs.map((para) => `
          <p style="font-size:1.02rem;color:#475569;line-height:1.8;margin:0 0 18px;">${esc(para)}</p>
        `).join('')}
      </div>
    </main>
  `;
}

export function renderToysContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';

  return `
    <main class="wrap" style="padding:120px 20px 80px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 48px;">
        <span style="font-size:0.84rem;font-weight:800;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase;">${esc(ui.contact)}</span>
        <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:12px 0 16px;">
          ${isZh ? '开启手办开模与潮玩大宗采购洽谈' : 'Start Your Figure Tooling & Wholesale RFQ'}
        </h1>
        <p style="font-size:1.05rem;color:#64748b;line-height:1.7;margin:0;">
          ${isZh ? '提交您的 3D 数模或手办定制需求，我们将在 24 小时内提供模具报价、开模周期评估及样品计划。' : 'Submit your 3D files or custom figure specs. Our engineering team responds within 24 hours with tooling quotes and sample timelines.'}
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;max-width:1040px;margin:0 auto;">
        <!-- Left Contact Info -->
        <div style="background:#090d16;color:#ffffff;border-radius:28px;padding:36px;box-shadow:0 12px 40px rgba(0,0,0,0.2);">
          <h2 style="font-size:1.4rem;font-weight:900;margin:0 0 20px;color:#ffffff;">${esc(company.name)}</h2>
          <p style="font-size:0.92rem;color:#94a3b8;line-height:1.7;margin:0 0 32px;">
            ${isZh ? '全球高端潮玩手办制造与出口基地。服务全球潮玩品牌、独立艺术工作室、动漫 IP 授权商及连锁展店。' : 'High-end collectible toy and figure manufacturing base serving global IP holders and art studios.'}
          </p>

          <div style="display:grid;gap:20px;font-size:0.92rem;">
            <div>
              <div style="font-size:0.75rem;font-weight:800;color:#8b5cf6;text-transform:uppercase;margin-bottom:4px;">Email</div>
              <a href="mailto:${esc(company.email)}" style="color:#ffffff;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
            </div>
            ${company.phone ? `
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#8b5cf6;text-transform:uppercase;margin-bottom:4px;">Phone / WhatsApp</div>
                <div style="color:#ffffff;font-weight:700;">${esc(company.phone)}</div>
              </div>
            ` : ''}
            ${company.address ? `
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#8b5cf6;text-transform:uppercase;margin-bottom:4px;">Studio & Factory Address</div>
                <div style="color:#cbd5e1;line-height:1.6;">${esc(company.address)}</div>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.12);font-size:0.82rem;color:#c084fc;">
            ✓ ${isZh ? '严格签署 NDA 商业保密协议，保护原创 IP' : 'Strict NDA Signed for All Proprietary IP Designs'}
          </div>
        </div>

        <!-- Right Inquiry Form -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:28px;padding:36px;box-shadow:0 10px 30px rgba(0,0,0,0.04);">
          <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;gap:18px;">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${isZh ? '您的姓名 / 采购代表' : 'Your Name'} *</label>
              <input name="name" autocomplete="name" required maxlength="120" placeholder="${isZh ? '例如：John Doe' : 'e.g. John Doe'}" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;font-size:0.95rem;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${isZh ? '工作邮箱' : 'Business Email'} *</label>
              <input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="name@company.com" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;font-size:0.95rem;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${isZh ? '意向品类 / 感兴趣产品' : 'Interested Product / Category'} (${esc(ui.optional)})</label>
              <select name="productId" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;font-size:0.95rem;background:#ffffff;box-sizing:border-box;">
                <option value="">— ${isZh ? '选择感兴趣的产品' : 'Select Product of Interest'} —</option>
                ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${isZh ? '需求细节描述' : 'Inquiry Message'} *</label>
              <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请简述预估数量、尺寸、材质要求及期望交付周期...' : 'Tell us your estimated quantity, scale, materials, and target deadline...'}" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;font-size:0.95rem;box-sizing:border-box;font-family:inherit;"></textarea>
            </div>
            <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="background:linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);color:#ffffff;font-weight:800;padding:14px;border-radius:12px;font-size:1rem;border:none;cursor:pointer;margin-top:6px;box-shadow:0 8px 24px rgba(139,92,246,0.35);">
              ${isZh ? '提交手办开模与采购询盘 ↗' : 'Submit Figure RFQ ↗'}
            </button>
          </form>
        </div>
      </div>
    </main>
  `;
}

export function renderToysFigureThemePage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const page = ctx.page;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;

  const brand = company.logoAssetId
    ? `<img src="${esc(ctx.asset(company.logoAssetId))}" alt="${esc(company.name)}" style="height:38px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:1.25rem;font-weight:900;letter-spacing:-0.03em;color:#0f172a;">${esc(company.name)}</span>`;

  const depth = ctx.depth;
  const languageLinks = (draft.languages || ['zh', 'en'])
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:6px;text-decoration:none;${l === ctx.lang ? 'background:#8b5cf6;color:#ffffff;' : 'color:#64748b;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-toys-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.8);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(226,232,240,0.85);box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'home' ? '#8b5cf6' : '#0f172a'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'catalog' ? '#8b5cf6' : '#0f172a'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'about' ? '#8b5cf6' : '#0f172a'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'contact' ? '#8b5cf6' : '#0f172a'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0f172a;color:#ffffff;font-weight:800;padding:10px 22px;border-radius:9999px;font-size:0.86rem;text-decoration:none;box-shadow:0 4px 14px rgba(15,23,42,0.15);">
            ${isZh ? '开模咨询 ↗' : 'Tooling RFQ ↗'}
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
    <footer style="background:#090d16;color:#94a3b8;padding:60px 0 30px;font-size:0.88rem;border-top:1px solid #1a2035;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;margin-bottom:44px;">
        <div>
          <div style="font-size:1.35rem;font-weight:900;color:#ffffff;margin-bottom:12px;">${esc(company.name)}</div>
          <p style="font-size:0.88rem;line-height:1.7;color:#94a3b8;margin:0 0 16px;">
            ${isZh ? '面向全球收藏级玩家与潮玩品牌的手办研发与生产基地。严苛合规、精密钢模、全链路出海。' : 'High-end collectible toy & figure manufacturing studio serving global brands and collectors.'}
          </p>
          <div style="font-size:0.8rem;color:#c084fc;font-weight:700;">EN71 · ASTM F963 · CCC · CPSIA · ISO9001</div>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '机动装甲机甲系列' : 'Articulated Mecha'}</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '潮玩艺术家公仔' : 'Designer Sofubi'}</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '收藏级雕像手办' : 'Resin Statues'}</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '潮流艺术盲盒系列' : 'Blind Boxes'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '潮玩工贸实力' : 'Studio Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${isZh ? '600,000 件高品质手办月产能' : '600,000 Pcs Monthly Figure Output'}</li>
            <li>✓ ${isZh ? '±0.02mm 高精度五轴数控钢模' : '±0.02mm 5-Axis CNC Mold Precision'}</li>
            <li>✓ ${isZh ? '10天极速 3D 树脂涂装样件交付' : '10-Day Fast 3D Painted Prototype'}</li>
            <li>✓ ${isZh ? '100% 出厂表面全检与防伪标签' : '100% Surface QC & Security Seals'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#c084fc;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1a2035;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>🎮 ${isZh ? '玩具与公仔潮玩出海供应链旗舰版' : 'Toys & Figures Global Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
