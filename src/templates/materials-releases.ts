import { additionalMaterialsReleases, type MaterialsTemplateRelease } from './materials-release-registry';
import type { Draft } from '../shared/model';
import type { MaterialsTemplateContract } from '../shared/materials';
import type { RenderOptions } from './index';
import { getMaterialsTemplate as frozenContract, renderSite as frozenRender } from './releases/baseline-20260922.mjs';
import { frozenMaterialsPreviewRuntime } from './releases/baseline-preview-20260922';
import { getModernMaterialsTemplate, getTypedMaterialsTemplate } from './materials-typed';

export const materialsRendererRevision = '2026-09-22.baseline-09fb979';
export const executableMaterialsRevision = (id: string) => `2026-09-22.${id}-materials.4`;

/** Execution metadata is published only in a new revision. Historical documents stay byte-for-byte unchanged. */
export function executableMaterialsContract(id: string): MaterialsTemplateContract | undefined {
  const contract = frozenContract(id) ?? getModernMaterialsTemplate(id);
  if (!contract) return;
  contract.contractRevision = executableMaterialsRevision(id);
  return declareExecutionMetadata(contract);
}

function declareExecutionMetadata(contract:MaterialsTemplateContract):MaterialsTemplateContract {
  contract.rendererRevision = materialsRendererRevision;
  const capabilities = new Set<string>();
  for (const slot of contract.imageSlots) {
    slot.materialSource = slot.id === 'product-main' ? 'product-primary' : slot.id === 'product-gallery' ? 'product-gallery' : 'slot-image';
    slot.productScope = slot.role === 'collection' ? 'all-products' : slot.sourcePolicy === 'illustration' ? 'none' : 'single-product';
    slot.reusePolicy = slot.role === 'collection' || slot.productScope === 'none' ? 'distinct-slot' : 'same-product';
    capabilities.add(slot.materialSource === 'slot-image' ? 'image.slot.v1' : `image.${slot.materialSource}.v1`);
    if (slot.role === 'collection') capabilities.add('image.collection.v1');
    if (slot.sourcePolicy === 'illustration') capabilities.add('image.illustration.v1');
    if (slot.role === 'packaging') capabilities.add('image.packaging-evidence.v1');
    if (slot.repeat === 'per-selection') capabilities.add('selection.product-groups.v1');
  }
  for (const slot of contract.textSlots) {
    slot.format = slot.id === 'about-highlights' ? 'value-label-description-lines' : 'plain-text';
    slot.factSources = ['brand', 'product'];
    capabilities.add(slot.format === 'plain-text' ? 'text.plain.v1' : 'text.value-label-description.v1');
  }
  contract.requiredCapabilities = [...capabilities].sort();
  return contract;
}

/** This snapshot never imports the mutable standalone theme tree. */
export function releasedMaterialsContract(id: string, revision?: string): MaterialsTemplateContract | undefined {
  const release = availableMaterialsTemplateReleases().find(item => item.contract.templateId === id && (!revision || item.contract.contractRevision === revision));
  if (release) return structuredClone(release.contract);
  if (!revision || revision === executableMaterialsRevision(id)) return executableMaterialsContract(id);
  const frozen = frozenContract(id, revision);
  if (frozen) return frozen;
  const modern = getModernMaterialsTemplate(id, revision);
  if (modern && (!revision || modern.contractRevision === revision)) return modern;
  const typed = getTypedMaterialsTemplate(id);
  if (typed && typed.contractRevision === revision) return typed;
}

export function renderReleasedMaterials(draft: Draft, options: RenderOptions): string | undefined {
  const revision = draft.materials?.contractRevision;
  if (!revision) return;
  const release = availableMaterialsTemplateReleases().find(item => item.contract.templateId === draft.template && item.contract.contractRevision === revision);
  if (release) return renderMaterialsTemplateRelease(release,draft,options);
  const original = frozenContract(draft.template, revision === executableMaterialsRevision(draft.template) ? undefined : revision);
  if (!original) return;
  const frozenDraft = revision === original.contractRevision ? draft : { ...draft, materials: { ...draft.materials!, contractRevision: original.contractRevision } };
  return frozenRender(frozenDraft, options);
}

/** Preview drops page scripts at its sandbox boundary, so its trusted replacement is versioned too. */
export function releasedMaterialsPreviewRuntime(draft: Draft): string | undefined {
  const revision = draft.materials?.contractRevision;
  if (revision && releasedMaterialsContract(draft.template, revision)) return frozenMaterialsPreviewRuntime;
}

