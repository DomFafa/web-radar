import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { CANDY_DEFAULT_PRODUCTS, getCandyProducts } from './sensengCandy';
import { parseAboutHighlights, getAboutStoryParagraphs, getAboutHeadline, getAboutImages } from './aboutHelper';

export function renderArcadeHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const heroProduct = products[0] || {
    id: 'p1',
    name: 'Cyber Shiba Sensory Squishy',
    desc: 'High-density micro-bead core with tactile soundwave feedback.',
    badge: 'Cyber Pulse',
    material: 'Military-Grade Elastic TPR',
    dimensions: '8.5 × 6.5 cm',
    tagline: 'Hyper-Tactile Relief',
    category: 'cyber',
    img: '/templates/senseng/products-1.jpg',
  };
  const pAt = (idx: number) => (products.length > 0 ? products[idx % products.length] : heroProduct);

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || (isZh ? '赛博机能潮玩 · 触觉神经降噪黑科技' : 'Hyper-Tactile Cyber Toys // Zero Stress Protocol'),
    subtitle: userCopy?.subtitle || (isZh
      ? '融合独创数万颗微爆珠声学振动与 5 秒慢回弹记忆聚合物。高弹食品级环保材质，专为极客桌面与潮流玩家打造的情绪解压机甲。'
      : 'Engineered with patented acoustic micro-bead resonance and 5-second memory rebound. 100% certified food-grade TPR crafted for modern desks and cyberpunk collectors.'),
    cta: userCopy?.cta || (isZh ? '启动机能潮玩目录' : 'Enter Cyber Catalog'),
  };

  const customBanner = draft.banner ? ctx.asset(draft.banner.assetId) : null;
  const heroBg = customBanner
    ? `linear-gradient(180deg, rgba(9,13,22,0.85) 0%, rgba(9,13,22,0.95) 100%), url('${esc(customBanner)}') center/cover no-repeat`
    : `radial-gradient(ellipse at center, rgba(15,23,42,0.88) 0%, rgba(9,13,22,0.96) 100%), url('/templates/senseng/hero-arcade.jpg') center/cover no-repeat`;

  // 1. Top Cyber Ribbon
  const ribbonHtml = `
    <div class="wr-arcade-ribbon" style="background:#090d16;color:#00f5d4;border-bottom:1px solid #1f293d;padding:8px 0;font-family:'Courier New',monospace;font-size:0.82rem;font-weight:700;letter-spacing:0.06em;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00f5d4;box-shadow:0 0 8px #00f5d4;animation:wrArcadePulse 1.5s infinite alternate;"></span>
          <span>SYS_STATUS: ONLINE // 100% NON-TOXIC SILICONE</span>
        </div>
        <div style="color:#f72585;font-weight:800;">
          [ EN71 & ASTM F963 LAB CERTIFIED // OEM & ODM READY ]
        </div>
      </div>
    </div>
  `;

  // 2. Hero HUD Stage
  const heroHtml = `
    <section class="wr-arcade-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:70px 0 80px;position:relative;overflow:hidden;border-bottom:2px solid #00f5d4;color:#ffffff;">
      <!-- Neon Grid Background Lines -->
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,245,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.05) 1px, transparent 1px);background-size:40px 40px;pointer-events:none;"></div>
      <div style="position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(247,37,133,0.12);filter:blur(80px);top:-100px;right:-50px;pointer-events:none;"></div>

      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:48px;align-items:center;position:relative;z-index:2;">
        <!-- Left Column: Copy, Tech Badges, CTAs -->
        <div class="wr-arcade-hero-left" data-reveal="fade-up">
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(0,245,212,0.08);border:1px solid #00f5d4;padding:6px 16px;border-radius:4px;margin-bottom:20px;">
            <span style="color:#00f5d4;font-family:monospace;font-size:0.8rem;font-weight:900;letter-spacing:0.08em;">
              ⚡ SENSENG SENSORY LAB // VER. 3.0
            </span>
          </div>

          <h1 class="hero-title" style="font-size:clamp(2.3rem, 4.2vw, 3.8rem);line-height:1.15;font-weight:900;letter-spacing:-0.03em;color:#ffffff;margin:0 0 20px;text-shadow:0 0 20px rgba(0,245,212,0.25);">
            ${esc(copy.headline)}
          </h1>

          <p style="font-size:1.1rem;line-height:1.75;color:#94a3b8;margin:0 0 32px;max-width:540px;">
            ${esc(copy.subtitle)}
          </p>

          <!-- Buttons -->
          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a class="button" style="background:#00f5d4;color:#0b0f19;font-weight:900;padding:16px 36px;border-radius:4px;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.04em;box-shadow:0 0 24px rgba(0,245,212,0.45);transition:all 0.25s;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
              ${esc(copy.cta || (isZh ? '探索机能系列' : 'Enter Cyber Catalog'))} ↗
            </a>
            <a class="button" style="background:transparent;color:#f72585;border:1px solid #f72585;font-weight:800;padding:15px 32px;border-radius:4px;font-size:0.95rem;box-shadow:0 0 16px rgba(247,37,133,0.25);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
              ${isZh ? '终端打样索取 →' : 'Request Sample Kit →'}
            </a>
          </div>

          <!-- Dynamic Number Counters (Run on Viewport Scroll) -->
          <div style="margin-top:44px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:20px;border-top:1px solid #1e293b;padding-top:28px;">
            <div>
              <div style="font-size:1.9rem;font-weight:900;color:#00f5d4;font-family:monospace;" data-counter>
                1,500,000+
              </div>
              <div style="font-size:0.8rem;color:#64748b;margin-top:4px;font-family:monospace;">${isZh ? '全球极客交付量' : 'UNITS SHIPPED'}</div>
            </div>
            <div>
              <div style="font-size:1.9rem;font-weight:900;color:#f72585;font-family:monospace;" data-counter>
                48 LABS
              </div>
              <div style="font-size:0.8rem;color:#64748b;margin-top:4px;font-family:monospace;">${isZh ? '权威安全检测' : 'SAFETY CERTS'}</div>
            </div>
            <div>
              <div style="font-size:1.9rem;font-weight:900;color:#7209b7;font-family:monospace;" data-counter>
                50,000 CYCLES
              </div>
              <div style="font-size:0.8rem;color:#64748b;margin-top:4px;font-family:monospace;">${isZh ? '高弹挤压耐久测试' : 'DURABILITY TESTS'}</div>
            </div>
          </div>
        </div>

        <!-- Right Column: 3D HUD Stage Showcase -->
        <div class="wr-arcade-hero-right" style="position:relative;text-align:center;" data-reveal="fade-up">
          <div class="wr-arcade-hud wr-hero-float wr-card-hover" style="background:#0f172a;border:2px solid #00f5d4;border-radius:16px;padding:36px;box-shadow:0 0 35px rgba(0,245,212,0.25), inset 0 0 20px rgba(0,245,212,0.1);position:relative;max-width:480px;margin:0 auto;">
            <!-- Corner Decors -->
            <div style="position:absolute;top:-4px;left:-4px;width:16px;height:16px;border-top:3px solid #f72585;border-left:3px solid #f72585;"></div>
            <div style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-top:3px solid #f72585;border-right:3px solid #f72585;"></div>
            <div style="position:absolute;bottom:-4px;left:-4px;width:16px;height:16px;border-bottom:3px solid #f72585;border-left:3px solid #f72585;"></div>
            <div style="position:absolute;bottom:-4px;right:-4px;width:16px;height:16px;border-bottom:3px solid #f72585;border-right:3px solid #f72585;"></div>

            <!-- Top Header in HUD -->
            <div style="display:flex;justify-content:space-between;font-family:monospace;font-size:0.75rem;color:#00f5d4;border-bottom:1px dashed #334155;padding-bottom:10px;margin-bottom:20px;">
              <span>TARGET: ${esc(heroProduct.name)}</span>
              <span>CALIBRATION: 99.8%</span>
            </div>

            <!-- Main Floating Image with Radar Scan Line -->
            <div style="position:relative;overflow:hidden;padding:15px;">
              <img src="${esc(heroProduct.img || '/templates/senseng/products-1.jpg')}" alt="${esc(heroProduct.name)}" style="width:100%;max-width:360px;height:auto;object-fit:contain;filter:drop-shadow(0 0 25px rgba(0,245,212,0.4));animation:wrArcadeFloat 4s ease-in-out infinite alternate;">
              <div style="position:absolute;inset:0;height:2px;background:linear-gradient(90deg,transparent,#00f5d4,transparent);box-shadow:0 0 8px #00f5d4;animation:wrArcadeScan 3s linear infinite;"></div>
            </div>

            <!-- Bottom Live Oscilloscope Bars -->
            <div style="display:flex;justify-content:center;gap:6px;align-items:flex-end;height:24px;margin-top:16px;">
              <div style="width:4px;height:12px;background:#00f5d4;animation:wrArcadeBar 1s infinite alternate;"></div>
              <div style="width:4px;height:20px;background:#00f5d4;animation:wrArcadeBar 0.8s infinite alternate 0.2s;"></div>
              <div style="width:4px;height:16px;background:#f72585;animation:wrArcadeBar 1.2s infinite alternate 0.4s;"></div>
              <div style="width:4px;height:24px;background:#f72585;animation:wrArcadeBar 0.9s infinite alternate 0.1s;"></div>
              <div style="width:4px;height:14px;background:#00f5d4;animation:wrArcadeBar 1.1s infinite alternate 0.3s;"></div>
              <div style="width:4px;height:22px;background:#00f5d4;animation:wrArcadeBar 0.7s infinite alternate 0.5s;"></div>
            </div>
            <div style="font-family:monospace;font-size:0.72rem;color:#64748b;margin-top:8px;">ACOUSTIC CRUNCH FREQUENCY: 432 Hz</div>
          </div>
          <div style="margin-top:24px;text-align:center;">
            <a href="#arcade-physics" class="wr-scroll-down" aria-label="Scroll to physics benchmarks" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:4px;border:1px solid #00f5d4;color:#00f5d4;font-size:1.2rem;text-decoration:none;">↓</a>
          </div>
        </div>
      </div>
    </section>
  `;

  // 3. Tactile Physics Benchmark (Dynamic Progress Bars)
  const physicsProgressHtml = `
    <section id="arcade-physics" class="wrap" style="padding:60px 0;" data-reveal="fade-up">
      <div class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:36px 40px;box-shadow:0 12px 30px rgba(0,0,0,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
          <div>
            <span style="color:#00f5d4;font-family:monospace;font-size:0.8rem;font-weight:900;">// PHYSICAL BENCHMARKS</span>
            <h2 style="font-size:1.8rem;font-weight:900;color:#ffffff;margin:4px 0 0;">
              ${isZh ? '触觉物理引擎性能参数评测' : 'Sensory Calibration & Durability Index'}
            </h2>
          </div>
          <div style="font-family:monospace;color:#64748b;font-size:0.82rem;">
            TESTED ON EN71-1/2/3 & ASTM F963 PROTOCOLS
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;">
          <!-- Metric 1 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-family:monospace;font-size:0.88rem;">
              <span style="color:#ffffff;">${isZh ? '慢回弹记忆弹性 (Slow Rebound)' : 'Slow Rebound Elasticity'}</span>
              <span style="color:#00f5d4;font-weight:900;">98.4%</span>
            </div>
            <div style="background:#1e293b;height:10px;border-radius:9999px;overflow:hidden;position:relative;">
              <div class="wr-progress-bar" data-progress="98.4" style="background:linear-gradient(90deg,#00f5d4,#38bdf8);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1);"></div>
            </div>
            <div style="font-size:0.75rem;color:#64748b;margin-top:6px;">${isZh ? '5秒自然柔和慢升，不塌陷不变形' : '5-second balanced rise without memory lag'}</div>
          </div>

          <!-- Metric 2 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-family:monospace;font-size:0.88rem;">
              <span style="color:#ffffff;">${isZh ? '微爆珠手感阻尼 (Acoustic Feedback)' : 'Micro-Bead Soundwave'}</span>
              <span style="color:#f72585;font-weight:900;">100%</span>
            </div>
            <div style="background:#1e293b;height:10px;border-radius:9999px;overflow:hidden;position:relative;">
              <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#f72585,#7209b7);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;"></div>
            </div>
            <div style="font-size:0.75rem;color:#64748b;margin-top:6px;">${isZh ? '数万颗食品级微弹珠细密声音解压' : 'Thousands of sensory beads emitting crisp crunch'}</div>
          </div>

          <!-- Metric 3 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-family:monospace;font-size:0.88rem;">
              <span style="color:#ffffff;">${isZh ? '抗撕裂拉伸强度 (Tensile Strength)' : 'Tear & Drop Resistance'}</span>
              <span style="color:#00f5d4;font-weight:900;">99.6%</span>
            </div>
            <div style="background:#1e293b;height:10px;border-radius:9999px;overflow:hidden;position:relative;">
              <div class="wr-progress-bar" data-progress="99.6" style="background:linear-gradient(90deg,#00f5d4,#4ade80);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;"></div>
            </div>
            <div style="font-size:0.75rem;color:#64748b;margin-top:6px;">${isZh ? '耐受50,000次高强度揉捏与暴力测试' : 'Tested across 50k violent compressions'}</div>
          </div>

          <!-- Metric 4 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-family:monospace;font-size:0.88rem;">
              <span style="color:#ffffff;">${isZh ? '温感变色响应 (Thermochromic)' : 'Thermal Color Response'}</span>
              <span style="color:#fbbf24;font-weight:900;">94.8%</span>
            </div>
            <div style="background:#1e293b;height:10px;border-radius:9999px;overflow:hidden;position:relative;">
              <div class="wr-progress-bar" data-progress="94.8" style="background:linear-gradient(90deg,#fbbf24,#f97316);height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.45s;"></div>
            </div>
            <div style="font-size:0.75rem;color:#64748b;margin-top:6px;">${isZh ? '双手体温即刻触发颜色梯度流转' : 'Shifts color dynamically with hand temperature'}</div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 4. Cyber Blind Box / Arcade Products Grid
  const productsGridHtml = `
    <section class="wrap" style="padding:40px 0 70px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="color:#f72585;font-family:monospace;font-size:0.82rem;font-weight:900;">[ ARCADE ROSTER // 8 BESTSELLERS ]</span>
          <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;margin:6px 0 0;">
            ${isZh ? '8款机能触感潮玩盲盒陈列' : 'Cyber Tactical Squishy Roster'}
          </h2>
        </div>
        <a class="text-link" style="color:#00f5d4;font-family:monospace;font-size:0.9rem;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${isZh ? '查看全部机能目录' : 'Explore All Cyber Roster'} ↗
        </a>
      </div>

      <div class="wr-arcade-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:28px;">
        ${products.slice(0, 8).map((p, idx) => `
          <div class="wr-arcade-card wr-card-hover" data-reveal="fade-up" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.25s,border-color 0.25s,box-shadow 0.25s;position:relative;">
            <div style="position:relative;background:#151d2f;padding:28px 20px;text-align:center;border-bottom:1px solid #1e293b;">
              <span style="position:absolute;top:12px;left:12px;background:#090d16;color:#00f5d4;border:1px solid #00f5d4;font-family:monospace;font-size:0.7rem;font-weight:900;padding:2px 8px;border-radius:3px;">
                SLOT // 0${idx + 1}
              </span>
              <span style="position:absolute;top:12px;right:12px;background:#f72585;color:#ffffff;font-family:monospace;font-size:0.68rem;font-weight:900;padding:2px 8px;border-radius:3px;">
                ${esc(p.badge)}
              </span>
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:190px;width:auto;object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,0.3));transition:transform 0.3s;" loading="lazy">
            </div>

            <div style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;flex-grow:1;">
              <div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 8px;">
                  <a style="color:#ffffff;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${esc(p.name)}
                  </a>
                </h3>
                <p style="font-size:0.86rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;">
                  ${esc(p.desc)}
                </p>
              </div>

              <div>
                <div style="font-family:monospace;font-size:0.75rem;color:#64748b;margin-bottom:12px;">
                  DIM: ${esc(p.dimensions)} // MAT: ${esc(p.material)}
                </div>
                <a class="button" style="display:block;text-align:center;background:#1e293b;color:#00f5d4;border:1px solid #334155;font-weight:800;font-family:monospace;padding:12px;border-radius:4px;font-size:0.85rem;text-transform:uppercase;transition:all 0.2s;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${isZh ? '解构参数与询盘 ↗' : 'Inspect Specs ↗'}
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 5. Factory Specs & Cleanroom Banner
  const factoryBannerHtml = `
    <section class="wrap" style="padding:20px 0 70px;" data-reveal="fade-up">
      <div class="wr-card-hover" style="background:linear-gradient(135deg,#0f172a 0%, #1e1b4b 50%, #172554 100%);border:2px solid #3b82f6;border-radius:16px;padding:50px 40px;color:#ffffff;box-shadow:0 16px 40px rgba(59,130,246,0.2);">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:36px;align-items:center;">
          <div>
            <span style="color:#38bdf8;font-family:monospace;font-size:0.82rem;font-weight:900;">// INDUSTRIAL CAPABILITY MATRIX</span>
            <h2 style="font-size:2.2rem;font-weight:900;margin:6px 0 16px;color:#ffffff;">
              ${isZh ? '10,000㎡ 洁净智能制造工坊' : '10,000m² Cleanroom Manufacturing Grid'}
            </h2>
            <p style="font-size:0.98rem;line-height:1.7;color:#94a3b8;margin:0 0 24px;">
              ${isZh ? '配备 40 台全自动无尘注塑机台、精准滴胶成型流水线与万级洁净组装车间。已为欧美、日韩 60 多个国家的潮流品牌提供高精度 OEM/ODM 定制。' : 'Equipped with 40 cleanroom automated injection lines, micro-fill calibration robots, and class-10,000 dust-free packaging rooms. Exporting to over 60 countries.'}
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <span style="background:rgba(0,245,212,0.1);border:1px solid #00f5d4;color:#00f5d4;padding:6px 14px;border-radius:4px;font-family:monospace;font-size:0.8rem;">ISO 9001:2015</span>
              <span style="background:rgba(247,37,133,0.1);border:1px solid #f72585;color:#f72585;padding:6px 14px;border-radius:4px;font-family:monospace;font-size:0.8rem;">BSCI AUDITED</span>
              <span style="background:rgba(56,189,248,0.1);border:1px solid #38bdf8;color:#38bdf8;padding:6px 14px;border-radius:4px;font-family:monospace;font-size:0.8rem;">AMAZON FBA READY</span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div class="wr-card-hover" style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:24px;text-align:center;">
              <div style="font-size:2.2rem;font-weight:900;color:#00f5d4;font-family:monospace;" data-counter>1,200,000+</div>
              <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">${isZh ? '月度产能 (Monthly Units)' : 'Monthly Output'}</div>
            </div>
            <div class="wr-card-hover" style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:24px;text-align:center;">
              <div style="font-size:2.2rem;font-weight:900;color:#f72585;font-family:monospace;" data-counter>72h</div>
              <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">${isZh ? '极速打样 (Rapid Sampling)' : 'Rapid Prototype'}</div>
            </div>
            <div class="wr-card-hover" style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:24px;text-align:center;">
              <div style="font-size:2.2rem;font-weight:900;color:#38bdf8;font-family:monospace;" data-counter>60+</div>
              <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">${isZh ? '出口国家 (Export Markets)' : 'Global Markets'}</div>
            </div>
            <div class="wr-card-hover" style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:24px;text-align:center;">
              <div style="font-size:2.2rem;font-weight:900;color:#e2e8f0;font-family:monospace;" data-counter>100%</div>
              <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">${isZh ? '出厂全检 (Inspection Rate)' : 'QC Pass Rate'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-senseng-arcade-home" data-wr-page="home" style="background:#090d16;color:#f8fafc;min-height:100vh;">
      ${ribbonHtml}
      ${heroHtml}
      ${physicsProgressHtml}
      ${productsGridHtml}
      ${factoryBannerHtml}
    </main>
  `;
}

export function renderArcadeCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-arcade-inner" data-wr-page="catalog" style="padding-top:100px;background:#090d16;color:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="margin-bottom:44px;">
          <span style="color:#00f5d4;font-family:monospace;font-size:0.85rem;font-weight:900;">[ TACTICAL INVENTORY // FULL DATABASE ]</span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#ffffff;margin:8px 0 12px;">
            ${isZh ? '机能触感潮玩全部目录' : 'Cyber Tactical Squishy Catalog'}
          </h1>
          <p style="color:#94a3b8;font-size:1.05rem;max-width:680px;line-height:1.6;">
            ${isZh ? '浏览全部 8 款经国际实验室严格验证的机能触感公仔。支持大宗集装箱批发、亚马逊 FBA 专线发货与私模定制。' : 'Browse all lab-verified tactical squeeze toys. Engineered with high-elastic TPR and food-grade safety.'}
          </p>
        </div>

        <div class="wr-arcade-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:28px;">
          ${products.map((p, idx) => `
            <div class="wr-arcade-card wr-card-hover" data-reveal="fade-up" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;position:relative;">
              <div style="background:#151d2f;padding:28px 20px;text-align:center;border-bottom:1px solid #1e293b;position:relative;">
                <span style="position:absolute;top:12px;left:12px;background:#090d16;color:#00f5d4;border:1px solid #00f5d4;font-family:monospace;font-size:0.7rem;font-weight:900;padding:2px 8px;border-radius:3px;">
                  SLOT // 0${(idx % 8) + 1}
                </span>
                <span style="position:absolute;top:12px;right:12px;background:#f72585;color:#ffffff;font-family:monospace;font-size:0.68rem;font-weight:900;padding:2px 8px;border-radius:3px;">
                  ${esc(p.badge)}
                </span>
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:190px;width:auto;object-fit:contain;" loading="lazy">
              </div>

              <div style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;flex-grow:1;">
                <div>
                  <h2 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 8px;">
                    <a style="color:#ffffff;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                      ${esc(p.name)}
                    </a>
                  </h2>
                  <p style="font-size:0.86rem;color:#94a3b8;line-height:1.55;margin:0 0 16px;">
                    ${esc(p.desc)}
                  </p>
                </div>

                <div>
                  <div style="font-family:monospace;font-size:0.75rem;color:#64748b;margin-bottom:12px;">
                    DIM: ${esc(p.dimensions)} // MAT: ${esc(p.material)}
                  </div>
                  <a class="button" style="display:block;text-align:center;background:#00f5d4;color:#090d16;font-weight:900;font-family:monospace;padding:12px;border-radius:4px;font-size:0.85rem;text-transform:uppercase;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${isZh ? '规格参数与采购 ↗' : 'Specs & Order ↗'}
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

export function renderArcadeDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0] || {
    id: 'p1',
    name: 'Cyber Shiba Sensory Squishy',
    desc: 'High-density micro-bead core with tactile soundwave feedback.',
    badge: 'Cyber Pulse',
    material: 'Military-Grade Elastic TPR',
    dimensions: '8.5 × 6.5 cm',
    tagline: 'Hyper-Tactile Relief',
    category: 'cyber',
    img: '/templates/senseng/products-1.jpg',
  };
  const related = products.filter((item) => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-senseng-arcade-inner" data-wr-page="detail" style="padding-top:100px;background:#090d16;color:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="margin-bottom:24px;">
          <a class="text-link" style="color:#00f5d4;font-family:monospace;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ← ${isZh ? '返回全部机能目录' : 'BACK TO INVENTORY'}
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:start;">
          <!-- Left: Big Product Image in HUD Stand -->
          <div class="wr-arcade-hud wr-card-hover" data-reveal="fade-up" style="background:#0f172a;border:2px solid #00f5d4;border-radius:16px;padding:48px;text-align:center;box-shadow:0 0 30px rgba(0,245,212,0.2);">
            <img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;filter:drop-shadow(0 15px 25px rgba(0,0,0,0.5));">
            <div style="margin-top:28px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
              <span style="background:rgba(0,245,212,0.1);color:#00f5d4;border:1px solid #00f5d4;padding:4px 12px;border-radius:4px;font-family:monospace;font-size:0.75rem;">✓ FOOD-GRADE TPR</span>
              <span style="background:rgba(247,37,133,0.1);color:#f72585;border:1px solid #f72585;padding:4px 12px;border-radius:4px;font-family:monospace;font-size:0.75rem;">✓ EN71 / ASTM CERTIFIED</span>
              <span style="background:rgba(56,189,248,0.1);color:#38bdf8;border:1px solid #38bdf8;padding:4px 12px;border-radius:4px;font-family:monospace;font-size:0.75rem;">✓ 5s SLOW RISE</span>
            </div>
          </div>

          <!-- Right: Specs, Disassembly, Form -->
          <div data-reveal="fade-up">
            <div style="display:inline-block;background:#f72585;color:#ffffff;font-family:monospace;font-size:0.78rem;font-weight:900;padding:4px 12px;border-radius:3px;margin-bottom:12px;">
              ${esc(p.badge)}
            </div>

            <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#ffffff;margin:0 0 16px;">
              ${esc(p.name)}
            </h1>

            <p style="font-size:1.05rem;line-height:1.7;color:#94a3b8;margin:0 0 24px;">
              ${esc(p.desc)}
            </p>

            <!-- Disassembly Specs Table -->
            <div class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:28px;font-family:monospace;font-size:0.86rem;">
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1e293b;">
                <span style="color:#64748b;">DIMENSIONS</span>
                <span style="color:#00f5d4;font-weight:800;">${esc(p.dimensions)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1e293b;">
                <span style="color:#64748b;">CORE MATERIAL</span>
                <span style="color:#ffffff;font-weight:800;">${esc(p.material)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1e293b;">
                <span style="color:#64748b;">SAFETY COMPLIANCE</span>
                <span style="color:#f72585;font-weight:800;">ASTM F963 / EN71 / CPSIA</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;">
                <span style="color:#64748b;">SUPPLY MODE</span>
                <span style="color:#38bdf8;font-weight:800;">READY STOCK & CUSTOM OEM</span>
              </div>
            </div>

            <!-- Tactical HUD Benchmark Progress Bars -->
            <div class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-left:3px solid #00f5d4;border-radius:12px;padding:20px;margin-bottom:28px;">
              <div style="font-family:monospace;font-size:0.8rem;font-weight:900;color:#00f5d4;margin-bottom:14px;letter-spacing:0.08em;">
                // TACTICAL BENCHMARK GAUGES
              </div>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div>
                  <div style="display:flex;justify-content:space-between;font-family:monospace;font-size:0.82rem;margin-bottom:4px;">
                    <span style="color:#ffffff;">SLOW REBOUND DAMPING</span>
                    <span style="color:#00f5d4;font-weight:900;">98.4%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#1e293b;height:7px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="98.4" style="background:linear-gradient(90deg,#00f5d4,#38bdf8);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1);"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-family:monospace;font-size:0.82rem;margin-bottom:4px;">
                    <span style="color:#ffffff;">MICRO-BEAD ACOUSTIC CRUNCH</span>
                    <span style="color:#f72585;font-weight:900;">100%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#1e293b;height:7px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#f72585,#b5179e);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-family:monospace;font-size:0.82rem;margin-bottom:4px;">
                    <span style="color:#ffffff;">THERMAL COLOR LATENCY</span>
                    <span style="color:#fbbf24;font-weight:900;">94.8%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#1e293b;height:7px;border-radius:9999px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="94.8" style="background:linear-gradient(90deg,#fbbf24,#f97316);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s;"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Inquiry Direct Actions -->
            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <a class="button" style="flex:1;background:#00f5d4;color:#090d16;font-weight:900;font-family:monospace;padding:16px;border-radius:4px;text-align:center;text-transform:uppercase;box-shadow:0 0 20px rgba(0,245,212,0.35);" href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')}>
                ${isZh ? '提交采购与打样申请 ↗' : 'Request Quotation ↗'}
              </a>
              ${waDigits ? `
                <a class="button" style="background:#25d366;color:#ffffff;font-weight:900;padding:16px 24px;border-radius:4px;" href="https://wa.me/${waDigits}" target="_blank" rel="noopener">
                  WhatsApp
                </a>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Related Toys -->
        ${related.length > 0 ? `
          <div style="margin-top:70px;border-top:1px solid #1e293b;padding-top:40px;" data-reveal="fade-up">
            <h3 style="font-size:1.4rem;font-weight:900;color:#ffffff;font-family:monospace;margin-bottom:24px;">
              // SIMILAR ROSTER RECONNAISSANCE
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
              ${related.map((r) => `
                <div class="wr-arcade-card wr-card-hover" data-reveal="fade-up" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;text-align:center;">
                  <img src="${esc(r.img)}" alt="${esc(r.name)}" style="max-height:140px;object-fit:contain;margin-bottom:12px;">
                  <h4 style="font-size:0.95rem;font-weight:900;color:#ffffff;margin:0 0 8px;">${esc(r.name)}</h4>
                  <a class="button" style="background:#1e293b;color:#00f5d4;font-family:monospace;font-size:0.8rem;padding:8px 16px;border-radius:4px;display:inline-block;" href="${path(`products/${r.id}/index.html`)}" ${navAttrs('detail', r.id)}>
                    ${isZh ? '查看详情' : 'Inspect'} ↗
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

function renderLegacyArcadeAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;
  const hasCustomAbout = !!(company.aboutHighlights || company.aboutStory || company.aboutImageAssetId || company.aboutHeadline);

  if (hasCustomAbout) {
    const { primary: aboutImg, secondary: secondaryImg } = getAboutImages(ctx, path('assets/about-reference.jpg'));
    const headline = getAboutHeadline(company, isZh ? '解压潮玩机能工坊 · 为全球快乐护航' : 'Engineered for Joy // The Science of Sensory Toys');
    const storyParas = getAboutStoryParagraphs(
      company,
      isZh
        ? `${company.name || 'SENSENG'} 专注于新一代触觉潮玩与解压科技公仔的研发设计与规模化智造。我们坚持将最严苛的欧美玩具安全标准与最具潮流感的赛博机能语言相融合。`
        : `${company.name || 'SENSENG'} is dedicated to tactile sensory innovations and modern stress relief toys, bridging international safety standards with cyberpunk aesthetics.`,
    );
    const stats = parseAboutHighlights(company.aboutHighlights, [
      { value: '10,000 m²', num: 10000, suffix: ' m²', label: isZh ? '洁净智造中枢' : 'Cleanroom Facility', desc: isZh ? '万级无尘智造标准' : 'Class 10,000 cleanroom specs' },
      { value: '1,200,000+', num: 1200000, suffix: '+', label: isZh ? '月均峰值产能' : 'Monthly Unit Capacity', desc: isZh ? '高速精密模具注压' : 'High-speed automated molding' },
      { value: '60+', num: 60, suffix: '+', label: isZh ? '全球出海口岸' : 'Global Export Ports', desc: isZh ? '覆盖全球主流消费区' : 'Seamless multi-port logistics' },
      { value: '100%', num: 100, suffix: '%', label: isZh ? '国际安全合规率' : 'Safety Compliance Rate', desc: isZh ? 'EN71/ASTM全检合格' : 'Zero-defect lab certified' },
    ]);

    return `
      <main class="wr-inner wr-senseng-arcade-inner" data-wr-page="about" style="padding-top:100px;background:#090d16;color:#f8fafc;min-height:100vh;">
        <section class="wrap" style="padding:40px 0 80px;">
          <div class="about-split" data-reveal="fade-up" style="display:grid;grid-template-columns:1.15fr 1fr;gap:48px;align-items:center;margin-bottom:60px;">
            <div>
              <span style="color:#00f5d4;font-family:monospace;font-size:0.85rem;font-weight:900;">
                [ SYSTEM // SPEC_${esc((company.name || 'SENSENG').toUpperCase())} · EST. ${esc(company.establishedYear || '2020')} ]
              </span>
              <h1 style="font-size:clamp(2.4rem, 4.2vw, 3.4rem);font-weight:900;color:#ffffff;margin:8px 0 20px;line-height:1.15;">
                ${esc(headline)}
              </h1>
              <div style="color:#94a3b8;font-size:1.1rem;line-height:1.75;display:flex;flex-direction:column;gap:14px;margin-bottom:24px;">
                ${storyParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
              </div>
              <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#00f5d4;color:#090d16;font-family:monospace;font-weight:900;padding:14px 28px;border-radius:4px;box-shadow:0 0 20px rgba(0,245,212,0.3);text-decoration:none;letter-spacing:0.04em;">
                  &gt; INITIALIZE WHOLESALE PROTOCOL ↗
                </a>
                ${company.capabilities ? `
                  <div style="font-family:monospace;font-size:0.85rem;color:#00f5d4;border:1px solid #1e293b;background:#0f172a;padding:8px 14px;border-radius:4px;">
                    // ${esc(company.capabilities.slice(0, 40))}
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="wr-card-hover" style="position:relative;background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px;box-shadow:0 0 35px rgba(0,245,212,0.12);">
              <div style="position:relative;overflow:hidden;border-radius:8px;">
                <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform 0.5s ease;">
                <div style="position:absolute;inset:0;border:1px solid rgba(0,245,212,0.25);pointer-events:none;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding:4px 6px;font-family:monospace;font-size:0.75rem;color:#00f5d4;">
                <span>// HUD_OVERLAY: VERIFIED</span>
                <span style="color:#f72585;">STATUS: 100% OPERATIONAL</span>
              </div>
            </div>
          </div>

          ${secondaryImg ? `
            <div data-reveal="fade-up" style="display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px;margin-bottom:60px;">
              <div style="overflow:hidden;border-radius:8px;border:1px solid #1e293b;" class="wr-card-hover">
                <img src="${esc(secondaryImg)}" alt="${esc(company.name)} manufacturing line" style="width:100%;height:100%;object-fit:cover;">
              </div>
              <div>
                <span style="font-family:monospace;color:#f72585;font-weight:900;font-size:0.85rem;">[ FACILITY // AUTOMATION INFRASTRUCTURE ]</span>
                <h2 style="font-size:1.8rem;font-weight:900;color:#ffffff;margin:8px 0 14px;">Next-Gen Precision Robotics & Testing</h2>
                <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:0 0 18px;">
                  ${esc(company.capabilities || 'Engineered with automated silicone injection units, high-speed acoustic tuning pods, and laser metrology stations to eliminate dimensional variances.')}
                </p>
                ${company.certifications ? `
                  <div style="background:#090d16;border-left:3px solid #00f5d4;padding:12px 16px;border-radius:0 4px 4px 0;">
                    <strong style="color:#00f5d4;font-family:monospace;font-size:0.85rem;display:block;">[ ACCREDITED STANDARDS ]</strong>
                    <span style="color:#f8fafc;font-size:0.92rem;font-weight:700;">${esc(company.certifications)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- 3 Core Technological Pillars -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;margin-bottom:70px;">
            <div data-reveal="fade-up" class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px;">
              <div style="font-size:2.2rem;margin-bottom:14px;">🧪</div>
              <h3 style="font-size:1.25rem;font-weight:900;color:#00f5d4;margin:0 0 10px;font-family:monospace;">01 // 100% FOOD-GRADE SILICONE</h3>
              <p style="font-size:0.92rem;color:#94a3b8;line-height:1.65;margin:0;">
                ${isZh ? '选用纯净无气味食品级高弹 TPR 与硅胶原料，彻底杜绝重金属、塑化剂与甲醛隐患。' : 'Purified food-grade polymers free from plasticizers, heavy metals, and toxic additives.'}
              </p>
            </div>

            <div data-reveal="fade-up" class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px;">
              <div style="font-size:2.2rem;margin-bottom:14px;">🧬</div>
              <h3 style="font-size:1.25rem;font-weight:900;color:#f72585;margin:0 0 10px;font-family:monospace;">02 // ACOUSTIC MICRO-BEADS</h3>
              <p style="font-size:0.92rem;color:#94a3b8;line-height:1.65;margin:0;">
                ${isZh ? '独创微爆珠流体阻尼技术，手指揉捏发出细密治愈的爆破音浪，形成视听触三重释压闭环。' : 'Patented micro-bead resonance offering crisp auditory feedback and tactile dampening.'}
              </p>
            </div>

            <div data-reveal="fade-up" class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px;">
              <div style="font-size:2.2rem;margin-bottom:14px;">🌐</div>
              <h3 style="font-size:1.25rem;font-weight:900;color:#38bdf8;margin:0 0 10px;font-family:monospace;">03 // GLOBAL EXPORT COMPLIANCE</h3>
              <p style="font-size:0.92rem;color:#94a3b8;line-height:1.65;margin:0;">
                ${isZh ? '全线产品常年具备欧盟 CE、EN71 及美标 ASTM F963、CPSIA 检测报告，保障全球合规清关。' : 'Comprehensive lab test reports supporting seamless export clearance across Europe, America, and Asia.'}
              </p>
            </div>
          </div>

          <!-- Dynamic Laser Metrics & Timeline -->
          <div data-reveal="fade-up" class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:40px;margin-bottom:60px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-bottom:36px;border-bottom:1px solid #1e293b;padding-bottom:30px;">
              ${stats.map((s) => `
                <div>
                  <div style="font-size:2.4rem;font-weight:900;color:#00f5d4;font-family:monospace;" data-counter="${s.num}" data-suffix="${esc(s.suffix || '')}" data-prefix="${esc(s.prefix || '')}">${esc(s.value)}</div>
                  <div style="font-size:0.88rem;color:#94a3b8;font-family:monospace;margin-top:4px;">${esc(s.label)}</div>
                </div>
              `).join('')}
            </div>

            <h2 style="font-size:1.4rem;font-weight:900;color:#ffffff;font-family:monospace;margin:0 0 24px;">
              // EVOLUTION TIMELINE // 2018 - 2026
            </h2>
            <div style="display:grid;gap:20px;border-left:2px solid #00f5d4;padding-left:24px;margin-left:12px;">
              <div>
                <span style="font-family:monospace;color:#00f5d4;font-weight:900;">2018 · THE GENESIS</span>
                <p style="color:#94a3b8;font-size:0.92rem;margin:4px 0 0;">${isZh ? '工坊初创，首创高弹慢回弹配方在海外潮玩社区走红。' : 'First experimental formula developed, viral across global sensory toy communities.'}</p>
              </div>
              <div>
                <span style="font-family:monospace;color:#f72585;font-weight:900;">2022 · CLEANROOM EXPANSION</span>
                <p style="color:#94a3b8;font-size:0.92rem;margin:4px 0 0;">${isZh ? '落成 10,000㎡ 万级洁净智能制造中心，月产能突破 100 万件。' : 'Expanded to 10,000m² cleanroom facilities, crossing 1M monthly unit capacity.'}</p>
              </div>
              <div>
                <span style="font-family:monospace;color:#38bdf8;font-weight:900;">2026 · CYBER SENSORY ERA</span>
                <p style="color:#94a3b8;font-size:0.92rem;margin:4px 0 0;">${isZh ? '全面推出温感变色、微爆珠声学振动与机能潮玩全系列产品。' : 'Launching next-gen thermochromic, soundwave resonance, and cyber sensory product lines.'}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  return `
    <main class="wr-inner wr-senseng-arcade-inner" data-wr-page="about" style="padding-top:100px;background:#090d16;color:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="max-width:760px;margin-bottom:50px;">
          <span style="color:#00f5d4;font-family:monospace;font-size:0.85rem;font-weight:900;">[ ABOUT // THE SQUISH LAB ]</span>
          <h1 style="font-size:clamp(2.4rem, 4.2vw, 3.4rem);font-weight:900;color:#ffffff;margin:8px 0 20px;">
            ${isZh ? '解压潮玩机能工坊 · 为全球快乐护航' : 'Engineered for Joy // The Science of Sensory Toys'}
          </h1>
          <p style="color:#94a3b8;font-size:1.1rem;line-height:1.75;">
            ${isZh
              ? `${esc(company.name)} 专注于新一代触觉潮玩与解压科技公仔的研发设计与规模化智造。我们坚持将最严苛的欧美玩具安全标准与最具潮流感的赛博潮玩语言相融合。`
              : `${esc(company.name)} is dedicated to tactile sensory innovations and modern stress relief toys, bridging international safety standards with cyberpunk aesthetics.`}
          </p>
        </div>

        <!-- 3 Core Technological Pillars -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;margin-bottom:70px;">
          <div data-reveal="fade-up" class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px;">
            <div style="font-size:2.2rem;margin-bottom:14px;">🧪</div>
            <h3 style="font-size:1.25rem;font-weight:900;color:#00f5d4;margin:0 0 10px;font-family:monospace;">01 // 100% FOOD-GRADE SILICONE</h3>
            <p style="font-size:0.92rem;color:#94a3b8;line-height:1.65;margin:0;">
              ${isZh ? '选用纯净无气味食品级高弹 TPR 与硅胶原料，彻底杜绝重金属、塑化剂与甲醛隐患。' : 'Purified food-grade polymers free from plasticizers, heavy metals, and toxic additives.'}
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px;">
            <div style="font-size:2.2rem;margin-bottom:14px;">🧬</div>
            <h3 style="font-size:1.25rem;font-weight:900;color:#f72585;margin:0 0 10px;font-family:monospace;">02 // ACOUSTIC MICRO-BEADS</h3>
            <p style="font-size:0.92rem;color:#94a3b8;line-height:1.65;margin:0;">
              ${isZh ? '独创微爆珠流体阻尼技术，手指揉捏发出细密治愈的爆破音浪，形成视听触三重释压闭环。' : 'Patented micro-bead resonance offering crisp auditory feedback and tactile dampening.'}
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px;">
            <div style="font-size:2.2rem;margin-bottom:14px;">🌐</div>
            <h3 style="font-size:1.25rem;font-weight:900;color:#38bdf8;margin:0 0 10px;font-family:monospace;">03 // GLOBAL EXPORT COMPLIANCE</h3>
            <p style="font-size:0.92rem;color:#94a3b8;line-height:1.65;margin:0;">
              ${isZh ? '全线产品常年具备欧盟 CE、EN71 及美标 ASTM F963、CPSIA 检测报告，保障全球合规清关。' : 'Comprehensive lab test reports supporting seamless export clearance across Europe, America, and Asia.'}
            </p>
          </div>
        </div>

        <!-- Vertical Laser Timeline -->
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:40px;margin-bottom:60px;">
          <h2 style="font-size:1.6rem;font-weight:900;color:#ffffff;font-family:monospace;margin-bottom:30px;">
            // EVOLUTION TIMELINE // 2018 - 2026
          </h2>
          <div style="display:grid;gap:24px;border-left:2px solid #00f5d4;padding-left:24px;margin-left:12px;">
            <div>
              <span style="font-family:monospace;color:#00f5d4;font-weight:900;">2018 · THE GENESIS</span>
              <p style="color:#94a3b8;font-size:0.92rem;margin:4px 0 0;">${isZh ? '工坊初创，首创高弹慢回弹配方在海外潮玩社区走红。' : 'First experimental formula developed, viral across global sensory toy communities.'}</p>
            </div>
            <div>
              <span style="font-family:monospace;color:#f72585;font-weight:900;">2022 · CLEANROOM EXPANSION</span>
              <p style="color:#94a3b8;font-size:0.92rem;margin:4px 0 0;">${isZh ? '落成 10,000㎡ 万级洁净智能制造中心，月产能突破 100 万件。' : 'Expanded to 10,000m² cleanroom facilities, crossing 1M monthly unit capacity.'}</p>
            </div>
            <div>
              <span style="font-family:monospace;color:#38bdf8;font-weight:900;">2026 · CYBER SENSORY ERA</span>
              <p style="color:#94a3b8;font-size:0.92rem;margin:4px 0 0;">${isZh ? '全面推出温感变色、微爆珠声学振动与机能潮玩全系列产品。' : 'Launching next-gen thermochromic, soundwave resonance, and cyber sensory product lines.'}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}


function renderModernArcadeAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;

  const { primary: aboutImg, secondary: secondaryImg } = getAboutImages(ctx, path('assets/about-reference.jpg'), path('assets/hero-arcade.jpg'));
  const headline = getAboutHeadline(company, isZh ? '解压潮玩机能工坊 · 为全球快乐护航' : 'Engineered for Joy // The Science of Sensory Toys');
  const storyParas = getAboutStoryParagraphs(
    company,
    isZh
      ? [
          `${company.name || 'SENSENG'} 专注于新一代触觉潮玩与机能解压装备的研发设计与高精度制造。我们将前沿未来机械美学语言与国际高规格玩具安全准则深度熔铸。`,
          '在我们的战术机能工坊中，高精度 CNC 镜面数控机床与十万级无尘洁净车间协同运转。全系产品选用食品级高弹 TPR 与医疗级铂金硅胶基底，经由严苛的高频压缩震荡与 2.5 米暴力抗摔实测，确保每一件潮玩兼备惊艳的视觉张力与极致顺滑的手感。',
          '通过欧盟 EN71、美标 ASTM F963 及 CPSIA 等全球第三方检测认证，我们为全球先锋买手店、潮流零售连锁及跨境电商伙伴提供从工业 ID 概念设计到快速出海清关的一站式定制服务。'
        ]
      : [
          `${company.name || 'SENSENG'} is dedicated to next-generation tactile designer toys, merging cyberpunk mechanics with international toy safety protocols and high-throughput production.`,
          'Inside our tactical fabrication lab, high-precision CNC tooling centers and cleanroom injection lines operate in tandem. We formulate food-grade TPR and platinum silicone to withstand extreme cyclic compression and 2.5-meter impact drops.',
          'Certified under EN71, ASTM F963, and CPSIA frameworks, we deliver end-to-end supply chain agility, rapid prototyping, and verified export clearance for global toy lifestyle brands and retailers.'
        ]
  );

  const stats = parseAboutHighlights(company.aboutHighlights, [
    { value: '10,000+ m²', num: 10000, suffix: ' m²', label: isZh ? '洁净智造中枢' : 'Cleanroom Facility', desc: isZh ? '万级无尘智造标准' : 'Class 10,000 cleanroom specs' },
    { value: '1,200,000+', num: 1200000, suffix: '+', label: isZh ? '月均出海产能' : 'Monthly Unit Capacity', desc: isZh ? '高速精密模具注压' : 'High-speed automated molding' },
    { value: '60+', num: 60, suffix: '+', label: isZh ? '全球出口口岸' : 'Global Export Ports', desc: isZh ? '覆盖欧美亚主流消费区' : 'Seamless multi-port logistics' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '国际安全合规率' : 'Safety Compliance Rate', desc: isZh ? 'EN71 / ASTM / CPSIA 全检合格' : 'Zero-defect lab certified' },
  ]);

  return `
    <main class="wr-inner wr-senseng-arcade-inner" data-wr-page="about" style="padding-top:100px;background:#090d16;color:#f8fafc;min-height:100vh;">
      <!-- 1. TERMINAL TELEMETRY MARQUEE HEADER (NO STANDARD 2-COLUMN SPLIT) -->
      <div style="background:#030712;border-bottom:1px solid #1e293b;padding:12px 24px;font-family:monospace;font-size:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;color:#00f5d4;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00f5d4;box-shadow:0 0 10px #00f5d4;animation:wr-pulse 1.5s infinite;"></span>
          <span>&gt; SYSTEM.INIT // SENSENG_TACTICAL_SQUISH_CORE_V4.2 [ONLINE]</span>
        </div>
        <div style="color:#94a3b8;display:flex;gap:16px;">
          <span>CORE_TEMP: 24°C</span>
          <span style="color:#f72585;">STRAIN_RECOVERY: 99.9%</span>
          <span style="color:#38bdf8;">SEC_PROTOCOL: EN71-PASS</span>
        </div>
      </div>

      <!-- 2. 4-QUADRANT TACTICAL MISSION DECK -->
      <section style="padding:48px 24px 70px;max-width:1440px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:28px;margin-bottom:60px;" data-reveal="fade-up">
          <!-- QUADRANT 1: MISSION DOSSIER BRIEFING -->
          <div class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;padding:36px;box-shadow:0 0 35px rgba(0,245,212,0.06);display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <span style="font-family:monospace;font-size:0.8rem;color:#00f5d4;letter-spacing:0.12em;text-transform:uppercase;display:block;margin-bottom:10px;">
                [ QUADRANT 01 // MISSION DOSSIER ] · EST. ${esc(company.establishedYear || '2020')}
              </span>
              <h1 style="font-size:clamp(2rem, 3.8vw, 3rem);font-weight:900;color:#ffffff;margin:0 0 18px;line-height:1.15;">
                ${esc(headline)}
              </h1>
              <div style="color:#94a3b8;font-size:1.02rem;line-height:1.75;display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
                ${storyParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
              </div>
            </div>
            <div>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#00f5d4;color:#090d16;font-family:monospace;font-weight:900;padding:14px 28px;border-radius:6px;box-shadow:0 0 20px rgba(0,245,212,0.35);text-decoration:none;display:inline-block;letter-spacing:0.04em;">
                &gt; INITIALIZE WHOLESALE PROTOCOL ↗
              </a>
            </div>
          </div>

          <!-- QUADRANT 2: HOLOGRAPHIC SVG RADAR & STRAIN TELEMETRY (GUARANTEED NEVER BLANK!) -->
          <div class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;padding:36px;box-shadow:0 0 35px rgba(0,245,212,0.06);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;min-height:380px;">
            <div style="display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:11px;color:#00f5d4;margin-bottom:12px;z-index:2;position:relative;">
              <span>[ QUADRANT 02 // 3D TACTILE RADAR ]</span>
              <span style="color:#f72585;">TELEMETRY: ACTIVE</span>
            </div>

            <!-- SVG Animated Radar Centerpiece -->
            <div style="position:relative;width:100%;height:220px;display:flex;align-items:center;justify-content:center;z-index:2;">
              <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
                <circle cx="110" cy="110" r="100" fill="none" stroke="#1e293b" stroke-width="1.5"/>
                <circle cx="110" cy="110" r="70" fill="none" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4"/>
                <circle cx="110" cy="110" r="40" fill="none" stroke="rgba(0,245,212,0.3)" stroke-width="1.5"/>
                <line x1="110" y1="10" x2="110" y2="210" stroke="#1e293b" stroke-width="1"/>
                <line x1="10" y1="110" x2="210" y2="110" stroke="#1e293b" stroke-width="1"/>
                <!-- Sweeping Radar Hand -->
                <line x1="110" y1="110" x2="190" y2="70" stroke="#00f5d4" stroke-width="2.5" stroke-linecap="round"/>
                <!-- Target Pulse -->
                <circle cx="150" cy="90" r="5" fill="#f72585"/>
                <circle cx="150" cy="90" r="12" fill="none" stroke="#f72585" opacity="0.6"/>
              </svg>
            </div>

            <div style="font-family:monospace;font-size:12px;color:#cbd5e1;background:#090d16;padding:12px 16px;border-radius:8px;border:1px solid #1e293b;z-index:2;position:relative;">
              <div style="color:#00f5d4;font-weight:900;margin-bottom:4px;">// RADAR DIAGNOSTIC: 0.05S INSTANT REBOUND</div>
              <div style="color:#94a3b8;font-size:11px;">Micro-cellular bubble resonance calibrated for zero tactile latency.</div>
            </div>
          </div>

          <!-- QUADRANT 3: HIGH-SPEED TEST CAMERA MONITOR -->
          <div class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;overflow:hidden;box-shadow:0 0 35px rgba(247,37,133,0.06);position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:380px;">
            ${aboutImg ? `<img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.65;z-index:1;" onerror="this.style.display=\'none\'">` : ''}
            <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(9,13,22,0.95) 0%, rgba(9,13,22,0.3) 60%, rgba(0,0,0,0.1) 100%);z-index:2;"></div>

            <!-- Corner Telemetry Overlay -->
            <div style="position:absolute;top:16px;left:16px;background:rgba(9,13,22,0.9);border:1px solid rgba(0,245,212,0.4);border-radius:4px;padding:4px 10px;font-family:monospace;font-size:11px;color:#00f5d4;z-index:3;">
              ● REC [120 FPS HIGH-SPEED CAPTURE]
            </div>

            <div style="position:relative;padding:24px;z-index:3;">
              <span style="font-family:monospace;font-size:11px;color:#f72585;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">
                QUADRANT 03 // DEFORMATION TESTING
              </span>
              <h3 style="font-size:1.3rem;font-weight:900;color:#ffffff;margin:4px 0 10px;font-family:monospace;">
                ${isZh ? '200,000 次暴力揉捏极限测试' : '200,000 Squeeze Fatigue Testing'}
              </h3>
              <div style="display:flex;gap:8px;flex-wrap:wrap;font-family:monospace;font-size:11px;">
                <span style="background:rgba(0,245,212,0.15);border:1px solid rgba(0,245,212,0.3);color:#00f5d4;padding:4px 8px;border-radius:4px;">2.5M DROP PASS</span>
                <span style="background:rgba(247,37,133,0.15);border:1px solid rgba(247,37,133,0.3);color:#f72585;padding:4px 8px;border-radius:4px;">SHORE 15A GEL</span>
              </div>
            </div>
          </div>

          <!-- QUADRANT 4: MATERIAL TELEMETRY GAUGE BARS -->
          <div class="wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;padding:36px;box-shadow:0 0 35px rgba(56,189,248,0.06);display:flex;flex-direction:column;justify-content:space-between;min-height:380px;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:11px;color:#38bdf8;margin-bottom:18px;">
                <span>[ QUADRANT 04 // MATERIAL SPECS ]</span>
                <span style="color:#00f5d4;">QA: PASSED</span>
              </div>
              <h3 style="font-size:1.3rem;font-weight:900;color:#ffffff;font-family:monospace;margin:0 0 20px;">
                ${isZh ? '高分子物性实时遥测' : 'Polymer Physical Telemetry'}
              </h3>

              <div style="display:flex;flex-direction:column;gap:18px;font-family:monospace;font-size:12px;">
                <div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#cbd5e1;">
                    <span>TENSILE ELASTICITY</span>
                    <span style="color:#00f5d4;">450%</span>
                  </div>
                  <div style="width:100%;height:6px;background:#090d16;border-radius:9999px;overflow:hidden;">
                    <div style="width:90%;height:100%;background:#00f5d4;border-radius:9999px;"></div>
                  </div>
                </div>

                <div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#cbd5e1;">
                    <span>REBOUND RETENTION</span>
                    <span style="color:#f72585;">99.9%</span>
                  </div>
                  <div style="width:100%;height:6px;background:#090d16;border-radius:9999px;overflow:hidden;">
                    <div style="width:99%;height:100%;background:#f72585;border-radius:9999px;"></div>
                  </div>
                </div>

                <div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#cbd5e1;">
                    <span>FOOD-GRADE SILICONE PURITY</span>
                    <span style="color:#38bdf8;">100% ZERO VOC</span>
                  </div>
                  <div style="width:100%;height:6px;background:#090d16;border-radius:9999px;overflow:hidden;">
                    <div style="width:100%;height:100%;background:#38bdf8;border-radius:9999px;"></div>
                  </div>
                </div>
              </div>
            </div>

            <div style="font-family:monospace;font-size:11px;color:#94a3b8;border-top:1px solid #1e293b;padding-top:16px;">
              // FULL SPECTRUM CERTIFIED: EN71 · ASTM F963 · CPSIA
            </div>
          </div>
        </div>
      </section>

      <!-- 3. TERMINAL COMMAND LOG & EVOLUTION ROADMAP -->
      <section style="padding:0 24px 80px;max-width:1440px;margin:0 auto;" data-reveal="fade-up">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:40px;box-shadow:0 12px 36px rgba(0,0,0,0.5);">
          <!-- Terminal Title Bar -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:28px;border-bottom:1px solid #1e293b;padding-bottom:18px;">
            <span style="width:12px;height:12px;border-radius:50%;background:#ef4444;display:inline-block;"></span>
            <span style="width:12px;height:12px;border-radius:50%;background:#f59e0b;display:inline-block;"></span>
            <span style="width:12px;height:12px;border-radius:50%;background:#10b981;display:inline-block;"></span>
            <span style="font-family:monospace;font-size:12px;color:#94a3b8;margin-left:8px;">bash - senseng-evolution.log (2018 - 2026)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;font-family:monospace;">
            <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:24px;">
              <span style="color:#00f5d4;font-weight:900;">[2018] THE GENESIS PROTOCOL</span>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:8px 0 0;">
                ${isZh ? '自研首代慢回弹配方，在海外潮玩及解压玩具社区引爆病毒式传播。' : 'First experimental formula developed, viral across global sensory toy communities.'}
              </p>
            </div>

            <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:24px;">
              <span style="color:#f72585;font-weight:900;">[2022] CLEANROOM SCALE-UP</span>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:8px 0 0;">
                ${isZh ? '落成万级无尘智造基地，月产能突破 100 万件，全面获得欧美玩具认证。' : 'Expanded cleanroom facilities, crossing 1M monthly unit capacity with EN71 compliance.'}
              </p>
            </div>

            <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:24px;">
              <span style="color:#38bdf8;font-weight:900;">[2026] CYBER SENSORY LAB</span>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:8px 0 0;">
                ${isZh ? '全面推出微爆珠共振音浪、温感变色与机能潮玩手办全矩阵产品。' : 'Next-gen thermochromic, soundwave resonance, and cyber sensory tactile gear.'}
              </p>
            </div>
          </div>

          <!-- Digital Counters Strip -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-top:36px;border-top:1px solid #1e293b;padding-top:30px;">
            ${stats.map((s) => `
              <div>
                <div style="font-size:2.4rem;font-weight:900;color:#00f5d4;font-family:monospace;" data-counter="${s.num}" data-suffix="${esc(s.suffix || '')}" data-prefix="${esc(s.prefix || '')}">${esc(s.value)}</div>
                <div style="font-size:0.85rem;color:#94a3b8;font-family:monospace;margin-top:4px;">[ ${esc(s.label)} ]</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderArcadeAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyArcadeAbout(ctx);
  }
  return renderModernArcadeAbout(ctx);
}

export function renderArcadeContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-arcade-inner" data-wr-page="contact" style="padding-top:100px;background:#090d16;color:#f8fafc;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="max-width:680px;margin-bottom:44px;">
          <span style="color:#00f5d4;font-family:monospace;font-size:0.85rem;font-weight:900;">[ TERMINAL TRANSMISSION // INQUIRY ]</span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#ffffff;margin:8px 0 12px;">
            ${isZh ? '启动样品索取与商业定制终端' : 'Initialize Sample & B2B Inquiry Terminal'}
          </h1>
          <p style="color:#94a3b8;font-size:1.05rem;line-height:1.6;">
            ${isZh ? '无论您是全球玩具买手、跨境电商卖家或品牌零售商，欢迎填写终端表单获取完整目录与现货/定制报价。' : 'Connect with our engineering and export team for sample kits, wholesale catalogs, and OEM quotes.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:44px;align-items:start;">
          <!-- Left: Contact Form -->
          <div data-reveal="fade-up" class="wr-card-hover" style="background:#0f172a;border:2px solid #1e293b;border-radius:16px;padding:36px;box-shadow:0 12px 36px rgba(0,0,0,0.4);">
            <form id="inquiry" action="${esc(ctx.options.inquiryUrl)}" method="post" style="display:grid;gap:20px;">
              <div>
                <label for="name" style="display:block;font-family:monospace;font-size:0.82rem;font-weight:800;color:#00f5d4;margin-bottom:6px;">// USER_NAME</label>
                <input id="name" name="name" required style="width:100%;padding:14px;background:#151d2f;border:1px solid #334155;border-radius:4px;color:#ffffff;font-size:0.95rem;box-sizing:border-box;">
              </div>

              <div>
                <label for="email" style="display:block;font-family:monospace;font-size:0.82rem;font-weight:800;color:#00f5d4;margin-bottom:6px;">// EMAIL_ADDRESS</label>
                <input id="email" name="email" type="email" required style="width:100%;padding:14px;background:#151d2f;border:1px solid #334155;border-radius:4px;color:#ffffff;font-size:0.95rem;box-sizing:border-box;">
              </div>

              <div>
                <label for="productId" style="display:block;font-family:monospace;font-size:0.82rem;font-weight:800;color:#00f5d4;margin-bottom:6px;">// TARGET_PRODUCT</label>
                <select id="productId" name="productId" style="width:100%;padding:14px;background:#151d2f;border:1px solid #334155;border-radius:4px;color:#ffffff;font-size:0.95rem;box-sizing:border-box;">
                  <option value="">${isZh ? '全部产品 / 大宗批发咨询' : 'All Products / General Wholesale'}</option>
                  ${products.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label for="message" style="display:block;font-family:monospace;font-size:0.82rem;font-weight:800;color:#00f5d4;margin-bottom:6px;">// TRANSMISSION_BODY</label>
                <textarea id="message" name="message" rows="4" required style="width:100%;padding:14px;background:#151d2f;border:1px solid #334155;border-radius:4px;color:#ffffff;font-size:0.95rem;box-sizing:border-box;resize:vertical;"></textarea>
              </div>

              <button type="submit" class="button" style="background:#00f5d4;color:#090d16;font-weight:900;font-family:monospace;font-size:1rem;padding:16px;border-radius:4px;border:none;cursor:pointer;text-transform:uppercase;box-shadow:0 0 24px rgba(0,245,212,0.4);">
                TRANSMIT INQUIRY ↗
              </button>
              <div role="status" style="font-family:monospace;font-size:0.85rem;color:#00f5d4;text-align:center;"></div>
            </form>
          </div>

          <!-- Right: Direct Terminal Info -->
          <div data-reveal="fade-up" style="display:grid;gap:20px;">
            <div class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:28px;">
              <span style="font-family:monospace;color:#f72585;font-size:0.8rem;font-weight:800;">// DIRECT_LINES</span>
              <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:8px 0 14px;">${esc(company.name)}</h3>
              <p style="color:#94a3b8;font-size:0.92rem;margin:0 0 8px;"><strong>EMAIL:</strong> <a style="color:#00f5d4;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
              ${company.contactName ? `<p style="color:#94a3b8;font-size:0.92rem;margin:0 0 8px;"><strong>CONTACT:</strong> ${esc(company.contactName)}</p>` : ''}
              ${company.phone ? `<p style="color:#94a3b8;font-size:0.92rem;margin:0 0 8px;"><strong>TEL:</strong> ${esc(company.phone)}</p>` : ''}
              ${company.whatsapp ? `<p style="color:#94a3b8;font-size:0.92rem;margin:0 0 8px;"><strong>WHATSAPP:</strong> ${esc(company.whatsapp)}</p>` : ''}
            </div>

            <div class="wr-arcade-card wr-card-hover" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:28px;">
              <span style="font-family:monospace;color:#38bdf8;font-size:0.8rem;font-weight:800;">// SAMPLE_KIT_POLICY</span>
              <h4 style="font-size:1.05rem;font-weight:900;color:#ffffff;margin:8px 0 10px;">${isZh ? '样品寄送与打样标准' : 'Rapid Sample Dispatch'}</h4>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:0;">
                ${isZh ? '常备现货样品 24 小时内发出；定制打样支持 3-5 个工作日快速出样；提供全球 DHL/FedEx 门到门空运。' : 'Stock samples shipped in 24 hours. Bespoke customized tooling sampled within 3-5 business days.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderArcadePage(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';

  let inner = '';
  switch (ctx.options.page) {
    case 'catalog':
      inner = renderArcadeCatalog(ctx);
      break;
    case 'detail':
      inner = renderArcadeDetail(ctx);
      break;
    case 'about':
      inner = renderArcadeAbout(ctx);
      break;
    case 'contact':
      inner = renderArcadeContact(ctx);
      break;
    case 'home':
    default:
      inner = renderArcadeHome(ctx);
      break;
  }

  // Header & Navigation
  const headerHtml = `
    <header class="wr-arcade-header" style="position:sticky;top:0;z-index:100;background:rgba(9,13,22,0.92);backdrop-filter:blur(12px);border-bottom:1px solid #1e293b;box-shadow:0 4px 20px rgba(0,0,0,0.5);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:#00f5d4;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#090d16;font-weight:900;font-size:1.2rem;box-shadow:0 0 12px #00f5d4;">
            ⚡
          </div>
          <span style="font-size:1.25rem;font-weight:900;letter-spacing:0.04em;color:#ffffff;font-family:monospace;">
            ${esc(company.name || 'SENSENG')}
          </span>
        </a>

        <nav aria-label="${esc(ui.menu)}" style="display:flex;gap:28px;align-items:center;font-family:monospace;font-size:0.9rem;font-weight:700;">
          <a class="nav-link" href="${path('index.html')}" ${navAttrs('home')} style="color:#ffffff;text-decoration:none;transition:color 0.2s;">${esc(ui.home)}</a>
          <a class="nav-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#ffffff;text-decoration:none;transition:color 0.2s;">${esc(ui.catalog)}</a>
          <a class="nav-link" href="${path('about/index.html')}" ${navAttrs('about')} style="color:#ffffff;text-decoration:none;transition:color 0.2s;">${esc(ui.about)}</a>
          <a class="nav-link" href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#ffffff;text-decoration:none;transition:color 0.2s;">${esc(ui.contact)}</a>
        </nav>

        <div style="display:flex;align-items:center;gap:16px;">
          <a class="button" style="background:#00f5d4;color:#090d16;font-family:monospace;font-weight:900;font-size:0.82rem;padding:10px 18px;border-radius:4px;text-transform:uppercase;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '询盘终端' : 'B2B INQUIRY'}
          </a>
        </div>
      </div>
    </header>
  `;

  // Futuristic Dark Footer
  const footerHtml = `
    <footer style="background:#05070d;border-top:2px solid #1e293b;padding:60px 0 30px;color:#94a3b8;font-family:monospace;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:36px;margin-bottom:40px;">
        <div>
          <div style="font-size:1.3rem;font-weight:900;color:#00f5d4;margin-bottom:12px;">${esc(company.name)}</div>
          <p style="font-size:0.86rem;line-height:1.6;margin:0 0 16px;">
            Next-gen sensory squeeze toys engineered for stress relief and tactile play. Lab-verified non-toxic food-grade silicone.
          </p>
          <div style="font-size:0.8rem;color:#64748b;">EN71 · ASTM F963 · CE · CPC · ISO 9001</div>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:900;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">// CATALOG</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.85rem;">
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Shiba Inu Pop Beads</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Desk Anti-Stress Penguin</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Thermal Narwhal Shifts</a></li>
            <li><a style="text-decoration:none;color:#94a3b8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Deluxe Heart Cat Gifts</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:900;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">// LAB MATRIX</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.85rem;">
            <li>✓ 10,000m² Cleanroom Facility</li>
            <li>✓ 50k Cycles Flex Resistance</li>
            <li>✓ 1.2M Monthly Unit Capacity</li>
            <li>✓ Rapid 72h Tooling Prototyping</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:900;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">// TERMINAL</h4>
          <p style="font-size:0.86rem;margin:0 0 8px;">EMAIL: <a style="color:#00f5d4;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="font-size:0.86rem;margin:0;">TEL: ${esc(company.phone)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1e293b;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.8rem;color:#64748b;">
        <div>© 2026 ${esc(company.name)}. ALL RIGHTS RESERVED.</div>
        <div style="color:#00f5d4;">⚡ SENSENG CYBER ARCADE ENGINE</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${inner}${footerHtml}`;
}
