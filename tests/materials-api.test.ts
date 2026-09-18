import {beforeEach,afterEach,describe,expect,it,vi} from 'vitest';
import {Hono}from'hono';
import {createTemplateGuidesApp}from'../src/worker/template-guides/api';
import {createIntegrationApp}from'../src/worker/integration';
import {materialsFixture}from'./fixtures/materials';
import type{AppEnv,HonoEnv}from'../src/worker/env';
import {templateMediaRequirements}from'../src/shared/template-media';

describe('materials guide account boundary',()=>{
  let env:AppEnv;let principal:Awaited<ReturnType<typeof materialsFixture>>['principal'];
  const app=new Hono<HonoEnv>().route('/api/internal/template-guides',createTemplateGuidesApp());
  beforeEach(async()=>{principal=(await materialsFixture()).principal;env={PRODUCT_RADAR_BASE_URL:'https://product.example.com',PRODUCT_RADAR_INTEGRATION_SECRET:'s'.repeat(40),APP_ORIGIN:'https://web-radar.net'}as AppEnv;
    vi.stubGlobal('fetch',vi.fn(async()=>Response.json({protocolVersion:1,principal})));});
  afterEach(()=>vi.unstubAllGlobals());
  const get=(p:string,headers={})=>app.request('https://web-radar.net/api/internal/template-guides/'+p,{headers:{'X-Web-Radar-Secret':'s'.repeat(40),'X-Product-Radar-User-Id':'materials-owner','X-Product-Radar-Workspace-Id':'materials-workspace',...headers}},env);
  it('allows the current permitted account and returns a complete demo with submission disabled',async()=>{
    const catalog=await get('materials/catalog');expect(catalog.status).toBe(200);
    const entries=(await catalog.json()as any).templates;
    expect(entries.filter((t:any)=>t.materialsReady).map((t:any)=>t.templateId).sort()).toEqual(Object.keys(templateMediaRequirements).sort());
    expect(entries.every((t:any)=>t.contractRevision===`2026-09-19.${t.templateId}-materials.1`&&t.guideRevision==='2026-09-19.1')).toBe(true);
    const req=await get('materials/juno-toys');expect(req.status).toBe(200);
    const p=await get('materials/juno-toys/preview?page=contact');expect(p.status).toBe(200);const b:any=await p.json();expect(/^<!doctype html>/i.test(b.html)).toBe(true);expect(b.html).toContain(' disabled');expect(b.assetBaseUrl).toBe('https://web-radar.net');
  });
  it('denies wrong account, forged identity, missing identity and bad secret',async()=>{
    principal.email='someone@example.com';expect((await get('materials/catalog')).status).toBe(403);
    principal.email='vc.ddom@gmail.com';principal.userId='someone';expect((await get('materials/catalog')).status).toBe(403);
    expect((await get('materials/catalog',{'X-Product-Radar-User-Id':''})).status).toBe(400);
    expect((await get('materials/catalog',{'X-Web-Radar-Secret':'wrong'})).status).toBe(401);
  });
  it('does not grant the integration secret access to legacy template guides',async()=>{
    expect((await get('juno-toys')).status).toBe(401);
  });
  it('reads and previews exact legacy contracts while the catalog advertises typed regions',async()=>{
    const legacy='2026-09-17.juno-materials.2';
    const response=await get(`materials/juno-toys?contractRevision=${legacy}`);
    expect((await response.json()as any).contractRevision).toBe(legacy);
    const preview=await get(`materials/juno-toys/preview?contractRevision=${legacy}`);
    const body=await preview.json()as any;expect(body.contractRevision).toBe(legacy);expect(body.html).not.toContain('data-wr-display-role');
    expect((await get('materials/juno-toys?contractRevision=unknown')).status).toBe(404);
    expect((await get('materials/juno-toys/preview?contractRevision=unknown')).status).toBe(404);
    for(const[id,revision]of [['juno-toys','2026-09-18.juno-materials.3'],['senseng-clean','2026-09-17.senseng-clean-materials.1'],['senseng-video','2026-09-17.senseng-video-materials.2']]){
      const old=await get(`materials/${id}/preview?contractRevision=${revision}`);expect(old.status).toBe(200);expect((await old.json()as any).contractRevision).toBe(revision);
    }
  });
  it.each(Object.keys(templateMediaRequirements))('serves all five labelled, non-publishing previews for %s',async id=>{
    const requirements=await get(`materials/${id}`);expect(requirements.status).toBe(200);
    expect((await requirements.json()as any).imagePolicy).toBe('typed-regions-v1');
    for(const page of ['home','catalog','detail','about','contact']){
      const response=await get(`materials/${id}/preview?page=${page}`);expect(response.status,`${id}:${page}`).toBe(200);
      const body=await response.json()as any;expect(body.demo).toBe(true);expect(body.html.includes('Example Brand')).toBe(true);
      if(page==='contact')expect(body.html.includes(' disabled')).toBe(true);
    }
  });
  it('previews the B2B materials branch without retail prices or fabricated testimonials',async()=>{
    const response=await get('materials/juno-toys/preview?page=home');const {html}=await response.json()as any;
    expect(html.includes('wr-materials-site')).toBe(true);
    expect(html.includes('Request product details')).toBe(true);
    for(const old of ['Shop now','Shop Now','Buy now','320.00','Mandy Mathers','Best Prices'])expect(html.includes(old)).toBe(false);
  });
  it('enforces the current account on submission and status before forwarding any mutation',async()=>{
    const integration=createIntegrationApp(),input=await materialsFixture();let forwarded=0;
    env.PRODUCT_RADAR_PARENT_ORIGINS=input.parentOrigin;
    env.COORDINATOR={getByName:()=>({fetch:async()=>{forwarded++;return Response.json({state:'receiving'},{status:202});}})}as unknown as AppEnv['COORDINATOR'];
    const post=(path:string,body:unknown,secret='s'.repeat(40))=>integration.request('https://web-radar.net'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Web-Radar-Secret':secret},body:JSON.stringify(body)},env);
    const status=`/materials-submissions/${input.submissionId}/status`;
    expect((await post('/materials-submissions',input,'wrong')).status).toBe(401);
    principal.email='other@example.com';
    expect((await post('/materials-submissions',input)).status).toBe(403);
    expect((await post(status,{principal:input.principal})).status).toBe(403);expect(forwarded).toBe(0);
    principal.email='vc.ddom@gmail.com';
    expect((await post('/materials-submissions',{...input,parentOrigin:'https://evil.example'})).status).toBe(403);
    expect((await post('/materials-submissions',input)).status).toBe(202);
    expect((await post(status,{principal:input.principal})).status).toBe(202);expect(forwarded).toBe(2);
  });
});
