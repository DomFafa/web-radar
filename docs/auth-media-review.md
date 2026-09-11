# Final backend and security re-review

Date: 2026-09-12. **Conclusion: 通过 / No findings. All three P1 findings from the follow-up review are resolved in the current implementation.** This was a narrow independent verification of those fixes and their direct security consequences. No implementation was edited and no external calls were made. Earlier review records below are historical, not open blockers.

| Finding | Independent result after fix | Status |
| --- | --- | --- |
| PR failure released a known active video | Saved upstream task remains `running`, one poll occurs, both reservations remain held, second video stays queued with zero new submissions | Resolved |
| Queued retry exceeded email idempotency window | Retry accepted at 22.5 hours, execution delayed to 25.5 hours: zero sends, final state `unknown` | Resolved |
| Failed activation made stable Pages unavailable | New production gateway returns 200 with the **old approved static content** while D1 still activates the old release and the publication job remains unknown | Resolved |

Additional fallback checks passed: `/__wr_previous/en/index.html` is inaccessible (404); offline returns 503 without falling back; activating the new release selects new content; a page that exists only in the previous snapshot is then rejected (404). The original root redirect, public/authenticated detail rendering and same-origin inquiry submission remain correct (302 → 200, detail checks true, inquiry 200).

Code inspection confirms that known upstream video polling is separated from authorization for a new submission; protected user-facing APIs remain authenticated. Email first-dispatch time is persisted before sending and rechecked immediately before dispatch, with conservative handling of older jobs. Domain supplies the currently active successful release snapshot as the only fallback publication. The Pages adapter includes the bounded second static bundle and exact public-path lists; neither a pending draft nor internal fallback paths are directly exposed.

Independent reproduction source: `/tmp/wr-final-backend-review.ts`; executable: `/tmp/wr-final-backend-review.mjs`; current output: `/tmp/wr-final-backend-review-evidence.json`. The pre-fix source is preserved as `/tmp/wr-final-backend-review-before-fixes.ts`.

```sh
node_modules/.bin/esbuild /tmp/wr-final-backend-review.ts --bundle --platform=node --format=esm --outfile=/tmp/wr-final-backend-review.mjs
node /tmp/wr-final-backend-review.mjs
```

This verification uses the real domain/public-gate/gateway code with in-process SQLite, controlled provider/context responses and a static artifact fetch stand-in. The implementation owners separately report 47 domain tests and 34 provider tests passing. The coordinating task owns the final full check, actual local Pages/browser evidence and deployment dry run; this report does not claim those were independently rerun.

Residual acceptance boundary: real AI services, live Product Radar authorization, actual Cloudflare Pages deployment/asset handling, production R2 and real email delivery still require configured-service acceptance. No remaining concrete blocker was found in the reviewed fixes; those external validations are not replaced by local test success.

---

# Follow-up findings before fixes (historical record)

Date: 2026-09-12. Scope expanded to the full domain/coordinator/store and public Worker, plus auth, providers and release gates. **Conclusion: 需要修改 / Changes required. Three reproduced P1 blockers remain in the reviewed follow-up snapshot.** Implementation owners have been notified and are addressing them; the findings below require verification after their fixes. This is an independent read-only review; only this report and local reproduction artifacts were written.

## Current findings

### P1 — PR context failure releases a video slot while the upstream video is still running

- Location: `src/worker/domain-service.ts:340` and `src/worker/domain-service.ts:414-419`; subsequent submission at `src/worker/domain-service.ts:328`.
- Trigger: A known in-flight Agnes task has a saved upstream ID, then Product Radar context lookup fails or its original user's membership is revoked before a poll.
- Problem: `execute()` validates the current principal before the poll. On failure, `fail()` treats a video that already has an upstream ID as a normal failed job, releases its quota reservation, and stops occupying the global video slot. There is no terminal upstream result proving that the task stopped.
- Local reproduction: Seed `video-one` as running with `active-upstream` and a reserved quota unit, plus `video-two` queued with its reservation. Make context return 403 and tick once; then restore context and tick again. Observed first job `failed`, **zero upstream polls**, reserved quota **2 → 1**, and **one second submission** while the first upstream task remains active.
- Impact: Violates the platform-wide one-active-video rule and loses the original task's protected recovery/charging state. A transient account-service outage can trigger the same failure.
- Recommendation: Preserve the known upstream task, reservation and global slot when access/context validation fails after submission. Handle access to or attachment of the deliverable separately from determining whether the upstream operation is terminal.
- Minimal verification: Repeat the probe for both 403 and temporary 503/network errors; assert no second submission and no reservation release until a confirmed terminal outcome or explicit reconciliation.
- Cost: S–M. Blocks release: yes.

