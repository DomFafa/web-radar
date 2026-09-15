import { afterEach, expect, it, vi } from 'vitest';
import { defaultDraft } from '../src/worker/domain';
import { testProduct } from '../src/worker/product-radar';
import { generatePageDesign } from '../src/worker/providers/image';
import { encodeRepeatedDesignContext } from '../src/worker/providers/page-design-context';
import { testBrief } from './fixtures/site-brief';

afterEach(() => vi.unstubAllGlobals());

it('keeps inner page identity explicit when the homepage is a style reference', async () => {
  const draft = fixture();
  draft.products.forEach((product) => { product.source!.conditions = {}; });
  const calls = mockProviders();
  await generatePageDesign(env, draft, 'about', '', [photo, photo, photo]);
  expect(calls.imagePrompts[0]).toContain('Current page ABOUT: supplied company story and contact');
  expect(calls.imagePrompts[0]).toContain('homepage reference supplies shared style only');
  expect(calls.imagePrompts[0]).toContain('standalone photographic background asset');
  expect(calls.imagePrompts[0].length).toBeLessThanOrEqual(24_000);
});
const env = {
  IMAGE_API_KEY: 'image-key',
  IMAGE_API_BASE_URL: 'https://images.example/v1',
  TEXT_API_KEY: 'text-key',
  TEXT_API_BASE_URL: 'https://text.example/v1',
  TEXT_MODEL: 'text-model',
};
const photo = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' });
function fixture() {
  const draft = defaultDraft();
  draft.company.name = 'Approved Brand';
  draft.products = [0, 1].map((i) => ({
    id: `product-${i}`,
    name: `Approved product ${i}`,
    description: `Detail description ${i}.`,
    material: 'Oak',
    dimensions: '20 cm',
    imageAssetId: `photo-${i}`,
    source: {
      ...testProduct(),
      conditions: {
        imagePrompt:
          `Original product ${i} geometry and branding. ` +
          Array.from({ length: 1200 }, (_, j) => `Historical composition detail ${i}-${j}.`).join(
            ' ',
          ),
        acceptedInstructions: [`Keep packaging ${i}`, 'No added accessories'],
      },
    },
  }));
  draft.primaryProductId = draft.products[1].id;
  const brief = testBrief(draft);
  brief.pages[0].content.en = {
    title: 'Approved home',
    sections: [{ heading: 'Exact heading', body: 'Exact visible homepage content.' }],
  };
  draft.consultation = { revision: 1, answers: [], confirmed: true, brief };
  return draft;
}
function mockProviders(
  review = { complete: true, missing: [] as string[], contradictions: [] as string[] },
  invalidIds = false,
  overrides: {
    groups?: (
      groups: { id: string; summary: string }[],
      budget: number,
    ) => { id: string; summary: string }[];
    response?: (call: number, output: unknown) => Response;
  } = {},
) {
  let textCalls = 0;
  const imagePrompts: string[] = [];
  const preparations: unknown[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      if (url === 'https://images.example/v1/images/edits') {
        imagePrompts.push(String((init.body as FormData).get('prompt')));
        return Response.json({ data: [{ b64_json: 'iVBORw0KGgoAAAAAAAAAAAAA' }] });
      }
      expect(url).toBe('https://text.example/v1/chat/completions');
      textCalls++;
      const request = JSON.parse(init.body as string);
      if (request.response_format?.type === 'json_object')
        expect(
          request.messages.map((message: { content: string }) => message.content).join('\n'),
        ).toMatch(/json/i);
      const input = JSON.parse(request.messages[1].content);
      preparations.push(input);
      const groups =
        textCalls % 2 === 1
          ? input.sourceGroups.map((group: { id: string; value: unknown }, index: number) => ({
              id: invalidIds && index === 0 ? 'unknown' : group.id,
              summary: JSON.stringify(group.value).includes('Historical composition')
                ? 'Preserve original product geometry and branding.'
                : JSON.stringify(group.value),
            }))
          : [];
      const output =
        textCalls % 2 === 1
          ? { groups: overrides.groups?.(groups, input.maxSerializedCharacters) ?? groups }
          : review;
      if (overrides.response) return overrides.response(textCalls, output);
      return Response.json({
        choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(output) } }],
      });
    }),
  );
  return { imagePrompts, preparations, calls: () => textCalls };
}

