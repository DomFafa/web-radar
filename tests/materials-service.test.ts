import{afterEach,beforeEach,describe,expect,it,vi}from'vitest';
import{readFileSync}from'node:fs';
import{testDb}from'./helpers/db';
import{MaterialsService}from'../src/worker/materials-service';
import{DomainStore}from'../src/worker/domain-store';
import{materialsFixture,materialsPng}from'./fixtures/materials';
import{ApiError,canonical,sha256}from'../src/worker/http';
import type{AppEnv}from'../src/worker/env';
import type{Project}from'../src/shared/model';

describe('durable confirmed materials receiver',()=>{
  let env:AppEnv, service:MaterialsService, store:DomainStore, fixture:Awaited<ReturnType<typeof materialsFixture>>;
  let failAsset=false,revoked=false,fetches=0;
  const objects=new Map<string,{bytes:Uint8Array;options:any}>();
  beforeEach(async()=>{
    fixture=await materialsFixture(2);failAsset=false;revoked=false;fetches=0;objects.clear();
    const db=testDb();await db.exec(readFileSync('migrations/0002_business.sql','utf8'));
    const bucket={async put(key:string,value:any,options:any){const bytes=typeof value==='string'?new TextEncoder().encode(value):new Uint8Array(value);objects.set(key,{bytes,options});},async get(key:string){const o=objects.get(key);return o?{size:o.bytes.length,httpMetadata:o.options?.httpMetadata,customMetadata:o.options?.customMetadata,arrayBuffer:async()=>o.bytes.buffer.slice(o.bytes.byteOffset,o.bytes.byteOffset+o.bytes.length),text:async()=>new TextDecoder().decode(o.bytes)}:null;},async head(key:string){return this.get(key);},async delete(key:string|string[]){for(const k of typeof key==='string'?[key]:key)objects.delete(k);}};
    env={DB:db,MEDIA:bucket,PRODUCT_RADAR_BASE_URL:'https://product.example.com',PRODUCT_RADAR_INTEGRATION_SECRET:'s'.repeat(40)}as unknown as AppEnv;
    store=new DomainStore(db);service=new MaterialsService(env,store,{lock:async fn=>fn(),schedule:async()=>{}});
    vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{
      if(String(input).endsWith('/context'))return revoked?Response.json({}, {status:403}):Response.json({protocolVersion:1,principal:fixture.principal});
      const body=JSON.parse(String(init?.body));fetches++;
      if(failAsset&&body.assetId==='source-1')return Response.json({}, {status:503});
      return new Response(materialsPng,{headers:{'content-type':'image/png','content-length':String(materialsPng.length)}});
    }));
  });
  afterEach(()=>vi.unstubAllGlobals());
  const finish=async()=>{for(let i=0;i<5;i++){await service.tick();const receipt=await service.status(fixture.principal,fixture.submissionId);if(receipt.state!=='receiving')return receipt;}throw Error('did not finish');};
  it('accepts only after all copied assets and snapshot are durable, without generation or publication',async()=>{
    const first=await service.submit(fixture.principal,fixture);expect(first.state).toBe('receiving');expect((await store.list<Project>('projects'))).toHaveLength(0);
    const receipt=await finish();expect(receipt.state).toBe('accepted');expect(receipt.receivedMedia).toBe(2);expect(receipt.autoPublish).toBe(false);
    const p=await store.one<Project>('projects',receipt.projectId!);expect(p?.draft.products).toHaveLength(2);expect(p?.materials?.contentSha256).toBe(fixture.confirmation.contentSha256);expect(p?.publishedReleaseId).toBeUndefined();
    expect(p?.draft.materials?.imageBindings[0].assetId).toBeTruthy();expect((await store.list('jobs'))).toHaveLength(0);
    for(const asset of await store.list<any>('assets'))expect(asset.sha256).toBe(fixture.materials.media.find(media=>asset.id===`materials-${fixture.submissionId}-${fixture.materials.media.indexOf(media)}`)?.sha256);
    const replay=await service.submit(fixture.principal,fixture);expect(replay.projectId).toBe(p?.id);expect(fetches).toBe(2);
  });
  it('resumes a partial failed copy with the same ID and reuses verified media',async()=>{
    failAsset=true;await service.submit(fixture.principal,fixture);const failed=await finish();expect(failed.state).toBe('failed');expect(failed.receivedMedia).toBe(1);expect(failed.retryable).toBe(true);expect((await store.list('projects'))).toHaveLength(0);
    failAsset=false;await service.submit(fixture.principal,fixture);expect((await finish()).state).toBe('accepted');expect(fetches).toBe(3);
  });
  it('retains an accepted project and media when the final database response is uncertain',async()=>{
    const batch=store.batch.bind(store);vi.spyOn(store,'batch').mockImplementationOnce(async statements=>{await batch(statements);throw new ApiError(409,'response_lost','Database response lost after commit');});
    await service.submit(fixture.principal,fixture);const receipt=await finish();
    expect(receipt.state).toBe('accepted');
    const p=await store.one<Project>('projects',receipt.projectId!);expect(p).toBeTruthy();
    for(const asset of await store.list<any>('assets'))expect(objects.has(asset.key)).toBe(true);
  });
  it('does not let fifty retained failures starve a new receiving submission',async()=>{
    for(let i=0;i<50;i++)await store.remember('materials:failed',String(i),'same',{receipt:{state:'failed'},expiresAt:Date.now()+86400000}).run();
    await service.submit(fixture.principal,fixture);expect((await finish()).state).toBe('accepted');
  });
  it('rejects hash mismatches and changed submission identity without creating projects',async()=>{
    fixture.materials.media[0].sha256='0'.repeat(64);fixture.confirmation.contentSha256=await sha256(canonical({source:fixture.source,materials:fixture.materials}));await service.submit(fixture.principal,fixture);
    const receipt=await finish();expect(receipt.state).toBe('failed');expect(receipt.error?.code).toBe('media_hash_conflict');expect(receipt.retryable).toBe(false);
    fixture.target={mode:'create',name:'Changed'};await expect(service.submit(fixture.principal,fixture)).rejects.toMatchObject({status:409,code:'submission_payload_conflict'});
  });
  it('rechecks account access during background receiving and keeps ordinary projects untouched',async()=>{
    await expect(service.submit({...fixture.principal,email:'other@example.com'},fixture)).rejects.toMatchObject({status:403});
    await service.submit(fixture.principal,fixture);revoked=true;const receipt=await service.tick().then(()=>service.status(fixture.principal,fixture.submissionId));expect(receipt.state).toBe('failed');expect((await store.list('projects'))).toHaveLength(0);
  });
  it('preserves a newer project edit if an update finishes after expectedVersion changes',async()=>{
    await service.submit(fixture.principal,fixture);const first=await finish();const p=(await store.one<Project>('projects',first.projectId!))!;
    fixture.submissionId=crypto.randomUUID();fixture.source.revision=2;fixture.target={mode:'update',projectId:p.id,expectedVersion:p.version};fixture.confirmation.contentSha256=await sha256(canonical({source:fixture.source,materials:fixture.materials}));
    await service.submit(fixture.principal,fixture);p.version++;p.name='Edited meanwhile';await store.update('projects',p).run();
    const receipt=await finish();expect(receipt.state).toBe('failed');expect(receipt.error?.code).toBe('version_conflict');expect((await store.one<Project>('projects',p.id))?.name).toBe('Edited meanwhile');
  });
});
