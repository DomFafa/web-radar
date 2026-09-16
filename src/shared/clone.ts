import type { CloneUiImage, CloneUiImageRole } from './model';

export function guessCloneImageRole(name: string): CloneUiImageRole {
  const stem = name.toLowerCase().replace(/\.[^.]+$/, '').replace(/[ _]+/g, '-');
  if (/^(products?|items?)-?\d+$/.test(stem)) return 'asset';
  if (/^(index|home|homepage|main)(-|$)/.test(stem)) return 'home';
  if (/about/.test(stem)) return 'about';
  if (/contact/.test(stem)) return 'contact';
  if (/detail/.test(stem)) return 'detail';
  if (/catalog|products|product-page|list|shop/.test(stem)) return 'catalog';
  return 'asset';
}

// Repair only the two known legacy auto-classification errors. Explicit choices survive.
export function normalizeCloneImages(images: CloneUiImage[] = []): CloneUiImage[] {
  return images.map(image => {
    if (image.roleSource === 'manual') return image;
    const role = guessCloneImageRole(image.name);
    if (image.roleSource === 'auto' ||
        (/^products?-?\d+\.[^.]+$/i.test(image.name) && image.role === 'catalog') ||
        (/^product[-_ ]page\.[^.]+$/i.test(image.name) && image.role === 'detail')) {
      return { ...image, role, roleSource: 'auto' };
    }
    return image;
  });
}
