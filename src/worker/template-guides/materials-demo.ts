import type { Language } from '../../shared/model';
import type { MaterialsTemplateContract } from '../../shared/materials';
import { referenceLayouts } from '../../templates/themes/referenceLayouts';
import { junoMaterialsImageSlots } from '../../templates/materials';
import { sensengMaterialInventory } from '../../templates/materials-senseng';
import { defaultDraft } from '../domain';
import { junoDisplayRevision } from '../../templates/juno-display';
import { typedMaterialsDemoDraft } from './materials-typed-demo';

/** Public, explicitly labelled examples for the new materials preview only. */
export function materialsDemoDraft(profile:MaterialsTemplateContract,lang:Language){
  if(profile.imagePolicy==='typed-regions-v1')return typedMaterialsDemoDraft(profile,lang);
  const draft=defaultDraft();draft.template=profile.templateId as typeof draft.template;draft.buildBranch='template';draft.templateConfirmed=true;
  draft.languages=lang==='en'?['en']:['en',lang];draft.company.name='Example Brand';
  draft.company.description='Explore this example collection and discuss your retail assortment. Product details, availability and order terms are confirmed through an inquiry.';
  draft.company.email='demo@example.invalid';draft.company.contactName='Product team';
  const juno=profile.templateId==='juno-toys',layout=referenceLayouts['juno-toys'];
  const names=juno?['Dolls Trailer','Construction Cup','Teddy Bear Toy','Emergency Truck','Skywinder Toy','Excavator Toy']:['Star Cat','Heart Cat','Desk Cat','Penguin','Crunchy Pup','Yellow Cat','Narwhal','Sunshine Cat'];
  draft.products=names.map((name,i)=>({id:`demo-${i}`,name,description:'Example product. Request the current specifications and available options for your assortment.',material:'',dimensions:'',imageAssetId:juno?layout.slots[[4,5,6,7,10,11][i]].src:`/templates/senseng/products-${i+1}.jpg`}));
  const display=profile.contractRevision===junoDisplayRevision;
  if(display)draft.products=draft.products.slice(0,4).map((p,i)=>({...p,name:`Example toy ${i+1}`,imageAssetId:`/templates/juno-display-demo/front-${i}.svg`}));
  const displaySelection=display?{sceneProductIds:draft.products.map(p=>p.id),featuredProductIds:draft.products.map(p=>p.id)}:undefined;
  draft.primaryProductId=draft.products[0].id;
  const copy={headline:'Discover your next toy collection',subtitle:'Browse the collection, explore product details and start a conversation about your retail assortment.',cta:'Request product details',about:draft.company.description};
  for(const locale of draft.languages)draft.copy[locale]={...copy};
  const replacements:Record<string,string>={
    'We design toys not just for kids but with kids':'Explore toys for your next assortment',
    'Shop Now':'View collection','Buy now':'Request details','Shop Juno Toys & Games':'Explore the collection','Popular in Store':'Product highlights',
    'creative approach':'Plan your collection','We help you take care of the kids':'Find the right fit for your assortment',
    'Not only do we sell toys, but we also try to make sure that your children are safe playing, learning, and having fun!':'Compare product styles and ask for the details your buying team needs before confirming an order.',
    'Best Prices':'Product details','Affordable':'Review specifications','Fast Shippment':'Order planning','Express':'Discuss timing','Buyers Protection':'Your requirements','Guarantee':'Confirm the details','Live Support':'Contact our team','Online':'Send an inquiry','PLAY':'Explore products','Shop':'Products','Services':'Collection','ThemeREX':'Example Brand',
  };
  const textBindings=profile.textSlots.flatMap(slot=>draft.languages.map(locale=>{
    let text=slot.id==='hero-headline'?copy.headline:slot.id==='hero-subtitle'?copy.subtitle:slot.id==='primary-cta'?copy.cta:slot.id==='company-about'?copy.about:slot.id.endsWith('seo-title')?'Example Brand | Toy collection':slot.id.endsWith('seo-description')?copy.subtitle:slot.exampleText||'Explore the collection';
    text=replacements[text]||text;
    if(!juno){text=text.replace(/Senseng/gi,'Example Brand').replace(/Character-led squishy toys, made for joyful collections\.?/gi,'Explore character toys for your collection.');}
    return{slotId:slot.id,locale,text:[...text].slice(0,slot.maxCodePoints).join(''),factReferences:[]};
  }));
  const hero=['b6ca593d1ab64ceca5fd.jpg','e4712462d424bf565483.jpg','05736a422598adb22258.jpg'];
  const sensengImages=juno?[]:Object.entries(sensengMaterialInventory(profile.templateId as 'senseng-clean'|'senseng-video').images).flatMap(([,images])=>Object.entries(images));
  const imageBindings=profile.imageSlots.flatMap(slot=>{
    if(slot.id==='product-gallery')return[];
    const targets=slot.id==='product-main'||slot.repeat==='per-selection'?draft.products:display&&slot.role==='scene'?[draft.products[0]]:[undefined];
    return targets.map(product=>{
      const index=product?draft.products.indexOf(product):0;
      const displayAsset=display&&slot.role?`/templates/juno-display-demo/${slot.role==='collection'?`collection-${slot.id==='collection-banner-mid'?3:slot.id.slice(-1)}`:`${slot.role}-${index}`}.svg`:undefined;
      return {slotId:slot.id,...(product?{productId:product.id}:{}),...(slot.role?{role:slot.role,depictedProductIds:slot.role==='collection'?draft.products.map(p=>p.id):[product!.id]}:{}),assetId:displayAsset||product?.imageAssetId||(slot.id.startsWith('hero-slide-')?'/templates/references/'+hero[Number(slot.id.slice(-1))]:slot.id.startsWith('home-image-')?junoMaterialsImageSlots[Number(slot.id.slice(11))].src:sensengImages.find(([,id])=>id===slot.id)![0]),fit:slot.fit,focalPoint:{x:.5,y:.5},alt:Object.fromEntries(draft.languages.map(locale=>[locale,display?`Illustrated example: ${product?.name||'complete collection'} ${slot.role||''}`:product?.name||'Template demonstration image']))};
    });
  });
  draft.materials={templateId:profile.templateId,contractRevision:profile.contractRevision,...(displaySelection?{displaySelection}:{}),visual:{palette:{primary:'#236BB0',secondary:'#E9AB4D',background:'#FAFBFF',surface:'#FFFFFF',text:'#20263E',mutedText:'#626B7E'},backgroundStyle:'plain',imageTreatment:'natural',compositionSummary:'Public template demonstration using bundled sample imagery.'},textBindings,imageBindings,omittedSectionIds:profile.optionalSections.map(s=>s.id)};
  draft.brandColor=draft.materials.visual.palette.primary;
  return draft;
}
