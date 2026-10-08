import { afterEach, expect, it, vi } from 'vitest';
import type { Asset, Project } from '../src/shared/model';
import { defaultDraft } from '../src/worker/domain';
import type { AppEnv } from '../src/worker/env';
import { saveWebsiteResult, type WebsiteResult } from '../src/worker/website-results';

const MiB = 1024 * 1024;
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
};
function fixture(sizes: number[]) {
  const draft = defaultDraft(), at = '2026-10-03T00:00:00.000Z';
  const project: Project = { id: 'site', ownerId: 'owner', workspaceId: 'workspace', name: 'Site', version: 3, draft, createdAt: at, updatedAt: at, offline: false };
  const assets: Asset[] = sizes.map((size, index) => ({ id: `image-${index}`, projectId: project.id, key: `projects/site/image-${index}`, contentType: 'image/png', size, filename: `${index}.png`, origin: 'import', createdAt: at }));
  draft.products = assets.map(asset => ({ id: `product-${asset.id}`, name: asset.id, description: '', material: '', dimensions: '', imageAssetId: asset.id }));
  const objects = new Map(assets.map((asset, index) => [asset.key, new Uint8Array(asset.size).fill(index + 1)]));
  const bucket = {
    get: vi.fn(async (key: string) => {
      const bytes = objects.get(key);
      return bytes ? { size: bytes.length, arrayBuffer: async () => bytes.slice().buffer } : null;
    }),
    put: vi.fn(async (key: string, value: string | ArrayBuffer, _options?: unknown) => {
      objects.set(key, typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value).slice());
    }),
  };
  const env = { MEDIA: bucket } as unknown as AppEnv;
  const key = 'website-results/site/3/result.json';
  const pages = { 'en/index.html': '<html><body>Saved site</body></html>' };
  return { assets, project, objects, bucket, key, pages,
    save: () => saveWebsiteResult(env, project, pages, assets),
    result: () => JSON.parse(new TextDecoder().decode(objects.get(key)!)) as WebsiteResult };
}
afterEach(() => vi.restoreAllMocks());

it('copies four assets concurrently while waiting for the entire batch before starting more', async () => {
  const f = fixture(Array(6).fill(8)), gates = Array.from({ length: 6 }, deferred);
  const put = f.bucket.put.getMockImplementation()!;
  f.bucket.put.mockImplementation(async (key, value, options) => {
    const index = f.assets.findIndex(asset => key.endsWith('/' + asset.id));
    if (index >= 0) await gates[index].promise;
    return put(key, value, options);
  });
  const saving = f.save();
  try {
    await vi.waitFor(() => expect(f.bucket.get).toHaveBeenCalledTimes(4));
    gates[3].resolve(); gates[2].resolve(); gates[1].resolve();
    await vi.waitFor(() => expect(f.objects.has('website-results/site/3/assets/image-1')).toBe(true));
    expect(f.bucket.get).toHaveBeenCalledTimes(4);
    expect(f.objects.has(f.key)).toBe(false);
    gates[0].resolve();
    await vi.waitFor(() => expect(f.bucket.get).toHaveBeenCalledTimes(6));
    expect(f.objects.has(f.key)).toBe(false);
    gates[5].resolve(); gates[4].resolve();
    expect(await saving).toBe(f.key);
    expect(f.result().assets.map(asset => asset.id)).toEqual(['image-0', 'image-1', 'image-2', 'image-3', 'image-4', 'image-5']);
    expect(f.result().pages).toEqual(f.pages);
    for (const asset of f.result().assets) expect(f.objects.get(asset.key)).toEqual(f.objects.get(`projects/site/${asset.id}`));
  } finally { gates.forEach(gate => gate.resolve()); await saving; }
});

