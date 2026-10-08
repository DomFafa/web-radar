import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import type { Asset, Draft } from '../src/shared/model';
import { renderSite } from '../src/templates';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import baseline from './fixtures/product-gallery-v3-release-hashes.json';

const galleryTemplates = ['pawfect-groom', 'auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee'];
const galleryRevision = (id: string) => `2026-10-03.${id}-materials.4`;
type GalleryNode = DefaultTreeAdapterMap['node'];
type GalleryElement = DefaultTreeAdapterMap['element'];
const elements = (node: GalleryNode): GalleryElement[] => [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
const attr = (node: GalleryElement, key: string) => node.attrs.find(attribute => attribute.name === key)?.value;
const options = { projectId: 'native-gallery-test', lang: 'en' as const, page: 'detail', productId: 'p0', assetUrl: (id: string) => `/confirmed/${id}`, inquiryUrl: 'https://example.test/inquiry', preview: true };
async function galleryDraft(id: string, count = 2) {
  const input = await typedMaterialsFixture(id, count, galleryRevision(id));
  const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
  return { input, draft };
}
const galleryNodes = (draft: Draft, productId = 'p0') => elements(parse(renderSite(draft, { ...options, productId })));

describe.each(galleryTemplates)('%s product gallery release', id => {
  it('offers an explicit gallery contract without changing the previous default', () => {
    const previousDefault = id === 'pawfect-groom' ? '2026-10-02.pawfect-groom-materials.3' : `2026-10-02.${id}-materials.1`;
    expect(getMaterialsTemplate(id)!.contractRevision).toBe(previousDefault);
    const contract = getMaterialsTemplate(id, galleryRevision(id));
    expect(contract, 'new opt-in gallery contract').toBeDefined();
    expect(contract!.guideRevision).toBe('2026-10-03.2');
    expect(contract!.requiredCapabilities).toContain('image.product-gallery.v1');
    expect(contract!.imageSlots.find(slot => slot.id === 'product-gallery')).toMatchObject({
      page: 'detail', materialSource: 'product-gallery', repeat: 'per-product-gallery',
      productScope: 'single-product', reusePolicy: 'same-product', min: 0, max: 10, required: false, fit: 'contain',
    });
  });

  it('inherits the previous release scenes, collection heroes and text without mutation', () => {
    const previous = getMaterialsTemplate(id, `${id === 'pawfect-groom' ? '2026-10-02' : '2026-10-03'}.${id}-materials.3`)!;
    const current = getMaterialsTemplate(id, galleryRevision(id))!;
    expect(current.imageSlots.filter(slot => slot.id !== 'product-gallery')).toEqual(previous.imageSlots);
    expect(current.textSlots).toEqual(previous.textSlots);
    expect(current.selectionGroups).toEqual(previous.selectionGroups);
    expect(previous.imageSlots.some(slot => slot.id === 'product-gallery')).toBe(false);
  });

  it('renders only the selected product’s confirmed main and supplementary images', async () => {
    const { input, draft } = await galleryDraft(id);
    expect(validateMaterialsPositions(input.materials)).toEqual([]);
    const all = galleryNodes(draft);
    const root = all.find(node => attr(node, 'data-wr-product-gallery') === 'p0')!;
    expect(root).toBeDefined();
    expect(attr(root, 'class')).toContain('product-gallery');
    const thumbs = elements(root).filter(node => attr(node, 'data-wr-material-thumb') !== undefined);
    expect(thumbs.map(node => attr(node, 'data-src'))).toEqual(['/confirmed/m0', '/confirmed/gallery-p0']);
    expect(thumbs.map(node => attr(node, 'aria-pressed'))).toEqual(['true', 'false']);
    expect(thumbs.map(node => attr(node, 'tabindex'))).toEqual(['0', '-1']);
    expect(thumbs.every(node => node.tagName === 'button' && attr(node, 'type') === 'button' && attr(node, 'aria-label'))).toBe(true);
    expect(elements(root).filter(node => node.tagName === 'img').some(node => /gallery-p1/.test(attr(node, 'src') || ''))).toBe(false);
    expect(all.some(node => attr(node, 'id') === 'wr-product-image-viewer-script')).toBe(true);
    const second = galleryNodes(draft, 'p1').find(node => attr(node, 'data-wr-product-gallery') === 'p1')!;
    expect(elements(second).filter(node => attr(node, 'data-wr-material-thumb') !== undefined).map(node => attr(node, 'data-src'))).toEqual(['/confirmed/m1', '/confirmed/gallery-p1']);
  });

  it('keeps one original image and no invented gallery or controls when no supplements exist', async () => {
    const { input, draft } = await galleryDraft(id, 1);
    input.materials.products[0].galleryMediaIds = [input.materials.products[0].primaryMediaId];
    input.materials.imageBindings = input.materials.imageBindings.filter(binding => binding.slotId !== 'product-gallery');
    expect(validateMaterialsPositions(input.materials)).toEqual([]);
    draft.products[0].gallery = draft.products[0].gallery!.slice(0, 1);
    draft.materials!.imageBindings = draft.materials!.imageBindings.filter(binding => binding.slotId !== 'product-gallery');
    const all = galleryNodes(draft);
    expect(all.filter(node => attr(node, 'id') === 'wr-detail-main-img')).toHaveLength(1);
    expect(all.some(node => attr(node, 'data-wr-product-gallery') !== undefined)).toBe(false);
    expect(all.some(node => attr(node, 'data-wr-material-thumb') !== undefined)).toBe(false);
  });

  it('retains full responsive image sources and meaningful escaped alt text', async () => {
    const { draft } = await galleryDraft(id, 1);
    const binding = draft.materials!.imageBindings.find(binding => binding.slotId === 'product-gallery')!;
    binding.alt.en = 'Back detail <actual product> "one"';
    binding.mobileAssetId = 'mobile-gallery-p0';
    const html = renderSite(draft, { ...options, imageVariants: (asset, widths) => widths.map(width => ({ url: `/variant/${asset}/${width}`, width, height: width })) });
    const root = elements(parse(html)).find(node => attr(node, 'data-wr-product-gallery') === 'p0')!;
    const thumbs = elements(root).filter(node => attr(node, 'data-wr-material-thumb') !== undefined);
    const photo = elements(thumbs[1]).find(node => node.tagName === 'img')!;
    expect(attr(photo, 'alt')).toBe(binding.alt.en);
    expect(attr(photo, 'srcset')).toContain('/variant/gallery-p0/1280 1280w');
    expect(attr(photo, 'sizes')).toBe('80px');
    expect(elements(thumbs[1]).find(node => node.tagName === 'source') && html.includes('/variant/mobile-gallery-p0/1280')).toBe(true);
    expect(html).not.toContain('alt="Back detail <actual product>');
    expect(html).toContain('prefers-reduced-motion:reduce');
    expect(html).toContain('wr-product-gallery-script');
  });

  it('sorts and caps ten real supplements without leaking unrelated or duplicate assets', async () => {
    const { draft } = await galleryDraft(id, 2);
    const sample = draft.materials!.imageBindings.find(binding => binding.slotId === 'product-gallery' && binding.productId === 'p0')!;
    const extras = Array.from({ length: 10 }, (_, index) => ({ ...sample, itemIndex: index + 1, assetId: `detail-${index + 1}` }));
    draft.materials!.imageBindings = draft.materials!.imageBindings.filter(binding => binding.slotId !== 'product-gallery' || binding.productId !== 'p0');
    draft.materials!.imageBindings.push(...[...extras].reverse(), { ...sample, assetId: 'm0', itemIndex: 11 }, { ...sample, assetId: 'not-confirmed', itemIndex: 12 });
    draft.products[0].gallery = [{ assetId: 'm0', sourceImageId: 'm0', kind: 'original', caption: 'Main' }, ...extras.map(binding => ({ assetId: binding.assetId, sourceImageId: binding.assetId, kind: 'detail' as const, caption: 'Supplement' }))];
    const root = galleryNodes(draft).find(node => attr(node, 'data-wr-product-gallery') === 'p0')!;
    const thumbs = elements(root).filter(node => attr(node, 'data-wr-material-thumb') !== undefined);
    expect(thumbs.map(node => attr(node, 'data-src'))).toEqual(['/confirmed/m0', ...extras.map(binding => `/confirmed/${binding.assetId}`)]);
  });
});

it('preserves all six v3 contracts, page output and trusted preview scripts byte for byte', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'gallery-v3-preservation-'));
  try {
    const bundle = resolve(directory, 'api.mjs');
    await build({ entryPoints: ['tests/fixtures/product-gallery-preservation.ts'], outfile: bundle, bundle: true, format: 'esm', platform: 'node', target: 'node22', keepNames: true });
    const script = `const NativeDate=Date;globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-03T00:00:00Z']));}};const api=await import(${JSON.stringify(pathToFileURL(bundle).href)});console.log(JSON.stringify(await api.galleryPreviousReleaseHashes()));`;
    const result = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', script], { maxBuffer: 1024 * 1024 });
    expect(JSON.parse(result.stdout)).toEqual(baseline);
  } finally { await rm(directory, { recursive: true, force: true }); }
}, 30_000);
