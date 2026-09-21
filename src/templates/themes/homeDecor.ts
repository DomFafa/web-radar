import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

export interface ThemedDecorItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  materialTextureSpec: string;
  dimensionsOriginSpec: string;
  finishCraftDetail: string;
  moq: string;
  tagline: string;
  img: string;
}

export const DECOR_DEFAULT_PRODUCTS: ThemedDecorItem[] = [
  {
    id: 'dec-1',
    name: 'Hand-Thrown Mediterranean Terracotta Amphora Ceramic Vase',
    desc: 'Artisanal coarse-grain terracotta vessel thrown on a manual kick-wheel, fired at 1300°C with mineral oxide wash to create subtle wabi-sabi textural variations.',
    badge: '1300°C High-Fire',
    category: 'ceramic',
    categoryNameZh: '手工拉胚地中海粗陶双耳双色艺术陶罐',
    categoryNameEn: 'Artisanal Ceramics',
    materialTextureSpec: 'Natural Coarse Stoneware Clay + Mineral Iron Oxide Wash',
    dimensionsOriginSpec: 'Ø 28 × H 46 cm · 4.8 kg · Hand-Crafted in Tuscany',
    finishCraftDetail: 'Raw unglazed matte exterior with waterproof vitreous interior lining',
    moq: '30 Pcs per Batch',
    tagline: 'Ancient Earth Sculpted by Ocean Winds and Fire',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'dec-2',
    name: 'Japandi Rice Paper & Solid Ash Wood Ambient Floor Lantern',
    desc: 'Architectural floor light featuring hand-pressed mulberry washi paper diffusers and sustainable Japanese ash framework, producing soft non-glare circadian illumination.',
    badge: 'Circadian Ambient',
    category: 'lighting',
    categoryNameZh: '日式侘寂白蜡木和纸漫反射落地氛围灯',
    categoryNameEn: 'Architectural Lighting',
    materialTextureSpec: 'Mulberry Washi Paper + FSC Certified Solid White Ash',
    dimensionsOriginSpec: 'W 32 × D 32 × H 118 cm · E27 2700K Warm LED',
    finishCraftDetail: 'Traditional mortise joinery with zero exposed screws and linen cord',
    moq: '50 Pcs per Run',
    tagline: 'Gentle Diffused Radiance Calming the Modern Spirit',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'dec-3',
    name: 'Raw Roman Travertine Stone Sculptural Bookend & Catchall',
    desc: 'Monolithic geometric bookend carved from unfilled Italian Roman travertine, showcasing natural porous cavities and honed organic stone veining.',
    badge: 'Natural Travertine',
    category: 'stone',
    categoryNameZh: '纯天然罗马洞石几何雕塑书挡置物托盘',
    categoryNameEn: 'Stone Objects',
    materialTextureSpec: '100% Solid Natural Roman Travertine (Unfilled Porous)',
    dimensionsOriginSpec: '22 × 14 × 18 cm · 3.6 kg per Block',
    finishCraftDetail: 'Matte honed finish with protective anti-stain fluoropolymer seal',
    moq: '60 Sets Order',
    tagline: 'Timeless Geological Architecture on Your Tabletop',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'dec-4',
    name: 'Acoustic Merino Wool & Oak Sculptural Geometric Wall Art',
    desc: 'Modular 3D acoustic panel crafted from dense Australian Merino wool felt and steam-bent natural oak slats, absorbing 65% ambient echo while elevating room aesthetics.',
    badge: 'Acoustic Bio-Wool',
    category: 'wallart',
    categoryNameZh: '美利奴羊毛毡实木格栅吸音艺术挂画',
    categoryNameEn: 'Acoustic Wall Objects',
    materialTextureSpec: '100% Pure New Wool Felt + Natural White Oak Veneer',
    dimensionsOriginSpec: '120 × 80 × 5 cm · NRC 0.65 Sound Rating',
    finishCraftDetail: 'Formaldehyde-free zero-VOC plant-based adhesive lamination',
    moq: '25 Panels',
    tagline: 'Serene Acoustic Stillness in Minimalist Balance',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'dec-5',
    name: 'Hand-Blown Ribbed Amber Glass Fluted Tabletop Vessel',
    desc: 'Molten soda-lime glass mouth-blown into fluted wooden molds, producing organic optic ribs that refract sunlight into mesmerizing honeyed shadows.',
    badge: 'Mouth-Blown Glass',
    category: 'glass',
    categoryNameZh: '手工吹制波浪竖纹琥珀色艺术玻璃花器',
    categoryNameEn: 'Mouth-Blown Glassware',
    materialTextureSpec: 'Heavyweight Tinted Soda-Lime Art Glass',
    dimensionsOriginSpec: 'Ø 19 × H 32 cm · 2.2 kg Thick Base',
    finishCraftDetail: 'Fire-polished fluted rim with optical prismatic refraction',
    moq: '100 Pcs Run',
    tagline: 'Liquid Sunlight Frozen in Fluid Motion',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'dec-6',
    name: 'Woven Wild Hemp & Normandy Flax Linen Lumbar Cushion',
    desc: 'Textural tactile lumbar pillow woven on hand-looms from unbleached wild Himalayan hemp and pre-washed Normandy flax linen, filled with hypoallergenic down alternative.',
    badge: 'Organic Hemp Flax',
    category: 'textile',
    categoryNameZh: '手工织造野生大麻亚麻自然质感抱枕',
    categoryNameEn: 'Natural Fibre Textiles',
    materialTextureSpec: '55% Wild Raw Hemp + 45% Normandy Flax Linen',
    dimensionsOriginSpec: '35 × 65 cm · YKK Concealed Brass Zipper',
    finishCraftDetail: 'Raw fringed eyelash edges with double interlock seam reinforcing',
    moq: '80 Pcs Batch',
    tagline: 'Pure Earth Fibre Breathing Gentle Comfort into Living Spaces',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'dec-7',
    name: 'Cast Bronze Brutalist Taper Candle Holder & Candelabra',
    desc: 'Heavy sand-cast solid bronze candelabra featuring chiseled brutalist facets and hand-applied liver-of-sulfur antique patina that deepens with age.',
    badge: 'Solid Sand-Cast Bronze',
    category: 'metal',
    categoryNameZh: '粗野主义实心失蜡铸造黄铜艺术烛台',
    categoryNameEn: 'Cast Bronze Objects',
    materialTextureSpec: 'Solid C83600 Leaded Red Brass Alloy',
    dimensionsOriginSpec: '26 × 12 × 22 cm · 3.1 kg Solid Base',
    finishCraftDetail: 'Hand-waxed hot liver-of-sulfur chemical patina',
    moq: '40 Pcs Order',
    tagline: 'Ancient Molten Metal Sculpted into Modern Rituals',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'dec-8',
    name: 'Minimalist Matte Black Steel Floating Wall Console & Shelf',
    desc: 'Precision laser-cut 4mm folded cold-rolled steel floating display shelf with micro-textured matte black powder coat and concealed heavy-duty stud mounting.',
    badge: 'Architectural Steel',
    category: 'storage',
    categoryNameZh: '极简哑光折弯冷轧钢悬浮壁挂置物架',
    categoryNameEn: 'Architectural Hardware',
    materialTextureSpec: '4mm Cold-Rolled Carbon Structural Steel',
    dimensionsOriginSpec: '100 × 20 × 12 cm · 35 kg Dynamic Weight Rating',
    finishCraftDetail: 'Sandblasted electrostatic DuPont textured powder coating',
    moq: '50 Pcs Production',
    tagline: 'Razor-Sharp Graphic Silhouette Defying Gravity',
    img: '/templates/senseng/products-8.jpg',
  },
];

