import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { isTypedMaterialsSource } from '../materials-typed';

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
      <div class="wrap hero-content" data-reveal="fade-up" style="position:relative;z-index:2;">
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
        <a href="#kpis" class="wr-scroll-down" aria-label="Scroll to content">↓</a>
      </div>
    </section>
  `;

  // 2. Financial KPI & Security Badges
  const securityBandHtml = `
    <section id="kpis" class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0284c7;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#0284c7;font-weight:900;letter-spacing:-0.03em;" data-counter="18.4" data-suffix="B+">$18.4B+</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Annual Settlement Volume</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Real-time clearing across SWIFT, FedNow & SEPA networks with zero slippage.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #06b6d4;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#06b6d4;font-weight:900;letter-spacing:-0.03em;" data-counter="140" data-suffix="+ Currencies">140+ Currencies</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Direct FX Liquidity</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Competitive institutional interbank spreads with automated hedging triggers.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #10b981;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#10b981;font-weight:900;letter-spacing:-0.03em;" data-counter="100" data-suffix="% SOC 2 Type II">SOC 2 Type II</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Bank-Grade Encryption</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Hardware Security Module (HSM) key isolation with continuous 24/7 audits.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #8b5cf6;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#8b5cf6;font-weight:900;letter-spacing:-0.03em;" data-counter="0.02" data-suffix="s Latency">0.02s Latency</div>
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
      <div class="section-top" data-reveal="fade-up" style="margin-bottom:36px;">
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
          const imgUrl = ctx.productMainImage(p);
          const icons = ['💳', '📈', '🏦', '⚖️', '🔒', '🌐'];
          const tags = ['Treasury', 'Liquidity', 'Compliance', 'Hedging', 'Settlement', 'Audit'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;">
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
        <div data-reveal="fade-up">
          <span class="eyebrow" style="color:#0284c7;font-weight:700;">INTELLIGENT TREASURY ENGINE</span>
          <h2 style="font-size:2.4rem;line-height:1.15;color:#0f172a;margin:12px 0 20px;">Automated Liquidity Pooling Across Global Entities</h2>
          <p style="color:#475569;line-height:1.75;font-size:1.05rem;margin-bottom:24px;">
            Eliminate idle balances with intelligent end-of-day concentration sweeps. Our algorithms forecast working capital requirements in real-time, sweeping surpluses to highest-yield liquidity accounts while ensuring operating balances meet all obligations.
          </p>
          <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:28px;">
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">✓</div>
              <div style="color:#344155;font-size:0.95rem;"><strong>Predictive Cash Flow Forecasting</strong> using deep neural time-series models.</div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">✓</div>
              <div style="color:#344155;font-size:0.95rem;"><strong>Multi-Tenant Entity Segregation</strong> with role-based audit logs and dual authorization.</div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">✓</div>
              <div style="color:#344155;font-size:0.95rem;"><strong>Direct ERP Integration</strong> into SAP, Oracle NetSuite, and Workday.</div>
            </div>
          </div>
          <a class="button" style="background:#0f172a;color:#ffffff;border-radius:8px;font-weight:600;" href="${path('about/index.html')}" ${navAttrs('about')}>
            Read Institutional Whitepaper ↗
          </a>
        </div>
        <div class="wr-hero-float wr-card-hover" data-reveal="fade-up" style="background:#091322;border:1px solid #1e293b;border-radius:16px;padding:32px;color:#ffffff;box-shadow:0 20px 40px rgba(15,23,42,0.15);">
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
    <section class="wrap" style="padding:60px 0 40px;border-top:1px solid #e2e8f0;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#0284c7;font-weight:700;">GLOBAL CLEARING INFRASTRUCTURE</span>
        <h2 style="font-size:2rem;color:#0f172a;margin:8px 0;">Direct Network Integrations & Tier-1 Rails</h2>
        <p style="color:#64748b;max-width:600px;margin:0 auto;font-size:0.95rem;">Seamless multi-rail connectivity without third-party correspondent intermediary fees.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;">
        ${['SWIFT gpi', 'FedNow Realtime', 'SEPA Instant', 'ACH Direct', 'CHAPS UK', 'Visa B2B Connect', 'Mastercard Send', 'JPMorgan Access'].map(name => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="font-size:1.5rem;margin-bottom:6px;">🌐</div>
            <div style="font-size:0.85rem;font-weight:700;color:#1e293b;">${name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 6. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#0284c7;font-weight:700;">CLIENT ENDORSEMENTS</span>
        <h2 style="font-size:2rem;color:#0f172a;margin:8px 0;">Trusted by Multinational CFOs & Treasurers</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The multi-currency concentration sweeps saved our global group over $3.2M in foreign exchange hedging costs in year one."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">AH</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">Alexander Hayes</div><div style="color:#64748b;font-size:0.8rem;">Group Treasurer, Vantage Logistics</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#334155;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Reconciliation that used to take three accountants four days every month-end is now finalized continuously in sub-seconds."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#06b6d4;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">EW</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">Elena Wagner</div><div style="color:#64748b;font-size:0.8rem;">Chief Financial Officer, Nordic Energy AG</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
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
    <section class="contact-band" data-reveal="fade-up" style="background:#0f172a;color:#ffffff;padding:80px 0;">
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

function renderLegacyFintechAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang];

  const headline = company.aboutHeadline || 'Institutional Capital Infrastructure & Governance';
  const customImg = company.aboutImageAssetId ? asset(company.aboutImageAssetId) : '';
  const customHighlights = company.aboutHighlights ? parseAboutHighlights(company.aboutHighlights) : null;
  const customStoryParas = company.aboutStory ? getAboutStoryParagraphs(company) : null;

  const aboutText = copy?.about || company.description || 'Our financial management platform enables cross-border enterprises to eliminate transaction latency, forecast treasury cash flows, and safeguard assets with tier-1 cryptographic security.';

  const heroHtml = `
    <section class="fintech-inner-hero" style="background:linear-gradient(135deg,#091322 0%,#0f172a 60%,#1e293b 100%);color:#ffffff;padding:70px 0 50px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(2,132,199,0.15);border:1px solid rgba(56,189,248,0.35);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;"></span>
          <span style="font-size:0.82rem;font-weight:700;color:#e0f2fe;letter-spacing:0.06em;">CAPITAL GOVERNANCE & COMPLIANCE · EST. ${esc(company.establishedYear || '2018')}</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4rem);line-height:1.12;font-weight:800;letter-spacing:-0.03em;margin:0 0 20px;color:#ffffff;">
          ${esc(headline)}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#94a3b8;margin:0;">
          ${esc(copy?.subtitle || 'Empowering global corporations and financial institutions with unified liquidity, algorithmic foreign exchange hedging, and automated multi-currency settlements.')}
        </p>
      </div>
    </section>
  `;

  const kpiHtml = customHighlights ? `
    <section class="wrap" style="padding:48px 0 32px;" data-reveal="fade-up">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        ${customHighlights.map((h) => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0284c7;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
            <div style="font-size:2.2rem;color:#0284c7;font-weight:900;letter-spacing:-0.03em;">
              <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
              </span>
            </div>
            <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">${esc(h.label)}</div>
            ${h.desc ? `<div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">${esc(h.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0284c7;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#0284c7;font-weight:900;letter-spacing:-0.03em;">$18.4B+</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Annual Settlement Volume</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Real-time clearing across SWIFT, FedNow & SEPA networks with zero slippage.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0284c7;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#0284c7;font-weight:900;letter-spacing:-0.03em;">140+</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Supported Jurisdictions</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Full statutory AML, KYC, and cross-border currency compliance protocols.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0284c7;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#0284c7;font-weight:900;letter-spacing:-0.03em;">99.999%</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Platform Availability</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Fault-tolerant ledger with redundant active-active multi-region cloud pods.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0284c7;border-radius:12px;padding:26px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <div style="font-size:2.2rem;color:#0284c7;font-weight:900;letter-spacing:-0.03em;">&lt; 25ms</div>
          <div style="font-weight:700;margin-top:6px;color:#0f172a;font-size:1.05rem;">Clearing Rail Latency</div>
          <div style="font-size:0.88rem;color:#64748b;margin-top:6px;line-height:1.5;">Direct interbank communication with sub-second straight-through processing.</div>
        </div>
      </div>
    </section>
  `;

  const overviewHtml = `
    <section class="wrap" style="padding:40px 0 60px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#0284c7;font-weight:700;">INSTITUTIONAL HERITAGE</span>
          <h2 style="font-size:2.2rem;color:#0f172a;margin:12px 0 20px;line-height:1.2;">Eliminating Cross-Border Capital Latency and Friction</h2>
          <div style="color:#475569;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;">
            ${customStoryParas ? customStoryParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('') : `
              <p>${esc(aboutText)}</p>
              <p>Our infrastructure operates as a non-custodial and segregated fiduciary layer connecting multinational treasuries directly to central bank real-time payment rails.</p>
            `}
          </div>
          ${company.certifications ? `
            <div style="margin-top:24px;padding:20px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:0 8px 8px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <div style="font-size:0.85rem;font-weight:700;color:#0284c7;text-transform:uppercase;">Institutional Accreditations</div>
              <div style="color:#1e293b;margin-top:6px;font-weight:600;">${esc(company.certifications)}</div>
            </div>
          ` : ''}
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 6px 20px rgba(0,0,0,0.03);">
          ${customImg ? `
            <div style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:18px;">
              <img src="${esc(customImg)}" alt="${esc(company.name)}" style="width:100%;height:200px;object-fit:cover;display:block;" loading="lazy">
            </div>
          ` : `
            <div style="font-size:2rem;color:#0284c7;margin-bottom:16px;">🏛️</div>
          `}
          <h3 style="color:#0f172a;font-size:1.35rem;margin:0 0 10px;">Fiduciary Security & Segregation</h3>
          <p style="color:#64748b;font-size:0.95rem;line-height:1.6;margin:0 0 24px;">All corporate funds are isolated in bankruptcy-remote accounts with tier-1 global clearing banks.</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:#334155;">
              <span style="color:#0284c7;font-weight:700;">✓</span> SOC2 Type II Certified & Annually Audited
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:#334155;">
              <span style="color:#0284c7;font-weight:700;">✓</span> ISO 27001 Information Security Management
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:#334155;">
              <span style="color:#0284c7;font-weight:700;">✓</span> Direct SWIFT gpi & SEPA Instant Integration
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const pillarsHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#0284c7;font-weight:700;">GOVERNANCE FRAMEWORK</span>
        <h2 style="font-size:2.2rem;color:#0f172a;margin:10px 0;">Four Pillars of Capital Management</h2>
        <p style="color:#64748b;max-width:620px;margin:0 auto;font-size:1rem;">Constructed for corporate CFOs requiring liquidity velocity and risk mitigation.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">💱</div>
          <h3 style="color:#0f172a;font-size:1.2rem;margin:0 0 10px;">Multi-Currency Settlement</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Instant cross-border payment netting reducing correspondent fees and foreign exchange friction.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">📈</div>
          <h3 style="color:#0f172a;font-size:1.2rem;margin:0 0 10px;">Algorithmic FX Hedging</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Automated volatility shielding that locks in margins across high-volume international cash flows.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">🔒</div>
          <h3 style="color:#0f172a;font-size:1.2rem;margin:0 0 10px;">Tier-1 Segregated Custody</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Complete institutional segregation adhering to strict fiduciary mandates and regulatory guidelines.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">📜</div>
          <h3 style="color:#0f172a;font-size:1.2rem;margin:0 0 10px;">Immutable Audit Trails</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Cryptographically verified ledger entries facilitating real-time corporate balance sheet reconciliation.</p>
        </div>
      </div>
    </section>
  `;

  const leadershipHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#0284c7;font-weight:700;">LEADERSHIP & GOVERNANCE</span>
        <h2 style="font-size:2.2rem;color:#0f172a;margin:10px 0;">Executive Advisory Council</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#0284c7;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">AH</div>
          <h3 style="color:#0f172a;font-size:1.15rem;margin:0 0 4px;">Alexander Hayes</h3>
          <div style="color:#0284c7;font-size:0.85rem;font-weight:600;margin-bottom:10px;">Chief Investment Officer</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">20+ years managing sovereign liquidity and cross-border currency reserves.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#0f172a;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">EW</div>
          <h3 style="color:#0f172a;font-size:1.15rem;margin:0 0 4px;">Elena Wagner</h3>
          <div style="color:#0284c7;font-size:0.85rem;font-weight:600;margin-bottom:10px;">Chief Financial Officer</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">Former institutional banking regulator with deep expertise in Basel III compliance.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#38bdf8;color:#091322;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">DC</div>
          <h3 style="color:#0f172a;font-size:1.15rem;margin:0 0 4px;">David Chen</h3>
          <div style="color:#0284c7;font-size:0.85rem;font-weight:600;margin-bottom:10px;">Head of Risk & Treasury</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">Leads counterparty risk modeling and algorithmic execution corridors.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#475569;color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">MV</div>
          <h3 style="color:#0f172a;font-size:1.15rem;margin:0 0 4px;">Marcus Vance</h3>
          <div style="color:#0284c7;font-size:0.85rem;font-weight:600;margin-bottom:10px;">Senior Compliance Director</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">Directs global AML/KYC automated verifications and statutory filings.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="background:linear-gradient(135deg,#091322 0%,#1e293b 100%);border-radius:16px;padding:48px;text-align:center;color:#ffffff;">
        <h2 style="font-size:2.2rem;color:#ffffff;margin:0 0 14px;">Ready to Elevate Your Corporate Treasury Operations?</h2>
        <p style="color:#94a3b8;max-width:600px;margin:0 auto 28px;font-size:1.05rem;">Request a private institutional briefing to evaluate clearing corridors, liquidity pools, and integration timelines.</p>
        <a class="button" style="background:#0284c7;color:#ffffff;font-weight:700;border-radius:8px;padding:16px 32px;display:inline-block;text-decoration:none;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Request Private Briefing ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${kpiHtml}${overviewHtml}${pillarsHtml}${leadershipHtml}${ctaHtml}`;
}

function renderModernFintechAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const copy = draft.copy[ctx.lang];

  const defaultHeadline = isZh
    ? '构筑机构级数字资本基建与多币种跨境清算网络'
    : 'Institutional Capital Infrastructure & Global Multi-Currency Clearing Rails';
  const headline = getAboutHeadline(company, defaultHeadline);

  const defaultStory = [
    isZh
      ? `${company.name} 专注于为全球跨国集团、持牌金融机构及新经济平台提供机构级数字金库与自动化司库调度基建。我们通过密码学分布式总账与直通式清算路由，彻底解决跨境交易延迟高、汇率摩擦大、合规对账繁琐的传统痛点。`
      : `${company.name} delivers institutional-grade capital infrastructure, autonomous corporate treasury management, and real-time multi-currency clearing rails for multinational enterprises and licensed financial institutions.`,
    isZh
      ? '平台直接穿透接入全球主流央行实时支付系统（包括 SWIFT、FedNow、SEPA 及 CHAPS），结合自研智能对冲引擎与自动化多币种资金扫额机制，支持秒级直通处理（STP）与企业级法定外汇合规审查。'
      : 'Our core infrastructure interfaces directly with tier-1 central clearing rails, integrating algorithmic FX execution, automated liquidity sweeps, and continuous regulatory surveillance to ensure friction-free cross-border operations.',
  ];
  const storyParas = getAboutStoryParagraphs(company, defaultStory[0]);
  const paras = company.aboutStory ? storyParas : defaultStory;

  const { primary: aboutImg } = getAboutImages(ctx);

  const stats = parseAboutHighlights(company.aboutHighlights, [
    { value: '$18.4B+', num: 18.4, prefix: '$', suffix: 'B+', label: isZh ? '年化跨国资金清算总额' : 'Annual Settlement Volume', desc: isZh ? '跨 SWIFT / FedNow / SEPA 直通清算' : 'Zero-slippage algorithmic routing' },
    { value: '140+', num: 140, suffix: '+', label: isZh ? '全球法定准入监管辖区' : 'Supported Jurisdictions', desc: isZh ? '全链路合规反洗钱及跨国监管审查' : 'Statutory AML, KYC & currency compliance' },
    { value: '99.999%', num: 99.999, suffix: '%', label: isZh ? '金融级分布式总账高可用' : 'Platform Availability SLA', desc: isZh ? '双活多区域异地容灾集群架构' : 'Active-active redundant cloud pods' },
    { value: '< 25ms', num: 25, prefix: '< ', suffix: 'ms', label: isZh ? '银行间直通清算延迟' : 'Clearing Rail Latency', desc: isZh ? '亚毫秒级直通处理与实时确认' : 'Sub-second straight-through execution' },
  ]);

  return `
    <div class="fintech-about-modern" style="background:#070f1e;color:#ffffff;font-family:'Inter Tight',-apple-system,sans-serif;padding-bottom:80px;">
      <!-- TOP CLEARING CORRIDOR TICKER -->
      <div style="background:#0b1528;border-bottom:1px solid rgba(56,189,248,0.2);padding:10px 24px;font-family:monospace;font-size:0.8rem;color:#94a3b8;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
          <span><strong style="color:#38bdf8;">USD/EUR:</strong> 1.0842 <span style="color:#10b981;">STP CLEARED ⚡</span></span>
          <span><strong style="color:#38bdf8;">USD/SGD:</strong> 1.3415 <span style="color:#10b981;">FEDNOW ACTIVE ⚡</span></span>
          <span><strong style="color:#38bdf8;">EUR/GBP:</strong> 0.8540 <span style="color:#10b981;">SEPA INSTANT ⚡</span></span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;color:#e2e8f0;">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;"></span>
          <span>SWIFT CONNECTIVITY: LIVE // ISO 20022</span>
        </div>
      </div>

      <!-- 1. INSTITUTIONAL TREASURY DUAL-CHAMBER HERO -->
      <section class="fintech-inner-hero" style="background:radial-gradient(ellipse at 50% 0%, rgba(2,132,199,0.18) 0%, #070f1e 75%);padding:80px 0 60px;border-bottom:1px solid rgba(255,255,255,0.08);position:relative;">
        <div class="wrap" style="max-width:1240px;margin:0 auto;padding:0 24px;">
          <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:48px;align-items:center;">
            <!-- Left: Sovereign Fiduciary Manifesto -->
            <div data-reveal="fade-up">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(2,132,199,0.15);border:1px solid rgba(56,189,248,0.35);padding:6px 20px;border-radius:9999px;margin-bottom:22px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 10px #38bdf8;"></span>
                <span style="font-size:0.82rem;font-weight:800;color:#e0f2fe;letter-spacing:0.08em;text-transform:uppercase;">
                  ${isZh ? `全球资本治理与机构级清算 · 创立于 ${esc(company.establishedYear || '2018')}` : `CAPITAL GOVERNANCE & CLEARING RAILS · EST. ${esc(company.establishedYear || '2018')}`}
                </span>
              </div>
              <h1 style="font-size:clamp(2.3rem, 4.2vw, 3.6rem);line-height:1.14;font-weight:900;letter-spacing:-0.03em;color:#ffffff;margin:0 0 20px;">
                ${esc(headline)}
              </h1>
              <div style="color:#94a3b8;font-size:1.1rem;line-height:1.75;display:flex;flex-direction:column;gap:14px;margin-bottom:28px;">
                ${paras.map(p => `<p style="margin:0;">${esc(p)}</p>`).join('')}
              </div>
              <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#ffffff;font-weight:800;padding:16px 36px;border-radius:8px;font-size:0.95rem;text-decoration:none;box-shadow:0 0 24px rgba(2,132,199,0.4);display:inline-block;">
                  ${isZh ? '预约机构合规闭门简报 ↗' : 'Request Private Institutional Briefing ↗'}
                </a>
                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);padding:14px 22px;border-radius:8px;font-size:0.85rem;color:#cbd5e1;display:flex;align-items:center;gap:8px;">
                  🛡️ <span>FINCEN REG: #31000214891</span>
                </div>
              </div>
            </div>

            <!-- Right: Cryptographic Vault & Telemetry SVG (Anti-blank) -->
            <div data-reveal="fade-up">
              <div class="wr-card-hover" style="border:1px solid rgba(56,189,248,0.3);border-radius:24px;overflow:hidden;position:relative;background:#08101f;box-shadow:0 0 45px rgba(2,132,199,0.15);min-height:360px;">
                <!-- Vector Cryptographic Vault SVG -->
                <svg viewBox="0 0 460 320" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;min-height:360px;object-fit:cover;display:block;">
                  <defs>
                    <radialGradient id="vaultGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3"/>
                      <stop offset="100%" stop-color="#070f1e" stop-opacity="0"/>
                    </radialGradient>
                  </defs>
                  <rect width="460" height="320" fill="#08101f"/>
                  <circle cx="230" cy="150" r="130" fill="url(#vaultGlow)"/>
                  <rect x="0" y="0" width="460" height="36" fill="#0f1b33" stroke="rgba(56,189,248,0.2)"/>
                  <rect x="18" y="11" width="85" height="14" rx="3" fill="rgba(56,189,248,0.15)"/>
                  <text x="60" y="22" fill="#38bdf8" font-family="monospace" font-size="9" text-anchor="middle">HSM ENCLAVE</text>
                  <text x="385" y="23" fill="#64748b" font-family="monospace" font-size="10">SECURITY LEVEL 3</text>
                  <!-- Central Vault Ring -->
                  <circle cx="230" cy="150" r="85" stroke="#1e293b" stroke-width="8"/>
                  <circle cx="230" cy="150" r="75" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 4"/>
                  <circle cx="230" cy="150" r="50" fill="#0c172b" stroke="#0284c7" stroke-width="3"/>
                  <path d="M220 135 L240 135 L245 152 L230 168 L215 152 Z" fill="#38bdf8" opacity="0.9"/>
                  <circle cx="230" cy="142" r="4" fill="#08101f"/>
                  <!-- Bolts -->
                  <rect x="226" y="55" width="8" height="18" rx="2" fill="#38bdf8"/>
                  <rect x="226" y="227" width="8" height="18" rx="2" fill="#38bdf8"/>
                  <rect x="135" y="146" width="18" height="8" rx="2" fill="#38bdf8"/>
                  <rect x="307" y="146" width="18" height="8" rx="2" fill="#38bdf8"/>
                  <!-- Telemetry cards -->
                  <g transform="translate(25, 75)">
                    <rect width="115" height="44" rx="8" fill="rgba(15,27,51,0.9)" stroke="rgba(56,189,248,0.3)"/>
                    <text x="12" y="18" fill="#64748b" font-family="monospace" font-size="8">CLEARING RAIL</text>
                    <text x="12" y="34" fill="#38bdf8" font-family="monospace" font-weight="bold" font-size="11">FEDNOW STP</text>
                  </g>
                  <g transform="translate(25, 175)">
                    <rect width="115" height="44" rx="8" fill="rgba(15,27,51,0.9)" stroke="rgba(56,189,248,0.3)"/>
                    <text x="12" y="18" fill="#64748b" font-family="monospace" font-size="8">SWIFT ROUTE</text>
                    <text x="12" y="34" fill="#10b981" font-family="monospace" font-weight="bold" font-size="11">ISO 20022 ✓</text>
                  </g>
                  <g transform="translate(320, 75)">
                    <rect width="115" height="44" rx="8" fill="rgba(15,27,51,0.9)" stroke="rgba(245,158,11,0.3)"/>
                    <text x="12" y="18" fill="#64748b" font-family="monospace" font-size="8">MULTI-SIG CONSENSUS</text>
                    <text x="12" y="34" fill="#f59e0b" font-family="monospace" font-weight="bold" font-size="11">5 OF 7 QUORUM</text>
                  </g>
                  <g transform="translate(320, 175)">
                    <rect width="115" height="44" rx="8" fill="rgba(15,27,51,0.9)" stroke="rgba(56,189,248,0.3)"/>
                    <text x="12" y="18" fill="#64748b" font-family="monospace" font-size="8">AML INTEGRITY</text>
                    <text x="12" y="34" fill="#38bdf8" font-family="monospace" font-weight="bold" font-size="11">0.00% SANCTION</text>
                  </g>
                  <!-- Bottom Ribbon -->
                  <rect x="25" y="265" width="410" height="34" rx="8" fill="rgba(2,132,199,0.12)" stroke="rgba(56,189,248,0.25)"/>
                  <circle cx="45" cy="282" r="4" fill="#38bdf8"/>
                  <text x="58" y="286" fill="#e0f2fe" font-family="monospace" font-size="10">TREASURY ASSETS VERIFIED // FIPS 140-2 LEVEL 3 LOCK ENGAGED</text>
                </svg>

                ${aboutImg ? `
                  <img src="${esc(aboutImg)}" alt="${esc(company.name)}" onerror="this.style.display='none'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" loading="lazy">
                ` : ''}

                <!-- Corner Live Fiduciary Pill -->
                <div style="position:absolute;top:44px;right:16px;background:rgba(7,15,30,0.85);border:1px solid rgba(56,189,248,0.4);border-radius:6px;padding:4px 12px;display:flex;align-items:center;gap:6px;">
                  <span style="width:6px;height:6px;border-radius:50%;background:#38bdf8;box-shadow:0 0 6px #38bdf8;"></span>
                  <span style="font-size:0.75rem;font-family:monospace;color:#e0f2fe;">VAULT ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. CAPITAL METRICS INDEX -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:44px 24px 28px;" data-reveal="fade-up">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
          ${stats.map((s, idx) => `
            <div class="wr-card-hover" style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.2);border-top:4px solid #0284c7;border-radius:14px;padding:30px 24px;box-shadow:0 8px 30px rgba(0,0,0,0.3);backdrop-filter:blur(10px);">
              <div style="font-size:clamp(2.4rem, 3.8vw, 3rem);font-weight:900;color:#38bdf8;letter-spacing:-1px;margin-bottom:8px;font-family:monospace;">
                <span data-counter="${s.num}" ${s.prefix ? `data-prefix="${esc(s.prefix)}"` : ''} ${s.suffix ? `data-suffix="${esc(s.suffix)}"` : ''}>
                  ${esc(s.value)}
                </span>
              </div>
              <div style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:6px;">${esc(s.label)}</div>
              ${s.desc ? `<div style="font-size:0.86rem;color:#94a3b8;line-height:1.5;">${esc(s.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 3. TRI-FOLD SOVEREIGN INFRASTRUCTURE -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:40px 24px 60px;" data-reveal="fade-up">
        <div style="text-align:center;max-width:760px;margin:0 auto 48px;">
          <span style="font-size:0.82rem;font-weight:800;letter-spacing:0.12em;color:#38bdf8;text-transform:uppercase;">
            ${isZh ? '受托治理与资本安全' : 'SOVEREIGN FIDUCIARY ARCHITECTURE'}
          </span>
          <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);font-weight:900;color:#ffffff;margin:8px 0 12px;">
            ${isZh ? '三大跨国资本支柱：消除汇率敞口与清算摩擦' : 'Three Pillars of Cross-Border Capital Governance'}
          </h2>
          <p style="color:#94a3b8;font-size:1.05rem;line-height:1.6;margin:0;">
            ${isZh ? '专为应对跨国资金池归集、流动性自动平衡与严苛穿透式审计而设计。' : 'Engineered for global treasurers and sovereign institutions to achieve absolute liquidity predictability.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:28px;">
          <!-- Pillar 1 -->
          <div class="wr-card-hover" style="background:#0b1528;border:1px solid rgba(56,189,248,0.25);border-radius:18px;padding:34px;">
            <div style="font-size:2rem;margin-bottom:14px;">🏛️</div>
            <h3 style="font-size:1.35rem;font-weight:800;color:#ffffff;margin:0 0 10px;">${isZh ? '硬件级金库与私钥隔离' : 'HSM Enclave Custody'}</h3>
            <p style="color:#94a3b8;font-size:0.92rem;line-height:1.65;margin:0 0 18px;">${isZh ? '部署 FIPS 140-2 Level 3 认证硬件加密机，支持 MPC 门限多签与冷热多维隔离，彻底杜绝单点被盗风险。' : 'FIPS 140-2 Level 3 certified hardware security modules with MPC threshold multi-sig for sovereign root key isolation.'}</p>
            <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;font-size:0.8rem;color:#38bdf8;font-weight:700;">// FIPS 140-2 LEVEL 3 ASSURED</div>
          </div>

          <!-- Pillar 2 -->
          <div class="wr-card-hover" style="background:#0b1528;border:1px solid rgba(56,189,248,0.25);border-radius:18px;padding:34px;">
            <div style="font-size:2rem;margin-bottom:14px;">⚡</div>
            <h3 style="font-size:1.35rem;font-weight:800;color:#ffffff;margin:0 0 10px;">${isZh ? '算法驱动自动外汇对冲' : 'Algorithmic FX Execution'}</h3>
            <p style="color:#94a3b8;font-size:0.92rem;line-height:1.65;margin:0 0 18px;">${isZh ? '穿透连接全球一级外汇做市商，毫秒级比价与自动触发跨币种套期保值，将企业资金兑换滑点压缩至极限。' : 'Sub-second interbank order routing capturing optimized bid-ask spreads across global corridors with automated sweeps.'}</p>
            <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;font-size:0.8rem;color:#38bdf8;font-weight:700;">// SUB-SECOND STRAIGHT-THROUGH</div>
          </div>

          <!-- Pillar 3 -->
          <div class="wr-card-hover" style="background:#0b1528;border:1px solid rgba(56,189,248,0.25);border-radius:18px;padding:34px;">
            <div style="font-size:2rem;margin-bottom:14px;">⚖️</div>
            <h3 style="font-size:1.35rem;font-weight:800;color:#ffffff;margin:0 0 10px;">${isZh ? '穿透式全球反洗钱监控' : 'Continuous AML Graph'}</h3>
            <p style="color:#94a3b8;font-size:0.92rem;line-height:1.65;margin:0 0 18px;">${isZh ? '秒级核验 OFAC、联合国及欧盟制裁黑名单，通过资金拓扑图谱动态拦截可疑链条，确保 100% 监管合规。' : 'Continuous sanctions screening across international statutory registries with transaction graph verification.'}</p>
            <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;font-size:0.8rem;color:#38bdf8;font-weight:700;">// 140+ JURISDICTIONS COMPLIANT</div>
          </div>
        </div>
      </section>

      <!-- 4. STATUTORY ACCREDITATION MATRIX -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:0 24px 60px;" data-reveal="fade-up">
        <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.25);border-radius:18px;padding:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;">
          <div>
            <span style="color:#38bdf8;font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">STATUTORY & FIDUCIARY ACCREDITATIONS</span>
            <div style="color:#ffffff;font-size:1.05rem;font-weight:800;margin-top:4px;">
              ${esc(company.certifications || 'SOC 1 & SOC 2 Type II · ISO/IEC 27001 · PCI-DSS Level 1 · FinCEN MSB · SWIFT Network Member')}
            </div>
          </div>
          <div style="display:flex;gap:12px;font-family:monospace;font-size:0.82rem;color:#cbd5e1;">
            <span style="border:1px solid rgba(56,189,248,0.3);padding:8px 16px;border-radius:6px;background:rgba(56,189,248,0.06);">SOC 2 TYPE II</span>
            <span style="border:1px solid rgba(56,189,248,0.3);padding:8px 16px;border-radius:6px;background:rgba(56,189,248,0.06);">PCI-DSS L1</span>
            <span style="border:1px solid rgba(56,189,248,0.3);padding:8px 16px;border-radius:6px;background:rgba(56,189,248,0.06);">ISO 27001</span>
          </div>
        </div>
      </section>

      <!-- 5. PRIVATE FIDUCIARY BRIEFING CTA -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:0 24px;" data-reveal="fade-up">
        <div style="background:linear-gradient(135deg, #0a1628 0%, #070f1e 100%);border:1px solid rgba(56,189,248,0.35);border-radius:24px;padding:50px 36px;text-align:center;box-shadow:0 0 50px rgba(2,132,199,0.18);">
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(2,132,199,0.18);border:1px solid rgba(56,189,248,0.4);padding:6px 16px;border-radius:9999px;color:#e0f2fe;font-size:0.82rem;font-weight:800;margin-bottom:16px;">
            🔒 INSTITUTIONAL PRIVACY ASSURED
          </div>
          <h2 style="font-size:clamp(1.9rem, 3.4vw, 2.7rem);color:#ffffff;font-weight:900;margin:0 0 14px;">
            ${isZh ? '开启企业跨国财资清算架构评估' : 'Schedule Private Institutional Briefing'}
          </h2>
          <p style="color:#94a3b8;max-width:620px;margin:0 auto 30px;font-size:1.1rem;line-height:1.65;">
            ${isZh ? '预约资深金融合规专家与司库架构师，获取定制化资金跨境清算路由方案与流动性测算报告。' : 'Request a confidential consultation to review multi-currency liquidity corridors and integration timelines.'}
          </p>
          <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
            <a class="button" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#ffffff;font-weight:800;border-radius:8px;padding:17px 38px;display:inline-block;text-decoration:none;box-shadow:0 0 24px rgba(2,132,199,0.4);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
              ${isZh ? '预约机构合规闭门简报 ↗' : 'Request Private Briefing ↗'}
            </a>
            <a class="button" style="background:rgba(255,255,255,0.06);color:#ffffff;border:1px solid rgba(255,255,255,0.2);font-weight:800;border-radius:8px;padding:17px 32px;display:inline-block;text-decoration:none;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
              ${isZh ? '查阅机构产品与服务矩阵 →' : 'Explore Institutional Services →'}
            </a>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderFintechAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyFintechAbout(ctx);
  }
  return renderModernFintechAbout(ctx);
}

export function renderFintechContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="fintech-inner-hero" style="background:linear-gradient(135deg,#091322 0%,#0f172a 60%,#1e293b 100%);color:#ffffff;padding:70px 0 50px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(2,132,199,0.15);border:1px solid rgba(56,189,248,0.35);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="font-size:0.82rem;font-weight:700;color:#e0f2fe;letter-spacing:0.06em;">INSTITUTIONAL ADVISORY DESK</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4rem);line-height:1.12;font-weight:800;letter-spacing:-0.03em;margin:0 0 20px;color:#ffffff;">
          ${esc(ui.conversation || 'Engage Our Treasury Specialists')}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#94a3b8;margin:0;">
          ${esc(ui.contactIntro || 'Initiate discussions regarding cross-border liquidity corridors, institutional onboarding, or bespoke API settlement rails.')}
        </p>
      </div>
    </section>
  `;

  const contactContentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div class="contact-layout" style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: Desks & Info -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <span class="eyebrow" style="color:#0284c7;font-weight:700;">DIRECT ACCESS CHANNELS</span>
          <h3 style="color:#0f172a;font-size:1.4rem;margin:8px 0 24px;">Global Treasury Desks</h3>

          <div style="display:flex;flex-direction:column;gap:20px;color:#475569;font-size:0.95rem;">
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:#0284c7;text-transform:uppercase;margin-bottom:4px;">Institutional Enquiries</div>
              <a style="color:#0f172a;font-weight:600;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#0284c7;text-transform:uppercase;margin-bottom:4px;">Global Capital Hotline</div>
                <a style="color:#0f172a;font-weight:600;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#0284c7;text-transform:uppercase;margin-bottom:4px;">Secure WhatsApp Channel</div>
                <a style="color:#0284c7;font-weight:600;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Chat Now ↗)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#0284c7;text-transform:uppercase;margin-bottom:4px;">Corporate Headquarters</div>
                <span style="color:#334155;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;padding:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="font-size:0.85rem;color:#64748b;line-height:1.5;">
              <strong style="color:#0f172a;">Regional Timezone Desks:</strong> London (GMT), New York (EST), Singapore (SGT). Inquiries typically acknowledged within 2 business hours.
            </div>
          </div>
        </div>

        <!-- Right: Inquiry Form -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <h2 style="color:#0f172a;font-size:1.6rem;margin:0 0 8px;">Request Institutional Briefing</h2>
          <p style="color:#64748b;font-size:0.95rem;margin:0 0 28px;">Specify your company capital scope, monthly volume, or technical settlement rail requirements.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.name)} <span style="color:#0284c7;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#0f172a;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.email)} <span style="color:#0284c7;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#0f172a;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#0f172a;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#0f172a;font:inherit;">
                <option value="">— Select Target Treasury Solution —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.message)} <span style="color:#0284c7;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Projected settlement volume, currencies required, and regulatory jurisdictions..." style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#0f172a;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#0284c7;color:#ffffff;font-weight:700;border-radius:8px;padding:14px 32px;border:none;cursor:pointer;font-size:1rem;">
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
    <section class="wrap" style="padding:40px 0 80px;border-top:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#0284c7;font-weight:700;">FREQUENTLY ASKED QUESTIONS</span>
        <h2 style="font-size:2.2rem;color:#0f172a;margin:10px 0;">Onboarding & Compliance FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
          <h3 style="color:#0f172a;font-size:1.15rem;margin:0 0 8px;">What is the institutional onboarding timeline?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Corporate verification and initial clearing sandbox setup typically complete in 2 to 4 business days upon document submission.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
          <h3 style="color:#0f172a;font-size:1.15rem;margin:0 0 8px;">How are client assets and balances legally segregated?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">All client accounts are held in bankruptcy-remote trust and custodial accounts with Tier-1 clearing institutions under strict fiduciary mandates.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
          <h3 style="color:#0f172a;font-size:1.15rem;margin:0 0 8px;">Do you support automated ERP accounting reconciliation?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Yes. Native real-time webhooks and standardized ISO 20022 XML statements integrate seamlessly into SAP, NetSuite, and Oracle Financials.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contactContentHtml}${faqHtml}`;
}

export function renderFintechCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="fintech-inner-hero" style="background:linear-gradient(135deg,#091322 0%,#0f172a 60%,#1e293b 100%);color:#ffffff;padding:70px 0 50px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(2,132,199,0.15);border:1px solid rgba(56,189,248,0.35);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="font-size:0.82rem;font-weight:700;color:#e0f2fe;letter-spacing:0.06em;">SOLUTIONS DIRECTORY</span>
        </div>
        <h1 style="font-size:clamp(2.4rem,4.8vw,4rem);line-height:1.12;font-weight:800;letter-spacing:-0.03em;margin:0 0 20px;color:#ffffff;">
          ${esc(ui.catalog || 'Financial Solution Suite')}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#94a3b8;margin:0;">
          Explore institutional liquidity corridors, multi-currency treasury automation, and fiduciary compliance modules.
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
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#f1f5f9;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="padding:32px 24px 16px;font-size:2.4rem;">🏛️</div>
              `}
              <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
                <h3 style="margin:0 0 10px;font-size:1.3rem;color:#0f172a;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#0f172a;text-decoration:none;">
                    ${esc(t.name)}
                  </a>
                </h3>
                <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                  ${esc(t.description || 'Institutional treasury management and settlement rail component.')}
                </p>
                <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:16px;margin-top:auto;">
                  <span style="font-size:0.85rem;color:#0284c7;font-weight:700;">Institutional Ready</span>
                  <a style="color:#0284c7;font-weight:700;font-size:0.9rem;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
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

