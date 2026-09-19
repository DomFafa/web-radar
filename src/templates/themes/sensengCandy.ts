import type { Product } from '../../shared/model';
import { bannerLink, selectedBanner } from '../../shared/banner-config';
import { esc, safeUrl, type ThemeContext } from './types';
import { isTypedMaterialsSource } from '../materials-typed';
import { parseAboutHighlights, getAboutStoryParagraphs, getAboutHeadline, getAboutImages } from './aboutHelper';

export const CANDY_DEFAULT_PRODUCTS = [
  {
    name: 'Shiba Inu Crunchy Soft-Fill Squishy',
    nameZh: '柴犬爆珠软充慢回弹捏捏乐',
    desc: 'Bestselling sensory squishy featuring an adorable Shiba Inu character filled with patented micro-crunchy beads. Delivers deeply satisfying tactile feedback for stress relief and sensory calming.',
    descZh: '爆款萌宠感官捏捏乐，可爱柴犬造型搭配专利微爆珠软充，揉捏手感酥脆解压，带来极度治愈的触觉反馈与情绪抚慰。',
    badge: 'Crunchy Beads · 爆珠手感',
    material: 'Food-Grade Non-Toxic TPR & Elastic Beads',
    materialZh: '食品级环保无毒 TPR + 高弹微爆珠',
    dimensions: '8.5 × 8.5 × 9.0 cm',
    tagline: 'A Satisfying Squeeze Every Time!',
    img: '/templates/senseng/products-1.jpg',
    category: 'kids',
  },
  {
    name: 'Playful Kitten Kids Squishy Pack',
    nameZh: '萌萌小黄猫儿童触觉玩具包',
    desc: 'Delightful pastel yellow kitten designed specifically for little hands. Ultra-soft slow rebound memory foam promotes fine motor skills, emotional calm, and imaginative play.',
    descZh: '专为儿童小手设计的柔嫩马卡龙黄小猫捏捏乐，超慢回弹触感，锻炼手指精细运动抓握力，陪伴孩子快乐每一天。',
    badge: 'Kids Play · 萌宠乐园',
    material: 'High-Elastic Eco-PU Foam (BPA-Free)',
    materialZh: '高弹环保记忆发泡（不含双酚A）',
    dimensions: '8.0 × 8.0 × 7.5 cm',
    tagline: 'Soft Squishy Fun! A Happier Day!',
    img: '/templates/senseng/products-2.jpg',
    category: 'kids',
  },
  {
    name: 'Calm Penguin Adult Desk Companion',
    nameZh: '深蓝企鹅工位静心减压伴侣',
    desc: 'Ergonomically shaped desk squishy with calm slate-blue accents. Designed for modern workstations to relieve keyboard fatigue, improve focus, and bring quiet serenity to busy workdays.',
    descZh: '专为现代办公工位打造的深蓝小企鹅减压伴侣，缓解打字与鼠标手肌腱疲劳，舒缓工作焦虑，提升专注与内心宁静。',
    badge: 'Desk Calm · 工位治愈',
    material: 'Sensory Velvet-Touch Silicone / TPR',
    materialZh: '丝绒肤感亲肤硅胶 / 环保 TPR',
    dimensions: '8.5 × 8.0 × 9.5 cm',
    tagline: 'Squeeze Focus Feel Calmer',
    img: '/templates/senseng/products-3.jpg',
    category: 'adults',
  },
  {
    name: 'Creamy Kitten Adult Stress Relief Pack',
    nameZh: '奶黄猫咪职场减压礼盒包',
    desc: 'Soft cream-toned feline stress companion in presentation paperboard gift box. Features slow 5-second rebound to lower heart rate and soothe workday anxiety during long conference calls.',
    descZh: '奶黄色治愈猫咪职场减压公仔，配备精致环保彩盒包装，5秒超慢回弹节奏，助你在漫长会议与高压工作中找回呼吸节奏。',
    badge: 'Focus & Breathe · 舒缓减压',
    material: 'Eco-Friendly Memory TPR Foam',
    materialZh: '环保慢回弹记忆聚合物',
    dimensions: '8.2 × 8.2 × 8.0 cm',
    tagline: 'A Little Calm For Your Busy Day',
    img: '/templates/senseng/products-4.jpg',
    category: 'adults',
  },
  {
    name: 'Zen Bicolor Kitty Desk Squishy',
    nameZh: '灰白双色微笑猫工位萌宠',
    desc: 'Minimalist grey-and-white smiling kitty desk companion. Durable double-sealed skin withstands 20,000+ squeezes without tearing, leaking, or losing its cute smile.',
    descZh: '极简灰白配色微笑猫咪，双层加固密封工艺，历经 20,000 次暴力揉捏拉伸不破不漏，经久耐用，常伴左右。',
    badge: 'Durable Squeeze · 耐揉耐捏',
    material: 'High-Tensile Food-Grade Polymer',
    materialZh: '高抗撕拉食品级弹性聚合物',
    dimensions: '8.5 × 8.5 × 8.5 cm',
    tagline: 'A Calm Moment At Your Desk',
    img: '/templates/senseng/products-5.jpg',
    category: 'adults',
  },
  {
    name: 'Magical Narwhal Color-Changing Squishy',
    nameZh: '奇幻独角鲸温感变色软充捏捏乐',
    desc: 'Fascinating thermochromic squishy that shifts between pastel lilac, celestial sky blue, and candy pink with the warmth of your hands. Filled with cloud-soft micro-beads.',
    descZh: '黑科技温感渐变变色独角鲸，双手体温轻抚即在淡紫、天蓝与蜜桃粉间梦幻流转，内置云感柔软微珠，奇幻感官体验。',
    badge: 'Thermo-Color Shift · 温感变色',
    material: 'Thermo-Sensitive Eco TPR & Pearl Fill',
    materialZh: '温敏变色环保 TPR + 珍珠微珠充填',
    dimensions: '9.5 × 7.5 × 8.0 cm',
    tagline: 'Color-Changing Soft-Fill Magic',
    img: '/templates/senseng/products-6.jpg',
    category: 'magic',
  },
  {
    name: 'Star Cuddle Kitten Kids Squishy',
    nameZh: '抱星白猫儿童益智抚慰公仔',
    desc: 'Adorable white kitty lovingly hugging a glowing yellow star. Gentle candy fragrance with zero chemical odor; certified under EN71 and ASTM F963 safety standards.',
    descZh: '怀抱闪亮小黄星的纯白萌猫，淡淡微甜果香，零化学异味，通过欧盟 EN71 与美标 ASTM F963 严苛儿童玩具认证。',
    badge: 'Child Safe · 环保无毒',
    material: 'Non-Toxic Hypoallergenic TPR',
    materialZh: '低敏无毒环保食品级材料',
    dimensions: '8.0 × 8.0 × 8.5 cm',
    tagline: 'Small Squish Big Smiles',
    img: '/templates/senseng/products-7.jpg',
    category: 'kids',
  },
  {
    name: 'Heart Hug Kitty Deluxe Gift Squishy',
    nameZh: '爱心猫咪全龄伴手礼盒捏捏乐',
    desc: 'Heartwarming kitten holding a coral pink heart in collectible pastel gift packaging. The perfect birthday favor, classroom reward, or thoughtful wellness gift for all ages.',
    descZh: '手抱珊瑚粉爱心的暖萌小猫，配备礼品级精致彩盒，无论是儿童生日派对伴手礼还是成人治愈赠礼，都是传递快乐的最佳选择。',
    badge: 'Deluxe Gift · 暖心伴手礼',
    material: 'Super-Soft Velvet TPR',
    materialZh: '特调亲肤丝绒触感软胶',
    dimensions: '8.5 × 8.0 × 9.0 cm',
    tagline: 'A Little Happiness For Everyone',
    img: '/templates/senseng/products-8.jpg',
    category: 'gift',
  },
];

export function getCandyProducts(ctx: ThemeContext) {
  const { draft, translateProduct } = ctx;
  if(isTypedMaterialsSource(draft))return draft.products.map(p=>({id:p.id,name:translateProduct(p).name,desc:translateProduct(p).description,badge:'',material:p.material||'',dimensions:p.dimensions||'',tagline:p.tagline||'',category:'',img:ctx.productMainImage(p)}));
  const isZh = (ctx.lang as string) === 'zh';
  if (!draft.products || draft.products.length === 0) {
    return CANDY_DEFAULT_PRODUCTS.map((def, idx) => ({
      id: `p-${idx + 1}`,
      name: isZh ? def.nameZh : def.name,
      desc: isZh ? def.descZh : def.desc,
      badge: def.badge,
      material: isZh ? def.materialZh : def.material,
      dimensions: def.dimensions,
      tagline: def.tagline,
      category: def.category,
      img: def.img,
    }));
  }
  const userProducts = draft.products.map((p, idx) => {
    const def = CANDY_DEFAULT_PRODUCTS[idx % CANDY_DEFAULT_PRODUCTS.length];
    const t = translateProduct(p);
    const hasCustomName = p.name && !p.name.startsWith('产品') && !p.name.startsWith('Product') && p.name !== 'Oak form';
    return {
      id: p.id,
      name: hasCustomName ? t.name : (isZh ? def.nameZh : def.name),
      desc: p.description ? t.description : (isZh ? def.descZh : def.desc),
      badge: def.badge,
      material: p.material || (isZh ? def.materialZh : def.material),
      dimensions: p.dimensions || def.dimensions,
      tagline: def.tagline,
      category: def.category,
      img: ctx.productMainImage(p) || def.img,
    };
  });

  // If project has fewer than 8 products, pad with demo products for a rich catalog showcase
  if (userProducts.length < 8) {
    const padCount = 8 - userProducts.length;
    for (let i = 0; i < padCount; i++) {
      const defIdx = (userProducts.length + i) % CANDY_DEFAULT_PRODUCTS.length;
      const def = CANDY_DEFAULT_PRODUCTS[defIdx];
      userProducts.push({
        id: `demo-${defIdx + 1}`,
        name: isZh ? def.nameZh : def.name,
        desc: isZh ? def.descZh : def.desc,
        badge: def.badge,
        material: isZh ? def.materialZh : def.material,
        dimensions: def.dimensions,
        tagline: def.tagline,
        category: def.category,
        img: def.img,
      });
    }
  }

  return userProducts;
}

