import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const source = new URL('./src/', import.meta.url);
const output = new URL('./dist/', import.meta.url);
const files = await readdir(source);

if (!files.includes('index.html') || !files.includes('app.js') || !files.includes('styles.css')) {
  throw new Error('RPA console source is incomplete');
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
console.log(`Built RPA console from ${root}src/ into ${root}dist/`);