it('automatically prepares oversized source history while preserving exact text, revision and product associations', async () => {
  const draft = fixture(),
    before = structuredClone(draft),
    mock = mockProviders();
  const revision = '保留包装与产品形状。'.repeat(400).slice(0, 4000);
  await generatePageDesign(env, draft, 'home', revision, [photo, photo]);
  expect(mock.calls()).toBe(2);
  expect(mock.imagePrompts).toHaveLength(1);
  const prompt = mock.imagePrompts[0];
  expect(prompt.length).toBeLessThanOrEqual(28000);
  for (const exact of [
    'Approved Brand',
    'Approved product 0',
    'Approved product 1',
    'Exact visible homepage content.',
    'Our studio',
    'Keep packaging 0',
    'Keep packaging 1',
    'No added accessories',
    revision,
  ])
    expect(prompt).toContain(exact);
  expect(prompt).toContain('Reference 1: original primary product image for product-1');
  expect(
    JSON.parse(prompt.split('\nExact en text: ')[1].split('\nCustomer design revision: ')[0])
      .products[0],
  ).not.toHaveProperty('description');
  expect(prompt).toContain('Detail description 0.');
  expect(JSON.stringify(mock.preparations)).toContain('Historical composition detail 0-');
  expect(draft).toEqual(before);
});

it.each([
  {
    review: { complete: false, missing: ['Keep packaging 0'], contradictions: [] },
    invalidIds: false,
  },
  { review: { complete: true, missing: [], contradictions: [] }, invalidIds: true },
])(
  'does not spend an image request when prepared conditions are incomplete or reassigned ($invalidIds)',
  async ({ review, invalidIds }) => {
    const mock = mockProviders(review, invalidIds);
    await expect(
      generatePageDesign(env, fixture(), 'home', '', [photo, photo]),
    ).rejects.toMatchObject({ code: 'image_design_context_invalid' });
    expect(mock.imagePrompts).toEqual([]);
  },
);

it('rejects impossible exact visible copy before either text preparation or image submission', async () => {
  const draft = fixture(),
    fetch = vi.fn();
  draft.consultation!.brief!.copy.en!.about = 'Exact text " \\ '.repeat(3000);
  vi.stubGlobal('fetch', fetch);
  await expect(generatePageDesign(env, draft, 'home', '', [photo, photo])).rejects.toMatchObject({
    code: 'image_design_copy_too_long',
  });
  expect(fetch).not.toHaveBeenCalled();
});

it('sends fitting raw context directly without requiring or calling the text service', async () => {
  const draft = fixture(),
    mock = mockProviders();
  for (const product of draft.products)
    product.source!.conditions.imagePrompt = 'Preserve the supplied product.';
  const expected = structuredClone(draft);
  await generatePageDesign(
    { IMAGE_API_KEY: env.IMAGE_API_KEY, IMAGE_API_BASE_URL: env.IMAGE_API_BASE_URL },
    draft,
    'home',
    '',
    [photo, photo],
  );
  expect(mock.calls()).toBe(0);
  expect(mock.imagePrompts).toHaveLength(1);
  expect(mock.imagePrompts[0]).toContain('Preserve the supplied product.');
  expect(mock.imagePrompts[0]).toContain('Keep packaging 0');
  expect(mock.imagePrompts[0].length + 4000).toBeLessThanOrEqual(28000);
  expect(draft).toEqual(expected);
});

