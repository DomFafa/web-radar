import { Buffer } from 'node:buffer';
import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import type { AppEnv } from './env';
import type { Asset, CloneConfig, Project, CloneUiImage } from '../shared/model';
import { DomainStore } from './domain-store';
import { ApiError } from './http';
import { assertPublicReference, fetchPublicReference } from './reference-fetch';

type Node = DefaultTreeAdapterMap['node'];
const elements = (n: Node): DefaultTreeAdapterMap['element'][] =>
  'childNodes' in n
    ? n.childNodes.flatMap((c) => ('tagName' in c ? [c, ...elements(c)] : elements(c)))
    : [];
const attr = (n: DefaultTreeAdapterMap['element'], k: string) =>
  n.attrs.find((a) => a.name === k)?.value || '';
const urlOf = (value: string, base: string) => {
  try {
    const u = new URL(value, base);
    return /^https?:$/.test(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
};
export function referenceInventory(html: string, base: string) {
  const doc = parse(html),
    nodes = elements(doc);
  const resources = new Set<string>(),
    styles = new Set<string>();
  const pages: { url: string; role: CloneUiImage['role'] }[] = [];
  for (const n of nodes) {
    if (n.tagName === 'link' && attr(n, 'rel').includes('stylesheet'))
      styles.add(urlOf(attr(n, 'href'), base));
    if (['img', 'video', 'source', 'script', 'link'].includes(n.tagName))
      for (const k of ['src', 'poster', 'data-src', 'href'])
        if (attr(n, k)) resources.add(urlOf(attr(n, k), base));
    for (const key of ['srcset', 'data-srcset'])
      for (const candidate of attr(n, key).split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        if (value) resources.add(urlOf(value, base));
      }
    for (const m of (attr(n, 'style') + ' ' + (n.tagName === 'style' ? serialize(n) : '')).matchAll(
      /url\(["']?([^\s)'"<>]+)["']?\)/gi,
    ))
      resources.add(urlOf(m[1], base));
    if (n.tagName === 'a') {
      const u = urlOf(attr(n, 'href'), base);
      if (!u || new URL(u).origin !== new URL(base).origin) continue;
      const label = serialize(n).replace(/<[^>]+>/g, ' ') + ' ' + new URL(u).pathname;
      const role = /about|company|关于/i.test(label)
        ? 'about'
        : /contact|联系/i.test(label)
          ? 'contact'
          : /products|catalog|collection|shop|产品/i.test(label)
            ? 'catalog'
            : undefined;
      if (
        role &&
        !pages.some((p) => p.role === role) &&
        new URL(u).pathname !== new URL(base).pathname
      )
        pages.push({ url: u.split('#')[0], role });
    }
  }
  // Reference scripts are executed only by the isolated renderer, never included as model instructions or output scripts.
  const strip = (n: Node) => {
    if ('childNodes' in n) {
      n.childNodes = n.childNodes.filter(
        (c) => !('tagName' in c && ['script', 'iframe', 'noscript'].includes(c.tagName)),
      );
      n.childNodes.forEach(strip);
    }
  };
  strip(doc);
  return {
    resources: [...resources].filter(Boolean),
    styles: [...styles].filter(Boolean),
    pages: pages.slice(0, 3),
    html: serialize(doc),
  };
}
const validMedia = (type: string, b: Uint8Array) => {
  const word = (a: number, z: number) => String.fromCharCode(...b.slice(a, z));
  return type === 'image/png'
    ? b[0] === 137 && word(1, 4) === 'PNG'
    : type === 'image/jpeg'
      ? b[0] === 255 && b[1] === 216 && b[2] === 255
      : type === 'image/webp'
        ? word(0, 4) === 'RIFF' && word(8, 12) === 'WEBP'
        : type === 'image/gif'
          ? word(0, 3) === 'GIF'
          : type === 'video/mp4'
            ? word(4, 8) === 'ftyp'
            : type === 'video/webm'
              ? b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3
              : false;
};
export class ReferencePaused extends Error {}
export async function captureReference(
  env: AppEnv,
  store: DomainStore,
  project: Project,
  signal: AbortSignal,
  progress: (count: number) => Promise<void>,
  lock: <T>(f: () => Promise<T>) => Promise<T>,
): Promise<CloneConfig> {
  signal = AbortSignal.any([signal, AbortSignal.timeout(240000)]);
  const config = project.draft.cloneConfig!;
  const account = env.CLOUDFLARE_ACCOUNT_ID,
    token = env.CLOUDFLARE_API_TOKEN;
  if (!account || !token)
    throw new ApiError(
      503,
      'reference_browser_missing',
      '网址分析服务未配置，请管理员配置 Cloudflare Browser Rendering 账号。',
    );
  const warnings: string[] = [],
    screens: CloneUiImage[] = [],
    media: NonNullable<CloneConfig['referenceCapture']>['assets'] = [],
    contexts: string[] = [];
  const save = async (bytes: Uint8Array, type: string, name: string) => {
    signal.throwIfAborted();
    const id = crypto.randomUUID();
    const asset: Asset = {
      id,
      projectId: project.id,
      key: `projects/${project.id}/reference/${id}`,
      contentType: type,
      size: bytes.length,
      filename: name,
      origin: 'import',
      createdAt: new Date().toISOString(),
    };
    if (!validMedia(type, bytes))
      throw new ApiError(502, 'reference_media_invalid', '参考素材格式无法验证。');
    await env.MEDIA.put(asset.key, bytes, { httpMetadata: { contentType: type } });
    try {
      await lock(async () => {
        if (!(await store.one<Project>('projects', project.id)))
          throw new ApiError(404, 'project_not_found', '项目已删除。');
        await store.insert('assets', asset).run();
      });
    } catch (e) {
      await env.MEDIA.delete(asset.key);
      throw e;
    }
    return id;
  };
  const pending: { url: string; role: CloneUiImage['role'] }[] = [
    { url: config.targetUrl!, role: 'home' },
  ];
  const imported = new Set<string>();
  let totalBytes = 0,
    mediaAttempts = 0;
  for (let p = 0; p < pending.length; p++) {
    await progress(screens.length);
    signal.throwIfAborted();
    const page = pending[p];
    try {
      const source = await fetchPublicReference(page.url, 1024 * 1024, signal);
      if (!/html/.test(source.type))
        throw new ApiError(400, 'reference_not_html', '目标网址未返回网页。');
      const html = new TextDecoder().decode(source.bytes),
        inventory = referenceInventory(html, source.url);
      const capturedStyles = new Map<string, string>();
      const readStyle = async (link: string) => {
        if (capturedStyles.has(link)) return;
        const r = await fetchPublicReference(link, 300000, signal);
        if (r.type !== 'text/css') return;
        const text = new TextDecoder().decode(r.bytes);
        capturedStyles.set(link, text);
        for (const m of text.matchAll(/url\(["']?([^\s)'"<>]+)["']?\)/gi))
          inventory.resources.push(urlOf(m[1], r.url));
      };
      for (const link of inventory.styles.slice(0, 4)) {
        try {
          await readStyle(link);
        } catch {
          signal.throwIfAborted();
          warnings.push('部分外部样式无法采集');
        }
      }
      const origins = new Set([new URL(source.url).origin]);
      for (const origin of [
        ...new Set(inventory.resources.filter(Boolean).map((r) => new URL(r).origin)),
      ].slice(0, 24)) {
        if (origins.has(origin)) continue;
        try {
          await assertPublicReference(new URL(origin), undefined, signal);
          origins.add(origin);
        } catch {
          signal.throwIfAborted();
        }
      }
      const allowRequestPattern = [...origins].map(
        (origin) => '^' + origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:/|$)',
      );
      const widths = p === 0 ? [1440, 390] : [1440];
      let capturedHtml = html;
      for (const width of widths) {
        signal.throwIfAborted();
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/browser-rendering/snapshot`,
          {
            method: 'POST',
            redirect: 'manual',
            signal: AbortSignal.any([signal, AbortSignal.timeout(65000)]),
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: source.url,
              allowRequestPattern,
              viewport: { width, height: 1000, deviceScaleFactor: 1 },
              screenshotOptions: { type: 'jpeg', quality: 80, fullPage: true },
              gotoOptions: { waitUntil: 'networkidle2', timeout: 25000 },
              waitForTimeout: 1200,
            }),
          },
        );
        if (!response.ok)
          throw new ApiError(
            502,
            'reference_browser_failed',
            `网页视觉采集返回 HTTP ${response.status}，请检查 Browser Rendering 权限或稍后重试。`,
          );
        // API response is bounded before decoding screenshots.
        const reader = response.body!.getReader();
        let raw = '',
          size = 0;
        const decoder = new TextDecoder();
        try {
          for (;;) {
            const r = await reader.read();
            if (r.done) break;
            size += r.value.length;
            if (size > 12 * 1024 * 1024)
              throw new ApiError(413, 'reference_snapshot_large', '网页截图过大。');
            raw += decoder.decode(r.value, { stream: true });
          }
          raw += decoder.decode();
        } finally {
          await reader.cancel().catch(() => {});
        }
        const data = JSON.parse(raw) as {
          success: boolean;
          result?: { content?: string; screenshot?: string };
        };
        if (!data.success || !data.result?.screenshot || !data.result.content)
          throw new ApiError(
            502,
            'reference_snapshot_empty',
            '网页截图或内容为空，未开始模型生成。',
          );
        capturedHtml = data.result.content;
        if (/<title[^>]*>\s*(?:Just a moment|Access Denied|Attention Required)/i.test(capturedHtml))
          throw new ApiError(
            422,
            'reference_access_blocked',
            '目标网站要求验证或限制访问，无法读取真实页面。',
          );
        const bytes = new Uint8Array(
          Buffer.from(data.result.screenshot.replace(/^data:image\/jpeg;base64,/, ''), 'base64'),
        );
        const id = await save(bytes, 'image/jpeg', `${page.role}-${width}.jpg`);
        screens.push({
          id: `reference-${id}`,
          assetId: id,
          name: `${page.role}-${width}.jpg`,
          role: page.role,
          roleSource: 'auto',
        });
        await progress(screens.length);
      }
      const rendered = referenceInventory(capturedHtml, source.url);
      if (p === 0) pending.push(...rendered.pages);
      let css = [...capturedStyles.values()].join('\n');
      for (const link of [...new Set([...inventory.styles, ...rendered.styles])].slice(0, 4)) {
        if (capturedStyles.has(link)) continue;
        try {
          const r = await fetchPublicReference(link, 300000, signal);
          if (r.type === 'text/css') {
            const text = new TextDecoder().decode(r.bytes);
            css += text;
            for (const m of text.matchAll(/url\(["']?([^\s)'"<>]+)["']?\)/gi))
              rendered.resources.push(urlOf(m[1], r.url));
          }
        } catch {
          warnings.push('部分外部样式无法采集');
        }
      }
      for (const url of [...new Set([...rendered.resources, ...inventory.resources])].filter(
        Boolean,
      )) {
        if (imported.has(url)) continue;
        if (media.length >= 24 || mediaAttempts >= 48 || totalBytes >= 48 * 1024 * 1024) {
          warnings.push('素材已达到采集上限，请在预览中检查图片和视频');
          break;
        }
        imported.add(url);
        if (/\.(?:js|css|woff2?|ttf|ico|svg)(?:[?#]|$)/i.test(url)) continue;
        mediaAttempts++;
        await progress(screens.length);
        try {
          const r = await fetchPublicReference(url, 24 * 1024 * 1024, signal);
          if (!validMedia(r.type, r.bytes)) continue;
          totalBytes += r.bytes.length;
          if (totalBytes > 48 * 1024 * 1024) break;
          const assetId = await save(
            r.bytes,
            r.type,
            new URL(r.url).pathname.split('/').pop()?.slice(0, 180) || 'reference-media',
          );
          media.push({ assetId, url, contentType: r.type });
        } catch {
          signal.throwIfAborted();
          warnings.push('部分参考素材无法导入，将在预览中检查');
        }
      }
      contexts.push(
        JSON.stringify({
          role: page.role,
          url: source.url,
          html: rendered.html.slice(0, 50000),
          css: css.slice(0, 45000),
        }),
      );
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof ReferencePaused || p === 0) throw error;
      warnings.push(`${page.role} 页面采集失败，按首页风格生成该页`);
    }
  }
  if (!screens.length)
    throw new ApiError(502, 'reference_capture_empty', '未取得可用的参考网页截图。');
  signal.throwIfAborted();
  const key = `projects/${project.id}/reference/${crypto.randomUUID()}.json`;
  await env.MEDIA.put(key, JSON.stringify({ context: contexts.join('\n').slice(0, 180000) }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return {
    ...config,
    uiImages: [...screens, ...(config.uiImages || [])],
    referenceCapture: {
      url: config.targetUrl!,
      contextKey: key,
      assets: media,
      pageCount: contexts.length,
      screenshotCount: screens.length,
      warnings: [...new Set(warnings)],
      capturedAt: new Date().toISOString(),
    },
  };
}
