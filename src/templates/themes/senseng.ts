import type { Product } from '../../shared/model';
import { esc, safeUrl, type ThemeContext } from './types';
import { parseAboutHighlights, getAboutStoryParagraphs, getAboutHeadline, getAboutImages } from './aboutHelper';
import { renderLegacySensengPage } from '../materials-legacy-senseng';

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
        <div data-wr-hero class="senseng-hero-video-full${customHeroVideo ? '' : ' senseng-hero-video-bundled'}">
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
        <div data-wr-hero class="senseng-hero">
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
            <button type="button" class="senseng-thumb-arrow senseng-thumb-prev" aria-label="Previous image">&lt;</button>
            ${(materialsMode?(draft.products.find(p=>p.id===currentProduct.id)?.gallery||[]).map(image=>({id:currentProduct.id,img:asset(image.assetId),name:image.caption||currentProduct.name})):allProducts.slice(0, 5)).map((p, idx) => `
              <button type="button" class="senseng-thumb-btn wr-detail-thumb ${p.id === currentProduct.id || idx === 0 ? 'active' : ''}" data-src="${esc(p.img)}" data-large="${esc(p.img)}" data-target="detailMainImg" aria-label="${esc(p.name)}">
                <img src="${esc(p.img)}" alt="${esc(p.name)}">
              </button>
            `).join('')}
            <button type="button" class="senseng-thumb-arrow senseng-thumb-next" aria-label="Next image">&gt;</button>
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
    if (materialsMode) {
      return renderLegacySensengPage(ctx, isVideoFullscreen, true);
    }

    const isZh = (ctx.lang as string) === 'zh';

    const renderCleanAbout = () => {
      const defaultHeadline = isZh
        ? '高标准品质工贸与货架就绪型触觉解压玩具供应链'
        : 'Character-Led Tactile Toys & High-Standard Global B2B Supply Chain';
      const headline = getAboutHeadline(company, defaultHeadline);

      const defaultStory = [
        isZh
          ? `${company.name} 专注于高品质触觉解压玩具与潮玩公仔的研发设计、精密工模制造及全球出口。我们以严苛的国际玩具安全标准为底线，深度融合现代货架包装美学与无毒环保材料科技，为全球品牌买手、跨境连锁及礼品分销商提供一站式柔性直供。`
          : `${company.name} specializes in high-grade character squishy toys, combining bespoke tactile ergonomics with export-ready packaging. We partner with global retail brands, cross-border importers, and gift distributors to deliver certified, market-ready tactile collections.`,
        isZh
          ? '我们拥有现代化高精度模具加工中心与十万级无尘洁净车间，全系产品通过欧盟 EN71、美标 ASTM F963 及 CPSIA 权威实验室全项检测，零气孔、高回弹、无毒无味，确保每一件出海产品都具备极致的触觉治愈感与清关合规保障。'
          : 'Backed by modern precision tooling centers and dust-free cleanroom packaging facilities, our entire catalog complies with European EN71, US ASTM F963, and CPSIA safety frameworks with verified test reports for seamless customs clearance.'
      ];
      const storyParas = getAboutStoryParagraphs(company, defaultStory);

      const defaultStats = [
        { value: '50,000 m²', num: 50000, suffix: ' m²', label: isZh ? '现代化洁净生产基地' : 'Production Facility', desc: isZh ? 'ISO & GMP 洁净车间制造规范' : 'ISO & Cleanroom standard facility' },
        { value: '1,500,000+', num: 1500000, suffix: '+', label: isZh ? '月均出海玩具产能' : 'Monthly Export Capacity', desc: isZh ? '多条高精度自动化注塑流水线' : 'High-throughput automated lines' },
        { value: '60+', num: 60, suffix: '+', label: isZh ? '出口合作国家与地区' : 'Global Export Destinations', desc: isZh ? '直通欧美亚主流商超与跨境零售' : 'Direct delivery to worldwide markets' },
        { value: '99.9%', num: 99.9, suffix: '%', label: isZh ? '出厂全检首检合格率' : 'Lab Certified Quality Rate', desc: isZh ? 'EN71 / ASTM / CPSIA 全项达标' : 'Full-batch chemical & physical QA' },
      ];
      const stats = parseAboutHighlights(company.aboutHighlights, defaultStats);

      const defaultCleanImg = path('assets/about-reference.jpg');
      const defaultCleanSecImg = path('assets/hero-bg.jpg');
      const { primary: aboutImg, secondary: secondaryImg } = getAboutImages(ctx, defaultCleanImg, defaultCleanSecImg);

      return `
        <div class="senseng-clean-about-wrap" style="max-width:1440px;margin:0 auto;padding:40px 24px 70px;">
          <!-- Editorial Hero Split -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:center;margin-bottom:60px;" data-reveal="fade-up">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;background:#eef8ff;border:1px solid #c9f4ff;padding:6px 16px;border-radius:9999px;margin-bottom:18px;">
                <span style="font-size:14px;">🏭</span>
                <span style="font-size:12px;font-weight:800;letter-spacing:0.18em;color:#073b91;text-transform:uppercase;">
                  ${isZh ? '认证出口工贸一体 // 国际品质货架供应链' : 'VERIFIED OEM/ODM MANUFACTURER // GLOBAL B2B SUPPLY CHAIN'}${company.establishedYear ? ` · EST. ${esc(company.establishedYear)}` : ''}
                </span>
              </div>
              <h1 style="font-size:clamp(2.2rem, 3.8vw, 3.2rem);font-weight:900;color:#073b91;line-height:1.15;letter-spacing:-0.02em;margin:0 0 20px;">
                ${esc(headline)}
              </h1>
              <div style="color:#1e3a63;font-size:1.05rem;line-height:1.75;display:flex;flex-direction:column;gap:14px;margin-bottom:24px;">
                ${storyParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
              </div>

              <!-- Factory Assurance Quote -->
              <div style="background:#f0f8ff;border-left:4px solid #0c9de6;border-radius:0 14px 14px 0;padding:16px 20px;margin-bottom:28px;">
                <div style="font-weight:800;color:#073b91;font-size:0.95rem;line-height:1.5;">
                  ${isZh
                    ? '“微米级工模开模公差，十万级无菌洁净组装，以透明合规的检测报告护航每一柜出海订单。”'
                    : '“Precision micro-molding, dust-free cleanroom assembly, and independent lab certification ensuring seamless global customs clearance.”'}
                </div>
                <div style="color:#5f748d;font-size:0.82rem;margin-top:6px;font-weight:700;">
                  ${esc(company.name || 'SENSENG')} · ${isZh ? '全球出口贸易与代工事业部' : 'GLOBAL TRADE & OEM DIVISION'}
                </div>
              </div>

              <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
                <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-btn-pill" style="padding:14px 32px;font-size:16px;box-shadow:0 8px 20px rgba(7,59,145,0.18);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
                  <span>${isZh ? '发起外贸批发询盘 ↗' : 'Send a Wholesale Inquiry ↗'}</span>
                </a>
                <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="text-decoration:none;color:#073b91;font-weight:800;font-size:15px;padding:12px 20px;border:1px solid #cbd5e1;border-radius:9999px;background:#ffffff;">
                  ${isZh ? '浏览全系商品图册 →' : 'Browse Product Catalog →'}
                </a>
                ${company.capabilities ? `
                  <div style="display:inline-flex;align-items:center;gap:6px;background:#eef8ff;border:1px solid #c9f4ff;padding:8px 16px;border-radius:9999px;font-size:0.85rem;font-weight:700;color:#073b91;">
                    <span>✨ ${esc(company.capabilities.slice(0, 45))}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Primary Showcase Media Box -->
            <div data-reveal="fade-up" class="wr-card-hover" style="position:relative;">
              <div style="border-radius:24px;overflow:hidden;border:1px solid #dcebfa;box-shadow:0 20px 48px rgba(7,59,145,0.12);background:#ffffff;">
                <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block;" loading="lazy">
              </div>
              <div style="position:absolute;bottom:20px;left:20px;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border:1px solid #c9f4ff;border-radius:9999px;padding:8px 18px;box-shadow:0 8px 24px rgba(7,59,145,0.12);font-weight:800;font-size:0.84rem;color:#073b91;display:flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0c9de6;"></span>
                <span>${isZh ? '🌱 100% 食品级环保软胶 · 零邻苯无毒认证' : '🌱 100% Non-Toxic & Food-Grade Certified'}</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Highlights & Metrics Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-bottom:60px;" data-reveal="fade-up">
            ${stats.map((s, idx) => {
              const colors = [
                { bg: '#c9f4ff', text: '#0c9de6', icon: '🏭' },
                { bg: '#ffd7ec', text: '#ef348d', icon: '📦' },
                { bg: '#c8f5e9', text: '#11a886', icon: '🌍' },
                { bg: '#fff0c9', text: '#d4a017', icon: '✅' },
              ];
              const c = colors[idx % colors.length]!;
              return `
                <div style="text-align:center;padding:32px 20px;background:#eef8ff;border-radius:20px;border:1px solid #e0f2fe;" class="wr-card-hover" data-reveal="fade-up">
                  <div style="width:56px;height:56px;border-radius:50%;background:${c.bg};color:${c.text};display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:24px;">${c.icon}</div>
                  <h3 style="font-size:16px;font-weight:900;color:#073b91;margin:0 0 6px;">${esc(s.label)}</h3>
                  <div style="font-size:2.2rem;font-weight:900;color:${c.text};margin-bottom:6px;line-height:1.1;" data-counter="${s.num}" data-suffix="${esc(s.suffix || '')}" data-prefix="${esc(s.prefix || '')}">${esc(s.value)}</div>
                  ${s.desc ? `<p style="font-size:13px;color:#475569;line-height:1.5;margin:0;">${esc(s.desc)}</p>` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Four Pillars of Clean Trade Excellence -->
          <div style="margin-bottom:60px;" data-reveal="fade-up">
            <div style="text-align:center;max-width:700px;margin:0 auto 36px;">
              <span style="font-size:12px;font-weight:800;letter-spacing:0.2em;color:#0c9de6;text-transform:uppercase;">WHY GLOBAL BUYERS CHOOSE US</span>
              <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:900;color:#073b91;margin:8px 0 12px;">
                ${isZh ? '外贸出口核心竞争优势' : 'Four Pillars of Clean Trade Excellence'}
              </h2>
              <p style="color:#5f748d;font-size:1rem;margin:0;">
                ${isZh ? '从模具精密雕刻到独立实验室检测，全程透明化品控与快速柔性供应链支持。' : 'From micro-precision tooling to transparent batch testing, ensuring frictionless global retail distribution.'}
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;box-shadow:0 4px 16px rgba(7,59,145,0.04);">
                <div style="width:48px;height:48px;border-radius:12px;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;">📐</div>
                <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;color:#0c9de6;text-transform:uppercase;margin-bottom:6px;">01 // PROTOTYPING</div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#073b91;margin:0 0 10px;">${isZh ? '快速 3D 打样与专属开模' : 'Rapid Tooling & OEM/ODM'}</h3>
                <p style="font-size:0.9rem;color:#5f748d;line-height:1.65;margin:0;">
                  ${isZh ? '拥有五轴数控精密雕刻机，支持手板快速 3D 打印与专属开模，Pantone 色彩精确调配，打样周期短至 7 天。' : 'High-precision CNC tooling and 3D additive prototyping with tailored Pantone color matching in 7 business days.'}
                </p>
              </div>

              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;box-shadow:0 4px 16px rgba(7,59,145,0.04);">
                <div style="width:48px;height:48px;border-radius:12px;background:#fce7f3;color:#db2777;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;">🏭</div>
                <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;color:#ef348d;text-transform:uppercase;margin-bottom:6px;">02 // CLEANROOM</div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#073b91;margin:0 0 10px;">${isZh ? '十万级无尘洁净包装' : 'Dust-Free Automated Assembly'}</h3>
                <p style="font-size:0.9rem;color:#5f748d;line-height:1.65;margin:0;">
                  ${isZh ? '十万级空气净化组装车间，自动化封口与充气检验，杜绝静电吸尘与二次表面污损，开箱即达专柜上架陈列标准。' : 'Class-100,000 cleanroom packaging lines eliminating static dust attraction and secondary surface contamination.'}
                </p>
              </div>

              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;box-shadow:0 4px 16px rgba(7,59,145,0.04);">
                <div style="width:48px;height:48px;border-radius:12px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;">🛡️</div>
                <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;color:#11a886;text-transform:uppercase;margin-bottom:6px;">03 // LAB COMPLIANCE</div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#073b91;margin:0 0 10px;">${isZh ? '欧美双标安全权威认证' : 'Independent Safety Testing'}</h3>
                <p style="font-size:0.9rem;color:#5f748d;line-height:1.65;margin:0;">
                  ${isZh ? '每批次严格进行跌落抗冲击、物理拉伸强度及重金属元素迁移检测，全项符合欧盟 EN71 与美标 ASTM F963。' : 'Comprehensive physical tensile testing, heavy metal migration audits, and non-toxic chemical testing for global compliance.'}
                </p>
              </div>

              <div class="wr-card-hover" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;box-shadow:0 4px 16px rgba(7,59,145,0.04);">
                <div style="width:48px;height:48px;border-radius:12px;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;">🚢</div>
                <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;color:#d4a017;text-transform:uppercase;margin-bottom:6px;">04 // FULFILLMENT</div>
                <h3 style="font-size:1.15rem;font-weight:900;color:#073b91;margin:0 0 10px;">${isZh ? '无忧跨境进出口履约' : 'Frictionless Global Logistics'}</h3>
                <p style="font-size:0.9rem;color:#5f748d;line-height:1.65;margin:0;">
                  ${isZh ? '提供正规原产地证、英文 MSDS、海关 HS Code 编码归类，支持海运拼箱、整柜直发及 FOB/CIF 国际贸易条款。' : 'Complete export documentation, verified HS codes, and direct container booking for frictionless sea/air shipping.'}
                </p>
              </div>
            </div>
          </div>

          <!-- Secondary Facility & Standards Spotlight -->
          ${secondaryImg ? `
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:28px;padding:44px 36px;box-shadow:0 10px 30px rgba(7,59,145,0.05);margin-bottom:60px;" data-reveal="fade-up">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:44px;align-items:center;">
                <div style="overflow:hidden;border-radius:20px;box-shadow:0 8px 24px rgba(7,59,145,0.08);" class="wr-card-hover">
                  <img src="${esc(secondaryImg)}" alt="${esc(company.name)} workshop" style="width:100%;height:320px;object-fit:cover;display:block;" loading="lazy">
                </div>
                <div>
                  <span style="font-size:12px;font-weight:800;letter-spacing:0.2em;color:#0c9de6;text-transform:uppercase;">MANUFACTURING PEDIGREE</span>
                  <h2 style="font-size:clamp(1.8rem, 3vw, 2.3rem);font-weight:900;color:#073b91;margin:8px 0 16px;">
                    ${isZh ? '规模化洁净车间与全流程质量溯源体系' : 'Scalable Cleanroom Infrastructure & Full Batch Traceability'}
                  </h2>
                  <p style="color:#5f748d;font-size:0.98rem;line-height:1.75;margin:0 0 24px;">
                    ${esc(company.capabilities || (isZh
                      ? '工厂车间全面配置自动化无菌注塑机群与微发泡压力调控系统。针对每批次出厂产品均进行 36 道品质关卡检验，杜绝出油、异味与气孔不良，满足全球主流大型连锁买手的高严苛验收准则。'
                      : 'Our advanced facility features automated cleanroom injection molding systems with micro-foam pressure control. Each batch passes 36 precision inspection checkpoints to eliminate oil bleeding and surface defects.'))}
                  </p>
                  <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <span style="background:#eef8ff;border:1px solid #c9f4ff;padding:8px 16px;border-radius:8px;font-size:0.84rem;font-weight:800;color:#073b91;">✓ EN71 Part 1-3</span>
                    <span style="background:#eef8ff;border:1px solid #c9f4ff;padding:8px 16px;border-radius:8px;font-size:0.84rem;font-weight:800;color:#073b91;">✓ ASTM F963-17</span>
                    <span style="background:#eef8ff;border:1px solid #c9f4ff;padding:8px 16px;border-radius:8px;font-size:0.84rem;font-weight:800;color:#073b91;">✓ CPSIA / CPSC</span>
                    <span style="background:#eef8ff;border:1px solid #c9f4ff;padding:8px 16px;border-radius:8px;font-size:0.84rem;font-weight:800;color:#073b91;">✓ REACH & RoHS</span>
                    <span style="background:#eef8ff;border:1px solid #c9f4ff;padding:8px 16px;border-radius:8px;font-size:0.84rem;font-weight:800;color:#073b91;">✓ ISO 9001:2015</span>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Clean Trade Wholesale CTA Banner -->
          <div data-reveal="fade-up" style="background:linear-gradient(135deg, #073b91 0%, #0a4dbf 100%);color:#ffffff;border-radius:24px;padding:50px 32px;text-align:center;margin-bottom:60px;box-shadow:0 16px 40px rgba(7,59,145,0.2);">
            <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.5rem);font-weight:900;margin:0 0 12px;color:#ffffff;">
              ${isZh ? '开启外贸直采合作 · 索取样品测试盒' : 'Partner with Our Global B2B Supply Chain'}
            </h2>
            <p style="color:#dbeafe;font-size:1.05rem;max-width:620px;margin:0 auto 28px;line-height:1.65;">
              ${isZh ? '我们为全球批发商、跨境独立站与大型商超买手提供灵活 MOQ 起订、定制纸盒包装与专属样品快寄。' : 'Direct factory support, customized packaging, and expedited worldwide sample dispatch. Contact our export team today.'}
            </p>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#ffffff;color:#073b91;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:1rem;display:inline-block;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,0.15);">
              ${isZh ? '立即咨询外贸报价 ↗' : 'Inquire & Request Samples ↗'}
            </a>
          </div>

          <!-- Featured Collections Grid -->
          ${renderProductGrid8(isZh ? '全系出海货架精选推荐' : 'Featured Export Product Collections', true, true)}
        </div>
      `;
    };

    const renderVideoAbout = () => {
      const defaultHeadline = isZh
        ? '沉浸式动态感官玩具 · 艺术设计与高精智造'
        : 'Where Tactile Artistry Meets High-Volume Global Engineering';
      const headline = getAboutHeadline(company, defaultHeadline);

      const defaultStory = [
        isZh
          ? `${company.name} 以声画光影与动态慢回弹解压科技为核心，探索视觉震撼与触觉疗愈的深层结合。我们打破传统玩具的边界，将微米级精密注塑工艺与全闭环环保聚合物融合，为全球新一代潮流空间与品牌买手提供充满张力的感官体验。`
          : `${company.name} explores the synergy between cinematic visual motion and tactile mindfulness. We engineer precision slow-rise polymers that bridge modern desk aesthetics with therapeutic sensory relief, trusted by leading lifestyle brands and international retailers worldwide.`,
        isZh
          ? '在我们的数字动态工坊中，每一款触觉器物均经过高速摄像跌落回弹分析与严苛毒理检测。全流程 100% 洁净室机器人自动化作业，赋予每一只公仔宛如天鹅绒般的细腻触感与恒久耐用性。'
          : 'In our automated production atelier, every tactile companion undergoes high-speed video rebound telemetry and rigorous chemical neutral testing, ensuring an immaculate sensory experience backed by global safety certifications.'
      ];
      const storyParas = getAboutStoryParagraphs(company, defaultStory);

      const defaultStats = [
        { value: '100%', num: 100, suffix: '%', label: isZh ? '高速摄像全检质保' : 'Video-Verified QA', desc: isZh ? '全自动视觉微瑕疵扫描' : 'Optical automated inspection' },
        { value: '24/7', num: 24, suffix: '/7', label: isZh ? '自动化洁净车间生产' : 'Automated Production', desc: isZh ? '高产能自动化微发泡流水线' : 'Robotic cleanroom molding' },
        { value: '120+', num: 120, suffix: '+', label: isZh ? '全球分销物流枢纽' : 'Worldwide Destinations', desc: isZh ? '直通欧美亚主流潮流买手店' : 'Global lifestyle retail partners' },
        { value: '0.05 mm', num: 0.05, suffix: ' mm', label: isZh ? '极窄隐形分模线公差' : 'Tooling Precision', desc: isZh ? '温润无棱微触觉接缝' : 'Seamless tactile parting line' },
      ];
      const stats = parseAboutHighlights(company.aboutHighlights, defaultStats);

      const customHeroVideo = asset(draft.heroAssetId);
      const heroVideo = customHeroVideo || (materialsMode ? '' : '/templates/senseng/hero-video.mp4');
      const poster = asset(draft.posterAssetId) || '/templates/senseng/video-poster.jpg';

      const defaultVideoImg = path('assets/about-reference.jpg');
      const defaultVideoSecImg = path('assets/hero-bg.jpg');
      const { primary: aboutImg, secondary: secondaryImg } = getAboutImages(ctx, defaultVideoImg, defaultVideoSecImg);

      return `
        <!-- Fullscreen Cinematic Video Hero -->
        <div data-wr-hero class="senseng-hero-video-full" style="min-height:75vh;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#061020;">
          <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="${esc(poster)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.65;">
            ${heroVideo ? `<source src="${esc(heroVideo)}" type="video/mp4">` : ''}
          </video>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(6,16,32,0.6) 0%, rgba(6,16,32,0.92) 100%);z-index:1;"></div>

          <div class="senseng-hero-video-content" data-reveal="fade-up" style="position:relative;z-index:2;max-width:960px;padding:60px 24px;text-align:center;margin:0 auto;">
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(2,132,199,0.25);border:1px solid rgba(56,189,248,0.4);backdrop-filter:blur(8px);padding:6px 18px;border-radius:9999px;margin-bottom:20px;">
              <span style="font-size:14px;">🎬</span>
              <span style="color:#7dd3fc;font-weight:800;font-size:0.82rem;letter-spacing:0.18em;text-transform:uppercase;">
                ${isZh ? '沉浸式动态感官工坊 // 声画动效' : 'CINEMATIC SENSORY SHOWCASE // ATELIER IN MOTION'}${company.establishedYear ? ` · EST. ${esc(company.establishedYear)}` : ''}
              </span>
            </div>

            <h1 class="senseng-hero-h1" style="color:#ffffff;font-size:clamp(2.4rem, 4.4vw, 3.8rem);font-weight:900;letter-spacing:-0.03em;line-height:1.12;margin:0 0 24px;">
              ${esc(headline)}
            </h1>

            <div style="background:rgba(15,23,42,0.65);backdrop-filter:blur(12px);border:1px solid rgba(56,189,248,0.25);border-radius:18px;padding:24px 28px;max-width:840px;margin:0 auto 32px;box-shadow:0 12px 36px rgba(0,0,0,0.4);">
              <div style="color:#e0f2fe;font-size:1.1rem;line-height:1.75;display:flex;flex-direction:column;gap:12px;text-align:left;">
                ${storyParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
              </div>
            </div>

            <div style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;">
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="senseng-btn-pill" style="background:linear-gradient(135deg,#0284c7,#06b6d4);color:#ffffff;padding:14px 36px;font-size:16px;font-weight:800;border-radius:9999px;box-shadow:0 0 28px rgba(6,182,212,0.45);text-decoration:none;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.8 6.2 8.2 6.4 8.2-6.4"></path></svg>
                <span>${isZh ? '预约工坊视频连线与采购洽谈 ↗' : 'Inquire for Production Line Access ↗'}</span>
              </a>
              <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;padding:13px 28px;font-size:15px;font-weight:700;border-radius:9999px;text-decoration:none;">
                ${isZh ? '浏览全系商品图册 →' : 'Explore Collections →'}
              </a>
            </div>
          </div>

          ${heroVideo ? '<button id="video-toggle" type="button" class="senseng-video-toggle" aria-label="Pause background video" style="position:absolute;right:24px;bottom:24px;z-index:4;width:44px;height:44px;border:1px solid rgba(255,255,255,0.5);border-radius:50%;color:white;background:rgba(7,59,145,0.65);cursor:pointer;">Ⅱ</button>' : ''}
        </div>

        <!-- Immersive Dark Theme Main Body -->
        <div style="background:#071426;color:#e2e8f0;padding:60px 24px 80px;">
          <div style="max-width:1440px;margin:0 auto;">

            <!-- Luminous Dynamic Counters Strip -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-bottom:70px;" data-reveal="fade-up">
              ${stats.map((s) => `
                <div class="wr-card-hover" style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.22);border-radius:20px;padding:32px 24px;text-align:center;box-shadow:0 12px 32px rgba(0,0,0,0.35);">
                  <div style="font-size:2.4rem;font-weight:900;background:linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1;margin-bottom:8px;">
                    <span data-counter="${s.num}" data-suffix="${esc(s.suffix || '')}" data-prefix="${esc(s.prefix || '')}">
                      ${esc(s.prefix || '')}${esc(s.value)}${esc(s.suffix || '')}
                    </span>
                  </div>
                  <div style="font-size:15px;font-weight:800;color:#f8fafc;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:6px;">
                    ${esc(s.label)}
                  </div>
                  ${s.desc ? `<div style="font-size:13px;color:#94a3b8;line-height:1.5;">${esc(s.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>

            <!-- Behind The Lens: Cyber Dual Split -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px;align-items:center;margin-bottom:70px;" data-reveal="fade-up">
              <div class="wr-card-hover" style="position:relative;border-radius:24px;overflow:hidden;border:1px solid rgba(56,189,248,0.3);box-shadow:0 0 36px rgba(56,189,248,0.15);">
                <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="width:100%;height:380px;object-fit:cover;display:block;" loading="lazy">
                <div style="position:absolute;top:20px;left:20px;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);border:1px solid rgba(56,189,248,0.4);border-radius:8px;padding:6px 14px;font-size:11px;font-weight:800;color:#38bdf8;letter-spacing:0.12em;text-transform:uppercase;">
                  ● 4K ATELIER CAPTURE
                </div>
              </div>

              <div>
                <span style="font-size:12px;font-weight:800;letter-spacing:0.2em;color:#38bdf8;text-transform:uppercase;">KINETIC R&D & MATERIAL SCIENCE</span>
                <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);font-weight:900;color:#ffffff;margin:8px 0 16px;line-height:1.2;">
                  ${isZh ? '慢回弹阻尼物理学与微触感解压科技' : 'The Physics of Slow-Rise Damping & Therapeutic Touch'}
                </h2>
                <p style="color:#94a3b8;font-size:1.05rem;line-height:1.75;margin:0 0 20px;">
                  ${isZh
                    ? '我们自主研发的高分子环保聚合物发泡配方，将阻尼回弹时间精准控制在 4-6 秒区间。每一次受力回弹均平稳均匀，无爆破感、无刺鼻气味，在日常忙碌工作与学习中提供持久的抚慰与专注力支撑。'
                    : 'Our proprietary eco-polymer formulation calibrates rebound damping strictly between 4 to 6 seconds. Each compression provides smooth, uniform kinetic return without surface fatigue, offering lasting stress relief in modern fast-paced living.'}
                </p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:14px;">
                    <div style="color:#38bdf8;font-weight:800;font-size:13px;margin-bottom:4px;">⚡ DYNAMIC MEMORY</div>
                    <div style="color:#cbd5e1;font-size:12px;line-height:1.5;">${isZh ? '4-6秒恒温舒缓慢回弹' : '4-6s Calibrated Slow-Rise'}</div>
                  </div>
                  <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:14px;">
                    <div style="color:#38bdf8;font-weight:800;font-size:13px;margin-bottom:4px;">🛡️ ZERO VOC FORMULA</div>
                    <div style="color:#cbd5e1;font-size:12px;line-height:1.5;">${isZh ? '零气味食品级环保聚合物' : 'Zero VOC Food-Safe Polymers'}</div>
                  </div>
                  <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:14px;">
                    <div style="color:#38bdf8;font-weight:800;font-size:13px;margin-bottom:4px;">💧 DUST-RESISTANT SKIN</div>
                    <div style="color:#cbd5e1;font-size:12px;line-height:1.5;">${isZh ? '抗静电易清洁哑光表层' : 'Velvet Hydrophobic Coating'}</div>
                  </div>
                  <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:14px;">
                    <div style="color:#38bdf8;font-weight:800;font-size:13px;margin-bottom:4px;">🔬 LAB CERTIFIED</div>
                    <div style="color:#cbd5e1;font-size:12px;line-height:1.5;">${isZh ? '通过 EN71 与 ASTM 全项认证' : 'EN71 & ASTM Safety Verified'}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Secondary Robotic Workshop Feature -->
            ${secondaryImg ? `
              <div style="background:rgba(15,23,42,0.7);border:1px solid rgba(56,189,248,0.2);border-radius:24px;padding:40px;margin-bottom:70px;box-shadow:0 16px 40px rgba(0,0,0,0.4);" data-reveal="fade-up">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;align-items:center;">
                  <div style="overflow:hidden;border-radius:18px;border:1px solid rgba(56,189,248,0.25);" class="wr-card-hover">
                    <img src="${esc(secondaryImg)}" alt="${esc(company.name)} manufacturing environment" style="width:100%;height:300px;object-fit:cover;display:block;" loading="lazy">
                  </div>
                  <div>
                    <span style="font-size:11px;font-weight:800;letter-spacing:0.2em;color:#38bdf8;text-transform:uppercase;">PRECISION LOGISTICS & PRODUCTION</span>
                    <h3 style="font-size:clamp(1.6rem, 2.6vw, 2rem);font-weight:900;color:#ffffff;margin:8px 0 14px;">
                      ${isZh ? '全天候自动化洁净室生产机群' : 'Automated Cleanroom Molding & Continuous QA'}
                    </h3>
                    <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:0 0 20px;">
                      ${esc(company.capabilities || (isZh ? '生产基地配备全封闭无菌洁净间，从聚合物真空脱泡到红外恒温烘道成型，全面杜绝外部微尘吸附与批次色差，提供稳固高质的全球大宗直供。' : 'Equipped with cleanroom injection molding and automated curing systems, our manufacturing hub guarantees flawless surface consistency and seamless container export fulfillment.'))}
                    </p>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                      <span style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:700;color:#38bdf8;">✓ EN71 Part 1-3</span>
                      <span style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:700;color:#38bdf8;">✓ ASTM F963</span>
                      <span style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:700;color:#38bdf8;">✓ CPSIA / CPSC</span>
                      <span style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);padding:6px 14px;border-radius:6px;font-size:0.8rem;font-weight:700;color:#38bdf8;">✓ RoHS / REACH</span>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- VIP Partnership Call-to-Action -->
            <div data-reveal="fade-up" style="background:linear-gradient(135deg, rgba(2,132,199,0.2) 0%, rgba(15,23,42,0.9) 100%);border:1px solid rgba(56,189,248,0.4);border-radius:24px;padding:50px 32px;text-align:center;box-shadow:0 0 40px rgba(6,182,212,0.15);margin-bottom:70px;">
              <h2 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);font-weight:900;margin:0 0 12px;color:#ffffff;">
                ${isZh ? '全球买手与零售机构专属合作通道' : 'Initiate Bespoke Procurement & Wholesale Terms'}
              </h2>
              <p style="color:#94a3b8;font-size:1.05rem;max-width:620px;margin:0 auto 28px;line-height:1.65;">
                ${isZh ? '我们为全球高品质生活方式买手店、连锁礼品机构与独立品牌提供快速打样与专属柔性直供。' : 'Connect with our production engineers for custom packaging, expedited lab sampling, and worldwide container logistics.'}
              </p>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:linear-gradient(135deg,#0284c7,#06b6d4);color:#ffffff;font-weight:900;padding:16px 36px;border-radius:9999px;font-size:1rem;display:inline-block;text-decoration:none;box-shadow:0 0 24px rgba(6,182,212,0.4);">
                ${isZh ? '开启合作洽谈 ↗' : 'Inquire & Request Terms ↗'}
              </a>
            </div>

            <!-- Product Showcase in Dark Theme Context -->
            ${renderProductGrid8(isZh ? '高光感官触觉系列' : 'Kinetic & Tactile Product Lines', true, true)}
          </div>
        </div>
      `;
    };

    const aboutContent = isVideoFullscreen ? renderVideoAbout() : renderCleanAbout();
    return `${headerHtml}<main data-wr-page="about">${aboutContent}</main>${footerHtml}`;
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
