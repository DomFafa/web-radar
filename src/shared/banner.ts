import { selectedBanner } from './banner-config';
import { bannerRuntime } from './banner-runtime';
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

/** Apply page-scoped media at render time, preserving the original generated artifact. */
export function withBanner(
  html: string,
  draft: Draft,
  assetUrl: (id: string) => string,
  target: boolean | string | { page: string; productId?: string },
): string {
  const page =
    typeof target === 'boolean'
      ? target
        ? 'home'
        : ''
      : typeof target === 'string'
        ? target
        : target.page;
  const banner = selectedBanner(
    draft,
    page,
    typeof target === 'object' ? target.productId : undefined,
  );
  if (!banner || (banner.kind === 'images' ? !banner.slides.length : !banner.videoAssetId))
    return html;
  const video = banner.kind === 'video';
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
        /(?:^|\s)(?:hero|hero-section|hero-banner|banner|banner-section|senseng-hero|senseng-hero-video-full|senseng-about-hero|senseng-contact-hero|cat-hero|wr-inner-title)(?:\s|$)/i.test(
          `${attr(node, 'id')} ${attr(node, 'class')}`,
        ),
    );
  if (!hero && page === 'home') {
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
  const slides = banner.slides
    .map(
      (slide, i) =>
        `<img data-wr-banner-image data-wr-slide src="${escape(assetUrl(slide.assetId))}" alt="${escape(slide.alt)}" ${i ? 'hidden aria-hidden="true"' : 'aria-hidden="false"'} loading="eager" ${i ? '' : 'fetchpriority="high"'} decoding="async">`,
    )
    .join('');
  const poster = banner.posterAssetId ? escape(assetUrl(banner.posterAssetId)) : '';
  const media = video
    ? `${poster ? `<img class="wr-banner-poster" src="${poster}" alt="" aria-hidden="true">` : ''}<video data-wr-banner-video src="${escape(assetUrl(banner.videoAssetId!))}" ${poster ? `poster="${poster}"` : ''} muted loop playsinline preload="metadata" aria-label="Banner background video"></video>`
    : slides;
  const controls =
    video || banner.slides.length > 1
      ? `<div class="wr-banner-controls" role="group" aria-label="Banner controls">${video ? '' : `<button type="button" data-wr-banner-prev aria-label="Previous banner">←</button><span data-wr-banner-status aria-live="off">1 / ${banner.slides.length}</span><button type="button" data-wr-banner-next aria-label="Next banner">→</button>`}<button type="button" data-wr-banner-toggle aria-label="Play banner">▶</button></div>`
      : '';
  const fullImage = !video && (banner.mode === 'image' || !hero);
  const image = `<div class="wr-banner-media">${media}</div>`;
  if (!hero) {
    hero = parseFragment('<section></section>').childNodes[0] as Element;
    const main = all.find((node) => node.tagName === 'main') ?? body;
    const header = main.childNodes.findIndex(
      (node) => 'tagName' in node && node.tagName === 'header',
    );
    main.childNodes.splice(header + 1, 0, hero);
    hero.parentNode = main;
  }
  hero.attrs.push(
    { name: 'data-wr-banner', value: 'custom' },
    { name: 'data-autoplay', value: String(banner.autoplay) },
    { name: 'data-interval', value: String(banner.interval) },
  );
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
  hero.childNodes.push(...parseFragment(controls).childNodes);
  hero.childNodes.forEach((node) => {
    node.parentNode = hero!;
  });
  const position = ['top', 'center', 'bottom'].includes(banner.position)
    ? banner.position
    : 'center';
  const fit = banner.fit === 'contain' ? 'contain' : 'cover';
  let css = `[data-wr-banner=custom]{position:relative!important;isolation:isolate;overflow:hidden!important}[data-wr-banner=custom]::before,[data-wr-banner=custom]::after{display:none!important}.wr-banner-media{pointer-events:none}.wr-banner-media img,.wr-banner-media video{display:block!important;width:100%!important;max-width:none!important;height:100%!important;object-fit:${video ? 'cover' : fit}!important;object-position:center ${position}!important;transform:none!important;margin:0!important}.wr-banner-media [hidden]{visibility:hidden!important;opacity:0!important}.wr-banner-media [data-wr-slide]:not([hidden]){visibility:visible!important;opacity:1!important}.wr-banner-controls{position:absolute!important;bottom:20px!important;left:50%!important;transform:translateX(-50%)!important;display:flex!important;gap:12px!important;align-items:center!important;z-index:10!important;padding:6px 12px!important;border-radius:30px!important;background:#102030d9!important;color:#fff!important;font:14px system-ui!important}.wr-banner-controls button{display:inline-flex!important;align-items:center;justify-content:center;width:40px!important;height:40px!important;min-width:40px;border:1px solid #ffffff80!important;border-radius:50%!important;background:transparent!important;color:#fff!important;cursor:pointer;padding:0!important}.wr-banner-controls button:focus-visible{outline:3px solid #fff;outline-offset:2px}.wr-banner-heading{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important}`;
  if (fullImage)
    css += `[data-wr-banner=custom]{display:block!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;background:none!important}.wr-banner-media{display:grid!important;position:relative!important}.wr-banner-media img{grid-area:1/1!important;position:relative!important;height:auto!important;${banner.slides.length > 1 ? 'aspect-ratio:16/7;' : ''}}`;
  else
    css += `[data-wr-banner=custom]{min-height:320px;background:#17212b!important}[data-wr-banner=custom]>:not(.wr-banner-media):not(.wr-banner-controls){position:relative;z-index:2}[data-wr-banner=custom] [class*=hero-scene],[data-wr-banner=custom] [class*=video-overlay],[data-wr-banner=custom] .hero-controls,[data-wr-banner=custom] .hero-scroll-cue{display:none!important}[data-wr-banner=custom] [style*="background-image"]{background-image:none!important}.wr-banner-media{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:-1!important}.wr-banner-media img,.wr-banner-media video{position:absolute!important;inset:0!important}`;
  if (video || banner.height === 'screen')
    css += `html,body{overflow-x:clip}[data-wr-banner=custom]{box-sizing:border-box!important;width:100vw!important;max-width:none!important;margin-left:calc(50% - 50vw)!important;margin-right:0!important;border-radius:0!important;min-height:100svh!important;height:100svh!important;padding-top:0!important;padding-bottom:0!important;display:grid!important;align-content:center!important}[data-wr-banner=custom]>.wr-banner-media{position:absolute!important;inset:0!important;height:100%!important}[data-wr-banner=custom] .wr-banner-media img{height:100%!important;aspect-ratio:auto!important}`;
  if (!fullImage && (banner.contrast === 'light' || banner.contrast === 'dark')) {
    const dark = banner.contrast === 'dark';
    css += `[data-wr-banner=custom]::after{content:"";display:block!important;position:absolute!important;inset:0!important;z-index:0!important;pointer-events:none;background:${dark ? 'rgba(5,15,30,.60)' : 'rgba(255,255,255,.75)'}!important}[data-wr-banner=custom] h1,[data-wr-banner=custom] h2,[data-wr-banner=custom] p,[data-wr-banner=custom] .eyebrow{color:${dark ? '#fff' : '#162536'}!important;-webkit-text-fill-color:currentColor!important}`;
  }
  const style = parseFragment(`<style>${css}</style>`).childNodes[0];
  style.parentNode = head;
  head.childNodes.push(style);
  if (video || banner.slides.length > 1) {
    const script = parseFragment(`<script>${bannerRuntime}</script>`).childNodes[0];
    script.parentNode = body;
    body.childNodes.push(script);
  }
  return serialize(document);
}
