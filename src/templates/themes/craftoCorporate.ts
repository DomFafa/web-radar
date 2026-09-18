import { esc, safeUrl, type ThemeContext } from './types';

export function renderCraftoHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Global Corporate Architecture & Scalable Enterprise Governance',
    subtitle: 'We empower Fortune 500 leaders and high-growth multinationals to modernize operating models, accelerate cross-border mergers, and achieve decisive competitive dominance.',
    about: 'Crafto Corporate delivers sovereign-level advisory, digital infrastructure modernization, and operational restructuring backed by decades of executive leadership.',
    cta: 'Consult Corporate Advisory',
  };

  // 1. Hero Section
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:#0b1120;color:#ffffff;padding:95px 0 85px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(0,71,255,0.2) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap hero-content" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(0,71,255,0.4);background:rgba(0,71,255,0.12);padding:7px 18px;margin-bottom:24px;">
          <span style="display:inline-block;width:8px;height:8px;background:#0047ff;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;">CRAFTO GLOBAL ENTERPRISE GROUP · ADVISORY 2026</span>
        </div>
        <h1 class="hero-title" style="font-size:clamp(3rem, 6.2vw, 5.2rem);line-height:1.02;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;max-width:960px;margin:0 0 24px;">
          ${esc(copy.headline)}
        </h1>
        <p style="max-width:680px;color:#94a3b8;font-size:1.22rem;line-height:1.65;margin:0 0 38px;">
          ${esc(copy.subtitle)}
        </p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <a class="button" style="background:#0047ff;color:#ffffff;font-weight:800;border-radius:0;padding:16px 36px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.85rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Consult Advisory')} ↗
          </a>
          <a class="button" style="background:transparent;border:1px solid #334155;color:#ffffff;border-radius:0;padding:16px 32px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.85rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Capabilities →
          </a>
        </div>
        <a href="#pillars" class="wr-scroll-down" aria-label="Scroll to content">↓</a>
      </div>
    </section>
  `;

  // 2. Three Pillar Feature Strip directly below hero
  const pillarsHtml = `
    <section id="pillars" style="background:#0f172a;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;color:#ffffff;padding:32px 0;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div data-reveal="fade-up" style="display:flex;align-items:flex-start;gap:16px;padding:12px;">
          <div style="font-size:1.8rem;color:#0047ff;font-weight:900;line-height:1;">01</div>
          <div>
            <h4 style="margin:0 0 4px;font-size:1.05rem;font-weight:700;color:#f8fafc;text-transform:uppercase;letter-spacing:0.04em;">Enterprise Strategy</h4>
            <p style="margin:0;color:#94a3b8;font-size:0.88rem;line-height:1.5;">Modernizing business models to navigate complex global geopolitical realities.</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:16px;padding:12px;border-left:1px solid #1e293b;">
          <div style="font-size:1.8rem;color:#0047ff;font-weight:900;line-height:1;">02</div>
          <div>
            <h4 style="margin:0 0 4px;font-size:1.05rem;font-weight:700;color:#f8fafc;text-transform:uppercase;letter-spacing:0.04em;">Cross-Border Governance</h4>
            <p style="margin:0;color:#94a3b8;font-size:0.88rem;line-height:1.5;">Comprehensive risk oversight, regulatory compliance, and ESG audit assurance.</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:16px;padding:12px;border-left:1px solid #1e293b;">
          <div style="font-size:1.8rem;color:#0047ff;font-weight:900;line-height:1;">03</div>
          <div>
            <h4 style="margin:0 0 4px;font-size:1.05rem;font-weight:700;color:#f8fafc;text-transform:uppercase;letter-spacing:0.04em;">Digital Modernization</h4>
            <p style="margin:0;color:#94a3b8;font-size:0.88rem;line-height:1.5;">Deploying autonomous enterprise architectures that unlock exponential productivity.</p>
          </div>
        </div>
      </div>
    </section>
  `;

  // 3. Corporate Metrics
  const metricsHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">500+</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Enterprise Deployments</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Proven institutional implementation track record across 42 countries.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">35+</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Countries & Regions</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Direct executive presence in New York, London, Zurich, Tokyo, and Singapore.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">98%</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Client Retention Rate</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Multi-year advisory engagements with Fortune 500 board executives.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">$45B+</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Market Cap Advised</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Strategic guidance driving sustained enterprise shareholder value.</div>
        </div>
      </div>
    </section>
  `;

  // 4. Core Business Units & Capabilities (Products)
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" style="margin-bottom:36px;">
        <div>
          <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">STRATEGIC PRACTICES</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#0f172a;text-transform:uppercase;font-weight:900;">Core Executive Practices</h2>
        </div>
        <a class="text-link" style="color:#0047ff;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = ctx.productMainImage(p);
          const codes = ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06'];
          return `
            <article class="product-card" style="background:#ffffff;border:1px solid #0f172a;border-radius:0;padding:26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <span style="font-size:0.8rem;font-weight:800;font-family:monospace;color:#0047ff;">${codes[idx % codes.length]}</span>
                  <span style="font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Enterprise Unit</span>
                </div>
                ${imgUrl ? `<div class="product-image" style="border-radius:0;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="color:#0f172a;margin:0 0 10px;font-size:1.3rem;font-weight:800;text-transform:uppercase;">${esc(t.name)}</h3>
                <p style="color:#64748b;line-height:1.6;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Institutional business unit dedicated to enterprise operational excellence.')}</p>
              </div>
              <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#0047ff;font-weight:800;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.05em;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  Review Case Study →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 5. Global Presence & Transformation Roadmap
  const presenceHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e5e7eb;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">TRANSFORMATION FRAMEWORK</span>
          <h2 style="font-size:2.4rem;line-height:1.12;color:#0f172a;margin:12px 0 20px;text-transform:uppercase;font-weight:900;">
            Institutional Rigor at Global Scale
          </h2>
          <p style="color:#475569;font-size:1.05rem;line-height:1.75;margin-bottom:28px;">
            We engineer organizational structures capable of sustaining compound advantages across market cycles. Our cross-disciplinary taskforces embed directly with executive leadership to implement decisive operational restructuring.
          </p>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;gap:14px;align-items:center;">
              <div style="width:28px;height:28px;background:#0047ff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">✓</div>
              <div style="color:#1e293b;font-weight:600;font-size:0.95rem;">Multi-Jurisdictional Cross-Border Structuring</div>
            </div>
            <div style="display:flex;gap:14px;align-items:center;">
              <div style="width:28px;height:28px;background:#0047ff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">✓</div>
              <div style="color:#1e293b;font-weight:600;font-size:0.95rem;">Supply Chain Decoupling & Sovereign Resilience</div>
            </div>
            <div style="display:flex;gap:14px;align-items:center;">
              <div style="width:28px;height:28px;background:#0047ff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">✓</div>
              <div style="color:#1e293b;font-weight:600;font-size:0.95rem;">Capital Allocation & Shareholder Return Strategy</div>
            </div>
          </div>
          <div style="margin-top:32px;">
            <a class="button" style="background:#0f172a;color:#ffffff;border-radius:0;text-transform:uppercase;font-weight:800;font-size:0.85rem;" href="${path('about/index.html')}" ${navAttrs('about')}>
              Review Institutional Credentials ↗
            </a>
          </div>
        </div>

        <div style="background:#0b1120;border:1px solid #1e293b;padding:36px;color:#ffffff;">
          <h3 style="font-size:1.2rem;text-transform:uppercase;letter-spacing:0.08em;color:#93c5fd;margin:0 0 20px;">Global Command Hubs</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="border-left:2px solid #0047ff;padding-left:14px;">
              <div style="font-weight:800;font-size:1rem;color:#f8fafc;">NEW YORK</div>
              <div style="font-size:0.82rem;color:#94a3b8;margin-top:2px;">Wall Street Tower · Americas HQ</div>
            </div>
            <div style="border-left:2px solid #0047ff;padding-left:14px;">
              <div style="font-weight:800;font-size:1rem;color:#f8fafc;">LONDON</div>
              <div style="font-size:0.82rem;color:#94a3b8;margin-top:2px;">Bank Square · EMEA Advisory</div>
            </div>
            <div style="border-left:2px solid #0047ff;padding-left:14px;">
              <div style="font-weight:800;font-size:1rem;color:#f8fafc;">ZURICH</div>
              <div style="font-size:0.82rem;color:#94a3b8;margin-top:2px;">Bahnhofstrasse · Private Wealth</div>
            </div>
            <div style="border-left:2px solid #0047ff;padding-left:14px;">
              <div style="font-weight:800;font-size:1rem;color:#f8fafc;">SINGAPORE</div>
              <div style="font-size:0.82rem;color:#94a3b8;margin-top:2px;">Marina Bay · APAC Treasury</div>
            </div>
          </div>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #1e293b;font-size:0.85rem;color:#94a3b8;">
            Direct telephone dispatch available 24/7 for emergency M&A transactions.
          </div>
        </div>
      </div>
    </section>
  `;

  // 6. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">EXECUTIVE ENDORSEMENTS</span>
        <h2 style="font-size:2rem;color:#0f172a;text-transform:uppercase;font-weight:900;margin:8px 0;">Trusted by Fortune 500 Board Leadership</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#0047ff;font-size:1.4rem;font-weight:900;margin-bottom:8px;">“</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Crafto guided our multinational merger across three continents with unmatched legal and organizational precision."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">EA</div>
            <div><div style="font-weight:800;color:#0f172a;font-size:0.9rem;">Edward Anderson</div><div style="color:#64748b;font-size:0.8rem;">Chairman of the Board, Global Infrastructure plc</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#0047ff;font-size:1.4rem;font-weight:900;margin-bottom:8px;">“</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Their digital modernization framework trimmed $180M in recurring IT overhead while increasing operational throughput by 40%."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:#0047ff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">MS</div>
            <div><div style="font-weight:800;color:#0f172a;font-size:0.9rem;">Miriam Sommer</div><div style="color:#64748b;font-size:0.8rem;">Chief Strategy Officer, Zurich Heavy Industries</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#0047ff;font-size:1.4rem;font-weight:900;margin-bottom:8px;">“</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The definitive standard for institutional governance. Their strategic roadmap aligned our 14 business units seamlessly."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:#1e293b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">KK</div>
            <div><div style="font-weight:800;color:#0f172a;font-size:0.9rem;">Kenji Kurata</div><div style="color:#64748b;font-size:0.8rem;">Managing Director, Asia-Pacific Holdings</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 7. Contact / Advisory Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#0047ff;color:#ffffff;padding:80px 0;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#93c5fd;font-weight:800;letter-spacing:0.15em;">EXECUTIVE PARTNERSHIP</span>
          <h2 style="font-size:2.4rem;margin:10px 0;max-width:680px;color:#ffffff;text-transform:uppercase;font-weight:900;">
            Elevate your organization to enterprise excellence.
          </h2>
          <p style="color:#dbeafe;font-size:1.1rem;margin:0;max-width:550px;">Initiate a confidential strategic dialogue with our senior managing directors.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:#ffffff;color:#0047ff;font-weight:900;border-radius:0;padding:16px 36px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.88rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Initiate Executive Consultation ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${pillarsHtml}${metricsHtml}${productsHtml}${presenceHtml}${testimonialsHtml}${contactBandHtml}`;
}

