import { esc, type ThemeContext } from './types';

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
          const imgUrl = asset(p.imageAssetId);
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
