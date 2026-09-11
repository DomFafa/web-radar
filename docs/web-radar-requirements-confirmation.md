# Web Radar requirements confirmation

Status: final option A approved on 2026-09-12. Implement the complete v1 in `docs/web-radar-v1-final-review.md`, including its proposed defaults, across Product Radar and the existing Web Radar task. Historical alternatives are not scope; no infrastructure purchase or USD 20 budget was approved.

## Coordination

- Product Radar repository: `/Users/dom/Desktop/product-radar-release-37f9f62`.
- Web Radar repository: `/Users/dom/Desktop/dom/库/web-radar`.
- Verified Web Radar task: `初始化 Git 仓库`, thread `01a090ca-0362-7852-8f57-786d91491fed`, host `local`.
- On 2026-09-11, the Web Radar repository was initialized on `main` with no commits; its existing task was idle.
- Rechecked on 2026-09-12: the saved project still points to the same Web Radar repository, which remains empty on `main` with no commits. Its existing task's latest completed turn is Git initialization; the app currently reports the task as `notLoaded`. No implementation prompt has been dispatched.
- User requests one question at a time, four concrete options and a fifth custom-answer option. The user could not see the question cards, so keep the current question and all five options in `docs/web-radar-current-question.md`, link that file and request opening it in Codex.
- After requirements are confirmed, this Product Radar task owns its entry point and integration. Delegate the standalone website builder to the existing Web Radar task using `gpt-6-astra` with `xhigh` reasoning (user requested GPT-6 Astra 极高). Do not start implementation before completing confirmation.
- Do not create another task or reinitialize the existing repository.

## Confirmed direction from this conversation

- Web Radar is a standalone website-building product and also integrates with Product Radar.
- Users can select generated products in Product Radar and provide the remaining website/company information there.
- Users can independently sign in to Web Radar and supply product material and the same website/company information.
- The standalone Web Radar product step supports image upload with manual product-information entry and direct selection of the customer's authorized, confirmed Product Radar products. Excel/PDF import is not part of the confirmed first release.
- Maintain one core form and generation service, with standalone and integrated entry modes.
- In Product Radar, selecting products and choosing the website-creation action opens a dedicated in-app website-creation page, prefilled with the selected products and providing the full step-by-step creation flow.
- Imported product data becomes an independent website-draft snapshot. Customers can manually request source updates, preview changes and confirm what to apply; existing website edits and published sites are not overwritten automatically. Both website-creation entries edit the same Web Radar draft.
- The first release permits up to 20 product entries per website, including the main product, counted across uploads and Product Radar imports. This is a product-scope limit, not a measured server-capacity limit.
- Customer-generated websites first have a protected draft preview and are published only after customer confirmation. Initial hosting is Cloudflare using its provider-issued default addresses; defer custom customer domains and downloadable site packages. The platform owner will supply several Cloudflare API tokens, managed server-side by Web Radar.
- Unpublished website previews are accessible only to signed-in users authorized for the project. The first release has no external preview-sharing feature.
- Published customer websites collect inquiries through a form. Save each inquiry in the owning website's backend list and send its full contents to the contact email supplied by the customer who built that website, including the buyer's contact details, relevant product and message.
- During initial testing, the platform owner allocates image and video generation allowances separately for each customer. Customers see their remaining allowances; additional allowance is granted by the platform owner rather than automatically borrowing Product Radar credits.
- After script and storyboard approval, submit the approved storyboard images together to Agnes for one full-length video. Scene content, sequence and pacing follow the specific script/product brief; do not impose four-second scenes or fixed per-image timestamps. Native video concatenation and paid Containers are not first-release dependencies for this chosen flow.
- Keep Web Radar in its own repository and isolate its generation workload from Product Radar. Initially host the Web Radar backend on Cloudflare; when the user's client supplies a separate server, migrate the backend and job processing there. Do not assume the user is buying a new server now. Customer-generated sites remain on Cloudflare under the separately confirmed delivery arrangement.
- The platform owner (the user in this conversation) supplies a new, dedicated image API key for Web Radar. End customers do not configure image APIs. Use the same Image 2.5 model/provider as Product Radar, with separately attributable Web Radar usage and costs.
- Initial access is for existing Product Radar customers. They may use either the Product Radar entry or the standalone Web Radar site; registration for new standalone customers is deferred.
- Use the same customer account in both products. Entering Web Radar from an authenticated Product Radar session should not require another sign-in; direct visits to Web Radar can sign in with the existing account and access the same authorized projects.
- All original templates must have a dynamic video Hero as a core requirement. This supersedes earlier recommendations that a static-image-only Hero could be a normal customer choice. A loading poster or browser/accessibility fallback is distinct from removing the video feature; exact fallback and publishing rules remain to be confirmed.

## Original requested inputs

- Product category, including toys, electronics, outdoor, kitchen and general.
- Sales country and at most two website languages: English plus one other language.
- Required company name, contact email and English contact name; optional Facebook, Instagram and X accounts.
- Uploaded video or selected main product for a generated Hero video; requested duration between 8 and 12 seconds.
- Template selection and company positioning as trader or factory.
- Target scale discussed: 20–50 simultaneous users; this is not yet a measured capacity guarantee.
- Clarify whether the earlier final step “一键生成视频” means generating the whole website with a video; this was stated as an assumption, not explicitly answered.

## Interview

### Q1 — Website type for the first release

Status: confirmed. User selected A: B2B company showcase with company information, catalog, product detail and inquiry; no online payment in the first release.

- A (recommended): B2B company showcase with company information, catalog, product detail and inquiry; no online payment.
- B: single-page marketing site for one main product or series, with inquiry conversion.
- C: retail store with cart, online payment and order management.
- D: selectable inquiry-based or transactional sites in the first release.
- E: custom user-defined scope.

### Q2 — Customer editing capabilities after website generation

Status: confirmed. User selected A: basic content editing within the chosen template, including text, images, video, company/contact information, product ordering and brand colors; layout stays fixed.

- A (recommended): basic content editing within the selected template: text, images, video, company/contact information, product ordering and brand colors; layout stays fixed.
- B: configurable sections: all of A plus reorder, show/hide and select supported prebuilt sections, without arbitrary layout editing.
- C: full visual editor: freely drag elements and adjust layout, spacing, font sizes and page structure.
- D: conversational editing: users request website changes in natural language and review the AI-generated changes before applying them.
- E: custom user-defined editing scope, including combinations if needed.

