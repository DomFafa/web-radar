import { describe, expect, it } from 'vitest';
import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import cleanContract from '../docs/materials-requirements/senseng-clean.json';
import videoContract from '../docs/materials-requirements/senseng-video.json';
import type { Draft } from '../src/shared/model';
import type { MaterialsTemplateContract } from '../src/shared/materials';
import { defaultDraft } from '../src/worker/domain';
import { prepareSensengMaterials, sensengMaterialInventory } from '../src/templates/materials-senseng';
import { materialsSensengBody } from '../src/templates/materials-render';
import { buildThemeContext } from '../src/templates/themes/types';
import { renderSensengPage } from '../src/templates/themes/senseng';

const contracts = [cleanContract, videoContract] as MaterialsTemplateContract[];
const options = { projectId: 'legacy', lang: 'en' as const, page: 'home', assetUrl: (id: string) => `/media/${id}`, inquiryUrl: '', preview: true };
function legacyDraft(profile: MaterialsTemplateContract, count = 1): Draft {
  const draft = defaultDraft();
  draft.template = profile.templateId as Draft['template'];
  draft.templateConfirmed = true;
  draft.company = { ...draft.company, name: 'Approved Brand', description: 'Confirmed company description', email: 'sales@example.com', contactName: 'Approved Sales' };
  draft.products = Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `Confirmed Product ${i}`, description: `Confirmed product description ${i}`, material: 'Wood', dimensions: '10 cm', imageAssetId: `product-${i}`, gallery: [{ assetId: `gallery-${i}`, sourceImageId: `gallery-${i}`, kind: 'detail', caption: `Confirmed gallery ${i}` }] }));
  draft.primaryProductId = 'p0';
  draft.copy.en = { headline: 'Confirmed headline', subtitle: 'Confirmed subtitle', about: 'Confirmed company introduction', cta: 'Contact approved sales' };
  draft.materials = {
    templateId: profile.templateId, contractRevision: profile.contractRevision,
    visual: { palette: { primary: '#112233', secondary: '#446655', background: '#fdfaf0', surface: '#ffffff', text: '#223344', mutedText: '#667788' }, backgroundStyle: 'soft-gradient', imageTreatment: 'soft', compositionSummary: 'Full real products centered' },
    textBindings: profile.textSlots.map(slot => ({ slotId: slot.id, locale: 'en', text: `Approved ${slot.id}`, factReferences: ['confirmed'] })),
    imageBindings: profile.imageSlots.flatMap(slot => {
      const products = slot.repeat === 'once' ? [undefined] : draft.products;
      return products.map(product => ({ slotId: slot.id, assetId: product ? `${slot.id === 'product-gallery' ? 'gallery' : 'product'}-${product.id.slice(1)}` : slot.id, ...(product ? { productId: product.id } : {}), ...(slot.repeat === 'per-product-gallery' ? { itemIndex: 1 } : {}), fit: slot.fit, focalPoint: { x: 0.5, y: 0.5 }, alt: { en: product?.name || `Approved ${slot.id}` } }));
    }),
    omittedSectionIds: [],
  };
  return draft;
}
type Node = DefaultTreeAdapterMap['node'];
function elements(html: string, tag: string) {
  const found: DefaultTreeAdapterMap['element'][] = [];
  function visit(node: Node) {
    if ('tagName' in node && node.tagName === tag) found.push(node);
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parseFragment(html));
  return found;
}
function text(node: Node): string {
  return 'value' in node ? node.value : 'childNodes' in node ? node.childNodes.map(text).join('').trim() : '';
}

describe('legacy Senseng confirmed materials contracts', () => {
  it.each(contracts)('keeps every published field and slot meaning in $templateId', profile => {
    expect(sensengMaterialInventory(profile.templateId as 'senseng-clean' | 'senseng-video').profile).toEqual(profile);
  });

  it('keeps the clean home-copy-5 binding in its original product-line heading', () => {
    const html = prepareSensengMaterials(buildThemeContext(legacyDraft(contracts[0]), options));
    expect(elements(html, 'h3').some(node => text(node) === 'Approved home-copy-5')).toBe(true);
  });

  it('keeps the video home-copy-18 binding in its original supplier description without numeric animation writeback', () => {
    const html = prepareSensengMaterials(buildThemeContext(legacyDraft(contracts[1]), options));
    expect(elements(html, 'p').some(node => text(node) === 'Approved home-copy-18')).toBe(true);
    expect(html).not.toMatch(/\bdata-(counter|suffix|progress)=/);
    expect(html).not.toContain('50,000 m²');
    expect(html).not.toContain('120+ Countries');
  });

  it.each(contracts)('preserves product, brand and media bindings across all legacy $templateId pages', profile => {
    for (const count of [1, 3, 10]) {
      const draft = legacyDraft(profile, count), before = structuredClone(draft);
      for (const page of profile.pages) {
        const html = materialsSensengBody(buildThemeContext(draft, { ...options, page, productId: `p${count - 1}` }));
        expect(html).toContain('Approved Brand');
        expect(html).toContain(`Confirmed Product ${page === 'detail' ? count - 1 : 0}`);
        expect(html).not.toContain('__WR_MATERIAL_');
        expect(html).not.toContain('Kids Squishy');
        expect(html).not.toContain('senseng-2/index');
        for (const slot of profile.imageSlots.filter(slot => slot.page === page && slot.repeat === 'once')) {
          expect(html).toContain(`/media/${slot.id}`);
        }
        if (page === 'catalog') for (let i = 0; i < count; i++) expect(html).toContain(`data-wr-product-id="p${i}"`);
        if (page === 'detail') expect(html).toContain(`/media/gallery-${count - 1}`);
      }
      expect(draft).toEqual(before);
    }
  });

  it('retains the current standalone Senseng video template and its interactions', () => {
    const draft = legacyDraft(contracts[1]);
    delete draft.materials;
    const html = renderSensengPage(buildThemeContext(draft, options), true);
    expect(html).toContain('data-counter="50000"');
    expect(html).toContain('data-suffix=" m²"');
    expect(html).toContain('data-progress="95"');
  });
});
