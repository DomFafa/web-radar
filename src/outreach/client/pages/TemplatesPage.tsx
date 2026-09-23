import { EmailPreview } from "../components/EmailPreview";
/** @jsxImportSource react */
import React, { useState, useEffect } from "react";
import { marked } from "marked";
import { templatesApi } from "../lib/api";
import { useToast } from "../App";
import { blockedEmailMessage, findBlockedEmailTerms } from "../../shared/email-content-policy";

import ReactQuill from "react-quill-new";
import { sessionHeaders } from "../../../client/api";
import { useRef, useMemo } from "react";

const BUILT_IN_CATEGORIES = ["产品资讯", "产品推广", "活动邀请", "客户跟进", "节日促销", "交易通知", "欢迎与留存"];
const CATEGORY_LABELS: Record<string, string> = {
  "产品资讯": "Newsletter", "产品推广": "Sell products", "活动邀请": "Invite to event",
  "客户跟进": "Follow-up", "节日促销": "Seasonal campaigns", "交易通知": "Transactional", "欢迎与留存": "Onboarding & retention",
};
export const TEMPLATE_NAME_LABELS: Record<string, string> = {
  "欢迎介绍": "Welcome introduction", "品牌故事": "Brand story", "团队介绍": "Meet the team", "服务概览": "Service overview", "资源分享": "Resource share", "客户案例": "Customer story", "功能更新": "Feature update", "行业洞察": "Industry insights", "感谢关注": "Thank you for your interest", "简单通知": "Simple announcement",
  "月度简报": "Monthly digest", "行业报告": "Industry report", "内容精选": "Curated content", "产品周刊": "Product weekly", "数据洞察": "Data insights", "专家观点": "Expert perspective", "趋势速递": "Trend update", "团队通讯": "Team newsletter", "阅读清单": "Reading list", "知识专栏": "Knowledge column",
  "新品发布": "New product launch", "产品亮点": "Product highlights", "限时优惠": "Limited-time offer", "产品对比": "Product comparison", "功能上新": "New features", "套餐推荐": "Plan recommendation", "试用邀请": "Free trial invitation", "客户评价": "Customer reviews", "回购提醒": "Buy again", "升级通知": "Upgrade announcement",
  "线上分享": "Online session", "线下活动": "In-person event", "产品发布会": "Product launch event", "研讨会": "Webinar invitation", "直播预告": "Live stream reminder", "课程邀请": "Course invitation", "社区活动": "Community event", "展会邀约": "Trade show invitation", "报名确认": "Registration confirmed", "活动回顾": "Event recap",
  "首次联系": "First outreach", "方案跟进": "Proposal follow-up", "会议总结": "Meeting recap", "预约沟通": "Book a conversation", "报价跟进": "Quote follow-up", "试用跟进": "Trial follow-up", "沉睡客户": "Re-engage a customer", "客户成功": "Customer success", "续约提醒": "Renewal reminder", "反馈收集": "Feedback request",
  "新年问候": "New year greeting", "春节祝福": "Lunar New Year greeting", "春季上新": "Spring collection", "夏日活动": "Summer campaign", "秋季精选": "Autumn picks", "冬日礼遇": "Winter offer", "周年庆典": "Anniversary celebration", "会员专享": "Member exclusive", "黑五促销": "Black Friday sale", "节日感谢": "Seasonal thank you",
  "订单确认": "Order confirmation", "付款成功": "Payment successful", "发货通知": "Shipping notification", "配送更新": "Delivery update", "订单完成": "Order complete", "退款通知": "Refund notification", "发票发送": "Invoice delivery", "账户安全": "Account security", "密码重置": "Password reset", "服务到期": "Service expiry",
  "里程碑": "Milestone", "会员生日": "Member birthday", "欢迎加入": "Welcome aboard", "注册成功": "Registration success", "首次使用": "Getting started", "新手指南": "Getting started guide", "功能教学": "Feature tutorial", "使用提醒": "Usage reminder", "回归欢迎": "Welcome back", "满意度回访": "Satisfaction check-in",
};

