# Providers and original templates — local implementation evidence

Completed 2026-09-12 in `codex/web-radar-v1`. This report covers the provider/template module boundary only. No real provider request, email, Cloudflare deployment or resource creation was performed. No Product Radar source files or existing secrets were read or copied. Implementation ownership is frozen after this report; the coordinating task can review and format the files.

## Implemented boundary

- `src/worker/providers/index.ts`: `createProviders(env): ProviderSet`, exactly the shared interface. Service status reports configured/unconfigured/test; configured means settings exist, not a successful live canary.
- `text.ts`: independent text endpoint/key/model, JSON response validation, exact 3/4 scene counts, all selected-language copy and product translations. Prompts prohibit invented company facts and preserve source keep/reference/change conditions. Customer approval remains the factual review boundary.
- `image.ts`: dedicated image key; `gpt-image-2.5-sunburst` only; compatible `images/edits` multipart request containing product reference image bytes, script, scene and local revision instructions. No old-key fallback.
- `agnes.ts`: one complete task with all approved references; only returned `video_id` is accepted. Known task polling retrieves `metadata.url`; unknown acceptance throws an uncertain error and never silently submits again.
- `http.ts`: bounded response sizes, request deadlines, HTTPS configuration, explicit media-origin allowlist, no credential forwarding to media downloads, redirects rejected for credentialed calls and media. Download bytes/streams are returned to the coordinator for durable storage before charging success.
- `email.ts`: Resend full inquiry text, customer recipient, buyer `reply_to`, stable idempotency key; safe failure/unknown state.
- `pages.ts`: generated HTML asset upload plus trusted `_worker.js` and all-path `_routes.json`; fixed project name derived from WR project ID; both preview and production must carry the project marker and `fail_open:false`. Deployment success requires the `deploy/success` stage and Functions enabled. Pending deployment retry searches the same release marker. No old successful domain release is changed by this adapter.
- `src/templates/index.ts`, `labels.ts`, `styles.ts`: natural / technology / explorer layouts; home, catalog, product detail, about, contact; complete English, German, French, Spanish, Portuguese, Italian interface labels. Customer localized copy remains data. Unsafe URLs/colors are rejected and all text, attributes and product identifiers escaped. Private preview disables inquiry submission and is marked noindex.

Template renderer exports match the agreed `renderSite(...)` and `renderSiteFiles(...)` contracts. File keys are `en/index.html`, `en/catalog/index.html`, `en/products/:encodedId/index.html`, `en/about/index.html`, `en/contact/index.html` and their selected-language counterparts. Navigation has `data-wr-page`, optional `data-wr-product-id` and language links have `data-wr-lang` for authenticated iframe interception.

Every template has muted autoplay/loop/playsinline video, a poster, visible pause/play control and reduced-motion fallback. All Pages aliases first check the lightweight `/public/sites/:projectId/gate/:releaseId` endpoint, without cookies or bearer credentials. Only HTTP 204 allows Pages `env.ASSETS.fetch(request)` to serve the trusted precompiled HTML. Offline or stale-release aliases are denied before static content or inquiry forwarding. The root Worker owns the D1-backed release gate and D1/R2 public media path; neither static HTML nor public media is rerendered or streamed through the global coordinator. Response caching remains disabled.

## Verified API sources and configuration

