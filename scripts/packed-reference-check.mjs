import { gunzipSync } from 'node:zlib';

// Node/zlib releases can produce different gzip bytes for identical text.
// Compare decoded payloads while still checking the generated module structure.
export function packedReferenceModulesEqual(actual, expected) {
  const normalize = (source) => source.replace(/"H4sI[A-Za-z0-9+/=]+"/g, (literal) =>
    JSON.stringify(gunzipSync(Buffer.from(JSON.parse(literal), 'base64'), {
      maxOutputLength: 8 * 1024 * 1024,
    }).toString('utf8')),
  );
  return normalize(actual) === normalize(expected);
}