export function renderCraftoAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'Crafto Corporate delivers sovereign-level advisory, digital infrastructure modernization, and operational restructuring backed by decades of executive leadership.',
  };

  const heroHtml = `
    <section class="crafto-inner-hero" style="background:#0b1120;color:#ffffff;padding:80px 0 60px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(0,71,255,0.2) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(0,71,255,0.4);background:rgba(0,71,255,0.12);padding:6px 16px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;background:#0047ff;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;">INSTITUTIONAL CHARTER · GLOBAL ADVISORY</span>
        </div>
        <h1 style="font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.05;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;margin:0 0 20px;max-width:900px;color:#ffffff;">
          Institutional Rigor & Sovereign Governance
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0;">
          ${esc(copy.about)}
        </p>
      </div>
    </section>
  `;

  const statsHtml = `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">$45B+</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Market Cap Advised</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Direct board advisory guiding multi-billion enterprise restructurings worldwide.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">45+</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Global Markets</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Active cross-border regulatory counsel across EMEA, Americas, and APAC.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">500+</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Enterprise Mandates</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Executed corporate modernization programs with 98% multi-year client retention.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">25+</div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Years Executive Trust</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Unbroken record of fiduciary responsibility and corporate resilience.</div>
        </div>
      </div>
    </section>
  `;

  const missionHtml = `
    <section class="wrap" style="padding:50px 0 70px;">
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">THE CRAFTO DOCTRINE</span>
          <h2 style="font-size:2.4rem;line-height:1.12;color:#0f172a;margin:10px 0 20px;text-transform:uppercase;font-weight:900;">
            Institutional Modernization Built on Uncompromising Rigor
          </h2>
          <p style="color:#475569;font-size:1.05rem;line-height:1.75;margin-bottom:20px;">
            Modern enterprises face unprecedented volatility across supply chains, statutory frameworks, and technological paradigms. Crafto was founded on a singular conviction: lasting market dominance requires sovereign operational resilience, not reactive optimization.
          </p>
          <p style="color:#475569;font-size:1.05rem;line-height:1.75;margin:0 0 28px;">
            We pair elite executive practitioners with proprietary analytical infrastructure to advise sovereign wealth funds, multinational conglomerates, and high-growth boards on structural value preservation.
          </p>
          <div style="display:flex;gap:20px;flex-wrap:wrap;">
            <div style="border-left:3px solid #0047ff;padding-left:14px;">
              <strong style="color:#0f172a;display:block;font-size:1.1rem;text-transform:uppercase;">Independent</strong>
              <span style="color:#64748b;font-size:0.88rem;">Free from underwriting or lending conflicts.</span>
            </div>
            <div style="border-left:3px solid #0047ff;padding-left:14px;">
              <strong style="color:#0f172a;display:block;font-size:1.1rem;text-transform:uppercase;">Direct Delivery</strong>
              <span style="color:#64748b;font-size:0.88rem;">Senior managing directors lead every assignment.</span>
            </div>
          </div>
        </div>

        <div style="background:#0f172a;color:#ffffff;border:1px solid #1e293b;padding:40px;">
          <h3 style="font-size:1.3rem;text-transform:uppercase;letter-spacing:0.08em;color:#93c5fd;margin:0 0 24px;">Core Operating Principles</h3>
          <div style="display:flex;flex-direction:column;gap:20px;">
            <div style="display:flex;gap:16px;">
              <span style="font-family:monospace;font-weight:900;color:#0047ff;font-size:1.2rem;">01</span>
              <div>
                <strong style="color:#f8fafc;font-size:1rem;text-transform:uppercase;">Sovereign Accountability</strong>
                <p style="color:#94a3b8;font-size:0.88rem;line-height:1.5;margin:4px 0 0;">Every strategic recommendation is stress-tested against catastrophic geopolitical tail risks.</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;">
              <span style="font-family:monospace;font-weight:900;color:#0047ff;font-size:1.2rem;">02</span>
              <div>
                <strong style="color:#f8fafc;font-size:1rem;text-transform:uppercase;">Capital Discipline</strong>
                <p style="color:#94a3b8;font-size:0.88rem;line-height:1.5;margin:4px 0 0;">Capital allocation architectures engineered to sustain hurdle rates across full liquidity cycles.</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;">
              <span style="font-family:monospace;font-weight:900;color:#0047ff;font-size:1.2rem;">03</span>
              <div>
                <strong style="color:#f8fafc;font-size:1rem;text-transform:uppercase;">Continuous Modernization</strong>
                <p style="color:#94a3b8;font-size:0.88rem;line-height:1.5;margin:4px 0 0;">Transitioning legacy operating structures into automated, auditable digital platforms.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const leadershipHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">BOARD OF DIRECTORS</span>
        <h2 style="font-size:2.4rem;color:#0f172a;text-transform:uppercase;font-weight:900;margin:10px 0;">Executive Advisory Leadership</h2>
        <p style="color:#64748b;max-width:620px;margin:0 auto;font-size:1rem;">Seasoned managing directors combining sovereign governance, investment banking, and enterprise technology.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="width:60px;height:60px;background:#0b1120;color:#0047ff;font-weight:900;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">MV</div>
          <h3 style="font-size:1.15rem;margin:0 0 4px;color:#0f172a;text-transform:uppercase;font-weight:800;">Marcus Vance</h3>
          <div style="color:#0047ff;font-size:0.82rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">Managing Director, Americas</div>
          <p style="color:#64748b;font-size:0.86rem;line-height:1.5;margin:0;">Former Fortune 100 COO with 28 years directing global supply networks and enterprise restructuring.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="width:60px;height:60px;background:#0047ff;color:#ffffff;font-weight:900;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">ES</div>
          <h3 style="font-size:1.15rem;margin:0 0 4px;color:#0f172a;text-transform:uppercase;font-weight:800;">Dame Eleanor Sterling</h3>
          <div style="color:#0047ff;font-size:0.82rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">Head of Sovereign Advisory, EMEA</div>
          <p style="color:#64748b;font-size:0.86rem;line-height:1.5;margin:0;">Senior advisor to multilateral finance institutions and central sovereign investment portfolios.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="width:60px;height:60px;background:#0f172a;color:#0047ff;font-weight:900;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">KT</div>
          <h3 style="font-size:1.15rem;margin:0 0 4px;color:#0f172a;text-transform:uppercase;font-weight:800;">Kenji Takahashi</h3>
          <div style="color:#0047ff;font-size:0.82rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">Managing Director, APAC & Technology</div>
          <p style="color:#64748b;font-size:0.86rem;line-height:1.5;margin:0;">Specializes in cross-border digital architecture integration, fintech infrastructure, and algorithmic governance.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="width:60px;height:60px;background:#1e293b;color:#ffffff;font-weight:900;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">SR</div>
          <h3 style="font-size:1.15rem;margin:0 0 4px;color:#0f172a;text-transform:uppercase;font-weight:800;">Sophia Rostova, LL.M.</h3>
          <div style="color:#0047ff;font-size:0.82rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">Partner, Governance & M&A</div>
          <p style="color:#64748b;font-size:0.86rem;line-height:1.5;margin:0;">International corporate attorney specializing in anti-trust filings, sanctions compliance, and treaty arbitration.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="background:#0b1120;border:1px solid #0047ff;padding:48px;color:#ffffff;display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;">
        <div>
          <span style="font-family:monospace;color:#93c5fd;font-weight:800;font-size:0.82rem;letter-spacing:0.12em;">SCHEDULE DIRECT DIALOGUE</span>
          <h2 style="font-size:2.2rem;color:#ffffff;margin:8px 0;text-transform:uppercase;font-weight:900;">Engage the Executive Taskforce</h2>
          <p style="color:#94a3b8;font-size:1rem;margin:0;max-width:560px;">Arrange a preliminary confidential briefing with our sector managing directors.</p>
        </div>
        <a class="button" style="background:#0047ff;color:#ffffff;font-weight:800;border-radius:0;padding:16px 36px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.88rem;text-decoration:none;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Request Executive Briefing ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${statsHtml}${missionHtml}${leadershipHtml}${ctaHtml}`;
}

