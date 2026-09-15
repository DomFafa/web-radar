import type { Draft, Project } from '../shared/model';
import { designsConfirmed, staticSiteReady } from '../shared/site-design';
import { briefConfirmed, plannedPages } from '../shared/site-brief';

export const workflowSteps = [
  ['basics', '资料与产品', 'folder'],
  ['consultation', '需求沟通', 'spark'],
  ['brief', '网站方案', 'edit'],
  ['design', '页面设计稿', 'image'],
  ['publish', '预览与发布', 'globe'],
] as const;
export type WorkflowStep = (typeof workflowSteps)[number][0];
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
  const items: ChecklistItem[] = [
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
  ];
  items.push(
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
  );
  return items;
}

export function nextDraftStep(draft: Draft): WorkflowStep {
  return draftChecklist(draft).find((item) => !item.ready)?.step ?? 'publish';
}

export function projectStatus(project: Project): 'draft' | 'published' | 'offline' {
  return !project.publishedReleaseId ? 'draft' : project.offline ? 'offline' : 'published';
}
