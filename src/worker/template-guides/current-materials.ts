import { isActiveTemplate } from '../../shared/template-availability';
import { productAboutCollectionMaterialsRevision } from '../../shared/product-native-materials';
import { getMaterialsTemplate } from '../../templates/materials';

/** New requests use the current release; an explicitly saved revision stays pinned. */
export function currentMaterialsTemplate(templateId: string, revision?: string) {
  return getMaterialsTemplate(templateId, revision ?? (isActiveTemplate(templateId) ? productAboutCollectionMaterialsRevision(templateId) : undefined));
}
