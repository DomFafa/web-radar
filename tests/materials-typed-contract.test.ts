import {describe,expect,it} from 'vitest';
import {confirmedMaterialsSchema,type MaterialsTemplateContract} from '../src/shared/materials';
import {materialsFixture} from './fixtures/materials';
import {validateTypedMaterials} from '../src/templates/materials-typed-validation';

async function typedFixture(){
  const m=(await materialsFixture(6)).materials;
  const profile:MaterialsTemplateContract={schemaVersion:'wr-template-materials-v1',templateId:'typed',guideRevision:'1',contractRevision:'1',materialsReady:true,pages:['home'],imagePolicy:'typed-regions-v1',selectionGroups:{scene:4,featured:6},textSlots:[],imageSlots:[],optionalSections:[],visualParameters:[],contentPolicy:'b2b-confirmed-facts-only'};
  m.displaySelection={sceneProductIds:m.products.slice(0,4).map(p=>p.id),featuredProductIds:m.products.map(p=>p.id)};
  m.imageBindings=[];
  m.media.forEach((media,i)=>media.sha256=(i+1).toString(16).padStart(64,'0'));
  const slot=(id:string,role:NonNullable<MaterialsTemplateContract['imageSlots'][number]['role']>,repeat:'once'|'per-product'|'per-selection',selectionGroup?:'scene'|'featured',maxProducts?:number)=>{
    profile.imageSlots.push({id,role,repeat,selectionGroup,maxProducts,page:'home',purpose:id,min:1,max:1,required:true,binding:'supported',sourcePolicy:role==='facility'?'illustration':'product-reference',width:1200,height:900,composition:'Known products only',mobileComposition:'Known products only',fit:'contain',allowedMimeTypes:['image/png']});
    const products=repeat==='per-selection'?m.products.filter(p=>m.displaySelection![selectionGroup==='scene'?'sceneProductIds':'featuredProductIds'].includes(p.id)):repeat==='per-product'?m.products.slice(0,maxProducts):[undefined];
    for(const product of products){
      const mediaId=id==='product-main'?product!.primaryMediaId:`${id}-${product?.id||'all'}`;
      if(!m.media.some(a=>a.id===mediaId))m.media.push({...m.media[0],id:mediaId,sha256:(m.media.length+1).toString(16).padStart(64,'0')});
      m.imageBindings.push({slotId:id,role,mediaId,...(product?{productId:product.id}:{}),depictedProductIds:role==='facility'?[]:role==='collection'?m.products.map(p=>p.id):[product!.id],...(role==='packaging'?{evidenceMediaIds:[product!.primaryMediaId]}:{}),fit:'contain',focalPoint:{x:.5,y:.5},alt:{en:id}});
    }
  };
  slot('product-main','main','per-product');slot('hero-one','collection','once');slot('hero-two','collection','once');slot('scene','scene','per-selection','scene');slot('front','front','per-selection','featured');slot('package','packaging','per-selection','featured');slot('factory','facility','once');slot('detail','detail','per-product',undefined,2);
  return{m,profile};
}

describe('typed region wire extensions',()=>{
  it('retains optional reusable brand facts and independent facility illustrations',async()=>{
    const m=(await materialsFixture()).materials;
    Object.assign(m.brand,{targetMarkets:'EU',customerTypes:'Distributors',cooperationProcess:'Confirm specifications, then request a sample'});
    Object.assign(m.imageBindings[0],{role:'facility',depictedProductIds:[]});
    const result=confirmedMaterialsSchema.safeParse(m);
    expect(result.success).toBe(true);
    if(result.success)expect(result.data.brand).toMatchObject({targetMarkets:'EU',customerTypes:'Distributors'});
  });
  it('allows template-declared groups up to the existing twenty-product limit',async()=>{
    const m=(await materialsFixture(8)).materials;
    m.displaySelection={sceneProductIds:m.products.map(p=>p.id),featuredProductIds:[]};
    expect(confirmedMaterialsSchema.safeParse(m).success).toBe(true);
  });
});

describe('common typed image policy',()=>{
  it('accepts six paired products, a smaller scene selection and independent factory imagery',async()=>{
    const{m,profile}=await typedFixture();expect(validateTypedMaterials(m,profile)).toEqual([]);
  });
  it('permits explicitly classified fronts to reuse the same product original',async()=>{
    const{m,profile}=await typedFixture();m.imageBindings.find(b=>b.slotId==='front'&&b.productId==='p0')!.mediaId='m0';
    expect(validateTypedMaterials(m,profile)).toEqual([]);
  });
  it.each(['selection','role','identity','packaging evidence','repeated banner','copied banner','scene and front','foreign main image','facility product','detail limit','duplicate target'])('rejects %s conflicts',async(kind)=>{
    const{m,profile}=await typedFixture(),first=(slot:string)=>m.imageBindings.find(b=>b.slotId===slot)!;
    if(kind==='selection')m.displaySelection!.featuredProductIds.pop();
    if(kind==='role')first('scene').role='front';
    if(kind==='identity')first('front').depictedProductIds=['p1'];
    if(kind==='packaging evidence')first('package').evidenceMediaIds=[];
    if(kind==='repeated banner')first('hero-two').mediaId=first('hero-one').mediaId;
    if(kind==='copied banner')m.media.find(a=>a.id===first('hero-two').mediaId)!.sha256=m.media.find(a=>a.id===first('hero-one').mediaId)!.sha256;
    if(kind==='scene and front')first('front').mediaId=first('scene').mediaId;
    if(kind==='foreign main image')first('front').mediaId='m1';
    if(kind==='facility product')first('factory').depictedProductIds=['p0'];
    if(kind==='detail limit')Object.assign(first('detail'),{productId:'p5',depictedProductIds:['p5']});
    if(kind==='duplicate target')m.imageBindings.push({...first('front')});
    expect(validateTypedMaterials(m,profile).length).toBeGreaterThan(0);
  });
});
