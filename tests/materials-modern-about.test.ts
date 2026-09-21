import {describe,expect,it} from 'vitest';
import {createHash} from 'node:crypto';
import {getMaterialsTemplate,validateMaterialsPositions} from '../src/templates/materials';
import {templateMediaRequirements} from '../src/shared/template-media';
import {typedMaterialsFixture} from './fixtures/materials-typed';
import {draftFromMaterials} from '../src/worker/materials-service';
import {preserveMaterialsEdit} from '../src/worker/materials-draft';
import {renderSite} from '../src/templates';
import type {Asset} from '../src/shared/model';
import manifest from '../docs/materials-requirements/typed-2026-09-19.json';
import currentManifest from '../docs/materials-requirements/typed-2026-09-20.json';

const templates=Object.keys(templateMediaRequirements);
describe('versioned modern About materials',()=>{
 it.each(templates)('%s keeps both published contract revisions immutable',id=>{
  const old=getMaterialsTemplate(id,`2026-09-19.${id}-materials.1`)!;
  expect(createHash('sha256').update(JSON.stringify(old)).digest('hex')).toBe(manifest.templates[id as keyof typeof manifest.templates].sha256);
  const current=getMaterialsTemplate(id,`2026-09-20.${id}-materials.2`)!;
  expect(createHash('sha256').update(JSON.stringify(current)).digest('hex')).toBe(currentManifest.templates[id as keyof typeof currentManifest.templates].sha256);
  expect(current.contractRevision).toBe(`2026-09-20.${id}-materials.2`);
  for(const slotId of ['about-headline','about-story','about-highlights'])expect(current.textSlots.some(s=>s.id===slotId&&s.page==='about'),slotId).toBe(true);
  expect(current.imageSlots.find(s=>s.id==='about-primary-image')).toMatchObject({page:'about',role:'facility',sourcePolicy:'illustration'});
  expect(current.imageSlots.some(s=>s.id==='about-secondary-image')).toBe(id==='senseng-clean'||id==='senseng-video');
 });
 it.each(templates)('%s maps confirmed About content and images into its modern page',async id=>{
  const input=await typedMaterialsFixture(id,2),m=input.materials;
  const values:Record<string,string>={'about-headline':'Our confirmed collection','about-story':'We supply wooden products for retail buyers.','about-highlights':'✓ | Retail buyers | Discuss your assortment'};
  for(const b of m.textBindings)if(values[b.slotId])b.text=values[b.slotId];
  expect(validateMaterialsPositions(m)).toEqual([]);
  const assets=Object.fromEntries(m.media.map(media=>[media.id,{id:`imported-${media.id}`} as Asset]));
  const draft=draftFromMaterials(input,assets);
  expect(draft.company).toMatchObject({aboutHeadline:values['about-headline'],aboutStory:values['about-story'],aboutHighlights:values['about-highlights']});
  const primary=m.imageBindings.find(b=>b.slotId==='about-primary-image')!;
  expect(draft.company.aboutImageAssetId).toBe(assets[primary.mediaId].id);
  const html=renderSite(draft,{projectId:'modern',lang:'en',page:'about',assetUrl:id=>`/confirmed/${id}`,inquiryUrl:'/inquiry',preview:true});
  expect(html).toContain('data-wr-modern-about');
  expect(html).toContain('wr-modern-about-responsive');
  expect(html).toContain('data-wr-material-image="about-primary-image"');
  expect(html).toContain(`/confirmed/${assets[primary.mediaId].id}`);
  expect(html).toContain(values['about-headline']);expect(html).toContain(values['about-story']);expect(html).toContain('Retail buyers');
  expect(html).not.toMatch(/__WR_|data-counter=|data-progress=|50,000|1,500,000|EN71|ASTM F963|CPSIA|Deployed Neural Agents|products\/senseng-\d+|Adults Squishy|Kids Squishy Pack/);
 });
});

it.each(['', 'Retail buyers', '✓ | | Ask us', '✓ | Buyers | Ask us | Extra', Array(5).fill('✓ | Buyers | Ask us').join('\n')])('rejects invalid About highlights on receipt: %s',async text=>{
 const input=await typedMaterialsFixture('senseng-clean',1);
 input.materials.textBindings.find(b=>b.slotId==='about-highlights')!.text=text;
 expect(validateMaterialsPositions(input.materials).some(i=>i.code==='invalid_about_highlights')).toBe(true);
});
it('preserves About edits, translates bound copy, and renders mobile image variants',async()=>{
 const input=await typedMaterialsFixture('senseng-clean',1),m=input.materials;
 const assets=Object.fromEntries(m.media.map(media=>[media.id,{id:media.id} as Asset]));
 const before=draftFromMaterials(input,assets),next=structuredClone(before);
 next.company.aboutHeadline='Changed headline';next.company.aboutStory='Changed company story';next.company.aboutHighlights='✓ | Buyer support | Discuss product options';
 next.company.aboutImageAssetId='replacement-about';
 preserveMaterialsEdit(before,next);
 expect(next.materials!.textBindings.find(b=>b.slotId==='about-headline')!.text).toBe('Changed headline');
 expect(next.materials!.imageBindings.find(b=>b.slotId==='about-primary-image')!.assetId).toBe('replacement-about');
 next.materials!.imageBindings.find(b=>b.slotId==='about-primary-image')!.mobileAssetId='mobile-about';
 next.materials!.textBindings.push(...next.materials!.textBindings.map(b=>({...b,locale:'es' as const,text:b.slotId==='about-headline'?'Colección para tiendas':b.text})));
 const html=renderSite(next,{projectId:'modern',lang:'es',page:'about',assetUrl:id=>`/confirmed/${id}`,inquiryUrl:'/inquiry',preview:true});
 expect(html).toContain('Colección para tiendas');expect(html).not.toContain('Changed headline');
 expect(html).toContain('/confirmed/replacement-about');expect(html).toContain('/confirmed/mobile-about');
});

it('retains primary and secondary identities even when they share an asset',async()=>{
 const input=await typedMaterialsFixture('senseng-clean',1),m=input.materials;
 const d=draftFromMaterials(input,Object.fromEntries(m.media.map(a=>[a.id,{id:a.id}as Asset])));
 const primary=d.materials!.imageBindings.find(b=>b.slotId==='about-primary-image')!,secondary=d.materials!.imageBindings.find(b=>b.slotId==='about-secondary-image')!;
 secondary.assetId=primary.assetId;secondary.alt.en='Secondary process view';
 const html=renderSite(d,{projectId:'modern',lang:'en',page:'about',assetUrl:id=>`/confirmed/${id}`,inquiryUrl:'/inquiry',preview:true});
 expect(html).toContain('data-wr-material-image="about-secondary-image"');expect(html).toContain('Secondary process view');expect(html).not.toContain('__WR_ABOUT__');
});

it.each(['about-headline','about-story'])('rejects blank %s before sample fallback can render',async slotId=>{
 const input=await typedMaterialsFixture('senseng-clean',1);input.materials.textBindings.find(b=>b.slotId===slotId)!.text='  ';
 expect(validateMaterialsPositions(input.materials).some(i=>i.code==='empty_about_copy')).toBe(true);
});
it('requires a replacement for a required About image when editing',async()=>{
 const input=await typedMaterialsFixture('senseng-clean',1),m=input.materials;
 const before=draftFromMaterials(input,Object.fromEntries(m.media.map(a=>[a.id,{id:a.id}as Asset]))),next=structuredClone(before);
 next.company.aboutImageAssetId='';expect(()=>preserveMaterialsEdit(before,next)).toThrow(/About/);
});
