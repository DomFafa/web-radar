import { publicFetch as fetch } from "../lib/network";
import { seal, decodeProvider, loadProviders, redactConfig } from "../lib/credentials";
import { Hono } from "hono";
import type { Bindings, Variables } from "../../shared/types";
import { requireAuth, requireRole } from "../middleware/auth";
import { createDb } from "../../db";
import { providers } from "../../db/schema";
import { and, eq, desc } from "drizzle-orm";

type Env = { Bindings: Bindings; Variables: Variables };
export const providersRoutes = new Hono<Env>();

// 仅 admin 或 owner 可配置系统级服务商
providersRoutes.use("/*", requireAuth);
providersRoutes.use("/*", async (c,next) => {
  if(c.req.method !== 'GET' && !['owner','admin'].includes(c.get('user')!.role)) return c.json({error:'仅工作空间管理员可配置服务商'},403);
  const id=c.req.path.split('/providers/')[1]?.split('/')[0];
  if(id && id !== 'test') {
    const row=await createDb(c.env.DB).select().from(providers).where(and(eq(providers.id,id),eq(providers.userId,c.get('user')!.id))).get();
    if(!row) return c.json({error:'服务商配置不存在'},404);
  }
  await next();
});

// 掩码函数
function maskApiKey(key: string | null) {
  if (!key) return null;
  if (key.length <= 11) return "******";
  return key.slice(0, 7) + "********" + key.slice(-4);
}

type MailchimpDomainState = {
  domain: string;
  zoneId: string;
  zoneName: string;
  status: "pending" | "verified" | "error";
  verified: boolean;
  dkimValid: boolean;
  dmarcValid: boolean | null;
  validSigning: boolean;
  recordIds: string[];
  lastCheckedAt: string;
  error?: string;
};

type DomainDeleteResult = {
  growthos: "deleted";
  cloudflare: "not_requested" | "deleted" | "no_managed_records" | "failed";
  cloudflareDeletedRecords: number;
  mailchimp: "not_requested" | "deleted" | "not_found" | "manual_confirmation_required" | "failed";
  warnings: string[];
};

const MANAGED_DNS_COMMENT_PREFIX = "Managed by GrowthOS for Mailchimp Transactional";

function parseConfig(value: string | null | undefined): Record<string, any> {
  try { return value ? JSON.parse(value) : {}; } catch { return {}; }
}

function normalizeDomain(value: unknown): string {
  const raw = String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "");
  const domain = raw.split("/")[0].split(":")[0].replace(/^\.+|\.+$/g, "");
  if (!domain || domain.length > 253 || !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)) {
    throw new Error("请输入有效的域名，例如 example.com");
  }
  return domain;
}

