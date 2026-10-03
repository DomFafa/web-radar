import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalMaterials } from '../src/shared/materials';
import { productNativeTemplateIds } from '../src/shared/product-native-materials';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { typedMaterialsFixture } from './fixtures/materials-typed';

const enhancedRevision = (id: string) => `2026-10-03.${id}-materials.3`;
const previousRevision = (id: string) => `2026-10-02.${id}-materials.2`;
const bannerSlots = { auravell: 'home-hero', 'careflow-healthcare': 'home-hero', 'lumi-business': 'hero-scene', 'mello-coffee': 'hero-scene' } as const;
const previousHashes: Record<string, string> = {
  auravell: 'b3787cb6c69c0e6cc4c10f840d9bea5ce61fbd56e41953401edd481f9c5dceb2',
  'careflow-healthcare': '6f68663093c9b15264fb0d7e2a15dc494a68d38243bda29a89a28b654e650a91',
  'toorun-early-learning': '65e44b7afe031553db4fd2c7bb0e002db1135e909ce0ab41f9843bac39a23f89',
  'lumi-business': '1ef3178f0262191c8409ade4736adba540a0f73fcf59496c252549cc6c1fe15a',
  'mello-coffee': 'c9d48ca27893ad885073e06a0187f3e81626aba8690ec894270c3e0c721eb79b',
};
const digest = (value: unknown) => createHash('sha256').update(canonicalMaterials(value)).digest('hex');

describe.each(productNativeTemplateIds)('%s enhanced product materials release', id => {
  it('preserves the complete published v2 contract and requires an explicit new revision', () => {
    expect(digest(getMaterialsTemplate(id, previousRevision(id)))).toBe(previousHashes[id]);
    expect(getMaterialsTemplate(id)!.contractRevision).toBe(`2026-10-02.${id}-materials.1`);
    expect(getMaterialsTemplate(id, enhancedRevision(id))).toMatchObject({
      templateId: id, guideRevision: '2026-10-03.1', contractRevision: enhancedRevision(id), rendererRevision: `2026-10-03.${id}-product-native.2`,
    });
    expect(getMaterialsTemplate(id, `2026-10-03.${id}-materials.999`)).toBeUndefined();
  });

  it('creates an independent descriptor without changing product or inner-page image requirements', () => {
    const previous = getMaterialsTemplate(id, previousRevision(id))!;
    const enhanced = getMaterialsTemplate(id, enhancedRevision(id));
    expect(enhanced).toBeDefined();
    const heroId = bannerSlots[id as keyof typeof bannerSlots];
    expect(enhanced!.imageSlots.filter(slot => slot.id !== heroId)).toEqual(previous.imageSlots.filter(slot => slot.id !== heroId));
    expect(enhanced!.selectionGroups).toEqual(previous.selectionGroups);
    expect(enhanced!.websitePalette).toEqual(previous.websitePalette);
    enhanced!.imageSlots[0].composition = 'Mutated caller copy';
    expect(digest(getMaterialsTemplate(id, previousRevision(id)))).toBe(previousHashes[id]);
    expect(getMaterialsTemplate(id, enhancedRevision(id))!.imageSlots[0].composition).not.toBe('Mutated caller copy');
  });
});

describe.each(Object.entries(bannerSlots))('%s collection hero', (id, heroId) => {
  it('requires one newly generated wide banner from every selected original product reference', () => {
    const contract = getMaterialsTemplate(id, enhancedRevision(id));
    expect(contract).toBeDefined();
    const hero = contract!.imageSlots.find(slot => slot.id === heroId)!;
    expect(hero).toMatchObject({ page: 'home', role: 'collection', productScope: 'all-products', materialSource: 'slot-image', repeat: 'once', min: 1, max: 1, required: true, sourcePolicy: 'product-reference', reusePolicy: 'generate-new', fit: 'cover' });
    expect(hero.width / hero.height).toBeGreaterThanOrEqual(16 / 9);
    expect(hero.composition).toMatch(/every selected product/i);
    expect(hero.composition).toMatch(/approved original main image/i);
    expect(hero.composition).toMatch(/complete products/i);
    expect(hero.composition).toMatch(/live text/i);
    expect(hero.mobileComposition).toMatch(/every selected product/i);
    expect(contract!.requiredCapabilities).toContain('image.collection.v1');
  });

  it.each([1, 3, 7])('accepts a single banner depicting all %i input products without a single-product target', async count => {
    expect(getMaterialsTemplate(id, enhancedRevision(id))).toBeDefined();
    const { materials } = await typedMaterialsFixture(id, count, enhancedRevision(id));
    const heroes = materials.imageBindings.filter(binding => binding.slotId === heroId);
    expect(heroes).toHaveLength(1);
    expect(heroes[0].productId).toBeUndefined();
    expect(heroes[0].depictedProductIds).toEqual(materials.products.map(product => product.id));
    expect(validateMaterialsPositions(materials)).toEqual([]);
    heroes[0].depictedProductIds!.pop();
    expect(validateMaterialsPositions(materials).map(issue => issue.code)).toContain('image_identity_mismatch');
  });

  it.each(['single-product target', 'copied main image', 'copied scene', 'duplicate banner'])('rejects an invalid collection: %s', async scenario => {
    expect(getMaterialsTemplate(id, enhancedRevision(id))).toBeDefined();
    const { materials } = await typedMaterialsFixture(id, 3, enhancedRevision(id));
    const hero = materials.imageBindings.find(binding => binding.slotId === heroId)!;
    if (scenario === 'single-product target') hero.productId = materials.products[0].id;
    if (scenario === 'copied main image') hero.mediaId = materials.products[0].primaryMediaId;
    if (scenario === 'copied scene') hero.mediaId = materials.imageBindings.find(binding => binding.role === 'scene')!.mediaId;
    if (scenario === 'duplicate banner') materials.imageBindings.push({ ...hero });
    const codes = validateMaterialsPositions(materials).map(issue => issue.code);
    const expected = { 'single-product target': 'image_identity_mismatch', 'copied main image': 'generated_source_reused', 'copied scene': 'slot_composition_reused', 'duplicate banner': 'slot_quantity' }[scenario];
    expect(codes).toContain(expected);
  });
});

it.each([1, 3, 7])('keeps Toorun individual hero portraits for %i products', async count => {
  const id = 'toorun-early-learning';
  const contract = getMaterialsTemplate(id, enhancedRevision(id));
  expect(contract).toBeDefined();
  expect(contract!.imageSlots).toEqual(getMaterialsTemplate(id, previousRevision(id))!.imageSlots);
  expect(contract!.textSlots).toEqual(getMaterialsTemplate(id, previousRevision(id))!.textSlots);
  const { materials } = await typedMaterialsFixture(id, count, enhancedRevision(id));
  const portraits = materials.imageBindings.filter(binding => ['hero-scene', 'hero-scene-4'].includes(binding.slotId));
  expect(portraits).toHaveLength(Math.min(count, 3) + 1);
  expect(portraits.every(binding => binding.role === 'scene' && binding.productId && binding.depictedProductIds?.length === 1)).toBe(true);
  expect(validateMaterialsPositions(materials)).toEqual([]);
});
