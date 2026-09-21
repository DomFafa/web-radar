# Product Radar / Web Radar maintenance and release boundaries

Both repositories belong to **DomFafa**. **wuyueerhao** maintains Web Radar and
may implement the Product Radar integration surfaces listed below. The existing
workflow remains fork/working branch → pull request → DomFafa review and merge.
No upstream Write/Admin permission or production credential sharing is needed.

Product Radar prepares the product, brand, image and copy material and remains
the customer entrypoint. Web Radar supplies the versioned template manifest and
builds, previews and publishes sites through the existing service protocol.
Neither repository is absorbed into the other.

## Implementation responsibility

| Existing files | Implementer | Required review |
| --- | --- | --- |
| `src/shared/web-radar.ts`, `website-materials*.ts`, `website-project.ts`; `src/worker/web-radar.ts`, `website-materials*.ts`, `website-template-catalog.ts`; `src/worker/routes/{web-radar,website-materials,website-projects}.ts` | Web Radar integration maintainer | DomFafa; preserve version, receipt and retry contracts |
| `src/client/web-radar*`, `website-materials*`, `website-project*`, `website-preview.ts`; `src/client/components/Website*.tsx`, `WebRadarPage.tsx`, `MyWebsitesPage.tsx`; corresponding `tests/web-radar*`, `website-materials*`, `website-template*`, `website-catalog-materials*`, `website-project*` | Web Radar integration maintainer | DomFafa; customers remain in Product Radar |
| `src/worker/website-materials-jobs.ts`, `website-materials-access.ts`, `src/worker/db/website-materials.ts` | Joint when changing account, quota, reservation, persistence or image-job behavior | DomFafa must review those semantics; integration ownership does not transfer them |
| `src/worker/index.ts`, `src/server/index.ts`, `src/worker/db/**`, `src/worker/routes/{auth,admin,collector,generated-products}.ts`, shared account/types modules, `src/client/{App.tsx,api.ts}`, `AppShell.tsx`, `migrations/**` | Product Radar maintainer; integration author may make the smallest required callsite edit | DomFafa retains the whole shared file and core business responsibility |
| Product collection, product generation, account/authentication, all quota policies and existing product-image reservations | Product Radar maintainer | DomFafa |
| `.github/**`, deployment scripts/configuration, dependency lockfiles and this document | Repository owner | DomFafa |

The table defines maintenance responsibility, not GitHub directory write access.
New files follow the nearest existing boundary; a new shared dependency requires
owner review. Do not move stable modules merely to make the table simpler.

In Web Radar, the corresponding integration boundary is
`src/worker/template-guides/**`, `materials-*.ts`, `project-*.ts`,
`product-radar.ts`, `src/shared/materials*.ts`, `src/templates/**` and their tests.
Its shared `index.ts`, `coordinator.ts`, auth, quota, environment and migrations
also retain owner review. See the same document in that repository.

## Reviewer routing and GitHub enforcement

`.github/CODEOWNERS` deliberately lists **@DomFafa** as the required owner.
`wuyueerhao` is the implementation maintainer and fork PR author. A code owner
must have upstream Write access; that access has not been established and is not
being granted. Listing both users would allow either user's approval, not require
both. The owner-only rule also covers shared core files and `.github/**`.

CODEOWNERS becomes effective for review routing after it is merged into the PR's
base branch. It does not by itself block merges. Owner setup still needs to make
`product-radar-integration` a required status check on `main`, require owner
review for another author's PR, dismiss stale approvals and prohibit force push
and branch deletion. Owner-authored integration PRs must be consciously merged
by the owner; an author cannot approve their own PR. Do not invent another owner
or silently grant repository-wide permissions to solve that restriction.

The PR workflow uses `pull_request`, a read-only token and checkout without stored
credentials; it never runs `pull_request_target`, supplies production secrets,
publishes packages or deploys. Fork workflow approval, when GitHub requests it,
is a repository-owner decision after inspecting the proposed workflow changes.

