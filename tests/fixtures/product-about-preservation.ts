import { createHash } from 'node:crypto';
import { renderSite } from '../../src/templates';
import { getMaterialsTemplate } from '../../src/templates/materials';
import { draftFromMaterials } from '../../src/worker/materials-service';
import { projectPreviewRuntimeForDraft } from '../../src/worker/project-preview';
import { referenceTemplatePreviewRuntime } from '../../src/client/reference-template-preview';
import type { Asset } from '../../src/shared/model';
import { typedMaterialsFixture } from './materials-typed';

/** Execute with native Node, so published function sources are not rewritten by Vitest. */
export async function aboutPreviousReleaseHashes() {
  const output: Record<string, unknown> = {};
  const hash = (value: string) => createHash('sha256').update(value).digest('hex');
  for (const id of ['pawfect-groom', 'auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee']) {
    const revision = `2026-10-03.${id}-materials.4`;
    const input = await typedMaterialsFixture(id, 2, revision);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const pages: Record<string, string> = {};
    for (const key of ['home', 'catalog', 'about', 'contact', 'detail:p0', 'detail:p1']) {
      const [page, productId] = key.split(':');
      pages[key] = hash(renderSite(draft, { projectId: 'about-v4-preservation', lang: 'en', page, productId, assetUrl: id => `/confirmed/${id}`, inquiryUrl: 'https://site.example/inquiry', preview: true }));
    }
    output[id] = {
      revision, contract: hash(JSON.stringify(getMaterialsTemplate(id, revision))), pages,
      worker: hash(projectPreviewRuntimeForDraft(draft)), client: hash(await referenceTemplatePreviewRuntime(draft)),
    };
  }
  return output;
}
