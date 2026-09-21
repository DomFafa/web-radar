import type {MaterialsTemplateContract} from '../shared/materials';
import type {MaterialsIssue,PositionInput} from './materials';

/** Role checks belong to the versioned contract, independent of template names. */
export function validateTypedMaterials(m:PositionInput,profile:MaterialsTemplateContract):MaterialsIssue[]{
  const issues:MaterialsIssue[]=[];
  const add=(code:string,message:string)=>issues.push({path:'materials.imageBindings',code,message});
  const ids=m.products.map(p=>p.id);
  for(const group of ['scene','featured']as const){
    const selected=m.displaySelection?.[group==='scene'?'sceneProductIds':'featuredProductIds']||[];
    const count=profile.selectionGroups?.[group]||0;
    if(selected.length!==Math.min(ids.length,count)||new Set(selected).size!==selected.length||selected.some(id=>!ids.includes(id)))
      issues.push({path:'materials.displaySelection',code:'invalid_display_selection',message:group});
  }
  const identities=new Map<string,string>(),roles=new Map<string,string>(),banners=new Map<string,string>();
  const targets=new Set<string>();
  const compositions=new Map<string,{slotId:string;distinct:boolean}>();
  for(const binding of m.imageBindings){
    const slot=profile.imageSlots.find(s=>s.id===binding.slotId);
    if(!slot)continue;
    const target=JSON.stringify([binding.slotId,binding.productId,binding.itemIndex]);
    if(targets.has(target))add('duplicate_target',binding.slotId);
    targets.add(target);
    if(binding.role!==slot.role)add('image_role_mismatch',binding.slotId);
    const illustration=slot.role==='facility'||slot.role==='logistics';
    const scope=slot.productScope??(illustration?'none':slot.role==='collection'?'all-products':'single-product');
    const expected=scope==='none'?[]:scope==='all-products'?ids:[binding.productId||''];
    const depicted=binding.depictedProductIds;
    if(slot.role&&(!depicted||depicted.length!==expected.length||new Set(depicted).size!==depicted.length||expected.some(id=>!depicted.includes(id))||
      ((illustration||slot.role==='collection')?!!binding.productId:!ids.includes(binding.productId||''))))add('image_identity_mismatch',binding.slotId);
    if(illustration&&slot.sourcePolicy!=='illustration')add('image_source_policy',binding.slotId);
    if(slot.repeat==='per-selection'){
      const selected=m.displaySelection?.[slot.selectionGroup==='scene'?'sceneProductIds':'featuredProductIds']||[];
      if(!selected.includes(binding.productId||''))add('unexpected_display_product',binding.slotId);
    }
    if(slot.repeat==='per-product'&&slot.maxProducts!==undefined&&!ids.slice(0,slot.maxProducts).includes(binding.productId||''))add('unexpected_display_product',binding.slotId);
    if(slot.materialSource&&slot.repeat==='fixed'){
      if(binding.itemIndex===undefined||!Number.isInteger(binding.itemIndex)||binding.itemIndex<0||binding.itemIndex>=slot.max)add('invalid_target',binding.slotId);
    }else if(slot.repeat!=='per-product-gallery'&&binding.itemIndex!==undefined)add('invalid_target',binding.slotId);
    if(slot.productScope==='single-product'&&!binding.productId)add('missing_product',binding.slotId);
    if(slot.productScope&&slot.productScope!=='single-product'&&binding.productId)add('invalid_target',binding.slotId);
    if(slot.role==='packaging'){
      const product=m.products.find(p=>p.id===binding.productId),evidence=binding.evidenceMediaIds||[];
      if(!evidence.length||new Set(evidence).size!==evidence.length||evidence.some(id=>!product?.galleryMediaIds.includes(id)||!m.media.some(a=>a.id===id)))add('packaging_evidence_missing',binding.slotId);
    }
    const identity=JSON.stringify([...(slot.role?depicted||[]:[binding.productId||''])].sort());
    for(const id of [binding.mediaId,binding.mobileMediaId].filter((id):id is string=>!!id)){
      const digest=m.media.find(media=>media.id===id)?.sha256;
      for(const key of [`id:${id}`,...(digest?[`sha:${digest}`]:[])]){
        const prior=compositions.get(key);
        if(prior&&prior.slotId!==slot.id&&(prior.distinct||slot.reusePolicy==='distinct-slot'))add(slot.role==='collection'?'banner_composition_reused':'slot_composition_reused',binding.slotId);
        compositions.set(key,{slotId:slot.id,distinct:slot.reusePolicy==='distinct-slot'});
        if(identities.has(key)&&identities.get(key)!==identity)add('image_role_identity_reused',binding.slotId);
        identities.set(key,identity);
        // Original main/gallery retention may reuse a classified image for the same product.
        if(slot.role&&slot.role!=='main'&&slot.role!=='detail'){
          if(roles.has(key)&&roles.get(key)!==slot.role)add('image_role_identity_reused',binding.slotId);
          roles.set(key,slot.role||'');
        }
        if(slot.role==='collection'){
          if(banners.has(key)&&banners.get(key)!==slot.id)add('banner_composition_reused',binding.slotId);
          banners.set(key,slot.id);
        }
      }
    }
  }
  return issues;
}
