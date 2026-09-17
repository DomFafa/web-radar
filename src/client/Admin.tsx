import { useEffect, useState } from 'react';
import type { Job, Quota, ServiceStatus } from '../shared/model';
import { api, errorMessage, post, put } from './api';
import {
  Button,
  Empty,
  Field,
  Icon,
  Notice,
  SectionTitle,
  ServiceList,
  dateTime,
  statusNames,
} from './components';

type AdminData = { quotas: Quota[]; services: ServiceStatus[]; jobs: Job[] };
export function Admin() {
  const [metrics, setMetrics] = useState<{
    jobs: { kind: string; status: string; count: number; averageElapsedMs: number | null }[];
  } | null>(null);
  const [data, setData] = useState<AdminData | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState('');
  const [userId, setUserId] = useState(''),
    [imageLimit, setImageLimit] = useState('0'),
    [videoLimit, setVideoLimit] = useState('0');
  const [unlimited, setUnlimited] = useState(false);
  const [upstreamIds, setUpstreamIds] = useState<Record<string, string>>({});
  async function load() {
    try {
      const [next, report] = await Promise.all([
        api<AdminData>('/api/admin'),
        api<NonNullable<typeof metrics>>('/api/admin/metrics'),
      ]);
      setData(next);
      setMetrics(report);
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function updateQuota(event: React.FormEvent) {
    event.preventDefault();
    setBusy('quota');
    setError('');
    try {
      await put(`/api/admin/quotas/${encodeURIComponent(userId.trim())}`, {
        unlimited,
        imageLimit: Number(imageLimit),
        videoLimit: Number(videoLimit),
      });
      await load();
      setNotice('账户额度已保存。已有消耗和预留继续保留。');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy('');
    }
  }
  async function exportData() {
    setBusy('export');
    setError('');
    try {
      const result = await api<unknown>('/api/admin/export');
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }),
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `web-radar-business-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('业务数据导出已下载。媒体文件与目标服务器恢复需按迁移文档处理。');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy('');
    }
  }
  async function reconcile(jobId: string) {
    setBusy(jobId);
    setError('');
    try {
      await post(`/api/admin/jobs/${encodeURIComponent(jobId)}/reconcile`, {
        upstreamId: upstreamIds[jobId]?.trim(),
      });
      await load();
      setNotice('已关联核实过的原任务编号，继续查询同一任务。');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <div className="page-heading">
        <h1>平台管理</h1>
        <p>配置状态、账号额度与持久任务的统一视图。</p>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}
      {metrics && (
        <section className="panel">
          <SectionTitle
            title="近 30 天任务统计"
            description="平均耗时来自任务记录；生成任务扣除暂停时间，其他任务包含排队时间，不表示模型计费。"
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>任务类型</th>
                  <th>状态</th>
                  <th>数量</th>
                  <th>平均耗时</th>
                </tr>
              </thead>
              <tbody>
                {metrics.jobs.map((row) => (
                  <tr key={`${row.kind}:${row.status}`}>
                    <td>{row.kind}</td>
                    <td>{statusNames[row.status] || row.status}</td>
                    <td>{row.count}</td>
                    <td>
                      {row.averageElapsedMs == null
                        ? '—'
                        : `${Math.round(row.averageElapsedMs / 1000)} 秒`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {!data ? (
        <div className="loading-area">
          <span className="spinner" />
          正在读取管理信息…
        </div>
      ) : (
        <>
          <section className="panel">
            <SectionTitle
              title="服务连接"
              description="凭据通过服务器 Secret 配置，此处仅显示状态。"
              actions={
                <Button onClick={load}>
                  <Icon name="refresh" />
                  刷新
                </Button>
              }
            />
            <ServiceList services={data.services} />
          </section>
          <section className="panel">
            <SectionTitle
              title="账号生成额度"
              description="按发起账号累计。失败退回，重做重新计数，不自动重置。"
            />
            {data.quotas.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>账号 ID</th>
                      <th>图片 已用 / 预留 / 上限</th>
                      <th>视频 已用 / 预留 / 上限</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.quotas.map((q) => (
                      <tr key={q.userId}>
                        <td>
                          <code>{q.userId}</code>
                        </td>
                        <td>
                          {q.imageUsed} / {q.imageReserved} /{' '}
                          {q.unlimited ? '不限额' : q.imageLimit}
                        </td>
                        <td>
                          {q.videoUsed} / {q.videoReserved} /{' '}
                          {q.unlimited ? '不限额' : q.videoLimit}
                        </td>
                        <td>
                          <Button
                            onClick={() => {
                              setUserId(q.userId);
                              setUnlimited(!!q.unlimited);
                              setImageLimit(String(q.imageLimit));
                              setVideoLimit(String(q.videoLimit));
                            }}
                          >
                            调整
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="暂无已分配额度" />
            )}
            <form onSubmit={updateQuota} className="quota-form">
              <Field label="稳定账号 ID" required>
                <input
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="选择上方账号，或填写用户 ID"
                />
              </Field>
              <label className="unlimited-quota-option">
                <input
                  type="checkbox"
                  checked={unlimited}
                  onChange={(e) => setUnlimited(e.target.checked)}
                />
                图片与视频不限额（保留用量统计）
              </label>
              <Field label="图片额度上限">
                <input
                  type="number"
                  min="0"
                  max="1000000"
                  required
                  disabled={unlimited}
                  value={imageLimit}
                  onChange={(e) => setImageLimit(e.target.value)}
                />
              </Field>
              <Field label="视频额度上限">
                <input
                  type="number"
                  min="0"
                  max="1000000"
                  required
                  disabled={unlimited}
                  value={videoLimit}
                  onChange={(e) => setVideoLimit(e.target.value)}
                />
              </Field>
              <Button type="submit" kind="primary" busy={busy === 'quota'}>
                保存额度
              </Button>
            </form>
          </section>
          <section className="panel">
            <SectionTitle
              title="平台任务"
              description="视频服务全平台一次处理一条任务。待核对任务会保留位置，避免重复提交。"
            />
            {data.jobs.length === 0 ? (
              <Empty icon="clock" title="暂无任务" />
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>任务</th>
                      <th>项目 / 发起账号</th>
                      <th>状态</th>
                      <th>最近更新</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.jobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          {
                            {
                              clone: '设计稿生成',
                              consultation: '需求沟通',
                              script: '脚本',
                              copy: '网站文案',
                              image: '分镜图片',
                              video: '完整视频',
                              'site-build': '静态网站',
                              publish: '网站发布',
                              email: '询盘邮件',
                            }[job.kind]
                          }
                          {job.testMode && <span className="inline-test">测试</span>}
                          <small>{job.id}</small>
                        </td>
                        <td>
                          <small>{job.projectId}</small>
                          <small>{job.userId}</small>
                        </td>
                        <td>
                          <span
                            className={`pill ${job.status === 'failed' ? 'red' : job.status === 'succeeded' ? 'green' : 'muted'}`}
                          >
                            {statusNames[job.status]}
                          </span>
                          {job.error && <small className="error-text">{job.error}</small>}
                        </td>
                        <td>{dateTime(job.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {data.jobs
            .filter((job) => job.kind === 'video' && job.status === 'unknown' && !job.upstreamId)
            .map((job) => (
              <section className="panel" key={job.id}>
                <SectionTitle
                  title="核对原视频任务"
                  description={`任务 ${job.id} 的上游提交结果尚不确定。先在视频服务中确认原任务，再关联编号。`}
                />
                <Field label="已核实的上游任务编号">
                  <input
                    value={upstreamIds[job.id] || ''}
                    onChange={(event) =>
                      setUpstreamIds({ ...upstreamIds, [job.id]: event.target.value })
                    }
                    placeholder="输入服务商中已核实的原任务 ID"
                  />
                </Field>
                <Button
                  onClick={() => reconcile(job.id)}
                  busy={busy === job.id}
                  disabled={!!busy || !upstreamIds[job.id]?.trim()}
                >
                  关联原任务并继续查询
                </Button>
              </section>
            ))}
          <section className="panel export-panel">
            <div>
              <h3>迁移与备份</h3>
              <p>
                导出项目、素材索引、询盘、额度、发布关联和在途任务。导出不包含登录凭据与服务密钥。
              </p>
            </div>
            <Button onClick={exportData} busy={busy === 'export'}>
              <Icon name="upload" />
              导出业务数据
            </Button>
          </section>
        </>
      )}
    </>
  );
}
