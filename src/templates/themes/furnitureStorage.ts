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
    "id": "fur-1",
    "name": "FAS American Black Walnut Floating Dining Table",
    "description": "Cantilevered floating design crafted from continuous-grain FAS American black walnut slabs, finished with organic zero-VOC hardwax oil.",
    "badge": "Master Timber",
    "category": "table",
    "categoryNameZh": "北美FAS级黑胡桃木悬浮隐形抽屉实木餐桌",
    "categoryNameEn": "Solid Walnut Dining Tables",
    "spec1": "100% Solid FAS American Walnut (Moisture 8-10%)",
    "spec2": "200 × 90 × 75 cm · 45mm Top · Concealed Cutlery Drawers",
    "moq": "30 Pcs per Batch",
    "tagline": "Continuous Grain Horizon",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "fur-2",
    "name": "Modular Aluminum Frame Architectural Bookshelf Unit",
    "description": "Precision extruded black anodized aluminum uprights with micro-adjustable smoked glass and solid oak storage modules.",
    "badge": "Architectural Grid",
    "category": "bookshelf",
    "categoryNameZh": "模块化自由组合铝框极简置物书架系统",
    "categoryNameEn": "Modular Aluminum Bookshelves",
    "spec1": "6063-T6 Aerospace Aluminum + Tempered Smoked Glass",
    "spec2": "240 × 38 × 220 cm · 150kg/Tier Rated",
    "moq": "20 Sets per Run",
    "tagline": "Open Grid Spatial Harmony",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "fur-3",
    "name": "Ergonomic Bentwood Bouclé Cloud Lounge Armchair",
    "description": "Sculptural curved ash wood internal frame draped in plush high-density Italian bouclé wool fleece, paired with 360° memory-swivel pedestal.",
    "badge": "Ergonomic Cloud",
    "category": "chair",
    "categoryNameZh": "人体工学曲木羊羔绒云朵单人休闲躺椅",
    "categoryNameEn": "Bouclé Cloud Armchairs",
    "spec1": "Solid Ash Bentwood + High-Resilience Molded Foam",
    "spec2": "92 × 88 × 82 cm · Seat Height 42cm · 360° Swivel",
    "moq": "50 Pcs per Color",
    "tagline": "Cocoon of Tactile Warmth",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "fur-4",
    "name": "Suspended Minimalist Floating Entryway Storage Credenza",
    "description": "Wall-hung floating entryway console featuring fluted tambour sliding fronts, built-in wireless charging pad, and concealed shoe ventilation.",
    "badge": "Floating Entryway",
    "category": "credenza",
    "categoryNameZh": "悬空极简入户玄关多功能鞋包收纳柜",
    "categoryNameEn": "Floating Entryway Credenzas",
    "spec1": "E0 Moisture-Resistant Core + Natural Oak Wood Slats",
    "spec2": "160 × 35 × 45 cm · Heavy-Duty Wall Anchors Included",
    "moq": "40 Pcs per Order",
    "tagline": "Airy Weightlessness in Arrival",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "fur-5",
    "name": "Italian Sintered Stone Extendable Lift-Top Coffee Table",
    "description": "Scratch-proof heat-resistant 12mm sintered stone table with silent pneumatic lift-top mechanism revealing deep hidden storage compartments.",
    "badge": "Pneumatic Lift",
    "category": "coffeetable",
    "categoryNameZh": "意式超薄岩板防刮耐磨伸缩岛台茶几",
    "categoryNameEn": "Lift-Top Coffee Tables",
    "spec1": "12mm Italian Sintered Stone (Mohs 7) + Black Steel Base",
    "spec2": "120-150 × 60 × 42-62 cm Lift Range",
    "moq": "50 Pcs per Batch",
    "tagline": "Effortless Work & Living Fusion",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "fur-6",
    "name": "Stackable Modular High-Clarity Acrylic Storage Box System",
    "description": "Optical-grade thick acrylic transparent display containers with magnetic side-drop doors and stackable interlocking grooves.",
    "badge": "Clear Storage",
    "category": "storage",
    "categoryNameZh": "模块化抽屉式透明高透防尘收纳整理箱组",
    "categoryNameEn": "Modular Acrylic Storage",
    "spec1": "4mm Cast Virgin Acrylic (94% Optical Clarity)",
    "spec2": "38 × 28 × 22 cm · Modular Interlocking Base",
    "moq": "200 Sets (6 Pcs/Set)",
    "tagline": "Museum-Quality Clear Organization",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "fur-7",
    "name": "Solid Oak Magnetic Modular Walk-In Wardrobe System",
    "description": "Open architectural closet system featuring magnetic adjustable garment rails, LED sensor strip channels, and leather-lined jewelry inserts.",
    "badge": "Wardrobe System",
    "category": "wardrobe",
    "categoryNameZh": "极简实木磁吸模块化走入式衣帽间系统",
    "categoryNameEn": "Modular Walk-In Wardrobes",
    "spec1": "Solid White Oak + Extruded Anodized Rail Tracks",
    "spec2": "Custom Modular Configuration (Height up to 280 cm)",
    "moq": "15 Full Sets per Project",
    "tagline": "Haute Couture Dressing Architecture",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "fur-8",
    "name": "Bauhaus Tubular Chrome & Tempered Glass Folding Side Table",
    "description": "Classic modernist homage featuring mirror-polished tubular chrome steel frame and 8mm shatter-proof tempered glass floating tray.",
    "badge": "Bauhaus Classic",
    "category": "table",
    "categoryNameZh": "包豪斯风格弯管镀铬网格折叠杂志边几",
    "categoryNameEn": "Bauhaus Side Tables",
    "spec1": "Seamless Mirror-Polished Tubular Stainless Steel",
    "spec2": "48 × 48 × 54 cm · Folds Flat for Storage",
    "moq": "100 Pcs per Order",
    "tagline": "Form Follows Function Timelessness",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderFurniturePage(ctx: ThemeContext, isVideo: boolean): string {
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
            categoryNameZh: '包豪斯家具与空间收纳',
            categoryNameEn: 'Architectural Furniture & Spatial Systems',
            spec1: p.material || '',
            spec2: p.dimensions || '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : DEFAULT_PRODUCTS) as (Product | ThemedItem)[];

  const heroTitle = isZh ? '空间构筑 · 现代极简家具与模块收纳系统' : 'Spatial Architecture & Modular Furniture Guild';
  const heroSubtitle = isZh ? '从北美FAS级黑胡桃实木悬浮餐桌、模块化铝框置物书架到人体工学云朵休闲躺椅，为全球现代大宅与商业空间提供集结构力学、无痕收纳与现代建筑美学于一体的全案家具制造。' : 'From FAS American black walnut dining tables and modular aluminum shelving systems to cloud bouclé lounge chairs, engineering architectural furniture with precision joinery and structural beauty.';

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
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg, ${color}, #3b82f6);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M20 7h-9M14 17H5M3 3v18M21 3v18M7 7v10M17 7v10"/></svg>
          </div>
          <div>
            <div style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || 'Architectural Furniture & Spatial Systems')}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:#2B2D42;font-weight:700;">
              ${isZh ? '包豪斯家具与空间收纳' : 'Architectural Furniture & Spatial Systems'}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:28px;" class="theme-nav-links">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'home' ? '#2B2D42' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'catalog' ? '#2B2D42' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'about' ? '#2B2D42' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'contact' ? '#2B2D42' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:100px;font-size:0.86rem;font-weight:700;color:#ffffff;background:linear-gradient(135deg, ${color}, #3b82f6);box-shadow:0 4px 18px rgba(0,0,0,0.35);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
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
              <span style="width:8px;height:8px;border-radius:50%;background:#2B2D42;box-shadow:0 0 10px #2B2D42;"></span>
              <span style="color:#ffffff;font-size:0.82rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '包豪斯家具与空间收纳 · 4K全景动态短片' : 'Architectural Furniture & Spatial Systems · 4K Cinematic Master'}</span>
            </div>
            <h1 style="font-size:clamp(2.4rem, 5.5vw, 4.2rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.12;margin:0 0 20px;" data-reveal="fade-up">
              ${esc(heroTitle)}
            </h1>
            <p style="font-size:clamp(1.05rem, 1.8vw, 1.3rem);line-height:1.6;color:#cbd5e1;margin:0 0 32px;max-width:760px;" data-reveal="fade-up">
              ${esc(heroSubtitle)}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #3b82f6);box-shadow:0 8px 24px rgba(0,0,0,0.4);display:inline-flex;align-items:center;gap:10px;">
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
          <div style="position:absolute;top:-20%;right:-10%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle, #2B2D4226 0%, transparent 70%);filter:blur(80px);pointer-events:none;"></div>
          <div class="wrap" style="position:relative;z-index:2;display:grid;grid-template-columns:1.2fr 0.8fr;gap:50px;align-items:center;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:100px;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);margin-bottom:20px;" data-reveal="fade-up">
                <span style="color:#2B2D42;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isZh ? '包豪斯家具与空间收纳' : 'Architectural Furniture & Spatial Systems'}</span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 4.8vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 20px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:1.15rem;line-height:1.7;color:#cbd5e1;margin:0 0 32px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #3b82f6);box-shadow:0 8px 24px rgba(0,0,0,0.35);display:inline-flex;align-items:center;gap:10px;">
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
              <div style="font-size:0.76rem;letter-spacing:0.12em;text-transform:uppercase;color:#2B2D42;font-weight:800;margin-bottom:12px;">
                ${isZh ? '匠作核心优势' : 'CRAFT PILLARS'}
              </div>
              <h3 style="font-size:1.4rem;font-weight:800;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '北美进口 FAS 级黑胡桃实木' : 'FAS Grade American Black Walnut'}
              </h3>
              <p style="font-size:0.92rem;line-height:1.6;color:#94a3b8;margin:0 0 24px;">
                ${isZh ? '原木经由 90 天科学二次真空烘干，含水率严格控制在 8-10%，彻底杜绝开裂与翘曲形变。' : 'Secondary 90-day vacuum kiln drying, moisture strictly regulated to 8-10%, eliminating climate warping.'}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#ffffff;">${esc('FAS Grade')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '北美黑胡桃原产地纯度' : 'Genuine American Timber'}</div>
                </div>
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#2B2D42;">${esc('150 kg')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '单层模块化隔板静载极限' : 'Per-Shelf Load Rating'}</div>
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#2B2D42;margin-bottom:10px;">
              ${isZh ? '核心工艺矩阵' : 'CORE CAPABILITIES'}
            </div>
            <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${isZh ? '世界级工艺制造标准' : 'World-Class Manufacturing Standards'}
            </h2>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#2B2D42;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  01
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '北美进口 FAS 级黑胡桃实木' : 'FAS Grade American Black Walnut'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '原木经由 90 天科学二次真空烘干，含水率严格控制在 8-10%，彻底杜绝开裂与翘曲形变。' : 'Secondary 90-day vacuum kiln drying, moisture strictly regulated to 8-10%, eliminating climate warping.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#2B2D42;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  02
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '五轴联动 CNC 传统榫卯现代精雕' : '5-Axis CNC Precision Mortise & Tenon'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '结合鲁班古法燕尾榫与现代高精度数控微米级切削，无多余螺丝外露，浑然天成坚固耐用百年。' : 'Concealed dovetail and floating tenon joinery, zero exposed hardware, immense tensile connection.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#2B2D42;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  03
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '6063-T6 航空建筑级铝合金型材' : '6063-T6 Architectural Aluminum Matrix'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '阳极氧化磨砂拉丝或静电粉末氟碳喷涂，模块化卡扣轨道结构，承重高达 150kg/层。' : 'Anodized satin-brushed or fluorocarbon matte finish, modular rail-snap locking, 150kg load per shelf.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#2B2D42;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  04
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '德国海蒂诗与百隆静音阻尼五金' : 'German Hettich & Blum Silent Damping'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '内置静音自动回弹液压缓冲阻尼滑轨与铰链，历经 200,000 次连续开合耐久性严苛测试。' : 'Integrated soft-close hydraulic dampers, full-extension slides, tested through 200,000 smooth cycles.'}
                </p>
              </div>
            
          </div>
        </section>

        <!-- 8-Product Showcase Grid -->
        <section class="wrap" style="padding:40px 0 90px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
            <div>
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#2B2D42;margin-bottom:8px;">
                ${isZh ? '精选品类橱窗' : 'FLAGSHIP COLLECTION'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0;">
                ${isZh ? '包豪斯家具与空间收纳经典作品系列' : 'Architectural Furniture & Spatial Systems Catalog Showcase'}
              </h2>
            </div>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:#2B2D42;display:inline-flex;align-items:center;gap:6px;">
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
                    <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:#2B2D42;text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Architectural Furniture & Spatial Systems')}
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
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#2B2D42;margin-bottom:10px;">
                ${isZh ? '严苛检测与认证' : 'TECHNICAL LAB STANDARDS'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '空间力学架构与家具耐用性指标' : 'Structural Mechanics & Furniture Durability Standards'}
              </h2>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#2B2D42;margin-bottom:10px;">01</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? 'BIFMA X5.5 欧美办公与家用重载力学认证' : 'BIFMA X5.5 Structural Load Compliance'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '经受桌面 150kg 集中冲击荷载与横向抗扭矩震颤检测，确保大跨度悬浮桌面永不沉降。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#2B2D42;margin-bottom:10px;">02</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '意大利进口食品接触级超耐磨岩板' : 'Italian Porcelain Sintered Stone Surfaces'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '莫氏硬度 7 级，耐 1200°C 高温灼烧，零吸水率抗刮耐磨，刀划不留痕、污渍一擦即净。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#2B2D42;margin-bottom:10px;">03</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '环保超低甲醛净味植物木蜡油涂装' : 'Zero-VOC Eco Organic Hardwax Oil Coating'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '采用德国欧诗木（Osmo）纯植物木蜡油，让原木自然呼吸，释放天然木香，母婴级安全无害。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#2B2D42;margin-bottom:10px;">04</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '全拆装平板环保高密防护外销包装' : 'Flat-Pack High-Density Export Protection'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '高强度蜂窝纸护角与加厚发泡防刮膜，平整化装箱体积缩减 60%，大大降低海运集装箱货运成本。' : 'undefined'}
                  </p>
                </div>
              
            </div>
          </div>
        </section>

        <!-- Metric Counters -->
        <section class="wrap" style="padding:80px 0;" data-reveal="fade-up">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;">
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="100" data-suffix=" FAS">
                  FAS Grade
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '北美黑胡桃原产地纯度' : 'Genuine American Timber'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Sustainably harvested</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="150" data-suffix=" kg">
                  150 kg
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '单层模块化隔板静载极限' : 'Per-Shelf Load Rating'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">BIFMA certified</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="850000" data-suffix=" Pcs">
                  850,000
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '年度现代家具与模块柜出货' : 'Annual Furniture Units'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Global architecture projects</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="7" data-suffix=" Days">
                  7-10 Days
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '快速结构工程打样与开料' : 'Rapid Engineering Samples'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">5-Axis CNC center</div>
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
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 38px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #3b82f6);display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 25px rgba(0,0,0,0.4);">
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2B2D42;margin-bottom:6px;">
            ${esc(company.name || 'Architectural Furniture & Spatial Systems')}
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
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:100px;background:linear-gradient(135deg, ${color}, #3b82f6);color:#ffffff;font-size:0.82rem;font-weight:700;">
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
          <span style="color:#2B2D42;">${esc(selectedProduct.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
          <!-- Product Image -->
          <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);position:relative;">
            <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
          </div>

          <!-- Product Details -->
          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2B2D42;margin-bottom:10px;">
              ${esc(meta.categoryNameEn || 'Architectural Furniture & Spatial Systems')}
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
                <button type="submit" style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #3b82f6);color:#ffffff;font-size:0.96rem;font-weight:800;border:none;cursor:pointer;">
                  ${isZh ? '提交样品打样申请' : 'Submit Sample Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, isZh ? '空间构筑 · 现代极简家具与模块收纳系统' : 'Spatial Architecture & Modular Furniture Guild');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Craftsmanship heritage' },
      { value: 'FAS Grade', num: 100, suffix: ' FAS', label: isZh ? '北美黑胡桃原产地纯度' : 'Genuine American Timber', desc: 'Sustainably harvested' },
      { value: '150 kg', num: 150, suffix: ' kg', label: isZh ? '单层模块化隔板静载极限' : 'Per-Shelf Load Rating', desc: 'BIFMA certified' },
      { value: '7-10 Days', num: 7, suffix: ' Days', label: isZh ? '快速结构工程打样与开料' : 'Rapid Engineering Samples', desc: '5-Axis CNC center' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:800px;margin:0 auto 60px;text-align:center;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#2B2D42;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
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
              <div style="font-size:2.8rem;font-weight:900;color:#2B2D42;line-height:1;"><span>${esc(h.value)}</span></div>
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2B2D42;margin-bottom:8px;">
            ${esc(company.name || 'Architectural Furniture & Spatial Systems')}
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
              <div><strong>Email:</strong> <a style="color:#2B2D42;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></div>
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

              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #3b82f6);color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;">
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
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg, ${color}, #3b82f6);display:flex;align-items:center;justify-content:center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M20 7h-9M14 17H5M3 3v18M21 3v18M7 7v10M17 7v10"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Architectural Furniture & Spatial Systems')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#64748b;margin:0 0 16px;max-width:320px;">
            ${isZh ? '包豪斯家具与空间收纳 · 全球品质供应链' : 'Architectural Furniture & Spatial Systems · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '北美FAS级黑胡桃木悬浮隐形抽屉实木餐桌' : 'Solid Walnut Dining Tables'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '模块化自由组合铝框极简置物书架系统' : 'Modular Aluminum Bookshelves'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '人体工学曲木羊羔绒云朵单人休闲躺椅' : 'Bouclé Cloud Armchairs'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺实力' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('FAS Grade')} ${isZh ? '北美黑胡桃原产地纯度' : 'Genuine American Timber'}</li>
            <li>✓ ${esc('150 kg')} ${isZh ? '单层模块化隔板静载极限' : 'Per-Shelf Load Rating'}</li>
            <li>✓ ${esc('850,000')} ${isZh ? '年度现代家具与模块柜出货' : 'Annual Furniture Units'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#2B2D42;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #111827;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '包豪斯家具与空间收纳旗舰版' : 'Architectural Furniture & Spatial Systems Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
