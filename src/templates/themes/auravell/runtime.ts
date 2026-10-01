/** Accessible project-owned equivalent of the reference interactions. */
export function auravellRuntime(): void {
  if (document.body.dataset.template !== 'auravell' || document.body.dataset.auravellReady) return;
  document.body.dataset.auravellReady = 'true';
  const previewBar = document.querySelector<HTMLElement>('.av-preview-bar');
  if (previewBar) {
    const positionNav = () =>
      document.body.style.setProperty(
        '--av-preview-height',
        `${previewBar.getBoundingClientRect().height}px`,
      );
    positionNav();
    new ResizeObserver(positionNav).observe(previewBar);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const all = (selector: string, root: Document | HTMLElement = document) => [
    ...root.querySelectorAll<HTMLElement>(selector),
  ];
  const button = (el: HTMLElement, action: () => void) => {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.addEventListener('click', action);
    el.addEventListener('keydown', (e) => {
      if (['Enter', ' '].includes(e.key) && el.tagName !== 'BUTTON') {
        e.preventDefault();
        action();
      }
    });
  };
  const menu = document.querySelector<HTMLElement>('[data-auravell-nav]');
  const toggle = document.querySelector<HTMLElement>('[data-auravell-menu]');
  const close = () => {
    menu?.removeAttribute('data-nav-menu-open');
    toggle?.classList.remove('w--open');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  if (toggle)
    button(toggle, () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      close();
      if (open) {
        menu?.setAttribute('data-nav-menu-open', '');
        toggle.classList.add('w--open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  const dropdowns = all('.w-dropdown');
  for (const drop of dropdowns) {
    const trigger = drop.querySelector<HTMLElement>(':scope > .w-dropdown-toggle'),
      panel = drop.querySelector<HTMLElement>(':scope > .w-dropdown-list');
    if (!trigger || !panel) continue;
    const set = (open: boolean) => {
      panel.classList.toggle('w--open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };
    set(false);
    button(trigger, () => set(trigger.getAttribute('aria-expanded') !== 'true'));
    drop.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') set(true);
    });
    drop.addEventListener('pointerleave', () => {
      if (!drop.contains(document.activeElement)) set(false);
    });
    drop.addEventListener('focusout', (e) => {
      if (!drop.contains(e.relatedTarget as Node)) set(false);
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
      dropdowns.forEach((drop) => {
        drop.querySelector('.w-dropdown-list')?.classList.remove('w--open');
        drop.querySelector('.w-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('click', (e) => {
    if (!document.querySelector('.rt-nav-section-v1')?.contains(e.target as Node)) close();
  });
  matchMedia('(min-width:992px)').addEventListener('change', close);
  const activeCards = (selector: string) => {
    const cards = all(selector);
    if (!cards.length) return;
    const set = (index: number) =>
      cards.forEach((card, i) => card.classList.toggle('av-active', i === index));
    cards.forEach((card, i) => {
      card.tabIndex = 0;
      card.addEventListener('pointerenter', () => set(i));
      card.addEventListener('focusin', () => set(i));
      card.addEventListener('click', () => set(i));
    });
    cards[0].parentElement?.addEventListener('pointerleave', () =>
      set(Math.min(1, cards.length - 1)),
    );
    set(Math.min(1, cards.length - 1));
  };
  activeCards('.rt-programs-grid-v1 .rt-programs-card-v1');
  activeCards('.rt-offerings-card-v1');
  const rows = all('.rt-practice-top-part > div'),
    photos = all('.rt-practice-photocol-v1 img');
  let active = Math.min(2, photos.length - 1),
    photoAnimation: Animation | undefined;
  const changePhoto = (index: number) => {
    if (!photos[index]) return;
    photoAnimation?.cancel();
    rows.forEach((row, i) => {
      row.classList.toggle('av-active', i === index);
      row.setAttribute('aria-pressed', String(i === index));
    });
    photos.forEach((photo, i) => {
      photo.style.visibility = i === index ? 'visible' : 'hidden';
      photo.style.zIndex = i === index ? '2' : '1';
    });
    if (index !== active && !reduced.matches)
      photoAnimation = photos[index].animate(
        [{ transform: `translateY(${index > active ? 100 : -100}%)` }, { transform: 'none' }],
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' },
      );
    active = index;
  };
  rows.forEach((row, i) => {
    button(row, () => changePhoto(i));
    row.addEventListener('pointerenter', () => changePhoto(i));
    row.addEventListener('focus', () => changePhoto(i));
  });
  changePhoto(active);
  all('.rt-faq-item').forEach((item, i) => {
    const trigger = item.querySelector<HTMLElement>('.rt-faq-top-content'),
      panel = item.querySelector<HTMLElement>('.rt-faq-answer');
    if (!trigger || !panel) return;
    panel.id = `auravell-faq-${i}`;
    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    let motion: Animation | undefined;
    button(trigger, () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      motion?.cancel();
      panel.hidden = false;
      const height = panel.scrollHeight;
      motion = reduced.matches
        ? undefined
        : panel.animate(
            open
              ? [
                  { height: '0px', opacity: 0 },
                  { height: `${height}px`, opacity: 1 },
                ]
              : [
                  { height: `${height}px`, opacity: 1 },
                  { height: '0px', opacity: 0 },
                ],
            { duration: 350, easing: 'ease', fill: 'none' },
          );
      if (motion) motion.finished.then(() => (panel.hidden = !open)).catch(() => {});
      else panel.hidden = !open;
    });
  });
  // Background videos are self-hosted; respect user pause, reduced motion and off-screen visibility.
  all('.w-background-video').forEach((wrapper) => {
    const video = wrapper.querySelector('video'),
      control = wrapper.querySelector<HTMLElement>('[data-w-bg-video-control]');
    if (!video) return;
    video.muted = true;
    let userPaused = false;
    const state = () => {
      control?.setAttribute(
        'aria-label',
        video.paused ? 'Play background video' : 'Pause background video',
      );
      control?.setAttribute('aria-pressed', String(!video.paused));
      control
        ?.querySelectorAll<HTMLElement>(':scope > span')
        .forEach((el, i) => (el.hidden = i === 0 ? video.paused : !video.paused));
    };
    const play = () => video.play().catch(() => state());
    control?.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        void play();
      } else {
        userPaused = true;
        video.pause();
      }
      state();
    });
    video.addEventListener('play', state);
    video.addEventListener('pause', state);
    new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting && !reduced.matches && !userPaused && !document.hidden)
            void play();
          else video.pause();
        }),
      { threshold: 0.05 },
    ).observe(video);
    reduced.addEventListener('change', () => {
      if (reduced.matches) video.pause();
      else if (!userPaused) void play();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (
        !userPaused &&
        !reduced.matches &&
        wrapper.getBoundingClientRect().top < innerHeight &&
        wrapper.getBoundingClientRect().bottom > 0
      )
        void play();
    });
    state();
  });
  all('.rt-mobile-slider').forEach((slider) => {
    const track = slider.querySelector<HTMLElement>('.w-slider-mask'),
      nav = slider.querySelector<HTMLElement>('.w-slider-nav');
    if (!track || !nav) return;
    const slides = all('.w-slide', track);
    nav.textContent = '';
    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'av-slider-dot';
      dot.setAttribute('aria-label', `Show program ${i + 1}`);
      dot.addEventListener('click', () =>
        track.scrollTo({
          left: i * track.clientWidth,
          behavior: reduced.matches ? 'instant' : 'smooth',
        }),
      );
      nav.appendChild(dot);
    });
    const state = () =>
      all('button', nav).forEach((b, i) =>
        b.setAttribute(
          'aria-current',
          String(i === Math.round(track.scrollLeft / Math.max(1, track.clientWidth))),
        ),
      );
    track.addEventListener('scroll', state, { passive: true });
    state();
  });
  document.querySelectorAll<HTMLElement>('.w-tabs').forEach((group, groupIndex) => {
    const tabs = [...group.querySelectorAll<HTMLElement>('.w-tab-link')];
    const panels = [...group.querySelectorAll<HTMLElement>('.w-tab-pane')];
    group.querySelector('.w-tab-menu')?.setAttribute('role', 'tablist');
    const activate = (index: number) => {
      tabs.forEach((tab, i) => {
        tab.classList.toggle('w--current', i === index);
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        panel.classList.toggle('w--tab-active', i === index);
        panel.hidden = i !== index;
      });
    };
    tabs.forEach((tab, i) => {
      tab.id = `auravell-tab-${groupIndex}-${i}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `auravell-panel-${groupIndex}-${i}`);
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        activate(i);
      });
      tab.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          const next =
            e.key === 'Home'
              ? 0
              : e.key === 'End'
                ? tabs.length - 1
                : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          activate(next);
          tabs[next].focus();
        }
      });
    });
    panels.forEach((panel, i) => {
      panel.id = `auravell-panel-${groupIndex}-${i}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `auravell-tab-${groupIndex}-${i}`);
    });
    activate(0);
  });
  document.querySelectorAll<HTMLFormElement>('form[data-auravell-form]').forEach((form) => {
    let requestId = crypto.randomUUID(),
      previous = '';
    const selected = new URL(location.href).searchParams.get('productId');
    const select = form.querySelector('[name="productId"]') as unknown as HTMLSelectElement | null;
    if (select && selected && [...select.options].some((o) => o.value === selected))
      select.value = selected;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector<HTMLElement>('[role="status"]');
      if (
        form.dataset.wrPreviewDisabled === 'true' ||
        !form.getAttribute('action') ||
        form.getAttribute('action') === '#'
      ) {
        if (status) status.textContent = 'Private preview — no message is sent.';
        return;
      }
      if (!form.reportValidity() || form.dataset.sending === 'true') return;
      form.dataset.sending = 'true';
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (button) button.disabled = true;
      const fields = Object.fromEntries(new FormData(form)),
        serialized = JSON.stringify(fields);
      if (previous && previous !== serialized) requestId = crypto.randomUUID();
      previous = serialized;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fields, requestId }),
        });
        const result = (await response.json()) as { error?: string; message?: string };
        if (!response.ok)
          throw Error(result.message || result.error || 'Unable to send your inquiry.');
        if (status)
          status.textContent =
            'Thank you. Your inquiry has been sent. Our team will confirm the next steps.';
        form.reset();
        requestId = crypto.randomUUID();
        previous = '';
      } catch (error) {
        if (status)
          status.textContent =
            error instanceof Error ? error.message : 'Unable to send your inquiry.';
      } finally {
        delete form.dataset.sending;
        if (button) button.disabled = false;
      }
    });
  });
}
