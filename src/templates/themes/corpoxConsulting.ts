import { esc, safeUrl, type ThemeContext } from './types';

export function renderConsultingHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Decisive Management Strategy & Boardroom Advisory',
    subtitle: 'We advise Fortune 500 boards, sovereign investment funds, and visionary chairmen on complex corporate transformations, high-stakes M&A, and compound value creation.',
    about: 'Corpox Consulting brings peerless strategic rigor, quantitative market diagnostics, and battle-tested execution frameworks to solve the most consequential challenges confronting global enterprises.',
    cta: 'Engage Senior Partners',
  };

  // 1. Executive Top Bar
  const topBarHtml = `
    <div style="background:#071324;color:#fcd34d;padding:8px 0;font-size:0.82rem;border-bottom:1px solid rgba(212,175,55,0.25);">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <span>CONFIDENTIAL ADVISORY LINE: <strong style="color:#ffffff;">+1 (212) 840-CORP</strong></span>
          <span style="opacity:0.4;">|</span>
          <span>EMAIL: <strong style="color:#ffffff;">${esc(company.email)}</strong></span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="color:#d4af37;">✦</span>
          <span style="color:#e2e8f0;">DISCRETE BOARDROOM ACCESS · NEW YORK · LONDON · ZURICH · SINGAPORE</span>
        </div>
      </div>
    </div>
  `;

  // 2. Hero Section
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:linear-gradient(135deg,#071324 0%,#0a192f 50%,#0f2b59 100%);color:#ffffff;padding:95px 0 85px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-100px;right:-50px;width:550px;height:550px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,0.15) 0%,transparent 70%);filter:blur(60px);pointer-events:none;"></div>
      <div class="wrap hero-content" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.4);padding:7px 20px;border-radius:2px;margin-bottom:24px;">
          <span style="font-size:0.8rem;font-weight:700;color:#fcd34d;letter-spacing:0.18em;text-transform:uppercase;">CORPOX EXECUTIVE STRATEGIC PARTNERS · EST. 1994</span>
        </div>
        <h1 class="hero-title" style="font-family:'Cinzel','Times New Roman',serif;font-size:clamp(2.8rem, 5.5vw, 4.8rem);line-height:1.08;font-weight:600;letter-spacing:-0.02em;max-width:880px;margin:0 0 24px;">
          ${esc(copy.headline)}
        </h1>
        <p style="max-width:660px;color:#cbd5e1;font-size:1.22rem;line-height:1.7;margin:0 0 38px;">
          ${esc(copy.subtitle)}
        </p>
        <div style="display:flex;gap:18px;flex-wrap:wrap;">
          <a class="button" style="background:#d4af37;color:#071324;font-weight:800;border-radius:2px;padding:16px 36px;letter-spacing:0.06em;text-transform:uppercase;font-size:0.88rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Engage Partners')} ↗
          </a>
          <a class="button" style="background:rgba(255,255,255,0.06);color:#f8fafc;border:1px solid rgba(212,175,55,0.3);border-radius:2px;padding:16px 32px;letter-spacing:0.06em;text-transform:uppercase;font-size:0.88rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Strategic Practices →
          </a>
        </div>

        <div style="margin-top:45px;display:flex;gap:36px;flex-wrap:wrap;color:#cbd5e1;font-size:0.88rem;">
          <div><strong style="color:#fcd34d;font-size:1.15rem;">$42B+</strong> Value Created</div>
          <div><strong style="color:#fcd34d;font-size:1.15rem;">180+</strong> Mergers & Acquisitions Advised</div>
          <div><strong style="color:#fcd34d;font-size:1.15rem;">94%</strong> Strategic Execution Rate</div>
        </div>
      </div>
    </section>
  `;

  // 3. Strategic Metrics Strip
  const statsHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">$42.8B</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Enterprise Value Engineered</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">Compound shareholder returns realized across global holding companies.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">180+</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Cross-Border Transactions</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">Due diligence, synergistic integration, and post-merger governance.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">30+ Yrs</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Boardroom Advisory Heritage</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">Direct trusted counsel to Fortune 500 CEOs and family office patriarchs.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">94%</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Implementation Success</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">Execution frameworks that transcend PowerPoint to deliver realized EBITDA.</div>
        </div>
      </div>
    </section>
  `;

  // 4. Strategic Practice Areas (Products)
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" style="margin-bottom:36px;">
        <div>
          <span class="eyebrow" style="color:#d4af37;font-weight:800;letter-spacing:0.15em;">BOARDROOM CAPABILITIES</span>
          <h2 style="font-family:'Cinzel',serif;font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#0f2b59;">Executive Practice Areas</h2>
        </div>
        <a class="text-link" style="color:#0f2b59;font-weight:700;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = ctx.productMainImage(p);
          const icons = ['🏛️', '⚖️', '🌐', '📈', '🛡️', '♟️'];
          return `
            <article class="product-card" style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div>
                <div style="font-size:1.8rem;margin-bottom:14px;">${icons[idx % icons.length]}</div>
                ${imgUrl ? `<div class="product-image" style="border-radius:2px;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="font-family:'Cinzel',serif;color:#0f2b59;margin:0 0 10px;font-size:1.35rem;font-weight:600;">${esc(t.name)}</h3>
                <p style="color:#64748b;line-height:1.65;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Executive advisory practice delivering quantitative competitive advantage.')}</p>
              </div>
              <div style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#0f2b59;font-weight:700;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  Review Practice Briefing →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 5. Strategic Transformation Engine (4 Phases)
  const frameworkHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e2e8f0;">
      <div style="text-align:center;max-width:700px;margin:0 auto 48px;">
        <span class="eyebrow" style="color:#d4af37;font-weight:800;letter-spacing:0.15em;">THE CORPOX MODEL</span>
        <h2 style="font-family:'Cinzel',serif;font-size:2.3rem;color:#0f2b59;margin:10px 0;">Four-Stage Enterprise Value Creation</h2>
        <p style="color:#64748b;font-size:1.05rem;">From granular economic diagnostic to sustainable competitive moats.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:0.85rem;font-weight:700;color:#d4af37;margin-bottom:8px;">PHASE I</div>
          <h3 style="font-size:1.2rem;color:#0f2b59;margin:0 0 10px;">Diagnostic Value Audit</h3>
          <p style="color:#64748b;font-size:0.9rem;line-height:1.6;">Rigorous unit-economics analysis dissecting profit pools, operating friction, and hidden balance sheet risks.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:0.85rem;font-weight:700;color:#d4af37;margin-bottom:8px;">PHASE II</div>
          <h3 style="font-size:1.2rem;color:#0f2b59;margin:0 0 10px;">Competitive Moat Engineering</h3>
          <p style="color:#64748b;font-size:0.9rem;line-height:1.6;">Re-architecting business model positioning around high-barrier proprietary IP and network effects.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:0.85rem;font-weight:700;color:#d4af37;margin-bottom:8px;">PHASE III</div>
          <h3 style="font-size:1.2rem;color:#0f2b59;margin:0 0 10px;">Market & Capital Modeling</h3>
          <p style="color:#64748b;font-size:0.9rem;line-height:1.6;">Structuring high-accretion bolt-on acquisitions and divesting non-core drag assets at premium valuations.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:26px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:0.85rem;font-weight:700;color:#d4af37;margin-bottom:8px;">PHASE IV</div>
          <h3 style="font-size:1.2rem;color:#0f2b59;margin:0 0 10px;">Executive Implementation</h3>
          <p style="color:#64748b;font-size:0.9rem;line-height:1.6;">Embedding operating partners directly into senior steering committees to guarantee realized financial metrics.</p>
        </div>
      </div>
    </section>
  `;

  // 6. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#d4af37;font-weight:800;letter-spacing:0.15em;">BOARDROOM TRUST</span>
        <h2 style="font-family:'Cinzel',serif;font-size:2.1rem;color:#0f2b59;margin:8px 0;">Perspectives from Global Executive Leadership</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d4af37;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#334155;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"Corpox provided the definitive quantitative clarity our board required to execute a $4.8B cross-border acquisition with total alignment."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#0f2b59;color:#fcd34d;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">HB</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">Henrik Bergstrom</div><div style="color:#64748b;font-size:0.8rem;">Chairman of the Supervisory Board, Nordic Industrial plc</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d4af37;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#334155;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"Unlike traditional consultancies that leave binders of theory, Corpox stayed embedded until the EBITDA improvements were locked in."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#0a192f;color:#fcd34d;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">VC</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">Victoria Sterling</div><div style="color:#64748b;font-size:0.8rem;">Managing Partner, Apex Capital Partners</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#d4af37;font-size:1.2rem;margin-bottom:12px;">“</div>
          <p style="color:#334155;line-height:1.75;font-size:0.95rem;margin:0 0 18px;font-style:italic;">"The peerless standard in strategic advisory. Their economic models uncovered $350M in stranded enterprise value."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#d4af37;color:#071324;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;">AT</div>
            <div><div style="font-weight:700;color:#0f172a;font-size:0.9rem;">Arthur Thornton</div><div style="color:#64748b;font-size:0.8rem;">Chief Executive Officer, Global Energy Infrastructure</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 7. Executive Consultation CTA Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#071324;color:#ffffff;padding:80px 0;border-top:2px solid #d4af37;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#fcd34d;font-weight:800;letter-spacing:0.18em;">DISCRETE ENGAGEMENT</span>
          <h2 style="font-family:'Cinzel',serif;font-size:2.4rem;margin:10px 0;max-width:680px;color:#ffffff;">
            Strategic clarity for your most decisive corporate initiatives.
          </h2>
          <p style="color:#cbd5e1;font-size:1.1rem;margin:0;max-width:550px;">Initiate a private consultation with our managing partner council.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:#d4af37;color:#071324;font-weight:800;border-radius:2px;padding:16px 36px;letter-spacing:0.06em;text-transform:uppercase;font-size:0.88rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Initiate Boardroom Briefing ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${topBarHtml}${heroHtml}${statsHtml}${productsHtml}${frameworkHtml}${testimonialsHtml}${contactBandHtml}`;
}

