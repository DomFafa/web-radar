import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { upload, setSession, clearSession } from '../src/client/api';
class FakeXHR {
  static current: FakeXHR;
  constructor() { FakeXHR.current = this; }
  status = 200; responseText = '{"asset":{"id":"image"}}'; timeout = 0;
  upload = { onprogress: (_: { loaded: number; total: number; lengthComputable: boolean }) => {}, onload: () => {} };
  headers: Record<string, string> = {};
  open = vi.fn(); send = vi.fn();
  setRequestHeader(key: string, value: string) { this.headers[key] = value; }
  onload = () => {}; onerror = () => {}; onabort = () => {}; ontimeout = () => {};
}
const dispatch = vi.fn();
beforeEach(() => {
  vi.stubGlobal('XMLHttpRequest', FakeXHR);
  vi.stubGlobal('window', { dispatchEvent: dispatch });
  vi.stubGlobal('CustomEvent', class { constructor(readonly type: string) {} });
  dispatch.mockClear(); setSession('');
});
afterEach(() => { clearSession(); vi.unstubAllGlobals(); });
it('reports actual bytes but waits for server confirmation, keeping multipart and cookie auth intact', async () => {
  const progress = vi.fn(); const settled = vi.fn(); const form = new FormData();
  const pending = upload('/api/projects/p/uploads', form, progress).then(settled);
  const xhr = FakeXHR.current;
  xhr.upload.onprogress({ loaded: 50, total: 100, lengthComputable: true });
  expect(progress).toHaveBeenLastCalledWith(0.5);
  xhr.upload.onload(); await Promise.resolve();
  expect(settled).not.toHaveBeenCalled(); expect(xhr.headers).toEqual({});
  expect(xhr.send).toHaveBeenCalledWith(form);
  xhr.onload(); await pending;
  expect(settled).toHaveBeenCalledWith({ asset: { id: 'image' } });
});
it('keeps embedded bearer auth and ignores late session errors from the prior login', async () => {
  setSession('old'); const pending = upload('/api/projects/p/uploads', new FormData(), () => {});
  const xhr = FakeXHR.current; expect(xhr.headers.Authorization).toBe('Bearer old');
  setSession('new'); xhr.status = 401; xhr.responseText = '{"code":"session_expired"}'; xhr.onload();
  await expect(pending).rejects.toThrow(); expect(dispatch).not.toHaveBeenCalled();
});
it('dispatches confirmed upload session expiry and returns the server message', async () => {
  const pending = upload('/upload', new FormData(), () => {});
  const xhr = FakeXHR.current; xhr.status = 401; xhr.responseText = '{"code":"session_expired","message":"登录过期"}'; xhr.onload();
  await expect(pending).rejects.toThrow('登录过期'); expect(dispatch).toHaveBeenCalledTimes(1);
});
it.each(['onerror', 'ontimeout', 'onabort'] as const)('rejects %s without leaving uploads pending', async event => {
  const pending = upload('/upload', new FormData(), () => {}); FakeXHR.current[event]();
  await expect(pending).rejects.toThrow();
});
it('rejects invalid successful responses', async () => {
  const pending = upload('/upload', new FormData(), () => {});
  FakeXHR.current.responseText = '<html>error</html>'; FakeXHR.current.onload();
  await expect(pending).rejects.toThrow('无效响应');
});
