import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { renderSite } from '../src/templates';

describe('Quantum² SaaS integrated template', () => {
  it('is selectable in TemplateSelector with valid preview and badge', () => {
    const template = TEMPLATES.find(t => t.id === 'quantum-saas');
    expect(template).toBeDefined();
    expect(template?.englishName).toBe('Quantum² Screen Intelligence');
    expect(template?.badge).toContain('Quantum²');
    expect(template?.hasVideo).toBe(true);
    expect(existsSync(resolve('public', template!.previewImg.replace(/^\//, '')))).toBe(true);
  });

  it('provides all 5 standalone pages with Figtree variable font and identical navbar geometry', () => {
    const dir = resolve('public/templates/quantum-saas');
    const pages = ['index.html', 'product.html', 'pricing.html', 'blog.html', 'faq.html'];

    for (const page of pages) {
      const filePath = resolve(dir, page);
      expect(existsSync(filePath), `file ${page} must exist`).toBe(true);
      const html = readFileSync(filePath, 'utf-8');

      // Check Figtree font
      expect(html).toContain('family=Figtree');
      expect(html).toContain('--font-sans');

      // Check Navbar geometry
      expect(html).toContain('class="nav"');
      expect(html).toContain('Quantum<sup>2</sup>');
      expect(html).toContain('width: 880px');
      expect(html).toContain('height: 52px');
      expect(html).toContain('border-radius: 26px');
      expect(html).toContain('burgerBtn');
    }
  });

  it('renders dynamic pages via Web Radar template engine', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'quantum-saas',
      company: {
        ...defaultDraft().company,
        name: 'Quantum Tech Corp',
      },
    });

    const ctx = {
      projectId: 'proj_123',
      lang: 'en' as const,
      preview: true,
      assetUrl: (id: string) => `/media/${id}`,
      inquiryUrl: '/inquiry',
    };

    const homeHtml = renderSite(draft, { ...ctx, page: 'home' });
    expect(homeHtml).toContain('Quantum<sup>2</sup>');
    expect(homeHtml).toContain('Convert Screen recording into');
    expect(homeHtml).toContain('Outcome Review');

    const productHtml = renderSite(draft, { ...ctx, page: 'catalog' });
    expect(productHtml).toContain('Quantum<sup>2</sup>');
    expect(productHtml).toContain('class="nav"');

    const pricingHtml = renderSite(draft, { ...ctx, page: 'about' });
    expect(pricingHtml).toContain('Quantum<sup>2</sup>');
    expect(pricingHtml).toContain('Starter');
    expect(pricingHtml).toContain('Pro');

    const faqHtml = renderSite(draft, { ...ctx, page: 'contact' });
    expect(faqHtml).toContain('Quantum<sup>2</sup>');
    expect(faqHtml).toContain('FAQ & Support');
  });
});
