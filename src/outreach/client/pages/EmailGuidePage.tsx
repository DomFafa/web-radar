/** @jsxImportSource react */
import React from "react";

export function EmailGuidePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="email-guide-page">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>📖 邮件发送使用指南</h2>
            <p>从准备联系人到查看发送结果的完整操作说明</p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate("send")}>开始发送邮件</button>
        </div>
      </div>

      <div className="page-body email-guide-content">
        <section className="email-guide-intro">
          <div>
            <span className="badge badge-success">发信环境已配置</span>
            <h3>发送前只需要准备联系人和邮件内容</h3>
            <p>系统已经配置并验证发信域名 <strong>wuyueer.com</strong>，客户无需配置 Mailchimp 或 DNS。</p>
          </div>
          <div className="email-guide-time"><strong>约 3 分钟</strong><span>完成一次发送</span></div>
        </section>

        <section className="email-guide-steps" aria-label="邮件发送步骤">
          <article>
            <span className="email-guide-number">1</span>
            <div><h3>导入联系人</h3><p>进入“联系人”，上传 CSV 或 Excel (.xlsx) 文件。建议先下载标准模板，填写邮箱、名称、公司、网站、行业、地区和标签。</p><button className="btn btn-secondary btn-sm" onClick={() => onNavigate("contacts")}>前往联系人</button></div>
          </article>
          <article>
            <span className="email-guide-number">2</span>
            <div><h3>准备邮件模板</h3><p>进入“邮件模板”，新建自己的模板，或从内置模板中选择“编辑并保存”。发送中心只会使用“我的模板”。</p><button className="btn btn-secondary btn-sm" onClick={() => onNavigate("templates")}>前往邮件模板</button></div>
          </article>
          <article>
            <span className="email-guide-number">3</span>
            <div><h3>选择收件人</h3><p>在发送中心按分组、标签或单独联系人选择收件人，三种方式选择任意一种即可。系统会在发送时自动去重并排除已退订联系人。</p></div>
          </article>
          <article>
            <span className="email-guide-number">4</span>
            <div><h3>选择邮件并确认</h3><p>选择“我的模板”，检查主题、发件人名称和回复地址。发件人邮箱可选择 uh@wuyueer.com，也可填写其他 @wuyueer.com 地址。</p></div>
          </article>
          <article>
            <span className="email-guide-number">5</span>
            <div><h3>发送并查看结果</h3><p>确认后邮件进入发送队列。在“营销活动”中可以查看每位收件人的发送状态，以及送达、打开、点击和退信数据。</p><button className="btn btn-secondary btn-sm" onClick={() => onNavigate("campaigns")}>查看营销活动</button></div>
          </article>
        </section>

        <section className="card email-guide-notes">
          <h3>导入与发送注意事项</h3>
          <div className="email-guide-note-grid">
            <div><strong>联系人许可</strong><p>只向已获得许可的联系人发送邮件，退订联系人不会进入发送队列。</p></div>
            <div><strong>文件格式</strong><p>CSV 建议使用 UTF-8；Excel 使用 .xlsx。邮箱为必填列，其余信息可选。</p></div>
            <div><strong>图片与链接</strong><p>发送前确认图片能够公开访问，按钮和正文链接指向正确页面。</p></div>
            <div><strong>结果延迟</strong><p>打开、点击和退信事件由服务商异步回传，统计数据可能稍有延迟。</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
