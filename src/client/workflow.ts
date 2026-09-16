import type { Draft, Project } from '../shared/model';
import { designsConfirmed, staticSiteReady } from '../shared/site-design';
import { briefConfirmed, plannedPages } from '../shared/site-brief';

export const templateWorkflowSteps = [
  ['basics', '资料与产品', 'folder'],
  ['template', '选择模版', 'palette'],
  ['publish', '预览与发布', 'globe'],
] as const;

export const customWorkflowSteps = [
  ['basics', '资料与产品', 'folder'],
  ['consultation', '需求沟通', 'spark'],
  ['brief', '网站方案', 'edit'],
  ['design', '页面设计稿', 'image'],
  ['publish', '预览与发布', 'globe'],
] as const;

export const cloneWorkflowSteps = [
  ['basics', '克隆与素材', 'folder'],
  ['clone-generate', '像素级生成', 'spark'],
  ['publish', '预览与发布', 'globe'],
] as const;

export const workflowSteps = customWorkflowSteps;
export type WorkflowStep =
  | (typeof templateWorkflowSteps)[number][0]
  | (typeof customWorkflowSteps)[number][0]
  | (typeof cloneWorkflowSteps)[number][0];

export function getWorkflowSteps(draft?: Draft) {
  if (draft?.buildBranch === 'clone') {
    return cloneWorkflowSteps;
  }
  return draft?.buildBranch === 'template'
    ? templateWorkflowSteps
    : customWorkflowSteps;
}

export type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
  step: WorkflowStep;
  ready: boolean;
};

export function draftChecklist(draft: Draft): ChecklistItem[] {
  const email = draft.company.email;
  const legacyArtifactReady = staticSiteReady(draft) && !draft.consultation;
  const pages = plannedPages(draft);

  const basicItems: ChecklistItem[] = [
    {
      id: 'company',
      label: '公司与联系资料',
      detail: '公司名称、有效邮箱和联系人',
      step: 'basics',
      ready:
        !!draft.company.name.trim() &&
        !!draft.company.contactName.trim() &&
        email.length <= 254 &&
        /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) &&
        !/[\r\n]/.test(email),
    },
    {
      id: 'market',
      label: '销售市场',
      detail: '网站面向的销售国家或市场',
      step: 'basics',
      ready: !!draft.country.trim(),
    },
    {
      id: 'products',
      label: '产品与主产品',
      detail: `${draft.products.length} 个产品；每个产品需有名称和图片`,
      step: 'basics',
      ready:
        draft.products.length > 0 &&
        draft.products.some((p) => p.id === draft.primaryProductId) &&
        draft.products.every((p) => !!p.name.trim() && !!p.imageAssetId),
    },
  ];

  if (draft.buildBranch === 'clone') {
    const hasTarget = Boolean(
      draft.cloneConfig?.targetUrl?.trim() ||
        (draft.cloneConfig?.uiImages && draft.cloneConfig.uiImages.length > 0),
    );
    const isGenerated = Boolean(
      draft.cloneConfig?.generatedHtml || draft.cloneConfig?.status === 'ready',
    );
    return [
      {
        id: 'clone-source',
        label: '目标站点或设计稿',
        detail: draft.cloneConfig?.targetUrl
          ? `目标 URL: ${draft.cloneConfig.targetUrl}`
          : draft.cloneConfig?.uiImages?.length
            ? `已上传 ${draft.cloneConfig.uiImages.length} 个设计稿素材`
            : '请提供参考网站 URL 或上传设计稿/原型图',
        step: 'basics',
        ready: hasTarget,
      },
      {
        id: 'clone-generate',
        label: 'OpenAI 像素级生成',
        detail: isGenerated
          ? '页面代码已生成，请对照设计图检查'
          : '调用 GPT-4o 视觉模型进行像素级逆向与代码生成',
        step: 'clone-generate',
        ready: isGenerated,
      },
      {
        id: 'build',
        label: '全站预览与发布',
        detail: '交互式全屏预览，支持一键发布上线',
        step: 'publish',
        ready: isGenerated,
      },
    ];
  }

  if (draft.buildBranch === 'template') {
    // 极速模版建站分支（3 步流程）
    return [
      ...basicItems,
      {
        id: 'template',
        label: '选择网站模版',
        detail: '挑选行业预设样式与品牌配色',
        step: 'template',
        ready: Boolean(draft.templateConfirmed),
      },
      {
        id: 'build',
        label: '静态网站生成',
        detail: '根据模版与产品资料实时拼装，随时可预览与发布',
        step: 'publish',
        ready: true,
      },
    ];
  }

  // AI 智能深度定制分支（5 步流程）
  const customItems: ChecklistItem[] = [
    ...basicItems,
    {
      id: 'consultation',
      label: '网站需求沟通',
      detail: '根据产品图片和已知资料，一次确认一个关键问题',
      step: 'consultation',
      ready: legacyArtifactReady || !!draft.consultation?.brief,
    },
    {
      id: 'brief',
      label: '网站方案与页面清单',
      detail: '检查受众、目标、视觉方向、保留项和页面内容',
      step: 'brief',
      ready: legacyArtifactReady || briefConfirmed(draft),
    },
    {
      id: 'design',
      label: `${pages.length} 类页面设计稿`,
      detail: `先确认首页风格，再确认全部 ${pages.length} 类页面设计`,
      step: 'design',
      ready: designsConfirmed(draft.siteDesign),
    },
    {
      id: 'build',
      label: '静态网站',
      detail: '从已确认设计稿生成可预览的网站',
      step: 'publish',
      ready: staticSiteReady(draft),
    },
  ];

  return customItems;
}

export function nextDraftStep(draft: Draft): WorkflowStep {
  return draftChecklist(draft).find((item) => !item.ready)?.step ?? 'publish';
}

export function projectStatus(project: Project): 'draft' | 'published' | 'offline' {
  return !project.publishedReleaseId ? 'draft' : project.offline ? 'offline' : 'published';
}