export function renderCraftoContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="crafto-inner-hero" style="background:#0b1120;color:#ffffff;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(0,71,255,0.2) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(0,71,255,0.4);background:rgba(0,71,255,0.12);padding:6px 16px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;background:#0047ff;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;">EXECUTIVE ENGAGEMENT DESK</span>
        </div>
        <h1 style="font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.05;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;margin:0 0 20px;max-width:900px;color:#ffffff;">
          ${esc(ui.conversation || 'Initiate Executive Consultation')}
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0;">
          ${esc(ui.contactIntro || 'Connect directly with our senior managing directors for strategic corporate restructuring, cross-border M&A counsel, or sovereign enterprise governance.')}
        </p>
      </div>
    </section>
  `;

  const contentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: Global Hubs & Dispatch -->
        <div style="background:#ffffff;border:1px solid #0f172a;padding:36px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">DIRECT CHANNELS</span>
          <h3 style="font-size:1.3rem;text-transform:uppercase;font-weight:800;color:#0f172a;margin:8px 0 24px;">Executive Desks & Hubs</h3>

          <div style="display:flex;flex-direction:column;gap:22px;font-size:0.92rem;">
            <div>
              <div style="font-size:0.8rem;font-weight:800;color:#0047ff;text-transform:uppercase;margin-bottom:4px;">Managing Director Inquiries</div>
              <a style="color:#0f172a;font-weight:800;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.8rem;font-weight:800;color:#0047ff;text-transform:uppercase;margin-bottom:4px;">Global Priority Line</div>
                <a style="color:#0f172a;font-weight:800;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.8rem;font-weight:800;color:#0047ff;text-transform:uppercase;margin-bottom:4px;">Encrypted Messaging (Signal / WhatsApp)</div>
                <a style="color:#10b981;font-weight:800;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Connect)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.8rem;font-weight:800;color:#0047ff;text-transform:uppercase;margin-bottom:4px;">Global Headquarters</div>
                <span style="color:#334155;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;background:#0f172a;color:#ffffff;padding:24px;border:1px solid #1e293b;">
            <div style="font-weight:800;text-transform:uppercase;font-size:0.85rem;color:#93c5fd;margin-bottom:6px;">Confidentiality Commitment</div>
            <div style="font-size:0.84rem;color:#94a3b8;line-height:1.6;">
              All corporate inquiries are immediately covered under standard Crafto bilateral non-disclosure protocols before substantive technical exchange.
            </div>
          </div>
        </div>

        <!-- Right: Inquiry Form -->
        <div style="background:#ffffff;border:1px solid #0f172a;padding:36px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.6rem;text-transform:uppercase;font-weight:900;color:#0f172a;margin:0 0 8px;">Submit Executive Mandate</h2>
          <p style="color:#64748b;font-size:0.95rem;margin:0 0 28px;">Specify your organizational objectives and required taskforce lead time.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#0f172a;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.name)} <span style="color:#0047ff;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#ffffff;border:1px solid #0f172a;padding:12px 14px;color:#0f172a;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#0f172a;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.email)} <span style="color:#0047ff;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#ffffff;border:1px solid #0f172a;padding:12px 14px;color:#0f172a;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#0f172a;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#ffffff;border:1px solid #0f172a;padding:12px 14px;color:#0f172a;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#0f172a;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#ffffff;border:1px solid #0f172a;padding:12px 14px;color:#0f172a;font:inherit;">
                <option value="">— Select Target Practice Area —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#0f172a;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.message)} <span style="color:#0047ff;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Summary of transaction, modernization scope, or board advisory mandate..." style="background:#ffffff;border:1px solid #0f172a;padding:12px 14px;color:#0f172a;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#0047ff;color:#ffffff;font-weight:800;border:none;padding:15px 36px;cursor:pointer;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.06em;">
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
    <section class="wrap" style="padding:40px 0 80px;border-top:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">ENGAGEMENT FAQ</span>
        <h2 style="font-size:2.2rem;color:#0f172a;text-transform:uppercase;font-weight:900;margin:8px 0;">Client Mandate Protocols</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div style="background:#ffffff;border:1px solid #0f172a;padding:24px;">
          <h3 style="color:#0f172a;font-size:1.1rem;text-transform:uppercase;font-weight:800;margin:0 0 8px;">What is the typical engagement deployment timeline?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Upon bilateral conflict clearance and NDA execution, our executive taskforces typically deploy within 72 hours for urgent transactions and within two weeks for full enterprise restructuring.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:24px;">
          <h3 style="color:#0f172a;font-size:1.1rem;text-transform:uppercase;font-weight:800;margin:0 0 8px;">How does Crafto manage multi-jurisdictional conflict of interest checks?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Our independent legal compliance committee runs proprietary cross-party audits against global statutory registries before accepting any M&A or restructuring mandate.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #0f172a;padding:24px;">
          <h3 style="color:#0f172a;font-size:1.1rem;text-transform:uppercase;font-weight:800;margin:0 0 8px;">Can Crafto provide interim C-suite executive placement?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Yes. Our senior managing directors frequently step into interim Chief Restructuring Officer (CRO) or Chief Transformation Officer (CTO) roles during transition milestones.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contentHtml}${faqHtml}`;
}

