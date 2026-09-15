import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Draft, SiteBrief } from '../src/shared/model';
import { defaultDraft } from '../src/worker/domain';
import { fixtureProviders } from '../src/worker/providers/fixtures';
import { consult } from '../src/worker/providers/consultation';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function consultationDraft(): Draft {
  const draft = defaultDraft();
  draft.company = {
    ...draft.company,
    name: 'Northstar Goods',
    description: 'A trading company presenting two supplied products.',
    logoAssetId: 'logo-asset',
  };
  draft.products = [
    {
      id: 'p-one',
      name: 'Oak Tray',
      description: 'A rectangular oak serving tray.',
      material: 'Oak',
      dimensions: '40 × 25 cm',
      imageAssetId: 'asset-one',
    },
    {
      id: 'p-two',
      name: 'Round Tray',
      description: 'A round oak serving tray.',
      material: 'Oak',
      dimensions: '30 cm diameter',
      imageAssetId: 'asset-two',
    },
  ];
  draft.primaryProductId = 'p-one';
  return draft;
}

function readyBrief(draft: Draft): SiteBrief {
  const pages: SiteBrief['pages'] = [
    ['home', '首页', 'Introduce the supplied company and products.'],
    ['catalog', '产品页', 'Show the supplied product range.'],
    ['detail', '产品详情页', 'Explain supplied product facts.'],
    ['about', '关于页', 'Present the supplied company description.'],
    ['contact', '联系页', 'Invite an inquiry.'],
  ].map(([id, label, purpose]) => ({
    id: id as SiteBrief['pages'][number]['id'],
    label,
    purpose,
    content: {
      en: {
        title: id === 'catalog' ? 'Exact catalog title' : `${draft.company.name} ${label}`,
        sections: [{ heading: 'Exact section heading', body: `Exact ${id} body copy.` }],
      },
    },
  }));
  return {
    summary: 'A factual product showcase using only supplied company and product details.',
    audience: 'Wholesale buyers and distributors.',
    goal: 'Help buyers review products and send an inquiry.',
    visualDirection: 'Warm editorial product photography with restrained typography.',
    layout: 'Clear navigation, product-led hero, catalog grid and concise inquiry blocks.',
    brandColor: '#416851',
    keep: ['Preserve product geometry, materials and visible branding.'],
    avoid: ['Do not add unsupported certifications, facilities or statistics.'],
    pages,
    copy: {
      en: {
        headline: draft.company.name,
        subtitle: 'Supplied products for wholesale review.',
        about: draft.company.description,
        cta: 'Send an inquiry',
      },
    },
    productTranslations: Object.fromEntries(
      draft.products.map((product) => [
        product.id,
        { en: { name: product.name, description: product.description } },
      ]),
    ),
  };
}

