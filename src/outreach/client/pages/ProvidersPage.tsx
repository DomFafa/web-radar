/** @jsxImportSource react */
import React, { useState, useEffect } from "react";
import { providersApi } from "../lib/api";
import { useToast } from "../App";

export function ProvidersPage() {
  const { addToast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    provider: "amazon_ses",
    name: "",
    apiKey: "",
    configStr: "",
    isDefault: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await providersApi.list();
      setProviders(res.data);
    } catch (err: any) {
      addToast("error", err.message || "获取服务商配置失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleTestConnection = async (p?: any) => {
    const targetProvider = p ? p.provider : form.provider;
    const targetApiKey = p ? p.maskedApiKey : form.apiKey;
    const targetId = p ? p.id : (editingId || undefined);
    let config = null;

    if (!p) {
      if (form.configStr) {
        try {
          config = JSON.parse(form.configStr);
        } catch {
          addToast("error", "附加配置必须是有效的 JSON 格式");
          return;
        }
      }
    } else {
      if (p.config) {
        try { config = JSON.parse(p.config); } catch {}
      }
    }

    setTestingId(targetId || "modal");
    try {
      const res = await providersApi.test({
        provider: targetProvider,
        apiKey: targetApiKey,
        config,
        id: targetId,
      });
      addToast("success", res.message || "连通性测试通过");
    } catch (err: any) {
      addToast("error", err.message || "测试连通性失败");
    } finally {
      setTestingId(null);
    }
  };

  const handleEdit = (p: any) => {
    let configStr = p.config || "";
    if (p.provider === "mailchimp") {
      try {
        const config = JSON.parse(configStr || "{}");
        // 旧配置没有 apiType；掩码仍保留 Key 的最后四位，例如 us19。
        if (!config.apiType && /us\d{2}$/i.test(p.maskedApiKey || "")) config.apiType = "marketing";
        configStr = JSON.stringify(config);
      } catch {}
    }
    setEditingId(p.id);
    setForm({
      provider: p.provider,
      name: p.name,
      apiKey: p.maskedApiKey || "",
      configStr,
      isDefault: p.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm({ provider: "amazon_ses", name: "", apiKey: "", configStr: "", isDefault: false });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let config = null;
      if (form.configStr) {
        try {
          config = JSON.parse(form.configStr);
        } catch {
          throw new Error("附加配置必须是有效的 JSON 格式");
        }
      }

      if (editingId) {
        await providersApi.update(editingId, {
          ...form,
          config,
        });
        addToast("success", "服务商配置已更新");
      } else {
        await providersApi.create({
          ...form,
          config,
        });
        addToast("success", "服务商配置添加成功");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm({ provider: "amazon_ses", name: "", apiKey: "", configStr: "", isDefault: false });
      fetchProviders();
    } catch (err: any) {
      addToast("error", err.message || "操作失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此配置吗？如果删除了默认发信配置可能导致发信失败！")) return;
    try {
      await providersApi.delete(id);
      addToast("success", "已删除");
      fetchProviders();
    } catch (err: any) {
      addToast("error", err.message || "删除失败");
    }
  };

  const providerLabels: Record<string, string> = {
    amazon_ses: "Amazon SES",
    sendgrid: "SendGrid",
    mailchimp: "Mailchimp Marketing / Transactional",
    mailgun: "Mailgun",
    brevo: "Brevo",
    smtp: "SMTP / 其他邮件",
    openai: "OpenAI",
    anthropic: "Anthropic (Claude)",
    deepseek: "DeepSeek",
  };

  return (
    <div className="providers-page">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>🔌 服务商配置</h2>
            <p>集成第三方邮件发信服务与 AI 内容生成服务</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddNew}>
            + 添加配置
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
           <div className="loading-overlay">
             <div className="spinner"></div>
           </div>
        ) : (
          <div className="stats-grid">
            {providers.map((p) => (
              <div key={p.id} className="card" style={{ position: 'relative' }}>
                {p.isDefault && (
                  <span className="badge badge-success" style={{ position: 'absolute', top: 16, right: 16 }}>
                    默认通道
                  </span>
                )}
                <div className="card-header" style={{ marginBottom: 8 }}>
                  <h3 className="card-title" style={{ fontSize: 18 }}>{p.name}</h3>
                </div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
                  服务商: {providerLabels[p.provider] || p.provider} <br/>
                  状态: {p.status === "active" ? "✅ 正常" : "❌ 异常"} <br/>
                  密钥: {p.maskedApiKey ? `${p.maskedApiKey} (已配置)` : "未配置"}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>
                    编辑配置
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleTestConnection(p)}
                    disabled={testingId === p.id}
                  >
                    {testingId === p.id ? "测试中..." : "🔍 测试连接"}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                    删除配置
                  </button>
                </div>
              </div>
            ))}
            
            {providers.length === 0 && (
               <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                 <div className="empty-icon">✉️</div>
                 <h3>尚未配置服务商</h3>
                 <p>请点击右上角添加您的第一个邮件发送或 AI 服务商 API 密钥</p>
               </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">添加服务商配置</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: 12 }}>选择服务商类型</label>
                  
                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>邮件发信服务</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
                    {[
                      { id: 'amazon_ses', name: 'Amazon SES', icon: '☁️' },
                      { id: 'sendgrid', name: 'SendGrid', icon: '📧' },
                      { id: 'mailchimp', name: 'Mailchimp', icon: '📨' },
                      { id: 'mailgun', name: 'Mailgun', icon: '🚀' },
                      { id: 'brevo', name: 'Brevo', icon: '✉️' },
                      { id: 'smtp', name: '标准 SMTP', icon: '⚙️' }
                    ].map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setForm({ ...form, provider: p.id, configStr: "{}" })}
                        style={{
                          padding: '8px 4px',
                          border: form.provider === p.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          background: form.provider === p.id ? 'var(--color-accent-subtle)' : 'var(--color-bg-body)',
                          boxShadow: form.provider === p.id ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
                          transform: form.provider === p.id ? 'translateY(-1px)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 2 }}>{p.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: form.provider === p.id ? 600 : 400, color: form.provider === p.id ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{p.name}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>AI 内容生成服务</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                    {[
                      { id: 'openai', name: 'OpenAI', icon: '🤖' },
                      { id: 'anthropic', name: 'Claude', icon: '🧠' },
                      { id: 'deepseek', name: 'DeepSeek', icon: '🐋' }
                    ].map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setForm({ ...form, provider: p.id, configStr: "{}" })}
                        style={{
                          padding: '8px 4px',
                          border: form.provider === p.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          background: form.provider === p.id ? 'var(--color-accent-subtle)' : 'var(--color-bg-body)',
                          boxShadow: form.provider === p.id ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
                          transform: form.provider === p.id ? 'translateY(-1px)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 2 }}>{p.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: form.provider === p.id ? 600 : 400, color: form.provider === p.id ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">配置名称</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="如: SES 美东主账号 / OpenAI 默认 Key"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="off"
                    name="provider_name_off"
                    id={`provider_name_${Math.random()}`}
                  />
                </div>

                {form.provider === "mailchimp" && (
                  <div className="form-group">
                    <label className="form-label">Mailchimp API 类型</label>
                    <select
                      className="form-input"
                      value={(() => { try { return JSON.parse(form.configStr || "{}").apiType || "transactional"; } catch { return "transactional"; } })()}
                      onChange={(e) => {
                        try { const c = JSON.parse(form.configStr || "{}"); c.apiType = e.target.value; setForm({ ...form, configStr: JSON.stringify(c) }); } catch {}
                      }}
                    >
                      <option value="transactional">Transactional / Mandrill（单封邮件）</option>
                      <option value="marketing">Marketing API（Audience + Campaign）</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {form.provider === "smtp" ? "SMTP 密码" : 
                     form.provider === "amazon_ses" ? "Secret Access Key" : 
                     form.provider === "sendgrid" ? "SendGrid API Key" :
                     form.provider === "mailchimp" ? "Mailchimp Marketing 或 Transactional API Key" :
                     form.provider === "mailgun" ? "Mailgun Private API Key" :
                     form.provider === "brevo" ? "Brevo API Key" :
                     "API Key"}
                  </label>
                  <input
                    className="form-input"
                    type={form.apiKey && form.apiKey.includes("***") ? "text" : "password"}
                    required
                    placeholder={form.provider === "mailchimp" ? "Marketing Key 通常以 -us19 结尾；Transactional Key 不带此后缀" : form.provider === "mailgun" ? "key-... 或 Mailgun Private API Key" : "在此输入您的鉴权密钥"}
                    value={form.apiKey}
                    onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                    autoComplete="new-password"
                    name="provider_apikey_off"
                    id={`provider_apikey_${Math.random()}`}
                  />
                </div>

                {/* 动态配置区域 */}
                {form.provider === "amazon_ses" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Access Key ID</label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        placeholder="AKIA..."
                        value={(() => { try { return JSON.parse(form.configStr || "{}").accessKeyId || ""; } catch { return ""; } })()}
                        onChange={(e) => {
                          try {
                            const c = JSON.parse(form.configStr || "{}");
                            c.accessKeyId = e.target.value;
                            setForm({ ...form, configStr: JSON.stringify(c) });
                          } catch {}
                        }}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Region (区域)</label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        placeholder="例如: us-east-1"
                        value={(() => { try { return JSON.parse(form.configStr || "{}").region || ""; } catch { return ""; } })()}
                        onChange={(e) => {
                          try {
                            const c = JSON.parse(form.configStr || "{}");
                            c.region = e.target.value;
                            setForm({ ...form, configStr: JSON.stringify(c) });
                          } catch {}
                        }}
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                )}

                {form.provider === "smtp" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">SMTP 服务器地址 (Host)</label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        placeholder="例如: smtp.gmail.com"
                        value={(() => { try { return JSON.parse(form.configStr || "{}").host || ""; } catch { return ""; } })()}
                        onChange={(e) => {
                          try {
                            const c = JSON.parse(form.configStr || "{}");
                            c.host = e.target.value;
                            setForm({ ...form, configStr: JSON.stringify(c) });
                          } catch {}
                        }}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">端口 (Port)</label>
                        <input
                          className="form-input"
                          type="number"
                          required
                          placeholder="465 / 587"
                          value={(() => { try { return JSON.parse(form.configStr || "{}").port || ""; } catch { return ""; } })()}
                          onChange={(e) => {
                            try {
                              const c = JSON.parse(form.configStr || "{}");
                              c.port = Number(e.target.value);
                              setForm({ ...form, configStr: JSON.stringify(c) });
                            } catch {}
                          }}
                          autoComplete="new-password"
                        />
                      </div>
                      <div style={{ flex: 2 }}>
                        <label className="form-label">用户名 (Username)</label>
                        <input
                          className="form-input"
                          type="text"
                          required
                          placeholder="通常为邮箱地址"
                          value={(() => { try { return JSON.parse(form.configStr || "{}").username || ""; } catch { return ""; } })()}
                          onChange={(e) => {
                            try {
                              const c = JSON.parse(form.configStr || "{}");
                              c.username = e.target.value;
                              setForm({ ...form, configStr: JSON.stringify(c) });
                            } catch {}
                          }}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </>
                )}

                {form.provider === "mailgun" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">发送域名 (Domain)</label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        placeholder="例如: mg.example.com"
                        value={(() => { try { return JSON.parse(form.configStr || "{}").domain || ""; } catch { return ""; } })()}
                        onChange={(e) => {
                          try { const c = JSON.parse(form.configStr || "{}"); c.domain = e.target.value; setForm({ ...form, configStr: JSON.stringify(c) }); } catch {}
                        }}
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">API 地址 (选填)</label>
                      <input
                        className="form-input"
                        type="url"
                        placeholder="美国区留空；欧盟区填写 https://api.eu.mailgun.net"
                        value={(() => { try { return JSON.parse(form.configStr || "{}").baseUrl || ""; } catch { return ""; } })()}
                        onChange={(e) => {
                          try { const c = JSON.parse(form.configStr || "{}"); if (e.target.value) c.baseUrl = e.target.value; else delete c.baseUrl; setForm({ ...form, configStr: JSON.stringify(c) }); } catch {}
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}

                {form.provider === "mailchimp" && (() => {
                  let apiType = "transactional";
                  try { apiType = JSON.parse(form.configStr || "{}").apiType || apiType; } catch {}
                  return apiType === "marketing" ? (
                  <>
                  <div className="form-group">
                    <label className="form-label">Audience ID / List ID（Marketing Key 可选但推荐填写）</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="例如: a1b2c3d4e5"
                      value={(() => { try { return JSON.parse(form.configStr || "{}").listId || ""; } catch { return ""; } })()}
                      onChange={(e) => {
                        try { const c = JSON.parse(form.configStr || "{}"); if (e.target.value) c.listId = e.target.value; else delete c.listId; setForm({ ...form, configStr: JSON.stringify(c) }); } catch {}
                      }}
                      autoComplete="off"
                    />
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>
                      Marketing API 会自动同步活动收件人并创建静态 Segment，然后发送一个 Campaign。
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">数据中心（无后缀 Key 时填写）</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="例如: us19；通常可从 Key 后缀自动识别"
                      value={(() => { try { return JSON.parse(form.configStr || "{}").dataCenter || ""; } catch { return ""; } })()}
                      onChange={(e) => {
                        try { const c = JSON.parse(form.configStr || "{}"); if (e.target.value) c.dataCenter = e.target.value; else delete c.dataCenter; setForm({ ...form, configStr: JSON.stringify(c) }); } catch {}
                      }}
                      autoComplete="off"
                    />
                  </div>
                  </>
                  ) : null;
                })()}

                {["openai", "deepseek", "anthropic"].includes(form.provider) && (
                  <>
                    <div className="form-group">
                      <label className="form-label">自定义 Base URL (选填)</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="如果不填将使用官方默认地址。例如使用代理地址：https://api.openai-proxy.com/v1"
                        value={(() => { try { return JSON.parse(form.configStr || "{}").baseURL || ""; } catch { return ""; } })()}
                        onChange={(e) => {
                          try {
                            const c = JSON.parse(form.configStr || "{}");
                            if (e.target.value) c.baseURL = e.target.value;
                            else delete c.baseURL;
                            setForm({ ...form, configStr: JSON.stringify(c) });
                          } catch {}
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">模型名称 (选填)</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder={form.provider === "deepseek" ? "默认: deepseek-chat" : form.provider === "anthropic" ? "默认: claude-3-haiku-20240307" : "默认: gpt-3.5-turbo"}
                        value={(() => { try { return JSON.parse(form.configStr || "{}").model || ""; } catch { return ""; } })()}
                        onChange={(e) => {
                          try {
                            const c = JSON.parse(form.configStr || "{}");
                            if (e.target.value) c.model = e.target.value;
                            else delete c.model;
                            setForm({ ...form, configStr: JSON.stringify(c) });
                          } catch {}
                        }}
                      />
                    </div>
                  </>
                )}

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  />
                  <label htmlFor="isDefault" style={{ fontSize: 14 }}>
                    设为默认通道 (优先使用此通道发送/生成)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleTestConnection()}
                  disabled={testingId === "modal"}
                >
                  {testingId === "modal" ? "测试中..." : "🔍 测试连接"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  保存配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
