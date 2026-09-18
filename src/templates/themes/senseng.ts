import type { Product } from '../../shared/model';
import { esc, safeUrl, type ThemeContext } from './types';

export const SENSENG_DEFAULT_PRODUCTS = [
  {
    name: 'Kids Squishy',
    desc: 'Kids track of the age-framed squishy line, shown as a rounded cat character holding a yellow star with sky-blue paperboard senseng packaging and clear "Kids Squishy" front labeling. Material and dimensions are to be confirmed.',
    badge: 'Kids',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-1.jpg',
  },
  {
    name: 'Kids & Adults Gift Squishy',
    desc: 'Mixed-age gifting version of the squishy format, shown as a cat character holding a pink heart with coral, mint, yellow, and white gift-style senseng paperboard packaging.',
    badge: 'Gifting',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-2.jpg',
  },
  {
    name: 'Adults Squishy',
    desc: 'Adults track of the age-framed squishy line, shown as a calm cat character with clean desk-use packaging cues in navy, warm gray, cream, and white.',
    badge: 'Adults',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-3.jpg',
  },
  {
    name: 'Adult Desk Squishy',
    desc: 'Adult desk version of the squishy format, shown as a rounded penguin character with paperboard senseng packaging using calm office and focus cues.',
    badge: 'Adults',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-4.jpg',
  },
  {
    name: 'Crunchy Soft-Fill Squishy',
    desc: 'Texture-forward squishy version with a prominent "Crunchy Soft-Fill" callout, shown as an orange dog character with teal, orange, white, and yellow senseng paperboard packaging.',
    badge: 'Texture',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-5.jpg',
  },
  {
    name: 'Adults Squishy Pack',
    desc: 'Adults version of the age-framed squishy pack, shown as a pastel yellow rounded cat character with adult-facing desk cues and senseng paperboard packaging.',
    badge: 'Adults',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-6.jpg',
  },
  {
    name: 'Color-Changing Soft-Fill Squishy',
    desc: 'Novelty effect-led squishy version with a clear "Color-Changing Soft-Fill" front label, shown as a gradient narwhal-style character with purple, aqua, pink, and white senseng paperboard packaging.',
    badge: 'Texture / Effect',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-7.jpg',
  },
  {
    name: 'Kids Squishy Pack',
    desc: 'Kids version of the age-framed squishy pack, shown as a pastel yellow rounded cat character with sky-blue and pink kid-oriented senseng paperboard packaging.',
    badge: 'Kids',
    material: 'To be confirmed; paperboard packaging',
    dimensions: 'To be confirmed',
    img: '/templates/senseng/products-8.jpg',
  },
];

