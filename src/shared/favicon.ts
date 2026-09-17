import type { Draft } from './model';

// Apply at render time so changing a tab icon never requires generating pages again.
export function withFavicon(html: string, draft: Draft, assetUrl: (id: string) => string): string {
  const id = draft.company.faviconAssetId;
  if (!id) return html;
  const href = assetUrl(id).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const tag = `<link rel="icon" href="${href}">`;
  const clean = html.replace(/<link\b[^>]*>/gi, link => {
    const rel = /\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(link);
    return rel && (rel[1] ?? rel[2] ?? rel[3]).toLowerCase().split(/\s+/).includes('icon') ? '' : link;
  });
  if (/<head\b[^>]*>/i.test(clean)) return clean.replace(/<head\b[^>]*>/i, head => head + tag);
  // Older generated files may omit an explicit head element.
  return clean.replace(/<html\b[^>]*>/i, root => root + `<head>${tag}</head>`);
}
