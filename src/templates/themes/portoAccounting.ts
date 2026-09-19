import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';

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
        <a href="#stats" class="wr-scroll-down" aria-label="Scroll to content">↓</a>
      </div>
    </section>
  `;

  // 3. Stats & Credential Counters
  const statsHtml = `
    <section id="stats" class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;" data-counter="850" data-suffix="M+">$850M+</div>
          <div style="font-weight:700;color:#2b2b2b;margin-top:6px;font-size:1rem;">Assets Under Tax Advisory</div>
          <div style="font-size:0.85rem;color:#666666;margin-top:4px;line-height:1.5;">Protecting corporate treasuries and high-net-worth multi-generational family offices.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;" data-counter="120" data-suffix="+">120+</div>
          <div style="font-weight:700;color:#2b2b2b;margin-top:6px;font-size:1rem;">CPAs & Accredited Attorneys</div>
          <div style="font-size:0.85rem;color:#666666;margin-top:4px;line-height:1.5;">Senior Big-4 alumni with specialized forensic, cross-border, and M&A experience.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;" data-counter="99.8" data-suffix="%">99.8%</div>
          <div style="font-weight:700;color:#2b2b2b;margin-top:6px;font-size:1rem;">Audit Defense Success</div>
          <div style="font-size:0.85rem;color:#666666;margin-top:4px;line-height:1.5;">Rigorous documentation standards with zero unmitigated penalties across 25 years.</div>
        </div>
        <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#2b2b2b;" data-counter="100" data-suffix="%">100%</div>
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
      <div class="section-top" data-reveal="fade-up" style="margin-bottom:36px;">
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
          const imgUrl = ctx.productMainImage(p);
          const icons = ['📑', '⚖️', '💼', '📊', '🏛️', '🔍'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-top:4px solid #d90a2c;border-radius:4px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
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
        <div data-reveal="fade-up">
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

        <div class="wr-hero-float wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.06);">
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
    <section class="wrap" style="padding:60px 0;" data-reveal="fade-up">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#d90a2c;font-weight:700;">CLIENT TESTIMONIALS</span>
        <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.1rem;color:#2b2b2b;margin:8px 0;">Trusted by Business Owners and High-Net-Worth Families</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d90a2c;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#444444;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"Their cross-border restructuring saved our manufacturing group over $1.4M in corporate taxes while remaining in full bilateral compliance."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#2b2b2b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">WK</div>
            <div><div style="font-weight:700;color:#2b2b2b;font-size:0.9rem;">William Kohler</div><div style="color:#777777;font-size:0.8rem;">Managing Director, Continental Precision AG</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d90a2c;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#444444;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"The audit representation was flawless. The Porto team handled every examiner question with poise and pristine documentation."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#d90a2c;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">CM</div>
            <div><div style="font-weight:700;color:#2b2b2b;font-size:0.9rem;">Claire Montgomery</div><div style="color:#777777;font-size:0.8rem;">Trustee, The Montgomery Family Office</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
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
    <section class="contact-band" data-reveal="fade-up" style="background:#2b2b2b;color:#ffffff;padding:80px 0;border-top:3px solid #d90a2c;">
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

export function renderAccountingAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang];

  const headline = company.aboutHeadline || 'Accredited Accounting, Tax & Corporate Advisory';
  const customImg = company.aboutImageAssetId ? asset(company.aboutImageAssetId) : '';
  const customHighlights = company.aboutHighlights ? parseAboutHighlights(company.aboutHighlights) : null;
  const customStoryParas = company.aboutStory ? getAboutStoryParagraphs(company) : null;

  const aboutText = copy?.about || company.description || 'With over two decades of accredited excellence, our certified public accountants and tax attorneys provide bulletproof compliance, proactive wealth preservation, and transparent financial stewardship.';

  const heroHtml = `
    <section class="porto-inner-hero" style="background:linear-gradient(135deg,#1f2421 0%,#2b2b2b 60%,#383838 100%);color:#ffffff;padding:70px 0 50px;border-bottom:3px solid #d90a2c;">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(217,10,44,0.15);border:1px solid #d90a2c;padding:6px 18px;border-radius:4px;margin-bottom:20px;">
          <span style="font-size:0.8rem;font-weight:700;color:#fdf1f3;letter-spacing:0.1em;text-transform:uppercase;">ACCREDITED CPA PRACTICE · EST. ${esc(company.establishedYear || '1998')}</span>
        </div>
        <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.4rem,4.8vw,4.2rem);line-height:1.12;font-weight:700;letter-spacing:-0.02em;margin:0 0 20px;color:#ffffff;">
          ${esc(headline)}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#d1d5db;margin:0;">
          ${esc(copy?.subtitle || 'Strategic wealth management, cross-border corporate structuring, and rigorous tax compliance for expanding enterprises and high-net-worth families.')}
        </p>
      </div>
    </section>
  `;

  const statsHtml = customHighlights ? `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        ${customHighlights.map((h) => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <div style="font-size:2.4rem;color:#d90a2c;font-weight:800;font-family:'Playfair Display',Georgia,serif;">
              <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
              </span>
            </div>
            <div style="font-weight:700;margin-top:6px;color:#262626;font-size:1.05rem;">${esc(h.label)}</div>
            ${h.desc ? `<div style="font-size:0.88rem;color:#666666;margin-top:6px;line-height:1.5;">${esc(h.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size:2.4rem;color:#d90a2c;font-weight:800;font-family:'Playfair Display',Georgia,serif;">25+</div>
          <div style="font-weight:700;margin-top:6px;color:#262626;font-size:1.05rem;">Years of Fiduciary Trust</div>
          <div style="font-size:0.88rem;color:#666666;margin-top:6px;line-height:1.5;">Continuous corporate advisory and registered accounting excellence.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size:2.4rem;color:#d90a2c;font-weight:800;font-family:'Playfair Display',Georgia,serif;">99.8%</div>
          <div style="font-weight:700;margin-top:6px;color:#262626;font-size:1.05rem;">Clean Audit Defense Rate</div>
          <div style="font-size:0.88rem;color:#666666;margin-top:6px;line-height:1.5;">Flawless statutory audit outcomes before domestic and international revenue authorities.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size:2.4rem;color:#d90a2c;font-weight:800;font-family:'Playfair Display',Georgia,serif;">$850M+</div>
          <div style="font-weight:700;margin-top:6px;color:#262626;font-size:1.05rem;">Advised Corporate Capital</div>
          <div style="font-size:0.88rem;color:#666666;margin-top:6px;line-height:1.5;">Managed wealth, corporate mergers, and balance sheet optimizations.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-top:3px solid #d90a2c;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size:2.4rem;color:#d90a2c;font-weight:800;font-family:'Playfair Display',Georgia,serif;">100%</div>
          <div style="font-weight:700;margin-top:6px;color:#262626;font-size:1.05rem;">Licensed CPA Staff</div>
          <div style="font-size:0.88rem;color:#666666;margin-top:6px;line-height:1.5;">AICPA members and IRS Enrolled Agents leading each account.</div>
        </div>
      </div>
    </section>
  `;

  const heritageHtml = `
    <section class="wrap" style="padding:40px 0 60px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#d90a2c;font-weight:700;">FIRM HERITAGE & PHILOSOPHY</span>
          <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.2rem;color:#262626;margin:12px 0 20px;line-height:1.2;">Proactive Tax Strategy Built on Uncompromising Integrity</h2>
          <div style="color:#4d4d4d;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;">
            ${customStoryParas ? customStoryParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('') : `
              <p>${esc(aboutText)}</p>
              <p>Unlike standard reactive tax filing services, our partners maintain continuous quarterly audits, multi-jurisdiction nexus reviews, and strategic capital structuring to prevent fiscal vulnerabilities before they emerge.</p>
            `}
          </div>
          ${company.certifications ? `
            <div style="margin-top:24px;padding:20px;background:#fdf1f3;border-left:4px solid #d90a2c;border-radius:0 4px 4px 0;">
              <div style="font-size:0.85rem;font-weight:700;color:#d90a2c;text-transform:uppercase;">Professional Accreditations</div>
              <div style="color:#262626;margin-top:6px;font-weight:600;">${esc(company.certifications)}</div>
            </div>
          ` : ''}
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:6px;padding:36px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          ${customImg ? `
            <div style="border-radius:4px;overflow:hidden;border:1px solid #e8d8d9;margin-bottom:18px;">
              <img src="${esc(customImg)}" alt="${esc(company.name)}" style="width:100%;height:200px;object-fit:cover;display:block;" loading="lazy">
            </div>
          ` : `
            <div style="font-size:2rem;color:#d90a2c;margin-bottom:16px;">⚖️</div>
          `}
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.35rem;margin:0 0 10px;">Fiduciary Duty & Transparency</h3>
          <p style="color:#666666;font-size:0.95rem;line-height:1.6;margin:0 0 24px;">Our practice adheres to the highest statutory accounting ethics, ensuring your business preserves wealth legally and strategically.</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:#333333;">
              <span style="color:#d90a2c;font-weight:700;">●</span> Licensed by the State Board of Public Accountancy
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:#333333;">
              <span style="color:#d90a2c;font-weight:700;">●</span> AICPA (American Institute of CPAs) Accredited Firm
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:#333333;">
              <span style="color:#d90a2c;font-weight:700;">●</span> Cross-Border Double Taxation Treaty Practitioners
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const practicePillarsHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e8d8d9;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#d90a2c;font-weight:700;">CORE DISCIPLINES</span>
        <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.2rem;color:#262626;margin:10px 0;">Four Core Practice Specialties</h2>
        <p style="color:#666666;max-width:620px;margin:0 auto;font-size:1rem;">Specialized CPA and legal counsel covering all facets of enterprise financial governance.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">📑</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.2rem;margin:0 0 10px;">Corporate Tax Structuring</h3>
          <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0;">Cross-border corporate entity tax optimization, transfer pricing, and VAT/GST compliance.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">🔍</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.2rem;margin:0 0 10px;">Statutory Financial Audits</h3>
          <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0;">Independent GAAP/IFRS statement verification, compliance certifications, and internal control reviews.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">💼</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.2rem;margin:0 0 10px;">M&A & Due Diligence</h3>
          <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0;">Rigorous financial forensics, target valuation modeling, and pre-deal tax liability analysis.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:2rem;margin-bottom:14px;">🏛️</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.2rem;margin:0 0 10px;">Private Wealth Advisory</h3>
          <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0;">Family office structuring, generational wealth succession planning, and estate tax shielding.</p>
        </div>
      </div>
    </section>
  `;

  const partnersHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e8d8d9;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#d90a2c;font-weight:700;">PRACTICE LEADERSHIP</span>
        <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.2rem;color:#262626;margin:10px 0;">Senior Partners & CPAs</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#262626;color:#fff;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">AS</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.15rem;margin:0 0 4px;">Arthur Sterling, CPA</h3>
          <div style="color:#d90a2c;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Managing Partner</div>
          <p style="color:#666666;font-size:0.85rem;line-height:1.5;margin:0;">25+ years experience in corporate restructuring and international tax strategy.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#d90a2c;color:#fff;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">EM</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.15rem;margin:0 0 4px;">Evelyn Montgomery, Esq.</h3>
          <div style="color:#d90a2c;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Senior Tax Attorney & Partner</div>
          <p style="color:#666666;font-size:0.85rem;line-height:1.5;margin:0;">Specializes in tax dispute defense, cross-border treaties, and corporate governance.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#4d4d4d;color:#fff;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">RC</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.15rem;margin:0 0 4px;">Richard Caldwell, CPA</h3>
          <div style="color:#d90a2c;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Director of Audit & Assurance</div>
          <p style="color:#666666;font-size:0.85rem;line-height:1.5;margin:0;">Supervises statutory independent audits for domestic and multinational enterprises.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#262626;color:#fff;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">BH</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.15rem;margin:0 0 4px;">Beatrice Holmes, CFE</h3>
          <div style="color:#d90a2c;font-size:0.85rem;font-weight:700;margin-bottom:10px;">Forensic Accounting Lead</div>
          <p style="color:#666666;font-size:0.85rem;line-height:1.5;margin:0;">Certified fraud examiner with deep forensic valuation experience across M&A deals.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="background:#262626;border-top:3px solid #d90a2c;border-radius:4px;padding:48px;text-align:center;color:#ffffff;">
        <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.2rem;color:#ffffff;margin:0 0 14px;">Schedule a Complimentary Confidential Tax Review</h2>
        <p style="color:#cccccc;max-width:600px;margin:0 auto 28px;font-size:1.05rem;">Our senior partners will review your corporate filings, identify risk exposures, and highlight optimization opportunities.</p>
        <a class="button" style="background:#d90a2c;color:#ffffff;font-weight:700;border-radius:4px;padding:16px 36px;display:inline-block;text-transform:uppercase;font-size:0.88rem;letter-spacing:0.04em;text-decoration:none;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Book Initial Consultation ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${statsHtml}${heritageHtml}${practicePillarsHtml}${partnersHtml}${ctaHtml}`;
}

export function renderAccountingContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="porto-inner-hero" style="background:linear-gradient(135deg,#1f2421 0%,#2b2b2b 60%,#383838 100%);color:#ffffff;padding:70px 0 50px;border-bottom:3px solid #d90a2c;">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(217,10,44,0.15);border:1px solid #d90a2c;padding:6px 18px;border-radius:4px;margin-bottom:20px;">
          <span style="font-size:0.8rem;font-weight:700;color:#fdf1f3;letter-spacing:0.1em;text-transform:uppercase;">CONFIDENTIAL CLIENT INTAKE</span>
        </div>
        <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.4rem,4.8vw,4.2rem);line-height:1.12;font-weight:700;letter-spacing:-0.02em;margin:0 0 20px;color:#ffffff;">
          ${esc(ui.conversation || 'Schedule a Consultation')}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#d1d5db;margin:0;">
          ${esc(ui.contactIntro || 'Engage our accredited partners for corporate tax planning, statutory audit preparation, or confidential financial counsel.')}
        </p>
      </div>
    </section>
  `;

  const contactContentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div class="contact-layout" style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: Offices & Info -->
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:36px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <span class="eyebrow" style="color:#d90a2c;font-weight:700;">PARTNER DIRECTORY</span>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.4rem;margin:8px 0 24px;">Firm Headquarters & Desks</h3>

          <div style="display:flex;flex-direction:column;gap:20px;color:#4d4d4d;font-size:0.95rem;">
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:#d90a2c;text-transform:uppercase;margin-bottom:4px;">Senior Partner Desk Email</div>
              <a style="color:#262626;font-weight:700;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d90a2c;text-transform:uppercase;margin-bottom:4px;">Toll-Free Advisory Line</div>
                <a style="color:#262626;font-weight:700;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d90a2c;text-transform:uppercase;margin-bottom:4px;">Direct WhatsApp Consultation</div>
                <a style="color:#10b981;font-weight:700;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Chat Now ↗)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d90a2c;text-transform:uppercase;margin-bottom:4px;">Main Office Address</div>
                <span style="color:#333333;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;padding:20px;background:#fdf1f3;border-radius:4px;border:1px solid #e8d8d9;">
            <div style="font-size:0.85rem;color:#4d4d4d;line-height:1.6;">
              <strong style="color:#262626;">Office Hours:</strong> Monday – Friday: 8:30 AM – 6:00 PM EST.<br>
              <strong style="color:#d90a2c;">Emergency Tax Defense:</strong> On-call CPA support available 24/7 during active statutory audit reviews.
            </div>
          </div>
        </div>

        <!-- Right: Consultation Form -->
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:36px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <h2 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.6rem;margin:0 0 8px;">Request Confidential Consultation</h2>
          <p style="color:#666666;font-size:0.95rem;margin:0 0 28px;">All submissions are treated under strict attorney-client and CPA confidentiality privileges.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#333333;font-size:0.88rem;">
              <span>${esc(ui.name)} <span style="color:#d90a2c;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#ffffff;border:1px solid #cccccc;border-radius:4px;padding:12px 14px;color:#262626;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#333333;font-size:0.88rem;">
              <span>${esc(ui.email)} <span style="color:#d90a2c;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#ffffff;border:1px solid #cccccc;border-radius:4px;padding:12px 14px;color:#262626;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#333333;font-size:0.88rem;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#ffffff;border:1px solid #cccccc;border-radius:4px;padding:12px 14px;color:#262626;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#333333;font-size:0.88rem;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#ffffff;border:1px solid #cccccc;border-radius:4px;padding:12px 14px;color:#262626;font:inherit;">
                <option value="">— Select Target Practice Area —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#333333;font-size:0.88rem;">
              <span>${esc(ui.message)} <span style="color:#d90a2c;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Brief description of your business structure, filing jurisdictions, and required advisory services..." style="background:#ffffff;border:1px solid #cccccc;border-radius:4px;padding:12px 14px;color:#262626;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#d90a2c;color:#ffffff;font-weight:700;border-radius:4px;padding:14px 36px;border:none;cursor:pointer;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.04em;">
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
    <section class="wrap" style="padding:40px 0 80px;border-top:1px solid #e8d8d9;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#d90a2c;font-weight:700;">FREQUENTLY ASKED QUESTIONS</span>
        <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:2.2rem;color:#262626;margin:10px 0;">Client Engagement & Practice FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:24px;">
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.15rem;margin:0 0 8px;">How do we prepare for an initial corporate tax review?</h3>
          <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0;">Prior to our first strategy session, our secure portal will request your past two years of corporate returns, balance sheets, and active entity charters.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:24px;">
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.15rem;margin:0 0 8px;">Can your partners represent us before tax authorities?</h3>
          <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0;">Yes. Our licensed CPAs and tax attorneys possess full power of attorney representation rights before domestic revenue services and international fiscal bodies.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:24px;">
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.15rem;margin:0 0 8px;">What billing models are available for ongoing advisory?</h3>
          <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0;">We offer both fixed quarterly retainers (including unlimited partner consultations) and project-based milestone fees for M&A due diligence and statutory audits.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contactContentHtml}${faqHtml}`;
}

