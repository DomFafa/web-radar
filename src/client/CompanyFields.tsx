import type { Company } from '../shared/model';
import { Field } from './components';

export function CompanyFields({
  value,
  disabled,
  onChange,
}: {
  value: Company;
  disabled: boolean;
  onChange: (patch: Partial<Company>) => void;
}) {
  return (
    <fieldset className="company-fields" disabled={disabled}>
      <p className="muted">
        仅公司 / 品牌名称和联系邮箱必填。以下资料用于网站公开展示，请使用可对外公开的信息。
      </p>
      <section className="company-field-group" aria-labelledby="company-identity-title">
        <h4 id="company-identity-title">基本信息</h4>
        <div className="form-grid">
          <Field label="公司 / 品牌名称" required hint="网站对外展示的名称，建议使用英文名称。">
            <input
              aria-label="公司 / 品牌名称"
              autoComplete="organization"
              value={value.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="例如：Evergreen"
              maxLength={160}
            />
          </Field>
          <Field label="业务类型" hint="用于组织公司介绍与服务文案。">
            <select
              aria-label="业务类型"
              value={value.type}
              onChange={(e) => onChange({ type: e.target.value as Company['type'] })}
            >
              <option value="trader">贸易 / 采购服务</option>
              <option value="factory">制造 / 工厂</option>
            </select>
          </Field>
        </div>
      </section>
      <section className="company-field-group" aria-labelledby="company-contact-title">
        <h4 id="company-contact-title">联系与询盘</h4>
        <div className="form-grid">
          <Field
            label="联系邮箱"
            required
            hint="在网站公开展示，同时用于接收询盘通知。发信服务在网站连接中配置。"
          >
            <input
              aria-label="联系邮箱"
              type="email"
              autoComplete="email"
              value={value.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="sales@yourcompany.com"
              maxLength={254}
            />
          </Field>
          <Field label="业务联系人（选填）" hint="可填写姓名或团队名称；留空时不展示联系人。">
            <input
              aria-label="业务联系人（选填）"
              autoComplete="name"
              value={value.contactName}
              onChange={(e) => onChange({ contactName: e.target.value })}
              placeholder="例如：Alex Chen / Sales Team"
              maxLength={100}
            />
          </Field>
          <Field label="联系电话（选填）" hint="包含国家区号；与 WhatsApp 可使用不同号码。">
            <input
              aria-label="联系电话（选填）"
              type="tel"
              autoComplete="tel"
              value={value.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="例如：+86 755 88888888"
              maxLength={60}
            />
          </Field>
          <Field label="WhatsApp（选填）" hint="填写已开通 WhatsApp 的号码，包含国家区号。">
            <input
              aria-label="WhatsApp（选填）"
              type="tel"
              value={value.whatsapp || ''}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              placeholder="例如：+86 13800000000"
              maxLength={60}
            />
          </Field>
          <Field
            className="full-width"
            label="公司地址（选填）"
            hint="填写可公开的办公或工厂地址，建议包含城市和国家。"
          >
            <input
              aria-label="公司地址（选填）"
              autoComplete="street-address"
              value={value.address || ''}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="例如：Shenzhen, Guangdong, China"
              maxLength={240}
            />
          </Field>
        </div>
      </section>
      <section className="company-field-group" aria-labelledby="company-story-title">
        <h4 id="company-story-title">公司介绍</h4>
        <div className="form-grid">
          <Field
            className="full-width"
            label="品牌一句话介绍（选填）"
            hint="简述主营产品或服务价值，供网站文案参考；生成后可单独调整首页标题。"
          >
            <input
              aria-label="品牌一句话介绍（选填）"
              value={value.slogan || ''}
              onChange={(e) => onChange({ slogan: e.target.value })}
              placeholder="例如：Custom packaging for growing brands"
              maxLength={160}
            />
          </Field>
          <Field
            className="full-width"
            label="公司简介（选填）"
            hint="说明主营业务、服务对象和实际优势。无需重复填写联系方式。"
          >
            <textarea
              aria-label="公司简介（选填）"
              rows={4}
              value={value.description}
              onChange={(e) => onChange({ description: e.target.value })}
              maxLength={20000}
              placeholder="我们提供哪些产品或服务？主要服务哪些客户？有哪些可以确认的优势？"
            />
          </Field>
        </div>
      </section>
      <details className="company-strengths">
        <summary>
          补充实力资料（选填）
          {value.establishedYear || value.certifications || value.capabilities
            ? ' · 已有填写内容'
            : ''}
        </summary>
        <p className="muted">
          有相关信息时再填写。仅使用实际可确认的资料，不会补写未提供的认证、产能或客户案例。
        </p>
        <div className="form-grid">
          <Field
            className="full-width"
            label="经营背景（选填）"
            hint="可填写成立时间或相关行业经验，避免将个人经验表述为公司年限。"
          >
            <input
              aria-label="经营背景（选填）"
              value={value.establishedYear || ''}
              onChange={(e) => onChange({ establishedYear: e.target.value })}
              placeholder="例如：Established in 2012"
              maxLength={60}
            />
          </Field>
          <Field
            className="full-width"
            label="资质与合规说明（选填）"
            hint="注明认证名称及适用公司或产品；没有认证可留空。"
          >
            <textarea
              aria-label="资质与合规说明（选填）"
              rows={2}
              value={value.certifications || ''}
              onChange={(e) => onChange({ certifications: e.target.value })}
              placeholder="填写实际持有的资质、认证及适用范围"
              maxLength={2000}
            />
          </Field>
          <Field
            className="full-width"
            label="定制与交付能力（选填）"
            hint="可补充定制方式、样品条件、起订量、交期等；以实际业务条件为准。"
          >
            <textarea
              aria-label="定制与交付能力（选填）"
              rows={3}
              value={value.capabilities || ''}
              onChange={(e) => onChange({ capabilities: e.target.value })}
              placeholder="例如：支持包装定制；样品条件与交期按产品确认"
              maxLength={2000}
            />
          </Field>
        </div>
      </details>
    </fieldset>
  );
}
