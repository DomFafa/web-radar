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
    "id": "lug-1",
    "name": "Tuscan Full-Grain Vegetable-Tanned Leather Weekender Duffel",
    "description": "Master handcrafted overnight travel duffel made of 2.2mm Tuscan vegetable-tanned calfskin, reinforced brass studs, and heavy YKK Excella zippers.",
    "badge": "Master Artisan",
    "category": "leather",
    "categoryNameZh": "头层植鞣皮手作旅行袋",
    "categoryNameEn": "Artisan Leather Duffels",
    "spec1": "2.2mm Tuscan Full-Grain Vegetable-Tanned Leather",
    "spec2": "52 × 28 × 26 cm · 45L Capacity · 1.85 kg",
    "moq": "100 Pcs per Color",
    "tagline": "Timeless Patina Journey",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "lug-2",
    "name": "Aero-Grade 5052 Magnesium-Aluminum Dual TSA Carry-On 20\"",
    "description": "Unibody aerospace magnesium aluminum suitcase featuring dual TSA biometric locks, custom silent dual-spinner wheels, and corner crash bumpers.",
    "badge": "Aero Elite",
    "category": "aluminum",
    "categoryNameZh": "航空铝镁合金双重海关锁登机箱",
    "categoryNameEn": "Magnesium Aluminum Cases",
    "spec1": "5052-H32 Deep-Draw Aluminum Magnesium Alloy",
    "spec2": "55 × 38 × 23 cm · 38L · Airline Cabin Approved",
    "moq": "200 Pcs per Spec",
    "tagline": "Indestructible Armor in Motion",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "lug-3",
    "name": "Executive Saddle Leather Ergonomic Business Backpack",
    "description": "Architectural silhouette cut from water-repellent oiled saddle leather, equipped with 16\" padded laptop vault and breathable air-mesh back panel.",
    "badge": "Executive Comfort",
    "category": "backpack",
    "categoryNameZh": "商务马鞍皮人体工学双肩包",
    "categoryNameEn": "Executive Leather Backpacks",
    "spec1": "Water-Repellent Oil Waxed Saddle Leather + 3D Mesh",
    "spec2": "43 × 30 × 15 cm · Dedicated 16\" Laptop Chamber",
    "moq": "150 Pcs per Color",
    "tagline": "Quiet Luxury for Global Commuters",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "lug-4",
    "name": "Ultra-Slim Nappa Leather Portfolio Briefcase",
    "description": "Italian full-grain Nappa leather briefcase with concealed magnetic lock, microfiber suede lining, and detachable shoulder sling.",
    "badge": "Slim Minimal",
    "category": "briefcase",
    "categoryNameZh": "极简头层纳帕皮轻薄公文包",
    "categoryNameEn": "Slim Leather Briefcases",
    "spec1": "Buttery Soft Full-Grain Italian Nappa Leather",
    "spec2": "39 × 29 × 6 cm · 850g Featherweight",
    "moq": "150 Pcs per Color",
    "tagline": "Pure Tailored Elegance",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "lug-5",
    "name": "Heritage Hand-Tooled Vintage Crossbody Saddle Bag",
    "description": "Vintage equestrian aesthetic with hand-carved floral tooling, solid antiqued brass buckle closure, and edge-burnished vegetable tanned leather.",
    "badge": "Equestrian Craft",
    "category": "crossbody",
    "categoryNameZh": "复古手工雕花马鞍真皮斜挎包",
    "categoryNameEn": "Heritage Saddle Bags",
    "spec1": "Hand-Tooled Argentine Cowhide with Natural Wax Polish",
    "spec2": "24 × 19 × 8 cm · Adjustable Crossbody Strap",
    "moq": "200 Pcs per Batch",
    "tagline": "Generational Craftsmanship",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "lug-6",
    "name": "Modular Cordura 1000D Urban Commuter Tech Tote",
    "description": "Weatherproof military-grade Cordura ballistic fabric with Fidlock magnetic quick-release buckles and expandable waterproof organizer pockets.",
    "badge": "Weatherproof Tech",
    "category": "tote",
    "categoryNameZh": "机能防泼水考杜拉城市通勤托特包",
    "categoryNameEn": "Cordura Tech Totes",
    "spec1": "Cordura 1000D Ballistic Nylon + DWR C0 Coating",
    "spec2": "46 × 35 × 14 cm · 24L Expandable",
    "moq": "300 Pcs per Color",
    "tagline": "Modular Versatility for Metropolitan Rhythms",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "lug-7",
    "name": "Crocodile-Embossed Hard Shell Watch & Jewelry Travel Trunk",
    "description": "Luxury jewelry and horology trunk with hand-stitched wooden internal frame, cushion watch pillows, and 24K gold plated corner hardware.",
    "badge": "Luxury Vault",
    "category": "trunk",
    "categoryNameZh": "鳄鱼纹硬质腕表首饰尊享旅行箱",
    "categoryNameEn": "Horology Travel Trunks",
    "spec1": "Hand-Crafted Wood Shell + Embossed Calf Leather",
    "spec2": "32 × 24 × 12 cm · 6 Watch Pillows + Ring Vault",
    "moq": "100 Pcs per Custom Run",
    "tagline": "Precious Timepieces Kept Impeccable",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "lug-8",
    "name": "Carbon-Fiber Matrix Ultra-Lightweight Suitcase 24\"",
    "description": "Real 3K aerospace carbon fiber shell offering immense compressive rigidity at a fraction of standard weight, paired with Hinomoto caster wheels.",
    "badge": "Hyper Material",
    "category": "carbon",
    "categoryNameZh": "超轻3K真碳纤维防弹抗压拉杆箱",
    "categoryNameEn": "Carbon-Fiber Suitcases",
    "spec1": "Real 3K Toray Carbon Fiber Matrix Composite",
    "spec2": "66 × 44 × 27 cm · 65L · 2.9 kg Total Weight",
    "moq": "100 Pcs per Batch",
    "tagline": "Peak Formula 1 Rigidity in Travel Form",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderLuggagePage(ctx: ThemeContext, isVideo: boolean): string {
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
            categoryNameZh: '奢享箱包皮具旗舰',
            categoryNameEn: 'Luxury Luggage & Leather Guild',
            spec1: p.material || '',
            spec2: p.dimensions || '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : DEFAULT_PRODUCTS) as (Product | ThemedItem)[];

  const heroTitle = isZh ? '匠心皮具 · 航空级全铝箱包全链制造旗舰' : 'Master Leathercraft & Aerospace Aluminum Luggage Guild';
  const heroSubtitle = isZh ? '从意大利托斯卡纳头层植鞣皮旅行袋、商务双肩包到航空级铝镁合金双轨防爆登机箱，为全球尊贵品牌提供顶尖五金电镀、马鞍手工双针双线与超静音万向轮的全链定制体系。' : 'From Tuscan vegetable-tanned full-grain leather weekender duffels to aerospace-grade aluminum carry-ons, delivering world-class craftsmanship and hardware engineering for global travel brands.';

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
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg, ${color}, #b45309);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2zM8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 12h12M10 12v4M14 12v4"/></svg>
          </div>
          <div>
            <div style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || 'Luxury Luggage & Leather Guild')}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:#8B5A2B;font-weight:700;">
              ${isZh ? '奢享箱包皮具旗舰' : 'Luxury Luggage & Leather Guild'}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:28px;" class="theme-nav-links">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'home' ? '#8B5A2B' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'catalog' ? '#8B5A2B' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'about' ? '#8B5A2B' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'contact' ? '#8B5A2B' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:100px;font-size:0.86rem;font-weight:700;color:#ffffff;background:linear-gradient(135deg, ${color}, #b45309);box-shadow:0 4px 18px rgba(0,0,0,0.35);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
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
              <span style="width:8px;height:8px;border-radius:50%;background:#8B5A2B;box-shadow:0 0 10px #8B5A2B;"></span>
              <span style="color:#ffffff;font-size:0.82rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '奢享箱包皮具旗舰 · 4K全景动态短片' : 'Luxury Luggage & Leather Guild · 4K Cinematic Master'}</span>
            </div>
            <h1 style="font-size:clamp(2.4rem, 5.5vw, 4.2rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.12;margin:0 0 20px;" data-reveal="fade-up">
              ${esc(heroTitle)}
            </h1>
            <p style="font-size:clamp(1.05rem, 1.8vw, 1.3rem);line-height:1.6;color:#cbd5e1;margin:0 0 32px;max-width:760px;" data-reveal="fade-up">
              ${esc(heroSubtitle)}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #b45309);box-shadow:0 8px 24px rgba(0,0,0,0.4);display:inline-flex;align-items:center;gap:10px;">
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
          <div style="position:absolute;top:-20%;right:-10%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle, #8B5A2B26 0%, transparent 70%);filter:blur(80px);pointer-events:none;"></div>
          <div class="wrap" style="position:relative;z-index:2;display:grid;grid-template-columns:1.2fr 0.8fr;gap:50px;align-items:center;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:100px;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);margin-bottom:20px;" data-reveal="fade-up">
                <span style="color:#8B5A2B;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isZh ? '奢享箱包皮具旗舰' : 'Luxury Luggage & Leather Guild'}</span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 4.8vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 20px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:1.15rem;line-height:1.7;color:#cbd5e1;margin:0 0 32px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #b45309);box-shadow:0 8px 24px rgba(0,0,0,0.35);display:inline-flex;align-items:center;gap:10px;">
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
              <div style="font-size:0.76rem;letter-spacing:0.12em;text-transform:uppercase;color:#8B5A2B;font-weight:800;margin-bottom:12px;">
                ${isZh ? '匠作核心优势' : 'CRAFT PILLARS'}
              </div>
              <h3 style="font-size:1.4rem;font-weight:800;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '意大利托斯卡纳头层植鞣皮' : 'Tuscan Full-Grain Vegetable-Tanned Leather'}
              </h3>
              <p style="font-size:0.92rem;line-height:1.6;color:#94a3b8;margin:0 0 24px;">
                ${isZh ? '精选法意优质公牛皮原胚，植物单宁酸慢浸透染，温润油脂光泽，越用越具岁月包浆质感。' : 'Slow natural tannin drum immersion, rich patina evolution, buttery soft tactile feel and lifetime durability.'}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#ffffff;">${esc('3,200,000')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '年优质箱包出货量' : 'Annual Export Volume'}</div>
                </div>
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#8B5A2B;">${esc('99.9%')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? 'TSA与硬件出厂合格率' : 'Hardware Reliability Rate'}</div>
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#8B5A2B;margin-bottom:10px;">
              ${isZh ? '核心工艺矩阵' : 'CORE CAPABILITIES'}
            </div>
            <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${isZh ? '世界级工艺制造标准' : 'World-Class Manufacturing Standards'}
            </h2>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#8B5A2B;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  01
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '意大利托斯卡纳头层植鞣皮' : 'Tuscan Full-Grain Vegetable-Tanned Leather'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '精选法意优质公牛皮原胚，植物单宁酸慢浸透染，温润油脂光泽，越用越具岁月包浆质感。' : 'Slow natural tannin drum immersion, rich patina evolution, buttery soft tactile feel and lifetime durability.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#8B5A2B;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  02
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '航空级铝镁合金 5052-H32' : 'Aerospace-Grade 5052-H32 Aluminum'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '高强度防撞冲压包角与一体深框挤压型材，双重内嵌式 TSA 海关密码锁，抗压防爆防撬。' : 'High-strength deep-draw stamped corner guards, integrated structural extrusion, dual embedded TSA locks.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#8B5A2B;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  03
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '德国拜耳 3层复合纯 PC 板材' : 'Covestro 3-Layer 100% Virgin Polycarbonate'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '零回料高弹性记忆微晶板材，耐 -40°C 至 130°C 极限温差，抗冲击高弹回弹不变形。' : 'High-elasticity micro-crystalline sheets, extreme temperature resilience (-40°C to 130°C), crack-proof impact bounce.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#8B5A2B;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  04
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '双轴静音八轮万向轮系统' : 'Dual-Axis 360° Whisper-Quiet Caster System'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '日本进口高弹灌胶 PU 静音轮面，精密微型滚珠轴承，通过 50km 极限负重颠簸滑行测试。' : 'Imported high-rebound molded PU wheel treads, precision micro-bearings, passed 50km rough-surface load tests.'}
                </p>
              </div>
            
          </div>
        </section>

        <!-- 8-Product Showcase Grid -->
        <section class="wrap" style="padding:40px 0 90px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
            <div>
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#8B5A2B;margin-bottom:8px;">
                ${isZh ? '精选品类橱窗' : 'FLAGSHIP COLLECTION'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0;">
                ${isZh ? '奢享箱包皮具旗舰经典作品系列' : 'Luxury Luggage & Leather Guild Catalog Showcase'}
              </h2>
            </div>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:#8B5A2B;display:inline-flex;align-items:center;gap:6px;">
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
                    <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:#8B5A2B;text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Luxury Luggage & Leather Guild')}
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
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#8B5A2B;margin-bottom:10px;">
                ${isZh ? '严苛检测与认证' : 'TECHNICAL LAB STANDARDS'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '四大箱包匠作工程与品控矩阵' : 'Four Precision Luggage Engineering & QC Pillars'}
              </h2>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#8B5A2B;margin-bottom:10px;">01</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '马鞍双针纯手工固特异缝线' : 'Saddle Double-Needle Hand-Stitching'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '采用高强打蜡亚麻粗线，两根马鞍针交叉回锁缝合，即使单处断线整体亦绝不脱散。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#8B5A2B;margin-bottom:10px;">02</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '真空电镀枪黑与复古黄铜五金' : 'PVD Vacuum Plated Heavy Brass Hardware'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '通过 96 小时酸性中性盐雾耐腐蚀测试，耐磨不褪色，开合阻尼手感细腻沉稳。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#8B5A2B;margin-bottom:10px;">03</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '多阶航空铝合金加厚拉杆' : 'Multi-Stage Aircraft Aluminum Trolley Rod'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '精密模具极低晃动间隙（<1.5mm），十万次连续抽拉耐疲劳测试无卡顿。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#8B5A2B;margin-bottom:10px;">04</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '全箱体 1.5 米自由跌落抗爆测试' : 'Full-Suitcase 1.5m Drop & Tumbling Test'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '满载 25kg 状态下通过角部落体连续 50 次跌落与滚筒冲击测试，箱体与锁扣毫发无损。' : 'undefined'}
                  </p>
                </div>
              
            </div>
          </div>
        </section>

        <!-- Metric Counters -->
        <section class="wrap" style="padding:80px 0;" data-reveal="fade-up">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;">
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="3200000" data-suffix=" Pcs">
                  3,200,000
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '年优质箱包出货量' : 'Annual Export Volume'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Global luxury trade</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="99.9" data-suffix="%">
                  99.9%
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? 'TSA与硬件出厂合格率' : 'Hardware Reliability Rate'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Rigorous QC lab</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="50" data-suffix=" km">
                  50 km
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '重载万向轮颠簸耐磨跑道' : 'Heavy Load Wheel Endurance'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">DIN EN ISO tested</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="5" data-suffix=" Days">
                  5-7 Days
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '3D结构打样与实物交付' : 'Rapid Prototype Delivery'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Master sample guild</div>
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
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 38px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #b45309);display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 25px rgba(0,0,0,0.4);">
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#8B5A2B;margin-bottom:6px;">
            ${esc(company.name || 'Luxury Luggage & Leather Guild')}
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
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:100px;background:linear-gradient(135deg, ${color}, #b45309);color:#ffffff;font-size:0.82rem;font-weight:700;">
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
          <span style="color:#8B5A2B;">${esc(selectedProduct.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
          <!-- Product Image -->
          <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);position:relative;">
            <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
          </div>

          <!-- Product Details -->
          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#8B5A2B;margin-bottom:10px;">
              ${esc(meta.categoryNameEn || 'Luxury Luggage & Leather Guild')}
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
                <button type="submit" style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #b45309);color:#ffffff;font-size:0.96rem;font-weight:800;border:none;cursor:pointer;">
                  ${isZh ? '提交样品打样申请' : 'Submit Sample Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, isZh ? '匠心皮具 · 航空级全铝箱包全链制造旗舰' : 'Master Leathercraft & Aerospace Aluminum Luggage Guild');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Craftsmanship heritage' },
      { value: '3,200,000', num: 3200000, suffix: ' Pcs', label: isZh ? '年优质箱包出货量' : 'Annual Export Volume', desc: 'Global luxury trade' },
      { value: '99.9%', num: 99.9, suffix: '%', label: isZh ? 'TSA与硬件出厂合格率' : 'Hardware Reliability Rate', desc: 'Rigorous QC lab' },
      { value: '5-7 Days', num: 5, suffix: ' Days', label: isZh ? '3D结构打样与实物交付' : 'Rapid Prototype Delivery', desc: 'Master sample guild' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:800px;margin:0 auto 60px;text-align:center;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#8B5A2B;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
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
              <div style="font-size:2.8rem;font-weight:900;color:#8B5A2B;line-height:1;"><span>${esc(h.value)}</span></div>
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#8B5A2B;margin-bottom:8px;">
            ${esc(company.name || 'Luxury Luggage & Leather Guild')}
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
              <div><strong>Email:</strong> <a style="color:#8B5A2B;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></div>
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

              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #b45309);color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;">
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
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg, ${color}, #b45309);display:flex;align-items:center;justify-content:center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2zM8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 12h12M10 12v4M14 12v4"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Luxury Luggage & Leather Guild')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#64748b;margin:0 0 16px;max-width:320px;">
            ${isZh ? '奢享箱包皮具旗舰 · 全球品质供应链' : 'Luxury Luggage & Leather Guild · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '头层植鞣皮手作旅行袋' : 'Artisan Leather Duffels'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '航空铝镁合金双重海关锁登机箱' : 'Magnesium Aluminum Cases'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '商务马鞍皮人体工学双肩包' : 'Executive Leather Backpacks'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺实力' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('3,200,000')} ${isZh ? '年优质箱包出货量' : 'Annual Export Volume'}</li>
            <li>✓ ${esc('99.9%')} ${isZh ? 'TSA与硬件出厂合格率' : 'Hardware Reliability Rate'}</li>
            <li>✓ ${esc('50 km')} ${isZh ? '重载万向轮颠簸耐磨跑道' : 'Heavy Load Wheel Endurance'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#8B5A2B;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #111827;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '奢享箱包皮具旗舰旗舰版' : 'Luxury Luggage & Leather Guild Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
