import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';
import { isProductAboutCollectionRevision, isProductGalleryRevision } from '../../../shared/product-native-materials';
import { productGalleryContract } from '../../product-gallery-materials';
import { productAboutCollectionContract } from '../../product-about-collection-materials';

export const pawfectLegacyMaterialsRevision = '2026-10-02.pawfect-groom-materials.2';
export const pawfectMaterialsRevision = '2026-10-02.pawfect-groom-materials.3';
export const pawfectRendererRevision = '2026-10-02.pawfect-groom-native.3';
const base = { min: 1, max: 1, required: true, binding: 'supported' as const, repeat: 'once' as const };
const factualPolicy = 'Use only confirmed product and real brand facts. Preserve proposed specifications as proposed. Do not invent company history, facilities, staff, certifications, reviews, prices, availability or safety claims. Template sample pet-grooming content is not a customer fact. Write concise copy for this specific region, without HTML.';
type Page = typeof materialsPages[number];
const copy = (id: string, page: Page, purpose: string, maxCodePoints: number, maxLines = 1): MaterialsTemplateContract['textSlots'][number] => ({
  ...base, id, page, purpose, maxCodePoints, maxLines, format: 'plain-text', factSources: ['brand', 'product'], factualPolicy,
});
const scene = (id: string, page: Page, width: number, height: number, purpose: string, composition: string): MaterialsTemplateContract['imageSlots'][number] => ({
  ...base, id, page, width, height, purpose, materialSource: 'slot-image', productScope: 'single-product', role: 'scene',
  sourcePolicy: 'product-reference', reusePolicy: 'generate-new', fit: 'cover', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  composition: `Generate a new, independent website scene from the bound confirmed main image. Preserve the real product identity, material, dimensions and proposed status. Follow the shared approved website visual plan. No text, labels or website UI in the image; no invented company evidence. ${composition}`,
  mobileComposition: 'Keep the complete product in the central 70% with room around its edges. Preserve physical scale and the same visual plan; use a separate mobile crop only when needed.',
});

