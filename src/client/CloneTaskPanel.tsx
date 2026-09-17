import { needsClonePolling } from './task-polling';
import { useEffect, useRef, useState } from 'react';
import type { Job } from '../shared/model';
import { api, post, ApiError } from './api';
import { Button, Notice } from './components';

type TaskState = {
  job: Job | null;
  publication?: Pick<Job, 'id' | 'status' | 'error'>;
  url?: string;
};
const duration = (seconds: number) =>
  seconds < 60
    ? `${Math.max(0, Math.round(seconds))} 秒`
    : `${Math.floor(seconds / 60)} 分 ${Math.round(seconds % 60)} 秒`;
export function CloneTaskPanel({
  projectId,
  taskId,
  onOpenPublish,
  onState,
  onFinished,
}: {
  projectId: string;
  taskId?: string;
  onOpenPublish?: () => void;
  onState: (active: boolean) => void;
  onFinished?: () => Promise<unknown>;
}) {
  const [state, setState] = useState<TaskState>({ job: null });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const callbacks = useRef({ onState, onFinished });
  callbacks.current = { onState, onFinished };
  const lastState = useRef('');
  const endpoint = `/api/projects/${encodeURIComponent(projectId)}/clone`;
  useEffect(() => {
    let cancelled = false,
      timer: ReturnType<typeof setTimeout>;
    let failures = 0;
    const controller = new AbortController();
    const read = async () => {
      if (document.hidden) { timer = setTimeout(read, 15000); return; }
      let keepPolling = false;
      try {
        const next = await api<TaskState>(endpoint + '/task', { signal: controller.signal });
        if (cancelled) return;
        failures = 0;
        setState(next);
        setError('');
        keepPolling = needsClonePolling(next);
        const active =
          !!next.job &&
          (['queued', 'running', 'paused'].includes(next.job.status) ||
            (!!next.publication &&
              ['queued', 'running'].includes(next.publication.status)));
        callbacks.current.onState(active);
        const key = `${next.job?.id}:${next.job?.status}:${next.publication?.status}`;
        if (
          key !== lastState.current &&
          next.job &&
          !['running', 'queued', 'paused'].includes(next.job.status)
        )
          void callbacks.current.onFinished?.().catch(() => {});
        lastState.current = key;
      } catch (error) {
        failures++;
        keepPolling = failures < 6 && !(error instanceof ApiError && [401,403,404].includes(error.status));
        if (!cancelled) setError(keepPolling ? '暂时无法同步任务状态，正在重连。后台任务不会因页面断线而停止。' : '状态同步已停止，请点击重新同步。后台任务状态仍会保留。');
      } finally {
        if (!cancelled && keepPolling) timer = setTimeout(read, failures ? Math.min(30000, 2000 * 2 ** failures) : 3000);
      }
    };
    void read();
    const resync = () => { if (!document.hidden) { clearTimeout(timer); setRevision(value => value + 1); } };
    window.addEventListener('focus', resync);
    document.addEventListener('visibilitychange', resync);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
      window.removeEventListener('focus', resync);
      document.removeEventListener('visibilitychange', resync);
    };
  }, [endpoint, taskId, revision]);
  useEffect(() => {
    if (!state.job?.cloneProgress?.activeSince) return;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state.job?.cloneProgress?.activeSince]);
  async function control(action: 'pause' | 'resume' | 'stop') {
    if (!state.job || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await post<{ job: Job }>(endpoint + '/' + action, { taskId: state.job.id });
      setState({ job: result.job });
      setRevision(value => value + 1);
      callbacks.current.onState(['queued', 'running', 'paused'].includes(result.job.status));
      if (action === 'stop') await callbacks.current.onFinished?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : '任务控制失败');
    } finally {
      setBusy(false);
    }
  }
  const job = state.job,
    progress = job?.cloneProgress;
  if (!job || !progress) return error ? <Notice tone="error">{error}<Button onClick={() => setRevision(value => value + 1)}>重新同步</Button></Notice> : null;
  const paused = job.status === 'paused',
    stopped = job.status === 'cancelled';
  const publishing =
    !!state.publication && ['queued', 'running'].includes(state.publication.status);
  const complete =
    job.status === 'succeeded' && (!state.publication || state.publication.status === 'succeeded');
  const needsRecovery = job.status === 'unknown' || state.publication?.status === 'unknown';
  const failed = job.status === 'failed' || state.publication?.status === 'failed';
  const active = ['queued', 'running'].includes(job.status);
  const elapsed =
    (progress.elapsedMs +
      (progress.activeSince ? Math.max(0, clock - Date.parse(progress.activeSince)) : 0)) /
    1000;
  const remaining = Math.max(0, progress.estimatedSeconds - elapsed);
  const phase = complete ? 'done' : publishing ? 'publishing' : progress.phase;
  const titles = {
    queued: '任务已排队',
    capturing: `正在分析参考网页，已采集 ${progress.imagesRead} 张截图`,
    reading: `正在读取设计图 ${progress.imagesRead} / ${progress.imageCount}`,
    model: progress.outputCharacters ? '正在接收页面代码' : '等待模型分析与响应',
    validating: '正在校验页面',
    publishing: '正在发布网站',
    done: state.publication?.status === 'succeeded' ? '页面已生成并发布上线' : '页面代码已生成，待预览与发布',
  };
  return (
    <section
      aria-label="设计生成任务进度"
      style={{
        maxWidth: 1100,
        margin: '0 auto 24px',
        padding: 24,
        borderRadius: 16,
        background: '#fff',
        border: '1px solid #e2e8f0',
      }}
    >
      <h3 style={{ margin: '0 0 12px', color: '#334155' }} aria-live="polite">
        {paused
          ? '任务已暂停'
          : stopped
            ? '任务已停止'
            : needsRecovery
              ? '结果待核实，请在发布管理中恢复任务'
              : failed
              ? '任务未完成'
              : progress.pauseRequested
                ? '正在暂停：等待当前模型结果保存'
                : titles[phase]}
      </h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          color: '#64748b',
          fontSize: 13,
        }}
      >
        {(['reading', 'model', 'validating', 'publishing'] as const).filter(value => value !== 'publishing' || progress.autoPublish !== false).map((value, index) => (
          <span
            key={value}
            style={{
              color: phase === value ? '#4f46e5' : '#64748b',
              fontWeight: phase === value ? 700 : 400,
            }}
          >
            {index + 1}. {['读取设计图', '模型生成', '校验页面', '发布网站'][index]}
          </span>
        ))}
      </div>
      {(active || publishing) && (
        <progress
          aria-label="当前阶段进度"
          max={progress.imageCount || 1}
          value={phase === 'reading' ? progress.imagesRead : undefined}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
      )}
      <p style={{ color: '#475569', fontSize: 14 }}>
        已耗时 {duration(elapsed)}
        {paused ? '（暂停期间不计时）' : ''}
        {active && !progress.pauseRequested && (
          <>
            {' '}
            ·{' '}
            {remaining > 0
              ? `预计还需 ${duration(remaining * 0.6)}～${duration(remaining * 1.4)}`
              : '已超过初步预估，任务仍在处理中'}
            （估算）
          </>
        )}
        {publishing && ' · 发布耗时取决于托管服务'}
      </p>
      <p style={{ fontSize: 13, color: '#64748b' }}>
        {phase === 'capturing' ? `已采集 ${progress.imagesRead} 张截图，正在收集页面和素材` : `已读取 ${progress.imagesRead} / ${progress.imageCount} 张图片`} · 已接收{' '}
        {progress.outputCharacters.toLocaleString()} 字符
      </p>
      {active && phase === 'model' && (
        <p style={{ fontSize: 13, color: '#64748b' }}>
          模型不提供完成百分比；这里展示实际收到的内容量。暂停会等待本次模型结果保存，然后暂停后续发布。
        </p>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        {active && (
          <Button disabled={busy || progress.pauseRequested} onClick={() => void control('pause')}>
            {progress.pauseRequested ? '正在暂停…' : '暂停'}
          </Button>
        )}
        {paused && (
          <Button disabled={busy} onClick={() => void control('resume')}>
            继续
          </Button>
        )}
        {(active || paused) && (
          <Button disabled={busy} onClick={() => void control('stop')}>
            停止
          </Button>
        )}
        {(job.status === 'succeeded' || needsRecovery) && onOpenPublish && <Button onClick={onOpenPublish}>预览与发布管理</Button>}
        {state.url && (
          <a href={state.url} target="_blank" rel="noreferrer">
            打开网站 ↗
          </a>
        )}
      </div>
      {(active || paused) && (
        <p style={{ fontSize: 12, color: '#94a3b8' }}>
          刷新页面后会自动恢复任务状态。停止将取消后续处理和发布；模型端已处理的部分可能仍计费。
        </p>
      )}
      {publishing && (
        <p style={{ fontSize: 12, color: '#94a3b8' }}>
          发布已提交，无法暂停或撤回；刷新后可继续查看结果。
        </p>
      )}
      {error && <Button onClick={() => setRevision(value => value + 1)}>重新同步</Button>}
      {(error || job.error || state.publication?.error) && (
        <Notice tone="error">{error || state.publication?.error || job.error}</Notice>
      )}
    </section>
  );
}
