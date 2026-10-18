import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import type { Asset } from '../src/shared/model';
import { materialsPages } from '../src/shared/materials';
import { productNativeTemplateIds, productNativeMaterialsRevision } from '../src/shared/product-native-materials';
import { plannedPages } from '../src/shared/site-brief';
import { renderSite, renderSiteFiles } from '../src/templates';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { draftFromMaterials } from '../src/worker/materials-service';
import { projectPreviewRuntimeForDraft } from '../src/worker/project-preview';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { typedMaterialsFixture } from './fixtures/materials-typed';

type Node = DefaultTreeAdapterMap['node'];
const elements = (node: Node): DefaultTreeAdapterMap['element'][] => [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
const attr = (node: DefaultTreeAdapterMap['element'], name: string) => node.attrs.find(a => a.name === name)?.value;
const options = { projectId: 'product-native-acceptance', lang: 'en' as const, page: 'home', assetUrl: (id: string) => `https://images.example.test/${id}`, inquiryUrl: 'https://forms.example.test/inquiry', preview: true };
async function prepared(id: string, count: number) {
  const input = await typedMaterialsFixture(id, count, productNativeMaterialsRevision(id));
  for (const product of input.materials.products) product.galleryMediaIds = [product.primaryMediaId];
  const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
  return { input, draft };
}

describe.each(productNativeTemplateIds)('%s product-native candidate', id => {
  it('is explicit opt-in, with a complete executable five-page product contract', () => {
    const revision = productNativeMaterialsRevision(id);
    expect(getMaterialsTemplate(id)!.contractRevision).toBe(`2026-10-02.${id}-materials.1`);
    expect(getMaterialsTemplate(id, 'unknown-revision')).toBeUndefined();
    const contract = getMaterialsTemplate(id, revision)!;
    expect(contract.contractRevision).toBe(revision);
    expect(contract.guideRevision).toBe('2026-10-02.2');
    expect(contract.pages).toEqual(materialsPages);
    expect(contract.requiredCapabilities).toEqual(expect.arrayContaining(['website.visual-plan.v1', 'image.generate-new.v1']));
    expect(contract.imageSlots.find(slot => slot.id === 'product-main')).toMatchObject({ materialSource: 'product-primary', repeat: 'per-product', fit: 'contain' });
    expect(contract.imageSlots.some(slot => slot.materialSource === 'product-gallery')).toBe(false);
    expect(contract.imageSlots.filter(slot => slot.materialSource === 'slot-image').every(slot => slot.reusePolicy === 'generate-new' && slot.productScope === 'single-product' && slot.sourcePolicy === 'product-reference')).toBe(true);
    expect(contract.textSlots.every(slot => slot.format === 'plain-text' && !slot.id.startsWith('layout-text-'))).toBe(true);
  });

  it.each([1, 3, 7])('renders all %i confirmed products while respecting featured selection and binding every required region', async count => {
    const { input, draft } = await prepared(id, count);
    expect(validateMaterialsPositions(input.materials)).toEqual([]);
    expect(plannedPages(draft)).toEqual(materialsPages);
    const pages = materialsPages.filter(page => page !== 'detail').map(page => renderSite(draft, { ...options, page }));
    pages.push(...draft.products.map(product => renderSite(draft, { ...options, page: 'detail', productId: product.id })));
    const nodes = pages.flatMap(page => elements(parse(page)));
    if (id === 'mello-coffee') {
      const tabs = nodes.filter(node => attr(node, 'data-wr-product-tab') !== undefined);
      expect(tabs.length).toBeGreaterThan(0);
      // Product Radar captures anchor navigation before target listeners run.
      expect(tabs.every(node => node.tagName === 'button' && attr(node, 'type') === 'button')).toBe(true);
    }
    for (const html of pages) {
      expect(html).toContain(`data-wr-materials-revision="${productNativeMaterialsRevision(id)}"`);
      expect(elements(parse(html)).filter(node => node.tagName === 'h1')).toHaveLength(1);
      expect(html).not.toMatch(/extra-pricing|extra-career|extra-plans|Book an appointment|Meet our doctors/);
    }
    const catalog = elements(parse(renderSite(draft, { ...options, page: 'catalog' })));
    for (const product of draft.products) {
      expect(catalog.some(node => attr(node, 'data-wr-product-id') === product.id)).toBe(true);
      const detail = renderSite(draft, { ...options, page: 'detail', productId: product.id });
      expect(detail).toContain(`https://images.example.test/${product.imageAssetId}`);
      expect(detail).not.toContain('https://images.example.test/gallery-');
    }
    const contract = getMaterialsTemplate(id, productNativeMaterialsRevision(id))!;
    for (const slot of contract.textSlots.filter(slot => slot.required)) {
      if (slot.id.endsWith('-seo-title') || slot.id.endsWith('-seo-description')) continue;
      expect(nodes.some(node => attr(node, 'data-wr-material-text') === slot.id), slot.id).toBe(true);
    }
    for (const binding of draft.materials!.imageBindings) {
      expect(nodes.some(node => attr(node, 'data-wr-material-image') === binding.slotId && (!binding.productId || attr(node, 'data-wr-material-product') === binding.productId)), `${binding.slotId}:${binding.productId || ''}`).toBe(true);
    }
  });

  it('keeps the product-native preview and export on the same five-page renderer', async () => {
    const { draft } = await prepared(id, 3);
    const files = renderSiteFiles(draft, { ...options, preview: false, publicBaseUrl: 'https://site.example.test' });
    expect(Object.keys(files).filter(path => path.endsWith('.html'))).toHaveLength(8); // language redirect + 4 pages + 3 products
    expect(Object.keys(files).some(path => /extra-|pricing|career/.test(path))).toBe(false);
    const runtime = projectPreviewRuntimeForDraft(draft);
    expect(runtime).toContain('productNativeUiRuntime');
    expect(runtime).not.toContain('lumiRuntime');
    expect(runtime).not.toContain('auravellRuntime');
    const contact = files['en/contact/index.html'];
    expect(contact).toContain('productNativeInquiryRuntime');
    expect(contact).toContain('data-wr-sending=');
    const contract = getMaterialsTemplate(id, productNativeMaterialsRevision(id))!;
    const demo = materialsDemoDraft(contract, 'en');
    expect(demo.materials?.contractRevision).toBe(contract.contractRevision);
    expect(renderSite(demo, options)).toContain(`data-wr-materials-revision="${contract.contractRevision}"`);
  });
});