function sanitizeCopy(text: string | undefined, fallbackEn: string, fallbackZh: string, isZh: boolean): string {
  if (!text || !text.trim()) return isZh ? fallbackZh : fallbackEn;
  if (!isZh && /[\u4e00-\u9fa5]/.test(text)) return fallbackEn;
  return text;
}

export function getDecorProducts(ctx: ThemeContext): ThemedDecorItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Decor Item ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'decor',
      categoryNameZh: '家居装饰与软装艺术',
      categoryNameEn: 'Home Decor & Tactile Objects',
      materialTextureSpec: p.material || '',
      dimensionsOriginSpec: p.dimensions || '',
      finishCraftDetail: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = DECOR_DEFAULT_PRODUCTS[idx % DECOR_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '工坊主打' : 'Signature Piece') : (isZh ? '艺术精选' : 'Curated Item'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        materialTextureSpec: p.material || fallback.materialTextureSpec,
        dimensionsOriginSpec: p.dimensions || fallback.dimensionsOriginSpec,
        finishCraftDetail: fallback.finishCraftDetail,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return DECOR_DEFAULT_PRODUCTS;
}

export function renderHomeDecorTemplate(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const page = ctx.page;
  const products = getDecorProducts(ctx);
  const heroProduct = products[0]!;
  const defaultMeta = DECOR_DEFAULT_PRODUCTS[0]!;

  const brandName = sanitizeCopy(
    company.name,
    isVideo ? 'Ambiance Spatial Light & Sound Lab' : 'Nordic Wabi-Sabi Atelier & Living',
    isVideo ? '高奢空间光影声学实验室' : '北欧侘寂天然材质工坊与原生软装',
    isZh,
  );

  const brandTagline = isVideo
    ? (isZh ? '昼夜节律调光 · 声学吸音挂饰 · 酒店级奢华空间定制' : 'Circadian Dynamic Lighting & Architectural Acoustics')
    : (isZh ? '纯天然矿物粗陶 · 罗马天然洞石 · 手工和纸漫射灯' : 'Raw Mineral Ceramics, Unfilled Travertine & Organic Washi');

  const theme = isVideo
    ? {
        bg: '#0a0f1d',
        cardBg: '#111827',
        cardBorder: 'rgba(217, 119, 6, 0.22)',
        primary: '#d97706',
        primaryHover: '#b45309',
        text: '#f8fafc',
        textMuted: '#94a3b8',
        textSub: '#64748b',
        glassBg: 'rgba(10, 15, 29, 0.92)',
        pillBg: 'rgba(217, 119, 6, 0.15)',
        pillText: '#fbbf24',
        btnGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        accentGlow: 'rgba(217, 119, 6, 0.28)',
      }
    : {
        bg: '#fdfbf7',
        cardBg: '#ffffff',
        cardBorder: 'rgba(154, 52, 18, 0.14)',
        primary: '#9a3412',
        primaryHover: '#7c2d12',
        text: '#1c1917',
        textMuted: '#57534e',
        textSub: '#78716c',
        glassBg: 'rgba(253, 251, 247, 0.92)',
        pillBg: '#ffedd5',
        pillText: '#9a3412',
        btnGradient: 'linear-gradient(135deg, #9a3412 0%, #7c2d12 100%)',
        accentGlow: 'rgba(154, 52, 18, 0.18)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  const headerHtml = `
    <header class="decor-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(brandName)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.18rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
              ${esc(brandName)}
            </span>
            <span style="font-size:0.72rem;color:${theme.textSub};font-weight:600;letter-spacing:0.04em;">
              ${esc(brandTagline)}
            </span>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'home' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'catalog' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'about' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:700;color:${page === 'contact' ? theme.primary : theme.textMuted};transition:color 0.2s;">${esc(ui.contact)}</a>
        </nav>

        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:6px;">${ctx.languageLinks}</div>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:${isVideo ? '8px' : '4px'};background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
            ${isZh ? '索取面料样册 / 报价' : 'Trade Inquiry'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // ----------------------------------------------------------------------
      // LIVING VIDEO: Architectural Penthouse & Hospitality Spatial Ambiance Lab
      // ----------------------------------------------------------------------
      mainHtml = `
        <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 80% 20%, rgba(217, 119, 6, 0.12) 0%, transparent 65%);pointer-events:none;"></div>
            <div class="wrap" style="position:relative;padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="width:8px;height:8px;border-radius:50%;background:#d97706;animation:pulse 2s infinite;"></span>
                  ${isZh ? '高奢酒店光影与空间声学实验室' : 'Architectural Ambiance Lab'}
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Curated Architectural Lighting & Acoustic Spatial Objects', '光影与声学的建筑级空间艺术 · 高奢酒店与私宅软装工程', isZh))}
                </h1>
                <p style="font-size:1.1rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;max-width:620px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Harmonizing circadian dynamic illumination with NRC 0.85 acoustic felt sculptures and monolithic Roman travertine centrepieces for luxury hospitality developments.', '融合昼夜节律自适应漫射照明、高吸音率美利奴羊毛挂饰与整块罗马洞石雕塑，专为全球五星级度假酒店、顶层豪宅与艺术商业空间提供高级定制。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '浏览建筑声光系列 ↗' : 'View Spatial Collection ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:8px;background:${theme.cardBg};color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '获取 BIM 模型与工程报价' : 'Download BIM / RFQ'}
                  </a>
                </div>

                <!-- Telemetry Stats -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">NRC 0.85</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '声学吸音消噪评级' : 'Acoustic Absorption'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">2700-1800K</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '昼夜节律暖光渐变' : 'Circadian Warm Dim'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">BS 5852</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '酒店商业防火认证' : 'Contract Fire Safety'}</div>
                  </div>
                </div>
              </div>

              <!-- Video / Spatial CAD Simulation Box -->
              <div style="position:relative;">
                <div style="position:relative;border-radius:20px;overflow:hidden;background:${theme.cardBg};border:1px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(0,0,0,0.3);">
                  <div style="position:relative;padding-top:68%;background:#090d16;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(9,13,22,0.9) 0%, transparent 60%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <span style="font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#fbbf24;background:rgba(217,119,6,0.25);padding:3px 8px;border-radius:4px;">
                          Acoustic & Luminaire HUD
                        </span>
                        <span style="font-size:0.75rem;font-family:monospace;color:rgba(255,255,255,0.8);">CRI 98+ · R9 &gt; 92</span>
                      </div>
                      <div style="font-size:1.05rem;font-weight:800;line-height:1.3;">Japandi Washi & Acoustic Felt Assembly</div>
                      <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-top:2px;">Diffused ambient radiance combined with echo reduction in high-ceiling salons.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3 Architectural Ambiance Features -->
          <section style="padding:80px 0;background:${theme.cardBg};border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
                  ENGINEERED INTERIOR ACOUSTICS & LUMEN DYNAMICS
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;">
                  ${isZh ? '顶级酒店与豪宅工程的三大空间技术' : 'Three Spatial Innovations in Luxury Hospitality'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.6;">
                  ${isZh ? '打破传统软装仅注重外观的局限，以光学健康指数与吸音降噪工程，创造兼具艺术震撼与生理放松的深层人居体验。' : 'Transcending superficial ornamentation through laboratory-measured circadian lighting and high-performance sound absorption.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:30px;" class="wr-card-hover">
                  <div style="width:48px;height:48px;border-radius:10px;background:rgba(217,119,6,0.15);display:flex;align-items:center;justify-content:center;color:${theme.primary};font-size:1.4rem;font-weight:900;margin-bottom:18px;">01</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '美利奴羊毛吸音复合挂饰' : 'Bio-Wool Acoustic Panels'}</h3>
                  <p style="font-size:0.88rem;line-height:1.65;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '采用 100% 澳洲美利奴纯羊毛高密纤维，配合蒸汽曲木橡木格栅，在 500Hz-2000Hz 人声频段达成 NRC 0.85 卓越吸音率。' : 'Dense Australian Merino wool felt paired with steam-bent oak baffles, capturing 85% of ambient high-ceiling echo.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">${isZh ? '通过 ASTM C423 声学与防阻燃检测' : 'ASTM C423 & CAL 133 Compliant'}</div>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:30px;" class="wr-card-hover">
                  <div style="width:48px;height:48px;border-radius:10px;background:rgba(217,119,6,0.15);display:flex;align-items:center;justify-content:center;color:${theme.primary};font-size:1.4rem;font-weight:900;margin-bottom:18px;">02</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '昼夜节律双色温漫射透镜' : 'Circadian Washi Luminaires'}</h3>
                  <p style="font-size:0.88rem;line-height:1.65;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '传统手工楮皮和纸结合无频闪深调光驱动，色温随自然日光从清晨 4000K 丝滑过渡至深夜 1800K 烛光色温，呵护褪黑素分泌。' : 'Hand-pressed mulberry washi diffusers with flicker-free 0-10V dimming from 4000K daylight to 1800K candle amber.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">${isZh ? 'CRI 98 高显指 · R9 &gt; 92 还原真实肤色' : 'CRI 98 & Full Circadian Synchrony'}</div>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:16px;padding:30px;" class="wr-card-hover">
                  <div style="width:48px;height:48px;border-radius:10px;background:rgba(217,119,6,0.15);display:flex;align-items:center;justify-content:center;color:${theme.primary};font-size:1.4rem;font-weight:900;margin-bottom:18px;">03</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '整块罗马原生洞石精密雕琢' : 'Monolithic Travertine Objects'}</h3>
                  <p style="font-size:0.88rem;line-height:1.65;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '意大利拉齐奥采石场直选罗马洞石，保留其亿万年天然微孔呼吸纹理，表面经微孔氟碳防渗处理，兼具原始野性与耐污耐久。' : 'Quarried in Lazio, Italy. Natural unfilled cavities sealed with invisible fluoropolymer to prevent wine and coffee staining.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">${isZh ? '全数控五轴水刀异形切割倒角' : '5-Axis CNC Waterjet Precision Cut'}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Spatial Gallery Grid -->
          <section style="padding:80px 0;background:${theme.bg};">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;">
                    HOSPITALITY CONTRACT SPECIFICATIONS
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0;">
                    ${isZh ? '空间工程精选系列' : 'Curated Spatial Products'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};font-weight:700;text-decoration:none;font-size:0.92rem;">
                  ${isZh ? '查看全部工程款式' : 'View Full Catalog'} →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">
                ${products.slice(0, 4).map((p) => `
                  <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;padding-top:72%;background:#1e293b;overflow:hidden;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
                      ${p.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:4px;background:rgba(10,15,29,0.85);backdrop-filter:blur(8px);font-size:0.72rem;font-weight:800;color:#fbbf24;border:1px solid rgba(217,119,6,0.3);">${esc(p.badge)}</span>` : ''}
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:${theme.text};line-height:1.4;">${esc(p.name)}</h3>
                      <p style="font-size:0.82rem;line-height:1.55;color:${theme.textMuted};margin:0 0 16px;flex:1;">${esc(p.desc)}</p>
                      
                      <div style="padding:12px;background:${theme.bg};border-radius:8px;border:1px solid ${theme.cardBorder};margin-bottom:16px;font-size:0.75rem;">
                        <div style="color:${theme.textMuted};margin-bottom:4px;"><strong>Material:</strong> ${esc(p.materialTextureSpec)}</div>
                        <div style="color:${theme.textMuted};"><strong>Dimensions:</strong> ${esc(p.dimensionsOriginSpec)}</div>
                      </div>

                      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid ${theme.cardBorder};">
                        <span style="font-size:0.78rem;font-weight:700;color:${theme.primary};">${esc(p.moq || 'B2B Wholesale')}</span>
                        <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;padding:6px 14px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                          ${esc(ui.details)} →
                        </a>
                      </div>
                    </div>
                  </article>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    } else {
      // ----------------------------------------------------------------------
      // AESTHETIC BANNER: Nordic Wabi-Sabi Natural Material Atelier
      // ----------------------------------------------------------------------
      mainHtml = `
        <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <!-- Editorial Natural Material Hero -->
          <section style="position:relative;overflow:hidden;padding:80px 0 90px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:18px;font-family:Georgia, serif;">
                  NORDIC WABI-SABI ATELIER
                </div>
                <h1 style="font-size:clamp(2.4rem, 4.5vw, 3.6rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.02em;margin:0 0 20px;font-family:Georgia, serif;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Artisanal Terracotta, Roman Travertine & Washi Lighting', '质朴侘寂 · 原生粗陶 · 罗马天然洞石与纯手工和纸软装', isZh))}
                </h1>
                <p style="font-size:1.1rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:620px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Celebrating the timeless beauty of raw geological materials, mineral high-fire ceramics, and botanical fibres. Ethical wholesale sourcing for boutique hotels, architects, and luxury interior designers.', '秉持对自然造物的敬畏，萃取未经繁复雕饰的罗马洞石、1300°C 高温天然陶土与手作楮皮和纸，为全球精品酒店、独立设计师买手店与高端私宅提供质朴从容的软装陈列。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:40px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 32px;border-radius:4px;background:${theme.btnGradient};color:#ffffff;font-size:0.94rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};font-family:Georgia, serif;">
                    ${isZh ? '探索工坊典藏产品 ↗' : 'Explore Natural Collection ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:4px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.94rem;font-weight:700;">
                    ${isZh ? '索取批发展厅样册' : 'Request Trade Catalog'}
                  </a>
                </div>

                <!-- 3 Tactile Swatch Badges -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:Georgia, serif;">1300°C</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '高温矿物还原烧制' : 'High-Fire Stoneware'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:Georgia, serif;">Zero-VOC</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '天然矿物与植物胶黏' : '100% Non-Toxic Finishes'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:Georgia, serif;">FSC Pure</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '可持续林业白蜡木实木' : 'Certified Hardwood Frame'}</div>
                  </div>
                </div>
              </div>

              <!-- Editorial Split Hero Image -->
              <div style="position:relative;">
                <div style="border-radius:12px;overflow:hidden;box-shadow:0 20px 48px rgba(154,52,18,0.08);border:1px solid ${theme.cardBorder};">
                  <div style="position:relative;padding-top:82%;background:#f5f0eb;overflow:hidden;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
                    <div style="position:absolute;bottom:0;inset-x:0;background:linear-gradient(to top, rgba(28,25,23,0.85) 0%, transparent 60%);padding:24px;color:#ffffff;">
                      <span style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;color:#fed7aa;font-weight:800;font-family:Georgia, serif;">
                        ${isZh ? '当季工坊主打' : 'Atelier Signature Piece'}
                      </span>
                      <div style="font-size:1.15rem;font-weight:900;font-family:Georgia, serif;margin-top:2px;">${esc(heroProduct.name)}</div>
                      <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-top:4px;">${esc(heroProduct.materialTextureSpec)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3 Material Craft Cards -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;font-family:Georgia, serif;">
                  THE ARTISAN'S ELEMENTAL PALETTE
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;font-family:Georgia, serif;">
                  ${isZh ? '天地自然的三大原生触感材料' : 'Three Natural Materials Shaped by Human Hands'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.75;">
                  ${isZh ? '不事矫揉造作的修饰，忠实保留天然陶泥的粗糙微粒、天然洞石的孔隙肌理与楮皮和纸的植物纤维。' : 'Preserving the raw honesty of mineral earth, unpolished Italian limestone, and wild botanical fibres.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:10px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};font-family:Georgia, serif;margin-bottom:14px;">I. 高温粗陶窑变</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:Georgia, serif;">${isZh ? '1300°C 矿物还原氧化焰' : '1300°C Mineral Stoneware'}</h3>
                  <p style="font-size:0.88rem;line-height:1.75;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '传统脚踏拉胚机手工成型，坯体经 1300°C 柴烧窑炉高温烧结，天然铁矿粉在器物表面形成无法复制的温润斑驳。' : 'Hand-thrown on manual kick wheels and fired with natural iron mineral washes, yielding rich tactile wabi-sabi patinas.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};font-family:Georgia, serif;">${isZh ? '内壁高密耐水玻璃质釉层' : 'Vitreous Waterproof Interior'}</div>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:10px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};font-family:Georgia, serif;margin-bottom:14px;">II. 原生罗马洞石</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:Georgia, serif;">${isZh ? '天然多孔未填胶质感' : 'Unfilled Natural Travertine'}</h3>
                  <p style="font-size:0.88rem;line-height:1.75;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '开采自意大利拉齐奥古老地层，保留亿万年地下泉水冲刷形成的天然孔隙与层状节理，几何切块打磨，厚重而宁静。' : 'Solid Roman limestone showcasing organic cavities and honed veins, protected by non-toxic anti-stain seals.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};font-family:Georgia, serif;">${isZh ? '哑光细腻水磨触感与防污封层' : 'Honed Matte Finish Sealed'}</div>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:10px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.5rem;font-weight:900;color:${theme.primary};font-family:Georgia, serif;margin-bottom:14px;">III. 楮皮和纸漫射</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:Georgia, serif;">${isZh ? '手工捞纸柔光漫反射' : 'Hand-Pressed Mulberry Washi'}</h3>
                  <p style="font-size:0.88rem;line-height:1.75;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '以天然构树皮长纤维手工抄造，透光而不刺眼，配合白蜡木榫卯骨架，散发出如同薄暮晨曦般的静谧安抚光线。' : 'Hand-pressed bark fibres creating gentle, shadow-free illumination that calms modern interior living spaces.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};font-family:Georgia, serif;">${isZh ? '传统榫卯架构，零金属外露' : 'Mortise Joinery, Zero Hardware'}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Tactile Catalog Showcase -->
          <section style="padding:80px 0;background:${theme.bg};">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;font-family:Georgia, serif;">
                    CURATED ATELIER CREATIONS
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0;font-family:Georgia, serif;">
                    ${isZh ? '工坊原生材质器物展陈' : 'Tactile Living Catalog'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};font-weight:700;text-decoration:none;font-size:0.92rem;font-family:Georgia, serif;">
                  ${isZh ? '查看全部工坊器物' : 'View Full Catalog'} →
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((p) => `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                    <div style="position:relative;padding-top:72%;background:#f5f0eb;overflow:hidden;">
                      <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
                      ${p.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:4px;background:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:0.72rem;font-weight:800;color:${theme.primary};font-family:Georgia, serif;">${esc(p.badge)}</span>` : ''}
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:${theme.text};line-height:1.4;font-family:Georgia, serif;">${esc(p.name)}</h3>
                      <p style="font-size:0.82rem;line-height:1.6;color:${theme.textMuted};margin:0 0 16px;flex:1;">${esc(p.desc)}</p>
                      
                      <div style="padding:12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};margin-bottom:16px;font-size:0.75rem;">
                        <div style="color:${theme.textMuted};margin-bottom:4px;"><strong>Material:</strong> ${esc(p.materialTextureSpec)}</div>
                        <div style="color:${theme.textMuted};"><strong>Dimensions:</strong> ${esc(p.dimensionsOriginSpec)}</div>
                      </div>

                      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid ${theme.cardBorder};">
                        <span style="font-size:0.78rem;font-weight:700;color:${theme.primary};font-family:Georgia, serif;">${esc(p.moq || 'B2B Wholesale')}</span>
                        <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;padding:6px 14px;border-radius:4px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                          ${esc(ui.details)} →
                        </a>
                      </div>
                    </div>
                  </article>
                `).join('')}
              </div>
            </div>
          </section>
        </main>
      `;
    }
  } else if (page === 'catalog') {
    const categories = Array.from(new Set(products.map((p) => p.categoryNameEn || p.category)));

    mainHtml = `
      <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
              ${isVideo ? 'ARCHITECTURAL CONTRACT HARDWARE & ACCENTS' : 'ATELIER NATURAL MATERIAL ARCHIVE'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '全线产品支持工程批量采购、定制尺寸、色号适配与防阻燃防渗漏表面工艺处理。' : 'Explore our complete collection of natural material objects and architectural decor. Available for commercial hospitality projects and trade accounts.'}
            </p>
          </div>

          <!-- Category Tags -->
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:40px;padding-bottom:20px;border-bottom:1px solid ${theme.cardBorder};">
            <span style="padding:8px 18px;border-radius:${isVideo ? '8px' : '4px'};background:${theme.primary};color:#ffffff;font-size:0.85rem;font-weight:700;">
              ${isZh ? '全部器物' : 'All Objects'} (${products.length})
            </span>
            ${categories.map((c) => `
              <span style="padding:8px 18px;border-radius:${isVideo ? '8px' : '4px'};background:${theme.cardBg};border:1px solid ${theme.cardBorder};color:${theme.textMuted};font-size:0.85rem;font-weight:700;">
                ${esc(c)}
              </span>
            `).join('')}
          </div>

          <!-- Products Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((p) => `
              <article style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:${isVideo ? '14px' : '10px'};overflow:hidden;display:flex;flex-direction:column;" class="wr-card-hover">
                <div style="position:relative;padding-top:72%;background:${isVideo ? '#1e293b' : '#f5f0eb'};overflow:hidden;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
                  ${p.badge ? `<span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:4px;background:${isVideo ? 'rgba(10,15,29,0.85)' : '#ffffff'};font-size:0.72rem;font-weight:800;color:${theme.primary};font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">${esc(p.badge)}</span>` : ''}
                </div>

                <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                  <span style="font-size:0.75rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;">
                    ${esc(p.categoryNameEn || p.category)}
                  </span>
                  <h3 style="font-size:1.08rem;font-weight:800;color:${theme.text};margin:0 0 8px;line-height:1.4;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
                    ${esc(p.name)}
                  </h3>
                  <p style="font-size:0.82rem;line-height:1.6;color:${theme.textMuted};margin:0 0 16px;flex:1;">
                    ${esc(p.desc)}
                  </p>

                  <div style="padding:12px;background:${theme.bg};border-radius:6px;border:1px solid ${theme.cardBorder};margin-bottom:16px;font-size:0.75rem;">
                    <div style="color:${theme.textMuted};margin-bottom:4px;"><strong>Material:</strong> ${esc(p.materialTextureSpec)}</div>
                    <div style="color:${theme.textMuted};"><strong>Dimensions:</strong> ${esc(p.dimensionsOriginSpec)}</div>
                  </div>

                  <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid ${theme.cardBorder};">
                    <span style="font-size:0.78rem;font-weight:700;color:${theme.primary};font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">${esc(p.moq || 'B2B Wholesale')}</span>
                    <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="text-decoration:none;padding:6px 14px;border-radius:${isVideo ? '6px' : '4px'};background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                      ${esc(ui.details)} →
                    </a>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </main>
    `;
  } else if (page === 'detail') {
    const meta = (selectedProduct as unknown as ThemedDecorItem).materialTextureSpec ? (selectedProduct as unknown as ThemedDecorItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;
    const prodName = selectedProduct.name || meta.name;
    const prodDesc = sanitizeCopy((selectedProduct as any).desc || (selectedProduct as any).description, meta.desc, meta.desc, isZh);

    mainHtml = `
      <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <!-- Breadcrumb -->
          <div style="margin-bottom:30px;font-size:0.85rem;color:${theme.textSub};font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
            <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textSub};text-decoration:none;">${esc(ui.home)}</a>
            <span style="margin:0 8px;">/</span>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textSub};text-decoration:none;">${esc(ui.catalog)}</a>
            <span style="margin:0 8px;">/</span>
            <span style="color:${theme.text};font-weight:700;">${esc(prodName)}</span>
          </div>

          <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:start;">
            <!-- Gallery View -->
            <div>
              <div style="border-radius:${isVideo ? '16px' : '10px'};overflow:hidden;border:1px solid ${theme.cardBorder};background:${isVideo ? '#1e293b' : '#f5f0eb'};box-shadow:0 12px 36px rgba(0,0,0,0.06);">
                <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(prodName)}" style="width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;display:block;">
              </div>
            </div>

            <!-- Specs & Inquiries -->
            <div>
              <div style="display:inline-block;padding:4px 12px;border-radius:${isVideo ? '6px' : '4px'};background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
                ${esc(meta.badge || (isVideo ? 'Acoustic Lab Spec' : '1300°C Stoneware'))}
              </div>
              
              <h1 style="font-size:clamp(1.8rem, 3.5vw, 2.5rem);font-weight:900;color:${theme.text};margin:0 0 14px;line-height:1.2;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
                ${esc(prodName)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.75;color:${theme.textMuted};margin:0 0 24px;">
                ${esc(prodDesc)}
              </p>

              <!-- Technical Specifications Table -->
              <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:${isVideo ? '12px' : '8px'};padding:20px;margin-bottom:28px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
                  ${isZh ? '器物材质与工程参数规格' : 'Material & Engineering Specifications'}
                </div>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;font-size:0.85rem;">
                  <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                    <span style="color:${theme.textSub};">Primary Material</span>
                    <strong style="color:${theme.text};">${esc(meta.materialTextureSpec)}</strong>
                  </div>
                  <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                    <span style="color:${theme.textSub};">Dimensions & Origin</span>
                    <strong style="color:${theme.text};">${esc(meta.dimensionsOriginSpec)}</strong>
                  </div>
                  <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                    <span style="color:${theme.textSub};">Surface Craft / Finish</span>
                    <strong style="color:${theme.text};">${esc(meta.finishCraftDetail)}</strong>
                  </div>
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:${theme.textSub};">Contract MOQ</span>
                    <strong style="color:${theme.primary};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display:flex;flex-direction:column;gap:14px;">
                <a href="${path(`contact/index.html?productId=${encodeURIComponent(selectedProduct.id)}`)}" ${navAttrs('contact', selectedProduct.id)} style="text-decoration:none;padding:16px 28px;border-radius:${isVideo ? '8px' : '4px'};background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;text-align:center;box-shadow:0 4px 16px ${theme.accentGlow};font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
                  ${isZh ? '针对此款器物索取采购报价' : 'Request Quotation for this Item'} ↗
                </a>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;color:${theme.textSub};padding:0 8px;">
                  <span>✓ ${isZh ? '支持定制尺寸与色卡打样' : 'Custom Dimensions & Finishes'}</span>
                  <span>✓ ${isZh ? '外贸海运木箱加固打包' : 'Drop-Tested Sea Freight Crating'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    const headline = getAboutHeadline(company, isVideo ? 'Precision Engineering of Spatial Light & Sound' : 'Honoring Geological Time through Natural Craft');
    const customAboutImg = ctx.asset(company.aboutImageAssetId);
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '25+ Yrs', num: 25, suffix: '+ Yrs', label: isZh ? '空间软装与美学积淀' : 'Artisanal & Acoustic Heritage', desc: isZh ? '二十余年奢华空间美学软装研发' : 'Decades of luxury hospitality craftsmanship' },
      { value: '100% Bio', num: 100, suffix: '%', label: isZh ? '纯天然矿物与环保选材' : 'Zero-VOC Sustainable Materials', desc: isZh ? '零甲醛与低碳环保认证材料' : 'Certified organic and non-toxic materials' },
      { value: 'NRC 0.85', num: 0.85, label: isZh ? '建筑声学吸音指标' : 'Sound Attenuation Rating', desc: isZh ? '通过国际声学与阻燃全项检测' : 'BS 5852 & ASTM C423 compliant' },
      { value: '50+ Mkts', num: 50, suffix: '+ Mkts', label: isZh ? '全球出口与高端工程' : 'Global Project Stockists', desc: isZh ? '服务国际星级酒店与名牌会所' : 'Partnered with global architectural studios' },
    ]);

    if (isVideo) {
      // ----------------------------------------------------------------------
      // LIVING VIDEO ABOUT: Spatial Acoustics & Photometric Lab
      // ----------------------------------------------------------------------
      mainHtml = `
        <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
                SPATIAL LIGHT & SOUND LAB
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.7;">
                ${isZh ? '将建筑光学计算、混响吸音物理学与顶级手作材质完美相融的工程实验室。' : 'Merging architectural photometry, acoustic physics, and master artisan textures for luxury hospitality interiors.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的空间声学与光影实验室坐落于国际高新技术产业园区，配备全消音混响测试舱与分布式光度计，专门为奢华酒店、大堂会所与高挑空私宅定制研发降噪与昼夜节律软装系统。' : 'Our laboratory is equipped with state-of-the-art acoustic reverberation chambers and goniophotometers to engineer circadian wellness lighting and echo-absorbing spatial objects.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '全线产品严格通过 BS 5852 酒店阻燃测试与 ASTM C423 声学吸音认证，产品图纸全面配套 BIM / Revit 3D 族库文件，赋能全球顶级建筑事务所与室内设计团队。' : 'Certified compliant with BS 5852 contract flame retardancy and ASTM C423 sound absorption, fully documented with downloadable BIM/Revit architectural families.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '申请工程合作资质' : 'Request Specifier Catalog'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.3);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <!-- Bespoke Spatial CAD Blueprint HUD SVG -->
                  <div style="border-radius:18px;background:${theme.cardBg};padding:32px;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(0,0,0,0.4);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
                      ACOUSTIC & PHOTOMETRIC LAB SPECIFICATIONS
                    </div>
                    <div style="font-size:1.3rem;font-weight:900;color:${theme.text};margin-bottom:14px;">
                      Circadian Tuning & Noise Control
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.86rem;color:${theme.textMuted};">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Reverberation Attenuation</span>
                        <strong style="color:${theme.text};">NRC 0.85 (500Hz-2kHz)</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Color Rendering Index</span>
                        <strong style="color:${theme.text};">CRI 98+ · R9 &gt; 92</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Hospitality Flame Standard</span>
                        <strong style="color:${theme.text};">BS 5852 & CAL 133</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>CAD / BIM Data Integration</span>
                        <strong style="color:${theme.primary};">Revit / DWG / OBJ Ready</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:14px;padding:26px;">
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
      // ----------------------------------------------------------------------
      // AESTHETIC BANNER ABOUT: Nordic Wabi-Sabi Natural Material Atelier
      // ----------------------------------------------------------------------
      mainHtml = `
        <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;font-family:Georgia, serif;">
                WABI-SABI MATERIAL ATELIER
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;font-family:Georgia, serif;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '以朴素的双手与世代相传的匠艺，唤醒沉睡于泥土、石块与植物纤维中的永恒诗意。' : 'Evoking the timeless poetry asleep inside coarse clay, volcanic limestone, and botanical fibres through venerated human touch.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的手作工坊扎根于拥有深厚陶艺与石雕历史的手工艺重镇，汇集了平均从业 20 年以上的手工拉胚师、石材修琢师与和纸抄造匠人。' : 'Rooted in historic craft districts, our atelier gathers master ceramicists, stone sculptors, and paper artisans with over two decades of bench devotion.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '我们拒绝塑料合成覆膜与人工香精浸染，所有陶土均取自富含矿物质的原始陶土层，木料全线选用经 FSC 森林管理认证的欧洲白蜡木与橡木，践行对大地生生不息的可持续承诺。' : 'Rejecting artificial plastic veneers and VOC finishes, we exclusively source ethically mined terracotta, FSC-certified hardwoods, and unbleached organic linen.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:4px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;font-family:Georgia, serif;">
                  ${isZh ? '预约展厅品鉴与样板调取' : 'Request Atelier Trade Samples'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:12px;overflow:hidden;box-shadow:0 12px 36px rgba(154,52,18,0.08);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <!-- Bespoke Natural Material Atelier Spec Card -->
                  <div style="border-radius:10px;background:#ffffff;padding:36px;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(154,52,18,0.06);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:Georgia, serif;">
                      SUSTAINABLE MATERIAL PROVENANCE
                    </div>
                    <div style="font-size:1.35rem;font-weight:900;color:${theme.text};font-family:Georgia, serif;margin-bottom:14px;">
                      Zero-VOC & Certified Natural Earth
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.86rem;color:${theme.textMuted};">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Stoneware Firing</span>
                        <strong style="color:${theme.text};font-family:Georgia, serif;">1300°C High-Fire Vitreous</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Stone Sourcing</span>
                        <strong style="color:${theme.text};font-family:Georgia, serif;">Lazio Italian Travertine</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Wood Certification</span>
                        <strong style="color:${theme.text};font-family:Georgia, serif;">100% FSC White Ash & Oak</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>Packaging Standard</span>
                        <strong style="color:${theme.primary};font-family:Georgia, serif;">Zero Plastic Honeycomb</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:8px;padding:26px;">
                  <div style="font-size:1.8rem;font-weight:900;color:${theme.primary};font-family:Georgia, serif;margin-bottom:4px;">${esc(s.value)}</div>
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
      <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
              ${isVideo ? 'HOSPITALITY CONTRACT SPECIFICATION & SAMPLES' : 'ATELIER WHOLESALE & TRADE INQUIRIES'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的工程采购清单或定制需求，我们的软装外贸顾问将在 24 小时内与您联系，提供出厂阶梯报价、材质色卡寄送及海运集装箱装箱方案。' : 'Submit your commercial project requirements or wholesale trade inquiries. Our foreign trade team will respond within 24 hours with volume pricing, physical swatches, and logistics plans.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:${isVideo ? '18px' : '10px'};padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
                ${esc(brandName)}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(sanitizeCopy(company.description, isVideo ? 'Hospitality ambiance lab specializing in circadian lighting fixtures, acoustic wool wall panels, and contract architectural decor.' : 'Artisanal atelier crafting coarse stoneware ceramics, raw Roman travertine, and handmade washi diffusers for global trade accounts.', isVideo ? '高奢酒店光影声学实验室，支持工程BIM定制与大批量集采。' : '专注天然材质侘寂软装工坊，粗陶与罗马洞石出海批发。', isZh))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Trade Liaison Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Direct Phone</span>
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
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Atelier & Showroom</span>
                    <span style="color:${theme.text};">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- RFQ Form with select name=productId -->
            <div style="background:${theme.cardBg};border:1px solid ${theme.cardBorder};border-radius:${isVideo ? '18px' : '10px'};padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <form action="${esc(safeUrl(ctx.options.inquiryUrl))}" method="post" class="decor-inquiry-form" style="display:flex;flex-direction:column;gap:20px;">
                <input type="hidden" name="projectId" value="${esc(ctx.options.projectId || '')}">
                <input type="hidden" name="template" value="${isVideo ? 'homedecor-living-video' : 'homedecor-aesthetic-banner'}">

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '您的姓名 / 称呼' : 'Contact Name'} *
                    </label>
                    <input type="text" name="name" required placeholder="${isZh ? '例如：王工 / 李经理' : 'e.g. Eleanor Vance'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:${isVideo ? '8px' : '4px'};border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '商务电子邮箱' : 'Corporate Email'} *
                    </label>
                    <input type="email" name="email" required placeholder="procurement@studio.com" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:${isVideo ? '8px' : '4px'};border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '公司名称 / 设计事务所' : 'Company / Studio Name'}
                    </label>
                    <input type="text" name="company" placeholder="${isZh ? '例如：某某空间设计事务所' : 'e.g. Vance Architectural Interiors'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:${isVideo ? '8px' : '4px'};border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${esc(ui.product)} (${esc(ui.optional)})
                    </label>
                    <select name="productId" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:${isVideo ? '8px' : '4px'};border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.9rem;outline:none;">
                      <option value="">${isZh ? '— 选择咨询的产品（可选） —' : '— Select Product of Interest (Optional) —'}</option>
                      ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                    ${isZh ? '项目要求 / 规格与采购批量' : 'Project Specifications & Volume'} *
                  </label>
                  <textarea name="message" rows="4" required placeholder="${isZh ? '请注明具体款式编号、数量需求、交付时间及目的港口等信息...' : 'Specify target item models, required quantity, target delivery timeline, finish customizations...'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:${isVideo ? '8px' : '4px'};border:1px solid ${theme.cardBorder};background:${theme.bg};color:${theme.text};font-size:0.9rem;outline:none;resize:vertical;"></textarea>
                </div>

                <button type="submit" style="padding:14px 28px;border-radius:${isVideo ? '8px' : '4px'};background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
                  ${isZh ? '提交询盘 · 24小时内获得正式外贸报价单 ↗' : 'Submit Procurement RFQ ↗'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  const footerHtml = `
    <footer class="decor-footer" style="background:${isVideo ? '#060a12' : '#f5f0ea'};border-top:1px solid ${theme.cardBorder};padding:60px 0 30px;color:${theme.textMuted};">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.15rem;font-weight:900;color:${theme.text};margin-bottom:10px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">
              ${esc(brandName)}
            </div>
            <p style="font-size:0.85rem;line-height:1.6;margin:0 0 16px;max-width:380px;">
              ${esc(brandTagline)}
            </p>
            <div style="font-size:0.75rem;color:${theme.textSub};">
              ${isZh ? '面向全球精品酒店、建筑事务所与高端私宅的软装外贸制造基地' : 'Contract hospitality manufacturing & natural material decor atelier for global trade'}
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">${isZh ? '快捷导航' : 'Navigation'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.home)}</a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.catalog)}</a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.about)}</a>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;color:${theme.textMuted};">${esc(ui.contact)}</a>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;font-family:${isVideo ? 'sans-serif' : 'Georgia, serif'};">${isZh ? '业务联络' : 'Trade Liaison'}</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.85rem;">
              <div>${esc(company.email)}</div>
              ${company.phone ? `<div>${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div>${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;">
          <div>© ${new Date().getUTCFullYear()} ${esc(brandName)}. All rights reserved.</div>
          <div>${isZh ? '国际家居软装外贸出口标准 · FSC认证 · 0-VOC环保' : 'Export Compliant · FSC Certified · Zero-VOC Eco Standards'}</div>
        </div>
      </div>
    </footer>
  `;

  return `
    <div class="decor-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
