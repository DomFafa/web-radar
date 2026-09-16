import { esc, type ThemeContext } from './types';

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
      </div>
    </section>
  `;

  // 2. Performance Funnel & ROI Stats
  const statsHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #d946ef;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(217,70,239,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#d946ef;letter-spacing:-1px;">+380%</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Organic Traffic Lift</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Across enterprise brands with structured entity SEO & topical authority content.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #ec4899;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(236,72,153,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#ec4899;letter-spacing:-1px;">4.2x</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Blended ROAS Multiplier</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Validated through algorithmic bid optimization and high-intent audience lookalikes.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #8b5cf6;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(139,92,246,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#8b5cf6;letter-spacing:-1px;">$120M+</div>
          <div style="font-weight:800;color:#18181b;margin-top:6px;font-size:1.1rem;">Managed Client Ad Spend</div>
          <div style="font-size:0.86rem;color:#71717a;margin-top:6px;line-height:1.5;">Scaling performance marketing across 38 competitive global consumer verticals.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-top:4px solid #06b6d4;border-radius:16px;padding:28px;text-align:center;box-shadow:0 4px 20px rgba(6,182,212,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;">-45%</div>
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
      <div class="section-top" style="margin-bottom:36px;">
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
          const imgUrl = asset(p.imageAssetId);
          const icons = ['🎯', '✨', '⚡', '📊', '📈', '🚀'];
          const tags = ['Paid Media', 'SEO Growth', 'Creative Ads', 'Lifecycle', 'CRO Engine', 'Data Analytics'];
          return `
            <article class="product-card" style="background:#faf5ff;border:1px solid #f3e8ff;border-radius:18px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .3s;">
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
    <section class="wrap" style="padding:60px 0;border-top:1px solid #f3e8ff;">
      <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">PROVEN METHODOLOGY</span>
        <h2 style="font-size:2.4rem;color:#18181b;margin:10px 0;">The 4-Stage Revenue Flywheel Engine</h2>
        <p style="color:#71717a;font-size:1.05rem;">We build self-reinforcing acquisition systems that turn cold traffic into dedicated brand advocates.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#d946ef;margin-bottom:8px;">STAGE 01</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">Algorithmic Discovery</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">High-velocity creative testing across Meta, TikTok, and YouTube Shorts to identify winning consumer hooks.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#ec4899;margin-bottom:8px;">STAGE 02</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">Conversion Architecture</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">Ultra-fast headless landing pages tuned for sub-second load speeds and maximum frictionless checkout rate.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#8b5cf6;margin-bottom:8px;">STAGE 03</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">Audience Retargeting</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">Dynamic product ads and behavioral segmentation keeping your brand top-of-mind across the entire buying journey.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:14px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-size:0.8rem;font-weight:800;color:#06b6d4;margin-bottom:8px;">STAGE 04</div>
          <h3 style="font-size:1.25rem;color:#18181b;margin:0 0 10px;">LTV & Retention Loops</h3>
          <p style="color:#71717a;font-size:0.9rem;line-height:1.6;">Automated email/SMS lifecycle flows that drive repeat purchase velocity and maximize total customer lifetime value.</p>
        </div>
      </div>
    </section>
  `;

  // 5. Tech Stack & Channel Integrations
  const channelsHtml = `
    <section class="wrap" style="padding:50px 0 35px;border-top:1px solid #f3e8ff;">
      <div style="text-align:center;margin-bottom:32px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">CHANNELS & AD STACK</span>
        <h2 style="font-size:1.9rem;color:#18181b;margin:8px 0;">Certified Marketing & Analytics Integrations</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
        ${['Google Ads 360', 'Meta Ads Manager', 'TikTok Business', 'LinkedIn Marketing', 'Klaviyo Email', 'Shopify Plus', 'Google Analytics 4', 'AppsFlyer'].map(name => `
          <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:10px;padding:16px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="font-size:1.4rem;margin-bottom:6px;">📈</div>
            <div style="font-size:0.84rem;font-weight:700;color:#3f3f46;">${name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 6. Testimonials & Case Studies
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#d946ef;font-weight:700;">WHAT CLIENTS SAY</span>
        <h2 style="font-size:2rem;color:#18181b;margin:8px 0;">Exceptional Growth Validated by Brand Founders</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #f3e8ff;border-radius:16px;padding:28px;box-shadow:0 6px 18px rgba(0,0,0,0.03);">
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
