import { useState } from 'react';
import { Button, Icon } from '../../../client/components';
import type {
  AssistantChannel,
  AssistantOptions,
  AssistantResults,
  AssistantSession,
} from '../../shared/assistant';
import { EmailPreview } from '../components/EmailPreview';
import { downloadAssistantReport } from './api';

export function DraftPreview({
  session,
  options,
  busy,
  writable,
  onConfirm,
  onEdit,
  onEditContent,
}: {
  session: AssistantSession;
  options: AssistantOptions | null;
  busy: boolean;
  writable: boolean;
  onConfirm: (siteAuthorized: boolean) => void;
  onEdit: () => void;
  onEditContent?: (channel: AssistantChannel) => void;
}) {
  const [authorized, setAuthorized] = useState(false);
  const [recipientPage, setRecipientPage] = useState(1);
  const recipientPages = Math.max(1, Math.ceil(session.preview.email.recipients.length / 100));
  const currentRecipientPage = Math.min(recipientPage, recipientPages);
  const shownRecipients = session.preview.email.recipients.slice(
    (currentRecipientPage - 1) * 100,
    currentRecipientPage * 100,
  );
  const email = session.pendingChannels.includes('email');
  const site = session.pendingChannels.includes('site');
  const count = session.preview.email.count,
    sites = session.preview.site.count;
  const incomplete = session.missingFields.length > 0;
  const needsInputs = session.missingFields.some(
    (field) =>
      ['contacts', 'websites', 'email'].includes(field.type) || field.key.startsWith('sender.'),
  );
  return (
    <section className="wr-lazy-card wr-lazy-review" aria-label="发送前预览">
      <span className="wr-lazy-eyebrow">内容与对象</span>
      <h2>{incomplete ? '这次发送还没准备好' : '发送前，最后看一眼'}</h2>
      <p>
        {incomplete
          ? '补齐下面的信息，就可以预览并确认。内容也能继续在聊天里调整。'
          : '确认后自动创建发送任务，结果会回到这段会话。你也可以继续聊天修改内容。'}
      </p>
      {incomplete && (
        <>
          <p className="wr-lazy-note">
            还需要：{session.missingFields.map((field) => field.label).join('、')}。
          </p>
          {writable && needsInputs && (
            <Button disabled={busy} onClick={onEdit}>
              补充名单和联系资料
            </Button>
          )}
        </>
      )}
      <details className="wr-lazy-content-preview" open={!incomplete}>
        <summary>{incomplete ? '查看已准备的邮件和留言' : '查看本次发送内容与对象'}</summary>
        <dl>
          <dt>发件人</dt>
          <dd>
            {session.draft.sender.name || '待填写'} · {session.draft.sender.email || '待填写'}
          </dd>
          {email && (
            <>
              <dt>邮件回复</dt>
              <dd>
                {session.draft.email.replyTracking && options?.replyTracking.email
                  ? '本次回复将汇入客户收件箱'
                  : `回复至 ${session.draft.email.replyTo || session.draft.sender.email || '待填写'}`}
              </dd>
            </>
          )}
          {site && (
            <>
              <dt>留言回复</dt>
              <dd>
                {session.draft.site.replyTracking && options?.replyTracking.site
                  ? '本次回复将汇入客户收件箱'
                  : `回复至 ${session.draft.sender.email || '待填写'}`}
              </dd>
            </>
          )}
        </dl>
        {email && (
          <>
            <div className="wr-lazy-result-heading">
              <h3>EDM 邮件 · {count} 位客户</h3>
              {writable && onEditContent && (
                <Button kind="quiet" disabled={busy} onClick={() => onEditContent('email')}>
                  修改邮件或换模板
                </Button>
              )}
            </div>
            <details>
              <summary>查看本次收件名单</summary>
              <div className="wr-lazy-contact-list">
                {shownRecipients.map((person) => (
                  <p key={person.id}>
                    {person.name ? person.name + ' · ' : ''}
                    {person.email}
                  </p>
                ))}
              </div>
              {recipientPages > 1 && (
                <nav className="wr-lazy-actions" aria-label="收件名单分页">
                  <Button kind="quiet" disabled={currentRecipientPage === 1}
                    onClick={() => setRecipientPage(currentRecipientPage - 1)}>
                    上一页名单
                  </Button>
                  <span>第 {currentRecipientPage} / {recipientPages} 页 · 每页 100 位</span>
                  <Button kind="quiet" disabled={currentRecipientPage === recipientPages}
                    onClick={() => setRecipientPage(currentRecipientPage + 1)}>
                    下一页名单
                  </Button>
                </nav>
              )}
            </details>
            <dl>
              <dt>邮件主题</dt>
              <dd>{session.draft.email.subject || '等待生成'}</dd>
            </dl>
            {session.draft.email.bodyHtml ? (
              <EmailPreview html={session.draft.email.bodyHtml} height={240} />
            ) : (
              <p>告诉我产品和沟通目的，我会帮你准备邮件。</p>
            )}
          </>
        )}
        {site && (
          <>
            <div className="wr-lazy-result-heading">
              <h3>网站留言 · {sites} 个网站</h3>
              {writable && onEditContent && (
                <Button kind="quiet" disabled={busy} onClick={() => onEditContent('site')}>
                  修改网站留言
                </Button>
              )}
            </div>
            <details>
              <summary>查看目标网站</summary>
              <div className="wr-lazy-contact-list">
                {session.preview.site.targets.map((url) => (
                  <p key={url}>{url}</p>
                ))}
              </div>
            </details>
            <dl>
              <dt>留言主题</dt>
              <dd>{session.draft.site.subject || '业务咨询'}</dd>
            </dl>
            <div className="wr-lazy-preview-message">
              {session.draft.site.message || '等待生成留言'}
            </div>
          </>
        )}
      </details>
      {!incomplete && site && writable && (
        <label className="wr-lazy-check">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
          />
          <span>这些网站允许提交本次业务咨询。遇到验证码等保护时，系统会跳过并报告结果。</span>
        </label>
      )}
      {!incomplete && writable && (
        <div className="wr-lazy-actions">
          <Button
            kind="primary"
            disabled={busy || !session.confirmationToken || (site && !authorized)}
            onClick={() => onConfirm(authorized)}
          >
            {busy
              ? '正在提交任务…'
              : email && site
                ? `确认发送 ${count} 封邮件并向 ${sites} 个网站留言`
                : email
                  ? `确认向 ${count} 位客户发送`
                  : `确认向 ${sites} 个网站提交`}
          </Button>
          <Button kind="secondary" disabled={busy} onClick={onEdit}>
            调整名单和联系信息
          </Button>
        </div>
      )}
    </section>
  );
}

