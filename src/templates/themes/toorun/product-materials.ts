import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';

export const toorunProductMaterialsRevision = '2026-10-02.toorun-early-learning-materials.2';
export const toorunProductRendererRevision = '2026-10-02.toorun-early-learning-product-native.1';
const one = { min: 1, max: 1, required: true, binding: 'supported' as const, repeat: 'once' as const };
const policy = 'Plain text from confirmed product and genuine brand facts only. Preserve proposed specifications as proposed. Never infer education, age suitability, safety, certification, manufacturing, availability, price, company history or delivery promises from the playful template. No HTML, fake reviews, staff or metrics.';
type Page = typeof materialsPages[number];
const copy = (id: string, page: Page, purpose: string, maxCodePoints: number, maxLines = 2): MaterialsTemplateContract['textSlots'][number] => ({ ...one, id, page, purpose, maxCodePoints, maxLines, format: 'plain-text', factSources: ['brand', 'product'], factualPolicy: policy });
const scene = (id: string, page: Page, width: number, height: number, purpose: string, composition: string): MaterialsTemplateContract['imageSlots'][number] => ({
  ...one, id, page, width, height, purpose, role: 'scene', materialSource: 'slot-image', productScope: 'single-product', sourcePolicy: 'product-reference', reusePolicy: 'generate-new', fit: 'cover', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  composition: `Generate an independent photograph for this exact region from its bound confirmed product reference. Use the shared website visual plan: warm natural light, restrained green/cream surroundings and occasional yellow, lilac or sky-blue supporting surfaces. Preserve the real product shape, colors, marks, material and scale. Never use the main image or an earlier scene as the final output; never recolor the product. No text or UI in the picture. ${composition}`,
  mobileComposition: 'Keep the complete product and meaningful action inside the central 65% of the frame, with at least 15% clear margin on every side. The rounded/rotated frame crops corners. Use the same factual scene and a separately composed mobile crop only if necessary; do not cut off essential parts.',
});
const heading = (region: string, page: Page, purpose: string) => [copy(`${region}-eyebrow`, page, `${purpose}: short label`, 45, 1), copy(`${region}-headline`, page, `${purpose}: heading`, 100), copy(`${region}-description`, page, `${purpose}: concise introduction`, 260, 3)];

