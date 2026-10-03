import { productGalleryRuntime } from '../shared/product-gallery-runtime';
import type { Draft, Product } from '../shared/model';
import { isProductGalleryRevision } from '../shared/product-native-materials';
import { materialImage } from './materials-render';
import { esc, safeUrl, type RenderOptions } from './themes/types';

const galleryLabels = {
  en: { gallery: 'Product images', image: 'Image', loading: 'Loading image…', failed: 'Image could not load. Select it again to retry.' },
  de: { gallery: 'Produktbilder', image: 'Bild', loading: 'Bild wird geladen…', failed: 'Bild konnte nicht geladen werden. Zum Wiederholen erneut auswählen.' },
  fr: { gallery: 'Images du produit', image: 'Image', loading: 'Chargement de l’image…', failed: 'Impossible de charger l’image. Sélectionnez-la à nouveau pour réessayer.' },
  es: { gallery: 'Imágenes del producto', image: 'Imagen', loading: 'Cargando imagen…', failed: 'No se pudo cargar la imagen. Selecciónala de nuevo para reintentar.' },
  pt: { gallery: 'Imagens do produto', image: 'Imagem', loading: 'Carregando imagem…', failed: 'Não foi possível carregar a imagem. Selecione novamente para tentar outra vez.' },
  it: { gallery: 'Immagini del prodotto', image: 'Immagine', loading: 'Caricamento immagine…', failed: 'Impossibile caricare l’immagine. Selezionala di nuovo per riprovare.' },
};

/** Wrap the native image panel only for the new release and confirmed additional images. */
export function renderProductGallery(draft: Draft, options: RenderOptions, product: Product, nativePanel: string): string {
  if (!isProductGalleryRevision(draft.template, draft.materials?.contractRevision)) return nativePanel;
  const bindings = draft.materials!.imageBindings;
  const main = bindings.find(binding => binding.slotId === 'product-main' && binding.productId === product.id);
  if (!main) return nativePanel;
  const seen = new Set([main.assetId]);
  const gallery = bindings.filter(binding => binding.slotId === 'product-gallery' && binding.productId === product.id)
    .sort((a, b) => (a.itemIndex || 0) - (b.itemIndex || 0))
    .filter(binding => {
      if (seen.has(binding.assetId) || !product.gallery?.some(image => image.assetId === binding.assetId) || !safeUrl(options.assetUrl(binding.assetId), options.preview)) return false;
      seen.add(binding.assetId);
      return true;
    }).slice(0, 10);
  if (!gallery.length) return nativePanel;
  const ui = galleryLabels[options.lang];
  const images = [main, ...gallery];
  const thumbnails = images.map((binding, index) => {
    // Keep full-size responsive sources available when this thumbnail becomes the main image.
    const image = materialImage({ ...binding, slotId: 'product-main' }, { ...options, page: 'detail', productId: product.id })
      .replace(/ sizes="[^"]*"/g, ' sizes="80px"')
      .replace('<img ', `<img data-wr-material-image="${esc(binding.slotId)}" data-wr-material-product="${esc(product.id)}" `);
    const label = binding.alt[options.lang] || binding.alt.en || product.translations?.[options.lang]?.name || product.name;
    return `<button type="button" class="wr-gallery-thumb" data-wr-material-thumb="" data-target="wr-detail-main-img" data-src="${esc(safeUrl(options.assetUrl(binding.assetId), options.preview))}" aria-controls="wr-detail-main-img" aria-label="${esc(`${ui.image} ${index + 1} / ${images.length}: ${label}`)}" aria-pressed="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${image}</button>`;
  }).join('');
  const palette = draft.materials!.visual.palette;
  return `<div class="product-gallery wr-product-gallery" data-wr-product-gallery="${esc(product.id)}" data-wr-gallery-theme="${esc(draft.template)}" data-wr-gallery-loading="${esc(ui.loading)}" data-wr-gallery-failed="${esc(ui.failed)}" style="--wr-gallery-accent:${esc(palette.primary)};--wr-gallery-ink:${esc(palette.text)};--wr-gallery-surface:${esc(palette.surface)}">${nativePanel.replace('<div', '<div data-wr-gallery-stage=""')}<div class="gallery-thumbs" role="group" aria-label="${esc(ui.gallery)}">${thumbnails}</div><p class="wr-gallery-status" role="status" aria-live="polite" aria-atomic="true"></p></div>`;
}


