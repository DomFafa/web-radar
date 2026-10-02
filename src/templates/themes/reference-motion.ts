/** Reference motion recreated with browser APIs. No hosted Webflow/GSAP scripts or tracking. */
export function referenceMotionRuntime(): void {
  if (document.body.dataset.referenceMotion) return;
  document.body.dataset.referenceMotion = 'ready';
  const auravell = document.body.dataset.template === 'auravell';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 992px)');
  const all = (selector: string, root: Document | HTMLElement = document) => [
    ...root.querySelectorAll<HTMLElement>(selector),
  ];
  const running = new Set<Animation>();
  const play = (el: Element, frames: Keyframe[], duration = 800, delay = 0) => {
    if (reduce.matches) return;
    const animation = el.animate(frames, {
      duration,
      delay,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'backwards',
    });
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
    return animation;
  };
  // Start only when a node enters view. Content remains visible without JavaScript.
  const effects = new Map<Element, () => void>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          effects.get(entry.target)?.();
          observer.unobserve(entry.target);
          effects.delete(entry.target);
        }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  const enter = (el: Element, action: () => void) => {
    effects.set(el, action);
    observer.observe(el);
  };
  if (auravell) {
    all('[data-banner-blur]').forEach((el, i) =>
      play(
        el,
        [
          { opacity: 0, transform: 'translateY(80px)', filter: 'blur(20px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0px)' },
        ],
        800,
        i * 150,
      ),
    );
    all('[hero-image]').forEach((el) => play(el, [{ scale: '1.2' }, { scale: '1' }], 1400));
    all('.rt-background-line').forEach((el, i) =>
      play(
        el,
        [
          { scale: '1 0', transformOrigin: 'top' },
          { scale: '1 1', transformOrigin: 'top' },
        ],
        2000,
        i * 150,
      ),
    );
    all('.rt-hero-card-v1').forEach((el) =>
      play(
        el,
        [
          { transform: 'translateY(200px) scale(1.1)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        1000,
      ),
    );
    all(
      '[data-value-blur], [data="image"], [card-move], [card-move-v2], [card-flip], [image="effect"], .rt-service-item',
    ).forEach((el, i) => {
      if (el.closest('.rt-hero')) return;
      enter(el, () => {
        const image = el.hasAttribute('image'),
          flip = el.hasAttribute('card-flip'),
          row = el.matches('.rt-service-item');
        play(
          el,
          [
            {
              opacity: image ? 1 : 0,
              transform: image
                ? 'scale(1.25)'
                : flip
                  ? 'perspective(1000px) rotateX(-90deg)'
                  : row
                    ? 'scale(.6)'
                    : 'translateY(80px)',
              filter: image || row ? 'none' : 'blur(20px)',
            },
            { opacity: 1, transform: 'none', filter: 'blur(0px)' },
          ],
          image ? 1200 : flip ? 1100 : 800,
          (i % 3) * 60,
        );
        if (row)
          all('.rt-timetable-image-1,.rt-timetable-image-2', el).forEach((img, j) =>
            play(
              img,
              [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
              1000,
              180 + j * 50,
            ),
          );
      });
    });
  } else {
    all(
      '[fade-in-200ms],[fade-in-300ms],[fade-in-400ms],[fade-in-500ms],[fade-in-600ms],[fade-in-700ms],[fade-in-800ms]',
    ).forEach((el) => {
      const ms = Number(
        [...el.attributes].find((a) => /^fade-in-\d+ms$/.test(a.name))?.name.match(/\d+/)?.[0] ||
          200,
      );
      enter(el, () =>
        play(
          el,
          [
            { opacity: 0, transform: 'scale(.98)' },
            { opacity: 1, transform: 'none' },
          ],
          400,
          ms,
        ),
      );
    });
    // Original button lettering exits down/right while the second line enters above/left.
    all('.primary-button, .secondary-button').forEach((button) => {
      const out = button.querySelector<HTMLElement>('.button-text-out');
      const incoming = button.querySelector<HTMLElement>('.button-text-in');
      if (!out || !incoming) return;
      const label = out.textContent || '';
      button.setAttribute('aria-label', button.getAttribute('aria-label') || label);
      for (const [el, isIncoming] of [
        [out, false],
        [incoming, true],
      ] as const) {
        el.textContent = '';
        el.setAttribute('aria-hidden', 'true');
        for (const char of label) {
          const span = document.createElement('span');
          span.className = 'wr-motion-char';
          span.textContent = char === ' ' ? '\u00a0' : char;
          el.appendChild(span);
        }
        if (isIncoming) el.style.visibility = 'hidden';
      }
      let animations: Animation[] = [];
      const reset = () => {
        animations.forEach((a) => a.cancel());
        animations = [];
        incoming.style.visibility = 'hidden';
      };
      const hover = () => {
        if (reduce.matches) return;
        reset();
        incoming.style.visibility = 'visible';
        [out, incoming].forEach((line, which) =>
          all('.wr-motion-char', line).forEach((char, i) => {
            const hidden = {
              opacity: 0,
              transform: `translate(${which ? 25 : -25}%,${which ? -25 : 25}%) rotate(${which ? -45 : 45}deg) scale(.2)`,
            };
            const visible = { opacity: 1, transform: 'none' };
            animations.push(
              char.animate(which ? [hidden, visible] : [visible, hidden], {
                duration: 600,
                delay: i * 35,
                easing: 'cubic-bezier(.22,1,.36,1)',
                fill: 'both',
              }),
            );
          }),
        );
      };
      button.addEventListener('pointerenter', hover);
      button.addEventListener('pointerleave', reset);
      button.addEventListener('focus', hover);
      button.addEventListener('blur', reset);
      reduce.addEventListener('change', reset);
    });
  }
  all('[data-counter],[brix-counter]').forEach((el) =>
    enter(el, () => {
      if (reduce.matches) return;
      const original = el.textContent || '',
        match = original.match(/[\d,.]+/);
      if (!match) return;
      const end = Number(match[0].replace(/,/g, '')),
        decimals = match[0].includes('.') ? match[0].split('.')[1].length : 0;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 2000, 1);
        el.textContent = original.replace(
          match[0],
          (end * (1 - (1 - t) ** 2)).toLocaleString('en', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }),
        );
        if (t < 1 && !reduce.matches && el.isConnected) requestAnimationFrame(tick);
        else el.textContent = original;
      };
      requestAnimationFrame(tick);
    }),
  );
  // Transform-based decorative marquee: cloned copy cannot receive focus or duplicate announcements.
  all('[train],[brix-marquee]').forEach((track) => {
    if (track.dataset.wrMarquee) return;
    track.dataset.wrMarquee = 'true';
    const copy = track.cloneNode(true) as HTMLElement;
    copy.removeAttribute('id');
    copy.removeAttribute('train');
    copy.removeAttribute('brix-marquee');
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    const parent = track.parentElement;
    if (!parent) return;
    const belt = document.createElement('div');
    belt.className = 'wr-motion-marquee';
    parent.insertBefore(belt, track);
    belt.appendChild(track);
    belt.appendChild(copy);
    parent.style.overflow = 'hidden';
  });
  let scheduled = false,
    previousY = scrollY;
  const hero = document.querySelector<HTMLElement>('.rt-hero-image');
  const footer = document.querySelector<HTMLElement>('.rt-footer-background-image');
  const video = document.querySelector<HTMLElement>('[video-section] .rt-video-wrap-v1');
  const header = document.querySelector<HTMLElement>(
    auravell ? '.rt-nav-section-v1' : '[data-careflow-header]',
  );
  const update = () => {
    scheduled = false;
    const y = scrollY,
      vh = innerHeight,
      clamp = (v: number) => Math.min(1, Math.max(0, v));
    if (
      header &&
      !auravell &&
      !reduce.matches &&
      !header.contains(document.activeElement) &&
      !document.querySelector('.cf-menu-open')
    )
      header.style.translate = y > previousY && y > 200 ? '0 -110%' : '0 0';
    previousY = y;
    if (reduce.matches) {
      if (hero) hero.style.translate = '';
      if (footer) footer.style.translate = '';
      if (video) {
        video.style.width = '';
        video.style.borderRadius = '';
      }
      return;
    }
    if (hero) hero.style.translate = `0 ${Math.min(y * 0.12, vh * 0.2) - vh * 0.1}px`;
    if (footer) {
      const rect = footer.parentElement!.getBoundingClientRect();
      footer.style.translate = `0 ${-clamp((vh - rect.top) / (vh + rect.height)) * 10}%`;
    }
    if (video) {
      const rect = video.parentElement!.getBoundingClientRect(),
        t = clamp((vh * 0.6 - rect.top) / Math.max(1, rect.height - vh * 0.4));
      video.style.width = `${100 - 16 * t}%`;
      video.style.borderRadius = `${8 + 492 * t}px`;
    }
    if (auravell && desktop.matches)
      all('[team-1],[team-2]').forEach((el) => {
        const rect = el.parentElement!.getBoundingClientRect(),
          t = clamp((vh * 0.9 - rect.top) / (vh * 0.5));
        el.style.transform = `translateY(${el.hasAttribute('team-1') ? t * 100 : (1 - t) * 68}px)`;
      });
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      running.forEach((a) => a.cancel());
      if (header) header.style.translate = '';
    }
    update();
  });
  update();
}
