import type { Draft, Job } from './model';

export type BuildMode = NonNullable<Draft['buildBranch']>;
/** Unmarked new/empty drafts use templates; retain evidence of an older custom workflow. */
export function buildMode(draft?: Draft): BuildMode {
  if (draft?.buildBranch) return draft.buildBranch;
  if (draft?.cloneConfig) return 'clone';
  if (draft?.consultation || draft?.siteDesign || draft?.script?.trim() || draft?.scenes?.length || draft?.heroAssetId) return 'custom';
  return 'template';
}
export function withBuildMode(draft: Draft): Draft {
  return draft.buildBranch ? draft : { ...draft, buildBranch: buildMode(draft) };
}
export function blocksModeChange(job: Pick<Job, 'kind' | 'status'>): boolean {
  return job.kind !== 'email' && ['queued', 'running', 'paused', 'unknown'].includes(job.status);
}
