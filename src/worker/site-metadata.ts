import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type { Draft } from '../shared/model';
import { labels } from '../templates/labels';
type Element = DefaultTreeAdapterMap['element'];
type Node = DefaultTreeAdapterMap['node'];
const attr = (node: Element, name: string) => node.attrs.find((a) => a.name === name)?.value;
const text = (node: Node): string =>
  'value' in node
    ? node.value
    : 'childNodes' in node &&
        !('tagName' in node && ['script', 'style', 'nav', 'footer'].includes(node.tagName))
      ? node.childNodes.map(text).join(' ')
      : '';
const all = (node: Node): Element[] =>
  'childNodes' in node
    ? node.childNodes.flatMap((child) => ('tagName' in child ? [child, ...all(child)] : all(child)))
    : [];
const clean = (value: string, max = 180) => value.replace(/\s+/g, ' ').trim().slice(0, max);
const xml = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const set = (node: Element, name: string, value: string) => {
  node.attrs = node.attrs.filter((a) => a.name !== name);
  node.attrs.push({ name, value });
};
export const SEO_POLICY_VERSION = 2;
export interface PublicationMetadata {
  origin?: string;
  draft?: Draft;
  assetUrl?: (id: string) => string;
}
export interface SeoReport {
  pages: number;
  issues: { path: string; message: string }[];
  externalChecks: string[];
}

