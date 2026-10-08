import type { Draft } from '../shared/model';
import { isProductAboutCollectionRevision } from '../shared/product-native-materials';
import type { RenderOptions } from './themes/types';

const leadFrames: Record<string, { selector: string; breakpoint: number }> = {
  'pawfect-groom': { selector: '.pg-scene-media', breakpoint: 600 },
  auravell: { selector: '.avp-about-media', breakpoint: 700 },
  'careflow-healthcare': { selector: '.cfp-mosaic-wide', breakpoint: 700 },
  'toorun-early-learning': { selector: '.tr-about-image', breakpoint: 600 },
  'lumi-business': { selector: '.lp-about-wide', breakpoint: 620 },
  'mello-coffee': { selector: '.mp-about-story > figure', breakpoint: 767 },
};

/** A collection cannot lose products to a phone crop, even when the generated image misses its safe area. */
export function withProductAboutCollectionMobileImage(html: string, draft: Draft, options: RenderOptions): string {
  if (options.page !== 'about' || !isProductAboutCollectionRevision(draft.template, draft.materials?.contractRevision)) return html;
  const { selector, breakpoint } = leadFrames[draft.template];
  const scope = `body[data-wr-materials-revision="${draft.materials!.contractRevision}"]`;
  const frame = `${scope} ${selector}`;
  const auravellSpacing = draft.template === 'auravell' ? `${scope} .avp-about-hero{padding-top:110px}${frame}:after{background:none}${scope} .avp-about-heading{margin-top:0}` : '';
  const style = `<style id="wr-about-collection-mobile-image">@media(max-width:${breakpoint}px){
${frame},${frame} picture{height:auto;min-height:0;max-height:none;aspect-ratio:auto}
${frame} img{display:block;width:100%;height:auto;min-height:0;max-height:none;aspect-ratio:auto;object-fit:contain!important}
${auravellSpacing}
}</style>`;
  return html.replace('</head>', style + '</head>');
}
