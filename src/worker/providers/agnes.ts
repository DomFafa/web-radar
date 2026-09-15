import type { Draft } from '../../shared/model';
import type { Secrets } from '../env';
import { ProviderError, type VideoResult } from '../provider-contract';
import { downloadMedia, endpoint, jsonRequest, mediaUrl, nonempty, requestJson } from './http';
export const AGNES_CONTRACT = 'agnes-video-v2.0-2026-09';
export function agnesConfigured(env: Secrets): boolean {
  return Boolean(
    env.AGNES_API_KEY &&
    env.AGNES_API_BASE_URL &&
    env.AGNES_MODEL === 'agnes-video-v2.0' &&
    env.AGNES_CONTRACT === AGNES_CONTRACT,
  );
}
function config(env: Secrets): { key: string; root: string } {
  if (!agnesConfigured(env))
    throw new ProviderError(
      'agnes_unconfigured',
      'Agnes 未配置或契约未核验；需设置 Agnes Video V2.0 专用配置及 AGNES_CONTRACT=agnes-video-v2.0-2026-09',
    );
  const raw = new URL(endpoint(env.AGNES_API_BASE_URL, ''));
  if (raw.pathname !== '/' && raw.pathname !== '/v1/')
    throw new ProviderError('agnes_unconfigured', 'Agnes 服务地址须为已核验网关根路径或 /v1');
  if (
    (env.AGNES_SUBMIT_PATH && env.AGNES_SUBMIT_PATH !== '/v1/videos') ||
    (env.AGNES_STATUS_PATH && env.AGNES_STATUS_PATH !== '/agnesapi')
  )
    throw new ProviderError('agnes_unconfigured', '自定义 Agnes 路径尚未核验');
  return { key: env.AGNES_API_KEY!, root: raw.origin };
}
export async function submitVideo(
  env: Secrets,
  draft: Draft,
  referenceUrls: string[],
  _idempotencyKey: string,
): Promise<{ videoId: string }> {
  const { key, root } = config(env);
  const count = draft.duration === 12 ? 4 : 3;
  if (
    referenceUrls.length < count ||
    referenceUrls.length > 20 ||
    ![8, 12].includes(draft.duration)
  )
    throw new ProviderError(
      'video_references',
      '8 秒视频至少需要 3 张分镜图，12 秒视频至少需要 4 张',
    );
  const refs = referenceUrls.map((url) => mediaUrl(env, url));
  const payload = {
    model: 'agnes-video-v2.0',
    prompt: `Create one complete silent looping ${draft.duration}-second website hero video. Preserve product identity and the approved storyboard order. No added text, company facilities, logos, certificates or unsupported product claims.\nApproved script: ${draft.script}\nDirection: ${draft.direction}\nStoryboard: ${draft.scenes.map((s) => s.description).join('\n')}`,
    extra_body: { image: refs, mode: 'keyframes' },
    width: 1280,
    height: 720,
    num_frames: draft.duration * 24 + 1,
    frame_rate: 24,
  };
  const data = await requestJson(`${root}/v1/videos`, jsonRequest(key, payload), {
    provider: 'agnes',
    mutation: true,
  });
  if (!nonempty(data?.video_id, 300))
    throw new ProviderError(
      'video_acceptance_unknown',
      'Agnes 未返回 video_id；请核对上游任务，禁止直接重发',
      true,
    );
  return { videoId: data.video_id };
}
export async function pollVideo(env: Secrets, videoId: string): Promise<VideoResult> {
  const { key, root } = config(env);
  if (!nonempty(videoId, 300))
    throw new ProviderError('video_id_invalid', '缺少已保存的 Agnes video_id');
  const url = new URL(`${root}/agnesapi`);
  url.searchParams.set('video_id', videoId);
  url.searchParams.set('model_name', 'agnes-video-v2.0');
  const data = await requestJson(
    url.href,
    { headers: { Authorization: `Bearer ${key}` } },
    { provider: 'agnes' },
  );
  if (data.status === 'queued' || data.status === 'in_progress') return { state: 'pending' };
  if (data.status === 'failed')
    return { state: 'failed', message: 'Agnes 视频生成失败，可查看任务后重试' };
  if (data.status !== 'completed')
    throw new ProviderError(
      'video_status_unknown',
      'Agnes 返回未知任务状态，请继续核对原任务',
      true,
    );
  const resultUrl = nonempty(data.url, 3000) ? data.url : data.metadata?.url;
  if (!nonempty(resultUrl, 3000))
    throw new ProviderError(
      'video_result_unavailable',
      'Agnes 已完成但未返回视频下载地址，可恢复原任务下载',
      true,
    );
  return { state: 'succeeded', media: await downloadMedia(env, resultUrl, 'video') };
}
