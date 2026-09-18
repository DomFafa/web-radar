import { describe, it, expect } from 'vitest';
import type { Draft, Language } from '../src/shared/model';
import { renderSite, renderSiteFiles, labels } from '../src/templates';
const draft = (): Draft => ({
  company: {
    name: 'Field & Form',
    email: 'hello@example.com',
    contactName: 'Alex',
    type: 'trader',
    description: 'Objects selected for daily life.',
    facebook: '',
    instagram: '',
    x: '',
  },
  products: [
    {
      id: 'p-one',
      name: 'Oak form',
      description: 'A compact wooden object.',
      material: 'Oak',
      dimensions: '12 cm',
      imageAssetId: 'product',
    },
  ],
  primaryProductId: 'p-one',
  category: 'general',
  country: 'DE',
  languages: ['en', 'de'],
  template: 'natural',
  brandColor: '#52684b',
  copy: {
    en: {
      headline: 'Good things, thoughtfully chosen.',
      subtitle: 'Objects for everyday life.',
      about: 'Objects selected for daily life.',
      cta: 'Explore our collection',
    },
    de: {
      headline: 'Mit Sorgfalt ausgewählt.',
      subtitle: 'Dinge für den Alltag.',
      about: 'Objekte für jeden Tag.',
      cta: 'Kollektion entdecken',
    },
  },
  duration: 8,
  direction: 'Soft daylight',
  script: 'A gentle product study',
  scriptRevision: 1,
  scenes: [],
  storyboardRevision: 1,
  heroAssetId: 'video',
  posterAssetId: 'poster',
  heroAccepted: true,
});
const opts = {
  projectId: 'project',
  lang: 'en' as Language,
  page: 'home',
  assetUrl: (id: string) => `https://media.example/${id}`,
  inquiryUrl: 'https://wr.example/api/public/sites/project/inquiries',
};
describe('natural website journey', () => {
  it('renders real video, product navigation, contact form and reduced motion fallback', () => {
    const d = draft();
    const home = renderSite(d, opts);
    expect(home).toContain('<video');
    expect(home).toContain('autoplay');
    expect(home).toContain('muted');
    expect(home).toContain('loop');
    expect(home).toContain('prefers-reduced-motion');
    expect(home).toContain('https://media.example/video');
    expect(home).toContain('products/p-one/index.html');
    const contact = renderSite(d, { ...opts, page: 'contact' });
    expect(contact).toContain('name="email"');
    expect(contact).toContain('name="message"');
    expect(contact).toContain(opts.inquiryUrl);
    expect(contact).toContain('crypto.randomUUID');
    expect(contact).toContain('Your inquiry has been saved');
  });
  it('generates five page types in each selected language and all product detail pages', () => {
    const files = renderSiteFiles(draft(), {
      ...opts,
      publicBaseUrl: 'https://wr.example/public/sites/project',
    });
    for (const lang of ['en', 'de'])
      for (const path of [
        'index.html',
        'catalog/index.html',
        'products/p-one/index.html',
        'about/index.html',
        'contact/index.html',
      ])
        expect(files[`${lang}/${path}`]).toContain(`lang="${lang}"`);
    expect(files['de/contact/index.html']).toContain('Anfrage senden');
  });
  it('escapes content, identifiers, invalid colors and unsafe external URLs', () => {
    const d = draft();
    d.company.name = '<script>alert(1)</script>';
    d.company.instagram = 'javascript:alert(1)';
    d.brandColor = 'red;}body{display:none}';
    d.products[0].id = '../../bad" onclick="x';
    d.copy.en!.headline = '<img src=x onerror=alert(1)>';
    const html = renderSite(d, opts);
    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('red;}');
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('href="products/../../');
  });
  it('rejects private preview exports and keeps absent facts absent', () => {
    const d = draft();
    d.company.description = '';
    d.products[0].material = '';
    d.products[0].dimensions = '';
    d.copy.en!.about = '';
    const html = renderSite(d, { ...opts, page: 'about', preview: true });
    expect(html).toContain('noindex');
    expect(html).not.toMatch(/certified|years of experience|ISO 9001|factory capacity/i);
  });
});
describe('three original templates and six UI languages', () => {
  it('uses distinct compositions with a video hero in every style', () => {
    const outputs = ['natural', 'technology', 'explorer'].map((template) =>
      renderSite({ ...draft(), template: template as Draft['template'] }, opts),
    );
    for (let i = 0; i < outputs.length; i++) {
      expect(outputs[i]).toContain(`data-template="${['natural', 'technology', 'explorer'][i]}"`);
      expect(outputs[i]).toContain('<video');
    }
    expect(new Set(outputs).size).toBe(3);
  });
  it('covers every UI label key for all six languages', () => {
    const keys = Object.keys(labels.en).sort();
    for (const lang of ['en', 'de', 'fr', 'es', 'pt', 'it'] as Language[]) {
      expect(Object.keys(labels[lang]).sort()).toEqual(keys);
      for (const text of Object.values(labels[lang])) expect(text.trim()).not.toBe('');
      const d = draft();
      d.languages = ['en', lang];
      d.copy[lang] = d.copy.en;
      expect(renderSite(d, { ...opts, lang, page: 'contact' })).toContain(labels[lang].send);
    }
  });
});
it('keeps one primary heading when the about page reuses the video hero', () => {
  const html = renderSite(draft(), { ...opts, page: 'about' });
  expect(html.match(/<h1[ >]/g)).toHaveLength(1);
});
it('keeps brand-colored text controls readable for light and dark brand colors', () => {
  expect(renderSite({ ...draft(), brandColor: '#ffffff' }, opts)).toContain('--brand-ink:#17261c');
  expect(renderSite({ ...draft(), brandColor: '#000000' }, opts)).toContain('--brand-ink:#ffffff');
});
describe('10 professional preset templates', () => {
  const all10Templates: Draft['template'][] = [
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

  it('renders each of the 10 templates with unique composition and data-template attribute', () => {
    const outputs = all10Templates.map((template) => renderSite({ ...draft(), template }, opts));
    for (let i = 0; i < outputs.length; i++) {
      expect(outputs[i]).toContain(`data-template="${all10Templates[i]}"`);
      expect(outputs[i]).toContain('<!doctype html>');
      expect(outputs[i]).toContain('data-wr-page="home"');
      expect(outputs[i]).toContain('data-wr-page="catalog"');
    }
    // All 10 templates produce distinct HTML outputs
    expect(new Set(outputs).size).toBe(10);
  });

  it('verifies specialized features for each template', () => {
    const d = draft();

    // Template 1: 100% webimg senseng clean
    const t1 = renderSite({ ...d, template: 'senseng-clean' }, opts);
    expect(t1).toContain('Sensory & Character Showcase');
    expect(t1).toContain('Shelf-ready squishy lines');

    // Template 2: senseng fullscreen video variant
    const t2 = renderSite({ ...d, template: 'senseng-video' }, opts);
    expect(t2).toContain('hero-scroll-cue');
    expect(t2).toContain('<video id="hero-video"');

    // References retain their actual visual structures and use project images.
    const landmarks = {
      'saas-automation': 'hero-video',
      'fintech-platform': 'financial-management-platform-header',
      'digital-marketing': 'ns-img-291',
      'porto-accounting': 'header-body',
      'crafto-corporate': 'wr-crafto-hero',
      'juno-toys': 'wr-juno-hero',
      'corpox-ai-agency': 'ai-agency-demo-banner',
      'corpox-consulting': 'wr-consulting-hero',
    };
    for (const [template, landmark] of Object.entries(landmarks)) {
      const html = renderSite({ ...d, template: template as Draft['template'] }, opts);
      expect(html).toContain(landmark);
      expect(html).toContain('https://media.example/product');
      expect(html).toContain('data-wr-bound-product="true"');
      expect(html).toContain('products/p-one/index.html');
      expect(html).toContain('https://wr.example/templates/references/');
      expect(html).not.toContain('__WR_');
      expect(html).not.toMatch(/<script[^>]+src=/);
      expect(html).not.toMatch(/ on(?:click|load|error)=/);
    }
  });
});

describe('reference template product and route integration', () => {
  const templates = [
    'saas-automation',
    'fintech-platform',
    'digital-marketing',
    'porto-accounting',
    'crafto-corporate',
    'juno-toys',
    'corpox-ai-agency',
    'corpox-consulting',
  ] as const;
  for (const template of templates) {
    it(`${template} uses the selected primary image and exports every page`, () => {
      const d = draft();
      d.template = template;
      d.products.push({
        id: 'primary / <item>',
        name: '<Primary product>',
        description: 'Details',
        material: '',
        dimensions: '',
        imageAssetId: 'primary',
      });
      d.primaryProductId = 'primary / <item>';
      const html = renderSite(d, { ...opts, preview: true });
      expect(html).toMatch(
        /<img[^>]*data-wr-product-slot="0"[^>]*src="https:\/\/media.example\/primary"|<img[^>]*src="https:\/\/media.example\/primary"[^>]*data-wr-product-slot="0"/,
      );
      expect(html).toContain('&lt;Primary product&gt;');
      expect(html).not.toContain('<Primary product>');
      const files = renderSiteFiles(d, {
        ...opts,
        publicBaseUrl: 'https://wr.example/public/sites/project',
      });
      for (const page of ['catalog', 'about', 'contact']) {
        expect(files[`en/${page}/index.html`]).toContain('wr-inner');
        expect(files[`en/${page}/index.html`]).toContain('data-wr-page="catalog"');
      }
      expect(files['en/contact/index.html']).toContain('id="inquiry"');
      expect(files['en/contact/index.html']).toContain(opts.inquiryUrl);
      expect(html).toContain('primary%20%2F%20%3Citem%3E/index.html');
    });
  }
});

it('renders saved gallery images and fixed website copy on product details only',()=>{
  const d=draft();
  Object.assign(d.products[0],{tagline:'Made for daily use',sellingPoints:['Approved feature'],applications:['At home'],gallery:[{assetId:'product',sourceImageId:'original',kind:'original',caption:'Original'},{assetId:'side-view',sourceImageId:'side',kind:'angle',caption:'Side view'}]});
  const html=renderSite(d,{...opts,page:'detail',productId:'p-one'});
  expect(html).toContain('https://media.example/side-view');
  expect(html).toContain('Made for daily use');
  expect(html).toContain('Approved feature');
  expect(html).toContain('At home');
  expect(renderSite(d,{...opts,page:'catalog'})).not.toContain('https://media.example/side-view');
});

describe('senseng toy templates (senseng-candy & senseng-wonder)', () => {
  const toyTemplates: Draft['template'][] = ['senseng-candy', 'senseng-wonder'];

  for (const template of toyTemplates) {
    it(`renders ${template} full website journey across 5 page types`, () => {
      const d = draft();
      d.template = template;
      d.languages = ['en', 'de'];

      // Home
      const homeHtml = renderSite(d, opts);
      expect(homeHtml).toContain(`data-template="${template}"`);
      expect(homeHtml).toContain('data-wr-page="home"');
      expect(homeHtml).toContain('<!doctype html>');
      expect(homeHtml).toContain('products/p-one/index.html');

      // Catalog
      const catalogHtml = renderSite(d, { ...opts, page: 'catalog' });
      expect(catalogHtml).toContain('data-wr-page="catalog"');
      expect(catalogHtml).toContain('products/p-one/index.html');

      // Detail
      const detailHtml = renderSite(d, { ...opts, page: 'detail', productId: 'p-one' });
      expect(detailHtml).toContain('data-wr-page="detail"');
      expect(detailHtml).toContain('p-one');

      // About
      const aboutHtml = renderSite(d, { ...opts, page: 'about' });
      expect(aboutHtml).toContain('data-wr-page="about"');
      expect(aboutHtml).toContain('Field &amp; Form');

      // Contact
      const contactHtml = renderSite(d, { ...opts, page: 'contact' });
      expect(contactHtml).toContain('data-wr-page="contact"');
      expect(contactHtml).toContain('id="inquiry"');
      expect(contactHtml).toContain(opts.inquiryUrl);

      // Render all site files
      const files = renderSiteFiles(d, {
        ...opts,
        publicBaseUrl: 'https://wr.example/public/sites/project',
      });
      for (const lang of ['en', 'de']) {
        for (const path of [
          'index.html',
          'catalog/index.html',
          'products/p-one/index.html',
          'about/index.html',
          'contact/index.html',
        ]) {
          expect(files[`${lang}/${path}`]).toBeDefined();
          expect(files[`${lang}/${path}`]).toContain(`lang="${lang}"`);
        }
      }
    });
  }

  it('verifies specialized layout signatures for senseng-candy and senseng-wonder', () => {
    const d = draft();

    // senseng-candy: Candy pop playground layout
    const candyHome = renderSite({ ...d, template: 'senseng-candy' }, opts);
    expect(candyHome).toContain('wr-candy-ribbon');
    expect(candyHome).toContain('wr-candy-hero');
    expect(candyHome).toContain('wr-candy-stage');
    expect(candyHome).toContain('wr-candy-card');

    const candyAbout = renderSite({ ...d, template: 'senseng-candy' }, { ...opts, page: 'about' });
    expect(candyAbout).toContain('wr-senseng-candy-inner');

    // senseng-wonder: Nordic storybook bento layout
    const wonderHome = renderSite({ ...d, template: 'senseng-wonder' }, opts);
    expect(wonderHome).toContain('wr-wonder-ribbon');
    expect(wonderHome).toContain('wr-wonder-hero');
    expect(wonderHome).toContain('wr-wonder-card');
    expect(wonderHome).toContain('CHAPTER 01');

    const wonderContact = renderSite({ ...d, template: 'senseng-wonder' }, { ...opts, page: 'contact' });
    expect(wonderContact).toContain('wr-senseng-wonder-inner');

    // The two layouts have completely different structures
    expect(candyHome).not.toEqual(wonderHome);
  });
});