it('keeps the buffered batch within twenty MiB', async () => {
  const f = fixture([12 * MiB, 12 * MiB, 4 * MiB, 4 * MiB]), first = deferred();
  const put = f.bucket.put.getMockImplementation()!;
  f.bucket.put.mockImplementation(async (key, value, options) => {
    if (key.endsWith('/image-0')) await first.promise;
    return put(key, value, options);
  });
  const saving = f.save();
  await vi.waitFor(() => expect(f.bucket.put).toHaveBeenCalledTimes(1));
  expect(f.bucket.get).toHaveBeenCalledTimes(1);
  expect(f.objects.has(f.key)).toBe(false);
  first.resolve(); await saving;
  expect(f.result().assets).toHaveLength(4);
});

it('copies a larger existing asset alone without rejecting it or buffering another asset beside it', async () => {
  const f = fixture([25 * MiB, 8]), first = deferred();
  f.assets[0].contentType = 'video/mp4';
  const put = f.bucket.put.getMockImplementation()!;
  f.bucket.put.mockImplementation(async (key, value, options) => {
    if (key.endsWith('/image-0')) await first.promise;
    return put(key, value, options);
  });
  const saving = f.save();
  await vi.waitFor(() => expect(f.bucket.put).toHaveBeenCalledTimes(1));
  expect(f.bucket.get).toHaveBeenCalledTimes(1);
  first.resolve(); await saving;
  expect(f.result().assets[0].contentType).toBe('video/mp4');
  expect(f.objects.get('website-results/site/3/assets/image-0')?.length).toBe(25 * MiB);
});

it.each(['get', 'put'] as const)('settles in-flight copies before reporting a %s failure and never publishes a partial result', async failureStage => {
  const f = fixture([8, 8, 8, 8, 8]), gate = deferred(), failure = Error('R2 unavailable');
  const get = f.bucket.get.getMockImplementation()!, put = f.bucket.put.getMockImplementation()!;
  if (failureStage === 'get') f.bucket.get.mockImplementation(async key => {
    if (key.endsWith('/image-0')) throw failure;
    return get(key);
  });
  f.bucket.put.mockImplementation(async (key, value, options) => {
    if (key.endsWith('/image-0') && failureStage === 'put') throw failure;
    await gate.promise;
    return put(key, value, options);
  });
  let settled = false;
  const saving = f.save().then(() => { settled = true; return null; }, error => { settled = true; return error; });
  try {
    await vi.waitFor(() => expect(f.bucket.put).toHaveBeenCalledTimes(failureStage === 'get' ? 3 : 4));
    expect(settled).toBe(false);
    expect(f.bucket.get).toHaveBeenCalledTimes(4);
    expect(f.objects.has(f.key)).toBe(false);
    gate.resolve();
    expect(await saving).toBe(failure);
    expect(f.bucket.get).toHaveBeenCalledTimes(4);
    expect(f.objects.has(f.key)).toBe(false);
    expect(f.objects.has('website-results/site/3/assets/image-3')).toBe(true);
    f.bucket.get.mockImplementation(get); f.bucket.put.mockImplementation(put);
    await f.save();
    expect(f.result().assets).toHaveLength(5);
  } finally { gate.resolve(); await saving; }
});

it('returns success only after the final result JSON is durable and allows retry after its write fails', async () => {
  const f = fixture([8, 8]), put = f.bucket.put.getMockImplementation()!, failure = Error('Result write failed');
  f.bucket.put.mockImplementation(async (key, value, options) => {
    if (key === f.key) throw failure;
    return put(key, value, options);
  });
  await expect(f.save()).rejects.toBe(failure);
  expect(f.objects.has(f.key)).toBe(false);
  expect(f.objects.has('website-results/site/3/assets/image-0')).toBe(true);
  expect(f.objects.has('website-results/site/3/assets/image-1')).toBe(true);
  f.bucket.put.mockImplementation(put);
  expect(await f.save()).toBe(f.key);
  expect(f.result().assets).toHaveLength(2);
});

it('refuses to publish a result with a missing source object', async () => {
  const f = fixture([8, 8]); f.objects.delete(f.assets[1].key);
  await expect(f.save()).rejects.toMatchObject({ code: 'website_result_asset_missing' });
  expect(f.objects.has(f.key)).toBe(false);
});
