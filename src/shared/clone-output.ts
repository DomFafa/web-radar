import type { CloneConfig } from './model';

export const hasCloneOutput = (config?: CloneConfig) =>
  Boolean(config?.artifact || config?.generatedHtml?.trim());

/** Only generation/restore writes these fields. A normal draft edit cannot forge an artifact. */
export function preserveCloneOutput(
  before: CloneConfig | undefined,
  next: CloneConfig | undefined,
) {
  if (!next) return next;
  const result = { ...next };
  for (const key of [
    'artifact',
    'generatedHtml',
    'generatedFiles',
    'generation',
    'generatedAt',
    'taskId',
    'status',
    'error',
  ] as const) {
    delete result[key];
    if (before?.[key] !== undefined) Object.assign(result, { [key]: before[key] });
  }
  return result;
}
