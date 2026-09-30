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

it('keeps retired plugin contracts readable without advertising additional templates', async () => {
  const catalog = await materialsCatalog();
  expect(catalog.templates.map(t => t.templateId).sort()).toEqual(['senseng-candy', 'senseng-nature', 'senseng-video']);
  expect(getMaterialsTemplate('integration-showcase')).toBeDefined();
  expect(getMaterialsTemplate('invalid-plugin')).toBeUndefined();
});
