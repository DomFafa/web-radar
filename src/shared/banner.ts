import { parse, parseFragment, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type { Draft } from './model';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const attr = (node: Element, name: string) => node.attrs.find((a) => a.name === name)?.value ?? '';
const elements = (node: Node): Element[] =>
  'childNodes' in node
    ? node.childNodes.flatMap((child) =>
        'tagName' in child ? [child, ...elements(child)] : elements(child),
      )
    : [];
const visibleText = (node: Node): string =>
  'value' in node
    ? node.value
    : 'childNodes' in node
      ? node.childNodes.map(visibleText).join('')
      : '';
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/** Apply only to the home page at render time; the original generated artifact stays intact. */
export function withBanner(
  html: string,
  draft: Draft,
  assetUrl: (id: string) => string,
  home: boolean,
): string {
  const banner = draft.banner;
  if (!home || !banner?.assetId) return html;
  const document = parse(html);
  const all = elements(document);
  if (all.some((node) => attr(node, 'data-wr-banner') === 'custom')) return html;
  const body = all.find((node) => node.tagName === 'body');
  const head = all.find((node) => node.tagName === 'head');
  if (!body || !head) return html;
  // Prefer an explicit model marker, then known top-level hero names. Never replace navigation.
  let hero =
    all.find(
      (node) =>
        ['section', 'div', 'header'].includes(node.tagName) &&
        node.attrs.some((a) => a.name === 'data-wr-hero') &&
        !elements(node).some((child) => child.tagName === 'nav'),
    ) ??
    all.find(
      (node) =>
        ['section', 'div', 'header'].includes(node.tagName) &&
        !elements(node).some((child) => child.tagName === 'nav') &&
        /(?:^|\s)(?:hero|hero-section|hero-banner|banner|banner-section|senseng-hero|senseng-hero-video-full)(?:\s|$)/i.test(
          `${attr(node, 'id')} ${attr(node, 'class')}`,
        ),
    );
  if (!hero) {
    const h1 = all.find((node) => node.tagName === 'h1');
    let parent = h1?.parentNode;
    while (parent && 'tagName' in parent && !['main', 'body'].includes(parent.tagName)) {
      if (
        parent.tagName === 'section' &&
        !elements(parent).some((node) => node.tagName === 'nav')
      ) {
        hero = parent;
        break;
      }
      parent = parent.parentNode;
    }
  }
  const src = escape(assetUrl(banner.assetId));
  const image = `<img data-wr-banner-image src="${src}" alt="${escape(banner.alt || '')}" loading="eager" fetchpriority="high" decoding="async">`;
  const fullImage = banner.mode === 'image' || !hero;
  if (!hero) {
    hero = parseFragment('<section></section>').childNodes[0] as Element;
    const main = all.find((node) => node.tagName === 'main') ?? body;
    const header = main.childNodes.findIndex(
      (node) => 'tagName' in node && node.tagName === 'header',
    );
    main.childNodes.splice(header + 1, 0, hero);
    hero.parentNode = main;
  }
  hero.attrs.push({ name: 'data-wr-banner', value: 'custom' });
  if (fullImage) {
    const heading = elements(hero).find((node) => node.tagName === 'h1');
    hero.childNodes = parseFragment(image).childNodes;
    if (heading) {
      heading.attrs = heading.attrs.filter((a) => a.name !== 'class');
      heading.attrs.push({ name: 'class', value: 'wr-banner-heading' });
      hero.childNodes.push(heading);
    }
  } else {
    // Remove old media to prevent both loading and playback underneath the chosen image.
    const strip = (node: Element) => {
      node.childNodes = node.childNodes.filter(
        (child) =>
          !('tagName' in child && ['video', 'picture', 'img', 'canvas'].includes(child.tagName)),
      );
      node.childNodes.forEach((child) => {
        if ('tagName' in child) strip(child);
      });
    };
    strip(hero);
    const cleanEmptyMedia = (node: Element) => {
      node.childNodes = node.childNodes.filter(
        (child) =>
          !(
            'tagName' in child &&
            (attr(child, 'id') === 'video-toggle' ||
              (child.tagName === 'figure' &&
                !visibleText(child).trim() &&
                !elements(child).some((n) => ['a', 'button'].includes(n.tagName))))
          ),
      );
      node.childNodes.forEach((child) => {
        if ('tagName' in child) cleanEmptyMedia(child);
      });
    };
    cleanEmptyMedia(hero);
    hero.childNodes.unshift(...parseFragment(image).childNodes);
  }
  hero.childNodes.forEach((node) => {
    node.parentNode = hero!;
  });
  const position = ['top', 'center', 'bottom'].includes(banner.position)
    ? banner.position
    : 'center';
  const fit = banner.fit === 'contain' ? 'contain' : 'cover';
  let css = fullImage
    ? `[data-wr-banner=custom]{display:block!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;background:none!important}[data-wr-banner-image]{display:block!important;position:static!important;width:100%!important;max-width:none!important;height:auto!important;transform:none!important}.wr-banner-heading{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important}`
    : `[data-wr-banner=custom]{position:relative!important;isolation:isolate;background:#17212b!important;overflow:hidden!important}[data-wr-banner=custom]>:not([data-wr-banner-image]){position:relative;z-index:2}[data-wr-banner=custom] [class*=hero-scene],[data-wr-banner=custom] [class*=video-overlay],[data-wr-banner=custom] .hero-controls,[data-wr-banner=custom] .hero-scroll-cue{display:none!important}[data-wr-banner=custom]::before,[data-wr-banner=custom]::after{display:none!important}[data-wr-banner=custom] [style*="background-image"]{background-image:none!important}[data-wr-banner-image]{display:block!important;position:absolute!important;inset:0!important;width:100%!important;max-width:none!important;height:100%!important;object-fit:${fit}!important;object-position:center ${position}!important;transform:none!important;z-index:-1!important;opacity:1!important}`;
  if (!fullImage && (banner.contrast === 'light' || banner.contrast === 'dark')) {
    const dark = banner.contrast === 'dark';
    css += `[data-wr-banner=custom]::after{content:"";display:block!important;position:absolute!important;inset:0!important;z-index:0!important;pointer-events:none;background:${dark ? 'rgba(5,15,30,.60)' : 'rgba(255,255,255,.75)'}!important}[data-wr-banner=custom] h1,[data-wr-banner=custom] h2,[data-wr-banner=custom] p,[data-wr-banner=custom] .eyebrow{color:${dark ? '#fff' : '#162536'}!important;-webkit-text-fill-color:currentColor!important}`;
  }
  const style = parseFragment(`<style>${css}</style>`).childNodes[0];
  style.parentNode = head;
  head.childNodes.push(style);
  return serialize(document);
}
