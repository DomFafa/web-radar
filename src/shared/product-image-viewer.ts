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
    #wr-product-image-viewer{box-sizing:border-box;position:fixed;inset:0;width:calc(100% - 48px);height:calc(100% - 48px);max-width:1440px;max-height:1000px;margin:auto;border:0;border-radius:12px;padding:64px 28px 28px;background:#fff;color:#17212b;box-shadow:0 20px 80px #0005;overflow:hidden;font:16px/1.5 system-ui,sans-serif}
    #wr-product-image-viewer[open]{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:32px}
    #wr-product-image-viewer::backdrop{background:rgba(8,12,18,.7)}
    #wr-product-image-viewer img{display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;border:0;border-radius:0;box-shadow:none;filter:none;transform:none}
    #wr-product-image-viewer button{position:absolute;top:12px;right:16px;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;margin:0;border:1px solid #dce1e6;border-radius:50%;background:#fff;color:#17212b;font:32px/1 system-ui;cursor:pointer;box-shadow:none;transform:none}
    #wr-product-image-viewer button:focus-visible{outline:3px solid #236d91;outline-offset:3px}
    #wr-product-image-viewer .wr-image-stage{display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;width:100%;height:100%;overflow:auto;touch-action:pan-x pan-y pinch-zoom}
    #wr-product-image-viewer .wr-image-stage[data-zoomed]{display:block}
    #wr-product-image-viewer .wr-image-stage[data-zoomed] img{max-width:none;max-height:none;margin:0}
    #wr-product-image-viewer .wr-image-scale{right:72px;font-size:24px}
    #wr-product-image-viewer .wr-image-sidebar{min-width:0;min-height:0;overflow:auto;padding:4px}
    #wr-product-image-viewer .wr-image-title{margin:0 0 24px;font:600 22px/1.4 system-ui,sans-serif;color:#17212b;text-transform:none;letter-spacing:normal;overflow-wrap:anywhere}
    #wr-product-image-viewer .wr-image-thumbnails{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    #wr-product-image-viewer .wr-image-thumbnail{position:static;width:100%;height:auto;aspect-ratio:1;padding:4px;border:1px solid #cbd2d8;border-radius:6px;overflow:hidden}
    #wr-product-image-viewer .wr-image-thumbnail[aria-pressed=true]{border:2px solid #236d91;background:#eef7fb}
    #wr-product-image-viewer .wr-image-thumbnail img{width:100%;height:100%}
    #wr-product-image-lens{position:fixed;z-index:2147483646;pointer-events:none;box-sizing:border-box;border:1px solid #385b80;background:rgba(93,143,190,.18);box-shadow:inset 0 0 0 1px #ffffff80}
    #wr-product-image-detail{position:fixed;z-index:2147483645;pointer-events:none;overflow:hidden;box-sizing:border-box;background:#fff;border:1px solid #d9dee5;border-radius:8px;box-shadow:0 8px 28px #13253a22}
    #wr-product-image-detail img{position:absolute!important;display:block!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;object-fit:fill!important;transform:none!important;filter:none!important}
    #wr-product-image-lens[hidden],#wr-product-image-detail[hidden]{display:none!important}
    @media(max-width:700px){#wr-product-image-viewer{width:100%;height:100%;max-height:none;border-radius:0;padding:64px 12px 20px}#wr-product-image-viewer[open]{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;gap:16px}#wr-product-image-viewer .wr-image-sidebar{max-height:30vh}#wr-product-image-viewer .wr-image-title{font-size:18px;margin-bottom:12px}#wr-product-image-viewer .wr-image-thumbnails{grid-template-columns:repeat(auto-fill,64px);gap:8px}}
  `;
  document.head.appendChild(style);
  const dialog = document.createElement('dialog');
  dialog.id = 'wr-product-image-viewer';
  dialog.setAttribute('aria-label', enlarge);
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'wr-image-close';
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
  const sidebar = document.createElement('aside'), title = document.createElement('h2'), thumbnails = document.createElement('div');
  sidebar.className = 'wr-image-sidebar'; title.className = 'wr-image-title'; thumbnails.className = 'wr-image-thumbnails';
  title.id = 'wr-product-image-title'; dialog.setAttribute('aria-labelledby', title.id);
  sidebar.appendChild(title); sidebar.appendChild(thumbnails); dialog.appendChild(sidebar);
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
    if (dialog.open || !desktop() || !image.getAttribute('src') || !image.naturalWidth || !image.naturalHeight) return;
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
  let previousOverflow: string | undefined;
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
  const gallery = (image: HTMLImageElement) => {
    const entries = [{ src: image.src, alt: image.alt }];
    const add = (thumbnail: HTMLImageElement, control?: Element) => {
      if (!thumbnail.getAttribute('src')) return; // Private-preview media may still be loading.
      const src = thumbnail.src.startsWith('blob:') ? thumbnail.src
        : control?.getAttribute('data-src') || control?.getAttribute('data-large') || thumbnail.src;
      const resolved = new URL(src, document.baseURI).href;
      if (!entries.some(entry => entry.src === resolved)) entries.push({ src: resolved, alt: thumbnail.alt || image.alt });
    };
    // Only product-gallery controls; recommendation/card images are not gallery images.
    document.querySelectorAll<HTMLElement>('.senseng-detail-thumbs [data-wr-material-thumb], .senseng-detail-thumbs .senseng-thumb-btn, .senseng-detail-thumbs .wr-detail-thumb').forEach(control => {
      if (control.getAttribute('data-target') && control.getAttribute('data-target') !== image.id) return;
      const thumbnail = control.querySelector<HTMLImageElement>('img');
      if (thumbnail) add(thumbnail, control);
    });
    image.closest('.gallery, .product-gallery')?.querySelectorAll<HTMLImageElement>('.thumbnails img, .gallery-thumbs img').forEach(thumbnail => add(thumbnail, thumbnail.closest('button, a') || undefined));
    return entries;
  };
  const show = (image: HTMLImageElement) => {
    // src is the original (or authorized preview blob), not a small srcset candidate.
    if (!image.getAttribute('src') || dialog.open) return;
    hideLens(); resetScale();
    opener = image;
    fullImage.src = image.src;
    fullImage.alt = image.alt;
    title.textContent = document.querySelector('main h1, h1')?.textContent?.trim() || image.alt || enlarge;
    thumbnails.replaceChildren();
    const buttons: HTMLButtonElement[] = [];
    gallery(image).forEach((entry, index) => {
      const button = document.createElement('button'), thumbnail = document.createElement('img');
      button.type = 'button'; button.className = 'wr-image-thumbnail';
      button.setAttribute('aria-label', `${entry.alt || enlarge} ${index + 1}`);
      button.setAttribute('aria-pressed', String(index === 0));
      thumbnail.src = entry.src; thumbnail.alt = ''; button.appendChild(thumbnail);
      button.addEventListener('click', () => {
        resetScale(); fullImage.src = entry.src; fullImage.alt = entry.alt;
        buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      });
      buttons.push(button); thumbnails.appendChild(button);
    });
    previousOverflow ??= document.body.style.overflow;
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
    // A native close event can arrive after the next gallery has already opened.
    if (dialog.open || previousOverflow === undefined) return;
    document.body.style.overflow = previousOverflow;
    previousOverflow = undefined;
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
    image.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') showLens(image, event.clientX, event.clientY); });
    image.addEventListener('pointerleave', hideLens);
    image.addEventListener('click', () => show(image));
    image.addEventListener('keydown', event => {
      if (event.key === 'Escape') { hideLens(); return; }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        show(image);
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
