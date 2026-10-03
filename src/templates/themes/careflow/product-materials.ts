import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';

export const careflowProductMaterialsRevision = '2026-10-02.careflow-healthcare-materials.2';
export const careflowProductRendererRevision = '2026-10-02.careflow-healthcare-product-native.1';
const once = { min: 1, max: 1, required: true, binding: 'supported' as const, repeat: 'once' as const };
type Page = typeof materialsPages[number];
const factualPolicy = 'Use confirmed real brand and bound product facts only. The reference hospital, clinicians, appointments, specialists, patient stories, ratings, addresses, insurance and medical outcomes are not customer facts. Never invent materials, dimensions, features, staff, facilities, certification, sales, prices, delivery or response promises. Preserve proposed, conflicting and missing specifications. Plain text only.';
const copy = (id: string, page: Page, purpose: string, maxCodePoints: number, maxLines = 1): MaterialsTemplateContract['textSlots'][number] => ({ ...once, id, page, purpose, maxCodePoints, maxLines, format: 'plain-text', factSources: ['brand', 'product'], factualPolicy });
const scene = (id: string, page: Page, width: number, height: number, purpose: string, composition: string): MaterialsTemplateContract['imageSlots'][number] => ({
  ...once, id, page, width, height, purpose, materialSource: 'slot-image', productScope: 'single-product', role: 'scene', sourcePolicy: 'product-reference', reusePolicy: 'generate-new', fit: 'cover', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  composition: `Generate one independent photographic scene from the bound real product's approved primary image and available facts. Preserve identity, geometry, actual color/material, markings and included parts. Follow the shared approved website visual plan; coordinate surroundings without changing the product. Do not infer a hospital, doctor, patient, service, clinical use or premises from the template. No added text, UI, labels, repeated extra products or invented evidence. ${composition}`,
  mobileComposition: 'Retain the complete bound product inside the central 60% with breathing room. Keep known scale consistent but never invent unknown measurements. Choose a separate mobile crop when required by the desktop text overlay; do not crop product parts to satisfy a template box.',
});

