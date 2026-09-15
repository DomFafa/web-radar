import { afterEach, expect, it, vi } from 'vitest';
import { siteBuild } from '../src/worker/providers/site-builder';
import { generatePageDesign } from '../src/worker/providers/image';
import { defaultDraft } from '../src/worker/domain';
import { requestJson } from '../src/worker/providers/http';
import type { Language, SiteBrief } from '../src/shared/model';
import { testProduct } from '../src/worker/product-radar';
import { testBrief } from './fixtures/site-brief';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.each([
  { languages: ['en'] as Language[], logo: false },
  { languages: ['de', 'en'] as Language[], logo: true },
])(
  'page design promises supported controls and separates photographic assets from live UI ($languages)',
  async ({ languages, logo }) => {
    let prompt = '';
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      prompt = String((init.body as FormData).get('prompt'));
      return Response.json({ data: [{ b64_json: 'iVBORw0KGgoAAAAAAAAAAAAA' }] });
    });
    const draft = defaultDraft();
    draft.languages = languages;
    draft.products = [
      {
        id: 'first',
        name: 'Oak Tray',
        description: 'A supplied oak tray.',
        material: 'Oak',
        dimensions: '20 cm',
        imageAssetId: 'photo',
      },
    ];
    draft.primaryProductId = 'first';
    if (logo) draft.company.logoAssetId = 'logo';
    draft.consultation = { revision: 1, answers: [], confirmed: true, brief: testBrief(draft) };
    const image = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], {
      type: 'image/png',
    });
    await generatePageDesign(
      { IMAGE_API_KEY: 'key', IMAGE_API_BASE_URL: 'https://images.example/v1' },
      draft,
      'catalog',
      'Keep the approved colors',
      [image, image, ...(logo ? [image] : [])],
    );
    expect(prompt).toMatch(/no search, filters?/i);
    expect(prompt).toMatch(/no (?:invented |extra )?(?:angles|multi-angle)/i);
    expect(prompt).toMatch(/(?:one|single) original (?:photo|image) per product/i);
    expect(prompt).toMatch(/compact cards?.*(?:name.*detail link|detail link.*name)/i);
    expect(prompt).toMatch(/full description.*detail/i);
    expect(prompt).toMatch(/catalog.*every (?:supplied |approved )?product/i);
    expect(prompt).toMatch(/group(?:ing|s)?.*(?:supplied|approved) facts/i);
    expect(prompt).toMatch(/name, email, company, message, productId/);
    expect(prompt).toMatch(/name, email, message required/);
    expect(prompt).toMatch(/no target.market, quantity, phone, attachments/i);
    expect(prompt).toMatch(/requirements.*message/i);
    expect(prompt).toMatch(/two.column.*allowed/i);
    expect(prompt).toMatch(/photographic.*(?:separate|free).*(?:headings|text).*buttons.*nav/i);
    expect(prompt).toMatch(/no invented brand symbols/i);
    expect(prompt).toContain('Keep the approved colors');
    if (logo) {
      expect(prompt).toMatch(/use (?:the )?supplied logo/i);
      expect(prompt).toContain('Startseite');
      expect(prompt).toContain('Unser Unternehmen');
      expect(prompt).toMatch(/language links only.*DE.*EN/i);
    } else {
      expect(prompt).toMatch(/company.name wordmark/i);
      expect(prompt).toContain('Our company');
      expect(prompt).toMatch(/no language switcher/i);
    }
  },
);
it('allows long image requests to finish after the default request deadline', async () => {
  vi.useFakeTimers();
  vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  });
  vi.stubGlobal(
    'fetch',
    (_url: string, init: RequestInit) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve(Response.json({ complete: true })), 60_000);
        init.signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('aborted'));
        });
      }),
  );
  const request = requestJson(
    'https://image.example/edits',
    {},
    { provider: 'image', timeoutMs: 180_000 },
  );
  const settled = request.then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  await vi.advanceTimersByTimeAsync(60_001);
  expect(await settled).toEqual({ value: { complete: true } });
});
it('requires configured authenticated service and refuses plaintext production requests', async () => {
  await expect(siteBuild({}, 'job')).rejects.toMatchObject({ code: 'site_builder_unconfigured' });
  await expect(
    siteBuild(
      {
        SITE_BUILDER_URL: 'http://127.0.0.1:7002',
        SITE_BUILDER_KEY: 'key',
        ENVIRONMENT: 'production',
      },
      'job',
    ),
  ).rejects.toMatchObject({ code: 'site_builder_url' });
});
it('uses the same id for an authenticated POST and status GET without exposing the key in payload', async () => {
  const calls: { url: string; method: string; body: unknown; headers: Headers }[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({
      url,
      method: init.method!,
      body: init.body ? JSON.parse(String(init.body)) : undefined,
      headers: new Headers(init.headers),
    });
    return Response.json({ state: 'pending', progress: 'Building home' });
  });
  const env = { SITE_BUILDER_URL: 'https://builder.example', SITE_BUILDER_KEY: 'private-key' };
  const input = {
    draft: defaultDraft(),
    designImages: {
      home: 'data:image/png;base64,x',
      catalog: '',
      detail: '',
      about: '',
      contact: '',
    },
  };
  await siteBuild(env, 'stable-job', input);
  await siteBuild(env, 'stable-job');
  expect(calls[0].url).toBe('https://builder.example/v1/builds');
  expect(calls[0].body).toEqual({ id: 'stable-job', ...input });
  expect(calls[1].url).toBe('https://builder.example/v1/builds/stable-job');
  expect(calls[1].method).toBe('GET');
  expect(calls.every((call) => call.headers.get('Authorization') === 'Bearer private-key')).toBe(
    true,
  );
  expect(JSON.stringify(calls.map((call) => call.body))).not.toContain('private-key');
});
it('page design requests carry readable content and approved-home reference instead of storyboard instructions', async () => {
  let form: FormData;
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    if (url.startsWith('https://media.example'))
      return new Response(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
        headers: { 'Content-Type': 'image/png' },
      });
    form = init.body as FormData;
    return Response.json({
      data: [
        {
          b64_json:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvacAAAAASUVORK5CYII=',
        },
      ],
    });
  });
  const draft = defaultDraft();
  draft.company.name = 'True Studio';
  draft.products = [
    {
      id: 'p1',
      name: 'Primary',
      description: 'Primary description',
      material: 'Oak',
      dimensions: '40 cm',
      imageAssetId: 'a1',
    },
    {
      id: 'p2',
      name: 'Second',
      description: 'Second description',
      material: 'Oak',
      dimensions: '30 cm',
      imageAssetId: 'a2',
    },
  ];
  draft.primaryProductId = 'p1';
  draft.company.logoAssetId = 'logo';
  const pages: SiteBrief['pages'] = ['home', 'catalog', 'detail', 'about', 'contact'].map((id) => ({
    id: id as SiteBrief['pages'][number]['id'],
    label: id,
    purpose: `${id} purpose`,
    content: {
      en: {
        title: id === 'catalog' ? 'Exact catalog title' : `${id} title`,
        sections: [{ heading: 'Exact heading', body: 'Exact approved body.' }],
      },
    },
  }));
  draft.consultation = {
    revision: 1,
    answers: [],
    confirmed: true,
    brief: {
      summary: 'Approved summary',
      audience: 'Approved audience',
      goal: 'Approved goal',
      visualDirection: 'Approved visual direction',
      layout: 'Approved layout',
      brandColor: '#416851',
      keep: ['Keep original product geometry'],
      avoid: ['Avoid invented claims'],
      pages,
      copy: {
        en: {
          headline: 'Exact headline',
          subtitle: 'Exact subtitle',
          about: 'Exact about',
          cta: 'Exact CTA',
        },
      },
      productTranslations: {
        p1: { en: { name: 'Primary', description: 'Primary description' } },
        p2: { en: { name: 'Second', description: 'Second description' } },
      },
    },
  };
  await generatePageDesign(
    {
      IMAGE_API_KEY: 'key',
      IMAGE_API_BASE_URL: 'https://images.example/v1',
      PROVIDER_MEDIA_ORIGINS: 'https://media.example',
    },
    draft,
    'catalog',
    'Larger product cards',
    [
      'https://media.example/home',
      'https://media.example/product-primary',
      'https://media.example/product-second',
      'https://media.example/logo',
    ],
  );
  expect(form!.get('prompt')).toContain('Reference 1: approved homepage design');
  expect(form!.get('prompt')).toContain('Reference 2: original primary product image');
  expect(form!.get('prompt')).toContain('Reference 3: original product image');
  expect(form!.get('prompt')).toContain('Reference 4: company logo');
  expect(form!.get('prompt')).toContain('True Studio');
  expect(form!.get('prompt')).toContain('Larger product cards');
  expect(form!.get('prompt')).toContain('Exact catalog title');
  expect(form!.get('prompt')).toContain('Exact approved body.');
  expect(form!.get('prompt')).toContain('Keep original product geometry');
  expect(form!.get('prompt')).toContain('not concept art');
  expect(form!.get('prompt')).not.toContain('No text');
  expect(form!.getAll('image[]')).toHaveLength(4);
});

