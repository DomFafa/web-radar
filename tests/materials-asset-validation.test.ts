import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Asset, Draft, Project } from '../src/shared/model';
import type { AppEnv } from '../src/worker/env';
import { DomainService } from '../src/worker/domain-service';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { materialsFixture, materialsPng } from './fixtures/materials';
import { testDb } from './helpers/db';

describe('verified content identity when editing accepted materials', () => {
  let service: DomainService, project: Project;
  let fixture: Awaited<ReturnType<typeof typedMaterialsFixture>>;
  let reads: number, heads: number;
  const objects = new Map<string, { bytes: Uint8Array; metadata?: Record<string, string> }>();
  const key = (id: string) => `projects/accepted/assets/${id}`;
  const digest = async (bytes: Uint8Array) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes)))].map(v => v.toString(16).padStart(2, '0')).join('');
  beforeEach(async () => {
    fixture = await typedMaterialsFixture('juno-toys', 1);
    reads = 0; heads = 0; objects.clear();
    const db = testDb(); await db.exec(readFileSync('migrations/0002_business.sql', 'utf8'));
    const bucket = {
      async head(id: string) {
        heads++; const object = objects.get(id);
        return object ? { size: object.bytes.length, customMetadata: object.metadata } : null;
      },
      async get(id: string) {
        reads++; const object = objects.get(id);
        return object ? { size: object.bytes.length, customMetadata: object.metadata, arrayBuffer: async () => new Uint8Array(object.bytes).buffer } : null;
      },
    };
    const env = { DB: db, MEDIA: bucket, ENVIRONMENT: 'test', TEST_PROVIDERS: 'true', PRODUCT_RADAR_BASE_URL: 'https://product.example.com', PRODUCT_RADAR_INTEGRATION_SECRET: 's'.repeat(40) } as unknown as AppEnv;
    service = new DomainService(env, { schedule: async () => {} });
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ protocolVersion: 1, principal: fixture.principal })));
    const assets: Record<string, Asset> = {};
    for (const media of fixture.materials.media) {
      assets[media.id] = { id: media.id, projectId: 'accepted', key: key(media.id), contentType: media.mimeType, size: media.bytes, filename: media.id, origin: 'upload', createdAt: '2026-09-19T00:00:00Z' };
      objects.set(key(media.id), { bytes: new Uint8Array(Buffer.concat([materialsPng, Buffer.from(media.id)])) });
    }
    project = { id: 'accepted', ownerId: fixture.principal.userId, workspaceId: fixture.principal.workspaceId, name: 'Accepted site', version: 1, draft: draftFromMaterials(fixture, assets), createdAt: '2026-09-19T00:00:00Z', updatedAt: '2026-09-19T00:00:00Z', offline: false, materials: { submissionId: fixture.submissionId, source: fixture.source, contentSha256: fixture.confirmation.contentSha256, snapshotKey: 'confirmed.json', acceptedAt: '2026-09-19T00:00:00Z' } };
    await service.store.insert('projects', project).run();
    for (const asset of Object.values(assets)) await service.store.insert('assets', asset).run();
  });
  afterEach(() => vi.unstubAllGlobals());
  const save = async (draft: Draft, version = project.version) => {
    const response = await service.fetch(new Request(`https://web-radar.example/api/projects/${project.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-WR-Principal': encodeURIComponent(JSON.stringify(fixture.principal)) }, body: JSON.stringify({ expectedVersion: version, draft }) }));
    return { status: response.status, body: await response.json() as { code?: string; project?: Project } };
  };
  const uploadCopy = async (sourceId: string, id: string, options: { contentType?: string; projectId?: string } = {}) => {
    const bytes = objects.get(key(sourceId))!.bytes.slice();
    if (options.projectId && options.projectId !== project.id) await service.store.insert('projects', { ...project, id: options.projectId }).run();
    const asset: Asset = { id, projectId: options.projectId || project.id, key: key(id), contentType: options.contentType || 'image/png', size: bytes.length, filename: id, origin: 'upload', createdAt: '2026-09-19T00:00:00Z' };
    objects.set(key(id), { bytes }); await service.store.insert('assets', asset).run();
    return asset;
  };

  it.each([
    ['assetId', 'scene', 'front'], ['mobileAssetId', 'scene', 'front'],
    ['assetId', 'packaging', 'front'], ['mobileAssetId', 'packaging', 'front'],
    ['assetId', 'scene', 'packaging'], ['mobileAssetId', 'scene', 'packaging'],
  ] as const)('rejects different %s values with identical %s/%s bytes without saving the draft', async (field, targetRole, sourceRole) => {
    const draft = structuredClone(project.draft), source = draft.materials!.imageBindings.find(binding => binding.role === sourceRole)!, target = draft.materials!.imageBindings.find(binding => binding.role === targetRole)!;
    const duplicate = await uploadCopy(source.assetId, 'separate-upload'); target[field] = duplicate.id;
    expect(duplicate.id).not.toBe(source.assetId);
    const result = await save(draft);
    expect(result.status).toBe(422); expect(result.body.code).toBe('image_role_identity_reused');
    expect((await service.store.one<Project>('projects', project.id))?.version).toBe(1);
  });

  it('rejects identical bytes reused in a second collection banner', async () => {
    const draft = structuredClone(project.draft), banners = draft.materials!.imageBindings.filter(binding => binding.role === 'collection');
    banners[1].assetId = (await uploadCopy(banners[0].assetId, 'same-banner-new-upload')).id;
    expect(await save(draft)).toMatchObject({ status: 422, body: { code: 'banner_composition_reused' } });
  });

  it.each(['product-main', 'product-gallery'])('permits the same product %s bytes in a classified front image', async slotId => {
    const draft = structuredClone(project.draft), original = draft.materials!.imageBindings.find(binding => binding.slotId === slotId)!, front = draft.materials!.imageBindings.find(binding => binding.role === 'front')!;
    front.assetId = (await uploadCopy(original.assetId, 'original-front-reuse')).id;
    expect(await save(draft)).toMatchObject({ status: 200 });
  });

  it('caches verified object hashes so subsequent text edits do not reread image bytes', async () => {
    const first = await save(project.draft);
    expect(first.status).toBe(200);
    expect(reads).toBeGreaterThan(0);
    const verifiedReads = reads, verifiedHeads = heads;
    for (const asset of await service.store.list<Asset>('assets')) {
      expect(asset.sha256).toBe(await digest(objects.get(asset.key)!.bytes));
    }
    const next = first.body.project!; next.draft.company.name = 'Updated approved name';
    expect(await save(next.draft, next.version)).toMatchObject({ status: 200 });
    expect(reads).toBe(verifiedReads); expect(heads).toBe(verifiedHeads);
  });

  it('uses trusted receiver metadata without downloading previously verified assets', async () => {
    for (const media of fixture.materials.media) objects.get(key(media.id))!.metadata = { sha256: media.sha256 };
    expect(await save(project.draft)).toMatchObject({ status: 200 });
    expect(reads).toBe(0);
    expect((await service.store.one<Asset>('assets', fixture.materials.media[0].id))?.sha256).toBe(fixture.materials.media[0].sha256);
  });

  it.each([
    ['wrong image type', { contentType: 'image/gif' }, 400, 'materials_asset_type'],
    ['another project', { projectId: 'foreign' }, 404, 'asset_not_found'],
  ] as const)('keeps the existing %s failure before content hashing', async (_name, options, status, code) => {
    const draft = structuredClone(project.draft), scene = draft.materials!.imageBindings.find(binding => binding.role === 'scene')!;
    scene.assetId = (await uploadCopy(scene.assetId, 'invalid-replacement', options)).id;
    expect(await save(draft)).toMatchObject({ status, body: { code } });
    expect(reads).toBe(0); expect(heads).toBe(0);
  });

  it('fails closed when an uncached bound object is unavailable', async () => {
    const binding = project.draft.materials!.imageBindings.find(binding => binding.role === 'scene')!;
    objects.delete(key(binding.assetId));
    expect(await save(project.draft)).toMatchObject({ status: 409, body: { code: 'asset_unavailable' } });
  });

  it('does not add R2 reads to ordinary project edits', async () => {
    delete project.materials; delete project.draft.materials;
    await service.store.update('projects', project).run();
    expect(await save(project.draft)).toMatchObject({ status: 200 });
    expect(reads).toBe(0); expect(heads).toBe(0);
  });

  it('does not apply typed content rules to an accepted legacy contract', async () => {
    const legacy = await materialsFixture(1, 'senseng-clean');
    const assets = Object.fromEntries(legacy.materials.media.map(media => [media.id, { id: media.id } as Asset]));
    project.draft = draftFromMaterials(legacy, assets);
    await service.store.update('projects', project).run();
    expect(await save(project.draft)).toMatchObject({ status: 200 });
    expect(reads).toBe(0); expect(heads).toBe(0);
  });
});
