import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect, it} from 'vitest';
import {getPawfectMaterialsTemplate} from '../src/templates/themes/pawfect/materials';
import {getMaterialsTemplate} from '../src/templates/materials';
import {pawfectDemoDraft} from '../src/worker/template-guides/pawfect-demo';

it('binds every new demo position to existing public photos and bounded illustrative copy', () => {
  const contract = getPawfectMaterialsTemplate()!, draft = pawfectDemoDraft(contract, 'en'), materials = draft.materials!;
  expect(materials.contractRevision).toBe(contract.contractRevision);
  expect(materials.visual.palette).toEqual(contract.websitePalette);
  expect(draft.company.description).toContain('illustrative template example');
  expect(materials.textBindings).toHaveLength(contract.textSlots.length);
  for (const slot of contract.textSlots) {
    const text = materials.textBindings.find(binding=>binding.slotId===slot.id)!.text;
    expect([...text].length, slot.id).toBeLessThanOrEqual(slot.maxCodePoints);
    expect(text.split('\n').length, slot.id).toBeLessThanOrEqual(slot.maxLines);
  }
  const sceneHashes:string[] = [];
  for (const binding of materials.imageBindings) {
    const bytes = readFileSync(resolve('public', `.${binding.assetId}`));
    expect(bytes.length).toBeGreaterThan(1000);
    expect(draft.products.some(product=>product.id===binding.productId)).toBe(true);
    if (binding.role) {
      expect(binding.depictedProductIds).toEqual([binding.productId]);
      sceneHashes.push(createHash('sha256').update(bytes).digest('hex'));
    }
  }
  expect(sceneHashes).toHaveLength(5 + draft.products.length);
  expect(new Set(sceneHashes).size).toBe(sceneHashes.length);
  expect(materials.imageBindings.filter(binding=>binding.slotId==='gallery-scene').map(binding=>binding.productId)).toEqual(materials.displaySelection!.sceneProductIds);
});

it.each(['2026-09-20.pawfect-groom-materials.2','2026-10-02.pawfect-groom-materials.1'])('retains the existing public demo for %s', revision => {
  const contract = getMaterialsTemplate('pawfect-groom', revision)!;
  const draft = pawfectDemoDraft(contract, 'en');
  expect(draft.materials!.contractRevision).toBe(revision);
  expect(draft.products).toHaveLength(6);
  expect(draft.copy.en?.headline).toBe('Your dog deserves the best groom.');
  expect(draft.materials!.imageBindings.some(binding=>binding.slotId==='feature-scene')).toBe(false);
});
