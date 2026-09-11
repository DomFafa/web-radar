import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { DomainService } from '../src/worker/domain-service';
import { defaultDraft } from '../src/worker/domain';
import { ProviderError, type ProviderSet } from '../src/worker/provider-contract';
import type { AppEnv } from '../src/worker/env';
import type { Principal, Job, Project } from '../src/shared/model';

const sourceState = vi.hoisted(() => ({ version: 'v1', revoked: false, failureStatus: 403 }));
vi.mock('../src/worker/product-radar', () => ({
  prService: async (_e: unknown, p: Principal, path: string, body: { productIds?: string[] }) =>
    path === 'context'
      ? sourceState.revoked
        ? Promise.reject(
            Object.assign(new Error('Permission revoked'), { status: sourceState.failureStatus }),
          )
        : { principal: p }
      : {
          products: (body.productIds ?? []).map((id) => ({
            source: 'product-radar',
            id,
            sourceProjectId: 'source',
            workflow: 'build',
            version: sourceState.version,
            name: `Product ${id}`,
            description: 'Snapshot',
            material: 'Wood',
            dimensions: '',
            seriesName: '',
            designDirection: '',
            conditions: { keep: ['shape'] },
            image: { sourceProductId: id, contentType: 'image/png' },
            factsOrigin: 'generated-concept',
          })),
          total: body.productIds?.length ?? 0,
        },
  prImage: async () =>
    new Response(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]), {
      headers: { 'content-type': 'image/png' },
    }),
}));
const owner: Principal = {
  userId: 'owner',
  authSubject: 'owner',
  email: 'owner@example.com',
  displayName: 'Owner',
  systemRole: 'user',
  workspaceId: 'workspace',
  workspaceRole: 'member',
  workspaceName: 'Test',
};
const admin: Principal = { ...owner, userId: 'admin', workspaceRole: 'admin' };
const platform: Principal = { ...owner, userId: 'platform', systemRole: 'super_admin' };
function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync('migrations/0002_business.sql', 'utf8'));
  db.exec(readFileSync('migrations/0003_source_reviews.sql', 'utf8'));
  class Statement {
    values: unknown[] = [];
    constructor(readonly sql: string) {}
    bind(...values: unknown[]) {
      this.values = values;
      return this;
    }
    async first(column?: string) {
      const row = db.prepare(this.sql).get(...(this.values as never[])) ?? null;
      return column && row ? row[column] : row;
    }
    async all() {
      return {
        success: true,
        results: db.prepare(this.sql).all(...(this.values as never[])),
        meta: {},
      };
    }
    async run() {
      const result = db.prepare(this.sql).run(...(this.values as never[]));
      return {
        success: true,
        results: [],
        meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) },
      };
    }
    async raw() {
      return db
        .prepare(this.sql)
        .all(...(this.values as never[]))
        .map(Object.values);
    }
  }
  return {
    prepare: (sql: string) => new Statement(sql),
    exec: async (sql: string) => {
      db.exec(sql);
      return { count: 1, duration: 0 };
    },
    batch: async (statements: Statement[]) => {
      db.exec('BEGIN IMMEDIATE');
      try {
        const results = [];
        for (const s of statements) results.push(await s.run());
        db.exec('COMMIT');
        return results;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
function mediaBucket() {
  type Options = {
    httpMetadata?: { contentType?: string };
    customMetadata?: Record<string, string>;
  };
  const objects = new Map<
    string,
    { bytes: Uint8Array; contentType: string; customMetadata?: Record<string, string> }
  >();
  const store = (key: string, bytes: Uint8Array, options?: Options) => {
    objects.set(key, {
      bytes,
      contentType: options?.httpMetadata?.contentType ?? '',
      customMetadata: options?.customMetadata,
    });
    return { key, size: bytes.length };
  };
  return {
    objects,
    async put(key: string, body: BodyInit, options?: Options) {
      return store(key, new Uint8Array(await new Response(body).arrayBuffer()), options);
    },
    async createMultipartUpload(key: string, options?: Options) {
      const parts = new Map<number, Uint8Array>();
      return {
        async uploadPart(number: number, body: BodyInit) {
          parts.set(number, new Uint8Array(await new Response(body).arrayBuffer()));
          return { partNumber: number, etag: String(number) };
        },
        async complete() {
          const bytes = new Uint8Array([...parts.values()].reduce((n, p) => n + p.length, 0));
          let offset = 0;
          for (const p of parts.values()) {
            bytes.set(p, offset);
            offset += p.length;
          }
          return store(key, bytes, options);
        },
        async abort() {
          parts.clear();
        },
      };
    },
    async delete(key: string) {
      objects.delete(key);
    },
    async head(key: string) {
      const o = objects.get(key);
      return o
        ? {
            size: o.bytes.length,
            httpMetadata: { contentType: o.contentType },
            customMetadata: o.customMetadata,
          }
        : null;
    },
    async get(
      key: string,
      options?: { range?: { offset?: number; length?: number; suffix?: number } },
    ) {
      const o = objects.get(key);
      if (!o) return null;
      const r = options?.range;
      const offset = r?.suffix ? Math.max(0, o.bytes.length - r.suffix) : (r?.offset ?? 0);
      const bytes = o.bytes.slice(offset, r?.length ? offset + r.length : undefined);
      return {
        body: new Response(bytes).body,
        size: o.bytes.length,
        httpMetadata: { contentType: o.contentType },
        range: r ? { offset, length: bytes.length } : undefined,
        writeHttpMetadata(h: Headers) {
          h.set('content-type', o.contentType);
        },
      };
    },
  };
}
function providerSet(): ProviderSet {
  return {
    status: () => [],
    resolveHostingTarget: async (id, current) =>
      current ?? { accountId: 'LOCAL_TEST', pagesProjectName: `wr-${id}` },
    script: async () => ({
      script: 'Real direction based on inputs',
      scenes: [1, 2, 3].map((i) => ({ id: `s${i}`, description: `Scene ${i}`, revision: 1 })),
    }),
    copy: async () => ({
      en: { headline: 'Headline', subtitle: 'Subtitle', about: 'About', cta: 'Contact' },
    }),
    image: async () => ({
      body: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]),
      contentType: 'image/png',
      filename: 'scene.png',
      testMode: true,
    }),
    submitVideo: async () => ({ videoId: 'upstream' }),
    pollVideo: async () => ({
      state: 'succeeded',
      media: {
        body: new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109]),
        contentType: 'video/mp4',
        filename: 'hero.mp4',
        testMode: true,
      },
    }),
    publish: async (id, releaseId) => ({
      deploymentId: releaseId,
      url: `https://${id}.pages.dev`,
      testMode: true,
    }),
    email: async () => ({ id: 'mail', testMode: true }),
  };
}
let service: DomainService,
  providers: ProviderSet,
  env: AppEnv,
  bucket: ReturnType<typeof mediaBucket>;
