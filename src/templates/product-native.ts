import type { Draft } from '../shared/model';
import { isProductNativeRevision } from '../shared/product-native-materials';
import { getAuravellProductMaterials } from './themes/auravell/product-materials';
import { renderAuravellProductSite } from './themes/auravell/product-renderer';
import { getCareflowProductMaterials } from './themes/careflow/product-materials';
import { renderCareflowProductSite } from './themes/careflow/product-renderer';
import { getLumiProductMaterials } from './themes/lumi/product-materials';
import { renderLumiProductSite } from './themes/lumi/product-renderer';
import { getToorunProductMaterials } from './themes/toorun/product-materials';
import { renderToorunProductSite } from './themes/toorun/product-renderer';
import { getMelloProductMaterials } from './themes/mello/product-materials';
import { renderMelloProductSite } from './themes/mello/product-renderer';
import type { RenderOptions } from './themes/types';

const releases = {
  auravell: { contract: getAuravellProductMaterials, render: renderAuravellProductSite },
  'careflow-healthcare': { contract: getCareflowProductMaterials, render: renderCareflowProductSite },
  'toorun-early-learning': { contract: getToorunProductMaterials, render: renderToorunProductSite },
  'lumi-business': { contract: getLumiProductMaterials, render: renderLumiProductSite },
  'mello-coffee': { contract: getMelloProductMaterials, render: renderMelloProductSite },
};

/** Candidates are opt-in by revision. No existing catalog default or saved release changes. */
export function getProductNativeContract(templateId: string, revision?: string) {
  if (!isProductNativeRevision(templateId, revision)) return;
  return releases[templateId as keyof typeof releases].contract(revision);
}
export function renderProductNativeSite(draft: Draft, options: RenderOptions): string | undefined {
  if (!isProductNativeRevision(draft.template, draft.materials?.contractRevision)) return;
  return releases[draft.template as keyof typeof releases].render(draft, options);
}
