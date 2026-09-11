import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { testDb } from './helpers/db';
import { createPublicApp } from '../src/worker/public';
import { defaultDraft } from '../src/worker/domain';
import { DomainStore } from '../src/worker/domain-store';
import type { AppEnv } from '../src/worker/env';
import type { Asset, Project, Release } from '../src/shared/model';

describe('public release gate and direct R2 media', () => {
  let env: AppEnv, store: DomainStore, project: Project, release: Release;
  const bytes = new TextEncoder().encode('0123456789');
  const app = createPublicApp();
  beforeEach(async () => {
    const db = testDb();
    await db.exec(readFileSync('migrations/0002_business.sql', 'utf8'));
    store = new DomainStore(db);
    const get = vi.fn(async (_key, options) => ({
      body: new Blob([
        options?.range
          ? bytes.slice(options.range.offset, options.range.offset + options.range.length)
          : bytes,
      ]).stream(),
      httpEtag: '"fixture"',
    }));
    env = {
      DB: db,
      MEDIA: { get, head: vi.fn(async () => ({ httpEtag: '"fixture"' })) },
      COORDINATOR: {
        getByName: vi.fn(() => {
          throw new Error('public traffic must bypass global coordinator');
        }),
      },
    } as unknown as AppEnv;
    project = {
      id: 'site',
      ownerId: 'owner',
      workspaceId: 'space',
      name: 'Site',
      version: 1,
      draft: defaultDraft(),
      offline: false,
      publishedReleaseId: 'release',
      createdAt: '',
      updatedAt: '',
    };
    release = {
      id: 'release',
      projectId: 'site',
      draftVersion: 1,
      draft: {
        ...defaultDraft(),
        heroAssetId: 'public-video',
        scenes: [
          {
            id: 'private-scene',
            revision: 1,
            description: 'Private',
            imageAssetId: 'private-frame',
          },
        ],
      },
      status: 'succeeded',
      createdAt: '',
      testMode: false,
    };
    await store.insert('projects', project).run();
    await store
      .insert('projects', { ...project, id: 'another', publishedReleaseId: undefined })
      .run();
    await store.insert('releases', release).run();
    for (const [id, projectId] of [
      ['public-video', 'site'],
      ['private-frame', 'site'],
      ['foreign', 'another'],
    ]) {
      const asset: Asset = {
        id,
        projectId,
        key: `private/${id}`,
        contentType: 'video/webm',
        filename: 'hero.webm',
        size: bytes.length,
        origin: 'upload',
        createdAt: '',
      };
      await store.insert('assets', asset).run();
    }
  });
  const request = (path: string, init?: RequestInit) =>
    app.request(`http://localhost/${path}`, init, env);

  it('allows only the current successful release, without entering the coordinator', async () => {
    const response = await request('site/gate/release');
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect((await request('site/gate/stale-alias')).status).toBe(404);
    expect((await request('missing/gate/release')).status).toBe(503);
    expect(env.COORDINATOR.getByName).not.toHaveBeenCalled();
  });
  it('fails closed for offline, failed, or cross-project release records', async () => {
    for (const state of ['offline', 'failed', 'cross-project']) {
      project.offline = state === 'offline';
      release.status = state === 'failed' ? 'failed' : 'succeeded';
      release.projectId = state === 'cross-project' ? 'another' : 'site';
      await store.update('projects', project).run();
      await store.update('releases', release).run();
      expect((await request('site/gate/release')).status).toBe(503);
      expect((await request('site/assets/public-video')).status).toBe(503);
    }
    expect(env.MEDIA.get).not.toHaveBeenCalled();
  });
  it('streams published media with range support directly from R2', async () => {
    const response = await request('site/assets/public-video', { headers: { Range: 'bytes=2-5' } });
    expect(response.status).toBe(206);
    expect(response.headers.get('content-range')).toBe('bytes 2-5/10');
    expect(response.headers.get('content-length')).toBe('4');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).toBe('2345');
    expect(env.MEDIA.get).toHaveBeenCalledWith('private/public-video', {
      range: { offset: 2, length: 4 },
    });
    expect(env.COORDINATOR.getByName).not.toHaveBeenCalled();
    expect(
      await (await request('site/assets/public-video', { headers: { Range: 'bytes=-3' } })).text(),
    ).toBe('789');
  });
  it('does not expose draft frames, foreign assets, or old releases', async () => {
    for (const id of ['private-frame', 'foreign', 'missing'])
      expect((await request(`site/assets/${id}`)).status).toBe(404);
    release.draft.heroAssetId = 'foreign';
    await store.update('releases', release).run();
    expect((await request('site/assets/foreign')).status).toBe(404);
    expect((await request('site/assets/public-video')).status).toBe(404);
    expect(env.MEDIA.get).not.toHaveBeenCalled();
  });
  it('handles HEAD and rejects invalid ranges and methods without reading R2 bodies', async () => {
    const head = await request('site/assets/public-video', { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect(head.headers.get('content-length')).toBe('10');
    expect(await head.text()).toBe('');
    for (const range of [
      'bytes=10-',
      'bytes=5-2',
      'bytes=-0',
      'bytes=0-1,3-4',
      'bytes=-',
      'bytes=999999999999999999999-',
    ]) {
      expect(
        (await request('site/assets/public-video', { headers: { Range: range } })).status,
      ).toBe(416);
    }
    expect((await request('site/gate/release', { method: 'POST' })).status).toBe(405);
    expect((await request('site/assets/public-video', { method: 'POST' })).status).toBe(405);
    expect(env.MEDIA.get).not.toHaveBeenCalled();
  });
});
