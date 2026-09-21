/** Freeze reviewed preview code and retain the renderer's local static dependency bytes. */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = resolve(process.argv[2] || '');
const sourceCommit = process.argv[3];
if (!process.argv[2] || !/^[a-f0-9]{40}$/.test(sourceCommit || '')) throw Error('Pass a reviewed source checkout and full commit');
const dir = dirname(fileURLToPath(import.meta.url));
for (const name of ['baseline-preview-20260922.ts', 'baseline-preview-20260922.json', 'baseline-assets-20260922.json'])
  if (existsSync(resolve(dir, name))) throw Error('Release already exists; add a new release name');
const digest = value => createHash('sha256').update(value).digest('hex');
const result = await build({ stdin: { contents: "export { projectPreviewRuntime } from './src/worker/project-preview';", resolveDir: source, sourcefile: 'preview-runtime-entry.ts' }, bundle: true, format: 'esm', platform: 'browser', target: 'es2022', keepNames: true, minify: false, write: false, metafile: true, legalComments: 'none' });
const { projectPreviewRuntime } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
const snapshot = '// Generated from reviewed baseline; never replace a published runtime.\nexport const frozenMaterialsPreviewRuntime: string = ' + JSON.stringify(projectPreviewRuntime) + ';\n';

const renderer = readFileSync(resolve(dir, 'baseline-20260922.mjs'), 'utf8');
const publicDir = resolve(source, 'public');
const files = path => readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
const dependencies = new Set(files(resolve(publicDir, 'templates')).map(path => '/' + relative(publicDir, path)).filter(path => renderer.includes(path)));
const externalCssUrls = new Set();
for (const path of dependencies) {
  if (!path.endsWith('.css')) continue;
  const css = readFileSync(resolve(publicDir, '.' + path), 'utf8');
  for (const match of css.matchAll(/(?:url\(\s*|@import\s+)["']?([^\s"')]+)["']?/g)) {
    if (/^(?:data:|#)/.test(match[1])) continue;
    const url = new URL(match[1], 'https://frozen-assets.invalid' + path);
    if (url.origin !== 'https://frozen-assets.invalid') { externalCssUrls.add(url.href); continue; }
    if (url.pathname.startsWith('/templates/') && existsSync(resolve(publicDir, '.' + url.pathname))) dependencies.add(url.pathname);
  }
}
const assets = Object.fromEntries([...dependencies].sort().map(path => [path, digest(readFileSync(resolve(publicDir, '.' + path)))]));
writeFileSync(resolve(dir, 'baseline-preview-20260922.ts'), snapshot);
writeFileSync(resolve(dir, 'baseline-preview-20260922.json'), JSON.stringify({ sourceCommit, runtimeSha256: digest(projectPreviewRuntime), runtimeBytes: Buffer.byteLength(projectPreviewRuntime), snapshotSha256: digest(snapshot) }, null, 2) + '\n');
writeFileSync(resolve(dir, 'baseline-assets-20260922.json'), JSON.stringify({ sourceCommit, rendererSha256: digest(renderer), assets, externalCssUrls: [...externalCssUrls].sort() }, null, 2) + '\n');
console.log(JSON.stringify({ sourceCommit, runtimeBytes: Buffer.byteLength(projectPreviewRuntime), assetCount: dependencies.size, externalCssUrlCount: externalCssUrls.size }));
