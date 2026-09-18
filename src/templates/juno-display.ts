import type {MaterialsTemplateContract} from '../shared/materials';
import type {MaterialsIssue,PositionInput} from './materials';

export const junoDisplayRevision='2026-09-18.juno-materials.3';
export const junoLegacyRevision='2026-09-17.juno-materials.2';

export function validateJunoDisplay(m:PositionInput,profile:MaterialsTemplateContract):MaterialsIssue[]{
  const issues:MaterialsIssue[]=[];
  const add=(code:string,message:string)=>issues.push({path:'materials.displaySelection',code,message});
  const ids=m.products.map(p=>p.id),selection=m.displaySelection;
  const mediaUses=new Map<string,string>();
  for(const group of ['sceneProductIds','featuredProductIds']as const){
    const selected=selection?.[group]||[];
    if(selected.length!==Math.min(ids.length,4)||new Set(selected).size!==selected.length||selected.some(id=>!ids.includes(id)))add('invalid_display_selection',group);
  }
  if(!ids.length)add('missing_products','At least one selected product is required');
  for(const b of m.imageBindings){
    const slot=profile.imageSlots.find(s=>s.id===b.slotId);if(!slot?.role)continue;
    if(b.role!==slot.role)add('image_role_mismatch',b.slotId);
    if(b.itemIndex!==undefined)add('invalid_target',`${b.slotId}: use product identity, not an index`);
    const expected=slot.role==='collection'?ids:[b.productId||''];
    const depicted=b.depictedProductIds||[];
    const identity=JSON.stringify([slot.role,[...depicted].sort()]);
    for(const mediaId of [b.mediaId,b.mobileMediaId].filter((id):id is string=>!!id)){
      const hash=m.media.find(a=>a.id===mediaId)?.sha256;
      for(const key of [`id:${mediaId}`,...(hash?[`sha:${hash}`]:[])]){
        const previous=mediaUses.get(key);
        if(previous&&previous!==identity)add('image_role_identity_reused',b.slotId);
        mediaUses.set(key,identity);
      }
    }
    if(!depicted.length||depicted.length!==expected.length||new Set(depicted).size!==depicted.length||expected.some(id=>!depicted.includes(id))||(slot.role==='collection'?!!b.productId:!ids.includes(b.productId||'')))add('image_identity_mismatch',b.slotId);
    if(slot.repeat==='per-selection'){
      const selected=selection?.[slot.selectionGroup==='scene'?'sceneProductIds':'featuredProductIds']||[];
      if(!selected.includes(b.productId||''))add('unexpected_display_product',b.slotId);
    }
    if(slot.role==='packaging'){
      const product=m.products.find(p=>p.id===b.productId),evidence=b.evidenceMediaIds||[];
      if(!evidence.length||evidence.some(id=>!product?.galleryMediaIds.includes(id)||!m.media.some(a=>a.id===id)))add('packaging_evidence_missing',b.productId||b.slotId);
    }
  }
  const editorial=m.imageBindings.filter(b=>b.slotId==='home-image-8'||b.slotId==='home-image-9');
  if(editorial.length===2&&editorial[0].productId!==editorial[1].productId)add('editorial_identity_mismatch','Both product-approach scenes must depict the same product');
  const mid=m.imageBindings.find(b=>b.slotId==='collection-banner-mid');
  if(mid){
    const heroIds=m.imageBindings.filter(b=>/^hero-slide-[0-2]$/.test(b.slotId)).flatMap(b=>[b.mediaId,b.mobileMediaId].filter((id):id is string=>!!id));
    const heroHashes=new Set(m.media.filter(a=>heroIds.includes(a.id)&&a.sha256).map(a=>a.sha256));
    if([mid.mediaId,mid.mobileMediaId].filter((id):id is string=>!!id).some(id=>heroIds.includes(id)||heroHashes.has(m.media.find(a=>a.id===id)?.sha256)))add('banner_composition_reused','Middle banner must use distinct media from the hero');
  }
  return issues;
}

