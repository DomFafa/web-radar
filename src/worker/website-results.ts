import type { Asset, Project } from '../shared/model';
import { plannedPages } from '../shared/site-brief';
import { renderSite, type RenderOptions } from '../templates';
import { assetReferences, requireCondition } from './domain';
import type { AppEnv } from './env';
import { siteFilePath } from './static-site';

export interface WebsiteResult { project: Project; pages: Record<string, string>; assets: Asset[] }
const resultBase = (id: string, version: number) => `website-results/${id}/${version}`;

/** Render every delivered page before a website can be settled. No public publication occurs. */
export async function renderWebsiteResult(project: Project, render: (options: RenderOptions) => Promise<string> | string = options => renderSite(project.draft, options)): Promise<Record<string, string>> {
  const pages: Record<string, string> = {};
  const draft = project.draft;
  for (const lang of draft.languages) {
    for (const page of plannedPages(draft)) {
      const products = page === 'detail' ? draft.products : [draft.products.find(p => p.id === draft.primaryProductId) || draft.products[0]];
      for (const product of products) {
        const html = await render({projectId: project.id, lang, page, productId: product?.id,
          assetUrl: id => `/api/web-radar/projects/${project.id}/assets/${encodeURIComponent(id)}?expectedVersion=${project.version}`,
          inquiryUrl: '#', preview: true});
        requireCondition(typeof html === 'string' && /<html[\s>]/i.test(html) && html.length > 50, 502, 'website_preview_invalid', '网站预览尚未生成完整，请重试。');
        pages[siteFilePath(lang, page, product?.id)] = html;
      }
    }
  }
  requireCondition(Object.keys(pages).length > 0, 502, 'website_preview_invalid', '网站预览尚未生成完整，请重试。');
  return pages;
}

/** The billed version owns its media so later edits/deletion cannot change its receipt. */
export async function saveWebsiteResult(env: AppEnv, project: Project, pages: Record<string, string>, assets: Asset[]): Promise<string> {
  const key = resultBase(project.id, project.version) + '/result.json';
  const references = new Set(assetReferences(project.draft));
  const archived: Asset[] = [];
  for (const id of references) {
    const asset = assets.find(item => item.id === id);
    requireCondition(asset, 409, 'website_result_asset_missing', '网站素材尚未完整保存，请重试。');
    const object = await env.MEDIA.get(asset.key);
    requireCondition(object, 409, 'website_result_asset_missing', '网站素材尚未完整保存，请重试。');
    const copy = {...asset, key: resultBase(project.id, project.version) + '/assets/' + asset.id};
    await env.MEDIA.put(copy.key, await object.arrayBuffer(), {httpMetadata: {contentType: asset.contentType}});
    archived.push(copy);
  }
  await env.MEDIA.put(key, JSON.stringify({project, pages, assets: archived} satisfies WebsiteResult), {httpMetadata: {contentType: 'application/json'}});
  return key;
}

export async function loadWebsiteResult(env: AppEnv, projectId: string, version: number): Promise<WebsiteResult | undefined> {
  requireCondition(Number.isSafeInteger(version) && version > 0, 400, 'invalid_version', '网站版本无效。');
  const object = await env.MEDIA.get(resultBase(projectId, version) + '/result.json');
  return object ? JSON.parse(await object.text()) as WebsiteResult : undefined;
}