export function renderAccountingCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="porto-inner-hero" style="background:linear-gradient(135deg,#1f2421 0%,#2b2b2b 60%,#383838 100%);color:#ffffff;padding:70px 0 50px;border-bottom:3px solid #d90a2c;">
      <div class="wrap">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(217,10,44,0.15);border:1px solid #d90a2c;padding:6px 18px;border-radius:4px;margin-bottom:20px;">
          <span style="font-size:0.8rem;font-weight:700;color:#fdf1f3;letter-spacing:0.1em;text-transform:uppercase;">PRACTICE DIRECTORY</span>
        </div>
        <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.4rem,4.8vw,4.2rem);line-height:1.12;font-weight:700;letter-spacing:-0.02em;margin:0 0 20px;color:#ffffff;">
          ${esc(ui.catalog || 'Practice Areas & Advisory Solutions')}
        </h1>
        <p style="max-width:760px;font-size:1.2rem;line-height:1.7;color:#d1d5db;margin:0;">
          Explore our certified public accounting practice areas, cross-border corporate taxation solutions, and statutory audit disciplines.
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
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.02);display:flex;flex-direction:column;">
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#f5f5f5;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="padding:32px 24px 16px;font-size:2.4rem;">📑</div>
              `}
              <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
                <h3 style="font-family:'Playfair Display',Georgia,serif;margin:0 0 10px;font-size:1.3rem;color:#262626;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#262626;text-decoration:none;">
                    ${esc(t.name)}
                  </a>
                </h3>
                <p style="color:#666666;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                  ${esc(t.description || 'Professional corporate accounting and advisory practice.')}
                </p>
                <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e8d8d9;padding-top:16px;margin-top:auto;">
                  <span style="font-size:0.85rem;color:#d90a2c;font-weight:700;">Accredited Service</span>
                  <a style="color:#d90a2c;font-weight:700;font-size:0.9rem;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
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

export function renderAccountingDetail(ctx: ThemeContext): string {
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
    <!-- Top Breadcrumbs & Practice Hero -->
    <section class="porto-inner-hero" style="background:linear-gradient(135deg,#1f2421 0%,#2b2b2b 60%,#383838 100%);color:#ffffff;padding:50px 0 40px;border-bottom:3px solid #d90a2c;">
      <div class="wrap">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.9rem;color:#d1d5db;margin-bottom:16px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#d1d5db;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#d1d5db;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#d90a2c;font-weight:700;">${esc(t.name)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(217,10,44,0.15);border:1px solid #d90a2c;color:#fdf1f3;padding:4px 14px;border-radius:4px;font-size:0.8rem;font-weight:700;margin-bottom:12px;text-transform:uppercase;">
              <span>⚖️</span> CHARTERED ACCOUNTING & FIDUCIARY ADVISORY
            </div>
            <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.2rem,4vw,3.4rem);line-height:1.15;font-weight:700;letter-spacing:-0.02em;margin:0;color:#ffffff;">
              ${esc(t.name)}
            </h1>
          </div>
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:4px;padding:12px 20px;text-align:right;">
            <div style="color:#9ca3af;font-size:0.8rem;text-transform:uppercase;font-weight:700;">Supervising Partner</div>
            <div style="color:#d90a2c;font-weight:800;font-size:1.05rem;">Partner-Led Engagement</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Showcase: Col 1 Preview & Credentials, Col 2 Scope & Progress Bars -->
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:48px;align-items:start;">
        <!-- Left Col: Practice Card -->
        <div>
          <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;overflow:hidden;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
            ${imgUrl ? `
              <img id="detailMainImg" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:contain;border-radius:4px;">
            ` : `
              <div style="padding:70px 24px;text-align:center;font-size:5rem;">⚖️</div>
            `}
          </div>

          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <span style="background:#fdf1f3;border:1px solid #fecdd3;color:#d90a2c;padding:8px 14px;border-radius:4px;font-size:0.85rem;font-weight:700;">✓ IFRS & GAAP Compliant</span>
            <span style="background:#fdf1f3;border:1px solid #fecdd3;color:#d90a2c;padding:8px 14px;border-radius:4px;font-size:0.85rem;font-weight:700;">✓ Big-4 Trained CPAs</span>
            <span style="background:#fdf1f3;border:1px solid #fecdd3;color:#d90a2c;padding:8px 14px;border-radius:4px;font-size:0.85rem;font-weight:700;">✓ Zero Audit Disallowance</span>
          </div>
        </div>

        <!-- Right Col: Overview, Dynamic Progress Bars, Credentials -->
        <div>
          <h2 style="font-family:'Playfair Display',Georgia,serif;color:#18181b;font-size:1.8rem;font-weight:700;margin:0 0 16px;">Practice Scope & Execution</h2>
          <p style="font-size:1.15rem;line-height:1.75;color:#4b5563;margin:0 0 28px;">
            ${esc(t.description || 'Certified fiduciary accounting and statutory audit practice delivering meticulous financial statement validation, multi-jurisdiction tax shielding, and senior partner accountability.')}
          </p>

          <!-- Dynamic Fiduciary Progress Bars -->
          <div style="background:#fdf1f3;border:1px solid #fecdd3;border-radius:4px;padding:26px;margin-bottom:28px;">
            <h3 style="font-family:'Playfair Display',Georgia,serif;color:#2b2b2b;font-size:1.05rem;font-weight:700;margin:0 0 18px;display:flex;align-items:center;gap:8px;">
              <span style="color:#d90a2c;">📊</span> Fiduciary Precision & Compliance Metrics
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#262626;margin-bottom:6px;">
                  <span>Statutory Audit Precision</span>
                  <span style="color:#d90a2c;">100% Unqualified Opinions</span>
                </div>
                <div class="wr-progress-container" style="background:#ffe4e6;height:8px;border-radius:2px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#e11d48,#be123c);height:100%;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#262626;margin-bottom:6px;">
                  <span>Corporate Tax Optimization Ratio</span>
                  <span style="color:#b91c1c;">95% Validated Shielding</span>
                </div>
                <div class="wr-progress-container" style="background:#ffe4e6;height:8px;border-radius:2px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="95" style="background:linear-gradient(90deg,#dc2626,#991b1b);height:100%;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:700;color:#262626;margin-bottom:6px;">
                  <span>Filing & Regulatory Accuracy</span>
                  <span style="color:#15803d;">99.8% On-Time Completion</span>
                </div>
                <div class="wr-progress-container" style="background:#ffe4e6;height:8px;border-radius:2px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#16a34a,#15803d);height:100%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Practice Credentials Table -->
          <div style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:24px;margin-bottom:32px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
            <h3 style="font-family:'Playfair Display',Georgia,serif;color:#262626;font-size:1.05rem;font-weight:700;margin:0 0 16px;">Practice Credentials</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f5f5f5;">
                <span style="color:#666666;">Statutory Jurisdiction</span>
                <span style="color:#262626;font-weight:600;">${esc(p.material || 'Domestic & Cross-Border OECD BEPS')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f5f5f5;">
                <span style="color:#666666;">Engagement Format</span>
                <span style="color:#262626;font-weight:600;">${esc(p.dimensions || 'Retainer Advisory & Quarterly Attestation')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f5f5f5;">
                <span style="color:#666666;">Partner Lead</span>
                <span style="color:#d90a2c;font-weight:700;">Partner-Led Engagement</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#666666;">Confidentiality Standard</span>
                <span style="color:#262626;font-weight:600;">Fiduciary Legal Privilege Protocol</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Fiduciary Advisory Pillars -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;" data-reveal="fade-up">
        <span style="color:#d90a2c;font-size:0.85rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">PRACTICE FOUNDATION</span>
        <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.8rem,3vw,2.4rem);color:#18181b;font-weight:700;margin:8px 0 12px;">Institutional Accounting Standards</h2>
        <p style="color:#6b7280;font-size:1.05rem;line-height:1.6;margin:0;">Delivering defensible audit trails and resilient international corporate tax structures.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="width:52px;height:52px;border-radius:4px;background:#fdf1f3;color:#d90a2c;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">⚖️</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#18181b;font-size:1.2rem;font-weight:700;margin:0 0 10px;">Corporate Tax Structuring</h3>
          <p style="color:#4b5563;font-size:0.95rem;line-height:1.6;margin:0;">Optimizing international treaty benefits and cross-border transfer pricing while strictly complying with OECD standards.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="width:52px;height:52px;border-radius:4px;background:#fdf1f3;color:#d90a2c;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">📑</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#18181b;font-size:1.2rem;font-weight:700;margin:0 0 10px;">Continuous Ledger Matching</h3>
          <p style="color:#4b5563;font-size:0.95rem;line-height:1.6;margin:0;">Automating general ledger entries with bank feeds for continuous real-time closing and zero month-end reporting friction.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.03);">
          <div style="width:52px;height:52px;border-radius:4px;background:#fdf1f3;color:#d90a2c;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;">🔍</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;color:#18181b;font-size:1.2rem;font-weight:700;margin:0 0 10px;">Forensic Risk Due Diligence</h3>
          <p style="color:#4b5563;font-size:0.95rem;line-height:1.6;margin:0;">Comprehensive balance sheet vetting for mergers, acquisitions, and restructuring to uncover hidden liabilities.</p>
        </div>
      </div>
    </section>

    <!-- Confidential Consultation Inquiry Form -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="background:#1f2421;color:#ffffff;border-radius:4px;padding:40px;display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;">
        <div>
          <span style="color:#d90a2c;font-size:0.85rem;font-weight:800;text-transform:uppercase;">CONFIDENTIAL ENGAGEMENT</span>
          <h2 style="font-family:'Playfair Display',Georgia,serif;color:#ffffff;font-size:1.8rem;font-weight:700;margin:8px 0 12px;">Retain ${esc(t.name)}</h2>
          <p style="color:#d1d5db;font-size:1rem;line-height:1.6;margin:0 0 24px;">
            Schedule a confidential partner-level preliminary consultation to review your corporate structure or upcoming audit timeline.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;color:#e5e7eb;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#d90a2c;">✓</span> Mutual Non-Disclosure Agreement (NDA) Protected
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#d90a2c;">✓</span> Direct Assessment by Senior Practice Director
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#d90a2c;">✓</span> Defensible Written Engagement Scope
            </div>
          </div>
          ${waDigits ? `
            <div style="margin-top:28px;">
              <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:4px;text-decoration:none;font-size:0.95rem;">
                <span>WhatsApp Private Advisory ↗</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#d1d5db;font-size:0.85rem;font-weight:600;">Selected Practice Area</label>
              <input name="productName" value="${esc(t.name)}" readonly style="background:#2b2b2b;border:1px solid #404040;border-radius:4px;padding:10px 14px;color:#ffffff;font:inherit;font-weight:700;">
              <input type="hidden" name="productId" value="${esc(p.id)}">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#d1d5db;font-size:0.85rem;font-weight:600;">${esc(ui.name)} <span style="color:#d90a2c;">*</span></label>
              <input name="name" required placeholder="Authorized officer" style="background:#2b2b2b;border:1px solid #404040;border-radius:4px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#d1d5db;font-size:0.85rem;font-weight:600;">${esc(ui.email)} <span style="color:#d90a2c;">*</span></label>
              <input name="email" type="email" required placeholder="cfo@corporation.com" style="background:#2b2b2b;border:1px solid #404040;border-radius:4px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#d1d5db;font-size:0.85rem;font-weight:600;">Entity Legal Name <span style="color:#d90a2c;">*</span></label>
              <input name="company" required placeholder="Corporate entity name" style="background:#2b2b2b;border:1px solid #404040;border-radius:4px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#d1d5db;font-size:0.85rem;font-weight:600;">Estimated Annual Revenue</label>
              <input name="quantity" placeholder="e.g. $5M - $50M" style="background:#2b2b2b;border:1px solid #404040;border-radius:4px;padding:10px 14px;color:#ffffff;font:inherit;">
            </div>
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#d1d5db;font-size:0.85rem;font-weight:600;">Advisory or Audit Objectives</label>
              <textarea name="message" rows="3" placeholder="Outline your corporate filing deadlines, jurisdictions, or statutory requirements..." style="background:#2b2b2b;border:1px solid #404040;border-radius:4px;padding:10px 14px;color:#ffffff;font:inherit;resize:vertical;"></textarea>
            </div>
            <div style="grid-column:1 / -1;margin-top:6px;">
              <button type="submit" class="button" style="width:100%;background:#d90a2c;color:#ffffff;font-weight:700;border-radius:4px;padding:14px;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.04em;border:none;cursor:pointer;">
                ${esc(ui.inquire || 'Schedule Confidential Discussion')} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:10px 0 0;font-size:0.85rem;text-align:center;color:#d1d5db;"></p>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Related Accounting Practices -->
    ${related.length > 0 ? `
      <section class="wrap" style="padding:20px 0 80px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:1.6rem;color:#18181b;font-weight:700;margin:0;">Related Fiduciary Practices</h2>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#d90a2c;font-weight:700;text-decoration:none;font-size:0.95rem;">
            ${esc(ui.allProducts)} ↗
          </a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          ${related.map(item => {
            const it = translateProduct(item);
            const itemImg = asset(item.imageAssetId);
            return `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e8d8d9;border-radius:4px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
                ${itemImg ? `
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;aspect-ratio:16/9;background:#fdf1f3;overflow:hidden;">
                    <img src="${esc(itemImg)}" alt="${esc(it.name)}" style="width:100%;height:100%;object-fit:cover;">
                  </a>
                ` : `
                  <div style="padding:28px;text-align:center;font-size:2.5rem;background:#fdf1f3;">⚖️</div>
                `}
                <div style="padding:20px;display:flex;flex-direction:column;flex:1;">
                  <h4 style="font-family:'Playfair Display',Georgia,serif;font-size:1.15rem;font-weight:700;margin:0 0 8px;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#262626;text-decoration:none;">
                      ${esc(it.name)}
                    </a>
                  </h4>
                  <p style="color:#666666;font-size:0.88rem;line-height:1.5;margin:0 0 16px;flex:1;">
                    ${esc(it.description || 'Certified fiduciary accounting and statutory audit practice.')}
                  </p>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#d90a2c;font-weight:700;font-size:0.88rem;text-decoration:none;margin-top:auto;">
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
