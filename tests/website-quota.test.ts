import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { testDb } from './helpers/db';
import { DomainService } from '../src/worker/domain-service';
import { designKey } from '../src/shared/site-design';
import { siteFilePath } from '../src/worker/static-site';
import { storeCloneOutput } from '../src/worker/clone-artifacts';
import { fixtureProviders } from '../src/worker/providers/fixtures';
import type { AppEnv } from '../src/worker/env';
import type { Asset, Principal, Project } from '../src/shared/model';

const principal: Principal = { userId: 'owner', workspaceId: 'workspace', authSubject: 'owner', email: 'owner@example.com', displayName: 'Owner', systemRole: 'user', workspaceRole: 'member', workspaceName: 'Workspace' };
let env: AppEnv, service: DomainService;
let exhausted: boolean, committed: number;
const ledger = new Map<string, { projectId: string; reservationId: string; status: string }>();
const calls: Array<{action: string; body: Record<string, any>}> = [];
const objects = new Map<string, string>();
beforeEach(async () => {
  exhausted = false; committed = 0; ledger.clear(); calls.length = 0; objects.clear();
  const DB = testDb();
  for (const file of readdirSync('migrations').filter(file => file.endsWith('.sql')).sort()) await DB.exec(readFileSync('migrations/' + file, 'utf8'));
  env = { DB, MEDIA: {put: vi.fn(async (key, value) => objects.set(key, String(value))), get: vi.fn(async key => objects.has(key) ? {body:new TextEncoder().encode(objects.get(key)!), arrayBuffer:async()=>new TextEncoder().encode(objects.get(key)!).buffer, text: async () => objects.get(key), json: async () => JSON.parse(objects.get(key)!)} : null), delete: vi.fn(), list: vi.fn(async () => ({objects: []}))}, APP_ORIGIN: 'https://web.example', PRODUCT_RADAR_BASE_URL: 'https://product.example', PRODUCT_RADAR_INTEGRATION_SECRET: 's'.repeat(40), ENVIRONMENT: 'production' } as unknown as AppEnv;
  restart();
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const action = url.split('/').pop()!, body = JSON.parse(String(init.body));
    if(action==='context')return Response.json({protocolVersion:1,principal:{...principal,...body,userId:body.userId,workspaceId:body.workspaceId,workspaceRole:body.userId==='manager'?'admin':'member'}});
    calls.push({action, body});
    let row = ledger.get(body.projectId);
    if (action === 'status') return row ? Response.json(row) : Response.json({ message: 'No reservation' }, { status: 404 });
    if (action === 'reserve') {
      if (exhausted) return Response.json({ message: 'No points' }, { status: 429 });
      if (!Number.isInteger(body.productCount) || body.productCount < 1 || body.productCount > 20) return Response.json({}, {status:409});
      if (!row || row.status === 'released') { row = { projectId: body.projectId, reservationId: crypto.randomUUID(), status: 'reserved' }; ledger.set(body.projectId, row); }
    } else {
      if (!row || body.reservationId !== row.reservationId) return Response.json({ message: 'Token conflict' }, { status: 409 });
      if (action === 'commit' && row.status === 'reserved') { row.status = 'charged'; committed++; }
      if (action === 'release' && row.status !== 'charged') row.status = 'released';
    }
    return Response.json(row);
  }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function restart() { service = new DomainService(env, { schedule: async () => {} }, fixtureProviders(env)); }
const request = (path: string, body?: unknown, who = principal, method = body ? 'POST' : 'GET') => service.fetch(new Request('https://worker.test' + path, {method, headers: {'Content-Type':'application/json', 'X-WR-Principal':encodeURIComponent(JSON.stringify(who))}, ...(body ? {body:JSON.stringify(body)} : {})}));
const create = (requestId = 'quota-create', buildBranch = 'template') => request('/api/projects', {requestId,name:'Website',buildBranch});
async function ready(count = 2): Promise<Project> {
  const response = await create(); expect(response.status).toBe(200);
  const {project} = await response.json() as {project:Project};
  project.version = 3;
  project.draft.company.name = 'Original company';
  project.draft.company.email = 'owner@example.com';
  project.draft.company.description = 'A supplier of wooden products.';
  project.draft.country = 'US';
  const asset: Asset = {id:'product-photo',projectId:project.id,key:`projects/${project.id}/photo.png`,contentType:'image/png',size:8,filename:'photo.png',origin:'upload',createdAt:new Date().toISOString()};
  if(!await service.store.one('assets',asset.id))await service.store.insert('assets',asset).run();
  objects.set(asset.key,'PNG bytes');
  project.draft.products = Array.from({length:count}, (_, index) => ({id:`product-${index}`,name:`Product ${index}`,description:'Product',material:'Wood',dimensions:'10 cm',imageAssetId:asset.id}));
  project.draft.primaryProductId = project.draft.products[0]?.id || '';
  await service.store.update('projects', project).run();
  return project;
}
const prepare = (project: Project, points = project.draft.products.length > 10 ? 300 : 200) => request(`/api/projects/${project.id}/prepare-website-preview`, {expectedVersion:project.version,acceptedPoints:points});

it.each(['template','custom','clone'])('creates and replays empty %s drafts without reserving or charging', async mode => {
  exhausted = true;
  const responses = await Promise.all([create('same',mode), create('same',mode)]);
  const bodies = await Promise.all(responses.map(response=>response.json())) as any[];
  expect(responses.map(response=>response.status)).toEqual([200,200]);expect(bodies[0].project.id).toBe(bodies[1].project.id);
  restart();expect((await create('same',mode)).status).toBe(200);await service.tick();
  expect(calls).toEqual([]);expect(committed).toBe(0);
});
it('does not charge reads, empty drafts, rejected prices or failed rendering', async () => {
  const empty = await ready(0);expect((await prepare(empty)).status).toBe(400);
  const project = await ready();
  expect((await request(`/api/projects/${project.id}/preview`)).status).toBe(200);
  expect((await prepare(project,300)).status).toBe(409);
  project.draft.buildBranch='custom';project.draft.siteDesign={revision:1,pages:{},build:{jobId:'missing'}};
  await service.store.update('projects',project).run();
  expect((await prepare(project)).status).not.toBe(200);expect(calls).toEqual([]);
});
it.each(['custom','clone'] as const)('rejects an unfinished %s flow instead of billing a fallback template', async mode => {
  const project=await ready();project.draft.buildBranch=mode;
  if(mode==='clone')project.draft.cloneConfig={status:'idle'};
  await service.store.update('projects',project).run();
  const response=await prepare(project);
  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({code:mode==='clone'?'clone_not_ready':'site_not_built'});
  expect(calls).toEqual([]);expect(committed).toBe(0);
  expect(await service.store.one('projects',project.id)).toEqual(project);
  expect([...objects.keys()].some(key=>key.startsWith('website-results/'))).toBe(false);
});
it.each(['name','email','description','image','foreign-image','missing-image'])('rejects incomplete website materials: %s without freezing or charging', async field => {
  const project=await ready();
  if(field==='image')project.draft.products[0].imageAssetId=undefined;
  else if(field==='foreign-image')await service.store.update('assets',{...(await service.store.one<Asset>('assets','product-photo'))!,projectId:'other-project'}).run();
  else if(field==='missing-image')objects.delete(`projects/${project.id}/photo.png`);
  else project.draft.company[field as 'name'|'email'|'description']='';
  await service.store.update('projects',project).run();
  expect((await prepare(project)).status).toBeGreaterThanOrEqual(400);
  expect(calls).toEqual([]);expect(committed).toBe(0);
  expect(await service.store.one('projects',project.id)).toEqual(project);
  expect([...objects.keys()].some(key=>key.endsWith('/result.json'))).toBe(false);
});
it.each(['custom','clone'] as const)('charges only the completed %s artifact and preserves its exact rendered pages', async mode => {
  const project=await ready(1);project.draft.buildBranch=mode;
  project.draft.copy.en={headline:'Approved headline',subtitle:'Approved subtitle',cta:'Contact us',about:'Our company'};
  const pages=['home','catalog','detail','about','contact'] as const;
  const files=Object.fromEntries(pages.map(page=>[siteFilePath('en',page,'product-0'),`<!doctype html><html><head><title>Approved ${mode} ${page}</title></head><body><main>Actual generated ${mode} website ${page}</main></body></html>`]));
  let key:string;
  if(mode==='custom') {
    const design={revision:1,pages:Object.fromEntries(pages.map(page=>[page,{imageAssetId:'product-photo'}])),homeConfirmedAssetId:'product-photo',confirmedKey:'',build:{jobId:'built-job',artifactKey:`projects/${project.id}/site.json`}};
    design.confirmedKey=designKey(design);project.draft.siteDesign=design;
    key=design.build.artifactKey;objects.set(key,JSON.stringify(files));
  } else {
    project.draft.cloneConfig=await storeCloneOutput(env,project.id,{status:'ready',generatedFiles:files,generatedHtml:files['en/index.html'],generation:{mode:'vision',imageCount:1,pageCount:5,visuallyVerified:false}});
    key=project.draft.cloneConfig.artifact!.key;
  }
  await service.store.update('projects',project).run();
  const artifact=objects.get(key)!;objects.delete(key);
  expect((await prepare(project)).status).toBe(503);expect(calls).toEqual([]);
  objects.set(key,artifact);
  if(mode==='custom') {
    project.draft.siteDesign!.confirmedKey='stale';await service.store.update('projects',project).run();
    expect((await prepare(project)).status).toBe(409);expect(calls).toEqual([]);
    project.draft.siteDesign!.confirmedKey=designKey(project.draft.siteDesign!);await service.store.update('projects',project).run();
  }
  const response=await prepare(project);expect(response.status,await response.clone().text()).toBe(200);expect(committed).toBe(1);
  const result=JSON.parse(objects.get(`website-results/${project.id}/3/result.json`)!);
  expect(Object.keys(result.pages)).toHaveLength(5);
  for(const html of Object.values(result.pages))expect(html).toContain(`Actual generated ${mode} website`);
});
it('reserves actual count, freezes the rendered version and charges once across concurrent requests/restart', async () => {
  const project=await ready(12);
  expect((await Promise.all([prepare(project),prepare(project)])).map(response=>response.status)).toEqual([200,200]);
  expect(calls.find(call=>call.action==='reserve')?.body).toMatchObject({productCount:12});
  expect(calls.find(call=>call.action==='commit')?.body).toMatchObject({productCount:12,resultVersion:3});
  restart();expect((await prepare(project)).status).toBe(200);expect(committed).toBe(1);
  const result=JSON.parse(objects.get(`website-results/${project.id}/3/result.json`)!);
  expect(result.project.version).toBe(3);expect(result.pages['en/index.html']).toContain('Original company');
});
it.each([429,403,409,503])('preserves the free draft when upstream reserve returns %s', async status => {
  const project=await ready();vi.stubGlobal('fetch',vi.fn(async()=>Response.json({message:'Internal details'},{status})));
  const response=await prepare(project);expect(response.status).toBe(status);expect(await response.text()).not.toContain('Internal details');
  expect(await service.store.one('projects',project.id)).toBeTruthy();expect(committed).toBe(0);
});
it('recovers a lost reserve response with the original project and token', async () => {
  const project=await ready(), fetcher=fetch;let lost=false;
  vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{const response=await fetcher(url,init);if(url.endsWith('/reserve')&&!lost){lost=true;throw Error('Response lost');}return response;}));
  expect((await prepare(project)).status).toBe(503);restart();expect((await prepare(project)).status).toBe(200);
  expect(calls.filter(call=>call.action==='reserve')).toHaveLength(1);expect(committed).toBe(1);
});
it('keeps the approved product count and result version through an uncertain reservation and later edits', async () => {
  const project=await ready(12),fetcher=fetch;let lost=false;
  vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{const response=await fetcher(url,init);if(url.endsWith('/reserve')&&!lost){lost=true;throw Error('Response lost');}return response;}));
  expect((await prepare(project)).status).toBe(503);
  project.version++;project.draft.products=project.draft.products.slice(0,2);await service.store.update('projects',project).run();restart();
  expect((await prepare(project,200)).status).toBe(409);
  expect((await prepare(project,300)).status).toBe(200);
  expect(calls.find(call=>call.action==='commit')?.body).toMatchObject({productCount:12,resultVersion:3});
});
it('recovers a lost commit response without a second charge or new rendered version', async () => {
  const project=await ready(), fetcher=fetch;let lost=false;
  vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{const response=await fetcher(url,init);if(url.endsWith('/commit')&&!lost){lost=true;throw Error('Response lost');}return response;}));
  expect((await prepare(project)).status).toBe(503);expect(committed).toBe(1);
  project.version=4;project.draft.company.name='Later version';await service.store.update('projects',project).run();
  restart();expect((await prepare(project)).status).toBe(200);expect(committed).toBe(1);
  expect(calls.filter(call=>call.action==='commit').every(call=>call.body.resultVersion===3)).toBe(true);
  expect(calls.filter(call=>call.action==='reserve')).toHaveLength(1);
});
it('does not reserve for a failed result archive and safely retries the same website', async () => {
  const project=await ready();vi.mocked(env.MEDIA.put).mockRejectedValueOnce(Error('R2 unavailable'));
  expect((await prepare(project)).status).toBe(500);expect(ledger.has(project.id)).toBe(false);expect(committed).toBe(0);
  expect((await prepare(project)).status).toBe(200);expect(committed).toBe(1);
});
it('retains an atomic commit marker when its write response is lost', async () => {
  const project=await ready();const prepareStatement=env.DB.prepare.bind(env.DB);let lost=false;
  vi.spyOn(env.DB,'prepare').mockImplementation((sql:string)=>{const statement=prepareStatement(sql);const bind=statement.bind.bind(statement);statement.bind=((...values:any[])=>{const bound=bind(...values);if(sql.startsWith('UPDATE idempotency SET result=')&&String(values[0]).includes('"state":"commit"')&&!lost){const run=bound.run.bind(bound);bound.run=async()=>{lost=true;await run();throw Error('Lost D1 response');};}return bound;}) as typeof statement.bind;return statement;});
  expect((await prepare(project)).status).toBe(200);expect(committed).toBe(1);expect(calls.some(call=>call.action==='release')).toBe(false);
});
it('settles a persisted result after restart even when the editable project was deleted', async () => {
  const project=await ready(),fetcher=fetch;let unavailable=true;
  vi.stubGlobal('fetch',vi.fn((url:string,init:RequestInit)=>unavailable&&url.endsWith('/commit')?Promise.reject(Error('Offline')):fetcher(url,init)));
  expect((await prepare(project)).status).toBe(503);
  expect((await request(`/api/projects/${project.id}`,undefined,principal,'DELETE')).status).toBe(200);
  unavailable=false;restart();await service.tick();expect(committed).toBe(1);
  const preview=await request(`/internal/product-radar-projects/${project.id}/preview?expectedVersion=3`);
  expect(preview.status, await preview.clone().text()).toBe(200);expect(await preview.text()).toContain('Original company');
  const status=await request(`/internal/product-radar-projects/${project.id}/status?expectedVersion=3`);
  expect(status.status).toBe(200);expect(await status.json()).toMatchObject({projectVersion:3,products:[{id:'product-0'},{id:'product-1'}],languages:['en'],publication:{status:'idle'}});
});
it('keeps archived pages stable after edits and restricts reads to the canonical workspace scope', async () => {
  const project=await ready();await prepare(project);
  project.version++;project.draft.company.name='Changed';await service.store.update('projects',project).run();
  const path=`/internal/product-radar-projects/${project.id}/preview?expectedVersion=3`;
  const preview=await request(path);expect(preview.status, await preview.clone().text()).toBe(200);expect(await preview.text()).toContain('Original company');
  expect((await request(path,undefined,{...principal,userId:'peer'})).status).toBe(404);
  expect((await request(path,undefined,{...principal,userId:'manager',workspaceRole:'admin'})).status).toBe(200);
  expect((await request(path,undefined,{...principal,userId:'manager',workspaceId:'other',workspaceRole:'admin'})).status).toBe(404);
  expect((await request(`/api/projects/${project.id}/prepare-website-preview`,{expectedVersion:4,acceptedPoints:200},{...principal,userId:'manager',workspaceRole:'admin'})).status).toBe(403);
});
it('blocks publication until an explicitly approved website result is delivered', async () => {
  const project=await ready();
  const response=await request(`/api/projects/${project.id}/publish`,{requestId:'unpaid-publish',expectedVersion:project.version});
  expect(response.status).toBe(409);expect(await response.json()).toMatchObject({code:'website_preview_required'});
  expect(await service.store.list('jobs')).toHaveLength(0);expect(calls).toEqual([]);
  await prepare(project);
  const next=await request(`/api/projects/${project.id}/publish`,{requestId:'paid-publish',expectedVersion:project.version});
  // Other existing publication validation still applies, but the paid-preview gate is cleared.
  expect(await next.json()).not.toMatchObject({code:'website_preview_required'});
});
it('does not retroactively charge historical projects without a billing journal', async () => {
  const project=await ready();await env.DB.prepare("DELETE FROM idempotency WHERE scope LIKE 'website-quota:%'").run();
  expect((await prepare(project)).status).toBe(200);expect((await create()).status).toBe(200);expect(calls).toEqual([]);
});
it('settles legacy reserved journals without adding count/version or a new reservation', async () => {
  const project=await ready();const reservationId=crypto.randomUUID();ledger.set(project.id,{projectId:project.id,reservationId,status:'reserved'});
  const row=await env.DB.prepare("SELECT result FROM idempotency WHERE scope LIKE 'website-quota:%'").first<{result:string}>();
  const legacy=JSON.parse(row!.result);delete legacy.deferred;Object.assign(legacy,{state:'commit',reservationId});
  await env.DB.prepare("UPDATE idempotency SET result=? WHERE scope LIKE 'website-quota:%'").bind(JSON.stringify(legacy)).run();
  restart();await service.tick();expect(committed).toBe(1);expect(calls).toHaveLength(1);
  expect(calls[0].body.productCount).toBeUndefined();expect(calls[0].body.resultVersion).toBeUndefined();
});
