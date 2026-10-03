import type { MaterialsTemplateContract } from '../shared/materials';
import { productGalleryMaterialsRevision } from '../shared/product-native-materials';

/** A new opt-in contract; every previously published binding remains unchanged. */
export function productGalleryContract(previous: MaterialsTemplateContract): MaterialsTemplateContract {
  const contract = structuredClone(previous);
  contract.contractRevision = productGalleryMaterialsRevision(contract.templateId);
  contract.guideRevision = '2026-10-03.2';
  contract.rendererRevision = `2026-10-03.${contract.templateId}-product-gallery.1`;
  contract.requiredCapabilities = [...contract.requiredCapabilities!, 'image.product-gallery.v1'];
  contract.imageSlots.push({
    id: 'product-gallery', page: 'detail', min: 0, max: 10, required: false, binding: 'supported',
    repeat: 'per-product-gallery', materialSource: 'product-gallery', productScope: 'single-product', reusePolicy: 'same-product',
    width: 1200, height: 1200, fit: 'contain', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    purpose: 'Show the confirmed supplementary images for this product in the detail gallery, in galleryMediaIds order. itemIndex starts at 1; the main image at index 0 is supplied separately. Omit when no supplementary images were confirmed.',
    composition: 'Reuse each confirmed galleryMediaId exactly. Preserve product identity, order, captions and the complete image without cropping, recoloring or generating replacements.',
    mobileComposition: 'Contain the complete selected image and keep the ordered thumbnails horizontally scrollable on small screens.',
  });
  return contract;
}
