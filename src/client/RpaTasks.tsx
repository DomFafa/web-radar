import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Principal } from '../shared/model';
import { manageUsers, viewTeamData, writeBusiness } from '../shared/access';
import { api, post, sessionHeaders } from './api';
import './rpa-tasks.css';

type DomainResult = {
  domain: string; company: string; contact_rows: number; complete_contact_rows: number;
  collection_status: string; needs_review: boolean;
};
type Verification = {
  domain_count: number; total_contacts: number; all_domains_have_contacts: boolean;
  zero_complete_contact_domains: string[]; per_domain: DomainResult[];
};
type Job = {
  id: string; workspace_id: string; created_by: string; robot_uuid: string;
  status: string; domain_count: number; created_at: number; updated_at: number;
  input_sha256: string | null; result_sha256: string | null;
  has_input: boolean; has_result: boolean;
  verification: Verification | null; verification_sha256?: string | null;
};

const states: Record<string, string> = {
  queued: '排队中', claimed: 'Agent 已领取', running: '影刀执行中',
  awaiting_review: '待人工复核', business_accepted: '业务已验收',
  needs_reconciliation: '执行异常 · 待对账', unverified: '未核实 · 已关闭',
};

function parseLines(raw: string) {
  const lines = raw.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (lines.length < 1 || lines.length > 100) throw new Error('每次请输入 1–100 个域名。');
  return lines.map((line, index) => {
    const cells = line.includes('\t') ? line.split('\t') : line.split(',');
    if (cells.length > 3) throw new Error(`第 ${index + 1} 行格式有误，每行最多三列。`);
    const [domain, company, country] = cells.map(x => x.trim());
    return { domain, company: company || '', country: country || '' };
  });
}

