# Web Radar shared frontend

Implemented in `src/client/` for the approved complete v1. Standalone and `/embed/product-radar` use the same project editor and API.

## Working surface

- Chinese editorial studio: cream canvas, forest ink, lime accents, local serif and humanist typography. Responsive workspace, mobile step navigation, keyboard focus styles and reduced-motion support.
- Existing-account sign-in, explicit loopback test identities, project list/create, company and contact details, product uploads, ordering, primary product, category, market, English plus one approved second language.
- Permission-scoped source import, independent snapshot provenance, manual update checks and selected update application.
- Three original template selectors, script generation/edit/confirmation, per-scene descriptions and regeneration instructions, group confirmation, complete-video generation and durable-task recovery. Uploaded videos bypass AI and require explicit preview/selection.
- Brand, social links, English and translated website copy, product translations, safe explicit save, private full-site preview, publish/restore/offline controls and publication history.
- Inquiry list and mail retry, platform service status, per-account quota allocation, unknown upstream-video task reconciliation and business-data export.

## Boundaries

WR credentials stay in module memory. Embedded authorization validates the exact configured parent origin, actual `event.source`, protocol and payload. Active/successful grant exchanges are deduplicated by request ID plus code; failed exchanges and rotated codes can be retried. Same-identity reauthentication preserves unsaved edits; a different user or workspace clears the old editor.

Background refresh replaces draft inputs only when clean. Version conflicts preserve local data, merge independent fields and require a choice for conflicting fields; product arrays are treated atomically. Local unsaved data can also be downloaded before resolution. Uncertain job/publication transport retries reuse the original request ID and full payload.

Preview fetches HTML and every referenced private asset with the WR Authorization header. A checked ready handshake transfers Blob objects to the opaque iframe, which creates its own short-lived URLs and revokes them on cleanup. The iframe has `sandbox="allow-scripts"` without same-origin access. A nonce-limited navigation bridge supports the renderer's `data-wr-page`, `data-wr-lang` and `data-wr-product-id` markers; bridge messages verify the frame source and per-preview channel. Preview CSP blocks external requests and submissions, and inquiry controls remain disabled. Login credentials never enter iframe URLs.

Missing services remain visible, failed actions retain their errors, and test environments have a persistent banner. A submitted task is labelled submitted/queued rather than successful generation or publication.

## Verification

- `npx vitest run tests/frontend-contract.test.ts`: 8 tests passed. Covers exact-origin/source authorization, failed/rotated grant retry, three-way draft conflict handling, atomic product edits, transport idempotency and private asset scope.
- `npm run typecheck && npm run build`: passed again after the final frontend changes (308.18 kB JavaScript, 74.88 kB CSS before compression).
- Root-operated browser acceptance is recorded in `artifacts/browser/result.json`: project/company/source import, script confirmation, four scenes, saved playable 12-second video, editable English/German site and product copy, authenticated private full-site preview, explicit local-test publication and 390 px editor overflow check. The record has no errors; the root reviewed the mobile screenshot. Additional integration coverage remains part of the combined root acceptance.

Local test-provider success is distinct from live Product Radar, dedicated text/Image 2.5/Agnes credentials, Cloudflare publication and actual email delivery. Those require the separately configured real-service acceptance described in the approved final review.
