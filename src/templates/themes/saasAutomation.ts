import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

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
      <div class="wrap hero-content" data-reveal="fade-up">
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
        <a href="#metrics" class="wr-scroll-down" aria-label="Scroll to content">↓</a>
      </div>
      <div class="hero-controls">
        <button type="button" id="video-toggle" class="video-control" aria-label="${esc(ui.pause)}">Ⅱ</button>
      </div>
    </section>
  `;

  // Real-time Metrics Band
  const metricsHtml = `
    <section id="metrics" class="wrap" style="padding:40px 0;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#6366f1;letter-spacing:-1px;" data-counter="99.99" data-suffix="%">99.99%</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Uptime SLA Guarantee</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;" data-counter="10" data-suffix="x Faster">10x Faster</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Deployment & Sync Cycles</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#a855f7;letter-spacing:-1px;" data-counter="240" data-suffix="M+">240M+</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Automated Events Processed</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#38bdf8;letter-spacing:-1px;" data-counter="100" data-suffix="% Zero Code">100% Zero Code</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Visual Trigger Configuration</div>
        </div>
      </div>
    </section>
  `;

  // Core capabilities & products
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter">
      <div class="section-top" data-reveal="fade-up">
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
          const imgUrl = ctx.productMainImage(p);
          const icon = ['⚡', '🔄', '🛡️', '📊', '🌐', '🧩'][idx % 6];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up">
              ${imgUrl ? `<div class="product-image" style="border-radius:10px;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : `<div style="font-size:2.2rem;margin-bottom:16px;">${icon}</div>`}
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
    <section class="wrap story" style="border-top:1px solid #1e293b;" data-reveal="fade-up">
      <div class="story-visual wr-hero-float wr-card-hover" style="background:#121826;border:1px solid #1e293b;border-radius:16px;display:flex;align-items:center;justify-content:center;padding:32px;">
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
    <section class="wrap" style="padding:60px 0 40px;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:32px;">
        <span class="eyebrow" style="color:#818cf8;">SEAMLESS INTEGRATIONS</span>
        <h2 style="font-size:2rem;margin:12px 0 8px;color:#f8fafc;">Connect with 200+ Platforms & APIs</h2>
        <p style="color:#64748b;max-width:600px;margin:0 auto;">Native integrations with CRMs, payment gateways, cloud warehouses, marketing tools, and enterprise ERP systems.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
        ${['Salesforce CRM', 'HubSpot', 'Stripe Payments', 'AWS Lambda', 'Google Cloud', 'Shopify', 'Slack', 'Zapier'].map(name => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:12px;padding:20px;text-align:center;transition:border-color 0.3s;">
            <div style="font-size:1.6rem;margin-bottom:8px;">🔗</div>
            <div style="font-size:0.9rem;font-weight:700;color:#e2e8f0;">${name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#6366f1;">WHAT OUR CLIENTS SAY</span>
        <h2 style="font-size:2rem;margin:12px 0;color:#f8fafc;">Trusted by Industry Leaders</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 16px;">"This platform cut our deployment cycles by 70%. The visual workflow builder is incredibly intuitive for our team."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;">JM</div>
            <div><div style="color:#f8fafc;font-weight:600;font-size:0.9rem;">James Mitchell</div><div style="color:#64748b;font-size:0.8rem;">CTO, FinTech Solutions</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 16px;">"The real-time analytics dashboard gives us actionable insights. We've increased conversion rates by 340% in 6 months."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#06b6d4;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;">SK</div>
            <div><div style="color:#f8fafc;font-weight:600;font-size:0.9rem;">Sarah Kim</div><div style="color:#64748b;font-size:0.8rem;">VP Growth, E-Commerce Inc</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
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
    <section class="contact-band" data-reveal="fade-up" style="background:#121826;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;">
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

export function renderSaasAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang];

  const headline = company.aboutHeadline || 'Empowering Scalable, Autonomous Workflows';
  const customImg = company.aboutImageAssetId ? asset(company.aboutImageAssetId) : '';
  const customHighlights = company.aboutHighlights ? parseAboutHighlights(company.aboutHighlights) : null;
  const customStoryParas = company.aboutStory ? getAboutStoryParagraphs(company) : null;

  const aboutText = copy?.about || company.description || 'We build enterprise-grade automation infrastructure that connects data pipelines, accelerates conversions, and reduces operational overhead.';

  const heroHtml = `
    <section class="saas-inner-hero" style="background:linear-gradient(180deg,#090d16 0%,#111827 100%);color:#f8fafc;padding:70px 0 50px;border-bottom:1px solid #1e293b;">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(190,242,100,0.1);border:1px solid rgba(190,242,100,0.3);padding:6px 16px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#bef264;box-shadow:0 0 8px #bef264;"></span>
          <span style="font-size:0.8rem;font-weight:700;color:#bef264;letter-spacing:0.06em;">AUTONOMOUS WORKFLOW OS · EST. ${esc(company.establishedYear || '2021')}</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4rem);line-height:1.12;font-weight:800;letter-spacing:-0.03em;margin:0 0 20px;color:#ffffff;">
          ${esc(headline)}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#94a3b8;margin:0;">
          ${esc(copy?.subtitle || 'Connecting heterogeneous cloud data pipelines, accelerating event conversions, and eliminating repetitive operational friction.')}
        </p>
      </div>
    </section>
  `;

  const metricsHtml = customHighlights ? `
    <section class="wrap" style="padding:48px 0 32px;" data-reveal="fade-up">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
        ${customHighlights.map((h) => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
            <div style="font-size:2.4rem;font-weight:900;color:#bef264;letter-spacing:-1px;">
              <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
              </span>
            </div>
            <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">${esc(h.label)}</div>
            ${h.desc ? `<div style="font-size:0.8rem;color:#64748b;margin-top:4px;">${esc(h.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : `
    <section class="wrap" style="padding:48px 0 32px;" data-reveal="fade-up">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#bef264;letter-spacing:-1px;" data-counter="99.99" data-suffix="%">99.99%</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Uptime SLA Guarantee</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;" data-counter="10" data-suffix="x Faster">10x Faster</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Deployment & Sync Cycles</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#a855f7;letter-spacing:-1px;" data-counter="240" data-suffix="M+">240M+</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Automated Events Processed</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:32px;">
          <div style="font-size:2.4rem;font-weight:900;color:#38bdf8;letter-spacing:-1px;" data-counter="100" data-suffix="% Zero Code">100% Zero Code</div>
          <div style="font-size:0.9rem;color:#94a3b8;margin-top:4px;">Visual Trigger Configuration</div>
        </div>
      </div>
    </section>
  `;

  const originHtml = `
    <section class="wrap" style="padding:40px 0 60px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#bef264;font-weight:700;">OUR ORIGIN & PURPOSE</span>
          <h2 style="font-size:2.2rem;color:#f8fafc;margin:12px 0 20px;line-height:1.2;">Architected to Replace Repetitive Drag With Intelligent Velocity</h2>
          <div style="color:#cbd5e1;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;">
            ${customStoryParas ? customStoryParas.map(p => `<p style="margin:0;">${esc(p)}</p>`).join('') : `
              <p>${esc(aboutText)}</p>
              <p>From initial trigger payload ingestion to cross-platform reconciliation, our infrastructure eliminates data fragmentation across globally distributed tech stacks.</p>
            `}
          </div>
          ${company.capabilities ? `
            <div style="margin-top:24px;padding:20px;background:#121826;border-left:4px solid #bef264;border-radius:0 8px 8px 0;">
              <div style="font-size:0.85rem;font-weight:700;color:#bef264;text-transform:uppercase;">Core Platform Capabilities</div>
              <div style="color:#e2e8f0;margin-top:6px;font-size:0.95rem;">${esc(company.capabilities)}</div>
            </div>
          ` : ''}
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:20px;padding:36px;text-align:center;">
          ${customImg ? `
            <div style="border-radius:12px;overflow:hidden;border:1px solid #334155;margin-bottom:18px;">
              <img src="${esc(customImg)}" alt="${esc(company.name)}" style="width:100%;height:200px;object-fit:cover;display:block;" loading="lazy">
            </div>
          ` : `
            <div style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:16px;background:rgba(190,242,100,0.12);color:#bef264;font-size:2rem;margin-bottom:20px;">⚡</div>
          `}
          <h3 style="color:#f8fafc;font-size:1.4rem;margin:0 0 10px;">High-Concurrency Event Mesh</h3>
          <p style="color:#94a3b8;font-size:0.95rem;line-height:1.6;margin:0 0 24px;">Sub-millisecond routing across multitenant clusters with automated backoff and self-healing consumer groups.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left;">
            <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid #1e293b;">
              <div style="color:#bef264;font-weight:700;font-size:0.85rem;">END-TO-END TLS</div>
              <div style="color:#cbd5e1;font-size:0.8rem;margin-top:4px;">AES-256 encrypted at rest & transit</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid #1e293b;">
              <div style="color:#06b6d4;font-weight:700;font-size:0.85rem;">EVENT RETENTION</div>
              <div style="color:#cbd5e1;font-size:0.8rem;margin-top:4px;">Immutable replayable audit logs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const pillarsHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#bef264;font-weight:700;">ENGINEERING PRINCIPLES</span>
        <h2 style="font-size:2.2rem;color:#f8fafc;margin:10px 0;">Four Architectural Pillars</h2>
        <p style="color:#94a3b8;max-width:620px;margin:0 auto;font-size:1rem;">Designed from the ground up for high-throughput resilience and enterprise compliance.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="font-size:2rem;margin-bottom:14px;">🌐</div>
          <h3 style="color:#f8fafc;font-size:1.25rem;margin:0 0 10px;">Distributed Message Mesh</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Geo-distributed edge workers handling dynamic traffic surges without dropouts or message degradation.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="font-size:2rem;margin-bottom:14px;">🛡️</div>
          <h3 style="color:#f8fafc;font-size:1.25rem;margin:0 0 10px;">Zero-Trust Data Protection</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Role-based granular ACLs, automated secret rotation, and strict tenant cryptographic isolation.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="font-size:2rem;margin-bottom:14px;">🧩</div>
          <h3 style="color:#f8fafc;font-size:1.25rem;margin:0 0 10px;">Modular API & Webhooks</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Instant developer onboarding with OpenAPI specifications, webhooks with retry guarantees, and CLI tools.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;">
          <div style="font-size:2rem;margin-bottom:14px;">📊</div>
          <h3 style="color:#f8fafc;font-size:1.25rem;margin:0 0 10px;">Continuous Observability</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Live execution traces, latency heatmaps, and automated anomaly detection to spot pipeline bottlenecks.</p>
        </div>
      </div>
    </section>
  `;

  const teamHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#bef264;font-weight:700;">ENGINEERING SPECIALISTS</span>
        <h2 style="font-size:2.2rem;color:#f8fafc;margin:10px 0;">Leadership & Platform Architects</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#6366f1;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">JW</div>
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 4px;">James Walker</h3>
          <div style="color:#bef264;font-size:0.85rem;font-weight:600;margin-bottom:12px;">Chief Technology Officer</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">15+ years orchestrating distributed distributed systems and enterprise event pipelines.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#06b6d4;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">EB</div>
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 4px;">Elijah Brooks</h3>
          <div style="color:#06b6d4;font-size:0.85rem;font-weight:600;margin-bottom:12px;">Lead Automation Architect</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">Specializes in event stream optimization, webhook reliability, and cluster balancing.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#8b5cf6;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">MR</div>
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 4px;">Michael Rivera</h3>
          <div style="color:#8b5cf6;font-size:0.85rem;font-weight:600;margin-bottom:12px;">Platform Infrastructure Lead</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">Directs multitenant container orchestration, global edge nodes, and disaster recovery.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#ec4899;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">DK</div>
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 4px;">Daniel Kim</h3>
          <div style="color:#ec4899;font-size:0.85rem;font-weight:600;margin-bottom:12px;">Security & Compliance Lead</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">Oversees SOC2 Type II accreditation, penetration testing, and zero-trust protocols.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="background:linear-gradient(135deg,#1e1b4b 0%,#121826 100%);border:1px solid #312e81;border-radius:20px;padding:48px;text-align:center;">
        <h2 style="font-size:2.2rem;color:#f8fafc;margin:0 0 14px;">Ready to Scale Your Automated Data Flow?</h2>
        <p style="color:#cbd5e1;max-width:580px;margin:0 auto 28px;font-size:1.05rem;">Connect with our solutions architects to evaluate our throughput benchmarks on your production workloads.</p>
        <a class="button" style="background:#bef264;color:#090d16;font-weight:700;border-radius:8px;padding:16px 32px;display:inline-block;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Schedule Technical Briefing ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${metricsHtml}${originHtml}${pillarsHtml}${teamHtml}${ctaHtml}`;
}

export function renderSaasContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="saas-inner-hero" style="background:linear-gradient(180deg,#090d16 0%,#111827 100%);color:#f8fafc;padding:70px 0 50px;border-bottom:1px solid #1e293b;">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(190,242,100,0.1);border:1px solid rgba(190,242,100,0.3);padding:6px 16px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;"></span>
          <span style="font-size:0.8rem;font-weight:700;color:#bef264;letter-spacing:0.06em;">LIVE SOLUTIONS & ENGINEERING SUPPORT</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4rem);line-height:1.12;font-weight:800;letter-spacing:-0.03em;margin:0 0 20px;color:#ffffff;">
          ${esc(ui.conversation || 'Connect With Our Engineers')}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#94a3b8;margin:0;">
          ${esc(ui.contactIntro || 'Let us explore how our automation engine and custom webhook triggers can support your scaling goals.')}
        </p>
      </div>
    </section>
  `;

  const contactSectionHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div class="contact-layout" style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left Column: Direct channels & Live SLA note -->
        <div style="background:#121826;border:1px solid #1e293b;border-radius:20px;padding:36px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid #1e293b;">
            <span style="width:12px;height:12px;border-radius:50%;background:#4ade80;box-shadow:0 0 10px #4ade80;"></span>
            <div>
              <div style="font-weight:700;color:#f8fafc;font-size:0.95rem;">All Systems Operational</div>
              <div style="color:#64748b;font-size:0.8rem;">99.99% Guaranteed SLA Uptime</div>
            </div>
          </div>

          <h3 style="color:#f8fafc;font-size:1.4rem;margin:0 0 20px;">Direct Channels</h3>

          <div style="display:flex;flex-direction:column;gap:20px;color:#cbd5e1;font-size:0.95rem;">
            <div>
              <div style="color:#94a3b8;font-size:0.82rem;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Technical Inquiries</div>
              <a style="color:#bef264;text-decoration:none;font-weight:600;font-size:1.05rem;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="color:#94a3b8;font-size:0.82rem;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Global Engineering Desk</div>
                <a style="color:#f8fafc;text-decoration:none;font-weight:600;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="color:#94a3b8;font-size:0.82rem;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Instant WhatsApp Channel</div>
                <a style="color:#4ade80;text-decoration:none;font-weight:600;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Chat Now ↗)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="color:#94a3b8;font-size:0.82rem;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Global Operations HQ</div>
                <span style="color:#cbd5e1;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;">
            <div style="font-size:0.85rem;color:#94a3b8;line-height:1.6;">
              <strong style="color:#f8fafc;">Median SLA Response Time:</strong> &lt; 15 minutes for enterprise tier incidents. Solution engineers available 24/7/365.
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive form -->
        <div style="background:#121826;border:1px solid #1e293b;border-radius:20px;padding:36px;">
          <h2 style="color:#f8fafc;font-size:1.6rem;margin:0 0 8px;">Submit Technical Inquiry</h2>
          <p style="color:#94a3b8;font-size:0.95rem;margin:0 0 28px;">Specify your pipeline volume or integration goals for tailored scoping.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.name)} <span style="color:#bef264;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.email)} <span style="color:#bef264;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
                <option value="">— Select Target Workflow / Module —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.message)} <span style="color:#bef264;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Describe your data pipelines, event frequency, or custom connectors..." style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#bef264;color:#090d16;font-weight:700;border-radius:8px;padding:14px 28px;border:none;cursor:pointer;font-size:1rem;">
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
    <section class="wrap" style="padding:40px 0 80px;border-top:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#bef264;font-weight:700;">FREQUENTLY ASKED QUESTIONS</span>
        <h2 style="font-size:2.2rem;color:#f8fafc;margin:10px 0;">Technical Deployment & Integration FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div style="background:#121826;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">How fast can we integrate with existing microservices?</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Standard webhook listeners and SDK endpoints can be deployed in under 15 minutes with our zero-code connector templates.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">What security guarantees are provided for sensitive payload data?</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">All data packets are encrypted using AES-256 in transit and at rest. We support private VPC peering and regional data residency across US, EU, and APAC.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">Can we replay failed webhook events automatically?</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Yes. Our event mesh includes exponential backoff with dead-letter queue management and 30-day immutable replay capabilities.</p>
        </div>
        <div style="background:#121826;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">Do you provide dedicated technical account management?</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Enterprise tier accounts receive a dedicated solutions architect, Slack connect channels, and guaranteed sub-15 minute SLAs.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contactSectionHtml}${faqHtml}`;
}

export function renderSaasCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="saas-inner-hero" style="background:linear-gradient(180deg,#090d16 0%,#111827 100%);color:#f8fafc;padding:70px 0 50px;border-bottom:1px solid #1e293b;">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(190,242,100,0.1);border:1px solid rgba(190,242,100,0.3);padding:6px 16px;border-radius:9999px;margin-bottom:20px;">
          <span style="font-size:0.8rem;font-weight:700;color:#bef264;letter-spacing:0.06em;">CATALOG OF MODULES</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4rem);line-height:1.12;font-weight:800;letter-spacing:-0.03em;margin:0 0 20px;color:#ffffff;">
          ${esc(ui.catalog || 'Intelligent Workflow Modules')}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#94a3b8;margin:0;">
          Explore our pre-configured integrations, automated data connectors, and high-throughput execution modules.
        </p>
      </div>
    </section>
  `;

  const productsHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${draft.products.map((p, idx) => {
          const t = translateProduct(p);
          const icon = ['⚡', '🔄', '🛡️', '📊', '🌐', '🧩'][idx % 6];
          const imgUrl = asset(p.imageAssetId);
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;">
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#090d16;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="padding:32px 24px 16px;font-size:2.4rem;">${icon}</div>
              `}
              <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
                <h3 style="margin:0 0 10px;font-size:1.3rem;color:#f8fafc;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#f8fafc;text-decoration:none;">
                    ${esc(t.name)}
                  </a>
                </h3>
                <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                  ${esc(t.description || 'Pre-configured workflow integration component.')}
                </p>
                <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1e293b;padding-top:16px;margin-top:auto;">
                  <span style="font-size:0.85rem;color:#bef264;font-weight:600;">Active Module</span>
                  <a style="color:#818cf8;font-weight:600;font-size:0.9rem;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
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

