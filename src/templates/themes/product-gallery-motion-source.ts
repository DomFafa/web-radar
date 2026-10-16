import { productMotionSource } from './product-motion-source';

// Reuse the published animation bytecode, changing only its exact revision gate.
// Do not regenerate or broaden the frozen .3 runtime used by existing sites.
export const productGalleryMotionSource = productMotionSource.replace('-materials.3`', '-materials.4`');
