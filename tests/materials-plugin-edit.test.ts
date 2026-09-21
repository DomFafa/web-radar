import { describe, expect, it, vi } from 'vitest';
import type { Asset, Draft } from '../src/shared/model';
import releaseFixture from './fixtures/materials-plugin-release.json';
const release={...releaseFixture,contract:{...releaseFixture.contract,templateId:'senseng-clean',contractRevision:'test.alias.1'}};
vi.mock('../src/templates/materials-release-registry',async()=>{const fixture=(await import('./fixtures/materials-plugin-release.json')).default;return {additionalMaterialsReleases:[{...fixture,contract:{...fixture.contract,templateId:'senseng-clean',contractRevision:'test.alias.1'}}]};});
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { draftFromMaterials } from '../src/worker/materials-service';
import { preserveMaterialsEdit } from '../src/worker/materials-draft';

async function fixture(){
 const input=await typedMaterialsFixture('senseng-clean',1,'2026-09-20.senseng-clean-materials.2');
 input.materials.template={id:release.contract.templateId,guideRevision:release.contract.guideRevision,contractRevision:release.contract.contractRevision};
 for(const binding of input.materials.imageBindings)binding.slotId=Object.keys(release.imageSlotMap).find(key=>Reflect.get(release.imageSlotMap,key)===binding.slotId)!;
 for(const binding of input.materials.textBindings)binding.slotId=Object.keys(release.textSlotMap).find(key=>Reflect.get(release.textSlotMap,key)===binding.slotId)!;
 return draftFromMaterials(input,Object.fromEntries(input.materials.media.map(media=>[media.id,{id:media.id} as Asset])));
}
describe('editing a registered template with independent slot identities',()=>{
 it('initializes editor copy and About controls from the release bindings on receipt',async()=>{
  const draft=await fixture();
  expect(draft.copy.en?.headline).toBe('Confirmed wooden collection');
  expect(draft.company.aboutHeadline).toBe('Explore our collection');
  expect(draft.company.aboutImageAssetId).toBe('about-primary-image-all');
 });
 it('preserves new image slot identities while changing company and product source fields',async()=>{
  const previous=await fixture(),next=structuredClone(previous);next.company.name='Concurrent company edit';
  next.products[0].imageAssetId='replacement-primary';
  expect(()=>preserveMaterialsEdit(previous,next)).not.toThrow();
  const sourceSlot=release.contract.imageSlots.find(slot=>slot.materialSource==='product-primary')!.id;
  expect(next.materials!.imageBindings.find(binding=>binding.slotId===sourceSlot)?.assetId).toBe('replacement-primary');
  expect(next.materials!.imageBindings.some(binding=>['product-main','product-gallery'].includes(binding.slotId))).toBe(false);
 });
 it('applies existing editor copy and About controls through the explicit renderer map',async()=>{
  const previous=await fixture(),next=structuredClone(previous);
  next.copy.en!.headline='Edited collection title';next.company.aboutHeadline='Edited company title';next.company.aboutImageAssetId='replacement-about';
  preserveMaterialsEdit(previous,next);
  const mapped=(kind:'image'|'text',target:string)=>Object.keys(kind==='image'?release.imageSlotMap:release.textSlotMap).find(key=>Reflect.get(kind==='image'?release.imageSlotMap:release.textSlotMap,key)===target)!;
  expect(next.materials!.textBindings.find(binding=>binding.slotId===mapped('text','hero-headline'))?.text).toBe('Edited collection title');
  expect(next.materials!.textBindings.find(binding=>binding.slotId===mapped('text','about-headline'))?.text).toBe('Edited company title');
  expect(next.materials!.imageBindings.find(binding=>binding.slotId===mapped('image','about-primary-image'))?.assetId).toBe('replacement-about');
 });
});
