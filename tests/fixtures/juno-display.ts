import type {MaterialsSubmission} from '../../src/shared/materials';
import {getMaterialsTemplate} from '../../src/templates/materials';
import {junoDisplayRevision} from '../../src/templates/juno-display';
import {canonical,sha256} from '../../src/worker/http';
import {materialsFixture} from './materials';

/** Metadata fixture. Visual acceptance supplies actual images separately. */
export async function junoDisplayFixture(count=5):Promise<MaterialsSubmission>{
  const s=await materialsFixture(count),m=s.materials,profile=getMaterialsTemplate('juno-toys',junoDisplayRevision)!;
  m.template.contractRevision=junoDisplayRevision;
  const ids=m.products.map(p=>p.id);const selected=ids.slice(-4).reverse();
  m.displaySelection={sceneProductIds:[...selected].reverse(),featuredProductIds:selected};
  m.textBindings=profile.textSlots.map((slot,i)=>({slotId:slot.id,locale:'en',text:slot.exampleText||`Approved copy ${i}`,factReferences:['f1']}));
  m.imageBindings=[];
  for(const slot of profile.imageSlots){
    if(slot.id==='product-gallery')continue;
    const targets=slot.repeat==='per-product'?ids:slot.repeat==='per-selection'?m.displaySelection[slot.selectionGroup==='scene'?'sceneProductIds':'featuredProductIds']:slot.role==='scene'?[selected[0]]:[undefined];
    for(const productId of targets){
      const product=m.products.find(p=>p.id===productId),mediaId=slot.id==='product-main'?product!.primaryMediaId:`image-${slot.id}-${productId||'all'}`;
      if(!m.media.some(a=>a.id===mediaId))m.media.push({...m.media[0],id:mediaId,sourceAssetId:mediaId,sha256:await sha256(mediaId),width:slot.width,height:slot.height});
      m.imageBindings.push({slotId:slot.id,mediaId,...(productId?{productId}:{}),...(slot.role?{role:slot.role,depictedProductIds:slot.role==='collection'?[...ids]:[productId!]}:{}),...(slot.role==='packaging'?{evidenceMediaIds:[product!.primaryMediaId]}:{}),fit:slot.fit,focalPoint:{x:.5,y:.5},alt:{en:`${product?.name||'Complete collection'} ${slot.role||'original'}`}});
    }
  }
  s.confirmation.contentSha256=await sha256(canonical({source:s.source,materials:m}));return s;
}
