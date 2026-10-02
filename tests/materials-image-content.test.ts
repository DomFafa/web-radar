import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { Asset } from '../src/shared/model';
import type { MaterialsTemplateContract } from '../src/shared/materials';
import { ACTIVE_TEMPLATE_IDS } from '../src/shared/template-availability';
import * as templateAvailability from '../src/shared/template-availability';
import { renderSite } from '../src/templates';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { materialsDraftForRenderer } from '../src/templates/materials-releases';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import releaseHashes from './fixtures/materials-image-content-hashes.json';

const publishedRendererBases = {
  auravell: '2026-10-01.auravell-materials.3',
  'careflow-healthcare': '2026-10-01.careflow-healthcare-materials.3',
  'toorun-early-learning': '2026-10-01.toorun-early-learning-materials.3',
  'lumi-business': '2026-10-01.lumi-business-materials.2',
  'pawfect-groom': '2026-09-20.pawfect-groom-materials.2',
  'mello-coffee': '2026-09-20.mello-coffee-materials.2',
  'senseng-candy': '2026-09-23.senseng-candy-materials.6',
  'senseng-video': '2026-09-23.senseng-video-materials.6',
  'senseng-nature': '2026-09-23.senseng-nature-materials.6',
} as const;

/** Ignore prose only; every field used to prepare, validate or render assets remains comparable. */
function executableInventory(contract: MaterialsTemplateContract) {
  const { guideRevision: _guide, contractRevision: _revision, ...rest } = structuredClone(contract);
  return {
    ...rest,
    ...(rest.productApplicability ? {
      productApplicability: { ...rest.productApplicability, preferredFamilies: [] },
    } : {}),
    imageSlots: rest.imageSlots.map(({ purpose: _purpose, composition: _composition, mobileComposition: _mobile, ...slot }) => slot),
    textSlots: rest.textSlots.map(({ factualPolicy: _policy, ...slot }) => slot),
  };
}

