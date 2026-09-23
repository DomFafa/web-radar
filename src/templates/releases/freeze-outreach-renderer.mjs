/** Freeze the reviewed PR #8 templates without changing any earlier release. */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = resolve(process.argv[2] || '');
const sourceCommit = process.argv[3];
if (!process.argv[2] || sourceCommit !== 'ac2c8d3a581f3b934840ba0dbc5aaaf8ad10d9b1') throw Error('Pass the reviewed PR #8 checkout and full commit');
const dir = dirname(fileURLToPath(import.meta.url));
const name = 'outreach-20260923';
for (const file of [`${name}.mjs`, `${name}.json`, 'outreach-assets-20260923.json'])
  if (existsSync(resolve(dir, file))) throw Error('Release already exists; add a new release name');
const templates = ['pet-supplies-banner', 'pet-wellness-video', 'stationery-craft-banner', 'stationery-studio-video', 'poster-graphic-banner', 'poster-gallery-video', 'food-artisan-banner', 'food-harvest-video'];
const digest = value => createHash('sha256').update(value).digest('hex');
const immutable = ['baseline-20260922.mjs', 'industry-20260922.mjs'];
const dependencies = Object.fromEntries(immutable.map(file => ['./' + file, digest(readFileSync(resolve(source, 'src/templates/releases', file)))]));
const result = await build({
  plugins: [{ name: 'reuse-immutable-releases', setup(build) {
    build.onResolve({ filter: /(?:baseline|industry)-20260922\.mjs$/ }, args => ({ path: './' + args.path.split('/').at(-1), external: true }));
  } }],
  stdin: { contents: `export { renderSite } from './src/templates/index';
    import { getMaterialsTemplate as contract } from './src/templates/materials';
    const templates = ${JSON.stringify(templates)};
    export function getMaterialsTemplate(id, revision) { return templates.includes(id) ? contract(id, revision) : undefined; }`,
    resolveDir: source, sourcefile: 'outreach-materials-entry.ts' },
  bundle: true, format: 'esm', platform: 'browser', target: 'es2022', keepNames: true,
  minify: false, write: false, metafile: true, legalComments: 'inline',
});
const inputs = Object.keys(result.metafile.inputs);
if (inputs.some(path => /(?:^|\/)src\/(?:worker|client)\//.test(path))) throw Error('Renderer snapshot contains application code');
const body = '// Generated immutable PR #8 template renderer; publish a new revision instead of editing.\n' + result.outputFiles[0].text;
const publicDir = resolve(process.argv[4] || resolve(source, 'public'));
const files = path => readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
const assets = new Set(files(resolve(publicDir, 'templates')).map(path => '/' + relative(publicDir, path)).filter(path => body.includes(path)));
const externalCssUrls = new Set();
for (const path of assets) {
  if (!path.endsWith('.css')) continue;
  for (const match of readFileSync(resolve(publicDir, '.' + path), 'utf8').matchAll(/(?:url\(\s*|@import\s+)["']?([^\s"')]+)["']?/g)) {
    if (/^(?:data:|#)/.test(match[1])) continue;
    const url = new URL(match[1], 'https://frozen-assets.invalid' + path);
    if (url.origin !== 'https://frozen-assets.invalid') { externalCssUrls.add(url.href); continue; }
    if (url.pathname.startsWith('/templates/') && existsSync(resolve(publicDir, '.' + url.pathname))) assets.add(url.pathname);
  }
}
writeFileSync(resolve(dir, `${name}.mjs`), body);
writeFileSync(resolve(dir, `${name}.json`), JSON.stringify({ sourceCommit, templates, dependencies, sha256: digest(body), bytes: Buffer.byteLength(body), gzipBytes: gzipSync(body).length,
  inputs: inputs.map(path => path.includes('/node_modules/') ? 'node_modules/' + path.split('/node_modules/').at(-1) : path.replace(source + '/', '').replace(/^.*?(?=src\/)/, '')) }, null, 2) + '\n');
writeFileSync(resolve(dir, 'outreach-assets-20260923.json'), JSON.stringify({ sourceCommit, rendererSha256: digest(body), assets: Object.fromEntries([...assets].sort().map(path => [path, digest(readFileSync(resolve(publicDir, '.' + path)))])), externalCssUrls: [...externalCssUrls].sort() }, null, 2) + '\n');
console.log(JSON.stringify({ sourceCommit, templates: templates.length, bytes: Buffer.byteLength(body), gzipBytes: gzipSync(body).length, assets: assets.size }));
