export function auravellRuntime(): void {
  if (
    typeof document === 'undefined' ||
    document.body.dataset.template !== 'auravell' ||
    document.body.dataset.auravellReady
  )
    return;
  document.body.dataset.auravellReady = 'true';

  // 1. Mobile Menu Toggle
  const menuButtons = document.querySelectorAll<HTMLElement>('.rt-menu-button-main, [data-auravell-menu]');
  const navMenu = document.querySelector<HTMLElement>('.rt-navbar-menu-wrapper, [data-auravell-nav]');
  const navOverlay = document.querySelector<HTMLElement>('.rt-navbar-overlay');

  menuButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = navMenu?.classList.contains('w--open') || navMenu?.hasAttribute('data-nav-menu-open');
      if (isOpen) {
        navMenu?.classList.remove('w--open');
        navMenu?.removeAttribute('data-nav-menu-open');
        btn.classList.remove('w--open');
        btn.setAttribute('aria-expanded', 'false');
        if (navOverlay) navOverlay.style.display = 'none';
      } else {
        navMenu?.classList.add('w--open');
        navMenu?.setAttribute('data-nav-menu-open', '');
        btn.classList.add('w--open');
        btn.setAttribute('aria-expanded', 'true');
        if (navOverlay) navOverlay.style.display = 'block';
      }
    });
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      navMenu?.classList.remove('w--open');
      navMenu?.removeAttribute('data-nav-menu-open');
      menuButtons.forEach((b) => b.classList.remove('w--open'));
      navOverlay.style.display = 'none';
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navMenu?.hasAttribute('data-nav-menu-open')) menuButtons[0]?.click();
  });
  // 2. Accordions (FAQ & Details)
  const accordionHeaders = document.querySelectorAll<HTMLElement>(
    '.rt-accordion-heading, [data-auravell-accordion-trigger]'
  );
  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.rt-accordion-item, .w-dropdown');
      if (!item) return;
      const body = item.querySelector<HTMLElement>('.rt-accordion-body, .w-dropdown-list');
      const isExpanded = item.classList.contains('w--open') || header.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        item.classList.remove('w--open');
        header.setAttribute('aria-expanded', 'false');
        if (body) body.style.display = 'none';
      } else {
        item.classList.add('w--open');
        header.setAttribute('aria-expanded', 'true');
        if (body) body.style.display = 'block';
      }
    });
  });

  // 3. Class Category Filter Tabs
  const tabs = document.querySelectorAll<HTMLElement>('[data-auravell-tab]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.auravellTab || 'all';
      tabs.forEach((t) => t.classList.remove('w--current', 'active'));
      tab.classList.add('w--current', 'active');

      const cards = document.querySelectorAll<HTMLElement>('[data-auravell-category]');
      cards.forEach((card) => {
        if (category === 'all' || card.dataset.auravellCategory === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Background Video Pause/Play Control
  const videoControls = document.querySelectorAll<HTMLElement>('.w-backgroundvideo-backgroundvideoplaypausebutton');
  videoControls.forEach((control) => {
    control.addEventListener('click', () => {
      const wrapper = control.closest('.w-background-video');
      const video = wrapper?.querySelector<HTMLVideoElement>('video');
      if (!video) return;
      if (video.paused) {
        video.play();
        control.classList.remove('w-background-video--paused');
      } else {
        video.pause();
        control.classList.add('w-background-video--paused');
      }
    });
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
