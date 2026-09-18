import{describe,expect,it}from'vitest';
import{materialsFixture}from'./fixtures/materials';
import{draftFromMaterials}from'../src/worker/materials-service';
import{defaultDraft,editDraft,publicAssetReferences}from'../src/worker/domain';
import type{Asset}from'../src/shared/model';
const draft=async()=>{const input=await materialsFixture();return draftFromMaterials(input,Object.fromEntries(input.materials.media.map(m=>[m.id,{id:m.id}as Asset])));};
describe('materials draft isolation',()=>{
  it('rejects forged materials on an ordinary draft and mismatched template revisions',async()=>{
    const d=await draft();expect(()=>editDraft(defaultDraft(),d)).toThrowError(/已确认/);
    expect(()=>editDraft(d,{...d,template:'senseng-clean'})).toThrowError(/匹配的模板/);
    const next=structuredClone(d);next.materials!.contractRevision='invented';expect(()=>editDraft(d,next)).toThrowError(/规范/);
  });
  it('preserves receipt-bound materials for older clients and applies current copy/color/product edits',async()=>{
    const d=await draft(),next=structuredClone(d);delete next.materials;
    next.copy.en!.headline='New approved headline';next.company.description='Edited brand description';next.brandColor='#224466';next.products[0].name='Edited product';
    const edited=editDraft(d,next);expect(edited.materials?.visual.palette.primary).toBe('#224466');expect(edited.materials?.textBindings.find(b=>b.slotId==='hero-headline')?.text).toBe('New approved headline');expect(edited.copy.en?.about).toBe('Edited brand description');expect(edited.products[0].name).toBe('Edited product');
  });
  it('rejects incomplete or oversized applied copy and includes bound media in publication',async()=>{
    const d=await draft(),next=structuredClone(d);next.materials!.textBindings=next.materials!.textBindings.filter(b=>b.slotId!=='home-seo-title');expect(()=>editDraft(d,next)).toThrowError(/校验/);
    const long=structuredClone(d);long.copy.en!.headline='x'.repeat(110);expect(()=>editDraft(d,long)).toThrowError(/hero-headline/);
    d.materials!.imageBindings[0].assetId='custom-banner';d.materials!.imageBindings[0].mobileAssetId='custom-mobile';expect(publicAssetReferences(d)).toEqual(expect.arrayContaining(['custom-banner','custom-mobile']));
  });
});
