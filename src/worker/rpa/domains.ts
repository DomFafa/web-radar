// Keep the same input and Excel identity contract as integrations/web-radar/domains.mjs.
export type DomainRow = { domain: string; company: string; country: string; company_inferred: boolean };
export const MAX_DOMAINS = 100;

export function normalizeRows(payload: unknown): DomainRow[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new TypeError('任务必须是对象。');
  const data = payload as Record<string, unknown>;
  const raw = data.domains ?? (data.domain === undefined ? undefined : [data.domain]);
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_DOMAINS)
    throw new TypeError(`请输入 1–${MAX_DOMAINS} 个域名。`);
  const seen = new Set<string>();
  const companies = new Set<string>();
  function cell(value: unknown, field: string): string {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value !== 'string' || value.length > 200 || /[\x00-\x1f]/.test(value))
      throw new TypeError(`${field} 必须是 200 字以内的文本。`);
    const trimmed = value.trim();
    if (/^[=+@-]/.test(trimmed)) throw new TypeError(`${field} 不能包含 Excel 公式。`);
    return trimmed;
  }
  return raw.map((item: unknown) => {
    const value = typeof item === 'string' ? { domain: item } : item;
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('域名行格式错误。');
    const entry = value as Record<string, unknown>;
    if (typeof entry.domain !== 'string') throw new TypeError('域名必须是字符串。');
    const domain = entry.domain.trim().toLowerCase().replace(/\.$/, '');
    if (!domain || domain.length > 253 || /[\s/:?#@\\]/.test(domain) ||
      /^(?:\d+\.){3}\d+$/.test(domain) || domain.split('.').length < 2 ||
      domain.split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)))
      throw new TypeError(`域名无效：${domain.slice(0, 253)}。请输入纯域名（国际域名使用 punycode）。`);
    if (seen.has(domain)) throw new TypeError(`域名重复：${domain}`);
    seen.add(domain);
    const providedCompany = cell(entry.company, '公司名');
    const company = providedCompany || domain;
    if (companies.has(company.toLowerCase())) throw new TypeError('同批次公司名称不能重复，13 工作表无法区分联系人归属。');
    companies.add(company.toLowerCase());
    return { domain, company, country: cell(entry.country, '国家'), company_inferred: !providedCompany };
  });
}
