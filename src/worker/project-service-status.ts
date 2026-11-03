import { canManage } from '../shared/access';
import type { Job, Principal, Project, Release } from '../shared/model';
import type { ProjectServiceStatus, ProjectServiceStatusBatch, ProjectServiceStatusBatchItem } from '../shared/project-service';
import { samePublishedDraft } from '../shared/publication';
import { plannedPages } from '../shared/site-brief';
import { expectedVersion, requireCondition } from './domain';
import { domainErrorResponse } from './domain-error-response';
import { DomainStore, type StatusReadResult } from './domain-store';
import type { AppEnv } from './env';
import { currentMaterialsPrincipal } from './materials-auth';
import { loadWebsiteResult } from './website-results';

/** The second live identity check and existing status reads share one owner. */
export async function readProjectServiceStatus(env: AppEnv, identity: Principal, projectId: string, action: 'status' | 'publication-status', query: URLSearchParams, store = new DomainStore(env.DB)): Promise<Response> {
  try {
    const timings: string[] = [], statusStarted = performance.now();
    const principal = await currentMaterialsPrincipal(env, identity);
    timings.push(`wr-status-principal;dur=${(performance.now() - statusStarted).toFixed(1)}`);
    const status = await authorizedProjectStatus(env, store, principal, projectId, action, query, timings);
    const serializeStarted = performance.now();
    const result = Response.json(status, { headers: { 'Cache-Control': 'no-store' } }), finished = performance.now();
    timings.push(`wr-status-serialize;dur=${(finished - serializeStarted).toFixed(1)}`,
      `wr-status-total;dur=${(finished - statusStarted).toFixed(1)}`);
    result.headers.set('Server-Timing', timings.join(', '));
    return result;
  } catch (error) { return domainErrorResponse(error); }
}

/** The direct batch owns one live check, shared only by this request's fixed identity. */
export async function readProjectServiceStatusBatch(env: AppEnv, identity: Pick<Principal, 'userId' | 'workspaceId'>, projectIds: readonly string[], store = new DomainStore(env.DB)): Promise<Response> {
  try {
    const started = performance.now();
    const principal = await currentMaterialsPrincipal(env, identity), itemsStarted = performance.now();
    const items: ProjectServiceStatusBatchItem[] = new Array(projectIds.length);
    const failed = async (index: number, error: unknown) => {
      const response = domainErrorResponse(error);
      items[index] = { projectId: projectIds[index], status: response.status, error: await response.json() as { code: string; message: string } };
    };
    const projects = await store.statusProjects(projectIds), projectsAt = performance.now();
    const authorized = new Map<string, Project>();
    for (let index = 0; index < projectIds.length; index++) {
      const id = projectIds[index];
      try { authorized.set(id, requireMaterialsProject(statusValue(projects.get(id)), principal)); }
      catch (error) { await failed(index, error); }
    }
    const jobs = await store.statusLatestJobs([...authorized.keys()]), jobsAt = performance.now();
    const releaseIds = new Set<string>();
    for (let index = 0; index < projectIds.length; index++) {
      const id = projectIds[index], project = authorized.get(id); if (!project) continue;
      try {
        const job = statusValue(jobs.get(id));
        if (job?.input.releaseId) releaseIds.add(String(job.input.releaseId));
        if (project.publishedReleaseId) releaseIds.add(project.publishedReleaseId);
      } catch (error) { authorized.delete(id); await failed(index, error); }
    }
    const releases = await store.statusReleases([...releaseIds]), releasesAt = performance.now();
    for (let index = 0; index < projectIds.length; index++) {
      const id = projectIds[index], project = authorized.get(id); if (!project) continue;
      try {
        const job = statusValue(jobs.get(id));
        const release = job?.input.releaseId ? statusValue(releases.get(String(job.input.releaseId))) : undefined;
        const activeRelease = project.publishedReleaseId === release?.id ? release : project.publishedReleaseId ? statusValue(releases.get(project.publishedReleaseId)) : undefined;
        items[index] = { projectId: id, status: 200, value: assembleProjectServiceStatus(project, job, release, activeRelease) };
      } catch (error) { await failed(index, error); }
    }
    const serializeStarted = performance.now();
    const body: ProjectServiceStatusBatch = { schemaVersion: 'wr-project-status-batch-v1', items };
    const result = Response.json(body, { headers: { 'Cache-Control': 'no-store' } }), finished = performance.now();
    result.headers.set('Server-Timing', `wr-status-principal;dur=${(itemsStarted - started).toFixed(1)}, wr-status-items;dur=${(serializeStarted - itemsStarted).toFixed(1)}, wr-status-project;dur=${(projectsAt - itemsStarted).toFixed(1)}, wr-status-jobs;dur=${(jobsAt - projectsAt).toFixed(1)}, wr-status-releases;dur=${(releasesAt - jobsAt).toFixed(1)}, wr-status-serialize;dur=${(finished - serializeStarted).toFixed(1)}, wr-status-total;dur=${(finished - started).toFixed(1)}`);
    return result;
  } catch (error) { return domainErrorResponse(error); }
}

