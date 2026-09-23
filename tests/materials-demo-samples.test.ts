import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getMaterialsTemplate } from '../src/templates/materials';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { getMaterialsDemoSamples, unavailablePackagingSample } from '../src/worker/template-guides/materials-demo-samples';
import samples from '../src/worker/template-guides/materials-demo-samples-20260923.json';

describe('revision-pinned materials demo samples', () => {
  it('uses tools examples instead of toys only for the new demo revision', () => {
    const current = materialsDemoDraft(getMaterialsTemplate('tools-workshop-video')!, 'en');
    expect(current.copy.en?.headline).toContain('Tools');
    expect(current.products[0].name).toBe('Wrench illustration');
    expect(current.products[0].imageAssetId).toContain('/materials-demo-20260923/');
    expect(current.products[0].name).not.toContain('toy');
    const historical = materialsDemoDraft(getMaterialsTemplate('tools-workshop-video', '2026-09-22.tools-workshop-video-materials.5')!, 'en');
    expect(historical.products[0].name).toBe('Example toy 1');
    expect(historical.products[0].imageAssetId).toBe('/templates/juno-display-demo/front-0.svg');
  });

  it('states missing category photos instead of reusing unrelated toy pictures', () => {
    for (const id of ['luggage-leather-banner', 'jewelry-luxury-banner', 'homedecor-aesthetic-banner', 'furniture-minimal-banner', 'kitchen-culinary-banner']) {
      const profile = getMaterialsTemplate(id)!;
      const demo = materialsDemoDraft(profile, 'en');
      expect(getMaterialsDemoSamples(id, profile.contractRevision)?.status).toBe('unavailable');
      expect(demo.copy.en?.subtitle).toContain('photos have not been supplied');
      expect(demo.products.every(product => !product.imageAssetId?.includes('/senseng/'))).toBe(true);
    }
  });

  it('does not declare an unrelated product image as packaging evidence', () => {
    const demo = materialsDemoDraft(getMaterialsTemplate('tools-workshop-video')!, 'en');
    expect(demo.products[0].gallery?.[1].assetId).toBe(unavailablePackagingSample.url);
    expect(demo.products[0].gallery?.[1].caption).toBe('Packaging photo not supplied');
    const packaging = demo.materials!.imageBindings.filter(binding => binding.role === 'packaging');
    for (const binding of packaging) {
      expect(binding.assetId).toBe(unavailablePackagingSample.url);
      expect(binding.evidenceAssetIds).toEqual([]);
    }
  });

  it('pins each sample asset to its committed bytes', () => {
    expect(Object.keys(samples.templates)).toHaveLength(39);
    const assets = [unavailablePackagingSample, ...Object.values(samples.families).flatMap(family => [...family.products, family.collection])];
    for (const asset of assets) {
      expect(asset.url).toMatch(/^\/templates\/materials-demo-20260923\//);
      const bytes = readFileSync(resolve('public', `.${asset.url}`));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
      if (asset.url.endsWith('.svg')) {
        const visibleText = [...bytes.toString().matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(match => match[1]).join(' ');
        expect(visibleText).not.toMatch(/\bQC\b|\bPASS\b|UIAA|CLINICAL-GRADE/);
      }
    }
  });
});
