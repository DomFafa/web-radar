import { useEffect, useState } from 'react';
import type { Job, Release } from '../shared/model';
import { api, errorMessage } from './api';
import { Button, dateTime, Notice, statusNames } from './components';
type Record = Job | Omit<Release, 'draft'>;
export function ProjectHistory({ projectId }: { projectId: string }) {
  const [kind, setKind] = useState<'jobs' | 'releases'>('jobs');
  const [page, setPage] = useState(1),
    [data, setData] = useState<{ records: Record[]; hasMore: boolean }>(),
    [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setData(undefined);
    setError('');
    api<{ records: Record[]; hasMore: boolean }>(
      `/api/projects/${encodeURIComponent(projectId)}/history?kind=${kind}&page=${page}`,
      { signal: controller.signal },
    )
      .then(setData)
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      });
    return () => controller.abort();
  }, [projectId, kind, page]);
  return (
    <div>
      <div className="button-row">
        <Button
          onClick={() => {
            setKind('jobs');
            setPage(1);
          }}
        >
          任务记录
        </Button>
        <Button
          onClick={() => {
            setKind('releases');
            setPage(1);
          }}
        >
          发布记录
        </Button>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {!data && !error && <p>正在读取…</p>}
      {data?.records.map((record) => (
        <article className="panel" key={record.id}>
          <strong>{'kind' in record ? record.kind : `草稿 V${record.draftVersion}`}</strong>
          <p>
            {dateTime(record.createdAt)} · {statusNames[record.status] || record.status}
          </p>
          <small>{record.id}</small>
          {record.error && <p className="error-text">{record.error}</p>}
        </article>
      ))}
      {data && !data.records.length && <p>暂无记录</p>}
      <div className="button-row">
        <Button disabled={page === 1 || !data} onClick={() => setPage(page - 1)}>
          上一页
        </Button>
        <span>第 {page} 页</span>
        <Button disabled={!data?.hasMore} onClick={() => setPage(page + 1)}>
          下一页
        </Button>
      </div>
    </div>
  );
}
