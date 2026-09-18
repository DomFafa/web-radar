import { referenceOverrides } from './referenceStyles';
import { referenceInteractions } from './referenceInteractions';
import { referenceLayouts } from './referenceLayouts';
import { buildThemeContext, esc, productPath, type RenderOptions } from './types';
import type { Draft } from '../../shared/model';
import { materialProductImage, materialsReferenceBody, materialsSeo, materialsThemeStyle } from '../materials-render';

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

export function renderReferencePage(
  draft: Draft,
  options: RenderOptions,
  innerContent: string,
  formScript: string,
): string {
  const id = draft.template as ReferenceTemplateId;
  const layout = referenceLayouts[id];
  const ctx = buildThemeContext(draft, options);
  const { ui, lang, path, navPath, navAttrs, translateProduct, asset } = ctx;
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
    const product = pictured[i % pictured.length];
    tokens['IMAGE_' + i] = esc(product ? asset(product.imageAssetId) : slot.src);
    tokens['ALT_' + i] = esc(product ? translateProduct(product).name : slot.alt);
  });
  let body = (draft.materials?materialsReferenceBody(draft,options):layout.html).replace(/__WR_([A-Z_0-9]+)__/g, (_, key: string) => tokens[key] ?? '');
  if (pictured.length)
    body = body.replace(/data-wr-product-slot="(\d+)"/g, '$& data-wr-bound-product="true"');
  const cards = `<section class="wr-products" aria-label="${esc(ui.catalog)}"><div class="wr-section-title"><h2>${esc(ui.catalog)}</h2><a href="${path(navPath('catalog'))}" ${navAttrs('catalog')}>${esc(ui.discover)} ↗</a></div><div class="wr-product-grid">${products.map((p) => `<article class="wr-product-card"><a href="${esc(path(productPath(p.id)))}" ${navAttrs('detail', p.id)}>${materialProductImage(draft,options,p)??(asset(p.imageAssetId) ? `<img src="${esc(asset(p.imageAssetId))}" alt="${esc(translateProduct(p).name)}" loading="lazy">` : '')}<h3>${esc(translateProduct(p).name)}</h3></a><p>${esc(translateProduct(p).description)}</p><a class="wr-details" href="${esc(path(productPath(p.id)))}" ${navAttrs('detail', p.id)}>${esc(ui.details)} ↗</a></article>`).join('')}</div></section>`;
  if (options.page !== 'home') {
    const header = body.match(/<header\b[\s\S]*?<\/header>/)?.[0] || '';
    const footer = body.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] || '';
    body =
      header +
      `<main class="wr-inner"><div class="wr-inner-title"><h1>${esc(options.page === 'detail' ? translateProduct(products.find((p) => p.id === options.productId) || products[0] || ({ name: ui.product, description: '' } as Draft['products'][number])).name : ui[options.page as 'catalog' | 'about' | 'contact'])}</h1></div><div class="wr-inner-body">${innerContent.replace(/<h1\b/g, '<h2').replace(/<\/h1>/g, '</h2>')}</div></main>` +
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
    `<!doctype html><html lang="${lang}" class="${esc(layout.htmlClass)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(seo?.title??draft.company.name)}</title><meta name="description" content="${esc(seo?.description??(copy?.subtitle || draft.company.description))}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}${layout.css.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}<style>${referenceOverrides}</style>${materialsThemeStyle(draft)}</head><body class="${esc(layout.bodyClass)} ${id} wr-reference${draft.materials?' wr-materials-site':''}" data-template="${id}" style="--wr-accent:${palette.accent};--wr-ink:${palette.ink};--wr-surface:${palette.surface};--wr-font:'${palette.font}'">${body}<script>${formScript};(${referenceInteractions.toString()})();</script></body></html>`,
  );
}