async function request(path: string, body?: unknown, principal = owner, method?: string) {
  const r = await service.fetch(
    new Request(`http://localhost${path}`, {
      method: method ?? (body === undefined ? 'GET' : 'POST'),
      headers: { 'content-type': 'application/json', 'X-WR-Principal': JSON.stringify(principal) },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  return { status: r.status, data: (await r.json()) as Record<string, any> };
}
async function create(name = 'Site') {
  return (await request('/api/projects', { name, requestId: crypto.randomUUID() })).data
    .project as Project;
}
async function quota(who = owner, images = 5, videos = 5) {
  return request(
    `/api/admin/quotas/${who.userId}`,
    { imageLimit: images, videoLimit: videos },
    platform,
    'PUT',
  );
}
async function get(p: Project) {
  return (await request(`/api/projects/${p.id}`)).data;
}
async function scriptReady() {
  let p = await create();
  p.draft.products = [
    { id: 'p1', name: 'Toy', description: 'Toy', material: 'Wood', dimensions: '' },
  ];
  p.draft.primaryProductId = 'p1';
  p = (
    await request(
      `/api/projects/${p.id}`,
      { expectedVersion: p.version, draft: p.draft },
      owner,
      'PUT',
    )
  ).data.project;
  await request(`/api/projects/${p.id}/jobs`, {
    expectedVersion: p.version,
    requestId: crypto.randomUUID(),
    kind: 'script',
  });
  await service.tick();
  p = (await get(p)).project;
  p = (await request(`/api/projects/${p.id}/confirm-script`, { expectedVersion: p.version })).data
    .project;
  return p;
}
async function videoReady() {
  let p = await scriptReady();
  await quota();
  await request(`/api/projects/${p.id}/jobs`, {
    expectedVersion: p.version,
    requestId: crypto.randomUUID(),
    kind: 'image',
  });
  for (let i = 0; i < 3; i++) await service.tick();
  p = (await get(p)).project;
  p = (await request(`/api/projects/${p.id}/confirm-storyboard`, { expectedVersion: p.version }))
    .data.project;
  return p;
}

beforeEach(() => {
  sourceState.version = 'v1';
  sourceState.revoked = false;
  sourceState.failureStatus = 403;
  bucket = mediaBucket();
  env = {
    DB: database(),
    MEDIA: bucket,
    ENVIRONMENT: 'test',
    TEST_PROVIDERS: 'true',
    APP_ORIGIN: 'http://localhost',
  } as unknown as AppEnv;
  providers = providerSet();
  service = new DomainService(env, { schedule: async () => {} }, providers);
});

describe('durable domain commands', () => {
  it('idempotently creates same project and rejects changed payload', async () => {
    const body = { name: 'Site', requestId: 'request-create-1' };
    const a = await request('/api/projects', body),
      b = await request('/api/projects', body);
    expect(a.status).toBe(200);
    expect(b.data.project.id).toBe(a.data.project.id);
    expect((await request('/api/projects', { ...body, name: 'Other' })).status).toBe(409);
  });
  it('allows current admin but prevents member and cross-workspace asset reads', async () => {
    const p = await create();
    expect(
      (await request(`/api/projects/${p.id}`, undefined, { ...owner, userId: 'member' })).status,
    ).toBe(404);
    expect((await request(`/api/projects/${p.id}`, undefined, admin)).status).toBe(200);
    expect(
      (await request(`/api/projects/${p.id}`, undefined, { ...admin, workspaceId: 'elsewhere' }))
        .status,
    ).toBe(404);
  });
  it('serializes concurrent saves with one visible version conflict', async () => {
    const p = await create();
    const results = await Promise.all([
      request(
        `/api/projects/${p.id}`,
        { expectedVersion: 1, draft: { ...p.draft, direction: 'a' } },
        owner,
        'PUT',
      ),
      request(
        `/api/projects/${p.id}`,
        { expectedVersion: 1, draft: { ...p.draft, direction: 'b' } },
        owner,
        'PUT',
      ),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect((await get(p)).project.version).toBe(2);
  });
  it('copies source bytes before completing an imported draft and deduplicates internal handoff', async () => {
    const products = (await request('/api/source-products')).data.products;
    expect(products).toEqual([]);
    const p = await create();
    const result = await request(`/api/projects/${p.id}/import`, {
      expectedVersion: 1,
      productIds: ['source-1'],
    });
    expect(result.status).toBe(200);
    expect(result.data.project.draft.products[0].source.conditions.keep).toEqual(['shape']);
    expect(bucket.objects.size).toBe(1);
    const assets = (await get(p)).assets;
    expect(assets[0].origin).toBe('import');
    expect(
      (
        await service.fetch(
          new Request(`http://localhost/api/projects/${p.id}/assets/${assets[0].id}`, {
            headers: { 'X-WR-Principal': JSON.stringify(owner), Range: 'bytes=0-3' },
          }),
        )
      ).status,
    ).toBe(206);
  });
  it('reserves each image atomically for its initiating administrator and releases only failed image', async () => {
    const p = await scriptReady();
    await quota(admin, 3, 0);
    const result = await request(
      `/api/projects/${p.id}/jobs`,
      { expectedVersion: p.version, requestId: 'images-1', kind: 'image' },
      admin,
    );
    expect(result.status).toBe(200);
    let n = 0;
    providers.image = async () => {
      if (++n === 2) throw new ProviderError('technical_failure', 'Image provider failed');
      return {
        body: new Uint8Array([1, 2, 3]),
        contentType: 'image/png',
        filename: 'test.png',
        testMode: true,
      };
    };
    await service.tick();
    await service.tick();
    await service.tick();
    const q = (await request('/api/admin', undefined, platform)).data.quotas.find(
      (q: any) => q.userId === admin.userId,
    );
    expect(q).toMatchObject({ imageUsed: 2, imageReserved: 0 });
    const detail = await get(p);
    expect(
      detail.jobs.filter((j: Job) => j.kind === 'image' && j.status === 'succeeded'),
    ).toHaveLength(2);
    expect(detail.quota.imageUsed).toBe(0);
  });
  it('does not over-reserve under simultaneous submissions and never double-charges retry', async () => {
    const p = await scriptReady();
    await quota(owner, 1, 0);
    const body = {
      expectedVersion: p.version,
      requestId: 'one-image',
      kind: 'image',
      sceneId: 's1',
    };
    const [a, b, c] = await Promise.all([
      request(`/api/projects/${p.id}/jobs`, body),
      request(`/api/projects/${p.id}/jobs`, body),
      request(`/api/projects/${p.id}/jobs`, { ...body, requestId: 'second-image', sceneId: 's2' }),
    ]);
    expect([a.status, b.status, c.status]).toEqual([200, 200, 409]);
    expect(a.data.job.id).toBe(b.data.job.id);
    await service.tick();
    await request(`/api/projects/${p.id}/jobs/${a.data.job.id}/retry`, {});
    expect((await get(p)).quota).toMatchObject({ imageUsed: 1, imageReserved: 0 });
  });
  it('retains global video slot and reservation for unknown submit and refuses blind retry', async () => {
    const p = await videoReady();
    providers.submitVideo = async () => {
      throw new ProviderError('submission_unknown', 'Submission outcome unknown', true);
    };
    const job = (
      await request(`/api/projects/${p.id}/jobs`, {
        expectedVersion: p.version,
        requestId: 'video-1',
        kind: 'video',
      })
    ).data.job;
    await service.tick();
    expect((await get(p)).jobs.find((j: Job) => j.id === job.id).status).toBe('unknown');
    expect((await get(p)).quota).toMatchObject({ videoUsed: 0, videoReserved: 1 });
    expect((await request(`/api/projects/${p.id}/jobs/${job.id}/retry`, {})).status).toBe(409);
    let submissions = 0;
    providers.submitVideo = async () => {
      submissions++;
      return { videoId: 'another' };
    };
    await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'video-2',
      kind: 'video',
    });
    await service.tick();
    expect(submissions).toBe(0);
  });
  it('resumes a stored upstream task after service restart and commits only saved deliverable', async () => {
    const p = await videoReady();
    const job = (
      await request(`/api/projects/${p.id}/jobs`, {
        expectedVersion: p.version,
        requestId: 'video-recover',
        kind: 'video',
      })
    ).data.job;
    await service.tick();
    expect((await get(p)).jobs.find((j: Job) => j.id === job.id).upstreamId).toBe('upstream');
    service = new DomainService(env, { schedule: async () => {} }, providers);
    providers.submitVideo = async () => {
      throw new Error('must not submit twice');
    };
    await service.tick();
    const detail = await get(p);
    expect(detail.jobs.find((j: Job) => j.id === job.id)).toMatchObject({ status: 'succeeded' });
    expect(detail.quota).toMatchObject({ videoUsed: 1, videoReserved: 0 });
    expect(bucket.objects.size).toBe(4);
  });
  it('does not mark generation deliverable when R2 persistence fails', async () => {
    const p = await scriptReady();
    await quota();
    await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'broken-r2',
      kind: 'image',
      sceneId: 's1',
    });
    bucket.put = async () => {
      throw new Error('storage failed');
    };
    await service.tick();
    const detail = await get(p);
    expect(detail.jobs.find((j: Job) => j.requestId === 'broken-r2').status).toBe('failed');
    expect(detail.quota).toMatchObject({ imageUsed: 0, imageReserved: 0 });
  });
  it('retains generated result without overwriting a newer edited storyboard', async () => {
    let p = await scriptReady();
    await quota();
    const result = await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'stale',
      kind: 'image',
      sceneId: 's1',
    });
    p.draft.scenes[0].description = 'My new scene';
    await request(
      `/api/projects/${p.id}`,
      { expectedVersion: p.version, draft: p.draft },
      owner,
      'PUT',
    );
    await service.tick();
    const detail = await get(p);
    expect(detail.project.draft.scenes[0].description).toBe('My new scene');
    expect(detail.project.draft.scenes[0].imageAssetId).toBeUndefined();
    expect(detail.jobs.find((j: Job) => j.id === result.data.job.id).resultAssetId).toBeTruthy();
    expect(detail.quota.imageUsed).toBe(1);
  });
});

