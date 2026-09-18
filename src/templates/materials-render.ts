import { parseFragment, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type {Draft,Product}from'../shared/model';
import type{AppliedMaterials}from'../shared/materials';
import{prepareMaterialsReference}from'./materials';
import{esc,safeUrl,type RenderOptions,type ThemeContext}from'./themes/types';
import{prepareSensengMaterials}from'./materials-senseng';

type Binding=AppliedMaterials['imageBindings'][number];
const position=(p:Binding['focalPoint'])=>`${p.x*100}% ${p.y*100}%`;
const cssUrl=(url:string)=>`url(${JSON.stringify(url).replace(/</g,'\\3c ')})`;
function imageStyle(binding:Binding){return`object-fit:${binding.fit};object-position:${position(binding.focalPoint)};--wr-material-fit:${binding.fit};--wr-material-position:${position(binding.focalPoint)};--wr-mobile-position:${position(binding.mobileFocalPoint||binding.focalPoint)};`;}
export function materialImage(binding:Binding,options:RenderOptions,assetId=binding.assetId,alt?:string):string{
  const url=safeUrl(options.assetUrl(assetId),options.preview);
  const mobile=assetId===binding.assetId&&binding.mobileAssetId?safeUrl(options.assetUrl(binding.mobileAssetId),options.preview):'';
  const img=`<img data-wr-material-photo="" src="${esc(url)}" alt="${esc(alt||binding.alt[options.lang]||binding.alt.en||'')}" style="${esc(imageStyle(binding))}" loading="lazy">`;
  return mobile?`<picture><source media="(max-width:767px)" srcset="${esc(mobile)}">${img}</picture>`:img;
}
export function materialProductImage(draft:Draft,options:RenderOptions,product:Product,assetId=product.imageAssetId):string|undefined{
  if(!draft.materials||!assetId)return;
  const binding=draft.materials.imageBindings.find(b=>b.productId===product.id&&(assetId===product.imageAssetId?b.slotId==='product-main':b.slotId==='product-gallery'&&b.assetId===assetId));
  return binding?materialImage(binding,options,assetId,product.translations?.[options.lang]?.name||product.name):undefined;
}
export function materialsReferenceBody(draft:Draft,options:RenderOptions):string{
  const materials=draft.materials!;
  let markup=prepareMaterialsReference(draft.template)
    .replace(/__WR_MATERIAL_TEXT_(\d+)__/g,(_,index:string)=>esc(materials.textBindings.find(b=>b.slotId===`layout-text-${index}`&&b.locale===options.lang)?.text||''))
    .replaceAll('__WR_MATERIAL_SUBTITLE__',esc(draft.copy[options.lang]?.subtitle||''))
    .replaceAll('__WR_MATERIAL_CTA__',esc(draft.copy[options.lang]?.cta||''));
  return bindMaterialsImages(markup,draft,options);
}
export function materialsSensengBody(ctx:ThemeContext):string{
  const copy=ctx.draft.copy[ctx.lang];
  const markup=prepareSensengMaterials(ctx).replaceAll('__WR_MATERIAL_HEADLINE__',esc(copy?.headline||''))
    .replaceAll('__WR_MATERIAL_SUBTITLE__',esc(copy?.subtitle||''))
    .replaceAll('__WR_MATERIAL_CTA__',esc(copy?.cta||''))
    .replaceAll('__WR_MATERIAL_ABOUT__',esc(copy?.about||''));
  return bindMaterialsImages(markup,ctx.draft,ctx.options);
}
function bindMaterialsImages(markup:string,draft:Draft,options:RenderOptions):string{
  const materials=draft.materials!;
  const root=parseFragment(markup);
  type Node=DefaultTreeAdapterMap['node'];
  function visit(node:Node){
    if('tagName'in node){
      // Remove the unsupported promo and spacing left by omitted news/brands only
      // at render time, after the published layout-text slots have been assigned.
      if(draft.template==='juno-toys'&&node.tagName==='section'&&['6f48de11','67fddce','7b2b7e3','87636bb','54828a1'].includes(node.attrs.find(a=>a.name==='data-id')?.value||'')){
        node.parentNode!.childNodes=node.parentNode!.childNodes.filter(n=>n!==node);return;
      }
      if((node.attrs.find(a=>a.name==='class')?.value||'').split(/\s+/).includes('senseng-thumb-btn')){node.attrs=node.attrs.filter(a=>a.name!=='onclick');node.attrs.push({name:'data-wr-material-thumb',value:''});}
      let slot=node.attrs.find(a=>a.name==='data-wr-material-image')?.value;
      const source=node.attrs.find(a=>a.name==='src')?.value;
      const productBinding=!slot&&node.tagName==='img'?materials.imageBindings.find(b=>b.productId&&options.assetUrl(b.assetId)===source):undefined;
      if(slot||productBinding){
        const binding=productBinding||materials.imageBindings.find(b=>b.slotId===slot);
        if(!binding)throw Error(`Missing validated materials binding ${slot}`);
        slot=binding.slotId;
        if(node.tagName==='video'){
          const desktop=safeUrl(options.assetUrl(binding.assetId),options.preview),mobile=binding.mobileAssetId?safeUrl(options.assetUrl(binding.mobileAssetId),options.preview):desktop;
          const poster=node.attrs.find(a=>a.name==='poster');if(poster)poster.value=desktop;
          node.attrs.push({name:'data-wr-desktop-poster',value:desktop},{name:'data-wr-mobile-poster',value:mobile},{name:'data-wr-material-photo',value:''},{name:'style',value:imageStyle(binding)});return;
        }
        if(node.tagName==='img'){
          const fragment=parseFragment(materialImage(binding,options));
          const replacement=fragment.childNodes[0] as DefaultTreeAdapterMap['element'];
          const image=replacement.tagName==='img'?replacement:replacement.childNodes.find(n=>'tagName'in n&&n.tagName==='img') as DefaultTreeAdapterMap['element'];
          for(const a of node.attrs)if(!['src','srcset','alt','style','data-wr-material-image'].includes(a.name)&&!image.attrs.some(b=>b.name===a.name))image.attrs.push(a);
          if(image.attrs.some(a=>a.name==='fetchpriority'&&a.value==='high'))image.attrs.find(a=>a.name==='loading')!.value='eager';
          image.attrs.push({name:'data-wr-material-image',value:slot});
          if(replacement.tagName==='picture')replacement.attrs.push({name:'style',value:'display:contents'});
          const parent=node.parentNode!;replacement.parentNode=parent;parent.childNodes[parent.childNodes.indexOf(node)]=replacement;return;
        }
        const desktop=safeUrl(options.assetUrl(binding.assetId),options.preview),mobile=binding.mobileAssetId?safeUrl(options.assetUrl(binding.mobileAssetId),options.preview):desktop;
        node.attrs.push({name:'style',value:`background-image:${cssUrl(desktop)};background-size:${binding.fit};background-position:${position(binding.focalPoint)};background-repeat:no-repeat;--wr-material-bg-fit:${binding.fit};--wr-mobile-bg:${cssUrl(mobile)};--wr-mobile-position:${position(binding.mobileFocalPoint||binding.focalPoint)};`});
        node.attrs.push({name:'aria-label',value:binding.alt[options.lang]||binding.alt.en||''});
      }
    }
    if('childNodes'in node)for(const child of [...node.childNodes])visit(child);
  }
  visit(root);return serialize(root);
}
export function materialsThemeStyle(draft:Draft):string{
  if(!draft.materials)return'';
  const{palette:p,backgroundStyle,imageTreatment}=draft.materials.visual;
  const background=backgroundStyle==='soft-gradient'?`linear-gradient(135deg,${p.background},${p.surface},${p.secondary}22)`:
    backgroundStyle==='subtle-shapes'?`radial-gradient(ellipse at 90% 10%,${p.secondary}25,transparent 40%),radial-gradient(ellipse at 10% 70%,${p.primary}15,transparent 35%),linear-gradient(${p.background},${p.background})`:`linear-gradient(${p.background},${p.background})`;
  const filter=imageTreatment==='soft'?'saturate(.94) contrast(.98)':imageTreatment==='crisp'?'saturate(1.03) contrast(1.04)':'none';
  return`<style id="wr-materials-theme">body.wr-materials-site{--wr-accent:${p.primary};--wr-secondary:${p.secondary};--wr-ink:${p.text};--wr-surface:${p.surface};--wr-background:${p.background};--wr-muted:${p.mutedText};background:${background}!important;color:${p.text}!important;background-attachment:fixed}
  .wr-materials-site,.wr-materials-site [class*="scheme_"]{--theme-color-text_link:${p.primary};--theme-color-text_hover:${p.secondary};--theme-color-text_dark:${p.text};--theme-color-text:${p.text};--theme-color-text_light:${p.mutedText};--theme-color-bg_color:${p.background};--theme-color-alter_bg_color:${p.surface};--theme-color-alter_link:${p.primary};--theme-color-extra_bg_color:${p.text}}
  .wr-materials-site .body_wrap,.wr-materials-site .page_wrap,.wr-materials-site .page_content_wrap{background:transparent!important}
  .wr-materials-site h1,.wr-materials-site h2,.wr-materials-site h3,.wr-materials-site h4{overflow-wrap:anywhere;text-wrap:balance;max-width:100%}
  .wr-materials-site p{overflow-wrap:anywhere;color:var(--wr-muted)}.wr-materials-site [data-wr-material-photo]{filter:${filter};max-width:100%;height:auto;object-fit:var(--wr-material-fit)!important;object-position:var(--wr-material-position)!important}
  .wr-materials-site .wr-product-card,.wr-materials-site .wr-inner{background:var(--wr-surface)}.wr-materials-site .wr-juno-copy h1,.wr-materials-site .wr-juno-copy h2{font-size:clamp(2rem,4.2vw,4.6rem);line-height:1.13;color:var(--wr-ink)}
  .wr-materials-site .wr-juno-copy a,.wr-materials-site .sc_button{background:var(--wr-accent)!important;color:#fff!important}
  .wr-materials-site .wr-juno-copy{position:relative;z-index:2}
  .wr-materials-site .senseng-header,.wr-materials-site .senseng-footer,.wr-materials-site .senseng-showcase-card,.wr-materials-site .senseng-catalog-card,.wr-materials-site .senseng-p-card,.wr-materials-site .senseng-inquiry-box{background:var(--wr-surface)!important;color:var(--wr-ink)!important}
  .wr-materials-site .senseng-hero,.wr-materials-site .senseng-about-hero,.wr-materials-site .senseng-contact-hero,.wr-materials-site .senseng-newsletter{background:${background}!important}
  .wr-materials-site [class^="senseng-"] h1,.wr-materials-site [class^="senseng-"] h2,.wr-materials-site [class^="senseng-"] h3,.wr-materials-site [class^="senseng-"] h4,.wr-materials-site [class^="senseng-"] h5{color:var(--wr-ink)!important}
  .wr-materials-site .senseng-btn-pill,.wr-materials-site .senseng-btn-detail{background:var(--wr-accent)!important;border-color:var(--wr-accent)!important;color:var(--brand-ink,#fff)!important}
  .wr-materials-site .senseng-logo{color:var(--wr-accent)!important;font-weight:900;font-size:1.6rem}.wr-materials-site .senseng-logo img{max-width:170px;max-height:60px;object-fit:contain}
  .wr-materials-site .senseng-hero-video-full{background:var(--wr-background)}
  .wr-materials-site .senseng-hero-video-full video{width:100%;height:100%;left:0}
  .wr-materials-site .senseng-hero-video-overlay{background:linear-gradient(180deg,#0005,#000b)}
  .wr-materials-site .senseng-hero-video-content h1,.wr-materials-site .senseng-hero-video-content p{color:#fff!important}
  .wr-materials-site .senseng-nav-link{color:var(--wr-ink)}.wr-materials-site .senseng-nav-link.active{border-color:var(--wr-accent)}
  .wr-materials-site .senseng-detail-grid>*,.wr-materials-site .senseng-form>*,.wr-materials-site .senseng-form input,.wr-materials-site .senseng-form select,.wr-materials-site .senseng-form textarea{min-width:0}
  @media(min-width:1101px){.wr-materials-site .senseng-detail-grid{grid-template-columns:minmax(0,460px) minmax(0,1fr) minmax(0,430px)}}
  .wr-materials-site .senseng-reference-scene{mask-image:none!important}
  .wr-materials-site .senseng-hero-scene img,.wr-materials-site .senseng-reference-scene img{width:100%;height:100%!important;top:0!important;max-width:none;mask-image:none}
  @media(max-width:767px){.wr-materials-site [data-wr-material-image]:not(img){background-image:var(--wr-mobile-bg)!important;background-position:var(--wr-mobile-position)!important}.wr-materials-site [data-wr-material-photo]{object-position:var(--wr-mobile-position)!important}.wr-materials-site .wr-juno-copy{max-width:90%;padding:1rem}.wr-materials-site .wr-juno-copy h1,.wr-materials-site .wr-juno-copy h2{font-size:clamp(1.7rem,7vw,2.6rem)}.wr-materials-site .senseng-hero-scene,.wr-materials-site .senseng-reference-scene{width:100%;margin-left:0;aspect-ratio:3/2}}
  @media(min-width:768px){
    .wr-materials-site.juno-toys .wr-juno-hero{height:auto;min-height:650px}
    .wr-materials-site.juno-toys .wr-juno-hero [data-wr-slide]{position:relative;inset:auto;height:auto;min-height:650px}
    .wr-materials-site.juno-toys .wr-juno-copy{padding:96px 0 64px}
    .wr-materials-site.juno-toys .wr-juno-copy h1,.wr-materials-site.juno-toys .wr-juno-copy h2{font-size:clamp(2rem,3.5vw,4rem)}
  }
  @media(max-width:767px){
    .wr-materials-site.juno-toys .wr-juno-hero{height:auto}
    .wr-materials-site.juno-toys .wr-juno-hero [data-wr-slide]{position:relative;inset:auto;height:auto;background-image:none!important}
    .wr-materials-site.juno-toys .wr-juno-hero [data-wr-slide]::after{content:"";display:block;aspect-ratio:16/9;background-image:var(--wr-mobile-bg);background-size:contain;background-position:var(--wr-mobile-position);background-repeat:no-repeat}
    .wr-materials-site.juno-toys .wr-juno-copy{max-width:none;width:auto;height:auto;padding:30px 24px;background:var(--wr-background)}
    .wr-materials-site.juno-toys .wr-juno-copy h1,.wr-materials-site.juno-toys .wr-juno-copy h2{max-width:none;letter-spacing:-.5px}
    .wr-materials-site.juno-toys .wr-juno-clouds{display:none}
    .wr-materials-site.juno-toys .wr-juno-hero>button{top:auto;bottom:18px}
  }
  </style>`;
}
export function materialsSeo(draft:Draft,options:RenderOptions):{title:string;description:string}|undefined{
  if(!draft.materials)return;
  const copy=(suffix:string)=>draft.materials!.textBindings.find(b=>b.slotId===`${options.page}-${suffix}`&&b.locale===options.lang)?.text||'';
  return{title:copy('seo-title'),description:copy('seo-description')};
}
