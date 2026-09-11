# Durable business backend implementation

Implemented 2026-09-12 against the approved full v1 and the internal/integration contracts. This is local implementation evidence, not a claim that real providers, mail or Cloudflare customer publication have been connected.

## Files and boundaries

- `src/worker/domain.ts` validates drafts and enforces project permission, approval/revision, publication and provenance rules.
- `src/worker/domain-store.ts` owns prepared D1 statements and atomic business batches.
- `src/worker/domain-service.ts` implements the agreed project/source/import/upload/approval/job/preview/release/inquiry/admin routes and durable task transitions.
- `src/worker/coordinator.ts` exposes the singleton SQLite Durable Object and alarms. D1 holds all business records; the object serializes mutations and schedules external operations without holding the mutation lock across generation.
- `migrations/0002_business.sql` creates projects, assets, jobs, quotas, quota ledger, releases, inquiries, idempotency, provider-attempt audit and inquiry limits. `0003_source_reviews.sql` records the exact source changes reviewed by the current user.
- `tests/domain.test.ts` and `tests/domain-service.test.ts` cover state and actual SQLite SQL behavior, using explicitly injected provider/R2 test adapters.

The Worker must replace all client-supplied `X-WR-Principal` values and send `encodeURIComponent(JSON.stringify(currentPrincipal))`. The Coordinator has no independent public Worker route. The Product Radar service client rechecks live permission for queued generation and before publication activation. Standalone imports re-fetch authorized snapshots; handoff creation is keyed by initiating user and request ID. Images use `prImage(..., snapshot.version)` so changed source image bytes cannot be silently attached to an older snapshot.

## Critical behavior

- Project creators, current admins of the matching workspace, and platform admins can manage a project. Other members cannot read its draft, private assets or inquiries. Source permissions remain independent of project administration.
- PUT validates and recalculates revision/confirmation fields. Video input changes invalidate script/storyboard approvals; stale generation results remain saved assets without replacing newer edits. Uploaded video can be accepted without AI approvals.
- Image/video reservations and jobs enter D1 in one atomic batch, under the singleton mutation lock. The original initiating user remains the quota owner on technical retry and recovery. Each successful saved image is committed separately; technical failures release their own reservation.
- Video submission intent is persisted immediately before the external submit. At most one running/unknown video occupies the global slot. Known upstream IDs are polled after restart; uncertain acceptance without an ID never blindly resubmits. Permission failure before submission releases quota. A confirmed terminal upstream failure permits a bounded new technical attempt with a distinct attempt idempotency key and preserved billing owner.
- Platform-only `POST /api/admin/jobs/:jobId/reconcile {upstreamId}` binds a verified original ID to an unknown video. It records operator user ID/time in the job and resumes polling. It does not offer an unverified “release quota” operation.
- R2 receives immutable IDs before job success/ledger commit. Byte arrays use direct R2.put. Streams use sequential multipart upload with 5 MiB parts, declared-length checking when available, and bounded total size. Failed multipart operations abort; an interrupted image job can recover an already persisted object using R2 metadata.
- Private media and short-lived HMAC provider grants support GET/HEAD and byte ranges. Public assets are restricted to the currently active release's site-visible references. Signed grants expire and are bound to a single asset ID.
- Publishing uses immutable draft snapshots and changes active release only after provider success plus current authorization. Pages “deployment pending” retries the same release marker. Failure preserves the last successful release. Restore creates a release from the prior successful snapshot while preserving the current editable draft, quotas and inquiries. Offline requests cancel pending activation; an explicitly requested fresh publication is allowed after this cancellation, including when the earlier Pages acceptance was uncertain.
- All published pages use the same current-release gate. Inquiry form targets are relative `/api/public/sites/:projectId/inquiries`; Pages gateways must proxy POST only for that exact project path, preserving same-origin browser submission.
- Inquiries are saved independently of email. Recipient comes from the active release, reply identity from validated buyer input. Request idempotency, an hourly per-site/IP limit, honeypot, stable provider key and a three-attempt mail limit constrain duplicates. Ambiguous mail older than 23 hours remains unknown and cannot be retried after the provider's idempotency window.
- Empty, complete or unknown-only queues do not generate periodic alarms. Future known-video polls and queued retries still arm their next useful wakeup. Alarms are armed before dispatch so interrupted external operations can be recovered.
- Admin export serializes against business mutations and includes business records, assets/R2 keys, immutable job inputs, releases, inquiry records, quotas, ledger and provider-attempt audit. It excludes authentication tokens and secrets. R2 object copying and actual restore into a target server remain operational acceptance work.

## Validation evidence

`npm test -- tests/domain.test.ts tests/domain-service.test.ts`: **34 passed**.

Coverage includes access isolation, optimistic concurrent saves, 20-product constraints, approval forgery prevention, uploaded video bypass, optional unknown facts, atomic concurrent reservations, administrator quota ownership, partial image failure, technical retry, unknown video global slot, restart recovery, R2-before-success, stale result protection, source review races, immutable publication, previous-release recovery, offline pages/assets/inquiries, Pages pending recovery, inquiry idempotency/delivery retries, scoped HMAC/HEAD and alarm idleness/future polls.