### Q3 — Initial template sources

Status: confirmed. User selected A: original templates. User additionally required video-based dynamic Hero sections, similar to https://client-review.tinkerwood-client-preview.pages.dev/.

- A (recommended): create original templates for Web Radar, using AI-assisted design and development as appropriate, with consistent fields and behavior.
- B: purchase commercial templates and adapt them, after confirming licenses cover the intended customer-site generation and distribution.
- C: adapt open-source/free templates whose licenses permit the intended commercial use, preserving any required attribution and notices.
- D: combine original templates with selected, appropriately licensed third-party templates.
- E: custom source strategy or specific template sources supplied by the user.

Template count, visual styles and first-release categories will be confirmed separately. No template purchases are authorized by this question alone.

### Reference observation — Tinkerwood

- Inspected the provided live URL in a new Chrome tab on 2026-09-11. The live page title was `Tinkerwood — Curiosity Comes to Life`.
- Observed a viewport-filling product-media background with overlaid branding, heading, descriptive copy and CTA; the video uses `object-fit: cover`.
- The current DOM contains one Hero video sourced from `/media/toy-full-scroll.mp4`, configured with autoplay, loop, inline playback and muted state, plus `/media/toy-poster.webp` as a poster.
- The background inspection remained in media-loading state (`readyState: 0`), so configuration and layout were verified, but successful video playback was not verified in this inspection. Do not turn this reference review into unrelated troubleshooting.
- Screenshot: `/tmp/web-radar-reference-hero-20260911.png` (temporary inspection evidence).
- Historical memory describes older pointer/scroll scrubbing. Do not assume that older behavior is the current deployment or approved Web Radar scope; Q4 resolves desired playback behavior.
- The reference establishes the Hero direction. It does not override the confirmed B2B catalog/company/inquiry scope or require every category to use the same toy visuals and copy.

### Q4 — Hero video playback behavior

Status: confirmed. User selected A: large/full-viewport background video, automatically looping and muted, with readable heading and CTA overlays.

- A (recommended): large/full-viewport background video, automatically looping and muted, with readable heading and CTA overlays; matches the current reference's configured playback mode.
- B: scroll-controlled playback where scrolling forward/backward advances/rewinds the video.
- C: desktop pointer-controlled playback with a mobile scroll-controlled equivalent.
- D: offer both auto-loop and scroll-controlled template modes, selected by the customer during site creation.
- E: custom playback behavior.

This question determines playback interaction only. Video generation method, duration and initial template count remain separate topics.

### Q5 — Number of original templates at first release

Status: confirmed. User selected A: 3 original templates initially, then enrich the template collection after the system is running (user wording: “A，运行起来再丰富”).

- A (recommended): 3 original templates with distinct visual styles, each supporting the confirmed product-category choices through category-appropriate content and media.
- B: 5 original templates with distinct visual styles and the same core website functionality.
- C: 10 original templates for a broader initial selection, with increased design and validation work.
- D: 1 complete original template for the initial release, expanding after real customer use.
- E: custom initial template count or rollout approach.

All options retain the confirmed required muted autoplay-loop video Hero, B2B showcase/inquiry scope and basic editing. Template count does not restrict the number of available product categories. Specific visual styles remain to be confirmed.

### Q6 — Visual direction of the initial three templates

Status: confirmed. User selected A: warm/natural product presentation, modern/technology presentation, and outdoor/exploration presentation. Category suggestions guide selection without restricting which products a template can display.

- A (recommended): warm/natural product presentation, modern/technology presentation, and outdoor/exploration presentation. Category suggestions guide selection without restricting which products a template can display.
- B: professional trading-company presentation, industrial/manufacturing presentation, and premium consumer-brand presentation. Styling does not determine or invent the company's factual trader/factory identity.
- C: light minimalist presentation, dark cinematic presentation, and colorful energetic presentation, differentiated by overall visual tone rather than industry.
- D: use the supplied Tinkerwood website as one visual reference and ask the user for two additional reference sites, then create three original templates inspired by those directions.
- E: custom visual directions or a combination supplied by the user.

All three templates must retain the confirmed video Hero and common B2B functions. This is visual-direction selection, not approval of unseen final template designs.

### Q7 — Script confirmation before AI Hero-video generation

Status: confirmed with an expanded flow. User selected A and explicitly added customer approval of generated storyboard images before video generation.

- A (recommended): generate one recommended script from the selected main product and site style; let the customer review/edit and confirm it before submitting the video-generation task.
- B: generate the script and video automatically, then let the customer preview the finished video; no intermediate script confirmation.
- C: generate three script options, let the customer select and optionally edit one, then generate its video.
- D: require the customer to supply a script or detailed creative instructions; AI may polish them before customer confirmation and video generation.
- E: custom script-confirmation flow.

This question concerns the AI-generated-video path only. Customers supplying an existing video do not need the AI script/storyboard-generation steps.

#### User-confirmed script, storyboard and video flow

1. Generate the recommended script from the main product and site direction.
2. Let the customer review/edit and explicitly confirm the script before generating storyboard images.
3. Generate storyboard images based on the confirmed script and specific product needs. The Q23 clarification supersedes the earlier four-seconds-per-scene and first/4–5/8–9/final-second timing formula. Do not require fixed timestamps in storyboard cards or force equal-length scenes.
   - The previously specified image-count brief remains at least three images for an 8-second clip and four for a 12-second clip; these are approved visual references, not a schedule of evenly spaced frame locks. The Q23 answer changes scene timing and pacing, without explicitly changing those counts or the total-duration choices.
   - Determine each image's content, scene order and narrative purpose from the script. Respect the selected provider's reference-image limit.
4. Let the customer explicitly confirm the storyboard scene images before submitting any video-generation task.
5. Submit all approved storyboard images in a single full-length Agnes reference-mode generation task, then make the resulting clip available for preview and Hero use.

The customer approval gates are required; do not start video generation immediately after script confirmation. Assess the result against the approved story, product fidelity and creative requirements rather than exact per-image seconds. Durations other than the explicitly described 8 and 12 seconds have not been specified further.

#### Initial video provider and queue

