import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { isTypedMaterialsSource } from '../materials-typed';

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

function renderLegacyAccountingAbout(ctx: ThemeContext): string {
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

function renderModernAccountingAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang];
  const isZh = (ctx.lang as string) === 'zh';

  const defaultHeadline = isZh
    ? '恪尽信义义务，构筑跨国财税合规与审慎资产治理架构'
    : 'Accredited Accounting, Global Tax & Fiduciary Corporate Advisory';
  const headline = getAboutHeadline(company, defaultHeadline);

  const defaultStory = [
    isZh
      ? `${company.name} 汇聚二十余年注册会计师与跨国税务律师专业积淀，长期服务于全球跨国企业、高净值家族办公室及跨国投资实体。我们以捍卫企业法定合规与资产安全为最高准则，提供贯穿企业全生命周期的审慎财税规划、法定审计鉴证与跨境并购尽调服务。`
      : `With over two decades of accredited excellence, ${company.name} provides certified public accountancy, cross-border corporate structuring, and rigorous tax compliance for high-net-worth entities and multinational enterprises.`,
    isZh
      ? '不同于传统事后记账报税代理，我们的资深合伙人团队深入客户核心业务场景，依托全流程审慎风控模型与双边税收协定网络，在合法合规框架下深度优化税负结构、消除跨法域双重课税风险，保障企业行稳致远。'
      : 'Our multidisciplinary partners maintain continuous quarterly audit oversight, transfer pricing governance, and double-taxation treaty alignment to insulate clients from statutory liabilities while preserving capital efficiency.',
  ];
  const storyParas = getAboutStoryParagraphs(company, defaultStory[0]);
  const paras = company.aboutStory ? storyParas : defaultStory;

  const { primary: aboutImg } = getAboutImages(ctx, path('templates/accounting/about-office.jpg'));

  const stats = parseAboutHighlights(company.aboutHighlights, [
    { value: '25+', num: 25, suffix: '+', label: isZh ? '执业信赖年限' : 'Years of Fiduciary Trust', desc: isZh ? '四分之一世纪持续合规坚守' : 'Continuous corporate advisory excellence' },
    { value: '99.8%', num: 99.8, suffix: '%', label: isZh ? '无保留法定审计通过率' : 'Clean Audit Defense Rate', desc: isZh ? '经受全球多边税务主管机关严苛审查' : 'Flawless statutory audit outcomes worldwide' },
    { value: '$850M+', num: 850, prefix: '$', suffix: 'M+', label: isZh ? '年化咨询监督企业资本' : 'Advised Corporate Capital', desc: isZh ? '跨国财资优化与并购风险隔离' : 'Managed treasuries, M&A, and asset shielding' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '资深持牌合伙人直通服务' : 'Licensed CPA & Legal Staff', desc: isZh ? '国家会计师公会与执业律师亲理' : 'AICPA members and enrolled attorneys on duty' },
  ]);

  // Anti-Blank Box Vector SVG: Archival General Ledger & Wax Seal Folio
  const ledgerSvg = `
    <svg viewBox="0 0 720 460" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block;background:#181615;">
      <defs>
        <radialGradient id="portoLedgerGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#2c2825" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#141211" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
        <filter id="waxShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Folio Slate Canvas -->
      <rect width="720" height="460" fill="url(#portoLedgerGlow)"/>
      <rect x="16" y="16" width="688" height="428" rx="4" fill="none" stroke="#3d3733" stroke-width="1.5"/>
      <rect x="22" y="22" width="676" height="416" rx="2" fill="none" stroke="#d90a2c" stroke-width="0.75" stroke-opacity="0.4"/>

      <!-- Folio Header / Watermark -->
      <g transform="translate(42, 48)">
        <text x="0" y="0" fill="#d4af37" font-size="10" font-family="'Georgia',serif" font-weight="700" letter-spacing="3">ACCREDITED STATUTORY GENERAL LEDGER // FOLIO NO. 904-CPA</text>
        <text x="0" y="18" fill="#a8a29e" font-size="11" font-family="'Courier New',monospace" letter-spacing="1">JURISDICTION: IFRS · US-GAAP · OECD BEPS COMPLIANT</text>
        <line x1="0" y1="28" x2="636" y2="28" stroke="#d4af37" stroke-width="1" stroke-opacity="0.5"/>
      </g>

      <!-- Ledger Table Structure -->
      <g transform="translate(42, 98)">
        <!-- Table Column Headers -->
        <rect x="0" y="0" width="636" height="26" fill="#24201e" rx="2"/>
        <text x="12" y="17" fill="#e7e5e4" font-size="10" font-family="'Courier New',monospace" font-weight="700">CODE / REF</text>
        <text x="120" y="17" fill="#e7e5e4" font-size="10" font-family="'Courier New',monospace" font-weight="700">FIDUCIARY ACCOUNT TITLE</text>
        <text x="360" y="17" fill="#e7e5e4" font-size="10" font-family="'Courier New',monospace" font-weight="700">DEBIT ($USD)</text>
        <text x="490" y="17" fill="#e7e5e4" font-size="10" font-family="'Courier New',monospace" font-weight="700">CREDIT ($USD)</text>

        <!-- Ledger Row 1 -->
        <line x1="0" y1="56" x2="636" y2="56" stroke="#2d2926" stroke-width="1"/>
        <text x="12" y="47" fill="#78716c" font-size="11" font-family="'Courier New',monospace">GL-1010</text>
        <text x="120" y="47" fill="#f5f5f4" font-size="11" font-family="'Georgia',serif">Escrow Trust & Treasury Reserves</text>
        <text x="360" y="47" fill="#10b981" font-size="11" font-family="'Courier New',monospace" font-weight="700">45,820,000.00</text>
        <text x="490" y="47" fill="#78716c" font-size="11" font-family="'Courier New',monospace">—</text>

        <!-- Ledger Row 2 -->
        <line x1="0" y1="88" x2="636" y2="88" stroke="#2d2926" stroke-width="1"/>
        <text x="12" y="79" fill="#78716c" font-size="11" font-family="'Courier New',monospace">GL-2040</text>
        <text x="120" y="79" fill="#f5f5f4" font-size="11" font-family="'Georgia',serif">Cross-Border Tax Shield Capital</text>
        <text x="360" y="79" fill="#78716c" font-size="11" font-family="'Courier New',monospace">—</text>
        <text x="490" y="79" fill="#e7e5e4" font-size="11" font-family="'Courier New',monospace" font-weight="700">45,820,000.00</text>

        <!-- Ledger Row 3 -->
        <line x1="0" y1="120" x2="636" y2="120" stroke="#2d2926" stroke-width="1"/>
        <text x="12" y="111" fill="#78716c" font-size="11" font-family="'Courier New',monospace">GL-3080</text>
        <text x="120" y="111" fill="#f5f5f4" font-size="11" font-family="'Georgia',serif">Transfer Pricing Intercompany Pool</text>
        <text x="360" y="111" fill="#10b981" font-size="11" font-family="'Courier New',monospace" font-weight="700">12,450,000.00</text>
        <text x="490" y="111" fill="#78716c" font-size="11" font-family="'Courier New',monospace">—</text>

        <!-- Ledger Row 4 -->
        <line x1="0" y1="152" x2="636" y2="152" stroke="#2d2926" stroke-width="1"/>
        <text x="12" y="143" fill="#78716c" font-size="11" font-family="'Courier New',monospace">GL-3095</text>
        <text x="120" y="143" fill="#f5f5f4" font-size="11" font-family="'Georgia',serif">Statutory Retained Earnings Allocation</text>
        <text x="360" y="143" fill="#78716c" font-size="11" font-family="'Courier New',monospace">—</text>
        <text x="490" y="143" fill="#e7e5e4" font-size="11" font-family="'Courier New',monospace" font-weight="700">12,450,000.00</text>

        <!-- Double Line Total / Balanced Stamp -->
        <line x1="0" y1="172" x2="636" y2="172" stroke="#d4af37" stroke-width="1" stroke-opacity="0.8"/>
        <line x1="0" y1="176" x2="636" y2="176" stroke="#d4af37" stroke-width="1" stroke-opacity="0.8"/>
        <text x="12" y="196" fill="#d4af37" font-size="11" font-family="'Georgia',serif" font-weight="700" letter-spacing="1">Σ DUAL-ENTRY EQUALITY (TALLY VERIFIED)</text>
        <text x="360" y="196" fill="#10b981" font-size="12" font-family="'Courier New',monospace" font-weight="700">$58,270,000.00</text>
        <text x="490" y="196" fill="#10b981" font-size="12" font-family="'Courier New',monospace" font-weight="700">$58,270,000.00</text>
      </g>

      <!-- Official Wax Seal & Partner Notary Stamp -->
      <g transform="translate(540, 340)" filter="url(#waxShadow)">
        <!-- Outer Wax Seal Rings -->
        <circle cx="0" cy="0" r="54" fill="#991b1b" stroke="#d90a2c" stroke-width="3"/>
        <circle cx="0" cy="0" r="48" fill="#b91c1c" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="3,2"/>
        <circle cx="0" cy="0" r="41" fill="#7f1d1d" stroke="#fef08a" stroke-width="0.75"/>

        <!-- Scales of Fiduciary Justice Symbol -->
        <path d="M-1 -18 L1 -18 L1 18 L-1 18 Z M-18 -10 L18 -10 L0 -16 Z M-18 -10 L-22 6 L-14 6 Z M18 -10 L14 6 L22 6 Z" fill="#d4af37"/>
        <circle cx="0" cy="-16" r="3" fill="#fef08a"/>
        
        <!-- Arc Text / Monogram -->
        <text x="0" y="27" fill="#fef08a" font-size="7" font-family="'Georgia',serif" font-weight="700" text-anchor="middle" letter-spacing="1">ACCREDITED CPA</text>
      </g>

      <!-- Partner Signature Simulation -->
      <g transform="translate(42, 330)">
        <text x="0" y="0" fill="#a8a29e" font-size="10" font-family="'Georgia',serif" font-style="italic">Signed & Attested under Professional Code of Ethics:</text>
        <path d="M0 24 Q 30 5, 60 28 T 120 18 T 180 32 T 220 20" fill="none" stroke="#d4af37" stroke-width="1.75" stroke-linecap="round"/>
        <text x="0" y="44" fill="#78716c" font-size="10" font-family="'Courier New',monospace">SENIOR MANAGING PARTNER // LICENSE #NY-CPA-498102</text>
        <rect x="0" y="54" width="130" height="18" rx="2" fill="#d90a2c" fill-opacity="0.2" stroke="#d90a2c" stroke-width="0.8"/>
        <text x="8" y="66" fill="#fca5a5" font-size="9" font-family="'Courier New',monospace" font-weight="700">STATUS: AUDITED & LOCKED</text>
      </g>
    </svg>
  `;

  return `
    <div class="porto-about-modern" style="background:#fdfcf9;color:#1c1917;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">
      <!-- Asymmetrical Fiduciary Ledger Folio Hero -->
      <section style="background:linear-gradient(135deg, #181615 0%, #24201e 55%, #322b27 100%);color:#ffffff;padding:88px 0 76px;border-bottom:3px solid #d90a2c;position:relative;overflow:hidden;">
        <!-- Delicate Gold & Parchment Background Accents -->
        <div style="position:absolute;top:0;right:0;width:550px;height:550px;background:radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%);pointer-events:none;"></div>
        <div style="position:absolute;bottom:0;left:0;width:400px;height:400px;background:radial-gradient(circle, rgba(217,10,44,0.08) 0%, transparent 70%);pointer-events:none;"></div>

        <div class="wrap" style="max-width:1240px;margin:0 auto;padding:0 24px;position:relative;z-index:2;">
          <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:48px;align-items:center;">
            <!-- Left Hero Folio Docket -->
            <div data-reveal="fade-up">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(212,175,55,0.12);border:1px solid rgba(212,175,55,0.4);padding:6px 18px;border-radius:3px;margin-bottom:22px;">
                <span style="color:#d4af37;font-size:0.82rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:'Georgia',serif;">
                  ${isZh ? `特许执业会计事务所 · 创立于 ${esc(company.establishedYear || '1998')}` : `CHARTERED FIDUCIARY PRACTICE · EST. ${esc(company.establishedYear || '1998')}`}
                </span>
              </div>

              <div style="font-family:'Georgia',serif;font-style:italic;color:#d4af37;font-size:1.05rem;letter-spacing:0.04em;margin-bottom:12px;">
                “Fiat Justitia, Praestare Fide — In Fiduciary Trust We Shield Enterprise Capital”
              </div>

              <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.3rem, 4.4vw, 3.8rem);line-height:1.15;font-weight:700;letter-spacing:-0.02em;margin:0 0 22px;color:#ffffff;">
                ${esc(headline)}
              </h1>

              <div style="border-left:3px solid #d90a2c;padding-left:18px;margin-bottom:28px;">
                <p style="font-size:1.12rem;line-height:1.75;color:#d6d3d1;margin:0;">
                  ${esc(copy?.subtitle || (isZh ? '为跨国领军企业、高净值家族办公室及新兴企业提供穿透式全球税务筹划、法定独立审计与审慎财务治理。' : 'Specialized CPA and legal counsel covering all facets of enterprise financial governance.'))}
                </p>
              </div>

              <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#d90a2c;color:#ffffff;font-weight:700;padding:16px 34px;border-radius:3px;letter-spacing:0.04em;text-transform:uppercase;font-size:0.88rem;text-decoration:none;display:inline-block;box-shadow:0 6px 20px rgba(217,10,44,0.4);transition:all 0.2s ease;">
                  ${isZh ? '预约资深合伙人保密咨询 ↗' : 'Book Senior Partner Consultation ↗'}
                </a>
                <div style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,0.2);padding:14px 20px;border-radius:3px;font-size:0.86rem;color:#e7e5e4;background:rgba(0,0,0,0.25);">
                  <span style="color:#d4af37;">⚖️</span>
                  <span>${esc(company.certifications ? company.certifications.slice(0, 38) : (isZh ? 'AICPA 国家注册执业会员资格认证' : 'AICPA Peer-Reviewed Practice'))}</span>
                </div>
              </div>
            </div>

            <!-- Right Hero Anti-Blank Box Ledger Window -->
            <div data-reveal="fade-up" style="position:relative;">
              <div style="background:#141211;border:1px solid #3d3733;border-radius:6px;padding:8px;box-shadow:0 16px 40px rgba(0,0,0,0.45);position:relative;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#1e1b19;border-bottom:1px solid #2d2926;border-radius:4px 4px 0 0;font-size:0.8rem;color:#a8a29e;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="width:10px;height:10px;border-radius:50%;background:#d90a2c;display:inline-block;"></span>
                    <span style="font-family:'Courier New',monospace;font-weight:700;color:#e7e5e4;">SECURE LEDGER VIEWPORT</span>
                  </div>
                  <span style="font-family:'Courier New',monospace;color:#d4af37;">HASH: SHA-256 VERIFIED</span>
                </div>

                <!-- Fallback Container: vector SVG underneath, image on top with onerror="this.style.display='none'" -->
                <div style="position:relative;min-height:380px;border-radius:0 0 4px 4px;overflow:hidden;background:#181615;">
                  <div style="position:absolute;inset:0;z-index:1;">
                    ${ledgerSvg}
                  </div>
                  ${aboutImg ? `
                    <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0.92;transition:opacity 0.3s ease;" onerror="this.style.display='none'">
                  ` : ''}
                </div>
              </div>

              <!-- Floating Seal Badge -->
              <div style="position:absolute;bottom:-18px;left:-16px;background:#24201e;border:1.5px solid #d4af37;padding:10px 18px;border-radius:4px;box-shadow:0 8px 24px rgba(0,0,0,0.5);display:flex;align-items:center;gap:12px;z-index:3;">
                <span style="font-size:1.6rem;">🏛️</span>
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#d4af37;letter-spacing:0.08em;text-transform:uppercase;">Statutory Verification</div>
                  <div style="font-size:0.88rem;font-weight:700;color:#ffffff;">100% Unqualified Audit Defense</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Archival Double-Entry Balance Bar (复式借贷平衡度量栏) -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:40px 24px 20px;">
        <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #e7e5e4;border-top:3px solid #d90a2c;border-radius:4px;box-shadow:0 4px 18px rgba(0,0,0,0.03);overflow:hidden;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));">
            ${stats.map((s, idx) => `
              <div style="padding:28px 24px;border-right:${idx < stats.length - 1 ? '1px solid #f0eee9' : 'none'};position:relative;">
                <div style="font-family:'Courier New',monospace;font-size:0.75rem;color:#991b1b;font-weight:700;letter-spacing:0.1em;margin-bottom:6px;">
                  REF // STAT-0${idx + 1}
                </div>
                <div style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.1rem, 3.4vw, 2.7rem);font-weight:700;color:#1c1917;line-height:1.1;">
                  <span data-counter="${s.num}" ${s.prefix ? `data-prefix="${esc(s.prefix)}"` : ''} ${s.suffix ? `data-suffix="${esc(s.suffix)}"` : ''}>
                    ${esc(s.value)}
                  </span>
                </div>
                <div style="font-weight:700;color:#292524;margin-top:8px;font-size:1rem;">
                  ${esc(s.label)}
                </div>
                ${s.desc ? `
                  <div style="font-size:0.84rem;color:#78716c;margin-top:6px;line-height:1.5;">
                    ${esc(s.desc)}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Firm Heritage & Fiduciary Philosophy (Archival Parchment Layout) -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:50px 24px 60px;">
        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:flex-start;">
          <!-- Left: Narrative & Fiduciary Charter -->
          <div data-reveal="fade-up">
            <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;color:#d90a2c;text-transform:uppercase;">
              ${isZh ? '执业源流与信义治理章程' : 'FIRM HERITAGE & FIDUCIARY CHARTER'}
            </span>
            <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.9rem, 3vw, 2.5rem);font-weight:700;line-height:1.25;color:#1c1917;margin:12px 0 22px;">
              ${isZh ? '立足恪尽信义义务，以严苛审慎构筑跨国基业长青' : 'Uncompromising Statutory Rigor & Strategic Tax Protection'}
            </h2>
            <div style="color:#44403c;font-size:1.04rem;line-height:1.8;display:flex;flex-direction:column;gap:18px;">
              ${paras.map(p => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>

            ${company.capabilities ? `
              <div style="margin-top:28px;padding:20px 24px;background:#fef2f2;border-left:4px solid #d90a2c;border-radius:0 4px 4px 0;">
                <div style="font-size:0.8rem;font-weight:800;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em;">
                  ${isZh ? '特许执业资质与专业管辖覆盖' : 'Accredited Fiduciary Capabilities'}
                </div>
                <div style="color:#1c1917;margin-top:6px;font-size:0.95rem;font-weight:600;line-height:1.6;">
                  ${esc(company.capabilities)}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Right: Fiduciary Attestation Dossier (合伙人法定鉴证案卷) -->
          <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #e7e5e4;border-radius:4px;padding:34px;box-shadow:0 8px 24px rgba(0,0,0,0.04);position:relative;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e7e5e4;padding-bottom:14px;margin-bottom:18px;">
              <span style="font-family:'Courier New',monospace;font-size:0.8rem;font-weight:700;color:#991b1b;">DOSSIER: CERT-2026-CPA</span>
              <span style="font-size:0.75rem;background:#fef2f2;color:#991b1b;padding:3px 8px;border-radius:2px;font-weight:700;">OFFICIAL PRIVILEGE</span>
            </div>

            <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;font-weight:700;color:#1c1917;margin:0 0 12px;">
              ${isZh ? '独立法定审计与信义承诺书' : 'Statutory Independence & Ethics Pledge'}
            </h3>

            <p style="color:#57534e;font-size:0.92rem;line-height:1.65;margin:0 0 22px;">
              ${isZh ? '本所严格恪守执业注册会计师职业道德规范，坚持利益冲突全面回避机制与终身保密特权，确保向企业决策层与审计委员会提供客观真实的穿透式审鉴报告。' : 'Adhering to strict professional ethics and complete client-attorney-CPA confidentiality privileges across all bilateral jurisdictions.'}
            </p>

            <div style="display:flex;flex-direction:column;gap:14px;border-top:1px solid #f5f5f4;padding-top:18px;">
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#d90a2c;font-size:1.1rem;line-height:1;">⚖️</span>
                <div style="font-size:0.9rem;color:#292524;line-height:1.5;">
                  <strong>${isZh ? '国家会计师公会与执业监督委员会注册' : 'State Board of Accountancy License'}</strong>
                  <div style="font-size:0.8rem;color:#78716c;">${isZh ? '持牌执业会计师与联邦出庭税务律师终身资质' : 'Continuous peer-review and statutory licensing compliance'}</div>
                </div>
              </div>

              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#d90a2c;font-size:1.1rem;line-height:1;">🌐</span>
                <div style="font-size:0.9rem;color:#292524;line-height:1.5;">
                  <strong>${isZh ? 'OECD BEPS 与跨国双边协定咨询专长' : 'OECD BEPS Action Plan Alignment'}</strong>
                  <div style="font-size:0.8rem;color:#78716c;">${isZh ? '转让定价同期资料准备与多边事前定价安排（APA）' : 'Full international transfer pricing and treaty coverage'}</div>
                </div>
              </div>

              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#d90a2c;font-size:1.1rem;line-height:1;">🛡️</span>
                <div style="font-size:0.9rem;color:#292524;line-height:1.5;">
                  <strong>${isZh ? '全面受托人责任险与资产安全隔离' : '$20M Professional Liability Insurance'}</strong>
                  <div style="font-size:0.8rem;color:#78716c;">${isZh ? '跨国司库资金与尽职调查过程全程法律防火墙' : 'Underwritten by tier-1 institutional syndicates'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Three Archival Fiduciary Practice Pillars (三大法定执业立柱) -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:50px 24px 70px;border-top:1px solid #e7e5e4;" data-reveal="fade-up">
        <div style="text-align:center;margin-bottom:48px;">
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.14em;color:#d90a2c;text-transform:uppercase;">
            ${isZh ? '三大法定执业支柱' : 'THREE STATUTORY PRACTICE PILLARS'}
          </span>
          <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:700;color:#1c1917;margin:10px 0;">
            ${isZh ? '贯穿资本全生命周期的合规防护与财税规划矩阵' : 'End-to-End Fiduciary Governance & Audit Architecture'}
          </h2>
          <p style="color:#78716c;max-width:680px;margin:0 auto;font-size:1rem;">
            ${isZh ? '以合规为基石，以法律条约为护盾，为企业跨国扩张与代际资产传承构筑坚不可摧的合规防线。' : 'Rigorous audit defense, proactive tax planning, and strategic fiduciary advisory engineered for multinational resilience.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:28px;">
          <!-- Pillar I -->
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e7e5e4;border-top:3px solid #d90a2c;border-radius:4px;padding:32px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <span style="font-family:'Courier New',monospace;font-size:0.75rem;font-weight:700;color:#991b1b;">PILLAR I // TAX-BEPS</span>
              <span style="font-size:1.6rem;">📑</span>
            </div>
            <h3 style="font-family:'Playfair Display',Georgia,serif;color:#1c1917;font-size:1.3rem;font-weight:700;margin:0 0 12px;">
              ${isZh ? '跨国企业税务筹划与转让定价' : 'Cross-Border Tax & Transfer Pricing'}
            </h3>
            <p style="color:#57534e;font-size:0.92rem;line-height:1.65;margin:0 0 18px;">
              ${isZh ? '跨辖区控股架构搭建、无形资产知识产权（IP）转让定价报告、OECD Pillar Two 全球最低税合规应对与增值税/GST 穿透式申报。' : 'Cross-border holding company structuring, OECD Pillar Two global minimum tax compliance, and intercompany transfer pricing masterfile documentation.'}
            </p>
            <div style="font-size:0.82rem;font-weight:700;color:#991b1b;display:flex;align-items:center;gap:6px;">
              <span>✓</span> ${isZh ? 'OECD BEPS 13 条款全面合规' : 'OECD BEPS Action 13 Compliant'}
            </div>
          </div>

          <!-- Pillar II -->
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e7e5e4;border-top:3px solid #1c1917;border-radius:4px;padding:32px;box-shadow:0 4px 14px rgba(0,0,0,0.03);transition-delay:0.08s;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <span style="font-family:'Courier New',monospace;font-size:0.75rem;font-weight:700;color:#44403c;">PILLAR II // AUDIT-ISA</span>
              <span style="font-size:1.6rem;">🔍</span>
            </div>
            <h3 style="font-family:'Playfair Display',Georgia,serif;color:#1c1917;font-size:1.3rem;font-weight:700;margin:0 0 12px;">
              ${isZh ? '法定独立审计与法证鉴证' : 'Statutory Audits & Financial Forensics'}
            </h3>
            <p style="color:#57534e;font-size:0.92rem;line-height:1.65;margin:0 0 18px;">
              ${isZh ? '严谨遵循 IFRS/US-GAAP 国际会计准则，出具法定无保留审计意见书；提供企业内部舞弊排查、资金流穿透式法证调查与萨班斯（SOX）合规审阅。' : 'Independent statutory financial statement audits, forensic fraud investigations, and Sarbanes-Oxley (SOX) internal control attestations.'}
            </p>
            <div style="font-size:0.82rem;font-weight:700;color:#1c1917;display:flex;align-items:center;gap:6px;">
              <span>✓</span> ${isZh ? 'PCAOB / ISA 700 审计鉴证标准' : 'PCAOB & ISA 700 Assurance Standard'}
            </div>
          </div>

          <!-- Pillar III -->
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e7e5e4;border-top:3px solid #d4af37;border-radius:4px;padding:32px;box-shadow:0 4px 14px rgba(0,0,0,0.03);transition-delay:0.16s;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <span style="font-family:'Courier New',monospace;font-size:0.75rem;font-weight:700;color:#b45309;">PILLAR III // M&A-FO</span>
              <span style="font-size:1.6rem;">🏛️</span>
            </div>
            <h3 style="font-family:'Playfair Display',Georgia,serif;color:#1c1917;font-size:1.3rem;font-weight:700;margin:0 0 12px;">
              ${isZh ? '跨境并购尽调与家族信托' : 'M&A Due Diligence & Family Office'}
            </h3>
            <p style="color:#57534e;font-size:0.92rem;line-height:1.65;margin:0 0 18px;">
              ${isZh ? '标的企业财务真实性法证调查、历史潜在税负风险排查；家族信托顶层架构设计、多代际跨国财富平稳传承与离岸资产法律防火墙。' : 'Buy-side pre-deal financial and tax due diligence, complex valuation modeling, and cross-generational offshore trust structuring.'}
            </p>
            <div style="font-size:0.82rem;font-weight:700;color:#b45309;display:flex;align-items:center;gap:6px;">
              <span>✓</span> ${isZh ? '严苛保密协议与资产穿透式保护' : 'Strict Attorney-Client Privileged'}
            </div>
          </div>
        </div>
      </section>

      <!-- The Private Audit Chamber CTA (高级合伙人保密闭门咨询席) -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:20px 24px 85px;">
        <div data-reveal="fade-up" style="background:linear-gradient(135deg, #181615 0%, #292524 60%, #1f1c1a 100%);border-top:3px solid #d4af37;border-bottom:3px solid #d90a2c;border-radius:4px;padding:52px 40px;color:#ffffff;box-shadow:0 12px 36px rgba(0,0,0,0.18);">
          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:40px;align-items:center;">
            <div>
              <div style="font-family:'Courier New',monospace;font-size:0.8rem;color:#d4af37;letter-spacing:0.12em;margin-bottom:10px;text-transform:uppercase;">
                CONFIDENTIAL AUDIT & TAX CHAMBER
              </div>
              <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.9rem, 3.2vw, 2.6rem);color:#ffffff;font-weight:700;margin:0 0 14px;line-height:1.2;">
                ${isZh ? '开启资深高级合伙人一对一保密咨询' : 'Engage Senior Partners for Confidential Fiduciary Review'}
              </h2>
              <p style="color:#d6d3d1;margin:0;font-size:1.05rem;line-height:1.7;">
                ${isZh ? '我们的资深合伙人将深入梳理您的企业申报与跨国资金架构，识别合规薄弱环节并提供量身定制的筹划建议。所有问询均在严格职业保密特权下进行。' : 'Our managing partners personally evaluate your corporate tax filings, cross-border jurisdictions, and risk exposures under strict attorney-client fiduciary privilege.'}
              </p>
            </div>

            <div style="text-align:center;background:rgba(0,0,0,0.3);border:1px solid #3d3733;border-radius:4px;padding:28px;">
              <div style="font-size:0.82rem;color:#a8a29e;margin-bottom:18px;">
                ${isZh ? '支持中文 / 英语双语跨国服务 · 24小时内安排电话或线下面谈' : 'Direct Lead Partner Response within 24 Hours'}
              </div>
              <a class="button" style="background:#d90a2c;color:#ffffff;font-weight:700;border-radius:3px;padding:16px 36px;display:inline-block;text-transform:uppercase;font-size:0.88rem;letter-spacing:0.06em;text-decoration:none;box-shadow:0 4px 18px rgba(217,10,44,0.4);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
                ${isZh ? '立即开启保密咨询对话 ↗' : 'Schedule Private Briefing ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderAccountingAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyAccountingAbout(ctx);
  }
  return renderModernAccountingAbout(ctx);
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
