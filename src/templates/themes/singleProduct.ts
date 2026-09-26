import type { Draft, Product } from '../../shared/model';
import { esc, productPath, type ThemeContext } from './types';

export const singleProductTemplates = [
  'single-device-showcase',
  'single-artisan-craft',
  'single-wellness-nordic',
] as const;

export const isSingleProductTemplate = (id: string) =>
  (singleProductTemplates as readonly string[]).includes(id);

export function singleProductDraft(draft: Draft): Draft {
  if (!isSingleProductTemplate(draft.template) || draft.products.length < 2) return draft;
  const product = draft.products.find((p) => p.id === draft.primaryProductId) ?? draft.products[0];
  return { ...draft, primaryProductId: product.id, products: [product] };
}

const mediaRoot = '/templates/single-product/';

const designs = {
  'single-device-showcase': {
    theme: 'hardware',
    brand: 'KEYNOTE // LABS',
    name: 'Precision Hardware Terminal',
    eyebrow: 'FLAGSHIP SINGLE-PRODUCT KEYNOTE',
    description:
      'Engineered from aerospace-grade alloy with dedicated neural DSP architecture, ultra-low latency telemetry, and all-weather precision sealing.',
    story: 'Engineered from the atomic micron inside out.',
    note: 'System Architecture',
    cta: 'Configure & Order',
    image: 'hardware.jpg',
    section: 'Hardware Engineering Architecture',
  },
  'single-artisan-craft': {
    theme: 'artisan',
    brand: 'ATELIER ROYAL',
    name: 'Calibre Royal Chronograph',
    eyebrow: 'THE ATELIER PROTOCOL',
    description:
      'A singular mechanical masterwork forged in alpine solitude. Individually hand-bevelled, flame-blued, and regulated across 220 consecutive master bench hours.',
    story: 'The 5 Stages of Timeless Execution.',
    note: 'Certificate of Material Provenance',
    cta: 'Examine The Piece',
    image: 'artisan.jpg',
    section: 'The Masterpiece Commission',
  },
  'single-wellness-nordic': {
    theme: 'nordic',
    brand: 'NORDIC DAYLIGHT STUDIO',
    name: 'Circadian Light Sanctuary',
    eyebrow: 'BIOPHILIC LIVING ARCHITECTURE',
    description:
      'Natural sensory shifts calibrated to your natural biorhythms. Scientifically tested in clinical trials to promote daytime focus and nocturnal rest.',
    story: 'The 24h Circadian Rhythm.',
    note: 'Daily Wellness Protocol',
    cta: 'Begin Your Daily Ritual',
    image: 'nordic.jpg',
    section: 'At Home in Your Daylight',
  },
} as const;