/** Explicit mappings let a new template choose stable slot names without Product Radar knowing them. */
export function renderMaterialsTemplateRelease(release: MaterialsTemplateRelease, draft: Draft, options: RenderOptions): string {
  const source = frozenContract(release.rendererTemplateId,release.rendererContractRevision);
  if (validateMaterialsTemplateRelease(release).length || !source || release.contract.rendererRevision !== materialsRendererRevision || !draft.materials) throw Error('Unknown materials renderer release');
  const map = <T extends {slotId:string}>(bindings:T[], mapping:Record<string,string>):T[] => bindings.map(binding => {
    const slotId = mapping[binding.slotId];
    if (!slotId) throw Error(`Unbound materials slot ${binding.slotId}`);
    return {...binding,slotId};
  });
  const materials = {...draft.materials,templateId:release.rendererTemplateId,contractRevision:release.rendererContractRevision,imageBindings:map(draft.materials.imageBindings,release.imageSlotMap),textBindings:map(draft.materials.textBindings,release.textSlotMap)};
  const copy = {...draft.copy};
  for (const locale of draft.languages) {
    const value = (slotId:string) => materials.textBindings.find(binding => binding.slotId === slotId && binding.locale === locale)?.text || '';
    copy[locale] = {headline:value('hero-headline'),subtitle:value('hero-subtitle'),cta:value('primary-cta'),about:value('company-about')};
  }
  return frozenRender({...draft,template:release.rendererTemplateId as Draft['template'],copy,materials},options);
}

/** Alias releases may rename slots and narrow copy limits, but cannot claim layout capacity absent from their renderer. */
export function validateMaterialsTemplateRelease(release:MaterialsTemplateRelease):string[] {
  const errors:string[]=[];
  const source=frozenContract(release.rendererTemplateId,release.rendererContractRevision);
  if(!source||release.contract.rendererRevision!==materialsRendererRevision)return ['renderer_release_unavailable'];
  const expected=declareExecutionMetadata(source),contract=release.contract;
  if(frozenContract(contract.templateId,contract.contractRevision)||(contract.contractRevision===executableMaterialsRevision(contract.templateId)&&frozenContract(contract.templateId)))errors.push('published_template_revision_collision');
  if(contract.schemaVersion!=='wr-template-materials-v1'||!contract.materialsReady||contract.imagePolicy!==expected.imagePolicy||contract.contentPolicy!==expected.contentPolicy||JSON.stringify(contract.pages)!==JSON.stringify(expected.pages)||JSON.stringify(contract.selectionGroups)!==JSON.stringify(expected.selectionGroups)||JSON.stringify(contract.optionalSections.map(s=>s.id))!==JSON.stringify(expected.optionalSections.map(s=>s.id)))errors.push('renderer_contract_incompatible');
  const compare=(kind:'image'|'text')=>{
    const slots=kind==='image'?contract.imageSlots:contract.textSlots;
    const targets=kind==='image'?expected.imageSlots:expected.textSlots;
    const mapping=kind==='image'?release.imageSlotMap:release.textSlotMap;
    if(new Set(slots.map(s=>s.id)).size!==slots.length||Object.keys(mapping).length!==slots.length||Object.keys(mapping).some(id=>!slots.some(s=>s.id===id))||slots.some(s=>!mapping[s.id])||targets.some(s=>!Object.values(mapping).includes(s.id)))errors.push(`${kind}_mapping_incomplete`);
    if(new Set(Object.values(mapping)).size!==Object.values(mapping).length)errors.push(`${kind}_mapping_duplicate`);
    for(const slot of slots){
      const target=targets.find(s=>s.id===mapping[slot.id]);
      if(!target){errors.push(`${kind}_mapping_unknown`);continue;}
      const keys=kind==='image'?['page','min','max','required','repeat','selectionGroup','role','sourcePolicy','materialSource','productScope','reusePolicy','maxProducts','width','height','fit','allowedMimeTypes']:['page','min','max','required','repeat','format','factSources'];
      if(keys.some(key=>JSON.stringify(Reflect.get(slot,key))!==JSON.stringify(Reflect.get(target,key))))errors.push(`${kind}_mapping_incompatible`);
      if('maxCodePoints'in slot&&'maxCodePoints'in target&&(slot.maxCodePoints<1||slot.maxCodePoints>target.maxCodePoints||slot.maxLines<1||slot.maxLines>target.maxLines))errors.push('text_mapping_incompatible');
    }
  };
  compare('image');compare('text');
  if(JSON.stringify([...(contract.requiredCapabilities||[])].sort())!==JSON.stringify(expected.requiredCapabilities))errors.push('capability_declaration_mismatch');
  return [...new Set(errors)];
}

export function validateMaterialsReleaseRegistry(releases:readonly MaterialsTemplateRelease[]):string[] {
  const keys=releases.map(release=>JSON.stringify([release.contract.templateId,release.contract.contractRevision]));
  return [...(new Set(keys).size===keys.length?[]:['duplicate_template_revision']),...releases.flatMap(validateMaterialsTemplateRelease)];
}

export function availableMaterialsTemplateReleases():readonly MaterialsTemplateRelease[] {
  return additionalMaterialsReleases.filter(release=>!validateMaterialsTemplateRelease(release).length&&additionalMaterialsReleases.filter(other=>other.contract.templateId===release.contract.templateId&&other.contract.contractRevision===release.contract.contractRevision).length===1);
}
