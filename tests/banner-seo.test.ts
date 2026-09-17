import { expect, it } from 'vitest';
import { parse } from 'parse5';
import {
  defaultDraft,
  editDraft,
  assetReferences,
  publicAssetReferences,
} from '../src/worker/domain';
import { withBanner } from '../src/shared/banner';
import { renderSite } from '../src/templates';
import { renderCloneFiles } from '../src/worker/clone-service';
import { auditSeo, withPublicationMetadata } from '../src/worker/site-metadata';
import { sanitizeGeneratedHtml } from '../src/worker/site-safety';
import type { Draft, TemplateId } from '../src/shared/model';
const assetUrl = (id: string) => `https://media.example/assets/${id}`;
const banner: NonNullable<Draft['banner']> = {
  assetId: 'banner-one',
  alt: 'Own banner',
  mode: 'background',
  fit: 'cover',
  position: 'center',
};
const scripts = (node: any): any[] => [
  ...(node.tagName === 'script' ? [node] : []),
  ...(node.childNodes ?? []).flatMap(scripts),
];
const doc =
  '<html><head><title>Repeated</title></head><body><header><nav>Navigation</nav></header><main><section class="hero"><video src="old.mp4"></video><img src="old.jpg"><h1>Supplied Toy</h1><a href="/en/contact/">Contact</a></section><section><img src="product.jpg"><p>Supplied product facts for wholesale customers.</p></section></main><footer>Footer</footer></body></html>';
