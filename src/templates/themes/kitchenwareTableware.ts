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
    "id": "kit-1",
    "name": "67-Layer Damascus VG-10 Steel Master Chef Knife Set",
    "description": "Flagship 8-inch chef knife forged with 67 layers of Damascus steel over a high-carbon VG-10 core, finished with an ergonomic stabilized burl wood handle.",
    "badge": "Michelin Chef",
    "category": "knives",
    "categoryNameZh": "67层大马士革VG-10核心主厨刀礼盒组",
    "categoryNameEn": "Damascus Chef Knives",
    "spec1": "67-Layer Damascus + VG-10 Core (HRC 60±2) · 15° Honed Edge",
    "spec2": "8\" Blade (20cm) · Octagonal Stabilized Burl Handle · 210g",
    "moq": "50 Sets per Order",
    "tagline": "Razor Surgical Precision in Every Slice",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "kit-2",
    "name": "French Gradient Enamelled Cast Iron Dutch Oven 26cm",
    "description": "Heavyweight cast iron cocotte featuring 3-layer gradient porcelain enamel, interior moisture-lock condensation dots, and heat-proof gold knob.",
    "badge": "Culinary Cocotte",
    "category": "castiron",
    "categoryNameZh": "法式经典重型渐变珐琅铸铁微压圆煲",
    "categoryNameEn": "Enameled Dutch Ovens",
    "spec1": "Pure Molded Virgin Cast Iron + 3-Layer Ceramic Enamel",
    "spec2": "26 cm Diameter · 5.2L Capacity · Oven Safe to 260°C",
    "moq": "100 Pcs per Colorway",
    "tagline": "Unrivaled Slow-Simmer Thermal Alchemy",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "kit-3",
    "name": "Royal 45% Bone China Hand-Gilded 24-Piece Tableware Set",
    "description": "Flawlessly translucent bone china dinner service for six with 24K real gold hand-painted rims, offering extraordinary chip-resistance and lightweight grace.",
    "badge": "Haute Tableware",
    "category": "china",
    "categoryNameZh": "骨粉含量45%极简手工描金轻奢骨瓷餐具24件套",
    "categoryNameEn": "Fine Bone China Sets",
    "spec1": "45% Natural Bovine Bone Ash (Dual Fired at 1320°C)",
    "spec2": "24-Piece Service for 6 · 24K Gold Rim Accent",
    "moq": "50 Sets per Batch",
    "tagline": "Translucent Luxury Dining Elegance",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "kit-4",
    "name": "Medical 316 5-Ply Clad Honeycomb Stainless Steel Wok 32cm",
    "description": "Scratch-resistant laser micro-engraved honeycomb non-stick matrix with 5-ply clad aluminum-steel body and stay-cool cast stainless handle.",
    "badge": "Clad Stainless",
    "category": "wok",
    "categoryNameZh": "316医用级五层复合无涂层蜂窝不锈钢不粘炒锅",
    "categoryNameEn": "5-Ply Clad Woks",
    "spec1": "Surgical 316 Stainless Steel Interior + 5-Ply Aluminum Core",
    "spec2": "32 cm Diameter · Compatible with Metal Spatulas & Induction",
    "moq": "150 Pcs per Order",
    "tagline": "High-Heat Searing with Effortless Release",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "kit-5",
    "name": "Czech Lead-Free Hand-Blown Seamless Crystal Bordeaux Glasses",
    "description": "Featherlight pulled-stem crystal wine glasses with laser-cut thin rim, engineered to aerate and channel bold red wine aromas with supreme clarity.",
    "badge": "Crystal Stemware",
    "category": "crystal",
    "categoryNameZh": "捷克进口无铅水晶无缝一体成型波尔多红酒杯",
    "categoryNameEn": "Hand-Blown Crystal Glasses",
    "spec1": "Lead-Free Titanium Crystal Glass · Seamless Drawn Stem",
    "spec2": "750ml Bowl · 24.5cm Height · 105g Ultra-Lightweight",
    "moq": "200 Sets (6 Glasses/Set)",
    "tagline": "Pure Harmonic Sommelier Refinement",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "kit-6",
    "name": "Italian Walnut Ergonomic Precision Espresso Portafilter & Tamper",
    "description": "Barista-grade bottomless 58mm portafilter with calibrated 30lb constant-force spring tamper, carved from oily Italian walnut wood and food-safe steel.",
    "badge": "Barista Craft",
    "category": "coffee",
    "categoryNameZh": "意大利浓缩咖啡原木意式专业半自动磨豆压粉工具",
    "categoryNameEn": "Precision Barista Tools",
    "spec1": "58mm Food-Grade 304 Stainless Steel + Italian Walnut",
    "spec2": "Bottomless Naked Portafilter + Constant Pressure Tamper",
    "moq": "100 Sets per Batch",
    "tagline": "The Sacred Science of the Golden Crema",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "kit-7",
    "name": "End-Grain Organic Acacia Wood Heavy Butcher Cutting Block",
    "description": "Thick end-grain construction that naturally self-heals knife cuts and preserves blade sharpness, equipped with deep juice groove and finger grips.",
    "badge": "End-Grain Block",
    "category": "board",
    "categoryNameZh": "天然整木相思木端面拼接抗菌吸水厚菜板",
    "categoryNameEn": "End-Grain Butcher Blocks",
    "spec1": "Kiln-Dried Organic Acacia Wood + Food-Safe Mineral Oil",
    "spec2": "45 × 35 × 4.5 cm · Heavy 4.8 kg Anti-Slip Mass",
    "moq": "100 Pcs per Batch",
    "tagline": "Gentle on Knives, Built for Decades",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "kit-8",
    "name": "Precision Immersion Circulator Sous-Vide Cooker 1100W",
    "description": "Commercial-standard precision immersion cooker with IPX7 waterproofing, digital touch control (±0.1°C accuracy), and brushless whisper pump.",
    "badge": "Molecular Precision",
    "category": "sousvide",
    "categoryNameZh": "智能数显触控低温慢煮分子料理恒温机",
    "categoryNameEn": "Precision Sous-Vide Cookers",
    "spec1": "1100W Fast-Heating Element · ±0.1°C Precise Regulation",
    "spec2": "IPX7 Waterproof · 360° Directional Water Circulation",
    "moq": "150 Pcs per Voltage Spec",
    "tagline": "Restaurant Temperature Precision for Every Cut",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderKitchenPage(ctx: ThemeContext, isVideo: boolean): string {
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
            categoryNameZh: '米其林厨具与高定餐具',
            categoryNameEn: 'Michelin Culinary & Tableware Guild',
            spec1: p.material || '',
            spec2: p.dimensions || '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : DEFAULT_PRODUCTS) as (Product | ThemedItem)[];

  const heroTitle = isZh ? '烈焰淬炼 · 米其林级厨具与顶级骨瓷餐具旗舰' : 'Master Culinary Knives & Haute Tableware Guild';
  const heroSubtitle = isZh ? '从67层VG-10核心大马士革手工锻打主厨刀、法式重型渐变珐琅铸铁圆煲到45%天然骨粉手工描金骨瓷餐具，为全球星级酒店与高端烹饪品牌打造极致锋利、蓄热微压与餐桌仪典。' : 'From 67-layer VG-10 core Damascus chef knives and enameled cast iron cocottes to 45% bone china dinnerware, providing world-class sharpness, thermal retention, and table dining poetry.';

  const isDetail = page === 'detail';
  const selectedProduct = isDetail
    ? products.find((p) => p.id === options.productId) || products[0]
    : products[0];

  const defaultMeta = DEFAULT_PRODUCTS[0];
  const pMeta = (selectedProduct as ThemedItem).spec1
    ? (selectedProduct as ThemedItem)
    : defaultMeta;

  const headerHtml = `
    <header class="theme-header" style="position:sticky;top:0;z-index:99;background:rgba(15, 23, 42, 0.78);backdrop-filter:blur(24px) saturate(190%);-webkit-backdrop-filter:blur(24px) saturate(190%);border-bottom:1px solid rgba(255,255,255,0.12);box-shadow:0 8px 32px rgba(0,0,0,0.37);">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:74px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg, ${color}, #ea580c);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M18 2v20M2 7h6a2 2 0 0 0 2-2V3M6 2v20M14 2v20M14 12h8"/></svg>
          </div>
          <div>
            <div style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || 'Michelin Culinary & Tableware Guild')}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:#C84B31;font-weight:700;">
              ${isZh ? '米其林厨具与高定餐具' : 'Michelin Culinary & Tableware Guild'}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:28px;" class="theme-nav-links">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'home' ? '#C84B31' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'catalog' ? '#C84B31' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'about' ? '#C84B31' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'contact' ? '#C84B31' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:100px;font-size:0.86rem;font-weight:700;color:#ffffff;background:linear-gradient(135deg, ${color}, #ea580c);box-shadow:0 4px 18px rgba(0,0,0,0.35);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
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
              <span style="width:8px;height:8px;border-radius:50%;background:#C84B31;box-shadow:0 0 10px #C84B31;"></span>
              <span style="color:#ffffff;font-size:0.82rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '米其林厨具与高定餐具 · 4K全景动态短片' : 'Michelin Culinary & Tableware Guild · 4K Cinematic Master'}</span>
            </div>
            <h1 style="font-size:clamp(2.4rem, 5.5vw, 4.2rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.12;margin:0 0 20px;" data-reveal="fade-up">
              ${esc(heroTitle)}
            </h1>
            <p style="font-size:clamp(1.05rem, 1.8vw, 1.3rem);line-height:1.6;color:#cbd5e1;margin:0 0 32px;max-width:760px;" data-reveal="fade-up">
              ${esc(heroSubtitle)}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #ea580c);box-shadow:0 8px 24px rgba(0,0,0,0.4);display:inline-flex;align-items:center;gap:10px;">
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
          <div style="position:absolute;top:-20%;right:-10%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle, #C84B3126 0%, transparent 70%);filter:blur(80px);pointer-events:none;"></div>
          <div class="wrap" style="position:relative;z-index:2;display:grid;grid-template-columns:1.2fr 0.8fr;gap:50px;align-items:center;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:100px;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);margin-bottom:20px;" data-reveal="fade-up">
                <span style="color:#C84B31;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isZh ? '米其林厨具与高定餐具' : 'Michelin Culinary & Tableware Guild'}</span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 4.8vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 20px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:1.15rem;line-height:1.7;color:#cbd5e1;margin:0 0 32px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #ea580c);box-shadow:0 8px 24px rgba(0,0,0,0.35);display:inline-flex;align-items:center;gap:10px;">
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
              <div style="font-size:0.76rem;letter-spacing:0.12em;text-transform:uppercase;color:#C84B31;font-weight:800;margin-bottom:12px;">
                ${isZh ? '匠作核心优势' : 'CRAFT PILLARS'}
              </div>
              <h3 style="font-size:1.4rem;font-weight:800;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '67层大马士革复合高碳钢锻打' : '67-Layer Damascus VG-10 Steel Forging'}
              </h3>
              <p style="font-size:0.92rem;line-height:1.6;color:#94a3b8;margin:0 0 24px;">
                ${isZh ? '日本进口 VG-10 核心高碳钴合金钢，真空气淬深冷处理，硬度达 HRC 60±2，开刃角度严苛 15°。' : 'VG-10 high-carbon core steel, vacuum cryogenic heat treatment, HRC 60±2 hardness, razor 15° edge.'}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#ffffff;">${esc('HRC 60±2')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '大马士革钢芯洛氏硬度' : 'Damascus Core Hardness'}</div>
                </div>
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#C84B31;">${esc('45% Ash')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '天然动物骨粉含量高标准' : 'Bone Ash Content'}</div>
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#C84B31;margin-bottom:10px;">
              ${isZh ? '核心工艺矩阵' : 'CORE CAPABILITIES'}
            </div>
            <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${isZh ? '世界级工艺制造标准' : 'World-Class Manufacturing Standards'}
            </h2>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C84B31;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  01
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '67层大马士革复合高碳钢锻打' : '67-Layer Damascus VG-10 Steel Forging'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '日本进口 VG-10 核心高碳钴合金钢，真空气淬深冷处理，硬度达 HRC 60±2，开刃角度严苛 15°。' : 'VG-10 high-carbon core steel, vacuum cryogenic heat treatment, HRC 60±2 hardness, razor 15° edge.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C84B31;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  02
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '重型生铁熔铸与 3 层玻璃质瓷釉' : 'Heavyweight Enameled Cast Iron Cocotte'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '厚重生铁材质确保无与伦比的均匀蓄热与自循环水滴凝结锅盖，三层德国进口珐琅釉抗酸碱耐高温。' : 'Exceptional thermal mass, self-basting condensation drop lids, 3-layer German imported enamel glaze.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C84B31;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  03
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '45% 高骨粉含量高透透光骨瓷' : '45% Superior Bone Ash Fine China'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '天然食草牛骨骨粉经 1320°C 素烧与 1150°C 釉烧双重高温，瓷质白润如玉，通透轻巧敲击清脆如磬。' : 'High-content bovine bone ash dual-fired, jade-like milky translucence, lightweight yet extremely chip-resistant.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C84B31;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  04
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '医用级 316 不锈钢五层通体复合' : '5-Ply Clad 316 Medical Stainless Steel'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '316耐酸碱内层与多层高纯度铝导热核心通体一体成型，导热均匀迅速，耐腐蚀永不析出重金属。' : '316 surgical stainless inner lining + pure aluminum thermal core, rapid heat spreading without hot spots.'}
                </p>
              </div>
            
          </div>
        </section>

        <!-- 8-Product Showcase Grid -->
        <section class="wrap" style="padding:40px 0 90px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
            <div>
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#C84B31;margin-bottom:8px;">
                ${isZh ? '精选品类橱窗' : 'FLAGSHIP COLLECTION'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0;">
                ${isZh ? '米其林厨具与高定餐具经典作品系列' : 'Michelin Culinary & Tableware Guild Catalog Showcase'}
              </h2>
            </div>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:#C84B31;display:inline-flex;align-items:center;gap:6px;">
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
                    <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:#C84B31;text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Michelin Culinary & Tableware Guild')}
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
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#C84B31;margin-bottom:10px;">
                ${isZh ? '严苛检测与认证' : 'TECHNICAL LAB STANDARDS'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '米其林严选烹饪器物与食品安全品控' : 'Michelin Grade Culinary Testing & Food Safety Standards'}
              </h2>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C84B31;margin-bottom:10px;">01</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '德国 LFGB 与美国 FDA 食品级双重安全认证' : 'FDA & LFGB Food Contact Compliance'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '无铅无镉无重金属迁移，耐高温无有害涂层释放，达到欧盟最高级别食品接触安全法令规范。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C84B31;margin-bottom:10px;">02</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '刀刃 CATRA 锋利度与耐用度国际标准认证' : 'CATRA Razor Sharpness & Edge Retention'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '采用激光自动测角与连续切割测试，刀锋初始锋利度 ICP 超高标准（>110），持久切割无顿感。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C84B31;margin-bottom:10px;">03</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '500 次商用洗碗机极端耐清洗耐磨腐蚀实验' : '500-Cycle Commercial Dishwasher Safe'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '高压强碱水流冲洗后釉面依然光泽如新，手工 24K 真金描金边缘不剥落不褪色。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C84B31;margin-bottom:10px;">04</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '全炉具适配导磁复合复合锅底' : 'Full Stovetop Magnetic Induction Base'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '完美兼容电磁炉、明火燃气灶、电陶炉与烤箱，耐温高达 500°F (260°C)，全能烹饪不受限制。' : 'undefined'}
                  </p>
                </div>
              
            </div>
          </div>
        </section>

        <!-- Metric Counters -->
        <section class="wrap" style="padding:80px 0;" data-reveal="fade-up">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;">
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="60" data-suffix=" HRC">
                  HRC 60±2
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '大马士革钢芯洛氏硬度' : 'Damascus Core Hardness'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Cryogenic heat treated</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="45" data-suffix="% Ash">
                  45% Ash
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '天然动物骨粉含量高标准' : 'Bone Ash Content'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Translucent fine china</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="2500000" data-suffix=" Pcs">
                  2,500,000
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '年度高端厨具餐具出口' : 'Annual Culinary Units'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">5-Star hospitality supply</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="5" data-suffix=" Days">
                  5-7 Days
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '3D刀柄工程打样与手模交付' : 'Rapid Kitchenware Prototype'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">CNC ergonomist studio</div>
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
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 38px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #ea580c);display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 25px rgba(0,0,0,0.4);">
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C84B31;margin-bottom:6px;">
            ${esc(company.name || 'Michelin Culinary & Tableware Guild')}
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
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:100px;background:linear-gradient(135deg, ${color}, #ea580c);color:#ffffff;font-size:0.82rem;font-weight:700;">
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
          <span style="color:#C84B31;">${esc(selectedProduct.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
          <!-- Product Image -->
          <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);position:relative;">
            <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
          </div>

          <!-- Product Details -->
          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C84B31;margin-bottom:10px;">
              ${esc(meta.categoryNameEn || 'Michelin Culinary & Tableware Guild')}
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
                <button type="submit" style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #ea580c);color:#ffffff;font-size:0.96rem;font-weight:800;border:none;cursor:pointer;">
                  ${isZh ? '提交样品打样申请' : 'Submit Sample Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, isZh ? '烈焰淬炼 · 米其林级厨具与顶级骨瓷餐具旗舰' : 'Master Culinary Knives & Haute Tableware Guild');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Craftsmanship heritage' },
      { value: 'HRC 60±2', num: 60, suffix: ' HRC', label: isZh ? '大马士革钢芯洛氏硬度' : 'Damascus Core Hardness', desc: 'Cryogenic heat treated' },
      { value: '45% Ash', num: 45, suffix: '% Ash', label: isZh ? '天然动物骨粉含量高标准' : 'Bone Ash Content', desc: 'Translucent fine china' },
      { value: '5-7 Days', num: 5, suffix: ' Days', label: isZh ? '3D刀柄工程打样与手模交付' : 'Rapid Kitchenware Prototype', desc: 'CNC ergonomist studio' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:800px;margin:0 auto 60px;text-align:center;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#C84B31;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
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
              <div style="font-size:2.8rem;font-weight:900;color:#C84B31;line-height:1;"><span>${esc(h.value)}</span></div>
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C84B31;margin-bottom:8px;">
            ${esc(company.name || 'Michelin Culinary & Tableware Guild')}
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
              <div><strong>Email:</strong> <a style="color:#C84B31;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></div>
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

              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #ea580c);color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;">
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
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg, ${color}, #ea580c);display:flex;align-items:center;justify-content:center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M18 2v20M2 7h6a2 2 0 0 0 2-2V3M6 2v20M14 2v20M14 12h8"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Michelin Culinary & Tableware Guild')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#64748b;margin:0 0 16px;max-width:320px;">
            ${isZh ? '米其林厨具与高定餐具 · 全球品质供应链' : 'Michelin Culinary & Tableware Guild · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '67层大马士革VG-10核心主厨刀礼盒组' : 'Damascus Chef Knives'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '法式经典重型渐变珐琅铸铁微压圆煲' : 'Enameled Dutch Ovens'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '骨粉含量45%极简手工描金轻奢骨瓷餐具24件套' : 'Fine Bone China Sets'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺实力' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('HRC 60±2')} ${isZh ? '大马士革钢芯洛氏硬度' : 'Damascus Core Hardness'}</li>
            <li>✓ ${esc('45% Ash')} ${isZh ? '天然动物骨粉含量高标准' : 'Bone Ash Content'}</li>
            <li>✓ ${esc('2,500,000')} ${isZh ? '年度高端厨具餐具出口' : 'Annual Culinary Units'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#C84B31;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #111827;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '米其林厨具与高定餐具旗舰版' : 'Michelin Culinary & Tableware Guild Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
