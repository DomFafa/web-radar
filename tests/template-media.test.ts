import { describe, expect, it } from 'vitest';
import { TEMPLATES } from '../src/client/TemplateSelector';
import { templateMediaRequirements } from '../src/shared/template-media';
import { referenceLayouts } from '../src/templates/themes/referenceLayouts';

describe('template media checklist stays aligned with the renderer', () => {
  it('covers exactly the selectable templates', () => {
    expect(Object.keys(templateMediaRequirements).sort()).toEqual(
      TEMPLATES.map((t) => t.id).sort(),
    );
  });
  it.each(
    Object.entries(referenceLayouts).filter(([id]) => id in templateMediaRequirements),
  )(
    '%s reflects actual image slots and bundled videos',
    (id, layout) => {
      const media = templateMediaRequirements[id as keyof typeof templateMediaRequirements]!;
      expect(media.productCount).toBe(layout.slots.length);
      expect(media.videos).toBe((layout.html.match(/<video\b/g) || []).length);
      const dimensions = layout.slots.map((s) => `${s.width}x${s.height}`).sort();
      expect(
        media.slots.flatMap((s) => Array(s.count).fill(`${s.width}x${s.height}`)).sort(),
      ).toEqual(dimensions);
    },
  );
});
