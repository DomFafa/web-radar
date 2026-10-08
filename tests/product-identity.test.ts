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
const denseAssortmentIdentity = {
 ...multipackIdentity,
 shape: 'Eight individually identifiable animal figures, each with its own sculpted ears, expression and body silhouette',
 features: ['Each animal has a different sculpted silhouette', 'Visible identifying details remain distinct across all eight designs'],
 assortment: { distinctCount: 8, variants: Array.from({ length: 8 }, (_, i) => ({
  name: `Animal design ${i + 1}`,
  quantity: 10,
  shape: 'Rounded seated body with individually sculpted ears, muzzle and short feet',
  colors: ['cream', 'warm orange', 'dark brown', 'pale yellow'],
  features: ['Distinctive ear shape and facial expression', 'Contrasting muzzle with clearly visible eyes', 'Separate tail and feet identify the animal'],
 })) },
};
const denseChineseAssortmentIdentity = {
 ...denseAssortmentIdentity,
 shape: '八款具有独立动物耳朵、表情、身体轮廓和尾巴造型的解压玩具',
 assortment: { distinctCount: 8, variants: denseAssortmentIdentity.assortment.variants.map((variant,i)=>({
  ...variant,name:`动物造型 ${i+1}`,shape:'圆润坐姿身体，具有独立塑造的耳朵、嘴部、短脚和尾巴，完整保留每个动物各自鲜明可见的轮廓特征',
  colors:['奶油色','暖橙色','深棕色','淡黄色'],
  features:['耳朵形状和面部表情各不相同，能够清楚区分每一个款式','对比色嘴部搭配清晰可见的眼睛，保留每款动物的识别特征','独立的尾巴和脚部造型构成对应动物特有的立体轮廓'],
 })) },
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
it.each([['English',denseAssortmentIdentity],['Chinese',denseChineseAssortmentIdentity]] as const)('retains a complete %s eight-design identity larger than the old budget through materials receipt and persisted draft reopening',async(_language,productIdentity)=>{
 const serialized=JSON.stringify(productIdentity);
 expect(serialized.length>1800||new TextEncoder().encode(serialized).length>4096).toBe(true);
 const submission=await materialsFixture();
 submission.materials.products[0].productIdentity=productIdentity;
 const parsed=confirmedMaterialsSchema.parse(submission.materials);
 expect(parsed.products[0].productIdentity).toEqual(productIdentity);
 const assets=Object.fromEntries(submission.materials.media.map(m=>[m.id,{id:m.id,projectId:'project',key:m.id,contentType:m.mimeType,size:m.bytes,filename:m.id,origin:'import' as const,createdAt:'2026-09-22T00:00:00Z'}]));
 const draft=draftFromMaterials({...submission,materials:parsed},assets);
 const reopened=validateDraft(JSON.parse(JSON.stringify(draft)));
 expect(reopened.products[0].productIdentity).toEqual(productIdentity);
 expect(reopened.products[0].identitySourceVersion).toBe(submission.materials.products[0].sourceVersion);
});
it('continues rejecting invalid assortment counts, per-field overflow and genuinely oversized serialized identities',()=>{
 expect(ProductIdentitySchema.safeParse({...denseAssortmentIdentity,packCount:79}).success).toBe(false);
 expect(ProductIdentitySchema.safeParse({...denseAssortmentIdentity,assortment:{...denseAssortmentIdentity.assortment,distinctCount:7}}).success).toBe(false);
 expect(ProductIdentitySchema.safeParse({...denseAssortmentIdentity,shape:'x'.repeat(121)}).success).toBe(false);
 expect(ProductIdentitySchema.safeParse({...denseAssortmentIdentity,assortment:{...denseAssortmentIdentity.assortment,variants:denseAssortmentIdentity.assortment.variants.map((variant,i)=>i===0?{...variant,features:['x'.repeat(49)]}:variant)}}).success).toBe(false);
 const oversized={...denseAssortmentIdentity,shape:'\u0000'.repeat(120),colors:Array(6).fill('\u0000'.repeat(32)),features:Array(4).fill('\u0000'.repeat(80)),parts:Array.from({length:6},()=>({name:'\u0000'.repeat(48),count:1,kind:'integral' as const})),assortment:{distinctCount:8,variants:Array.from({length:8},(_,i)=>({name:`${i}${'\u0000'.repeat(31)}`,quantity:10,shape:'\u0000'.repeat(80),colors:Array(4).fill('\u0000'.repeat(32)),features:Array(3).fill('\u0000'.repeat(48))}))}};
 expect(JSON.stringify(oversized).length).toBeGreaterThan(6000);
 const rejected=ProductIdentitySchema.safeParse(oversized);
 expect(rejected.success).toBe(false);
 expect(rejected.error?.issues.some(issue=>issue.code==='custom'&&issue.message.includes('budget'))).toBe(true);
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
