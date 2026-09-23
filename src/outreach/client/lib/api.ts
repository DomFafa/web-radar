import { api as radarApi, sessionHeaders } from "../../../client/api";
const API_BASE = "/api/outreach";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const data:any=await radarApi(url,fetchOptions);
  if(data.success===false) throw new Error(data.error || '操作失败');
  return data;
}

// ====== Contacts API ======
export const contactsApi = {
  list: (params?: Record<string, string>) =>
    fetchApi("/contacts", { params }),

  get: (id: string) => fetchApi(`/contacts/${id}`),

  create: (data: any) =>
    fetchApi("/contacts", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchApi(`/contacts/${id}`, { method: "DELETE" }),

  import: (data: { contacts: any[]; groupId?: string; overwrite?: boolean }) =>
    fetchApi("/contacts/import", { method: "POST", body: JSON.stringify(data) }),

  batchDelete: (selection: { ids?: string[]; all?: boolean; excludedIds?: string[]; filters?: Record<string, string> }) =>
    fetchApi("/contacts/batch-delete", {
      method: "POST",
      body: JSON.stringify(selection),
    }),
  batchMove: (selection: any, groupId: string | null) => fetchApi("/contacts/batch-move", {
    method: "POST", body: JSON.stringify({ ...selection, groupId }),
  }),
  createImport: (data: any) => fetchApi("/contacts/imports", { method: "POST", body: JSON.stringify(data) }),
  importBatch: (id: string, batchIndex: number, contacts: any[]) => fetchApi(`/contacts/imports/${id}/batches`, {
    method: "POST", body: JSON.stringify({ batchIndex, contacts }), signal: AbortSignal.timeout(60000),
  }),
  listImports: (page = 1) => fetchApi("/contacts/imports", { params: { page: String(page) } }),
  importRows: (id: string, page = 1, status = "") => fetchApi(`/contacts/imports/${id}/rows`, { params: { page: String(page), status } }),
  exportImport: async (id: string) => {
    const response = await fetch(`/api/outreach/contacts/imports/${encodeURIComponent(id)}/export`, { credentials: "include", headers:sessionHeaders() });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/csv")) throw new Error("下载导入报告失败");
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `联系人导入报告-${id}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  // Groups
  listGroups: () => fetchApi("/contacts/groups"),

  listTags: () => fetchApi("/contacts/tags"),

  createGroup: (data: { name: string; description?: string; color?: string }) =>
    fetchApi("/contacts/groups", { method: "POST", body: JSON.stringify(data) }),

  updateGroup: (id: string, data: any) =>
    fetchApi(`/contacts/groups/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteGroup: (id: string, deleteContacts = false) =>
    fetchApi(`/contacts/groups/${id}`, { method: "DELETE", params: { deleteContacts: String(deleteContacts) } }),
};

// ====== Templates API ======
export const templatesApi = {
  list: (params?: Record<string, string>) =>
    fetchApi("/templates", { params }),

  listAll: async () => {
    const res = await fetchApi("/templates", { params: { pageSize: "200" } });
    const totalPages = Number(res.meta?.totalPages || 1);
    const remainingPages = totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            fetchApi("/templates", { params: { page: String(index + 2), pageSize: "200" } })
          )
        )
      : [];
    return [...(res.data || []), ...remainingPages.flatMap((page: any) => page.data || [])];
  },

  get: (id: string) => fetchApi(`/templates/${id}`),

  create: (data: any) =>
    fetchApi("/templates", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchApi(`/templates/${id}`, { method: "DELETE" }),

  generate: (data: {
    company?: string;
    industry?: string;
    product?: string;
    tone?: string;
    language?: string;
    prompt?: string;
  }) =>
    fetchApi("/templates/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ====== Campaigns API ======
export const campaignsApi = {
  exportReport: async (id: string, name: string) => {
    const response = await fetch(`/api/outreach/campaigns/${encodeURIComponent(id)}/export`, { credentials: "include", headers:sessionHeaders() });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/csv")) {
      const error: any = await response.json().catch(() => ({}));
      throw new Error(error.error || "下载报表失败，请稍后重试");
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/[/\\?%*:|"<>\x00-\x1f]/g, "_")}_发送明细.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  list: (params?: Record<string, string>) =>
    fetchApi("/campaigns", { params }),

  get: (id: string, sync = false) => fetchApi(`/campaigns/${id}`, { params: sync ? { sync: "1" } : undefined }),

  create: (data: any) =>
    fetchApi("/campaigns", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/campaigns/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchApi(`/campaigns/${id}`, { method: "DELETE" }),

  // Recipients
  listRecipients: (campaignId: string, params?: Record<string, string>) =>
    fetchApi(`/campaigns/${campaignId}/recipients`, { params }),

  addRecipients: (
    campaignId: string,
    data: { contactIds?: string[]; groupId?: string; tag?: string }
  ) =>
    fetchApi(`/campaigns/${campaignId}/recipients`, {
      method: "POST",
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(60000),
    }),

  removeRecipient: (campaignId: string, contactId: string) =>
    fetchApi(`/campaigns/${campaignId}/recipients/${contactId}`, { method: "DELETE" }),

  // Actions
  send: (campaignId: string) =>
    fetchApi(`/campaigns/${campaignId}/send`, { method: "POST" }),

  pause: (campaignId: string) =>
    fetchApi(`/campaigns/${campaignId}/pause`, { method: "POST" }),

  // Stats
  overview: () => fetchApi("/campaigns/stats/overview"),
};

export const siteMessagesApi = {
  list: () => fetchApi("/site-messages"),
  overview: () => fetchApi("/site-messages/stats/overview"),
  get: (id: string) => fetchApi(`/site-messages/${id}`),
  create: (data: any) => fetchApi("/site-messages", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/site-messages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  start: (id: string) => fetchApi(`/site-messages/${id}/start`, { method: "POST" }),
  reset: (id: string) => fetchApi(`/site-messages/${id}/reset`, { method: "POST" }),
  pause: (id: string) => fetchApi(`/site-messages/${id}/pause`, { method: "POST" }),
  delete: (id: string) => fetchApi(`/site-messages/${id}`, { method: "DELETE" }),
  forceCleanup: () => fetchApi("/site-messages/force-cleanup", { method: "POST" }),
  exportResults: async (id: string, name: string) => {
    const response = await fetch(`/api/outreach/site-messages/${id}/export`, { credentials: "include", headers:sessionHeaders() });
    if (!response.ok) {
      const err: any = await response.json().catch(() => ({}));
      throw new Error(err.error || "导出结果失败");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/[/\\?%*:|"<>]/g, "_")}_执行结果.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

// ====== User API ======
export const userApi = {
  me: () => fetchApi("/me"),
  // Management (Admin only)
  list: () => fetchApi("/users"),
  create: (data: any) => fetchApi("/users", { method: "POST", body: JSON.stringify(data) }),
  updateRole: (id: string, role: string) => fetchApi(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  delete: (id: string) => fetchApi(`/users/${id}`, { method: "DELETE" }),
};

// ====== Providers API ======
export const providersApi = {
  list: () => fetchApi("/providers"),
  create: (data: any) => fetchApi("/providers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/providers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/providers/${id}`, { method: "DELETE" }),
  test: (data: any) => fetchApi("/providers/test", { method: "POST", body: JSON.stringify(data) }),
  listDomains: (id: string) => fetchApi(`/providers/${id}/domains`),
  configureDomain: (id: string, data: { domain: string; cloudflareApiToken: string; zoneId?: string }) =>
    fetchApi(`/providers/${id}/domains`, { method: "POST", body: JSON.stringify(data) }),
  listCloudflareZones: (id: string, cloudflareApiToken: string) =>
    fetchApi(`/providers/${id}/domains/cloudflare-zones`, {
      method: "POST",
      body: JSON.stringify({ cloudflareApiToken }),
    }),
  checkDomain: (id: string, domain: string) =>
    fetchApi(`/providers/${id}/domains/${encodeURIComponent(domain)}/check`, { method: "POST" }),
  deleteDomain: (id: string, domain: string, data: {
    removeCloudflare: boolean;
    removeMailchimp: boolean;
    cloudflareApiToken?: string;
  }) => fetchApi(`/providers/${id}/domains/${encodeURIComponent(domain)}`, {
    method: "DELETE",
    body: JSON.stringify(data),
  }),
};
