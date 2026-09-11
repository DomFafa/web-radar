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
