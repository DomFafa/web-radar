import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { renderSite } from '../src/templates';
import { templateMediaRequirements } from '../src/shared/template-media';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import type { Asset } from '../src/shared/model';
import previous from '../docs/materials-requirements/typed-2026-09-20.json';

type Node = DefaultTreeAdapterMap['node'];
const elements = (node: Node): DefaultTreeAdapterMap['element'][] => [
  ...('tagName' in node ? [node] : []),
  ...('childNodes' in node ? node.childNodes.flatMap(elements) : []),
];
const attr = (node: DefaultTreeAdapterMap['element'], name: string) => node.attrs.find(a => a.name === name)?.value;

describe('versioned homepage hero inventory', () => {
  it.each(Object.keys(templateMediaRequirements))('%s requires one real homepage hero', id => {
    const contract = getMaterialsTemplate(id)!;
    expect(contract.imageSlots.filter(slot => slot.id.startsWith('hero-slide-')).map(slot => slot.id)).toEqual(['hero-slide-0']);
    expect(contract.contractRevision).toBe(`2026-09-22.${id}-materials.4`);
  });

  it.each(['2026-09-19.corpox-ai-agency-materials.1', '2026-09-20.corpox-ai-agency-materials.2', undefined])(
    'renders saved %s with its own hero count and preserves all products', async revision => {
      const input = await typedMaterialsFixture('corpox-ai-agency', 2, revision);
      expect(validateMaterialsPositions(input.materials)).toEqual([]);
      const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
      const nodes = elements(parse(renderSite(draft, { projectId: 'hero-test', lang: 'en', page: 'home', assetUrl: id => `/bound/${id}`, inquiryUrl: '/inquiry', preview: true })));
      expect(nodes.filter(node => attr(node, 'data-wr-collection-hero') !== undefined)).toHaveLength(1);
      expect(nodes.filter(node => attr(node, 'data-wr-collection-slide') !== undefined)).toHaveLength(revision ? 2 : 1);
      expect(nodes.filter(node => attr(node, 'data-wr-product-card') !== undefined).map(node => attr(node, 'data-wr-product-id'))).toEqual(['p0', 'p1']);
    },
  );

  it('keeps the frozen two-hero contract readable after loading the corrected current contract', () => {
    const current = getMaterialsTemplate('corpox-ai-agency','2026-09-21.corpox-ai-agency-materials.3')!;
    const old = getMaterialsTemplate('corpox-ai-agency', '2026-09-20.corpox-ai-agency-materials.2')!;
    expect(createHash('sha256').update(JSON.stringify(old)).digest('hex')).toBe(previous.templates['corpox-ai-agency'].sha256);
    expect(old.imageSlots.filter(slot => slot.id.startsWith('hero-slide-'))).toHaveLength(2);
    expect(current).toEqual({ ...old, contractRevision: '2026-09-21.corpox-ai-agency-materials.3', imageSlots: old.imageSlots.filter(slot => slot.id !== 'hero-slide-1') });
  });
});
