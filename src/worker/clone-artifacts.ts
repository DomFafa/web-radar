import type { CloneConfig, Draft } from '../shared/model';
import type { AppEnv } from './env';
import { requireCondition } from './domain';

const hash = async (body: string) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('');

export async function storeCloneOutput(
  env: Pick<AppEnv, 'MEDIA'>,
  projectId: string,
  config: CloneConfig,
): Promise<CloneConfig> {
  if (!config.generatedHtml && !config.generatedFiles) return config;
  const files =
    config.generatedFiles &&
    Object.fromEntries(
      Object.entries(config.generatedFiles).sort(([a], [b]) => a.localeCompare(b)),
    );
  // The home page is already present in files; avoid storing the same document twice.
  const body = JSON.stringify(files ? { files } : { html: config.generatedHtml });
  const bytes = new TextEncoder().encode(body).length;
  requireCondition(
    bytes <= 9 * 1024 * 1024,
    413,
    'clone_artifact_large',
    '生成页面超过存储限制，请减少页面或产品数量。',
  );
  const sha256 = await hash(body);
  const key = `projects/${projectId}/sites/clone-${sha256}.json`;
  await env.MEDIA.put(key, body, { httpMetadata: { contentType: 'application/json' } });
  const { generatedHtml, generatedFiles, ...rest } = config;
  return {
    ...rest,
    artifact: { key, sha256, bytes, pageCount: files ? Object.keys(files).length : 1 },
  };
}

export async function loadCloneOutput(
  env: Pick<AppEnv, 'MEDIA'>,
  projectId: string,
  draft: Draft,
): Promise<Draft> {
  const ref = draft.cloneConfig?.artifact;
  if (!ref) return draft;
  requireCondition(
    ref.key === `projects/${projectId}/sites/clone-${ref.sha256}.json`,
    403,
    'clone_artifact_scope',
    '页面文件不属于当前项目。',
  );
  const object = await env.MEDIA.get(ref.key);
  requireCondition(
    object,
    503,
    'clone_artifact_missing',
    '页面文件暂时不可用，请恢复备份或重新生成。',
  );
  const body = await new Response(object.body).text();
  requireCondition(
    new TextEncoder().encode(body).length === ref.bytes && (await hash(body)) === ref.sha256,
    503,
    'clone_artifact_integrity',
    '页面文件校验失败，请恢复备份。',
  );
  const value = JSON.parse(body) as { files?: Record<string, string>; html?: string };
  return {
    ...draft,
    cloneConfig: {
      ...draft.cloneConfig,
      generatedFiles: value.files,
      generatedHtml: value.html ?? value.files?.[`${draft.languages[0]}/index.html`],
    },
  };
}
