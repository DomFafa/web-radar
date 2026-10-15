import { useEffect, useMemo, useRef } from 'react';
import type { ProductSnapshot } from '../shared/model';
import type { MaterialSelectionCard } from '../shared/material-selection-wire';
import { api, sessionHeaders, ApiError } from './api';
import { createMaterialSelectionHost } from './material-selection-host';

export function materialSelectionFrameUrl(origin: string, requestId: string): string {
  const url = new URL(origin);
  if (url.origin !== origin || url.username || url.password || !(url.protocol === 'https:' || url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('Product Radar selection origin is not configured.');
  return `${origin}/material-selection-frame?${new URLSearchParams({ requestId })}`;
}
async function thumbnail(id: string, version: string, signal: AbortSignal) {
  const response = await fetch(`/api/source-products/${encodeURIComponent(id)}/thumbnail?${new URLSearchParams({ expectedVersion: version })}`, { headers: sessionHeaders(), cache: 'no-store', signal });
  if (!response.ok) { const error = await response.json().catch(() => ({})) as { message?: string }; throw new ApiError(error.message ?? '产品预览暂不可用，请刷新后重试。', response.status); }
  if (response.headers.get('Content-Type') !== 'image/webp') throw new Error('Invalid product preview');
  const reader = response.body?.getReader(); if (!reader) throw new Error('Product preview unavailable');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 1024 * 1024) { await reader.cancel(); throw new Error('Product preview exceeds its size limit'); } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  if (signal.aborted) throw new DOMException('Selection closed', 'AbortError');
  return bytes.buffer;
}
const card = ({ id, name, version }: ProductSnapshot): MaterialSelectionCard => ({ id, name, version });
export function ProductImageSelectionFrameHost({ productRadarOrigin, limit, excludedIds, onClose, onChoose, onError }: { productRadarOrigin: string; limit: number; excludedIds: string[]; onClose: () => void; onChoose: (ids: string[]) => void | Promise<void>; onError?: (message: string) => void }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const callbacks = useRef({ onClose, onChoose, onError }); callbacks.current = { onClose, onChoose, onError };
  const settingsKey = JSON.stringify({ limit, excludedIds });
  const requestId = useMemo(() => crypto.randomUUID(), [productRadarOrigin, settingsKey]);
  const source = materialSelectionFrameUrl(productRadarOrigin, requestId);
  useEffect(() => {
    const target = iframe.current?.contentWindow; if (!target) return;
    const previous = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    const activeElement = document.activeElement as HTMLElement | null;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') callbacks.current.onClose(); };
    window.addEventListener('keydown', escape);
    const host = createMaterialSelectionHost(window, target, productRadarOrigin, requestId, { limit, excludedIds }, {
      async load(query, signal) {
        const result = await api<{ products: ProductSnapshot[]; total: number }>(`/api/source-products?${new URLSearchParams({ offset: String((query.page - 1) * query.pageSize), limit: String(query.pageSize), q: query.q })}`, { signal });
        return { products: result.products.map(card), total: result.total };
      },
      async resolve(products, signal) {
        const params = new URLSearchParams(); products.forEach(item => params.append('productId', item.id));
        const result = await api<{ products: ProductSnapshot[] }>(`/api/source-products?${params}`, { signal });
        return result.products.map(card);
      },
      thumbnail,
    }, ids => callbacks.current.onChoose(ids), () => callbacks.current.onClose());
    const readyTimer = setTimeout(() => { if (!host.isReady()) { host.destroy(); callbacks.current.onError?.('暂时无法打开产品选择，请刷新后重试。'); callbacks.current.onClose(); } }, 20_000);
    return () => { clearTimeout(readyTimer); host.destroy(); window.removeEventListener('keydown', escape); document.documentElement.style.overflow = previous; if (activeElement?.isConnected) activeElement.focus({ preventScroll: true }); };
  }, [productRadarOrigin, settingsKey, requestId]);
  return <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}><iframe key={requestId} ref={iframe} title="我的产品" src={source} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', border: 0 }} /></div>;
}
