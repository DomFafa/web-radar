import { esc, safeUrl, type ThemeContext } from './types';

export function renderMarketingHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Data-Driven Digital Marketing & Global Growth Agency',
    subtitle: 'We craft high-converting multi-channel acquisition funnels, creative campaigns, and precision programmatic ad strategies that supercharge your revenue.',
    about: 'Our agency combines predictive consumer analytics, viral creative production, and international SEO to deliver exponential customer lifetime value.',
    cta: 'Claim Free Growth Audit',
  };

  // 1. Hero Section
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:linear-gradient(135deg,#3b0764 0%,#701a75 50%,#831843 100%);color:#ffffff;padding:95px 0 85px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-80px;left:10%;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(217,70,239,0.3) 0%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div style="position:absolute;bottom:-60px;right:10%;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(236,72,153,0.25) 0%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      
      <div class="wrap hero-content" style="position:relative;z-index:2;text-align:center;align-items:center;margin:0 auto;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);padding:7px 20px;border-radius:9999px;margin-bottom:24px;">
          <span style="font-size:1rem;">🚀</span>
          <span style="font-size:0.84rem;font-weight:700;color:#fdf4ff;letter-spacing:0.08em;text-transform:uppercase;">FULL-FUNNEL DIGITAL ACCELERATION</span>
        </div>
        <h1 class="hero-title" style="font-size:clamp(2.8rem, 5.8vw, 5rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;max-width:920px;margin:0 auto 24px;text-align:center;">
          ${esc(copy.headline)}
        </h1>
        <p style="max-width:700px;font-size:1.22rem;line-height:1.65;color:#f5d0fe;margin:0 auto 36px;text-align:center;">
          ${esc(copy.subtitle)}
        </p>
        <div style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap;">
          <a class="button" style="background:linear-gradient(90deg,#d946ef 0%,#ec4899 100%);color:#ffffff;font-weight:800;border-radius:9999px;padding:16px 36px;box-shadow:0 12px 28px rgba(217,70,239,0.45);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Claim Free Growth Audit')} ↗
          </a>
          <a class="button" style="background:rgba(255,255,255,0.14);backdrop-filter:blur(10px);color:#ffffff;border:1px solid rgba(255,255,255,0.3);border-radius:9999px;padding:16px 32px;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Client Case Studies →
          </a>
        </div>

        <div style="margin-top:48px;display:flex;gap:32px;justify-content:center;flex-wrap:wrap;color:rgba(255,255,255,0.85);font-size:0.88rem;font-weight:600;">
          <div style="display:flex;align-items:center;gap:8px;"><span>⭐</span> Google Premier Partner 2026</div>
          <div style="display:flex;align-items:center;gap:8px;"><span>🔥</span> Meta Certified Media Agency</div>
          <div style="display:flex;align-items:center;gap:8px;"><span>⚡</span> TikTok Official Marketing Partner</div>
        </div>
        <a href="#stats" class="wr-scroll-down" aria-label="Scroll to content">↓</a>
      </div>
    </section>
  `;

  // 2. Performance Funnel & ROI Stats
  const statsHtml = `
    <section id="stats" class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #d946ef;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(217,70,239,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#d946ef;letter-spacing:-1px;" data-counter="380" data-suffix="%">+380%</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Organic Traffic Lift</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Across enterprise brands with structured entity SEO & topical authority content.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #ec4899;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(236,72,153,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#ec4899;letter-spacing:-1px;" data-counter="4.2" data-suffix="x">4.2x</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Blended ROAS Multiplier</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Validated through algorithmic bid optimization and high-intent audience lookalikes.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #8b5cf6;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(139,92,246,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#8b5cf6;letter-spacing:-1px;" data-counter="120" data-suffix="M+">$120M+</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Managed Client Ad Spend</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Scaling performance marketing across 38 competitive global consumer verticals.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #06b6d4;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(6,182,212,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;" data-counter="45" data-suffix="%">-45%</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Cost Per Acquisition</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Via hyper-converting landing page variants and rapid creative testing matrices.</div>
        </div>
      </div>
    </section>
  `;

  // 3. Growth Packages & Services (Products)
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" data-reveal="fade-up" style="margin-bottom:36px;">
        <div>
          <span class="eyebrow" style="color:#d946ef;font-weight:700;">OUR GROWTH SUITE</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#18181b;">Full-Funnel Creative & Acquisition Capabilities</h2>
        </div>
        <a class="text-link" style="color:#d946ef;font-weight:700;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = ctx.productMainImage(p);
          const icons = ['🎯', '✨', '⚡', '📊', '📈', '🚀'];
          const tags = ['Paid Media', 'SEO Growth', 'Creative Ads', 'Lifecycle', 'CRO Engine', 'Data Analytics'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#faf5ff;border:1px solid #f3e8ff;border-radius:18px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .3s;">
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                  <span style="font-size:1.8rem;">${icons[idx % icons.length]}</span>
                  <span style="font-size:0.75rem;font-weight:800;color:#c026d3;background:#fdf4ff;border:1px solid #f5d0fe;padding:4px 12px;border-radius:9999px;">${tags[idx % tags.length]}</span>
                </div>
                ${imgUrl ? `<div class="product-image" style="border-radius:12px;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="color:#18181b;margin:0 0 10px;font-size:1.3rem;font-weight:800;">${esc(t.name)}</h3>
                <p style="color:#71717a;line-height:1.6;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Omnichannel digital marketing package with real-time KPI reporting.')}</p>
              </div>
              <div style="border-top:1px solid #f3e8ff;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#d946ef;font-weight:800;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  Inspect Growth Framework →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 4. Full Funnel Architecture Section
  const funnelHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #f3e8ff;" data-reveal="fade-up">
      <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">PROVEN METHODOLOGY</span>
        <h2 style="font-size:2.4rem;color:#18181b;margin:10px 0;">The 4-Stage Revenue Flywheel Engine</h2>
        <p style="color:#71717a;font-size:1.05rem;">We build self-reinforcing acquisition systems that turn cold traffic into dedicated brand advocates.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#d946ef;margin-bottom:8px;">STAGE 01</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">Algorithmic Discovery</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">High-velocity creative testing across Meta, TikTok, and YouTube Shorts to identify winning consumer hooks.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#ec4899;margin-bottom:8px;">STAGE 02</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">Conversion Architecture</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">Ultra-fast headless landing pages tuned for sub-second load speeds and maximum frictionless checkout rate.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#8b5cf6;margin-bottom:8px;">STAGE 03</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">Audience Retargeting</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">Dynamic product ads and behavioral segmentation keeping your brand top-of-mind across the entire buying journey.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#06b6d4;margin-bottom:8px;">STAGE 04</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">LTV & Retention Loops</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">Automated email/SMS lifecycle flows that drive repeat purchase velocity and maximize total customer lifetime value.</p>
        </div>
      </div>
    </section>
  `;

  // 5. Tech Stack & Channel Integrations
  const channelsHtml = `
    <section class="wrap" style="padding:50px 0 35px;border-top:1px solid #f3e8ff;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:32px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">CHANNELS & AD STACK</span>
        <h2 style="font-size:1.9rem;color:#18181b;margin:8px 0;">Certified Marketing & Analytics Integrations</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
        ${['Google Ads 360', 'Meta Ads Manager', 'TikTok Business', 'LinkedIn Marketing', 'Klaviyo Email', 'Shopify Plus', 'Google Analytics 4', 'AppsFlyer'].map(name => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:10px;padding:16px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="font-size:1.4rem;margin-bottom:6px;">📈</div>
            <div style="font-size:0.84rem;font-weight:700;color:#3f3f46;">${name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 6. Testimonials & Case Studies
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">WHAT CLIENTS SAY</span>
        <h2 style="font-size:2rem;color:#18181b;margin:8px 0;">Exceptional Growth Validated by Brand Founders</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 6px 18px rgba(0,0,0,0.03);">
          <div style="color:#eab308;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#3f3f46;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Within 90 days, our monthly revenue scaled from $80k to $420k while keeping ROAS above 3.8x. Simply phenomenal creative execution."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#d946ef,#ec4899);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">SL</div>
            <div><div style="font-weight:800;color:#18181b;font-size:0.9rem;">Sophia Laurent</div><div style="color:#71717a;font-size:0.8rem;">Founder & CEO, Lumina Beauty Paris</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 6px 18px rgba(0,0,0,0.03);">
          <div style="color:#eab308;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#3f3f46;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Their organic SEO strategy outranks incumbents with 10x our marketing budget. The compound return has been extraordinary."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">MR</div>
            <div><div style="font-weight:800;color:#18181b;font-size:0.9rem;">Marcus Reed</div><div style="color:#71717a;font-size:0.8rem;">VP Growth, Aura Fitness Gear</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 6px 18px rgba(0,0,0,0.03);">
          <div style="color:#eab308;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#3f3f46;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Complete transparency with custom real-time dashboards. Every dollar of ad spend is directly attributed to bottom-line profit."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#f59e0b);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">TL</div>
            <div><div style="font-weight:800;color:#18181b;font-size:0.9rem;">Tyler Lin</div><div style="color:#71717a;font-size:0.8rem;">CMO, NovaTech Consumer Electronics</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 7. Contact Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#18181b;color:#ffffff;padding:80px 0;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#f472b6;font-weight:700;">READY TO SCALE?</span>
          <h2 style="font-size:2.4rem;margin:10px 0;max-width:650px;color:#ffffff;">Unlock profitable, sustainable audience acquisition.</h2>
          <p style="color:#a1a1aa;font-size:1.1rem;margin:0;max-width:550px;">Schedule a 30-minute discovery call to evaluate your market opportunity.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:linear-gradient(90deg,#d946ef 0%,#ec4899 100%);color:#ffffff;font-weight:800;border-radius:9999px;padding:16px 36px;box-shadow:0 10px 24px rgba(217,70,239,0.35);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Book Strategy Session ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${statsHtml}${productsHtml}${funnelHtml}${channelsHtml}${testimonialsHtml}${contactBandHtml}`;
}

export function renderMarketingAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang];
  const aboutText = copy?.about || company.description || 'Our agency combines predictive consumer analytics, viral creative production, and international SEO to deliver exponential customer lifetime value.';

  const heroHtml = `
    <section class="marketing-inner-hero" style="background:linear-gradient(135deg,#3b0764 0%,#701a75 50%,#831843 100%);color:#ffffff;padding:70px 0 50px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="font-size:0.9rem;">🚀</span>
          <span style="font-size:0.82rem;font-weight:700;color:#fdf4ff;letter-spacing:0.08em;text-transform:uppercase;">THE GROWTH ARCHITECTS · EST. ${esc(company.establishedYear || '2020')}</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4.2rem);line-height:1.1;font-weight:900;letter-spacing:-0.035em;margin:0 auto 20px;max-width:880px;color:#ffffff;">
          Transforming Market Velocity Through Creative Science
        </h1>
        <p style="max-width:720px;font-size:1.2rem;line-height:1.65;color:#f5d0fe;margin:0 auto;">
          ${esc(copy?.subtitle || 'We combine quantitative consumer telemetry, high-converting creative narrative engineering, and cross-channel media buying to scale industry-defining brands.')}
        </p>
      </div>
    </section>
  `;

  const statsHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #d946ef;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(217,70,239,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#d946ef;letter-spacing:-1px;">+380%</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Organic Traffic Lift</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Proven across enterprise e-commerce and SaaS brands with structured entity SEO.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #ec4899;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(236,72,153,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#ec4899;letter-spacing:-1px;">4.2x</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Blended ROAS Multiplier</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Validated via programmatic bid optimization and real-time conversion API integration.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #a855f7;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(168,85,247,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#a855f7;letter-spacing:-1px;">12M+</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">High-Intent Leads Captured</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Proprietary multi-step lead funnels with progressive profiling and scoring.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #8b5cf6;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(139,92,246,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#8b5cf6;letter-spacing:-1px;">98.6%</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Client Retention Rate</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Long-term strategic growth partnerships driven by transparent attribution.</div>
        </div>
      </div>
    </section>
  `;

  const manifestoHtml = `
    <section class="wrap" style="padding:40px 0 60px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#d946ef;font-weight:700;">THE GROWTH MANIFESTO</span>
          <h2 style="font-size:2.2rem;color:#18181b;margin:12px 0 20px;line-height:1.2;">Eliminating Marketing Bureaucracy With Agile Experimentation</h2>
          <div style="color:#52525b;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;">
            <p>${esc(aboutText)}</p>
            <p>Traditional agencies sell billable hours; we deliver measurable market velocity. Every sprint is grounded in unit economics, customer acquisition cost compression, and scalable revenue expansion.</p>
          </div>
          ${company.capabilities ? `
            <div style="margin-top:24px;padding:20px;background:#fdf4ff;border-left:4px solid #d946ef;border-radius:0 8px 8px 0;">
              <div style="font-size:0.85rem;font-weight:700;color:#d946ef;text-transform:uppercase;">Agency Core Disciplines</div>
              <div style="color:#18181b;margin-top:6px;font-weight:600;">${esc(company.capabilities)}</div>
            </div>
          ` : ''}
        </div>
        <div style="background:#18181b;color:#ffffff;border-radius:20px;padding:36px;box-shadow:0 10px 30px rgba(0,0,0,0.15);">
          <div style="font-size:2rem;margin-bottom:16px;">⚡</div>
          <h3 style="color:#ffffff;font-size:1.35rem;margin:0 0 10px;">Algorithmic Creative Engine</h3>
          <p style="color:#a1a1aa;font-size:0.95rem;line-height:1.6;margin:0 0 24px;">Our creative studio deploys 40+ ad iterations weekly, testing hook rates, visual contrast, and emotional triggers to find 10x breakthrough assets.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="background:rgba(255,255,255,0.06);padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">
              <div style="color:#f472b6;font-weight:700;font-size:0.85rem;">MULTI-TOUCH ATTRIBUTION</div>
              <div style="color:#d4d4d8;font-size:0.8rem;margin-top:4px;">Server-side CAPI tracking</div>
            </div>
            <div style="background:rgba(255,255,255,0.06);padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">
              <div style="color:#38bdf8;font-weight:700;font-size:0.85rem;">PREDICTIVE LTV</div>
              <div style="color:#d4d4d8;font-size:0.8rem;margin-top:4px;">Cohort payback forecasting</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const methodologyHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #f3e8ff;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">PROVEN METHODOLOGY</span>
        <h2 style="font-size:2.2rem;color:#18181b;margin:10px 0;">4-Stage Full-Funnel Growth Framework</h2>
        <p style="color:#71717a;max-width:620px;margin:0 auto;font-size:1rem;">A repeatable engine that systematically scales high-LTV customer acquisition.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.9rem;font-weight:900;color:#d946ef;margin-bottom:8px;">STAGE 01</div>
          <h3 style="color:#18181b;font-size:1.2rem;margin:0 0 10px;">Market Discovery & Audit</h3>
          <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0;">Deep audience demographic whitespace analysis, funnel leak detection, and competitive spend intelligence.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.9rem;font-weight:900;color:#ec4899;margin-bottom:8px;">STAGE 02</div>
          <h3 style="color:#18181b;font-size:1.2rem;margin:0 0 10px;">Conversion Architecture</h3>
          <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0;">Bespoke landing page wireframing, high-converting offer structuring, and multivariant testing frameworks.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.9rem;font-weight:900;color:#a855f7;margin-bottom:8px;">STAGE 03</div>
          <h3 style="color:#18181b;font-size:1.2rem;margin:0 0 10px;">Omni-Channel Scale</h3>
          <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0;">Precision algorithmic media buying across Google Search, Meta, TikTok, YouTube, and programmatic networks.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.9rem;font-weight:900;color:#8b5cf6;margin-bottom:8px;">STAGE 04</div>
          <h3 style="color:#18181b;font-size:1.2rem;margin:0 0 10px;">Retention & LTV Lift</h3>
          <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0;">Automated email/SMS lifecycle flows, cohort churn suppression, and VIP customer ascension pathways.</p>
        </div>
      </div>
    </section>
  `;

  const leadershipHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #f3e8ff;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">STRATEGY & CREATIVE LEADERS</span>
        <h2 style="font-size:2.2rem;color:#18181b;margin:10px 0;">Growth Architects & Specialists</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#d946ef,#ec4899);color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">JV</div>
          <h3 style="color:#18181b;font-size:1.15rem;margin:0 0 4px;">Julian Vance</h3>
          <div style="color:#d946ef;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Executive Creative Director</div>
          <p style="color:#71717a;font-size:0.85rem;line-height:1.5;margin:0;">Cannes Lions winner with 12+ years directing viral brand narratives.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#18181b;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">SS</div>
          <h3 style="color:#18181b;font-size:1.15rem;margin:0 0 4px;">Sophia Sterling</h3>
          <div style="color:#d946ef;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Head of Performance Media</div>
          <p style="color:#71717a;font-size:0.85rem;line-height:1.5;margin:0;">Managed $90M+ annual paid media with sub-second bid algorithms.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#8b5cf6;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">LT</div>
          <h3 style="color:#18181b;font-size:1.15rem;margin:0 0 4px;">Liam Thornton</h3>
          <div style="color:#d946ef;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Data Science & Attribution Lead</div>
          <p style="color:#71717a;font-size:0.85rem;line-height:1.5;margin:0;">Architect of proprietary server-side multi-touch attribution models.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#06b6d4;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">MP</div>
          <h3 style="color:#18181b;font-size:1.15rem;margin:0 0 4px;">Maya Patel</h3>
          <div style="color:#d946ef;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Director of Conversion Optimization</div>
          <p style="color:#71717a;font-size:0.85rem;line-height:1.5;margin:0;">Run over 1,400+ consumer psychographic split tests yielding 40%+ lifts.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="background:linear-gradient(135deg,#3b0764 0%,#701a75 100%);border-radius:20px;padding:48px;text-align:center;color:#ffffff;">
        <h2 style="font-size:2.2rem;color:#ffffff;margin:0 0 14px;">Ready to Accelerate Your Brand Growth?</h2>
        <p style="color:#f5d0fe;max-width:600px;margin:0 auto 28px;font-size:1.05rem;">Let us perform a comprehensive growth audit on your acquisition channels and identify hidden revenue leaks.</p>
        <a class="button" style="background:linear-gradient(90deg,#d946ef 0%,#ec4899 100%);color:#ffffff;font-weight:800;border-radius:9999px;padding:16px 36px;display:inline-block;text-decoration:none;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Claim Free Growth Audit ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${statsHtml}${manifestoHtml}${methodologyHtml}${leadershipHtml}${ctaHtml}`;
}

export function renderMarketingContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="marketing-inner-hero" style="background:linear-gradient(135deg,#3b0764 0%,#701a75 50%,#831843 100%);color:#ffffff;padding:70px 0 50px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="font-size:0.84rem;font-weight:700;color:#fdf4ff;letter-spacing:0.08em;text-transform:uppercase;">STRATEGY & BRIEFING INTAKE</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4.2rem);line-height:1.1;font-weight:900;letter-spacing:-0.035em;margin:0 auto 20px;max-width:880px;color:#ffffff;">
          ${esc(ui.conversation || 'Let\'s Start a Conversation')}
        </h1>
        <p style="max-width:720px;font-size:1.2rem;line-height:1.65;color:#f5d0fe;margin:0 auto;">
          ${esc(ui.contactIntro || 'Submit your project briefing or schedule a growth audit with our senior agency partners. All briefs reviewed within 24 hours.')}
        </p>
      </div>
    </section>
  `;

  const contactContentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div class="contact-layout" style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: Studios & Info -->
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:20px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <span class="eyebrow" style="color:#d946ef;font-weight:700;">DIRECT AGENCY CHANNELS</span>
          <h3 style="color:#18181b;font-size:1.4rem;margin:8px 0 24px;">Growth Studios & Desks</h3>

          <div style="display:flex;flex-direction:column;gap:20px;color:#52525b;font-size:0.95rem;">
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:#d946ef;text-transform:uppercase;margin-bottom:4px;">Direct Client Inquiries</div>
              <a style="color:#18181b;font-weight:700;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d946ef;text-transform:uppercase;margin-bottom:4px;">Strategy Switchboard</div>
                <a style="color:#18181b;font-weight:700;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d946ef;text-transform:uppercase;margin-bottom:4px;">Direct WhatsApp Channel</div>
                <a style="color:#10b981;font-weight:700;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Chat With Partners ↗)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d946ef;text-transform:uppercase;margin-bottom:4px;">Studio Headquarters</div>
                <span style="color:#3f3f46;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;padding:20px;background:#fdf4ff;border-radius:12px;border:1px solid #fae8ff;">
            <div style="font-size:0.85rem;color:#701a75;line-height:1.5;">
              <strong style="color:#4a044e;">Rapid Brief Review Commitment:</strong> All project inquiries receive a customized feedback video and channel audit within 24 hours of submission.
            </div>
          </div>
        </div>

        <!-- Right: Briefing Form -->
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:20px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <h2 style="color:#18181b;font-size:1.6rem;margin:0 0 8px;">Submit Project Briefing</h2>
          <p style="color:#71717a;font-size:0.95rem;margin:0 0 28px;">Share your growth targets, primary acquisition bottlenecks, and budget expectations.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#3f3f46;font-size:0.88rem;">
              <span>${esc(ui.name)} <span style="color:#d946ef;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:12px 14px;color:#18181b;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#3f3f46;font-size:0.88rem;">
              <span>${esc(ui.email)} <span style="color:#d946ef;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:12px 14px;color:#18181b;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#3f3f46;font-size:0.88rem;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:12px 14px;color:#18181b;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#3f3f46;font-size:0.88rem;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:12px 14px;color:#18181b;font:inherit;">
                <option value="">— Select Target Campaign / Solution Line —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#3f3f46;font-size:0.88rem;">
              <span>${esc(ui.message)} <span style="color:#d946ef;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Current monthly ad spend, target CAC/ROAS benchmarks, and key scaling objectives..." style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:12px 14px;color:#18181b;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:linear-gradient(90deg,#d946ef 0%,#ec4899 100%);color:#ffffff;font-weight:800;border-radius:9999px;padding:14px 36px;border:none;cursor:pointer;font-size:1rem;box-shadow:0 8px 20px rgba(217,70,239,0.35);">
                ${esc(ui.send)} ↗
              </button>
            </div>
            <p class="form-status" role="status" aria-live="polite" style="grid-column:1/-1;margin:4px 0 0;font-size:0.9rem;"></p>
          </form>
        </div>
      </div>
    </section>
  `;

  const faqHtml = `
    <section class="wrap" style="padding:40px 0 80px;border-top:1px solid #f3e8ff;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">FREQUENTLY ASKED QUESTIONS</span>
        <h2 style="font-size:2.2rem;color:#18181b;margin:10px 0;">Client Partnership & Engagement FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:12px;padding:24px;">
          <h3 style="color:#18181b;font-size:1.15rem;margin:0 0 8px;">What is your typical client engagement structure?</h3>
          <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0;">We partner with clients on a monthly agile growth sprint model with transparent performance benchmarks, without locking brands into restrictive multi-year contracts.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:12px;padding:24px;">
          <h3 style="color:#18181b;font-size:1.15rem;margin:0 0 8px;">Do you handle both creative production and media buying?</h3>
          <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0;">Yes. Our full-funnel model ensures creative directors, copywriters, and media buyers sit in the same pod for instant feedback loops and rapid iteration.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:12px;padding:24px;">
          <h3 style="color:#18181b;font-size:1.15rem;margin:0 0 8px;">How quickly do we see measurable campaign performance data?</h3>
          <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0;">Initial creative and technical setup concludes within 7 to 10 days, followed by live campaign testing and real-time dashboard tracking.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contactContentHtml}${faqHtml}`;
}

export function renderMarketingCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="marketing-inner-hero" style="background:linear-gradient(135deg,#3b0764 0%,#701a75 50%,#831843 100%);color:#ffffff;padding:70px 0 50px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="font-size:0.84rem;font-weight:700;color:#fdf4ff;letter-spacing:0.08em;text-transform:uppercase;">AGENCY CAPABILITIES & SERVICES</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4.2rem);line-height:1.1;font-weight:900;letter-spacing:-0.035em;margin:0 auto 20px;max-width:880px;color:#ffffff;">
          ${esc(ui.catalog || 'Growth Solutions & Campaigns')}
        </h1>
        <p style="max-width:720px;font-size:1.2rem;line-height:1.65;color:#f5d0fe;margin:0 auto;">
          Explore our specialized acquisition pods, creative production services, and algorithmic analytics suites.
        </p>
      </div>
    </section>
  `;

  const productsHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${draft.products.map(p => {
          const t = translateProduct(p);
          const imgUrl = asset(p.imageAssetId);
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#faf5ff;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="padding:32px 24px 16px;font-size:2.4rem;">🎯</div>
              `}
              <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
                <h3 style="margin:0 0 10px;font-size:1.3rem;color:#18181b;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#18181b;text-decoration:none;">
                    ${esc(t.name)}
                  </a>
                </h3>
                <p style="color:#71717a;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                  ${esc(t.description || 'Full-funnel digital marketing service component.')}
                </p>
                <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f3e8ff;padding-top:16px;margin-top:auto;">
                  <span style="font-size:0.85rem;color:#d946ef;font-weight:700;">High-Impact Pod</span>
                  <a style="color:#d946ef;font-weight:700;font-size:0.9rem;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${esc(ui.details || 'View Details')} →
                  </a>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  return `${heroHtml}${productsHtml}`;
}

