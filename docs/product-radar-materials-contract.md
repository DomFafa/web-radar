# Product Radar confirmed materials → Web Radar contract

Status: implementation contract, 2026-09-17. This document does not claim deployment or completed integration. Web Radar baseline is `e630c66` plus preserved local product-gallery/copy work. Coordinate changes to this document with the Product Radar task before changing wire fields.

## Scope and compatibility

- Only the new confirmed-materials workflow is enabled for the currently revalidated account `vc.ddom@gmail.com`. Check this server-side at submission, status, build and material editing; also enforce existing project/workspace authorization. A supplied email or role is not authoritative.
- Existing standalone login, project creation, template selection, generation, editing, publication and protocolVersion=1 handoffs retain their current behavior.
- New rendering applies only to a project carrying a server-issued materials receipt and validated materials data. Client query parameters or client-authored provenance cannot enable it.
- Missing new materials data keeps the existing renderer output. Do not globally rewrite template defaults or existing source-import rules.
- No automatic publication, no repeat consultation/planning/image generation in Web Radar. “Build” means deterministic template assembly from approved assets and text.
- No independent deployment until the Product Radar task requests the coordinated release. No git commit/push is included.

## 1. Template discovery, requirements and complete preview

Existing read-only API remains available under `/api/internal/template-guides` with `Authorization: Bearer <TEMPLATE_GUIDES_API_KEY>`. Keep this credential on the Product Radar server. Existing `/:templateId`, `/schema`, `/output-schema` and Markdown responses retain their contract.

New routes also support `X-Web-Radar-Secret` plus `X-Product-Radar-User-Id` and `X-Product-Radar-Workspace-Id`. WR calls the existing PR context endpoint and checks the current account is `vc.ddom@gmail.com`; supplied identity headers never substitute for current authorization. These credentials grant no access to the older guide endpoints. Existing guide authentication remains unchanged. The new routes always require account context, including for guide-key/session callers.

Authoritative shared types and Zod schema: `src/shared/materials.ts`. Exact renderer inventories: `docs/materials-requirements/{juno-toys,senseng-clean,senseng-video}.json`. `textSlots[].exampleText` is optional, untrusted demo copy for position context, never evidence for company claims. Catalog marks only completed bindings as ready; other templates stay in the existing standalone selector. Frozen local revisions are Juno `2026-09-17.juno-materials.2` (22 image categories, 71 text positions), Senseng clean `2026-09-17.senseng-clean-materials.1` (6 image categories, 150 text positions), and Senseng video `2026-09-17.senseng-video-materials.2` (6 image categories, 161 text positions). The remaining seven templates are not ready for the new flow.

Juno has three explicit `hero-slide-N` background positions plus seventeen `home-image-N` positions (0 through 16). The added `home-image-12` through `home-image-16` are five 630×630 product cards missing from the older guide: reuse original selected-product media or an already approved matching image; no new generation is required for these slots. Juno mobile hero separates copy from the image and uses `contain` in a 16:9 image area to preserve the entire approved composition. Central-70%/60% composition guidance is a recommendation for cropping resilience, not a rejection rule for `fit:contain` images: inspect the real product completeness, identity and text instead. Product thumbnails use `product-main` per product; supplemental gallery uses `product-gallery` with `itemIndex` matching `galleryMediaIds` (1 onward). These must retain the original primary/gallery media. Current Juno revision requires `testimonials`, `news`, `partner-brands` in `omittedSectionIds` because their original demo claims are unsupported. Text limits count Unicode code points. All selected locale bindings are required. Product fields, contact fields and brand fields are already mapped from their typed snapshots.

New routes:

| Method | Route | Result |
| --- | --- | --- |
| GET | `/api/internal/template-guides/materials/catalog` | Materials-compatible template catalog and capability versions |
| GET | `/api/internal/template-guides/materials/:templateId` | Exact image/text slots, quantity rules, visual parameters, factual-content policy |
| GET | `/api/internal/template-guides/materials/:templateId/preview?page=home&lang=en` | `{templateId,contractRevision,page,html,assetBaseUrl}` for a complete demo page |

Catalog items: `{templateId,name,guideRevision,contractRevision,thumbnailUrl,pages,materialsReady,requirementsPath,previewPath}`. Ten existing thumbnails are `/templates/previews/<templateId>.jpg`; these are not complete page previews. Product Radar exposes only `materialsReady:true` templates in the new flow. Readiness is explicit, not inferred from a guide's presence.

Page IDs are `home|catalog|detail|about|contact`, matching the actual renderer. Existing guide `productDetail` maps to `detail`. Locale IDs retain the existing set `en|de|fr|es|pt|it`; initially English plus at most one additional locale.

