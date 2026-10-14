import {expect,it} from 'vitest';
import {materialsSubmissionSchema} from '../src/shared/materials';
import {defaultDraft,validateDraft} from '../src/worker/domain';
import {draftFromMaterials} from '../src/worker/materials-service';
import {materialsFixture} from './fixtures/materials';
import type {Asset} from '../src/shared/model';
it.each([3,20,24])('retains all %i products in a confirmed materials receipt and the receiver draft',async count=>{
 const input=await materialsFixture(count);
 const parsed=materialsSubmissionSchema.parse(input);
 const assets=Object.fromEntries(input.materials.media.map(m=>[m.id,{id:`asset-${m.id}`} as Asset]));
 const draft=draftFromMaterials(parsed,assets);
 expect(draft.products.map(p=>p.id)).toEqual(input.materials.products.map(p=>p.id));
 expect(draft.products.map(p=>p.gallery?.map(g=>g.assetId))).toEqual(input.materials.products.map(p=>p.galleryMediaIds.map(id=>assets[id].id)));
});
it('rejects the twenty-fifth product at the materials and mutable-draft boundaries',async()=>{
 const input=await materialsFixture(25);expect(materialsSubmissionSchema.safeParse(input).success).toBe(false);
 const draft=defaultDraft();draft.products=input.materials.products.map(p=>({id:p.id,name:p.name,description:p.description,material:p.material,dimensions:p.dimensions}));
 expect(()=>validateDraft(draft)).toThrow();
});
it('retains 24 full eleven-image galleries with 33 website images and two brand assets',async()=>{
 const input=await materialsFixture(24),m=input.materials,original=m.media[0];
 for(const product of m.products){for(let i=1;i<=10;i++){const id=`${product.id}-gallery-${i}`;product.galleryMediaIds.push(id);m.media.push({...original,id,sourceAssetId:id});}}
 for(let i=0;i<35;i++){const id=`extra-${i}`;m.media.push({...original,id,sourceAssetId:id});}
 m.brand.logoMediaId='extra-33';m.brand.faviconMediaId='extra-34';
 expect(m.media).toHaveLength(299);
 const parsed=materialsSubmissionSchema.parse(input);
 const assets=Object.fromEntries(m.media.map(media=>[media.id,{id:`asset-${media.id}`} as Asset]));
 const draft=draftFromMaterials(parsed,assets);
 expect(draft.products).toHaveLength(24);expect(draft.products.every(p=>p.gallery?.length===11)).toBe(true);
 expect(draft.products[23].gallery?.map(g=>g.sourceImageId)).toEqual(m.products[23].galleryMediaIds);
 m.media.push({...original,id:'extra-35',sourceAssetId:'extra-35'},{...original,id:'extra-36',sourceAssetId:'extra-36'});
 expect(materialsSubmissionSchema.safeParse(input).success).toBe(false);
});
