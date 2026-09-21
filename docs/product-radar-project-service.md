# Product Radar private project service v1

This service extends confirmed-materials receipt without changing `wr-materials-v1`, `wr-materials-receipt-v1`, `autoPublish:false`, the old handoff, or the standalone Web Radar UI. No migration or additional provider is required. It renders the accepted draft using the existing renderer; receiving materials, reading status, previewing and loading assets do not generate AI content or publish a customer site.

All active PR accounts with website access can use these endpoints without a separate Web Radar login. WR refreshes `userId`/`workspaceId` through PR `/api/web-radar/service/context`; supplied role/email fields have no authority. Platform administrators may manage all projects; company administrators require the current workspace and members additionally require ownership. Project assets, publication status and background publication obey the same rules. Receipt IDs retain their existing submitting-user/workspace scope.

## Request boundary

Prefix: `/api/integrations/product-radar/projects/:projectId` on WR.
Every endpoint is **POST**, with `Content-Type: application/json`, `X-Web-Radar-Secret` and `principal: {userId: string, workspaceId: string}` in the body. The PR backend derives identity from its current authenticated session, never from browser input. `projectId` is the UUID from the accepted materials receipt. The existing receipt still returns `nextAction: 'open-web-radar'` for old clients; new clients call this service directly.

| Suffix | Other JSON fields | Result |
| --- | --- | --- |
| `/status` | none | `ProjectServiceStatus` |
| `/preview` | `page?`, `lang?`, `productId?`, `expectedVersion?`, `proxyBasePath?` | `ProjectServicePreview` |
| `/assets/:assetId` | none | Original binary with content type, optional Range response |
| `/publish` | `requestId: string`, `expectedVersion: number` | `ProjectServiceStatus` for this job |
| `/refresh-publication` | `requestId`, `expectedVersion`, `expectedPublishedReleaseId: UUID` | Maintenance refresh of the active confirmed snapshot |
| `/publication-status` | `jobId?: string` | `ProjectServiceStatus` for specified/latest publish job |

All service responses use `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`. Wrong key is 401; unavailable/disabled/non-allowlisted identity is 403; inaccessible project/foreign job/asset is 404. Unaccepted materials is 409. Invalid page/language/product/proxy path is 400. Stale version and changed idempotency payload are 409. Provider/service unavailability is 503/502. Error responses are `{code,message}`.

The exact TypeScript response contract is [`src/shared/project-service.ts`](../src/shared/project-service.ts). All JSON successes carry `schemaVersion:'wr-project-service-v1'`, `projectId`, and `projectVersion`.

`ProjectServiceStatus` includes `name`, `template`, `languages`, `pages`, `products:[{id,name}]`, `primaryProductId`, `publication`, optional `publishedUrl`, plus `previewEndpoint`, `publishEndpoint`, `statusEndpoint` (WR-relative paths).

`projectVersion` is the project record's optimistic-concurrency version and also increments when publication activates; keep using it for `expectedVersion`. It is not a content-change counter. `hasUnpublishedChanges` compares current content to the active successful release using the existing published-draft comparison. It is true without a successful active release. Optional `publishedVersion` is that release's original draft version. Use these fields for the published-version label and update action; a later failed job must not replace the active release used for comparison. Content equality does not by itself mean the website is online; `publishedUrl` retains the existing online check.

`publication.status` is `idle | queued | running | unknown | succeeded | failed | paused | cancelled`.
`publication.phase` is `idle | queued | preparing_media | deploying | recovering | complete | failed`.
`publication` also includes optional `jobId`, `releaseId`, `inputVersion`, `url`, `error`, `updatedAt`, and required `retryable`.

Optional `publication.mediaProgress:{completed,total}` reports image preparation from the existing release manifest. Each asset's requested widths are counted once; only a successfully stored matching variant counts as completed. Duplicate or unrelated variants do not increase progress. No manifest or zero requested widths omits the field. This reports image preparation only: even `completed === total` must not imply deployment success; use `status` and `phase` for that. The same projection is returned by status, publication-status and publish, without exposing private storage metadata or making additional storage calls for the counts.

