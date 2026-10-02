import { describe, expect, it } from 'vitest';
import type { Draft } from '../src/shared/model';
import { defaultDraft } from '../src/worker/domain';
import { brandColorPatch, templatePreviewDraft, templateSelectionPatch } from '../src/shared/template-brand-color';
import { brandColorPalette, withTemplateBrandColor } from '../src/templates/brand-color';

// Expected reference colors are intentionally independent of the implementation map.
const defaults = {
  auravell: '#99582a',
  'careflow-healthcare': '#6197de',
  'toorun-early-learning': '#3f6b52',
  'lumi-business': '#48a7ff',
  'pawfect-groom': '#38929a',
  'mello-coffee': '#78bf30',
  'senseng-candy': '#ff6b8b',
  'senseng-video': '#0284c7',
  'senseng-nature': '#4a7c59',
} as const;
const html = '<!doctype html><html><head><style>.original{background:#f7f3e9}</style></head><body class="original"><h1>Original design</h1><img src="/original.jpg" srcset="/original-2x.jpg 2x" style="filter:none;object-fit:contain"><video poster="/poster.jpg"><source src="/original.mp4"></video></body></html>';
const contrast = (a: string, b: string) => {
  const luminance = (color: string) => [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
};

describe('template brand color output boundary', () => {
  it.each(Object.entries(defaults))('keeps the original %s reference HTML when its default color is selected', (template, brandColor) => {
    const draft = { ...defaultDraft(), template: template as Draft['template'], brandColor };
    expect(withTemplateBrandColor(html, draft)).toBe(html);
  });

  it.each(Object.keys(defaults))('applies a custom color to %s without editing media or the saved draft', template => {
    const draft = { ...defaultDraft(), template: template as Draft['template'], brandColor: '#B42318' };
    const before = structuredClone(draft);
    const output = withTemplateBrandColor(html, draft);
    expect(output).toContain('data-wr-brand-color="#b42318"');
    expect(output).toContain('class="original wr-brand-color"');
    expect(output).toContain('--wr-brand:#b42318');
    expect(output).toContain('<style>.original{background:#f7f3e9}</style>');
    expect(output.match(/<(?:img|video|source)\b[^>]*>/g)).toEqual(html.match(/<(?:img|video|source)\b[^>]*>/g));
    expect(draft).toEqual(before);
  });

  it.each(['red', '#abc', '#11223344', '#12345g', '#123456;}</style><script>alert(1)</script>'])('rejects invalid or executable color %s', brandColor => {
    expect(withTemplateBrandColor(html, { ...defaultDraft(), template: 'mello-coffee', brandColor })).toBe(html);
  });

  it('leaves an unlisted template untouched', () => {
    expect(withTemplateBrandColor(html, { ...defaultDraft(), template: 'natural', brandColor: '#b42318' })).toBe(html);
  });

  it.each(['#000000', '#ffffff', '#b42318', '#facc15', '#1e3a8a', '#00ffff'])('keeps normal-size button text and light-surface links readable for %s', color => {
    const palette = brandColorPalette(color);
    expect(palette.primary).toBe(color);
    expect(contrast(palette.primary, palette.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.link, '#ffffff')).toBeGreaterThanOrEqual(5);
  });
});

describe('brand color editor and template trial', () => {
  it('changes the template default while retaining an explicitly selected customer color', () => {
    const original = { ...defaultDraft(), template: 'mello-coffee' as const, brandColor: '#78bf30' };
    expect(templateSelectionPatch(original, 'auravell').brandColor).toBe('#99582a');
    const custom = { ...original, brandColor: '#b42318' };
    const before = structuredClone(custom);
    expect(templateSelectionPatch(custom, 'auravell').brandColor).toBe('#b42318');
    expect(templatePreviewDraft(custom, 'auravell').brandColor).toBe('#b42318');
    expect(custom).toEqual(before);
  });

  it('updates only the primary material color and preserves a historical contract and its image bindings', () => {
    const draft = { ...defaultDraft(), template: 'senseng-candy' as const };
    draft.materials = {
      templateId: 'senseng-candy', contractRevision: '2026-09-23.senseng-candy-materials.6',
      visual: { palette: { primary: '#112233', secondary: '#446655', background: '#fdfaf0', surface: '#ffffff', text: '#223344', mutedText: '#667788' }, backgroundStyle: 'plain', imageTreatment: 'natural', compositionSummary: 'Confirmed imagery' },
      imageBindings: [{ slotId: 'product-main', productId: 'p1', assetId: 'original', fit: 'contain', focalPoint: { x: .5, y: .5 }, alt: { en: 'Real product' } }],
      textBindings: [], omittedSectionIds: [],
    };
    const before = structuredClone(draft);
    const next = { ...draft, ...brandColorPatch(draft, '#FACC15') };
    expect(next.brandColor).toBe('#facc15');
    expect(next.materials!.visual.palette).toEqual({ ...before.materials!.visual.palette, primary: '#facc15' });
    expect(next.materials!.contractRevision).toBe(before.materials!.contractRevision);
    expect(next.materials!.imageBindings).toEqual(before.materials!.imageBindings);
    expect(withTemplateBrandColor(html, next)).toContain('data-wr-brand-color="#facc15"');
    expect(draft).toEqual(before);
  });
});
