import type { Asset } from '../src/shared/model';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getMaterialsTemplate } from '../src/templates/materials';
import { renderReleasedMaterials } from '../src/templates/materials-releases';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { draftFromMaterials } from '../src/worker/materials-service';
import { projectPreviewRuntimeForDraft } from '../src/worker/project-preview';
import {
  renderAuravellSite,
  renderCareflowSite,
  getAuravellMaterialsTemplate,
  getCareflowMaterialsTemplate,
} from '../src/templates/releases/native-20261001.mjs';
import manifest from '../src/templates/releases/native-20261001.manifest.json';

describe('reference motion release compatibility', () => {
  it('preserves the immutable original renderers and contracts', () => {
    const source = readFileSync(
      new URL('../src/templates/releases/native-20261001.mjs', import.meta.url),
    );
    expect(createHash('sha256').update(source).digest('hex')).toBe(manifest.sha256);
    const preview = readFileSync(
      new URL('../src/templates/releases/native-preview-20261001.mjs', import.meta.url),
    );
    expect(createHash('sha256').update(preview).digest('hex')).toBe(manifest.previewSha256);
  });
  for (const [id, contractFor, renderer] of [
    ['auravell', getAuravellMaterialsTemplate, renderAuravellSite],
    ['careflow-healthcare', getCareflowMaterialsTemplate, renderCareflowSite],
  ] as const) {
    it(`${id}: explicit old revision renders the original pages; new requests get motion v2`, async () => {
      const revision = `2026-10-01.${id}-materials.1`;
      const original = contractFor(revision)!;
      expect(getMaterialsTemplate(id, revision)).toEqual(original);
      expect(getMaterialsTemplate(id)?.contractRevision).toBe(`2026-10-01.${id}-materials.2`);
      const input = await typedMaterialsFixture(id, 2);
      const draft = draftFromMaterials(
        input,
        Object.fromEntries(input.materials.media.map((m) => [m.id, { id: m.id } as Asset])),
      );
      draft.materials!.contractRevision = revision;
      for (const page of ['home', 'catalog', 'about', 'contact', 'extra-plans']) {
        const options = {
          projectId: 'materials-demo',
          lang: 'en' as const,
          page,
          assetUrl: (value: string) => value,
          inquiryUrl: '/inquiry',
        };
        expect(renderReleasedMaterials(draft, options)).toBe(renderer(draft, options));
      }
      const runtime = projectPreviewRuntimeForDraft(draft);
      expect(runtime).not.toContain('function referenceMotionRuntime');
      // Serialised esbuild functions must carry their naming helper into the iframe.
      expect(runtime).toContain('var __name=');
    });
  }
});
