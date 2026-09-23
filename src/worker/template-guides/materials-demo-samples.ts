import samples from './materials-demo-samples-20260923.json';
import outreachSamples from './materials-demo-outreach-samples-20260923.json';

export interface DemoSampleAsset { url: string; sha256: string }
export interface DemoSampleProduct extends DemoSampleAsset { name: string }
export interface DemoSamples {
  label: string;
  status: 'illustration' | 'product-image' | 'unavailable';
  limitation: string;
  products: DemoSampleProduct[];
  collection: DemoSampleAsset;
}

/** This fixture belongs only to .6. Keep older demos and future sample revisions separate. */
export function getMaterialsDemoSamples(templateId: string, contractRevision: string): DemoSamples | undefined {
  if (contractRevision !== `2026-09-23.${templateId}-materials.6`) return;
  const source = Object.hasOwn(outreachSamples.templates, templateId) ? outreachSamples : samples;
  const family = (source.templates as Record<string, string>)[templateId];
  return (source.families as Record<string, DemoSamples>)[family];
}

export const unavailablePackagingSample: DemoSampleAsset = samples.packaging;
