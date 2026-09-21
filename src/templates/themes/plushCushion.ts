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

export const PLUSH_DEFAULT_PRODUCTS: ThemedProductItem[] = [
  {
    id: 'pc-1',
    name: 'CloudBreeze Ergonomic Memory Foam Lumbar Cushion',
    desc: 'High-density 60D slow-rebound bionic memory foam contoured for lumbar spine decompression with cooling air-mesh cover.',
    badge: 'Ergo Bestseller',
    category: 'cushions',
    categoryNameZh: '人体工学减压靠垫',
    categoryNameEn: 'Ergonomic Cushions',
    material: 'BASF Slow-Rebound Memory Foam + 3D Cool Mesh',
    dimensions: '440 × 390 × 120 mm (680g)',
    packaging: 'Vacuum Compressed in Polybag (20 pcs/ctn)',
    moq: '300 Units',
    tagline: 'Scientific Spine Cloud Support',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'pc-2',
    name: 'SnugglePaws Giant Kawaii Boba Plush 65cm',
    desc: 'Ultra-soft four-way stretch velvet fabric stuffed with feather-touch micro down cotton, odor-free and machine washable.',
    badge: 'IP Viral Trend',
    category: 'plush',
    categoryNameZh: '萌系治愈毛绒玩偶',
    categoryNameEn: 'Kawaii Plush Toys',
    material: 'Super Soft Spandex Crystal Velvet + 7D PP Cotton',
    dimensions: '650 × 400 × 400 mm (1.4kg)',
    packaging: 'Compressed PE Bag (10 pcs/ctn)',
    moq: '500 Units',
    tagline: 'Ultra Huggable Cloud Softness',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'pc-3',
    name: 'PureNest Organic Cotton Infant Soothing Pillow',
    desc: 'OEKO-TEX 100 Class I certified infant calming bionic pillow with hypoallergenic natural breathable latex particle core.',
    badge: 'Baby Safe Tier-1',
    category: 'baby',
    categoryNameZh: '婴童安抚与定型枕',
    categoryNameEn: 'Infant Soothing Bedding',
    material: '100% GOTS Organic Cotton + Natural Latex Crumb',
    dimensions: '360 × 240 × 35 mm (280g)',
    packaging: 'Eco Kraft Window Gift Box (30 pcs/ctn)',
    moq: '1,000 Units',
    tagline: 'Gentle Pure Natural Protection',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'pc-4',
    name: 'AeroRest Hooded Microbead Travel Neck Pillow',
    desc: 'Ergonomic 360° chin support travel pillow with built-in blackout privacy sleep hood and magnetic quick-release snap.',
    badge: 'Travel Must-Have',
    category: 'travel',
    categoryNameZh: '商旅便携护颈枕',
    categoryNameEn: 'Travel Neck Cushions',
    material: 'Micro-Food Grade EPS Beads + Rayon Modal Fabric',
    dimensions: '280 × 280 × 110 mm (220g)',
    packaging: 'Drawstring Waterproof Carry Bag',
    moq: '1,000 Units',
    tagline: '360° Cervical Flight Comfort',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'pc-5',
    name: 'VelvetFlute Scandinavian Pumpkin Floor Pouf',
    desc: 'Artisanal hand-pleated Dutch velvet floor tatami cushion with high-resilience polyester fiber core for living & meditation spaces.',
    badge: 'Home Aesthetics',
    category: 'cushions',
    categoryNameZh: '美学加厚地垫座垫',
    categoryNameEn: 'Aesthetic Floor Poufs',
    material: 'Premium Dutch Velvet + 100% Virgin Resilient Fiber',
    dimensions: '380 × 380 × 120 mm (550g)',
    packaging: 'Vacuum Packed in Display Box (12 pcs/ctn)',
    moq: '500 Units',
    tagline: 'Warm Luxe Living Texture',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'pc-6',
    name: 'EcoFluff GRS Recycled Mascot Plush 30cm',
    desc: '100% GRS certified recycled polyester plush custom mascot made from reclaimed ocean plastics with high-precision embroidery.',
    badge: 'Eco Sustainable',
    category: 'plush',
    categoryNameZh: '企业IP环保定制公仔',
    categoryNameEn: 'Custom Corporate Mascots',
    material: 'GRS Certified Recycled Poly Yarn + Recycled Fiber',
    dimensions: '300 × 220 × 180 mm (320g)',
    packaging: 'Biodegradable PLA Polybag',
    moq: '500 Units (Full OEM)',
    tagline: 'Circular Eco-Friendly IP Creation',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'pc-7',
    name: 'CoolGel Orthopedic Bed Wedge Backrest',
    desc: 'Multipurpose angled wedge pillow with cooling honeycomb gel overlay for acid reflux relief, reading support, and leg elevation.',
    badge: 'Medical Grade Ergonomic',
    category: 'cushions',
    categoryNameZh: '多功能护脊斜坡靠垫',
    categoryNameEn: 'Therapeutic Bed Wedges',
    material: 'Therapeutic Foam Core + Cool Touch Ice Silk Cover',
    dimensions: '600 × 550 × 300 mm (1.8kg)',
    packaging: 'Heavy Vacuum Box Pack (6 pcs/ctn)',
    moq: '200 Units',
    tagline: 'Multifunctional Body Relaxation',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'pc-8',
    name: 'WeightedCalm Sensory Anxiety Plush Animal 2.5kg',
    desc: 'Scientifically weighted plush sloth with hypoallergenic glass micro-bead filling to provide deep touch pressure soothing therapy.',
    badge: 'Sensory Therapy',
    category: 'plush',
    categoryNameZh: '感官重力安抚毛绒抱枕',
    categoryNameEn: 'Weighted Sensory Plush',
    material: 'Ultra Minky Fur + Non-Toxic Safe Glass Beads',
    dimensions: '480 × 260 × 200 mm (2.5kg)',
    packaging: 'Premium Ribbon Tied Gift Box (8 pcs/ctn)',
    moq: '500 Units',
    tagline: 'Deep Touch Soothing Hug',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getPlushProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Product ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'plush',
      categoryNameZh: '毛绒与靠垫',
      categoryNameEn: 'Plush & Cushions',
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
      const fallback = PLUSH_DEFAULT_PRODUCTS[idx % PLUSH_DEFAULT_PRODUCTS.length];
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '全球热销爆款' : 'Viral Bestseller') : (isZh ? '触感优选' : 'Cloud Touch Choice'),
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
  return PLUSH_DEFAULT_PRODUCTS;
}