/** One primary product owns every image, fact and inquiry. */
export function renderSingleProductPage(ctx: ThemeContext, template: string): string {
  const design = designs[template as keyof typeof designs] || designs['single-device-showcase'];
  const { draft, page, ui, lang, path, navAttrs, navLink, asset } = ctx;
  const product = ctx.mainProduct;
  const demo = !product;
  const translated = product ? ctx.translateProduct(product) : undefined;
  const name = translated?.name || design.name;
  const description = translated?.description || (demo ? design.description : '');
  const imageUrl = product ? asset(product.imageAssetId) : mediaRoot + design.image;
  const gallery =
    product?.gallery
      ?.map((item) => ({ url: asset(item.assetId), caption: item.caption || name }))
      .filter((item) => item.url && item.url !== imageUrl) ?? [];
  const copy = draft.copy[lang];
  const brand = draft.company.name || design.brand;
  const productHref = product ? path(productPath(product.id)) : path('catalog/index.html');
  const productAttrs = product ? navAttrs('detail', product.id) : navAttrs('catalog');

  const link = (text: string, secondary = false) =>
    `<a class="sp-button${secondary ? ' sp-secondary' : ''}" href="${esc(productHref)}" ${productAttrs}>${esc(text)} <span aria-hidden="true">↗</span></a>`;
  const contact = `<a class="sp-button" href="${path('contact/index.html')}" ${navAttrs('contact')}>${esc(ui.inquire)} <span aria-hidden="true">↗</span></a>`;
  const photo = (url: string, alt: string, cls = '', eager = false) =>
    url
      ? `<img class="${cls}" ${cls === 'wr-detail-main-img' ? 'id="wr-detail-main-img"' : ''} src="${esc(url)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">`
      : `<div class="sp-no-photo">${esc(ui.product)}</div>`;

  const header = `<a class="skip" href="#main">${esc(ui.skip)}</a><header class="sp-header"><a class="sp-brand" href="${path('index.html')}" ${navAttrs('home')}>${draft.company.logoAssetId ? ctx.brandLogo : esc(brand)}</a><nav aria-label="${esc(ui.menu)}">${navLink('home', ui.home)}${navLink('catalog', ui.product)}${navLink('about', ui.about)}${navLink('contact', ui.contact)}</nav><div class="sp-languages">${ctx.languageLinks}</div></header>`;

  const headline = page === 'home' ? copy?.headline || name : name;
  const title = `<span class="sp-kicker">${esc(demo ? design.eyebrow : brand)}</span><h1>${esc(headline)}</h1>${description ? `<p class="sp-lead">${esc(description)}</p>` : ''}`;

  let content = '';

  if (page === 'home') {
    let hero = '';

    if (design.theme === 'hardware') {
      // 1. VIDEO BACKGROUND BANNER (Hardware Keynote Stage)
      hero = `
        <section class="sp-hero sp-video-hero" data-wr-hero data-sp-hero="video">
          <div class="sp-video-scene">
            <img class="sp-poster" src="${mediaRoot}hardware.jpg" alt="" fetchpriority="high">
            <video data-sp-video data-src="${mediaRoot}hardware.mp4" poster="${mediaRoot}hardware.jpg" muted loop playsinline preload="none" aria-label="Circuit board background"></video>
          </div>
          <div class="sp-video-overlay"></div>
          <div class="sp-video-copy">
            ${title}
            <div class="sp-actions">
              ${link(demo ? design.cta : ui.details)}
              <a class="sp-text-link" href="#product">${esc(ui.product)} ↓</a>
            </div>
          </div>
          ${product && imageUrl && imageUrl !== mediaRoot + design.image ? `<figure class="sp-hero-product">${photo(imageUrl, name, '', true)}<figcaption>${esc(name)}</figcaption></figure>` : ''}
          <div class="sp-hero-bottom">
            <span>${esc(demo ? 'DESIGN FROM THE INSIDE OUT' : name)}</span>
            <button type="button" data-sp-video-toggle hidden aria-label="Play background video">Play video</button>
          </div>
        </section>
      `;
    } else if (design.theme === 'artisan') {
      // 2. PURE IMAGE BANNER (Swiss Horological Atelier)
      // Must contain ONLY image inside data-sp-hero="image" (no h1, p, a, button)
      hero = `
        <section class="sp-hero sp-pure-image" data-wr-hero data-sp-hero="image">
          ${photo(imageUrl, name, '', true)}
        </section>
        <section class="sp-artisan-intro" data-sp-hero-copy>
          <span class="sp-kicker">${esc(demo ? design.eyebrow : brand)}</span>
          <div>
            <h1>${esc(headline)}</h1>
            ${description ? `<p class="sp-lead">${esc(description)}</p>` : ''}
            <div class="sp-actions">
              ${link(demo ? design.cta : ui.details)}
              <a class="sp-text-link" href="#product">${esc(ui.details)} ↓</a>
            </div>
          </div>
          <span class="sp-edition" aria-hidden="true">01</span>
        </section>
      `;
    } else {
      // 3. IMAGE + TEXT SPLIT BANNER (Nordic Daylight Sanctuary)
      const circadianDial = `
        <div class="sp-circadian-bar">
          <div class="sp-circadian-scale">
            <span>Dawn 2700K</span>
            <span style="color:var(--sp-accent);">● Noon Peak 5500K</span>
            <span>Dusk 2200K</span>
          </div>
          <div class="sp-circadian-track">
            <div class="sp-circadian-thumb"></div>
          </div>
        </div>
      `;
      hero = `
        <section class="sp-hero sp-nordic-hero" data-wr-hero data-sp-hero="image-text">
          <div class="sp-nordic-copy">
            ${title}
            ${circadianDial}
            <div class="sp-actions">
              ${link(demo ? design.cta : ui.details)}
              <a class="sp-text-link" href="#product">${esc(ui.product)} ↓</a>
            </div>
            <div class="sp-small-note">${esc(demo ? 'A considered object for your everyday space.' : product?.tagline || '')}</div>
          </div>
          <figure>
            ${photo(imageUrl, name, '', true)}
            <figcaption>${esc(demo ? 'THE EVERYDAY, IN A NEW LIGHT' : name)}</figcaption>
          </figure>
        </section>
      `;
    }

    // ── Distinctive Modular Architecture Sections below Hero ──
    let customSections = '';
    if (design.theme === 'hardware') {
      customSections = `
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">02 / ARCHITECTURE</span>
            <h2>Precision Bento Engineering</h2>
          </div>
          <div class="sp-hardware-bento">
            <div class="sp-bento-card">
              <span class="sp-kicker">COMPUTATIONAL TELEMETRY</span>
              <h3>Neural Signal DSP Co-Processor</h3>
              <p>Continuous micro-sensory acoustic calibration sampling room acoustics and ambient pressure every 2 milliseconds with zero audible delay.</p>
              <div style="height:48px;background:var(--sp-surface-subtle);border-radius:8px;display:flex;align-items:center;gap:4px;padding:0 12px;margin-top:20px;">
                ${Array.from({ length: 24 }, (_, i) => `<div style="flex:1;background:var(--sp-accent);height:${Math.sin(i * 0.4) * 30 + 40}%;border-radius:2px;opacity:0.85;"></div>`).join('')}
              </div>
            </div>
            <div class="sp-bento-card">
              <span class="sp-kicker">CHASSIS ALLOY</span>
              <h3>Aerospace Titanium Unibody</h3>
              <p>Solid CNC-machined enclosure engineered for zero harmonic distortion, high impact resistance, and passive thermal dissipation.</p>
            </div>
          </div>
          <div class="sp-bento-grid3">
            <div class="sp-bento-card">
              <h4>⚡ MagLock Qi2 Docking</h4>
              <p>Instant zero-cable magnetic alignment with rapid induction charging.</p>
            </div>
            <div class="sp-bento-card">
              <h4>🛡️ Sealed Enclosure</h4>
              <p>All-weather precision acoustic seal protecting internal micro-transducers.</p>
            </div>
            <div class="sp-bento-card">
              <h4>🔒 Hardware Privacy</h4>
              <p>Zero external cloud telemetry. All DSP processing executes on-device.</p>
            </div>
          </div>
        </section>

        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">03 / IN-BOX MANIFEST</span>
            <h2>Complete Hardware Package</h2>
          </div>
          <div class="sp-unboxing-grid">
            <div class="sp-unboxing-card">
              <div style="font-size:2rem;margin-bottom:8px;">📦</div>
              <h4>Flagship Terminal</h4>
              <p>Grade-5 aerospace titanium unibody device.</p>
            </div>
            <div class="sp-unboxing-card">
              <div style="font-size:2rem;margin-bottom:8px;">🔌</div>
              <h4>Kevlar Braided Cord</h4>
              <p>2m reinforced ultra-low impedance cable.</p>
            </div>
            <div class="sp-unboxing-card">
              <div style="font-size:2rem;margin-bottom:8px;">⚡</div>
              <h4>MagLock Dock</h4>
              <p>Solid weighted desktop induction pedestal.</p>
            </div>
            <div class="sp-unboxing-card">
              <div style="font-size:2rem;margin-bottom:8px;">📋</div>
              <h4>Inspection Pass</h4>
              <p>Calibrated laboratory benchmark certificate.</p>
            </div>
          </div>
        </section>
      `;
    } else if (design.theme === 'artisan') {
      customSections = `
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">02 / MÉTIERS D'ART</span>
            <h2>The 5 Stages of Timeless Execution</h2>
          </div>
          <div class="sp-artisan-stages">
            <div class="sp-stage-card">
              <div class="sp-stage-num">STAGE I</div>
              <h4>Mineral Forging</h4>
              <p>Solid Damascus steel billets hand-hammered and heat-treated.</p>
            </div>
            <div class="sp-stage-card">
              <div class="sp-stage-num">STAGE II</div>
              <h4>Guilloché Turnery</h4>
              <p>Traditional hand-turned rose engine dial engraving.</p>
            </div>
            <div class="sp-stage-card">
              <div class="sp-stage-num">STAGE III</div>
              <h4>Flame Bluing</h4>
              <p>Thermal oxidization of hands to a deep, resonant royal blue.</p>
            </div>
            <div class="sp-stage-card">
              <div class="sp-stage-num">STAGE IV</div>
              <h4>Anglage Bevelling</h4>
              <p>45° hand-polished mirror chamfers using alpine gentian wood.</p>
            </div>
            <div class="sp-stage-card">
              <div class="sp-stage-num">STAGE V</div>
              <h4>Master Regulation</h4>
              <p>5-position chronometric timing over 300 test hours.</p>
            </div>
          </div>
        </section>

        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">03 / ARCHIVAL PROVENANCE</span>
            <h2>Authenticated Workshop Ledger</h2>
          </div>
          <table class="sp-ledger-table">
            <tbody>
              <tr>
                <td style="color:var(--sp-muted);width:220px;font-style:italic;">Case Architecture</td>
                <td><strong>Forged Swiss Damascus Steel & Double Sapphire Crystal</strong></td>
              </tr>
              <tr>
                <td style="color:var(--sp-muted);font-style:italic;">Calibre Movement</td>
                <td><strong>Manual-Wound Mechanical Calibre · 28,800 vph · 72h Reserve</strong></td>
              </tr>
              <tr>
                <td style="color:var(--sp-muted);font-style:italic;">Leather Habillage</td>
                <td><strong>Full-Grain Tuscan Vegetable Leather · Hand-Stitched Linen</strong></td>
              </tr>
              <tr>
                <td style="color:var(--sp-muted);font-style:italic;">Benchwork Record</td>
                <td><strong>220 Consecutive Artisan Bench Hours per Numbered Piece</strong></td>
              </tr>
            </tbody>
          </table>
        </section>
      `;
    } else {
      customSections = `
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">02 / NATURAL RHYTHMS</span>
            <h2>The 24h Circadian Cycle</h2>
          </div>
          <div class="sp-rhythm-grid">
            <div class="sp-rhythm-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">🌅</div>
              <span class="sp-kicker">07:00 // DAWN</span>
              <h4>Morning Awakening</h4>
              <p>2700K gentle golden amber illumination clears morning grogginess.</p>
            </div>
            <div class="sp-rhythm-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">☀️</div>
              <span class="sp-kicker">13:00 // NOON</span>
              <h4>Cognitive Deep Focus</h4>
              <p>5500K balanced daylight spectrum maintains natural alertness without eye strain.</p>
            </div>
            <div class="sp-rhythm-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">🌆</div>
              <span class="sp-kicker">19:00 // DUSK</span>
              <h4>Golden Hour Ease</h4>
              <p>3000K warm twilight spectrum signals the brain to unwind after screen work.</p>
            </div>
            <div class="sp-rhythm-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">🌙</div>
              <span class="sp-kicker">22:00 // REST</span>
              <h4>Restorative Slumber</h4>
              <p>2200K zero-blue candle glow promotes natural nocturnal melatonin synthesis.</p>
            </div>
          </div>
        </section>

        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">03 / CLINICAL EVIDENCE</span>
            <h2>Tested in Sleep Laboratories</h2>
          </div>
          <div class="sp-clinical-grid">
            <div class="sp-clinical-card">
              <div style="font-size:2.8rem;font-weight:800;color:var(--sp-accent);margin-bottom:6px;">+42%</div>
              <h4>Deep REM Restoration</h4>
              <p>Measurable increase in restorative deep sleep cycles measured by polysomnography.</p>
            </div>
            <div class="sp-clinical-card">
              <div style="font-size:2.8rem;font-weight:800;color:var(--sp-accent);margin-bottom:6px;">-31%</div>
              <h4>Evening Stress Levels</h4>
              <p>Reduction in evening salivary cortisol and nocturnal restlessness.</p>
            </div>
            <div class="sp-clinical-card">
              <div style="font-size:2.8rem;font-weight:800;color:var(--sp-accent);margin-bottom:6px;">100%</div>
              <h4>Zero Synthetic Plastics</h4>
              <p>Pure cast mineral composite and FSC-certified Scandinavian birchwood.</p>
            </div>
          </div>
        </section>
      `;
    }

    const overview = `
      <section class="sp-section sp-overview">
        <div class="sp-section-heading">
          <span class="sp-kicker">01 / ${esc(ui.product)}</span>
          <h2>${esc(demo ? design.section : name)}</h2>
        </div>
        <div class="sp-split">
          <figure class="sp-product-photo">
            ${photo(imageUrl, name)}
            <figcaption>${esc(name)}</figcaption>
          </figure>
          <div class="sp-copy">
            <span class="sp-kicker">${esc(demo ? design.note : ui.details)}</span>
            <h3>${esc(product?.tagline || (demo ? design.story : name))}</h3>
            ${description ? `<p>${esc(description)}</p>` : ''}
            ${facts(product, ui)}
            ${product?.sellingPoints?.length ? `<ul class="sp-points">${product.sellingPoints.map((point) => `<li>${esc(point)}</li>`).join('')}</ul>` : ''}
            ${link(demo ? design.cta : ui.details)}
          </div>
        </div>
      </section>
    `;

    const galleryHtml = gallery.length
      ? `<section class="sp-section"><div class="sp-section-heading"><span class="sp-kicker">04 / ${esc(ui.details)}</span><h2>${esc(name)}</h2></div><div class="sp-gallery">${gallery.map((item) => `<figure>${photo(item.url, item.caption)}<figcaption>${esc(item.caption)}</figcaption></figure>`).join('')}</div></section>`
      : '';

    const closing = `
      <section class="sp-closing">
        <span class="sp-kicker">${esc(brand)}</span>
        <h2>${esc(demo ? 'Reserve Your Production Allocation' : name)}</h2>
        <p>${esc(ui.contactIntro)}</p>
        ${contact}
      </section>
    `;

    content = hero + `<div id="product">${overview}</div>` + customSections + galleryHtml + closing;
  } else if (page === 'catalog' || page === 'detail') {
    // ── Dedicated Single Product Deep Dive / Editions Page ──
    const galleryHtml = gallery.length
      ? `<section class="sp-section"><div class="sp-section-heading"><span class="sp-kicker">02 / ${esc(ui.details)}</span><h2>${esc(name)}</h2></div><div class="sp-gallery">${gallery.map((item) => `<figure>${photo(item.url, item.caption)}<figcaption>${esc(item.caption)}</figcaption></figure>`).join('')}</div></section>`
      : '';

    const detailBento = `
      <section class="sp-section">
        <div class="sp-section-heading">
          <span class="sp-kicker">SPECIFICATIONS</span>
          <h2>Technical Architecture &amp; Delivery</h2>
        </div>
        <div class="sp-hardware-bento">
          <div class="sp-bento-card">
            <span class="sp-kicker">PRODUCTION ALLOCATION</span>
            <h3>Direct Factory Dispatch</h3>
            <p>Every piece is individually tested, serialized, and packed in reinforced protective shipping vaults with insured express worldwide transit.</p>
          </div>
          <div class="sp-bento-card">
            <span class="sp-kicker">CONFIDENCE GUARANTEE</span>
            <h3>30-Day Risk-Free Trial</h3>
            <p>Experience the piece in your daily creative workspace. Full refund if it does not exceed your exacting standards.</p>
          </div>
        </div>
      </section>
    `;

    const closing = `
      <section class="sp-closing">
        <span class="sp-kicker">${esc(brand)}</span>
        <h2>${esc(demo ? 'Configure Your Dedicated Piece' : name)}</h2>
        <p>${esc(ui.contactIntro)}</p>
        ${contact}
      </section>
    `;

    content = `
      <section class="sp-section sp-detail" data-wr-product-id="${esc(product?.id || '')}">
        <div class="sp-split">
          <figure class="sp-product-photo">
            ${photo(imageUrl, name, 'wr-detail-main-img', true)}
          </figure>
          <div class="sp-copy">
            ${title}
            ${facts(product, ui)}
            ${product?.sellingPoints?.length ? `<ul class="sp-points">${product.sellingPoints.map((point) => `<li>${esc(point)}</li>`).join('')}</ul>` : ''}
            ${contact}
          </div>
        </div>
      </section>
      ${galleryHtml}
      ${product?.applications?.length ? `<section class="sp-section"><h2>${esc(ui.details)}</h2><ul class="sp-points">${product.applications.map((text) => `<li>${esc(text)}</li>`).join('')}</ul></section>` : ''}
      ${detailBento}
      ${closing}
    `;
  } else if (page === 'about') {
    // ── Dedicated Origin Story Page for the Single Product (Different for each template) ──
    const story = draft.company.aboutStory || copy?.about || draft.company.description;
    const storyParagraphs = story
      ? story.split(/\n+/).map((text) => `<p>${esc(text)}</p>`).join('')
      : '';

    let customAboutHtml = '';

    if (design.theme === 'hardware') {
      customAboutHtml = `
        <section class="sp-section sp-about">
          <span class="sp-kicker">KEYNOTE LABS // R&D NETWORK</span>
          <h1>${esc(draft.company.aboutHeadline || brand)}</h1>
          <div class="sp-split">
            <figure class="sp-product-photo">
              ${photo(imageUrl, name, '', true)}
              <figcaption>HARDWARE LAB ARCHITECTURE // 01</figcaption>
            </figure>
            <div class="sp-copy">
              <span class="sp-kicker">ENGINEERING MANIFESTO</span>
              <h2>${esc(demo ? design.story : name)}</h2>
              ${storyParagraphs || '<p>We dedicated three years of focused laboratory engineering to perfecting a single acoustic hardware terminal.</p>'}
              ${draft.company.capabilities ? `<p>${esc(draft.company.capabilities)}</p>` : ''}
              ${contact}
            </div>
          </div>
        </section>

        <!-- 3 GLOBAL RESEARCH NODES (Image & Text Integration) -->
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">GLOBAL R&amp;D NODES</span>
            <h2>Three Specialized Engineering Centers</h2>
          </div>
          <div class="sp-hub-grid">
            <div class="sp-hub-card">
              <div>
                <span class="sp-hub-badge">MUNICH ACOUSTICS</span>
                <h3>Acoustic Dynamics Center</h3>
                <p>Anechoic chamber acoustic calibration, continuous harmonic distortion analysis, and micro-transducer frequency response tuning.</p>
              </div>
              <div style="font-size:12px;font-family:monospace;color:var(--sp-accent);margin-top:16px;">
                FACILITY // ANECHOIC CHAMBER 04
              </div>
            </div>
            <div class="sp-hub-card">
              <div>
                <span class="sp-hub-badge">TOKYO METALLURGY</span>
                <h3>Advanced Materials Foundry</h3>
                <p>Aerospace titanium unibody metallurgy, laser ablation precision, and diamond tool CNC micro-milling with sub-micron tolerances.</p>
              </div>
              <div style="font-size:12px;font-family:monospace;color:var(--sp-accent);margin-top:16px;">
                TOLERANCE // ±0.002 MM
              </div>
            </div>
            <div class="sp-hub-card">
              <div>
                <span class="sp-hub-badge">SAN FRANCISCO AI</span>
                <h3>Neural Signal Laboratory</h3>
                <p>On-device computational DSP algorithms, sub-millimeter gesture processing, and low-latency acoustic mesh firmware.</p>
              </div>
              <div style="font-size:12px;font-family:monospace;color:var(--sp-accent);margin-top:16px;">
                DSP ARCHITECTURE // 9.8 TFLOPS
              </div>
            </div>
          </div>
        </section>

        <!-- ENGINEERING TIMELINE (Image & Text Integration) -->
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">CHRONOLOGY</span>
            <h2>From First Breadboard to Final Production</h2>
          </div>
          <div class="sp-timeline-grid">
            <div class="sp-timeline-card">
              <div class="sp-timeline-year">PHASE 01 // 2023</div>
              <h4>Silicon &amp; DSP Validation</h4>
              <p>Prototyping the dedicated quad-core neural audio processor on discrete validation boards.</p>
            </div>
            <div class="sp-timeline-card">
              <div class="sp-timeline-year">PHASE 02 // 2024</div>
              <h4>Titanium Unibody Cold Forging</h4>
              <p>Milling 120 iterative chassis test models to eliminate acoustic resonance and optimize thermal sink.</p>
            </div>
            <div class="sp-timeline-card">
              <div class="sp-timeline-year">PHASE 03 // 2025</div>
              <h4>Direct Factory Calibration</h4>
              <p>Final production release with individual serialization, zero-leak acoustic sealing, and global dispatch.</p>
            </div>
          </div>
        </section>
      `;
    } else if (design.theme === 'artisan') {
      customAboutHtml = `
        <section class="sp-section sp-about">
          <span class="sp-kicker">HERITAGE DEPUIS 1892 · SWISS GUILD</span>
          <h1>${esc(draft.company.aboutHeadline || brand)}</h1>
          <div class="sp-split">
            <figure class="sp-product-photo">
              ${photo(imageUrl, name, '', true)}
              <figcaption>MASTER CRAFTSMAN BENCHWORK</figcaption>
            </figure>
            <div class="sp-copy">
              <span class="sp-kicker">PHILOSOPHY OF TIME</span>
              <h2>${esc(demo ? design.story : name)}</h2>
              ${storyParagraphs || '<p>In an era of fleeting digital appliances, we dedicate 220 consecutive bench hours to creating a singular mechanical object that outlasts generations.</p>'}
              ${draft.company.capabilities ? `<p>${esc(draft.company.capabilities)}</p>` : ''}
              ${contact}
            </div>
          </div>
        </section>

        <!-- 4 GUILD MÉTIERS D'ART (Image & Text Integration) -->
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">THE CRAFTSMAN DISCIPLINES</span>
            <h2>Four Pillars of Haute Horlogerie</h2>
          </div>
          <div class="sp-metiers-grid">
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">⚙️</div>
              <h4>Hand Guilloché</h4>
              <p>Dial turnery executed on antique 19th-century rose engines without automated CNC assistance.</p>
            </div>
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">🪵</div>
              <h4>Gentian Wood Anglage</h4>
              <p>Internal angles bevelled by hand using wild alpine gentian wood pegs for an optical black mirror shine.</p>
            </div>
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">🔥</div>
              <h4>Flame Oxidization</h4>
              <p>Steel hands heated over an open hearth to exactly 295°C until an indelible cornflower blue emerges.</p>
            </div>
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">⚜️</div>
              <h4>Master Seal Hallmark</h4>
              <p>Individual maker signature engraved into the baseplate upon passing chronometric regulation.</p>
            </div>
          </div>
        </section>

        <!-- LIFETIME RESTORATION COVENANT (Image & Text Integration) -->
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">ARCHIVAL PROMISE</span>
            <h2>A Lifetime Restoration Covenant</h2>
          </div>
          <div class="sp-hardware-bento">
            <div class="sp-bento-card">
              <span class="sp-kicker">HERITAGE PRESERVATION</span>
              <h3>Indefinite Guild Servicing</h3>
              <p>Every piece is accompanied by a leather-bound archival ledger. Our guild maintains spare hand-finished components to guarantee servicing for decades to come.</p>
            </div>
            <div class="sp-bento-card">
              <span class="sp-kicker">DIRECT GUILD CONTACT</span>
              <h3>Personal Watchmaker Access</h3>
              <p>Owners are invited to consult directly with the master craftsman responsible for assembling and regulating their specific piece.</p>
            </div>
          </div>
        </section>
      `;
    } else {
      customAboutHtml = `
        <section class="sp-section sp-about">
          <span class="sp-kicker">MINDFUL LIVING ARCHITECTURE · COPENHAGEN</span>
          <h1>${esc(draft.company.aboutHeadline || brand)}</h1>
          <div class="sp-split">
            <figure class="sp-product-photo">
              ${photo(imageUrl, name, '', true)}
              <figcaption>SCANDINAVIAN DAYLIGHT LIVING</figcaption>
            </figure>
            <div class="sp-copy">
              <span class="sp-kicker">BIOPHILIC PHILOSOPHY</span>
              <h2>${esc(demo ? design.story : name)}</h2>
              ${storyParagraphs || '<p>Humans evolved beneath the rhythm of the natural sun. We create lighting companions that bring restorative circadian tranquility back into indoor living.</p>'}
              ${draft.company.capabilities ? `<p>${esc(draft.company.capabilities)}</p>` : ''}
              ${contact}
            </div>
          </div>
        </section>

        <!-- 4 BIOPHILIC DESIGN PRINCIPLES (Image & Text Integration) -->
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">DESIGN ETHOS</span>
            <h2>Four Principles of Biophilic Living</h2>
          </div>
          <div class="sp-metiers-grid">
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">☀️</div>
              <h4>Pure Natural Spectrum</h4>
              <p>Calibrated illumination curves that align with human biology to foster morning vigor and nocturnal calm.</p>
            </div>
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">🌱</div>
              <h4>Zero Synthetic Plastics</h4>
              <p>Only cast natural mineral stone and certified sustainable Scandinavian birchwood touch the living environment.</p>
            </div>
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">🕊️</div>
              <h4>Silent Engineering</h4>
              <p>Passive convection cooling eliminates all mechanical fan noise and electrical coil hum.</p>
            </div>
            <div class="sp-metier-card">
              <div style="font-size:1.8rem;margin-bottom:8px;">☕</div>
              <h4>Slow Everyday Rituals</h4>
              <p>Designed to be touched and adjusted as a mindful pause during morning reading or evening unwinding.</p>
            </div>
          </div>
        </section>

        <!-- SUSTAINABILITY & CIRCULARITY (Image & Text Integration) -->
        <section class="sp-section">
          <div class="sp-section-heading">
            <span class="sp-kicker">ENVIRONMENTAL PLEDGE</span>
            <h2>Sustainable Forests &amp; Circular Lifecycle</h2>
          </div>
          <div class="sp-hardware-bento">
            <div class="sp-bento-card">
              <span class="sp-kicker">RESPONSIBLE FORESTRY</span>
              <h3>FSC-Certified Nordic Birch</h3>
              <p>Harvested exclusively from sustainably managed northern European woodlands with continuous reforestation oversight.</p>
            </div>
            <div class="sp-bento-card">
              <span class="sp-kicker">PLASTIC-FREE PLEDGE</span>
              <h3>100% Recyclable Unboxing Kit</h3>
              <p>Shipped in raw unbleached molded pulp packaging printed with non-toxic vegetable inks.</p>
            </div>
          </div>
        </section>
      `;
    }

    const closing = `
      <section class="sp-closing">
        <span class="sp-kicker">${esc(brand)}</span>
        <h2>${esc(demo ? 'Connect With Our Design Team' : name)}</h2>
        <p>${esc(ui.contactIntro)}</p>
        ${contact}
      </section>
    `;

    content = customAboutHtml + closing;
  } else {
    // ── Dedicated Contact & Concierge Page (Different for each template) ──
    let customContactHtml = '';

    if (design.theme === 'hardware') {
      customContactHtml = `
        <section class="sp-section">
          <div class="sp-contact-custom">
            <div>
              <span class="sp-kicker">GLOBAL HARDWARE OPERATIONS // 24/7 SUPPORT</span>
              <h1>${esc(ui.contact)}</h1>
              <p class="sp-lead">Direct access to hardware engineering technicians, developer SDK support, and expedited warranty dispatch.</p>
              
              <!-- 3 Service Hubs (Image & Text Integration) -->
              <div class="sp-contact-hubs">
                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">TOKYO SERVICE HUB · [ONLINE]</span>
                    <h4>Akihabara Technical Depot</h4>
                    <p>Direct lab inspection, hardware diagnostics, and Asia-Pacific expedited dispatch.</p>
                  </div>
                  <div style="font-size:12px;font-family:monospace;color:var(--sp-muted);margin-top:10px;">
                    DESK // LAB-DESK-TYO@${esc(brand.toLowerCase().replace(/[^a-z0-9]/g, ''))}.NET
                  </div>
                </div>

                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">FRANKFURT LOGISTICS · [ONLINE]</span>
                    <h4>Gateway West Technical Center</h4>
                    <p>European express replacement depot and hardware certification archive.</p>
                  </div>
                  <div style="font-size:12px;font-family:monospace;color:var(--sp-muted);margin-top:10px;">
                    SLA // &lt; 4H RESPONSE TIME FOR ACTIVE SERIALS
                  </div>
                </div>

                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">SAN JOSE DEV LAB · [ONLINE]</span>
                    <h4>Silicon Valley Developer Hub</h4>
                    <p>Python SDK integration, DSP firmware support, and enterprise API inquiries.</p>
                  </div>
                  <div style="font-size:12px;font-family:monospace;color:var(--sp-muted);margin-top:10px;">
                    DEV DESK // FIRMWARE-API-SUPPORT
                  </div>
                </div>
              </div>

              ${draft.company.email ? `<p style="margin-top:24px;"><a class="sp-text-link" href="mailto:${esc(draft.company.email)}">${esc(draft.company.email)}</a></p>` : ''}
              ${draft.company.address ? `<p style="font-size:13px;color:var(--sp-muted);">${esc(draft.company.address)}</p>` : ''}
            </div>

            <div>
              <div class="sp-form">
                <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--sp-line);">
                  <span class="sp-kicker">ENGINEERING DISPATCH CONSOLE</span>
                  <h3 style="margin-top:4px;">Submit Technical Inquiry</h3>
                  <p style="font-size:13px;margin:6px 0 0;">Dedicated response desk for registered single-device owners and procurement partners.</p>
                </div>
                ${ctx.inquiryFormHtml}
              </div>
            </div>
          </div>
        </section>
      `;
    } else if (design.theme === 'artisan') {
      customContactHtml = `
        <section class="sp-section">
          <div class="sp-contact-custom">
            <div>
              <span class="sp-kicker">PRIVATE CLIENTELE CONCIERGE</span>
              <h1>${esc(ui.contact)}</h1>
              <p class="sp-lead">Arrange a private salon viewing or commission an individually numbered bespoke piece with our master watchmakers.</p>
              
              <!-- 3 Private Viewing Salons (Image & Text Integration) -->
              <div class="sp-contact-hubs">
                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">SWISS SALON // BY APPOINTMENT</span>
                    <h4>Historic Rue du Rhône Salon</h4>
                    <p>Personal consultation with our guild director, movement regulation demonstration, and private vault viewing.</p>
                  </div>
                  <div style="font-size:13px;color:var(--sp-muted);font-style:italic;margin-top:8px;">
                    Rue du Rhône 42 · 1204 Genève
                  </div>
                </div>

                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">PARIS SALON // PRIVATE SUITE</span>
                    <h4>Place Vendôme Collector Studio</h4>
                    <p>White-glove bespoke habillage selection, Tuscan strap fitting, and numbered commission delivery.</p>
                  </div>
                  <div style="font-size:13px;color:var(--sp-muted);font-style:italic;margin-top:8px;">
                    Place Vendôme 18 · 75001 Paris
                  </div>
                </div>

                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">TOKYO GINZA // RESIDENT ARTISAN</span>
                    <h4>Ginza Private Horological Studio</h4>
                    <p>Annual master watchmaker resident sessions and private collector reception.</p>
                  </div>
                  <div style="font-size:13px;color:var(--sp-muted);font-style:italic;margin-top:8px;">
                    Ginza 6-Chome · Chuo-ku, Tokyo
                  </div>
                </div>
              </div>

              ${draft.company.email ? `<p style="margin-top:24px;"><a class="sp-text-link" href="mailto:${esc(draft.company.email)}">${esc(draft.company.email)}</a></p>` : ''}
              ${draft.company.address ? `<p style="font-size:13px;color:var(--sp-muted);">${esc(draft.company.address)}</p>` : ''}
            </div>

            <div>
              <div class="sp-form">
                <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--sp-line);">
                  <span class="sp-kicker">ARCHIVAL PROTOCOL</span>
                  <h3 style="margin-top:4px;">Request Private Commission</h3>
                  <p style="font-size:13px;margin:6px 0 0;">Strictly confidential consultation for collectors and personal commissions.</p>
                </div>
                ${ctx.inquiryFormHtml}
              </div>
            </div>
          </div>
        </section>
      `;
    } else {
      customContactHtml = `
        <section class="sp-section">
          <div class="sp-contact-custom">
            <div>
              <span class="sp-kicker">HOLISTIC WELLNESS CONCIERGE</span>
              <h1>${esc(ui.contact)}</h1>
              <p class="sp-lead">Schedule a 1-on-1 circadian lighting consultation for your home sanctuary, architectural studio, or spa retreat.</p>
              
              <!-- 3 Nordic Sanctuaries (Image & Text Integration) -->
              <div class="sp-contact-hubs">
                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">COPENHAGEN STUDIO · [OPEN]</span>
                    <h4>Bredgade Daylight Experience Lounge</h4>
                    <p>Experience the 24h circadian transition live in our sensory timber-lined daylight studio.</p>
                  </div>
                  <div style="font-size:13px;color:var(--sp-muted);margin-top:8px;">
                    Bredgade 24 · 1260 Copenhagen K
                  </div>
                </div>

                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">STOCKHOLM SHOWROOM · [OPEN]</span>
                    <h4>Södermalm Biophilic Studio</h4>
                    <p>Consultations for architects and homeowners looking to incorporate natural light rhythms.</p>
                  </div>
                  <div style="font-size:13px;color:var(--sp-muted);margin-top:8px;">
                    Götgatan 38 · 118 26 Stockholm
                  </div>
                </div>

                <div class="sp-hub-card">
                  <div>
                    <span class="sp-hub-badge">OSLO RETREAT DESK · [OPEN]</span>
                    <h4>Fjord Sleep Consultation Suite</h4>
                    <p>Dedicated hospitality partnership desk for Nordic wellness hotels and fjordside spas.</p>
                  </div>
                  <div style="font-size:13px;color:var(--sp-muted);margin-top:8px;">
                    Aker Brygge · 0250 Oslo
                  </div>
                </div>
              </div>

              ${draft.company.email ? `<p style="margin-top:24px;"><a class="sp-text-link" href="mailto:${esc(draft.company.email)}">${esc(draft.company.email)}</a></p>` : ''}
              ${draft.company.address ? `<p style="font-size:13px;color:var(--sp-muted);">${esc(draft.company.address)}</p>` : ''}
            </div>

            <div>
              <div class="sp-form">
                <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--sp-line);">
                  <span class="sp-kicker">MINDFUL INQUIRY</span>
                  <h3 style="margin-top:4px;">Request Circadian Consultation</h3>
                  <p style="font-size:13px;margin:6px 0 0;">Includes a personalized daylight recommendations guide for your bedroom or workspace.</p>
                </div>
                ${ctx.inquiryFormHtml}
              </div>
            </div>
          </div>
        </section>
      `;
    }

    content = customContactHtml;
  }

  return `
    <div class="sp-site sp-${design.theme}">
      ${header}
      <main id="main">${content}</main>
      <footer class="sp-footer">
        <a class="sp-brand" href="${path('index.html')}" ${navAttrs('home')}>${esc(brand)}</a>
        <div>${ctx.socials}</div>
        <small>© ${new Date().getUTCFullYear()} ${esc(brand)}</small>
      </footer>
    </div>
  `;
}

