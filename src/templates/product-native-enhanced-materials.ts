import type { MaterialsTemplateContract } from '../shared/materials';
import { productNativeEnhancedMaterialsRevision } from '../shared/product-native-materials';

type ImageSlot = MaterialsTemplateContract['imageSlots'][number];
const collectionPolicy = "Generate one new coherent collection photograph containing every selected product, grounded in each product's approved original main image and confirmed facts. Show the complete products together in one setting, once each, preserving each real shape, proportion, color, markings and included parts. Balance their prominence without inventing dimensions or unsupported shared uses; do not hide, overlap or crop defining parts. If only one product is selected, show that one product without manufacturing a larger assortment. Follow the approved website visual plan for the surroundings, never recolor the products. No collage of source thumbnails, baked-in text, website UI, fictional company evidence or reuse of any single-product scene. ";
const mobilePolicy = 'Keep every selected product complete and recognizable inside the central 70%, with breathing room around the whole collection. Preserve the desktop aspect ratio for the mobile image. When the desktop crop or live text overlay cannot retain all products at 390px, supply a separately composed mobile collection image with the same product identities; never fall back to a single-product scene or crop away members of the collection.';
const heroes: Record<string, Pick<ImageSlot, 'id' | 'width' | 'height' | 'purpose' | 'composition'>> = {
  auravell: {
    id: 'home-hero', width: 3456, height: 1800,
    purpose: 'One full-screen photographic collection banner containing every selected product behind live serif text and the separate original-product overview card.',
    composition: 'Panoramic 48:25. Arrange the complete collection toward the upper center-right, within x=45–83%, y=17–72%. Reserve the lower-left 45% for live text, the far-right lower quarter for the separate HTML product card, and the top 12% for floating navigation. Use distinct heights or depth to keep each product readable. HTML gradients provide contrast; no text belongs in the image.',
  },
  'careflow-healthcare': {
    id: 'home-hero', width: 2752, height: 1412,
    purpose: 'One wide rounded collection banner containing every selected product behind the native lower-left frosted title card.',
    composition: 'Landscape 688:353. Group all complete products in the upper center-right, around x=50–86%, y=14–65%. Reserve the lower-left 48% for live text in the HTML card and keep the top 12% calm for navigation. Use a single balanced still-life arrangement rather than one dominant product plus tiny background copies. Keep tall and wide product outlines clear of the edges.',
  },
  'lumi-business': {
    id: 'hero-scene', width: 1920, height: 1080,
    purpose: 'One cinematic collection banner showing every selected product together below the centered gradient headline; its factual caption remains separate HTML.',
    composition: 'Landscape 16:9. Stage all complete products together across the central x=15–85%, y=15–80%, using airy daylight, spatial depth and quiet pale-blue or warm-neutral surroundings. The headline and live text sit outside the image; keep the outer 12% quiet and do not insert a text panel. Compose a recognizable assortment with balanced visibility for every item.',
  },
  'mello-coffee': {
    id: 'hero-scene', width: 1920, height: 1080,
    purpose: 'One wide collection banner showing every selected product together under Mello’s oversized centered title; its note and caption remain separate HTML.',
    composition: 'Landscape 16:9. Arrange all complete products on believable supporting surfaces inside x=15–85%, y=15–80%, with warm ivory, forest-green and restrained chartreuse only in the surroundings. Give each item a clear silhouette and equal visual care. The title, caption and live text remain outside the photograph; leave the outer 12% calm. Do not infer cafe props or food from this template.',
  },
};

/** Explicit v3 descriptors leave the published v2 factories and all inner-page bindings intact. */
export function enhancedProductNativeContract(previous: MaterialsTemplateContract): MaterialsTemplateContract {
  const contract = structuredClone(previous);
  contract.guideRevision = '2026-10-03.1';
  contract.contractRevision = productNativeEnhancedMaterialsRevision(contract.templateId);
  contract.rendererRevision = `2026-10-03.${contract.templateId}-product-native.2`;
  const hero = heroes[contract.templateId];
  if (!hero) return contract; // Toorun keeps its independently bound portrait frames.
  contract.requiredCapabilities = [...contract.requiredCapabilities!, 'image.collection.v1'];
  contract.imageSlots = contract.imageSlots.map(slot => slot.id === hero.id ? {
    ...slot, ...hero, role: 'collection', productScope: 'all-products', repeat: 'once', min: 1, max: 1,
    composition: collectionPolicy + hero.composition, mobileComposition: mobilePolicy,
  } : slot);
  if (contract.templateId === 'lumi-business') {
    contract.textSlots.find(slot => slot.id === 'hero-caption')!.purpose = 'Factual caption describing the complete bound collection and its shared composition; do not name only one product or invent company claims.';
  }
  if (contract.templateId === 'mello-coffee') {
    contract.textSlots.find(slot => slot.id === 'hero-note')!.purpose = 'Tiny handwritten editorial note beside the complete collection banner, not a quality or certification claim.';
  }
  return contract;
}
