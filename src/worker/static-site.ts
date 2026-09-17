import { bannerPageFromPath } from '../shared/banner-config';
import { withBanner } from '../shared/banner';
import type { Draft, Language } from '../shared/model';
import { withFavicon } from '../shared/favicon';
import { sanitizeGeneratedHtml } from './site-safety';
import { plannedPages } from '../shared/site-brief';
import { publicAssetReferences, requireCondition } from './domain';

const escape = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const segment = (s: string) =>
  encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
export function siteFilePath(lang: Language, page: string, productId?: string): string {
  return `${lang}/${page === 'home' ? '' : page === 'detail' ? `products/${segment(productId ?? '')}/` : page === 'catalog' ? 'products/' : `${page}/`}index.html`;
}
export function validateSiteFiles(
  input: unknown,
  draft: Draft,
): asserts input is Record<string, string> {
  requireCondition(
    input && typeof input === 'object' && !Array.isArray(input),
    502,
    'site_files_invalid',
    '网站生成服务没有返回可用文件。',
  );
  const files = input as Record<string, unknown>;
  const required = draft.languages.flatMap((lang) => [
    ...plannedPages(draft)
      .filter((page) => page !== 'detail')
      .map((page) => siteFilePath(lang, page)),
    ...draft.products.map((product) => siteFilePath(lang, 'detail', product.id)),
  ]);
  const allowed = new Set([...required, 'index.html']);
  const assetIds = new Set(
    publicAssetReferences({ ...draft, siteDesign: draft.siteDesign ?? { revision: 0, pages: {} } }),
  );
  requireCondition(
    required.every((key) => typeof files[key] === 'string'),
    502,
    'site_pages_missing',
    '生成的网站缺少必要页面或产品详情页。',
  );
  let total = 0;
  for (const [key, html] of Object.entries(files)) {
    requireCondition(
      allowed.has(key) &&
        typeof html === 'string' &&
        html.length > 50 &&
        new TextEncoder().encode(html).length <= 1_000_000 &&
        /<html[\s>]/i.test(html),
      502,
      'site_files_invalid',
      '网站文件路径或内容无效。',
    );
    total += new TextEncoder().encode(html).length;
    for (const match of html.matchAll(/__WR_ASSET_([^<>"\s]+?)__/g))
      requireCondition(
        assetIds.has(match[1]),
        502,
        'site_asset_invalid',
        '网站引用了不属于当前产品的素材。',
      );
  }
  requireCondition(
    total <= 8 * 1024 * 1024,
    502,
    'site_files_large',
    '生成的网站文件超过大小限制。',
  );
}
export function materializeSiteFiles(
  files: Record<string, string>,
  draft: Draft,
  options: {
    assetUrl: (id: string) => string;
    inquiryUrl: string;
    basePath?: string;
  },
): Record<string, string> {
  validateSiteFiles(files, draft);
  const result: Record<string, string> = {};
  const asset = publicAssetReferences(draft)[0];
  const origin = new URL(
    asset ? options.assetUrl(asset) : options.inquiryUrl,
    'https://preview.invalid',
  ).origin;
  const policy = `default-src 'none'; img-src 'self' ${origin} data:; media-src 'self' ${origin}; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self' ${origin}; font-src data:; form-action 'self' ${origin}; base-uri 'none'`;
  for (const [key, html] of Object.entries(files)) {
    result[key] = sanitizeGeneratedHtml(html, options.inquiryUrl)
      .replace(/__WR_ASSET_([^<>"\s]+?)__/g, (_, id) => escape(options.assetUrl(id)))
      .replaceAll('__WR_INQUIRY__', escape(options.inquiryUrl))
      .replace(
        /href=(['"])\/(en|de|fr|es|pt|it)\//g,
        (_, quote, lang) => `href=${quote}${options.basePath ?? ''}/${lang}/`,
      )
      .replace(
        /<head(?:\s[^>]*)?>/i,
        (head) => `${head}<meta http-equiv="Content-Security-Policy" content="${escape(policy)}">`,
      );
  }
  result['index.html'] =
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=en/"><title>${escape(draft.company.name)}</title></head><body><a href="en/">${escape(draft.company.name)}</a></body></html>`;
  requireCondition(
    Object.values(result).every((html) => new TextEncoder().encode(html).length <= 1_000_000),
    502,
    'site_page_large',
    '生成的网页超过发布大小限制，请简化设计后重新生成。',
  );
  return Object.fromEntries(Object.entries(result).map(([path, html]) => [path, withBanner(withFavicon(html, draft, options.assetUrl), draft, options.assetUrl, bannerPageFromPath(path) ?? false)]));
}
