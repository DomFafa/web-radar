import {parse,type DefaultTreeAdapterMap} from 'parse5';
import type {Draft} from '../shared/model';
import type {MaterialsTemplateContract} from '../shared/materials';
import {productAboutCollectionMaterialsRevision} from '../shared/product-native-materials';
import {productAboutCollectionContract} from './product-about-collection-materials';
import {imageContentBaseRevision,withConfirmedImageContent} from './materials-image-content';

const legacyTemplates=['senseng-candy','senseng-video','senseng-nature'];
export function usesLegacyAboutCollectionRevision(id:string,revision?:string):boolean{
 return legacyTemplates.includes(id)&&revision===productAboutCollectionMaterialsRevision(id);
}
/** The new image meaning still uses the same frozen About placement and layout. */
export function legacyAboutCollectionContract(source:MaterialsTemplateContract):MaterialsTemplateContract{
 return productAboutCollectionContract(withConfirmedImageContent(source));
}
export function legacyAboutCollectionRenderDraft(draft:Draft):Draft{
 if(!usesLegacyAboutCollectionRevision(draft.template,draft.materials?.contractRevision))return draft;
 return {...draft,materials:{...draft.materials!,contractRevision:imageContentBaseRevision(draft.template)}};
}

/** Only the new collection release shows the complete lead photo on mobile and
 * moves the frozen Candy/Nature overlay card below the photograph. */
export function withLegacyAboutCollectionCaption(html:string,id:string,revision:string|undefined,page:string):string{
 if(page!=='about'||!usesLegacyAboutCollectionRevision(id,revision))return html;
 type Element=DefaultTreeAdapterMap['element'];
 const attr=(node:Element,name:string)=>node.attrs.find(attribute=>attribute.name===name)?.value;
 const find=(node:DefaultTreeAdapterMap['node']):Element|undefined=>{
  if('tagName' in node&&attr(node,'data-wr-material-image')==='about-primary-image')return node;
  if('childNodes' in node)for(const child of node.childNodes){const found=find(child);if(found)return found;}
 };
 const image=find(parse(html,{sourceCodeLocationInfo:true}));
 let frame=image?.parentNode;
 // Responsive material images may have a picture wrapper inside the same frame.
 if(frame&&'tagName' in frame&&frame.tagName==='picture')frame=frame.parentNode;
 if(!frame||!('tagName' in frame))throw Error('Missing About collection frame');
 const frameRange=frame.sourceCodeLocation;
 if(!frameRange)throw Error('Missing About collection frame location');
 // Use the loaded image's intrinsic ratio, including a supplied mobile source.
 // Fixed-height cover frames crop the outer products even with generous margins.
 const mobileLabels=id==='senseng-video'?'.wr-materials-site [data-wr-about-collection-frame]>div{position:static!important;margin:8px 14px;width:fit-content;max-width:calc(100% - 28px)}.wr-materials-site [data-wr-about-collection-frame]>div:last-child{margin-left:auto}':'';
 const mobileStyle=`<style data-wr-about-collection-mobile="">@media(max-width:767px){.wr-materials-site [data-wr-about-collection-frame]{display:block!important;height:auto!important;min-height:0!important}.wr-materials-site [data-wr-about-collection-frame]>picture{display:block!important;position:static!important;height:auto!important}.wr-materials-site [data-wr-about-collection-frame] img[data-wr-material-image="about-primary-image"]{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;object-position:center!important}${mobileLabels}}</style>`;
 const replaceFrame=(replacement:string)=>
  (html.slice(0,frameRange.startOffset)+replacement+html.slice(frameRange.endOffset)).replace('</head>',`${mobileStyle}</head>`);
 if(id==='senseng-video')return replaceFrame(html.slice(frameRange.startOffset,frameRange.endOffset).replace('<div ','<div data-wr-about-collection-frame="" '));
 const caption=frame.childNodes.find((node):node is Element=>'tagName' in node&&node.tagName==='div'&&attr(node,'data-wr-about-wide-padding')!==undefined&&/z-index:\s*2/.test(attr(node,'style')||''));
 const captionRange=caption?.sourceCodeLocation;
 if(!captionRange)throw Error('Missing About collection caption');
 const frameHtml=(html.slice(frameRange.startOffset,captionRange.startOffset)+html.slice(captionRange.endOffset,frameRange.endOffset)).replace('<div ','<div data-wr-about-collection-frame="" ');
 const card=html.slice(captionRange.startOffset,captionRange.endOffset)
  .replace('<div ','<div data-wr-about-collection-caption="" ')
  .replace(/style="([^"]*)"/,(_,style:string)=>`style="${style};align-self:center;width:calc(100% - 32px);box-sizing:border-box;margin-bottom:16px;"`);
 const panel=`<div data-wr-about-collection-panel="" style="display:flex;flex-direction:column;gap:16px;min-width:0;">${frameHtml}${card}</div>`;
 return replaceFrame(panel);
}
