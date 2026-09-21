# Immutable confirmed-materials rendering

`baseline-20260922.mjs` is the render-only closure from reviewed commit
`18d798c1d96bdab00c14b9ccec629435c1928003` (including the deployed `09fb979`
Senseng catalogue layout fix). Its manifest records the source commit, complete
module list and SHA-256. It contains templates, shared render helpers and their
library dependencies. It contains no Worker routes, client application, environment
bindings or customer materials.

The current standalone renderer remains in `src/templates`. Confirmed-materials
revisions select the immutable snapshot through `materials-releases.ts`, so later
standalone edits cannot change an existing draft's contract or rendered layout.
Legacy contract documents are returned unchanged; execution metadata was added in
new `2026-09-22.<template>-materials.4` documents only.

Never regenerate a published snapshot in place. For a changed renderer, add a new
release file/identifier, keep the old file, and issue a new contract revision. The
freeze script requires an explicitly reviewed source checkout and refuses to
overwrite the published filename. For a new release, update its output filename
in a new reviewed generation change. Source checkout dependencies must match the
committed lockfile. The checked-in snapshot is sufficient for ordinary builds;
production builds do not regenerate it.

`baseline-preview-20260922.ts` freezes the trusted replacement runtime used by
Product Radar's preview sandbox. It was evaluated from the same reviewed baseline
with the production esbuild `keepNames` setting. Confirmed-materials previews
select this string; standalone preview interactions may continue to evolve.
Its manifest records both runtime and snapshot digests. Generate a new runtime
release when renderer interactions change, and retain this one for old contracts.

`baseline-assets-20260922.json` locks the bytes of local `/templates/` assets
referenced by the frozen render closure, including transitive CSS/font resources.
CI checks their contents and dependency coverage. Never overwrite or delete these
paths: changed resources require a new path and a new renderer release. Existing
assets stay in place; this does not duplicate media in the Worker bundle. The
manifest also records external URLs already present in baseline CSS. Those
third-party resources are outside Web Radar's byte-immutability guarantee; no new
external dependencies are introduced here. `freeze-preview-assets.mjs` requires
the reviewed source checkout/commit and refuses to replace published manifests.

`materials-release-registry.ts` supports a reviewed new template that reuses this
renderer through explicit image/text binding maps. Registration validation checks
complete unique bindings, available renderer versions, declared capabilities and
actual layout capacity. An additional registration cannot shadow a published baseline
revision. Add each new registration to `tests/fixtures/materials-mapping-hashes.json`;
that golden snapshot locks the complete release, including private slot maps, not
only its public contract. Changes to an existing mapping require a new revision. This alias path may rename positions and narrow copy
limits; it cannot increase image counts, alter image geometry, introduce video or
claim another layout without an appropriate new renderer release. Product Radar
receives only the public machine contract and does not need these private maps.

The synthetic new-template fixture lives under `tests/fixtures`; production does
not register it. `tests/helpers/register-materials-plugin-fixture.mjs` registers
its exact ID into a marked isolated test copy, including the existing template
type and validation enums. It does not bypass authentication or weaken validation.
