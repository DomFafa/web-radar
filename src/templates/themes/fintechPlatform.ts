import { esc, type ThemeContext } from './types';

export function renderFintechHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Unified Financial Treasury & Global Capital Management',
    subtitle: 'Consolidate corporate liquidity, automate multi-currency settlements, and maintain compliance across 140+ jurisdictions.',
    about: 'Our financial management platform enables cross-border enterprises to eliminate transaction latency, forecast treasury cash flows, and safeguard assets with tier-1 cryptographic security.',
    cta: 'Open Institutional Account',
  };

  const heroPoster = asset(draft.posterAssetId) || asset(ctx.mainProduct?.imageAssetId);

  // 1. Hero Section
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:linear-gradient(135deg,#091322 0%,#0f172a 60%,#1e293b 100%);color:#ffffff;padding:90px 0 80px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-120px;right:-80px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(2,132,199,0.18) 0%,transparent 70%);filter:blur(60px);pointer-events:none;"></div>
      <div class="wrap hero-content" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(2,132,199,0.15);border:1px solid rgba(56,189,248,0.35);padding:7px 18px;border-radius:9999px;margin-bottom:24px;width:fit-content;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;"></span>
          <span style="font-size:0.82rem;font-weight:700;color:#e0f2fe;letter-spacing:0.06em;">ENTERPRISE TREASURY OS · VERSION 4.2</span>
        </div>
        <h1 class="hero-title" style="font-size:clamp(2.8rem, 5.5vw, 4.8rem);line-height:1.08;font-weight:800;letter-spacing:-0.03em;max-width:880px;margin:0 0 20px;">
          ${esc(copy.headline)}
        </h1>
        <p style="max-width:640px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0 0 36px;">
          ${esc(copy.subtitle)}
        </p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
          <a class="button" style="background:#0284c7;color:#ffffff;font-weight:700;border-radius:8px;padding:14px 28px;box-shadow:0 10px 25px rgba(2,132,199,0.35);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Open Institutional Account')} ↗
          </a>
          <a class="button" style="background:rgba(255,255,255,0.08);color:#f8fafc;border:1px solid #334155;border-radius:8px;padding:14px 28px;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Solution Suite →
          </a>
        </div>
        <div style="margin-top:45px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;color:#38bdf8;font-size:0.9rem;font-weight:600;">
            <span>✓</span> SOC2 Type II Certified
          </div>
          <div style="display:flex;align-items:center;gap:6px;color:#38bdf8;font-size:0.9rem;font-weight:600;">
            <span>✓</span> ISO 27001 Compliant
          </div>
          <div style="display:flex;align-items:center;gap:6px;color:#38bdf8;font-size:0.9rem;font-weight:600;">
            <span>✓</span> SWIFT & SEPA Connected
          </div>
        </div>
      </div>
    </section>
  `;

  // 2. Financial KPI & Security Badges
  const securityBandHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0284c7;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#0284c7;font-weight:900;letter-spacing:-0.03em;">$18.4B+</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Annual Settlement Volume</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Real-time clearing across SWIFT, FedNow & SEPA networks with zero slippage.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #06b6d4;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#06b6d4;font-weight:900;letter-spacing:-0.03em;">140+ Currencies</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Direct FX Liquidity</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Competitive institutional interbank spreads with automated hedging triggers.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #10b981;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#10b981;font-weight:900;letter-spacing:-0.03em;">SOC 2 Type II</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Bank-Grade Encryption</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Hardware Security Module (HSM) key isolation with continuous 24/7 audits.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #8b5cf6;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#8b5cf6;font-weight:900;letter-spacing:-0.03em;">0.02s Latency</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Ledger Reconciliation</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Eliminate manual month-end closing delays with continuous algorithmic matching.</div>
        </div>
      </div>
    </section>
  `;

  // 3. Financial Solutions & Products
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" style="margin-bottom:36px;">
        <div>
          <span class="eyebrow" style="color:#0284c7;font-weight:700;">ENTERPRISE FINANCIAL CAPABILITIES</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#0f172a;">Tailored Liquidity & Settlement Solutions</h2>
        </div>
        <a class="text-link" style="color:#0284c7;font-weight:600;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = asset(p.imageAssetId);
          const icons = ['💳', '📈', '🏦', '⚖️', '🔒', '🌐'];
          const tags = ['Treasury', 'Liquidity', 'Compliance', 'Hedging', 'Settlement', 'Audit'];
          return `
            <article class="product-card" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                  <span style="font-size:1.8rem;">${icons[idx % icons.length]}</span>
                  <span style="font-size:0.75rem;font-weight:700;color:#0284c7;background:#e0f2fe;padding:4px 10px;border-radius:9999px;">${tags[idx % tags.length]}</span>
                </div>
                ${imgUrl ? `<div class="product-image" style="border-radius:8px;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="color:#0f172a;margin:0 0 10px;font-size:1.3rem;font-weight:700;">${esc(t.name)}</h3>
                <p style="color:#64748b;line-height:1.6;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Enterprise financial service component with automated reconciliation.')}</p>
              </div>
              <div style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#0284c7;font-weight:700;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  Review Solution Specs →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 4. Treasury Deep Dive / Interactive Feature Showcase
  const deepDiveHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e2e8f0;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#0284c7;font-weight:700;">INTELLIGENT TREASURY ENGINE</span>
          <h2 style="font-size:2.4rem;line-height:1.15;color:#0f172a;margin:12px 0 20px;">Automated Liquidity Pooling Across Global Entities</h2>
          <p style="color:#475569;line-height:1.75;font-size:1.05rem;margin-bottom:24px;">
            Eliminate idle balances with intelligent end-of-day concentration sweeps. Our algorithms forecast working capital requirements in real-time, sweeping surpluses to highest-yield liquidity accounts while ensuring operating balances meet all obligations.
          </p>
          <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:28px;">
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">✓</div>
              <div style="color:#334155;font-size:0.95rem;"><strong>Predictive Cash Flow Forecasting</strong> using deep neural time-series models.</div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">✓</div>
              <div style="color:#334155;font-size:0.95rem;"><strong>Multi-Tenant Entity Segregation</strong> with role-based audit logs and dual authorization.</div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">✓</div>
              <div style="color:#334155;font-size:0.95rem;"><strong>Direct ERP Integration</strong> into SAP, Oracle NetSuite, and Workday.</div>
            </div>
          </div>
          <a class="button" style="background:#0f172a;color:#ffffff;border-radius:8px;font-weight:600;" href="${path('about/index.html')}" ${navAttrs('about')}>
            Read Institutional Whitepaper ↗
          </a>
        </div>
        <div style="background:#091322;border:1px solid #1e293b;border-radius:16px;padding:32px;color:#ffffff;box-shadow:0 20px 40px rgba(15,23,42,0.15);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:16px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#10b981;"></span>
              <span style="font-weight:700;font-size:0.9rem;color:#f8fafc;">LIVE TREASURY MONITOR</span>
            </div>
            <span style="font-size:0.75rem;color:#94a3b8;font-family:monospace;">UPDATED REAL-TIME</span>
          </div>
          <div style="margin-bottom:24px;">
            <div style="font-size:0.8rem;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">Total Consolidated Liquidity</div>
            <div style="font-size:2.5rem;font-weight:900;color:#38bdf8;letter-spacing:-1px;margin:4px 0;">$428,950,420.00</div>
            <div style="display:flex;gap:12px;font-size:0.82rem;color:#4ade80;">
              <span>▲ +14.2% MoM</span>
              <span style="color:#94a3b8;">· 8 Currencies Consolidated</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="background:#121e33;border:1px solid #1e293b;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
              <div><div style="font-weight:600;font-size:0.9rem;">USD Operating Reserve</div><div style="font-size:0.75rem;color:#94a3b8;">JPMorgan Chase NY</div></div>
              <div style="font-weight:700;color:#f8fafc;">$214,500,000</div>
            </div>
            <div style="background:#121e33;border:1px solid #1e293b;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
              <div><div style="font-weight:600;font-size:0.9rem;">EUR Primary Clearing</div><div style="font-size:0.75rem;color:#94a3b8;">Deutsche Bank Frankfurt</div></div>
              <div style="font-weight:700;color:#f8fafc;">€142,300,000</div>
            </div>
            <div style="background:#121e33;border:1px solid #1e293b;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
              <div><div style="font-weight:600;font-size:0.9rem;">GBP Cross-Border Settlement</div><div style="font-size:0.75rem;color:#94a3b8;">Barclays London</div></div>
              <div style="font-weight:700;color:#f8fafc;">£72,150,420</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 5. Global Banking & Integration Partners
  const bankingPartnersHtml = `
    <section class="wrap" style="padding:60px 0 40px;border-top:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#0284c7;font-weight:700;">GLOBAL CLEARING INFRASTRUCTURE</span>
        <h2 style="font-size:2rem;color:#0f172a;margin:8px 0;">Direct Network Integrations & Tier-1 Rails</h2>
        <p style="color:#64748b;max-width:600px;margin:0 auto;font-size:0.95rem;">Seamless multi-rail connectivity without third-party correspondent intermediary fees.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;">
        ${['SWIFT gpi', 'FedNow Realtime', 'SEPA Instant', 'ACH Direct', 'CHAPS UK', 'Visa B2B Connect', 'Mastercard Send', 'JPMorgan Access'].map(name => `
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="font-size:1.5rem;margin-bottom:6px;">🌐</div>
            <div style="font-size:0.85rem;font-weight:700;color:#1e293b;">${name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 6. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#0284c7;font-weight:700;">CLIENT ENDORSEMENTS</span>
        <h2 style="font-size:2rem;color:#0f172a;margin:8px 0;">Trusted by Multinational CFOs & Treasurers</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The multi-currency concentration sweeps saved our global group over $3.2M in foreign exchange hedging costs in year one."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">AH</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">Alexander Hayes</div><div style="color:#64748b;font-size:0.8rem;">Group Treasurer, Vantage Logistics</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Reconciliation that used to take three accountants four days every month-end is now finalized continuously in sub-seconds."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#06b6d4;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">EW</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">Elena Wagner</div><div style="color:#64748b;font-size:0.8rem;">Chief Financial Officer, Nordic Energy AG</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Institutional security architecture is unparalleled. Passes all tier-1 banking security questionnaires effortlessly."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#8b5cf6;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">DC</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">David Chen</div><div style="color:#64748b;font-size:0.8rem;">Head of Risk & Treasury, Vertex Global</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 7. Contact / Institutional Advisory Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#0f172a;color:#ffffff;padding:80px 0;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#38bdf8;font-weight:700;">INSTITUTIONAL ADVISORY</span>
          <h2 style="font-size:2.4rem;margin:10px 0;max-width:680px;color:#ffffff;">Ready to optimize your global treasury operations?</h2>
          <p style="color:#94a3b8;font-size:1.1rem;margin:0;max-width:550px;">Schedule a confidential briefing with our compliance and liquidity specialists.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:#0284c7;color:#ffffff;font-weight:700;border-radius:8px;padding:16px 32px;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Request Private Briefing ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${securityBandHtml}${productsHtml}${deepDiveHtml}${bankingPartnersHtml}${testimonialsHtml}${contactBandHtml}`;
}
