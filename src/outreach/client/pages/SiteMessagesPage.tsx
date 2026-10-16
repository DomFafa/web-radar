/** @jsxImportSource react */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SiteOverviewPanel } from "../../../client/ChannelOverview";
import { Icon } from "../../../client/components";
import { siteMessagesApi } from "../lib/api";
import { useAuth, useToast } from "../App";
import { MAX_SITE_TARGETS, normalizeSiteTargets } from "../../shared/site-targets";
import "../styles/site-workbench.css";

const EMPTY_FORM = {
  name: "",
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  company: "",
  address: "",
  country: "",
  city: "",
  subject: "",
  message: "",
  targets: "",
  authorized: false,
  replyTracking: true,
};

const STEPS = ["目标网站", "联系资料", "留言", "预览确认"];
type SiteForm = typeof EMPTY_FORM;

const statusMeta: Record<string, { label: string; badge: string }> = {
  draft: { label: "草稿 · 尚未发送", badge: "badge-default" },
  queued: { label: "排队中", badge: "badge-warning" },
  running: { label: "执行中", badge: "badge-warning" },
  paused: { label: "已暂停", badge: "badge-default" },
  completed: { label: "已完成", badge: "badge-success" },
  failed: { label: "失败", badge: "badge-danger" },
  abnormal: { label: "异常", badge: "badge-warning" },
  no_contact: { label: "无联系页", badge: "badge-warning" },
  inaccessible: { label: "无法访问", badge: "badge-danger" },
  discovering: { label: "查找联系页", badge: "badge-warning" },
  submitting: { label: "正在提交", badge: "badge-warning" },
  submitted: { label: "已提交", badge: "badge-success" },
  skipped: { label: "已跳过", badge: "badge-default" },
};

const formatDate = (value?: string | number) => value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-";
const parseProgressLogs = (value?: string) => {
  try { return Array.isArray(value) ? value : JSON.parse(value || "[]"); } catch { return []; }
};
const formatSuccessRate = (submitted: number, total: number, abnormal: number) => {
  const effective = Math.max(0, Number(total || 0) - Number(abnormal || 0));
  if (effective <= 0) return "-";
  const rate = (Number(submitted || 0) / effective) * 100;
  return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
};

