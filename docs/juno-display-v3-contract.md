# Juno display contract v3

Implementation handoff, 2026-09-18. This document specifies the jointly agreed interface; it does not claim production deployment.

Full requirements: `docs/materials-requirements/juno-toys.v3.json`. Shared Zod/types: `src/shared/materials.ts`. Inventory: `src/templates/juno-display.ts`.

## Versions and compatibility

- Submission `schemaVersion` stays `wr-materials-v1`; requirements stay `wr-template-materials-v1`.
- Template ID `juno-toys`, guide revision `2026-09-17.1`, new contract revision `2026-09-18.juno-materials.3`.
- Existing `2026-09-17.juno-materials.2` requirements remain byte-for-byte unchanged in `docs/materials-requirements/juno-toys.json`. Both revisions remain accepted/renderable.
- Requirements and preview endpoints accept `?contractRevision=<exact revision>`. No query means latest. Product Radar must read the recorded revision when confirming an existing draft; catalog discovery is for new drafts.
- Optional fields below are required by v3 position validation, not retroactively by v2. They participate in the existing canonical `{source,materials}` content hash.

## Selection and binding types

```ts
interface DisplaySelection {
  sceneProductIds: string[];
  featuredProductIds: string[];
}
// New optional fields on materials (required for Juno v3):
// displaySelection: DisplaySelection

// Additions to each existing imageBindings entry:
interface DisplayImageFields {
  role?: 'scene' | 'front' | 'packaging' | 'collection';
  depictedProductIds?: string[];
  evidenceMediaIds?: string[];
}
// Existing mediaId/mobileMediaId/productId/fit/focalPoint/alt remain unchanged.
// No new fields are added to media[] source metadata.
```

Each selection array has exactly `min(products.length, 4)` distinct known product IDs. Product Radar chooses once per materials revision and persists the order. Web Radar never randomizes or fills missing cards. Ordinary Web Radar draft edits cannot change these selections; a new confirmed materials revision is required.

| Slot | Repeat | Selection | Role | Media requirement |
| --- | --- | --- | --- | --- |
| `hero-slide-0/1/2` | `once` | All products | `collection` | Each image contains every selected product |
| `scene-card` | `per-selection` | `scene` | `scene` | One scenario image per sceneProductIds product |
| `front-card` | `per-selection` | `featured` | `front` | Complete single product, front view; no box, angle, close-up or product/box group |
| `packaging-card` | `per-selection` | `featured` | `packaging` | Real corresponding packaging with evidence |
| `home-image-8/9` | `once` | One same known product for both | `scene` | Product-approach editorial scenes, not arbitrary card types |
| `collection-banner-mid` | `once` | All products | `collection` | 1920×650 collection; distinct composition/media from every hero |
| `product-main` | `per-product` | All products | Existing rule | Original primaryMediaId |
| `product-gallery` | `per-product-gallery` | Each current product | Existing rule | Ordered galleryMediaIds |

The new `per-selection` slot fields are `selectionGroup: 'scene' | 'featured'`, `min:1`, `max:1`: one binding per product in the named selection. No `itemIndex` is used. Bindings outside the selected group, duplicates and missing selected products are invalid.

For scene/front/packaging roles, `productId` is mandatory and `depictedProductIds` must equal `[productId]`. For collection roles, omit `productId` and provide every material product ID exactly once in `depictedProductIds`; order is not significant. Mobile media must obey the same role and coverage. Hero and middle-banner images must not share an ID or digest.

An image ID or SHA-256 digest cannot be bound under different roles or different depicted-product sets, including mobile images. Reusing a front image for the same product in both front grids is intentional. Reusing a verified scene for the same product in the scene and editorial sections is allowed.

Packaging additionally requires nonempty `evidenceMediaIds`. Every evidence ID must exist in media[] and the same product's galleryMediaIds (which includes its original primary). **Membership is traceability, not proof that a photo depicts packaging.** Product Radar must use saved analysis or reviewed retained packaging images to establish real packaging evidence. Original/angle images are not automatically valid packaging evidence or verified front views. If no valid packaging evidence exists, materials remain blocked; the required packaging slot cannot be omitted or replaced with another role. Include the retained evidence image in the product's submitted media/gallery references.

Example excerpt for two selected products (other required bindings omitted here only for readability):

```json
{
  "displaySelection": {
    "sceneProductIds": ["p-b", "p-a"],
    "featuredProductIds": ["p-a", "p-b"]
  },
  "imageBindings": [
    {"slotId":"front-card","productId":"p-a","role":"front","depictedProductIds":["p-a"],"mediaId":"front-a","fit":"contain","focalPoint":{"x":0.5,"y":0.5},"alt":{"en":"Product A front view"}},
    {"slotId":"packaging-card","productId":"p-a","role":"packaging","depictedProductIds":["p-a"],"evidenceMediaIds":["retained-packaging-a"],"mediaId":"packaging-a","fit":"contain","focalPoint":{"x":0.5,"y":0.5},"alt":{"en":"Product A packaging"}},
    {"slotId":"collection-banner-mid","role":"collection","depictedProductIds":["p-a","p-b"],"mediaId":"mid-collection","fit":"contain","focalPoint":{"x":0.5,"y":0.5},"alt":{"en":"The complete A and B collection"}}
  ]
}
```

## Rendering and ownership

Scene section `6e37763` uses sceneProductIds. The first front grid `b51d430` and the comparison grid `0b4ff1c` share featuredProductIds. The comparison grid renders a front row followed by the matching packaging row with identical order. Names and detail links come from the same product object as each image binding, never parallel generated title lists. Catalog cards still show all products.

The existing product-approach scenes retain their positions with explicit scenario role and one matching identity. Unsupported news/testimonials/partners stay omitted. Section `6f48de11` returns only in v3 with actual bound collection media and new middle-banner copy; orphaned spacers stay removed. Ordinary standalone and v2 layouts keep existing behavior.

Product Radar owns selection persistence, image-purpose classification, real packaging evidence, planning, generation and visual review. Web Radar validates the declared roles, identities, coverage, references and quantities and renders those bindings deterministically; it does not infer image content from bytes or make extra model calls. A binding declaration alone is not a visual quality certificate.

After import, Web Radar maps evidenceMediaIds to evidenceAssetIds alongside mediaId→assetId. Its private draft stores displaySelection unchanged. No database schema migration or change to account scope is required.