function facts(product: Product | undefined, ui: ThemeContext['ui']): string {
  const rows = [
    [ui.material, product?.material],
    [ui.dimensions, product?.dimensions],
  ].filter(([, value]) => value);
  return rows.length
    ? `<dl class="sp-facts">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`
    : '';
}

export const singleProductRuntime = `(()=>{const v=document.querySelector('[data-sp-video]'),b=document.querySelector('[data-sp-video-toggle]');if(!v||!b)return;const motion=matchMedia('(prefers-reduced-motion: reduce)');let requested=!motion.matches&&!navigator.connection?.saveData;const sync=()=>{b.textContent=v.paused?'Play video':'Pause video';b.setAttribute('aria-label',v.paused?'Play background video':'Pause background video');b.setAttribute('aria-pressed',String(!v.paused));};const play=()=>{if(!v.src)v.src=v.dataset.src;v.play().catch(sync);};b.hidden=false;b.onclick=()=>{requested=v.paused;if(requested)play();else v.pause();};v.addEventListener('play',sync);v.addEventListener('pause',sync);v.addEventListener('error',()=>{b.hidden=true;});motion.addEventListener('change',()=>{if(motion.matches){requested=false;v.pause();}});document.addEventListener('visibilitychange',()=>{if(document.hidden)v.pause();else if(requested)play();});sync();if(requested)play();})();`;
