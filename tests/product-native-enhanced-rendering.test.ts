import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import baseline from './fixtures/product-native-v2-release-hashes.json';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const nodes = (node: Node): Element[] => [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(nodes) : [])];
const attr = (node: Element, name: string) => node.attrs.find(item => item.name === name)?.value;
const ids = Object.keys(baseline);
let directory: string;
let output: Record<string, { previous: typeof baseline.auravell; next: { html: string; worker: string; client: string; prepare: string } }>;

beforeAll(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'native-enhanced-rendering-'));
  const bundle = resolve(directory, 'api.mjs');
  await build({ stdin: { contents: `export {renderSite} from './src/templates';export {getMaterialsTemplate} from './src/templates/materials';export {draftFromMaterials} from './src/worker/materials-service';export {projectPreviewRuntimeForDraft} from './src/worker/project-preview';export {referenceTemplatePreviewRuntime,referenceTemplatePreviewPrepare} from './src/client/reference-template-preview';export {typedMaterialsFixture} from './tests/fixtures/materials-typed';`, resolveDir: process.cwd(), sourcefile: 'native-v2-api.ts' }, outfile: bundle, bundle: true, format: 'esm', platform: 'node', target: 'node22', keepNames: true });
  // Native Node preserves the executable function sources that Vitest rewrites.
  const script = `import {createHash} from 'node:crypto';
    const NativeDate=Date;globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-03T00:00:00Z']));}};
    const api=await import(${JSON.stringify(pathToFileURL(bundle).href)});
    const hash=v=>createHash('sha256').update(v).digest('hex'),output={};
    for(const id of ${JSON.stringify(ids)}){
      const revision='2026-10-02.'+id+'-materials.2',input=await api.typedMaterialsFixture(id,3,revision);
      for(const p of input.materials.products)p.galleryMediaIds=[p.primaryMediaId];
      const draft=api.draftFromMaterials(input,Object.fromEntries(input.materials.media.map(m=>[m.id,{id:m.id}]))),pages={};
      const options={projectId:'native-v2-preservation',lang:'en',assetUrl:id=>'/confirmed/'+id,inquiryUrl:'https://site.example/inquiry',preview:true};
      for(const key of ['home','catalog','about','contact','detail:p0','detail:p1','detail:p2']){const[page,productId]=key.split(':');pages[key]=hash(api.renderSite(draft,{...options,page,productId}));}
      const current=await api.typedMaterialsFixture(id,3,'2026-10-03.'+id+'-materials.3');
      const next=api.draftFromMaterials(current,Object.fromEntries(current.materials.media.map(m=>[m.id,{id:m.id}])));
      output[id]={previous:{revision,contractSha256:hash(JSON.stringify(api.getMaterialsTemplate(id,revision))),pages,workerRuntimeSha256:hash(api.projectPreviewRuntimeForDraft(draft)),clientRuntimeSha256:hash(await api.referenceTemplatePreviewRuntime(draft))},next:{html:api.renderSite(next,{...options,page:'home'}),worker:api.projectPreviewRuntimeForDraft(next),client:await api.referenceTemplatePreviewRuntime(next),prepare:api.referenceTemplatePreviewPrepare(next)}};
    }console.log(JSON.stringify(output));`;
  const result = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', script], { maxBuffer: 5 * 1024 * 1024 });
  output = JSON.parse(result.stdout);
}, 30_000);
afterAll(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });

describe('enhanced product-native appearance', () => {
  it.each(ids)('%s keeps its previous published contract, pages and preview scripts intact', id => {
    expect(output[id].previous).toEqual(baseline[id as keyof typeof baseline]);
  });

  it.each(ids)('%s provides self-contained motion in publication and both preview paths', id => {
    const next = output[id].next;
    expect(next.html.split('</head>')[0]).toContain('product-motion-prepaint');
    expect(next.prepare).toContain('product-motion-prepaint');
    for (const runtime of [next.worker, next.client]) {
      expect(runtime).toContain('product-scroll-enter');
      expect(() => new Function(runtime)).not.toThrow();
    }
    const body = nodes(parse(next.html)).find(node => node.tagName === 'body')!;
    expect(attr(body, 'data-wr-materials-revision')).toBe(`2026-10-03.${id}-materials.3`);
  });

  it('keeps five distinguishable native navigation structures', () => {
    const families = new Set<string>();
    for (const id of ids) {
      const all = nodes(parse(output[id].next.html));
      const header = all.find(node => node.tagName === 'header')!;
      expect(attr(header, 'data-wr-nav-layout')).toBeTruthy();
      families.add(attr(header, 'data-wr-nav-layout')!);
      const links = nodes(header).filter(node => node.tagName === 'a');
      expect(links.some(node => attr(node, 'data-wr-page') === 'home')).toBe(true);
      expect(links.some(node => attr(node, 'data-wr-page') === 'catalog')).toBe(true);
      expect(links.some(node => attr(node, 'data-wr-page') === 'about')).toBe(true);
      expect(links.some(node => attr(node, 'data-wr-page') === 'contact')).toBe(true);
    }
    expect(families.size).toBe(5);
  });

  it.each(['careflow-healthcare', 'lumi-business'])('%s exposes real products through its collection disclosure', id => {
    const disclosure = nodes(parse(output[id].next.html)).find(node => attr(node, 'data-product-nav-disclosure') !== undefined)!;
    expect(disclosure?.tagName).toBe('details');
    const links = nodes(disclosure).filter(node => node.tagName === 'a' && attr(node, 'data-wr-page') === 'detail');
    expect(links.map(node => attr(node, 'data-wr-product-id'))).toEqual(['p0', 'p1', 'p2']);
    expect(links.every(node => attr(node, 'href') === `products/${attr(node, 'data-wr-product-id')}/index.html`)).toBe(true);
  });

  it('keeps an independently bound original-product overview alongside Auravell’s collection banner', () => {
    const all = nodes(parse(output.auravell.next.html));
    const hero = all.find(node => attr(node, 'data-wr-material-image') === 'home-hero')!;
    expect(attr(hero, 'data-wr-material-product')).toBeUndefined();
    const card = all.find(node => attr(node, 'class')?.split(' ').includes('avp-hero-card'))!;
    expect(attr(card, 'data-wr-product-id')).toBe('p0');
    const main = nodes(card).find(node => attr(node, 'data-wr-material-image') === 'product-main')!;
    expect(attr(main, 'data-wr-material-product')).toBe('p0');
  });
});