it.each(['missing', 'duplicate', 'unknown'] as const)(
  'rejects %s prepared group IDs before verification or image submission',
  async (kind) => {
    const mock = mockProviders(undefined, false, {
      groups: (groups) =>
        kind === 'missing'
          ? groups.slice(1)
          : groups.map((group, index) =>
              index === 0
                ? { ...group, id: kind === 'duplicate' ? groups[1].id : 'unknown-group' }
                : group,
            ),
    });
    await expect(
      generatePageDesign(env, fixture(), 'home', '', [photo, photo]),
    ).rejects.toMatchObject({ code: 'image_design_context_invalid' });
    expect(mock.calls()).toBe(1);
    expect(mock.imagePrompts).toEqual([]);
  },
);

it.each(['plain', 'JSON-escaped'] as const)(
  'rejects a %s summary exceeding its serialized budget before verification',
  async (kind) => {
    const mock = mockProviders(undefined, false, {
      groups: (groups, budget) =>
        groups.map((group, index) =>
          index === 0
            ? {
                ...group,
                summary: kind === 'plain' ? 'x'.repeat(budget + 1) : '"'.repeat(budget),
              }
            : group,
        ),
    });
    await expect(
      generatePageDesign(env, fixture(), 'home', '', [photo, photo]),
    ).rejects.toMatchObject({ code: 'image_design_context_invalid' });
    expect(mock.calls()).toBe(1);
    expect(mock.imagePrompts).toEqual([]);
  },
);

it.each([
  {
    name: 'reversed negation',
    summary: 'The product is certified food-safe.',
    contradiction: 'An unsupported certification replaces a prohibition.',
  },
  {
    name: 'wrong product association',
    summary: 'Keep packaging 1',
    contradiction: 'Packaging 1 was assigned to product 0.',
  },
])('does not submit an image when the audit reports $name', async ({ summary, contradiction }) => {
  const draft = fixture();
  draft.products[0].source!.conditions.acceptedInstructions = [
    'Keep packaging 0',
    'No added accessories',
    'Do not claim food-safe certification.',
  ];
  draft.products[0].source!.conditions.imagePrompt +=
    'Keep packaging 0. Do not claim food-safe certification.';
  const mock = mockProviders(
    { complete: true, missing: [], contradictions: [contradiction] },
    false,
    {
      groups: (groups) =>
        groups.map((group) => (group.id === 'condition-0' ? { ...group, summary } : group)),
    },
  );
  await expect(generatePageDesign(env, draft, 'home', '', [photo, photo])).rejects.toMatchObject({
    code: 'image_design_context_invalid',
  });
  expect(mock.calls()).toBe(2);
  const audit = mock.preparations[1] as { sourceGroups: unknown[]; preparedGroups: unknown[] };
  expect(JSON.stringify(audit.sourceGroups)).toContain('Do not claim food-safe certification.');
  expect(JSON.stringify(audit.sourceGroups)).toContain('product-0');
  expect(JSON.stringify(audit.preparedGroups)).toContain(summary);
  expect(mock.imagePrompts).toEqual([]);
});

it.each([1, 2])(
  'rejects a truncated text response at stage %i without submitting an image',
  async (stage) => {
    const mock = mockProviders(undefined, false, {
      response: (call, output) =>
        Response.json({
          choices: [
            {
              finish_reason: call === stage ? 'length' : 'stop',
              message: { content: JSON.stringify(output) },
            },
          ],
        }),
    });
    await expect(
      generatePageDesign(env, fixture(), 'home', '', [photo, photo]),
    ).rejects.toMatchObject({ code: 'image_design_context_invalid' });
    expect(mock.calls()).toBe(stage);
    expect(mock.imagePrompts).toEqual([]);
  },
);

it.each(['invalid JSON', 'missing field', 'HTTP error', 'network error'] as const)(
  'does not fall back to an unverified summary after an audit %s',
  async (failure) => {
    const mock = mockProviders(undefined, false, {
      response: (call, output) => {
        if (call === 2 && failure === 'HTTP error') return new Response(null, { status: 503 });
        if (call === 2 && failure === 'network error')
          throw new Error('Simulated connection failure');
        return Response.json({
          choices: [
            {
              finish_reason: 'stop',
              message: {
                content:
                  call === 2 && failure === 'invalid JSON'
                    ? '{'
                    : JSON.stringify(
                        call === 2 && failure === 'missing field'
                          ? { complete: true, missing: [] }
                          : output,
                      ),
              },
            },
          ],
        });
      },
    });
    await expect(generatePageDesign(env, fixture(), 'home', '', [photo, photo])).rejects.toThrow();
    expect(mock.calls()).toBe(2);
    expect(mock.imagePrompts).toEqual([]);
  },
);

