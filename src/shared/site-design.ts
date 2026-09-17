import { hasCloneOutput } from './clone-output';
import type { BaseDesignPage, DesignPage, Draft, SiteDesign } from './model';

export const designPages: readonly DesignPage[] = ['home', 'catalog', 'detail', 'about', 'contact'];
export const designLabels: Record<BaseDesignPage, string> = {
  home: '首页',
  catalog: '产品页',
  detail: '产品详情页',
  about: '关于页',
  contact: '联系页',
};
export const siteInputKey = (d: Draft) =>
  JSON.stringify({
    company: { ...d.company, faviconAssetId: undefined },
    products: d.products,
    primaryProductId: d.primaryProductId,
    category: d.category,
    country: d.country,
    languages: d.languages,
    template: d.template,
    brandColor: d.brandColor,
    copy: d.copy,
    direction: d.direction,
    brief: d.consultation?.brief,
    briefConfirmed: d.consultation?.confirmed,
  });
export function resetDesignForEdit(previous: Draft, next: Draft): void {
  next.siteDesign = previous.siteDesign
    ? siteInputKey(previous) === siteInputKey(next)
      ? structuredClone(previous.siteDesign)
      : { revision: previous.siteDesign.revision + 1, pages: {} }
    : undefined;
}
export function homeConfirmed(design?: SiteDesign): boolean {
  return (
    !!design?.pages.home?.imageAssetId &&
    design.homeConfirmedAssetId === design.pages.home.imageAssetId
  );
}
export function designPageIds(design?: SiteDesign): readonly DesignPage[] {
  return design?.pageIds ?? designPages;
}
export function designKey(design: SiteDesign): string {
  return JSON.stringify([
    design.revision,
    ...designPageIds(design).map((id) => design.pages[id]?.imageAssetId ?? ''),
  ]);
}
export function designsConfirmed(design?: SiteDesign): boolean {
  return (
    !!design &&
    homeConfirmed(design) &&
    designPageIds(design).every((id) => !!design.pages[id]?.imageAssetId) &&
    design.confirmedKey === designKey(design)
  );
}
export function staticSiteReady(draft: Draft): boolean {
  if (draft.buildBranch === 'clone') {
    return !!hasCloneOutput(draft.cloneConfig);
  }
  if (draft.buildBranch === 'template') {
    return !!draft.template;
  }
  if (draft.siteDesign) {
    return designsConfirmed(draft.siteDesign) && !!draft.siteDesign?.build?.artifactKey;
  }
  return false;
}