async function authorizedProjectStatus(env: AppEnv, store: DomainStore, principal: Principal, projectId: string, action: 'status' | 'publication-status', query: URLSearchParams, timings?: string[]): Promise<ProjectServiceStatus> {
  const projectStarted = timings ? performance.now() : 0;
  const archived = action === 'status' && query.has('expectedVersion')
    ? await loadWebsiteResult(env, projectId, Number(query.get('expectedVersion'))) : undefined;
  let project = archived?.project || await store.one<Project>('projects', projectId);
  timings?.push(`wr-status-project;dur=${(performance.now() - projectStarted).toFixed(1)}`);
  project = requireMaterialsProject(project, principal, Boolean(archived));
  if (query.has('expectedVersion')) expectedVersion(project, Number(query.get('expectedVersion')));
  return projectServiceStatus(store, project, query.get('jobId') || undefined, Boolean(archived), timings);
}

export async function projectServiceStatus(store: Pick<DomainStore, 'one' | 'list'>, project: Project, jobId?: string, archived = false, timings?: string[]): Promise<ProjectServiceStatus> {
  const jobsStarted = timings ? performance.now() : 0;
  const job = archived ? undefined : jobId ? await store.one<Job>('jobs', jobId)
    : (await store.list<Job>('jobs', "project_id=? AND kind='publish'", [project.id], 'created_at DESC, rowid DESC', 1))[0];
  if (jobId) requireCondition(job?.projectId === project.id && job.kind === 'publish', 404, 'job_not_found', '发布任务不存在。');
  const releasesStarted = timings ? performance.now() : 0;
  const release = job?.input.releaseId ? await store.one<Release>('releases', String(job.input.releaseId)) : undefined;
  const activeRelease = archived ? undefined : project.publishedReleaseId === release?.id ? release
    : project.publishedReleaseId ? await store.one<Release>('releases', project.publishedReleaseId) : undefined;
  const assembleStarted = timings ? performance.now() : 0;
  const result = assembleProjectServiceStatus(project, job, release, activeRelease);
  if (timings) timings.push(`wr-status-jobs;dur=${(releasesStarted - jobsStarted).toFixed(1)}`,
    `wr-status-releases;dur=${(assembleStarted - releasesStarted).toFixed(1)}`,
    `wr-status-assemble;dur=${(performance.now() - assembleStarted).toFixed(1)}`);
  return result;
}

function statusValue<T>(result: StatusReadResult<T> | undefined): T | undefined {
  if (result && 'error' in result) throw result.error;
  return result?.value;
}
function requireMaterialsProject(project: Project | undefined, principal: Principal, archived = false): Project {
  requireCondition(project && canManage(project, principal), 404, 'project_not_found', '项目不存在或没有访问权限。');
  requireCondition(archived || (project.materials && project.draft.materials), 409, 'materials_receipt_required', '此接口需要已接收的确认资料项目。');
  return project;
}
function assembleProjectServiceStatus(project: Project, job: Job | undefined, release: Release | undefined, activeRelease: Release | undefined): ProjectServiceStatus {
  const published = activeRelease?.status === 'succeeded' ? activeRelease : undefined;
  let completed = 0, total = 0;
  for (const asset of Object.values(release?.publicMedia?.assets ?? {})) {
    const widths = new Set(asset.widths), prepared = new Set(asset.variants.map(variant => variant.requestedWidth));
    total += widths.size;
    for (const width of widths) if (prepared.has(width)) completed++;
  }
  const base = `/api/integrations/product-radar/projects/${project.id}`;
  const result: ProjectServiceStatus = { schemaVersion: 'wr-project-service-v1', projectId: project.id, projectVersion: project.version,
    hasUnpublishedChanges: !published || !samePublishedDraft(project.draft, published.draft),
    ...(published ? { publishedVersion: published.draftVersion } : {}),
    name: project.name, template: project.draft.template, languages: project.draft.languages,
    pages: plannedPages(project.draft), products: project.draft.products.map(({id, name}) => ({id, name})),
    primaryProductId: project.draft.primaryProductId,
    publication: job ? { status: job.status,
      phase: job.status === 'succeeded' ? 'complete' : ['failed', 'paused', 'cancelled'].includes(job.status) ? 'failed'
        : job.input.publishResult || job.status === 'unknown' ? 'recovering'
        : job.input.mediaPreparation && !job.input.publicationStarted ? 'preparing_media'
        : job.input.publicationStarted ? 'deploying' : 'queued',
      jobId: job.id, releaseId: release?.id, inputVersion: job.inputVersion,
      ...(total ? { mediaProgress: { completed, total } } : {}),
      ...(job.status === 'succeeded' && release?.status === 'succeeded' && !project.offline ? {url: release.url} : {}),
      ...(job.error ? {error: job.error} : {}), retryable: job.status === 'failed', updatedAt: job.updatedAt,
    } : { status: 'idle', phase: 'idle', retryable: false },
    ...(!project.offline && project.publishedReleaseId && project.siteUrl ? {publishedUrl: project.siteUrl} : {}),
    previewEndpoint: base + '/preview', publishEndpoint: base + '/publish', statusEndpoint: base + '/publication-status',
  };
  return result;
}
