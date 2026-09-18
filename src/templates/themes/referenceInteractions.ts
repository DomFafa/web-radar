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
    if (!slides.length) return;
    let index = 0;
    let timer: number | undefined;

    const show = (next: number) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== index;
      });
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (slides.length > 1) {
        timer = window.setInterval(() => show(index + 1), 6000);
      }
    };

    const stopAutoplay = () => {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    slider.querySelector('[data-wr-prev]')?.addEventListener('click', () => {
      show(index - 1);
      startAutoplay();
    });
    slider.querySelector('[data-wr-next]')?.addEventListener('click', () => {
      show(index + 1);
      startAutoplay();
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('touchstart', stopAutoplay, { passive: true });
    slider.addEventListener('touchend', startAutoplay, { passive: true });

    show(0);
    startAutoplay();
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
    document.querySelectorAll<HTMLVideoElement>('video:not(#hero-video):not([data-wr-banner-video])').forEach((video) => {
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

  // Tab switching
  document
    .querySelectorAll<HTMLElement>('[data-bs-toggle="tab"], [data-toggle="tab"]')
    .forEach((tabBtn) => {
      tabBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId =
          tabBtn.getAttribute('data-bs-target') ||
          tabBtn.getAttribute('data-target') ||
          tabBtn.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const navList = tabBtn.closest('.nav-tabs, .tab-button-list, ul, nav');
        if (navList) {
          navList.querySelectorAll('.nav-link, .tab-button').forEach((b) => b.classList.remove('active'));
          navList.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active-nav'));
        }
        tabBtn.classList.add('active');
        tabBtn.closest('.nav-item')?.classList.add('active-nav');

        const container =
          tabBtn.closest('.service-layout-presentation-box, .auto-slider-service, section, .container, body') ||
          document;
        const targetPane = container.querySelector<HTMLElement>(targetId);
        if (targetPane) {
          const tabContent = targetPane.closest('.tab-content') || targetPane.parentElement;
          if (tabContent) {
            tabContent.querySelectorAll<HTMLElement>('.tab-pane').forEach((p) => {
              p.classList.remove('active', 'show');
              p.style.display = 'none';
            });
          }
          targetPane.classList.add('active', 'show');
          targetPane.style.display = 'block';
        }
      });
    });

  // Number Counter / Odometer animation (Apple-style exponential easing)
  const animateCounter = (el: HTMLElement) => {
    if (el.dataset.wrCounted) return;
    const rawValue = el.getAttribute('data-counter') || el.getAttribute('data-count') || el.getAttribute('data-to') || el.textContent || '';
    const numericStr = rawValue.replace(/[^\d.]/g, '');
    if (!numericStr) return;
    const target = parseFloat(numericStr);
    if (isNaN(target)) return;
    el.dataset.wrCounted = 'true';
    const suffix = el.getAttribute('data-suffix') || '';

    const dec = numericStr.includes('.') ? numericStr.split('.')[1].length : 0;
    const duration = 1400;
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = dec > 0 ? (ease * target).toFixed(dec) : Math.floor(ease * target).toLocaleString();
      el.textContent = current + suffix;
      if (progress < 1) {
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(update);
        } else {
          setTimeout(() => update(Date.now()), 16);
        }
      } else {
        el.textContent = (dec > 0 ? target.toFixed(dec) : target.toLocaleString()) + suffix;
      }
    };
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(update);
    } else {
      setTimeout(() => update(Date.now()), 16);
    }
  };

  // Scroll Reveal & Counter Observer
  if (typeof IntersectionObserver !== 'undefined') {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('wr-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.body?.classList.add('wr-motion-ready');

    document
      .querySelectorAll<HTMLElement>(
        '.wr-reveal, [data-reveal], .wr-product-card, .product-card, .single-ai-service, .single-modern-case-studies, .signle-fun-facts-one, .service-layout-presentation-box, .blog-card-text'
      )
      .forEach((el) => {
        if (!el.classList.contains('wr-reveal')) {
          el.classList.add('wr-reveal');
        }
        revealObserver.observe(el);
      });

    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target as HTMLElement);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document
      .querySelectorAll<HTMLElement>('.odometer, [data-count], [data-to], [data-counter], .timer')
      .forEach((el) => counterObserver.observe(el));

    // Dynamic Progress Bars
    const progressObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target as HTMLElement;
            const targetWidth = bar.getAttribute('data-progress') || '0';
            bar.style.width = targetWidth + '%';
            obs.unobserve(bar);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll<HTMLElement>('.wr-progress-bar[data-progress]').forEach((el) => {
      el.style.width = '0%';
      el.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      progressObserver.observe(el);
    });

    // 3D Card Tilt & Spotlight
    const cards = document.querySelectorAll<HTMLElement>(
      '.senseng-p-card, .wr-candy-card, .wr-wonder-card, .wr-arcade-card, .wr-nature-card, .wr-minimal-card, .wr-card-hover, .product-card, .wr-product-card'
    );
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-8px) scale3d(1.015,1.015,1.015)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  } else {
    document.querySelectorAll<HTMLElement>('.wr-reveal, [data-reveal]').forEach((el) => el.classList.add('wr-revealed'));
    document
      .querySelectorAll<HTMLElement>('.odometer, [data-count], [data-to], [data-counter], .timer')
      .forEach((el) => animateCounter(el));
    document.querySelectorAll<HTMLElement>('.wr-progress-bar[data-progress]').forEach((el) => {
      el.style.width = (el.getAttribute('data-progress') || '0') + '%';
    });
  }

  // Smooth next-screen scroll down button
  document.querySelectorAll<HTMLElement>('.wr-scroll-down').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentSection = btn.closest('section') || btn.closest('.hero');
      const nextSec = currentSection?.nextElementSibling || document.querySelector('main > section:nth-of-type(2)') || document.querySelector('section:nth-of-type(2)');
      if (nextSec) {
        nextSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Interactive Product Detail Thumbnail Switcher
  document.querySelectorAll<HTMLElement>('.wr-detail-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const targetId = thumb.getAttribute('data-target') || 'detailMainImg';
      const src = thumb.getAttribute('data-src') || thumb.getAttribute('data-large') || thumb.querySelector<HTMLImageElement>('img')?.src;
      const mainImg = (document.getElementById(targetId) || document.getElementById('detailMainImg') || document.getElementById('wr-detail-main-img')) as HTMLImageElement;
      if (mainImg && src) {
        mainImg.closest('picture')?.querySelectorAll('source').forEach((s) => s.remove());
        mainImg.src = src;
        const container = thumb.closest('.senseng-detail-thumbs') || thumb.parentElement;
        container?.querySelectorAll('.wr-detail-thumb, .senseng-thumb-btn').forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      }
    });
  });

  // Auto carousel rotator for .wr-carousel
  document.querySelectorAll<HTMLElement>('.wr-carousel').forEach((carousel) => {
    const slides = carousel.querySelectorAll<HTMLElement>('.wr-slide');
    const dots = carousel.querySelectorAll<HTMLElement>('.wr-carousel-dot');
    if (slides.length <= 1) return;
    let idx = 0;
    let timer: number | undefined;

    const gotoSlide = (next: number) => {
      slides[idx]?.classList.remove('active');
      dots[idx]?.classList.remove('active');
      idx = (next + slides.length) % slides.length;
      slides[idx]?.classList.add('active');
      dots[idx]?.classList.add('active');
    };

    const start = () => {
      if (!timer) timer = window.setInterval(() => gotoSlide(idx + 1), 4500);
    };
    const stop = () => {
      if (timer) { clearInterval(timer); timer = undefined; }
    };

    dots.forEach((dot, dotIdx) => {
      dot.addEventListener('click', () => {
        gotoSlide(dotIdx);
        stop();
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('touchstart', stop, { passive: true });
    carousel.addEventListener('touchend', start, { passive: true });
    start();
  });
}