/** Derive a new inventory without mutating the accepted v2 contract. */
export function junoDisplayContract(legacy:MaterialsTemplateContract):MaterialsTemplateContract{
  const profile=structuredClone(legacy);
  profile.contractRevision=junoDisplayRevision;
  const image=(id:string,role:'scene'|'front'|'packaging'|'collection',width:number,height:number,purpose:string,selectionGroup?:'scene'|'featured'):MaterialsTemplateContract['imageSlots'][number]=>({
    id,page:'home',purpose,min:1,max:1,required:true,binding:'supported',repeat:selectionGroup?'per-selection':'once',...(selectionGroup?{selectionGroup}:{}),role,width,height,fit:'contain',allowedMimeTypes:['image/png','image/jpeg','image/webp'],
    composition:role==='collection'?'Every selected product must appear recognizably together in this image. Preserve actual shape, colors and markings; leave the left 45% clear for live copy. Use a different composition for each banner position.':role==='front'?'Exactly the bound product, complete and front-facing on a consistent neutral background. No packaging, side views, cropped details or product-and-box group shots.':role==='packaging'?'Only the bound product\'s real packaging, based on verified retained source evidence. Use consistent frontal presentation and full-package framing; never invent packaging.':'Show only the bound product in a realistic use context. Preserve identity, consistent subject scale and a 4:3 composition. Do not substitute a plain product or packaging photo.',
    mobileComposition:role==='collection'?'Recompose the complete selected collection for mobile without removing or cropping any product. Live text is separate from the image.':'Keep the complete bound subject visible with the same role and identity; preserve the card aspect ratio.',
  });
  profile.imageSlots=[
    ...[0,1,2].map(i=>image(`hero-slide-${i}`,'collection',1920,900,`Homepage hero slide ${i+1}: the complete selected collection, with a distinct scene`)),
    image('scene-card','scene',1200,900,'Product scene cards in persisted sceneProductIds order','scene'),
    image('front-card','front',1000,1000,'Single-product front views; reused in the first grid and upper comparison row','featured'),
    image('packaging-card','packaging',1000,1000,'Verified packaging, in exactly the same product order as the front row','featured'),
    image('home-image-8','scene',1200,900,'Main product-approach scene; bind one actual product'),
    image('home-image-9','scene',1200,900,'Companion product-approach scene; bind the same product as home-image-8'),
    image('collection-banner-mid','collection',1920,650,'Middle homepage banner: the entire selected collection in a composition different from every hero slide'),
    ...legacy.imageSlots.filter(s=>s.id==='product-main'||s.id==='product-gallery'),
  ];
  const removed=new Set([...Array.from({length:8},(_,i)=>i+2),...Array.from({length:8},(_,i)=>i+12),...Array.from({length:16},(_,i)=>i+25),49]);
  profile.textSlots=profile.textSlots.filter(s=>!s.id.startsWith('layout-text-')||!removed.has(Number(s.id.slice(12))));
  const sceneLabel=profile.textSlots.find(s=>s.id==='layout-text-0')!;
  sceneLabel.exampleText='Product scenes';sceneLabel.purpose='Eyebrow for product scene entries; do not claim categories or filters';
  const copy=(id:string,purpose:string,maxCodePoints:number,exampleText:string):MaterialsTemplateContract['textSlots'][number]=>({id,page:'home',purpose,maxCodePoints,exampleText,maxLines:3,min:1,max:1,required:true,binding:'supported',repeat:'once',factualPolicy:'Use confirmed brand and product facts only. Do not invent packaging details, capabilities or endorsements.'});
  profile.textSlots.push(copy('display-card-cta','Product detail link label',36,'View product'),copy('front-row-label','Heading for the single-product front row',60,'Product views'),copy('packaging-row-label','Heading for the matching packaging row',60,'Packaging'),copy('mid-banner-headline','Middle collection banner headline',100,'Explore the complete collection'),copy('mid-banner-subtitle','Middle collection banner supporting copy',220,'Review the selected range and contact our team for product details.'),copy('mid-banner-cta','Middle collection inquiry link label',36,'Discuss the collection'));
  return profile;
}
