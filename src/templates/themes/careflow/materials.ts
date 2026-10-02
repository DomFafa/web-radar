import { getCareflowMaterialsTemplate as legacyContract } from '../../releases/native-20261001.mjs';
import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';
import { careflowImages, careflowTexts } from './inventory';
export const careflowMaterialsRevision = '2026-10-01.careflow-healthcare-materials.3';
const originalCareflowMaterialsRevision = '2026-10-01.careflow-healthcare-materials.2';
const base = {
  min: 0,
  max: 1,
  required: false,
  binding: 'supported' as const,
  repeat: 'once' as const,
};
const factualPolicy =
  'Use confirmed organization and service facts only. Do not invent medical qualifications, treatment outcomes, reviews, specialist identities, insurance coverage, prices or emergency availability.';
export function getCareflowMaterialsTemplate(
  revision?: string,
): MaterialsTemplateContract | undefined {
  if (revision === '2026-10-01.careflow-healthcare-materials.1') return legacyContract(revision);
  if (revision && revision !== careflowMaterialsRevision && revision !== originalCareflowMaterialsRevision) return;
  const contract = originalCareflowMaterialsTemplate();
  if (revision === originalCareflowMaterialsRevision) return contract;
  contract.contractRevision = careflowMaterialsRevision;
  contract.requiredCapabilities!.push('image.illustration.v1');
  for (const slot of contract.imageSlots) {
    if (slot.materialSource === 'product-primary' || slot.materialSource === 'product-gallery') delete slot.role;
  }
  return contract;
}

// Preserve the published document and renderer for projects pinned to revision 2.
function originalCareflowMaterialsTemplate(): MaterialsTemplateContract {
  return {
    schemaVersion: 'wr-template-materials-v1',
    templateId: 'careflow-healthcare',
    guideRevision: '2026-10-01.2',
    contractRevision: originalCareflowMaterialsRevision,
    rendererRevision: originalCareflowMaterialsRevision,
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
      ...careflowImages.map((s) => ({
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
            ? 'Bright hospital or service facility photo. Keep the subject on the right; the lower-left carries the title card. No text baked into the image.'
            : 'Approved facility or service imagery. Use the exact aspect ratio and keep important subjects away from the edges.',
        mobileComposition:
          'Keep the subject in the central 60%; optionally supply mobileMediaId and a separate mobile crop.',
      })),
      {
        ...base,
        id: 'product-main',
        page: 'catalog',
        purpose: 'One original image per service/product; reused on its detail page',
        width: 1200,
        height: 900,
        role: 'main',
        productScope: 'single-product',
        materialSource: 'product-primary',
        reusePolicy: 'same-product',
        repeat: 'per-product',
        min: 1,
        required: true,
        fit: 'contain',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        composition:
          'Approved service or product photograph, 4:3. Do not add qualifications, efficacy claims or labels to the image.',
        mobileComposition: 'Keep the whole service subject or product visible.',
      },
      {
        ...base,
        id: 'product-gallery',
        page: 'detail',
        purpose: 'Additional images for the selected service/product; order follows itemIndex',
        width: 1200,
        height: 900,
        role: 'detail',
        productScope: 'single-product',
        materialSource: 'product-gallery',
        reusePolicy: 'same-product',
        repeat: 'per-product-gallery',
        max: 10,
        fit: 'contain',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        composition:
          'Additional approved images of the same service/product. Do not mix images belonging to other services.',
        mobileComposition: 'Preserve the complete subject.',
      },
    ],
    textSlots: [
      ...careflowTexts.map((s) => ({
        ...base,
        ...s,
        page: s.page as (typeof materialsPages)[number],
        maxLines: 8,
        format: 'plain-text' as const,
        factSources: ['brand', 'product'] as Array<'brand' | 'product'>,
        factualPolicy,
      })),
      ...[
        { id: 'primary-cta', page: 'home', maxCodePoints: 40 },
        { id: 'company-about', page: 'about', maxCodePoints: 2500 },
        { id: 'services-headline', page: 'home', maxCodePoints: 120 },
      ].map((s) => ({
        ...base,
        ...s,
        page: s.page as (typeof materialsPages)[number],
        purpose: s.id,
        maxLines: 12,
        format: 'plain-text' as const,
        factSources: ['brand', 'product'] as Array<'brand' | 'product'>,
        factualPolicy,
      })),
      ...materialsPages.flatMap((page) =>
        ['title', 'description'].map((kind) => ({
          ...base,
          id: `${page}-seo-${kind}`,
          page,
          purpose: `${page} SEO ${kind}`,
          maxCodePoints: kind === 'title' ? 70 : 170,
          maxLines: 3,
          format: 'plain-text' as const,
          factSources: ['brand', 'product'] as Array<'brand' | 'product'>,
          factualPolicy,
        })),
      ),
    ],
    optionalSections: [
      {
        id: 'reference-claims',
        reason:
          'Reference ratings, doctor identities, testimonials, statistics, hospitals and editorial examples are demo-only. Customer pages use confirmed company and service data.',
      },
    ],
    visualParameters: ['palette.primary'],
    contentPolicy: 'b2b-confirmed-facts-only',
  };
}
