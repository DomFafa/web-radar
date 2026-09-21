import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, parseAboutHighlights } from './aboutHelper';

export interface ThemedFurnitureItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  timberHardwareSpec: string;
  dimensionsLoadSpec: string;
  joineryMechanismDetail: string;
  moq: string;
  tagline: string;
  img: string;
}

export const FURNITURE_DEFAULT_PRODUCTS: ThemedFurnitureItem[] = [
  {
    id: 'fur-1',
    name: 'Solid North American Black Walnut Bauhaus Lounge Chair',
    desc: 'Architectural lounge armchair crafted from 100% FAS grade American walnut with interlocking mortise and tenon joinery, upholstered in full-grain vegetable-tanned saddle leather.',
    badge: 'Bauhaus Heritage',
    category: 'chair',
    categoryNameZh: '北美FAS黑胡桃木包豪斯手工榫卯休闲椅',
    categoryNameEn: 'Architectural Chairs',
    timberHardwareSpec: '100% Solid FAS American Black Walnut + Full-Grain Saddle Leather',
    dimensionsLoadSpec: 'W 78 × D 82 × H 74 cm · 220 kg Static Load Tested',
    joineryMechanismDetail: 'Traditional interlocking mortise & tenon with concealed hardwood dowels',
    moq: '20 Pcs per Run',
    tagline: 'Pure Structural Honesty Without a Single Exposed Screw',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'fur-2',
    name: 'Pneumatic Transforming Wall-Bed & Integrated Workstation',
    desc: 'Space-optimizing dual-function system featuring German gas-piston balancing struts that transforms from a 2-meter executive desk to a queen-size bed in 3 seconds.',
    badge: 'Space Transformer',
    category: 'transforming',
    categoryNameZh: '德国气压助推隐形折叠壁床多功能工作台',
    categoryNameEn: 'Smart Transforming Beds',
    timberHardwareSpec: 'E0 Baltic Birch Plywood + German Suspa® 1200N Gas Pistons',
    dimensionsLoadSpec: 'Desk: 205 × 60 cm · Bed: 200 × 150 cm Queen · 400 kg Rating',
    joineryMechanismDetail: 'Counterbalanced pneumatic scissor mechanism tested to 50,000 cycles',
    moq: '15 Units Batch',
    tagline: 'Yielding +45% Usable Living Floor Area in Urban Condos',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'fur-3',
    name: 'Modular Floating Media Credenza & Sliding Storage Unit',
    desc: 'Wall-hung modular architectural storage with acoustic slatted tambour sliding doors, concealed cable management channels, and Blum soft-close suspension brackets.',
    badge: 'Modular Floating',
    category: 'storage',
    categoryNameZh: '悬浮模块化实木格栅电视柜隐藏收纳系统',
    categoryNameEn: 'Modular Storage Systems',
    timberHardwareSpec: 'Rift-Cut Natural White Oak + Powder-Coated Aluminum Rails',
    dimensionsLoadSpec: 'W 240 × D 42 × H 38 cm · 120 kg Distributed Load',
    joineryMechanismDetail: 'French cleat heavy-duty wall mounting with micro-leveling adjustments',
    moq: '25 Units Order',
    tagline: 'Zero-Footprint Visual Levitation for Modern Living Rooms',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'fur-4',
    name: 'Solid White Oak Expandable Butterfly Leaf Dining Table',
    desc: 'Monolithic solid white oak dining table with patented internal gear-synchronized expanding butterfly mechanism that extends from 6 to 12 seats smoothly.',
    badge: 'Butterfly Extension',
    category: 'table',
    categoryNameZh: '北美白橡木内置齿轮联动伸缩折叠大餐桌',
    categoryNameEn: 'Extendable Dining Tables',
    timberHardwareSpec: 'FAS Appalachian White Oak + German Steel Ball-Bearing Slides',
    dimensionsLoadSpec: '180 cm to 260 cm Extended × W 95 × H 76 cm · 82 kg',
    joineryMechanismDetail: 'Precision cogwheel cable synchronization for effortless single-person pull',
    moq: '20 Pcs Run',
    tagline: 'Seamlessly Adapting from Intimate Dinners to Grand Banquets',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'fur-5',
    name: 'Architectural Minimalist Sideboard with Push-Latch Drawers',
    desc: 'Clean-lined sideboard featuring 45-degree mitered cabinet edges, solid walnut drawer boxes with English dovetail joinery, and Blum Movento undermount runners.',
    badge: 'Mitered Minimalism',
    category: 'sideboard',
    categoryNameZh: '45度斜边斜切实木收纳餐边柜斗柜',
    categoryNameEn: 'Architectural Sideboards',
    timberHardwareSpec: 'FAS American Walnut Veneer over High-Density E0 Core',
    dimensionsLoadSpec: 'W 180 × D 48 × H 78 cm · 4 Soft-Close Dovetail Drawers',
    joineryMechanismDetail: 'Continuous grain wrapping across all drawer fronts and seamless miter joints',
    moq: '30 Pcs Order',
    tagline: 'Unbroken Continuous Grain Across Every Architectural Surface',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'fur-6',
    name: 'Modular Sectional Sofa with Hydraulic Storage Underchassis',
    desc: 'Multi-configuration deep seating sofa with high-resilience foam core, breathable linen upholstery, and hydraulic easy-lift storage underneath all chaise modules.',
    badge: 'Hidden Storage Sofa',
    category: 'sofa',
    categoryNameZh: '全拆洗液压储物模块化大深度羽绒沙发',
    categoryNameEn: 'Modular Storage Sofas',
    timberHardwareSpec: 'Kiln-Dried Larch Hardwood Frame + High-Density Resilience Foam',
    dimensionsLoadSpec: '310 × 175 × 82 cm · 320L Internal Storage Capacity',
    joineryMechanismDetail: 'Interlocking invisible steel alligator connectors with gas-assisted chaise lift',
    moq: '15 Sets Production',
    tagline: 'De-Cluttering Living Spaces with Invisible Volumetric Vaults',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'fur-7',
    name: 'Cantilever Tubular Steel & Saddle Leather Dining Armchair',
    desc: 'Iconic cantilever tubular steel frame armchair offering gentle ergonomic bounce, paired with thick cognac saddle leather sling seat and walnut armrest pads.',
    badge: 'Cantilever Icon',
    category: 'chair',
    categoryNameZh: '包豪斯悬臂钢管马鞍皮人体工学餐椅',
    categoryNameEn: 'Cantilever Armchairs',
    timberHardwareSpec: 'Seamless 25mm Cold-Drawn Chromed Steel Tube + 3.5mm Bridle Leather',
    dimensionsLoadSpec: 'W 58 × D 59 × H 81 cm · 180 kg Fatigue Tested',
    joineryMechanismDetail: 'Precision mandrel CNC bending with zero weld seams on main curve',
    moq: '40 Pcs Order',
    tagline: 'Defying Mass with Floating Elastic Structural Suspension',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'fur-8',
    name: 'Hydraulic Lift-Top Coffee Table with Concealed Workstation',
    desc: 'Multi-functional living room coffee table with dual bi-directional hydraulic lifting leaves that raise to standard desk height while revealing deep storage trays.',
    badge: 'Lift-Top Workstation',
    category: 'table',
    categoryNameZh: '双向液压升降茶几带隐藏式居家办公桌面',
    categoryNameEn: 'Lift-Top Coffee Tables',
    timberHardwareSpec: 'FAS Natural White Oak + Heavy-Duty Damped Gas Struts',
    dimensionsLoadSpec: '120 × 70 × 42 cm (Lifts to 65 cm Ergonomic Height)',
    joineryMechanismDetail: 'Smooth pneumatic anti-pinch scissor linkage with soft-closing dampers',
    moq: '50 Pcs Run',
    tagline: 'Transforming Lounge Space into Productive Home Office in Seconds',
    img: '/templates/senseng/products-8.jpg',
  },
];

