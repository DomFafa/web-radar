import { esc, safeUrl, type ThemeContext } from './types';

export function renderAiAgencyHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Next-Generation Autonomous AI Agents & Neural Solutions',
    subtitle: 'We engineer self-improving agentic workflows, fine-tuned multimodal LLMs, and enterprise-grade neural pipelines that transform complex business logic into autonomous execution.',
    about: 'Corpox AI Agency architects state-of-the-art synthetic reasoning pipelines, secure local inference clusters, and multi-agent coordination frameworks for visionary enterprises.',
    cta: 'Deploy Autonomous Agents',
  };

  // 1. Hero Section
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:radial-gradient(ellipse at 50% 10%,#1e1b4b 0%,#050811 75%);color:#ffffff;padding:95px 0 85px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:700px;height:400px;background:radial-gradient(circle,rgba(6,182,212,0.18) 0%,rgba(99,102,241,0.12) 50%,transparent 70%);filter:blur(60px);pointer-events:none;"></div>
      <div class="wrap hero-content" style="position:relative;z-index:2;text-align:center;align-items:center;margin:0 auto;">
        <div class="wr-hero-float" data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:10px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);padding:7px 20px;border-radius:9999px;margin-bottom:24px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#06b6d4;box-shadow:0 0 10px #06b6d4;"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#67e8f9;letter-spacing:0.08em;text-transform:uppercase;">CORPOX AI LABS · AGENTIC REASONING ENGINE V4</span>
        </div>
        <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.8rem, 5.8vw, 5rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;background:linear-gradient(90deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;max-width:940px;margin:0 auto 24px;text-align:center;">
          ${esc(copy.headline)}
        </h1>
        <p data-reveal="fade-up" style="max-width:720px;color:#94a3b8;font-size:1.22rem;line-height:1.65;margin:0 auto 36px;text-align:center;">
          ${esc(copy.subtitle)}
        </p>
        <div data-reveal="fade-up" style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap;">
          <a class="button" style="background:linear-gradient(90deg,#06b6d4 0%,#6366f1 100%);color:#050811;font-weight:800;border-radius:8px;padding:16px 36px;box-shadow:0 0 30px rgba(6,182,212,0.4);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Deploy Autonomous Agents')} ↗
          </a>
          <a class="button" style="background:rgba(255,255,255,0.06);color:#f8fafc;border:1px solid #334155;border-radius:8px;padding:16px 32px;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Neural Model Catalog →
          </a>
        </div>

        <div data-reveal="fade-up" style="margin-top:48px;display:flex;gap:28px;justify-content:center;flex-wrap:wrap;color:#94a3b8;font-size:0.86rem;font-family:monospace;">
          <div><span style="color:#06b6d4;">[✓]</span> LOW-LATENCY INFERENCE &lt;18ms</div>
          <div><span style="color:#06b6d4;">[✓]</span> ON-PREMISE AIR-GAPPED DEPLOYMENT</div>
          <div><span style="color:#06b6d4;">[✓]</span> ZERO DATA RETENTION RETENTION</div>
        </div>
        <div style="margin-top:40px;">
          <a href="#ai-metrics" class="wr-scroll-down" aria-label="Scroll to neural performance metrics" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;border:1px solid rgba(6,182,212,0.4);color:#06b6d4;font-size:1.3rem;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;">↓</a>
        </div>
      </div>
    </section>
  `;

  // 2. Performance Metrics Strip
  const metricsHtml = `
    <section id="ai-metrics" class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #06b6d4;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(6,182,212,0.08);">
          <div style="font-size:2.8rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;"><span data-counter="5.2" data-suffix="x">5.2x</span> Faster</div>
          <div style="font-weight:700;color:#f8fafc;margin-top:6px;font-size:1.05rem;">Autonomous Agent Deployments</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">FP8 & AWQ kernel optimizations delivering sub-20ms first-token latency.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #818cf8;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(129,140,248,0.08);">
          <div style="font-size:2.8rem;font-weight:900;color:#818cf8;letter-spacing:-1px;"><span data-counter="99.4" data-suffix="%">99.4%</span></div>
          <div style="font-weight:700;color:#f8fafc;margin-top:6px;font-size:1.05rem;">Retrieval Precision (RAG)</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Deterministic JSON schema enforcement eliminating hallucinated tool outputs.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #c084fc;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(192,132,252,0.08);">
          <div style="font-size:2.8rem;font-weight:900;color:#c084fc;letter-spacing:-1px;"><span data-counter="240" data-suffix="M+">240M+</span></div>
          <div style="font-weight:700;color:#f8fafc;margin-top:6px;font-size:1.05rem;">Tokens Processed Daily</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Auto-scaling vLLM clusters orchestrating parallel reasoning workloads.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #38bdf8;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(56,189,248,0.08);">
          <div style="font-size:2.8rem;font-weight:900;color:#38bdf8;letter-spacing:-1px;">Zero Trust</div>
          <div style="font-weight:700;color:#f8fafc;margin-top:6px;font-size:1.05rem;">Air-Gapped Sovereign Security</div>
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
          <span class="eyebrow" style="color:#06b6d4;font-weight:700;">NEURAL CAPABILITIES</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#f8fafc;">Autonomous Agents & Fine-Tuned Models</h2>
        </div>
        <a class="text-link" style="color:#38bdf8;font-weight:600;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
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
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 0 30px rgba(6,182,212,0.06);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                  <span style="font-size:1.8rem;">${icons[idx % icons.length]}</span>
                  <span style="font-size:0.75rem;font-weight:700;color:#38bdf8;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);padding:4px 12px;border-radius:9999px;">${tags[idx % tags.length]}</span>
                </div>
                ${imgUrl ? `<div class="product-image" style="border-radius:10px;overflow:hidden;margin-bottom:16px;max-height:180px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" loading="lazy"></div>` : ''}
                <h3 style="color:#f8fafc;margin:0 0 10px;font-size:1.3rem;font-weight:700;">${esc(t.name)}</h3>
                <p style="color:#94a3b8;line-height:1.6;font-size:0.92rem;margin:0 0 20px;">${esc(t.description || 'Enterprise agentic intelligence module optimized for high-complexity workflows.')}</p>
              </div>
              <div style="border-top:1px solid #1e293b;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#06b6d4;font-weight:700;font-size:0.88rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  Inspect Model Specs →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 4. Multi-Agent Swarm Orchestration Section
  const architectureHtml = `
    <section class="wrap" style="padding:60px 0;border-top:1px solid #1e293b;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;">
        <div data-reveal="fade-up">
          <span class="eyebrow" style="color:#06b6d4;font-weight:700;">AGENTIC FRAMEWORK</span>
          <h2 style="font-size:2.4rem;line-height:1.15;color:#f8fafc;margin:12px 0 20px;">
            Deterministic Tool Execution with Self-Correction Loops
          </h2>
          <p style="color:#cbd5e1;font-size:1.05rem;line-height:1.75;margin-bottom:28px;">
            Standard chatbots generate text; our autonomous agents execute mission-critical code. Combining hierarchical planner agents with dynamic tool dispatch, our architectures autonomously write, test, debug, and verify real-world enterprise operations.
          </p>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.2);border-radius:10px;padding:16px;">
              <strong style="color:#67e8f9;font-size:0.95rem;">1. Hierarchical Task Decomposition</strong>
              <div style="color:#94a3b8;font-size:0.86rem;margin-top:4px;">Deconstructs ambiguous executive directives into directed acyclic graphs (DAGs) of verifiable sub-tasks.</div>
            </div>
            <div style="background:rgba(129,140,248,0.06);border:1px solid rgba(129,140,248,0.2);border-radius:10px;padding:16px;">
              <strong style="color:#a5b4fc;font-size:0.95rem;">2. Sandbox Code Execution & Verification</strong>
              <div style="color:#94a3b8;font-size:0.86rem;margin-top:4px;">Runs code in isolated micro-VM environments with automated unit tests and runtime feedback loops.</div>
            </div>
            <div style="background:rgba(192,132,252,0.06);border:1px solid rgba(192,132,252,0.2);border-radius:10px;padding:16px;">
              <strong style="color:#d8b4fe;font-size:0.95rem;">3. Persistent Episodic & Semantic Memory</strong>
              <div style="color:#94a3b8;font-size:0.86rem;margin-top:4px;">Hybrid dense-sparse vector recall maintaining cross-session context without prompt bloat.</div>
            </div>
          </div>
          <div style="margin-top:32px;">
            <a class="button" style="background:rgba(255,255,255,0.08);color:#f8fafc;border:1px solid #334155;border-radius:8px;font-weight:700;" href="${path('about/index.html')}" ${navAttrs('about')}>
              Explore Agent Swarm Whitepaper ↗
            </a>
          </div>
        </div>

        <div class="wr-hero-float wr-card-hover" data-reveal="fade-up" style="background:#090d16;border:1px solid #1e293b;border-radius:16px;padding:32px;box-shadow:0 0 40px rgba(6,182,212,0.12);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:14px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#06b6d4;animation:pulse 2s infinite;"></span>
              <span style="font-family:monospace;font-size:0.82rem;color:#67e8f9;">AGENT_SWARM_RUNTIME: ACTIVE</span>
            </div>
            <span style="font-family:monospace;font-size:0.75rem;color:#64748b;">DAG_ID: #4092-B</span>
          </div>
          <div style="font-family:monospace;font-size:0.84rem;color:#94a3b8;line-height:1.7;display:flex;flex-direction:column;gap:12px;">
            <div style="background:#0d1527;border-left:3px solid #06b6d4;padding:10px 14px;border-radius:0 6px 6px 0;">
              <div style="color:#38bdf8;">&gt; [Planner] Task decomposed into 4 parallel micro-actions</div>
              <div style="color:#64748b;font-size:0.75rem;">Duration: 0.04s · Memory: 12MB · Confidence: 99.8%</div>
            </div>
            <div style="background:#0d1527;border-left:3px solid #818cf8;padding:10px 14px;border-radius:0 6px 6px 0;">
              <div style="color:#a5b4fc;">&gt; [ToolExec] Dispatching API call to payment settlement ledger</div>
              <div style="color:#64748b;font-size:0.75rem;">Status: 200 OK · Payload verified against schema</div>
            </div>
            <div style="background:#0d1527;border-left:3px solid #34d399;padding:10px 14px;border-radius:0 6px 6px 0;">
              <div style="color:#6ee7b7;">&gt; [Verifier] Mathematical proofs aligned. Output certified.</div>
              <div style="color:#64748b;font-size:0.75rem;">Target state verified · Commit dispatched to master DB</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 5. Model Stack & Ecosystem
  const modelsHtml = `
    <section class="wrap" style="padding:50px 0 35px;border-top:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:32px;">
        <span class="eyebrow" style="color:#06b6d4;font-weight:700;">MODEL STACK & FOUNDATION INTEGRATIONS</span>
        <h2 style="font-size:1.9rem;color:#f8fafc;margin:8px 0;">Multi-Model Heterogeneous Inference</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
        ${['DeepSeek-R1', 'Claude 3.7 Sonnet', 'GPT-4o Vision', 'Llama 3.3 70B', 'vLLM Engine', 'Qdrant Vector DB', 'LangGraph Cluster', 'Triton Server'].map(name => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:1.4rem;margin-bottom:6px;">⚡</div>
            <div style="font-size:0.84rem;font-weight:700;color:#e2e8f0;">${name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // 6. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#06b6d4;font-weight:700;">INDUSTRY FEEDBACK</span>
        <h2 style="font-size:2rem;color:#f8fafc;margin:8px 0;">Validated by Chief AI Officers & Engineering VPs</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:28px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
          <div style="color:#06b6d4;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Corpox replaced 12 fragmented Python microservices with an autonomous multi-agent cluster that operates 24/7 without intervention."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#06b6d4;color:#050811;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">AK</div>
            <div><div style="font-weight:700;color:#f8fafc;font-size:0.9rem;">Dr. Aris Thorne</div><div style="color:#64748b;font-size:0.8rem;">VP AI Research, Synthetix Corp</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:28px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
          <div style="color:#06b6d4;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Inference latency dropped by 80% with their custom quantization kernels while maintaining 99.8% precision on financial math."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#818cf8;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">NZ</div>
            <div><div style="font-weight:700;color:#f8fafc;font-size:0.9rem;">Nadia Zhou</div><div style="color:#64748b;font-size:0.8rem;">Chief Data Scientist, QuantEdge Global</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:28px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
          <div style="color:#06b6d4;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The on-premise air-gapped deployment gave our bank the exact security certifications needed for full production rollout."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#c084fc;color:#050811;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">LS</div>
            <div><div style="font-weight:700;color:#f8fafc;font-size:0.9rem;">Lucas Sommer</div><div style="color:#64748b;font-size:0.8rem;">CISO, Zurich Financial Systems</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 7. Contact / Cyber CTA Band
  const contactBandHtml = `
    <section class="contact-band" style="background:#080d1a;color:#ffffff;padding:80px 0;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;">
      <div class="wrap" data-reveal="fade-up" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#06b6d4;font-weight:700;">AUTONOMOUS ENTERPRISE</span>
          <h2 style="font-size:2.4rem;margin:10px 0;max-width:680px;color:#ffffff;">
            Ready to deploy sovereign AI agents across your infrastructure?
          </h2>
          <p style="color:#94a3b8;font-size:1.1rem;margin:0;max-width:550px;">Schedule an architecture workshop with our neural systems engineers.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:linear-gradient(90deg,#06b6d4 0%,#6366f1 100%);color:#050811;font-weight:800;border-radius:8px;padding:16px 36px;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Schedule AI Workshop ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${metricsHtml}${productsHtml}${architectureHtml}${modelsHtml}${testimonialsHtml}${contactBandHtml}`;
}

export function renderAiAgencyAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'Corpox AI Agency architects state-of-the-art synthetic reasoning pipelines, secure local inference clusters, and multi-agent coordination frameworks for visionary enterprises.',
  };

  const heroHtml = `
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% 10%,#1e1b4b 0%,#050811 75%);color:#ffffff;padding:80px 0 60px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(circle,rgba(6,182,212,0.18) 0%,rgba(99,102,241,0.12) 50%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#06b6d4;box-shadow:0 0 10px #06b6d4;"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#67e8f9;letter-spacing:0.08em;text-transform:uppercase;">CORPOX AI LABS · RESEARCH CHARTER</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;background:linear-gradient(90deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;max-width:920px;margin:0 auto 20px;">
          Autonomous Neural Intelligence & Synthetic Reasoning
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          ${esc(copy.about)}
        </p>
      </div>
    </section>
  `;

  const statsHtml = `
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
          <p style="color:#cbd5e1;font-size:1.05rem;line-height:1.75;margin-bottom:20px;">
            At Corpox AI Labs, we reject the notion that enterprises must choose between creative neural generation and deterministic reliability. We build agentic reasoning loops where mathematical logic, code compilers, and relational databases act as self-correcting grounding layers.
          </p>
          <p style="color:#cbd5e1;font-size:1.05rem;line-height:1.75;margin:0 0 28px;">
            Our proprietary multi-agent orchestrator decomposes complex business directives into parallel execution graphs, ensuring every single tool call is schema-validated and auditable down to individual floating-point tensor activations.
          </p>
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

export function renderAiAgencyContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% 10%,#1e1b4b 0%,#050811 75%);color:#ffffff;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(circle,rgba(6,182,212,0.18) 0%,rgba(99,102,241,0.12) 50%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#06b6d4;box-shadow:0 0 10px #06b6d4;"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#67e8f9;letter-spacing:0.08em;text-transform:uppercase;">NEURAL ARCHITECTURE LAB</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;background:linear-gradient(90deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;max-width:920px;margin:0 auto 20px;">
          ${esc(ui.conversation || 'Initiate Neural Architecture Consultation')}
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          ${esc(ui.contactIntro || 'Connect directly with our AI research fellows to blueprint autonomous multi-agent systems, local air-gapped inference clusters, or customized reasoning pipelines.')}
        </p>
      </div>
    </section>
  `;

  const contentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: AI Dispatch & Laboratory -->
        <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:36px;box-shadow:0 0 30px rgba(6,182,212,0.06);">
          <span class="eyebrow" style="color:#06b6d4;font-weight:700;">ENGINEERING DESK</span>
          <h3 style="font-size:1.35rem;font-weight:700;color:#f8fafc;margin:8px 0 24px;">AI Labs Dispatch & Infrastructure</h3>

          <div style="display:flex;flex-direction:column;gap:20px;font-size:0.95rem;">
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:#06b6d4;text-transform:uppercase;margin-bottom:4px;">Research Direct Email</div>
              <a style="color:#38bdf8;font-weight:700;font-size:1.05rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#06b6d4;text-transform:uppercase;margin-bottom:4px;">Direct Lab Hotline</div>
                <a style="color:#f8fafc;font-weight:700;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#06b6d4;text-transform:uppercase;margin-bottom:4px;">Secure WhatsApp Dispatch</div>
                <a style="color:#10b981;font-weight:700;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Connect ↗)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#06b6d4;text-transform:uppercase;margin-bottom:4px;">Global Research Headquarters</div>
                <span style="color:#cbd5e1;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;background:#050811;border:1px solid #1e293b;border-radius:12px;padding:20px;">
            <div style="font-size:0.85rem;color:#94a3b8;line-height:1.6;">
              <strong style="color:#67e8f9;">Inference Cluster Support:</strong> 24/7 dedicated engineering coverage for enterprise SLAs.<br>
              <strong style="color:#a5b4fc;">Security Protocol:</strong> All project discussions are protected under standard mutual NDA guidelines.
            </div>
          </div>
        </div>

        <!-- Right: Inquiry Form -->
        <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:36px;box-shadow:0 0 30px rgba(6,182,212,0.06);">
          <h2 style="font-size:1.6rem;font-weight:800;color:#f8fafc;margin:0 0 8px;">Submit Project Brief</h2>
          <p style="color:#94a3b8;font-size:0.95rem;margin:0 0 28px;">Specify your inference parameters, desired model stack, and deployment environment.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.name)} <span style="color:#06b6d4;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#050811;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.email)} <span style="color:#06b6d4;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#050811;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" style="background:#050811;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#050811;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;">
                <option value="">— Select Target Neural Module —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#cbd5e1;font-size:0.88rem;">
              <span>${esc(ui.message)} <span style="color:#06b6d4;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Describe your throughput requirements, compliance environment (HIPAA, SOC2), or agentic workflow objectives..." style="background:#050811;border:1px solid #1e293b;border-radius:8px;padding:12px 14px;color:#f8fafc;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:linear-gradient(90deg,#06b6d4 0%,#6366f1 100%);color:#050811;font-weight:800;border:none;border-radius:8px;padding:14px 36px;cursor:pointer;font-size:0.9rem;box-shadow:0 0 20px rgba(6,182,212,0.3);">
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
    <section class="wrap" style="padding:40px 0 80px;border-top:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#06b6d4;font-weight:700;">DEPLOYMENT FAQ</span>
        <h2 style="font-size:2.2rem;color:#f8fafc;margin:8px 0;">Agent Architecture & Cluster Deployment FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">Can we deploy your models within an air-gapped on-premise data center?</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Yes. We package complete containerized vLLM inference runtimes that require zero external internet access, ensuring full HIPAA and defense-grade sovereign data isolation.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">What level of customization is performed on the foundation weights?</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">We perform targeted LoRA/DoRA adapter tuning alongside direct preference optimization (DPO) on your private proprietary datasets, keeping customer weights completely isolated.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">How do the autonomous agents handle edge cases and execution failures?</h3>
          <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0;">Our multi-agent consensus protocol triggers automated replanning and tool retry loops upon detecting assertion failures. If certainty falls below a configurable threshold, the task escalates to human review.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contentHtml}${faqHtml}`;
}

