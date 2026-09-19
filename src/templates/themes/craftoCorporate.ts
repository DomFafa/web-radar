import { esc, safeUrl, type ThemeContext } from './types';
import { parseAboutHighlights, getAboutStoryParagraphs, getAboutImages, getAboutHeadline } from './aboutHelper';
import { isTypedMaterialsSource } from '../materials-typed';

export function renderCraftoHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Global Corporate Architecture & Scalable Enterprise Governance',
    subtitle: 'We empower Fortune 500 leaders and high-growth multinationals to modernize operating models, accelerate cross-border mergers, and achieve decisive competitive dominance.',
    about: 'Crafto Corporate delivers sovereign-level advisory, digital infrastructure modernization, and operational restructuring backed by decades of executive leadership.',
    cta: 'Consult Corporate Advisory',
  };

  // 1. Hero Section (Quartz White Corporate Canvas)
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:linear-gradient(180deg,#f4f5fa 0%,#ffffff 100%);color:#23253d;padding:95px 0 85px;position:relative;overflow:hidden;border-bottom:1px solid #e5e7eb;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(87,88,223,0.12) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap hero-content" style="position:relative;z-index:2;">
        <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(87,88,223,0.3);background:rgba(87,88,223,0.08);padding:7px 18px;border-radius:6px;margin-bottom:24px;">
          <span style="display:inline-block;width:8px;height:8px;background:#5758df;border-radius:2px;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#5758df;">CRAFTO GLOBAL ENTERPRISE GROUP · ADVISORY 2026</span>
        </div>
        <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(3rem, 6.2vw, 5.2rem);line-height:1.02;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;color:#23253d;max-width:960px;margin:0 0 24px;">
          ${esc(copy.headline)}
        </h1>
        <p data-reveal="fade-up" style="max-width:680px;color:#64748b;font-size:1.22rem;line-height:1.65;margin:0 0 38px;">
          ${esc(copy.subtitle)}
        </p>
        <div data-reveal="fade-up" style="display:flex;gap:16px;flex-wrap:wrap;">
          <a class="button" style="background:#5758df;color:#ffffff;font-weight:800;border-radius:6px;padding:16px 36px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.85rem;box-shadow:0 4px 15px rgba(87,88,223,0.25);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Consult Advisory')} ↗
          </a>
          <a class="button" style="background:#ffffff;border:1px solid #cbd5e1;color:#23253d;border-radius:6px;padding:16px 32px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.85rem;box-shadow:0 2px 8px rgba(0,0,0,0.04);" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Capabilities →
          </a>
        </div>
        <a href="#pillars" class="wr-scroll-down" aria-label="Scroll to content">↓</a>
      </div>
    </section>
  `;

  // 2. Three Pillar Feature Strip directly below hero
  const pillarsHtml = `
    <section id="pillars" style="background:#ffffff;border-bottom:1px solid #e5e7eb;color:#23253d;padding:36px 0;">
      <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="display:flex;align-items:flex-start;gap:16px;padding:16px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;">
          <div style="font-size:1.8rem;color:#5758df;font-weight:900;line-height:1;">01</div>
          <div>
            <h4 style="margin:0 0 4px;font-size:1.05rem;font-weight:800;color:#23253d;text-transform:uppercase;letter-spacing:0.04em;">Enterprise Strategy</h4>
            <p style="margin:0;color:#64748b;font-size:0.88rem;line-height:1.5;">Modernizing business models to navigate complex global geopolitical realities.</p>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="display:flex;align-items:flex-start;gap:16px;padding:16px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;">
          <div style="font-size:1.8rem;color:#5758df;font-weight:900;line-height:1;">02</div>
          <div>
            <h4 style="margin:0 0 4px;font-size:1.05rem;font-weight:800;color:#23253d;text-transform:uppercase;letter-spacing:0.04em;">Cross-Border Governance</h4>
            <p style="margin:0;color:#64748b;font-size:0.88rem;line-height:1.5;">Comprehensive risk oversight, regulatory compliance, and ESG audit assurance.</p>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="display:flex;align-items:flex-start;gap:16px;padding:16px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;">
          <div style="font-size:1.8rem;color:#5758df;font-weight:900;line-height:1;">03</div>
          <div>
            <h4 style="margin:0 0 4px;font-size:1.05rem;font-weight:800;color:#23253d;text-transform:uppercase;letter-spacing:0.04em;">Digital Modernization</h4>
            <p style="margin:0;color:#64748b;font-size:0.88rem;line-height:1.5;">Deploying autonomous enterprise architectures that unlock exponential productivity.</p>
          </div>
        </div>
      </div>
    </section>
  `;

  // 3. Corporate Metrics
  const metricsHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <div style="font-size:2.8rem;font-weight:900;color:#5758df;letter-spacing:-1px;"><span data-counter="500" data-suffix="+">500+</span></div>
          <div style="font-weight:800;color:#23253d;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Enterprise Deployments</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Proven institutional implementation track record across 42 countries.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <div style="font-size:2.8rem;font-weight:900;color:#5758df;letter-spacing:-1px;"><span data-counter="35" data-suffix="+">35+</span></div>
          <div style="font-weight:800;color:#23253d;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Countries & Regions</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Direct executive presence in New York, London, Zurich, Tokyo, and Singapore.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <div style="font-size:2.8rem;font-weight:900;color:#5758df;letter-spacing:-1px;"><span data-counter="98" data-suffix="%">98%</span></div>
          <div style="font-weight:800;color:#23253d;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Client Retention Rate</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Multi-year advisory engagements with Fortune 500 board executives.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <div style="font-size:2.8rem;font-weight:900;color:#5758df;letter-spacing:-1px;"><span data-counter="45" data-prefix="$" data-suffix="B+">$45B+</span></div>
          <div style="font-weight:800;color:#23253d;margin-top:6px;font-size:1.05rem;text-transform:uppercase;">Market Cap Advised</div>
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
          <span class="eyebrow" style="color:#5758df;font-weight:800;letter-spacing:0.1em;">STRATEGIC BUSINESS UNITS</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#23253d;text-transform:uppercase;font-weight:900;">Advisory & Operational Practices</h2>
        </div>
        <a class="text-link" style="color:#5758df;font-weight:800;text-transform:uppercase;font-size:0.88rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = ctx.productMainImage(p);
          const units = ['SBU-01', 'SBU-02', 'SBU-03', 'SBU-04', 'SBU-05', 'SBU-06'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                  <span style="font-size:0.8rem;font-weight:900;color:#5758df;letter-spacing:0.1em;">${units[idx % units.length]}</span>
                  <span style="font-size:0.75rem;font-weight:700;color:#64748b;text-transform:uppercase;">Institutional Mandate</span>
                </div>
                ${imgUrl ? `<div class="product-image" style="margin-bottom:16px;border-radius:4px;overflow:hidden;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="color:#23253d;margin:0 0 10px;font-size:1.3rem;font-weight:800;text-transform:uppercase;">${esc(t.name)}</h3>
                <p style="color:#64748b;line-height:1.6;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Enterprise advisory mandate focused on operational governance and shareholder value.')}</p>
              </div>
              <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#5758df;font-weight:800;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  View Mandate Brief →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 5. Executive Endorsements
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div data-reveal="fade-up" style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#5758df;font-weight:800;letter-spacing:0.12em;">EXECUTIVE ENDORSEMENTS</span>
        <h2 style="font-size:2rem;color:#23253d;text-transform:uppercase;font-weight:900;margin:8px 0;">Trusted by Fortune 500 Board Leadership</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#5758df;font-size:1.4rem;font-weight:900;margin-bottom:8px;">“</div>
          <p style="color:#475569;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Crafto guided our multinational merger across three continents with unmatched legal and organizational precision."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:#23253d;color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">EA</div>
            <div><div style="font-weight:800;color:#23253d;font-size:0.9rem;">Edward Anderson</div><div style="color:#64748b;font-size:0.8rem;">Chairman of the Board, Global Infrastructure plc</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#5758df;font-size:1.4rem;font-weight:900;margin-bottom:8px;">“</div>
          <p style="color:#475569;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Their digital modernization framework trimmed $180M in recurring IT overhead while increasing operational throughput by 40%."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:#5758df;color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">MS</div>
            <div><div style="font-weight:800;color:#23253d;font-size:0.9rem;">Miriam Sommer</div><div style="color:#64748b;font-size:0.8rem;">Chief Strategy Officer, Zurich Heavy Industries</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="color:#5758df;font-size:1.4rem;font-weight:900;margin-bottom:8px;">“</div>
          <p style="color:#475569;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The definitive standard for institutional governance. Their strategic roadmap aligned our 14 business units seamlessly."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:#334155;color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;">KK</div>
            <div><div style="font-weight:800;color:#23253d;font-size:0.9rem;">Kenji Kurata</div><div style="color:#64748b;font-size:0.8rem;">Managing Director, Asia-Pacific Holdings</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 6. Contact / Advisory Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#f4f5fa;color:#23253d;padding:80px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
      <div class="wrap" data-reveal="fade-up" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#5758df;font-weight:800;letter-spacing:0.15em;">EXECUTIVE PARTNERSHIP</span>
          <h2 style="font-size:2.4rem;margin:10px 0;max-width:680px;color:#23253d;text-transform:uppercase;font-weight:900;">
            Elevate your organization to enterprise excellence.
          </h2>
          <p style="color:#64748b;font-size:1.1rem;margin:0;max-width:550px;">Initiate a confidential strategic dialogue with our senior managing directors.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:#5758df;color:#ffffff;font-weight:900;border-radius:6px;padding:16px 36px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.88rem;box-shadow:0 4px 15px rgba(87,88,223,0.25);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Initiate Executive Consultation ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${pillarsHtml}${metricsHtml}${productsHtml}${testimonialsHtml}${contactBandHtml}`;
}

function renderLegacyCraftoAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'Crafto Corporate delivers sovereign-level advisory, digital infrastructure modernization, and operational restructuring backed by decades of executive leadership.',
  };

  const headline = company.aboutHeadline || 'Institutional Rigor & Sovereign Governance';
  const customImg = company.aboutImageAssetId ? asset(company.aboutImageAssetId) : '';
  const secondaryCustomImg = company.aboutSecondaryImageAssetId ? asset(company.aboutSecondaryImageAssetId) : '';
  const customHighlights = company.aboutHighlights ? parseAboutHighlights(company.aboutHighlights) : null;
  const customStoryParas = company.aboutStory ? getAboutStoryParagraphs(company) : null;

  const heroHtml = `
    <section class="crafto-inner-hero" style="background:#0b1120;color:#ffffff;padding:80px 0 60px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(0,71,255,0.2) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(0,71,255,0.4);background:rgba(0,71,255,0.12);padding:6px 16px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;background:#0047ff;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;">INSTITUTIONAL CHARTER · GLOBAL ADVISORY</span>
        </div>
        <h1 style="font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.05;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;margin:0 0 20px;max-width:900px;color:#ffffff;">
          ${esc(headline)}
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0;">
          ${esc(copy.about)}
        </p>
      </div>
    </section>
  `;

  const statsHtml = customHighlights ? `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        ${customHighlights.map((h) => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
            <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;">
              <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
              </span>
            </div>
            <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">${esc(h.label)}</div>
            ${h.desc ? `<div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">${esc(h.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;"><span data-counter="45" data-prefix="$" data-suffix="B+">$45B+</span></div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Market Cap Advised</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Direct board advisory guiding multi-billion enterprise restructurings worldwide.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;"><span data-counter="45" data-suffix="+">45+</span></div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Global Markets</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Active cross-border regulatory counsel across EMEA, Americas, and APAC.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;"><span data-counter="500" data-suffix="+">500+</span></div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Enterprise Mandates</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Executed corporate modernization programs with 98% multi-year client retention.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:#0047ff;letter-spacing:-1px;"><span data-counter="25" data-suffix="+">25+</span></div>
          <div style="font-weight:800;color:#0f172a;margin-top:6px;font-size:1rem;text-transform:uppercase;">Years Executive Trust</div>
          <div style="font-size:0.85rem;color:#64748b;margin-top:4px;line-height:1.5;">Unbroken record of fiduciary responsibility and corporate resilience.</div>
        </div>
      </div>
    </section>
  `;

  const missionHtml = `
    <section class="wrap" style="padding:50px 0 70px;">
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
        <div data-reveal="fade-up">
          <span class="eyebrow" style="color:#0047ff;font-weight:800;letter-spacing:0.12em;">THE CRAFTO DOCTRINE</span>
          <h2 style="font-size:2.4rem;line-height:1.12;color:#0f172a;margin:10px 0 20px;text-transform:uppercase;font-weight:900;">
            Institutional Modernization Built on Uncompromising Rigor
          </h2>
          ${customStoryParas ? `
            <div style="color:#475569;font-size:1.05rem;line-height:1.75;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${customStoryParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
          ` : `
            <p style="color:#475569;font-size:1.05rem;line-height:1.75;margin-bottom:20px;">
              Modern enterprises face unprecedented volatility across supply chains, statutory frameworks, and technological paradigms. Crafto was founded on a singular conviction: lasting market dominance requires sovereign operational resilience, not reactive optimization.
            </p>
            <p style="color:#475569;font-size:1.05rem;line-height:1.75;margin:0 0 28px;">
              We pair elite executive practitioners with proprietary analytical infrastructure to advise sovereign wealth funds, multinational conglomerates, and high-growth boards on structural value preservation.
            </p>
          `}
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

        <div class="wr-hero-float wr-card-hover" data-reveal="fade-up" style="background:#0f172a;color:#ffffff;border:1px solid #1e293b;padding:40px;">
          ${customImg ? `
            <div style="border:1px solid #1e293b;overflow:hidden;margin-bottom:20px;">
              <img src="${esc(customImg)}" alt="${esc(company.name)}" style="width:100%;height:220px;object-fit:cover;display:block;" loading="lazy">
            </div>
          ` : ''}
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
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="width:60px;height:60px;background:#0b1120;color:#0047ff;font-weight:900;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">MV</div>
          <h3 style="font-size:1.15rem;margin:0 0 4px;color:#0f172a;text-transform:uppercase;font-weight:800;">Marcus Vance</h3>
          <div style="color:#0047ff;font-size:0.82rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">Managing Director, Americas</div>
          <p style="color:#64748b;font-size:0.86rem;line-height:1.5;margin:0;">Former Fortune 100 COO with 28 years directing global supply networks and enterprise restructuring.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="width:60px;height:60px;background:#0047ff;color:#ffffff;font-weight:900;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">ES</div>
          <h3 style="font-size:1.15rem;margin:0 0 4px;color:#0f172a;text-transform:uppercase;font-weight:800;">Dame Eleanor Sterling</h3>
          <div style="color:#0047ff;font-size:0.82rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">Head of Sovereign Advisory, EMEA</div>
          <p style="color:#64748b;font-size:0.86rem;line-height:1.5;margin:0;">Senior advisor to multilateral finance institutions and central sovereign investment portfolios.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
          <div style="width:60px;height:60px;background:#0f172a;color:#0047ff;font-weight:900;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">KT</div>
          <h3 style="font-size:1.15rem;margin:0 0 4px;color:#0f172a;text-transform:uppercase;font-weight:800;">Kenji Takahashi</h3>
          <div style="color:#0047ff;font-size:0.82rem;font-weight:800;text-transform:uppercase;margin-bottom:12px;">Managing Director, APAC & Technology</div>
          <p style="color:#64748b;font-size:0.86rem;line-height:1.5;margin:0;">Specializes in cross-border digital architecture integration, fintech infrastructure, and algorithmic governance.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #0f172a;padding:28px;">
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
      <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #0047ff;padding:48px;color:#ffffff;display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;">
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

function renderModernCraftoAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'Crafto Corporate delivers sovereign-level advisory, digital infrastructure modernization, and operational restructuring backed by decades of executive leadership.',
  };
  const isZh = (ctx.lang as string) === 'zh';

  const defaultHeadline = isZh
    ? '主权级产业治理与跨国工业企业集团战略重塑'
    : 'Institutional Rigor & Sovereign Conglomerate Governance';
  const headline = getAboutHeadline(company, defaultHeadline);

  const defaultStory = [
    isZh
      ? `${company.name} 汇聚全球顶尖产业领袖、主权基金顾问与数智架构专家，专为跨国企业集团、大型工业实体及主权投资机构提供全方位战略治理与组织重构咨询。我们深度赋能董事会决策层，化解复杂多变的地缘政治、多辖区监管及供应链重塑挑战。`
      : `Crafto Corporate delivers sovereign-level advisory, digital infrastructure modernization, and operational restructuring backed by decades of executive leadership.`,
    isZh
      ? '我们坚守零利益冲突的中立信义准则，通过自研跨法域穿透式分析模型与数字化治理中台，将陈旧被动的传统运营模式迭代为具备高抗风险韧性的现代化自治体系，捍卫客户在全球竞争中的决定性优势。'
      : `We pair elite executive practitioners with proprietary analytical infrastructure to advise sovereign wealth funds, multinational conglomerates, and high-growth boards on structural value preservation and competitive dominance.`,
  ];
  const storyParas = getAboutStoryParagraphs(company, defaultStory[0]);
  const paras = company.aboutStory ? storyParas : defaultStory;

  const { primary: aboutImg } = getAboutImages(ctx, path('templates/crafto/about-corporate.jpg'));

  const stats = parseAboutHighlights(company.aboutHighlights, [
    { value: '$45B+', num: 45, prefix: '$', suffix: 'B+', label: isZh ? '咨询指导企业市值规模' : 'Market Cap Advised', desc: isZh ? '直接服务于全球领军企业董事会' : 'Direct board advisory for multi-billion enterprises' },
    { value: '45+', num: 45, suffix: '+', label: isZh ? '全球主流业务运营法域' : 'Global Markets', desc: isZh ? '跨越欧美亚三大核心经济圈' : 'Active cross-border regulatory counsel across EMEA, Americas & APAC' },
    { value: '500+', num: 500, suffix: '+', label: isZh ? '大型跨国重组执行委任' : 'Enterprise Mandates', desc: isZh ? '复杂跨国并购、重组与剥离项目' : 'Executed modernization programs with 98% retention' },
    { value: '25+', num: 25, suffix: '+', label: isZh ? '董事会信赖与战略治理年限' : 'Years Executive Trust', desc: isZh ? '历经多轮经济周期的严苛检验' : 'Unbroken record of fiduciary responsibility and resilience' },
  ]);

  // Anti-Blank Box Vector SVG: Quartz-White Global Fleet Command Deck (Light Corporate Matrix)
  const fleetSvg = `
    <svg viewBox="0 0 720 460" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block;background:#f4f5fa;">
      <defs>
        <radialGradient id="craftoCommandLight" cx="60%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#f0f2f8" stop-opacity="1"/>
        </radialGradient>
      </defs>

      <!-- Chassis Background -->
      <rect width="720" height="460" fill="url(#craftoCommandLight)"/>
      <rect x="14" y="14" width="692" height="432" fill="none" stroke="#e2e8f0" stroke-width="1.5" rx="6"/>
      <rect x="20" y="20" width="680" height="420" fill="none" stroke="#5758df" stroke-width="1" stroke-opacity="0.25" rx="4"/>

      <!-- Command Header -->
      <g transform="translate(36, 46)">
        <circle cx="6" cy="6" r="4" fill="#5758df"/>
        <text x="18" y="10" fill="#23253d" font-size="11" font-family="'Plus Jakarta Sans',sans-serif" font-weight="800" letter-spacing="2">GLOBAL INDUSTRIAL FLEET COMMAND // CONGLOMERATE CENTRAL DECK</text>
        <text x="520" y="10" fill="#5758df" font-size="10" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">TELEMETRY: ACTIVE</text>
        <line x1="0" y1="20" x2="648" y2="20" stroke="#e2e8f0" stroke-width="1"/>
      </g>

      <!-- World Node Mesh & Vector Flight Paths (Panel A) -->
      <g transform="translate(36, 80)">
        <rect x="0" y="0" width="410" height="240" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="6"/>
        
        <!-- Grid Lines -->
        <line x1="0" y1="60" x2="410" y2="60" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="0" y1="120" x2="410" y2="120" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="0" y1="180" x2="410" y2="180" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="100" y1="0" x2="100" y2="240" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="200" y1="0" x2="200" y2="240" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="300" y1="0" x2="300" y2="240" stroke="#f1f5f9" stroke-width="1"/>

        <!-- Radar Sweep Circles -->
        <circle cx="205" cy="120" r="85" fill="none" stroke="#5758df" stroke-width="1" stroke-opacity="0.2" stroke-dasharray="4,4"/>
        <circle cx="205" cy="120" r="45" fill="none" stroke="#5758df" stroke-width="1" stroke-opacity="0.3"/>
        <circle cx="205" cy="120" r="4" fill="#5758df"/>

        <!-- Intercontinental Arcs -->
        <path d="M 60 85 Q 140 30, 205 70 T 340 100" fill="none" stroke="#5758df" stroke-width="2" stroke-dasharray="6,4"/>
        <path d="M 75 160 Q 180 190, 290 145" fill="none" stroke="#23253d" stroke-width="1.5" stroke-dasharray="4,3"/>

        <!-- Hub Markers -->
        <circle cx="60" cy="85" r="5" fill="#5758df"/>
        <text x="70" y="88" fill="#23253d" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="800">AMER // NYC</text>

        <circle cx="205" cy="70" r="5" fill="#23253d"/>
        <text x="215" y="73" fill="#23253d" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="800">EMEA // FRA</text>

        <circle cx="340" cy="100" r="5" fill="#5758df"/>
        <text x="270" y="118" fill="#23253d" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="800">APAC // SGP</text>

        <circle cx="250" cy="110" r="4" fill="#f59e0b"/>
        <text x="258" y="113" fill="#b45309" font-size="8" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">DXB</text>

        <!-- Bottom Panel Status -->
        <rect x="0" y="210" width="410" height="30" fill="#f8fafc" stroke="#e2e8f0" rx="0 0 6 6"/>
        <text x="12" y="228" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">TRANS-OCEANIC PACKET LATENCY: 12.4ms // PACKET LOSS: 0.00%</text>
      </g>

      <!-- SBU Cluster Telemetry (Panel B) -->
      <g transform="translate(460, 80)">
        <!-- SBU 1 -->
        <rect x="0" y="0" width="224" height="74" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="6"/>
        <rect x="0" y="0" width="4" height="74" fill="#5758df" rx="3 0 0 3"/>
        <text x="14" y="18" fill="#5758df" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="800">SBU-01 // ADVANCED FABRICATION</text>
        <text x="14" y="38" fill="#23253d" font-size="16" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900">99.98%</text>
        <text x="80" y="38" fill="#10b981" font-size="10" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">OEE OPTIMAL</text>
        <text x="14" y="58" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif">Zero-defect robotics cluster</text>

        <!-- SBU 2 -->
        <rect x="0" y="83" width="224" height="74" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="6"/>
        <rect x="0" y="83" width="4" height="74" fill="#23253d" rx="3 0 0 3"/>
        <text x="14" y="101" fill="#23253d" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="800">SBU-02 // AUTONOMOUS LOGISTICS</text>
        <text x="14" y="121" fill="#23253d" font-size="16" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900">4.8M TEU</text>
        <text x="96" y="121" fill="#5758df" font-size="10" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">GLOBAL TRANSIT</text>
        <text x="14" y="141" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif">Adaptive routing & port AI</text>

        <!-- SBU 3 -->
        <rect x="0" y="166" width="224" height="74" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="6"/>
        <rect x="0" y="166" width="4" height="74" fill="#10b981" rx="3 0 0 3"/>
        <text x="14" y="184" fill="#10b981" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="800">SBU-03 // CLEAN ENERGY GRID</text>
        <text x="14" y="204" fill="#23253d" font-size="16" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900">14.2 GW</text>
        <text x="86" y="204" fill="#10b981" font-size="10" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">ZERO CARBON</text>
        <text x="14" y="224" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif">Decarbonized industrial grid</text>
      </g>
    </svg>
  `;

  return `
    <div class="crafto-about-modern" style="background:#ffffff;color:#23253d;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif;">
      <!-- Quartz White Hero with Subtle Corporate Rings -->
      <section class="crafto-inner-hero" style="background:linear-gradient(180deg,#f4f5fa 0%,#ffffff 100%);color:#23253d;padding:90px 0 76px;position:relative;overflow:hidden;border-bottom:1px solid #e5e7eb;">
        <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(87,88,223,0.12) 0%,transparent 70%);pointer-events:none;"></div>

        <div class="wrap" style="max-width:1240px;margin:0 auto;padding:0 24px;position:relative;z-index:2;">
          <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:48px;align-items:center;">
            <!-- Left Statement -->
            <div data-reveal="fade-up">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(87,88,223,0.08);border:1px solid rgba(87,88,223,0.25);padding:6px 18px;border-radius:6px;margin-bottom:22px;">
                <span style="display:inline-block;width:8px;height:8px;background:#5758df;border-radius:2px;"></span>
                <span style="font-size:0.8rem;font-weight:800;color:#5758df;letter-spacing:0.12em;text-transform:uppercase;">
                  ${isZh ? `主权产业战略参谋 · 委任始于 ${esc(company.establishedYear || '1998')}` : `SOVEREIGN INDUSTRY CHARTER · EST. ${esc(company.establishedYear || '1998')}`}
                </span>
              </div>

              <h1 style="font-size:clamp(2.3rem, 4.4vw, 3.8rem);line-height:1.05;font-weight:900;letter-spacing:-0.035em;text-transform:uppercase;color:#23253d;margin:0 0 22px;">
                ${esc(headline)}
              </h1>

              <div style="border-left:3px solid #5758df;padding-left:18px;margin-bottom:28px;">
                <p style="color:#64748b;font-size:1.15rem;line-height:1.7;margin:0;">
                  ${esc(copy.about || (isZh ? '为跨国企业集团与主权投资实体交付顶层治理、资产兼并重组及数字化产业舰队现代化的全流程参谋。' : 'Crafto Corporate delivers sovereign-level advisory, digital infrastructure modernization, and operational restructuring backed by decades of executive leadership.'))}
                </p>
              </div>

              <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#5758df;color:#ffffff;font-weight:900;border-radius:6px;padding:16px 36px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.85rem;box-shadow:0 4px 15px rgba(87,88,223,0.25);text-decoration:none;display:inline-block;">
                  ${isZh ? '启动董事会闭门咨询 ↗' : 'Initiate Executive Consultation ↗'}
                </a>
                ${company.capabilities ? `
                  <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:14px 20px;font-size:0.84rem;color:#23253d;font-weight:700;">
                    <span>🏛️</span> ${esc(company.capabilities.slice(0, 42))}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Right: Anti-Blank Box Vector SVG HUD -->
            <div data-reveal="fade-up" style="position:relative;">
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:8px;box-shadow:0 12px 36px rgba(35,37,61,0.06);position:relative;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e5e7eb;border-radius:4px 4px 0 0;font-size:0.8rem;color:#64748b;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="width:8px;height:8px;background:#5758df;display:inline-block;border-radius:2px;"></span>
                    <span style="font-weight:800;color:#23253d;text-transform:uppercase;">GLOBAL FLEET COMMAND MATRIX</span>
                  </div>
                  <span style="color:#5758df;font-weight:800;">ACTIVE TELEMETRY</span>
                </div>

                <div style="position:relative;min-height:380px;border-radius:0 0 4px 4px;overflow:hidden;background:#f4f5fa;">
                  <div style="position:absolute;inset:0;z-index:1;">
                    ${fleetSvg}
                  </div>
                  ${aboutImg ? `
                    <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0.92;transition:opacity 0.3s ease;" onerror="this.style.display='none'">
                  ` : ''}
                </div>
              </div>

              <!-- Floating Live Telemetry Badge -->
              <div style="position:absolute;bottom:-18px;left:-16px;background:#ffffff;border:1px solid #d5d7f5;padding:10px 18px;border-radius:6px;box-shadow:0 8px 24px rgba(87,88,223,0.12);display:flex;align-items:center;gap:12px;z-index:3;">
                <span style="font-size:1.5rem;">🌍</span>
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#5758df;letter-spacing:0.08em;text-transform:uppercase;">Fiduciary Compliance</div>
                  <div style="font-size:0.88rem;font-weight:800;color:#23253d;">45+ Sovereign Markets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Fiduciary Governance & Operational Metrics Bar -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:40px 24px 20px;">
        <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-top:3px solid #5758df;border-radius:6px;box-shadow:0 4px 20px rgba(35,37,61,0.03);overflow:hidden;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));">
            ${stats.map((s, idx) => `
              <div style="padding:28px 24px;border-right:${idx < stats.length - 1 ? '1px solid #e5e7eb' : 'none'};position:relative;">
                <div style="font-size:0.75rem;color:#5758df;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">
                  INDEX // PILLAR-0${idx + 1}
                </div>
                <div style="font-size:clamp(2.2rem, 3.6vw, 2.8rem);font-weight:900;color:#23253d;line-height:1.1;letter-spacing:-0.03em;">
                  <span data-counter="${s.num}" ${s.prefix ? `data-prefix="${esc(s.prefix)}"` : ''} ${s.suffix ? `data-suffix="${esc(s.suffix)}"` : ''}>
                    ${esc(s.value)}
                  </span>
                </div>
                <div style="font-weight:800;color:#23253d;margin-top:8px;font-size:0.95rem;text-transform:uppercase;">
                  ${esc(s.label)}
                </div>
                ${s.desc ? `
                  <div style="font-size:0.84rem;color:#64748b;margin-top:6px;line-height:1.5;">
                    ${esc(s.desc)}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Global Governance Architecture & Strategic SBU Clusters -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:50px 24px 60px;">
        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:flex-start;">
          <!-- Left Narrative -->
          <div data-reveal="fade-up">
            <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:#5758df;text-transform:uppercase;">
              ${isZh ? '全球产业治理与跨法域抗脆弱体系' : 'GLOBAL GOVERNANCE & ANTI-FRAGILITY'}
            </span>
            <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);line-height:1.2;color:#23253d;margin:12px 0 22px;font-weight:900;text-transform:uppercase;">
              ${isZh ? '构筑穿透周期的主权级企业治理航母' : 'Engineering Generational Resilience for Global Multinationals'}
            </h2>
            <div style="color:#475569;font-size:1.04rem;line-height:1.8;display:flex;flex-direction:column;gap:18px;">
              ${paras.map(p => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px;">
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-left:3px solid #5758df;border-radius:6px;padding:18px 20px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
                <strong style="color:#5758df;display:block;font-size:0.95rem;margin-bottom:4px;text-transform:uppercase;">
                  🏛️ ${isZh ? '多边法域监管穿透分析' : 'Cross-Border Compliance'}
                </strong>
                <span style="color:#64748b;font-size:0.86rem;line-height:1.5;">
                  ${isZh ? '覆盖全球 45+ 核心经济体的监管合规穿透架构，确保跨国投资零阻碍合规运转。' : 'Seamless multi-jurisdictional compliance oversight safeguarding international operating assets.'}
                </span>
              </div>
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-left:3px solid #23253d;border-radius:6px;padding:18px 20px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
                <strong style="color:#23253d;display:block;font-size:0.95rem;margin-bottom:4px;text-transform:uppercase;">
                  🛡️ ${isZh ? '资本纪律与反脆弱对冲' : 'Capital Discipline & Hedging'}
                </strong>
                <span style="color:#64748b;font-size:0.86rem;line-height:1.5;">
                  ${isZh ? '建立动态抗风险对冲闭环与充沛流动性防火墙，在极端宏观波动中保持强劲扩张动能。' : 'Dynamic liquidity reserves and risk-insulation firewalls guarding corporate valuation.'}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Core SBU Clusters -->
          <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:32px;box-shadow:0 8px 30px rgba(35,37,61,0.04);">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:14px;margin-bottom:20px;">
              <span style="font-size:0.8rem;font-weight:800;color:#5758df;text-transform:uppercase;">SBU DIVISIONS</span>
              <span style="font-size:0.75rem;background:rgba(87,88,223,0.08);color:#5758df;padding:3px 8px;border-radius:4px;font-weight:800;">GLOBAL LEADERSHIP</span>
            </div>

            <h3 style="font-size:1.25rem;font-weight:900;text-transform:uppercase;color:#23253d;margin:0 0 16px;">
              ${isZh ? '三大支柱产业集群' : 'Strategic Industry Pillars'}
            </h3>

            <div style="display:flex;flex-direction:column;gap:18px;">
              <div style="border-left:3px solid #5758df;padding-left:16px;">
                <strong style="color:#23253d;font-size:0.92rem;text-transform:uppercase;">
                  1. ${isZh ? '高端智能精密制造 (Advanced Fabrication)' : 'Advanced Industrial Precision'}
                </strong>
                <p style="color:#64748b;font-size:0.84rem;line-height:1.5;margin:4px 0 0;">
                  ${isZh ? '以微米级公差自适应闭环机器人集群，赋能航空、能源与半导体工业基石。' : 'Micron-level automated robotics clusters empowering aerospace, energy, and precision tooling.'}
                </p>
              </div>

              <div style="border-left:3px solid #23253d;padding-left:16px;">
                <strong style="color:#23253d;font-size:0.92rem;text-transform:uppercase;">
                  2. ${isZh ? '洲际自适应物流网络 (Global Transit)' : 'Autonomous Intercontinental Logistics'}
                </strong>
                <p style="color:#64748b;font-size:0.84rem;line-height:1.5;margin:4px 0 0;">
                  ${isZh ? '调度超 480 万 TEU 吞吐量的智能自适应海运与港口 AI 调度中枢，平滑供应链波动。' : 'Orchestrating 4.8M+ TEU container throughput via predictive route scheduling.'}
                </p>
              </div>

              <div style="border-left:3px solid #10b981;padding-left:16px;">
                <strong style="color:#23253d;font-size:0.92rem;text-transform:uppercase;">
                  3. ${isZh ? '吉瓦级绿色能源电网 (Clean Energy Grid)' : 'Gigawatt-Scale Decarbonized Grid'}
                </strong>
                <p style="color:#64748b;font-size:0.84rem;line-height:1.5;margin:4px 0 0;">
                  ${isZh ? '管理 14.2 GW 零碳能源资产，协助大型跨国集团顺利达成 ESG 审计双重认证。' : 'Overseeing 14.2 GW of clean energy infrastructure supporting multinational ESG compliance.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sovereign Executive CTA -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:20px 24px 85px;">
        <div data-reveal="fade-up" style="background:linear-gradient(135deg, #f4f5fa 0%, #ffffff 60%, #eef0fa 100%);border:1px solid #d5d7f5;border-radius:6px;padding:48px 40px;color:#23253d;box-shadow:0 10px 30px rgba(87,88,223,0.06);">
          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:40px;align-items:center;">
            <div>
              <span style="color:#5758df;font-weight:800;font-size:0.82rem;letter-spacing:0.12em;text-transform:uppercase;">
                [EXECUTIVE TASKFORCE // DIRECT ENGAGEMENT]
              </span>
              <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.5rem);color:#23253d;margin:8px 0 14px;font-weight:900;text-transform:uppercase;">
                ${isZh ? '开启集团战略重组与治理委任磋商' : 'Initiate Sovereign Corporate Advisory Mandate'}
              </h2>
              <p style="color:#64748b;font-size:1.02rem;line-height:1.7;margin:0;">
                ${isZh ? '由 Crafto 资深合伙人组成的专业任务组将在 48 小时内为您呈交保密初步案卷评估，保障董事会决策的稳健与决断。' : 'Deploy our senior executive taskforce to audit conglomerate risk vectors, optimize balance sheets, and ensure long-term competitive dominance.'}
              </p>
            </div>

            <div style="text-align:center;background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:28px;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
              <div style="font-size:0.82rem;color:#64748b;margin-bottom:18px;">
                ${isZh ? '执行委员会战略案卷闭门咨询开放' : 'CONFIDENTIAL BOARDROOM BRIEFING // BILATERAL NDA'}
              </div>
              <a class="button" style="background:#5758df;color:#ffffff;font-weight:900;border-radius:6px;padding:16px 36px;box-shadow:0 4px 15px rgba(87,88,223,0.25);text-transform:uppercase;letter-spacing:0.06em;font-size:0.88rem;text-decoration:none;display:inline-block;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
                ${isZh ? '预约合伙人保密咨询 ↗' : 'Schedule Executive Consultation ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderCraftoAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyCraftoAbout(ctx);
  }
  return renderModernCraftoAbout(ctx);
}

export function renderCraftoContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="crafto-inner-hero" style="background:linear-gradient(180deg,#f4f5fa 0%,#ffffff 100%);color:#23253d;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #e5e7eb;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(87,88,223,0.12) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(87,88,223,0.3);background:rgba(87,88,223,0.08);padding:6px 16px;border-radius:6px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;background:#5758df;border-radius:2px;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#5758df;">EXECUTIVE ENGAGEMENT DESK</span>
        </div>
        <h1 style="font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.05;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;margin:0 0 20px;max-width:900px;color:#23253d;">
          ${esc(ui.conversation || 'Initiate Executive Consultation')}
        </h1>
        <p style="max-width:720px;color:#64748b;font-size:1.2rem;line-height:1.65;margin:0;">
          ${esc(ui.contactIntro || 'Connect directly with our senior managing directors for strategic corporate restructuring, cross-border M&A counsel, or sovereign enterprise governance.')}
        </p>
      </div>
    </section>
  `;

  const contentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: Global Hubs & Dispatch -->
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:36px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <span class="eyebrow" style="color:#5758df;font-weight:800;letter-spacing:0.12em;">DIRECT CHANNELS</span>
          <h3 style="font-size:1.3rem;text-transform:uppercase;font-weight:800;color:#23253d;margin:8px 0 24px;">Executive Desks & Hubs</h3>

          <div style="display:flex;flex-direction:column;gap:22px;font-size:0.92rem;">
            <div>
              <div style="font-size:0.8rem;font-weight:800;color:#5758df;text-transform:uppercase;margin-bottom:4px;">Managing Director Inquiries</div>
              <a style="color:#23253d;font-weight:800;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.8rem;font-weight:800;color:#5758df;text-transform:uppercase;margin-bottom:4px;">Global Priority Line</div>
                <a style="color:#23253d;font-weight:800;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.8rem;font-weight:800;color:#5758df;text-transform:uppercase;margin-bottom:4px;">Encrypted Messaging (Signal / WhatsApp)</div>
                <a style="color:#10b981;font-weight:800;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Connect)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.8rem;font-weight:800;color:#5758df;text-transform:uppercase;margin-bottom:4px;">Global Headquarters</div>
                <span style="color:#475569;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;background:#f4f5fa;color:#23253d;padding:24px;border:1px solid #e2e8f0;border-radius:6px;">
            <div style="font-weight:800;text-transform:uppercase;font-size:0.85rem;color:#5758df;margin-bottom:6px;">Confidentiality Commitment</div>
            <div style="font-size:0.84rem;color:#64748b;line-height:1.6;">
              All corporate inquiries are immediately covered under standard Crafto bilateral non-disclosure protocols before substantive technical exchange.
            </div>
          </div>
        </div>

        <!-- Right: Inquiry Form -->
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:36px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <h2 style="font-size:1.6rem;text-transform:uppercase;font-weight:900;color:#23253d;margin:0 0 8px;">Submit Executive Mandate</h2>
          <p style="color:#64748b;font-size:0.95rem;margin:0 0 28px;">Specify your organizational objectives and required taskforce lead time.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#23253d;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.name)} <span style="color:#5758df;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 14px;color:#23253d;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#23253d;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.email)} <span style="color:#5758df;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 14px;color:#23253d;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#23253d;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 14px;color:#23253d;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#23253d;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 14px;color:#23253d;font:inherit;">
                <option value="">— Select Target Practice Area —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#23253d;font-size:0.86rem;font-weight:700;text-transform:uppercase;">
              <span>${esc(ui.message)} <span style="color:#5758df;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Summary of transaction, modernization scope, or board advisory mandate..." style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 14px;color:#23253d;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#5758df;color:#ffffff;font-weight:900;border:none;border-radius:6px;padding:15px 36px;cursor:pointer;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.06em;box-shadow:0 4px 15px rgba(87,88,223,0.25);">
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
        <span class="eyebrow" style="color:#5758df;font-weight:800;letter-spacing:0.12em;">ENGAGEMENT FAQ</span>
        <h2 style="font-size:2.2rem;color:#23253d;text-transform:uppercase;font-weight:900;margin:8px 0;">Client Mandate Protocols</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:24px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
          <h3 style="color:#23253d;font-size:1.1rem;text-transform:uppercase;font-weight:800;margin:0 0 8px;">What is the typical engagement deployment timeline?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Upon bilateral conflict clearance and NDA execution, our executive taskforces typically deploy within 72 hours for urgent transactions and within two weeks for full enterprise restructuring.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:24px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
          <h3 style="color:#23253d;font-size:1.1rem;text-transform:uppercase;font-weight:800;margin:0 0 8px;">How does Crafto manage multi-jurisdictional conflict of interest checks?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Our independent legal compliance committee runs proprietary cross-party audits against global statutory registries before accepting any M&A or restructuring mandate.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:24px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
          <h3 style="color:#23253d;font-size:1.1rem;text-transform:uppercase;font-weight:800;margin:0 0 8px;">Can Crafto provide interim C-suite executive placement?</h3>
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
    <section class="crafto-inner-hero" style="background:linear-gradient(180deg,#f4f5fa 0%,#ffffff 100%);color:#23253d;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #e5e7eb;">
      <div style="position:absolute;top:0;right:0;width:55%;height:100%;background:radial-gradient(ellipse at 80% 20%,rgba(87,88,223,0.12) 0%,transparent 70%);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(87,88,223,0.3);background:rgba(87,88,223,0.08);padding:6px 16px;border-radius:6px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;background:#5758df;border-radius:2px;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#5758df;">PRACTICE & CAPABILITY DIRECTORY</span>
        </div>
        <h1 style="font-size:clamp(2.5rem,5.5vw,4.4rem);line-height:1.05;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;margin:0 0 20px;max-width:900px;color:#23253d;">
          ${esc(ui.catalog || 'Core Executive Practices')}
        </h1>
        <p style="max-width:720px;color:#64748b;font-size:1.2rem;line-height:1.65;margin:0;">
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
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:26px;display:flex;flex-direction:column;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <span style="font-family:monospace;font-weight:800;color:#5758df;font-size:0.85rem;">${code}</span>
                <span style="font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Enterprise Mandate</span>
              </div>
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#f8fafc;border-radius:4px;margin-bottom:16px;overflow:hidden;border:1px solid #e2e8f0;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:28px 20px;text-align:center;font-size:2rem;margin-bottom:16px;">🏛️</div>
              `}
              <h3 style="font-size:1.25rem;font-weight:800;text-transform:uppercase;color:#23253d;margin:0 0 10px;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#23253d;text-decoration:none;">
                  ${esc(t.name)}
                </a>
              </h3>
              <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                ${esc(t.description || 'Institutional enterprise advisory practice area.')}
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:16px;display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
                <span style="font-size:0.82rem;font-weight:800;color:#5758df;text-transform:uppercase;">Institutional Grade</span>
                <a style="color:#5758df;font-weight:800;font-size:0.88rem;text-transform:uppercase;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
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
    <section class="crafto-inner-hero" style="background:linear-gradient(180deg,#f4f5fa 0%,#ffffff 100%);color:#23253d;padding:50px 0 40px;position:relative;overflow:hidden;border-bottom:1px solid #e5e7eb;">
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.88rem;color:#64748b;margin-bottom:16px;text-transform:uppercase;font-weight:700;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#64748b;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#64748b;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#5758df;">${esc(t.name)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(87,88,223,0.08);border:1px solid rgba(87,88,223,0.25);color:#5758df;padding:4px 14px;border-radius:6px;font-size:0.78rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
              <span>⚙️</span> INDUSTRIAL &amp; ENGINEERING SPECIFICATION
            </div>
            <h1 style="font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.1;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;margin:0;color:#23253d;">
              ${esc(t.name)}
            </h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:12px 20px;text-align:right;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
            <div style="color:#64748b;font-size:0.8rem;text-transform:uppercase;font-weight:700;">Quality Standard</div>
            <div style="color:#5758df;font-weight:800;font-size:1.05rem;">ISO 9001 / 14001 Certified</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Showcase: Col 1 Preview & Certifications, Col 2 Specs & Dynamic Progress Bars -->
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:48px;align-items:start;">
        <!-- Left Col: Engineering Visual -->
        <div>
          <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:24px;box-shadow:0 8px 24px rgba(35,37,61,0.03);text-align:center;">
            ${imgUrl ? `
              <img id="detailMainImg" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:cover;border-radius:4px;">
            ` : `
              <div style="background:#f4f5fa;color:#23253d;border-radius:4px;padding:70px 24px;text-align:center;font-size:5rem;">🏛️</div>
            `}
          </div>

          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <span style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;color:#23253d;padding:8px 14px;font-size:0.82rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">✓ Micron Tolerance</span>
            <span style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;color:#23253d;padding:8px 14px;font-size:0.82rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">✓ ISO 2768-m</span>
            <span style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;color:#23253d;padding:8px 14px;font-size:0.82rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">✓ Batch Traceability</span>
          </div>
        </div>

        <!-- Right Col: Narrative, Dynamic Progress Bars, Technical Parameters -->
        <div>
          <h2 style="color:#23253d;font-size:1.8rem;font-weight:900;text-transform:uppercase;margin:0 0 16px;">Engineering Scope &amp; Specifications</h2>
          <p style="font-size:1.15rem;line-height:1.75;color:#475569;margin:0 0 28px;">
            ${esc(t.description || 'Advanced manufacturing and corporate engineering solution engineered for high repeatability, robust environmental resilience, and stringent quality control protocols.')}
          </p>

          <!-- Dynamic Engineering Quality Progress Bars -->
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:3px solid #5758df;border-radius:6px;padding:26px;margin-bottom:28px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
            <h3 style="color:#23253d;font-size:1rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 18px;display:flex;align-items:center;gap:8px;">
              <span style="color:#5758df;">⚙️</span> Manufacturing QA &amp; Delivery Benchmarks
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:700;color:#23253d;margin-bottom:6px;">
                  <span>Machining Tolerance (ISO 2768-m)</span>
                  <span style="color:#5758df;">99.9% Micron Precision</span>
                </div>
                <div class="wr-progress-container" style="background:#f1f5f9;height:8px;border-radius:4px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:#5758df;height:100%;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:700;color:#23253d;margin-bottom:6px;">
                  <span>Tensile &amp; Stress Compliance</span>
                  <span style="color:#23253d;">97% Yield Strength</span>
                </div>
                <div class="wr-progress-container" style="background:#f1f5f9;height:8px;border-radius:4px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="97" style="background:linear-gradient(90deg,#5758df,#818cf8);height:100%;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;font-weight:700;color:#23253d;margin-bottom:6px;">
                  <span>Batch Quality Pass Rate</span>
                  <span style="color:#10b981;">99.8% First-Pass Yield</span>
                </div>
                <div class="wr-progress-container" style="background:#f1f5f9;height:8px;border-radius:4px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:#10b981;height:100%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Parameters Box -->
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:24px;margin-bottom:32px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
            <h3 style="font-size:1.05rem;font-weight:800;text-transform:uppercase;color:#23253d;margin:0 0 16px;">Mandate Blueprint</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;">
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                <span style="color:#64748b;">Regulatory Jurisdiction</span>
                <strong style="color:#23253d;">${esc(p.material || 'Global Industrial ISO & CE Standard')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                <span style="color:#64748b;">Operational Model</span>
                <strong style="color:#23253d;">${esc(p.dimensions || 'High-Throughput Automated Production')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                <span style="color:#64748b;">Managing Desk</span>
                <strong style="color:#5758df;">Executive Taskforce Partner</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Material Traceability</span>
                <strong style="color:#23253d;">Full Heat-Lot Spectral Certification</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Engineering / Strategic Pillars -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;" data-reveal="fade-up">
        <span style="color:#5758df;font-size:0.85rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">INDUSTRIAL CAPABILITIES</span>
        <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#23253d;font-weight:900;text-transform:uppercase;margin:8px 0 12px;">Engineered for Precision Scale</h2>
        <p style="color:#64748b;font-size:1.05rem;line-height:1.6;margin:0;">From initial rapid tooling validation to automated high-volume series delivery.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:32px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <div style="font-size:1.8rem;color:#5758df;font-weight:900;margin-bottom:16px;">01</div>
          <h3 style="color:#23253d;font-size:1.15rem;font-weight:800;text-transform:uppercase;margin:0 0 10px;">5-Axis Multi-Spindle CNC</h3>
          <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0;">Micron-level repeatable tool positioning handling exotic alloys, aerospace-grade titanium, and hardened tool steels.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:32px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <div style="font-size:1.8rem;color:#5758df;font-weight:900;margin-bottom:16px;">02</div>
          <h3 style="color:#23253d;font-size:1.15rem;font-weight:800;text-transform:uppercase;margin:0 0 10px;">Spectrometric Testing</h3>
          <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0;">In-house metallurgical laboratories performing continuous X-ray diffraction, tensile stress testing, and chemical verification.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:32px;box-shadow:0 4px 16px rgba(35,37,61,0.03);">
          <div style="font-size:1.8rem;color:#5758df;font-weight:900;margin-bottom:16px;">03</div>
          <h3 style="color:#23253d;font-size:1.15rem;font-weight:800;text-transform:uppercase;margin:0 0 10px;">Rapid DFM to Volume</h3>
          <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0;">Design for Manufacturing feedback within 24 hours, bridging pilot prototype tooling to full-scale automated multi-cavity runs.</p>
        </div>
      </div>
    </section>

    <!-- Technical RFQ / Proposal Form -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="background:#ffffff;color:#23253d;border:1px solid #e5e7eb;border-radius:6px;padding:40px;display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;box-shadow:0 8px 30px rgba(35,37,61,0.04);">
        <div>
          <span style="color:#5758df;font-size:0.85rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">ENGINEERING RFQ</span>
          <h2 style="color:#23253d;font-size:1.8rem;font-weight:900;text-transform:uppercase;margin:8px 0 12px;">Commission ${esc(t.name)}</h2>
          <p style="color:#64748b;font-size:1rem;line-height:1.6;margin:0 0 24px;">
            Submit your CAD specifications or technical blueprint for immediate engineering review and formal quotation within 24 hours.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;color:#475569;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#5758df;">✓</span> 24-Hour Guaranteed Engineering DFM Response
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#5758df;">✓</span> Full First-Article Inspection Report (FAIR) Included
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#5758df;">✓</span> Direct Access to Lead Production Metallurgist
            </div>
          </div>
          ${waDigits ? `
            <div style="margin-top:28px;">
              <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:0.95rem;">
                <span>WhatsApp Technical Inquiry ↗</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#64748b;font-size:0.85rem;font-weight:600;">Selected Solution</label>
              <input name="productName" value="${esc(t.name)}" readonly style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:10px 14px;color:#23253d;font:inherit;font-weight:700;">
              <input type="hidden" name="productId" value="${esc(p.id)}">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#334155;font-size:0.85rem;font-weight:600;">${esc(ui.name)} <span style="color:#5758df;">*</span></label>
              <input name="name" required placeholder="Lead engineer / buyer" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:10px 14px;color:#23253d;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#334155;font-size:0.85rem;font-weight:600;">${esc(ui.email)} <span style="color:#5758df;">*</span></label>
              <input name="email" type="email" required placeholder="engineering@company.com" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:10px 14px;color:#23253d;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#334155;font-size:0.85rem;font-weight:600;">Company / Facility <span style="color:#5758df;">*</span></label>
              <input name="company" required placeholder="Enterprise organization" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:10px 14px;color:#23253d;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#334155;font-size:0.85rem;font-weight:600;">Estimated Production Volume</label>
              <input name="quantity" placeholder="e.g. 5,000 - 50,000 pcs" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:10px 14px;color:#23253d;font:inherit;">
            </div>
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#334155;font-size:0.85rem;font-weight:600;">Material / Drawing Details</label>
              <textarea name="message" rows="3" placeholder="Specify alloy grade, finish requirement, target tolerance, or delivery timeline..." style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:10px 14px;color:#23253d;font:inherit;resize:vertical;"></textarea>
            </div>
            <div style="grid-column:1 / -1;margin-top:6px;">
              <button type="submit" class="button" style="width:100%;background:#5758df;color:#ffffff;font-weight:800;border-radius:6px;padding:14px;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.06em;border:none;cursor:pointer;box-shadow:0 4px 15px rgba(87,88,223,0.25);">
                ${esc(ui.inquire || 'Request Formal Technical Quotation')} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:10px 0 0;font-size:0.85rem;text-align:center;color:#64748b;"></p>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Related Industrial Solutions -->
    ${related.length > 0 ? `
      <section class="wrap" style="padding:20px 0 80px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="font-size:1.6rem;color:#23253d;font-weight:900;text-transform:uppercase;margin:0;">Related Industrial Solutions</h2>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#5758df;font-weight:800;text-decoration:none;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.04em;">
            ${esc(ui.allProducts)} ↗
          </a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          ${related.map(item => {
            const it = translateProduct(item);
            const itemImg = asset(item.imageAssetId);
            return `
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:20px;display:flex;flex-direction:column;box-shadow:0 4px 12px rgba(35,37,61,0.03);">
                ${itemImg ? `
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;aspect-ratio:16/9;background:#f8fafc;border-radius:4px;overflow:hidden;margin-bottom:14px;border:1px solid #e2e8f0;">
                    <img src="${esc(itemImg)}" alt="${esc(it.name)}" style="width:100%;height:100%;object-fit:cover;">
                  </a>
                ` : `
                  <div style="padding:28px;text-align:center;font-size:2.5rem;background:#f4f5fa;border-radius:4px;color:#23253d;margin-bottom:14px;">🏛️</div>
                `}
                <div style="display:flex;flex-direction:column;flex:1;">
                  <h4 style="font-size:1.1rem;font-weight:800;text-transform:uppercase;margin:0 0 8px;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#23253d;text-decoration:none;">
                      ${esc(it.name)}
                    </a>
                  </h4>
                  <p style="color:#64748b;font-size:0.88rem;line-height:1.5;margin:0 0 16px;flex:1;">
                    ${esc(it.description || 'Enterprise industrial manufacturing solution.')}
                  </p>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#5758df;font-weight:800;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.04em;text-decoration:none;margin-top:auto;">
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
