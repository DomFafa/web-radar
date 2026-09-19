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
it('selects standalone pages and ignores legacy product-detail assignments', () => {
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
  expect(product).toBe(html);
  expect(publicAssetReferences(draft)).not.toContain('one-1');
  expect(publicAssetReferences(draft)).not.toContain('detail-1');
  expect(pageBanners(draft)[2].targets).toEqual([]);
  expect(editDraft(defaultDraft(), draft).banners?.[3].targets).toEqual([]);
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

it('omits unprovided contact names rather than displaying sample identities', () => {
  const draft = defaultDraft();
  draft.company.name = 'Real Company';
  draft.company.email = 'sales@example.test';
  draft.company.contactName = '';
  for (const template of ['natural', 'senseng-clean'] as const) {
    const result = renderSite(
      { ...draft, template },
      {
        projectId: 'p',
        assetUrl,
        inquiryUrl: 'https://assets.example/inquiries',
        lang: 'en',
        page: 'contact',
      },
    );
    expect(result).not.toContain('Dom Wong');
    expect(result).not.toContain('<h3></h3>');
    expect(result).toContain('sales@example.test');
  }
});

it('hides overlay text, badges, and floating cards in senseng-candy when mode is image even with 0 slides', () => {
  const draft: Draft = {
    ...defaultDraft(),
    template: 'senseng-candy' as any,
    banners: [
      {
        id: 'home-banner',
        targets: ['home'],
        kind: 'images',
        slides: [],
        mode: 'image',
        fit: 'cover',
        position: 'center',
        contrast: 'light',
        height: 'auto',
        autoplay: true,
        interval: 5,
      },
    ],
  };
  const html = renderSite(draft, {
    projectId: 'p',
    assetUrl,
    inquiryUrl: 'https://assets.example/inquiries',
    lang: 'en',
    page: 'home',
  });
  const heroMatch = html.match(/<section[^>]*class="[^"]*wr-candy-hero[^"]*"[^>]*>([\s\S]*?)<\/section>/)?.[0] || '';
  // In pure image mode without slides, template copy/buttons and floating cards must NOT appear in the hero
  expect(heroMatch).not.toContain('SENSORY PLAY');
  expect(heroMatch).not.toContain('Request Sample Kit');
  expect(heroMatch).not.toContain('100% BPA-Free');
  expect(heroMatch).not.toContain('wr-candy-stage');
  expect(heroMatch).not.toContain('Crunchy Soft-Fill');
  expect(heroMatch).not.toContain('Thermo Color Shift');
  expect(heroMatch).not.toContain('5s Slow-Rise');
});

it('renders customized eyebrow, headline, subtitle, buttons, tags, and floating pills in senseng-candy', () => {
  const draft: Draft = {
    ...defaultDraft(),
    template: 'senseng-candy' as any,
    banners: [
      {
        id: 'home-banner',
        targets: ['home'],
        kind: 'images',
        slides: [],
        mode: 'background',
        fit: 'cover',
        position: 'center',
        contrast: 'light',
        height: 'auto',
        autoplay: true,
        interval: 5,
        eyebrow: 'CUSTOM EYEBROW 2026',
        headline: 'Custom Candy Hero Headline',
        subtitle: 'Customized description for testing banner copy.',
        primaryButtonText: 'Custom Buy Now',
        primaryButtonUrl: 'catalog/custom.html',
        secondaryButtonText: 'Custom Contact Us',
        secondaryButtonUrl: 'contact/custom.html',
        tags: ['🌱 Pure Eco Silicone', '🛡️ CE Certified 2026', '☁️ Super Fast Rebound'],
        floatingPills: ['✨ Ultra Squeeze', '🌈 Glow in Dark', '☁️ Micro Air Flow'],
      },
    ],
  };
  const html = renderSite(draft, {
    projectId: 'p',
    assetUrl,
    inquiryUrl: 'https://assets.example/inquiries',
    lang: 'en',
    page: 'home',
  });
  expect(html).toContain('CUSTOM EYEBROW 2026');
  expect(html).toContain('Custom Candy Hero Headline');
  expect(html).toContain('Customized description for testing banner copy.');
  expect(html).toContain('Custom Buy Now');
  expect(html).toContain('catalog/custom.html');
  expect(html).toContain('Custom Contact Us');
  expect(html).toContain('contact/custom.html');
  expect(html).toContain('🌱 Pure Eco Silicone');
  expect(html).toContain('🛡️ CE Certified 2026');
  expect(html).toContain('☁️ Super Fast Rebound');
  expect(html).toContain('✨ Ultra Squeeze');
  expect(html).toContain('🌈 Glow in Dark');
  expect(html).toContain('☁️ Micro Air Flow');
});

it('persists banner custom copy and slide custom copy in editDraft', () => {
  const initial = defaultDraft();
  const modified = editDraft(initial, {
    ...initial,
    banners: [
      {
        id: 'b1',
        targets: ['home'],
        kind: 'images',
        slides: [
          {
            assetId: 's1',
            alt: 'Slide 1',
            eyebrow: 'Slide Eyebrow',
            headline: 'Slide Head',
            subtitle: 'Slide Sub',
            buttonText: 'Slide Btn',
            buttonUrl: 'catalog/slide.html',
            secondaryButtonText: 'Slide Sec Btn',
            secondaryButtonUrl: 'contact/slide.html',
          },
        ],
        mode: 'background',
        fit: 'cover',
        position: 'center',
        contrast: 'light',
        height: 'auto',
        autoplay: true,
        interval: 5,
        eyebrow: 'Banner Eyebrow',
        headline: 'Banner Headline',
        subtitle: 'Banner Subtitle',
        primaryButtonText: 'Banner Btn',
        primaryButtonUrl: 'catalog/banner.html',
        secondaryButtonText: 'Banner Sec Btn',
        secondaryButtonUrl: 'contact/banner.html',
        tags: ['Tag A', 'Tag B'],
        floatingPills: ['Pill A', 'Pill B'],
      },
    ],
  });
  const b = modified.banners?.[0];
  expect(b?.eyebrow).toBe('Banner Eyebrow');
  expect(b?.headline).toBe('Banner Headline');
  expect(b?.subtitle).toBe('Banner Subtitle');
  expect(b?.primaryButtonText).toBe('Banner Btn');
  expect(b?.primaryButtonUrl).toBe('catalog/banner.html');
  expect(b?.secondaryButtonText).toBe('Banner Sec Btn');
  expect(b?.secondaryButtonUrl).toBe('contact/banner.html');
  expect(b?.tags).toEqual(['Tag A', 'Tag B']);
  expect(b?.floatingPills).toEqual(['Pill A', 'Pill B']);
  expect(b?.slides[0].eyebrow).toBe('Slide Eyebrow');
  expect(b?.slides[0].secondaryButtonText).toBe('Slide Sec Btn');
  expect(b?.slides[0].secondaryButtonUrl).toBe('contact/slide.html');
});

