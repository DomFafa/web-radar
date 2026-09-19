import type { Product } from '../../shared/model';
import { esc, safeUrl, type ThemeContext } from './types';
import { CANDY_DEFAULT_PRODUCTS, getCandyProducts } from './sensengCandy';

export function renderNatureHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const heroProduct = products[0] || {
    id: 'p1',
    name: 'Forest Shiba Sensory Squishy',
    desc: 'Biodegradable food-grade soft touch companion.',
    badge: 'Eco Safe',
    material: 'Bio-Based Eco Silicone',
    dimensions: '8.5 × 6.5 cm',
    tagline: 'Born from Nature',
    category: 'eco',
    img: '/templates/senseng/products-1.jpg',
  };
  const pAt = (idx: number) => (products.length > 0 ? products[idx % products.length] : heroProduct);

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || (isZh ? '抚摸原野心跳 · 归还童年最初的纯净与温柔' : 'Gentle by Nature // Organic Tactile Sensory Companions'),
    subtitle: userCopy?.subtitle || (isZh
      ? '坚持采用 100% 植物大豆油墨与经欧盟认证的食品级环保生物基硅胶。零微塑料、零刺激异味，为孩子和大地带来无微不至的温柔守护。'
      : 'Thoughtfully crafted with certified bio-based polymers and natural soy ink packaging. Zero phthalates, non-toxic, and circular by design.'),
    cta: userCopy?.cta || (isZh ? '探索自然原野系列' : 'Explore Botanical Collection'),
  };

  const customBanner = draft.banner ? ctx.asset(draft.banner.assetId) : null;
  const heroBg = customBanner
    ? `linear-gradient(180deg, rgba(253,252,249,0.85) 0%, rgba(244,241,234,0.92) 100%), url('${esc(customBanner)}') center/cover no-repeat`
    : `linear-gradient(180deg, rgba(253,252,249,0.88) 0%, rgba(244,241,234,0.95) 100%), url('/templates/senseng/hero-nature.jpg') center/cover no-repeat`;

  // 1. Top Ribbon
  const ribbonHtml = `
    <div class="wr-nature-ribbon" style="background:#2d4a22;color:#f9f7f1;padding:8px 0;font-size:0.84rem;font-weight:700;text-align:center;">
      <div class="wrap" style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
        <span>🌿 ${isZh ? '100% 环保无毒生物基材料 · 欧盟 EN71-3 与美标 ASTM F963 权威认证' : '100% Eco-Safe Bio-Polymers · EN71-3 & ASTM F963 Lab Tested'}</span>
        <span style="opacity:0.6;">·</span>
        <span>📦 ${isZh ? '全生物降解纸盒与大豆油墨印刷 · 支持全球环保外贸集采' : 'Biodegradable Soy-Ink Gift Boxes · Sustainable Wholesale Available'}</span>
      </div>
    </div>
  `;

  // 2. Botanical Hero with Soft Wave Curves
  const heroHtml = `
    <section class="wr-nature-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:75px 0 85px;position:relative;overflow:hidden;border-bottom:1px solid #dcd5c7;">
      <!-- Subtle Floating Leaves SVG / Decor -->
      <div style="position:absolute;width:380px;height:380px;border-radius:50%;background:rgba(74,124,89,0.08);filter:blur(60px);top:-60px;left:-60px;pointer-events:none;"></div>

      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:52px;align-items:center;">
        <!-- Left Editorial Copy -->
        <div class="wr-nature-hero-left" data-reveal="fade-up">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:1px solid #c8d3c5;padding:6px 18px;border-radius:9999px;margin-bottom:20px;box-shadow:0 2px 8px rgba(45,74,34,0.06);">
            <span style="color:#2d4a22;font-size:0.85rem;font-weight:800;">
              🌱 SUSTAINABLE SENSORY PLAY
            </span>
          </div>

          <h1 class="hero-title" style="font-size:clamp(2.3rem, 4.3vw, 3.6rem);line-height:1.2;font-weight:900;color:#1e3318;margin:0 0 20px;">
            ${esc(copy.headline)}
          </h1>

          <p style="font-size:1.1rem;line-height:1.75;color:#4a5546;margin:0 0 32px;max-width:540px;">
            ${esc(copy.subtitle)}
          </p>

          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a class="button" style="background:#2d4a22;color:#ffffff;font-weight:800;padding:16px 36px;border-radius:9999px;font-size:0.95rem;box-shadow:0 6px 18px rgba(45,74,34,0.25);" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
              ${esc(copy.cta || (isZh ? '浏览原野全系列' : 'Discover All Toys'))} ↗
            </a>
            <a class="button" style="background:#ffffff;color:#2d4a22;border:1px solid #c8d3c5;font-weight:800;padding:15px 30px;border-radius:9999px;font-size:0.95rem;" href="${path('about/index.html')}" ${navAttrs('about')}>
              ${isZh ? '探索绿色工坊故事 →' : 'Our Green Story →'}
            </a>
          </div>

          <!-- Dynamic Environmental Impact Counters -->
          <div style="margin-top:40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:20px;border-top:1px solid #d5cec0;padding-top:24px;">
            <div>
              <div style="font-size:1.8rem;font-weight:900;color:#2d4a22;" data-counter>
                2,000+ ACRES
              </div>
              <div style="font-size:0.8rem;color:#6b7280;margin-top:4px;">${isZh ? '生态林地协同守护' : 'Protected Forest'}</div>
            </div>
            <div>
              <div style="font-size:1.8rem;font-weight:900;color:#4a7c59;" data-counter>
                360 TONS
              </div>
              <div style="font-size:0.8rem;color:#6b7280;margin-top:4px;">${isZh ? '原生塑料淘汰减碳' : 'Plastic Replaced'}</div>
            </div>
            <div>
              <div style="font-size:1.8rem;font-weight:900;color:#c89f77;" data-counter>
                100% BIO
              </div>
              <div style="font-size:0.8rem;color:#6b7280;margin-top:4px;">${isZh ? '大豆油墨纸盒包装' : 'Soy-Ink Box'}</div>
            </div>
          </div>

          <div style="margin-top:24px;">
            <a href="#nature-manifesto" class="wr-scroll-down" aria-label="Scroll to eco manifesto" style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:#ffffff;border:1px solid #c8d3c5;color:#2d4a22;font-size:1.2rem;text-decoration:none;">↓</a>
          </div>
        </div>

        <!-- Right Visual Showcase -->
        <div class="wr-nature-hero-right" style="position:relative;text-align:center;" data-reveal="fade-up">
          <div class="wr-nature-frame wr-hero-float wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:32px;padding:40px;box-shadow:0 16px 36px rgba(45,74,34,0.08);position:relative;max-width:480px;margin:0 auto;">
            <img src="${esc(heroProduct.img || '/templates/senseng/products-2.jpg')}" alt="${esc(heroProduct.name)}" style="width:100%;max-width:360px;height:auto;object-fit:contain;transition:transform 0.4s ease;">
            <div style="margin-top:20px;display:flex;justify-content:center;gap:12px;font-size:0.82rem;font-weight:800;color:#2d4a22;">
              <span>🌱 0 Phthalates</span>
              <span>·</span>
              <span>💧 Washable & Durable</span>
              <span>·</span>
              <span>☁️ 5s Soft Rebound</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 3. Eco Footprint Progress Bars
  const ecoProgressHtml = `
    <section id="nature-manifesto" class="wrap" style="padding:60px 0;" data-reveal="fade-up">
      <div class="wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:24px;padding:36px 40px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
          <div>
            <span style="color:#4a7c59;font-weight:800;font-size:0.82rem;text-transform:uppercase;">// SUSTAINABILITY SCORECARD</span>
            <h2 style="font-size:1.8rem;font-weight:900;color:#1e3318;margin:4px 0 0;">
              ${isZh ? '生态环保减碳与安全生产透明度' : 'Eco-Safe Manufacturing Benchmarks'}
            </h2>
          </div>
          <div style="color:#6b7280;font-size:0.85rem;">
            AUDITED BY INTERTEK & TÜV RHEINLAND
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;">
          <!-- Bar 1 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.88rem;font-weight:800;">
              <span style="color:#1e3318;">${isZh ? '太阳能洁净能源使用率' : 'Solar Clean Energy'}</span>
              <span style="color:#2d4a22;">100%</span>
            </div>
            <div style="background:#f1ede4;height:10px;border-radius:9999px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#4a7c59,#2d4a22);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1);"></div>
            </div>
            <div style="font-size:0.75rem;color:#6b7280;margin-top:6px;">${isZh ? '10,000㎡ 屋顶分布式光伏全覆盖' : '10,000m² solar roof generation'}</div>
          </div>

          <!-- Bar 2 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.88rem;font-weight:800;">
              <span style="color:#1e3318;">${isZh ? '环保大豆油墨彩盒' : 'Biodegradable Packaging'}</span>
              <span style="color:#4a7c59;">100%</span>
            </div>
            <div style="background:#f1ede4;height:10px;border-radius:9999px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#84a98c,#52796f);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;"></div>
            </div>
            <div style="font-size:0.75rem;color:#6b7280;margin-top:6px;">${isZh ? '杜绝石化塑料开窗与胶水污染' : 'FSC paperboard with soy ink printing'}</div>
          </div>

          <!-- Bar 3 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.88rem;font-weight:800;">
              <span style="color:#1e3318;">${isZh ? '无重金属与增塑剂纯度' : 'Zero Toxic Additives'}</span>
              <span style="color:#c89f77;">99.9%</span>
            </div>
            <div style="background:#f1ede4;height:10px;border-radius:9999px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="99.9" style="background:linear-gradient(90deg,#ddb892,#b08968);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;"></div>
            </div>
            <div style="font-size:0.75rem;color:#6b7280;margin-top:6px;">${isZh ? '通过 EN71-3 19项特定元素迁移限制' : 'Meets strict heavy metal limits'}</div>
          </div>

          <!-- Bar 4 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.88rem;font-weight:800;">
              <span style="color:#1e3318;">${isZh ? '可降解循环再生设计' : 'Circular Recyclability'}</span>
              <span style="color:#4a7c59;">96.5%</span>
            </div>
            <div style="background:#f1ede4;height:10px;border-radius:9999px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="96.5" style="background:linear-gradient(90deg,#52796f,#354f52);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.45s;"></div>
            </div>
            <div style="font-size:0.75rem;color:#6b7280;margin-top:6px;">${isZh ? '支持物理脱色与热塑性重新造粒' : 'Designed for closed-loop repurposing'}</div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 4. Products Botanical Flow
  const productsFlowHtml = `
    <section class="wrap" style="padding:40px 0 70px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="color:#4a7c59;font-weight:800;font-size:0.84rem;text-transform:uppercase;">THE BOTANICAL COLLECTION</span>
          <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:#1e3318;margin:6px 0 0;">
            ${isZh ? '八款原野萌趣生活玩伴' : 'Eight Mindful Forest Companions'}
          </h2>
        </div>
        <a class="text-link" style="color:#2d4a22;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${isZh ? '查看全部自然画册' : 'Browse Full Field Guide'} ↗
        </a>
      </div>

      <div class="wr-nature-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:30px;">
        ${products.slice(0, 8).map((p, idx) => `
          <div class="wr-nature-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #d5cec0;border-radius:20px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.25s,box-shadow 0.25s;">
            <div style="background:#f4f1ea;padding:28px 20px;text-align:center;position:relative;">
              <span style="position:absolute;top:12px;left:12px;background:#ffffff;color:#2d4a22;font-size:0.75rem;font-weight:800;padding:3px 10px;border-radius:9999px;border:1px solid #d5cec0;">
                № 0${idx + 1}
              </span>
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:190px;width:auto;object-fit:contain;transition:transform 0.3s;" loading="lazy">
            </div>

            <div style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;flex-grow:1;">
              <div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#1e3318;margin:0 0 8px;">
                  <a style="color:#1e3318;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${esc(p.name)}
                  </a>
                </h3>
                <p style="font-size:0.88rem;color:#5c6b73;line-height:1.6;margin:0 0 16px;">
                  ${esc(p.desc)}
                </p>
              </div>

              <div>
                <div style="font-size:0.8rem;color:#8d99ae;margin-bottom:14px;">
                  ${esc(p.dimensions)} · ${esc(p.material)}
                </div>
                <a class="button" style="display:block;text-align:center;background:#2d4a22;color:#ffffff;font-weight:800;padding:12px;border-radius:8px;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${isZh ? '规格参数与采购 ↗' : 'Inquire & Sample ↗'}
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-senseng-nature-home" data-wr-page="home" style="background:#fdfcf9;color:#2c3e2e;min-height:100vh;">
      ${ribbonHtml}
      ${heroHtml}
      ${ecoProgressHtml}
      ${productsFlowHtml}
    </main>
  `;
}

export function renderNatureCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-nature-inner" data-wr-page="catalog" style="padding-top:100px;background:#fdfcf9;color:#2c3e2e;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="margin-bottom:44px;">
          <span style="color:#4a7c59;font-weight:800;font-size:0.85rem;text-transform:uppercase;">THE FIELD GUIDE // FULL INVENTORY</span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#1e3318;margin:8px 0 12px;">
            ${isZh ? '自然触感玩伴完整画册' : 'Botanical Sensory Field Guide'}
          </h1>
          <p style="color:#5c6b73;font-size:1.05rem;max-width:680px;line-height:1.6;">
            ${isZh ? '查阅全部经国际安全认证的原野系列。支持大豆油墨定制彩盒、品牌专属标签与快速小批量现货批发。' : 'Browse our lab-certified organic squishy companions, packaged in sustainable soy-ink boxes.'}
          </p>
        </div>

        <div class="wr-nature-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:30px;">
          ${products.map((p, idx) => `
            <div class="wr-nature-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #d5cec0;border-radius:20px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;">
              <div style="background:#f4f1ea;padding:28px 20px;text-align:center;position:relative;">
                <span style="position:absolute;top:12px;left:12px;background:#ffffff;color:#2d4a22;font-size:0.75rem;font-weight:800;padding:3px 10px;border-radius:9999px;border:1px solid #d5cec0;">
                  № 0${(idx % 8) + 1}
                </span>
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:190px;width:auto;object-fit:contain;" loading="lazy">
              </div>

              <div style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;flex-grow:1;">
                <div>
                  <h2 style="font-size:1.15rem;font-weight:900;color:#1e3318;margin:0 0 8px;">
                    <a style="color:#1e3318;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                      ${esc(p.name)}
                    </a>
                  </h2>
                  <p style="font-size:0.88rem;color:#5c6b73;line-height:1.6;margin:0 0 16px;">
                    ${esc(p.desc)}
                  </p>
                </div>

                <div>
                  <div style="font-size:0.8rem;color:#8d99ae;margin-bottom:14px;">
                    ${esc(p.dimensions)} · ${esc(p.material)}
                  </div>
                  <a class="button" style="display:block;text-align:center;background:#2d4a22;color:#ffffff;font-weight:800;padding:12px;border-radius:8px;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${isZh ? '规格参数与采购 ↗' : 'Inquire ↗'}
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

export function renderNatureDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0] || {
    id: 'p1',
    name: 'Forest Shiba Sensory Squishy',
    desc: 'Biodegradable food-grade soft touch companion.',
    badge: 'Eco Safe',
    material: 'Bio-Based Eco Silicone',
    dimensions: '8.5 × 6.5 cm',
    tagline: 'Born from Nature',
    category: 'eco',
    img: '/templates/senseng/products-1.jpg',
  };
  const related = products.filter((item) => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-senseng-nature-inner" data-wr-page="detail" style="padding-top:100px;background:#fdfcf9;color:#2c3e2e;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="margin-bottom:24px;">
          <a class="text-link" style="color:#2d4a22;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ← ${isZh ? '返回全部原野画册' : 'BACK TO FIELD GUIDE'}
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:start;">
          <!-- Left: Big Specimen Image -->
          <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:24px;padding:48px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.04);">
            <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;">
            <div style="margin-top:24px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
              <span style="background:#f4f1ea;color:#2d4a22;padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:800;">✓ 100% Non-Toxic</span>
              <span style="background:#f4f1ea;color:#2d4a22;padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:800;">✓ EN71 & ASTM</span>
              <span style="background:#f4f1ea;color:#2d4a22;padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:800;">✓ Soy Ink Box</span>
            </div>
          </div>

          <!-- Right: Details, Botanical Notes, Direct Inquiry -->
          <div data-reveal="fade-up">
            <div style="display:inline-block;background:#4a7c59;color:#ffffff;font-size:0.8rem;font-weight:800;padding:4px 12px;border-radius:9999px;margin-bottom:12px;">
              ${esc(p.badge)}
            </div>

            <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#1e3318;margin:0 0 16px;">
              ${esc(p.name)}
            </h1>

            <p style="font-size:1.05rem;line-height:1.75;color:#4a5546;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <div class="wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:16px;padding:24px;margin-bottom:28px;">
              <h4 style="font-size:0.95rem;font-weight:800;color:#1e3318;margin:0 0 12px;">${isZh ? '原野工艺与物性规格' : 'Material & Dimension Specs'}</h4>
              <div style="display:grid;gap:8px;font-size:0.88rem;color:#4a5546;">
                <div><strong>${isZh ? '规格尺寸' : 'Dimensions'}:</strong> ${esc(p.dimensions)}</div>
                <div><strong>${isZh ? '材质配方' : 'Material'}:</strong> ${esc(p.material)}</div>
                <div><strong>${isZh ? '合规资质' : 'Safety'}:</strong> EN71-1/2/3, ASTM F963, CE, CPSIA</div>
                <div><strong>${isZh ? '外贸交付' : 'Supply'}:</strong> 现货小批量批发 / OEM 柔性开模</div>
              </div>
            </div>

            <!-- Eco & Tactile Calibration Progress Bars -->
            <div class="wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-left:3px solid #2d4a22;border-radius:16px;padding:22px;margin-bottom:28px;">
              <h4 style="font-size:0.95rem;font-weight:800;color:#1e3318;margin:0 0 14px;">
                🍃 ${isZh ? '生态物性与触感评测' : 'Eco-Tactile Performance Index'}
              </h4>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.86rem;font-weight:800;color:#1e3318;margin-bottom:4px;">
                    <span>${isZh ? '天然无毒环保纯度' : 'Bio-Degradable Purity Index'}</span>
                    <span style="color:#2d4a22;font-weight:900;">100%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#f4f1ea;height:7px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#2d4a22,#4a7c59);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1);"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.86rem;font-weight:800;color:#1e3318;margin-bottom:4px;">
                    <span>${isZh ? '慢升云感记忆弹性' : 'Sensory Memory Rebound'}</span>
                    <span style="color:#4a7c59;font-weight:900;">98%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#f4f1ea;height:7px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="98" style="background:linear-gradient(90deg,#4a7c59,#81b29a);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.86rem;font-weight:800;color:#1e3318;margin-bottom:4px;">
                    <span>${isZh ? '大豆油墨印刷可回收率' : 'Recyclable Soy-Ink Packaging'}</span>
                    <span style="color:#c89f77;font-weight:900;">100%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#f4f1ea;height:7px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#c89f77,#e07a5f);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s;"></div>
                  </div>
                </div>
              </div>
            </div>

            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <a class="button" style="flex:1;background:#2d4a22;color:#ffffff;font-weight:800;padding:16px;border-radius:8px;text-align:center;box-shadow:0 4px 14px rgba(45,74,34,0.2);" href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')}>
                ${isZh ? '索取样品与报价单 ↗' : 'Request Quotation ↗'}
              </a>
              ${waDigits ? `
                <a class="button" style="background:#25d366;color:#ffffff;font-weight:800;padding:16px 24px;border-radius:8px;" href="https://wa.me/${waDigits}" target="_blank" rel="noopener">
                  WhatsApp
                </a>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Related Specimen -->
        ${related.length > 0 ? `
          <div style="margin-top:70px;border-top:1px solid #d5cec0;padding-top:40px;" data-reveal="fade-up">
            <h3 style="font-size:1.4rem;font-weight:900;color:#1e3318;margin-bottom:24px;">
              ${isZh ? '更多自然原野系列标本' : 'More Botanical & Forest Specimens'}
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
              ${related.map((r) => `
                <div class="wr-nature-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #d5cec0;border-radius:16px;padding:20px;text-align:center;">
                  <img src="${esc(r.img)}" alt="${esc(r.name)}" style="max-height:150px;object-fit:contain;margin-bottom:12px;">
                  <h4 style="font-size:0.95rem;font-weight:800;color:#1e3318;margin:0 0 8px;">${esc(r.name)}</h4>
                  <a class="button" style="background:#f4f1ea;color:#2d4a22;font-size:0.82rem;font-weight:800;padding:8px 16px;border-radius:6px;display:inline-block;" href="${path(`products/${r.id}/index.html`)}" ${navAttrs('detail', r.id)}>
                    ${isZh ? '查阅标本' : 'View Specimen'} ↗
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    </main>
  `;
}

export function renderNatureAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;

  return `
    <main class="wr-inner wr-senseng-nature-inner" data-wr-page="about" style="padding-top:100px;background:#fdfcf9;color:#2c3e2e;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="max-width:760px;margin-bottom:50px;">
          <span style="color:#4a7c59;font-weight:800;font-size:0.85rem;text-transform:uppercase;">ABOUT OUR SANCTUARY</span>
          <h1 style="font-size:clamp(2.4rem, 4.2vw, 3.4rem);font-weight:900;color:#1e3318;margin:8px 0 20px;">
            ${isZh ? '让玩具与自然共生 · 原野工坊纪实' : 'Born in Nature // The Eco-Tactile Manifesto'}
          </h1>
          <p style="color:#4a5546;font-size:1.1rem;line-height:1.75;">
            ${isZh
              ? `${esc(company.name)} 坚信触觉抚慰是孩子认知世界最初的语言。我们杜绝使用任何有毒有害添加剂，将可再生大豆油墨印刷与食品级硅胶技术融合，打造陪伴全球家庭成长的环保玩伴。`
              : `${esc(company.name)} designs mindful tactile toys rooted in sustainable materials, international toy safety, and circular manufacturing.`}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;margin-bottom:60px;">
          <div data-reveal="fade-up" class="wr-nature-card wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:16px;padding:32px;">
            <div style="font-size:2rem;margin-bottom:12px;">🌿</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#1e3318;margin:0 0 10px;">${isZh ? '100% 零塑环保原则' : 'Zero Virgin Plastic'}</h3>
            <p style="font-size:0.92rem;color:#5c6b73;line-height:1.65;margin:0;">
              ${isZh ? '产品主体全部选用经实验室检测的食品级环保软胶，包装杜绝石化塑料吸塑。' : 'Crafted with food-grade non-toxic polymers and plastic-free packaging.'}
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-nature-card wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:16px;padding:32px;">
            <div style="font-size:2rem;margin-bottom:12px;">☀️</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#1e3318;margin:0 0 10px;">${isZh ? '分布式太阳能智造' : 'Solar-Powered Plant'}</h3>
            <p style="font-size:0.92rem;color:#5c6b73;line-height:1.65;margin:0;">
              ${isZh ? '工厂车间全面采用清洁屋顶光伏绿电，每生产 10 万件玩具减少 18 吨碳足迹。' : 'Manufacturing with clean solar energy to minimize ecological footprint.'}
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-nature-card wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:16px;padding:32px;">
            <div style="font-size:2rem;margin-bottom:12px;">🛡️</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#1e3318;margin:0 0 10px;">${isZh ? '全龄段安全认证' : 'Universal Child Safe'}</h3>
            <p style="font-size:0.92rem;color:#5c6b73;line-height:1.65;margin:0;">
              ${isZh ? '经欧美权威实验室跌落抗冲击、物理拉伸与唾液可溶性化学测试，无毒无害。' : 'Independently tested for drop, pull, and heavy metal limits.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderNatureContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-nature-inner" data-wr-page="contact" style="padding-top:100px;background:#fdfcf9;color:#2c3e2e;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="max-width:680px;margin-bottom:44px;">
          <span style="color:#4a7c59;font-weight:800;font-size:0.85rem;text-transform:uppercase;">GET IN TOUCH // INQUIRY</span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#1e3318;margin:8px 0 12px;">
            ${isZh ? '索取环保样品礼盒与大宗批发' : 'Request Eco Sample Kit & B2B Inquiry'}
          </h1>
          <p style="color:#5c6b73;font-size:1.05rem;line-height:1.6;">
            ${isZh ? '我们为全球自然教育机构、儿童玩具零售商及精品礼品店提供快速样品打样与定制服务。' : 'Contact our team for eco-packaging options, MOQ requirements, and wholesale catalog.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:44px;align-items:start;">
          <!-- Form -->
          <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:20px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
            <form id="inquiry" action="${esc(ctx.options.inquiryUrl)}" method="post" style="display:grid;gap:20px;">
              <div>
                <label for="name" style="display:block;font-size:0.85rem;font-weight:800;color:#1e3318;margin-bottom:6px;">${isZh ? '您的姓名 / 称谓' : 'Full Name'}</label>
                <input id="name" name="name" required style="width:100%;padding:14px;background:#fdfcf9;border:1px solid #d5cec0;border-radius:6px;color:#1e3318;font-size:0.95rem;box-sizing:border-box;">
              </div>

              <div>
                <label for="email" style="display:block;font-size:0.85rem;font-weight:800;color:#1e3318;margin-bottom:6px;">${isZh ? '商务邮箱' : 'Email Address'}</label>
                <input id="email" name="email" type="email" required style="width:100%;padding:14px;background:#fdfcf9;border:1px solid #d5cec0;border-radius:6px;color:#1e3318;font-size:0.95rem;box-sizing:border-box;">
              </div>

              <div>
                <label for="productId" style="display:block;font-size:0.85rem;font-weight:800;color:#1e3318;margin-bottom:6px;">${isZh ? '意向咨询玩伴' : 'Interested Companion'}</label>
                <select id="productId" name="productId" style="width:100%;padding:14px;background:#fdfcf9;border:1px solid #d5cec0;border-radius:6px;color:#1e3318;font-size:0.95rem;box-sizing:border-box;">
                  <option value="">${isZh ? '全套原野样品礼盒 / 综合询盘' : 'Full Botanical Kit / General Wholesale'}</option>
                  ${products.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label for="message" style="display:block;font-size:0.85rem;font-weight:800;color:#1e3318;margin-bottom:6px;">${isZh ? '采购需求与留言' : 'Inquiry Message'}</label>
                <textarea id="message" name="message" rows="4" required style="width:100%;padding:14px;background:#fdfcf9;border:1px solid #d5cec0;border-radius:6px;color:#1e3318;font-size:0.95rem;box-sizing:border-box;resize:vertical;"></textarea>
              </div>

              <button type="submit" class="button" style="background:#2d4a22;color:#ffffff;font-weight:800;font-size:1rem;padding:16px;border-radius:6px;border:none;cursor:pointer;">
                ${isZh ? '发送环保样品索取 ↗' : 'Send Inquiry ↗'}
              </button>
              <div role="status" style="font-size:0.85rem;color:#2d4a22;text-align:center;"></div>
            </form>
          </div>

          <!-- Direct Info -->
          <div data-reveal="fade-up" style="display:grid;gap:20px;">
            <div class="wr-nature-card wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:16px;padding:28px;">
              <h3 style="font-size:1.15rem;font-weight:900;color:#1e3318;margin:0 0 14px;">${esc(company.name)}</h3>
              <p style="color:#5c6b73;font-size:0.92rem;margin:0 0 8px;"><strong>Email:</strong> <a style="color:#2d4a22;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
              ${company.contactName ? `<p style="color:#5c6b73;font-size:0.92rem;margin:0 0 8px;"><strong>Contact:</strong> ${esc(company.contactName)}</p>` : ''}
              ${company.phone ? `<p style="color:#5c6b73;font-size:0.92rem;margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
              ${company.whatsapp ? `<p style="color:#5c6b73;font-size:0.92rem;margin:0 0 8px;"><strong>WhatsApp:</strong> ${esc(company.whatsapp)}</p>` : ''}
            </div>

            <div class="wr-nature-card wr-card-hover" style="background:#ffffff;border:1px solid #d5cec0;border-radius:16px;padding:28px;">
              <h4 style="font-size:1.05rem;font-weight:900;color:#1e3318;margin:0 0 10px;">${isZh ? '绿色包装打样说明' : 'Sustainable Packaging Options'}</h4>
              <p style="color:#5c6b73;font-size:0.9rem;line-height:1.6;margin:0;">
                ${isZh ? '支持高克重纯白环保卡盒、牛皮纸盒与透明植物基降解膜，提供免费条码与外箱标签设计。' : 'FSC certified paperboard, custom die-cut windows, and soy-ink branding for global eco retailers.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderNaturePage(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';

  let inner = '';
  switch (ctx.options.page) {
    case 'catalog':
      inner = renderNatureCatalog(ctx);
      break;
    case 'detail':
      inner = renderNatureDetail(ctx);
      break;
    case 'about':
      inner = renderNatureAbout(ctx);
      break;
    case 'contact':
      inner = renderNatureContact(ctx);
      break;
    case 'home':
    default:
      inner = renderNatureHome(ctx);
      break;
  }

  const headerHtml = `
    <header class="wr-nature-header" style="position:sticky;top:0;z-index:100;background:rgba(253,252,249,0.94);backdrop-filter:blur(12px);border-bottom:1px solid #e2ddd3;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:#2d4a22;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:1rem;">
            🌿
          </div>
          <span style="font-size:1.25rem;font-weight:900;color:#1e3318;">
            ${esc(company.name || 'SENSENG')}
          </span>
        </a>

        <nav aria-label="${esc(ui.menu)}" style="display:flex;gap:28px;align-items:center;font-size:0.92rem;font-weight:800;">
          <a class="nav-link" href="${path('index.html')}" ${navAttrs('home')} style="color:#1e3318;text-decoration:none;">${esc(ui.home)}</a>
          <a class="nav-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#1e3318;text-decoration:none;">${esc(ui.catalog)}</a>
          <a class="nav-link" href="${path('about/index.html')}" ${navAttrs('about')} style="color:#1e3318;text-decoration:none;">${esc(ui.about)}</a>
          <a class="nav-link" href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#1e3318;text-decoration:none;">${esc(ui.contact)}</a>
        </nav>

        <div>
          <a class="button" style="background:#2d4a22;color:#ffffff;font-weight:800;font-size:0.85rem;padding:10px 20px;border-radius:9999px;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '索取样品' : 'Request Kit'}
          </a>
        </div>
      </div>
    </header>
  `;

  const footerHtml = `
    <footer style="background:#22361a;color:#f9f7f1;padding:60px 0 30px;font-size:0.9rem;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:36px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.3rem;font-weight:900;color:#f9f7f1;margin-bottom:12px;">${esc(company.name)}</div>
          <p style="font-size:0.88rem;line-height:1.65;opacity:0.85;margin:0 0 16px;">
            Dedicated to gentle sensory toys crafted from non-toxic bio-polymers. Certified child-safe for global families and future generations.
          </p>
          <div style="font-size:0.8rem;color:#c8d3c5;">EN71 · ASTM F963 · CE · CPC Certified</div>
        </div>

        <div>
          <h4 style="font-size:0.92rem;font-weight:900;color:#f9f7f1;margin:0 0 14px;text-transform:uppercase;">Collection</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;opacity:0.85;">
            <li><a style="text-decoration:none;color:#f9f7f1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Forest Shiba Pop Beads</a></li>
            <li><a style="text-decoration:none;color:#f9f7f1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Little Playmate Kitten</a></li>
            <li><a style="text-decoration:none;color:#f9f7f1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Quiet Desk Penguin</a></li>
            <li><a style="text-decoration:none;color:#f9f7f1;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Thermal Wonder Narwhal</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.92rem;font-weight:900;color:#f9f7f1;margin:0 0 14px;text-transform:uppercase;">Eco Responsibility</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.86rem;opacity:0.85;">
            <li>✓ 100% Bio-Based Food-Grade TPR</li>
            <li>✓ Zero Virgin Fossil Plastic</li>
            <li>✓ Soy-Ink Recycled Packaging</li>
            <li>✓ Solar Powered Clean Production</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.92rem;font-weight:900;color:#f9f7f1;margin:0 0 14px;text-transform:uppercase;">Contact</h4>
          <p style="font-size:0.86rem;margin:0 0 8px;">Email: <a style="color:#c8d3c5;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="font-size:0.86rem;margin:0;">Tel: ${esc(company.phone)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid rgba(255,255,255,0.15);padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#c8d3c5;">
        <div>© 2026 ${esc(company.name)}. All rights reserved.</div>
        <div>🌿 Senseng Botanical Living · Nature & Childhood</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${inner}${footerHtml}`;
}
