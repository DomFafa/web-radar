# Web Radar static site builder

Independent Python service that sends each approved planned-page design image to the supplied `screenshot-to-code-main/backend` Agent, then binds approved company/product/language data into sanitized standalone HTML. The vendor source is imported unchanged. No video, image generation, screenshot embedding, CDN, or generated JavaScript is required.

## Install and local start

Run from this directory with Python 3.12+ and uv:

```sh
/Users/dom/.local/bin/uv sync --frozen
/Users/dom/.local/bin/uv run playwright install chromium
/Users/dom/.local/bin/uv run uvicorn app:app --host 127.0.0.1 --port 7002 --workers 1
```

Set these values through the process environment or a private launcher. Do not copy secrets into tracked files or shell command arguments. The service does not load the Web Radar `.dev.vars` file itself.

| Environment variable | Contract |
| --- | --- |
| `SITE_BUILDER_KEY` | Required shared bearer secret. Startup fails closed if empty. |
| `OPENAI_API_KEY` | Required for live inference. |
| `OPENAI_BASE_URL` | Optional OpenAI-compatible API base URL. Must support the **Responses API**, tool calling, and image input used by the supplied Agent. |
| `SITE_BUILDER_MODEL` | Defaults to `gpt-5.5`, mapped to vendor `Llm.GPT_5_5_LOW`. `gpt-5.4` alias and full OpenAI `Llm` enum values are also accepted. |
| `SITE_BUILDER_DB` | Durable SQLite path; defaults to `./data/builds.sqlite3` relative to the service working directory. |
| `SITE_BUILDER_BROWSER_CHANNEL` | Optional installed Playwright browser channel, e.g. `chrome` on the production server. Empty uses the bundled Chromium. |

The `.venv` installed here is independent of the vendor's Poetry environment. No vendor files or Poetry environment are changed. The supplied backend must remain at `../../screenshot-to-code-main/backend` relative to this directory.

**Chromium is required in production** for the service's sanitized render-validation step. On Linux, install the browser's operating-system dependencies as part of deployment (Playwright supports `playwright install --with-deps chromium`). The untrusted vendor screenshot tool remains disabled; the separate renderer only receives sanitized and bound pages.

Server deployment is separate from local startup: use a dedicated single-process service, persistent private storage for SQLite, HTTPS or a private tunnel, and an authenticated upstream Worker configured with its reachable `SITE_BUILDER_URL` and matching key. A Worker cannot reach this laptop's loopback address without an explicit connection. Run exactly **one uvicorn worker and one service instance per database**; do not use `--reload` during live inference. No deployment or domain configuration is performed by installation.

## HTTP contract

Both endpoints require `Authorization: Bearer <SITE_BUILDER_KEY>`.

- `POST /v1/builds` accepts `{ "id": "stable-worker-job-id", "draft": {...}, "designImages": { "home": "data:image/png;base64,...", "catalog": "...", "detail": "...", "about": "...", "contact": "..." } }`.
- Optional `referenceAssets: Record<assetId,dataURL>` supplies all approved product photos and the optional company logo for private render validation. Only asset IDs from those draft fields are accepted. Values follow the same PNG/JPEG/WebP validation as design images and count toward the existing 70 MiB request limit. The Worker supplies every product image directly from R2, retaining its 45 MiB pre-encoding budget. These private references are never publicly uploaded or embedded in returned files.
- Accepted requests return HTTP 202 and `{id,state,...}`. The exact canonical input is stored once. Identical IDs and input return the existing job; conflicting input returns HTTP 409. Failed IDs remain failed; a deliberate retry needs a new Worker job ID.
- `GET /v1/builds/{id}` returns `{state:"pending",progress:string}`, `{state:"succeeded",files:Record<string,string>}`, or `{state:"failed",message:string}`. Missing jobs return HTTP 404.
- IDs contain 1–100 ASCII letters, digits, underscores or hyphens and begin with a letter/digit.
- Body maximum: 70 MiB, enforced while streaming as well as against Content-Length. Every planned image must be a valid base64 PNG/JPEG/WebP data URL with a matching image format and at most 40 million pixels. Filesystem paths, remote URLs, SVG and malformed image bytes are rejected.
- Output maximum: 8 MiB for all files combined and 1,000,000 bytes per assembled HTML file, including embedded visual/font assets. The Worker independently enforces 1,000,000 bytes **after URL/token expansion and CSP insertion**. Raw templates are limited to 2 MiB. A page uses one 90-second asset-planning request (4,000 output tokens, 6,000 for factual catalog grouping). When a scene is proposed, one additional 90-second crop-only review receives its actual extracted pixels, with 6,000 output tokens. SDK retries are disabled. At most one initial HTML invocation and one visual review/repair follow (240 seconds each). The existing single consumer, 1,200-second whole-job deadline and vendor generation cost ceiling remain.
- Queued jobs recover on restart. Interrupted running jobs become explicitly failed instead of silently spending again. Stored inputs and outputs persist in a mode-0600 SQLite file; keep its directory and backups private. Retention/cleanup is an operator responsibility.
- Fixed assembler validation diagnoses can appear in `message`; raw provider exceptions, credentials, prompt reports, and images never appear in error responses. Vendor prompt reporting is disabled for this process.

