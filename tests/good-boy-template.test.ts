import { describe, it, expect } from 'vitest';
import { renderSite, renderSiteFiles, type RenderOptions } from '../src/templates';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { getTemplateGuide } from '../src/worker/template-guides/catalog';
import { getMaterialsTemplate } from '../src/templates/materials';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { newBanner } from '../src/shared/banner-config';
import { projectPreviewRuntimeForDraft } from '../src/worker/project-preview';
const customer = () => ({
  ...defaultDraft(),
  template: 'good-boy-pals' as const,
  company: {
    ...defaultDraft().company,
    name: 'Maple & Paws',
    email: 'hello@example.test',
    address: 'Customer supplied address',
    description: 'Supplies for everyday adventures.',
  },
  products: [
    {
      id: 'rope',
      name: 'Cotton Rope',
      description: 'Approved product description',
      material: 'Cotton',
      dimensions: '30 cm',
      imageAssetId: 'rope-photo',
      gallery: [
        {
          assetId: 'rope-detail',
          sourceImageId: 'rope-detail',
          kind: 'detail' as const,
          caption: 'Cotton detail',
        },
      ],
    },
  ],
});
const opts: RenderOptions = {
  projectId: 'customer-project',
  lang: 'en',
  page: 'home',
  assetUrl: (id) => 'https://assets.example.test/' + id,
  inquiryUrl: 'https://api.example.test/inquiry',
  preview: true,
};
describe('Good Boy integrated template', () => {
  it('preserves retired projects and their guide and materials contract', () => {
    expect(TEMPLATES.find((t) => t.id === 'good-boy-pals')).toBeUndefined();
    expect(validateDraft(customer()).template).toBe('good-boy-pals');
    const guide = getTemplateGuide('good-boy-pals')!;
    expect(guide.pagePlan.productDetail).not.toHaveLength(0);
    const contract = getMaterialsTemplate('good-boy-pals')!;
    expect(contract).toMatchObject({ materialsReady: true, guideRevision: guide.revision });
    expect(contract.requiredCapabilities).toContain('image.product-primary.v1');
    expect(contract.imageSlots.find((s) => s.id === 'hero-portrait')).toMatchObject({
      width: 1024,
      height: 1152,
    });
  });
  it('renders the reference demo with original sections and local assets', () => {
    const d = materialsDemoDraft(getMaterialsTemplate('good-boy-pals')!, 'en');
    const html = renderSite(d, { ...opts, projectId: 'materials-demo', assetUrl: (id) => id });
    for (const text of [
      'Everything',
      'boys',
      'Shop by pet.',
      'Muddy dog?',
      'Meet Biscuit.',
      'Nice things people said.',
      'Come say hi.',
    ])
      expect(html).toContain(text);
    expect(html).toContain('/templates/good-boy-pals/hero-dog-DxsknfB3.jpg');
    expect(html).toContain('/templates/good-boy-pals/font-');
    expect(html).not.toMatch(/https:\/\/(?:fonts\.google|good-boy-pals|shop\.goodboy|lovable)/);
    expect(html).not.toContain('Made with');
  });
  it.each(['home', 'catalog', 'detail', 'about', 'contact'])(
    'uses customer content on %s and omits reference business claims',
    (page) => {
      const html = renderSite(customer(), { ...opts, page, productId: 'rope' });
      expect(html).toContain('Maple &amp; Paws');
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).not.toContain('88 North Street');
      expect(html).not.toContain('Since 2014');
      expect(html).not.toContain('Sophie, Bedminster');
      expect(html).not.toContain('£18');
      expect(html).not.toContain('Your tenth bag of food is on us');
      expect(html).toContain('noindex,nofollow');
    },
  );
  it('links to product details and passes selected product to the inquiry form', () => {
    expect(renderSite(customer(), { ...opts, page: 'catalog' })).toContain(
      '../products/rope/index.html',
    );
    const detail = renderSite(customer(), { ...opts, page: 'detail', productId: 'rope' });
    expect(detail).toContain('../../contact/index.html?productId=rope');
    expect(detail).toContain('https://assets.example.test/rope-detail');
    expect(detail).toContain('id="wr-detail-main-img"');
    const contact = renderSite(customer(), { ...opts, page: 'contact', productId: 'rope' });
    expect(contact).toContain('value="rope" selected');
    expect(contact).toContain('type="submit" disabled');
  });
  it('exports full site with absolute local resource origins', () => {
    const files = renderSiteFiles(customer(), {
      ...opts,
      preview: false,
      publicBaseUrl: 'https://builder.example.test',
    });
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining([
        'en/index.html',
        'en/catalog/index.html',
        'en/products/rope/index.html',
        'en/about/index.html',
        'en/contact/index.html',
      ]),
    );
    expect(files['en/index.html']).toContain(
      'https://builder.example.test/templates/good-boy-pals/hero-dog-DxsknfB3.jpg',
    );
    expect(files['en/index.html']).toContain(
      'https://builder.example.test/templates/good-boy-pals/font-',
    );
    expect(files['en/contact/index.html']).not.toContain('type="submit" disabled');
  });
  it('supports approved homepage banners without adding them to product details', () => {
    const d = {
      ...customer(),
      banners: [
        { ...newBanner('hero', ['home']), slides: [{ assetId: 'my-hero', alt: 'Our photograph' }] },
      ],
    };
    expect(renderSite(d, opts)).toContain('https://assets.example.test/my-hero');
    expect(renderSite(d, { ...opts, page: 'detail', productId: 'rope' })).not.toContain(
      'https://assets.example.test/my-hero',
    );
    expect(projectPreviewRuntimeForDraft(d)).toContain('data-gb-menu');
  });
  it('escapes input and handles missing products without inventing customer items', () => {
    const d = customer();
    d.company.name = '<img src=x onerror=alert(1)>';
    const html = renderSite(d, opts);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
    expect(renderSite({ ...customer(), products: [] }, opts)).toContain(
      'Our collection is being prepared',
    );
    expect(
      renderSite(
        { ...customer(), products: [] },
        { ...opts, page: 'detail', productId: 'missing' },
      ),
    ).toContain('Product not found');
  });
});
