import { esc, type ThemeContext } from './types';

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
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);padding:7px 20px;border-radius:9999px;margin-bottom:24px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#06b6d4;box-shadow:0 0 10px #06b6d4;"></span>
          <span style="font-size:0.84rem;font-weight:700;color:#67e8f9;letter-spacing:0.08em;text-transform:uppercase;">CORPOX AI LABS · AGENTIC REASONING ENGINE V4</span>
        </div>
        <h1 class="hero-title" style="font-size:clamp(2.8rem, 5.8vw, 5rem);line-height:1.06;font-weight:900;letter-spacing:-0.035em;background:linear-gradient(90deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;max-width:940px;margin:0 auto 24px;text-align:center;">
          ${esc(copy.headline)}
        </h1>
        <p style="max-width:720px;color:#94a3b8;font-size:1.22rem;line-height:1.65;margin:0 auto 36px;text-align:center;">
          ${esc(copy.subtitle)}
        </p>
        <div style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap;">
          <a class="button" style="background:linear-gradient(90deg,#06b6d4 0%,#6366f1 100%);color:#050811;font-weight:800;border-radius:8px;padding:16px 36px;box-shadow:0 0 30px rgba(6,182,212,0.4);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            ${esc(copy.cta || 'Deploy Autonomous Agents')} ↗
          </a>
          <a class="button" style="background:rgba(255,255,255,0.06);color:#f8fafc;border:1px solid #334155;border-radius:8px;padding:16px 32px;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            Explore Neural Model Catalog →
          </a>
        </div>

        <div style="margin-top:48px;display:flex;gap:28px;justify-content:center;flex-wrap:wrap;color:#94a3b8;font-size:0.86rem;font-family:monospace;">
          <div><span style="color:#06b6d4;">[✓]</span> LOW-LATENCY INFERENCE &lt;18ms</div>
          <div><span style="color:#06b6d4;">[✓]</span> ON-PREMISE AIR-GAPPED DEPLOYMENT</div>
          <div><span style="color:#06b6d4;">[✓]</span> ZERO DATA RETENTION RETENTION</div>
        </div>
      </div>
    </section>
  `;

  // 2. Performance Metrics Strip
  const metricsHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #06b6d4;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(6,182,212,0.08);">
          <div style="font-size:2.8rem;font-weight:900;color:#06b6d4;letter-spacing:-1px;">5.2x Faster</div>
          <div style="font-weight:700;color:#f8fafc;margin-top:6px;font-size:1.05rem;">Autonomous Agent Deployments</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">FP8 & AWQ kernel optimizations delivering sub-20ms first-token latency.</div>
        </div>
        <div style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #818cf8;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(129,140,248,0.08);">
          <div style="font-size:2.8rem;font-weight:900;color:#818cf8;letter-spacing:-1px;">99.4%</div>
          <div style="font-weight:700;color:#f8fafc;margin-top:6px;font-size:1.05rem;">Retrieval Precision (RAG)</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Deterministic JSON schema enforcement eliminating hallucinated tool outputs.</div>
        </div>
        <div style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #c084fc;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(192,132,252,0.08);">
          <div style="font-size:2.8rem;font-weight:900;color:#c084fc;letter-spacing:-1px;">240M+</div>
          <div style="font-weight:700;color:#f8fafc;margin-top:6px;font-size:1.05rem;">Tokens Processed Daily</div>
          <div style="font-size:0.86rem;color:#64748b;margin-top:6px;line-height:1.5;">Auto-scaling vLLM clusters orchestrating parallel reasoning workloads.</div>
        </div>
        <div style="background:#0b1120;border:1px solid #1e293b;border-top:3px solid #38bdf8;border-radius:14px;padding:26px;box-shadow:0 0 25px rgba(56,189,248,0.08);">
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
          const imgUrl = asset(p.imageAssetId);
          const icons = ['🧠', '🤖', '⚡', '📊', '🔍', '🛡️'];
          const tags = ['Agent Swarm', 'Fine-Tuned LLM', 'Vision-Language', 'RAG Engine', 'Code Synthesis', 'Security Gate'];
          return `
            <article class="product-card" style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 0 30px rgba(6,182,212,0.06);">
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
        <div>
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

        <div style="background:#090d16;border:1px solid #1e293b;border-radius:16px;padding:32px;box-shadow:0 0 40px rgba(6,182,212,0.12);">
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
          <div style="background:#0b1120;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center;">
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
        <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:28px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
          <div style="color:#06b6d4;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Corpox replaced 12 fragmented Python microservices with an autonomous multi-agent cluster that operates 24/7 without intervention."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#06b6d4;color:#050811;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">AK</div>
            <div><div style="font-weight:700;color:#f8fafc;font-size:0.9rem;">Dr. Aris Thorne</div><div style="color:#64748b;font-size:0.8rem;">VP AI Research, Synthetix Corp</div></div>
          </div>
        </div>
        <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:28px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
          <div style="color:#06b6d4;font-size:1.1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Inference latency dropped by 80% with their custom quantization kernels while maintaining 99.8% precision on financial math."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#818cf8;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">NZ</div>
            <div><div style="font-weight:700;color:#f8fafc;font-size:0.9rem;">Nadia Zhou</div><div style="color:#64748b;font-size:0.8rem;">Chief Data Scientist, QuantEdge Global</div></div>
          </div>
        </div>
        <div style="background:#0b1120;border:1px solid #1e293b;border-radius:16px;padding:28px;box-shadow:0 0 25px rgba(6,182,212,0.06);">
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
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
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