it('budgets JSON escaping and emoji while retaining all 4000 revision characters verbatim', async () => {
  const draft = fixture(),
    mock = mockProviders();
  const exact = 'Approved "quoted" copy \\ with emoji 😀 and a newline\nkept intact.';
  draft.consultation!.brief!.copy.en!.subtitle = exact;
  draft.consultation!.brief!.pages[0].content.en!.sections[0].body = exact;
  const revision = '😀"\\'.repeat(1000);
  expect(revision.length).toBe(4000);
  const before = structuredClone(draft);
  await generatePageDesign(env, draft, 'home', revision, [photo, photo]);
  expect(mock.calls()).toBe(2);
  expect(mock.imagePrompts).toHaveLength(1);
  const prompt = mock.imagePrompts[0];
  const text = JSON.parse(
    prompt.split('\nExact en text: ')[1].split('\nCustomer design revision: ')[0],
  );
  expect(text.siteCopy.subtitle).toBe(exact);
  expect(text.page.sections[0].body).toBe(exact);
  expect(prompt.endsWith('\nCustomer design revision: ' + revision)).toBe(true);
  expect(prompt.length).toBeLessThanOrEqual(28000);
  expect(draft).toEqual(before);
});

it('uses the primary product full description on detail while retaining every ordered ID and card name', async () => {
  const draft = fixture(),
    mock = mockProviders();
  const translations = draft.consultation!.brief!.productTranslations;
  translations['product-0'].en!.name = 'Approved translated card zero';
  translations['product-1'].en!.name = 'Approved translated card one';
  translations['product-1'].en!.description = 'Exact primary translated full description.';
  const before = structuredClone(draft);
  await generatePageDesign(env, draft, 'detail', '', [photo, photo, photo]);
  expect(mock.imagePrompts).toHaveLength(1);
  const prompt = mock.imagePrompts[0];
  const text = JSON.parse(
    prompt.split('\nExact en text: ')[1].split('\nCustomer design revision: ')[0],
  );
  expect(text.products.map((product: { id: string }) => product.id)).toEqual([
    'product-0',
    'product-1',
  ]);
  expect(text.products.map((product: { name: string }) => product.name)).toEqual([
    'Approved translated card zero',
    'Approved translated card one',
  ]);
  expect(text.products[0]).not.toHaveProperty('description');
  expect(text.products[1].description).toBe('Exact primary translated full description.');
  expect(text.products[1].material).toBe(draft.products[1].material);
  expect(text.products[1].dimensions).toBe(draft.products[1].dimensions);
  expect(
    JSON.parse(prompt.split('\nExact en text: ')[1].split('\nCustomer design revision: ')[0])
      .products[0],
  ).not.toHaveProperty('description');
  expect(prompt).toContain('Detail description 0.');
  expect(prompt).toContain('Reference 2: original primary product image for product-1');
  expect(draft).toEqual(before);
});

it('preserves short conditions and uploaded product facts verbatim while preparing only large history', async () => {
  const draft = fixture(),
    mock = mockProviders();
  delete draft.products[0].source;
  draft.products[0].description = 'Toddler bottle with time markers and no straw.';
  draft.products[0].material = 'Stainless steel, no unverified safety claims.';
  draft.products[1].source!.conditions.references = [];
  await generatePageDesign(env, draft, 'home', '', [photo, photo]);
  const prompt = mock.imagePrompts[0];
  expect(prompt).toContain(draft.products[0].description);
  expect(prompt).toContain(draft.products[0].material);
  const prepared = mock.preparations[0] as { sourceGroups: { key: string; value: unknown }[] };
  expect(prepared.sourceGroups.every((group) => group.key === 'imagePrompt')).toBe(true);
  const facts = JSON.parse(prompt.split('\nFacts: ')[1].split('\nBrief: ')[0]);
  expect(facts.productConditions.find((entry: unknown[]) => entry[1] === 'references')[2]).toEqual(
    [],
  );
  const exact = JSON.parse(
    prompt.split('\nExact en text: ')[1].split('\nCustomer design revision: ')[0],
  );
  expect(exact.products[0]).not.toHaveProperty('material');
});

