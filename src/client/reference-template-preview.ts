import type { Draft } from '../shared/model';
import { referenceMotionRuntime } from '../templates/themes/reference-motion';
import { auravellRuntime } from '../templates/themes/auravell/runtime';
import { careflowRuntime } from '../templates/themes/careflow/runtime';

/** Only reviewed local code enters the preview's nonce-protected script. */
export async function referenceTemplatePreviewRuntime(draft: Draft): Promise<string> {
  if (!['auravell', 'careflow-healthcare'].includes(draft.template)) return '';
  const revision = draft.materials?.contractRevision;
  if (revision === `2026-10-01.${draft.template}-materials.1`) {
    const legacy = await import('../templates/releases/native-preview-20261001.mjs');
    const runtime = draft.template === 'auravell' ? legacy.auravellRuntime : legacy.careflowRuntime;
    return `;(${runtime.toString()})();`;
  }
  const runtime = draft.template === 'auravell' ? auravellRuntime : careflowRuntime;
  return `;(${referenceMotionRuntime.toString()})();(${runtime.toString()})();`;
}