The draft may contain additional Web Radar workflow fields. It must contain an approved company name, 1–100 unique products with source facts, a valid primary product, English plus at most one of `de/fr/es/pt/it`, and approved `copy` for each selected language. Every product needs approved `translations` for the second language. The service does not fabricate missing translations. Legacy drafts build the fixed five base pages. A draft with `consultation.brief.pages` builds that exact validated plan: the five base pages plus at most three safe `extra-<slug>` pages, with one matching design image per planned page.

## Output and binding contract

Base paths are `en/index.html`, `en/products/index.html`, `en/products/{percent-encoded-product-id}/index.html`, `en/about/index.html`, and `en/contact/index.html`, plus the selected second language. Planned extra pages use `LANG/extra-SLUG/index.html`. Every real product gets a detail page. Product IDs `.` and `..` are rejected.

Generated HTML is treated solely as a layout. Model text is removed, then trusted data is bound into safe leaf elements using `data-wr-bind`:

- `company.name`, `company.description`, `company.email`, `company.contactName`, `company.logo`.
- `copy.headline`, `copy.subtitle`, `copy.about`, `copy.cta`.
- `product.name`, `product.description`, `product.material`, `product.dimensions`, `product.image`.
- `ui.home`, `ui.catalog`, `ui.about`, `ui.contact`, `ui.detail`, and the trusted translated form/navigation labels listed in `assembler.py`.
- Approved brief sections use `section.N.heading` followed by `section.N.body`, exactly once and in approved order. Base pages retain their existing required title/product/fact bindings; extra pages additionally use `page.title`.

Image hooks must be `img` elements. Actual logos/product photos receive only `__WR_ASSET_<assetId>__` sources. Asset IDs preserve the Worker's safe opaque identifier contract `[A-Za-z0-9][A-Za-z0-9_-]{0,199}`, including UUID and `result-{UUID}` IDs. Paths, punctuation that could break tokens, and overlong IDs are rejected. Missing optional photos are removed. The caller resolves these tokens to authorized preview or public asset URLs. Design images cannot be emitted as webpage screenshots.

The home page requires company name and headline bindings; each `data-wr-products` collection has exactly one direct-child `data-wr-product` card template with product name, image and a detail link. Descriptions are optional for compact cards; full detail-page descriptions remain required. `data-wr-product-ids='["approved-id", "another-id"]'` selects exact products in that order; omission keeps all products. Selections must be nonempty, unique and approved, and catalog collections together must cover every product. Nested/orphan cards are rejected. Detail facts remain outside related collections; about requires `copy.about`; contact requires a form placeholder. Approved `page.title` is optional once on base pages, while section order/multiplicity remains strict.

The assembler expands cards deterministically, replaces a `data-wr-nav` placeholder (or adds navigation), and creates language links. When a model incorrectly places the placeholder on a span inside a nav, replacement is normalized to the surrounding nav and removes duplicate model links while retaining that nav's layout classes. All navigable anchors carry `data-wr-page` and `data-wr-lang`; product-specific links also carry the actual `data-wr-product-id`. Responsive navigation wraps on narrow viewports, so it needs no model-generated mobile-menu JavaScript.

If that navigation's header duplicates the body subtitle as a long brand tagline, the assembler removes only the header duplicate and gives that header and its navigation wrappers room to wrap at their natural height. Brand/CTA classes, colors, typography, main copy and link metadata are preserved. Headers without this demonstrated duplicate remain unchanged.