it('labels one shared product and logo reference with both roles', async () => {
  let form: FormData;
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    if (url.startsWith('https://media.example'))
      return new Response(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
        headers: { 'Content-Type': 'image/png' },
      });
    form = init.body as FormData;
    return Response.json({
      data: [
        {
          b64_json:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvacAAAAASUVORK5CYII=',
        },
      ],
    });
  });
  const draft = defaultDraft();
  draft.products = [
    {
      id: 'p1',
      name: 'Primary',
      description: 'Primary description',
      material: 'Oak',
      dimensions: '40 cm',
      imageAssetId: 'shared',
    },
  ];
  draft.primaryProductId = 'p1';
  draft.company.logoAssetId = 'shared';
  await generatePageDesign(
    {
      IMAGE_API_KEY: 'key',
      IMAGE_API_BASE_URL: 'https://images.example/v1',
      PROVIDER_MEDIA_ORIGINS: 'https://media.example',
    },
    draft,
    'home',
    '',
    ['https://media.example/shared'],
  );
  expect(form!.get('prompt')).toContain('Reference 1: original primary product image');
  expect(form!.get('prompt')).toContain('also the company logo');
  expect(form!.getAll('image[]')).toHaveLength(1);
});

it('passes fitting imported conditions through unchanged and includes only the selected page copy', async () => {
  let form: FormData;
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    if (url.startsWith('https://media.example'))
      return new Response(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
        headers: { 'Content-Type': 'image/png' },
      });
    form = init.body as FormData;
    return Response.json({ data: [{ b64_json: 'iVBORw0KGgoAAAAAAAAAAAAA' }] });
  });
  const draft = defaultDraft();
  draft.languages = ['en', 'fr'];
  const sharedCreation = {
    prompt: 'Shared creation brief ' + 'c'.repeat(1000),
    mustInclude: 'Northstar paperboard packaging',
    avoid: 'No invented certification',
  };
  draft.products = Array.from({ length: 8 }, (_, i) => ({
    id: `00000000-0000-4000-8000-00000000000${i}`,
    name: `Product ${i}`,
    description: `Description ${i}`,
    material: 'Oak',
    dimensions: `${i + 1} cm`,
    imageAssetId: `a${i}`,
    source: {
      ...testProduct(),
      id: `p${i}`,
      conditions: {
        imagePrompt: `Original identity ${i} ` + 'x'.repeat(1000),
        acceptedInstructions: [`Keep variant ${i} unchanged`],
        brief: {
          keep: ['Keep single-item packs'],
          constraints: ['Keep original geometry'],
          avoid: ['No extra parts'],
          context: 'b'.repeat(2000),
        },
        creation: sharedCreation,
        source: { reportId: 'report', evidence: 'Historical market report ' + 'r'.repeat(60000) },
      },
    },
  }));
  draft.primaryProductId = draft.products[0].id;
  const brief = testBrief(draft);
  brief.pages[0].content.en = {
    title: 'Approved homepage title',
    sections: [{ heading: 'Exact home heading', body: 'Exact homepage body.' }],
  };
  brief.pages[1].content.en!.sections = [
    { heading: 'Catalog only', body: 'OTHER_PAGE_COPY '.repeat(3000) },
  ];
  brief.pages[0].content.fr!.title = 'OTHER_LANGUAGE_TITLE';
  brief.copy.fr!.headline = 'OTHER_LANGUAGE_HEADLINE';
  brief.productTranslations[draft.primaryProductId].en = {
    name: 'Approved product name',
    description: 'Exact translated product description.',
  };
  draft.consultation = { revision: 1, answers: [], confirmed: true, brief };
  const before = structuredClone(draft);
  await generatePageDesign(
    {
      IMAGE_API_KEY: 'key',
      IMAGE_API_BASE_URL: 'https://images.example/v1',
      PROVIDER_MEDIA_ORIGINS: 'https://media.example',
    },
    draft,
    'home',
    'Preserve the approved spacing' + ' revision'.repeat(120),
    draft.products.map((p) => `https://media.example/${p.id}`),
  );
  const prompt = String(form!.get('prompt'));
  expect(prompt.length).toBeLessThanOrEqual(28000);
  expect(prompt).not.toContain('Historical market report');
  expect(prompt).not.toContain('OTHER_PAGE_COPY');
  expect(prompt).not.toContain('OTHER_LANGUAGE');
  expect(prompt.match(/Shared creation brief/g)).toHaveLength(1);
  const facts = JSON.parse(prompt.split('\nFacts: ')[1].split('\nBrief: ')[0]);
  const exact = JSON.parse(
    prompt.split('\nExact en text: ')[1].split('\nCustomer design revision: ')[0],
  );
  expect(exact.products.map((product: { id: string }) => product.id)).toEqual(
    draft.products.map((product) => product.id),
  );
  const resolvedConditions = facts.productConditions.map(
    ([positions, name, value]: [number[], string, unknown]) => [
      positions.map((position) => {
        expect(
          Number.isInteger(position) && position >= 1 && position <= exact.products.length,
        ).toBe(true);
        return exact.products[position - 1].id;
      }),
      name,
      value,
    ],
  );
  for (const product of draft.products) {
    for (const [name, value] of Object.entries(product.source!.conditions)) {
      if (name === 'source') continue;
      expect(resolvedConditions).toContainEqual([
        expect.arrayContaining([product.id]),
        name,
        value,
      ]);
    }
  }
  for (let i = 0; i < 8; i++) {
    expect(prompt).toContain(`Original identity ${i}`);
    expect(prompt).toContain(`Keep variant ${i} unchanged`);
    expect(prompt).toContain(`"${i + 1} cm"`);
  }
  for (const text of [
    'Northstar paperboard packaging',
    'No invented certification',
    'Keep single-item packs',
    'Keep original geometry',
    'No extra parts',
    'Approved homepage title',
    'Exact homepage body.',
    'Preserve the approved spacing',
  ])
    expect(prompt).toContain(text);
  expect(prompt).not.toContain('Exact translated product description.');
  expect(form!.getAll('image[]')).toHaveLength(8);
  expect(draft).toEqual(before);
});