export function renderMarketingDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset, options } = ctx;
  const p = draft.products.find(item => item.id === options.productId) || draft.products[0];
  if (!p) {
    return `<section class="wrap" style="padding:80px 0;"><h1>${esc(ui.noProducts || 'Service Not Found')}</h1></section>`;
  }

  const t = translateProduct(p);
  const imgUrl = asset(p.imageAssetId);
  const related = draft.products.filter(item => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <!-- Top Breadcrumbs & Discipline Hero -->
    <section class="marketing-inner-hero" style="background:linear-gradient(135deg,#3b0764 0%,#701a75 50%,#831843 100%);color:#ffffff;padding:50px 0 40px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.9rem;color:#f5d0fe;margin-bottom:16px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#f5d0fe;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#f5d0fe;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#ffffff;font-weight:700;">${esc(t.name)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);color:#fdf4ff;padding:4px 14px;border-radius:999px;font-size:0.8rem;font-weight:800;margin-bottom:12px;">
              <span>🔥</span> PERFORMANCE MARKETING DISCIPLINE
            </div>
            <h1 style="font-size:clamp(2.2rem,4vw,3.4rem);line-height:1.15;font-weight:900;letter-spacing:-0.03em;margin:0;color:#ffffff;">
              ${esc(t.name)}
            </h1>
          </div>
          <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px 20px;text-align:right;">
            <div style="color:#f5d0fe;font-size:0.8rem;text-transform:uppercase;font-weight:700;">Partner Tier</div>
            <div style="color:#ffffff;font-weight:800;font-size:1.05rem;">Google & Meta Premier</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Showcase: Col 1 Preview & Growth Badges, Col 2 Specs & Progress Bars -->
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:48px;align-items:start;">
        <!-- Left Col: Preview Card -->
        <div>
          <div class="wr-card-hover" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:20px;overflow:hidden;padding:32px;text-align:center;box-shadow:0 10px 30px rgba(217,70,239,0.06);">
            ${imgUrl ? `
              <img id="detailMainImg" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:contain;border-radius:12px;">
            ` : `
              <div style="padding:70px 24px;text-align:center;font-size:5rem;">🎯</div>
            `}
          </div>

          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <span style="background:#fdf4ff;border:1px solid #f5d0fe;color:#c026d3;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:700;">🚀 Server-Side Tracking</span>
            <span style="background:#fdf2f8;border:1px solid #fbcfe8;color:#db2777;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:700;">📊 Predictive LTV Models</span>
            <span style="background:#f5f3ff;border:1px solid #ddd6fe;color:#7c3aed;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:700;">🎯 Granular Retention</span>
          </div>
        </div>

        <!-- Right Col: Overview, Live Progress Bars, Scope Parameters -->
        <div>
          <h2 style="color:#18181b;font-size:1.8rem;font-weight:800;margin:0 0 16px;">Campaign Architecture & Strategy</h2>
          <p style="font-size:1.15rem;line-height:1.75;color:#52525b;margin:0 0 28px;">
            ${esc(t.description || 'Full-funnel digital marketing discipline integrating proprietary audience segmentation, high-velocity creative testing, and multi-touch deterministic attribution.')}
          </p>

          <!-- Dynamic Performance Progress Bars -->
          <div style="background:#fdf4ff;border:1px solid #f5d0fe;border-radius:16px;padding:26px;margin-bottom:28px;">
            <h3 style="color:#701a75;font-size:1.05rem;font-weight:800;margin:0 0 18px;display:flex;align-items:center;gap:8px;">
              <span>📈</span> Validated Campaign Performance Benchmarks
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#3f3f46;margin-bottom:6px;">
                  <span>Average Client ROAS Lift</span>
                  <span style="color:#c026d3;">94% (3.8x baseline)</span>
                </div>
                <div class="wr-progress-container" style="background:#fae8ff;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="94" style="background:linear-gradient(90deg,#d946ef,#ec4899);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#3f3f46;margin-bottom:6px;">
                  <span>Attribution Accuracy Rate</span>
                  <span style="color:#db2777;">98% Deterministic</span>
                </div>
                <div class="wr-progress-container" style="background:#fae8ff;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="98" style="background:linear-gradient(90deg,#ec4899,#f43f5e);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#3f3f46;margin-bottom:6px;">
                  <span>Omni-Channel Sync Speed</span>
                  <span style="color:#7c3aed;">96% Instantaneous</span>
                </div>
                <div class="wr-progress-container" style="background:#fae8ff;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="96" style="background:linear-gradient(90deg,#9333ea,#c084fc);height:100%;border-radius:99px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scope Parameters -->
          <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:24px;margin-bottom:32px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
            <h3 style="color:#18181b;font-size:1.05rem;font-weight:800;margin:0 0 16px;">Service Delivery Parameters</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f4f4f5;">
                <span style="color:#71717a;">Execution Channels</span>
                <span style="color:#18181b;font-weight:700;">${esc(p.material || 'Google Search, Meta, TikTok & Programmatic')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f4f4f5;">
                <span style="color:#71717a;">Campaign Cadence</span>
                <span style="color:#18181b;font-weight:700;">${esc(p.dimensions || 'Continuous Multi-Variant Testing')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f4f4f5;">
                <span style="color:#71717a;">Attribution Model</span>
                <span style="color:#d946ef;font-weight:700;">Server-Side CAPI & Multi-Touch Data Mesh</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#71717a;">Reporting Rhythm</span>
                <span style="color:#18181b;font-weight:700;">Live Real-Time Looker Studio Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Campaign Workflow Pillars -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;" data-reveal="fade-up">
        <span style="color:#d946ef;font-size:0.85rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">GROWTH ENGINE METHODOLOGY</span>
        <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#18181b;font-weight:800;margin:8px 0 12px;">Systematic Scientific Growth</h2>
        <p style="color:#71717a;font-size:1.05rem;line-height:1.6;margin:0;">Iterative conversion engineering and high-velocity asset experimentation.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:18px;padding:32px;box-shadow:0 4px 16px rgba(217,70,239,0.04);">
          <div style="width:52px;height:52px;border-radius:12px;background:#fdf4ff;color:#d946ef;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">🎯</div>
          <h3 style="color:#18181b;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Predictive Audience Modeling</h3>
          <p style="color:#71717a;font-size:0.95rem;line-height:1.6;margin:0;">Proprietary customer intent scoring models identifying high-LTV customer cohorts before auction costs peak.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:18px;padding:32px;box-shadow:0 4px 16px rgba(217,70,239,0.04);">
          <div style="width:52px;height:52px;border-radius:12px;background:#fdf2f8;color:#ec4899;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">⚡</div>
          <h3 style="color:#18181b;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Dynamic Creative Testing</h3>
          <p style="color:#71717a;font-size:0.95rem;line-height:1.6;margin:0;">Over 40 modular hook and lifestyle video variants deployed per month to combat creative fatigue and lower CPA.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:18px;padding:32px;box-shadow:0 4px 16px rgba(217,70,239,0.04);">
          <div style="width:52px;height:52px;border-radius:12px;background:#f5f3ff;color:#8b5cf6;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">📊</div>
          <h3 style="color:#18181b;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Full-Funnel Attribution</h3>
          <p style="color:#71717a;font-size:0.95rem;line-height:1.6;margin:0;">Unbiased media mix modeling across paid, organic, email and affiliate touchpoints to allocate capital optimally.</p>
        </div>
      </div>
    </section>

    <!-- Strategy Session & Audit Inquiry Form -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="background:linear-gradient(135deg,#3b0764 0%,#701a75 100%);color:#ffffff;border-radius:24px;padding:40px;display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;">
        <div>
          <span style="color:#f5d0fe;font-size:0.85rem;font-weight:800;text-transform:uppercase;">GROWTH PARTNERSHIP</span>
          <h2 style="color:#ffffff;font-size:1.8rem;font-weight:800;margin:8px 0 12px;">Scale With ${esc(t.name)}</h2>
          <p style="color:#f5d0fe;font-size:1rem;line-height:1.6;margin:0 0 24px;">
            Book a confidential performance growth audit. We evaluate your existing ad accounts, conversion funnels, and retention rates.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;color:#fdf4ff;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span>✓</span> Comprehensive 30-Point Funnel & Ad Account Audit
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span>✓</span> Benchmark Competitor CPA & ROAS Comparison
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span>✓</span> Custom 90-Day Media Mix & Creative Plan
            </div>
          </div>
          ${waDigits ? `
            <div style="margin-top:28px;">
              <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:0.95rem;">
                <span>WhatsApp Strategy Chat ↗</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#f5d0fe;font-size:0.85rem;font-weight:600;">Selected Discipline</label>
              <input name="productName" value="${esc(t.name)}" readonly style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;font-weight:700;">
              <input type="hidden" name="productId" value="${esc(p.id)}">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#f5d0fe;font-size:0.85rem;font-weight:600;">${esc(ui.name)} <span style="color:#ffffff;">*</span></label>
              <input name="name" required placeholder="Growth leader" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#f5d0fe;font-size:0.85rem;font-weight:600;">${esc(ui.email)} <span style="color:#ffffff;">*</span></label>
              <input name="email" type="email" required placeholder="work@brand.com" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#f5d0fe;font-size:0.85rem;font-weight:600;">Brand / Website <span style="color:#ffffff;">*</span></label>
              <input name="company" required placeholder="company.com" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#f5d0fe;font-size:0.85rem;font-weight:600;">Current Monthly Ad Spend</label>
              <input name="quantity" placeholder="e.g. $50k - $200k/mo" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#f5d0fe;font-size:0.85rem;font-weight:600;">Core Scaling Bottlenecks</label>
              <textarea name="message" rows="3" placeholder="Describe your current conversion rate, CPA target, or upcoming product launch goals..." style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;resize:vertical;"></textarea>
            </div>
            <div style="grid-column:1 / -1;margin-top:6px;">
              <button type="submit" class="button" style="width:100%;background:#ffffff;color:#701a75;font-weight:900;border-radius:999px;padding:14px;font-size:1rem;border:none;cursor:pointer;">
                ${esc(ui.inquire || 'Request Growth Audit & Strategy')} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:10px 0 0;font-size:0.85rem;text-align:center;color:#f5d0fe;"></p>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Related Marketing Disciplines -->
    ${related.length > 0 ? `
      <section class="wrap" style="padding:20px 0 80px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="font-size:1.6rem;color:#18181b;font-weight:800;margin:0;">Complementary Growth Disciplines</h2>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#d946ef;font-weight:700;text-decoration:none;font-size:0.95rem;">
            ${esc(ui.allProducts)} ↗
          </a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          ${related.map(item => {
            const it = translateProduct(item);
            const itemImg = asset(item.imageAssetId);
            return `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 14px rgba(217,70,239,0.03);">
                ${itemImg ? `
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;aspect-ratio:16/9;background:#faf5ff;overflow:hidden;">
                    <img src="${esc(itemImg)}" alt="${esc(it.name)}" style="width:100%;height:100%;object-fit:cover;">
                  </a>
                ` : `
                  <div style="padding:28px;text-align:center;font-size:2.5rem;background:#faf5ff;">🎯</div>
                `}
                <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                  <h4 style="font-size:1.1rem;font-weight:800;margin:0 0 8px;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#18181b;text-decoration:none;">
                      ${esc(it.name)}
                    </a>
                  </h4>
                  <p style="color:#71717a;font-size:0.88rem;line-height:1.5;margin:0 0 16px;flex:1;">
                    ${esc(it.description || 'Full-funnel digital marketing discipline.')}
                  </p>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#d946ef;font-weight:700;font-size:0.88rem;text-decoration:none;margin-top:auto;">
                    ${esc(ui.details)} →
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    ` : ''}
  `;
}