### P1 — Email retry can cross the idempotency deadline after it was queued

- Location: `src/worker/domain-service.ts:253-254` and `src/worker/domain-service.ts:386-389`.
- Trigger: A previously uncertain send is retried within the allowed window, but the durable queue resumes after the provider's idempotency window expires.
- Problem: The age check only runs when accepting the retry. That operation changes `emailStatus` from `unknown` to `queued`. `execute()` sends without checking the window again, so queue delay can defeat the protection.
- Local reproduction: Seed an uncertain email 22.5 hours old; retry returns 200. Advance the clock to 25.5 hours old before calling `tick()`. Observed **one new send**, final status `sent`.
- Impact: The buyer's inquiry may be delivered twice after the provider forgets the original idempotency key. The earlier 25-hour interrupted-job recovery fix closes one path, but does not close this queued retry path.
- Recommendation: Persist uncertain acceptance across queue transitions and enforce its safe retry window immediately before the external send. Keep an expired ambiguous operation unknown and send nothing. Preserve the same protection when the provider accepted but writing success to D1 failed.
- Minimal verification: Retry at 22.5 hours, dispatch at 25.5 hours, and assert zero calls and unknown state; separately test accepted-send followed by D1 success-write failure.
- Cost: S. Blocks release: yes.

### P1 — Failed activation can leave the stable Pages URL unavailable indefinitely

- Location: `src/worker/providers/pages.ts:285-287` (production deployment), `src/worker/providers/pages.ts:22-26` (release-specific gate), `src/worker/public.ts:81-85`, and `src/worker/domain-service.ts:377-384`.
- Trigger: Pages successfully promotes the new production bundle, then the original publishing user's PR membership is revoked before canonical activation.
- Problem: D1 correctly retains the previous successful release and records the accepted deployment as unknown. However, the stable Pages hostname now executes the new release's gateway. Its gate rejects the old active release with 404. Keeping the old D1 pointer therefore does not keep the old content available at the stable hostname.
- Local reproduction: Start with `release-old`, return provider success for `release-new`, and revoke the original principal before the post-publish check. Then retry that same job as a currently authorized workspace administrator. Observed retry 200 but job still `unknown`, accepted result persisted, D1 active release still old, **new production gateway 404**, **old deployment alias 200**. Every retry continues validating the revoked original job principal. Unknown jobs have no automatic wakeup and block subsequent publication until separately cancelled.
- Impact: This is a lasting failure case, beyond a short deployment/activation transition. The approved requirement says failed publication preserves the previous successful website at its unchanged URL.
- Recommendation: Keep or restore serving the last approved successful release at the stable hostname when the new deployment cannot activate. Any fallback must still use the live/offline gate and must never expose the pending static bundle.
- Minimal verification: After successful upstream deployment plus persistent post-publish authorization failure, the unchanged stable URL must continue returning the old approved page; taking the project offline must still block all aliases and inquiry submission.
- Cost: M. Blocks release: yes.

## Prior finding status

| Initial finding | Follow-up evidence | Status |
| --- | --- | --- |
| Pages root returns 503 | Active gateway root returns 302 to `/en/index.html`; destination returns 200 | Resolved |
| Product routes render homepage | Public product route and authenticated `page=detail` preview both contain the detail section | Resolved |
| Pages inquiries fail CORS | Relative same-origin inquiry POST through generated gateway returns 200 | Resolved |
| Expired interrupted email becomes known failure | Recovery now raises uncertain `ProviderError`; expiry guard is retained | Original path fixed; queued-expiry variant remains above |

## Independent probe and evidence

- Source: `/tmp/wr-final-backend-review.ts`
- Executable: `/tmp/wr-final-backend-review.mjs`
- Evidence: `/tmp/wr-final-backend-review-evidence.json`

The probe uses in-memory SQLite, seeded published releases/jobs, the real generated Pages gateway and public Hono gate, and counted provider/context stand-ins. All fetches are handled locally in process. No external calls, paid generation, real mail or deployed mutations were made.

```sh
node_modules/.bin/esbuild /tmp/wr-final-backend-review.ts --bundle --platform=node --format=esm --outfile=/tmp/wr-final-backend-review.mjs
node /tmp/wr-final-backend-review.mjs
```

Observed results include root 302/home 200, both detail render checks true, same-origin inquiry 200, stable new gateway 404 with old active release, second video submitted with first still in-flight, and delayed uncertain email retry sent at 25.5 hours.

## Boundaries reviewed without additional findings

