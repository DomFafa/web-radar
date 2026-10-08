export type ProductMotionTemplate = 'auravell' | 'careflow-healthcare' | 'toorun-early-learning' | 'lumi-business' | 'mello-coffee';
export type ProductMotionPage = 'home' | 'catalog' | 'about' | 'contact' | 'detail';
type Effect = 'editorial-flight' | 'curtain-left' | 'curtain-down' | 'center-open' | 'fold-rise' | 'orbit-land' | 'fan-out'
  | 'depth-focus' | 'rail-slide' | 'stamp-land' | 'receipt-drop' | 'roll-rise' | 'iris-open' | 'diagonal-cut' | 'line-rise' | 'side-fold';
type Group = { selector: string; effect: Effect; delay?: number; stagger?: number };

/** Each page has a composed sequence rather than a shared fade-in preset. */
export function productMotionPlan(template: ProductMotionTemplate, page: ProductMotionPage): Group[] {
  const group = (selector: string, effect: Effect, delay = 0, stagger = 180): Group => ({ selector, effect, delay, stagger });
  const plans: Record<ProductMotionTemplate, Record<ProductMotionPage, Group[]>> = {
    auravell: {
      home: [group('.avp-hero h1', 'editorial-flight'), group('.avp-hero-media', 'curtain-left', 120), group('.avp-hero-copy > :not(h1)', 'line-rise', 520), group('.avp-hero-card', 'receipt-drop', 850), group('.avp-products > article', 'side-fold', 0, 280), group('.avp-context', 'diagonal-cut', 0, 330), group('.avp-editorial-photo', 'curtain-down'), group('.avp-section-heading', 'line-rise')],
      catalog: [group('main h1', 'center-open'), group('.avp-section-heading > p', 'editorial-flight', 260), group('.avp-products > article', 'roll-rise', 420, 290)],
      about: [group('main h1', 'curtain-left'), group('.avp-about-media', 'depth-focus', 120), group('.avp-story .avp-editorial-photo', 'side-fold'), group('.avp-story p', 'line-rise', 160, 210)],
      contact: [group('main h1', 'diagonal-cut'), group('.avp-contact-photo', 'curtain-down', 260), group('.avp-form', 'side-fold', 460), group('.avp-contact-info', 'line-rise', 280)],
      detail: [group('main h1', 'editorial-flight', 220), group('.avp-detail-main', 'center-open'), group('.avp-product-description,.auravell-detail-content dl,.auravell-detail-content ul,.auravell-detail-content .avp-button', 'line-rise', 480, 170), group('.avp-detail-context', 'curtain-left')],
    },
    'careflow-healthcare': {
      home: [group('.cfp-hero h1', 'rail-slide'), group('.cfp-hero-photo', 'center-open', 140), group('.cfp-hero-card > :not(h1)', 'fold-rise', 390), group('.cfp-products > article', 'rail-slide', 0, 240), group('.cfp-feature-photo', 'curtain-left'), group('.cfp-feature-copy', 'line-rise', 280), group('.cfp-context', 'fold-rise', 0, 330), group('.cfp-section-heading', 'line-rise')],
      catalog: [group('main h1', 'fold-rise'), group('.cfp-section-heading > p', 'rail-slide', 280), group('.cfp-products > article', 'curtain-down', 360, 250)],
      about: [group('main h1', 'rail-slide', 140), group('.cfp-mosaic > figure', 'curtain-down', 260, 300), group('.cfp-page-heading > p', 'line-rise', 400), group('.cfp-story > *', 'side-fold', 0, 240)],
      contact: [group('main h1', 'center-open', 80), group('.cfp-contact-card', 'rail-slide', 240), group('.cfp-form', 'fold-rise', 420), group('.cfp-contact-scene .image-wrapper', 'curtain-left'), group('.cfp-contact-scene-copy', 'line-rise', 320)],
      detail: [group('main h1', 'fold-rise', 300), group('.cfp-detail-main', 'curtain-down'), group('.cfp-detail-description', 'rail-slide', 520), group('.cfp-detail-context', 'center-open'), group('.cfp-detail dl,.cfp-detail ul,.cfp-detail .cfp-button', 'line-rise', 600)],
    },
    'toorun-early-learning': {
      home: [group('.tr-hero h1', 'orbit-land'), group('.tr-portrait', 'fan-out', 180, 190), group('.tr-hero-content > :not(h1)', 'roll-rise', 620), group('.tr-intro > div > p', 'center-open'), group('.tr-collage', 'orbit-land', 0, 310), group('.tr-program-card', 'fan-out', 0, 230), group('.tr-values > article', 'fold-rise', 0, 250), group('.tr-section-heading', 'line-rise')],
      catalog: [group('main h1', 'stamp-land'), group('.tr-page-hero > :not(h1)', 'roll-rise', 320), group('.tr-program-card', 'orbit-land', 420, 240), group('.tr-values > article', 'fan-out', 0, 290)],
      about: [group('main h1', 'orbit-land', 90), group('.tr-about-image', 'iris-open', 240), group('.tr-about-lead > div', 'roll-rise', 480), group('.tr-design-frames > *', 'fan-out', 0, 340), group('.tr-photo-copy', 'line-rise', 180)],
      contact: [group('main h1', 'roll-rise'), group('.tr-contact > aside', 'orbit-land', 180), group('.tr-form-wrap', 'center-open', 400), group('.tr-contact > div:not(.tr-form-wrap)', 'line-rise', 320), group('.tr-faq details', 'fan-out', 0, 160)],
      detail: [group('main h1', 'stamp-land', 320), group('.tr-detail-media', 'orbit-land'), group('.tr-detail-copy > :not(h1)', 'roll-rise', 520, 140), group('.tr-program-card', 'iris-open', 0, 250)],
    },
    'lumi-business': {
      home: [group('.lp-hero h1', 'depth-focus'), group('.lp-hero-photo', 'center-open', 220), group('.lp-hero-copy > :not(h1)', 'editorial-flight', 620), group('.lp-products > article', 'curtain-left', 0, 270), group('.lp-story > :not(.lp-story-copy)', 'side-fold'), group('.lp-story-copy', 'line-rise', 360), group('.lp-section-heading', 'center-open')],
      catalog: [group('main h1', 'iris-open'), group('.lp-section-heading > p', 'depth-focus', 330), group('.lp-products > article', 'fold-rise', 440, 260)],
      about: [group('main h1', 'depth-focus', 120), group('.lp-about-wide', 'curtain-left', 300), group('.lp-page-heading > p', 'line-rise', 520), group('.lp-about-story > *', 'center-open', 0, 270)],
      contact: [group('main h1', 'curtain-down'), group('.lp-contact > aside', 'editorial-flight', 160), group('.lp-form', 'depth-focus', 400), group('.lp-contact > div:not(.lp-form)', 'line-rise', 320)],
      detail: [group('main h1', 'center-open', 300), group('.lp-detail-photo', 'side-fold'), group('.lp-detail-copy > :not(h1)', 'depth-focus', 480, 180), group('.lp-detail-context', 'curtain-down')],
    },
    'mello-coffee': {
      home: [group('.hero h1', 'stamp-land'), group('.mp-hero-image', 'fold-rise', 160), group('.hero-text > :not(h1)', 'rail-slide', 560), group('.mp-featured > article', 'orbit-land', 0, 330), group('.receipt', 'receipt-drop'), group('.mp-spec-list > article', 'rail-slide', 0, 220), group('.spot-image', 'curtain-left'), group('.spot-details', 'roll-rise', 240), group('.mp-editorial-note', 'stamp-land')],
      catalog: [group('main h1', 'receipt-drop'), group('.mp-page-heading p', 'rail-slide', 240), group('.mello-card', 'stamp-land', 440, 290), group('.mp-spec-list > article', 'roll-rise', 0, 180)],
      about: [group('main h1', 'stamp-land', 150), group('.mp-about-story figure', 'diagonal-cut', 340), group('.mp-about-story > div', 'receipt-drop', 540), group('.receipt', 'side-fold'), group('.mp-about-detail figure', 'roll-rise'), group('.mp-about-detail > div', 'center-open', 230)],
      contact: [group('main h1', 'orbit-land'), group('.mp-contact-panel', 'receipt-drop', 230), group('.mello-form-card', 'roll-rise', 480), group('.mp-page-heading p', 'line-rise', 360)],
      detail: [group('main h1', 'roll-rise', 300), group('.mp-detail-image', 'stamp-land'), group('.mp-detail > div:last-child > :not(h1)', 'rail-slide', 520, 160), group('.mello-card', 'receipt-drop', 0, 280)],
    },
  };
  return plans[template][page];
}