export function renderConsultingAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'Corpox Consulting brings peerless strategic rigor, quantitative market diagnostics, and battle-tested execution frameworks to solve the most consequential challenges confronting global enterprises.',
  };

  const heroHtml = `
    <section class="consulting-inner-hero" style="background:linear-gradient(135deg,#071324 0%,#0a192f 50%,#0f2b59 100%);color:#ffffff;padding:80px 0 60px;position:relative;overflow:hidden;border-bottom:2px solid #d4af37;">
      <div style="position:absolute;top:-100px;right:-50px;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,0.15) 0%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.4);padding:6px 18px;border-radius:2px;margin-bottom:20px;">
          <span style="font-size:0.8rem;font-weight:700;color:#fcd34d;letter-spacing:0.18em;text-transform:uppercase;">CORPOX ADVISORY DOCTRINE · EST. 1994</span>
        </div>
        <h1 style="font-family:'Cinzel','Times New Roman',serif;font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.08;font-weight:600;letter-spacing:-0.02em;margin:0 0 20px;max-width:900px;color:#ffffff;">
          Executive Strategic Counsel & Value Creation
        </h1>
        <p style="max-width:720px;color:#cbd5e1;font-size:1.2rem;line-height:1.7;margin:0;">
          ${esc(copy.about)}
        </p>
      </div>
    </section>
  `;

  const statsHtml = `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">$42.8B</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Enterprise Value Created</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">Direct board advisory delivering realized, auditable EBITDA expansion.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">180+</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Cross-Border Transactions</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">High-stakes M&A, divestitures, and post-merger integration milestones.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">30+ Yrs</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Boardroom Advisory Heritage</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">Continuous trusted counsel to Fortune 500 CEOs and sovereign wealth funds.</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;padding:26px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-family:'Cinzel',serif;font-size:2.4rem;font-weight:700;color:#0f2b59;">94%</div>
          <div style="font-weight:700;color:#0f172a;margin-top:6px;font-size:1.05rem;">Execution Success Rate</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:4px;line-height:1.5;">Structured milestone governance ensuring full realization of target synergies.</div>
        </div>
      </div>
    </section>
  `;

  const heritageHtml = `
    <section class="wrap" style="padding:50px 0 70px;">
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#d4af37;font-weight:800;letter-spacing:0.15em;">THE ADVISORY CHARTER</span>
          <h2 style="font-family:'Cinzel',serif;font-size:2.3rem;line-height:1.15;color:#0f2b59;margin:10px 0 20px;">
            Rigorous Quantitative Diagnostics Coupled with Battle-Tested Senior Counsel
          </h2>
          <p style="color:#475569;font-size:1.05rem;line-height:1.75;margin-bottom:20px;">
            Founded in 1994 by former investment banking heads and multinational chairmen, Corpox Consulting was created to dismantle the superficiality of conventional management consulting. We believe real strategic value is not discovered in slide templates, but forged at the intersection of granular balance-sheet economics and fearless organizational leadership.
          </p>
          <p style="color:#475569;font-size:1.05rem;line-height:1.75;margin:0 0 28px;">
            Every mandate is led directly by an equity managing partner who has successfully steered multi-billion-dollar P&L structures through severe economic downturns, regulatory transformations, and hostile market cycles.
          </p>
          <div style="display:flex;gap:20px;flex-wrap:wrap;">
            <div style="border-left:3px solid #d4af37;padding-left:14px;">
              <strong style="color:#0f2b59;display:block;font-size:1.1rem;font-family:'Cinzel',serif;">Skin in the Game</strong>
              <span style="color:#64748b;font-size:0.88rem;">Advisory fees indexed to audited balance sheet outcomes.</span>
            </div>
            <div style="border-left:3px solid #d4af37;padding-left:14px;">
              <strong style="color:#0f2b59;display:block;font-size:1.1rem;font-family:'Cinzel',serif;">Zero Junior Delegation</strong>
              <span style="color:#64748b;font-size:0.88rem;">Our partners sit at the negotiation table with you.</span>
            </div>
          </div>
        </div>

        <div style="background:#071324;color:#ffffff;border-top:3px solid #d4af37;border-radius:4px;padding:40px;">
          <h3 style="font-family:'Cinzel',serif;font-size:1.3rem;color:#fcd34d;margin:0 0 24px;letter-spacing:0.05em;">Four Core Pillars of Governance</h3>
          <div style="display:flex;flex-direction:column;gap:20px;">
            <div>
              <div style="font-family:'Cinzel',serif;font-weight:700;color:#d4af37;font-size:0.85rem;margin-bottom:4px;">PILLAR I</div>
              <strong style="color:#ffffff;font-size:1rem;">Capital Allocation Integrity</strong>
              <p style="color:#94a3b8;font-size:0.86rem;line-height:1.5;margin:4px 0 0;">Relentless hurdle-rate discipline ensuring free cash flows are reinvested exclusively into high-ROIC competitive moats.</p>
            </div>
            <div>
              <div style="font-family:'Cinzel',serif;font-weight:700;color:#d4af37;font-size:0.85rem;margin-bottom:4px;">PILLAR II</div>
              <strong style="color:#ffffff;font-size:1rem;">Cross-Border M&A Forensics</strong>
              <p style="color:#94a3b8;font-size:0.86rem;line-height:1.5;margin:4px 0 0;">Granular due diligence identifying hidden pension liabilities, regulatory exposure, and true organic churn rates.</p>
            </div>
            <div>
              <div style="font-family:'Cinzel',serif;font-weight:700;color:#d4af37;font-size:0.85rem;margin-bottom:4px;">PILLAR III</div>
              <strong style="color:#ffffff;font-size:1rem;">Enterprise Operational Restructuring</strong>
              <p style="color:#94a3b8;font-size:0.86rem;line-height:1.5;margin:4px 0 0;">Flattening bureaucratic silos and rebuilding business units around direct accountability and automated workflows.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const leadershipHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#d4af37;font-weight:800;letter-spacing:0.15em;">PARTNER COUNCIL</span>
        <h2 style="font-family:'Cinzel',serif;font-size:2.3rem;color:#0f2b59;margin:10px 0;">Managing Partners & Senior Directors</h2>
        <p style="color:#64748b;max-width:620px;margin:0 auto;font-size:1rem;">Senior advisors commanding decades of executive experience across sovereign funds, investment banking, and global conglomerates.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#071324;color:#d4af37;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">AS</div>
          <h3 style="font-family:'Cinzel',serif;font-size:1.15rem;color:#0f2b59;margin:0 0 4px;">Sir Alistair Sterling</h3>
          <div style="color:#d4af37;font-size:0.82rem;font-weight:700;text-transform:uppercase;margin-bottom:10px;">Senior Partner & Chairman</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">32 years steering international M&A, state divestitures, and sovereign fund boardrooms across Europe and North America.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#0f2b59;color:#fcd34d;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">VD</div>
          <h3 style="font-family:'Cinzel',serif;font-size:1.15rem;color:#0f2b59;margin:0 0 4px;">Vivienne Delacroix</h3>
          <div style="color:#d4af37;font-size:0.82rem;font-weight:700;text-transform:uppercase;margin-bottom:10px;">Managing Partner, EMEA Strategy</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">Specializes in antitrust regulatory clearances, cross-border corporate charters, and post-merger integration milestones.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#071324;color:#d4af37;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">JV</div>
          <h3 style="font-family:'Cinzel',serif;font-size:1.15rem;color:#0f2b59;margin:0 0 4px;">Jonathan Vance</h3>
          <div style="color:#d4af37;font-size:0.82rem;font-weight:700;text-transform:uppercase;margin-bottom:10px;">Head of Private Equity & M&A</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">Former bulge-bracket M&A managing director having advised on over $18B in realized transaction value.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#d4af37;color:#071324;font-weight:700;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">HL</div>
          <h3 style="font-family:'Cinzel',serif;font-size:1.15rem;color:#0f2b59;margin:0 0 4px;">Helena Lindqvist</h3>
          <div style="color:#d4af37;font-size:0.82rem;font-weight:700;text-transform:uppercase;margin-bottom:10px;">Partner, Restructuring & Turnaround</div>
          <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">Expert in distressed asset recapitalization, debt syndication, and emergency enterprise cash management.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="background:#071324;border-top:3px solid #d4af37;border-radius:4px;padding:48px;color:#ffffff;display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;">
        <div>
          <span style="font-family:'Cinzel',serif;color:#fcd34d;font-weight:700;font-size:0.82rem;letter-spacing:0.15em;">DIRECT BOARDROOM ACCESS</span>
          <h2 style="font-family:'Cinzel',serif;font-size:2.2rem;color:#ffffff;margin:8px 0;">Engage the Senior Partner Council</h2>
          <p style="color:#cbd5e1;font-size:1rem;margin:0;max-width:560px;">Request a confidential executive briefing with our managing directors.</p>
        </div>
        <a class="button" style="background:#d4af37;color:#071324;font-weight:800;border-radius:2px;padding:16px 36px;letter-spacing:0.06em;text-transform:uppercase;font-size:0.88rem;text-decoration:none;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Request Boardroom Briefing ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${statsHtml}${heritageHtml}${leadershipHtml}${ctaHtml}`;
}

