import type { Product } from '../../shared/model';
import { esc, safeUrl, type ThemeContext } from './types';
import { CANDY_DEFAULT_PRODUCTS, getCandyProducts } from './sensengCandy';

export function renderWonderHome(ctx: ThemeContext): string {
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
  const pAt = (idx: number) => (products.length > 0 ? products[idx % products.length] : heroProduct);

  const copy = draft.copy[ctx.lang] ?? {
    headline: isZh ? '为好奇童心与忙碌日常，打造温润治愈的触觉玩伴' : 'Thoughtfully Crafted Tactile Companions for Calm Minds & Playful Hearts',
    subtitle: isZh
      ? '源自北欧极简美学与现代人体工学。选用经国际认证的无毒食品级高弹聚合物，将温柔的抚慰与专注的平静融入每一次揉捏。'
      : 'Rooted in gentle Nordic aesthetics and tactile ergonomics. Crafted with certified non-toxic food-grade polymers to bring mindful serenity to every squeeze.',
    cta: isZh ? '探索完整绘本系列' : 'Discover the Wonder Collection',
  };

  // Top Nordic Ribbon
  const ribbonHtml = `
    <div class="wr-wonder-ribbon" style="background:#264653;color:#e9d8a6;padding:9px 0;font-size:0.85rem;font-weight:700;text-align:center;">
      <div class="wrap" style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
        <span>🌿 ${isZh ? 'Senseng 北欧温润玩具工坊 · 100% 环保无毒材料 · ASTM F963 / EN71 欧盟认证' : 'Senseng Wonder Toys · 100% Eco-Safe Non-Toxic Materials · ASTM F963 & EN71 Certified'}</span>
        <span style="opacity:0.6;">·</span>
        <span>🚢 ${isZh ? '支持全球商户 OEM 定制包装 · 现货与大宗批发直发' : 'Worldwide Wholesale & Bespoke Private Label Packaging'}</span>
      </div>
    </div>
  `;

  // Hero Full-Width Story Stage
  const heroHtml = `
    <section class="wr-wonder-hero" aria-label="${esc(copy.headline)}" style="background:linear-gradient(180deg, #fbf8f3 0%, #f4ede1 100%);padding:80px 0 90px;position:relative;overflow:hidden;border-bottom:1px solid #e9dfd0;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:54px;align-items:center;">
        <!-- Left Editorial Copy -->
        <div>
          <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:1px solid #e0d4c1;padding:6px 18px;border-radius:9999px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <span style="font-size:0.9rem;">🌾</span>
            <span style="font-size:0.8rem;font-weight:800;color:#2a9d8f;letter-spacing:0.06em;text-transform:uppercase;">
              ${isZh ? '北欧自然主义 · 触觉美学玩具' : 'NORDIC PLAY & TACTILE WELLNESS'}
            </span>
          </div>

          <h1 class="hero-title" style="font-size:clamp(2.3rem, 4.2vw, 3.6rem);line-height:1.18;font-weight:900;letter-spacing:-0.02em;color:#264653;margin:0 0 22px;">
            ${esc(copy.headline)}
          </h1>

          <p style="font-size:1.15rem;line-height:1.75;color:#5c6b73;margin:0 0 36px;max-width:560px;">
            ${esc(copy.subtitle)}
          </p>

          <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;">
            <a class="button" style="background:#e76f51;color:#ffffff;font-weight:800;padding:16px 36px;border-radius:12px;font-size:0.96rem;box-shadow:0 6px 20px rgba(231,111,81,0.3);transition:transform 0.2s;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
              ${esc(copy.cta || (isZh ? '查看全部玩具 ↗' : 'Explore Collection ↗'))}
            </a>
            <a class="button" style="background:#ffffff;color:#264653;border:1px solid #c9bda8;font-weight:700;padding:15px 30px;border-radius:12px;font-size:0.96rem;" href="${path('about/index.html')}" ${navAttrs('about')}>
              ${isZh ? '走进 Senseng 工坊故事 →' : 'Read Our Workshop Story →'}
            </a>
          </div>

          <div style="margin-top:40px;display:flex;gap:24px;flex-wrap:wrap;color:#6c757d;font-size:0.88rem;font-weight:700;">
            <div>✓ ${isZh ? '欧盟食品级安全检测' : 'EN71 Safe Tested'}</div>
            <div>✓ ${isZh ? '20,000次抗疲劳拉伸' : '20,000 Squeezes Tested'}</div>
            <div>✓ ${isZh ? '大豆油墨纸盒包装' : 'Eco-Soy Packaging'}</div>
          </div>
        </div>

        <!-- Right Visual Showcase -->
        <div style="text-align:center;">
          <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:24px;padding:40px;box-shadow:0 24px 60px rgba(38,70,83,0.1);max-width:480px;margin:0 auto;position:relative;">
            <img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" style="width:100%;max-height:360px;object-fit:contain;animation:wrFloat 4.5s ease-in-out infinite alternate;">
            <div style="margin-top:20px;padding-top:20px;border-top:1px solid #f0e6d8;display:flex;justify-content:space-between;align-items:center;text-align:left;">
              <div>
                <span style="font-size:0.75rem;font-weight:800;color:#e76f51;text-transform:uppercase;">${esc(heroProduct.badge)}</span>
                <div style="font-size:1.05rem;font-weight:900;color:#264653;">${esc(heroProduct.name)}</div>
              </div>
              <a class="button" style="background:#2a9d8f;color:#ffffff;font-size:0.85rem;font-weight:800;padding:8px 18px;border-radius:8px;" href="${path(`products/${heroProduct.id}/index.html`)}" ${navAttrs('detail', heroProduct.id)}>
                ${isZh ? '详情 ↗' : 'View ↗'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Bento Box Grid (北欧便当盒五格精选画廊)
  const bentoHtml = `
    <section class="wrap" style="padding:70px 0 40px;">
      <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
        <span class="eyebrow" style="color:#2a9d8f;font-weight:800;letter-spacing:0.06em;">${isZh ? '匠心工坊解构' : 'BENTO BOX SHOWCASE'}</span>
        <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.7rem);color:#264653;font-weight:900;margin:8px 0 12px;">
          ${isZh ? '一件好玩具的严谨细节与诗意' : 'Where Modern Safety Meets Tactile Poetry'}
        </h2>
        <p style="color:#5c6b73;font-size:1.05rem;line-height:1.65;">
          ${isZh ? '我们以严苛的工贸标准制造玩具，以温柔的北欧笔触传递快乐。' : 'Balancing industrial export rigor with gentle, minimalist aesthetics.'}
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;">
        <!-- Big Bento Card (Col 1-2, Row 1-2) -->
        <div style="grid-column: span 2;background:#ffffff;border:1px solid #e7dcce;border-radius:24px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.04);display:flex;flex-direction:column;justify-content:space-between;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;">
            <div>
              <span style="font-size:0.8rem;font-weight:800;color:#e76f51;letter-spacing:0.04em;">HERO CRAFT · 爆珠手感</span>
              <h3 style="font-size:1.6rem;font-weight:900;color:#264653;margin:6px 0 10px;">
                ${isZh ? '独创微爆珠充填工艺 · 沙沙酥脆的指尖盛宴' : 'Crunchy Micro-Bead Fluid Filling Innovation'}
              </h3>
              <p style="color:#5c6b73;font-size:0.95rem;line-height:1.65;max-width:480px;">
                ${isZh ? '内胆充填数万颗食品级微弹珠粒，在手指深捏与回揉时发出细密治愈的爆破音浪，带来视觉、触觉与听觉的三重情绪减压。' : 'Thousands of micro-elastic beads provide a soothing auditory crunch and fluid tactile resistance.'}
              </p>
            </div>
            <div style="background:#f4ede1;border-radius:16px;padding:12px 20px;text-align:center;">
              <span style="font-size:1.6rem;font-weight:900;color:#264653;display:block;">100%</span>
              <span style="font-size:0.75rem;color:#5c6b73;font-weight:700;">${isZh ? '食品级环保TPR' : 'Food-Grade TPR'}</span>
            </div>
          </div>
          <div style="text-align:center;padding:24px 0 10px;">
            <img src="${esc(pAt(0).img)}" alt="" style="max-height:220px;object-fit:contain;">
          </div>
        </div>

        <!-- Top Right Bento -->
        <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:24px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.04);display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <span style="font-size:0.78rem;font-weight:800;color:#2a9d8f;letter-spacing:0.04em;">THERMAL MAGIC · 温感变色</span>
            <h3 style="font-size:1.3rem;font-weight:900;color:#264653;margin:6px 0 8px;">
              ${isZh ? '奇幻独角鲸体温渐变' : 'Thermochromic Color Shift'}
            </h3>
            <p style="color:#5c6b73;font-size:0.88rem;line-height:1.6;">
              ${isZh ? '双手体温轻抚即在淡紫、天蓝与粉桃间变换，为探索期儿童带来直观的物理温度感知。' : 'Shifts color gracefully with hand warmth, igniting childish wonder and thermal curiosity.'}
            </p>
          </div>
          <div style="text-align:center;padding-top:12px;">
            <img src="${esc(pAt(5).img)}" alt="" style="max-height:150px;object-fit:contain;">
          </div>
        </div>

        <!-- Bottom Row Bento 1 -->
        <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2rem;margin-bottom:8px;">🛡️</div>
          <h4 style="font-size:1.1rem;font-weight:900;color:#264653;margin:0 0 6px;">
            ${isZh ? '欧洲 CE & 美标 ASTM 权威实验室' : 'Certified Child-Safe'}
          </h4>
          <p style="font-size:0.86rem;color:#5c6b73;line-height:1.6;margin:0;">
            ${isZh ? '通过 EN71-1/2/3 机械与物理、易燃性与特定元素迁移检测，零甲醛，零增塑剂。' : 'Independently tested for drop, choke, and heavy metal limits under EN71 and ASTM F963.'}
          </p>
        </div>

        <!-- Bottom Row Bento 2 -->
        <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2rem;margin-bottom:8px;">📦</div>
          <h4 style="font-size:1.1rem;font-weight:900;color:#264653;margin:0 0 6px;">
            ${isZh ? '大豆油墨环保礼盒包装' : 'Eco Paperboard Packaging'}
          </h4>
          <p style="font-size:0.86rem;color:#5c6b73;line-height:1.6;margin:0;">
            ${isZh ? '支持高克重环保白卡盒、开窗展示、柔性条形码标签与全球亚马逊 FBA 贴标。' : 'Presentation paperboard gift boxes printed with vegetable soy inks, ready for retail shelves.'}
          </p>
        </div>

        <!-- Bottom Row Bento 3 -->
        <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:24px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="font-size:2rem;margin-bottom:8px;">🤝</div>
          <h4 style="font-size:1.1rem;font-weight:900;color:#264653;margin:0 0 6px;">
            ${isZh ? '全球柔性外贸直采与打样' : 'Wholesale & Quick Sampling'}
          </h4>
          <p style="font-size:0.86rem;color:#5c6b73;line-height:1.6;margin:0;">
            ${isZh ? '现货小起订量批发，3天快速打样，整柜集装箱出海直运欧美日韩。' : 'Low MOQ trial orders, 3-day rapid physical sampling, and direct ocean container delivery.'}
          </p>
        </div>
      </div>
    </section>
  `;

  // Staggered Storybook Chapters
  const storyChaptersHtml = `
    <section class="wrap" style="padding:60px 0;">
      <!-- Chapter 1 -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;margin-bottom:70px;">
        <div style="background:#f4ede1;border-radius:24px;padding:40px;text-align:center;">
          <img src="${esc(pAt(1).img)}" alt="" style="max-height:280px;object-fit:contain;">
        </div>
        <div>
          <span style="font-size:0.8rem;font-weight:800;color:#e76f51;text-transform:uppercase;">CHAPTER 01 · LITTLE HANDS</span>
          <h3 style="font-size:1.9rem;font-weight:900;color:#264653;margin:8px 0 16px;">
            ${isZh ? '专为儿童小手设计的温柔力量' : 'Mindful Moments for Growing Explorers'}
          </h3>
          <p style="font-size:1.05rem;line-height:1.75;color:#5c6b73;margin:0 0 20px;">
            ${isZh ? '幼儿对手指力量的探索是脑部神经发育的关键窗口。Senseng 捏捏乐经过数千次按压阻力测试，提供适中、柔韧而不塌陷的支撑力，让孩子在无拘无束的揉捏中锻炼手指精细运动抓握力。' : 'A child’s tactile exploration is essential for brain neurological development. Senseng squishies are calibrated with balanced resistance to strengthen hand arches without fatiguing little wrists.'}
          </p>
          <div style="display:flex;gap:16px;">
            <a class="button" style="background:#2a9d8f;color:#ffffff;font-weight:800;padding:12px 24px;border-radius:8px;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
              ${isZh ? '浏览儿童系列 ↗' : 'Explore Kids Collection ↗'}
            </a>
          </div>
        </div>
      </div>

      <!-- Chapter 2 -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;">
        <div>
          <span style="font-size:0.8rem;font-weight:800;color:#2a9d8f;text-transform:uppercase;">CHAPTER 02 · DESK COMPANIONS</span>
          <h3 style="font-size:1.9rem;font-weight:900;color:#264653;margin:8px 0 16px;">
            ${isZh ? '现代办公桌上的一隅宁静绿洲' : 'A Peaceful Tactile Oasis on Modern Desks'}
          </h3>
          <p style="font-size:1.05rem;line-height:1.75;color:#5c6b73;margin:0 0 20px;">
            ${isZh ? '在繁忙的数据报表、代码调试与冗长会议间隙，指尖轻轻一握，5秒钟慢回弹的优雅节奏让紧绷的神经得到舒缓。没有刺耳的声响，只有柔软的陪伴与内心的释然。' : 'Amidst endless video calls and keyboard marathons, a single mindful squeeze resets mental friction. Completely silent, unobtrusive, and charmingly reassuring.'}
          </p>
          <div style="display:flex;gap:16px;">
            <a class="button" style="background:#e76f51;color:#ffffff;font-weight:800;padding:12px 24px;border-radius:8px;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
              ${isZh ? '浏览办公工位伴侣 ↗' : 'Explore Desk Buddies ↗'}
            </a>
          </div>
        </div>
        <div style="background:#f4ede1;border-radius:24px;padding:40px;text-align:center;">
          <img src="${esc(pAt(2).img)}" alt="" style="max-height:280px;object-fit:contain;">
        </div>
      </div>
    </section>
  `;

  // Curated Products Wall
  const productsWallHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span class="eyebrow" style="color:#2a9d8f;font-weight:800;">${isZh ? 'Senseng 画廊陈列' : 'THE COMPLETE COLLECTION'}</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:6px;color:#264653;font-weight:900;">
            ${isZh ? '八款精选感官潮玩' : 'Eight Mindful Companions'}
          </h2>
        </div>
        <a class="text-link" style="color:#2a9d8f;font-weight:800;font-size:1.05rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px;">
        ${products.map((p) => `
          <div class="wr-wonder-card" style="background:#ffffff;border:1px solid #e7dcce;border-radius:20px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.25s,box-shadow 0.25s;">
            <div style="background:#fbf8f3;padding:28px;text-align:center;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #f0e6d8;">
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:210px;object-fit:contain;" loading="lazy">
            </div>
            <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <span style="font-size:0.75rem;font-weight:800;color:#2a9d8f;text-transform:uppercase;">${esc(p.badge)}</span>
                <h3 style="font-size:1.15rem;font-weight:900;color:#264653;margin:6px 0 8px;line-height:1.35;">${esc(p.name)}</h3>
                <p style="font-size:0.86rem;color:#6c757d;line-height:1.55;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.desc)}</p>
              </div>
              <div>
                <div style="font-size:0.8rem;color:#8d99ae;margin-bottom:14px;">📐 ${esc(p.dimensions)} · ${esc(p.material)}</div>
                <a class="button" style="display:block;text-align:center;background:#264653;color:#ffffff;font-weight:800;border-radius:8px;padding:12px;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${isZh ? '查看详情与样品 ↗' : 'View Details & Samples ↗'}
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // FAQ Section
  const faqHtml = `
    <section class="wrap" style="padding:40px 0 70px;">
      <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
        <span class="eyebrow" style="color:#2a9d8f;font-weight:800;">${isZh ? '采购与工艺问答' : 'FREQUENTLY ASKED QUESTIONS'}</span>
        <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);color:#264653;font-weight:900;margin:6px 0 0;">
          ${isZh ? '常见采购与定制问答' : 'Wholesale & Craft Inquiries'}
        </h2>
      </div>

      <div style="max-width:800px;margin:0 auto;display:grid;gap:16px;">
        <details style="background:#ffffff;border:1px solid #e7dcce;border-radius:16px;padding:20px 24px;cursor:pointer;">
          <summary style="font-weight:900;font-size:1.05rem;color:#264653;outline:none;">
            ${isZh ? '1. Senseng 捏捏乐使用的材质符合哪些国际安全标准？' : '1. Which international safety standards do Senseng squishies meet?'}
          </summary>
          <p style="color:#5c6b73;font-size:0.92rem;line-height:1.7;margin:12px 0 0;">
            ${isZh ? '我们全线产品均采用食品级高弹环保 TPR、安全发泡聚合物与环保微珠，严格通过欧盟 EN71（Part 1, 2, 3）、美国 ASTM F963-23、CPSIA、CPC 以及 CE 认证，完全不含邻苯二甲酸酯（增塑剂）、重金属与双酚A。' : 'All products use food-grade eco-TPR, safe memory polymers, and purified micro-beads. Tested and certified under EN71 (Parts 1-3), ASTM F963-23, CPSIA, and CE, completely free of BPA, phthalates, and lead.'}
          </p>
        </details>

        <details style="background:#ffffff;border:1px solid #e7dcce;border-radius:16px;padding:20px 24px;cursor:pointer;">
          <summary style="font-weight:900;font-size:1.05rem;color:#264653;outline:none;">
            ${isZh ? '2. 玩具如果脏了应该如何清洗与保养？' : '2. How should the squishies be cleaned if they get dusty?'}
          </summary>
          <p style="color:#5c6b73;font-size:0.92rem;line-height:1.7;margin:12px 0 0;">
            ${isZh ? '只需用温水加少量洗手液或温和洗洁精轻柔冲洗，冲净后用纸巾吸干或自然风干。可在表面轻轻拍上一层爽身粉或玉米淀粉，即可瞬间恢复出厂时如丝绒般干爽细腻的亲肤手感。' : 'Gently rinse with warm water and mild soap. Pat dry with a towel. Dusting with a pinch of baby powder or cornstarch immediately restores the velvety matte finish.'}
          </p>
        </details>

        <details style="background:#ffffff;border:1px solid #e7dcce;border-radius:16px;padding:20px 24px;cursor:pointer;">
          <summary style="font-weight:900;font-size:1.05rem;color:#264653;outline:none;">
            ${isZh ? '3. 支持哪些定制服务？定制包装的起订量 (MOQ) 是多少？' : '3. What custom OEM services are supported, and what is the MOQ?'}
          </summary>
          <p style="color:#5c6b73;font-size:0.92rem;line-height:1.7;margin:12px 0 0;">
            ${isZh ? '我们提供全链路定制：包括定制品牌彩盒（MOQ 1,000 件起）、指定 Pantone 色号调色、加印品牌 Logo 或专属造型开模（MOQ 3,000 件起）。常规模版现货批发 200 件起即可出货。' : 'We offer end-to-end OEM services: custom soy-ink printed presentation boxes from 1,000 pcs; bespoke Pantone color-matching and custom molds from 3,000 pcs. In-stock catalog items start at 200 pcs.'}
          </p>
        </details>

        <details style="background:#ffffff;border:1px solid #e7dcce;border-radius:16px;padding:20px 24px;cursor:pointer;">
          <summary style="font-weight:900;font-size:1.05rem;color:#264653;outline:none;">
            ${isZh ? '4. 海外采购商如何索取样品？' : '4. How can international buyers request physical sample kits?'}
          </summary>
          <p style="color:#5c6b73;font-size:0.92rem;line-height:1.7;margin:12px 0 0;">
            ${isZh ? '在联系我们页面填写采购需求，或直接通过 WhatsApp 联系外贸代表，经核实真实商业身份后，我们将在 24 小时内顺丰国际或 DHL 寄出包含完整 8 款玩具的实物样品包。' : 'Submit an inquiry through our Contact page or WhatsApp. Verified buyers receive a curated sample kit containing our bestseller models via DHL Express within 24 hours.'}
          </p>
        </details>
      </div>
    </section>
  `;

  // Workshop Direct Wholesale CTA
  const ctaHtml = `
    <section class="wrap" style="padding:0 0 80px;">
      <div style="background:#264653;color:#ffffff;border-radius:24px;padding:54px 40px;text-align:center;">
        <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#ffffff;margin:0 0 14px;">
          ${isZh ? '与 Senseng 工坊直通全球优质玩具供应链' : 'Connect with the Senseng Toy Workshop'}
        </h2>
        <p style="max-width:600px;margin:0 auto 32px;color:#e9d8a6;font-size:1.08rem;line-height:1.7;">
          ${isZh ? '无论是欧洲精品百货、美国零售巨头，还是新兴跨境品牌，我们为您提供可靠的工贸直采品质与安心的售后保障。' : 'Direct factory partnerships for boutique toy retailers, department stores, and global brands.'}
        </p>
        <div style="display:inline-flex;gap:18px;flex-wrap:wrap;justify-content:center;">
          <a class="button" style="background:#e76f51;color:#ffffff;font-weight:800;padding:16px 36px;border-radius:12px;font-size:0.96rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '联系工坊外贸代表 ↗' : 'Inquire for Wholesale ↗'}
          </a>
          <a class="button" style="background:transparent;color:#ffffff;border:1px solid #e9d8a6;font-weight:700;padding:15px 32px;border-radius:12px;font-size:0.96rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ${isZh ? '下载产品图册 ↗' : 'View Catalog ↗'}
          </a>
        </div>
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-senseng-wonder-inner" data-wr-page="home">
      ${ribbonHtml}
      ${heroHtml}
      ${bentoHtml}
      ${storyChaptersHtml}
      ${productsWallHtml}
      ${faqHtml}
      ${ctaHtml}
    </main>
  `;
}

