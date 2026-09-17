import { captureReference, ReferencePaused } from './clone-reference';
import { completeSparseHome } from './clone-completion';
import { reviewClone } from './clone-quality';
import type { CloneConfig, CloneTaskProgress, Job, Principal, Project } from '../shared/model';
import type { AppEnv } from './env';
import { testMode } from './env';
import { DomainStore } from './domain-store';
import { expectedVersion, requestId, requireCondition, validateDraft, validEmail } from './domain';
import { generateCloneBundle } from './clone-service';
import { normalizeCloneImages } from '../shared/clone';
import { storeCloneOutput } from './clone-artifacts';
import { hasCloneOutput, preserveCloneOutput } from '../shared/clone-output';

const now = () => new Date().toISOString();
const active = (job?: Job) => !!job && ['queued', 'running', 'paused'].includes(job.status);
const checkpoint = (job: Job) => `projects/${job.projectId}/clone-tasks/${job.id}.json`;
class PauseBoundary extends ReferencePaused {}
interface Hooks {
  lock<T>(run: () => Promise<T>): Promise<T>;
  wake(): Promise<void>;
  validate(project: Project): Promise<void>;
  image(projectId: string, assetId: string): Promise<string | null>;
  publish(project: Project, principal: Principal, requestId: string): Promise<Job>;
}
/** Durable jobs own their input snapshot; browser disconnection never cancels a job. */
export class CloneTasks {
  private controllers = new Map<string, AbortController>();
  constructor(
    private env: AppEnv,
    private store: DomainStore,
    private hooks: Hooks,
  ) {}
  async current(project: Project) {
    const job = project.draft.cloneConfig?.taskId
      ? await this.store.one<Job>('jobs', project.draft.cloneConfig.taskId)
      : undefined;
    return job?.kind === 'clone' && job.projectId === project.id ? job : undefined;
  }
  async assertEditable(project: Project) {
    requireCondition(
      !active(await this.current(project)),
      409,
      'clone_task_active',
      '设计生成任务尚未结束，请先停止任务再修改草稿。',
    );
  }
  async start(project: Project, principal: Principal, body: Record<string, unknown>) {
    const prior = await this.current(project);
    // A double click or a lost start response must never submit a second paid request.
    if (active(prior) || (prior && prior.requestId === body.requestId))
      return { project, job: this.publicJob(prior!) };
    expectedVersion(project, body.expectedVersion);
    const cloneConfig = validateDraft({
      ...project.draft,
      cloneConfig: preserveCloneOutput(project.draft.cloneConfig, {
        ...project.draft.cloneConfig,
        ...(body.cloneConfig as CloneConfig),
      }),
    }).cloneConfig!;
    cloneConfig.uiImages = normalizeCloneImages(cloneConfig.uiImages);
    requireCondition(
      !!cloneConfig.targetUrl?.trim() ||
        !!cloneConfig.uiImages?.some((image) => image.role !== 'asset') ||
        (testMode(this.env) && this.env.CLONE_TEST_FIXTURE === 'true'),
      400,
      'clone_design_missing',
      '请输入参考网址，或上传至少一张页面设计稿。',
    );
    if (body.autoPublish === true)
      requireCondition(
        project.draft.company.name.trim() && validEmail(project.draft.company.email),
        400,
        'company_incomplete',
        '自动发布前请填写公司 / 品牌名称和有效联系邮箱；也可以先生成私有预览。',
      );
    const id = crypto.randomUUID();
    project.draft = {
      ...project.draft,
      buildBranch: 'clone',
      cloneConfig: { ...cloneConfig, taskId: id, status: 'generating', error: undefined },
    };
    await this.hooks.validate(project);
    project.version++;
    project.updatedAt = now();
    const imageCount = cloneConfig.uiImages?.length || 0;
    const history = (
      await this.store.list<Job>(
        'jobs',
        "project_id=? AND kind='clone' AND status='succeeded'",
        [project.id],
        'created_at DESC',
      )
    ).filter((j) => j.cloneProgress?.elapsedMs);
    const estimatedSeconds = history.length
      ? Math.round(
          history.slice(0, 5).reduce((sum, j) => sum + j.cloneProgress!.elapsedMs / 1000, 0) /
            Math.min(5, history.length),
        )
      : Math.min(600, (cloneConfig.targetUrl ? 360 : 120) + imageCount * 15);
    const snapshot = structuredClone(project);
    if (snapshot.draft.cloneConfig) {
      delete snapshot.draft.cloneConfig.generatedHtml;
      delete snapshot.draft.cloneConfig.generatedFiles;
      delete snapshot.draft.cloneConfig.generation;
    }
    const job: Job = {
      id,
      projectId: project.id,
      userId: principal.userId,
      kind: 'clone',
      status: 'queued',
      requestId: requestId(body.requestId),
      input: { project: snapshot, principal, autoPublish: body.autoPublish === true },
      inputVersion: project.version,
      createdAt: now(),
      updatedAt: now(),
      attempts: 0,
      testMode: testMode(this.env),
      cloneProgress: {
        autoPublish: body.autoPublish === true,
        phase: 'queued',
        imagesRead: 0,
        imageCount,
        outputCharacters: 0,
        elapsedMs: 0,
        estimatedSeconds,
      },
    };
    await this.hooks.wake();
    await this.store.batch([
      this.store.update('projects', project),
      this.store.insert('jobs', job),
    ]);
    return { project, job: this.publicJob(job) };
  }
  publicJob(job: Job) {
    return { ...job, input: {} };
  }
  async status(project: Project) {
    const job = await this.current(project);
    if (!job) return { job: null };
    const publication = job.cloneProgress?.publishJobId
      ? await this.store.one<Job>('jobs', job.cloneProgress.publishJobId)
      : undefined;
    return {
      job: this.publicJob(job),
      publication: publication
        ? { id: publication.id, status: publication.status, error: publication.error }
        : undefined,
      url: publication?.status === 'succeeded' ? project.siteUrl : undefined,
    };
  }
  private stopClock(job: Job) {
    const progress = job.cloneProgress!;
    if (progress.activeSince)
      progress.elapsedMs += Math.max(0, Date.now() - Date.parse(progress.activeSince));
    delete progress.activeSince;
  }
  async control(project: Project, body: Record<string, unknown>, action: string) {
    const job = await this.current(project);
    requireCondition(
      job && job.id === body.taskId,
      409,
      'clone_task_changed',
      '任务已变化，请刷新任务状态。',
    );
    requireCondition(
      !job.cloneProgress?.publishJobId,
      409,
      'clone_already_publishing',
      '生成已完成且发布已提交，请在发布页查看结果。',
    );
    if (action === 'pause' && ['queued', 'running'].includes(job.status)) {
      if (job.status === 'queued') {
        job.status = 'paused';
        this.stopClock(job);
      } else job.cloneProgress!.pauseRequested = true;
    } else if (action === 'resume' && job.status === 'paused') {
      job.status = 'queued';
      job.cloneProgress!.pauseRequested = false;
      await this.hooks.wake();
    } else if (action === 'stop' && active(job)) {
      job.status = 'cancelled';
      this.stopClock(job);
      job.cloneProgress!.pauseRequested = false;
      this.controllers.get(job.id)?.abort();
      if (project.draft.cloneConfig) {
        project.draft.cloneConfig.status = hasCloneOutput(project.draft.cloneConfig)
          ? 'ready'
          : 'idle';
        project.draft.cloneConfig.error = undefined;
      }
      project.version++;
      project.updatedAt = now();
      await this.store.update('projects', project).run();
    }
    job.updatedAt = now();
    await this.store.update('jobs', job).run();
    if (job.status === 'cancelled')
      await this.env.MEDIA.delete([checkpoint(job), checkpoint(job) + '.reference']);
    return { project, job: this.publicJob(job) };
  }
  async tick() {
    const selected = await this.hooks.lock(async () => {
      const jobs = await this.store.list<Job>(
        'jobs',
        "kind='clone' AND status IN ('queued','running')",
        [],
        'created_at ASC',
      );
      const job = jobs[0];
      if (!job) return;
      if (job.status === 'running') {
        // A previous alarm was interrupted. Never retry a possibly billed model request automatically.
        if (await this.env.MEDIA.head(checkpoint(job))) {
          job.status = 'paused';
          job.cloneProgress!.pauseRequested = false;
        } else {
          job.status = 'failed';
          job.error = '后台任务中断，未自动重复调用模型。请重新开始生成。';
        }
        this.stopClock(job);
        job.updatedAt = now();
        await this.store.update('jobs', job).run();
        await this.hooks.wake();
        return;
      }
      job.status = 'running';
      job.attempts++;
      job.updatedAt = now();
      job.cloneProgress!.activeSince = now();
      await this.store.update('jobs', job).run();
      await this.hooks.wake();
      return job;
    });
    if (!selected) return;
    const controller = new AbortController();
    this.controllers.set(selected.id, controller);
    const update = async (phase: CloneTaskProgress['phase'], count = 0) =>
      this.hooks.lock(async () => {
        const job = await this.store.one<Job>('jobs', selected.id);
        if (!job || job.status !== 'running') throw new DOMException('Task stopped', 'AbortError');
        if (job.cloneProgress!.pauseRequested && (phase === 'reading' || phase === 'capturing')) {
          job.status = 'paused';
          this.stopClock(job);
          job.updatedAt = now();
          await this.store.update('jobs', job).run();
          throw new PauseBoundary();
        }
        job.cloneProgress!.phase = phase;
        if (phase === 'reading' || phase === 'capturing') job.cloneProgress!.imagesRead = count;
        if (phase === 'model') job.cloneProgress!.outputCharacters = count;
        job.updatedAt = now();
        await this.store.update('jobs', job).run();
      });
    try {
      const snapshot = selected.input.project as Project;
      const saved = await this.env.MEDIA.get(checkpoint(selected));
      if (
        !saved &&
        snapshot.draft.cloneConfig?.targetUrl &&
        !snapshot.draft.cloneConfig.uiImages?.some(
          (i) => i.role !== 'asset' && !i.id.startsWith('reference-'),
        )
      ) {
        const sourceKey = checkpoint(selected) + '.reference';
        const captured = await this.env.MEDIA.get(sourceKey);
        snapshot.draft.cloneConfig = captured
          ? ((await new Response(captured.body).json()) as CloneConfig)
          : await captureReference(
              this.env,
              this.store,
              {
                ...snapshot,
                draft: {
                  ...snapshot.draft,
                  cloneConfig: {
                    ...snapshot.draft.cloneConfig,
                    uiImages: snapshot.draft.cloneConfig.uiImages?.filter(
                      (i) => !i.id.startsWith('reference-'),
                    ),
                  },
                },
              },
              controller.signal,
              (count) => update('capturing', count),
              this.hooks.lock,
            );
        if (!captured)
          await this.env.MEDIA.put(sourceKey, JSON.stringify(snapshot.draft.cloneConfig));
        await this.hooks.lock(async () => {
          const job = await this.store.one<Job>('jobs', selected.id);
          if (job?.status === 'running') {
            job.input.project = snapshot;
            job.cloneProgress!.imageCount = snapshot.draft.cloneConfig!.uiImages?.length || 0;
            await this.store.update('jobs', job).run();
          }
        });
      }
      const bundle: Awaited<ReturnType<typeof generateCloneBundle>> = saved
        ? ((await new Response(saved.body).json()) as Awaited<
            ReturnType<typeof generateCloneBundle>
          >)
        : await generateCloneBundle(
            this.env,
            snapshot,
            snapshot.draft.cloneConfig!,
            (id) => this.hooks.image(snapshot.id, id),
            { signal: controller.signal, progress: update },
          );
      controller.signal.throwIfAborted();
      // A completed model result is checkpointed before honoring pause or submitting publication.
      if (!saved)
        await this.env.MEDIA.put(checkpoint(selected), JSON.stringify(bundle), {
          httpMetadata: { contentType: 'application/json' },
        });
      const pendingControl = await this.store.one<Job>('jobs', selected.id);
      if (
        pendingControl?.status === 'running' &&
        !pendingControl.cloneProgress?.pauseRequested &&
        !bundle.generation.quality &&
        bundle.generation.mode !== 'fixture'
      ) {
        await update('validating');
        bundle.generation.quality = await reviewClone(
          this.env,
          snapshot,
          bundle,
          (id) => this.hooks.image(snapshot.id, id),
          controller.signal,
        );
        const quality = bundle.generation.quality;
        if (quality.status === 'passed' && quality.sparsePages?.length) {
          const completed = completeSparseHome(
            snapshot.draft,
            bundle.generatedFiles,
            quality.sparsePages,
          );
          if (completed !== bundle.generatedFiles) {
            bundle.generatedFiles = completed;
            bundle.generatedHtml = completed[`${snapshot.draft.languages[0]}/index.html`];
            bundle.generation.improvements = [
              ...(bundle.generation.improvements ?? []).slice(0, 7),
              '页面内容较少，使用已提供的产品与联系方式补充首页；未新增未经提供的事实。',
            ];
            bundle.generation.quality = await reviewClone(
              this.env,
              snapshot,
              bundle,
              (id) => this.hooks.image(snapshot.id, id),
              controller.signal,
            );
          }
        }
        await this.env.MEDIA.put(checkpoint(selected), JSON.stringify(bundle), {
          httpMetadata: { contentType: 'application/json' },
        });
      }
      await this.hooks.lock(async () => {
        const job = await this.store.one<Job>('jobs', selected.id);
        if (!job || job.status !== 'running') return;
        const project = await this.store.one<Project>('projects', selected.projectId);
        if (!project || project.draft.cloneConfig?.taskId !== job.id) return;
        if (job.cloneProgress!.pauseRequested) {
          job.status = 'paused';
          job.cloneProgress!.phase = 'validating';
          this.stopClock(job);
        } else {
          requireCondition(
            project.version === (job.input.committedVersion ?? job.inputVersion),
            409,
            'clone_input_changed',
            '任务执行期间草稿已更新，生成结果已保留，请停止后重新生成。',
          );
          if (!job.input.committedVersion) {
            project.draft.cloneConfig = await storeCloneOutput(this.env, project.id, {
              ...snapshot.draft.cloneConfig,
              ...bundle,
              status: 'ready',
              generatedAt: now(),
              error: undefined,
            });
            project.version++;
            project.updatedAt = now();
            job.input.committedVersion = project.version;
            await this.store.batch([
              this.store.update('projects', project),
              this.store.update('jobs', job),
            ]);
          }
          // Publish is idempotent by task id and is now independent of the browser.
          const quality = bundle.generation.quality;
          const holdPublication =
            quality?.status === 'issues' ||
            (quality?.status === 'unavailable' && !!this.env.SITE_BUILDER_URL);
          if (holdPublication) job.cloneProgress!.autoPublish = false;
          if (job.input.autoPublish && !holdPublication) {
            const publication = await this.hooks.publish(
              project,
              job.input.principal as Principal,
              job.id,
            );
            job.cloneProgress!.publishJobId = publication.id;
            job.cloneProgress!.phase = 'publishing';
          } else job.cloneProgress!.phase = 'done';
          job.status = 'succeeded';
          this.stopClock(job);
        }
        job.updatedAt = now();
        await this.store.update('jobs', job).run();
      });
    } catch (error) {
      if (!(error instanceof PauseBoundary))
        await this.hooks.lock(async () => {
          const job = await this.store.one<Job>('jobs', selected.id);
          if (!job || job.status !== 'running') return;
          job.status = 'failed';
          job.error = error instanceof Error ? error.message : '生成失败';
          this.stopClock(job);
          job.updatedAt = now();
          const project = await this.store.one<Project>('projects', job.projectId);
          if (project?.draft.cloneConfig?.taskId === job.id) {
            project.draft.cloneConfig.status = 'error';
            project.draft.cloneConfig.error = job.error;
            project.version++;
            project.updatedAt = now();
            await this.store.update('projects', project).run();
          }
          await this.store.update('jobs', job).run();
        });
    } finally {
      this.controllers.delete(selected.id);
      const job = await this.store.one<Job>('jobs', selected.id);
      if (job && ['succeeded', 'cancelled'].includes(job.status))
        await this.env.MEDIA.delete([checkpoint(selected), checkpoint(selected) + '.reference']);
      await this.hooks.wake();
    }
  }
}
