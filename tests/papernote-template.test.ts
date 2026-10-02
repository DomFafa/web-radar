import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { defaultDraft } from '../src/worker/domain';
import { renderSite, renderSiteFiles } from '../src/templates';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { ACTIVE_TEMPLATE_IDS } from '../src/shared/template-availability';
import { templateMediaRequirements } from '../src/shared/template-media';

describe('papernote template integration', () => {
  it('is retired from the selectable template library', () => {
    expect(ACTIVE_TEMPLATE_IDS).not.toContain('papernote');
    expect(TEMPLATES.find(t => t.id === 'papernote')).toBeUndefined();
  });

  it('has media checklist configured in templateMediaRequirements', () => {
    const req = templateMediaRequirements.papernote;
    expect(req).toBeDefined();
    expect(req?.productCount).toBe(6);
    expect(req?.videos).toBe(0);
    expect(req?.slots.length).toBe(2);
  });

  it('has local preview and assets present on disk', () => {
    const previewFile = path.resolve(__dirname, '../public/templates/previews/papernote.jpg');
    expect(fs.existsSync(previewFile)).toBe(true);
    expect(fs.statSync(previewFile).size).toBeGreaterThan(10000);

    const assetFiles = [
      'c0EZxtMucSR6UOSZk2TBnWsqr4.svg',
      '4IckPhU7adDdKpZgaXHSQbDfIGs.jpg',
      'c4RlFMPpkQEnOaEKxb8WZAUcIE.png',
      'G9h3TPR4kRjysyLcUeTWzhBNw.png',
      'dktOvuMg77JU2AXkvDLYsqClz3k.png',
      'Hp914CQYoNY4LxnDfmgkotkqLw.png',
      'BIb0XwjExtsZAwvvTdB7LPo.png',
      'ySbjC4RkzXKX8JkWKlPkWFXBWtw.png',
      'OMO5pzwabGu0c8K9OKmu1225aw.jpg',
    ];
    for (const file of assetFiles) {
      const p = path.resolve(__dirname, '../public/templates/papernote', file);
      expect(fs.existsSync(p), `Missing asset: ${file}`).toBe(true);
      expect(fs.statSync(p).size).toBeGreaterThan(100);
    }
  });

  it('renders home page with 1:1 PaperNote design elements', () => {
    const draft = {
      ...defaultDraft(),
      template: 'papernote' as const,
      company: {
        ...defaultDraft().company,
        name: 'Monica',
        slogan: 'A Graphic Designer with 3+ years of experience, building awesome logos and brand identity for cool companies :)',
        email: 'monica115@gmail.com',
        address: 'Los Angeles, California',
      },
    };

    const html = renderSite(draft, {
      projectId: 'proj-papernote',
      lang: 'en',
      page: 'home',
      preview: false,
      assetUrl: id => `/api/assets/${id}`,
      inquiryUrl: '/api/inquiry',
    });

    // Structure & fonts
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('/templates/papernote/outfit-1.woff2');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).toContain('c0EZxtMucSR6UOSZk2TBnWsqr4.svg');

    // Branding & Header
    expect(html).toContain('Monica');
    expect(html).toContain('Available for hire');
    expect(html).toContain('Los Angeles, California');
    expect(html).toContain('pn-nav-bar');

    // Hero section
    expect(html).toContain('pn-photo-frame');
    expect(html).toContain('4IckPhU7adDdKpZgaXHSQbDfIGs.jpg');
    expect(html).toContain('pn-sparkle-svg');
    expect(html).toContain('pn-arrow-svg');
    expect(html).toContain('See my Portfolio');

    // Projects (Polaroids with tilt)
    expect(html).toContain('Dry Sun');
    expect(html).toContain('Green Strike');
    expect(html).toContain('Clean Ocean');
    expect(html).toContain('rotate(-2deg)');
    expect(html).toContain('rotate(1deg)');
    expect(html).toContain('rotate(2.5deg)');

    // Services section with punch holes
    expect(html).toContain('My Services');
    expect(html).toContain('pn-hole-punch');
    expect(html).toContain('Branding and Identity');
    expect(html).toContain('Print Design');
    expect(html).toContain('Packaging Design');
    expect(html).toContain('Illustration and Art');

    // Experience section
    expect(html).toContain('My Experience');
    expect(html).toContain('Graphic Designer');

    // FAQ section
    expect(html).toContain('FAQ');
    expect(html).toContain('pn-faq-item');
    expect(html).toContain('What services do you offer?');

    // Footer
    expect(html).toContain('pn-footer');
    expect(html).toContain('Ready to Bring Your Vision to Life?');
  });

  it('renders all subpages: catalog, detail, about, contact', () => {
    const draft = {
      ...defaultDraft(),
      template: 'papernote' as const,
    };
    const baseOpts = {
      projectId: 'proj-papernote',
      lang: 'en' as const,
      preview: false,
      assetUrl: (id: string) => `/api/assets/${id}`,
      inquiryUrl: '/api/inquiry',
    };

    // Catalog page
    const catalogHtml = renderSite(draft, { ...baseOpts, page: 'catalog' });
    expect(catalogHtml).toContain('My Portfolio');
    expect(catalogHtml).toContain('Dry Sun');

    // Detail page
    const detailHtml = renderSite(draft, {
      ...baseOpts,
      page: 'detail',
      productId: draft.products[0]?.id || 'p-1',
    });
    expect(detailHtml).toContain('Back to Portfolio');
    expect(detailHtml).toContain('Client');
    expect(detailHtml).toContain('Service');

    // About page
    const aboutHtml = renderSite(draft, { ...baseOpts, page: 'about' });
    expect(aboutHtml).toContain('Resume &amp; Services');
    expect(aboutHtml).toContain('My Services');

    // Contact page
    const contactHtml = renderSite(draft, { ...baseOpts, page: 'contact' });
    expect(contactHtml).toContain('Contact Me');
    expect(contactHtml).toContain('Send a Direct Note');
    expect(contactHtml).toContain('id="inquiry"');
  });

  it('exports site files with renderSiteFiles correctly', () => {
    const draft = {
      ...defaultDraft(),
      template: 'papernote' as const,
    };
    const files = renderSiteFiles(draft, {
      projectId: 'proj-papernote',
      publicBaseUrl: 'https://mysite.example.com',
      assetUrl: id => `/assets/${id}`,
      inquiryUrl: 'https://mysite.example.com/api/inquiry',
    });

    expect(files['index.html']).toBeDefined();
    expect(files['en/index.html']).toBeDefined();
    expect(files['en/catalog/index.html']).toBeDefined();
    expect(files['en/about/index.html']).toBeDefined();
    expect(files['en/contact/index.html']).toBeDefined();
    expect(files['en/index.html']).toContain('https://mysite.example.com/templates/papernote/');
  });
});
