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
    categoryNameZh: '户外三防机能风衣',
    categoryNameEn: 'Technical Outerwear',
    fabricComposition: '100% Recycled Nylon 70D + eVent PTFE Membrane',
    weightGsm: '165 GSM (3-Layer Laminate)',
    craftDetails: 'Laser-Cut Pockets, Seam-Sealed, DWR C0 Finish',
    moq: '300 Pcs per Color',
    tagline: 'All-Weather Atmospheric Shield',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'at-2',
    name: '100% Australian Merino Wool Seamless Turtleneck',
    desc: '19.5-micron superfine Merino wool knit on WholeGarment 3D seamless machines for zero-friction next-to-skin luxury warmth.',
    badge: 'Haute Knitwear',
    category: 'knitwear',
    categoryNameZh: '全成型无缝美利奴羊毛针织',
    categoryNameEn: 'Luxury Knitwear',
    fabricComposition: '100% Superfine Australian Merino Wool (19.5μm)',
    weightGsm: '14-Gauge Fine Knit (280g/pc)',
    craftDetails: 'Shima Seiki WholeGarment 3D Knitting',
    moq: '200 Pcs per Color',
    tagline: 'Zero-Waste Seamless Luxury',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'at-3',
    name: 'SilkBlend Fluid Double-Breasted Trench Coat',
    desc: 'Heavyweight Mulberry silk and TENCEL blend with natural fluid drape, horn buttons, and storm flap back for high-fashion silhouettes.',
    badge: 'Runway Tailoring',
    category: 'tailoring',
    categoryNameZh: '重磅真丝双排扣垂坠风衣',
    categoryNameEn: 'Runway Tailoring',
    fabricComposition: '32% Grade 6A Mulberry Silk + 68% TENCEL Lyocell',
    weightGsm: '260 GSM Twill Weave',
    craftDetails: 'Hand-Finished Lapels, Custom Engraved Horn Buttons',
    moq: '150 Pcs per Style',
    tagline: 'Elegance with Fluid Movement',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'at-4',
    name: 'Heavyweight 460GSM French Terry Vintage Hoodie',
    desc: 'Custom-developed 460GSM compact spun French terry cotton with pre-shrunk enzyme wash and double-needle cover-stitched seams.',
    badge: 'Streetwear Luxury',
    category: 'streetwear',
    categoryNameZh: '460克重磅复古纯棉卫衣',
    categoryNameEn: 'Luxury Streetwear',
    fabricComposition: '100% Combed Compact Cotton (Zero Shrinkage)',
    weightGsm: '460 GSM Heavyweight Loopback Terry',
    craftDetails: 'Double-Layered Hood, Pigment Vintage Dye Wash',
    moq: '300 Pcs per Color',
    tagline: 'Structured Architectural Silhouette',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'at-5',
    name: 'EcoDry Bamboo Charcoal Antibacterial Active Tee',
    desc: 'High-stretch micro-honeycomb mesh fabric infused with natural nano bamboo charcoal for odor control and sub-second moisture wicking.',
    badge: 'Eco Performance',
    category: 'activewear',
    categoryNameZh: '竹炭抑菌吸湿速干运动T恤',
    categoryNameEn: 'High-Performance Activewear',
    fabricComposition: '65% Bamboo Charcoal Poly + 30% Polyamide + 5% Spandex',
    weightGsm: '140 GSM Moisture-Wicking Mesh',
    craftDetails: 'Flatlock Anti-Chafe Seaming, Reflective 3M Prints',
    moq: '500 Pcs per Style',
    tagline: 'Odor-Free Kinetic Dryness',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'at-6',
    name: 'Artisanal 14oz Selvedge Raw Denim Chore Jacket',
    desc: 'Old-school shuttle loom woven 14oz ring-spun denim with red selvedge ID line, triple-stitched felled seams and antique brass hardware.',
    badge: 'Heritage Denim',
    category: 'denim',
    categoryNameZh: '赤耳丹宁原牛重工夹克',
    categoryNameEn: 'Heritage Denim',
    fabricComposition: '100% Long-Staple Cotton Ring-Spun Indigo Yarn',
    weightGsm: '14.5 oz Selvedge Denim',
    craftDetails: 'Vintage Shuttle Loom Woven, Union Special Chainstitch',
    moq: '250 Pcs per Style',
    tagline: 'Artisanal Heritage Patina',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'at-7',
    name: 'GOTS Certified Pure French Linen Resort Shirt',
    desc: 'Pre-washed pure Normandy flax linen with relaxed Cuban collar, natural mother-of-pearl buttons, and airy breathable textured drape.',
    badge: 'Sustainable Resort',
    category: 'resort',
    categoryNameZh: 'GOTS有机法式亚麻度假衬衫',
    categoryNameEn: 'Resort & Linen',
    fabricComposition: '100% Certified Organic Normandy Flax Linen',
    weightGsm: '175 GSM Plain Weave',
    craftDetails: 'Garment Enzyme Softened, Genuine Trocas Shell Buttons',
    moq: '300 Pcs per Color',
    tagline: 'Breathable European Riviera Chic',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'at-8',
    name: 'Bonded ThermoCore Laser-Cut Base-Layer Set',
    desc: 'Ultralight micro-fleece thermal underwear engineered with zoned ventilation and stitch-free bonded hem tape for invisible second-skin warmth.',
    badge: 'Thermal Innovation',
    category: 'baselayer',
    categoryNameZh: '无感点胶保暖恒温打底套装',
    categoryNameEn: 'Thermal Baselayers',
    fabricComposition: '55% Micro Acrylic + 38% Modal + 7% Spandex',
    weightGsm: '210 GSM Thermal Double-Brushed',
    craftDetails: 'Ultrasonic Bonding, Seamless Edge Lamination',
    moq: '500 Sets',
    tagline: 'Zero-Bulk Second Skin Thermal Heat',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getApparelProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'apparel',
      categoryNameZh: '服装与纺织品',
      categoryNameEn: 'Apparel & Textiles',
      fabricComposition: p.material || '',
      weightGsm: '',
      craftDetails: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = APPAREL_DEFAULT_PRODUCTS[idx % APPAREL_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '巴黎秀场甄选' : 'Runway Spotlight') : (isZh ? '高定质感' : 'Atelier Quality'),
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
  const isZh = (ctx.lang as string) === 'zh';
  const products = getApparelProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || (isZh ? '高定时装剪裁 · 全球高端服装与功能性纺织品柔性供应链' : 'Modern Haute Couture & Technical Apparel Manufacturing'),
    subtitle: userCopy?.subtitle || (isZh
      ? '汇聚 Shima Seiki 全成型无缝针织、激光无缝贴合与 GOTS/GRS 环保认证面料。从秀场胶囊系列小批量快反到跨国品牌百万件大单，提供卓越剪裁与面料革新。'
      : 'Specializing in technical outerwear, seamless knitwear, and sustainable luxury textiles. Certified by GOTS, GRS, WRAP, and OEKO-TEX 100 for global designer labels and retailers.'),
    cta: userCopy?.cta || (isZh ? '探索服装与纺织品矩阵' : 'Explore Apparel Collections'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  // 1. Hero Section
  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-apparel-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#090d16;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.6;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(9,13,22,0.4) 0%, rgba(9,13,22,0.85) 100%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:960px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:9999px;background:rgba(255,255,255,0.12);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.25);box-shadow:0 8px 32px rgba(0,0,0,0.4);font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#f59e0b;margin-bottom:24px;">
            ✦ ${isZh ? '快反柔性高定 · 国际环保纺织品大宗 OEM' : 'HAUTE COUTURE & FLEXIBLE APPAREL MANUFACTURING'}
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.4rem, 4.8vw, 4.2rem);font-weight:900;line-height:1.18;letter-spacing:-0.035em;color:#ffffff;margin:0 0 24px;text-shadow:0 4px 30px rgba(0,0,0,0.5);">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.75;color:rgba(255,255,255,0.88);margin:0 auto 36px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:18px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:0.98rem;box-shadow:0 10px 30px rgba(217,119,6,0.35);border:none;text-decoration:none;">
              ${esc(copy.cta)} ✦
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.12);color:#ffffff;backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);font-weight:800;padding:15px 32px;border-radius:9999px;font-size:0.98rem;text-decoration:none;">
              ${isZh ? '索取面料色卡与打样报价' : 'Request Fabric Swatches & Tech Packs'}
            </a>
          </div>

          <!-- Editorial Production Capacity -->
          <div data-reveal="fade-up" style="margin-top:60px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;padding:24px;border-radius:26px;background:rgba(255,255,255,0.08);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.18);box-shadow:0 20px 50px rgba(0,0,0,0.4);">
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#f59e0b;" data-counter="1200000" data-suffix=" pcs">1,200,000 pcs</div>
              <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? '成衣月产能' : 'Monthly Garment Capacity'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#ffffff;" data-counter="7" data-suffix=" Days">7 Days</div>
              <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? 'CAD/3D 极速打版' : 'Fast 3D Sample Lead Time'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#f59e0b;">GOTS / GRS</div>
              <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? '全球有机与环保纺织认证' : 'Organic & Recycled Certs'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#ffffff;">WRAP Gold</div>
              <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? '社会责任国际金牌认证' : 'Social Compliance Audit'}</div>
            </div>
          </div>
          <div style="margin-top:32px;">
            <a href="#apparel-categories" class="wr-scroll-down" aria-label="Scroll down" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#ffffff;font-size:1.2rem;text-decoration:none;">↓</a>
          </div>
        </div>
        <div style="position:absolute;bottom:24px;right:24px;z-index:10;">
          <button type="button" id="video-toggle" class="video-control" aria-label="${esc(ui.pause)}" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.16);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;cursor:pointer;">Ⅱ</button>
        </div>
      </section>
    `;
  } else {
    // High Fashion Liquid Glass Editorial Banner Hero
    const customBanner = draft.banner ? ctx.asset(draft.banner.assetId) : null;
    const heroBg = customBanner
      ? `linear-gradient(135deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.97) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)`;

    heroSectionHtml = `
      <section class="wr-apparel-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid #e2e8f0;">
        <div style="position:absolute;top:-15%;right:5%;width:550px;height:550px;border-radius:50%;background:radial-gradient(circle, rgba(217,119,6,0.12) 0%, rgba(59,130,246,0.06) 70%, transparent 100%);filter:blur(70px);pointer-events:none;"></div>
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:60px;align-items:center;">
          <!-- Left Editorial Intro -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:9999px;background:rgba(217,119,6,0.1);border:1px solid rgba(217,119,6,0.25);color:#b45309;font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:20px;">
              ✦ ${isZh ? '高定时装工坊 · 柔性纺织品智造基地' : 'HIGH FASHION ATELIER & SMART TEXTILES'}
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.4rem, 4.4vw, 4rem);font-weight:900;color:#0f172a;line-height:1.18;letter-spacing:-0.035em;margin:0 0 20px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.12rem;line-height:1.75;color:#475569;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 24px rgba(15,23,42,0.25);text-decoration:none;">
                ${esc(copy.cta)} ✦
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.85);color:#0f172a;backdrop-filter:blur(16px);border:1px solid #cbd5e1;font-weight:700;padding:15px 32px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '查看智能裁床与资质 →' : 'Smart Factory Tour →'}
              </a>
            </div>
            <!-- Trust Accreditations -->
            <div style="margin-top:40px;display:flex;gap:24px;align-items:center;flex-wrap:wrap;border-top:1px solid #e2e8f0;padding-top:24px;">
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#0f172a;">OEKO-TEX</div>
                <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? 'Standard 100 环保认证' : 'Standard 100 Class I'}</div>
              </div>
              <div style="width:1px;height:36px;background:#cbd5e1;"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#059669;">GOTS & GRS</div>
                <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '全球有机与循环再生认证' : 'Certified Sustainable Fibers'}</div>
              </div>
              <div style="width:1px;height:36px;background:#cbd5e1;"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#b45309;">WRAP Gold</div>
                <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '全球社会责任金标工厂' : 'Social Compliance Verified'}</div>
              </div>
            </div>
          </div>

          <!-- Right Showcase Glass Card -->
          <div data-reveal="fade-up" style="position:relative;">
            <div class="wr-card-hover" style="position:relative;background:rgba(255,255,255,0.8);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.9);border-radius:32px;padding:32px;box-shadow:0 24px 60px -15px rgba(15,23,42,0.1), 0 0 0 1px rgba(255,255,255,0.5);">
              <div style="position:absolute;top:24px;right:24px;background:#0f172a;color:#f59e0b;padding:6px 16px;border-radius:9999px;font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">
                ${esc(heroProduct.badge)}
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, #ffffff 40%, #f1f5f9 100%);border-radius:24px;margin-bottom:24px;padding:24px;overflow:hidden;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:280px;object-fit:contain;" fetchpriority="high">
              </div>
              <div style="font-size:0.8rem;color:#b45309;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">
                ${isZh ? heroProduct.categoryNameZh : heroProduct.categoryNameEn} · ${esc(heroProduct.tagline)}
              </div>
              <h2 style="font-size:1.35rem;font-weight:900;color:#0f172a;margin:0 0 10px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.9rem;color:#475569;line-height:1.6;margin:0 0 20px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px;background:rgba(241,245,249,0.85);border-radius:18px;font-size:0.8rem;color:#1e293b;margin-bottom:20px;">
                <div><strong>${isZh ? '面料构成' : 'Composition'}:</strong><br>${esc(heroProduct.fabricComposition.slice(0, 24))}...</div>
                <div><strong>${isZh ? '起订门槛' : 'MOQ'}:</strong><br>${esc(heroProduct.moq)}</div>
              </div>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="display:block;text-align:center;background:#0f172a;color:#ffffff;font-weight:800;padding:14px;border-radius:18px;text-decoration:none;">
                ${isZh ? '获取高定时装打样报价 ↗' : 'Inquire For Atelier Prototyping ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // 2. Apparel Sectors Grid
  const categoriesHtml = `
    <section id="apparel-categories" class="wrap" style="padding:80px 0 40px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 48px;">
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#fef3c7;color:#b45309;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;">
          ${isZh ? '四大高阶纺织品智造板块' : '4 CORE TEXTILE & APPAREL DIVISIONS'}
        </div>
        <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 16px;">
          ${isZh ? '从高端机能户外到成型无缝针织' : 'From Technical Outerwear to Seamless Knitwear'}
        </h2>
        <p style="font-size:1.05rem;color:#475569;line-height:1.65;margin:0;">
          ${isZh ? '全面打通高端面料研发、数码印染、精密刺绣与智能吊挂流水线，赋能全球独立设计师与跨国服装连锁零售。' : 'Integrating fabric R&D, digital reactive printing, ultrasonic seaming, and automated assembly.'}
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:60px;">
        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(15,23,42,0.03);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🧥</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '户外机能与三防风衣' : 'Technical Outerwear'}</h3>
          <p style="font-size:0.88rem;color:#475569;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '20,000mm 暴雨级防水透湿 3L 面料、激光无缝热压压胶口袋与 C0 无氟环保防泼水整理。' : '3-layer microporous membranes, full seam sealing, and weather-proof YKK zippers.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#b45309;">Seam-Sealed Tech Outerwear →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(15,23,42,0.03);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🧶</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '3D全成型无缝针织' : 'Seamless WholeGarment'}</h3>
          <p style="font-size:0.88rem;color:#475569;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '引进日本岛精机 WholeGarment 电脑横机，全成型无缝编织，零线头摩擦，立体贴合人体曲线。' : 'Shima Seiki 3D computerized machines for zero-waste, seamless, ultra-comfort knits.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#b45309;">Shima Seiki Precision →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(15,23,42,0.03);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🌿</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '天然可持续奢华面料' : 'Organic Luxury Linen & Silk'}</h3>
          <p style="font-size:0.88rem;color:#475569;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '严选法国诺曼底有机亚麻、6A 级桑蚕丝与天丝 Lyocell，天然酵素生物水洗，亲肤透气。' : 'Normandy linen, 6A Mulberry silk, and TENCEL lyocell with natural enzyme washing.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#b45309;">GOTS Organic Certified →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(15,23,42,0.03);">
          <div style="font-size:2.2rem;margin-bottom:12px;">👕</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0f172a;margin:0 0 8px;">${isZh ? '重磅潮流街头与运动' : 'Heavyweight Streetwear'}</h3>
          <p style="font-size:0.88rem;color:#475569;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '400-500GSM 紧密赛络纺纯棉毛圈卫衣、做旧酵洗赤耳丹宁牛仔与竹炭纳米抗菌速干衣。' : '460GSM compact terry hoodies, 14oz selvedge denim, and anti-odor athletic mesh.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#b45309;">460GSM Structured Cotton →</span>
        </div>
      </div>
    </section>
  `;

  // 3. Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.82rem;font-weight:800;color:#b45309;letter-spacing:0.08em;text-transform:uppercase;">${esc(ui.products)}</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:8px 0 0;">
            ${isZh ? '精选高定时装与机能成衣' : 'Curated Apparel & Textile Collection'}
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#b45309;text-decoration:none;font-size:0.95rem;">
          ${isZh ? '查看全部 8 款成衣系列 ↗' : 'View Full Catalog (8 Styles) ↗'}
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.03);display:flex;flex-direction:column;position:relative;">
            <div style="position:absolute;top:16px;left:16px;z-index:2;background:rgba(15,23,42,0.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2);padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;color:#ffffff;">
              ${esc(p.badge)}
            </div>
            <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;background:radial-gradient(circle, #ffffff 40%, #f1f5f9 100%);padding:28px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
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
                <p style="font-size:0.86rem;color:#475569;line-height:1.55;margin:0 0 16px;">
                  ${esc(p.desc)}
                </p>
              </div>
              <div>
                <div style="font-size:0.8rem;color:#334155;margin-bottom:14px;background:#f8fafc;padding:10px 12px;border-radius:14px;display:flex;justify-content:space-between;">
                  <span><strong>${isZh ? '面料' : 'Fabric'}:</strong> ${esc(p.fabricComposition.slice(0, 16))}...</span>
                  <span><strong>MOQ:</strong> ${esc(p.moq)}</span>
                </div>
                <div style="display:flex;gap:10px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0f172a;color:#ffffff;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
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

  // 4. Smart Cutting & Flexible Supply Chain Band
  const atelierHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border-radius:32px;padding:56px 40px;color:#ffffff;box-shadow:0 24px 60px rgba(15,23,42,0.3);position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20%;right:-10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 70%);filter:blur(60px);pointer-events:none;"></div>
        <div style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:center;">
          <div>
            <span style="font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;color:#f59e0b;font-weight:800;">
              ${isZh ? '工业4.0 智能吊挂与快反智造' : 'INDUSTRY 4.0 SMART APPAREL MANUFACTURING'}
            </span>
            <h2 style="font-size:clamp(2rem, 3.8vw, 3rem);font-weight:900;color:#ffffff;letter-spacing:-0.03em;margin:12px 0 20px;line-height:1.2;">
              ${isZh ? '数控 CAM 裁床 · 7天极速成衣样板' : 'CNC CAM Cutting & 7-Day Fast Sampling'}
            </h2>
            <p style="font-size:1.05rem;line-height:1.75;color:rgba(255,255,255,0.85);margin:0 0 28px;">
              ${esc(company.capabilities || (isZh
                ? '配备全自动格柏数控裁床、ETON 智能吊挂流水线与独立面料物理检测实验室。支持从 3D 数字样衣打版到大宗集装箱全球门到门海运履约，全面满足高品质快反需求。'
                : 'Equipped with Gerber CNC cutting, ETON smart hanging lines, and in-house fabric test lab. Seamless integration from 3D digital patterns to global container delivery.'))}
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px;">
              <div style="border-left:3px solid #f59e0b;padding-left:14px;">
                <div style="font-size:1.8rem;font-weight:900;color:#ffffff;" data-counter="1200000" data-suffix=" pcs">1,200,000 pcs</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? '成衣综合月产能' : 'Monthly Garment Capacity'}</div>
              </div>
              <div style="border-left:3px solid #38bdf8;padding-left:14px;">
                <div style="font-size:1.8rem;font-weight:900;color:#ffffff;" data-counter="7" data-suffix=" Days">7 Days</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? '高定样衣出样周期' : 'Prototype Turnaround'}</div>
              </div>
            </div>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#f59e0b;color:#0f172a;font-weight:800;padding:15px 34px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
              ${isZh ? '预约实地验厂 / 索取样衣 Tech Pack' : 'Schedule Atelier Tour / Request Tech Pack'}
            </a>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">📐</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? 'CLO 3D 数字打版' : '3D Digital Design'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? 'CLO 3D 虚拟拟合试穿，极速确认版型与面料垂感。' : 'Virtual fitting eliminates sampling rounds and speeds launch.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🧵</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '无缝压胶与点胶' : 'Ultrasonic Seaming'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? '超声波贴合与热风封胶机，实现全防水与无感贴肤。' : 'Heat-seal bonding for technical waterproof outerwear.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🧪</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '自建面料检测室' : 'Fabric Test Lab'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? '色牢度、缩水率、起毛起球与撕裂强度每批实测。' : 'AATCC / ISO standard testing for shrinkage & colorfastness.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🌱</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '全流程供应链溯源' : 'Supply Traceability'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? '提供可开具 TC 交易证书的 GOTS / GRS 环保原棉。' : 'Complete TC transaction certificates for organic fibers.'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 5. CTA Band
  const ctaBandHtml = `
    <section class="wrap" style="padding:0 0 80px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%);border-radius:32px;padding:50px 36px;text-align:center;color:#ffffff;box-shadow:0 20px 50px rgba(217,119,6,0.3);position:relative;overflow:hidden;">
        <h2 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
          ${isZh ? '开启下一季时装胶囊与大宗服装开发' : 'Launch Your Next Apparel Collection With Precision'}
        </h2>
        <p style="font-size:1.1rem;line-height:1.65;max-width:640px;margin:0 auto 32px;opacity:0.95;">
          ${isZh
            ? '提供实物面料色卡寄送、工艺单 Tech Pack 审阅、小批量快反试单及全球集装箱货代一站式出海。'
            : 'Get fabric swatch cards, tech pack feedback, and FOB wholesale quotations within 24 hours.'}
        </p>
        <div style="display:inline-flex;gap:16px;flex-wrap:wrap;justify-content:center;">
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#ffffff;color:#0f172a;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:1rem;box-shadow:0 8px 24px rgba(0,0,0,0.15);text-decoration:none;">
            ${isZh ? '提交成衣询价 / 索取色卡 ↗' : 'Submit Apparel RFQ / Swatches ↗'}
          </a>
          <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.18);color:#ffffff;border:1px solid rgba(255,255,255,0.35);font-weight:800;padding:15px 32px;border-radius:9999px;font-size:1rem;text-decoration:none;">
            ${isZh ? '了解智能工坊设备与证书 →' : 'Factory Accreditations & Machinery →'}
          </a>
        </div>
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${categoriesHtml}
      ${productsGridHtml}
      ${atelierHtml}
      ${ctaBandHtml}
    </main>
  `;
}

