import { esc, safeUrl, type ThemeContext } from './types';
import { parseAboutHighlights, getAboutStoryParagraphs, getAboutImages, getAboutHeadline } from './aboutHelper';
import { isTypedMaterialsSource } from '../materials-typed';

export function renderAiAgencyHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Next-Generation Autonomous AI Agents & Neural Solutions',
    subtitle: 'We engineer self-improving agentic workflows, fine-tuned multimodal LLMs, and enterprise-grade neural pipelines that transform complex business logic into autonomous execution.',
    about: 'Corpox AI Agency architects state-of-the-art synthetic reasoning pipelines, secure local inference clusters, and multi-agent coordination frameworks for visionary enterprises.',
    cta: 'Deploy Autonomous Agents',
  };

  // 1. Hero Section (Pristine Light AI Studio with Soft Coral Aura)
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:radial-gradient(ellipse at 50% -10%,rgba(239,100,100,0.18) 0%,rgba(255,245,245,0.5) 50%,#ffffff 80%);color:#161616;padding:95px 0 85px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:700px;height:400px;background:radial-gradient(circle,rgba(239,100,100,0.14) 0%,rgba(254,205,211,0.2) 50%,transparent 70%);filter:blur(60px);pointer-events:none;"></div>
      <div class="wrap hero-content" style="position:relative;z-index:2;text-align:center;align-items:center;margin:0 auto;">
        <div class="wr-hero-float" data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:10px;background:rgba(239,100,100,0.08);border:1px solid rgba(239,100,100,0.25);padding:7px 20px;border-radius:9999px;margin-bottom:24px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef6464;box-shadow:0 0 10px rgba(239,100,100,0.6);"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#ef6464;letter-spacing:0.08em;text-transform:uppercase;">CORPOX AI LABS · AGENTIC REASONING ENGINE V4</span>
        </div>
        <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.8rem, 5.8vw, 5rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;color:#161616;max-width:940px;margin:0 auto 24px;text-align:center;">
          ${esc(copy.headline)}
        </h1>
        <p data-reveal="fade-up" style="max-width:720px;color:#64748b;font-size:1.22rem;line-height:1.65;margin:0 auto 36px;text-align:center;">
          ${esc(copy.subtitle)}
        </p>
        <div data-reveal="fade-up" style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap;">
          <a class="button" style="background:#ef6464;color:#ffffff;font-weight:800;border-radius:8px;padding:16px 36px;box-shadow:0 8px 25px rgba(239,100,100,0.35);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Deploy Autonomous Agents')} ↗
          </a>
          <a class="button" style="background:#ffffff;color:#161616;border:1px solid #e2e8f0;border-radius:8px;padding:16px 32px;box-shadow:0 4px 15px rgba(0,0,0,0.03);" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Neural Model Catalog →
          </a>
        </div>

        <div data-reveal="fade-up" style="margin-top:48px;display:flex;gap:28px;justify-content:center;flex-wrap:wrap;color:#64748b;font-size:0.86rem;font-family:monospace;">
          <div><span style="color:#ef6464;font-weight:700;">[✓]</span> LOW-LATENCY INFERENCE &lt;18ms</div>
          <div><span style="color:#ef6464;font-weight:700;">[✓]</span> ON-PREMISE AIR-GAPPED DEPLOYMENT</div>
          <div><span style="color:#ef6464;font-weight:700;">[✓]</span> ZERO DATA RETENTION GUARANTEE</div>
        </div>
        <div style="margin-top:40px;">
          <a href="#ai-metrics" class="wr-scroll-down" aria-label="Scroll to neural performance metrics" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;border:1px solid rgba(239,100,100,0.4);color:#ef6464;font-size:1.3rem;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;">↓</a>
        </div>
      </div>
    </section>
  `;

  // 2. Performance Metrics Strip (Light Cards with Coral Accents)
  const metricsHtml = `
    <section id="ai-metrics" class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #ef6464;border-radius:14px;padding:26px;box-shadow:0 4px 25px rgba(239,100,100,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#ef6464;letter-spacing:-1px;"><span data-counter="5.2" data-suffix="x">5.2x</span> Faster</div>
          <div style="font-weight:700;color:#161616;margin-top:6px;font-size:1.05rem;">Autonomous Agent Deployments</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">FP8 & AWQ kernel optimizations delivering sub-20ms first-token latency.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #f43f5e;border-radius:14px;padding:26px;box-shadow:0 4px 25px rgba(244,63,94,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f43f5e;letter-spacing:-1px;"><span data-counter="99.4" data-suffix="%">99.4%</span></div>
          <div style="font-weight:700;color:#161616;margin-top:6px;font-size:1.05rem;">Retrieval Precision (RAG)</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Deterministic JSON schema enforcement eliminating hallucinated tool outputs.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #fb7185;border-radius:14px;padding:26px;box-shadow:0 4px 25px rgba(251,113,133,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#fb7185;letter-spacing:-1px;"><span data-counter="240" data-suffix="M+">240M+</span></div>
          <div style="font-weight:700;color:#161616;margin-top:6px;font-size:1.05rem;">Tokens Processed Daily</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Auto-scaling vLLM clusters orchestrating parallel reasoning workloads.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #e11d48;border-radius:14px;padding:26px;box-shadow:0 4px 25px rgba(225,29,72,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#e11d48;letter-spacing:-1px;">Zero Trust</div>
          <div style="font-weight:700;color:#161616;margin-top:6px;font-size:1.05rem;">Air-Gapped Sovereign Security</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Complete IP privacy with self-hosted weights and encrypted vector storage.</div>
        </div>
      </div>
    </section>
  `;

  // 3. AI Modules & Agent Capabilities (Products)
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" style="margin-bottom:36px;">
        <div>
          <span class="eyebrow" style="color:#ef6464;font-weight:700;">NEURAL CAPABILITIES</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#161616;">Autonomous Agents & Fine-Tuned Models</h2>
        </div>
        <a class="text-link" style="color:#ef6464;font-weight:600;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = ctx.productMainImage(p);
          const icons = ['🧠', '🤖', '⚡', '📊', '🔍', '🛡️'];
          const tags = ['Agent Swarm', 'Fine-Tuned LLM', 'Vision-Language', 'RAG Engine', 'Code Synthesis', 'Security Gate'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                  <span style="font-size:1.8rem;">${icons[idx % icons.length]}</span>
                  <span style="font-size:0.75rem;font-weight:700;color:#ef6464;background:rgba(239,100,100,0.08);border:1px solid rgba(239,100,100,0.25);padding:4px 12px;border-radius:9999px;">${tags[idx % tags.length]}</span>
                </div>
                ${imgUrl ? `<div class="product-image" style="border-radius:10px;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="color:#161616;margin:0 0 10px;font-size:1.3rem;font-weight:700;">${esc(t.name)}</h3>
                <p style="color:#64748b;line-height:1.6;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Enterprise agentic intelligence module optimized for high-complexity workflows.')}</p>
              </div>
              <div style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#ef6464;font-weight:700;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  Explore Model Specs →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 4. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div data-reveal="fade-up" style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#ef6464;font-weight:700;">ENTERPRISE VALIDATION</span>
        <h2 style="font-size:2.2rem;color:#161616;margin:8px 0;">Trusted by Visionary Engineering Leaders</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
          <div style="color:#ef6464;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#475569;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Corpox deployed a localized multi-agent reasoning cluster in under 3 weeks. Our document extraction latency dropped by 78% with zero API downtime."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#ef6464;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">AK</div>
            <div><div style="font-weight:700;color:#161616;font-size:0.9rem;">Dr. Aris Thorne</div><div style="color:#64748b;font-size:0.8rem;">VP of Engineering, Apex Robotics</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
          <div style="color:#ef6464;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#475569;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The schema enforcement guarantee eliminated all JSON formatting hallucinations. We safely route customer-facing queries into autonomous transactional actions."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#f43f5e;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">NZ</div>
            <div><div style="font-weight:700;color:#161616;font-size:0.9rem;">Nadia Zhou</div><div style="color:#64748b;font-size:0.8rem;">Chief Data Scientist, QuantEdge Global</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
          <div style="color:#ef6464;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#475569;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The on-premise air-gapped deployment gave our bank the exact security certifications needed for full production rollout."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#fb7185;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">LS</div>
            <div><div style="font-weight:700;color:#161616;font-size:0.9rem;">Lucas Sommer</div><div style="color:#64748b;font-size:0.8rem;">CISO, Zurich Financial Systems</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 5. Contact CTA Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#fff5f5;color:#161616;padding:80px 0;border-top:1px solid #fecdd3;border-bottom:1px solid #fecdd3;">
      <div class="wrap" data-reveal="fade-up" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#ef6464;font-weight:700;">AUTONOMOUS ENTERPRISE</span>
          <h2 style="font-size:2.4rem;margin:10px 0;max-width:680px;color:#161616;">
            Ready to deploy sovereign AI agents across your infrastructure?
          </h2>
          <p style="color:#64748b;font-size:1.1rem;margin:0;max-width:550px;">Schedule an architecture workshop with our neural systems engineers.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:#ef6464;color:#ffffff;font-weight:800;border-radius:8px;padding:16px 36px;box-shadow:0 8px 25px rgba(239,100,100,0.35);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Schedule AI Workshop ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${metricsHtml}${productsHtml}${testimonialsHtml}${contactBandHtml}`;
}

function renderLegacyAiAgencyAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'Corpox AI Agency architects state-of-the-art synthetic reasoning pipelines, secure local inference clusters, and multi-agent coordination frameworks for visionary enterprises.',
  };

  const headline = company.aboutHeadline || 'Autonomous Neural Intelligence & Synthetic Reasoning';
  const customImg = company.aboutImageAssetId ? asset(company.aboutImageAssetId) : '';
  const secondaryCustomImg = company.aboutSecondaryImageAssetId ? asset(company.aboutSecondaryImageAssetId) : '';
  const customHighlights = company.aboutHighlights ? parseAboutHighlights(company.aboutHighlights) : null;
  const customStoryParas = company.aboutStory ? getAboutStoryParagraphs(company) : null;

  const heroHtml = `
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% 10%,#1e1b4b 0%,#050811 75%);color:#ffffff;padding:80px 0 60px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(circle,rgba(6,182,212,0.18) 0%,rgba(99,102,241,0.12) 50%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#06b6d4;box-shadow:0 0 10px #06b6d4;"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#67e8f9;letter-spacing:0.08em;text-transform:uppercase;">CORPOX AI LABS · RESEARCH CHARTER</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;background:linear-gradient(90deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;max-width:920px;margin:0 auto 20px;">
          ${esc(headline)}
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          ${esc(copy.about)}
        </p>
      </div>
    </section>
  `;

  const statsHtml = customHighlights ? `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        ${customHighlights.map((h) => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #06b6d4;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
            <div style="font-size:2.8rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;">
              <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
              </span>
            </div>
            <div style="font-weight:700;color:#f8fafc;margin-top:4px;font-size:1.05rem;">${esc(h.label)}</div>
            ${h.desc ? `<div style="font-size:0.85rem;color:#94a3b8;margin-top:4px;line-height:1.5;">${esc(h.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #06b6d4;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;"><span data-counter="1200" data-suffix="+">1,200+</span></div>
          <div style="font-weight:700;color:#f8fafc;margin-top:4px;font-size:1.05rem;">Deployed Neural Agents</div>
          <div style="font-size:0.85rem;color:#94a3b8;margin-top:4px;line-height:1.5;">Operating in high-throughput enterprise pipelines across finance and logistics.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #818cf8;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(129,140,248,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#818cf8;letter-spacing:-1px;"><span data-counter="240" data-suffix="M+">240M+</span></div>
          <div style="font-weight:700;color:#f8fafc;margin-top:4px;font-size:1.05rem;">Daily Token Inferences</div>
          <div style="font-size:0.85rem;color:#94a3b8;margin-top:4px;line-height:1.5;">Low-latency FP8 quantized inference clusters with 99.99% system availability.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #c084fc;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(192,132,252,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#c084fc;letter-spacing:-1px;"><span data-counter="18" data-prefix="&lt;" data-suffix="ms">&lt;18ms</span></div>
          <div style="font-weight:700;color:#f8fafc;margin-top:4px;font-size:1.05rem;">First-Token Latency</div>
          <div style="font-size:0.85rem;color:#94a3b8;margin-top:4px;line-height:1.5;">Sub-20ms streaming token generation via hardware-optimized custom kernels.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #38bdf8;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(56,189,248,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#38bdf8;letter-spacing:-1px;"><span data-counter="100" data-suffix="%">100%</span></div>
          <div style="font-weight:700;color:#f8fafc;margin-top:4px;font-size:1.05rem;">Air-Gapped Sovereign Data</div>
          <div style="font-size:0.85rem;color:#94a3b8;margin-top:4px;line-height:1.5;">Zero external model calls. Full on-premise execution with encrypted vector state.</div>
        </div>
      </div>
    </section>
  `;

  const missionHtml = `
    <section class="wrap" style="padding:50px 0 70px;">
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
        <div data-reveal="fade-up">
          <span class="eyebrow" style="color:#06b6d4;font-weight:700;">ENGINEERED REASONING</span>
          <h2 style="font-size:2.4rem;line-height:1.15;color:#f8fafc;margin:10px 0 20px;">
            Beyond Conversational AI: Deterministic Autonomous Execution
          </h2>
          ${customStoryParas ? `
            <div style="color:#cbd5e1;font-size:1.05rem;line-height:1.75;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${customStoryParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
          ` : `
            <p style="color:#cbd5e1;font-size:1.05rem;line-height:1.75;margin-bottom:20px;">
              At Corpox AI Labs, we reject the notion that enterprises must choose between creative neural generation and deterministic reliability. We build agentic reasoning loops where mathematical logic, code compilers, and relational databases act as self-correcting grounding layers.
            </p>
            <p style="color:#cbd5e1;font-size:1.05rem;line-height:1.75;margin:0 0 28px;">
              Our proprietary multi-agent orchestrator decomposes complex business directives into parallel execution graphs, ensuring every single tool call is schema-validated and auditable down to individual floating-point tensor activations.
            </p>
          `}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:18px;">
              <strong style="color:#06b6d4;display:block;font-size:1rem;margin-bottom:4px;">⚡ Real-Time Tool Binding</strong>
              <span style="color:#94a3b8;font-size:0.85rem;">Deterministic JSON-RPC interfaces eliminate API hallucination.</span>
            </div>
            <div style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:18px;">
              <strong style="color:#818cf8;display:block;font-size:1rem;margin-bottom:4px;">🔒 Cryptographic Auditing</strong>
              <span style="color:#94a3b8;font-size:0.85rem;">Immutable prompt-to-execution state hashing for regulatory compliance.</span>
            </div>
          </div>
        </div>

        <div class="wr-hero-float wr-card-hover" data-reveal="fade-up" style="background:#090d16;border:1px solid #1e293b;border-radius:16px;padding:36px;box-shadow:0 0 40px rgba(6,182,212,0.08);">
          ${customImg ? `
            <div style="border-radius:10px;overflow:hidden;border:1px solid #1e293b;margin-bottom:20px;">
              <img src="${esc(customImg)}" alt="${esc(company.name)}" style="width:100%;height:200px;object-fit:cover;display:block;" loading="lazy">
            </div>
          ` : ''}
          <h3 style="font-size:1.3rem;font-weight:700;color:#f8fafc;margin:0 0 20px;">Core Engineering Disciplines</h3>
          <div style="display:flex;flex-direction:column;gap:18px;">
            <div style="border-left:3px solid #06b6d4;padding-left:14px;">
              <strong style="color:#67e8f9;font-size:0.95rem;">1. Reinforcement Learning from Compiler Feedback (RLCF)</strong>
              <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:4px 0 0;">Agents generate unit-tested code solutions with zero hallucination guarantee.</p>
            </div>
            <div style="border-left:3px solid #818cf8;padding-left:14px;">
              <strong style="color:#a5b4fc;font-size:0.95rem;">2. Quantized Local Inference Kernels</strong>
              <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:4px 0 0;">Custom CUDA & Triton kernels achieving 3x higher throughput per GPU cluster.</p>
            </div>
            <div style="border-left:3px solid #c084fc;padding-left:14px;">
              <strong style="color:#d8b4fe;font-size:0.95rem;">3. Hierarchical Agent Swarm Coordination</strong>
              <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:4px 0 0;">Planner, Executor, and Verifier agents cross-validating multi-step decisions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const researchersHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#06b6d4;font-weight:700;">RESEARCH FELLOWS</span>
        <h2 style="font-size:2.2rem;color:#f8fafc;font-weight:800;margin:8px 0;">Principal AI Scientists & Neural Architects</h2>
        <p style="color:#94a3b8;max-width:620px;margin:0 auto;font-size:1rem;">Pioneering synthetic reasoning, distributed GPU clusters, and multimodal foundation models.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:14px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#06b6d4;color:#050811;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">ER</div>
          <h3 style="font-size:1.15rem;color:#f8fafc;font-weight:700;margin:0 0 4px;">Dr. Elena Rostova</h3>
          <div style="color:#06b6d4;font-size:0.82rem;font-weight:700;margin-bottom:10px;">Chief AI Scientist & Co-Founder</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">Ex-DeepMind research scientist with 40+ citations in reasoning models and autonomous swarms.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:14px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#818cf8;color:#ffffff;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">MS</div>
          <h3 style="font-size:1.15rem;color:#f8fafc;font-weight:700;margin:0 0 4px;">Marcus Sterling</h3>
          <div style="color:#818cf8;font-size:0.82rem;font-weight:700;margin-bottom:10px;">Head of Agentic Frameworks</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">Pioneered dynamic DAG task decomposition engines powering our 24/7 autonomous production clusters.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:14px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#c084fc;color:#050811;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">TA</div>
          <h3 style="font-size:1.15rem;color:#f8fafc;font-weight:700;margin:0 0 4px;">Dr. Tariq Al-Mansoor</h3>
          <div style="color:#c084fc;font-size:0.82rem;font-weight:700;margin-bottom:10px;">Director of Inference & Quantization</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">Specializes in custom Triton kernel development, FP8 execution pipelines, and high-bandwidth memory caches.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:14px;padding:28px;text-align:center;">
          <div style="width:64px;height:64px;border-radius:50%;background:#38bdf8;color:#050811;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">VK</div>
          <h3 style="font-size:1.15rem;color:#f8fafc;font-weight:700;margin:0 0 4px;">Vera Kross, Ph.D.</h3>
          <div style="color:#38bdf8;font-size:0.82rem;font-weight:700;margin-bottom:10px;">Lead Security & AI Alignment</div>
          <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">Designs cryptographic sandboxing, prompt injection countermeasures, and sovereign air-gap isolation.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div class="wr-card-hover" data-reveal="fade-up" style="background:#080d1a;border:1px solid #06b6d4;border-radius:16px;padding:48px;color:#ffffff;display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;box-shadow:0 0 40px rgba(6,182,212,0.15);">
        <div>
          <span style="font-family:monospace;color:#06b6d4;font-weight:700;font-size:0.85rem;">[DEPLOY AUTONOMOUS CLUSTERS]</span>
          <h2 style="font-size:2.2rem;color:#f8fafc;margin:8px 0;font-weight:900;">Deploy Sovereign Neural Workflows</h2>
          <p style="color:#94a3b8;font-size:1rem;margin:0;max-width:560px;">Collaborate directly with our research fellows to engineer custom agentic pipelines.</p>
        </div>
        <a class="button" style="background:linear-gradient(90deg,#06b6d4 0%,#6366f1 100%);color:#050811;font-weight:800;border-radius:8px;padding:16px 36px;box-shadow:0 0 25px rgba(6,182,212,0.4);text-decoration:none;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
          Schedule Architecture Session ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${statsHtml}${missionHtml}${researchersHtml}${ctaHtml}`;
}

function renderModernAiAgencyAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'Corpox AI Agency architects state-of-the-art synthetic reasoning pipelines, secure local inference clusters, and multi-agent coordination frameworks for visionary enterprises.',
  };
  const isZh = (ctx.lang as string) === 'zh';

  const defaultHeadline = isZh
    ? '自主神经认知智能体与工业级确定性推理架构'
    : 'Autonomous Neural Intelligence & Synthetic Reasoning Architecture';
  const headline = getAboutHeadline(company, defaultHeadline);

  const defaultStory = [
    isZh
      ? `${company.name} 汇聚前沿认知科学专家、深度学习架构师与分布式系统先驱，致力于将大语言模型从非确定性的文本对话工具进化为企业级自治神经执行系统。我们为全球高科技企业、金融机构及复杂制造业交付高吞吐私有化推理集群与多智能体工作流。`
      : `Corpox AI Agency architects state-of-the-art synthetic reasoning pipelines, secure local inference clusters, and multi-agent coordination frameworks for visionary enterprises.`,
    isZh
      ? '我们坚信企业级自主智能必须以物理真实与逻辑严密为锚点。通过编译器反馈强化学习（RLCF）与私有化物理沙箱，我们构建了杜绝模型幻觉的确定性工具调用闭环，赋能智能体在极高安全性标准下自主调度生产级异构系统。'
      : `We build agentic reasoning loops where mathematical logic, code compilers, and relational databases act as self-correcting grounding layers, decomposing complex directives into schema-validated, parallel execution graphs.`,
  ];
  const storyParas = getAboutStoryParagraphs(company, defaultStory[0]);
  const paras = company.aboutStory ? storyParas : defaultStory;

  const { primary: aboutImg } = getAboutImages(ctx, path('templates/ai/about-neural.jpg'));

  const stats = parseAboutHighlights(company.aboutHighlights, [
    { value: '1,200+', num: 1200, suffix: '+', label: isZh ? '生产环境活跃神经智能体' : 'Deployed Neural Agents', desc: isZh ? '在跨国金融、研发与供应链流水线自治运转' : 'Operating in enterprise finance & logistics pipelines' },
    { value: '240M+', num: 240, suffix: 'M+', label: isZh ? '日均私有化 Token 推理吞吐' : 'Daily Token Inferences', desc: isZh ? '低延迟 FP8 量化加速集群高可用保障' : 'Low-latency FP8 quantized inference clusters' },
    { value: '< 18ms', num: 18, prefix: '< ', suffix: 'ms', label: isZh ? '首 Token 极速流式延迟' : 'First-Token Latency', desc: isZh ? '基于 Triton 定制底层硬件显存优化内核' : 'Streaming token generation via custom hardware kernels' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '物理气隙隔离私有化数据安全' : 'Air-Gapped Sovereign Data', desc: isZh ? '零外部模型中转，全链路本地向量状态加密' : 'Zero external model calls with encrypted vector state' },
  ]);

  // Anti-Blank Box Vector SVG: Light-Mode Multi-Modal Neural Graph & Synthetic Reasoning Topology Viewport
  const neuralSvg = `
    <svg viewBox="0 0 720 460" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block;background:#ffffff;">
      <defs>
        <radialGradient id="neuralGlowLight" cx="40%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#fff5f5" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#fafafa" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="synapseCoralRose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef6464"/>
          <stop offset="50%" stop-color="#f43f5e"/>
          <stop offset="100%" stop-color="#fb7185"/>
        </linearGradient>
        <filter id="coralGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Matrix Canvas -->
      <rect width="720" height="460" fill="url(#neuralGlowLight)"/>
      <rect x="14" y="14" width="692" height="432" fill="none" stroke="#f1f5f9" stroke-width="1.5" rx="8"/>
      <rect x="20" y="20" width="680" height="420" fill="none" stroke="#fecdd3" stroke-width="1" stroke-opacity="0.5" rx="6"/>

      <!-- Header Banner -->
      <g transform="translate(36, 46)">
        <circle cx="6" cy="6" r="4" fill="#ef6464" filter="url(#coralGlow)"/>
        <text x="18" y="10" fill="#ef6464" font-size="11" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700" letter-spacing="2">NEURAL TOPOLOGY // MULTI-AGENT SYNTHETIC REASONING GRAPH</text>
        <text x="540" y="10" fill="#f43f5e" font-size="10" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">FP8 QUANTIZED</text>
        <line x1="0" y1="20" x2="648" y2="20" stroke="#f1f5f9" stroke-width="1"/>
      </g>

      <!-- Neural Network Graph (Left Panel) -->
      <g transform="translate(36, 82)">
        <!-- Neural Frame -->
        <rect x="0" y="0" width="380" height="236" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
        
        <!-- Subtle Synaptic Grid -->
        <line x1="0" y1="59" x2="380" y2="59" stroke="#f8fafc" stroke-width="1"/>
        <line x1="0" y1="118" x2="380" y2="118" stroke="#f8fafc" stroke-width="1"/>
        <line x1="0" y1="177" x2="380" y2="177" stroke="#f8fafc" stroke-width="1"/>

        <!-- Synaptic Arcs (Connections) -->
        <line x1="50" y1="45" x2="140" y2="35" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.6"/>
        <line x1="50" y1="45" x2="140" y2="90" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.4"/>
        <line x1="50" y1="118" x2="140" y2="35" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.3"/>
        <line x1="50" y1="118" x2="140" y2="90" stroke="url(#synapseCoralRose)" stroke-width="2" stroke-opacity="0.8"/>
        <line x1="50" y1="118" x2="140" y2="145" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.4"/>
        <line x1="50" y1="190" x2="140" y2="145" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.6"/>
        <line x1="50" y1="190" x2="140" y2="200" stroke="url(#synapseCoralRose)" stroke-width="1.5" stroke-opacity="0.7"/>

        <line x1="140" y1="35" x2="240" y2="60" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.5"/>
        <line x1="140" y1="90" x2="240" y2="60" stroke="url(#synapseCoralRose)" stroke-width="2" stroke-opacity="0.9"/>
        <line x1="140" y1="90" x2="240" y2="120" stroke="url(#synapseCoralRose)" stroke-width="1.5" stroke-opacity="0.7"/>
        <line x1="140" y1="145" x2="240" y2="120" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.5"/>
        <line x1="140" y1="145" x2="240" y2="180" stroke="url(#synapseCoralRose)" stroke-width="1.8" stroke-opacity="0.8"/>
        <line x1="140" y1="200" x2="240" y2="180" stroke="url(#synapseCoralRose)" stroke-width="1.2" stroke-opacity="0.6"/>

        <line x1="240" y1="60" x2="330" y2="90" stroke="url(#synapseCoralRose)" stroke-width="2" stroke-opacity="0.95"/>
        <line x1="240" y1="120" x2="330" y2="90" stroke="url(#synapseCoralRose)" stroke-width="1.5" stroke-opacity="0.8"/>
        <line x1="240" y1="120" x2="330" y2="150" stroke="url(#synapseCoralRose)" stroke-width="1.8" stroke-opacity="0.85"/>
        <line x1="240" y1="180" x2="330" y2="150" stroke="url(#synapseCoralRose)" stroke-width="2" stroke-opacity="0.9"/>

        <!-- Nodes -->
        <circle cx="50" cy="45" r="7" fill="#ef6464" filter="url(#coralGlow)"/>
        <circle cx="50" cy="118" r="9" fill="#ef6464" filter="url(#coralGlow)"/>
        <circle cx="50" cy="190" r="7" fill="#ef6464"/>

        <circle cx="140" cy="35" r="6" fill="#f43f5e"/>
        <circle cx="140" cy="90" r="8" fill="#f43f5e" filter="url(#coralGlow)"/>
        <circle cx="140" cy="145" r="6" fill="#f43f5e"/>
        <circle cx="140" cy="200" r="7" fill="#fb7185"/>

        <circle cx="240" cy="60" r="8" fill="#fb7185" filter="url(#coralGlow)"/>
        <circle cx="240" cy="120" r="9" fill="#fda4af" filter="url(#coralGlow)"/>
        <circle cx="240" cy="180" r="7" fill="#fda4af"/>

        <circle cx="330" cy="90" r="10" fill="#10b981"/>
        <circle cx="330" cy="150" r="10" fill="#ef6464" filter="url(#coralGlow)"/>

        <!-- Labels -->
        <text x="50" y="222" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700" text-anchor="middle">SENSORY</text>
        <text x="140" y="222" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700" text-anchor="middle">LATENT</text>
        <text x="240" y="222" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700" text-anchor="middle">ATTENTION</text>
        <text x="330" y="222" fill="#10b981" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700" text-anchor="middle">DISPATCH</text>
      </g>

      <!-- Token Velocity Waveform & Live Telemetry (Right Panel) -->
      <g transform="translate(432, 82)">
        <rect x="0" y="0" width="252" height="236" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
        
        <text x="16" y="24" fill="#64748b" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">TOKEN GENERATION VELOCITY</text>
        <text x="16" y="48" fill="#ef6464" font-size="20" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900">4,850 T/S</text>
        <text x="135" y="48" fill="#10b981" font-size="10" font-family="'Plus Jakarta Sans',sans-serif" font-weight="700">BURST OPTIMAL</text>

        <!-- Dynamic Sine Waveform Box -->
        <rect x="16" y="62" width="220" height="74" fill="#fff5f5" stroke="#fecdd3" stroke-width="1" rx="6"/>
        <path d="M 20 100 Q 40 70, 60 100 T 100 100 T 140 100 T 180 100 T 220 100" fill="none" stroke="#fda4af" stroke-width="1.5"/>
        <path d="M 20 100 Q 35 78, 55 98 T 90 102 T 130 96 T 170 104 T 215 100" fill="none" stroke="#ef6464" stroke-width="2" filter="url(#coralGlow)"/>

        <!-- System Status Badges -->
        <g transform="translate(16, 150)">
          <rect x="0" y="0" width="220" height="22" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.5" rx="4"/>
          <text x="8" y="15" fill="#334155" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="600">SANDBOX: WASM ISOLATE (SECURE)</text>
        </g>

        <g transform="translate(16, 178)">
          <rect x="0" y="0" width="220" height="22" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.5" rx="4"/>
          <text x="8" y="15" fill="#ef6464" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="600">HALLUCINATION: 0.00% (RLCF GROUNDED)</text>
        </g>

        <g transform="translate(16, 206)">
          <rect x="0" y="0" width="220" height="22" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.5" rx="4"/>
          <text x="8" y="15" fill="#10b981" font-size="9" font-family="'Plus Jakarta Sans',sans-serif" font-weight="600">STATE HASH: SHA-256 (VERIFIED ✓)</text>
        </g>
      </g>
    </svg>
  `;

  return `
    <div class="ai-agency-about-modern" style="background:#ffffff;color:#161616;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif;">
      <!-- Hero Section with Signature Coral Arc Radiance -->
      <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% -20%,rgba(239,100,100,0.16) 0%,rgba(255,245,245,0.6) 50%,#ffffff 85%);color:#161616;padding:90px 0 76px;position:relative;overflow:hidden;border-bottom:1px solid #f1f5f9;">
        <div style="position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:780px;height:380px;background:radial-gradient(circle,rgba(239,100,100,0.15) 0%,rgba(254,205,211,0.2) 50%,transparent 70%);filter:blur(65px);pointer-events:none;"></div>

        <div class="wrap" style="max-width:1240px;margin:0 auto;padding:0 24px;position:relative;z-index:2;">
          <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:48px;align-items:center;">
            <!-- Left: Hero Statement -->
            <div data-reveal="fade-up">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(239,100,100,0.08);border:1px solid rgba(239,100,100,0.25);padding:6px 18px;border-radius:9999px;margin-bottom:22px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef6464;box-shadow:0 0 10px rgba(239,100,100,0.6);"></span>
                <span style="font-size:0.8rem;font-weight:800;color:#ef6464;letter-spacing:0.1em;text-transform:uppercase;">
                  ${isZh ? `前沿人工智能实验室 · 创立于 ${esc(company.establishedYear || '2023')}` : `SYNTHETIC REASONING LAB · EST. ${esc(company.establishedYear || '2023')}`}
                </span>
              </div>

              <h1 style="font-size:clamp(2.3rem, 4.4vw, 3.8rem);line-height:1.08;font-weight:900;letter-spacing:-0.035em;color:#161616;margin:0 0 22px;">
                ${esc(headline)}
              </h1>

              <div style="border-left:3px solid #ef6464;padding-left:18px;margin-bottom:28px;">
                <p style="color:#64748b;font-size:1.15rem;line-height:1.7;margin:0;">
                  ${esc(copy.about || (isZh ? '构筑前沿神经符号推理管线、企业级本地化离线大模型推理集群及多智能体协同自治工作流。' : 'Corpox AI Agency architects state-of-the-art synthetic reasoning pipelines, secure local inference clusters, and multi-agent coordination frameworks for visionary enterprises.'))}
                </p>
              </div>

              <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#ef6464;color:#ffffff;font-weight:800;border-radius:8px;padding:16px 36px;box-shadow:0 8px 25px rgba(239,100,100,0.35);text-decoration:none;display:inline-block;">
                  ${isZh ? '部署私有化智能体集群 ↗' : 'Deploy Autonomous Clusters ↗'}
                </a>
                ${company.capabilities ? `
                  <div style="display:inline-flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 22px;font-size:0.84rem;color:#475569;">
                    <span>⚡</span> ${esc(company.capabilities.slice(0, 42))}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Right: Anti-Blank Box Multi-Modal Neural Graph HUD -->
            <div data-reveal="fade-up" style="position:relative;">
              <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:8px;box-shadow:0 16px 40px rgba(239,100,100,0.08);position:relative;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;border-radius:8px 8px 0 0;font-size:0.8rem;color:#64748b;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:#ef6464;display:inline-block;box-shadow:0 0 8px rgba(239,100,100,0.6);"></span>
                    <span style="font-weight:700;color:#161616;">NEURAL ENGINE MONITOR</span>
                  </div>
                  <span style="color:#ef6464;font-weight:700;">TENSORRT-LLM // LIVE</span>
                </div>

                <!-- Fallback Container: vector SVG underneath, image on top with onerror="this.style.display='none'" -->
                <div style="position:relative;min-height:380px;border-radius:0 0 8px 8px;overflow:hidden;background:#ffffff;">
                  <div style="position:absolute;inset:0;z-index:1;">
                    ${neuralSvg}
                  </div>
                  ${aboutImg ? `
                    <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0.92;transition:opacity 0.3s ease;" onerror="this.style.display='none'">
                  ` : ''}
                </div>
              </div>

              <!-- Floating Live Inference Badge -->
              <div style="position:absolute;bottom:-18px;left:-16px;background:#ffffff;border:1px solid #fecdd3;padding:10px 18px;border-radius:8px;box-shadow:0 8px 24px rgba(239,100,100,0.12);display:flex;align-items:center;gap:12px;z-index:3;">
                <span style="font-size:1.5rem;">⚡</span>
                <div>
                  <div style="font-size:0.75rem;font-weight:800;color:#ef6464;letter-spacing:0.08em;text-transform:uppercase;">Latency Benchmark</div>
                  <div style="font-size:0.88rem;font-weight:700;color:#161616;">Sub-18ms Time-to-First-Token</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Real-time Neural Engine Telemetry Bar -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:40px 24px 20px;">
        <div data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #ef6464;border-radius:12px;box-shadow:0 4px 25px rgba(239,100,100,0.06);overflow:hidden;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));">
            ${stats.map((s, idx) => `
              <div style="padding:28px 24px;border-right:${idx < stats.length - 1 ? '1px solid #f1f5f9' : 'none'};position:relative;">
                <div style="font-size:0.75rem;color:#ef6464;font-weight:700;letter-spacing:0.1em;margin-bottom:6px;">
                  TELEMETRY // POD-0${idx + 1}
                </div>
                <div style="font-size:clamp(2.2rem, 3.6vw, 2.8rem);font-weight:900;color:#161616;line-height:1.1;letter-spacing:-0.03em;">
                  <span data-counter="${s.num}" ${s.prefix ? `data-prefix="${esc(s.prefix)}"` : ''} ${s.suffix ? `data-suffix="${esc(s.suffix)}"` : ''}>
                    ${esc(s.value)}
                  </span>
                </div>
                <div style="font-weight:800;color:#ef6464;margin-top:8px;font-size:0.95rem;">
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

      <!-- Engineered Reasoning & Neural Architecture Narrative -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:50px 24px 60px;">
        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:flex-start;">
          <!-- Left: Narrative & Theoretical Foundation -->
          <div data-reveal="fade-up">
            <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:#ef6464;text-transform:uppercase;">
              ${isZh ? '认知计算与确定性工程推理' : 'ENGINEERED REASONING & GROUNDING'}
            </span>
            <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);line-height:1.2;color:#161616;margin:12px 0 22px;font-weight:900;">
              ${isZh ? '超越泛化对话生成：构建高置信度确定性自治系统' : 'Beyond Conversational AI: Deterministic Autonomous Execution'}
            </h2>
            <div style="color:#475569;font-size:1.04rem;line-height:1.8;display:flex;flex-direction:column;gap:18px;">
              ${paras.map(p => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px;">
              <div style="background:#ffffff;border:1px solid #f1f5f9;border-left:3px solid #ef6464;border-radius:8px;padding:18px 20px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
                <strong style="color:#ef6464;display:block;font-size:0.95rem;margin-bottom:4px;">
                  ⚡ ${isZh ? '强类型契约沙箱绑定' : 'Schema-Locked Tooling'}
                </strong>
                <span style="color:#64748b;font-size:0.86rem;line-height:1.5;">
                  ${isZh ? '基于 JSON-RPC 强类型契约与编译器，从底层根除 API 工具调用幻觉。' : 'Deterministic schema-validated interfaces eliminate tool call hallucination.'}
                </span>
              </div>
              <div style="background:#ffffff;border:1px solid #f1f5f9;border-left:3px solid #f43f5e;border-radius:8px;padding:18px 20px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
                <strong style="color:#f43f5e;display:block;font-size:0.95rem;margin-bottom:4px;">
                  🔒 ${isZh ? '密码学状态执行可审计' : 'Cryptographic Trace Audit'}
                </strong>
                <span style="color:#64748b;font-size:0.86rem;line-height:1.5;">
                  ${isZh ? '全链路 Prompt、思考链与工具调用状态哈希防篡改留存，满足企业内控合规。' : 'Immutable hash checkpoints tracing every agentic decision step.'}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Research Lab Charter & Engineering Disciplines -->
          <div data-reveal="fade-up" style="background:#fff8f8;border:1px solid #fee2e2;border-radius:12px;padding:32px;box-shadow:0 8px 30px rgba(239,100,100,0.04);">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #fecdd3;padding-bottom:14px;margin-bottom:20px;">
              <span style="font-size:0.8rem;font-weight:700;color:#ef6464;">CHARTER: NEURAL-2026</span>
              <span style="font-size:0.75rem;background:rgba(239,100,100,0.12);color:#ef6464;padding:3px 8px;border-radius:4px;font-weight:700;">AIR-GAPPED SOVEREIGN</span>
            </div>

            <h3 style="font-size:1.25rem;font-weight:800;color:#161616;margin:0 0 16px;">
              ${isZh ? '前沿工程三大支柱' : 'Core Engineering Disciplines'}
            </h3>

            <div style="display:flex;flex-direction:column;gap:18px;">
              <div style="border-left:3px solid #ef6464;padding-left:16px;">
                <strong style="color:#161616;font-size:0.92rem;">
                  1. ${isZh ? '编译器反馈强化学习 (RLCF)' : 'Compiler-Guided RLCF Optimization'}
                </strong>
                <p style="color:#64748b;font-size:0.84rem;line-height:1.5;margin:4px 0 0;">
                  ${isZh ? '智能体在 WASM 沙箱中自发运行并验证单元测试代码，确保输出具备可执行真实性。' : 'Agents execute and verify compiled unit tests in WASM sandboxes to eliminate hallucination.'}
                </p>
              </div>

              <div style="border-left:3px solid #f43f5e;padding-left:16px;">
                <strong style="color:#161616;font-size:0.92rem;">
                  2. ${isZh ? '自研 Triton & CUDA 低精度加速算子' : 'Custom Triton & CUDA Kernels'}
                </strong>
                <p style="color:#64748b;font-size:0.84rem;line-height:1.5;margin:4px 0 0;">
                  ${isZh ? '深度定制硬件显存访问调度，实现单卡吞吐量较开源框架提升 3.2 倍。' : 'Proprietary memory layout kernels unlocking 3.2x higher throughput per GPU instance.'}
                </p>
              </div>

              <div style="border-left:3px solid #fb7185;padding-left:16px;">
                <strong style="color:#161616;font-size:0.92rem;">
                  3. ${isZh ? '多智能体拜占庭容错博弈协同' : 'Byzantine-Tolerant Swarm Protocols'}
                </strong>
                <p style="color:#64748b;font-size:0.84rem;line-height:1.5;margin:4px 0 0;">
                  ${isZh ? '规划者、执行者与安全校验者多角色交叉校验，杜绝单点偏见与逻辑死锁。' : 'Planner, Actor, and Critic sub-agents cross-validating execution steps in parallel.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4-Stage Autonomous Synthesis Pipeline -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:50px 24px 70px;border-top:1px solid #f1f5f9;" data-reveal="fade-up">
        <div style="text-align:center;margin-bottom:48px;">
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;color:#ef6464;text-transform:uppercase;">
            ${isZh ? '企业级自主炼制管道' : '4-STAGE SYNTHETIC REASONING PIPELINE'}
          </span>
          <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;color:#161616;margin:10px 0;">
            ${isZh ? '端到端私有化自治神经工程管线' : 'End-to-End Enterprise Agentic Pipeline'}
          </h2>
          <p style="color:#64748b;max-width:680px;margin:0 auto;font-size:1rem;">
            ${isZh ? '从高质量领域数据蒸馏、沙箱编译器自省，到多智能体编排与物理气隙低延迟推理。' : 'From domain data distillation to compiler verification and air-gapped private cluster deployment.'}
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          <!-- Stage 1 -->
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #ef6464;border-radius:10px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <span style="font-size:0.75rem;font-weight:700;color:#ef6464;">STAGE 01 // DATA</span>
              <span style="font-size:1.5rem;">🧬</span>
            </div>
            <h3 style="color:#161616;font-size:1.18rem;font-weight:800;margin:0 0 10px;">
              ${isZh ? '领域数据蒸馏与语义清洗' : 'Data Distillation & Curation'}
            </h3>
            <p style="color:#64748b;font-size:0.88rem;line-height:1.6;margin:0;">
              ${isZh ? '自研高熵数据抽取算法，自动化过滤低质噪音，提炼契合企业业务规则的合成指令集。' : 'Automated synthetic data curation extracting high-entropy domain instructions with heuristic filtering.'}
            </p>
          </div>

          <!-- Stage 2 -->
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #f43f5e;border-radius:10px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);transition-delay:0.08s;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <span style="font-size:0.75rem;font-weight:700;color:#f43f5e;">STAGE 02 // RLCF</span>
              <span style="font-size:1.5rem;">⚙️</span>
            </div>
            <h3 style="color:#161616;font-size:1.18rem;font-weight:800;margin:0 0 10px;">
              ${isZh ? '编译器反馈强化学习' : 'Compiler-Guided Verification'}
            </h3>
            <p style="color:#64748b;font-size:0.88rem;line-height:1.6;margin:0;">
              ${isZh ? '通过沙箱编译器对代码、SQL 及 API 执行结果打分，将幻觉率严格压低至 0.00%。' : 'WASM sandbox execution loops providing deterministic reward signals to eliminate logical hallucinations.'}
            </p>
          </div>

          <!-- Stage 3 -->
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #fb7185;border-radius:10px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);transition-delay:0.16s;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <span style="font-size:0.75rem;font-weight:700;color:#fb7185;">STAGE 03 // SWARM</span>
              <span style="font-size:1.5rem;">🐝</span>
            </div>
            <h3 style="color:#161616;font-size:1.18rem;font-weight:800;margin:0 0 10px;">
              ${isZh ? '多智能体蜂群拓扑编排' : 'Multi-Agent Swarm Topology'}
            </h3>
            <p style="color:#64748b;font-size:0.88rem;line-height:1.6;margin:0;">
              ${isZh ? '规划、反思、执行与审计角色解耦，以图遍历算法调度复杂异构系统的企业级生产流。' : 'Graph-based agent orchestration with distributed consensus, parallel tool execution, and self-healing.'}
            </p>
          </div>

          <!-- Stage 4 -->
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #e11d48;border-radius:10px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);transition-delay:0.24s;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <span style="font-size:0.75rem;font-weight:700;color:#e11d48;">STAGE 04 // DEPLOY</span>
              <span style="font-size:1.5rem;">🚀</span>
            </div>
            <h3 style="color:#161616;font-size:1.18rem;font-weight:800;margin:0 0 10px;">
              ${isZh ? '端侧量化与私有离线部署' : 'Quantized Sovereign Clusters'}
            </h3>
            <p style="color:#64748b;font-size:0.88rem;line-height:1.6;margin:0;">
              ${isZh ? '定制 TensorRT-LLM 算子库与 FP8/INT4 量化加速，保障 100% 离线数据物理隔离安全。' : 'Low-latency quantized on-premise clusters with air-gapped security and full sovereignty over corporate IP.'}
            </p>
          </div>
        </div>
      </section>

      <!-- Architecture Chamber CTA -->
      <section class="wrap" style="max-width:1240px;margin:0 auto;padding:20px 24px 85px;">
        <div data-reveal="fade-up" style="background:linear-gradient(135deg, #fff5f5 0%, #ffffff 60%, #fff8f8 100%);border:1px solid #fecdd3;border-radius:12px;padding:48px 40px;color:#161616;box-shadow:0 10px 40px rgba(239,100,100,0.08);">
          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:40px;align-items:center;">
            <div>
              <span style="color:#ef6464;font-weight:700;font-size:0.82rem;letter-spacing:0.12em;text-transform:uppercase;">
                [DEPLOY AUTONOMOUS CLUSTERS // LAB DIRECT ACCESS]
              </span>
              <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.5rem);color:#161616;margin:8px 0 14px;font-weight:900;">
                ${isZh ? '开启私有化神经工作流专属规划研讨' : 'Deploy Sovereign Neural Workflows'}
              </h2>
              <p style="color:#64748b;font-size:1.02rem;line-height:1.7;margin:0;">
                ${isZh ? '与我们的首席人工智能科学家直接沟通，量身打造符合企业行业标准的确定性推理智能体集群。支持完全离线部署与定制算子优化。' : 'Collaborate directly with our research fellows to architect tailored autonomous clusters, custom Triton kernels, and schema-validated agentic pipelines.'}
              </p>
            </div>

            <div style="text-align:center;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
              <div style="font-size:0.82rem;color:#64748b;margin-bottom:18px;">
                ${isZh ? '首期 1 对 1 架构咨询研讨免费开放预约' : 'COMPLIMENTARY ARCHITECTURE SESSION // 48-HR RESPONSE'}
              </div>
              <a class="button" style="background:#ef6464;color:#ffffff;font-weight:800;border-radius:6px;padding:16px 36px;box-shadow:0 8px 25px rgba(239,100,100,0.35);text-decoration:none;display:inline-block;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
                ${isZh ? '预约架构咨询研讨 ↗' : 'Schedule Architecture Session ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderAiAgencyAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyAiAgencyAbout(ctx);
  }
  return renderModernAiAgencyAbout(ctx);
}

export function renderAiAgencyContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% -20%,rgba(239,100,100,0.16) 0%,rgba(255,245,245,0.6) 50%,#ffffff 85%);color:#161616;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #f1f5f9;">
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(239,100,100,0.08);border:1px solid rgba(239,100,100,0.25);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef6464;box-shadow:0 0 10px rgba(239,100,100,0.5);"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#ef6464;letter-spacing:0.08em;text-transform:uppercase;">NEURAL ARCHITECTURE LAB</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;color:#161616;max-width:920px;margin:0 auto 20px;">
          ${esc(ui.conversation || 'Initiate Neural Architecture Consultation')}
        </h1>
        <p style="max-width:720px;color:#64748b;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          ${esc(ui.contactIntro || 'Connect directly with our AI research fellows to blueprint autonomous multi-agent systems, local air-gapped inference clusters, or customized reasoning pipelines.')}
        </p>
      </div>
    </section>
  `;

  const contentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: AI Dispatch & Laboratory -->
        <div style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:36px;box-shadow:0 8px 30px rgba(0,0,0,0.03);">
          <span class="eyebrow" style="color:#ef6464;font-weight:700;">ENGINEERING DESK</span>
          <h3 style="font-size:1.35rem;font-weight:700;color:#161616;margin:8px 0 24px;">AI Labs Dispatch & Infrastructure</h3>

          <div style="display:flex;flex-direction:column;gap:20px;font-size:0.95rem;">
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:#ef6464;text-transform:uppercase;margin-bottom:4px;">Research Direct Email</div>
              <a style="color:#161616;font-weight:700;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#ef6464;text-transform:uppercase;margin-bottom:4px;">Direct Lab Hotline</div>
                <a style="color:#161616;font-weight:700;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#ef6464;text-transform:uppercase;margin-bottom:4px;">Secure WhatsApp Dispatch</div>
                <a style="color:#10b981;font-weight:700;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Connect ↗)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#ef6464;text-transform:uppercase;margin-bottom:4px;">Global Research Headquarters</div>
                <span style="color:#475569;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
            <div style="font-size:0.85rem;color:#64748b;line-height:1.6;">
              <strong style="color:#161616;">Inference Cluster Support:</strong> 24/7 dedicated engineering coverage for enterprise SLAs.<br>
              <strong style="color:#ef6464;">Security Protocol:</strong> All project discussions are protected under standard mutual NDA guidelines.
            </div>
          </div>
        </div>

        <!-- Right: Inquiry Form -->
        <div style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:36px;box-shadow:0 8px 30px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.6rem;font-weight:800;color:#161616;margin:0 0 8px;">Submit Project Brief</h2>
          <p style="color:#64748b;font-size:0.95rem;margin:0 0 28px;">Specify your inference parameters, desired model stack, and deployment environment.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.name)} <span style="color:#ef6464;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#161616;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.email)} <span style="color:#ef6464;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#161616;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#161616;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#161616;font:inherit;">
                <option value="">— Select Target Neural Module —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#334155;font-size:0.88rem;">
              <span>${esc(ui.message)} <span style="color:#ef6464;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Describe your throughput requirements, compliance environment (HIPAA, SOC2), or agentic workflow objectives..." style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;color:#161616;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#ef6464;color:#ffffff;font-weight:800;border:none;border-radius:8px;padding:14px 36px;cursor:pointer;font-size:0.9rem;box-shadow:0 4px 20px rgba(239,100,100,0.35);">
                ${esc(ui.send)} ↗
              </button>
            </div>
            <p class="form-status" role="status" aria-live="polite" style="grid-column:1/-1;margin:4px 0 0;font-size:0.9rem;color:#ef6464;"></p>
          </form>
        </div>
      </div>
    </section>
  `;

  const faqHtml = `
    <section class="wrap" style="padding:40px 0 80px;border-top:1px solid #f1f5f9;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#ef6464;font-weight:700;">DEPLOYMENT FAQ</span>
        <h2 style="font-size:2.2rem;color:#161616;margin:8px 0;">Agent Architecture & Cluster Deployment FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:12px;padding:24px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
          <h3 style="color:#161616;font-size:1.15rem;margin:0 0 8px;">Can we deploy your models within an air-gapped on-premise data center?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Yes. We package complete containerized vLLM inference runtimes that require zero external internet access, ensuring full HIPAA and defense-grade sovereign data isolation.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:12px;padding:24px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
          <h3 style="color:#161616;font-size:1.15rem;margin:0 0 8px;">What level of customization is performed on the foundation weights?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">We perform targeted LoRA/DoRA adapter tuning alongside direct preference optimization (DPO) on your private proprietary datasets, keeping customer weights completely isolated.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:12px;padding:24px;box-shadow:0 4px 15px rgba(0,0,0,0.02);">
          <h3 style="color:#161616;font-size:1.15rem;margin:0 0 8px;">How do the autonomous agents handle edge cases and execution failures?</h3>
          <p style="color:#64748b;font-size:0.92rem;line-height:1.6;margin:0;">Our multi-agent consensus protocol triggers automated replanning and tool retry loops upon detecting assertion failures. If certainty falls below a configurable threshold, the task escalates to human review.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contentHtml}${faqHtml}`;
}

export function renderAiAgencyCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% -20%,rgba(239,100,100,0.16) 0%,rgba(255,245,245,0.6) 50%,#ffffff 85%);color:#161616;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #f1f5f9;">
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(239,100,100,0.08);border:1px solid rgba(239,100,100,0.25);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef6464;box-shadow:0 0 10px rgba(239,100,100,0.5);"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#ef6464;letter-spacing:0.08em;text-transform:uppercase;">MODEL REPOSITORY & AGENTS</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;color:#161616;max-width:920px;margin:0 auto 20px;">
          ${esc(ui.catalog || 'Autonomous Neural Models & Agentic Modules')}
        </h1>
        <p style="max-width:720px;color:#64748b;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          Fine-tuned agentic models, multimodal perception engines, and high-performance inference pipelines ready for sovereign deployment.
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
          const tags = ['Agent Swarm', 'Fine-Tuned LLM', 'Vision-Language', 'RAG Engine', 'Code Synthesis', 'Security Gate'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:26px;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <span style="font-size:0.75rem;font-weight:700;color:#ef6464;background:rgba(239,100,100,0.08);border:1px solid rgba(239,100,100,0.25);padding:4px 12px;border-radius:9999px;">${tags[idx % tags.length]}</span>
                <span style="font-family:monospace;font-size:0.8rem;color:#64748b;">FP8 / AWQ</span>
              </div>
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : ''}
              <h3 style="color:#161616;margin:0 0 8px;font-size:1.25rem;font-weight:800;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#161616;text-decoration:none;">${esc(t.name)}</a>
              </h3>
              <p style="color:#64748b;font-size:0.9rem;line-height:1.6;margin:0 0 20px;flex-grow:1;">${esc(t.description || 'Enterprise agentic intelligence module optimized for high-complexity workflows.')}</p>
              <div style="border-top:1px solid #f1f5f9;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:0.85rem;color:#10b981;font-weight:700;">LATENCY &lt; 18ms</span>
                <a class="text-link" style="color:#ef6464;font-weight:700;font-size:0.9rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  View product →
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

export function renderAiAgencyDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset, options } = ctx;
  const p = draft.products.find(item => item.id === options.productId) || draft.products[0];
  if (!p) {
    return `<section class="wrap" style="padding:80px 0;"><h1>${esc(ui.noProducts || 'Model Not Found')}</h1></section>`;
  }

  const t = translateProduct(p);
  const imgUrl = asset(p.imageAssetId);
  const company = draft.company;
  const isZh = (ctx.lang as string) === 'zh';
  const related = draft.products.filter(item => item.id !== p.id).slice(0, 3);
  const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% -20%,rgba(239,100,100,0.16) 0%,rgba(255,245,245,0.6) 50%,#ffffff 85%);color:#161616;padding:50px 0 40px;position:relative;overflow:hidden;border-bottom:1px solid #f1f5f9;">
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.88rem;color:#64748b;margin-bottom:16px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#64748b;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#64748b;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#ef6464;font-weight:600;">${esc(t.name)}</span>
        </div>
        <h1 style="font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.1;font-weight:900;letter-spacing:-0.02em;margin:0;color:#161616;">
          ${esc(t.name)}
        </h1>
      </div>
    </section>

    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:flex-start;">
        <div>
          ${imgUrl ? `
            <div style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;overflow:hidden;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,0.04);">
              <img id="wr-detail-main-img" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:cover;border-radius:10px;">
            </div>
          ` : `
            <div style="background:#fff5f5;border:1px solid #fecdd3;border-radius:16px;padding:70px 24px;text-align:center;font-size:4rem;">⚡</div>
          `}

          <!-- SLA Progress Bars -->
          <div style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:26px;margin-top:28px;box-shadow:0 8px 30px rgba(0,0,0,0.03);">
            <div style="font-size:0.8rem;font-weight:900;color:#ef6464;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:18px;">
              // INFERENCE RUNTIME BENCHMARKS
            </div>

            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:6px;">
                  <span style="color:#161616;font-weight:700;">Sub-20ms First-Token Latency</span>
                  <span style="color:#ef6464;font-weight:900;font-family:monospace;">99%</span>
                </div>
                <div class="wr-progress-container" style="background:#f1f5f9;height:8px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="99" style="background:linear-gradient(90deg,#ef6464,#f43f5e);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:6px;">
                  <span style="color:#161616;font-weight:700;">Deterministic JSON Schema Precision</span>
                  <span style="color:#f43f5e;font-weight:900;font-family:monospace;">98.6%</span>
                </div>
                <div class="wr-progress-container" style="background:#f1f5f9;height:8px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="98.6" style="background:linear-gradient(90deg,#f43f5e,#fb7185);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:6px;">
                  <span style="color:#161616;font-weight:700;">Zero Data Retention & Sovereign Security</span>
                  <span style="color:#10b981;font-weight:900;font-family:monospace;">100%</span>
                </div>
                <div class="wr-progress-container" style="background:#f1f5f9;height:8px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:#10b981;height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style="display:inline-block;background:rgba(239,100,100,0.08);border:1px solid rgba(239,100,100,0.25);color:#ef6464;padding:4px 14px;border-radius:9999px;font-size:0.82rem;font-weight:700;margin-bottom:16px;">
            AGENTIC RUNTIME V4 · PRODUCTION GRADE
          </div>
          <p style="font-size:1.15rem;line-height:1.75;color:#475569;margin:0 0 24px;">
            ${esc(t.description || 'Enterprise agentic intelligence module optimized for high-complexity workflows.')}
          </p>

          <div style="background:#ffffff;border:1px solid #f1f5f9;border-radius:14px;padding:24px;margin-bottom:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
            <h3 style="color:#161616;font-size:1.1rem;margin:0 0 16px;">Technical Specifications</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              ${p.material ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                  <span style="color:#64748b;">Quantization Format</span>
                  <strong style="color:#161616;">${esc(p.material)}</strong>
                </div>
              ` : ''}
              ${p.dimensions ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                  <span style="color:#64748b;">Context Window</span>
                  <strong style="color:#161616;">${esc(p.dimensions)}</strong>
                </div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Execution Security</span>
                <strong style="color:#10b981;">Air-Gapped Sovereign Isolation</strong>
              </div>
            </div>
          </div>

          <!-- Direct Technical Inquiry Box -->
          <div id="inquiry-panel" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,0.04);">
            <h3 style="font-size:1.3rem;font-weight:900;color:#161616;margin:0 0 8px;">
              ${isZh ? '启动神经模型试点交付' : 'Deploy This Agent / Pilot Request'}
            </h3>
            <p style="font-size:0.9rem;color:#64748b;line-height:1.5;margin:0 0 20px;">
              ${isZh ? '填写您的企业基础设施需求与目标模型规格，Corpox 架构师将在 2 小时内交付沙箱环境。' : 'Submit your infrastructure target and context specs to receive an air-gapped evaluation sandbox within 2 hours.'}
            </p>

            <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:14px;">
              <div>
                <label style="display:block;font-size:0.8rem;color:#64748b;margin-bottom:6px;">Target Architecture</label>
                <input name="productName" value="${esc(t.name)}" readonly style="width:100%;box-sizing:border-box;background:#f8fafc;border:1px solid #cbd5e1;color:#161616;padding:10px 14px;border-radius:8px;font-size:0.9rem;">
                <input type="hidden" name="productId" value="${esc(p.id)}">
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label style="display:block;font-size:0.8rem;color:#64748b;margin-bottom:6px;">Name *</label>
                  <input name="name" required placeholder="Lead Architect / CTO" style="width:100%;box-sizing:border-box;background:#ffffff;border:1px solid #cbd5e1;color:#161616;padding:10px 14px;border-radius:8px;font-size:0.9rem;">
                </div>
                <div>
                  <label style="display:block;font-size:0.8rem;color:#64748b;margin-bottom:6px;">Work Email *</label>
                  <input name="email" type="email" required placeholder="name@enterprise.com" style="width:100%;box-sizing:border-box;background:#ffffff;border:1px solid #cbd5e1;color:#161616;padding:10px 14px;border-radius:8px;font-size:0.9rem;">
                </div>
              </div>
              <div>
                <label style="display:block;font-size:0.8rem;color:#64748b;margin-bottom:6px;">Deployment Scope & Concurrency</label>
                <textarea name="message" rows="3" placeholder="Target throughput (e.g. 500 req/sec, on-prem VPC, Kubernetes vLLM)..." style="width:100%;box-sizing:border-box;background:#ffffff;border:1px solid #cbd5e1;color:#161616;padding:10px 14px;border-radius:8px;font-size:0.9rem;resize:vertical;"></textarea>
              </div>
              <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:6px;">
                <button type="submit" class="button" style="flex:1;background:#ef6464;color:#ffffff;font-weight:800;border:none;border-radius:8px;padding:14px;cursor:pointer;box-shadow:0 4px 20px rgba(239,100,100,0.35);">
                  ${esc(ui.send || 'Submit Pilot Request')} ↗
                </button>
                ${waDigits ? `
                  <a class="button" target="_blank" rel="noopener noreferrer" style="background:#25d366;color:#ffffff;font-weight:800;border-radius:8px;padding:14px 20px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;" href="https://wa.me/${esc(waDigits)}">
                    WhatsApp ↗
                  </a>
                ` : ''}
              </div>
              <p class="form-status" role="status" aria-live="polite" style="margin:4px 0 0;font-size:0.85rem;color:#ef6464;text-align:center;"></p>
            </form>
          </div>
        </div>
      </div>

      <!-- 3 Neural Architecture Pillar Cards -->
      <div style="margin-top:70px;border-top:1px solid #f1f5f9;padding-top:50px;">
        <div style="text-align:center;margin-bottom:36px;">
          <span style="color:#ef6464;font-weight:800;font-size:0.82rem;letter-spacing:0.12em;text-transform:uppercase;">ENTERPRISE ARCHITECTURE PILLARS</span>
          <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#161616;margin:6px 0 0;">Engineered for Mission-Critical Autonomous Execution</h2>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
          <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #ef6464;border-radius:14px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
            <div style="font-size:2rem;margin-bottom:12px;">⚡</div>
            <h3 style="color:#161616;font-size:1.15rem;margin:0 0 8px;">Kernel Acceleration & FP8 Precision</h3>
            <p style="color:#64748b;font-size:0.9rem;line-height:1.6;margin:0;">
              High-throughput continuous batching powered by vLLM and TensorRT-LLM, cutting inference GPU memory footprints by 65% with zero degradation in benchmark accuracy.
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #f43f5e;border-radius:14px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
            <div style="font-size:2rem;margin-bottom:12px;">🛡️</div>
            <h3 style="color:#161616;font-size:1.15rem;margin:0 0 8px;">Grammar-Guided Schema Guardrails</h3>
            <p style="color:#64748b;font-size:0.9rem;line-height:1.6;margin:0;">
              Deterministic state-machine parsing enforces valid JSON output schemas on every generation token, preventing hallucinated parameters during external tool and API calls.
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:1px solid #f1f5f9;border-top:3px solid #fb7185;border-radius:14px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.03);">
            <div style="font-size:2rem;margin-bottom:12px;">🔒</div>
            <h3 style="color:#161616;font-size:1.15rem;margin:0 0 8px;">Air-Gapped Sovereign Isolation</h3>
            <p style="color:#64748b;font-size:0.9rem;line-height:1.6;margin:0;">
              Deployable directly into your AWS Outposts, private bare-metal Kubernetes, or air-gapped government cloud with cryptographic audit logging and ISO 42001 verification.
            </p>
          </div>
        </div>
      </div>

      <!-- Related AI Models Grid -->
      ${related.length > 0 ? `
        <div style="margin-top:70px;border-top:1px solid #f1f5f9;padding-top:40px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
            <h3 style="font-size:1.4rem;font-weight:900;color:#161616;margin:0;">
              ${isZh ? '相关智能体与微调模型' : 'Related AI Agents & Neural Pipelines'}
            </h3>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#ef6464;font-weight:700;font-size:0.9rem;text-decoration:none;">
              ${esc(ui.allProducts)} ↗
            </a>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${related.map((item) => {
              const itemT = translateProduct(item);
              const itemImg = asset(item.imageAssetId);
              return `
                <div class="wr-card-hover" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;padding:20px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                  <div>
                    ${itemImg ? `
                      <img src="${esc(itemImg)}" alt="${esc(itemT.name)}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:14px;">
                    ` : ''}
                    <h4 style="font-size:1.05rem;font-weight:800;color:#161616;margin:0 0 6px;">${esc(itemT.name)}</h4>
                    <p style="font-size:0.84rem;color:#64748b;line-height:1.5;margin:0 0 14px;">${esc(itemT.description || '')}</p>
                  </div>
                  <a class="button" href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="background:#f8fafc;color:#ef6464;border:1px solid #fecdd3;border-radius:6px;padding:8px 16px;text-align:center;font-size:0.85rem;text-decoration:none;font-weight:700;">
                    View Architecture →
                  </a>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  `;
}
