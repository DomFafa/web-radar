import type { Draft, Language, Product, TemplateId } from '../../shared/model';
import { labels } from '../labels';

export interface RenderOptions {
  projectId: string;
  lang: Language;
  page: string;
  productId?: string;
  assetUrl: (id: string) => string;
  imageVariants?: (id: string, widths: number[], includeOriginal?: boolean) => {url: string; width: number; height: number}[] | undefined;
  inquiryUrl: string;
  preview?: boolean;
}

export const esc = (value: unknown): string =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

export const json = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

export function safeUrl(value: string, blob = false): string {
  try {
    if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return value;
    const u = new URL(value);
    if (u.username || u.password) return '';
    if (
      u.protocol === 'https:' ||
      (u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)) ||
      (blob && u.protocol === 'blob:')
    )
      return u.href;
  } catch {}
  return '';
}

export function segment(id: string): string {
  if (!id || id === '.' || id === '..') return 'default';
  return encodeURIComponent(id).replace(/\./g, '%2E');
}

export const productPath = (id: string) => `products/${segment(id)}/index.html`;

export interface ThemeContext {
  draft: Draft;
  options: RenderOptions;
  lang: Language;
  ui: (typeof labels)['en'];
  page: string;
  depth: string;
  path: (p: string) => string;
  navPath: (p: string) => string;
  navAttrs: (p: string, id?: string) => string;
  navLink: (p: string, label: string) => string;
  asset: (id?: string) => string;
  translateProduct: (p: Product) => { name: string; description: string };
  mainProduct?: Product;
  defaultProductImage: string;
  productMainImage: (p?: Product) => string;
  color: string;
  brandInk: string;
  socials: string;
  languageLinks: string;
  brandLogo: string;
  inquiryFormHtml: string;
}

export function buildThemeContext(draft: Draft, options: RenderOptions): ThemeContext {
  const lang = draft.languages.includes(options.lang) ? options.lang : 'en';
  const ui = labels[lang];
  const page = ['home', 'catalog', 'detail', 'about', 'contact'].includes(options.page)
    ? options.page
    : 'home';
  const depth = page === 'home' ? '' : page === 'detail' ? '../../' : '../';
  const path = (p: string) => `${depth}${p}`;
  const navPath = (p: string) => (p === 'home' ? 'index.html' : `${p}/index.html`);
  const navAttrs = (p: string, id?: string) =>
    `data-wr-page="${p}"${id ? ` data-wr-product-id="${esc(id)}"` : ''}`;
  const navLink = (p: string, label: string) =>
    `<a href="${path(navPath(p))}" ${navAttrs(p)}${p === page ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
  const asset = (id?: string) => (id ? safeUrl(options.assetUrl(id), options.preview) : '');
  const color = /^#[0-9a-f]{6}$/i.test(draft.brandColor) ? draft.brandColor : '#2563eb';

  const channels = [1, 3, 5]
    .map((i) => parseInt(color.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const brandInk =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179
      ? '#0f172a'
      : '#ffffff';

  const translateProduct = (p: Product) => ({
    name: p.translations?.[lang]?.name ?? p.name,
    description: p.translations?.[lang]?.description ?? (lang === 'en' ? p.description : ''),
  });

  const mainProduct =
    draft.products.find((p) => p.id === draft.primaryProductId) ?? draft.products[0];
  const defaultProductImage =
    asset(mainProduct?.imageAssetId) ||
    asset(draft.products.find((p) => p.imageAssetId)?.imageAssetId) ||
    '';
  const productMainImage = (p?: Product) =>
    (p && asset(p.imageAssetId)) || defaultProductImage;

  const socials = (['linkedin', 'facebook', 'instagram', 'x'] as const)
    .map((k) => {
      const url = safeUrl(draft.company[k] || '');
      return url
        ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${k === 'linkedin' ? 'LinkedIn' : k === 'x' ? 'X' : k === 'facebook' ? 'Facebook' : 'Instagram'}</a>`
        : '';
    })
    .join('');

  const languageLinks = draft.languages
    .map((l) => {
      const activeProductId = options.productId || draft.primaryProductId || draft.products[0]?.id;
      const target =
        page === 'detail'
          ? (activeProductId ? productPath(activeProductId) : navPath('catalog'))
          : navPath(page);
      return `<a href="${depth}../${l}/${target}" lang="${l}" data-wr-lang="${l}" aria-current="${l === lang}">${l.toUpperCase()}</a>`;
    })
    .join('');

  const logo = asset(draft.company.logoAssetId);
  const brandLogo = logo
    ? `<img src="${esc(logo)}" alt="${esc(draft.company.name)}">`
    : esc(draft.company.name);

  const inquiryFormHtml = `
    <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" class="form-grid">
      <label class="field">${esc(ui.name)}<input name="name" autocomplete="name" required maxlength="120" placeholder="${esc(ui.name)}"></label>
      <label class="field">${esc(ui.email)}<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label>
      <label class="field full">${esc(ui.company)} (${esc(ui.optional)})<input name="company" autocomplete="organization" maxlength="200"></label>
      <label class="field full">${esc(ui.product)} (${esc(ui.optional)})<select name="productId"><option value="">—</option>${draft.products.map((p) => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(translateProduct(p).name)}</option>`).join('')}</select></label>
      <label class="field full">${esc(ui.message)}<textarea name="message" required maxlength="5000" rows="5" placeholder="${esc(ui.message)}"></textarea></label>
      <div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="button" type="submit"${options.preview ? ' disabled' : ''}>${esc(ui.send)} ↗</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>`;

  return {
    draft,
    options,
    lang,
    ui,
    page,
    depth,
    path,
    navPath,
    navAttrs,
    navLink,
    asset,
    translateProduct,
    mainProduct,
    defaultProductImage,
    productMainImage,
    color,
    brandInk,
    socials,
    languageLinks,
    brandLogo,
    inquiryFormHtml,
  };
}