`publishedUrl` is the project's current active publication when available. `publication.url` is returned only for a succeeded job/release and an online project. A draft never receives a fabricated URL. `projectVersion` is the current project version; `publication.inputVersion` is the version queued by that click. No draft, secret, principal, account binding or provider result is exposed.

## Private preview

Defaults: `page:'home'`, first configured language, primary product, `proxyBasePath:'/api/web-radar/projects/:projectId'`. Supported pages are `home | catalog | detail | about | contact`; selected language/product must exist. `expectedVersion` prevents loading an unintended revision. `proxyBasePath` permits only an absolute `/api/...` path with alphanumeric, hyphen and underscore segments, without query strings, dots, escapes or foreign origins.

`ProjectServicePreview` includes `html`, `runtime`, `page`, `lang`, `productId`, `proxyBasePath` and `assetBaseUrl` (WR origin for public template resources). The HTML retains renderer `data-wr-page`, `data-wr-lang`, `data-wr-product-id` and interaction hooks. Media URLs, including background/style, poster and responsive media, use `${proxyBasePath}/assets/:assetId`. Internal navigation anchors use `${proxyBasePath}/preview?page=...&lang=...&expectedVersion=...&productId=...`. Forms remain disabled in preview.

`runtime` is fixed first-party JavaScript composed from `referenceInteractions`, `materialsRuntime`, `productImageViewerRuntime`, and `bannerRuntime`, plus preview-only form prevention and product search. It includes a scoped `__name` helper for the Worker bundle and has no customer data. PR removes original HTML scripts and event attributes, then runs only this runtime and its own trusted bridge inside its CSP-isolated preview shell. Do not execute both original scripts and the separate runtime.

PR serves authenticated GET proxies returning preview JSON/binary. Because a sandbox iframe cannot attach PR's Bearer header, the parent fetches HTML and private media using the current login, rewrites media into blobs, and forwards authenticated navigation from a sandbox bridge. Do not place the shared secret or authentication token in the HTML/URL/iframe. Keep opaque iframe origin and validate the frame/channel for messages. No WR login/exchange/session is required.

## Explicit publication

Only a customer's explicit confirmation calls `/publish`. Keep the exact `expectedVersion` that was previewed; do not silently fetch a newer version before deploying. Persist one `requestId` (4–120 alphanumeric, underscore or hyphen characters; a UUID is suitable) for uncertain transport/retries. Exact replays return the original job; changing the same request's version returns 409. A new request ID also reuses matching pending or already-published content through the existing publication pipeline.

Poll `statusEndpoint` with the same principal and `jobId`. `failed` with `retryable:true` permits an explicit fresh attempt using a new request ID and reviewed version. `unknown` means an uncertain outcome/recovery; do not automatically create a replacement job. Existing durable recovery preserves accepted provider results and avoids submitting a second publication. Background work refreshes permissions before execution, before external publication dispatch, and before activation.

## Local evidence

The separately authorized `/refresh-publication` maintenance operation renders the active successful release with the current renderer, including existing non-materials sites. It uses the same refreshed allowlisted identity and project/workspace permissions. It freezes the release draft and original draft version, reuses compatible prepared media, and preserves the current draft, including unconfirmed edits. Both expected versions must match at admission. A change of active release before dispatch or activation stops the job. Existing pending jobs are never cancelled. Exact request replays return the same job, including after activation; this operation does not change ordinary `/publish` semantics or generate AI content.

Preview responses expose `Server-Timing` for outer authentication, coordinator time, rendering and HTML mapping. The durable boundary refreshes identity once before loading the project; the outer service authentication remains independent.

`tests/project-service.test.ts` uses the real Hono service boundary, in-memory D1/R2, confirmed-materials receiver, renderer, and publication queue with fixture providers; it never publishes a real site. `tests/domain.test.ts` and project-list assertions cover cross-workspace ownership. Run `npm test -- tests/project-service.test.ts tests/domain.test.ts tests/materials-service.test.ts tests/materials-api.test.ts tests/domain-service.test.ts` and `npm run typecheck`. `node scripts/verify_project_service.mjs` additionally exercises the bundled Worker in isolated local workerd, five pages at 390/1440px in an opaque sandbox, all service denials, and a fixture-only explicit publication. Artifacts go to the ignored `artifacts/project-service-review/`.
