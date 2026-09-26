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
    // ── Dedicated Origin Story Page for the Single Product ──
    const story = draft.company.aboutStory || copy?.about || draft.company.description;
    const closing = `
      <section class="sp-closing">
        <span class="sp-kicker">${esc(brand)}</span>
        <h2>${esc(demo ? 'Connect With Our Design Team' : name)}</h2>
        <p>${esc(ui.contactIntro)}</p>
        ${contact}
      </section>
    `;

    content = `
      <section class="sp-section sp-about">
        <span class="sp-kicker">${esc(ui.about)}</span>
        <h1>${esc(draft.company.aboutHeadline || brand)}</h1>
        <div class="sp-split">
          <figure class="sp-product-photo">
            ${photo(imageUrl, name, '', true)}
          </figure>
          <div class="sp-copy">
            <h2>${esc(demo ? design.story : name)}</h2>
            ${
              story
                ? story
                    .split(/\n+/)
                    .map((text) => `<p>${esc(text)}</p>`)
                    .join('')
                : ''
            }
            ${draft.company.capabilities ? `<p>${esc(draft.company.capabilities)}</p>` : ''}
            ${contact}
          </div>
        </div>
      </section>
      <section class="sp-section">
        <div class="sp-section-heading">
          <span class="sp-kicker">THE PHILOSOPHY</span>
          <h2>Why We Made Just One Object</h2>
        </div>
        <div class="sp-bento-grid3">
          <div class="sp-bento-card">
            <h4>Singular Focus</h4>
            <p>Instead of dividing engineering attention across dozens of variants, every resource is concentrated on perfecting one flagship design.</p>
          </div>
          <div class="sp-bento-card">
            <h4>Authentic Longevity</h4>
            <p>Built with serviceable, premium materials to eliminate obsolescence and ensure decades of reliable everyday use.</p>
          </div>
          <div class="sp-bento-card">
            <h4>Direct Concierge</h4>
            <p>Every owner has direct access to the designers and technicians responsible for crafting their unit.</p>
          </div>
        </div>
      </section>
      ${closing}
    `;
  } else {
    // ── Contact & Concierge Page ──
    content = `
      <section class="sp-section sp-contact">
        <div>
          <span class="sp-kicker">${esc(brand)}</span>
          <h1>${esc(ui.contact)}</h1>
          <p class="sp-lead">${esc(ui.contactIntro)}</p>
          ${draft.company.email ? `<p><a class="sp-text-link" href="mailto:${esc(draft.company.email)}">${esc(draft.company.email)}</a></p>` : ''}
          ${draft.company.address ? `<p>${esc(draft.company.address)}</p>` : ''}
        </div>
        <div class="sp-form">
          ${ctx.inquiryFormHtml}
        </div>
      </section>
    `;
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
