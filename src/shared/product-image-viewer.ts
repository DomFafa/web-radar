/** Self-contained so published pages and the sandboxed preview run the same viewer. */
export function productImageViewerRuntime() {
  const images = document.querySelectorAll<HTMLImageElement>(
    '#detailMainImg, #wr-detail-main-img, .detail .product-image img, .detail .product-gallery img',
  );
  if (!images.length || document.getElementById('wr-product-image-viewer')) return;
  const translations: Record<string, [string, string]> = {
    en: ['Enlarge image', 'Close image'],
    de: ['Bild vergrößern', 'Bild schließen'],
    fr: ['Agrandir l’image', 'Fermer l’image'],
    es: ['Ampliar imagen', 'Cerrar imagen'],
    pt: ['Ampliar imagem', 'Fechar imagem'],
    it: ['Ingrandisci immagine', 'Chiudi immagine'],
  };
  const [enlarge, close] = translations[document.documentElement.lang] || translations.en;
  const style = document.createElement('style');
  style.textContent = `
    [data-wr-image-zoom]{cursor:zoom-in}
    [data-wr-image-zoom]:focus-visible{outline:3px solid currentColor;outline-offset:4px}
    #wr-product-image-viewer{box-sizing:border-box;position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;border:0;padding:64px 20px 20px;background:rgba(8,12,18,.94);color:#fff;box-shadow:none;overflow:hidden}
    #wr-product-image-viewer[open]{display:flex;align-items:center;justify-content:center}
    #wr-product-image-viewer::backdrop{background:transparent}
    #wr-product-image-viewer img{display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;border:0;border-radius:0;box-shadow:none;filter:none;transform:none}
    #wr-product-image-viewer button{position:absolute;top:12px;right:16px;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;margin:0;border:1px solid #ffffff66;border-radius:50%;background:#202630;color:#fff;font:32px/1 system-ui;cursor:pointer}
    #wr-product-image-viewer button:focus-visible{outline:2px solid #fff;outline-offset:3px}
    @media(max-width:600px){#wr-product-image-viewer{padding:64px 8px 16px}}
  `;
  document.head.appendChild(style);
  const dialog = document.createElement('dialog');
  dialog.id = 'wr-product-image-viewer';
  dialog.setAttribute('aria-label', enlarge);
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = '×';
  dismiss.setAttribute('aria-label', close);
  const fullImage = document.createElement('img');
  dialog.appendChild(dismiss);
  dialog.appendChild(fullImage);
  document.body.appendChild(dialog);
  let opener: HTMLImageElement | undefined;
  let previousOverflow = '';
  const show = (image: HTMLImageElement) => {
    // src is the original (or authorized preview blob), not a small srcset candidate.
    if (!image.getAttribute('src') || dialog.open) return;
    opener = image;
    fullImage.src = image.src;
    fullImage.alt = image.alt;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dismiss.focus();
  };
  dismiss.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  // Native dialog handles Escape and keeps keyboard focus inside the viewer.
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    fullImage.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
  images.forEach(image => {
    image.setAttribute('data-wr-image-zoom', '');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', enlarge);
    image.setAttribute('aria-haspopup', 'dialog');
    image.title = enlarge;
    image.tabIndex = 0;
    image.addEventListener('click', () => show(image));
    image.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        show(image);
      }
    });
  });
}
