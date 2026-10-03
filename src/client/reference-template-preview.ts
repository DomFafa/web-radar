import type { Draft } from '../shared/model';
import { isProductNativeMaterials, isProductNativeEnhancedRevision, isProductGalleryRevision, isProductAboutCollectionRevision } from '../shared/product-native-materials';
import { productGalleryRuntime } from '../shared/product-gallery-runtime';
import { productNativeUiRuntime, productNativeEnhancedNavRuntime } from '../templates/product-native-runtime';
import { productMotionPrepareSource, productMotionSource } from '../templates/themes/product-motion-source';
import { referenceMotionRuntime } from '../templates/themes/reference-motion';
import { auravellRuntime } from '../templates/themes/auravell/runtime';
import { careflowRuntime } from '../templates/themes/careflow/runtime';
import { pawfectMaterialsRevision } from '../templates/themes/pawfect/materials';
import { pawfectMotionPrepareSource, pawfectMotionSource } from '../templates/themes/pawfect/motion-source';
import { productGalleryMotionSource } from '../templates/themes/product-gallery-motion-source';
import { productAboutCollectionMotionSource } from '../templates/themes/product-about-collection-motion-source';

const usesPawfectMotion = (draft: Draft) => draft.template === 'pawfect-groom' && draft.materials?.contractRevision === pawfectMaterialsRevision;

/** Runs in the nonce-protected head before the iframe can paint its body. */
export function referenceTemplatePreviewPrepare(draft: Draft): string {
  if (isProductGalleryRevision(draft.template, draft.materials?.contractRevision)) return draft.template === 'pawfect-groom' ? pawfectMotionPrepareSource : productMotionPrepareSource;
  if (isProductNativeEnhancedRevision(draft.template, draft.materials?.contractRevision)) return productMotionPrepareSource;
  return usesPawfectMotion(draft) ? pawfectMotionPrepareSource : '';
}

/** Only reviewed local code enters the preview's nonce-protected script. */
export async function referenceTemplatePreviewRuntime(draft: Draft): Promise<string> {
  if (isProductGalleryRevision(draft.template, draft.materials?.contractRevision)) {
    const motionSource = isProductAboutCollectionRevision(draft.template, draft.materials?.contractRevision) ? productAboutCollectionMotionSource : productGalleryMotionSource;
    const motion = draft.template === 'pawfect-groom' ? pawfectMotionSource : `;(${productNativeUiRuntime.toString()})();(${productNativeEnhancedNavRuntime.toString()})();${motionSource}`;
    return `;(${productGalleryRuntime.toString()})();${motion}`;
  }
  if (isProductNativeEnhancedRevision(draft.template, draft.materials?.contractRevision)) return `;(${productNativeUiRuntime.toString()})();(${productNativeEnhancedNavRuntime.toString()})();${productMotionSource}`;
  if (isProductNativeMaterials(draft)) return `;(${productNativeUiRuntime.toString()})();`;
  if (usesPawfectMotion(draft)) return pawfectMotionSource;
  if (!['auravell', 'careflow-healthcare'].includes(draft.template)) return '';
  const revision = draft.materials?.contractRevision;
  if (revision === `2026-10-01.${draft.template}-materials.1`) {
    const legacy = await import('../templates/releases/native-preview-sources-20261001.mjs');
    return draft.template === 'auravell' ? legacy.auravellPreviewRuntime : legacy.careflowPreviewRuntime;
  }
  const runtime = draft.template === 'auravell' ? auravellRuntime : careflowRuntime;
  return `;(${referenceMotionRuntime.toString()})();(${runtime.toString()})();`;
}
