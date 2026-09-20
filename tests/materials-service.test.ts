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
  let failAsset=false,revoked=false,fetches=0,respond:((assetId:string)=>Promise<Response>)|undefined;
  const schedule=vi.fn(async(_time:number)=>{});
  let quotaExhausted=false,quotaCommitUnavailable=false;
  const websiteCalls:string[]=[];
  const websiteClaims=new Map<string,{projectId:string;reservationId:string;status:string}>();
  const objects=new Map<string,{bytes:Uint8Array;options:any}>();
  beforeEach(async()=>{
    fixture=await materialsFixture(2);failAsset=false;revoked=false;fetches=0;respond=undefined;objects.clear();schedule.mockClear();
    const db=testDb();await db.exec(readFileSync('migrations/0002_business.sql','utf8'));
    const bucket={async put(key:string,value:any,options:any){const bytes=typeof value==='string'?new TextEncoder().encode(value):new Uint8Array(value);objects.set(key,{bytes,options});},async get(key:string){const o=objects.get(key);return o?{size:o.bytes.length,httpMetadata:o.options?.httpMetadata,customMetadata:o.options?.customMetadata,arrayBuffer:async()=>o.bytes.buffer.slice(o.bytes.byteOffset,o.bytes.byteOffset+o.bytes.length),text:async()=>new TextDecoder().decode(o.bytes)}:null;},async head(key:string){return this.get(key);},async delete(key:string|string[]){for(const k of typeof key==='string'?[key]:key)objects.delete(k);}};
    env={DB:db,MEDIA:bucket,PRODUCT_RADAR_BASE_URL:'https://product.example.com',PRODUCT_RADAR_INTEGRATION_SECRET:'s'.repeat(40)}as unknown as AppEnv;
    store=new DomainStore(db);service=createService();
    websiteClaims.clear();websiteCalls.length=0;quotaExhausted=false;quotaCommitUnavailable=false;
    vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{
      if(String(input).includes('/website-quota/')){
        const body=JSON.parse(String(init?.body)),action=String(input).split('/').pop()!;websiteCalls.push(action);let row=websiteClaims.get(body.projectId);
        if(action==='reserve'&&quotaExhausted)return Response.json({message:'本月建站额度不足。'},{status:429});
        if(action==='commit'&&quotaCommitUnavailable)return Response.json({message:'暂时不可用。'},{status:503});
        if(action==='status'&&!row)return Response.json({message:'Missing'},{status:404});
        if(action==='reserve'&&(!row||row.status==='released')){row={projectId:body.projectId,reservationId:crypto.randomUUID(),status:'reserved'};websiteClaims.set(body.projectId,row);}
        if(action==='commit')row!.status='charged';
        if(action==='release'&&row?.status!=='charged')row!.status='released';
        return Response.json(row);
      }
      if(String(input).endsWith('/context'))return revoked?Response.json({}, {status:403}):Response.json({protocolVersion:1,principal:fixture.principal});
      const body=JSON.parse(String(init?.body));fetches++;
      if(respond)return respond(body.assetId);
      if(failAsset&&body.assetId==='source-1')return Response.json({}, {status:503});
      return new Response(materialsPng,{headers:{'content-type':'image/png','content-length':String(materialsPng.length)}});
    }));
  });
  afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});
  const createService=()=>{
    let serial:Promise<unknown>=Promise.resolve();
    return new MaterialsService(env,store,{lock:fn=>{const next=serial.then(fn,fn);serial=next.catch(()=>{});return next;},schedule});
  };
  const imageResponse=()=>new Response(materialsPng,{headers:{'content-type':'image/png','content-length':String(materialsPng.length)}});
  const deferred=()=>{let resolve!:(response:Response)=>void;const promise=new Promise<Response>(r=>{resolve=r;});return{promise,resolve};};
  const progress=()=>service.status(fixture.principal,fixture.submissionId);
  const finish=async()=>{for(let i=0;i<5;i++){await service.tick();const receipt=await service.status(fixture.principal,fixture.submissionId);if(receipt.state!=='receiving')return receipt;}throw Error('did not finish');};
  it('accepts only after all copied assets and snapshot are durable, without generation or publication',async()=>{
    const first=await service.submit(fixture.principal,fixture);expect(first.state).toBe('receiving');expect((await store.list<Project>('projects'))).toHaveLength(0);
    const receipt=await finish();expect(receipt.state).toBe('accepted');expect(receipt.receivedMedia).toBe(2);expect(receipt.autoPublish).toBe(false);
    expect(websiteCalls.filter(c=>c==='reserve')).toHaveLength(1);expect(websiteCalls.filter(c=>c==='commit')).toHaveLength(1);
    const p=await store.one<Project>('projects',receipt.projectId!);expect(p?.draft.products).toHaveLength(2);expect(p?.materials?.contentSha256).toBe(fixture.confirmation.contentSha256);expect(p?.publishedReleaseId).toBeUndefined();
    expect(p?.draft.materials?.imageBindings[0].assetId).toBeTruthy();expect((await store.list('jobs'))).toHaveLength(0);
    for(const asset of await store.list<any>('assets'))expect(asset.sha256).toBe(fixture.materials.media.find(media=>asset.id===`materials-${fixture.submissionId}-${fixture.materials.media.indexOf(media)}`)?.sha256);
    const replay=await service.submit(fixture.principal,fixture);expect(replay.projectId).toBe(p?.id);expect(fetches).toBe(2);
  });

  it('rejects exhausted creation before saving a materials snapshot or copying any media',async()=>{
    quotaExhausted=true;await expect(service.submit(fixture.principal,fixture)).rejects.toMatchObject({status:429,message:'本月网站创建额度已用完，请联系管理员调整账号或工作区额度。'});
    expect(objects.size).toBe(0);expect(fetches).toBe(0);expect(await store.list('projects')).toHaveLength(0);
  });
  it('keeps accepted media and resumes quota commit after an unavailable response',async()=>{
    await service.submit(fixture.principal,fixture);quotaCommitUnavailable=true;await service.tick();
    await expect(progress()).rejects.toMatchObject({status:503});expect(await store.list('projects')).toHaveLength(1);
    for(const asset of await store.list<any>('assets'))expect(objects.has(asset.key)).toBe(true);
    quotaCommitUnavailable=false;service=createService();expect(await progress()).toMatchObject({state:'accepted'});
    expect([...websiteClaims.values()][0].status).toBe('charged');expect(websiteCalls).not.toContain('release');
  });
  it('accepts ordinary accounts and keeps submissions and update targets isolated',async()=>{
    fixture.principal={...fixture.principal,email:'member@example.com',workspaceRole:'member'};
    await service.submit(fixture.principal,fixture);const receipt=await finish();
    expect(receipt.state).toBe('accepted');
    const project=(await store.one<Project>('projects',receipt.projectId!))!;
    expect(project.ownerId).toBe(fixture.principal.userId);expect(project.workspaceId).toBe(fixture.principal.workspaceId);
    for(const foreign of [{...fixture.principal,userId:'another-member'},{...fixture.principal,userId:'outside-admin',workspaceId:'another-workspace',workspaceRole:'admin' as const}]){
      await expect(service.status(foreign,fixture.submissionId)).rejects.toMatchObject({status:404});
      await expect(service.submit(foreign,{...fixture,principal:foreign,submissionId:crypto.randomUUID(),target:{mode:'update',projectId:project.id,expectedVersion:project.version}})).rejects.toMatchObject({status:404});
    }
    await expect(service.submit({...fixture.principal,userId:'forged'},fixture)).rejects.toMatchObject({status:403,code:'principal_mismatch'});
    expect(await store.list('projects')).toHaveLength(1);expect(await store.list('jobs')).toHaveLength(0);
  });
  it('keeps confirmed display groups through a source update and drops a group when its member is removed',async()=>{
    await service.submit(fixture.principal,fixture);const first=await finish();
    let project=(await store.one<Project>('projects',first.projectId!))!;
    expect(project.draft.productDisplayGroups).toBeUndefined();
    project.draft.productDisplayGroups=[['p0','p1']];await store.update('projects',project).run();
    for(const [revision,count]of [[2,2],[3,1]]){
      fixture.submissionId=crypto.randomUUID();fixture.source.revision=revision;fixture.target={mode:'update',projectId:project.id,expectedVersion:project.version};
      fixture.materials=(await materialsFixture(count)).materials;
      fixture.confirmation.contentSha256=await sha256(canonical({source:fixture.source,materials:fixture.materials}));
      await service.submit(fixture.principal,fixture);expect((await finish()).state).toBe('accepted');
      project=(await store.one<Project>('projects',project.id))!;
      expect(project.draft.productDisplayGroups).toEqual(count===2?[['p0','p1']]:undefined);
      expect(websiteCalls.filter(c=>c==='reserve')).toHaveLength(1);expect(websiteCalls.filter(c=>c==='commit')).toHaveLength(1);
      expect(project.draft.products).toHaveLength(count);
    }
  });
  it('resumes a partial failed copy with the same ID and reuses verified media',async()=>{
    failAsset=true;await service.submit(fixture.principal,fixture);const failed=await finish();expect(failed.state).toBe('failed');expect(failed.receivedMedia).toBe(1);expect(failed.retryable).toBe(true);expect((await store.list('projects'))).toHaveLength(0);
    failAsset=false;await service.submit(fixture.principal,fixture);expect((await finish()).state).toBe('accepted');expect(fetches).toBe(3);
  });
  it('copies multiple batches in one tick with at most four transfers and durable out-of-order progress',async()=>{
    fixture=await materialsFixture(8);
    const pending=new Map<string,ReturnType<typeof deferred>>();let active=0,peak=0;
    respond=async id=>{const gate=deferred();pending.set(id,gate);peak=Math.max(peak,++active);try{return await gate.promise;}finally{active--;}};
    await service.submit(fixture.principal,fixture);const tick=service.tick();expect(service.tick()).toBe(tick);
    await vi.waitFor(()=>expect(pending.size).toBe(4));expect((await store.list('projects'))).toHaveLength(0);
    for(const [index,id]of ['source-2','source-0','source-3'].entries()){
      pending.get(id)!.resolve(imageResponse());
      await vi.waitFor(async()=>expect((await progress()).receivedMedia).toBe(index+1));
    }
    expect(pending.size).toBe(4);expect((await progress()).state).toBe('receiving');
    pending.get('source-1')!.resolve(imageResponse());
    await vi.waitFor(()=>expect(pending.size).toBe(8));
    expect((await progress()).receivedMedia).toBe(4);expect((await store.list('projects'))).toHaveLength(0);
    for(const id of ['source-7','source-5','source-4','source-6'])pending.get(id)!.resolve(imageResponse());
    await tick;
    expect(await progress()).toMatchObject({state:'accepted',receivedMedia:8});expect(peak).toBe(4);expect(fetches).toBe(8);
    expect(await store.list('assets')).toHaveLength(8);expect(schedule).toHaveBeenCalledTimes(4); // Receiver plus quota reserve/commit recovery alarms.
  });
  it('settles retryable failures after concurrent successes and resumes them after receiver restart',async()=>{
    fixture=await materialsFixture(8);
    const pending=new Map<string,ReturnType<typeof deferred>>();
    respond=async id=>{if(id==='source-0')return Response.json({}, {status:503});const gate=deferred();pending.set(id,gate);return gate.promise;};
    await service.submit(fixture.principal,fixture);const tick=service.tick();
    await vi.waitFor(()=>expect(pending.size).toBe(3));
    for(const id of ['source-3','source-1'])pending.get(id)!.resolve(imageResponse());
    await vi.waitFor(async()=>expect(await progress()).toMatchObject({state:'receiving',receivedMedia:2}));
    pending.get('source-2')!.resolve(imageResponse());await tick;
    expect(await progress()).toMatchObject({state:'failed',retryable:true,receivedMedia:3});expect(fetches).toBe(4);
    expect(await store.list('projects')).toHaveLength(0);expect(objects.size).toBe(4);
    service=createService();respond=undefined;await service.submit(fixture.principal,fixture);await service.tick();
    expect(await progress()).toMatchObject({state:'accepted',receivedMedia:8});expect(fetches).toBe(9);
  });
  it('waits for in-flight writes before permanent cleanup and does not hide a conflict behind a transient error',async()=>{
    fixture=await materialsFixture(8);
    const pending=new Map<string,ReturnType<typeof deferred>>();
    respond=async id=>{if(id==='source-0')return Response.json({}, {status:503});const gate=deferred();pending.set(id,gate);return gate.promise;};
    const put=env.MEDIA.put.bind(env.MEDIA),write=deferred();let writing=false;
    vi.spyOn(env.MEDIA,'put').mockImplementation(async(...args:Parameters<typeof env.MEDIA.put>)=>{if(args[0].endsWith('-3')){writing=true;await write.promise;}return put(...args);});
    await service.submit(fixture.principal,fixture);const tick=service.tick();
    await vi.waitFor(()=>expect(pending.size).toBe(3));
    pending.get('source-1')!.resolve(Response.json({}, {status:409}));
    pending.get('source-2')!.resolve(imageResponse());pending.get('source-3')!.resolve(imageResponse());
    await vi.waitFor(async()=>{expect(writing).toBe(true);expect(await progress()).toMatchObject({state:'receiving',receivedMedia:1});});
    expect(objects.size).toBe(2);expect(fetches).toBe(4);expect(await store.list('projects')).toHaveLength(0);
    write.resolve(imageResponse());await tick;
    expect(await progress()).toMatchObject({state:'failed',retryable:false,receivedMedia:2});
    expect(objects.size).toBe(0);expect(await store.list('projects')).toHaveLength(0);expect(await store.list('assets')).toHaveLength(0);
  });
  it('bounds work per tick and resumes a large submission without refetching completed media',async()=>{
    for(let i=2;i<115;i++)fixture.materials.media.push({...fixture.materials.media[0],id:`m${i}`,sourceAssetId:`source-${i}`});
    fixture.confirmation.contentSha256=await sha256(canonical({source:fixture.source,materials:fixture.materials}));
    await service.submit(fixture.principal,fixture);await service.tick();
    const first=await progress();expect(first.state).toBe('receiving');expect(first.receivedMedia).toBeGreaterThan(4);expect(first.receivedMedia).toBeLessThan(115);
    expect(await store.list('projects')).toHaveLength(0);
    service=createService();expect((await finish()).state).toBe('accepted');expect(fetches).toBe(115);
  });
  it('stops starting new batches when the tick time budget is spent',async()=>{
    fixture=await materialsFixture(8);const started=Date.now();let now=started;
    vi.spyOn(Date,'now').mockImplementation(()=>now);
    respond=async()=>{now=started+60_000;return imageResponse();};
    await service.submit(fixture.principal,fixture);await service.tick();
    expect(await progress()).toMatchObject({state:'receiving',receivedMedia:4});expect(fetches).toBe(4);
    respond=undefined;await service.tick();expect((await progress()).state).toBe('accepted');
  });
  it('limits buffered bytes when several individually valid large images are pending',async()=>{
    const bytes=new Uint8Array(12*1024*1024);bytes.set(materialsPng);
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
    for(const media of fixture.materials.media){media.bytes=bytes.length;media.sha256=hash;}
    fixture.confirmation.contentSha256=await sha256(canonical({source:fixture.source,materials:fixture.materials}));
    const first=deferred();
    respond=async id=>id==='source-0'?first.promise:new Response(bytes,{headers:{'content-type':'image/png','content-length':String(bytes.length)}});
    await service.submit(fixture.principal,fixture);const tick=service.tick();
    await vi.waitFor(()=>expect(fetches).toBe(1));
    expect((await progress()).receivedMedia).toBe(0);
    first.resolve(new Response(bytes,{headers:{'content-type':'image/png','content-length':String(bytes.length)}}));await tick;
    expect(await progress()).toMatchObject({state:'accepted',receivedMedia:2});expect(fetches).toBe(2);
  });
  it('reuses a copied R2 object after its progress checkpoint is lost on receiver restart',async()=>{
    await service.submit(fixture.principal,fixture);
    const row=await env.DB.prepare("SELECT scope,result FROM idempotency WHERE scope LIKE 'materials:%' AND request_id=?").bind(fixture.submissionId).first<{scope:string;result:string}>();
    const operation=JSON.parse(row!.result),assetId=`materials-${fixture.submissionId}-0`;
    await env.MEDIA.put(`projects/${operation.projectId}/assets/${assetId}`,materialsPng,{httpMetadata:{contentType:'image/png'},customMetadata:{sha256:fixture.materials.media[0].sha256}});
    service=createService();await service.tick();
    expect(await progress()).toMatchObject({state:'accepted',receivedMedia:2});expect(fetches).toBe(1);expect(await store.list('assets')).toHaveLength(2);
  });
  it('rechecks revoked access after concurrent transfers and before accepting the project',async()=>{
    respond=async()=>{revoked=true;return imageResponse();};
    await service.submit(fixture.principal,fixture);await service.tick();
    expect(await progress()).toMatchObject({state:'failed',retryable:false,receivedMedia:2});
    expect(await store.list('projects')).toHaveLength(0);expect(await store.list('assets')).toHaveLength(0);expect(objects.size).toBe(0);
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
    fixture.principal={...fixture.principal,email:'member@example.com',workspaceRole:'member'};
    await service.submit(fixture.principal,fixture);revoked=true;const receipt=await service.tick().then(()=>service.status(fixture.principal,fixture.submissionId));expect(receipt.state).toBe('failed');expect((await store.list('projects'))).toHaveLength(0);
  });
  it('preserves a newer project edit if an update finishes after expectedVersion changes',async()=>{
    await service.submit(fixture.principal,fixture);const first=await finish();const p=(await store.one<Project>('projects',first.projectId!))!;
    fixture.submissionId=crypto.randomUUID();fixture.source.revision=2;fixture.target={mode:'update',projectId:p.id,expectedVersion:p.version};fixture.confirmation.contentSha256=await sha256(canonical({source:fixture.source,materials:fixture.materials}));
    await service.submit(fixture.principal,fixture);p.version++;p.name='Edited meanwhile';await store.update('projects',p).run();
    const receipt=await finish();expect(receipt.state).toBe('failed');expect(receipt.error?.code).toBe('version_conflict');expect((await store.one<Project>('projects',p.id))?.name).toBe('Edited meanwhile');
  });
});
