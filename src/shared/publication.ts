import type { Draft } from './model';

// Workflow metadata and generation instructions do not change an already generated website.
function content(draft: Draft) {
  const copy = structuredClone(draft);
  if (copy.cloneConfig) {
    const { taskId, status, error, generatedAt, generation, instructions, enhancementMode, autoPublish, ...published } = copy.cloneConfig;
    copy.cloneConfig = published;
  }
  return copy;
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',') + '}';
  return JSON.stringify(value);
}
export function samePublishedDraft(a: Draft, b: Draft) { return canonical(content(a)) === canonical(content(b)); }
