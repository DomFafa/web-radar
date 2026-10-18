import { productMotionSource } from './product-motion-source';

// Keep historical .3/.4 bytecode frozen while allowing the new About release to animate.
export const productAboutCollectionMotionSource = productMotionSource.replace('-materials.3`', '-materials.5`');
