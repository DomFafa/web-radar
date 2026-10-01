import type { Draft, Product } from '../../shared/model';
import { displayProducts } from '../../shared/product-display';
import { materialsRuntime } from '../../shared/materials-runtime';
import { buildThemeContext, esc, productPath, type RenderOptions } from './types';
import { careflowSnapshots } from './careflow/snapshots';
import { careflowReferenceStyles } from './careflow/styles';
import { careflowOverrides } from './careflow/overrides';
import { careflowTexts, careflowExampleServices } from './careflow/inventory';
import { referenceMotionRuntime } from './reference-motion';
import { referenceMotionStyles } from './reference-motion-styles';
import { careflowRuntime } from './careflow/runtime';
export { careflowRuntime, careflowExampleServices };
const region = (html: string, key: string, content: string) =>
  html.replace(
    new RegExp(`<!--CF_${key}_START-->[\\s\\S]*?<!--CF_${key}_END-->`, 'g'),
    () => content,
  );
const textIds = new Set(careflowTexts.map((slot) => slot.id));
const copyRegion = (html: string, key: string, value: string) =>
  textIds.has(key)
    ? region(
        html,
        'TEXT_' + key,
        `<!--CF_TEXT_${key}_START-->${esc(value)}<!--CF_TEXT_${key}_END-->`,
      )
    : html;