async function uploadAsset(project: Project, type = 'image/png') {
  const bytes =
    type === 'image/png'
      ? new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1])
      : new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109, 0]);
  const form = new FormData();
  form.append(
    'file',
    new File([bytes], type === 'image/png' ? 'product.png' : 'hero.mp4', { type }),
  );
  const response = await service.fetch(
    new Request(`http://localhost/api/projects/${project.id}/uploads`, {
      method: 'POST',
      headers: { 'X-WR-Principal': JSON.stringify(owner) },
      body: form,
    }),
  );
  expect(response.status).toBe(200);
  return ((await response.json()) as { asset: { id: string } }).asset;
}
async function publishable() {
  let p = await create();
  const image = await uploadAsset(p),
    video = await uploadAsset(p, 'video/mp4');
  const d = p.draft;
  d.company = {
    ...d.company,
    name: 'Confirmed Company',
    contactName: 'Jane',
    email: 'sales@example.com',
  };
  d.country = 'Germany';
  d.products = [
    {
      id: 'p1',
      name: 'Wooden toy',
      description: 'Provided description',
      material: 'Wood',
      dimensions: '',
      imageAssetId: image.id,
    },
  ];
  d.primaryProductId = 'p1';
  d.copy = {
    en: {
      headline: 'Original headline',
      subtitle: 'Supplied facts',
      about: 'Actual company',
      cta: 'Contact us',
    },
  };
  p = (
    await request(`/api/projects/${p.id}`, { expectedVersion: p.version, draft: d }, owner, 'PUT')
  ).data.project;
  p = (
    await request(`/api/projects/${p.id}/accept-video`, {
      expectedVersion: p.version,
      assetId: video.id,
    })
  ).data.project;
  return p;
}
async function publishNow(p: Project) {
  const response = await request(`/api/projects/${p.id}/publish`, {
    expectedVersion: p.version,
    requestId: crypto.randomUUID(),
  });
  expect(response.status).toBe(200);
  await service.tick();
  return (await get(p)).project as Project;
}

