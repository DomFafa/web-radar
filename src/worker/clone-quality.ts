import { limitedBytes } from './providers/http';
import type { CloneConfig, Project } from '../shared/model';
import type { AppEnv } from './env';
import { renderCloneFiles, type CloneBundle } from './clone-service';
import { publicAssetReferences } from './domain';
import { siteFilePath } from './static-site';

type Quality = NonNullable<NonNullable<CloneConfig['generation']>['quality']>;
/** No model call. Missing/busy render service leaves a truthful, recoverable result. */
export async function reviewClone(
  env: AppEnv,
  project: Project,
  bundle: CloneBundle,
  image: (id: string) => Promise<string | null>,
  signal: AbortSignal,
): Promise<Quality> {
  if (!env.SITE_BUILDER_URL || !env.SITE_BUILDER_KEY)
    return { status: 'unavailable', message: '未配置多尺寸检查服务，请预览后确认。' };
  try {
    const base = new URL(env.SITE_BUILDER_URL);
    if (
      base.protocol !== 'https:' &&
      !(
        env.ENVIRONMENT !== 'production' &&
        base.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)
      )
    )
      throw Error('invalid service');
    const draft = { ...project.draft, cloneConfig: { ...project.draft.cloneConfig, ...bundle } };
    const all = renderCloneFiles(draft, {
      projectId: project.id,
      assetUrl: (id) => `__WR_ASSET_${id}__`,
      inquiryUrl: 'https://preview.invalid/inquiry',
    });
    const firstLang = draft.languages[0];
    const keys = [
      'home',
      'catalog',
      'about',
      'contact',
      ...(draft.products.length ? ['detail'] : []),
    ].map((page) => siteFilePath(firstLang, page, draft.primaryProductId));
    const files = Object.fromEntries(keys.filter((key) => all[key]).map((key) => [key, all[key]]));
    const assets: Record<string, string> = {},
      references: Record<string, string> = {};
    let bytes = 0;
    const read = async (id: string) => {
      const data = await image(id);
      if (data) {
        bytes += data.length;
        if (bytes > 12 * 1024 * 1024) throw Error('large references');
      }
      return data;
    };
    for (const id of new Set(publicAssetReferences(draft))) {
      if (!Object.values(files).some((html) => html.includes(`__WR_ASSET_${id}__`))) continue;
      const data = await read(id);
      if (data && /^data:image\/(png|jpeg|webp|gif);base64,/.test(data)) assets[id] = data;
    }
    for (const ref of draft.cloneConfig.uiImages ?? []) {
      if (ref.role === 'asset') continue;
      const key = siteFilePath(firstLang, ref.role, draft.primaryProductId);
      if (files[key] && !references[key]) {
        const data = await read(ref.assetId);
        if (data) references[key] = data;
      }
    }
    const response = await fetch(base.href.replace(/\/$/, '') + '/v1/clone-quality', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SITE_BUILDER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files, assets, references }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(95000)]),
      redirect: 'manual',
    });
    if (!response.ok) throw Error('render unavailable');
    const body = new TextDecoder().decode(await limitedBytes(response, 4 * 1024 * 1024));
    const report = JSON.parse(body) as {
      status: string;
      records: {
        path: string;
        width: number;
        height?: number;
        textLength?: number;
        issues: string[];
        warnings: string[];
      }[];
      widths: number[];
      sampledPages: number;
    };
    if (
      !['passed', 'issues'].includes(report.status) ||
      !Array.isArray(report.records) ||
      report.records.length > 30
    )
      throw Error('invalid report');
    const expected = new Set(
      Object.keys(files).flatMap((path) => [390, 1440, 2560].map((width) => `${path}@${width}`)),
    );
    if (
      report.sampledPages !== Object.keys(files).length ||
      JSON.stringify(report.widths) !== '[390,1440,2560]' ||
      report.records.length !== expected.size
    )
      throw Error('incomplete report');
    for (const row of report.records) {
      if (
        !expected.delete(`${row.path}@${row.width}`) ||
        !Array.isArray(row.issues) ||
        !Array.isArray(row.warnings) ||
        [...row.issues, ...row.warnings].some(
          (value) => typeof value !== 'string' || value.length > 500,
        )
      )
        throw Error('invalid report row');
    }
    report.status = report.records.some((row) => row.issues.length) ? 'issues' : 'passed';
    const reportKey = `projects/${project.id}/quality/${crypto.randomUUID()}.json`;
    await env.MEDIA.put(reportKey, JSON.stringify(report), {
      httpMetadata: { contentType: 'application/json' },
    });
    const issues = report.records
      .flatMap((row) => row.issues.map((issue) => `${row.path} / ${row.width}px：${issue}`))
      .slice(0, 12);
    const warnings = report.records
      .flatMap((row) => row.warnings.map((warning) => `${row.path} / ${row.width}px：${warning}`))
      .slice(0, 8);
    return {
      status: report.status as 'passed' | 'issues',
      reportKey,
      sampledPages: report.sampledPages,
      widths: report.widths,
      sparsePages: report.records
        .filter(
          (row) =>
            row.width === 1440 &&
            (row.height ?? Infinity) <= 1000 &&
            (row.textLength ?? Infinity) < 400,
        )
        .map((row) => row.path),
      issues,
      warnings,
      message:
        report.status === 'passed'
          ? '抽样页面通过多尺寸结构检查；仍需对照设计稿验收。'
          : '检测到布局或图片问题，已保留页面供预览，暂停自动发布。',
    };
  } catch (error) {
    signal.throwIfAborted();
    return {
      status: 'unavailable',
      message: '多尺寸检查服务暂不可用，页面已保存；请先预览再发布。',
    };
  }
}
