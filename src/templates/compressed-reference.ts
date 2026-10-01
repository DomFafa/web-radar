import { Buffer } from 'node:buffer';
import { gunzipSync } from 'node:zlib';

/** Keep reference HTML/CSS out of the isolate's startup heap. Decompress only the
 * requested page, without retaining every rendered template in a global cache. */
export function lazyReferenceText(packed: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(packed)) {
    Object.defineProperty(result, key, {
      enumerable: true,
      get: () => gunzipSync(Buffer.from(value, 'base64'), { maxOutputLength: 8 * 1024 * 1024 }).toString('utf8'),
    });
  }
  return result;
}
