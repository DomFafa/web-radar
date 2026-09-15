import { expect, it } from 'vitest';
import { defaultDraft } from '../src/worker/domain';
import { validateSiteFiles, materializeSiteFiles, siteFilePath } from '../src/worker/static-site';
const draft = defaultDraft();
draft.products = [
  { id: 'one', name: 'One', description: '', material: '', dimensions: '', imageAssetId: 'photo' },
];
const files = Object.fromEntries(
  ['home', 'catalog', 'detail', 'about', 'contact'].map((page) => [
    siteFilePath('en', page, 'one'),
    '<!doctype html><html><head><style>body{margin:0}</style></head><body><img src="__WR_ASSET_photo__"><a href="/en/products/" data-wr-page="catalog">Products</a><form action="__WR_INQUIRY__"></form></body></html>',
  ]),
);
it('requires all page types and every product detail, rejects traversal and unknown assets', () => {
  expect(() => validateSiteFiles(files, draft)).not.toThrow();
  const missing = { ...files };
  delete missing['en/products/one/index.html'];
  expect(() => validateSiteFiles(missing, draft)).toThrow();
  expect(() => validateSiteFiles({ ...files, '../private': 'x' }, draft)).toThrow();
  expect(() =>
    validateSiteFiles(
      { ...files, 'en/index.html': files['en/index.html'].replace('photo', 'foreign') },
      draft,
    ),
  ).toThrow();
});
it('uses durable original media URLs for publication and private ones for preview', () => {
  const publicFiles = materializeSiteFiles(files, draft, {
    assetUrl: (id) => `https://app.example/public/assets/${id}`,
    inquiryUrl: 'https://app.example/inquiries',
  });
  expect(publicFiles['en/index.html']).toContain('https://app.example/public/assets/photo');
  expect(publicFiles['en/index.html']).toContain('https://app.example/inquiries');
  expect(publicFiles['en/index.html']).toContain('Content-Security-Policy');
  expect(Object.keys(publicFiles).every((path) => path.endsWith('.html'))).toBe(true);
  const preview = materializeSiteFiles(files, draft, {
    assetUrl: (id) => `/api/projects/p/assets/${id}`,
    inquiryUrl: '/inquiries',
    basePath: '/public/sites/p',
  });
  expect(preview['en/index.html']).toContain('/api/projects/p/assets/photo');
  expect(preview['en/index.html']).toContain('href="/public/sites/p/en/products/"');
});
it('rejects artifacts exceeding the Pages byte limit before marking a build ready', () => {
  const tooLarge = {
    ...files,
    'en/index.html': '<html><head></head><body>' + 'a'.repeat(1_000_000) + '</body></html>',
  };
  expect(() => validateSiteFiles(tooLarge, draft)).toThrow();
  const expanded = {
    ...files,
    'en/index.html':
      '<html><head></head><body>' +
      '<img src="__WR_ASSET_photo__">'.repeat(15_000) +
      '</body></html>',
  };
  expect(() => validateSiteFiles(expanded, draft)).not.toThrow();
  expect(() =>
    materializeSiteFiles(expanded, draft, {
      assetUrl: (id) =>
        `https://app.example/public/sites/00000000-0000-4000-8000-000000000000/assets/${id}`,
      inquiryUrl: '/api/public/sites/project/inquiries',
    }),
  ).toThrow();
});
it('requires every planned extra-page route and accepts it when present', () => {
  const guided = structuredClone(draft);
  guided.consultation = {
    revision: 1,
    answers: [],
    brief: {
      summary: 'Guided site',
      audience: 'Wholesale buyers',
      goal: 'Inquiries',
      visualDirection: 'Editorial',
      layout: 'Product led',
      brandColor: '#416851',
      keep: [],
      avoid: [],
      pages: [
        ...['home', 'catalog', 'detail', 'about', 'contact'].map((id) => ({
          id: id as 'home' | 'catalog' | 'detail' | 'about' | 'contact',
          label: id,
          purpose: id,
          content: { en: { title: id, sections: [] } },
        })),
        {
          id: 'extra-wholesale' as const,
          label: '批发合作',
          purpose: 'Explain the inquiry path for wholesale buyers.',
          content: {
            en: {
              title: 'Wholesale',
              sections: [{ heading: 'Products', body: 'Review the supplied products.' }],
            },
          },
        },
      ],
      copy: { en: { headline: 'One', subtitle: 'Products', about: '', cta: 'Contact' } },
      productTranslations: { one: { en: { name: 'One', description: '' } } },
    },
  };
  expect(() => validateSiteFiles(files, guided)).toThrow();
  expect(() =>
    validateSiteFiles(
      {
        ...files,
        'en/extra-wholesale/index.html': files['en/index.html'],
      },
      guided,
    ),
  ).not.toThrow();
});
