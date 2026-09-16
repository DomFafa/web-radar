import { expect, it, vi } from 'vitest';
import { readCloneAnswer } from '../src/worker/clone-stream';
function stream(parts: Uint8Array[]) {
  return new Response(
    new ReadableStream({
      start(c) {
        for (const p of parts) c.enqueue(p);
        c.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } },
  );
}
it('assembles split SSE lines and multibyte output while reporting real characters', async () => {
  const text =
    'data: ' +
    JSON.stringify({ choices: [{ delta: { content: '页面' }, finish_reason: null }] }) +
    '\n\n' +
    'data: ' +
    JSON.stringify({ choices: [{ delta: { content: ' code' }, finish_reason: 'stop' }] }) +
    '\n\ndata: [DONE]\n\n';
  const bytes = new TextEncoder().encode(text);
  const progress = vi.fn(async () => {});
  const result = await readCloneAnswer(
    stream(Array.from(bytes, (b) => new Uint8Array([b]))),
    progress,
  );
  expect(result.choices?.[0]).toEqual({ finish_reason: 'stop', message: { content: '页面 code' } });
  expect(progress).toHaveBeenLastCalledWith(7);
});
it('does not manufacture completion when the output stream is truncated', async () => {
  const result = await readCloneAnswer(
    stream([new TextEncoder().encode('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n')]),
  );
  expect(result.choices?.[0].finish_reason).toBeUndefined();
});
it('rejects an upstream stream error', async () => {
  await expect(
    readCloneAnswer(
      stream([
        new TextEncoder().encode('data: {"error":{"message":"private upstream detail"}}\n\n'),
      ]),
    ),
  ).rejects.toThrow('模型输出流中断');
});
