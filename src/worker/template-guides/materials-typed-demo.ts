import type {Language} from '../../shared/model';
import type {MaterialsTemplateContract,AppliedMaterials} from '../../shared/materials';
import {defaultDraft} from '../domain';
import {getMaterialsDemoSamples,unavailablePackagingSample} from './materials-demo-samples';

/** Deliberately labelled public examples, never a source of customer facts. */
export function typedMaterialsDemoDraft(profile:MaterialsTemplateContract,lang:Language){
  const samples=getMaterialsDemoSamples(profile.templateId,profile.contractRevision);
  const draft=defaultDraft();draft.template=profile.templateId as typeof draft.template;draft.buildBranch='template';draft.templateConfirmed=true;
  draft.languages=lang==='en'?['en']:['en',lang];
  draft.company={...draft.company,name:'Example Brand',description:samples?`${samples.label} template demonstration. ${samples.limitation}`:'Explore this illustrated example collection and discuss product details with our team.',email:'demo@example.invalid',contactName:'Example team'};
  const asset=(role:string,index:number)=>{
    if(samples){
      if(role==='packaging')return unavailablePackagingSample.url;
      if(role==='collection')return samples.collection.url;
      return samples.products[index%samples.products.length].url;
    }
    return role==='collection'&&['fintech-platform','corpox-consulting'].includes(profile.templateId)?`/templates/materials-demo/dark-collection-${index}.svg`:`/templates/juno-display-demo/${role}-${index}.svg`;
  };
  draft.products=Array.from({length:4},(_,i)=>({id:`example-${i}`,name:samples?.products[i].name||`Example toy ${i+1}`,description:samples?.limitation||'Illustrated example product. Request confirmed specifications and available options.',material:'',dimensions:'',imageAssetId:asset('front',i),gallery:[{assetId:asset('front',i),caption:samples?'Template product example':'Illustrated front view',sourceImageId:`front-${i}`,kind:'original' as const},{assetId:asset('packaging',i),caption:samples?'Packaging photo not supplied':'Illustrated packaging example',sourceImageId:`packaging-${i}`,kind:'detail' as const}]}));
  draft.primaryProductId=draft.products[0].id;
  const ids=draft.products.map(p=>p.id),selection={sceneProductIds:ids.slice(0,profile.selectionGroups?.scene||0),featuredProductIds:ids.slice(0,profile.selectionGroups?.featured||0)};
  const copy={headline:samples?`Explore ${samples.label}`:'Discover your next toy collection',subtitle:samples?.limitation||'Explore the illustrated collection and discuss your assortment with our team.',cta:'Request product details',about:draft.company.description};
  for(const locale of draft.languages)draft.copy[locale]={...copy};
  const core:Record<string,string>={'about-headline':'Explore our collection','about-story':'Discuss product options and your assortment with our team.','about-highlights':'✓ | Product options | Discuss your assortment','hero-headline':copy.headline,'hero-subtitle':copy.subtitle,'primary-cta':copy.cta,'company-about':copy.about};
  const interfaceCopy=/^(?:Home|About(?: us)?|Contact(?: us)?|Products?|Catalog(?:ue)?|All products|Search(?: products)?|Name|Email|Phone|Company|Message|Send(?: inquiry)?|Submit|View details|Related products|Specifications|Material|Dimensions|Next|Previous|Close|Menu|Privacy policy|Terms(?: of use)?|Explore|Learn more|Read more)$/i;
  const textBindings=profile.textSlots.flatMap(slot=>draft.languages.map(locale=>{
    const example=slot.exampleText?.trim()||'';
    const text=core[slot.id]||(slot.id.endsWith('seo-title')?`Example Brand | ${samples?.label||'Toy collection'}`:slot.id.endsWith('seo-description')?copy.subtitle:interfaceCopy.test(example)?example:/^[\d.,%+\s$KkMm]+$/.test(example)?'—':slot.maxCodePoints>180?copy.subtitle:'Explore the collection');
    return{slotId:slot.id,locale,text:[...text].slice(0,slot.maxCodePoints).join(''),factReferences:[]};
  }));
  let banner=0;
  const imageBindings:AppliedMaterials['imageBindings']=profile.imageSlots.flatMap(slot=>{
    const targets:Array<{productId?:string;itemIndex?:number}>=slot.repeat==='per-product-gallery'?ids.map(productId=>({productId,itemIndex:1})):slot.repeat==='per-product'?ids.slice(0,slot.maxProducts).map(productId=>({productId})):slot.repeat==='per-selection'?selection[slot.selectionGroup==='scene'?'sceneProductIds':'featuredProductIds'].map(productId=>({productId})):slot.role&&['scene','front','packaging','main','detail'].includes(slot.role)?[{productId:ids[0]}]:[{}];
    return targets.map(target=>{
      const index=Math.max(0,ids.indexOf(target.productId||''));
      const assetId=slot.id==='product-main'?asset('front',index):slot.id==='product-gallery'?asset('packaging',index):slot.role==='collection'?asset('collection',banner++%4):slot.role==='facility'||slot.role==='logistics'?`/templates/materials-demo/${slot.role}.svg`:asset(slot.role==='main'?'front':slot.role==='detail'?'scene':slot.role||'scene',index);
      const sampleAlt=samples?(slot.role==='packaging'||slot.id==='product-gallery'?'Packaging photo not supplied':slot.role==='facility'||slot.role==='logistics'?`${slot.role} illustration — example only`:`${samples.label} ${samples.status==='unavailable'?'photo not supplied':samples.status==='product-image'?'bundled product example':'illustration — example only'}`):undefined;
      return{slotId:slot.id,...target,assetId,fit:slot.fit,focalPoint:{x:.5,y:.5},alt:Object.fromEntries(draft.languages.map(l=>[l,sampleAlt||`Illustrated example: ${slot.role||'original product image'}`])),...(slot.role?{role:slot.role,depictedProductIds:slot.role==='collection'?ids:target.productId?[target.productId]:[]}:{}),...(slot.role==='packaging'?{evidenceAssetIds:samples?[]:[asset('packaging',index)]}:{})};
    });
  });
  draft.materials={templateId:profile.templateId,contractRevision:profile.contractRevision,displaySelection:selection,visual:{palette:{primary:'#236BB0',secondary:'#E9AB4D',background:'#FAFBFF',surface:'#FFFFFF',text:'#20263E',mutedText:'#626B7E'},backgroundStyle:'plain',imageTreatment:'natural',compositionSummary:samples?`${samples.label}. ${samples.limitation}`:'Labelled illustrated examples for this template.'},textBindings,imageBindings,omittedSectionIds:profile.optionalSections.map(s=>s.id)};
  draft.brandColor=draft.materials.visual.palette.primary;return draft;
}
