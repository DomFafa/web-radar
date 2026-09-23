import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { api, errorMessage } from './api';
import { Button, Icon } from './components';
import { percentage, type EmailOverview, type SiteOverview } from '../shared/outreach-stats';
import './dashboard.css';

export function useOverview<T>(url: string, revision?: string) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const reload = useCallback(async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    setError('');
    try {
      const result = await api<T>(url, { signal: request.signal });
      if (!request.signal.aborted) setData(result);
    } catch (e) {
      if (!request.signal.aborted) setError(errorMessage(e));
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    void reload();
    return () => controller.current?.abort();
  }, [reload, revision]);
  return { data, loading, error, reload };
}
type SummaryProps<T> = {
  data: T | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onOpen?: () => void;
};
const count = (n: number | undefined) => (n === undefined ? '—' : n.toLocaleString('zh-CN'));
const rate = (n: number | null | undefined) => (n == null ? '—' : `${n.toFixed(1)}%`);
export function SummaryFrame({
  title,
  description,
  icon,
  loading,
  error,
  onRefresh,
  onOpen,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onOpen?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="channel-summary" aria-label={title} aria-busy={loading}>
      <header className="channel-summary-head">
        <div className="channel-title">
          <span>
            <Icon name={icon} size={20} />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="channel-actions">
          <Button
            kind="quiet"
            onClick={onRefresh}
            disabled={loading}
            aria-label={`刷新${title}统计`}
          >
            <Icon name="refresh" size={15} />
          </Button>
          {onOpen && (
            <Button kind="quiet" onClick={onOpen}>
              查看详情
              <Icon name="arrow" size={15} />
            </Button>
          )}
        </div>
      </header>
      {error && (
        <div className="channel-error" role="alert">
          统计加载失败：{error}。可点击刷新重试。
        </div>
      )}
      {loading && (
        <p className="channel-loading" role="status">
          正在更新统计…
        </p>
      )}
      {children}
    </section>
  );
}
export function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | undefined;
  icon: string;
}) {
  return (
    <div className="channel-metric">
      <Icon name={icon} size={18} />
      <strong>{count(value)}</strong>
      <span>{label}</span>
    </div>
  );
}
export function EmailSummary(props: SummaryProps<EmailOverview>) {
  const d = props.data;
  const metrics = [
    ['送达率', d?.deliveryRate, d?.totalDelivered, 'check'],
    ['打开率', d?.openRate, d?.totalOpened, 'eye'],
    ['点击率', d?.clickRate, d?.totalClicked, 'external'],
    ['退信率', d?.bounceRate, d?.totalBounced, 'alert'],
  ] as const;
  return (
    <SummaryFrame
      {...props}
      title="EDM 邮件概览"
      description="邮件活动、订阅联系人与发送效果"
      icon="mail"
    >
      <div className="channel-metrics">
        <Metric label="活动总数" value={d?.totalCampaigns} icon="play" />
        <Metric label="订阅联系人" value={d?.subscribedContacts} icon="users" />
        <Metric label="已发送邮件" value={d?.totalSent} icon="mail" />
      </div>
      <h3 className="channel-subtitle">送达与互动效果</h3>
      <div className="channel-rates">
        {metrics.map(([label, value, total, icon]) => (
          <div className="channel-rate" key={label}>
            <div>
              <span>
                <Icon name={icon} size={15} />
                {label}
              </span>
              <strong>{rate(value)}</strong>
            </div>
            <progress max={100} value={value ?? 0} aria-label={label} />
            <small>{count(total)} 封</small>
          </div>
        ))}
      </div>
      <p className="channel-footnote">
        各比率以已发送邮件为分母；无发送数据时显示「—」。总联系人 {count(d?.totalContacts)}
        。送达、退信依赖服务商回执；打开与点击受邮件客户端限制，未记录不代表未发生。
      </p>
    </SummaryFrame>
  );
}
export function SiteSummary(props: SummaryProps<SiteOverview>) {
  const d = props.data;
  const states = [
    ['已成功提交', d?.totalSubmitted, 'check', 'success'],
    ['已跳过 / 机制保护', d?.totalSkipped, 'lock', 'muted'],
    ['执行失败', d?.totalFailed, 'alert', 'danger'],
    ['无联系页面', d?.totalNoContact, 'search', 'muted'],
    ['网站无法访问', d?.totalInaccessible, 'globe', 'danger'],
    ['待开始 / 执行中', d?.totalPending, 'clock', 'pending'],
    ['提交结果待核实', d?.totalUncertain, 'help', 'pending'],
  ] as const;
  return (
    <SummaryFrame
      {...props}
      title="站内信概览"
      description="目标网站联系表单的执行结果"
      icon="message"
    >
      <div className="channel-metrics two">
        <Metric label="自动任务数" value={d?.totalJobs} icon="folder" />
        <Metric label="目标网站次数" value={d?.totalTargets} icon="globe" />
      </div>
      <h3 className="channel-subtitle">执行状态分布</h3>
      <div className="channel-breakdown">
        {states.map(([label, value, icon, tone]) => (
          <div key={label} className={`channel-result ${tone}`}>
            <span>
              <Icon name={icon} size={16} />
              {label}
            </span>
            <strong>{count(value)}</strong>
            <small>{rate(value == null || !d ? null : percentage(value, d.totalTargets))}</small>
          </div>
        ))}
      </div>
      <p className="channel-footnote">
        占比以全部目标次数为分母，同一网站在不同任务中分别计数。各状态互斥；无目标时显示「—」。
      </p>
    </SummaryFrame>
  );
}
export function EmailOverviewPanel({ onOpen }: { onOpen?: () => void }) {
  const s = useOverview<{ data: EmailOverview }>('/api/outreach/campaigns/stats/overview');
  return <EmailSummary {...s} data={s.data?.data ?? null} onRefresh={s.reload} onOpen={onOpen} />;
}
export function SiteOverviewPanel({
  revision,
  onOpen,
}: {
  revision?: string;
  onOpen?: () => void;
}) {
  const s = useOverview<{ data: SiteOverview }>(
    '/api/outreach/site-messages/stats/overview',
    revision,
  );
  return <SiteSummary {...s} data={s.data?.data ?? null} onRefresh={s.reload} onOpen={onOpen} />;
}