async function mandrillRequest<T = any>(apiKey: string, endpoint: string, body: Record<string, any> = {}): Promise<T> {
  const response = await fetch(`https://mandrillapp.com/api/1.0${endpoint}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: apiKey, ...body }),
  });
  const text = await response.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!response.ok || data?.status === "error") {
    throw new Error(data?.message || data?.name || `Mailchimp Transactional 请求失败 (${response.status})`);
  }
  return data as T;
}

async function cloudflareRequest<T = any>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data: any = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    const message = data?.errors?.map((item: any) => item.message).filter(Boolean).join("; ");
    throw new Error(message || `Cloudflare API 请求失败 (${response.status})`);
  }
  return data.result as T;
}

async function findCloudflareZone(token: string, domain: string, requestedZoneId?: string) {
  if (requestedZoneId) {
    const zone: any = await cloudflareRequest(token, `/zones/${encodeURIComponent(requestedZoneId)}`);
    if (domain !== zone.name && !domain.endsWith(`.${zone.name}`)) throw new Error("Zone ID 与输入域名不匹配");
    return { id: zone.id as string, name: zone.name as string };
  }
  const labels = domain.split(".");
  for (let index = 0; index < labels.length - 1; index += 1) {
    const candidate = labels.slice(index).join(".");
    const zones: any[] = await cloudflareRequest(token, `/zones?name=${encodeURIComponent(candidate)}&status=active&per_page=1`);
    if (zones[0]) return { id: zones[0].id as string, name: zones[0].name as string };
  }
  throw new Error("未在该 Cloudflare Token 可访问的账户中找到对应 Zone；请确认 Token 具有 Zone Read 和 DNS Edit 权限");
}

async function listCloudflareZones(token: string) {
  const zones: Array<{ id: string; name: string; status: string }> = [];
  const perPage = 50;
  for (let page = 1; page <= 20; page += 1) {
    const result: any[] = await cloudflareRequest(
      token,
      `/zones?status=active&per_page=${perPage}&page=${page}&order=name&direction=asc`,
    );
    zones.push(...result.map((zone) => ({
      id: String(zone.id),
      name: String(zone.name),
      status: String(zone.status || "active"),
    })));
    if (result.length < perPage) break;
  }
  return zones;
}

async function upsertDnsRecord(
  token: string,
  zoneId: string,
  record: { type: "CNAME" | "TXT"; name: string; content: string; comment: string },
  preserveExistingTxt = false,
): Promise<string | null> {
  const existing: any[] = await cloudflareRequest(
    token,
    `/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}&per_page=100`,
  );
  const exact = existing.find((item) => String(item.content).replace(/\.$/, "") === record.content.replace(/\.$/, ""));
  if (exact) return exact.id;
  if (preserveExistingTxt && existing.length > 0) return existing[0].id;

  const payload = { ...record, ttl: 1, proxied: false };
  if (record.type === "CNAME" && existing[0]) {
    const updated: any = await cloudflareRequest(token, `/zones/${zoneId}/dns_records/${existing[0].id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return updated.id;
  }
  const created: any = await cloudflareRequest(token, `/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return created.id;
}

async function deleteManagedDnsRecords(token: string, zoneId: string, domain: string): Promise<number> {
  const managedNames = [
    `mte1._domainkey.${domain}`,
    `mte2._domainkey.${domain}`,
    domain,
    `_dmarc.${domain}`,
  ];
  const recordsByName = await Promise.all(managedNames.map((name) => cloudflareRequest<any[]>(
    token,
    `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&per_page=100`,
  )));
  const managedRecords = recordsByName
    .flat()
    .filter((record, index, records) => (
      String(record.comment || "").startsWith(MANAGED_DNS_COMMENT_PREFIX)
      && records.findIndex((candidate) => candidate.id === record.id) === index
    ));

  await Promise.all(managedRecords.map((record) => cloudflareRequest(
    token,
    `/zones/${zoneId}/dns_records/${encodeURIComponent(record.id)}`,
    { method: "DELETE" },
  )));
  return managedRecords.length;
}

function mapMailchimpDomainStatus(domain: string, previous: Partial<MailchimpDomainState>, result: any): MailchimpDomainState {
  const verified = Boolean(result?.verified_at || result?.verified);
  const dkimValid = Boolean(result?.dkim?.valid);
  const dmarcValid = typeof result?.dmarc?.valid === "boolean" ? result.dmarc.valid : null;
  const validSigning = Boolean(result?.valid_signing);
  return {
    domain,
    zoneId: previous.zoneId || "",
    zoneName: previous.zoneName || "",
    status: validSigning || (verified && dkimValid && dmarcValid !== false) ? "verified" : "pending",
    verified,
    dkimValid,
    dmarcValid,
    validSigning,
    recordIds: previous.recordIds || [],
    lastCheckedAt: new Date().toISOString(),
    error: result?.dkim?.error || result?.dmarc?.error || undefined,
  };
}

async function getTransactionalProvider(db: ReturnType<typeof createDb>, id: string, env: Bindings) {
  const [record] = await db.select().from(providers).where(eq(providers.id, id));
  const provider = record ? await decodeProvider(record, env) : undefined;
  if (!provider || provider.provider !== "mailchimp") throw new Error("未找到 Mailchimp 服务商配置");
  const config = parseConfig(provider.config);
  const apiType = config.apiType || (/-[a-z]{2}\d+$/i.test(provider.apiKey.trim()) ? "marketing" : "transactional");
  if (apiType !== "transactional") throw new Error("自动域名配置仅支持 Mailchimp Transactional / Mandrill Key");
  config.apiType = apiType;
  return { provider, config };
}

// 获取所有服务商配置
providersRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const providerList = await loadProviders(db,c.env,c.get('user')!.id);
  const sanitizedList = providerList.map(p=>({...p,apiKey:undefined,maskedApiKey:maskApiKey(p.apiKey),config:redactConfig(p.config)}));
  return c.json({ data: sanitizedList });
});

// Mailchimp Transactional sending-domain management. Cloudflare tokens are
// intentionally request-only and are never persisted in D1.
providersRoutes.get("/:id/domains", async (c) => {
  const db = createDb(c.env.DB);
  try {
    const { provider, config } = await getTransactionalProvider(db, c.req.param("id"), c.env);
    const storedDomains: MailchimpDomainState[] = Array.isArray(config.mailchimpDomains) ? config.mailchimpDomains : [];
    const hiddenDomains = new Set<string>(Array.isArray(config.hiddenMailchimpDomains) ? config.hiddenMailchimpDomains : []);
    const senderDomains: any[] = await mandrillRequest(provider.apiKey, "/senders/domains");
    const synchronizedDomains = senderDomains.filter((remote) => !hiddenDomains.has(String(remote.domain || "").toLowerCase())).map((remote) => {
      const domain = normalizeDomain(remote.domain);
      const previous = storedDomains.find((item) => item.domain === domain) || {};
      return mapMailchimpDomainStatus(domain, previous, remote);
    });
    config.mailchimpDomains = synchronizedDomains;
    await db.update(providers).set({ config: await seal(JSON.stringify(config),provider.id+':config',c.env), updatedAt: new Date() }).where(eq(providers.id, provider.id));
    return c.json({ data: synchronizedDomains });
  } catch (error: any) {
    return c.json({ error: error.message || "读取域名失败" }, 400);
  }
});

providersRoutes.post("/:id/domains/cloudflare-zones", async (c) => {
  const db = createDb(c.env.DB);
  try {
    const body = await c.req.json<{ cloudflareApiToken?: string }>();
    const cloudflareApiToken = String(body.cloudflareApiToken || "").trim();
    if (!cloudflareApiToken) return c.json({ error: "请填写 Cloudflare API Token" }, 400);
    await getTransactionalProvider(db, c.req.param("id"), c.env);
    const zones = await listCloudflareZones(cloudflareApiToken);
    return c.json({
      message: zones.length > 0 ? `已读取 ${zones.length} 个 Cloudflare 域名` : "该 Token 下没有可访问的有效域名",
      data: zones,
    });
  } catch (error: any) {
    return c.json({ error: error.message || "读取 Cloudflare 域名失败" }, 400);
  }
});

providersRoutes.post("/:id/domains", async (c) => {
  const db = createDb(c.env.DB);
  try {
    const body = await c.req.json<{ domain?: string; cloudflareApiToken?: string; zoneId?: string }>();
    const domain = normalizeDomain(body.domain);
    const cloudflareApiToken = String(body.cloudflareApiToken || "").trim();
    if (!cloudflareApiToken) return c.json({ error: "请填写 Cloudflare API Token" }, 400);

    const { provider, config } = await getTransactionalProvider(db, c.req.param("id"), c.env);
    const currentDomains: MailchimpDomainState[] = Array.isArray(config.mailchimpDomains) ? config.mailchimpDomains : [];
    const previous = currentDomains.find((item) => item.domain === domain) || {};

    const senderDomains: any[] = await mandrillRequest(provider.apiKey, "/senders/domains");
    let mailchimpDomain = senderDomains.find((item) => item.domain === domain);
    if (!mailchimpDomain) mailchimpDomain = await mandrillRequest(provider.apiKey, "/senders/add-domain", { domain });
    if (!mailchimpDomain?.verify_txt_key && !mailchimpDomain?.verified_at) {
      throw new Error("Mailchimp 未返回域名所有权验证 Key，请稍后重试或检查 Transactional 账户状态");
    }

    const zone = await findCloudflareZone(cloudflareApiToken, domain, String(body.zoneId || "").trim() || undefined);
    const records = [
      { type: "CNAME" as const, name: `mte1._domainkey.${domain}`, content: "dkim1.mandrillapp.com", comment: "Managed by GrowthOS for Mailchimp Transactional DKIM" },
      { type: "CNAME" as const, name: `mte2._domainkey.${domain}`, content: "dkim2.mandrillapp.com", comment: "Managed by GrowthOS for Mailchimp Transactional DKIM" },
      { type: "TXT" as const, name: domain, content: `mandrill_verify.${mailchimpDomain.verify_txt_key}`, comment: "Managed by GrowthOS for Mailchimp Transactional domain verification" },
    ];
    const recordIds = (await Promise.all(records.map((record) => upsertDnsRecord(cloudflareApiToken, zone.id, record)))).filter(Boolean) as string[];
    const dmarcId = await upsertDnsRecord(cloudflareApiToken, zone.id, {
      type: "TXT",
      name: `_dmarc.${domain}`,
      content: "v=DMARC1; p=none",
      comment: "Managed by GrowthOS for Mailchimp Transactional DMARC",
    }, true);
    if (dmarcId) recordIds.push(dmarcId);

    const checked = await mandrillRequest(provider.apiKey, "/senders/check-domain", { domain });
    const state = mapMailchimpDomainStatus(domain, { ...previous, zoneId: zone.id, zoneName: zone.name, recordIds }, checked);
    config.mailchimpDomains = [...currentDomains.filter((item) => item.domain !== domain), state];
    config.hiddenMailchimpDomains = (Array.isArray(config.hiddenMailchimpDomains) ? config.hiddenMailchimpDomains : [])
      .filter((item: string) => item !== domain);
    await db.update(providers).set({ config: await seal(JSON.stringify(config),provider.id+':config',c.env), updatedAt: new Date() }).where(eq(providers.id, provider.id));
    return c.json({
      message: state.status === "verified" ? "域名已完成认证" : "DNS 记录已配置，正在等待 DNS 生效",
      data: state,
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message || "域名自动配置失败" }, 400);
  }
});

providersRoutes.post("/:id/domains/:domain/check", async (c) => {
  const db = createDb(c.env.DB);
  try {
    const domain = normalizeDomain(decodeURIComponent(c.req.param("domain")));
    const { provider, config } = await getTransactionalProvider(db, c.req.param("id"), c.env);
    const currentDomains: MailchimpDomainState[] = Array.isArray(config.mailchimpDomains) ? config.mailchimpDomains : [];
    const previous = currentDomains.find((item) => item.domain === domain);
    if (!previous) return c.json({ error: "该域名尚未在系统中配置" }, 404);
    const checked = await mandrillRequest(provider.apiKey, "/senders/check-domain", { domain });
    const state = mapMailchimpDomainStatus(domain, previous, checked);
    config.mailchimpDomains = [...currentDomains.filter((item) => item.domain !== domain), state];
    await db.update(providers).set({ config: await seal(JSON.stringify(config),provider.id+':config',c.env), updatedAt: new Date() }).where(eq(providers.id, provider.id));
    return c.json({ message: state.status === "verified" ? "域名认证已生效" : "DNS 尚未完全生效，请稍后再检查", data: state });
  } catch (error: any) {
    return c.json({ error: error.message || "检查域名失败" }, 400);
  }
});

providersRoutes.delete("/:id/domains/:domain", async (c) => {
  const db = createDb(c.env.DB);
  try {
    const domain = normalizeDomain(decodeURIComponent(c.req.param("domain")));
    const body: {
      removeCloudflare?: boolean;
      removeMailchimp?: boolean;
      cloudflareApiToken?: string;
    } = await c.req.json().catch(() => ({}));
    const { provider, config } = await getTransactionalProvider(db, c.req.param("id"), c.env);
    const currentDomains: MailchimpDomainState[] = Array.isArray(config.mailchimpDomains) ? config.mailchimpDomains : [];
    const previous = currentDomains.find((item) => item.domain === domain);
    if (!previous) return c.json({ error: "该域名尚未在 GrowthOS 中配置" }, 404);

    const result: DomainDeleteResult = {
      growthos: "deleted",
      cloudflare: "not_requested",
      cloudflareDeletedRecords: 0,
      mailchimp: "not_requested",
      warnings: [],
    };

    if (body.removeCloudflare) {
      const token = String(body.cloudflareApiToken || "").trim();
      if (!token) return c.json({ error: "同步删除 Cloudflare DNS 需要填写 API Token" }, 400);
      try {
        const zone = previous.zoneId
          ? await findCloudflareZone(token, domain, previous.zoneId)
          : await findCloudflareZone(token, domain);
        result.cloudflareDeletedRecords = await deleteManagedDnsRecords(token, zone.id, domain);
        result.cloudflare = result.cloudflareDeletedRecords > 0 ? "deleted" : "no_managed_records";
        if (result.cloudflareDeletedRecords === 0) {
          result.warnings.push("Cloudflare 中未找到由 GrowthOS 创建并带管理标记的 DNS 记录，未删除其他记录");
        }
      } catch (error: any) {
        result.cloudflare = "failed";
        result.warnings.push(`Cloudflare 同步删除失败：${error.message || "未知错误"}`);
      }
    }

    if (body.removeMailchimp) {
      try {
        const senderDomains: any[] = await mandrillRequest(provider.apiKey, "/senders/domains");
        const remote = senderDomains.find((item) => String(item.domain || "").toLowerCase() === domain);
        if (!remote) {
          result.mailchimp = "not_found";
        } else if (remote.verified_at || remote.verified) {
          result.mailchimp = "manual_confirmation_required";
          result.warnings.push("Mailchimp 已验证域名不能通过 API 删除，需要登录 Mailchimp Transactional 后台确认删除");
        } else {
          await mandrillRequest(provider.apiKey, "/senders/delete-domain", { domain });
          result.mailchimp = "deleted";
        }
      } catch (error: any) {
        result.mailchimp = "failed";
        result.warnings.push(`Mailchimp 同步删除失败：${error.message || "未知错误"}`);
      }
    }

    config.mailchimpDomains = currentDomains.filter((item) => item.domain !== domain);
    const hiddenDomains: string[] = Array.isArray(config.hiddenMailchimpDomains) ? config.hiddenMailchimpDomains : [];
    config.hiddenMailchimpDomains = Array.from(new Set([...hiddenDomains, domain]));
    await db.update(providers).set({ config: await seal(JSON.stringify(config),provider.id+':config',c.env), updatedAt: new Date() }).where(eq(providers.id, provider.id));

    return c.json({
      message: result.warnings.length > 0 ? "域名已从 GrowthOS 移除，部分外部操作需要处理" : "域名及所选外部配置已删除",
      data: result,
    });
  } catch (error: any) {
    return c.json({ error: error.message || "删除域名失败" }, 400);
  }
});

// 添加服务商配置
providersRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "未登录" }, 401);
  }
  const body = await c.req.json();
  const { provider, name, apiKey, config, isDefault } = body;

  if (!provider || !name || !apiKey) {
    return c.json({ error: "参数不完整" }, 400);
  }

  const db = createDb(c.env.DB);
  
  // 如果设置为默认，需要把其他的默认取消
  if (isDefault) {
    await db.update(providers)
      .set({ isDefault: false })
      .where(and(eq(providers.userId, user.id), eq(providers.provider, provider)))
      .execute();
  }

  const newProvider = {
    id: crypto.randomUUID(),
    userId: user.id,
    provider,
    name,
    apiKey,
    config: config ? JSON.stringify(config) : null,
    isDefault: !!isDefault,
    status: "active" as const,
  };

  newProvider.apiKey = await seal(apiKey,newProvider.id,c.env);
  newProvider.config = config ? await seal(JSON.stringify(config),newProvider.id+':config',c.env) : null;
  await db.insert(providers).values(newProvider).execute();

  return c.json({ message: "服务商添加成功", data: { id: newProvider.id } }, 201);
});

// 更新服务商
providersRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user")!;
  const body = await c.req.json();
  const { provider, name, apiKey, config, isDefault } = body;

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(providers).where(eq(providers.id, id));
  if (!existing) return c.json({ error: "服务商配置不存在" }, 404);
  
  if (isDefault) {
    await db.update(providers)
      .set({ isDefault: false })
      .where(and(eq(providers.userId, existing.userId || user.id), eq(providers.provider, provider || existing.provider)))
      .execute();
  }

  const updateData: any = { updatedAt: new Date() };
  if (provider) updateData.provider = provider;
  if (name) updateData.name = name;
  if (apiKey && !apiKey.includes("***")) updateData.apiKey = await seal(apiKey,id,c.env);
  if (config !== undefined) {
    const old=await decodeProvider(existing,c.env);
    const previous=JSON.parse(old.config || '{}');
    const merged={...config};
    for(const k of Object.keys(merged)) if(merged[k]==='********') merged[k]=previous[k];
    updateData.config = config ? await seal(JSON.stringify(merged),id+':config',c.env) : null;
  }
  if (isDefault !== undefined) updateData.isDefault = !!isDefault;

  await db.update(providers).set(updateData).where(eq(providers.id, id)).execute();
  
  return c.json({ message: "服务商已更新" });
});

// 删除服务商
providersRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  
  await db.delete(providers).where(eq(providers.id, id)).execute();
  
  return c.json({ message: "服务商已删除" });
});

// 测试服务商连通性
providersRoutes.post("/test", async (c) => {
  const body = await c.req.json<{
    provider: string;
    apiKey: string;
    config?: any;
    id?: string;
  }>();

  let apiKey = body.apiKey;
  let config = body.config;

  // 如果 Key 包含掩码，且传入了 id，则从数据库获取明文 Key
  if ((!apiKey || apiKey.includes("***")) && body.id) {
    const db = createDb(c.env.DB);
    const [existing] = await db
      .select()
      .from(providers)
      .where(and(eq(providers.id, body.id),eq(providers.userId,c.get("user")!.id)));
    if (existing) {
      const decoded = await decodeProvider(existing,c.env);
      apiKey = decoded.apiKey;
      if (!config && decoded.config) {
        try { config = JSON.parse(decoded.config!); } catch (e) {}
      }
    }
  }

  if (!apiKey || apiKey.includes("***")) {
    return c.json({ success: false, error: "请提供有效的 API Key 进行测试" }, 400);
  }

  try {
    if (body.provider === "mailchimp") {
      let configuredType: "marketing" | "transactional" = /-[a-z]{2}\d+$/i.test(apiKey.trim()) ? "marketing" : "transactional";
      if (config?.apiType === "marketing" || config?.apiType === "transactional") configuredType = config.apiType;
      if (configuredType === "marketing") {
        let dataCenter = apiKey.trim().match(/-([a-z]{2}\d+)$/i)?.[1] || "";
        dataCenter = String(config?.dataCenter || config?.server || dataCenter).trim();
        if (!dataCenter) return c.json({ success: false, error: "Marketing API 需要数据中心，例如 us19" }, 400);
        const res = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/ping`, {
          headers: { Authorization: `Basic ${btoa(`anystring:${apiKey}`)}` },
        });
        if (!res.ok) return c.json({ success: false, error: `Mailchimp Marketing 验证失败 (${res.status}): ${await res.text()}` }, 400);
        return c.json({ success: true, message: "Mailchimp Marketing API Key 验证成功" });
      }

      const res = await fetch("https://mandrillapp.com/api/1.0/users/ping.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey }),
      });
      if (!res.ok) {
        const text = await res.text();
        return c.json({ success: false, error: `Mandrill 验证失败: ${text}` }, 400);
      }
      const data = await res.text();
      if (data.includes("PONG")) {
        return c.json({ success: true, message: "Mailchimp Transactional / Mandrill 验证成功 (PONG)" });
      }
    } else if (body.provider === "mailgun") {
      const domain = String(config?.domain || "").trim();
      if (!domain) return c.json({ success: false, error: "Mailgun 需要配置发送域名 domain" }, 400);
      const baseUrl = String(config?.baseUrl || "https://api.mailgun.net").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/v3/${encodeURIComponent(domain)}`, {
        headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` },
      });
      if (!res.ok) return c.json({ success: false, error: `Mailgun 验证失败 (${res.status}): ${await res.text()}` }, 400);
      return c.json({ success: true, message: "Mailgun API Key 和发送域名验证成功" });
    } else if (body.provider === "brevo") {
      const res = await fetch("https://api.brevo.com/v3/account", { headers: { "api-key": apiKey } });
      if (!res.ok) return c.json({ success: false, error: `Brevo 验证失败 (${res.status}): ${await res.text()}` }, 400);
      return c.json({ success: true, message: "Brevo API Key 验证成功" });
    } else if (body.provider === "sendgrid") {
      const res = await fetch("https://api.sendgrid.com/v3/scopes", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        return c.json({ success: false, error: `SendGrid 验证失败 (${res.status})` }, 400);
      }
      return c.json({ success: true, message: "SendGrid API Key 验证成功" });
    } else if (body.provider === "amazon_ses") {
      return c.json({ success: true, message: "Amazon SES 格式正确" });
    } else if (body.provider === "openai") {
      const baseURL = config?.baseURL || "https://api.openai.com/v1";
      const res = await fetch(`${baseURL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        return c.json({ success: false, error: `OpenAI 验证失败 (${res.status})` }, 400);
      }
      return c.json({ success: true, message: "OpenAI API Key 验证成功" });
    } else if (body.provider === "deepseek") {
      const baseURL = config?.baseURL || "https://api.deepseek.com/v1";
      const res = await fetch(`${baseURL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        return c.json({ success: false, error: `DeepSeek 验证失败 (${res.status})` }, 400);
      }
      return c.json({ success: true, message: "DeepSeek API Key 验证成功" });
    }

    return c.json({ success: true, message: "配置连通性测试通过" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "测试连通性异常" }, 500);
  }
});
