import {execFile} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {promisify} from 'node:util';
import {build} from 'esbuild';
import {parse,type DefaultTreeAdapterMap} from 'parse5';
import {describe,expect,it} from 'vitest';
import type {Asset} from '../src/shared/model';
import {renderSite} from '../src/templates';
import {getMaterialsTemplate,validateMaterialsPositions} from '../src/templates/materials';
import {materialsDraftForRenderer} from '../src/templates/materials-releases';
import {draftFromMaterials} from '../src/worker/materials-service';
import {typedMaterialsFixture} from './fixtures/materials-typed';
import baseline from './fixtures/senseng-about-v1-release-hashes.json';

const ids=['senseng-candy','senseng-video','senseng-nature'];
const revision=(id:string)=>`2026-10-03.${id}-materials.5`;
type Node=DefaultTreeAdapterMap['node'];
type Element=DefaultTreeAdapterMap['element'];
const elements=(node:Node):Element[]=>[...('tagName' in node?[node]:[]),...('childNodes' in node?node.childNodes.flatMap(elements):[])];
const attr=(node:Element,key:string)=>node.attrs.find(attribute=>attribute.name===key)?.value;
const options={projectId:'about-collection-test',lang:'en' as const,page:'about',assetUrl:(id:string)=>`/confirmed/${id}`,inquiryUrl:'/inquiry',preview:true};
async function fixture(id:string){
 const input=await typedMaterialsFixture(id,3,revision(id));
 const draft=draftFromMaterials(input,Object.fromEntries(input.materials.media.map(media=>[media.id,{id:media.id} as Asset])));
 return {input,draft};
}
describe.each(ids)('%s explicit About collection release',id=>{
 it('changes only the About lead meaning and required collection capability, preserving the old default',()=>{
  const old=getMaterialsTemplate(id,`2026-10-02.${id}-materials.1`)!;
  const current=getMaterialsTemplate(id,revision(id));expect(current).toBeDefined();
  expect(current!.guideRevision).toBe('2026-10-03.3');
  expect(getMaterialsTemplate(id)).toEqual(old);
  const before=old.imageSlots.find(slot=>slot.id==='about-primary-image')!,after=current!.imageSlots.find(slot=>slot.id===before.id)!;
  expect(before).toMatchObject({role:'facility',productScope:'none',sourcePolicy:'illustration',reusePolicy:'distinct-slot'});
  expect(after).toMatchObject({role:'collection',productScope:'all-products',sourcePolicy:'product-reference',reusePolicy:'generate-new',width:before.width,height:before.height,fit:before.fit,repeat:before.repeat});
  expect(current!.imageSlots.filter(slot=>slot.id!==before.id)).toEqual(old.imageSlots.filter(slot=>slot.id!==before.id));
  expect(current!.textSlots).toEqual(old.textSlots);expect(current!.selectionGroups).toEqual(old.selectionGroups);expect(current!.requiredCapabilities).toContain('image.collection.v1');expect(current!.requiredCapabilities).toContain('image.generate-new.v1');
  expect(after.composition).toMatch(/home|homepage/i);expect(after.mobileComposition).toMatch(/complete|entire/i);expect(after.mobileComposition).toMatch(/crop/i);
 });
 it('requires every selected product and rejects both shared home bytes and retained product bytes',async()=>{
  const {input}=await fixture(id),m=input.materials;expect(validateMaterialsPositions(m)).toEqual([]);
  const about=m.imageBindings.find(binding=>binding.slotId==='about-primary-image')!;
  expect(about.depictedProductIds).toEqual(m.products.map(p=>p.id));expect(about.productId).toBeUndefined();
  about.depictedProductIds=about.depictedProductIds!.slice(1);expect(validateMaterialsPositions(m).some(issue=>issue.code==='image_identity_mismatch')).toBe(true);about.depictedProductIds=m.products.map(p=>p.id);
  const homeSlot=getMaterialsTemplate(id,revision(id))!.imageSlots.find(slot=>slot.page==='home'&&slot.role==='collection')!;
  const home=m.imageBindings.find(binding=>binding.slotId===homeSlot.id)!;
  const aboutMedia=m.media.find(media=>media.id===about.mediaId)!;
  const originalSha=aboutMedia.sha256;aboutMedia.sha256=m.media.find(media=>media.id===home.mediaId)!.sha256;
  expect(validateMaterialsPositions(m).some(issue=>issue.code==='banner_composition_reused')).toBe(true);
  aboutMedia.sha256=originalSha;about.mediaId=m.products[0].primaryMediaId;
  expect(validateMaterialsPositions(m).some(issue=>issue.code==='generated_source_reused')).toBe(true);
 });
 it('renders its independent About binding and keeps responsive crop controls without changing the frozen layout',async()=>{
  const {input,draft}=await fixture(id);const original=structuredClone(draft);
  const about=draft.materials!.imageBindings.find(binding=>binding.slotId==='about-primary-image')!;
  const homeSlot=getMaterialsTemplate(id,revision(id))!.imageSlots.find(slot=>slot.page==='home'&&slot.role==='collection')!;
  const home=draft.materials!.imageBindings.find(binding=>binding.slotId===homeSlot.id)!;
  const html=renderSite(draft,options),nodes=elements(parse(html));
  const lead=nodes.find(node=>node.tagName==='img'&&attr(node,'data-wr-material-image')==='about-primary-image')!;
  expect(lead).toBeDefined();expect(attr(lead,'src')).toBe(`/confirmed/${about.assetId}`);expect(attr(lead,'src')).not.toBe(`/confirmed/${home.assetId}`);
  expect(html).not.toContain(`/confirmed/${home.assetId}`);
  const mapped=materialsDraftForRenderer(draft);expect(mapped.materials!.contractRevision).toBe(`2026-09-23.${id}-materials.6`);expect(mapped.materials!.imageBindings).toEqual(draft.materials!.imageBindings);
  if(id==='senseng-video')expect(html).toBe(renderSite(mapped,options));expect(draft).toEqual(original);
  const homeHtml=renderSite(draft,{...options,page:'home'});expect(homeHtml).toContain(`/confirmed/${home.assetId}`);expect(homeHtml).not.toContain(`/confirmed/${about.assetId}`);
  about.mobileAssetId='about-mobile';about.fit='contain';about.focalPoint={x:.35,y:.45};about.alt.en='Every approved product <together>';
  const mobileHtml=renderSite(draft,options),mobileNodes=elements(parse(mobileHtml));const photo=mobileNodes.find(node=>node.tagName==='img'&&attr(node,'data-wr-material-image')==='about-primary-image')!;
  expect(attr(photo,'style')).toContain('object-fit:contain');expect(attr(photo,'style')).toContain('object-position:35% 45%');expect(attr(photo,'alt')).toBe(about.alt.en);
  expect(mobileNodes.some(node=>node.tagName==='source'&&attr(node,'srcset')==='/confirmed/about-mobile'&&attr(node,'media')?.includes('max-width'))).toBe(true);
  expect(input.materials.imageBindings.find(binding=>binding.slotId==='about-primary-image')!.mediaId).toBe(about.assetId);
 });
});