describe('publications, delivery and scheduler boundaries', () => {
  it('does not schedule repeated alarms for an empty queue or an unknown-only queue', async () => {
    const schedule = vi.fn(async () => {});
    service = new DomainService(env, { schedule }, providers);
    await service.tick();
    expect(schedule).not.toHaveBeenCalled();
    const p = await videoReady();
    providers.submitVideo = async () => {
      throw new ProviderError('submission_unknown', 'Unknown', true);
    };
    await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'unknown-idle',
      kind: 'video',
    });
    await service.tick();
    schedule.mockClear();
    await service.tick();
    expect(schedule).not.toHaveBeenCalled();
  });
  it('allows only platform reconciliation to bind an original video ID and never resubmits', async () => {
    const p = await videoReady();
    providers.submitVideo = async () => {
      throw new ProviderError('submission_unknown', 'Unknown', true);
    };
    const { data } = await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'reconcile-one',
      kind: 'video',
    });
    await service.tick();
    expect(
      (
        await request(
          `/api/admin/jobs/${data.job.id}/reconcile`,
          { upstreamId: 'original-task' },
          admin,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await request(
          `/api/admin/jobs/${data.job.id}/reconcile`,
          { confirmedFailed: true },
          platform,
        )
      ).status,
    ).toBe(400);
    const reconciled = await request(
      `/api/admin/jobs/${data.job.id}/reconcile`,
      { upstreamId: 'original-task' },
      platform,
    );
    expect(reconciled.status).toBe(200);
    expect(reconciled.data.job.input.reconciliation.userId).toBe(platform.userId);
    providers.submitVideo = async () => {
      throw new Error('cannot resubmit');
    };
    await service.tick();
    expect((await get(p)).quota.videoUsed).toBe(1);
  });
  it('publishes immutable content, preserves prior success on failure and keeps drafts on restore', async () => {
    let p = await publishable();
    p = await publishNow(p);
    const first = p.publishedReleaseId;
    expect(first).toBeTruthy();
    p.draft.copy.en!.headline = 'New draft headline';
    p = (
      await request(
        `/api/projects/${p.id}`,
        { expectedVersion: p.version, draft: p.draft },
        owner,
        'PUT',
      )
    ).data.project;
    const publicRequest = () =>
      service.fetch(new Request(`http://localhost/public/sites/${p.id}/en/index.html`));
    expect(await (await publicRequest()).text()).toContain('Original headline');
    providers.publish = async () => {
      throw new ProviderError('provider_failed', 'Publish failed');
    };
    const failed = await request(`/api/projects/${p.id}/publish`, {
      expectedVersion: p.version,
      requestId: 'publish-failure',
    });
    await service.tick();
    expect((await get(p)).project.publishedReleaseId).toBe(first);
    expect((await get(p)).jobs.find((j: Job) => j.id === failed.data.job.id).status).toBe('failed');
    providers.publish = providerSet().publish;
    p = await publishNow((await get(p)).project);
    expect(await (await publicRequest()).text()).toContain('New draft headline');
    const draftBefore = JSON.stringify(p.draft);
    await request(`/api/projects/${p.id}/restore`, { requestId: 'restore-release' });
    await service.tick();
    p = (await get(p)).project;
    expect(JSON.stringify(p.draft)).toBe(draftBefore);
    expect(await (await publicRequest()).text()).toContain('Original headline');
  });
  it('recovers pending Pages deployment with the same release marker before activation', async () => {
    const p = await publishable();
    let calls = 0;
    const releases: string[] = [];
    providers.publish = async (id, release) => {
      releases.push(release);
      if (++calls === 1) throw new ProviderError('pages_deployment_pending', 'Pending', true);
      return { deploymentId: release, url: `https://${id}.pages.dev`, testMode: true };
    };
    const result = await request(`/api/projects/${p.id}/publish`, {
      expectedVersion: p.version,
      requestId: 'pending-pages',
    });
    await service.tick();
    expect((await get(p)).releases[0].status).toBe('pending');
    await service.tick();
    expect(releases).toHaveLength(2);
    expect(new Set(releases).size).toBe(1);
    expect((await get(p)).jobs.find((j: Job) => j.id === result.data.job.id).status).toBe(
      'succeeded',
    );
  });
  it('offline blocks every public page, approved asset and inquiry while retaining private project', async () => {
    let p = await publishable();
    p = await publishNow(p);
    await request(`/api/projects/${p.id}/offline`, {});
    expect(
      (
        await service.fetch(
          new Request(`http://localhost/public/sites/${p.id}/en/about/index.html`),
        )
      ).status,
    ).toBe(503);
    expect(
      (
        await service.fetch(
          new Request(`http://localhost/public/sites/${p.id}/assets/${p.draft.heroAssetId}`),
        )
      ).status,
    ).toBe(503);
    expect(
      (
        await request(`/api/public/sites/${p.id}/inquiries`, {
          requestId: 'offline-inquiry',
          name: 'Buyer',
          email: 'buyer@example.com',
          company: '',
          message: 'Hello',
        })
      ).status,
    ).toBe(409);
    expect((await get(p)).project.publishedReleaseId).toBeTruthy();
  });
  it('stores and deduplicates inquiries before email, uses trusted recipient and bounds retries', async () => {
    let p = await publishable();
    p = await publishNow(p);
    const body = {
      requestId: 'buyer-message',
      name: 'Buyer',
      email: 'buyer@example.com',
      company: 'Buyer Co',
      message: 'Please quote.',
      productId: 'p1',
      recipient: 'attacker@example.com',
    };
    const a = await request(`/api/public/sites/${p.id}/inquiries`, body),
      b = await request(`/api/public/sites/${p.id}/inquiries`, body);
    expect(a.data.id).toBe(b.data.id);
    let attempts = 0;
    providers.email = async (_inquiry, recipient) => {
      expect(recipient).toBe('sales@example.com');
      attempts++;
      throw new ProviderError('mail_failed', 'Delivery failed');
    };
    await service.tick();
    let list = await request(`/api/projects/${p.id}/inquiries`);
    expect(list.data.inquiries).toHaveLength(1);
    expect(list.data.inquiries[0]).toMatchObject({ emailStatus: 'failed', emailAttempts: 1 });
    await request(`/api/projects/${p.id}/inquiries/${a.data.id}/retry`, {});
    await service.tick();
    await request(`/api/projects/${p.id}/inquiries/${a.data.id}/retry`, {});
    await service.tick();
    expect(attempts).toBe(3);
    expect((await request(`/api/projects/${p.id}/inquiries/${a.data.id}/retry`, {})).status).toBe(
      409,
    );
    expect(
      (await request(`/api/public/sites/${p.id}/inquiries`, { ...body, message: 'changed' }))
        .status,
    ).toBe(409);
  });
  it('never exposes draft-only assets through the published endpoint', async () => {
    let p = await publishable();
    p = await publishNow(p);
    const privateAsset = await uploadAsset(p);
    expect(
      (
        await service.fetch(
          new Request(`http://localhost/public/sites/${p.id}/assets/${privateAsset.id}`),
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await service.fetch(
          new Request(`http://localhost/api/projects/${p.id}/assets/${privateAsset.id}`),
        )
      ).status,
    ).toBe(401);
  });
});

