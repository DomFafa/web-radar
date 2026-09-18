import { referenceOverrides } from './referenceStyles';
import { referenceInteractions } from './referenceInteractions';
import { referenceLayouts } from './referenceLayouts';
import { buildThemeContext, esc, productPath, type RenderOptions, type ThemeContext } from './types';
import type { Draft } from '../../shared/model';
import { materialProductImage, materialsReferenceBody, materialsSeo, materialsThemeStyle } from '../materials-render';
import { themeStyles } from './styles';
import { renderSaasAbout, renderSaasContact, renderSaasCatalog, renderSaasDetail } from './saasAutomation';
import { renderFintechAbout, renderFintechContact, renderFintechCatalog, renderFintechDetail } from './fintechPlatform';
import { renderMarketingAbout, renderMarketingContact, renderMarketingCatalog, renderMarketingDetail } from './digitalMarketing';
import { renderAccountingAbout, renderAccountingContact, renderAccountingCatalog, renderAccountingDetail } from './portoAccounting';
import { renderCraftoAbout, renderCraftoContact, renderCraftoCatalog, renderCraftoDetail } from './craftoCorporate';
import { renderToysAbout, renderToysContact, renderToysCatalog, renderToysDetail } from './junoToys';
import { renderAiAgencyAbout, renderAiAgencyContact, renderAiAgencyCatalog, renderAiAgencyDetail } from './corpoxAiAgency';
import { renderConsultingAbout, renderConsultingContact, renderConsultingCatalog, renderConsultingDetail } from './corpoxConsulting';

export type ReferenceTemplateId = keyof typeof referenceLayouts;
export const isReferenceTemplate = (id: string): id is ReferenceTemplateId =>
  Object.hasOwn(referenceLayouts, id);

const palettes: Record<
  ReferenceTemplateId,
  { accent: string; ink: string; surface: string; font: string }
> = {
  'saas-automation': { accent: '#bef264', ink: '#1a1a1c', surface: '#f5f7f2', font: 'Inter Tight' },
  'fintech-platform': {
    accent: '#1c49a7',
    ink: '#172b4d',
    surface: '#edf2ff',
    font: 'Inter Tight',
  },
  'digital-marketing': {
    accent: '#202020',
    ink: '#202020',
    surface: '#f5f5f5',
    font: 'Inter Tight',
  },
  'porto-accounting': { accent: '#d90a2c', ink: '#262626', surface: '#fdf1f3', font: 'Lexend' },
  'crafto-corporate': {
    accent: '#5758df',
    ink: '#23253d',
    surface: '#f4f5fa',
    font: 'Plus Jakarta Sans',
  },
  'juno-toys': { accent: '#267cce', ink: '#172849', surface: '#eff7fb', font: 'Quicksand' },
  'corpox-ai-agency': {
    accent: '#ef6464',
    ink: '#161616',
    surface: '#fff3f2',
    font: 'Plus Jakarta Sans',
  },
  'corpox-consulting': {
    accent: '#805af5',
    ink: '#181825',
    surface: '#f6f4ff',
    font: 'Plus Jakarta Sans',
  },
};

// Animation libraries on the reference sites hide content until they execute. Our
// templates expose that content immediately and use a small, first-party runtime.

