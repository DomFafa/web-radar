import type { BannerTarget, Draft, PageBanner } from './model';
export const newBanner = (id: string, targets: BannerTarget[] = []): PageBanner => ({
  id,
  targets,
  kind: 'images',
  slides: [],
  mode: 'background',
  fit: 'cover',
  position: 'center',
  contrast: 'light',
  height: 'auto',
  autoplay: true,
  interval: 5,
});
/** Read old drafts/releases without mutating their published snapshot. Explicit [] removes a legacy banner. */
export function pageBanners(draft: Draft): PageBanner[] {
  if (draft.banners !== undefined)
    return draft.banners.map((b) => ({
      ...b,
      targets: b.targets.filter((t) => t !== 'detail' && !t.startsWith('product:')),
    }));
  const old = draft.banner;
  return old
    ? [
        {
          ...newBanner('legacy-home', ['home']),
          ...old,
          contrast: old.contrast ?? 'none',
          slides: [{ assetId: old.assetId, alt: old.alt }],
        },
      ]
    : [];
}
export function selectedBanner(draft: Draft, page: string, productId?: string) {
  if (page === 'detail' || page.startsWith('product:')) return;
  return pageBanners(draft).find((b) => b.targets.includes(page as BannerTarget));
}
export function bannerPageFromPath(path: string): { page: string; productId?: string } | undefined {
  const parts = path.split('/');
  if (parts.length < 2 || parts.at(-1) !== 'index.html') return;
  if (parts.length === 2) return { page: 'home' };
  if (parts[1] === 'products' && parts.length === 4) {
    try {
      return { page: 'detail', productId: decodeURIComponent(parts[2]) };
    } catch {
      return;
    }
  }
  return { page: parts[1] === 'products' ? 'catalog' : parts[1] };
}
export function bannerAssets(
  draft: Draft,
  published = false,
): { images: string[]; videos: string[] } {
  const images: string[] = [],
    videos: string[] = [];
  for (const b of pageBanners(draft)) {
    if (published && !b.targets.length) continue;
    if (!published || b.kind === 'images') images.push(...b.slides.map((s) => s.assetId));
    if ((!published || b.kind === 'video') && b.posterAssetId) images.push(b.posterAssetId);
    if ((!published || b.kind === 'video') && b.videoAssetId) videos.push(b.videoAssetId);
  }
  return { images: [...new Set(images)], videos: [...new Set(videos)] };
}
