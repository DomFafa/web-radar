import { describe, it, expect } from 'vitest';
import {
  defaultDraft,
  editDraft,
  assertPublishable,
  publicAssetReferences,
} from '../src/worker/domain';
import {
  designPages,
  designKey,
  homeConfirmed,
  designsConfirmed,
  resetDesignForEdit,
} from '../src/shared/site-design';
import type { Draft } from '../src/shared/model';

function ready(): Draft {
  const d = defaultDraft();
  d.company = { ...d.company, name: 'Studio', contactName: 'Amy', email: 'amy@example.com' };
  d.country = 'US';
  d.products = [
    {
      id: 'p1',
      name: 'Toy',
      description: '',
      material: '',
      dimensions: '',
      imageAssetId: 'product-image',
    },
  ];
  d.primaryProductId = 'p1';
  d.copy.en = { headline: 'Hello', subtitle: 'Products', about: 'Us', cta: 'Contact' };
  d.siteDesign = {
    revision: 1,
    pages: Object.fromEntries(designPages.map((id) => [id, { imageAssetId: `design-${id}` }])),
  };
  d.siteDesign.homeConfirmedAssetId = 'design-home';
  d.siteDesign.confirmedKey = designKey(d.siteDesign);
  d.siteDesign.build = { jobId: 'build', artifactKey: 'projects/p/sites/build.json' };
  return d;
}
describe('static site design state', () => {
  it('requires the current homepage and all five current designs to be approved', () => {
    const d = ready();
    expect(homeConfirmed(d.siteDesign)).toBe(true);
    expect(designsConfirmed(d.siteDesign)).toBe(true);
    d.siteDesign!.pages.home!.imageAssetId = 'new-home';
    expect(homeConfirmed(d.siteDesign)).toBe(false);
    expect(designsConfirmed(d.siteDesign)).toBe(false);
  });
  it('invalidates designs after changing facts but ignores old video fields', () => {
    const before = ready(),
      next = structuredClone(before);
    next.products[0].material = 'Cotton';
    resetDesignForEdit(before, next);
    expect(next.siteDesign?.pages).toEqual({});
    expect(next.siteDesign?.build).toBeUndefined();
    expect(next.siteDesign?.revision).toBe(2);
    const video = structuredClone(before);
    video.duration = 12;
    resetDesignForEdit(before, video);
    expect(video.siteDesign).toEqual(before.siteDesign);
  });
  it('draft PUT cannot forge design approval or an artifact key', () => {
    const before = ready(),
      next = structuredClone(before);
    next.siteDesign!.build!.artifactKey = 'another-project/private.json';
    expect(editDraft(before, next).siteDesign).toEqual(before.siteDesign);
    const legacy = defaultDraft();
    expect(
      editDraft(legacy, { ...legacy, siteDesign: next.siteDesign }).siteDesign,
    ).toBeUndefined();
  });
  it('publishes static output without a video and rejects missing or stale builds', () => {
    const d = ready();
    expect(() => assertPublishable(d)).not.toThrow();
    delete d.siteDesign!.build;
    expect(() => assertPublishable(d)).toThrow('网站');
  });
  it('never exposes design mockups or legacy video assets on a static site', () => {
    const d = ready();
    d.heroAssetId = 'old-video';
    d.posterAssetId = 'old-poster';
    expect(publicAssetReferences(d)).toEqual(['product-image']);
  });
});