Requirements result:

```ts
interface MaterialsTemplateContract {
  schemaVersion: 'wr-template-materials-v1';
  templateId: string;
  guideRevision: string;
  contractRevision: string; // explicit version of the binding inventory and renderer
  materialsReady: boolean;
  pages: Array<'home'|'catalog'|'detail'|'about'|'contact'>;
  imageSlots: Array<{
    id: string; page: string; purpose: string;
    repeat: 'once'|'per-product'|'per-product-gallery'|'fixed';
    min: number; max: number; required: boolean;
    width: number; height: number;
    composition: string; mobileComposition: string;
    fit: 'cover'|'contain'; allowedMimeTypes: string[];
    binding: 'supported'|'unsupported';
  }>;
  textSlots: Array<{
    id: string; page: string; purpose: string;
    repeat: 'once'|'per-product'|'fixed';
    min: number; max: number; required: boolean;
    maxCodePoints: number; maxLines: number;
    factualPolicy: string; binding: 'supported'|'unsupported';
  }>;
  optionalSections: Array<{id:string;reason:string}>;
  visualParameters: string[]; // exact accepted token names, no arbitrary CSS
  contentPolicy: 'b2b-confirmed-facts-only';
}
```

`repeat:once` image/text bindings may include a known `productId` as source context but cannot include `itemIndex`; exactly one binding per slot (and locale for text) is allowed across all products.

Senseng video uses the approved `home-video-poster` composition without playing the template's bundled sample video; this image-only materials contract does not generate or import video. Old standalone video behavior is unchanged.

Slots are revision-scoped stable IDs, never DOM selectors supplied by Product Radar. Product Radar calculates quantity from selected products and these rules, not `recommendedDistinctProductImages` alone. `assetSpecId` from the older generation manifest describes an asset class; it is not a render position. Product Radar must bind generated media to the returned slot IDs.

Preview is an explicitly labelled demo using bundled public media, without project creation, private customer data, model calls or active inquiry submission. Product Radar proxies the authenticated response and uses its sandboxed preview surface for desktop/mobile widths and page navigation. Do not forward the read-only key to the browser. Preserve trusted template interaction runtime while disabling form submission and arbitrary navigation.

## 2. Submit before navigating

Use a separate preparation API and retain existing handoff protocolVersion=1 for opening the accepted project. Existing `/handoffs` currently issues a code before asset copying; it must not be treated as an import-complete receipt.

New server-to-server routes under `/api/integrations/product-radar`, authenticated with existing `X-Web-Radar-Secret`:

- `POST /materials-submissions`: validate and receive a confirmed package; return 202 while copying, 200 when accepted/replayed.
- `POST /materials-submissions/:submissionId/status`: body `{principal}`; return the same safe receipt after current-principal and owner/workspace checks. POST keeps identity out of URLs and logs.
- Retrying `POST /materials-submissions` with the identical submission ID and body recovers/resumes the same operation. Do not create a new ID for a network retry.

Authoritative types for the new submission (all IDs nonempty, bounded strings; submissionId UUID):

```ts
type Locale = 'en'|'de'|'fr'|'es'|'pt'|'it';
type LocalizedText = Partial<Record<Locale,string>>;
interface MaterialsSubmission {
  schemaVersion: 'wr-materials-v1';
  submissionId: string;
  principal: Principal; // existing v1 shape; WR re-resolves current identity
  parentOrigin: string; // PR server-derived origin, existing WR allowlist
  target: {mode:'create';name:string} |
          {mode:'update';projectId:string;expectedVersion:number};
  source: {materialsId:string;revision:number};
  confirmation: {
    status:'confirmed';confirmedAt:string;
    contentSha256:string; // SHA256(canonical({source,materials})), lowercase hex
  };
  materials: {
    template: {id:string;guideRevision:string;contractRevision:string};
    country:string;
    locales:Locale[];
    primaryProductId:string;
    brand: {
      profileId:string;profileVersion:string;name:string;description:string;
      businessType?:'factory'|'trader';slogan?:string;address?:string;
      establishedYear?:string;certifications?:string;capabilities?:string;
      linkedin?:string;facebook?:string;instagram?:string;x?:string;
      logoMediaId?:string;faviconMediaId?:string;
    };
    contact: {
      cardId:string;cardVersion:string;name:string;email:string;
      phone?:string;whatsapp?:string;
    };
    products:Array<{
      id:string;sourceVersion:string;name:string;description:string;
      material:string;dimensions:string;
      primaryMediaId:string;galleryMediaIds:string[];
      tagline?:string;sellingPoints?:string[];applications?:string[];
      translations?:Partial<Record<Locale,{name:string;description:string}>>;
      factReferences:string[];
    }>;
    facts:Array<{id:string;text:string;source:string}>;
    visual:{
      palette:{primary:string;secondary:string;background:string;surface:string;text:string;mutedText:string};
      backgroundStyle:'plain'|'soft-gradient'|'subtle-shapes';
      imageTreatment:'natural'|'soft'|'crisp';
      compositionSummary:string;
    };
    media:Array<{
      id:string;sourceAssetId:string;sourceVersion:string;sha256:string;
      mimeType:'image/png'|'image/jpeg'|'image/webp'|'image/x-icon'|'image/vnd.microsoft.icon';
      bytes:number;width:number;height:number;
    }>;
    imageBindings:Array<{
      slotId:string;mediaId:string;mobileMediaId?:string;
      productId?:string;itemIndex?:number;
      fit:'cover'|'contain';
      focalPoint:{x:number;y:number};mobileFocalPoint?:{x:number;y:number};
      alt:LocalizedText;
    }>;
    textBindings:Array<{
      slotId:string;locale:Locale;text:string;
      productId?:string;itemIndex?:number;factReferences:string[];
    }>;
    omittedSectionIds:string[];
  };
}
```

