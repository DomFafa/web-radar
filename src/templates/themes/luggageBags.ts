import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

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

function sanitizeCopy(text: string | undefined, fallbackEn: string, fallbackZh: string, isZh: boolean): string {
  if (!text || !text.trim()) return isZh ? fallbackZh : fallbackEn;
  if (!isZh && /[\u4e00-\u9fa5]/.test(text)) return fallbackEn;
  return text;
}

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
      categoryNameEn: 'Luggage & Travel Bags',
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
        badge: idx === 0 ? (isZh ? '工坊典藏' : 'Master Atelier') : (isZh ? '出行精选' : 'Voyage Spec'),
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

  const brandName = sanitizeCopy(
    company.name,
    isVideo ? 'AeroVoyage Engineering Lab' : 'Tuscan Leather Guild & Atelier',
    isVideo ? '航空级旅行装备动力学实验室' : '托斯卡纳植鞣手工皮具大匠工坊',
    isZh,
  );

  const brandTagline = isVideo
    ? (isZh ? '航空铝镁合金与拜耳PC防撞登机箱' : 'Aerospace Makrolon & Hinomoto Mobility')
    : (isZh ? '意大利百年植鞣皮双针马鞍手缝手袋' : 'Tuscan Full-Grain Vachetta Leather Craft');

  const theme = isVideo
    ? {
        bg: '#f0f9ff',
        cardBg: '#ffffff',
        cardBorder: 'rgba(2, 132, 199, 0.16)',
        primary: '#0284c7',
        primaryHover: '#0369a1',
        text: '#0f172a',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(240, 249, 255, 0.92)',
        pillBg: '#e0f2fe',
        pillText: '#0369a1',
        btnGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        accentGlow: 'rgba(2, 132, 199, 0.18)',
      }
    : {
        bg: '#fdfbf7',
        cardBg: '#ffffff',
        cardBorder: 'rgba(154, 52, 18, 0.12)',
        primary: '#9a3412',
        primaryHover: '#7c2d12',
        text: '#1c1917',
        textMuted: '#57534e',
        textSub: '#78716c',
        glassBg: 'rgba(253, 251, 247, 0.92)',
        pillBg: '#ffedd5',
        pillText: '#9a3412',
        btnGradient: 'linear-gradient(135deg, #9a3412 0%, #7c2d12 100%)',
        accentGlow: 'rgba(154, 52, 18, 0.16)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  const headerHtml = `
    <header class="luggage-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.02);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.2rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
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
            ${isZh ? '商贸询盘与定制' : 'B2B Sourcing RFQ'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // -------------------------------------------------------------
      // VOYAGE VIDEO: Aerospace Travel Tech & Telemetry HUD Hero
      // -------------------------------------------------------------
      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ ${isZh ? '航空级高机动差旅装备系统' : 'Aerospace Mobility & Travel Lab'}
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Aerospace Toughness: Makrolon® Shells & Hinomoto Mobility', '极速机动 · 航空级拜耳PC与静音万向轮出行装备', isZh))}
                </h1>
                <p style="font-size:1.1rem;line-height:1.7;color:${theme.textMuted};margin:0 0 30px;max-width:620px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Engineered with 3-layer German Covestro Makrolon polycarbonate and Japanese Hinomoto silent 360° spinners. Certified for 1.2m sub-zero drop tests and 50km high-speed wheel dynamometer endurance.', '采用德国科思创三层高回弹 PC 复合板材与日本日乃本静音万向轮，通过 -20°C 跌落冲击与 50 公里负重路况疲劳测试，专为跨国差旅人士提供极致轻量化与高抗摔保障。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索全系出行装备 ↗' : 'Explore Travel Gear ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '索取集装箱整柜报价' : 'Request Container Pricing'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">1.2 m</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '低温负重跌落测试' : 'Drop-Impact Tested'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">50 km</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '轮组路况耐久磨损' : 'Wheel Abrasion Test'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">&lt; 35 dB</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '静音万向轮滑行噪音' : 'Silent Wheel Decibels'}</div>
                  </div>
                </div>
              </div>

              <!-- High-Tech Video / Telemetry Box -->
              <div style="position:relative;">
                <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(0,0,0,0.06);">
                  <div style="position:relative;padding-top:72%;background:#0f172a;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <span style="font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#38bdf8;background:rgba(2,132,199,0.3);padding:3px 8px;border-radius:4px;">
                          Wheel Dynamometer Rig
                        </span>
                        <span style="font-size:0.75rem;font-family:monospace;color:rgba(255,255,255,0.8);">48.7 km / 50 km PASS</span>
                      </div>
                      <div style="font-size:1.05rem;font-weight:800;line-height:1.3;">Hinomoto Lisof® 360° Spinners</div>
                      <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-top:2px;">Tested across concrete, asphalt, and cobblestone tracks with 30kg load.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3 Aerospace Mobility Pillars -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">
                  ENGINEERED TRANSIT RELIABILITY
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;">
                  ${isZh ? '高可靠性商旅出行装备的三大技术基石' : 'Three Pillars of High-Performance Travel Gear'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.7;">
                  ${isZh ? '以航天轻量化工程力学与极速静音滚轮系统，抵御全球各大机场严酷行李转运冲击。' : 'Built to survive intense baggage carousel impacts and transcontinental transit.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-weight:900;margin-bottom:14px;">01</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '德国拜耳科思创三层 PC 复合' : 'Covestro 3-Layer Makrolon®'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '微米级三层热压工艺，受强力撞击后能瞬间反弹恢复原状，在-20°C严寒下依旧保持韧性不脆裂。' : 'High-impact three-layer virgin PC bouncing back from heavy baggage impacts without stress cracking.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-weight:900;margin-bottom:14px;">02</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '日本日乃本 Lisof 静音双轮' : 'Hinomoto Lisof® Silent Spinners'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '配备超静音特种聚氨酯弹性轮胎与封闭式精密滚珠轴承，推行噪音低于35分贝，丝滑静音如飞。' : 'Patented polyurethane tires on sealed precision bearings reducing rolling noise under 35dB.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:30px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-weight:900;margin-bottom:14px;">03</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '嵌入式 TSA 海关密码锁' : 'Flush-Mounted TSA Lock'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '经美国交通安全管理局认证，全球多国海关可无损开启检查，一体化防撞内嵌设计避免行李传送带挂碰。' : 'Recessed anti-snag housing certified for smooth worldwide customs inspection and zero baggage snagging.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Gear Fleet -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;">
                    HIGH-PERFORMANCE TRANSIT GEAR
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;">
                    ${isZh ? '全天候出行装备系列' : 'Mobility & Travel Fleet'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};">
                  ${isZh ? '浏览全系 8 款装备 ↗' : 'View Full Catalog ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedLuggageItem).shellMaterial ? (item as ThemedLuggageItem) : LUGGAGE_DEFAULT_PRODUCTS[idx % LUGGAGE_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(2,132,199,0.04);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f0f9ff;">
                        <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                        <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};">
                          ${esc(meta.badge)}
                        </span>
                      </div>
                      <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                        <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                          ${esc(meta.categoryNameEn)}
                        </div>
                        <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;">
                          ${esc(item.name)}
                        </h3>
                        <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                          ${esc(item.desc || '')}
                        </p>
                        <div style="background:#f0f9ff;padding:10px 12px;border-radius:6px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;border:1px solid ${theme.cardBorder};">
                          <strong>${isZh ? '材质规格' : 'Shell Material'}:</strong> ${esc(meta.shellMaterial)}
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
      // LEATHER BANNER: Tuscan Artisanal Leather Atelier Hero
      // -------------------------------------------------------------
      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:90px 0 110px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.2fr 0.8fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;font-family:serif;">
                  ✦ ${isZh ? '意大利托斯卡纳植鞣皮革大匠工坊' : 'Tuscan Artisanal Leather Atelier'}
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.8rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;font-family:Georgia, serif;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Heirloom Patina: Full-Grain Tuscan Leather & Saddle Stitching', '岁月包浆 · 托斯卡纳头层植鞣皮与手工马鞍缝线', isZh))}
                </h1>
                <p style="font-size:1.12rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:640px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Sourced exclusively from certified Italian tanneries using slow chestnut bark vegetable extracts. Double-needle hand saddle-stitched and burnished with natural beeswax for generational resilience.', '坚守意大利托斯卡纳传统慢速植物单宁鞣制，保留头层原皮毛孔与纯正牛皮纹理。双针手工马鞍缝线锁边，经天然蜂蜡反复手工打磨封边，在岁月流转中沉淀出温润迷人的深邃包浆。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:40px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '品鉴全系奢品皮具' : 'Explore Leather Works'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:6px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '索取皮样色卡与定制报价' : 'Request Leather Swatches'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;padding-top:28px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">60 Days</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '托斯卡纳传统慢速植鞣' : 'Vegetable Tanning Period'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">100% Full-Grain</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '特级天然原皮无涂料' : 'Certified Tuscan Vachetta'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">7 Stitches</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '每英寸双针手工马鞍缝' : 'Stitches Per Inch Density'}</div>
                  </div>
                </div>
              </div>

              <!-- Editorial Duffle Card -->
              <div style="position:relative;">
                <div style="border-radius:12px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(154,52,18,0.08);padding:14px;">
                  <div style="border-radius:8px;overflow:hidden;position:relative;padding-top:105%;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(28,25,23,0.75) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#fcd34d;margin-bottom:4px;font-family:serif;">
                        ATELIER MASTERPIECE
                      </div>
                      <div style="font-size:1.15rem;font-weight:900;font-family:serif;line-height:1.3;">
                        ${esc(heroProduct.name)}
                      </div>
                      <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-top:4px;">
                        ${esc(heroProduct.shellMaterial)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3 Leathercraft Pillars -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;font-family:serif;">
                  SLOW LEATHERCRAFT GUILD PRINCIPLES
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;font-family:Georgia, serif;">
                  ${isZh ? '托斯卡纳植鞣皮具的三大匠造标准' : 'Three Standards of Tuscan Leathercraft'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.7;">
                  ${isZh ? '天然栗木单宁酸浸润与双针蜡线手工缝制，赋予每一寸皮革独一无二的生命印记与百年耐久度。' : 'Preserving natural full-grain dermal integrity through pure organic tannins and hand saddle-stitching.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:32px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:10px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">I.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '慢速植物木桶单宁浸鞣' : '60-Day Bark Tanning'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '仅采用欧洲栗木与含羞草树皮粉末在大型木桶中慢速萃取浸泡，杜绝重金属铬污染，散发纯正天然皮革芬芳。' : 'Tanned slowly in oak drums using organic chestnut tannins, free from chromium and synthetic plastics.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:10px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">II.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '双针法手工马鞍缝合' : 'Twin-Needle Saddle Stitch'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '两根针穿过同一道手工打孔互相交锁，即便其中一针磨损亦不会脱线开裂，坚韧程度远超现代流水线机缝。' : 'Hand-interlocked French linen wax thread that will never unravel even if a single surface stitch breaks.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:10px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">III.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '天然蜂蜡手工压槽封边' : 'Natural Beeswax Burnishing'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '不使用易老化开裂的化学边油，以原生态天然蜂蜡经黑黄檀木修边器反复手工摩擦，温润光滑防水防霉。' : 'Hand-friction edge burnishing with raw beeswax, defying plastic edge-paint peeling over decades.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Leather Goods -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;font-family:serif;">
                    THE LEATHER ATELIER COLLECTION
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;font-family:Georgia, serif;">
                    ${isZh ? '托斯卡纳手工皮具经典' : 'Heritage Leather Goods Gallery'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};font-family:serif;">
                  ${isZh ? '浏览全系 8 款手工皮具 ↗' : 'View Full Catalog (8 Pieces) ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedLuggageItem).shellMaterial ? (item as ThemedLuggageItem) : LUGGAGE_DEFAULT_PRODUCTS[idx % LUGGAGE_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(154,52,18,0.04);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#faf8f5;">
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
                        <div style="padding:10px 12px;background:#fdfbf7;border-radius:6px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;border:1px solid ${theme.cardBorder};">
                          <strong>${isZh ? '用料工艺' : 'Leather Spec'}:</strong> ${esc(meta.shellMaterial)}
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
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;border-bottom:1px solid ${theme.cardBorder};padding-bottom:28px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isVideo ? 'HIGH-MOBILITY TRANSIT SYSTEMS' : 'TUSCAN HERITAGE LEATHER CATALOG'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:700px;line-height:1.7;">
              ${isZh ? (isVideo ? '探索航空级PC万向轮登机箱、大容量铝镁合金托运箱、1000D考杜拉战术双肩包，专为跨国长途飞行与全地形差旅提供强悍保护。' : '品鉴托斯卡纳头层植鞣皮周末手提包、大匠级双层公文包、油蜡帆布托特包与防射频护照夹，支持大宗采购与品牌专属开模定制。') : (isVideo ? 'Browse our high-mobility luggage catalog engineered for rigorous transcontinental air transit.' : 'Explore our full-grain Tuscan vegetable-tanned leather collection handcrafted with heirloom saddle-stitching.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedLuggageItem).shellMaterial ? (item as ThemedLuggageItem) : LUGGAGE_DEFAULT_PRODUCTS[idx % LUGGAGE_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#f0f9ff' : '#fdfbf7'};">
                    <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                    <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};">
                      ${esc(meta.badge)}
                    </span>
                  </div>
                  <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                    <div style="font-size:0.74rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                      ${esc(meta.categoryNameEn)}
                    </div>
                    <h2 style="font-size:1.1rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
                      ${esc(item.name)}
                    </h2>
                    <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                      ${esc(item.desc || '')}
                    </p>
                    <div style="background:${isVideo ? '#f0f9ff' : '#fdfbf7'};padding:12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;border:1px solid ${theme.cardBorder};">
                      <div><strong>${isZh ? '材质规格' : 'Material'}:</strong> ${esc(meta.shellMaterial)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '尺寸重量' : 'Dimensions & Volume'}:</strong> ${esc(meta.dimensionsWeight)}</div>
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

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;margin-bottom:70px;">
            <div>
              <div style="border-radius:16px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 36px rgba(0,0,0,0.05);position:relative;">
                <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;max-height:540px;object-fit:cover;display:block;">
              </div>
            </div>

            <div>
              <div style="display:inline-block;padding:5px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                ${esc(meta.badge || (isVideo ? 'Aerospace Mobility Standard' : 'Tuscan Leather Guild'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(sanitizeCopy((selectedProduct as any).desc || selectedProduct.description, meta.desc, meta.desc, isZh))}
              </p>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                  ${isZh ? (isVideo ? '航天材料与轮组五金工程参数' : '托斯卡纳植鞣皮革与手缝工艺参数') : (isVideo ? 'Aerospace Shell & Hardware Specs' : 'Full-Grain Leather & Joinery Specs')}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.86rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '材质构成' : 'Shell Material'}</span>
                    <strong style="color:${theme.text};">${esc(meta.shellMaterial)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '外形尺寸/容积' : 'Dimensions & Volume'}</span>
                    <strong style="color:${theme.text};">${esc(meta.dimensionsWeight)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '五金配件/轮组' : 'Hardware & Mobility'}</span>
                    <strong style="color:${theme.text};">${esc(meta.wheelHardware)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '生产起订量' : 'Production MOQ'}</span>
                    <strong style="color:${theme.text};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                  ${isZh ? '索取该款样品与批量报价' : 'Request Item Sample & Quote'} ↗
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
      isVideo ? 'Aerospace Impact Laboratory & Kinetic Mobility R&D' : 'Tuscan Tannery Guild & Hand-Stitched Leather Atelier',
      isVideo ? '航空级出行装备抗摔实验室与动力学研发中心' : '托斯卡纳植鞣皮革行会与手工马鞍缝线大匠工坊',
      isZh,
    );

    const customAboutImg = company.aboutImageAssetId ? ctx.asset(company.aboutImageAssetId) : '';
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '35+ Yrs', num: 35, suffix: '+ Yrs', label: isZh ? '箱包智造积淀' : 'Luggage Manufacturing Heritage', desc: isZh ? '三十余年国际箱包制造与力学品控' : 'Decades of luggage OEM & testing' },
      { value: '38,000 m²', num: 38000, suffix: ' m²', label: isZh ? '智造测试园区' : 'Smart Production Facility', desc: isZh ? '全自动注塑冲压流水线与恒温实验室' : 'Robotic assembly & ISO 17025 labs' },
      { value: '99.8%', num: 99.8, suffix: '%', label: isZh ? '出厂首检合格率' : 'First-Pass QA Yield', desc: isZh ? '严格遵循 AQL 1.5 国际出货全验' : 'Strict AQL 1.5 international standard' },
      { value: '60+ Mkts', num: 60, suffix: '+ Mkts', label: isZh ? '全球出口国家' : 'Global Export Markets', desc: isZh ? '服务国际航司与高端差旅品牌' : 'Airline fleet logistics ready' },
    ]);

    if (isVideo) {
      // VOYAGE VIDEO ABOUT: 4-Testing-Stations Aerospace Lab
      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
                AEROSPACE TESTING RIGS & MOBILITY TELEMETRY
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '致力于打造经得起严苛航空转运考验的高精尖出行硬件装备。' : 'Dedicated to engineering rugged aerospace-grade travel equipment built to endure the most severe global transit and baggage handling stresses.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的箱包研发测试中心占地 38,000 平方米，建有获得 ISO/IEC 17025 资质认证的力学综合测试实验室。' : 'Operating an ISO/IEC 17025 accredited 38,000 m² testing facility equipped with continuous multi-axis drop towers, high-speed dynamometer tracks, and sub-zero climatic conditioning rooms.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '所有型号量产前，必须在 -20°C 满载 30kg 状态下通过 100 次自由跌落，以及 50 公里沥青和碎石路况连续滑行。我们用严苛数据，为国际航企与高端差旅品牌保驾护航。' : 'Every model must survive 100 sub-zero drops under 30kg payload and 50km continuous rolling over cobblestones before batch release, ensuring flawless reliability for global airlines.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约实验室视频验厂' : 'Book Testing Lab Audit'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:18px;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:36px;color:#ffffff;box-shadow:0 16px 40px rgba(2,132,199,0.12);border:1px solid rgba(2,132,199,0.3);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#38bdf8;margin-bottom:8px;">
                      TRANSIT LAB TELEMETRY
                    </div>
                    <div style="font-size:1.4rem;font-weight:900;margin-bottom:16px;">
                      Dynamic Impact & Wheel Test Rig
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.85rem;color:rgba(255,255,255,0.8);">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Cold Drop Chamber Benchmark</span>
                        <strong style="color:#ffffff;">1.2m @ -20°C (100 Drops)</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Wheel Dynamometer Track</span>
                        <strong style="color:#ffffff;">50 km Cobblestone Continuous</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Telescopic Handle Jerk Cycles</span>
                        <strong style="color:#ffffff;">5,000 Cycles @ 30kg</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>TSA Lock Prying Resistance</span>
                        <strong style="color:#38bdf8;">500 N Tensile Certified</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:26px;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};margin-bottom:4px;">${esc(s.value)}</div>
                  <div style="font-size:0.92rem;font-weight:800;color:${theme.text};">${esc(s.label)}</div>
                  ${s.desc ? `<div style="font-size:0.8rem;color:${theme.textSub};margin-top:4px;">${esc(s.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    } else {
      // LEATHER BANNER ABOUT: Tuscan Tannery Guild & Handcrafted Atelier
      mainHtml = `
        <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;font-family:serif;">
                TUSCAN LEATHER GUILD HERITAGE
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;font-family:Georgia, serif;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '坚守托斯卡纳传统慢速植物鞣制，赋予每一寸皮革经久不衰的生命力。' : 'Preserving centuries-old Tuscan vegetable tanning traditions to bestow enduring heirloom vitality upon every square inch of leather.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的皮具大匠工坊位于历史悠久的皮革产区，占地 30,000 平方米，与意大利托斯卡纳植鞣皮协会长期深度协作。' : 'Rooted in historic artisanal tannery traditions, our 30,000 m² workshop partners directly with certified Tuscan vegetable-tanning consortia.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '我们严格遵循不使用任何有毒化学铬粉的古法植鞣工序，每块皮料在栗木单宁液中浸润长达 60 天以上。资深皮匠以双针蜡线纯手工骑马缝合，每一道针脚均经受住拉力考验。' : 'We reject toxic chromium, tanning hides in pure chestnut tannins for over 60 days. Master saddlers hand-stitch every seam with double-needle waxed linen thread to defy tearing across decades.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约工坊验厂与皮料索样' : 'Schedule Atelier Visit & Leather Swatches'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:12px;overflow:hidden;box-shadow:0 12px 36px rgba(154,52,18,0.08);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:12px;background:#ffffff;padding:36px;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(154,52,18,0.06);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:serif;">
                      PELLE CONCIATA AL VEGETALE
                    </div>
                    <div style="font-size:1.35rem;font-weight:900;color:${theme.text};font-family:serif;margin-bottom:14px;">
                      Tuscan Consortium Authenticity
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.86rem;color:${theme.textMuted};">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Vegetable Tanning Period</span>
                        <strong style="color:${theme.text};font-family:serif;">60+ Days in Oak Vats</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Leather Grade</span>
                        <strong style="color:${theme.text};font-family:serif;">100% Certified Full-Grain</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Stitching Standard</span>
                        <strong style="color:${theme.text};font-family:serif;">Dual-Needle Waxed Saddle</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>Hardware Metallurgy</span>
                        <strong style="color:${theme.primary};font-family:serif;">Solid Antiqued Brass</strong>
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
      <main class="luggage-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '大宗箱包贸易与专属品牌定制' : 'COMMERCIAL PROCUREMENT & CUSTOM TENDERS'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的采购需求或定制规格，我们的外贸专家将在 24 小时内与您接洽，并提供正式报价单、激光镭雕效果图与外贸样品寄送方案。' : 'Submit your procurement specifications or private-label requests. Our export team will respond within 24 hours with volume pricing and sample dispatch.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
                ${esc(brandName)}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(sanitizeCopy(company.description, isVideo ? 'High-performance travel equipment and aerospace luggage engineering facility supplying global distributors.' : 'Artisanal leathercraft atelier supplying bespoke full-grain vegetable-tanned leather goods worldwide.', isVideo ? '专注高抗摔轻量化出行箱包与航天材料外贸制造，支持全球集装箱货运履约。' : '专注纯正意大利托斯卡纳植鞣皮具与手作包袋外贸，支持OEM/ODM全球直供。', isZh))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Direct Export Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Factory Hotline</span>
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
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Manufacturing Facility</span>
                    <span style="color:${theme.text};">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- RFQ Form with select name=productId -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <form action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" class="luggage-inquiry-form" style="display:flex;flex-direction:column;gap:20px;">
                <input type="hidden" name="projectId" value="${esc(ctx.options.projectId || '')}">
                <input type="hidden" name="template" value="${isVideo ? 'luggage-voyage-video' : 'luggage-leather-banner'}">

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '您的姓名 / 职务' : 'Full Name & Title'} *
                    </label>
                    <input type="text" name="name" required placeholder="${isZh ? '例如：Alex Morgan (采购主管)' : 'e.g. Alex Morgan, Sourcing Lead'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '商务电子邮箱' : 'Corporate Email Address'} *
                    </label>
                    <input type="email" name="email" required placeholder="alex@company.com" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '公司名称 / 品牌商' : 'Company Name / Brand'}
                    </label>
                    <input type="text" name="company" placeholder="${isZh ? '例如：Pacific Travel Gear Co.' : 'e.g. Pacific Travel Gear Co.'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
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
                    ${isZh ? '详细采购清单或规格要求' : 'Specifications & Required Volume'} *
                  </label>
                  <textarea name="message" required rows="5" placeholder="${isZh ? '请描述您所需的箱包款式、外壳材料要求（如拜耳PC、托斯卡纳植鞣皮）、拉链与轮组配置、海关锁要求、是否需要定制LOGO压印等...' : 'Describe requested models, shell material requirements (Makrolon PC, full-grain leather), wheel and zipper specs, customs lock requirements, target delivery port, and volume...'}" style="width:100%;box-sizing:border-box;padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;resize:vertical;"></textarea>
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
    <footer class="luggage-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:60px 0 40px;color:${theme.textSub};font-size:0.88rem;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
              ${esc(brandName)}
            </div>
            <p style="font-size:0.86rem;color:${theme.textMuted};max-width:380px;line-height:1.6;margin:0 0 16px;">
              ${esc(sanitizeCopy(company.description, isVideo ? 'High-performance travel equipment and aerospace mobility engineering facility.' : 'Artisanal Italian vegetable-tanned leather goods atelier dedicated to generational saddle-stitching.', isVideo ? '专注于航空级高机动登机箱与防撞托运箱工程研发与制造。' : '坚守托斯卡纳慢速植鞣传统，打造经得起岁月流转的传世原色皮具。', isZh))}
            </p>
            <div style="font-size:0.8rem;color:${theme.textSub};">
              <strong>${isZh ? '权威国际认证' : 'Certifications'}:</strong> ${isVideo ? 'IATA Cabin Dimension · TSA Approved · ISO/IEC 17025 Tested' : 'Pelle Conciata al Vegetale in Toscana · REACH · Zero Chromium'}
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '快捷导航' : 'Navigation'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.home)}</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.catalog)}</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.about)}</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.contact)}</a>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '业务接洽' : 'Business Liaison'}</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.85rem;">
              <div>${esc(company.email)}</div>
              ${company.phone ? `<div>${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div>${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;">
          <div>© ${new Date().getUTCFullYear()} ${esc(brandName)}. All rights reserved.</div>
          <div>${isZh ? '国际箱包旅行装备工程质量标准 · ISO9001 / IATA 认证' : 'IATA Commercial Flight Standards · ISO9001 Quality Certified'}</div>
        </div>
      </div>
    </footer>
  `;

  return `
    <div class="luggage-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
