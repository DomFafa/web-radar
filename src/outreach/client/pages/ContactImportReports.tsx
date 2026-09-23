/** @jsxImportSource react */
import React, { useEffect, useState } from "react";
import { contactsApi } from "../lib/api";

const labels: Record<string, string> = { imported: "成功（新增）", updated: "成功（覆盖）", skipped: "跳过", failed: "失败" };
const jobStatus = (job: any) => job.processed >= job.total ? "已完成"
  : job.error ? "导入中断" : Date.now() / 1000 - job.updated_at > 120 ? "等待后续批次 / 已中断" : "导入中";

export function ContactImportReports({ onClose }: { onClose: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [rowPage, setRowPage] = useState(1);
  const [rowStatus, setRowStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const result = await contactsApi.listImports(page);
        const rows = selectedId ? await contactsApi.importRows(selectedId, rowPage, rowStatus) : null;
        if (!active) return;
        setJobs(result.data || []);
        setDetail(rows);
        setError("");
        if ((rows && jobStatus(rows.job) === "导入中") || (result.data || []).some((job: any) => jobStatus(job) === "导入中")) {
          timer = setTimeout(load, 5000);
        }
      } catch (err: any) { if (active) setError(err.message || "读取报告失败"); }
      finally { if (active) setLoading(false); }
    };
    setLoading(true);
    load();
    return () => { active = false; clearTimeout(timer); };
  }, [page, selectedId, rowPage, rowStatus, revision]);
  const download = async (id: string) => {
    setDownloading(true);
    try { await contactsApi.exportImport(id); }
    catch (err: any) { setError(err.message); }
    finally { setDownloading(false); }
  };
  return <div className="modal-overlay">
    <div className="modal" role="dialog" aria-modal="true" aria-label="导入进度与报告" style={{ width: "min(1100px, 96vw)", maxWidth: "96vw" }}>
      <div className="modal-header"><h3>导入进度与报告</h3><button className="btn btn-ghost" aria-label="关闭报告" onClick={onClose}>×</button></div>
      <div className="modal-body" style={{ overflowX: "auto" }}>
        {error && <p role="alert">{error}</p>}
        <div className="flex gap-sm" style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary btn-sm" disabled={loading} onClick={() => setRevision((n) => n + 1)}>刷新</button>
          {selectedId && <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(""); setDetail(null); }}>返回导入记录</button>}
        </div>
        {loading && <p role="status">读取中...</p>}
        {!selectedId ? <>
          <div className="table-container"><table style={{ minWidth: 760 }}><thead><tr>
            <th>文件 / 目标分组</th><th>进度</th><th>新增</th><th>覆盖</th><th>跳过</th><th>失败</th><th>操作</th>
          </tr></thead><tbody>{jobs.map((job) => <tr key={job.id}>
            <td style={{ maxWidth: 240, overflowWrap: "anywhere", whiteSpace: "normal" }}>{job.name}<br />{job.group_name}<br /><small>{new Date(job.created_at * 1000).toLocaleString()}</small></td>
            <td>{jobStatus(job)}<br />{job.processed} / {job.total} ({Math.round(job.processed / job.total * 100)}%)
              <progress max={job.total} value={job.processed} style={{ display: "block", width: 140 }} /></td>
            <td>{job.imported}</td><td>{job.updated}</td><td>{job.skipped}</td><td>{job.failed}</td>
            <td><button className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(job.id); setDetail(null); setRowPage(1); setRowStatus(""); }}>查看明细</button>
              <button className="btn btn-secondary btn-sm" disabled={downloading} onClick={() => download(job.id)}>下载报告</button></td>
          </tr>)}</tbody></table></div>
          {!jobs.length && !loading && <p>暂无导入记录。报告从本次功能上线后开始记录。</p>}
          <div className="flex gap-sm" style={{ marginTop: 16 }}><button className="btn btn-secondary btn-sm" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>上一页</button>
            <span>第 {page} 页</span><button className="btn btn-secondary btn-sm" disabled={jobs.length < 20 || loading} onClick={() => setPage(page + 1)}>下一页</button></div>
        </> : detail && <>
          <h4 style={{ overflowWrap: "anywhere" }}>{detail.job.name} · {detail.job.group_name}</h4>
          <p>{jobStatus(detail.job)} · 已处理 {detail.job.processed} / {detail.job.total} · 未处理 {detail.job.total - detail.job.processed}</p>
          {detail.job.error && <p role="alert">{detail.job.error}</p>}
          <div className="flex gap-sm" style={{ flexWrap: "wrap" }}>
            <select className="form-select" aria-label="筛选导入结果" style={{ width: 170 }} value={rowStatus} onChange={(event) => { setRowStatus(event.target.value); setRowPage(1); }}>
              <option value="">全部结果</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" disabled={downloading} onClick={() => download(selectedId)}>下载完整报告</button>
          </div>
          <div className="table-container" style={{ marginTop: 16 }}><table style={{ minWidth: 600 }}><thead><tr><th>数据行</th><th>邮箱</th><th>结果</th><th>原因</th></tr></thead>
            <tbody>{detail.data.map((row: any) => <tr key={row.row_number}><td>{row.row_number}</td><td style={{ overflowWrap: "anywhere" }}>{row.email || "（空）"}</td><td>{labels[row.status]}</td><td style={{ whiteSpace: "normal" }}>{row.reason || "-"}</td></tr>)}</tbody></table></div>
          <div className="flex gap-sm" style={{ marginTop: 16 }}><button className="btn btn-secondary btn-sm" disabled={rowPage === 1 || loading} onClick={() => setRowPage(rowPage - 1)}>上一页</button>
            <span>第 {rowPage} 页</span><button className="btn btn-secondary btn-sm" disabled={rowPage * 100 >= (detail.meta?.total ?? detail.job.processed) || loading} onClick={() => setRowPage(rowPage + 1)}>下一页</button></div>
        </>}
      </div>
    </div>
  </div>;
}
