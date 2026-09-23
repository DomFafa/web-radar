/** @jsxImportSource react */
import React, { useEffect, useMemo, useState } from "react";
import readXlsxFile from "read-excel-file/browser";
import { providersApi } from "../lib/api";
import { useToast } from "../App";
import { domainKey, filterDomains, upsertDomain } from "../lib/sending-domains";

interface SendingDomainsPageProps {
  onNavigate: (page: string) => void;
}

function isTransactionalMailchimp(provider: any) {
  if (provider.provider !== "mailchimp") return false;
  try {
    const apiType = JSON.parse(provider.config || "{}").apiType;
    return apiType === "transactional" || (!apiType && !/us\d+$/i.test(provider.maskedApiKey || ""));
  } catch {
    return !/us\d+$/i.test(provider.maskedApiKey || "");
  }
}

type DomainCandidate = { domain: string; zoneId?: string };

const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if ((char === "," || char === "\t" || char === ";") && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const normalizeDomainCandidate = (value: unknown) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .split("/")[0]
  .split(":")[0]
  .replace(/^www\./, "")
  .replace(/^\.+|\.+$/g, "");

const rowsToDomains = (sourceRows: unknown[][]): DomainCandidate[] => {
  const rows = sourceRows
    .map((row) => row.map((cell) => String(cell ?? "").trim()))
    .filter((row) => row.some(Boolean));
  if (!rows.length) return [];
  const first = rows[0].map((cell) => cell.toLowerCase().replace(/[\s_-]/g, ""));
  const hasHeader = ["domain", "domainname", "域名", "发信域名"].includes(first[0]);
  const unique = new Map<string, DomainCandidate>();
  rows.slice(hasHeader ? 1 : 0).forEach((parts) => {
    const domain = normalizeDomainCandidate(parts[0]);
    if (/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)) {
      unique.set(domain, { domain, zoneId: parts[1] || undefined });
    }
  });
  return Array.from(unique.values());
};

