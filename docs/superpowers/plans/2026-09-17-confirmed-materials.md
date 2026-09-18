# Confirmed Product Radar materials implementation

Contract: `docs/product-radar-materials-contract.md`. Preserve the existing dirty gallery/copy implementation and standalone/legacy flows. Work in the current `codex/web-radar-v1` checkout because Product Radar reads the shared contract here. No commit, push or deployment until the coordinating task requests the joint release.

1. Add strict shared submission/receipt/template types. Test invalid references, duplicates, locale completeness and bounded input; publish the Juno requirements fixture for Product Radar.
2. Add exact template position inventories, account-gated read-only discovery and sandboxable full-page demos. Keep old guide authentication unchanged. Mark only implemented profiles ready.
3. Add durable, resumable materials receiving through the existing Coordinator, D1 idempotency and R2. Verify current identity, source version, MIME, dimensions and hash before acceptance; preserve expectedVersion on updates. Test replay, failure, retry and account denial.
4. Bind approved copy, exact media and visual tokens only for receipt-backed drafts. Preserve original source separately and allow editing current values. Test old output and new ten-product catalogs, all page types and locales.
5. Route accepted projects to their assembled preview, retaining explicit publication and existing standalone flow. Verify direct API denial, draft provenance protection and editing persistence.
6. Run typecheck, targeted then full tests, build and desktop/mobile browser acceptance. Send evidence to Product Radar; await its explicit joint deployment instruction.