describe('review and recovery races', () => {
  it('requires re-review when upstream snapshot changes between source-check and source-apply', async () => {
    let p = await create();
    p = (
      await request(`/api/projects/${p.id}/import`, {
        expectedVersion: p.version,
        productIds: ['source-1'],
      })
    ).data.project;
    sourceState.version = 'v2';
    const changes = await request(`/api/projects/${p.id}/source-check`, {});
    expect(changes.data.changes[0].after.version).toBe('v2');
    sourceState.version = 'v3';
    expect(
      (
        await request(`/api/projects/${p.id}/source-apply`, {
          expectedVersion: p.version,
          productIds: ['source-1'],
        })
      ).status,
    ).toBe(409);
    await request(`/api/projects/${p.id}/source-check`, {});
    const applied = await request(`/api/projects/${p.id}/source-apply`, {
      expectedVersion: p.version,
      productIds: ['source-1'],
    });
    expect(applied.data.project.draft.products[0].source.version).toBe('v3');
  });
  it('releases reserved video quota when authorization fails before upstream submission', async () => {
    const p = await videoReady();
    let submitted = 0;
    providers.submitVideo = async () => {
      submitted++;
      return { videoId: 'never' };
    };
    await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'revoked-video',
      kind: 'video',
    });
    sourceState.revoked = true;
    await service.tick();
    expect(submitted).toBe(0);
    expect((await get(p)).quota.videoReserved).toBe(0);
    expect((await get(p)).jobs.find((j: Job) => j.requestId === 'revoked-video').status).toBe(
      'failed',
    );
  });
  it('uses a fresh upstream attempt only after a confirmed terminal video failure', async () => {
    const p = await videoReady();
    let submissions = 0;
    const keys: string[] = [];
    providers.submitVideo = async (_d, _refs, key) => {
      keys.push(key);
      return { videoId: `attempt-${++submissions}` };
    };
    providers.pollVideo = async (id) =>
      id === 'attempt-1'
        ? { state: 'failed', message: 'Technical failure' }
        : providerSet().pollVideo(id);
    const job = (
      await request(`/api/projects/${p.id}/jobs`, {
        expectedVersion: p.version,
        requestId: 'terminal-retry',
        kind: 'video',
      })
    ).data.job;
    await service.tick();
    await service.tick();
    expect((await get(p)).quota.videoReserved).toBe(0);
    await request(`/api/projects/${p.id}/jobs/${job.id}/retry`, {}, admin);
    await service.tick();
    await service.tick();
    expect(submissions).toBe(2);
    expect(new Set(keys).size).toBe(2);
    expect((await get(p)).quota).toMatchObject({ videoUsed: 1, videoReserved: 0 });
  });
  it('schedules a future alarm for a known upstream task before its next poll is due', async () => {
    const p = await videoReady();
    await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'future-poll',
      kind: 'video',
    });
    await service.tick();
    env.ENVIRONMENT = 'production';
    const schedule = vi.fn(async (_time: number) => {});
    let polls = 0;
    providers.pollVideo = async () => {
      polls++;
      return { state: 'pending' };
    };
    service = new DomainService(env, { schedule }, providers);
    await service.tick();
    expect(polls).toBe(0);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(schedule.mock.calls[0][0]).toBeGreaterThan(Date.now());
  });
});

it('streams unknown-length imports through bounded multipart uploads instead of R2.put', async () => {
  const p = await create();
  bucket.put = async (_key, body) => {
    if (body instanceof ReadableStream) throw new TypeError('R2 requires known length');
    return { key: _key, size: 1 };
  };
  const imported = await request(`/api/projects/${p.id}/import`, {
    expectedVersion: p.version,
    productIds: ['source-1'],
  });
  expect(imported.status).toBe(200);
  expect(bucket.objects.size).toBe(1);
});
it('renders product detail pages and accepts the frontend detail preview query', async () => {
  let p = await publishable();
  const preview = await request(`/api/projects/${p.id}/preview?page=detail&productId=p1`);
  expect(preview.status).toBe(200);
  expect(preview.data.html).toContain('class="detail wrap"');
  p = await publishNow(p);
  const page = await service.fetch(
    new Request(`http://localhost/public/sites/${p.id}/en/products/p1/index.html`),
  );
  expect(await page.text()).toContain('class="detail wrap"');
});
it('keeps expired ambiguous mail delivery unknown and blocks every retry path', async () => {
  let p = await publishable();
  p = await publishNow(p);
  const submitted = await request(`/api/public/sites/${p.id}/inquiries`, {
    requestId: 'expired-mail',
    name: 'Buyer',
    email: 'buyer@example.com',
    company: '',
    message: 'Hello',
  });
  const job = (await get(p)).jobs.find((j: Job) => j.kind === 'email');
  job.status = 'running';
  job.attempts = 1;
  job.createdAt = new Date(Date.now() - 25 * 3600000).toISOString();
  await service.store.update('jobs', job).run();
  const inquiry = await service.store.one<any>('inquiries', submitted.data.id);
  inquiry.createdAt = job.createdAt;
  inquiry.emailStatus = 'queued';
  await service.store.update('inquiries', inquiry).run();
  service = new DomainService(env, { schedule: async () => {} }, providers);
  await service.tick();
  expect((await request(`/api/projects/${p.id}/inquiries`)).data.inquiries[0].emailStatus).toBe(
    'unknown',
  );
  expect((await request(`/api/projects/${p.id}/inquiries/${inquiry.id}/retry`, {})).status).toBe(
    409,
  );
});

