import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import type { Asset } from '../src/shared/model';
import { productNativeMaterialsRevision } from '../src/shared/product-native-materials';
import { renderSite } from '../src/templates';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';

type Element = DefaultTreeAdapterMap['element'];
type Node = DefaultTreeAdapterMap['node'];
const elements = (node: Node): Element[] => [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
const attr = (node: Element, name: string) => node.attrs.find(value => value.name === name)?.value;
const text = (node: Node): string => 'value' in node ? node.value : 'childNodes' in node ? node.childNodes.map(text).join('') : '';

describe('Auravell product-native hero identity', () => {
  it.each([0, 2])('keeps the hero card on the scene-bound product when primary product is index %i', async primaryIndex => {
    const input = await typedMaterialsFixture('auravell', 3, productNativeMaterialsRevision('auravell'));
    const materials = input.materials;
    for (const product of materials.products) product.galleryMediaIds = [product.primaryMediaId];
    const heroProduct = materials.products[1];
    heroProduct.name = 'Scene-bound purifier';
    materials.primaryProductId = materials.products[primaryIndex].id;
    const heroBinding = materials.imageBindings.find(binding => binding.slotId === 'home-hero')!;
    heroBinding.productId = heroProduct.id;
    heroBinding.depictedProductIds = [heroProduct.id];
    materials.textBindings.find(binding => binding.slotId === 'hero-product-label')!.text = heroProduct.name;
    const draft = draftFromMaterials(input, Object.fromEntries(materials.media.map(media => [media.id, { id: media.id } as Asset])));

    const html = renderSite(draft, {
      projectId: 'auravell-hero-identity', lang: 'en', page: 'home', preview: true,
      assetUrl: id => `https://images.example.test/${id}`,
      inquiryUrl: 'https://forms.example.test/inquiry',
    });
    const card = elements(parse(html)).find(node => attr(node, 'class')?.split(' ').includes('avp-hero-card'))!;
    expect(attr(card, 'data-wr-product-id')).toBe(heroProduct.id);
    const nodes = elements(card);
    const mainImage = nodes.find(node => node.tagName === 'img' && attr(node, 'data-wr-material-image') === 'product-main')!;
    expect(attr(mainImage, 'data-wr-material-product')).toBe(heroProduct.id);
    expect(attr(mainImage, 'src')).toBe(`https://images.example.test/${heroProduct.primaryMediaId}`);
    expect(text(nodes.find(node => node.tagName === 'h3')!)).toBe(heroProduct.name);
    expect(text(nodes.find(node => attr(node, 'data-wr-material-text') === 'hero-product-label')!)).toBe(heroProduct.name);
    const links = nodes.filter(node => node.tagName === 'a');
    expect(links).toHaveLength(3);
    expect(links.every(node => attr(node, 'href') === `products/${heroProduct.id}/index.html` && attr(node, 'data-wr-product-id') === heroProduct.id)).toBe(true);
  });
});
