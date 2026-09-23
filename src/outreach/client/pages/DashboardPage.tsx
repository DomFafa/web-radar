/** @jsxImportSource react */
import React, { useState, useEffect, useRef } from "react";
import { campaignsApi, siteMessagesApi } from "../lib/api";

export function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [siteMessageStats, setSiteMessageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    loadStats();
    // Provider engagement events arrive asynchronously. Keep the dashboard
    // current while a user leaves it open after testing an email.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadStats();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const [emailResponse, siteMessageResponse] = await Promise.all([
        campaignsApi.overview(),
        siteMessagesApi.overview(),
      ]);
      setStats(emailResponse.data);
      setSiteMessageStats(siteMessageResponse.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const emailStats = [
    {
      icon: "🚀",
      label: "总活动数",
      value: stats?.totalCampaigns || 0,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.12)",
    },
    {
      icon: "👥",
      label: "总联系人",
      value: stats?.totalContacts || 0,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.12)",
    },
    {
      icon: "📨",
      label: "已发送",
      value: stats?.totalSent || 0,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      icon: "📦",
      label: "送达率",
      value: stats?.deliveryRate || 0,
      isRate: true,
      color: "#0ea5e9",
      bgColor: "rgba(14, 165, 233, 0.12)",
      badge: (stats?.deliveryRate || 0) >= 95 ? "优秀" : "正常",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeColor: "#10b981",
    },
    {
      icon: "📬",
      label: "打开率",
      value: stats?.openRate || 0,
      isRate: true,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.12)",
      badge: (stats?.openRate || 0) > 30 ? "高" : "正常",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeColor: "#d97706",
    },
    {
      icon: "🖱️",
      label: "点击率",
      value: stats?.clickRate || 0,
      isRate: true,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.12)",
    },
    {
      icon: "📛",
      label: "退信率",
      value: stats?.bounceRate || 0,
      isRate: true,
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.12)",
      badge: (stats?.bounceRate || 0) === 0 ? "极低" : "预警",
      badgeBg: (stats?.bounceRate || 0) === 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
      badgeColor: (stats?.bounceRate || 0) === 0 ? "#10b981" : "#ef4444",
    },
  ];

  const siteMessageStatsList = [
    {
      icon: "🗂️",
      label: "任务数",
      value: siteMessageStats?.totalJobs || 0,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.12)",
    },
    {
      icon: "🌐",
      label: "目标网站",
      value: siteMessageStats?.totalTargets || 0,
      color: "#0ea5e9",
      bgColor: "rgba(14, 165, 233, 0.12)",
    },
    {
      icon: "✅",
      label: "已提交",
      value: siteMessageStats?.totalSubmitted || 0,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      icon: "⏭️",
      label: "已跳过",
      value: siteMessageStats?.totalSkipped || 0,
      color: "#64748b",
      bgColor: "rgba(100, 116, 139, 0.12)",
    },
    {
      icon: "⚠️",
      label: "执行失败",
      value: siteMessageStats?.totalFailed || 0,
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.12)",
      badge: (siteMessageStats?.totalFailed || 0) === 0 ? "无失败" : "需检查",
      badgeBg: (siteMessageStats?.totalFailed || 0) === 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
      badgeColor: (siteMessageStats?.totalFailed || 0) === 0 ? "#10b981" : "#ef4444",
    },
  ];

  const renderStats = (cards: any[]) => (
    <div className="dashboard-metric-grid">
      {cards.map((stat, index) => {
        const numericVal = typeof stat.value === "number" ? stat.value : parseFloat(stat.value) || 0;
        const displayVal = stat.isRate ? `${numericVal}%` : stat.value;
        const percentFill = stat.isRate ? Math.min(Math.max(numericVal, 0), 100) : 0;

        return (
          <div className="dashboard-metric-tile" key={`${stat.label}-${index}`}>
            <div className="dashboard-metric-header">
              <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
                {stat.icon}
              </div>
              {stat.badge && (
                <span
                  className="dashboard-metric-badge"
                  style={{ background: stat.badgeBg, color: stat.badgeColor }}
                >
                  {stat.badge}
                </span>
              )}
            </div>

            {loading ? (
              <div className="dashboard-metric-body" style={{ marginTop: 4 }}>
                <div className="skeleton" style={{ height: 22, width: "60%", marginBottom: 4 }} />
                <div className="skeleton" style={{ height: 12, width: "80%" }} />
              </div>
            ) : (
              <div className="dashboard-metric-body">
                <div className="dashboard-metric-value">{displayVal}</div>
                <div className="dashboard-metric-label">{stat.label}</div>
              </div>
            )}

            {stat.isRate && !loading && (
              <div className="dashboard-progress-track">
                <div
                  className="dashboard-progress-bar"
                  style={{ width: `${percentFill}%`, background: stat.color }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>仪表盘</h2>
            <p>邮件营销与站内信执行概览</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="dashboard-channel-grid">
          {/* Module 1: 邮件营销 Card */}
          <section className="dashboard-channel-card dashboard-email-card">
            <div className="dashboard-section-heading">
              <div className="dashboard-channel-title">
                <span className="dashboard-channel-icon">✉️</span>
                <div>
                  <h3>
                    邮件营销
                    <span className="dashboard-channel-status-dot" title="系统监控中" />
                  </h3>
                  <p>全渠道送达率与互动转化分析</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("campaigns")}>
                查看活动详情 →
              </button>
            </div>

            <div className="dashboard-channel-body">
              {/* Primary Volume Counters Row */}
              <div className="dashboard-hero-counters dashboard-email-hero">
                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}>
                      🚀
                    </div>
                    <div className="dashboard-hero-value">{loading ? "-" : stats?.totalCampaigns || 0}</div>
                  </div>
                  <div className="dashboard-hero-label">活动总数</div>
                </div>

                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}>
                      👥
                    </div>
                    <div className="dashboard-hero-value">{loading ? "-" : stats?.totalContacts || 0}</div>
                  </div>
                  <div className="dashboard-hero-label">订阅联系人</div>
                </div>

                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                      📨
                    </div>
                    <div className="dashboard-hero-value">{loading ? "-" : stats?.totalSent || 0}</div>
                  </div>
                  <div className="dashboard-hero-label">已发送邮件</div>
                </div>
              </div>

              {/* Performance Rates Section */}
              <div>
                <div className="dashboard-section-subtitle">
                  <span>送达与转化效果 (Engagement Performance)</span>
                </div>
                <div className="dashboard-rates-grid">
                  {/* Delivery Rate */}
                  <div className="dashboard-rate-card">
                    <div className="dashboard-rate-top">
                      <div className="dashboard-rate-label-wrap">
                        <span>📦</span>
                        <span>送达率</span>
                      </div>
                      <div className="dashboard-rate-val-wrap">
                        <span className="dashboard-rate-val">{loading ? "-" : `${stats?.deliveryRate || 0}%`}</span>
                        <span className="dashboard-rate-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                          {(stats?.deliveryRate || 0) >= 95 ? "优秀" : "正常"}
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-rate-track">
                      <div className="dashboard-rate-fill" style={{ width: `${stats?.deliveryRate || 0}%`, background: "linear-gradient(90deg, #0ea5e9, #38bdf8)" }} />
                    </div>
                  </div>

                  {/* Open Rate */}
                  <div className="dashboard-rate-card">
                    <div className="dashboard-rate-top">
                      <div className="dashboard-rate-label-wrap">
                        <span>📬</span>
                        <span>打开率</span>
                      </div>
                      <div className="dashboard-rate-val-wrap">
                        <span className="dashboard-rate-val">{loading ? "-" : `${stats?.openRate || 0}%`}</span>
                        <span className="dashboard-rate-badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#d97706" }}>
                          {(stats?.openRate || 0) > 30 ? "高" : "正常"}
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-rate-track">
                      <div className="dashboard-rate-fill" style={{ width: `${stats?.openRate || 0}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
                    </div>
                  </div>

                  {/* Click Rate */}
                  <div className="dashboard-rate-card">
                    <div className="dashboard-rate-top">
                      <div className="dashboard-rate-label-wrap">
                        <span>🖱️</span>
                        <span>点击率</span>
                      </div>
                      <div className="dashboard-rate-val-wrap">
                        <span className="dashboard-rate-val">{loading ? "-" : `${stats?.clickRate || 0}%`}</span>
                        <span className="dashboard-rate-badge" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
                          {(stats?.clickRate || 0) > 10 ? "精准" : "正常"}
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-rate-track">
                      <div className="dashboard-rate-fill" style={{ width: `${stats?.clickRate || 0}%`, background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }} />
                    </div>
                  </div>

                  {/* Bounce Rate */}
                  <div className="dashboard-rate-card">
                    <div className="dashboard-rate-top">
                      <div className="dashboard-rate-label-wrap">
                        <span>📛</span>
                        <span>退信率</span>
                      </div>
                      <div className="dashboard-rate-val-wrap">
                        <span className="dashboard-rate-val">{loading ? "-" : `${stats?.bounceRate || 0}%`}</span>
                        <span className="dashboard-rate-badge" style={{ background: (stats?.bounceRate || 0) === 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: (stats?.bounceRate || 0) === 0 ? "#10b981" : "#ef4444" }}>
                          {(stats?.bounceRate || 0) === 0 ? "零退信" : "预警"}
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-rate-track">
                      <div className="dashboard-rate-fill" style={{ width: `${stats?.bounceRate || 0}%`, background: (stats?.bounceRate || 0) === 0 ? "#10b981" : "#ef4444" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Module 2: 站内信 Card */}
          <section className="dashboard-channel-card dashboard-site-message-card">
            <div className="dashboard-section-heading">
              <div className="dashboard-channel-title">
                <span className="dashboard-channel-icon">💬</span>
                <div>
                  <h3>
                    站内信
                    <span className="dashboard-channel-status-dot" style={{ background: "#0ea5e9", boxShadow: "0 0 8px #0ea5e9" }} title="巡航中" />
                  </h3>
                  <p>目标网站联系表单自动匹配与提交</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("site-messages")}>
                查看执行任务 →
              </button>
            </div>

            <div className="dashboard-channel-body">
              {/* Primary Volume Counters Row */}
              <div className="dashboard-hero-counters dashboard-site-message-hero">
                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}>
                      🗂️
                    </div>
                    <div className="dashboard-hero-value">{loading ? "-" : siteMessageStats?.totalJobs || 0}</div>
                  </div>
                  <div className="dashboard-hero-label">自动任务数</div>
                </div>

                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" }}>
                      🌐
                    </div>
                    <div className="dashboard-hero-value">{loading ? "-" : siteMessageStats?.totalTargets || 0}</div>
                  </div>
                  <div className="dashboard-hero-label">覆盖目标网站</div>
                </div>
              </div>

              {/* Execution Funnel Section */}
              <div>
                <div className="dashboard-section-subtitle">
                  <span>执行状态分流 (Execution Breakdown)</span>
                </div>
                <div className="dashboard-funnel-list">
                  {/* Submitted Row */}
                  <div className="dashboard-funnel-row">
                    <div className="dashboard-funnel-left">
                      <div className="dashboard-funnel-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                        ✅
                      </div>
                      <span className="dashboard-funnel-name">已成功提交</span>
                    </div>
                    <div className="dashboard-funnel-right">
                      <span className="dashboard-funnel-count">{loading ? "-" : siteMessageStats?.totalSubmitted || 0}</span>
                      <span className="dashboard-funnel-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                        {(() => {
                          const total = (siteMessageStats?.totalSubmitted || 0) + (siteMessageStats?.totalSkipped || 0) + (siteMessageStats?.totalFailed || 0);
                          const pct = total > 0 ? Math.round(((siteMessageStats?.totalSubmitted || 0) / total) * 100) : 0;
                          return `${pct}%`;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Skipped Row */}
                  <div className="dashboard-funnel-row">
                    <div className="dashboard-funnel-left">
                      <div className="dashboard-funnel-icon" style={{ background: "rgba(100, 116, 139, 0.12)", color: "#64748b" }}>
                        ⏭️
                      </div>
                      <span className="dashboard-funnel-name">智能跳过 (验证码/机制保护)</span>
                    </div>
                    <div className="dashboard-funnel-right">
                      <span className="dashboard-funnel-count">{loading ? "-" : siteMessageStats?.totalSkipped || 0}</span>
                      <span className="dashboard-funnel-pill" style={{ background: "rgba(100, 116, 139, 0.15)", color: "#64748b" }}>
                        {(() => {
                          const total = (siteMessageStats?.totalSubmitted || 0) + (siteMessageStats?.totalSkipped || 0) + (siteMessageStats?.totalFailed || 0);
                          const pct = total > 0 ? Math.round(((siteMessageStats?.totalSkipped || 0) / total) * 100) : 0;
                          return `${pct}%`;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Failed Row */}
                  <div className="dashboard-funnel-row">
                    <div className="dashboard-funnel-left">
                      <div className="dashboard-funnel-icon" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
                        ⚠️
                      </div>
                      <span className="dashboard-funnel-name">执行失败/超时</span>
                    </div>
                    <div className="dashboard-funnel-right">
                      <span className="dashboard-funnel-count">{loading ? "-" : siteMessageStats?.totalFailed || 0}</span>
                      <span className="dashboard-funnel-pill" style={{ background: (siteMessageStats?.totalFailed || 0) === 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: (siteMessageStats?.totalFailed || 0) === 0 ? "#10b981" : "#ef4444" }}>
                        {(siteMessageStats?.totalFailed || 0) === 0 ? "0 失败" : "需检查"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Module 3: 全网线索挖掘 Card (演示数据) */}
          <section className="dashboard-channel-card dashboard-lead-mining-card">
            <div className="dashboard-section-heading">
              <div className="dashboard-channel-title">
                <span className="dashboard-channel-icon">🔍</span>
                <div>
                  <h3>
                    全网线索挖掘
                    <span className="dashboard-channel-status-dot" style={{ background: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }} title="演示数据" />
                  </h3>
                  <p>指定域名与搜索引擎邮箱、社媒、电话深度抓取</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("contacts")}>
                开启挖掘 →
              </button>
            </div>

            <div className="dashboard-channel-body">
              {/* Primary Volume Counters Row */}
              <div className="dashboard-hero-counters" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>
                      🔎
                    </div>
                    <div className="dashboard-hero-value">12</div>
                  </div>
                  <div className="dashboard-hero-label">挖掘任务</div>
                </div>

                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}>
                      🌐
                    </div>
                    <div className="dashboard-hero-value">1,480</div>
                  </div>
                  <div className="dashboard-hero-label">已扫描网页</div>
                </div>

                <div className="dashboard-hero-tile">
                  <div className="dashboard-hero-top-row">
                    <div className="dashboard-hero-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                      🎯
                    </div>
                    <div className="dashboard-hero-value">3,260</div>
                  </div>
                  <div className="dashboard-hero-label">线索总数</div>
                </div>
              </div>

              {/* Lead Channels Breakdown Section */}
              <div>
                <div className="dashboard-section-subtitle">
                  <span>线索抓取类型分流 (Channel Distribution)</span>
                </div>
                <div className="dashboard-funnel-list">
                  {/* Email Row */}
                  <div className="dashboard-funnel-row">
                    <div className="dashboard-funnel-left">
                      <div className="dashboard-funnel-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}>
                        ✉️
                      </div>
                      <span className="dashboard-funnel-name">企业 / 个人邮箱</span>
                    </div>
                    <div className="dashboard-funnel-right">
                      <span className="dashboard-funnel-count">2,150</span>
                      <span className="dashboard-funnel-pill" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                        66%
                      </span>
                    </div>
                  </div>

                  {/* Phone & WA Row */}
                  <div className="dashboard-funnel-row">
                    <div className="dashboard-funnel-left">
                      <div className="dashboard-funnel-icon" style={{ background: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" }}>
                        📱
                      </div>
                      <span className="dashboard-funnel-name">电话 / WhatsApp</span>
                    </div>
                    <div className="dashboard-funnel-right">
                      <span className="dashboard-funnel-count">680</span>
                      <span className="dashboard-funnel-pill" style={{ background: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" }}>
                        21%
                      </span>
                    </div>
                  </div>

                  {/* Social Media Row */}
                  <div className="dashboard-funnel-row">
                    <div className="dashboard-funnel-left">
                      <div className="dashboard-funnel-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>
                        🌐
                      </div>
                      <span className="dashboard-funnel-name">社媒主页 (LinkedIn/FB/X)</span>
                    </div>
                    <div className="dashboard-funnel-right">
                      <span className="dashboard-funnel-count">430</span>
                      <span className="dashboard-funnel-pill" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#d97706" }}>
                        13%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">快速操作</h3>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => onNavigate("send")}>
              <span>✈️</span> 立即发送邮件
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate("contacts")}>
              <span>👥</span> 导入联系人
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate("campaigns")}>
              <span>🚀</span> 新建营销活动
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate("site-messages")}>
              <span>💬</span> 新建站内信任务
            </button>
          </div>
        </div>

        {/* System Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">系统模块状态</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "用户认证", status: "active", label: "运行中" },
                { name: "联系人管理", status: "active", label: "运行中" },
                { name: "邮件模板", status: "active", label: "运行中" },
                { name: "营销活动", status: "active", label: "运行中" },
                { name: "站内信", status: "active", label: "运行中" },
                { name: "邮件发送队列", status: "active", label: "待配置 SES" },
                { name: "SERP 采集", status: "inactive", label: "即将推出" },
                { name: "网站爬取", status: "inactive", label: "即将推出" },
                { name: "邮箱采集", status: "inactive", label: "即将推出" },
              ].map((module, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: i < 8 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
                    {module.name}
                  </span>
                  <span
                    className={`badge ${
                      module.status === "active" ? "badge-success" : "badge-default"
                    }`}
                  >
                    <span
                      className={`status-dot ${module.status}`}
                      style={{ width: 6, height: 6 }}
                    ></span>
                    {module.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">近期活动</h3>
            </div>
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-icon">📭</div>
              <h3>暂无活动</h3>
              <p>创建你的第一个邮件营销活动</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
