import type { Job } from '../shared/model';
export const liveJob = (job: Pick<Job, 'status'>) => ['queued', 'running'].includes(job.status);
export function needsClonePolling(state: { job: Job | null; publication?: Pick<Job, 'status'> }) {
  return !!state.job && (liveJob(state.job) || !!state.publication && liveJob(state.publication));
}
