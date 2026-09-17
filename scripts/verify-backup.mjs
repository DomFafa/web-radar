/** Offline integrity verification only; this never uploads, overwrites or deletes anything. */
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { createHash } from 'node:crypto';
const [exportFile, root] = process.argv.slice(2);
if (!exportFile || !root)
  throw new Error('Usage: node scripts/verify-backup.mjs /secure/export.json /secure/r2-copy');
const snapshot = JSON.parse(await readFile(exportFile, 'utf8'));
if (snapshot.format !== 'web-radar-business-v1' || !Array.isArray(snapshot.media?.objects))
  throw new Error('Export does not include the object manifest; create a fresh export.');
let checked = 0,
  optionalMissing = 0;
for (const object of snapshot.media.objects) {
  const file = resolve(root, object.key),
    path = relative(resolve(root), file);
  if (isAbsolute(path) || path === '..' || path.startsWith('..' + sep))
    throw new Error('Invalid object path in export.');
  try {
    if (!(await stat(file)).isFile()) throw new Error('Expected a regular object file.');
    const bytes = await readFile(file);
    if (object.sha256 && createHash('sha256').update(bytes).digest('hex') !== object.sha256)
      throw new Error('Artifact digest mismatch: ' + object.key);
    checked++;
  } catch (error) {
    if (!object.required && error.code === 'ENOENT') optionalMissing++;
    else throw error;
  }
}
console.log(JSON.stringify({ checked, optionalMissing, restorePerformed: false }));
