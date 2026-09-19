import type { Product } from '../../shared/model';
import { isTypedMaterialsSource } from '../materials-typed';
import { esc, safeUrl, type ThemeContext } from './types';
import { CANDY_DEFAULT_PRODUCTS, getCandyProducts } from './sensengCandy';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

export function renderMinimalHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const heroProduct = products[0] || {
    id: 'p1',
    name: 'Tactile Form № 01 (Shiba)',
    desc: 'Precision-molded acoustic squeeze sculpture.',
    badge: '№ 01 Archival',
    material: 'Medical-Grade Tactile Polymer',
    dimensions: '8.5 × 6.5 cm',
    tagline: 'Quiet Architecture for Hands',
    category: 'gallery',
    img: '/templates/senseng/products-1.jpg',
  };
  const pAt = (idx: number) => (products.length > 0 ? products[idx % products.length] : heroProduct);

  const userCopy = draft.copy[ctx.lang];
  const copy = {
    headline: userCopy?.headline || (isZh ? '形体、重力与指尖静谧的永恒触觉' : 'Form, Gravity & The Quiet Joy of Tactile Objects'),
    subtitle: userCopy?.subtitle || (isZh
      ? '源自瑞士国际主义极简设计哲学。以微米级开模公差与医用级触感聚合物，让解压公仔升华为现代桌面雕塑与触觉艺术藏品。'
      : 'Rooted in Swiss modernist minimalism. Precision-calibrated tactile polymers designed as collectible sculptures for the mindful desk.'),
    cta: userCopy?.cta || (isZh ? '阅览典藏画廊' : 'View Exhibition Index'),
  };

  const customBanner = draft.banner ? ctx.asset(draft.banner.assetId) : null;
  const heroBg = customBanner
    ? `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.94) 100%), url('${esc(customBanner)}') center/cover no-repeat`
    : `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(249,250,251,0.96) 100%), url('/templates/senseng/hero-minimal.jpg') center/cover no-repeat`;

  // 1. Top Archival Ribbon
  const ribbonHtml = `
    <div class="wr-minimal-ribbon" style="background:#111827;color:#9ca3af;padding:8px 0;font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #1f2937;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <span>ARCHIVE 2026 // SENSORY OBJECTS № 01 — 08</span>
        <span style="color:#c59b27;font-weight:700;">INTERNATIONAL EN71 & ASTM F963 CERTIFIED // SWISS DESIGN ETHOS</span>
      </div>
    </div>
  `;

  // 2. Sculptural Spotlight Hero
  const heroHtml = `
    <section class="wr-minimal-hero" data-wr-hero aria-label="${esc(copy.headline)}" style="background:${heroBg};padding:85px 0 95px;position:relative;border-bottom:1px solid #e5e7eb;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:60px;align-items:center;">
        <!-- Left Editorial Column -->
        <div class="wr-minimal-hero-left" data-reveal="fade-up">
          <div style="font-size:0.8rem;letter-spacing:0.2em;text-transform:uppercase;color:#c59b27;font-weight:800;margin-bottom:20px;">
            № 2026 COLLECTION // OBJECT STUDY
          </div>

          <h1 class="hero-title" style="font-size:clamp(2.4rem, 4.4vw, 3.8rem);line-height:1.15;font-weight:900;color:#111827;letter-spacing:-0.04em;margin:0 0 24px;">
            ${esc(copy.headline)}
          </h1>

          <p style="font-size:1.12rem;line-height:1.8;color:#4b5563;margin:0 0 36px;max-width:520px;">
            ${esc(copy.subtitle)}
          </p>

          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a class="button" style="background:#111827;color:#ffffff;font-weight:700;padding:16px 36px;border-radius:2px;font-size:0.92rem;letter-spacing:0.04em;text-transform:uppercase;box-shadow:0 4px 14px rgba(0,0,0,0.15);" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
              ${esc(copy.cta || (isZh ? '探索全部藏品' : 'Explore Archive'))} ↗
            </a>
            <a class="button" style="background:#ffffff;color:#111827;border:1px solid #111827;font-weight:700;padding:15px 32px;border-radius:2px;font-size:0.92rem;letter-spacing:0.04em;text-transform:uppercase;" href="${path('about/index.html')}" ${navAttrs('about')}>
              ${isZh ? '工坊设计宣言 →' : 'Design Manifesto →'}
            </a>
          </div>

          <!-- Precision Counters -->
          <div style="margin-top:48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:24px;border-top:1px solid #e5e7eb;padding-top:28px;">
            <div>
              <div style="font-size:2rem;font-weight:900;color:#111827;letter-spacing:-0.02em;" data-counter>
                36 GATES
              </div>
              <div style="font-size:0.75rem;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;margin-top:4px;">${isZh ? '精密品质工序' : 'Quality Gates'}</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#c59b27;letter-spacing:-0.02em;" data-counter>
                500+ STORES
              </div>
              <div style="font-size:0.75rem;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;margin-top:4px;">${isZh ? '全球设计买手店' : 'Design Boutiques'}</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:900;color:#111827;letter-spacing:-0.02em;" data-counter>
                99.4%
              </div>
              <div style="font-size:0.75rem;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;margin-top:4px;">${isZh ? '触觉满意度' : 'Client Rating'}</div>
            </div>
          </div>

          <div style="margin-top:28px;">
            <a href="#minimal-exhibit" class="wr-scroll-down" aria-label="Scroll to exhibition archive" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:2px;border:1px solid #111827;color:#111827;font-size:1.2rem;text-decoration:none;">↓</a>
          </div>
        </div>

        <!-- Right Spotlight Podium -->
        <div class="wr-minimal-hero-right" style="position:relative;text-align:center;" data-reveal="fade-up">
          <div class="wr-minimal-podium wr-hero-float wr-card-hover" style="background:#f9fafb;border:1px solid #e5e7eb;padding:50px 30px;position:relative;max-width:460px;margin:0 auto;box-shadow:0 20px 40px rgba(0,0,0,0.03);">
            <div style="position:absolute;top:16px;left:16px;font-size:0.72rem;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;">
              EXHIBIT // № 01
            </div>
            <img src="${esc(heroProduct.img || '/templates/senseng/products-3.jpg')}" alt="${esc(heroProduct.name)}" style="width:100%;max-width:340px;height:auto;object-fit:contain;filter:drop-shadow(0 20px 30px rgba(0,0,0,0.08));">
            <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:14px;display:flex;justify-content:space-between;font-size:0.78rem;color:#6b7280;letter-spacing:0.05em;">
              <span>${esc(heroProduct.name)}</span>
              <span>100% NON-TOXIC SILICONE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 3. Precision Damping & Calibration Progress Bars
  const calibrationProgressHtml = `
    <section id="minimal-exhibit" class="wrap" style="padding:60px 0;" data-reveal="fade-up">
      <div class="wr-card-hover" style="border:1px solid #e5e7eb;background:#ffffff;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.02);">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:12px;">
          <div>
            <span style="font-size:0.75rem;letter-spacing:0.16em;text-transform:uppercase;color:#c59b27;font-weight:800;">CALIBRATION METRICS</span>
            <h2 style="font-size:1.8rem;font-weight:900;color:#111827;letter-spacing:-0.03em;margin:6px 0 0;">
              ${isZh ? '材料学阻尼与触觉物理精密测定' : 'Material Damping & Ergonomic Indices'}
            </h2>
          </div>
          <div style="font-size:0.8rem;color:#9ca3af;letter-spacing:0.06em;">
            LAB CALIBRATION TOLERANCE: ±0.05 MM
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;">
          <!-- Bar 1 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;font-weight:700;color:#111827;">
              <span>${isZh ? '慢回弹阻尼柔韧性' : 'Rebound Damping Index'}</span>
              <span style="color:#c59b27;font-weight:900;">98.5%</span>
            </div>
            <div style="background:#f3f4f6;height:6px;border-radius:2px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="98.5" style="background:#111827;height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1);"></div>
            </div>
            <div style="font-size:0.74rem;color:#9ca3af;margin-top:6px;">5-second smooth kinetic return without distortion</div>
          </div>

          <!-- Bar 2 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;font-weight:700;color:#111827;">
              <span>${isZh ? '分子抗疲劳拉伸极限' : 'Tensile Fatigue Limit'}</span>
              <span style="color:#c59b27;font-weight:900;">100%</span>
            </div>
            <div style="background:#f3f4f6;height:6px;border-radius:2px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="100" style="background:#c59b27;height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;"></div>
            </div>
            <div style="font-size:0.74rem;color:#9ca3af;margin-top:6px;">Withstands 50,000 continuous stress iterations</div>
          </div>

          <!-- Bar 3 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;font-weight:700;color:#111827;">
              <span>${isZh ? '掌心人体工学贴合度' : 'Ergonomic Palm Fit'}</span>
              <span style="color:#c59b27;font-weight:900;">99.2%</span>
            </div>
            <div style="background:#f3f4f6;height:6px;border-radius:2px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="99.2" style="background:#111827;height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;"></div>
            </div>
            <div style="font-size:0.74rem;color:#9ca3af;margin-top:6px;">Harmonious palm contact contour mapping</div>
          </div>

          <!-- Bar 4 -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;font-weight:700;color:#111827;">
              <span>${isZh ? '温感色阶渐变灵敏度' : 'Thermal Spectrum Shift'}</span>
              <span style="color:#c59b27;font-weight:900;">95.0%</span>
            </div>
            <div style="background:#f3f4f6;height:6px;border-radius:2px;overflow:hidden;">
              <div class="wr-progress-bar" data-progress="95" style="background:#c59b27;height:100%;width:0%;transition:width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.45s;"></div>
            </div>
            <div style="font-size:0.74rem;color:#9ca3af;margin-top:6px;">Instantaneous 32°C body temperature transition</div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 4. Exhibition Roster Grid
  const exhibitionGridHtml = `
    <section class="wrap" style="padding:40px 0 80px;" data-reveal="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:16px;">
        <div>
          <span style="font-size:0.78rem;letter-spacing:0.16em;text-transform:uppercase;color:#c59b27;font-weight:800;">EXHIBITION ROSTER</span>
          <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:#111827;margin:6px 0 0;letter-spacing:-0.03em;">
            ${isZh ? '八件典藏感官雕塑' : 'Eight Curated Tactile Works'}
          </h2>
        </div>
        <a class="text-link" style="color:#111827;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;font-size:0.85rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${isZh ? '阅览完整目录' : 'Complete Exhibition Index'} ↗
        </a>
      </div>

      <div class="wr-minimal-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:32px;">
        ${products.slice(0, 8).map((p, idx) => `
          <div class="wr-minimal-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.25s,box-shadow 0.25s;">
            <div style="background:#f9fafb;padding:32px 24px;text-align:center;position:relative;border-bottom:1px solid #f3f4f6;">
              <span style="position:absolute;top:14px;left:14px;font-size:0.74rem;letter-spacing:0.1em;font-weight:800;color:#9ca3af;">
                № 0${idx + 1}
              </span>
              <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:190px;width:auto;object-fit:contain;transition:transform 0.3s;" loading="lazy">
            </div>

            <div style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;flex-grow:1;">
              <div>
                <h3 style="font-size:1.1rem;font-weight:800;color:#111827;margin:0 0 10px;letter-spacing:-0.01em;">
                  <a style="color:#111827;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${esc(p.name)}
                  </a>
                </h3>
                <p style="font-size:0.86rem;color:#6b7280;line-height:1.6;margin:0 0 18px;">
                  ${esc(p.desc)}
                </p>
              </div>

              <div>
                <div style="font-size:0.75rem;letter-spacing:0.05em;color:#9ca3af;margin-bottom:14px;">
                  ${esc(p.dimensions)} // ${esc(p.material)}
                </div>
                <a class="button" style="display:block;text-align:center;background:#111827;color:#ffffff;font-weight:700;padding:12px;border-radius:2px;font-size:0.84rem;letter-spacing:0.04em;text-transform:uppercase;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${isZh ? '查阅规格与洽谈 ↗' : 'Inquire ↗'}
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  return `
    <main class="wr-inner wr-senseng-minimal-home" data-wr-page="home" style="background:#ffffff;color:#111827;min-height:100vh;">
      ${ribbonHtml}
      ${heroHtml}
      ${calibrationProgressHtml}
      ${exhibitionGridHtml}
    </main>
  `;
}

