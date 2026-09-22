import { describe, expect, it } from 'vitest';
import { getMaterialsTemplate } from '../src/templates/materials';
import { templateGuides } from '../src/worker/template-guides/catalog';

describe('executable template materials contracts', () => {
  it.each(templateGuides)('$templateId declares executable source, scope, reuse and copy capabilities', ({ templateId }) => {
    const contract = getMaterialsTemplate(templateId)!;
    expect(contract.contractRevision).toBe(`2026-09-22.${templateId}-materials.5`);
    expect(contract.rendererRevision).toBe('2026-09-22.baseline-09fb979');
    expect(contract.requiredCapabilities).toContain('image.product-primary.v1');
    for (const slot of contract.imageSlots) {
      expect(['product-primary', 'product-gallery', 'slot-image']).toContain(slot.materialSource);
      expect(['all-products', 'single-product', 'none']).toContain(slot.productScope);
      expect(['same-product', 'distinct-slot']).toContain(slot.reusePolicy);
      if (slot.role === 'collection') expect(slot).toMatchObject({ productScope: 'all-products', reusePolicy: 'distinct-slot' });
    }
    for (const slot of contract.textSlots) {
      expect(['plain-text', 'value-label-description-lines']).toContain(slot.format);
      expect(slot.factSources).toEqual(['brand', 'product']);
    }
    expect(contract.textSlots.find(slot => slot.id === 'about-highlights')?.format).toBe('value-label-description-lines');
  });
});

import { validateMaterialsContractPositions } from '../src/templates/materials';
import { typedMaterialsFixture } from './fixtures/materials-typed';

it('validates product source and structured text semantics using declared fields, regardless of slot names', async () => {
  const input = await typedMaterialsFixture('senseng-clean', 1);
  const contract = getMaterialsTemplate('senseng-clean')!;
  const names: Record<string, string> = { 'product-main': 'commerce-cover', 'product-gallery': 'detail-images', 'about-highlights': 'brand-values' };
  for (const slot of [...contract.imageSlots, ...contract.textSlots]) slot.id = names[slot.id] || slot.id;
  for (const binding of [...input.materials.imageBindings, ...input.materials.textBindings]) binding.slotId = names[binding.slotId] || binding.slotId;
  expect(validateMaterialsContractPositions(input.materials, contract)).toEqual([]);
  input.materials.imageBindings.find(binding => binding.slotId === 'commerce-cover')!.mediaId = input.materials.products[0].galleryMediaIds[1];
  input.materials.textBindings.find(binding => binding.slotId === 'brand-values')!.text = 'Unstructured values';
  expect(validateMaterialsContractPositions(input.materials, contract).map(issue => issue.code)).toEqual(expect.arrayContaining(['primary_media_mismatch', 'invalid_about_highlights']));
});

it('enforces newly declared line limits and distinct illustration reuse without changing legacy validation', async () => {
  const input = await typedMaterialsFixture('senseng-clean', 1);
  const contract = getMaterialsTemplate('senseng-clean')!;
  input.materials.textBindings.find(binding => binding.slotId === 'hero-headline')!.text = 'One\nTwo\nThree\nFour';
  const primary = input.materials.imageBindings.find(binding => binding.slotId === 'about-primary-image')!;
  input.materials.imageBindings.find(binding => binding.slotId === 'about-secondary-image')!.mediaId = primary.mediaId;
  const codes = validateMaterialsContractPositions(input.materials, contract).map(issue => issue.code);
  expect(codes).toContain('copy_too_many_lines');
  expect(codes).toContain('slot_composition_reused');
  const legacy = getMaterialsTemplate('senseng-clean', '2026-09-20.senseng-clean-materials.2')!;
  input.materials.template.contractRevision = legacy.contractRevision;
  expect(validateMaterialsContractPositions(input.materials, legacy).map(issue => issue.code)).not.toEqual(expect.arrayContaining(['copy_too_many_lines', 'slot_composition_reused']));
});

