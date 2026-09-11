export interface MergeConflict {
  path: string;
  mine: unknown;
  theirs: unknown;
}
export function mergeVersions<T>(
  base: T,
  mine: T,
  theirs: T,
  choices: Record<string, 'mine' | 'theirs'> = {},
): { value: T; conflicts: MergeConflict[] } {
  const conflicts: MergeConflict[] = [];
  const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const record = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);
  function merge(a: unknown, b: unknown, c: unknown, path: string): unknown {
    if (equal(b, a)) return c;
    if (equal(c, a) || equal(b, c)) return b;
    if (record(a) && record(b) && record(c))
      return Object.fromEntries(
        [...new Set([...Object.keys(a), ...Object.keys(b), ...Object.keys(c)])].map((key) => [
          key,
          merge(a[key], b[key], c[key], path ? `${path}.${key}` : key),
        ]),
      );
    if (choices[path]) return choices[path] === 'mine' ? b : c;
    conflicts.push({ path, mine: b, theirs: c });
    return b;
  }
  return { value: merge(base, mine, theirs, '') as T, conflicts };
}
