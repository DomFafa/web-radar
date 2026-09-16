import { esc, type ThemeContext } from './types';

export function renderAccountingHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Certified Accounting, Global Tax & Corporate Advisory',
    subtitle: 'Strategic wealth management, cross-border corporate structuring, and rigorous tax compliance for high-net-worth entities and expanding enterprises.',
    about: 'With over two decades of accredited excellence, our certified public accountants and tax attorneys provide bulletproof compliance, proactive wealth preservation, and transparent financial stewardship.',
    cta: 'Schedule Free Tax Consultation',
  };

  // 1. Top Alert / Office Bar
  const topBarHtml = `
    <div style="background:#2b2b2b;color:#fdf1f3;padding:8px 0;font-size:0.8rem;border-bottom:1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <span>📞 Toll-Free Advisory: <strong style="color:#ffffff;">+1 (800) 428-CPAS</strong></span>
          <span style="opacity:0.6;">|</span>
          <span>✉ Direct: <strong style="color:#ffffff;">${esc(company.email)}</strong></span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="color:#d90a2c;font-weight:700;">●</span>
          <span>IRS Enrolled Agents & Licensed CPAs on Duty</span>
        </div>
      </div>
    </div>
  `;

  // 2. Hero Section
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:linear-gradient(135deg,#1f2421 0%,#2b2b2b 60%,#383838 100%);color:#ffffff;padding:90px 0 85px;position:relative;overflow:hidden;">
      <div class="wrap hero-content" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(217,10,44,0.12);border:1px solid #d90a2c;padding:6px 18px;border-radius:4px;margin-bottom:24px;width:fit-content;">
          <span style="font-size:0.8rem;font-weight:700;color:#fdf1f3;letter-spacing:0.1em;text-transform:uppercase;">PORTO CHARTERED ADVISORY · EST. 1998</span>
        </div>
        <h1 class="hero-title" style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.8rem, 5.5vw, 4.8rem);line-height:1.1;font-weight:600;letter-spacing:-0.02em;max-width:880px;margin:0 0 24px;">
          ${esc(copy.headline)}
        </h1>
        <p style="max-width:650px;color:#d1d5db;font-size:1.18rem;line-height:1.7;margin:0 0 36px;">
          ${esc(copy.subtitle)}
        </p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <a class="button" style="background:#d90a2c;color:#ffffff;font-weight:700;border-radius:4px;padding:15px 32px;letter-spacing:0.04em;text-transform:uppercase;font-size:0.88rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Schedule Consultation')} ↗
          </a>
          <a class="button" style="background:rgba(255,255,255,0.08);color:#ffffff;border:1px solid rgba(255,255,255,0.25);border-radius:4px;padding:15px 28px;text-transform:uppercase;font-size:0.88rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Practice Areas →
          </a>
        </div>

        <div style="margin-top:45px;display:flex;gap:36px;flex-wrap:wrap;color:#e5e7eb;font-size:0.88rem;">
          <div><strong style="color:#d90a2c;font-size:1.1rem;">25+</strong> Years of Client Trust</div>
          <div><strong style="color:#d90a2c;font-size:1.1rem;">99.8%</strong> Clean Audit Rate</div>
          <div><strong style="color:#d90a2c;font-size:1.1rem;">$850M+</strong> Managed Advisory Volume</div>
        </div>
      </div>
    </section>
  `;

  // 3. Stats & Credential Counters
  const statsHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;">$850M+</div>
          <div style="font-weight:700;color:#2b2b2b;margin-top:6px;font-size:1rem;">Assets Under Tax Advisory</div>
          <div style="font-size:0.85rem;color:#666666;margin-top:4px;line-height:1.5;">Protecting corporate treasuries and high-net-worth multi-generational family offices.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;">120+</div>
          <div style="font-weight:700;color:#2b2b2b;margin-top:6px;font-size:1rem;">CPAs & Accredited Attorneys</div>
          <div style="font-size:0.85rem;color:#666666;margin-top:4px;line-height:1.5;">Senior Big-4 alumni with specialized forensic, cross-border, and M&A experience.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;">99.8%</div>
          <div style="font-weight:700;color:#2b2b2b;margin-top:6px;font-size:1rem;">Audit Defense Success</div>
          <div style="font-size:0.85rem;color:#666666;margin-top:4px;line-height:1.5;">Rigorous documentation standards with zero unmitigated penalties across 25 years.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;">100%</div>
          <div style="font-weight:700;color:#2b2b2b;margin-top:6px;font-size:1rem;">Transparent Retainers</div>
          <div style="font-size:0.85rem;color:#666666;margin-top:4px;line-height:1.5;">Predictable monthly flat billing with zero surprise hourly overage surcharges.</div>
        </div>
      </div>
    </section>
  `;

  // 4. Practice Areas (Products)
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" style="margin-bottom:36px;">
        <div>
          <span class="eyebrow" style="color:#d90a2c;font-weight:700;">Excellence in Practice</span>
          <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#2b2b2b;">Comprehensive Accounting &amp; Fiduciary Services</h2>
        </div>
        <a class="text-link" style="color:#d90a2c;font-weight:700;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = asset(p.imageAssetId);
          const icons = ['📑', '⚖️', '💼', '📊', '🏛️', '🔍'];
          return `
            <article class="product-card" style="background:#ffffff;border:1px solid #e8d8d9;border-top:4px solid #d90a2c;border-radius:4px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div>
                <div style="font-size:2rem;margin-bottom:14px;">${icons[idx % icons.length]}</div>
                ${imgUrl ? `<div class="product-image" style="border-radius:4px;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="font-family:'Playfair Display',Georgia,serif;color:#2b2b2b;margin:0 0 10px;font-size:1.35rem;font-weight:600;">${esc(t.name)}</h3>
                <p style="color:#666666;line-height:1.65;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Comprehensive financial stewardship and corporate advisory practice.')}</p>
              </div>
              <div style="border-top:1px solid #f3e8e8;padding-top:14px;margin-top:auto;">
                <a class="text-link" style="color:#d90a2c;font-weight:700;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  Consult Practice Specialist →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 5. Why Choose Us / Advisory Pillars
  const whyChooseHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e8d8d9;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#d90a2c;font-weight:700;">WHY PORTO ADVISORY</span>
          <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;line-height:1.18;color:#2b2b2b;margin:12px 0 20px;">
            A Fiduciary Commitment Built on Rigorous Accuracy
          </h2>
          <p style="color:#555555;font-size:1.05rem;line-height:1.75;margin-bottom:28px;">
            In today's shifting regulatory landscape, standard bookkeeping is insufficient. We take a proactive, multi-jurisdictional approach to safeguard your earnings and maintain unassailable compliance with IRS, state, and international tax treaties.
          </p>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="border-left:3px solid #d90a2c;padding-left:16px;">
              <strong style="color:#2b2b2b;font-size:1rem;">Proactive Tax Planning</strong>
              <div style="color:#666666;font-size:0.88rem;margin-top:2px;">Quarterly structure reviews identifying credits, deductions, and cross-border exemptions before tax year closing.</div>
            </div>
            <div style="border-left:3px solid #d90a2c;padding-left:16px;">
              <strong style="color:#2b2b2b;font-size:1rem;">Forensic & Audit Defense Guarantee</strong>
              <div style="color:#666666;font-size:0.88rem;margin-top:2px;">Our licensed attorneys stand between you and regulatory examiners, managing every inquiry with full legal representation.</div>
            </div>
            <div style="border-left:3px solid #d90a2c;padding-left:16px;">
              <strong style="color:#2b2b2b;font-size:1rem;">Real-Time Financial Dashboard</strong>
              <div style="color:#666666;font-size:0.88rem;margin-top:2px;">Secure cloud portal providing instant balance sheet views, cashflow forecasts, and tax liability estimates anytime.</div>
            </div>
          </div>
        </div>

        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.06);">
          <div style="text-align:center;padding-bottom:20px;border-bottom:1px solid #f3e8e8;margin-bottom:24px;">
            <div style="font-size:2.5rem;margin-bottom:8px;">🏛️</div>
            <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;color:#2b2b2b;margin:0 0 6px;">Porto Partner Governance</h3>
            <div style="font-size:0.85rem;color:#666666;">Accredited by National CPA Associations</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px;font-size:0.9rem;color:#444444;">
            <div style="display:flex;justify-content:space-between;"><span>American Institute of CPAs (AICPA)</span><strong style="color:#d90a2c;">Verified</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>IRS Enrolled Agents License</span><strong style="color:#d90a2c;">Active</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>National Assoc. of State Boards (NASBA)</span><strong style="color:#d90a2c;">Accredited</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>Professional Liability Coverage</span><strong style="color:#d90a2c;">$10,000,000</strong></div>
          </div>
          <div style="margin-top:28px;text-align:center;">
            <a class="button" style="background:#2b2b2b;color:#ffffff;border-radius:4px;width:100%;text-transform:uppercase;font-size:0.85rem;font-weight:700;" href="${path('about/index.html')}" ${navAttrs('about')}>
              Meet Our Partner CPAs ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  `;

  // 6. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#d90a2c;font-weight:700;">CLIENT TESTIMONIALS</span>
        <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.1rem;color:#2b2b2b;margin:8px 0;">Trusted by Business Owners and High-Net-Worth Families</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d90a2c;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#444444;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"Their cross-border restructuring saved our manufacturing group over $1.4M in corporate taxes while remaining in full bilateral compliance."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#2b2b2b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">WK</div>
            <div><div style="font-weight:700;color:#2b2b2b;font-size:0.9rem;">William Kohler</div><div style="color:#777777;font-size:0.8rem;">Managing Director, Continental Precision AG</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d90a2c;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#444444;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"The audit representation was flawless. The Porto team handled every examiner question with poise and pristine documentation."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#d90a2c;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">CM</div>
            <div><div style="font-weight:700;color:#2b2b2b;font-size:0.9rem;">Claire Montgomery</div><div style="color:#777777;font-size:0.8rem;">Trustee, The Montgomery Family Office</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d90a2c;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#444444;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"Their flat-rate retainer gave us predictable financial overhead and dedicated CPA partner access whenever we needed it."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#4d4d4d;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">RS</div>
            <div><div style="font-weight:700;color:#2b2b2b;font-size:0.9rem;">Richard Sterling</div><div style="color:#777777;font-size:0.8rem;">CEO, Sterling Health Ventures</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 7. Contact / Advisory Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#2b2b2b;color:#ffffff;padding:80px 0;border-top:3px solid #d90a2c;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#d90a2c;font-weight:700;">PREMIER FINANCIAL COUNSEL</span>
          <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;margin:10px 0;max-width:680px;color:#ffffff;">Protect your wealth and elevate your corporate fiscal position.</h2>
          <p style="color:#cccccc;font-size:1.1rem;margin:0;max-width:550px;">Schedule a confidential diagnostic review with our senior partners today.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:#d90a2c;color:#ffffff;font-weight:700;border-radius:4px;padding:16px 36px;text-transform:uppercase;font-size:0.88rem;letter-spacing:0.04em;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Book Confidential Session ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${topBarHtml}${heroHtml}${statsHtml}${productsHtml}${whyChooseHtml}${testimonialsHtml}${contactBandHtml}`;
}
