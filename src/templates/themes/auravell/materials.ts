import { getAuravellMaterialsTemplate as legacyContract } from '../../releases/native-20261001.mjs';
import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';
import { auravellImages, auravellTexts } from './inventory';

export const auravellMaterialsRevision = '2026-10-01.auravell-materials.3';
const originalAuravellMaterialsRevision = '2026-10-01.auravell-materials.2';

const base = {
  min: 0,
  max: 1,
  required: false,
  binding: 'supported' as const,
  repeat: 'once' as const,
};

const factualPolicy =
  'Use confirmed organization, studio, and class facts only. Do not invent instructor qualifications, medical treatment claims, reviews, fake certifications, or guaranteed physical outcomes.';

export function getAuravellMaterialsTemplate(
  revision?: string,
): MaterialsTemplateContract | undefined {
  if (revision === '2026-10-01.auravell-materials.1') return legacyContract(revision);
  if (revision && revision !== auravellMaterialsRevision && revision !== originalAuravellMaterialsRevision) return;
  const contract = originalAuravellMaterialsTemplate();
  if (revision === originalAuravellMaterialsRevision) return contract;
  contract.contractRevision = auravellMaterialsRevision;
  contract.requiredCapabilities!.push('image.illustration.v1');
  for (const slot of contract.imageSlots) {
    if (slot.materialSource === 'product-primary' || slot.materialSource === 'product-gallery') delete slot.role;
  }
  return contract;
}

// Preserve the published document and renderer for projects pinned to revision 2.
function originalAuravellMaterialsTemplate(): MaterialsTemplateContract {
  return {
    schemaVersion: 'wr-template-materials-v1',
    templateId: 'auravell',
    guideRevision: '2026-10-01.2',
    contractRevision: originalAuravellMaterialsRevision,
    rendererRevision: originalAuravellMaterialsRevision,
    materialsReady: true,
    imagePolicy: 'typed-regions-v1',
    pages: [...materialsPages],
    requiredCapabilities: [
      'image.slot.v1',
      'image.product-primary.v1',
      'image.product-gallery.v1',
      'text.plain.v1',
    ],
    imageSlots: [
      ...auravellImages.map((s) => ({
        ...base,
        id: s.id,
        page: s.page as (typeof materialsPages)[number],
        purpose: s.purpose,
        width: s.width,
        height: s.height,
        role: 'facility' as const,
        sourcePolicy: 'illustration' as const,
        productScope: 'none' as const,
        materialSource: 'slot-image' as const,
        reusePolicy: 'distinct-slot' as const,
        fit: 'cover' as const,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        composition:
          s.id === 'home-hero'
            ? 'Serene yoga meditation scene. Keep left side dark gradient for title contrast. No text baked into the image.'
            : 'Warm aesthetic studio imagery. Use the exact aspect ratio and keep subjects centered with breathing room.',
        mobileComposition:
          'Keep the subject in the central 60%; optionally supply mobileMediaId and a separate mobile crop.',
      })),
      {
        ...base,
        id: 'product-main',
        page: 'catalog',
        purpose: 'One primary image per class/service; reused on catalog and class detail page',
        width: 1200,
        height: 900,
        role: 'main',
        productScope: 'single-product',
        materialSource: 'product-primary',
        reusePolicy: 'same-product',
        repeat: 'per-product',
        min: 1,
        required: true,
        fit: 'cover',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        composition:
          'Approved yoga pose or mindfulness session photograph, 4:3. Calm, natural daylight with earth tones. No text overlays.',
        mobileComposition: 'Keep the subject centered and clearly visible.',
      },
      {
        ...base,
        id: 'product-gallery',
        page: 'detail',
        purpose: 'Additional gallery images for the selected class/service',
        width: 1200,
        height: 900,
        role: 'detail',
        productScope: 'single-product',
        materialSource: 'product-gallery',
        reusePolicy: 'same-product',
        repeat: 'per-product-gallery',
        max: 10,
        fit: 'cover',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        composition: 'Supplemental authentic photographs of the same class or practice technique.',
        mobileComposition: 'Preserve the complete subject.',
      },
    ],
    textSlots: [
      ...auravellTexts.map((s) => ({
        ...base,
        ...s,
        page: s.page as (typeof materialsPages)[number],
        maxLines: 8,
        format: 'plain-text' as const,
        factSources: ['brand', 'product'] as Array<'brand' | 'product'>,
        factualPolicy,
      })),
    ],
    optionalSections: [
      {
        id: 'testimonials',
        reason: 'Customer quotes are not published without written consent; omit if unverified.',
      },
      {
        id: 'instructors',
        reason: 'Instructor credentials must match verified staff; omit placeholder profiles.',
      },
    ],
    visualParameters: ['palette.primary'],
    contentPolicy: 'b2b-confirmed-facts-only',
  };
}
