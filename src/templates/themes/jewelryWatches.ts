import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export interface ThemedJewelryItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  metalStoneSpec: string;
  certMovementSpec: string;
  craftsmanshipDetail: string;
  moq: string;
  tagline: string;
  img: string;
}

export const JEWELRY_DEFAULT_PRODUCTS: ThemedJewelryItem[] = [
  {
    id: 'jew-1',
    name: '18K Gold Solitaire Pavé GIA Diamond Engagement Ring',
    desc: 'Master handcrafted 18K yellow gold setting featuring a 3.02 carat D-Color Flawless oval cut center diamond, complemented by micro-pavé band settings and comfort-fit shank.',
    badge: 'GIA Triple Ex',
    category: 'ring',
    categoryNameZh: '18K金手工微镶GIA椭圆钻典藏戒指',
    categoryNameEn: 'Solitaire Diamond Rings',
    metalStoneSpec: '18K Solid Yellow Gold (750) · 3.02ct D/FL Center Diamond',
    certMovementSpec: 'GIA Gemological Lab Certificate 245891 · Triple Excellent Cut',
    craftsmanshipDetail: 'Hand-burnished 4-prong claw with 36 micro-pavé melee diamonds',
    moq: '10 Pcs Bespoke Batch',
    tagline: 'Eternal Radiance Cut to Flawless Optical Precision',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'jew-2',
    name: 'Swiss Calibre Tourbillon 28,800 VPH Chronometer Watch',
    desc: 'Haute Horlogerie timepiece featuring a 60-second flying tourbillon carriage, Côte de Genève hand-chamfered bridges, 72-hour power reserve, and anti-reflective sapphire crystal.',
    badge: 'Swiss Haute Horlogerie',
    category: 'watch',
    categoryNameZh: '瑞士机芯陀飞轮全自动机械计时腕表',
    categoryNameEn: 'Grand Complication Timepieces',
    metalStoneSpec: 'Grade 5 Titanium & 904L Stainless Steel · Double Domed Sapphire',
    certMovementSpec: 'Calibre WR-701 Automatic Tourbillon · 28,800 vph · COSC Certified',
    craftsmanshipDetail: 'Anglage hand-bevelling, perlage circular graining, 100m water resist',
    moq: '30 Pcs per Batch',
    tagline: 'Mastering the Cadence of Gravity and Time',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'jew-3',
    name: 'Colombian Vivid Green Emerald & Platinum Drop Earrings',
    desc: 'Pair of matched vivid green Muzo Colombian emeralds totaling 4.85 carats, suspended in platinum 950 bezels with pear-cut brilliant diamond halos.',
    badge: 'Muzo Emerald Royal',
    category: 'earrings',
    categoryNameZh: '哥伦比亚木佐祖母绿铂金水滴耳坠',
    categoryNameEn: 'High Jewelry Emeralds',
    metalStoneSpec: 'Platinum 950 · 4.85ct Muzo Colombian Emeralds + 2.1ct Diamonds',
    certMovementSpec: 'Gübelin Gem Lab Certified · Minor Traditional Cedar Oil',
    craftsmanshipDetail: 'Articulated platinum lattice drop with hidden safety french clips',
    moq: '5 Pairs Bespoke',
    tagline: 'Velvety Green Fire from Legendary Ancient Mines',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'jew-4',
    name: 'Rose Gold Ceramic Perpetual Calendar Moonphase Watch',
    desc: 'Grand complication astronomical wristwatch showing date, day, month, four-digit year, and perpetual moonphase accurate to 122 years without manual adjustment.',
    badge: 'Astronomical Perpetual',
    category: 'watch',
    categoryNameZh: '18K玫瑰金万年历月相自动机械表',
    categoryNameEn: 'Perpetual Calendar Horology',
    metalStoneSpec: '18K 5N Rose Gold & High-Tech Ceramic Bezel · Aventurine Dial',
    certMovementSpec: 'Manufacture Calibre WR-880 · 288 Components · 50h Reserve',
    craftsmanshipDetail: 'Engraved 22K gold oscillating rotor with astronomical night sky',
    moq: '25 Pcs Run',
    tagline: 'The Celestial Heavens Encapsulated upon Your Wrist',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'jew-5',
    name: 'Burmese Pigeon Blood Ruby & 18K White Gold Tennis Bracelet',
    desc: 'Continuously articulated line bracelet featuring 38 unheated Burmese rubies with intense pigeon blood hue, bordered by round brilliant conflict-free diamonds.',
    badge: 'Unheated Burmese',
    category: 'bracelet',
    categoryNameZh: '天然无烧鸽血红宝石18K白金网球手链',
    categoryNameEn: 'Precious Gemstone Tennis',
    metalStoneSpec: '18K White Gold (750) · 12.4ct Unheated Burmese Rubies',
    certMovementSpec: 'SSEF Swiss Gemmological Institute Certified No Heat',
    craftsmanshipDetail: 'Double-safety integrated box clasp with tension spring lock',
    moq: '15 Pcs Order',
    tagline: 'Passionate Crimson Fire in Hypnotic Cadence',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'jew-6',
    name: 'Dual-Time GMT Skeletonized Architectural Mechanical Watch',
    desc: 'Openworked skeleton dial displaying dual time zones, 24-hour day/night indicator, and sapphire crystal exhibition caseback with blued steel screws.',
    badge: 'Skeletonized GMT',
    category: 'watch',
    categoryNameZh: '双时区镂空飞行员全自动机械腕表',
    categoryNameEn: 'Skeleton Travel Chronometers',
    metalStoneSpec: 'Satin-Brushed 316L Surgical Steel · Anti-Magnetic Cage',
    certMovementSpec: 'Calibre WR-520 Skeleton · 28,800 BPH · Independent GMT Hand',
    craftsmanshipDetail: 'Super-LumiNova BGW9 blue emission on hands and indices',
    moq: '50 Pcs Production',
    tagline: 'Synchronized Precision Across Global Meridian Zones',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'jew-7',
    name: 'South Sea Golden Pearl & Pavé Deco Pendant Necklace',
    desc: 'Lustrous 14.2mm natural golden South Sea cultured pearl with mirror-like reflection, suspended from an Art Deco diamond geometric bail in 18K yellow gold.',
    badge: 'South Sea Cultured',
    category: 'necklace',
    categoryNameZh: '南洋天然金珠几何艺术装饰吊坠项链',
    categoryNameEn: 'South Sea Pearl Fine Jewelry',
    metalStoneSpec: '18K Yellow Gold · 14.2mm AAA Grade Golden Pearl · 0.65ct Diamonds',
    certMovementSpec: 'Pearl Science Laboratory (PSL) Aurora Golden Certificate',
    craftsmanshipDetail: 'Adjustable 18K wheat chain with silicon sliding bead stopper',
    moq: '20 Pcs Run',
    tagline: 'Solar Warmth Forged in Pristine Oceanic Depths',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'jew-8',
    name: 'Ultra-Thin Micro-Rotor Automatic Guilloché Dress Watch',
    desc: 'Slender 6.8mm profile formal watch featuring an authentic rose engine-turned guilloché silver dial, solid gold off-centered micro-rotor, and alligator leather strap.',
    badge: 'Ultra-Thin 6.8mm',
    category: 'watch',
    categoryNameZh: '超薄微型摆陀玑镂纹正装机械腕表',
    categoryNameEn: 'Ultra-Thin Dress Horology',
    metalStoneSpec: '18K Rose Gold Case · Hand-Guilloché Solid Sterling Silver Dial',
    certMovementSpec: 'Calibre WR-310 Ultra-Flat Micro-Rotor · 3.2mm Movement Height',
    craftsmanshipDetail: 'Breguet blued steel hands with hand-sewn Mississippiensis strap',
    moq: '30 Pcs Order',
    tagline: 'The Pinnacle of Subdued Architectural Sophistication',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getJewelryProducts(ctx: ThemeContext): ThemedJewelryItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Jewelry Piece ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'jewelry',
      categoryNameZh: '高级珠宝与传世钟表',
      categoryNameEn: 'Fine Jewelry & Horology',
      metalStoneSpec: p.material || '',
      certMovementSpec: p.dimensions || '',
      craftsmanshipDetail: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = JEWELRY_DEFAULT_PRODUCTS[idx % JEWELRY_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '旺多姆沙龙珍藏' : 'Place Vendôme Select') : (isZh ? '传世典范' : 'Haute Heritage'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        metalStoneSpec: p.material || fallback.metalStoneSpec,
        certMovementSpec: p.dimensions || fallback.certMovementSpec,
        craftsmanshipDetail: fallback.craftsmanshipDetail,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return JEWELRY_DEFAULT_PRODUCTS;
}

export function renderJewelryWatchesTemplate(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const page = ctx.page;
  const products = getJewelryProducts(ctx);
  const heroProduct = products[0]!;
  const defaultMeta = JEWELRY_DEFAULT_PRODUCTS[0]!;

  // 100% LIGHT PALETTES FOR BOTH VARIANTS:
  // Banner: Parisian Silk Cream & 24K Gold
  // Video: Platinum Brilliant White & Royal Horological Sapphire
  const theme = isVideo
    ? {
        bg: '#f8fafc',
        cardBg: '#ffffff',
        cardBorder: 'rgba(37, 99, 235, 0.15)',
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        text: '#0b192c',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(255, 255, 255, 0.9)',
        glassBorder: 'rgba(255, 255, 255, 0.98)',
        pillBg: '#eff6ff',
        pillText: '#1d4ed8',
        btnGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        accentGlow: 'rgba(37, 99, 235, 0.18)',
        tagBadge: 'Swiss Horology Manufactory',
      }
    : {
        bg: '#faf8f5',
        cardBg: '#ffffff',
        cardBorder: 'rgba(197, 155, 39, 0.18)',
        primary: '#c59b27',
        primaryHover: '#a37f1b',
        text: '#1c1417',
        textMuted: '#6b5d63',
        textSub: '#9e8e94',
        glassBg: 'rgba(255, 255, 255, 0.9)',
        glassBorder: 'rgba(255, 255, 255, 0.98)',
        pillBg: '#fef9ee',
        pillText: '#9a7516',
        btnGradient: 'linear-gradient(135deg, #c59b27 0%, #9a7516 100%)',
        accentGlow: 'rgba(197, 155, 39, 0.18)',
        tagBadge: 'Haute Joaillerie Atelier',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // Header with Apple Liquid Glass
  const headerHtml = `
    <header class="jewelry-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="height:74px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(company.name)}" style="height:40px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.3rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'Geneva Horology Manufactory' : 'Vendôme Fine Jewelry'))}
            </span>
            <span style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};font-weight:700;">
              ${isVideo ? 'COSC Chronometers & Complications' : 'GIA Diamonds & Haute Joaillerie'}
            </span>
          </div>
        </a>

        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:30px;">
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

        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:8px;font-size:0.8rem;font-weight:700;">
            ${ctx.languageLinks}
          </div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:9999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:700;box-shadow:0 4px 14px ${theme.accentGlow};">
            ${isZh ? '贵宾品鉴 / 定制' : 'Private VIP Inquiry'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  // Footer
  const footerHtml = `
    <footer style="background:#ffffff;border-top:1px solid ${theme.cardBorder};color:${theme.text};padding:60px 0 30px;margin-top:auto;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.3rem;font-weight:900;margin-bottom:10px;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'Geneva Horology Manufactory' : 'Vendôme Fine Jewelry'))}
            </div>
            <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.7;max-width:340px;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'Certified Swiss-calibre mechanical chronometers and grand complications crafted with microscopic precision.' : 'Haute Joaillerie salon adhering to GIA 4C diamond criteria, certified ethical gold, and centuries of Parisian prong-setting mastery.'))}
            </p>
            <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:700;">
              ✦ ${isZh ? '金伯利进程道德开采 · GIA / COSC 认证' : 'Kimberley Process Compliant · GIA & COSC Certified'}
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${esc(ui.menu)}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.about)}</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.contact)}</a>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '奢品类目' : 'Collections'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;color:${theme.textMuted};">
              <span>${isZh ? 'GIA 典藏单钻戒指' : 'Solitaire Diamond Rings'}</span>
              <span>${isZh ? '瑞士陀飞轮复杂腕表' : 'Tourbillon Complications'}</span>
              <span>${isZh ? '哥伦比亚木佐祖母绿' : 'Colombian Muzo Emeralds'}</span>
              <span>${isZh ? '无烧缅甸鸽血红宝石' : 'Unheated Burmese Rubies'}</span>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${esc(ui.contact)}</div>
            <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.7;">
              <div><strong>Salon Email:</strong> <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;">${esc(company.email)}</a></div>
              ${company.phone ? `<div><strong>Concierge:</strong> ${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div style="margin-top:8px;">${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="padding-top:24px;border-top:1px solid #eef2f6;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:${theme.textSub};">
          <div>© ${new Date().getFullYear()} ${esc(company.name)}. ${esc(ui.rights)}.</div>
          <div>${isZh ? '国际高级珠宝钟表联合会成员 · RJC 责任珠宝业委员会' : 'Responsible Jewellery Council (RJC) Certified'}</div>
        </div>
      </div>
    </footer>
  `;

  let mainHtml = '';

  if (page === 'home') {
    const videoAsset = ctx.asset(draft.heroAssetId);
    const posterAsset = ctx.asset(draft.posterAssetId) || '/templates/senseng/hero-bg.jpg';
    const heroImg = (heroProduct as any).img || ctx.productMainImage(heroProduct as unknown as Product) || defaultMeta.img;

    if (isVideo) {
      // -------------------------------------------------------------
      // TEMPLATE 4: jewelry-timeless-video (Swiss Horology Video Loop)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Swiss Horology Video Showcase with Crystal Frosted Glass -->
          <section style="position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;padding:80px 0;">
            <video id="hero-video" autoplay muted loop playsinline poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.75;filter:brightness(0.95) saturate(1.1);z-index:1;" aria-hidden="true">
              ${videoAsset ? `<source src="${esc(videoAsset)}">` : `<source src="https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-watchmaker-repairing-a-luxury-watch-42617-large.mp4" type="video/mp4">`}
            </video>
            <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.72) 50%, rgba(248,250,252,0.42) 100%);z-index:2;"></div>

            <div class="wrap" style="position:relative;z-index:3;width:100%;padding:0 24px;">
              <div style="max-width:680px;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${theme.glassBorder};border-radius:24px;padding:48px;box-shadow:0 20px 50px -10px rgba(37,99,235,0.12);">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.primary};animation:wrPulse 2s infinite;"></span>
                  ${isZh ? '瑞士独立制表工坊 · 天文台认证' : 'Swiss Haute Horlogerie Manufactory'}
                </div>

                <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;letter-spacing:-0.02em;font-family:serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '微米机械律动 · 瑞士陀飞轮与大复杂功能腕表定制' : 'Mechanical Symphony: Swiss Tourbillon & Complications'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '传承瑞士汝山谷二百年制表精髓，28,800次/小时精准摆频，日内瓦波纹与手工倒角打磨，为全球独立钟表品牌与私人藏家提供殿堂级机芯定制与整表OEM。' : 'Preserving two centuries of Vallée de Joux horological mastery. Equipped with 28,800 vph flying tourbillons, hand-anglage finishing, and COSC chronometer certification.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:32px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:12px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索复杂时计矩阵 ↗' : 'View Master Timepieces ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:12px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '预约机芯定制洽谈' : 'Movement CAD Consultation'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid #e2e8f0;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">28,800</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '高频游丝摆轮 (4Hz)' : 'High Frequency Oscillation'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">COSC</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '瑞士官方天文台认证' : 'Chronometer Accuracy'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">72 Hours</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '双发条盒动力储备' : 'Dual Barrel Power Reserve'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Horological Complications Matrix -->
          <section class="wrap" style="padding:70px 24px;">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">GRAND COMPLICATIONS</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 14px;font-family:serif;">
                ${isZh ? '三大殿堂级钟表复杂机械构造' : 'Three Master Horological Architectures'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '从悬浮陀飞轮抵消地心引力，到万年历精准计算闰年齿轮，每一枚机芯都是微观机械工程的极致成就。' : 'From flying tourbillon carriages to 122-year astronomical perpetual moonphase mechanisms.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">I</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '60秒飞行陀飞轮框架' : '60-Second Flying Tourbillon'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '钛合金超轻框架仅重0.28克，每分钟完整旋转一周，彻底中和地球重力对摆轮游丝造成的走时误差。' : 'Ultralight titanium cage weighing only 0.28 grams, rotating once per minute to counteract earth gravitation.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '无卡度可变惯性螺钉摆轮' : 'Free-Sprung Variable Inertia Balance'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">II</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '瞬跳天文万年历与恒久月相' : 'Perpetual Calendar Moonphase'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '精密微型齿轮系自动识别大小月及闰年29天，高精密砂金石盘面月相每122年仅产生一天微小误差。' : 'Astronomical gearing identifying leap years without manual intervention, accompanied by aventurine starry moonphase.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '288个独立精密组件紧密咬合' : '288 Individually Micro-Machined Parts'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">III</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '手工倒角打磨与日内瓦波纹' : 'Anglage & Côtes de Genève'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '资深制表大师在放大镜下手持龙胆木打磨出45°镜面内倒角，桥板呈现波光粼粼的平行日内瓦饰纹。' : 'Hand-polished 45° chamfered mirror edges using gentian wood pegs and parallel Côtes de Genève stripes.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '符合日内瓦印记 Poinçon de Genève 严苛标准' : 'Meets Poinçon de Genève Standards'}</div>
              </div>
            </div>
          </section>

          <!-- 3. Timepiece Showcase Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">CHRONOMETER SELECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;font-family:serif;">
                  ${isZh ? '瑞士微型机械腕表矩阵' : 'Master Horology Portfolio'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全系 8 款时计 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedJewelryItem).metalStoneSpec ? (item as ThemedJewelryItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(37,99,235,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f0f4f8;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="padding:10px 12px;background:#f8fafc;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '机芯规格' : 'Calibre'}:</strong> ${esc(meta.certMovementSpec)}
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
      // TEMPLATE 3: jewelry-luxury-banner (Parisian Haute Joaillerie Banner)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Haute Joaillerie Hero Showcase with Parisian Silk Cream Banner -->
          <section class="wrap" style="padding:60px 24px 80px;">
            <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ ${isZh ? '巴黎旺多姆广场高级珠宝工坊传承' : 'Place Vendôme Haute Joaillerie Tradition'}
                </div>

                <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.12;color:${theme.text};margin:0 0 18px;font-family:serif;letter-spacing:-0.02em;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '璀璨典藏 · 纯手工高定彩色宝石与 GIA 奢钻工坊' : 'Pure Brilliance: GIA Certified Fine Diamonds & Rare Gems'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '每一颗主钻均由 GIA 宝石学家严苛精选，木佐祖母绿与缅甸无烧红宝经苏黎世与古柏林权威背书。资深法式爪镶工匠手工微镶，只为呈现无可挑剔的火彩与传世价值。' : 'Curated to strict GIA 4C criteria with Gübelin certified colored gemstones. Hand-set in ethical 18K gold and platinum by master Parisian pavé jewelers.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '鉴赏高定珠宝系列' : 'View Haute Joaillerie'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:8px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '预约高级珠宝专家咨询' : 'Book Gemologist Consultation'}
                  </a>
                </div>

                <div style="display:flex;gap:32px;padding-top:24px;border-top:1px solid #efe8dd;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">D / FL</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '最高级别纯净无瑕' : 'Color & Clarity Benchmark'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">Triple EX</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '完美光学切工对称' : 'Cut, Polish & Symmetry'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">100% Conflict-Free</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '金伯利进程道德源头' : 'Ethical Provenance'}</div>
                  </div>
                </div>
              </div>

              <!-- Hero Image Showcase with Crystal Card -->
              <div style="position:relative;" class="wr-card-hover">
                <div style="position:relative;border-radius:24px;overflow:hidden;box-shadow:0 25px 60px -15px rgba(197,155,39,0.18);border:1px solid ${theme.cardBorder};background:#fbf8f4;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:520px;object-fit:cover;display:block;">
                </div>
                <div style="position:absolute;bottom:24px;left:24px;right:24px;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ${theme.glassBorder};border-radius:14px;padding:18px 22px;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">${esc(defaultMeta.badge)}</div>
                      <div style="font-size:1.05rem;font-weight:900;color:${theme.text};margin-top:2px;font-family:serif;">${esc(heroProduct.name)}</div>
                    </div>
                    <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                      ${isZh ? '品鉴微雕' : 'Inspect'} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Gemological 4C Excellence Matrix -->
          <section class="wrap" style="padding:60px 24px 70px;">
            <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">THE GIA 4C STANDARDS</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 12px;font-family:serif;">
                ${isZh ? '严苛挑选万分之一的璀璨火彩' : 'The Four Pillars of Flawless Diamond Grading'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '由美国宝石研究院（GIA）标准评定，每一枚主石均具备不可伪造的专属激光腰码与全套光学证书。' : 'Every diamond is microscopically laser-inscribed and accompanied by an official GIA grading dossier.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">CUT / 切工</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '3EX 极致对称与全反射' : 'Triple Excellent Symmetry'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '严格遵循57或58个理想切面比例，光线进入后于底面发生100%全反射，激发出震撼摄魂的七彩火彩。' : 'Cut to ideal 57-facet mathematical ratios ensuring 100% total internal reflection and scintillation.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">COLOR / 色泽</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? 'D-E-F 纯净极白罕见纯度' : 'Colorless D to F Pure Grade'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '仅选用完全无色透明的顶级毛坯原石，宛如冰川融水般清澈纯粹，杜绝任何肉眼可见微黄杂色。' : 'Exclusively sourcing flawless colorless rough stones free from nitrogen impurities, pure as glacial ice.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">CLARITY / 净度</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? 'FL-VVS 显微镜级晶莹剔透' : 'Flawless to VVS Purity'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '在10倍专业宝石放大镜下观察，内部完全无瑕或仅有极细微天然结晶，透射出纯净无瑕的尊贵气韵。' : 'Immaculate under 10x magnification with zero visible inclusions, preserving optical transmission.'}
                </p>
              </div>
            </div>
          </section>

          <!-- 3. Fine Jewelry Vitrine Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">THE VITRINE</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;font-family:serif;">
                  ${isZh ? '高级珠宝沙龙典藏' : 'Haute Joaillerie Salon Collection'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全部 8 款典藏 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedJewelryItem).metalStoneSpec ? (item as ThemedJewelryItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(197,155,39,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#fbf8f4;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="padding:10px 12px;background:#fdfcf9;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '材质规格' : 'Specs'}:</strong> ${esc(meta.metalStoneSpec)}
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
    // CATALOG PAGE: High Contrast Luxury Grid
    // -------------------------------------------------------------
    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Geneva Horology Manufactory' : 'Vendôme Fine Jewelry'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:serif;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? (isVideo ? '探索瑞士微型机械腕表矩阵，涵盖飞轮陀飞轮、万年历月相、双时区镂空及超薄正装腕表，支持私人定制与高端品牌OEM。' : '鉴赏旺多姆沙龙高级珠宝全系作品，涵盖GIA典藏单钻戒、哥伦比亚木佐祖母绿耳坠、缅甸无烧鸽血红手链与南洋金珠项链。') : (isVideo ? 'Explore Swiss-engineered horological complications, tourbillons, and precision chronometer timepieces.' : 'Browse our high jewelry collection featuring GIA triple-ex diamonds, unheated Burmese rubies, and Colombian emeralds.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedJewelryItem).metalStoneSpec ? (item as ThemedJewelryItem) : JEWELRY_DEFAULT_PRODUCTS[idx % JEWELRY_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.04);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#f0f4f8' : '#fbf8f4'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                      ${esc(meta.badge)}
                    </span>
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn)}
                    </div>
                    <h2 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.desc || '')}
                    </p>
                    <div style="background:${isVideo ? '#f8fafc' : '#fdfcf9'};padding:10px 12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;">
                      <div><strong>${isZh ? '材质/贵金属' : 'Metals & Gems'}:</strong> ${esc(meta.metalStoneSpec)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '认证/机芯' : 'Certification/Calibre'}:</strong> ${esc(meta.certMovementSpec)}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
    // DETAIL PAGE: Rich Product Specs with id="wr-detail-main-img"
    // -------------------------------------------------------------
    const meta = (selectedProduct as unknown as ThemedJewelryItem).metalStoneSpec ? (selectedProduct as unknown as ThemedJewelryItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;

    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:${theme.textSub};margin-bottom:30px;">
            <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
            <span style="margin:0 8px;">/</span>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
            <span style="margin:0 8px;">/</span>
            <span style="color:${theme.text};font-weight:700;">${esc(selectedProduct.name)}</span>
          </nav>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:start;margin-bottom:70px;">
            <div>
              <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 36px rgba(0,0,0,0.06);position:relative;">
                <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;max-height:560px;object-fit:cover;display:block;">
              </div>
            </div>

            <div>
              <div style="display:inline-block;padding:5px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.badge || (isVideo ? 'COSC Chronometer' : 'Haute Joaillerie'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:serif;">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc((selectedProduct as any).desc || selectedProduct.description || defaultMeta.desc)}
              </p>

              <!-- Gemological / Horological Specifications Grid -->
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                  ${isZh ? '高级珠宝宝石与精密机芯出厂参数' : 'Gemological & Movement Technical Matrix'}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '贵金属与主石用料' : 'Metals & Gemstones'}</span>
                    <strong style="color:${theme.text};">${esc(meta.metalStoneSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '宝石证书 / 认证机芯' : 'Certification / Movement'}</span>
                    <strong style="color:${theme.text};">${esc(meta.certMovementSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '工匠手工微镶打磨细节' : 'Artisanal Craftsmanship'}</span>
                    <strong style="color:${theme.text};">${esc(meta.craftsmanshipDetail)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '起订量 / 高定周期' : 'MOQ & Production Lead Time'}</span>
                    <strong style="color:${theme.primary};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(selectedProduct.id))}" ${navAttrs('contact', selectedProduct.id)} style="text-decoration:none;padding:15px 32px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};flex:1;text-align:center;">
                  ${isZh ? '发起贵宾定制意向 / 洽谈' : 'Inquire for Bespoke Commission'} ↗
                </a>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 24px;border-radius:10px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                  ← ${esc(ui.back)}
                </a>
              </div>
            </div>
          </div>

          <!-- Related Products -->
          <section style="padding-top:40px;border-top:1px solid #e2e8f0;">
            <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 24px;font-family:serif;">${esc(ui.related)}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:24px;">
              ${products.filter((p) => p.id !== selectedProduct.id).slice(0, 3).map((item) => `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,0.03);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:70%;overflow:hidden;border-radius:10px;margin-bottom:12px;background:#f8fafc;">
                    <img src="${esc((item as any).img || ctx.productMainImage(item as unknown as Product))}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                  </div>
                  <h3 style="font-size:0.96rem;font-weight:800;color:${theme.text};margin:0 0 6px;font-family:serif;">${esc(item.name)}</h3>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:${theme.primary};text-decoration:none;font-size:0.82rem;font-weight:700;">
                    ${esc(ui.details)} ↗
                  </a>
                </article>
              `).join('')}
            </div>
          </section>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    // -------------------------------------------------------------
    // ABOUT PAGE: High-Contrast Brand Heritage
    // -------------------------------------------------------------
    const headline = getAboutHeadline(company, company.name);
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const aboutImg = ctx.asset(company.aboutImageAssetId) || (products[1] ? (products[1] as any).img : defaultMeta.img);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '4 Generations', num: 4, suffix: ' Generations', label: isZh ? '世代传承大师工坊' : 'Generations of Mastery', desc: isZh ? '逾世纪欧洲高定工艺积淀' : 'Over a century of European atelier heritage' },
      { value: '100%', num: 100, suffix: '%', label: isZh ? '金伯利道德可溯源' : 'Ethical Conflict-Free', desc: isZh ? '纯天然无冲突开采钻石与贵金属' : 'Fully certified Kimberley Process provenance' },
      { value: '0.001mm', num: 0.001, suffix: 'mm', label: isZh ? '微米级机芯加工公差' : 'CNC Machining Tolerance', desc: isZh ? '五轴微雕与手工精磨完美交融' : '5-axis micro-milling combined with hand anglage' },
      { value: '50+ Guilds', num: 50, suffix: '+ Guilds', label: isZh ? '全球高端专柜与藏家合作' : 'Global Boutique Network', desc: isZh ? '服务欧洲顶尖沙龙与国际藏家' : 'Partnered with premier luxury salons globally' },
    ]);

    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:50px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '百年珠宝工坊与瑞士微雕制表哲学' : 'ATELIER HERITAGE & SWISS PHILOSOPHY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:serif;">
              ${esc(headline)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:720px;">
              ${esc(company.slogan || (isVideo ? '将微米级精密钟表机械升华为恒久流转的艺术结晶。' : '以敬畏之心雕琢大自然数十亿年凝聚的稀世瑰宝。'))}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                  <p style="margin:0 0 18px;">
                    ${isZh ? '我们的高级珠宝与独立制表工坊融合了数代手艺人的心血结晶，配备恒温恒湿无尘装配车间、高精度五轴CNC五金车削设备以及瑞士权威宝石比色检测仪。' : 'Our high jewelry and independent watchmaking manufacture unites generations of artisanal discipline with climate-controlled cleanroom assembly and 5-axis CNC machining precision.'}
                  </p>
                  <p style="margin:0 0 18px;">
                    ${isZh ? '从每一枚天然钻石的原石比色切磨，到复杂机械机芯桥板的极致手工倒角，我们拒绝任何工业流水线的妥协，让每一件交付到藏家手中的作品均凝聚传世光芒。' : 'From rough diamond optical cut planning to hand-burnished movement anglage, we refuse industrial compromise to deliver timeless heirloom brilliance.'}
                  </p>
                `}
              </div>
              <div style="margin-top:28px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                  ${isZh ? '预约高级沙龙专员洽谈' : 'Schedule Private Viewing'} ↗
                </a>
              </div>
            </div>

            <div>
              <div style="border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid ${theme.cardBorder};background:#ffffff;">
                <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="width:100%;height:380px;object-fit:cover;display:block;">
              </div>
            </div>
          </div>

          <!-- Statistics Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
            ${stats.map((s) => `
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:26px;box-shadow:0 6px 20px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:6px;font-family:serif;">${esc(s.value)}</div>
                <div style="font-size:0.92rem;font-weight:800;color:${theme.text};margin-bottom:4px;">${esc(s.label)}</div>
                <div style="font-size:0.8rem;color:${theme.textSub};">${esc(s.desc || '')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </main>
    `;
  } else if (page === 'contact') {
    // -------------------------------------------------------------
    // CONTACT PAGE: VIP Salon Consultation Form
    // -------------------------------------------------------------
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '私享定制沙龙与大宗商务咨询' : 'VIP BESPOKE SALON & B2B INQUIRY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:serif;">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的定制要求或批量采购计划，高级珠宝与钟表顾问将在 24 小时内与您保密接洽，并提供三维 CAD 渲染与裸石现货配石方案。' : 'Submit your bespoke commission or luxury brand OEM inquiry. Our senior gemologist and horological consultants will reach out within 24 hours under strict confidentiality.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <!-- Contact Card Details -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;font-family:serif;">
                ${esc(company.name || (isVideo ? 'Geneva Horology Manufactory' : 'Vendôme Fine Jewelry'))}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(company.description || (isZh ? '专注高端珠宝沙龙与机械腕表外贸出口，支持OEM/ODM/OBM全球集装箱货运履约。' : 'Direct luxury manufacture supporting worldwide bespoke delivery and high-volume brand OEM.'))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Concierge Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">VIP Direct Line</span>
                    <a href="tel:${esc(company.phone)}" style="color:${theme.text};text-decoration:none;font-weight:700;">${esc(company.phone)}</a>
                  </div>
                ` : ''}

                ${waDigits ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">WhatsApp Rapid Concierge</span>
                    <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:none;font-weight:700;">+${esc(waDigits)} (Chat Now ↗)</a>
                  </div>
                ` : ''}

                ${company.address ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Atelier Address</span>
                    <div style="color:${theme.textMuted};">${esc(company.address)}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Inquiry Form -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <form id="inquiry" action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.name)} *</label>
                  <input name="name" required maxlength="120" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.email)} *</label>
                  <input name="email" type="email" required maxlength="254" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.company)} (${esc(ui.optional)})</label>
                  <input name="company" maxlength="200" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.product)} (${esc(ui.optional)})</label>
                  <select name="productId" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;">
                    <option value="">${isZh ? '— 选择意向珠宝 / 腕表型号 —' : '— Select Jewelry or Timepiece —'}</option>
                    ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>

                <div style="grid-column:span 2;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.message)} *</label>
                  <textarea name="message" required maxlength="5000" rows="5" placeholder="${isZh ? '请描述您的贵金属材质偏好、钻石克拉数与净度要求、目标订单量或定制设计细节...' : 'Describe your preferred metal, carat, clarity requirements, or custom movement CAD specifics...'}" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;resize:vertical;"></textarea>
                </div>

                <div style="display:none;" aria-hidden="true">
                  <input name="website" tabindex="-1" autocomplete="off">
                </div>

                <div style="grid-column:span 2;display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                  <button type="submit" ${ctx.options.preview ? 'disabled' : ''} style="padding:14px 34px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;border:none;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    ${esc(ui.send)} ↗
                  </button>
                  <span style="font-size:0.78rem;color:${theme.textSub};">${isZh ? '绝密 NDA 协议保护 · 24小时内专属专员联系' : 'Strict NDA Protection · 24h Response'}</span>
                </div>
                <p class="form-status" role="status" aria-live="polite" style="grid-column:span 2;font-size:0.86rem;margin:0;"></p>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
