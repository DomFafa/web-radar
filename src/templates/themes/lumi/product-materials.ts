import { materialsPages, type MaterialsTemplateContract } from '../../../shared/materials';

export const lumiProductMaterialsRevision = '2026-10-02.lumi-business-materials.2';
export const lumiProductRendererRevision = '2026-10-02.lumi-business-product-native.1';
const base = { min: 1, max: 1, required: true, binding: 'supported' as const, repeat: 'once' as const };
const factualPolicy = 'Use confirmed product and genuine brand facts only. Retain proposed/unknown qualifiers. Adapt the voice to the actual assortment and audience; do not assume wholesale, consultancy, software, prices, availability, certifications, reviews, company history or staff. Write plain text that fits this specific region.';
type Page = typeof materialsPages[number];
const copy = (id: string, page: Page, purpose: string, maxCodePoints: number, maxLines = 2): MaterialsTemplateContract['textSlots'][number] => ({ ...base, id, page, purpose, maxCodePoints, maxLines, format: 'plain-text', factSources: ['brand', 'product'], factualPolicy });
const scene = (id: string, page: Page, width: number, height: number, purpose: string, composition: string): MaterialsTemplateContract['imageSlots'][number] => ({
  ...base, id, page, width, height, purpose, materialSource: 'slot-image', productScope: 'single-product', role: 'scene', sourcePolicy: 'product-reference', reusePolicy: 'generate-new', fit: 'cover', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  composition: `Create an independent photograph grounded in the bound original main image. Preserve exact product identity, proportions, colors, material and proposed status. Follow the Lumi website visual plan: airy daylight, pale blue and warm neutral surroundings, confident product scale. Never tint the product to match the palette. No baked-in text, UI, labels, invented business evidence or unsupported uses. ${composition}`,
  mobileComposition: 'Keep the whole product inside the central 70%, without clipping handles, ears, moving parts or accessories. Use a suitable mobile crop while preserving realistic scale.',
});

