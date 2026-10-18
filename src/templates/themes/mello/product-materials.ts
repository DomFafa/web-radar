import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';

export const melloProductMaterialsRevision = '2026-10-02.mello-coffee-materials.2';
export const melloProductRendererRevision = '2026-10-02.mello-coffee-product-native.1';
const one = { min: 1, max: 1, required: true, binding: 'supported' as const, repeat: 'once' as const };
const policy = 'Use concise plain text and confirmed product/brand facts only. Retain proposed qualifiers. The original cafe is a visual reference, not customer data: never invent food/drinks, prices, opening hours, physical premises, reviews, ratings, staff, certifications, safety, sales, lead times or response guarantees. No HTML.';
type Page = typeof materialsPages[number];
const copy = (id: string, page: Page, purpose: string, maxCodePoints: number, maxLines = 2): MaterialsTemplateContract['textSlots'][number] => ({ ...one, id, page, purpose, maxCodePoints, maxLines, format: 'plain-text', factSources: ['brand', 'product'], factualPolicy: policy });
const heading = (region: string, page: Page, purpose: string) => [copy(`${region}-eyebrow`, page, `${purpose}: short handwritten label`, 48, 1), copy(`${region}-headline`, page, `${purpose}: bold display heading`, 100), copy(`${region}-description`, page, `${purpose}: concise supporting copy`, 250, 3)];
const scene = (id: string, page: Page, width: number, height: number, purpose: string, composition: string): MaterialsTemplateContract['imageSlots'][number] => ({
  ...one, id, page, width, height, purpose, role: 'scene', materialSource: 'slot-image', productScope: 'single-product', sourcePolicy: 'product-reference', reusePolicy: 'generate-new', fit: 'cover', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  composition: `Generate a new independent website scene from the bound product reference, following the shared visual plan. Keep the original product shape, scale, material, marks and colors exactly identifiable. Use Mello's warm ivory, dark forest-green and restrained chartreuse as surrounding art direction, never recolor the product. No baked-in text/UI, cafe props unless this actual product requires them, fictional facilities, staff or certification evidence. Never deliver the original main image or reuse another slot's scene. ${composition}`,
  mobileComposition: 'Keep the complete product inside the central 70%, leaving at least 15% margin around its defining parts. Preserve the same context at 390px and avoid putting small key details at cropped edges. Only create a separate mobile crop if needed.',
});