- User chose Agnes API (https://agnes-ai.com/) for transitional testing because free video models are available and reported concurrency is 1.
- Initial design should enforce one active video-generation job across all customers sharing that provider account. Waiting customers can still use forms, browse templates and review drafts. This is not a limit of one signed-in customer.
- The exact scope of the provider limit is user-reported, not verified against the user's account. Verify account restrictions during integration. A model parameter `n: 1` is not evidence of an account concurrency limit.
- Implementation recommendation: use one shared persistent video queue, retain upstream task IDs, and hold its slot until the upstream video task reaches a terminal state. Polling/restarts must not silently resubmit already accepted work.
- Never automatically switch to a paid video model when a free quota or offer ends. Confirm the video cost policy separately. The storyboard image provider is resolved in Q9; the script provider remains separate.

#### Provider documentation checked on 2026-09-11

- Official video documentation: https://agnes-ai.com/zh-Hans/docs/agnes-video-25-flash.
- `agnes-video-2.5-flash` currently advertises a limited-time zero price, supports 4–12 seconds and `720P`, and uses asynchronous video tasks. No real generation or account-level entitlement was tested.
- `keyframe` mode accepts first/last image URLs. `reference` mode accepts up to five images, but the documented request has no per-image timestamp parameter. These are separate modes; do not combine their mutually exclusive inputs.
- Correction after the user asked whether Agnes can directly generate 8/12 seconds: it can. Freshly re-read the official Flash page on 2026-09-11 and verified that `seconds` accepts strings from `4` through `12`, including `8` and `12`. A single asynchronous job can generate the full requested clip; the API does not require splitting it into four-second jobs.
- Confirmed in Q23 on 2026-09-12: after script/storyboard approval, submit the approved storyboard images together in `mode: reference` and let the script guide the scene sequence and pacing. The user explicitly rejected fixed seconds in favor of the concrete script and needs. Reference-image inputs have no per-image timestamp field; do not claim exact frame reproduction.
- The earlier four-second generation plus concatenation proposal is superseded and outside the selected first-release flow. Do not add FFmpeg, a stitching job or paid Containers because of that proposal. A future need for native processing requires evidence and separately agreed scope.
- All approaches preserve customer approval of the script and complete storyboard before any video submission and retain the shared upstream concurrency of one. Validate duration, product identity, scene progression and loop suitability in real output; no real Agnes generation was performed during this documentation check.
- Historical image-provider research: https://agnes-ai.com/zh-Hans/docs/agnes-image-25-flash documents text/image-to-image generation with multiple image references. Agnes image generation was considered but was not selected; Q9 now confirms the same Image 2.5 provider/model as Product Radar instead.
- Free 720P video is suitable for an initial integration test; full-screen Hero quality still requires visual review. Do not promise permanent free service, production throughput or an unverified higher resolution.

### Q8 — Revising storyboard images before video generation

Status: confirmed. User selected A: revise or regenerate an individual storyboard image with a short change instruction, preserve the other images, and require confirmation of the complete current storyboard before video generation.

- A (recommended): revise or regenerate individual storyboard images with a short change instruction, preserving the other images; require customer confirmation of the complete current storyboard before video generation.
- B: regenerate the complete storyboard from the revised script whenever an image is unsatisfactory; no individual-image regeneration in the first release.
- C: generate two candidates at each storyboard position, let the customer choose one per position, then confirm the complete storyboard; more initial image-generation work.
- D: allow individual storyboard images to be replaced with customer-uploaded images; AI produces the initial storyboard but does not support targeted regeneration in the first release.
- E: custom revision workflow, including a combination of capabilities if needed.

This question concerns customer-facing revision controls, not the choice of image provider. Any approval must correspond to the current script and images; changes to video inputs must not reuse an outdated approval.

### Q9 — Initial storyboard image-generation service

Status: confirmed by explicit correction. The earlier D answer was based on the user understanding “customer” to mean themselves as platform owner. The platform owner will supply a newly created, dedicated image API key for Web Radar, using the same Image 2.5 provider/model as Product Radar, with separate usage/cost accounting. End customers do not supply API keys or select/configure providers. This explicit correction supersedes the original D wording and the customer-supplied API interpretation.

The following options are retained only as interview history; the corrected requirement above is authoritative.

- A (recommended for initial testing): use Agnes for storyboard image generation as well as the already selected video generation; provision the integration in Web Radar and validate image quality with approved product references.
- B: use the same image provider/model configured for Product Radar, called directly by Web Radar with its own configuration, subject to provider access and quota verification. This does not route image-generation work through the Product Radar application server.
- C: integrate Agnes and the Product Radar image provider, with an administrator selecting the active storyboard service. No automatic provider switch or paid fallback is implied.
- D: require each customer to configure their own supported image-provider API access; adds customer setup and credential-management work.
- E: custom service/model or selection policy supplied by the user.

Retain the confirmed product-reference inputs, single-image revisions and customer storyboard approval. The video concurrency limit does not establish the image API limit; verify image quotas separately. Do not request API secrets in chat.

- Live repository check on 2026-09-11: `src/shared/product-image-models.ts` sets `DEFAULT_PRODUCT_CREATION_IMAGE_MODEL` to `gpt-image-2.5-sunburst`. `src/image-worker/index.ts` routes this model to `https://api.openai.com` using server-side credentials. This is repository evidence, not a new live generation or account-entitlement check.
- Web Radar calls this provider using its own server-side configuration and the new key supplied by the platform owner. Do not reuse Product Radar's existing key or its fallback credentials, or send generation work through Product Radar's server.
- Store the new platform key as a server-side secret, excluding it from browser responses, generated sites and logs. Do not build end-customer API-settings, key-onboarding or provider-selection screens.
- Record Web Radar usage and costs separately. Creating a new key is the user's intended separation mechanism; verify provider project/account billing and quota boundaries during setup rather than assume that a new key alone creates a separate bill or rate-limit pool.
- This decision applies to storyboard image generation. The already confirmed Agnes video arrangement remains in effect; script generation is a separate decision.

### Q10 — Withdrawn after clarification of the image-key owner

Status: withdrawn. This question incorrectly assumed end customers would bring their own image API credentials. The user's correction directly resolves the provider and key owner in Q9. No further answer is needed; no customer-supplied API functionality is approved.

### Q11 — Initial access scope

Status: confirmed. User selected B: make the first release available to existing Product Radar customers through both entry modes; do not open standalone registration to new customers yet.

- A (recommended): invite-only external testing; the platform owner invites customers who can use the standalone site or the Product Radar entry after access is granted.
- B: make the first release available to existing Product Radar customers; hold standalone registration for new customers until a later release. Existing authorized customers can still use the standalone site.
- C: internal testing only for the platform owner and their team, followed by a later customer rollout.
- D: public registration; anyone can create an account and use the generation flow, subject to quotas and charging rules to be confirmed separately.
- E: custom eligible-user scope or rollout sequence.

This question concerns who can use the first release. It does not decide identity-provider implementation, account linking, generation allowances or charging. All options retain the platform-owned image key and required standalone/integrated entry capabilities; opening registration to additional users can be phased separately.

### Q12 — Login experience across Product Radar and Web Radar

Status: confirmed. User selected A: use the same account in both systems, provide entry from authenticated Product Radar without a repeated sign-in, and allow direct Web Radar visits to sign in with the existing account. Preserve the verified identity/workspace and authorized projects across both entry modes.

- A (recommended): use the existing Product Radar account in both products. An authenticated Product Radar entry should open Web Radar without another sign-in; users visiting Web Radar directly can sign in with the same account. Preserve the verified customer/workspace identity across entries.
- B: use the same account credentials in both products, but require a separate sign-in session on each site in the first release; defer seamless cross-site sign-in.
- C: use a separate Web Radar password/account, explicitly linked to the existing Product Radar account after proving access to both. No new-customer public registration is implied.
- D: use passwordless email-code/link sign-in on Web Radar for eligible existing Product Radar customers; associate it with the verified existing identity, while keeping Product Radar's current sign-in experience.
- E: custom login and linking experience.

Repository context checked on 2026-09-11: `src/worker/routes/auth.ts` implements email/password sign-in via Supabase; `src/worker/auth.ts` separately resolves Product Radar user/workspace eligibility. This supports evaluating a shared identity, but does not prove cross-site sign-in exists. Authentication alone must not bypass customer/workspace eligibility. No current authentication code or account settings were changed during this interview.

All choices preserve both website-creation entries and access to the same authorized Web Radar projects for the linked identity/workspace. The eventual integration must not expose long-lived credentials in navigation URLs or merge accounts solely because unverified email strings match. These are implementation constraints, not additional customer-facing steps.

### Q13 — Presentation of the integrated website-creation form

Status: confirmed. User selected A: after selecting products, open a dedicated website-creation page within Product Radar, prefill the selected products, and provide the complete step-by-step form and draft preview.

- A (recommended): selecting products and choosing the website-creation action opens a dedicated website-creation page within Product Radar, with the full step-by-step form and draft preview.
- B: open the same complete creation flow in a full-screen modal over the Product Radar product list.
- C: open the same complete creation flow in a large side panel, keeping part of the Product Radar product list visible.
- D: offer a choice between continuing on the dedicated Product Radar page and opening the same draft in a new Web Radar tab, with the confirmed seamless account handoff.
- E: custom entry/form presentation supplied by the user.

All options retain the standalone Web Radar form, prefilled selected-product data, and one core form/generation service. This question chooses the visible integrated experience, not an iframe, package distribution mechanism or other technical implementation. Generation workload remains owned by Web Radar regardless of which site displays the form. A new tab is only opened following a customer action.

### Q14 — Updating website product data after the Product Radar source changes

Status: confirmed. User selected A: import an independent product snapshot; allow a customer-requested refresh from Product Radar with review and confirmation of the updates applied to the draft. Preserve website-specific edits unless their replacement is explicitly chosen; do not automatically update a published site.

- A (recommended): import an independent product snapshot into the website draft; subsequently let the customer request a refresh from Product Radar, review the proposed changes and confirm which updates to apply to the draft. Do not overwrite website-specific edits silently or update a published site automatically.
- B: import once and manage website product content independently thereafter. No source-refresh feature in the first release; customers edit the website copy directly in either website-creation entry.
- C: automatically refresh unchanged source-derived fields in the website draft when the Product Radar source changes; surface conflicts with website-specific edits for customer resolution. Do not automatically update a published site.
- D: allow each website project to choose the manual-refresh behavior in A or the automatic-draft-refresh behavior in C; adds configuration and validation work in the first release.
- E: custom product-update behavior supplied by the user.

This question concerns changes to the source products in Product Radar, not edits to a Web Radar draft displayed inside Product Radar. Both website-creation entries always edit the same authorized Web Radar draft. Website-specific edits do not write back to the Product Radar product library under any of these options. Source refresh does not automatically submit paid image/video generation or bypass script/storyboard approval. Exact publishing behavior is a separate topic.

### Q15 — Adding products through the standalone Web Radar entry

Status: confirmed. User selected A: standalone Web Radar supports image upload and manual product-information entry, plus direct selection/import of the customer's authorized, confirmed Product Radar products into website drafts.

- A (recommended): allow image upload and manual product-information entry, plus a picker for the customer's authorized, confirmed Product Radar products directly within Web Radar. Both paths create website-draft products.
- B: allow image upload and manual entry in standalone Web Radar only; importing Product Radar products starts from the existing Product Radar entry. Previously imported website drafts remain accessible through either entry.
- C: provide everything in A plus batch product import using a supplied Excel template; validate the spreadsheet fields and image references before adding products to the draft.
- D: provide everything in A plus AI extraction of product images and information from uploaded PDF catalogs, followed by customer review and correction before import. Extraction quality and incomplete information require separate validation.
- E: custom standalone product-input methods supplied by the user.

All choices preserve the required standalone company/website form and the existing Product Radar handoff. Product Radar imports retain the confirmed snapshot/manual-refresh behavior. Manual uploads remain website-owned data and are not written into Product Radar's product library. Do not invent product specifications, certifications or company facts to fill missing data; customers supply or verify those facts.

### Q16 — First-release product count per website

Status: confirmed. User selected A: allow up to 20 product entries per website, including the main product and counting uploads and Product Radar imports together.

- A (recommended): up to 20 product entries per website, including the selected main product.
- B: up to 50 product entries per website.
- C: up to 100 product entries per website.
- D: up to 10 product entries per website for a smaller initial catalog.
- E: custom maximum or product-count policy supplied by the user.

This is a proposed first-release product limit, not a verified infrastructure capacity limit. It counts product entries across manual uploads and Product Radar imports in the same website; it is not the number of source images, active users, website projects or video tasks. Hero generation uses the selected main product and approved script/storyboard, not an automatic video for every listed product. A limit must be clearly shown and enforced without silently dropping selected products or modifying source-library data.

### Q17 — First-release website publishing and delivery

Status: confirmed with hosting details. User selected A and stated that they will provide several Cloudflare API tokens; customer-generated websites should initially deploy to Cloudflare and use Cloudflare's default free addresses. Retain protected preview followed by explicit customer publication, with custom domains and downloadable site packages deferred.

- A (recommended): provide a protected draft preview; after customer confirmation, publish to a platform-provided subdomain. Defer customer-owned custom domains and downloadable site packages.
- B: provide everything in A plus binding a customer-owned custom domain in the first release. Domain ownership, connection and certificate readiness must be verified before declaring that address live.
- C: provide protected previews only during the initial test release; defer public publishing and downloadable site packages.
- D: provide a protected preview and a downloadable website package for the customer to deploy themselves; defer platform-managed public publishing. Export scope and any server-dependent inquiry features must be specified if selected.
- E: custom publishing/delivery scope supplied by the user.

This question concerns customer-generated websites, not the deployment or domain of the Web Radar builder itself. Restrictions on who can create websites do not automatically restrict visitors to a published customer website. A draft preview must have actual access control rather than rely on an unlisted URL or noindex. Choosing a future publication workflow does not authorize publishing any current client site during this interview. Preview sharing, publication versions and infrastructure are separate topics where unresolved.

#### Cloudflare deployment details and evidence

- The platform owner supplies the Cloudflare credentials. End customers do not need Cloudflare accounts or token-configuration screens. Store tokens as server-side secrets, excluded from logs, browser payloads and generated-site files. Token values have not been requested or accessed during this interview.
- Maintain each website's Cloudflare account/project association and use that same target for future updates. Token rotation within an account should not change the site's public address. Do not automatically migrate or recreate an existing site under a different account after a transient failure.
- Multiple tokens may target one or several accounts; their account IDs, permissions and resource scopes remain to be verified when supplied. Track hosting resources by account/project rather than count tokens as independent capacity. This does not require another customer-facing setup step.
- Initial implementation recommendation: prebuild customer sites and use Cloudflare Pages Direct Upload, with a stable project address in the form `<project>.pages.dev`. Exact project names are assigned and checked during setup; no domain has been reserved. This is a proposed technical choice within the user-confirmed Cloudflare hosting scope.
- Verified official documentation on 2026-09-11: https://developers.cloudflare.com/pages/get-started/direct-upload/ supports deploying prebuilt assets and documents the project and branch addresses.
- https://developers.cloudflare.com/pages/configuration/preview-deployments/ states that preview URLs are public by default. Its preview Access setting protects preview deployments, not the production project address by default. Protect drafts and their assets/aliases before exposure; only approved releases should be publicly reachable. A successful preview deployment is not publication approval.
- https://developers.cloudflare.com/pages/platform/limits/ currently documents 100 Pages projects per account and a 25 MiB per-file limit. Check the actual account's existing usage and validate/compress Hero media before deployment. If the chosen media cannot fit, resolve storage/delivery within the final infrastructure plan instead of silently omitting the video. Do not equate 20–50 online builders with 20–50 concurrent deploys or an unlimited number of sites.
- https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ describes permission and resource scopes. Verify the needed operations on the actual account, including preview protection if using Cloudflare Access. Merely having a token does not prove that all deployment or Access operations are authorized.
- Cloudflare-provided default addresses avoid buying customer domains for the first release; they do not establish that all compute, storage or media services are free. Service choices and budget remain part of the final infrastructure plan. Hosting the Web Radar builder and generation workers remains separate from customer-site hosting.

### Q18 — Access to unpublished website previews

Status: confirmed. User selected A: only signed-in users authorized for a website project may view its unpublished preview. Do not add external preview-sharing links, passwords or email invitations in the first release.

- A (recommended): only signed-in users authorized for the website project can view its draft preview; no external preview-sharing feature in the first release.
- B: retain authorized signed-in viewing and add password-protected, expiring preview-share links for external reviewers.
- C: retain authorized signed-in viewing and allow the customer to invite named email addresses whose owners verify access before viewing the preview.
- D: retain authorized signed-in viewing and add expiring, revocable preview-share links that grant viewing to their holders without sign-in or an additional password. Make the forwarding behavior clear to the customer.
- E: custom preview-access and sharing rules supplied by the user.

External sharing in B–D grants preview-only access, not editing, publication or generation rights. D requires actual server-validated scoped capability tokens and asset protection, not simply an obscure public Pages URL. The selected access rule must cover underlying preview pages/assets and deployment aliases. Sharing a preview never publishes the site automatically.

### Q19 — Delivery of inquiries from published customer websites

Status: confirmed with email-content clarification. User selected A and emphasized that inquiries must also be sent to the customer's email. Store the inquiry in the website's backend list and send the full inquiry details to that website customer's configured contact email, rather than send only a generic notification directing them to log in.

- A (recommended): visitors submit an inquiry form; save the inquiry under the authorized Web Radar website project and notify the contact email configured by that website's customer. Provide a basic inquiry list, not a full sales CRM.
- B: visitors submit an inquiry form delivered to the customer's configured contact email; no customer-facing inquiry-history list in the first release. Specify delivery/failure handling if chosen.
- C: display the customer's contact email with a mailto action; visitors use their own email client. No hosted inquiry form or inquiry-history list in the first release.
- D: visitors submit an inquiry form saved to the website's inquiry list; the customer checks it after login, without automatic email notifications in the first release.
- E: custom inquiry collection/delivery workflow supplied by the user.

The recipient is the customer who builds the website, using their configured contact email, not the Web Radar platform owner by default. Inquiry records must remain scoped to the owning website/workspace. For A, distinguish a successfully saved inquiry from notification delivery: email failure must not lose the record or falsely report that notification was delivered. Email-provider setup and practical spam controls are implementation/setup topics; this question does not authorize sending real test messages during the interview.

The inquiry email should contain the submitted buyer/contact name, reply email and any other supplied contact information, the source website and relevant product, and the complete inquiry message. Preserve the original submitted facts. Use a verified platform sending identity and the buyer's valid reply address for replies; do not impersonate the buyer as the authenticated sender. Track delivery attempts separately from the inquiry record and avoid duplicate records or notifications when submission is retried. The specific email provider and sender-domain configuration remain deployment setup items.

### Q20 — Image/video generation allowances during initial testing

Status: confirmed. User selected A: the platform owner sets separate image and video allowances for each customer, customers can see what remains, and the owner decides whether to add allowance after exhaustion. No specific initial quantities or paid-pricing rules were selected.

- A (recommended): the platform owner assigns image and video allowances separately for each customer; the customer sees the remaining allowance and can request an increase when exhausted.
- B: all eligible customers receive the same fixed image and video allowances for the test phase, configured centrally; individual overrides are not part of the first release.
- C: customers share platform-wide daily image and video allowances on a first-come basis; stop accepting additional generation work when the respective daily allowance is exhausted, without assigning individual shares.
- D: impose no application-level per-customer generation-count allowance during testing; record usage and costs, while still enforcing upstream limits and the confirmed video queue.
- E: custom generation-allowance rules supplied by the user.

This question chooses the allowance policy, not paid pricing or online payments. Exact initial quantities and counting/reservation rules remain to be specified before implementation; do not infer arbitrary values from an A answer. Existing Product Radar credit balances are not authorization to deduct Web Radar usage from those balances. Distinguish customer-visible generation allowances from provider requests and actual costs, including manual regenerations/retries and segmented jobs only if that optional path is selected. Allowance exhaustion must not silently discard drafts or start a paid fallback.

### Q21 — Hosting the Web Radar backend and generation workers

Status: confirmed with a phased-deployment correction. User selected A for eventual independent-server hosting but explicitly requires Cloudflare hosting first, followed by migration when their client supplies the server. This overrides the suggestion to purchase/provision a new server immediately. Customer-site Cloudflare hosting remains unchanged; this answer concerns the backend and generation workers from Q21.

The following options are retained as interview history; the phased correction above is authoritative.

- A (recommended): provision a new server dedicated to Web Radar's backend and background jobs. Server provider, region, configuration and budget are setup decisions to resolve after choosing this direction.
- B: use an existing server supplied by the platform owner that is separate from Product Radar. Inspect its available resources and current workloads before deployment.
- C: use a managed application/container hosting service for the backend and media-processing jobs; select the actual service and resource limits within the agreed budget.
- D: first implement and verify locally, leaving online backend hosting until after the local flow is accepted. Public, multi-user end-to-end acceptance remains deferred until an online backend exists.
- E: custom hosting arrangement or already chosen environment supplied by the user.

All choices retain the confirmed Cloudflare hosting/default addresses for published customer websites and isolate Web Radar generation workload from Product Radar. Image/video model inference is performed by the selected external APIs; Web Radar orchestrates calls, persists their results and renders/deploys sites. The direct-generation flow confirmed in Q23 does not require native video concatenation. Do not infer that a new GPU server is required or that each template/customer site needs a separate running application process. This question does not authorize purchasing infrastructure or deploying to an uninspected existing server. Backend/database/media-storage details and capacity verification belong to the final design.

#### Cloudflare-first deployment and later migration

- Preserve the complete script-confirmation, storyboard-confirmation and video-generation flow in the Cloudflare stage. Do not silently require the platform owner's laptop to remain online for background processing or deployment tasks.
- Superseded recommendation: a portable native media container was proposed on the assumption that every video needed segment concatenation. The user correctly questioned that premise. Direct 8/12-second Agnes generation removes that stitching dependency; no Containers purchase or architecture choice is approved. Keep deployment-specific entry points small, reuse template/content/job logic and document migration of the backend/data to the future server. Add native processing only when a remaining requirement and output validation justify it.
- Keep durable project data, inquiries, allowances, assets, deployment associations and accepted upstream job IDs in persistent storage rather than transient worker memory or temporary disk. Define backup/export and restore procedures using the selected storage system. Preserve website URLs, customer identity mappings and in-progress job state during a planned cutover; test restart and migration without duplicate upstream submissions or lost records.
- Actual server architecture/resources, credentials and network access are not yet supplied. Later inspect them before choosing the target image/platform and performing migration. This is preparation for a future handoff, not a promise that the future server supports an untested artifact unchanged.
- Official docs checked on 2026-09-11: https://developers.cloudflare.com/containers/ documents full runtime/Linux-environment support and availability on Workers Paid. https://developers.cloudflare.com/workers/runtime-apis/nodejs/ lists `node:child_process` as a non-functional stub in ordinary Workers; a Node compatibility flag is not evidence that a native FFmpeg subprocess will work there.
- https://developers.cloudflare.com/containers/platform/pricing/ and https://developers.cloudflare.com/workers/platform/pricing/ currently document a USD 5/month Workers Paid base plan with included container usage and metered excess. This is not a complete estimate for the app, media storage, email or external image/video APIs. The platform account's current plan and entitlements have not been inspected.
- Container capability/pricing notes above are conditional research, not evidence that this application needs Containers. The earlier Q22 budget question is deferred after the direct-generation correction. Re-estimate only the services actually required by the selected flow. Removing stitching does not establish that every other Cloudflare service will be free. No plan upgrade, purchase or deployment was performed.

### Q22 — Monthly Cloudflare budget during the interim phase

Status: deferred, unanswered. The user questioned the need for video concatenation instead of selecting a budget and has now confirmed direct generation in Q23. The earlier budget recommendation relied on an unnecessary default stitching/container assumption. Revisit only the actual runtime/storage needs in the final design; no USD 20/month budget or paid plan is approved.

The original options below are retained as interview history, not as the current question or an approved budget.

- A (recommended starting planning target): USD 20/month for Web Radar-attributable Cloudflare infrastructure, including any required base plan and metered use; finalize a workload-based estimate and controls within that target before enabling paid resources.
- B: USD 10/month planning target, with tighter test-use constraints and verification that the proposed resource mix fits.
- C: USD 50/month planning target, retaining metered usage and controls rather than treating the full amount as mandatory spending.
- D: no Cloudflare paid services during the interim phase. Investigate free approaches; if complete automated media processing cannot be verified within free limits, defer that part until the client server is available, without claiming full video-flow acceptance.
- E: custom budget or already agreed billing constraint supplied by the user.

These are budget preferences, not guarantees of total cost or provider-enforced hard caps, and not permission to start an unreviewed subscription. Track and limit new work to stay within the agreed target; describe any metering delays/residual spend in the final plan. External Image 2.5, Agnes and email-provider charges are outside this Cloudflare-only budget. Selecting a free address in Q17 did not decide this backend budget.

### Q23 — Direct full-length video generation and storyboard control

Status: confirmed with explicit creative-direction clarification on 2026-09-12. User selected A and said not to fix seconds: use storyboard images according to the specific script and requirements. Submit the approved images in one full-length reference-mode request; scene order and pacing are script-driven. Do not enforce the earlier four-second scene formula or exact image timestamps.

- A (recommended): submit all three/four approved storyboard images as references in one 8/12-second Agnes generation task. Guide the scene order and approximate timing through the script/prompt, and review the output without promising exact timestamp locks.
- B: submit the approved first/last images in one 8/12-second keyframe-mode task to emphasize endpoints; the intermediate storyboard images remain reviewed planning references but are not image inputs to that request. Intermediate scenes are guided through the text prompt.
- C: choose the earlier four-second adjacent-frame generation and concatenation approach for stronger segment-boundary control, accepting the extra jobs and processing dependency. This still does not guarantee pixel-exact reproduction of image inputs.
- D: first compare direct multi-reference generation with the segmented approach on a representative approved storyboard using the configured provider account, then choose based on visual acceptance. This is a future targeted experiment once authorized inputs/access are available, not a claim that it has been run.
- E: custom control requirements or acceptance criteria supplied by the user.

All choices retain the two customer approval gates, the requested storyboard image counts and the global upstream concurrency of one. Changing the control method requires clear customer expectations; do not present reference images as timestamp-locked keyframes when the selected API does not provide that control.

### Q24 — Supported second languages for generated websites

Status: confirmed A on 2026-09-12. Generated websites use English, optionally paired with one of German, French, Spanish, Portuguese or Italian. English-only remains available; each website has at most two languages.

- A (recommended initial set): English, optionally paired with one of German, French, Spanish, Portuguese or Italian.
- B: the choices in A plus Japanese and Korean as optional second languages.
- C: the choices in B plus Russian and Arabic; Arabic requires validation of right-to-left page layout and form behavior.
- D: English only for the initial release, explicitly deferring the optional second-language capability.
- E: custom supported-language list supplied by the user.

This selects the generated customer website's languages, not the builder interface language. Except for the reduced-scope D option, retain the original maximum of two languages: English plus at most one selected second language. Translate page content, navigation, buttons and inquiry-form labels consistently; preserve factual values, email addresses and product identifiers. Language availability does not guarantee translation quality. Prefer sharing the approved visual Hero video while localizing overlaid page text, without automatically generating another video for each language.

### Q25 — Charging for Web Radar in the initial release

Status: confirmed A on 2026-09-12. Existing eligible Product Radar customers are not charged an additional Web Radar fee during initial testing. The platform owner manually grants and adjusts separate image/video allowances. No online payments or subscription billing in the first release; existing Product Radar prices and balances remain unchanged.

- A (recommended for initial testing): no additional Web Radar charge for existing eligible Product Radar customers during testing. The platform owner grants and adjusts image/video allowances; no online payment integration.
- B: the platform owner charges website-building service fees offline and manually grants allowances after payment. No online payment integration or exact price schedule is required for the first release.
- C: customers purchase or top up image/video allowances through online payment in Web Radar. This adds payment processing and automatic entitlement handling to the first release.
- D: customers subscribe to monthly Web Radar plans with included generation allowances. This adds subscription billing, renewal and allowance-reset rules to the first release.
- E: custom charging model supplied by the user.

This concerns fees charged by the platform owner for Web Radar, not retail checkout on generated B2B websites. All options preserve the owner's ability to allocate and adjust allowances. Do not change existing Product Radar prices, balances or entitlements automatically. A does not mean upstream image/video generation or infrastructure is free, and it does not promise permanent free access.

### Q26 — Counting generation allowances, failures and regenerations

Status: confirmed A on 2026-09-12. Reserve allowance at generation start, settle once the completed output is saved and deliverable, and release it on confirmed technical failure. Customer-requested regeneration after a delivered result counts again. One generated image uses one image allowance; one complete 8- or 12-second video uses one video allowance. Uploads, reuse/viewing of existing outputs and script editing do not consume image/video allowances. Initial quantities are set by the platform owner.

- A (recommended): reserve allowance when a generation job starts; deduct when its completed output has been saved and can be delivered to the customer. A confirmed technical failure releases the reservation. A customer-requested new generation after a delivered result consumes a new allowance, even if the earlier result was not selected for the website.
- B: deduct only when the customer explicitly accepts a generated image or video. Failed or rejected outputs do not consume customer allowance; repeated rejected generations can still incur platform costs and need separate abuse controls.
- C: deduct when the upstream provider accepts a new generation request, even if generation subsequently fails. Validation failures and requests confirmed not accepted upstream do not consume allowance. Explain this clearly before submission.
- D: use successful-output counting for images, but accepted-upstream-request counting for videos. This treats the two generation types differently and requires clear customer-facing explanations.
- E: custom allowance-counting rules supplied by the user.

Confirmed units: one generated image consumes one image allowance; one complete generated video consumes one video allowance, whether the selected length is 8 or 12 seconds. A batch of three successfully delivered storyboard images therefore consumes three image allowances under A. Uploaded media, viewing/downloading existing outputs and script editing do not consume image/video allowances. Initial quantities remain owner-configured, not arbitrary preset grants or an inferred periodic reset.

Customer allowances are distinct from provider charges. Under A, technical failures can still cost the platform money; rejecting an aesthetically unsatisfactory but technically complete output does not automatically restore allowance. Retrying delivery/polling, duplicate callbacks and reconnecting to the same job must not deduct again. A timeout or unknown upstream outcome is not a confirmed failure: reconcile the stored job before releasing a reservation or submitting a replacement. Automatic technical retries for the same logical job under A cannot consume multiple customer allowances, and do not authorize unbounded upstream retries. Record quota reservations and settlements durably and atomically to prevent concurrent overspending. The selected counting rules do not authorize paid API calls during the interview.

### Q27 — Website-project ownership and access within a customer company

Status: confirmed A on 2026-09-12. The creator and administrators of the owning company's verified Product Radar workspace can manage the website project and its inquiries. Other ordinary workspace members cannot access that project's private drafts, assets or inquiries, edit it, generate media for it or publish it. Preserve the platform owner's authorized administration scope separately.

- A (recommended): the creator manages their own website projects; their company's existing Product Radar workspace administrators can also view/manage those projects and inquiries. Other ordinary members of that workspace cannot view the drafts or inquiry records, edit, generate media for, or publish those projects.
- B: all authorized members of the same company workspace can view/manage its website projects, generate media, publish and view inquiries.
- C: all authorized members of the same company workspace can view/edit website drafts, generate media and view inquiries, but only its workspace administrators can publish changes or take a site offline.
- D: only company workspace administrators can create/manage website projects and view inquiries in the first release; ordinary company members do not receive the building feature initially.
- E: custom project ownership, visibility or action permissions supplied by the user.

Company administrators here mean administrators of the customer's existing Product Radar workspace, not the platform owner. Preserve the platform owner's existing authorized administration scope separately. A company is determined by verified workspace membership, never by the free-text company name entered in the website form. This decision concerns access to private builder data and actions; public published pages remain viewable by visitors. Apply the same authorization through both entry points and backend/media endpoints. It does not add public registration, external invitations, configurable per-project role systems or a shared allowance pool.

Repository evidence checked on 2026-09-12: `src/worker/auth.ts` resolves user/workspace identity and `src/shared/accounts.ts` defines admin/member roles. Existing search-history routes distinguish creator scope from workspace-admin scope. These patterns inform A but are not evidence of implemented Web Radar project access. No existing Product Radar permissions were changed.

### Q28 — Updating, restoring and taking a published website offline

Status: confirmed A on 2026-09-12. Edits remain in a private draft until explicitly published to the existing website address. Offer restoration of the immediately preceding successful published version and temporary offline status while retaining project data. Failed publication keeps the previous live version available. No permanent project deletion in the first release.

- A (recommended): edits are saved to a private draft and take effect publicly only after explicit publication. Offer restoration of the immediately preceding successful published version, plus taking the website offline while keeping its project data for later republication.
- B: the same draft/publication and offline behavior as A, with a customer-facing history of the five most recent successful published versions and selection of a version to restore.
- C: the same draft/publication and offline behavior as A, without a version-restore feature in the first release. Customers correct content in the draft and publish again.
- D: customers edit and preview drafts, then request that the platform owner publish updates, restore the prior version or take the site offline. This adds a platform-owner release gate and changes the earlier customer self-publication arrangement.
- E: custom publication, restoration or offline behavior supplied by the user.

Under A, publishing an update retains the site's existing public address. Draft edits do not replace the live website until the new release succeeds. A failed publication leaves the previous successful version live. Restoring a version is an explicit publication action using its saved content and referenced assets; it must not automatically regenerate images/video, consume generation allowances or silently erase the current draft. Keep the draft separate from the restored live release and clearly show their difference. Version restoration never reverts account permissions, generation-allowance ledgers or inquiry records.

Taking a website offline is distinct from permanently deleting the project: show an unavailable state at its public address, stop accepting new inquiries for that site, and preserve its draft, media, release data and existing inquiries for authorized users. Reopening requires explicit publication. The implementation plan must cover platform-managed deployment aliases as well as the main address; do not describe this as erasing copies already obtained by visitors. Permanent project/data deletion is not part of the first release. Confirmation selects this product behavior; it is not a request to publish or take down an existing site now.

### Q29 — Which entity owns the assigned generation allowance

Status: confirmed A on 2026-09-12. Assign separate image/video allowances to each customer login account. A newly initiated generation uses the initiating account's allowance across both entry points and authorized projects. An administrator manually starting generation for another creator's project uses the administrator's own allowance. Resuming/polling/recovering the same job retains its original allowance owner.

- A (recommended for the initial release): separate image/video allowances per customer login account, shared by that account's activity across its authorized projects and both entry points. Charge the account that explicitly starts the generation; when an administrator starts generation for another creator's project, use that administrator's own allowance. Merely approving, viewing, editing text or publishing consumes no generation allowance.
- B: separate image/video allowance pools per verified company workspace. All authorized creators and administrators generating for that company's projects consume the company's pool, with individual actors recorded.
- C: company workspace pools as in B, with additional per-member generation caps set by the platform owner. This adds two levels of allowance checks and administration.
- D: separate image/video allowances per website project. Authorized people generating for a project consume its assigned pool; allowances are not automatically transferred between projects.
- E: custom allocation and charging ownership supplied by the user.

All options retain platform-owner allocation, separate image/video units, successful-result settlement, technical-failure release, and no automatic deduction from Product Radar balances. Resolve the allowance owner on the server and bind it to the job at reservation time, so later polling or a different person reviewing the result cannot change who pays. Automatic continuation/technical recovery of the same job keeps that original allocation and is not a new administrator-started generation. Neither cross-project access nor the platform-admin role implies unlimited quota or borrowing someone else's allowance. Workspace identity must come from verified membership rather than a free-text company name.

## Remaining interview topics

All individual business questions are now resolved, including allowance ownership (Q29). The consolidated scope and proposed implementation defaults are in `docs/web-radar-v1-final-review.md`; `docs/web-radar-current-question.md` contains the final confirmation choices. Reopen an individual question only if the user's review introduces a material new ambiguity. Missing provider credentials, entitlements and an actual infrastructure cost baseline remain setup dependencies, not verified live capabilities.

- Carry the Q1 company/catalog/product-detail/inquiry scope into the page plan; do not ask again whether the site is single-page, retail or B2B. Existing required company fields, trader/factory positioning, basic branding edits, language choices and the product limit already define the initial form scope.
- State conservative content defaults in the final review: optional supplied brand assets, customer-reviewed copy derived from provided facts, and no fabricated certifications, manufacturing capacity or company history. Do not add a brand-library subsystem or extra mandatory company fields without a need.
- Carry the confirmed script/storyboard approvals into output acceptance. The final review should make explicit that the customer previews and accepts a usable Hero video before public publication; browser/loading accessibility fallbacks do not remove the video requirement.
- Preserve Q27 project access and Q28 publication recovery/offline behavior without reopening them.
- Resolve routine technical choices through repository/provider evidence: script/text-generation configuration, transactional-email sender/provider setup, practical spam handling, persistent jobs/assets/data, and the actual Cloudflare runtime/storage estimate. Missing secrets or account entitlements must be listed as setup dependencies, not invented as verified or repeatedly turned into customer-facing product questions. Q22 remains deferred; no infrastructure budget or paid upgrade has been approved.
- The final review must distinguish selected scope from any proposed defaults and name the implementation split, delivery sequence and observable acceptance criteria, including isolation under concurrent use. Include the API and ownership boundaries needed by both repositories, then coordinate implementation only after the user's requested final scope confirmation.
