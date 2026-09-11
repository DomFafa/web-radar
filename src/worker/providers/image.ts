import type { Draft, Scene } from '../../shared/model';
import type { Secrets } from '../env';
import { ProviderError, type MediaResult } from '../provider-contract';
import {
  bytesFromBase64,
  downloadMedia,
  endpoint,
  limitedBytes,
  nonempty,
  requestJson,
} from './http';
export async function generateImage(
  env: Secrets,
  draft: Draft,
  scene: Scene,
  instructions: string,
  referenceUrls: string[],
): Promise<MediaResult> {
  if (!env.IMAGE_API_KEY || !env.IMAGE_API_BASE_URL)
    throw new ProviderError('image_unconfigured', '图片服务未配置独立地址和专用 key');
  if (env.IMAGE_MODEL && env.IMAGE_MODEL !== 'gpt-image-2.5-sunburst')
    throw new ProviderError('image_model_invalid', '首版仅支持已指定的 Image 2.5 模型');
  if (!referenceUrls.length || referenceUrls.length > 20)
    throw new ProviderError('image_references', '生成分镜需要已保存的产品参考图片');
  const primary = draft.products.find((p) => p.id === draft.primaryProductId);
  const form = new FormData();
  form.append('model', 'gpt-image-2.5-sunburst');
  form.append('n', '1');
  form.append('size', '1536x1024');
  form.append(
    'prompt',
    `Create one cinematic website hero storyboard frame, landscape, with room for overlaid website title. No text or invented company facilities. Preserve the referenced product shape, material and brand. Template: ${draft.template}. Product facts: ${JSON.stringify(primary ? { name: primary.name, description: primary.description, material: primary.material, dimensions: primary.dimensions, conditions: primary.source?.conditions } : {})}. Approved script: ${draft.script}. Frame: ${scene.description}. Customer revision: ${instructions}`,
  );
  for (let i = 0; i < referenceUrls.length; i++) {
    const ref = await downloadMedia(env, referenceUrls[i], 'image');
    const bytes =
      ref.body instanceof Uint8Array
        ? ref.body
        : await limitedBytes(new Response(ref.body), 20 * 1024 * 1024);
    form.append(
      'image[]',
      new Blob([bytes as BlobPart], { type: ref.contentType }),
      `reference-${i}.${ref.contentType.split('/')[1]}`,
    );
  }
  const data = await requestJson(
    endpoint(env.IMAGE_API_BASE_URL, 'images/edits'),
    { method: 'POST', headers: { Authorization: `Bearer ${env.IMAGE_API_KEY}` }, body: form },
    { provider: 'image', mutation: true, maxBytes: 30 * 1024 * 1024 },
  );
  const output = data?.data?.[0];
  if (nonempty(output?.b64_json, 28 * 1024 * 1024)) {
    let body: Uint8Array;
    try {
      body = bytesFromBase64(output.b64_json);
    } catch {
      throw new ProviderError('image_invalid_response', 'Image 2.5 返回无效的图片编码');
    }
    if (body.length < 8 || body.length > 20 * 1024 * 1024)
      throw new ProviderError('image_invalid_response', 'Image 2.5 返回空图片或大小超限');
    const png = body[0] === 137 && body[1] === 80 && body[2] === 78 && body[3] === 71;
    const jpeg = body[0] === 255 && body[1] === 216;
    const webp =
      new TextDecoder().decode(body.slice(0, 4)) === 'RIFF' &&
      new TextDecoder().decode(body.slice(8, 12)) === 'WEBP';
    if (!png && !jpeg && !webp)
      throw new ProviderError('image_invalid_response', 'Image 2.5 返回非图片内容');
    const contentType = png ? 'image/png' : jpeg ? 'image/jpeg' : 'image/webp';
    return {
      body,
      contentType,
      filename: `storyboard.${contentType.split('/')[1]}`,
      size: body.length,
      testMode: false,
    };
  }
  if (nonempty(output?.url, 3000)) return downloadMedia(env, output.url, 'image');
  throw new ProviderError('image_invalid_response', 'Image 2.5 未返回可保存的生成图片');
}
