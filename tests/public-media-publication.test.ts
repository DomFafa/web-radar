import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Asset, Job, Project, Release } from '../src/shared/model';
import type { AppEnv } from '../src/worker/env';
import * as publicMedia from '../src/worker/public-media';
import { DomainError } from '../src/worker/domain';
import { ApiError } from '../src/worker/http';
import { DomainService } from '../src/worker/domain-service';
import { draftFromMaterials } from '../src/worker/materials-service';
import type { ProviderSet } from '../src/worker/provider-contract';
import { fixtureProviders } from '../src/worker/providers/fixtures';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { materialsPng } from './fixtures/materials';
import { testDb } from './helpers/db';

const output = Uint8Array.from(
  Buffer.from(
    'UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoEAAMAAUAiJaACdLoB+AADsAD+8Gyv/2Vj6ln6Vj94L/5+Z3bi/nMAAAA=',
    'base64',
  ),
);
describe('resumable prepublication responsive media', () => {
  let env: AppEnv,
    service: DomainService,
    project: Project,
    input: Awaited<ReturnType<typeof typedMaterialsFixture>>;
  let transform: Mock<(url: string, options: unknown) => Promise<Response>>,
    publish: Mock<ProviderSet['publish']>;
  const objects = new Map<
    string,
    {
      bytes: Uint8Array;
      customMetadata?: Record<string, string>;
      httpMetadata: { contentType: string };
    }
  >();
  const schedule = vi.fn(async () => {});
  beforeEach(async () => {
    objects.clear();
    schedule.mockClear();
    input = await typedMaterialsFixture('senseng-candy', 2);
    const db = testDb();
    for (const migration of [
      '0002_business',
      '0003_source_reviews',
      '0004_unlimited_quota',
      '0005_project_summary_indexes',
      '0006_provider_accounts',
    ])
      await db.exec(readFileSync(`migrations/${migration}.sql`, 'utf8'));
    const metadata = (key: string) => {
      const o = objects.get(key);
      return o ? { ...o, size: o.bytes.length, httpEtag: '"source"' } : null;
    };
    env = {
      DB: db,
      APP_ORIGIN: 'https://web-radar.example',
      ENVIRONMENT: 'test',
      TEST_PROVIDERS: 'true',
      SITE_BUILDER_URL: 'https://builder.example',
      SITE_BUILDER_KEY: 'key',
      PRODUCT_RADAR_BASE_URL: 'https://product.example.com',
      PRODUCT_RADAR_INTEGRATION_SECRET: 's'.repeat(40),
      MEDIA: {
        head: vi.fn(async (key: string) => metadata(key)),
        get: vi.fn(async (key: string) => {
          const o = metadata(key);
          return o
            ? {
                ...o,
                body: new Response(new Uint8Array(o.bytes)).body,
                arrayBuffer: async () => o.bytes.buffer,
              }
            : null;
        }),
        put: vi.fn(async (key: string, bytes: Uint8Array, options: any) => {
          objects.set(key, { bytes, ...options });
          return metadata(key);
        }),
      },
    } as unknown as AppEnv;
    const providers = fixtureProviders(env);
    publish = vi.fn(providers.publish);
    providers.publish = publish;
    service = new DomainService(env, { schedule }, providers);
    transform = vi.fn(
      async () =>
        new Response(output, {
          headers: { 'Content-Type': 'image/webp', 'X-Source-Width': '4', 'X-Source-Height': '3' },
        }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options: any) =>
        String(url).includes('/v1/media/preview')
          ? transform(url, options)
          : Response.json({ protocolVersion: 1, principal: input.principal }),
      ),
    );
    const assets: Record<string, Asset> = {};
    for (const media of input.materials.media) {
      const bytes = Uint8Array.from(Buffer.concat([materialsPng, Buffer.from(media.id)]));
      assets[media.id] = {
        id: media.id,
        projectId: 'accepted',
        key: `original/${media.id}`,
        contentType: media.mimeType,
        size: bytes.length,
        filename: media.id,
        origin: 'import',
        createdAt: '',
        sha256: media.sha256,
      };
      objects.set(assets[media.id].key, {
        bytes,
        httpMetadata: { contentType: media.mimeType },
        customMetadata: { sha256: media.sha256 },
      });
    }
    objects.set('confirmed.json', {
      bytes: new TextEncoder().encode(JSON.stringify(input)),
      httpMetadata: { contentType: 'application/json' },
    });
    project = {
      materials: {
        submissionId: input.submissionId,
        source: input.source,
        contentSha256: input.confirmation.contentSha256,
        snapshotKey: 'confirmed.json',
        acceptedAt: '',
      },
      id: 'accepted',
      ownerId: input.principal.userId,
      workspaceId: input.principal.workspaceId,
      name: 'Accepted',
      version: 1,
      draft: draftFromMaterials(input, assets),
      offline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await service.store.insert('projects', project).run();
    for (const asset of Object.values(assets)) await service.store.insert('assets', asset).run();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  const api = async (path: string, body: unknown) => {
    const response = await service.fetch(
      new Request(`https://web-radar.example/api/projects/accepted/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WR-Principal': JSON.stringify(input.principal),
        },
        body: JSON.stringify(body),
      }),
    );
    const data: any = await response.json();
    expect(response.status, JSON.stringify(data)).toBe(200);
    return data;
  };
  const start = async () => {
    const p = (await service.store.one<Project>('projects', 'accepted'))!;
    return (await api('publish', { expectedVersion: p.version, requestId: crypto.randomUUID() }))
      .job as Job;
  };
  const finish = async (job: Job) => {
    for (let i = 0; i < 80; i++) {
      await service.tick();
      const j = (await service.store.one<Job>('jobs', job.id))!;
      if (j.status !== 'queued' && j.status !== 'running') return j;
    }
    throw Error('did not finish');
  };
  it('checkpoints bounded work before Pages, resumes an interrupted invocation, preserves originals and reuses the current policy', async () => {
    const before = new Map([...objects].map(([k, v]) => [k, Buffer.from(v.bytes).toString('hex')]));
    const job = await start();
    await service.tick();
    expect((await service.store.one<Job>('jobs', job.id))?.error).toBeUndefined();
    expect(publish).not.toHaveBeenCalled();
    expect(transform.mock.calls.length).toBeGreaterThan(0);
    expect(transform.mock.calls.length).toBeLessThanOrEqual(4);
    const first = (await service.store.one<Release>('releases', String(job.input.releaseId)))!;
    expect(first.publicMedia?.ready).toBe(false);
    const partial = (await service.store.one<Job>('jobs', job.id))!;
    partial.status = 'running';
    await service.store.update('jobs', partial).run();
    expect((await finish(job)).status).toBe('succeeded');
    expect(publish).toHaveBeenCalledTimes(1);
    const release = (await service.store.one<Release>('releases', String(job.input.releaseId)))!;
    expect(release.publicMedia?.ready).toBe(true);
    expect(release.rendererVersion).toBeTruthy();
    // Tiny sources stop at their actual size instead of generating duplicate larger outputs.
    for (const entry of Object.values(release.publicMedia!.assets))
      if (entry.variants.length) expect(new Set(entry.variants.map((v) => v.key)).size).toBe(1);
    expect(JSON.stringify(publish.mock.calls[0][2])).toContain('?width=');
    for (const [k, v] of before) expect(Buffer.from(objects.get(k)!.bytes).toString('hex')).toBe(v);
    expect((await start()).id).toBe(job.id);
    release.rendererVersion = 'previous';
    await service.store.update('releases', release).run();
    const next = await start();
    expect(next.id).not.toBe(job.id);
    const transforms = transform.mock.calls.length;
    expect((await finish(next)).status).toBe('succeeded');
    expect(transform).toHaveBeenCalledTimes(transforms);
    expect(publish).toHaveBeenCalledTimes(2);
    expect((await start()).id).toBe(next.id);
  });
  it('retries busy preparation without entering Pages and eventually stops with the previous site intact', async () => {
    transform.mockImplementation(async () => new Response('busy', { status: 503 }));
    const job = await start();
    await service.tick();
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('queued');
    const stopped = await finish(job);
    expect(stopped.status).toBe('failed');
    expect(stopped.input.publicationStarted).toBeUndefined();
    expect(publish).not.toHaveBeenCalled();
    expect(
      (await service.store.one<Project>('projects', 'accepted'))?.publishedReleaseId,
    ).toBeUndefined();
  });
  it('stops activation when offline arrives during a transform and does not overwrite the cancellation checkpoint', async () => {
    const job = await start();
    transform.mockImplementationOnce(async () => {
      await api('offline', {});
      return new Response(output, {
        headers: { 'Content-Type': 'image/webp', 'X-Source-Width': '4', 'X-Source-Height': '3' },
      });
    });
    await service.tick();
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('failed');
    expect(publish).not.toHaveBeenCalled();
    expect((await service.store.one<Project>('projects', 'accepted'))?.offline).toBe(true);
  });
  it('keeps the previous successful release live after permanent or exhausted preparation failure', async () => {
    const first = await start();
    expect((await finish(first)).status).toBe('succeeded');
    const previous = (await service.store.one<Release>('releases', String(first.input.releaseId)))!;
    previous.rendererVersion = 'old-renderer';
    await service.store.update('releases', previous).run();
    // A changed source identity creates cold candidates while retaining the previous public snapshot.
    for (const asset of await service.store.list<Asset>('assets')) {
      asset.sha256 = Buffer.from(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(asset.sha256 + 'changed')),
      ).toString('hex');
      await service.store.update('assets', asset).run();
    }
    transform.mockImplementation(async () => new Response('busy', { status: 503 }));
    const next = await start();
    expect((await finish(next)).status).toBe('failed');
    const current = (await service.store.one<Project>('projects', 'accepted'))!;
    expect(current.publishedReleaseId).toBe(previous.id);
    expect(current.offline).toBe(false);
    expect(publish).toHaveBeenCalledTimes(1);
  });
  it('reuses the R2 output if a checkpoint failed after the immutable write', async () => {
    const job = await start();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await env.DB.exec(
      `CREATE TRIGGER reject_variant_checkpoint BEFORE UPDATE ON releases WHEN EXISTS(SELECT 1 FROM json_each(NEW.data, '$.publicMedia.assets') WHERE json_array_length(json_extract(value,'$.variants'))>0) BEGIN SELECT RAISE(ABORT, 'checkpoint unavailable'); END`,
    );
    await service.tick();
    expect(transform).toHaveBeenCalledTimes(4);
    expect(log).toHaveBeenCalledWith(
      'Publication preparation failed',
      expect.objectContaining({
        stage: 'prepublication',
        jobId: job.id,
        releaseId: job.input.releaseId,
        errorClass: 'Error',
      }),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('checkpoint unavailable');
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('failed');
    expect(publish).not.toHaveBeenCalled();
    const firstUrl = transform.mock.calls[0][0];
    await env.DB.exec('DROP TRIGGER reject_variant_checkpoint');
    await api(`jobs/${job.id}/retry`, {});
    expect((await finish(job)).status).toBe('succeeded');
    expect(transform.mock.calls.filter((call) => call[0] === firstUrl).length).toBeGreaterThan(0);
    const variants = (await service.store.one<Release>('releases', String(job.input.releaseId)))!
      .publicMedia!;
    expect(transform).toHaveBeenCalledTimes(
      new Set(Object.values(variants.assets).flatMap((a) => a.variants.map((v) => v.key))).size,
    );
  });
  it('logs only safe prepublication ApiError diagnostics without secret-bearing error contents', async () => {
    const job = await start();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = Object.assign(new ApiError(503, 'pr_context_failed', 'secret-message'), {
      cause: new Error('secret-cause'),
      headers: { Authorization: 'secret-token' },
      body: 'secret-body',
    });
    vi.mocked(fetch).mockRejectedValueOnce(error);
    await service.tick();
    expect(log.mock.calls).toEqual([
      [
        'Publication preparation failed',
        {
          stage: 'prepublication',
          jobId: job.id,
          releaseId: job.input.releaseId,
          errorClass: 'ApiError',
          code: 'pr_context_failed',
          status: 503,
        },
      ],
    ]);
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('failed');
    expect(publish).not.toHaveBeenCalled();
  });

  it('omits unsafe diagnostic metadata instead of serializing it', async () => {
    const job = await start();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(publicMedia, 'preparePublicVariant').mockRejectedValue(
      Object.assign(new Error('secret-message'), {
        name: 'secret-name',
        code: { token: 'secret-token' },
        status: Infinity,
      }),
    );
    await service.tick();
    expect(log.mock.calls).toEqual([
      [
        'Publication preparation failed',
        {
          stage: 'prepublication',
          jobId: job.id,
          releaseId: job.input.releaseId,
          errorClass: 'Error',
        },
      ],
    ]);
  });

  it.each([
    [false, false],
    [true, true],
  ])(
    'does not log outside media preparation (preparation=%s, started=%s)',
    async (mediaPreparation, publicationStarted) => {
      const job = await start();
      job.input.mediaPreparation = mediaPreparation;
      job.input.publicationStarted = publicationStarted;
      await service.store.update('jobs', job).run();
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(
        new ApiError(503, 'pr_context_failed', 'secret-message'),
      );
      await service.tick();
      expect(log).not.toHaveBeenCalled();
    },
  );

  it('retries a timeout then continues from the completed checkpoint', async () => {
    const job = await start();
    transform.mockImplementationOnce(async () => {
      throw new DOMException('timed out', 'TimeoutError');
    });
    await service.tick();
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('queued');
    expect(publish).not.toHaveBeenCalled();
    transform.mockImplementation(async () => {
      return new Response(output, {
        headers: { 'Content-Type': 'image/webp', 'X-Source-Width': '4', 'X-Source-Height': '3' },
      });
    });
    expect((await finish(job)).status).toBe('succeeded');
  });

  it('finishes 250 transforms across 63 batches including a busy retry without spending the Pages attempt budget', async () => {
    const job = await start(),
      release = (await service.store.one<Release>('releases', String(job.input.releaseId)))!;
    release.publicMedia = { policy: publicMedia.publicMediaPolicy, ready: false, assets: {} };
    for (let i = 0; i < 84; i++) {
      const asset: Asset = {
        id: `batch-${i}`,
        projectId: project.id,
        key: `batch/${i}`,
        size: 10,
        contentType: 'image/png',
        sha256: String(i).padStart(64, '0'),
        filename: 'test.png',
        origin: 'test',
        createdAt: '',
      };
      await service.store.insert('assets', asset).run();
      release.publicMedia.assets[asset.id] = {
        sourceKey: asset.key,
        sourceIdentity: 'sha256:' + asset.sha256,
        widths: i === 83 ? [320] : [320, 640, 1280],
        variants: [],
      };
    }
    await service.store.update('releases', release).run();
    const completed = new Set<string>();
    let busy = true;
    vi.spyOn(publicMedia, 'preparePublicVariant').mockImplementation(
      async (_env, asset, _identity, width) => {
        if (completed.size === 60 && busy) {
          busy = false;
          throw new DomainError(503, 'public_media_retry', 'busy');
        }
        const key = asset.key + '/' + width;
        expect(completed.has(key)).toBe(false);
        completed.add(key);
        return {
          key,
          requestedWidth: width,
          width,
          height: width / 2,
          bytes: 10,
          sha256: 'b'.repeat(64),
          original: { width: 2560, height: 1280 },
        };
      },
    );
    let ticks = 0;
    for (; ticks < 80; ticks++) {
      const before = completed.size;
      await service.tick();
      expect(completed.size - before).toBeLessThanOrEqual(4);
      const current = (await service.store.one<Job>('jobs', job.id))!;
      if (current.status === 'succeeded') break;
      expect(current.status).toBe('queued');
      expect(current.attempts).toBe(0);
      expect(current.input.publicationStarted).toBeUndefined();
      expect(publish).not.toHaveBeenCalled();
    }
    expect(ticks + 1).toBe(63);
    expect(completed.size).toBe(250);
    expect(publish).toHaveBeenCalledTimes(1);
    expect((await service.store.one<Job>('jobs', job.id))?.attempts).toBe(1);
  });
  it('keeps the 40 MiB tick budget and orders each asset width before reusing native-size results', async () => {
    const job = await start();
    const release = (await service.store.one<Release>('releases', String(job.input.releaseId)))!;
    release.publicMedia = { policy: publicMedia.publicMediaPolicy, ready: false, assets: {} };
    const assets = (await service.store.list<Asset>('assets')).slice(0, 3);
    for (const asset of assets) {
      asset.size = 15 * 1024 * 1024;
      await service.store.update('assets', asset).run();
      release.publicMedia.assets[asset.id] = {
        sourceKey: asset.key,
        sourceIdentity: 'sha256:' + asset.sha256,
        widths: [320, 640, 1280],
        variants: [],
      };
    }
    await service.store.update('releases', release).run();
    const active = new Set<string>();
    let peak = 0;
    const prepare = vi
      .spyOn(publicMedia, 'preparePublicVariant')
      .mockImplementation(async (_env, asset, _identity, width) => {
        expect(active.has(asset.id)).toBe(false);
        active.add(asset.id);
        peak = Math.max(peak, active.size);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active.delete(asset.id);
        return {
          key: asset.key + '/' + width,
          requestedWidth: width,
          width: Math.min(width, 400),
          height: 200,
          bytes: 10,
          sha256: 'b'.repeat(64),
          original: { width: 400, height: 200 },
        };
      });
    for (let tick = 0; tick < 3; tick++) {
      const before = prepare.mock.calls.length;
      await service.tick();
      const bytes = prepare.mock.calls.slice(before).reduce((sum, call) => sum + call[1].size, 0);
      expect(bytes).toBe(30 * 1024 * 1024);
      if (tick < 2) expect(publish).not.toHaveBeenCalled();
    }
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('succeeded');
    expect(peak).toBe(2);
    const prepared = (await service.store.one<Release>('releases', release.id))!.publicMedia!;
    for (const asset of assets) {
      expect(
        prepare.mock.calls.filter((call) => call[1].id === asset.id).map((call) => call[3]),
      ).toEqual([320, 640]);
      const variants = prepared.assets[asset.id].variants;
      expect(variants.map((variant) => variant.requestedWidth)).toEqual([320, 640, 1280]);
      expect(variants[2].key).toBe(variants[1].key);
    }
  });

  it('overlaps four distinct assets, settles the wave before checkpointing, and preserves mixed successes on retry', async () => {
    const job = await start();
    const calls: {
      asset: Asset;
      width: number;
      resolve: () => void;
      reject: (error: Error) => void;
    }[] = [];
    let unblock = false;
    const result = (asset: Asset, width: number) => ({
      key: asset.key + '/' + width,
      requestedWidth: width,
      width: 4,
      height: 3,
      bytes: 10,
      sha256: 'b'.repeat(64),
      original: { width: 4, height: 3 },
    });
    const prepare = vi
      .spyOn(publicMedia, 'preparePublicVariant')
      .mockImplementation(async (_env, asset, _identity, width) => {
        if (unblock) return result(asset, width);
        return new Promise((resolve, reject) =>
          calls.push({ asset, width, resolve: () => resolve(result(asset, width)), reject }),
        );
      });
    let finished = false;
    const running = service.tick().then(() => {
      finished = true;
    });
    try {
      await vi.waitFor(() => expect(calls).toHaveLength(4), { timeout: 500 });
      expect(new Set(calls.map((c) => c.asset.id)).size).toBe(4);
      calls[0].resolve();
      calls[1].reject(new DomainError(503, 'public_media_retry', 'busy'));
      await Promise.resolve();
      await Promise.resolve();
      expect(finished).toBe(false);
      const during = (await service.store.one<Release>('releases', String(job.input.releaseId)))!;
      expect(Object.values(during.publicMedia!.assets).flatMap((a) => a.variants)).toHaveLength(0);
    } finally {
      unblock = true;
      calls.forEach((call) => call.resolve());
      await running;
    }
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('queued');
    const checkpoint = (await service.store.one<Release>('releases', String(job.input.releaseId)))!;
    expect(Object.values(checkpoint.publicMedia!.assets).flatMap((a) => a.variants)).toHaveLength(
      3,
    );
    expect(publish).not.toHaveBeenCalled();
    expect((await finish(job)).status).toBe('succeeded');
    for (const call of [calls[0], calls[2], calls[3]])
      expect(prepare.mock.calls.filter((c) => c[1].id === call.asset.id)).toHaveLength(1);
  });

  it('waits for the complete in-flight wave after offline cancellation without persisting or activating its successes', async () => {
    const job = await start();
    let unblock = false;
    const pending: (() => void)[] = [];
    vi.spyOn(publicMedia, 'preparePublicVariant').mockImplementation(
      async (_env, asset, _identity, width) => {
        if (!unblock) await new Promise<void>((resolve) => pending.push(resolve));
        return {
          key: asset.key + '/' + width,
          requestedWidth: width,
          width: 4,
          height: 3,
          bytes: 10,
          sha256: 'b'.repeat(64),
          original: { width: 4, height: 3 },
        };
      },
    );
    let finished = false;
    const running = service.tick().then(() => {
      finished = true;
    });
    try {
      await vi.waitFor(() => expect(pending).toHaveLength(4), { timeout: 500 });
      await api('offline', {});
      pending[0]();
      await Promise.resolve();
      expect(finished).toBe(false);
    } finally {
      unblock = true;
      pending.forEach((resolve) => resolve());
      await running;
    }
    expect((await service.store.one<Job>('jobs', job.id))?.status).toBe('failed');
    const release = (await service.store.one<Release>('releases', String(job.input.releaseId)))!;
    expect(Object.values(release.publicMedia!.assets).flatMap((a) => a.variants)).toHaveLength(0);
    expect(release.publicMedia!.ready).toBe(false);
    expect(publish).not.toHaveBeenCalled();
  });
});
