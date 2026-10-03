import { Script } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import type { Asset } from '../src/shared/model';
import { productNativeTemplateIds } from '../src/shared/product-native-materials';
import { renderSite } from '../src/templates';
import { productMotionSource } from '../src/templates/themes/product-motion-source';
import { productAboutCollectionMotionSource } from '../src/templates/themes/product-about-collection-motion-source';
import { projectPreviewRuntimeForDraft } from '../src/worker/project-preview';
import { referenceTemplatePreviewRuntime } from '../src/client/reference-template-preview';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';

describe.each(productNativeTemplateIds)('%s About collection release motion', template => {
  it.each(['home', 'about', 'detail'])('starts and animates with a real .5 body revision on %s', page => {
    const animation = { cancel: vi.fn(), finished: Promise.resolve() };
    const target = {
      style: { opacity: '', removeProperty: vi.fn() }, offsetTop: 0, offsetHeight: 100, offsetParent: null,
      contains: () => false, matches: () => false, closest: () => null, animate: vi.fn(() => animation),
    };
    const body = { dataset: { template, wrMaterialsRevision: `2026-10-03.${template}-materials.5` } as Record<string, string>, style: { overflowX: '', removeProperty: vi.fn() } };
    const prepaint = { remove: vi.fn() };
    const frames: FrameRequestCallback[] = [];
    class Observer { observe() {} }
    const context = {
      document: {
        body, documentElement: { dataset: {}, style: { overflowX: '', removeProperty: vi.fn() } },
        querySelector: (selector: string) => selector.includes(`region="${page === 'home' ? 'hero' : page === 'about' ? 'about-story' : 'detail'}"`) ? target : null,
        querySelectorAll: (selector: string) => selector.includes('h1') ? [target] : [],
        getElementById: () => prepaint, activeElement: null, hidden: false, fonts: { ready: Promise.resolve() }, addEventListener: vi.fn(),
      },
      Element: { prototype: { animate: vi.fn() } }, Node: class {},
      matchMedia: () => ({ matches: false, addEventListener: vi.fn() }),
      innerWidth: 1280, innerHeight: 800, scrollY: 0,
      getComputedStyle: () => ({ translate: 'none', rotate: 'none', scale: 'none', opacity: '1', filter: 'none', clipPath: 'none' }),
      requestAnimationFrame: (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; },
      cancelAnimationFrame: vi.fn(), addEventListener: vi.fn(), ResizeObserver: Observer, MutationObserver: Observer,
    };
    new Script(productAboutCollectionMotionSource).runInNewContext(context);
    expect(body.dataset.productMotion).toBe(`${template}:${page}:once-v1`);
    frames.shift()?.(0);
    expect(target.animate).toHaveBeenCalledOnce();
    expect(animation).toHaveProperty('id', expect.stringContaining(`product-scroll-enter:${template}:${page}:`));
    expect(prepaint.remove).toHaveBeenCalledOnce();
  });

  it('ships the .5 motion source in publication and both trusted previews', async () => {
    const input = await typedMaterialsFixture(template, 1, `2026-10-03.${template}-materials.5`);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const publicHtml = renderSite(draft, { projectId: 'about-collection-motion', lang: 'en', page: 'home', assetUrl: id => `/confirmed/${id}`, inquiryUrl: '/inquiry', preview: false });
    for (const output of [publicHtml, projectPreviewRuntimeForDraft(draft), await referenceTemplatePreviewRuntime(draft)]) {
      expect(output.includes('-materials.5`')).toBe(true);
      expect(output.includes(productAboutCollectionMotionSource)).toBe(true);
    }
  });
});

it('changes only the single revision gate in the frozen appearance runtime', () => {
  expect(productMotionSource.split('-materials.3`')).toHaveLength(2);
  expect(productAboutCollectionMotionSource.split('-materials.5`')).toHaveLength(2);
  expect(productAboutCollectionMotionSource.replace('-materials.5`', '-materials.3`') === productMotionSource).toBe(true);
});