describe('customer-owned image subjects in template materials', () => {
  it('publishes the current revision while keeping image-content revisions readable', () => {
    expect(ACTIVE_TEMPLATE_IDS).toHaveLength(9);
    for (const id of ACTIVE_TEMPLATE_IDS) {
      const contract = getMaterialsTemplate(id)!;
      expect(contract, id).toBeDefined();
      expect(contract.contractRevision).toBe(`2026-10-02.${id}-materials.${id === 'pawfect-groom' ? 2 : 1}`);
      expect(getMaterialsTemplate(id, `2026-10-02.${id}-materials.1`)).toBeDefined();
      expect(contract.guideRevision).toBe('2026-10-02.1');
      expect(getMaterialsTemplate(id, contract.contractRevision)).toEqual(contract);
    }
  });

  it('maps each published image-content revision to its fixed historical renderer contract', async () => {
    for (const [id, baseRevision] of Object.entries(publishedRendererBases)) {
      const revision = `2026-10-02.${id}-materials.1`;
      const input = await typedMaterialsFixture(id, 1, revision);
      const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
      const mapped = materialsDraftForRenderer(draft);
      const historical = getMaterialsTemplate(id, baseRevision)!;

      expect(historical, id).toBeDefined();
      expect(mapped.materials!.contractRevision, id).toBe(baseRevision);
      expect(getMaterialsTemplate(id, revision)!.rendererRevision, id).toBe(historical.rendererRevision);
      expect(draft.materials!.contractRevision, id).toBe(revision);
    }
  });

  it('keeps published contracts and hashes readable after templates leave the active catalog', () => {
    const published = Object.keys(publishedRendererBases).map(id => {
      const revision = `2026-10-02.${id}-materials.1`;
      return { id, revision, contract: getMaterialsTemplate(id, revision)! };
    });
    const availability = vi.spyOn(templateAvailability, 'isActiveTemplate').mockReturnValue(false);
    try {
      for (const { id, revision, contract } of published) {
        expect(templateAvailability.isActiveTemplate(id)).toBe(false);
        const retired = getMaterialsTemplate(id, revision);
        expect(retired, id).toEqual(contract);
        expect(createHash('sha256').update(JSON.stringify(retired)).digest('hex'), id)
          .toBe((releaseHashes as Record<string, string>)[`${id}@${revision}`]);
      }
    } finally {
      availability.mockRestore();
    }
  });

  it.each(ACTIVE_TEMPLATE_IDS)('%s preserves the previous executable slot inventory', async id => {
    const revision = `2026-10-02.${id}-materials.1`;
    const latest = getMaterialsTemplate(id, revision)!;
    const input = await typedMaterialsFixture(id, 2, revision);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const rendererDraft = materialsDraftForRenderer(draft);
    const previous = getMaterialsTemplate(id, rendererDraft.materials!.contractRevision)!;

    expect(previous.contractRevision).not.toBe(latest.contractRevision);
    expect(executableInventory(latest)).toEqual(executableInventory(previous));
    expect(rendererDraft.materials!.imageBindings).toEqual(draft.materials!.imageBindings);
    expect(rendererDraft.materials!.textBindings).toEqual(draft.materials!.textBindings);
    expect(rendererDraft.materials!.visual).toEqual(draft.materials!.visual);
    expect(validateMaterialsPositions(input.materials)).toEqual([]);

    const previousInput = structuredClone(input.materials);
    previousInput.template.guideRevision = previous.guideRevision;
    previousInput.template.contractRevision = previous.contractRevision;
    expect(validateMaterialsPositions(previousInput)).toEqual([]);
    expect(getMaterialsTemplate(id, previous.contractRevision)).toEqual(previous);
    expect(draft.materials!.contractRevision).toBe(latest.contractRevision);
  });

  it.each(ACTIVE_TEMPLATE_IDS)('%s requires customer evidence or an approved business subject, never a template example', id => {
    const contract = getMaterialsTemplate(id, `2026-10-02.${id}-materials.1`)!;
    expect(contract.imageSlots.length).toBeGreaterThan(0);
    if (contract.productApplicability) expect(contract.productApplicability.preferredFamilies).toEqual([]);
    for (const slot of contract.imageSlots) {
      const target = `${id}/${slot.id}`;
      expect(slot.composition, target).toContain('confirmed customer product references');
      expect(slot.composition, target).toContain('explicitly approved business brief');
      expect(slot.composition, target).toContain('A website template is layout only');
      expect(slot.composition, target).toContain('not image subjects, product facts or image-generation style instructions');
      expect(slot.composition, target).toContain('do not substitute a template demo subject');
      expect(slot.composition, target).toContain('Website colors, decorations and visual treatment belong in HTML/CSS');
      expect(slot.mobileComposition, target).toContain('does not authorize changing the product or importing template demo subjects');
      expect(`${slot.purpose} ${slot.composition}`, target).not.toMatch(/Friendly dog portrait|dog-care photography|salon photography|Yoga studio|healthcare photography/i);

      if (slot.materialSource === 'product-primary' || slot.materialSource === 'product-gallery') {
        expect(slot.composition, target).toMatch(/reuse/i);
        expect(slot.composition, target).toContain('dimensions describe a display target, not permission to redraw or recolor');
        expect(slot.composition, target).toContain('explicit approval and real product reference images');
      } else if (slot.productScope === 'none' || slot.sourcePolicy === 'illustration') {
        expect(slot.composition, target).toContain('an approved subject is required');
        expect(slot.composition, target).toContain('Do not infer people, animals, occupations, premises, packaging-design services');
      } else {
        expect(slot.composition, target).toMatch(/selected customer products|bound customer product/);
      }
    }
    for (const slot of contract.textSlots) {
      expect(slot.factualPolicy, `${id}/${slot.id}`).toContain('must not be used to choose an image subject');
    }
  });

  it.each(ACTIVE_TEMPLATE_IDS)('%s renders the same confirmed images and layout under both revisions', async id => {
    const input = await typedMaterialsFixture(id, 2, `2026-10-02.${id}-materials.1`);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const original = structuredClone(draft);
    const previous = materialsDraftForRenderer(draft);
    for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
      const options = {
        projectId: 'image-content-guidance-test', lang: 'en' as const, page,
        productId: draft.products[0].id, assetUrl: (assetId: string) => `/confirmed/${assetId}`,
        inquiryUrl: '/inquiry', preview: true,
      };
      expect(renderSite(draft, options), `${id}/${page}`).toBe(renderSite(previous, options));
    }
    expect(draft).toEqual(original);
  });
});