it('automatically corrects concrete audit findings once and re-audits before spending one image request', async () => {
  const mock = mockProviders(undefined, false, {
    response: (call, output) =>
      Response.json({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content: JSON.stringify(
                call === 2
                  ? { complete: false, missing: ['Preserve the time markers.'], contradictions: [] }
                  : output,
              ),
            },
          },
        ],
      }),
  });
  await generatePageDesign(env, fixture(), 'home', '', [photo, photo]);
  expect(mock.calls()).toBe(4);
  expect(JSON.stringify(mock.preparations[2])).toContain('Preserve the time markers.');
  expect(mock.imagePrompts).toHaveLength(1);
});

it('stops after one failed correction without submitting an image', async () => {
  const mock = mockProviders({
    complete: false,
    missing: ['A unique product constraint is absent.'],
    contradictions: [],
  });
  await expect(
    generatePageDesign(env, fixture(), 'home', '', [photo, photo]),
  ).rejects.toMatchObject({ code: 'image_design_context_invalid' });
  expect(mock.calls()).toBe(4);
  expect(mock.imagePrompts).toEqual([]);
});

it('losslessly encodes repeated requirements without changing whitespace, nested JSON strings or reserved object keys', () => {
  const sentence = 'Keep the exact stainless-steel geometry and do not add any accessories. ';
  const source = [
    {
      id: 'a',
      key: 'facts',
      products: ['original-id'],
      value: {
        textParts: ['original object, not encoding'],
        text: sentence.repeat(40),
        nested: JSON.stringify({ prompt: sentence.repeat(20) }),
        empty: [],
        spaces: '  "quoted" \\ 😀\n',
      },
    },
    { id: 'b', key: 'conditions', products: ['second-id'], value: sentence.repeat(50) },
  ];
  const result = encodeRepeatedDesignContext(source);
  const decode = (value: any): any => {
    if (Array.isArray(value)) return value.map(decode);
    if (value && typeof value === 'object') {
      if (Object.keys(value).join() === result.marker)
        return value[result.marker]
          .map((part: string | number) =>
            typeof part === 'number' ? result.fragments[part] : part,
          )
          .join('');
      return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, decode(value)]));
    }
    return value;
  };
  for (const group of source) expect(decode(result.values.get(group.id))).toEqual(group.value);
  expect(result.marker).not.toBe('textParts');
});

it('uses lossless repeated text compression before any text model request', async () => {
  const draft = fixture(),
    mock = mockProviders();
  for (const product of draft.products)
    product.source!.conditions.imagePrompt =
      'Keep the exact original geometry and do not add any accessories.\n'.repeat(500);
  await generatePageDesign(env, draft, 'home', '', [photo, photo]);
  expect(mock.calls()).toBe(0);
  expect(mock.imagePrompts).toHaveLength(1);
  expect(mock.imagePrompts[0].length + 4000).toBeLessThanOrEqual(28000);
  expect(mock.imagePrompts[0]).toContain('Shared text fragments:');
});

it('treats long non-visible company history as context, preserving approved footer and contacts', async () => {
  const draft = fixture(),
    mock = mockProviders();
  draft.company.description = 'Historical composition detail. '.repeat(1000);
  draft.company.email = 'sales@example.com';
  await generatePageDesign(env, draft, 'home', '', [photo, photo]);
  expect(mock.imagePrompts).toHaveLength(1);
  expect(mock.imagePrompts[0]).toContain('sales@example.com');
  expect(mock.imagePrompts[0]).toContain('Our studio');
  expect(mock.imagePrompts[0].length + 4000).toBeLessThanOrEqual(28000);
});