/** Canonicals and alternates are derived only from actual output pages, never model URLs. */
export function withPublicationMetadata(
  files: Record<string, string>,
  origin: string,
  context: PublicationMetadata = {},
): Record<string, string> {
  const base = new URL(origin);
  if (
    base.protocol !== 'https:' ||
    base.username ||
    base.password ||
    base.pathname !== '/' ||
    base.search ||
    base.hash
  )
    throw new Error('Publication origin must be an HTTPS origin without credentials');
  const result: Record<string, string> = {};
  const paths = Object.keys(files).filter(
    (path) =>
      /^[a-z]{2}\/(?:[^?#\\]+\/)?index\.html$/.test(path) && !path.split('/').includes('..'),
  );
  const url = (path: string) => new URL('/' + path, base.origin).href;
  const titles = new Map<string, number>();
  for (const path of paths) {
    const title = all(parse(files[path])).find((node) => node.tagName === 'title');
    const value = title ? clean(text(title)) : '';
    titles.set(value, (titles.get(value) ?? 0) + 1);
  }
  for (const [path, html] of Object.entries(files)) {
    if (!path.endsWith('.html')) continue;
    const document = parse(html),
      nodes = all(document),
      head = nodes.find((n) => n.tagName === 'head')!;
    const language = path.split('/')[0] as keyof typeof labels;
    const ui = labels[language] ?? labels.en;
    const root = nodes.find((n) => n.tagName === 'html')!;
    if (paths.includes(path)) set(root, 'lang', language);
    const main =
      nodes.find((n) => n.tagName === 'main') ?? nodes.find((n) => n.tagName === 'body')!;
    const h1 = nodes.find((n) => n.tagName === 'h1');
    const product = context.draft?.products.find(
      (p) => path === `${language}/products/${encodeURIComponent(p.id)}/index.html`,
    );
    const productCopy = product?.translations?.[language] ?? product;
    const routeLabel =
      productCopy?.name ||
      (path.includes('/contact/')
        ? ui.contact
        : path.includes('/about/')
          ? ui.about
          : path.includes('/products/')
            ? ui.catalog
            : ui.home);
    const existingTitle = nodes.find((n) => n.tagName === 'title');
    const originalTitle = clean(existingTitle ? text(existingTitle) : '');
    const title =
      originalTitle && titles.get(originalTitle) === 1
        ? originalTitle
        : clean(
            [routeLabel, context.draft?.company.name || originalTitle || (h1 ? text(h1) : '')]
              .filter(Boolean)
              .join(' · '),
          );
    const descriptionNode = nodes.find(
      (n) => n.tagName === 'meta' && attr(n, 'name')?.toLowerCase() === 'description',
    );
    const existingDescription = clean(
      descriptionNode ? (attr(descriptionNode, 'content') ?? '') : '',
    );
    const paragraph = all(main).find((n) => n.tagName === 'p' && clean(text(n)).length > 30);
    const description = clean(
      productCopy?.description ||
        [routeLabel, existingDescription || (paragraph ? text(paragraph) : text(main))]
          .filter(Boolean)
          .join(' — '),
      160,
    );
    head.childNodes = head.childNodes.filter(
      (node) =>
        !(
          'tagName' in node &&
          (node.tagName === 'title' ||
            (node.tagName === 'script' && attr(node, 'data-wr-seo') !== undefined) ||
            (node.tagName === 'link' &&
              (attr(node, 'rel') === 'canonical' ||
                (attr(node, 'rel') === 'alternate' && attr(node, 'hreflang') !== undefined))) ||
            (node.tagName === 'meta' &&
              ([
                'description',
                'robots',
                'twitter:card',
                'twitter:title',
                'twitter:description',
                'twitter:image',
              ].includes(attr(node, 'name')?.toLowerCase() ?? '') ||
                ['og:title', 'og:description', 'og:url', 'og:type', 'og:image'].includes(
                  attr(node, 'property') ?? '',
                ))))
        ),
    );
    const add = (tagName: string, attrs: Record<string, string>, content?: string) => {
      const node = {
        nodeName: tagName,
        tagName,
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        attrs: Object.entries(attrs).map(([name, value]) => ({ name, value })),
        childNodes: [],
        parentNode: head,
      } as Element;
      if (content !== undefined)
        node.childNodes.push({ nodeName: '#text', value: content, parentNode: node });
      head.childNodes.push(node);
      return node;
    };
    const home = paths.find((p) => p === 'en/index.html') ?? paths[0] ?? path;
    const canonical = url(path === 'index.html' ? home : path);
    add('title', {}, title || 'Website');
    add('link', { rel: 'canonical', href: canonical });
    add('meta', { name: 'description', content: description });
    add('meta', { name: 'robots', content: 'index, follow, max-image-preview:large' });
    add('meta', { property: 'og:title', content: title });
    add('meta', { property: 'og:description', content: description });
    add('meta', { property: 'og:url', content: canonical });
    add('meta', { property: 'og:type', content: 'website' });
    add('meta', { name: 'twitter:card', content: 'summary_large_image' });
    add('meta', { name: 'twitter:title', content: title });
    add('meta', { name: 'twitter:description', content: description });
    const imageId =
      product?.imageAssetId || context.draft?.banner?.assetId || context.draft?.company.logoAssetId;
    const image = imageId && context.assetUrl ? context.assetUrl(imageId) : undefined;
    if (image && /^https:\/\//.test(image)) {
      add('meta', { property: 'og:image', content: image });
      add('meta', { name: 'twitter:image', content: image });
    }
    const suffix = path.slice(path.indexOf('/'));
    const peers = paths.filter((other) => other.slice(other.indexOf('/')) === suffix);
    for (const peer of peers)
      add('link', { rel: 'alternate', hreflang: peer.split('/')[0], href: url(peer) });
    if (peers.length)
      add('link', {
        rel: 'alternate',
        hreflang: 'x-default',
        href: url(peers.find((p) => p.startsWith('en/')) ?? peers[0]),
      });
    // Only supplied facts; B2B catalogs have no invented prices, stock, ratings or reviews.
    const graph: Record<string, unknown>[] = [];
    const company = context.draft?.company;
    if (company?.name) {
      graph.push({
        '@type': 'Organization',
        '@id': `${base.origin}/#organization`,
        name: company.name,
        url: base.origin,
      });
      graph.push({
        '@type': 'WebSite',
        '@id': `${base.origin}/#website`,
        name: company.name,
        url: base.origin,
        publisher: { '@id': `${base.origin}/#organization` },
      });
    }
    if (paths.includes(path))
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: ui.home, item: url(`${language}/index.html`) },
          ...(path === `${language}/index.html`
            ? []
            : [{ '@type': 'ListItem', position: 2, name: routeLabel, item: canonical }]),
        ],
      });
    if (product && productCopy && clean(text(main), 100000).includes(productCopy.name))
      graph.push({
        '@type': 'Product',
        name: productCopy.name,
        description: productCopy.description,
        url: canonical,
        ...(image ? { image: [image] } : {}),
        ...(product.material ? { material: product.material } : {}),
      });
    if (graph.length)
      add(
        'script',
        { type: 'application/ld+json', 'data-wr-seo': '' },
        JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e')
          .replace(/&/g, '\\u0026'),
      );
    result[path] = serialize(document);
  }
  result['sitemap.xml'] =
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    paths
      .map((path) => {
        const peers = paths.filter(
          (other) => other.slice(other.indexOf('/')) === path.slice(path.indexOf('/')),
        );
        return (
          `<url><loc>${xml(url(path))}</loc>` +
          peers
            .map(
              (peer) =>
                `<xhtml:link rel="alternate" hreflang="${peer.split('/')[0]}" href="${xml(url(peer))}"/>`,
            )
            .join('') +
          `<xhtml:link rel="alternate" hreflang="x-default" href="${xml(url(peers.find((p) => p.startsWith('en/')) ?? peers[0]))}"/></url>`
        );
      })
      .join('') +
    '</urlset>';
  result['robots.txt'] = `User-agent: *\nAllow: /\nSitemap: ${base.origin}/sitemap.xml\n`;
  return result;
}

