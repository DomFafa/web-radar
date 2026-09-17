import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type { Company, Draft } from './model';
export type SiteContacts = Required<Pick<Company, 'email' | 'phone' | 'whatsapp'>>;
export const siteContacts = (company: Company): SiteContacts => ({
  email: company.email,
  phone: company.phone || '',
  whatsapp: company.whatsapp || '',
});
export const designCompany = (company: Company) => ({
  ...company,
  faviconAssetId: undefined,
  email: undefined,
  phone: undefined,
  whatsapp: undefined,
});
/** Update editable contact text and links without rebuilding generated layout or touching code. */
export function withSiteContacts(html: string, draft: Draft): string {
  const source =
    draft.buildBranch === 'clone'
      ? draft.cloneConfig?.generation?.contacts
      : draft.siteDesign?.build?.contacts;
  if (!source) return html;
  const before: SiteContacts = {
    email: source.email,
    phone: source.phone || '',
    whatsapp: source.whatsapp || '',
  };
  const after = siteContacts(draft.company);
  const pairs = (Object.keys(after) as (keyof SiteContacts)[])
    .filter((k) => before[k] && before[k] !== after[k])
    .map((k) => [before[k], after[k]] as const);
  const adoptReferenceEmail =
    draft.buildBranch === 'clone' &&
    !!draft.cloneConfig?.referenceCapture &&
    !before.email &&
    !!after.email;
  if (!pairs.length && !adoptReferenceEmail) return html;
  const doc = parse(html);
  if (adoptReferenceEmail) {
    const collect = (node: DefaultTreeAdapterMap['node']) => {
      if ('tagName' in node) {
        const href = node.attrs.find((a) => a.name === 'href')?.value || '';
        const email = href.match(/^mailto:([^?]+)(?:\?|$)/i)?.[1];
        if (
          email &&
          /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) &&
          !pairs.some(([from]) => from === email)
        )
          pairs.push([email, after.email]);
      }
      if ('childNodes' in node) node.childNodes.forEach(collect);
    };
    collect(doc);
  }
  if (!pairs.length) return html;
  const digits = (value: string) => value.replace(/\D/g, '');
  const walk = (node: DefaultTreeAdapterMap['node']) => {
    if ('tagName' in node) {
      if (['script', 'style', 'noscript'].includes(node.tagName)) return;
      const href = node.attrs.find((a) => a.name === 'href');
      if (href) {
        let replacement: string | undefined;
        if (adoptReferenceEmail && /^mailto:/i.test(href.value))
          replacement = `mailto:${after.email}`;
        for (const key of ['email', 'phone', 'whatsapp'] as const) {
          if (!before[key] || before[key] === after[key]) continue;
          if (
            key === 'email' &&
            href.value.split('?')[0].toLowerCase() === `mailto:${before.email.toLowerCase()}`
          )
            replacement = after.email ? `mailto:${after.email}` : '';
          if (
            key === 'phone' &&
            href.value.startsWith('tel:') &&
            digits(href.value) === digits(before.phone)
          )
            replacement = after.phone ? `tel:${after.phone.replace(/[^+\d]/g, '')}` : '';
          if (key === 'whatsapp') {
            try {
              const u = new URL(href.value);
              if (
                (u.hostname === 'wa.me' && u.pathname.slice(1) === digits(before.whatsapp)) ||
                (u.hostname === 'api.whatsapp.com' &&
                  u.searchParams.get('phone') === digits(before.whatsapp))
              )
                replacement = after.whatsapp ? `https://wa.me/${digits(after.whatsapp)}` : '';
            } catch {}
          }
        }
        if (replacement !== undefined) {
          if (replacement) href.value = replacement;
          else node.attrs = node.attrs.filter((a) => a !== href);
        }
      }
    }
    if (node.nodeName === '#text') {
      const text = node as DefaultTreeAdapterMap['textNode'];
      // A single substitution pass prevents cascading replacements when two fields swap values.
      const pattern = new RegExp(
        pairs
          .map(([from]) => from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .sort((a, b) => b.length - a.length)
          .join('|'),
        'g',
      );
      text.value = text.value.replace(
        pattern,
        (match) => pairs.find(([from]) => from === match)?.[1] ?? match,
      );
    }
    if ('childNodes' in node) node.childNodes.forEach(walk);
  };
  walk(doc);
  return serialize(doc);
}