function sanitizeCopy(text: string | undefined, fallbackEn: string, fallbackZh: string, isZh: boolean): string {
  if (!text || !text.trim()) return isZh ? fallbackZh : fallbackEn;
  if (!isZh && /[\u4e00-\u9fa5]/.test(text)) return fallbackEn;
  return text;
}

export function getFurnitureProducts(ctx: ThemeContext): ThemedFurnitureItem[] {
  const { draft, translateProduct } = ctx;
  if (isTypedMaterialsSource(draft)) {
    return draft.products.map((p, idx) => ({
      id: p.id,
      name: translateProduct(p).name || `Furniture Piece ${idx + 1}`,
      desc: translateProduct(p).description || '',
      badge: '',
      category: 'furniture',
      categoryNameZh: '家具与空间收纳',
      categoryNameEn: 'Furniture & Storage',
      timberHardwareSpec: p.material || '',
      dimensionsLoadSpec: p.dimensions || '',
      joineryMechanismDetail: '',
      moq: '',
      tagline: p.tagline || '',
      img: ctx.productMainImage(p),
    }));
  }
  const isZh = (ctx.lang as string) === 'zh';
  if (draft.products && draft.products.length > 0) {
    return draft.products.map((p, idx) => {
      const fallback = FURNITURE_DEFAULT_PRODUCTS[idx % FURNITURE_DEFAULT_PRODUCTS.length]!;
      const translated = ctx.translateProduct(p);
      const mainImg = ctx.productMainImage(p) || fallback.img;
      return {
        id: p.id,
        name: translated.name || fallback.name,
        desc: translated.description || fallback.desc,
        badge: idx === 0 ? (isZh ? '包豪斯典藏' : 'Bauhaus Master') : (isZh ? '空间优选' : 'Spatial Choice'),
        category: fallback.category,
        categoryNameZh: fallback.categoryNameZh,
        categoryNameEn: fallback.categoryNameEn,
        timberHardwareSpec: p.material || fallback.timberHardwareSpec,
        dimensionsLoadSpec: p.dimensions || fallback.dimensionsLoadSpec,
        joineryMechanismDetail: fallback.joineryMechanismDetail,
        moq: fallback.moq,
        tagline: p.tagline || fallback.tagline,
        img: mainImg,
      };
    });
  }
  return FURNITURE_DEFAULT_PRODUCTS;
}