interface ParsedTemplate {
  prefix: string;
  body: string;
  suffix: string;
  isWrapped: boolean;
}

function splitTemplateHtml(fullHtml: string): ParsedTemplate {
  if (!fullHtml) return { prefix: "", body: "", suffix: "", isWrapped: false };

  // 1. Check for GrowthOS v3 card layout (padding:54px 72px 46px or border-bottom logo header)
  const v3MarkerSingle = "<div style='background:white;padding:54px 72px 46px'>";
  const v3MarkerDouble = '<div style="background:white;padding:54px 72px 46px">';
  let startIdx = fullHtml.indexOf(v3MarkerSingle);
  let markerLen = v3MarkerSingle.length;
  if (startIdx === -1) {
    startIdx = fullHtml.indexOf(v3MarkerDouble);
    markerLen = v3MarkerDouble.length;
  }

  if (startIdx !== -1) {
    const prefixLen = startIdx + markerLen;
    const prefix = fullHtml.substring(0, prefixLen);
    const rest = fullHtml.substring(prefixLen);
    
    const footerMarkerSingle = "</div><div style='background:white;border-top:1px solid #ededed";
    const footerMarkerDouble = '</div><div style="background:white;border-top:1px solid #ededed';
    let footerIdx = rest.indexOf(footerMarkerSingle);
    if (footerIdx === -1) footerIdx = rest.indexOf(footerMarkerDouble);

    if (footerIdx !== -1) {
      const body = rest.substring(0, footerIdx);
      const suffix = rest.substring(footerIdx);
      return { prefix, body, suffix, isWrapped: true };
    }
  }

  // 2. Generic check for data-growthos-template wrapper
  if (fullHtml.includes("data-growthos-template") || fullHtml.includes("max-width:600px")) {
    const firstDivEnd = fullHtml.indexOf(">");
    if (firstDivEnd !== -1) {
      const lastDivStart = fullHtml.lastIndexOf("</div>");
      if (lastDivStart > firstDivEnd) {
        const prefix = fullHtml.substring(0, firstDivEnd + 1);
        const body = fullHtml.substring(firstDivEnd + 1, lastDivStart);
        const suffix = fullHtml.substring(lastDivStart);
        return { prefix, body, suffix, isWrapped: true };
      }
    }
  }

  return { prefix: "", body: fullHtml, suffix: "", isWrapped: false };
}