export function SiteMessagesPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const canWrite = !!user && ["owner", "admin", "member"].includes(user.role);
  const canDelete = !!user && ["owner", "admin"].includes(user.role);
  const draftKey = user?.actorId ? `site-message-draft:v1:${user.actorId}:${user.id}` : null;
  const scope = `${user?.actorId}:${user?.id}`;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const formScopeRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const startingRef = useRef(false);
  const [starting, setStarting] = useState(false);
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedTargetId, setExpandedTargetId] = useState<string | null>(null);

  const loadJobs = async (quiet = false) => {
    const requestScope = scope;
    if (!quiet) setLoading(true);
    try {
      const response = await siteMessagesApi.list();
      if (scopeRef.current === requestScope) setJobs(response.data || []);
    } catch (error: any) {
      if (!quiet && scopeRef.current === requestScope) addToast("error", error.message || "网站留言任务加载失败");
    } finally {
      if (!quiet && scopeRef.current === requestScope) setLoading(false);
    }
  };

  useEffect(() => {
    formScopeRef.current = null;
    setShowCreate(false);
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setDetail(null);
    setJobs([]);
    setStep(0);
    setFormError("");
    try { setHasDraft(!!draftKey && !!localStorage.getItem(draftKey)); } catch { setHasDraft(false); }
    loadJobs();
    const linkedJobId = new URL(window.location.href).searchParams.get("siteJobId");
    if (linkedJobId) openDetail(linkedJobId);
  }, [scope]);
  useEffect(() => {
    if (!showCreate || editingJob || !canWrite || !draftKey || formScopeRef.current !== scope) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ form, step }));
      setHasDraft(true);
      setStorageFailed(false);
    } catch { setStorageFailed(true); }
  }, [form, step, showCreate, editingJob, draftKey, canWrite, scope]);
  useEffect(() => {
    if (!jobs.some((job) => ["queued", "running"].includes(job.status))) return;
    const timer = window.setInterval(() => loadJobs(true), 5000);
    return () => window.clearInterval(timer);
  }, [jobs]);
  useEffect(() => {
    if (!detail?.id || !["queued", "running"].includes(detail.status)) return;
    let active = true;
    const timer = window.setInterval(async () => {
      try {
        const response = await siteMessagesApi.get(detail.id);
        if (active && scopeRef.current === scope) setDetail(response.data);
      } catch {
        // Keep the current details visible if one polling request fails.
      }
    }, 2500);
    return () => { active = false; window.clearInterval(timer); };
  }, [detail?.id, detail?.status, scope]);

  const overviewRevision = JSON.stringify(jobs.map(job => [job.id, job.updatedAt, job.status, job.totalTargets, job.totalSubmitted, job.totalFailed, job.totalSkipped, job.totalNoContact, job.totalInaccessible]));

  const targets = useMemo(() => normalizeSiteTargets(form.targets), [form.targets]);
  const targetCount = targets.normalized.size;
  const stepErrors = [
    !targetCount ? "请添加至少一个有效的公网网站地址。" : targetCount > MAX_SITE_TARGETS ? `单个任务最多 ${MAX_SITE_TARGETS} 个不同域名，请减少 ${targetCount - MAX_SITE_TARGETS} 个。` : targets.invalid.length ? "请修改或移除无效网址后继续。" : "",
    !form.senderName.trim() ? "请填写联系人姓名。" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail.trim()) ? "请填写有效的联系邮箱。" : "",
    !form.name.trim() ? "请填写任务名称，便于之后查找。" : form.message.trim().length < 10 || form.message.trim().length > 5000 ? "留言内容应为 10–5000 个字符。" : "",
    !form.authorized ? "请确认目标网站允许你提交业务咨询。" : "",
  ];
  const updateForm = <K extends keyof SiteForm>(key: K, value: SiteForm[K]) => {
    setForm(current => ({ ...current, authorized: key === "authorized" ? current.authorized : false, [key]: value }));
    setFormError("");
  };
  const closeForm = () => {
    if (saving) return;
    setShowCreate(false);
    setEditingJob(null);
    setFormError("");
  };
  const openCreate = (restore = false) => {
    if (!canWrite) return;
    formScopeRef.current = scope;
    setEditingJob(null);
    setDetail(null);
    setForm(EMPTY_FORM);
    setStep(0);
    setFormError("");
    if (restore && draftKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
        if (saved?.form) {
          const restored = { ...EMPTY_FORM };
          for (const key of Object.keys(EMPTY_FORM) as (keyof SiteForm)[]) {
            if (typeof saved.form[key] === typeof EMPTY_FORM[key]) (restored as any)[key] = saved.form[key];
          }
          // Consent belongs to the current preview and must be checked again.
          restored.authorized = false;
          setForm(restored);
          setStep(Number.isInteger(saved.step) ? Math.max(0, Math.min(3, saved.step)) : 0);
        }
      } catch { addToast("warning", "本地草稿无法读取，请重新填写。"); }
    }
    setShowCreate(true);
  };
  const nextStep = () => {
    if (stepErrors[step]) { setFormError(stepErrors[step]); return; }
    setFormError("");
    setStep(current => Math.min(3, current + 1));
  };

  const openEdit = async (id: string) => {
    if (!canWrite) return;
    setSaving(true);
    try {
      const response = await siteMessagesApi.get(id);
      if (scopeRef.current !== scope) return;
      const job = response.data;
      setDetail(null);
      setStep(0);
      setFormError("");
      setEditingJob(job);
      setForm({
        name: job.name || "",
        senderName: job.senderName || "",
        senderEmail: job.senderEmail || "",
        replyTracking: !!job.replyTracking,
        senderPhone: job.senderPhone || "",
        company: job.company || "",
        address: job.address || "",
        country: job.country || "",
        city: job.city || "",
        subject: job.subject || "",
        message: job.message || "",
        targets: (job.targets || []).map((target: any) => target.websiteUrl).join("\n"),
        authorized: false,
      });
      setShowCreate(true);
    } catch (error: any) {
      addToast("error", error.message || "任务资料加载失败");
    } finally {
      setSaving(false);
    }
  };

  const saveJob = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite || savingRef.current) return;
    if (step < 3) { nextStep(); return; }
    const invalidStep = stepErrors.findIndex(Boolean);
    if (invalidStep >= 0) { setStep(invalidStep); setFormError(stepErrors[invalidStep]); return; }
    savingRef.current = true;
    setSaving(true);
    try {
      const payload = { ...form, targets: Array.from(targets.normalized.values(), target => target.url) };
      const response = editingJob ? await siteMessagesApi.update(editingJob.id, payload) : await siteMessagesApi.create(payload);
      if (scopeRef.current !== scope) return;
      if (!editingJob && draftKey) {
        try { localStorage.removeItem(draftKey); } catch { /* The server draft is already saved. */ }
        setHasDraft(false);
      }
      setShowCreate(false);
      setEditingJob(null);
      setForm(EMPTY_FORM);
      addToast("success", editingJob ? "修改已保存，尚未启动新的提交" : "草稿已保存，尚未向网站发送留言");
      await loadJobs();
      await openDetail(response.data.id);
    } catch (error: any) {
      setFormError(error.message || "保存失败，请稍后重试。");
    } finally { savingRef.current = false; setSaving(false); }
  };

  const startJob = async (job: any) => {
    if (!canWrite || startingRef.current || ["queued", "running"].includes(job.status)) return;
    const eligible = (job.targets || []).filter((target: any) => !["submitted", "submitting", "discovering"].includes(target.status) && target.resultCode !== "submission_uncertain");
    if (!eligible.length) { addToast("warning", "没有可提交的目标；已提交或结果待核实的网站不会自动重发。"); return; }
    if (!window.confirm(`确认向 ${eligible.length} 个网站提交当前预览中的联系资料和留言？\n已提交或结果待核实的网站不会自动重发；遇到网站保护会跳过。`)) return;
    startingRef.current = true;
    setStarting(true);
    try {
      const response = await siteMessagesApi.start(job.id);
      if (scopeRef.current !== scope) return;
      setJobs(current => current.map(item => item.id === job.id ? { ...item, status: "queued" } : item));
      setDetail((current: any) => current?.id === job.id ? { ...current, status: "queued" } : current);
      addToast("success", `${response.data.queued} 个网站已进入队列，可在此查看实际提交结果`);
      loadJobs(true);
    } catch (error: any) {
      addToast("error", `${error.message || "启动结果未确认"}。请先查看最新任务状态。`);
      await openDetail(job.id);
      loadJobs(true);
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  const pauseJob = async (id: string) => {
    if (!canWrite) return;
    try {
      await siteMessagesApi.pause(id);
      setJobs((current) => current.map((job) => job.id === id ? { ...job, status: "paused" } : job));
      setDetail((current: any) => current?.id === id ? { ...current, status: "paused" } : current);
      addToast("success", "任务已暂停；正在处理的网站会在安全节点停止");
      loadJobs(true);
    } catch (error: any) {
      addToast("error", error.message || "任务暂停失败");
    }
  };

  const resetJob = async (id: string) => {
    if (!canWrite || !window.confirm("重置会清除所有网站的执行日志和结果记录。此前已成功提交的网站也会回到待开始状态，再次执行可能重复留言。确定重置全部状态？")) return;
    try {
      await siteMessagesApi.reset(id);
      setJobs((current) => current.map((job) => job.id === id ? { ...job, status: "draft", totalSubmitted: 0, totalSkipped: 0, totalFailed: 0, totalNoContact: 0, totalInaccessible: 0, totalAbnormal: 0 } : job));
      if (detail?.id === id) {
        openDetail(id);
      }
      addToast("success", "任务已重置为初始状态");
      loadJobs(true);
    } catch (error: any) {
      addToast("error", error.message || "任务重置失败");
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail({ id, targets: [] });
    try {
      const response = await siteMessagesApi.get(id);
      if (scopeRef.current !== scope) return;
      setDetail(response.data);
      const url = new URL(window.location.href);
      url.searchParams.set("siteJobId", id);
      window.history.replaceState({}, "", url);
    } catch (error: any) {
      addToast("error", error.message || "执行详情加载失败");
      setDetail(null);
    } finally {
      if (scopeRef.current === scope) setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("siteJobId");
    window.history.replaceState({}, "", url);
  };

  const deleteJob = async (id: string) => {
    if (!canDelete || !window.confirm("确定删除此网站留言任务及全部执行记录？")) return;
    try {
      await siteMessagesApi.delete(id);
      setJobs((current) => current.filter((job) => job.id !== id));
      addToast("success", "任务已删除");
    } catch (error: any) {
      addToast("error", error.message || "删除失败");
    }
  };

  const exportJob = async (id: string, name: string) => {
    try {
      await siteMessagesApi.exportResults(id, name);
      addToast("success", `已成功导出「${name}」的运行结果`);
    } catch (error: any) {
      addToast("error", error.message || "运行结果导出失败");
    }
  };


  const formField = (key: keyof SiteForm, label: string, options: { required?: boolean; type?: string; placeholder?: string } = {}) => (
    <div className="form-group" key={key}>
      <label className="form-label" htmlFor={`site-${key}`}>{label}{options.required ? " *" : ""}</label>
      <input id={`site-${key}`} className="form-input" type={options.type || "text"} value={String(form[key])} required={options.required} placeholder={options.placeholder} onChange={event => updateForm(key, event.target.value)} />
    </div>
  );
  const preview = (value: any, urls: string[]) => <div className="site-workbench-preview">
    <div className="site-workbench-preview-contact"><h4>联系资料</h4><p>{value.senderName} · {value.senderEmail}</p><p>{[value.company, value.senderPhone, value.country, value.city, value.address].filter(Boolean).join(" · ") || "未填写其他联系资料"}</p><p className="muted">{value.replyTracking ? "自动追踪回复已选择；收信配置启用时使用独立收信地址，否则使用上方邮箱。" : "使用上方邮箱接收回复。"}</p></div>
    <div><h4>{value.subject || "未填写主题"}</h4><p className="site-workbench-message">{value.message}</p></div>
    <details className="site-workbench-target-preview"><summary>查看 {urls.length} 个目标网站</summary><ul>{urls.map(url => <li key={url}>{url}</li>)}</ul></details>
  </div>;

  return (
    <>
      <div className="page-header site-message-heading">
        <div className="page-header-actions">
          <div><h1>网站留言</h1><p>通过目标网站的联系表单提交业务咨询。先保存草稿，确认后才会提交。</p></div>
          {canWrite && <button className="btn btn-primary" onClick={() => openCreate(hasDraft)}><Icon name="plus" size={16}/>{hasDraft ? "继续填写草稿" : "新建任务"}</button>}
        </div>
      </div>
      <div className="page-content site-message-page site-workbench">
        {!loading && jobs.length === 0 && <section className="site-workbench-welcome">
          <div><span className="site-workbench-eyebrow">从一份留言开始</span><h2>准备网站和联系资料，逐步完成咨询</h2><p>添加目标网站，填写联系资料，再预览留言。保存任务后仍需确认提交。</p></div>
          <ol>{STEPS.map(label => <li key={label}>{label}</li>)}</ol>
          {canWrite ? <button className="btn btn-primary" onClick={() => openCreate(hasDraft)}>{hasDraft ? "继续填写草稿" : "新建第一个任务"}</button> : <p>当前角色可查看任务和结果，请联系工作区管理员创建任务。</p>}
        </section>}
        {canWrite && hasDraft && jobs.length > 0 && <div className="site-workbench-draft-notice"><div><strong>有一份尚未保存的草稿</strong><p>填写进度保留在当前浏览器，尚未向任何网站发送。</p></div><button className="btn btn-secondary" onClick={() => openCreate(true)}>继续填写</button></div>}
        <div className="site-message-list">
          <div className="section-heading"><div><h3>任务与结果</h3><p>草稿可继续准备；执行中的任务和结果会自动更新。</p></div><button className="btn btn-secondary btn-sm" onClick={() => loadJobs()}>刷新状态</button></div>
          {loading ? <div className="site-message-empty"><div className="spinner"></div><p>正在加载任务...</p></div> : jobs.length === 0 ? <p className="site-workbench-no-tasks">尚无任务，保存的草稿和执行结果将显示在这里。</p> : (
            <div className="table-container"><table><thead><tr><th>任务</th><th>状态</th><th>目标</th><th>已提交</th><th>失败</th><th>无联系页面</th><th>无法访问</th><th>成功率</th><th>创建时间</th><th>操作</th></tr></thead><tbody>
              {jobs.map(job => {
                const meta = statusMeta[job.status] || statusMeta.draft;
                const active = ["queued", "running"].includes(job.status);
                const abnormalTotal = Number(job.totalNoContact || 0) + Number(job.totalInaccessible || 0);
                return <tr key={job.id}>
                  <td><strong>{job.name}</strong><small className="table-secondary">{job.subject || "一般业务咨询"}</small></td><td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                  <td>{job.totalTargets}</td><td>{job.totalSubmitted}</td><td>{Number(job.totalFailed || 0) + Number(job.totalSkipped || 0)}</td><td>{Number(job.totalNoContact || 0)}</td><td>{Number(job.totalInaccessible || 0)}</td><td>{formatSuccessRate(job.totalSubmitted, job.totalTargets, abnormalTotal)}</td><td>{formatDate(job.createdAt)}</td>
                  <td><div className="table-actions site-workbench-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openDetail(job.id)}>{job.status === "draft" && canWrite ? "预览并确认" : "查看详情"}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => exportJob(job.id, job.name)}>导出结果</button>
                    <a className="btn btn-ghost btn-sm" href={'/?view=crm&crmTab=replies&inboxSource=site&inboxBusiness=' + encodeURIComponent(job.id)}>客户回复</a>
                    {canWrite && !active && <button className="btn btn-ghost btn-sm" disabled={saving} onClick={() => openEdit(job.id)}>编辑任务</button>}
                    {canWrite && active && <button className="btn btn-ghost btn-sm" onClick={() => pauseJob(job.id)}>暂停任务</button>}
                    {canDelete && !active && <button className="btn btn-ghost btn-sm" onClick={() => deleteJob(job.id)}>删除任务</button>}
                  </div></td>
                </tr>;
              })}
            </tbody></table></div>
          )}
        </div>
        <details className="site-workbench-statistics"><summary>查看执行统计</summary><SiteOverviewPanel revision={overviewRevision}/></details>
        <div className="site-message-notice"><div className="site-message-notice-icon"><Icon name="lock" size={18}/></div><div><strong>提交规则</strong><p>同一任务内每个域名仅保留一个目标。检测到验证码、人机验证、文件上传或无法识别的必填字段时自动跳过；已提交或结果待核实的网站不会自动重发。</p></div></div>
      </div>

      {showCreate && canWrite && <div className="modal-overlay"><div role="dialog" aria-modal="true" aria-labelledby="site-form-title" className="modal site-workbench-form-modal">
        <div className="modal-header"><div><h3 id="site-form-title" className="modal-title">{editingJob ? "编辑网站留言" : "准备网站留言"}</h3><p className="modal-subtitle">{editingJob ? "修改只影响后续提交，历史执行记录保持不变。" : "先保存草稿，再在任务详情中确认提交。"}</p></div><button type="button" className="btn btn-ghost" onClick={closeForm} disabled={saving} aria-label="关闭表单">关闭</button></div>
        <ol className="site-workbench-steps" aria-label="准备进度">{STEPS.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={step > index ? "complete" : ""}><span>{index + 1}</span>{label}</li>)}</ol>
        <form onSubmit={saveJob} noValidate>
          <div className="modal-body site-workbench-form-body">
            {step === 0 && <section><h4>要向哪些网站留言？</h4><p className="muted">每行一个网址，也可用逗号分隔。同一域名只保留第一条，最多 {MAX_SITE_TARGETS} 个域名。</p>
              {editingJob && editingJob.status !== "draft" && <p className="site-workbench-inline-notice">任务已有执行记录，目标网站已锁定；如需更换目标，请新建任务。</p>}
              <label className="form-label" htmlFor="site-targets">目标网站 *</label><textarea id="site-targets" className="form-textarea" rows={7} disabled={!!editingJob && editingJob.status !== "draft"} value={form.targets} onChange={event => updateForm("targets", event.target.value)} placeholder={"https://example.com/contact\ncompany.example"}/>
              <div className="site-workbench-target-counts" aria-live="polite"><span>有效域名 <strong>{targetCount}</strong> / {MAX_SITE_TARGETS}</span><span>重复 <strong>{targets.duplicates.length}</strong></span><span>无效 <strong>{targets.invalid.length}</strong></span></div>
              {targets.duplicates.length > 0 && <details><summary>重复地址会自动合并</summary><ul className="site-workbench-validation-list">{targets.duplicates.map((value, index) => <li key={index}>{value}</li>)}</ul></details>}
              {targets.invalid.length > 0 && <div className="site-workbench-invalid"><p>以下地址无效。请使用公开的 HTTP/HTTPS 网站，不支持本地地址或带登录信息的网址。</p><ul className="site-workbench-validation-list">{targets.invalid.map((value, index) => <li key={index}>{value}</li>)}</ul><button type="button" className="btn btn-secondary btn-sm" disabled={!targetCount || (!!editingJob && editingJob.status !== "draft")} onClick={() => updateForm("targets", Array.from(targets.normalized.values(), target => target.url).join("\n"))}>移除无效和重复地址</button></div>}
            </section>}
            {step === 1 && <section><h4>对方如何联系你？</h4><p className="muted">姓名和邮箱必填。补充真实资料可帮助填写网站要求的联系字段。</p><div className="form-grid">
              {formField("senderName", "姓名", { required: true })}{formField("senderEmail", "邮箱", { required: true, type: "email" })}{formField("senderPhone", "电话")}{formField("company", "公司")}{formField("country", "国家 / 地区")}{formField("city", "城市")}{formField("address", "详细地址")}
            </div><label className="site-message-consent"><input type="checkbox" checked={form.replyTracking} onChange={event => updateForm("replyTracking", event.target.checked)}/><span>自动追踪回复：收信配置启用后，为每个目标填写独立收信地址，并转发到配置的工作邮箱；未启用时仍使用上方邮箱。</span></label></section>}
            {step === 2 && <section><h4>准备要提交的留言</h4><p className="muted">同一任务中的网站使用相同内容。请写清楚你的公司、咨询目的和希望对方回复的问题。</p>
              {formField("name", "任务名称", { required: true, placeholder: "例如：10 月合作伙伴咨询" })}{formField("subject", "主题（选填）", { placeholder: "例如：产品合作咨询" })}
              <label className="form-label" htmlFor="site-message">留言内容 *</label><textarea id="site-message" className="form-textarea" rows={8} maxLength={5000} value={form.message} onChange={event => updateForm("message", event.target.value)} placeholder="介绍你和公司，说明与对方业务相关的合作或产品咨询，并留下明确的回复方式。"/><div className="form-counter">{form.message.trim().length} / 5000，至少 10 个字符</div>
            </section>}
            {step === 3 && <section><h4>{form.name}</h4><p className="site-workbench-inline-notice">本次仅保存{editingJob ? "修改" : "草稿"}，不会自动发送。请核对联系资料、留言和目标网站。</p>{preview(form, Array.from(targets.normalized.values(), target => target.url))}<label className="site-message-consent"><input type="checkbox" checked={form.authorized} onChange={event => updateForm("authorized", event.target.checked)}/><span>我确认这些网站允许提交业务咨询，并将遵守网站条款、隐私政策和适用法律。</span></label></section>}
            {formError && <p className="site-workbench-error" role="alert">{formError}</p>}
          </div>
          <div className="modal-footer site-workbench-form-footer"><p>{!editingJob && (storageFailed || !draftKey ? "暂时无法保存填写进度，请保存任务后再离开。" : "填写进度保留在此浏览器，尚未发送。")}</p><div><button type="button" className="btn btn-secondary" disabled={saving} onClick={step > 0 ? () => { setStep(step - 1); setFormError(""); } : closeForm}>{step > 0 ? "上一步" : "稍后继续"}</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "正在保存..." : step < 3 ? `下一步：${STEPS[step + 1]}` : editingJob ? "保存修改" : "保存草稿并查看"}</button></div></div>
        </form>
      </div></div>}

      {detail && <div className="modal-overlay"><div role="dialog" aria-modal="true" aria-labelledby="site-detail-title" className="modal site-message-detail-modal site-workbench-detail">
        <div className="modal-header"><div><h3 id="site-detail-title" className="modal-title">{detail.name || "任务详情"}</h3><p className="modal-subtitle">查看准备内容、实际执行进度和网站反馈。</p></div><button className="btn btn-ghost" onClick={closeDetail} aria-label="关闭任务详情">关闭</button></div>
        <div className="modal-body">{detailLoading ? <div className="site-message-empty"><div className="spinner"></div><p>正在加载任务...</p></div> : <>
          <div className="site-workbench-detail-status"><div><span className={`badge ${(statusMeta[detail.status] || statusMeta.draft).badge}`}>{(statusMeta[detail.status] || statusMeta.draft).label}</span><p>{detail.status === "draft" ? "尚未发送。检查下方资料和留言后，点击确认提交才会开始。" : "已提交或结果待核实的网站不会自动重发。提交结果以各网站实际反馈为准。"}</p></div><div className="site-workbench-actions">
            {canWrite && ["queued", "running"].includes(detail.status) && <button className="btn btn-secondary" onClick={() => pauseJob(detail.id)}>暂停任务</button>}
            {canWrite && !["queued", "running"].includes(detail.status) && <><button className="btn btn-secondary" disabled={starting || saving} onClick={() => openEdit(detail.id)}>编辑资料与留言</button><button className="btn btn-primary" disabled={starting} onClick={() => startJob(detail)}>{starting ? "正在确认..." : detail.status === "draft" ? "确认提交留言" : "确认继续 / 重试可执行网站"}</button></>}
          </div></div>
          <details open={detail.status === "draft"} className="site-workbench-detail-preview"><summary>联系资料、留言与目标网站</summary>{preview(detail, detail.targets.map((target: any) => target.websiteUrl))}</details>
          <div className="table-container site-message-detail-table"><table><thead><tr><th>目标网站</th><th>执行进度</th><th>状态</th><th>结果说明</th><th>日志</th></tr></thead><tbody>{detail.targets.map((target: any) => {
            const statusKey = target.classifiedStatus || target.status;
            const meta = statusMeta[statusKey] || statusMeta.draft;
            const percent = Number(target.progressPercent ?? (["submitted", "skipped", "failed", "abnormal"].includes(statusKey) ? 100 : 0));
            const logs = parseProgressLogs(target.progressLogs);
            const expanded = expandedTargetId === target.id;
            return <React.Fragment key={target.id}><tr>
              <td><a href={target.websiteUrl} target="_blank" rel="noreferrer">{target.normalizedHost}</a>{target.contactPageUrl && <a className="site-message-contact-link" href={target.contactPageUrl} target="_blank" rel="noreferrer">打开联系页</a>}</td>
              <td><div className="site-message-progress"><div className="site-message-progress-track"><span style={{ width: `${percent}%` }}/></div><div><strong>{percent}%</strong><span>{logs[logs.length - 1]?.message || "等待执行"}</span></div></div></td>
              <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td><td><span className="site-message-result">{target.resultMessage || (percent > 0 ? "执行中" : "等待执行")}</span></td>
              <td><button className="btn btn-ghost site-message-log-toggle" onClick={() => setExpandedTargetId(expanded ? null : target.id)} disabled={!logs.length}>{expanded ? "收起" : `查看日志${logs.length ? ` (${logs.length})` : ""}`}</button></td>
            </tr>{expanded && <tr className="site-message-log-row"><td colSpan={5}><ol className="site-message-log-list">{logs.map((log: any, index: number) => <li key={`${log.at}-${index}`}><time>{formatDate(log.at)}</time><span className="site-message-log-dot"/><div><strong>{log.percent}% · {log.message}</strong>{log.url && <a href={log.url} target="_blank" rel="noreferrer">{log.url}</a>}</div></li>)}</ol></td></tr>}</React.Fragment>;
          })}</tbody></table></div>
          {canWrite && !["queued", "running"].includes(detail.status) && <details className="site-workbench-reset"><summary>重置全部状态</summary><p>重置会清除执行日志和结果记录。此前成功提交的网站也会回到待开始状态，再次执行可能重复留言。</p><button className="btn btn-secondary" disabled={starting} onClick={() => resetJob(detail.id)}>重置全部网站与历史</button></details>}
        </>}</div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={closeDetail}>关闭</button><button className="btn btn-secondary" disabled={detailLoading} onClick={() => openDetail(detail.id)}>刷新状态</button><button className="btn btn-primary" disabled={detailLoading} onClick={() => exportJob(detail.id, detail.name)}>导出运行结果 (CSV)</button></div>
      </div></div>}
    </>
  );
}
