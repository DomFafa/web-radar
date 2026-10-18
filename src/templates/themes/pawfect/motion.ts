/** Applied only to the versioned Pawfect motion release. */
export function pawfectMotionPrepare(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return;
  const style = document.createElement('style');
  style.id = 'pawfect-motion-prepaint';
  style.textContent = 'main,.pg-booking{opacity:0!important}';
  document.head.appendChild(style);
  setTimeout(() => {
    if (style.isConnected) {
      document.documentElement.dataset.pawfectMotionUnavailable = 'true';
      style.remove();
    }
  }, 1500);
}

export function pawfectMotionRuntime(): void {
  if (!document.body.matches('.wr-pawfect-materials') || document.body.dataset.pawfectMotion || document.documentElement.dataset.pawfectMotionUnavailable) return;
  if (!Element.prototype.animate) return;
  document.body.dataset.pawfectMotion = 'expressive-v3';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
  const page = document.querySelector('.pg-hero') ? 'home'
    : document.querySelector('.pg-detail') ? 'detail'
    : document.querySelector('.pg-contact') ? 'contact'
    : document.querySelector('.pg-about-story') ? 'about' : 'catalog';
  // The renderer supplies stable product order; the script attribute supports the saved review replay.
  const productOrder = Number(document.body.dataset.pawfectProductOrder ?? document.querySelector<HTMLScriptElement>('script[data-pawfect-product-order]')?.dataset.pawfectProductOrder ?? 0);
  const detailVariant = Math.max(0, productOrder) % 3;
  type Kind = 'hero-title' | 'hero-art' | 'hero-eyebrow' | 'hero-follow' | 'hero-badge' | 'hero-caption'
    | 'fan-card' | 'cascade' | 'section-title' | 'feature-title' | 'scene-door' | 'gallery-wipe' | 'depth-title'
    | 'catalog-title' | 'catalog-card' | 'catalog-step' | 'catalog-close'
    | 'about-title' | 'about-iris' | 'about-diagonal' | 'about-lines' | 'about-curtain'
    | 'contact-title' | 'contact-form' | 'contact-note' | 'contact-photo' | 'contact-line'
    | 'detail-image' | 'detail-title' | 'detail-fact' | 'detail-step';
  type Entrance = { el: HTMLElement; kind: Kind; index: number; top: number; height: number; seen: boolean; opacity: string };
  const entrances: Entrance[] = [];
  const playing = new Map<HTMLElement, Animation>();
  const claimed = new Set<HTMLElement>();
  const add = (selector: string, kind: Kind) => all(selector).forEach((el, index) => {
    if (claimed.has(el)) return;
    claimed.add(el);
    entrances.push({ el, kind, index, top: 0, height: 0, seen: false, opacity: el.style.opacity });
    // Prepare before visibility, not when scrolling has already exposed the final pose.
    if (!reduced.matches) el.style.opacity = '0';
  });

  // Each page has its own composition. Shared sections follow that page's rhythm.
  if (page === 'home') {
    add('.pg-hero h1', 'hero-title');
    add('.pg-hero-art', 'hero-art');
    add('.pg-hero .pg-eyebrow', 'hero-eyebrow');
    add('.pg-hero .wr-confirmed-hero-copy > p, .pg-hero .pg-actions, .pg-hero .pg-trust', 'hero-follow');
    add('.pg-orbit', 'hero-badge');
    add('.pg-photo-tag', 'hero-caption');
    add('.pg-service', 'fan-card');
    add('.pg-three > article', 'cascade');
    add('.pg-faq h2, .pg-booking h2', 'depth-title');
    add('.pg-section-title h2', 'section-title');
    add('.pg-why-copy h2', 'feature-title');
    add('.pg-scene-media', 'scene-door');
    add('.pg-gallery figure img', 'gallery-wipe');
  } else if (page === 'catalog') {
    add('.pg-page-heading h1', 'catalog-title');
    add('.pg-service', 'catalog-card');
    add('.pg-three > article', 'catalog-step');
    add('.pg-section-title h2', 'catalog-title');
    add('.pg-booking h2', 'catalog-close');
  } else if (page === 'about') {
    add('.pg-page-heading h1, .pg-booking h2', 'about-title');
    add('.pg-scene-media img', 'about-iris');
    add('.pg-about-story > div:first-child img', 'about-diagonal');
    add('.pg-why-copy h2, .pg-why-copy li, .pg-about-story h2, .pg-about-story p, .pg-section-title h2, .pg-process', 'about-lines');
    add('.pg-gallery figure img', 'about-curtain');
  } else if (page === 'contact') {
    add('.pg-page-heading h1', 'contact-title');
    add('.pg-form', 'contact-form');
    add('.pg-contact aside > h2, .pg-contact aside > .pg-company-note', 'contact-note');
    add('.pg-contact-media img', 'contact-photo');
    add('.pg-faq h2, .pg-faq details, .pg-booking h2', 'contact-line');
  } else {
    add('.pg-detail > div:first-child img', 'detail-image');
    add('.pg-detail h1, .pg-booking h2', 'detail-title');
    add('.pg-detail > div:last-child > p, .pg-checks li, .pg-detail dl, .pg-detail .pg-button', 'detail-fact');
    add('.pg-process', 'detail-step');
  }
  // The original portrait has an infinite float; this version settles after its entrance.
  all('.pg-portrait').forEach(el => { el.style.animation = 'none'; });

  // Layout coordinates ignore our transforms, preventing scroll/animation feedback.
  const layoutTop = (el: HTMLElement) => {
    let top = 0;
    for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
    return top;
  };
  let frame = 0;
  let dirty = true;
  const overflow = [document.documentElement, document.body].map(el => ({ el, value: el.style.overflowX }));
  const containFlight = () => overflow.forEach(({ el, value }) => {
    if (!reduced.matches) el.style.overflowX = 'clip';
    else if (value) el.style.overflowX = value;
    else el.style.removeProperty('overflow-x');
  });
  containFlight();

  const reveal = (item: Entrance) => {
    item.el.style.opacity = item.opacity;
    if (item.el.matches('[data-reveal]')) item.el.classList.add('wr-revealed');
  };
  const play = (item: Entrance) => {
    const { el, kind, index } = item;
    reveal(item);
    if (reduced.matches || el.contains(document.activeElement)) return;
    const strength = mobile.matches ? .6 : 1;
    const side = index % 2 ? 1 : -1;
    const flight = Math.min(innerWidth * .8, 1050);
    const rest: Keyframe = { translate: '0 0', rotate: '0deg', scale: '1', opacity: 1, filter: 'blur(0px)' };
    let frames: Keyframe[], duration = 1900, delay = 0;
    let easing = 'cubic-bezier(.16,1,.3,1)';
    switch (kind) {
      case 'hero-title':
        frames = [
          { translate: `${-flight}px ${-100 * strength}px`, rotate: '-12deg', scale: '.76', opacity: 0, filter: 'blur(9px)' },
          { translate: `${26 * strength}px 0`, rotate: '2deg', scale: '1.02', opacity: 1, filter: 'blur(0px)', offset: .76 }, rest,
        ];
        duration = 1600;
        break;
      case 'hero-art':
        frames = [
          { translate: `${flight}px ${240 * strength}px`, rotate: '27deg', scale: '.42', opacity: 0 },
          { translate: `${-24 * strength}px ${-18 * strength}px`, rotate: '-5deg', scale: '1.025', opacity: 1, offset: .73 }, rest,
        ];
        duration = 1950; delay = 160;
        break;
      case 'hero-eyebrow':
        frames = [{ translate: `0 ${-170 * strength}px`, rotate: '-8deg', opacity: 0 }, rest];
        duration = 1100; delay = 320;
        break;
      case 'hero-follow':
        frames = [{ translate: `${index === 1 ? -140 * strength : 0}px ${index === 1 ? 0 : 100 * strength}px`, opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { ...rest, clipPath: 'inset(0)' }];
        duration = 1300; delay = 650 + index * 220;
        break;
      case 'hero-badge':
        frames = [
          { translate: `${180 * strength}px ${-330 * strength}px`, rotate: '-240deg', scale: '.16', opacity: 0 },
          { translate: `${-12 * strength}px ${14 * strength}px`, rotate: '20deg', scale: '1.12', opacity: 1, offset: .78 }, rest,
        ];
        duration = 1650; delay = 820;
        break;
      case 'hero-caption':
        frames = [{ translate: `${-160 * strength}px ${130 * strength}px`, rotate: '-18deg', opacity: 0 }, { translate: '10px -8px', rotate: '3deg', opacity: 1, offset: .8 }, rest];
        duration = 1400; delay = 1230;
        break;
      case 'fan-card': {
        const column = mobile.matches ? side : index % 3 - 1;
        frames = [
          { translate: `${-column * 220 * strength}px ${180 * strength}px`, rotate: column ? `${-column * 22}deg` : 'x 65deg', scale: '.62', opacity: 0 },
          { translate: `${column * 12}px ${-10 * strength}px`, rotate: column ? `${column * 3}deg` : 'x -4deg', scale: '1.018', opacity: 1, offset: .84 },
          { ...rest, rotate: column ? '0deg' : 'x 0deg' },
        ];
        delay = mobile.matches ? 100 : [220, 0, 460][index % 3];
        break;
      }
      case 'cascade':
        frames = [{ translate: `0 ${160 * strength}px`, rotate: 'x -75deg', transformOrigin: '50% 100%', opacity: 0 }, { ...rest, rotate: 'x 0deg', transformOrigin: '50% 100%' }];
        duration = 1850; delay = (index % 3) * 230;
        break;
      case 'section-title':
      case 'feature-title':
        frames = [{ translate: `${-100 * strength}px 0`, clipPath: 'inset(0 100% 0 0)' }, { ...rest, clipPath: 'inset(0)' }];
        duration = kind === 'feature-title' ? 1850 : 1700; delay = kind === 'feature-title' ? 450 : 0;
        break;
      case 'scene-door':
        frames = [
          { transform: 'perspective(1400px) rotateY(-78deg)', transformOrigin: '0% 50%', translate: `${-90 * strength}px 0`, opacity: .15 },
          { transform: 'perspective(1400px) rotateY(0deg)', transformOrigin: '0% 50%', translate: '0 0', opacity: 1 },
        ];
        duration = 2400; easing = 'cubic-bezier(.2,.65,.2,1)';
        break;
      case 'gallery-wipe': {
        const masks = ['inset(0 100% 0 0)', 'inset(100% 0 0 0)', 'inset(0 0 0 100%)'];
        frames = [{ clipPath: masks[index % 3] }, { clipPath: 'inset(0)' }];
        duration = 2400; delay = (index % 3) * 360; easing = 'cubic-bezier(.35,0,.15,1)';
        break;
      }
      case 'depth-title':
        frames = [{ scale: '1.65', translate: `0 ${80 * strength}px`, rotate: 'x -24deg', opacity: 0, filter: 'blur(16px)' }, { ...rest, rotate: 'x 0deg' }];
        duration = 2200; easing = 'cubic-bezier(.2,.7,.2,1)';
        break;
      case 'catalog-title':
        frames = [{ translate: `0 ${120 * strength}px`, transform: 'perspective(900px) rotateX(-70deg)', transformOrigin: '50% 100%', opacity: 0 }, { ...rest, transform: 'perspective(900px) rotateX(0deg)', transformOrigin: '50% 100%' }];
        duration = 1600;
        break;
      case 'catalog-card':
        frames = [{ translate: `0 ${260 * strength}px`, scale: '.82', clipPath: 'inset(100% 0 0 0)', opacity: .3 }, { ...rest, clipPath: 'inset(0)' }];
        duration = 2100; delay = mobile.matches ? 100 : (index % 3) * 280;
        break;
      case 'catalog-step':
        frames = [{ translate: `${220 * strength}px 0`, rotate: '7deg', opacity: 0 }, rest];
        duration = 1750; delay = (index % 3) * 200;
        break;
      case 'catalog-close':
        frames = [{ scale: '.45', clipPath: 'inset(0 48% round 30px)', opacity: 0 }, { ...rest, clipPath: 'inset(0 round 0px)' }];
        duration = 2200;
        break;
      case 'about-title':
        frames = [{ clipPath: 'inset(0 50%)', scale: '1.18', filter: 'blur(10px)' }, { ...rest, clipPath: 'inset(0)' }];
        duration = 2200; easing = 'cubic-bezier(.4,0,.2,1)';
        break;
      case 'about-iris':
        frames = [{ clipPath: 'circle(0% at 70% 35%)', scale: '1.16' }, { clipPath: 'circle(150% at 70% 35%)', scale: '1' }];
        duration = 2600; easing = 'cubic-bezier(.4,0,.2,1)';
        break;
      case 'about-diagonal':
        frames = [{ clipPath: 'polygon(0 0, 0 0, 0 0, 0 100%)' }, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }];
        duration = 2500; easing = 'cubic-bezier(.3,0,.2,1)';
        break;
      case 'about-lines':
        frames = [{ translate: `0 ${70 * strength}px`, clipPath: 'inset(100% 0 0)', opacity: 0 }, { ...rest, clipPath: 'inset(0)' }];
        duration = 1900; delay = (index % 4) * 170;
        break;
      case 'about-curtain':
        frames = [{ clipPath: 'inset(50% 0)' }, { clipPath: 'inset(0)' }];
        duration = 2600; delay = (index % 3) * 320; easing = 'cubic-bezier(.4,0,.2,1)';
        break;
      case 'contact-title':
        frames = [{ translate: `0 ${-180 * strength}px`, rotate: '-9deg', transformOrigin: '0% 0%', opacity: 0 }, { translate: '0 8px', rotate: '1deg', opacity: 1, offset: .8 }, rest];
        duration = 1700;
        break;
      case 'contact-form':
        frames = [{ transform: 'perspective(1400px) rotateX(45deg)', transformOrigin: '50% 0%', scale: '.88', opacity: 0 }, { transform: 'perspective(1400px) rotateX(0deg)', transformOrigin: '50% 0%', scale: '1', opacity: 1 }];
        duration = 2200; delay = 200;
        break;
      case 'contact-note':
        frames = [{ translate: `${-220 * strength}px 0`, rotate: '-14deg', opacity: 0 }, rest];
        duration = 1800; delay = index * 240;
        break;
      case 'contact-photo':
        frames = [{ clipPath: 'inset(0 0 100% 0 round 50%)', scale: '.75' }, { clipPath: 'inset(0 round 0%)', scale: '1' }];
        duration = 2300;
        break;
      case 'contact-line':
        frames = [{ translate: `${side * 110 * strength}px 0`, scale: '.94', opacity: 0 }, rest];
        duration = 1600; delay = (index % 3) * 180;
        break;
      case 'detail-image':
        if (detailVariant === 0) frames = [{ transform: 'perspective(1200px) rotateY(-65deg)', scale: '.55', opacity: 0 }, { transform: 'perspective(1200px) rotateY(0deg)', scale: '1', opacity: 1 }];
        else if (detailVariant === 1) frames = [{ clipPath: 'circle(0% at 50% 50%)', filter: 'blur(12px)' }, { clipPath: 'circle(150% at 50% 50%)', filter: 'blur(0px)' }];
        else frames = [{ translate: `0 ${-240 * strength}px`, rotate: '-12deg', scale: '.72', opacity: 0 }, { translate: '0 16px', rotate: '2deg', scale: '1.025', opacity: 1, offset: .8 }, rest];
        duration = 2300; easing = 'cubic-bezier(.2,.7,.2,1)';
        break;
      case 'detail-title':
        if (detailVariant === 0) frames = [{ translate: `${180 * strength}px 0`, clipPath: 'inset(0 0 0 100%)' }, { ...rest, clipPath: 'inset(0)' }];
        else if (detailVariant === 1) frames = [{ scale: '1.5', filter: 'blur(16px)', opacity: 0 }, rest];
        else frames = [{ translate: `0 ${100 * strength}px`, clipPath: 'inset(0 0 100% 0)' }, { ...rest, clipPath: 'inset(0)' }];
        duration = 1850; delay = 300;
        break;
      case 'detail-fact':
        frames = [{ translate: `${detailVariant === 0 ? 90 * strength : 0}px ${detailVariant === 0 ? 0 : 60 * strength}px`, opacity: 0 }, rest];
        duration = 1500; delay = 450 + (index % 4) * 140;
        break;
      case 'detail-step':
        frames = [{ translate: `0 ${100 * strength}px`, rotate: `${(detailVariant - 1) * 12}deg`, scale: detailVariant === 1 ? '.6' : '.92', opacity: 0 }, rest];
        duration = 1950; delay = (index % 3) * 230;
        break;
    }
    const animation = el.animate(frames, { duration, delay, easing, fill: 'backwards' });
    animation.id = 'pawfect-scroll-enter';
    playing.set(el, animation);
    animation.finished.catch(() => {}).finally(() => {
      if (playing.get(el) === animation) playing.delete(el);
    });
  };

  const update = () => {
    frame = 0;
    if (document.hidden) return;
    if (dirty) {
      entrances.forEach(item => { item.top = layoutTop(item.el); item.height = item.el.offsetHeight; });
      dirty = false;
    }
    for (const item of entrances) {
      const top = item.top - scrollY;
      if (!item.seen && top < innerHeight * .88 && top + item.height > innerHeight * .08) {
        // Consume even when reduced motion or keyboard focus skips the animation.
        // Scrolling, resizing and preference changes never rearm an entrance.
        item.seen = true;
        play(item);
      }
    }
  };
  const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(update); };
  const measure = () => { dirty = true; schedule(); };
  const cancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    playing.forEach(animation => animation.cancel());
    playing.clear();
  };
  const preference = () => {
    cancel();
    containFlight();
    for (const item of entrances) {
      if (reduced.matches || item.seen) reveal(item);
      else item.el.style.opacity = '0';
    }
    measure();
  };
  document.addEventListener('focusin', event => {
    if (!(event.target instanceof Node)) return;
    for (const item of entrances) {
      if (!item.el.contains(event.target)) continue;
      item.seen = true;
      reveal(item);
      // Cards also carry the saved renderer's finite CSS reveal transition.
      // Finish both layers so keyboard focus never lands on invisible content.
      for (const animation of item.el.getAnimations()) {
        if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
      }
    }
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure, { once: true });
  addEventListener('pagehide', cancel);
  addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); else measure(); });
  reduced.addEventListener('change', preference);
  new ResizeObserver(measure).observe(document.body);
  void document.fonts.ready.then(measure);
  schedule();
  document.getElementById('pawfect-motion-prepaint')?.remove();
}