export function renderPlushHome(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getPlushProducts(ctx);
  const heroProduct = products[0];

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || (isZh ? '云端般治愈触感 · 全球精品毛绒玩偶与人体工学靠垫供应链' : 'Cloud-Soft Tactile Wonder · Premium Plush Toys & Ergonomic Cushions'),
    subtitle: userCopy?.subtitle || (isZh
      ? '深耕婴童级安全毛绒、解压记忆棉靠垫与企业级 IP 形象柔性定制。通过 OEKO-TEX 100 / EN71 / GOTS 严苛国际认证，为全球买家提供温暖触感体验。'
      : 'Specializing in baby-safe plush toys, sensory weighted animals, and ergonomic memory foam cushions. Certified by OEKO-TEX 100, EN71, and GOTS for international brands.'),
    cta: userCopy?.cta || (isZh ? '浏览毛绒与靠垫全谱系' : 'Explore Soft Living Catalog'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  // 1. Hero Section
  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-plush-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#181116;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.65;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(63,33,48,0.35) 0%, rgba(24,17,22,0.88) 100%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:960px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:8px 22px;border-radius:9999px;background:rgba(255,255,255,0.14);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(236,72,153,0.25);font-size:0.84rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#f472b6;margin-bottom:24px;">
            ☁️ ${isZh ? '云柔级安全触感 · 原厂大宗 OEM/ODM' : 'CLOUD SOFT COMFORT & GLOBAL PLUSH ODM'}
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.4rem, 4.8vw, 4rem);font-weight:900;line-height:1.2;letter-spacing:-0.03em;color:#ffffff;margin:0 0 24px;text-shadow:0 4px 24px rgba(0,0,0,0.4);">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.75;color:rgba(255,255,255,0.9);margin:0 auto 36px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:18px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:1rem;box-shadow:0 10px 30px rgba(236,72,153,0.4);border:none;text-decoration:none;">
              ${esc(copy.cta)} ☁️
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.15);color:#ffffff;backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.35);font-weight:800;padding:15px 32px;border-radius:9999px;font-size:1rem;text-decoration:none;">
              ${isZh ? '索取毛绒手感样品与报价' : 'Request Swatches & Plush Samples'}
            </a>
          </div>
          <!-- Comfort Metrics Bar -->
          <div data-reveal="fade-up" style="margin-top:60px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;padding:24px;border-radius:28px;background:rgba(255,255,255,0.1);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.22);box-shadow:0 20px 50px rgba(0,0,0,0.3);">
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#f472b6;" data-counter="800000" data-suffix=" pcs">800,000 pcs</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '毛绒与靠垫月产能' : 'Monthly Output'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#ffffff;">OEKO-TEX 100</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '婴儿级母婴安全认证' : 'Baby-Safe Class I'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#f472b6;" data-counter="99.8" data-suffix="%">99.8%</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '高回弹抗塌陷耐久率' : 'Anti-Sagging Durability'}</div>
            </div>
            <div>
              <div style="font-size:2.2rem;font-weight:900;color:#ffffff;" data-counter="100" data-suffix="%">100%</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '金属杂质检针机全检' : 'Full Needle-Detector QC'}</div>
            </div>
          </div>
          <div style="margin-top:32px;">
            <a href="#plush-categories" class="wr-scroll-down" aria-label="Scroll down" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.3);color:#ffffff;font-size:1.2rem;text-decoration:none;">↓</a>
          </div>
        </div>
        <div style="position:absolute;bottom:24px;right:24px;z-index:10;">
          <button type="button" id="video-toggle" class="video-control" aria-label="${esc(ui.pause)}" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.18);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;cursor:pointer;">Ⅱ</button>
        </div>
      </section>
    `;
  } else {
    // Warm Pastel Frosted Banner Hero
    const customBanner = draft.banner ? ctx.asset(draft.banner.assetId) : null;
    const heroBg = customBanner
      ? `linear-gradient(135deg, rgba(255,247,249,0.94) 0%, rgba(253,242,248,0.96) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #fff7ed 0%, #fdf2f8 50%, #fef2f2 100%)`;

    heroSectionHtml = `
      <section class="wr-plush-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid #fce7f3;">
        <div style="position:absolute;top:-10%;right:10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle, rgba(244,114,182,0.18) 0%, rgba(251,146,60,0.08) 70%, transparent 100%);filter:blur(60px);pointer-events:none;"></div>
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:60px;align-items:center;">
          <!-- Left Content -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:9999px;background:rgba(236,72,153,0.1);border:1px solid rgba(236,72,153,0.25);color:#db2777;font-size:0.84rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
              🧸 ${isZh ? '母婴安全级毛绒与健康减压靠垫' : 'BABY-SAFE PLUSH & ERGONOMIC COMFORT'}
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.4rem, 4.2vw, 3.8rem);font-weight:900;color:#371b26;line-height:1.2;letter-spacing:-0.035em;margin:0 0 20px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.12rem;line-height:1.75;color:#6b4f59;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 24px rgba(236,72,153,0.3);text-decoration:none;">
                ${esc(copy.cta)} ☁️
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.85);color:#371b26;backdrop-filter:blur(16px);border:1px solid #fbcfe8;font-weight:700;padding:15px 32px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '验厂与检针安规 →' : 'Safety Certs & Factory →'}
              </a>
            </div>
            <!-- Trust Pillars -->
            <div style="margin-top:40px;display:flex;gap:24px;align-items:center;flex-wrap:wrap;border-top:1px solid #fce7f3;padding-top:24px;">
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#db2777;">OEKO-TEX</div>
                <div style="font-size:0.75rem;color:#831843;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? 'Standard 100 婴儿一类' : 'Class I Baby Safe'}</div>
              </div>
              <div style="width:1px;height:36px;background:#fbcfe8;"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#371b26;" data-counter="100" data-suffix="%">100%</div>
                <div style="font-size:0.75rem;color:#831843;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '双通道检针机检测' : 'Dual Needle Checked'}</div>
              </div>
              <div style="width:1px;height:36px;background:#fbcfe8;"></div>
              <div>
                <div style="font-size:1.6rem;font-weight:900;color:#059669;">GRS</div>
                <div style="font-size:0.75rem;color:#831843;text-transform:uppercase;font-weight:700;margin-top:2px;">${isZh ? '再生环保聚酯棉可选' : 'Recycled Cotton Ready'}</div>
              </div>
            </div>
          </div>

          <!-- Right Floating Fluffy Glass Card -->
          <div data-reveal="fade-up" style="position:relative;">
            <div class="wr-card-hover" style="position:relative;background:rgba(255,255,255,0.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.9);border-radius:36px;padding:32px;box-shadow:0 24px 60px -15px rgba(236,72,153,0.12), 0 0 0 1px rgba(255,255,255,0.6);">
              <div style="position:absolute;top:24px;right:24px;background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;padding:6px 16px;border-radius:9999px;font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">
                ${esc(heroProduct.badge)}
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, #fff1f2 30%, #fdf2f8 100%);border-radius:28px;margin-bottom:24px;padding:24px;overflow:hidden;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:280px;object-fit:contain;" fetchpriority="high">
              </div>
              <div style="font-size:0.8rem;color:#db2777;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">
                ${isZh ? heroProduct.categoryNameZh : heroProduct.categoryNameEn} · ${esc(heroProduct.tagline)}
              </div>
              <h2 style="font-size:1.35rem;font-weight:900;color:#371b26;margin:0 0 10px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.9rem;color:#6b4f59;line-height:1.6;margin:0 0 20px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px;background:rgba(253,242,248,0.8);border-radius:18px;font-size:0.8rem;color:#4a2b37;margin-bottom:20px;">
                <div><strong>${isZh ? '面料填充' : 'Filling / Cover'}:</strong><br>${esc(heroProduct.material.slice(0, 26))}...</div>
                <div><strong>${isZh ? '起订门槛' : 'MOQ'}:</strong><br>${esc(heroProduct.moq)}</div>
              </div>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="display:block;text-align:center;background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:14px;border-radius:18px;text-decoration:none;">
                ${isZh ? '索取该款毛绒触感手板 ↗' : 'Inquire For This Comfort Item ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // 2. Category Matrix Section
  const categoriesHtml = `
    <section id="plush-categories" class="wrap" style="padding:80px 0 40px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 48px;">
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#fce7f3;color:#db2777;font-size:0.8rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
          ${isZh ? '温润治愈四大矩阵' : '4 COMFORT LIFE CATEGORIES'}
        </div>
        <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:0 0 16px;">
          ${isZh ? '从亲肤毛绒玩偶到健康护脊靠垫' : 'Tailored Soft Goods for Home & Wellness'}
        </h2>
        <p style="font-size:1.05rem;color:#6b4f59;line-height:1.65;margin:0;">
          ${isZh ? '精选超柔短水晶绒、天然透气乳胶与高弹慢回弹海绵，支持图纸快速 3D 打版与大宗集装箱真空压缩装载。' : 'From cuddly IP characters to therapeutic posture pillows, built with certified non-toxic fibers and vacuum packaging.'}
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:60px;">
        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #fce7f3;border-radius:26px;padding:28px;box-shadow:0 8px 24px rgba(236,72,153,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🧸</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#371b26;margin:0 0 8px;">${isZh ? '萌系治愈毛绒玩偶' : 'Kawaii Plush Toys'}</h3>
          <p style="font-size:0.88rem;color:#6b4f59;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '支持高精度电绣、热转印及定制表情。填充物为无异味羽绒棉，按压速回弹。' : 'Spandex crystal velvet, zero-odor down cotton, high-density embroidery for viral IPs.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#db2777;">Full OEM/ODM · Fast Prototyping →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #fce7f3;border-radius:26px;padding:28px;box-shadow:0 8px 24px rgba(236,72,153,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">💺</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#371b26;margin:0 0 8px;">${isZh ? '人体工学减压靠垫' : 'Ergonomic Cushions'}</h3>
          <p style="font-size:0.88rem;color:#6b4f59;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '60D 慢回弹记忆棉护腰靠垫、办公椅坐垫与斜坡抬腿枕，有效释放久坐脊柱压力。' : 'BASF 60D slow-rebound memory foam with cooling mesh for office chairs and cars.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#db2777;">Ergo Spine Certified →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #fce7f3;border-radius:26px;padding:28px;box-shadow:0 8px 24px rgba(236,72,153,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🍼</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#371b26;margin:0 0 8px;">${isZh ? '婴童安抚与寝具' : 'Baby Soothing & Bedding'}</h3>
          <p style="font-size:0.88rem;color:#6b4f59;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '100% 有机彩棉布料，零荧光剂，零甲醛，全线通过欧美婴幼纺织品严苛检验。' : 'OEKO-TEX 100 Class I organic cotton soothing pillows, baby sleep nests, and rattles.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#db2777;">OEKO-TEX 100 Class I →</span>
        </div>

        <div class="wr-card-hover" style="background:#ffffff;border:1px solid #fce7f3;border-radius:26px;padding:28px;box-shadow:0 8px 24px rgba(236,72,153,0.04);">
          <div style="font-size:2.2rem;margin-bottom:12px;">🛋️</div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#371b26;margin:0 0 8px;">${isZh ? '感官舒缓与加重玩偶' : 'Weighted Sensory Plush'}</h3>
          <p style="font-size:0.88rem;color:#6b4f59;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '内置医用级安全无毒微玻璃珠，深层压力刺激技术，有效缓解现代人焦虑助眠。' : 'Medical grade micro glass beads providing deep touch pressure soothing therapy.'}
          </p>
          <span style="font-size:0.8rem;font-weight:800;color:#db2777;">Deep Touch Pressure Therapy →</span>
        </div>
      </div>
    </section>
  `;

  // 3. Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.82rem;font-weight:800;color:#db2777;letter-spacing:0.08em;text-transform:uppercase;">${esc(ui.products)}</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:8px 0 0;">
            ${isZh ? '精品毛绒玩偶与舒适靠垫展示' : 'Featured Plush & Cushion Collection'}
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#db2777;text-decoration:none;font-size:0.95rem;">
          ${isZh ? '查看全部 8 款舒适产品 ↗' : 'View Full Catalog (8 Items) ↗'}
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #fce7f3;border-radius:26px;overflow:hidden;box-shadow:0 10px 30px rgba(236,72,153,0.04);display:flex;flex-direction:column;position:relative;">
            <div style="position:absolute;top:16px;left:16px;z-index:2;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border:1px solid #fbcfe8;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;color:#db2777;">
              ${esc(p.badge)}
            </div>
            <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;background:radial-gradient(circle, #ffffff 40%, #fff7ed 100%);padding:28px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:220px;object-fit:contain;transition:transform 0.3s ease;" loading="lazy">
            </a>
            <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;border-top:1px solid #fce7f3;">
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#831843;text-transform:uppercase;margin-bottom:6px;">
                  ${isZh ? p.categoryNameZh : p.categoryNameEn} · ${esc(p.tagline)}
                </div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#371b26;margin:0 0 8px;line-height:1.35;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#371b26;">${esc(p.name)}</a>
                </h3>
                <p style="font-size:0.86rem;color:#6b4f59;line-height:1.55;margin:0 0 16px;">
                  ${esc(p.desc)}
                </p>
              </div>
              <div>
                <div style="font-size:0.8rem;color:#4a2b37;margin-bottom:14px;background:#fdf2f8;padding:10px 12px;border-radius:14px;display:flex;justify-content:space-between;">
                  <span><strong>${isZh ? '面料' : 'Fab'}:</strong> ${esc(p.material.slice(0, 18))}...</span>
                  <span><strong>MOQ:</strong> ${esc(p.moq)}</span>
                </div>
                <div style="display:flex;gap:10px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#fdf2f8;color:#371b26;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#db2777;color:#ffffff;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
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

  // 4. Factory Quality & Clean Workshop Band
  const factoryHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #371b26 0%, #4a2133 100%);border-radius:32px;padding:56px 40px;color:#ffffff;box-shadow:0 24px 60px rgba(55,27,38,0.3);position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20%;right:-10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle, rgba(244,114,182,0.25) 0%, transparent 70%);filter:blur(60px);pointer-events:none;"></div>
        <div style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:center;">
          <div>
            <span style="font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;color:#f472b6;font-weight:800;">
              ${isZh ? '无尘洁净车间与全检品质保障' : 'CLEANROOM PRODUCTION & SAFETY QC'}
            </span>
            <h2 style="font-size:clamp(2rem, 3.8vw, 3rem);font-weight:900;color:#ffffff;letter-spacing:-0.03em;margin:12px 0 20px;line-height:1.2;">
              ${isZh ? '全自动激光裁床 · 100% 金属检针探测' : 'Precision Laser Cutting & Full Needle Detection'}
            </h2>
            <p style="font-size:1.05rem;line-height:1.75;color:rgba(255,255,255,0.85);margin:0 0 28px;">
              ${esc(company.capabilities || (isZh
                ? '配备全自动智能激光数控裁床、日本进口高速刺绣机、自动充棉机与双通道检针机。严格遵循母婴级卫生标准，全批次经过拉力、色牢度与跌落回弹测试。'
                : 'Equipped with CNC laser cutting beds, high-speed embroidery machines, automated fiber injection, and dual-channel metal needle detectors. Baby-safe clean environment.'))}
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px;">
              <div style="border-left:3px solid #f472b6;padding-left:14px;">
                <div style="font-size:1.8rem;font-weight:900;color:#ffffff;" data-counter="800000" data-suffix=" pcs">800,000 pcs</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? '综合月产能' : 'Monthly Unit Output'}</div>
              </div>
              <div style="border-left:3px solid #38bdf8;padding-left:14px;">
                <div style="font-size:1.8rem;font-weight:900;color:#ffffff;">0.8 mm</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:4px;">${isZh ? '超微金属探针灵敏度' : 'Metal Detector Precision'}</div>
              </div>
            </div>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#f472b6;color:#371b26;font-weight:800;padding:15px 34px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
              ${isZh ? '预约实地验厂 / 索取质检报告' : 'Book Facility Visit / Safety Reports'}
            </a>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:22px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🔍</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '全线金属检针' : 'Needle Detection'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? '每件毛绒玩具出厂前必须 100% 通过金属检针探测。' : '100% zero-metal fragment guarantee for child safety.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:22px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🌿</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '环保低碳面料' : 'GRS Certified'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? '支持再生聚酯纤维 (rPET) 与 GOTS 有机棉认证。' : 'Recycled polyester fabrics and organic cotton options.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:22px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">📦</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '真空压缩减积' : 'Vacuum Packaging'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? '体积压缩率达 70%，大幅削减国际跨境海运运费。' : 'Reduces shipping volume by up to 70% to save freight.'}</div>
            </div>

            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:22px;padding:24px;backdrop-filter:blur(16px);">
              <div style="font-size:1.8rem;margin-bottom:8px;">🎨</div>
              <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:6px;">${isZh ? '7天极速打版' : 'Fast 3D Sampling'}</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.5;">${isZh ? '2D 概念线稿 7 个工作日内还原成饱满 3D 实体毛绒样板。' : 'Concept drawings to tangible 3D plush in 7 business days.'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 5. CTA Band
  const ctaBandHtml = `
    <section class="wrap" style="padding:0 0 80px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #ec4899 0%, #be185d 100%);border-radius:32px;padding:50px 36px;text-align:center;color:#ffffff;box-shadow:0 20px 50px rgba(236,72,153,0.35);position:relative;overflow:hidden;">
        <h2 style="font-size:clamp(2rem, 3.6vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
          ${isZh ? '定制您的专属毛绒玩偶与健康靠垫货盘' : 'Bring Your Soft Home & Plush Vision to Life'}
        </h2>
        <p style="font-size:1.1rem;line-height:1.65;max-width:640px;margin:0 auto 32px;opacity:0.95;">
          ${isZh
            ? '提供布料色卡打样、IP 版权保密协议签署、小批量试单及全球集装箱海运一站式出海履约。'
            : 'Get physical fabric swatches, sample prototypes, and wholesale bulk quotes within 24 hours.'}
        </p>
        <div style="display:inline-flex;gap:16px;flex-wrap:wrap;justify-content:center;">
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#ffffff;color:#db2777;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:1rem;box-shadow:0 8px 24px rgba(0,0,0,0.12);text-decoration:none;">
            ${isZh ? '提交定制需求 / 申请样品 ↗' : 'Submit ODM RFQ / Request Samples ↗'}
          </a>
          <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.2);color:#ffffff;border:1px solid rgba(255,255,255,0.4);font-weight:800;padding:15px 32px;border-radius:9999px;font-size:1rem;text-decoration:none;">
            ${isZh ? '了解工厂安全认证 →' : 'Safety Compliance & Certs →'}
          </a>
        </div>
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${categoriesHtml}
      ${productsGridHtml}
      ${factoryHtml}
      ${ctaBandHtml}
    </main>
  `;
}

export function renderPlushCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getPlushProducts(ctx);

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="catalog" style="padding-top:100px;background:#fff7f9;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <header data-reveal="fade-up" style="text-align:center;max-width:760px;margin:0 auto 48px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#fce7f3;color:#db2777;font-size:0.82rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
            ${isZh ? '毛绒与靠垫全系目录' : 'COMPLETE PLUSH & CUSHION CATALOG'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:0 0 16px;">
            ${isZh ? '毛绒玩偶与靠垫出海货盘' : 'Plush & Cushion Export Catalog'}
          </h1>
          <p style="font-size:1.1rem;color:#6b4f59;line-height:1.65;margin:0;">
            ${isZh ? '全品类通过欧美安全检验，支持拉链拆洗、记忆棉枕芯与定制企业 IP 刺绣方案。' : 'Browse soft plushies, memory foam cushions, baby soothing pillows, and therapeutic weighted animals.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #fce7f3;border-radius:26px;overflow:hidden;box-shadow:0 8px 24px rgba(236,72,153,0.04);display:flex;flex-direction:column;position:relative;">
              <div style="position:absolute;top:16px;left:16px;z-index:2;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border:1px solid #fbcfe8;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;color:#db2777;">
                ${esc(p.badge)}
              </div>
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:block;background:radial-gradient(circle, #ffffff 40%, #fff7ed 100%);padding:28px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:220px;object-fit:contain;" loading="lazy">
              </a>
              <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;border-top:1px solid #fce7f3;">
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#831843;text-transform:uppercase;margin-bottom:6px;">
                    ${isZh ? p.categoryNameZh : p.categoryNameEn}
                  </div>
                  <h2 style="font-size:1.15rem;font-weight:900;color:#371b26;margin:0 0 8px;line-height:1.35;">
                    <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:#371b26;">${esc(p.name)}</a>
                  </h2>
                  <p style="font-size:0.86rem;color:#6b4f59;line-height:1.55;margin:0 0 16px;">
                    ${esc(p.desc)}
                  </p>
                </div>
                <div>
                  <div style="font-size:0.78rem;color:#4a2b37;margin-bottom:14px;background:#fdf2f8;padding:10px 12px;border-radius:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div><strong>${isZh ? '规格尺寸' : 'Dim'}:</strong><br>${esc(p.dimensions.slice(0, 18))}</div>
                    <div><strong>${isZh ? '包装形式' : 'Pack'}:</strong><br>${esc(p.packaging.slice(0, 18))}</div>
                  </div>
                  <div style="display:flex;gap:10px;">
                    <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#fdf2f8;color:#371b26;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
                      ${esc(ui.details)} ↗
                    </a>
                    <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#db2777;color:#ffffff;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
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

export function renderPlushDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getPlushProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0];
  const related = products.filter((item) => item.id !== p.id).slice(0, 3);

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="detail" style="padding-top:100px;background:#fff7f9;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 60px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;font-size:0.88rem;color:#831843;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#831843;text-decoration:none;">${esc(ui.home)}</a> &gt; 
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#831843;text-decoration:none;">${esc(ui.catalog)}</a> &gt; 
          <span style="color:#371b26;font-weight:700;">${esc(p.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #fce7f3;border-radius:32px;padding:40px;box-shadow:0 12px 36px rgba(236,72,153,0.05);" data-reveal="fade-up">
          <div>
            <div style="background:radial-gradient(circle, #ffffff 50%, #fff7ed 100%);border:1px solid #fce7f3;border-radius:26px;padding:36px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:360px;object-fit:contain;">
            </div>
          </div>

          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#fce7f3;color:#db2777;padding:4px 14px;border-radius:9999px;font-size:0.78rem;font-weight:800;margin-bottom:12px;">
              ${esc(p.badge)} · ${isZh ? p.categoryNameZh : p.categoryNameEn}
            </div>
            <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#371b26;line-height:1.25;margin:0 0 16px;">
              ${esc(p.name)}
            </h1>
            <p style="font-size:1.05rem;line-height:1.7;color:#6b4f59;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <div style="background:#fdf2f8;border:1px solid #fce7f3;border-radius:20px;padding:22px;margin-bottom:28px;">
              <h2 style="font-size:0.92rem;font-weight:900;color:#371b26;text-transform:uppercase;margin:0 0 14px;letter-spacing:0.05em;">
                ${isZh ? '材质与大宗外贸规格' : 'MATERIALS & PACKAGING SPECIFICATIONS'}
              </h2>
              <dl style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0;font-size:0.86rem;">
                <div>
                  <dt style="color:#831843;font-weight:600;">${isZh ? '布料面料 / 填充棉' : 'Fabric / Filling'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#371b26;">${esc(p.material)}</dd>
                </div>
                <div>
                  <dt style="color:#831843;font-weight:600;">${isZh ? '尺寸与重量' : 'Dimensions / Weight'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#371b26;">${esc(p.dimensions)}</dd>
                </div>
                <div>
                  <dt style="color:#831843;font-weight:600;">${isZh ? '真空装箱规格' : 'Packaging'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#371b26;">${esc(p.packaging)}</dd>
                </div>
                <div>
                  <dt style="color:#831843;font-weight:600;">${isZh ? '最小起订量 (MOQ)' : 'Minimum Order'}</dt>
                  <dd style="margin:2px 0 0;font-weight:800;color:#db2777;">${esc(p.moq)}</dd>
                </div>
              </dl>
            </div>

            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="flex:1;min-width:200px;text-align:center;background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:16px 28px;border-radius:16px;font-size:0.95rem;box-shadow:0 8px 24px rgba(236,72,153,0.3);text-decoration:none;">
                ${isZh ? '针对该款索取大宗批发阶梯价 ↗' : 'Request Bulk Wholesale Tier ↗'}
              </a>
              <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#fdf2f8;color:#371b26;font-weight:700;padding:16px 24px;border-radius:16px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '申请触感样品手板' : 'Request Swatch Sample'}
              </a>
            </div>
          </div>
        </div>

        <div style="margin-top:60px;" data-reveal="fade-up">
          <h2 style="font-size:1.6rem;font-weight:900;color:#371b26;margin:0 0 24px;">
            ${esc(ui.related)}
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${related.map((item) => `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #fce7f3;border-radius:22px;padding:20px;box-shadow:0 6px 20px rgba(236,72,153,0.03);">
                <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;display:block;text-align:center;">
                  <img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:100%;height:180px;object-fit:contain;margin-bottom:14px;" loading="lazy">
                  <h3 style="font-size:1rem;font-weight:800;color:#371b26;margin:0 0 6px;">${esc(item.name)}</h3>
                  <div style="font-size:0.8rem;color:#db2777;font-weight:700;">MOQ: ${esc(item.moq)}</div>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderPlushAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const headline = getAboutHeadline(company, isZh ? `${company.name} · 软体舒适家居与毛绒制造` : `${company.name} · Soft Goods & Plush Manufacturing`);
  const storyParagraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
  const { primary: primaryImage } = getAboutImages(
    ctx,
    path('assets/about-reference.jpg'),
    '',
  );

  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2015', num: parseInt(company.establishedYear || '2015', 10), label: isZh ? '创办年份' : 'Established', desc: 'A decade of soft living craftsmanship' },
    { value: '800,000 pcs', num: 800000, suffix: ' pcs', label: isZh ? '毛绒与靠垫月产能' : 'Monthly Output', desc: 'Automated cutting & needle detection' },
    { value: 'OEKO-TEX 100', label: isZh ? '国际母婴安全认证' : 'Baby Safe Cert', desc: 'Standard 100 Class I verified' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '检针全检保障' : 'Needle Checked', desc: 'Dual-sensor metal detector' },
  ]);

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="about" style="padding-top:100px;background:#fff7f9;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;margin-bottom:60px;" data-reveal="fade-up">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#fce7f3;color:#db2777;padding:4px 14px;border-radius:9999px;font-size:0.8rem;font-weight:800;margin-bottom:14px;">
              ${isZh ? '关于我们的匠心软体工厂' : 'ABOUT OUR PLUSH & CUSHION ATELIER'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#371b26;line-height:1.2;margin:0 0 20px;">
              ${esc(headline)}
            </h1>
            <div style="color:#6b4f59;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${storyParagraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-left:3px solid #db2777;padding-left:16px;">
              <div style="font-weight:800;color:#371b26;font-size:0.95rem;">${isZh ? '“每一寸毛绒与靠垫，都承载着治愈人心的温暖与对生命的呵护。”' : '“Every fiber and stitch brings comforting warmth and uncompromising safety.”'}</div>
              <div style="color:#831843;font-size:0.82rem;margin-top:4px;">${esc(company.name)} · Craftsmanship Council</div>
            </div>
          </div>

          <div class="wr-card-hover" style="position:relative;">
            <div style="border:1px solid #fce7f3;border-radius:28px;overflow:hidden;background:#ffffff;box-shadow:0 16px 40px rgba(236,72,153,0.08);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
            </div>
            <div style="position:absolute;bottom:24px;left:24px;background:rgba(55,27,38,0.85);backdrop-filter:blur(16px);color:#ffffff;padding:10px 20px;border-radius:16px;font-size:0.82rem;font-weight:800;">
              ✓ ${isZh ? '通过 BSCI 与 ISO9001 质量认证' : 'BSCI & ISO9001 Audited Facility'}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-bottom:60px;" data-reveal="fade-up">
          ${highlights.map((h) => `
            <div class="wr-card-hover" style="background:#ffffff;border:1px solid #fce7f3;border-radius:24px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(236,72,153,0.03);">
              <div style="font-size:2.4rem;font-weight:900;color:#db2777;line-height:1;margin-bottom:10px;">
                <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>${esc(h.value)}</span>
              </div>
              <div style="font-size:0.9rem;font-weight:800;color:#371b26;margin-bottom:4px;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.8rem;color:#831843;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:40px;align-items:center;background:#ffffff;border:1px solid #fce7f3;border-radius:28px;padding:36px;margin-bottom:60px;" data-reveal="fade-up">
          <img src="${path('assets/about-reference.jpg')}" alt="${esc(company.name)} workshop" style="width:100%;height:300px;object-fit:cover;border-radius:20px;" loading="lazy">
          <div>
            <span style="font-size:0.8rem;font-weight:800;color:#db2777;text-transform:uppercase;">CLEANROOM ATELIER</span>
            <h2 style="font-size:1.6rem;font-weight:900;color:#371b26;margin:8px 0 14px;">${isZh ? '母婴级防尘除菌制造环境' : 'Dust-Free Cleanroom & Automated Sewing'}</h2>
            <p style="color:#6b4f59;font-size:0.95rem;line-height:1.7;margin:0 0 20px;">
              ${isZh ? '采用正压恒温无尘车间，定期紫外线杀菌除螨。从面料验布、自动分切到最后装箱，确保无异物、无过敏原，安心直抵终端消费家庭。' : 'Positive pressure dust-free cleanroom with UV sanitation. From fabric inspection to vacuum pack cartons.'}
            </p>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#db2777;color:#ffffff;font-weight:800;padding:12px 28px;border-radius:9999px;font-size:0.9rem;text-decoration:none;">
              ${isZh ? '预约实地审厂验厂' : 'Schedule Factory Tour'}
            </a>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderPlushContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getPlushProducts(ctx);
  const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="contact" style="padding-top:100px;background:#fff7f9;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <header data-reveal="fade-up" style="text-align:center;max-width:720px;margin:0 auto 48px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 16px;border-radius:9999px;background:#fce7f3;color:#db2777;font-size:0.82rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
            ${esc(ui.contact)} · COMFORT TRADE INQUIRY
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:0 0 16px;">
            ${isZh ? '毛绒与靠垫大宗采购洽谈' : 'Direct Trade Inquiry & Custom Plush Quotes'}
          </h1>
          <p style="font-size:1.1rem;color:#6b4f59;line-height:1.65;margin:0;">
            ${isZh ? '支持 IP 形象定制、毛绒触感手板申请及批量出海阶梯报价。我们的产品专员将在 12 小时内与您接洽。' : 'Request plush swatches, custom IP prototypes, or wholesale volume quotes. Response within 12 hours.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;background:#ffffff;border:1px solid #fce7f3;border-radius:32px;padding:40px;box-shadow:0 12px 40px rgba(236,72,153,0.05);" data-reveal="fade-up">
          <div>
            <h2 style="font-size:1.4rem;font-weight:900;color:#371b26;margin:0 0 20px;">
              ${esc(company.name)}
            </h2>
            <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:#6b4f59;margin-bottom:32px;">
              <div>
                <strong>${esc(ui.emailDirect)}:</strong><br>
                <a href="mailto:${esc(company.email)}" style="color:#db2777;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
              </div>
              ${company.phone ? `
                <div>
                  <strong>Phone:</strong><br>
                  <a href="tel:${esc(company.phone)}" style="color:#371b26;text-decoration:none;">${esc(company.phone)}</a>
                </div>
              ` : ''}
              ${waDigits ? `
                <div>
                  <strong>WhatsApp (Instant Plush Inquiry):</strong><br>
                  <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:#25d366;color:#ffffff;padding:8px 16px;border-radius:9999px;text-decoration:none;font-weight:800;font-size:0.86rem;margin-top:4px;">
                    💬 Chat on WhatsApp (+${esc(waDigits)})
                  </a>
                </div>
              ` : ''}
              ${company.address ? `
                <div>
                  <strong>Factory Address:</strong><br>
                  <span>${esc(company.address)}</span>
                </div>
              ` : ''}
            </div>

            <div style="background:#fdf2f8;border:1px solid #fce7f3;border-radius:20px;padding:22px;">
              <h3 style="font-size:0.9rem;font-weight:900;color:#371b26;text-transform:uppercase;margin:0 0 10px;">${isZh ? '打样与大宗合作保障' : 'Production Commitments'}</h3>
              <ul style="margin:0;padding-left:18px;font-size:0.85rem;color:#831843;line-height:1.7;">
                <li>${isZh ? '7 个工作日内完成毛绒玩偶 3D 实体初样' : 'Plush 3D physical sample in 7 business days'}</li>
                <li>${isZh ? '100% 通过金属检针与跌落抗撕裂测试' : '100% needle detection & seam strength passed'}</li>
                <li>${isZh ? '支持真空压缩包装，削减 70% 运费成本' : 'Vacuum pack cuts ocean shipping volume by 70%'}</li>
              </ul>
            </div>
          </div>

          <div>
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#371b26;margin-bottom:6px;">${esc(ui.name)} *</label>
                <input name="name" autocomplete="name" required maxlength="120" style="width:100%;padding:14px;border:1px solid #fbcfe8;border-radius:14px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#371b26;margin-bottom:6px;">${esc(ui.email)} *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:14px;border:1px solid #fbcfe8;border-radius:14px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#371b26;margin-bottom:6px;">${esc(ui.company)} (${esc(ui.optional)})</label>
                <input name="company" autocomplete="organization" maxlength="200" style="width:100%;padding:14px;border:1px solid #fbcfe8;border-radius:14px;font-size:0.95rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#371b26;margin-bottom:6px;">${esc(ui.product)} (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:14px;border:1px solid #fbcfe8;border-radius:14px;font-size:0.95rem;box-sizing:border-box;background:#ffffff;">
                  <option value="">— ${isZh ? '选择感兴趣的产品' : 'Select Product of Interest'} —</option>
                  ${products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.86rem;font-weight:800;color:#371b26;margin-bottom:6px;">${esc(ui.message)} *</label>
                <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请描述您的采购数量、目标面料手感与定制要求...' : 'Please specify target order quantity, fabric textures, or custom IP requirements...'}" style="width:100%;padding:14px;border:1px solid #fbcfe8;border-radius:14px;font-size:0.95rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
              <button class="button" type="submit"${ctx.options.preview ? ' disabled' : ''} style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:900;padding:16px;border-radius:16px;font-size:1rem;border:none;cursor:pointer;">
                ${esc(ui.send)} ☁️
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:0;font-size:0.9rem;"></p>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderPlushPage(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const page = ctx.page;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const logo = ctx.asset(company.logoAssetId);
  const brand = logo ? `<img src="${esc(logo)}" alt="${esc(company.name)}" style="max-height:38px;object-fit:contain;">` : `<span style="font-weight:900;font-size:1.35rem;color:#371b26;letter-spacing:-0.02em;">🧸 ${esc(company.name)}</span>`;

  const depth = page === 'home' ? '' : '../';
  const languageLinks = draft.languages
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:6px;text-decoration:none;${l === ctx.lang ? 'background:#db2777;color:#ffffff;' : 'color:#831843;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-plush-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.85);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid #fce7f3;box-shadow:0 4px 20px rgba(236,72,153,0.04);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'home' ? '#db2777' : '#371b26'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'catalog' ? '#db2777' : '#371b26'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'about' ? '#db2777' : '#371b26'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:800;color:${page === 'contact' ? '#db2777' : '#371b26'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:10px 22px;border-radius:9999px;font-size:0.86rem;text-decoration:none;box-shadow:0 4px 14px rgba(236,72,153,0.25);">
            ${isZh ? '样品申请 ↗' : 'Samples ↗'}
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';
  switch (page) {
    case 'catalog': mainHtml = renderPlushCatalog(ctx); break;
    case 'detail': mainHtml = renderPlushDetail(ctx); break;
    case 'about': mainHtml = renderPlushAbout(ctx); break;
    case 'contact': mainHtml = renderPlushContact(ctx); break;
    default: mainHtml = renderPlushHome(ctx, isVideo); break;
  }

  const footerHtml = `
    <footer style="background:#26131c;color:#fbcfe8;padding:60px 0 30px;font-size:0.88rem;border-top:1px solid #3f1e2f;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;margin-bottom:44px;">
        <div>
          <div style="font-size:1.35rem;font-weight:900;color:#ffffff;margin-bottom:12px;">🧸 ${esc(company.name)}</div>
          <p style="font-size:0.88rem;line-height:1.7;color:#fbcfe8;margin:0 0 16px;">
            ${isZh ? '全球优质毛绒玩偶与人体工学靠垫供应链。为全球品牌与渠道商提供 OEKO-TEX 100 婴儿级认证亲肤产品。' : 'Baby-safe plush and ergonomic cushions for global brands. OEKO-TEX 100 Class I & GRS certified.'}
          </p>
          <div style="font-size:0.8rem;color:#f472b6;font-weight:700;">OEKO-TEX 100 · EN71 · ASTM F963 · GRS · ISO9001</div>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#fbcfe8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '萌系治愈毛绒玩偶' : 'Kawaii Plush Toys'}</a></li>
            <li><a style="text-decoration:none;color:#fbcfe8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '人体工学减压靠垫' : 'Ergonomic Cushions'}</a></li>
            <li><a style="text-decoration:none;color:#fbcfe8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '婴童安抚与寝具' : 'Baby Soothing Bedding'}</a></li>
            <li><a style="text-decoration:none;color:#fbcfe8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '感官舒缓加重玩偶' : 'Weighted Sensory Plush'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '软体工贸实力' : 'Factory Highlights'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${isZh ? '800,000 件综合月产能' : '800,000 Units Monthly Output'}</li>
            <li>✓ ${isZh ? '100% 双传感器金属检针机全检' : '100% Dual Needle Detection QC'}</li>
            <li>✓ ${isZh ? '7天极速毛绒 3D 实物打版' : '7-Day Fast 3D Prototyping'}</li>
            <li>✓ ${isZh ? '真空压缩包装，削减 70% 运费' : 'Vacuum Pack Reduces 70% Freight'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#f472b6;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#fbcfe8;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #3f1e2f;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#9d6981;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>🧸 ${isZh ? '毛绒与靠垫全球出海供应链旗舰版' : 'Plush & Cushions Global Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
