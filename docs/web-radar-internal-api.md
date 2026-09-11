# WR internal implementation contract

All JSON API errors `{message,code?}`. Protected requests use `Authorization: Bearer WR-session`. Auth verifies current PR context before proxy to domain. Root owns auth and integration. All domain paths below are forwarded to singleton `COORDINATOR.fetch(request)` with server-injected `X-WR-Principal` JSON (incoming client header always replaced). Public routes forwarded without principal. Coordinator must never be directly routed publicly except via this worker.

## Auth
GET /api/config -> {testMode:boolean,services:ServiceStatus[]}
POST /api/auth/sign-in {email,password} -> {token,expiresAt,principal}
POST /api/auth/test-login {identity:'owner'|'admin'|'member'|'outsider'|'platform'} -> same, loopback test only
GET /api/auth/me -> {principal}
POST /api/auth/sign-out -> {ok:true}
Embed exact protocol in integration contract; exchange -> {token,expiresAt,principal,projectId?:string,target:'project'|'browse'}.

## Domain
GET /api/projects -> {projects:Project[]}
POST /api/projects {name,requestId,products?:ProductSnapshot[]} -> {project:Project}
GET /api/projects/:id -> ProjectDetail
PUT /api/projects/:id {expectedVersion:number,name?:string,draft:Draft} -> {project:Project}
POST /api/projects/:id/uploads multipart file -> {asset:Asset}
GET /api/projects/:id/assets/:assetId -> private bytes (supports range)
GET /api/source-products?offset=0&limit=20 -> {products:ProductSnapshot[],total}
POST /api/projects/:id/import {expectedVersion,productIds:string[]} -> {project:Project}
POST /api/projects/:id/source-check -> {changes:{productId:string,before:ProductSnapshot,after:ProductSnapshot}[]}
POST /api/projects/:id/source-apply {expectedVersion,productIds:string[]} -> {project:Project}
POST /api/projects/:id/confirm-script {expectedVersion} -> {project:Project}
POST /api/projects/:id/confirm-storyboard {expectedVersion} -> {project:Project}
POST /api/projects/:id/jobs {requestId,expectedVersion,kind:'script'|'copy'|'image'|'video',sceneId?:string,instructions?:string} -> {job:Job}; image without sceneId generates each missing scene (return job and jobs optional).
POST /api/projects/:id/jobs/:jobId/retry {} -> {job:Job}; must not resubmit unknown video.
POST /api/projects/:id/accept-video {expectedVersion,assetId} -> {project:Project}
GET /api/projects/:id/preview?lang=en&page=home&productId=... -> {html:string}; frontend iframe srcDoc, asset URLs need blob URLs via authenticated fetch, or a preview-specific in-memory route. No sessions in URL.
POST /api/projects/:id/publish {expectedVersion,requestId} -> {job:Job}
POST /api/projects/:id/restore {requestId} -> {job:Job}
POST /api/projects/:id/offline {} -> {project:Project}
GET /api/projects/:id/inquiries -> {inquiries:Inquiry[]}
POST /api/projects/:id/inquiries/:inquiryId/retry {} -> {inquiry:Inquiry}
GET /api/admin -> {quotas:Quota[],services:ServiceStatus[],jobs:Job[]}
PUT /api/admin/quotas/:userId {imageLimit,videoLimit} -> {quota:Quota}
GET /api/admin/export -> JSON export business data (no auth tokens/secrets).
GET /public/sites/:id/... -> active immutable release HTML/assets; unavailable if offline
POST /api/public/sites/:id/inquiries {requestId,name,email,company,message,productId?,website?:string} -> {id,emailStatus}; website honeypot.

## Shared provider interface (media implementer owns)
`createProviders(env)` returns object described in `src/worker/provider-contract.ts` (root creates). Jobs are durable in coordinator; adapters perform a single external operation. File assets are R2 keys; providers return bytes/streams only to be saved by coordinator before success. Publish adapter uploads trusted generated artifacts, activates only after provider success; alias gateway must check live state on every request.
