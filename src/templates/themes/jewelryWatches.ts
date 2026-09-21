import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export interface ThemedItem {
  id: string;
  name: string;
  description: string;
  desc?: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  spec1: string;
  spec2: string;
  moq: string;
  tagline: string;
  img: string;
}

export const DEFAULT_PRODUCTS: ThemedItem[] = [
  {
    "id": "jew-1",
    "name": "Aurora Constellation 18K White Gold Solitaire Pendant",
    "description": "3.0ct D-Color Flawless Hearts & Arrows solitaire diamond set in 18K white gold micro-pave celestial halo on delicate diamond-cut cable chain.",
    "badge": "High Fine Jewelry",
    "category": "necklace",
    "categoryNameZh": "18K白金莫桑钻奢华星芒吊坠",
    "categoryNameEn": "Solitaire Pendants",
    "spec1": "18K White Gold (Au750) · 3.0ct D/VVS1 Ideal Cut",
    "spec2": "45cm Diamond-Cut Adjustable Chain (4.2g)",
    "moq": "50 Pcs per Design",
    "tagline": "Light Captured for Eternity",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "jew-2",
    "name": "Chronometer Certified Flying Tourbillon Openworked Mechanical Watch",
    "description": "Manual-wind skeletonized flying tourbillon movement with 72-hour power reserve, Côtes de Genève finishing, encased in polished 316L stainless steel.",
    "badge": "Grand Complication",
    "category": "watch",
    "categoryNameZh": "瑞士天文台精密镂空飞行陀飞轮机械腕表",
    "categoryNameEn": "Flying Tourbillon Watches",
    "spec1": "In-House Flying Tourbillon Caliber · 28,800 vph · 72h Reserve",
    "spec2": "42mm Case · 11.2mm Thickness · 50m Waterproof",
    "moq": "30 Pcs per Batch",
    "tagline": "Gravity Defied on the Wrist",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "jew-3",
    "name": "Royal Emerald-Cut Pavé Diamond Solitaire Engagement Ring 5.0ct",
    "description": "Architectural stepped emerald-cut centerpiece framed by tapered baguette side stones and hidden diamond collar in solid 950 platinum.",
    "badge": "Haute Solitaire",
    "category": "ring",
    "categoryNameZh": "皇家祖母绿切割密镶满钻高级定制戒",
    "categoryNameEn": "Emerald-Cut Rings",
    "spec1": "950 Platinum (Pt950) · 5.0ct Equivalent Ratio 1.45",
    "spec2": "Hidden Halo with 0.45ct Pavé Diamond Band",
    "moq": "30 Pcs per Custom Order",
    "tagline": "Architectural Geometric Purity",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "jew-4",
    "name": "Italian Hand-Hammered Rigato 18K Yellow Gold Bangle",
    "description": "Master handcrafted Italian Renaissance rigato engraving on heavy 18K yellow gold hinged cuff, adorned with bezel-set rose-cut diamonds.",
    "badge": "Italian Atelier",
    "category": "bracelet",
    "categoryNameZh": "意式18K黄金手工锤目纹雕金手镯",
    "categoryNameEn": "Rigato Gold Bangles",
    "spec1": "Solid 18K Yellow Gold (Au750) · 28.5g Net Weight",
    "spec2": "Concealed Safety Clasp · Oval Ergonomic Contour",
    "moq": "40 Pcs per Batch",
    "tagline": "Renaissance Goldsmith Heritage",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "jew-5",
    "name": "Tahitian Peacock Black Pearl 12mm Drop Earrings",
    "description": "Lustrous exotic Tahitian cultured black pearls with vibrant peacock overtone, suspended from 18K white gold diamond drop florets.",
    "badge": "Exotic Lustre",
    "category": "earrings",
    "categoryNameZh": "大溪地黑珍珠孔雀绿晕彩18K金耳饰",
    "categoryNameEn": "Tahitian Pearl Earrings",
    "spec1": "12-13mm AAA Tahitian Cultured Pearls · 18K White Gold",
    "spec2": "0.36ct Brilliant Round Diamond Accents",
    "moq": "50 Pairs per Batch",
    "tagline": "Deep Ocean Iridescent Mystery",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "jew-6",
    "name": "Celestial Moonphase Perpetual Calendar Ultra-Thin Watch",
    "description": "Aventurine deep-blue sparkling night-sky dial with golden photorealistic moonphase disc, automatic micro-rotor movement, and hand-rolled alligator leather.",
    "badge": "Astronomical Poetry",
    "category": "watch",
    "categoryNameZh": "月相万年历超薄深蓝星空盘机械腕表",
    "categoryNameEn": "Moonphase Watches",
    "spec1": "Micro-Rotor Ultra-Thin Automatic Caliber (3.8mm thin)",
    "spec2": "40mm Solid 316L / Rose Gold PVD · Real Aventurine Dial",
    "moq": "50 Pcs per Colorway",
    "tagline": "Cosmic Motion Encased in Glass",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "jew-7",
    "name": "Art Deco Cushion-Cut Royal Blue Sapphire Brooch & Pendant",
    "description": "Multi-wear dual brooch/pendant featuring an unheated royal blue Ceylon sapphire framed by geometric Art Deco platinum diamond scrolls.",
    "badge": "Vintage Heritage",
    "category": "necklace",
    "categoryNameZh": "高定枕形切割天然蓝宝石吊坠胸针",
    "categoryNameEn": "Royal Sapphire Brooches",
    "spec1": "18K White Gold & Platinum · 4.2ct Royal Blue Center",
    "spec2": "Dual Pin Brooch Mechanism + Concealed Bail",
    "moq": "20 Pcs Custom Run",
    "tagline": "Sovereign Aristocratic Glamour",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "jew-8",
    "name": "Titanium Featherweight Minimalist Bauhaus Automatic Watch",
    "description": "Grade 5 satin-finished aerospace titanium case weighing only 52 grams, featuring Bauhaus clean typography, heat-blued steel hands, and Cordura strap.",
    "badge": "Pure Minimalist",
    "category": "watch",
    "categoryNameZh": "极简北欧拉丝钛金属超轻商务机械表",
    "categoryNameEn": "Titanium Minimalist Watches",
    "spec1": "Grade 5 Aerospace Titanium · High-Beat Automatic 28,800 vph",
    "spec2": "38.5mm Case · 52g Total Weight · Sapphire Anti-Glare",
    "moq": "100 Pcs per Batch",
    "tagline": "Bauhaus Functional Serenity",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderJewelryPage(ctx: ThemeContext, isVideo: boolean): string {
  const {
    draft,
    options,
    color,
    brandInk,
    lang,
    page,
    path,
    navAttrs,
    ui,
  } = ctx;
  const isZh = (lang as string) === 'zh';
  const company = draft.company;

  const products = (draft.products && draft.products.length > 0
    ? (isTypedMaterialsSource(draft)
        ? draft.products.map((p) => ({
            id: p.id,
            imageAssetId: p.imageAssetId,
            name: ctx.translateProduct(p).name || p.name,
            description: ctx.translateProduct(p).description || p.description,
            desc: ctx.translateProduct(p).description || p.description,
            badge: '',
            category: 'default',
            categoryNameZh: '高级珠宝与腕表殿堂',
            categoryNameEn: 'Haute Horlogerie & High Jewelry Guild',
            spec1: p.material || '',
            spec2: p.dimensions || '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : DEFAULT_PRODUCTS) as (Product | ThemedItem)[];

  const heroTitle = isZh ? '微距璀璨 · 瑞士制表与高定珠宝全链工坊' : 'Timeless Brilliance & Haute Horlogerie Craft Guild';
  const heroSubtitle = isZh ? '从八心八箭莫桑钻石高定珠宝、18K黄金手工雕金饰品到瑞士天文台精密镂空飞行陀飞轮机械腕表，为全球奢侈品牌提供无与伦比的光影切面、顶级宝石镶嵌与高精机械研发。' : 'From Hearts & Arrows solitaire fine jewelry and 18K hand-engraved gold pieces to chronometer-certified skeleton flying tourbillon watches, empowering world luxury brands with pinnacle craftsmanship.';

  const defaultMeta = DEFAULT_PRODUCTS[0];
  const isDetail = page === 'detail';
  const selectedProduct = (isDetail
    ? products.find((p) => p.id === options.productId) || products[0]
    : products[0]) || defaultMeta;

  const pMeta = (selectedProduct as ThemedItem)?.spec1
    ? (selectedProduct as ThemedItem)
    : defaultMeta;

  const headerHtml = `
    <header class="theme-header" style="position:sticky;top:0;z-index:99;background:rgba(15, 23, 42, 0.78);backdrop-filter:blur(24px) saturate(190%);-webkit-backdrop-filter:blur(24px) saturate(190%);border-bottom:1px solid rgba(255,255,255,0.12);box-shadow:0 8px 32px rgba(0,0,0,0.37);">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:74px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg, ${color}, #ca8a04);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M6 3h12l4 6-10 12L2 9l4-6zM11 3L8 9l4 12 4-12-3-6M2 9h20"/></svg>
          </div>
          <div>
            <div style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || 'Haute Horlogerie & High Jewelry Guild')}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:#D4AF37;font-weight:700;">
              ${isZh ? '高级珠宝与腕表殿堂' : 'Haute Horlogerie & High Jewelry Guild'}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:28px;" class="theme-nav-links">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'home' ? '#D4AF37' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'catalog' ? '#D4AF37' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'about' ? '#D4AF37' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'contact' ? '#D4AF37' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:100px;font-size:0.86rem;font-weight:700;color:#ffffff;background:linear-gradient(135deg, ${color}, #ca8a04);box-shadow:0 4px 18px rgba(0,0,0,0.35);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
            <span>${isZh ? '立即询盘定制' : 'Request Inquiry'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    const heroPoster = '/templates/senseng/hero-sky.jpg';
    const heroMedia = isVideo
      ? `
        <div style="position:relative;width:100%;height:100vh;min-height:680px;overflow:hidden;background:#050811;">
          <video autoplay loop muted playsinline poster="${esc(heroPoster)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.42;">
            <source src="${esc(safeUrl(ctx.asset(draft.heroAssetId)))}" type="video/mp4">
          </video>
          <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(15,23,42,0.4) 0%, rgba(5,8,17,0.85) 100%);"></div>
          <div class="wrap" style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;max-width:960px;">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:100px;background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.18);margin-bottom:20px;" data-reveal="fade-up">
              <span style="width:8px;height:8px;border-radius:50%;background:#D4AF37;box-shadow:0 0 10px #D4AF37;"></span>
              <span style="color:#ffffff;font-size:0.82rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '高级珠宝与腕表殿堂 · 4K全景动态短片' : 'Haute Horlogerie & High Jewelry Guild · 4K Cinematic Master'}</span>
            </div>
            <h1 style="font-size:clamp(2.4rem, 5.5vw, 4.2rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.12;margin:0 0 20px;" data-reveal="fade-up">
              ${esc(heroTitle)}
            </h1>
            <p style="font-size:clamp(1.05rem, 1.8vw, 1.3rem);line-height:1.6;color:#cbd5e1;margin:0 0 32px;max-width:760px;" data-reveal="fade-up">
              ${esc(heroSubtitle)}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #ca8a04);box-shadow:0 8px 24px rgba(0,0,0,0.4);display:inline-flex;align-items:center;gap:10px;">
                <span>${esc(ui.allProducts)}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 32px;border-radius:100px;font-size:1rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);">
                ${isZh ? '项目打样咨询' : 'Request Quotation'}
              </a>
            </div>
          </div>
          <div style="position:absolute;bottom:30px;right:40px;z-index:3;display:flex;gap:10px;">
            <button id="theme-video-toggle" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:8px 16px;border-radius:100px;font-size:0.8rem;font-weight:600;cursor:pointer;">Play / Pause</button>
            <button id="theme-mute-toggle" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:8px 16px;border-radius:100px;font-size:0.8rem;font-weight:600;cursor:pointer;">Sound On / Off</button>
          </div>
        </div>
      `
      : `
        <div style="position:relative;width:100%;min-height:640px;background:linear-gradient(135deg, #0a0f1d 0%, #172033 50%, #0a0f1d 100%);overflow:hidden;padding:100px 0 80px;display:flex;align-items:center;">
          <div style="position:absolute;top:-20%;right:-10%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle, #D4AF3726 0%, transparent 70%);filter:blur(80px);pointer-events:none;"></div>
          <div class="wrap" style="position:relative;z-index:2;display:grid;grid-template-columns:1.2fr 0.8fr;gap:50px;align-items:center;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:100px;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);margin-bottom:20px;" data-reveal="fade-up">
                <span style="color:#D4AF37;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isZh ? '高级珠宝与腕表殿堂' : 'Haute Horlogerie & High Jewelry Guild'}</span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 4.8vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 20px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:1.15rem;line-height:1.7;color:#cbd5e1;margin:0 0 32px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #ca8a04);box-shadow:0 8px 24px rgba(0,0,0,0.35);display:inline-flex;align-items:center;gap:10px;">
                  <span>${esc(ui.allProducts)}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 32px;border-radius:100px;font-size:1rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);">
                  ${isZh ? '项目打样咨询' : 'Request Quotation'}
                </a>
              </div>
            </div>

            <!-- 3D Liquid Glass Highlight Card -->
            <div style="background:rgba(255,255,255,0.04);backdrop-filter:blur(30px) saturate(180%);border:1px solid rgba(255,255,255,0.16);border-radius:28px;padding:32px;box-shadow:0 24px 60px rgba(0,0,0,0.5);" data-reveal="fade-up">
              <div style="font-size:0.76rem;letter-spacing:0.12em;text-transform:uppercase;color:#D4AF37;font-weight:800;margin-bottom:12px;">
                ${isZh ? '匠作核心优势' : 'CRAFT PILLARS'}
              </div>
              <h3 style="font-size:1.4rem;font-weight:800;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '八心八箭顶级光学切工' : 'Ideal Cut & Hearts & Arrows Fire'}
              </h3>
              <p style="font-size:0.92rem;line-height:1.6;color:#94a3b8;margin:0 0 24px;">
                ${isZh ? '严格遵循 57 面的黄金比例对称切磨，折射出极致的火彩、亮光与闪光光学表现。' : 'Strict mathematical symmetry across 57 facet angles, unlocking maximum fire, brilliance and scintillation.'}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#ffffff;">${esc('100% GIA')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '钻石宝石权威检测标准' : 'Certified Authenticity'}</div>
                </div>
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#D4AF37;">${esc('±3 sec')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '瑞士天文台级日走时公差' : 'Chronometer Daily Precision'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    mainHtml = `
      <main id="main">
        <section class="theme-hero-section">
          ${heroMedia}
        </section>

        <!-- 4 Craftsmanship Pillars -->
        <section class="wrap" style="padding:90px 0 60px;">
          <div style="text-align:center;max-width:700px;margin:0 auto 50px;" data-reveal="fade-up">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#D4AF37;margin-bottom:10px;">
              ${isZh ? '核心工艺矩阵' : 'CORE CAPABILITIES'}
            </div>
            <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${isZh ? '世界级工艺制造标准' : 'World-Class Manufacturing Standards'}
            </h2>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#D4AF37;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  01
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '八心八箭顶级光学切工' : 'Ideal Cut & Hearts & Arrows Fire'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '严格遵循 57 面的黄金比例对称切磨，折射出极致的火彩、亮光与闪光光学表现。' : 'Strict mathematical symmetry across 57 facet angles, unlocking maximum fire, brilliance and scintillation.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#D4AF37;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  02
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '18K金与 950 纯铂金精密铸造' : '18K Solid Gold & 950 Platinum Casting'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '真空无氧高频熔铸工艺，彻底杜绝砂眼与微孔，表面辅以微米级意大利手工拉丝工艺。' : 'Oxygen-free vacuum induction casting ensuring zero porosity, paired with Italian hand-brushed satin finishes.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#D4AF37;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  03
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '显微镜下微镶与轨道镶嵌' : 'Microscopic Pave & Channel Gem-Setting'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '在 40 倍显微立体镜下逐颗精密铲边逼镶，爪尖圆润不挂丝织物，牢固度终身保证。' : 'Micro-pavé gem setting under 40x stereoscopic optics, flawlessly rounded prongs and lifetime stone security.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#D4AF37;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  04
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '瑞士级精密机械避震与陀飞轮' : 'Swiss Chronometer Escapement & Tourbillon'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '28,800vph 高频微调游丝摆轮，抗磁硅游丝配平重螺钉，日误差稳定在 ±3 秒天文台标准。' : '28,800 vph high-frequency silicon balance spring, anti-magnetic architecture, chronometer-grade ±3s/day stability.'}
                </p>
              </div>
            
          </div>
        </section>

        <!-- 8-Product Showcase Grid -->
        <section class="wrap" style="padding:40px 0 90px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
            <div>
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#D4AF37;margin-bottom:8px;">
                ${isZh ? '精选品类橱窗' : 'FLAGSHIP COLLECTION'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0;">
                ${isZh ? '高级珠宝与腕表殿堂经典作品系列' : 'Haute Horlogerie & High Jewelry Guild Catalog Showcase'}
              </h2>
            </div>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:#D4AF37;display:inline-flex;align-items:center;gap:6px;">
              <span>${esc(ui.allProducts)}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.slice(0, 8).map((item, idx) => {
              const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
              return `
                <article style="background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);" class="wr-card-hover" data-reveal="fade-up">
                  <div style="position:relative;width:100%;padding-top:100%;overflow:hidden;background:#0d1322;">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;" loading="lazy">
                    ${meta.badge ? `<span style="position:absolute;top:14px;left:14px;padding:4px 12px;border-radius:100px;font-size:0.74rem;font-weight:800;color:#ffffff;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);">${esc(meta.badge)}</span>` : ''}
                  </div>
                  <div style="padding:22px;">
                    <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:#D4AF37;text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Haute Horlogerie & High Jewelry Guild')}
                    </div>
                    <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;line-height:1.35;margin:0 0 8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em;">
                      ${esc(item.name)}
                    </h3>
                    <p style="font-size:0.84rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:3.1em;">
                      ${esc(item.description || '')}
                    </p>
                    <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;">
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:100px;background:rgba(255,255,255,0.06);color:#ffffff;font-size:0.82rem;font-weight:700;border:1px solid rgba(255,255,255,0.15);transition:all 0.2s;">
                        ${esc(ui.details)} ↗
                      </a>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Technical QC Section -->
        <section style="background:linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(5,8,17,0.9) 100%);padding:90px 0;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
          <div class="wrap">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;" data-reveal="fade-up">
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#D4AF37;margin-bottom:10px;">
                ${isZh ? '严苛检测与认证' : 'TECHNICAL LAB STANDARDS'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '高级珠宝鉴定与瑞士制表品控体系' : 'Gemological Standards & Swiss Horology Inspection'}
              </h2>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#D4AF37;margin-bottom:10px;">01</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? 'GIA & IGI 国际权威宝石全光谱检测' : 'Full-Spectrum Gemological Certification'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '每颗主石均配备专属激光防伪腰码与国际权威机构证书，确保色彩、净度与切工真实无欺。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#D4AF37;margin-bottom:10px;">02</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '瑞士五方位机芯走时调校' : '5-Position Chronometric Movement Regulation'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '在冷热交替温控箱及五种佩戴角度下连续历经 15 天严格走时测试，确保机械卓越准度。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#D4AF37;margin-bottom:10px;">03</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '高气压与深水 100 米水密密封测试' : '10 ATM Waterproof Pressure Testing'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '双 O 型氟橡胶防水圈与旋入式蓝宝石底盖，通过高压真空与深水水压双重气密性实验。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#D4AF37;margin-bottom:10px;">04</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '莫氏硬度 9 级双曲面蓝宝石透镜' : 'Double-Domed AR Sapphire Crystal'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '内外双面 5 层抗反射无色增透膜，透光率高达 99.2%，强光之下如若无物清澈通透。' : 'undefined'}
                  </p>
                </div>
              
            </div>
          </div>
        </section>

        <!-- Metric Counters -->
        <section class="wrap" style="padding:80px 0;" data-reveal="fade-up">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;">
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="100" data-suffix="% GIA">
                  100% GIA
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '钻石宝石权威检测标准' : 'Certified Authenticity'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Laser inscribed girdle</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="3" data-suffix=" sec">
                  ±3 sec
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '瑞士天文台级日走时公差' : 'Chronometer Daily Precision'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">COSC standard</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="500000" data-suffix="+">
                  500,000+
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '年度高定饰品与腕表出货' : 'Annual Luxury Pieces'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Worldwide luxury houses</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="7" data-suffix=" Days">
                  7-10 Days
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '3D起版与蜡模高精度交付' : 'Rapid Master Model Sample'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Wax 3D printing</div>
              </div>
            
          </div>
        </section>

        <!-- Inquiry Banner -->
        <section class="wrap" style="padding:0 0 90px;">
          <div style="padding:50px 40px;border-radius:28px;background:linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);border:1px solid rgba(255,255,255,0.12);text-align:center;max-width:900px;margin:0 auto;" data-reveal="fade-up">
            <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${isZh ? '开启您的专属品牌供应链合作' : 'Initiate Your Custom Supply Partnership'}
            </h2>
            <p style="font-size:1.05rem;line-height:1.65;color:#94a3b8;margin:0 auto 30px;max-width:640px;">
              ${isZh ? '支持 OEM / ODM 深度定制，快速提供首版样品打样与权威质量检测报告。' : 'Supporting private label OEM/ODM, rapid prototyping, and accredited test compliance.'}
            </p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 38px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #ca8a04);display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 25px rgba(0,0,0,0.4);">
              <span>${isZh ? '立即咨询与打样' : 'Submit Project Inquiry'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </section>
      </main>
    `;
  } else if (page === 'catalog') {
    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="margin-bottom:40px;">
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#D4AF37;margin-bottom:6px;">
            ${esc(company.name || 'Haute Horlogerie & High Jewelry Guild')}
          </div>
          <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
            ${esc(ui.catalog)}
          </h1>
          <p style="font-size:1rem;color:#94a3b8;margin:0;">
            ${isZh ? '浏览全系高标准生产品项，支持根据客户规格、品牌包装与认证指标进行定制。' : 'Explore full manufacturing collection, engineered to custom specifications.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
          ${products.map((item, idx) => {
            const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length]!;
            const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
            return `
              <article style="background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                <div style="position:relative;width:100%;padding-top:100%;overflow:hidden;background:#0d1322;">
                  <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                  ${meta.badge ? `<span style="position:absolute;top:14px;left:14px;padding:4px 12px;border-radius:100px;font-size:0.74rem;font-weight:800;color:#ffffff;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);">${esc(meta.badge)}</span>` : ''}
                </div>
                <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                  <h2 style="font-size:1.15rem;font-weight:800;color:#ffffff;line-height:1.35;margin:0 0 8px;">
                    ${esc(item.name)}
                  </h2>
                  <p style="font-size:0.85rem;color:#94a3b8;line-height:1.6;margin:0 0 16px;flex:1;">
                    ${esc(item.description || '')}
                  </p>
                  <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:100px;background:linear-gradient(135deg, ${color}, #ca8a04);color:#ffffff;font-size:0.82rem;font-weight:700;">
                      ${esc(ui.details)} ↗
                    </a>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </main>
    `;
  } else if (page === 'detail') {
    const meta = (selectedProduct as ThemedItem).spec1 ? (selectedProduct as ThemedItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img;

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <nav aria-label="Breadcrumb" style="font-size:0.84rem;color:#94a3b8;margin-bottom:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#cbd5e1;text-decoration:none;">${esc(ui.home)}</a>
          <span style="margin:0 8px;">/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#cbd5e1;text-decoration:none;">${esc(ui.catalog)}</a>
          <span style="margin:0 8px;">/</span>
          <span style="color:#D4AF37;">${esc(selectedProduct.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
          <!-- Product Image -->
          <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);position:relative;">
            <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
          </div>

          <!-- Product Details -->
          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#D4AF37;margin-bottom:10px;">
              ${esc(meta.categoryNameEn || 'Haute Horlogerie & High Jewelry Guild')}
            </div>
            <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 16px;">
              ${esc(selectedProduct.name)}
            </h1>
            <p style="font-size:1.05rem;line-height:1.7;color:#cbd5e1;margin:0 0 24px;">
              ${esc(selectedProduct.description || '')}
            </p>

            <div style="padding:20px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:28px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.88rem;">
                <div>
                  <span style="color:#64748b;display:block;">${isZh ? '材质规格' : 'Material Spec'}:</span>
                  <strong style="color:#ffffff;">${esc(meta.spec1 || (selectedProduct as any).material || 'Custom Specification')}</strong>
                </div>
                <div>
                  <span style="color:#64748b;display:block;">${isZh ? '尺寸容量' : 'Dimensions'}:</span>
                  <strong style="color:#ffffff;">${esc(meta.spec2 || (selectedProduct as any).dimensions || 'Standard Export Spec')}</strong>
                </div>
              </div>
            </div>

            <!-- Inquiry Box -->
            <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);">
              <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 8px;">
                ${isZh ? '申请此款产品样品与报价单' : 'Request Quotation & Physical Sample'}
              </h3>
              <p style="font-size:0.86rem;color:#94a3b8;margin:0 0 16px;">
                ${isZh ? '支持专属 LOGO 激光雕刻、包装盒定制与权威质检报告交付。' : 'Support private labeling, custom packaging, and compliance testing.'}
              </p>
              <form action="${path('contact/index.html')}" method="GET" style="display:flex;flex-direction:column;gap:12px;">
                <input type="hidden" name="productId" value="${esc(selectedProduct.id)}" />
                <input type="email" placeholder="${isZh ? '输入您的企业采购邮箱' : 'Enter your corporate business email'}" required style="padding:12px 18px;border-radius:10px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.18);color:#ffffff;font-size:0.9rem;outline:none;" />
                <button type="submit" style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #ca8a04);color:#ffffff;font-size:0.96rem;font-weight:800;border:none;cursor:pointer;">
                  ${isZh ? '提交样品打样申请' : 'Submit Sample Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, isZh ? '微距璀璨 · 瑞士制表与高定珠宝全链工坊' : 'Timeless Brilliance & Haute Horlogerie Craft Guild');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Craftsmanship heritage' },
      { value: '100% GIA', num: 100, suffix: '% GIA', label: isZh ? '钻石宝石权威检测标准' : 'Certified Authenticity', desc: 'Laser inscribed girdle' },
      { value: '±3 sec', num: 3, suffix: ' sec', label: isZh ? '瑞士天文台级日走时公差' : 'Chronometer Daily Precision', desc: 'COSC standard' },
      { value: '7-10 Days', num: 7, suffix: ' Days', label: isZh ? '3D起版与蜡模高精度交付' : 'Rapid Master Model Sample', desc: 'Wax 3D printing' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:800px;margin:0 auto 60px;text-align:center;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#D4AF37;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
            ${isZh ? '关于我们的匠心制造' : 'ABOUT OUR CRAFT GUILD'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 20px;">
            ${esc(aboutHeadline)}
          </h1>
          <div style="display:flex;flex-direction:column;gap:18px;font-size:1.05rem;line-height:1.8;color:#cbd5e1;text-align:left;">
            ${paragraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
          </div>
        </div>

        <!-- Metric Counters -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;margin-bottom:70px;">
          ${highlights.map((h) => `
            <div style="padding:32px 24px;border-radius:20px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);text-align:center;">
              <div style="font-size:2.8rem;font-weight:900;color:#D4AF37;line-height:1;"><span>${esc(h.value)}</span></div>
              <div style="font-size:0.86rem;color:#94a3b8;margin-top:10px;font-weight:600;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.8rem;color:#64748b;margin-top:4px;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Factory Imagery -->
        <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:60px;">
          <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:460px;object-fit:cover;display:block;" loading="lazy">
        </div>
      </main>
    `;
  } else if (page === 'contact') {
    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:800px;margin:0 auto 50px;text-align:center;">
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#D4AF37;margin-bottom:8px;">
            ${esc(company.name || 'Haute Horlogerie & High Jewelry Guild')}
          </div>
          <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
            ${esc(ui.contact)}
          </h1>
          <p style="font-size:1rem;color:#94a3b8;margin:0;">
            ${isZh ? '直接与我们的工程与制造团队沟通，获取精准技术参数、定制打样与采购报价。' : 'Connect directly with our engineering and production teams for quotes and samples.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:50px;align-items:flex-start;">
          <!-- Contact Details -->
          <div style="padding:36px;border-radius:24px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
            <h3 style="font-size:1.3rem;font-weight:800;color:#ffffff;margin:0 0 20px;">
              ${isZh ? '全球商务与制造基地' : 'Global Headquarters & Facilities'}
            </h3>
            <div style="display:flex;flex-direction:column;gap:16px;font-size:0.92rem;color:#cbd5e1;">
              <div><strong>Email:</strong> <a style="color:#D4AF37;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></div>
              ${company.phone ? `<div><strong>Phone:</strong> ${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div><strong>Address:</strong> ${esc(company.address)}</div>` : ''}
            </div>
          </div>

          <!-- Contact Form -->
          <div style="padding:36px;border-radius:24px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);">
            <h3 style="font-size:1.3rem;font-weight:800;color:#ffffff;margin:0 0 20px;">
              ${isZh ? '填写询价与定制需求' : 'Submit Project Inquiry'}
            </h3>
            <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">${isZh ? '联系人姓名' : 'Your Name'} *</label>
                  <input name="name" autocomplete="name" required maxlength="120" type="text" style="width:100%;padding:12px 16px;border-radius:10px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.12);color:#ffffff;font-size:0.9rem;box-sizing:border-box;" />
                </div>
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">${isZh ? '企业电子邮箱' : 'Business Email'} *</label>
                  <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:12px 16px;border-radius:10px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.12);color:#ffffff;font-size:0.9rem;box-sizing:border-box;" />
                </div>
              </div>

              <div>
                <label style="display:block;font-size:0.82rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">${isZh ? '意向产品' : 'Interested Product'} (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:12px 16px;border-radius:10px;background:#0f172a;border:1px solid rgba(255,255,255,0.12);color:#ffffff;font-size:0.9rem;box-sizing:border-box;">
                  <option value="">— ${isZh ? '选择感兴趣的产品' : 'Select Product of Interest'} —</option>
                  ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label style="display:block;font-size:0.82rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">${isZh ? '项目说明与技术要求' : 'Project Details & Specifications'} *</label>
                <textarea name="message" required maxlength="5000" rows="4" style="width:100%;padding:12px 16px;border-radius:10px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.12);color:#ffffff;font-size:0.9rem;resize:vertical;box-sizing:border-box;"></textarea>
              </div>

              <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>

              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #ca8a04);color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;">
                ${isZh ? '发送定制询盘' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </main>
    `;
  }

  const footerHtml = `
    <footer style="background:#050811;border-top:1px solid rgba(255,255,255,0.1);padding:60px 0 30px;color:#94a3b8;font-size:0.88rem;">
      <div class="wrap" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg, ${color}, #ca8a04);display:flex;align-items:center;justify-content:center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M6 3h12l4 6-10 12L2 9l4-6zM11 3L8 9l4 12 4-12-3-6M2 9h20"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Haute Horlogerie & High Jewelry Guild')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#64748b;margin:0 0 16px;max-width:320px;">
            ${isZh ? '高级珠宝与腕表殿堂 · 全球品质供应链' : 'Haute Horlogerie & High Jewelry Guild · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '18K白金莫桑钻奢华星芒吊坠' : 'Solitaire Pendants'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '瑞士天文台精密镂空飞行陀飞轮机械腕表' : 'Flying Tourbillon Watches'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '皇家祖母绿切割密镶满钻高级定制戒' : 'Emerald-Cut Rings'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺实力' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('100% GIA')} ${isZh ? '钻石宝石权威检测标准' : 'Certified Authenticity'}</li>
            <li>✓ ${esc('±3 sec')} ${isZh ? '瑞士天文台级日走时公差' : 'Chronometer Daily Precision'}</li>
            <li>✓ ${esc('500,000+')} ${isZh ? '年度高定饰品与腕表出货' : 'Annual Luxury Pieces'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#D4AF37;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #111827;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '高级珠宝与腕表殿堂旗舰版' : 'Haute Horlogerie & High Jewelry Guild Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
