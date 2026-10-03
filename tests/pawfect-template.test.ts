import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { currentMaterialsTemplate } from '../src/worker/template-guides/current-materials';
import { describe, it, expect } from 'vitest';
import { renderSite, renderSiteFiles } from '../src/templates';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { isActiveTemplate } from '../src/shared/template-availability';
import { getTemplateGuide } from '../src/worker/template-guides/catalog';
import { getMaterialsTemplate } from '../src/templates/materials';
import { guideSchema } from '../src/worker/template-guides/schema';
import { newBanner } from '../src/shared/banner-config';
import { templateCoverUrl } from '../src/shared/template-covers';
import type { RenderOptions } from '../src/templates';

const draft = () => ({
  ...defaultDraft(),
  template: 'pawfect-groom' as const,
  brandColor: '#38929a',
  company: {
    ...defaultDraft().company,
    name: 'Maple & Paws',
    email: 'hello@example.test',
    contactName: 'Alex',
    description: 'Care for companion dogs.',
    phone: '+44 20 1234 5678',
    address: 'Customer supplied address',
  },
  products: [
    {
      id: 'full-groom',
      name: 'Gentle Groom',
      description: 'Customer supplied service description',
      material: '',
      dimensions: '',
      imageAssetId: 'service-photo',
      sellingPoints: ['Coat consultation'],
      gallery: [
        {
          assetId: 'service-detail',
          sourceImageId: 'service-detail',
          kind: 'original' as const,
          caption: 'Our service',
        },
      ],
    },
  ],
});
const opts: RenderOptions = {
  projectId: 'customer-project',
  lang: 'en',
  page: 'home',
  preview: true,
  assetUrl: (id) => `https://assets.example.test/${id}`,
  inquiryUrl: 'https://api.example.test/inquiry',
};
describe('Pawfect Groom integrated template', () => {
  it('provides a matching dog-care materials preview rather than sample toys', () => {
    const profile = getMaterialsTemplate('pawfect-groom')!;
    const demo = materialsDemoDraft(profile, 'en');
    for (const page of ['home', 'catalog', 'about', 'contact', 'detail']) {
      const html = renderSite(demo, {
        ...opts,
        page,
        productId: demo.products[0].id,
        assetUrl: (id) => id,
      });
      expect(html).toContain('Pawfect Groom');
      expect(html).not.toContain('Example toy');
      expect(html).not.toContain('__WR_');
      if (page === 'home') expect(html).toContain('/templates/pawfect-groom/hero.jpg');
    }
  });
  it('is selectable, persists through validation and exposes a versioned AI guide', () => {
    expect(isActiveTemplate('pawfect-groom')).toBe(true);
    expect(TEMPLATES.find((t) => t.id === 'pawfect-groom')?.englishName).toBe('Pawfect Groom');
    expect(validateDraft(draft()).template).toBe('pawfect-groom');
    const guide = guideSchema.parse(getTemplateGuide('pawfect-groom'));
    expect(currentMaterialsTemplate('pawfect-groom')).toMatchObject({
      templateId: 'pawfect-groom',
      contractRevision: '2026-10-03.pawfect-groom-materials.5',
      guideRevision: guide.revision,
      materialsReady: true,
    });
    expect(templateCoverUrl('pawfect-groom')).toMatch(/pawfect-groom/);
  });
  it.each(['home', 'catalog', 'detail', 'about', 'contact'])(
    'renders %s with real company data and one main heading',
    (page) => {
      const html = renderSite(draft(), { ...opts, page, productId: 'full-groom' });
      expect(html).toContain('Maple &amp; Paws');
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('noindex,nofollow');
      expect(html).not.toContain('Sarah');
      expect(html).not.toContain('Fully Insured');
      expect(html).not.toContain('from £');
    },
  );
  it('links services to their detail pages and preselects the correct service at contact', () => {
    const catalog = renderSite(draft(), { ...opts, page: 'catalog' });
    expect(catalog).toContain('../products/full-groom/index.html');
    const detail = renderSite(draft(), { ...opts, page: 'detail', productId: 'full-groom' });
    expect(detail).toContain('../../contact/index.html?productId=full-groom');
    expect(detail).toContain('Customer supplied service description');
    expect(detail).toContain('https://assets.example.test/service-detail');
    const contact = renderSite(draft(), { ...opts, page: 'contact', productId: 'full-groom' });
    expect(contact).toContain('value="full-groom" selected');
    expect(contact).toContain('type="submit" disabled');
  });
  it('supports missing services, missing detail IDs, and escaped customer input', () => {
    const empty = { ...draft(), products: [] };
    expect(renderSite(empty, opts)).toContain('The Bath &amp; Dry');
    expect(renderSite(empty, { ...opts, page: 'detail', productId: 'missing' })).toContain(
      'Service not found',
    );
    const unsafe = draft();
    unsafe.company.name = '<img src=x onerror=alert(1)>';
    expect(renderSite(unsafe, opts)).not.toContain('<img src=x');
    expect(renderSite(unsafe, opts)).toContain('&lt;img');
  });
  it('exports every page and resolves bundled media against the builder origin', () => {
    const files = renderSiteFiles(draft(), {
      ...opts,
      preview: false,
      publicBaseUrl: 'https://builder.example.test',
    });
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining([
        'en/index.html',
        'en/catalog/index.html',
        'en/about/index.html',
        'en/contact/index.html',
        'en/products/full-groom/index.html',
      ]),
    );
    expect(files['en/index.html']).toContain(
      'https://builder.example.test/templates/pawfect-groom/hero.jpg',
    );
    expect(files['en/about/index.html']).toContain(
      'https://builder.example.test/templates/pawfect-groom/salon-illustration.png',
    );
    expect(files['en/index.html']).not.toContain('noindex,nofollow');
    expect(files['en/contact/index.html']).not.toContain('type="submit" disabled');
  });
  it('uses the shared page banner editor without changing service details', () => {
    const d = {
      ...draft(),
      banners: [
        {
          ...newBanner('home-banner', ['home']),
          slides: [{ assetId: 'my-banner', alt: 'Our salon' }],
        },
      ],
    } as any;
    expect(renderSite(d, opts)).toContain('https://assets.example.test/my-banner');
    expect(renderSite(d, { ...opts, page: 'detail', productId: 'full-groom' })).not.toContain(
      'https://assets.example.test/my-banner',
    );
  });
});
