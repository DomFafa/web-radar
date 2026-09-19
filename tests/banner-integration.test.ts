import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { expect, it } from 'vitest';
import { BannerEditor } from '../src/client/BannerEditor';
import { withBanner } from '../src/shared/banner';
import { newBanner } from '../src/shared/banner-config';
import { renderSite } from '../src/templates';
import { defaultDraft } from '../src/worker/domain';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const nodes = (root: Node): Element[] => [
  ...('tagName' in root ? [root] : []),
  ...('childNodes' in root ? root.childNodes.flatMap(nodes) : []),
];
const attr = (node: Element, name: string) => node.attrs.find((a) => a.name === name)?.value;
const text = (node: Node): string =>
  'value' in node ? node.value : 'childNodes' in node ? node.childNodes.map(text).join('') : '';
const options = {
  projectId: 'banner-integration',
  lang: 'en' as const,
  page: 'home',
  assetUrl: (id: string) => `/media/${id}`,
  inquiryUrl: '/inquiry',
};
const heroHtml =
  '<html><head></head><body><main><section data-wr-hero><h1>Original headline</h1><p>Original subtitle</p><a class="button" href="catalog/index.html">Catalog</a><a class="button" href="contact/index.html">Contact</a></section></main></body></html>';

it('keeps Candy default CTA destinations when no Banner overrides are saved', () => {
  const root = parse(renderSite({ ...defaultDraft(), template: 'senseng-candy' }, options));
  const hero = nodes(root).find((n) => attr(n, 'data-wr-hero') !== undefined)!;
  expect(
    nodes(hero)
      .filter((n) => n.tagName === 'a' && attr(n, 'class') === 'button')
      .map((n) => attr(n, 'href')),
  ).toEqual(['catalog/index.html', 'contact/index.html']);
});

it('shows only Banner images and its accessible heading in image mode even with saved slide copy', () => {
  const banner = {
    ...newBanner('home', ['home']),
    mode: 'image' as const,
    slides: [
      {
        assetId: 'hero',
        alt: 'Confirmed collection',
        eyebrow: 'Slide badge',
        headline: 'Slide headline',
        subtitle: 'Slide subtitle',
        buttonText: 'Slide CTA',
        secondaryButtonText: 'Slide secondary',
      },
    ],
  };
  const root = parse(
    withBanner(heroHtml, { ...defaultDraft(), banners: [banner] }, options.assetUrl, 'home'),
  );
  const hero = nodes(root).find((n) => attr(n, 'data-wr-banner') === 'custom')!;
  expect(
    nodes(hero)
      .filter((n) => n.tagName === 'img')
      .map((n) => attr(n, 'src')),
  ).toEqual(['/media/hero']);
  expect(nodes(hero).filter((n) => ['h2', 'p', 'a'].includes(n.tagName))).toHaveLength(0);
  expect(
    nodes(hero).find((n) => n.tagName === 'h1') &&
      text(nodes(hero).find((n) => n.tagName === 'h1')!),
  ).toBe('Original headline');
  expect(text(hero)).not.toContain('Slide');
});

it('applies a URL-only Banner override without requiring custom button text', () => {
  const banner = {
    ...newBanner('home', ['home']),
    primaryButtonUrl: 'catalog/custom.html',
    secondaryButtonUrl: 'https://example.com/contact',
  };
  const root = parse(
    withBanner(heroHtml, { ...defaultDraft(), banners: [banner] }, options.assetUrl, 'home'),
  );
  expect(
    nodes(root)
      .filter((n) => n.tagName === 'a')
      .map((n) => [text(n), attr(n, 'href')]),
  ).toEqual([
    ['Catalog', 'catalog/custom.html'],
    ['Contact', 'https://example.com/contact'],
  ]);
});

it.each(['javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,unsafe'])(
  'does not publish active-content CTA URLs (%s)',
  (url) => {
    const banner = {
      ...newBanner('home', ['home']),
      headline: 'Custom headline',
      primaryButtonUrl: url,
      slides: [
        {
          assetId: 'hero',
          alt: '',
          buttonText: 'Slide CTA',
          buttonUrl: url,
          secondaryButtonText: 'Slide secondary',
          secondaryButtonUrl: url,
        },
      ],
    };
    const root = parse(
      withBanner(heroHtml, { ...defaultDraft(), banners: [banner] }, options.assetUrl, 'home'),
    );
    const hrefs = nodes(root)
      .filter((n) => n.tagName === 'a')
      .map((n) => attr(n, 'href'));
    expect(hrefs).not.toContain(url);
    expect(
      hrefs.every((href) => !/^(?:javascript|data):/i.test((href || '').replace(/\s/g, ''))),
    ).toBe(true);
  },
);

it.each(['eyebrow', 'secondaryButtonText'] as const)(
  'renders a slide with only %s in background mode',
  (field) => {
    const banner = {
      ...newBanner('home', ['home']),
      slides: [{ assetId: 'hero', alt: '', [field]: 'Independent slide copy' }],
    };
    const root = parse(
      withBanner(heroHtml, { ...defaultDraft(), banners: [banner] }, options.assetUrl, 'home'),
    );
    const slide = nodes(root).find((n) => attr(n, 'data-wr-slide') !== undefined)!;
    expect(text(slide)).toContain('Independent slide copy');
  },
);

it('renders the native custom-copy editor collapsed with saved values and disabled fields intact', () => {
  const banner = {
    ...newBanner('home', ['home']),
    headline: 'Saved headline',
    primaryButtonUrl: 'catalog/custom.html',
  };
  const root = parse(
    renderToStaticMarkup(
      createElement(BannerEditor, {
        projectId: 'banner-integration',
        draft: { ...defaultDraft(), banners: [banner] },
        disabled: true,
        onChange: () => {},
        onUpload: () => {},
      }),
    ),
  );
  const details = nodes(root).find(
    (n) => n.tagName === 'details' && attr(n, 'class') === 'banner-custom-copy-details',
  )!;
  expect(details).toBeDefined();
  expect(attr(details, 'open')).toBeUndefined();
  expect(nodes(details).some((n) => n.tagName === 'summary')).toBe(true);
  for (const [label, value] of [
    ['首屏主标题', 'Saved headline'],
    ['主按钮链接', 'catalog/custom.html'],
  ]) {
    const input = nodes(details).find(
      (n) => n.tagName === 'input' && attr(n, 'aria-label') === label,
    )!;
    expect(attr(input, 'value')).toBe(value);
    expect(attr(input, 'disabled')).toBe('');
  }
});