const validColor = (v?: string) => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : undefined);
function ink(background: string): string {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(background.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return r * 0.2126 + g * 0.7152 + b * 0.0722 > 0.179 ? '#000000' : '#ffffff';
}

/** Dedicated renderer keeps preview, external materials and publication on the same responsive DOM. */
export function renderCareflowSite(input: Draft, options: RenderOptions): string {
  const page = careflowSnapshots[options.page] ? options.page : 'home';
  const demo = ['preview', 'materials-demo', 'careflow-demo'].includes(options.projectId);
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
  if (demo && !draft.products.length)
    draft.products = careflowExampleServices.map((p) => ({ ...p }));
  const ctx = buildThemeContext(draft, options),
    products = displayProducts(draft);
  const selected = draft.products.find((p) => p.id === options.productId) || ctx.mainProduct;
  const name = draft.company.name || (demo ? 'Careflow' : 'Our team');
  const copy = draft.copy[options.lang] || draft.copy.en;
  const path = (p: string) =>
    ctx.depth +
    (p === 'home' ? 'index.html' : p === 'detail' ? productPath(selected?.id) : `${p}/index.html`);
  const title =
    text(`${page}-seo-title`) ||
    (page === 'home'
      ? name
      : page === 'detail' && selected
        ? `${ctx.translateProduct(selected).name} · ${name}`
        : `${page[0].toUpperCase() + page.slice(1)} · ${name}`);
  const description =
    text(`${page}-seo-description`) ||
    copy?.subtitle ||
    draft.company.description ||
    'Explore our services and contact our team.';
  const form = buildThemeContext({ ...draft, products }, options)
    .inquiryFormHtml.replace('class="form-grid"', 'class="cf-inquiry" data-careflow-form')
    .replace('class="button"', 'class="primary-button"');
  const button = (p: string, label: string) =>
    `<a class="primary-button" href="${esc(path(p))}" data-wr-page="${p}">${esc(label)}</a>`;
  const cards = (items: Product[]) =>
    `<div class="cf-services" data-wr-product-list="${esc(page)}">${items
      .map((p) => {
        const value = ctx.translateProduct(p),
          photo = ctx.asset(p.imageAssetId);
        return `<article class="cf-service" data-product-card data-wr-product-card data-wr-product-id="${esc(p.id)}" data-product-name="${esc(value.name)}">${photo ? `<a href="${esc(ctx.depth + productPath(p.id))}" data-wr-page="detail" data-wr-product-id="${esc(p.id)}"><img src="${esc(photo)}" alt="${esc(value.name)}" loading="lazy" data-wr-material-image="product-main" data-wr-material-product="${esc(p.id)}"></a>` : ''}<h3>${esc(value.name)}</h3>${p.tagline ? `<p>${esc(p.tagline)}</p>` : ''}<a class="secondary-button" href="${esc(ctx.depth + productPath(p.id))}" data-wr-page="detail" data-wr-product-id="${esc(p.id)}">Learn more ↗</a></article>`;
      })
      .join('')}</div>`;
  const servicesSection = `<section class="section top-bottom-75px" id="careflow-team"><div class="container-default"><div class="mg-bottom-regular"><h2 class="display-9">${esc(text('services-headline') || 'Explore our services')}</h2></div>${products.length ? cards(products.slice(0, 8)) : `<p class="cf-empty">Contact us to discuss your requirements.</p>`}</div></section>`;
  let body = careflowSnapshots[page];
  const logo = ctx.asset(draft.company.logoAssetId);
  if (!demo || logo || !['Careflow', ''].includes(draft.company.name))
    body = region(
      body,
      'BRAND',
      `<a class="logo-link cf-brand" href="${esc(path('home'))}" data-wr-page="home">${logo ? `<img src="${esc(logo)}" alt="${esc(name)}">` : `<span class="cf-brand-cross" aria-hidden="true">✚</span><span>${esc(name)}</span>`}</a>`,
    );
  if (!demo) {
    for (const key of ['RATING', 'TESTIMONIALS', 'STATS', 'RESOURCES', 'HOSPITALS'])
      body = region(body, key, '');
    body = region(body, 'TEAM', page === 'detail' ? '' : servicesSection);
    if (page === 'catalog') {
      body = region(
        body,
        'CATALOG_0',
        `<div class="cf-catalog">${products.length ? cards(products) : '<p class="cf-empty">Services will appear here when added.</p>'}</div>`,
      );
      body = region(body, 'CATALOG_1', '');
      body = region(body, 'CATALOG_2', '');
    }
    const neutral: Record<string, string> = {
      'hero-headline': copy?.headline || draft.company.slogan || name,
      'hero-subtitle':
        copy?.subtitle || draft.company.description || 'Explore our services and talk to our team.',
      'home-copy-02': draft.company.aboutHeadline || `Get to know ${name}`,
      'home-copy-03': 'Start a conversation',
      'home-copy-04':
        'Tell us what you are looking for and ask our team about the available services.',
      'home-copy-05': 'Explore our services',
      'home-copy-06': 'Browse the service information and discuss the details that matter to you.',
      'home-copy-07': 'Plan your next step',
      'home-copy-08': 'Contact the team to confirm availability and appointment arrangements.',
      'home-copy-09': 'A closer look at our services',
      'home-copy-10': draft.company.description || 'Talk with our team about your requirements.',
      'home-copy-11': 'Find the right next step',
      'home-copy-12': 'Explore our services, then get in touch with your questions.',
      'catalog-headline': 'Our services',
      'catalog-copy-01': 'Browse our services and contact the team for details.',
      'about-headline': draft.company.aboutHeadline || `About ${name}`,
      'about-copy-01': draft.company.description || 'Learn about our work and services.',
      'about-copy-02': 'Get to know our team',
      'about-copy-03':
        draft.company.aboutStory || draft.company.description || 'Contact us to learn more.',
      'about-copy-06': 'Tell us about your needs and the support you are looking for.',
      'about-copy-08': 'Discuss the available approaches with our team.',
      'about-copy-10': 'Ask questions and confirm the details that matter to you.',
      'about-copy-12': 'Contact us about service availability and access.',
      'about-copy-14': 'Share your requirements so we can discuss the next steps together.',
      'about-copy-16': 'Review the service information and contact us for clarification.',
      'contact-copy-01': 'Send a message with your questions or appointment inquiry.',
      'contact-copy-03': 'Use the contact details below or send a message through the form.',
      'contact-copy-06': 'How can I arrange an appointment?',
      'contact-copy-07':
        'Send an inquiry. The team will confirm availability and arrangements directly.',
      'contact-copy-08': 'Can I ask about a specific service?',
      'contact-copy-09': 'Choose a service in the form and include your questions.',
      'contact-copy-10': 'Where can I find service details?',
      'contact-copy-11': 'Browse the service directory and open a service to read its details.',
      'contact-copy-12': 'What should I include in my message?',
      'contact-copy-13': 'Include your contact details and a brief description of your inquiry.',
    };
    for (const s of careflowTexts) {
      let value = neutral[s.id];
      if (s.exampleText.includes('heart of Los Angeles')) value = 'Get in touch';
      if (s.exampleText.startsWith('905 Armory'))
        value = draft.company.address || 'Contact us for location details';
      if (s.exampleText === 'Careflow') value = name;
      if (value !== undefined) body = copyRegion(body, s.id, value);
    }
    // These reference feature labels are descriptive demo content, not verified company facts.
    body = body
      .replace(
        /Private rooms &amp; suites|Sterile operating theaters|MRI &amp; CT scan units|In-house laboratory/g,
        'Ask our team for details',
      )
      .replace(/Meet our doctors|Browse all doctors|Browse all team|Our team/g, 'Our services');
  }
  if (page === 'detail' && !selected) {
    body = copyRegion(body, 'detail-headline', 'Our services');
    body = copyRegion(body, 'detail-copy-01', 'Contact the team to discuss your requirements.');
    body = region(
      body,
      'DETAIL',
      `<div class="cf-empty"><p>Service details will appear here when added.</p>${button('contact', 'Contact our team')}</div>`,
    );
  }
  if (page === 'detail' && selected) {
    const p = ctx.translateProduct(selected),
      photo = ctx.asset(selected.imageAssetId);
    body = copyRegion(body, 'detail-headline', p.name);
    body = copyRegion(
      body,
      'detail-copy-01',
      selected.tagline || 'Explore this service and contact us to discuss the details.',
    );
    const gallery = [
      { assetId: selected.imageAssetId, caption: p.name },
      ...(selected.gallery || []),
    ].filter((g, i, all) => g.assetId && all.findIndex((v) => v.assetId === g.assetId) === i);
    body = region(
      body,
      'DETAIL',
      `<div class="w-layout-grid sticky-grid-v3"><div><div class="cf-detail-gallery">${photo ? `<img id="wr-detail-main-img" src="${esc(photo)}" alt="${esc(p.name)}" loading="eager" fetchpriority="high" data-wr-material-image="product-main" data-wr-material-product="${esc(selected.id)}">` : ''}<div class="cf-thumbs senseng-detail-thumbs">${gallery.map((g, i) => `<button type="button" class="wr-detail-thumb" data-wr-material-thumb data-src="${esc(ctx.asset(g.assetId))}" aria-label="View image ${i + 1}" aria-pressed="${i === 0}"><img src="${esc(ctx.asset(g.assetId))}" alt="${esc(g.caption || p.name)}" loading="lazy"></button>`).join('')}</div></div><div class="card service-card-v5"><h2>About this service</h2><p class="cf-detail-description">${esc(p.description)}</p>${selected.sellingPoints?.length ? `<ul>${selected.sellingPoints.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}${selected.material ? `<p>${esc(selected.material)}</p>` : ''}${selected.dimensions ? `<p>${esc(selected.dimensions)}</p>` : ''}<a class="secondary-button" href="${esc(path('catalog'))}" data-wr-page="catalog">← All services</a></div></div><aside class="cf-form-card"><h2 class="display-6">Send an inquiry</h2><p>Share your questions. Our team will confirm the next steps.</p>${form}</aside></div>`,
    );
  }
  if (!demo && (text('primary-cta') || copy?.cta))
    body = region(body, 'PRIMARY_CTA', button('contact', text('primary-cta') || copy!.cta));
  // Apply the explicit copy inventory after neutral defaults. Escaping prevents HTML/CSS injection.
  for (const binding of draft.materials?.textBindings || [])
    if (binding.locale === options.lang) body = copyRegion(body, binding.slotId, binding.text);
  if (text('company-about')) body = copyRegion(body, 'about-copy-03', text('company-about')!);
  body = body.replace(/<img\b[^>]*data-careflow-image="([^"]+)"[^>]*>/g, (tag, id: string) => {
    const b = draft.materials?.imageBindings.find((b) => b.slotId === id);
    if (!b) return tag;
    const url = ctx.asset(b.assetId);
    if (!url) return tag;
    const pt = b.focalPoint || { x: 0.5, y: 0.5 },
      mp = b.mobileFocalPoint || pt,
      mobile = ctx.asset(b.mobileAssetId);
    const image = tag
      .replace(/\s(?:src|srcset|sizes|alt|style)="[^"]*"/g, '')
      .replace(
        />$/,
        ` src="${esc(url)}" alt="${esc(b.alt[options.lang] || '')}" data-wr-material-image="${esc(id)}" style="object-fit:${b.fit === 'contain' ? 'contain' : 'cover'};--cf-desktop-position:${pt.x * 100}% ${pt.y * 100}%;--cf-mobile-position:${mp.x * 100}% ${mp.y * 100}%">`,
      );
    return mobile
      ? `<picture class="cf-picture"><source media="(max-width:600px)" srcset="${esc(mobile)}">${image}</picture>`
      : image;
  });
  body = body.replace(/<a\b[^>]*data-careflow-service="([^"]+)"[^>]*>/g, (tag, id: string) =>
    tag
      .replace(
        /href="[^"]*"/,
        `href="${esc(ctx.depth + productPath(draft.products.find((p) => p.id === id)?.id || selected?.id))}"`,
      )
      .replace(
        />$/,
        ` data-wr-product-id="${esc(draft.products.find((p) => p.id === id)?.id || selected?.id)}">`,
      ),
  );
  const values: Record<string, string> = {
    INQUIRY_FORM: form,
    NAME: esc(name),
    DESCRIPTION: esc(
      draft.company.description ||
        (demo
          ? 'Patient-centered care, thoughtful facilities, and a team dedicated to your well-being.'
          : ''),
    ),
    EMAIL: esc(draft.company.email || (demo ? 'contact@careflow.com' : '')),
    PHONE: esc(draft.company.phone || (demo ? '(310) 663-6320' : '')),
    LANGUAGES: ctx.languageLinks,
    YEAR: String(new Date().getFullYear()),
  };
  body = body
    .replace(/__CF_LINK_([a-z]+)__/g, (_, p: string) => esc(path(p)))
    .replace(/__CF_([A-Z_]+)__/g, (_, key: string) => values[key] || '');
  body = body.replace(
    /Copyright © Careflow \| Designed by[\s\S]*?Powered by[^<]*/g,
    `© ${esc(name)}`,
  );
  const primary =
    validColor(draft.materials?.visual.palette.primary) ||
    (!demo ? validColor(draft.brandColor) : undefined);
  const palette = primary
    ? `.careflow-healthcare .primary-button{background:${primary};color:${ink(primary)}}.careflow-healthcare .primary-button *{color:inherit}.careflow-healthcare .cf-thumbs button[aria-pressed=true]{border-color:${primary}}`
    : '';
  return `<!doctype html><html lang="${esc(options.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${careflowReferenceStyles}\n${careflowOverrides}${referenceMotionStyles}\n${palette}</style></head><body class="careflow-healthcare${draft.materials ? ' wr-materials-site' : ''}" data-template="careflow-healthcare">${options.preview ? '<div class="cf-preview-bar">Private preview · inquiry sending is disabled</div>' : ''}${body}<script>var __name=(value)=>value;(${referenceMotionRuntime.toString()})();(${careflowRuntime.toString()})();(${materialsRuntime.toString()})();</script></body></html>`;
}
