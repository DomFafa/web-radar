import { useEffect, useRef, useState } from 'react';
import type { Language, Project } from '../shared/model';
import { api, errorMessage, privateAssetBlob, requestId } from './api';
import { Button, Icon, Notice } from './components';
import { labels } from '../templates/labels';

type Page = 'home' | 'catalog' | 'detail' | 'about' | 'contact';
const pages: Record<Page, string> = {
  home: '首页',
  catalog: '产品目录',
  detail: '产品详情',
  about: '公司介绍',
  contact: '联系询盘',
};
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export function privateAssetId(value: string, projectId: string): string | null {
  try {
    const url = new URL(value, 'https://preview.invalid');
    const match = url.pathname.match(/^\/api\/projects\/([^/]+)\/assets\/([^/]+)$/);
    return match && decodeURIComponent(match[1]) === projectId
      ? decodeURIComponent(match[2])
      : null;
  } catch {
    return null;
  }
}

export function SitePreview({ project, onClose }: { project: Project; onClose: () => void }) {
  const [lang, setLang] = useState<Language>('en'),
    [page, setPage] = useState<Page>('home'),
    [productId, setProductId] = useState(
      project.draft.primaryProductId || project.draft.products[0]?.id || '',
    );
  const [mobile, setMobile] = useState(false),
    [html, setHtml] = useState(''),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false),
    [retry, setRetry] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null),
    channel = useRef(requestId());
  const media = useRef<{ id: string; blob: Blob }[]>([]);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', key);
    };
  }, [onClose]);
  useEffect(() => {
    let active = true;
    const renderChannel = requestId();
    channel.current = renderChannel;
    media.current = [];
    setLoading(true);
    setError('');
    setHtml('');
    (async () => {
      const query = new URLSearchParams({
        lang,
        page,
        ...(page === 'detail' ? { productId } : {}),
      });
      const result = await api<{ html: string }>(
        `/api/projects/${encodeURIComponent(project.id)}/preview?${query}`,
      );
      const doc = new DOMParser().parseFromString(result.html, 'text/html');
      // Only trusted template styling and our tiny navigation bridge run inside the sandbox.
      doc
        .querySelectorAll(
          'script,base,meta[http-equiv="refresh"],meta[http-equiv="Content-Security-Policy"]',
        )
        .forEach((node) => node.remove());
      const targets = [...doc.querySelectorAll('[src],[poster]')];
      const ids = [
        ...new Set(
          targets.flatMap((node) =>
            ['src', 'poster']
              .map((attribute) => privateAssetId(node.getAttribute(attribute) || '', project.id))
              .filter((id): id is string => !!id),
          ),
        ),
      ];
      const items = await Promise.all(
        ids.map(async (id) => ({ id, blob: await privateAssetBlob(project.id, id) })),
      );
      if (!active) return;
      media.current = items;
      targets.forEach((node) => {
        for (const attribute of ['src', 'poster']) {
          const id = privateAssetId(node.getAttribute(attribute) || '', project.id);
          node.removeAttribute(attribute);
          if (id) node.setAttribute(`data-wr-${attribute}`, id);
        }
      });
      doc.querySelectorAll('form').forEach((form) => {
        form.removeAttribute('action');
        form
          .querySelectorAll('input,textarea,button,select')
          .forEach((control) => ((control as HTMLInputElement).disabled = true));
      });
      const nonce = requestId().replaceAll('-', '');
      const csp = doc.createElement('meta');
      csp.httpEquiv = 'Content-Security-Policy';
      csp.content = `default-src 'none'; img-src blob: data:; media-src blob:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src data:; base-uri 'none'; form-action 'none'`;
      doc.head.insertBefore(csp, doc.head.firstChild);
      const bridge = doc.createElement('script');
      bridge.setAttribute('nonce', nonce);
      bridge.textContent = `
        const video = document.getElementById('hero-video');
        const toggle = document.getElementById('video-toggle');
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        const videoLabels = ${scriptJson({ play: labels[lang].play, pause: labels[lang].pause })};
        function buttonState() {
          if (!toggle || !video) return;
          toggle.textContent = video.paused ? '▶' : 'Ⅱ';
          toggle.setAttribute('aria-label', video.paused ? videoLabels.play : videoLabels.pause);
        }
        function respectMotion() {
          document.body.classList.toggle('reduced-motion', motion.matches);
          if (video) { video.muted = true; if (motion.matches) video.pause(); else video.play().catch(() => {}); }
          buttonState();
        }
        motion.addEventListener('change', respectMotion);
        video?.addEventListener('play', buttonState);
        video?.addEventListener('pause', buttonState);
        toggle?.addEventListener('click', () => {
          if (!video) return;
          if (video.paused) { document.body.classList.remove('reduced-motion'); video.play().catch(() => {}); }
          else video.pause();
        });
        const mediaUrls = [];
        window.addEventListener('message', event => {
          if (event.source !== parent || event.origin !== ${scriptJson(window.location.origin)} ||
            event.data?.type !== 'wr:preview-media' || event.data.channel !== ${scriptJson(renderChannel)}) return;
          mediaUrls.forEach(url => URL.revokeObjectURL(url));
          mediaUrls.length = 0;
          const urls = new Map(event.data.items.map(item => {
            const url = URL.createObjectURL(item.blob); mediaUrls.push(url); return [item.id, url];
          }));
          document.querySelectorAll('[data-wr-src],[data-wr-poster]').forEach(node => {
            for (const attribute of ['src', 'poster']) {
              const url = urls.get(node.getAttribute('data-wr-' + attribute));
              if (url) node.setAttribute(attribute, url);
            }
          });
          if (video) video.load();
          respectMotion();
        });
        window.addEventListener('pagehide', () => mediaUrls.forEach(url => URL.revokeObjectURL(url)));
        parent.postMessage({type:'wr:preview-ready', channel:${scriptJson(renderChannel)}}, ${scriptJson(window.location.origin)});
        document.addEventListener('click', function(event) {
          const link = event.target.closest('a');
          if (!link) return;
          event.preventDefault();
          const page = link.dataset.wrPage || ${scriptJson(page)};
          if (link.dataset.wrPage || link.dataset.wrLang) parent.postMessage({
            type:'wr:preview-navigate', channel:${scriptJson(renderChannel)},
            page, lang:link.dataset.wrLang, productId:link.dataset.wrProductId || ${scriptJson(productId)}
          }, ${scriptJson(window.location.origin)});
        });
      `;
      doc.body.appendChild(bridge);
      setHtml('<!doctype html>' + doc.documentElement.outerHTML);
    })()
      .catch((error) => {
        if (active) setError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      media.current = [];
    };
  }, [project.id, project.version, lang, page, productId, retry]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== 'null' ||
        event.data?.channel !== channel.current
      )
        return;
      if (event.data.type === 'wr:preview-ready') {
        frame.current?.contentWindow?.postMessage(
          { type: 'wr:preview-media', channel: channel.current, items: media.current },
          '*',
        );
        return;
      }
      if (event.data.type !== 'wr:preview-navigate') return;
      const next = event.data;
      if (!(next.page in pages)) return;
      if (next.lang && project.draft.languages.includes(next.lang)) setLang(next.lang);
      if (next.productId && project.draft.products.some((product) => product.id === next.productId))
        setProductId(next.productId);
      setPage(next.page);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [project]);
  return (
    <div className="preview-overlay" role="dialog" aria-modal="true" aria-label="私有整站预览">
      <div className="preview-toolbar">
        <div>
          <span className="preview-lock">
            <Icon name="lock" />
          </span>
          <strong>私有整站预览</strong>
          <span className="muted">V{project.version}</span>
        </div>
        <div className="preview-route-controls">
          <select
            aria-label="预览语言"
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
          >
            {project.draft.languages.map((value) => (
              <option key={value} value={value}>
                {value.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            aria-label="预览页面"
            value={page}
            onChange={(e) => setPage(e.target.value as Page)}
          >
            {Object.entries(pages).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          {page === 'detail' && (
            <select
              aria-label="预览产品"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {project.draft.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <div className="segmented preview-device">
            <button className={!mobile ? 'selected' : ''} onClick={() => setMobile(false)}>
              桌面
            </button>
            <button className={mobile ? 'selected' : ''} onClick={() => setMobile(true)}>
              手机
            </button>
          </div>
          <Button kind="quiet" onClick={onClose} aria-label="关闭预览">
            <Icon name="close" />
          </Button>
        </div>
      </div>
      <div className="preview-note">
        <Icon name="lock" size={13} />
        仅授权成员可见 · 草稿素材通过当前登录安全读取 · 预览中的询盘表单不发送邮件
      </div>
      <div className={`preview-canvas ${mobile ? 'mobile' : ''}`}>
        {loading ? (
          <div className="preview-loading">
            <span className="spinner" />
            正在准备页面与私有素材…
          </div>
        ) : error ? (
          <div className="preview-error">
            <Notice tone="error">{error}</Notice>
            <Button onClick={() => setRetry((current) => current + 1)}>
              <Icon name="refresh" />
              重试预览
            </Button>
          </div>
        ) : (
          <iframe
            ref={frame}
            title={`${pages[page]} ${lang} 私有预览`}
            sandbox="allow-scripts"
            srcDoc={html}
          />
        )}
      </div>
    </div>
  );
}
