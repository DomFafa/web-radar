import { afterEach, describe, expect, it, vi } from 'vitest';
import { guessCloneImageRole, normalizeCloneImages } from '../src/shared/clone';
import { publicAssetReferences, validateDraft } from '../src/worker/domain';
import { generateCloneBundle, buildCloneFiles, renderCloneFiles } from '../src/worker/clone-service';
import { defaultDraft } from '../src/worker/domain';
import { cloneWorkflowSteps, getWorkflowSteps, draftChecklist } from '../src/client/workflow';
import {
  buildClonePrompt,
  generateCloneSite,
  resolveCloneModel,
  syncDraftDataIntoHtml,
} from '../src/worker/clone-service';
import type { CloneConfig, Project } from '../src/shared/model';
import type { AppEnv } from '../src/worker/env';

describe('100% 像素级克隆与还原模式 (Clone Workflow)', () => {
  it('returns clone workflow steps when draft.buildBranch is clone', () => {
    const draft = defaultDraft();
    draft.buildBranch = 'clone';
    const steps = getWorkflowSteps(draft);
    expect(steps).toEqual(cloneWorkflowSteps);
    expect(steps.map((s) => s[0])).toEqual(['basics', 'clone-generate', 'publish']);
  });

  it('correctly tracks checklist readiness for clone mode', () => {
    const draft = defaultDraft();
    draft.buildBranch = 'clone';
    draft.cloneConfig = {
      targetUrl: 'https://squishytoys.store',
      status: 'ready',
      generatedHtml: '<html><body>Hello</body></html>',
    };

    const checklist = draftChecklist(draft);
    expect(checklist.length).toBe(3);
    expect(checklist.every((c) => c.ready)).toBe(true);
    expect(checklist[0].id).toBe('clone-source');
    expect(checklist[1].id).toBe('clone-generate');
    expect(checklist[2].id).toBe('build');
  });

  it('buildClonePrompt includes 4 core anti-distortion rules and vision guidance', () => {
    const config: CloneConfig = {
      targetUrl: 'https://squishytoys.store',
      scrapedData: {
        title: 'Senseng Squishy Toys',
        description: 'Quality squishy toys',
        headings: ['Explore Our Squishy Toy Lines', 'Kids and gift-facing styles'],
        navLinks: [
          { href: '/', text: 'Home' },
          { href: '/products', text: 'Products' },
        ],
      },
      instructions: '保持原站清新天蓝色调与两列/四列卡片网格比例',
      uiImages: [
        { id: '1', assetId: 'ast-1', name: 'index.jpg', role: 'home' },
        { id: '2', assetId: 'ast-2', name: 'catalog.jpg', role: 'catalog' },
      ],
    };

    const prompt = buildClonePrompt('Senseng Toy Store', config, 'Senseng Industrial');

    expect(prompt).toContain('VISUAL SOURCE OF TRUTH');
    expect(prompt).toContain('Artwork images are assets, NOT page layouts');
    expect(prompt).toContain('no Tailwind CDN');
    expect(prompt).toContain('https://squishytoys.store');
    expect(prompt).toContain('Senseng Squishy Toys');
    expect(prompt).toContain('index.jpg');
    expect(prompt).toContain('保持原站清新天蓝色调');
  });

  it('generateCloneSite returns valid mock HTML in test mode when no API key is provided', async () => {
    const draft = defaultDraft();
    draft.buildBranch = 'clone';
    const project: Project = {
      id: 'proj-clone-test',
      ownerId: 'user-1',
      workspaceId: 'ws-1',
      name: 'Clone Test Site',
      version: 1,
      draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      offline: true,
    };

    const env: AppEnv = {
      ENVIRONMENT: 'test',
      TEST_PROVIDERS: 'true',
      CLONE_TEST_FIXTURE: 'true',
    } as unknown as AppEnv;

    const html = await generateCloneSite(env, project, {
      targetUrl: 'https://example.com',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Clone Test Site');
    expect(html).toContain('TEST FIXTURE');
  });

  it('syncDraftDataIntoHtml strictly synchronizes company details, contacts and products into HTML', () => {
    const draft = defaultDraft();
    draft.company = {
      ...draft.company,
      name: 'Global Export Tech Ltd',
      slogan: 'Leading Innovator in Smart Automation',
      email: 'alex@globalexport.com',
      whatsapp: '+86 18822345688',
      phone: '+86 21 88889999',
      facebook: 'https://facebook.com/globalexport',
      instagram: 'https://instagram.com/globalexport',
      linkedin: 'https://linkedin.com/company/globalexport',
      x: 'https://x.com/globalexport',
    };

    const rawHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Old Company - Old Slogan</title>
  <meta name="description" content="Old Description">
</head>
<body>
  <a href="mailto:old@example.com">Email Us</a>
  <a href="https://wa.me/12345678">WhatsApp Chat</a>
  <a href="tel:00000000">Call Us</a>
  <a href="https://facebook.com/oldpage">Facebook</a>
  <a href="https://instagram.com/oldpage">Instagram</a>
</body>
</html>`;

    const synced = syncDraftDataIntoHtml(rawHtml, draft);

    expect(synced).toContain('<title>Global Export Tech Ltd | Leading Innovator in Smart Automation</title>');
    expect(synced).toContain('href="mailto:alex@globalexport.com"');
    expect(synced).toContain('href="https://wa.me/8618822345688"');
    expect(synced).toContain('href="tel:+86 21 88889999"');
    expect(synced).toContain('href="https://facebook.com/globalexport"');
    expect(synced).toContain('href="https://instagram.com/globalexport"');
  });

  it('buildClonePrompt with Draft object injects all company and product fields', () => {
    const draft = defaultDraft();
    draft.company = {
      ...draft.company,
      name: 'Shenzhen Alpha Trading',
      slogan: 'Custom Electronics OEM ODM',
      email: 'sales@alphatrading.cn',
      whatsapp: '8613999999999',
      phone: '0755-12345678',
      address: 'High-Tech Park, Nanshan, Shenzhen',
      establishedYear: '2015',
    };
    draft.products = [
      {
        id: 'prod-1',
        name: 'Wireless Ergonomic Keyboard',
        description: 'Multi-device Bluetooth 5.0 mechanical keyboard',
        material: 'Anodized Aluminum + PBT',
        dimensions: '350 x 130 x 25 mm',
      },
    ];

    const prompt = buildClonePrompt('Alpha Site', {}, draft);

    expect(prompt).toContain('Shenzhen Alpha Trading');
    expect(prompt).toContain('Custom Electronics OEM ODM');
    expect(prompt).toContain('sales@alphatrading.cn');
    expect(prompt).toContain('8613999999999');
    expect(prompt).toContain('High-Tech Park, Nanshan, Shenzhen');
    expect(prompt).toContain('Wireless Ergonomic Keyboard');
    expect(prompt).toContain('Multi-device Bluetooth 5.0 mechanical keyboard');
    expect(prompt).toContain('Anodized Aluminum + PBT');
  });

  it('resolveCloneModel correctly maps gpt-6, gpt-5.6, gpt-5.5 and defaults to gpt-6-astra', () => {
    expect(resolveCloneModel('gpt-6')).toBe('gpt-6-astra');
    expect(resolveCloneModel('gpt-6-astra')).toBe('gpt-6-astra');
    expect(resolveCloneModel('gpt-5.6')).toBe('gpt-5.6-sol');
    expect(resolveCloneModel('gpt-5.6-sol')).toBe('gpt-5.6-sol');
    expect(resolveCloneModel('gpt-5.5')).toBe('gpt-5.5');
    expect(resolveCloneModel('gpt-5.5-pro')).toBe('gpt-5.5-pro');
    expect(resolveCloneModel('gpt-4o')).toBe('gpt-4o');
    expect(resolveCloneModel(undefined)).toBe('gpt-6-astra');
    expect(resolveCloneModel('')).toBe('gpt-6-astra');
  });
});


function projectFixture(): Project {
  const draft = defaultDraft();
  draft.buildBranch = 'clone';
  draft.company.name = 'Senseng';
  draft.products = [{ id: 'p1', name: 'Cat <one>', description: 'Product one', material: '', dimensions: '', imageAssetId: 'photo1' }, { id: 'p2', name: 'Penguin', description: 'Product two', material: '', dimensions: '', imageAssetId: 'photo2' }];
  draft.primaryProductId = 'p1';
  draft.languages = ['en'];
  return { id: 'clone-test', ownerId: 'owner', workspaceId: 'workspace', name: 'Clone', version: 1, draft, createdAt: '', updatedAt: '', offline: true };
}
function modelOutput() {
  const body = '<header><a href="/en/products/index.html" data-wr-page="catalog">Products</a></header><main><h1>Reference layout</h1><img src="__WR_ASSET_photo1__" alt="Cat"></main>';
  return { css: 'body{margin:0;color:#073b91}', pages: { en: {
    home: body, catalog: body, about: body, contact: body,
    detail: '<header>Product details</header><main><h1>{{product.name}}</h1><img src="{{product.image}}" alt="{{product.name}}"><p>{{product.description}}</p></main>',
  } } };
}
afterEach(() => vi.unstubAllGlobals());

describe('design reconstruction integrity', () => {
  it('classifies numbered product photos separately and repairs legacy guesses while preserving manual choices', () => {
    expect(guessCloneImageRole('products-1.jpg')).toBe('asset');
    expect(guessCloneImageRole('product-page.jpg')).toBe('catalog');
    expect(guessCloneImageRole('product-detail.jpg')).toBe('detail');
    const images = [{ id: '1', assetId: '1', name: 'products-1.jpg', role: 'catalog' as const }];
    expect(normalizeCloneImages(images)[0].role).toBe('asset');
    expect(normalizeCloneImages([{ ...images[0], roleSource: 'manual' }])[0].role).toBe('catalog');
  });
  it('never returns demo HTML without a provider or an explicit test fixture switch', async () => {
    await expect(generateCloneBundle({ ENVIRONMENT: 'test', TEST_PROVIDERS: 'true' } as AppEnv, projectFixture(), {})).rejects.toMatchObject({ code: 'clone_provider_missing' });
    await expect(generateCloneBundle({ ENVIRONMENT: 'production', CLONE_TEST_FIXTURE: 'true' } as AppEnv, projectFixture(), {})).rejects.toMatchObject({ code: 'clone_provider_missing' });
  });
  it('sends all 13 images at high detail to the configured provider with the selected model', async () => {
    const project = projectFixture();
    const images = Array.from({ length: 13 }, (_, i) => ({ id: String(i), assetId: `ref-${i}`, name: i === 0 ? 'index.jpg' : `products-${i}.jpg`, role: i === 0 ? 'home' as const : 'asset' as const }));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(modelOutput()) } }] })));
    vi.stubGlobal('fetch', fetchMock);
    const bundle = await generateCloneBundle({ TEXT_API_KEY: 'test-key', TEXT_API_BASE_URL: 'https://provider.example/v1' } as AppEnv, project, { model: 'selected-model', uiImages: images }, async () => 'data:image/jpeg;base64,YWJj');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://provider.example/v1/chat/completions');
    expect(fetchMock.mock.calls[0][1].redirect).toBe('manual');
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.model).toBe('selected-model');
    expect(request.messages[1].content.filter((x: { type: string }) => x.type === 'image_url')).toHaveLength(13);
    expect(bundle.generation).toMatchObject({ mode: 'vision', imageCount: 13, model: 'selected-model', visuallyVerified: false });
    expect(bundle.generatedFiles['en/products/p1/index.html']).toContain('Cat &lt;one&gt;');
    expect(bundle.generatedFiles['en/products/p2/index.html']).toContain('Penguin');
    expect(bundle.generatedFiles['en/products/p2/index.html']).not.toContain('__WR_ASSET_photo1__');
  });
  it('fails on unreadable references before calling the model, and never silently drops images', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    await expect(generateCloneBundle({ OPENAI_API_KEY: 'test-key' } as AppEnv, projectFixture(), { uiImages: [{ id: '1', assetId: 'missing', name: 'index.jpg', role: 'home' }] }, async () => null)).rejects.toMatchObject({ code: 'clone_image_unreadable' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([302, 404, 503])('does not follow redirects or switch endpoints/models after HTTP %s', async status => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('model unavailable', { status })); vi.stubGlobal('fetch', fetchMock);
    await expect(generateCloneBundle({ OPENAI_API_KEY: 'test-key' } as AppEnv, projectFixture(), { uiImages: [{ id: '1', assetId: 'reference', name: 'index.jpg', role: 'home' }] }, async () => 'data:image/png;base64,YWJj')).rejects.toMatchObject({ code: 'clone_provider_error' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('rejects incomplete output instead of publishing a truncated or single-page result', () => {
    expect(() => buildCloneFiles({ css: 'body{}', pages: { en: { home: '<main>Missing pages</main>' } } }, projectFixture().draft)).toThrow();
  });
  it('keeps selected model/provenance and maps media and navigation for anonymous published routes', () => {
    const draft = projectFixture().draft;
    draft.cloneConfig = { model: 'selected-model', uiImages: [{ id: '1', assetId: 'design1', name: 'index.jpg', role: 'home' }, { id: '2', assetId: 'art1', name: 'hero.jpg', role: 'asset' }], generatedFiles: buildCloneFiles(modelOutput(), draft), generation: { mode: 'vision', model: 'selected-model', imageCount: 2, pageCount: 6, visuallyVerified: false } };
    expect(validateDraft(draft).cloneConfig?.model).toBe('selected-model');
    expect(publicAssetReferences(draft)).toContain('art1');
    expect(publicAssetReferences(draft)).not.toContain('design1');
    const files = renderCloneFiles(draft, { projectId: 'clone-test', assetUrl: id => `https://example.com/public/sites/clone-test/assets/${id}`, inquiryUrl: '/api/public/sites/clone-test/inquiries', basePath: '/public/sites/clone-test' });
    expect(files['en/index.html']).toContain('https://example.com/public/sites/clone-test/assets/photo1');
    expect(files['en/index.html']).toContain('href="/public/sites/clone-test/en/products/index.html"');
    expect(files['en/index.html']).not.toContain('/api/projects/');
  });
  it('fixes legacy private image URLs without exposing arbitrary design assets', () => {
    const draft = projectFixture().draft;
    draft.cloneConfig = { generatedHtml: '<html><body><img src="/api/projects/clone-test/assets/photo1"><img src="/api/projects/clone-test/assets/design1"></body></html>' };
    const html = renderCloneFiles(draft, { projectId: 'clone-test', assetUrl: id => `/public/assets/${id}`, inquiryUrl: '/inquiries' })['en/index.html'];
    expect(html).toContain('/public/assets/photo1');
    expect(html).not.toContain('design1');
    expect(html).not.toContain('/api/projects/');
  });
});
