# Confirmed materials for all templates

The current 15 templates expose `imagePolicy: typed-regions-v1`, guide revision
`2026-09-19.1`, and contract revision `2026-09-19.<templateId>-materials.1`.
Read the authenticated materials catalog and each exact requirements endpoint;
never infer an image role from a template name or a display label.

`product-main` and `product-gallery` retain every original selected image in its
original order. They intentionally have no role and no display product limit.
Typed image regions declare their role, repeat mode, pixel dimensions, and source
policy. `maxProducts` limits only the corresponding display region. Unused cards
collapse when fewer products are selected; they never receive demonstration products.

- `scene`, `front`, `packaging`, `main`, and `detail` depict the bound product.
- `collection` depicts every selected product. Separate public banners require
  distinct compositions, including distinct mobile variants when supplied.
- `facility` and `logistics` use `sourcePolicy: illustration`, an empty
  `depictedProductIds` array, and no `productId`. Illustrations must not pretend
  to prove a customer's actual factory, certification, laboratory or capacity.
- Packaging requires references from the same product's original gallery.
  Scene, front and packaging cannot reuse the same bytes across roles. Main and
  original gallery images may reuse a correctly classified image of that product.
- `selectionGroups` determines the exact maximum scene/featured selections.
  Missing groups mean zero. New Juno uses 4 scene and 6 featured products.
- Saved brand facts may include `targetMarkets`, `customerTypes` and
  `cooperationProcess`. Copy remains limited to confirmed source facts.

Inventory and rendering traverse the same prepared DOM. Semantic text IDs and
numeric-writer removal prevent shifted bindings and animations from restoring
sample counts. Unsupported testimonials, customer logos and certificates are
omitted. The original layouts, styles and other animation behavior remain.

The existing explicit Juno v2/v3 and Senseng Clean v1/Video v2 contracts remain
available. Original Senseng material layouts are frozen separately; ordinary
standalone rendering continues to use the current theme. Never silently upgrade
an accepted draft to another contract revision.

`typed-2026-09-19.json` records the SHA-256 of each canonical ordered JSON contract
(`JSON.stringify(getMaterialsTemplate(id, revision))`). The integration regression
checks these hashes. Changing slot meaning, quantity or geometry requires an
explicit new revision and preservation of existing accepted revisions.

New templates must register their media requirements and guide, and use the
shared inventory/render/validation path. Registry coverage tests detect missing
guides or contracts. Materials API and submission remain restricted to
`vc.ddom@gmail.com`; receipt acceptance never publishes a customer website.

Validation:

```sh
npm run typecheck
npm test
npm run build
```

The integration tests cover 1, 5 and 20 products on all 15 templates, all five
pages, exact legacy revisions, receipt-bound editing, source galleries, role and
identity conflicts, preview submission prevention and account denials. Public
preview pictures are labelled illustrations; they are not customer output or
evidence of real image-generation quality.