export function getMelloProductMaterials(revision?: string): MaterialsTemplateContract | undefined {
  if (revision && revision !== melloProductMaterialsRevision) return;
  return {
    schemaVersion: 'wr-template-materials-v1', templateId: 'mello-coffee', guideRevision: '2026-10-02.2', contractRevision: melloProductMaterialsRevision, rendererRevision: melloProductRendererRevision,
    materialsReady: true, pages: [...materialsPages], imagePolicy: 'typed-regions-v1', selectionGroups: { scene: 3, featured: 6 },
    websitePalette: { primary: '#78bf30', secondary: '#284010', background: '#e9ebdf', surface: '#f3f4eb', text: '#284010', mutedText: '#56624c' },
    requiredCapabilities: ['image.slot.v1', 'image.product-primary.v1', 'image.generate-new.v1', 'selection.product-groups.v1', 'text.plain.v1', 'website.visual-plan.v1'],
    imageSlots: [
      { ...one, id: 'product-main', page: 'catalog', purpose: 'Exact original main image for every product in the native collection and detail pages', repeat: 'per-product', materialSource: 'product-primary', productScope: 'single-product', reusePolicy: 'same-product', width: 1200, height: 1200, fit: 'contain', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], composition: 'Reuse primaryMediaId exactly. Display targets never authorize regeneration, recoloring or cropping.', mobileComposition: 'Contain the complete original main image.' },
      scene('hero-scene', 'home', 1600, 1200, 'Large lead product scene under Mello’s oversized centered title; caption is HTML outside the image', 'Landscape 4:3. Hero subject centered with believable support surface and clear scale. Give the product a strong silhouette; keep the background quieter than the product.'),
      { ...scene('featured-scene', 'home', 1200, 1500, 'One independent scene per selected scene product, arranged as one large and two stacked editorial panels', 'Portrait 4:5. The first selected scene product occupies the tall left panel: keep its complete silhouette in the central 65% width and upper 70% height. Remaining selected products occupy shorter right panels, center-cropped to approximately 4:3 on desktop: keep their complete silhouette in the central 50% height and 70% width, with quiet surroundings. Keep the lower caption band simple; captions are separate HTML. All panels return to portrait on mobile. Different arrangements from the hero and the context scenes.'), repeat: 'per-selection', selectionGroup: 'scene' },
      { ...scene('context-scene', 'home', 1536, 1024, 'One independent supported usage or placement scene per scene product in the native image-and-tab section', 'Landscape 3:2. Explain an evidenced use or meaningful physical detail of this product through a new context. Product/action centered; no collage, no invented feature or accessory, no reused featured image.'), repeat: 'per-selection', selectionGroup: 'scene' },
      scene('about-primary-image', 'about', 1536, 1024, 'About lead: an independent product/design scene accompanying genuine facts', 'Landscape 3:2. Show the product in a truthful design/material context. No invented workshop, factory, team or retail location.'),
      scene('about-detail-image', 'about', 1200, 1500, 'About editorial detail: a distinct second product or a supported detail of the same product', 'Portrait 4:5. Fresh camera angle/arrangement to explain visible finish, shape or supported handling. Enough complete product outline to identify it; no invented internals.'),
      scene('contact-scene', 'contact', 1200, 1000, 'Independent product still life in the contact page’s bordered information panel', 'Landscape 6:5. Calm inviting product composition with no contact details or text in the image. Keep the whole product visible; no fictional shopfront or company signs.'),
    ],
    textSlots: [
      ...heading('hero', 'home', 'Lead product-collection introduction'),
      copy('primary-cta', 'home', 'Action opening the full collection', 36, 1),
      copy('hero-note', 'home', 'Tiny handwritten editorial note beside the lead product, not a quality or certification claim', 55),
      ...heading('featured', 'home', 'Asymmetric product scene panels'),
      ...heading('comparison', 'home', 'Menu-style factual specification list; never prices unless confirmed inputs contain them'),
      ...heading('philosophy', 'about', 'What is known about the products and genuine brand'),
      copy('receipt-title', 'about', 'Heading on the perforated product-facts receipt', 60),
      copy('receipt-note', 'about', 'Short handwritten closing note; no invented score, total price or quality claim', 90),
      ...heading('context', 'home', 'Tabbed product contexts; each panel binds its image and copy to the same product'),
      { ...copy('context-caption', 'home', 'For this product only: explain a confirmed intended context in the catalog and, when selected, the matching context-scene panel. If no application is confirmed, describe visible form/material without claiming performance.', 240, 3), repeat: 'per-product', factSources: ['product'] },
      copy('collection-note', 'home', 'Large editorial closing line grounded in these products; never pretend this is a customer quote or review', 180, 3),
      ...heading('catalog', 'catalog', 'Complete collection with exact product main images'),
      ...heading('about', 'about', 'Real company or product-design introduction'),
      copy('about-story', 'about', 'Product/design story from supplied facts; no imaginary company origin or facility', 700, 6),
      copy('about-detail-headline', 'about', 'Heading for a distinct material/form detail in the second about scene', 90),
      copy('about-detail-description', 'about', 'Describe the visible, confirmed detail; identify the relevant product, retain proposed qualifiers', 380, 4),
      { ...copy('company-about', 'about', 'Optional actual saved company description, omitted if unavailable', 800, 6), min: 0, required: false, factSources: ['brand'] },
      ...heading('contact', 'contact', 'Real product enquiry invitation'),
      copy('contact-form-headline', 'contact', 'Heading for the actual enquiry form', 80),
      copy('contact-form-description', 'contact', 'Ask for product and quantity requirements; no response or fulfillment promise', 230, 3),
      ...heading('closing', 'contact', 'Closing contact invitation in the native dark bordered panel'),
      copy('enquiry-cta', 'contact', 'Action opening product enquiries', 36, 1),
      ...materialsPages.flatMap(page => [copy(`${page}-seo-title`, page, `${page} search title`, 70, 1), copy(`${page}-seo-description`, page, `${page} search description`, 170)]),
    ],
    optionalSections: [{ id: 'cafe-evidence', reason: 'Fake cafe menus, prices, hours, locations, reviews and ratings are not product facts.' }],
    visualParameters: ['palette.primary', 'palette.secondary', 'palette.background', 'palette.surface', 'palette.text', 'palette.mutedText', 'backgroundStyle', 'imageTreatment', 'compositionSummary'], contentPolicy: 'b2b-confirmed-facts-only',
  };
}
