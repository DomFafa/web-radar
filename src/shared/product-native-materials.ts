import type { Draft } from './model';

export const productNativeTemplateIds = ['auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee'] as const;
export const productNativeMaterialsRevision = (templateId: string) => `2026-10-02.${templateId}-materials.2`;
export const productNativeEnhancedMaterialsRevision = (templateId: string) => `2026-10-03.${templateId}-materials.3`;
export function isProductNativeEnhancedRevision(templateId: string, revision?: string): boolean {
  return productNativeTemplateIds.some(id => id === templateId) && revision === productNativeEnhancedMaterialsRevision(templateId);
}
export function isProductNativeRevision(templateId: string, revision?: string): boolean {
  return productNativeTemplateIds.some(id => id === templateId) && (revision === productNativeMaterialsRevision(templateId) || revision === productNativeEnhancedMaterialsRevision(templateId));
}
export const isProductNativeMaterials = (draft: Draft): boolean => isProductNativeRevision(draft.template, draft.materials?.contractRevision);
