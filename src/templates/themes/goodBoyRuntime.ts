/** Reviewed behavior shared by published pages and the private preview. */
export function goodBoyRuntime() {
  const heading = document.querySelector('h1[aria-label]');
  if (heading && !heading.querySelector('span')) heading.removeAttribute('aria-label');
  const menu = document.querySelector<HTMLDetailsElement>('[data-gb-menu]');
  menu?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.open = false;
    }),
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
  document.querySelectorAll<HTMLInputElement>('[data-gb-search]').forEach((input) => {
    input.addEventListener('input', () => {
      const cards = [...document.querySelectorAll<HTMLElement>('[data-gb-product]')];
      let count = 0;
      cards.forEach((card) => {
        card.hidden = !(card.dataset.gbProduct || '').includes(input.value.trim().toLowerCase());
        if (!card.hidden) count++;
      });
      const empty = document.querySelector<HTMLElement>('[data-gb-empty]');
      if (empty) empty.hidden = count > 0;
      const status = document.querySelector('[data-gb-results]');
      if (status) status.textContent = String(count);
    });
  });
}