export function renderCraftoCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="crafto-inner-hero" style="background:#0b1120;color:#ffffff;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(0,71,255,0.2) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(0,71,255,0.4);background:rgba(0,71,255,0.12);padding:6px 16px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;background:#0047ff;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;">PRACTICE & CAPABILITY DIRECTORY</span>
        </div>
        <h1 style="font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.05;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;margin:0 0 20px;max-width:900px;color:#ffffff;">
          ${esc(ui.catalog || 'Core Executive Practices')}
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0;">
          Explore our sovereign enterprise governance disciplines, digital modernization units, and cross-border restructuring taskforces.
        </p>
      </div>
    </section>
  `;

  const productsHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${draft.products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = asset(p.imageAssetId);
          const code = `UNIT-${String(idx + 1).padStart(2, '0')}`;
          return `
            <article style="background:#ffffff;border:1px solid #0f172a;padding:26px;display:flex;flex-direction:column;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <span style="font-family:monospace;font-weight:800;color:#0047ff;font-size:0.85rem;">${code}</span>
                <span style="font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Enterprise Mandate</span>
              </div>
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#f1f5f9;margin-bottom:16px;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:28px 20px;text-align:center;font-size:2rem;margin-bottom:16px;">🏛️</div>
              `}
              <h3 style="font-size:1.25rem;font-weight:800;text-transform:uppercase;color:#0f172a;margin:0 0 10px;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#0f172a;text-decoration:none;">
                  ${esc(t.name)}
                </a>
              </h3>
              <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                ${esc(t.description || 'Institutional enterprise advisory practice area.')}
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:16px;display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
                <span style="font-size:0.82rem;font-weight:800;color:#0047ff;text-transform:uppercase;">Institutional Grade</span>
                <a style="color:#0047ff;font-weight:800;font-size:0.88rem;text-transform:uppercase;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${esc(ui.details || 'Review Mandate')} →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  return `${heroHtml}${productsHtml}`;
}

export function renderCraftoDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset, options } = ctx;
  const p = draft.products.find(item => item.id === options.productId) || draft.products[0];
  if (!p) {
    return `<section class="wrap" style="padding:80px 0;"><h1>${esc(ui.noProducts || 'Practice Not Found')}</h1></section>`;
  }

  const t = translateProduct(p);
  const imgUrl = asset(p.imageAssetId);
  const related = draft.products.filter(item => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <!-- Top Breadcrumbs & Corporate Hero -->
    <section class="crafto-inner-hero" style="background:#0b1120;color:#ffffff;padding:50px 0 40px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.88rem;color:#94a3b8;margin-bottom:16px;text-transform:uppercase;font-weight:700;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#94a3b8;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#94a3b8;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#93c5fd;">${esc(t.name)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(0,71,255,0.15);border:1px solid #0047ff;color:#93c5fd;padding:4px 14px;border-radius:0;font-size:0.78rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
              <span>⚙️</span> INDUSTRIAL & ENGINEERING SPECIFICATION
            </div>
            <h1 style="font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.1;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;margin:0;color:#ffffff;">
              ${esc(t.name)}
            </h1>
          </div>
          <div style="background:#0f172a;border:1px solid #1e293b;padding:12px 20px;text-align:right;">
            <div style="color:#64748b;font-size:0.8rem;text-transform:uppercase;font-weight:700;">Quality Standard</div>
            <div style="color:#0047ff;font-weight:800;font-size:1.05rem;">ISO 9001 / 14001 Certified</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Showcase: Col 1 Preview & Certifications, Col 2 Specs & Dynamic Progress Bars -->
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:48px;align-items:start;">
        <!-- Left Col: Engineering Visual -->
        <div>
          <div class="wr-card-hover" style="background:#ffffff;border:1px solid #0f172a;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,0.04);text-align:center;">
            ${imgUrl ? `
              <img id="detailMainImg" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:cover;">
            ` : `
              <div style="background:#0f172a;color:#ffffff;padding:70px 24px;text-align:center;font-size:5rem;">🏛️</div>
            `}
          </div>

          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <span style="background:#f8fafc;border:1px solid #cbd5e1;color:#0f172a;padding:8px 14px;font-size:0.82rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">✓ Micron Tolerance</span>
            <span style="background:#f8fafc;border:1px solid #cbd5e1;color:#0f172a;padding:8px 14px;font-size:0.82rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">✓ ISO 2768-m</span>
            <span style="background:#f8fafc;border:1px solid #cbd5e1;color:#0f172a;padding:8px 14px;font-size:0.82rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">✓ Batch Traceability</span>
          </div>
        </div>

        <!-- Right Col: Narrative, Dynamic Progress Bars, Technical Parameters -->
        <div>
          <h2 style="color:#0f172a;font-size:1.8rem;font-weight:900;text-transform:uppercase;margin:0 0 16px;">Engineering Scope & Specifications</h2>
          <p style="font-size:1.15rem;line-height:1.75;color:#334155;margin:0 0 28px;">
            ${esc(t.description || 'Advanced manufacturing and corporate engineering solution engineered for high repeatability, robust environmental resilience, and stringent quality control protocols.')}
          </p>

          <!-- Dynamic Engineering Quality Progress Bars -->
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-top:3px solid #0047ff;padding:26px;margin-bottom:28px;">
            <h3 style="color:#0f172a;font-size:1rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 18px;display:flex;align-items:center;gap:8px;">
              <span style="color:#0047ff;">⚙️</span> Manufacturing QA & Delivery Benchmarks
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:700;color:#0f172a;margin-bottom:6px;">
                  <span>Machining Tolerance (ISO 2768-m)</span>
                  <span style="color:#0047ff;">99.9% Micron Precision</span>
                </div>
                <div class="wr-progress-container" style="background:#e2e8f0;height:8px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:#0047ff;height:100%;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:700;color:#0f172a;margin-bottom:6px;">
                  <span>Tensile & Stress Compliance</span>
                  <span style="color:#0284c7;">97% Yield Strength</span>
                </div>
                <div class="wr-progress-container" style="background:#e2e8f0;height:8px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="97" style="background:linear-gradient(90deg,#0284c7,#38bdf8);height:100%;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:700;color:#0f172a;margin-bottom:6px;">
                  <span>Batch Quality Pass Rate</span>
                  <span style="color:#16a34a;">99.8% First-Pass Yield</span>
                </div>
                <div class="wr-progress-container" style="background:#e2e8f0;height:8px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#16a34a,#22c55e);height:100%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Parameters Box -->
          <div style="background:#ffffff;border:1px solid #0f172a;padding:24px;margin-bottom:32px;">
            <h3 style="font-size:1.05rem;font-weight:800;text-transform:uppercase;color:#0f172a;margin:0 0 16px;">Mandate Blueprint</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;">
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                <span style="color:#64748b;">Regulatory Jurisdiction</span>
                <strong style="color:#0f172a;">${esc(p.material || 'Global Industrial ISO & CE Standard')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                <span style="color:#64748b;">Operational Model</span>
                <strong style="color:#0f172a;">${esc(p.dimensions || 'High-Throughput Automated Production')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                <span style="color:#64748b;">Managing Desk</span>
                <strong style="color:#0047ff;">Executive Taskforce Partner</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Material Traceability</span>
                <strong style="color:#0f172a;">Full Heat-Lot Spectral Certification</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Engineering / Strategic Pillars -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;" data-reveal="fade-up">
        <span style="color:#0047ff;font-size:0.85rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">INDUSTRIAL CAPABILITIES</span>
        <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#0f172a;font-weight:900;text-transform:uppercase;margin:8px 0 12px;">Engineered for Precision Scale</h2>
        <p style="color:#64748b;font-size:1.05rem;line-height:1.6;margin:0;">From initial rapid tooling validation to automated high-volume series delivery.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="font-size:1.8rem;color:#0047ff;font-weight:900;margin-bottom:16px;">01</div>
          <h3 style="color:#0f172a;font-size:1.15rem;font-weight:800;text-transform:uppercase;margin:0 0 10px;">5-Axis Multi-Spindle CNC</h3>
          <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0;">Micron-level repeatable tool positioning handling exotic alloys, aerospace-grade titanium, and hardened tool steels.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="font-size:1.8rem;color:#0047ff;font-weight:900;margin-bottom:16px;">02</div>
          <h3 style="color:#0f172a;font-size:1.15rem;font-weight:800;text-transform:uppercase;margin:0 0 10px;">Spectrometric Testing</h3>
          <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0;">In-house metallurgical laboratories performing continuous X-ray diffraction, tensile stress testing, and chemical verification.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="font-size:1.8rem;color:#0047ff;font-weight:900;margin-bottom:16px;">03</div>
          <h3 style="color:#0f172a;font-size:1.15rem;font-weight:800;text-transform:uppercase;margin:0 0 10px;">Rapid DFM to Volume</h3>
          <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0;">Design for Manufacturing feedback within 24 hours, bridging pilot prototype tooling to full-scale automated multi-cavity runs.</p>
        </div>
      </div>
    </section>

    <!-- Technical RFQ / Proposal Form -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="background:#0b1120;color:#ffffff;border:1px solid #1e293b;padding:40px;display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;">
        <div>
          <span style="color:#0047ff;font-size:0.85rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">ENGINEERING RFQ</span>
          <h2 style="color:#ffffff;font-size:1.8rem;font-weight:900;text-transform:uppercase;margin:8px 0 12px;">Commission ${esc(t.name)}</h2>
          <p style="color:#94a3b8;font-size:1rem;line-height:1.6;margin:0 0 24px;">
            Submit your CAD specifications or technical blueprint for immediate engineering review and formal quotation within 24 hours.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;color:#cbd5e1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#0047ff;">✓</span> 24-Hour Guaranteed Engineering DFM Response
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#0047ff;">✓</span> Full First-Article Inspection Report (FAIR) Included
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#0047ff;">✓</span> Direct Access to Lead Production Metallurgist
            </div>
          </div>
          ${waDigits ? `
            <div style="margin-top:28px;">
              <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:0;text-decoration:none;font-size:0.95rem;">
                <span>WhatsApp Technical Inquiry ↗</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#94a3b8;font-size:0.85rem;font-weight:600;">Selected Solution</label>
              <input name="productName" value="${esc(t.name)}" readonly style="background:#0f172a;border:1px solid #334155;border-radius:0;padding:10px 14px;color:#93c5fd;font:inherit;font-weight:700;">
              <input type="hidden" name="productId" value="${esc(p.id)}">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.name)} <span style="color:#0047ff;">*</span></label>
              <input name="name" required placeholder="Lead engineer / buyer" style="background:#0f172a;border:1px solid #334155;border-radius:0;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.email)} <span style="color:#0047ff;">*</span></label>
              <input name="email" type="email" required placeholder="engineering@company.com" style="background:#0f172a;border:1px solid #334155;border-radius:0;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Company / Facility <span style="color:#0047ff;">*</span></label>
              <input name="company" required placeholder="Enterprise organization" style="background:#0f172a;border:1px solid #334155;border-radius:0;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Estimated Production Volume</label>
              <input name="quantity" placeholder="e.g. 5,000 - 50,000 pcs" style="background:#0f172a;border:1px solid #334155;border-radius:0;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Material / Drawing Details</label>
              <textarea name="message" rows="3" placeholder="Specify alloy grade, finish requirement, target tolerance, or delivery timeline..." style="background:#0f172a;border:1px solid #334155;border-radius:0;padding:10px 14px;color:#ffffff;font:inherit;resize:vertical;"></textarea>
            </div>
            <div style="grid-column:1 / -1;margin-top:6px;">
              <button type="submit" class="button" style="width:100%;background:#0047ff;color:#ffffff;font-weight:800;border-radius:0;padding:14px;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.06em;border:none;cursor:pointer;">
                ${esc(ui.inquire || 'Request Formal Technical Quotation')} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:10px 0 0;font-size:0.85rem;text-align:center;color:#94a3b8;"></p>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Related Industrial Solutions -->
    ${related.length > 0 ? `
      <section class="wrap" style="padding:20px 0 80px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="font-size:1.6rem;color:#0f172a;font-weight:900;text-transform:uppercase;margin:0;">Related Industrial Solutions</h2>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#0047ff;font-weight:800;text-decoration:none;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.04em;">
            ${esc(ui.allProducts)} ↗
          </a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          ${related.map(item => {
            const it = translateProduct(item);
            const itemImg = asset(item.imageAssetId);
            return `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #0f172a;padding:20px;display:flex;flex-direction:column;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                ${itemImg ? `
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;aspect-ratio:16/9;background:#0f172a;overflow:hidden;margin-bottom:14px;">
                    <img src="${esc(itemImg)}" alt="${esc(it.name)}" style="width:100%;height:100%;object-fit:cover;">
                  </a>
                ` : `
                  <div style="padding:28px;text-align:center;font-size:2.5rem;background:#0f172a;color:#fff;margin-bottom:14px;">🏛️</div>
                `}
                <div style="display:flex;flex-direction:column;flex:1;">
                  <h4 style="font-size:1.1rem;font-weight:800;text-transform:uppercase;margin:0 0 8px;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#0f172a;text-decoration:none;">
                      ${esc(it.name)}
                    </a>
                  </h4>
                  <p style="color:#64748b;font-size:0.88rem;line-height:1.5;margin:0 0 16px;flex:1;">
                    ${esc(it.description || 'Enterprise industrial manufacturing solution.')}
                  </p>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#0047ff;font-weight:800;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.04em;text-decoration:none;margin-top:auto;">
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

