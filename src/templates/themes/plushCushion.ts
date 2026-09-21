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

export const PLUSH_DEFAULT_PRODUCTS: ThemedProductItem[] = [
  {
    id: 'pc-1',
    name: 'CloudBreeze Ergonomic Memory Foam Lumbar Cushion',
    desc: 'High-density 60D slow-rebound bionic memory foam contoured for lumbar spine decompression with cooling air-mesh cover.',
    badge: 'Ergo Cloud',
    category: 'cushions',
    categoryNameZh: '人体工学减压靠垫',
    categoryNameEn: 'Ergonomic Cushions',
    material: 'BASF Slow-Rebound Memory Foam + 3D Cool Mesh',
    dimensions: '440 × 390 × 120 mm (680g)',
    packaging: 'Vacuum Compressed in Polybag (20 pcs/ctn)',
    moq: '300 Units',
    tagline: 'Scientific Spine Cloud Support',
    img: getIndustryPlaceholder('plush', 0),
  },
  {
    id: 'pc-2',
    name: 'SnugglePaws Giant Kawaii Boba Plush 65cm',
    desc: 'Ultra-soft four-way stretch velvet fabric stuffed with feather-touch micro down cotton, odor-free and machine washable.',
    badge: 'Huggable Plush',
    category: 'plush',
    categoryNameZh: '萌系治愈毛绒玩偶',
    categoryNameEn: 'Kawaii Plush Toys',
    material: 'Super Soft Spandex Crystal Velvet + 7D PP Cotton',
    dimensions: '650 × 400 × 400 mm (1.4kg)',
    packaging: 'Compressed PE Bag (10 pcs/ctn)',
    moq: '500 Units',
    tagline: 'Ultra Huggable Cloud Softness',
    img: getIndustryPlaceholder('plush', 1),
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
    img: getIndustryPlaceholder('plush', 2),
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
    img: getIndustryPlaceholder('plush', 3),
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
    img: getIndustryPlaceholder('plush', 4),
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
    img: getIndustryPlaceholder('plush', 5),
  },
  {
    id: 'pc-7',
    name: 'CoolGel Orthopedic Bed Wedge Backrest',
    desc: 'Multipurpose angled wedge pillow with cooling honeycomb gel overlay for acid reflux relief, reading support, and leg elevation.',
    badge: 'Medical Ergo',
    category: 'cushions',
    categoryNameZh: '多功能护脊斜坡靠垫',
    categoryNameEn: 'Therapeutic Bed Wedges',
    material: 'Therapeutic Foam Core + Cool Touch Ice Silk Cover',
    dimensions: '600 × 550 × 300 mm (1.8kg)',
    packaging: 'Heavy Vacuum Box Pack (6 pcs/ctn)',
    moq: '200 Units',
    tagline: 'Multifunctional Body Relaxation',
    img: getIndustryPlaceholder('plush', 6),
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
    img: getIndustryPlaceholder('plush', 7),
  },
];