import { renderMaterialsTemplateRelease } from '../src/templates/materials-releases';
import type { MaterialsTemplateRelease } from '../src/templates/materials-release-registry';
import releaseFixture from './fixtures/materials-plugin-release.json';
import { draftFromMaterials } from '../src/worker/materials-service';
import type { Asset } from '../src/shared/model';
import { renderSite } from '../src/templates';

it('renders an authored template with arbitrary slot identities using its explicit immutable binding map', async () => {
  const input=await typedMaterialsFixture('senseng-clean',2);
  const draft=draftFromMaterials(input,Object.fromEntries(input.materials.media.map(media=>[media.id,{id:media.id} as Asset])));
  const release=releaseFixture as MaterialsTemplateRelease;
  const custom=structuredClone(draft);
  const rename=(bindings:Array<{slotId:string}>,map:Record<string,string>)=>{for(const binding of bindings)binding.slotId=Object.keys(map).find(key=>map[key]===binding.slotId)!;};
  rename(custom.materials!.imageBindings,release.imageSlotMap);rename(custom.materials!.textBindings,release.textSlotMap);
  const options={projectId:'plugin',lang:'en' as const,page:'home',assetUrl:(id:string)=>`/media/${id}`,inquiryUrl:'/inquiry',preview:true};
  const actual=renderMaterialsTemplateRelease(release,custom,options);
  expect(actual).toBe(renderSite(draft,options));
  expect(actual).toContain('data-wr-material-image="hero-slide-0"');
  expect(actual).not.toContain('__WR_');
});

it('accepts fixed indexed single-product slots and rejects out-of-range indices', async () => {
  const input=await typedMaterialsFixture('senseng-clean',1),contract=getMaterialsTemplate('senseng-clean')!;
  const original=contract.imageSlots.find(slot=>slot.id==='product-main')!;
  const slot={...original,id:'indexed-product-view',materialSource:'slot-image' as const,repeat:'fixed' as const,min:2,max:2};
  contract.imageSlots.push(slot);
  const primary=input.materials.imageBindings.find(binding=>binding.slotId==='product-main')!;
  input.materials.imageBindings.push(...[0,1].map(itemIndex=>({...primary,slotId:slot.id,itemIndex})));
  expect(validateMaterialsContractPositions(input.materials,contract)).toEqual([]);
  input.materials.imageBindings.at(-1)!.itemIndex=2;
  expect(validateMaterialsContractPositions(input.materials,contract).map(issue=>issue.code)).toContain('invalid_target');
});

import { validateMaterialsTemplateRelease } from '../src/templates/materials-releases';

it('rejects incomplete, duplicate, incompatible and undeclared release mappings before discovery', () => {
  const release=structuredClone(releaseFixture) as MaterialsTemplateRelease;
  expect(validateMaterialsTemplateRelease(release)).toEqual([]);
  delete release.imageSlotMap['visual-1'];
  expect(validateMaterialsTemplateRelease(release)).toContain('image_mapping_incomplete');
  const duplicate=structuredClone(releaseFixture) as MaterialsTemplateRelease;
  duplicate.imageSlotMap['visual-2']=duplicate.imageSlotMap['visual-1'];
  expect(validateMaterialsTemplateRelease(duplicate)).toContain('image_mapping_duplicate');
  const unsupported=structuredClone(releaseFixture) as MaterialsTemplateRelease;
  unsupported.contract.imageSlots[0].max=2;
  unsupported.contract.requiredCapabilities!.push('video.generate.v1');
  expect(validateMaterialsTemplateRelease(unsupported)).toEqual(expect.arrayContaining(['image_mapping_incompatible','capability_declaration_mismatch']));
  const unknown=structuredClone(releaseFixture) as MaterialsTemplateRelease;
  unknown.contract.rendererRevision='unavailable';
  expect(validateMaterialsTemplateRelease(unknown)).toContain('renderer_release_unavailable');
});

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import snapshotManifest from '../src/templates/releases/baseline-20260922.json';
import { referenceLayouts } from '../src/templates/themes/referenceLayouts';
import { validateMaterialsReleaseRegistry } from '../src/templates/materials-releases';
import { additionalMaterialsReleases } from '../src/templates/materials-release-registry';

