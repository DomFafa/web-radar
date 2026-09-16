import { esc, type ThemeContext } from './types';

export function renderSaasHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Next-Gen Automation & Intelligent Workflows',
    subtitle: 'Streamline cross-border operations, integrate real-time triggers, and scale your global digital infrastructure.',
    about: 'We build enterprise-grade automation infrastructure that connects data pipelines, accelerates conversions, and reduces operational overhead.',
    cta: 'Get Started Free',
  };

  const videoUrl = asset(draft.heroAssetId) || '/templates/saas/hero-video.mp4';
  const posterUrl = asset(draft.posterAssetId);

  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}">
      <video id="hero-video" autoplay muted loop playsinline preload="metadata"${posterUrl ? ` poster="${esc(posterUrl)}"` : ''}>
        <source src="${esc(videoUrl)}" type="video/mp4">
      </video>
      <div class="wrap hero-content">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);padding:6px 16px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4ade80;animation:pulse 2s infinite;"></span>
          <span style="font-size:0.82rem;font-weight:600;color:#c7d2fe;letter-spacing:0.04em;">NEW RELEASE · INTELLIGENT WORKFLOW ENGINE 3.0</span>
        </div>
        <h1 class="hero-title">${esc(copy.headline)}</h1>
        <p style="max-width:680px;font-size:1.25rem;color:#cbd5e1;line-height:1.6;margin:16px auto 32px;">${esc(copy.subtitle)}</p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Start Free Trial')} ↗
          </a>
          <a class="button" style="background:rgba(255,255,255,0.08);border:1px solid #334155;color:#f8fafc;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ${esc(ui.allProducts)} →
          </a>
        </div>

        <div style="margin-top:40px;display:flex;align-items:center;gap:14px;justify-content:center;">
          <div style="display:flex;margin-left:12px;">
            <span style="display:inline-block;width:34px;height:34px;border-radius:50%;border:2px solid #090d16;background:#6366f1;color:#fff;font-size:12px;font-weight:700;line-height:30px;text-align:center;">✦</span>
            <span style="display:inline-block;width:34px;height:34px;border-radius:50%;border:2px solid #090d16;background:#06b6d4;color:#fff;font-size:12px;font-weight:700;line-height:30px;text-align:center;margin-left:-8px;">⚡</span>
            <span style="display:inline-block;width:34px;height:34px;border-radius:50%;border:2px solid #090d16;background:#8b5cf6;color:#fff;font-size:12px;font-weight:700;line-height:30px;text-align:center;margin-left:-8px;">🚀</span>
          </div>
          <span style="font-size:0.85rem;color:#94a3b8;">Trusted by <strong>2,400+</strong> global fast-scaling teams</span>
        </div>
      </div>
      <div class="hero-controls">
        <button type="button" id="video-toggle" class="video-control" aria-label="${esc(ui.pause)}">Ⅱ</button>
      </div>
    </section>
  `;

  // Real-time Metrics Band
  const metricsHtml = `
    <section class="wrap" style="padding:40px 0;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
        <div>
          <div style="font-size:2.4rem;font-weight:900;color:#6366f1;letter-spacing:-1px;">99.99%</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Uptime SLA Guarantee</div>
        </div>
        <div>
          <div style="font-size:2.4rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;">10x Faster</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Deployment & Sync Cycles</div>
        </div>
        <div>
          <div style="font-size:2.4rem;font-weight:900;color:#a855f7;letter-spacing:-1px;">240M+</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Automated Events Processed</div>
        </div>
        <div>
          <div style="font-size:2.4rem;font-weight:900;color:#38bdf8;letter-spacing:-1px;">Zero Code</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Visual Trigger Configuration</div>
        </div>
      </div>
    </section>
  `;

  // Core capabilities & products
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter">
      <div class="section-top">
        <div>
          <span class="eyebrow" style="color:#6366f1;">INTELLIGENT MODULES</span>
          <h2>Automated Ecosystem & Features</h2>
        </div>
        <a class="text-link" style="color:#818cf8;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const icon = ['⚡', '🔄', '🛡️', '📊', '🌐', '🧩'][idx % 6];
          return `
            <article class="product-card">
              <div style="font-size:2.2rem;margin-bottom:16px;">${icon}</div>
              <h3 style="margin:0 0 10px;font-size:1.3rem;color:#f8fafc;">${esc(t.name)}</h3>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:0 0 20px;">${esc(t.description || 'Pre-configured workflow automation integration module.')}</p>
              <a class="text-link" style="color:#818cf8;font-weight:600;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                Learn More →
              </a>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // Story & Architecture
  const storyHtml = `
    <section class="wrap story" style="border-top:1px solid #1e293b;">
      <div class="story-visual" style="background:#121826;border:1px solid #1e293b;border-radius:16px;display:flex;align-items:center;justify-content:center;padding:32px;">
        <div style="width:100%;text-align:center;">
          <div style="font-size:4rem;margin-bottom:12px;">⚙️</div>
          <div style="font-weight:700;color:#6366f1;font-size:1.2rem;">Enterprise Cloud Bus</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:6px;">Multi-cloud cluster orchestration & edge caching</div>
        </div>
      </div>
      <div>
        <span class="eyebrow" style="color:#6366f1;">ARCHITECTURE & SCALABILITY</span>
        <h2 style="margin:12px 0 20px;">Engineered for High-Throughput Reliability</h2>
        <p style="color:#cbd5e1;line-height:1.8;">${esc(copy.about || '')}</p>
        <div style="margin-top:28px;">
          <a class="button" href="${path('about/index.html')}" ${navAttrs('about')}>
            Explore Infrastructure Whitepaper ↗
          </a>
        </div>
      </div>
    </section>
  `;

  // Integration Ecosystem Band
  const integrationHtml = `
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="text-align:center;margin-bottom:32px;">
        <span class="eyebrow" style="color:#818cf8;">SEAMLESS INTEGRATIONS</span>
        <h2 style="font-size:2rem;margin:12px 0 8px;color:#f8fafc;">Connect with 200+ Platforms & APIs</h2>
        <p style="color:#64748b;max-width:600px;margin:0 auto;">Native integrations with CRMs, payment gateways, cloud warehouses, marketing tools, and enterprise ERP systems.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
        ${['Salesforce CRM', 'HubSpot', 'Stripe Payments', 'AWS Lambda', 'Google Cloud', 'Shopify', 'Slack', 'Zapier'].map(name => `
          <div style="background:#121826;border:1px solid #1e293b;border-radius:12px;padding:20px;text-align:center;transition:border-color 0.3s;">
            <div style="font-size:1.6rem;margin-bottom:8px;">🔗</div>
            <div style="font-size:0.9rem;font-weight:700;color:#e2e8f0;">${name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#6366f1;">WHAT OUR CLIENTS SAY</span>
        <h2 style="font-size:2rem;margin:12px 0;color:#f8fafc;">Trusted by Industry Leaders</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;">
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 16px;">"This platform cut our deployment cycles by 70%. The visual workflow builder is incredibly intuitive for our team."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;">JM</div>
            <div><div style="color:#f8fafc;font-weight:600;font-size:0.9rem;">James Mitchell</div><div style="color:#64748b;font-size:0.8rem;">CTO, FinTech Solutions</div></div>
          </div>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 16px;">"The real-time analytics dashboard gives us actionable insights. We've increased conversion rates by 340% in 6 months."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#06b6d4;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;">SK</div>
            <div><div style="color:#f8fafc;font-weight:600;font-size:0.9rem;">Sarah Kim</div><div style="color:#64748b;font-size:0.8rem;">VP Growth, E-Commerce Inc</div></div>
          </div>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 16px;">"Enterprise-grade security with zero-code configuration. Best automation platform we've evaluated in our 10-year history."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#8b5cf6;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;">RP</div>
            <div><div style="color:#f8fafc;font-weight:600;font-size:0.9rem;">Robert Park</div><div style="color:#64748b;font-size:0.8rem;">CISO, Global Systems Corp</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  const contactBandHtml = `
    <section class="contact-band" style="background:#121826;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;">
      <div class="wrap">
        <div>
          <span class="eyebrow" style="color:#818cf8;">GET IN TOUCH</span>
          <h2>Ready to transform your automated data flow?</h2>
          <p style="color:#94a3b8;font-size:1.1rem;margin-top:8px;">Book a dedicated technical session with our solution architects today.</p>
        </div>
        <a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Schedule Architecture Consultation ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${metricsHtml}${productsHtml}${storyHtml}${integrationHtml}${testimonialsHtml}${contactBandHtml}`;
}

