import { expect, it, vi } from 'vitest';

vi.mock('../src/templates/materials-release-registry', async () => {
  const fixture = (await import('./fixtures/materials-plugin-release.json')).default;
  const invalid = structuredClone(fixture);
  invalid.contract.templateId = 'invalid-plugin';
  invalid.contract.requiredCapabilities.push('unsupported.execution.v1');
  return { additionalMaterialsReleases: [fixture, invalid] };
});

import { materialsCatalog } from '../src/worker/template-guides/materials-catalog';
import { getMaterialsTemplate } from '../src/templates/materials';
import { sha256 } from '../src/worker/http';

it('discovers a validated plugin without consumer changes and excludes invalid execution contracts', async () => {
  const catalog = await materialsCatalog();
  const plugin = catalog.templates.find(t => t.templateId === 'integration-showcase')!;
  expect(plugin).toBeDefined();
  expect(catalog.templates.some(t => t.templateId === 'invalid-plugin')).toBe(false);
  expect(plugin.contractSha256).toBe(await sha256(JSON.stringify(getMaterialsTemplate(plugin.templateId, plugin.contractRevision!))));
  expect(plugin.requirementsPath).toContain(encodeURIComponent(plugin.contractRevision!));
  // A missing corresponding cover is explicit; never borrow another template's image.
  expect(plugin.thumbnailUrl).toBeNull();
  expect(plugin.thumbnailRevision).toBeNull();
});