export function renderFurnitureStorageTemplate(ctx: ThemeContext, isVideo: boolean): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const page = ctx.page;
  const products = getFurnitureProducts(ctx);
  const heroProduct = products[0]!;
  const defaultMeta = FURNITURE_DEFAULT_PRODUCTS[0]!;

  const brandName = sanitizeCopy(
    company.name,
    isVideo ? 'Spatial Kinetic Lab' : 'Bauhaus Woodcraft Atelier',
    isVideo ? '空间动力学工程中心' : '包豪斯实木大匠工坊',
    isZh,
  );

  const brandTagline = isVideo
    ? (isZh ? '城市微居所气压折叠与隐形家具系统' : 'Pneumatic Space Transformation & Modular Living')
    : (isZh ? '北美特级FAS黑胡桃木纯手工榫卯家具' : 'Solid FAS Hardwood & Architectural Mortise Joinery');

  const theme = isVideo
    ? {
        bg: '#f8fafc',
        cardBg: '#ffffff',
        cardBorder: 'rgba(234, 88, 12, 0.16)',
        primary: '#ea580c',
        primaryHover: '#c2410c',
        text: '#0f172a',
        textMuted: '#475569',
        textSub: '#64748b',
        glassBg: 'rgba(255, 255, 255, 0.9)',
        pillBg: '#ffedd5',
        pillText: '#c2410c',
        btnGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        accentGlow: 'rgba(234, 88, 12, 0.18)',
      }
    : {
        bg: '#faf8f5',
        cardBg: '#ffffff',
        cardBorder: 'rgba(185, 28, 28, 0.12)',
        primary: '#b91c1c',
        primaryHover: '#991b1b',
        text: '#1c1917',
        textMuted: '#57534e',
        textSub: '#78716c',
        glassBg: 'rgba(250, 248, 245, 0.92)',
        pillBg: '#fee2e2',
        pillText: '#991b1b',
        btnGradient: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
        accentGlow: 'rgba(185, 28, 28, 0.16)',
      };

  const selectedProduct = (ctx.options.productId ? draft.products.find((p) => p.id === ctx.options.productId) : null) || draft.products[0] || heroProduct;

  const headerHtml = `
    <header class="furniture-header" style="position:sticky;top:0;z-index:100;background:${theme.glassBg};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid ${theme.cardBorder};box-shadow:0 4px 20px rgba(0,0,0,0.02);">
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
            ${isZh ? '项目询价 / 方案' : 'Request B2B Quote'} ↗
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    if (isVideo) {
      // ----------------------------------------------------------------------
      // SPATIAL VIDEO: Kinetic Floorplan Yield & Mechanical Engineering Hero
      // ----------------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:80px 0 100px;border-bottom:1px solid ${theme.cardBorder};">
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 80% 20%, rgba(234, 88, 12, 0.08) 0%, transparent 60%);pointer-events:none;"></div>
            <div class="wrap" style="position:relative;padding:0 24px;display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">
                  <span style="width:8px;height:8px;border-radius:50%;background:#ea580c;animation:pulse 2s infinite;"></span>
                  ${isZh ? '高密度城市微公寓空间折叠系统' : 'Kinetic Space Transformation Lab'}
                </div>
                <h1 style="font-size:clamp(2.2rem, 4.5vw, 3.4rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Spatial Yield: Kinetic Transforming Wall-Beds & Modular Storage', '空间折叠 · 气压助推隐形壁床与模块化家具工程', isZh))}
                </h1>
                <p style="font-size:1.1rem;line-height:1.65;color:${theme.textMuted};margin:0 0 28px;max-width:620px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Unlocking +45% usable floor area through German pneumatic gas pistons and dynamic kinetic linkages. Engineered for micro-apartment developers and multi-unit projects.', '通过德国精密气压平衡活塞与隐藏式折叠联动五金，在有限面积中释放 +45% 可用活动空间。专为全球微公寓开发商、长租公寓与高端精品酒店提供批量工程定制。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:14px 30px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '探索折叠变形家具 ↗' : 'View Transforming Systems ↗'}
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 26px;border-radius:10px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '获取工程配套报价' : 'Request Developer Pricing'}
                  </a>
                </div>

                <!-- Telemetry Stats -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;padding-top:24px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">+45%</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '空间净使用面积提升' : 'Floor Space Efficiency'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">50,000</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '德国气压活塞开合测试' : 'Pneumatic Cycles Tested'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};">&lt; 3 Sec</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '书桌变大床瞬时切换' : 'Desk-to-Bed Transition'}</div>
                  </div>
                </div>
              </div>

              <!-- Kinetic Video / CAD Simulation Box -->
              <div style="position:relative;">
                <div style="position:relative;border-radius:24px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 20px 48px rgba(0,0,0,0.06);">
                  <div style="position:relative;padding-top:68%;background:#0f172a;overflow:hidden;">
                    <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85;">
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                    </video>
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <span style="font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#ea580c;background:rgba(234,88,12,0.2);padding:3px 8px;border-radius:4px;">
                          Kinetic CAD Simulation
                        </span>
                        <span style="font-size:0.75rem;font-family:monospace;color:rgba(255,255,255,0.8);">CYCLE: 48,291 / 50,000</span>
                      </div>
                      <div style="font-size:1.05rem;font-weight:800;line-height:1.3;">Desk-to-Bed Level-Sync Mechanism</div>
                      <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-top:2px;">Desktop stays strictly horizontal during deployment. Zero need to clear items.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Kinetic Engineering Features -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
                  PNEUMATIC & STRUCTURAL PRECISION
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;">
                  ${isZh ? '微公寓空间折叠的三大工程力学突破' : 'Three Structural Innovations in Spatial Engineering'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.6;">
                  ${isZh ? '告别笨重繁琐的手动搬动，以毫米级阻尼配重和自锁结构，实现丝滑单手开合与坚若磐石的承重表现。' : 'Eliminating mechanical friction through counterbalanced German gas struts and failsafe locks.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:30px;" class="wr-card-hover">
                  <div style="width:48px;height:48px;border-radius:12px;background:#ffedd5;display:flex;align-items:center;justify-content:center;color:#ea580c;font-size:1.4rem;font-weight:900;margin-bottom:18px;">01</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '德国 Suspa 1200N 双气压活塞' : 'German Suspa® 1200N Gas Struts'}</h3>
                  <p style="font-size:0.88rem;line-height:1.65;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '精密充氮双向缓冲阻尼活塞，完全平衡床架自重，即使单手轻轻一推亦能优雅升降，带防坠落紧急自锁保护。' : 'Nitrogen-charged dual pistons counterbalancing heavy bed frames for effortless single-finger lifting with anti-drop lock.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">${isZh ? '通过 50,000 次耐久疲劳老化测试' : '50,000 Fatigue Cycles Certified'}</div>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:30px;" class="wr-card-hover">
                  <div style="width:48px;height:48px;border-radius:12px;background:#ffedd5;display:flex;align-items:center;justify-content:center;color:#ea580c;font-size:1.4rem;font-weight:900;margin-bottom:18px;">02</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '水平均衡保持机构（无需清理桌面）' : 'Level-Sync Desk Mechanism'}</h3>
                  <p style="font-size:0.88rem;line-height:1.65;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '四连杆四边形机械结构使桌面在翻下过程中始终保持绝对水平，桌面水杯、笔记本电脑无需收拾即可直接下沉为床底。' : 'Four-bar linkage keeps the working desk perfectly horizontal during deployment, leaving items undisturbed.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">${isZh ? '桌面承重达 45kg · 下沉后离地 18cm' : '45kg Dynamic Working Surface Load'}</div>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:18px;padding:30px;" class="wr-card-hover">
                  <div style="width:48px;height:48px;border-radius:12px;background:#ffedd5;display:flex;align-items:center;justify-content:center;color:#ea580c;font-size:1.4rem;font-weight:900;margin-bottom:18px;">03</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;">${isZh ? '冷弯高强航空钢管骨架' : 'Cold-Drawn Structural Steel Frame'}</h3>
                  <p style="font-size:0.88rem;line-height:1.65;color:${theme.textMuted};margin:0 0 14px;">
                    ${isZh ? '全焊接高强度冷拔矩形钢管底盘，辅以桦木多层排骨条，整体静载承受高达 400kg，翻身零杂音零晃动。' : 'Cold-drawn tubular chassis with birch slat suspension supporting 400kg static weight with zero squeaking.'}
                  </p>
                  <div style="font-size:0.78rem;font-weight:700;color:${theme.primary};">${isZh ? '符合欧盟 EN 1129 壁床安全强制标准' : 'Meets EN 1129 European Safety Standard'}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Kinetic Furniture Grid -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;">
                    ENGINEERED TRANSFORMATION FLEET
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;">
                    ${isZh ? '模块化变形与空间收纳矩阵' : 'Transforming Furniture Fleet'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};">
                  ${isZh ? '浏览全系 8 款系统 ↗' : 'View Full Catalog ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedFurnitureItem).timberHardwareSpec ? (item as ThemedFurnitureItem) : FURNITURE_DEFAULT_PRODUCTS[idx % FURNITURE_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 6px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:72%;overflow:hidden;background:#f1f5f9;">
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
                        <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.6;margin:0 0 16px;flex:1;">
                          ${esc(item.desc || '')}
                        </p>
                        <div style="background:#f8fafc;padding:10px 12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;">
                          <strong>${isZh ? '材质/五金' : 'Hardware'}:</strong> ${esc(meta.timberHardwareSpec)}
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
          </section>
        </main>
      `;
    } else {
      // ----------------------------------------------------------------------
      // MINIMAL BANNER: Bauhaus Architectural Woodcraft Atelier Hero
      // ----------------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;">
          <section style="position:relative;overflow:hidden;padding:90px 0 110px;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;display:grid;grid-template-columns:1.2fr 0.8fr;gap:56px;align-items:center;">
              <div>
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;font-family:serif;">
                  ✦ ${isZh ? '包豪斯建筑学构型 · 纯实木榫卯大匠工坊' : 'Bauhaus Architectural Woodworking Atelier'}
                </div>
                <h1 style="font-size:clamp(2.4rem, 5vw, 3.8rem);font-weight:900;line-height:1.15;color:${theme.text};letter-spacing:-0.03em;margin:0 0 18px;font-family:Georgia, serif;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.headline, 'Structural Honesty: FAS Solid Walnut & Architectural Mortise Joinery', '结构诚实 · 北美 FAS 黑胡桃纯实木手工榫卯家具', isZh))}
                </h1>
                <p style="font-size:1.12rem;line-height:1.75;color:${theme.textMuted};margin:0 0 32px;max-width:640px;">
                  ${esc(sanitizeCopy(draft.copy[ctx.lang]?.subtitle, 'Adhering to strict Bauhaus functional minimalism. Crafted from 100% solid North American FAS black walnut and white oak with interlocking dovetail mortise-tenon joinery.', '坚守包豪斯“形式追随功能”的纯粹理念，全系列精选北美特级 FAS 黑胡桃木与白橡木，传统燕尾榫与双重抱头榫紧密咬合，零螺丝外露，呈现温润厚重的建筑级家具原真之美。', isZh))}
                </p>

                <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:40px;">
                  <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;padding:15px 32px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.96rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};letter-spacing:0.02em;">
                    ${isZh ? '品鉴纯实木家具矩阵' : 'Explore Solid Woodworks'} ↗
                  </a>
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:15px 28px;border-radius:6px;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};font-size:0.96rem;font-weight:700;">
                    ${isZh ? '获取木料样品与大宗报价' : 'Request Timber Swatches'}
                  </a>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;padding-top:28px;border-top:1px solid ${theme.cardBorder};">
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">100% FAS</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '全美特级天然纯实木' : 'North American Timber'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">0 Screws</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '主承重传统穿插榫卯' : 'Zero Exposed Screws'}</div>
                  </div>
                  <div>
                    <div style="font-size:1.6rem;font-weight:900;color:${theme.primary};font-family:serif;">Osmo® Wax</div>
                    <div style="font-size:0.75rem;color:${theme.textSub};">${isZh ? '纯天然欧诗木植物木蜡油' : 'Zero-VOC Plant Wax Finish'}</div>
                  </div>
                </div>
              </div>

              <!-- Editorial Hardwood Craft Card -->
              <div style="position:relative;">
                <div style="border-radius:12px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 24px 60px rgba(28,25,23,0.08);padding:14px;">
                  <div style="border-radius:8px;overflow:hidden;position:relative;padding-top:105%;">
                    <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(28,25,23,0.7) 0%, transparent 50%);"></div>
                    <div style="position:absolute;bottom:20px;left:20px;right:20px;color:#ffffff;">
                      <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#fca5a5;margin-bottom:4px;">
                        FLAGSHIP MASTERWORK
                      </div>
                      <div style="font-size:1.15rem;font-weight:900;font-family:serif;line-height:1.3;">
                        ${esc(heroProduct.name)}
                      </div>
                      <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-top:4px;">
                        ${esc(heroProduct.timberHardwareSpec)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Bauhaus Woodworking Pillars -->
          <section style="padding:80px 0;background:#ffffff;border-bottom:1px solid ${theme.cardBorder};">
            <div class="wrap" style="padding:0 24px;">
              <div style="text-align:center;max-width:680px;margin:0 auto 50px;">
                <div style="font-size:0.8rem;font-weight:800;color:${theme.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;font-family:serif;">
                  HONEST MATERIALITY & TIMELESS JOINERY
                </div>
                <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:${theme.text};margin:0 0 12px;font-family:Georgia, serif;">
                  ${isZh ? '包豪斯实木工坊的三大制造法则' : 'Three Pillars of Architectural Woodworking'}
                </h2>
                <p style="font-size:0.98rem;color:${theme.textMuted};line-height:1.7;">
                  ${isZh ? '真正的实木家具不需要浮华的装饰，木材与生俱来的年轮与精密咬合的榫头本身就是极致的艺术。' : 'Celebrating structural honesty, natural grain flow, and centuries-old interlocking joinery.'}
                </p>
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:32px;">
                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">I.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '传统双重抱头榫与燕尾穿插' : 'Interlocking Mortise & Tenon'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '公母榫精准留出0.1mm手工公差，通过木纤维在胶水微胀下的物理自锁，经百年干燥与重压仍不松不散。' : 'Interlocking tongue-and-groove joints engineered to 0.1mm tolerances, defying joint loosening over decades.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">II.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '北美原产 FAS 特级黑胡桃大板' : '100% Solid FAS North American Timber'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '仅选用大口径老龄原木直拼，杜绝碎木指接与贴皮伪装，山形木纹完整舒展，触感温润饱满。' : 'Sourced from sustainably managed Appalachian forests, dried to 8-10% moisture content for zero cracking.'}
                  </p>
                </div>

                <div style="background:${theme.bg};border:1px solid ${theme.cardBorder};border-radius:12px;padding:32px;" class="wr-card-hover">
                  <div style="font-size:1.8rem;color:${theme.primary};font-family:serif;font-weight:900;margin-bottom:14px;">III.</div>
                  <h3 style="font-size:1.15rem;font-weight:800;color:${theme.text};margin:0 0 10px;font-family:serif;">${isZh ? '德国欧诗木天然环保植物木蜡油' : 'German Osmo® Natural Wax-Oil'}</h3>
                  <p style="font-size:0.88rem;line-height:1.7;color:${theme.textMuted};margin:0;">
                    ${isZh ? '深层渗透木质导管孔隙，保留实木自由呼吸的毛孔，不形成塑料漆膜，具备极佳的防水耐热与抗划伤性能。' : 'Open-pore natural plant wax finish allowing timber to breathe, free from artificial plastic resin lacquers.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Featured Hardwood Pieces -->
          <section style="padding:80px 0;">
            <div class="wrap" style="padding:0 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
                <div>
                  <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:6px;font-family:serif;">
                    THE SOLID WOOD COLLECTION
                  </div>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.2rem);font-weight:900;color:${theme.text};margin:0;font-family:Georgia, serif;">
                    ${isZh ? '包豪斯纯实木经典家具' : 'Solid Hardwood Furniture Gallery'}
                  </h2>
                </div>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-weight:800;font-size:0.92rem;color:${theme.primary};font-family:serif;">
                  ${isZh ? '浏览全系 8 款实木作品 ↗' : 'View Full Catalog (8 Pieces) ↗'}
                </a>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
                ${products.slice(0, 4).map((item, idx) => {
                  const meta = (item as ThemedFurnitureItem).timberHardwareSpec ? (item as ThemedFurnitureItem) : FURNITURE_DEFAULT_PRODUCTS[idx % FURNITURE_DEFAULT_PRODUCTS.length]!;
                  const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                  return `
                    <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(28,25,23,0.04);" class="wr-card-hover">
                      <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f5f5f4;">
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
                        <div style="padding:10px 12px;background:#faf8f5;border-radius:6px;font-size:0.76rem;color:${theme.textSub};margin-bottom:14px;border:1px solid ${theme.cardBorder};">
                          <strong>${isZh ? '材质规格' : 'Material'}:</strong> ${esc(meta.timberHardwareSpec)}
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
    if (isVideo) {
      // -------------------------------------------------------------
      // SPATIAL VIDEO: Kinetic Modular Matrix Catalog Layout
      // -------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:40px;border-bottom:1px solid ${theme.cardBorder};padding-bottom:28px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <span style="padding:4px 10px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;text-transform:uppercase;">
                  MODULAR TRANSFORMATION SYSTEMS
                </span>
                <span style="font-size:0.85rem;color:${theme.textSub};font-family:monospace;">8 PRODUCTION MODELS</span>
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 2.8rem);font-weight:900;color:${theme.text};margin:0 0 12px;">
                ${esc(ui.catalog)}
              </h1>
              <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:720px;">
                ${isZh ? '浏览智能折叠壁床、液压升降茶几、模块化悬浮收纳柜与齿轮伸缩餐桌，专为现代城市微公寓与多单元地产开发提供高坪效整装配套。' : 'Explore our space-saving transforming wall-beds, kinetic lift tables, and modular storage units engineered for multi-unit apartment projects.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
              ${products.map((item, idx) => {
                const meta = (item as ThemedFurnitureItem).timberHardwareSpec ? (item as ThemedFurnitureItem) : FURNITURE_DEFAULT_PRODUCTS[idx % FURNITURE_DEFAULT_PRODUCTS.length]!;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.03);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:74%;overflow:hidden;background:#f1f5f9;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:800;background:#ffffff;color:${theme.text};border:1px solid ${theme.cardBorder};">
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
                      <div style="background:#f8fafc;padding:12px;border-radius:8px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;border:1px solid ${theme.cardBorder};">
                        <div><strong>${isZh ? '核心用料' : 'Hardware'}:</strong> ${esc(meta.timberHardwareSpec)}</div>
                        <div style="margin-top:4px;"><strong>${isZh ? '规格承重' : 'Specs & Load'}:</strong> ${esc(meta.dimensionsLoadSpec)}</div>
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:9px 20px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
    } else {
      // -------------------------------------------------------------
      // MINIMAL BANNER: Bauhaus Hardwood Editorial Lookbook Layout
      // -------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <div style="margin-bottom:40px;border-bottom:1px solid ${theme.cardBorder};padding-bottom:28px;">
              <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:serif;">
                FAS TIMBER & MASTER JOINERY CATALOG
              </div>
              <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;font-family:Georgia, serif;">
                ${esc(ui.catalog)}
              </h1>
              <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:700px;line-height:1.7;">
                ${isZh ? '探索北美FAS黑胡桃木休闲椅、传统大榫卯餐桌、悬臂钢管马鞍皮椅与斜边餐边柜，支持大宗工程配套与定制开模。' : 'Browse our solid hardwood Bauhaus furniture collection built with generational mortise-tenon joinery and sustainable Appalachian timber.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:32px;">
              ${products.map((item, idx) => {
                const meta = (item as ThemedFurnitureItem).timberHardwareSpec ? (item as ThemedFurnitureItem) : FURNITURE_DEFAULT_PRODUCTS[idx % FURNITURE_DEFAULT_PRODUCTS.length]!;
                const imgSrc = (item as any).img || ctx.productMainImage(item as unknown as Product) || meta.img;
                return `
                  <article style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(28,25,23,0.04);" class="wr-card-hover">
                    <div style="position:relative;width:100%;padding-top:76%;overflow:hidden;background:#f5f5f4;">
                      <img src="${esc(imgSrc)}" alt="${esc(item.name)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
                      <span style="position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:4px;font-size:0.72rem;font-weight:800;background:rgba(255,255,255,0.95);color:${theme.text};border:1px solid ${theme.cardBorder};font-family:serif;">
                        ${esc(meta.badge)}
                      </span>
                    </div>
                    <div style="padding:22px;display:flex;flex-direction:column;flex:1;">
                      <div style="font-size:0.72rem;font-weight:800;color:${theme.primary};text-transform:uppercase;margin-bottom:6px;font-family:serif;">
                        ${esc(meta.categoryNameEn)}
                      </div>
                      <h2 style="font-size:1.15rem;font-weight:800;color:${theme.text};line-height:1.35;margin:0 0 8px;font-family:serif;">
                        ${esc(item.name)}
                      </h2>
                      <p style="font-size:0.86rem;color:${theme.textMuted};line-height:1.65;margin:0 0 16px;flex:1;">
                        ${esc(item.desc || '')}
                      </p>
                      <div style="background:#faf8f5;padding:12px;border-radius:6px;font-size:0.76rem;color:${theme.textSub};margin-bottom:16px;border:1px solid ${theme.cardBorder};">
                        <div><strong>${isZh ? '天然用料' : 'Timber Spec'}:</strong> ${esc(meta.timberHardwareSpec)}</div>
                        <div style="margin-top:4px;"><strong>${isZh ? '规格承重' : 'Dimensions'}:</strong> ${esc(meta.dimensionsLoadSpec)}</div>
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.8rem;font-weight:700;color:${theme.textMuted};">${esc(meta.moq)}</span>
                        <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="text-decoration:none;padding:9px 20px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.82rem;font-weight:700;">
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
    }
  } else if (page === 'detail') {
    const meta = (selectedProduct as unknown as ThemedFurnitureItem).timberHardwareSpec ? (selectedProduct as unknown as ThemedFurnitureItem) : defaultMeta;
    const imgSrc = ctx.productMainImage(selectedProduct as Product) || (selectedProduct as any).img || defaultMeta.img;

    if (isVideo) {
      // -------------------------------------------------------------
      // SPATIAL VIDEO: Kinematic Trajectory & Engineering Spec Detail
      // -------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
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
                <div style="border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 36px rgba(0,0,0,0.06);position:relative;">
                  <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;max-height:540px;object-fit:cover;display:block;">
                </div>
              </div>

              <div>
                <div style="display:inline-block;padding:5px 14px;border-radius:6px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
                  ${esc(meta.badge || 'Kinetic Mechanism Certified')}
                </div>

                <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;">
                  ${esc(selectedProduct.name)}
                </h1>

                <p style="font-size:1.02rem;line-height:1.7;color:${theme.textMuted};margin:0 0 24px;">
                  ${esc(sanitizeCopy((selectedProduct as any).desc || selectedProduct.description, meta.desc, meta.desc, isZh))}
                </p>

                <!-- Technical Specifications Grid -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                  <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.06em;margin-bottom:12px;">
                    ${isZh ? '五金机构与力学工程参数' : 'Kinematic Hardware & Engineering Specs'}
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.86rem;">
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '用料五金' : 'Materials & Hardware'}</span>
                      <strong style="color:${theme.text};">${esc(meta.timberHardwareSpec)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '规格尺寸与承重' : 'Dimensions & Static Load'}</span>
                      <strong style="color:${theme.text};">${esc(meta.dimensionsLoadSpec)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '联动机构' : 'Linkage Mechanism'}</span>
                      <strong style="color:${theme.text};">${esc(meta.joineryMechanismDetail)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '生产起订量' : 'Production MOQ'}</span>
                      <strong style="color:${theme.text};">${esc(meta.moq)}</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:16px;">
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 32px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '索取该款工程报价与CAD' : 'Request CAD & Unit Pricing'} ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    } else {
      // -------------------------------------------------------------
      // MINIMAL BANNER: Bauhaus Mortise Anatomy Detail
      // -------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:40px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:${theme.textSub};margin-bottom:30px;font-family:serif;">
              <a href="${path('index.html')}" ${navAttrs('home')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.home)}</a>
              <span style="margin:0 8px;">/</span>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:${theme.textMuted};text-decoration:none;">${esc(ui.catalog)}</a>
              <span style="margin:0 8px;">/</span>
              <span style="color:${theme.text};font-weight:700;">${esc(selectedProduct.name)}</span>
            </nav>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:start;margin-bottom:70px;">
              <div>
                <div style="border-radius:12px;overflow:hidden;background:#ffffff;border:1px solid ${theme.cardBorder};box-shadow:0 12px 36px rgba(28,25,23,0.06);position:relative;">
                  <img id="wr-detail-main-img" src="${esc(imgSrc)}" alt="${esc(selectedProduct.name)}" style="width:100%;height:auto;max-height:540px;object-fit:cover;display:block;">
                </div>
              </div>

              <div>
                <div style="display:inline-block;padding:4px 12px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;font-family:serif;">
                  ${esc(meta.badge || 'Bauhaus Woodcraft Masterpiece')}
                </div>

                <h1 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:900;color:${theme.text};line-height:1.2;margin:0 0 16px;font-family:Georgia, serif;">
                  ${esc(selectedProduct.name)}
                </h1>

                <p style="font-size:1.02rem;line-height:1.75;color:${theme.textMuted};margin:0 0 24px;">
                  ${esc(sanitizeCopy((selectedProduct as any).desc || selectedProduct.description, meta.desc, meta.desc, isZh))}
                </p>

                <!-- Woodcraft Specifications -->
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:8px;padding:22px;margin-bottom:28px;box-shadow:0 4px 16px rgba(28,25,23,0.03);">
                  <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;color:${theme.primary};letter-spacing:0.08em;margin-bottom:12px;font-family:serif;">
                    ${isZh ? '天然实木用料与榫卯工艺参数' : 'Solid Timber Grade & Joinery Parameters'}
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.86rem;">
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '木料等级' : 'Timber Grade'}</span>
                      <strong style="color:${theme.text};">${esc(meta.timberHardwareSpec)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '规格尺寸' : 'Dimensions'}</span>
                      <strong style="color:${theme.text};">${esc(meta.dimensionsLoadSpec)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '榫卯工艺' : 'Joinery Method'}</span>
                      <strong style="color:${theme.text};">${esc(meta.joineryMechanismDetail)}</strong>
                    </div>
                    <div>
                      <span style="color:${theme.textSub};display:block;font-size:0.75rem;">${isZh ? '大宗起订量' : 'Production MOQ'}</span>
                      <strong style="color:${theme.text};">${esc(meta.moq)}</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:16px;">
                  <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 32px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.95rem;font-weight:800;box-shadow:0 6px 20px ${theme.accentGlow};">
                    ${isZh ? '索取实木样板与集装箱报价' : 'Request Timber Swatches & Quotation'} ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
  } else if (page === 'about') {
    // -------------------------------------------------------------
    // ABOUT PAGE: COMPLETELY DIFFERENT LAYOUTS BETWEEN BANNER & VIDEO
    // ZERO SQUISHY CAT FALLBACK!
    // -------------------------------------------------------------
    const headline = sanitizeCopy(
      getAboutHeadline(company, company.name),
      isVideo ? 'Kinetic Space Engineering & Pneumatic Durability Laboratory' : 'Bauhaus Woodworking Academy & Generational Joinery Atelier',
      isVideo ? '空间动力学工程中心与气压耐久性测试实验室' : '包豪斯纯实木榫卯大匠工坊与木工学院',
      isZh,
    );

    const customAboutImg = company.aboutImageAssetId ? ctx.asset(company.aboutImageAssetId) : '';
    const storyParas = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about);
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '30+ Yrs', num: 30, suffix: '+ Yrs', label: isZh ? '工匠制造底蕴' : 'Craft Heritage', desc: isZh ? '数十年传统大木作与精密五金研发' : 'Decades of woodworking engineering' },
      { value: '45,000 m²', num: 45000, suffix: ' m²', label: isZh ? '智造基地面积' : 'Manufacturing Campus', desc: isZh ? '现代化五轴数控加工与干燥窑群' : 'High-precision 5-axis CNC facilities' },
      { value: '99.9%', num: 99.9, suffix: '%', label: isZh ? '出厂首检合格率' : 'First-Pass QA Yield', desc: isZh ? '严苛微米级结构公差与承重全检' : 'Strict mechanical tolerance verification' },
      { value: '35+ Mkts', num: 35, suffix: '+ Mkts', label: isZh ? '全球出口国家' : 'Global Export Markets', desc: isZh ? '直供全球高端地产与设计零售' : 'Supplying international retail partners' },
    ]);

    if (isVideo) {
      // -----------------------------------------------------------------
      // SPATIAL VIDEO ABOUT: 4-Testing-Stations Lab Layout
      // -----------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <!-- Header Banner -->
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
                SPATIAL DYNAMICS & ROBOTIC LIFE TESTING
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.7;">
                ${isZh ? '致力于通过严苛的机械疲劳验证与航天级气压平衡系统，解决全球超高密度城市居所的坪效瓶颈。' : 'Dedicated to overcoming spatial constraints in modern dense urban environments through aerospace-grade nitrogen damping pistons and rigorous robotic fatigue testing.'}
              </p>
            </div>

            <!-- Lab Overview Split -->
            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的动力学研发中心占地 35,000 平方米，设有专职机构力学工程师团队与多套伺服电机驱动的全自动疲劳测试机架。' : 'Operating an accredited 35,000 m² spatial engineering testing campus equipped with automated servo-driven cyclic test benches and precision robotic endurance rigs.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '每一套进入量产的折叠系统均须在满载 400kg 状态下通过 40,000 次不间断开合，确保交付给全球品牌开发商的每一套家具具备 20 年以上的无故障运行品质。' : 'Every transformable model undergoes continuous 40,000-cycle deployment tests under a full 400kg load, ensuring over 20 years of maintenance-free commercial duty.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:10px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约实验室视频验厂' : 'Book Lab Video Audit'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:20px;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:36px;color:#ffffff;box-shadow:0 16px 40px rgba(0,0,0,0.12);border:1px solid rgba(234,88,12,0.3);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ea580c;margin-bottom:8px;">
                      TEST RIG TELEMETRY HUD
                    </div>
                    <div style="font-size:1.4rem;font-weight:900;margin-bottom:16px;">
                      Robotic Piston Fatigue Rig
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.85rem;color:rgba(255,255,255,0.8);">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Target Cyclic Benchmark</span>
                        <strong style="color:#ffffff;">50,000 Cycles</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Static Structural Deflection</span>
                        <strong style="color:#ffffff;">&lt; 1.2 mm @ 400 kg</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                        <span>Pneumatic Gas Nitrogen Purity</span>
                        <strong style="color:#ffffff;">99.998% N2</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>Mandatory Safety Standard</span>
                        <strong style="color:#ea580c;">EN 1129-1:2020 PASS</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 4 Dynamic Testing Stations -->
            <div style="margin-bottom:50px;">
              <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};margin:0 0 24px;">
                ${isZh ? '四大机构力学检测工位' : 'Four Accredited Mechanical Testing Stations'}
              </h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:20px;">
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.02);">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">STATION 01</div>
                  <div style="font-size:1.05rem;font-weight:800;color:${theme.text};margin-bottom:6px;">${isZh ? '气压活塞往复疲劳台' : 'Piston Endurance Station'}</div>
                  <div style="font-size:0.82rem;color:${theme.textMuted};line-height:1.5;">${isZh ? '持续模拟 50,000 次开合，压力降小于 2%' : 'Continuous cyclic deployment with <2% damping loss.'}</div>
                </div>
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.02);">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">STATION 02</div>
                  <div style="font-size:1.05rem;font-weight:800;color:${theme.text};margin-bottom:6px;">${isZh ? '400kg 静态重载偏转台' : '400kg Static Deflection Rig'}</div>
                  <div style="font-size:0.82rem;color:${theme.textMuted};line-height:1.5;">${isZh ? '高灵敏度激光位移计测量骨架变形' : 'Laser displacement tracking across bed chassis.'}</div>
                </div>
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.02);">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">STATION 03</div>
                  <div style="font-size:1.05rem;font-weight:800;color:${theme.text};margin-bottom:6px;">${isZh ? '微公寓空间坪效测算室' : 'Spatial Yield Ergonomics Lab'}</div>
                  <div style="font-size:0.82rem;color:${theme.textMuted};line-height:1.5;">${isZh ? '三维光学动捕验证人机工效与动线' : '3D motion tracking of furniture conversion ergonomics.'}</div>
                </div>
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.02);">
                  <div style="font-size:0.75rem;font-weight:800;color:${theme.primary};margin-bottom:6px;">STATION 04</div>
                  <div style="font-size:1.05rem;font-weight:800;color:${theme.text};margin-bottom:6px;">${isZh ? '极限温度与防腐雾化室' : 'Thermal & Salt-Fog Chamber'}</div>
                  <div style="font-size:0.82rem;color:${theme.textMuted};line-height:1.5;">${isZh ? '-20°C 至 +60°C 环境下机构润滑可靠性' : 'Testing mechanism fluidity from -20°C to +60°C.'}</div>
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:24px;">
              ${stats.map((s) => `
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:16px;padding:26px;">
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
      // -----------------------------------------------------------------
      // MINIMAL BANNER ABOUT: 3 Woodcraft Foundations Atelier Layout
      // -----------------------------------------------------------------
      mainHtml = `
        <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
          <div class="wrap" style="padding:0 24px;">
            <!-- Header Banner -->
            <div style="margin-bottom:48px;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:4px;background:${theme.pillBg};color:${theme.pillText};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;font-family:serif;">
                ✦ GENERATIONAL MORTISE & TENON WOODWORKING
              </div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:${theme.text};margin:0 0 16px;line-height:1.2;font-family:Georgia, serif;">
                ${esc(headline)}
              </h1>
              <p style="font-size:1.1rem;color:${theme.textMuted};margin:0;max-width:760px;line-height:1.75;">
                ${isZh ? '用坚不可摧的榫卯结构和真挚木纹，让家具成为可传承百年的空间建筑。' : 'Honoring architectural integrity with heirloom mortise-and-tenon craftsmanship and authentic Appalachian solid hardwood.'}
              </p>
            </div>

            <!-- Atelier Story Split -->
            <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:44px;align-items:center;margin-bottom:60px;">
              <div>
                <div style="font-size:1.02rem;line-height:1.8;color:${theme.textMuted};margin:0 0 24px;">
                  ${storyParas.length > 0 ? storyParas.map((p) => `<p style="margin:0 0 18px;">${esc(p)}</p>`).join('') : `
                    <p style="margin:0 0 18px;">${isZh ? '我们的木工工坊位于拥有数十年手作木作传统的制造集群，占地 48,000 平方米，拥有全套德国豪迈五轴数控加工中心与恒温真空干燥窑。' : 'Rooted in decades of artisanal cabinetmaking heritage, our 48,000 m² campus pairs German Homag 5-axis CNC machining centers with precision vacuum moisture-balancing kilns.'}</p>
                    <p style="margin:0 0 18px;">${isZh ? '我们严格遵循北美硬木协会（NHLA）FAS 特级分选标准，仅选用树龄 60 年以上的老龄原木。每一处转角榫卯均由经验超过 20 年的木匠手工校核，公差控制在 0.1 毫米以内。' : 'We adhere strictly to NHLA FAS grading standards, selecting only 60+ year virgin timber. Every dovetail and tenon is hand-tuned by master joiners to under 0.1mm tolerance.'}</p>
                  `}
                </div>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:14px 28px;border-radius:6px;background:${theme.btnGradient};color:#ffffff;font-size:0.92rem;font-weight:800;box-shadow:0 4px 14px ${theme.accentGlow};display:inline-block;">
                  ${isZh ? '预约实地验厂或索取木样' : 'Schedule Atelier Visit & Timber Swatches'} ↗
                </a>
              </div>

              <div>
                ${customAboutImg ? `
                  <div style="border-radius:12px;overflow:hidden;box-shadow:0 12px 36px rgba(28,25,23,0.08);border:1px solid ${theme.cardBorder};">
                    <img src="${esc(customAboutImg)}" alt="${esc(brandName)}" style="width:100%;height:360px;object-fit:cover;display:block;">
                  </div>
                ` : `
                  <div style="border-radius:12px;background:#ffffff;padding:36px;border:1px solid ${theme.cardBorder};box-shadow:0 16px 40px rgba(28,25,23,0.06);">
                    <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;font-family:serif;">
                      TIMBER PROVENANCE CHARTER
                    </div>
                    <div style="font-size:1.35rem;font-weight:900;color:${theme.text};font-family:serif;margin-bottom:14px;">
                      Appalachian Hardwood Integrity
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:0.86rem;color:${theme.textMuted};">
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Timber Grading</span>
                        <strong style="color:${theme.text};font-family:serif;">100% Solid FAS Grade</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Equilibrium Moisture</span>
                        <strong style="color:${theme.text};font-family:serif;">8% – 10% Controlled</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-bottom:1px solid ${theme.cardBorder};padding-bottom:6px;">
                        <span>Surface Treatment</span>
                        <strong style="color:${theme.text};font-family:serif;">German Osmo® Plant Wax</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span>Joinery Standard</span>
                        <strong style="color:${theme.primary};font-family:serif;">Interlocking Mortise & Tenon</strong>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- 3 Architectural Woodcraft Foundations -->
            <div style="margin-bottom:50px;">
              <h2 style="font-size:1.4rem;font-weight:900;color:${theme.text};margin:0 0 24px;font-family:Georgia, serif;">
                ${isZh ? '三大纯实木工艺基石' : 'Three Woodcraft Foundations'}
              </h2>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;">
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:26px;">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;margin-bottom:8px;">01</div>
                  <div style="font-size:1.1rem;font-weight:800;color:${theme.text};font-family:serif;margin-bottom:6px;">${isZh ? '真空除湿木材烘干窑' : 'Vacuum Dehumidification Kilns'}</div>
                  <div style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;">${isZh ? '含水率精准锁定在 8-10%，彻底杜绝因跨国气候温湿度差异导致的开裂变形。' : 'Moisture content locked at 8-10%, preventing warping across overseas climates.'}</div>
                </div>
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:26px;">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;margin-bottom:8px;">02</div>
                  <div style="font-size:1.1rem;font-weight:800;color:${theme.text};font-family:serif;margin-bottom:6px;">${isZh ? '0.1mm 极窄公差榫眼' : '0.1mm Joinery Tolerance'}</div>
                  <div style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;">${isZh ? '公母榫紧密咬合，依靠木纤维天然弹力与榫头结构自锁，受力百年不变形。' : 'Interlocking joint fibers self-lock mechanically, holding firm across generations.'}</div>
                </div>
                <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:10px;padding:26px;">
                  <div style="font-size:1.4rem;font-weight:900;color:${theme.primary};font-family:serif;margin-bottom:8px;">03</div>
                  <div style="font-size:1.1rem;font-weight:800;color:${theme.text};font-family:serif;margin-bottom:6px;">${isZh ? '天然零甲醛植物木蜡油' : 'Natural Plant Wax-Oil'}</div>
                  <div style="font-size:0.84rem;color:${theme.textMuted};line-height:1.6;">${isZh ? '保留木质导管自由呼吸的开放毛孔，触感温润真实，符合欧美食品级接触安全规范。' : 'Preserving open breathable pores with zero VOCs and natural organic oils.'}</div>
                </div>
              </div>
            </div>

            <!-- Metrics -->
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
    }
  } else if (page === 'contact') {
    // -------------------------------------------------------------
    // CONTACT PAGE: Direct Factory Engineering Quote Form
    // -------------------------------------------------------------
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

    mainHtml = `
      <main class="furniture-main" style="background:${theme.bg};color:${theme.text};min-height:80vh;padding:50px 0 100px;">
        <div class="wrap" style="padding:0 24px;">
          <div style="margin-bottom:40px;">
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${theme.primary};margin-bottom:8px;">
              ${isZh ? '大宗地产工程与专属定制洽谈' : 'COMMERCIAL ARCHITECT & OEM INQUIRY'}
            </div>
            <h1 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:900;color:${theme.text};margin:0 0 14px;">
              ${esc(ui.conversation)}
            </h1>
            <p style="font-size:1.05rem;color:${theme.textMuted};margin:0;max-width:680px;">
              ${isZh ? '请填写您的工程采购清单或定制图纸需求，我们的家具结构工程师将在 24 小时内与您接洽，并提供三维 CAD 拆单、BOM 成本核算与木样寄送。' : 'Submit your project specifications or architectural drawings. Our structural engineering team will respond within 24 hours with complete CAD details and volume pricing.'}
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:40px;">
            <!-- Contact Card Details -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);height:fit-content;">
              <h3 style="font-size:1.2rem;font-weight:900;color:${theme.text};margin:0 0 16px;">
                ${esc(brandName)}
              </h3>
              <p style="font-size:0.88rem;color:${theme.textMuted};line-height:1.6;margin:0 0 24px;">
                ${esc(sanitizeCopy(company.description, isVideo ? 'Direct manufacturing facility supplying residential developers and architectural projects globally.' : 'Direct woodcraft atelier supplying custom millwork and hardwood collections worldwide.', isVideo ? '专注高品质实木家具制造与微公寓变形家具外贸，支持OEM/ODM/OBM全球集装箱货运履约。' : '专注纯实木榫卯家具与建筑定制工程，支持全球集装箱大宗出口。', isZh))}
              </p>

              <div style="display:flex;flex-direction:column;gap:18px;font-size:0.9rem;">
                <div>
                  <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Export Engineering Email</span>
                  <a href="mailto:${esc(company.email)}" style="color:${theme.primary};text-decoration:none;font-weight:700;">${esc(company.email)}</a>
                </div>

                ${company.phone ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Project Hotline</span>
                    <a href="tel:${esc(company.phone)}" style="color:${theme.text};text-decoration:none;font-weight:700;">${esc(company.phone)}</a>
                  </div>
                ` : ''}

                ${company.whatsapp ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">WhatsApp Direct Desk</span>
                    <a href="https://wa.me/${waDigits}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:none;font-weight:700;">+${waDigits} (Click to Chat)</a>
                  </div>
                ` : ''}

                ${company.address ? `
                  <div>
                    <span style="display:block;font-size:0.75rem;color:${theme.textSub};text-transform:uppercase;font-weight:700;">Manufacturing Campus</span>
                    <span style="color:${theme.text};">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- RFQ Form with Apple Liquid Glass styling -->
            <div style="background:#ffffff;border:1px solid ${theme.cardBorder};border-radius:20px;padding:36px;box-shadow:0 8px 28px rgba(0,0,0,0.04);">
              <form action="${esc(ctx.options.inquiryUrl)}" method="post" class="furniture-inquiry-form" style="display:flex;flex-direction:column;gap:20px;">
                <input type="hidden" name="projectId" value="${esc(ctx.options.projectId || '')}">
                <input type="hidden" name="template" value="${isVideo ? 'furniture-spatial-video' : 'furniture-minimal-banner'}">
                <input type="hidden" name="productId" value="${esc(ctx.options.productId || '')}">

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '您的姓名 / 职务' : 'Full Name & Title'} *
                    </label>
                    <input type="text" name="name" required placeholder="${isZh ? '例如：John Doe (采购总监)' : 'e.g. John Doe, Purchasing Director'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '商务电子邮箱' : 'Corporate Email Address'} *
                    </label>
                    <input type="email" name="email" required placeholder="john@company.com" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:800;margin-bottom:6px;color:${theme.text};">
                      ${isZh ? '公司名称 / 地产项目' : 'Company Name / Project Title'}
                    </label>
                    <input type="text" name="company" placeholder="${isZh ? '例如：Apex Residential Group' : 'e.g. Apex Residential Group'}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;">
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
                    ${isZh ? '详细采购清单或规格要求' : 'Specifications & Required Finishes'} *
                  </label>
                  <textarea name="message" required rows="5" placeholder="${isZh ? '请描述您所需的家具款式、实木用料偏好（如黑胡桃、白橡木）、表面处理要求、图纸交付日期或预计进场安装节点...' : 'Describe requested models, timber preferences (walnut, oak), hardware requirements, target delivery port, and whether CAD files are available...'}" style="width:100%;box-sizing:border-box;padding:14px;border-radius:8px;border:1px solid ${theme.cardBorder};background:#fdfdfd;color:${theme.text};font-size:0.9rem;outline:none;resize:vertical;"></textarea>
                </div>

                <div>
                  <button type="submit" style="width:100%;padding:15px 28px;border-radius:8px;background:${theme.btnGradient};color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 6px 20px ${theme.accentGlow};transition:transform 0.15s ease;">
                    ${isZh ? '提交大宗工程询盘需求' : 'Submit Commercial RFQ & Request CAD'} ↗
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
    <footer class="furniture-footer" style="background:#ffffff;border-top:1px solid ${theme.cardBorder};padding:60px 0 40px;color:${theme.textSub};font-size:0.88rem;">
      <div class="wrap" style="padding:0 24px;">
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;margin-bottom:40px;">
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:${theme.text};margin-bottom:8px;font-family:${isVideo ? 'system-ui, sans-serif' : 'Georgia, serif'};">
              ${esc(brandName)}
            </div>
            <p style="font-size:0.86rem;color:${theme.textMuted};max-width:380px;line-height:1.6;margin:0 0 16px;">
              ${esc(sanitizeCopy(company.description, isVideo ? 'Direct manufacturing facility specializing in kinetic space-saving furniture and modular storage solutions.' : 'Artisanal solid hardwood woodworking atelier dedicated to timeless mortise-and-tenon craftsmanship.', isVideo ? '专注于城市高坪效气压隐形折叠壁床与模块化收纳家具工程研发与制造。' : '坚守包豪斯极简纯粹主义，以传世大榫卯工艺打造温润厚重的纯实木建筑级家具。', isZh))}
            </p>
            <div style="font-size:0.8rem;color:${theme.textSub};">
              <strong>${isZh ? '国际标准认证' : 'Standards'}:</strong> ${isVideo ? 'ANSI/BIFMA X5.1 · EN 1129 · ISO9001' : 'FSC 100% Solid Timber · CARB P2 · ISO9001'}
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
            <div style="font-size:0.8rem;font-weight:800;letter-spacing:0.08em;color:${theme.primary};text-transform:uppercase;margin-bottom:14px;">${isZh ? '工程接洽' : 'B2B Liaison'}</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.85rem;">
              <div>${esc(company.email)}</div>
              ${company.phone ? `<div>${esc(company.phone)}</div>` : ''}
              ${company.address ? `<div>${esc(company.address)}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="border-top:1px solid ${theme.cardBorder};padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;">
          <div>© ${new Date().getUTCFullYear()} ${esc(brandName)}. All rights reserved.</div>
          <div>${isZh ? '国际建筑与室内家具工程标准 · ISO9001 / BIFMA 5.1 强度认证' : 'ANSI/BIFMA X5.1 Certified · ISO9001 Manufacturing Standards'}</div>
        </div>
      </div>
    </footer>
  `;

  return `
    <div class="furniture-site-wrapper" style="min-height:100vh;display:flex;flex-direction:column;background:${theme.bg};">
      ${headerHtml}
      ${mainHtml}
      ${footerHtml}
    </div>
  `;
}