function renderThemePageContent(id: ReferenceTemplateId, ctx: ThemeContext): string {
  switch (id) {
    case 'saas-automation':
      if (ctx.options.page === 'about') return renderSaasAbout(ctx);
      if (ctx.options.page === 'contact') return renderSaasContact(ctx);
      if (ctx.options.page === 'catalog') return renderSaasCatalog(ctx);
      if (ctx.options.page === 'detail') return renderSaasDetail(ctx);
      break;
    case 'fintech-platform':
      if (ctx.options.page === 'about') return renderFintechAbout(ctx);
      if (ctx.options.page === 'contact') return renderFintechContact(ctx);
      if (ctx.options.page === 'catalog') return renderFintechCatalog(ctx);
      if (ctx.options.page === 'detail') return renderFintechDetail(ctx);
      break;
    case 'digital-marketing':
      if (ctx.options.page === 'about') return renderMarketingAbout(ctx);
      if (ctx.options.page === 'contact') return renderMarketingContact(ctx);
      if (ctx.options.page === 'catalog') return renderMarketingCatalog(ctx);
      if (ctx.options.page === 'detail') return renderMarketingDetail(ctx);
      break;
    case 'porto-accounting':
      if (ctx.options.page === 'about') return renderAccountingAbout(ctx);
      if (ctx.options.page === 'contact') return renderAccountingContact(ctx);
      if (ctx.options.page === 'catalog') return renderAccountingCatalog(ctx);
      if (ctx.options.page === 'detail') return renderAccountingDetail(ctx);
      break;
    case 'crafto-corporate':
      if (ctx.options.page === 'about') return renderCraftoAbout(ctx);
      if (ctx.options.page === 'contact') return renderCraftoContact(ctx);
      if (ctx.options.page === 'catalog') return renderCraftoCatalog(ctx);
      if (ctx.options.page === 'detail') return renderCraftoDetail(ctx);
      break;
    case 'juno-toys':
      if (ctx.options.page === 'about') return renderToysAbout(ctx);
      if (ctx.options.page === 'contact') return renderToysContact(ctx);
      if (ctx.options.page === 'catalog') return renderToysCatalog(ctx);
      if (ctx.options.page === 'detail') return renderToysDetail(ctx);
      break;
    case 'corpox-ai-agency':
      if (ctx.options.page === 'about') return renderAiAgencyAbout(ctx);
      if (ctx.options.page === 'contact') return renderAiAgencyContact(ctx);
      if (ctx.options.page === 'catalog') return renderAiAgencyCatalog(ctx);
      if (ctx.options.page === 'detail') return renderAiAgencyDetail(ctx);
      break;
    case 'corpox-consulting':
      if (ctx.options.page === 'about') return renderConsultingAbout(ctx);
      if (ctx.options.page === 'contact') return renderConsultingContact(ctx);
      if (ctx.options.page === 'catalog') return renderConsultingCatalog(ctx);
      if (ctx.options.page === 'detail') return renderConsultingDetail(ctx);
      break;
  }
  return '';
}

