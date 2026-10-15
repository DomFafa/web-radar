import { frameMessageSchema, hostMessageSchema, materialSelectionCardSchema, type MaterialSelectionCard, type MaterialSelectionRequest, type MaterialSelectionResult, type HostMessage } from '../shared/material-selection-wire';

type MessageSurface = { addEventListener: (type: 'message', listener: (event: MessageEvent) => void) => void; removeEventListener: (type: 'message', listener: (event: MessageEvent) => void) => void };
type MessageTarget = { postMessage: (message: unknown, origin: string) => void };
export interface MaterialSelectionHostSource {
  load(request: Extract<MaterialSelectionRequest, { kind: 'load' }>, signal: AbortSignal): Promise<{ products: MaterialSelectionCard[]; total: number }>;
  resolve(products: MaterialSelectionCard[], signal: AbortSignal): Promise<MaterialSelectionCard[]>;
  thumbnail(id: string, version: string, signal: AbortSignal): Promise<ArrayBuffer>;
}
export function createMaterialSelectionHost(surface: MessageSurface, target: MessageTarget, origin: string, requestId: string, settings: { limit: number; excludedIds: string[] }, source: MaterialSelectionHostSource, choose: (ids: string[]) => void | Promise<void>, cancel: () => void) {
  let active = true, ready = false, choosing = false, resolveGeneration = 0, latestResolved: string[] | null = null, thumbnails = 0;
  const lifetime = new AbortController(), seen = new Set<string>(), pending = new Set<string>();
  const queue: Array<{ run: () => void; reject: (reason: Error) => void }> = [];
  function post(message: HostMessage) { if (active) target.postMessage(hostMessageSchema.parse(message), origin); }
  function destroy() { if (!active) return; active = false; lifetime.abort(); surface.removeEventListener('message', receive); for (const item of queue.splice(0)) item.reject(new DOMException('Selection closed', 'AbortError')); }
  function thumbnail(id: string, version: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const run = () => { thumbnails++; void source.thumbnail(id, version, lifetime.signal).then(resolve, reject).finally(() => { thumbnails--; if (active) queue.shift()?.run(); }); };
      if (thumbnails < 4) run(); else queue.push({ run, reject });
    });
  }
  async function request(operationId: string, input: MaterialSelectionRequest) {
    if (pending.size >= 64) { post({ protocolVersion: 1, requestId, type: 'error', operationId, message: 'Too many pending previews. Retry after the current images finish loading.' }); return; }
    pending.add(operationId);
    try {
      let result: MaterialSelectionResult;
      if (input.kind === 'choose') {
        if (choosing) throw new Error('导入仍在进行中，请等待当前操作完成。');
        if (!latestResolved || !input.ids.length || JSON.stringify(input.ids) !== JSON.stringify(latestResolved)) throw new Error('请先确认当前选择，再继续导入。');
        choosing = true;
        try {
          await choose([...latestResolved]);
          if (!active) return;
          post({ protocolVersion: 1, requestId, type: 'response', operationId, result: { kind: 'choose' } });
          destroy(); cancel();
        } finally { choosing = false; }
        return;
      }
      if (input.kind === 'load') result = { kind: 'load', ...await source.load(input, lifetime.signal) };
      else if (input.kind === 'thumbnail') result = { kind: 'thumbnail', bytes: await thumbnail(input.id, input.version) };
      else {
        if (choosing) throw new Error('导入仍在进行中，请等待当前操作完成。');
        const generation = ++resolveGeneration; latestResolved = null;
        if (!input.products.length || input.products.length > settings.limit || input.products.some(item => settings.excludedIds.includes(item.id))) throw new Error('Remove unavailable or already imported products before continuing.');
        const current = (await source.resolve(input.products, lifetime.signal)).map(item => materialSelectionCardSchema.parse(item));
        if (current.length !== input.products.length || new Set(current.map(item => item.id)).size !== current.length || input.products.some(item => current.find(value => value.id === item.id)?.version !== item.version)) throw new Error('A selected product changed. Remove it and select it again.');
        const products = input.products.map(item => current.find(value => value.id === item.id)!);
        if (generation === resolveGeneration && active) latestResolved = products.map(item => item.id);
        result = { kind: 'resolve', products };
      }
      post({ protocolVersion: 1, requestId, type: 'response', operationId, result });
    } catch (error) {
      post({ protocolVersion: 1, requestId, type: 'error', operationId, message: (error instanceof Error ? error.message : 'Product selection failed. Retry.').slice(0, 500) || 'Product selection failed. Retry.' });
    } finally { pending.delete(operationId); }
  }
  function receive(event: MessageEvent) {
    if (!active || event.origin !== origin || event.source !== target) return;
    const parsed = frameMessageSchema.safeParse(event.data);
    if (!parsed.success || parsed.data.requestId !== requestId) return;
    const message = parsed.data;
    if (message.type === 'ready') { ready = true; post({ protocolVersion: 1, requestId, type: 'init', ...settings }); return; }
    if (message.type === 'cancel') { destroy(); cancel(); return; }
    if (seen.has(message.operationId)) return;
    seen.add(message.operationId); if (seen.size > 512) seen.delete(seen.values().next().value!);
    void request(message.operationId, message.request);
  }
  surface.addEventListener('message', receive);
  return { destroy, isReady: () => ready };
}