Official references: [CODEOWNERS permissions and approval semantics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners),
[protected-branch availability and checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Candidate and release checks

The approved deployment source is `DomFafa/product-radar:main` **after** the
integration PR is merged. The minimum retained baseline is
`f5b1e5b1d45e0d5b8fd82a02a51200a6e84c5a5f`, including the existing workflow and
the live-project-version refresh when first reopening an accepted materials
draft. It is a floor, not a claim that the current default branch is deployed.
Web Radar's approved source is `DomFafa/web-radar:codex/web-radar-v1` after its
integration PR is merged. Its floor is `09fb979aae69319c750d19fd14fcc664282a60ff`,
which includes the 29-template recovery, Product Radar service routing and the
subsequent Senseng catalog layout fix.

During a Product Radar PR, run:

```sh
node --test scripts/verify-release-source.test.mjs
node scripts/verify-release-source.mjs --candidate
pnpm exec vitest run tests/web-radar*.test.ts tests/website-materials*.test.ts tests/website-template*.test.ts tests/website-catalog-materials.test.ts tests/website-project*.test.ts tests/website-deployment-progress.test.ts
pnpm build
```

For Web Radar, run the same two Node guard commands, then:

```sh
npx vitest run tests/product-radar-entrypoint.test.ts tests/project-service.test.ts tests/materials*.test.ts tests/template-guides.test.ts tests/templates.test.ts tests/website-quota.test.ts tests/publication.test.ts
npm run check
```

The required status-check name in Web Radar is `web-radar-integration` on
`codex/web-radar-v1`; retain its existing `local`, `browser` and `render-quality`
jobs as appropriate to the changed surfaces.

Both repositories must also pass the dedicated cross-repository gate. Install
each repository's dependencies, then run **from the Product Radar directory**,
replacing the quoted root paths with the two actual candidate checkouts:

```sh
MATERIALS_INTEGRATION_ARTIFACT_DIR=/private/tmp/product-radar-cross-integration-artifacts node tests/helpers/run-template-plugin-integration.mjs --product-radar-root "<PR>" --web-radar-root "<WR>"
```

Use a fresh artifact directory for each candidate pair. An ordinary Vitest run
skips one cross-repository test when the Web Radar test root is absent; its green
result does not replace this gate. The launcher verifies that both repositories
contain the same contract fixture, registers the new fixture template only in an
isolated Web Radar copy, and runs the two service implementations together. The
gate uses synthetic images and a local Pages protocol emulator; its publication
assertions do not deploy an external site or publish a real customer's website.
Save `summary.json` and the rendered preview artifacts with the candidate record.

Before each actual application deployment, run the following in **both** source
checkouts and save their JSON output with the release record:

```sh
node scripts/verify-release-source.mjs
```

The release command rejects missing baseline history, the wrong upstream,
uncommitted/untracked source and any HEAD that is not the live remote approved
branch tip. A candidate check permits uncommitted development and does not
authorize deployment. The release guard is an executable preflight; it does not
claim to intercept ad-hoc SSH, direct Wrangler commands or replace GitHub branch
protection. Deployment operators must run it immediately before packaging and
use exactly its verified commit. Do not archive another dirty checkout.

Preserve ancestry when merging the integration PR; squashing away the recorded
baseline will correctly fail the release guard. Later approved baseline updates
must include the prior released history and new production fixes. A branch name
or a previous successful CI run alone is insufficient.

## Paired acceptance and release order

1. Record both exact candidate SHAs, deployed application versions and source
   fingerprints. Fetch the approved branches and inspect concurrent work before
   deciding what to release. Include the machine-manifest/contract/renderer
   revisions and the template capability set in the release record.
2. Run the two repository integration jobs and the cross-repository fixture
   acceptance. Use isolated test accounts/projects for submit, media transfer,
   private preview, test publication, reopen/edit, interrupted retry, duplicate
   receipt/project/quota protection, tenant isolation and real version conflicts.
   Tests that stub providers prove the local contract, not production connectivity.
3. Owner merges the reviewed candidates into their approved release branches.
   Re-run both strict source guards. Build and verify Web Radar first so its
   backward-compatible manifest and pinned renderer are available; then deploy
   Product Radar's compatible consumer. No quota/database migration is implied.
4. Check service routing with authenticated test principals, read the same catalog
   and manifest revision, and inspect the resulting private preview. Record
   desktop/mobile page and image checks separately from unit/build results.
5. Keep the previous application artifacts and commit pair. If new drafts have
   already pinned a new rule revision, preserve a consumer/renderer able to read
   that revision during rollback; do not revert the server to a version that
   discards it. Customer public sites and images stay untouched by these checks.

New templates using existing capabilities need a versioned manifest, binding and
valid example materials; they do not need Product Radar template-name branches.
New video/3D or other unsupported capabilities require a coordinated extension.
Published template revisions are immutable, existing drafts stay pinned, and
catalog refresh does not change existing public websites.

## Read-only source audit — 2026-09-22

| Item | Evidence / status |
| --- | --- |
| Product Radar upstream | SSH `ls-remote --symref` confirms default `main` at `f59170981b816c49ee2b2e655d70a824dd8643c5`; deployed-fix branch `codex/product-workflow-unification` at `f5b1e5b1d45e0d5b8fd82a02a51200a6e84c5a5f` |
| Web Radar upstream | Public API confirms default `codex/web-radar-v1` at `6eeacdab8fb0374808ea08577dfd33fbea07390c`; the integration candidate also contains the service recovery and catalog-fix history |
| Colleague workflow | [PR #5](https://github.com/DomFafa/web-radar/pull/5) was authored from `wuyueerhao/web-radar:codex/web-radar-v1` and merged by the owner; the user confirmed `wuyueerhao` |
| Latest Web Radar baseline | Other authorized release task reported `09fb979aae69319c750d19fd14fcc664282a60ff`, Worker `602488ee-3c90-4dbd-8bee-fbfcb6b8c770`, script SHA-256 `86830839227c279746d66d420cf44dfbc68df315f4d9698e4cbd25b7ab6b0b76`; refresh before a later deployment |
| GitHub enforcement | Web Radar is public; branches returned `protected: false`, repository rulesets returned `[]`. Product Radar protection, owner plan and collaborator permissions were not verifiable through the connected GitHub account. They remain unset/unverified, not completed by these files |
| API access limitation | The GitHub connector was authenticated as a different account, could read public Web Radar, but could not inspect Product Radar or administrator-only collaborator settings. SSH read access verified Product Radar refs; no permissions were changed |

This audit is a point-in-time baseline. It does not assert that candidate changes
are merged, deployed, or accepted through a real browser.