This package is separate from legacy `ProductSnapshot` and `generationOutputSchema`; do not loosen their global validation. Materials products are approved snapshots with stable product IDs, rather than requiring unrelated legacy generation stages. Preserve product identity, original-primary media and the selected gallery order.

Initial media delivery is images/icons. Bundled decorative video and template interactions remain available. Do not require Product Radar to generate video for this flow. Per-slot mobile media is optional. Do not silently accept unsupported fields/tokens/media as if applied.

Validation limits: at most 20 products, 11 product images per product, 256 distinct media items, 1 MiB JSON without base64, 20 MiB per image (and lower guide limits where supplied). Each binding must resolve exactly to a supported slot, known product and media ID. Palette values are six-digit hex; focal points are normalized 0–1. Use strict Zod objects for this new protocol. Required copy and every selected locale must be complete before acceptance. Unknown claims, missing required slots, duplicate targets or excess quantity fail with structured issues.

Canonical serialization follows existing `src/worker/http.ts:canonical`: recursively sorted object keys, original array order, JSON scalar serialization. Exclude `confirmation`, transport identity and authorization from contentSha256; include `{source,materials}` exactly. Idempotency fingerprint additionally includes `target` and parent origin. Principal authorization is checked again, not frozen as a role grant.

## 3. Product Radar asset endpoint required by Web Radar

Product Radar implements `POST /api/web-radar/service/material-assets` using existing `X-Web-Radar-Secret` and no redirects:

```ts
{
  userId:string;workspaceId:string;
  materialsId:string;revision:number;
  assetId:string;expectedVersion:string;expectedSha256:string;
}
```

`assetId` is submission `media[].sourceAssetId`; `expectedVersion` is that media's `sourceVersion`. PR resolves storage keys itself and confirms the asset belongs to the confirmed materials revision and remains authorized/available. Deleted or excluded assets cannot reappear. Return bytes with accurate Content-Type/Length, Cache-Control:no-store; version/hash mismatch 409, unavailable/unauthorized asset 404, unavailable current account 403. Never accept an arbitrary fetch URL or raw object-store key.

WR streams/copies and verifies bytes, MIME signature, dimensions and SHA256 into its own R2. It records stable WR asset IDs before returning accepted. Partial copying remains pending/failed and retryable, not a usable imported project; retry must reuse verified copies and remove abandoned temporary objects. Published sites must not depend on PR temporary/private URLs.

## 4. Receipt, errors, retry and update conflict

```ts
interface MaterialsReceipt {
  schemaVersion:'wr-materials-receipt-v1';
  submissionId:string;
  state:'receiving'|'accepted'|'failed';
  contentSha256:string;
  receivedMedia:number;totalMedia:number;
  projectId?:string;projectVersion?:number; // only accepted is a usable project
  nextAction?:'open-web-radar';
  entry?:'prepared-materials';
  autoPublish:false;
  retryable?:boolean;
  error?:{code:string;message:string;issues?:Array<{path:string;code:string;message:string}>};
}
```

