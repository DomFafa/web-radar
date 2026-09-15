# Static Site Design Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for the independent service task; integrate and review the remaining tasks in this session.

**Goal:** Replace the current video-led workflow with approved page mockups and a working static website built from them.

**Architecture:** Web Radar owns company/product data, image tasks, confirmations, build orchestration and immutable R2 output. An authenticated Python service imports screenshot-to-code's Agent, persists jobs in SQLite, and returns a deterministic multi-page artifact. The existing preview and Pages publisher consume that artifact.

**Tech Stack:** React, TypeScript, Cloudflare Worker/D1/R2, FastAPI, SQLite, screenshot-to-code Agent, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-static-site-design.md`

## Global Constraints

- Preserve current UI style, existing user edits, published snapshots, auth and quota ownership.
- No video required for static generation. Five page types: home, catalog, detail, about, contact.
- Home confirmation precedes the four inner-page images; group confirmation precedes building.
- Regeneration and changed input invalidate dependent confirmations/artifacts; late tasks cannot attach stale output.
- Never expose provider keys or private assets. Do not replace provider failures with fake success.
- Work in the user's supplied repository on `codex/web-radar-v1`; no branch reset, commit, push or production rollout as part of implementation.

## Task 1: Independent screenshot conversion service

Files: `services/site-builder/{app.py,builder.py,assembler.py,tests/,README.md,pyproject.toml}`.
Interface: authenticated `POST /v1/builds` accepts `{id, draft, designImages}`. `designImages` maps five page names to image data URLs. `GET /v1/builds/{id}` returns `{state:pending|succeeded|failed, files?, message?, progress?}`. Worker always uses its stable job ID. Source data is stored once, duplicate requests return the same job, conflicting input is rejected. Output keys use `en/index.html`, `en/products/index.html`, `en/products/{encodedProductId}/index.html`, `en/about/index.html`, `en/contact/index.html`, and equivalents for selected second language. HTML uses `__WR_ASSET_<assetId>__` and `__WR_INQUIRY__` tokens. Navigation anchors carry `data-wr-page`, `data-wr-product-id`, `data-wr-lang`.

- [x] Add tests proving exact data binding, route expansion, rejected unsafe output, idempotency and restart behavior; observe failures before implementation.
- [x] Implement bearer-authenticated, SQLite-backed background jobs with bounded concurrency, request size limits and no secret-bearing error responses.
- [x] Import vendor Agent without modifying vendor source; provide actual design images to the vision model; disable unnecessary image generation. Use company/product binding hooks and inline CSS.
- [x] Assemble all products/languages using approved facts. Remove scripts, event handlers, external media/styles and unsafe links; add trusted responsive navigation/contact behavior.
- [x] Run service tests and type checks; document install/start and exact env fields. Write a report with results.

## Task 2: Design state, provider and job integration

Files: `src/shared/{model,site-design}.ts`, `src/worker/{domain,domain-service,provider-contract,env}.ts`, `src/worker/providers/{image,index,fixtures,site-builder}.ts`, `tests/site-design.test.ts`, `tests/domain-service.test.ts`.

- [x] Add failing tests for confirmation gates, invalidation, immutable state, late output and image quota settlement.
- [x] Add optional server-managed `draft.siteDesign`, preserving legacy snapshots. Reuse image jobs with `input.pageId`; add `site-build` jobs. Add stable input and design keys.
- [x] Add home/group confirmation route, single/batch design enqueue, persisted build polling, and R2 artifact storage.
- [x] Add dedicated page design prompts using product images and approved home reference; add screenshot-service config/status, fixtures and failures.
- [x] Run targeted domain/provider tests, checking old flows still work.

## Task 3: UI and artifact preview/publication

Files: `src/client/{Editor,PageDesign,workflow,App}.tsx/ts`, `src/worker/static-site.ts`, existing preview/public rendering call sites, `.env.example`, root README.

- [x] Add failing tests for static publish readiness and public/private artifact materialization.
- [x] Replace video step with five design cards, original asset previews, per-page instructions, home/group confirmations and task progress. Keep current components and styling.
- [x] Wire build button, private five-page/product/language/mobile navigation, publication/rollback to immutable generated files and original asset URLs.
- [x] Add responsive/public safety headers, working inquiry submission and no video-dependent checklist.
- [x] Run full project check, service checks and browser acceptance. Distinguish fixture coverage, real-provider canary and production hosting status in the result.

**Acceptance result:** implementation and local workflow checks pass. Three real canaries generated nine English pages; third functional/browser checks pass, but whole-site visual acceptance fails. Preserve the evidence and do not deploy as an accepted design. Remaining release work is real inner-page visual fidelity and an HTTPS-hosted Python/Chromium service; see `docs/static-site-acceptance.md`.