describe('consultation provider', () => {
  it('preserves a complete brief when the model omits the extra-page ID prefix', async () => {
    const draft = consultationDraft();
    const brief = readyBrief(draft);
    brief.pages.push({
      id: 'packaging' as never,
      label: '包装展示',
      purpose: 'Show supplied packaging.',
      content: {
        en: {
          title: 'Packaging',
          sections: [{ heading: 'Packaging', body: 'Supplied packaging only.' }],
        },
      },
    });
    vi.stubGlobal('fetch', async () =>
      Response.json({ choices: [{ message: { content: JSON.stringify({ brief }) } }] }),
    );
    const result = await consult(
      { TEXT_API_KEY: 'key', TEXT_API_BASE_URL: 'https://text.example', TEXT_MODEL: 'model' },
      draft,
      ['https://media.example/one', 'https://media.example/two', 'https://media.example/logo'],
      '',
    );
    const expected = structuredClone(brief);
    expected.pages[5].id = 'extra-packaging';
    expect(result).toEqual({ brief: expected });
  });

  it.each(['../packaging', 'extra-', 'home', 'extra-packaging'])(
    'still rejects unsafe or duplicate extra page IDs: %s',
    async (id) => {
      const draft = consultationDraft();
      const brief = readyBrief(draft);
      const extra = { ...structuredClone(brief.pages[0]), id: 'packaging' as never };
      brief.pages.push(extra, { ...structuredClone(extra), id: id as never });
      vi.stubGlobal('fetch', async () =>
        Response.json({ choices: [{ message: { content: JSON.stringify({ brief }) } }] }),
      );
      await expect(
        consult(
          { TEXT_API_KEY: 'key', TEXT_API_BASE_URL: 'https://text.example', TEXT_MODEL: 'model' },
          draft,
          ['https://media.example/one', 'https://media.example/two', 'https://media.example/logo'],
          '',
        ),
      ).rejects.toMatchObject({ code: 'consultation_invalid_response' });
    },
  );

  it('identifies the invalid brief field without displaying the returned content', async () => {
    const draft = consultationDraft();
    const brief = readyBrief(draft);
    brief.pages[1].content.en!.title = '';
    vi.stubGlobal('fetch', async () =>
      Response.json({ choices: [{ message: { content: JSON.stringify({ brief }) } }] }),
    );
    await expect(
      consult(
        { TEXT_API_KEY: 'key', TEXT_API_BASE_URL: 'https://text.example', TEXT_MODEL: 'model' },
        draft,
        ['https://media.example/one', 'https://media.example/two', 'https://media.example/logo'],
        '',
      ),
    ).rejects.toMatchObject({
      code: 'consultation_invalid_response',
      message: expect.stringContaining('pages[1].content.en.title'),
    });
  });

  it('sends each original product and logo URL as a labeled vision reference', async () => {
    const draft = consultationDraft();
    const brief = readyBrief(draft);
    draft.consultation = {
      revision: 2,
      answers: [{ questionId: 'q-1', question: 'Who is this for?', answer: 'Wholesale buyers' }],
      brief,
    };
    let requestBody: any;
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      requestBody = JSON.parse(String(init.body));
      return Response.json({ choices: [{ message: { content: JSON.stringify({ brief }) } }] });
    });

    const result = await consult(
      {
        TEXT_API_KEY: 'text-key',
        TEXT_API_BASE_URL: 'https://text.example/v1',
        TEXT_MODEL: 'vision-text-model',
      },
      draft,
      [
        'https://media.example/original-one',
        'https://media.example/original-two',
        'https://media.example/company-logo',
      ],
      'Prefer a compact catalog.',
    );

    expect(result).toEqual({ brief });
    const content = requestBody.messages[1].content;
    expect(content.filter((part: any) => part.type === 'image_url')).toEqual([
      { type: 'image_url', image_url: { url: 'https://media.example/original-one' } },
      { type: 'image_url', image_url: { url: 'https://media.example/original-two' } },
      { type: 'image_url', image_url: { url: 'https://media.example/company-logo' } },
    ]);
    expect(content.map((part: any) => part.text).filter(Boolean)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Original product image 1'),
        expect.stringContaining('p-one'),
        expect.stringContaining('Original product image 2'),
        expect.stringContaining('p-two'),
        expect.stringContaining('Company logo'),
      ]),
    );
    expect(content[0].text).toContain('currentProposedBrief');
    expect(content[0].text).toContain('Exact catalog title');
    expect(requestBody.messages[0].content).toContain(
      'copy[LANG]: {headline, subtitle, about, cta}',
    );
    expect(requestBody.messages[0].content).toContain(
      'productTranslations[PRODUCT_ID][LANG]: {name, description}',
    );
    expect(requestBody.messages[0].content).toContain(
      'Write customer-facing consultation fields in Simplified Chinese',
    );
    expect(requestBody.messages[0].content).toContain(
      'website copy, page content and productTranslations in every selected website language',
    );
    expect(requestBody.messages[0].content).toContain(
      'For each page, keep section count, order and meaning aligned across selected languages',
    );
    expect(requestBody.messages[0].content).toMatch(/no search, filters?/i);
    expect(requestBody.messages[0].content).toMatch(
      /no (?:invented |extra )?(?:angles|multi-angle)/i,
    );
    expect(requestBody.messages[0].content).toContain('name, email, company, message, productId');
    expect(requestBody.messages[0].content).toContain('name, email, message required');
    expect(requestBody.messages[0].content).toMatch(
      /no target.market, quantity, phone, attachments/i,
    );
    expect(requestBody.messages[0].content).toMatch(/compact cards?.*full descriptions?.*detail/i);
  });

  it('uses one combined role when the logo asset is also a product reference', async () => {
    const draft = consultationDraft();
    draft.company.logoAssetId = 'asset-one';
    const brief = readyBrief(draft);
    let requestBody: any;
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      requestBody = JSON.parse(String(init.body));
      return Response.json({ choices: [{ message: { content: JSON.stringify({ brief }) } }] });
    });

    await consult(
      {
        TEXT_API_KEY: 'text-key',
        TEXT_API_BASE_URL: 'https://text.example/v1',
        TEXT_MODEL: 'vision-text-model',
      },
      draft,
      ['https://media.example/shared-product-logo', 'https://media.example/original-two'],
      '',
    );

    const content = requestBody.messages[1].content;
    expect(content.filter((part: any) => part.type === 'image_url')).toHaveLength(2);
    expect(content[1].text).toContain('Original product image 1');
    expect(content[1].text).toContain('also the company logo');
  });

  it('sends pending revision context when the active brief has been cleared', async () => {
    const draft = consultationDraft();
    const brief = readyBrief(draft);
    draft.consultation = {
      revision: 3,
      answers: [],
      revisionContext: { brief, instructions: '保留页面结构，改成绿色。' },
    };
    let requestBody: any;
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      requestBody = JSON.parse(String(init.body));
      return Response.json({ choices: [{ message: { content: JSON.stringify({ brief }) } }] });
    });

    await consult(
      {
        TEXT_API_KEY: 'text-key',
        TEXT_API_BASE_URL: 'https://text.example/v1',
        TEXT_MODEL: 'vision-text-model',
      },
      draft,
      [
        'https://media.example/original-one',
        'https://media.example/original-two',
        'https://media.example/company-logo',
      ],
      '',
    );

    const context = requestBody.messages[1].content[0].text;
    expect(context).toContain('Exact catalog title');
    expect(context).toContain('保留页面结构，改成绿色。');
  });

  it('rejects a non-strict question and refuses another question after ten answers', async () => {
    const draft = consultationDraft();
    const response = {
      question: {
        prompt: 'Who is this for?',
        reason: 'Sets hierarchy.',
        options: ['A', 'B', 'C', 'D'],
        unsupported: true,
      },
    };
    vi.stubGlobal('fetch', async () =>
      Response.json({ choices: [{ message: { content: JSON.stringify(response) } }] }),
    );
    await expect(
      consult(
        { TEXT_API_KEY: 'key', TEXT_API_BASE_URL: 'https://text.example', TEXT_MODEL: 'model' },
        draft,
        ['https://media.example/one', 'https://media.example/two', 'https://media.example/logo'],
        '',
      ),
    ).rejects.toMatchObject({ code: 'consultation_invalid_response' });

    vi.stubGlobal('fetch', async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                question: {
                  prompt: 'Who is this for?',
                  reason: 'Sets hierarchy.',
                  options: ['A', 'B', 'C'],
                },
              }),
            },
          },
        ],
      }),
    );
    await expect(
      consult(
        { TEXT_API_KEY: 'key', TEXT_API_BASE_URL: 'https://text.example', TEXT_MODEL: 'model' },
        draft,
        ['https://media.example/one', 'https://media.example/two', 'https://media.example/logo'],
        '',
      ),
    ).rejects.toMatchObject({ code: 'consultation_invalid_response' });

    vi.stubGlobal('fetch', async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                question: {
                  prompt: 'Who is this for?',
                  reason: 'Sets hierarchy.',
                  options: ['A', 'B', 'C', '都不是，我要自定义'],
                },
              }),
            },
          },
        ],
      }),
    );
    await expect(
      consult(
        { TEXT_API_KEY: 'key', TEXT_API_BASE_URL: 'https://text.example', TEXT_MODEL: 'model' },
        draft,
        ['https://media.example/one', 'https://media.example/two', 'https://media.example/logo'],
        '',
      ),
    ).rejects.toMatchObject({ code: 'consultation_invalid_response' });

    draft.consultation = {
      revision: 1,
      answers: Array.from({ length: 10 }, (_, index) => ({
        questionId: `q-${index}`,
        question: `Question ${index}`,
        answer: `Answer ${index}`,
      })),
    };
    vi.stubGlobal('fetch', async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                question: { prompt: 'One more?', reason: 'No.', options: ['A', 'B', 'C', 'D'] },
              }),
            },
          },
        ],
      }),
    );
    await expect(
      consult(
        { TEXT_API_KEY: 'key', TEXT_API_BASE_URL: 'https://text.example', TEXT_MODEL: 'model' },
        draft,
        ['https://media.example/one', 'https://media.example/two', 'https://media.example/logo'],
        '',
      ),
    ).rejects.toMatchObject({ code: 'consultation_invalid_response' });
  });

  it('fixture asks one question then returns a complete brief with a justified wholesale page', async () => {
    const draft = consultationDraft();
    draft.languages = ['en', 'de'];
    const providers = fixtureProviders({ APP_ORIGIN: 'http://127.0.0.1:8788' });
    const first = await providers.consult(draft, [], '');
    expect(first).toHaveProperty('question');
    if (!('question' in first)) throw new Error('expected a question');
    expect(first.question.options).toHaveLength(4);
    expect(first.question.options).not.toContain('都不是，我要自定义');

    draft.consultation = {
      revision: 1,
      answers: [
        {
          questionId: 'fixture-audience',
          question: first.question.prompt,
          answer: '批发采购商与分销商',
        },
      ],
    };
    const second = await providers.consult(draft, [], '');
    if (!('brief' in second)) throw new Error('expected a ready brief');
    expect(second.brief.pages.map((page) => page.id)).toContain('extra-wholesale');
    for (const language of draft.languages) {
      expect(second.brief.copy[language]).toBeDefined();
      expect(second.brief.pages.every((page) => page.content[language])).toBe(true);
      expect(
        draft.products.every((product) => second.brief.productTranslations[product.id]?.[language]),
      ).toBe(true);
    }

    draft.consultation.brief = second.brief;
    second.brief.pages.find((page) => page.id === 'extra-wholesale')!.content.en = {
      title: 'Approved wholesale inquiries',
      sections: [{ heading: 'Approved ordering path', body: 'Review products, then inquire.' }],
    };
    second.brief.pages.find((page) => page.id === 'extra-wholesale')!.content.de = {
      title: 'Freigegebene Großhandelsanfragen',
      sections: [
        { heading: 'Freigegebener Bestellweg', body: 'Produkte prüfen und dann anfragen.' },
      ],
    };
    draft.copy = structuredClone(second.brief.copy);
    draft.copy.en!.subtitle = 'Approved English subtitle';
    draft.copy.de!.subtitle = 'Freigegebener deutscher Untertitel';
    draft.products[0].translations = structuredClone(
      second.brief.productTranslations[draft.products[0].id],
    );
    draft.products[0].translations!.en!.name = 'Approved Oak Tray';
    draft.products[0].translations!.de!.name = 'Freigegebenes Eichentablett';
    const build = await providers.siteBuild('fixture-build', {
      draft,
      designImages: {} as never,
    });
    expect(build.files).toHaveProperty('en/extra-wholesale/index.html');
    expect(build.files).toHaveProperty('de/extra-wholesale/index.html');
    expect(build.files!['en/extra-wholesale/index.html']).toContain(
      '<h1>Approved wholesale inquiries</h1>',
    );
    expect(build.files!['en/extra-wholesale/index.html']).toContain('Approved ordering path');
    expect(build.files!['en/extra-wholesale/index.html']).toContain(
      'Review products, then inquire.',
    );
    expect(build.files!['en/extra-wholesale/index.html']).toContain('Approved English subtitle');
    expect(build.files!['en/extra-wholesale/index.html']).toContain('Approved Oak Tray');
    expect(build.files!['de/extra-wholesale/index.html']).toContain(
      '<h1>Freigegebene Großhandelsanfragen</h1>',
    );
    expect(build.files!['de/extra-wholesale/index.html']).toContain(
      'Freigegebener deutscher Untertitel',
    );
    expect(build.files!['de/extra-wholesale/index.html']).toContain('Freigegebenes Eichentablett');
    expect(build.files!['en/index.html']).toContain('>Approved wholesale inquiries</a>');
  });
});
