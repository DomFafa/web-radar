import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { renderSite, renderSiteFiles } from '../src/templates';
import { getMaterialsTemplate, validateMaterialsPositions } from '../src/templates/materials';
import { getTemplateGuide } from '../src/worker/template-guides/catalog';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { currentMaterialsTemplate } from '../src/worker/template-guides/current-materials';
import { projectPreviewHtml, projectPreviewRuntimeForDraft } from '../src/worker/project-preview';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { draftFromMaterials } from '../src/worker/materials-service';
import { careflowImages } from '../src/templates/themes/careflow/inventory';
import { newBanner } from '../src/shared/banner-config';
import type { Asset } from '../src/shared/model';
const options = {
  projectId: 'customer',
  lang: 'en' as const,
  page: 'home',
  assetUrl: (id: string) => (id.startsWith('/templates/') ? id : `/media/${id}`),
  inquiryUrl: 'https://app.example.test/api/inquiry',
};
const draft = () => ({
  ...defaultDraft(),
  template: 'careflow-healthcare' as const,
  company: {
    ...defaultDraft().company,
    name: 'Westside Care',
    email: 'hello@example.test',
    description: 'Approved service information.',
  },
  copy: {
    en: {
      headline: 'Thoughtful care, clear next steps',
      subtitle: 'Learn about our services.',
      about: 'Approved organization story.',
      cta: 'Contact the team',
    },
  },
  products: [
    {
      id: 'consultation',
      name: 'A consultation',
      description: 'Discuss your requirements with the team.',
      imageAssetId: 'main',
      gallery: [
        {
          assetId: 'side',
          sourceImageId: 'side',
          kind: 'original' as const,
          caption: 'Another view',
        },
      ],
      material: '',
      dimensions: '',
    },
  ],
});
type Node = DefaultTreeAdapterMap['node'];
const nodes = (n: Node): DefaultTreeAdapterMap['element'][] => [
  ...('tagName' in n ? [n] : []),
  ...('childNodes' in n ? n.childNodes.flatMap(nodes) : []),
];
const visible = (n: Node): string =>
  ['script', 'style'].includes(n.nodeName)
    ? ''
    : 'value' in n
      ? n.value
      : 'childNodes' in n
        ? n.childNodes.map(visible).join(' ')
        : '';
