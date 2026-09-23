import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type { Draft } from '../shared/model';
import type { RenderOptions } from './index';
import { safeUrl } from './themes/types';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const attr = (node: Element, name: string) => node.attrs.find(a => a.name === name)?.value;

/** Authoring source for the immutable demo-20260923 snapshot. Later changes need a new release. */
export function repairMaterialsDemo(html: string, draft: Draft, options: RenderOptions): string {
  const document = parse(html);
  const family = draft.template.split('-')[0];
  const industry = ['luggage', 'jewelry', 'homedecor', 'furniture', 'kitchen', 'drinkware', 'beauty', 'electronics', 'tools', 'sports'].includes(family);
  const headerClass = `${family === 'homedecor' ? 'decor' : family}-header`;
  const visit = (node: Node, brandHeader = false, industryFooter = false) => {
    if ('tagName' in node) {
      brandHeader ||= industry && node.tagName === 'header' && (attr(node, 'class') || '').split(/\s+/).includes(headerClass);
      industryFooter ||= industry && node.tagName === 'footer';
      if (node.tagName === 'script' && !attr(node, 'src') && (!attr(node, 'type') || attr(node, 'type') === 'text/javascript')) {
        for (const text of node.childNodes) if (text.nodeName === '#text' && 'value' in text) {
          // Frozen bundles are bundled again by Wrangler. Function.toString() retains
          // esbuild's renamed helpers, but not their surrounding Worker closure.
          // Discover actual names, and preserve esbuild's name-property semantics.
          const names = [...new Set([...text.value.matchAll(/\b(__name\d*)\s*\(/g)].map(match => match[1]))]
            .filter(name => !new RegExp(`\\b(?:var|let|const|function)\\s+${name}\\b`).test(text.value));
          if (names.length) text.value = names.map(name => `var ${name}=(target,value)=>Object.defineProperty(target,"name",{value,configurable:true});`).join('') + text.value;
        }
      }
      if (brandHeader && node.tagName === 'img') {
        // ThemeContext.brandLogo contains HTML or escaped text, never an asset URL.
        const logo = draft.company.logoAssetId && safeUrl(options.assetUrl(draft.company.logoAssetId), options.preview);
        if (logo) node.attrs.find(a => a.name === 'src')!.value = logo;
        else if (node.parentNode) node.parentNode.childNodes = node.parentNode.childNodes.filter(child => child !== node);
      }
      if (industryFooter) {
        if (node.tagName === 'footer') node.attrs.push({ name: 'data-wr-industry-footer', value: '' });
        if (/display:\s*grid/.test(attr(node, 'style') || '') && /grid-template-columns:/.test(attr(node, 'style') || '')) node.attrs.push({ name: 'data-wr-industry-footer-grid', value: '' });
      }
      // These existing industry feature/metric grids keep three or four desktop
      // columns even on phones. Unlike product/gallery grids, they have no mobile rule.
      if (industry && /grid-template-columns:\s*repeat\([34],\s*1fr\)/.test(attr(node, 'style') || '')) node.attrs.push({ name: 'data-wr-industry-copy-grid', value: '' });
      if (industry && options.page === 'contact' && /grid-template-columns:\s*1fr\s+1\.6fr\s*;/.test(attr(node, 'style') || '')) node.attrs.push({ name: 'data-wr-industry-contact-grid', value: '' });
      if (industry && options.page === 'detail') {
        const style = node.attrs.find(a => a.name === 'style');
        if (style && /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(330px,\s*1fr\)\)/.test(style.value)) {
          style.value = style.value.replace(/minmax\(330px,\s*1fr\)/, 'minmax(min(330px,100%),1fr)');
          node.attrs.push({ name: 'data-wr-industry-detail-grid', value: '' });
        }
      }
    }
    if ('childNodes' in node) for (const child of [...node.childNodes]) visit(child, brandHeader, industryFooter);
  };
  visit(document);
  let output = serialize(document);
  if (draft.template === 'corpox-ai-agency') {
    let texture = '/templates/releases/demo-20260923/corpox-noise.d1c5169bfca278bd.gif';
    // Published Pages only contain the project files; shared template assets stay on WR.
    const base = safeUrl(options.publicBaseUrl || '');
    if (/^https?:\/\//.test(base)) texture = new URL(texture, base).href;
    output = output.replace('</head>', `<style id="wr-corpox-texture-release-20260923">body::before{background-image:url("${texture}")!important}</style></head>`);
  }
  return industry ? output.replace('</head>', `<style id="wr-industry-responsive-release-20260923">
@media(max-width:767px){
 [data-wr-industry-footer-grid],[data-wr-industry-copy-grid],[data-wr-industry-contact-grid]{grid-template-columns:minmax(0,1fr)!important;gap:28px!important}
 [data-wr-industry-copy-grid]>*,[data-wr-industry-contact-grid]>*,[data-wr-industry-detail-grid]>*{min-width:0;overflow-wrap:anywhere}
 [data-wr-industry-contact-grid] :is(input:not([type="checkbox"]):not([type="radio"]),textarea,select){min-width:0;max-width:100%;width:100%;box-sizing:border-box}
 [data-wr-industry-footer] *{min-width:0;overflow-wrap:anywhere}
 [data-wr-industry-footer] [style*="display:flex"]{flex-wrap:wrap}
}
</style></head>`) : output;
}