/** A local markup audit, not a claim about indexing or real-user performance. */
export function auditSeo(files: Record<string, string>): SeoReport {
  const issues: SeoReport['issues'] = [];
  const titles = new Set<string>(),
    descriptions = new Set<string>();
  let pages = 0;
  for (const [path, html] of Object.entries(files)) {
    if (!path.endsWith('.html') || path === 'index.html') continue;
    pages++;
    const nodes = all(parse(html));
    const title = nodes.find((n) => n.tagName === 'title');
    const titleText = title ? clean(text(title)) : '';
    const description = nodes.find(
      (n) => n.tagName === 'meta' && attr(n, 'name') === 'description',
    );
    const content = description ? (attr(description, 'content') ?? '') : '';
    const issue = (message: string) => issues.push({ path, message });
    if (!titleText || titles.has(titleText)) issue('标题缺失或与其他页面重复');
    else if (titleText.length > 70) issue('标题较长，建议精简以减少搜索结果截断');
    titles.add(titleText);
    if (!content || descriptions.has(content)) issue('页面描述缺失或重复，建议补充独立文案');
    descriptions.add(content);
    if (nodes.filter((n) => n.tagName === 'h1').length !== 1)
      issue('建议页面保留一个清晰的 H1 主标题');
    const missing = nodes.filter((n) => n.tagName === 'img' && attr(n, 'alt') === undefined).length;
    if (missing) issue(`${missing} 张图片缺少 Alt 属性；装饰图可使用空说明`);
    if (!nodes.some((n) => n.tagName === 'link' && attr(n, 'rel') === 'canonical'))
      issue('缺少 canonical');
    if (!nodes.some((n) => n.tagName === 'link' && attr(n, 'hreflang') === 'x-default'))
      issue('缺少默认语言入口');
  }
  return {
    pages,
    issues,
    externalChecks: [
      '发布后在 Google Search Console 验证域名并提交 /sitemap.xml，检查实际收录。',
      '使用 PageSpeed Insights 检查移动与桌面性能；LCP ≤ 2.5 秒、INP ≤ 200 毫秒、CLS ≤ 0.1 需要真实访问数据验证。',
      '检查翻译质量、图片裁切、内容真实性及结构化数据；本站检查不等于排名或富媒体结果保证。',
    ],
  };
}