Agnes primary documentation was read on 2026-09-12: [Agnes Video V2.0](https://agnes-ai.com/en/docs/agnes-video-v20) and its [official model repository](https://github.com/AgnesAI-Labs/AgnesAI-Models). The implemented contract is `POST /v1/videos`, `extra_body: {image: [...], mode: 'keyframes'}`, `GET /agnesapi?video_id=...&model_name=agnes-video-v2.0`, and completed result `metadata.url`. The frame rule is `8n+1`; requests use 193 or 289 frames at 24fps (about 8.04 or 12.04 seconds). The service may normalize output parameters, so actual returned/player duration must be checked during real acceptance. The docs do not establish submission idempotency; the adapter does not pretend that an arbitrary header prevents duplicate billing.

Required Agnes settings: `AGNES_API_BASE_URL` (verified root or `/v1` URL), `AGNES_API_KEY`, `AGNES_MODEL=agnes-video-v2.0`, `AGNES_CONTRACT=agnes-video-v2.0-2026-09`. Optional submit/status path overrides are accepted only when they match the verified `/v1/videos` and `/agnesapi`. Media source origins, including the returned output host and WR signed-reference origin, must be explicitly included in `PROVIDER_MEDIA_ORIGINS` / `APP_ORIGIN`. Missing or unrecognized configuration is unavailable, not a mock success.

Pages upload contract uses the official [asset upload API](https://developers.cloudflare.com/api/resources/pages/subresources/assets/methods/upload/), [deployment API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/methods/create/), [project configuration API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/create/) and [advanced-mode documentation](https://developers.cloudflare.com/pages/functions/advanced-mode/). Asset operations use the short-lived upload JWT; deployment operations use the platform Pages token. Existing project ownership and both fail-closed configurations are checked before upload. Credential/token permissions, account capacity and real direct-upload behavior still need an authorized canary.

Mail contract follows [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email). Resend idempotency expires after 24 hours; the coordinator was notified that unknown acceptance must not be retried beyond that window without independent verification. `RESEND_API_KEY` and a verified platform `MAIL_FROM` are required. Customer email is the recipient, not the sending identity.

## Local evidence

Targeted tests: `npm test -- tests/templates.test.ts tests/providers.test.ts` — **23 passed**. Covers five-page output, six-language keys, escaping, light/dark brand contrast, single page H1, real video markup/reduced motion, dedicated provider configuration, current Agnes response shape, unknown acceptance, credential boundaries, source byte references, full mail envelope, Pages all-alias proxy, fail-open rejection, deployment pending/reuse, and explicit test-mode separation.

Full suite at this checkpoint: `npm test` — **60 passed across 5 files**. Other modules are concurrently implemented, so the root task owns the final full-suite result.

Scoped TypeScript check passed:

```sh
node_modules/.bin/tsc --ignoreConfig --noEmit --skipLibCheck --strict --target ES2022 --moduleResolution Bundler --module ESNext --types @cloudflare/workers-types,node worker-configuration.d.ts src/templates/index.ts src/worker/providers/index.ts
```

Whole `npm run typecheck` still showed two pre-existing concurrent UI errors in `src/client/Preview.tsx` lines 34 and 37 at this checkpoint; sent to the root task. No provider/template type errors remained.

Playwright headless Chrome independently rendered all three templates at **1440px and 390px**, walked home → catalog → product → contact → German → about, verified advancing video `currentTime`, no horizontal overflow, and no JavaScript errors. Reduced-motion emulation verified `paused=true`, `display:none` on video and an available poster. Visual review caught and fixed technology contact-band text contrast; a repeated browser run passed.

Evidence files:

- `/tmp/wr-template-qa/result.json`
- `/tmp/wr-template-qa/natural-1440.png`, `/tmp/wr-template-qa/natural-390.png`
- `/tmp/wr-template-qa/technology-1440.png`, `/tmp/wr-template-qa/technology-390.png`
- `/tmp/wr-template-qa/explorer-1440.png`, `/tmp/wr-template-qa/explorer-390.png`
- Repeatable local QA source `/tmp/wr-template-browser-qa.ts` and bundled runner `/tmp/wr-template-browser-qa.mjs`.

## Test media and remaining live dependencies

`public/test-fixtures/hero-8s.webm` (67,951 bytes), `hero-12s.webm` (113,107 bytes), and `storyboard.png` were created with Chrome canvas + MediaRecorder. They visibly say **LOCAL TEST**; no FFmpeg was used. Chrome decoded 640×360 video, advanced playback, and reported durations **7.924647s** and **11.927612s**. `src/worker/providers/fixture-data.ts` embeds the same bytes for deterministic worker-local tests. They are used only when BOTH `ENVIRONMENT=test` and `TEST_PROVIDERS=true`; production missing config never invokes fixtures.

Still unverified: real text/image endpoint compatibility and model access, true Agnes 8/12s visual consistency and normalized timing, private signed-reference retrieval by real providers, recovered in-flight service jobs, R2 large-stream persistence, real Pages account/project limits and alias behavior under quota exhaustion, actual recipient delivery and spam handling. No real-service success, public site address, paid plan, account-wide rollout or joint Product Radar acceptance is claimed by this report.

## First independent-review follow-up — Pages root and same-origin inquiry (2026-09-12)

Historical checkpoint: canonical-HTML proxy and pre-gate root redirect descriptions in this section were superseded by the static-artifact follow-up below.

The independent review in `docs/auth-media-review.md` and `/tmp/wr-auth-media-review-evidence.json` proved that the earlier module tests missed the canonical root redirect and cross-origin inquiry path. This follow-up reopens and then freezes only `src/worker/providers/pages.ts`, new `tests/providers-gateway.test.ts`, and this report. Other review findings belong to the coordinator/domain task.

The generated gateway now handles `/` and `/index.html` locally with a no-store 302 to `/en/index.html` on the current Pages hostname. It does not fetch the canonical root through `redirect:error`. The redirected English page still passes through the canonical current-release/offline gate. An offline alias therefore redirects at root and receives the canonical 404 at the content request.

The gateway permits POST only to `/api/public/sites/:encoded-current-project-id/inquiries`, forwarding the exact body and Content-Type to the same path at `APP_ORIGIN`. Browser Authorization and Cookie headers are never forwarded. The domain task renders this form action as a relative URL, avoiding a cross-origin request. Other project inquiry routes, extra path segments and all other mutation methods remain 405. Both declared and streamed inquiry sizes are bounded to 1 MiB; body reads have a 15-second deadline, as does the upstream request. Oversize requests return 413, stalled bodies return 408, and network failures remain no-store 503. Domain validation, active/offline state, idempotency, recipient selection and abuse controls remain authoritative.

Regression evidence:

- New generated-worker tests first reproduced **four failures** against the old gateway (root 503, POST 405, offline-root response mismatch and missing POST size handling).
- `npm test -- tests/providers-gateway.test.ts tests/providers.test.ts` — **21 passed**, including six new generated-gateway tests. They execute the actual generated JavaScript against a fake upstream with the canonical route shapes and redirect-error behavior.
- Tests verify active root/index → homepage, exact inquiry body/response shape, no private header forwarding, offline homepage/inquiry 404, other-project/path/method 405, declared and streamed size limits, stalled input deadline and upstream POST failure.
- Scoped TypeScript check including `tests/providers-gateway.test.ts` passed.
- Full `npm test` at this checkpoint — **76 passed across 6 files**.
- Whole `npm run typecheck` still reported the two existing concurrent `src/client/Preview.tsx` issues at lines 34/37; the new test typing issue observed during development was fixed and the scoped check rerun successfully.

No real publishing, provider call, mail delivery or secret access was performed. Actual Cloudflare deployment and browser inquiry delivery remain live-acceptance dependencies; the root task continues integrated local browser verification. These ownership files are frozen again after this follow-up.

## Static-artifact architecture follow-up (2026-09-12)

The coordinating task identified that canonical HTML proxying contradicted the approved precompiled Pages design. The gateway now uses `createPagesGateway(origin, projectId, releaseId)` and binds the immutable release ID into the uploaded `_worker.js`; `publishPages` supplies the same release ID used by its deployment marker. No model/provider-generation behavior or Product Radar wire contract changed.

Before any supported content or inquiry request, the gateway GETs `APP_ORIGIN/public/sites/:projectId/gate/:releaseId` with `redirect:error`, `cache:no-store`, no browser credentials and a 15-second deadline. Only 204 permits continuation. A denied gate returns 404; unavailable/unexpected/failed gate checks return 503. The coordinating Worker implements this lightweight gate directly against D1. Old deployment aliases whose bound release is no longer active cannot show old content or submit inquiries.

Active content is served through **Pages `env.ASSETS.fetch(request)`**, using the already-uploaded trusted HTML. There is no canonical HTML fetch or per-page coordinator rendering in the generated gateway. Root/index redirects remain on the same Pages hostname and now occur only after the release gate succeeds. The exact project inquiry POST still forwards to the WR API after the gate, retaining the 1 MiB body limit, 15-second body/read and upstream limits, and stripped browser credentials. Generated media URLs use the root task's direct Worker/D1/R2 public route, outside the global Durable Object.

Validation for this follow-up:

- Updated generated-code tests first showed **6 failures** against the old canonical-proxy gateway.
- `tests/providers-gateway.test.ts` now has **9 passing tests** proving the gate precedes actual `ASSETS` access, no canonical HTML fetch occurs, catalog/detail/asset/HEAD requests use the static binding, root redirects are gated, inquiries stay scoped, stale release and offline aliases are denied, unexpected gate responses fail closed, and body/network limits remain intact.
- `npm test -- tests/providers-gateway.test.ts tests/providers.test.ts` — **24 passed**.
- Full `npm test` at this checkpoint — **80 passed across 6 files**.
- Scoped TypeScript check including both provider test files passed.

Integration note sent to the coordinating task: Cloudflare can promote its stable hostname before the D1 activation write completes. The new release correctly fails closed during that interval. If activation persistence fails, the publish must remain uncertain and recover the same release (or explicitly restore the previous deployment), rather than being abandoned as a final failure while the new bundle points at an inactive release.

Real Cloudflare Pages `ASSETS` binding behavior, default/preview aliases under quota exhaustion, deployment promotion timing and production inquiry delivery still require an explicitly authorized live acceptance run. No real deployment, mail, provider generation, resource creation or secret access was performed in this follow-up. Provider and test ownership is frozen again after this report.

## Fixed multi-account hosting binding (2026-09-12)

The coordinating task reconfirmed the approved v1 hosting requirement: each site keeps a fixed Cloudflare account and Pages project chosen before first publication; changing a token must not change its URL. The shared contract now includes `HostingTarget { accountId, pagesProjectName }`, `ProviderSet.resolveHostingTarget(projectId, current?)`, and optional TypeScript argument 5 on `publish(..., previousDeploymentId?, hostingTarget?)`. At runtime publishing without the persisted target fails with `pages_hosting_target_required`; the provider never assigns a new account while publishing. The domain task owns atomically persisting Project/Release targets and passing the saved target for publishing/restoring.

Configuration supports the secret `CLOUDFLARE_HOSTING_ACCOUNTS` JSON array of `{accountId, apiToken}` entries. IDs must be unique; malformed/empty explicit arrays and missing tokens are rejected. The legacy `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` pair remains available only when the array is absent or blank. An explicitly supplied array never falls back to the legacy pair. `.env.example` documents the setup without real credentials.

For an unbound site, accounts are sorted by account ID and selected by the project ID digest modulo account count. The Pages name retains the existing `wr-` plus the first 32 hexadecimal SHA-256 characters of project ID. Once supplied, the saved account/name is returned unchanged; pool growth or order changes do not reassign it. Publication resolves the current token for that exact saved account. If the account disappears, `pages_hosting_account_missing` is returned before any network request, even when another account and legacy token are present. Public targets/status output contain no token. Explicit test providers use `accountId: LOCAL_TEST`, require the saved target too, and refuse to adopt live-account bindings.

Owned changes: `src/worker/provider-contract.ts`, `src/worker/env.ts`, `src/worker/providers/pages.ts`, `src/worker/providers/index.ts`, `src/worker/providers/fixtures.ts`, `.env.example`, new `tests/providers-hosting.test.ts`, existing provider transaction tests and this report. Shared model/storage changes were made by the domain owner. No root public-serving files were modified.

Validation:

- Eight new hosting tests failed before implementation, then passed.
- Tests cover repeatable first assignment and account-order stability; preserved Pages name; same URL and new token on rotation; deleted bound-account denial with no fallback/network; legacy single-account support; malformed/empty/duplicate account rejection; required saved publish target; and explicit local-test binding.
- `npm test -- tests/providers.test.ts tests/providers-gateway.test.ts tests/providers-hosting.test.ts` — **32 passed**.
- Full `npm run typecheck` — **passed** at this checkpoint (supersedes earlier concurrent UI type-check failures in this report).
- Full `npm test` — **108 passed across 9 files** at this checkpoint.

No real credential was read, written or returned; all network assertions use fake responses and test tokens. Actual account ownership, capacity, permissions, token rotation and unchanged production URL still require an authorized live canary. Provider/config/test ownership is frozen again after this section.

## Final activation safeguard

Each Pages deployment now contains the new static snapshot and exactly one previous successful snapshot. The release-bound gate selects the currently approved version before serving ASSETS, including the interval or failure after Cloudflare promotion but before D1 activation. Previous artifacts use an internal directory and exact page allowlists; direct access, stale aliases and offline requests remain blocked. Root verification includes upload-manifest tests and the actual local Pages browser harness in artifacts/pages-browser/result.json. No rollback API or extra hosted service was introduced.
