import { useEffect, useState } from 'react';
import { providersApi } from '../lib/api';
import { useToast } from '../App';
const label = (status: string) =>
  ({
    verified: '已验证',
    pending: '验证中',
    not_started: '未验证',
    failed: '验证失败',
    temporary_failure: '暂时失败',
  })[status] ||
  status ||
  '未知';
export function ResendDomainsPanel({ provider }: { provider: any }) {
  const { addToast } = useToast();
  const [domains, setDomains] = useState<any[] | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(''),
    [details, setDetails] = useState<Record<string, any>>({});
  const load = async () => {
    setBusy('account');
    setError('');
    try {
      const result = await providersApi.resendDomains(provider.id);
      setDomains(result.data);
      setDetails({});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };
  useEffect(() => {
    void load();
  }, [provider.id]);
  const check = async (domain: any, tracking = false) => {
    setBusy(domain.id);
    try {
      const result = tracking
        ? await providersApi.resendTracking(provider.id, domain.id)
        : await providersApi.resendDomain(provider.id, domain.id);
      setDetails((s) => ({ ...s, [domain.id]: result.data }));
      setDomains((s) => s?.map((d) => (d.id === domain.id ? { ...d, ...result.data } : d)) || []);
      if (tracking) addToast('success', '已开启 Resend 打开与点击追踪');
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setBusy('');
    }
  };
  return (
    <section className="card resend-domains" aria-label={`Resend 帐号 ${provider.name}`}>
      <div className="section-heading">
        <div>
          <h3>Resend · {provider.name}</h3>
          <p>
            {error ? '帐号检测失败' : domains ? '帐号连接正常' : '正在检测帐号…'} ·
            支持域名验证、DNS 记录和邮件追踪
          </p>
        </div>
        <button className="btn btn-secondary" disabled={!!busy} onClick={load}>
          {busy === 'account' ? '检测中…' : '检测帐号 / 刷新域名'}
        </button>
      </div>
      {error && (
        <div className="resend-error" role="alert">
          {error}
        </div>
      )}
      {!error && domains?.length === 0 && (
        <p className="resend-note">
          该 Resend 帐号还没有发信域名，请先在 Resend 添加并配置 DNS，再刷新此处。
        </p>
      )}
      {domains?.map((domain) => (
        <article className="resend-domain" key={domain.id}>
          <div className="resend-domain-heading">
            <div>
              <strong>{domain.name}</strong>
              <span
                className={
                  'badge ' + (domain.status === 'verified' ? 'badge-success' : 'badge-warning')
                }
              >
                {label(domain.status)}
              </span>
              <p>
                区域：{domain.region || '—'} · 打开追踪：
                {domain.open_tracking === undefined
                  ? '待检测'
                  : domain.open_tracking
                    ? '已开启'
                    : '未开启'}{' '}
                · 点击追踪：
                {domain.click_tracking === undefined
                  ? '待检测'
                  : domain.click_tracking
                    ? '已开启'
                    : '未开启'}
              </p>
            </div>
            <div className="resend-actions">
              <button
                className="btn btn-secondary btn-sm"
                disabled={!!busy}
                onClick={() => check(domain)}
              >
                检测域名 / DNS
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!!busy || (domain.open_tracking && domain.click_tracking)}
                onClick={() => check(domain, true)}
              >
                {domain.open_tracking && domain.click_tracking
                  ? '打开与点击追踪已开启'
                  : '开启打开与点击追踪'}
              </button>
            </div>
          </div>
          {details[domain.id] && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>记录</th>
                    <th>类型</th>
                    <th>名称</th>
                    <th>值</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {(details[domain.id].records || []).map((record: any, i: number) => (
                    <tr key={i}>
                      <td>{record.record || '—'}</td>
                      <td>{record.type}</td>
                      <td>{record.name}</td>
                      <td className="resend-dns-value">{record.value}</td>
                      <td>{label(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      ))}
      <p className="resend-note">
        状态来自 Resend。DNS
        生效后再次检测；收集统计还需在服务商配置中连接数据回调。打开/点击是追踪事件，每封邮件去重计数。
      </p>
    </section>
  );
}