export function SendingDomainsPage({ onNavigate }: SendingDomainsPageProps) {
  const { addToast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [addProviderId, setAddProviderId] = useState("");
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainLoadErrors, setDomainLoadErrors] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<any | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkingDomain, setCheckingDomain] = useState<string | null>(null);
  const [form, setForm] = useState({ domain: "", cloudflareApiToken: "", zoneId: "" });
  const [addMode, setAddMode] = useState<"batch" | "cloudflare">("batch");
  const [batchText, setBatchText] = useState("");
  const [importedDomains, setImportedDomains] = useState<DomainCandidate[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [cloudflareApiToken, setCloudflareApiToken] = useState("");
  const [cloudflareZones, setCloudflareZones] = useState<any[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [zoneSearch, setZoneSearch] = useState("");
  const [loadingZones, setLoadingZones] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0, succeeded: 0, failed: 0 });
  const [batchErrors, setBatchErrors] = useState<Array<{ domain: string; message: string }>>([]);
  const [deleteForm, setDeleteForm] = useState({
    removeCloudflare: true,
    removeMailchimp: true,
    cloudflareApiToken: "",
    confirmation: "",
  });

  const mailchimpProviders = useMemo(
    () => providers.filter(isTransactionalMailchimp),
    [providers],
  );

  const selectedProvider = mailchimpProviders.find((provider) => provider.id === selectedProviderId);
  const modalProvider = mailchimpProviders.find((provider) => provider.id === (editingDomain ? editingDomain.providerId : addProviderId));
  const visibleDomains = filterDomains(domains, selectedProviderId);
  const pastedDomains = useMemo(() => rowsToDomains(parseCsvRows(batchText)), [batchText]);
  const batchCandidates = importedDomains.length > 0 ? importedDomains : pastedDomains;
  const filteredZones = useMemo(() => {
    const query = zoneSearch.trim().toLowerCase();
    return query ? cloudflareZones.filter((zone) => zone.name.toLowerCase().includes(query)) : cloudflareZones;
  }, [cloudflareZones, zoneSearch]);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await providersApi.list();
        const items = response.data || [];
        setProviders(items);
      } catch (error: any) {
        addToast("error", error.message || "读取发信服务商失败");
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, []);

  useEffect(() => {
    if (!mailchimpProviders.length) {
      setDomains([]);
      return;
    }

    let active = true;
    setDomainLoading(true);
    setDomainLoadErrors([]);
    Promise.allSettled(mailchimpProviders.map(async (provider) => {
      const response = await providersApi.listDomains(provider.id);
      return (response.data || []).map((domain: any) => ({ ...domain, providerId: provider.id }));
    }))
      .then((results) => {
        if (!active) return;
        setDomains(results.flatMap((result) => result.status === "fulfilled" ? result.value : []));
        setDomainLoadErrors(results.flatMap((result, index) => result.status === "rejected"
          ? [`${mailchimpProviders[index].name}：${result.reason?.message || "读取域名失败"}`]
          : []));
      })
      .finally(() => {
        if (active) setDomainLoading(false);
      });

    return () => { active = false; };
  }, [mailchimpProviders]);

  const handleConfigure = async (event: React.FormEvent) => {
    event.preventDefault();
    const providerId = editingDomain?.providerId;
    if (!providerId) return;
    setSubmitting(true);
    try {
      const response = await providersApi.configureDomain(providerId, form);
      setDomains((current) => upsertDomain(current, { ...response.data, providerId }));
      setForm({ domain: "", cloudflareApiToken: "", zoneId: "" });
      setIsAddOpen(false);
      setEditingDomain(null);
      addToast(response.data.status === "verified" ? "success" : "warning", response.message);
    } catch (error: any) {
      addToast("error", error.message || "域名自动配置失败");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    const defaultProvider = mailchimpProviders.find((provider) => provider.isDefault) || selectedProvider || mailchimpProviders[0];
    setAddProviderId(defaultProvider?.id || "");
    setEditingDomain(null);
    setForm({ domain: "", cloudflareApiToken: "", zoneId: "" });
    setAddMode("batch");
    setBatchText("");
    setImportedDomains([]);
    setImportFileName("");
    setCloudflareApiToken("");
    setCloudflareZones([]);
    setSelectedZoneIds([]);
    setZoneSearch("");
    setBatchProgress({ completed: 0, total: 0, succeeded: 0, failed: 0 });
    setBatchErrors([]);
    setIsAddOpen(true);
  };

  const closeDomainModal = () => {
    if (submitting) return;
    setIsAddOpen(false);
    setEditingDomain(null);
    setCloudflareApiToken("");
  };

  const downloadDomainTemplate = () => {
    const csv = "\uFEFFdomain,zoneId\r\nexample.com,\r\nstore.example.net,";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "growthos-sending-domains-template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDomainFile = async (file?: File) => {
    if (!file) return;
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const rows = extension === "xlsx"
        ? await readXlsxFile(file) as unknown as unknown[][]
        : parseCsvRows(await file.text());
      const parsed = rowsToDomains(rows);
      if (!parsed.length) throw new Error("文件中没有识别到有效域名");
      setImportedDomains(parsed);
      setImportFileName(file.name);
      setBatchText("");
    } catch (error: any) {
      setImportedDomains([]);
      setImportFileName("");
      addToast("error", error.message || "域名表格解析失败");
    }
  };

  const handleLoadCloudflareZones = async () => {
    if (!addProviderId || !cloudflareApiToken.trim()) {
      addToast("error", "请先填写 Cloudflare API Token");
      return;
    }
    setLoadingZones(true);
    try {
      const response = await providersApi.listCloudflareZones(addProviderId, cloudflareApiToken.trim());
      setCloudflareZones(response.data || []);
      setSelectedZoneIds([]);
      addToast(response.data?.length ? "success" : "warning", response.message);
    } catch (error: any) {
      setCloudflareZones([]);
      addToast("error", error.message || "读取 Cloudflare 域名失败");
    } finally {
      setLoadingZones(false);
    }
  };

  const configureDomains = async (candidates: DomainCandidate[]) => {
    if (!addProviderId || !cloudflareApiToken.trim() || candidates.length === 0) return;
    const providerId = addProviderId;
    setSubmitting(true);
    setBatchErrors([]);
    setBatchProgress({ completed: 0, total: candidates.length, succeeded: 0, failed: 0 });
    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ domain: string; message: string }> = [];
    for (const candidate of candidates) {
      try {
        const response = await providersApi.configureDomain(providerId, {
          ...candidate,
          cloudflareApiToken: cloudflareApiToken.trim(),
        });
        setDomains((current) => upsertDomain(current, { ...response.data, providerId }));
        succeeded += 1;
      } catch (error: any) {
        failed += 1;
        errors.push({ domain: candidate.domain, message: error.message || "配置失败" });
      }
      setBatchProgress({ completed: succeeded + failed, total: candidates.length, succeeded, failed });
    }
    setBatchErrors(errors);
    setSubmitting(false);
    if (failed === 0) {
      addToast("success", `已提交 ${succeeded} 个发信域名，DNS 状态将继续检测`);
      setIsAddOpen(false);
      setCloudflareApiToken("");
    } else {
      addToast("warning", `成功 ${succeeded} 个，失败 ${failed} 个；请查看失败明细`);
    }
  };

  const handleBatchConfigure = async (event: React.FormEvent) => {
    event.preventDefault();
    const candidates = addMode === "cloudflare"
      ? cloudflareZones
        .filter((zone) => selectedZoneIds.includes(zone.id))
        .map((zone) => ({ domain: zone.name, zoneId: zone.id }))
      : batchCandidates;
    if (!candidates.length) {
      addToast("error", addMode === "cloudflare" ? "请至少勾选一个 Cloudflare 域名" : "请输入或上传至少一个有效域名");
      return;
    }
    await configureDomains(candidates);
  };

  const openEditModal = (domain: any) => {
    setIsAddOpen(false);
    setEditingDomain(domain);
    setForm({ domain: domain.domain, cloudflareApiToken: "", zoneId: domain.zoneId || "" });
  };

  const openDeleteModal = (domain: any) => {
    setDeletingDomain(domain);
    setDeleteForm({
      removeCloudflare: Boolean(domain.zoneId),
      removeMailchimp: true,
      cloudflareApiToken: "",
      confirmation: "",
    });
  };

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!deletingDomain?.providerId || deleteForm.confirmation !== deletingDomain.domain) return;
    setDeleting(true);
    try {
      const response = await providersApi.deleteDomain(deletingDomain.providerId, deletingDomain.domain, {
        removeCloudflare: deleteForm.removeCloudflare,
        removeMailchimp: deleteForm.removeMailchimp,
        cloudflareApiToken: deleteForm.cloudflareApiToken,
      });
      setDomains((current) => current.filter((item) => domainKey(item) !== domainKey(deletingDomain)));
      setDeletingDomain(null);
      const warnings = response.data?.warnings || [];
      addToast(warnings.length > 0 ? "warning" : "success", warnings.length > 0 ? warnings.join("；") : response.message);
    } catch (error: any) {
      addToast("error", error.message || "删除域名失败");
    } finally {
      setDeleting(false);
    }
  };

  const handleCheck = async (domain: any) => {
    setCheckingDomain(domainKey(domain));
    try {
      const response = await providersApi.checkDomain(domain.providerId, domain.domain);
      setDomains((current) => current.map((item) => domainKey(item) === domainKey(domain)
        ? { ...response.data, providerId: domain.providerId } : item));
      addToast(response.data.status === "verified" ? "success" : "warning", response.message);
    } catch (error: any) {
      addToast("error", error.message || "检查域名失败");
    } finally {
      setCheckingDomain((current) => current === domainKey(domain) ? null : current);
    }
  };

  return (
    <div className="sending-domains-page">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>🌐 发信域名</h2>
            <p>集中管理发信服务商的域名认证与 DNS 配置</p>
          </div>
          <button
            className="btn btn-primary"
            disabled={loading || domainLoading || !mailchimpProviders.length}
            onClick={openAddModal}
          >
            + 添加发信域名
          </button>
        </div>
      </div>

      <div className="page-body sending-domains-body">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : mailchimpProviders.length === 0 ? (
          <div className="card sending-domains-empty">
            <div className="empty-icon">🌐</div>
            <h3>请先配置 Mailchimp Transactional</h3>
            <p>发信域名认证依赖 Transactional / Mandrill API Key。完成服务商配置后即可在这里自动添加域名和 DNS 记录。</p>
            <button className="btn btn-primary" onClick={() => onNavigate("providers")}>前往服务商配置</button>
          </div>
        ) : (
          <>
            <section className="card sending-domain-provider-panel">
              <div className="sending-domain-provider-copy">
                <span className="sending-domain-provider-icon">📨</span>
                <div>
                  <h3>发信域名</h3>
                  <p>当前支持 Mailchimp Transactional / Mandrill，后续可在此扩展其他发信服务商。</p>
                </div>
              </div>
              <div className="sending-domain-provider-select">
                <label className="form-label" htmlFor="sending-domain-provider">发信通道</label>
                <select
                  id="sending-domain-provider"
                  className="form-input"
                  value={selectedProviderId}
                  onChange={(event) => setSelectedProviderId(event.target.value)}
                >
                  <option value="">全部发信通道</option>
                  {mailchimpProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}{provider.isDefault ? "（默认）" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="card provider-domain-section sending-domain-list-panel">
              <div className="provider-domain-section-header">
                <div>
                  <h3>已配置域名</h3>
                  <p>DNS 传播通常需要几分钟，个别情况可能最长 48 小时。</p>
                </div>
                <span className="provider-domain-count">{visibleDomains.length} 个域名</span>
              </div>

              {domainLoadErrors.length > 0 && (
                <div className="provider-domain-error" role="alert">部分通道读取失败：{domainLoadErrors.join("；")}</div>
              )}
              {domainLoading ? (
                <div className="provider-domain-loading"><div className="spinner" />正在读取域名状态...</div>
              ) : visibleDomains.length > 0 ? (
                <div className="provider-domain-list">
                  {visibleDomains.map((item) => (
                    <article className="provider-domain-item" key={domainKey(item)}>
                      <div className="provider-domain-identity">
                        <div className="provider-domain-name">{item.domain}</div>
                        <div className="provider-domain-zone">发信通道：{mailchimpProviders.find((provider) => provider.id === item.providerId)?.name}</div>
                        <div className="provider-domain-zone">Cloudflare Zone: {item.zoneName || item.zoneId || "-"}</div>
                      </div>
                      <div className="provider-domain-checks" aria-label="认证状态">
                        <span className={item.verified ? "is-valid" : "is-pending"}>所有权 {item.verified ? "已验证" : "待验证"}</span>
                        <span className={item.dkimValid ? "is-valid" : "is-pending"}>DKIM {item.dkimValid ? "有效" : "待生效"}</span>
                        <span className={item.dmarcValid === false ? "is-error" : item.status === "verified" ? "is-valid" : "is-pending"}>DMARC {item.dmarcValid === false ? "无效" : item.status === "verified" ? "有效" : "待检测"}</span>
                      </div>
                      <div className="provider-domain-actions">
                        <span className={`badge ${item.status === "verified" ? "badge-success" : "badge-warning"}`}>
                          {item.status === "verified" ? "可用于发信" : "等待 DNS 生效"}
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleCheck(item)} disabled={checkingDomain !== null}>
                          {checkingDomain === domainKey(item) ? "检测中..." : "重新检测"}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item)}>编辑</button>
                        <button className="btn btn-danger-outline btn-sm" onClick={() => openDeleteModal(item)}>删除</button>
                      </div>
                      {item.error && <div className="provider-domain-error">{item.error}</div>}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="provider-domain-empty">尚未配置发信域名，点击右上角开始添加。</div>
              )}
            </section>
          </>
        )}
      </div>

      {(isAddOpen || editingDomain) && modalProvider && (
        <div className="modal-overlay">
          <div className="modal provider-domain-modal" role="dialog" aria-modal="true" aria-labelledby="sending-domain-form-title">
            <div className="modal-header">
              <div>
                <div className="modal-title" id="sending-domain-form-title">{editingDomain ? "编辑发信域名" : "添加发信域名"}</div>
                <div className="provider-domain-subtitle">{modalProvider.name} · Transactional / Mandrill</div>
              </div>
              <button className="btn btn-ghost btn-icon" aria-label="关闭" onClick={closeDomainModal}>×</button>
            </div>
            <form onSubmit={editingDomain ? handleConfigure : handleBatchConfigure}>
              <div className="modal-body provider-domain-section provider-domain-add">
                {!editingDomain && (
                  <div className="form-group provider-domain-account-field">
                    <label className="form-label" htmlFor="domain-mailchimp-provider">Mailchimp 发信账号</label>
                    <select
                      id="domain-mailchimp-provider"
                      className="form-input form-select"
                      value={addProviderId}
                      onChange={(event) => {
                        setAddProviderId(event.target.value);
                        setCloudflareZones([]);
                        setSelectedZoneIds([]);
                      }}
                    >
                      {mailchimpProviders.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}{provider.isDefault ? "（默认）" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="provider-domain-token-note">不选择其他账号时，将使用默认 Mailchimp 账号。</div>
                  </div>
                )}
                <div className="provider-domain-section-header">
                  <div>
                    <h3>自动配置与认证</h3>
                    <p>系统将在 Mailchimp 添加域名，并通过 Cloudflare 配置 DKIM、所有权验证和 DMARC。Token 不会保存。</p>
                  </div>
                </div>

                {editingDomain ? (
                  <>
                    <div className="provider-domain-form-grid">
                      <div className="form-group">
                        <label className="form-label">发信域名 *</label>
                        <input className="form-input" required disabled value={form.domain} />
                        <div className="provider-domain-token-note">域名名称不可直接修改；更换域名请新增后删除旧域名。</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cloudflare Zone ID（选填）</label>
                        <input className="form-input" placeholder="留空将自动识别" value={form.zoneId} onChange={(event) => setForm((current) => ({ ...current, zoneId: event.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cloudflare API Token *</label>
                      <input className="form-input" type="password" required autoComplete="new-password" placeholder="需要 Zone Read 与 DNS Edit 权限" value={form.cloudflareApiToken} onChange={(event) => setForm((current) => ({ ...current, cloudflareApiToken: event.target.value }))} />
                    </div>
                    <div className="provider-domain-record-note">将重新识别 Zone、补齐 DNS 记录并刷新 Mailchimp 认证状态。</div>
                  </>
                ) : (
                  <>
                    <div className="provider-domain-mode-tabs" role="tablist" aria-label="添加域名方式">
                      <button type="button" className={addMode === "batch" ? "is-active" : ""} onClick={() => setAddMode("batch")}>
                        <strong>批量导入</strong><span>多行粘贴或上传表格</span>
                      </button>
                      <button type="button" className={addMode === "cloudflare" ? "is-active" : ""} onClick={() => setAddMode("cloudflare")}>
                        <strong>从 Cloudflare 选择</strong><span>读取账户 Zone 后勾选</span>
                      </button>
                    </div>

                    <div className="form-group provider-domain-shared-token">
                      <label className="form-label">Cloudflare API Token *</label>
                      <input className="form-input" type="password" required autoComplete="new-password" placeholder="需要 Zone Read 与 DNS Edit 权限" value={cloudflareApiToken} onChange={(event) => setCloudflareApiToken(event.target.value)} />
                      <div className="provider-domain-token-note">Token 仅保存在当前浏览器内存中，用于本次读取和 DNS 配置。</div>
                    </div>

                    {addMode === "batch" ? (
                      <div className="provider-domain-batch-layout">
                        <div className="form-group">
                          <div className="provider-domain-field-heading">
                            <label className="form-label" htmlFor="batch-domain-input">发信域名（每行一个）*</label>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={downloadDomainTemplate}>下载导入模板</button>
                          </div>
                          <textarea
                            id="batch-domain-input"
                            className="form-input provider-domain-textarea"
                            placeholder={"example.com\nstore.example.net"}
                            value={batchText}
                            onChange={(event) => {
                              setBatchText(event.target.value);
                              setImportedDomains([]);
                              setImportFileName("");
                            }}
                          />
                          <div className="provider-domain-token-note">支持域名、网址；系统会规范化、校验并自动去重。</div>
                        </div>
                        <label className={`provider-domain-upload ${importFileName ? "has-file" : ""}`}>
                          <input type="file" accept=".csv,.xlsx" onChange={(event) => handleDomainFile(event.target.files?.[0])} />
                          <span className="provider-domain-upload-icon">⇧</span>
                          <strong>{importFileName || "上传 CSV / Excel"}</strong>
                          <small>{importFileName ? `已识别 ${importedDomains.length} 个有效域名` : "首列为 domain，第二列可填写 zoneId"}</small>
                        </label>
                        <div className="provider-domain-detected">
                          已识别 <strong>{batchCandidates.length}</strong> 个有效域名
                        </div>
                      </div>
                    ) : (
                      <div className="provider-domain-zone-picker">
                        <div className="provider-domain-zone-toolbar">
                          <div className="form-group">
                            <label className="form-label" htmlFor="zone-search">筛选域名</label>
                            <input id="zone-search" className="form-input" placeholder="输入域名关键词" value={zoneSearch} onChange={(event) => setZoneSearch(event.target.value)} />
                          </div>
                          <button type="button" className="btn btn-secondary" onClick={handleLoadCloudflareZones} disabled={loadingZones || !cloudflareApiToken.trim()}>
                            {loadingZones ? "正在读取..." : cloudflareZones.length ? "重新读取" : "读取域名列表"}
                          </button>
                        </div>
                        {cloudflareZones.length > 0 ? (
                          <>
                            <div className="provider-domain-zone-summary">
                              <span>已选择 {selectedZoneIds.length} / {cloudflareZones.length} 个</span>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                  const visibleIds = filteredZones.map((zone) => zone.id);
                                  const allVisibleSelected = visibleIds.every((id) => selectedZoneIds.includes(id));
                                  setSelectedZoneIds((current) => allVisibleSelected
                                    ? current.filter((id) => !visibleIds.includes(id))
                                    : Array.from(new Set([...current, ...visibleIds])));
                                }}
                              >
                                {filteredZones.every((zone) => selectedZoneIds.includes(zone.id)) ? "取消当前全部" : "选择当前全部"}
                              </button>
                            </div>
                            <div className="provider-domain-zone-list">
                              {filteredZones.map((zone) => (
                                <label className="provider-domain-zone-option" key={zone.id}>
                                  <input
                                    type="checkbox"
                                    checked={selectedZoneIds.includes(zone.id)}
                                    onChange={(event) => setSelectedZoneIds((current) => event.target.checked
                                      ? [...current, zone.id]
                                      : current.filter((id) => id !== zone.id))}
                                  />
                                  <span><strong>{zone.name}</strong><small>Zone ID: {zone.id}</small></span>
                                </label>
                              ))}
                              {filteredZones.length === 0 && <div className="provider-domain-zone-empty">没有匹配的域名</div>}
                            </div>
                          </>
                        ) : (
                          <div className="provider-domain-zone-empty">填写 Token 后读取该账户下可访问的有效域名。</div>
                        )}
                      </div>
                    )}

                    {batchProgress.total > 0 && (
                      <div className="provider-domain-progress" aria-live="polite">
                        <div><strong>配置进度 {batchProgress.completed} / {batchProgress.total}</strong><span>成功 {batchProgress.succeeded}，失败 {batchProgress.failed}</span></div>
                        <progress value={batchProgress.completed} max={batchProgress.total} />
                      </div>
                    )}
                    {batchErrors.length > 0 && (
                      <div className="provider-domain-batch-errors">
                        {batchErrors.map((item) => <div key={item.domain}><strong>{item.domain}</strong><span>{item.message}</span></div>)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDomainModal} disabled={submitting}>取消</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || (!editingDomain && (
                    !cloudflareApiToken.trim()
                    || (addMode === "batch" ? batchCandidates.length === 0 : selectedZoneIds.length === 0)
                  ))}
                >
                  {submitting
                    ? `正在配置 ${batchProgress.completed}/${batchProgress.total}...`
                    : editingDomain
                      ? "保存并重新检测"
                      : addMode === "cloudflare"
                        ? `配置选中的 ${selectedZoneIds.length} 个域名`
                        : `批量配置 ${batchCandidates.length} 个域名`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingDomain && (
        <div className="modal-overlay">
          <div className="modal provider-domain-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-sending-domain-title">
            <div className="modal-header">
              <div>
                <div className="modal-title" id="delete-sending-domain-title">删除发信域名</div>
                <div className="provider-domain-subtitle">{deletingDomain.domain}</div>
              </div>
              <button className="btn btn-ghost btn-icon" aria-label="关闭" onClick={() => setDeletingDomain(null)}>×</button>
            </div>
            <form onSubmit={handleDelete}>
              <div className="modal-body provider-domain-delete-body">
                <div className="provider-domain-delete-warning">
                  删除后 GrowthOS 将不再把该域名作为可用发信域名。正在使用该域名的发送任务可能失败。
                </div>
                <label className="provider-domain-delete-option">
                  <input
                    type="checkbox"
                    checked={deleteForm.removeCloudflare}
                    onChange={(event) => setDeleteForm((current) => ({ ...current, removeCloudflare: event.target.checked }))}
                  />
                  <span><strong>同步删除 Cloudflare DNS</strong><small>仅删除带有 GrowthOS 管理标记的 DKIM、验证和 DMARC 记录，不影响其他 DNS。</small></span>
                </label>
                {deleteForm.removeCloudflare && (
                  <div className="form-group provider-domain-delete-token">
                    <label className="form-label">Cloudflare API Token *</label>
                    <input
                      className="form-input"
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="需要 Zone Read 与 DNS Edit 权限"
                      value={deleteForm.cloudflareApiToken}
                      onChange={(event) => setDeleteForm((current) => ({ ...current, cloudflareApiToken: event.target.value }))}
                    />
                    <div className="provider-domain-token-note">Token 仅用于本次删除，不会保存。</div>
                  </div>
                )}
                <label className="provider-domain-delete-option">
                  <input
                    type="checkbox"
                    checked={deleteForm.removeMailchimp}
                    onChange={(event) => setDeleteForm((current) => ({ ...current, removeMailchimp: event.target.checked }))}
                  />
                  <span><strong>同步移除 Mailchimp Transactional 域名</strong><small>{deletingDomain.verified ? "该域名已经验证，Mailchimp 要求登录后台进行最终删除确认。" : "未验证域名可通过 Transactional API 自动删除。"}</small></span>
                </label>
                <div className="form-group provider-domain-delete-confirmation">
                  <label className="form-label">输入 <strong>{deletingDomain.domain}</strong> 确认删除</label>
                  <input
                    className="form-input"
                    value={deleteForm.confirmation}
                    onChange={(event) => setDeleteForm((current) => ({ ...current, confirmation: event.target.value.trim().toLowerCase() }))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeletingDomain(null)}>取消</button>
                <button type="submit" className="btn btn-danger" disabled={deleting || deleteForm.confirmation !== deletingDomain.domain}>
                  {deleting ? "正在删除..." : "确认删除"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
