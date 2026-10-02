import { describe, expect, it, vi } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import TemplateSelector, { TEMPLATES } from '../src/client/TemplateSelector';
import type { Draft } from '../src/shared/model';
import { ACTIVE_TEMPLATE_IDS } from '../src/shared/template-availability';
import { templateBrandColor, templatePreviewDraft, TEMPLATE_BRAND_COLORS } from '../src/shared/template-brand-color';
import { defaultDraft } from '../src/worker/domain';

// Inspect the selector's returned element tree so the real click/keyboard handlers
// run without a browser or unrelated editor network calls.
function elements(node: ReactNode): ReactElement<Record<string, any>>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, any>>(node)) return [];
  return [node, ...elements(node.props.children)];
}

function customerDraft(template: Draft['template']): Draft {
  return {
    ...defaultDraft(), template, brandColor: '#b42318',
    materials: {
      templateId: template, contractRevision: '2026-09-23.historical-materials.1',
      visual: {
        palette: { primary: '#b42318', secondary: '#445566', background: '#fefcf8', surface: '#ffffff', text: '#112233', mutedText: '#667788' },
        backgroundStyle: 'plain', imageTreatment: 'natural', compositionSummary: 'Customer materials',
      },
      imageBindings: [{ slotId: 'product-main', productId: 'p1', assetId: 'approved-photo', fit: 'contain', focalPoint: { x: .5, y: .5 }, alt: { en: 'Customer product' } }],
      textBindings: [], omittedSectionIds: [],
    },
  };
}

describe('template selector brand color interactions', () => {
  it('uses a single default catalog for all active template cards', () => {
    expect(Object.keys(TEMPLATE_BRAND_COLORS).sort()).toEqual([...ACTIVE_TEMPLATE_IDS].sort());
    for (const template of TEMPLATES) expect(template.accentColor).toBe(templateBrandColor(template.id));
    expect(templateBrandColor('toString')).toBeUndefined();
  });

  it.each(ACTIVE_TEMPLATE_IDS)('keeps the customer color when selecting or previewing %s', template => {
    const draft = customerDraft(template);
    const before = structuredClone(draft);
    const onUpdateDraft = vi.fn<(patch: Partial<Draft>) => void>();
    const onPreview = vi.fn();
    const tree = elements(TemplateSelector({ draft, onUpdateDraft, onPreview, onProceedToPublish() {}, onBackToBasics() {} }));
    const cards = tree.filter(element => element.props.className?.split(' ').includes('template-card'));
    expect(cards).toHaveLength(ACTIVE_TEMPLATE_IDS.length);
    for (const card of cards) {
      card.props.onClick();
      expect(onUpdateDraft.mock.lastCall![0]).toMatchObject({ brandColor: '#b42318', materials: { visual: { palette: { primary: '#b42318' } } } });
      const event = { target: card, currentTarget: card, key: 'Enter', preventDefault: vi.fn() };
      card.props.onKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledOnce();
      expect(onUpdateDraft.mock.lastCall![0].brandColor).toBe('#b42318');
      const select = elements(card).find(element => element.props.className?.split(' ').includes('select-tmpl-btn'))!;
      const stopPropagation = vi.fn();
      select.props.onClick({ stopPropagation });
      expect(stopPropagation).toHaveBeenCalledOnce();
      expect(onUpdateDraft.mock.lastCall![0].brandColor).toBe('#b42318');
      const preview = elements(card).find(element => element.props['aria-label']?.startsWith('预览 '))!;
      preview.props.onClick({ stopPropagation: vi.fn() });
      expect(templatePreviewDraft(draft, onPreview.mock.lastCall![0].id).brandColor).toBe('#b42318');
    }
    expect(draft).toEqual(before);
  });

  it('updates the local material primary color for presets and the custom picker before saving', () => {
    const draft = customerDraft('lumi-business');
    const before = structuredClone(draft);
    const onUpdateDraft = vi.fn<(patch: Partial<Draft>) => void>();
    const tree = elements(TemplateSelector({ draft, onUpdateDraft, onPreview() {}, onProceedToPublish() {}, onBackToBasics() {} }));
    const preset = tree.find(element => element.props.className?.split(' ').includes('color-pill'))!;
    preset.props.onClick();
    const presetPatch = onUpdateDraft.mock.lastCall![0];
    expect(presetPatch.materials!.visual.palette.primary).toBe(presetPatch.brandColor);
    const picker = tree.find(element => element.type === 'input' && element.props.type === 'color')!;
    picker.props.onChange({ target: { value: '#FACC15' } });
    const patch = onUpdateDraft.mock.lastCall![0];
    expect(patch.brandColor).toBe('#facc15');
    expect(patch.materials!.visual.palette).toEqual({ ...before.materials!.visual.palette, primary: '#facc15' });
    expect(patch.materials!.contractRevision).toBe(before.materials!.contractRevision);
    expect(patch.materials!.imageBindings).toEqual(before.materials!.imageBindings);
    expect(draft).toEqual(before);
  });
});
