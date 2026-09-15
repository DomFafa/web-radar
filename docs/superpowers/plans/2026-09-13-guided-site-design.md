# Guided site design implementation plan

Goal: deliver the approved image-aware interview → approved brief/page list → homepage and planned inner pages flow.
Architecture: optional server-owned consultation state in existing Draft JSON, existing durable jobs/text provider, dynamic validated page metadata carried through existing image and static build contracts.
Tech Stack: TypeScript/React/Cloudflare Workers, Zod, Python/FastAPI, existing screenshot-to-code adapter.
Spec: docs/superpowers/specs/2026-09-13-guided-site-design.md
Global Constraints: preserve dirty checkout and existing UI shell; no vendor edits, secrets output, migrations, production deploy or paid whole-site retries.

- [x] Task 1 (root): define SiteBrief/Consultation types, safe page helpers and schemas, invalidation helpers and focused tests. SiteDesign.pageIds persists the exact image plan, with legacy fixed-five default.
- [x] Task 2 (provider implementer): vision-aware consultation provider, strict question/brief validation, fixture provider, image prompting and dynamic fixture/static file validation; provider tests.
- [x] Task 3 (builder implementer): services/site-builder dynamic approved extra pages, deterministic content bindings/routes/navigation; exact planned image validation and Python regression tests.
- [x] Task 4 (frontend implementer): preserve Editor shell, replace manual style/copy gates with consultation and approved brief; dynamic PageDesign counts/cards and checklist; API contract below; local component/workflow checks.
- [x] Task 5 (root): jobs state, answer/confirm endpoints, server-owned state, stale/retry/idempotency/image gates and dynamic build input; domain regression tests.
- [x] Task 6: scoped independent reviews, final typecheck/TS/Python/build and local fixture browser acceptance. Report real-provider and hosting boundaries separately.

## Shared contract
`DesignPage = BaseDesignPage | extra-${string}`. `plannedPages(draft)` returns approved/proposed brief pages or base five; `designPageIds(design)` uses persisted pageIds or legacy base five. `SiteDesign.pageIds?: DesignPage[]`.
`draft.consultation?: {revision, answers:[{questionId,question,answer}], question?:{id,prompt,reason,options:string[]}, brief?:SiteBrief, confirmed?:boolean, jobId?:string}`.
`SiteBrief = {summary,audience,goal,visualDirection,layout,brandColor,keep:string[],avoid:string[],pages:[{id,label,purpose,content:{LANG:{title,sections:[{heading,body}]}}}],copy:{LANG:SiteCopy},productTranslations:{PRODUCT:{LANG:{name,description}}}}`.
Provider `consult(draft, referenceUrls, instructions): Promise<{question:{prompt,reason,options}} | {brief:SiteBrief}>`; server assigns question IDs. Reference order: unique original product images, then logo, with explicit roles in prompt. Existing image provider reference order unchanged (home if inner, primary, other products, logo).
`POST /api/projects/:id/jobs`: `{kind:'consultation',expectedVersion,requestId,questionId?,answer?,instructions?,restart?}`. Initial call no answer; answer must match current question. `instructions` revises a ready proposal; `restart:true` clears old interview. Active job blocks overlapping calls. `POST /api/projects/:id/confirm-brief {expectedVersion}` applies validated copy/translations/color/direction and sets confirmed. UI saves dirty basic facts before requests. `confirm-design` unchanged except dynamic planned pages.
