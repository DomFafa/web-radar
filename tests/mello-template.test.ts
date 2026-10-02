import { describe, it, expect } from 'vitest';
import { renderSite, renderSiteFiles, type RenderOptions } from '../src/templates';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { getTemplateGuide } from '../src/worker/template-guides/catalog';
import { getMaterialsTemplate } from '../src/templates/materials';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { newBanner } from '../src/shared/banner-config';
import { parse, type DefaultTreeAdapterMap } from 'parse5';

const customer = () => ({
  ...defaultDraft(),
  template: 'mello-coffee' as const,
  company: {
    ...defaultDraft().company,
    name: 'Artisan Bloom Coffee',
    email: 'bloom@example.test',
    address: '42 Baker Street, London',
    description: 'Specialty pour-overs, artisan sourdough pastries, and bright moments.',
  },
  products: [
    {
      id: 'iced-matcha',
      name: 'Iced Strawberry Matcha',
      description: 'Hand-whisked organic Uji matcha layered with fresh strawberry puree and oat milk.',
      material: 'Ceramic Glassware',
      dimensions: '16 oz',
      imageAssetId: 'matcha-photo',
      gallery: [
        {
          assetId: 'matcha-detail',
          sourceImageId: 'matcha-detail',
          kind: 'detail' as const,
          caption: 'Fresh strawberry puree layer',
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

describe('Mello Coffee integrated template', () => {
  it('registers a selectable template and matching AI guide and materials contract', () => {
    const template = TEMPLATES.find((t) => t.id === 'mello-coffee');
    expect(template).toBeDefined();
    expect(template?.englishName).toBe('Mello Coffee & Bakery');
    expect(validateDraft(customer()).template).toBe('mello-coffee');

    const guide = getTemplateGuide('mello-coffee')!;
    expect(guide).toBeDefined();
    expect(guide.pagePlan.productDetail).not.toHaveLength(0);
    expect(guide.revision).toBe('2026-10-02.1');

    const contract = getMaterialsTemplate('mello-coffee')!;
    expect(contract).toMatchObject({ materialsReady: true, guideRevision: guide.revision });
    expect(contract.requiredCapabilities).toContain('image.product-primary.v1');
    expect(contract.imageSlots.find((s) => s.id === 'hero-portrait')).toMatchObject({
      width: 1200,
      height: 1000,
    });
  });

  it('renders the reference demo with original Mello sections and local assets', () => {
    const d = materialsDemoDraft(getMaterialsTemplate('mello-coffee')!, 'en');
    const html = renderSite(d, { ...opts, projectId: 'materials-demo', assetUrl: (id) => id });

    // Key branding and section titles
    expect(html).toContain('Mello');
    expect(html).toContain('Cold matcha');
    expect(html).toContain('Strawberry Matcha');
    expect(html).toContain('Cherry Cloud Mocha');
    expect(html).toContain('Vanilla Latte');
    expect(html).toContain('The Mello trio');

    // Interactive sections
    expect(html).toContain('What are you in the mood for?');
    expect(html).toContain('The right cup, right on time');
    expect(html).toContain('Pull up a chair. You’re staying');
    expect(html).toContain('Mia Carter');
    expect(html).toContain('Take a peek. Come on over');

    // Local assets and self-hosted fonts
    expect(html).toContain('/templates/mello-coffee/londrina-solid.woff2');
    expect(html).toContain('/templates/mello-coffee/gochi-hand.woff2');
    expect(html).toContain('/templates/mello-coffee/inter.woff2');
    expect(html).toContain('/templates/mello-coffee/6a75afbad8015a210ca48519_Cold matcha.avif');

    // No unauthorized external fonts or builders
    expect(html).not.toMatch(/https:\/\/(?:fonts\.google|lovable|webflow\.io)/);
  });

  it.each(['home', 'catalog', 'detail', 'about', 'contact'])(
    'uses customer content on %s and includes exactly one h1',
    (page) => {
      const html = renderSite(customer(), { ...opts, page, productId: 'iced-matcha' });
      expect(html).toContain('Artisan Bloom Coffee');
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('noindex,nofollow');
    },
  );

  it('links to product details and passes selected product to the inquiry form', () => {
    const catalog = renderSite(customer(), { ...opts, page: 'catalog' });
    expect(catalog).toContain('../products/iced-matcha/index.html');
    expect(catalog).toContain('Iced Strawberry Matcha');

    const detail = renderSite(customer(), { ...opts, page: 'detail', productId: 'iced-matcha' });
    expect(detail).toContain('../../contact/index.html?productId=iced-matcha');
    expect(detail).toContain('https://assets.example.test/matcha-photo');
    expect(detail).toContain('https://assets.example.test/matcha-detail');

    const contact = renderSite(customer(), { ...opts, page: 'contact', productId: 'iced-matcha' });
    expect(contact).toContain('value="iced-matcha" selected');
    expect(contact).toContain('type="submit" disabled');
  });

  it('offers the main image and every unique supplemental view as accessible gallery controls', () => {
    const draft = customer();
    draft.products[0].gallery.unshift({ assetId: 'matcha-photo', sourceImageId: 'matcha-photo', kind: 'detail', caption: 'Duplicate main' });
    const html = renderSite(draft, { ...opts, page: 'detail', productId: 'iced-matcha' });
    const buttons: Array<Record<string, string>> = [];
    const visit = (node: DefaultTreeAdapterMap['node']) => {
      if ('attrs' in node && node.attrs.some(a => a.name === 'data-wr-material-thumb')) buttons.push(Object.fromEntries(node.attrs.map(a => [a.name, a.value])));
      if ('childNodes' in node) node.childNodes.forEach(visit);
    };
    parse(html).childNodes.forEach(visit);
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toMatchObject({ type: 'button', 'aria-pressed': 'true', 'aria-label': 'Iced Strawberry Matcha' });
    expect(buttons[1]).toMatchObject({ type: 'button', 'aria-pressed': 'false', 'aria-label': 'Fresh strawberry puree layer' });
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
        'en/products/iced-matcha/index.html',
        'en/about/index.html',
        'en/contact/index.html',
      ]),
    );
    expect(files['en/index.html']).toContain(
      'https://builder.example.test/templates/mello-coffee/6a75afbad8015a210ca48519_Cold matcha.avif',
    );
    expect(files['en/index.html']).toContain(
      'https://builder.example.test/templates/mello-coffee/londrina-solid.woff2',
    );
    expect(files['en/contact/index.html']).not.toContain('type="submit" disabled');
  });

  it('supports approved homepage banners without adding them to product details', () => {
    const d = {
      ...customer(),
      banners: [
        { ...newBanner('hero', ['home']), slides: [{ assetId: 'my-cafe-hero', alt: 'Fresh Brew' }] },
      ],
    };
    expect(renderSite(d, opts)).toContain('https://assets.example.test/my-cafe-hero');
    expect(renderSite(d, { ...opts, page: 'detail', productId: 'iced-matcha' })).not.toContain(
      'https://assets.example.test/my-cafe-hero',
    );
  });

  it('escapes user input and handles missing products safely', () => {
    const d = customer();
    d.company.name = '<script>alert("xss")</script>';
    const html = renderSite(d, opts);
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

    expect(
      renderSite(
        { ...customer(), products: [] },
        { ...opts, page: 'detail', productId: 'non-existent' },
      ),
    ).toContain('Menu item not found');
  });
});