Empty form placeholders retain the legacy trusted form. Designed forms use a `div/section[data-wr-form]` with exactly six safe leaf `span[data-wr-field]` slots: `name`, `email`, `company`, `message`, `productId`, `submit`. The wrapper becomes a trusted form and slots become controls, preserving classes, inline styles, label wrappers and grid/flex layout. Trusted types, limits, required flags, IDs, accessible labels and status are inserted. Slots cannot occur inside collections or shadow runtime DOM APIs. Forms may appear on detail/other pages; detail forms preselect that product. Only name/email/message are required; limits remain 120/254/200/5000 characters respectively. The inquiry runtime and requestId retry behavior are unchanged; no new endpoint fields are added.

Base navigation uses short trusted localized labels; extra pages use approved localized titles. A single-language site has no redundant language switcher. Default navigation/form CSS has low specificity so authored styles take precedence. Homepage `header.wr-header`, `footer.wr-footer` and `style[data-wr-shared]` are copied into inner-page templates; page CSS is instructed to remain scoped to its main content.

## Approved visual assets

The visual planner identifies self-contained scene/wordmark regions and card counts before writing HTML. It receives the exact image dimensions and returns pixel corner bounds `[left,top,right,bottom]`; the service validates and converts them to the normalized HTML crop contract. `img[data-wr-crop="PAGE:X,Y,W,H"][data-wr-asset-kind="scene|logo|icon"]` selects original approved pixels using integer 0–1000 normalized coordinates. The local Pillow materializer runs only after sanitation, retains no model URL, and emits bounded WebP data images. The HTML model also receives the actual extracted asset previews to inspect their edges. Each region covers at most 45% of a design and unique regions at most 65% per source; at most 12 regions, 220 KB per crop. Whole screenshots/tiling, UI-text crops and screenshot substitutes for original product cards/detail photos are prohibited. The visual review must verify crop suitability; geometric bounds alone do not identify UI text. A cropped wordmark can carry `data-wr-bind="company.name"`; this binds the factual name as its accessible alt text without requiring a duplicate visible name.

`span[data-wr-icon="mail|arrow|cart|users|check|heart"]` selects fixed trusted vectors; arbitrary model SVG remains removed. `html[data-wr-font="rounded"]` embeds the bundled Nunito font as `WR Rounded`, including its OFL license. Copy the entire `assets/` directory when packaging the Python service. No runtime font/CDN requests are made.

Crop-only review preserves original logo/icon regions and card counts, and rejects new scene regions with less than half their area overlapping an originally proposed scene. Main-photo and isolated prop splits are allowed. This prevents mining unrelated card photos during review; it does not prove that a principal object is complete or that no live text was captured. Those still require visual QA.

For catalogs, the existing planning pass also receives actual product facts, lossless retained source-condition groups and approved keep/avoid. Its `catalogGroups` uses approved section indices and exact product IDs. Membership is unique, complete and in draft order; section order is validated. Actual bound collections must match those memberships and appear under their assigned sections. Screenshot card counts remain visual guidance when they conflict with approved facts. Catalogs without meaningful grouped sections retain one complete collection.

Scripts, event handlers, model forms, external media/styles, SVG, iframes, unsafe links, CSS network references (including escaped URLs), generated CSS text, and unapproved product navigation metadata are removed. Empty-string CSS `content` declarations are preserved for decorative pseudo-elements; nonempty generated words and URL-bearing declarations remain disallowed. All unbound text is removed, including text before/after the HTML document that browsers would otherwise render; a trusted HTML doctype is inserted. CSS is inline. Source `conditions` are grounding material in the model prompt and are never exposed as visible site copy. Text bindings into CSS/document structure or non-leaf elements are rejected.

The generation prompt includes the longest actual final binding text across the selected languages/products, page-specific h1 bindings, and empty optional facts. It explicitly avoids using long subtitles as logo microtext, adding hidden hooks for other page types, inventing galleries from repeated copies of one image, and reserving empty company-story panels. Product images retain their full content with `object-fit:contain`. Detail breadcrumbs span or sit above the image/information grid so those columns share the same row. These are generation requirements; automated contract tests do not prove model compliance or visual quality.

The vendor screenshot preview backend is explicitly disabled through its public registration hook and probed at startup. This avoids executing unsanitized generated HTML or loading its network resources. Its existing `save_assets` / `remove_backgrounds` tools can still be advertised by the unmodified vendor, but the service runtime rejects every tool except in-memory `create_file` / `edit_file`.

## Sanitized rendering and visual review

Each generated page is first sanitized and bound through `assemble_page`. Its English representative renders at the approved image width (up to 2560px) and 390px. The renderer removes the inquiry script, disables JavaScript/service workers, blocks network requests, and allows only trusted data images/fonts and inline styles. Full-page screenshots include up to 5000px of page height, so footer/mobile content reaches the reviewer. Raw model HTML is never executed.

