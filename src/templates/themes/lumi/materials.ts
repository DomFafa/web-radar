import type { MaterialsTemplateContract } from '../../../shared/materials';
import { materialsPages } from '../../../shared/materials';
import { lumiImageInventory, lumiTextInventory } from './materials-map';
export const lumiMaterialsRevision = '2026-09-30.lumi-business-materials.1';
const base = {min:0,max:1,required:false,binding:'supported' as const,repeat:'once' as const};
const factualPolicy='Use confirmed company, contact and service facts only. Do not invent prices, endorsements, experience, team members or performance figures.';
export function getLumiMaterialsTemplate(revision?:string):MaterialsTemplateContract|undefined {
  if(revision&&revision!==lumiMaterialsRevision)return;
  return {
    schemaVersion:'wr-template-materials-v1',templateId:'lumi-business',guideRevision:'2026-09-30.1',contractRevision:lumiMaterialsRevision,
    rendererRevision:lumiMaterialsRevision,materialsReady:true,imagePolicy:'typed-regions-v1',pages:[...materialsPages],
    requiredCapabilities:['image.slot.v1','image.product-primary.v1','image.product-gallery.v1','text.plain.v1'],
    imageSlots:[
      ...lumiImageInventory.map(s=>({...base,...s,page:s.page as typeof materialsPages[number],role:'facility' as const,sourcePolicy:'illustration' as const,productScope:'none' as const,materialSource:'slot-image' as const,reusePolicy:'distinct-slot' as const,fit:'cover' as const,allowedMimeTypes:['image/jpeg','image/png','image/webp'],composition:'Approved business photo or illustration matching the light-blue and peach visual system. No text in images; no invented client logos or employee identity.',mobileComposition:'Keep the focal subject within the central 60%; a separate mobile crop can be supplied.'})),
      {...base,id:'hero-video-poster',page:'home',width:2560,height:1440,purpose:'Homepage video poster; video itself is configured through page Banner / Video.',role:'facility',sourcePolicy:'illustration',productScope:'none',materialSource:'slot-image',reusePolicy:'distinct-slot',fit:'cover',allowedMimeTypes:['image/jpeg','image/png','image/webp'],composition:'Wide, calm business collaboration scene with natural light and matching video composition.',mobileComposition:'Keep the team or main subject in the center.'},
      {...base,id:'product-main',page:'catalog',width:1200,height:1200,purpose:'Main approved service or product image, reused in list and detail',role:'main',productScope:'single-product',materialSource:'product-primary',reusePolicy:'same-product',repeat:'per-product',min:1,required:true,fit:'contain',allowedMimeTypes:['image/jpeg','image/png','image/webp'],composition:'Preserve the approved service subject or product identity.',mobileComposition:'Preserve the complete subject.'},
      {...base,id:'product-gallery',page:'detail',width:1200,height:1200,purpose:'Ordered supplemental service / product images',role:'detail',productScope:'single-product',materialSource:'product-gallery',reusePolicy:'same-product',repeat:'per-product-gallery',max:10,fit:'contain',allowedMimeTypes:['image/jpeg','image/png','image/webp'],composition:'Approved supplemental views only.',mobileComposition:'Preserve the complete subject.'},
    ],
    textSlots:[
      ...lumiTextInventory.map(s=>({...base,...s,page:s.page as typeof materialsPages[number],maxLines:8,format:'plain-text' as const,factSources:['brand','product'] as Array<'brand'|'product'>,factualPolicy})),
      ...[['hero-headline','home',100],['hero-subtitle','home',260],['primary-cta','home',40],['company-about','about',2500],['about-headline','about',160],['about-story','about',2500]].map(([id,page,max])=>({...base,id:String(id),page:page as typeof materialsPages[number],purpose:String(id),maxCodePoints:Number(max),maxLines:6,format:'plain-text' as const,factSources:['brand','product'] as Array<'brand'|'product'>,factualPolicy})),
      ...materialsPages.flatMap(page=>['title','description'].map(kind=>({...base,id:`${page}-seo-${kind}`,page,purpose:`${page} SEO ${kind}`,maxCodePoints:kind==='title'?70:170,maxLines:3,format:'plain-text' as const,factSources:['brand','product'] as Array<'brand'|'product'>,factualPolicy}))),
    ],
    optionalSections:[{id:'reference-claims',reason:'Sample testimonials and performance metrics are omitted from customer websites.'},{id:'reference-prices',reason:'Sample prices are replaced with a proposal enquiry; supply verified prices separately.'}],
    visualParameters:['palette.primary','palette.secondary','palette.background','palette.surface','palette.text','palette.mutedText','backgroundStyle','imageTreatment','compositionSummary'],contentPolicy:'b2b-confirmed-facts-only',
  };
}
