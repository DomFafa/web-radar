import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
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
const find = (node: Node, tag: string): Element | undefined =>
  'tagName' in node && node.tagName === tag
    ? node
    : 'childNodes' in node
      ? node.childNodes.map((child) => find(child, tag)).find(Boolean)
      : undefined;
const xml = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
/** Only allowlisted, existing HTML paths become canonical / alternate / sitemap entries. */
export function withPublicationMetadata(
  files: Record<string, string>,
  origin: string,
): Record<string, string> {
  const base = new URL(origin);
  if (base.protocol !== 'https:') throw new Error('Publication origin must be HTTPS');
  const result: Record<string, string> = {};
  const paths = Object.keys(files).filter(
    (path) => path.endsWith('.html') && path !== 'index.html',
  );
  const url = (path: string) => new URL('/' + path, base.origin).href;
  for (const [path, html] of Object.entries(files)) {
    if (!path.endsWith('.html')) continue;
    const document = parse(html),
      head = find(document, 'head');
    if (!head) {
      result[path] = html;
      continue;
    }
    const titleNode = find(head, 'title');
    const title =
      (titleNode ? text(titleNode) : text(find(document, 'h1') ?? document))
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180) || 'Website';
    const descriptionNode = head.childNodes.find(
      (node): node is Element =>
        'tagName' in node && node.tagName === 'meta' && attr(node, 'name') === 'description',
    );
    const description = (
      descriptionNode
        ? attr(descriptionNode, 'content') || ''
        : text(find(document, 'main') ?? find(document, 'body') ?? document)
    )
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);
    head.childNodes = head.childNodes.filter(
      (node) =>
        !(
          'tagName' in node &&
          ((node.tagName === 'link' &&
            ['canonical', 'alternate'].includes(attr(node, 'rel') ?? '')) ||
            (node.tagName === 'meta' &&
              (['og:title', 'og:description', 'og:url', 'og:type'].includes(
                attr(node, 'property') ?? '',
              ) ||
                attr(node, 'name') === 'description')))
        ),
    );
    const add = (tagName: string, attrs: Record<string, string>) =>
      head.childNodes.push({
        nodeName: tagName,
        tagName,
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        attrs: Object.entries(attrs).map(([name, value]) => ({ name, value })),
        childNodes: [],
        parentNode: head,
      } as Element);
    const canonical =
      path === 'index.html'
        ? url(paths.find((p) => /^en\/index.html$/.test(p)) ?? paths[0] ?? path)
        : url(path);
    add('link', { rel: 'canonical', href: canonical });
    add('meta', { name: 'description', content: description });
    add('meta', { property: 'og:title', content: title });
    add('meta', { property: 'og:description', content: description });
    add('meta', { property: 'og:url', content: canonical });
    add('meta', { property: 'og:type', content: 'website' });
    const language = path.split('/')[0],
      suffix = path.slice(language.length);
    for (const other of paths)
      if (other.slice(other.indexOf('/')) === suffix)
        add('link', { rel: 'alternate', hreflang: other.split('/')[0], href: url(other) });
    result[path] = serialize(document);
  }
  result['sitemap.xml'] =
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    paths.map((path) => `<url><loc>${xml(url(path))}</loc></url>`).join('') +
    '</urlset>';
  result['robots.txt'] = `User-agent: *\nAllow: /\nSitemap: ${base.origin}/sitemap.xml\n`;
  return result;
}
