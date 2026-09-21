import {validAboutHighlights} from '../shared/materials';
import { parseFragment, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type { ConfirmedMaterials, MaterialsTemplateContract } from '../shared/materials';
import { materialsPages } from '../shared/materials';
import { referenceLayouts } from './themes/referenceLayouts';
import { sensengMaterialInventory } from './materials-senseng';
import { junoDisplayContract, junoDisplayRevision, junoLegacyRevision, validateJunoDisplay } from './juno-display';
import { getModernMaterialsTemplate,getTypedMaterialsTemplate } from './materials-typed';
import { validateTypedMaterials } from './materials-typed-validation';

type Node=DefaultTreeAdapterMap['node'];
type Element=DefaultTreeAdapterMap['element'];
const attrs=(node:Element)=>Object.fromEntries(node.attrs.map(a=>[a.name,a.value]));
const isElement=(node:Node):node is Element=>'tagName' in node;
const imageTypes=['image/png','image/jpeg','image/webp'];
// The original generation guide omits these five cards in the second grid.
export const junoMaterialsImageSlots=[...referenceLayouts['juno-toys'].slots,...[
  ['3acad0ba1ade35505b6f.jpg','Cutie Girl Doll'],['d944810805584d4c4a83.jpg','Genius Tray'],
  ['c09aa8b0c60785450022.jpg','Doctor Doll'],['133693d2cf04aed02165.jpg','Cartoon Kit'],['503cf47ed16d2a148e35.jpg','Blocks Build Toy'],
].map(([file,alt])=>({src:'/templates/references/'+file,alt,width:630,height:630}))];
const omittedJunoSections:Record<string,string>={
  '78f0005e':'testimonials', '186cfd3':'news', '647c7bce':'news', '18eff67c':'partner-brands',
};
const baseSlot={min:1,max:1,required:true,binding:'supported' as const,repeat:'once' as const};
const copySlot=(id:string,page:typeof materialsPages[number],purpose:string,maxCodePoints:number):MaterialsTemplateContract['textSlots'][number]=>({
  ...baseSlot,id,page,purpose,maxCodePoints,maxLines:maxCodePoints>100?5:3,
  factualPolicy:'Use confirmed facts only. No invented prices, certifications, customer endorsements or performance figures.',
});
const prepared=new Map<string,{html:string;contract:MaterialsTemplateContract}>();

function prepareJuno(){
  const cached=prepared.get('juno-toys');if(cached)return cached;
  const layout=referenceLayouts['juno-toys'];
  const root=parseFragment(layout.html);
  const textSlots:MaterialsTemplateContract['textSlots']=[
    copySlot('hero-headline','home','Primary B2B offer headline; also used by the three hero slides',100),
    copySlot('hero-subtitle','home','Short factual introduction to the offer',260),
    copySlot('primary-cta','home','Inquiry-oriented call to action',36),
    copySlot('company-about','about','Company description from saved brand facts',2500),
    ...materialsPages.flatMap(page=>[copySlot(`${page}-seo-title`,page,'Search title',70),copySlot(`${page}-seo-description`,page,'Search description',170)]),
  ];
  let textIndex=0,heroIndex=0;
  function visit(node:Node,parents:Element[]=[]){
    if(isElement(node)){
      const a=attrs(node),cls=a.class||'';
      const remove=!!omittedJunoSections[a['data-id']] || /(?:^|\s)(?:price|onsale|yith-wcwl-add-to-wishlist|tinv-wraper|sc_layouts_cart|socials_wrap)(?:\s|$)/.test(cls)
        || /elementor-widget-trx_sc_layouts_cart|elementor-widget-trx_sc_layouts_search|elementor-widget-trx_sc_socials/.test(cls);
      if(remove){node.parentNode!.childNodes=node.parentNode!.childNodes.filter(n=>n!==node);return;}
      // Price, review and brand claims cannot be restored through decorative metadata.
      node.attrs=node.attrs.filter(a=>!['title','data-tooltip','data-count','data-success_message','data-product_id','data-product_sku'].includes(a.name)&&!(node.tagName==='a'&&a.name==='aria-label'));
      if(node.tagName==='a'&&parents.some(p=>(attrs(p).class||'').split(/\s+/).includes('wr-juno-copy'))){
        node.attrs=node.attrs.filter(a=>!['href','data-wr-page'].includes(a.name));
        node.attrs.push({name:'href',value:'__WR_CONTACT__'},{name:'data-wr-page',value:'contact'});
      }
      if('data-wr-slide' in a){
        node.attrs=node.attrs.filter(a=>a.name!=='style');
        node.attrs.push({name:'data-wr-material-image',value:`hero-slide-${heroIndex++}`});
      }
      const imageIndex=a['data-wr-product-slot']!==undefined?Number(a['data-wr-product-slot']):node.tagName==='img'?junoMaterialsImageSlots.findIndex(s=>s.src===a.src):-1;
      if(imageIndex>=0)node.attrs.push({name:'data-wr-material-image',value:`home-image-${imageIndex}`});
      for(const child of [...node.childNodes])visit(child,[...parents,node]);
    }else if(node.nodeName==='#text'){
      const value=node.value.trim().replace(/\s+/g,' ');
      if(!value||/__WR_/.test(value)||!/\p{L}|\p{N}/u.test(value))return;
      if(parents.some(p=>['script','style','svg'].includes(p.tagName)))return;
      const parent=parents.at(-1),a=parent?attrs(parent):{};
      if(/(?:icon-|social_icon|screen-reader-text)/.test(a.class||''))return;
      const inHero=parents.some(p=>(attrs(p).class||'').includes('wr-juno-copy'));
      if(inHero&&parent?.tagName==='p'){node.value='__WR_MATERIAL_SUBTITLE__';return;}
      if(inHero&&parent?.tagName==='a'){node.value='__WR_MATERIAL_CTA__';return;}
      const i=textIndex++;
      const heading=parents.some(p=>/^h[1-6]$/.test(p.tagName));
      const button=parents.some(p=>p.tagName==='a'||p.tagName==='button');
      const max=heading?120:button?50:Math.max(100,Math.min(600,value.length*2));
      const page=parents.some(p=>p.tagName==='footer')?'contact':'home';
      textSlots.push({...copySlot(`layout-text-${i}`,page,`${heading?'Heading':button?'Navigation or CTA':'Body copy'} in original Juno layout: ${value}`,max),exampleText:value});
      node.value=`__WR_MATERIAL_TEXT_${i}__`;
    }else if('childNodes' in node)for(const child of [...node.childNodes])visit(child,parents);
  }
  visit(root);
  const imageSlot=(id:string,width:number,height:number,purpose:string):MaterialsTemplateContract['imageSlots'][number]=>({
    ...baseSlot,id,page:'home',width,height,purpose,fit:'contain',allowedMimeTypes:imageTypes,
    composition:'Preserve the real product shape, colors and markings. Keep the full subject inside the central 70%; use the approved site palette in the surrounding composition.',
    mobileComposition:'Keep the subject within the central 60%; use mobileMediaId for a separately composed mobile crop when needed.',
  });
  const contract:MaterialsTemplateContract={
    schemaVersion:'wr-template-materials-v1',templateId:'juno-toys',guideRevision:'2026-09-17.1',contractRevision:'2026-09-17.juno-materials.2',materialsReady:true,pages:[...materialsPages],
    imageSlots:[
      ...Array.from({length:3},(_,i)=>({...imageSlot(`hero-slide-${i}`,1920,900,`Homepage hero carousel slide ${i+1}; representative product composition with left 45% reserved for headline`),fit:'cover' as const})),
      ...junoMaterialsImageSlots.map((s,i)=>imageSlot(`home-image-${i}`,s.width,s.height,`Homepage image position ${i+1}: ${s.alt}; ${i>=12?'use an original selected-product image or an already approved matching product image; generation is not required':'replace the sample with selected products or approved brand imagery'}`)),
      {...imageSlot('product-main',1000,1000,'Original primary product image in catalog and product detail; must use primaryMediaId'),page:'catalog',repeat:'per-product'},
      {...imageSlot('product-gallery',1000,1000,'Ordered supplemental product images in detail; itemIndex is galleryMediaIds index, starting at 1'),page:'detail',repeat:'per-product-gallery',min:0,max:10,required:false},
    ],textSlots,
    optionalSections:[{id:'testimonials',reason:'Customer quotes are not supported by this revision; include in omittedSectionIds.'},{id:'news',reason:'Sample dated articles are not company facts; include in omittedSectionIds.'},{id:'partner-brands',reason:'Sample partner logos are not verified; include in omittedSectionIds.'}],
    visualParameters:['palette.primary','palette.secondary','palette.background','palette.surface','palette.text','palette.mutedText','backgroundStyle','imageTreatment','compositionSummary'],contentPolicy:'b2b-confirmed-facts-only',
  };
  const result={html:serialize(root),contract};prepared.set('juno-toys',result);return result;
}
export function getMaterialsTemplate(id:string,contractRevision?:string):MaterialsTemplateContract|undefined {
  if(contractRevision&&(id==='senseng-clean'||id==='senseng-video')){
    const profile=sensengMaterialInventory(id).profile;
    if(contractRevision===profile.contractRevision)return structuredClone(profile);
  }
  if(id==='juno-toys'){
    if(contractRevision===junoLegacyRevision)return structuredClone(prepareJuno().contract);
    if(contractRevision===junoDisplayRevision)return junoDisplayContract(prepareJuno().contract);
  }
  const current=getModernMaterialsTemplate(id,contractRevision);
  if(current&&(!contractRevision||current.contractRevision===contractRevision))return current;
  const previous=getTypedMaterialsTemplate(id);
  return previous?.contractRevision===contractRevision?previous:undefined;
}
export function prepareMaterialsReference(id:string):string {
  if(id!=='juno-toys')throw new Error('Unsupported materials template');
  return prepareJuno().html;
}
export interface MaterialsIssue {path:string;code:string;message:string}
/** Position validation is separate from structural wire parsing and has no network side effects. */
export type PositionInput=Pick<ConfirmedMaterials,'template'|'omittedSectionIds'|'imageBindings'|'textBindings'|'locales'|'displaySelection'> & {products:Array<Pick<ConfirmedMaterials['products'][number],'id'|'primaryMediaId'|'galleryMediaIds'>>;media:Array<Pick<ConfirmedMaterials['media'][number],'id'|'mimeType'> & {sha256?:string}>};
export function validateMaterialsPositions(m:PositionInput):MaterialsIssue[]{
  const issues:MaterialsIssue[]=[];
  const add=(path:string,code:string,message:string)=>issues.push({path,code,message});
  const p=getMaterialsTemplate(m.template.id,m.template.contractRevision);
  if(!p){add('materials.template','unsupported_template','Template is not materials-ready');return issues;}
  if(p.guideRevision!==m.template.guideRevision||p.contractRevision!==m.template.contractRevision){add('materials.template','contract_revision_conflict','Read the current template requirements');return issues;}
  if(p.contractRevision===junoDisplayRevision)issues.push(...validateJunoDisplay(m,p));
  if(p.imagePolicy==='typed-regions-v1')issues.push(...validateTypedMaterials(m,p));
  for(const s of p.optionalSections)if(!m.omittedSectionIds.includes(s.id))add('materials.omittedSectionIds','unsupported_section',`Omit ${s.id} for this revision`);
  for(const id of m.omittedSectionIds)if(!p.optionalSections.some(s=>s.id===id))add('materials.omittedSectionIds','unsupported_section',`Unknown section ${id}`);
  for(const [kind,bindings,slots] of [['image',m.imageBindings,p.imageSlots],['text',m.textBindings,p.textSlots]] as const){
    for(const b of bindings){
      const slot=slots.find(s=>s.id===b.slotId);
      if(!slot){add(`materials.${kind}Bindings`,'unsupported_slot',b.slotId);continue;}
      if(slot.repeat==='once'&&b.itemIndex!==undefined)add(`materials.${kind}Bindings`,'invalid_target',b.slotId);
      if(b.productId&&!m.products.some(p=>p.id===b.productId))add(`materials.${kind}Bindings`,'unknown_product',b.slotId);
      if((slot.repeat.startsWith('per-product')||slot.repeat==='per-selection')&&!b.productId)add(`materials.${kind}Bindings`,'missing_product',b.slotId);
      if('text'in b&&['about-headline','about-story'].includes(b.slotId)&&!b.text.trim())add('materials.textBindings','empty_about_copy',b.slotId);
      if('text'in b&&b.slotId==='about-highlights'&&!validAboutHighlights(b.text))add('materials.textBindings','invalid_about_highlights',b.slotId);
      if('text' in b&&'maxCodePoints' in slot&&[...b.text].length>slot.maxCodePoints)add('materials.textBindings','copy_too_long',b.slotId);
      if(kind==='image'&&'mediaId' in b&&'allowedMimeTypes' in slot){
        for(const locale of m.locales)if(!b.alt[locale]?.trim())add('materials.imageBindings','missing_alt',`${b.slotId}:${locale}`);
        for(const mediaId of [b.mediaId,b.mobileMediaId].filter(Boolean))if(!slot.allowedMimeTypes.includes(m.media.find(a=>a.id===mediaId)?.mimeType||''))add('materials.imageBindings','invalid_media_type',b.slotId);
        const product=m.products.find(p=>p.id===b.productId);
        if(slot.id==='product-main'&&(b.itemIndex!==undefined||b.mediaId!==product?.primaryMediaId))add('materials.imageBindings','primary_media_mismatch',b.slotId);
        if(slot.id==='product-gallery'&&(!b.itemIndex||b.mediaId!==product?.galleryMediaIds[b.itemIndex]))add('materials.imageBindings','gallery_media_mismatch',b.slotId);
      }
    }
    for(const slot of slots){
      const targets=slot.repeat==='per-product'?m.products.slice(0,'maxProducts'in slot?slot.maxProducts:undefined).map(p=>p.id):slot.repeat==='per-selection'?(m.displaySelection?.['selectionGroup'in slot&&slot.selectionGroup==='scene'?'sceneProductIds':'featuredProductIds']||[]):[undefined];
      for(const productId of targets){
        const locales=kind==='text'?m.locales:[undefined];
        for(const locale of locales){
          const bound=bindings.filter(b=>b.slotId===slot.id&&(slot.repeat==='once'||b.productId===productId)&&(!locale||('locale' in b&&b.locale===locale)));
          if(slot.repeat==='per-product-gallery')continue;
          if(bound.length<slot.min||bound.length>slot.max)add(`materials.${kind}Bindings`,'slot_quantity',`${slot.id}:${productId||''}:${locale||''}`);
          if(slot.required&&bound.some(b=>'text' in b&&!b.text.trim()))add('materials.textBindings','empty_copy',slot.id);
        }
      }
    }
  }
  const galleryTargets=m.imageBindings.filter(b=>b.slotId==='product-gallery').map(b=>`${b.productId}:${b.itemIndex}`);
  if(new Set(galleryTargets).size!==galleryTargets.length)add('materials.imageBindings','duplicate_target','Gallery bindings must be unique');
  for(const product of m.products)product.galleryMediaIds.slice(1).forEach((mediaId,i)=>{
    if(!m.imageBindings.some(b=>b.slotId==='product-gallery'&&b.productId===product.id&&b.itemIndex===i+1&&b.mediaId===mediaId))add('materials.imageBindings','gallery_binding_missing',`${product.id}:${i+1}`);
  });
  return issues;
}
