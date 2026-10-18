import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';

export const auravellProductMaterialsRevision = '2026-10-02.auravell-materials.2';
export const auravellProductRendererRevision = '2026-10-02.auravell-product-native.1';
const once = { min: 1, max: 1, required: true, binding: 'supported' as const, repeat: 'once' as const };
type Page = typeof materialsPages[number];
const factualPolicy = 'Write only confirmed brand and bound product facts. Template yoga, wellness, instructors, memberships, timetables, reviews and studio examples are not customer facts. Do not invent materials, dimensions, benefits, staff, facilities, certifications, prices, availability, delivery promises or company history. Preserve missing/conflicting facts and proposed specifications. Plain text only.';
const copy = (id: string, page: Page, purpose: string, maxCodePoints: number, maxLines = 1): MaterialsTemplateContract['textSlots'][number] => ({ ...once, id, page, purpose, maxCodePoints, maxLines, format: 'plain-text', factSources: ['brand', 'product'], factualPolicy });
const scene = (id: string, page: Page, width: number, height: number, purpose: string, composition: string): MaterialsTemplateContract['imageSlots'][number] => ({
  ...once, id, page, width, height, purpose, materialSource: 'slot-image', productScope: 'single-product', role: 'scene', sourcePolicy: 'product-reference', reusePolicy: 'generate-new', fit: 'cover', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  composition: `Create a distinct new photographic scene for the bound real product, from its approved original main image and known facts. Keep its identity, geometry, surface, actual color, markings and included parts unchanged. Use the shared approved website visual plan; coordinate the environment without recoloring the product. Do not infer yoga, wellness, people, premises or functions from the template. No website UI, added text, extra product copies or invented business evidence. ${composition}`,
  mobileComposition: 'Keep the complete product in the central 60% with breathing room on all sides. Preserve known scale cues without inventing unknown dimensions. Supply a separate mobile crop only when the stated desktop text-safe area cannot retain the entire product; never crop or redesign the product to fit.',
});