/** Native medical blocks are repurposed only where they help explain real products; discarded staff/maps have no slots. */
export function getCareflowProductMaterials(revision?: string): MaterialsTemplateContract | undefined {
  if (revision && revision !== careflowProductMaterialsRevision) return;
  return {
    schemaVersion: 'wr-template-materials-v1', templateId: 'careflow-healthcare', guideRevision: '2026-10-02.2', contractRevision: careflowProductMaterialsRevision, rendererRevision: careflowProductRendererRevision,
    materialsReady: true, imagePolicy: 'typed-regions-v1', pages: [...materialsPages], selectionGroups: { scene: 3, featured: 6 },
    websitePalette: { primary: '#0d142a', secondary: '#6197de', background: '#ffffff', surface: '#ebf4ff', text: '#0d142a', mutedText: '#586168' },
    requiredCapabilities: ['image.slot.v1', 'image.product-primary.v1', 'image.generate-new.v1', 'selection.product-groups.v1', 'text.plain.v1', 'website.visual-plan.v1'],
    imageSlots: [
      { ...once, id: 'product-main', page: 'catalog', purpose: 'Each original main image in compact collection cards, complete catalog and its sticky product detail; never replaces scene regions', repeat: 'per-product', materialSource: 'product-primary', productScope: 'single-product', reusePolicy: 'same-product', width: 1200, height: 900, fit: 'contain', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], composition: 'Use primaryMediaId exactly. The 4:3 box is a display target; do not redraw, recolor, crop, add claims or invent another product angle.', mobileComposition: 'Contain the complete approved original image.' },
      scene('home-hero', 'home', 2752, 1412, 'Large rounded Careflow hero behind the live lower-left frosted title card', 'Landscape 688:353. Keep the whole product toward x=62–82%, y=20–75%, leaving the lower-left 48% calm for the HTML card and the top edge quiet for navigation. No generated text; HTML supplies title contrast. Avoid edge cropping on tall or wide products.'),
      scene('home-material-scene', 'home', 1136, 1204, 'Portrait editorial product construction/design photo opposite native expandable confirmed-fact panels', 'Portrait 284:301. Show one recognizable product and a supported visible detail. Preserve known surface and material; do not invent technical internals, medical efficacy or factory activity. Full subject in central 65%; a distinct camera viewpoint from hero.'),
      { ...scene('home-context-scene', 'home', 1200, 1500, 'One independently generated context per selected product in the native horizontal discovery cards, replacing clinician profiles', 'Portrait 4:5. Distinct believable environment and framing for each bound product, matching supported use or physical form. Keep all product parts within the central 70%. Product labels and descriptions are separate HTML below the photo, never staff identities or testimonials.'), repeat: 'per-selection', selectionGroup: 'scene' },
      scene('about-wide-scene', 'about', 1004, 892, 'Wide-left image in the asymmetric about mosaic: collection/product design context, never staff or facilities', 'Landscape 251:223. A recognizable bound product in a spacious editorial context, complete inside central 70%. Distinct from home hero. It illustrates the product introduction, not actual company operations.'),
      scene('about-portrait-scene', 'about', 764, 892, 'Tall-center image in the asymmetric about mosaic: supported form/construction view of another suitable product', 'Portrait 191:223. Keep product centered and complete. Prefer another product when available; if the same product is chosen, use a distinct angle/detail and surroundings from the other mosaic images. No invented components or claimed staff activity.'),
      scene('about-detail-scene', 'about', 1004, 892, 'Right image in the native about mosaic: third independent product context; fills a real editorial role instead of a clinician photo', 'Landscape 251:223. Show an independently composed product context or visible design detail, preserving complete identity and known scale. Do not duplicate the wide-left or portrait scene. Reserve calm margins for the native rounded crop.'),
      scene('contact-scene', 'contact', 2752, 1412, 'Wide rounded product photograph after the enquiry FAQ, replacing the sample map; actual contact information remains live HTML', 'Landscape 688:353. Place product center-right with a clear central-safe subject and relaxed space left for a contact card. No map, address, doctor or invented location. Different framing from the home hero.'),
      { ...scene('detail-context-scene', 'detail', 2752, 1412, 'One independent usage/form context per product below its original sticky detail and working enquiry, replacing the sample location block', 'Landscape 688:353. Only the bound detail product, complete in the central 70%, in a supported context. Different composition from its home discovery portrait; do not inherit old source galleries or invent additional parts/functions.'), repeat: 'per-product' },
    ],
    textSlots: [
      copy('hero-eyebrow', 'home', 'Short factual collection label replacing the reference star-rating row', 40),
      copy('hero-headline', 'home', 'Three-line maximum headline inside the frosted hero card', 90, 3),
      copy('hero-subtitle', 'home', 'Concise collection description inside the hero card', 240, 4),
      copy('primary-cta', 'home', 'Hero action to the complete catalog; no appointment promise', 32),
      copy('feature-headline', 'home', 'Title above the native facts-and-portrait composition', 95, 3),
      copy('feature-description', 'home', 'Explain supported product construction/design facts, matching the bound feature photo', 260, 4),
      copy('context-headline', 'home', 'Title above horizontal independent product context cards', 80, 2),
      copy('context-description', 'home', 'Explain this real collection discovery section without staff/service claims', 220, 3),
      copy('featured-headline', 'home', 'Title of compact original-image featured product cards', 80, 2),
      copy('featured-description', 'home', 'Short collection note; every remaining product is in the catalog', 200, 3),
      copy('catalog-headline', 'catalog', 'Complete product catalog title in the native pale-blue introduction', 80, 2),
      copy('catalog-description', 'catalog', 'Catalog overview with no invented medical specialities or service categories', 240, 4),
      copy('about-headline', 'about', 'Opening title above the asymmetric three-photo product mosaic', 90, 3),
      copy('about-description', 'about', 'Overview of confirmed brand/product facts', 260, 4),
      copy('about-story-headline', 'about', 'Real company/collection story title; no implied clinical team', 85, 2),
      copy('about-story-description', 'about', 'Evidence-based product or collection introduction under the mosaic', 500, 8),
      { ...copy('company-about', 'about', 'Optional verified company introduction; omit the block when no real facts exist', 1400, 14), min: 0, required: false, factSources: ['brand'] },
      copy('contact-headline', 'contact', 'Title above the native two-column enquiry and contact-card composition', 85, 3),
      copy('contact-description', 'contact', 'Invite a product enquiry, without appointments or guaranteed response times', 220, 4),
      copy('contact-form-headline', 'contact', 'Actual product enquiry form heading', 65, 2),
      copy('contact-form-description', 'contact', 'Explain which product and questions to include in the message', 220, 4),
      copy('contact-scene-headline', 'contact', 'Live title beside the wide product contact scene; no invented location', 80, 2),
      copy('detail-facts-headline', 'detail', 'Title above confirmed description/material/dimensions beside the original image', 60, 2),
      { ...copy('product-context-caption', 'detail', 'Per-product context caption used by its selected home card and its own detail scene; only known facts or supported use', 180, 3), repeat: 'per-product' },
      copy('faq-headline', 'contact', 'Heading of the product/enquiry FAQ, also used on about', 80, 2),
      ...Array.from({ length: 4 }, (_, i) => [copy(`faq-question-${i + 1}`, 'contact', `Product or enquiry question ${i + 1}; no availability, security or clinical assumptions`, 120, 2), copy(`faq-answer-${i + 1}`, 'contact', `Factual answer ${i + 1}; unknown specifics are questions for the enquiry, never invented policy`, 320, 5)]).flat(),
      copy('cta-headline', 'home', 'Final pale-blue product enquiry band title', 80, 2),
      copy('cta-description', 'home', 'Short final enquiry invitation without invented guarantees', 180, 3),
      copy('inquiry-cta', 'contact', 'Enquiry button used by header, form-adjacent links, detail and CTA', 32),
      ...materialsPages.flatMap(page => [copy(`${page}-seo-title`, page, `${page} search title`, 70), copy(`${page}-seo-description`, page, `${page} search description`, 170, 3)]),
    ],
    optionalSections: [{ id: 'company-introduction', reason: 'No real company description means no staff/history/statistics section or placeholder fact.' }],
    visualParameters: ['palette.primary'], contentPolicy: 'b2b-confirmed-facts-only',
  };
}
