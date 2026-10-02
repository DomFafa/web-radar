import { describe, expect, it } from 'vitest';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { renderSite, renderSiteFiles } from '../src/templates';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { getMaterialsTemplate } from '../src/templates/materials';
import { templateMediaRequirements } from '../src/shared/template-media';
import covers from '../src/worker/template-guides/covers.json';
import { imageContentGuideRevision, imageContentMaterialsRevision } from '../src/templates/materials-image-content';

describe('Auravell Yoga & Mindful Living Template', () => {
  it('validates a draft configured with template auravell', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
      company: {
        ...defaultDraft().company,
        name: 'Serene Sanctuary',
        description: 'Mindful yoga, meditation and acoustic sound healing.',
        email: 'hello@serenesanctuary.com',
        phone: '(888) 123 4567',
        address: '108 Lotus Way, Big Sur, CA 93920',
      },
      brandColor: '#99582a',
    });
    expect(draft.template).toBe('auravell');
    expect(draft.brandColor).toBe('#99582a');
  });

  it('is available in TemplateSelector with authentic preview and branding', () => {
    const item = TEMPLATES.find((t) => t.id === 'auravell');
    expect(item).toBeDefined();
    expect(item!.englishName).toBe('Auravell Yoga & Mindful Living');
    expect(item!.badge).toContain('Auravell');
    expect(item!.previewImg).toBe(covers.auravell.url);
    expect(item!.accentColor).toBe('#99582a');
  });

  it('provides a valid materials contract matching templateMediaRequirements', () => {
    const contract = getMaterialsTemplate('auravell');
    expect(contract).toBeDefined();
    expect(contract!.templateId).toBe('auravell');
    expect(contract!.guideRevision).toBe(imageContentGuideRevision);
    expect(contract!.contractRevision).toBe(imageContentMaterialsRevision('auravell'));
    expect(contract!.imagePolicy).toBe('typed-regions-v1');
    expect(contract!.materialsReady).toBe(true);

    const mediaReq = templateMediaRequirements['auravell'];
    expect(mediaReq).toBeDefined();
    expect(mediaReq!.bannerSize).toContain('3456 × 1800');
    expect(mediaReq!.videos).toBe(3);
  });

  it('renders home page with authentic layout, transparent text backgrounds and hero layering', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
      company: {
        ...defaultDraft().company,
        name: 'Prana Light Yoga',
        description: 'Nordic minimalism meets serene mindfulness meditation.',
      },
      brandColor: '#99582a',
    });

    const html = renderSite(draft, {
      projectId: 'auravell-demo',
      lang: 'en',
      page: 'home',
      assetUrl: (id) => id,
      inquiryUrl: '/inquiry',
      preview: true,
    });

    // Native motion and videos survive rendering; no hosted animation runtime is required.
    expect(html).toContain('referenceMotionRuntime');
    expect(html.match(/<video\b/g)).toHaveLength(2);
    expect(html).toContain('video-section');
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(html).not.toContain('transform: none !important');

    // Hero structure
    expect(html).toContain('class="rt-hero"');
    expect(html).toContain('class="rt-hero-gradient-v1"');
    expect(html).toContain('Prana Light Yoga');
    expect(html).toContain('Morning stillness');

    // Navigation and footer
    expect(html).toContain('rt-navbar');
    expect(html).toContain('rt-footer');
    expect(html).toContain('Private preview · Inquiry sending is disabled');
  });

  it('renders catalog (classes) page with dynamic class cards and filter tabs', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
      company: {
        ...defaultDraft().company,
        name: 'Prana Light Yoga',
      },
    });

    const html = renderSite(draft, {
      projectId: 'auravell-demo',
      lang: 'en',
      page: 'catalog',
      assetUrl: (id) => id,
      inquiryUrl: '/inquiry',
    });

    expect(html).toContain('w-tab-link');
    expect(html).toContain('w-tab-pane');
    expect(html).toContain('Beginner');
    expect(html).toContain('Advanced');
  });

  it('renders about page with philosophy and sanctuary details', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
      company: {
        ...defaultDraft().company,
        name: 'Aura Studio',
        aboutStory: 'Founded in 2020 as a tranquil space for mindful movement.',
      },
    });

    const html = renderSite(draft, {
      projectId: 'auravell-demo',
      lang: 'en',
      page: 'about',
      assetUrl: (id) => id,
      inquiryUrl: '/inquiry',
    });

    expect(html).toContain('data-wr-material-image="about-hero"');
    expect(html).toContain('Founded in 2020 as a tranquil space for mindful movement.');
    expect(html).toContain('rt-faq-item');
  });

  it('renders plans page with membership tiers and passes', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
    });

    const html = renderSite(draft, {
      projectId: 'auravell-demo',
      lang: 'en',
      page: 'plans',
      assetUrl: (id) => id,
      inquiryUrl: '/inquiry',
    });

    expect(html).toContain('w-tabs');
    expect(html).toContain('rt-pricingtable-grid-v1');
    expect(html).toContain('Essential');
    expect(html).toContain('Balance');
    expect(html).toContain('Harmony');
  });

  it('renders contact page with studio details and inquiry booking form', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
      company: {
        ...defaultDraft().company,
        name: 'Lotus Grove',
        address: '77 Peace Way, Sedona, AZ',
        phone: '(555) 789 0123',
        email: 'contact@lotusgrove.org',
      },
    });

    const html = renderSite(draft, {
      projectId: 'auravell-demo',
      lang: 'en',
      page: 'contact',
      assetUrl: (id) => id,
      inquiryUrl: '/inquiry',
    });

    expect(html).toContain('77 Peace Way, Sedona, AZ');
    expect(html).toContain('(555) 789 0123');
    expect(html).toContain('contact@lotusgrove.org');
    expect(html).toContain('data-auravell-form');
    expect(html).toContain('Reserve a Session');
  });

  it('renders detail page for a specific class with product attributes and inquiry booking', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
      products: [
        {
          id: 'vinyasa-soul',
          name: 'Vinyasa Soul Flow',
          description: 'Harmonize dynamic breath with graceful movement.',
          tagline: 'Energizing full-body sequence to awaken inner vitality.',
          imageAssetId: '/templates/auravell/images/6a7d651d8837b11f7ba4e656_yoga-site-image-three.webp',
          material: 'Level 1-2 · 60 mins',
          dimensions: 'Mon/Wed 07:00 AM',
          sellingPoints: ['Continuous fluid transitions', 'Pranayama breath focus', 'Herbal hydration after class'],
        },
      ],
    });

    const html = renderSite(draft, {
      projectId: 'auravell-demo',
      lang: 'en',
      page: 'detail',
      productId: 'vinyasa-soul',
      assetUrl: (id) => id,
      inquiryUrl: '/inquiry',
    });

    expect(html).toContain('Vinyasa Soul Flow');
    expect(html).toContain('data-wr-material-image="product-main"');
    expect(html).toContain('data-wr-material-product="vinyasa-soul"');
    expect(html).toContain('Level 1-2 · 60 mins');
    expect(html).toContain('Continuous fluid transitions');
    expect(html).toContain('Reserve a Session');
    expect(html).toContain('Back to all classes');
  });

  it('applies custom brandColor dynamically to styles and buttons', () => {
    const draft = validateDraft({
      ...defaultDraft(),
      template: 'auravell',
      brandColor: '#2b580c',
    });

    const html = renderSite(draft, {
      projectId: 'auravell-demo',
      lang: 'en',
      page: 'home',
      assetUrl: (id) => id,
      inquiryUrl: '/inquiry',
    });

    expect(html).toContain('--_colors---accent-color--accent-100:#2b580c');
    expect(html).not.toContain('background-color: #2b580c !important');
  });
});


it('publishes every Auravell navigation route and binds the supplied hero asset', () => {
  const draft = {...defaultDraft(), template: 'auravell' as const};
  const options = {projectId:'customer-auravell',lang:'en' as const,page:'home',assetUrl:(id:string)=>'/media/'+id,inquiryUrl:'/inquiry',publicBaseUrl:'https://builder.example'};
  const files = renderSiteFiles(draft,options);
  expect(files['en/extra-plans/index.html']).toContain('Find the right plan');
  expect(files['en/index.html']).toContain('href="extra-plans/index.html"');
  expect(files['en/catalog/index.html']).not.toContain('data-wr-product-card');
  expect(files['en/contact/index.html']).not.toContain('info@auravell.com');
});