/** Insert synchronously in the head of this motion revision, before any page paint. */
export function productMotionPrepare(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate || document.getElementById('product-motion-prepaint')) return;
  const style = document.createElement('style');
  style.id = 'product-motion-prepaint';
  style.textContent = 'main,[data-wr-material-region="closing-enquiry"],.cfp-closing{opacity:0!important}';
  document.head.appendChild(style);
  setTimeout(() => {
    if (!style.isConnected) return;
    document.documentElement.dataset.productMotionUnavailable = 'true';
    style.remove();
  }, 1500);
}

/** Bundled as a self-contained script for both public pages and nonce-protected previews. */
export function productMotionRuntime(): void {
  const template = document.body.dataset.template as ProductMotionTemplate;
  if (!['auravell', 'careflow-healthcare', 'toorun-early-learning', 'lumi-business', 'mello-coffee'].includes(template)
    || document.body.dataset.wrMaterialsRevision !== `2026-10-03.${template}-materials.3`
    || document.body.dataset.productMotion || document.documentElement.dataset.productMotionUnavailable || !Element.prototype.animate) return;
  const page: ProductMotionPage = document.querySelector('main [data-wr-material-region="detail"]') ? 'detail'
    : document.querySelector('main [data-wr-material-region="hero"]') ? 'home'
    : document.querySelector('main [data-wr-material-region="contact"]') ? 'contact'
    : document.querySelector('main [data-wr-material-region="about-story"],main [data-wr-material-region="about-opening"],main [data-wr-material-region="about-heading"]') ? 'about' : 'catalog';
  document.body.dataset.productMotion = `${template}:${page}:once-v1`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:600px)');
  type Entrance = { el: HTMLElement; group: Group; index: number; opacity: string; seen: boolean; top: number; height: number };
  const entrances: Entrance[] = [];
  const claimed = new Set<HTMLElement>();
  const playing = new Map<HTMLElement, Animation>();
  const add = (group: Group) => [...document.querySelectorAll<HTMLElement>(group.selector)].forEach((el, index) => {
    // Parent and child entrances would compound their trajectories and hide keyboard controls twice.
    if ([...claimed].some(other => other === el || other.contains(el) || el.contains(other))) return;
    claimed.add(el);
    entrances.push({ el, group, index, opacity: el.style.opacity, seen: reduced.matches, top: 0, height: 0 });
    if (!reduced.matches) el.style.opacity = '0';
  });
  productMotionPlan(template, page).forEach(add);
  add({ selector: 'main h2', effect: page === 'about' ? 'curtain-left' : 'line-rise', stagger: 170 });
  add({ selector: '[data-wr-material-region="closing-enquiry"] h2,.cfp-closing h2,.avp-footer-heading', effect: template === 'mello-coffee' ? 'stamp-land' : template === 'toorun-early-learning' ? 'orbit-land' : 'center-open', stagger: 0 });

  const reveal = (item: Entrance) => {
    if (item.opacity) item.el.style.opacity = item.opacity;
    else item.el.style.removeProperty('opacity');
    if (item.el.matches('[data-reveal]')) item.el.classList.add('wr-revealed');
  };
  const settle = (item: Entrance) => {
    item.seen = true;
    reveal(item);
    playing.get(item.el)?.cancel();
    playing.delete(item.el);
  };
  const play = (item: Entrance) => {
    reveal(item);
    if (reduced.matches || item.el.contains(document.activeElement)) return;
    const { el, index, group } = item;
    const strength = mobile.matches ? .58 : 1;
    const side = index % 2 ? 1 : -1;
    const flight = Math.min(innerWidth * .65, 880) * strength;
    const style = getComputedStyle(el);
    const rest: Keyframe = { translate: style.translate === 'none' ? '0px 0px' : style.translate, rotate: style.rotate === 'none' ? '0deg' : style.rotate, scale: style.scale === 'none' ? '1' : style.scale, opacity: style.opacity, filter: style.filter, clipPath: style.clipPath };
    // A basic shape cannot interpolate to `none`; use an open shape, then release it on finish.
    const openInset: Keyframe = { ...rest, clipPath: style.clipPath === 'none' ? 'inset(0)' : style.clipPath };
    let frames: Keyframe[];
    let duration = 1850;
    let easing = 'cubic-bezier(.16,1,.3,1)';
    switch (group.effect) {
      case 'editorial-flight':
        frames = [{ translate: `${-flight}px ${120 * strength}px`, rotate: '-9deg', scale: '.85', opacity: 0 }, { ...rest, translate: '18px -5px', rotate: '1deg', opacity: 1, offset: .78 }, rest];
        duration = 1750; break;
      case 'curtain-left':
        frames = [{ clipPath: 'inset(0 100% 0 0)', translate: `${-100 * strength}px 0`, scale: '1.12', opacity: .3 }, openInset];
        duration = 2250; easing = 'cubic-bezier(.3,.1,.15,1)'; break;
      case 'curtain-down':
        frames = [{ clipPath: 'inset(0 0 100% 0)', translate: `0 ${-90 * strength}px`, opacity: .2 }, openInset];
        duration = 2200; break;
      case 'center-open':
        frames = [{ clipPath: 'inset(0 48%)', scale: '.76', opacity: 0 }, openInset];
        duration = 2150; easing = 'cubic-bezier(.35,0,.2,1)'; break;
      case 'fold-rise':
        frames = [{ translate: `0 ${240 * strength}px`, rotate: 'x 68deg', scale: '.78', opacity: 0 }, { ...rest, rotate: 'x -3deg', translate: '0 -12px', offset: .8 }, rest];
        duration = 2050; break;
      case 'orbit-land':
        frames = [{ translate: `${side * flight}px ${-180 * strength}px`, rotate: `${side * 28}deg`, scale: '.45', opacity: 0 }, { ...rest, translate: `${-side * 20}px 12px`, rotate: `${-side * 4}deg`, scale: '1.035', offset: .76 }, rest];
        duration = 1950; break;
      case 'fan-out': {
        const column = mobile.matches ? side : index % 3 - 1;
        frames = [{ translate: `${-column * 220 * strength}px ${220 * strength}px`, rotate: `${-column * 24}deg`, scale: '.6', opacity: 0 }, { ...rest, translate: `${column * 12}px -10px`, rotate: `${column * 3}deg`, scale: '1.025', offset: .8 }, rest];
        duration = 2050; break;
      }
      case 'depth-focus':
        frames = [{ scale: '1.65', translate: `0 ${70 * strength}px`, opacity: 0, filter: 'blur(18px)' }, rest];
        duration = 2250; easing = 'cubic-bezier(.2,.7,.2,1)'; break;
      case 'rail-slide':
        frames = [{ translate: `${side * flight}px 0`, scale: '.9', opacity: 0 }, { ...rest, translate: `${-side * 16}px 0`, offset: .82 }, rest];
        duration = 1800; break;
      case 'stamp-land':
        frames = [{ translate: `0 ${-130 * strength}px`, rotate: '-14deg', scale: '1.9', opacity: 0 }, { ...rest, rotate: '3deg', scale: '.94', translate: '0 8px', offset: .73 }, rest];
        duration = 1750; break;
      case 'receipt-drop':
        frames = [{ translate: `0 ${-260 * strength}px`, rotate: '11deg', scale: '.8', opacity: 0 }, { ...rest, translate: '0 16px', rotate: '-2deg', offset: .82 }, rest];
        duration = 1950; break;
      case 'roll-rise':
        frames = [{ translate: `0 ${170 * strength}px`, rotate: `${side * 12}deg`, clipPath: 'inset(100% 0 0 0)', opacity: 0 }, openInset];
        duration = 2000; break;
      case 'iris-open':
        frames = [{ clipPath: 'circle(0% at 60% 40%)', scale: '1.2', opacity: .4 }, { ...rest, clipPath: 'circle(150% at 60% 40%)' }];
        duration = 2500; easing = 'cubic-bezier(.4,0,.2,1)'; break;
      case 'diagonal-cut':
        frames = [{ clipPath: 'polygon(0 0,0 0,0 100%,0 100%)', translate: `${90 * strength}px ${45 * strength}px`, opacity: 0 }, { ...rest, clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }];
        duration = 2350; break;
      case 'line-rise':
        frames = [{ translate: `0 ${90 * strength}px`, clipPath: 'inset(100% 0 0 0)', opacity: 0 }, openInset];
        duration = 1700; break;
      case 'side-fold':
        frames = [{ translate: `${side * 160 * strength}px 0`, rotate: `y ${side * 65}deg`, scale: '.8', opacity: 0 }, { ...rest, rotate: 'y 0deg' }];
        duration = 2250; easing = 'cubic-bezier(.2,.65,.2,1)'; break;
    }
    const animation = el.animate(frames, { duration, delay: (group.delay || 0) + (index % 4) * (group.stagger || 0), easing, fill: 'backwards' });
    animation.id = `product-scroll-enter:${template}:${page}:${group.effect}`;
    playing.set(el, animation);
    animation.finished.catch(() => {}).finally(() => {
      if (playing.get(el) !== animation) return;
      animation.cancel(); // Release individual animation properties; retain the renderer's exact CSS pose.
      playing.delete(el);
    });
  };
  // Offset coordinates ignore our animation transforms, including Toorun's overlapping collage.
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
  const update = () => {
    frame = 0;
    if (document.hidden) return;
    if (dirty) {
      entrances.forEach(item => { item.top = layoutTop(item.el); item.height = item.el.offsetHeight; });
      dirty = false;
    }
    for (const item of entrances) {
      if (item.seen || !item.height || item.el.closest('[hidden]')) continue;
      const top = item.top - scrollY;
      if (top >= innerHeight * .9) continue;
      item.seen = true;
      if (top + item.height <= 0) reveal(item); // A deep link or fast scroll may skip an entire section.
      else play(item);
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
    entrances.forEach(item => {
      if (reduced.matches || item.seen) settle(item);
      else item.el.style.opacity = '0';
    });
    measure();
  };
  document.addEventListener('focusin', event => {
    if (!(event.target instanceof Node)) return;
    entrances.filter(item => item.el.contains(event.target as Node)).forEach(settle);
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure, { once: true });
  addEventListener('pagehide', cancel);
  addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); else measure(); });
  reduced.addEventListener('change', preference);
  new ResizeObserver(measure).observe(document.body);
  new MutationObserver(measure).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  void document.fonts.ready.then(measure);
  containFlight();
  schedule();
  document.getElementById('product-motion-prepaint')?.remove();
}
