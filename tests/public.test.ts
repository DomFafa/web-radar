import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  afterEach(() => vi.unstubAllGlobals());
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
    expect(response.headers.get('cache-control')).toBe('private, no-cache');
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
  it('authorizes with one SQL read and answers SHA conditionals without R2, including weak lists and ranges', async () => {
    const asset = (await store.one<Asset>('assets', 'public-video'))!;
    asset.sha256 = 'a'.repeat(64);
    await store.update('assets', asset).run();
    const query = vi.spyOn(env.DB, 'prepare');
    for (const value of [`"${asset.sha256}"`, `"other", W/"${asset.sha256}"`, '*']) {
      query.mockClear();
      const response = await request('site/assets/public-video', {headers: {'If-None-Match':value, Range:'bytes=invalid'}});
      expect(response.status).toBe(304);
      expect(response.headers.get('etag')).toBe(`"${asset.sha256}"`);
      expect(query).toHaveBeenCalledTimes(1);
    }
    expect(env.MEDIA.get).not.toHaveBeenCalled();
    expect(env.MEDIA.head).not.toHaveBeenCalled();
    project.offline = true;
    await store.update('projects', project).run();
    expect((await request('site/assets/public-video', {headers:{'If-None-Match':'*'}})).status).toBe(503);
  });
  it('honors only strong matching If-Range and supports legacy conditional ETags', async () => {
    for (const validator of ['W/"fixture"','"other"','invalid']) {
      const response = await request('site/assets/public-video', {headers:{Range:'bytes=2-5','If-Range':validator}});
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('0123456789');
    }
    const response = await request('site/assets/public-video', {headers:{Range:'bytes=2-5','If-Range':'"fixture"'}});
    expect(response.status).toBe(206);
    expect(await response.text()).toBe('2345');
    expect((await request('site/assets/public-video',{headers:{'If-None-Match':'W/"fixture"'}})).status).toBe(304);
  });

  const enableCache = () => {
    const responses = new Map<string,Response>();
    const cache={match:vi.fn(async(request:Request)=>responses.get(request.url)?.clone()),put:vi.fn(async(request:Request,response:Response)=>{responses.set(request.url,response.clone());})};
    vi.stubGlobal('caches',{default:cache});
    return cache;
  };
  const imageAsset = async () => {
    const asset=(await store.one<Asset>('assets','public-video'))!;
    asset.contentType='image/png';asset.filename='image.png';
    await store.update('assets',asset).run();return asset;
  };
  it('caches only full authorized image bodies and keeps legacy cold/warm ETags exact',async()=>{
    await imageAsset();const cache=enableCache();
    const first=await request('site/assets/public-video');expect(await first.text()).toBe('0123456789');
    expect(first.headers.get('cache-control')).toBe('private, no-cache');expect(cache.put).toHaveBeenCalledTimes(1);
    const reads=vi.mocked(env.MEDIA.get).mock.calls.length;
    const next=await request('site/assets/public-video',{headers:{'If-None-Match':'W/"fixture"'}});
    expect(next.status).toBe(304);expect(await next.text()).toBe('');expect(env.MEDIA.get).toHaveBeenCalledTimes(reads);expect(env.MEDIA.head).not.toHaveBeenCalled();
    const range=await request('site/assets/public-video',{headers:{Range:'bytes=-3'}});expect(await range.text()).toBe('789');expect(range.status).toBe(206);
    const head=await request('site/assets/public-video',{method:'HEAD'});expect(await head.text()).toBe('');expect(head.headers.get('content-length')).toBe('10');
    expect(cache.put).toHaveBeenCalledTimes(1);expect(env.MEDIA.get).toHaveBeenCalledTimes(reads);
  });
  it('never uses primed bytes or validators after offline, failed release, foreign asset, removed membership, or DB failure',async()=>{
    const asset=await imageAsset();const cache=enableCache();await(await request('site/assets/public-video')).text();cache.match.mockClear();
    const conditional={headers:{'If-None-Match':'"fixture"'}};
    project.offline=true;await store.update('projects',project).run();expect((await request('site/assets/public-video',conditional)).status).toBe(503);
    project.offline=false;await store.update('projects',project).run();release.status='failed';await store.update('releases',release).run();expect((await request('site/assets/public-video',conditional)).status).toBe(503);
    release.status='succeeded';release.draft.heroAssetId=undefined;await store.update('releases',release).run();expect((await request('site/assets/public-video',conditional)).status).toBe(404);
    release.draft.heroAssetId=asset.id;await store.update('releases',release).run();asset.projectId='another';await store.update('assets',asset).run();expect((await request('site/assets/public-video',conditional)).status).toBe(404);
    vi.spyOn(env.DB,'prepare').mockImplementationOnce(()=>{throw Error('DB unavailable');});const failed=await request('site/assets/public-video',conditional);expect(failed.status).toBe(503);expect(failed.headers.get('cache-control')).toBe('no-store');
    expect(cache.match).not.toHaveBeenCalled();expect(env.MEDIA.get).toHaveBeenCalledTimes(1);
  });
  it('isolates cache entries by current release, fails closed for JSON identity mismatches, and falls back on cache errors',async()=>{
    await imageAsset();const cache=enableCache();await(await request('site/assets/public-video')).text();
    const next={...release,id:'release-next'};await store.insert('releases',next).run();project.publishedReleaseId=next.id;await store.update('projects',project).run();
    await(await request('site/assets/public-video')).text();expect(env.MEDIA.get).toHaveBeenCalledTimes(2);
    cache.match.mockRejectedValueOnce(Error('cache unavailable'));cache.put.mockRejectedValueOnce(Error('cache unavailable'));
    expect((await request('site/assets/public-video')).status).toBe(200);expect(env.MEDIA.get).toHaveBeenCalledTimes(3);
    await env.DB.prepare('UPDATE releases SET data=? WHERE id=?').bind(JSON.stringify({...next,id:'forged'}),next.id).run();
    expect((await request('site/assets/public-video')).status).toBe(503);
  });
  it('serves only prepared variants with their own ETag and never falls back to the original for a missing derivative',async()=>{
    const asset=await imageAsset();asset.sha256='a'.repeat(64);await store.update('assets',asset).run();
    release.publicMedia={policy:'webp82-v1',ready:true,assets:{[asset.id]:{sourceKey:asset.key,sourceIdentity:`sha256:${asset.sha256}`,widths:[320],variants:[{requestedWidth:320,width:10,height:1,key:'prepared/320.webp',bytes:10,sha256:'b'.repeat(64)}]}}};
    await store.update('releases',release).run();
    const conditional=await request('site/assets/public-video?width=320',{headers:{'If-None-Match':`"${'b'.repeat(64)}"`}});
    expect(conditional.status).toBe(304);expect(env.MEDIA.get).not.toHaveBeenCalled();expect(env.MEDIA.head).not.toHaveBeenCalled();
    const actual=await request('site/assets/public-video?width=320');expect(actual.status).toBe(200);expect(actual.headers.get('content-type')).toBe('image/webp');expect(actual.headers.get('etag')).toBe(`"${'b'.repeat(64)}"`);
    expect(env.MEDIA.get).toHaveBeenLastCalledWith('prepared/320.webp',undefined);
    expect((await request('site/assets/public-video?width=640')).status).toBe(404);
    expect((await request('site/assets/public-video?width=0320')).status).toBe(404);
    vi.mocked(env.MEDIA.get).mockResolvedValueOnce(null);
    const missing=await request('site/assets/public-video?width=320');expect(missing.status).toBe(404);expect(missing.headers.get('cache-control')).toBe('no-store');
  });

});