it('replaces only homepage hero media, retains navigation, copy and product sections, and safely escapes alt', () => {
  const d = { ...defaultDraft(), banner: { ...banner, alt: '"><script>attack()</script>' } };
  const html = withBanner(doc, d, assetUrl, true);
  expect(html).not.toContain('old.mp4');
  expect(html).not.toContain('old.jpg');
  expect(html).toContain('product.jpg');
  expect(html).toContain('<nav>Navigation</nav>');
  expect(html).toContain('<h1>Supplied Toy</h1>');
  expect(scripts(parse(html))).toHaveLength(0);
  expect(html).toContain('fetchpriority="high"');
  expect(withBanner(html, d, assetUrl, true)).toBe(html);
  expect(withBanner(doc, d, assetUrl, false)).toBe(doc);
  expect(withBanner(doc, { ...d, banner: undefined }, assetUrl, true)).toBe(doc);
});
it('supports whole artwork and safe fallback without deleting the original page', () => {
  const html = withBanner(
    doc,
    { ...defaultDraft(), banner: { ...banner, mode: 'image' } },
    assetUrl,
    true,
  );
  expect(html).toContain('wr-banner-heading');
  expect(html).toContain('product.jpg');
  expect(html).not.toContain('old.jpg');
  const fallback = withBanner(
    '<html><body><header><nav>Links</nav></header><main><h1>Heading</h1><p>Content</p></main></body></html>',
    { ...defaultDraft(), banner },
    assetUrl,
    true,
  );
  expect(fallback).toContain('data-wr-banner="custom"');
  expect(fallback).toContain('<h1>Heading</h1>');
  expect(fallback).toContain('<nav>Links</nav>');
});
it('uses uploaded artwork in every template and keeps generated clone output intact', () => {
  const templates: TemplateId[] = [
    'natural',
    'technology',
    'explorer',
    'senseng-clean',
    'senseng-video',
    'saas-automation',
    'fintech-platform',
    'digital-marketing',
    'porto-accounting',
    'crafto-corporate',
    'juno-toys',
    'corpox-ai-agency',
    'corpox-consulting',
  ];
  for (const template of templates) {
    const d = { ...defaultDraft(), template, banner };
    const html = renderSite(d, {
      projectId: 'p',
      lang: 'en',
      page: 'home',
      assetUrl,
      inquiryUrl: '/inquiries',
    });
    expect(html, template).toContain('data-wr-banner="custom"');
    expect(html, template).toContain(assetUrl(banner.assetId));
    expect(
      renderSite(d, {
        projectId: 'p',
        lang: 'en',
        page: 'contact',
        assetUrl,
        inquiryUrl: '/inquiries',
      }),
    ).not.toContain('data-wr-banner="custom"');
  }
  const d = {
    ...defaultDraft(),
    buildBranch: 'clone' as const,
    cloneConfig: { generatedHtml: doc },
    banner,
  };
  const files = renderCloneFiles(d, { projectId: 'p', assetUrl, inquiryUrl: '/inquiries' });
  expect(files['en/index.html']).toContain('data-wr-banner="custom"');
  expect(files['en/contact/index.html']).not.toContain('data-wr-banner="custom"');
  expect(d.cloneConfig.generatedHtml).toBe(doc);
});
it('does not invalidate finished design or consultation when changing the banner; authorizes its asset separately', () => {
  const previous = {
    ...defaultDraft(),
    banner,
    siteDesign: {
      revision: 3,
      pages: {},
      build: { jobId: 'job', artifactKey: 'projects/p/site.json' },
    },
    cloneConfig: { generatedHtml: doc },
  };
  const next = editDraft(previous, { ...previous, banner: { ...banner, assetId: 'banner-two' } });
  expect(next.siteDesign).toEqual(previous.siteDesign);
  expect(next.cloneConfig?.generatedHtml).toBe(doc);
  expect(assetReferences(next)).toContain('banner-two');
  expect(publicAssetReferences(next)).toContain('banner-two');
  expect(publicAssetReferences(next)).not.toContain('banner-one');
});
it('creates unique page metadata, language-specific canonical and reciprocal alternates, default language and truthful JSON-LD', () => {
  const d = {
    ...defaultDraft(),
    banner,
    company: { ...defaultDraft().company, name: 'Brand <script>safe</script>' },
    products: [
      {
        id: 'toy',
        name: 'Supplied Toy',
        description: 'Known facts',
        material: 'Wood',
        dimensions: '',
        imageAssetId: 'toy-photo',
      },
    ],
  };
  const files = withPublicationMetadata(
    {
      'en/index.html': doc,
      'de/index.html': doc,
      'en/products/toy/index.html': doc,
      'en/contact/index.html': doc,
    },
    'https://shop.example',
    { draft: d, assetUrl },
  );
  expect(files['de/index.html']).toContain('lang="de"');
  expect(files['de/index.html']).toContain(
    'hreflang="x-default" href="https://shop.example/en/index.html"',
  );
  expect(files['en/contact/index.html']).not.toContain('hreflang="de"');
  expect(files['sitemap.xml']).toContain('xhtml:link');
  expect(files['en/index.html']).toContain('og:image');
  const product = files['en/products/toy/index.html'];
  expect(product).toContain('"@type":"Product"');
  expect(product).not.toMatch(/"(?:offers|aggregateRating|review)"/);
  expect(product).toContain('\\u003cscript\\u003e');
  expect(scripts(parse(product))).toHaveLength(1);
  expect(auditSeo(files).issues.some((issue) => issue.message === '标题缺失或与其他页面重复')).toBe(
    false,
  );
  expect(auditSeo(files).issues.some((issue) => issue.message.includes('Alt'))).toBe(true);
  expect(auditSeo(files).pages).toBe(4);
  for (const origin of [
    'http://shop.example',
    'https://user:pass@shop.example',
    'https://shop.example/path',
    'https://shop.example/?q=1',
  ])
    expect(() => withPublicationMetadata({ 'en/index.html': doc }, origin)).toThrow();
});
it('preserves non-language alternate links and adds opener isolation to generated external links', () => {
  const html =
    '<html><head><title>Page</title><link rel="alternate stylesheet" href="theme.css"><link rel="alternate" type="application/rss+xml" href="feed.xml"></head><body><a target="_blank" rel="nofollow" href="https://example.com">Link</a></body></html>';
  expect(
    withPublicationMetadata({ 'en/index.html': html }, 'https://shop.example')['en/index.html'],
  ).toContain('application/rss+xml');
  expect(sanitizeGeneratedHtml(html, '/inquiry')).toContain('rel="nofollow noopener noreferrer"');
  expect(
    parse(
      withPublicationMetadata({ 'en/index.html': doc }, 'https://shop.example')['en/index.html'],
    ),
  ).toBeTruthy();
});

it('removes old video controls and empty visual frames and offers readable contrast without hiding links', () => {
  const d = { ...defaultDraft(), banner: { ...banner, contrast: 'dark' as const } };
  const html = withBanner(
    doc.replace(
      '<video',
      '<figure><img src="old-card.jpg"></figure><button id="video-toggle">Pause</button><video',
    ),
    d,
    assetUrl,
    true,
  );
  expect(html).not.toContain('id="video-toggle"');
  expect(html).not.toContain('<figure>');
  expect(html).toContain('rgba(5,15,30,.60)');
  expect(html).toContain('href="/en/contact/"');
});