const productGalleryStyles = `
.wr-product-gallery{min-width:0;max-width:100%;--wr-gallery-radius:16px;--wr-gallery-duration:260;--wr-gallery-rise:6px}
.wr-product-gallery>[data-wr-gallery-stage]{position:relative;top:auto;overflow:hidden}
.wr-product-gallery>[data-wr-gallery-stage][aria-busy="true"]::after{content:"";position:absolute;bottom:0;left:0;width:100%;height:3px;background:var(--wr-gallery-accent);animation:wr-gallery-loading 1s ease-in-out infinite;transform-origin:left}
.wr-product-gallery .gallery-thumbs{display:flex;gap:10px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;padding:16px 3px 7px;margin:0;max-width:100%;scrollbar-width:thin}
[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb{display:block;flex:0 0 80px;width:80px;height:80px;min-width:0;padding:3px;border:2px solid transparent;border-radius:var(--wr-gallery-radius);background:var(--wr-gallery-surface,#fff);cursor:pointer;overflow:hidden;scroll-snap-align:center;transition:border-color .18s,transform .18s,box-shadow .18s;box-shadow:0 0 0 1px #8883;color:var(--wr-gallery-ink)}
[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb :is(img,picture){display:block;width:100%;height:100%;aspect-ratio:1;border-radius:calc(var(--wr-gallery-radius) - 4px);object-fit:contain!important;margin:0;background:#fff}
[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb[aria-pressed="true"]{border-color:var(--wr-gallery-accent);box-shadow:0 2px 9px #0001;transform:translateY(-2px)}
[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb:focus-visible{outline:2px solid var(--wr-gallery-ink);outline-offset:2px}
[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb[data-loading]{border-style:dashed;border-color:var(--wr-gallery-accent)}
.wr-product-gallery .wr-gallery-status{font-size:12px;line-height:1.4;min-height:1.4em;margin:5px 0 0;color:var(--wr-gallery-ink);overflow-wrap:anywhere}
[data-wr-gallery-theme="pawfect-groom"]{--wr-gallery-radius:24px;--wr-gallery-duration:340;--wr-gallery-rise:10px}
[data-wr-gallery-theme="auravell"]{--wr-gallery-radius:4px;--wr-gallery-duration:360;--wr-gallery-rise:3px}
[data-wr-gallery-theme="careflow-healthcare"]{--wr-gallery-radius:14px;--wr-gallery-duration:240;--wr-gallery-rise:4px}
[data-wr-gallery-theme="toorun-early-learning"]{--wr-gallery-radius:22px;--wr-gallery-duration:320;--wr-gallery-rise:12px}
[data-wr-gallery-theme="mello-coffee"]{--wr-gallery-radius:12px;--wr-gallery-duration:220;--wr-gallery-rise:8px}
[data-wr-gallery-theme="mello-coffee"] .gallery-thumbs button.wr-gallery-thumb{border-color:var(--wr-gallery-ink);box-shadow:3px 3px 0 var(--wr-gallery-ink)}
@keyframes wr-gallery-loading{0%,100%{transform:scaleX(.2)}50%{transform:scaleX(1)}}
@media(hover:hover){[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb:hover{transform:translateY(-2px);border-color:var(--wr-gallery-accent)}}
@media(max-width:767px){[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb{flex-basis:68px;width:68px;height:68px}.wr-product-gallery .gallery-thumbs{gap:8px;padding-top:12px}}
@media(prefers-reduced-motion:reduce){[data-wr-product-gallery] .gallery-thumbs button.wr-gallery-thumb{transition:none;transform:none!important}.wr-product-gallery>[data-wr-gallery-stage][aria-busy="true"]::after{animation:none}}
`;

export function withProductGalleryRuntime(html: string, draft: Draft, options: RenderOptions): string {
  if (options.page !== 'detail' || !isProductGalleryRevision(draft.template, draft.materials?.contractRevision) || !html.includes('data-wr-product-gallery=')) return html;
  return html.replace('</head>', () => `<style id="wr-product-gallery-style">${productGalleryStyles}</style></head>`)
    .replace('</body>', () => `<script id="wr-product-gallery-script">(()=>{const __name=(value)=>value;(${productGalleryRuntime.toString()})();})();</script></body>`);
}
