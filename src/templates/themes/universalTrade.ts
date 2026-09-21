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

export const UNIVERSAL_DEFAULT_PRODUCTS: ThemedProductItem[] = [
  {
    id: 'u-p1',
    name: 'Multi-Port 140W GaN Smart Power Hub',
    desc: 'Ultra-compact gallium nitride charging station with intelligent power distribution and international safety certifications.',
    badge: 'Flagship Export',
    category: 'electronics',
    categoryNameZh: '智能消费电子',
    categoryNameEn: 'Smart Electronics',
    material: 'Flame-Retardant Aerospace PC + GaN III',
    dimensions: '102 × 78 × 32 mm',
    packaging: 'Eco Kraft Color Gift Box (40 pcs/ctn)',
    moq: '500 Units (OEM / ODM)',
    tagline: 'High-Density Smart Power Station',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'u-p2',
    name: 'AeroGlide Hybrid Aluminum Luggage 20"',
    desc: 'Reinforced aviation-grade aluminum frame carry-on with 360° whisper-quiet dual spinner wheels and TSA-approved locks.',
    badge: 'B2B Best Seller',
    category: 'travel',
    categoryNameZh: '箱包与出行装备',
    categoryNameEn: 'Travel & Luggage',
    material: 'Polycarbonate Shell + 6063 Aluminum Frame',
    dimensions: '550 × 380 × 230 mm (38L)',
    packaging: 'Heavy-duty 5-ply Export Carton',
    moq: '200 Units',
    tagline: 'Rugged Lightweight Travel Engineering',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'u-p3',
    name: 'Precision Ceramic Chef Knife & Cutlery Set',
    desc: 'Zirconia ultra-sharp mirror polished blade set with ergonomic antimicrobial comfort handle for commercial culinary kitchens.',
    badge: 'Culinary Master',
    category: 'kitchen',
    categoryNameZh: '餐厨生活器具',
    categoryNameEn: 'Kitchen & Dining',
    material: 'Nano Zirconia Ceramic + Soft-Touch Grip',
    dimensions: '8" Chef + 6" Santoku + 5" Utility',
    packaging: 'Magnetic Luxury Presentation Box',
    moq: '1,000 Sets',
    tagline: 'Zero Corrosion Ultra-Sharp Precision',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'u-p4',
    name: 'ThermalLock Vacuum Insulated Sport Flask',
    desc: 'Double-wall 18/8 pro-grade stainless steel tumbler keeping liquids 24h chilled or 12h piping hot with leakproof lid.',
    badge: 'Eco Lifestyle',
    category: 'lifestyle',
    categoryNameZh: '家居日用生活',
    categoryNameEn: 'Home & Living',
    material: 'Food-Grade SUS304 Stainless Steel + Silicone',
    dimensions: '75 × 75 × 260 mm (750ml)',
    packaging: 'Individual Recycled Box (25 pcs/ctn)',
    moq: '1,000 Units',
    tagline: 'All-Day Temperature Master',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'u-p5',
    name: 'Modular Magnetic Ambient Desk Lamp',
    desc: 'Touch-dimmable minimalist architecture task lamp with 3000K-6000K CRI95+ natural spectrum and wireless phone charger.',
    badge: 'New Innovation',
    category: 'electronics',
    categoryNameZh: '智能消费电子',
    categoryNameEn: 'Smart Electronics',
    material: 'Anodized Aviation Aluminum + Optical Acrylic',
    dimensions: '380 × 120 × 420 mm',
    packaging: 'EPE Molded Cushion Carton',
    moq: '500 Sets',
    tagline: 'Minimalist Architectural Illumination',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'u-p6',
    name: 'Ergonomic Breathable Lumbar Support Chair',
    desc: 'Dynamic bionic lumbar tracking office chair with 3D adaptive armrests and high-density breathable German mesh fabric.',
    badge: 'Commercial Export',
    category: 'lifestyle',
    categoryNameZh: '家居日用生活',
    categoryNameEn: 'Home & Living',
    material: 'Reinforced Glass-Fiber Frame + Alloy Base',
    dimensions: '680 × 650 × 1180-1280 mm',
    packaging: 'Knock-Down Flat Pack Export Crate',
    moq: '100 Units',
    tagline: 'Scientific Spine Posture Support',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'u-p7',
    name: 'SonicClean Ultra-Quiet Oral Care Station',
    desc: '48,000 VPM acoustic sonic toothbrush with inductive wireless fast charging dock and IPX8 waterproof rating.',
    badge: 'Health & Care',
    category: 'electronics',
    categoryNameZh: '智能消费电子',
    categoryNameEn: 'Smart Electronics',
    material: 'DuPont Tynex Bristles + Matte ABS',
    dimensions: '28 × 28 × 245 mm',
    packaging: 'Retail Ready Window Blister Box',
    moq: '2,000 Units',
    tagline: 'Deep Sonic Plaque Removal',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'u-p8',
    name: 'Waterproof All-Terrain Tactical Duffel 60L',
    desc: 'Heavy-duty 840D TPU welded seam dry duffel backpack designed for marine, expedition and global adventure transit.',
    badge: 'Rugged Gear',
    category: 'travel',
    categoryNameZh: '箱包与出行装备',
    categoryNameEn: 'Travel & Luggage',
    material: '840D TPU Submersible Tarpaulin',
    dimensions: '620 × 340 × 340 mm (60L)',
    packaging: 'Polybagged in Master Carton (10 pcs/ctn)',
    moq: '300 Units',
    tagline: '100% Submersible Transit Protection',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getUniversalProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'general',
      categoryNameZh: '通用商品',
      categoryNameEn: 'General Merchandise',
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
      const fallback = UNIVERSAL_DEFAULT_PRODUCTS[idx % UNIVERSAL_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '旗舰爆款' : 'Flagship Bestseller') : (isZh ? '优质优选' : 'Verified Export'),
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
  const isZh = (ctx.lang as string) === 'zh';
  const products = getUniversalProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || (isZh ? '全品类全球优质商品制造与跨境供应链旗舰' : 'Premier Global General Merchandise & Supply Chain Hub'),
    subtitle: userCopy?.subtitle || (isZh
      ? '汇聚消费电子、精品箱包、高质餐厨与家居日用。以工业级质控标准、柔性客制化 OEM/ODM 产能，赋能全球品牌出海采购。'
      : 'Comprehensive B2B export platform covering smart electronics, luggage, kitchenware, and daily home essentials. Engineered with strict QC standards and high-volume fulfillment.'),
    cta: userCopy?.cta || (isZh ? '浏览全系商贸货盘' : 'Explore Trade Catalog'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  // 1. Hero Section (Banner or Video)
  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-universal-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#090d16;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.65;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(15,23,42,0.3) 0%, rgba(9,13,22,0.85) 100%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:960px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:9999px;background:rgba(255,255,255,0.12);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.25);box-shadow:0 8px 32px rgba(0,0,0,0.3);font-size:0.84rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#38bdf8;margin-bottom:24px;">
            <span style="width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 10px #38bdf8;"></span>
            ${isZh ? '全球一站式通用商品出海供应链' : 'GLOBAL UNIVERSAL TRADE ECOSYSTEM 2026'}
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.5rem, 5vw, 4.2rem);font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;margin:0 0 24px;text-shadow:0 4px 24px rgba(0,0,0,0.5);">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.75;color:rgba(255,255,255,0.85);margin:0 auto 36px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:18px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #0284c7 0%, #2563eb 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:1rem;box-shadow:0 10px 30px rgba(37,99,235,0.4);border:none;text-decoration:none;">
              ${esc(copy.cta)} ↗
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.15);color:#ffffff;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);font-weight:700;padding:15px 32px;border-radius:9999px;font-size:1rem;text-decoration:none;">
              ${isZh ? '索取批发报价与样品' : 'Request RFQ & Samples'}
            </a>
          </div>
          <!-- Real-Time Trade Metrics Glass HUD -->
          <div data-reveal="fade-up" style="margin-top:60px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;padding:24px;border-radius:24px;background:rgba(255,255,255,0.08);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.18);box-shadow:0 20px 50px rgba(0,0,0,0.35);">
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#38bdf8;" data-counter="5000000" data-suffix="+">5,000,000+</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '年出口交付件数' : 'Annual Export Units'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#ffffff;" data-counter="85" data-suffix="+">85+</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '全球出口国家与地区' : 'Global Export Regions'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#38bdf8;" data-counter="99.6" data-suffix="%">99.6%</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '准时交货达标率' : 'On-Time Fulfillment'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#ffffff;">ISO9001 / CE</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;letter-spacing:0.05em;">${isZh ? '全链国际质检资质' : 'Compliance Certified'}</div>
            </div>
          </div>
          <div style="margin-top:32px;">
            <a href="#universal-categories" class="wr-scroll-down" aria-label="Scroll down" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#ffffff;font-size:1.2rem;text-decoration:none;transition:transform 0.2s;">↓</a>
          </div>
        </div>
        <div style="position:absolute;bottom:24px;right:24px;z-index:10;">
          <button type="button" id="video-toggle" class="video-control" aria-label="${esc(ui.pause)}" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;cursor:pointer;">Ⅱ</button>
        </div>
      </section>
    `;
  } else {
    // Banner Hero with Layered Liquid Glass Cards
    const customBanner = draft.banner ? ctx.asset(draft.banner.assetId) : null;
    const heroBg = customBanner
      ? `linear-gradient(135deg, rgba(248,250,252,0.92) 0%, rgba(241,245,249,0.96) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`;

    heroSectionHtml = `
      <section class="wr-universal-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid rgba(226,232,240,0.8);">
        <!-- Soft Radiant Glow Orbs -->
        <div style="position:absolute;top:-10%;left:50%;transform:translateX(-50%);width:700px;height:400px;border-radius:50%;background:radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(37,99,235,0.05) 70%, transparent 100%);filter:blur(60px);pointer-events:none;"></div>
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:60px;align-items:center;">
          <!-- Left Content -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:9999px;background:rgba(2,132,199,0.08);border:1px solid rgba(2,132,199,0.25);color:#0284c7;font-size:0.84rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
              💎 ${isZh ? '全品类综合商贸出口旗舰展台' : 'COMPREHENSIVE GLOBAL TRADE SHOWCASE'}
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.4rem, 4.2vw, 3.8rem);font-weight:900;color:#0f172a;line-height:1.16;letter-spacing:-0.035em;margin:0 0 20px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.12rem;line-height:1.75;color:#475569;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:#0f172a;color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 24px rgba(15,23,42,0.2);text-decoration:none;">
                ${esc(copy.cta)} ↗
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.85);color:#0f172a;backdrop-filter:blur(16px);border:1px solid #cbd5e1;font-weight:700;padding:15px 32px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '验厂与出口认证 →' : 'Factory Audit & Certs →'}
              </a>
            </div>
            <!-- Quick Credibility Badges -->
            <div style="margin-top:40px;display:flex;gap:24px;align-items:center;flex-wrap:wrap;border-top:1px solid #e2e8f0;padding-top:24px;">
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#0284c7;" data-counter="500" data-suffix="+">500+</div>
                <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '优质活跃品类' : 'Active SKUs'}</div>
              </div>
              <div style="width:1px;height:36px;background:#cbd5e1;"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#0f172a;" data-counter="72" data-suffix="h">72h</div>
                <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '极速样品寄送' : 'Fast Sample Dispatch'}</div>
              </div>
              <div style="width:1px;height:36px;background:#cbd5e1;"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#10b981;">100%</div>
                <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '出厂全检合格率' : 'Full Batch QC'}</div>
              </div>
            </div>
          </div>

          <!-- Right Layered Liquid Glass Podium Card -->
          <div data-reveal="fade-up" style="position:relative;">
            <div class="wr-card-hover" style="position:relative;background:rgba(255,255,255,0.7);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.85);border-radius:32px;padding:32px;box-shadow:0 20px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5);">
              <div style="position:absolute;top:24px;right:24px;background:#0284c7;color:#ffffff;padding:6px 16px;border-radius:9999px;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">
                ${esc(heroProduct.badge)}
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, #ffffff 40%, #f1f5f9 100%);border-radius:24px;margin-bottom:24px;padding:24px;overflow:hidden;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:280px;object-fit:contain;" fetchpriority="high">
              </div>
              <div style="font-size:0.8rem;color:#0284c7;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">
                ${isZh ? heroProduct.categoryNameZh : heroProduct.categoryNameEn} · ${esc(heroProduct.tagline)}
              </div>
              <h2 style="font-size:1.35rem;font-weight:900;color:#0f172a;margin:0 0 10px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.9rem;color:#64748b;line-height:1.6;margin:0 0 20px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px;background:rgba(241,245,249,0.7);border-radius:16px;font-size:0.8rem;color:#334155;margin-bottom:20px;">
                <div><strong>${isZh ? '材质规格' : 'Material'}:</strong><br>${esc(heroProduct.material)}</div>
                <div><strong>${isZh ? '起订门槛' : 'MOQ'}:</strong><br>${esc(heroProduct.moq)}</div>
              </div>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="display:block;text-align:center;background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#ffffff;font-weight:800;padding:14px;border-radius:16px;text-decoration:none;">
                ${isZh ? '针对该品类直接询盘 ↗' : 'Inquire For This Item ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // 2. Category Matrix Tabs Section
  const categoriesHtml = `
    <section id="universal-categories" class="wrap" style="padding:80px 0 40px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 48px;">
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#e0f2fe;color:#0369a1;font-size:0.8rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
          ${isZh ? '四大核心商贸版块' : '4 CORE PRODUCT DIVISIONS'}
        </div>
        <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 16px;">
          ${isZh ? '多元化成熟品类 · 严选外贸出海供应链' : 'Scalable Product Categories for Global Distribution'}
        </h2>
        <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
          ${isZh ? '覆盖从高端智能数码到耐用出行箱包，全部支持深度 OEM/ODM 定制、专属包装与国际权威认证支持。' : 'From smart electronics to durable luggage and kitchenware, all backed by certified factory production and custom branding.'}
        </p>
      </div>

      <!-- Categories Pills Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:60px;">
        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">⚡</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '智能消费电子' : 'Smart Electronics'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? 'GaN 氮化镓快充、高保真降噪声学耳机、智能环境灯具等，通过 CE/FCC/RoHS 认证。' : 'High-density GaN chargers, ANC earbuds, smart lamps with full international compliance.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#0284c7;">50+ SKUs · Ready for Export →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🧳</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '箱包与出行装备' : 'Luggage & Travel Gear'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '航空铝框登机箱、840D 防水战术户外包、轻量商旅电脑包，耐摔静音滚轮测试达标。' : 'Aero-grade aluminum luggage, waterproof duffels, and anti-theft business backpacks.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#0284c7;">30+ Models · Custom Logo →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🍳</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '餐厨生活器具' : 'Kitchen & Dining'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '精密氧化锆陶瓷刀具、不粘蜂窝锅具、食品级硅胶烘焙模组，符合 FDA 与 LFGB 规范。' : 'Nano zirconia ceramic knives, non-stick cookware sets, and food-safe kitchen gadgets.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#0284c7;">100% Food-Safe Certified →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🌿</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '家居日用生活' : 'Home & Living'}</h3>
          <p style="font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '双层抽真空保温水杯、人体工学护腰椅、多功能收纳盒，兼顾美学设计与坚固耐用。' : 'Insulated vacuum flasks, ergonomic seating, and modular organizers for modern homes.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#0284c7;">Eco Packaging Options →</span>
        </div>
      </div>
    </section>
  `;

  // 3. Featured Products Grid (Apple Glass Cards with hover 3D tilt)
  const productsGridHtml = `
    <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.82rem;font-weight:800;color:#0284c7;letter-spacing:0.08em;text-transform:uppercase;">${esc(ui.products)}</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:8px 0 0;">
            ${isZh ? '热销通用商品精选展示' : 'Featured Export Merchandise'}
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#0284c7;text-decoration:none;font-size:0.95rem;">
          ${isZh ? '查看全部 8 款商品目录 ↗' : 'View Full Catalog (8 Items) ↗'}
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.04);display:flex;flex-direction:column;position:relative;">
            <div style="position:absolute;top:16px;left:16px;z-index:2;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border:1px solid rgba(226,232,240,0.8);padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;color:#0284c7;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              ${esc(p.badge)}
            </div>
            <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;background:radial-gradient(circle, #ffffff 40%, #f8fafc 100%);padding:28px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:220px;object-fit:contain;transition:transform 0.3s ease;" loading="lazy">
            </a>
            <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;border-top:1px solid #f1f5f9;">
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#64748b;text-transform:uppercase;margin-bottom:6px;">
                  ${isZh ? p.categoryNameZh : p.categoryNameEn} · ${esc(p.tagline)}
                </div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#0f172a;margin:0 0 8px;line-height:1.35;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                </h3>
                <p style="font-size:0.86rem;color:#64748b;line-height:1.55;margin:0 0 16px;">
                  ${esc(p.desc)}
                </p>
              </div>
              <div>
                <div style="font-size:0.8rem;color:#475569;margin-bottom:14px;background:#f8fafc;padding:10px 12px;border-radius:12px;display:flex;justify-content:space-between;">
                  <span><strong>${isZh ? '材质' : 'Mat'}:</strong> ${esc(p.material.slice(0, 20))}...</span>
                  <span><strong>MOQ:</strong> ${esc(p.moq)}</span>
                </div>
                <div style="display:flex;gap:10px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:12px;font-size:0.85rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:10px;border-radius:12px;font-size:0.85rem;text-decoration:none;">
                    ${esc(ui.inquire)} ↗
                  </a>
                </div>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;

  // 4. Manufacturing & Export Capabilities Band
  const factoryCapabilitiesHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border-radius:32px;padding:56px 40px;color:#ffffff;box-shadow:0 24px 60px rgba(15,23,42,0.25);position:relative;overflow:hidden;">
        <!-- Background Liquid Glow -->
        <div style="position:absolute;top:-20%;right:-10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle, rgba(2,132,199,0.25) 0%, transparent 70%);filter:blur(60px);pointer-events:none;"></div>
        <div style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:center;">
          <div>
            <span style="font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;color:#38bdf8;font-weight:800;">
              ${isZh ? '智能制造与全球履约实力' : 'FACTORY CAPABILITIES & SCALE'}
            </span>
            <h2 style="font-size:clamp(2rem, 3.8vw, 3rem);font-weight:900;color:#ffffff;letter-spacing:-0.03em;margin:12px 0 20px;line-height:1.2;">
              ${isZh ? '数字化柔性产线 · 严苛国际商贸质检' : 'Precision Manufacturing & High-Throughput Export'}
            </h2>
            <p style="font-size:1.05rem;line-height:1.75;color:rgba(255,255,255,0.8);margin:0 0 28px;">
              ${esc(company.capabilities || (isZh
                ? '拥有现代化注塑、五金精雕、自动化装配及洁净无尘车间。配套高低温环境测试、跌落耐磨实验室及全自动包装流水线，确保每批货物符合欧美标准。'
                : 'Equipped with automated injection molding, CNC precision tooling, and cleanroom assembly. Complete with drop, climate, and lifespan testing laboratories.'))}
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px;">
              <div style="border-left:3px solid #38bdf8;padding-left:14px;">
                <div style="font-size:1.8rem;font-weight:900;color:#ffffff;" data-counter="45000" data-suffix=" m²">45,000 m²</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">${isZh ? '智能仓储与制造基地' : 'Production Campus'}</div>
              </div>
              <div style="border-left:3px solid #10b981;padding-left:14px;">
                <div style="font-size:1.8rem;font-weight:900;color:#ffffff;" data-counter="1200000" data-suffix=" pcs">1,200,000 pcs</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">${isZh ? '综合月产能' : 'Monthly Output'}</div>
              </div>
            </div>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#38bdf8;color:#0f172a;font-weight:800;padding:15px 34px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
              ${isZh ? '预约实地验厂或线上验厂' : 'Book a Factory Visit / Video Audit'}
            </a>
          </div>

          <!-- Quality Pillars Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🛡️</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? 'AQL 0.65 质检' : 'AQL 0.65 Standard'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.5;">${isZh ? '全流程 18 道抽检与批次检验，出具正式检验报告。' : '18-step strict batch inspection with full traceability.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">📦</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '定制外贸彩盒' : 'Custom Packaging'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.5;">${isZh ? '支持吸塑、磁吸彩盒、环保瓦楞纸箱全案打样。' : 'Blister packs, gift boxes, and ISTA-3A drop test cartons.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🚢</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '全球 DDP/FOB 货运' : 'Global Logistics'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.5;">${isZh ? '深度对接中欧班列、海运整柜与各大国际海关清关。' : 'FCL/LCL ocean freight, air express, and Amazon FBA.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">📜</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '合规体系认证' : 'Verified Certs'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.5;">${isZh ? 'ISO9001 / BSCI / CE / FCC / RoHS / REACH / FDA' : 'ISO9001, BSCI, CE, FCC, RoHS, REACH, FDA compliant.'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 5. Procurement FAQ & Conversion CTA Band
  const ctaBandHtml = `
    <section class="wrap" style="padding:0 0 80px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%);border-radius:32px;padding:50px 36px;text-align:center;color:#ffffff;box-shadow:0 20px 50px rgba(2,132,199,0.3);position:relative;overflow:hidden;">
        <h2 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
          ${isZh ? '开启全球大宗采购合作 · 获取专属货盘报价单' : 'Partner with a Verified Global Exporter Today'}
        </h2>
        <p style="font-size:1.1rem;line-height:1.65;max-width:640px;margin:0 auto 32px;opacity:0.95;">
          ${isZh
            ? '无论您是跨境电商大卖家、海外线下百货连锁还是区域代理商，我们提供现货快发与深度开模支持。'
            : 'Whether you need private labeling, low MOQ trial orders, or container-load fulfillment, request our wholesale catalog.'}
        </p>
        <div style="display:inline-flex;gap:16px;flex-wrap:wrap;justify-content:center;">
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#ffffff;color:#0284c7;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:1rem;box-shadow:0 8px 24px rgba(0,0,0,0.15);text-decoration:none;">
            ${isZh ? '在线发送询盘 / 索取样品 ↗' : 'Submit Trade Inquiry / Request Samples ↗'}
          </a>
          <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.2);color:#ffffff;border:1px solid rgba(255,255,255,0.4);font-weight:800;padding:15px 32px;border-radius:9999px;font-size:1rem;text-decoration:none;">
            ${isZh ? '了解供应链实力 →' : 'Our Quality System →'}
          </a>
        </div>
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${categoriesHtml}
      ${productsGridHtml}
      ${factoryCapabilitiesHtml}
      ${ctaBandHtml}
    </main>
  `;
}

export function renderUniversalCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getUniversalProducts(ctx);

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="catalog" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <header data-reveal="fade-up" style="text-align:center;max-width:760px;margin:0 auto 48px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#e0f2fe;color:#0369a1;font-size:0.82rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
            ${isZh ? '全品类商品货盘' : 'COMPLETE MERCHANDISE EXPORT DIRECTORY'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 16px;">
            ${isZh ? '全系通用商品大宗采购目录' : 'Universal Goods Product Catalog'}
          </h1>
          <p style="font-size:1.1rem;color:#64748b;line-height:1.65;margin:0;">
            ${isZh ? '严格质检、环保选材、支持专属彩盒包装设计及全球小批量快反与集装箱海运交付。' : 'Explore all active merchandise categories with real-time MOQ, materials, and export packaging specifications.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.04);display:flex;flex-direction:column;position:relative;">
              <div style="position:absolute;top:16px;left:16px;z-index:2;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border:1px solid rgba(226,232,240,0.8);padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;color:#0284c7;">
                ${esc(p.badge)}
              </div>
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;background:radial-gradient(circle, #ffffff 40%, #f8fafc 100%);padding:28px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:220px;object-fit:contain;" loading="lazy">
              </a>
              <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;border-top:1px solid #f1f5f9;">
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#64748b;text-transform:uppercase;margin-bottom:6px;">
                    ${isZh ? p.categoryNameZh : p.categoryNameEn}
                  </div>
                  <h2 style="font-size:1.15rem;font-weight:900;color:#0f172a;margin:0 0 8px;line-height:1.35;">
                    <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#0f172a;">${esc(p.name)}</a>
                  </h2>
                  <p style="font-size:0.86rem;color:#64748b;line-height:1.55;margin:0 0 16px;">
                    ${esc(p.desc)}
                  </p>
                </div>
                <div>
                  <div style="font-size:0.78rem;color:#475569;margin-bottom:14px;background:#f8fafc;padding:10px 12px;border-radius:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div><strong>${isZh ? '规格尺寸' : 'Dim'}:</strong><br>${esc(p.dimensions)}</div>
                    <div><strong>${isZh ? '包装形式' : 'Pack'}:</strong><br>${esc(p.packaging.slice(0, 18))}</div>
                  </div>
                  <div style="display:flex;gap:10px;">
                    <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:12px;font-size:0.85rem;text-decoration:none;">
                      ${esc(ui.details)} ↗
                    </a>
                    <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:10px;border-radius:12px;font-size:0.85rem;text-decoration:none;">
                      ${esc(ui.inquire)} ↗
                    </a>
                  </div>
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
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getUniversalProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0];
  const related = products.filter((item) => item.id !== p.id).slice(0, 3);

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="detail" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 60px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;font-size:0.88rem;color:#64748b;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#64748b;text-decoration:none;">${esc(ui.home)}</a> &gt; 
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#64748b;text-decoration:none;">${esc(ui.catalog)}</a> &gt; 
          <span style="color:#0f172a;font-weight:700;">${esc(p.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #e2e8f0;border-radius:32px;padding:40px;box-shadow:0 12px 36px rgba(0,0,0,0.04);" data-reveal="fade-up">
          <!-- Left: Gallery Display -->
          <div>
            <div style="background:radial-gradient(circle, #ffffff 50%, #f8fafc 100%);border:1px solid #e2e8f0;border-radius:24px;padding:36px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:360px;object-fit:contain;">
            </div>
          </div>

          <!-- Right: Specs & RFQ -->
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#e0f2fe;color:#0369a1;padding:4px 14px;border-radius:9999px;font-size:0.78rem;font-weight:800;margin-bottom:12px;">
              ${esc(p.badge)} · ${isZh ? p.categoryNameZh : p.categoryNameEn}
            </div>
            <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#0f172a;line-height:1.25;margin:0 0 16px;">
              ${esc(p.name)}
            </h1>
            <p style="font-size:1.05rem;line-height:1.7;color:#475569;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <!-- Specifications Table -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:22px;margin-bottom:28px;">
              <h2 style="font-size:0.92rem;font-weight:900;color:#0f172a;text-transform:uppercase;margin:0 0 14px;letter-spacing:0.05em;">
                ${isZh ? '工贸出口与工程技术参数' : 'TECHNICAL SPECIFICATIONS'}
              </h2>
              <dl style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0;font-size:0.86rem;">
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '材质用料' : 'Material Composition'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#0f172a;">${esc(p.material)}</dd>
                </div>
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '单件尺寸 / 净重' : 'Dimensions / Weight'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#0f172a;">${esc(p.dimensions)}</dd>
                </div>
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '外贸装箱规格' : 'Packaging'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#0f172a;">${esc(p.packaging)}</dd>
                </div>
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '起订量 (MOQ)' : 'Minimum Order'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#0284c7;">${esc(p.moq)}</dd>
                </div>
              </dl>
            </div>

            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="flex:1;min-width:200px;text-align:center;background:#0284c7;color:#ffffff;font-weight:800;padding:16px 28px;border-radius:16px;font-size:0.95rem;box-shadow:0 8px 24px rgba(2,132,199,0.3);text-decoration:none;">
                ${isZh ? '索取该款阶梯报价单 ↗' : 'Request Tiered Quote ↗'}
              </a>
              <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#f1f5f9;color:#0f172a;font-weight:700;padding:16px 24px;border-radius:16px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '申请样品打样' : 'Sample Request'}
              </a>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div style="margin-top:60px;" data-reveal="fade-up">
          <h2 style="font-size:1.6rem;font-weight:900;color:#0f172a;margin:0 0 24px;">
            ${esc(ui.related)}
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${related.map((item) => `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:20px;box-shadow:0 6px 20px rgba(0,0,0,0.03);">
                <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;display:block;text-align:center;">
                  <img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:100%;height:180px;object-fit:contain;margin-bottom:14px;" loading="lazy">
                  <h3 style="font-size:1rem;font-weight:800;color:#0f172a;margin:0 0 6px;">${esc(item.name)}</h3>
                  <div style="font-size:0.8rem;color:#0284c7;font-weight:700;">MOQ: ${esc(item.moq)}</div>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderUniversalAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const headline = getAboutHeadline(company, isZh ? `${company.name} · 全球通用商品供应链` : `${company.name} · Global Trade & Supply Chain`);
  const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const { primary: primaryImage } = getAboutImages(
    ctx,
    path('assets/about-reference.jpg'),
    '',
  );

  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2012', num: parseInt(company.establishedYear || '2012', 10), label: isZh ? '创办年份' : 'Established', desc: 'Over a decade of international trade' },
    { value: '45,000 m²', num: 45000, suffix: ' m²', label: isZh ? '生产制造基地' : 'Factory Campus', desc: 'Modern injection & assembly lines' },
    { value: '85+', num: 85, suffix: '+', label: isZh ? '出口覆盖国' : 'Export Destinations', desc: 'Europe, Americas, Asia-Pacific' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '质量合规率' : 'Compliance Rate', desc: 'ISO9001 / BSCI certified' },
  ]);

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="about" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <!-- Header Split -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;margin-bottom:60px;" data-reveal="fade-up">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#e0f2fe;color:#0369a1;padding:4px 14px;border-radius:9999px;font-size:0.8rem;font-weight:800;margin-bottom:14px;">
              ${isZh ? '企业沿革与制造底蕴' : 'ABOUT OUR MANUFACTURING ENTERPRISE'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;line-height:1.2;margin:0 0 20px;">
              ${esc(headline)}
            </h1>
            <div style="color:#475569;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${storyParagraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-left:3px solid #0284c7;padding-left:16px;">
              <div style="font-weight:800;color:#0f172a;font-size:0.95rem;">${isZh ? '“高标准品质，是出海长青的唯一基石。”' : '“Uncompromising quality is the only foundation for enduring global trade.”'}</div>
              <div style="color:#64748b;font-size:0.82rem;margin-top:4px;">${esc(company.name)} · Quality Committee</div>
            </div>
          </div>

          <div class="wr-card-hover" style="position:relative;">
            <div style="border:1px solid #e2e8f0;border-radius:28px;overflow:hidden;background:#ffffff;box-shadow:0 16px 40px rgba(0,0,0,0.06);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
            </div>
            <div style="position:absolute;bottom:24px;left:24px;background:rgba(15,23,42,0.85);backdrop-filter:blur(16px);color:#ffffff;padding:10px 20px;border-radius:16px;font-size:0.82rem;font-weight:800;">
              ✓ ${isZh ? '已完成第三方实地验厂认证' : 'Verified Manufacturing Facility'}
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-bottom:60px;" data-reveal="fade-up">
          ${highlights.map((h) => `
            <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.03);">
              <div style="font-size:2.5rem;font-weight:900;color:#0284c7;line-height:1;margin-bottom:10px;">
                <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>${esc(h.value)}</span>
              </div>
              <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin-bottom:4px;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.8rem;color:#64748b;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:40px;align-items:center;background:#ffffff;border:1px solid #e2e8f0;border-radius:28px;padding:36px;margin-bottom:60px;" data-reveal="fade-up">
          <img src="${path('assets/about-reference.jpg')}" alt="${esc(company.name)} workshop" style="width:100%;height:300px;object-fit:cover;border-radius:20px;" loading="lazy">
          <div>
            <span style="font-size:0.8rem;font-weight:800;color:#0284c7;text-transform:uppercase;">LABORATORY & TESTING</span>
            <h2 style="font-size:1.6rem;font-weight:900;color:#0f172a;margin:8px 0 14px;">${isZh ? '高标准品质管控实验室' : 'Comprehensive Quality & Reliability Testing'}</h2>
            <p style="color:#64748b;font-size:0.95rem;line-height:1.7;margin:0 0 20px;">
              ${isZh ? '配备恒温恒湿试验箱、盐雾腐蚀测试仪、万能拉力机、跌落撞击台。每批产品出库前均严格遵循国际标准进行全项抽验，杜绝批次不良。' : 'Equipped with temperature/humidity test chambers, salt spray corrosion testers, and drop impact rigs for strict quality assurance.'}
            </p>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0284c7;color:#ffffff;font-weight:800;padding:12px 28px;border-radius:9999px;font-size:0.9rem;text-decoration:none;">
              ${isZh ? '索取第三方质检报告' : 'Request Test Reports'}
            </a>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderUniversalContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getUniversalProducts(ctx);
  const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-universal-inner" data-wr-page="contact" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <header data-reveal="fade-up" style="text-align:center;max-width:720px;margin:0 auto 48px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#e0f2fe;color:#0369a1;font-size:0.82rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
            ${esc(ui.contact)} · B2B TRADE INQUIRY
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 16px;">
            ${isZh ? '直接与出口外贸专员洽谈' : 'Direct Inquiry & Trade Support'}
          </h1>
          <p style="font-size:1.1rem;color:#64748b;line-height:1.65;margin:0;">
            ${isZh ? '请填写您的采购意向与目标数量，我们的专属贸易经理将在 12 小时内向您发送正式样品方案与批发价目表。' : 'Send your RFQ, customized packaging requirements, or sample requests. Our trade specialists respond within 12 hours.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;background:#ffffff;border:1px solid #e2e8f0;border-radius:32px;padding:40px;box-shadow:0 12px 40px rgba(0,0,0,0.04);" data-reveal="fade-up">
          <!-- Left: Contact info -->
          <div>
            <h2 style="font-size:1.4rem;font-weight:900;color:#0f172a;margin:0 0 20px;">
              ${esc(company.name)}
            </h2>
            <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:#475569;margin-bottom:32px;">
              <div>
                <strong>${esc(ui.emailDirect)}:</strong><br>
                <a href="mailto:${esc(company.email)}" style="color:#0284c7;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
              </div>
              ${company.phone ? `
                <div>
                  <strong>Phone:</strong><br>
                  <a href="tel:${esc(company.phone)}" style="color:#0f172a;text-decoration:none;">${esc(company.phone)}</a>
                </div>
              ` : ''}
              ${waDigits ? `
                <div>
                  <strong>WhatsApp (Instant Trade Chat):</strong><br>
                  <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:#25d366;color:#ffffff;padding:8px 16px;border-radius:9999px;text-decoration:none;font-weight:800;font-size:0.86rem;margin-top:4px;">
                    💬 Chat on WhatsApp (+${esc(waDigits)})
                  </a>
                </div>
              ` : ''}
              ${company.address ? `
                <div>
                  <strong>Address:</strong><br>
                  <span>${esc(company.address)}</span>
                </div>
              ` : ''}
            </div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:22px;">
              <h3 style="font-size:0.9rem;font-weight:900;color:#0f172a;text-transform:uppercase;margin:0 0 10px;">${isZh ? '大宗采购承诺' : 'Trade Commitment'}</h3>
              <ul style="margin:0;padding-left:18px;font-size:0.85rem;color:#64748b;line-height:1.7;">
                <li>${isZh ? '12 小时内极速回复正式形式发票 (PI)' : 'Official quotation within 12 business hours'}</li>
                <li>${isZh ? '支持打样寄送与模具开模费用返还' : 'Sample cost rebate upon bulk order'}</li>
                <li>${isZh ? '100% 遵守 NDA 商业与图纸保密协议' : 'Strict NDA confidentiality protection'}</li>
              </ul>
            </div>
          </div>

          <!-- Right: Inquiry Form -->
          <div>
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.name)} *</label>
                <input name="name" autocomplete="name" required maxlength="120" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:12px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.email)} *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:12px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.company)} (${esc(ui.optional)})</label>
                <input name="company" autocomplete="organization" maxlength="200" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:12px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.product)} (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:12px;font-size:0.95rem;box-sizing:border-box;background:#ffffff;">
                  <option value="">— ${isZh ? '选择感兴趣的产品' : 'Select Product of Interest'} —</option>
                  ${products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.message)} *</label>
                <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请描述您的采购数量、目标交期与定制要求...' : 'Please specify target quantity, delivery destination, and branding requirements...'}" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:12px;font-size:0.95rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
              <button class="button" type="submit"${ctx.options.preview ? ' disabled' : ''} style="background:linear-gradient(135deg, #0284c7 0%, #2563eb 100%);color:#ffffff;font-weight:900;padding:16px;border-radius:14px;font-size:1rem;border:none;cursor:pointer;">
                ${esc(ui.send)} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:0;font-size:0.9rem;"></p>
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
  const isZh = (ctx.lang as string) === 'zh';
  const logo = ctx.asset(company.logoAssetId);
  const brand = logo ? `<img src="${esc(logo)}" alt="${esc(company.name)}" style="max-height:38px;object-fit:contain;">` : `<span style="font-weight:900;font-size:1.35rem;color:#0f172a;letter-spacing:-0.02em;">${esc(company.name)}</span>`;

  // Language links
  const depth = page === 'home' ? '' : '../';
  const languageLinks = draft.languages
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:6px;text-decoration:none;${l === ctx.lang ? 'background:#0284c7;color:#ffffff;' : 'color:#64748b;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  // Apple Liquid Glassmorphic Floating Header
  const headerHtml = `
    <header class="wr-universal-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.78);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(226,232,240,0.8);box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'home' ? '#0284c7' : '#0f172a'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'catalog' ? '#0284c7' : '#0f172a'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'about' ? '#0284c7' : '#0f172a'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'contact' ? '#0284c7' : '#0f172a'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0f172a;color:#ffffff;font-weight:800;padding:10px 22px;border-radius:9999px;font-size:0.86rem;text-decoration:none;box-shadow:0 4px 14px rgba(15,23,42,0.15);">
            ${isZh ? '询盘洽谈 ↗' : 'Inquire ↗'}
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
    <footer style="background:#0f172a;color:#94a3b8;padding:60px 0 30px;font-size:0.88rem;border-top:1px solid #1e293b;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;margin-bottom:44px;">
        <div>
          <div style="font-size:1.35rem;font-weight:900;color:#ffffff;margin-bottom:12px;">${esc(company.name)}</div>
          <p style="font-size:0.88rem;line-height:1.7;color:#94a3b8;margin:0 0 16px;">
            ${isZh ? '面向全球的通用商品出海供应链。严选智能电子、高耐用箱包、优质餐厨与家居日用，赋能全球买家大宗采购。' : 'Premier B2B export supply chain for universal consumer goods. Serving global brands, retailers, and distributors.'}
          </p>
          <div style="font-size:0.8rem;color:#38bdf8;font-weight:700;">ISO9001 · CE · FCC · RoHS · BSCI</div>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '智能消费电子系列' : 'Smart Electronics'}</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '箱包与出行装备系列' : 'Luggage & Travel Gear'}</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '餐厨生活器具系列' : 'Kitchen & Dining'}</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '家居日用生活系列' : 'Home & Living'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '供应链资质与优势' : 'Factory Advantages'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${isZh ? '45,000㎡ 现代制造与仓储基地' : '45,000m² Production Campus'}</li>
            <li>✓ ${isZh ? '1,200,000 件综合大宗月产能' : '1.2M Monthly Unit Capacity'}</li>
            <li>✓ ${isZh ? 'AQL 0.65 出口严苛质检把控' : 'Strict AQL 0.65 QC Inspection'}</li>
            <li>✓ ${isZh ? '出口欧美日韩等 85+ 国家' : 'Exported to 85+ Global Regions'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#38bdf8;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1e293b;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>🌐 ${isZh ? '通用商品全球出海供应链旗舰版' : 'Universal Merchandise Global Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