it('ships only valid uniquely versioned releases and an unchanged renderer snapshot without application modules', () => {
  expect(validateMaterialsReleaseRegistry(additionalMaterialsReleases)).toEqual([]);
  expect(validateMaterialsReleaseRegistry([releaseFixture as MaterialsTemplateRelease,releaseFixture as MaterialsTemplateRelease])).toContain('duplicate_template_revision');
  const bytes=readFileSync(new URL('../src/templates/releases/baseline-20260922.mjs',import.meta.url));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(snapshotManifest.sha256);
  expect(snapshotManifest.inputs.every(path=>!/^src\/(worker|client)\//.test(path))).toBe(true);
});

it('keeps historical materials rules and rendering independent of subsequent standalone layout changes', async () => {
  const revision='2026-09-20.corpox-ai-agency-materials.2';
  const input=await typedMaterialsFixture('corpox-ai-agency',1,revision);
  const draft=draftFromMaterials(input,Object.fromEntries(input.materials.media.map(media=>[media.id,{id:media.id} as Asset])));
  const options={projectId:'immutable',lang:'en' as const,page:'home',assetUrl:(id:string)=>`/media/${id}`,inquiryUrl:'/inquiry',preview:true};
  const before=renderSite(draft,options),contract=JSON.stringify(getMaterialsTemplate('corpox-ai-agency',revision));
  const layout=referenceLayouts['corpox-ai-agency'],old=layout.html;
  try {
    Reflect.set(layout,'html','<main>Future standalone layout</main>');
    expect(renderSite({...draft,materials:undefined},options)).toContain('Future standalone layout');
    expect(renderSite(draft,options)).toBe(before);
    expect(JSON.stringify(getMaterialsTemplate('corpox-ai-agency',revision))).toBe(contract);
  } finally { Reflect.set(layout,'html',old); }
});

import releaseHashes from './fixtures/materials-release-hashes.json';

it.each(Object.entries(releaseHashes))('keeps published contract bytes immutable: %s', (key,digest) => {
  const [templateId,revision]=key.split('@');
  const contract=getMaterialsTemplate(templateId,revision);
  expect(contract).toBeDefined();
  expect(createHash('sha256').update(JSON.stringify(contract)).digest('hex')).toBe(digest);
});

it('rejects an additional registration that shadows a published baseline revision even when public contract bytes match', () => {
 const contract=getMaterialsTemplate('senseng-clean')!;
 const release:MaterialsTemplateRelease={name:'Unsafe override',contract,rendererTemplateId:'senseng-clean',rendererContractRevision:'2026-09-20.senseng-clean-materials.2',imageSlotMap:Object.fromEntries(contract.imageSlots.map(slot=>[slot.id,slot.id])),textSlotMap:Object.fromEntries(contract.textSlots.map(slot=>[slot.id,slot.id]))};
 release.imageSlotMap['about-primary-image']='about-secondary-image';release.imageSlotMap['about-secondary-image']='about-primary-image';
 expect(validateMaterialsTemplateRelease(release)).toContain('published_template_revision_collision');
});

import mappingHashes from './fixtures/materials-mapping-hashes.json';

it('locks the complete published release definitions including their private slot mappings', () => {
 const actual=Object.fromEntries(additionalMaterialsReleases.map(release=>[JSON.stringify([release.contract.templateId,release.contract.contractRevision]),createHash('sha256').update(JSON.stringify(release)).digest('hex')]));
 expect(actual).toEqual(mappingHashes);
});
