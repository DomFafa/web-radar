export function referenceInteractions() {
  // No vendor JS, tracking, source-site requests, or arbitrary code from snapshots.
  document
    .querySelectorAll<HTMLElement>(
      '.accordion-action,.accordion-button,.accordion-header:not(:has(button)),[data-bs-toggle="collapse"],.toggle > label',
    )
    .forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const item = button.closest('.accordion-item,.accordion,.toggle');
        const panel = item?.querySelector<HTMLElement>(
          '.accordion-content,.accordion-body,.accordion-collapse,.toggle-content',
        );
        if (!panel) return;
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        panel.style.display = open ? 'none' : 'block';
        panel.style.height = open ? '0px' : 'auto';
        panel.style.opacity = '1';
        panel.style.visibility = 'visible';
        panel.hidden = open;
        [item, button, ...Array.from(item?.querySelectorAll('[data-state]') || [])].forEach(
          (node) => {
            if (!(node instanceof HTMLElement)) return;
            const booleanState = ['true', 'false'].includes(node.dataset.state || '');
            node.dataset.state = booleanState ? String(!open) : open ? 'closed' : 'open';
          },
        );
        panel.classList.toggle('show', !open);
      });
    });
  document.querySelectorAll<HTMLElement>('[data-wr-slider]').forEach((slider) => {
    const slides = [...slider.querySelectorAll<HTMLElement>('[data-wr-slide]')];
    let index = 0;
    const show = (next: number) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== index;
      });
    };
    slider.querySelector('[data-wr-prev]')?.addEventListener('click', () => show(index - 1));
    slider.querySelector('[data-wr-next]')?.addEventListener('click', () => show(index + 1));
    if (slides.length) show(0);
  });
  document
    .querySelectorAll<HTMLElement>('.slick-slider,.swiper,.swiper-container')
    .forEach((carousel) => {
      const viewport = carousel.querySelector<HTMLElement>('.slick-list') || carousel;
      carousel
        .querySelectorAll<HTMLElement>(
          '.prev-arrow,.next-arrow,.swiper-button-prev,.swiper-button-next',
        )
        .forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            const previous = button.matches('.prev-arrow,.swiper-button-prev');
            viewport.scrollBy({
              left: viewport.clientWidth * (previous ? -1 : 1),
              behavior: 'smooth',
            });
          });
        });
    });
  document
    .querySelectorAll<HTMLElement>(
      'header .hamberger-button,header .offcanvas-trigger,header .header-menu,header .sc_layouts_iconed_text_link',
    )
    .forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const menu = document.querySelector<HTMLDetailsElement>('.wr-mobile-nav');
        if (menu) {
          menu.style.display = 'block';
          menu.open = !menu.open;
        }
      });
    });
  document.querySelectorAll<HTMLElement>('header #search').forEach((button) => {
    button.setAttribute('role', 'button');
    button.tabIndex = 0;
    button.setAttribute('aria-label', 'Explore products');
    const openCatalog = () =>
      document.querySelector<HTMLAnchorElement>('a[data-wr-page="catalog"]')?.click();
    button.addEventListener('click', openCatalog);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCatalog();
      }
    });
  });
  const menu = document.querySelector<HTMLDetailsElement>('.wr-mobile-nav');
  menu?.addEventListener('toggle', () => {
    if (!menu.open && innerWidth > 991) menu.style.display = '';
  });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const updateMotion = () =>
    document.querySelectorAll<HTMLVideoElement>('video:not(#hero-video)').forEach((video) => {
      video.muted = true;
      if (motion.matches) video.pause();
      else video.play().catch(() => {});
    });
  motion.addEventListener('change', updateMotion);
  updateMotion();
  document
    .querySelectorAll<HTMLElement>('.owl-carousel.carousel-half-full-width-right')
    .forEach((carousel) => {
      carousel.classList.add('owl-loaded');
      const controls = document.createElement('div');
      controls.className = 'wr-owl-controls';
      for (const direction of [-1, 1]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = direction === -1 ? '←' : '→';
        button.setAttribute('aria-label', direction === -1 ? 'Previous products' : 'Next products');
        button.addEventListener('click', () =>
          carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: 'smooth' }),
        );
        controls.appendChild(button);
      }
      if (carousel.parentNode) {
        carousel.parentNode.insertBefore(controls, carousel.nextSibling);
      }
    });
}
