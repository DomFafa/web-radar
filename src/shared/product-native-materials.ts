import type { Draft } from './model';

export const productNativeTemplateIds = ['auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee'] as const;
export const productNativeMaterialsRevision = (templateId: string) => `2026-10-02.${templateId}-materials.2`;
export const productNativeEnhancedMaterialsRevision = (templateId: string) => `2026-10-03.${templateId}-materials.3`;
export const productGalleryMaterialsRevision = (templateId: string) => `2026-10-03.${templateId}-materials.4`;
export function isProductGalleryRevision(templateId: string, revision?: string): boolean {
  return (templateId === 'pawfect-groom' || productNativeTemplateIds.some(id => id === templateId)) && revision === productGalleryMaterialsRevision(templateId);
}
export function isProductNativeEnhancedRevision(templateId: string, revision?: string): boolean {
  return productNativeTemplateIds.some(id => id === templateId) && (revision === productNativeEnhancedMaterialsRevision(templateId) || isProductGalleryRevision(templateId, revision));
}
export function isProductNativeRevision(templateId: string, revision?: string): boolean {
  return productNativeTemplateIds.some(id => id === templateId) && (revision === productNativeMaterialsRevision(templateId) || isProductNativeEnhancedRevision(templateId, revision));
}
export const isProductNativeMaterials = (draft: Draft): boolean => isProductNativeRevision(draft.template, draft.materials?.contractRevision);
