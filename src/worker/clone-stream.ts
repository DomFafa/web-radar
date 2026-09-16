import { ApiError } from './http';

/** Accumulate only public output deltas, never reasoning text. Bound buffered data. */
export async function readCloneAnswer(
  response: Response,
  progress?: (characters: number) => Promise<void>,
) {
  type Answer = { choices?: Array<{ finish_reason?: string; message?: { content?: string } }> };
  if (!response.headers.get('content-type')?.includes('text/event-stream'))
    return (await response.json()) as Answer;
  if (!response.body) throw new ApiError(502, 'clone_output_empty', '模型未返回内容。');
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = '',
    content = '',
    finish: string | undefined,
    lastUpdate = 0,
    bytes = 0;
  const line = (value: string) => {
    if (!value.startsWith('data:')) return;
    const data = value.slice(5).trim();
    if (!data || data === '[DONE]') return;
    const event = JSON.parse(data);
    if (event.error)
      throw new ApiError(502, 'clone_stream_error', '模型输出流中断，未发布不完整页面。');
    const choice = event.choices?.[0];
    if (typeof choice?.delta?.content === 'string') content += choice.delta.content;
    if (choice?.finish_reason) finish = choice.finish_reason;
  };
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 12 * 1024 * 1024)
        throw new ApiError(502, 'clone_output_large', '模型输出超出页面大小限制。');
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const value of lines) line(value.trimEnd());
      if (Date.now() - lastUpdate > 1000) {
        await progress?.(content.length);
        lastUpdate = Date.now();
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) line(buffer.trimEnd());
    await progress?.(content.length);
    return { choices: [{ finish_reason: finish, message: { content } }] };
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
