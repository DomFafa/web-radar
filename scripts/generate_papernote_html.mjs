import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('artifacts/papernote-gen');
await mkdir(output, { recursive: true });
await build({
  stdin: {
    contents: "export { renderSite } from './src/templates'; export { defaultDraft } from './src/worker/domain';",
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  outfile: output + '/renderer.mjs',
  bundle: true,
  format: 'esm',
  platform: 'node',
  keepNames: true,
});

const { renderSite, defaultDraft } = await import(output + '/renderer.mjs');
const d = defaultDraft();
d.template = 'papernote';
d.brandColor = '#ffe68c';
d.company = {
  ...d.company,
  name: 'Monica',
  slogan: 'A Graphic Designer with 3+ years of experience, building awesome logos and brand identity for cool companies :)',
  address: 'Los Angeles, California',
  email: 'Monica115@gmail.com',
};

const html = renderSite(d, {
  projectId: 'papernote-demo',
  lang: 'en',
  page: 'home',
  assetUrl: (id) => `/templates/papernote/${id}`,
  inquiryUrl: '#inquiry',
});

await writeFile('public/templates/papernote/index.html', html, 'utf8');
console.log('Successfully generated public/templates/papernote/index.html');
