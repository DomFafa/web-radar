import type { Draft, TemplateId } from './model';
import type { ACTIVE_TEMPLATE_IDS } from './template-availability';

/** Template defaults are used only until the customer chooses a different brand color. */
export const TEMPLATE_BRAND_COLORS: Readonly<Record<typeof ACTIVE_TEMPLATE_IDS[number], string>> = {
  auravell: '#99582a',
  'careflow-healthcare': '#6197de',
  'toorun-early-learning': '#3f6b52',
  'lumi-business': '#48a7ff',
  'pawfect-groom': '#38929a',
  'mello-coffee': '#78bf30',
  'senseng-candy': '#ff6b8b',
  'senseng-video': '#0284c7',
  'senseng-nature': '#4a7c59',
};

export function templateBrandColor(id: string): string | undefined {
  return Object.hasOwn(TEMPLATE_BRAND_COLORS, id)
    ? (TEMPLATE_BRAND_COLORS as Readonly<Record<string, string>>)[id] : undefined;
}

export function brandColorPatch(draft: Draft, color: string): Partial<Draft> {
  if (!/^#[a-f0-9]{6}$/i.test(color)) return {};
  const brandColor = color.toLowerCase();
  return {
    brandColor,
    ...(draft.materials ? {
      materials: {
        ...draft.materials,
        visual: {
          ...draft.materials.visual,
          palette: { ...draft.materials.visual.palette, primary: brandColor },
        },
      },
    } : {}),
  };
}

export function templateSelectionPatch(draft: Draft, template: TemplateId): Partial<Draft> {
  const currentColor = /^#[a-f0-9]{6}$/i.test(draft.brandColor) ? draft.brandColor.toLowerCase() : undefined;
  const useDefault = !currentColor || (template !== draft.template && currentColor === templateBrandColor(draft.template));
  const color = useDefault ? templateBrandColor(template) || currentColor || '#089ced' : currentColor || '#089ced';
  return { buildBranch: 'template', template, ...brandColorPatch(draft, color) };
}

/** A template trial uses the same color choice as selecting it, without editing the saved draft. */
export function templatePreviewDraft(draft: Draft, template: TemplateId): Draft {
  return { ...draft, ...templateSelectionPatch(draft, template), cloneConfig: undefined, siteDesign: undefined };
}
