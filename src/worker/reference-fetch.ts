import { ApiError } from './http';

export function publicAddress(address: string): boolean {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (ip.includes(':')) {
    if (!/^[23][0-9a-f]{3}:/.test(ip) || ip.startsWith('2002:')) return false;
    const [first, second] = ip.split(':');
    return first !== '2001' || !(parseInt(second || '0', 16) <= 0x1ff || second === 'db8');
  }
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((x) => !Number.isInteger(x) || x < 0 || x > 255))
    return false;
  const [a, b, c] = parts;
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0)) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113)
  );
}
export async function assertPublicReference(
  url: URL,
  resolve = resolvePublicDns,
  signal?: AbortSignal,
): Promise<void> {
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !['80', '443'].includes(url.port))
  )
    throw new ApiError(400, 'reference_url_invalid', '参考网址必须是公开的 HTTP/HTTPS 网站。');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (
    host === 'localhost' ||
    (!host.includes('.') && !host.includes(':')) ||
    /\.(?:local|internal|localhost|test|invalid)$/.test(host)
  )
    throw new ApiError(400, 'reference_private_address', '不能读取本机或内网地址。');
  const addresses =
    /^[\d.]+$/.test(host) || host.includes(':') ? [host] : await resolve(host, signal);
  if (!addresses.length || addresses.some((ip) => !publicAddress(ip)))
    throw new ApiError(400, 'reference_private_address', '参考网址无法解析为安全的公网地址。');
}
async function resolvePublicDns(host: string, signal?: AbortSignal): Promise<string[]> {
  const responses = await Promise.all(
    ['A', 'AAAA'].map(async (type) => {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`,
        {
          headers: { Accept: 'application/dns-json' },
          redirect: 'manual',
          signal: AbortSignal.any([AbortSignal.timeout(5000), ...(signal ? [signal] : [])]),
        },
      );
      if (!response.ok)
        throw new ApiError(502, 'reference_dns_failed', '参考网站 DNS 查询失败，请稍后重试。');
      const data = (await response.json()) as { Answer?: { type: number; data: string }[] };
      return (data.Answer ?? []).filter((a) => a.type === 1 || a.type === 28).map((a) => a.data);
    }),
  );
  return responses.flat();
}
export async function fetchReferenceHtml(value: string): Promise<string> {
  let url = new URL(value);
  const signal = AbortSignal.timeout(15000);
  for (let redirects = 0; redirects <= 3; redirects++) {
    signal.throwIfAborted();
    await assertPublicReference(url, undefined, signal);
    const response = await fetch(url.href, {
      redirect: 'manual',
      signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'WebRadar-Reference/1.0',
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location) break;
      url = new URL(location, url);
      continue;
    }
    if (
      !response.ok ||
      !/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type') ?? '')
    ) {
      await response.body?.cancel();
      throw new ApiError(502, 'reference_not_html', '参考网站没有返回 HTML 页面。');
    }
    const reader = response.body?.getReader();
    if (!reader) return '';
    const decoder = new TextDecoder();
    let size = 0,
      html = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1024 * 1024)
          throw new ApiError(413, 'reference_large', '参考网页超过 1MB，请直接上传设计图。');
        html += decoder.decode(value, { stream: true });
      }
      return html + decoder.decode();
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }
  throw new ApiError(502, 'reference_redirects', '参考网站跳转过多，请使用最终页面网址。');
}

/** Bounded public fetch; redirects are revalidated and credentials are never forwarded. */
export async function fetchPublicReference(value: string, maximum: number, signal?: AbortSignal) {
  let url = new URL(value);
  const timeout = AbortSignal.any([AbortSignal.timeout(20000), ...(signal ? [signal] : [])]);
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicReference(url, undefined, timeout);
    const response = await fetch(url, {
      redirect: 'manual',
      signal: timeout,
      headers: { 'User-Agent': 'WebRadar-Reference/1.0' },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location) break;
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new ApiError(
        502,
        'reference_fetch_failed',
        `参考页面或素材返回 HTTP ${response.status}。`,
      );
    }
    const reader = response.body?.getReader();
    if (!reader) throw new ApiError(502, 'reference_empty', '参考内容为空。');
    const parts: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > maximum)
          throw new ApiError(413, 'reference_large', '参考内容超出采集大小限制。');
        parts.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.length;
    }
    return {
      url: url.href,
      bytes,
      type: (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(),
    };
  }
  throw new ApiError(502, 'reference_redirects', '参考地址跳转过多。');
}
