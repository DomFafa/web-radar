import type { Secrets } from '../env';
import { testMode } from '../env';
import type { ProviderSet } from '../provider-contract';
import { generateScript, generateCopy } from './text';
import { generateImage, generatePageDesign } from './image';
import { siteBuild } from './site-builder';
import { agnesConfigured, submitVideo, pollVideo } from './agnes';
import { pagesConfigured, publishPages, resolveHostingTarget } from './pages';
import { sendInquiry } from './email';
import { fixtureProviders } from './fixtures';
import { consult } from './consultation';
export function createProviders(env: Secrets): ProviderSet {
  if (testMode(env)) return fixtureProviders(env);
  const config: [string, boolean, string][] = [
    [
      'text',
      Boolean(env.TEXT_API_KEY && env.TEXT_API_BASE_URL && env.TEXT_MODEL),
      '独立文字服务配置；需真实验收',
    ],
    [
      'image',
      Boolean(
        env.IMAGE_API_KEY &&
        env.IMAGE_API_BASE_URL &&
        (!env.IMAGE_MODEL || env.IMAGE_MODEL === 'gpt-image-2.5-sunburst'),
      ),
      '专用 Image 2.5 key；需真实验收',
    ],
    ['agnes', agnesConfigured(env), 'Agnes Video V2.0 已知接口契约；需真实验收'],
    [
      'site-builder',
      Boolean(env.SITE_BUILDER_URL && env.SITE_BUILDER_KEY),
      'screenshot-to-code 静态网站生成服务',
    ],
    ['pages', pagesConfigured(env), 'Cloudflare Pages 专用账户与发布网关；需真实验收'],
    ['email', Boolean(env.RESEND_API_KEY && env.MAIL_FROM), 'Resend 平台验证发信地址；需真实验收'],
  ];
  return {
    status: () =>
      config.map(([name, configured, detail]) => ({
        name,
        configured,
        mode: configured ? 'live' : 'unconfigured',
        detail: configured ? detail : '未配置；不会伪装成功',
      })),
    consult: (draft, refs, instructions) => consult(env, draft, refs, instructions),
    script: (draft) => generateScript(env, draft),
    copy: (draft) => generateCopy(env, draft),
    image: (draft, scene, instructions, refs) =>
      generateImage(env, draft, scene, instructions, refs),
    designImage: (draft, page, instructions, refs) =>
      generatePageDesign(env, draft, page, instructions, refs),
    siteBuild: (id, input) => siteBuild(env, id, input),
    submitVideo: (draft, refs, idempotencyKey) => submitVideo(env, draft, refs, idempotencyKey),
    pollVideo: (id) => pollVideo(env, id),
    resolveHostingTarget: (projectId, current) => resolveHostingTarget(env, projectId, current),
    publish: (projectId, releaseId, files, previousId, hostingTarget, previous) =>
      publishPages(env, projectId, releaseId, files, previousId, hostingTarget, previous),
    email: (inquiry, recipient, key) => sendInquiry(env, inquiry, recipient, key),
  };
}
