import { expect, it } from 'vitest';
import { ProductIdentitySchema } from '../src/shared/product-identity';
import { confirmedMaterialsSchema } from '../src/shared/materials';
import { getMaterialsTemplate } from '../src/templates/materials';
import { draftFromMaterials } from '../src/worker/materials-service';
import { materialsFixture } from './fixtures/materials';
import { validateDraft } from '../src/worker/domain';

const identity = {version:1 as const,family:'toy' as const,composition:'single' as const,packCount:1,packagingBox:'present' as const,subjectVisible:true,geometry:'concept' as const,parts:[],shape:'round hamster',colors:['orange'],features:['acorn']};
const multipackIdentity = { ...identity, composition: 'set' as const, packCount: 80,
 assortment: { distinctCount: 2, variants: [
  { name: 'Fox', quantity: 40, shape: 'seated fox', colors: ['orange', 'cream'], features: ['pointed ears'] },
  { name: 'Bear', quantity: 40, shape: 'round bear', colors: ['brown'], features: ['round ears'] },
 ] },
};
it.each([['legacy', identity], ['mixed multipack', multipackIdentity]] as const)('retains %s identity and source version through receipt, draft validation and reopening',async(_name, identity)=>{
 const submission=await materialsFixture();submission.materials.products[0].productIdentity=identity;
 const parsed=confirmedMaterialsSchema.parse(submission.materials);
 expect(parsed.products[0].productIdentity).toEqual(identity);
 const assets=Object.fromEntries(submission.materials.media.map(m=>[m.id,{id:m.id,projectId:"project",key:m.id,contentType:m.mimeType,size:m.bytes,filename:m.id,origin:"import" as const,createdAt:"2026-09-22T00:00:00Z"}]));
 const draft=draftFromMaterials(submission,assets);
 const saved=validateDraft(JSON.parse(JSON.stringify(draft)));
 expect(saved.products[0].productIdentity).toEqual(identity);
 expect(saved.products[0].identitySourceVersion).toBe(submission.materials.products[0].sourceVersion);
});
it('publishes applicability in a new version and preserves the frozen prior contract',()=>{
 const current=getMaterialsTemplate('apparel-fabric-banner')!;
 expect(current.contractRevision).toContain('materials.6');
 expect(current.productApplicability?.preferredFamilies).toEqual(['apparel']);
 expect(current.requiredCapabilities).toContain('product.identity.v1');
 const old=getMaterialsTemplate('apparel-fabric-banner','2026-09-22.apparel-fabric-banner-materials.4')!;
 expect(old.productApplicability).toBeUndefined();
 expect(old.requiredCapabilities).not.toContain('product.identity.v1');
 expect(ProductIdentitySchema.safeParse({...identity,packCount:5}).success).toBe(false);
});

it('validates the sender assortment contract without inferring legacy design counts',async()=>{
 expect(ProductIdentitySchema.parse(multipackIdentity)).toEqual(multipackIdentity);
 expect(ProductIdentitySchema.safeParse({...multipackIdentity,packCount:79}).success).toBe(false);
 expect(ProductIdentitySchema.safeParse({...multipackIdentity,assortment:{...multipackIdentity.assortment,distinctCount:3}}).success).toBe(false);
 expect(ProductIdentitySchema.parse({...identity,assortment:null}).assortment).toBeNull();
 expect(ProductIdentitySchema.parse(identity)).not.toHaveProperty('assortment');
 const submission=await materialsFixture();
 submission.materials.products[0].productIdentity={...multipackIdentity,packCount:79};
 expect(confirmedMaterialsSchema.safeParse(submission.materials).success).toBe(false);
});
