import type { Asset, Job, Project, Release } from '../shared/model';
/** Include files stored outside D1, not just uploaded media. No secrets or signed URLs. */
export function backupManifest(
  projects: Project[],
  assets: Asset[],
  jobs: Job[],
  releases: Release[],
) {
  const entries = new Map<string, { key: string; required: boolean; sha256?: string }>();
  for (const asset of assets) entries.set(asset.key, { key: asset.key, required: true });
  const draft = (projectId: string, value: Project['draft']) => {
    const report = value.cloneConfig?.generation?.quality?.reportKey;
    if (report?.startsWith(`projects/${projectId}/quality/`))
      entries.set(report, { key: report, required: true });
    const ref = value.cloneConfig?.artifact;
    if (ref?.key.startsWith(`projects/${projectId}/sites/`))
      entries.set(ref.key, { key: ref.key, required: true, sha256: ref.sha256 });
    const key = value.siteDesign?.build?.artifactKey;
    if (key?.startsWith(`projects/${projectId}/sites/`)) entries.set(key, { key, required: true });
  };
  for (const project of projects) draft(project.id, project.draft);
  for (const release of releases) draft(release.projectId, release.draft);
  for (const job of jobs) {
    if (job.input.draft) draft(job.projectId, job.input.draft as Project['draft']);
    if (job.kind === 'clone' && ['queued', 'running', 'paused'].includes(job.status)) {
      const key = `projects/${job.projectId}/clone-tasks/${job.id}.json`;
      entries.set(key, { key, required: false });
    }
  }
  return [...entries.values()].sort((a, b) => a.key.localeCompare(b.key));
}
