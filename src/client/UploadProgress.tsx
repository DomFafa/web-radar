import { useEffect, useState } from 'react';
import { Button } from './components';
export type UploadState = { name: string; fraction: number; startedAt: number };
export function UploadProgress({ state, onCancel }: { state: UploadState; onCancel: () => void }) {
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.max(0, (clock - state.startedAt) / 1000);
  const remaining =
    state.fraction > 0 && state.fraction < 1
      ? Math.ceil((elapsed * (1 - state.fraction)) / state.fraction)
      : null;
  return (
    <section className="panel upload-progress" aria-label="素材上传进度">
      <strong>
        {state.fraction >= 1
          ? '传输完成，正在保存…'
          : `正在上传 ${Math.floor(state.fraction * 100)}%`}
      </strong>
      <p>{state.name}</p>
      <progress max={1} value={state.fraction} aria-label="实际上传字节进度" />
      <small>
        已用 {Math.floor(elapsed)} 秒
        {remaining !== null && elapsed > 1 ? ` · 预计传输还需约 ${remaining} 秒` : ''}
      </small>
      <Button onClick={onCancel}>取消上传</Button>
    </section>
  );
}