A real local Wrangler/R2 canary at `http://127.0.0.1:8788` first reproduced project import HTTP 500. The cause was R2.put receiving a transformed unknown-length stream. After the multipart change, the same test Product Radar import returned HTTP 200 with one product and one 68-byte private asset. A private `Range: bytes=0-3` request returned HTTP 206 and exactly four bytes. Canary project ID: `27491cb4-849d-444c-a966-a557027386c7`.

Full repository `npm test` was 64/64 at an earlier checkpoint; subsequent added domain tests passed in the targeted run. Final global checks are owned by the root task after all agent changes land. Domain TypeScript errors are resolved; the last observed full typecheck failure concerned two independently owned frontend DOM overloads in `Preview.tsx`.

## Remaining acceptance boundaries

No real AI calls, real mail or external publication were made. Real Agnes status behavior, actual output duration/visual consistency, provider-media allowlists, authenticated Product Radar integration, Pages deployment aliases, verified mail delivery and deployed account-scope tests still require configured services and authorized sample inputs. Local test assets and provider outcomes are explicitly marked test; missing production configuration fails instead of returning test success.

The implementation follows current Cloudflare references for [D1 atomic batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Durable Object alarm recovery](https://developers.cloudflare.com/durable-objects/api/alarms/), and [R2 Workers object/multipart APIs](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).

## Hosting identity and activation recovery addendum

The confirmed Q17 hosting identity is now durable. `HostingTarget {accountId, pagesProjectName}` is part of Project and Release. Before queuing a publication, the domain calls `resolveHostingTarget(projectId, currentTarget)` and atomically stores the project binding, immutable release binding and job in one D1 batch. Subsequent publication and restore pass the release's saved binding as the fifth provider argument. The domain rejects a resolver changing an existing account or Pages name. Removing account configuration cannot trigger reassignment. A known active release's binding can restore missing legacy project metadata; it cannot replace an existing project binding. These are JSON additions, so no new SQL migration is required.

A Pages success is saved as `job.input.publishResult` before checking current access again or writing the release activation transaction. When that result is durable, retry and restart recovery use it directly and never create another deployment. If activation or the post-publish permission check fails, the job stays `unknown` and release stays `pending`; new publication requests remain blocked until the same job is recovered or explicitly cancelled by taking the site offline. Offline cancellation is preserved when a provider response arrives concurrently, so saving that response cannot accidentally reactivate the site.

A complete D1 outage may prevent saving the returned deployment result. The earlier durable `publicationStarted` marker and release ID still exist. In that case, the job remains recoverable: the next alarm marks it unknown, and explicit retry calls the provider with the same release ID/hosting target. The provider recovers the existing Pages deployment by its release marker. It does not allocate a replacement release or a different account. A SQLite trigger regression reproduces both the failed result write and subsequent recovery, in addition to a separate trigger test for activation-write failure.

Latest verification after this addendum: **41 domain tests passed**, and full `npm run typecheck` passed. Added tests cover pre-deployment binding persistence, configuration removal, atomic rollback, D1 activation failure, post-deployment permission revocation, concurrent offline cancellation, and inability to store the accepted result during a D1 outage.

## Independent-review P1 corrections

The final backend review reproduced two errors in durable task recovery. Both now have failing-first SQLite regressions and fixes:

1. An already accepted video no longer repeats the initiating user's PR permission check before each status poll. New submissions still revalidate current authorization. An accepted upstream task continues to be tracked to a confirmed terminal result; temporary PR failures or revoked membership cannot incorrectly release its reservation or permit a second Agnes submission. Project/media HTTP authorization is unchanged. Tests cover both 403 and 502 contexts and prove the second reserved video remains queued while the original is pending.
2. Email retries now enforce the provider idempotency deadline immediately before dispatch, including retries accepted earlier and delayed in the queue. The first actual dispatch persists `emailFirstAttemptAt` before calling the provider. This gives a first email that waited 30 hours a full retry window, while prior attempts without this new marker use the old creation timestamp conservatively. Recovery and explicit retry also check the deadline. A retry queued at 22.5 hours and dispatched at 25.5 hours sends nothing and remains unknown. The same guard covers a previously accepted email whose D1 finalization failed and whose intermediate record had become failed.

The root task selected a static previous-release fallback instead of external Pages rollback calls. Before publication, the domain renders the existing `publishedReleaseId` only if that immutable release is successful, and passes `{releaseId,files}` as provider.publish's sixth argument. It does not use the editable draft, a newer pending release or arbitrary caller input for the fallback. The provider/gateway packages and gates this previous snapshot; the existing saved publish-result recovery semantics remain intact. No rollback endpoint or new rollback state machine was added.

Latest targeted result: **47 domain tests passed**, with full typecheck passing. The independent review's original probe is `/tmp/wr-final-backend-review.ts`; its earlier failing evidence was `/tmp/wr-final-backend-review-evidence.json`. The root/reviewer owns the independent rerun and deployed-gateway acceptance.
