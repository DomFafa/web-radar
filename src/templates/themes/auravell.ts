import type { Draft, Product } from '../../shared/model';
import { displayProducts } from '../../shared/product-display';
import { materialsRuntime } from '../../shared/materials-runtime';
import { buildThemeContext, esc, productPath, safeUrl, type RenderOptions } from './types';
import { auravellExampleClasses, auravellImages, auravellTexts } from './auravell/inventory';
import { auravellFixes } from './auravell/styles';
import { auravellSnapshots, getAuravellNavigation, getAuravellFooter } from './auravell/snapshots';
import { referenceMotionStyles } from './reference-motion-styles';
import { referenceMotionRuntime } from './reference-motion';
import { auravellRuntime } from './auravell/runtime';

export { auravellRuntime, auravellExampleClasses };

const validColor = (v?: string) => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : undefined);

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function renderAuravellSite(input: Draft, options: RenderOptions): string {
  const validPages = ['home', 'catalog', 'about', 'plans', 'contact', 'detail'];
  const requestedPage = options.page === 'extra-plans' ? 'plans' : options.page;
  const page = validPages.includes(requestedPage) ? requestedPage : 'home';
  const demo = ['preview', 'materials-demo', 'auravell-demo'].includes(options.projectId);

  const text = (id: string) =>
    input.materials?.textBindings.find((b) => b.slotId === id && b.locale === options.lang)?.text;

  const draft: Draft = {
    ...input,
    products: input.products.map((p) => {
      const main = input.materials?.imageBindings.find(
        (b) => b.slotId === 'product-main' && b.productId === p.id,
      );
      const gallery = input.materials?.imageBindings
        .filter((b) => b.slotId === 'product-gallery' && b.productId === p.id)
        .sort((a, b) => (a.itemIndex ?? 0) - (b.itemIndex ?? 0));
      return {
        ...p,
        imageAssetId: main?.assetId || p.imageAssetId,
        ...(gallery?.length
          ? {
              gallery: gallery.map((b) => ({
                assetId: b.assetId,
                sourceImageId: b.assetId,
                kind: 'original' as const,
                caption: b.alt[options.lang] || p.name,
              })),
            }
          : {}),
      };
    }),
  };

  if (demo && !draft.products.length) {
    draft.products = auravellExampleClasses.map((c) => ({ ...c }));
  }

  const ctx = buildThemeContext(draft, options);
  const products = displayProducts(draft);
  const selected = draft.products.find((p) => p.id === options.productId) || ctx.mainProduct;

  const name = draft.company.name || (demo ? 'Auravell' : 'Auravell Yoga Sanctuary');
  const copy = draft.copy[options.lang] || draft.copy.en;
  const image = (id: string) => {
    const binding = draft.materials?.imageBindings.find((b) => b.slotId === id && !b.productId);
    return (
      ctx.asset(binding?.assetId) || auravellImages.find((i) => i.id === id)?.defaultAsset || ''
    );
  };
  const brandAccent = validColor(draft.brandColor) || '#99582a';

  const depth = options.page === 'home' ? '' : options.page === 'detail' ? '../../' : '../';
  const path = (p: string) =>
    depth +
    (p === 'home'
      ? 'index.html'
      : p === 'detail'
        ? productPath(selected?.id)
        : `${p === 'plans' ? 'extra-plans' : p}/index.html`);

  const title =
    text(`${page === 'detail' ? 'productDetail' : page}-seo-title`) ||
    (page === 'home'
      ? `${name} · Mindful Yoga & Wellness Sanctuary`
      : page === 'detail' && selected
        ? `${ctx.translateProduct(selected).name} · ${name}`
        : `${page[0].toUpperCase() + page.slice(1)} · ${name}`);

  const description =
    text(`${page === 'detail' ? 'productDetail' : page}-seo-description`) ||
    copy?.subtitle ||
    draft.company.description ||
    'Find balance, strength, and calm through mindful yoga and meditation classes designed for your well-being.';

  const logo = ctx.asset(draft.company.logoAssetId);
  const brandElement = logo
    ? `<img src="${esc(logo)}" alt="${esc(name)}" style="max-height:38px;object-fit:contain;">`
    : `<span style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;letter-spacing:-0.5px;color:#2a2b2f;">${esc(name)}</span>`;

  // Inquiry form markup
  const formHtml = `
    <form class="auravell-inquiry-box" data-auravell-form data-wr-preview-disabled="${!!options.preview || demo}" method="POST" action="${esc(safeUrl(options.inquiryUrl) || '#')}">
      <h3 style="font-size:22px;margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;color:#2a2b2f;">Reserve a Session</h3>
      <p style="font-size:14px;color:#666;margin:0 0 20px;">Send us an inquiry and our team will get in touch with you shortly.</p>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Your Name *</label>
        <input type="text" name="name" maxlength="120" required placeholder="Jane Doe" />
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Email Address *</label>
        <input type="email" name="email" maxlength="254" required placeholder="jane@example.com" />
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Select Class / Experience</label>
        <select name="productId">
          <option value="">— Please choose a class —</option>
          ${products.map((p) => `<option value="${esc(p.id)}"${selected?.id === p.id ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Your Message or Preferred Time</label>
        <textarea name="message" required maxlength="5000" rows="3" placeholder="Tell us about your practice experience or schedule preferences..."></textarea>
      </div>
      <button type="submit"${options.preview || demo ? ' disabled' : ''} style="background-color:${brandAccent};">Submit Booking Request</button>
      <div role="status" aria-live="polite" class="auravell-form-status" style="margin-top:16px;padding:12px;background:#eef7ee;border-radius:8px;color:#2d6a4f;font-size:14px;text-align:center;"></div>
    </form>
  `;

  // Render cards for classes
  const renderClassCards = (items: Product[]) => `
    <div class="auravell-class-grid" data-wr-product-list="${esc(page)}">
      ${items
        .map((p) => {
          const trans = ctx.translateProduct(p);
          const photo =
            ctx.asset(p.imageAssetId) ||
            '/templates/auravell/images/6a7d651d45031f173673109f_f686c4255802fa9f938b7bf22f73da0f_yoga-site-image-one.avif';
          return `
            <article class="auravell-class-card" data-product-card data-wr-product-card data-wr-product-id="${esc(p.id)}" data-product-name="${esc(trans.name)}" data-auravell-category="${p.material?.toLowerCase().includes('meditation') ? 'meditation' : p.material?.toLowerCase().includes('vinyasa') ? 'yoga' : 'all'}">
              <a href="${esc(depth + productPath(p.id))}" data-wr-page="detail" data-wr-product-id="${esc(p.id)}">
                <img src="${esc(photo)}" alt="${esc(trans.name)}" loading="lazy" data-wr-material-image="product-main" data-wr-material-product="${esc(p.id)}">
              </a>
              <div class="auravell-class-card-body">
                <h3><a href="${esc(depth + productPath(p.id))}" style="color:#2a2b2f;text-decoration:none;" data-wr-page="detail" data-wr-product-id="${esc(p.id)}">${esc(trans.name)}</a></h3>
                <p>${esc(p.tagline || trans.description)}</p>
                <div class="auravell-class-card-meta">
                  <span>${esc(p.material || 'All levels')}</span>
                  <span>${esc(p.dimensions || 'Weekly sessions')}</span>
                </div>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;

  const region = (html: string, key: string, value: string) =>
    html.replace(
      new RegExp(`<!--AV_${key}_START-->[\\s\\S]*?<!--AV_${key}_END-->`, 'g'),
      () => value,
    );
  let mainContent = auravellSnapshots[page] || '';
  if (page === 'detail' && selected) {
    const p = ctx.translateProduct(selected);
    const photo =
      ctx.asset(selected.imageAssetId) ||
      '/templates/auravell/images/6a7d651d45031f173673109f_f686c4255802fa9f938b7bf22f73da0f_yoga-site-image-one.avif';
    const gallery = [
      { assetId: selected.imageAssetId, caption: p.name },
      ...(selected.gallery || []),
    ].filter((g, i, all) => g.assetId && all.findIndex((v) => v.assetId === g.assetId) === i);

    mainContent = `
      <section class="auravell-detail-section">
        <div class="auravell-detail-gallery">
          <img id="wr-detail-main-img" class="auravell-detail-main-img" src="${esc(photo)}" alt="${esc(p.name)}" loading="eager" fetchpriority="high" data-wr-material-image="product-main" data-wr-material-product="${esc(selected.id)}">
          ${
            gallery.length > 1
              ? `
            <div class="auravell-detail-thumbs senseng-detail-thumbs">
              ${gallery
                .map(
                  (g, i) => `
                <button type="button" class="auravell-detail-thumb wr-detail-thumb ${i === 0 ? 'active' : ''}" data-wr-material-thumb data-src="${esc(ctx.asset(g.assetId))}" aria-label="View photo ${i + 1}" aria-pressed="${i === 0}">
                  <img src="${esc(ctx.asset(g.assetId))}" alt="${esc(g.caption || p.name)}" loading="lazy">
                </button>
              `,
                )
                .join('')}
            </div>
          `
              : ''
          }
          <div style="margin-top:20px;">
            <a href="${esc(path('catalog'))}" style="color:#99582a;text-decoration:none;font-size:14px;font-weight:600;" data-wr-page="catalog">← Back to all classes</a>
          </div>
        </div>
        <div class="auravell-detail-content">
          <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">
            ${esc(selected.material || 'Mindful Practice')}
          </div>
          <h1>${esc(p.name)}</h1>
          <p class="lead">${esc(selected.tagline || p.description)}</p>
          <div style="background:#ffffff;border-radius:16px;padding:24px;border:1px solid #ebdccb;margin-bottom:28px;">
            <div style="font-size:15px;font-weight:600;margin-bottom:12px;color:#2a2b2f;">Class Details</div>
            <div style="display:flex;gap:24px;font-size:14px;color:#555;">
              <span><strong>Duration:</strong> ${esc(selected.material || '60 mins')}</span>
              <span><strong>Schedule:</strong> ${esc(selected.dimensions || 'Weekly sessions')}</span>
            </div>
          </div>
          ${
            selected.sellingPoints?.length
              ? `
            <h3 style="font-size:20px;font-family:'Playfair Display',Georgia,serif;margin:0 0 12px;">What to Expect</h3>
            <ul class="auravell-detail-features">
              ${selected.sellingPoints.map((pt) => `<li>${esc(pt)}</li>`).join('')}
            </ul>
          `
              : ''
          }
          ${formHtml}
        </div>
      </section>
    `;
    mainContent = getAuravellNavigation() + mainContent + getAuravellFooter();
  }
  if (!demo) {
    for (const key of ['TEAM', 'PARTNERS', 'QUOTE']) mainContent = region(mainContent, key, '');
    mainContent = region(
      mainContent,
      'FEATURED',
      `<div class="rt-hero-v1-card-text-wrap"><div class="rt-text-style-h4">${esc(selected?.name || name)}</div><p>${esc(selected?.tagline || 'Explore our classes and contact our team.')}</p></div>`,
    );
    mainContent = region(mainContent, 'SCHEDULE', renderClassCards(products.slice(0, 8)));
    mainContent = region(mainContent, 'CATALOG', renderClassCards(products));
    mainContent = region(
      mainContent,
      'PLANS',
      `<div class="av-plans-inquiry"><h2>Find the right plan for you</h2><p>Contact our team for confirmed availability and pricing.</p><a class="rt-button-v1" href="${esc(path('contact'))}" data-wr-page="contact">Ask about plans</a></div>`,
    );
    mainContent = region(
      mainContent,
      'TEXT_hero-headline',
      esc(text('hero-headline') || copy?.headline || name),
    );
    mainContent = region(
      mainContent,
      'TEXT_hero-subtitle',
      esc(text('hero-subtitle') || copy?.subtitle || draft.company.description),
    );
    // Reference offers and timetables are illustrative, never business claims.
    mainContent = mainContent
      .replace(/Save up to/g, 'Explore our')
      .replace(/30%/g, 'plans')
      .replace(/Helping 10K\+ people find lasting calm/g, 'Explore our approach to wellbeing');
  }
  if (!demo || logo)
    mainContent = region(
      mainContent,
      'BRAND',
      `<a class="rt-navbar-brand w-nav-brand av-brand" href="${esc(path('home'))}" data-wr-page="home">${brandElement}</a>`,
    );
  for (const id of [
    'hero-headline',
    'hero-subtitle',
    'about-headline',
    'catalog-headline',
    'plans-headline',
    'contact-headline',
    'company-about',
  ]) {
    const value = text(id) || (id === 'company-about' ? draft.company.aboutStory : undefined);
    if (value) mainContent = region(mainContent, 'TEXT_' + id, esc(value));
  }
  if (text('primary-cta'))
    mainContent = mainContent.replace(
      /<a\b[^>]*data-wr-page="contact"[^>]*>[\s\S]*?<\/a>/g,
      (link) =>
        link.replace(
          /(<div class="rt-button-text[^"]*">)[^<]+/g,
          (_tag, prefix) => prefix + esc(text('primary-cta')),
        ),
    );
  mainContent = mainContent
    .replace(/__AV_LINK_(\w+)__/g, (_match, target) => esc(path(target)))
    .replace(/__AV_INQUIRY_FORM__/g, () => formHtml)
    .replace(/__AV_ADDRESS__/g, () =>
      esc(
        draft.company.address ||
          (demo ? '410 Sandtown, California 94001, USA' : 'Contact us for location details'),
      ),
    )
    .replace(/__AV_NAME__/g, () => esc(name))
    .replace(/__AV_YEAR__/g, String(new Date().getFullYear()))
    .replace(/__AV_EMAIL__/g, () => esc(draft.company.email || (demo ? 'info@auravell.com' : '')))
    .replace(/__AV_PHONE__/g, () => esc(draft.company.phone || (demo ? '(888) 456 7890' : '')))
    .replace(/__AV_LANGUAGES__/g, () => (draft.languages.length > 1 ? ctx.languageLinks : ''));
  // Preserve layout while applying explicit desktop/mobile material crops.
  mainContent = mainContent.replace(
    /<img\b[^>]*data-wr-material-image="([^"]+)"[^>]*>/g,
    (tag, id: string) => {
      const b = draft.materials?.imageBindings.find(
        (b) => b.slotId === id && (!b.productId || b.productId === selected?.id),
      );
      if (!b || !ctx.asset(b.assetId)) return tag;
      const pt = b.focalPoint || { x: 0.5, y: 0.5 },
        mp = b.mobileFocalPoint || pt;
      const crop = `object-fit:${b.fit} !important;--auravell-position:${pt.x * 100}% ${pt.y * 100}%;--auravell-mobile-position:${mp.x * 100}% ${mp.y * 100}%;`;
      let rendered = tag
        .replace(/\s(?:src|srcset|alt)="[^"]*"/g, '')
        .replace(
          />$/,
          ` src="${esc(ctx.asset(b.assetId))}" alt="${esc(b.alt[options.lang] || '')}">`,
        );
      rendered = /style="/.test(rendered)
        ? rendered.replace('style="', `style="${crop}`)
        : rendered.replace(/>$/, ` style="${crop}">`);
      return b.mobileAssetId
        ? `<picture class="auravell-picture"><source media="(max-width:600px)" srcset="${esc(ctx.asset(b.mobileAssetId))}">${rendered}</picture>`
        : rendered;
    },
  );
  const palette =
    brandAccent === '#99582a'
      ? ''
      : `.auravell{--_colors---accent-color--accent-100:${brandAccent}}.auravell .rt-button-v1:not([class*="w-variant-"]){color:${ctx.brandInk}}.auravell .rt-button-v1:not([class*="w-variant-"]) .rt-button-text{color:inherit}`;
  return `<!doctype html><html lang="${esc(options.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<link rel="stylesheet" href="/templates/auravell/css/fonts.css"><link rel="stylesheet" href="/templates/auravell/motion-v2/reference.css"><style>${auravellFixes}${referenceMotionStyles}${palette}</style></head><body class="auravell${draft.materials ? ' wr-materials-site' : ''}" data-template="auravell" data-av-page="${page}">${options.preview ? '<div class="av-preview-bar">Private preview · Inquiry sending is disabled</div>' : ''}${mainContent}<script>var __name=(value)=>value;(${referenceMotionRuntime.toString()})();(${auravellRuntime.toString()})();(${materialsRuntime.toString()})();</script></body></html>`;
}
