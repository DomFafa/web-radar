import type { Secrets } from '../env';
import { ProviderError, type SiteBuildInput, type SiteBuildResult } from '../provider-contract';
import { requestJson } from './http';

export async function siteBuild(
  env: Secrets,
  id: string,
  input?: SiteBuildInput,
): Promise<SiteBuildResult> {
  if (!env.SITE_BUILDER_URL || !env.SITE_BUILDER_KEY)
    throw new ProviderError(
      'site_builder_unconfigured',
      '网站生成服务尚未配置，请联系管理员连接 screenshot-to-code 服务。',
    );
  let base: URL;
  try {
    base = new URL(env.SITE_BUILDER_URL);
  } catch {
    throw new ProviderError('site_builder_url', '网站生成服务地址无效');
  }
  if (
    base.protocol !== 'https:' &&
    !(
      base.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname) &&
      env.ENVIRONMENT !== 'production'
    )
  )
    throw new ProviderError('site_builder_url', '生产网站生成服务必须使用 HTTPS');
  const value = await requestJson(
    `${base.href.replace(/\/$/, '')}/v1/builds${input ? '' : `/${encodeURIComponent(id)}`}`,
    {
      method: input ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${env.SITE_BUILDER_KEY}`,
        'Content-Type': 'application/json',
      },
      ...(input ? { body: JSON.stringify({ id, ...input }) } : {}),
    },
    { provider: 'site-builder', mutation: false, maxBytes: 9 * 1024 * 1024 },
  );
  if (!value || !['pending', 'succeeded', 'failed'].includes(value.state))
    throw new ProviderError('site_builder_response', '网站生成服务返回无效状态');
  return {
    state: value.state,
    files: value.files,
    message: typeof value.message === 'string' ? value.message.slice(0, 500) : undefined,
    progress: typeof value.progress === 'string' ? value.progress.slice(0, 300) : undefined,
  };
}
