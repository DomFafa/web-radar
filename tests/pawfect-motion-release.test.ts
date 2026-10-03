import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Asset, Draft } from '../src/shared/model';
import type { MaterialsTemplateContract } from '../src/shared/materials';
import { projectPreviewHtml } from '../src/worker/project-preview';
import baseline from './fixtures/pawfect-native-2-release-hashes.json';

const previous = '2026-10-02.pawfect-groom-materials.2';
const current = '2026-10-02.pawfect-groom-materials.3';
type Node = DefaultTreeAdapterMap['node'];
const elements = (node: Node): DefaultTreeAdapterMap['element'][] => [
  ...('tagName' in node ? [node] : []),
  ...('childNodes' in node ? node.childNodes.flatMap(elements) : []),
];
const attr = (node: DefaultTreeAdapterMap['element'], name: string) => node.attrs.find(a => a.name === name)?.value;
const options = { projectId: 'pawfect-release-preservation', lang: 'en' as const, page: 'home', assetUrl: (id: string) => `/confirmed/${id}`, inquiryUrl: 'https://site.example/inquiry', preview: true };
type Api = typeof import('../src/templates/index') & typeof import('../src/templates/materials') & typeof import('../src/worker/materials-service') & typeof import('../src/worker/project-preview') & typeof import('../src/client/reference-template-preview') & typeof import('./fixtures/materials-typed');
let api: Api, draft: Draft, directory: string, releasedOutput: typeof baseline;

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T00:00:00Z'));
  directory = await mkdtemp(resolve(tmpdir(), 'pawfect-release-test-'));
  const bundle = resolve(directory, 'api.mjs');
  // Use the same executable bundle settings as the pre-change release receipt.
  await build({ stdin: { contents: `export {renderSite,renderSiteFiles} from './src/templates/index'; export {getMaterialsTemplate} from './src/templates/materials'; export {draftFromMaterials} from './src/worker/materials-service'; export {projectPreviewRuntimeForDraft} from './src/worker/project-preview'; export {referenceTemplatePreviewRuntime} from './src/client/reference-template-preview'; export {typedMaterialsFixture} from './tests/fixtures/materials-typed';`, resolveDir: process.cwd(), sourcefile: 'baseline-api.ts' }, outfile: bundle, bundle: true, platform: 'node', format: 'esm', target: 'node22', keepNames: true });
  // A native Node process avoids Vitest rewriting function.toString() in published scripts.
  const script = `import {createHash} from 'node:crypto';
    const NativeDate=Date;globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-02T00:00:00Z']));}};
    const api=await import(${JSON.stringify(pathToFileURL(bundle).href)});
    const input=await api.typedMaterialsFixture('pawfect-groom',3,${JSON.stringify(previous)});
    for(const product of input.materials.products)product.galleryMediaIds=[product.primaryMediaId];
    const draft=api.draftFromMaterials(input,Object.fromEntries(input.materials.media.map(media=>[media.id,{id:media.id}])));
    const digest=value=>createHash('sha256').update(value).digest('hex');const pages={};
    const options={projectId:'pawfect-release-preservation',lang:'en',page:'home',assetUrl:id=>'/confirmed/'+id,inquiryUrl:'https://site.example/inquiry',preview:true};
    for(const page of ${JSON.stringify(Object.keys(baseline.pages))}){const[kind,productId]=page.split(':');pages[page]=digest(api.renderSite(draft,{...options,page:kind,...(productId?{productId}:{})}));}
    console.log(JSON.stringify({contractSha256:digest(JSON.stringify(api.getMaterialsTemplate('pawfect-groom',${JSON.stringify(previous)}))),pages,runtimeSha256:digest(api.projectPreviewRuntimeForDraft(draft)),clientRuntimeSha256:digest(await api.referenceTemplatePreviewRuntime(draft))}));`;
  const result = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', script], { maxBuffer: 1024 * 1024 });
  releasedOutput = JSON.parse(result.stdout);
  api = await import(/* @vite-ignore */ pathToFileURL(bundle).href);
  const input = await api.typedMaterialsFixture('pawfect-groom', 3, previous);
  for (const product of input.materials.products) product.galleryMediaIds = [product.primaryMediaId];
  draft = api.draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
}, 30_000); // Bundle and load the frozen renderer within the full suite's concurrent workload.
afterAll(async () => { vi.useRealTimers(); if (directory) await rm(directory, { recursive: true, force: true }); });