export function getPawfectMaterialsTemplate(revision?: string): MaterialsTemplateContract | undefined {
  if (isProductAboutCollectionRevision('pawfect-groom', revision)) return productAboutCollectionContract(productGalleryContract(getPawfectMaterialsTemplate(pawfectMaterialsRevision)!));
  if (isProductGalleryRevision('pawfect-groom', revision)) return productGalleryContract(getPawfectMaterialsTemplate(pawfectMaterialsRevision)!);
  if (revision && revision !== pawfectMaterialsRevision && revision !== pawfectLegacyMaterialsRevision) return;
  return {
    schemaVersion: 'wr-template-materials-v1', templateId: 'pawfect-groom', guideRevision: '2026-10-02.1', contractRevision: revision || pawfectMaterialsRevision,
    rendererRevision: revision === pawfectLegacyMaterialsRevision ? '2026-10-02.pawfect-groom-native.2' : pawfectRendererRevision, materialsReady: true, pages: [...materialsPages], imagePolicy: 'typed-regions-v1',
    selectionGroups: { scene: 3, featured: 6 },
    websitePalette: { primary: '#327f85', secondary: '#c9833a', background: '#faf8f3', surface: '#f0eee6', text: '#203337', mutedText: '#617071' },
    requiredCapabilities: ['image.slot.v1', 'image.product-primary.v1', 'image.generate-new.v1', 'selection.product-groups.v1', 'text.plain.v1', 'website.visual-plan.v1'],
    imageSlots: [
      { ...base, id: 'product-main', page: 'catalog', purpose: 'Retain each confirmed main image exactly in the native catalog and product detail. No old scene or set images are inherited.', repeat: 'per-product',
        materialSource: 'product-primary', productScope: 'single-product', reusePolicy: 'same-product', width: 1536, height: 1024, fit: 'contain', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        composition: 'Use primaryMediaId exactly, without redrawing, recoloring or cropping the product. Dimensions are a display target only.', mobileComposition: 'Contain the complete approved main image.' },
      scene('hero-portrait', 'home', 1200, 1400, 'Representative product in the organic homepage hero; choose a suitable bound product', 'Portrait 6:7. Place the product centrally inside an organic crop-safe area. Choose a believable environment and scale cue appropriate to this product; leave breathing room.'),
      scene('feature-scene', 'home', 1200, 1000, 'Product usage or construction scene in the right half of the feature section', 'Landscape 6:5. Show a supported use or material detail appropriate to the product. Keep the main subject clear in the center; do not imply unsupported functions.'),
      { ...scene('gallery-scene', 'home', 1200, 1500, 'One independent new scene for each selected scene product; shared visual plan across the gallery', 'Portrait 4:5. Distinct composition appropriate to the bound product, preserving its shape and real scale. No packaging redesign or montage.'), repeat: 'per-selection', selectionGroup: 'scene' },
      scene('about-primary-image', 'about', 1536, 1024, 'Lead product-design scene in the about page feature section', 'Landscape 3:2. Illustrate the product or confirmed design discussion. Never portray an invented factory, workplace, employee or certification.'),
      scene('about-secondary-image', 'about', 1536, 1024, 'Supporting design scene in the about page story section', 'Landscape 3:2. Use a distinct angle and arrangement from the lead image, consistent with the shared visual plan. No invented business evidence.'),
      scene('contact-scene', 'contact', 1200, 1000, 'Inviting product still life beside the genuine enquiry form', 'Landscape 6:5. Keep the complete product visible in a calm, context-appropriate environment. No company signs, addresses or claims.'),
    ],
    textSlots: [
      copy('hero-eyebrow', 'home', 'Short product-family introduction above the headline', 60),
      copy('hero-headline', 'home', 'First part of the hero headline; separate from the emphasized phrase', 60, 2),
      copy('hero-emphasis', 'home', 'Concise final hero phrase rendered with the template accent color and underline', 60, 2),
      copy('hero-subtitle', 'home', 'Short introduction to the confirmed assortment', 260, 3),
      copy('primary-cta', 'home', 'Catalog action label', 36),
      copy('hero-secondary-cta', 'home', 'Action label that opens the new scene gallery', 36),
      copy('hero-trust-lines', 'home', 'Up to three short factual assortment labels, one per line; no invented endorsements', 140, 3),
      copy('hero-orbit', 'home', 'Tiny decorative badge copy, at most two short lines', 48, 2),
      copy('hero-photo-tag', 'home', 'Short scene caption below the organic hero image', 70),
      ...(['catalog', 'gallery', 'categories'] as const).flatMap(region => [
        copy(`${region}-eyebrow`, region === 'catalog' ? 'catalog' : 'home', `Short ${region} section label`, 60),
        copy(`${region}-headline`, region === 'catalog' ? 'catalog' : 'home', `${region} section heading`, 100, 2),
        copy(`${region}-description`, region === 'catalog' ? 'catalog' : 'home', `Concise ${region} introduction; products and captions remain bound by product ID`, 220, 3),
      ]),
      copy('feature-eyebrow', 'home', 'Feature section label', 60),
      copy('feature-headline', 'home', 'Feature headline grounded in the actual products', 100, 2),
      copy('feature-points', 'home', 'Up to four short confirmed feature or specification points, one per line; retain proposed qualifiers', 400, 4),
      copy('feature-link', 'home', 'About-page action label', 36),
      copy('faq-eyebrow', 'home', 'FAQ section label', 40),
      copy('faq-headline', 'home', 'FAQ heading', 100, 2),
      copy('faq-description', 'home', 'Short FAQ introduction', 220, 3),
      ...Array.from({ length: 4 }, (_, index) => [
        copy(`faq-question-${index + 1}`, 'home', `Relevant product or enquiry question ${index + 1}`, 120, 2),
        copy(`faq-answer-${index + 1}`, 'home', `Answer ${index + 1} from confirmed facts; acknowledge unknown details rather than inventing them`, 400, 4),
      ]).flat(),
      copy('about-eyebrow', 'about', 'Design or genuine brand introduction label', 60),
      copy('about-headline', 'about', 'First part of the about headline', 80, 2),
      copy('about-emphasis', 'about', 'Accented final phrase of the about headline', 80, 2),
      copy('about-description', 'about', 'Short introduction grounded in the product or genuine company profile', 280, 3),
      copy('about-story-headline', 'about', 'Product/design story section heading', 100, 2),
      copy('about-story', 'about', 'Product or design story from confirmed input; not fictional company history', 900, 6),
      { ...copy('company-section-title', 'about', 'Heading for the real company introduction; omit the section when no company facts are available', 80, 2), min: 0, required: false },
      { ...copy('company-about', 'about', 'Real saved company description only; omit if unavailable', 1000, 8), min: 0, required: false, factSources: ['brand'] },
      copy('contact-eyebrow', 'contact', 'Enquiry introduction label', 60),
      copy('contact-headline', 'contact', 'First part of the contact headline', 80, 2),
      copy('contact-emphasis', 'contact', 'Accented final phrase of the contact headline', 80, 2),
      copy('contact-description', 'contact', 'Brief enquiry invitation, without unsupported response-time or availability promises', 280, 3),
      copy('contact-form-headline', 'contact', 'Heading beside the real enquiry form', 80, 2),
      copy('contact-form-description', 'contact', 'Instruction for requesting actual product details', 220, 3),
      copy('cta-eyebrow', 'contact', 'Footer call-to-action label', 60),
      copy('cta-headline', 'contact', 'Short closing enquiry heading', 100, 2),
      copy('cta-description', 'contact', 'Closing enquiry introduction', 220, 3),
      copy('cta-button', 'contact', 'Contact action label', 36),
      ...materialsPages.flatMap(page => [copy(`${page}-seo-title`, page, `${page} search title`, 70), copy(`${page}-seo-description`, page, `${page} search description`, 170, 2)]),
    ],
    optionalSections: [{ id: 'testimonials', reason: 'Template sample reviews are not company facts.' }, { id: 'team', reason: 'Template sample staff are not the real company.' }],
    visualParameters: ['palette.primary', 'palette.secondary', 'palette.background', 'palette.surface', 'palette.text', 'palette.mutedText', 'backgroundStyle', 'imageTreatment', 'compositionSummary'],
    contentPolicy: 'b2b-confirmed-facts-only',
  };
}