it('scopes provider asset grants, rejects tampering and supports provider HEAD probes', async () => {
  let p = await publishable();
  await request(`/api/projects/${p.id}/jobs`, {
    expectedVersion: p.version,
    requestId: 'signed-script',
    kind: 'script',
  });
  await service.tick();
  p = (await get(p)).project;
  p = (await request(`/api/projects/${p.id}/confirm-script`, { expectedVersion: p.version })).data
    .project;
  await quota();
  let reference = '';
  providers.image = async (d, s, i, refs) => {
    reference = refs[0];
    return providerSet().image(d, s, i, refs);
  };
  await request(`/api/projects/${p.id}/jobs`, {
    expectedVersion: p.version,
    requestId: 'signed-image',
    kind: 'image',
    sceneId: 's1',
  });
  await service.tick();
  expect(reference).toContain('/public/provider-assets/');
  expect((await service.fetch(new Request(reference))).status).toBe(200);
  const head = await service.fetch(new Request(reference, { method: 'HEAD' }));
  expect(head.status).toBe(200);
  expect(await head.text()).toBe('');
  const forged = new URL(reference);
  forged.searchParams.set('token', '0'.repeat(64));
  expect((await service.fetch(new Request(forged))).status).toBe(403);
  forged.searchParams.set('expires', '0');
  expect((await service.fetch(new Request(forged))).status).toBe(403);
});
it('recovers already persisted generated image after a crash before D1 finalization', async () => {
  const p = await scriptReady();
  await quota();
  const job = (
    await request(`/api/projects/${p.id}/jobs`, {
      expectedVersion: p.version,
      requestId: 'saved-before-crash',
      kind: 'image',
      sceneId: 's1',
    })
  ).data.job;
  job.status = 'running';
  job.attempts = 1;
  await service.store.update('jobs', job).run();
  const key = `projects/${p.id}/assets/result-${job.id}`;
  await bucket.put(key, new Uint8Array([137, 80, 78, 71]), {
    httpMetadata: { contentType: 'image/png' },
    customMetadata: { filename: 'saved.png', origin: 'test', createdAt: job.createdAt },
  });
  service = new DomainService(env, { schedule: async () => {} }, providers);
  providers.image = async () => {
    throw Error('must not generate again');
  };
  await service.tick();
  const detail = await get(p);
  expect(detail.jobs.find((j: Job) => j.id === job.id)).toMatchObject({
    status: 'succeeded',
    resultAssetId: `result-${job.id}`,
  });
  expect(detail.quota).toMatchObject({ imageUsed: 1, imageReserved: 0 });
});

it('permits a fresh explicit publication after offline cancels an uncertain older activation', async () => {
  let p = await publishable();
  providers.publish = async () => {
    throw new ProviderError('pages_acceptance_unknown', 'Unknown Pages acceptance', true);
  };
  await request(`/api/projects/${p.id}/publish`, {
    expectedVersion: p.version,
    requestId: 'uncertain-release',
  });
  await service.tick();
  p = (await request(`/api/projects/${p.id}/offline`, {})).data.project;
  providers.publish = providerSet().publish;
  const next = await request(`/api/projects/${p.id}/publish`, {
    expectedVersion: p.version,
    requestId: 'explicit-next-release',
  });
  expect(next.status).toBe(200);
  await service.tick();
  expect((await get(p)).project.offline).toBe(false);
});

describe('durable hosting identity and activation recovery', () => {
  it('persists project and release hosting identity before any external deployment', async () => {
    const p = await publishable(),
      target = { accountId: 'ACCOUNT_A', pagesProjectName: 'wr-permanent-site' };
    let deployed = 0;
    providers.resolveHostingTarget = async (_id, current) => current ?? target;
    providers.publish = async (_id, release, _files, _previous, actual) => {
      deployed++;
      expect(actual).toEqual(target);
      return { deploymentId: release, url: 'https://wr-permanent-site.pages.dev', testMode: true };
    };
    const queued = await request(`/api/projects/${p.id}/publish`, {
      expectedVersion: p.version,
      requestId: 'bind-before-deploy',
    });
    expect(queued.status).toBe(200);
    let detail = await get(p);
    expect(detail.project.hostingTarget).toEqual(target);
    expect(detail.releases[0].hostingTarget).toEqual(target);
    expect(deployed).toBe(0);
    await service.tick();
    detail = await get(p);
    expect(detail.project.publishedReleaseId).toBe(detail.releases[0].id);
    expect(deployed).toBe(1);
  });
  it('keeps an existing binding when its account configuration disappears instead of switching accounts', async () => {
    let p = await publishable();
    const target = { accountId: 'ACCOUNT_A', pagesProjectName: 'wr-fixed' };
    providers.resolveHostingTarget = async (_id, current) => current ?? target;
    providers.publish = async () => {
      throw new ProviderError('pages_unconfigured', 'Account missing');
    };
    await request(`/api/projects/${p.id}/publish`, {
      expectedVersion: p.version,
      requestId: 'bind-first-failed',
    });
    await service.tick();
    p = (await get(p)).project;
    providers.resolveHostingTarget = async (_id, current) => {
      if (current?.accountId === 'ACCOUNT_A')
        throw new ProviderError('pages_account_missing', 'Bound account removed');
      return { accountId: 'ACCOUNT_B', pagesProjectName: 'wr-other' };
    };
    const result = await request(`/api/projects/${p.id}/publish`, {
      expectedVersion: p.version,
      requestId: 'cannot-move-account',
    });
    expect(result.status).toBe(503);
    const detail = await get(p);
    expect(detail.project.hostingTarget).toEqual(target);
    expect(detail.releases).toHaveLength(1);
  });
  it('rolls back a new project binding when the job/release batch cannot be stored', async () => {
    const p = await publishable();
    providers.resolveHostingTarget = async () => ({
      accountId: 'ACCOUNT_A',
      pagesProjectName: 'wr-fixed',
    });
    await env.DB.exec(
      "CREATE TRIGGER reject_release BEFORE INSERT ON releases BEGIN SELECT RAISE(ABORT, 'release failed'); END",
    );
    expect(
      (
        await request(`/api/projects/${p.id}/publish`, {
          expectedVersion: p.version,
          requestId: 'atomic-binding',
        })
      ).status,
    ).toBe(500);
    const detail = await get(p);
    expect(detail.project.hostingTarget).toBeUndefined();
    expect(detail.releases).toHaveLength(0);
    expect(detail.jobs).toHaveLength(0);
  });
  it('recovers the saved successful deployment after activation D1 write failure without a new release', async () => {
    const p = await publishable();
    await env.DB.exec(
      "CREATE TRIGGER reject_activation BEFORE UPDATE ON projects WHEN json_extract(NEW.data, '$.publishedReleaseId') IS NOT NULL BEGIN SELECT RAISE(ABORT, 'activation failed'); END",
    );
    const queued = await request(`/api/projects/${p.id}/publish`, {
      expectedVersion: p.version,
      requestId: 'activation-recovery',
    });
    await service.tick();
    let detail = await get(p);
    const releaseId = detail.releases[0].id;
    expect(detail.jobs.find((j: Job) => j.id === queued.data.job.id)).toMatchObject({
      status: 'unknown',
      input: { publishResult: { deploymentId: releaseId } },
    });
    expect(detail.releases[0].status).toBe('pending');
    expect(detail.project.publishedReleaseId).toBeUndefined();
    expect(
      (
        await request(`/api/projects/${p.id}/publish`, {
          expectedVersion: p.version,
          requestId: 'must-not-replace-release',
        })
      ).status,
    ).toBe(409);
    await env.DB.exec('DROP TRIGGER reject_activation');
    service = new DomainService(env, { schedule: async () => {} }, providers);
    providers.publish = async () => {
      throw new Error('saved successful deployment must not be deployed again');
    };
    await request(`/api/projects/${p.id}/jobs/${queued.data.job.id}/retry`, {});
    await service.tick();
    detail = await get(p);
    expect(detail.project.publishedReleaseId).toBe(releaseId);
    expect(detail.releases).toHaveLength(1);
    expect(detail.releases[0].status).toBe('succeeded');
  });
  it('retains successful publish results when current permission is revoked before activation', async () => {
    const p = await publishable();
    let calls = 0;
    providers.publish = async (_id, release) => {
      calls++;
      sourceState.revoked = true;
      return { deploymentId: release, url: 'https://fixed.pages.dev', testMode: true };
    };
    const queued = await request(`/api/projects/${p.id}/publish`, {
      expectedVersion: p.version,
      requestId: 'permission-after-deploy',
    });
    await service.tick();
    let detail = await get(p);
    expect(detail.jobs.find((j: Job) => j.id === queued.data.job.id).status).toBe('unknown');
    expect(detail.releases[0].status).toBe('pending');
    expect(detail.project.offline).toBe(true);
    sourceState.revoked = false;
    await request(`/api/projects/${p.id}/jobs/${queued.data.job.id}/retry`, {});
    await service.tick();
    detail = await get(p);
    expect(detail.project.publishedReleaseId).toBe(detail.releases[0].id);
    expect(calls).toBe(1);
  });
});

