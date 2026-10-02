import type { Draft } from '../shared/model';
import { labels } from './labels';
import { materialsRuntime } from '../shared/materials-runtime';
import { esc, type RenderOptions } from './themes/types';

/** Progressive enhancement shared only by the five product-native candidate releases. */
export function productNativeUiRuntime() {
  document.querySelectorAll<HTMLButtonElement>('[data-product-menu-toggle]').forEach(button => {
    if (button.dataset.wrMenuReady) return;
    const menu = document.getElementById(button.getAttribute('aria-controls') || '') || button.closest('header')?.querySelector<HTMLElement>('[data-product-menu]');
    if (!menu) return;
    button.dataset.wrMenuReady = 'true';
    const toggle = (open: boolean) => { button.setAttribute('aria-expanded', String(open)); menu.setAttribute('data-open', String(open)); };
    button.addEventListener('click', () => toggle(button.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('keydown', event => { if (event.key === 'Escape') { toggle(false); button.focus(); } });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggle(false)));
  });
  document.querySelectorAll<HTMLElement>('[data-wr-product-tabs]').forEach(root => {
    if (root.dataset.wrTabsReady) return;
    const tabs = [...root.querySelectorAll<HTMLElement>('[data-wr-product-tab]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[data-wr-product-panel]')];
    if (!tabs.length || tabs.some(tab => !panels.some(panel => panel.dataset.wrProductPanel === tab.dataset.wrProductTab))) return;
    root.dataset.wrTabsReady = 'true';
    const list = tabs[0].parentElement;
    list?.setAttribute('role', 'tablist');
    const show = (value: string, focus = false) => {
      tabs.forEach((tab, index) => {
        const selected = tab.dataset.wrProductTab === value;
        tab.setAttribute('role', 'tab');
        tab.id ||= `${root.id || 'product-scenes'}-tab-${index}`;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        const panel = panels.find(item => item.dataset.wrProductPanel === tab.dataset.wrProductTab)!;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.hidden = !selected;
        tab.setAttribute('aria-controls', panel.id);
        if (selected && focus) tab.focus();
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', event => { event.preventDefault(); show(tab.dataset.wrProductTab!); });
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        show(tabs[index].dataset.wrProductTab!, true);
      });
    });
    const linkedPanel = panels.find(panel => '#' + panel.id === location.hash);
    show(linkedPanel?.dataset.wrProductPanel || tabs[0].dataset.wrProductTab!);
  });
  document.querySelectorAll<HTMLElement>('[data-product-scene-switch]').forEach(root => {
    if (root.dataset.wrSceneReady) return;
    root.dataset.wrSceneReady = 'true';
    const triggers = [...root.querySelectorAll<HTMLElement>('[data-product-scene-trigger]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[data-product-scene-panel]')];
    const show = (value: string) => {
      triggers.forEach(trigger => trigger.setAttribute('data-active', String(trigger.dataset.productSceneTrigger === value)));
      panels.forEach(panel => panel.setAttribute('data-active', String(panel.dataset.productScenePanel === value)));
    };
    triggers.forEach(trigger => {
      const activate = () => show(trigger.dataset.productSceneTrigger!);
      trigger.addEventListener('pointerenter', activate);
      trigger.addEventListener('focusin', activate);
    });
    if (triggers.length) show(triggers[0].dataset.productSceneTrigger!);
  });
}

/** Same request-id, changed-payload and retry behavior as the existing site inquiry form. */
export function productNativeInquiryRuntime() {
  const form = document.querySelector<HTMLFormElement>('form#inquiry');
  if (!form || form.dataset.wrInquiryReady || form.dataset.wrPreviewDisabled === 'true') return;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status = form.querySelector<HTMLElement>('[role="status"]');
  if (!button || !status || button.disabled) return;
  form.dataset.wrInquiryReady = 'true';
  const productSelect = form.elements.namedItem('productId');
  const productId = new URL(location.href).searchParams.get('productId');
  if (productId && productSelect instanceof HTMLSelectElement && [...productSelect.options].some(option => option.value === productId)) productSelect.value = productId;
  let requestId = crypto.randomUUID(), submitted = '', sending = false;
  const originalLabel = button.textContent;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    button.textContent = form.dataset.wrSending || '';
    const fields = Object.fromEntries(new FormData(form));
    const serialized = JSON.stringify(fields);
    if (submitted && submitted !== serialized) requestId = crypto.randomUUID();
    submitted = serialized;
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, requestId }) });
      if (!response.ok) throw Error('Inquiry failed');
      status.textContent = form.dataset.wrSent || '';
      form.reset();
      requestId = crypto.randomUUID();
      submitted = '';
    } catch {
      status.textContent = form.dataset.wrFailed || '';
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

export function withProductNativeRuntime(html: string, _draft: Draft, options: RenderOptions): string {
  const ui = labels[options.lang];
  const prepared = html.replace('id="inquiry"', `id="inquiry" data-wr-sending="${esc(ui.sending)}" data-wr-sent="${esc(ui.sent)}" data-wr-failed="${esc(ui.failed)}"`);
  return prepared.replace('</body>', `<script>(()=>{const __name=(value)=>value;(${productNativeUiRuntime.toString()})();(${materialsRuntime.toString()})();${options.preview ? '' : `(${productNativeInquiryRuntime.toString()})();`}})();</script></body>`);
}