export function renderCandyHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const heroProduct = products[0] || {
    id: 'p1',
    name: 'Sensory Squishy Toy',
    desc: 'BPA-free sensory squeeze toy.',
    badge: 'Child Safe',
    material: 'Food-Grade TPR',
    dimensions: '8.5 × 6.5 cm',
    tagline: 'Pure Joy',
    category: 'sensory',
    img: '/templates/senseng/products-1.jpg',
  };

  const copy = draft.copy[ctx.lang] ?? {
    headline: isZh ? '每一捏，都是满满童趣与治愈笑容' : 'Soft, Squishy Smiles for Every Little Hand',
    subtitle: isZh
      ? '采用 100% 食品级安全环保无毒材料，融合独家微爆珠与 5 秒慢回弹黑科技。为孩子带来健康感官发育，为成年人带来宁静桌面疗愈。'
      : 'Crafted with 100% food-grade non-toxic materials, patented crunchy micro-fill, and 5-second slow-rebound magic. Designed for growing kids and peaceful modern desks.',
    cta: isZh ? '探索全部萌趣玩具' : 'Explore Bestselling Squishies',
  };

  const banner = selectedBanner(draft, 'home');
  const isImageMode = banner?.kind === 'images' && banner.mode === 'image';

  const eyebrowText =
    banner?.eyebrow ||
    draft.copy?.[ctx.lang]?.eyebrow ||
    (isZh ? 'Senseng 童趣感官潮玩 · 爆款推荐' : 'SENSORY PLAY & STRESS RELIEF · BESTSELLERS');
  const headlineText = banner?.headline || copy.headline;
  const subtitleText = banner?.subtitle || copy.subtitle;
  const primaryBtnText =
    banner?.primaryButtonText ||
    banner?.slides?.[0]?.buttonText ||
    copy.cta ||
    (isZh ? '浏览全部系列' : 'Explore All Toys');
  const primaryBtnUrl =
    banner?.primaryButtonUrl ||
    banner?.slides?.[0]?.buttonUrl ||
    path('catalog/index.html');
  const secondaryBtnText =
    banner?.secondaryButtonText ||
    banner?.slides?.[0]?.secondaryButtonText ||
    draft.copy?.[ctx.lang]?.secondaryButtonText ||
    (isZh ? '索取样品与定制咨询 →' : 'Request Sample Kit →');
  const secondaryBtnUrl =
    banner?.secondaryButtonUrl ||
    banner?.slides?.[0]?.secondaryButtonUrl ||
    draft.copy?.[ctx.lang]?.secondaryButtonUrl ||
    path('contact/index.html');

  const defaultTags = isZh
    ? ['100% 无毒不含BPA', '欧美玩具实验室安全认证', '5秒柔和慢回弹']
    : ['100% BPA-Free', 'ASTM & EN71 Certified', '5s Slow Rebound'];
  const tag1 = banner?.tags?.[0] || draft.copy?.[ctx.lang]?.tags?.[0] || defaultTags[0];
  const tag2 = banner?.tags?.[1] || draft.copy?.[ctx.lang]?.tags?.[1] || defaultTags[1];
  const tag3 = banner?.tags?.[2] || draft.copy?.[ctx.lang]?.tags?.[2] || defaultTags[2];

  const defaultPills = isZh
    ? ['独家微爆珠软充', '温感变色黑科技', '5s Slow-Rise']
    : ['Crunchy Soft-Fill', 'Thermo Color Shift', '5s Slow-Rise'];
  const pill1 = banner?.floatingPills?.[0] || draft.copy?.[ctx.lang]?.floatingPills?.[0] || defaultPills[0];
  const pill2 = banner?.floatingPills?.[1] || draft.copy?.[ctx.lang]?.floatingPills?.[1] || defaultPills[1];
  const pill3 = banner?.floatingPills?.[2] || draft.copy?.[ctx.lang]?.floatingPills?.[2] || defaultPills[2];

  // Top Notice Ribbon
  const ribbonHtml = `
    <div class="wr-candy-ribbon" style="background:linear-gradient(90deg,#ff6b8b,#ffa07a,#ffd166,#48cae4);color:#ffffff;padding:8px 0;font-size:0.86rem;font-weight:800;text-align:center;letter-spacing:0.02em;">
      <div class="wrap" style="display:flex;justify-content:center;align-items:center;gap:16px;flex-wrap:wrap;">
        <span>🍭 ${isZh ? 'Senseng 糖果乐园 · 100% 食品级安全无毒材质 · 获 EN71 & ASTM F963 权威认证' : 'Senseng Candy Club · 100% Food-Grade Non-Toxic Materials · EN71 & ASTM F963 Certified'}</span>
        <span style="opacity:0.8;">|</span>
        <span>🌍 ${isZh ? '全球外贸出海 · 支持 OEM/ODM 柔性定制与大宗批发' : 'Global Export · Flexible OEM/ODM & Wholesale Available'}</span>
      </div>
    </div>
  `;

  // Hero Split Stage
  const heroHtml = isImageMode
    ? `
    <section class="wr-candy-hero" data-wr-hero aria-label="${esc(headlineText)}" style="background:radial-gradient(circle at 10% 20%, #fff0f5 0%, #fffaf0 40%, #f0f9ff 100%);min-height:0;padding:0;position:relative;overflow:hidden;border-bottom:3px solid #ffebf0;">
      <h1 class="wr-banner-heading" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);">${esc(headlineText)}</h1>
    </section>
  `
    : `
    <section class="wr-candy-hero" data-wr-hero aria-label="${esc(headlineText)}" style="background:radial-gradient(circle at 10% 20%, #fff0f5 0%, #fffaf0 40%, #f0f9ff 100%);padding:80px 0 70px;position:relative;overflow:hidden;border-bottom:3px solid #ffebf0;">
      <!-- Floating Pastel Background Shapes -->
      <div style="position:absolute;width:350px;height:350px;border-radius:50%;background:rgba(255,107,139,0.08);filter:blur(50px);top:-80px;left:-80px;pointer-events:none;"></div>
      <div style="position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(72,202,228,0.1);filter:blur(60px);bottom:-100px;right:-80px;pointer-events:none;"></div>

      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:center;position:relative;z-index:2;">
        <!-- Left Column: Copy & CTAs -->
        <div data-reveal="fade-up">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #ffccd5;padding:8px 20px;border-radius:9999px;box-shadow:0 4px 14px rgba(255,107,139,0.15);margin-bottom:24px;">
            <span style="font-size:1.1rem;">🧸</span>
            <span style="font-size:0.85rem;font-weight:900;color:#e63946;letter-spacing:0.04em;text-transform:uppercase;">
              ${esc(eyebrowText)}
            </span>
          </div>

          <h1 class="hero-title" style="font-size:clamp(2.4rem, 4.5vw, 3.8rem);line-height:1.15;font-weight:900;letter-spacing:-0.03em;color:#2b2d42;margin:0 0 20px;">
            ${esc(headlineText)}
          </h1>

          <p style="font-size:1.12rem;line-height:1.7;color:#555b6e;margin:0 0 32px;max-width:540px;">
            ${esc(subtitleText)}
          </p>

          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a class="button" style="background:#ff6b8b;color:#ffffff;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 24px rgba(255,107,139,0.35);transition:transform 0.2s;" href="${esc(bannerLink(primaryBtnUrl))}" ${navAttrs('catalog')}>
              ${esc(primaryBtnText)} ↗
            </a>
            <a class="button" style="background:#ffffff;color:#2b2d42;border:2px solid #e0e4ec;font-weight:800;padding:15px 30px;border-radius:9999px;font-size:0.95rem;box-shadow:0 4px 12px rgba(0,0,0,0.04);" href="${esc(bannerLink(secondaryBtnUrl))}" ${navAttrs('contact')}>
              ${esc(secondaryBtnText)}
            </a>
          </div>

          <!-- Quality Tags -->
          <div style="margin-top:36px;display:flex;gap:20px;flex-wrap:wrap;color:#6c757d;font-size:0.88rem;font-weight:700;">
            <div style="display:flex;align-items:center;gap:6px;"><span>🌱</span> ${esc(tag1)}</div>
            <div style="display:flex;align-items:center;gap:6px;"><span>🛡️</span> ${esc(tag2)}</div>
            <div style="display:flex;align-items:center;gap:6px;"><span>☁️</span> ${esc(tag3)}</div>
          </div>

          <div style="margin-top:28px;">
            <a href="#candy-sensory" class="wr-scroll-down" aria-label="Scroll to sensory features" style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:#ffeef2;border:2px solid #ffd0d8;color:#ff6b8b;font-size:1.2rem;text-decoration:none;">↓</a>
          </div>
        </div>

        <!-- Right Column: Interactive 3D Stage -->
        <div style="position:relative;text-align:center;">
          <div class="wr-candy-stage wr-hero-float" style="background:radial-gradient(circle, #ffffff 40%, #fff1f3 100%);border:4px solid #ffccd5;border-radius:40px;padding:36px;box-shadow:0 20px 48px rgba(255,107,139,0.18);position:relative;max-width:480px;margin:0 auto;">
            <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-width:380px;height:auto;object-fit:contain;filter:drop-shadow(0 12px 24px rgba(0,0,0,0.1));">

            <!-- Floating Pill 1 -->
            <div style="position:absolute;top:20px;left:-20px;background:#ffffff;border:2px solid #ffd166;padding:8px 16px;border-radius:9999px;font-size:0.84rem;font-weight:900;color:#b45309;box-shadow:0 6px 16px rgba(245,158,11,0.2);display:flex;align-items:center;gap:6px;">
              <span>✨</span> ${esc(pill1)}
            </div>

            <!-- Floating Pill 2 -->
            <div style="position:absolute;bottom:30px;right:-15px;background:#ffffff;border:2px solid #48cae4;padding:8px 16px;border-radius:9999px;font-size:0.84rem;font-weight:900;color:#0077b6;box-shadow:0 6px 16px rgba(72,202,228,0.25);display:flex;align-items:center;gap:6px;">
              <span>🌈</span> ${esc(pill2)}
            </div>

            <!-- Floating Pill 3 -->
            <div style="position:absolute;top:50%;right:-25px;background:#ffffff;border:2px solid #a0c4ff;padding:8px 14px;border-radius:9999px;font-size:0.82rem;font-weight:900;color:#3a0ca3;box-shadow:0 6px 16px rgba(160,196,255,0.25);display:flex;align-items:center;gap:6px;">
              <span>☁️</span> ${esc(pill3)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Sensory Magic 4-Pill Bar
  const sensoryBarHtml = `
    <section id="candy-sensory" class="wrap" style="padding:40px 0 20px;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:30px;">
        <span class="eyebrow" style="color:#ff6b8b;font-weight:900;letter-spacing:0.08em;">${isZh ? '感官魔力解密' : 'SENSORY TOUCH MAGIC'}</span>
        <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);color:#2b2d42;font-weight:900;margin:6px 0 0;">
          ${isZh ? '四大触觉黑科技 · 每一刻都是极致享受' : 'Four Sensory Superpowers in Every Squeeze'}
        </h2>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;">
        <div style="background:#fff5f7;border:2px solid #ffd0d8;border-radius:24px;padding:24px;text-align:center;box-shadow:0 6px 16px rgba(255,107,139,0.06);" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2.4rem;margin-bottom:10px;">🫧</div>
          <div style="font-weight:900;color:#c9184a;font-size:1.08rem;">${isZh ? '爆珠颗粒感' : 'Crunchy Beads'}</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:8px;line-height:1.5;">${isZh ? '高弹微爆珠软充，揉捏时沙沙脆响，极度满足解压。' : 'Filled with patented micro-elastic beads for crisp, deeply satisfying sensory pops.'}</div>
        </div>

        <div style="background:#fffbeb;border:2px solid #fed7aa;border-radius:24px;padding:24px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2.4rem;margin-bottom:10px;">☁️</div>
          <div style="font-weight:900;color:#b45309;font-size:1.08rem;">${isZh ? '5秒慢回弹' : 'Cloud Slow-Rise'}</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:8px;line-height:1.5;">${isZh ? '科学调校记忆节奏，平缓抚平焦虑，让心率恢复平静。' : 'Carefully calibrated 5-second rebound to rhythmically soothe busy minds and hands.'}</div>
        </div>

        <div style="background:#f0f9ff;border:2px solid #bae6fd;border-radius:24px;padding:24px;text-align:center;box-shadow:0 6px 16px rgba(2,132,199,0.06);" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2.4rem;margin-bottom:10px;">🌈</div>
          <div style="font-weight:900;color:#0284c7;font-size:1.08rem;">${isZh ? '温感渐变色' : 'Thermo Color Shift'}</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:8px;line-height:1.5;">${isZh ? '体温触碰即刻显现奇幻渐变，点亮孩子的好奇探索心。' : 'Magically changes hue with hand temperature, sparking curiosity and joy.'}</div>
        </div>

        <div style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:24px;padding:24px;text-align:center;box-shadow:0 6px 16px rgba(124,58,237,0.06);" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2.4rem;margin-bottom:10px;">🍓</div>
          <div style="font-weight:900;color:#6d28d9;font-size:1.08rem;">${isZh ? '天然微甜果香' : 'Aroma Therapy'}</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:8px;line-height:1.5;">${isZh ? '微甜草莓与香草自然清香，零刺鼻化学味，安全亲肤。' : 'Subtle food-safe berry and vanilla sweetness with zero harsh chemical odors.'}</div>
        </div>
      </div>
    </section>
  `;

  // Products Grid
  const productsGridHtml = `
    <section class="wrap chapter" style="padding:60px 0 50px;" data-reveal="fade-up">
      <div class="section-top" style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span class="eyebrow" style="color:#ff6b8b;font-weight:900;">${isZh ? '甄选萌宠潮玩矩阵' : 'CURATED TOY SHOWCASE'}</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:6px;color:#2b2d42;font-weight:900;">
            ${isZh ? 'Senseng 8大主力爆款玩具' : 'Explore All 8 Sensory Companions'}
          </h2>
        </div>
        <a class="text-link" style="color:#ff6b8b;font-weight:900;font-size:1.05rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:28px;">
        ${products.map((p) => `
          <div class="wr-candy-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fff0f3;border-radius:28px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.05);display:flex;flex-direction:column;position:relative;">
            <!-- Badge -->
            <div style="position:absolute;top:16px;left:16px;z-index:2;background:#ffffff;border:2px solid #ffccd5;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:900;color:#e63946;box-shadow:0 3px 8px rgba(255,107,139,0.15);">
              ${esc(p.badge)}
            </div>

            <!-- Image Container -->
            <div style="background:radial-gradient(circle, #ffffff 40%, #fff7f8 100%);padding:28px;text-align:center;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:210px;object-fit:contain;" loading="lazy">
            </div>

            <!-- Content -->
            <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;background:#ffffff;border-top:1px solid #ffeef2;">
              <div>
                <div style="font-size:0.78rem;font-weight:800;color:#ff6b8b;text-transform:uppercase;margin-bottom:6px;">
                  ${esc(p.tagline)}
                </div>
                <h3 style="font-size:1.12rem;font-weight:900;color:#2b2d42;margin:0 0 8px;line-height:1.35;">
                  ${esc(p.name)}
                </h3>
                <p style="font-size:0.86rem;color:#6c757d;line-height:1.5;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                  ${esc(p.desc)}
                </p>
              </div>

              <div>
                <div style="font-size:0.8rem;color:#8d99ae;margin-bottom:14px;display:flex;justify-content:space-between;">
                  <span>📐 ${esc(p.dimensions)}</span>
                  <span>🛡️ 100% Non-Toxic</span>
                </div>
                <a class="button" style="display:block;text-align:center;background:#ff6b8b;color:#ffffff;font-weight:800;border-radius:9999px;padding:12px 18px;font-size:0.88rem;box-shadow:0 4px 14px rgba(255,107,139,0.25);" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${isZh ? '查看详情与样品 ↗' : 'View Details & Sample ↗'}
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // The Science of Squishing (Dual Audience: Kids vs Adults)
  const scienceHtml = `
    <section class="wrap" style="padding:40px 0 60px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #fff5f7 0%, #fffbf0 50%, #f0f9ff 100%);border:3px solid #ffccd5;border-radius:36px;padding:50px 40px;box-shadow:0 12px 36px rgba(255,107,139,0.08);">
        <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
          <span class="eyebrow" style="color:#ff6b8b;font-weight:900;">${isZh ? '科学益智与情绪健康' : 'THE SCIENCE OF SQUEEZING'}</span>
          <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);color:#2b2d42;font-weight:900;margin:8px 0 12px;">
            ${isZh ? '双重赋能：儿童感官启蒙 vs 成人桌面减压' : 'Dual Benefits: Childhood Wonder & Modern Desk Wellness'}
          </h2>
          <p style="color:#6c757d;font-size:1.05rem;line-height:1.6;">
            ${isZh ? '捏捏乐不仅是玩具，更是经过感官治疗师认证的情绪舒缓与精细动作训练工具。' : 'More than just toys — certified by sensory occupational therapists for developmental motor skills and cortisol reduction.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:32px;">
          <!-- Kids Column -->
          <div style="background:#ffffff;border:2px solid #ffd0d8;border-radius:28px;padding:32px;box-shadow:0 6px 18px rgba(0,0,0,0.03);" class="wr-card-hover" data-reveal="fade-up">
            <div style="display:inline-flex;padding:6px 16px;background:#ffeef2;color:#e63946;border-radius:9999px;font-weight:900;font-size:0.85rem;margin-bottom:16px;">
              🧒 ${isZh ? '针对 3-12 岁儿童' : 'FOR GROWING LITTLE HANDS'}
            </div>
            <h3 style="font-size:1.35rem;font-weight:900;color:#2b2d42;margin:0 0 14px;">
              ${isZh ? '感官整合与手部精细动作启蒙' : 'Sensory Exploration & Motor Skill Mastery'}
            </h3>
            <ul style="list-style:none;padding:0;margin:0;display:grid;gap:12px;color:#555b6e;font-size:0.92rem;line-height:1.6;">
              <li style="display:flex;gap:10px;"><span>✅</span> <strong>${isZh ? '握力与指力锻炼' : 'Fine Motor Coordination'}</strong>：${isZh ? '提升写字握笔肌群力量与协调性。' : 'Strengthens intrinsic hand muscles for writing and grip dexterity.'}</li>
              <li style="display:flex;gap:10px;"><span>✅</span> <strong>${isZh ? '情绪安抚与专注力' : 'ADHD & Focus Calming'}</strong>：${isZh ? '柔和触感帮助多动或焦虑儿童平复躁动情绪。' : 'Provides rhythmic tactile grounding to soothe sensory overload.'}</li>
              <li style="display:flex;gap:10px;"><span>✅</span> <strong>${isZh ? '100% 环保无毒啃咬安全' : 'BPA-Free Safety'}</strong>：${isZh ? '食品级材质，不含增塑剂与双酚A，家长更安心。' : 'Food-safe certified coatings safe for curious toddler hands.'}</li>
            </ul>
          </div>

          <!-- Adults Column -->
          <div style="background:#ffffff;border:2px solid #bae6fd;border-radius:28px;padding:32px;box-shadow:0 6px 18px rgba(0,0,0,0.03);" class="wr-card-hover" data-reveal="fade-up">
            <div style="display:inline-flex;padding:6px 16px;background:#e0f2fe;color:#0284c7;border-radius:9999px;font-weight:900;font-size:0.85rem;margin-bottom:16px;">
              💼 ${isZh ? '针对职场与办公人群' : 'FOR MODERN DESK WORKERS'}
            </div>
            <h3 style="font-size:1.35rem;font-weight:900;color:#2b2d42;margin:0 0 14px;">
              ${isZh ? '工位物理减压与情绪疗愈伙伴' : 'Ergonomic Relief & Mental Decompression'}
            </h3>
            <ul style="list-style:none;padding:0;margin:0;display:grid;gap:12px;color:#555b6e;font-size:0.92rem;line-height:1.6;">
              <li style="display:flex;gap:10px;"><span>✅</span> <strong>${isZh ? '舒缓鼠标手与腱鞘张力' : 'Carpal Tunnel Tension Relief'}</strong>：${isZh ? '促进手部血液循环，缓解长时间键盘鼠标操作僵硬。' : 'Stimulates blood flow and releases repetitive strain from typing.'}</li>
              <li style="display:flex;gap:10px;"><span>✅</span> <strong>${isZh ? '无声减压，会议友好' : 'Silent & Meeting-Friendly'}</strong>：${isZh ? '全静音揉捏结构，在办公室与视频会议中随时释放压力。' : 'Completely silent tactile squishing during intense conference calls.'}</li>
              <li style="display:flex;gap:10px;"><span>✅</span> <strong>${isZh ? '工位高颜值温馨点缀' : 'Aesthetic Desk Cheer'}</strong>：${isZh ? '软萌动物造型为严谨办公桌注入一抹亮色与好心情。' : 'Adorable cheerful design brightens up corporate desk cubicles.'}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;

  // Factory Assurance & Certifications
  const factoryHtml = `
    <section class="wrap" style="padding:20px 0 60px;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#ff6b8b;font-weight:900;">${isZh ? '出海制造实力与品质背书' : 'FACTORY DIRECT & CERTIFIED EXCELLENCE'}</span>
        <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);color:#2b2d42;font-weight:900;margin:6px 0 0;">
          ${isZh ? '全球严选质造 · 60+ 国家批发商信赖之选' : 'Trusted by Leading Retailers & Distributors Worldwide'}
        </h2>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;">
        <div style="background:#ffffff;border:2px solid #e9ecef;border-radius:20px;padding:24px;text-align:center;" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2rem;margin-bottom:8px;">🏭</div>
          <div style="font-size:1.8rem;font-weight:900;color:#ff6b8b;" data-counter="10000" data-suffix=" m²">10,000 m²</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:4px;font-weight:700;">${isZh ? '现代化无尘生产基地' : 'Cleanroom Facility'}</div>
        </div>
        <div style="background:#ffffff;border:2px solid #e9ecef;border-radius:20px;padding:24px;text-align:center;" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2rem;margin-bottom:8px;">📦</div>
          <div style="font-size:1.8rem;font-weight:900;color:#ff6b8b;" data-counter="1200000" data-suffix="+">1,200,000+</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:4px;font-weight:700;">${isZh ? '月产出海产能 (Pcs)' : 'Monthly Capacity'}</div>
        </div>
        <div style="background:#ffffff;border:2px solid #e9ecef;border-radius:20px;padding:24px;text-align:center;" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2rem;margin-bottom:8px;">🛡️</div>
          <div style="font-size:1.8rem;font-weight:900;color:#ff6b8b;">EN71 / ASTM</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:4px;font-weight:700;">${isZh ? '国际玩具检测认证' : 'Global Safety Lab Tests'}</div>
        </div>
        <div style="background:#ffffff;border:2px solid #e9ecef;border-radius:20px;padding:24px;text-align:center;" class="wr-card-hover" data-reveal="fade-up">
          <div style="font-size:2rem;margin-bottom:8px;">🤝</div>
          <div style="font-size:1.8rem;font-weight:900;color:#ff6b8b;">OEM & ODM</div>
          <div style="font-size:0.88rem;color:#6c757d;margin-top:4px;font-weight:700;">${isZh ? '开模定制与彩盒包装' : 'Custom Mold & Box'}</div>
        </div>
      </div>
    </section>
  `;

  // Customer Reviews
  const reviewsHtml = `
    <section class="wrap" style="padding:20px 0 60px;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#ff6b8b;font-weight:900;">${isZh ? '真实好评与微笑分享' : 'HAPPY SMILES EVERYWHERE'}</span>
        <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);color:#2b2d42;font-weight:900;margin:6px 0 0;">
          ${isZh ? '全球买家与家庭真实口碑' : 'Loved by 200,000+ Kids & Grown-Ups'}
        </h2>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div style="background:#ffffff;border:2px solid #ffd0d8;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(255,107,139,0.06);position:relative;" class="wr-card-hover" data-reveal="fade-up">
          <div style="color:#f59e0b;font-size:1.2rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#495057;font-size:0.95rem;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '“柴犬爆珠手感太神奇了！儿子一捏就停不下来，放在书桌上做作业烦躁时捏两下很快就冷静下来了，而且没有任何异味，非常放心。”' : '“The crunchy Shiba squishy is pure magic! My 7-year-old loves the subtle pop sounds, and I find myself borrowing it during work calls. Top tier quality!”'}
          </p>
          <div style="font-weight:900;color:#2b2d42;font-size:0.92rem;">— Sarah M., Parent (USA)</div>
        </div>

        <div style="background:#ffffff;border:2px solid #bae6fd;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(2,132,199,0.06);position:relative;" class="wr-card-hover" data-reveal="fade-up">
          <div style="color:#f59e0b;font-size:1.2rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#495057;font-size:0.95rem;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '“作为欧洲精品玩具采购商，我们在 Senseng 定制了 50,000 套彩盒装猫咪捏捏乐，包装印刷精美，欧洲 CE 报告齐全，上架两周售罄！”' : '“We ordered 50,000 units for our European boutique toy retail chain. Flawless packaging, full EN71 compliance certificates, and incredible customer reception.”'}
          </p>
          <div style="font-weight:900;color:#2b2d42;font-size:0.92rem;">— Thomas K., Toy Buyer (Germany)</div>
        </div>

        <div style="background:#ffffff;border:2px solid #fed7aa;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(245,158,11,0.06);position:relative;" class="wr-card-hover" data-reveal="fade-up">
          <div style="color:#f59e0b;font-size:1.2rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#495057;font-size:0.95rem;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '“温感变色独角鲸真的会随手温渐变！送给闺蜜当生日礼物，她整天摆在办公室电脑前。超级慢回弹，非常治愈。”' : '“The color-changing narwhal really shifts colors when you hold it! The slow rise memory feel is unmatched. Hands down the cutest stress toy ever.”'}
          </p>
          <div style="font-weight:900;color:#2b2d42;font-size:0.92rem;">— Emily L., Designer (UK)</div>
        </div>
      </div>
    </section>
  `;

  // Newsletter & CTA Banner
  const ctaHtml = `
    <section class="wrap" style="padding:0 0 70px;" data-reveal="fade-up">
      <div style="background:linear-gradient(135deg, #ff6b8b 0%, #ff8e72 50%, #ffa07a 100%);color:#ffffff;border-radius:32px;padding:50px 36px;text-align:center;box-shadow:0 16px 40px rgba(255,107,139,0.3);position:relative;overflow:hidden;">
        <h2 style="font-size:clamp(2rem, 3.8vw, 3rem);font-weight:900;margin:0 0 14px;color:#ffffff;">
          ${isZh ? '加入 Senseng 萌趣俱乐部 · 获取专属样品与采购方案' : 'Join the Senseng Joy Club · Get Free Sample Kits'}
        </h2>
        <p style="max-width:620px;margin:0 auto 32px;font-size:1.1rem;line-height:1.6;opacity:0.95;">
          ${isZh ? '无论您是寻找优质外贸货源的跨境卖家、玩具采购总监，还是母婴玩具买手，我们均可为您提供免费样品寄送与专属报价。' : 'Whether you are a global toy retailer, e-commerce brand, or distributor, contact us today for wholesale catalogs and tailored quotes.'}
        </p>
        <div style="display:inline-flex;gap:16px;flex-wrap:wrap;justify-content:center;">
          <a class="button" style="background:#ffffff;color:#e63946;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:0.98rem;box-shadow:0 8px 24px rgba(0,0,0,0.15);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '立即在线询盘 / 索取样品 ↗' : 'Contact Us / Request Sample ↗'}
          </a>
          <a class="button" style="background:rgba(255,255,255,0.2);color:#ffffff;border:2px solid #ffffff;font-weight:800;padding:15px 32px;border-radius:9999px;font-size:0.98rem;" href="${path('about/index.html')}" ${navAttrs('about')}>
            ${isZh ? '了解我们的玩具工坊 →' : 'Learn About Our Factory →'}
          </a>
        </div>
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-senseng-candy-inner" data-wr-page="home">
      ${ribbonHtml}
      ${heroHtml}
      ${sensoryBarHtml}
      ${productsGridHtml}
      ${scienceHtml}
      ${factoryHtml}
      ${reviewsHtml}
      ${ctaHtml}
    </main>
  `;
}

export function renderCandyCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-candy-inner" data-wr-page="catalog" style="padding-top:100px;background:#fffdfa;">
      <section class="wrap" style="padding:40px 0 60px;">
        <div data-reveal="fade-up" style="text-align:center;max-width:700px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:#ffeef2;border:2px solid #ffd0d8;padding:6px 18px;border-radius:9999px;font-size:0.82rem;font-weight:900;color:#e63946;margin-bottom:16px;">
            🧸 ${isZh ? 'Senseng 全部产品目录' : 'FULL SENSORY SQUISHY CATALOG'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);color:#2b2d42;font-weight:900;margin:0 0 16px;">
            ${isZh ? '萌趣治愈玩具全系列' : 'Our Playful Toy Collection'}
          </h1>
          <p style="color:#6c757d;font-size:1.1rem;line-height:1.6;">
            ${isZh ? '8款独家设计感官潮玩，支持食品级环保材质、定制彩盒包装与全球大宗采购。' : 'Explore all 8 sensory stress toys engineered with food-grade materials and certified child safety.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:28px;">
          ${products.map((p) => `
            <div class="wr-candy-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fff0f3;border-radius:28px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.05);display:flex;flex-direction:column;position:relative;">
              <div style="position:absolute;top:16px;left:16px;z-index:2;background:#ffffff;border:2px solid #ffccd5;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:900;color:#e63946;box-shadow:0 3px 8px rgba(255,107,139,0.15);">
                ${esc(p.badge)}
              </div>
              <div style="background:radial-gradient(circle, #ffffff 40%, #fff7f8 100%);padding:28px;text-align:center;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:220px;object-fit:contain;" loading="lazy">
              </div>
              <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;background:#ffffff;border-top:1px solid #ffeef2;">
                <div>
                  <div style="font-size:0.78rem;font-weight:800;color:#ff6b8b;text-transform:uppercase;margin-bottom:6px;">${esc(p.tagline)}</div>
                  <h3 style="font-size:1.15rem;font-weight:900;color:#2b2d42;margin:0 0 8px;line-height:1.35;">${esc(p.name)}</h3>
                  <p style="font-size:0.88rem;color:#6c757d;line-height:1.5;margin:0 0 16px;">${esc(p.desc)}</p>
                </div>
                <div>
                  <div style="font-size:0.8rem;color:#8d99ae;margin-bottom:14px;display:flex;justify-content:space-between;">
                    <span>📐 ${esc(p.dimensions)}</span>
                    <span>🌱 ${esc(p.material)}</span>
                  </div>
                  <a class="button" style="display:block;text-align:center;background:#ff6b8b;color:#ffffff;font-weight:800;border-radius:9999px;padding:12px 18px;font-size:0.88rem;box-shadow:0 4px 14px rgba(255,107,139,0.25);" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${isZh ? '查看详情与参数 ↗' : 'View Product Details ↗'}
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- B2B Wholesale Banner -->
        <div data-reveal="fade-up" style="margin-top:60px;background:linear-gradient(135deg, #fff0f5 0%, #fffbf0 100%);border:2px solid #ffd0d8;border-radius:28px;padding:40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;">
          <div>
            <h3 style="font-size:1.4rem;font-weight:900;color:#2b2d42;margin:0 0 6px;">
              ${isZh ? '需要专属定制包装或大批量外贸集装箱出货？' : 'Looking for Custom OEM Packaging or Container Shipments?'}
            </h3>
            <p style="color:#6c757d;font-size:0.95rem;margin:0;">
              ${isZh ? '支持 Pantone 指定调色、纸盒大豆油墨印刷、条形码贴标与全球拼箱直达。' : 'Custom Pantone matching, private label blister & paperboard boxes, barcode labeling, and DDP shipping.'}
            </p>
          </div>
          <a class="button" style="background:#ff6b8b;color:#ffffff;font-weight:900;padding:14px 30px;border-radius:9999px;box-shadow:0 6px 18px rgba(255,107,139,0.3);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '联系工厂外贸专员 ↗' : 'Inquire Wholesale Pricing ↗'}
          </a>
        </div>
      </section>
    </main>
  `;
}

export function renderCandyDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0] || {
    id: 'p1',
    name: isZh ? CANDY_DEFAULT_PRODUCTS[0].nameZh : CANDY_DEFAULT_PRODUCTS[0].name,
    desc: isZh ? CANDY_DEFAULT_PRODUCTS[0].descZh : CANDY_DEFAULT_PRODUCTS[0].desc,
    badge: CANDY_DEFAULT_PRODUCTS[0].badge,
    material: isZh ? CANDY_DEFAULT_PRODUCTS[0].materialZh : CANDY_DEFAULT_PRODUCTS[0].material,
    dimensions: CANDY_DEFAULT_PRODUCTS[0].dimensions,
    tagline: CANDY_DEFAULT_PRODUCTS[0].tagline,
    category: CANDY_DEFAULT_PRODUCTS[0].category,
    img: CANDY_DEFAULT_PRODUCTS[0].img,
  };
  const related = products.filter((item) => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-senseng-candy-inner" data-wr-page="detail" style="padding-top:100px;background:#fffdfa;">
      <section class="wrap" style="padding:40px 0 60px;">
        <div style="margin-bottom:24px;">
          <a class="text-link" style="color:#ff6b8b;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ← ${isZh ? '返回全部玩具目录' : 'Back to Catalog'}
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:start;">
          <!-- Left: Big Product Image -->
          <div data-reveal="fade-up" style="background:radial-gradient(circle, #ffffff 40%, #fff7f8 100%);border:4px solid #ffccd5;border-radius:36px;padding:48px;text-align:center;box-shadow:0 16px 40px rgba(255,107,139,0.12);">
            <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:420px;object-fit:contain;filter:drop-shadow(0 12px 24px rgba(0,0,0,0.08));">
            <div style="margin-top:28px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
              <span style="background:#fff0f3;border:1px solid #ffccd5;color:#e63946;padding:6px 14px;border-radius:9999px;font-size:0.8rem;font-weight:800;">✨ ${isZh ? '高弹抗撕裂' : 'Tear Resistant'}</span>
              <span style="background:#fff0f3;border:1px solid #ffccd5;color:#e63946;padding:6px 14px;border-radius:9999px;font-size:0.8rem;font-weight:800;">🌱 ${isZh ? '食品级环保' : 'Food Grade'}</span>
              <span style="background:#fff0f3;border:1px solid #ffccd5;color:#e63946;padding:6px 14px;border-radius:9999px;font-size:0.8rem;font-weight:800;">🛡️ ASTM / EN71</span>
            </div>
          </div>

          <!-- Right: Details & Order -->
          <div data-reveal="fade-up">
            <div style="display:inline-flex;padding:4px 14px;background:#ffeef2;border:2px solid #ffd0d8;border-radius:9999px;font-size:0.8rem;font-weight:900;color:#e63946;margin-bottom:14px;">
              ${esc(p.badge)}
            </div>
            <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#2b2d42;margin:0 0 12px;line-height:1.2;">
              ${esc(p.name)}
            </h1>
            <div style="font-size:1.05rem;font-weight:800;color:#ff6b8b;margin-bottom:20px;">
              ${esc(p.tagline)}
            </div>
            <p style="font-size:1.05rem;line-height:1.7;color:#555b6e;margin:0 0 28px;">
              ${esc(p.desc)}
            </p>

            <!-- Specifications Table -->
            <div style="background:#ffffff;border:2px solid #ffccd5;border-radius:24px;padding:24px;margin-bottom:32px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <h3 style="font-size:1.1rem;font-weight:900;color:#2b2d42;margin:0 0 16px;">
                📋 ${isZh ? '规格参数与安全标准' : 'Specifications & Certifications'}
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.92rem;">
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '材质构成' : 'Material'}</span>
                  <strong style="color:#2b2d42;">${esc(p.material)}</strong>
                </div>
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '产品尺寸' : 'Dimensions'}</span>
                  <strong style="color:#2b2d42;">${esc(p.dimensions)}</strong>
                </div>
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '回弹速度' : 'Rebound Profile'}</span>
                  <strong style="color:#2b2d42;">5s Slow Memory Rise</strong>
                </div>
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '安全认证' : 'Safety Compliance'}</span>
                  <strong style="color:#2b2d42;">CE, EN71, ASTM F963</strong>
                </div>
              </div>
            </div>

            <!-- Dynamic Tactile & Sensory Progress Bars -->
            <div style="background:#fff7f9;border:2px solid #ffccd5;border-radius:24px;padding:24px;margin-bottom:32px;">
              <h3 style="font-size:1.05rem;font-weight:900;color:#c9184a;margin:0 0 16px;">
                🍬 ${isZh ? '触觉动态评测指标' : 'Tactile Sensory Dynamic Ratings'}
              </h3>
              <div style="display:flex;flex-direction:column;gap:14px;">
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:800;color:#2b2d42;margin-bottom:6px;">
                    <span>${isZh ? '柔和慢回弹记忆指数' : 'Cloud Slow-Rise Memory Index'}</span>
                    <span style="color:#ff6b8b;font-weight:900;">98%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#ffeef2;height:8px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="98" style="background:linear-gradient(90deg,#ff6b8b,#ff8fa3);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1);"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:800;color:#2b2d42;margin-bottom:6px;">
                    <span>${isZh ? '食品级皮肤安全等级' : 'Food-Grade Skin Safety Purity'}</span>
                    <span style="color:#2a9d8f;font-weight:900;">100%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#ffeef2;height:8px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#2a9d8f,#52b788);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:800;color:#2b2d42;margin-bottom:6px;">
                    <span>${isZh ? '微爆珠软充手感抗撕裂度' : 'Crunchy Bead Soft-Fill Tear Resistance'}</span>
                    <span style="color:#f77f00;font-weight:900;">96%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#ffeef2;height:8px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="96" style="background:linear-gradient(90deg,#f77f00,#fcbf49);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s;"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a class="button" style="background:#ff6b8b;color:#ffffff;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 8px 24px rgba(255,107,139,0.35);" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)}>
                ${isZh ? '立即咨询此产品 / 索取样品 ↗' : 'Inquire for Wholesale & Samples ↗'}
              </a>
              ${waDigits ? `
                <a class="button" target="_blank" rel="noopener noreferrer" style="background:#25d366;color:#ffffff;font-weight:800;padding:16px 28px;border-radius:9999px;font-size:0.95rem;box-shadow:0 6px 18px rgba(37,211,102,0.3);" href="https://wa.me/${esc(waDigits)}">
                  WhatsApp Direct Chat ↗
                </a>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div style="margin-top:80px;" data-reveal="fade-up">
          <h2 style="font-size:1.8rem;font-weight:900;color:#2b2d42;margin:0 0 24px;">
            ${isZh ? '您可能也喜欢的萌宠玩具' : 'You May Also Love'}
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${related.map((item) => `
              <div class="wr-candy-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:2px solid #ffeef2;border-radius:24px;padding:20px;text-align:center;">
                <img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:100%;max-height:180px;object-fit:contain;margin-bottom:12px;">
                <h4 style="font-size:1.05rem;font-weight:900;color:#2b2d42;margin:0 0 6px;">${esc(item.name)}</h4>
                <a class="text-link" style="color:#ff6b8b;font-weight:800;font-size:0.9rem;" href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)}>
                  ${isZh ? '查看详情 ↗' : 'View Details ↗'}
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderLegacyCandyAbout(ctx: ThemeContext): string {
  const isZh = (ctx.lang as string) === 'zh';
  const company = ctx.draft.company;
  const { path, navAttrs } = ctx;
  const hasCustomAbout = !!(company.aboutHighlights || company.aboutStory || company.aboutImageAssetId || company.aboutHeadline);

  if (hasCustomAbout) {
    const { primary: aboutImg, secondary: secondaryImg } = getAboutImages(ctx, path('assets/about-reference.jpg'));
    const headline = getAboutHeadline(company, isZh ? '用软萌触觉，点亮每一颗纯真童心' : 'Crafting Joy & Calm, One Squeeze at a Time');
    const storyParas = getAboutStoryParagraphs(
      company,
      isZh
        ? 'Senseng 诞生于对“触觉疗愈”与“童年欢笑”的无限热爱。我们坚信，无论是正在探索世界的小朋友，还是在现代高压下奋斗的成年人，都需要一份柔软温暖的治愈力量。'
        : 'Senseng was founded with a joyful mission: to bring gentle tactile comfort, developmental sensory stimulation, and infectious smiles to both kids and busy adults around the globe.',
    );
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '10,000+', num: 10000, suffix: '+', label: isZh ? '平方米洁净车间' : 'Square Meter Facility', desc: isZh ? '国际标准无尘车间' : 'Certified cleanroom facility' },
      { value: '1,200,000+', num: 1200000, suffix: '+', label: isZh ? '件月均稳定产能' : 'Monthly Toy Capacity', desc: isZh ? '自动化柔性产线' : 'Automated agile assembly' },
      { value: '60+', num: 60, suffix: '+', label: isZh ? '出口国家与地区' : 'Global Export Markets', desc: isZh ? '欧美主流商超准入' : 'Tier-1 global retail compliance' },
      { value: '100%', num: 100, suffix: '%', label: isZh ? '出厂全检合格率' : 'Inspection Pass Rate', desc: isZh ? 'EN71与ASTM标准' : 'EN71 & ASTM strict pass' },
    ]);

    return `
      <main class="wr-inner wr-senseng-candy-inner" data-wr-page="about" style="padding-top:100px;background:#fffdfa;">
        <section class="wrap" style="padding:40px 0 60px;">
          <div class="about-split" data-reveal="fade-up" style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;background:#ffeef2;border:2px solid #ffd0d8;padding:6px 18px;border-radius:9999px;font-size:0.82rem;font-weight:900;color:#e63946;margin-bottom:16px;">
                🍭 ${isZh ? `关于 ${esc(company.name || 'SENSENG')}` : `ABOUT ${esc((company.name || 'SENSENG').toUpperCase())}`}${company.establishedYear ? ` · EST. ${esc(company.establishedYear)}` : ''}
              </div>
              <h1 style="font-size:clamp(2.4rem, 4.2vw, 3.4rem);color:#2b2d42;font-weight:900;margin:0 0 18px;line-height:1.15;">
                ${esc(headline)}
              </h1>
              <div style="color:#555b6e;font-size:1.12rem;line-height:1.75;display:flex;flex-direction:column;gap:14px;margin-bottom:24px;">
                ${storyParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
              </div>
              <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:linear-gradient(135deg, #ff6b8b 0%, #ff8e72 100%);color:#ffffff;font-weight:900;padding:14px 32px;border-radius:9999px;box-shadow:0 8px 20px rgba(255,107,139,0.3);font-size:0.95rem;text-decoration:none;">
                  ${isZh ? '开启批发合作洽谈 ↗' : 'Send Wholesale Inquiry ↗'}
                </a>
                ${company.capabilities ? `
                  <span style="font-size:0.88rem;color:#e63946;font-weight:700;background:#ffeef2;padding:8px 16px;border-radius:9999px;">
                    ✨ ${esc(company.capabilities.slice(0, 45))}
                  </span>
                ` : ''}
              </div>
            </div>
            <div class="wr-card-hover" style="position:relative;border-radius:32px;overflow:hidden;border:4px solid #ffd0d8;box-shadow:0 16px 40px rgba(255,107,139,0.18);">
              <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform 0.5s ease;">
              <div style="position:absolute;bottom:16px;left:16px;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border-radius:9999px;padding:8px 18px;font-size:0.82rem;font-weight:900;color:#e63946;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:flex;align-items:center;gap:6px;">
                <span>🍬 ${esc(company.type === 'factory' ? (isZh ? '自有高标生产基地' : 'Direct Verified Factory') : (isZh ? '专业出口贸易伙伴' : 'Certified Trading Partner'))}</span>
              </div>
            </div>
          </div>

          ${secondaryImg ? `
            <div data-reveal="fade-up" style="display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;background:#ffffff;border:3px solid #ffd0d8;border-radius:32px;padding:36px;box-shadow:0 12px 30px rgba(255,107,139,0.08);margin-bottom:60px;">
              <div style="border-radius:24px;overflow:hidden;" class="wr-card-hover">
                <img src="${esc(secondaryImg)}" alt="${esc(company.name)} workshop" style="width:100%;height:100%;object-fit:cover;">
              </div>
              <div>
                <div style="display:inline-block;background:#ffeef2;color:#e63946;font-weight:900;font-size:0.8rem;padding:4px 12px;border-radius:9999px;margin-bottom:10px;">${isZh ? '车间实景与品质承诺' : 'WORKSHOP & CRAFTSMANSHIP'}</div>
                <h2 style="font-size:1.8rem;font-weight:900;color:#2b2d42;margin:0 0 14px;">${isZh ? '精工智造 · 每一批次严格质检' : 'Precision Crafted For Endless Smiles'}</h2>
                <p style="color:#6c757d;font-size:1rem;line-height:1.7;margin:0 0 18px;">
                  ${esc(company.capabilities || (isZh ? '我们采用现代化洁净车间与自动化灌装工艺，所有触觉解压玩偶出厂前均经过重金属迁移、拉力测试与回弹周期检测。' : 'Equipped with automated cleanroom production lines and batch toxicology assays to safeguard child play.'))}
                </p>
                ${company.certifications ? `
                  <div style="background:#fff8f9;border-left:4px solid #ff6b8b;padding:12px 16px;border-radius:0 12px 12px 0;">
                    <strong style="color:#e63946;font-size:0.85rem;display:block;">${isZh ? '持有权威认证' : 'Verified Certifications'}</strong>
                    <span style="color:#2b2d42;font-size:0.92rem;font-weight:700;">${esc(company.certifications)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- 4 Core Pillars -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;margin-bottom:60px;">
            <div style="background:#ffffff;border:3px solid #ffd0d8;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(255,107,139,0.06);" class="wr-card-hover" data-reveal="fade-up">
              <div style="font-size:2.5rem;margin-bottom:12px;">🛡️</div>
              <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '极致安全标准' : 'Uncompromising Safety'}</h3>
              <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '严格遵循欧盟 EN71、美标 ASTM F963 及 CPC 标准，每一批次均经过重金属与毒理检验。' : 'Certified against EN71, ASTM F963, and CPSIA. Strict zero-toxic materials tested at independent labs.'}</p>
            </div>
            <div style="background:#ffffff;border:3px solid #fed7aa;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(245,158,11,0.06);" class="wr-card-hover" data-reveal="fade-up">
              <div style="font-size:2.5rem;margin-bottom:12px;">✨</div>
              <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '独创触觉工艺' : 'Tactile Innovation'}</h3>
              <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '自主研发微爆珠软充与温感渐变材质，赋予每一个玩具不可思议的奇妙触感。' : 'Proprietary crunchy bead soft-fill, calibrated 5s slow rise memory, and thermochromic color shifts.'}</p>
            </div>
            <div style="background:#ffffff;border:3px solid #bae6fd;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(2,132,199,0.06);" class="wr-card-hover" data-reveal="fade-up">
              <div style="font-size:2.5rem;margin-bottom:12px;">🌱</div>
              <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '绿色环保责任' : 'Eco-Conscious Vision'}</h3>
              <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '采用环保大豆油墨印刷彩盒与可循环纸板包装，积极减少一次性塑料使用。' : 'Soy-ink printed paperboard boxes and recyclable packaging to protect our planet for future generations.'}</p>
            </div>
            <div style="background:#ffffff;border:3px solid #ddd6fe;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(124,58,237,0.06);" class="wr-card-hover" data-reveal="fade-up">
              <div style="font-size:2.5rem;margin-bottom:12px;">❤️</div>
              <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '跨越年龄的治愈' : 'Joy For All Ages'}</h3>
              <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '无论是幼儿园萌娃还是写字楼白领，软萌公仔都能带来纯粹而专注的心灵疗愈。' : 'Bridging childhood play and adult desk mindfulness, bringing quiet emotional comfort to everyone.'}</p>
            </div>
          </div>

          <!-- Factory Statistics -->
          <div data-reveal="fade-up" style="background:linear-gradient(135deg, #ff6b8b 0%, #ff8e72 100%);color:#ffffff;border-radius:32px;padding:48px;box-shadow:0 16px 40px rgba(255,107,139,0.25);">
            <div style="text-align:center;margin-bottom:36px;">
              <h2 style="font-size:2.2rem;font-weight:900;color:#ffffff;margin:0 0 8px;">${isZh ? '出海制造实力与供应链保障' : 'Global Manufacturing & Supply Chain Prowess'}</h2>
              <p style="opacity:0.9;font-size:1.05rem;max-width:600px;margin:0 auto;">${isZh ? '十余年外贸玩具制造沉淀，为您提供从工业设计到全球报关出海的一站式服务。' : 'Decade of specialized toy manufacturing serving tier-1 retailers across 60+ countries.'}</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;text-align:center;">
              ${stats.map((s) => `
                <div>
                  <div style="font-size:2.8rem;font-weight:900;" data-counter="${s.num}" data-suffix="${esc(s.suffix || '')}" data-prefix="${esc(s.prefix || '')}">${esc(s.value)}</div>
                  <div style="font-size:0.92rem;opacity:0.9;margin-top:4px;">${esc(s.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      </main>
    `;
  }

  return `
    <main class="wr-inner wr-senseng-candy-inner" data-wr-page="about" style="padding-top:100px;background:#fffdfa;">
      <section class="wrap" style="padding:40px 0 60px;">
        <div data-reveal="fade-up" style="max-width:760px;margin-bottom:50px;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:#ffeef2;border:2px solid #ffd0d8;padding:6px 18px;border-radius:9999px;font-size:0.82rem;font-weight:900;color:#e63946;margin-bottom:16px;">
            🍭 ${isZh ? '关于 Senseng 糖果乐园' : 'ABOUT SENSENG PLAY'}
          </div>
          <h1 style="font-size:clamp(2.4rem, 4.5vw, 3.4rem);color:#2b2d42;font-weight:900;margin:0 0 18px;">
            ${isZh ? '用软萌触觉，点亮每一颗纯真童心' : 'Crafting Joy & Calm, One Squeeze at a Time'}
          </h1>
          <p style="color:#555b6e;font-size:1.15rem;line-height:1.7;">
            ${isZh
              ? 'Senseng 诞生于对“触觉疗愈”与“童年欢笑”的无限热爱。我们坚信，无论是正在探索世界的小朋友，还是在现代高压下奋斗的成年人，都需要一份柔软温暖的治愈力量。'
              : 'Senseng was founded with a joyful mission: to bring gentle tactile comfort, developmental sensory stimulation, and infectious smiles to both kids and busy adults around the globe.'}
          </p>
        </div>

        <!-- 4 Core Pillars -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;margin-bottom:60px;">
          <div style="background:#ffffff;border:3px solid #ffd0d8;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(255,107,139,0.06);" class="wr-card-hover" data-reveal="fade-up">
            <div style="font-size:2.5rem;margin-bottom:12px;">🛡️</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '极致安全标准' : 'Uncompromising Safety'}</h3>
            <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '严格遵循欧盟 EN71、美标 ASTM F963 及 CPC 标准，每一批次均经过重金属与毒理检验。' : 'Certified against EN71, ASTM F963, and CPSIA. Strict zero-toxic materials tested at independent labs.'}</p>
          </div>
          <div style="background:#ffffff;border:3px solid #fed7aa;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(245,158,11,0.06);" class="wr-card-hover" data-reveal="fade-up">
            <div style="font-size:2.5rem;margin-bottom:12px;">✨</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '独创触觉工艺' : 'Tactile Innovation'}</h3>
            <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '自主研发微爆珠软充与温感渐变材质，赋予每一个玩具不可思议的奇妙触感。' : 'Proprietary crunchy bead soft-fill, calibrated 5s slow rise memory, and thermochromic color shifts.'}</p>
          </div>
          <div style="background:#ffffff;border:3px solid #bae6fd;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(2,132,199,0.06);" class="wr-card-hover" data-reveal="fade-up">
            <div style="font-size:2.5rem;margin-bottom:12px;">🌱</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '绿色环保责任' : 'Eco-Conscious Vision'}</h3>
            <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '采用环保大豆油墨印刷彩盒与可循环纸板包装，积极减少一次性塑料使用。' : 'Soy-ink printed paperboard boxes and recyclable packaging to protect our planet for future generations.'}</p>
          </div>
          <div style="background:#ffffff;border:3px solid #ddd6fe;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(124,58,237,0.06);" class="wr-card-hover" data-reveal="fade-up">
            <div style="font-size:2.5rem;margin-bottom:12px;">❤️</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">${isZh ? '跨越年龄的治愈' : 'Joy For All Ages'}</h3>
            <p style="font-size:0.9rem;color:#6c757d;line-height:1.6;margin:0;">${isZh ? '无论是幼儿园萌娃还是写字楼白领，软萌公仔都能带来纯粹而专注的心灵疗愈。' : 'Bridging childhood play and adult desk mindfulness, bringing quiet emotional comfort to everyone.'}</p>
          </div>
        </div>

        <!-- Factory Statistics -->
        <div data-reveal="fade-up" style="background:linear-gradient(135deg, #ff6b8b 0%, #ff8e72 100%);color:#ffffff;border-radius:32px;padding:48px;box-shadow:0 16px 40px rgba(255,107,139,0.25);">
          <div style="text-align:center;margin-bottom:36px;">
            <h2 style="font-size:2.2rem;font-weight:900;color:#ffffff;margin:0 0 8px;">${isZh ? '出海制造实力与供应链保障' : 'Global Manufacturing & Supply Chain Prowess'}</h2>
            <p style="opacity:0.9;font-size:1.05rem;max-width:600px;margin:0 auto;">${isZh ? '十余年外贸玩具制造沉淀，为您提供从工业设计到全球报关出海的一站式服务。' : 'Decade of specialized toy manufacturing serving tier-1 retailers across 60+ countries.'}</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;text-align:center;">
            <div>
              <div style="font-size:2.8rem;font-weight:900;" data-counter="10000" data-suffix="+">10,000+</div>
              <div style="font-size:0.92rem;opacity:0.9;margin-top:4px;">${isZh ? '平方米无尘洁净车间' : 'Square Meter Facility'}</div>
            </div>
            <div>
              <div style="font-size:2.8rem;font-weight:900;" data-counter="1200000" data-suffix="+">1,200,000+</div>
              <div style="font-size:0.92rem;opacity:0.9;margin-top:4px;">${isZh ? '件月均稳定产能' : 'Monthly Toy Capacity'}</div>
            </div>
            <div>
              <div style="font-size:2.8rem;font-weight:900;" data-counter="60" data-suffix="+">60+</div>
              <div style="font-size:0.92rem;opacity:0.9;margin-top:4px;">${isZh ? '出口国家与地区' : 'Global Export Markets'}</div>
            </div>
            <div>
              <div style="font-size:2.8rem;font-weight:900;" data-counter="100" data-suffix="%">100%</div>
              <div style="font-size:0.92rem;opacity:0.9;margin-top:4px;">${isZh ? '出厂全检合格率' : 'Inspection Pass Rate'}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}


