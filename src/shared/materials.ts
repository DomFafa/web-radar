import { z } from 'zod';
import type { Principal } from './model';

export const materialsLocales = ['en', 'de', 'fr', 'es', 'pt', 'it'] as const;
export const materialsPages = ['home', 'catalog', 'detail', 'about', 'contact'] as const;
const id = z.string().min(1).max(200);
const text = z.string().max(12000);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const locale = z.enum(materialsLocales);
const localizedText = z.partialRecord(locale, text);
const facts = z.array(id).max(100);
const point = z.strictObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });
export const materialsImageRoles=['scene','front','packaging','collection','main','detail','facility','logistics']as const;
export const materialsDisplaySelectionSchema=z.strictObject({sceneProductIds:z.array(id).max(20),featuredProductIds:z.array(id).max(20)});
export type MaterialsDisplaySelection=z.infer<typeof materialsDisplaySelectionSchema>;
export const materialsPrincipalSchema = z.strictObject({
  userId:id, authSubject:id, email:z.email(), displayName:z.string().max(200),
  systemRole:z.enum(['super_admin','user']), workspaceId:id,
  workspaceRole:z.enum(['admin','member']), workspaceName:z.string().max(300),
});
export const materialsVisualSchema = z.strictObject({
  palette:z.strictObject({ primary:z.string().regex(/^#[a-fA-F0-9]{6}$/),secondary:z.string().regex(/^#[a-fA-F0-9]{6}$/),background:z.string().regex(/^#[a-fA-F0-9]{6}$/),surface:z.string().regex(/^#[a-fA-F0-9]{6}$/),text:z.string().regex(/^#[a-fA-F0-9]{6}$/),mutedText:z.string().regex(/^#[a-fA-F0-9]{6}$/) }),
  backgroundStyle:z.enum(['plain','soft-gradient','subtle-shapes']),
  imageTreatment:z.enum(['natural','soft','crisp']), compositionSummary:text,
});
export const materialsImageBindingSchema = z.strictObject({
  slotId:id,mediaId:id,mobileMediaId:id.optional(),productId:id.optional(),itemIndex:z.number().int().min(0).max(255).optional(),
  fit:z.enum(['cover','contain']),focalPoint:point,mobileFocalPoint:point.optional(),alt:localizedText,
  role:z.enum(materialsImageRoles).optional(),depictedProductIds:z.array(id).max(20).optional(),evidenceMediaIds:z.array(id).min(1).max(11).optional(),
});
export const materialsTextBindingSchema = z.strictObject({
  slotId:id,locale,text,productId:id.optional(),itemIndex:z.number().int().min(0).max(255).optional(),factReferences:facts,
});
export const materialsMediaSchema = z.strictObject({
  id,sourceAssetId:id,sourceVersion:id,sha256:hash,
  mimeType:z.enum(['image/png','image/jpeg','image/webp','image/x-icon','image/vnd.microsoft.icon']),
  bytes:z.number().int().min(1).max(20*1024*1024),width:z.number().int().min(1).max(32768),height:z.number().int().min(1).max(32768),
});
export const confirmedMaterialsSchema = z.strictObject({
  template:z.strictObject({id,guideRevision:id,contractRevision:id}),country:z.string().min(1).max(200),
  locales:z.array(locale).min(1).max(2),primaryProductId:id,
  brand:z.strictObject({
    profileId:id,profileVersion:id,name:z.string().min(1).max(300),description:text,
    businessType:z.enum(['factory','trader']).optional(),slogan:z.string().max(300).optional(),address:text.optional(),establishedYear:z.string().max(300).optional(),certifications:text.optional(),capabilities:text.optional(),
    targetMarkets:text.optional(),customerTypes:text.optional(),cooperationProcess:text.optional(),
    linkedin:z.string().max(300).optional(),facebook:z.string().max(300).optional(),instagram:z.string().max(300).optional(),x:z.string().max(300).optional(),logoMediaId:id.optional(),faviconMediaId:id.optional(),
  }),
  contact:z.strictObject({cardId:id,cardVersion:id,name:z.string().min(1).max(300),email:z.email().max(254),phone:z.string().max(200).optional(),whatsapp:z.string().max(200).optional()}),
  products:z.array(z.strictObject({
    id,sourceVersion:id,name:z.string().min(1).max(300),description:text,material:text,dimensions:z.string().max(300),
    primaryMediaId:id,galleryMediaIds:z.array(id).min(1).max(11),tagline:z.string().max(160).optional(),sellingPoints:z.array(z.string().max(180)).max(5).optional(),applications:z.array(z.string().max(180)).max(5).optional(),
    translations:z.partialRecord(locale,z.strictObject({name:z.string().min(1).max(300),description:text})).optional(),factReferences:facts,
  })).min(1).max(20),
  facts:z.array(z.strictObject({id,text,source:text})).max(500),visual:materialsVisualSchema,
  media:z.array(materialsMediaSchema).min(1).max(256),imageBindings:z.array(materialsImageBindingSchema).max(512),
  textBindings:z.array(materialsTextBindingSchema).max(1500),omittedSectionIds:z.array(id).max(100),
  displaySelection:materialsDisplaySelectionSchema.optional(),
}).superRefine((m,ctx)=>{
  const issue=(path:(string|number)[],message:string)=>ctx.addIssue({code:'custom',path,message});
  const unique=(values:string[],path:(string|number)[])=>{if(new Set(values).size!==values.length)issue(path,'Duplicate identity or binding target');};
  unique(m.products.map(p=>p.id),['products']);unique(m.media.map(p=>p.id),['media']);unique(m.facts.map(p=>p.id),['facts']);unique(m.locales,['locales']);unique(m.omittedSectionIds,['omittedSectionIds']);
  if(m.locales[0]!=='en')issue(['locales'],'English must be first');
  const productIds=new Set(m.products.map(p=>p.id)),mediaIds=new Set(m.media.map(p=>p.id)),factIds=new Set(m.facts.map(p=>p.id));
  if(m.displaySelection)for(const group of ['sceneProductIds','featuredProductIds']as const){
    unique(m.displaySelection[group],['displaySelection',group]);
    if(m.displaySelection[group].some(id=>!productIds.has(id)))issue(['displaySelection',group],'Unknown selected product');
  }
  if(!productIds.has(m.primaryProductId))issue(['primaryProductId'],'Unknown primary product');
  const mediaRef=(value:string|undefined,path:(string|number)[])=>{if(value&&!mediaIds.has(value))issue(path,'Unknown media');};
  const factRefs=(refs:string[],path:(string|number)[])=>{if(refs.some(f=>!factIds.has(f)))issue(path,'Unknown fact reference');};
  mediaRef(m.brand.logoMediaId,['brand','logoMediaId']);mediaRef(m.brand.faviconMediaId,['brand','faviconMediaId']);
  m.products.forEach((p,i)=>{
    mediaRef(p.primaryMediaId,['products',i,'primaryMediaId']);p.galleryMediaIds.forEach((v,j)=>mediaRef(v,['products',i,'galleryMediaIds',j]));unique(p.galleryMediaIds,['products',i,'galleryMediaIds']);
    if(p.galleryMediaIds[0]!==p.primaryMediaId)issue(['products',i,'galleryMediaIds'],'Original primary image must be first');
    factRefs(p.factReferences,['products',i,'factReferences']);
    for(const l of m.locales)if(l!=='en'&&!p.translations?.[l])issue(['products',i,'translations',l],'Selected locale is missing');
  });
  const target=(b:{slotId:string;productId?:string;itemIndex?:number})=>JSON.stringify([b.slotId,b.productId??null,b.itemIndex??null]);
  unique(m.imageBindings.map(target),['imageBindings']);unique(m.textBindings.map(b=>target(b)+b.locale),['textBindings']);
  m.imageBindings.forEach((b,i)=>{
    mediaRef(b.mediaId,['imageBindings',i,'mediaId']);mediaRef(b.mobileMediaId,['imageBindings',i,'mobileMediaId']);
    b.evidenceMediaIds?.forEach((v,j)=>mediaRef(v,['imageBindings',i,'evidenceMediaIds',j]));
    if(b.depictedProductIds){unique(b.depictedProductIds,['imageBindings',i,'depictedProductIds']);if(b.depictedProductIds.some(p=>!productIds.has(p)))issue(['imageBindings',i,'depictedProductIds'],'Unknown depicted product');}
    if(b.productId&&!productIds.has(b.productId))issue(['imageBindings',i,'productId'],'Unknown product');
    for(const l of m.locales)if(!b.alt[l]?.trim())issue(['imageBindings',i,'alt',l],'Selected locale alt text is missing');
  });
  m.textBindings.forEach((b,i)=>{
    if(!m.locales.includes(b.locale))issue(['textBindings',i,'locale'],'Locale is not selected');
    if(b.productId&&!productIds.has(b.productId))issue(['textBindings',i,'productId'],'Unknown product');
    factRefs(b.factReferences,['textBindings',i,'factReferences']);
  });
});
export const materialsSubmissionSchema = z.strictObject({
  schemaVersion:z.literal('wr-materials-v1'),submissionId:z.uuid(),principal:materialsPrincipalSchema,parentOrigin:z.url().max(500),
  target:z.discriminatedUnion('mode',[z.strictObject({mode:z.literal('create'),name:z.string().min(1).max(200)}),z.strictObject({mode:z.literal('update'),projectId:id,expectedVersion:z.number().int().min(1)})]),
  source:z.strictObject({materialsId:id,revision:z.number().int().min(1)}),
  confirmation:z.strictObject({status:z.literal('confirmed'),confirmedAt:z.iso.datetime(),contentSha256:hash}),materials:confirmedMaterialsSchema,
});
export type MaterialsSubmission=z.infer<typeof materialsSubmissionSchema>;
export type ConfirmedMaterials=z.infer<typeof confirmedMaterialsSchema>;
export type MaterialsMedia=z.infer<typeof materialsMediaSchema>;
export type MaterialsImageBinding=z.infer<typeof materialsImageBindingSchema>;
export type MaterialsTextBinding=z.infer<typeof materialsTextBindingSchema>;
export type MaterialsVisual=z.infer<typeof materialsVisualSchema>;
export interface MaterialsReceipt {
  schemaVersion:'wr-materials-receipt-v1';submissionId:string;state:'receiving'|'accepted'|'failed';contentSha256:string;receivedMedia:number;totalMedia:number;
  projectId?:string;projectVersion?:number;nextAction?:'open-web-radar';entry?:'prepared-materials';autoPublish:false;retryable?:boolean;
  error?:{code:string;message:string;issues?:Array<{path:string;code:string;message:string}>};
}
interface Slot {
  id:string;page:typeof materialsPages[number];purpose:string;min:number;max:number;required:boolean;binding:'supported'|'unsupported';
}
export interface MaterialsTemplateContract {
  schemaVersion:'wr-template-materials-v1';templateId:string;guideRevision:string;contractRevision:string;materialsReady:boolean;pages:Array<typeof materialsPages[number]>;
  imagePolicy?:'typed-regions-v1';selectionGroups?:{scene:number;featured:number};
  imageSlots:Array<Slot & {repeat:'once'|'per-product'|'per-product-gallery'|'fixed'|'per-selection';selectionGroup?:'scene'|'featured';role?:typeof materialsImageRoles[number];sourcePolicy?:'product-reference'|'illustration';maxProducts?:number;width:number;height:number;composition:string;mobileComposition:string;fit:'cover'|'contain';allowedMimeTypes:string[]}>;
  textSlots:Array<Slot & {repeat:'once'|'per-product'|'fixed';maxCodePoints:number;maxLines:number;factualPolicy:string;exampleText?:string}>;
  optionalSections:Array<{id:string;reason:string}>;visualParameters:string[];contentPolicy:'b2b-confirmed-facts-only';
}
/** Applied fields are editable; receipt/source provenance belongs on Project, not this draft. */
export interface AppliedMaterials {
  templateId:string;contractRevision:string;visual:MaterialsVisual;
  imageBindings:Array<Omit<MaterialsImageBinding,'mediaId'|'mobileMediaId'|'evidenceMediaIds'> & {assetId:string;mobileAssetId?:string;evidenceAssetIds?:string[]}>;
  textBindings:MaterialsTextBinding[];omittedSectionIds:string[];
  displaySelection?:MaterialsDisplaySelection;
}
export const appliedMaterialsSchema=z.strictObject({
  templateId:id,contractRevision:id,visual:materialsVisualSchema,
  imageBindings:z.array(materialsImageBindingSchema.omit({mediaId:true,mobileMediaId:true,evidenceMediaIds:true}).extend({assetId:id,mobileAssetId:id.optional(),evidenceAssetIds:z.array(id).min(1).max(11).optional()})).max(512),
  textBindings:z.array(materialsTextBindingSchema).max(1500),omittedSectionIds:z.array(id).max(100),
  displaySelection:materialsDisplaySelectionSchema.optional(),
});
export interface MaterialsProvenance {
  submissionId:string;source:MaterialsSubmission['source'];contentSha256:string;snapshotKey:string;acceptedAt:string;
}
export function isMaterialsAccount(principal: Pick<Principal,'email'>):boolean {
  return principal.email.trim().toLowerCase()==='vc.ddom@gmail.com';
}

export function validAboutHighlights(text:string):boolean{
  const lines=text.trim().split(/\r?\n/);
  return lines.length>=1&&lines.length<=4&&lines.every(line=>{const parts=line.split(/[|丨]/).map(value=>value.trim());return parts.length===3&&parts.every(Boolean);});
}