export function renderApparelCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getApparelProducts(ctx);

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="catalog" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <header data-reveal="fade-up" style="text-align:center;max-width:760px;margin:0 auto 48px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#fef3c7;color:#b45309;font-size:0.82rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;">
            ${isZh ? '成衣与高阶纺织品全矩阵' : 'COMPLETE APPAREL & TEXTILE CATALOG'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 16px;">
            ${isZh ? '服装与纺织品出海货盘' : 'Apparel & Textile Export Catalog'}
          </h1>
          <p style="font-size:1.1rem;color:#475569;line-height:1.65;margin:0;">
            ${isZh ? '全品类支持根据品牌 Tech Pack 定制，涵盖机能外套、无缝针织、奢华亚麻与重磅街头成衣。' : 'Browse technical outerwear, WholeGarment seamless knitwear, organic French linen, and heavy French terry.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.03);display:flex;flex-direction:column;position:relative;">
              <div style="position:absolute;top:16px;left:16px;z-index:2;background:rgba(15,23,42,0.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2);padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;color:#ffffff;">
                ${esc(p.badge)}
              </div>
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;background:radial-gradient(circle, #ffffff 40%, #f1f5f9 100%);padding:28px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
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
                  <p style="font-size:0.86rem;color:#475569;line-height:1.55;margin:0 0 16px;">
                    ${esc(p.desc)}
                  </p>
                </div>
                <div>
                  <div style="font-size:0.78rem;color:#334155;margin-bottom:14px;background:#f8fafc;padding:10px 12px;border-radius:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div><strong>${isZh ? '克重' : 'Weight'}:</strong><br>${esc(p.weightGsm.slice(0, 18))}</div>
                    <div><strong>${isZh ? '工艺' : 'Craft'}:</strong><br>${esc(p.craftDetails.slice(0, 18))}...</div>
                  </div>
                  <div style="display:flex;gap:10px;">
                    <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#f1f5f9;color:#0f172a;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
                      ${esc(ui.details)} ↗
                    </a>
                    <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#0f172a;color:#ffffff;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
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

export function renderApparelDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getApparelProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0];
  const related = products.filter((item) => item.id !== p.id).slice(0, 3);

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="detail" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 60px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;font-size:0.88rem;color:#64748b;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#64748b;text-decoration:none;">${esc(ui.home)}</a> &gt; 
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#64748b;text-decoration:none;">${esc(ui.catalog)}</a> &gt; 
          <span style="color:#0f172a;font-weight:700;">${esc(p.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #e2e8f0;border-radius:32px;padding:40px;box-shadow:0 12px 36px rgba(15,23,42,0.04);" data-reveal="fade-up">
          <div>
            <div style="background:radial-gradient(circle, #ffffff 50%, #f1f5f9 100%);border:1px solid #e2e8f0;border-radius:24px;padding:36px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:360px;object-fit:contain;">
            </div>
          </div>

          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#fef3c7;color:#b45309;padding:4px 14px;border-radius:9999px;font-size:0.78rem;font-weight:800;margin-bottom:12px;">
              ${esc(p.badge)} · ${isZh ? p.categoryNameZh : p.categoryNameEn}
            </div>
            <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#0f172a;line-height:1.25;margin:0 0 16px;">
              ${esc(p.name)}
            </h1>
            <p style="font-size:1.05rem;line-height:1.7;color:#475569;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:22px;margin-bottom:28px;">
              <h2 style="font-size:0.92rem;font-weight:900;color:#0f172a;text-transform:uppercase;margin:0 0 14px;letter-spacing:0.05em;">
                ${isZh ? '面料构成与成衣工艺规格' : 'FABRIC COMPOSITION & TECH SPECIFICATIONS'}
              </h2>
              <dl style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0;font-size:0.86rem;">
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '面料成份与织法' : 'Fabric Composition'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#0f172a;">${esc(p.fabricComposition)}</dd>
                </div>
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '面料克重与针型' : 'Fabric Weight / Gauge'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#0f172a;">${esc(p.weightGsm)}</dd>
                </div>
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '核心成衣缝制工艺' : 'Construction Details'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#0f172a;">${esc(p.craftDetails)}</dd>
                </div>
                <div>
                  <dt style="color:#64748b;font-weight:600;">${isZh ? '起订门槛 (MOQ)' : 'Minimum Order'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#b45309;">${esc(p.moq)}</dd>
                </div>
              </dl>
            </div>

            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="flex:1;min-width:200px;text-align:center;background:#0f172a;color:#ffffff;font-weight:800;padding:16px 28px;border-radius:16px;font-size:0.95rem;box-shadow:0 8px 24px rgba(15,23,42,0.2);text-decoration:none;">
                ${isZh ? '索取该款成衣阶梯批发报价 ↗' : 'Request Garment Tier Pricing ↗'}
              </a>
              <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#f1f5f9;color:#0f172a;font-weight:700;padding:16px 24px;border-radius:16px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '索取面料色卡及样衣' : 'Request Swatch & Prototype'}
              </a>
            </div>
          </div>
        </div>

        <div style="margin-top:60px;" data-reveal="fade-up">
          <h2 style="font-size:1.6rem;font-weight:900;color:#0f172a;margin:0 0 24px;">
            ${esc(ui.related)}
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${related.map((item) => `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:20px;box-shadow:0 6px 20px rgba(15,23,42,0.02);">
                <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;display:block;text-align:center;">
                  <img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:100%;height:180px;object-fit:contain;margin-bottom:14px;" loading="lazy">
                  <h3 style="font-size:1rem;font-weight:800;color:#0f172a;margin:0 0 6px;">${esc(item.name)}</h3>
                  <div style="font-size:0.8rem;color:#b45309;font-weight:700;">MOQ: ${esc(item.moq)}</div>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderApparelAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const headline = getAboutHeadline(company, isZh ? `${company.name} · 高端成衣与纺织品智造工坊` : `${company.name} · Haute Couture & Smart Textile Atelier`);
  const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const { primary: primaryImage } = getAboutImages(
    ctx,
    path('assets/about-reference.jpg'),
    '',
  );

  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2012', num: parseInt(company.establishedYear || '2012', 10), label: isZh ? '创办年份' : 'Established', desc: 'Over a decade in fashion manufacturing' },
    { value: '1,200,000 pcs', num: 1200000, suffix: ' pcs', label: isZh ? '月度成衣综合产能' : 'Monthly Capacity', desc: 'Gerber CAM cutting & ETON smart lines' },
    { value: 'GOTS & GRS', label: isZh ? '国际有机与循环认证' : 'Sustainable Certs', desc: 'Certified organic and recycled textiles' },
    { value: '7 Days', num: 7, suffix: ' Days', label: isZh ? 'CLO 3D 快速出样' : 'Fast 3D Sampling', desc: 'From 2D sketches to finished prototypes' },
  ]);

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="about" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;margin-bottom:60px;" data-reveal="fade-up">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#fef3c7;color:#b45309;padding:4px 14px;border-radius:9999px;font-size:0.8rem;font-weight:800;margin-bottom:14px;">
              ${isZh ? '关于我们的智造工坊' : 'ABOUT OUR SMART TEXTILE ATELIER'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;line-height:1.2;margin:0 0 20px;">
              ${esc(headline)}
            </h1>
            <div style="color:#475569;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${storyParagraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-left:3px solid #b45309;padding-left:16px;">
              <div style="font-weight:800;color:#0f172a;font-size:0.95rem;">${isZh ? '“每一寸织物与线迹，皆是结构美学与严苛品质的完美交融。”' : '“Every stitch and fiber represents the pinnacle of structural form and rigorous quality.”'}</div>
              <div style="color:#64748b;font-size:0.82rem;margin-top:4px;">${esc(company.name)} · Master Tailors Guild</div>
            </div>
          </div>

          <div class="wr-card-hover" style="position:relative;">
            <div style="border:1px solid #e2e8f0;border-radius:28px;overflow:hidden;background:#ffffff;box-shadow:0 16px 40px rgba(15,23,42,0.06);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
            </div>
            <div style="position:absolute;bottom:24px;left:24px;background:rgba(15,23,42,0.88);backdrop-filter:blur(16px);color:#ffffff;padding:10px 20px;border-radius:16px;font-size:0.82rem;font-weight:800;">
              ✓ ${isZh ? '通过 WRAP Gold / BSCI / Sedex 国际验厂' : 'WRAP Gold & BSCI Audited Modern Facility'}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-bottom:60px;" data-reveal="fade-up">
          ${highlights.map((h) => `
            <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(15,23,42,0.03);">
              <div style="font-size:2.4rem;font-weight:900;color:#0f172a;line-height:1;margin-bottom:10px;">
                <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>${esc(h.value)}</span>
              </div>
              <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin-bottom:4px;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.8rem;color:#64748b;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:40px;align-items:center;background:#ffffff;border:1px solid #e2e8f0;border-radius:28px;padding:36px;margin-bottom:60px;" data-reveal="fade-up">
          <img src="${path('assets/about-reference.jpg')}" alt="${esc(company.name)} atelier" style="width:100%;height:300px;object-fit:cover;border-radius:20px;" loading="lazy">
          <div>
            <span style="font-size:0.8rem;font-weight:800;color:#b45309;text-transform:uppercase;">SMART SEWING HUB</span>
            <h2 style="font-size:1.6rem;font-weight:900;color:#0f172a;margin:8px 0 14px;">${isZh ? '数字化裁切与精益生产车间' : 'Digital CAM Cutting & Lean Assembly'}</h2>
            <p style="color:#475569;font-size:0.95rem;line-height:1.7;margin:0 0 20px;">
              ${isZh ? '全车间应用 MES 制造执行系统实时追踪每一道成衣工序进度，结合自动巡检相机，把控针距均匀度与拼缝平整度。' : 'MES manufacturing execution system tracking garment progress in real time with automated vision inspection.'}
            </p>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0f172a;color:#ffffff;font-weight:800;padding:12px 28px;border-radius:9999px;font-size:0.9rem;text-decoration:none;">
              ${isZh ? '预约实地审厂验厂' : 'Schedule Atelier Tour'}
            </a>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderApparelContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getApparelProducts(ctx);
  const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-apparel-inner" data-wr-page="contact" style="padding-top:100px;background:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <header data-reveal="fade-up" style="text-align:center;max-width:720px;margin:0 auto 48px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#fef3c7;color:#b45309;font-size:0.82rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;">
            ${esc(ui.contact)} · APPAREL TRADE INQUIRY
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin:0 0 16px;">
            ${isZh ? '成衣制造与面料大宗采购洽谈' : 'Direct Apparel Manufacturing & Bulk Sourcing'}
          </h1>
          <p style="font-size:1.1rem;color:#475569;line-height:1.65;margin:0;">
            ${isZh ? '支持品牌 Tech Pack 图纸审阅、面料手感色卡寄送与集装箱出海报价。我们的业务总监将在 12 小时内接洽。' : 'Submit your tech pack for sample reviews, fabric swatches, or bulk FOB pricing. Quick response within 12 hours.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;background:#ffffff;border:1px solid #e2e8f0;border-radius:32px;padding:40px;box-shadow:0 12px 40px rgba(15,23,42,0.04);" data-reveal="fade-up">
          <div>
            <h2 style="font-size:1.4rem;font-weight:900;color:#0f172a;margin:0 0 20px;">
              ${esc(company.name)}
            </h2>
            <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:#475569;margin-bottom:32px;">
              <div>
                <strong>${esc(ui.emailDirect)}:</strong><br>
                <a href="mailto:${esc(company.email)}" style="color:#b45309;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
              </div>
              ${company.phone ? `
                <div>
                  <strong>Phone:</strong><br>
                  <a href="tel:${esc(company.phone)}" style="color:#0f172a;text-decoration:none;">${esc(company.phone)}</a>
                </div>
              ` : ''}
              ${waDigits ? `
                <div>
                  <strong>WhatsApp (Instant Apparel RFQ):</strong><br>
                  <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:#25d366;color:#ffffff;padding:8px 16px;border-radius:9999px;text-decoration:none;font-weight:800;font-size:0.86rem;margin-top:4px;">
                    💬 Chat on WhatsApp (+${esc(waDigits)})
                  </a>
                </div>
              ` : ''}
              ${company.address ? `
                <div>
                  <strong>Atelier Address:</strong><br>
                  <span>${esc(company.address)}</span>
                </div>
              ` : ''}
            </div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:22px;">
              <h3 style="font-size:0.9rem;font-weight:900;color:#0f172a;text-transform:uppercase;margin:0 0 10px;">${isZh ? '打样与成衣交付承诺' : 'Garment Commitments'}</h3>
              <ul style="margin:0;padding-left:18px;font-size:0.85rem;color:#64748b;line-height:1.7;">
                <li>${isZh ? '7 个工作日交付首件成衣实体版样 (PP Sample)' : 'First PP physical sample dispatched in 7 business days'}</li>
                <li>${isZh ? '全批次面料缩水率与色牢度达 AATCC 4级' : 'AATCC Grade 4+ colorfastness and pre-shrunk standards'}</li>
                <li>${isZh ? '提供可溯源 GOTS / GRS 环保交易证书 (TC)' : 'Traceable GOTS & GRS Transaction Certificates available'}</li>
              </ul>
            </div>
          </div>

          <div>
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.name)} *</label>
                <input name="name" autocomplete="name" required maxlength="120" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:14px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.email)} *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:14px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.company)} (${esc(ui.optional)})</label>
                <input name="company" autocomplete="organization" maxlength="200" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:14px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.product)} (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:14px;font-size:0.95rem;box-sizing:border-box;background:#ffffff;">
                  <option value="">— ${isZh ? '选择意向成衣系列' : 'Select Garment Style'} —</option>
                  ${products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#0f172a;margin-bottom:6px;">${esc(ui.message)} *</label>
                <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请说明目标订单数量、期望出货港口、面料成份与打样需求...' : 'Please specify target order quantity, fabric composition, target FOB price, or tech pack links...'}" style="width:100%;padding:14px;border:1px solid #cbd5e1;border-radius:14px;font-size:0.95rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
              <button class="button" type="submit"${ctx.options.preview ? ' disabled' : ''} style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;font-weight:900;padding:16px;border-radius:16px;font-size:1rem;border:none;cursor:pointer;">
                ${esc(ui.send)} ✦
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:0;font-size:0.9rem;"></p>
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
  const isZh = (ctx.lang as string) === 'zh';
  const logo = ctx.asset(company.logoAssetId);
  const brand = logo ? `<img src="${esc(logo)}" alt="${esc(company.name)}" style="max-height:38px;object-fit:contain;">` : `<span style="font-weight:900;font-size:1.35rem;color:#0f172a;letter-spacing:-0.02em;">✦ ${esc(company.name)}</span>`;

  const depth = page === 'home' ? '' : '../';
  const languageLinks = draft.languages
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:6px;text-decoration:none;${l === ctx.lang ? 'background:#0f172a;color:#ffffff;' : 'color:#64748b;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-apparel-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.85);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(15,23,42,0.04);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'home' ? '#b45309' : '#0f172a'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'catalog' ? '#b45309' : '#0f172a'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'about' ? '#b45309' : '#0f172a'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'contact' ? '#b45309' : '#0f172a'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#0f172a;color:#ffffff;font-weight:800;padding:10px 22px;border-radius:9999px;font-size:0.86rem;text-decoration:none;box-shadow:0 4px 14px rgba(15,23,42,0.18);">
            ${isZh ? '面料索样 ↗' : 'Swatches ↗'}
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
    <footer style="background:#090d16;color:#94a3b8;padding:60px 0 30px;font-size:0.88rem;border-top:1px solid #1e293b;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;margin-bottom:44px;">
        <div>
          <div style="font-size:1.35rem;font-weight:900;color:#ffffff;margin-bottom:12px;">✦ ${esc(company.name)}</div>
          <p style="font-size:0.88rem;line-height:1.7;color:#94a3b8;margin:0 0 16px;">
            ${isZh ? '全球高端成衣与高阶功能性纺织品智造工坊。为国际设计师品牌及大宗零售商提供卓越剪裁与快反供应链。' : 'Smart atelier specializing in technical outerwear, WholeGarment seamless knitwear, and sustainable luxury textiles.'}
          </p>
          <div style="font-size:0.8rem;color:#f59e0b;font-weight:700;">GOTS · GRS · WRAP Gold · OEKO-TEX 100 · BSCI Audited</div>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '户外机能与三防风衣' : 'Technical Outerwear'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '3D全成型无缝针织' : 'Seamless WholeGarment'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '天然可持续奢华面料' : 'Organic Linen & Silk'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '重磅潮流街头与运动' : 'Heavyweight Streetwear'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '制造实力指标' : 'Manufacturing Highlights'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${isZh ? '1,200,000 件成衣月产能' : '1,200,000 Pcs Monthly Garment Capacity'}</li>
            <li>✓ ${isZh ? '格柏数控激光自动裁床' : 'Gerber Automated CNC Laser Cutting'}</li>
            <li>✓ ${isZh ? '7天交付首件实物成衣样板' : '7-Day Fast Physical Sampling'}</li>
            <li>✓ ${isZh ? 'WRAP Gold 国际社会责任认证' : 'WRAP Gold Social Compliance Certified'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#f59e0b;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#94a3b8;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1e293b;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '高端服装与功能纺织品出海供应链旗舰版' : 'Apparel & Textiles Global Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
