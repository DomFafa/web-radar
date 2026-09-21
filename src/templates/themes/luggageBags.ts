import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export interface ThemedLuggageItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  shellMaterial: string;
  dimensionsWeight: string;
  wheelHardware: string;
  moq: string;
  tagline: string;
  img: string;
}

export const LUGGAGE_DEFAULT_PRODUCTS: ThemedLuggageItem[] = [
  {
    id: 'lug-1',
    name: 'Full-Grain Tuscan Saddle Leather Weekender Duffle',
    desc: 'Handcrafted vegetable-tanned Italian saddle leather with reinforced dual-needle saddle stitching, solid antique brass hardware, and waterproof waxed canvas inner lining.',
    badge: 'Artisanal Patina',
    category: 'duffle',
    categoryNameZh: '托斯卡纳植鞣马鞍皮周末旅行手提包',
    categoryNameEn: 'Heritage Leather Duffles',
    shellMaterial: '100% Certified Italian Full-Grain Vegetable-Tanned Cowhide',
    dimensionsWeight: '52 × 28 × 30 cm · 42L · 2.1 kg',
    wheelHardware: 'Solid Cast Brass Hardware + YKK Excella Dual Zippers',
    moq: '50 Pcs per Colorway',
    tagline: 'A Century of Patina in Every Stitch',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'lug-2',
    name: 'Aerospace Polycarbonate Hinomoto Spinner Carry-On',
    desc: 'Three-layer virgin German Covestro Makrolon impact-resistant polycarbonate shell, Japanese Hinomoto silent 360° spinner wheels, and biometric TSA-approved lock.',
    badge: 'Aerospace Grade',
    category: 'carryon',
    categoryNameZh: '航空级德国拜耳PC静音万向轮登机箱',
    categoryNameEn: 'Ultralight Makrolon Spinners',
    shellMaterial: '100% Virgin Covestro Makrolon® 3-Layer Polycarbonate',
    dimensionsWeight: '55 × 38 × 23 cm · 39L · 2.85 kg (IATA Approved)',
    wheelHardware: 'Japanese Hinomoto Lisof® Silent 360° Dual Spinners',
    moq: '200 Pcs per Batch',
    tagline: 'Ultralight Engineering for Global Transit',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'lug-3',
    name: 'Master Artisan Double-Gusset Vegetable Leather Briefcase',
    desc: 'Structured executive briefcase with hand-burnished edge wax, internal padded 16-inch laptop compartment, passport quick-access pocket, and detachable shoulder strap.',
    badge: 'Executive Atelier',
    category: 'briefcase',
    categoryNameZh: '大师级原色植鞣皮双层商务公文包',
    categoryNameEn: 'Executive Leather Briefcases',
    shellMaterial: 'Full-Grain Vachetta Cowhide + Suede Microfiber Lining',
    dimensionsWeight: '41 × 31 × 11 cm · Fits 16" MacBook Pro · 1.65 kg',
    wheelHardware: 'Hand-Milled Solid Brass Latches with Key Lock',
    moq: '80 Pcs per Order',
    tagline: 'Architectural Elegance for Discerning Connoisseurs',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'lug-4',
    name: '1000D Ballistic Cordura Waterproof Tactical Backpack',
    desc: 'Military-spec DuPont Cordura ballistic exterior with Fidlock magnetic V-buckles, ergonomic dual-density EVA back ventilation channel, and luggage pass-through sleeve.',
    badge: 'Urban Tactical',
    category: 'backpack',
    categoryNameZh: '1000D考杜拉防弹尼龙全天候差旅双肩包',
    categoryNameEn: 'Ballistic Urban Backpacks',
    shellMaterial: '1000D DuPont Cordura® Ballistic Nylon + DWR C0 Finish',
    dimensionsWeight: '48 × 32 × 18 cm · 28L Expandable to 34L · 1.25 kg',
    wheelHardware: 'German Fidlock® Magnetic Buckles + Duraflex Sliders',
    moq: '150 Pcs per Style',
    tagline: 'All-Weather Armor for Urban Commuters',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'lug-5',
    name: 'Deep Trunk 6063 Aluminum-Magnesium Alloy Check-In Luggage',
    desc: 'Extra-deep volumetric trunk engineered with aircraft-grade 6063 aluminum-magnesium extrusion frame, riveted corner shields, and dual TSA-certified butterfly latches.',
    badge: 'Armor Vault',
    category: 'trunk',
    categoryNameZh: '航空铝镁合金防撞复古铝框大容量托运箱',
    categoryNameEn: 'Heavy-Duty Aluminum Trunks',
    shellMaterial: '6063 Anodized Aviation Aluminum-Magnesium Alloy',
    dimensionsWeight: '75 × 42 × 38 cm · 96L Volumetric Trunk · 5.8 kg',
    wheelHardware: 'Reinforced 60mm Ball-Bearing Shock-Absorbing Wheels',
    moq: '100 Pcs per Run',
    tagline: 'Fortress-Level Armor for Transcontinental Voyages',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'lug-6',
    name: 'Waxed Canvas & Bridle Leather Heritage Tote',
    desc: 'Heavyweight 18oz Scottish paraffin-waxed cotton canvas paired with English bridle leather handles, solid copper rivets, and a water-resistant storm flap.',
    badge: 'Vintage Heirloom',
    category: 'tote',
    categoryNameZh: '苏格兰18盎司油蜡帆布配缰革复古托特包',
    categoryNameEn: 'Waxed Canvas Totes',
    shellMaterial: '18oz Halley Stevensons Waxed Cotton Canvas + English Bridle Leather',
    dimensionsWeight: '44 × 36 × 16 cm · 25L · 1.1 kg',
    wheelHardware: 'Solid Copper Hand-Pounded Rivets + Antiqued Snaps',
    moq: '100 Pcs per Colorway',
    tagline: 'Water-Repellent Heritage Born from Nautical Sailcloth',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'lug-7',
    name: 'Modular Expandable Tech Weekender Roll-Top Bag',
    desc: 'Weatherproof TPU coated shell with roll-top expandable closure, separated ventilated footwear garage, and magnetic modular cube docking system.',
    badge: 'Modular Transit',
    category: 'duffle',
    categoryNameZh: '模块化扩容防水卷口运动旅行包',
    categoryNameEn: 'Modular Transit Packs',
    shellMaterial: '840D Recycled Poly TPU Laminate + Ripstop Lining',
    dimensionsWeight: '50 × 30 × 25 cm · 35L to 45L Expanded · 1.4 kg',
    wheelHardware: 'Laser-Etched Aluminum G-Hooks + YKK Aquaguard',
    moq: '250 Pcs per Order',
    tagline: 'Dynamic Capacity Adapting to Every Journey',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'lug-8',
    name: 'Slimline Bi-Fold Full-Grain Vachetta Passport Wallet',
    desc: 'Minimalist travel organizer with 6 card slots, boarding pass sleeve, RFID electromagnetic shield, and solid brass pen loop.',
    badge: 'Travel Essentials',
    category: 'accessory',
    categoryNameZh: '头层植鞣皮防射频护照票据收纳夹',
    categoryNameEn: 'Leather Travel Organizers',
    shellMaterial: 'Tuscan Vegetable-Tanned Cowhide + RFID-Blocking Fabric',
    dimensionsWeight: '14.5 × 10.5 × 1.2 cm · 95 g',
    wheelHardware: 'Hand-Skived Edges + French Fil Au Chinois Linen Thread',
    moq: '200 Pcs per Run',
    tagline: 'Pocket-Sized Luxury for Seamless Check-In',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getLuggageProducts(ctx: ThemeContext): ThemedLuggageItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Luggage Item ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'luggage',
      categoryNameZh: '出行箱包与奢品皮具',
      categoryNameEn: 'Luggage & Leather Goods',
      shellMaterial: p.material || '',
      dimensionsWeight: p.dimensions || '',
      wheelHardware: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = LUGGAGE_DEFAULT_PRODUCTS[idx % LUGGAGE_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '工坊旗舰款' : 'Atelier Flagship') : (isZh ? '出行优选' : 'Voyage Select'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        shellMaterial: p.material || fallback.shellMaterial,
        dimensionsWeight: p.dimensions || fallback.dimensionsWeight,
        wheelHardware: fallback.wheelHardware,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return LUGGAGE_DEFAULT_PRODUCTS;
}

export function renderLuggageBagsTemplate(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const page = ctx.page;
  const products = getLuggageProducts(ctx);
  const heroProduct = products[0]!;
  const defaultMeta = LUGGAGE_DEFAULT_PRODUCTS[0]!;

  // 100% LIGHT PALETTE FOR BOTH VARIANTS:
  // Banner: Warm Tuscan Leather Alabaster
  // Video: Aerospace High-Tech Sky Silver
  const theme = isVideo
    ? {
        bg: '#f5f8fc',
        cardBg: '#ffffff',
        cardBorder: 'rgba(2, 132, 199, 0.15)',
        primary: '#0284c7',
        primaryHover: '#0369a1',
        text: '#0f172a',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(255, 255, 255, 0.88)',
        glassBorder: 'rgba(255, 255, 255, 0.95)',
        pillBg: '#e0f2fe',
        pillText: '#0369a1',
        btnGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        accentGlow: 'rgba(2, 132, 199, 0.15)',
        tagBadge: 'Aerospace Engineering',
      }
    : {
        bg: '#fdfcf9',
        cardBg: '#ffffff',
        cardBorder: 'rgba(150, 86, 44, 0.14)',
        primary: '#96562c',
        primaryHover: '#7c4420',
        text: '#1f1610',
        textMuted: '#6b5e54',
        textSub: '#9c8e84',
        glassBg: 'rgba(255, 255, 255, 0.88)',
        glassBorder: 'rgba(255, 255, 255, 0.95)',
        pillBg: '#fbf3ec',
        pillText: '#96562c',
        btnGradient: 'linear-gradient(135deg, #96562c 0%, #7c4420 100%)',
        accentGlow: 'rgba(150, 86, 44, 0.15)',
        tagBadge: 'Tuscan Leather Guild',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // Global Header with Apple Liquid Glass
  const headerHtml = `
    <header class="luggage-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(company.name)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.25rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'AeroVoyage Tech' : 'Tuscan Leather Guild'))}
            </span>
            <span style="font-size:0.68rem;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};font-weight:700;">
              ${isVideo ? 'Impact-Engineered Travel Gear' : 'Artisanal Vegetable Leather'}
            </span>
          </div>
        </a>

        <nav aria-label="Main Navigation" style="display:flex;align-items:center;gap:28px;">
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:9999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:700;box-shadow:0 4px 14px ${theme.accentGlow};transition:transform 0.2s;">
            ${isZh ? '订制打样 / 询价' : 'Request B2B Quote'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  // Global Footer
  const footerHtml = `
    <footer style="background:#ffffff;border-top:1px solid ${theme.cardBorder};color:${theme.text};padding:60px 0 30px;margin-top:auto;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.3rem;font-weight:900;margin-bottom:10px;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'AeroVoyage Engineering' : 'Tuscan Leather Guild'))}
            </div>
            <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.7;max-width:340px;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'Precision-engineered polycarbonate spinners and tactical luggage built to international airline travel standards.' : 'Authentic Tuscan vegetable-tanned leather goods and bespoke executive luggage hand-crafted with heirloom durability.'))}
            </p>
            <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:700;">
              ✓ ${isZh ? '经 SGS / SATRA 认证出口工厂' : 'Verified B2B Export Manufacturer'}
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '品类体系' : 'Categories'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;color:${theme.textMuted};">
              <span>${isZh ? '登机万向轮箱' : 'Carry-On Spinners'}</span>
              <span>${isZh ? '托运铝框大箱' : 'Check-In Aluminum Trunks'}</span>
              <span>${isZh ? '手工植鞣公文包' : 'Artisanal Briefcases'}</span>
              <span>${isZh ? '军规考杜拉背包' : 'Ballistic Travel Packs'}</span>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${esc(ui.contact)}</div>
            <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.7;">
              <div><strong>Email:</strong> <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;">${esc(company.email)}</a></div>
              ${company.phone ? `<div><strong>Phone:</strong> ${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div style="margin-top:8px;">${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="padding-top:24px;border-top:1px solid #eef2f6;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:${theme.textSub};">
          <div>© ${new Date().getFullYear()} ${esc(company.name)}. ${esc(ui.rights)}.</div>
          <div>${isZh ? '国际箱包制造标准 · ISO9001 / BSCI 认证' : 'Global Luggage Standards · ISO9001 & BSCI Compliant'}</div>
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
      // TEMPLATE 2: luggage-voyage-video (High-Tech Light Video Showcase)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Light-Themed Video Hero Section with Liquid Glass Card -->
          <section style="position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;padding:80px 0;">
            <video id="hero-video" autoplay muted loop playsinline poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.75;filter:brightness(0.95) saturate(1.1);z-index:1;" aria-hidden="true">
              ${videoAsset ? `<source src="${esc(videoAsset)}">` : `<source src="https://assets.mixkit.co/videos/preview/mixkit-traveler-walking-through-an-airport-terminal-with-his-luggage-42610-large.mp4" type="video/mp4">`}
            </video>
            <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(245,248,252,0.92) 0%, rgba(245,248,252,0.7) 50%, rgba(245,248,252,0.4) 100%);z-index:2;"></div>

            <div class="wrap" style="position:relative;z-index:3;width:100%;padding:0 24px;">
              <div style="max-width:680px;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${theme.glassBorder};border-radius:24px;padding:48px;box-shadow:0 20px 50px -10px rgba(2,132,199,0.12);">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.primary};animation:wrPulse 2s infinite;"></span>
                  ${isZh ? '航空级工程旅行箱研制基地' : 'Aerospace Travel Engineering Lab'}
                </div>

                <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;letter-spacing:-0.03em;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '轻韧防暴 · 航空级万向轮登机与托运箱全栈定制' : 'Impact-Resistant Polycarbonate & Aircraft Aluminum Luggage'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '德国拜耳三层防弹PC复合材质，日本Hinomoto静音轮系，经SATRA 90cm跌落与12km滚轮严苛测试，专供跨国商旅与高端品牌大宗外贸。' : 'Engineered from German Covestro Makrolon® 3-layer polycarbonate with Japanese Hinomoto 360° silent wheels. Tested to rigorous international airline standards.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:32px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:12px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '浏览全系旅行箱 ↗' : 'Explore Luggage Range ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:12px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '获取采购样品套件' : 'Request Test Samples'}
                  </a>
                </div>

                <!-- Live Metrics Bar -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid #e2e8f0;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">90 cm</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '六面跌落无损测试' : 'Drop Impact Standard'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">12 km</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '碎石路面滚轮耐磨' : 'Caster Endurance Test'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};">5000+</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? 'TSA锁具开合寿命' : 'TSA Latch Cycles'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Interactive Engineering Breakdown Grid -->
          <section class="wrap" style="padding:70px 24px;">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">PRECISION BENCHMARK</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 14px;">
                ${isZh ? '三大航空级抗冲击硬核科技' : 'Three Core High-Transit Technologies'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '每一款出行箱包均经过国际航空运输协会标准测试，确保在极寒极热环境下依然保持强韧回弹。' : 'Engineered to withstand airline handling, temperature extremes, and transcontinental transit.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;">01</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '德国拜耳三层 PC 防爆箱壳' : 'Bayer 3-Layer Makrolon® PC'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '采用100%原生拜耳聚碳酸酯粒子热压成型，具备蜂窝防刮纹理与极佳的受压形变回弹性能，自重降低30%同时韧性提升两倍。' : '100% virgin polycarbonate thermal compression with micro-diamond anti-scratch texture and high elastic memory.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '耐温范围：-40°C 至 +120°C' : 'Thermal Stability: -40°C to +120°C'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;">02</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '日本日乃本 Hinomoto 润滑静音轮' : 'Hinomoto Lisof® Silent Wheels'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '独家专利含油聚氨酯轮皮与双轴承密封钢碗设计，行驶分贝低于42dB，推行顺滑阻力降低45%，无惧各类机场盲道与石板路。' : 'Patented Lisof® lubricating polyurethane tires with double-sealed bearings running at whisper-quiet <42dB.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '360° 全向双排静音轮轴' : '360° Omnidirectional Dual Rollers'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;">03</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '6063航空铝镁合金防撞骨架' : '6063 Alloy Structural Frame'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '特种加宽挤压铝框与全铆接合金防撞包角，承重受压高达150kg，配备双重TSA海关暗锁，免受野蛮托运爆箱威胁。' : 'Aviation-grade extruded aluminum frame with riveted corner caps supporting 150kg compression and dual TSA latches.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '深舱大体积 96L 超大装载率' : 'Volumetric Trunk Format up to 96L'}</div>
              </div>
            </div>
          </section>

          <!-- 3. Featured Showcase Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">FLAGSHIP FLEET</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;">
                  ${isZh ? '航空级硬箱与战术出行装备' : 'Engineered Travel Fleet'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全系 8 款产品 ↗' : 'View All 8 Models ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedLuggageItem).shellMaterial ? (item as ThemedLuggageItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(2,132,199,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f0f4f8;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="padding:10px 12px;background:#f8fafc;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '规格' : 'Specs'}:</strong> ${esc(meta.dimensionsWeight)}
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
      // TEMPLATE 1: luggage-leather-banner (Artisanal Tuscan Leather Banner)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Artisanal Hero Showcase with Split Magazine Layout -->
          <section class="wrap" style="padding:60px 24px 80px;">
            <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ★ ${isZh ? '意大利托斯卡纳植鞣皮革行会认证' : 'Consorzio Vera Pelle Italiana Conciata al Vegetale'}
                </div>

                <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.12;color:${theme.text};margin:0 0 18px;font-family:serif;letter-spacing:-0.02em;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '岁月包浆 · 传世手作托斯卡纳头层植鞣皮具工坊' : 'Centuries of Patina: Heirloom Tuscan Leather Craftsmanship'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '选用天然树皮栲胶慢速鞣制两月以上，保留牛皮天然肌理与丰满脂感。马鞍双针纯手工蜡线缝制，越经使用越显温润光泽，传世三代不朽。' : 'Slow-tanned in natural chestnut bark extract for over 60 days. Hand-stitched with waxed French linen thread for discerning travelers and luxury OEM partnerships.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索手作皮具矩阵' : 'Explore Leather Goods'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:8px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '索取皮样色卡与报价' : 'Request Swatch Kit & MOQ'}
                  </a>
                </div>

                <div style="display:flex;gap:32px;padding-top:24px;border-top:1px solid #ede5dc;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">60+ Days</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '天然植物慢速慢鞣' : 'Bark Tanning Cycle'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">100% Solid</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '黄铜手工雕琢五金' : 'Forged Brass Hardware'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">3 Generations</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '终身耐用质保承诺' : 'Heirloom Longevity'}</div>
                  </div>
                </div>
              </div>

              <!-- Hero Image Box -->
              <div style="position:relative;" class="wr-card-hover">
                <div style="position:relative;border-radius:24px;overflow:hidden;box-shadow:0 25px 60px -15px rgba(150,86,44,0.18);border:1px solid ${theme.cardBorder};background:#f7f3ee;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:520px;object-fit:cover;display:block;">
                </div>
                <div style="position:absolute;bottom:24px;left:24px;right:24px;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ${theme.glassBorder};border-radius:14px;padding:18px 22px;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">${esc(defaultMeta.badge)}</div>
                      <div style="font-size:1.05rem;font-weight:900;color:${theme.text};margin-top:2px;">${esc(heroProduct.name)}</div>
                    </div>
                    <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                      ${isZh ? '查看工艺' : 'Inspect'} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Leather Patina Aging Timeline -->
          <section class="wrap" style="padding:60px 24px 70px;">
            <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">THE PATINA JOURNEY</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 12px;font-family:serif;">
                ${isZh ? '天然植鞣皮的三重岁月蜕变' : 'Three Stages of Natural Leather Patina'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '真皮不惧岁月，时间是最好的工匠。每一次触摸与光照都让皮具绽放独一无二的光泽。' : 'Natural tannins oxidize under sunlight and absorb natural oils, maturing gracefully over decades.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">STAGE 01 / DAY 1</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '原色新生：淡雅杏白与清幽木香' : 'Virgin Honey: Raw Natural Glow'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '纯天然栗木栲胶浸泡两个月，皮质紧密饱满，毛孔细腻清晰，带有天然植鞣皮独有的森林草木清香。' : 'Tanned for two months in natural chestnut bark extract, presenting silky pore textures and forest scent.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">STAGE 02 / YEAR 3</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '岁月洗礼：光润琥珀马鞍金' : 'Seasoned Patina: Rich Saddle Amber'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '吸收岁月与触摸，皮革纤维自然软化，表面形成一层光彩熠熠的温润油脂层，抗刮耐水性显著提升。' : 'Fibers soften under daily touch, forming a lustrous protective amber shield resistant to scratches.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">STAGE 03 / YEAR 10+</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '传世珍藏：浓醇深棕古董光泽' : 'Antique Heirloom: Deep Vintage Cognac'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '沉淀为深沉醉人的古董咖啡色，马鞍双针缝线与纯铜五金氧化泛出复古微光，成为可传承三代的艺术品。' : 'Transforms into an exquisite heirloom cognac shade, with brass hardware oxidized to vintage perfection.'}
                </p>
              </div>
            </div>
          </section>

          <!-- 3. Leather Goods Catalog Showcase -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">HEIRLOOM COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;font-family:serif;">
                  ${isZh ? '手工植鞣皮具精品系列' : 'Artisanal Leather Goods Collection'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全部 8 款手作 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedLuggageItem).shellMaterial ? (item as ThemedLuggageItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(150,86,44,0.05);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f8f4ef;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                        ${esc(item.name)}
                      </h3>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="padding:10px 12px;background:#fbf8f5;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '皮质' : 'Leather'}:</strong> ${esc(meta.shellMaterial)}
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
    // CATALOG PAGE: High Contrast Clean Light Grid
    // -------------------------------------------------------------
    mainHtml = `
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'AeroVoyage Tech' : 'Tuscan Leather Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'inherit' : 'serif'};">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? (isVideo ? '浏览全系航空级PC防爆行李箱、复古铝框大容量托运箱与城市机能背包，支持激光镭雕与OEM大宗定制。' : '探索托斯卡纳植鞣皮革手提包、商务公文包与复古油蜡托特包，支持手作烫金烙印与专属五金开模。') : (isVideo ? 'Explore our aerospace luggage collection tested for high-volume international transit and commercial bulk orders.' : 'Browse our artisanal full-grain vegetable leather collection crafted with timeless heirloom longevity.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedLuggageItem).shellMaterial ? (item as ThemedLuggageItem) : LUGGAGE_DEFAULT_PRODUCTS[idx % LUGGAGE_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.04);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#f0f4f8' : '#f8f4ef'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                      ${esc(meta.badge)}
                    </span>
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn)}
                    </div>
                    <h2 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                      ${esc(item.desc || '')}
                    </p>
                    <div style="background:${isVideo ? '#f8fafc' : '#fbf8f5'};padding:10px 12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;">
                      <div><strong>${isZh ? '核心材质' : 'Material'}:</strong> ${esc(meta.shellMaterial)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '规格尺寸' : 'Dimensions'}:</strong> ${esc(meta.dimensionsWeight)}</div>
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
    const meta = (selectedProduct as unknown as ThemedLuggageItem).shellMaterial ? (selectedProduct as unknown as ThemedLuggageItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;

    mainHtml = `
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
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
                ${esc(meta.badge || (isVideo ? 'Aero-Impact Certified' : 'Artisanal Patina'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:${isVideo ? 'inherit' : 'serif'};">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc((selectedProduct as any).desc || selectedProduct.description || defaultMeta.desc)}
              </p>

              <!-- Technical Specifications Grid -->
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                  ${isZh ? '工坊出厂材质与工程技术规范' : 'Technical Specifications & Engineering Matrix'}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '核心用料' : 'Material Composition'}</span>
                    <strong style="color:${theme.text};">${esc(meta.shellMaterial)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '尺寸与自重' : 'Dimensions & Volume'}</span>
                    <strong style="color:${theme.text};">${esc(meta.dimensionsWeight)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '五金 / 轮系标准' : 'Hardware & Fasteners'}</span>
                    <strong style="color:${theme.text};">${esc(meta.wheelHardware)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '起订量 / 交付' : 'MOQ & Lead Time'}</span>
                    <strong style="color:${theme.primary};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(selectedProduct.id))}" ${navAttrs('contact', selectedProduct.id)} style="text-decoration:none;padding:15px 32px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};flex:1;text-align:center;">
                  ${isZh ? '发起 B2B 采购意向 / 索样' : 'Inquire for Custom B2B Order'} ↗
                </a>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 24px;border-radius:10px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:700;">
                  ← ${esc(ui.back)}
                </a>
              </div>
            </div>
          </div>

          <!-- Related Products -->
          <section style="padding-top:40px;border-top:1px solid #e2e8f0;">
            <h2 style="font-size:1.6rem;font-weight:900;color:${theme.text};margin:0 0 24px;">${esc(ui.related)}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:24px;">
              ${products.filter((p) => p.id !== selectedProduct.id).slice(0, 3).map((item) => `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,0.03);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:70%;overflow:hidden;border-radius:10px;margin-bottom:12px;background:#f8fafc;">
                    <img src="${esc((item as any).img || ctx.productMainImage(item as unknown as Product))}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                  </div>
                  <h3 style="font-size:0.96rem;font-weight:800;color:${theme.text};margin:0 0 6px;">${esc(item.name)}</h3>
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
    // ABOUT PAGE: High-Contrast Brand Heritage & Laboratory Story
    // -------------------------------------------------------------
    const headline = getAboutHeadline(company, company.name);
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const aboutImg = ctx.asset(company.aboutImageAssetId) || (products[1] ? (products[1] as any).img : defaultMeta.img);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '35+ Yrs', num: 35, suffix: '+ Yrs', label: isZh ? '行业制造经验' : 'Manufacturing Heritage', desc: isZh ? '深厚外贸代工与精密品控积淀' : 'Decades of global brand OEM experience' },
      { value: '1.2M Pcs', num: 1.2, suffix: 'M Pcs', label: isZh ? '年箱包出货量' : 'Annual Capacity', desc: isZh ? '直供欧美日主流零售与跨境电商' : 'Shipped to major retail partners globally' },
      { value: '99.8%', num: 99.8, suffix: '%', label: isZh ? '出口质检合格率' : 'Pass Rate on First QA', desc: isZh ? '严格遵循 AQL 1.5 国际验货标准' : 'Strict AQL 1.5 international standard' },
      { value: '50+ Labs', num: 50, suffix: '+ Tests', label: isZh ? '力学破坏性实验' : 'Destructive Tests Passed', desc: isZh ? '全套跌落震荡轮磨环境测试' : 'Comprehensive lab test suite' },
    ]);

    mainHtml = `
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:50px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '工坊传承与智造质控' : 'HERITAGE & LAB TESTING'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'inherit' : 'serif'};">
              ${esc(headline)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:720px;">
              ${esc(company.slogan || (isVideo ? '致力于打造经得起严苛航空转运考验的高精尖出行硬件装备。' : '坚守托斯卡纳传统慢速植物鞣制，赋予每一寸皮革经久不衰的生命力。'))}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                  <p style="margin:0 0 18px;">
                    ${isZh ? '我们拥有超过 35,000 平方米的现代智能化箱包生产基地，配备全自动 PC 热压成型线、全电脑马鞍双针缝纫车间以及国际标准的跌落振荡力学实验室。' : 'Operating over 35,000 square meters of state-of-the-art luggage manufacturing facilities equipped with automated PC thermal molding and dedicated mechanical testing rigs.'}
                  </p>
                  <p style="margin:0 0 18px;">
                    ${isZh ? '从材料初筛到五金疲劳测试，从拉杆往复推拉到滚轮千万转耐磨，每一道工序均秉承严苛工程哲学，旨在为全球旅行者与合作伙伴提供真正值得托付的出行体验。' : 'From raw material molecular screening to hardware fatigue testing, our engineering discipline guarantees reliability across millions of transit miles.'}
                  </p>
                `}
              </div>
              <div style="margin-top:28px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                  ${isZh ? '预约工厂验厂 / 商务洽谈' : 'Schedule Factory Audit'} ↗
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
                <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:6px;font-family:${isVideo ? 'inherit' : 'serif'};">${esc(s.value)}</div>
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
    // CONTACT PAGE: Direct Factory Export Inquiry Form
    // -------------------------------------------------------------
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '全球大宗采购与代工合作' : 'B2B INQUIRY & OEM CONSULTATION'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'inherit' : 'serif'};">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的采购需求或定制规格，我们的外贸专属项目经理将在 24 小时内与您取得联系，并提供详细报价单与免费皮样/模具方案。' : 'Submit your procurement requirements or OEM specifications. Our export account team will respond within 24 hours with complete price lists and swatch kits.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <!-- Contact Card Details -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;">
                ${esc(company.name || (isVideo ? 'AeroVoyage Tech HQ' : 'Tuscan Leather Guild'))}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(company.description || (isZh ? '专注高端出行装备与皮具外贸出口，支持OEM/ODM/OBM全球集装箱货运履约。' : 'Direct factory manufacturer supporting global container-load fulfillment and custom OEM/ODM.'))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Direct Export Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Telephone</span>
                    <a href="tel:${esc(company.phone)}" style="color:${theme.text};text-decoration:none;font-weight:700;">${esc(company.phone)}</a>
                  </div>
                ` : ''}

                ${waDigits ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">WhatsApp Rapid Response</span>
                    <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:none;font-weight:700;">+${esc(waDigits)} (Chat Now ↗)</a>
                  </div>
                ` : ''}

                ${company.address ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Facility Address</span>
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
                    <option value="">${isZh ? '— 选择意向箱包型号 —' : '— Select Luggage Model —'}</option>
                    ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>

                <div style="grid-column:span 2;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.message)} *</label>
                  <textarea name="message" required maxlength="5000" rows="5" placeholder="${isZh ? '请描述您的预计采购数量、定制激光Logo或五金要求、目标交期等...' : 'Describe your target order volume, custom branding or testing requirements...'}" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;resize:vertical;"></textarea>
                </div>

                <div style="display:none;" aria-hidden="true">
                  <input name="website" tabindex="-1" autocomplete="off">
                </div>

                <div style="grid-column:span 2;display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                  <button type="submit" ${ctx.options.preview ? 'disabled' : ''} style="padding:14px 34px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;border:none;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    ${esc(ui.send)} ↗
                  </button>
                  <span style="font-size:0.78rem;color:${theme.textSub};">${isZh ? '严格保密 · 24小时内极速回复' : 'Strict NDA · 24h Response'}</span>
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
