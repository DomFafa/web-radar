# Design fidelity repair implementation plan

**Goal:** Correct the general approved-design-to-HTML generator using the saved five-page comparison, then verify real desktop/mobile output.

**Evidence/spec:** `artifacts/preview-compare-20260914/findings.md` and the explicit implementation handoff in this task.

**Architecture:** Keep the current Worker/Python/assembler boundaries. Extend the existing layout binding contract for compact selected product lists and styled trusted forms. Materialize bounded crops from the approved design locally, supply bundled typography/icons, reuse homepage chrome, and always review real rendered output against the approved image before accepting a page.

**Constraints:** Preserve existing uncommitted work, management UI, approved designs/data, source conditions, auth/routes/database/quota, and recoverable old builds. No customer-site publication or design confirmation. No new runtime dependencies. Provider/model stays configured. Private evidence stays ignored and mode 0600. No full screenshot as a webpage; product detail photos stay original. Do not add search/filter/gallery or unsupported inquiry fields. Bound live attempts to initial generation plus one revision per page.

## Tasks

- [x] Binding repair: test and implement compact cards, explicit `data-wr-product-ids` JSON arrays, catalog coverage, short nav labels, approved page titles, and layout-preserving `data-wr-field` form slots; retain trusted submission semantics.
- [x] Assets and generation: test and implement bounded approved-image crops, trusted icons/font assets, exact reference-size rendering, homepage chrome reuse, raw/render evidence, and mandatory visual feedback even after structural checks pass. Implementation checked locally; real visual acceptance remains below.
- [x] Producer contract: test and align page-design prompting with available form fields, one product image, compact cards, real navigation, reusable photographic areas and source grounding. Keep prompt below 32,000 characters without dropping approved facts.
- [x] Acceptance: run relevant Python and TS checks, generate only the homepage first against the frozen project, inspect the real before/after result, then generate the other four pages and inspect mobile. Save a new comparison and describe unresolved differences honestly.

## Validation

Use `services/site-builder/.venv/bin/python -m pytest` in that service and `npm run check` in the repository. Add behavior regressions in the existing suites before implementation. Use a private frozen-input canary; old production preview remains intact. Record model raw HTML, sanitized output, screenshots at the 1536px reference width and 390px mobile width, and comparison notes. Full tests/build success establish code checks only, not visual acceptance.

## Final local checkpoint — 2026-09-14

- The user restored the configured text API. Five real page templates were generated, visually reviewed and assembled into 12 local English pages with the eight original products. Private comparison and clickable preview are available on localhost port 64780.
- `npm run check`: 203 tests, TypeScript and build passed. Python: 198 tests passed, one existing deprecation warning. Explicit-venv Pyright: zero errors/warnings.
- Catalog planning now receives all 40 retained condition assignments plus approved keep/avoid. It preserves product/section order and factual 3/3/2 memberships despite incorrect screenshot assignments. Scene review preserves non-scene crops and rejects unrelated photo extraction.
- Ancestor clipping is now detected: the real About mobile case exposed a false pass and gained failing-then-passing regression coverage. Final screenshots of all five page types pass current desktop/mobile checks and scoped independent visual review.
- Exact local samples include bounded human QA: homepage logo replay; one real-model local repair each for detail/about/contact; final local About CSS/crop and Contact crop corrections. These are documented artifacts, not customer-specific production logic. Automatic production repair limits remain unchanged. A fresh completely unattended whole-site success has not been established.
- Browser QA verifies all 12 pages, internal links, exact approved English details, all eight product pre-selections, five mobile page types and trusted form retry behavior using an intercepted local endpoint. No real inquiry was sent.
- Local acceptance is complete. No deployment, customer publication, confirmation, commits or pushes occurred. Production authenticated service acceptance remains a separate boundary.
- Full provenance and residual visual differences: `artifacts/design-fidelity-20260914/acceptance.md`; comparison: `review/index.html`.
