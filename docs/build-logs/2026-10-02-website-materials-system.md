# Website materials system — 2026-10-02

## Behavior

Pawfect materials revision 2 renders confirmed semantic text and image bindings into its native five-page layout. Product main images remain unchanged; eight fresh editorial scenes are requested for three or more selected products. The contract supplies the shared palette, image roles, crop requirements, product-selection limits and text capacities. Product Radar executes these capabilities without product-name or template-name branches. Revision 1 remains readable and uses its frozen renderer.

Existing saved Banner controls, product display groups, inquiries and language routes remain supported. Both private preview bridges carry bounded section fragments. The native grid avoids the historical runtime's reserved numeric-counter attribute, so the runtime cannot replace its cards with a number.

Implementation details and template-authoring requirements: [website-materials-system.md](../website-materials-system.md).

## Validation

- Web Radar: typecheck, 109 test files / 2,334 tests, and production build passed.
- Product Radar: focused materials/preview regressions and typecheck passed; PR #65 CI passed against `b169f54b351aeb25db102e0242644231e679ffba`.
- Actual two-checkout contract test: five cases passed, including 1/3/7 products through planner, confirmation, receiver validation and native rendering; all semantic bindings are consumed and historical revision behavior retained. Provider calls in this test are mocked.
- Actual sandbox preview: 16 cases passed across 1440/390/320 px and all five pages, plus a one-product catalog. Checks include card/gallery counts after scripts run, Gallery/FAQ navigation, cross-page section restoration, image viewer, disabled preview forms, overflow, broken images and browser errors.
- A final mobile navigation word-wrap correction is presentation-only and was included before the successful production build; its affected 390 px view was inspected separately.

Production release receipts and real generated-product acceptance are recorded separately from these local checks. The independent random sample contains drinkware, an air purifier and a plush toy, with existing material/dimension gaps retained. Passing synthetic tests does not certify image-generation quality for these or future products.
