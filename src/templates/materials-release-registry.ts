import type { MaterialsTemplateContract } from '../shared/materials';

/** Each authored release binds its public slots to an immutable renderer release. */
export interface MaterialsTemplateRelease {
  name: string;
  contract: MaterialsTemplateContract;
  rendererTemplateId: string;
  rendererContractRevision: string;
  imageSlotMap: Record<string, string>;
  textSlotMap: Record<string, string>;
}

/** Register reviewed templates here; test fixtures are added only to isolated test builds. */
export const additionalMaterialsReleases: readonly MaterialsTemplateRelease[] = [];