export function renderFintechDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset, options } = ctx;
  const p = draft.products.find(item => item.id === options.productId) || draft.products[0];
  if (!p) {
    return `<section class="wrap" style="padding:80px 0;"><h1>${esc(ui.noProducts || 'Solution Not Found')}</h1></section>`;
  }

  const t = translateProduct(p);
  const imgUrl = asset(p.imageAssetId);
  const related = draft.products.filter(item => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <!-- Top Breadcrumb & Solution Header -->
    <section class="fintech-inner-hero" style="background:linear-gradient(135deg,#091322 0%,#0f172a 60%,#1e293b 100%);color:#ffffff;padding:50px 0 40px;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.9rem;color:#94a3b8;margin-bottom:16px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#94a3b8;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#94a3b8;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#38bdf8;">${esc(t.name)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(2,132,199,0.18);border:1px solid rgba(56,189,248,0.35);color:#38bdf8;padding:4px 14px;border-radius:999px;font-size:0.8rem;font-weight:700;margin-bottom:12px;">
              <span style="width:7px;height:7px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;"></span>
              INSTITUTIONAL FINANCIAL SPECIFICATION
            </div>
            <h1 style="font-size:clamp(2.2rem,4vw,3.4rem);line-height:1.15;font-weight:800;letter-spacing:-0.02em;margin:0;color:#ffffff;">
              ${esc(t.name)}
            </h1>
          </div>
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:12px 20px;text-align:right;">
            <div style="color:#94a3b8;font-size:0.8rem;text-transform:uppercase;font-weight:700;">Regulatory Status</div>
            <div style="color:#38bdf8;font-weight:800;font-size:1.05rem;">Tier-1 Segregated / Audited</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Showcase: Col 1 Preview & Compliance, Col 2 Specs & Dynamic Progress Bars -->
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:48px;align-items:start;">
        <!-- Left Col: Preview Card -->
        <div>
          <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;padding:32px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.04);">
            ${imgUrl ? `
              <img id="detailMainImg" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:contain;border-radius:12px;">
            ` : `
              <div style="padding:70px 24px;text-align:center;font-size:5rem;">🏛️</div>
            `}
          </div>

          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <span style="background:#f0f9ff;border:1px solid #bae6fd;color:#0284c7;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:700;">✓ ISO 27001 Certified</span>
            <span style="background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:700;">✓ SWIFT / SEPA Direct</span>
            <span style="background:#faf5ff;border:1px solid #e9d5ff;color:#9333ea;padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:700;">✓ Real-Time Hedging</span>
          </div>
        </div>

        <!-- Right Col: Narrative, Progress Bars, Parameters -->
        <div>
          <h2 style="color:#0f172a;font-size:1.8rem;font-weight:800;margin:0 0 16px;">System Scope & Compliance</h2>
          <p style="font-size:1.15rem;line-height:1.75;color:#475569;margin:0 0 28px;">
            ${esc(t.description || 'Enterprise-grade treasury management module delivering deterministic latency, continuous multi-currency reconciliation, and sovereign regulatory compliance.')}
          </p>

          <!-- Dynamic Performance & SLA Progress Bars -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:26px;margin-bottom:28px;">
            <h3 style="color:#0f172a;font-size:1.05rem;font-weight:800;margin:0 0 18px;display:flex;align-items:center;gap:8px;">
              <span style="color:#0284c7;">📈</span> Financial Performance & Security Metrics
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#1e293b;margin-bottom:6px;">
                  <span>Clearing Latency SLA (&lt; 15ms)</span>
                  <span style="color:#0284c7;">99.8% Sub-15ms</span>
                </div>
                <div class="wr-progress-container" style="background:#e2e8f0;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#0284c7,#38bdf8);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#1e293b;margin-bottom:6px;">
                  <span>Cryptographic Vault Security (AES-256)</span>
                  <span style="color:#10b981;">100% HSM Isolated</span>
                </div>
                <div class="wr-progress-container" style="background:#e2e8f0;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#059669,#34d399);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#1e293b;margin-bottom:6px;">
                  <span>Multi-Jurisdiction Compliance</span>
                  <span style="color:#8b5cf6;">98% Automation</span>
                </div>
                <div class="wr-progress-container" style="background:#e2e8f0;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="98" style="background:linear-gradient(90deg,#7c3aed,#a78bfa);height:100%;border-radius:99px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Parameters Box -->
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:32px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
            <h3 style="color:#0f172a;font-size:1.05rem;font-weight:800;margin:0 0 16px;">Core System Parameters</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                <span style="color:#64748b;">Regulatory Classification</span>
                <span style="color:#0f172a;font-weight:600;">${esc(p.material || 'Tier-1 Regulated Treasury Asset')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                <span style="color:#64748b;">Clearing Throughput</span>
                <span style="color:#0f172a;font-weight:600;">${esc(p.dimensions || '25,000 tx/sec')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                <span style="color:#64748b;">Custodial Protection</span>
                <span style="color:#0284c7;font-weight:600;">Dedicated Segregated Trust</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Audit Frequency</span>
                <span style="color:#0f172a;font-weight:600;">Continuous Real-Time Telemetry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Institutional Architecture Pillars -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;" data-reveal="fade-up">
        <span style="color:#0284c7;font-size:0.85rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">ENTERPRISE ARCHITECTURE</span>
        <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#0f172a;font-weight:800;margin:8px 0 12px;">Institutional-Grade Capital Security</h2>
        <p style="color:#64748b;font-size:1.05rem;line-height:1.6;margin:0;">Purpose-built for multinational enterprises managing multi-currency treasury positions.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="width:52px;height:52px;border-radius:12px;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">🏛️</div>
          <h3 style="color:#0f172a;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Immutable Ledger Matching</h3>
          <p style="color:#64748b;font-size:0.95rem;line-height:1.6;margin:0;">Dual-entry cryptographic balance checking ensuring tamper-proof transaction verification across all connected accounts.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="width:52px;height:52px;border-radius:12px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">⚡</div>
          <h3 style="color:#0f172a;font-size:1.2rem;font-weight:800;margin:0 0 10px;">High-Frequency Clearing</h3>
          <p style="color:#64748b;font-size:0.95rem;line-height:1.6;margin:0;">Ultra-low latency settlement pipeline enabling cross-border wholesale transfers in seconds rather than business days.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="width:52px;height:52px;border-radius:12px;background:#f3e8ff;color:#9333ea;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">🛡️</div>
          <h3 style="color:#0f172a;font-size:1.2rem;font-weight:800;margin:0 0 10px;">Dynamic Liquidity Monitoring</h3>
          <p style="color:#64748b;font-size:0.95rem;line-height:1.6;margin:0;">Predictive machine learning models simulate cash-flow exposures and trigger automated currency balance rebalancing.</p>
        </div>
      </div>
    </section>

    <!-- Institutional Advisory Form -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="background:#0f172a;color:#ffffff;border-radius:24px;padding:40px;display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;">
        <div>
          <span style="color:#38bdf8;font-size:0.85rem;font-weight:800;text-transform:uppercase;">INSTITUTIONAL ENGAGEMENT</span>
          <h2 style="color:#ffffff;font-size:1.8rem;font-weight:800;margin:8px 0 12px;">Inquire About ${esc(t.name)}</h2>
          <p style="color:#94a3b8;font-size:1rem;line-height:1.6;margin:0 0 24px;">
            Connect directly with an institutional treasury specialist to configure your corporate liquidity settlement pipeline.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;color:#cbd5e1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#38bdf8;">✓</span> Dedicated Relationship Director & Compliance Officer
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#38bdf8;">✓</span> Custom Interbank FX Pricing Matrices
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#38bdf8;">✓</span> API Sandbox Access with SWIFT MT/MX Format Testbeds
            </div>
          </div>
          ${waDigits ? `
            <div style="margin-top:28px;">
              <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:0.95rem;">
                <span>WhatsApp Private Advisory ↗</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#94a3b8;font-size:0.85rem;font-weight:600;">Selected Solution</label>
              <input name="productName" value="${esc(t.name)}" readonly style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#38bdf8;font:inherit;font-weight:700;">
              <input type="hidden" name="productId" value="${esc(p.id)}">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.name)} <span style="color:#38bdf8;">*</span></label>
              <input name="name" required placeholder="Authorized representative" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.email)} <span style="color:#38bdf8;">*</span></label>
              <input name="email" type="email" required placeholder="corporate@enterprise.com" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">${esc(ui.company || 'Institution')} <span style="color:#38bdf8;">*</span></label>
              <input name="company" required placeholder="Institutional legal name" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Monthly Treasury Volume</label>
              <input name="quantity" placeholder="e.g. $10M+ / month" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Specific Jurisdiction / Clearing Needs</label>
              <textarea name="message" rows="3" placeholder="Outline your payment rails, currencies, or settlement timeframe requirements..." style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#ffffff;font:inherit;resize:vertical;"></textarea>
            </div>
            <div style="grid-column:1 / -1;margin-top:6px;">
              <button type="submit" class="button" style="width:100%;background:#0284c7;color:#ffffff;font-weight:800;border-radius:8px;padding:14px;font-size:1rem;border:none;cursor:pointer;">
                ${esc(ui.inquire || 'Request Institutional Scoping')} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:10px 0 0;font-size:0.85rem;text-align:center;color:#94a3b8;"></p>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Related Financial Solutions -->
    ${related.length > 0 ? `
      <section class="wrap" style="padding:20px 0 80px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="font-size:1.6rem;color:#0f172a;font-weight:800;margin:0;">Related Institutional Capabilities</h2>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#0284c7;font-weight:700;text-decoration:none;font-size:0.95rem;">
            ${esc(ui.allProducts)} ↗
          </a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          ${related.map(item => {
            const it = translateProduct(item);
            const itemImg = asset(item.imageAssetId);
            return `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
                ${itemImg ? `
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;aspect-ratio:16/9;background:#f8fafc;overflow:hidden;">
                    <img src="${esc(itemImg)}" alt="${esc(it.name)}" style="width:100%;height:100%;object-fit:cover;">
                  </a>
                ` : `
                  <div style="padding:28px;text-align:center;font-size:2.5rem;background:#f8fafc;">🏛️</div>
                `}
                <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                  <h4 style="font-size:1.1rem;font-weight:800;margin:0 0 8px;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#0f172a;text-decoration:none;">
                      ${esc(it.name)}
                    </a>
                  </h4>
                  <p style="color:#64748b;font-size:0.88rem;line-height:1.5;margin:0 0 16px;flex:1;">
                    ${esc(it.description || 'Institutional-grade corporate financial infrastructure.')}
                  </p>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#0284c7;font-weight:700;font-size:0.88rem;text-decoration:none;margin-top:auto;">
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
