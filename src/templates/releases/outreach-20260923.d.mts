import type { Draft } from '../../shared/model';
import type { MaterialsTemplateContract } from '../../shared/materials';
import type { RenderOptions } from '../index';
export function renderSite(draft: Draft, options: RenderOptions): string;
export function getMaterialsTemplate(id: string, revision?: string): MaterialsTemplateContract | undefined;
