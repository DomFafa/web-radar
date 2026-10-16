import { describe, expect, it } from 'vitest';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { getMaterialsTemplate } from '../src/templates/materials';
import { renderSite, renderSiteFiles, type RenderOptions } from '../src/templates';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { getTemplateGuide } from '../src/worker/template-guides/catalog';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { currentMaterialsTemplate } from '../src/worker/template-guides/current-materials';

const customerDraft = () => ({
  ...defaultDraft(),
  template: 'toorun-early-learning' as const,
  company: {
    ...defaultDraft().company,
    name: 'Maple Learning House',
    email: 'hello@example.test',
    address: 'Customer supplied address',
    description: 'Play-based early learning with clear family communication.',
  },
  products: [
    {
      id: 'explorers',
      name: 'Little Explorers',
      description: 'Customer supplied program description.',
      material: 'Guided play',
      dimensions: 'Ages 3–4',
      imageAssetId: 'program-photo',
      sellingPoints: ['Small-group activities'],
      gallery: [
        {
          assetId: 'program-detail',
          sourceImageId: 'program-detail',
          kind: 'detail' as const,
          caption: 'Learning activity',
        },
      ],
    },
  ],
});

const options: RenderOptions = {
  projectId: 'customer-project',
  lang: 'en',
  page: 'home',
  preview: true,
  assetUrl: (id) => `https://assets.example.test/${id}`,
  inquiryUrl: 'https://api.example.test/inquiry',
};

describe('Toorun early-learning integrated template', () => {
  it('is selectable and has a versioned AI materials contract', () => {
    expect(TEMPLATES.find((template) => template.id === 'toorun-early-learning')).toMatchObject({
      englishName: 'Toorun Early Learning',
    });
    expect(validateDraft(customerDraft()).template).toBe('toorun-early-learning');
    const guide = getTemplateGuide('toorun-early-learning')!;
    expect(currentMaterialsTemplate('toorun-early-learning')).toMatchObject({ contractRevision: '2026-10-03.toorun-early-learning-materials.5', guideRevision: guide.revision });
    const contract = getMaterialsTemplate('toorun-early-learning')!;
    expect(contract).toMatchObject({
      templateId: 'toorun-early-learning',
      contractRevision: '2026-10-02.toorun-early-learning-materials.1',
      guideRevision: '2026-10-02.1',
      materialsReady: true,
    });
    expect(contract.imageSlots).toHaveLength(3);
    expect(contract.imageSlots.find((slot) => slot.id === 'product-main')).toMatchObject({
      width: 1200,
      height: 1200,
    });
  });

  it('renders the reference demo with bundled assets and no live-site dependency', () => {
    const contract = getMaterialsTemplate('toorun-early-learning')!;
    const demo = materialsDemoDraft(contract, 'en');
    const html = renderSite(demo, {
      ...options,
      projectId: 'materials-demo',
      assetUrl: (id) => id,
    });
    expect(html).toContain('Toorun');
    expect(html).toContain('/templates/toorun-early-learning/clouds.png');
    expect(html).toContain('/templates/toorun-early-learning/quicksand-latin.woff2');
    expect(html).not.toMatch(/https:\/\/(?:fonts\.google|fonts\.gstatic|toorun\.webflow)/);
  });

  it.each(['home', 'catalog', 'detail', 'about', 'contact'])(
    'renders %s with customer content and one main heading',
    (page) => {
      const html = renderSite(customerDraft(), {
        ...options,
        page,
        productId: 'explorers',
      });
      expect(html).toContain('Maple Learning House');
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('noindex,nofollow');
      expect(html).not.toContain('parent testimonial');
      expect(html).not.toContain('$99');
    },
  );

  it('links programs to details and preselects the program in the inquiry form', () => {
    const catalog = renderSite(customerDraft(), { ...options, page: 'catalog' });
    expect(catalog).toContain('../products/explorers/index.html');
    const detail = renderSite(customerDraft(), {
      ...options,
      page: 'detail',
      productId: 'explorers',
    });
    expect(detail).toContain('../../contact/index.html?productId=explorers');
    expect(detail).toContain('https://assets.example.test/program-detail');
    const contact = renderSite(customerDraft(), {
      ...options,
      page: 'contact',
      productId: 'explorers',
    });
    expect(contact).toContain('value="explorers" selected');
    expect(contact).toContain('type="submit" disabled');
  });

  it('exports every page and resolves all bundled media against the builder origin', () => {
    const files = renderSiteFiles(customerDraft(), {
      ...options,
      preview: false,
      publicBaseUrl: 'https://builder.example.test',
    });
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining([
        'en/index.html',
        'en/catalog/index.html',
        'en/products/explorers/index.html',
        'en/about/index.html',
        'en/contact/index.html',
      ]),
    );
    expect(files['en/index.html']).toContain(
      'https://builder.example.test/templates/toorun-early-learning/clouds.png',
    );
    expect(files['en/index.html']).toContain(
      'https://builder.example.test/templates/toorun-early-learning/open-sans-latin.woff2',
    );
    expect(files['en/index.html']).not.toContain('noindex,nofollow');
    expect(files['en/contact/index.html']).not.toContain('type="submit" disabled');
  });

  it('does not invent demo programs for customer projects and escapes input', () => {
    const empty = { ...customerDraft(), products: [] };
    const html = renderSite(empty, options);
    expect(html).toContain('Programs are being prepared');
    expect(html).not.toContain('Little Explorers');
    const unsafe = customerDraft();
    unsafe.company.name = '<img src=x onerror=alert(1)>';
    const escaped = renderSite(unsafe, options);
    expect(escaped).not.toContain('<img src=x');
    expect(escaped).toContain('&lt;img');
  });
});
