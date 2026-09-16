import { esc, type ThemeContext } from './types';

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
      </div>
    </section>
  `;

  // 2. Three Pillar Feature Strip directly below hero
  const pillarsHtml = `
    <section style="background:#0f172a;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;color:#ffffff;padding:32px 0;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div style="display:flex;align-items:flex-start;gap:16px;padding:12px;">
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
          const imgUrl = asset(p.imageAssetId);
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
