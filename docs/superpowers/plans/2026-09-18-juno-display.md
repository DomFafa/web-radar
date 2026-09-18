# Juno materials display v3 implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This task is already assigned for inline execution; no further execution-choice approval is needed.

**Goal:** Render persistent, purpose-specific product cards and a real collection banner without changing existing materials projects.

**Architecture:** Keep the v2 inventory and renderer available by explicit revision. Add a v3 inventory and display selection snapshot; validate image roles, identities, media evidence and quantities before acceptance and edits. Replace only Juno's designated sections when rendering v3.

**Tech Stack:** TypeScript, Zod, parse5, Hono, React, Vitest, existing Chrome preview.

**Spec:** `/Users/dom/.codex/worktrees/90cc/product-radar-release-37f9f62/docs/superpowers/specs/2026-09-18-series-and-website-display-design.md`

## Global constraints

- Only edit Web Radar. Product Radar owns selection persistence, asset planning, generation and visual review.
- Preserve standalone login/building and accepted old contracts; access remains `vc.ddom@gmail.com`.
- No deployment or customer-site publication until the user explicitly requests deployment. The user subsequently authorized committing and pushing the completed scoped changes to the existing GitHub branch.
- Root checkout contains committed but not deployed legacy gallery work. Prepare deployment scope relative to the last isolated production source.

## Task 1: Version and publish the binding interface

**Files:** `src/shared/materials.ts`, `src/templates/materials.ts`, new `src/templates/juno-display.ts`, `src/worker/template-guides/api.ts`, `src/client/MaterialsEditor.tsx`, contract JSON/docs, `tests/materials-template.test.ts`, new `tests/juno-display.test.ts`.

**Interfaces:** `getMaterialsTemplate(id, contractRevision?)`; optional `displaySelection` on confirmed/applied materials; v3 selection-bound image slots; explicit role/product/evidence fields on bindings.

- [x] Write failing compatibility tests: explicit v2 returns the entire frozen JSON, unknown revision is rejected, v3 is discoverable with a different revision.
- [x] Preserve old fixture generation at v2; add separate v3 fixtures.
- [x] Add v3 contract and precise requirements lookup/preview query; editor requests its draft revision.
- [x] Export complete contract JSON and interface documentation to Product Radar before implementing rendering.

## Task 2: Validate and persist deterministic display selections

**Files:** `src/shared/materials.ts`, `src/templates/juno-display.ts`, `src/templates/materials.ts`, `src/worker/materials-service.ts`, `src/worker/materials-draft.ts`, `tests/juno-display.test.ts`, `tests/materials-edit.test.ts`.

- [x] Fail on duplicate/foreign/wrong-count selection IDs, missing/wrong-role bindings, swapped product identity, missing packaging evidence and incomplete collection coverage.
- [x] Require min(product count, 4) unique IDs per selection group, stable ordered bindings, all-products collection metadata and distinct middle-banner assets.
- [x] Carry selection/evidence into accepted draft assets and immutable source snapshot; preserve it through ordinary draft edits.
- [x] Assert unchanged repeated preview output and unchanged source data; retain v2 acceptance and normal project permissions.

## Task 3: Render purpose-specific sections

**Files:** `src/templates/juno-display.ts`, `src/templates/materials-render.ts`, `src/worker/template-guides/materials-demo.ts`, `src/client/MaterialsEditor.tsx`, `tests/juno-display.test.ts`.

- [x] For 1/2/3/4/5 products assert card count, shared front/packaging order, per-card image/name/detail-link identity and no repeated filler.
- [x] Replace scenario cards and product grids only for v3; use the saved selection with responsive columns and bounded single-card width.
- [x] Restore `6f48de11` as a bound collection-image section with actual aspect ratio and copy; keep the four orphan spacer sections removed.
- [x] Keep category semantics out of product-specific cards, preserve existing template palette/type and use explicit roles for remaining content positions.

## Task 4: Verify and hand off

**Files:** test/visual artifacts under ignored `artifacts/juno-display-20260918/`, deployment-scope record, contract document.

- [x] Run targeted tests, typecheck, full tests and build once changes converge.
- [x] View 1/2/3/4/5 product desktop/mobile renders in Chrome; save and read back real screenshots, audit DOM counts/links/overflow and refresh stability.
- [x] Check legacy v2 rendering/contracts and standalone fixtures remain valid.
- [x] Report exact changed files, frozen contract, validation evidence and limits to the coordinating Product Radar task. Keep deployment separate; commit/push only under the subsequent explicit user authorization.

## Verification record

- Root checkout: 516 tests passed, typecheck and build passed; latest focused suite adds digest/mobile identity cases (35 passed).
- Isolated production candidate: 503 tests passed, typecheck/build and Worker dry run passed.
- Ten real Chrome cases (1–5 products at desktop/mobile widths): all images loaded, exact identity/order/links, no horizontal overflow. Saved screenshots were read back; refresh and detail navigation passed.
- Old v2 full contract stays exact; ordinary standalone and legacy tests pass.
- Visual fixtures are explicitly illustrated test data; real Product Radar image quality and packaging evidence remain the joint acceptance responsibility.
- Local WR service 8791 points only at PR canary 4302. No deploy or customer-site publication.
- Evidence and isolated candidate: `artifacts/juno-display-20260918/`.

## User release boundary

After implementation, the user explicitly requested commit and push to the existing GitHub destination without another confirmation. Deployment remains prohibited until the user says to deploy. Preserve current repository visibility and branch history, and push only the scoped Juno changes.
