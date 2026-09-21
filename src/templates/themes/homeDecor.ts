import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

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
    desc: 'Heavy-textured artisanal textile woven on vintage wooden shuttle looms from unbleached wild hemp and French flax, filled with natural down alternative.',
    badge: 'Organic Hemp-Linen',
    category: 'textile',
    categoryNameZh: '粗织野生剑麻亚麻拼色手工沙发靠枕',
    categoryNameEn: 'Artisanal Textiles',
    materialTextureSpec: '55% Wild Hemp + 45% Normandy Flax Linen (380 GSM)',
    dimensionsOriginSpec: '50 × 50 cm · Brass Concealed Zipper',
    finishCraftDetail: 'Garment stone-washed with natural vegetable dye accents',
    moq: '80 Pcs Batch',
    tagline: 'Earthy Tactile Warmth Rooted in Ancient Weaving',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'dec-7',
    name: 'Solid Cast Bronze Tree-Bark Sculptural Candleholder',
    desc: 'Heavy cast bronze candelabra cast using the lost-wax technique from real ancient olive tree bark textures, finished with hand-rubbed antique liver patina.',
    badge: 'Lost-Wax Bronze',
    category: 'metal',
    categoryNameZh: '失蜡铸铜老树皮肌理复古雕塑烛台',
    categoryNameEn: 'Sculptural Metalware',
    materialTextureSpec: 'Solid Architectural Bronze (88% Copper, 12% Tin)',
    dimensionsOriginSpec: '16 × 16 × 28 cm · 2.9 kg Solid Weight',
    finishCraftDetail: 'Hand-torched sulfur liver patina with beeswax preservation',
    moq: '40 Pcs Order',
    tagline: 'Primeval Bronze Embers Sheltering Living Flame',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'dec-8',
    name: 'Matte Ceramic Ultrasonic Diffuser & Volcanic Lava Stone',
    desc: 'Dual-purpose aromatherapy device combining whisper-quiet ultrasonic atomization with a hand-glazed ceramic dome and natural porous volcanic basalt diffuser ring.',
    badge: 'Sensory Living',
    category: 'diffuser',
    categoryNameZh: '哑光陶瓷超声波火山石香薰氛围机',
    categoryNameEn: 'Sensory Aromatherapy',
    materialTextureSpec: 'Matte Unglazed Porcelain Dome + Natural Volcanic Basalt',
    dimensionsOriginSpec: 'Ø 12.5 × H 18 cm · 180ml Water Capacity',
    finishCraftDetail: 'Whisper-quiet ultrasonic transducer (<20dB) + warm LED glow ring',
    moq: '120 Pcs Run',
    tagline: 'Aromatic Botanical Sanctuaries in Modern Living Spaces',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function getDecorProducts(ctx: ThemeContext): ThemedDecorItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Home Decor Item ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'homedecor',
      categoryNameZh: '家居装饰与美学陈设',
      categoryNameEn: 'Home Decor & Objects',
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
        badge: idx === 0 ? (isZh ? '美学艺术主推' : 'Artisanal Spotlight') : (isZh ? '陈设臻品' : 'Decor Choice'),
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

  // 100% LIGHT PALETTES FOR BOTH VARIANTS:
  // Banner: Mediterranean Linen & Terracotta Ochre
  // Video: Japandi Light Sage Mist & Nordic Amber Oak
  const theme = isVideo
    ? {
        bg: '#f9fafb',
        cardBg: '#ffffff',
        cardBorder: 'rgba(217, 119, 6, 0.12)',
        primary: '#d97706',
        primaryHover: '#b45309',
        text: '#111827',
        textMuted: '#4b5563',
        textSub: '#6b7280',
        glassBg: 'rgba(255, 255, 255, 0.88)',
        glassBorder: 'rgba(255, 255, 255, 0.95)',
        pillBg: '#fef3c7',
        pillText: '#b45309',
        btnGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        accentGlow: 'rgba(217, 119, 6, 0.16)',
        tagBadge: 'Japandi Living Lab',
      }
    : {
        bg: '#fbf9f5',
        cardBg: '#ffffff',
        cardBorder: 'rgba(180, 83, 9, 0.14)',
        primary: '#b45309',
        primaryHover: '#92400e',
        text: '#292524',
        textMuted: '#78716c',
        textSub: '#a8a29e',
        glassBg: 'rgba(255, 255, 255, 0.88)',
        glassBorder: 'rgba(255, 255, 255, 0.95)',
        pillBg: '#fdf3e7',
        pillText: '#b45309',
        btnGradient: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
        accentGlow: 'rgba(180, 83, 9, 0.16)',
        tagBadge: 'Mediterranean Ceramic Studio',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  // Header with Apple Liquid Glass
  const headerHtml = `
    <header class="decor-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div class="wrap" style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          ${ctx.brandLogo ? `<img src="${esc(ctx.brandLogo)}" alt="${esc(company.name)}" style="height:38px;width:auto;object-fit:contain;">` : ''}
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:1.25rem;font-weight:900;letter-spacing:-0.02em;color:${theme.text};font-family:serif;">
              ${esc(company.name || (isVideo ? 'Nordic Ambient Atelier' : 'Tuscan Ceramic Guild'))}
            </span>
            <span style="font-size:0.68rem;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};font-weight:700;">
              ${isVideo ? 'Biophilic Lighting & Minimal Objects' : 'Handcrafted Ceramics & Travertine'}
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
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 20px;border-radius:9999px;background:${theme.btnGradient};color:#ffffff;font-size:0.86rem;font-weight:700;box-shadow:0 4px 14px ${theme.accentGlow};">
            ${isZh ? '设计师打样 / 合作' : 'Trade Account Inquiry'} ↗
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
              ${esc(company.name || (isVideo ? 'Nordic Ambient Atelier' : 'Tuscan Ceramic Guild'))}
            </div>
            <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.7;max-width:340px;margin:0 0 16px;">
              ${esc(company.description || (isVideo ? 'Curating Japandi sensory living, circadian lighting, and bio-acoustic home objects for boutique hotels and modern interiors.' : 'Artisanal high-fire ceramic vessels, hand-carved travertine sculptures, and organic textiles crafted with earthy wabi-sabi aesthetics.'))}
            </p>
            <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:700;">
              ✓ ${isZh ? '环保零 VOC · FSC 可持续林木认证' : 'Zero-VOC Certified · FSC Certified Sustainable'}
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '美学分类' : 'Categories'}</div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;color:${theme.textMuted};">
              <span>${isZh ? '高温艺术陶罐' : 'Stoneware Ceramics'}</span>
              <span>${isZh ? '漫反射和纸灯具' : 'Ambient Paper Lights'}</span>
              <span>${isZh ? '天然罗马洞石' : 'Travertine Sculptures'}</span>
              <span>${isZh ? '美利奴吸音挂饰' : 'Acoustic Wool Art'}</span>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${esc(ui.contact)}</div>
            <div style="font-size:0.86rem;color:${theme.textMuted};line-height:1.7;">
              <div><strong>Studio Email:</strong> <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;">${esc(company.email)}</a></div>
              ${company.phone ? `<div><strong>Phone:</strong> ${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div style="margin-top:8px;">${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="padding-top:24px;border-top:1px solid #eef2f6;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:${theme.textSub};">
          <div>© ${new Date().getFullYear()} ${esc(company.name)}. ${esc(ui.rights)}.</div>
          <div>${isZh ? '国际室内空间设计协会合作供应商 · LEED 绿色建筑认证' : 'Global Interior Designer Supply Network · LEED Compliant'}</div>
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
      // TEMPLATE 6: homedecor-living-video (Japandi Ambient Living Video)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="decor-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Japandi Living Video Showcase with Light Frosted Glass -->
          <section style="position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;padding:80px 0;">
            <video id="hero-video" autoplay muted loop playsinline poster="${esc(posterAsset)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.75;filter:brightness(0.95) saturate(1.05);z-index:1;" aria-hidden="true">
              ${videoAsset ? `<source src="${esc(videoAsset)}">` : `<source src="https://assets.mixkit.co/videos/preview/mixkit-sun-streaming-through-linen-curtains-in-a-minimalist-living-room-42618-large.mp4" type="video/mp4">`}
            </video>
            <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(249,250,251,0.93) 0%, rgba(249,250,251,0.72) 50%, rgba(249,250,251,0.4) 100%);z-index:2;"></div>

            <div class="wrap" style="position:relative;z-index:3;width:100%;padding:0 24px;">
              <div style="max-width:680px;background:${theme.glassBg};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${theme.glassBorder};border-radius:24px;padding:48px;box-shadow:0 20px 50px -10px rgba(217,119,6,0.12);">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.primary};animation:wrPulse 2s infinite;"></span>
                  ${isZh ? '北欧与日式侘寂感官家居研制室' : 'Japandi Sensory Living Studio'}
                </div>

                <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;line-height:1.15;color:${theme.text};margin:0 0 16px;letter-spacing:-0.02em;font-family:serif;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '光影疗愈 · 北欧与日式侘寂环境光与感官陈设' : 'Harmonic Ambience: Japandi Light & Sensory Living'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '融合天然桑皮和纸漫射柔光、美利奴羊毛吸音艺术与天然实木榫卯，为精品度假酒店、私宅设计与跨国软装项目提供温润克制的生活陈设全案。' : 'Balancing diffused circadian washi lighting, acoustic wool absorption, and raw timber joinery for boutique hospitality and refined residential projects.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:32px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:12px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '浏览空间陈设选集 ↗' : 'Explore Collections ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:12px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '索取工程软装样册' : 'Request Interior Catalog'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid #e5e7eb;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">2700 K</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '节律漫射温润色温' : 'Warm Circadian Lumens'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">0.65 NRC</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '美利奴降噪系数' : 'Acoustic Sound Absorption'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">Zero-VOC</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '纯天然植物木蜡油' : 'Non-Toxic Plant Finishes'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Sensory Living Framework Grid -->
          <section class="wrap" style="padding:70px 24px;">
            <div style="text-align:center;max-width:700px;margin:0 auto 50px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">THE SENSORY ARCHITECTURE</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 14px;font-family:serif;">
                ${isZh ? '构建宁静避难所的三重感官秩序' : 'Three Pillars of Calm Architectural Living'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '从视觉的柔和漫反射，到听觉的吸音降噪，再到触觉的粗砺肌理，让居住回归本真。' : 'Harmonizing visual diffuse lighting, acoustic serenity, and tactile natural textures.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">01</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '日式和纸昼夜节律调光' : 'Circadian Washi Diffusion'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '天然桑皮纸纤维随机交织，有效过滤刺目蓝光眩光，形成如晨雾般的柔和漫射光晕，安抚下丘脑神经。' : 'Hand-pressed mulberry fibers scatter glare into a soothing morning mist illumination, promoting circadian rest.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '无级触控调光 · 2200K至4000K' : 'Stepless Dimming 2200K - 4000K'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">02</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '美利奴生物吸音羊毛格栅' : 'Bio-Wool Acoustic Resonance'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '高密度纯羊毛毡结合实木立体曲面，吸收中高频人声残响达65%以上，营造私人图书馆般的幽静沉浸空间。' : 'High-density pure wool felt absorbs over 65% of human speech flutter echo, creating sanctuary silence.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '天然抗污阻燃 · 净化室内甲醛' : 'Naturally Flame Retardant & VOC Purifying'}</div>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);" class="wr-card-hover">
                <div style="width:48px;height:48px;border-radius:12px;background:${theme.pillBg};color:${theme.primary};display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:20px;font-family:serif;">03</div>
                <h3 style="font-size:1.2rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '罗马天然原生多孔洞石' : 'Raw Roman Travertine Stone'}</h3>
                <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;">
                  ${isZh ? '保留温泉地热矿泉沉积形成的天然孔隙与粗犷岩层纹理，不填胶不抛光，传递大自然地质纪元的厚重温度。' : 'Unfilled natural stone cavities shaped by ancient mineral hot springs, grounding spatial interiors in geological history.'}
                </p>
                <div style="font-size:0.8rem;font-weight:700;color:${theme.primary};">${isZh ? '哑光亚光防渗透保护涂层' : 'Matte Breathable Hydrophobic Seal'}</div>
              </div>
            </div>
          </section>

          <!-- 3. Ambient Living Showcase Grid -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">SPACE CURATION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;font-family:serif;">
                  ${isZh ? '侘寂感官家居陈设选集' : 'Curated Living Objects'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全系 8 款陈设 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedDecorItem).materialTextureSpec ? (item as ThemedDecorItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(217,119,6,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f3f4f6;">
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
                      <div style="padding:10px 12px;background:#f9fafb;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '材质/工艺' : 'Material'}:</strong> ${esc(meta.materialTextureSpec)}
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
      // TEMPLATE 5: homedecor-aesthetic-banner (Mediterranean Ceramic Banner)
      // -------------------------------------------------------------
      mainHtml = `
        <main class="decor-main" style="background:${theme.bg};color:${theme.text};">
          <!-- 1. Mediterranean Ceramic Atelier Hero Showcase -->
          <section class="wrap" style="padding:60px 24px 80px;">
            <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                  ✦ ${isZh ? '地中海手工拉胚陶艺与天然洞石工坊' : 'Mediterranean Ceramic Atelier & Travertine Studio'}
                </div>

                <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.4rem);font-weight:900;line-height:1.12;color:${theme.text};margin:0 0 18px;font-family:serif;letter-spacing:-0.02em;">
                  ${esc(draft.copy[ctx.lang]?.headline || (isZh ? '大地造物 · 1300°C 高温粗陶与质朴空间雕塑陈设' : 'Earth & Flame: Artisanal Stoneware & Sculptural Objects'))}
                </h1>

                <p style="font-size:1.05rem;line-height:1.7;color:${theme.textMuted};margin:0 0 32px;">
                  ${esc(draft.copy[ctx.lang]?.subtitle || (isZh ? '采撷地中海古老原矿黏土，历经脚踏轮盘慢速拉胚与1300°C柴窑高温淬火。不追求工业流水线的绝对平滑，让火痕、矿物斑点与陶土手温凝固为静谧的空间诗篇。' : 'Formed from natural mineral-rich clays on traditional kick wheels and high-fired at 1300°C. Celebrating organic wabi-sabi textures and unrefined travertine silhouettes.'))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索陶艺与雕塑系列' : 'Explore Ceramic Works'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:8px;background:#ffffff;color:${theme.primary};border:1px solid ${theme.cardBorder};font-size:0.95rem;font-weight:800;">
                    ${isZh ? '索取工坊泥样与色卡' : 'Request Clay & Glaze Swatches'}
                  </a>
                </div>

                <div style="display:flex;gap:32px;padding-top:24px;border-top:1px solid #ede5dc;">
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">1300 °C</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '高温炻器结晶烧结' : 'High-Fire Vitrification'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">100% Earth</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '天然矿物氧化物调色' : 'Natural Mineral Oxides'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;">Wabi-Sabi</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '每件器物皆孤品' : 'One-of-a-Kind Organic Forms'}</div>
                  </div>
                </div>
              </div>

              <!-- Hero Showcase Image -->
              <div style="position:relative;" class="wr-card-hover">
                <div style="position:relative;border-radius:24px;overflow:hidden;box-shadow:0 25px 60px -15px rgba(180,83,9,0.18);border:1px solid ${theme.cardBorder};background:#f7f4ee;">
                  <img src="${esc(heroImg)}" alt="${esc(heroProduct.name)}" style="width:100%;height:520px;object-fit:cover;display:block;">
                </div>
                <div style="position:absolute;bottom:24px;left:24px;right:24px;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ${theme.glassBorder};border-radius:14px;padding:18px 22px;box-shadow:0 12px 30px rgba(0,0,0,0.06);">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;">${esc(defaultMeta.badge)}</div>
                      <div style="font-size:1.05rem;font-weight:900;color:${theme.text};margin-top:2px;font-family:serif;">${esc(heroProduct.name)}</div>
                    </div>
                    <a href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)} style="text-decoration:none;padding:7px 16px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.8rem;font-weight:700;">
                      ${isZh ? '查看器形' : 'Inspect'} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Three Artisanal Kiln & Glaze Stages -->
          <section class="wrap" style="padding:60px 24px 70px;">
            <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
              <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:${theme.primary};text-transform:uppercase;">THE CLAY EVOLUTION</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);font-weight:900;color:${theme.text};margin:8px 0 12px;font-family:serif;">
                ${isZh ? '天然原矿陶土的三重蜕变过程' : 'Three Stages of Ceramic Alchemy'}
              </h2>
              <p style="font-size:0.95rem;color:${theme.textMuted};line-height:1.6;">
                ${isZh ? '从深山地层中采掘的原泥，历经水簸陈腐与柴窑烈火的洗礼，最终化为温润素雅的恒久器皿。' : 'From subterranean riverbeds to 1300°C wood-fired kiln transformations.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">STAGE 01 / FORM</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '陈腐原泥与指尖慢速拉胚' : 'Wheel-Thrown Raw Earthenware'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '陈腐达六个月的颗粒陶土具有极佳的塑性，陶艺师通过指腹的轻微施压，留下一道道富含生命律动的螺旋手痕。' : 'Aged clay shaped on kick wheels, capturing the rhythmic tactile spirals of the artisan hands.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">STAGE 02 / GLAZE</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '草木灰与天然铁矿洗染' : 'Plant Ash & Iron Oxide Wash'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '浸入用松木草木灰与天然赭石研磨而成的无毒矿物釉，在坯体表面形成斑驳深浅的大地色系渐变。' : 'Dipped into pine ash and raw ochre washes creating organic gradations reminiscent of coastal cliffs.'}
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                <div style="font-size:1.3rem;font-weight:900;color:${theme.primary};margin-bottom:12px;font-family:serif;">STAGE 03 / FIRE</div>
                <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '1300°C 柴窑结晶完全玻化' : '1300°C High-Fire Vitrification'}</h3>
                <p style="font-size:0.86rem;line-height:1.65;color:${theme.textMuted};margin:0;">
                  ${isZh ? '经长达72小时的窑火淬炼，胎体致密坚硬如石，吸水率低于0.5%，具备卓越的耐用度与传世质感。' : 'Fired continuously for 72 hours, achieving <0.5% water absorption and stone-like structural longevity.'}
                </p>
              </div>
            </div>
          </section>

          <!-- 3. Ceramic Goods Catalog Showcase -->
          <section class="wrap" style="padding:20px 24px 80px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;">
              <div>
                <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;color:${theme.primary};text-transform:uppercase;">THE COLLECTION</span>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:6px 0 0;font-family:serif;">
                  ${isZh ? '地中海工坊陶艺陈设系列' : 'Artisanal Ceramic & Object Fleet'}
                </h2>
              </div>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.primary};text-decoration:none;font-weight:800;font-size:0.95rem;">
                ${isZh ? '浏览全部 8 款手作 ↗' : 'View Full Catalog ↗'}
              </a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:26px;">
              ${products.slice(0, 4).map((item) => {
                const meta = (item as ThemedDecorItem).materialTextureSpec ? (item as ThemedDecorItem) : defaultMeta;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || defaultMeta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(180,83,9,0.06);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f7f4ee;">
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
                      <div style="padding:10px 12px;background:#faf7f2;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                        <strong>${isZh ? '材质规格' : 'Material'}:</strong> ${esc(meta.materialTextureSpec)}
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
    // CATALOG PAGE: Clean High-Contrast Light Grid
    // -------------------------------------------------------------
    mainHtml = `
      <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${esc(company.name || (isVideo ? 'Nordic Ambient Atelier' : 'Tuscan Ceramic Guild'))}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:serif;">
              ${esc(ui.catalog)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? (isVideo ? '浏览日式侘寂漫反射纸灯、美利奴吸音羊毛格栅、天然洞石与香薰美学陈设，专为高品质酒店与室内设计工作室提供批量采购。' : '探索地中海粗陶花器、罗马天然洞石书挡、吹制琥珀玻璃与手工亚麻靠枕，支持设计师专属定制与釉色调整。') : (isVideo ? 'Explore our Japandi sensory home collection featuring circadian washi lighting, acoustic panels, and natural stone.' : 'Browse our artisanal ceramic and travertine collection hand-crafted for interior architects and hospitality projects.')}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
            ${products.map((item, idx) => {
              const meta = (item as ThemedDecorItem).materialTextureSpec ? (item as ThemedDecorItem) : DECOR_DEFAULT_PRODUCTS[idx % DECOR_DEFAULT_PRODUCTS.length]!;
              const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
              return `
                <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.04);" class="wr-card-hover">
                  <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:${isVideo ? '#f3f4f6' : '#f7f4ee'};">
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
                    <div style="background:${isVideo ? '#f9fafb' : '#faf7f2'};padding:10px 12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;">
                      <div><strong>${isZh ? '材质构造' : 'Material'}:</strong> ${esc(meta.materialTextureSpec)}</div>
                      <div style="margin-top:4px;"><strong>${isZh ? '尺寸产地' : 'Dimensions'}:</strong> ${esc(meta.dimensionsOriginSpec)}</div>
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
    const meta = (selectedProduct as unknown as ThemedDecorItem).materialTextureSpec ? (selectedProduct as unknown as ThemedDecorItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;

    mainHtml = `
      <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
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
                ${esc(meta.badge || (isVideo ? 'Circadian Ambient' : 'Artisanal High-Fire'))}
              </div>

              <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:serif;">
                ${esc(selectedProduct.name)}
              </h1>

              <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                ${esc((selectedProduct as any).desc || selectedProduct.description || defaultMeta.desc)}
              </p>

              <!-- Technical / Artisanal Specifications Grid -->
              <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                  ${isZh ? '材质工艺与空间陈设技术参数' : 'Material Craft & Spatial Specifications'}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.85rem;">
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '核心材质肌理' : 'Material & Texture'}</span>
                    <strong style="color:${theme.text};">${esc(meta.materialTextureSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '尺寸与设计原产' : 'Dimensions & Provenance'}</span>
                    <strong style="color:${theme.text};">${esc(meta.dimensionsOriginSpec)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '表面涂装/环保标准' : 'Finishing & Eco Standard'}</span>
                    <strong style="color:${theme.text};">${esc(meta.finishCraftDetail)}</strong>
                  </div>
                  <div>
                    <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '项目起订量 / 交付' : 'MOQ & Production Lead Time'}</span>
                    <strong style="color:${theme.primary};">${esc(meta.moq)}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:16px;">
                <a href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(selectedProduct.id))}" ${navAttrs('contact', selectedProduct.id)} style="text-decoration:none;padding:15px 32px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};flex:1;text-align:center;">
                  ${isZh ? '发起工程采购索样 / 询价' : 'Inquire for B2B Project Order'} ↗
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
    // ABOUT PAGE: High-Contrast Atelier Story
    // -------------------------------------------------------------
    const headline = getAboutHeadline(company, company.name);
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const aboutImg = ctx.asset(company.aboutImageAssetId) || (products[1] ? (products[1] as any).img : defaultMeta.img);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '25+ Yrs', num: 25, suffix: '+ Yrs', label: isZh ? '陶艺与空间工坊历史' : 'Studio Craft History', desc: isZh ? '深厚传统窑炉与原石切削底蕴' : 'Decades of kiln firing & stone masonry' },
      { value: '450+ Hotels', num: 450, suffix: '+ Hotels', label: isZh ? '全球精品酒店合作' : 'Boutique Projects Furnished', desc: isZh ? '涵盖欧洲度假村与现代艺术画廊' : 'Featured in premier resort spaces' },
      { value: '100% Eco', num: 100, suffix: '%', label: isZh ? '天然无毒环保选材' : 'Non-Toxic Certified', desc: isZh ? '零VOC植物性木蜡油与矿物釉' : 'Zero-VOC finishes and natural clays' },
      { value: '1300 °C', num: 1300, suffix: ' °C', label: isZh ? '高温完全玻化炻器' : 'Max Kiln Temperature', desc: isZh ? '卓越抗裂与低吸水率保证' : 'Complete vitrification & durability' },
    ]);

    mainHtml = `
      <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:50px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '工坊起源与自然主义设计哲学' : 'STUDIO ORIGIN & NATURAL PHILOSOPHY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:serif;">
              ${esc(headline)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:720px;">
              ${esc(company.slogan || (isVideo ? '以宁静的光影与声学质感，为嘈杂都市生活构筑内心的安宁角落。' : '坚守自然泥土与矿石的质朴纹理，让生活器物在岁月中温润沉淀。'))}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};">
                ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                  <p style="margin:0 0 18px;">
                    ${isZh ? '我们创立于地中海沿岸与北欧设计交汇的艺术街区，工坊汇聚了经验丰富的柴窑陶艺师、石材石雕手艺人与现代照明工程师。' : 'Founded at the intersection of Mediterranean artisanal tradition and Nordic functional minimalism, uniting master potters, stone carvers, and lighting engineers.'}
                  </p>
                  <p style="margin:0 0 18px;">
                    ${isZh ? '每一件作品均从矿山黏土、天然原木和矿石中获取灵感，我们坚持慢速手工打磨与严苛的环境无害化标准，致力于为全球室内建筑师提供兼具美学价值与工程耐久度的陈设精品。' : 'Every object honors raw clays, organic timbers, and volcanic basalt. Our commitment to slow craftsmanship and sustainable manufacturing guarantees spatial harmony.'}
                  </p>
                `}
              </div>
              <div style="margin-top:28px;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};">
                  ${isZh ? '洽谈酒店工程 / 设计师合作' : 'Discuss Hospitality Project'} ↗
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
    // CONTACT PAGE: Direct Trade Account & Custom Consultation Form
    // -------------------------------------------------------------
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="decor-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '设计师专属采购与定制洽谈' : 'TRADE INQUIRY & HOSPITALITY SOURCING'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:serif;">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请提交您的项目采购清单或专属器型定制要求，工坊设计顾问将在 24 小时内与您接洽，并提供材质小样邮寄及大宗批发阶梯报价。' : 'Submit your project schedule or custom specification. Our spatial design team will respond within 24 hours with complete material samples and trade pricing.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <!-- Contact Card Details -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;font-family:serif;">
                ${esc(company.name || (isVideo ? 'Nordic Ambient Atelier' : 'Tuscan Ceramic Guild'))}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(company.description || (isZh ? '专注高端空间美学陈设与酒店软装直供，支持OEM/ODM全球海运及空运直发。' : 'Direct atelier supplying hospitality and trade interior projects with global logistics.'))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Studio Trade Email</span>
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
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Studio Workshop</span>
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
                    <option value="">${isZh ? '— 选择意向陈设型号 —' : '— Select Decor Model —'}</option>
                    ${products.map((p) => `<option value="${esc(p.id)}"${p.id === ctx.options.productId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}
                  </select>
                </div>

                <div style="grid-column:span 2;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:0.82rem;font-weight:800;color:${theme.text};">${esc(ui.message)} *</label>
                  <textarea name="message" required maxlength="5000" rows="5" placeholder="${isZh ? '请描述您的项目规模、意向材质泥样要求、预计交付时间等...' : 'Describe your project scale, custom glaze/material requirements, target completion date...'}" style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;background:#ffffff;color:${theme.text};outline:none;resize:vertical;"></textarea>
                </div>

                <div style="display:none;" aria-hidden="true">
                  <input name="website" tabindex="-1" autocomplete="off">
                </div>

                <div style="grid-column:span 2;display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                  <button type="submit" ${ctx.options.preview ? 'disabled' : ''} style="padding:14px 34px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;border:none;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 4px 16px ${theme.accentGlow};">
                    ${esc(ui.send)} ↗
                  </button>
                  <span style="font-size:0.78rem;color:${theme.textSub};">${isZh ? '设计师专人一对一服务 · 24小时内响应' : 'Direct Designer Support · 24h Response'}</span>
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
