import type { Draft } from '../shared/model';
import type { MaterialsTemplateContract } from '../shared/materials';

export const imageContentGuideRevision = '2026-10-02.1';
export const imageContentMaterialsRevision = (id: string) => `2026-10-02.${id}-materials.1`;
// Published guidance must not follow a future latest renderer or disappear when retired.
const imageContentBaseRevisions: Readonly<Record<string, string>> = Object.freeze({
  'auravell': '2026-10-01.auravell-materials.3',
  'careflow-healthcare': '2026-10-01.careflow-healthcare-materials.3',
  'toorun-early-learning': '2026-10-01.toorun-early-learning-materials.3',
  'lumi-business': '2026-10-01.lumi-business-materials.2',
  'pawfect-groom': '2026-09-20.pawfect-groom-materials.2',
  'mello-coffee': '2026-09-20.mello-coffee-materials.2',
  'senseng-candy': '2026-09-23.senseng-candy-materials.6',
  'senseng-video': '2026-09-23.senseng-video-materials.6',
  'senseng-nature': '2026-09-23.senseng-nature-materials.6',
});
export const imageContentBaseRevision = (id: string) => imageContentBaseRevisions[id];
export const usesImageContentRevision = (id: string, revision?: string) =>
  !!imageContentBaseRevision(id) && revision === imageContentMaterialsRevision(id);

export const imageSubjectPolicy =
  'Image content comes only from confirmed customer product references and an explicitly approved business brief. ' +
  'A website template is layout only: its name, industry, palette, visualSystem, sample photos, thumbnails, alt text and demo copy are not image subjects, product facts or image-generation style instructions. ' +
  'Reuse matching approved images first. Do not generate or redesign a product image because the template changed. ' +
  'If references or an approved subject are missing, report the missing input; do not substitute a template demo subject.';

/** Publish new guidance without changing any historical contract or executable slot. */
export function withConfirmedImageContent(source: MaterialsTemplateContract): MaterialsTemplateContract {
  const contract = structuredClone(source);
  contract.guideRevision = imageContentGuideRevision;
  contract.contractRevision = imageContentMaterialsRevision(contract.templateId);
  if (contract.productApplicability) contract.productApplicability.preferredFamilies = [];
  for (const slot of contract.imageSlots) {
    const source = slot.materialSource;
    const original = source === 'product-primary' || source === 'product-gallery';
    const collection = slot.role === 'collection' || slot.productScope === 'all-products';
    const business = slot.productScope === 'none' || slot.sourcePolicy === 'illustration';
    slot.purpose = source === 'product-primary'
      ? 'Original primary image of the bound customer product; reuse in catalog and detail'
      : source === 'product-gallery'
        ? 'Existing ordered supplemental images of the same customer product'
        : collection
          ? `${slot.page} collection image position containing the selected customer products`
          : business
            ? `${slot.page} customer-approved business image position; template demo subject is not a requirement`
            : `${slot.page} ${slot.role || 'product'} image position for the bound customer product`;
    const content = original
      ? 'Reuse the bound product primaryMediaId or galleryMediaIds exactly; dimensions describe a display target, not permission to redraw or recolor the image. Any newly requested image requires explicit approval and real product reference images. Preserve the exact shape, material, colors, markings, packaging and included parts.'
      : collection
        ? 'Include the selected customer products with their real identity intact. Preserve all selected product coverage and use a distinct arrangement when multiple collection images are required. Only the slot dimensions and reserved live-text area constrain layout.'
        : business
          ? 'Use authorized customer business imagery, or an illustration based on an explicitly approved customer business brief. No product reference is required for this role, but an approved subject is required. Do not infer people, animals, occupations, premises, packaging-design services or other subjects from template examples. Never present an illustration as an actual facility, staff member, certificate or customer result.'
          : 'Show only the bound customer product in the requested image role, using its actual reference images. Preserve its complete identity; packaging and detail views require matching product evidence. Reuse matching approved media before requesting generation.';
    slot.composition = `${content} ${imageSubjectPolicy} Website colors, decorations and visual treatment belong in HTML/CSS. Do not bake site headings, navigation or buttons into the image.`;
    slot.mobileComposition = 'Preserve the same approved subject and product identity on narrow screens. Use crop, fit, focal point or a separately approved mobile image when needed; a mobile layout does not authorize changing the product or importing template demo subjects.';
  }
  // Example copy is layout context only and must never supply a generation subject.
  for (const slot of contract.textSlots) {
    slot.factualPolicy += ' Template example text is untrusted layout context and must not be used to choose an image subject or infer customer products, services or identity.';
  }
  return contract;
}

export function materialsRenderDraft(draft: Draft, original: MaterialsTemplateContract | undefined): Draft {
  if (!draft.materials || !usesImageContentRevision(draft.template, draft.materials.contractRevision) || !original) return draft;
  return { ...draft, materials: { ...draft.materials, contractRevision: original.contractRevision } };
}