The follow-up retains live principal revalidation, one-time hashed grants, creator/workspace-admin isolation, source reauthorization/versioned image reads, immutable quota ownership, atomic D1 reservations/settlement, revision-bound approvals and stale-result handling. The new public gate joins the active pointer and immutable release in one D1 query; public media requires current release membership and same-project asset ownership. Static ASSETS is reachable only after a matching active release gate and the gateway fails closed without cache reuse. Provider credentials and hosting account tokens are not copied to client state or saved hosting identities. Hosting target/account identity is durably bound before dispatch and cannot silently migrate after configuration changes.

Multipart limits, bounded provider responses/redirect rejection, current template escaping and fact/translation output validation were inspected. The reported 108-test full suite and typecheck are implementation-owner evidence, not substitutes for these newly reproduced boundary cases. Existing suites were not redundantly rerun. Actual provider and Cloudflare deployment semantics, media decoding and recipient delivery remain separate live acceptance; this review makes no external-service success claim.

No requirements clarification or additional approval is needed to fix these defects. The initial review record follows for traceability.

---

# Initial review record (superseded by follow-up status below)

Date: 2026-09-12. Conclusion: **需要修改 / Changes required**. Security review mode. Four important findings; no confirmed critical security bypass in the reviewed auth/provider code.

Reviewed the approved full-v1 and integration contracts, provider implementation report, and current staged/new-file implementation. Scope: auth, HTTP, Product Radar integration, Worker entry/config, shared/provider contracts, providers and templates. Domain code was inspected only at their calling boundaries. No implementation changes were made and no existing suite was rerun. The supplied 37 auth/provider/template passing tests and template browser evidence do not exercise the failing cross-module paths below.

## Findings

### P1 — Published Pages root always returns unavailable

- Location: `src/worker/providers/pages.ts:9`, with `src/worker/domain-service.ts:208`.
- Trigger: Open the stable URL returned by `publishPages`, e.g. `https://<name>.pages.dev/`.
- Problem: The gateway proxies `/` to `/public/sites/<id>/`, where the canonical service returns a 302 redirect. Its upstream fetch uses `redirect: 'error'`, so that expected redirect throws and the gateway returns 503. `/index.html` has the same problem. Simply passing the relative Location through would also target the wrong Pages path.
- Reproduction: Seed an active release, run the generated gateway against the real canonical route through a local HTTP server, request `/` and `/en/index.html`. Observed **503** at root, **200** for the explicit English page.
- Impact: The customer’s published/default website URL is unusable despite a successful deployment.
- Recommendation: Map root/index to the canonical English home path before fetching, or handle the known internal redirect while preserving the all-alias live gate and rejecting arbitrary upstream redirects.
- Verification: Stable root and index return the home page when active; both return unavailable when offline; no direct ASSETS fallback.
- Cost: S. Blocks release: yes.

### P1 — Public and authenticated product routes render the homepage

- Location: `src/templates/index.ts:46`, `src/templates/index.ts:99`; callers `src/worker/domain-service.ts:93-94` and `src/worker/domain-service.ts:210-212`.
- Trigger: Follow a product detail link from the canonical/Pages website, or load the authenticated product preview.
- Problem: Domain routes pass `page: 'product'`. The renderer only accepts `'detail'` and silently falls back to `'home'` for the supplied value. Static template unit tests use `'detail'`, so they do not catch the actual runtime mismatch.
- Reproduction: Request `/public/sites/<id>/en/products/product-one/index.html` and `/api/projects/<id>/preview?page=product&productId=product-one`. Both return successful responses containing the homepage instead of `<section class="detail wrap">`.
- Impact: The approved independent product page is unavailable in both preview and published sites.
- Recommendation: Use one shared page contract and map the externally selected product page to the renderer’s detail page at the boundary.
- Verification: Navigate catalog → product in authenticated preview and every template’s live/canonical route; assert the selected product’s H1, specifications and inquiry selection.
- Cost: S. Blocks release: yes.

### P1 — Published inquiry form is blocked by CORS