export function renderWonderCatalog(ctx: ThemeContext): string {
  const { ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-wonder-inner" data-wr-page="catalog" style="padding-top:100px;background:#fbf8f3;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
          <span style="font-size:0.8rem;font-weight:800;color:#2a9d8f;letter-spacing:0.06em;text-transform:uppercase;">
            ${isZh ? '工坊产品画廊' : 'WORKSHOP CATALOGUE'}
          </span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);color:#264653;font-weight:900;margin:8px 0 16px;">
            ${isZh ? 'Senseng 全部治愈玩具系列' : 'Our Full Collection of Wonder Toys'}
          </h1>
          <p style="color:#5c6b73;font-size:1.1rem;line-height:1.65;">
            ${isZh ? '8款独家设计感官潮玩，符合全球主要国家儿童玩具安全法案。' : 'Eight bespoke tactile sensory toys compliant with major global toy safety directives.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:28px;">
          ${products.map((p) => `
            <div class="wr-wonder-card" style="background:#ffffff;border:1px solid #e7dcce;border-radius:20px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.25s,box-shadow 0.25s;">
              <div style="background:#fbf8f3;padding:28px;text-align:center;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #f0e6d8;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:220px;object-fit:contain;" loading="lazy">
              </div>
              <div style="padding:22px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <span style="font-size:0.75rem;font-weight:800;color:#2a9d8f;text-transform:uppercase;">${esc(p.badge)}</span>
                  <h3 style="font-size:1.15rem;font-weight:900;color:#264653;margin:6px 0 8px;line-height:1.35;">${esc(p.name)}</h3>
                  <p style="font-size:0.86rem;color:#6c757d;line-height:1.55;margin:0 0 16px;">${esc(p.desc)}</p>
                </div>
                <div>
                  <div style="font-size:0.8rem;color:#8d99ae;margin-bottom:14px;">📐 ${esc(p.dimensions)} · ${esc(p.material)}</div>
                  <a class="button" style="display:block;text-align:center;background:#264653;color:#ffffff;font-weight:800;border-radius:8px;padding:12px;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${isZh ? '规格参数与采购 ↗' : 'Details & Inquiry ↗'}
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

export function renderWonderDetail(ctx: ThemeContext): string {
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
    <main class="wr-inner wr-senseng-wonder-inner" data-wr-page="detail" style="padding-top:100px;background:#fbf8f3;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="margin-bottom:24px;">
          <a class="text-link" style="color:#2a9d8f;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ← ${isZh ? '返回全部产品画廊' : 'Back to Gallery'}
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:start;">
          <!-- Left: Big Product Image -->
          <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:28px;padding:48px;text-align:center;box-shadow:0 12px 36px rgba(0,0,0,0.06);">
            <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:400px;object-fit:contain;">
            <div style="margin-top:24px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
              <span style="background:#f4ede1;color:#264653;padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:800;">✓ 100% Non-Toxic</span>
              <span style="background:#f4ede1;color:#264653;padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:800;">✓ EN71 & ASTM</span>
              <span style="background:#f4ede1;color:#264653;padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:800;">✓ 5s Slow Rise</span>
            </div>
          </div>

          <!-- Right: Details -->
          <div>
            <span style="font-size:0.8rem;font-weight:800;color:#2a9d8f;letter-spacing:0.04em;">${esc(p.badge)}</span>
            <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#264653;margin:8px 0 14px;line-height:1.2;">
              ${esc(p.name)}
            </h1>
            <div style="font-size:1.05rem;font-weight:800;color:#e76f51;margin-bottom:20px;">
              ${esc(p.tagline)}
            </div>
            <p style="font-size:1.05rem;line-height:1.75;color:#5c6b73;margin:0 0 30px;">
              ${esc(p.desc)}
            </p>

            <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:18px;padding:24px;margin-bottom:32px;">
              <h3 style="font-size:1.05rem;font-weight:900;color:#264653;margin:0 0 16px;">
                ${isZh ? '工坊技术参数' : 'Workshop Specifications'}
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.92rem;">
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '主要材质' : 'Material'}</span>
                  <strong style="color:#264653;">${esc(p.material)}</strong>
                </div>
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '规格尺寸' : 'Dimensions'}</span>
                  <strong style="color:#264653;">${esc(p.dimensions)}</strong>
                </div>
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '回弹特性' : 'Rebound Dynamics'}</span>
                  <strong style="color:#264653;">5s Slow Memory</strong>
                </div>
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '检测标准' : 'Standard'}</span>
                  <strong style="color:#264653;">CE / ASTM F963</strong>
                </div>
              </div>
            </div>

            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a class="button" style="background:#e76f51;color:#ffffff;font-weight:800;padding:16px 36px;border-radius:10px;font-size:0.95rem;box-shadow:0 6px 20px rgba(231,111,81,0.25);" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)}>
                ${isZh ? '索取产品样品 / 批发询盘 ↗' : 'Inquire for Wholesale & Samples ↗'}
              </a>
              ${waDigits ? `
                <a class="button" target="_blank" rel="noopener noreferrer" style="background:#25d366;color:#ffffff;font-weight:800;padding:16px 28px;border-radius:10px;font-size:0.95rem;" href="https://wa.me/${esc(waDigits)}">
                  WhatsApp ↗
                </a>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Related -->
        <div style="margin-top:80px;">
          <h2 style="font-size:1.8rem;font-weight:900;color:#264653;margin:0 0 24px;">
            ${isZh ? '同系列绘本玩具推荐' : 'Other Companions in this Collection'}
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${related.map((item) => `
              <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:18px;padding:20px;text-align:center;">
                <img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:100%;max-height:180px;object-fit:contain;margin-bottom:12px;">
                <h4 style="font-size:1.05rem;font-weight:900;color:#264653;margin:0 0 6px;">${esc(item.name)}</h4>
                <a class="text-link" style="color:#2a9d8f;font-weight:800;font-size:0.9rem;" href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)}>
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

export function renderWonderAbout(ctx: ThemeContext): string {
  const isZh = (ctx.lang as string) === 'zh';

  return `
    <main class="wr-inner wr-senseng-wonder-inner" data-wr-page="about" style="padding-top:100px;background:#fbf8f3;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="text-align:center;max-width:760px;margin:0 auto 50px;">
          <span style="font-size:0.8rem;font-weight:800;color:#2a9d8f;letter-spacing:0.06em;text-transform:uppercase;">
            ${isZh ? '工坊起源' : 'OUR PHILOSOPHY'}
          </span>
          <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.4rem);color:#264653;font-weight:900;margin:8px 0 20px;">
            ${isZh ? '让触觉成为治愈生活的一束温暖微光' : 'Crafting Tactile Solace for Modern Hearts'}
          </h1>
          <p style="color:#5c6b73;font-size:1.15rem;line-height:1.75;">
            ${isZh
              ? 'Senseng 玩具工坊融合了北欧现代极简美学与高精尖工贸制造工艺。我们致力于重新定义日常触觉玩具体验，不仅让孩子们享受无毒纯净的探索快乐，也让成年人在忙碌节奏中拥有一座随身携带的心灵绿洲。'
              : 'Senseng Workshop brings together Nordic aesthetic minimalism and rigorous export toy manufacturing. We create tactile companions that nurture fine motor skills in young explorers while offering gentle grounding mindfulness to busy adults.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:60px;">
          <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:20px;padding:32px;text-align:center;">
            <div style="font-size:2.4rem;margin-bottom:12px;">🌿</div>
            <h3 style="font-size:1.18rem;font-weight:900;color:#264653;margin:0 0 8px;">${isZh ? '天然无毒环保' : 'Pure & Non-Toxic'}</h3>
            <p style="font-size:0.9rem;color:#5c6b73;line-height:1.6;margin:0;">${isZh ? '全线产品通过国际权威毒理与重金属迁移检验，零异味零负担。' : 'Certified against international toxicology limits with zero odor and zero plasticizer bleed.'}</p>
          </div>
          <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:20px;padding:32px;text-align:center;">
            <div style="font-size:2.4rem;margin-bottom:12px;">📐</div>
            <h3 style="font-size:1.18rem;font-weight:900;color:#264653;margin:0 0 8px;">${isZh ? '人体工学阻尼' : 'Tactile Ergonomics'}</h3>
            <p style="font-size:0.9rem;color:#5c6b73;line-height:1.6;margin:0;">${isZh ? '科学调校软硬度与回弹时间，给掌心恰到好处的充实感。' : 'Precisely calibrated resistance curves to comfortably cradle palm anatomy without fatigue.'}</p>
          </div>
          <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:20px;padding:32px;text-align:center;">
            <div style="font-size:2.4rem;margin-bottom:12px;">📦</div>
            <h3 style="font-size:1.18rem;font-weight:900;color:#264653;margin:0 0 8px;">${isZh ? '可持续包装' : 'Eco Packaging'}</h3>
            <p style="font-size:0.9rem;color:#5c6b73;line-height:1.6;margin:0;">${isZh ? '采用环保纸板与大豆油墨印刷，向减少环境塑料足迹迈进。' : 'FSC paperboard boxes printed with soy inks, minimizing our collective environmental footprint.'}</p>
          </div>
        </div>

        <div style="background:#264653;color:#ffffff;border-radius:24px;padding:50px 40px;text-align:center;">
          <h2 style="font-size:2.2rem;font-weight:900;color:#ffffff;margin:0 0 12px;">${isZh ? '外贸制造与出口实力' : 'Global Export Performance'}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-top:36px;">
            <div>
              <div style="font-size:2.6rem;font-weight:900;color:#e9d8a6;">10,000+ m²</div>
              <div style="font-size:0.9rem;opacity:0.85;margin-top:4px;">${isZh ? '洁净车间面积' : 'Factory Floor'}</div>
            </div>
            <div>
              <div style="font-size:2.6rem;font-weight:900;color:#e9d8a6;">1,200,000+</div>
              <div style="font-size:0.9rem;opacity:0.85;margin-top:4px;">${isZh ? '月均出海玩具产能' : 'Monthly Units'}</div>
            </div>
            <div>
              <div style="font-size:2.6rem;font-weight:900;color:#e9d8a6;">60+</div>
              <div style="font-size:0.9rem;opacity:0.85;margin-top:4px;">${isZh ? '出口合作国家' : 'Export Destinations'}</div>
            </div>
            <div>
              <div style="font-size:2.6rem;font-weight:900;color:#e9d8a6;">100%</div>
              <div style="font-size:0.9rem;opacity:0.85;margin-top:4px;">${isZh ? '全检出库合格率' : 'Pass Rate'}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderWonderContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-senseng-wonder-inner" data-wr-page="contact" style="padding-top:100px;background:#fbf8f3;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="text-align:center;max-width:680px;margin:0 auto 40px;">
          <span style="font-size:0.8rem;font-weight:800;color:#2a9d8f;letter-spacing:0.06em;text-transform:uppercase;">
            ${isZh ? '联络工坊' : 'GET IN TOUCH'}
          </span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);color:#264653;font-weight:900;margin:8px 0 16px;">
            ${isZh ? '与 Senseng 工坊开启合作' : 'Start a Conversation with Us'}
          </h1>
          <p style="color:#5c6b73;font-size:1.1rem;line-height:1.65;">
            ${isZh ? '无论您是寻找优质现货批发的玩具买手，还是需要定制品牌专属彩盒的品牌商，我们随时为您提供专业服务。' : 'Request our physical sample pack, get wholesale volume pricing, or discuss bespoke OEM packaging.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:start;">
          <!-- Contact Info -->
          <div>
            <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:20px;padding:32px;box-shadow:0 6px 18px rgba(0,0,0,0.03);margin-bottom:24px;">
              <h3 style="font-size:1.25rem;font-weight:900;color:#264653;margin:0 0 18px;">
                ${isZh ? '工坊联系信息' : 'Direct Contacts'}
              </h3>
              <div style="display:grid;gap:18px;font-size:0.95rem;">
                <div>
                  <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '工坊名称' : 'Company Name'}</span>
                  <strong style="color:#264653;font-size:1.05rem;">${esc(company.name)}</strong>
                </div>
                ${company.email ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '外贸官方邮箱' : 'Email'}</span>
                    <a class="text-link" style="color:#2a9d8f;font-weight:800;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
                  </div>
                ` : ''}
                ${company.phone ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '服务热线' : 'Phone'}</span>
                    <a class="text-link" style="color:#264653;font-weight:800;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
                  </div>
                ` : ''}
                ${waDigits ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">WhatsApp</span>
                    <a class="text-link" target="_blank" rel="noopener noreferrer" style="color:#25d366;font-weight:800;" href="https://wa.me/${esc(waDigits)}">+${esc(waDigits)} (Instant Chat ↗)</a>
                  </div>
                ` : ''}
                ${company.address ? `
                  <div>
                    <span style="color:#8d99ae;font-size:0.84rem;display:block;">${isZh ? '工坊及展厅地址' : 'Address'}</span>
                    <span style="color:#5c6b73;">${esc(company.address)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Form -->
          <div style="background:#ffffff;border:1px solid #e7dcce;border-radius:20px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
            <h3 style="font-size:1.35rem;font-weight:900;color:#264653;margin:0 0 8px;">
              ${isZh ? '在线询盘与样品申请' : 'Send an Inquiry / Request Samples'}
            </h3>
            <p style="color:#5c6b73;font-size:0.92rem;margin:0 0 24px;">
              ${isZh ? '填写以下信息，我们的外贸代表将在 2 小时内为您回复详细报价与外贸规格书。' : 'Please submit your inquiry and we will get back to you with wholesale sheets within 2 hours.'}
            </p>

            <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;gap:18px;">
              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#264653;font-size:0.88rem;">
                ${esc(ui.name)} *
                <input name="name" autocomplete="name" required maxlength="120" style="padding:12px 16px;border:1px solid #d1c7b7;border-radius:8px;font-size:0.95rem;outline:none;" placeholder="${isZh ? '您的姓名' : 'Full Name'}">
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#264653;font-size:0.88rem;">
                ${esc(ui.email)} *
                <input name="email" type="email" autocomplete="email" required maxlength="254" style="padding:12px 16px;border:1px solid #d1c7b7;border-radius:8px;font-size:0.95rem;outline:none;" placeholder="${isZh ? '您的商务邮箱' : 'your.email@company.com'}">
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#264653;font-size:0.88rem;">
                ${esc(ui.company)} (${esc(ui.optional)})
                <input name="company" autocomplete="organization" maxlength="200" style="padding:12px 16px;border:1px solid #d1c7b7;border-radius:8px;font-size:0.95rem;outline:none;" placeholder="${isZh ? '公司名或店铺名' : 'Company or Store Name'}">
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#264653;font-size:0.88rem;">
                ${esc(ui.product)} (${esc(ui.optional)})
                <select name="productId" style="padding:12px 16px;border:1px solid #d1c7b7;border-radius:8px;font-size:0.95rem;outline:none;background:#ffffff;">
                  <option value="">— ${isZh ? '请选择感兴趣的玩具款式' : 'Select Toy of Interest'} —</option>
                  ${products.map((item) => `<option value="${esc(item.id)}"${item.id === options.productId ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}
                </select>
              </label>

              <label class="field" style="display:grid;gap:6px;font-weight:800;color:#264653;font-size:0.88rem;">
                ${esc(ui.message)} *
                <textarea name="message" required maxlength="5000" rows="4" style="padding:12px 16px;border:1px solid #d1c7b7;border-radius:8px;font-size:0.95rem;outline:none;resize:vertical;" placeholder="${isZh ? '请描述您的采购数量、目标交期或定制包装要求...' : 'Please describe target order quantities, packaging, or delivery requirements...'}"></textarea>
              </label>

              <div class="honeypot" aria-hidden="true" style="display:none;">
                <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
              </div>

              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#e76f51;color:#ffffff;font-weight:800;border:none;padding:16px 24px;border-radius:10px;font-size:1rem;cursor:pointer;box-shadow:0 6px 18px rgba(231,111,81,0.25);margin-top:8px;">
                ${esc(ui.send)} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:0;font-size:0.9rem;font-weight:700;color:#e76f51;"></p>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderWonderPage(ctx: ThemeContext): string {
  const { draft, page, path, navAttrs, ui } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const logo = ctx.asset(company.logoAssetId);
  const brand = logo ? `<img src="${esc(logo)}" alt="${esc(company.name)}" style="max-height:38px;object-fit:contain;">` : `<span style="font-weight:900;font-size:1.35rem;color:#264653;letter-spacing:-0.02em;">${esc(company.name)}</span>`;

  // Language links
  const depth = page === 'home' ? '' : '../';
  const languageLinks = draft.languages
    .map((l) => `<a href="${depth}../${l}/${page === 'detail' && ctx.options.productId ? `products/${ctx.options.productId}/index.html` : page === 'home' ? 'index.html' : `${page}/index.html`}" lang="${l}" data-wr-lang="${l}" style="font-size:0.8rem;font-weight:700;padding:4px 8px;border-radius:6px;text-decoration:none;${l === ctx.lang ? 'background:#264653;color:#ffffff;' : 'color:#5c6b73;'}" aria-current="${l === ctx.lang}">${l.toUpperCase()}</a>`)
    .join('');

  const headerHtml = `
    <header class="wr-wonder-header" style="position:sticky;top:0;z-index:100;background:rgba(253,251,247,0.94);backdrop-filter:blur(12px);border-bottom:1px solid #e7dcce;box-shadow:0 2px 12px rgba(0,0,0,0.03);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;gap:20px;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
          ${brand}
        </a>
        <nav style="display:flex;align-items:center;gap:28px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'home' ? '#2a9d8f' : '#264653'};">${esc(ui.home)}</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'catalog' ? '#2a9d8f' : '#264653'};">${esc(ui.catalog)}</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'about' ? '#2a9d8f' : '#264653'};">${esc(ui.about)}</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="text-decoration:none;font-size:0.95rem;font-weight:800;color:${page === 'contact' ? '#2a9d8f' : '#264653'};">${esc(ui.contact)}</a>
        </nav>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="languages" style="display:flex;gap:4px;">
            ${languageLinks}
          </div>
          <a class="button" style="background:#264653;color:#ffffff;font-weight:800;padding:10px 20px;border-radius:8px;font-size:0.86rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '工坊直采 ↗' : 'Inquire ↗'}
          </a>
        </div>
      </div>
    </header>
  `;

  let mainHtml = '';
  switch (page) {
    case 'catalog': mainHtml = renderWonderCatalog(ctx); break;
    case 'detail': mainHtml = renderWonderDetail(ctx); break;
    case 'about': mainHtml = renderWonderAbout(ctx); break;
    case 'contact': mainHtml = renderWonderContact(ctx); break;
    default: mainHtml = renderWonderHome(ctx); break;
  }

  const footerHtml = `
    <footer style="background:#264653;color:#f4ede1;border-top:1px solid #325a6b;padding:60px 0 30px;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:36px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.35rem;font-weight:900;color:#e9d8a6;margin-bottom:12px;">${esc(company.name)}</div>
          <p style="font-size:0.9rem;line-height:1.65;margin:0 0 16px;opacity:0.9;">
            ${isZh ? 'Senseng 北欧温润玩具工坊，以北欧极简生活美学与严苛出口标准，为全球家庭与现代办公工位打造静谧治愈的触觉玩伴。' : 'Senseng Wonder Toys Workshop crafts mindful, tactile sensory companions rooted in Nordic aesthetics and international toy safety.'}
          </p>
          <div style="font-size:0.85rem;color:#a8dadc;">ASTM F963 · EN71-1/2/3 · CE · CPC Certified</div>
        </div>

        <div>
          <h4 style="font-size:0.95rem;font-weight:900;color:#e9d8a6;margin:0 0 14px;text-transform:uppercase;">${esc(ui.catalog)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.9rem;">
            <li><a style="text-decoration:none;color:#f4ede1;opacity:0.85;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '柴犬微爆珠系列' : 'Crunchy Shiba Series'}</a></li>
            <li><a style="text-decoration:none;color:#f4ede1;opacity:0.85;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '儿童益智抚慰小猫' : 'Little Hands Kitten'}</a></li>
            <li><a style="text-decoration:none;color:#f4ede1;opacity:0.85;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '深蓝企鹅工位静心' : 'Quiet Desk Penguin'}</a></li>
            <li><a style="text-decoration:none;color:#f4ede1;opacity:0.85;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${isZh ? '奇幻温感变色独角鲸' : 'Thermochromic Narwhal'}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.95rem;font-weight:900;color:#e9d8a6;margin:0 0 14px;text-transform:uppercase;">${isZh ? '工坊制造实力' : 'Workshop Rigor'}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.9rem;opacity:0.85;">
            <li>✓ ${isZh ? '10,000㎡ 现代化无尘车间' : '10,000m² Certified Cleanroom'}</li>
            <li>✓ ${isZh ? '月产 120 万件大宗出海产能' : '1.2M Monthly Squeezable Toys'}</li>
            <li>✓ ${isZh ? '环保大豆油墨展示彩盒' : 'Eco Soy-Ink Paperboard Boxes'}</li>
            <li>✓ ${isZh ? '支持 OEM/ODM 柔性开模定制' : 'OEM / ODM Bespoke Tooling'}</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.95rem;font-weight:900;color:#e9d8a6;margin:0 0 14px;text-transform:uppercase;">${esc(ui.contact)}</h4>
          <p style="font-size:0.9rem;margin:0 0 8px;"><strong>Email:</strong> <a style="color:#a8dadc;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="font-size:0.9rem;margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
          ${company.address ? `<p style="font-size:0.85rem;color:#a8dadc;margin:0;">${esc(company.address)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #3a6b7e;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.85rem;color:#a8dadc;">
        <div>© ${new Date().getUTCFullYear()} ${esc(company.name)}. ${esc(ui.rights)}</div>
        <div>🌿 Senseng Wonder Toys · Nordic Tactile Living</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${mainHtml}${footerHtml}`;
}