export function renderAiAgencyCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% 10%,#1e1b4b 0%,#050811 75%);color:#ffffff;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(circle,rgba(6,182,212,0.18) 0%,rgba(99,102,241,0.12) 50%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#06b6d4;box-shadow:0 0 10px #06b6d4;"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#67e8f9;letter-spacing:0.08em;text-transform:uppercase;">MODEL REPOSITORY & AGENTS</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;background:linear-gradient(90deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;max-width:920px;margin:0 auto 20px;">
          ${esc(ui.catalog || 'Autonomous Neural Models & Agentic Modules')}
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.2rem;line-height:1.65;margin:0 auto;">
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
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:26px;display:flex;flex-direction:column;box-shadow:0 0 25px rgba(6,182,212,0.05);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <span style="font-size:0.75rem;font-weight:700;color:#38bdf8;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);padding:4px 12px;border-radius:9999px;">${tags[idx % tags.length]}</span>
                <span style="font-family:monospace;font-size:0.8rem;color:#67e8f9;">FP8 / AWQ</span>
              </div>
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#050811;border-radius:10px;margin-bottom:16px;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="background:#050811;border-radius:10px;padding:28px 20px;text-align:center;font-size:2.5rem;margin-bottom:16px;">🧠</div>
              `}
              <h3 style="color:#f8fafc;margin:0 0 10px;font-size:1.3rem;font-weight:700;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#f8fafc;text-decoration:none;">
                  ${esc(t.name)}
                </a>
              </h3>
              <p style="color:#94a3b8;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                ${esc(t.description || 'Enterprise agentic intelligence module optimized for high-complexity workflows.')}
              </p>
              <div style="border-top:1px solid #1e293b;padding-top:16px;display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
                <span style="font-size:0.85rem;color:#06b6d4;font-family:monospace;">LATENCY &lt; 18ms</span>
                <a style="color:#38bdf8;font-weight:700;font-size:0.9rem;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${esc(ui.details || 'Inspect Model')} →
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
    <section class="ai-inner-hero" style="background:radial-gradient(ellipse at 50% 10%,#1e1b4b 0%,#050811 75%);color:#ffffff;padding:50px 0 40px;position:relative;overflow:hidden;border-bottom:1px solid #1e293b;">
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.88rem;color:#94a3b8;margin-bottom:16px;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#94a3b8;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#94a3b8;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#67e8f9;">${esc(t.name)}</span>
        </div>
        <h1 style="font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.1;font-weight:900;letter-spacing:-0.02em;margin:0;color:#f8fafc;">
          ${esc(t.name)}
        </h1>
      </div>
    </section>

    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:flex-start;">
        <div>
          ${imgUrl ? `
            <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;overflow:hidden;padding:24px;box-shadow:0 0 30px rgba(6,182,212,0.08);">
              <img id="wr-detail-main-img" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:cover;border-radius:10px;">
            </div>
          ` : `
            <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:70px 24px;text-align:center;font-size:4rem;">⚡</div>
          `}

          <!-- SLA Progress Bars -->
          <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:26px;margin-top:28px;box-shadow:0 0 25px rgba(6,182,212,0.05);">
            <div style="font-size:0.8rem;font-weight:900;color:#67e8f9;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:18px;">
              // INFERENCE RUNTIME BENCHMARKS
            </div>

            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:6px;">
                  <span style="color:#f8fafc;font-weight:700;">Sub-20ms First-Token Latency</span>
                  <span style="color:#06b6d4;font-weight:900;font-family:monospace;">99%</span>
                </div>
                <div class="wr-progress-container" style="background:#1e293b;height:8px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="99" style="background:linear-gradient(90deg,#06b6d4,#6366f1);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:6px;">
                  <span style="color:#f8fafc;font-weight:700;">Deterministic JSON Schema Precision</span>
                  <span style="color:#818cf8;font-weight:900;font-family:monospace;">98.6%</span>
                </div>
                <div class="wr-progress-container" style="background:#1e293b;height:8px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="98.6" style="background:linear-gradient(90deg,#818cf8,#c084fc);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:6px;">
                  <span style="color:#f8fafc;font-weight:700;">Zero Data Retention & Sovereign Security</span>
                  <span style="color:#34d399;font-weight:900;font-family:monospace;">100%</span>
                </div>
                <div class="wr-progress-container" style="background:#1e293b;height:8px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#10b981,#34d399);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style="display:inline-block;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);color:#67e8f9;padding:4px 14px;border-radius:9999px;font-size:0.82rem;font-weight:700;margin-bottom:16px;">
            AGENTIC RUNTIME V4 · PRODUCTION GRADE
          </div>
          <p style="font-size:1.15rem;line-height:1.75;color:#cbd5e1;margin:0 0 24px;">
            ${esc(t.description || 'Enterprise agentic intelligence module optimized for high-complexity workflows.')}
          </p>

          <div style="background:#0b1120;border:1px solid #1e293b;border-radius:14px;padding:24px;margin-bottom:28px;">
            <h3 style="color:#f8fafc;font-size:1.1rem;margin:0 0 16px;">Technical Specifications</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              ${p.material ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #1e293b;">
                  <span style="color:#94a3b8;">Quantization Format</span>
                  <strong style="color:#38bdf8;">${esc(p.material)}</strong>
                </div>
              ` : ''}
              ${p.dimensions ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #1e293b;">
                  <span style="color:#94a3b8;">Context Window</span>
                  <strong style="color:#f8fafc;">${esc(p.dimensions)}</strong>
                </div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#94a3b8;">Execution Security</span>
                <strong style="color:#34d399;">Air-Gapped Sovereign Isolation</strong>
              </div>
            </div>
          </div>

          <!-- Direct Technical Inquiry Box -->
          <div id="inquiry-panel" style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:28px;box-shadow:0 12px 30px rgba(0,0,0,0.4);">
            <h3 style="font-size:1.3rem;font-weight:900;color:#f8fafc;margin:0 0 8px;">
              ${isZh ? '启动神经模型试点交付' : 'Deploy This Agent / Pilot Request'}
            </h3>
            <p style="font-size:0.9rem;color:#94a3b8;line-height:1.5;margin:0 0 20px;">
              ${isZh ? '填写您的企业基础设施需求与目标模型规格，Corpox 架构师将在 2 小时内交付沙箱环境。' : 'Submit your infrastructure target and context specs to receive an air-gapped evaluation sandbox within 2 hours.'}
            </p>

            <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:flex;flex-direction:column;gap:14px;">
              <div>
                <label style="display:block;font-size:0.8rem;color:#94a3b8;margin-bottom:6px;">Target Architecture</label>
                <input name="productName" value="${esc(t.name)}" readonly style="width:100%;box-sizing:border-box;background:#151d2f;border:1px solid #334155;color:#67e8f9;padding:10px 14px;border-radius:8px;font-size:0.9rem;">
                <input type="hidden" name="productId" value="${esc(p.id)}">
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label style="display:block;font-size:0.8rem;color:#94a3b8;margin-bottom:6px;">Name *</label>
                  <input name="name" required placeholder="Lead Architect / CTO" style="width:100%;box-sizing:border-box;background:#050811;border:1px solid #334155;color:#ffffff;padding:10px 14px;border-radius:8px;font-size:0.9rem;">
                </div>
                <div>
                  <label style="display:block;font-size:0.8rem;color:#94a3b8;margin-bottom:6px;">Work Email *</label>
                  <input name="email" type="email" required placeholder="name@enterprise.com" style="width:100%;box-sizing:border-box;background:#050811;border:1px solid #334155;color:#ffffff;padding:10px 14px;border-radius:8px;font-size:0.9rem;">
                </div>
              </div>
              <div>
                <label style="display:block;font-size:0.8rem;color:#94a3b8;margin-bottom:6px;">Deployment Scope & Concurrency</label>
                <textarea name="message" rows="3" placeholder="Target throughput (e.g. 500 req/sec, on-prem VPC, Kubernetes vLLM)..." style="width:100%;box-sizing:border-box;background:#050811;border:1px solid #334155;color:#ffffff;padding:10px 14px;border-radius:8px;font-size:0.9rem;resize:vertical;"></textarea>
              </div>
              <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:6px;">
                <button type="submit" class="button" style="flex:1;background:linear-gradient(90deg,#06b6d4 0%,#6366f1 100%);color:#050811;font-weight:800;border:none;border-radius:8px;padding:14px;cursor:pointer;box-shadow:0 0 20px rgba(6,182,212,0.35);">
                  ${esc(ui.send || 'Submit Pilot Request')} ↗
                </button>
                ${waDigits ? `
                  <a class="button" target="_blank" rel="noopener noreferrer" style="background:#25d366;color:#ffffff;font-weight:800;border-radius:8px;padding:14px 20px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;" href="https://wa.me/${esc(waDigits)}">
                    WhatsApp ↗
                  </a>
                ` : ''}
              </div>
              <p class="form-status" role="status" aria-live="polite" style="margin:4px 0 0;font-size:0.85rem;color:#67e8f9;text-align:center;"></p>
            </form>
          </div>
        </div>
      </div>

      <!-- 3 Neural Architecture Pillar Cards -->
      <div style="margin-top:70px;border-top:1px solid #1e293b;padding-top:50px;">
        <div style="text-align:center;margin-bottom:36px;">
          <span style="color:#06b6d4;font-weight:800;font-size:0.82rem;letter-spacing:0.12em;text-transform:uppercase;">ENTERPRISE ARCHITECTURE PILLARS</span>
          <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#f8fafc;margin:6px 0 0;">Engineered for Mission-Critical Autonomous Execution</h2>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
          <div data-reveal="fade-up" class="wr-card-hover" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #06b6d4;border-radius:14px;padding:28px;">
            <div style="font-size:2rem;margin-bottom:12px;">⚡</div>
            <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">Kernel Acceleration & FP8 Precision</h3>
            <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:0;">
              High-throughput continuous batching powered by vLLM and TensorRT-LLM, cutting inference GPU memory footprints by 65% with zero degradation in benchmark accuracy.
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-card-hover" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #818cf8;border-radius:14px;padding:28px;">
            <div style="font-size:2rem;margin-bottom:12px;">🛡️</div>
            <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">Grammar-Guided Schema Guardrails</h3>
            <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:0;">
              Deterministic state-machine parsing enforces valid JSON output schemas on every generation token, preventing hallucinated parameters during external tool and API calls.
            </p>
          </div>

          <div data-reveal="fade-up" class="wr-card-hover" style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #c084fc;border-radius:14px;padding:28px;">
            <div style="font-size:2rem;margin-bottom:12px;">🔒</div>
            <h3 style="color:#f8fafc;font-size:1.15rem;margin:0 0 8px;">Air-Gapped Sovereign Isolation</h3>
            <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin:0;">
              Deployable directly into your AWS Outposts, private bare-metal Kubernetes, or air-gapped government cloud with cryptographic audit logging and ISO 42001 verification.
            </p>
          </div>
        </div>
      </div>

      <!-- Related AI Models Grid -->
      ${related.length > 0 ? `
        <div style="margin-top:70px;border-top:1px solid #1e293b;padding-top:40px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
            <h3 style="font-size:1.4rem;font-weight:900;color:#f8fafc;margin:0;">
              ${isZh ? '相关智能体与微调模型' : 'Related AI Agents & Neural Pipelines'}
            </h3>
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#38bdf8;font-weight:700;font-size:0.9rem;text-decoration:none;">
              ${esc(ui.allProducts)} ↗
            </a>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${related.map((item) => {
              const itemT = translateProduct(item);
              const itemImg = asset(item.imageAssetId);
              return `
                <div class="wr-card-hover" style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;overflow:hidden;padding:20px;display:flex;flex-direction:column;justify-content:space-between;">
                  <div>
                    ${itemImg ? `
                      <img src="${esc(itemImg)}" alt="${esc(itemT.name)}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:14px;">
                    ` : ''}
                    <h4 style="font-size:1.05rem;font-weight:800;color:#f8fafc;margin:0 0 6px;">${esc(itemT.name)}</h4>
                    <p style="font-size:0.84rem;color:#94a3b8;line-height:1.5;margin:0 0 14px;">${esc(itemT.description || '')}</p>
                  </div>
                  <a class="button" href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="background:rgba(255,255,255,0.06);color:#67e8f9;border:1px solid #1e293b;border-radius:6px;padding:8px 16px;text-align:center;font-size:0.85rem;text-decoration:none;">
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