- `accepted` means the entire approved snapshot and all required media are durable and validated; it does not mean a website was generated or published.
- Same submission + same fingerprint returns the same receipt/project. Same submission + changed content/target returns 409 `submission_payload_conflict`.
- Revised confirmed materials use a new submission ID and increment source.revision. Updates must provide expectedVersion and must target an existing materials-import project; do not silently convert an ordinary/legacy project. Recheck expectedVersion at final commit after asset copying; 409 `version_conflict` preserves the existing draft.
- Errors retain `{code,message}` and may add `issues`/`retryable` only on new endpoints. 400 invalid schema/unsupported slot; 401 bad integration key; 403 `materials_feature_forbidden` or revoked membership; 404 inaccessible source/project; 409 stale guide/contract/source/content/version; 413 limits; 422 unconfirmed/incomplete materials; 502/503 temporary upstream/storage failure. No raw provider body or credentials in errors.
- Source of truth is a persistent receipt and operation, not a long-running browser request. Reuse existing D1/R2/Coordinator and idempotency facilities; new job processing is scoped to this import. Storage implementation does not alter old handoff state transitions.

## 5. Existing grant exchange and continuation

After an accepted receipt, PR server invokes the existing `/api/integrations/product-radar/handoffs` with `protocolVersion:1`, `intent:'open'`, `projectId`, empty products, revalidated principal, server-derived parentOrigin and a fresh UUID requestId for this login grant. The materials submissionId and login-grant requestId are different lifecycles.

Reuse `/embed/product-radar?parentOrigin=<exact PR origin>` and existing `web-radar:ready` / `product-radar:handoff` / `web-radar:authenticated` postMessage protocol. No code/token/secret in URLs. Product Radar changes to its WR container only after acceptance. A standalone top-level jump is not supplied by this iframe-bound protocol and must not be faked by putting a grant in a URL.

After authentication WR reads the server-issued receipt on the project, bypasses only this project's completed intake/template/brief steps, and performs idempotent deterministic template assembly. Refresh or renewed login must not create another import/build. Open the normal preview/edit/publish workspace when ready; leave publication an explicit existing action.

Keep the imported source snapshot immutable for provenance. Store editable applied bindings/visual settings separately in the draft; preview/edit/publish read that current draft, so user edits are not overwritten by the original import snapshot. Existing company/product/contact fields stay authoritative for their mapped positions. Read-only provenance cannot be overwritten through ordinary PUT drafts. Changing template requires explicit rebind/revalidation for this new project, not silently applying old position IDs.

## 6. Binding and acceptance obligations

- Existing reference layouts cycle main product photos by index; new bindings must resolve exact positions. Senseng additionally contains hard-coded brand/logo, headline, static copy and example product padding. Under the new import branch, replace these with approved data; never fill missing products with demo products.
- A supported slot must be consumed in home/catalog/detail/about/contact output and in published output, not merely accepted into JSON. Every selected product remains reachable from the complete catalog.
- Text bindings include headings, paragraphs, CTA, FAQs and metadata. Optional testimonials/statistics/certification blocks without facts are omitted only under the new branch; their static examples are never reused as customer claims.
- Apply primary/secondary/background/surface/text/muted colors and approved background/image treatment to actual theme CSS. Preserve layout, navigation, carousel, hover and video behavior. These settings default to the existing template when no new package exists.
- Native desktop/mobile previews and two different ten-product sets on the same template are acceptance fixtures: correct images per slot, different overall palette/composition/background, real product identity, no sample claims, no text overflow or bad subject cropping.
- Regression: unchanged standalone/legacy render output and workflow; both old handoff intents and session renewal; revoked/wrong account; forged principal; duplicate/retried/partial import; source deletion/change; unsupported revision; version conflict after long copying; no image/consultation/model job or publication during template assembly.

## Implementation ownership

Web Radar: new strict schema, materials template profile/preview, gated submission/receipt/storage, exact rendering, scoped continuation and tests. Product Radar: brand/contact storage and selection, materials generation/review/confirmation, media endpoint, API proxy and navigation. Neither task edits the other's repository.

Primary WR files: new `src/shared/materials.ts`, `src/worker/materials-service.ts`, `src/templates/materials.ts`; existing `src/worker/template-guides/api.ts`, `src/worker/integration.ts`, `src/worker/domain-service.ts`, `src/worker/domain.ts`, `src/shared/model.ts`, `src/templates/index.ts`, `src/templates/themes/reference.ts`, `src/templates/themes/senseng.ts`, `src/client/App.tsx`, `src/client/Editor.tsx`, `src/client/Preview.tsx`; relevant authorization, templates, workflow, source-asset and submission tests.

Existing uncommitted gallery/copy changes overlap domain-service/domain/model/templates/integration/product-radar/tests. Preserve them. Existing draft/gallery validation must remain compatible; new materials fields are additive and are applied only behind the server-issued marker. The older generation output schema currently permits arbitrary HTTPS delivery and describes unbound slots; it must not be used directly as a trusted import package.
