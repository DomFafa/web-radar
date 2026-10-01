import { auravellRuntime as legacyAuravellRuntime, careflowRuntime as legacyCareflowRuntime } from '../templates/releases/native-preview-20261001.mjs';
import { referenceMotionRuntime } from '../templates/themes/reference-motion';
import { auravellRuntime } from '../templates/themes/auravell/runtime';
import { careflowRuntime } from '../templates/themes/careflow/runtime';
import { goodBoyRuntime } from '../templates/themes/goodBoyRuntime';
import { lumiRuntime } from '../templates/themes/lumi/runtime';
import { isSingleProductTemplate, singleProductRuntime } from '../templates/themes/singleProduct';
import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import { referenceInteractions } from '../templates/themes/referenceInteractions';
import { materialsRuntime } from '../shared/materials-runtime';
import { productImageViewerRuntime } from '../shared/product-image-viewer';
import { bannerRuntime } from '../shared/banner-runtime';
import { releasedMaterialsPreviewRuntime } from '../templates/materials-releases';
import type { DesignPage, Draft, Language } from '../shared/model';

/** Keep renderer data-wr hooks for the parent's sandbox bridge; only remap destinations. */
export function projectPreviewHtml(html: string, base: string, origin: string, selection: { page: DesignPage; lang: Language; productId?: string; expectedVersion: number }): string {
  const document = parse(html);
  const visit = (node: DefaultTreeAdapterMap['node']) => {
    if ('tagName' in node) {
      const get = (name: string) => node.attrs.find(a => a.name === name)?.value;
      const set = (name: string, value: string) => { const a = node.attrs.find(a => a.name === name); if (a) a.value = value; else node.attrs.push({ name, value }); };
      // Static theme resources belong to WR; all project media already uses the PR proxy.
      for (const a of node.attrs) if (['src', 'srcset', 'poster', 'data-src', 'style', 'href'].includes(a.name))
        a.value = a.value.replace(/(^|[\s("',])\/templates\//g, '$1' + origin + '/templates/');
      if (node.tagName === 'a' && (get('data-wr-page') || get('data-wr-lang'))) {
        const page = get('data-wr-page') || selection.page;
        const params = new URLSearchParams({ page, lang: get('data-wr-lang') || selection.lang, expectedVersion: String(selection.expectedVersion) });
        const productId = get('data-wr-product-id') || selection.productId;
        if (productId && (page === 'detail' || page === 'contact')) params.set('productId', productId);
        set('href', base + '/preview?' + params);
      }
      if (node.tagName === 'form') { set('action', '#'); set('data-wr-preview-disabled', 'true'); }
    }
    if ('childNodes' in node) for (const child of node.childNodes) visit(child);
    if ('tagName' in node && node.tagName === 'template' && 'content' in node) visit(node.content);
  };
  visit(document);
  return serialize(document);
}

/** Built exclusively from reviewed source. Keep customer values out of executable code. */
export const projectPreviewRuntime = `var __name=(value)=>value;(()=>{
  const __name=(value)=>value;
  (${referenceInteractions.toString()})();
  (${materialsRuntime.toString()})();
  (${productImageViewerRuntime.toString()})();
  ${bannerRuntime}
  document.addEventListener('submit', event => event.preventDefault());
  for(const search of document.querySelectorAll('[data-product-search]')) search.addEventListener('input',()=>{
    for(const card of document.querySelectorAll('[data-product-card]')) card.hidden=!(card.dataset.productName||card.textContent).toLowerCase().includes(search.value.toLowerCase());
  });
})();`;

export function projectPreviewRuntimeForDraft(draft: Draft): string {
  if (draft.template === 'auravell' && draft.materials?.contractRevision === '2026-10-01.auravell-materials.1') return projectPreviewRuntime + '\n;(' + legacyAuravellRuntime.toString() + ')();';
  if (draft.template === 'careflow-healthcare' && draft.materials?.contractRevision === '2026-10-01.careflow-healthcare-materials.1') return projectPreviewRuntime + '\n;(' + legacyCareflowRuntime.toString() + ')();';
  const runtime = releasedMaterialsPreviewRuntime(draft) ?? projectPreviewRuntime;
  if (draft.template === 'auravell') return runtime + '\n;(' + referenceMotionRuntime.toString() + ')();\n;(' + auravellRuntime.toString() + ')();';
  if (draft.template === 'good-boy-pals') return runtime + '\n;(' + goodBoyRuntime.toString() + ')();';
  if (draft.template === 'careflow-healthcare') return runtime + '\n;(' + referenceMotionRuntime.toString() + ')();\n;(' + careflowRuntime.toString() + ')();';
  if (draft.template === 'lumi-business') return runtime + '\n;(' + lumiRuntime.toString() + ')();';
  return isSingleProductTemplate(draft.template) ? runtime + '\n' + singleProductRuntime : runtime;
}
