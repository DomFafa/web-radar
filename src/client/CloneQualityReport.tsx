import { useState } from 'react';
import type { CloneConfig } from '../shared/model';
import { api, errorMessage } from './api';
import { Button, Modal, Notice } from './components';
type Report = {
  records: {
    path: string;
    width: number;
    issues: string[];
    warnings: string[];
    thumbnailDifference?: number | null;
  }[];
  screenshots: Record<string, string>;
};
export function CloneQualityReport({
  projectId,
  quality,
}: {
  projectId: string;
  quality: NonNullable<NonNullable<CloneConfig['generation']>['quality']>;
}) {
  const [report, setReport] = useState<Report | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    setError('');
    try {
      setReport(
        await api<Report>(`/api/projects/${encodeURIComponent(projectId)}/clone/quality-report`),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ textAlign: 'left', marginBottom: 16 }}>
      <Notice tone={quality.status === 'passed' ? 'success' : 'warning'}>
        {quality.message}
        {quality.sampledPages
          ? ` 抽查 ${quality.sampledPages} 页，宽度 ${quality.widths?.join(' / ')}px。`
          : ''}
      </Notice>
      {!!quality.issues?.length && (
        <ul>
          {quality.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
      {quality.reportKey && (
        <Button busy={busy} onClick={open}>
          查看检查报告与截图
        </Button>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {report && (
        <Modal title="生成页面检查报告" onClose={() => setReport(null)}>
          <p>
            仅检查抽样页面的溢出、图片与正文。缩略图差异用于定位问题，不表示像素还原已验收；截图检查禁用外部请求与页面脚本。
          </p>
          {report.records.map((row) => (
            <section key={`${row.path}@${row.width}`} className="panel">
              <strong>
                {row.path} · {row.width}px
              </strong>
              {[...row.issues, ...row.warnings].map((text, index) => (
                <p key={index}>{text}</p>
              ))}
              {row.thumbnailDifference != null && (
                <p>
                  参考缩略图平均色差：{(row.thumbnailDifference * 100).toFixed(1)}
                  %（不同裁切会影响结果）
                </p>
              )}
              {report.screenshots[`${row.path}@${row.width}`]?.startsWith(
                'data:image/webp;base64,',
              ) && (
                <img
                  alt={`${row.path} 在 ${row.width}px 下的截图`}
                  src={report.screenshots[`${row.path}@${row.width}`]}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}
            </section>
          ))}
        </Modal>
      )}
    </div>
  );
}
