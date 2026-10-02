import { createHash } from 'node:crypto';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import type { Asset } from '../src/shared/model';
import { renderSite, renderSiteFiles } from '../src/templates';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';

const revision = '2026-10-02.pawfect-groom-materials.2';
type Node = DefaultTreeAdapterMap['node'];
const elements = (node: Node): DefaultTreeAdapterMap['element'][] => [
  ...('tagName' in node ? [node] : []),
  ...('childNodes' in node ? node.childNodes.flatMap(elements) : []),
];
const attr = (node: DefaultTreeAdapterMap['element'], name: string) => node.attrs.find(a => a.name === name)?.value;
const region = (nodes: DefaultTreeAdapterMap['element'][], id: string) => nodes.find(node => attr(node, 'data-wr-material-region') === id)!;
async function prepared(count: number) {
  const input = await typedMaterialsFixture('pawfect-groom', count);
  for (const product of input.materials.products) product.galleryMediaIds = [product.primaryMediaId];
  const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
  return { input, draft };
}
const options = { projectId: 'pawfect-native-test', lang: 'en' as const, page: 'home', assetUrl: (id: string) => `/confirmed/${id}`, inquiryUrl: '/inquiry', preview: true };

describe('Pawfect product materials revision 2', () => {
  it('publishes executable semantic regions and distinct new scenes', () => {
    const contract = getMaterialsTemplate('pawfect-groom')!;
    expect(contract.contractRevision).toBe(revision);
    expect(contract.rendererRevision).toBe('2026-10-02.pawfect-groom-native.2');
    expect(contract.requiredCapabilities).toEqual(expect.arrayContaining(['website.visual-plan.v1', 'image.generate-new.v1']));
    expect(contract.selectionGroups).toEqual({ scene: 3, featured: 6 });
    expect(contract.websitePalette).toEqual({ primary: '#327f85', secondary: '#c9833a', background: '#faf8f3', surface: '#f0eee6', text: '#203337', mutedText: '#617071' });
    expect(contract.imageSlots.some(slot => slot.id === 'product-gallery')).toBe(false);
    expect(contract.textSlots.length).toBeLessThan(80);
    expect(contract.textSlots.every(slot => slot.format === 'plain-text')).toBe(true);
    expect(contract.textSlots.some(slot => slot.id.startsWith('layout-text-'))).toBe(false);
    const scenes = contract.imageSlots.filter(slot => slot.materialSource === 'slot-image');
    expect(scenes).toHaveLength(6);
    expect(scenes.every(slot => slot.role === 'scene' && slot.productScope === 'single-product' && slot.sourcePolicy === 'product-reference' && slot.reusePolicy === 'generate-new')).toBe(true);
    expect(scenes.find(slot => slot.id === 'gallery-scene')).toMatchObject({ repeat: 'per-selection', selectionGroup: 'scene', width: 1200, height: 1500 });
  });

  it.each([1, 3, 7])('renders %i products using bound mains, selected scenes and the native composition', async count => {
    const { input, draft } = await prepared(count);
    expect(validateMaterialsPositions(input.materials)).toEqual([]);
    const home = renderSite(draft, options), nodes = elements(parse(home));
    expect(home).toContain(`data-wr-materials-revision="${revision}"`);
    expect(elements(region(nodes, 'hero')).filter(node => node.tagName === 'h1')).toHaveLength(1);
    expect(elements(region(nodes, 'hero')).some(node => node.tagName === 'em')).toBe(true);
    const cards = elements(region(nodes, 'catalog')).filter(node => node.tagName === 'article' && attr(node, 'data-wr-product-id'));
    expect(cards).toHaveLength(Math.min(count, 6));
    expect(elements(region(nodes, 'catalog')).find(node => attr(node, 'class') === 'pg-services')).toMatchObject({ tagName: 'div' });
    expect(attr(elements(region(nodes, 'catalog')).find(node => attr(node, 'class') === 'pg-services')!, 'data-product-count')).toBe(String(Math.min(count, 6)));
    expect(nodes.some(node => attr(node, 'data-count') !== undefined)).toBe(false);
    const gallery = elements(region(nodes, 'gallery')).filter(node => node.tagName === 'figure');
    expect(gallery.map(node => attr(node, 'data-wr-product-id'))).toEqual(input.materials.displaySelection!.sceneProductIds);
    expect(elements(region(nodes, 'gallery')).filter(node => node.tagName === 'img').every(node => attr(node, 'data-wr-material-image') === 'gallery-scene')).toBe(true);
    expect(home).not.toContain('class="wr-confirmed-hero"');
    expect(home).not.toContain('wr-confirmed-products');
    expect(home).not.toContain('Fresh coats.');
    const catalog = elements(parse(renderSite(draft, { ...options, page: 'catalog' })));
    expect(elements(region(catalog, 'catalog')).filter(node => node.tagName === 'article' && attr(node, 'data-wr-product-id'))).toHaveLength(count);
    const detail = renderSite(draft, { ...options, page: 'detail', productId: draft.products.at(-1)!.id });
    expect(detail).toContain(`/confirmed/${draft.products.at(-1)!.imageAssetId}`);
    expect(detail).not.toContain('/confirmed/gallery-');
  });

  it('rejects over-capacity regional copy without truncating confirmed facts at render time', async () => {
    const { input, draft } = await prepared(1);
    const contract = getMaterialsTemplate('pawfect-groom')!;
    const text = input.materials.textBindings.find(binding => binding.slotId === 'hero-headline')!;
    text.text = 'x'.repeat(contract.textSlots.find(slot => slot.id === text.slotId)!.maxCodePoints + 1);
    expect(validateMaterialsPositions(input.materials)).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'copy_too_long', message: 'hero-headline' })]));
    draft.products[0].name = 'Very long confirmed product name '.repeat(8).trim();
    expect(renderSite(draft, options)).toContain(draft.products[0].name);
  });

  it('consumes every required regional copy and image binding across the five native pages', async () => {
    const { draft } = await prepared(3);
    const contract = getMaterialsTemplate('pawfect-groom')!;
    const pages = contract.pages.map(page => renderSite(draft, { ...options, page, productId: 'p0' }));
    const nodes = pages.flatMap(html => elements(parse(html)));
    for (const slot of contract.textSlots.filter(slot => slot.required)) {
      if (slot.id.endsWith('-seo-title') || slot.id.endsWith('-seo-description')) {
        const html = pages[contract.pages.indexOf(slot.page)];
        expect(html).toContain(draft.materials!.textBindings.find(binding => binding.slotId === slot.id && binding.locale === 'en')!.text);
      } else {
        expect(nodes.some(node => attr(node, 'data-wr-material-text') === slot.id), slot.id).toBe(true);
      }
    }
    for (const binding of draft.materials!.imageBindings) {
      expect(nodes.some(node => attr(node, 'data-wr-material-image') === binding.slotId && attr(node, 'src') === options.assetUrl(binding.assetId)), `${binding.slotId}:${binding.productId || ''}`).toBe(true);
    }
  });

  it('applies explicit display groups without filling beyond the selected featured IDs or altering scene bindings', async () => {
    const { draft } = await prepared(7);
    draft.productDisplayGroups = [['p0', 'p1']];
    const before = JSON.stringify(draft);
    const home = elements(parse(renderSite(draft, options)));
    const cards = elements(region(home, 'catalog')).filter(node => attr(node, 'data-wr-product-card') !== undefined);
    expect(cards.map(node => attr(node, 'data-wr-product-id'))).toEqual(['p0', 'p2', 'p3', 'p4', 'p5']);
    expect(elements(region(home, 'gallery')).filter(node => node.tagName === 'figure').map(node => attr(node, 'data-wr-product-id'))).toEqual(['p0', 'p1', 'p2']);
    const catalog = elements(parse(renderSite(draft, { ...options, page: 'catalog' })));
    expect(elements(region(catalog, 'catalog')).filter(node => attr(node, 'data-wr-product-card') !== undefined)).toHaveLength(6);
    const detail = elements(parse(renderSite(draft, { ...options, page: 'detail', productId: 'p1' })));
    const inquiry = detail.find(node => attr(node, 'data-wr-page') === 'contact' && attr(node, 'data-wr-product-id') === 'p1')!;
    expect(attr(inquiry, 'href')).toBe('../../contact/index.html?productId=p0');
    expect(detail.some(node => attr(node, 'data-wr-material-product') === 'p1')).toBe(true);
    const contact = elements(parse(renderSite(draft, { ...options, page: 'contact', productId: 'p1' })));
    const select = contact.find(node => node.tagName === 'select' && attr(node, 'name') === 'productId')!;
    expect(elements(select).filter(node => node.tagName === 'option' && attr(node, 'value'))).toHaveLength(6);
    expect(elements(select).find(node => attr(node, 'selected') !== undefined && attr(node, 'value') === 'p0')).toBeDefined();
    expect(JSON.stringify(draft)).toBe(before);
  });

  it('keeps real contact routing and enquiry behavior while escaping all supplied copy', async () => {
    const { draft } = await prepared(1);
    draft.company.name = '<img src=x onerror=alert(1)>';
    draft.materials!.textBindings.find(binding => binding.slotId === 'hero-emphasis')!.text = '<script>alert(1)</script>';
    const home = renderSite(draft, options);
    expect(home).not.toContain('<script>alert(1)</script>');
    expect(home).not.toContain('<img src=x');
    expect(home).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    const detail = renderSite(draft, { ...options, page: 'detail', productId: 'p0' });
    expect(detail).toContain('../../contact/index.html?productId=p0');
    const contact = renderSite(draft, { ...options, page: 'contact', productId: 'p0', preview: false });
    expect(contact).toContain('id="inquiry" action="/inquiry" method="post"');
    expect(contact).toContain('value="p0" selected');
    expect(contact).not.toContain('type="submit" disabled');
    expect(contact).toContain('requestId');
    expect(renderSite(draft, { ...options, page: 'contact', preview: true })).toContain('type="submit" disabled');
    const files = renderSiteFiles(draft, { ...options, preview: false, publicBaseUrl: 'https://builder.example.test' });
    expect(Object.keys(files)).toContain('en/products/p0/index.html');
    draft.company.description = '';
    draft.company.capabilities = '';
    draft.company.certifications = '';
    draft.materials!.textBindings = draft.materials!.textBindings.filter(binding => binding.slotId !== 'company-about');
    const about = renderSite(draft, { ...options, page: 'about' });
    expect(about).not.toContain('Company introduction pending');
    expect(elements(parse(about)).some(node => attr(node, 'class')?.split(/\s+/).includes('pg-company-note'))).toBe(false);
    expect(about).not.toContain('Meet the groomers');
    expect(about).not.toContain('Fully Insured');
  });

  it.each([
    ['2026-09-20.pawfect-groom-materials.2', '9d41d13e198b3b45b10b33163559c6def932c54067ca1e1c046102f40e183e56'],
    ['2026-10-02.pawfect-groom-materials.1', '1ccc60d74bd3de2bf8cbf3a8ac9eec61ee3a8787fbb506d58521d6ac7f7d7368'],
  ])('retains published contract bytes for %s', (oldRevision, hash) => {
    const contract = getMaterialsTemplate('pawfect-groom', oldRevision)!;
    expect(createHash('sha256').update(JSON.stringify(contract)).digest('hex')).toBe(hash);
    expect(contract.imageSlots.some(slot => slot.id === 'feature-scene')).toBe(false);
    expect(getMaterialsTemplate('pawfect-groom', 'unknown-revision')).toBeUndefined();
  });
});
