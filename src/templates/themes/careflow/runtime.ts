/** Project-owned interactions; Webflow and its third-party scripts are not executed. */
export function careflowRuntime(): void {
  if (
    document.body.dataset.template !== 'careflow-healthcare' ||
    document.body.dataset.careflowReady
  )
    return;
  document.body.dataset.careflowReady = 'true';
  const toggle = document.querySelector<HTMLButtonElement>('[data-careflow-menu]');
  const nav = document.getElementById('careflow-navigation');
  const closeMenu = () => {
    nav?.classList.remove('cf-menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  toggle?.addEventListener('click', () => {
    const open = !nav?.classList.contains('cf-menu-open');
    nav?.classList.toggle('cf-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('cf-menu-open')) {
      closeMenu();
      toggle?.focus();
    }
  });
  matchMedia('(min-width: 992px)').addEventListener('change', closeMenu);
  document.querySelectorAll<HTMLElement>('.accordion-item-wrapper').forEach((item, i) => {
    const heading = item.querySelector<HTMLElement>('.accordion-heading');
    const panel = item.querySelector<HTMLElement>('.accordion-body');
    if (!heading || !panel) return;
    panel.id = `careflow-accordion-${i}`;
    heading.setAttribute('role', 'button');
    heading.tabIndex = 0;
    heading.setAttribute('aria-controls', panel.id);
    const set = (open: boolean) => {
      heading.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      item.classList.toggle('cf-expanded', open);
    };
    set(i === 0);
    heading.addEventListener('click', () => set(Boolean(panel.hidden)));
    heading.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        set(Boolean(panel.hidden));
      }
    });
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
      tab.id = `careflow-tab-${groupIndex}-${i}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `careflow-panel-${groupIndex}-${i}`);
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
      panel.id = `careflow-panel-${groupIndex}-${i}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `careflow-tab-${groupIndex}-${i}`);
    });
    activate(0);
  });
  document.querySelectorAll<HTMLElement>('.w-slider').forEach((slider) => {
    const track = slider.querySelector<HTMLElement>('.w-slider-mask');
    if (!track) return;
    for (const [cls, direction, label] of [
      ['.w-slider-arrow-left', -1, 'Previous specialists'],
      ['.w-slider-arrow-right', 1, 'Next specialists'],
    ] as const) {
      const button = slider.querySelector<HTMLElement>(cls);
      if (!button) continue;
      button.setAttribute('role', 'button');
      button.tabIndex = 0;
      button.setAttribute('aria-label', label);
      const move = () =>
        track.scrollBy({
          left: direction * (track.firstElementChild?.getBoundingClientRect().width || 400),
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      button.addEventListener('click', move);
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          move();
        }
      });
    }
  });
  document.querySelectorAll<HTMLFormElement>('form[data-careflow-form]').forEach((form) => {
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
