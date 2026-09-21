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
    "id": "hd-1",
    "name": "Wabi-Sabi Hand-Thrown Textured Ceramic Vessel",
    "description": "Sculptural asymmetric ceramic flower vessel featuring hand-raked earthen clay texture, matte mineral finish, and interior watertight glazing.",
    "badge": "Wabi-Sabi Art",
    "category": "ceramic",
    "categoryNameZh": "手工粗陶侘寂风抽象褶皱艺术花器",
    "categoryNameEn": "Wabi-Sabi Ceramic Vessels",
    "spec1": "High-Fired Stoneware (1280°C) with Natural Ash Glaze",
    "spec2": "28 × 18 × 34 cm · 2.4 kg · Watertight Interior",
    "moq": "100 Pcs per Color",
    "tagline": "Imperfect Organic Serenity",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "hd-2",
    "name": "Roman Travertine Natural Stone Fragrance Candle Holder",
    "description": "Monolithic carved natural Roman beige travertine pillar with organic porous textures, housing a replaceable refillable glass candle cylinder.",
    "badge": "Natural Travertine",
    "category": "stone",
    "categoryNameZh": "罗马天然洞石原石雕琢香氛烛台组",
    "categoryNameEn": "Travertine Candle Holders",
    "spec1": "100% Solid Natural Roman Travertine Limestone",
    "spec2": "12 × 12 × 18 cm · 1.9 kg · Nano-Sealed Anti-Stain",
    "moq": "150 Pcs per Batch",
    "tagline": "Ancient Earth Carved by Light",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "hd-3",
    "name": "Nordic Smoked Gradient Hand-Blown Glass Vase",
    "description": "Mouth-blown heavy bottom crystal glass vase displaying a delicate fluid gradient from charcoal smoke to ethereal water clear.",
    "badge": "Hand-Blown Glass",
    "category": "glass",
    "categoryNameZh": "北欧极简哑光手工吹制渐变烟熏玻璃花瓶",
    "categoryNameEn": "Smoked Gradient Glass Vases",
    "spec1": "Lead-Free Heavyweight Crystal Glass",
    "spec2": "16 × 16 × 30 cm · 1.6 kg · Fire-Polished Rim",
    "moq": "200 Pcs per Order",
    "tagline": "Luminescent Fluid Poetry",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "hd-4",
    "name": "Abstract Geometric Sandstone Bas-Relief Wall Sculpture",
    "description": "Framed architectural wall panel sculpted from natural crushed sandstone and mineral gypsum, creating dramatic shadows under directional lighting.",
    "badge": "Wall Relief Art",
    "category": "wallart",
    "categoryNameZh": "几何极简抽象砂岩浮雕壁挂艺术装置",
    "categoryNameEn": "Sandstone Wall Sculptures",
    "spec1": "Mineral Sandstone Composite + Natural Walnut Frame",
    "spec2": "60 × 80 × 5 cm · Heavy-Duty Concealed Bracket",
    "moq": "80 Pcs per Batch",
    "tagline": "Shadow Play and Spatial Calm",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "hd-5",
    "name": "French Vintage Patinated Brass Arch Vanity Mirror",
    "description": "Elegantly arched tabletop mirror encased in solid antiqued unlacquered brass with beaded edge detailing and 360-degree swivel pivot.",
    "badge": "French Vintage",
    "category": "brass",
    "categoryNameZh": "法式复古黄铜做旧雕花弧形化妆梳妆镜",
    "categoryNameEn": "Vintage Brass Vanity Mirrors",
    "spec1": "Solid Cast Brass Frame + 5mm High-Definition Silver Mirror",
    "spec2": "35 × 15 × 48 cm · Heavy Weighted Stability Base",
    "moq": "100 Pcs per Batch",
    "tagline": "Gilded Boudoir Refinement",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "hd-6",
    "name": "Italian Carrara Marble & Walnut Wood Valet Catchall",
    "description": "Interlocking dual-material valet tray carved from solid Italian white Carrara marble slab and oiled American walnut hardwood.",
    "badge": "Marble & Walnut",
    "category": "tray",
    "categoryNameZh": "意式天然大理石与胡桃木多功能置物托盘",
    "categoryNameEn": "Marble & Walnut Valet Trays",
    "spec1": "Carrara White Marble + Solid American Walnut (FAS)",
    "spec2": "32 × 22 × 4 cm · Non-Slip Velvet Underside",
    "moq": "150 Pcs per Batch",
    "tagline": "Order and Tactile Elegance",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "hd-7",
    "name": "Kinetic Brass Mobile Hanging Balance Sculpture",
    "description": "Precisely calibrated kinetic mobile sculpture composed of spun brass discs and tempered stainless balance rods that dance with ambient airflow.",
    "badge": "Kinetic Sculpture",
    "category": "mobile",
    "categoryNameZh": "几何极简金属悬浮动态风铃雕塑",
    "categoryNameEn": "Kinetic Hanging Mobiles",
    "spec1": "Polished Brass Leaves + High-Tensile Steel Wire",
    "spec2": "65 × 85 cm Span · Gentle Silent Airflow Rotation",
    "moq": "100 Pcs per Batch",
    "tagline": "Sculptural Balance in Still Motion",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "hd-8",
    "name": "Artisan Soy Wax Amber Agarwood Sculptural Candle Set",
    "description": "Poured in textured raw ceramic cups with wooden crackling wicks, blended with pure natural agarwood, cedar, and Madagascar vanilla.",
    "badge": "Aromatherapy",
    "category": "candle",
    "categoryNameZh": "天然大豆蜡手工琥珀沉香艺术香薰礼盒",
    "categoryNameEn": "Artisan Scented Candles",
    "spec1": "100% Organic Soy Wax + Natural Plant Extracts",
    "spec2": "300g Net · 65 Hours Clean Burning · Double Wood Wick",
    "moq": "300 Sets per Scent",
    "tagline": "Sanctuary of Scent and Glow",
    "img": "/templates/senseng/products-8.jpg"
  }
];