function renderModernCandyAbout(ctx: ThemeContext): string {
  const isZh = (ctx.lang as string) === 'zh';
  const company = ctx.draft.company;
  const { path, navAttrs } = ctx;

  const { primary: aboutImg, secondary: secondaryImg } = getAboutImages(ctx, path('assets/about-reference.jpg'), path('assets/hero-candy.jpg'));
  const headline = getAboutHeadline(company, isZh ? '用软萌触觉，点亮每一颗纯真童心' : 'Crafting Joy & Calm, One Squeeze at a Time');
  const storyParas = getAboutStoryParagraphs(
    company,
    isZh
      ? [
          `${company.name || 'Senseng'} 诞生于对“触觉疗愈”与“纯真童趣”的无限热爱。我们坚信，无论是正在探索世界的小朋友，还是在现代高压下奋斗的成年人，都需要一份柔软温暖的治愈力量。`,
          '依托国际标准的无尘洁净车间与高精度自动化注塑灌装设备，我们精选食品级环保聚合物原料，经由上百次发泡密度与回弹曲线的科学调校，打造出零毛孔、温润亲肤且具备持久慢回弹质感的系列解压手办与潮玩公仔。',
          '每一批次出厂产品均经独立权威第三方实验室全项严苛检测，彻底杜绝塑化剂、重金属及有害挥发物，为全球品牌零售商、精品连锁店及跨境买手提供兼具极致货架吸引力与合规品质保障的一站式供应链服务。'
        ]
      : [
          `${company.name || 'Senseng'} was founded with a joyful mission: to bring gentle tactile comfort, developmental sensory stimulation, and infectious smiles to both kids and busy adults around the globe.`,
          'Backed by international cleanroom facilities and precision automated tooling, we formulate food-grade eco-polymers to achieve velvety, slow-rebound tactile perfection that stands up to hundreds of thousands of squeezes.',
          'Every batch is certified against EN71, ASTM F963, and CPSIA frameworks at independent testing laboratories, ensuring seamless customs clearance and proven shelf appeal for global retailers and distributors.'
        ]
  );

  const stats = parseAboutHighlights(company.aboutHighlights, [
    { value: '10,000+ m²', num: 10000, suffix: ' m²', label: isZh ? '国际标准洁净车间' : 'Cleanroom Facility', desc: isZh ? '十万级无尘智造标准' : 'Class 100,000 cleanroom specs' },
    { value: '1,200,000+', num: 1200000, suffix: '+', label: isZh ? '月均稳定出海产能' : 'Monthly Unit Capacity', desc: isZh ? '高速精密模具注压产线' : 'High-speed automated molding' },
    { value: '60+', num: 60, suffix: '+', label: isZh ? '全球出口合作国家' : 'Global Export Destinations', desc: isZh ? '直通欧美亚主流商超连锁' : 'Direct delivery to worldwide retailers' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '出厂全检合格率' : 'Lab Inspection Pass Rate', desc: isZh ? 'EN71 / ASTM / CPSIA 全检达标' : 'Zero-defect chemical & physical QA' },
  ]);

  return `
    <main class="wr-inner wr-senseng-candy-inner" data-wr-page="about" style="padding-top:100px;background:#fffdfa;">
      <!-- 1. CENTERED PLAYGROUND HERO WITH FLOATING MACARON CARDS CLUSTER (NO 2-COLUMN LEFT/RIGHT SPLIT) -->
      <section style="padding:40px 24px 70px;max-width:1280px;margin:0 auto;text-align:center;">
        <div data-reveal="fade-up" style="max-width:900px;margin:0 auto 48px;">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#ffeef2;border:2px solid #ffd0d8;padding:7px 22px;border-radius:9999px;font-size:0.85rem;font-weight:900;color:#e63946;margin-bottom:20px;">
            <span>🍭</span>
            <span>${isZh ? `SENSENG 软萌触觉乐园 · ${esc(company.name || 'SENSENG')}` : `SENSENG CANDY SENSORY PLAYGROUND · ${esc((company.name || 'SENSENG').toUpperCase())}`}${company.establishedYear ? ` · EST. ${esc(company.establishedYear)}` : ''}</span>
          </div>

          <h1 style="font-size:clamp(2.4rem, 4.8vw, 3.8rem);color:#2b2d42;font-weight:900;margin:0 0 20px;line-height:1.15;letter-spacing:-0.02em;">
            ${esc(headline)}
          </h1>

          <div style="color:#555b6e;font-size:1.15rem;line-height:1.8;max-width:820px;margin:0 auto 32px;display:flex;flex-direction:column;gap:14px;">
            ${storyParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
          </div>

          <div style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:linear-gradient(135deg, #ff6b8b 0%, #ff8e72 100%);color:#ffffff;font-weight:900;padding:15px 36px;border-radius:9999px;box-shadow:0 8px 24px rgba(255,107,139,0.3);font-size:1rem;text-decoration:none;">
              ${isZh ? '开启外贸批发合作洽谈 ↗' : 'Initiate Wholesale Inquiry ↗'}
            </a>
            ${company.capabilities ? `
              <span style="font-size:0.9rem;color:#e63946;font-weight:800;background:#ffeef2;border:1px solid #ffd0d8;padding:10px 22px;border-radius:9999px;">
                ✨ ${esc(company.capabilities.slice(0, 45))}
              </span>
            ` : ''}
          </div>
        </div>

        <!-- ASYMMETRICAL 3-CARD FLOATING CANDY CLUSTER -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;align-items:center;margin-bottom:80px;" data-reveal="fade-up">
          <!-- Card 1: Marshmallow Softness (-2 deg tilt) -->
          <div class="wr-card-hover" style="background:#ffffff;border:3px solid #ffd0d8;border-radius:32px;padding:36px 28px;text-align:left;box-shadow:0 14px 36px rgba(255,107,139,0.1);transform:rotate(-2deg);transition:transform 0.3s ease;">
            <div style="width:56px;height:56px;border-radius:20px;background:#ffeef2;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:18px;">
              ☁️
            </div>
            <div style="font-size:0.8rem;font-weight:900;color:#ff6b8b;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
              0-GRAVITY FORMULA // 棉花糖触觉
            </div>
            <h3 style="font-size:1.3rem;font-weight:900;color:#2b2d42;margin:0 0 10px;">
              ${isZh ? '零重力软弹微孔发泡' : 'Cloud-Soft Micro-Pore Foaming'}
            </h3>
            <p style="font-size:0.92rem;color:#6c757d;line-height:1.65;margin:0;">
              ${isZh ? '气孔微米级均一分布，不仅阻断撕裂纹路，而且按压手感丝滑温润，杜绝异味。' : 'Uniform micro-cellular matrix prevents tears while delivering cloud-like velvety softness.'}
            </p>
          </div>

          <!-- Card 2: 5.2s Slow Rise Memory (Elevated Center Card) -->
          <div class="wr-card-hover" style="background:linear-gradient(135deg, #ff6b8b 0%, #ff8e72 100%);color:#ffffff;border-radius:36px;padding:42px 32px;text-align:center;box-shadow:0 20px 48px rgba(255,107,139,0.3);transform:scale(1.04);position:relative;z-index:2;">
            <div style="display:inline-block;background:rgba(255,255,255,0.25);backdrop-filter:blur(8px);padding:6px 16px;border-radius:9999px;font-size:0.8rem;font-weight:900;margin-bottom:14px;border:1px solid rgba(255,255,255,0.4);">
              ★ FLAGSHIP TACTILE ENGINE ★
            </div>
            <div style="font-size:3.5rem;font-weight:900;line-height:1;margin-bottom:8px;">
              5.2s
            </div>
            <h3 style="font-size:1.4rem;font-weight:900;color:#ffffff;margin:0 0 12px;">
              ${isZh ? '科学慢回弹记忆曲线' : 'Calibrated Slow-Rise Memory'}
            </h3>
            <p style="font-size:0.95rem;color:rgba(255,255,255,0.92);line-height:1.65;margin:0;">
              ${isZh ? '每一件手办出厂前经过精密回弹秒速校正，释放掌心压力，带来深度解压冥想。' : 'Precisely tuned kinetic damping absorbs stress and brings calming sensory restoration.'}
            </p>
          </div>

          <!-- Card 3: Food-Grade Fruit Dyes (+2 deg tilt) -->
          <div class="wr-card-hover" style="background:#ffffff;border:3px solid #ddd6fe;border-radius:32px;padding:36px 28px;text-align:left;box-shadow:0 14px 36px rgba(124,58,237,0.08);transform:rotate(2deg);transition:transform 0.3s ease;">
            <div style="width:56px;height:56px;border-radius:20px;background:#f3e8ff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:18px;">
              🍓
            </div>
            <div style="font-size:0.8rem;font-weight:900;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
              PURE & NON-TOXIC // 水性果味安全
            </div>
            <h3 style="font-size:1.3rem;font-weight:900;color:#2b2d42;margin:0 0 10px;">
              ${isZh ? '食品接触级水性安全色浆' : 'Food-Contact Safe Colorants'}
            </h3>
            <p style="font-size:0.92rem;color:#6c757d;line-height:1.65;margin:0;">
              ${isZh ? '通过欧盟 EN71 与美标 ASTM F963 严苛检测，耐唾液侵蚀，零塑化剂、零重金属。' : 'Certified against EN71 & ASTM standards. Saliva-resistant dyes free from phthalates and heavy metals.'}
            </p>
          </div>
        </div>
      </section>

      <!-- 2. THE TACTILE VENDING SHOWCASE WINDOW (GRAPHICAL VECTOR WITH NEVER-BLANK MEDIA) -->
      <section style="padding:0 24px 80px;max-width:1280px;margin:0 auto;">
        <div data-reveal="fade-up" style="background:#ffffff;border:3px solid #ffd0d8;border-radius:40px;overflow:hidden;box-shadow:0 20px 50px rgba(255,107,139,0.1);">
          <!-- Vending Header -->
          <div style="background:#ffeef2;border-bottom:2px solid #ffd0d8;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:1.4rem;">🍬</span>
              <strong style="font-size:1.1rem;font-weight:900;color:#e63946;letter-spacing:0.04em;">
                ${isZh ? 'SENSENG 糖果玩具工坊实景展台' : 'SENSENG ATELIER SENSORY SHOWCASE'}
              </strong>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
              <span style="background:#ffffff;border:1px solid #ffd0d8;color:#e63946;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;">
                ● 4K MACRO DEMO
              </span>
              <span style="background:#ffffff;border:1px solid #fed7aa;color:#f59e0b;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:800;">
                ★ 100,000 SQUEEZES
              </span>
            </div>
          </div>

          <!-- Interactive Showcase Body -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));align-items:stretch;">
            <!-- Illustrated Media Window (GUARANTEED NEVER BLANK) -->
            <div style="position:relative;background:radial-gradient(circle at center, #fff0f5 0%, #fff7ed 100%);min-height:380px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-right:2px solid #ffd0d8;">
              <!-- Rich Vector Background Art -->
              <svg width="100%" height="100%" viewBox="0 0 500 380" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;opacity:0.35;">
                <circle cx="250" cy="190" r="140" fill="#ffd0d8" opacity="0.4"/>
                <circle cx="250" cy="190" r="80" fill="#fed7aa" opacity="0.5"/>
                <path d="M 50 190 Q 250 80 450 190 T 50 190" fill="none" stroke="#ff6b8b" stroke-width="3" stroke-dasharray="6 6"/>
              </svg>

              <!-- Optional Image Overlay with fallback -->
              ${aboutImg ? `<img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;" onerror="this.style.display=\'none\'">` : ''}

              <!-- Visual Badge Centerpiece -->
              <div style="position:relative;z-index:2;background:rgba(255,255,255,0.92);backdrop-filter:blur(10px);border:3px solid #ffd0d8;border-radius:28px;padding:24px 32px;text-align:center;box-shadow:0 12px 30px rgba(255,107,139,0.15);max-width:320px;">
                <div style="font-size:2.8rem;margin-bottom:8px;">🧸</div>
                <div style="font-size:1.15rem;font-weight:900;color:#2b2d42;margin-bottom:4px;">
                  ${esc(company.name || 'SENSENG')} TOY LAB
                </div>
                <div style="font-size:0.85rem;color:#ff6b8b;font-weight:800;">
                  ${isZh ? '十万级无尘洁净车间出品' : 'Class 100,000 Cleanroom Certified'}
                </div>
              </div>
            </div>

            <!-- Right: 3 Sensory Feature Cards -->
            <div style="padding:40px;display:flex;flex-direction:column;justify-content:center;gap:20px;background:#ffffff;">
              <div>
                <span style="font-size:0.8rem;font-weight:900;color:#ff6b8b;letter-spacing:0.1em;text-transform:uppercase;">CANDY LAB SPECIFICATIONS</span>
                <h3 style="font-size:1.7rem;font-weight:900;color:#2b2d42;margin:6px 0 16px;">
                  ${isZh ? '精工软弹 · 每一件都经历微克级品控' : 'Precision Crafted For Joy & Relaxation'}
                </h3>
              </div>

              <div style="display:flex;gap:14px;align-items:flex-start;">
                <span style="font-size:1.5rem;background:#ffeef2;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">🛡️</span>
                <div>
                  <strong style="color:#2b2d42;font-size:1rem;display:block;">${isZh ? '欧盟 EN71 & 美标 ASTM F963 全检' : 'EN71 & ASTM F963 Lab Verified'}</strong>
                  <span style="color:#6c757d;font-size:0.9rem;line-height:1.5;">${isZh ? '全线通过独立权威毒理检测，零塑化剂、零重金属残留，畅行欧美。' : 'Independently tested for heavy metals and mechanical pull-drop endurance.'}</span>
                </div>
              </div>

              <div style="display:flex;gap:14px;align-items:flex-start;">
                <span style="font-size:1.5rem;background:#fff7ed;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">🔬</span>
                <div>
                  <strong style="color:#2b2d42;font-size:1rem;display:block;">${isZh ? '99.8% 微观微孔均匀分布' : '99.8% Cellular Homogeneity'}</strong>
                  <span style="color:#6c757d;font-size:0.9rem;line-height:1.5;">${isZh ? '真空脱泡注模，杜绝表面粗糙孔洞，触感丝滑如高级天鹅绒。' : 'Vacuum degassed foaming eliminates bubbles and surface defects completely.'}</span>
                </div>
              </div>

              <div style="display:flex;gap:14px;align-items:flex-start;">
                <span style="font-size:1.5rem;background:#f3e8ff;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">📦</span>
                <div>
                  <strong style="color:#2b2d42;font-size:1rem;display:block;">${isZh ? '环保大豆油墨印刷彩盒' : 'Soy-Ink Recyclable Paperboard'}</strong>
                  <span style="color:#6c757d;font-size:0.9rem;line-height:1.5;">${isZh ? '货架就绪型精品礼品盒包装，满足全球连锁商超与礼品零售。' : 'Shelf-ready presentation boxes optimized for global retail and gifting displays.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. RAINBOW STRIP BOUNCY COUNTER MARQUEE -->
      <section style="padding:0 24px 80px;max-width:1280px;margin:0 auto;" data-reveal="fade-up">
        <div style="background:linear-gradient(135deg, #ff6b8b 0%, #ff8e72 50%, #8b5cf6 100%);color:#ffffff;border-radius:36px;padding:48px 32px;box-shadow:0 18px 44px rgba(255,107,139,0.25);text-align:center;">
          <h2 style="font-size:2.2rem;font-weight:900;color:#ffffff;margin:0 0 10px;">
            ${isZh ? '出海制造实力与供应链保障' : 'Global Supply Chain Prowess'}
          </h2>
          <p style="opacity:0.92;font-size:1.05rem;max-width:640px;margin:0 auto 36px;">
            ${isZh ? '十余年外贸玩具制造沉淀，为您提供从工业设计到全球报关出海的一站式服务。' : 'Decade of specialized toy manufacturing serving tier-1 retailers across 60+ countries.'}
          </p>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;">
            ${stats.map((s) => `
              <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);border-radius:24px;padding:24px 16px;">
                <div style="font-size:2.6rem;font-weight:900;color:#ffffff;" data-counter="${s.num}" data-suffix="${esc(s.suffix || '')}" data-prefix="${esc(s.prefix || '')}">
                  ${esc(s.value)}
                </div>
                <div style="font-size:0.92rem;opacity:0.95;margin-top:6px;font-weight:800;">
                  ${esc(s.label)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderCandyAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyCandyAbout(ctx);
  }
  return renderModernCandyAbout(ctx);
}

export function renderCandyContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-senseng-candy-inner" data-wr-page="contact" style="padding-top:100px;background:#fffdfa;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div data-reveal="fade-up" style="text-align:center;max-width:680px;margin:0 auto 40px;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:#ffeef2;border:2px solid #ffd0d8;padding:6px 18px;border-radius:9999px;font-size:0.82rem;font-weight:900;color:#e63946;margin-bottom:16px;">
            📬 ${isZh ? '快速联系与样品索取' : 'CONNECT WITH SENSENG TOYS'}
          </div>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);color:#2b2d42;font-weight:900;margin:0 0 16px;">
            ${isZh ? '与我们开启快乐合作' : 'Let’s Create Joy Together'}
          </h1>
          <p style="color:#6c757d;font-size:1.1rem;line-height:1.6;">
            ${isZh ? '我们为全球批发商、跨境卖家与品牌商提供免费样品包寄送、阶梯批发报价与 OEM 方案。' : 'Request our physical sample kit, get tiered wholesale volume pricing, or discuss bespoke OEM packaging.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:start;">
          <!-- Contact Info Cards -->
          <div data-reveal="fade-up">
            <div style="background:#ffffff;border:3px solid #ffccd5;border-radius:28px;padding:32px;box-shadow:0 8px 24px rgba(255,107,139,0.06);margin-bottom:24px;" class="wr-card-hover">
              <h3 style="font-size:1.3rem;font-weight:900;color:#2b2d42;margin:0 0 18px;">
                ${isZh ? '直接联络方式' : 'Direct Contacts'}
              </h3>
              <div style="display:grid;gap:18px;font-size:0.95rem;">
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '企业名称' : 'Company Name'}</span>
                  <strong style="color:#2b2d42;font-size:1.05rem;">${esc(company.name)}</strong>
                </div>
                ${company.email ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '官方外贸邮箱' : 'Direct Email'}</span>
                    <a class="text-link" style="color:#ff6b8b;font-weight:800;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
                  </div>
                ` : ''}
                ${company.phone ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '客服与外贸热线' : 'Phone'}</span>
                    <a class="text-link" style="color:#2b2d42;font-weight:800;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
                  </div>
                ` : ''}
                ${waDigits ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">WhatsApp</span>
                    <a class="text-link" target="_blank" rel="noopener noreferrer" style="color:#25d366;font-weight:800;" href="https://wa.me/${esc(waDigits)}">+${esc(waDigits)} (Click to Chat ↗)</a>
                  </div>
                ` : ''}
                ${company.address ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '工厂与展厅地址' : 'Factory & Showroom'}</span>
                    <span style="color:#555b6e;">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div style="background:#fff5f7;border:2px solid #ffd0d8;border-radius:24px;padding:24px;" class="wr-card-hover">
              <h4 style="font-size:1.05rem;font-weight:900;color:#c9184a;margin:0 0 8px;">
                🎁 ${isZh ? '样品政策 (Sample Policy)' : 'Sample Kit Policy'}
              </h4>
              <p style="font-size:0.88rem;color:#6c757d;line-height:1.6;margin:0;">
                ${isZh ? '经核实的玩具采购商与零售客户可申请免费样品套件（涵盖柴犬/猫咪/变色独角鲸经典款），顺丰/DHL 快速直达。' : 'Verified commercial buyers and retailers can receive a free curating sample pack (covering Shiba, Kitten, and Narwhal). Express dispatch worldwide.'}
              </p>
            </div>
          </div>

          <!-- Functional Inquiry Form -->
          <div style="background:#ffffff;border:3px solid #ffccd5;border-radius:28px;padding:36px;box-shadow:0 12px 32px rgba(255,107,139,0.08);" class="wr-card-hover" data-reveal="fade-up">
            <h3 style="font-size:1.4rem;font-weight:900;color:#2b2d42;margin:0 0 8px;">
              ${isZh ? '在线询盘与样品申请表' : 'Inquiry & Sample Request Form'}
            </h3>
            <p style="color:#6c757d;font-size:0.92rem;margin:0 0 24px;">
              ${isZh ? '填写以下信息，我们的外贸客户经理将在 2 小时内为您回复详细报价单与规格书。' : 'Fill out the form below and our wholesale representative will respond within 2 hours with pricing sheets.'}
            </p>

            <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;gap:18px;">
              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#2b2d42;font-size:0.88rem;">
                ${esc(ui.name)} *
                <input name="name" autocomplete="name" required maxlength="120" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:0.95rem;outline:none;" placeholder="${isZh ? '您的姓名' : 'Your Full Name'}">
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#2b2d42;font-size:0.88rem;">
                ${esc(ui.email)} *
                <input name="email" type="email" autocomplete="email" required maxlength="254" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:0.95rem;outline:none;" placeholder="${isZh ? '您的商务邮箱' : 'your.name@company.com'}">
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#2b2d42;font-size:0.88rem;">
                ${esc(ui.company)} (${esc(ui.optional)})
                <input name="company" autocomplete="organization" maxlength="200" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:0.95rem;outline:none;" placeholder="${isZh ? '公司名称 / 零售店铺' : 'Company or Store Name'}">
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#2b2d42;font-size:0.88rem;">
                ${esc(ui.product)} (${esc(ui.optional)})
                <select name="productId" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:0.95rem;outline:none;background:#ffffff;">
                  <option value="">— ${isZh ? '请选择感兴趣的玩具款式' : 'Select Product (Optional)'} —</option>
                  ${products.map((item) => `<option value="${esc(item.id)}"${item.id === options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#2b2d42;font-size:0.88rem;">
                ${esc(ui.message)} *
                <textarea name="message" required maxlength="5000" rows="4" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:0.95rem;outline:none;resize:vertical;" placeholder="${isZh ? '请描述您的采购数量、定制包装需求或目标交期...' : 'Tell us about your target quantity, destination country, or custom packaging requirements...'}"></textarea>
              </label>

              <div class="honeypot" aria-hidden="true" style="display:none;">
                <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
              </div>

              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#ff6b8b;color:#ffffff;font-weight:900;border:none;padding:16px 24px;border-radius:9999px;font-size:1rem;cursor:pointer;box-shadow:0 8px 24px rgba(255,107,139,0.3);margin-top:8px;">
                ${esc(ui.send)} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:0;font-size:0.9rem;font-weight:700;color:#e63946;"></p>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderCandyPage(ctx: ThemeContext): string {
  const { draft, page, path, navAttrs, ui } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const logo = ctx.asset(company.logoAssetId);
  const brand = logo ? `<img src="${esc(logo)}" alt="${esc(company.name)}" style="max-height:40px;object-fit:contain;">` : `<span style="font-weight:900;font-size:1.4rem;color:#ff6b8b;letter-spacing:-0.02em;">${esc(company.name)}</span>`;

  // Language links
  const depth = page === 'home' ? '' : '../';
  const languageLinks = draft.languages
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:800;padding:4px 8px;border-radius:6px;text-decoration:none;${l === ctx.lang ? 'background:#ff6b8b;color:#ffffff;' : 'color:#555b6e;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-candy-header" style="position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-bottom:2px solid #ffeef2;box-shadow:0 4px 16px rgba(255,107,139,0.06);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
          ${brand}
        </a>
        <nav style="display:flex;align-items:center;gap:24px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'home' ? '#ff6b8b' : '#2b2d42'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'catalog' ? '#ff6b8b' : '#2b2d42'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'about' ? '#ff6b8b' : '#2b2d42'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'contact' ? '#ff6b8b' : '#2b2d42'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" style="background:#ff6b8b;color:#ffffff;font-weight:800;padding:10px 22px;border-radius:9999px;font-size:0.86rem;box-shadow:0 4px 14px rgba(255,107,139,0.25);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '批发询盘 ↗' : 'Wholesale ↗'}
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';
  switch (page) {
    case 'catalog': mainHtml = renderCandyCatalog(ctx); break;
    case 'detail': mainHtml = renderCandyDetail(ctx); break;
    case 'about': mainHtml = renderCandyAbout(ctx); break;
    case 'contact': mainHtml = renderCandyContact(ctx); break;
    default: mainHtml = renderCandyHome(ctx); break;
  }

  const footerHtml = `
    <footer style="background:#fff5f7;border-top:2px solid #ffd0d8;padding:60px 0 30px;color:#555b6e;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:36px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.3rem;font-weight:900;color:#ff6b8b;margin-bottom:12px;">${esc(company.name)}</div>
          <p style="font-size:0.9rem;line-height:1.6;margin:0 0 16px;">
            ${isZh ? '专注儿童童趣感官玩具与全龄触觉减压潮玩。100% 食品级安全材质，为全球家庭传递欢笑。' : 'Dedicated to premium sensory squishy toys and stress relief companions. Certified child-safe materials for global families.'}
          </p>
          <div style="font-size:0.85rem;color:#8d99ae;">ASTM F963 · EN71 · CE · CPSIA</div>
        </div>

        <div>
          <h4 style="font-size:0.95rem;font-weight:900;color:#2b2d42;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.9rem;">
            <li><a style="text-decoration:none;color:#555b6e;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '柴犬微爆珠系列' : 'Crunchy Shiba Series'}</a></li>
            <li><a style="text-decoration:none;color:#555b6e;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '儿童萌宠乐园系列' : 'Kids Play Animals'}</a></li>
            <li><a style="text-decoration:none;color:#555b6e;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '工位静心减压系列' : 'Adult Desk Companions'}</a></li>
            <li><a style="text-decoration:none;color:#555b6e;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '奇幻温感变色系列' : 'Thermo Color-Changing'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.95rem;font-weight:900;color:#2b2d42;margin:0 0 14px;text-transform:uppercase;">${isZh ? '工贸出海优势' : 'Factory Capabilities'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.9rem;">
            <li>✓ ${isZh ? '10,000㎡ 洁净无尘生产基地' : '10,000m² Cleanroom Workshop'}</li>
            <li>✓ ${isZh ? '月产 120 万件大宗出海产能' : '1.2M Monthly Unit Capacity'}</li>
            <li>✓ ${isZh ? '支持 OEM/ODM 彩盒包装开模' : 'Bespoke Molds & Box Branding'}</li>
            <li>✓ ${isZh ? '出口欧美日韩 60+ 国家' : 'Exported to 60+ Countries'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.95rem;font-weight:900;color:#2b2d42;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="font-size:0.9rem;margin:0 0 8px;"><strong>Email:</strong> <a style="color:#ff6b8b;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="font-size:0.9rem;margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="font-size:0.85rem;color:#8d99ae;margin:0;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #ffd0d8;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.85rem;color:#8d99ae;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>🍭 Senseng Candy Club · Sensory Play & Joy</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