export function renderConsultingContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="consulting-inner-hero" style="background:linear-gradient(135deg,#071324 0%,#0a192f 50%,#0f2b59 100%);color:#ffffff;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:2px solid #d4af37;">
      <div style="position:absolute;top:-100px;right:-50px;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,0.15) 0%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.4);padding:6px 18px;border-radius:2px;margin-bottom:20px;">
          <span style="font-size:0.8rem;font-weight:700;color:#fcd34d;letter-spacing:0.18em;text-transform:uppercase;">CONFIDENTIAL CLIENT INTAKE</span>
        </div>
        <h1 style="font-family:'Cinzel','Times New Roman',serif;font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.08;font-weight:600;letter-spacing:-0.02em;margin:0 0 20px;max-width:900px;color:#ffffff;">
          ${esc(ui.conversation || 'Initiate Boardroom Consultation')}
        </h1>
        <p style="max-width:720px;color:#cbd5e1;font-size:1.2rem;line-height:1.7;margin:0;">
          ${esc(ui.contactIntro || 'Engage our senior managing partners for confidential enterprise transformation, cross-border M&A counsel, or sovereign governance mandates.')}
        </p>
      </div>
    </section>
  `;

  const contentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: Partner Desks & Confidentiality -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:36px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <span class="eyebrow" style="color:#d4af37;font-weight:800;letter-spacing:0.15em;">DIRECT ACCESS</span>
          <h3 style="font-family:'Cinzel',serif;font-size:1.35rem;color:#0f2b59;margin:8px 0 24px;">Executive Desks & Hubs</h3>

          <div style="display:flex;flex-direction:column;gap:20px;font-size:0.95rem;">
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:#d4af37;text-transform:uppercase;margin-bottom:4px;">Managing Partner Desk Email</div>
              <a style="color:#0f2b59;font-weight:700;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d4af37;text-transform:uppercase;margin-bottom:4px;">Confidential Advisory Line</div>
                <a style="color:#0f2b59;font-weight:700;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d4af37;text-transform:uppercase;margin-bottom:4px;">Encrypted Communication Channel</div>
                <a style="color:#10b981;font-weight:700;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Direct ↗)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#d4af37;text-transform:uppercase;margin-bottom:4px;">Senior Partner Chambers</div>
                <span style="color:#334155;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;padding:20px;background:#071324;border-radius:4px;border:1px solid #1e293b;color:#ffffff;">
            <div style="font-size:0.85rem;color:#cbd5e1;line-height:1.6;">
              <strong style="color:#fcd34d;">Fiduciary Privilege:</strong> All prospective client discussions are guarded under strict non-disclosure and attorney-work product legal frameworks.<br>
              <strong style="color:#d4af37;">Conflict Review:</strong> Bilateral conflict of interest clearance completed within 24 business hours.
            </div>
          </div>
        </div>

        <!-- Right: Mandate Intake Form -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:36px;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <h2 style="font-family:'Cinzel',serif;font-size:1.6rem;color:#0f2b59;margin:0 0 8px;">Request Executive Mandate Consultation</h2>
          <p style="color:#64748b;font-size:0.95rem;margin:0 0 28px;">Specify your transaction scope, board restructuring timeline, or corporate initiative.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.name)} <span style="color:#d4af37;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:2px;padding:12px 14px;color:#0f2b59;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.email)} <span style="color:#d4af37;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:2px;padding:12px 14px;color:#0f2b59;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:2px;padding:12px 14px;color:#0f2b59;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:2px;padding:12px 14px;color:#0f2b59;font:inherit;">
                <option value="">— Select Target Strategic Practice —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.message)} <span style="color:#d4af37;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Confidential summary of current transaction, turnaround objective, or advisory requirement..." style="background:#ffffff;border:1px solid #cbd5e1;border-radius:2px;padding:12px 14px;color:#0f2b59;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#d4af37;color:#071324;font-weight:800;border:none;border-radius:2px;padding:14px 36px;cursor:pointer;font-size:0.9rem;letter-spacing:0.06em;text-transform:uppercase;">
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
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#d4af37;font-weight:800;letter-spacing:0.15em;">ENGAGEMENT PROTOCOLS</span>
        <h2 style="font-family:'Cinzel',serif;font-size:2.2rem;color:#0f2b59;margin:8px 0;">Boardroom Mandate FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:24px;">
          <h3 style="font-family:'Cinzel',serif;color:#0f2b59;font-size:1.15rem;margin:0 0 8px;">What are the typical retainer structures for strategic advisory?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">We operate on fixed quarterly board retainers that include direct access to named managing partners, augmented by milestone-based success bonuses tied directly to realized balance-sheet outcomes.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:24px;">
          <h3 style="font-family:'Cinzel',serif;color:#0f2b59;font-size:1.15rem;margin:0 0 8px;">How are cross-border regulatory approvals handled?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Our senior counsel works in tandem with your domestic and international outside legal counsel to coordinate merger filings, anti-trust inquiries, and sovereign investment review boards.</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:24px;">
          <h3 style="font-family:'Cinzel',serif;color:#0f2b59;font-size:1.15rem;margin:0 0 8px;">Can Corpox partners serve as independent board directors?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Subject to formal nomination committee approval and governance clearances, senior partners regularly accept independent non-executive directorships to oversee complex multi-year turnaround programs.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contentHtml}${faqHtml}`;
}