In that private render only, known asset tokens resolve to `referenceAssets` data URLs. Other product images use the primary photo as a geometry placeholder. Legacy requests without reference assets remain accepted and use a neutral 512px image for geometry checks. Returned website files always preserve each original asset token; private render substitutions never alter deliverables.

Checks require a visible real-image binding outside collections on home/about/detail, an image in each catalog card, loaded images with useful dimensions, at least seven clear points in a nine-point `elementFromPoint` image sample, visible main headings/descriptions, readable navigation/CTA text, navigation links inside their containing header, no document overflow beyond one pixel, and a visible contact form with its main fields and submit button. Navigation uses actual text Range line boxes so padded CTAs and large logo text do not produce false vertical-text failures. During sampling, the image and intersecting pointer-transparent boxes with opaque backgrounds/background images or loaded image content temporarily participate in hit testing. Empty transparent layout wrappers remain ignored; all pointer-event overrides are restored afterward.

Every page gets one visual review, even when structural checks pass: the same Agent receives the original approved design, current HTML, full desktop/mobile renders, measured geometry and concrete issues. Missing planned scenes, incorrect ordered collection/card counts, CSS that distorts or crops an extracted asset by more than 5%, and desktop height inflation above 35% are diagnosed alongside existing image/navigation/content checks. Required elements clipped by an `overflow:hidden/clip` ancestor are rejected with a 2px tolerance; ordinary below-the-fold content stays valid. Asset aspect checks use the image content box, excluding borders/padding. Catalog counts derive from validated factual membership, never by dropping approved products to match a vision count. The model edits that same page once, then assembly/render checks run again. A remaining failure ends the job explicitly. There is no repeated automatic repair loop.

Raw page templates, planner data, issues, metrics and rendered screenshots are saved privately under `evidence/<job-id>/` beside `SITE_BUILDER_DB`, with 0700 directories and 0600 files. They are not served through the build API. Operator retention policy for this private directory follows the database's retention policy.

These checks are a bounded layout gate, not a perceptual guarantee. English representative pages are inspected; other product/language pages still receive deterministic structural assembly. Unknown product-image geometry is approximated with the primary reference. Complex clipping, blending and low-contrast paint still require final real screenshot acceptance.

## Verification

```sh
/Users/dom/.local/bin/uv run pytest -q
/Users/dom/.local/bin/uv run pyright --pythonpath .venv/bin/python
```

Tests are network-free. Render-validation tests require the matching Playwright Chromium; install it with `uv run playwright install chromium`. Inquiry browser acceptance intercepts all requests. Repair-loop tests replace only the external model boundary while exercising real assembly and Chromium inspection; they make no paid inference calls.

The suite verifies exact facts, multiple products/languages, escaping/token sources, URL encoding, unsafe output handling, valid/malformed images/reference assets, authorization, idempotency/conflicts, persisted success, interrupted/queued restart behavior, bounded concurrency, output limits, vendor import/model selection, multimodal prompt construction, disabled vendor tools, real browser inquiry submission/retry, visual failure detection, false-positive boundaries and the single-repair limit.

Known limit: these tests do not establish live-provider availability or visual similarity to actual approved design screenshots. Real-provider conversion and authenticated Worker preview/publication acceptance remain separate checks.

### Standalone photographic scene assets

The builder validates every design's actual page type and layout before conversion. It generates clean standalone scene images before coding, using the approved scene and original product photos with dedicated `IMAGE_API_KEY`, `IMAGE_API_BASE_URL` and `IMAGE_MODEL=gpt-image-2.5-sunburst`. Text keys are never reused for image requests. `PROVIDER_MEDIA_ORIGINS` is required only when the image provider returns an HTTPS download URL instead of base64 pixels.

Assets and exact prompts are saved privately under the job's `evidence/<job>/assets/` directory. The output is embedded as bounded WebP using trusted `data-wr-scene` bindings; original product-card and detail images keep their original references. The final page must actually include each prepared scene. The HTML-only build response and existing private-media authorization contract remain unchanged.

Image requests have a 28,000 UTF-16 character ceiling, a 45 MiB reference budget and one 150-second attempt per scene. Exact source conditions are grouped and losslessly encoded when needed; oversized input fails before submission. Saved successful assets are reused; uncertain submissions are not blindly repeated. Home conversion runs first, followed by at most two inner pages at once within the existing whole-job deadline. Desktop/mobile geometry checks enforce approved compact cards, columns and forms, with one rendered visual review/repair per page.