it.each(['senseng-candy','senseng-nature'])('%s moves the unchanged caption outside the About photograph only in v5',async id=>{
 const {draft}=await fixture(id),mapped=materialsDraftForRenderer(draft);
 const previousNodes=elements(parse(renderSite(mapped,options))),previousImage=previousNodes.find(node=>attr(node,'data-wr-material-image')==='about-primary-image')!;
 const oldFrame=previousImage.parentNode as Element,oldCaption=oldFrame.childNodes.find(node=>'tagName' in node&&node.tagName==='div'&&attr(node,'style')?.includes('z-index:2')) as Element;
 expect(oldCaption).toBeDefined();
 const rendered=elements(parse(renderSite(draft,options))),image=rendered.find(node=>attr(node,'data-wr-material-image')==='about-primary-image')!,caption=rendered.find(node=>attr(node,'data-wr-about-collection-caption')!==undefined)!;
 expect(caption).toBeDefined();const imageFrame=image.parentNode as Element;expect(imageFrame).not.toBe(caption.parentNode);expect(imageFrame.parentNode).toBe(caption.parentNode);
 const panel=caption.parentNode as Element;expect(attr(panel,'data-wr-about-collection-panel')).toBe('');expect(panel.childNodes.indexOf(imageFrame)).toBeLessThan(panel.childNodes.indexOf(caption));
 const copy=(node:Node):string=>('value' in node?String(node.value):'childNodes' in node?node.childNodes.map(copy).join(''):'');expect(copy(caption)).toBe(copy(oldCaption));
 for(const page of ['home','catalog','detail','contact'])expect(renderSite(draft,{...options,page,productId:'p0'})).toBe(renderSite(mapped,{...options,page,productId:'p0'}));
 expect(renderSite(mapped,options)).not.toContain('data-wr-about-collection-caption');
});

it('freezes all three previous contracts, five rendered pages and preview runtime byte for byte',async()=>{
 const directory=await mkdtemp(resolve(tmpdir(),'senseng-about-preservation-'));
 try{
  const bundle=resolve(directory,'api.mjs');await build({entryPoints:['tests/fixtures/senseng-about-preservation.ts'],outfile:bundle,bundle:true,format:'esm',platform:'node',target:'node22',keepNames:true});
  const script=`const NativeDate=Date;globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-03T00:00:00Z']));}};const api=await import(${JSON.stringify(pathToFileURL(bundle).href)});console.log(JSON.stringify(await api.sensengAboutPreviousHashes()));`;
  const result=await promisify(execFile)(process.execPath,['--input-type=module','-e',script],{maxBuffer:1024*1024});expect(JSON.parse(result.stdout)).toEqual(baseline);
 }finally{await rm(directory,{recursive:true,force:true});}
},30_000);