const statuses: Record<string, string> = {
  draft: '草稿',
  prepared: '已准备',
  dispatching: '正在提交',
  submitted: '已提交队列',
  queued: '排队中',
  sending: '发送中',
  running: '执行中',
  completed: '处理完成',
  sent: '发送完成',
  paused: '已暂停',
  failed: '需要处理',
  uncertain: '结果待核实',
  needs_review: '结果待核实',
  needs_attention: '需要处理',
  unavailable: '暂时无法读取',
};
export function ResultCards({
  results,
  busy,
  writable,
  onRetry,
  onRefresh,
  onWorkbench,
  onError,
}: {
  results: AssistantResults;
  busy: boolean;
  writable: boolean;
  onRetry: (channel: AssistantChannel) => void;
  onRefresh: () => void;
  onWorkbench: (channel: AssistantChannel, taskId?: string) => void;
  onError: (error: string) => void;
}) {
  const [downloading, setDownloading] = useState('');
  return (
    <section className="wr-lazy-card" aria-label="任务结果">
      <div className="wr-lazy-result-heading">
        <h2>这次任务的结果</h2>
        <Button kind="quiet" onClick={onRefresh}>
          <Icon name="refresh" size={14} />
          刷新
        </Button>
      </div>
      <p>结果来自实际发送任务；已发送邮件和已提交留言不代表对方已阅读或回复。</p>
      {results.channels.map((result) => (
        <article key={result.taskId} className="wr-lazy-channel-result">
          <div className="wr-lazy-result-heading">
            <h3>{result.channel === 'email' ? 'EDM 邮件' : '网站留言'}</h3>
            <span className="wr-lazy-status">
              {statuses[result.status] || statuses[result.operationStatus] || '查询中'}
            </span>
          </div>
          <div className="wr-lazy-summary">
            <div>
              <strong>{result.total}</strong>目标数量
            </div>
            <div>
              <strong>{result.sent}</strong>
              {result.channel === 'email' ? '已发送' : '已提交'}
            </div>
            <div>
              <strong>{result.pending}</strong>待处理
            </div>
          </div>
          {(result.failed > 0 || result.uncertain > 0) && (
            <p>
              未完成 {result.failed} 个 · 结果待核实 {result.uncertain} 个
            </p>
          )}
          {result.error && (
            <p role="status" className="wr-lazy-note">
              {result.error}
            </p>
          )}
          <div className="wr-lazy-actions">
            {writable && result.retryable && (
              <Button disabled={busy} onClick={() => onRetry(result.channel)}>
                重试这个渠道
              </Button>
            )}
            <Button
              kind="secondary"
              disabled={!!downloading}
              onClick={async () => {
                setDownloading(result.taskId);
                try {
                  await downloadAssistantReport(result.exportPath, result.name + '_结果明细');
                } catch (error) {
                  onError(error instanceof Error ? error.message : '下载失败');
                } finally {
                  setDownloading('');
                }
              }}
            >
              <Icon name="down" size={15} />
              {downloading === result.taskId ? '正在下载…' : '下载结果 CSV'}
            </Button>
            <Button kind="quiet" onClick={() => onWorkbench(result.channel, result.taskId)}>
              在工作台查看
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
