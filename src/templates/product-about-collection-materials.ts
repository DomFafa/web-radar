import type { MaterialsTemplateContract } from '../shared/materials';
import { productAboutCollectionMaterialsRevision } from '../shared/product-native-materials';

export const productAboutCollectionSlotIds: Record<string, string> = {
  'pawfect-groom': 'about-primary-image',
  auravell: 'about-hero-scene',
  'careflow-healthcare': 'about-wide-scene',
  'toorun-early-learning': 'about-primary-image',
  'lumi-business': 'about-wide',
  'mello-coffee': 'about-primary-image',
  'senseng-candy': 'about-primary-image',
  'senseng-video': 'about-primary-image',
  'senseng-nature': 'about-primary-image',
};

const collectionPolicy = "Generate one new coherent About photograph containing every selected product from the same confirmed series, grounded in each product's approved original main image and confirmed facts. Show every selected product once, complete and recognizable, preserving real shape, proportions, colors, markings and included parts. Balance their visibility without hiding or overlapping defining parts. If only one product is selected, show only that real product; do not invent additional products, duplicates or an assortment. Use the approved website visual plan for the surroundings without recoloring the products. Create a different physical setting, camera viewpoint and product arrangement from every homepage image, including the homepage collection hero, and from the previous single-product About image. This is a separately generated composition, not a recrop, reframing, mirrored copy, collage or reuse of another slot. Keep the same series identity and visual palette while changing all three of setting, viewpoint and arrangement. No baked-in text, labels, website UI, fictional facilities, staff, certifications or unsupported uses. ";
const framing: Record<string, string> = {
  'pawfect-groom': 'Landscape 3:2. Compose a calm editorial group at an oblique angle, with all real products arranged at readable depths and breathing room around the complete group. Preserve the feature panel crop and avoid invented workplace evidence.',
  auravell: 'Landscape 16:9. Use an editorial group composition from an elevated oblique viewpoint, with clear silhouettes and generous space around the complete group. Keep the outer frame quiet and preserve the wide About opening photograph.',
  'careflow-healthcare': 'Near-square landscape 251:223. Arrange the complete group diagonally through a quiet, product-appropriate setting, viewed from a distinct elevated angle. Keep all defining parts inside the rounded mosaic crop; do not imply medical use or a clinical facility without confirmed facts.',
  'toorun-early-learning': 'Portrait 20:21. Build a balanced staggered arrangement of all real products with visible depth, viewed obliquely in a clean product-appropriate setting. Keep the full group central with generous margin for rounded and rotated corners; do not invent a childcare facility or product use.',
  'lumi-business': 'Wide editorial photograph 9:5. Use an elevated diagonal view of the complete collection in a distinct believable setting, with soft daylight and a layered arrangement that keeps every real object readable. Preserve spatial depth and breathing room around the full group.',
  'mello-coffee': 'Landscape 3:2. Use a quiet editorial still life of the complete collection, with a different supporting surface, oblique camera view and staggered arrangement. Preserve warm surroundings and clear silhouettes without inventing a cafe, workshop, factory or retail location.',
  'senseng-candy': 'Keep the existing About frame aspect ratio and crop-safe margins. Use a softly lit editorial group in a new setting with an elevated diagonal camera view and readable staggered product spacing.',
  'senseng-video': 'Keep the existing About frame aspect ratio and crop-safe margins. Use a quiet cinematic group in a new setting with an oblique camera view and layered arrangement that keeps each real product clear.',
  'senseng-nature': 'Keep the existing About frame aspect ratio and crop-safe margins. Use a restrained daylight group in a new product-appropriate setting with an elevated camera view and an asymmetric, clearly separated arrangement.',
};

/** Clone the selected release so existing contracts and rendered sites remain frozen. */
export function productAboutCollectionContract(previous: MaterialsTemplateContract): MaterialsTemplateContract {
  const slotId = productAboutCollectionSlotIds[previous.templateId];
  if (!slotId || !previous.imageSlots.some(slot => slot.id === slotId)) throw Error(`Missing About collection slot: ${previous.templateId}`);
  const contract = structuredClone(previous);
  contract.contractRevision = productAboutCollectionMaterialsRevision(contract.templateId);
  contract.guideRevision = '2026-10-03.3';
  contract.rendererRevision = `2026-10-03.${contract.templateId}-about-collection.1`;
  contract.requiredCapabilities = [...new Set([...(contract.requiredCapabilities || []), 'image.collection.v1', 'image.generate-new.v1'])];
  contract.imageSlots = contract.imageSlots.map(slot => slot.id === slotId ? {
    ...slot, role: 'collection', productScope: 'all-products', sourcePolicy: 'product-reference', reusePolicy: 'generate-new',
    purpose: 'Independent About opening photograph of the complete confirmed product series, in a different setting, camera viewpoint and arrangement from every homepage image.',
    composition: collectionPolicy + framing[contract.templateId],
    mobileComposition: 'Apply the following existing crop, safe-area and scale rules to every real product and the complete collection together. Preserve the desktop aspect ratio. If the complete collection cannot fit at 390px, provide a separately composed mobile collection with exactly the same product identities; never remove products or replace it with a single-product image. ' + slot.mobileComposition,
  } : slot);
  return contract;
}
