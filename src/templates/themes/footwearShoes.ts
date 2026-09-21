import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export interface ThemedFootwearItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  category: string;
  categoryNameZh: string;
  categoryNameEn: string;
  midsoleTech: string;
  upperMaterial: string;
  outsoleGrip: string;
  dropStack: string;
  moq: string;
  tagline: string;
  img: string;
}

export const FOOTWEAR_DEFAULT_PRODUCTS: ThemedFootwearItem[] = [
  {
    id: 'fw-1',
    name: 'AeroCarbon Pro Marathon Carbon-Plate Running Shoes',
    desc: 'Dual-density supercritical Pebax nitrogen foaming with full-length 3D curved carbon fiber plate delivering 85%+ energy return and supreme forward propulsion.',
    badge: 'Elite Performance',
    category: 'running',
    categoryNameZh: '先锋全掌碳板竞速跑鞋',
    categoryNameEn: 'Carbon-Plate Racers',
    midsoleTech: 'Supercritical Pebax Nitrogen Foam + Full-Length 3D Carbon Plate',
    upperMaterial: 'Ultra-Breathable Monofilament Jacquard Mesh with Heat-Melt TPU Cage',
    outsoleGrip: 'CPU Anti-Abrasion Lightweight Wet-Grip Rubber (1000km+ Durability)',
    dropStack: '8mm Drop (Heel 38mm / Forefoot 30mm) · 185g (US 8.5)',
    moq: '500 Pairs per Colorway',
    tagline: 'Defy Friction, Harness Pure Forward Momentum',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    id: 'fw-2',
    name: 'ApexGrip All-Terrain Vibram Trail & Alpine Boot',
    desc: 'Gore-Tex waterproof bootie with Vibram Megagrip traction lug outsole, Kevlar reinforced mudguards, and dual-density EVA rock-plate midsole.',
    badge: 'Rugged Outdoor',
    category: 'trail',
    categoryNameZh: '抓地防滑V底户外越野徒步鞋',
    categoryNameEn: 'Vibram Trail & Hiking',
    midsoleTech: 'High-Density Anti-Perforation Rock Plate + Dual-Density EVA Midsole',
    upperMaterial: 'Hydrophobic Cordura 1000D + Seamless Heat-Bonded TPU Wrap',
    outsoleGrip: 'Vibram Megagrip Compound with 5mm Directional Traction Lugs',
    dropStack: '6mm Drop (Heel 33mm / Forefoot 27mm) · SATRA Slip Resistance Passed',
    moq: '300 Pairs per Colorway',
    tagline: 'Engineered for Harsh Mountain Ridges & Muddy Trails',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    id: 'fw-3',
    name: 'Artisan Heritage 360° Goodyear Welted Chelsea Boots',
    desc: 'Master handcrafted Goodyear welted construction with French vegetable-tanned full-grain calfskin, cork filler bed, and Dainite studded rubber soles.',
    badge: 'Goodyear Welted',
    category: 'heritage',
    categoryNameZh: '固特异手工缝线头层牛皮切尔西靴',
    categoryNameEn: 'Heritage Handcrafted Boots',
    midsoleTech: 'Natural Cork Cushion Bed with Tempered Spring Steel Shank',
    upperMaterial: '1.8mm French Full-Grain Vegetable-Tanned Calfskin Leather',
    outsoleGrip: 'British Dainite Studded Rubber Outsole with 360° Storm Welt',
    dropStack: 'Traditional Dress Heel (28mm Stack) · Resolable for Lifetime Wear',
    moq: '200 Pairs per Colorway',
    tagline: 'Generational Craftsmanship, Built to Last Decades',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    id: 'fw-4',
    name: 'Lumina Cloud Zero-Gravity Everyday Court Sneaker',
    desc: 'Minimalist Italian silhouette cut from buttery Nappa leather, featuring OrthoLite hybrid memory foam insole and recycled cupsole construction.',
    badge: 'Modern Minimal',
    category: 'sneakers',
    categoryNameZh: '极简奢华纳帕皮质感小白鞋',
    categoryNameEn: 'Luxury Minimalist Sneakers',
    midsoleTech: 'Cushioned Strobel Board with OrthoLite High-Rebound Memory Foam',
    upperMaterial: 'Full-Grain Buttery Soft Nappa Leather + Perforated Breathable Lining',
    outsoleGrip: 'Margom-Style Italian Rubber Cupsole with 360° Sidewall Stitching',
    dropStack: 'Zero-Drop Balanced Footbed (Heel 24mm / Forefoot 24mm)',
    moq: '300 Pairs per Colorway',
    tagline: 'Quiet Luxury Tailored for Metropolitan Commuters',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    id: 'fw-5',
    name: 'AeroBounce Recovery Slide & Ergonomic Mule',
    desc: 'One-piece injection molded supercritical aliphatic E-TPU recovery slide with anatomically sculpted deep heel cup and arch support cradle.',
    badge: 'Recovery Slip-On',
    category: 'recovery',
    categoryNameZh: '超临界高弹足弓缓震恢复拖鞋',
    categoryNameEn: 'Supercritical Recovery Slides',
    midsoleTech: '100% Supercritical Injected Aliphatic E-TPU (60% Cushion Rebound)',
    upperMaterial: 'Integrated Monolithic Molded Foam with Anti-Chafing Soft Texture',
    outsoleGrip: 'Hexagonal Wave Drainage Pattern for Wet Bath & Pool Deck Traction',
    dropStack: '12mm Ergonomic Arch Drop (Heel 36mm / Forefoot 24mm)',
    moq: '800 Pairs per Colorway',
    tagline: 'Immediate Post-Race Muscle Relief & Cloud Comfort',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    id: 'fw-6',
    name: 'Vortex Kinetic Indoor Court & Badminton Shoe',
    desc: 'Non-marking natural gum rubber outsole with lateral anti-roll TPU outrigger, carbon anti-torsion shank, and high-elastic forefoot bounce module.',
    badge: 'Court Agility',
    category: 'running',
    categoryNameZh: '羽球排球侧向支撑专业球鞋',
    categoryNameEn: 'Indoor Court Footwear',
    midsoleTech: 'Forefoot EnergyGel Pad + Rearfoot Absorbing Cushion + Carbon Shank',
    upperMaterial: 'High-Strength Microfiber Synthetic Leather with KPU Armor Lattice',
    outsoleGrip: 'Non-Marking Raw Gum Honeycomb Tread for Instant Stop-and-Go',
    dropStack: '9mm Drop (Heel 28mm / Forefoot 19mm) · Anti-Rollover Outrigger',
    moq: '400 Pairs per Colorway',
    tagline: 'Lightning Fast Direction Changes Without Heel Slippage',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    id: 'fw-7',
    name: 'Nordic Sherpa Lined Thermal Winter Chukka',
    desc: 'Water-resistant waxed suede upper lined with 100% genuine Australian shearling fleece, thermal foil sub-insole, and ice-grip composite lugs.',
    badge: 'Cold Climate',
    category: 'heritage',
    categoryNameZh: '防泼水羊羔绒保暖雪地马球靴',
    categoryNameEn: 'Thermal Winter Boots',
    midsoleTech: 'Thermal Reflective Aluminum Layer + Shock-Absorbing Molded PU Bed',
    upperMaterial: 'Water-Repellent Hydro-Treated Split Suede with Genuine Shearling',
    outsoleGrip: 'Arctic Grip Compound with Micro-Glass Fiber Lugs for Ice Traction',
    dropStack: 'Comfort Platform (Heel 32mm / Forefoot 20mm) · Rated to -30°C',
    moq: '300 Pairs per Colorway',
    tagline: 'Sub-Zero Warmth Encased in Modern Scandinavian Silhouette',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    id: 'fw-8',
    name: 'Spectre Cyber-Mesh Future Knit Runner',
    desc: 'Seamless 3D computerized knit upper reinforced with exoskeleton TPU lacing ribbons, paired with sculpted open-cavity geometric spring soles.',
    badge: 'Futuristic Street',
    category: 'sneakers',
    categoryNameZh: '几何镂空流体机能潮流针织鞋',
    categoryNameEn: 'Futuristic Knit Sneakers',
    midsoleTech: 'Hollow-Core Mechanical Structural Spring Chambers + Bio-TPU Frame',
    upperMaterial: 'Multi-Density Engineered FlyKnit with Integrated Reflective Yarn',
    outsoleGrip: 'Segmented Zonal Pod Outsole for Adaptive Natural Foot Articulation',
    dropStack: '10mm Dynamic Drop (Heel 35mm / Forefoot 25mm)',
    moq: '400 Pairs per Colorway',
    tagline: 'Kinetic Architecture in Motion on Urban Concrete',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function renderFootwearPage(ctx: ThemeContext, isVideo: boolean): string {
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
            desc: ctx.translateProduct(p).description || p.description,
            badge: '',
            category: 'footwear',
            categoryNameZh: '鞋靴',
            categoryNameEn: 'Footwear & Shoes',
            midsoleTech: p.material || '',
            upperMaterial: p.dimensions || '',
            outsoleGrip: '',
            dropStack: '',
            moq: '',
            tagline: p.tagline || '',
            img: ctx.productMainImage(p),
          }))
        : draft.products)
    : FOOTWEAR_DEFAULT_PRODUCTS) as (Product | ThemedFootwearItem)[];

  const typedSource = isTypedMaterialsSource(draft);
  const heroTitle = isZh ? '动力工程 · 先锋鞋履全链制造旗舰' : 'Kinetic Footwear Engineering & Craft Guild';
  const heroSubtitle = isZh
    ? '从先锋全掌碳板超临界跑鞋、Vibram全地形越野靴到百年固特异手工正装皮鞋，为全球品牌打造集力学生物工效学、尖端发泡技术与高定奢华质感于一体的世界级鞋履制造供应链。'
    : 'From elite carbon-plate supercritical marathon runners and Vibram alpine trail boots to 360° Goodyear welted footwear, powering global brands with biomechanical innovation and craftsmanship.';

  const isDetail = page === 'detail';
  const selectedProduct = isDetail
    ? products.find((p) => p.id === options.productId) || products[0]
    : products[0];

  const defaultMeta = FOOTWEAR_DEFAULT_PRODUCTS[0];
  const pMeta = (selectedProduct as ThemedFootwearItem).midsoleTech
    ? (selectedProduct as ThemedFootwearItem)
    : defaultMeta;

  const headerHtml = `
    <header class="fw-header" style="position:sticky;top:0;z-index:99;background:rgba(10, 15, 29, 0.78);backdrop-filter:blur(24px) saturate(190%);-webkit-backdrop-filter:blur(24px) saturate(190%);border-bottom:1px solid rgba(255,255,255,0.12);box-shadow:0 8px 32px rgba(0,0,0,0.37);">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:74px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg, ${color}, #0ea5e9);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(14,165,233,0.4);border:1px solid rgba(255,255,255,0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 16v-2.38C4 11.5 5.5 9 8 9h8c2.5 0 4 2.5 4 4.62V16M2 20h20M7 20v-4M17 20v-4"></path>
            </svg>
          </div>
          <div>
            <div style="font-size:1.25rem;font-weight:900;letter-spacing:-0.03em;color:#ffffff;line-height:1.1;">
              ${esc(company.name || 'KINETIC CRAFT FOOTWEAR')}
            </div>
            <div style="font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:#38bdf8;font-weight:700;">
              ${isZh ? '先锋鞋履工学制造系统' : 'Biomechanics Footwear Lab'}
            </div>
          </div>
        </a>

        <nav style="display:flex;align-items:center;gap:28px;" class="fw-nav-links">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'home' ? '#38bdf8' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.home)}
          </a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'catalog' ? '#38bdf8' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.catalog)}
          </a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'about' ? '#38bdf8' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.about)}
          </a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.92rem;font-weight:600;color:${page === 'contact' ? '#38bdf8' : '#cbd5e1'};transition:color 0.2s;">
            ${esc(ui.contact)}
          </a>
        </nav>

        <div style="display:flex;align-items:center;gap:12px;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;padding:10px 22px;border-radius:100px;font-size:0.86rem;font-weight:700;color:#ffffff;background:linear-gradient(135deg, ${color}, #0ea5e9);box-shadow:0 4px 18px rgba(14,165,233,0.35);transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;">
            <span>${isZh ? '开发打样询价' : 'Request Prototype'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';

  if (page === 'home') {
    const heroProduct = products[0];
    const heroImg = ctx.productMainImage(heroProduct as Product) || (heroProduct as ThemedFootwearItem).img || '/templates/senseng/products-1.jpg';
    const heroMediaHtml = isVideo
      ? `
        <section data-wr-hero style="position:relative;width:100%;min-height:580px;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.15);background:#020617;display:flex;align-items:center;justify-content:center;">
          <video autoplay muted loop playsinline poster="/templates/senseng/products-1.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.85;filter:contrast(108%) brightness(95%);">
            <source src="/templates/senseng/video-reel.mp4" type="video/mp4">
          </video>
          <div style="position:absolute;inset:0;background:radial-gradient(circle at 75% 30%, rgba(14,165,233,0.25) 0%, transparent 60%), linear-gradient(180deg, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.85) 100%);"></div>
          
          <div style="position:relative;z-index:2;padding:60px 48px;max-width:800px;text-align:left;margin-right:auto;">
            <div style="display:inline-flex;align-items:center;gap:10px;padding:6px 16px;border-radius:100px;background:rgba(14,165,233,0.15);border:1px solid rgba(56,189,248,0.4);backdrop-filter:blur(16px);color:#38bdf8;font-size:0.82rem;font-weight:700;letter-spacing:0.06em;margin-bottom:20px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 10px #38bdf8;animation:pulse 2s infinite;"></span>
              ${isZh ? '85%+ 能量反馈 · 超临界氮气物理发泡' : '85%+ ENERGY RECOVERY · SUPERCRITICAL N2 FOAM'}
            </div>
            <h1 style="font-size:clamp(2.4rem, 4.8vw, 3.8rem);font-weight:900;color:#ffffff;line-height:1.1;letter-spacing:-0.03em;margin:0 0 20px;">
              ${esc(heroTitle)}
            </h1>
            <p style="font-size:1.12rem;line-height:1.75;color:#cbd5e1;margin:0 0 32px;max-width:680px;text-shadow:0 2px 8px rgba(0,0,0,0.5);">
              ${esc(heroSubtitle)}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:16px;">
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="padding:14px 34px;border-radius:100px;background:linear-gradient(135deg, ${color}, #0284c7);color:#ffffff;font-size:1rem;font-weight:700;text-decoration:none;box-shadow:0 6px 24px rgba(14,165,233,0.45);display:inline-flex;align-items:center;gap:10px;">
                <span>${isZh ? '探索鞋履全品类矩阵' : 'Explore Footwear Collection'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="${path('about/index.html')}" ${navAttrs('about')} style="padding:14px 28px;border-radius:100px;background:rgba(255,255,255,0.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.22);color:#ffffff;font-size:0.96rem;font-weight:600;text-decoration:none;">
                ${isZh ? 'SATRA认证实验室与技术实力' : 'SATRA Lab & Engineering'}
              </a>
            </div>
          </div>
        </section>
      `
      : `
        <section data-wr-hero style="position:relative;width:100%;min-height:540px;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.12);background:linear-gradient(135deg, #090d1a 0%, #0f172a 50%, #0369a1 100%);display:flex;align-items:center;padding:50px 48px;">
          <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);background-size:28px 28px;opacity:0.6;"></div>
          <div style="position:absolute;right:-120px;bottom:-120px;width:560px;height:560px;background:radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%);filter:blur(60px);pointer-events:none;"></div>
          
          <div style="position:relative;z-index:2;display:grid;grid-template-columns:1.2fr 0.8fr;gap:40px;align-items:center;width:100%;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:10px;padding:6px 16px;border-radius:100px;background:rgba(14,165,233,0.14);border:1px solid rgba(56,189,248,0.35);backdrop-filter:blur(16px);color:#38bdf8;font-size:0.84rem;font-weight:700;letter-spacing:0.06em;margin-bottom:20px;">
                <span>⚡</span>
                ${isZh ? '先锋工匠与生物力学鞋模系统' : 'BIOMECHANICS & ADVANCED LAST ENGINEERING'}
              </div>
              <h1 style="font-size:clamp(2.3rem, 4.4vw, 3.6rem);font-weight:900;color:#ffffff;line-height:1.12;letter-spacing:-0.03em;margin:0 0 20px;">
                ${esc(heroTitle)}
              </h1>
              <p style="font-size:1.1rem;line-height:1.75;color:#cbd5e1;margin:0 0 32px;max-width:620px;">
                ${esc(heroSubtitle)}
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:16px;">
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="padding:14px 32px;border-radius:100px;background:linear-gradient(135deg, ${color}, #0284c7);color:#ffffff;font-size:0.98rem;font-weight:700;text-decoration:none;box-shadow:0 6px 20px rgba(14,165,233,0.4);display:inline-flex;align-items:center;gap:8px;">
                  <span>${isZh ? '浏览鞋履产品展厅' : 'View Footwear Catalog'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="padding:14px 26px;border-radius:100px;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);color:#ffffff;font-size:0.94rem;font-weight:600;text-decoration:none;">
                  ${isZh ? '预约3D楦头打样' : 'Book 3D Last Sampling'}
                </a>
              </div>
            </div>

            <div style="position:relative;display:flex;justify-content:center;">
              <div style="position:relative;width:100%;max-width:440px;aspect-ratio:1/1;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.22);box-shadow:0 20px 50px rgba(0,0,0,0.6);background:#090e1c;">
                <img src="${safeUrl(heroImg)}" alt="${esc((heroProduct as Product).name || (heroProduct as ThemedFootwearItem).name)}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;" />
                <div style="position:absolute;bottom:0;inset-x:0;padding:24px;background:linear-gradient(to top, rgba(2,6,23,0.92) 0%, transparent 100%);">
                  <div style="font-size:0.8rem;color:#38bdf8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">SATRA Accredited · 100,000 Flex Cycles</div>
                  <div style="font-size:1.15rem;font-weight:800;color:#ffffff;margin-top:4px;">${esc((heroProduct as Product).name || (heroProduct as ThemedFootwearItem).name)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

    // 4 Key Engineering Pillars
    const pillarsHtml = `
      <section style="margin-top:60px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
          <div style="padding:32px 28px;border-radius:20px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 10px 30px rgba(0,0,0,0.25);">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(14,165,233,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:18px;">
              🚀
            </div>
            <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
              ${isZh ? '全掌超临界发泡中底' : 'Supercritical Foam Midsole'}
            </h3>
            <p style="font-size:0.92rem;color:#94a3b8;line-height:1.6;margin:0;">
              ${isZh ? '氮气物理超临界流体微孔发泡技术，密度低至0.11g/cm³，能量回弹突破85%，远超传统EVA衰减寿命。' : 'Physical nitrogen supercritical microcellular foaming with 0.11g/cm³ ultra-low density and 85%+ energy rebound.'}
            </p>
          </div>

          <div style="padding:32px 28px;border-radius:20px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 10px 30px rgba(0,0,0,0.25);">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(56,189,248,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:18px;">
              🛡️
            </div>
            <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
              ${isZh ? '3D曲面碳纤推进板' : '3D Shaped Carbon Plates'}
            </h3>
            <p style="font-size:0.92rem;color:#94a3b8;line-height:1.6;margin:0;">
              ${isZh ? '仿生纵向杠杆与足弓抗扭碳板组合，抗扭转刚度提升40%，为长距离破速冲刺提供稳固滚动助力。' : 'Biomechanical longitudinal lever and arch support carbon plate boosting torsional rigidity by 40%.'}
            </p>
          </div>

          <div style="padding:32px 28px;border-radius:20px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 10px 30px rgba(0,0,0,0.25);">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(14,165,233,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:18px;">
              👞
            </div>
            <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
              ${isZh ? '360°固特异手工沿条缝' : '360° Goodyear Welt Guild'}
            </h3>
            <p style="font-size:0.92rem;color:#94a3b8;line-height:1.6;margin:0;">
              ${isZh ? '经典固特异与布雷克双重缝线工艺，天然软木填充层自适应脚型，实现鞋面与鞋底可无限次换底翻新。' : 'Heritage Goodyear & Blake welt stitching with self-molding natural cork filler beds for lifetime resolability.'}
            </p>
          </div>

          <div style="padding:32px 28px;border-radius:20px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 10px 30px rgba(0,0,0,0.25);">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(56,189,248,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:18px;">
              ⛰️
            </div>
            <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 10px;">
              ${isZh ? 'Vibram® 湿地超强抓地' : 'Vibram® Megagrip Mastery'}
            </h3>
            <p style="font-size:0.92rem;color:#94a3b8;line-height:1.6;margin:0;">
              ${isZh ? '配备Vibram Megagrip配方底与自清洁排泥齿纹，在湿滑岩石与碎石陡坡上提供极致制动信赖。' : 'Equipped with Vibram Megagrip formulations and self-clearing mud lugs for supreme wet rock friction.'}
            </p>
          </div>
        </div>
      </section>
    `;

    // Featured Product Grid
    const featuredList = products.slice(0, 8);
    const productGridHtml = `
      <section style="margin-top:80px;">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="font-size:0.86rem;text-transform:uppercase;color:#38bdf8;font-weight:800;letter-spacing:0.12em;margin-bottom:6px;">
              ${isZh ? '顶级工程鞋履系列' : 'ENGINEERED FOOTWEAR COLLECTION'}
            </div>
            <h2 style="font-size:2.2rem;font-weight:900;color:#ffffff;margin:0;">
              ${isZh ? '专业运动、户外机能与工匠皮鞋' : 'Performance Sport, Trail & Heritage Shoes'}
            </h2>
          </div>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#38bdf8;text-decoration:none;font-size:0.96rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;">
            <span>${isZh ? '查看全部款式与规格' : 'View Full Catalog'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
          ${featuredList
            .map((item, idx) => {
              const p = item as ThemedFootwearItem;
              const imgUrl = ctx.productMainImage(item as Product) || p.img || `/templates/senseng/products-${(idx % 8) + 1}.jpg`;
              const name = (item as Product).name || p.name;
              const desc = (item as Product).description || p.desc;
              const badge = p.badge || (isZh ? '先锋鞋履' : 'Craft Footwear');
              const midsole = p.midsoleTech || (isZh ? '超临界氮气物理发泡中底' : 'Supercritical Nitrogen Foam');
              const moq = p.moq || '300 Pairs MOQ';

              return `
                <div class="fw-card" style="border-radius:20px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(20px);box-shadow:0 12px 36px rgba(0,0,0,0.3);display:flex;flex-direction:column;transition:transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;">
                  <div style="position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:#090e1c;">
                    <img src="${safeUrl(imgUrl)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;" />
                    <span style="position:absolute;top:14px;left:14px;padding:4px 12px;border-radius:100px;font-size:0.75rem;font-weight:700;background:rgba(2,6,23,0.75);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);color:#38bdf8;">
                      ${esc(badge)}
                    </span>
                    <span style="position:absolute;bottom:14px;right:14px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:600;background:rgba(14,165,233,0.2);border:1px solid rgba(56,189,248,0.4);color:#ffffff;">
                      ${esc(moq)}
                    </span>
                  </div>

                  <div style="padding:22px;display:flex;flex-direction:column;flex-grow:1;">
                    <h3 style="font-size:1.12rem;font-weight:800;color:#ffffff;margin:0 0 8px;line-height:1.3;">
                      ${esc(name)}
                    </h3>
                    <p style="font-size:0.86rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;flex-grow:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                      ${esc(desc)}
                    </p>

                    <div style="padding:10px 12px;background:rgba(0,0,0,0.25);border-radius:10px;border:1px solid rgba(255,255,255,0.06);margin-bottom:16px;font-size:0.78rem;color:#cbd5e1;line-height:1.4;">
                      <strong style="color:#38bdf8;">${isZh ? '中底架构' : 'Midsole'}:</strong> ${esc(midsole)}
                    </div>

                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;text-align:center;padding:10px;border-radius:10px;background:rgba(14,165,233,0.12);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:0.86rem;font-weight:700;text-decoration:none;transition:all 0.2s ease;">
                      ${isZh ? '查看工艺细节与打样' : 'Technical Specifications'} →
                    </a>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </section>
    `;

    // Biomechanical Lab & Quality Assurance Banner
    const labBannerHtml = `
      <section style="margin-top:80px;border-radius:24px;overflow:hidden;background:linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(2,6,23,0.85) 100%);border:1px solid rgba(56,189,248,0.3);padding:48px;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;">
        <div>
          <div style="font-size:0.86rem;color:#38bdf8;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">
            ${isZh ? 'SATRA 国际认证鞋类实验室' : 'SATRA ACCREDITED FOOTWEAR TESTING'}
          </div>
          <h2 style="font-size:2rem;font-weight:900;color:#ffffff;margin:0 0 16px;line-height:1.2;">
            ${isZh ? '严苛力学测试与百道质检关卡' : '100,000 Flex Cycles & Zero-Defect Inspection'}
          </h2>
          <p style="font-size:0.96rem;color:#cbd5e1;line-height:1.7;margin:0 0 24px;">
            ${isZh ? '自建标准化生物力学足底压力测定仪、全鞋底耐折试验机、动态防水测试仪与橡胶阿克隆耐磨机。出厂鞋履100%符合欧盟REACH环保检测、美国ASTM防滑与SATRA高强度竞技标准。' : 'Equipped with in-house dynamic footbed pressure sensor arrays, SATRA flex test chambers, dynamic water submersion testers, and abrasion wheels ensuring full compliance with EU REACH and ASTM standards.'}
          </p>
          <div style="display:flex;gap:28px;flex-wrap:wrap;">
            <div>
              <div style="font-size:1.8rem;font-weight:900;color:#38bdf8;">100,000+</div>
              <div style="font-size:0.8rem;color:#94a3b8;">${isZh ? '鞋底曲折不裂口测试' : 'Sole Flexing Cycles'}</div>
            </div>
            <div>
              <div style="font-size:1.8rem;font-weight:900;color:#38bdf8;">85%+</div>
              <div style="font-size:0.8rem;color:#94a3b8;">${isZh ? '超临界微孔发泡回弹率' : 'Supercritical Rebound'}</div>
            </div>
            <div>
              <div style="font-size:1.8rem;font-weight:900;color:#38bdf8;">7-10 Days</div>
              <div style="font-size:0.8rem;color:#94a3b8;">${isZh ? '3D楦头打样交期' : '3D Last Prototyping'}</div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="padding:20px;border-radius:16px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.2rem;margin-bottom:8px;">🔬</div>
            <div style="font-weight:800;color:#ffffff;font-size:0.92rem;margin-bottom:4px;">${isZh ? '3D激光足型扫描' : '3D Laser Foot Scanning'}</div>
            <div style="font-size:0.8rem;color:#94a3b8;">${isZh ? '亚洲/欧美专业楦头数据库' : 'Global Anatomic Last Database'}</div>
          </div>
          <div style="padding:20px;border-radius:16px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.2rem;margin-bottom:8px;">⚙️</div>
            <div style="font-weight:800;color:#ffffff;font-size:0.92rem;margin-bottom:4px;">${isZh ? 'DESMA全自动连帮注塑' : 'DESMA Direct Soling'}</div>
            <div style="font-size:0.8rem;color:#94a3b8;">${isZh ? '无需胶水无缝牢固熔接' : 'Glueless Polyurethane Bonding'}</div>
          </div>
          <div style="padding:20px;border-radius:16px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.2rem;margin-bottom:8px;">🌱</div>
            <div style="font-weight:800;color:#ffffff;font-size:0.92rem;margin-bottom:4px;">${isZh ? '可持续环保生物基' : 'Bio-Circular Materials'}</div>
            <div style="font-size:0.8rem;color:#94a3b8;">${isZh ? '蓖麻油基发泡与再生橡胶' : 'Castor-Oil & Recycled Rubber'}</div>
          </div>
          <div style="padding:20px;border-radius:16px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.2rem;margin-bottom:8px;">📦</div>
            <div style="font-weight:800;color:#ffffff;font-size:0.92rem;margin-bottom:4px;">${isZh ? '品牌高定定制包装' : 'Custom Brand Packaging'}</div>
            <div style="font-size:0.8rem;color:#94a3b8;">${isZh ? '环保防震鞋盒与布袋标牌' : 'FSC Rigid Boxes & Dustbags'}</div>
          </div>
        </div>
      </section>
    `;

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        ${heroMediaHtml}
        ${pillarsHtml}
        ${productGridHtml}
        ${labBannerHtml}
      </main>
    `;
  } else if (page === 'catalog') {
    // Catalog page with category pills and full grid
    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="text-align:center;max-width:760px;margin:0 auto 48px;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(14,165,233,0.12);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
            ${isZh ? '鞋履产品全景矩阵' : 'ENGINEERED FOOTWEAR CATALOG'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#ffffff;line-height:1.15;margin:0 0 16px;">
            ${isZh ? '先锋竞速 · 户外越野 · 经典手工皮鞋' : 'Performance Racing, Alpine Trail & Heritage Leather'}
          </h1>
          <p style="font-size:1.05rem;line-height:1.7;color:#94a3b8;margin:0;">
            ${isZh ? '精选8大核心鞋履品类，支持小批量快反柔性定制打样与百万级规模化稳定出海大货制造。' : 'Browse our high-performance athletic, rugged outdoor, and bespoke Goodyear welted footwear ready for global export.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:28px;">
          ${products
            .map((item, idx) => {
              const p = item as ThemedFootwearItem;
              const imgUrl = ctx.productMainImage(item as Product) || p.img || `/templates/senseng/products-${(idx % 8) + 1}.jpg`;
              const name = (item as Product).name || p.name;
              const desc = (item as Product).description || p.desc;
              const badge = p.badge || (isZh ? '顶级鞋履' : 'Premium Footwear');
              const midsole = p.midsoleTech || (isZh ? '超临界氮气微孔发泡' : 'Supercritical Nitrogen Foam');
              const upper = p.upperMaterial || (isZh ? '透视单丝复合透气鞋面' : 'Monofilament Engineered Mesh');
              const grip = p.outsoleGrip || (isZh ? '高耐磨防滑橡胶大底' : 'High-Traction Rubber Sole');
              const moq = p.moq || '300 Pairs MOQ';

              return `
                <div class="fw-card" style="border-radius:20px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(20px);box-shadow:0 12px 36px rgba(0,0,0,0.3);display:flex;flex-direction:column;">
                  <div style="position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:#090e1c;">
                    <img src="${safeUrl(imgUrl)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />
                    <span style="position:absolute;top:14px;left:14px;padding:4px 12px;border-radius:100px;font-size:0.75rem;font-weight:700;background:rgba(2,6,23,0.75);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);color:#38bdf8;">
                      ${esc(badge)}
                    </span>
                    <span style="position:absolute;bottom:14px;right:14px;padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:600;background:rgba(14,165,233,0.2);border:1px solid rgba(56,189,248,0.4);color:#ffffff;">
                      ${esc(moq)}
                    </span>
                  </div>

                  <div style="padding:22px;display:flex;flex-direction:column;flex-grow:1;">
                    <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 8px;">
                      ${esc(name)}
                    </h3>
                    <p style="font-size:0.86rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;flex-grow:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                      ${esc(desc)}
                    </p>

                    <div style="display:grid;gap:6px;font-size:0.76rem;color:#cbd5e1;background:rgba(0,0,0,0.25);border-radius:10px;padding:10px 12px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.06);">
                      <div><strong style="color:#38bdf8;">${isZh ? '中底' : 'Midsole'}:</strong> ${esc(midsole)}</div>
                      <div><strong style="color:#38bdf8;">${isZh ? '鞋面' : 'Upper'}:</strong> ${esc(upper)}</div>
                      <div><strong style="color:#38bdf8;">${isZh ? '大底' : 'Outsole'}:</strong> ${esc(grip)}</div>
                    </div>

                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;text-align:center;padding:10px;border-radius:10px;background:linear-gradient(135deg, ${color}, #0284c7);color:#ffffff;font-size:0.86rem;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(14,165,233,0.35);">
                      ${isZh ? '申请样品与定制规格' : 'Request Sample & Specs'} →
                    </a>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </main>
    `;
  } else if (page === 'detail') {
    // Detail page with deep footwear specifications
    const p = selectedProduct as ThemedFootwearItem;
    const name = (selectedProduct as Product).name || p.name;
    const desc = (selectedProduct as Product).description || p.desc;
    const imgUrl = (selectedProduct as ThemedFootwearItem).img || ctx.productMainImage(selectedProduct as Product) || '/templates/senseng/products-1.jpg';
    const midsole = p.midsoleTech || pMeta.midsoleTech;
    const upper = p.upperMaterial || pMeta.upperMaterial;
    const grip = p.outsoleGrip || pMeta.outsoleGrip;
    const drop = p.dropStack || pMeta.dropStack;
    const moq = p.moq || '300 Pairs';
    const tagline = p.tagline || 'Engineered for Performance & Biomechanical Excellence';

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <nav style="margin-bottom:28px;font-size:0.88rem;color:#64748b;display:flex;align-items:center;gap:8px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;color:#94a3b8;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:#94a3b8;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#ffffff;font-weight:700;">${esc(name)}</span>
        </nav>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;">
          <!-- Product Visuals -->
          <div>
            <div style="border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.15);box-shadow:0 20px 50px rgba(0,0,0,0.5);background:#090e1c;">
              <img id="wr-detail-main-img" src="${safeUrl(imgUrl)}" alt="${esc(name)}" style="width:100%;aspect-ratio:1/1;object-fit:cover;" />
            </div>
          </div>

          <!-- Product Technical Info & Inquiries -->
          <div>
            <div style="display:inline-block;padding:4px 14px;border-radius:100px;font-size:0.8rem;font-weight:700;background:rgba(14,165,233,0.15);border:1px solid rgba(56,189,248,0.4);color:#38bdf8;margin-bottom:12px;">
              ${isZh ? '专业鞋履研发规格书' : 'FOOTWEAR SPECIFICATION SHEET'}
            </div>
            <h1 style="font-size:clamp(2rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 12px;">
              ${esc(name)}
            </h1>
            <p style="font-size:1.05rem;color:#38bdf8;font-weight:600;margin:0 0 20px;">
              ✦ ${esc(tagline)}
            </p>
            <p style="font-size:0.96rem;line-height:1.7;color:#94a3b8;margin:0 0 28px;">
              ${esc(desc)}
            </p>

            <!-- Specification Cards -->
            <div style="display:grid;gap:14px;margin-bottom:32px;">
              <div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:0.78rem;text-transform:uppercase;color:#38bdf8;font-weight:800;letter-spacing:0.08em;margin-bottom:4px;">
                  ${isZh ? '中底科技与发泡密度' : 'Midsole Tech & Foam Density'}
                </div>
                <div style="font-size:0.92rem;color:#ffffff;font-weight:600;">
                  ${esc(midsole)}
                </div>
              </div>

              <div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:0.78rem;text-transform:uppercase;color:#38bdf8;font-weight:800;letter-spacing:0.08em;margin-bottom:4px;">
                  ${isZh ? '鞋面材质与透气织造' : 'Upper Materials & Weaving'}
                </div>
                <div style="font-size:0.92rem;color:#ffffff;font-weight:600;">
                  ${esc(upper)}
                </div>
              </div>

              <div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:0.78rem;text-transform:uppercase;color:#38bdf8;font-weight:800;letter-spacing:0.08em;margin-bottom:4px;">
                  ${isZh ? '大底橡胶与抓地底纹' : 'Outsole Compound & Lug Pattern'}
                </div>
                <div style="font-size:0.92rem;color:#ffffff;font-weight:600;">
                  ${esc(grip)}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
                  <div style="font-size:0.78rem;text-transform:uppercase;color:#38bdf8;font-weight:800;letter-spacing:0.08em;margin-bottom:4px;">
                    ${isZh ? '前后掌落差与重量' : 'Drop & Stack Height'}
                  </div>
                  <div style="font-size:0.86rem;color:#ffffff;font-weight:600;">
                    ${esc(drop)}
                  </div>
                </div>
                <div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
                  <div style="font-size:0.78rem;text-transform:uppercase;color:#38bdf8;font-weight:800;letter-spacing:0.08em;margin-bottom:4px;">
                    ${isZh ? '起订量要求' : 'Production MOQ'}
                  </div>
                  <div style="font-size:0.86rem;color:#ffffff;font-weight:600;">
                    ${esc(moq)}
                  </div>
                </div>
              </div>
            </div>

            <!-- Inquiry CTA Form Box -->
            <div style="padding:28px;border-radius:20px;background:linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(2,6,23,0.7) 100%);border:1px solid rgba(56,189,248,0.3);box-shadow:0 12px 30px rgba(0,0,0,0.3);">
              <h3 style="font-size:1.15rem;font-weight:800;color:#ffffff;margin:0 0 8px;">
                ${isZh ? '立即申请实物鞋样与ODM打样' : 'Request Prototype & OEM/ODM Quotation'}
              </h3>
              <p style="font-size:0.84rem;color:#94a3b8;margin:0 0 16px;">
                ${isZh ? '7天出楦头试穿版，支持专属品牌鞋垫烫金、鞋舌织唛、外底模具开模与定制包装。' : '7-day physical fit sample delivery. Support custom last adjustments, brand molding, and full private packaging.'}
              </p>
              <form action="${path('contact/index.html')}" method="GET" style="display:flex;flex-direction:column;gap:12px;">
                <input type="hidden" name="productId" value="${esc(selectedProduct.id)}" />
                <input type="email" placeholder="${isZh ? '输入您的企业采购邮箱' : 'Enter your corporate business email'}" required style="padding:12px 18px;border-radius:10px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.18);color:#ffffff;font-size:0.9rem;outline:none;" />
                <button type="submit" style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #0284c7);color:#ffffff;font-size:0.96rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(14,165,233,0.4);">
                  ${isZh ? '提交鞋样打样需求单' : 'Submit Sample Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'about') {
    // About page with rich footwear manufacturing details
    const aboutHeadline = getAboutHeadline(company, isZh ? '20年力学专注 · 打造世界级鞋履制造航母' : '20 Years of Biomechanical Footwear Manufacturing');
    const paragraphs = getAboutStoryParagraphs(company, draft.copy[ctx.lang]?.about || '');
    const highlights = parseAboutHighlights(company.aboutHighlights, [
      { value: company.establishedYear || '2004', num: parseInt(company.establishedYear || '2004', 10), label: isZh ? '创办年份' : 'Established', desc: 'Craftsmanship heritage' },
      { value: '6M Pairs', num: 6000000, suffix: ' Pairs', label: isZh ? '双年出货产能' : 'Annual Capacity', desc: 'Precision shoemaking' },
      { value: '85%+', num: 85, suffix: '%+', label: isZh ? '能量回弹率突破' : 'Max Kinetic Energy Return', desc: 'Supercritical foaming' },
      { value: '7 Days', num: 7, suffix: ' Days', label: isZh ? '首件实物鞋楦快速交付' : 'Rapid Physical Fit Sample', desc: 'SATRA lab standard' },
    ]);
    const { primary: primaryImage } = getAboutImages(ctx, path('assets/about-reference.jpg'), '');

    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:800px;margin:0 auto 60px;text-align:center;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(14,165,233,0.12);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
            ${isZh ? '关于我们的鞋履工学制造' : 'ABOUT KINETIC FOOTWEAR GUILD'}
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
              <div style="font-size:2.8rem;font-weight:900;color:#38bdf8;line-height:1;"><span>${esc(h.value)}</span></div>
              <div style="font-size:0.86rem;color:#94a3b8;margin-top:10px;font-weight:600;">${esc(h.label)}</div>
              ${h.desc ? `<div style="font-size:0.8rem;color:#64748b;margin-top:4px;">${esc(h.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Factory Imagery -->
        <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:60px;">
          <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:460px;object-fit:cover;display:block;" loading="lazy">
        </div>

        <!-- Factory Imagery & Certifications -->
        <div style="border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:40px;">
          <h2 style="font-size:1.6rem;font-weight:900;color:#ffffff;margin:0 0 24px;text-align:center;">
            ${isZh ? '全球鞋业严苛资质与社会责任认证' : 'Global Certifications & Manufacturing Standards'}
          </h2>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:24px;font-size:0.9rem;color:#cbd5e1;">
            <div style="padding:12px 20px;border-radius:100px;background:rgba(14,165,233,0.1);border:1px solid rgba(56,189,248,0.3);display:flex;align-items:center;gap:8px;">
              <span>🏆</span> SATRA Member & Testing Facility
            </div>
            <div style="padding:12px 20px;border-radius:100px;background:rgba(14,165,233,0.1);border:1px solid rgba(56,189,248,0.3);display:flex;align-items:center;gap:8px;">
              <span>🌱</span> ISO 14001 Environmental System
            </div>
            <div style="padding:12px 20px;border-radius:100px;background:rgba(14,165,233,0.1);border:1px solid rgba(56,189,248,0.3);display:flex;align-items:center;gap:8px;">
              <span>🛡️</span> ASTM F2913 Slip Resistance Certified
            </div>
            <div style="padding:12px 20px;border-radius:100px;background:rgba(14,165,233,0.1);border:1px solid rgba(56,189,248,0.3);display:flex;align-items:center;gap:8px;">
              <span>🤝</span> BSCI & SMETA Social Compliance
            </div>
          </div>
        </div>
      </main>
    `;
  } else if (page === 'contact') {
    // Contact page for Footwear OEM/ODM and last prototyping
    mainHtml = `
      <main class="wrap" style="padding-top:40px;padding-bottom:100px;">
        <div style="max-width:760px;margin:0 auto 48px;text-align:center;">
          <div style="display:inline-block;padding:4px 16px;border-radius:100px;background:rgba(14,165,233,0.12);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">
            ${isZh ? '商务与鞋模打样对接' : 'START FOOTWEAR PRODUCTION'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 16px;">
            ${isZh ? '启动您的专属鞋履研发与出海制造' : 'Connect with Our Footwear Engineers'}
          </h1>
          <p style="font-size:1.05rem;line-height:1.7;color:#94a3b8;margin:0;">
            ${isZh ? '提供技术图纸、3D楦头文件或样鞋需求，我们的资深鞋履工程团队将在24小时内为您提供模具开模评估与阶梯报价。' : 'Submit your tech pack, last files, or sample requirements. Our master engineers respond within 24 hours.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;">
          <!-- Contact Info -->
          <div style="padding:36px;border-radius:24px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);">
            <h3 style="font-size:1.3rem;font-weight:800;color:#ffffff;margin:0 0 24px;">
              ${isZh ? '全球鞋业运营中心' : 'Global Footwear Hub'}
            </h3>

            <div style="display:grid;gap:20px;font-size:0.95rem;color:#cbd5e1;">
              <div>
                <strong style="color:#38bdf8;display:block;font-size:0.8rem;text-transform:uppercase;margin-bottom:4px;">Email:</strong>
                <a href="mailto:${esc(company.email)}" style="color:#ffffff;text-decoration:none;">${esc(company.email)}</a>
              </div>

              ${company.phone ? `
                <div>
                  <strong style="color:#38bdf8;display:block;font-size:0.8rem;text-transform:uppercase;margin-bottom:4px;">Phone:</strong>
                  <span style="color:#ffffff;">${esc(company.phone)}</span>
                </div>
              ` : ''}

              ${company.address ? `
                <div>
                  <strong style="color:#38bdf8;display:block;font-size:0.8rem;text-transform:uppercase;margin-bottom:4px;">Factory Address:</strong>
                  <span style="color:#ffffff;line-height:1.5;">${esc(company.address)}</span>
                </div>
              ` : ''}
            </div>

            <div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);font-size:0.84rem;color:#94a3b8;line-height:1.6;">
              <strong style="color:#ffffff;">${isZh ? '打样与大货周期承诺' : 'Turnaround Guarantees'}:</strong><br>
              • ${isZh ? '3D楦头打样：7-10 工作日' : '3D Last Sampling: 7-10 Days'}<br>
              • ${isZh ? '模具快速雕刻开模：15-20 工作日' : 'Rapid Tooling & Mold Opening: 15-20 Days'}<br>
              • ${isZh ? '批量大货交付：30-45 工作日' : 'Bulk Production: 30-45 Days'}
            </div>
          </div>

          <!-- Contact Form -->
          <div style="padding:36px;border-radius:24px;background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);">
            <h3 style="font-size:1.3rem;font-weight:800;color:#ffffff;margin:0 0 20px;">
              ${isZh ? '填写采购与打样需求' : 'Submit Footwear Request'}
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
                <label style="display:block;font-size:0.82rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">${isZh ? '意向鞋履产品' : 'Interested Product'} (${esc(ui.optional)})</label>
                <select name="productId" style="width:100%;padding:12px 16px;border-radius:10px;background:#0f172a;border:1px solid rgba(255,255,255,0.12);color:#ffffff;font-size:0.9rem;box-sizing:border-box;">
                  <option value="">— ${isZh ? '选择感兴趣的鞋履产品' : 'Select Product of Interest'} —</option>
                  ${draft.products.map((item) => `<option value="${esc(item.id)}"${item.id === ctx.options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label style="display:block;font-size:0.82rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">${isZh ? '项目说明与技术要求' : 'Project Details & Specifications'} *</label>
                <textarea name="message" required maxlength="5000" rows="4" placeholder="${isZh ? '请描述鞋面织法、中底回弹要求、测试标准或目标售价区间...' : 'Describe upper materials, midsole rebound targets, testing protocols...'}" style="width:100%;padding:12px 16px;border-radius:10px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.12);color:#ffffff;font-size:0.9rem;resize:vertical;box-sizing:border-box;"></textarea>
              </div>

              <div class="honeypot" aria-hidden="true" style="display:none;"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>

              <button type="submit" class="button"${ctx.options.preview ? ' disabled' : ''} style="padding:14px;border-radius:10px;background:linear-gradient(135deg, ${color}, #0284c7);color:#ffffff;font-size:1rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(14,165,233,0.4);transition:all 0.2s ease;">
                ${isZh ? '发送鞋履定制询盘' : 'Send Footwear Inquiry'}
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
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg, ${color}, #0ea5e9);display:flex;align-items:center;justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2">
                <path d="M4 16v-2.38C4 11.5 5.5 9 8 9h8c2.5 0 4 2.5 4 4.62V16M2 20h20M7 20v-4M17 20v-4"></path>
              </svg>
            </div>
            <span style="font-size:1.15rem;font-weight:900;color:#ffffff;">${esc(company.name || 'KINETIC FOOTWEAR')}</span>
          </div>
          <p style="font-size:0.86rem;line-height:1.6;color:#64748b;margin:0 0 16px;max-width:320px;">
            ${isZh ? '生物力学工学鞋模实验室 · 超临界物理发泡 · 固特异手工沿条缝全链制造出口基地' : 'Biomechanics Footwear Lab & Advanced Supercritical Foaming Global Supply Chain'}
          </p>
          <div style="font-size:0.8rem;color:#38bdf8;font-weight:700;">SATRA · ASTM F2913 · ISO 14001 · REACH Certified</div>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '先锋碳板竞速跑鞋' : 'Carbon Marathon Racers'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? 'Vibram 抓地户外越野靴' : 'Vibram Alpine Trail Boots'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '固特异手工正装皮鞋' : 'Goodyear Welted Shoes'}</a></li>
            <li><a style="text-decoration:none;color:#cbd5e1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '超临界高弹恢复拖鞋' : 'Supercritical Slides'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${isZh ? '核心力学工艺' : 'Core Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;">
            <li>✓ ${isZh ? '6,000,000双 年综合产能' : '6,000,000 Pairs Annual Capacity'}</li>
            <li>✓ ${isZh ? '85%+ 超临界回弹物理发泡' : '85%+ Energy Recovery Foam'}</li>
            <li>✓ ${isZh ? '7-10天 快速3D楦头打样' : '7-10 Day Rapid Prototyping'}</li>
            <li>✓ ${isZh ? 'SATRA 100,000次耐曲折认证' : 'SATRA 100,000 Flex Tested'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a style="color:#38bdf8;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="margin:0;font-size:0.82rem;color:#64748b;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #111827;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#64748b;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>✦ ${isZh ? '高端鞋履工程与先锋工匠出海供应链旗舰版' : 'Footwear & Craft Global Trade Edition'}</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
