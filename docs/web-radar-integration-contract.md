# Product Radar ↔ Web Radar integration protocol v1

Approved full v1 spec: `web-radar-v1-final-review.md`. User selected final option A on 2026-09-12. Implementation is authorized; do not repeat requirements approval. This protocol is the engineering agreement between the two existing tasks. Coordinate any necessary wire changes before changing one side.

## Ownership and configuration

Product Radar owns current identity/workspace/source-product authorization and its embedded entry. Web Radar owns all website drafts, media jobs, quota accounting, rendering and publication. Product Radar requires no new persistent handoff tables: Web Radar stores one-time grants and idempotency records.

PR env: `WEB_RADAR_BASE_URL` (origin only, HTTPS except loopback development), `WEB_RADAR_INTEGRATION_SECRET` (server-only, minimum 32 characters).
WR env: `PRODUCT_RADAR_BASE_URL`, `PRODUCT_RADAR_INTEGRATION_SECRET` (the same integration secret), `PRODUCT_RADAR_PARENT_ORIGINS` (explicit allowed origin list).
Server-to-server requests use `X-Web-Radar-Secret`. Reject redirects when sending this secret. Never expose the secret, upstream refresh tokens, passwords or provider keys to iframe messages or URL parameters. Missing configuration is a clear unavailable state, not successful mocked integration.

## Principal and product snapshot JSON

```ts
interface Principal {
  userId: string; authSubject: string; email: string; displayName: string;
  systemRole: 'super_admin' | 'user';
  workspaceId: string; workspaceRole: 'admin' | 'member'; workspaceName: string;
}
interface ProductSnapshot {
  source: 'product-radar'; id: string; sourceProjectId: string;
  workflow: 'create' | 'build'; version: string; // sha256 of canonical accepted snapshot including asset identity
  name: string; description: string; material: string; dimensions: string;
  seriesName: string; designDirection: string;
  conditions: Record<string, unknown>; // keep reference/change instructions and provenance
  image: { sourceProductId: string; contentType: string | null };
  factsOrigin: 'generated-concept';
}
```

Do not interpret AI concept specifications as independently verified company capabilities/certificates. Product snapshots contain no full PR project, quota metadata, credentials or raw storage keys. Download the accepted image through the service endpoint below; do not publish a PR private URL into the generated website.

## Product Radar user-session endpoints

Existing PR `Authorization: Bearer <Supabase access token>` and optional `X-Workspace-Id` apply.

- `GET /api/web-radar/config` → `{enabled:boolean, embedUrl:string|null}`. The embed path is `/embed/product-radar`; URLs contain no grant or credentials. Enabled means integration settings are present/valid, not a live provider health guarantee.
- `GET /api/web-radar/context` → `{protocolVersion:1, principal:Principal}`. For WR standalone login, use existing PR `POST /api/auth/sign-in` with JSON `{email,password}`; success is `{access_token,refresh_token,expires_at?:number}` (expiry, when present, is Unix seconds). WR calls context with the obtained access token and maps the same stable identity. PR has no refresh route. Exchange into a bounded WR session, discard unneeded PR tokens, and use re-login at independent-session expiry; embedded sessions renew via a fresh parent handoff. Do not create separate customer accounts or broaden signup.
- `POST /api/web-radar/handoffs` body `{requestId:string, productIds:string[], projectId?:string}`. requestId is a UUID generated once per logical operation; productIds are distinct, at most 20; an empty list browses websites, or opens projectId if present. projectId and nonempty productIds cannot be combined. PR verifies each selected product against the current authorized confirmed-products list and sends the WR payload below. Unknown/unauthorized/unready IDs fail the complete operation; never silently drop products.
- Handoff response to the PR client: `{protocolVersion:1, requestId:string, code:string, expiresAt:string, embedUrl:string}` with `Cache-Control: no-store`. PR derives `parentOrigin` with its existing `publicOrigin` helper: configured `PUBLIC_ORIGIN` behind the Node reverse proxy, otherwise the actual request URL. This must match the browser-visible PR origin; no client-supplied origin is trusted. WR independently requires that origin in its configured allowlist.

## Web Radar handoff endpoints (owned by WR task)

