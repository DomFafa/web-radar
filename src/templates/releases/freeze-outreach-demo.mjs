/** New release only: never overwrite an already-published snapshot. */
import { build } from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, '../../..');
const authoringSource = 'src/templates/materials-outreach-demo-repair.ts';
const snapshot = resolve(dir, 'outreach-demo-20260923.mjs');
if (existsSync(snapshot)) throw Error('Release exists; use a new name');
const digest = value => createHash('sha256').update(value).digest('hex');
const result = await build({ entryPoints: [resolve(root, authoringSource)], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', keepNames: true, write: false,
  plugins: [{ name: 'immutable-dependencies', setup(build) { build.onResolve({ filter: /(?:demo|outreach)-20260923\.mjs$/ }, args => ({ path: './' + args.path.split('/').at(-1), external: true })); } }],
});
const body = '// Immutable repair for the eight PR #8 templates. Publish a new revision for later edits.\n' + result.outputFiles[0].text;
writeFileSync(snapshot, body);
const { getOutreachDemoContract } = await import(pathToFileURL(snapshot));
const { templates } = JSON.parse(readFileSync(resolve(dir, 'outreach-20260923.json'), 'utf8'));
const dependencies = Object.fromEntries(['demo-20260923.mjs', 'outreach-20260923.mjs', 'industry-preview-20260922.ts', 'outreach-assets-20260923.json'].map(path => [path, digest(readFileSync(resolve(dir, path)))]));
const contracts = Object.fromEntries(templates.map(id => { const contract = getOutreachDemoContract(id); return [id, { contractRevision: contract.contractRevision, sha256: digest(JSON.stringify(contract)) }]; }));
writeFileSync(resolve(dir, 'outreach-demo-20260923.json'), JSON.stringify({ rendererRevision: '2026-09-23.outreach-demo-repair.1', authoringSource, authoringSha256: digest(readFileSync(resolve(root, authoringSource))), snapshotSha256: digest(body), dependencies, contracts }, null, 2) + '\n');
console.log(JSON.stringify({ templates: templates.length, snapshotSha256: digest(body) }));
