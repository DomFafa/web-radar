import { expect, it } from 'vitest';
import { parse } from 'parse5';
import {
  newBanner,
  pageBanners,
  selectedBanner,
  bannerPageFromPath,
} from '../src/shared/banner-config';
import { withBanner } from '../src/shared/banner';
import {
  defaultDraft,
  editDraft,
  publicAssetReferences,
  assetReferences,
} from '../src/worker/domain';
import { materializeSiteFiles } from '../src/worker/static-site';
import { renderCloneFiles } from '../src/worker/clone-service';
import { renderSite } from '../src/templates';
import type { Draft, BannerTarget, PageBanner } from '../src/shared/model';
const assetUrl = (id: string) => `https://assets.example/${id}`;
const html =
  '<html><head><title>Page</title></head><body><nav>Navigation</nav><main><section data-wr-hero><h1>Page title</h1><img src="original.jpg"><a href="/contact/">Contact</a></section><article>Keep body</article></main></body></html>';
const image = (id: string, targets: BannerTarget[]): PageBanner => ({
  ...newBanner(id, targets),
  slides: [
    { assetId: id + '-1', alt: 'First' },
    { assetId: id + '-2', alt: 'Second' },
  ],
});
it('migrates legacy home settings without affecting other pages; explicit empty config restores original', () => {
  const legacy: Draft = {
    ...defaultDraft(),
    banner: { assetId: 'old', alt: 'Old', fit: 'cover', mode: 'image', position: 'center' },
  };
  expect(pageBanners(legacy)[0].targets).toEqual(['home']);
  expect(selectedBanner(legacy, 'contact')).toBeUndefined();
  expect(withBanner(html, { ...legacy, banners: [] }, assetUrl, 'home')).toBe(html);
});
it('selects by page, shared group and product-specific override without leaking into unrelated pages', () => {
  const draft = {
    ...defaultDraft(),
    banners: [
      image('home', ['home']),
      image('shared', ['about', 'contact']),
      image('detail', ['detail']),
      image('one', ['product:sku/1']),
    ],
  };
  expect(withBanner(html, draft, assetUrl, 'catalog')).toBe(html);
  for (const page of ['about', 'contact'])
    expect(withBanner(html, draft, assetUrl, page)).toContain('https://assets.example/shared-1');
  const product = withBanner(html, draft, assetUrl, { page: 'detail', productId: 'sku/1' });
  expect(product).toContain('https://assets.example/one-1');
  expect(product).not.toContain('https://assets.example/detail-1');
  expect(bannerPageFromPath('de/products/sku%2F1/index.html')).toEqual({
    page: 'detail',
    productId: 'sku/1',
  });
  expect(bannerPageFromPath('fr/extra-team/index.html')).toEqual({ page: 'extra-team' });
});
it('serves page assignments through templates, legacy clones and custom static files with media CSP', () => {
  const video = {
    ...newBanner('video', ['contact']),
    kind: 'video' as const,
    videoAssetId: 'movie',
    posterAssetId: 'poster',
  };
  const draft = { ...defaultDraft(), banners: [image('about', ['about']), video] };
  const options = { projectId: 'p', assetUrl, inquiryUrl: 'https://assets.example/inquiries' };
  expect(renderSite(draft, { ...options, lang: 'en', page: 'contact' })).toContain(
    'data-wr-banner-video',
  );
  const clone = renderCloneFiles(
    { ...draft, buildBranch: 'clone', cloneConfig: { generatedHtml: html } },
    options,
  );
  expect(clone['en/about/index.html']).toContain('about-1');
  expect(clone['en/index.html']).not.toContain('data-wr-banner="custom"');
  const staticFiles = Object.fromEntries(
    ['en/index.html', 'en/products/index.html', 'en/about/index.html', 'en/contact/index.html'].map(
      (p) => [p, html],
    ),
  );
  const result = materializeSiteFiles(staticFiles, draft, options);
  expect(result['en/contact/index.html']).toContain('media-src');
  expect(result['en/contact/index.html']).toContain('https://assets.example/movie');
  expect(result['en/contact/index.html']).toContain('object-fit:cover!important');
  expect(result['en/contact/index.html']).toContain('100svh');
  expect(result['en/products/index.html']).not.toContain('data-wr-banner="custom"');
});
it('keeps detail content intact when no dedicated hero is identifiable', () => {
  const detail =
    '<html><body><nav>Menu</nav><main><section class="product-detail"><h1>Product</h1><img src="product.jpg"><form>Inquiry</form></section></main></body></html>';
  const result = withBanner(
    detail,
    { ...defaultDraft(), banners: [image('detail', ['detail'])] },
    assetUrl,
    'detail',
  );
  expect(result).toContain('<section class="product-detail">');
  expect(result).toContain('product.jpg');
  expect(result).toContain('<form>Inquiry</form>');
});
it('only publishes media used by assigned groups; validates inactive uploads too and preserves generation', () => {
  const draft = {
    ...defaultDraft(),
    banners: [
      { ...image('image', ['about']), videoAssetId: 'inactive-video' },
      image('unassigned', []),
      {
        ...newBanner('video', ['home']),
        kind: 'video' as const,
        videoAssetId: 'movie',
        posterAssetId: 'poster',
      },
    ],
    cloneConfig: { generatedHtml: html },
  };
  expect(publicAssetReferences(draft)).toEqual(
    expect.arrayContaining(['image-1', 'image-2', 'movie', 'poster']),
  );
  expect(publicAssetReferences(draft)).not.toContain('unassigned-1');
  expect(publicAssetReferences(draft)).not.toContain('inactive-video');
  expect(assetReferences(draft)).toContain('inactive-video');
  const edited = editDraft(draft, {
    ...draft,
    banners: draft.banners.map((b) => ({ ...b, position: 'bottom' })),
  });
  expect(edited.cloneConfig?.generatedHtml).toBe(html);
});
it('rejects conflicting page assignments, invalid intervals and unbounded slides', () => {
  const draft = defaultDraft();
  for (const banners of [
    [image('a', ['about']), image('b', ['about'])],
    [{ ...image('a', ['home']), interval: 0 }],
    [
      {
        ...image('a', ['home']),
        slides: Array.from({ length: 13 }, () => ({ assetId: 'one', alt: '' })),
      },
    ],
  ])
    expect(() => editDraft(draft, { ...draft, banners })).toThrow();
});
it('escapes slide text and exposes accessible trusted controls and reduced-motion support', () => {
  const b = image('about', ['about']);
  b.slides[1].alt = '"><script>alert(1)</script>';
  const result = withBanner(html, { ...defaultDraft(), banners: [b] }, assetUrl, 'about');
  expect(result).toContain('Previous banner');
  expect(result).toContain('Next banner');
  expect(result).toContain('Pause banner');
  expect(result).toContain('prefers-reduced-motion');
  const scripts = (n: any): any[] => [
    ...(n.tagName === 'script' ? [n] : []),
    ...(n.childNodes ?? []).flatMap(scripts),
  ];
  expect(scripts(parse(result))).toHaveLength(1);
  expect(result).toContain('data-wr-slide');
});
