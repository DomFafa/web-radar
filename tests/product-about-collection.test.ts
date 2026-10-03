import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import type { Asset } from '../src/shared/model';
import { renderSite } from '../src/templates';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { draftFromMaterials } from '../src/worker/materials-service';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import baseline from './fixtures/product-about-v4-release-hashes.json';

const slots = { 'pawfect-groom': 'about-primary-image', auravell: 'about-hero-scene', 'careflow-healthcare': 'about-wide-scene', 'toorun-early-learning': 'about-primary-image', 'lumi-business': 'about-wide', 'mello-coffee': 'about-primary-image' };
const revision = (id: string, version = 5) => `2026-10-03.${id}-materials.${version}`;
type Element = DefaultTreeAdapterMap['element'];
const elements = (node: DefaultTreeAdapterMap['node']): Element[] => [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
const attr = (node: Element, key: string) => node.attrs.find(attribute => attribute.name === key)?.value;

describe.each(Object.entries(slots))('%s independent About collection', (id, slotId) => {
  it('offers .5 with one independently generated full collection while retaining the .4 slot geometry and all other content', () => {
    const previous = getMaterialsTemplate(id, revision(id, 4))!;
    const contract = getMaterialsTemplate(id, revision(id));
    expect(contract, 'explicit About collection release').toBeDefined();
    expect(contract!.guideRevision).toBe('2026-10-03.3');
    expect(contract!.requiredCapabilities).toContain('image.collection.v1');
    expect(new Set(contract!.requiredCapabilities).size).toBe(contract!.requiredCapabilities!.length);
    const slot = contract!.imageSlots.find(slot => slot.id === slotId)!;
    const old = previous.imageSlots.find(slot => slot.id === slotId)!;
    expect(slot).toMatchObject({ role: 'collection', productScope: 'all-products', sourcePolicy: 'product-reference', reusePolicy: 'generate-new', repeat: 'once', min: 1, max: 1, required: true, width: old.width, height: old.height, fit: old.fit });
    expect(slot.composition).toMatch(/every selected product/);
    expect(slot.composition).toMatch(/different.*setting.*camera.*arrangement/i);
    expect(slot.composition).toMatch(/homepage/i);
    expect(slot.composition).toMatch(/only one product/i);
    expect(slot.mobileComposition).toContain(old.mobileComposition);
    expect(contract!.imageSlots.filter(slot => slot.id !== slotId)).toEqual(previous.imageSlots.filter(slot => slot.id !== slotId));
    expect(contract!.textSlots).toEqual(previous.textSlots);
    expect(contract!.selectionGroups).toEqual(previous.selectionGroups);
  });

  it.each([1, 10])('binds exactly %i real products and renders an About image different from every homepage image', async count => {
    const input = await typedMaterialsFixture(id, count, revision(id));
    expect(validateMaterialsPositions(input.materials)).toEqual([]);
    const binding = input.materials.imageBindings.find(binding => binding.slotId === slotId)!;
    expect(binding.productId).toBeUndefined();
    expect(binding.depictedProductIds).toEqual(input.materials.products.map(product => product.id));
    const profile = getMaterialsTemplate(id, revision(id))!;
    const homeSlots = new Set(profile.imageSlots.filter(slot => slot.page === 'home').map(slot => slot.id));
    expect(input.materials.imageBindings.filter(binding => homeSlots.has(binding.slotId)).every(home => home.mediaId !== binding.mediaId)).toBe(true);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const output = renderSite(draft, { projectId: 'about-collection', lang: 'en', page: 'about', assetUrl: id => `/confirmed/${id}`, inquiryUrl: '/inquiry', preview: true });
    const image = elements(parse(output)).find(node => node.tagName === 'img' && attr(node, 'data-wr-material-image') === slotId)!;
    expect(image).toBeDefined();
    expect(attr(image, 'src')).toBe(`/confirmed/${binding.mediaId}`);
  });

  it('rejects an incomplete collection, a single-product target, original reuse and homepage reuse by content digest', async () => {
    const input = await typedMaterialsFixture(id, 2, revision(id));
    const check = (edit: (m: typeof input.materials) => void, code: string) => {
      const materials = structuredClone(input.materials); edit(materials);
      expect(validateMaterialsPositions(materials).some(issue => issue.code === code)).toBe(true);
    };
    check(m => { m.imageBindings.find(binding => binding.slotId === slotId)!.depictedProductIds = ['p0']; }, 'image_identity_mismatch');
    check(m => { m.imageBindings.find(binding => binding.slotId === slotId)!.productId = 'p0'; }, 'invalid_target');
    check(m => { m.imageBindings.find(binding => binding.slotId === slotId)!.mediaId = m.products[0].primaryMediaId; }, 'generated_source_reused');
    check(m => {
      const profile = getMaterialsTemplate(id, revision(id))!;
      const homeSlot = profile.imageSlots.find(slot => slot.page === 'home' && slot.materialSource === 'slot-image')!;
      const home = m.imageBindings.find(binding => binding.slotId === homeSlot.id)!;
      const about = m.imageBindings.find(binding => binding.slotId === slotId)!;
      m.media.find(media => media.id === about.mediaId)!.sha256 = m.media.find(media => media.id === home.mediaId)!.sha256;
    }, 'banner_composition_reused');
  });

  it('uses a labelled four-product illustration in the public demo, with a separate About collection binding', () => {
    const profile = getMaterialsTemplate(id, revision(id))!;
    const draft = materialsDemoDraft(profile, 'en');
    expect(draft.products).toHaveLength(4);
    expect(draft.products.map(product => product.imageAssetId)).toEqual(Array.from({ length: 4 }, (_, i) => `/templates/juno-display-demo/front-${i}.svg`));
    const about = draft.materials!.imageBindings.find(binding => binding.slotId === slotId)!;
    expect(about.productId).toBeUndefined();
    expect(about.role).toBe('collection');
    expect(about.depictedProductIds).toEqual(draft.products.map(product => product.id));
    expect(about.assetId).toMatch(/\/collection-\d\.svg$/);
    const homeSlots = new Set(profile.imageSlots.filter(slot => slot.page === 'home').map(slot => slot.id));
    expect(draft.materials!.imageBindings.filter(binding => homeSlots.has(binding.slotId)).every(home => home.assetId !== about.assetId)).toBe(true);
  });

  it('protects only the .5 About opening image on mobile, leaving other pages and the previous release unchanged', async () => {
    const input = await typedMaterialsFixture(id, 1, revision(id));
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const options = { projectId: 'about-mobile-scope', lang: 'en' as const, assetUrl: (id: string) => `/confirmed/${id}`, inquiryUrl: '/inquiry', preview: true };
    const about = renderSite(draft, { ...options, page: 'about' });
    expect(about).toContain('id="wr-about-collection-mobile-image"');
    expect(about).toContain('object-fit:contain!important');
    for (const page of ['home', 'catalog', 'detail', 'contact']) expect(renderSite(draft, { ...options, page, productId: 'p0' })).not.toContain('wr-about-collection-mobile-image');
    draft.materials!.contractRevision = revision(id, 4);
    expect(renderSite(draft, { ...options, page: 'about' })).not.toContain('wr-about-collection-mobile-image');
  });
});

it('preserves all six .4 contracts, page output and trusted preview scripts byte for byte', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'about-v4-preservation-'));
  try {
    const bundle = resolve(directory, 'api.mjs');
    await build({ entryPoints: ['tests/fixtures/product-about-preservation.ts'], outfile: bundle, bundle: true, format: 'esm', platform: 'node', target: 'node22', keepNames: true });
    const script = `const NativeDate=Date;globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-03T00:00:00Z']));}};const api=await import(${JSON.stringify(pathToFileURL(bundle).href)});console.log(JSON.stringify(await api.aboutPreviousReleaseHashes()));`;
    const result = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', script], { maxBuffer: 1024 * 1024 });
    expect(JSON.parse(result.stdout)).toEqual(baseline);
  } finally { await rm(directory, { recursive: true, force: true }); }
}, 30_000);