it('rejects oversized image instructions before downloading references or submitting a generation', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  await expect(
    generatePageDesign(
      { IMAGE_API_KEY: 'key', IMAGE_API_BASE_URL: 'https://images.example/v1' },
      defaultDraft(),
      'home',
      'x'.repeat(32001),
      ['https://media.example/product'],
    ),
  ).rejects.toMatchObject({
    code: 'image_prompt_too_long',
    message: expect.stringContaining('4,000'),
  });
  expect(fetch).not.toHaveBeenCalled();
});

it('uploads supplied private image bytes without fetching the application again', async () => {
  const fetch = vi.fn(async (_url: string, _init: RequestInit) =>
    Response.json({ data: [{ b64_json: 'iVBORw0KGgoAAAAAAAAAAAAA' }] }),
  );
  vi.stubGlobal('fetch', fetch);
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  await generatePageDesign(
    { IMAGE_API_KEY: 'key', IMAGE_API_BASE_URL: 'https://images.example/v1' },
    defaultDraft(),
    'home',
    '',
    [new Blob([bytes], { type: 'image/png' })],
  );
  expect(fetch).toHaveBeenCalledOnce();
  expect(fetch.mock.calls[0][0]).toBe('https://images.example/v1/images/edits');
  const form = (fetch.mock.calls[0][1] as RequestInit).body as FormData;
  expect(new Uint8Array(await (form.get('image[]') as Blob).arrayBuffer())).toEqual(bytes);
});
