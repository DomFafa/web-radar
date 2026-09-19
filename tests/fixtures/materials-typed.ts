import type {MaterialsSubmission} from '../../src/shared/materials';
import {getMaterialsTemplate} from '../../src/templates/materials';
import {canonical,sha256} from '../../src/worker/http';
import {materialsFixture,materialsPng} from './materials';

/** Synthetic references for contract tests; no customer data or network downloads. */
export async function typedMaterialsFixture(templateId:string,productCount=5,contractRevision?:string):Promise<MaterialsSubmission>{
  const input=await materialsFixture(productCount),m=input.materials,p=getMaterialsTemplate(templateId,contractRevision)!;
  m.template={id:templateId,guideRevision:p.guideRevision,contractRevision:p.contractRevision};
  m.brand={...m.brand,targetMarkets:'United States',customerTypes:'Retail buyers',cooperationProcess:'Confirm specifications and request a sample'};
  m.displaySelection={sceneProductIds:m.products.slice(0,p.selectionGroups?.scene||0).map(p=>p.id),featuredProductIds:m.products.slice(0,p.selectionGroups?.featured||0).map(p=>p.id)};
  m.media=[];
  const addMedia=async(id:string,width=1200,height=1200)=>{
    if(m.media.some(a=>a.id===id))return id;
    const bytes=Buffer.concat([materialsPng,Buffer.from(id)]);
    const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
    m.media.push({id,sourceAssetId:`test-${id}`,sourceVersion:'1',sha256:digest,mimeType:'image/png',bytes:bytes.length,width,height});return id;
  };
  for(const product of m.products){await addMedia(product.primaryMediaId);product.galleryMediaIds.push(await addMedia(`gallery-${product.id}`));}
  m.imageBindings=[];
  for(const slot of p.imageSlots){
    const targets:Array<{productId?:string;itemIndex?:number}>=slot.repeat==='per-product-gallery'?m.products.map(product=>({productId:product.id,itemIndex:1})):slot.repeat==='per-product'?m.products.slice(0,slot.maxProducts).map(product=>({productId:product.id})):slot.repeat==='per-selection'?m.displaySelection[slot.selectionGroup==='scene'?'sceneProductIds':'featuredProductIds'].map(productId=>({productId})):slot.role&&['scene','front','packaging','main','detail'].includes(slot.role)?[{productId:m.products[0].id}]:[{}];
    for(const target of targets){
      const product=m.products.find(p=>p.id===target.productId);
      const mediaId=slot.id==='product-main'?product!.primaryMediaId:slot.id==='product-gallery'?product!.galleryMediaIds[1]:await addMedia(`${slot.id}-${target.productId||'all'}`,slot.width,slot.height);
      m.imageBindings.push({slotId:slot.id,...target,mediaId,fit:slot.fit,focalPoint:{x:.5,y:.5},alt:{en:`Confirmed ${slot.role||'original product'} image`},...(slot.role?{role:slot.role,depictedProductIds:slot.role==='collection'?m.products.map(p=>p.id):product?[product.id]:[]}:{}),...(slot.role==='packaging'?{evidenceMediaIds:[product!.galleryMediaIds[1]]}:{})});
    }
  }
  const core:Record<string,string>={'about-headline':'Explore our collection','about-story':'Discuss product options and your assortment with our team.','about-highlights':'✓ | Product options | Discuss your assortment','hero-headline':'Confirmed wooden collection','hero-subtitle':'Explore these confirmed wooden products','primary-cta':'Request product details','company-about':m.brand.description};
  m.textBindings=p.textSlots.map((slot,i)=>({slotId:slot.id,locale:'en',text:[...(core[slot.id]||`Approved collection copy ${i}`)].slice(0,slot.maxCodePoints).join(''),factReferences:['f1']}));
  m.omittedSectionIds=p.optionalSections.map(s=>s.id);
  input.confirmation.contentSha256=await sha256(canonical({source:input.source,materials:m}));return input;
}