describe('Careflow native template', () => {
  it('registers the template, guide, immutable contract and reference preview', () => {
    expect(validateDraft(draft()).template).toBe('careflow-healthcare');
    const profile = getMaterialsTemplate('careflow-healthcare')!;
    expect(profile).toMatchObject({ contractRevision: '2026-10-02.careflow-healthcare-materials.1', guideRevision: '2026-10-02.1' });
    expect(currentMaterialsTemplate('careflow-healthcare')).toMatchObject({ contractRevision: '2026-10-03.careflow-healthcare-materials.5', guideRevision: getTemplateGuide('careflow-healthcare')?.revision });
    expect(profile.imageSlots).toHaveLength(18);
    expect(getMaterialsTemplate('careflow-healthcare', 'unknown')).toBeUndefined();
    const html = renderSite(materialsDemoDraft(profile, 'en'), {
      ...options,
      projectId: 'materials-demo',
      preview: true,
    });
    expect(html).toContain('Technology, care, and precision in every consultation');
    expect(visible(parse(html)).replace(/\s+/g, ' ')).toContain(
      'Meet the experts who care for you',
    );
    expect(html).toContain('Inter Tight');
    expect(html).not.toMatch(
      /__CF_|reviewbridge|Webflow\.require|cdn\.prod\.website-files|googletagmanager|webflow\.js/,
    );
  });
  it('renders five pages and publishes the local assets from the app origin', () => {
    const files = renderSiteFiles(draft(), {
      ...options,
      publicBaseUrl: 'https://public.example.test',
    });
    for (const route of [
      'en/index.html',
      'en/catalog/index.html',
      'en/products/consultation/index.html',
      'en/about/index.html',
      'en/contact/index.html',
    ]) {
      expect(files[route], route).toBeTruthy();
      expect(
        nodes(parse(files[route])).filter((n) => n.tagName === 'h1'),
        route,
      ).toHaveLength(1);
      expect(files[route]).not.toContain('__CF_');
      expect(files[route]).toContain('https://public.example.test/templates/careflow/');
      for (const node of nodes(parse(files[route]))) {
        const srcset = node.attrs.find((a) => a.name === 'srcset')?.value;
        for (const candidate of srcset?.split(',') || []) {
          const url = candidate.trim().split(/\s+/)[0];
          if (url.includes('/templates/careflow/'))
            expect(url).toMatch(/^https:\/\/public\.example\.test\/templates\/careflow\//);
        }
      }
    }
    const detail = files['en/products/consultation/index.html'];
    expect(detail).toContain('https://public.example.test');
    expect(detail).toContain('/media/side');
    expect(detail).toContain('data-wr-material-thumb');
    expect(detail).toContain('wr-product-image-viewer-script');
  });
  it('escapes user data and does not publish reference doctors, ratings, locations or medical claims', () => {
    const d = draft();
    d.company.name = '<script>alert(1)</script>';
    d.copy.en!.headline = '<b>Untrusted headline</b>';
    for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
      const html = renderSite(d, { ...options, page, productId: 'consultation' });
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      const text = visible(parse(html));
      expect(text).not.toMatch(
        /Sophie Moore|John Carter|Rated 4.8|15M\+|905 Armory|24\/7 emergency|board-certified|all personal health records.*encrypted/i,
      );
    }
    expect(renderSite(d, options)).toContain('&lt;b&gt;Untrusted headline&lt;/b&gt;');
  });
  it('honors every advertised layout image binding and the ordered product gallery', async () => {
    const input = await typedMaterialsFixture('careflow-healthcare', 2);
    expect(validateMaterialsPositions(input.materials)).toEqual([]);
    const d = draftFromMaterials(
      input,
      Object.fromEntries(input.materials.media.map((m) => [m.id, { id: m.id } as Asset])),
    );
    const hero = d.materials!.imageBindings.find((b) => b.slotId === 'home-hero')!;
    hero.mobileAssetId = 'mobile-hero';
    hero.mobileFocalPoint = { x: 0.8, y: 0.3 };
    const seen = new Set<string>();
    for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
      const html = renderSite(d, { ...options, page, productId: 'p1' });
      for (const slot of careflowImages.filter((s) => s.page === page)) {
        expect(html, slot.id).toContain(`/media/${slot.id}-all`);
        seen.add(slot.id);
      }
      expect(html).not.toContain('data-wr-product-id="demo-');
      expect(html).toContain('wr-materials-site');
      if (page === 'home') {
        expect(html).toContain('Confirmed wooden collection');
        expect(html).toContain('srcset="/media/mobile-hero"');
        expect(html).toContain('--cf-mobile-position:80% 30%');
      }
      if (page === 'detail') expect(html).toContain('/media/gallery-p1');
    }
    expect(seen.size).toBe(16);
  });
  it('honors every text binding after business defaults, with an explicit About alias precedence', async () => {
    const profile = getMaterialsTemplate('careflow-healthcare')!;
    expect(new Set(getTemplateGuide('careflow-healthcare')!.textSlots.map((s) => s.id))).toEqual(
      new Set(profile.textSlots.map((s) => s.id)),
    );
    const input = await typedMaterialsFixture('careflow-healthcare', 1);
    const d = draftFromMaterials(
      input,
      Object.fromEntries(input.materials.media.map((m) => [m.id, { id: m.id } as Asset])),
    );
    d.materials!.textBindings = [];
    for (const slot of profile.textSlots) {
      d.materials!.textBindings = [
        { slotId: slot.id, locale: 'en', text: `Approved ${slot.id} <text>`, factReferences: [] },
      ];
      expect(renderSite(d, { ...options, page: slot.page, productId: 'p0' }), slot.id).toContain(
        `Approved ${slot.id} &lt;text&gt;`,
      );
    }
    d.materials!.textBindings = [
      { slotId: 'about-copy-03', locale: 'en', text: 'Direct story', factReferences: [] },
      { slotId: 'company-about', locale: 'en', text: 'Confirmed story alias', factReferences: [] },
    ];
    const html = renderSite(d, { ...options, page: 'about' });
    expect(html).toContain('Confirmed story alias');
    expect(html).not.toContain('Direct story');
  });
  it('does not invent a service when a new customer draft has no products', () => {
    const html = renderSite({ ...draft(), products: [] }, { ...options, page: 'detail' });
    expect(html).toContain('Service details will appear here when added.');
    expect(visible(parse(html))).not.toContain('Cardiology consultations');
  });
  it('keeps private navigation, trusted interactions and disabled inquiry forms', () => {
    const d = draft(),
      html = projectPreviewHtml(
        renderSite(d, { ...options, page: 'contact', preview: true }),
        '/api/projects/test',
        'https://app.example.test',
        { page: 'contact', lang: 'en', expectedVersion: 1 },
      );
    expect(html).toContain('/api/projects/test/preview');
    expect(html).not.toContain('action="https://app.example.test/api/inquiry"');
    expect(projectPreviewRuntimeForDraft(d)).toContain('data-careflow-menu');
    expect(projectPreviewRuntimeForDraft(d)).toContain('data-careflow-form');
  });
  it('replaces the explicit hero without removing navigation when a Banner is configured', () => {
    const d = {
      ...draft(),
      banners: [
        {
          ...newBanner('home', ['home']),
          mode: 'image' as const,
          slides: [{ assetId: 'banner', alt: 'Approved banner' }],
        },
      ],
    };
    const html = renderSite(d, options);
    expect(html).toContain('data-wr-banner="custom"');
    expect(html).toContain('/media/banner');
    expect(html).toContain('careflow-navigation');
    expect(html).not.toContain('data-careflow-image="home-hero"');
  });
  it('ships local image and font files used by all reference pages', () => {
    for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
      const html = renderSite(
        { ...defaultDraft(), template: 'careflow-healthcare' },
        { ...options, page, projectId: 'preview' },
      );
      for (const match of html.matchAll(/\/templates\/careflow\/[a-f0-9]{16}\.[a-z0-9]+/g))
        expect(existsSync('public' + match[0]), match[0]).toBe(true);
    }
    expect(readFileSync('public/templates/careflow/Inter-Tight-OFL.txt', 'utf8')).toContain(
      'SIL OPEN FONT LICENSE',
    );
  });
});