export function renderConsultingCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="consulting-inner-hero" style="background:linear-gradient(135deg,#071324 0%,#0a192f 50%,#0f2b59 100%);color:#ffffff;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:2px solid #d4af37;">
      <div style="position:absolute;top:-100px;right:-50px;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,0.15) 0%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.4);padding:6px 18px;border-radius:2px;margin-bottom:20px;">
          <span style="font-size:0.8rem;font-weight:700;color:#fcd34d;letter-spacing:0.18em;text-transform:uppercase;">PRACTICE DIRECTORY</span>
        </div>
        <h1 style="font-family:'Cinzel','Times New Roman',serif;font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.08;font-weight:600;letter-spacing:-0.02em;margin:0 0 20px;max-width:900px;color:#ffffff;">
          ${esc(ui.catalog || 'Executive Practice Areas & Advisory Disciplines')}
        </h1>
        <p style="max-width:720px;color:#cbd5e1;font-size:1.2rem;line-height:1.7;margin:0;">
          Explore our boardroom advisory practices, cross-border restructuring units, and sovereign wealth allocation disciplines.
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
            <article style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.03);display:flex;flex-direction:column;">
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#071324;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="padding:32px 24px 16px;font-size:2.4rem;">🏛️</div>
              `}
              <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
                <h3 style="font-family:'Cinzel',serif;margin:0 0 10px;font-size:1.35rem;font-weight:600;color:#0f2b59;">
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#0f2b59;text-decoration:none;">
                    ${esc(t.name)}
                  </a>
                </h3>
                <p style="color:#64748b;font-size:0.92rem;line-height:1.65;margin:0 0 20px;flex:1;">
                  ${esc(t.description || 'Executive advisory practice delivering quantitative competitive advantage.')}
                </p>
                <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:16px;margin-top:auto;">
                  <span style="font-size:0.85rem;color:#d4af37;font-weight:700;">Partner-Led</span>
                  <a style="color:#0f2b59;font-weight:700;font-size:0.9rem;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                    ${esc(ui.details || 'Review Practice')} →
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

export function renderConsultingDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset, options } = ctx;
  const p = draft.products.find(item => item.id === options.productId) || draft.products[0];
  if (!p) {
    return `<section class="wrap" style="padding:80px 0;"><h1>${esc(ui.noProducts || 'Practice Not Found')}</h1></section>`;
  }

  const t = translateProduct(p);
  const imgUrl = asset(p.imageAssetId);

  return `
    <section class="consulting-inner-hero" style="background:linear-gradient(135deg,#071324 0%,#0a192f 50%,#0f2b59 100%);color:#ffffff;padding:50px 0 40px;position:relative;overflow:hidden;border-bottom:2px solid #d4af37;">
      <div class="wrap">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.9rem;color:#cbd5e1;margin-bottom:16px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#cbd5e1;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#cbd5e1;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#fcd34d;">${esc(t.name)}</span>
        </div>
        <h1 style="font-family:'Cinzel','Times New Roman',serif;font-size:clamp(2rem,4vw,3.2rem);line-height:1.15;font-weight:600;letter-spacing:-0.02em;margin:0;color:#ffffff;">
          ${esc(t.name)}
        </h1>
      </div>
    </section>

    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:flex-start;">
        <div>
          ${imgUrl ? `
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #d4af37;border-radius:4px;overflow:hidden;padding:24px;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="max-width:100%;max-height:420px;object-fit:contain;border-radius:2px;">
            </div>
          ` : `
            <div style="background:#071324;border-top:3px solid #d4af37;border-radius:4px;padding:60px 24px;text-align:center;font-size:4rem;color:#d4af37;">⚖️</div>
          `}
        </div>

        <div>
          <div style="display:inline-block;background:rgba(212,175,55,0.12);border:1px solid #d4af37;color:#0f2b59;padding:4px 12px;border-radius:2px;font-size:0.8rem;font-weight:700;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.08em;">
            PRACTICE CHARTER
          </div>
          <p style="font-size:1.15rem;line-height:1.75;color:#475569;margin:0 0 24px;">
            ${esc(t.description || 'Executive strategic advisory discipline delivering quantitative competitive advantage.')}
          </p>

          <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:3px solid #0f2b59;border-radius:4px;padding:24px;margin-bottom:28px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
            <h3 style="font-family:'Cinzel',serif;color:#0f2b59;font-size:1.1rem;margin:0 0 16px;">Practice Specifications</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              ${p.material ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                  <span style="color:#64748b;">Statutory Jurisdiction</span>
                  <strong style="color:#0f172a;">${esc(p.material)}</strong>
                </div>
              ` : ''}
              ${p.dimensions ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                  <span style="color:#64748b;">Engagement Framework</span>
                  <strong style="color:#0f172a;">${esc(p.dimensions)}</strong>
                </div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Managing Desk</span>
                <strong style="color:#d4af37;">Senior Partner Council</strong>
              </div>
            </div>
          </div>

          <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#d4af37;color:#071324;font-weight:800;border-radius:2px;padding:16px 36px;display:inline-block;text-transform:uppercase;font-size:0.88rem;letter-spacing:0.06em;text-decoration:none;">
            ${esc(ui.inquire || 'Commission This Practice')} ↗
          </a>
        </div>
      </div>
    </section>
  `;
}

