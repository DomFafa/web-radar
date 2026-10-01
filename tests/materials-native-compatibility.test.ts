import { createHash } from 'node:crypto';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { materialsCatalog } from '../src/worker/template-guides/materials-catalog';
import { renderSite } from '../src/templates';
import { draftFromMaterials } from '../src/worker/materials-service';
import type { Asset } from '../src/shared/model';
import { typedMaterialsFixture } from './fixtures/materials-typed';

type Node = DefaultTreeAdapterMap['node'];
const elements = (node: Node): DefaultTreeAdapterMap['element'][] => [
  ...('tagName' in node ? [node] : []),
  ...('childNodes' in node ? node.childNodes.flatMap(elements) : []),
];
const attr = (node: DefaultTreeAdapterMap['element'], name: string) => node.attrs.find(a => a.name === name)?.value;
const hasClass = (node: DefaultTreeAdapterMap['element'], name: string) => attr(node, 'class')?.split(/\s+/).includes(name);
const toorunRevision = '2026-10-01.toorun-early-learning-materials.3';

it.each([
  ['lumi-business', '2026-09-30.lumi-business-materials.1', '95c8bb785c066ef2d3ff44c9e26097939621faf5bb6c0bfcc8326d3c7f535a2a'],
  ['toorun-early-learning', '2026-09-20.toorun-early-learning-materials.2', 'c46a2b9a72acdd50c872ec405b87dd2880c3db35ff7d53224f5b3e4bb75da87d'],
])('retains published %s contract bytes for saved projects', (id, revision, hash) => {
  const contract = getMaterialsTemplate(id, revision)!;
  expect(createHash('sha256').update(JSON.stringify(contract)).digest('hex')).toBe(hash);
  expect(getMaterialsTemplate(id, 'unknown-revision')).toBeUndefined();
});

it.each(['home', 'catalog', 'detail', 'about', 'contact'])('keeps Lumi confirmed %s rendering unchanged across the compatibility revision', async page => {
  const input = await typedMaterialsFixture('lumi-business', 2, '2026-09-30.lumi-business-materials.1');
  const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
  const options = { projectId: 'lumi-revision-test', lang: 'en' as const, page, productId: draft.products[0].id, assetUrl: (id: string) => `/confirmed/${id}`, inquiryUrl: '/inquiry', preview: true };
  const before = renderSite(draft, options);
  draft.materials!.contractRevision = getMaterialsTemplate('lumi-business')!.contractRevision;
  expect(renderSite(draft, options)).toBe(before);
});

it('advertises only contracts with executable image semantics accepted by Product Radar', async () => {
  for (const entry of (await materialsCatalog()).templates) {
    const contract = getMaterialsTemplate(entry.templateId, entry.contractRevision!)!;
    expect(contract, entry.templateId).toBeDefined();
    expect(createHash('sha256').update(JSON.stringify(contract)).digest('hex')).toBe(entry.contractSha256);
    for (const slot of contract.imageSlots) {
      expect(slot, `${entry.templateId}/${slot.id}`).not.toHaveProperty('defaultAsset');
      if (slot.materialSource === 'product-primary' || slot.materialSource === 'product-gallery') {
        expect(slot.role, `${entry.templateId}/${slot.id}`).toBeUndefined();
        expect(slot.productScope).toBe('single-product');
      } else if (slot.sourcePolicy === 'illustration') {
        expect(contract.requiredCapabilities, entry.templateId).toContain('image.illustration.v1');
      }
    }
  }
});

describe('Toorun native confirmed-materials hero', () => {
  it.each([1, 2, 4, 6])('keeps four portrait cards and live title with %i products', async count => {
    const contract = getMaterialsTemplate('toorun-early-learning')!;
    const input = await typedMaterialsFixture('toorun-early-learning', count);
    expect(validateMaterialsPositions(input.materials)).toEqual([]);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const html = renderSite(draft, { projectId: 'native-hero-test', lang: 'en', page: 'home', assetUrl: id => `/confirmed/${id}`, inquiryUrl: '/inquiry', preview: true });
    const nodes = elements(parse(html));
    const hero = nodes.find(node => hasClass(node, 'tr-hero'))!;
    expect(hero).toBeDefined();
    expect(contract.contractRevision).toBe(toorunRevision);
    expect(contract.imageSlots.some(slot => slot.id.startsWith('hero-slide-'))).toBe(false);
    expect(nodes.some(node => hasClass(node, 'wr-confirmed-hero'))).toBe(false);
    const inside = elements(hero);
    expect(inside.filter(node => node.tagName === 'h1')).toHaveLength(1);
    expect(inside.filter(node => hasClass(node, 'tr-portrait'))).toHaveLength(4);
    const images = inside.filter(node => node.tagName === 'img');
    expect(images).toHaveLength(4);
    expect(images.map(node => attr(node, 'data-wr-material-product'))).toEqual(Array.from({ length: 4 }, (_, i) => `p${i % count}`));
    expect(images.every(node => attr(node, 'data-wr-material-image') === 'product-main')).toBe(true);
    expect(html).toContain('Confirmed wooden collection');
    expect(html).not.toContain('hero-child-');
  });

  it('retains the previous contract and renderer for saved projects', async () => {
    const oldRevision = '2026-09-20.toorun-early-learning-materials.2';
    const input = await typedMaterialsFixture('toorun-early-learning', 2, oldRevision);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const html = renderSite(draft, { projectId: 'old-native-hero-test', lang: 'en', page: 'home', assetUrl: id => `/confirmed/${id}`, inquiryUrl: '/inquiry', preview: true });
    expect(getMaterialsTemplate('toorun-early-learning', oldRevision)?.imageSlots.some(slot => slot.id === 'hero-slide-0')).toBe(true);
    expect(html).toContain('class="wr-confirmed-hero"');
    expect(html).not.toContain('class="tr-hero"');
  });
});
