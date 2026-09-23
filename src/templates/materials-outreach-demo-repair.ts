import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type { Draft } from '../shared/model';
import type { RenderOptions } from './index';
import { safeUrl } from './themes/types';
import { repairMaterialsDemo } from './releases/demo-20260923.mjs';
import { getMaterialsTemplate } from './releases/outreach-20260923.mjs';

/** Authoring source only. Existing PR #8 and earlier demo releases remain unchanged. */
export function getOutreachDemoContract(id: string) {
  const contract = getMaterialsTemplate(id, `2026-09-22.${id}-materials.5`);
  if (!contract) return;
  contract.contractRevision = `2026-09-23.${id}-materials.6`;
  contract.rendererRevision = '2026-09-23.outreach-demo-repair.1';
  return contract;
}

export function repairOutreachMaterials(html: string, draft: Draft, options: RenderOptions): string {
  const document = parse(repairMaterialsDemo(html, draft, options));
  const visit = (node: DefaultTreeAdapterMap['node'], inHeader = false) => {
    if ('tagName' in node) {
      inHeader ||= node.tagName === 'header';
      if (inHeader && node.tagName === 'img') {
        // The source themes inserted brandLogo HTML/text into src. Use only the real asset.
        const logo = draft.company.logoAssetId && safeUrl(options.assetUrl(draft.company.logoAssetId), options.preview);
        const src = node.attrs.find(attr => attr.name === 'src');
        if (logo && src) src.value = logo;
        else if (node.parentNode) node.parentNode.childNodes = node.parentNode.childNodes.filter(child => child !== node);
      }
      const style = node.attrs.find(attr => attr.name === 'style')?.value || '';
      if (/display:\s*grid/.test(style) && /grid-template-columns:/.test(style))
        node.attrs.push({ name: 'data-wr-outreach-grid', value: '' });
      if (node.tagName === 'footer') node.attrs.push({ name: 'data-wr-outreach-footer', value: '' });
    }
    if ('childNodes' in node) for (const child of [...node.childNodes]) visit(child, inHeader);
  };
  visit(document);
  return serialize(document).replace('</head>', `<style id="wr-outreach-responsive-release-20260923">
@media(max-width:767px){
 [data-wr-outreach-grid]{grid-template-columns:minmax(0,1fr)!important;gap:24px!important}
 [data-wr-outreach-grid]>*,[data-wr-outreach-footer] *{min-width:0;overflow-wrap:anywhere}
 [data-wr-outreach-grid] :is(input:not([type="checkbox"]):not([type="radio"]),textarea,select){min-width:0;max-width:100%;width:100%;box-sizing:border-box}
 [data-wr-outreach-footer] [style*="display:flex"]{flex-wrap:wrap}
}
</style></head>`);
}