export default function RpaTasks({ principal }: { principal: Principal }) {
  const [raw, setRaw] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ack, setAck] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [reconcileNotes, setReconcileNotes] = useState('');
  const idempotency = useRef<{ text: string; id: string } | null>(null);

  const refresh = useCallback(async () => {
    const response = await api<{ jobs: Job[] }>('/api/rpa/jobs');
    setJobs(response.jobs);
  }, []);
  const refreshDetail = useCallback(async (id: string) => {
    const response = await api<{ job: Job }>(`/api/rpa/jobs/${id}`);
    setDetail(response.job);
  }, []);
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const response = await api<{ jobs: Job[] }>('/api/rpa/jobs');
        if (active) setJobs(response.jobs);
      } catch (e) { if (active) setError((e as Error).message); }
    };
    void poll();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void poll(); }, 15_000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    let active = true;
    const load = async () => {
      try {
        const response = await api<{ job: Job }>(`/api/rpa/jobs/${selected}`);
        if (active) setDetail(response.job);
      } catch (e) { if (active) setError((e as Error).message); }
    };
    void load();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 15_000);
    return () => { active = false; clearInterval(timer); };
  }, [selected]);
  function choose(id: string) {
    setSelected(id); setDetail(null); setDownloaded(false); setAck(false);
    setReconcileNotes(''); setError(''); setNotice('');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!writeBusiness(principal) || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const domains = parseLines(raw);
      const task = idempotency.current?.text === raw ? idempotency.current :
        { text: raw, id: crypto.randomUUID().replaceAll('-', '') };
      idempotency.current = task;
      await post('/api/rpa/jobs', { id: task.id, domains });
      await refresh();
      choose(task.id);
      setNotice(`已提交 ${domains.length} 个域名。Windows Agent 将统一生成 input.xlsx。`);
      setRaw('');
      idempotency.current = null;
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function download(kind: 'input' | 'result') {
    if (!detail) return;
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/rpa/jobs/${detail.id}/${kind === 'input' ? 'input-artifact' : 'artifact'}`, {
        headers: sessionHeaders(), cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message || `下载失败（${res.status}）`);
      }
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement('a');
      link.href = url; link.download = `${detail.id}-${kind}.xlsx`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      if (kind === 'result') setDownloaded(true);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function accept() {
    if (!detail?.result_sha256 || !detail.verification_sha256 || !ack || !downloaded) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await post(`/api/rpa/jobs/${detail.id}/review`, {
        business_reviewed: true, technical_verified: true,
        result_sha256: detail.result_sha256,
        verification_sha256: detail.verification_sha256,
      });
      await Promise.all([refresh(), refreshDetail(detail.id)]);
      setNotice('人工业务验收已记录。');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function reconcile() {
    if (!detail || !manageUsers(principal) || !reconcileNotes.trim() || !ack) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await post(`/api/rpa/jobs/${detail.id}/reconcile`, {
        engine_stopped: true, execution_status_checked: true, notes: reconcileNotes,
      });
      await Promise.all([refresh(), refreshDetail(detail.id)]);
      setNotice('云端异常任务已对账关闭。请另行核查并清理 Windows 本地独占锁。');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  const canReview = detail && writeBusiness(principal) &&
    (detail.created_by === principal.userId || manageUsers(principal));

  return <section className="rpa-tasks">
    <div className="page-heading"><h1>影刀 RPA 采集任务</h1>
      <p>单域名和批量域名使用相同的 Excel 输入输出协议。采集结果须经人工复核。</p></div>
    {error && <div className="rpa-alert" role="alert">{error}</div>}
    {notice && <div className="rpa-notice" role="status">{notice}</div>}
    {writeBusiness(principal) && <form className="panel rpa-submit" onSubmit={submit}>
      <h2>新建域名采集任务</h2>
      <label htmlFor="rpa-domains">域名清单（每行一条，最多 100 条）</label>
      <textarea id="rpa-domains" rows={6} value={raw} disabled={busy}
        placeholder={'example.com\nother.example,Company B,JP\nthird.example\tCompany C\tUS'}
        onChange={e => setRaw(e.target.value)} required />
      <p className="rpa-hint">每行格式：域名、公司名称（可选）、国家（可选）。可粘贴以逗号或 Tab 分隔的 Excel 三列数据。同一任务公司名称不可重复。</p>
      <button type="submit" className="rpa-primary" disabled={busy || !raw.trim()}>{busy ? '处理中…' : '提交任务'}</button>
    </form>}
    <div className="rpa-grid">
      <div className="panel">
        <div className="rpa-row"><h2>任务记录</h2><button type="button" onClick={() => void refresh().catch(e => setError(e.message))}>刷新</button></div>
        {jobs.length === 0 ? <p className="rpa-hint">暂无采集任务。</p> : <div className="rpa-job-list">
          {jobs.map(job => <button key={job.id} type="button" className={selected === job.id ? 'rpa-job selected' : 'rpa-job'} onClick={() => choose(job.id)}>
            <span>{job.id.slice(0, 12)}… <small>{new Date(job.created_at).toLocaleString()}</small></span>
            <strong>{states[job.status] || job.status}</strong><small>{job.domain_count} 个域名</small>
          </button>)}
        </div>}
      </div>
      <div className="panel rpa-detail">
        <h2>执行详情</h2>
        {!selected ? <p className="rpa-hint">选择任务查看验证报告、下载 Excel 或进行人工复核。</p> : !detail ? <p>正在读取任务详情…</p> : <>
          <p className="rpa-id">任务 ID：{detail.id}</p>
          <p>状态：<strong>{states[detail.status] || detail.status}</strong> · {detail.domain_count} 个域名</p>
          <p className="rpa-hint">更新于 {new Date(detail.updated_at).toLocaleString()}</p>
          <div className="rpa-actions">
            <button type="button" disabled={!detail.has_input || busy} onClick={() => void download('input')}>下载 input.xlsx</button>
            <button type="button" disabled={!detail.has_result || busy} onClick={() => void download('result')}>下载 result.xlsx</button>
          </div>
          {detail.verification && <div>
            <h3>Excel 结构验证摘要</h3>
            <p>联系人行数：{detail.verification.total_contacts}；{detail.verification.all_domains_have_contacts ? '每个域名都有完整联系人行' : '部分域名无完整联系人，需重点核查'}</p>
            <div className="rpa-table-wrap"><table><thead><tr><th>域名</th><th>公司</th><th>联系人行</th><th>完整行</th><th>采集状态</th></tr></thead><tbody>
              {detail.verification.per_domain.map(d => <tr key={d.domain}><td>{d.domain}</td><td>{d.company}</td><td>{d.contact_rows}</td><td>{d.complete_contact_rows}</td><td>{d.needs_review ? '重点核查' : d.collection_status}</td></tr>)}
            </tbody></table></div>
            <p className="rpa-hint">结构验证仅说明 XLSX 格式及归属检查通过，不代表联系人信息真实。</p>
          </div>}
          {detail.status === 'awaiting_review' && canReview && <div className="rpa-review">
            <h3>人工业务验收</h3>
            <label><input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} /> 我已下载并逐条核查联系人真实性、归属和零联系人域名。</label>
            <button type="button" className="rpa-primary" disabled={!downloaded || !ack || busy} onClick={() => void accept()}>确认业务验收通过</button>
            {!downloaded && <p className="rpa-hint">请先下载 result.xlsx 后再确认。</p>}
          </div>}
          {detail.status === 'needs_reconciliation' && manageUsers(principal) && <div className="rpa-review">
            <h3>人工异常对账</h3>
            <p className="rpa-hint">必须先在 Windows 核实影刀引擎已经停止，再关闭云端任务；关闭不会自动清理本机锁。</p>
            <textarea rows={3} placeholder="引擎状态核查记录" value={reconcileNotes} onChange={e => setReconcileNotes(e.target.value)} />
            <label><input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} /> 已检查执行状态并确认影刀引擎停止</label>
            <button type="button" disabled={!ack || !reconcileNotes.trim() || busy} onClick={() => void reconcile()}>关闭异常任务</button>
          </div>}
        </>}
      </div>
    </div>
  </section>;
}
