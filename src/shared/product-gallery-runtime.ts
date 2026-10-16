/** Serialized into publication and trusted previews; all URLs come from their current DOM. */
export function productGalleryRuntime() {
  const roots = new WeakSet<HTMLElement>();
  const bindProductGalleries = () => document.querySelectorAll<HTMLElement>('[data-wr-product-gallery]').forEach(root => {
    if (roots.has(root)) return;
    const main = root.querySelector<HTMLImageElement>('#wr-detail-main-img');
    const stage = root.querySelector<HTMLElement>('[data-wr-gallery-stage]');
    const status = root.querySelector<HTMLElement>('.wr-gallery-status');
    const group = root.querySelector<HTMLElement>('.gallery-thumbs');
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-wr-material-thumb]')];
    if (!main || !stage || !group || !buttons.length) return;
    roots.add(root);
    let selected = 0;
    let request = 0;
    let animation: Animation | undefined;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const clearPending = () => {
      stage.removeAttribute('aria-busy');
      buttons.forEach(button => button.removeAttribute('data-loading'));
    };
    const show = (index: number) => {
      const ticket = ++request;
      clearPending();
      if (index === selected) { if (status) status.textContent = ''; return; }
      const button = buttons[index];
      const thumbnail = button.querySelector<HTMLImageElement>('img');
      // A private preview may still be replacing protected media with authorized blobs.
      if (!thumbnail?.getAttribute('src')) {
        if (status) status.textContent = root.dataset.wrGalleryLoading || '';
        return;
      }
      const blob = thumbnail.src.startsWith('blob:');
      const src = blob ? thumbnail.src : button.getAttribute('data-src') || thumbnail.src;
      const sources = blob ? [] : [...(thumbnail.closest('picture')?.querySelectorAll('source') || [])];
      const matchingSource = sources.find(source => !source.media || matchMedia(source.media).matches);
      const srcset = blob ? '' : matchingSource?.srcset || thumbnail.getAttribute('srcset') || '';
      const sizes = main.getAttribute('sizes') || '(max-width:767px) 100vw, 50vw';
      const pending = new Image();
      stage.setAttribute('aria-busy', 'true');
      button.setAttribute('data-loading', '');
      if (status) status.textContent = root.dataset.wrGalleryLoading || '';
      let settled = false;
      const finish = (success: boolean) => {
        if (settled || ticket !== request || !root.isConnected) return;
        settled = true;
        clearPending();
        if (!success) { if (status) status.textContent = root.dataset.wrGalleryFailed || ''; return; }
        let picture = main.closest('picture');
        picture?.querySelectorAll('source').forEach(source => source.remove());
        if (sources.length && !picture) {
          picture = document.createElement('picture');
          main.replaceWith(picture);
          picture.appendChild(main);
        }
        for (const source of sources) {
          const copy = source.cloneNode(true) as HTMLSourceElement;
          if (copy.hasAttribute('sizes')) copy.sizes = sizes;
          picture!.insertBefore(copy, main);
        }
        main.removeAttribute('srcset');
        main.removeAttribute('sizes');
        if (!blob && thumbnail.getAttribute('srcset')) {
          main.setAttribute('srcset', thumbnail.getAttribute('srcset')!);
          main.setAttribute('sizes', sizes);
        }
        main.src = src;
        main.alt = thumbnail.alt;
        for (const attribute of ['width', 'height', 'style', 'data-wr-material-image', 'data-wr-material-product']) {
          const value = thumbnail.getAttribute(attribute);
          if (value === null) main.removeAttribute(attribute); else main.setAttribute(attribute, value);
        }
        selected = index;
        buttons.forEach((item, current) => {
          item.setAttribute('aria-pressed', String(current === selected));
          item.tabIndex = current === selected ? 0 : -1;
        });
        if (status) status.textContent = button.getAttribute('aria-label') || '';
        animation?.cancel();
        if (!reduced.matches && main.animate) {
          const style = getComputedStyle(root);
          animation = main.animate([
            { opacity: .25, transform: `translateY(${style.getPropertyValue('--wr-gallery-rise').trim() || '6px'}) scale(.985)` },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ], { duration: Number.parseFloat(style.getPropertyValue('--wr-gallery-duration')) || 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
      };
      pending.onload = () => finish(true);
      pending.onerror = () => finish(false);
      if (srcset) { pending.sizes = sizes; pending.srcset = srcset; }
      pending.src = src;
      if (pending.complete && pending.naturalWidth > 0) finish(true);
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => show(index));
      button.addEventListener('keydown', event => {
        const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % buttons.length
          : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index + buttons.length - 1) % buttons.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : -1;
        if (next < 0) return; // Native buttons provide Enter and Space activation.
        event.preventDefault();
        buttons[next].focus({ preventScroll: true });
        buttons[next].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced.matches ? 'instant' : 'smooth' });
        show(next);
      });
    });
    reduced.addEventListener('change', () => { if (reduced.matches) animation?.cancel(); });
  });
  bindProductGalleries();
  window.addEventListener('wr:template-mounted', bindProductGalleries);
  window.addEventListener('wr:materials-media-ready', bindProductGalleries);
}
