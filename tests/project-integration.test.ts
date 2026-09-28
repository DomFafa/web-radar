import { beforeEach, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { HonoEnv } from '../src/worker/env';
import { registerProjectIntegration } from '../src/worker/project-integration';
vi.mock('../src/worker/materials-auth', () => ({verifyMaterialsSecret:vi.fn(async()=>{}),currentMaterialsPrincipal:vi.fn(async(_env,identity)=>({...identity,systemRole:'user',workspaceRole:'member'}))}));
let app:Hono<HonoEnv>;
const forwarded:Request[]=[];
const env={COORDINATOR:{getByName:()=>({fetch:async(request:Request)=>{forwarded.push(request);return Response.json({ok:true});}})}};
beforeEach(()=>{forwarded.length=0;app=new Hono<HonoEnv>();app.onError((error,c)=>c.json({message:error.message},('status'in error?error.status:500) as 400));registerProjectIntegration(app);});
const send=(action:string,body:Record<string,unknown>)=>app.request(`https://web.example/projects/11111111-1111-4111-8111-111111111111/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({principal:{userId:'owner',workspaceId:'workspace'},...body})},env);
it('forwards fixed-version preview and asset POST contracts as read-only coordinator GET requests',async()=>{
  expect((await send('preview',{expectedVersion:7,proxyBasePath:'/api/web-radar/projects/example'})).status).toBe(200);
  expect((await send('assets/image-1',{expectedVersion:7})).status).toBe(200);
  expect((await send('status',{expectedVersion:7})).status).toBe(200);
  expect(forwarded.map(request=>request.method)).toEqual(['GET','GET','GET']);
  expect(forwarded.map(request=>new URL(request.url).searchParams.get('expectedVersion'))).toEqual(['7','7','7']);
  expect(new URL(forwarded[1].url).pathname).toContain('/assets/image-1');
});
it.each([0,-1,1.5,'7'])('rejects invalid archived asset version %s',async version=>{
  expect((await send('assets/image-1',{expectedVersion:version})).status).toBe(400);expect(forwarded).toHaveLength(0);
});
it('keeps current unversioned asset reads compatible',async()=>{
  expect((await send('assets/image-1',{})).status).toBe(200);expect(new URL(forwarded[0].url).searchParams.has('expectedVersion')).toBe(false);
});
