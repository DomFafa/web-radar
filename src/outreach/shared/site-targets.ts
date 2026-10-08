export const MAX_SITE_TARGETS = 500;

export type SiteTarget = { url: string; host: string };

const privateIpv4 = (host: string) => /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);

function normalizeWebsite(raw: string): SiteTarget {
  const value = raw.trim();
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value) && !/^https?:\/\//i.test(value)) throw new Error('仅支持 HTTP/HTTPS 网站');
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error('网址格式不正确');
  url.hash = '';
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  const ipv6 = host.includes(':');
  const mapped = host.match(/^::ffff:([\da-f]+):([\da-f]+)$/i);
  const mappedIpv4 = mapped ? [parseInt(mapped[1], 16) >> 8, parseInt(mapped[1], 16) & 255, parseInt(mapped[2], 16) >> 8, parseInt(mapped[2], 16) & 255].join('.') : '';
  const blockedIpv6 = ipv6 && (host === '::' || host === '::1' || /^f[cd]/.test(host) || /^fe[89ab]/.test(host) || (mappedIpv4 && privateIpv4(mappedIpv4)));
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || blockedIpv6 || privateIpv4(host)) throw new Error('不允许访问本地或私有网络地址');
  if (!ipv6 && (!host.includes('.') || !host.split('.').every(label => /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label)))) throw new Error('请使用公网网站地址');
  return { url: url.toString(), host: host.replace(/^www\./, '') };
}

/** Shared by the form and routes: keep the first URL for each canonical domain. */
export function normalizeSiteTargets(input: unknown) {
  const rawTargets = Array.isArray(input) ? input : String(input || '').split(/[\n,;]+/);
  const normalized = new Map<string, SiteTarget>();
  const invalid: string[] = [];
  const duplicates: string[] = [];
  for (const raw of rawTargets) {
    const value = String(raw).trim();
    if (!value) continue;
    try {
      const target = normalizeWebsite(value);
      if (normalized.has(target.host)) duplicates.push(value);
      else normalized.set(target.host, target);
    } catch {
      invalid.push(value);
    }
  }
  return { normalized, invalid, duplicates };
}
