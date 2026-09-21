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
    "id": "jwl-1",
    "name": "Solitaire Brilliant-Cut Pavé Diamond Engagement Ring",
    "description": "2.5ct GIA-certified D-Flawless round brilliant-cut centerpiece mounted on hand-polished 950 platinum with triple-row micro-pavé band.",
    "badge": "Haute Joaillerie",
    "category": "ring",
    "categoryNameZh": "GIA认证D色极品微镶六爪钻石戒指",
    "categoryNameEn": "Haute Diamond Solitaires",
    "spec1": "950 Platinum + 2.50ct D/FL Triple Excellent Cut Diamond",
    "spec2": "Clarity: Flawless · Polish: EX · Symmetry: EX",
    "moq": "10 Pcs per Design",
    "tagline": "Eternal Light of Pure Radiance",
    "img": "/templates/senseng/products-1.jpg"
  },
  {
    "id": "jwl-2",
    "name": "Haute Horlogerie Skeleton Tourbillon Mechanical Watch",
    "description": "In-house manual winding flying tourbillon movement, hand-beveled bridges with Côte de Genève finish, and 72-hour power reserve indicator.",
    "badge": "Grand Complication",
    "category": "watch",
    "categoryNameZh": "日内瓦波纹手工倒角镂空飞行陀飞轮腕表",
    "categoryNameEn": "Flying Tourbillon Timepieces",
    "spec1": "Grade 5 Titanium Case + Sapphire Crystal Front & Back",
    "spec2": "42mm Diameter · 28,800 vph · 72h Reserve · 5 ATM Water Resistant",
    "moq": "5 Pcs per Batch",
    "tagline": "Mechanical Poetry in Micro-Horology",
    "img": "/templates/senseng/products-2.jpg"
  },
  {
    "id": "jwl-3",
    "name": "Colombian Emerald & 18K Yellow Gold Pendant Necklace",
    "description": "Minor oil natural vivid green Colombian emerald encircled by marquise diamonds on hand-woven 18K royal yellow gold Byzantine chain.",
    "badge": "Royal Gemstone",
    "category": "necklace",
    "categoryNameZh": "哥伦比亚微油祖母绿18K黄金项链",
    "categoryNameEn": "Fine Emerald Pendants",
    "spec1": "18K Royal Yellow Gold (Au750) + 3.8ct Vivid Green Emerald",
    "spec2": "45cm Adjustable Link Chain · GRS Gemstone Report",
    "moq": "15 Pcs per Style",
    "tagline": "Verdant Splendor of Noble Heritage",
    "img": "/templates/senseng/products-3.jpg"
  },
  {
    "id": "jwl-4",
    "name": "Swiss Dual-Time Automatic Chronograph Diver Watch",
    "description": "COSC-certified automatic chronometer with bidirectional ceramic bezel, luminous Super-LumiNova BGW9 indices, and 300m helium release valve.",
    "badge": "Certified Chronometer",
    "category": "watch",
    "categoryNameZh": "COSC天文台双时区自动机械潜水计时码表",
    "categoryNameEn": "Dual-Time Chronographs",
    "spec1": "316L Surgical Stainless Steel + High-Tech Ceramic Bezel",
    "spec2": "43mm · Calibre SW510 Automatic · 300M / 30 ATM Water Resistant",
    "moq": "20 Pcs per Run",
    "tagline": "Precision Without Boundaries",
    "img": "/templates/senseng/products-4.jpg"
  },
  {
    "id": "jwl-5",
    "name": "Natural South Sea Golden Pearl & Diamond Drop Earrings",
    "description": "Matched pair of 13-14mm AAA-grade natural gold South Sea cultured pearls suspended from 18K white gold diamond-set cascade stems.",
    "badge": "Luminous Pearl",
    "category": "earrings",
    "categoryNameZh": "南洋金珠天然无瑕18K白金钻石耳坠",
    "categoryNameEn": "South Sea Pearl Jewelry",
    "spec1": "18K White Gold + 13-14mm AAA Golden South Sea Pearls",
    "spec2": "Mirror Luster · Flawless Surface · Butterfly Friction Backs",
    "moq": "20 Pairs per Order",
    "tagline": "Organic Glow of Oceanic Royalty",
    "img": "/templates/senseng/products-5.jpg"
  },
  {
    "id": "jwl-6",
    "name": "Art Deco Hand-Engraved Platinum Eternity Wedding Band",
    "description": "Continuous channel-set baguette diamonds framed by hand-graved milgrain scrollwork inspired by 1920s Parisian high jewelry aesthetics.",
    "badge": "Art Deco Legacy",
    "category": "ring",
    "categoryNameZh": "法式手雕滚珠边梯方钻白金永恒戒",
    "categoryNameEn": "Baguette Eternity Bands",
    "spec1": "950 Platinum + 1.80ct F/VS Step-Cut Baguette Diamonds",
    "spec2": "3.5mm Band Width · Comfort Fit Inner Contour",
    "moq": "25 Pcs per Batch",
    "tagline": "Architectural Geometry in Platinum",
    "img": "/templates/senseng/products-6.jpg"
  },
  {
    "id": "jwl-7",
    "name": "Vintage Rose Gold Moonphase Master Complication Watch",
    "description": "Complete astronomical calendar timepiece with hand-painted enamel moonphase disc, date pointer, day/month apertures in 18K rose gold.",
    "badge": "Astronomical Master",
    "category": "watch",
    "categoryNameZh": "18K玫瑰金全历月相大师系列机械腕表",
    "categoryNameEn": "Rose Gold Moonphase",
    "spec1": "18K Rose Gold (Au750) Case + Alligator Leather Strap",
    "spec2": "40mm · Calibre 9100 Automatic · Enamel Moonphase Disc",
    "moq": "10 Pcs per Batch",
    "tagline": "The Poetry of Celestial Timekeeping",
    "img": "/templates/senseng/products-7.jpg"
  },
  {
    "id": "jwl-8",
    "name": "Geometric Baguette Diamond Architectural Tennis Bracelet",
    "description": "Articulated seamless line bracelet featuring 8.5 carats of precision-calibrated step-cut baguette diamonds with double-safety concealed clasp.",
    "badge": "Haute Joaillerie",
    "category": "bracelet",
    "categoryNameZh": "高定无缝阶梯方钻双重安全扣手线手镯",
    "categoryNameEn": "Baguette Tennis Bracelets",
    "spec1": "18K White Gold + 8.50ct Total Weight F/VS Baguette Diamonds",
    "spec2": "18cm Length · 4mm Profile · Concealed Dual Safety Box Clasp",
    "moq": "15 Pcs per Order",
    "tagline": "Unbroken Ribbon of Diamond Radiance",
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
            categoryNameZh: '高级珠宝与腕表定制',
            categoryNameEn: 'Fine Jewelry & Luxury Watches',
            spec1: p.material || '',
            spec2: p.dimensions || '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : DEFAULT_PRODUCTS) as (Product | ThemedItem)[];

  const defaultMeta = DEFAULT_PRODUCTS[0];
  const isDetail = page === 'detail';
  const selectedProduct = (isDetail
    ? products.find((p) => p.id === options.productId) || products[0]
    : products[0]) || defaultMeta;

  const pMeta = (selectedProduct as ThemedItem)?.spec1
    ? (selectedProduct as ThemedItem)
    : defaultMeta;

  // Visual Theme Configuration
  // isVideo = false: jewelry-luxury-banner (Pure Black Velvet Onyx & Champagne Gold Haute Joaillerie)
  // isVideo = true: jewelry-timeless-video (Geneva Midnight Blue & Rose Gold Haute Horlogerie)
  const theme = isVideo ? {
    name: 'timeless-video',
    bg: '#060c18',
    bgSoft: '#0d1628',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(226, 167, 132, 0.22)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textSub: '#64748b',
    primary: '#e2a784', // Swiss Rose Gold
    accent: '#38bdf8',
    headerBg: 'rgba(6, 12, 24, 0.88)',
    headerBorder: 'rgba(226, 167, 132, 0.25)',
    inputBg: 'rgba(13, 22, 40, 0.7)',
    inputBorder: 'rgba(226, 167, 132, 0.3)',
    inputText: '#ffffff',
    badgeBg: 'rgba(226, 167, 132, 0.12)',
    badgeText: '#e2a784',
    badgeBorder: 'rgba(226, 167, 132, 0.35)',
    btnGradient: 'linear-gradient(135deg, #e2a784 0%, #c88265 100%)',
    btnText: '#1a0d08',
    pillActive: '#e2a784',
    pillText: '#060c18',
    footerBg: '#03060c',
    footerBorder: '#162035',
  } : {
    name: 'luxury-banner',
    bg: '#08080a',
    bgSoft: '#121216',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(212, 175, 55, 0.25)',
    text: '#f5f5f7',
    textMuted: '#a1a1aa',
    textSub: '#71717a',
    primary: '#d4af37', // Champagne Royal Gold
    accent: '#f3e5ab',
    headerBg: 'rgba(8, 8, 10, 0.9)',
    headerBorder: 'rgba(212, 175, 55, 0.25)',
    inputBg: 'rgba(20, 20, 26, 0.7)',
    inputBorder: 'rgba(212, 175, 55, 0.3)',
    inputText: '#ffffff',
    badgeBg: 'rgba(212, 175, 55, 0.12)',
    badgeText: '#f3e5ab',
    badgeBorder: 'rgba(212, 175, 55, 0.35)',
    btnGradient: 'linear-gradient(135deg, #d4af37 0%, #aa8214 100%)',
    btnText: '#08080a',
    pillActive: '#d4af37',
    pillText: '#08080a',
    footerBg: '#040405',
    footerBorder: '#1c1b18',
  };

  const heroTitle = isVideo
    ? (isZh ? '日内瓦高级制表 · 复杂机械机芯与飞行陀飞轮' : 'Swiss Haute Horlogerie & Grand Complications')
    : (isZh ? '旺多姆广场高定珠宝 · 璀璨钻石与传世稀世宝石' : 'Place Vendôme Haute Joaillerie & Solitaire Diamonds');

  const heroSubtitle = isVideo
    ? (isZh ? '28,800 次/小时高频摆频，手工倒角与日内瓦波纹打磨。经受严苛 COSC 瑞士天文台认证与 300 米深海氦气阀实验，致敬微机械永恒心跳。'
            : 'Hand-beveled bridges with Côte de Genève finishes, 28,800 vph oscillating tourbillon, and COSC chronometer testing.')
    : (isZh ? '精选 GIA 认证 D 色无瑕特级切工天然钻石与哥伦比亚微油祖母绿。传承法国百年密镶工艺与 950 铂金锻造，铸就跨越世纪的华美篇章。'
            : 'GIA-certified D-Flawless diamonds, royal Colombian emeralds, and 950 platinum micro-pavé settings crafted in Parisian high jewelry traditions.');

  // Header Component
  const headerHtml = `
    <header class="theme-header" style="position:sticky;top:0;z-index:99;background:${theme.headerBg};backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${theme.headerBorder};">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:8px;background:${theme.btnGradient};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(212,175,55,0.25);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div>
            <div style="font-size:1.15rem;font-weight:900;letter-spacing:-0.02em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || (isVideo ? 'Geneva Horlogerie Atelier' : 'Vendôme High Jewelry'))}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:${theme.primary};font-weight:800;">
              ${isZh ? (isVideo ? '瑞士复杂机械腕表' : '旺多姆高定珠宝工坊') : (isVideo ? 'Geneva Haute Horlogerie' : 'Haute Joaillerie Atelier')}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:26px;" class="theme-nav-links">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:9px 20px;border-radius:8px;font-size:0.86rem;font-weight:800;color:${theme.btnText};background:${theme.btnGradient};box-shadow:0 4px 14px rgba(0,0,0,0.3);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
            <span>${isZh ? 'VIP 私享定制预约' : 'VIP Consultation'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // -------------------------------------------------------------
      // 1. VIDEO TEMPLATE: Geneva Haute Horlogerie & Skeleton Tourbillon
      // -------------------------------------------------------------
      const videoAsset = ctx.asset(draft.heroAssetId);
      const heroPoster = '/templates/senseng/hero-sky.jpg';

      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Horological Tourbillon Movement Video -->
          <section style="position:relative;width:100%;min-height:85vh;overflow:hidden;background:#03070f;display:flex;align-items:center;">
            <video autoplay loop muted playsinline poster="${esc(heroPoster)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.45;z-index:1;">
              ${videoAsset ? `<source src="${esc(videoAsset)}" type="video/mp4">` : ''}
            </video>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 65% 35%, rgba(226,167,132,0.18) 0%, rgba(6,12,24,0.85) 75%, #060c18 100%);z-index:2;"></div>
            
            <div class="wrap" style="position:relative;z-index:3;padding:90px 20px;max-width:980px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:20px;" data-reveal="fade-up">
                <span style="width:8px;height:8px;border-radius:50%;background:${theme.primary};box-shadow:0 0 8px ${theme.primary};"></span>
                <span style="color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                  ${isZh ? '瑞士独立制表 · 日内瓦高级复杂机芯' : 'SWISS CALIBRE ANATOMY & FLYING TOURBILLON'}
                </span>
              </div>
              <h1 style="font-size:clamp(2.4rem, 5vw, 4rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 22px;" data-reveal="fade-up">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:clamp(1.05rem, 1.8vw, 1.25rem);line-height:1.7;color:${theme.textMuted};margin:0 0 36px;max-width:740px;" data-reveal="fade-up">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;" data-reveal="fade-up">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 34px;border-radius:8px;font-size:0.98rem;font-weight:800;color:${theme.btnText};background:${theme.btnGradient};box-shadow:0 8px 24px rgba(226,167,132,0.3);">
                  ${isZh ? '鉴赏大师系列腕表' : 'Explore Master Complications'} ↗
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;font-size:0.98rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);">
                  ${isZh ? '定制机芯与大宗分销' : 'Calibre OEM & Distribution'}
                </a>
              </div>
            </div>
          </section>

          <!-- Horological Precision Standards & COSC Chronometer -->
          <section class="wrap" style="padding:70px 0 30px;" data-reveal="fade-up">
            <div style="background:${theme.bgSoft};border:1px solid ${theme.cardBorder};border-radius:20px;padding:40px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px;flex-wrap:wrap;gap:16px;">
                <div>
                  <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">HOROLOGY METRICS</span>
                  <h2 style="font-size:clamp(1.6rem, 2.5vw, 2.2rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                    ${isZh ? '瑞士天文台精准度与机芯指标' : 'Chronometric Precision & Calibre Specs'}
                  </h2>
                </div>
                <div style="font-size:0.88rem;color:${theme.textMuted};">
                  ${isZh ? '通过瑞士官方 COSC 天文台与 ISO 6425 潜水标准认证' : 'ISO 6425 & COSC Certified Calibres'}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};" data-counter="28800" data-suffix=" vph">28,800</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '微机械振频每小时' : 'High-Frequency Oscillations'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Glucydur balance wheel</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;" data-counter="72" data-suffix=" Hours">72h</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '双发条盒动力储存' : 'Twin-Barrel Power Reserve'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Constant torque delivery</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:${theme.primary};">300 M</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '深潜专业氦气防护' : '30 ATM Water Resistance'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">Automatic helium release valve</div>
                </div>
                <div style="padding:24px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:2.4rem;font-weight:900;color:#ffffff;">COSC</div>
                  <div style="font-weight:700;color:#ffffff;margin-top:4px;">${isZh ? '瑞士官方日差 -4/+6 秒' : 'Official Swiss Chronometer'}</div>
                  <div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">15 days multi-temperature testing</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Masterpiece Watch Grid -->
          <section class="wrap" style="padding:50px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">COMPLICATION COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                  ${isZh ? '高级机械腕表全系' : 'Grand Complication Collection'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '浏览全部品项 ↗' : 'View All Timepieces ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:#03070f;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(6,12,24,0.85);backdrop-filter:blur(8px);border:1px solid ${theme.primary};color:${theme.primary};">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                      <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                        ${esc(meta.categoryNameEn || 'Haute Horlogerie')}
                      </div>
                      <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;line-height:1.3;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.84rem;color:${theme.textMuted};line-height:1.55;margin:0 0 16px;flex:1;">
                        ${esc(item.description || '')}
                      </p>
                      <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;color:${theme.textSub};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:6px 14px;border-radius:6px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.8rem;font-weight:800;">
                          ${esc(ui.details)} ↗
                        </a>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>
        </main>
      `;
    } else {
      // -------------------------------------------------------------
      // 2. BANNER TEMPLATE: Place Vendôme Haute Joaillerie & 4Cs
      // -------------------------------------------------------------
      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;">
          <!-- Hero Section: Pure Black Onyx & Champagne Gold Diamond Banner -->
          <section style="position:relative;padding:90px 0 80px;border-bottom:1px solid ${theme.cardBorder};background:radial-gradient(circle at 70% 30%, rgba(212,175,55,0.1) 0%, #08080a 70%);">
            <div class="wrap" style="display:grid;grid-template-columns:1.15fr 1fr;gap:50px;align-items:center;">
              <div data-reveal="fade-up">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};margin-bottom:18px;">
                  <span style="font-size:0.75rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${theme.badgeText};">
                    PLACE VENDÔME HIGH JEWELRY · GIA CERTIFIED
                  </span>
                </div>
                <h1 style="font-size:clamp(2.4rem, 4.4vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;margin:0 0 20px;">
                  ${esc(heroTitle)}
                </h1>
                <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:580px;">
                  ${esc(heroSubtitle)}
                </p>
                <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:8px;font-size:0.95rem;font-weight:800;color:${theme.btnText};background:${theme.btnGradient};box-shadow:0 6px 18px rgba(212,175,55,0.25);">
                    ${isZh ? '品鉴高定珠宝臻品' : 'Explore Fine Jewelry'} ↗
                  </a>
                  <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;padding:13px 26px;border-radius:8px;font-size:0.95rem;font-weight:700;color:#ffffff;background:rgba(255,255,255,0.06);border:1px solid rgba(212,175,55,0.3);">
                    ${isZh ? '4Cs 钻石分级与工坊传承' : 'The 4Cs Diamond Heritage'}
                  </a>
                </div>
              </div>

              <!-- Hero Featured Ring Card (Pure Black Velvet Box Style) -->
              <div data-reveal="fade-up" style="background:#101014;border:1px solid rgba(212,175,55,0.3);border-radius:20px;padding:24px;box-shadow:0 12px 36px rgba(0,0,0,0.6);">
                <div style="position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#050507;margin-bottom:20px;">
                  <img src="${esc(defaultMeta.img)}" alt="${esc(defaultMeta.name)}" style="width:100%;height:100%;object-fit:cover;">
                  <span style="position:absolute;bottom:12px;left:12px;padding:4px 12px;border-radius:4px;background:rgba(8,8,10,0.85);backdrop-filter:blur(8px);border:1px solid ${theme.primary};color:${theme.primary};font-size:0.75rem;font-weight:800;">
                    GIA D-Flawless Diamond
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 4px;">
                      ${esc(defaultMeta.name)}
                    </h3>
                    <p style="font-size:0.82rem;color:${theme.textMuted};margin:0;">
                      ${esc(defaultMeta.spec1)}
                    </p>
                  </div>
                  <a href="${path(`products/${defaultMeta.id}/index.html`)}" ${navAttrs('detail', defaultMeta.id)} style="text-decoration:none;padding:8px 16px;border-radius:6px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.82rem;font-weight:800;">
                    ${esc(ui.details)} ↗
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- The 4Cs Diamond Grading Standards (Unique to Luxury Banner) -->
          <section class="wrap" style="padding:80px 0 50px;" data-reveal="fade-up">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};">DIAMOND STANDARDS</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:8px 0 14px;">
                ${isZh ? 'GIA 严苛 4Cs 钻石分级与切工标准' : 'The 4Cs Diamond Grading Mastery'}
              </h2>
              <p style="font-size:1rem;color:${theme.textMuted};line-height:1.7;margin:0;">
                ${isZh ? '严格只选用全球前 1% 的顶级原石，结合 57 面经典明亮式微米级对称切工，释放极致火彩。'
                        : 'Exclusively selecting the top 1% of rough diamonds, cut with 57 micro-faceted angles for unmatched brilliance.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              <div style="background:#101014;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">CUT / TRIPLE EXCELLENT</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                  ${isZh ? '3EX 完美八心八箭光学对称' : 'Hearts & Arrows Precision'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '台宽比、冠角与亭深严格符合托尔科夫斯基理想切工比例，全内反射杜绝漏光，呈现火彩风暴。'
                          : 'Proportions adhere strictly to Tolkowsky ideal optics, maximizing total internal light refraction.'}
                </p>
              </div>

              <div style="background:#101014;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">COLOR / D-E-F PURE</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                  ${isZh ? '无色级纯净冰莹光彩' : 'Colorless D-F Purity'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '在标准比色石与纯白冷光下完全无杂色微黄，如南极万年冰川般透彻晶莹，极具传世保值力。'
                          : 'Zero yellow tint under standard master stones, crystalline as millennia-old glacial ice.'}
                </p>
              </div>

              <div style="background:#101014;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;">
                <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};margin-bottom:12px;">CLARITY / FL-VVS</div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
                  ${isZh ? '10倍放大镜下肉眼无瑕' : 'Flawless Microscopic Clarity'}
                </h3>
                <p style="font-size:0.86rem;line-height:1.6;color:${theme.textMuted};margin:0;">
                  ${isZh ? '经资深 GIA 宝石学家双重显微镜复检，晶体内部无云雾状包体或裂隙，光线穿透纯净无阻。'
                          : 'Double-inspected under gemological microscopes, devoid of clouds, feathering, or carbon pinpoints.'}
                </p>
              </div>
            </div>
          </section>

          <!-- Haute Joaillerie Catalog Grid -->
          <section class="wrap" style="padding:20px 0 80px;" data-reveal="fade-up">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
                  ${isZh ? '高级珠宝臻选矩阵' : 'Fine Jewelry & Solitaire Collection'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.92rem;">
                ${isZh ? '品鉴全部 8 款典藏 ↗' : 'View Full Collection ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[0];
                const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
                return `
                  <article style="background:#101014;border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:78%;overflow:hidden;background:#050507;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:3px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:rgba(8,8,10,0.85);color:${theme.primary};border:1px solid ${theme.primary};">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.12rem;font-weight:800;color:#ffffff;line-height:1.3;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.description || '')}
                      </p>
                      <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;font-weight:700;color:${theme.textSub};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.82rem;font-weight:800;">
                          ${esc(ui.details)} ↗
                        </a>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    // -------------------------------------------------------------
    // CATALOG PAGE: High-Contrast Pure Black/Dark Sapphire Cards
    // -------------------------------------------------------------
    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Geneva Horlogerie Atelier' : 'Vendôme High Jewelry'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 14px;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '品鉴全系高级珠宝与精密复杂腕表，每一件均随附 GIA/GRS/COSC 国际权威鉴定证书与奢华丝绒包装礼盒。'
                      : 'Explore our complete fine jewelry and haute horlogerie collection, delivered with international gemstone reports and luxury presentation boxes.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedItem).spec1 ? (item as ThemedItem) : DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as Product);
              return `
                <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.4);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:80%;overflow:hidden;background:#03050a;">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    ${meta.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;color:${theme.primary};background:rgba(6,10,18,0.85);border:1px solid ${theme.primary};">${esc(meta.badge)}</span>` : ''}
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn || 'Haute Joaillerie')}
                    </div>
                    <h2 style="font-size:1.12rem;font-weight:800;color:#ffffff;line-height:1.35;margin:0 0 8px;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.description || '')}
                    </p>
                    <div style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:8px;font-size:0.78rem;color:${theme.textSub};margin-bottom:16px;">
                      <strong>${isZh ? '材质规格' : 'Spec'}:</strong> ${esc(meta.spec1 || 'Standard')}
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.82rem;font-weight:800;">
                        ${esc(ui.details)} ↗
                      </a>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </main>
    `;
  } else if (page === 'detail') {
    // -------------------------------------------------------------
    // DETAIL PAGE: GIA Certs & Macro Image with id="wr-detail-main-img"
    // -------------------------------------------------------------
    const meta = (selectedProduct as ThemedItem).spec1 ? (selectedProduct as ThemedItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img;

    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:40px 0 100px;">
        <div class="wrap">
          <nav aria-label="Breadcrumb" style="font-size:0.84rem;color:${theme.textSub};margin-bottom:28px;">
            <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
            <span style="margin:0 8px;">/</span>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
            <span style="margin:0 8px;">/</span>
            <span style="color:${theme.primary};font-weight:700;">${esc(selectedProduct.name)}</span>
          </nav>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:flex-start;">
            <!-- Main Product Image -->
            <div style="border-radius:18px;overflow:hidden;background:#03050a;border:1px solid ${theme.cardBorder};box-shadow:0 8px 30px rgba(0,0,0,0.6);">
              <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;display:block;" loading="lazy">
            </div>

            <!-- Product Specs & Inquiries -->
            <div>
              <div style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.categoryNameEn || 'Haute Joaillerie Specification')}
              </div>
              <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 16px;">
                ${esc(selectedProduct.name)}
              </h1>
              <p style="font-size:1.05rem;line-height:1.75;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(selectedProduct.description || '')}
              </p>

              <!-- Technical Specifications Table -->
              <div style="padding:22px;border-radius:14px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};margin-bottom:28px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.88rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '贵金属材质' : 'Precious Metal'}:</span>
                    <strong style="color:#ffffff;">${esc(meta.spec1 || (selectedProduct as any).material || '950 Platinum / 18K Gold')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '宝石评级' : 'Gem Grading'}:</span>
                    <strong style="color:#ffffff;">${esc(meta.spec2 || (selectedProduct as any).dimensions || 'GIA / COSC Certified')}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '防伪认证' : 'Certification'}:</span>
                    <strong style="color:#ffffff;">GIA / GRS / COSC Full Report</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;margin-bottom:4px;">${isZh ? '工坊起订批次' : 'MOQ'}:</span>
                    <strong style="color:#ffffff;">${esc(meta.moq || '10 Pcs')}</strong>
                  </div>
                </div>
              </div>

              <!-- High Contrast Sample & Quotation Form -->
              <div style="padding:28px;border-radius:16px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 6px 24px rgba(0,0,0,0.4);">
                <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 6px;">
                  ${isZh ? '预约高级珠宝鉴赏与批发报价' : 'Request Private Viewing & Bespoke Quote'}
                </h3>
                <p style="font-size:0.86rem;color:${theme.textMuted};margin:0 0 16px;">
                  ${isZh ? '支持专属戒圈定制、激光防伪刻码与全球保税押运送达。' : 'Supporting bespoke ring sizing, laser inscription, and secure insured global delivery.'}
                </p>
                <form action="${path('contact/index.html')}" method="GET" style="display:flex;flex-direction:column;gap:12px;">
                  <input type="hidden" name="productId" value="${esc(selectedProduct.id)}" />
                  <input type="email" placeholder="${isZh ? '输入您的企业采购邮箱' : 'Enter your corporate business email'}" required style="padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;outline:none;box-sizing:border-box;" />
                  <button type="submit" style="padding:13px;border-radius:8px;background:${theme.btnGradient};color:${theme.btnText};font-size:0.95rem;font-weight:800;border:none;cursor:pointer;">
                    ${isZh ? '提交专属鉴赏预约' : 'Submit Consultation Request'} ↗
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    // -------------------------------------------------------------
    // ABOUT PAGE: High Jewelry Atelier History & Gemology Standards
    // -------------------------------------------------------------
    const aboutHeadline = getAboutHeadline(company, isZh ? '传世风华 · 高级珠宝与瑞士精密腕表' : 'Heritage of High Jewelry & Swiss Horology');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2008', num: parseInt(company.establishedYear || '2008', 10), label: isZh ? '创办年份' : 'Established', desc: 'Geneva & Paris heritage' },
      { value: '100% GIA', num: 100, suffix: '%', label: isZh ? '主石国际双重权威报告' : 'GIA Certified Diamonds', desc: 'Conflict-free Kimberley pledge' },
      { value: '28,800 vph', num: 28800, suffix: ' vph', label: isZh ? '自产陀飞轮高频机械振频' : 'In-House Tourbillon Movement', desc: 'COSC certified precision' },
      { value: '7-10 Days', num: 7, suffix: ' Days', label: isZh ? '首饰贵金属极速3D蜡模' : 'Fast 3D Wax Prototyping', desc: 'Micron-precision casting' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:820px;margin:0 auto 60px;text-align:center;">
            <div style="display:inline-block;padding:4px 16px;border-radius:6px;background:${theme.badgeBg};border:1px solid ${theme.badgeBorder};color:${theme.badgeText};font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
              ${isZh ? '关于我们的传世工坊' : 'ABOUT OUR HAUTE ATELIER'}
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 24px;">
              ${esc(aboutHeadline)}
            </h1>
            <div style="display:flex;flex-direction:column;gap:18px;font-size:1.05rem;line-height:1.8;color:${theme.textMuted};text-align:left;">
              ${paragraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
          </div>

          <!-- Metric Counters Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;margin-bottom:60px;">
            ${highlights.map((h) => `
              <div style="padding:28px 20px;border-radius:14px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.3);">
                <div style="font-size:2.6rem;font-weight:900;color:${theme.primary};line-height:1;"><span>${esc(h.value)}</span></div>
                <div style="font-size:0.86rem;color:#ffffff;margin-top:10px;font-weight:700;">${esc(h.label)}</div>
                ${h.desc ? `<div style="font-size:0.78rem;color:${theme.textSub};margin-top:4px;">${esc(h.desc)}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Factory Imagery -->
          <div style="border-radius:18px;overflow:hidden;background:#03050a;border:1px solid ${theme.cardBorder};margin-bottom:40px;">
            <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:440px;object-fit:cover;display:block;" loading="lazy">
          </div>
        </div>
      </main>
    `;
  } else if (page === 'contact') {
    // -------------------------------------------------------------
    // CONTACT PAGE: High-Contrast Form & Clean Spacing
    // -------------------------------------------------------------
    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:100vh;padding:50px 0 100px;">
        <div class="wrap">
          <div style="max-width:800px;margin:0 auto 50px;text-align:center;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Geneva Horlogerie Atelier' : 'Vendôme High Jewelry'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${esc(ui.contact)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;">
              ${isZh ? '直接与我们的高级珠宝鉴定师与制表工程师对接，获取钻石报价单、机芯工程图与大宗采购合同。'
                      : 'Connect directly with our master gemologists and watchmakers for certified stone quotes, movement specifications, and VIP distribution.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:40px;align-items:flex-start;">
            <!-- Contact Details Card -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.4);">
              <h3 style="font-size:1.25rem;font-weight:800;color:#ffffff;margin:0 0 20px;">
                ${isZh ? '全球私享沙龙与工坊基地' : 'Global Salon & Atelier Base'}
              </h3>
              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.95rem;color:${theme.textMuted};">
                <div>
                  <strong style="color:#ffffff;display:block;margin-bottom:2px;">Direct Email:</strong>
                  <a style="color:${theme.primary};font-weight:700;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
                </div>
                ${company.phone ? `
                  <div>
                    <strong style="color:#ffffff;display:block;margin-bottom:2px;">Phone / Tel:</strong>
                    <a style="color:${theme.textMuted};text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
                  </div>
                ` : ''}
                ${company.address ? `
                  <div>
                    <strong style="color:#ffffff;display:block;margin-bottom:2px;">Salon Address:</strong>
                    <span style="line-height:1.5;">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>

              <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${theme.cardBorder};">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:8px;">
                  ${isZh ? '品质承诺' : 'ATELIER COMMITMENT'}
                </div>
                <ul style="margin:0;padding-left:18px;font-size:0.84rem;color:${theme.textSub};line-height:1.7;">
                  <li>${isZh ? '主石附带权威 GIA / GRS / IGI 国际全套检验证书' : 'GIA / GRS accredited grading certificates provided'}</li>
                  <li>${isZh ? '自产复杂机械机芯享 5 年全球联保与定期保养' : '5-Year international warranty on all mechanical calibres'}</li>
                  <li>${isZh ? '全程高额保价航空贵重品押运直达' : 'Fully insured international armored transit delivery'}</li>
                </ul>
              </div>
            </div>

            <!-- Contact Form Card with Crisp High-Contrast Fields -->
            <div style="padding:36px;border-radius:18px;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.4);">
              <h3 style="font-size:1.25rem;font-weight:800;color:#ffffff;margin:0 0 20px;">
                ${isZh ? '填写询价与定制需求' : 'Submit Consultation Request'}
              </h3>
              <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:18px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                      ${isZh ? '联系人姓名' : 'Your Name'} *
                    </label>
                    <input name="name" autocomplete="name" required maxlength="120" type="text" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                      ${isZh ? '企业电子邮箱' : 'Business Email'} *
                    </label>
                    <input name="email" type="email" autocomplete="email" required maxlength="254" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;" />
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                    ${isZh ? '意向品类' : 'Interested Jewelry Piece'} (${esc(ui.optional)})
                  </label>
                  <select name="productId" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;box-sizing:border-box;outline:none;">
                    <option value="">— ${isZh ? '选择感兴趣的高定珠宝或腕表' : 'Select Product of Interest'} —</option>
                    ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label style="display:block;font-size:0.84rem;font-weight:800;color:#ffffff;margin-bottom:6px;">
                    ${isZh ? '定制要求与采购说明' : 'Bespoke Requirements & Specifications'} *
                  </label>
                  <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请说明目标克拉数、切工要求、机芯型号或品牌联名需求...' : 'Please specify target carat size, metal purity, movement specs, or custom logo engraving...'}" style="width:100%;padding:13px 16px;border-radius:8px;background:${theme.inputBg};border:1px solid ${theme.inputBorder};color:${theme.inputText};font-size:0.92rem;resize:vertical;box-sizing:border-box;outline:none;font-family:inherit;"></textarea>
                </div>

                <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>

                <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:15px;border-radius:8px;background:${theme.btnGradient};color:${theme.btnText};font-size:1rem;font-weight:900;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
                  ${isZh ? '发送专属定制询盘' : 'Submit Consultation Request'} ↗
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  // Footer Component
  const footerHtml = `
    <footer style="background:${theme.footerBg};border-top:1px solid ${theme.footerBorder};padding:60px 0 30px;color:#94a3b8;font-size:0.88rem;">
      <div class="wrap" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="width:34px;height:34px;border-radius:8px;background:${theme.btnGradient};display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${theme.btnText}" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'High Jewelry Guild')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#94a3b8;margin:0 0 16px;max-width:320px;">
            ${isZh ? '高级珠宝与腕表定制 · 全球顶级品鉴与工坊贸易' : 'Fine Jewelry & Luxury Watches · Global Trade & Craft Guild'}
          </p>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? 'GIA认证D色极品微镶单颗钻戒' : 'Haute Diamond Solitaires'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '日内瓦手工倒角飞行陀飞轮腕表' : 'Flying Tourbillon Timepieces'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '哥伦比亚微油祖母绿黄金项链' : 'Fine Emerald Pendants'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '权威认证' : 'Accreditations'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${esc('GIA / IGI')} ${isZh ? '国际钻石切工最高权威报告' : 'GIA Certified Diamonds'}</li>
            <li>✓ ${esc('COSC')} ${isZh ? '瑞士官方天文台机芯精密认证' : 'Swiss Chronometer Standard'}</li>
            <li>✓ ${esc('950 Platinum')} ${isZh ? '高纯度贵金属官方成色印记' : 'Hallmarked Precious Metals'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:${theme.primary};text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#94a3b8;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid ${theme.footerBorder};padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '高级珠宝与腕表定制旗舰版' : 'Fine Jewelry & Luxury Watches Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