export function renderSaasDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset, options } = ctx;
  const p = draft.products.find(item => item.id === options.productId) || draft.products[0];
  if (!p) {
    return `<section class="wrap" style="padding:80px 0;"><h1 style="color:#fff;">${esc(ui.noProducts || 'Module Not Found')}</h1></section>`;
  }

  const t = translateProduct(p);
  const imgUrl = asset(p.imageAssetId);
  const related = draft.products.filter(item => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <!-- Top Breadcrumbs & Module Title -->
    <section class="saas-inner-hero" style="background:linear-gradient(180deg,#090d16 0%,#111827 100%);color:#f8fafc;padding:50px 0 40px;border-bottom:1px solid #1e293b;">
      <div class="wrap">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.9rem;color:#94a3b8;margin-bottom:16px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#94a3b8;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#94a3b8;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#bef264;">${esc(t.name)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(190,242,100,0.12);border:1px solid rgba(190,242,100,0.3);color:#bef264;padding:4px 14px;border-radius:999px;font-size:0.8rem;font-weight:700;margin-bottom:12px;">
              <span style="width:7px;height:7px;border-radius:50%;background:#bef264;box-shadow:0 0 8px #bef264;"></span>
              ENTERPRISE ORCHESTRATION COMPONENT
            </div>
            <h1 style="font-size:clamp(2.2rem,4vw,3.4rem);line-height:1.15;font-weight:800;letter-spacing:-0.02em;margin:0;color:#ffffff;">
              ${esc(t.name)}
            </h1>
          </div>
          <div style="background:#121826;border:1px solid #1e293b;border-radius:12px;padding:12px 20px;text-align:right;">
            <div style="color:#64748b;font-size:0.8rem;text-transform:uppercase;font-weight:700;">Service Status</div>
            <div style="color:#4ade80;font-weight:800;font-size:1.05rem;">99.99% Production Ready</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Showcase: Col 1 Preview & Badges, Col 2 Specs & Progress Bars -->
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:48px;align-items:start;">
        <!-- Left Col: Visual Preview & Trust Pills -->
        <div>
          <div class="wr-card-hover" style="background:#121826;border:1px solid #1e293b;border-radius:20px;overflow:hidden;padding:32px;text-align:center;position:relative;">
            ${imgUrl ? `
              <img id="detailMainImg" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:contain;border-radius:12px;filter:drop-shadow(0 16px 30px rgba(0,0,0,0.5));">
            ` : `
              <div style="padding:70px 24px;text-align:center;font-size:5rem;">⚡</div>
            `}
          </div>

          <!-- Feature Highlights Tags -->
          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <span style="background:#121826;border:1px solid #1e293b;color:#cbd5e1;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:600;">⚡ Zero-Copy Streaming</span>
            <span style="background:#121826;border:1px solid #1e293b;color:#cbd5e1;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:600;">🔒 SOC2 Type II Certified</span>
            <span style="background:#121826;border:1px solid #1e293b;color:#cbd5e1;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:600;">☁️ Multi-Cloud Mesh</span>
          </div>
        </div>

        <!-- Right Col: Overview, Live Progress Bars, Technical Parameters -->
        <div>
          <h2 style="color:#f8fafc;font-size:1.8rem;font-weight:800;margin:0 0 16px;">Module Architecture & Scope</h2>
          <p style="font-size:1.15rem;line-height:1.75;color:#cbd5e1;margin:0 0 28px;">
            ${esc(t.description || 'Enterprise-grade automated data pipeline module engineered for sub-millisecond event streaming, zero-downtime reconfiguration, and granular RBAC security.')}
          </p>

          <!-- Dynamic Performance & SLA Progress Bars -->
          <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:26px;margin-bottom:28px;">
            <h3 style="color:#f8fafc;font-size:1.05rem;font-weight:800;margin:0 0 18px;display:flex;align-items:center;gap:8px;">
              <span style="color:#bef264;">📊</span> Live Performance & SLA Benchmarks
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">
                  <span>Cloud Throughput SLA</span>
                  <span style="color:#bef264;">99.99% Guaranteed</span>
                </div>
                <div class="wr-progress-container" style="background:#090d16;height:8px;border-radius:99px;overflow:hidden;border:1px solid #1e293b;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#84cc16,#bef264);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">
                  <span>Auto-Scaling Elasticity</span>
                  <span style="color:#38bdf8;">96% Velocity</span>
                </div>
                <div class="wr-progress-container" style="background:#090d16;height:8px;border-radius:99px;overflow:hidden;border:1px solid #1e293b;">
                  <div class="wr-progress-bar" data-progress="96" style="background:linear-gradient(90deg,#0284c7,#38bdf8);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#cbd5e1;margin-bottom:6px;">
                  <span>Fault-Tolerance & Failover</span>
                  <span style="color:#a855f7;">99.5% Resilience</span>
                </div>
                <div class="wr-progress-container" style="background:#090d16;height:8px;border-radius:99px;overflow:hidden;border:1px solid #1e293b;">
                  <div class="wr-progress-bar" data-progress="99" style="background:linear-gradient(90deg,#9333ea,#c084fc);height:100%;border-radius:99px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Specifications Table -->
          <div style="background:#121826;border:1px solid #1e293b;border-radius:16px;padding:24px;margin-bottom:32px;">
            <h3 style="color:#f8fafc;font-size:1.05rem;font-weight:800;margin:0 0 16px;">Technical Specifications</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #1e293b;">
                <span style="color:#94a3b8;">Execution Protocol</span>
                <span style="color:#f8fafc;font-weight:600;">${esc(p.material || 'gRPC / HTTPS Webhook Stream')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #1e293b;">
                <span style="color:#94a3b8;">Throughput SLA</span>
                <span style="color:#f8fafc;font-weight:600;">${esc(p.dimensions || '50,000 req/sec')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #1e293b;">
                <span style="color:#94a3b8;">Cluster Isolation</span>
                <span style="color:#4ade80;font-weight:600;">Dedicated Tenant Pod (K8s)</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#94a3b8;">Encryption Standard</span>
                <span style="color:#f8fafc;font-weight:600;">AES-256 GCM in Transit & At Rest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Architecture Pillars -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;" data-reveal="fade-up">
        <span style="color:#bef264;font-size:0.85rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">ENTERPRISE CAPABILITIES</span>
        <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#f8fafc;font-weight:800;margin:8px 0 12px;">Engineered for High-Concurrence Workloads</h2>
        <p style="color:#94a3b8;font-size:1.05rem;line-height:1.6;margin:0;">Seamless integration into existing cloud infrastructures with zero vendor lock-in.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:18px;padding:32px;">
          <div style="width:52px;height:52px;border-radius:12px;background:rgba(190,242,100,0.1);color:#bef264;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">⚡</div>
          <h3 style="color:#f8fafc;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Stream Ingestion Engine</h3>
          <p style="color:#94a3b8;font-size:0.95rem;line-height:1.6;margin:0;">Zero-copy memory bus pipeline routing up to 100,000 parallel events per node with guaranteed order preservation.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:18px;padding:32px;">
          <div style="width:52px;height:52px;border-radius:12px;background:rgba(56,189,248,0.1);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">🛡️</div>
          <h3 style="color:#f8fafc;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Isolated Tenant Pods</h3>
          <p style="color:#94a3b8;font-size:0.95rem;line-height:1.6;margin:0;">Every enterprise deployment operates within dedicated, sandboxed microVMs with strict resource quotas.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#121826;border:1px solid #1e293b;border-radius:18px;padding:32px;">
          <div style="width:52px;height:52px;border-radius:12px;background:rgba(168,85,247,0.1);color:#a855f7;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">🔄</div>
          <h3 style="color:#f8fafc;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Automated Compliance</h3>
          <p style="color:#94a3b8;font-size:0.95rem;line-height:1.6;margin:0;">Continuous telemetry feeds into your compliance dashboard for automated SOC2, HIPAA, and GDPR audit reports.</p>
        </div>
      </div>
    </section>

    <!-- Direct Fast Inquiry / Deployment Form -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="background:#121826;border:1px solid #1e293b;border-radius:24px;padding:40px;display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;">
        <div>
          <span style="color:#bef264;font-size:0.85rem;font-weight:800;text-transform:uppercase;">FAST ONBOARDING</span>
          <h2 style="color:#ffffff;font-size:1.8rem;font-weight:800;margin:8px 0 12px;">Deploy ${esc(t.name)}</h2>
          <p style="color:#94a3b8;font-size:1rem;line-height:1.6;margin:0 0 24px;">
            Send your estimated traffic and architectural requirements to our solutions engineering team for immediate sandbox provisioning.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;color:#cbd5e1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#4ade80;">✓</span> 14-Day Free Production Sandbox
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#4ade80;">✓</span> Direct Slack / Teams Channel with Core Engineers
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#4ade80;">✓</span> Customized Data Pipeline Sizing
            </div>
          </div>
          ${waDigits ? `
            <div style="margin-top:28px;">
              <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:0.95rem;">
                <span>WhatsApp Direct Support ↗</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Selected Module</label>
              <input name="productName" value="${esc(t.name)}" readonly style="background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;color:#bef264;font:inherit;font-weight:700;">
              <input type="hidden" name="productId" value="${esc(p.id)}">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.name)} <span style="color:#bef264;">*</span></label>
              <input name="name" required placeholder="Your full name" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.email)} <span style="color:#bef264;">*</span></label>
              <input name="email" type="email" required placeholder="work@company.com" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.company || 'Company')} <span style="color:#bef264;">*</span></label>
              <input name="company" required placeholder="Your organization" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Estimated Pipeline Volume</label>
              <input name="quantity" placeholder="e.g. 5M events/day" style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Technical Scope / Requirements</label>
              <textarea name="message" rows="3" placeholder="Describe your data pipeline requirements or deployment timeline..." style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;resize:vertical;"></textarea>
            </div>
            <div style="grid-column:1 / -1;margin-top:6px;">
              <button type="submit" class="button" style="width:100%;background:#bef264;color:#090d16;font-weight:800;border-radius:8px;padding:14px;font-size:1rem;border:none;cursor:pointer;">
                ${esc(ui.inquire || 'Request Deployment Sandbox')} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:10px 0 0;font-size:0.85rem;text-align:center;color:#94a3b8;"></p>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Related Modules Grid -->
    ${related.length > 0 ? `
      <section class="wrap" style="padding:20px 0 80px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="font-size:1.6rem;color:#ffffff;font-weight:800;margin:0;">Complementary Pipeline Modules</h2>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#bef264;font-weight:700;text-decoration:none;font-size:0.95rem;">
            ${esc(ui.allProducts)} ↗
          </a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          ${related.map(item => {
            const it = translateProduct(item);
            const itemImg = asset(item.imageAssetId);
            return `
              <div class="wr-card-hover" style="background:#121826;border:1px solid #1e293b;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;">
                ${itemImg ? `
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;aspect-ratio:16/9;background:#090d16;overflow:hidden;">
                    <img src="${esc(itemImg)}" alt="${esc(it.name)}" style="width:100%;height:100%;object-fit:cover;">
                  </a>
                ` : `
                  <div style="padding:28px;text-align:center;font-size:2.5rem;background:#090d16;">⚡</div>
                `}
                <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                  <h4 style="font-size:1.1rem;font-weight:800;margin:0 0 8px;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#ffffff;text-decoration:none;">
                      ${esc(it.name)}
                    </a>
                  </h4>
                  <p style="color:#94a3b8;font-size:0.88rem;line-height:1.5;margin:0 0 16px;flex:1;">
                    ${esc(it.description || 'Pre-configured workflow integration component.')}
                  </p>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#bef264;font-weight:700;font-size:0.88rem;text-decoration:none;margin-top:auto;">
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