/** A separate product contract: historical early-learning contracts stay frozen. */
export function getToorunProductMaterials(revision?: string): MaterialsTemplateContract | undefined {
  if (revision && revision !== toorunProductMaterialsRevision) return;
  return {
    schemaVersion: 'wr-template-materials-v1', templateId: 'toorun-early-learning', guideRevision: '2026-10-02.2', contractRevision: toorunProductMaterialsRevision, rendererRevision: toorunProductRendererRevision,
    materialsReady: true, pages: [...materialsPages], imagePolicy: 'typed-regions-v1', selectionGroups: { scene: 3, featured: 6 },
    websitePalette: { primary: '#3f6b52', secondary: '#f6c84c', background: '#fbf7ee', surface: '#d9ea8e', text: '#17251f', mutedText: '#647068' },
    requiredCapabilities: ['image.slot.v1', 'image.product-primary.v1', 'image.generate-new.v1', 'selection.product-groups.v1', 'text.plain.v1', 'website.visual-plan.v1'],
    imageSlots: [
      { ...one, id: 'product-main', page: 'catalog', purpose: 'Every selected product: the exact confirmed main image inside a native colored collection card and its detail page; all products remain reachable.', repeat: 'per-product', materialSource: 'product-primary', productScope: 'single-product', reusePolicy: 'same-product', width: 1200, height: 1200, fit: 'contain', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], composition: 'Reuse primaryMediaId exactly. These are display dimensions, not permission to regenerate, recolor or crop the source product.', mobileComposition: 'Contain the complete original main image.' },
      { ...scene('hero-scene', 'home', 1000, 1250, 'One independently generated portrait for every selected scene product in the first three differently shaped hero frames', 'Portrait 4:5. Full product from a clear three-quarter angle in a plausible setting with a quiet scale cue. Distinct environment appropriate to each bound product, shared lighting and palette. Subject centered, no close crop or inferred child suitability.'), repeat: 'per-selection', selectionGroup: 'scene' },
      scene('hero-scene-4', 'home', 1000, 1250, 'Right hero portrait: a new, quieter still life of the lead scene product', 'Portrait 4:5. New arrangement and camera angle, not a copy of hero 1. Full product on a believable surface; calm peripheral space.'),
      { ...scene('context-scene', 'home', 1000, 1400, 'One independent supported usage/environment scene per scene product in the upper three collage frames', 'Portrait 5:7. A fresh setting or supported interaction, different from the hero. Clear complete product/action in the middle; avoid faces, age claims, invented functions and accessories.'), repeat: 'per-selection', selectionGroup: 'scene' },
      ...[
        ['context-scene-4', 1200, 1200, 'Lower left collage frame: material or surface detail of a bound product', 'Square; closer texture view with enough recognizable product outline to establish identity. Do not invent internals or mechanisms.'],
        ['context-scene-5', 1200, 1200, 'Lower right collage frame: a distinct preparation or storage still life', 'Square; only supported assembly/storage states, no invented accessories or packaging.'],
      ].map(([id, width, height, purpose, composition]) => scene(String(id), 'home', Number(width), Number(height), String(purpose), String(composition))),
      scene('about-primary-image', 'about', 1200, 1260, 'About lead: product design, not a fictional childcare facility or factory', 'Portrait 20:21. Product construction and visible form in an appropriate clean environment. Keep the full subject central with margin for rounded corners.'),
      ...[
        ['about-scene-1', 1000, 1400, 'Large about design frame: a second product perspective', 'Portrait 5:7; a fresh view of another scene product, distinct from every homepage image. Depict externally evidenced materials and construction, never invisible mechanisms.'],
        ['about-scene-2', 1200, 1200, 'Smaller about design frame: scale and everyday context of the remaining scene product', 'Square; use a truthful scale cue and new camera angle. No invented accessories, staff, premises or packaging.'],
      ].map(([id, width, height, purpose, composition]) => scene(String(id), 'about', Number(width), Number(height), String(purpose), String(composition))),
    ],
    textSlots: [
      ...heading('hero', 'home', 'Playful but factual assortment introduction'),
      copy('primary-cta', 'home', 'Action that opens the full collection', 36, 1),
      ...heading('intro', 'home', 'Explain what connects these real products without implying one unsupported use for all of them'),
      ...heading('context', 'home', 'Explain the independent product scenes in the green five-frame collage'),
      copy('context-points', 'home', 'Up to four brief confirmed product facts; one per line, name the relevant product where needed', 340, 4),
      ...heading('catalog', 'catalog', 'The complete collection; every selected product is listed'),
      ...Array.from({ length: 3 }, (_, i) => [copy(`value-${i + 1}-title`, 'home', `Colored editorial card ${i + 1}: an evidenced product/design observation, not an invented brand promise`, 65), copy(`value-${i + 1}-description`, 'home', `Colored editorial card ${i + 1}: support its observation from the real inputs, naming the relevant product`, 230, 3)]).flat(),
      ...heading('process', 'contact', 'How to inspect the product collection and send a real enquiry'),
      ...Array.from({ length: 3 }, (_, i) => [copy(`process-${i + 1}-title`, 'contact', `Enquiry step ${i + 1}; browse, compare, then ask`, 65), copy(`process-${i + 1}-description`, 'contact', `Enquiry step ${i + 1}; describe only actions supported by this website, not delivery or response guarantees`, 180, 3)]).flat(),
      ...heading('faq', 'home', 'Product and enquiry questions'),
      ...Array.from({ length: 4 }, (_, i) => [copy(`faq-question-${i + 1}`, 'home', `Relevant product or enquiry question ${i + 1}`, 120), copy(`faq-answer-${i + 1}`, 'home', `Factual answer ${i + 1}; acknowledge unconfirmed details and preserve proposed qualifiers`, 380, 4)]).flat(),
      ...heading('about', 'about', 'Genuine company or product-design introduction'),
      copy('about-story', 'about', 'Tell the product/design story from the supplied facts; do not invent a company origin, team or facility', 700, 6),
      ...heading('about-context', 'about', 'Explain the two distinct design/detail scenes of the about spread'),
      copy('about-context-points', 'about', 'Up to four visible, confirmed design observations; one per line', 340, 4),
      { ...copy('company-about', 'about', 'Optional genuine saved company description, otherwise omit', 800, 6), min: 0, required: false, factSources: ['brand'] },
      ...heading('contact', 'contact', 'Invitation to ask about the selected products'),
      copy('contact-form-headline', 'contact', 'Heading of the real enquiry form', 80),
      copy('contact-form-description', 'contact', 'Ask for product, specification and quantity needs without any unsupported promise', 240, 3),
      copy('footer-headline', 'contact', 'Closing headline over the native cloud footer', 100),
      copy('footer-description', 'contact', 'Brief closing product invitation', 240, 3),
      copy('enquiry-cta', 'contact', 'Label for the actual enquiry action', 36, 1),
      ...materialsPages.flatMap(page => [copy(`${page}-seo-title`, page, `${page} search title`, 70, 1), copy(`${page}-seo-description`, page, `${page} search description`, 170)]),
    ],
    optionalSections: [{ id: 'company-evidence', reason: 'No fictional school, staff, parent testimonial, age/safety claim or facility evidence.' }],
    visualParameters: ['palette.primary', 'palette.secondary', 'palette.background', 'palette.surface', 'palette.text', 'palette.mutedText', 'backgroundStyle', 'imageTreatment', 'compositionSummary'], contentPolicy: 'b2b-confirmed-facts-only',
  };
}
