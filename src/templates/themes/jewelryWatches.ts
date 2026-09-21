import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

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

function sanitizeCopy(text: string | undefined, fallbackEn: string, fallbackZh: string, isZh: boolean): string {
  if (!text || !text.trim()) return isZh ? fallbackZh : fallbackEn;
  if (!isZh && /[\u4e00-\u9fa5]/.test(text)) return fallbackEn;
  return text;
}

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
      categoryNameEn: 'Fine Jewelry & Watches',
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
        badge: idx === 0 ? (isZh ? '典藏主打' : 'Haute Piece') : (isZh ? '传世精选' : 'Master Choice'),
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

  const brandName = sanitizeCopy(
    company.name,
    isVideo ? 'Manufacture Horlogère Suisse' : 'Haute Joaillerie Atelier & Salon',
    isVideo ? '瑞士高级制表与精密时计工坊' : '巴黎高级珠宝典藏与宝石沙龙',
    isZh,
  );

  const brandTagline = isVideo
    ? (isZh ? '瑞士机芯陀飞轮与天文台认证时计' : 'Swiss Calibre Horology & Chronometer Lab')
    : (isZh ? '18K金手工微镶与GIA认证自然瑰宝' : '18K Solid Gold & Certified Natural Gemstones');

  const theme = isVideo
    ? {
        bg: '#f8fafc',
        cardBg: '#ffffff',
        cardBorder: 'rgba(180, 83, 9, 0.16)',
        primary: '#b45309',
        primaryHover: '#92400e',
        text: '#0f172a',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(248, 250, 252, 0.92)',
        pillBg: '#fef3c7',
        pillText: '#92400e',
        btnGradient: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
        accentGlow: 'rgba(180, 83, 9, 0.18)',
      }
    : {
        bg: '#fffdfa',
        cardBg: '#ffffff',
        cardBorder: 'rgba(197, 155, 39, 0.16)',
        primary: '#c59b27',
        primaryHover: '#a17c18',
        text: '#18181b',
        textMuted: '#52525b',
        textSub: '#71717a',
        glassBg: 'rgba(255, 253, 250, 0.92)',
        pillBg: '#fefce8',
        pillText: '#854d0e',
        btnGradient: 'linear-gradient(135deg, #c59b27 0%, #a17c18 100%)',
        accentGlow: 'rgba(197, 155, 39, 0.18)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  const headerHtml = `
    <header class="jewelry-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.02);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:serif;">
              ${esc(brandName)}
            </span>
            <span style="font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;color:${theme.primary};font-weight:700;">
              ${esc(brandTagline)}
            </span>
          </div>
        </a>

        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.contact)}</a>
        </nav>

        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
            ${isZh ? '私洽与定制询价' : 'Private Sourcing'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // -------------------------------------------------------------
      // TIMELESS VIDEO: Swiss Calibre Horology & Escapement Hero
      // -------------------------------------------------------------
      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;font-family:serif;">
                  ✦ ${isZh ? '瑞士天文台认证机械机芯工坊' : 'Swiss Haute Horlogerie Manufacture'}
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.02em;margin:0 0 18px;font-family:Georgia, serif;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Mastering Gravity: 28,800 VPH Calibres & Flying Tourbillons', '驾驭重力 · 28,800次/时瑞士高频陀飞轮机械机芯', isZh))}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:620px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Precision engineered mechanical calibres featuring silicon hairsprings, 72-hour power reserves, and hand-chamfered Côtes de Genève bridges. Tested across 5 positions for official COSC chronometer certification.', '搭载自主研发瑞士机械机芯与单晶硅游丝，拥有 72 小时动力储存与日内瓦波纹手工倒角。经 5 个方位与 3 种温度严苛检测，获瑞士官方天文台（COSC）认证，平均日误差仅 -4/+6 秒。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索传世机械腕表 ↗' : 'View Timepiece Catalog ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '索取分销政策与微品牌定制' : 'Inquire Distribution Terms'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">28,800 vph</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '高频无卡度游丝摆轮' : '4Hz Beat Frequency'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">-4/+6 s/d</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? 'COSC 瑞士天文台认证' : 'COSC Daily Precision'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">72 Hours</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '双发条盒长动力储备' : 'Power Reserve'}</div>
                  </div>
                </div>
              </div>

              <!-- Watch Calibre Video Card -->
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(0,0,0,0.06);">
                  <div style="position:relative;padding-top:72%;background:#0f172a;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <span style="font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#fcd34d;background:rgba(180,83,9,0.3);padding:3px 8px;border-radius:4px;">
                          Escapement Micro-Cadence
                        </span>
                        <span style="font-size:0.75rem;font-family:monospace;color:rgba(255,255,255,0.8);">4Hz / 28,800 VPH</span>
                      </div>
                      <div style="font-size:1.05rem;font-weight:800;font-family:serif;line-height:1.3;">Flying Tourbillon Carriage</div>
                      <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-top:2px;">60-second rotation neutralizing positional gravity errors on the balance.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3 Horology Pillars -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;font-family:serif;">
                  HAUTE HORLOGERIE PRECISION ENGINEERING
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;font-family:Georgia, serif;">
                  ${isZh ? '瑞士高级制表的三大机芯工法' : 'Three Pillars of Manufacture Horology'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.7;">
                  ${isZh ? '将微米级机械精密升华为恒久流转的艺术结晶，经受住数十年时间的无情审视。' : 'Merging sub-micron horological tolerance with generational hand-finishing.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">I.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? 'CNC慢走丝线切割夹板' : 'Wire EDM & CNC Calibres'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '主夹板与齿轮桥全部经慢走丝电火花与五轴CNC精密切割，红宝石轴承公差控制在0.002毫米之内。' : 'Mainplates wire-eroded to 0.002mm tolerances for frictionless gear train meshing.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">II.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '手工日内瓦波纹与倒角' : 'Anglage & Côtes de Genève'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '制表师以金刚砂与龙胆木条纯手工修磨边缘45度镜面倒角，在微观光影下呈现璀璨折射。' : 'Hand-bevelled 45° chamfers polished with gentian wood sticks for ethereal specular highlights.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">III.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '15天五方位全天候温控测试' : '15-Day COSC Testing'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '分别在8°C、23°C、38°C三种温度以及表冠朝上朝下等5个方位连续运行测试，方能出厂。' : 'Tested continuously across 3 temperatures and 5 positions to guarantee chronometer precision.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Timepieces Grid -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;font-family:serif;">
                    MANUFACTURE TIMEPIECES
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;font-family:Georgia, serif;">
                    ${isZh ? '复杂功能传世机械腕表' : 'Grand Complication Chronometers'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};font-family:serif;">
                  ${isZh ? '浏览全系表款目录 ↗' : 'View Full Catalog ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedJewelryItem).metalStoneSpec ? (item as ThemedJewelryItem) : JEWELRY_DEFAULT_PRODUCTS[idx % JEWELRY_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(180,83,9,0.04);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:74%;overflow:hidden;background:#f8fafc;">
                        <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                        <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};font-family:serif;">
                          ${esc(meta.badge)}
                        </span>
                      </div>
                      <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                        <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;font-family:serif;">
                          ${esc(meta.categoryNameEn)}
                        </div>
                        <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                          ${esc(item.name)}
                        </h3>
                        <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                          ${esc(item.desc || '')}
                        </p>
                        <div style="background:#f8fafc;padding:10px 12px;border-radius:6px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;border:1px solid ${theme.cardBorder};">
                          <strong>${isZh ? '机芯规格' : 'Calibre Spec'}:</strong> ${esc(meta.certMovementSpec)}
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                          <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                          <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
                            ${esc(ui.details)} ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  `;
                }).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // -------------------------------------------------------------
      // LUXURY BANNER: Haute Joaillerie Lookbook & 4Cs Matrix Hero
      // -------------------------------------------------------------
      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:90px 0 110px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.2fr 0.8fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;font-family:serif;">
                  ✦ ${isZh ? '巴黎高级珠宝典藏与宝石学沙龙' : 'Haute Joaillerie & High Fine Jewelry Atelier'}
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.8rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.02em;margin:0 0 18px;font-family:Georgia, serif;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Optical Perfection: 18K Solid Gold & Triple Ex Natural Diamonds', '稀世瑰宝 · 18K金手工微镶与GIA认证天然彩宝典藏', isZh))}
                </h1>
                <p style="font-size:1.12rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:640px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Hand-selected conflict-free natural diamonds cut to Triple Excellent mathematical ratios. Crafted in solid 18K yellow, white, and rose gold with microscopic prong settings for peerless optical brilliance.', '严格遵循金伯利进程道德开采公约，精选D-F无色极白与3EX切工天然钻石。高级珠宝工匠在 40 倍显微镜下手工微镶爪镶，以 18K 纯金与铂金 950 雕琢经得起世代传承的流光溢彩。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:40px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '品鉴高级珠宝典藏' : 'Explore Haute Joaillerie'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:6px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '预约高级珠宝定制洽谈' : 'Request Private Consultation'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;padding-top:28px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">GIA 3EX</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '全反射极致切工比例' : 'Triple Excellent Cut'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">18K Gold</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? 'Au750特级真金倒模' : 'Solid Gold (750)'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">40x Micro</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '显微镜下手工微镶爪' : 'Micro-Pavé Precision'}</div>
                  </div>
                </div>
              </div>

              <!-- Editorial Diamond Display Card -->
              <div style="position:relative;">
                <div style="border-radius:14px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(197,155,39,0.08);padding:14px;">
                  <div style="border-radius:10px;overflow:hidden;position:relative;padding-top:105%;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(24,24,27,0.75) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#fde047;margin-bottom:4px;font-family:serif;">
                        HAUTE JOAILLERIE MASTERPIECE
                      </div>
                      <div style="font-size:1.15rem;font-weight:900;font-family:serif;line-height:1.3;">
                        ${esc(heroProduct.name)}
                      </div>
                      <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-top:4px;">
                        ${esc(heroProduct.metalStoneSpec)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 4Cs Diamond Optical Brilliance Matrix -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;font-family:serif;">
                  GIA GEMOLOGICAL BRILLIANCE STANDARDS
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;font-family:Georgia, serif;">
                  ${isZh ? '典藏天然钻石的 4C 光学评定法则' : 'The 4Cs Optical Brilliance Matrix'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.7;">
                  ${isZh ? '由美国宝石研究院（GIA）标准评定，每一枚主石均具备专属激光腰码与全套光学证书。' : 'Evaluated according to strict GIA grading standards with microscopic laser-inscribed girdle registries.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:24px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:26px;" class="wr-card-hover">
                  <div style="font-size:1.2rem;font-weight:900;color:${theme.primary};margin-bottom:8px;font-family:serif;">${isZh ? 'CUT / 切工' : 'CUT'}</div>
                  <h3 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;font-family:serif;">${isZh ? '3EX 极致对称' : 'Triple Excellent'}</h3>
                  <p style="font-size:0.84rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                    ${isZh ? '遵循57或58个理想切面比例，光线进入后于底面发生100%全反射，激发出震撼火彩。' : 'Cut to ideal 57-facet mathematical ratios ensuring 100% total internal reflection and scintillation.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:26px;" class="wr-card-hover">
                  <div style="font-size:1.2rem;font-weight:900;color:${theme.primary};margin-bottom:8px;font-family:serif;">${isZh ? 'COLOR / 色泽' : 'COLOR'}</div>
                  <h3 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;font-family:serif;">${isZh ? 'D-E-F 纯净极白' : 'Colorless D to F'}</h3>
                  <p style="font-size:0.84rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                    ${isZh ? '仅选用完全无色透明的顶级毛坯原石，宛如冰川融水般清澈纯粹，杜绝任何杂色。' : 'Exclusively sourcing flawless colorless rough stones free from nitrogen impurities, pure as glacial ice.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:26px;" class="wr-card-hover">
                  <div style="font-size:1.2rem;font-weight:900;color:${theme.primary};margin-bottom:8px;font-family:serif;">${isZh ? 'CLARITY / 净度' : 'CLARITY'}</div>
                  <h3 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;font-family:serif;">${isZh ? 'FL - VVS1 无瑕级' : 'Flawless to VVS1'}</h3>
                  <p style="font-size:0.84rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                    ${isZh ? '在专业10倍宝石放大镜下观察几乎无任何可见包体，光线通行无阻，通透如水。' : 'Microscopically pure under 10x gemological loupes, allowing photons to pass with zero optical distortion.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:26px;" class="wr-card-hover">
                  <div style="font-size:1.2rem;font-weight:900;color:${theme.primary};margin-bottom:8px;font-family:serif;">${isZh ? 'CARAT / 克拉' : 'CARAT'}</div>
                  <h3 style="font-size:1.05rem;font-weight:800;color:${theme.text};margin:0 0 8px;font-family:serif;">${isZh ? '精准严苛克拉重' : 'Certified Carat Mass'}</h3>
                  <p style="font-size:0.84rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                    ${isZh ? '每克拉分为100分，采用瑞士高精度电子分析天平测量至小数点后四位，确保数据真实。' : 'Calibrated on Swiss analytical micro-balances to four decimal places, accompanied by GIA weight registries.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured High Jewelry Pieces -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;font-family:serif;">
                    HAUTE JOAILLERIE SHOWCASE
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;font-family:Georgia, serif;">
                    ${isZh ? '传世瑰宝典藏作品展' : 'Masterpiece Fine Jewelry Gallery'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};font-family:serif;">
                  ${isZh ? '浏览全系 8 款珠宝 ↗' : 'View Full Catalog ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedJewelryItem).metalStoneSpec ? (item as ThemedJewelryItem) : JEWELRY_DEFAULT_PRODUCTS[idx % JEWELRY_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(197,155,39,0.04);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#fffdfa;">
                        <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                        <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};font-family:serif;">
                          ${esc(meta.badge)}
                        </span>
                      </div>
                      <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                        <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                          ${esc(item.name)}
                        </h3>
                        <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                          ${esc(item.desc || '')}
                        </p>
                        <div style="padding:10px 12px;background:#fffdfa;border-radius:6px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;border:1px solid ${theme.cardBorder};">
                          <strong>${isZh ? '材质规格' : 'Material Spec'}:</strong> ${esc(meta.metalStoneSpec)}
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                          <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                          <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
                            ${esc(ui.details)} ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  `;
                }).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;border-bottom:1px solid ${theme.cardBorder};padding-bottom:28px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:serif;">
              ${isVideo ? 'MANUFACTURE HORLOGÈRE ARCHIVES' : 'HAUTE JOAILLERIE SALON ARCHIVES'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:Georgia, serif;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:700px;line-height:1.7;">
              ${isZh ? (isVideo ? '探索瑞士原装陀飞轮、万年历月相、双时区镂空飞行员腕表与超薄微型摆陀正装表，支持小批量独立制表品牌私订。' : '品鉴18K金GIA椭圆钻戒、哥伦比亚木佐祖母绿耳坠、天然无烧鸽血红宝石手链与南洋金珠项链，支持尊享高级珠宝开模与原产地证书随货交付。') : (isVideo ? 'Browse our Swiss horology collection featuring flying tourbillons, perpetual calendars, and skeletonized GMT calibres.' : 'Explore our Haute Joaillerie collection featuring GIA certified natural diamonds, Colombian emeralds, and 18K solid gold creations.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedJewelryItem).metalStoneSpec ? (item as ThemedJewelryItem) : JEWELRY_DEFAULT_PRODUCTS[idx % JEWELRY_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#f8fafc' : '#fffdfa'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};font-family:serif;">
                      ${esc(meta.badge)}
                    </span>
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;font-family:serif;">
                      ${esc(meta.categoryNameEn)}
                    </div>
                    <h2 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:Georgia, serif;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                      ${esc(item.desc || '')}
                    </p>
                    <div style="background:${isVideo ? '#f8fafc' : '#fffdfa'};padding:12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;border:1px solid ${theme.cardBorder};">
                      <div><strong>${isZh ? '材质参数' : 'Material Spec'}:</strong> ${esc(meta.metalStoneSpec)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '认证/机芯' : 'Movement / Cert'}:</strong> ${esc(meta.certMovementSpec)}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                      <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:8px 18px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
    const meta = (selectedProduct as unknown as ThemedJewelryItem).metalStoneSpec ? (selectedProduct as unknown as ThemedJewelryItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;

    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:${theme.textSub};margin-bottom:30px;font-family:serif;">
            <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
            <span style="margin:0 8px;">/</span>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
            <span style="margin:0 8px;">/</span>
            <span style="color:${theme.text};font-weight:700;">${esc(selectedProduct.name)}</span>
          </nav>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;margin-bottom:70px;">
            <div>
              <div style="border-radius:16px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 36px rgba(0,0,0,0.05);position:relative;">
                <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;max-height:540px;object-fit:cover;display:block;">
              </div>
            </div>

            <div>
              <div style="display:inline-block;padding:5px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;font-family:serif;">
                ${esc(meta.badge || (isVideo ? 'Swiss Chronometer Spec' : 'GIA High Jewelry'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:Georgia, serif;">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(sanitizeCopy((selectedProduct as any).desc || selectedProduct.description, meta.desc, meta.desc, isZh))}
              </p>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;font-family:serif;">
                  ${isZh ? (isVideo ? '机芯参数与复杂功能规格' : '贵金属材质与宝石学参数') : (isVideo ? 'Calibre Architecture & Complication Specs' : 'Gemological & Precious Metal Specs')}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.86rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '贵金属/表壳' : 'Metal / Case'}</span>
                    <strong style="color:${theme.text};">${esc(meta.metalStoneSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '机芯/宝石证书' : 'Calibre / Gem Cert'}</span>
                    <strong style="color:${theme.text};">${esc(meta.certMovementSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '镶嵌/打磨工艺' : 'Setting / Finish'}</span>
                    <strong style="color:${theme.text};">${esc(meta.craftsmanshipDetail)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '定制起订量' : 'Production MOQ'}</span>
                    <strong style="color:${theme.text};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 32px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                  ${isZh ? '索取证书副本与高保真样件' : 'Request Dossier & Pricing'} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    // -------------------------------------------------------------
    // ABOUT PAGE: COMPLETELY DIFFERENT LAYOUTS FOR BANNER & VIDEO
    // ZERO SQUISHY CAT FALLBACK!
    // -------------------------------------------------------------
    const headline = sanitizeCopy(
      getAboutHeadline(company, company.name),
      isVideo ? 'Swiss Manufacture Horlogère & ISO 3159 Chronometer Testing' : 'Haute Joaillerie Atelier & Gemological Provenance Guild',
      isVideo ? '瑞士高级机械制表厂与天文台检定实验室' : '高级珠宝典藏工坊与宝石学溯源沙龙',
      isZh,
    );

    const customAboutImg = company.aboutImageAssetId ? ctx.asset(company.aboutImageAssetId) : '';
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '4 Generations', num: 4, suffix: ' Generations', label: isZh ? '世代传承大师工坊' : 'Generations of Mastery', desc: isZh ? '逾世纪欧洲高定工艺积淀' : 'Over a century of European atelier heritage' },
      { value: '100%', num: 100, suffix: '%', label: isZh ? '金伯利道德可溯源' : 'Ethical Conflict-Free', desc: isZh ? '纯天然无冲突开采钻石与贵金属' : 'Fully certified Kimberley Process provenance' },
      { value: '0.001mm', num: 0.001, suffix: 'mm', label: isZh ? '微米级机芯加工公差' : 'CNC Machining Tolerance', desc: isZh ? '五轴微雕与手工精磨完美交融' : '5-axis micro-milling combined with hand anglage' },
      { value: '50+ Guilds', num: 50, suffix: '+ Guilds', label: isZh ? '全球高端专柜与藏家合作' : 'Global Boutique Network', desc: isZh ? '服务欧洲顶尖沙龙与国际藏家' : 'Partnered with premier luxury salons globally' },
    ]);

    if (isVideo) {
      // TIMELESS VIDEO ABOUT: Swiss Watch Manufacture Cleanroom
      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;font-family:serif;">
                SWISS WATCHMAKING CLEANROOMS
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;font-family:Georgia, serif;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '将微米级精密钟表机械升华为恒久流转的艺术结晶。' : 'Elevating sub-micron horological engineering into eternal kinetic works of mechanical art.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的瑞士标准制表厂房占地 25,000 平方米，建有 Class 10,000 级洁净无尘装配车间与全自动真空注油机组。' : 'Operating an accredited 25,000 m² cleanroom facility built to Swiss horology standards with Class 10,000 dust-free assembly suites and automated lubrication rigs.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '从 CNC 慢走丝切割齿轮夹板到资深独立制表师手工装配校准，每一枚机芯均须在 15 天连续运行中达到 -4/+6 秒的天文台级极佳日差，方可压装蓝宝石镜面出厂。' : 'From wire-EDM pinion cutting to master watchmaker hand-calibration, each movement runs for 15 consecutive days to attain official -4/+6 sec/day chronometer precision before casing.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约制表工坊线上视频考察' : 'Schedule Cleanroom Video Tour'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:16px;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:36px;color:#ffffff;box-shadow:0 16px 40px rgba(180,83,9,0.12);border:1px solid rgba(180,83,9,0.3);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#fcd34d;margin-bottom:8px;font-family:serif;">
                      CALIBRE BENCHMARK DOSSIER
                    </div>
                    <div style="font-size:1.4rem;font-weight:900;font-family:serif;margin-bottom:16px;">
                      ISO 3159 Chronometer Protocol
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.85rem;color:rgba(255,255,255,0.8);">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Beat Rate Verification</span>
                        <strong style="color:#ffffff;">28,800 VPH (4Hz)</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Tested Orientations</span>
                        <strong style="color:#ffffff;">5 Positions Across 3 Temperatures</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Daily Rate Tolerance</span>
                        <strong style="color:#ffffff;">-4 to +6 sec/day</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>International Warranty</span>
                        <strong style="color:#fcd34d;">5-Year Global Calibre Warranty</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;padding:26px;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};font-family:serif;margin-bottom:4px;">${esc(s.value)}</div>
                  <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(s.label)}</div>
                  ${s.desc ? `<div style="font-size:0.8rem;color:${theme.textSub};margin-top:4px;">${esc(s.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    } else {
      // LUXURY BANNER ABOUT: Haute Joaillerie Heritage Salon
      mainHtml = `
        <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;font-family:serif;">
                HAUTE JOAILLERIE ATELIER
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;font-family:Georgia, serif;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '以敬畏之心雕琢大自然数十亿年凝聚的稀世瑰宝。' : 'Sculpting billions of years of geological wonder into timeless fine jewelry heirlooms with revered artisanal devotion.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的高级珠宝工坊汇聚了平均从业 25 年以上的金匠与微镶大师，全套配备德国莱卡显微珠宝加工台与激光微熔焊机。' : 'Our Paris-trained master jewelers boast over 25 years of bench experience, equipped with Leica stereomicroscopes and laser micro-fusion soldering suites.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '我们严格遵循金伯利进程公约，确保每一颗主石来源合法、绝无冲突。所有高定作品在出厂前均附带 GIA、IGI 或瑞士权威珠宝实验室的原版检定证书，支持全球复检。' : 'Every gemstone is 100% Kimberley Process certified conflict-free. All creations ship accompanied by official GIA, IGI, or Swiss Gübelin dossiers with tamper-proof laser girdle inscriptions.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约高级珠宝私洽品鉴' : 'Request Private Salon Appointment'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:14px;overflow:hidden;box-shadow:0 12px 36px rgba(197,155,39,0.08);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:14px;background:#ffffff;padding:36px;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(197,155,39,0.06);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:serif;">
                      GEMOLOGICAL ETHICAL CHARTER
                    </div>
                    <div style="font-size:1.35rem;font-weight:900;color:${theme.text};font-family:serif;margin-bottom:14px;">
                      Kimberley Process & Fairmined Gold
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.86rem;color:${theme.textMuted};">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Natural Diamond Sourcing</span>
                        <strong style="color:${theme.text};font-family:serif;">100% Conflict-Free KPCS</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Precious Metal Purity</span>
                        <strong style="color:${theme.text};font-family:serif;">18K Gold (750) / Plat 950</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Microscopic Inscription</span>
                        <strong style="color:${theme.text};font-family:serif;">GIA Dossier Laser Girdle</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>Courier Transport</span>
                        <strong style="color:${theme.primary};font-family:serif;">100% Armored Insured Transit</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:26px;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};font-family:serif;margin-bottom:4px;">${esc(s.value)}</div>
                  <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(s.label)}</div>
                  ${s.desc ? `<div style="font-size:0.8rem;color:${theme.textSub};margin-top:4px;">${esc(s.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'contact') {
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="jewelry-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:serif;">
              ${isZh ? '高级珠宝私洽定制与批发咨询' : 'HAUTE SOURCING & PRIVATE LABEL CONSULTATION'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:Georgia, serif;">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的采购需求或定制规格，我们的外贸专家将在 24 小时内与您接洽，并提供正式报价单、激光镭雕效果图与外贸样品寄送方案。' : 'Submit your procurement specifications or private-label requests. Our export team will respond within 24 hours with volume pricing and sample dispatch.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;font-family:Georgia, serif;">
                ${esc(brandName)}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(sanitizeCopy(company.description, isVideo ? 'Swiss manufacture horology atelier engineering precision mechanical chronometers and grand complications.' : 'Haute Joaillerie atelier crafting certified natural diamond and 18K solid gold fine jewelry collections.', isVideo ? '专注高品质瑞士机械腕表与陀飞轮时计制造，支持OEM/ODM全球直供。' : '专注高级珠宝手工微镶与天然宝石首饰出海定制，支持全球贵重品武装运输。', isZh))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Private Client Desk</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Salon Concierge</span>
                    <a href="tel:${esc(company.phone)}" style="color:${theme.text};text-decoration:none;font-weight:700;">${esc(company.phone)}</a>
                  </div>
                ` : ''}

                ${company.whatsapp ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">WhatsApp Rapid Response</span>
                    <a href="https://wa.me/${waDigits}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:none;font-weight:700;">+${waDigits} (Chat Now ↗)</a>
                  </div>
                ` : ''}

                ${company.address ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Private Atelier</span>
                    <span style="color:${theme.text};">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- RFQ Form with select name=productId -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <form action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" class="jewelry-inquiry-form" style="display:flex;flex-direction:column;gap:20px;">
                <input type="hidden" name="projectId" value="${esc(ctx.options.projectId || '')}">
                <input type="hidden" name="template" value="${isVideo ? 'jewelry-timeless-video' : 'jewelry-luxury-banner'}">

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '您的姓名 / 称谓' : 'Full Name & Salutation'} *
                    </label>
                    <input type="text" name="name" required placeholder="${isZh ? '例如：Lord / Lady Harrington' : 'e.g. Harrington Jewelry Vault'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '商务电子邮箱' : 'Corporate Email Address'} *
                    </label>
                    <input type="email" name="email" required placeholder="contact@vault.com" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '机构名称 / 买手店' : 'Boutique / Organization'}
                    </label>
                    <input type="text" name="company" placeholder="${isZh ? '例如：Harrington Fine Gems Ltd.' : 'e.g. Harrington Fine Gems Ltd.'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${esc(ui.product)} (${esc(ui.optional)})
                    </label>
                    <select name="productId" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                      <option value="">${isZh ? '— 选择咨询的产品（可选） —' : '— Select Product of Interest (Optional) —'}</option>
                      ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                    ${isZh ? '详细采购清单或规格要求' : 'Specifications & Required Details'} *
                  </label>
                  <textarea name="message" required rows="5" placeholder="${isZh ? '请描述您所需的高定款式、贵金属成色（18K黄/白/玫瑰金或铂金950）、钻石宝石等级与克拉预算、证书要求、交付日期等...' : 'Describe requested models, precious metal alloy (18K gold, Pt950), gemstone specifications and carat budget, certificate requirements, and target timeline...'}" style="width:100%;box-sizing:border-box;padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;resize:vertical;"></textarea>
                </div>

                <div>
                  <button type="submit" style="width:100%;padding:15px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '提交大宗采购询盘需求' : 'Submit Commercial RFQ & Inquire'} ↗
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="jewelry-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:60px 0 40px;color:${theme.textSub};font-size:0.88rem;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;font-family:Georgia, serif;">
              ${esc(brandName)}
            </div>
            <p style="font-size:0.86rem;color:${theme.textMuted};max-width:380px;line-height:1.6;margin:0 0 16px;">
              ${esc(sanitizeCopy(company.description, isVideo ? 'Swiss manufacture horology atelier dedicated to mechanical complications and chronometer precision.' : 'Haute Joaillerie atelier creating certified natural gemstone and 18K solid gold heirlooms.', isVideo ? '专注于瑞士原装高精度机械机芯与复杂功能腕表工程研发与制造。' : '坚守高级珠宝手工微镶传统，以大自然数十亿年稀世宝石雕琢传世经典。', isZh))}
            </p>
            <div style="font-size:0.8rem;color:${theme.textSub};">
              <strong>${isZh ? '国际权威证书' : 'Certifications'}:</strong> ${isVideo ? 'COSC Chronometer Certified · ISO 3159 · 28,800 VPH' : 'GIA Dossier · Kimberley Process · Fairmined Au750 · Pt950'}
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;font-family:serif;">${isZh ? '快捷导航' : 'Navigation'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.home)}</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.catalog)}</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.about)}</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.contact)}</a>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;font-family:serif;">${isZh ? '业务接洽' : 'Business Liaison'}</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.85rem;">
              <div>${esc(company.email)}</div>
              ${company.phone ? `<div>${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div>${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;">
          <div>© ${new Date().getUTCFullYear()} ${esc(brandName)}. All rights reserved.</div>
          <div>${isZh ? '国际高级珠宝与传世钟表制造标准 · GIA / COSC 认证' : 'GIA & COSC Standards · Haute Joaillerie Compliance'}</div>
        </div>
      </div>
    </footer>
  `;

  return `
    <div class="jewelry-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
