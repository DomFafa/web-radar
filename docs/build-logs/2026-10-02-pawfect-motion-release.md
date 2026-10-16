# Pawfect native motion release — 2026-10-02

## Customer behavior

The approved local motion, navigation and enquiry-link changes are now part of the versioned website generator. Pawfect materials `2026-10-02.pawfect-groom-materials.3` uses renderer `2026-10-02.pawfect-groom-native.3`. New template selections advertise this revision and its actual rendered cover. Existing drafts retain their recorded revision; this release does not republish customer sites.

Home, collection, about and contact have distinct entrance compositions. Product details rotate through three compositions using stable product order. Each element enters once per document visit. Returning up the page, resizing or changing motion preferences does not rearm it. Pending content starts hidden before entering the viewport, removing the settled-pose flash. Keyboard focus and reduced motion reveal content; a failed initial runtime reveals the static page after 1.5 seconds.

The header contains Collection, About us and the existing enquiry action. The three-column next-steps enquiry uses the same text-link treatment as its neighbours. Other content, images, layout and enquiry destinations are preserved.

## Integration boundary

Image/text slots, capabilities, palette, guide revision and API envelopes are identical to native revision 2. Revision 2 remains available with its original contract, seven page outputs and preview runtime bytes. No Product Radar source, database, credential, permission or material-generation change is required.

`motion.ts` is the authoring source; `node scripts/build-pawfect-motion.mjs` generates self-contained browser strings in `motion-source.ts`, avoiding minifier changes to serialized function helpers. `--check` verifies freshness. The public renderer includes the preparation script in the head and runtime after the content. Web Radar's sanitized iframe reinserts trusted nonce-bearing scripts; the project-preview API supplies the reviewed runtime for Product Radar's existing preview consumer. Product order is inert body metadata and survives script stripping.

## Verification and publication

- Frozen revision 2: contract, seven complete HTML documents, worker runtime and client runtime match the pre-change `adf1c80` snapshot byte for byte. The committed fixture records these digests.
- Native image regression: four hero and 30 detail cases pass. The gallery expectation follows the requested contract's actual gallery slot; Pawfect's main-image-only contract keeps the original primary image and image viewer.
- Actual revision 3 cover rendered at 1440 × 1000 with zero script errors, broken visible images or overflow. Cover digest: `17b92249c4802926a6f61a93e83a414a1b81446d8d4e70cb59f279c73d597de9`.
- `npm run check`: typecheck, 110 files / 2,341 tests and production build pass. `npm run test:release`: 18 tests pass. The first full run exposed an outdated default-revision assertion and a 10-second bundle-setup timeout; the focused reproduction isolated both, and the final full run passes with the exact current revision and a bounded 30-second setup limit. No runtime behavior was changed to make tests pass.
- `PRODUCT_RADAR_ROOT=/path/to/product-radar node scripts/verify-pawfect-production-motion.mjs`: 42 cases pass in 30.1 seconds (seven routes × desktop/mobile × public/WR nonce/Product Radar). The actual minified Product Radar consumer and opaque frame document-write path pass first-paint, once-only and product-order checks. Reduced motion, disabled JavaScript and delayed-runtime fail-open also pass; no script errors or external requests. The harness was corrected to use the real app's UTF-8 and `setAttribute('nonce', ...)` serialization before final verification; production code needed no further changes.
- Production browser evidence, type/test/build logs, exact source identity and deployment receipts are retained under `/Users/dom/Desktop/website-materials-system-20261002/motion-release/` and `artifacts/pawfect-production-motion/`.
- The documented direct Cloudflare flow preserves current bindings and queues, seals the built artifact, verifies the downloaded Worker and served assets, and checks live revision 3 plus the frozen revision 2 contract. PR 18 remains for manual owner merge; merging is not a prerequisite for this authorized direct release.

The earlier local review history remains in [the preview build log](2026-10-02-pawfect-scroll-motion-preview.md). Its preview-only status describes that earlier phase; production adoption is tracked here.
