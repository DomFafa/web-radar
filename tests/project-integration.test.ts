import { beforeEach, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { HonoEnv } from '../src/worker/env';
import { registerProjectIntegration } from '../src/worker/project-integration';
import { readProjectServiceStatus, readProjectServiceStatusBatch } from '../src/worker/project-service-status';
import { currentMaterialsPrincipal, verifyMaterialsSecret } from '../src/worker/materials-auth';
vi.mock('../src/worker/materials-auth', () => ({verifyMaterialsSecret:vi.fn(async()=>{}),currentMaterialsPrincipal:vi.fn(async(_env,identity)=>({...identity,systemRole:'user',workspaceRole:'member'}))}));
vi.mock('../src/worker/project-service-status', () => ({readProjectServiceStatus:vi.fn(async()=>Response.json({ok:true})),readProjectServiceStatusBatch:vi.fn(async()=>Response.json({schemaVersion:'wr-project-status-batch-v1',items:[]}))}));
let app:Hono<HonoEnv>;
const forwarded:Request[]=[];
const env={COORDINATOR:{getByName:()=>({fetch:async(request:Request)=>{forwarded.push(request);return Response.json({ok:true});}})}};
beforeEach(()=>{vi.clearAllMocks();forwarded.length=0;app=new Hono<HonoEnv>();app.onError((error,c)=>c.json({message:error.message},('status'in error?error.status:500) as 400));registerProjectIntegration(app);});
const send=(action:string,body:Record<string,unknown>)=>app.request(`https://web.example/projects/11111111-1111-4111-8111-111111111111/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({principal:{userId:'owner',workspaceId:'workspace'},...body})},env);
it('forwards fixed-version preview and asset POST contracts as read-only coordinator GET requests',async()=>{
  expect((await send('preview',{expectedVersion:7,proxyBasePath:'/api/web-radar/projects/example'})).status).toBe(200);
  expect((await send('assets/image-1',{expectedVersion:7})).status).toBe(200);
  expect(forwarded.map(request=>request.method)).toEqual(['GET','GET']);
  expect(forwarded.map(request=>new URL(request.url).searchParams.get('expectedVersion'))).toEqual(['7','7']);
  expect(new URL(forwarded[1].url).pathname).toContain('/assets/image-1');
});
it('dispatches only the two status reads directly with the validated version and job options',async()=>{
  const jobId='22222222-2222-4222-8222-222222222222';
  for(const [action,options] of [['status',{expectedVersion:7}],['publication-status',{jobId}]] as const){
    const response=await send(action,options);expect(response.status).toBe(200);
    expect(response.headers.get('Server-Timing')).toContain('wr-status-direct;dur=');
    expect(response.headers.get('Server-Timing')).not.toContain('wr-coordinator');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  }
  expect(forwarded).toHaveLength(0);
  const calls=vi.mocked(readProjectServiceStatus).mock.calls;
  expect(calls.map(call=>call[3])).toEqual(['status','publication-status']);
  expect(calls[0][4].get('expectedVersion')).toBe('7');expect(calls[1][4].get('jobId')).toBe(jobId);
});
it('keeps publication mutations on the coordinator',async()=>{
  const body={requestId:'test-request',expectedVersion:7};
  expect((await send('publish',body)).status).toBe(200);
  expect((await send('refresh-publication',{...body,expectedPublishedReleaseId:'22222222-2222-4222-8222-222222222222'})).status).toBe(200);
  expect(forwarded.map(request=>request.method)).toEqual(['POST','POST']);
  expect(await forwarded[0].json()).toEqual(body);expect(readProjectServiceStatus).not.toHaveBeenCalled();
});
it.each([0,-1,1.5,'7'])('rejects invalid archived asset version %s',async version=>{
  expect((await send('assets/image-1',{expectedVersion:version})).status).toBe(400);expect(forwarded).toHaveLength(0);
});
it('keeps current unversioned asset reads compatible',async()=>{
  expect((await send('assets/image-1',{})).status).toBe(200);expect(new URL(forwarded[0].url).searchParams.has('expectedVersion')).toBe(false);
});
const batch=(body:Record<string,unknown>)=>app.request('https://web.example/projects/status-batch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({principal:{userId:'owner',workspaceId:'workspace'},...body})},env);
const batchIds=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'];
it('dispatches a bounded status batch once with one outer principal and no coordinator call',async()=>{
  const response=await batch({projectIds:batchIds});
  expect(response.status).toBe(200);
  expect(readProjectServiceStatusBatch).toHaveBeenCalledExactlyOnceWith(env,{userId:'owner',workspaceId:'workspace',systemRole:'user',workspaceRole:'member'},batchIds);
  expect(verifyMaterialsSecret).toHaveBeenCalledTimes(1);expect(currentMaterialsPrincipal).toHaveBeenCalledTimes(1);
  expect(forwarded).toEqual([]);expect(readProjectServiceStatus).not.toHaveBeenCalled();
  expect(response.headers.get('Cache-Control')).toBe('no-store');expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  expect(response.headers.get('Server-Timing')).toMatch(/wr-auth;dur=[\d.]+, wr-status-direct;dur=[\d.]+/);
});
it.each([
  {projectIds:[]}, {projectIds:Array.from({length:25},()=>crypto.randomUUID())}, {projectIds:[batchIds[0],batchIds[0]]},
  {projectIds:['not-a-uuid']}, {projectIds:batchIds,expectedVersion:1}, {projectIds:batchIds,jobId:batchIds[0]},
  {projectIds:batchIds,principal:{userId:'owner',workspaceId:'workspace',systemRole:'super_admin'}},
  {projectIds:[{id:batchIds[0],workspaceId:'other'}]},
])('rejects an invalid status batch before live identity or project reads: %j',async body=>{
  expect((await batch(body)).status).toBe(400);
  expect(verifyMaterialsSecret).toHaveBeenCalledTimes(1);expect(currentMaterialsPrincipal).not.toHaveBeenCalled();
  expect(readProjectServiceStatusBatch).not.toHaveBeenCalled();expect(forwarded).toEqual([]);
});
it('retains the 4 KiB body limit for status batches',async()=>{
  expect((await batch({projectIds:batchIds,extra:'x'.repeat(4096)})).status).toBe(413);
  expect(currentMaterialsPrincipal).not.toHaveBeenCalled();expect(readProjectServiceStatusBatch).not.toHaveBeenCalled();
});
