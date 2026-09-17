import type { Draft } from '../shared/model';
import { labels } from '../templates/labels';
import { siteFilePath } from './static-site';
const escape = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
/** One bounded factual completion pass. Explicit customization always takes precedence. */
export function completeSparseHome(
  draft: Draft,
  files: Record<string, string>,
  sparsePages: string[],
) {
  if (
    draft.cloneConfig?.enhancementMode === 'faithful' ||
    draft.cloneConfig?.instructions?.trim() ||
    !sparsePages.some((path) => /^[a-z]{2}\/index\.html$/.test(path))
  )
    return files;
  const next = { ...files };
  let changed = false;
  for (const lang of draft.languages) {
    const path = siteFilePath(lang, 'home'),
      html = files[path];
    if (!html || html.includes('data-wr-smart-completion')) continue;
    const products = draft.products.filter((product) => product.name.trim()).slice(0, 8);
    const t = labels[lang];
    const blocks: string[] = [];
    if (
      products.length &&
      !products.every((product) =>
        html.includes(escape(product.translations?.[lang]?.name || product.name)),
      )
    ) {
      blocks.push(
        `<section><h2>${escape(t.products)}</h2><div class="wr-completion-grid">${products.map((product) => `<article>${product.imageAssetId ? `<img src="__WR_ASSET_${escape(product.imageAssetId)}__" alt="${escape(product.translations?.[lang]?.name || product.name)}" loading="lazy">` : ''}<h3>${escape(product.translations?.[lang]?.name || product.name)}</h3><p>${escape(product.translations?.[lang]?.description || product.description)}</p><a href="/${siteFilePath(lang, 'detail', product.id)}" data-wr-page="detail" data-wr-product-id="${escape(product.id)}">${escape(t.details)}</a></article>`).join('')}</div></section>`,
      );
    }
    const email = draft.company.email.trim();
    if (email && !html.includes(escape(email)))
      blocks.push(
        `<section><h2>${escape(t.contact)}</h2><p>${escape(draft.company.name)}</p><a href="/${siteFilePath(lang, 'contact')}" data-wr-page="contact">${escape(email)}</a></section>`,
      );
    if (!blocks.length) continue;
    const addition = `<div class="wr-completion" data-wr-smart-completion>${blocks.join('')}</div>`;
    const css = `<style>.wr-completion{width:min(1120px,calc(100% - 40px));margin:48px auto;color:inherit}.wr-completion section{padding:32px 0}.wr-completion-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:24px}.wr-completion article{padding:20px;background:color-mix(in srgb,${draft.brandColor} 5%,white);border-radius:16px;overflow-wrap:anywhere}.wr-completion img{width:100%;height:180px;object-fit:contain}.wr-completion a{color:inherit}</style>`;
    next[path] = html
      .replace(/<\/head>/i, css + '</head>')
      .replace(/<footer\b|<\/body>/i, (match) => addition + match);
    changed = true;
  }
  const sizes = Object.values(next).map((html) => new TextEncoder().encode(html).length);
  return changed &&
    sizes.every((size) => size < 980000) &&
    sizes.reduce((a, b) => a + b, 0) <= 8 * 1024 * 1024
    ? next
    : files;
}
