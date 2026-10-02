# Quick Mode delivery latency

The owner's completed Lumi task took 11 min 37.406 sec on 2026-10-03 (Asia/Shanghai). Its 27 website assets required immutable-result archiving before acceptance; publication then prepared 65 responsive variants over 17 provider rounds. All 116 Product Radar image calls in the run's window succeeded. This change addresses measured delivery overhead without changing image generation quality or quantities.

## Changes

- Copy referenced assets into the immutable website result in bounded groups: at most four concurrent files and 20 MiB of declared source bytes per group. An existing larger asset copies alone. Wait for every copy in the group to settle before surfacing an error; write the result JSON only after every group succeeds. Keep the existing business lock, asset order and retry behavior.
- Separate publication's four-conversion concurrency bound from its per-invocation allowance. An invocation can finish up to twelve variants in groups of four, retaining its existing 30-second starting-work deadline, cumulative 40-MiB input budget, per-group checkpoint, same-asset serialization, cancellation and one-second requeue delay.
- Include the already verified docs/QA-script corrections from `0e8feb1bf0983e2b655ce8336729d9e10e29a18a`; the deployed five product templates and their versioned contracts are unchanged.

## Evidence

- New archive tests failed against sequential code before implementation; publication's 250-variant/busy regression required 63 rounds before, 22 afterward. This is a deterministic scheduling test, not a production speed claim.
- Eight directly affected regression files passed **176 tests**, including quota/project/materials boundaries, archive concurrency/memory/error completion, publication limits, cancellation and checkpoint recovery.
- Typecheck and Vite production build passed. Independent code review found no issues.
- Production versions, sealed artifact, preserved bindings/queues, live Worker bytes and affected static assets are checked by the owner-authorized direct-release path. Exact release evidence is stored outside Git at `/Users/dom/Desktop/product-radar-quick-delivery-release-20261003/`.
- No customer task was regenerated or republished for diagnosis. A new end-to-end live duration still requires a subsequent customer run.

Read-only original task and timing evidence: `/Users/dom/Desktop/product-radar-quick-timing-20261003/`.