/** Each purpose maps to a rendered native block; removed industry sections have no executable slots. */
export function getAuravellProductMaterials(revision?: string): MaterialsTemplateContract | undefined {
  if (revision && revision !== auravellProductMaterialsRevision) return;
  return {
    schemaVersion: 'wr-template-materials-v1', templateId: 'auravell', guideRevision: '2026-10-02.2', contractRevision: auravellProductMaterialsRevision, rendererRevision: auravellProductRendererRevision,
    materialsReady: true, imagePolicy: 'typed-regions-v1', pages: [...materialsPages], selectionGroups: { scene: 3, featured: 6 },
    websitePalette: { primary: '#99582a', secondary: '#c7b09b', background: '#fef9ef', surface: '#f5ede1', text: '#17181a', mutedText: '#6b665f' },
    requiredCapabilities: ['image.slot.v1', 'image.product-primary.v1', 'image.generate-new.v1', 'selection.product-groups.v1', 'text.plain.v1', 'website.visual-plan.v1'],
    imageSlots: [
      { ...once, id: 'product-main', page: 'catalog', purpose: 'The exact approved primary image in the catalog, compact featured cards, hero product overview and detail. Every product remains available; originals are contained, never repainted.', repeat: 'per-product', materialSource: 'product-primary', productScope: 'single-product', reusePolicy: 'same-product', width: 1200, height: 900, fit: 'contain', allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], composition: 'Use primaryMediaId exactly. The 4:3 target is a display box, not permission to crop, redraw, recolor or manufacture a new view.', mobileComposition: 'Contain the full original image and all included parts.' },
      scene('home-hero', 'home', 3456, 1800, 'Full-screen Auravell photographic hero behind live serif text and a separate original-product overview card', 'Panoramic 48:25. Put the complete subject near center-right, within x=45–73%, y=16–76%. Reserve the lower-left 45% for live white text and the far-right lower quarter for the HTML overview card. Keep the top 12% calm for floating navigation. Contrast is provided by HTML gradients, not image text.'),
      { ...scene('home-context-scene', 'home', 1008, 1200, 'Up to three independent portrait contexts, one per selected product, in the native hover cards and mobile horizontal gallery', 'Portrait 21:25. Each product gets a distinct supported context and viewpoint. Center the entire product within the middle 65%. Reserve the lower 20% for an HTML caption overlay. No people required; do not imply unsupported use or performance.'), repeat: 'per-selection', selectionGroup: 'scene' },
      scene('home-material-scene', 'home', 1536, 1200, 'Large editorial photo beside confirmed construction/material or design-detail copy; this replaces the yoga philosophy feature', 'Landscape 32:25. Show a recognizable product and a useful visible construction detail. Keep full identity and known material true; do not invent internal mechanisms, certifications or cutaway parts. Compose differently from hero and context portraits.'),
      scene('about-hero-scene', 'about', 1920, 1080, 'Wide opening photograph supporting the real brand/product introduction, replacing the yoga beach hero', 'Landscape 16:9. Place the complete product around center-right, with quiet left-side space for a live title. It is product editorial imagery, never proof of a factory, studio, staff or company history.'),
      scene('about-story-scene', 'about', 1536, 1200, 'Second independent editorial image next to an evidence-based product or collection story', 'Landscape 32:25. Use another bound product or a distinct angle and environment when only one exists. Show visible form or a supported usage detail; do not recreate the hero framing or invent company operations.'),
      scene('contact-scene', 'contact', 1200, 1500, 'Portrait product image next to the actual enquiry form, replacing the yoga preparation photo', 'Portrait 4:5. Calm product context, complete subject in the central 60%, spare margins. No staff likeness, phone numbers, maps, location evidence or service promises.'),
      { ...scene('detail-context-scene', 'detail', 1536, 1152, 'One newly generated context for each product beneath its original main image; never inherits source scene galleries', 'Landscape 4:3. Only the bound detail product in a supported environment with a different view/composition from its home context. Preserve included parts and known specifications; keep the subject inside the central 70%.'), repeat: 'per-product' },
      scene('footer-scene', 'home', 1920, 800, 'Shared darkened photographic footer/CTA background across the five pages; a single deliberate global visual, not a per-page gallery image', 'Panoramic 12:5. Put a complete bound product toward the right half with quiet surroundings; leave center-left 60% clear for live white CTA and contact text. Darkness and contrast are applied by the page overlay. Do not repeat hero composition.'),
    ],
    textSlots: [
      copy('hero-eyebrow', 'home', 'Short brand/collection introduction above the serif hero', 40),
      copy('hero-headline', 'home', 'Main serif hero phrase before its italic emphasis', 58, 2),
      copy('hero-emphasis', 'home', 'Separate italic hero emphasis; part of the same factual proposition', 40, 2),
      copy('hero-subtitle', 'home', 'Two-to-four-line product collection introduction under the hero', 220, 4),
      copy('primary-cta', 'home', 'Hero link to the complete product catalog', 30),
      copy('hero-product-label', 'home', 'Label identifying the original-product overview card; no invented schedules', 30),
      copy('context-eyebrow', 'home', 'Portrait context gallery overline', 30),
      copy('context-headline', 'home', 'Title of the three independent product contexts', 80, 2),
      copy('context-description', 'home', 'Brief explanation of the product contexts without unsupported uses', 200, 3),
      copy('material-eyebrow', 'home', 'Editorial material/design feature overline', 30),
      copy('material-headline', 'home', 'Feature title based on visible construction or confirmed material facts', 80, 2),
      copy('material-description', 'home', 'Feature copy describing only known product design or proposed status', 300, 5),
      copy('featured-headline', 'home', 'Title above compact original-image featured products', 70, 2),
      copy('featured-description', 'home', 'Short factual collection overview; all other products remain in catalog', 180, 3),
      copy('catalog-headline', 'catalog', 'Native catalog title; all confirmed products below', 80, 2),
      copy('catalog-description', 'catalog', 'Catalog introduction with no invented class categories, prices or schedule', 240, 4),
      copy('about-eyebrow', 'about', 'Real brand/product introduction overline', 30),
      copy('about-headline', 'about', 'Opening about-page title over the wide scene', 80, 2),
      copy('about-description', 'about', 'Overview from confirmed brand or collection facts', 240, 4),
      copy('about-story-headline', 'about', 'Second editorial story title about confirmed products or real brand', 80, 2),
      copy('about-story-description', 'about', 'Supported product/brand narrative; no invented founders, facilities or years', 500, 8),
      { ...copy('company-about', 'about', 'Optional real company introduction, rendered only when confirmed content exists', 1400, 14), min: 0, required: false, factSources: ['brand'] },
      copy('contact-headline', 'contact', 'Contact title beside the portrait and enquiry form', 80, 2),
      copy('contact-description', 'contact', 'Invite a product-specific enquiry without promising response time or services', 220, 4),
      copy('contact-form-headline', 'contact', 'Heading of the working enquiry form', 60, 2),
      copy('contact-form-description', 'contact', 'Explain what known product/questions to include in the message', 220, 4),
      copy('detail-facts-headline', 'detail', 'Heading above original product facts; material and dimensions keep their actual semantics', 50),
      { ...copy('product-context-caption', 'detail', 'Per-product caption shared by its selected home context and its detail context; product identity/use must match the bound ID', 180, 3), repeat: 'per-product' },
      copy('faq-headline', 'contact', 'Title of the native product enquiry FAQ, also rendered on about', 70, 2),
      ...Array.from({ length: 4 }, (_, i) => [copy(`faq-question-${i + 1}`, 'contact', `Factual product/enquiry question ${i + 1}; no class, timetable or therapy assumptions`, 120, 2), copy(`faq-answer-${i + 1}`, 'contact', `Answer ${i + 1} from available facts; invite clarification when unknown, never invent commercial promises`, 320, 5)]).flat(),
      copy('footer-headline', 'home', 'Live white CTA above the global footer scene', 80, 2),
      copy('footer-description', 'home', 'Short final invitation to discuss the actual selected products', 180, 3),
      copy('inquiry-cta', 'contact', 'Enquiry action used by header, detail and footer', 30),
      ...materialsPages.flatMap(page => [copy(`${page}-seo-title`, page, `${page} search title`, 70), copy(`${page}-seo-description`, page, `${page} search description`, 170, 3)]),
    ],
    optionalSections: [{ id: 'company-introduction', reason: 'No verified company description means no company-history block or placeholder claim.' }],
    visualParameters: ['palette.primary'], contentPolicy: 'b2b-confirmed-facts-only',
  };
}
