import {typedMaterialsFixture} from './fixtures/materials-typed';
import {draftFromMaterials} from '../src/worker/materials-service';
import type {Asset} from '../src/shared/model';
import { newBanner } from '../src/shared/banner-config';
import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {parse, type DefaultTreeAdapterMap} from 'parse5';
import {defaultDraft,validateDraft} from '../src/worker/domain';
import {renderSite,renderSiteFiles} from '../src/templates';
import {plannedPages} from '../src/shared/site-brief';
import {lumiPages} from '../src/shared/lumi-pages';
import {getMaterialsTemplate} from '../src/templates/materials';
import {getTemplateGuide} from '../src/worker/template-guides/catalog';
import {materialsDemoDraft} from '../src/worker/template-guides/materials-demo';
import {currentMaterialsTemplate} from '../src/worker/template-guides/current-materials';
import {projectPreviewHtml,projectPreviewRuntimeForDraft} from '../src/worker/project-preview';
import {lumiImageInventory,lumiTextInventory} from '../src/templates/themes/lumi/materials-map';
const options={projectId:'customer',lang:'en' as const,page:'home',assetUrl:(id:string)=>`https://assets.example.test/${id}`,inquiryUrl:'https://app.example.test/api/inquiry'};
const draft=()=>({...defaultDraft(),template:'lumi-business' as const,company:{...defaultDraft().company,name:'Acme & Partners',email:'team@example.test',description:'We deliver approved consulting services.'},copy:{en:{headline:'Clarity for your team',subtitle:'Approved strategic guidance',about:'Company facts',cta:'Talk to us'}},products:[{id:'consulting',name:'Strategy Consulting',description:'Approved service description',imageAssetId:'service-main',material:'',dimensions:''}]});
const nodes=(node:DefaultTreeAdapterMap['node']):DefaultTreeAdapterMap['element'][]=>[...('tagName' in node?[node]:[]),...('childNodes'in node?node.childNodes.flatMap(nodes):[])];
describe('Lumi integrated reference template',()=>{
 it('registers every reference route and retains the exact reference demo identity',()=>{
  const d=validateDraft(draft());expect(plannedPages(d)).toEqual(lumiPages);
  const profile=getMaterialsTemplate('lumi-business')!;expect(profile).toMatchObject({materialsReady:true,imagePolicy:'typed-regions-v1',contractRevision:'2026-10-02.lumi-business-materials.1',guideRevision:'2026-10-02.1'});
  expect(currentMaterialsTemplate('lumi-business')).toMatchObject({contractRevision:'2026-10-03.lumi-business-materials.5',guideRevision:getTemplateGuide('lumi-business')!.revision});
  const demo=materialsDemoDraft(profile,'en');const html=renderSite(demo,{...options,projectId:'materials-demo',assetUrl:id=>id,preview:true});
  expect(html).toContain('Make');expect(html).toContain('strategy');expect(html).not.toContain('Example toy');expect(html).not.toContain('Use For Free');expect(html).not.toContain('framer.link');expect(html).not.toContain('framerusercontent.com');expect(html).not.toContain('__LUMI_');
  expect(profile.imageSlots.length).toBeGreaterThan(50);expect(profile.textSlots.length).toBeGreaterThan(500);
  expect(getMaterialsTemplate('lumi-business','invalid')).toBeUndefined();
 });
 it('exports complete routes and product details with local resources made public',()=>{
  const files=renderSiteFiles(draft(),{...options,publicBaseUrl:'https://public.example.test',preview:false});
  for(const p of lumiPages.filter(p=>p!=='detail'))expect(files[p==='home'?'en/index.html':`en/${p}/index.html`],p).toBeTruthy();
  const detail=files['en/products/consulting/index.html'];expect(detail).toContain('Approved service description');expect(detail).toContain('data-wr-product-id="consulting"');expect(detail).toContain('https://public.example.test/templates/lumi/');
  for(const[p,h]of Object.entries(files).filter(([p])=>p.startsWith('en/')&&p.endsWith('.html'))){expect(nodes(parse(h)).filter(n=>n.tagName==='h1').length,p).toBe(1);expect(h,p).not.toContain('__LUMI_');}
 });
 it('keeps reference claims in demo only and escapes project content',()=>{
  const d=draft();d.company.name='<script>alert(1)</script>';d.products[0].description='<img onerror=alert(1)>';
  const html=renderSite(d,options);expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');expect(html).not.toContain('<img onerror=');expect(html).not.toContain('$19/mo');expect(html).toContain('tailored proposal');expect(html).toContain('Talk to us');
 });
 it('applies confirmed text and image bindings to desktop, tablet and mobile variants',()=>{
  const d=draft(),profile=getMaterialsTemplate('lumi-business')!,image=lumiImageInventory.find(s=>s.page==='home')!,text=lumiTextInventory.find(s=>s.page==='home'&&s.exampleText.length>50)!;
  const materialDraft={...d,materials:{templateId:d.template,contractRevision:profile.contractRevision,visual:{palette:{primary:'#48a7ff',secondary:'#fff1e7',background:'#f9fbfd',surface:'#ffffff',text:'#1a3b50',mutedText:'#5b7182'},backgroundStyle:'soft-gradient',imageTreatment:'natural',compositionSummary:'Approved business image'},imageBindings:[{slotId:image.id,assetId:'desktop-image',mobileAssetId:'mobile-image',fit:'cover',focalPoint:{x:.5,y:.5},alt:{en:'Approved business photo'}}],textBindings:[{slotId:text.id,locale:'en',text:'Approved replacement copy',factReferences:[]}],omittedSectionIds:[]}};
  const html=renderSite(materialDraft as Parameters<typeof renderSite>[0],options);expect(html).toContain('https://assets.example.test/desktop-image');expect(html).toContain('https://assets.example.test/mobile-image');expect(html.match(/Approved replacement copy/g)?.length).toBeGreaterThanOrEqual(3);
 });
 it('rewrites private preview links and forms inside all responsive variants',()=>{
  const d=draft();const html=projectPreviewHtml(renderSite(d,{...options,preview:true}),'/api/projects/project','https://app.example.test',{page:'home',lang:'en',expectedVersion:2});
  expect(html).toContain('data-lumi-screen="mobile"');expect(html.match(/href="\/api\/projects\/project\/preview/g)?.length).toBeGreaterThan(20);expect(html).not.toContain('action="https://app.example.test/api/inquiry"');expect(projectPreviewRuntimeForDraft(d)).toContain('data-lumi-menu-toggle');
 });
 it('keeps page Banner overrides in all responsive layouts',()=>{
  const d={...draft(),banners:[{...newBanner('homepage',['home']),mode:'image' as const,slides:[{assetId:'hero-1',alt:'First hero'},{assetId:'hero-2',alt:'Second hero'}]}]};
  const html=renderSite(d,options);expect(html.match(/data-wr-banner="custom"/g)).toHaveLength(4);expect(html.match(/src="https:\/\/assets.example.test\/hero-1"/g)).toHaveLength(4);expect(html).toContain('data-wr-banner-next');expect(html).toContain('wr:banner-media-ready');
 });
 it('ships every original media file rather than fetching reference resources at runtime',()=>{
  const sources=JSON.parse(readFileSync('public/templates/lumi/sources.json','utf8'));expect(sources.assets.length).toBeGreaterThan(100);for(const s of sources.assets)expect(existsSync('public/templates/lumi/'+s.file),s.file).toBe(true);
 });
});


it('native confirmed Lumi content has no sample counter writers in any responsive variant', async () => {
 const input=await typedMaterialsFixture('lumi-business',2);
 const saved=draftFromMaterials(input,Object.fromEntries(input.materials.media.map(asset=>[asset.id,{id:asset.id} as Asset])));
 for(const page of ['home','catalog','detail','about','contact']) {
  const html=renderSite(saved,{...options,page,productId:'p1'});
  expect(html,page).not.toMatch(/\bdata-(?:counter|suffix|progress)="/);
  expect(html,page).not.toContain('data-wr-product-id="demo-');
  expect(html,page).toContain('wr-materials-site');
  expect(html,page).not.toMatch(/__WR_|__LUMI_/);
 }
});
