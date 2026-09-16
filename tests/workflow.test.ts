import { describe, expect, it } from 'vitest';
import { assertPublishable, defaultDraft, publicAssetReferences } from '../src/worker/domain';
import { designKey } from '../src/shared/site-design';
import type { DesignPage, Draft, Project, SiteBrief } from '../src/shared/model';
import {
  draftChecklist,
  getWorkflowSteps,
  nextDraftStep,
  projectStatus,
  workflowSteps,
} from '../src/client/workflow';

const basePageIds: DesignPage[] = ['home', 'catalog', 'detail', 'about', 'contact'];

function briefFor(draft: Draft, extras: DesignPage[] = []): SiteBrief {
  return {
    summary: 'A focused product showcase.',
    audience: 'Retail buyers',
    goal: 'Generate qualified inquiries',
    visualDirection: 'Warm editorial product photography',
    layout: 'Product-led hierarchy with clear inquiry actions',
    brandColor: '#345a43',
    keep: ['Product shape and markings'],
    avoid: ['Unsupported claims'],
    pages: [...basePageIds, ...extras].map((id) => ({
      id,
      label: id.startsWith('extra-') ? '材质指南' : `Page ${id}`,
      purpose: `Purpose for ${id}`,
      content: {
        en: {
          title: `Title for ${id}`,
          sections: id.startsWith('extra-')
            ? [{ heading: 'Materials', body: 'Known material information.' }]
            : [],
        },
      },
    })),
    copy: {
      en: {
        headline: 'Made for everyday',
        subtitle: 'Explore our collection',
        cta: 'View products',
        about: '',
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

function suppliedDraft(): Draft {
  const draft = defaultDraft();
  draft.company = {
    ...draft.company,
    name: 'Studio',
    email: 'sales@example.test',
    contactName: 'Sam',
  };
  draft.country = 'US';
  draft.products = [
    {
      id: 'p1',
      name: 'Chair',
      description: 'Wooden chair',
      material: 'Wood',
      dimensions: '',
      imageAssetId: 'image-1',
    },
  ];
  draft.primaryProductId = 'p1';
  return draft;
}

function readyDraft(pageIds: DesignPage[] = basePageIds): Draft {
  const draft = suppliedDraft();
  draft.consultation = {
    revision: 1,
    answers: [],
    brief: briefFor(
      draft,
      pageIds.filter((id) => id.startsWith('extra-')),
    ),
    confirmed: true,
  };
  draft.copy = draft.consultation.brief!.copy;
  draft.siteDesign = {
    revision: 1,
    pageIds,
    pages: Object.fromEntries(pageIds.map((id) => [id, { imageAssetId: `design-${id}` }])),
  };
  draft.siteDesign.homeConfirmedAssetId = 'design-home';
  draft.siteDesign.confirmedKey = designKey(draft.siteDesign);
  draft.siteDesign.build = { jobId: 'build', artifactKey: 'site.json' };
  return draft;
}

describe('guided website workflow readiness', () => {
  it('uses the consultation and brief stages in the five-step shell', () => {
    expect(workflowSteps.map(([id]) => id)).toEqual([
      'basics',
      'consultation',
      'brief',
      'design',
      'publish',
    ]);
  });

  it('directs an empty project through source information, consultation, and brief approval', () => {
    expect(nextDraftStep(defaultDraft())).toBe('basics');
    expect(
      draftChecklist(defaultDraft())
        .filter((item) => !item.ready)
        .map((item) => item.id),
    ).toEqual(['company', 'market', 'products', 'consultation', 'brief', 'design', 'build']);

    const draft = suppliedDraft();
    expect(nextDraftStep(draft)).toBe('consultation');
    draft.consultation = { revision: 1, answers: [], brief: briefFor(draft) };
    expect(nextDraftStep(draft)).toBe('brief');
    draft.consultation.confirmed = true;
    expect(nextDraftStep(draft)).toBe('design');
  });

  it('does not make manual template or copy editing a workflow prerequisite', () => {
    const draft = suppliedDraft();
    draft.copy = {};
    draft.consultation = {
      revision: 1,
      answers: [],
      brief: briefFor(draft),
      confirmed: true,
    };

    expect(draftChecklist(draft).map((item) => item.id)).not.toContain('copy');
    expect(nextDraftStep(draft)).toBe('design');
  });

  it('uses the approved page plan for design readiness and labels', () => {
    const draft = readyDraft([...basePageIds, 'extra-materials']);
    const designItem = draftChecklist(draft).find((item) => item.id === 'design');
    expect(designItem).toMatchObject({ ready: true, step: 'design' });
    expect(designItem?.label).toBe('6 类页面设计稿');

    delete draft.siteDesign!.pages['extra-materials']!.imageAssetId;
    expect(draftChecklist(draft).find((item) => item.id === 'design')?.ready).toBe(false);
    expect(nextDraftStep(draft)).toBe('design');
  });

  it('keeps a completed legacy five-page artifact publishable without a new brief', () => {
    const draft = readyDraft();
    delete draft.consultation;
    delete draft.siteDesign!.pageIds;

    expect(nextDraftStep(draft)).toBe('publish');
    expect(draftChecklist(draft).every((item) => item.ready)).toBe(true);
  });

  it.each([
    [
      'invalid email',
      (draft: Draft) => {
        draft.company.email = 'not-an-email';
      },
      'basics',
    ],
    [
      'blank company',
      (draft: Draft) => {
        draft.company.name = '  ';
      },
      'basics',
    ],
    ['missing product image', (draft: Draft) => delete draft.products[0].imageAssetId, 'basics'],
    [
      'removed primary product',
      (draft: Draft) => {
        draft.primaryProductId = 'missing';
      },
      'basics',
    ],
    [
      'unconfirmed brief',
      (draft: Draft) => {
        draft.consultation!.confirmed = false;
      },
      'brief',
    ],
    ['unconfirmed designs', (draft: Draft) => delete draft.siteDesign!.confirmedKey, 'design'],
    ['missing built artifact', (draft: Draft) => delete draft.siteDesign!.build, 'publish'],
  ] as const)('returns to the right stage when %s regresses', (_name, change, step) => {
    const draft = readyDraft();
    change(draft);
    expect(nextDraftStep(draft)).toBe(step);
  });

  it('keeps offline sites separate from unpublished drafts', () => {
    expect(projectStatus({ offline: false } as Project)).toBe('draft');
    expect(projectStatus({ publishedReleaseId: 'release', offline: false } as Project)).toBe(
      'published',
    );
    expect(projectStatus({ publishedReleaseId: 'release', offline: true } as Project)).toBe(
      'offline',
    );
  });

  it('supports the fast 3-step template branch', () => {
    const draft = suppliedDraft();
    draft.buildBranch = 'template';
    // 检查步骤定义为 3 步
    const steps = getWorkflowSteps(draft);
    expect(steps.map((s) => s[0])).toEqual(['basics', 'template', 'publish']);

    // 资料完成后推进到 template
    expect(nextDraftStep(draft)).toBe('template');

    // 模版选择就绪后，直接进入 publish，无需 AI 绘图或构建
    draft.template = 'technology';
    draft.templateConfirmed = true;
    const items = draftChecklist(draft);
    expect(items.map((i) => i.id)).toEqual(['company', 'market', 'products', 'template', 'build']);
    expect(nextDraftStep(draft)).toBe('publish');
  });
});


it('uses the selected preset when a previous custom design is still saved', () => {
  const draft = suppliedDraft();
  draft.buildBranch = 'template';
  draft.template = 'juno-toys';
  draft.templateConfirmed = true;
  draft.siteDesign = { revision: 1, pages: {} } as Draft['siteDesign'];
  expect(getWorkflowSteps(draft).map(step => step[0])).toEqual(['basics', 'template', 'publish']);
  expect(nextDraftStep(draft)).toBe('publish');
  expect(() => assertPublishable(draft)).not.toThrow();
  expect(draft.siteDesign).toBeDefined();
  draft.heroAssetId = 'chosen-video';
  draft.template = 'senseng-video';
  expect(publicAssetReferences(draft)).toContain('chosen-video');
  draft.template = 'juno-toys';
  expect(publicAssetReferences(draft)).not.toContain('chosen-video');
});
