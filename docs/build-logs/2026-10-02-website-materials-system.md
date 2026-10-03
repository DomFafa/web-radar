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

## Production release and generated sample

- Product Radar PR #65 merged at `ac2312d24be42afeb61a3ef67a2caf22eb3b6df4`; its controlled production release passed 4,703 tests (12 skipped), built once, verified the extracted archive, and activated that exact version. Seven served application assets matched the release files. The explicit cross-repository tests were run separately against the deployed source pair: five passed.
- Web Radar deployed application source `87382dec23859fd08ec7355849fdd499539564be` as Worker version `24be4ae6-3acc-4e5b-baac-c9fa16ad20e7`. Downloaded Worker bytes and 32 affected static assets matched the sealed artifact; bindings, settings and queues matched the prior configuration. PR #18 remains available for the repository's owner merge workflow. Subsequent documentation-only commits do not change the deployed application artifact.
- A separate chat selected three existing products across drinkware, home appliances and plush. The current online planner automatically generated eight new scenes and 61 text bindings in approximately 81 seconds, retaining all three original main images. No site copy or generated scene was manually patched for this sample.
- The production receiver accepted all 11 images into project version 1, named **Everyday Objects**. Its five page types are available as a private authenticated preview. The original public sites were not changed and this sample was not publicly published.
- Independent inspection of all eight scene assets found no blocking identity or visible-material errors. All eight matched their declared dimensions and had distinct hashes. Viewpoints remain mostly frontal. The source water bottle is a flat test illustration carrying `LOCAL TEST IMAGE`; its retained main still contains that label, while the new scenes do not. Source specification conflicts remain unresolved, and these images cannot certify exact physical dimensions.
- Actual authenticated production preview passed 21/21 cases: home, catalog, about, contact and all three product details at 1440/390/320 px. Original-image SHA values stayed unchanged; eight distinct generated-image hashes matched the received assets and differed from all 15 source images. Images decoded, layout did not overflow, product cards stayed intact after scripts and interactions, Gallery/FAQ navigation and cross-page anchors worked, and detail image viewers opened. No publication or inquiry was sent. Browser-extension exceptions were attributed by their extension stack and recorded separately; no application error remained. Desktop and mobile screenshots were inspected directly.

Full private release and sample receipts: `/Users/dom/Desktop/website-materials-system-20261002/` (`product-release/`, `web-release/`, `evidence/`, `visual-qa/`, `live-preview/`). These records distinguish source checks, deployed versions, provider generation, and actual browser acceptance; they do not certify every product category or every template.