function preserveButtonStyles(html: string): string {
  if (!html) return html;
  return html.replace(/<a(\s+[^>]*href=['"][^'"]*['"][^>]*)>([\s\S]*?)<\/a>/gi, (match, attrs, content) => {
    if (/style=['"][^'"]*background/i.test(attrs)) {
      return match;
    }
    const btnStyle = "display:inline-block;background:#050505;color:#ffffff;padding:14px 24px;text-decoration:none;font-weight:bold;border-radius:4px;";
    if (attrs.includes("style=")) {
      attrs = attrs.replace(/style=['"]([^'"]*)['"]/i, `style="$1;${btnStyle}"`);
    } else {
      attrs += ` style="${btnStyle}"`;
    }
    return `<a${attrs}>${content}</a>`;
  });
}

export function TemplatesPage({ editTemplate, onSaved, onClose }: {
  editTemplate?: any;
  onSaved?: (template: any) => void;
  onClose?: () => void;
} = {}) {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"builtin" | "mine">("mine");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchTerm, setSearchTerm] = useState("");

  const [editorMode, setEditorMode] = useState<"visual" | "code" | "preview">("visual");
  const [wrapperPrefix, setWrapperPrefix] = useState("");
  const [wrapperSuffix, setWrapperSuffix] = useState("");

  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: () => {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            try {
              addToast("warning", "图片上传中...");
              // 我们通过 fetchApi 是不够的因为 FormData 自动设置 headers，需要直接 fetch 或自定义 fetchApi
              const res = await fetch("/api/outreach/upload", {
                method: "POST",
                headers: sessionHeaders(),
                body: formData,
              });
              const data: any = await res.json();

              if (data.success) {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  const range = quill.getSelection();
                  quill.insertEmbed(range?.index || 0, "image", data.url);
                }
              } else {
                throw new Error(data.error || "上传失败");
              }
            } catch (err: any) {
              addToast("error", err.message);
            }
          };
        },
      },
    },
  }), [addToast]);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    bodyHtml: "",
    bodyText: "",
    category: "",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiOptions, setShowAiOptions] = useState(false);

  useEffect(() => {
    if (editTemplate) handleEdit(editTemplate);
    else loadTemplates();
  }, []);

  useEffect(() => {
    if (!showPreview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPreview(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showPreview]);

  const loadTemplates = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const allTemplates = await templatesApi.listAll();
      setTemplates(allTemplates);
    } catch (err) {
      console.error(err);
      addToast("error", "模板加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const editorBlockedTerms = findBlockedEmailTerms(
    form.subject,
    editorMode === "code" ? form.bodyHtml : wrapperPrefix + form.bodyHtml + wrapperSuffix,
    form.bodyText,
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalBodyHtml = form.bodyHtml;

      if (editorMode === "visual") {
        const bodyProcessed = preserveButtonStyles(form.bodyHtml);
        finalBodyHtml = wrapperPrefix ? (wrapperPrefix + bodyProcessed + wrapperSuffix) : bodyProcessed;
      } else if (editorMode === "preview") {
        const bodyProcessed = preserveButtonStyles(form.bodyHtml);
        finalBodyHtml = wrapperPrefix ? (wrapperPrefix + bodyProcessed + wrapperSuffix) : bodyProcessed;
      } else {
        finalBodyHtml = form.bodyHtml;
      }

      const payload = {
        ...form,
        bodyHtml: finalBodyHtml,
      };

      const blockedTerms = findBlockedEmailTerms(payload.subject, payload.bodyHtml, payload.bodyText);
      if (blockedTerms.length) throw new Error(blockedEmailMessage(blockedTerms));

      if (editingId) {
        await templatesApi.update(editingId, payload);
        addToast("success", "模板已更新");
        onSaved?.({ ...editTemplate, ...payload, id: editingId });
      } else {
        await templatesApi.create(payload);
        addToast("success", "模板已创建");
      }
      setShowModal(false);
      setEditingId(null);
      setShowAiOptions(false);
      setWrapperPrefix("");
      setWrapperSuffix("");
      setForm({ name: "", subject: "", bodyHtml: "", bodyText: "", category: "" });
      if (editTemplate) onClose?.();
      else void loadTemplates(false);
    } catch (err: any) {
      addToast("error", err.message);
    }
  };

  const handleEdit = (template: any) => {
    const parsed = splitTemplateHtml(template.bodyHtml || "");
    setWrapperPrefix(parsed.prefix);
    setWrapperSuffix(parsed.suffix);
    setForm({
      name: template.name,
      subject: template.subject,
      bodyHtml: parsed.body,
      bodyText: template.bodyText || "",
      category: template.category || "",
    });
    setEditingId(template.id);
    setEditorMode("visual");
    setShowAiOptions(false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此模板？")) return;
    const previousTemplates = templates;
    setTemplates((current) => current.filter((template) => template.id !== id));
    try {
      await templatesApi.delete(id);
      addToast("success", "已删除");
      void loadTemplates(false);
    } catch (err: any) {
      setTemplates(previousTemplates);
      addToast("error", err.message);
    }
  };

  const customizeBuiltInTemplate = (template: any) => {
    const rawHtml = template.bodyHtml ? template.bodyHtml.replace(/ data-growthos-template='en-v[23]'/, "") : "";
    const parsed = splitTemplateHtml(rawHtml);
    setWrapperPrefix(parsed.prefix);
    setWrapperSuffix(parsed.suffix);
    setForm({
      name: `${TEMPLATE_NAME_LABELS[template.name] || template.name} - Custom`,
      subject: template.subject,
      bodyHtml: parsed.body,
      bodyText: template.bodyText || "",
      category: "My templates",
    });
    setEditingId(null);
    setEditorMode("visual");
    setShowAiOptions(false);
    setShowModal(true);
  };

  const handleSwitchEditorMode = (newMode: "visual" | "code" | "preview") => {
    if (editorMode === newMode) return;

    if (editorMode === "visual" && newMode === "code") {
      const combined = wrapperPrefix ? (wrapperPrefix + form.bodyHtml + wrapperSuffix) : form.bodyHtml;
      setForm((p) => ({ ...p, bodyHtml: combined }));
    } else if (editorMode === "code" && newMode === "visual") {
      const parsed = splitTemplateHtml(form.bodyHtml);
      setWrapperPrefix(parsed.prefix);
      setWrapperSuffix(parsed.suffix);
      setForm((p) => ({ ...p, bodyHtml: parsed.body }));
    } else if (editorMode === "code" && newMode === "preview") {
      // Keep full code
    } else if (editorMode === "preview" && newMode === "visual") {
      const currentFull = wrapperPrefix ? (wrapperPrefix + form.bodyHtml + wrapperSuffix) : form.bodyHtml;
      const parsed = splitTemplateHtml(currentFull);
      setWrapperPrefix(parsed.prefix);
      setWrapperSuffix(parsed.suffix);
      setForm((p) => ({ ...p, bodyHtml: parsed.body }));
    }

    setEditorMode(newMode);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      addToast("error", "请输入 AI 生成提示词");
      return;
    }
    setGenerating(true);
    try {
      const res = await templatesApi.generate({
        prompt: aiPrompt,
        language: "zh",
      });
      if (res.data) {
        const generatedHtml = res.data.bodyHtml || form.bodyHtml || "";
        const parsed = splitTemplateHtml(generatedHtml);
        setWrapperPrefix(parsed.prefix);
        setWrapperSuffix(parsed.suffix);
        setForm((prev) => ({
          ...prev,
          subject: res.data.subject || prev.subject,
          bodyText: res.data.bodyText || prev.bodyText,
          bodyHtml: parsed.body,
        }));
        addToast("success", "AI 已生成邮件内容");
        setShowAiOptions(false);
      }
    } catch (err: any) {
      addToast("error", err.message || "AI 生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const categories = ["全部", ...BUILT_IN_CATEGORIES];
  const isBuiltInTemplate = (tpl: any) =>
    tpl.isBuiltIn === true ||
    tpl.bodyHtml?.includes("data-growthos-template='en-v2'") ||
    tpl.bodyHtml?.includes("data-growthos-template='en-v3'");
  const matchesFilter = (tpl: any) => {
    const categoryMatches = activeCategory === "全部" || tpl.category === activeCategory;
    const query = searchTerm.trim().toLowerCase();
    return categoryMatches && (!query || `${tpl.name} ${tpl.subject}`.toLowerCase().includes(query));
  };
  const builtInTemplates = templates.filter((tpl) => isBuiltInTemplate(tpl) && matchesFilter(tpl));
  const userTemplates = templates.filter((tpl) => !isBuiltInTemplate(tpl) && matchesFilter(tpl));

  return (
    <>
      {!editTemplate && <>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>邮件模板</h2>
            <p>创建和管理你的邮件内容模板</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingId(null);
              setWrapperPrefix("");
              setWrapperSuffix("");
              setForm({ name: "", subject: "", bodyHtml: "", bodyText: "", category: "" });
              setEditorMode("visual");
              setShowModal(true);
            }}
          >
            ➕ 新建模板
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="stats-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card template-skeleton-card">
                <div className="skeleton template-skeleton-title"></div>
                <div className="skeleton template-skeleton-line template-skeleton-line-wide"></div>
                <div className="skeleton template-skeleton-line template-skeleton-line-short"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="template-tabs">
              <button className={`btn ${activeTab === "mine" ? "btn-primary" : "btn-ghost"}`} onClick={() => { setActiveTab("mine"); setActiveCategory("全部"); }}>我的模板</button>
              <button className={`btn ${activeTab === "builtin" ? "btn-primary" : "btn-ghost"}`} onClick={() => { setActiveTab("builtin"); setActiveCategory("全部"); }}>内置模板</button>
            </div>
            <div className="template-toolbar">
              <input className="form-input template-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="搜索模板名称或主题" />
              {activeTab === "builtin" && <div className="flex gap-sm template-category-filters">
                {categories.map((category) => (
                  <button key={category} className={`btn btn-sm ${activeCategory === category ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveCategory(category)}>{category === "全部" ? "All" : CATEGORY_LABELS[category] || category}</button>
                ))}
              </div>}
            </div>
            {activeTab === "builtin" && <>
            <div className="template-section-heading">
              <h3>{activeCategory === "全部" ? "All" : CATEGORY_LABELS[activeCategory] || activeCategory}</h3>
              <span>{builtInTemplates.length} 个模板</span>
            </div>
            <div className="template-grid template-grid-built-in">
              {builtInTemplates.map((tpl) => (
                <div key={tpl.id} className="card template-card">
                  <div className="template-card-preview"><EmailPreview html={tpl.bodyHtml} height={160}/></div>
                  <h3 className="card-title">{TEMPLATE_NAME_LABELS[tpl.name] || tpl.name}</h3>
                  <p className="template-card-subject">{tpl.subject}</p>
                  <div className="flex gap-sm"><button className="btn btn-secondary btn-sm" onClick={() => setShowPreview(tpl.id)}>预览</button><button className="btn btn-primary btn-sm" onClick={() => customizeBuiltInTemplate(tpl)}>编辑并保存</button></div>
                </div>
              ))}
            </div>
            </>}
            {activeTab === "mine" && <>
            <div className="template-section-heading">
              <h3>我的模板</h3>
              <span>{userTemplates.length} 个模板</span>
            </div>
            <div className="template-grid template-grid-mine">
            {userTemplates.map((tpl) => (
              <div key={tpl.id} className="card template-card template-user-card">
                <div className="card-header">
                  <h3 className="card-title template-user-title">{tpl.name}</h3>
                  <div className="flex gap-sm">
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(tpl.id)}>
                      👁️
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(tpl)}>
                      ✏️
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(tpl.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="template-user-subject">
                  <span>主题: </span>
                  <span>{tpl.subject}</span>
                </div>
                <div className="flex gap-sm items-center">
                  {tpl.category && (
                    <span className="badge badge-default">{tpl.category}</span>
                  )}
                  {tpl.isAiGenerated && (
                    <span className="badge badge-info">🤖 AI 生成</span>
                  )}
                  <span className="template-user-date">
                    {new Date(tpl.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
            ))}
            </div>
            </>}
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      </>}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal template-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? "编辑模板" : "新建模板"}
              </h3>
              <div className="flex gap-sm">
                <button
                  type="button"
                  className={`btn btn-sm ${showAiOptions ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setShowAiOptions(!showAiOptions)}
                >
                  🤖 AI 助手
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); onClose?.(); }}>✕</button>
              </div>
            </div>
            
            {showAiOptions && (
              <div className="template-ai-panel">
                <div className="template-ai-label">
                  告诉 AI 你想写什么类型的邮件：
                </div>
                <div className="template-ai-row">
                  <textarea
                    className="form-textarea template-ai-input"
                    placeholder="例如：写一封关于新品 SaaS 发布的邀请邮件，语气要专业且热情，突出可以提升 30% 效率的核心卖点。"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary template-ai-submit"
                    onClick={handleAiGenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <div className="template-ai-progress">
                        <div className="spinner template-ai-spinner"></div>
                        生成中
                      </div>
                    ) : (
                      "开始生成"
                    )}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="template-form-grid">
                  <div className="form-group">
                    <label className="form-label">模板名称 *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: (e.target as HTMLInputElement).value }))}
                      required
                      placeholder="新客户开发模板"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">分类</label>
                    <input
                      className="form-input"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: (e.target as HTMLInputElement).value }))}
                      placeholder="outreach / followup"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">邮件主题 *</label>
                  <input
                    className="form-input"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: (e.target as HTMLInputElement).value }))}
                    required
                    placeholder="Hi {{name}}, Partnership Opportunity"
                  />
                </div>
                <div className="form-group">
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      邮件正文 * {wrapperPrefix && <span className="badge badge-info" style={{ marginLeft: 6, fontSize: 11 }}>已保留模板框架样式</span>}
                    </label>
                    <div className="template-mode-switch">
                      <button
                        type="button"
                        className={`btn btn-sm ${editorMode === "visual" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => handleSwitchEditorMode("visual")}
                      >
                        🎨 富文本编辑
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${editorMode === "code" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => handleSwitchEditorMode("code")}
                      >
                        💻 HTML 源码
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${editorMode === "preview" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => handleSwitchEditorMode("preview")}
                      >
                        👁 实时预览
                      </button>
                    </div>
                  </div>

                  {editorMode === "visual" && (
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={form.bodyHtml}
                      onChange={(val) => setForm((p) => ({ ...p, bodyHtml: val, bodyText: "" }))}
                      modules={modules}
                      className="template-quill"
                      placeholder="在这里输入邮件正文，支持图片、链接和按钮..."
                    />
                  )}

                  {editorMode === "code" && (
                    <textarea
                      className="form-textarea template-code-editor"
                      value={form.bodyHtml}
                      onChange={(e) => setForm((p) => ({ ...p, bodyHtml: e.target.value, bodyText: "" }))}
                      placeholder="在这里输入或粘贴 HTML 源码..."
                      rows={14}
                      style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.5, background: "#1e1e2e", color: "#f8f8f2" }}
                    />
                  )}

                  {editorMode === "preview" && (
                    <div className="template-editor-preview-frame card" style={{ padding: 16, background: "#f8fafc", maxHeight: 420, overflowY: "auto" }}>
                      <EmailPreview html={wrapperPrefix ? wrapperPrefix + form.bodyHtml + wrapperSuffix : form.bodyHtml}/>
                    </div>
                  )}
                </div>
                <div className="template-editor-hint">
                  💡 支持变量: {"{{name}}"}, {"{{company}}"}, {"{{industry}}"}, {"{{email}}"}。发送时自动替换为联系人信息。
                </div>
              </div>
              <div className="modal-footer">
                {editorBlockedTerms.length > 0 && <p role="alert" style={{ color: "var(--color-danger, #dc2626)", marginRight: "auto", overflowWrap: "anywhere" }}>
                  {blockedEmailMessage(editorBlockedTerms)}
                </p>}
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); onClose?.(); }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={editorBlockedTerms.length > 0}>
                  {editingId ? "保存修改" : "创建模板"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal template-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">模板预览</h3>
              <button className="btn btn-ghost" onClick={() => setShowPreview(null)}>✕</button>
            </div>
            <div className="modal-body">
              {(() => {
                const tpl = templates.find((t) => t.id === showPreview);
                if (!tpl) return null;
                return (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>主题:</span>
                      <p style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{tpl.subject}</p>
                    </div>
                    <div className="template-email-canvas"><EmailPreview html={tpl.bodyHtml}/></div>
                    <div className="template-preview-footer">
                      <p>Copyright © {new Date().getFullYear()} Your Company. All rights reserved.</p>
                      <p>You are receiving this email because you opted in via our website.</p>
                      <p>Our mailing address is: Your Company</p>
                      <p><a href="#">Update preferences</a><a href="#">Unsubscribe</a></p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
