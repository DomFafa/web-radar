import type { TemplateId } from './model';

// Retired renderers remain readable for saved projects; only these templates are discoverable.
export const ACTIVE_TEMPLATE_IDS = ['pawfect-groom', 'senseng-candy', 'senseng-video', 'senseng-nature', 'quantum-saas'] as const satisfies readonly TemplateId[];
export const DEFAULT_TEMPLATE: TemplateId = 'senseng-candy';
export function isActiveTemplate(id: string): boolean {
  return (ACTIVE_TEMPLATE_IDS as readonly string[]).includes(id);
}