export function renderHomeDecorPage(ctx: ThemeContext, isVideo: boolean): string {
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
            categoryNameZh: '自然美学空间与家居装饰',
            categoryNameEn: 'Aesthetic Living & Home Decor Studio',
            spec1: p.material || '',
            spec2: p.dimensions || '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : DEFAULT_PRODUCTS) as (Product | ThemedItem)[];

  const heroTitle = isZh ? '静谧时光 · 侘寂美学与艺术起居器物工坊' : 'Poetic Serenity & Tactile Home Aesthetics Guild';
  const heroSubtitle = isZh ? '从罗马天然洞石原石香氛烛台、手工粗陶侘寂花器到渐变手工吹制玻璃艺术摆件，为全球生活美学生活馆打造充满触感温度、诗意光影与大地肌理的现代软装陈设体系。' : 'From natural Roman travertine fragrance vessels and hand-thrown ceramic sculptures to gradient hand-blown art glass, crafting serene living spaces with earthy textures and sculptural grace.';

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
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg, ${color}, #a16207);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"/></svg>
          </div>
          <div>
            <div style="font-size:1.2rem;font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || 'Aesthetic Living & Home Decor Studio')}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:#C2A68C;font-weight:700;">
              ${isZh ? '自然美学空间与家居装饰' : 'Aesthetic Living & Home Decor Studio'}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:28px;" class="theme-nav-links">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'home' ? '#C2A68C' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'catalog' ? '#C2A68C' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'about' ? '#C2A68C' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'contact' ? '#C2A68C' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:100px;font-size:0.86rem;font-weight:700;color:#ffffff;background:linear-gradient(135deg, ${color}, #a16207);box-shadow:0 4px 18px rgba(0,0,0,0.35);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
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
              <span style="width:8px;height:8px;border-radius:50%;background:#C2A68C;box-shadow:0 0 10px #C2A68C;"></span>
              <span style="color:#ffffff;font-size:0.82rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${isZh ? '自然美学空间与家居装饰 · 4K全景动态短片' : 'Aesthetic Living & Home Decor Studio · 4K Cinematic Master'}</span>
            </div>
            <h1 style="font-size:clamp(2.4rem, 5.5vw, 4.2rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.12;margin:0 0 20px;" data-reveal="fade-up">
              ${esc(heroTitle)}
            </h1>
            <p style="font-size:clamp(1.05rem, 1.8vw, 1.3rem);line-height:1.6;color:#cbd5e1;margin:0 0 32px;max-width:760px;" data-reveal="fade-up">
              ${esc(heroSubtitle)}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #a16207);box-shadow:0 8px 24px rgba(0,0,0,0.4);display:inline-flex;align-items:center;gap:10px;">
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
          <div style="position:absolute;top:-20%;right:-10%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle, #C2A68C26 0%, transparent 70%);filter:blur(80px);pointer-events:none;"></div>
          <div class="wrap" style="position:relative;z-index:2;display:grid;grid-template-columns:1.2fr 0.8fr;gap:50px;align-items:center;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:100px;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);margin-bottom:20px;" data-reveal="fade-up">
                <span style="color:#C2A68C;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isZh ? '自然美学空间与家居装饰' : 'Aesthetic Living & Home Decor Studio'}</span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 4.8vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 20px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:1.15rem;line-height:1.7;color:#cbd5e1;margin:0 0 32px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #a16207);box-shadow:0 8px 24px rgba(0,0,0,0.35);display:inline-flex;align-items:center;gap:10px;">
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
              <div style="font-size:0.76rem;letter-spacing:0.12em;text-transform:uppercase;color:#C2A68C;font-weight:800;margin-bottom:12px;">
                ${isZh ? '匠作核心优势' : 'CRAFT PILLARS'}
              </div>
              <h3 style="font-size:1.4rem;font-weight:800;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '罗马天然洞石原石数控切割' : 'Roman Travertine Stone Sculpting'}
              </h3>
              <p style="font-size:0.92rem;line-height:1.6;color:#94a3b8;margin:0 0 24px;">
                ${isZh ? '精选意大利进口天然米黄洞石与超白洞石原矿，保留天然微孔肌理与沉静大地质感。' : 'Direct extraction from Italian quarries, preserving natural pore textures and organic mineral serenity.'}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#ffffff;">${esc('100% Stone')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '天然罗马原石开采率' : 'Genuine Natural Stone'}</div>
                </div>
                <div>
                  <div style="font-size:1.5rem;font-weight:900;color:#C2A68C;">${esc('1280°C')}</div>
                  <div style="font-size:0.78rem;color:#94a3b8;">${isZh ? '高温窑火淬炼纯粹肌理' : 'Kiln Firing Temperature'}</div>
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#C2A68C;margin-bottom:10px;">
              ${isZh ? '核心工艺矩阵' : 'CORE CAPABILITIES'}
            </div>
            <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${isZh ? '世界级工艺制造标准' : 'World-Class Manufacturing Standards'}
            </h2>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C2A68C;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  01
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '罗马天然洞石原石数控切割' : 'Roman Travertine Stone Sculpting'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '精选意大利进口天然米黄洞石与超白洞石原矿，保留天然微孔肌理与沉静大地质感。' : 'Direct extraction from Italian quarries, preserving natural pore textures and organic mineral serenity.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C2A68C;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  02
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '1280°C 柴烧与高温慢烧陶艺' : '1280°C High-Fire Ceramic Craft'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '手工拉胚配以天然草木灰与矿物泥浆釉，经受长时间慢火淬炼，每件器物拥有独一无二的窑变色泽。' : 'Hand-thrown silhouettes coated with botanical ash glazes, slow-fired to achieve bespoke natural kiln shifts.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C2A68C;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  03
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '非物质文化遗产手工吹制玻璃' : 'Hand-Blown Gradient Art Glass'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '无铅环保高透高硼硅与水晶玻璃，大师级纯手工旋转吹制退火，呈现微气泡光影折射美感。' : 'Lead-free crystal glass, spun and mouth-blown by veteran glassmakers, yielding gentle refractive luminescence.'}
                </p>
              </div>
            
              <div style="padding:32px 26px;border-radius:22px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);transition:all 0.3s ease;" class="wr-card-hover" data-reveal="fade-up">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#C2A68C;font-weight:900;font-size:1.1rem;margin-bottom:20px;">
                  04
                </div>
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 12px;">
                  ${isZh ? '全植物大豆蜡与天然沉香精油' : 'Botanical Soy Wax & Essential Oils'}
                </h3>
                <p style="font-size:0.88rem;line-height:1.65;color:#94a3b8;margin:0;">
                  ${isZh ? '100% 天然非转基因大豆蜡与蜂蜡，复合天然植物单体与木质沉香精油，无烟环保纯净燃烧。' : 'Non-GMO organic soy and beeswax blend, infused with botanical woody extracts for soot-free, clean burning.'}
                </p>
              </div>
            
          </div>
        </section>

        <!-- 8-Product Showcase Grid -->
        <section class="wrap" style="padding:40px 0 90px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:16px;" data-reveal="fade-up">
            <div>
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#C2A68C;margin-bottom:8px;">
                ${isZh ? '精选品类橱窗' : 'FLAGSHIP COLLECTION'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0;">
                ${isZh ? '自然美学空间与家居装饰经典作品系列' : 'Aesthetic Living & Home Decor Studio Catalog Showcase'}
              </h2>
            </div>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:#C2A68C;display:inline-flex;align-items:center;gap:6px;">
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
                    <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:#C2A68C;text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Aesthetic Living & Home Decor Studio')}
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
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#C2A68C;margin-bottom:10px;">
                ${isZh ? '严苛检测与认证' : 'TECHNICAL LAB STANDARDS'}
              </div>
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
                ${isZh ? '空间软装美学工艺与材质品控' : 'Spatial Interior Craft & Material Integrity Standards'}
              </h2>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C2A68C;margin-bottom:10px;">01</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '天然石材食品级防水防油渗透养护' : 'Stone Nano-Sealing & Anti-Stain Treatment'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '全表面进行德国进口环保纳米浸透封闭处理，既保留原石天然触感，又防止水渍咖啡油污渗透。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C2A68C;margin-bottom:10px;">02</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '陶瓷抗急冷急热抗震物理测试' : 'Thermal Shock Resistance (200°C to 20°C)'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '器物经受高温骤冷循环实验，无釉裂无开裂，结构致密坚硬吸水率小于 0.2%。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C2A68C;margin-bottom:10px;">03</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '手工雕琢黄铜表面抗氧化封釉' : 'Antiqued Patina & Microcrystalline Wax Sealing'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '复古色泽采用天然化学酸热着色，并经手工微晶蜡热封，长久使用抗指纹且温润如玉。' : 'undefined'}
                  </p>
                </div>
              
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);" data-reveal="fade-up">
                  <div style="font-size:1.6rem;font-weight:900;color:#C2A68C;margin-bottom:10px;">04</div>
                  <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                    ${isZh ? '国际环保包装与抗冲击跌落防护' : 'Drop-Tested Sustainable Gift Packaging'}
                  </h3>
                  <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0;">
                    ${isZh ? '蜂窝降解纸浆模塑定制内衬，通过 ISTA-1A 国际重力跌落运输认证，确保跨国远洋物流破损率为零。' : 'undefined'}
                  </p>
                </div>
              
            </div>
          </div>
        </section>

        <!-- Metric Counters -->
        <section class="wrap" style="padding:80px 0;" data-reveal="fade-up">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;">
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="100" data-suffix="% Stone">
                  100% Stone
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '天然罗马原石开采率' : 'Genuine Natural Stone'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">No synthetic resin</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="1280" data-suffix="°C">
                  1280°C
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '高温窑火淬炼纯粹肌理' : 'Kiln Firing Temperature'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Dense non-porous ceramic</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="1800000" data-suffix=" Pcs">
                  1,800,000
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '年度生活美学器物出口' : 'Annual Decor Pieces'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Worldwide concept stores</div>
              </div>
            
              <div style="padding:32px 20px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;line-height:1;margin-bottom:10px;" data-counter="5" data-suffix=" Days">
                  5-7 Days
                </div>
                <div style="font-size:0.86rem;color:#cbd5e1;font-weight:700;">
                  ${isZh ? '造型泥稿与3D原型打样' : 'Rapid Ceramic Prototype'}
                </div>
                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Master studio sculpt</div>
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
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:16px 38px;border-radius:100px;font-size:1rem;font-weight:800;color:#ffffff;background:linear-gradient(135deg, ${color}, #a16207);display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 25px rgba(0,0,0,0.4);">
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C2A68C;margin-bottom:6px;">
            ${esc(company.name || 'Aesthetic Living & Home Decor Studio')}
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
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:100px;background:linear-gradient(135deg, ${color}, #a16207);color:#ffffff;font-size:0.82rem;font-weight:700;">
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
          <span style="color:#C2A68C;">${esc(selectedProduct.name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
          <!-- Product Image -->
          <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);position:relative;">
            <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
          </div>

          <!-- Product Details -->
          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C2A68C;margin-bottom:10px;">
              ${esc(meta.categoryNameEn || 'Aesthetic Living & Home Decor Studio')}
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
                <button type="submit" style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #a16207);color:#ffffff;font-size:0.96rem;font-weight:800;border:none;cursor:pointer;">
                  ${isZh ? '提交样品打样申请' : 'Submit Sample Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const aboutHeadline = getAboutHeadline(company, isZh ? '静谧时光 · 侘寂美学与艺术起居器物工坊' : 'Poetic Serenity & Tactile Home Aesthetics Guild');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Craftsmanship heritage' },
      { value: '100% Stone', num: 100, suffix: '% Stone', label: isZh ? '天然罗马原石开采率' : 'Genuine Natural Stone', desc: 'No synthetic resin' },
      { value: '1280°C', num: 1280, suffix: '°C', label: isZh ? '高温窑火淬炼纯粹肌理' : 'Kiln Firing Temperature', desc: 'Dense non-porous ceramic' },
      { value: '5-7 Days', num: 5, suffix: ' Days', label: isZh ? '造型泥稿与3D原型打样' : 'Rapid Ceramic Prototype', desc: 'Master studio sculpt' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:800px;margin:0 auto 60px;text-align:center;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#C2A68C;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
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
              <div style="font-size:2.8rem;font-weight:900;color:#C2A68C;line-height:1;"><span>${esc(h.value)}</span></div>
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
          <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C2A68C;margin-bottom:8px;">
            ${esc(company.name || 'Aesthetic Living & Home Decor Studio')}
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
              <div><strong>Email:</strong> <a style="color:#C2A68C;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></div>
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

              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #a16207);color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;">
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
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg, ${color}, #a16207);display:flex;align-items:center;justify-content:center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'Aesthetic Living & Home Decor Studio')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#64748b;margin:0 0 16px;max-width:320px;">
            ${isZh ? '自然美学空间与家居装饰 · 全球品质供应链' : 'Aesthetic Living & Home Decor Studio · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '手工粗陶侘寂风抽象褶皱艺术花器' : 'Wabi-Sabi Ceramic Vessels'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '罗马天然洞石原石雕琢香氛烛台组' : 'Travertine Candle Holders'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '北欧极简哑光手工吹制渐变烟熏玻璃花瓶' : 'Smoked Gradient Glass Vases'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心工艺实力' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('100% Stone')} ${isZh ? '天然罗马原石开采率' : 'Genuine Natural Stone'}</li>
            <li>✓ ${esc('1280°C')} ${isZh ? '高温窑火淬炼纯粹肌理' : 'Kiln Firing Temperature'}</li>
            <li>✓ ${esc('1,800,000')} ${isZh ? '年度生活美学器物出口' : 'Annual Decor Pieces'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#C2A68C;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #111827;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '自然美学空间与家居装饰旗舰版' : 'Aesthetic Living & Home Decor Studio Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