describe('Pawfect appearance release 3', () => {
  it('keeps the published revision 2 contract and seven page outputs byte for byte', async () => {
    expect(releasedOutput.contractSha256).toBe(baseline.contractSha256);
    expect(releasedOutput.pages).toEqual(baseline.pages);
    expect(releasedOutput.runtimeSha256).toBe(baseline.runtimeSha256);
    expect(releasedOutput.clientRuntimeSha256).toBe(baseline.clientRuntimeSha256);
  });

  it('publishes only new appearance metadata while accepting the same confirmed materials', () => {
    const old = api.getMaterialsTemplate('pawfect-groom', previous)!;
    const next = api.getMaterialsTemplate('pawfect-groom')!;
    expect(next.contractRevision).toBe(current);
    expect(next.rendererRevision).toBe('2026-10-02.pawfect-groom-native.3');
    const withoutRelease = ({ contractRevision: _contract, rendererRevision: _renderer, ...contract }: MaterialsTemplateContract) => contract;
    expect(withoutRelease(next)).toEqual(withoutRelease(old));
    expect(api.getMaterialsTemplate('pawfect-groom', current)).toEqual(next);
    expect(api.getMaterialsTemplate('pawfect-groom', 'unknown')).toBeUndefined();
  });

  it('adds self-contained motion to publication and both trusted previews only for revision 3', async () => {
    const next = structuredClone(draft);
    next.materials!.contractRevision = current;
    const html = api.renderSite(next, options);
    const nodes = elements(parse(html));
    expect(html.split('</head>')[0]).toContain('pawfect-motion-prepaint');
    expect(html).toContain('expressive-v3');
    expect(nodes.filter(node => node.tagName === 'script').every(node => !attr(node, 'src'))).toBe(true);
    expect(html).not.toContain('/preview-guard.js');
    expect(html).not.toContain('data-wr-preview-disabled');
    const worker = api.projectPreviewRuntimeForDraft(next), client = await api.referenceTemplatePreviewRuntime(next);
    for (const runtime of [worker, client]) {
      expect(runtime).toContain('expressive-v3');
      expect(() => new Function(runtime)).not.toThrow();
    }
    expect(worker.startsWith(api.projectPreviewRuntimeForDraft(draft))).toBe(true);
  });

  it.each([0, 1, 2])('keeps product %i order as non-executable DOM data after preview script stripping', index => {
    const next = structuredClone(draft);
    next.materials!.contractRevision = current;
    const html = api.renderSite(next, { ...options, page: 'detail', productId: `p${index}` });
    const nodes = elements(parse(html));
    expect(attr(nodes.find(node => node.tagName === 'body')!, 'data-pawfect-product-order')).toBe(String(index));
    expect(html).toContain(`/confirmed/${next.products[index].imageAssetId}`);
    expect(nodes.find(node => attr(node, 'data-wr-material-product') === `p${index}`)).toBeDefined();
    const projected = projectPreviewHtml(html, '/proxy/project', 'https://web.example', { page: 'detail', lang: 'en', productId: `p${index}`, expectedVersion: 1 });
    expect(attr(elements(parse(projected)).find(node => node.tagName === 'body')!, 'data-pawfect-product-order')).toBe(String(index));
  });

  it('uses the approved compact header and process text links without mutating materials', () => {
    const next = structuredClone(draft);
    next.materials!.contractRevision = current;
    const before = JSON.stringify(next);
    for (const page of ['home', 'catalog', 'about', 'contact', 'detail']) {
      const nodes = elements(parse(api.renderSite(next, { ...options, page, productId: 'p0' })));
      const header = nodes.find(node => node.tagName === 'header')!;
      const nav = elements(header).find(node => node.tagName === 'nav')!;
      const links = elements(nav).filter(node => node.tagName === 'a');
      expect(links.map(node => attr(node, 'data-wr-page')), page).toEqual(['catalog', 'about']);
      for (const process of nodes.filter(node => attr(node, 'class') === 'pg-process')) {
        const links = elements(process).filter(node => node.tagName === 'a');
        expect(links.every(node => attr(node, 'class') === 'pg-text-link')).toBe(true);
        expect(links.every(node => attr(node, 'data-wr-page') || attr(node, 'href') === `mailto:${next.company.email}` || /^#[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(attr(node, 'href') || ''))).toBe(true);
      }
    }
    expect(JSON.stringify(next)).toBe(before);
  });
});