export function renderMinimalCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-minimal-inner" data-wr-page="catalog" style="padding-top:100px;background:#ffffff;color:#111827;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="margin-bottom:50px;">
          <span style="font-size:0.78rem;letter-spacing:0.18em;text-transform:uppercase;color:#c59b27;font-weight:800;">EXHIBITION INDEX // ALL OBJECTS</span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#111827;margin:8px 0 14px;letter-spacing:-0.03em;">
            ${isZh ? '全系感官雕塑画廊索引' : 'Complete Exhibition Archive'}
          </h1>
          <p style="color:#6b7280;font-size:1.05rem;max-width:680px;line-height:1.7;">
            ${isZh ? '检索全部 8 款经精密开模打磨的触觉解压艺术藏品。支持全球买手店定制、礼品盒包装与外贸直供。' : 'Browse the complete catalogue of precision-molded sensory works.'}
          </p>
        </div>

        <div class="wr-minimal-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:32px;">
          ${products.map((p, idx) => `
            <div class="wr-minimal-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;">
              <div style="background:#f9fafb;padding:32px 24px;text-align:center;position:relative;border-bottom:1px solid #f3f4f6;">
                <span style="position:absolute;top:14px;left:14px;font-size:0.74rem;letter-spacing:0.1em;font-weight:800;color:#9ca3af;">
                  № 0${(idx % 8) + 1}
                </span>
                <img src="${esc(p.img)}" alt="${esc(p.name)}" style="max-height:190px;width:auto;object-fit:contain;" loading="lazy">
              </div>

              <div style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;flex-grow:1;">
                <div>
                  <h2 style="font-size:1.1rem;font-weight:800;color:#111827;margin:0 0 10px;letter-spacing:-0.01em;">
                    <a style="color:#111827;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                      ${esc(p.name)}
                    </a>
                  </h2>
                  <p style="font-size:0.86rem;color:#6b7280;line-height:1.6;margin:0 0 18px;">
                    ${esc(p.desc)}
                  </p>
                </div>

                <div>
                  <div style="font-size:0.75rem;letter-spacing:0.05em;color:#9ca3af;margin-bottom:14px;">
                    ${esc(p.dimensions)} // ${esc(p.material)}
                  </div>
                  <a class="button" style="display:block;text-align:center;background:#111827;color:#ffffff;font-weight:700;padding:12px;border-radius:2px;font-size:0.84rem;letter-spacing:0.04em;text-transform:uppercase;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${isZh ? '查阅规格与洽谈 ↗' : 'Inquire ↗'}
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

export function renderMinimalDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const products = getCandyProducts(ctx);
  const p = products.find((item) => item.id === ctx.options.productId) || products[0] || {
    id: 'p1',
    name: 'Tactile Form № 01',
    desc: 'Precision-molded acoustic squeeze sculpture.',
    badge: '№ 01 Archival',
    material: 'Medical-Grade Tactile Polymer',
    dimensions: '8.5 × 6.5 cm',
    tagline: 'Quiet Architecture for Hands',
    category: 'gallery',
    img: '/templates/senseng/products-1.jpg',
  };
  const related = products.filter((item) => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <main class="wr-inner wr-senseng-minimal-inner" data-wr-page="detail" style="padding-top:100px;background:#ffffff;color:#111827;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 70px;">
        <div style="margin-bottom:28px;">
          <a class="text-link" style="color:#111827;font-weight:800;font-size:0.85rem;letter-spacing:0.06em;text-transform:uppercase;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ← ${isZh ? '返回全部画廊索引' : 'BACK TO INDEX'}
          </a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:60px;align-items:start;">
          <!-- Left: Big Artwork Specimen -->
          <div data-reveal="fade-up" class="wr-card-hover" style="background:#f9fafb;border:1px solid #e5e7eb;padding:48px;text-align:center;">
            <img id="wr-detail-main-img" src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;max-height:380px;object-fit:contain;filter:drop-shadow(0 16px 28px rgba(0,0,0,0.06));">
            <div style="margin-top:28px;display:flex;justify-content:center;gap:16px;font-size:0.75rem;letter-spacing:0.08em;color:#6b7280;text-transform:uppercase;">
              <span>EN71 & ASTM</span>
              <span>·</span>
              <span>100% NON-TOXIC</span>
              <span>·</span>
              <span>SWISS MODERNISM</span>
            </div>
          </div>

          <!-- Right: Anatomy & Form Inquiry -->
          <div data-reveal="fade-up">
            <div style="font-size:0.76rem;letter-spacing:0.2em;text-transform:uppercase;color:#c59b27;font-weight:800;margin-bottom:12px;">
              ${esc(p.badge)}
            </div>

            <h1 style="font-size:clamp(2rem, 3.5vw, 2.8rem);font-weight:900;color:#111827;letter-spacing:-0.03em;margin:0 0 18px;">
              ${esc(p.name)}
            </h1>

            <p style="font-size:1.05rem;line-height:1.75;color:#4b5563;margin:0 0 28px;">
              ${esc(p.desc)}
            </p>

            <div class="wr-card-hover" style="border:1px solid #e5e7eb;padding:24px;margin-bottom:32px;">
              <div style="font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;margin-bottom:14px;font-weight:800;">
                TECHNICAL ANATOMY //
              </div>
              <div style="display:grid;gap:10px;font-size:0.88rem;color:#4b5563;">
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding-bottom:6px;">
                  <span>DIMENSIONS</span>
                  <span style="font-weight:700;color:#111827;">${esc(p.dimensions)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding-bottom:6px;">
                  <span>COMPOSITION</span>
                  <span style="font-weight:700;color:#111827;">${esc(p.material)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding-bottom:6px;">
                  <span>CERTIFICATION</span>
                  <span style="font-weight:700;color:#111827;">EN71, ASTM F963, CE</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span>ACQUISITION</span>
                  <span style="font-weight:700;color:#c59b27;">BOUTIQUE WHOLESALE / OEM</span>
                </div>
              </div>
            </div>

            <!-- Swiss Precision Damping Progress Bars -->
            <div class="wr-card-hover" style="border:1px solid #e5e7eb;padding:24px;margin-bottom:32px;">
              <div style="font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;color:#c59b27;margin-bottom:14px;font-weight:800;">
                PRECISION DAMPING CALIBRATION //
              </div>
              <div style="display:flex;flex-direction:column;gap:14px;">
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.84rem;color:#111827;font-weight:700;margin-bottom:5px;">
                    <span>Slow Rebound Damping Precision</span>
                    <span style="color:#c59b27;font-weight:900;">99.2%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#f3f4f6;height:6px;border-radius:2px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="99.2" style="background:#111827;height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1);"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.84rem;color:#111827;font-weight:700;margin-bottom:5px;">
                    <span>Medical-Grade Tactile Polymer Purity</span>
                    <span style="color:#111827;font-weight:900;">100%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#f3f4f6;height:6px;border-radius:2px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="100" style="background:#c59b27;height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.84rem;color:#111827;font-weight:700;margin-bottom:5px;">
                    <span>Acoustic Squeeze Silence Quotient</span>
                    <span style="color:#6b7280;font-weight:900;">97.5%</span>
                  </div>
                  <div class="wr-progress-container" style="background:#f3f4f6;height:6px;border-radius:2px;overflow:hidden;">
                    <div class="wr-progress-bar" data-progress="97.5" style="background:#4b5563;height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s;"></div>
                  </div>
                </div>
              </div>
            </div>

            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <a class="button" style="flex:1;background:#111827;color:#ffffff;font-weight:700;padding:16px;border-radius:2px;text-align:center;letter-spacing:0.04em;text-transform:uppercase;" href="${path('contact/index.html')}?productId=${encodeURIComponent(p.id)}" ${navAttrs('contact')}>
                ${isZh ? '预约礼宾采购与打样 ↗' : 'Inquire for Acquisition ↗'}
              </a>
              ${waDigits ? `
                <a class="button" style="background:#25d366;color:#ffffff;font-weight:700;padding:16px 24px;border-radius:2px;" href="https://wa.me/${waDigits}" target="_blank" rel="noopener">
                  WhatsApp
                </a>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Related Exhibit Objects -->
        ${related.length > 0 ? `
          <div style="margin-top:70px;border-top:1px solid #e5e7eb;padding-top:40px;" data-reveal="fade-up">
            <div style="font-size:0.78rem;letter-spacing:0.16em;text-transform:uppercase;color:#c59b27;margin-bottom:20px;font-weight:800;">
              // PARALLEL OBJECT STUDIES
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
              ${related.map((r) => `
                <div class="wr-minimal-card wr-card-hover" data-reveal="fade-up" style="border:1px solid #e5e7eb;background:#ffffff;padding:24px;text-align:center;">
                  <img src="${esc(r.img)}" alt="${esc(r.name)}" style="max-height:160px;object-fit:contain;margin-bottom:14px;">
                  <div style="font-size:0.75rem;color:#9ca3af;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">${esc(r.badge)}</div>
                  <h4 style="font-size:0.95rem;font-weight:800;color:#111827;margin:0 0 12px;">${esc(r.name)}</h4>
                  <a class="button" style="background:#f9fafb;color:#111827;border:1px solid #e5e7eb;font-size:0.8rem;padding:8px 16px;border-radius:2px;display:inline-block;letter-spacing:0.04em;text-transform:uppercase;" href="${path(`products/${r.id}/index.html`)}" ${navAttrs('detail', r.id)}>
                    ${isZh ? '检视造形' : 'Inspect Form'} →
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

function renderLegacyMinimalAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;

  const hasCustomAbout = Boolean(
    company.aboutHighlights ||
    company.aboutStory ||
    company.aboutImageAssetId ||
    company.aboutHeadline
  );

  if (hasCustomAbout) {
    const defaultHeadline = isZh
      ? '极简美学与现代材料工坊哲学'
      : 'The Pursuit of Quiet Sensory Form';
    const headline = getAboutHeadline(company, defaultHeadline);

    const defaultStory = [
      isZh
        ? `${company.name} 致力于将日常感官解压公仔转化为极具雕塑感的美学器物。我们剔除多余的装饰，保留纯粹的线条与治愈的手感，服务于全球注重生活品质的当代空间。`
        : `${company.name} explores the balance between sculptural minimalism and tactile stress alleviation. We strip away ornamental clutter to focus on pure silhouette, velvety surface touch, and therapeutic weight.`,
      isZh
        ? '在我们的设计工坊中，每一道微弧度与分模线都经过以微米计的反复推敲。我们精选食品级与医疗级聚合物，融合无光泽哑光表面处理，呈现宛若鹅卵石般温润的触觉共鸣。'
        : 'In our minimalist atelier, every subtle curve and parting line is machined within 0.05mm tolerance. Matte-finished medical grade polymers harmonize with modern interiors, offering contemplative tactile respite.'
    ];
    const storyParagraphs = getAboutStoryParagraphs(company, defaultStory);

    const defaultHighlights = [
      { value: '0.05', suffix: 'mm', label: isZh ? '精密开模接缝公差' : 'Tooling Precision' },
      { value: '100', suffix: '%', label: isZh ? '食品级环保安全合规' : 'Food-Grade Safety' },
      { value: '18', suffix: '+', label: isZh ? '出口全球设计买手店' : 'Boutique Destinations' },
      { value: '99.8', suffix: '%', label: isZh ? '无气孔微发泡良率' : 'Zero-Pore Yield' },
    ];
    const highlights = parseAboutHighlights(company.aboutHighlights, defaultHighlights);

    const defaultMinimalImg = path('assets/hero-minimal.jpg');
    const defaultMinimalSecImg = path('assets/about-reference.jpg');

    const { primary: primaryImage, secondary: secondaryImage } = getAboutImages(ctx, defaultMinimalImg, defaultMinimalSecImg);

    return `
    <main class="wr-inner wr-senseng-minimal-inner" data-wr-page="about" style="padding-top:100px;background:#ffffff;color:#111827;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 60px;">
        <!-- Editorial Hero Split -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;margin-bottom:70px;">
          <div data-reveal="fade-up">
            <span style="font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;color:#c59b27;font-weight:800;display:block;margin-bottom:12px;">ATELIER MANIFESTO // № 01</span>
            <h1 style="font-size:clamp(2.4rem, 4.2vw, 3.5rem);font-weight:900;color:#111827;letter-spacing:-0.03em;line-height:1.15;margin:0 0 24px;">
              ${esc(headline)}
            </h1>
            <div style="color:#4b5563;font-size:1.1rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${storyParagraphs.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
            <div style="border-left:2px solid #c59b27;padding-left:18px;">
              <div style="font-weight:800;color:#111827;font-size:0.95rem;letter-spacing:-0.01em;">${isZh ? '“剔除繁杂，仅留纯粹触感。”' : '“Eliminating ornamental clutter to arrive at quiet sensory presence.”'}</div>
              <div style="color:#9ca3af;font-size:0.8rem;margin-top:4px;">${esc(company.name)} · ATELIER CURATOR</div>
            </div>
          </div>

          <div data-reveal="fade-up" class="wr-card-hover" style="position:relative;">
            <div style="border:1px solid #111827;padding:12px;background:#ffffff;box-shadow:0 12px 36px rgba(0,0,0,0.06);">
              <img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="width:100%;height:420px;object-fit:cover;display:block;" loading="lazy">
            </div>
            <div style="position:absolute;top:28px;right:28px;background:#111827;color:#ffffff;padding:6px 14px;font-size:0.75rem;letter-spacing:0.15em;font-weight:800;text-transform:uppercase;">
              ATELIER ARCHIVE
            </div>
          </div>
        </div>

        <!-- Dynamic Counter Metrics Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-bottom:70px;" data-reveal="fade-up">
          ${highlights.map((h) => `
            <div class="wr-minimal-card wr-card-hover" style="border:1px solid #e5e7eb;padding:32px;text-align:center;background:#ffffff;">
              <div style="font-size:2.6rem;font-weight:900;color:#111827;letter-spacing:-0.03em;line-height:1;margin-bottom:8px;">
                <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                  ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
                </span>
              </div>
              <div style="font-size:0.88rem;color:#6b7280;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;">
                ${esc(h.label)}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Secondary Workshop & Three Pillars -->
        <div style="border-top:1px solid #e5e7eb;padding-top:60px;margin-bottom:70px;" data-reveal="fade-up">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:48px;align-items:center;">
            ${secondaryImage ? `
              <div class="wr-card-hover" style="border:1px solid #e5e7eb;padding:8px;">
                <img src="${esc(secondaryImage)}" alt="${isZh ? '模具研发工坊' : 'Precision Tooling Atelier'}" style="width:100%;height:300px;object-fit:cover;display:block;" loading="lazy">
              </div>
            ` : ''}
            <div>
              <span style="font-size:0.75rem;letter-spacing:0.18em;color:#c59b27;font-weight:800;text-transform:uppercase;">02 // PHILOSOPHY & TOLERANCE</span>
              <h3 style="font-size:1.8rem;font-weight:900;color:#111827;letter-spacing:-0.02em;margin:8px 0 16px;">
                ${isZh ? '微米级公差与食品级安全准则' : 'Micron Precision & Universal Child Safety'}
              </h3>
              <p style="color:#6b7280;font-size:0.95rem;line-height:1.75;margin:0 0 20px;">
                ${isZh
                  ? '我们坚信解压器物不仅关乎视觉，更取决于合模线处的微触觉平滑度。经过独立实验室跌落抗冲击、物理拉伸与唾液可溶性化学测试，无毒无味，通过欧盟 EN71 与美标 ASTM F963 权威认证。'
                  : 'We maintain that tactile objects are judged by the seamless smoothness of the parting line. Each batch is verified by independent safety laboratories for tensile endurance and chemical neutrality.'}
              </p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <span style="border:1px solid #111827;padding:5px 12px;font-size:0.75rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">EN71 CERTIFIED</span>
                <span style="border:1px solid #111827;padding:5px 12px;font-size:0.75rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">ASTM F963</span>
                <span style="border:1px solid #111827;padding:5px 12px;font-size:0.75rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">REACH COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Minimalist Concierge CTA -->
        <div data-reveal="fade-up" style="background:#111827;color:#ffffff;padding:50px 32px;text-align:center;border-radius:2px;">
          <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;letter-spacing:-0.02em;margin:0 0 12px;color:#ffffff;">
            ${isZh ? '独立设计买手与大宗定制洽谈' : 'Acquisitions & Boutique Partnership'}
          </h2>
          <p style="color:#9ca3af;font-size:1rem;max-width:580px;margin:0 auto 24px;line-height:1.6;">
            ${isZh ? '我们为全球高品质生活方式买手店、艺术空间与独立品牌提供快速打样与专属柔性直供。' : 'Connect with our curatorial liaison for bespoke wholesale terms and expedited samples.'}
          </p>
          <a class="button" style="background:#c59b27;color:#111827;font-weight:900;padding:14px 32px;font-size:0.92rem;letter-spacing:0.06em;text-transform:uppercase;display:inline-block;text-decoration:none;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '开启合作洽谈 ↗' : 'Inquire & Sample ↗'}
          </a>
        </div>
      </section>
    </main>
  `;
  }

  return `
    <main class="wr-inner wr-senseng-minimal-inner" data-wr-page="about" style="padding-top:100px;background:#ffffff;color:#111827;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="max-width:760px;margin-bottom:60px;">
          <span style="font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;color:#c59b27;font-weight:800;">ATELIER MANIFESTO</span>
          <h1 style="font-size:clamp(2.4rem, 4.2vw, 3.4rem);font-weight:900;color:#111827;letter-spacing:-0.03em;margin:8px 0 20px;">
            ${isZh ? '极简美学与现代材料工坊哲学' : 'The Pursuit of Quiet Sensory Form'}
          </h1>
          <p style="color:#4b5563;font-size:1.12rem;line-height:1.8;">
            ${isZh
              ? `${esc(company.name)} 致力于将日常感官解压公仔转化为极具雕塑感的美学器物。我们剔除多余的装饰，保留纯粹的线条与治愈的手感，服务于全球注重生活品质的当代空间。`
              : `${esc(company.name)} explores the balance between sculptural minimalism and tactile stress alleviation.`}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;margin-bottom:70px;">
          <div data-reveal="fade-up" class="wr-minimal-card wr-card-hover" style="border:1px solid #e5e7eb;padding:36px;">
            <div style="font-size:0.8rem;letter-spacing:0.12em;color:#c59b27;font-weight:800;margin-bottom:12px;">01 // REDUCTION</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#111827;margin:0 0 10px;">${isZh ? '极致减法与留白' : 'Disciplined Reduction'}</h3>
            <p style="font-size:0.9rem;color:#6b7280;line-height:1.7;margin:0;">
              ${isZh ? '让每一个玩具都具备雕塑般的气质，安静陈列于现代办公桌与设计空间。' : 'Eliminating ornamental clutter to focus on pure silhouette and tactile presence.'}
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-minimal-card wr-card-hover" style="border:1px solid #e5e7eb;padding:36px;">
            <div style="font-size:0.8rem;letter-spacing:0.12em;color:#c59b27;font-weight:800;margin-bottom:12px;">02 // TOLERANCE</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#111827;margin:0 0 10px;">${isZh ? '0.05mm 开模精密公差' : '0.05mm Precision'}</h3>
            <p style="font-size:0.9rem;color:#6b7280;line-height:1.7;margin:0;">
              ${isZh ? '微米级钢模精雕与无缝合模技术，提供宛如鹅卵石般的温润接缝触感。' : 'High-precision tooling yielding invisible parting lines and seamless ergonomics.'}
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-minimal-card wr-card-hover" style="border:1px solid #e5e7eb;padding:36px;">
            <div style="font-size:0.8rem;letter-spacing:0.12em;color:#c59b27;font-weight:800;margin-bottom:12px;">03 // INTEGRITY</div>
            <h3 style="font-size:1.2rem;font-weight:900;color:#111827;margin:0 0 10px;">${isZh ? '严苛食品级安全准则' : 'Uncompromising Safety'}</h3>
            <p style="font-size:0.9rem;color:#6b7280;line-height:1.7;margin:0;">
              ${isZh ? '通过欧盟 EN71 与美标 ASTM F963 权威检测，确保触觉治愈与安全无虞。' : 'Strictly adhering to European EN71 and US ASTM safety testing frameworks.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  `;
}


function renderModernMinimalAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;

  const defaultHeadline = isZh
    ? '极简美学与现代材料工坊哲学'
    : 'The Pursuit of Quiet Sensory Form';
  const headline = getAboutHeadline(company, defaultHeadline);

  const defaultStory = [
    isZh
      ? `${company.name} 致力于将日常感官解压公仔转化为极具雕塑感的美学器物。我们剔除多余的装饰，保留纯粹的线条与治愈的手感，服务于全球注重生活品质的当代空间。`
      : `${company.name} explores the balance between sculptural minimalism and tactile stress alleviation. We strip away ornamental clutter to focus on pure silhouette, velvety surface touch, and therapeutic weight.`,
    isZh
      ? '在我们的设计工坊中，每一道微弧度与分模线都经过以微米计的反复推敲。我们精选食品级与医疗级聚合物，融合无光泽哑光表面处理，呈现宛若鹅卵石般温润的触觉共鸣。'
      : 'In our minimalist atelier, every subtle curve and parting line is machined within 0.05mm tolerance. Matte-finished medical grade polymers harmonize with modern interiors, offering contemplative tactile respite.',
    isZh
      ? '我们常年与欧美顶级设计买手店、艺术空间及极简生活品牌保持深度供应链合作，遵循 EN71 与 ASTM 严苛实验室标准，实现工业精度与当代艺术温度的完美统一。'
      : 'Collaborating closely with leading design concept stores, contemporary art spaces, and minimalist brands worldwide, our creations uphold full EN71 and ASTM safety compliance, uniting industrial precision with artful soul.'
  ];
  const storyParagraphs = getAboutStoryParagraphs(company, defaultStory);

  const defaultHighlights = [
    { value: '0.05', suffix: 'mm', label: isZh ? '精密开模接缝公差' : 'Tooling Precision' },
    { value: '100', suffix: '%', label: isZh ? '食品级环保安全合规' : 'Food-Grade Safety' },
    { value: '18', suffix: '+', label: isZh ? '出口全球设计买手店' : 'Boutique Destinations' },
    { value: '99.8', suffix: '%', label: isZh ? '无气孔微发泡良率' : 'Zero-Pore Yield' },
  ];
  const highlights = parseAboutHighlights(company.aboutHighlights, defaultHighlights);

  const defaultMinimalImg = path('assets/hero-minimal.jpg');
  const defaultMinimalSecImg = path('assets/about-reference.jpg');
  const { primary: primaryImage, secondary: secondaryImage } = getAboutImages(ctx, defaultMinimalImg, defaultMinimalSecImg);

  return `
    <main class="wr-inner wr-senseng-minimal-inner" data-wr-page="about" style="padding-top:100px;background:#ffffff;color:#111827;min-height:100vh;">
      <!-- 1. FULL-WIDTH TEXT-ONLY MONOLITHIC ARCHITECTURAL MANIFESTO (NO HERO IMAGE BOX) -->
      <section style="padding:48px 24px 60px;max-width:1200px;margin:0 auto;">
        <div data-reveal="fade-up">
          <div style="font-size:0.75rem;letter-spacing:0.25em;text-transform:uppercase;color:#c59b27;font-weight:800;margin-bottom:18px;">
            // № 01 ESSENCE // ${esc(company.name.toUpperCase())}${company.establishedYear ? ` · EST. ${esc(company.establishedYear)}` : ''}
          </div>

          <h1 style="font-size:clamp(2.6rem, 5.5vw, 4.4rem);font-weight:900;color:#111827;letter-spacing:-0.03em;line-height:1.1;margin:0 0 36px;">
            ${esc(headline)}
          </h1>

          <!-- Swiss 2-Column Text Grid with Delicate Hairline Rule -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;border-top:1px solid #e5e7eb;padding-top:36px;margin-bottom:40px;">
            <div style="color:#4b5563;font-size:1.12rem;line-height:1.85;">
              <p style="margin:0 0 16px;">${esc(storyParagraphs[0] || '')}</p>
              <p style="margin:0;">${esc(storyParagraphs[1] || '')}</p>
            </div>

            <div style="display:flex;flex-direction:column;justify-content:space-between;">
              <div style="border-left:3px solid #c59b27;padding-left:20px;margin-bottom:24px;">
                <div style="font-weight:800;color:#111827;font-size:1.05rem;letter-spacing:-0.01em;line-height:1.5;">
                  ${isZh ? '“剔除一切多余矫饰，探寻形式、材质与重力之间的极致张力。”' : '“Eliminating ornamental clutter to arrive at quiet sensory presence and pure form.”'}
                </div>
                <div style="color:#9ca3af;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;margin-top:8px;">
                  ${esc(company.name)} · CURATORIAL LIAISON
                </div>
              </div>

              <div>
                <a class="button" style="background:#111827;color:#ffffff;font-weight:800;padding:15px 36px;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:2px;display:inline-block;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
                  ${isZh ? '开启买手采购洽谈 ↗' : 'Inquire & Sample ↗'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. THE EXHIBITION PLINTH SHOWCASE (CENTERED SCULPTURE DISPLAY WITH NEVER-BLANK VECTOR SILHOUETTE) -->
      <section style="padding:0 24px 80px;max-width:1200px;margin:0 auto;" data-reveal="fade-up">
        <div style="border:1px solid #e5e7eb;background:#fafafa;padding:60px 40px;position:relative;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;">
            <!-- Museum Plinth Display Area (GUARANTEED NEVER BLANK) -->
            <div class="wr-card-hover" style="position:relative;background:#ffffff;border:1px solid #e5e7eb;padding:24px;box-shadow:0 20px 45px rgba(0,0,0,0.06);min-height:360px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
              <!-- Architectural Monochrome Vector Art -->
              <svg width="280" height="260" viewBox="0 0 280 260" xmlns="http://www.w3.org/2000/svg" style="opacity:0.25;">
                <ellipse cx="140" cy="180" rx="90" ry="24" fill="#111827" opacity="0.3"/>
                <path d="M 70 160 C 70 80, 210 80, 210 160 C 210 190, 70 190, 70 160 Z" fill="#111827"/>
                <line x1="140" y1="30" x2="140" y2="210" stroke="#c59b27" stroke-width="1.5" stroke-dasharray="3 3"/>
              </svg>

              ${primaryImage ? `<img src="${esc(primaryImage)}" alt="${esc(company.name)}" style="position:absolute;inset:24px;width:calc(100% - 48px);height:calc(100% - 48px);object-fit:cover;z-index:1;" onerror="this.style.display=\'none\'">` : ''}

              <div style="position:absolute;bottom:16px;right:16px;background:#111827;color:#ffffff;padding:5px 12px;font-size:0.7rem;letter-spacing:0.15em;font-weight:800;z-index:2;">
                EXHIBIT № 402
              </div>
            </div>

            <!-- Museum Placard & Technical Anatomy -->
            <div style="display:flex;flex-direction:column;gap:20px;">
              <span style="font-size:0.75rem;letter-spacing:0.2em;color:#c59b27;font-weight:800;text-transform:uppercase;">
                GALLERY PLACARD // 0.05MM PARTING LINE
              </span>
              <h3 style="font-size:2rem;font-weight:900;color:#111827;margin:0;letter-spacing:-0.02em;line-height:1.2;">
                ${isZh ? '减法之美：如鹅卵石般的微触觉雕塑' : 'Monolithic Form // The 0.05mm Micro-Seam Atelier'}
              </h3>
              <p style="color:#6b7280;font-size:1rem;line-height:1.75;margin:0;">
                ${isZh ? '在微观视角下，解压玩具不再是儿童专属，而是具备纯粹几何张力的沉思器物。采用医疗级二次硫化铂金硅胶，表面呈现哑光亲肤微摩擦力。' : 'Sculptural haptic objects cast in platinum-cured medical silicone, delivering soothing sensory presence to contemporary workspaces.'}
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:16px;display:flex;gap:20px;font-size:0.8rem;color:#111827;font-weight:700;">
                <span>// EN71-3 VERIFIED</span>
                <span>// ASTM F963 PASSED</span>
                <span>// 100% PHTHALATE FREE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. THE 4 PRINCIPLES OF TACTILE MINIMALISM (DIETER RAMS STYLE ROWS) -->
      <section style="padding:0 24px 80px;max-width:1200px;margin:0 auto;" data-reveal="fade-up">
        <div style="margin-bottom:32px;">
          <span style="font-size:0.75rem;letter-spacing:0.2em;color:#c59b27;font-weight:800;text-transform:uppercase;">
            CANONICAL PRINCIPLES // 极简信条
          </span>
          <h2 style="font-size:2.2rem;font-weight:900;color:#111827;letter-spacing:-0.02em;margin:6px 0 0;">
            ${isZh ? '极简触觉四大设计原则' : 'The Four Principles of Sensory Reduction'}
          </h2>
        </div>

        <div style="display:flex;flex-direction:column;border-bottom:1px solid #e5e7eb;">
          <div style="border-top:1px solid #e5e7eb;padding:24px 0;display:grid;grid-template-columns:80px 1.2fr 2fr;gap:20px;align-items:baseline;">
            <span style="font-weight:900;color:#c59b27;font-size:1.1rem;">01</span>
            <strong style="color:#111827;font-size:1.1rem;">${isZh ? '极简克制' : 'Disciplined Reduction'}</strong>
            <span style="color:#6b7280;font-size:0.95rem;line-height:1.6;">${isZh ? '剔除多余装饰与浮夸色彩，保留纯粹几何轮廓与温和重力感。' : 'Eliminates non-essential ornamentation to let form and tactile resistance speak.'}</span>
          </div>

          <div style="border-top:1px solid #e5e7eb;padding:24px 0;display:grid;grid-template-columns:80px 1.2fr 2fr;gap:20px;align-items:baseline;">
            <span style="font-weight:900;color:#c59b27;font-size:1.1rem;">02</span>
            <strong style="color:#111827;font-size:1.1rem;">${isZh ? '微米级公差' : '0.05mm Precision Tooling'}</strong>
            <span style="color:#6b7280;font-size:0.95rem;line-height:1.6;">${isZh ? '镜面钢模微米精雕，分模接缝丝滑顺畅，无任何刺手瑕疵。' : 'Optical-grade mold finishing eliminates micro-burrs for pebble-like continuity.'}</span>
          </div>

          <div style="border-top:1px solid #e5e7eb;padding:24px 0;display:grid;grid-template-columns:80px 1.2fr 2fr;gap:20px;align-items:baseline;">
            <span style="font-weight:900;color:#c59b27;font-size:1.1rem;">03</span>
            <strong style="color:#111827;font-size:1.1rem;">${isZh ? '铂金硫化硅胶' : 'Platinum-Cured Biocompatibility'}</strong>
            <span style="color:#6b7280;font-size:0.95rem;line-height:1.6;">${isZh ? '高温二次脱气硫化，彻底脱除微量挥发物，纯净无味，亲肤安全。' : 'Zero volatile solvent release, ensuring odorless, hypoallergenic warmth.'}</span>
          </div>

          <div style="border-top:1px solid #e5e7eb;padding:24px 0;display:grid;grid-template-columns:80px 1.2fr 2fr;gap:20px;align-items:baseline;">
            <span style="font-weight:900;color:#c59b27;font-size:1.1rem;">04</span>
            <strong style="color:#111827;font-size:1.1rem;">${isZh ? '历久弥新' : 'Generational Timelessness'}</strong>
            <span style="color:#6b7280;font-size:0.95rem;line-height:1.6;">${isZh ? '高抗撕拉抗老化分子架构，即使经年累月抚触依然如初。' : 'Designed to endure tens of thousands of compressions without structural decay.'}</span>
          </div>
        </div>
      </section>

      <!-- 4. ARCHITECTURAL HAIRLINE TABLE METRICS -->
      <section style="padding:0 24px 80px;max-width:1200px;margin:0 auto;" data-reveal="fade-up">
        <div style="border:1px solid #e5e7eb;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
          ${highlights.map((h, i) => `
            <div style="padding:36px 24px;text-align:center;${i > 0 ? 'border-left:1px solid #e5e7eb;' : ''}">
              <div style="font-size:2.8rem;font-weight:900;color:#111827;letter-spacing:-0.03em;line-height:1;margin-bottom:8px;">
                <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                  ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
                </span>
              </div>
              <div style="font-size:0.8rem;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;font-weight:800;">
                ${esc(h.label)}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

export function renderMinimalAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyMinimalAbout(ctx);
  }
  return renderModernMinimalAbout(ctx);
}

export function renderMinimalContact(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';
  const company = draft.company;
  const products = getCandyProducts(ctx);

  return `
    <main class="wr-inner wr-senseng-minimal-inner" data-wr-page="contact" style="padding-top:100px;background:#ffffff;color:#111827;min-height:100vh;">
      <section class="wrap" style="padding:40px 0 80px;">
        <div data-reveal="fade-up" style="max-width:680px;margin-bottom:48px;">
          <span style="font-size:0.78rem;letter-spacing:0.18em;text-transform:uppercase;color:#c59b27;font-weight:800;">CONCIERGE & PARTNERSHIP</span>
          <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem);font-weight:900;color:#111827;letter-spacing:-0.03em;margin:8px 0 14px;">
            ${isZh ? '全球买手店与大宗定制洽谈' : 'Acquisitions & Boutique Partnership'}
          </h1>
          <p style="color:#6b7280;font-size:1.05rem;line-height:1.7;">
            ${isZh ? '我们为全球高品质生活方式买手店、艺术礼品机构与独立品牌提供柔性定制与大批量直供服务。' : 'Connect with our curatorial and export liaison for bespoke procurement and wholesale terms.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:start;">
          <!-- Minimal Form -->
          <div data-reveal="fade-up" class="wr-card-hover" style="border:1px solid #e5e7eb;padding:36px;">
            <form id="inquiry" action="${esc(ctx.options.inquiryUrl)}" method="post" style="display:grid;gap:20px;">
              <div>
                <label for="name" style="display:block;font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#111827;margin-bottom:6px;">${isZh ? '姓名 / 公司' : 'Name / Organization'}</label>
                <input id="name" name="name" required style="width:100%;padding:14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:2px;color:#111827;font-size:0.95rem;box-sizing:border-box;">
              </div>

              <div>
                <label for="email" style="display:block;font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#111827;margin-bottom:6px;">${isZh ? '联系邮箱' : 'Direct Email'}</label>
                <input id="email" name="email" type="email" required style="width:100%;padding:14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:2px;color:#111827;font-size:0.95rem;box-sizing:border-box;">
              </div>

              <div>
                <label for="productId" style="display:block;font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#111827;margin-bottom:6px;">${isZh ? '意向藏品编号' : 'Object Selection'}</label>
                <select id="productId" name="productId" style="width:100%;padding:14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:2px;color:#111827;font-size:0.95rem;box-sizing:border-box;">
                  <option value="">${isZh ? '全套展品套系 / 综合礼宾洽谈' : 'Full Archival Suite / General Inquiry'}</option>
                  ${products.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label for="message" style="display:block;font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#111827;margin-bottom:6px;">${isZh ? '合作意向细节' : 'Collaboration Message'}</label>
                <textarea id="message" name="message" rows="4" required style="width:100%;padding:14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:2px;color:#111827;font-size:0.95rem;box-sizing:border-box;resize:vertical;"></textarea>
              </div>

              <button type="submit" class="button" style="background:#111827;color:#ffffff;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;font-size:0.95rem;padding:16px;border-radius:2px;border:none;cursor:pointer;">
                ${isZh ? '提交采购礼宾预约 ↗' : 'Submit Acquisition Inquiry ↗'}
              </button>
              <div role="status" style="font-size:0.85rem;color:#111827;text-align:center;"></div>
            </form>
          </div>

          <!-- Right Details -->
          <div data-reveal="fade-up" style="display:grid;gap:24px;">
            <div class="wr-minimal-card wr-card-hover" style="border:1px solid #e5e7eb;padding:30px;">
              <div style="font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:#c59b27;font-weight:800;margin-bottom:8px;">LIAISON</div>
              <h3 style="font-size:1.15rem;font-weight:900;color:#111827;margin:0 0 14px;">${esc(company.name)}</h3>
              <p style="color:#6b7280;font-size:0.9rem;margin:0 0 8px;"><strong>Email:</strong> <a style="color:#111827;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
              ${company.contactName ? `<p style="color:#6b7280;font-size:0.9rem;margin:0 0 8px;"><strong>Liaison:</strong> ${esc(company.contactName)}</p>` : ''}
              ${company.phone ? `<p style="color:#6b7280;font-size:0.9rem;margin:0 0 8px;"><strong>Phone:</strong> ${esc(company.phone)}</p>` : ''}
            </div>

            <div class="wr-minimal-card wr-card-hover" style="border:1px solid #e5e7eb;padding:30px;">
              <h4 style="font-size:0.95rem;font-weight:800;color:#111827;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 10px;">${isZh ? '私模定制说明' : 'Bespoke Tooling Protocols'}</h4>
              <p style="color:#6b7280;font-size:0.88rem;line-height:1.7;margin:0;">
                ${isZh ? '支持专属 3D 造型打样，提供高精度 CNC 铝模与钢模雕刻，专属哑光烫金卡盒。' : 'Rapid prototyping with precision CNC aluminum and steel tooling for custom designer editions.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderMinimalPage(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';

  let inner = '';
  switch (ctx.options.page) {
    case 'catalog':
      inner = renderMinimalCatalog(ctx);
      break;
    case 'detail':
      inner = renderMinimalDetail(ctx);
      break;
    case 'about':
      inner = renderMinimalAbout(ctx);
      break;
    case 'contact':
      inner = renderMinimalContact(ctx);
      break;
    case 'home':
    default:
      inner = renderMinimalHome(ctx);
      break;
  }

  const headerHtml = `
    <header class="wr-minimal-header" style="position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);border-bottom:1px solid #e5e7eb;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;padding:18px 0;">
        <a href="${path('index.html')}" ${navAttrs('home')} style="text-decoration:none;display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.25rem;font-weight:900;color:#111827;letter-spacing:-0.03em;">
            ${esc(company.name || 'SENSENG')}
          </span>
          <span style="font-size:0.75rem;letter-spacing:0.12em;color:#c59b27;font-weight:800;text-transform:uppercase;">
            STUDIO
          </span>
        </a>

        <nav aria-label="${esc(ui.menu)}" style="display:flex;gap:32px;align-items:center;font-size:0.88rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
          <a class="nav-link" href="${path('index.html')}" ${navAttrs('home')} style="color:#111827;text-decoration:none;">${esc(ui.home)}</a>
          <a class="nav-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#111827;text-decoration:none;">${esc(ui.catalog)}</a>
          <a class="nav-link" href="${path('about/index.html')}" ${navAttrs('about')} style="color:#111827;text-decoration:none;">${esc(ui.about)}</a>
          <a class="nav-link" href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#111827;text-decoration:none;">${esc(ui.contact)}</a>
        </nav>

        <div>
          <a class="button" style="background:#111827;color:#ffffff;font-weight:700;font-size:0.8rem;letter-spacing:0.06em;text-transform:uppercase;padding:10px 20px;border-radius:2px;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${isZh ? '礼宾洽谈' : 'Liaison'}
          </a>
        </div>
      </div>
    </header>
  `;

  const footerHtml = `
    <footer style="background:#111827;color:#9ca3af;padding:60px 0 30px;font-size:0.88rem;border-top:1px solid #1f2937;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;margin-bottom:44px;">
        <div>
          <div style="font-size:1.3rem;font-weight:900;color:#ffffff;letter-spacing:-0.02em;margin-bottom:12px;">${esc(company.name)}</div>
          <p style="font-size:0.85rem;line-height:1.7;color:#9ca3af;margin:0 0 16px;">
            A Swiss modernist study in tactile objects and calming sensory design. Certified child-safe materials for contemplative modern living.
          </p>
          <div style="font-size:0.75rem;letter-spacing:0.1em;color:#c59b27;">EN71 · ASTM F963 · CE ARCHIVAL STANDARDS</div>
        </div>

        <div>
          <h4 style="font-size:0.85rem;letter-spacing:0.12em;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">Exhibition</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.84rem;">
            <li><a style="text-decoration:none;color:#9ca3af;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>№ 01 Tactile Shiba</a></li>
            <li><a style="text-decoration:none;color:#9ca3af;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>№ 02 Playmate Pouch</a></li>
            <li><a style="text-decoration:none;color:#9ca3af;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>№ 03 Silent Desk Penguin</a></li>
            <li><a style="text-decoration:none;color:#9ca3af;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>№ 04 Thermal Narwhal</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.85rem;letter-spacing:0.12em;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">Discipline</h4>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:0.84rem;">
            <li>✓ 36 Precision Quality Gates</li>
            <li>✓ 0.05mm Micro-Molding Fit</li>
            <li>✓ Medical-Grade Food-Safe TPR</li>
            <li>✓ High-Volume Cleanroom Facility</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.85rem;letter-spacing:0.12em;font-weight:800;color:#ffffff;margin:0 0 14px;text-transform:uppercase;">Contact</h4>
          <p style="font-size:0.84rem;margin:0 0 8px;">Email: <a style="color:#ffffff;" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
          ${company.phone ? `<p style="font-size:0.84rem;margin:0;">Tel: ${esc(company.phone)}</p>` : ''}
        </div>
      </div>

      <div class="wrap" style="border-top:1px solid #1f2937;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.78rem;color:#6b7280;letter-spacing:0.04em;">
        <div>© 2026 ${esc(company.name)}. SWISS ATELIER EDITION.</div>
        <div>MODERNIST SENSORY DESIGN // ARCHIVE 2026</div>
      </div>
    </footer>
  `;

  return `${headerHtml}${inner}${footerHtml}`;
}