- Location: `src/templates/index.ts:124`, with `src/worker/domain-service.ts:212`, `src/worker/domain-service.ts:37` and `src/worker/index.ts:71-75`.
- Trigger: Submit a contact form from the Pages hostname returned by publication.
- Problem: Rendered form action is the separate `APP_ORIGIN/api/public/sites/<id>/inquiries`. The browser sends a CORS preflight because the form script uses a JSON POST. The public route does not handle OPTIONS or provide CORS response headers, so preflight falls through to principal enforcement and returns 401. The current Pages gateway also rejects POST, so a same-origin path requires a specific allowed inquiry proxy.
- Reproduction: Inspect the rendered action, then send OPTIONS with the Pages Origin and `Access-Control-Request-Method: POST` / `Access-Control-Request-Headers: content-type`. Observed **401**, no `Access-Control-Allow-Origin`.
- Impact: Buyers cannot submit inquiries through published sites; no inquiry record or email is created by the blocked browser request.
- Recommendation: Provide the approved same-origin inquiry route through the Pages gateway, or narrowly allow trusted site origins with complete OPTIONS and POST CORS handling. Continue deriving the recipient and publication state on the server.
- Verification: Browser submission from the actual site origin creates exactly one inquiry and one email job; retry reuses the inquiry; offline aliases reject new submissions.
- Cost: S–M. Blocks release: yes.

### P1 — Expired uncertain email recovery becomes retryable as a known failure

- Location: `src/worker/domain-service.ts:270`, `src/worker/domain-service.ts:376-382`, `src/worker/domain-service.ts:228`.
- Trigger: The email provider accepts a send, the process stops before persisting success, and recovery occurs more than 24 hours later.
- Problem: The 23-hour recovery guard throws a `DomainError`; `fail()` records `failed`, not `unknown`. The manual retry’s age guard only applies to `emailStatus === 'unknown'`, so this previously uncertain delivery is now allowed to send again after the provider idempotency protection has expired.
- Reproduction: Seed one `running` email job with one attempt and a queued inquiry 25 hours old. Call `tick()`, request the inquiry retry route, then call `tick()` again. Observed **failed** after recovery, retry **200**, and **one new provider send**.
- Impact: A recipient can receive duplicate inquiries after a normal crash/restart path, contrary to the approved retry/idempotency guarantee.
- Recommendation: Preserve unknown acceptance when recovery exceeds its safe window. Enforce the window immediately before retry dispatch, so queue delay cannot bypass it, and require independent reconciliation after expiry.
- Verification: A 25-hour interrupted accepted send remains unknown and makes zero send calls after automatic or user retry; retries within the supported window retain the original key and attempt bounds.
- Cost: S. Blocks release: yes.

## Reproduction evidence

The review-only probe is `/tmp/wr-auth-media-review.ts`; bundled executable `/tmp/wr-auth-media-review.mjs`; captured output `/tmp/wr-auth-media-review-evidence.json`. It uses an in-memory SQLite database, seeded public release, generated Pages gateway, local HTTP upstream and a counted fake email send. It does not call paid providers or modify implementation/data.

```sh
node_modules/.bin/esbuild /tmp/wr-auth-media-review.ts --bundle --platform=node --format=esm --outfile=/tmp/wr-auth-media-review.mjs
node /tmp/wr-auth-media-review.mjs
```

Observed output:

```json
{
  "gateway": { "rootStatus": 503, "homeStatus": 200 },
  "product": {
    "publicStatus": 200,
    "publicRendersHomepage": true,
    "publicRendersDetail": false,
    "previewRendersDetail": false
  },
  "inquiryCors": {
    "action": "https://wr.example/api/public/sites/review-project/inquiries",
    "preflightStatus": 401,
    "allowOrigin": null
  },
  "emailRecovery": {
    "statusAfter25Hours": "failed",
    "retryStatus": 200,
    "newSendCalls": 1
  }
}
```

## Verified boundaries and remaining evidence

Auth code re-resolves current Product Radar user/workspace roles on protected requests; supplied roles do not become permanent grants. Grant consumption is a conditional atomic update; nonce rotation invalidates old codes; creation uses the original coordinator idempotency key. Long-lived PR tokens are discarded after standalone context resolution. Test login/session/provider paths require explicit test configuration, and the root Worker additionally restricts test mode to loopback.

Provider calls reject redirects and do not forward authorization to media downloads. Output media origins are explicitly allowed; streams have byte limits. Video submission sends one complete request with the approved reference group, and unknown submission is represented distinctly. Pages gateways cover all paths and avoid a private ASSETS bypass. Template text/attributes are escaped; unsafe URLs and brand colors are filtered. Text output validates selected-language fields, and prompts preserve supplied facts and source conditions; factual correctness still needs the approved customer review.

Real upstream authentication, media format/playability, signed reference retrieval, R2 stream behavior, actual Pages deployment contracts/aliases and recipient delivery remain separate live checks. This review does not claim those external services passed. Domain/frontend final review is separate; the four concrete boundary defects above were sent to the coordinating task for assignment.

No requirements questions or additional approvals are needed to resolve these findings.