/** Candidate release: available by explicit revision; the current default remains unchanged. */
export function getLumiProductMaterials(revision?: string): MaterialsTemplateContract | undefined {
  if (revision !== lumiProductMaterialsRevision) return;
  return {
    schemaVersion: 'wr-template-materials-v1', templateId: 'lumi-business', guideRevision: '2026-10-02.2', contractRevision: lumiProductMaterialsRevision, rendererRevision: lumiProductRendererRevision,
    materialsReady: true, pages: [...materialsPages], imagePolicy: 'typed-regions-v1', selectionGroups: { scene: 3, featured: 6 },
    websitePalette: { primary: '#48a7ff', secondary: '#eebba5', background: '#f7f9fb', surface: '#ffffff', text: '#1a3b50', mutedText: '#5d7280' },
    requiredCapabilities: ['image.slot.v1', 'image.product-primary.v1', 'image.generate-new.v1', 'selection.product-groups.v1', 'text.plain.v1', 'website.visual-plan.v1'],
    imageSlots: [
      { ...base, id: 'product-main', page: 'catalog', purpose: 'Exact approved primary photograph in collection cards and detail; preserve product truth.', repeat: 'per-product', materialSource: 'product-primary', productScope: 'single-product', reusePolicy: 'same-product', width: 1200, height: 1200, fit: 'contain', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], composition: 'Use primaryMediaId exactly. Display size is not permission to redraw, recolor or crop the original.', mobileComposition: 'Contain the complete original image.' },
      scene('hero-scene', 'home', 1920, 1080, 'Large cinematic photograph below the centered gradient headline: introduce one representative real product.', 'Landscape 16:9. Product at useful, realistic scale within a believable environment. Editorial camera angle with generous surrounding atmosphere; the headline sits outside this image.'),
      { ...scene('product-context', 'home', 1440, 1200, 'Independent context photograph for each selected product in alternating editorial feature rows.', 'Landscape 6:5. Show a product-appropriate setting or supported use, distinct from the hero. Do not force a toy, appliance or soft object into the same environment. Leave no artificial text space.'), repeat: 'per-selection', selectionGroup: 'scene' },
      scene('about-wide', 'about', 1800, 1000, 'About opening photograph: introduce the real collection through a product, not an invented office or team.', 'Wide editorial photograph 9:5. Show the selected object in a fitting environment. Soft daylight and spatial depth, with the product fully readable.'),
      scene('about-detail', 'about', 1200, 1500, 'Supporting portrait in the design/material story, different from the about opening photograph.', 'Portrait 4:5. Photograph a verified material or construction detail with enough surrounding form to recognize the real object. No invented manufacturing process.'),
      scene('contact-scene', 'contact', 1200, 1500, 'Quiet product still life beside the genuine enquiry form.', 'Portrait 4:5. An inviting, uncluttered product still life. No telephone/office/team stock photograph, no signage or contact data in the image.'),
      { ...scene('detail-context', 'detail', 1600, 1000, 'Independent, product-specific wide photograph below each detail specification panel.', 'Landscape 8:5. Show a different supported context or viewing angle from the homepage product-context image. Do not reuse the main image or another slot scene.'), repeat: 'per-product' },
    ],
    textSlots: [
      copy('hero-eyebrow', 'home', 'Tiny label above the centered opening headline.', 44, 1),
      copy('hero-headline', 'home', 'Opening promise rooted in this assortment; the next separate phrase is italic.', 70, 2),
      copy('hero-emphasis', 'home', 'Short expressive continuation, rendered in Playfair italic.', 42, 1),
      copy('hero-subtitle', 'home', 'Explain what the visitor will discover, without unsupported claims.', 200, 3),
      copy('primary-cta', 'home', 'Action opening the product collection.', 30, 1),
      copy('hero-caption', 'home', 'Caption describing the bound hero product and setting, not a company claim.', 110, 2),
      copy('collection-eyebrow', 'catalog', 'Small collection section label.', 40, 1),
      copy('collection-headline', 'catalog', 'Heading above real product cards.', 80, 2),
      copy('collection-description', 'catalog', 'Short introduction to the actual product range.', 220, 3),
      copy('context-eyebrow', 'home', 'Label introducing the product context stories.', 40, 1),
      copy('context-headline', 'home', 'Heading for distinct real product uses or design details.', 80, 2),
      { ...copy('product-context-title', 'detail', 'Concise editorial title about this bound product, used in its detail and selected homepage story; no description of a specific photographed setting.', 65, 2), repeat: 'per-product' },
      { ...copy('product-context-copy', 'detail', 'Explain this bound product using confirmed facts for its detail and selected homepage story. Do not describe a specific photographed setting or infer performance from generated scenery.', 240, 3), repeat: 'per-product' },
      copy('about-eyebrow', 'about', 'About introduction label.', 40, 1),
      copy('about-headline', 'about', 'Introduce the actual collection or genuine brand, not a consulting business.', 80, 2),
      copy('about-description', 'about', 'Brief factual introduction. With no company profile, focus on the assortment.', 260, 3),
      copy('story-headline', 'about', 'Heading for a real product/material design story.', 90, 2),
      copy('story-copy', 'about', 'Product/design story grounded in the input. Do not invent founders, facilities or years of expertise.', 650, 6),
      { ...copy('company-about', 'about', 'Genuine saved company information only; omit if none exists.', 700, 6), min: 0, required: false, factSources: ['brand'] },
      copy('contact-headline', 'contact', 'Invitation to ask about a real product.', 90, 2),
      copy('contact-description', 'contact', 'Tell visitors what information to include; do not promise stock, lead times or reply times.', 220, 3),
      copy('contact-form-headline', 'contact', 'Short heading above the actual form.', 65, 2),
      copy('faq-headline', 'home', 'Title for useful product and enquiry questions.', 90, 2),
      ...Array.from({ length: 3 }, (_, i) => [copy(`faq-question-${i + 1}`, 'home', `Useful question ${i + 1} about the actual assortment.`, 120, 2), copy(`faq-answer-${i + 1}`, 'home', `Answer ${i + 1} from confirmed facts. State what needs confirmation if data is missing.`, 360, 4)]).flat(),
      copy('cta-headline', 'contact', 'Closing invitation before the footer.', 80, 2),
      copy('cta-button', 'contact', 'Enquiry action label.', 30, 1),
      ...materialsPages.flatMap(page => [copy(`${page}-seo-title`, page, `${page} search title.`, 70, 1), copy(`${page}-seo-description`, page, `${page} search description.`, 170, 2)]),
    ],
    optionalSections: [{ id: 'team', reason: 'No invented consulting staff.' }, { id: 'pricing', reason: 'No template pricing or invented offers.' }, { id: 'testimonials', reason: 'No sample reviews or performance counters.' }, { id: 'careers', reason: 'No invented vacancies.' }],
    visualParameters: ['palette.primary', 'palette.secondary', 'palette.background', 'palette.surface', 'palette.text', 'palette.mutedText', 'backgroundStyle', 'imageTreatment', 'compositionSummary'], contentPolicy: 'b2b-confirmed-facts-only',
  };
}