`POST /api/integrations/product-radar/handoffs` requires the server secret. Body:
```ts
{ protocolVersion:1, requestId:string,
  intent:'create'|'browse'|'open', projectId?:string,
  parentOrigin:string, principal:Principal, products:ProductSnapshot[] }
```
Return `{requestId,code,expiresAt}`. Code is unpredictable, stored hashed, expires after 120 seconds, consumed atomically once and bound to requestId/parentOrigin/principal/intent. Idempotency is scoped by initiating user and requestId; a changed payload under the same key is 409. Repeated requests before consumption must be safely recoverable; consumed creation retries resolve to the same draft, not another project. WR rechecks current PR principal before issuing/using a session and ensures an open project is owned by the creator or accessible to its current workspace admin. Supplied roles are not permanent grants.

`POST /api/integrations/product-radar/exchange` consumes `{code,requestId,parentOrigin}` from the embedded WR client, returns a short-lived WR-only session and the project/browse target. Session can be kept in iframe memory; do not depend on third-party cookies. Enforce body/schema/origin binding and refuse replay. Session renewal uses a fresh parent-issued handoff for `open`/`browse`, not another create request.

## Frame messages

The iframe URL is `embedUrl` plus `parentOrigin=<encoded exact PR origin>` (not secret). PR CSP frame-src permits only the validated configured WR origin in addition to existing self/blob entries. WR frame-ancestors permits only configured PR origins. Use exact postMessage targetOrigin and validate both event.origin and event.source.

- WR → PR ready: `{type:'web-radar:ready',protocolVersion:1}`.
- PR → WR grant: `{type:'product-radar:handoff',protocolVersion:1,requestId,code}`.
- WR → PR signed-in: `{type:'web-radar:authenticated',protocolVersion:1,requestId,projectId?:string}`. Parent may replace the entry selection URL with projectId to support refresh without creating a second project.
- WR → PR renewal: `{type:'web-radar:session-expired',protocolVersion:1,projectId?:string}`; parent creates a fresh requestId, uses open/browse, then sends a grant.
- WR → PR failure: `{type:'web-radar:error',protocolVersion:1,message:string}` (safe human-readable message, no secrets/provider response dump).

Parent must not mint duplicate grants for repeated ready messages while one is pending. Parent has explicit reconnect/retry UI and rejects messages from other windows/origins. Changing PR workspace/session resets the embedded authorization.

## Product Radar server endpoints for WR sessions

All require the integration secret, parse JSON bodies and re-resolve the active PR user/workspace membership on every call. Input uses stable PR userId and workspaceId; the trusted WR server obtains these only from its authenticated session. A supplied role is never trusted. Suspended users/workspaces or removed members fail closed.

- `POST /api/web-radar/service/context` body `{userId,workspaceId}` → `{protocolVersion:1,principal}`. Revalidate before protected writes/publication and scope all reads. WR must not let a client choose another principal when calling this endpoint.
- `POST /api/web-radar/service/products` body `{userId,workspaceId,productIds?:string[],offset?:number,limit?:number}` → `{products:ProductSnapshot[],total:number}`. Explicit IDs max20, all-or-nothing, input order preserved; list defaults offset0/limit20, max100. Reuse current source feature eligibility and accepted-products access; standalone manual-upload use remains possible even if source features are not enabled. Fingerprints permit customer-reviewed source refresh.
- `POST /api/web-radar/service/image` body `{userId,workspaceId,productId,expectedVersion}` (the snapshot SHA256 version) → accepted image bytes, correct type, no-store. Recheck access, reject a changed snapshot with 409, and select the key on the server; client cannot supply a storage key or arbitrary fetch URL. WR streams into its own asset store before marking import complete.

## Errors and tests

Safe `{message:string,code?:string}` errors: invalid input400, absent/invalid login or integration key401, inactive/forbidden403, inaccessible products/projects404, replay/payload conflict409, expired grant410, misconfigured integration503, upstream failed handoff502. No raw upstream body echo or credentials in logs. Provider failure must not masquerade as image validation failure.

PR tests: configuration redaction and HTTPS/origin validation; forged principal roles and secret denial; suspension/membership removal; source-product eligibility; 20-product limit and no partial import; snapshot fingerprint stability/change; scoped image reads; no upstream redirects; strict frame origin/source binding and refresh idempotency.
WR tests: one-time exchange/replay/expiry/origin mismatch; requestId payload conflict; create deduplication; same draft across entry modes; current role revocation; real storage import; quota ownership; approvals tied to current inputs; provider job resume with one global video task; publication/inquiry behavior from the approved spec.
