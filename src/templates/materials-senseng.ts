import{parseFragment,serialize,type DefaultTreeAdapterMap}from'parse5';
import type{Draft}from'../shared/model';
import{materialsPages,type MaterialsTemplateContract}from'../shared/materials';
import{renderSensengPage}from'./themes/senseng';
import{buildThemeContext,type ThemeContext}from'./themes/types';

type Node=DefaultTreeAdapterMap['node'];
type Element=DefaultTreeAdapterMap['element'];
const a=(n:Element,name:string)=>n.attrs.find(a=>a.name===name)?.value||'';
const clean=(s:string)=>s.trim().replace(/\s+/g,' ');
const textKey=(s:string,attribute='')=>`${attribute}:${clean(s)}`;
interface Inventory{profile:MaterialsTemplateContract;text:Record<string,Record<string,string>>;images:Record<string,Record<string,string>>}
const cache=new Map<string,Inventory>();
const base={min:1,max:1,required:true,repeat:'once' as const,binding:'supported' as const};
const textSlot=(id:string,page:typeof materialsPages[number],purpose:string,max=300)=>({...base,id,page,purpose,maxCodePoints:max,maxLines:max>100?5:3,factualPolicy:'Use confirmed brand and product facts only. No fabricated capabilities, certifications, prices or customer claims.'});
function demoDraft(id:Draft['template']):Draft{
  return{template:id,buildBranch:'template',templateConfirmed:true,company:{name:'__WR_COMPANY__',description:'__WR_COMPANY_DESCRIPTION__',type:'trader',email:'demo@example.invalid',contactName:'__WR_CONTACT__',phone:'__WR_PHONE__',whatsapp:'__WR_WHATSAPP__',facebook:'',instagram:'',x:''},products:[{id:'sample',name:'__WR_PRODUCT_NAME__',description:'__WR_PRODUCT_DESCRIPTION__',material:'__WR_MATERIAL__',dimensions:'__WR_DIMENSIONS__',imageAssetId:'sample'}],primaryProductId:'sample',country:'US',category:'',languages:['en'],brandColor:'#112233',copy:{en:{headline:'__WR_HEADLINE__',subtitle:'__WR_SUBTITLE__',about:'__WR_ABOUT__',cta:'__WR_CTA__'}},duration:8,direction:'',script:'',scriptRevision:0,scenes:[],storyboardRevision:0,heroAccepted:false};
}
/** Mark only static template copy. Live product/company/contact fields are never replaced. */
export function walkSensengMaterials(html:string,page:string,onText:(value:string,attribute:string)=>string,onImage:(source:string)=>string|undefined):string{
  const root=parseFragment(html);
  function visit(node:Node,ancestors:Element[]=[]){
    if('tagName'in node){
      if(['script','style','svg'].includes(node.tagName))return;
      const cls=a(node,'class');
      if(page==='home'&&cls.includes('senseng-hero-h1')){node.childNodes=parseFragment('__WR_MATERIAL_HEADLINE__').childNodes;return;}
      if(page==='home'&&cls.includes('senseng-hero-sub')){node.childNodes=parseFragment('__WR_MATERIAL_SUBTITLE__').childNodes;return;}
      if(page==='about'&&cls.includes('senseng-hero-sub')){node.childNodes=parseFragment('__WR_MATERIAL_ABOUT__').childNodes;return;}
      for(const attribute of node.attrs){
        if(['placeholder','aria-label'].includes(attribute.name)&&!attribute.value.includes('__WR_'))attribute.value=onText(attribute.value,attribute.name);
      }
      if(node.tagName==='img'||node.tagName==='video'){
        const attribute=node.tagName==='video'?'poster':'src';const source=a(node,attribute),id=onImage(source);
        if(id)node.attrs.push({name:'data-wr-material-image',value:id});
      }
      for(const child of [...node.childNodes])visit(child,[...ancestors,node]);
    }else if(node.nodeName==='#text'){
      const value=clean(node.value);
      if(value==='Send a wholesale inquiry'){node.value='__WR_MATERIAL_CTA__';return;}
      if(value&&!value.includes('__WR_')&&/[\p{L}\p{N}]/u.test(value)&&!ancestors.some(n=>/senseng-(p-card|catalog-card|detail-h1|detail-desc)|honeypot/.test(a(n,'class'))))node.value=onText(value,'');
    }else if('childNodes'in node)for(const child of [...node.childNodes])visit(child,ancestors);
  }
  visit(root);return serialize(root);
}
export function sensengMaterialInventory(id:'senseng-clean'|'senseng-video'):Inventory{
  const old=cache.get(id);if(old)return old;
  const d=demoDraft(id),imageSlots:MaterialsTemplateContract['imageSlots']=[],textSlots:MaterialsTemplateContract['textSlots']=[textSlot('hero-headline','home','B2B headline for the hero',100),textSlot('hero-subtitle','home','Short approved introduction',260),textSlot('primary-cta','home','Inquiry call to action',36),textSlot('company-about','about','Approved company introduction',2500)];
  const text:Inventory['text']={},images:Inventory['images']={};
  for(const page of materialsPages){
    text[page]={};images[page]={};
    textSlots.push(textSlot(`${page}-seo-title`,page,'Search title',70),textSlot(`${page}-seo-description`,page,'Search description',170));
    const options={projectId:'demo',page,lang:'en' as const,productId:'sample',assetUrl:()=>'/materials-demo/product.png',inquiryUrl:'',preview:false};
    walkSensengMaterials(renderSensengPage(buildThemeContext(d,options),id==='senseng-video',true),page,(value,attribute)=>{
      if(value==='demo@example.invalid'||value.includes('__WR_'))return value;
      const key=textKey(value,attribute);
      if(!text[page][key]){
        const slot=`${page}-copy-${Object.keys(text[page]).length}`;text[page][key]=slot;
        textSlots.push({...textSlot(slot,page,`${attribute||'Visible copy'}: ${value}`,attribute?100:Math.max(100,Math.min(600,value.length*2))),exampleText:value});
      }
      return value;
    },source=>{
      if(!source.startsWith('/templates/senseng/')||source.endsWith('hero-sky-v2.png'))return;
      const id=`${page}-${source.split('/').at(-1)!.replace(/\.[^.]+$/,'')}`;
      if(!images[page][source]){
        images[page][source]=id;
        imageSlots.push({...base,id,page,width:1536,height:source.endsWith('hero-bg.jpg')?425:1024,purpose:`${page} composition in ${source.split('/').at(-1)}; approved real products and brand imagery`,composition:page==='home'?'Wide composition with clear left half for text and product subjects on the right. Preserve actual product shape, colors and markings.':'Template page illustration; preserve product identity, leave room for adjacent text.',mobileComposition:'Use an optional mobile crop with full product subjects in the middle 60%.',fit:'contain',allowedMimeTypes:['image/png','image/jpeg','image/webp']});
      }return id;
    });
  }
  imageSlots.push({...base,id:'product-main',page:'catalog',repeat:'per-product',width:1000,height:1000,purpose:'Original product primary image in all cards and product detail',composition:'Full product centered',mobileComposition:'Full subject visible',fit:'contain',allowedMimeTypes:['image/png','image/jpeg','image/webp']},{...base,id:'product-gallery',page:'detail',repeat:'per-product-gallery',min:0,max:10,required:false,width:1000,height:1000,purpose:'Current product supplemental images, itemIndex from 1 matching galleryMediaIds',composition:'Full image without clipping key features',mobileComposition:'Full subject visible',fit:'contain',allowedMimeTypes:['image/png','image/jpeg','image/webp']});
  const profile:MaterialsTemplateContract={schemaVersion:'wr-template-materials-v1',templateId:id,guideRevision:'2026-09-17.1',contractRevision:`2026-09-17.${id}-materials.${id==='senseng-video'?2:1}`,materialsReady:true,pages:[...materialsPages],imageSlots,textSlots,optionalSections:[],visualParameters:['palette.primary','palette.secondary','palette.background','palette.surface','palette.text','palette.mutedText','backgroundStyle','imageTreatment','compositionSummary'],contentPolicy:'b2b-confirmed-facts-only'};
  const result={profile,text,images};cache.set(id,result);return result;
}
export function prepareSensengMaterials(ctx:ThemeContext):string{
  const inventory=sensengMaterialInventory(ctx.draft.template as 'senseng-clean'|'senseng-video');
  const text=inventory.text[ctx.page],images=inventory.images[ctx.page];
  return walkSensengMaterials(renderSensengPage(ctx,ctx.draft.template==='senseng-video'),ctx.page,(value,attribute)=>{
    const id=text[textKey(value,attribute)];
    return id?ctx.draft.materials!.textBindings.find(b=>b.slotId===id&&b.locale===ctx.lang)?.text||'':value;
  },source=>images[source]);
}
