/** Self-contained so published pages and the sandboxed preview run the same viewer. */
export function productImageViewerRuntime(originalUrl?: string) {
  const images = [...document.querySelectorAll<HTMLImageElement>(
    '#detailMainImg, #wr-detail-main-img, #product-image > img, [data-wr-product-image], .detail .product-image img, .detail .product-gallery img',
  )];
  if (originalUrl) {
    const original = [...document.querySelectorAll<HTMLImageElement>('img')].find(image => image.getAttribute('src') === originalUrl);
    if (original && !images.includes(original)) images.push(original);
  }
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
  const desktop = () => window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:900px)').matches;
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
    #wr-product-image-viewer .wr-image-stage{display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:auto;touch-action:pan-x pan-y pinch-zoom}
    #wr-product-image-viewer .wr-image-stage[data-zoomed]{display:block}
    #wr-product-image-viewer .wr-image-stage[data-zoomed] img{max-width:none;max-height:none;margin:0}
    #wr-product-image-viewer .wr-image-scale{right:72px;font-size:24px}
    #wr-product-image-lens{position:fixed;z-index:2147483646;pointer-events:none;box-sizing:border-box;border:1px solid #385b80;background:rgba(93,143,190,.18);box-shadow:inset 0 0 0 1px #ffffff80}
    #wr-product-image-detail{position:fixed;z-index:2147483645;pointer-events:none;overflow:hidden;box-sizing:border-box;background:#fff;border:1px solid #d9dee5;border-radius:8px;box-shadow:0 8px 28px #13253a22}
    #wr-product-image-detail img{position:absolute!important;display:block!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;object-fit:fill!important;transform:none!important;filter:none!important}
    #wr-product-image-lens[hidden],#wr-product-image-detail[hidden]{display:none!important}
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
  const stage = document.createElement('div');
  stage.className = 'wr-image-stage';
  stage.appendChild(fullImage);
  const scaleButton = document.createElement('button');
  scaleButton.type = 'button'; scaleButton.className = 'wr-image-scale'; scaleButton.textContent = '+';
  scaleButton.setAttribute('aria-label', enlarge); scaleButton.setAttribute('aria-pressed', 'false');
  dialog.appendChild(dismiss);
  dialog.appendChild(stage);
  dialog.appendChild(scaleButton);
  document.body.appendChild(dialog);
  const lens = document.createElement('div'), pane = document.createElement('div'), detail = document.createElement('img');
  lens.id = 'wr-product-image-lens'; pane.id = 'wr-product-image-detail';
  lens.hidden = pane.hidden = true; lens.setAttribute('aria-hidden', 'true');
  pane.setAttribute('role', 'img'); pane.setAttribute('aria-label', enlarge);
  pane.appendChild(detail); document.body.appendChild(lens); document.body.appendChild(pane);
  let activeImage: HTMLImageElement | undefined;
  let pointer = { x: 0, y: 0 };
  const hideLens = () => { lens.hidden = pane.hidden = true; activeImage = undefined; };
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const showLens = (image: HTMLImageElement, x?: number, y?: number) => {
    if (!desktop() || !image.getAttribute('src') || !image.naturalWidth || !image.naturalHeight) return;
    const rect = image.getBoundingClientRect(), css = getComputedStyle(image);
    if (!rect.width || !rect.height) return;
    const fit = css.objectFit === 'cover' ? Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
      : Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const width = css.objectFit === 'fill' ? rect.width : image.naturalWidth * fit;
    const height = css.objectFit === 'fill' ? rect.height : image.naturalHeight * fit;
    const position = css.objectPosition.split(' ').map(value => value.endsWith('%') ? parseFloat(value) / 100 : .5);
    const left = rect.left + (rect.width - width) * position[0], top = rect.top + (rect.height - height) * (position[1] ?? .5);
    const visibleLeft = Math.max(rect.left, left), visibleTop = Math.max(rect.top, top);
    const visibleRight = Math.min(rect.right, left + width), visibleBottom = Math.min(rect.bottom, top + height);
    const size = Math.min(420, window.innerHeight - 32, Math.max(220, window.innerWidth - rect.right - 36));
    const zoom = Math.max(2.4, size / (visibleRight - visibleLeft), size / (visibleBottom - visibleTop));
    const lensSize = size / zoom;
    pointer = { x: x ?? (visibleLeft + visibleRight) / 2, y: y ?? (visibleTop + visibleBottom) / 2 };
    const lensLeft = clamp(pointer.x - lensSize / 2, visibleLeft, visibleRight - lensSize);
    const lensTop = clamp(pointer.y - lensSize / 2, visibleTop, visibleBottom - lensSize);
    Object.assign(lens.style, { left: lensLeft + 'px', top: lensTop + 'px', width: lensSize + 'px', height: lensSize + 'px' });
    Object.assign(pane.style, { left: Math.min(rect.right + 18, window.innerWidth - size - 16) + 'px', top: clamp(rect.top, 16, window.innerHeight - size - 16) + 'px', width: size + 'px', height: size + 'px' });
    if (detail.src !== image.src) detail.src = image.src;
    detail.alt = image.alt;
    Object.assign(detail.style, { left: -(lensLeft - left) * zoom + 'px', top: -(lensTop - top) * zoom + 'px', width: width * zoom + 'px', height: height * zoom + 'px' });
    activeImage = image; lens.hidden = pane.hidden = false;
  };
  window.addEventListener('scroll', hideLens, true);
  window.addEventListener('resize', hideLens);
  window.addEventListener('blur', hideLens);
  let opener: HTMLImageElement | undefined;
  let previousOverflow = '';
  let scaled = false;
  const resetScale = () => {
    scaled = false; stage.removeAttribute('data-zoomed'); fullImage.style.width = '';
    scaleButton.textContent = '+'; scaleButton.setAttribute('aria-pressed', 'false');
  };
  const toggleScale = () => {
    if (scaled) return resetScale();
    scaled = true; stage.setAttribute('data-zoomed', '');
    fullImage.style.width = Math.max(fullImage.naturalWidth, (stage.clientWidth || 300) * 2) + 'px';
    scaleButton.textContent = '−'; scaleButton.setAttribute('aria-pressed', 'true');
  };
  scaleButton.addEventListener('click', toggleScale);
  fullImage.addEventListener('dblclick', toggleScale);
  const show = (image: HTMLImageElement) => {
    // src is the original (or authorized preview blob), not a small srcset candidate.
    if (!image.getAttribute('src') || dialog.open) return;
    hideLens(); resetScale();
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
    image.setAttribute('aria-haspopup', desktop() ? 'false' : 'dialog');
    image.title = enlarge;
    image.tabIndex = 0;
    image.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') showLens(image, event.clientX, event.clientY); });
    image.addEventListener('pointerleave', hideLens);
    image.addEventListener('click', event => desktop() ? showLens(image, event.clientX, event.clientY) : show(image));
    image.addEventListener('keydown', event => {
      if (event.key === 'Escape') { hideLens(); return; }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (desktop()) showLens(image); else show(image);
      } else if (activeImage === image && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        showLens(image, pointer.x + (event.key === 'ArrowLeft' ? -24 : event.key === 'ArrowRight' ? 24 : 0), pointer.y + (event.key === 'ArrowUp' ? -24 : event.key === 'ArrowDown' ? 24 : 0));
      }
    });
  });
}

export function withProductImageViewer(html: string, originalUrl?: string): string {
  if (html.includes('id="wr-product-image-viewer-script"')) return html;
  const source = JSON.stringify(originalUrl ?? '').replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return html.replace(/<\/body>/i, `<script id="wr-product-image-viewer-script">(()=>{const __name=(value)=>value;(${productImageViewerRuntime.toString()})(${source});})();</script></body>`);
}
