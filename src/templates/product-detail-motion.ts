import type { Draft } from '../shared/model';
import { isProductAboutCollectionRevision } from '../shared/product-native-materials';
import type { RenderOptions } from './themes/types';

const detailStyles = `
html:has(body[data-wr-static-detail]){scroll-behavior:auto!important}
body[data-wr-static-detail],body[data-wr-static-detail] *,body[data-wr-static-detail] *::before,body[data-wr-static-detail] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
body[data-wr-static-detail] main :is(img,picture,figure,article),body[data-wr-static-detail] :is(a,button),body[data-wr-static-detail] .menu-link .link-background{transform:none!important;translate:none!important;rotate:none!important;scale:none!important}
body[data-wr-static-detail] :is([data-reveal],.wr-reveal){opacity:1!important;transform:none!important;translate:none!important;rotate:none!important;scale:none!important;filter:none!important;clip-path:none!important}
body[data-wr-static-detail] :is(#wr-product-image-lens,#wr-product-image-detail){display:none!important}
`;

/** Reuse the existing accessible, instant branches without changing frozen runtimes or browser preferences. */
export function staticProductDetailRuntime(source: string): string {
  return `(()=>{const matchMedia=query=>query==='(prefers-reduced-motion: reduce)'&&document.documentElement.hasAttribute('data-wr-static-detail')?{matches:true,media:query,addEventListener(){},removeEventListener(){}}:window.matchMedia(query);${source}\n})();`;
}

/** Only current six-template details opt out; historical releases and every other page keep their output. */
export function withStaticProductDetail(html: string, draft: Draft, options: RenderOptions): string {
  if (options.page !== 'detail' || !isProductAboutCollectionRevision(draft.template, draft.materials?.contractRevision)) return html;
  return html
    .replace('<html', '<html data-wr-static-detail')
    .replace('<head>', `<head><style id="wr-product-detail-static">${detailStyles}</style>`)
    .replace('<body', '<body data-wr-static-detail')
    .replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (script, attributes: string, source: string) =>
      /\b(?:src|type)\s*=/i.test(attributes) ? script : `<script${attributes}>${staticProductDetailRuntime(source)}</script>`);
}
