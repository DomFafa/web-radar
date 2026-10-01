import type { Draft } from '../../shared/model';
import type { MaterialsTemplateContract } from '../../shared/materials';
import type { RenderOptions } from '../themes/types';
export function renderAuravellSite(draft: Draft, options: RenderOptions): string;
export function renderCareflowSite(draft: Draft, options: RenderOptions): string;
export function auravellRuntime(): void;
export function careflowRuntime(): void;
export function getAuravellMaterialsTemplate(revision?: string): MaterialsTemplateContract | undefined;
export function getCareflowMaterialsTemplate(revision?: string): MaterialsTemplateContract | undefined;
