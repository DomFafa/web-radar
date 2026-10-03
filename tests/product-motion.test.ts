import { Script } from 'node:vm';
import type { Asset } from '../src/shared/model';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import { renderSite } from '../src/templates';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { productMotionPlan, type ProductMotionPage, type ProductMotionTemplate } from '../src/templates/themes/product-motion';
import { productMotionPrepareSource, productMotionSource } from '../src/templates/themes/product-motion-source';

const templates: ProductMotionTemplate[] = ['auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee'];
const pages: ProductMotionPage[] = ['home', 'catalog', 'about', 'contact', 'detail'];

describe('product template motion release', () => {
  it('gives all 25 template/page combinations different entrance compositions', () => {
    const signatures = templates.flatMap(template => pages.map(page => {
      const plan = productMotionPlan(template, page);
      expect(plan.length).toBeGreaterThanOrEqual(3);
      // Compare motion, not selectors: different class names alone do not make a different effect.
      return JSON.stringify(plan.map(({ effect, delay, stagger }) => [effect, delay, stagger]));
    }));
    expect(new Set(signatures).size).toBe(25);
  });

  it('never registers header navigation as an entrance', () => {
    for (const template of templates) for (const page of pages) {
      expect(productMotionPlan(template, page).every(group => !/header|nav|menu|footer-bottom/.test(group.selector))).toBe(true);
    }
  });

  it('ships self-contained scripts that remain valid after app minification', () => {
    expect(() => new Script(productMotionPrepareSource)).not.toThrow();
    expect(() => new Script(productMotionSource)).not.toThrow();
    expect(productMotionSource).not.toMatch(/__name|import\s/);
  });

  it.each([
    { template: 'careflow-healthcare', page: 'about', region: '.cfp-mosaic', count: 3, effect: 'curtain-down' },
    { template: 'toorun-early-learning', page: 'home', region: '.tr-intro', count: 1, effect: 'center-open' },
  ] as const)('attaches $template/$page motion to its actual photographic or copy consumers', async ({ template, page, region, count, effect }) => {
    const input = await typedMaterialsFixture(template, 3, `2026-10-03.${template}-materials.3`);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const html = renderSite(draft, { projectId: 'motion-consumers', lang: 'en', page, assetUrl: id => '/confirmed/' + id, inquiryUrl: '/inquiry', preview: false });
    type Node = DefaultTreeAdapterMap['node'];
    type Element = DefaultTreeAdapterMap['element'];
    const elements = (node: Node): Element[] => [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
    const group = productMotionPlan(template, page).find(group => group.selector.startsWith(region))!;
    expect(group.effect).toBe(effect);
    const steps = group.selector.split('>').map(step => step.trim()).reverse();
    const consumers = elements(parse(html)).filter(element => {
      let node: Node | null | undefined = element;
      for (const step of steps) {
        if (!node || !('tagName' in node)) return false;
        const matches = step.startsWith('.') ? node.attrs.find(attr => attr.name === 'class')?.value.split(/\s+/).includes(step.slice(1)) : node.tagName === step;
        if (!matches) return false;
        node = node.parentNode;
      }
      return true;
    });
    expect(consumers).toHaveLength(count);
    if (template === 'careflow-healthcare') expect(consumers.every(node => node.tagName === 'figure')).toBe(true);
    else expect(consumers[0].attrs).toContainEqual({ name: 'data-wr-material-text', value: 'intro-description' });
  });
});
