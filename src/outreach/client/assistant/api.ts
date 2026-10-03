import { api, sessionHeaders } from '../../../client/api';
import type {
  AssistantChannel,
  AssistantDraftPatch,
  AssistantOptions,
  AssistantResults,
  AssistantSession,
  AssistantSessionSummary,
} from '../../shared/assistant';

const base = '/api/outreach/assistant';
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await api<{ success: boolean; data: T; error?: string }>(base + path, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.success) throw new Error(response.error || '操作未完成，请重试。');
  return response.data;
}
export const assistantApi = {
  list: () => request<AssistantSessionSummary[]>('/sessions'),
  options: (search = '') =>
    request<AssistantOptions>('/options' + (search ? '?search=' + encodeURIComponent(search) : '')),
  create: (channels: AssistantChannel[], requestId: string) =>
    request<AssistantSession>('/sessions', 'POST', { channels, requestId }),
  get: (id: string) => request<AssistantSession>('/sessions/' + encodeURIComponent(id)),
  message: (session: AssistantSession, message: string, requestId: string) =>
    request<AssistantSession>(`/sessions/${session.id}/messages`, 'POST', {
      message,
      requestId,
      expectedVersion: session.version,
    }),
  patch: (session: AssistantSession, draft: AssistantDraftPatch, requestId: string) =>
    request<AssistantSession>(`/sessions/${session.id}/draft`, 'PATCH', {
      draft,
      requestId,
      expectedVersion: session.version,
    }),
  confirm: (session: AssistantSession, siteAuthorized: boolean, requestId: string) =>
    request<AssistantSession>(`/sessions/${session.id}/confirm`, 'POST', {
      expectedVersion: session.version,
      confirmationToken: session.confirmationToken,
      requestId,
      siteAuthorized,
    }),
  retry: (session: AssistantSession, channel: AssistantChannel, requestId: string) =>
    request<AssistantSession>(`/sessions/${session.id}/retry`, 'POST', {
      expectedVersion: session.version,
      channel,
      requestId,
    }),
  results: (id: string) => request<AssistantResults>(`/sessions/${id}/results`),
};

export async function downloadAssistantReport(path: string, name: string) {
  // Only the two existing, authenticated business report endpoints are downloadable.
  if (
    !/^\/api\/outreach\/(campaigns|site-messages)\/[a-zA-Z0-9-]+\/export$/.test(path) &&
    !/^\/api\/outreach\/assistant\/sessions\/[a-zA-Z0-9-]+\/email\/export$/.test(path)
  )
    throw new Error('结果下载地址无效。');
  const response = await fetch(path, { credentials: 'include', headers: sessionHeaders() });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/csv'))
    throw new Error('下载暂未完成，请刷新结果后重试。');
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = name.replace(/[/\\?%*:|"<>\x00-\x1f]/g, '_') + '.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
