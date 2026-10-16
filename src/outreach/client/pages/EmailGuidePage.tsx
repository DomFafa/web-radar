/** @jsxImportSource react */
import React from "react";
import { useAuth } from "../App";

export function EmailGuidePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const writable = !!user && ['admin', 'member'].includes(user.role);
  return (
    <div className="email-guide-page">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>📖 邮件发送使用指南</h2>
            <p>从准备联系人到查看发送结果的完整操作说明</p>
          </div>
          {writable && <button className="btn btn-primary" onClick={() => onNavigate("send")}>开始准备邮件</button>}
        </div>
      </div>

      <div className="page-body email-guide-content">
        <section className="email-guide-intro">
          <div>
            <span className="badge badge-info">先检查，再发送</span>
            <h3>从发送邮件开始，按三步完成准备</h3>
            <p>发送页面会检查当前工作区的可用发信域名。尚未配置或检查失败时，请联系工作区管理员；你仍可先准备联系人和邮件内容。</p>
          </div>
          <div className="email-guide-time"><strong>3 步</strong><span>选择客户 · 准备邮件 · 预览确认</span></div>
        </section>

        <section className="email-guide-steps" aria-label="邮件发送步骤">
          <article>
            <span className="email-guide-number">1</span>
            <div><h3>选择客户</h3><p>按分组、标签或指定联系人选择一种方式。没有联系人时，可先上传 CSV 或 Excel (.xlsx)，邮箱为必填列。系统会去重并排除已退订联系人。</p><button className="btn btn-secondary btn-sm" onClick={() => onNavigate("contacts")}>查看联系人</button></div>
          </article>
          <article>
            <span className="email-guide-number">2</span>
            <div><h3>准备邮件</h3><p>选择已有邮件，或在发送页面直接新建模板，保存后继续当前步骤。内置模板可按中文场景浏览，使用前请改成自己的公司资料，并检查主题、图片和链接。</p><button className="btn btn-secondary btn-sm" onClick={() => onNavigate("templates")}>浏览邮件模板</button></div>
          </article>
          <article>
            <span className="email-guide-number">3</span>
            <div><h3>预览并确认</h3><p>检查客户范围、邮件主题和正文，填写客户看到的发件人名称，并使用已验证域名下的邮箱。只有点击“确认发送”后才会提交发送队列，发出后无法撤回。</p></div>
          </article>
        </section>

        <section className="card email-guide-notes">
          <h3>发送后，去哪里看</h3>
          <p>在发送记录查看任务和每位客户的处理状态、下载报表。提交超时或进度暂时无法更新时，先查看原任务，避免重复发送。</p>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("campaigns")}>查看发送记录</button>
          <div className="email-guide-note-grid">
            <div><strong>联系人许可</strong><p>只向已获得许可的联系人发送邮件，退订联系人不会进入发送队列。</p></div>
            <div><strong>文件格式</strong><p>CSV 建议使用 UTF-8；Excel 使用 .xlsx。邮箱为必填列，其余信息可选。</p></div>
            <div><strong>图片与链接</strong><p>发送前确认图片能够公开访问，按钮和正文链接指向正确页面。</p></div>
            <div><strong>客户回复</strong><p>自动追踪回复需要管理员启用收信配置；未启用时使用填写的固定回复邮箱。已启用的新任务可在客户管理系统的客户回复查看回复，历史数据不会自动补齐。</p></div>
            <div><strong>结果延迟</strong><p>“处理完成”不代表全部送达。打开、点击和退信事件由服务商异步回传，统计取决于帐号和追踪配置。</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