it('preserves an offline cancellation while saving a concurrently returned Pages success', async () => {
  const p = await publishable();
  let finish!: (value: { deploymentId: string; url: string; testMode: boolean }) => void;
  let signal!: () => void;
  const started = new Promise<void>((resolve) => {
    signal = resolve;
  });
  providers.publish = async () => {
    signal();
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const queued = await request(`/api/projects/${p.id}/publish`, {
    expectedVersion: p.version,
    requestId: 'offline-during-provider',
  });
  const running = service.tick();
  await started;
  await request(`/api/projects/${p.id}/offline`, {});
  finish({
    deploymentId: 'accepted-while-offline',
    url: 'https://fixed.pages.dev',
    testMode: true,
  });
  await running;
  const detail = await get(p);
  expect(detail.project.offline).toBe(true);
  expect(detail.project.publishedReleaseId).toBeUndefined();
  expect(detail.jobs.find((j: Job) => j.id === queued.data.job.id).status).toBe('failed');
  expect(detail.jobs.find((j: Job) => j.id === queued.data.job.id).input.cancelledByOffline).toBe(
    true,
  );
});

it('recovers the same release marker if the deployment result could not be written during a D1 outage', async () => {
  const p = await publishable(),
    markers: string[] = [];
  providers.publish = async (_id, release) => {
    markers.push(release);
    return {
      deploymentId: `deployment-${release}`,
      url: 'https://fixed.pages.dev',
      testMode: true,
    };
  };
  await env.DB.exec(
    "CREATE TRIGGER reject_publish_result BEFORE UPDATE ON jobs WHEN json_extract(NEW.data, '$.input.publishResult') IS NOT NULL BEGIN SELECT RAISE(ABORT, 'result storage unavailable'); END",
  );
  const queued = await request(`/api/projects/${p.id}/publish`, {
    expectedVersion: p.version,
    requestId: 'lost-result-write',
  });
  await expect(service.tick()).rejects.toThrow();
  let detail = await get(p);
  expect(detail.jobs.find((j: Job) => j.id === queued.data.job.id).status).toBe('running');
  expect(detail.jobs.find((j: Job) => j.id === queued.data.job.id).input.publicationStarted).toBe(
    true,
  );
  expect(detail.releases[0].status).toBe('pending');
  await env.DB.exec('DROP TRIGGER reject_publish_result');
  service = new DomainService(env, { schedule: async () => {} }, providers);
  await service.tick();
  detail = await get(p);
  expect(detail.jobs.find((j: Job) => j.id === queued.data.job.id).status).toBe('unknown');
  await request(`/api/projects/${p.id}/jobs/${queued.data.job.id}/retry`, {});
  await service.tick();
  detail = await get(p);
  expect(markers).toHaveLength(2);
  expect(new Set(markers).size).toBe(1);
  expect(detail.releases).toHaveLength(1);
  expect(detail.project.publishedReleaseId).toBe(markers[0]);
});

describe('accepted task tracking and dispatch-time email safety', () => {
  it.each([403, 502])(
    'keeps polling an accepted video without releasing the global slot when PR context would fail with %i',
    async (status) => {
      const p = await videoReady();
      const first = (
        await request(`/api/projects/${p.id}/jobs`, {
          expectedVersion: p.version,
          requestId: `accepted-video-${status}`,
          kind: 'video',
        })
      ).data.job;
      await service.tick();
      await request(`/api/projects/${p.id}/jobs`, {
        expectedVersion: p.version,
        requestId: `queued-video-${status}`,
        kind: 'video',
      });
      sourceState.revoked = true;
      sourceState.failureStatus = status;
      let polls = 0,
        submissions = 0;
      providers.pollVideo = async () => {
        polls++;
        return { state: 'pending' };
      };
      providers.submitVideo = async () => {
        submissions++;
        return { videoId: 'must-not-start' };
      };
      await service.tick();
      sourceState.revoked = false;
      await service.tick();
      const detail = await get(p);
      expect(polls).toBe(2);
      expect(submissions).toBe(0);
      expect(detail.jobs.find((j: Job) => j.id === first.id)).toMatchObject({
        status: 'running',
        upstreamId: 'upstream',
      });
      expect(detail.quota).toMatchObject({ videoReserved: 2, videoUsed: 0 });
      expect(
        (await request(`/api/projects/${p.id}`, undefined, { ...owner, userId: 'another-member' }))
          .status,
      ).toBe(404);
    },
  );
  it('rechecks an ambiguous email retry immediately before dispatch after its queue crosses the idempotency deadline', async () => {
    let p = await publishable();
    p = await publishNow(p);
    const submitted = await request(`/api/public/sites/${p.id}/inquiries`, {
      requestId: 'late-dispatch-retry',
      name: 'Buyer',
      email: 'buyer@example.com',
      company: '',
      message: 'Hello',
    });
    providers.email = async () => {
      throw new ProviderError('email_unknown', 'Acceptance unknown', true);
    };
    const start = Date.now();
    await service.tick();
    const clock = vi.spyOn(Date, 'now');
    try {
      clock.mockReturnValue(start + 22.5 * 3600000);
      expect(
        (await request(`/api/projects/${p.id}/inquiries/${submitted.data.id}/retry`, {})).status,
      ).toBe(200);
      clock.mockReturnValue(start + 25.5 * 3600000);
      let sends = 0;
      providers.email = async () => {
        sends++;
        return { id: 'duplicate', testMode: true };
      };
      await service.tick();
      expect(sends).toBe(0);
      const inquiry = (await request(`/api/projects/${p.id}/inquiries`)).data.inquiries[0];
      expect(inquiry.emailStatus).toBe('unknown');
      expect(
        (await request(`/api/projects/${p.id}/inquiries/${inquiry.id}/retry`, {})).status,
      ).toBe(409);
    } finally {
      clock.mockRestore();
    }
  });
  it('allows a genuine first email attempt after a long queue and starts the retry window at that first attempt', async () => {
    let p = await publishable();
    p = await publishNow(p);
    await request(`/api/public/sites/${p.id}/inquiries`, {
      requestId: 'delayed-first-send',
      name: 'Buyer',
      email: 'buyer@example.com',
      company: '',
      message: 'Hello',
    });
    const clock = vi.spyOn(Date, 'now'),
      dispatchTime = Date.now() + 30 * 3600000;
    try {
      clock.mockReturnValue(dispatchTime);
      let sends = 0;
      providers.email = async () => {
        sends++;
        return { id: 'first-send', testMode: true };
      };
      await service.tick();
      const job = (await get(p)).jobs.find((j: Job) => j.kind === 'email');
      expect(sends).toBe(1);
      expect(job.status).toBe('succeeded');
      expect(job.input.emailFirstAttemptAt).toBe(dispatchTime);
    } finally {
      clock.mockRestore();
    }
  });
});

it('passes only the currently active successful release as previous static content to Pages', async () => {
  let p = await publishable();
  p = await publishNow(p);
  const activeReleaseId = p.publishedReleaseId!;
  const unpublished = structuredClone(p.draft);
  unpublished.copy.en!.headline = 'UNPUBLISHED SECRET CONTENT';
  await service.store
    .insert('releases', {
      id: 'unpublished-later-release',
      projectId: p.id,
      draftVersion: p.version,
      draft: unpublished,
      status: 'pending',
      createdAt: new Date().toISOString(),
      testMode: true,
    })
    .run();
  p.draft.copy.en!.headline = 'Edited new draft';
  p = (
    await request(
      `/api/projects/${p.id}`,
      { expectedVersion: p.version, draft: p.draft },
      owner,
      'PUT',
    )
  ).data.project;
  let checked = false;
  providers.publish = async (_id, release, files, _deployment, _target, previous) => {
    expect(files['en/index.html']).toContain('Edited new draft');
    expect(previous?.releaseId).toBe(activeReleaseId);
    expect(previous?.files['en/index.html']).toContain('Original headline');
    expect(JSON.stringify(previous?.files)).not.toContain('UNPUBLISHED SECRET CONTENT');
    expect(JSON.stringify(previous?.files)).not.toContain('Edited new draft');
    checked = true;
    return { deploymentId: release, url: 'https://fixed.pages.dev', testMode: true };
  };
  await request(`/api/projects/${p.id}/publish`, {
    expectedVersion: p.version,
    requestId: 'trusted-previous-bundle',
  });
  await service.tick();
  expect(checked).toBe(true);
});

it('still blocks duplicate email dispatch past the deadline if accepted-mail D1 finalization had failed', async () => {
  let p = await publishable();
  p = await publishNow(p);
  const submitted = await request(`/api/public/sites/${p.id}/inquiries`, {
    requestId: 'accepted-mail-write-failure',
    name: 'Buyer',
    email: 'buyer@example.com',
    company: '',
    message: 'Hello',
  });
  await env.DB.exec(
    "CREATE TRIGGER reject_sent_mail BEFORE UPDATE ON jobs WHEN NEW.kind = 'email' AND NEW.status = 'succeeded' BEGIN SELECT RAISE(ABORT, 'mail finalization failed'); END",
  );
  let sends = 0;
  providers.email = async () => {
    sends++;
    return { id: 'already-accepted', testMode: true };
  };
  const start = Date.now();
  await service.tick();
  expect(sends).toBe(1);
  await env.DB.exec('DROP TRIGGER reject_sent_mail');
  const clock = vi.spyOn(Date, 'now');
  try {
    clock.mockReturnValue(start + 22.5 * 3600000);
    expect(
      (await request(`/api/projects/${p.id}/inquiries/${submitted.data.id}/retry`, {})).status,
    ).toBe(200);
    clock.mockReturnValue(start + 25.5 * 3600000);
    await service.tick();
    expect(sends).toBe(1);
    expect((await request(`/api/projects/${p.id}/inquiries`)).data.inquiries[0].emailStatus).toBe(
      'unknown',
    );
  } finally {
    clock.mockRestore();
  }
});