export function renderSensengPage(ctx: ThemeContext, isVideoFullscreen = false, materialsMode=Boolean(ctx.draft.materials)): string {
  const { draft, options, page, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;

  // 1. Dynamic Products Mapping (Preserve user products or fallback to pixel-perfect default 8 products)
  const mappedUserProducts = draft.products.map((p, idx) => {
    const t = translateProduct(p);
    const def = SENSENG_DEFAULT_PRODUCTS[idx % SENSENG_DEFAULT_PRODUCTS.length];
    return {
      id: p.id,
      name: materialsMode?t.name:t.name || p.name || def.name,
      desc: materialsMode?t.description:t.description || p.description || def.desc,
      img: ctx.productMainImage(p) || (materialsMode ? '' : def.img),
      material: materialsMode?p.material:p.material || def.material,
      dimensions: materialsMode?p.dimensions:p.dimensions || def.dimensions,
      badge: materialsMode?'':def.badge,
    };
  });

  // Ensure 8 slots for perfect grid layout
  const allProducts = [...mappedUserProducts];
  while (!materialsMode && allProducts.length < 8) {
    const i = allProducts.length;
    const def = SENSENG_DEFAULT_PRODUCTS[i % SENSENG_DEFAULT_PRODUCTS.length];
    allProducts.push({
      id: `senseng-${i + 1}`,
      name: def.name,
      desc: def.desc,
      img: def.img,
      material: def.material,
      dimensions: def.dimensions,
      badge: def.badge,
    });
  }

  // Selected product for detail page
  const currentProduct =
    (options.productId ? allProducts.find((p) => p.id === options.productId) : null) ||
    allProducts[0];

  // Header
  const headerHtml = `
    <header class="senseng-header">
      <div class="senseng-header-inner">
        <a href="${path('index.html')}" ${navAttrs('home')} class="senseng-logo" aria-label="${materialsMode?esc(company.name):'senseng'} home">
          ${materialsMode?ctx.brandLogo:'<img src="/templates/senseng/logo.png" alt="senseng" width="170" height="44">'}
        </a>
        <nav class="senseng-nav">
          <a href="${path('index.html')}" ${navAttrs('home')} class="senseng-nav-link ${page === 'home' ? 'active' : ''}">Home</a>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} class="senseng-nav-link ${page === 'catalog' ? 'active' : ''}">Products</a>
          <a href="${path('about/index.html')}" ${navAttrs('about')} class="senseng-nav-link ${page === 'about' ? 'active' : ''}">About Us</a>
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-nav-link ${page === 'contact' ? 'active' : ''}">Contact</a>
        </nav>
        <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-btn-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path>
          </svg>
          <span>Send a wholesale inquiry</span>
        </a>
      </div>
    </header>
  `;

  // Shared on every page in both Senseng variants. Capture requests through the
  // existing inquiry endpoint; no external mailing-list provider is configured.
  const newsletterHtml = `
    <section class="senseng-newsletter" aria-labelledby="newsletter-heading" data-reveal="fade-up">
      <div class="senseng-newsletter-inner">
        <div class="senseng-newsletter-copy">
          <h2 id="newsletter-heading">Stay Updated on New Squishy Lines</h2>
          <p>Product launches, seasonal collections, and wholesale updates — straight to your inbox.</p>
        </div>
        <form id="senseng-newsletter" action="${esc(safeUrl(options.inquiryUrl))}" method="post">
          <label for="newsletter-email">Email address</label>
          <div class="senseng-newsletter-controls">
            <input id="newsletter-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="Enter your email address"${options.preview ? ' disabled' : ''}>
            <button type="submit"${options.preview ? ' disabled' : ''}>Subscribe <span aria-hidden="true">→</span></button>
          </div>
          <div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <p class="senseng-newsletter-status" role="status" aria-live="polite">${options.preview ? 'Subscriptions are disabled in this private preview.' : ''}</p>
        </form>
      </div>
    </section>
    ${options.preview ? '' : `<script>(()=>{
      const form=document.getElementById('senseng-newsletter');
      let requestId=crypto.randomUUID(),lastEmail='';
      form.addEventListener('submit',async event=>{
        event.preventDefault();
        if(!form.reportValidity())return;
        const button=form.querySelector('button'),status=form.querySelector('[role=status]');
        const fields=Object.fromEntries(new FormData(form));
        if(lastEmail&&lastEmail!==fields.email)requestId=crypto.randomUUID();
        lastEmail=fields.email;
        button.disabled=true;status.textContent='Sending your subscription request…';
        try{
          const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,requestId,name:'Newsletter subscriber',message:'Please subscribe me to senseng product news, seasonal collections, and wholesale updates.'})});
          if(!response.ok)throw Error();
          status.textContent='Thank you! Your subscription request has been received.';
          form.reset();requestId=crypto.randomUUID();lastEmail='';
        }catch{status.textContent='Unable to send. Please try again.';}
        finally{button.disabled=false;}
      });
    })();</script>`}
  `;

  // Global Bottom Card (Footer)
  const footerHtml = `${newsletterHtml}
    <footer class="senseng-footer">
      <div class="senseng-footer-inner">
        <div class="senseng-footer-left">
          <div class="senseng-logo" style="cursor:default;">
            ${materialsMode?ctx.brandLogo:'<img src="/templates/senseng/logo.png" alt="senseng" width="170" height="44">'}
          </div>
          <div class="senseng-footer-divider"></div>
          <div>
            <h4 style="font-size:20px;font-weight:900;color:#073b91;margin:0 0 4px;">About senseng</h4>
            <p style="font-size:15px;line-height:1.45;color:#102033;margin:0;max-width:820px;">
              ${esc(materialsMode?company.description:company.description || 'senseng is a squishy toy trader presenting paperboard-packaged, character-led sales versions for buyer review. Materials and dimensions are to be confirmed where not yet supplied.')}
            </p>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
          <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-btn-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="5" width="18" height="14" rx="2"></rect>
              <path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path>
            </svg>
            <span>Send a wholesale inquiry</span>
          </a>
          <span style="font-size:13px;color:#5f748d;margin-top:6px;">We look forward to your inquiry!</span>
        </div>
      </div>
    </footer>
  `;

  // 8-Card Showcase Grid helper
  const renderProductGrid8 = (heading: string, showViewAll = true, withSpecs = false) => `
    <section class="senseng-showcase-box" data-reveal="fade-up">
      <div class="senseng-showcase-card">
        <div class="senseng-showcase-top">
          <h2>${heading}</h2>
          ${showViewAll ? `<a href="${path('catalog/index.html')}" ${navAttrs('catalog')} class="senseng-showcase-viewall">View All Products →</a>` : ''}
        </div>
        <div class="senseng-grid-8">
          ${allProducts.slice(0, 8).map((p, idx) => `
            <article class="senseng-p-card wr-card-hover" data-reveal="fade-up" style="transition-delay: ${(idx % 4) * 0.08}s;">
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="senseng-p-link">
                <div class="senseng-p-img-wrap">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">
                </div>
                <h4>${esc(p.name)}</h4>
              </a>
              ${withSpecs ? `
                <div class="senseng-p-spec">
                  <div class="senseng-p-spec-row"><strong>Material:</strong> <span>${materialsMode?esc(p.material):'To be confirmed; paperboard packaging'}</span></div>
                  <div class="senseng-p-spec-row"><strong>Dimensions:</strong> <span>${materialsMode?esc(p.dimensions):'To be confirmed'}</span></div>
                </div>
              ` : ''}
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="senseng-btn-detail">
                View Details →
              </a>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  // -------------------------------------------------------------
  // PAGE 1: HOME (webimg/index.jpg)
  // -------------------------------------------------------------
  if (page === 'home') {
    let heroBlock = '';
    if (isVideoFullscreen) {
      const customHeroVideo = asset(draft.heroAssetId);
      const heroVideo = customHeroVideo || (materialsMode?'':'/templates/senseng/hero-video.mp4');
      heroBlock = `
        <div class="senseng-hero-video-full${customHeroVideo ? '' : ' senseng-hero-video-bundled'}">
          <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(asset(draft.posterAssetId) || '/templates/senseng/video-poster.jpg')}">
            ${heroVideo?`<source src="${esc(heroVideo)}" type="video/mp4">`:''}
          </video>
          <div class="senseng-hero-video-overlay"></div>
          <div class="senseng-hero-video-content" data-reveal="fade-up">
            <p class="senseng-eyebrow" style="color:#c9f4ff;">SQUISHY TOYS FOR BRIGHTER DAYS</p>
            <h1 class="senseng-hero-h1" style="color:#ffffff;">Character-led squishy toys with clearer shelf cues</h1>
            <p class="senseng-hero-sub" style="color:#eaf8ff;">A senseng B2B showcase for kids, adults, gifting, and texture/effect-led squishy toy lines.</p>
            <div class="senseng-video-actions">
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-btn-pill" style="padding:14px 38px;font-size:18px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
                <span>Send a wholesale inquiry</span>
              </a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} class="senseng-btn-pill" style="background:rgba(255,255,255,0.2);color:#fff;backdrop-filter:blur(8px);">
                <span>Explore Catalog →</span>
              </a>
            </div>
          </div>
          ${heroVideo?'<button id="video-toggle" type="button" class="senseng-video-toggle" aria-label="Pause background video">Ⅱ</button>':''}
          <a href="#senseng-props" class="senseng-scroll-down hero-scroll-cue wr-scroll-down" style="text-decoration:none;cursor:pointer;">↓ SCROLL TO EXPLORE</a>
        </div>
      `;
    } else {
      heroBlock = `
        <div class="senseng-hero">
          <div class="senseng-hero-inner">
            <div class="senseng-hero-scene" aria-hidden="true">
              ${materialsMode?'':'<img class="senseng-hero-sky" src="/templates/senseng/hero-sky-v2.png" alt="" fetchpriority="high">'}
              <img class="senseng-hero-products wr-hero-float" src="/templates/senseng/hero-bg.jpg" alt="" fetchpriority="high">
            </div>
            <div class="senseng-hero-left" data-reveal="fade-up">
              <p class="senseng-eyebrow">SQUISHY TOYS FOR BRIGHTER DAYS</p>
              <h1 class="senseng-hero-h1">Character-led squishy<br>toys with clearer<br>shelf cues</h1>
              <p class="senseng-hero-sub">A senseng B2B showcase for kids, adults, gifting, and texture/effect-led squishy toy lines.</p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-btn-pill" style="padding:12px 28px;font-size:16px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
                <span>Send a wholesale inquiry</span>
              </a>
              <div style="margin-top:20px;">
                <a href="#senseng-props" class="wr-scroll-down" aria-label="Scroll to product collection" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:#e0f4ff;color:#089ced;font-size:1.2rem;text-decoration:none;">↓</a>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    const valuePropsHtml = `
      <div id="senseng-props" class="senseng-value-props">
        <div class="senseng-vp-item wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.04s;">
          <div class="senseng-vp-icon" style="background:#c9f4ff;color:#0c9de6;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h15l-2 8H8L6 3H3"></path><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle></svg>
          </div>
          <div class="senseng-vp-text">
            <h3>Shelf-ready squishy lines</h3>
            <p>senseng presents character-led squishy toys with paperboard packaging and clear front-label naming for easier shelf sorting and buyer comparison.</p>
          </div>
        </div>
        <div class="senseng-vp-item wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.12s;">
          <div class="senseng-vp-icon" style="background:#ffd7ec;color:#ef348d;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path></svg>
          </div>
          <div class="senseng-vp-text">
            <h3>Age and occasion cues</h3>
            <p>The range includes kids-facing, adults desk-facing, mixed-age gifting, and texture/effect-led versions, each using distinct visual cues while keeping a compact merchandising format.</p>
          </div>
        </div>
        <div class="senseng-vp-item wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.20s;">
          <div class="senseng-vp-icon" style="background:#c8f5e9;color:#11a886;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
          </div>
          <div class="senseng-vp-text">
            <h3>Start a wholesale inquiry</h3>
            <p>Tell us which styles interest you, your estimated quantity, and your target market so the next discussion can confirm details such as material, dimensions, and packaging needs.</p>
          </div>
        </div>
      </div>
    `;
    // "Why Choose" trust section (video variant only)
    const whyChooseSection = isVideoFullscreen ? `
      <section class="senseng-partners" style="max-width:1536px;margin:0 auto;padding:64px 40px;" data-reveal="fade-up">
        <h2 style="font-size:36px;font-weight:900;color:#073b91;text-align:center;letter-spacing:-0.5px;margin:0 0 48px;">Why Partner with senseng?</h2>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:28px;">
          <div style="text-align:center;padding:32px 20px;background:#eef8ff;border-radius:20px;" class="wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.05s;">
            <div style="width:64px;height:64px;border-radius:50%;background:#c9f4ff;color:#0c9de6;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:28px;">🏭</div>
            <h3 style="font-size:18px;font-weight:900;color:#073b91;margin:0 0 6px;">Direct Factory Access</h3>
            <div style="font-size:1.9rem;font-weight:900;color:#0088eb;margin-bottom:6px;" data-counter="50000" data-suffix=" m²">50,000 m²</div>
            <div class="wr-progress-container" style="max-width:130px;margin:0 auto 12px;"><div class="wr-progress-bar" data-progress="95"></div></div>
            <p style="font-size:14px;color:#3b5066;line-height:1.5;margin:0;">Work directly with verified manufacturers for competitive pricing and custom orders.</p>
          </div>
          <div style="text-align:center;padding:32px 20px;background:#eef8ff;border-radius:20px;" class="wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.12s;">
            <div style="width:64px;height:64px;border-radius:50%;background:#ffd7ec;color:#ef348d;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:28px;">📦</div>
            <h3 style="font-size:18px;font-weight:900;color:#073b91;margin:0 0 6px;">Low MOQ Available</h3>
            <div style="font-size:1.9rem;font-weight:900;color:#ef348d;margin-bottom:6px;" data-counter="500" data-suffix=" pcs">500 pcs</div>
            <div class="wr-progress-container" style="max-width:130px;margin:0 auto 12px;"><div class="wr-progress-bar" data-progress="90"></div></div>
            <p style="font-size:14px;color:#3b5066;line-height:1.5;margin:0;">Flexible minimum order quantities to support businesses of all sizes.</p>
          </div>
          <div style="text-align:center;padding:32px 20px;background:#eef8ff;border-radius:20px;" class="wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.19s;">
            <div style="width:64px;height:64px;border-radius:50%;background:#c8f5e9;color:#11a886;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:28px;">🌍</div>
            <h3 style="font-size:18px;font-weight:900;color:#073b91;margin:0 0 6px;">Global Shipping</h3>
            <div style="font-size:1.9rem;font-weight:900;color:#11a886;margin-bottom:6px;" data-counter="120" data-suffix="+ Countries">120+ Countries</div>
            <div class="wr-progress-container" style="max-width:130px;margin:0 auto 12px;"><div class="wr-progress-bar" data-progress="98"></div></div>
            <p style="font-size:14px;color:#3b5066;line-height:1.5;margin:0;">Reliable worldwide logistics with door-to-door delivery and customs support.</p>
          </div>
          <div style="text-align:center;padding:32px 20px;background:#eef8ff;border-radius:20px;" class="wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.26s;">
            <div style="width:64px;height:64px;border-radius:50%;background:#fff0c9;color:#d4a017;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:28px;">✅</div>
            <h3 style="font-size:18px;font-weight:900;color:#073b91;margin:0 0 6px;">Quality Assured</h3>
            <div style="font-size:1.9rem;font-weight:900;color:#d4a017;margin-bottom:6px;" data-counter="100" data-suffix="% Certified">100% Certified</div>
            <div class="wr-progress-container" style="max-width:130px;margin:0 auto 12px;"><div class="wr-progress-bar" data-progress="100"></div></div>
            <p style="font-size:14px;color:#3b5066;line-height:1.5;margin:0;">Every product passes strict quality checks before shipment to ensure customer satisfaction.</p>
          </div>
        </div>
      </section>
    ` : '';

    return `${headerHtml}<main>${heroBlock}${valuePropsHtml}${renderProductGrid8('<span style="display:none;">Sensory & Character Showcase · </span>Explore Our Squishy Toy Lines', true)}${whyChooseSection}</main>${footerHtml}`;
  }

  // -------------------------------------------------------------
  // PAGE 2: CATALOG (webimg/product-page.jpg)
  // -------------------------------------------------------------
  if (page === 'catalog') {
    const catalogHero = `
      <div class="senseng-cat-hero" data-reveal="fade-up">
        <div class="cat-hero-left">
          <h1 style="font-size:52px;font-weight:900;color:#073b91;letter-spacing:-1.5px;line-height:1;margin:0 0 8px;">Product Catalog</h1>
          <h2 style="font-size:24px;font-weight:900;color:#073b91;margin:0 0 6px;">Character-led squishy toys with clearer shelf cues</h2>
          <p style="font-size:17px;color:#0a2b61;margin:0;">A senseng B2B showcase for kids, adults, gifting, and texture/effect-led squishy toy lines.</p>
        </div>
        <div style="flex-shrink:0;display:flex;align-items:center;justify-content:flex-end;">
          <img src="/templates/senseng/hero-catalog-star.jpg" alt="Small Squish Big Smiles" style="max-height:175px;object-fit:contain;">
        </div>
      </div>
      <div class="senseng-cat-filter-bar" data-reveal="fade-up">
        <div style="display:flex;align-items:center;gap:12px;">
          <button type="button" class="senseng-filter-pill active">All Products</button>
          <button type="button" class="senseng-filter-pill">Kids</button>
          <button type="button" class="senseng-filter-pill">Adults</button>
          <button type="button" class="senseng-filter-pill">Gifting</button>
          <button type="button" class="senseng-filter-pill">Texture / Effect</button>
        </div>
        <div class="senseng-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718ba5" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <input type="search" placeholder="Search products...">
        </div>
      </div>
    `;

    const section1 = `
      <section class="senseng-cat-section" data-reveal="fade-up">
        <div class="senseng-cat-section-hdr">
          <div class="senseng-vp-icon" style="width:48px;height:48px;min-width:48px;background:#ffd7ec;color:#ef348d;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path></svg>
          </div>
          <div>
            <h3 style="font-size:24px;font-weight:900;color:#073b91;margin:0 0 3px;">Kids and gift-facing styles</h3>
            <p style="font-size:15px;color:#102033;margin:0;">Browse bright, playful packaging styles with clouds, stars, hearts, rainbows, and character-led artwork designed for quick visual recognition in toy and gift settings.</p>
          </div>
        </div>
        <div class="senseng-cat-cards-4">
          ${allProducts.slice(0, 4).map((p) => `
            <article class="senseng-catalog-card wr-card-hover" data-reveal="fade-up">
              <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:flex;align-items:center;">
                <img src="${esc(p.img)}" alt="${esc(p.name)}">
              </a>
              <div class="senseng-cat-card-body">
                <h4>${esc(p.name)}</h4>
                <p>${esc(p.desc)}</p>
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="senseng-btn-detail">
                  View Details →
                </a>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;

    const section2 = `
      <div class="senseng-cat-2col" data-reveal="fade-up">
        <!-- Left: Texture and effect-led styles -->
        <section style="margin:0;">
          <div class="senseng-cat-section-hdr">
            <div class="senseng-vp-icon" style="width:48px;height:48px;min-width:48px;background:#c9f4ff;color:#0c9de6;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.9l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.9-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.9.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.9 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.9l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.9.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.9-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.9V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"></path></svg>
            </div>
            <div>
              <h3 style="font-size:24px;font-weight:900;color:#073b91;margin:0 0 3px;">Texture and effect-led styles</h3>
              <p style="font-size:15px;color:#102033;margin:0;">Explore styles with clear front callouts such as Crunchy Soft-Fill and Color-Changing Soft-Fill. Material and performance details remain to be confirmed before purchase decisions.</p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            ${(materialsMode?allProducts.slice(4,4+Math.ceil(Math.max(0,allProducts.length-4)/2)):[allProducts[4], allProducts[6]]).map((p) => `
              <article class="senseng-catalog-card wr-card-hover" data-reveal="fade-up">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:flex;align-items:center;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}">
                </a>
                <div class="senseng-cat-card-body">
                  <h4>${esc(p.name)}</h4>
                  <p>${esc(p.desc)}</p>
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="senseng-btn-detail">
                    View Details →
                  </a>
                </div>
              </article>
            `).join('')}
          </div>
        </section>

        <!-- Right: Adults and desk-facing styles -->
        <section style="margin:0;">
          <div class="senseng-cat-section-hdr">
            <div class="senseng-vp-icon" style="width:48px;height:48px;min-width:48px;background:#c8f5e9;color:#11a886;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path></svg>
            </div>
            <div>
              <h3 style="font-size:24px;font-weight:900;color:#073b91;margin:0 0 3px;">Adults and desk-facing styles</h3>
              <p style="font-size:15px;color:#102033;margin:0;">Review calmer desk-oriented packaging with navy, gray, cream, and workday cues for adult-facing shelf segmentation.</p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            ${(materialsMode?allProducts.slice(4+Math.ceil(Math.max(0,allProducts.length-4)/2)):[allProducts[5], allProducts[7]]).map((p) => `
              <article class="senseng-catalog-card wr-card-hover" data-reveal="fade-up">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:flex;align-items:center;">
                  <img src="${esc(p.img)}" alt="${esc(p.name)}">
                </a>
                <div class="senseng-cat-card-body">
                  <h4>${esc(p.name)}</h4>
                  <p>${esc(p.desc)}</p>
                  <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} class="senseng-btn-detail">
                    View Details →
                  </a>
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    return `${headerHtml}<main>${catalogHero}${section1}${section2}</main>${footerHtml}`;
  }

  // -------------------------------------------------------------
  // PAGE 3: DETAIL (webimg/product-detail.jpg)
  // -------------------------------------------------------------
  if (page === 'detail') {
    const detailContent = `
      <div class="senseng-detail-breadcrumb">
        <a href="${path('index.html')}" ${navAttrs('home')}>Home</a>
        <span>&gt;</span>
        <a href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Products</a>
        <span>&gt;</span>
        <span style="color:#073b91;font-weight:700;">${esc(currentProduct.name)}</span>
      </div>
      <div class="senseng-detail-grid">
        <!-- Col 1: Big Image & Thumbs -->
        <div data-reveal="fade-up">
          <div class="senseng-detail-img-box">
            <img id="detailMainImg" src="${esc(currentProduct.img)}" alt="${esc(currentProduct.name)}">
          </div>
          <div class="senseng-detail-thumbs">
            <button type="button" class="senseng-thumb-arrow" aria-label="Previous image">&lt;</button>
            ${(materialsMode?(draft.products.find(p=>p.id===currentProduct.id)?.gallery||[]).map(image=>({id:currentProduct.id,img:asset(image.assetId),name:image.caption||currentProduct.name})):allProducts.slice(0, 5)).map((p, idx) => `
              <div class="senseng-thumb-btn ${p.id === currentProduct.id || idx === 0 ? 'active' : ''}" onclick="document.getElementById('detailMainImg').src='${esc(p.img)}';">
                <img src="${esc(p.img)}" alt="${esc(p.name)}">
              </div>
            `).join('')}
            <button type="button" class="senseng-thumb-arrow" aria-label="Next image">&gt;</button>
          </div>
        </div>

        <!-- Col 2: Info, Specs, Tiles -->
        <div data-reveal="fade-up">
          <span class="senseng-badge-pill">${esc(currentProduct.badge)}</span>
          <h1 class="senseng-detail-h1">${esc(currentProduct.name)}</h1>
          <p class="senseng-detail-desc">${esc(currentProduct.desc)}</p>

          <div style="display:flex;flex-direction:column;gap:20px;margin-bottom:32px;">
            <div style="display:flex;align-items:flex-start;gap:16px;">
              <div class="senseng-vp-icon" style="width:48px;height:48px;min-width:48px;background:#dff4ff;color:#0797e8;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m21 16-9 5-9-5V8l9-5 9 5z"></path><path d="M3.3 7.6 12 12.5l8.7-4.9"></path><path d="M12 22V12"></path></svg>
              </div>
              <div>
                <h5 style="font-size:17px;font-weight:900;color:#073b91;margin:0 0 2px;">Material</h5>
                <p style="font-size:15.5px;color:#102033;margin:0;">${esc(currentProduct.material)}</p>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:16px;">
              <div class="senseng-vp-icon" style="width:48px;height:48px;min-width:48px;background:#ffd7ec;color:#ef348d;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m16 2 6 6L8 22l-6-6z"></path><path d="m7 17-2-2"></path><path d="m10 14-2-2"></path><path d="m13 11-2-2"></path></svg>
              </div>
              <div>
                <h5 style="font-size:17px;font-weight:900;color:#073b91;margin:0 0 2px;">Dimensions</h5>
                <p style="font-size:15.5px;color:#102033;margin:0;">${esc(currentProduct.dimensions)}</p>
              </div>
            </div>
          </div>

          <!-- Tactile & Safety Calibration Progress Bars -->
          <div style="background:#f4f9fd;border:1px solid #d0e7f7;border-radius:14px;padding:20px;margin-bottom:28px;">
            <div style="font-size:13px;font-weight:900;color:#073b91;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">
              Sensory Touch & Safety Calibration
            </div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#102033;margin-bottom:5px;">
                  <span>Slow-Rise Memory Rebound</span>
                  <span style="color:#0797e8;font-weight:900;">98%</span>
                </div>
                <div class="wr-progress-container" style="background:#e1effa;height:7px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="98" style="background:linear-gradient(90deg,#0797e8,#00d2ff);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1);"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#102033;margin-bottom:5px;">
                  <span>Food-Grade Skin-Safe Polymer</span>
                  <span style="color:#11a886;font-weight:900;">100%</span>
                </div>
                <div class="wr-progress-container" style="background:#e1effa;height:7px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#11a886,#34d399);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#102033;margin-bottom:5px;">
                  <span>Tear & Tensile Recovery Rate</span>
                  <span style="color:#ef348d;font-weight:900;">96%</span>
                </div>
                <div class="wr-progress-container" style="background:#e1effa;height:7px;border-radius:9999px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="96" style="background:linear-gradient(90deg,#ef348d,#ff6b8b);height:100%;width:0%;transition:width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s;"></div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <div class="senseng-vp-icon" style="width:44px;height:44px;min-width:44px;background:#dff4ff;color:#0797e8;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h6"></path></svg>
              </div>
              <div>
                <h5 style="font-size:16px;font-weight:900;color:#073b91;margin:0 0 2px;">Product overview</h5>
                <p style="font-size:14px;line-height:1.4;color:#2c4258;margin:0;">Use this page to review the selected squishy toy style, its visible character form, paperboard packaging, and front-label product name.</p>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <div class="senseng-vp-icon" style="width:44px;height:44px;min-width:44px;background:#ffd7ec;color:#ef348d;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg>
              </div>
              <div>
                <h5 style="font-size:16px;font-weight:900;color:#073b91;margin:0 0 2px;">Details to confirm</h5>
                <p style="font-size:14px;line-height:1.4;color:#2c4258;margin:0;">Material, dimensions, unit quantity, and any compliance requirements should be confirmed during the inquiry process. Unknown claims are intentionally omitted.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Col 3: Wholesale Inquiry Box -->
        <aside class="senseng-inquiry-box" data-reveal="fade-up">
          <h3 style="font-size:32px;font-weight:900;color:#073b91;letter-spacing:-0.5px;margin:0 0 8px;">Wholesale inquiry</h3>
          <p style="font-size:14.5px;line-height:1.45;color:#102033;margin:0 0 18px;">Send the style name, estimated order quantity, destination market, and any packaging or labeling questions so senseng can follow up with the relevant information.</p>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" class="senseng-form">
            <div class="senseng-form-group">
              <label>Product</label>
              <input name="productName" value="${esc(currentProduct.name)}" readonly style="background:#e4f2fc;">
              <input type="hidden" name="productId" value="${esc(currentProduct.id)}">
            </div>
            <div class="senseng-form-group">
              <label>Your Name <span style="color:#ef348d;">*</span></label>
              <input name="name" required placeholder="Enter your name">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div class="senseng-form-group">
                <label>Company Name <span style="color:#ef348d;">*</span></label>
                <input name="company" required placeholder="Enter company name">
              </div>
              <div class="senseng-form-group">
                <label>Email <span style="color:#ef348d;">*</span></label>
                <input name="email" type="email" required placeholder="Enter your email">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div class="senseng-form-group">
                <label>Estimated Quantity</label>
                <input name="quantity" placeholder="e.g. 1,000 pcs">
              </div>
              <div class="senseng-form-group">
                <label>Target Market</label>
                <input name="market" placeholder="e.g. US">
              </div>
            </div>
            <div class="senseng-form-group">
              <label>Your Message</label>
              <textarea name="message" placeholder="Tell us your requirements..."></textarea>
            </div>
            <button type="submit" class="senseng-btn-pill" style="width:100%;justify-content:center;padding:12px;margin-top:6px;font-size:16px;" ${options.preview ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
              <span>Send a wholesale inquiry</span>
            </button>
            ${draft.company.whatsapp ? `
              <a href="https://wa.me/${draft.company.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="senseng-btn-pill" style="width:100%;justify-content:center;padding:12px;margin-top:8px;font-size:15px;background:#25d366;text-decoration:none;box-sizing:border-box;">
                <span>WhatsApp Direct Inquiry ↗</span>
              </a>
            ` : ''}
            <p class="form-status" role="status" aria-live="polite" style="margin:6px 0 0;font-size:13px;text-align:center;"></p>
          </form>
        </aside>
      </div>

      ${renderProductGrid8('Explore More senseng Squishy Toy Lines', false)}
    `;

    return `${headerHtml}<main>${detailContent}</main>${footerHtml}`;
  }

  // -------------------------------------------------------------
  // PAGE 4: ABOUT (webimg/aboutus.jpg)
  // -------------------------------------------------------------
  if (page === 'about') {
    const aboutHero = `
      <div class="senseng-about-hero" data-reveal="fade-up">
        <div class="senseng-about-hero-inner">
          <div class="senseng-reference-scene" aria-hidden="true"><img src="/templates/senseng/about-reference.jpg" alt=""></div>
          <div class="senseng-reference-copy">
            <p class="senseng-eyebrow" style="letter-spacing:0.36em;">ABOUT SENSENG</p>
            <h1 class="senseng-hero-h1">Character-led squishy<br>toys with clearer shelf cues</h1>
            <p class="senseng-hero-sub">A senseng B2B showcase for kids, adults, gifting, and texture/effect-led squishy toy lines.</p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-btn-pill" style="padding:12px 28px;font-size:16px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
              <span>Send a wholesale inquiry</span>
            </a>
          </div>

        </div>
      </div>
      <div class="senseng-value-props">
        <div class="senseng-vp-item wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.04s;">
          <div class="senseng-vp-icon" style="background:#c9f4ff;color:#0c9de6;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9h18v12H3z"></path><path d="m3 9 2-5h14l2 5"></path><path d="M9 21v-6h6v6"></path></svg>
          </div>
          <div class="senseng-vp-text">
            <h3>Squishy toy trader</h3>
            <p>senseng is a trader focused on squishy toy products, including character-led concepts and paperboard-packaged sales versions for buyer review.</p>
          </div>
        </div>
        <div class="senseng-vp-item wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.12s;">
          <div class="senseng-vp-icon" style="background:#ffd7ec;color:#ef348d;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m21 16-9 5-9-5V8l9-5 9 5z"></path><path d="M3.3 7.6 12 12.5l8.7-4.9"></path><path d="M12 22V12"></path></svg>
          </div>
          <div class="senseng-vp-text">
            <h3>Clear assortment framing</h3>
            <p>The current showcase emphasizes age-led, gift-led, desk-led, and texture/effect-led packaging cues so buyers can compare the assortment more efficiently.</p>
          </div>
        </div>
        <div class="senseng-vp-item wr-card-hover" data-reveal="fade-up" style="transition-delay: 0.20s;">
          <div class="senseng-vp-icon" style="background:#c8f5e9;color:#11a886;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h6"></path></svg>
          </div>
          <div class="senseng-vp-text">
            <h3>Information transparency</h3>
            <p>Product materials and dimensions are listed as to be confirmed where final specifications are not yet supplied.</p>
          </div>
        </div>
      </div>
      ${renderProductGrid8('Our Squishy Toy Lines', true, true)}
    `;

    return `${headerHtml}<main>${aboutHero}</main>${footerHtml}`;
  }

  // -------------------------------------------------------------
  // PAGE 5: CONTACT (webimg/contact.jpg)
  // -------------------------------------------------------------
  if (page === 'contact') {
    const contactHero = `
      <div class="senseng-contact-hero" data-reveal="fade-up">
        <div class="senseng-contact-hero-inner">
          <div class="senseng-reference-scene" aria-hidden="true"><img src="/templates/senseng/contact-reference.jpg" alt=""></div>
          <div class="senseng-reference-copy">
            <p class="senseng-eyebrow" style="letter-spacing:0.36em;">GET IN TOUCH</p>
            <h1 style="font-size:52px;line-height:1.05;font-weight:900;letter-spacing:-1.5px;color:#073b91;margin-bottom:12px;">Contact senseng</h1>
            <p style="font-size:18px;line-height:1.45;color:#0a2b61;margin:0;">
              Character-led squishy toys with clearer shelf cues.<br>
              A senseng B2B showcase for kids, adults, gifting,<br>
              and texture/effect-led squishy toy lines.
            </p>
          </div>

        </div>
      </div>
      <div class="senseng-contact-2col">
        <!-- Left: Form -->
        <div style="background:#ffffff;border:1px solid #d8ecf8;border-radius:24px;padding:30px 32px;box-shadow:0 6px 20px rgba(7,59,145,0.04);" class="wr-card-hover" data-reveal="fade-up">
          <h2 style="font-size:28px;font-weight:900;color:#073b91;margin:0 0 6px;">Send a wholesale inquiry</h2>
          <p style="font-size:15.5px;color:#27405b;margin:0 0 20px;">Tell us about your interest and we'll be in touch.</p>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" class="senseng-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <input name="name" required placeholder="Your name *">
              <input name="company" required placeholder="Company name *">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <input name="email" type="email" required placeholder="Email *">
              <input name="market" placeholder="Target market">
            </div>
            <select name="productId">
              <option value="">Products of interest</option>
              ${allProducts.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}
            </select>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <input name="quantity" placeholder="Estimated quantity">
              <input name="packaging" placeholder="Packaging or labeling requirements">
            </div>
            <textarea name="message" placeholder="Additional information"></textarea>
            <button type="submit" class="senseng-btn-pill" style="padding:12px 32px;font-size:16px;align-self:flex-start;" ${options.preview ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
              <span>Send a wholesale inquiry</span>
            </button>
            <p class="form-status" role="status" aria-live="polite" style="margin:6px 0 0;font-size:13px;"></p>
          </form>
        </div>

        <!-- Right: Info cards -->
        <div style="background:#eef8ff;border-radius:24px;padding:32px;display:flex;flex-direction:column;gap:28px;" class="wr-card-hover" data-reveal="fade-up">
          <div style="display:flex;align-items:flex-start;gap:18px;">
            <div class="senseng-vp-icon" style="width:52px;height:52px;min-width:52px;background:#c9f4ff;color:#0c9de6;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
            </div>
            <div>
              <h4 style="font-size:20px;font-weight:900;color:#073b91;margin:0 0 4px;">Wholesale contact</h4>
              <p style="font-size:15.5px;line-height:1.45;color:#102033;margin:0;">${company.contactName ? `Contact person: ${esc(company.contactName)}. ` : ''}${company.email ? `Email: ${esc(company.email)}.` : ''}</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:18px;">
            <div class="senseng-vp-icon" style="width:52px;height:52px;min-width:52px;background:#ffd7ec;color:#ef348d;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path></svg>
            </div>
            <div>
              <h4 style="font-size:20px;font-weight:900;color:#073b91;margin:0 0 4px;">What to include</h4>
              <p style="font-size:15.5px;line-height:1.45;color:#102033;margin:0;">Please include the product names you are interested in, estimated quantity, target market, and any packaging or labeling requirements.</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:18px;">
            <div class="senseng-vp-icon" style="width:52px;height:52px;min-width:52px;background:#c8f5e9;color:#11a886;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h6"></path></svg>
            </div>
            <div>
              <h4 style="font-size:20px;font-weight:900;color:#073b91;margin:0 0 4px;">Follow-up scope</h4>
              <p style="font-size:15.5px;line-height:1.45;color:#102033;margin:0;">senseng can discuss the supplied product styles and confirm unknown details such as material, dimensions, and final packaging information during follow-up.</p>
            </div>
          </div>
        </div>
      </div>
      ${renderProductGrid8('Our Squishy Toy Lines', true)}
    `;

    return `${headerHtml}<main>${contactHero}</main>${footerHtml}`;
  }

  return `${headerHtml}<main>${renderProductGrid8('Our Squishy Toy Lines')}</main>${footerHtml}`;
}

export const renderSensengHome = (ctx: ThemeContext, isVideo = false): string =>
  renderSensengPage({ ...ctx, page: 'home' }, isVideo);