export function getPlushProducts(ctx: ThemeContext): ThemedProductItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Soft Item ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: 'Soft Living',
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
      ? '深耕婴童级安全毛绒、解压记忆棉靠垫与企业级 IP 形象柔性定制。通过 OEKO-TEX 100 / GOTS 严苛国际认证，为全球买家提供温暖触感体验。'
      : 'Specializing in baby-safe plush toys, sensory weighted animals, and ergonomic memory foam cushions. Certified by OEKO-TEX 100 and GOTS for international brands.'),
    cta: userCopy?.cta || (isZh ? '浏览毛绒与靠垫全谱系' : 'Explore Soft Living Catalog'),
  };

  const videoAsset = ctx.asset(draft.heroAssetId);
  const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';

  let heroSectionHtml = '';
  if (isVideo) {
    heroSectionHtml = `
      <section class="wr-plush-hero-video wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#181116;color:#ffffff;">
        <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.6;z-index:1;" aria-hidden="true">
          ${videoAsset ? `<source src="${esc(videoAsset)}">` : ''}
        </video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(219,39,119,0.15) 0%, rgba(24,17,22,0.92) 80%);z-index:2;"></div>
        <div class="wrap" style="position:relative;z-index:3;padding:120px 20px 80px;text-align:center;max-width:960px;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:8px 24px;border-radius:9999px;background:rgba(255,255,255,0.14);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(236,72,153,0.25);font-size:0.84rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#f472b6;margin-bottom:24px;">
            ☁️ ${isZh ? '云柔级安全触感 · 原厂大宗 OEM/ODM' : 'CLOUD SOFT COMFORT & GLOBAL PLUSH ODM'}
          </div>
          <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.4rem, 4.8vw, 4.2rem);font-weight:900;line-height:1.2;letter-spacing:-0.03em;color:#ffffff;margin:0 0 22px;text-shadow:0 4px 24px rgba(0,0,0,0.4);">
            ${esc(copy.headline)}
          </h1>
          <p data-reveal="fade-up" style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.75;color:rgba(255,255,255,0.9);margin:0 auto 34px;max-width:760px;">
            ${esc(copy.subtitle)}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:1rem;box-shadow:0 10px 30px rgba(236,72,153,0.4);border:none;text-decoration:none;">
              ${esc(copy.cta)} ☁️
            </a>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:rgba(255,255,255,0.15);color:#ffffff;backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.35);font-weight:800;padding:15px 32px;border-radius:9999px;font-size:1rem;text-decoration:none;">
              ${isZh ? '索取毛绒手感样品与报价' : 'Request Swatches & Samples'}
            </a>
          </div>
          <!-- Comfort Metrics Bar -->
          <div data-reveal="fade-up" style="margin-top:50px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;padding:24px;border-radius:28px;background:rgba(255,255,255,0.1);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.22);box-shadow:0 20px 50px rgba(0,0,0,0.3);">
            <div>
              <div style="font-size:2rem;font-weight:900;color:#f472b6;">800,000 pcs</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '毛绒与靠垫月产能' : 'Monthly Output'}</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#ffffff;">OEKO-TEX 100</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '婴儿级母婴安全认证' : 'Baby-Safe Class I'}</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#f472b6;">99.8%</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '高回弹抗塌陷耐久率' : 'Anti-Sagging Durability'}</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#ffffff;">0.8 mm</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-top:4px;">${isZh ? '双探头金属检针精度' : 'Needle Detection'}</div>
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
      ? `linear-gradient(135deg, rgba(55,27,38,0.92) 0%, rgba(30,15,22,0.96) 100%), url('${esc(customBanner)}') center/cover no-repeat`
      : `linear-gradient(135deg, #371b26 0%, #201018 100%)`;

    heroSectionHtml = `
      <section class="wr-plush-hero-banner wr-liquid-glass-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:100px 0 110px;position:relative;overflow:hidden;border-bottom:1px solid rgba(244,114,182,0.25);color:#ffffff;">
        <div style="position:absolute;top:-10%;right:15%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%);filter:blur(60px);pointer-events:none;"></div>
        <div class="wrap" style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:center;">
          <!-- Left Info -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:9999px;background:rgba(244,114,182,0.15);border:1px solid rgba(244,114,182,0.35);color:#f472b6;font-size:0.82rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
              ☁️ ${isZh ? '母婴级安全软体 · 触感生活工坊' : 'ORGANIC BABY-SAFE SOFT GOODS ATELIER'}
            </div>
            <h1 class="hero-title" style="font-size:clamp(2.3rem, 4.2vw, 3.6rem);font-weight:900;color:#ffffff;line-height:1.2;letter-spacing:-0.03em;margin:0 0 20px;">
              ${esc(copy.headline)}
            </h1>
            <p style="font-size:1.08rem;line-height:1.75;color:#e2d1d9;margin:0 0 32px;max-width:540px;">
              ${esc(copy.subtitle)}
            </p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
              <a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:15px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 24px rgba(236,72,153,0.35);text-decoration:none;">
                ${esc(copy.cta)} ☁️
              </a>
              <a class="button" href="${path('about/index.html')}" ${navAttrs('about')} style="background:rgba(255,255,255,0.1);color:#ffffff;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.25);font-weight:700;padding:14px 30px;border-radius:9999px;font-size:0.95rem;text-decoration:none;">
                ${isZh ? '洁净车间与安全标准 →' : 'Cleanroom Workshop →'}
              </a>
            </div>
          </div>

          <!-- Right Organic Rounded Soft Card -->
          <div data-reveal="fade-up" style="position:relative;">
            <div class="wr-card-hover" style="position:relative;background:#ffffff;border:1px solid #fce7f3;border-radius:32px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.3);color:#371b26;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <span style="background:#fce7f3;color:#db2777;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;">
                  ${esc(heroProduct.badge)}
                </span>
                <span style="font-size:0.78rem;color:#831843;font-weight:700;">OEKO-TEX 100 Class I</span>
              </div>
              <div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, #ffffff 40%, #fff7ed 100%);border-radius:24px;margin-bottom:20px;padding:20px;border:1px solid #fce7f3;">
                <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:240px;object-fit:contain;" fetchpriority="high">
              </div>
              <h2 style="font-size:1.2rem;font-weight:900;color:#371b26;margin:0 0 8px;line-height:1.35;">
                ${esc(heroProduct.name)}
              </h2>
              <p style="font-size:0.86rem;color:#6b4f59;line-height:1.55;margin:0 0 16px;">
                ${esc(heroProduct.desc)}
              </p>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#fdf2f8;color:#371b26;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(heroProduct.id))}" ${navAttrs('contact', heroProduct.id)} class="button" style="flex:1;text-align:center;background:#db2777;color:#ffffff;font-weight:800;padding:10px;border-radius:14px;font-size:0.85rem;text-decoration:none;">
                  ${esc(ui.inquire)} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Soft Goods Craft Pipeline
  const craftPipelineHtml = `
    <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;">
        <span style="font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:#db2777;font-weight:800;">TACTILE COMFORT PIPELINE</span>
        <h2 style="font-size:clamp(1.9rem, 3.4vw, 2.6rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:10px 0 14px;">
          ${isZh ? '五阶母婴级软体治愈制造管线' : '5-Stage Baby-Safe Soft Living Pipeline'}
        </h2>
        <p style="font-size:1rem;color:#6b4f59;margin:0;">
          ${isZh ? '从无荧光环保选料、激光数控裁切到双金属检针与真空减积出海。' : 'From non-fluorescent fabric selection to ultrasonic cutting and 100% dual needle detection.'}
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
        <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:20px;padding:22px;border-top:3px solid #db2777;">
          <div style="font-size:0.75rem;font-weight:900;color:#db2777;margin-bottom:6px;">01 SAFE MATERIALS</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#371b26;margin:0 0 6px;">${isZh ? '无荧光母婴级选料' : 'OEKO-TEX 100 Fabrics'}</h3>
          <p style="font-size:0.82rem;color:#6b4f59;line-height:1.5;margin:0;">${isZh ? '严选 GOTS 有机棉与超柔水晶绒，零甲醛无异味。' : 'Zero fluorescent agents, non-toxic and hypoallergenic.'}</p>
        </div>
        <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:20px;padding:22px;border-top:3px solid #db2777;">
          <div style="font-size:0.75rem;font-weight:900;color:#db2777;margin-bottom:6px;">02 LASER CUTTING</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#371b26;margin:0 0 6px;">${isZh ? '全自动激光数控裁切' : 'Precision Laser Cutting'}</h3>
          <p style="font-size:0.82rem;color:#6b4f59;line-height:1.5;margin:0;">${isZh ? '高精度激光无毛边分切，精准锁边杜绝掉毛脱毛。' : 'Sealed edges prevent fiber shedding on plush seams.'}</p>
        </div>
        <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:20px;padding:22px;border-top:3px solid #db2777;">
          <div style="font-size:0.75rem;font-weight:900;color:#db2777;margin-bottom:6px;">03 3D FIBER FILL</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#371b26;margin:0 0 6px;">${isZh ? '3D 高弹羽丝绒充填' : '3D High-Resilience Fill'}</h3>
          <p style="font-size:0.82rem;color:#6b4f59;line-height:1.5;margin:0;">${isZh ? '7D 高回弹原生中空棉，饱满抗塌陷，触感轻盈。' : '7D virgin hollow cotton ensuring cloud-like rebound.'}</p>
        </div>
        <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:20px;padding:22px;border-top:3px solid #db2777;">
          <div style="font-size:0.75rem;font-weight:900;color:#db2777;margin-bottom:6px;">04 SEAM STRENGTH</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#371b26;margin:0 0 6px;">${isZh ? '高密双针隐形锁线' : 'Reinforced Stitching'}</h3>
          <p style="font-size:0.82rem;color:#6b4f59;line-height:1.5;margin:0;">${isZh ? '超强抗拉力防撕裂缝合，确保机洗不爆缝、不漏棉。' : 'Pull-tested durable seams built for machine wash.'}</p>
        </div>
        <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:20px;padding:22px;border-top:3px solid #db2777;">
          <div style="font-size:0.75rem;font-weight:900;color:#db2777;margin-bottom:6px;">05 NEEDLE DETECTION</div>
          <h3 style="font-size:1.05rem;font-weight:900;color:#371b26;margin:0 0 6px;">${isZh ? '双通道金属检针全检' : 'Dual Needle Detection'}</h3>
          <p style="font-size:0.82rem;color:#6b4f59;line-height:1.5;margin:0;">${isZh ? '0.8mm 灵敏度金属探针全检，100% 零金属残留出厂。' : '100% metal-free assurance for infant home safety.'}</p>
        </div>
      </div>
    </section>
  `;

  // Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.78rem;font-weight:800;color:#db2777;letter-spacing:0.08em;text-transform:uppercase;">SOFT LIVING VAULT</span>
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:6px 0 0;">
            ${isZh ? '毛绒玩偶与治愈靠垫精选货盘' : 'Featured Soft Goods & Plush Collection'}
          </h2>
        </div>
        <a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-weight:800;color:#db2777;text-decoration:none;font-size:0.92rem;">
          ${isZh ? '查看全部 8 款治愈系货盘 ↗' : 'View Full Catalog (8 Items) ↗'}
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
        ${products.map((p) => `
          <article class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #fce7f3;border-radius:24px;overflow:hidden;box-shadow:0 6px 20px rgba(236,72,153,0.03);display:flex;flex-direction:column;">
            <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #ffffff 40%, #fff7ed 100%);display:flex;align-items:center;justify-content:center;padding:24px;">
              <span style="position:absolute;top:12px;left:12px;background:#fce7f3;color:#db2777;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:9999px;">
                ${esc(p.badge)}
              </span>
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:200px;max-width:100%;object-fit:contain;" loading="lazy">
              </a>
            </div>
            <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
              <div style="font-size:0.75rem;font-weight:800;color:#831843;text-transform:uppercase;margin-bottom:6px;">
                ${isZh ? p.categoryNameZh : p.categoryNameEn}
              </div>
              <h3 style="font-size:1.1rem;font-weight:900;color:#371b26;margin:0 0 8px;line-height:1.35;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
              </h3>
              <p style="font-size:0.85rem;color:#6b4f59;line-height:1.5;margin:0 0 16px;flex:1;">
                ${esc(p.desc)}
              </p>
              <div style="background:#fdf2f8;border-radius:12px;padding:10px 12px;font-size:0.78rem;color:#4a2b37;margin-bottom:14px;">
                <div><strong>${isZh ? '规格尺寸' : 'Dim'}:</strong> ${esc(p.dimensions.slice(0, 24))}</div>
                <div style="margin-top:2px;"><strong>${isZh ? '包装形式' : 'Pack'}:</strong> ${esc(p.packaging.slice(0, 24))}</div>
              </div>
              <div style="display:flex;gap:8px;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#fdf2f8;color:#371b26;font-weight:800;padding:10px;border-radius:12px;font-size:0.82rem;text-decoration:none;">
                  ${esc(ui.details)} ↗
                </a>
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#db2777;color:#ffffff;font-weight:800;padding:10px;border-radius:12px;font-size:0.82rem;text-decoration:none;">
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
    <main class="wr-inner wr-plush-inner" data-wr-page="home">
      ${heroSectionHtml}
      ${craftPipelineHtml}
      ${productsGridHtml}
    </main>
  `;
}

export function renderPlushCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getPlushProducts(ctx);

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="catalog" style="padding-top:90px;background:#fff7f9;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:760px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:9999px;background:#fce7f3;color:#db2777;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            ${isZh ? '毛绒与靠垫全系目录' : 'COMPLETE PLUSH & CUSHION CATALOG'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:0 0 14px;">
            ${isZh ? '毛绒玩偶与人体工学靠垫出海货盘' : 'Plush & Cushion Export Catalog'}
          </h1>
          <p style="font-size:1.05rem;color:#6b4f59;line-height:1.65;margin:0;">
            ${isZh ? '全品类通过欧美安全检验，支持拉链拆洗、记忆棉枕芯与定制企业 IP 刺绣方案。' : 'Browse soft plushies, memory foam cushions, baby soothing pillows, and therapeutic weighted animals.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:28px;">
          ${products.map((p) => `
            <article class="wr-card-hover" style="background:#ffffff;border:1px solid #fce7f3;border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(236,72,153,0.03);display:flex;flex-direction:column;">
              <div style="position:relative;aspect-ratio:1/1;background:radial-gradient(circle, #ffffff 40%, #fff7ed 100%);display:flex;align-items:center;justify-content:center;padding:24px;">
                <span style="position:absolute;top:12px;left:12px;background:#fce7f3;color:#db2777;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:9999px;">
                  ${esc(p.badge)}
                </span>
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:220px;max-width:100%;object-fit:contain;" loading="lazy">
                </a>
              </div>
              <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                <div style="font-size:0.75rem;font-weight:800;color:#831843;text-transform:uppercase;margin-bottom:6px;">
                  ${isZh ? p.categoryNameZh : p.categoryNameEn} · ${esc(p.tagline)}
                </div>
                <h2 style="font-size:1.15rem;font-weight:900;color:#371b26;margin:0 0 8px;line-height:1.35;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;color:inherit;">${esc(p.name)}</a>
                </h2>
                <p style="font-size:0.86rem;color:#6b4f59;line-height:1.55;margin:0 0 16px;flex:1;">
                  ${esc(p.desc)}
                </p>
                <div style="background:#fdf2f8;border-radius:12px;padding:10px 12px;font-size:0.78rem;color:#4a2b37;margin-bottom:16px;display:grid;gap:4px;">
                  <div><strong>${isZh ? '规格' : 'Dimensions'}:</strong> ${esc(p.dimensions)}</div>
                  <div><strong>${isZh ? '材质' : 'Material'}:</strong> ${esc(p.material)}</div>
                  <div><strong>${isZh ? '起订' : 'MOQ'}:</strong> <span style="color:#db2777;font-weight:800;">${esc(p.moq)}</span></div>
                </div>
                <div style="display:flex;gap:8px;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="button" style="flex:1;text-align:center;background:#fdf2f8;color:#371b26;font-weight:800;padding:10px;border-radius:12px;font-size:0.82rem;text-decoration:none;">
                    ${esc(ui.details)} ↗
                  </a>
                  <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="flex:1;text-align:center;background:#db2777;color:#ffffff;font-weight:800;padding:10px;border-radius:12px;font-size:0.82rem;text-decoration:none;">
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

export function renderPlushDetail(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getPlushProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0];

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="detail" style="padding-top:90px;background:#fff7f9;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <div style="margin-bottom:20px;">
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="font-size:0.86rem;font-weight:800;color:#db2777;text-decoration:none;">
            ← ${isZh ? '返回毛绒靠垫目录' : 'Back to Plush Catalog'}
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:50px;align-items:start;background:#ffffff;border:1px solid #fce7f3;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(236,72,153,0.03);">
          <div style="background:radial-gradient(circle, #ffffff 40%, #fff7ed 100%);border-radius:22px;padding:40px;display:flex;align-items:center;justify-content:center;border:1px solid #fce7f3;position:relative;">
            <span style="position:absolute;top:20px;left:20px;background:#fce7f3;color:#db2777;font-size:0.75rem;font-weight:800;padding:5px 12px;border-radius:9999px;">
              ${esc(p.badge)}
            </span>
            <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;" fetchpriority="high">
          </div>

          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#fce7f3;color:#db2777;padding:4px 14px;border-radius:9999px;font-size:0.78rem;font-weight:800;margin-bottom:12px;">
              ${esc(p.badge)} · ${isZh ? p.categoryNameZh : p.categoryNameEn}
            </div>
            <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#371b26;line-height:1.2;margin:0 0 14px;">
              ${esc(p.name)}
            </h1>
            <p style="font-size:1rem;color:#6b4f59;line-height:1.65;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <div style="background:#fdf2f8;border:1px solid #fce7f3;border-radius:18px;padding:20px;margin-bottom:28px;">
              <h3 style="font-size:0.92rem;font-weight:900;color:#371b26;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.04em;">
                ${isZh ? '材质与大宗外贸规格' : 'Materials & Packaging Specifications'}
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.84rem;color:#371b26;">
                <div><strong>${isZh ? '布料面料 / 填充棉' : 'Fabric / Filling'}:</strong><br>${esc(p.material)}</div>
                <div><strong>${isZh ? '尺寸与重量' : 'Dimensions / Weight'}:</strong><br>${esc(p.dimensions)}</div>
                <div><strong>${isZh ? '真空装箱规格' : 'Packaging'}:</strong><br>${esc(p.packaging)}</div>
                <div><strong>${isZh ? '最小起订量 (MOQ)' : 'Minimum Order'}:</strong><br><span style="color:#db2777;font-weight:800;">${esc(p.moq)}</span></div>
              </div>
            </div>

            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} class="button" style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:14px 32px;border-radius:12px;font-size:0.92rem;box-shadow:0 8px 24px rgba(236,72,153,0.3);text-decoration:none;">
                ${isZh ? '针对该款索取大宗阶梯价 ↗' : 'Request Bulk Quote ↗'}
              </a>
              <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#fdf2f8;color:#371b26;font-weight:700;padding:14px 24px;border-radius:12px;font-size:0.92rem;text-decoration:none;">
                ${isZh ? '申请触感样品手板' : 'Request Swatch Sample'}
              </a>
            </div>
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
  const highlights = parseAboutHighlights(company.aboutHighlights, [
    { value: company.establishedYear || '2015', num: parseInt(company.establishedYear || '2015', 10), label: isZh ? '创办年份' : 'Established', desc: 'A decade of soft living craftsmanship' },
    { value: '800,000 pcs', num: 800000, suffix: ' pcs', label: isZh ? '毛绒与靠垫月产能' : 'Monthly Output', desc: 'Automated cutting & needle detection' },
    { value: 'OEKO-TEX 100', label: isZh ? '国际母婴安全认证' : 'Baby Safe Cert', desc: 'Standard 100 Class I verified' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '检针全检保障' : 'Needle Checked', desc: 'Dual-sensor metal detector' },
  ]);
  const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="about" style="padding-top:90px;background:#fff7f9;min-height:100vh;">
      <section data-wr-modern-about class="wr-modern-about-responsive wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <!-- Organic Soft Atelier Dossier Layout -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:48px;align-items:center;margin-bottom:60px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#fce7f3;color:#db2777;padding:4px 14px;border-radius:9999px;font-size:0.8rem;font-weight:800;margin-bottom:16px;">
              ${isZh ? '关于我们的匠心软体工厂' : 'ABOUT OUR PLUSH & CUSHION ATELIER'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.4rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;line-height:1.2;margin:0 0 20px;">
              ${esc(headline)}
            </h1>
            <div style="color:#6b4f59;font-size:1.02rem;line-height:1.8;display:flex;flex-direction:column;gap:14px;margin-bottom:28px;">
              ${storyParagraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-left:3px solid #db2777;padding-left:16px;background:#ffffff;padding:14px 18px;border-radius:0 16px 16px 0;box-shadow:0 4px 16px rgba(236,72,153,0.03);">
              <div style="font-weight:800;color:#371b26;font-size:0.92rem;">${isZh ? '“每一寸毛绒与靠垫，都承载着治愈人心的温暖与对生命的呵护。”' : '“Every fiber and stitch brings comforting warmth and uncompromising safety.”'}</div>
              <div style="color:#831843;font-size:0.8rem;margin-top:4px;">${esc(company.name)} · Craftsmanship Council</div>
            </div>
          </div>

          <!-- Rounded Organic Atelier Photo Card -->
          <div style="position:relative;">
            <div style="border:1px solid #fce7f3;border-radius:32px;overflow:hidden;background:#ffffff;box-shadow:0 16px 40px rgba(236,72,153,0.06);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" data-wr-material-image="about-primary-image" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
            </div>
            <div style="position:absolute;bottom:20px;left:20px;background:rgba(55,27,38,0.88);backdrop-filter:blur(16px);color:#ffffff;padding:10px 18px;border-radius:14px;font-size:0.8rem;font-weight:800;">
              ✓ ${isZh ? '通过 BSCI 与 ISO9001 质量认证' : 'BSCI & ISO9001 Audited Facility'}
            </div>
          </div>
        </div>

        <!-- 4 Soft Cloud-Card Pods -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:60px;">
          ${highlights.map((h) => `
            <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:24px;padding:28px 20px;text-align:center;box-shadow:0 6px 20px rgba(236,72,153,0.02);">
              <div style="font-size:2.2rem;font-weight:900;color:#db2777;line-height:1;margin-bottom:8px;">
                ${esc(h.value)}
              </div>
              <div style="font-size:0.88rem;font-weight:800;color:#371b26;margin-bottom:4px;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.78rem;color:#831843;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Cleanroom Atelier Feature -->
        <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:28px;padding:36px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;align-items:center;">
          <div>
            <span style="font-size:0.78rem;font-weight:800;color:#db2777;letter-spacing:0.08em;text-transform:uppercase;">CLEANROOM ATELIER</span>
            <h2 style="font-size:1.6rem;font-weight:900;color:#371b26;margin:8px 0 12px;">${isZh ? '母婴级防尘除菌制造环境' : 'Dust-Free Cleanroom & Automated Sewing'}</h2>
            <p style="color:#6b4f59;font-size:0.92rem;line-height:1.7;margin:0 0 20px;">
              ${isZh ? '采用正压恒温无尘车间，定期紫外线杀菌除螨。从面料验布、自动分切到最后装箱，确保无异物、无过敏原。' : 'Positive pressure dust-free cleanroom with UV sanitation. From fabric inspection to vacuum pack cartons.'}
            </p>
            <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#db2777;color:#ffffff;font-weight:800;padding:12px 28px;border-radius:9999px;font-size:0.88rem;text-decoration:none;">
              ${isZh ? '预约实地审厂验厂' : 'Schedule Factory Tour'}
            </a>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.84rem;">
            <div style="background:#fdf2f8;border:1px solid #fce7f3;padding:18px;border-radius:16px;">
              <div style="color:#db2777;font-weight:800;margin-bottom:4px;">OEKO-TEX 100</div>
              <div style="color:#6b4f59;">母婴级安全标准</div>
            </div>
            <div style="background:#fdf2f8;border:1px solid #fce7f3;padding:18px;border-radius:16px;">
              <div style="color:#db2777;font-weight:800;margin-bottom:4px;">Needle Checked</div>
              <div style="color:#6b4f59;">100% 双探头金属检针</div>
            </div>
            <div style="background:#fdf2f8;border:1px solid #fce7f3;padding:18px;border-radius:16px;">
              <div style="color:#db2777;font-weight:800;margin-bottom:4px;">Vacuum Pack</div>
              <div style="color:#6b4f59;">真空压缩减积 70%</div>
            </div>
            <div style="background:#fdf2f8;border:1px solid #fce7f3;padding:18px;border-radius:16px;">
              <div style="color:#db2777;font-weight:800;margin-bottom:4px;">Fast Sampling</div>
              <div style="color:#10b981;">7天极速 3D 打样</div>
            </div>
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

  return `
    <main class="wr-inner wr-plush-inner" data-wr-page="contact" style="padding-top:90px;background:#fff7f9;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
        <header style="text-align:center;max-width:720px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:9999px;background:#fce7f3;color:#db2777;font-size:0.8rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
            ${esc(ui.contact)} · COMFORT TRADE INQUIRY
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#371b26;letter-spacing:-0.03em;margin:0 0 14px;">
            ${isZh ? '毛绒与靠垫大宗采购洽谈' : 'Direct Trade Inquiry & Custom Plush Quotes'}
          </h1>
          <p style="font-size:1.05rem;color:#64748b;line-height:1.65;margin:0;">
            ${isZh ? '支持 IP 形象定制、毛绒触感手板申请及批量出海阶梯报价。我们的产品专员将在 12 小时内与您接洽。' : 'Request plush swatches, custom IP prototypes, or wholesale volume quotes. Response within 12 hours.'}
          </p>
        </header>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;max-width:1040px;margin:0 auto;">
          <!-- Left Soft Studio Panel -->
          <div style="background:#371b26;color:#ffffff;border-radius:24px;padding:36px;box-shadow:0 12px 40px rgba(55,27,38,0.2);">
            <h2 style="font-size:1.35rem;font-weight:900;margin:0 0 16px;color:#ffffff;">${esc(company.name)}</h2>
            <p style="font-size:0.9rem;color:#e2d1d9;line-height:1.65;margin:0 0 28px;">
              ${isZh ? '母婴级健康软体与毛绒玩偶制造基地。服务全球家居品牌、跨国 IP 授权商及连锁百货。' : 'Baby-safe soft goods and plush manufacturing base serving global home brands and IP owners.'}
            </p>

            <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:18px;margin-bottom:28px;">
              <h3 style="font-size:0.84rem;font-weight:800;color:#f472b6;text-transform:uppercase;margin:0 0 10px;">${isZh ? '打样与大宗合作保障' : 'Production Commitments'}</h3>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#ffffff;line-height:1.7;">
                <li>${isZh ? '7个工作日完成毛绒玩偶 3D 实体初样' : 'Plush 3D physical sample in 7 business days'}</li>
                <li>${isZh ? '100% 通过金属检针与跌落抗撕裂测试' : '100% needle detection & seam strength passed'}</li>
                <li>${isZh ? '支持真空压缩包装，削减 70% 运费' : 'Vacuum pack cuts ocean shipping volume by 70%'}</li>
              </ul>
            </div>

            <div style="display:grid;gap:16px;font-size:0.9rem;">
              <div>
                <div style="font-size:0.75rem;font-weight:800;color:#f472b6;text-transform:uppercase;margin-bottom:4px;">Email Direct</div>
                <a href="mailto:${esc(company.email)}" style="color:#ffffff;text-decoration:none;font-weight:700;">${esc(company.email)}</a>
              </div>
              ${company.phone ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#f472b6;text-transform:uppercase;margin-bottom:4px;">Phone / WhatsApp</div>
                  <div style="color:#ffffff;font-weight:700;">${esc(company.phone)}</div>
                </div>
              ` : ''}
              ${company.address ? `
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#f472b6;text-transform:uppercase;margin-bottom:4px;">Factory Address</div>
                  <div style="color:#e2d1d9;line-height:1.5;">${esc(company.address)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Soft Goods RFQ Form -->
          <div style="background:#ffffff;border:1px solid #fce7f3;border-radius:24px;padding:36px;box-shadow:0 6px 20px rgba(236,72,153,0.02);">
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;gap:16px;">
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#371b26;margin-bottom:6px;">${isZh ? '您的姓名 / 采办代表' : 'Your Name'} *</label>
                <input name="name" autocomplete="name" required maxlength="120" placeholder="${isZh ? '例如：Sophia Miller' : 'e.g. Sophia Miller'}" style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid #fbcfe8;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#371b26;margin-bottom:6px;">${isZh ? '工作邮箱' : 'Business Email'} *</label>
                <input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="buyer@homegoods.com" style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid #fbcfe8;font-size:0.92rem;box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#371b26;margin-bottom:6px;">${isZh ? '意向毛绒/靠垫产品' : 'Product of Interest'} (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid #fbcfe8;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="">— ${isZh ? '选择参考毛绒或靠垫产品' : 'Select Reference Product'} —</option>
                  ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#371b26;margin-bottom:6px;">${isZh ? '定制类型与面料触感要求' : 'Customization & Filling Type'} (${esc(ui.optional)})</label>
                <select name="plushCategory" style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid #fbcfe8;font-size:0.92rem;background:#ffffff;box-sizing:border-box;">
                  <option value="plush_ip">${isZh ? '企业 IP 玩偶 / 吉祥物 3D 实体还原' : 'Custom IP Mascot Plush 3D Sampling'}</option>
                  <option value="memory_cushion">${isZh ? '人体工学减压记忆棉靠垫' : 'Slow-Rebound Ergonomic Memory Cushion'}</option>
                  <option value="baby_pillow">${isZh ? 'GOTS 有机棉母婴定型安抚枕' : 'GOTS Organic Cotton Infant Pillow'}</option>
                  <option value="weighted_plush">${isZh ? '感官重力微珠减压毛绒公仔' : 'Sensory Weighted Anxiety Plush'}</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.84rem;font-weight:800;color:#371b26;margin-bottom:6px;">${isZh ? '定制需求细节' : 'Inquiry Message'} *</label>
                <textarea name="message" required maxlength="5000" rows="3" placeholder="${isZh ? '请简述预估数量、尺寸高度、面料手感要求及交期...' : 'State your target volume, size/height, fabric feel, and deadline...'}" style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid #fbcfe8;font-size:0.92rem;box-sizing:border-box;font-family:inherit;"></textarea>
              </div>
              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;font-weight:800;padding:13px;border-radius:10px;font-size:0.95rem;border:none;cursor:pointer;margin-top:4px;box-shadow:0 6px 20px rgba(236,72,153,0.3);">
                ${isZh ? '提交软体定制与采购询盘 ↗' : 'Submit Soft Goods RFQ ↗'}
              </button>
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
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;

  const brand = company.logoAssetId
    ? `<img src="${esc(ctx.asset(company.logoAssetId))}" alt="${esc(company.name)}" style="height:34px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#371b26;">${esc(company.name)}</span>`;

  const depth = ctx.depth;
  const languageLinks = (draft.languages || ['zh', 'en'])
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:9999px;text-decoration:none;${l === ctx.lang ? 'background:#db2777;color:#ffffff;' : 'color:#831843;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-plush-header" style="position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(20px);border-bottom:1px solid #fce7f3;box-shadow:0 2px 10px rgba(236,72,153,0.03);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;gap:16px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
          ${brand}
        </a>
        <nav aria-label="${esc(ui.menu)}" style="display:flex;align-items:center;gap:26px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'home' ? '#db2777' : '#371b26'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'catalog' ? '#db2777' : '#371b26'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'about' ? '#db2777' : '#371b26'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.9rem;font-weight:800;color:${page === 'contact' ? '#db2777' : '#371b26'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')} style="background:#db2777;color:#ffffff;font-weight:800;padding:8px 18px;border-radius:9999px;font-size:0.84rem;text-decoration:none;">
            ${isZh ? '索样与定制 ↗' : 'Inquire RFQ ↗'}
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
    <footer style="background:#201018;color:#d1b5c2;padding:48px 0 24px;font-size:0.86rem;border-top:1px solid #371b26;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:36px;margin-bottom:32px;">
        <div>
          <div style="font-size:1.25rem;font-weight:900;color:#ffffff;margin-bottom:10px;">${esc(company.name)}</div>
          <p style="font-size:0.84rem;line-height:1.65;color:#d1b5c2;margin:0 0 12px;">
            ${isZh ? '母婴级健康软体与精品毛绒玩偶出海供应链。严选环保低碳无毒面料、高回弹记忆棉与无尘洁净制造。' : 'Baby-safe soft living and plush toy manufacturing studio for international brands.'}
          </p>
          <div style="font-size:0.78rem;color:#f472b6;font-weight:700;">OEKO-TEX 100 · GOTS · ISO 8124 · CE Safety · ISO9001</div>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li><a style="text-decoration:none;color:#d1b5c2;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '人体工学减压靠垫' : 'Ergonomic Cushions'}</a></li>
            <li><a style="text-decoration:none;color:#d1b5c2;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '萌系治愈毛绒玩偶' : 'Kawaii Plush Toys'}</a></li>
            <li><a style="text-decoration:none;color:#d1b5c2;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '婴童安抚与定型枕' : 'Infant Soothing Bedding'}</a></li>
            <li><a style="text-decoration:none;color:#d1b5c2;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '感官重力安抚抱枕' : 'Weighted Sensory Plush'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${isZh ? '工坊制造实力' : 'Atelier Metrics'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:0.82rem;">
            <li>✓ ${isZh ? '800,000 件毛绒与靠垫月产能' : '800,000 Pcs Monthly Output'}</li>
            <li>✓ ${isZh ? '100% 正压恒温无尘车间制造' : '100% Cleanroom Manufacturing'}</li>
            <li>✓ ${isZh ? '0.8mm 双探头金属检针全检' : '0.8mm Dual Needle Detection'}</li>
            <li>✓ ${isZh ? '7天极速 3D 实体毛绒打板交付' : '7-Day Fast 3D Plush Sampling'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.86rem;font-weight:800;color:#ffffff;margin:0 0 12px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 6px;"><strong>Email:</strong> <a style="color:#f472b6;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 6px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.8rem;color:#d1b5c2;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #371b26;padding-top:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:0.8rem;color:#d1b5c2;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>☁️ ${isZh ? '毛绒玩偶与健康靠垫出海制造旗舰版' : 'Plush & Cushions Global Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
