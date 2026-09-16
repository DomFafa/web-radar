import { execFileSync } from 'node:child_process';
import { EnvHttpProxyAgent, fetch as nodeFetch } from 'undici';

export function proxyEnvironment(env = process.env, platform = process.platform, readSystemProxy = () => execFileSync('scutil', ['--proxy'], { encoding: 'utf8' })) {
  const result = { ...env };
  if (!env.https_proxy && !env.HTTPS_PROXY && !env.http_proxy && !env.HTTP_PROXY && platform === 'darwin') {
    let settings = '';
    try { settings = readSystemProxy(); } catch { /* No system proxy: use direct networking. */ }
    const value = key => settings.match(new RegExp(`^\\s*${key}\\s*:\\s*(.+)$`, 'm'))?.[1].trim();
    const kind = value('HTTPSEnable') === '1' ? 'HTTPS' : value('HTTPEnable') === '1' ? 'HTTP' : null;
    if (kind) {
      const host = value(`${kind}Proxy`), port = Number(value(`${kind}Port`));
      if (host && /^[\w.:[\]-]+$/.test(host) && port > 0 && port <= 65535) {
        result.HTTPS_PROXY = result.HTTP_PROXY = `http://${host.includes(':') && !host.startsWith('[') ? `[${host}]` : host}:${port}`;
      }
    }
  }
  // Local services and the site builder must stay local, even with an HTTP proxy.
  result.NO_PROXY = [env.no_proxy || env.NO_PROXY || '', 'localhost', '127.0.0.1', '[::1]'].filter(Boolean).join(',');
  return result;
}

export function createOutboundService(env = proxyEnvironment()) {
  const dispatcher = new EnvHttpProxyAgent({
    httpProxy: env.http_proxy || env.HTTP_PROXY,
    httpsProxy: env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY,
    noProxy: env.NO_PROXY,
    connect: { timeout: 15_000 }, headersTimeout: 660_000, bodyTimeout: 660_000,
  });
  return {
    async fetch(request) {
      // Explicit fields bridge workerd's Request implementation to Node. Never log headers or bodies.
      const response = await nodeFetch(request.url, {
        dispatcher, method: request.method, headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        duplex: 'half', redirect: 'manual', signal: request.signal,
      });
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
    },
    close: () => dispatcher.close(),
  };
}
