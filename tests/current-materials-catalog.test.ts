import { expect, it } from 'vitest';
import { ACTIVE_TEMPLATE_IDS } from '../src/shared/template-availability';
import { getMaterialsTemplate } from '../src/templates/materials';
import { materialsCatalog } from '../src/worker/template-guides/materials-catalog';
import { currentMaterialsTemplate } from '../src/worker/template-guides/current-materials';

it('advertises an independent all-product About opening image for every selectable template', async () => {
  const catalog = await materialsCatalog();
  expect(catalog.templates.map(template => template.templateId).sort()).toEqual([...ACTIVE_TEMPLATE_IDS].sort());
  for (const template of catalog.templates) {
    expect(template.contractRevision, template.templateId).toBe(`2026-10-03.${template.templateId}-materials.5`);
    const contract = getMaterialsTemplate(template.templateId, template.contractRevision!)!;
    const opening = contract.imageSlots.find(slot => slot.page === 'about')!;
    expect(opening, template.templateId).toMatchObject({ role: 'collection', productScope: 'all-products', sourcePolicy: 'product-reference', reusePolicy: 'generate-new', repeat: 'once', min: 1, max: 1 });
    expect(contract.requiredCapabilities).toContain('image.collection.v1');
    expect(template.requirementsPath).toContain(encodeURIComponent(contract.contractRevision));
    expect(template.thumbnailUrl, template.templateId).toMatch(/^\/templates\/previews\/.+\.jpg$/);
  }
});

it('retains explicit historical contracts and rejects unknown revisions at the discovery boundary', () => {
  for (const id of ACTIVE_TEMPLATE_IDS) {
    const previous = getMaterialsTemplate(id)!;
    expect(currentMaterialsTemplate(id, previous.contractRevision)).toEqual(previous);
    expect(currentMaterialsTemplate(id, 'unknown-revision')).toBeUndefined();
  }
});