function enrichSliderSlides(
  id: ReferenceTemplateId,
  html: string,
  ctx: ThemeContext,
  draft: Draft,
): string {
  const { ui, path, navPath, translateProduct } = ctx;
  const products = draft.products;
  const customSlides = draft.banners?.find((b) => b.targets.includes('home'))?.slides;

  // Slide 2 content
  const p1 = products[1];
  const s2Headline = esc(
    customSlides?.[1]?.headline ||
      (p1 ? translateProduct(p1).name : 'Certified Excellence & Global Standards'),
  );
  const s2Desc = esc(
    customSlides?.[1]?.subtitle ||
      (p1 && translateProduct(p1).description
        ? translateProduct(p1).description
        : 'Premium eco-friendly engineering, verified certifications, and dedicated support for international partners.'),
  );
  const s2Btn = esc(
    customSlides?.[1]?.buttonText ||
      (p1 ? ui.discover : ui.catalog),
  );
  const s2Link = esc(
    customSlides?.[1]?.buttonUrl ||
      (p1 ? path(productPath(p1.id)) : path(navPath('catalog'))),
  );
  const s2Page = customSlides?.[1]?.buttonUrl ? '' : 'catalog';

  // Slide 3 content
  const p2 = products[2];
  const s3Headline = esc(
    customSlides?.[2]?.headline ||
      (p2 ? translateProduct(p2).name : 'Global Export & OEM/ODM Solutions'),
  );
  const s3Desc = esc(
    customSlides?.[2]?.subtitle ||
      (p2 && translateProduct(p2).description
        ? translateProduct(p2).description
        : 'Flexible manufacturing, comprehensive OEM/ODM customization, and reliable worldwide logistics.'),
  );
  const s3Btn = esc(
    customSlides?.[2]?.buttonText ||
      ui.contact,
  );
  const s3Link = esc(
    customSlides?.[2]?.buttonUrl ||
      path(navPath('contact')),
  );
  const s3Page = 'contact';

  if (id === 'juno-toys') {
    html = html.replace(
      /('background-image:url\("\/templates\/references\/e4712462d424bf565483\.jpg"\)'>)<div class="wr-juno-copy">[\s\S]*?<\/div>/,
      `$1<div class="wr-juno-copy"><h2>${s2Headline}</h2><p>${s2Desc}</p><a data-wr-page="${s2Page}" href="${s2Link}">${s2Btn}</a></div>`,
    );
    html = html.replace(
      /('background-image:url\("\/templates\/references\/05736a422598adb22258\.jpg"\)'>)<div class="wr-juno-copy">[\s\S]*?<\/div>/,
      `$1<div class="wr-juno-copy"><h2>${s3Headline}</h2><p>${s3Desc}</p><a data-wr-page="${s3Page}" href="${s3Link}">${s3Btn}</a></div>`,
    );
  } else if (id === 'crafto-corporate') {
    const s2Tag = 'GLOBAL ENTERPRISE SOLUTIONS';
    const s3Tag = 'TRUSTED INDUSTRY PARTNER';
    html = html.replace(
      /('background-image:url\("\/templates\/references\/5f172b03aba98346001c\.jpg"\)'>[\s\S]*?<div class="wr-crafto-copy">)[\s\S]*?(<\/div>)/,
      `$1<span>${s2Tag}</span><h2>${s2Headline}</h2><p>${s2Desc}</p><a data-wr-page="${s2Page}" href="${s2Link}">${s2Btn}</a>$2`,
    );
    html = html.replace(
      /('background-image:url\("\/templates\/references\/956570cbc08ae1256009\.jpg"\)'>[\s\S]*?<div class="wr-crafto-copy">)[\s\S]*?(<\/div>)/,
      `$1<span>${s3Tag}</span><h2>${s3Headline}</h2><p>${s3Desc}</p><a data-wr-page="${s3Page}" href="${s3Link}">${s3Btn}</a>$2`,
    );
  } else if (id === 'corpox-consulting') {
    const s2Tag = 'STRATEGIC ADVISORY & PERFORMANCE';
    const s3Tag = 'WORLD-CLASS CONSULTING EXPERTISE';
    html = html.replace(
      /(bg_image--13[\s\S]*?<div class="inner text-left">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/,
      `$1<h6 class="tag-title">${s2Tag}</h6><h2 class="title display-one">${s2Headline}</h2><p class="mb--40 b1">${s2Desc}</p><div class="read-more-btn"><a class="tmp-btn btn-large round hover-icon-reverse" data-wr-page="${s2Page}" href="${s2Link}"><span class="icon-reverse-wrapper"><span class="btn-text">${s2Btn}</span><span class="btn-icon"><i class="feather-arrow-right"></i></span><span class="btn-icon"><i class="feather-arrow-right"></i></span></span></a></div>$2`,
    );
    html = html.replace(
      /(bg_image--19[\s\S]*?<div class="inner text-left">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/,
      `$1<h6 class="tag-title">${s3Tag}</h6><h2 class="title display-one">${s3Headline}</h2><p class="mb--40 b1">${s3Desc}</p><div class="read-more-btn"><a class="tmp-btn btn-large round hover-icon-reverse" data-wr-page="${s3Page}" href="${s3Link}"><span class="icon-reverse-wrapper"><span class="btn-text">${s3Btn}</span><span class="btn-icon"><i class="feather-arrow-right"></i></span><span class="btn-icon"><i class="feather-arrow-right"></i></span></span></a></div>$2`,
    );
  }
  return html;
}

export function renderReferencePage(
  draft: Draft,
  options: RenderOptions,
  innerContent: string,
  formScript: string,
): string {
  const id = draft.template as ReferenceTemplateId;
  const layout = referenceLayouts[id];
  const ctx = buildThemeContext(draft, options);
  const { ui, lang, path, navPath, navAttrs, translateProduct, asset, productMainImage, defaultProductImage } = ctx;
  const palette = draft.materials?{...palettes[id],accent:draft.materials.visual.palette.primary,ink:draft.materials.visual.palette.text,surface:draft.materials.visual.palette.surface}:palettes[id];
  const products = [...draft.products].sort(
    (a, b) => Number(b.id === draft.primaryProductId) - Number(a.id === draft.primaryProductId),
  );
  const pictured = products.filter((p) => asset(p.imageAssetId));
  const copy = draft.copy[lang];
  const headline = copy?.headline || draft.company.slogan || draft.company.name;
  const words = headline.split(/\s+/);
  const styledHeadline =
    id === 'corpox-ai-agency'
      ? esc(words.slice(0, -3).join(' ')) +
        ' <br> ' +
        esc(words.slice(-3, -1).join(' ')) +
        ' <span class="wr-emphasis">' +
        esc(words.at(-1)) +
        '</span>'
      : id === 'corpox-consulting' && words.length > 3
        ? esc(words.slice(0, -2).join(' ')) +
          ' <br> <span>' +
          esc(words.at(-2)) +
          '</span> ' +
          esc(words.at(-1))
        : esc(headline);
  const tokens: Record<string, string> = {
    BRAND: ctx.brandLogo,
    HEADLINE: styledHeadline,
  };
  for (const page of ['home', 'catalog', 'about', 'contact'] as const) {
    tokens[page.toUpperCase()] = esc(path(navPath(page)));
    tokens['LABEL_' + page.toUpperCase()] = esc(ui[page]);
  }
  layout.slots.forEach((slot, i) => {
    const product = pictured[i % pictured.length] || draft.products[i % draft.products.length];
    const imgSrc = (product && productMainImage(product)) || defaultProductImage || slot.src;
    tokens['IMAGE_' + i] = esc(imgSrc);
    tokens['ALT_' + i] = esc(product ? translateProduct(product).name : slot.alt);
  });
  let body = (draft.materials?materialsReferenceBody(draft,options):layout.html).replace(/__WR_([A-Z_0-9]+)__/g, (_, key: string) => tokens[key] ?? '');
  if (pictured.length)
    body = body.replace(/data-wr-product-slot="(\d+)"/g, '$& data-wr-bound-product="true"');
  if (options.page === 'home') {
    body = enrichSliderSlides(id, body, ctx, draft);
  }
  const cards = `<section class="wr-products" aria-label="${esc(ui.catalog)}"><div class="wr-section-title"><h2>${esc(ui.catalog)}</h2><a href="${path(navPath('catalog'))}" ${navAttrs('catalog')}>${esc(ui.discover)} ↗</a></div><div class="wr-product-grid">${products.map((p) => `<article class="wr-product-card"><a href="${esc(path(productPath(p.id)))}" ${navAttrs('detail', p.id)}>${materialProductImage(draft,options,p)??(productMainImage(p) ? `<img src="${esc(productMainImage(p))}" alt="${esc(translateProduct(p).name)}" loading="lazy">` : '')}<h3>${esc(translateProduct(p).name)}</h3></a><p>${esc(translateProduct(p).description)}</p><a class="wr-details" href="${esc(path(productPath(p.id)))}" ${navAttrs('detail', p.id)}>${esc(ui.details)} ↗</a></article>`).join('')}</div></section>`;
  if (options.page !== 'home') {
    const header = body.match(/<header\b[\s\S]*?<\/header>/)?.[0] || '';
    const footer = body.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] || '';
    const richContent = renderThemePageContent(id, ctx);
    body =
      header +
      `<main class="wr-inner wr-${id}-inner" data-wr-page="${esc(options.page)}">${
        richContent ||
        `<div class="wr-inner-title"><h1>${esc(
          options.page === 'detail'
            ? translateProduct(
                products.find((p) => p.id === options.productId) ||
                  products[0] ||
                  ({ name: ui.product, description: '' } as Draft['products'][number]),
              ).name
            : ui[options.page as 'catalog' | 'about' | 'contact'],
        )}</h1></div><div class="wr-inner-body">${innerContent
          .replace(/<h1\b/g, '<h2')
          .replace(/<\/h1>/g, '</h2>')}</div>`
      }</main>` +
      footer;
  } else if (products.length) {
    body = body.includes('<footer') ? body.replace('<footer', cards + '<footer') : body + cards;
  }
  if (id === 'saas-automation' && options.page === 'home')
    body = body.replace(
      '</video>',
      '</video><button id="video-toggle" type="button" class="wr-video-toggle" aria-label="Pause video">Ⅱ</button>',
    );
  body += `<details class="wr-mobile-nav"><summary aria-label="${esc(ui.menu)}">☰</summary><nav>${(['home', 'catalog', 'about', 'contact'] as const).map((p) => ctx.navLink(p, ui[p])).join('')}${ctx.languageLinks}</nav></details>`;
  const staticOrigin =
    !options.preview && /^https?:/.test(options.inquiryUrl)
      ? new URL(options.inquiryUrl).origin
      : '';
  const localize = (s: string) =>
    staticOrigin ? s.replace(/(["'(])\/templates\//g, `$1${staticOrigin}/templates/`) : s;
  const seo=materialsSeo(draft,options);
  return localize(
    `<!doctype html><html lang="${lang}" class="${esc(layout.htmlClass)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(seo?.title??draft.company.name)}</title><meta name="description" content="${esc(seo?.description??(copy?.subtitle || draft.company.description))}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}${layout.css.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}<style>${referenceOverrides}\n${themeStyles}</style>${materialsThemeStyle(draft)}</head><body class="${esc(layout.bodyClass)} ${id} wr-reference${draft.materials?' wr-materials-site':''}" data-template="${id}" style="--wr-accent:${palette.accent};--wr-ink:${palette.ink};--wr-surface:${palette.surface};--wr-font:'${palette.font}'">${body}<script>${formScript};(${referenceInteractions.toString()})();</script></body></html>`,
  );
}
