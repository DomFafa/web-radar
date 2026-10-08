import { useEffect, useState } from 'react';
import { Button, Icon } from '../../../client/components';
import type {
  AssistantChannel,
  AssistantDraftPatch,
  AssistantOptions,
  AssistantResults,
  AssistantSession,
} from '../../shared/assistant';
import { normalizeSiteTargets } from '../../shared/site-targets';
import { EmailPreview } from '../components/EmailPreview';
import { assistantApi, downloadAssistantReport } from './api';

export function NecessaryInputs({
  session,
  options,
  busy,
  storageKey,
  onRefreshOptions,
  onSave,
  onCancel,
}: {
  session: AssistantSession;
  options: AssistantOptions | null;
  busy: boolean;
  storageKey: string;
  onRefreshOptions: () => Promise<AssistantOptions>;
  onSave: (draft: AssistantDraftPatch) => void;
  onCancel: () => void;
}) {
  const draft = session.draft;
  const [restored] = useState(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (
        !value ||
        !value.sender ||
        !Object.keys(draft.sender).every((key) => typeof value.sender[key] === 'string') ||
        !['group', 'tag', 'contacts'].includes(value.audienceMethod) ||
        !['groupId', 'tag', 'targets'].every((key) => typeof value[key] === 'string') ||
        !Array.isArray(value.contactIds) ||
        !value.contactIds.every((id: unknown) => typeof id === 'string')
      )
        return null;
      return value as {
        sender: typeof draft.sender;
        audienceMethod: string;
        groupId: string;
        tag: string;
        targets: string;
        contactIds: string[];
        emailTracking?: boolean;
        siteTracking?: boolean;
      };
    } catch {
      return null;
    }
  });
  const [sender, setSender] = useState(restored?.sender || draft.sender);
  const [audienceMethod, setAudienceMethod] = useState(
    restored?.audienceMethod ||
      (draft.email.tag ? 'tag' : draft.email.contactIds.length ? 'contacts' : 'group'),
  );
  const [groupId, setGroupId] = useState(restored?.groupId ?? draft.email.groupId);
  const [tag, setTag] = useState(restored?.tag ?? draft.email.tag);
  const [contactIds, setContactIds] = useState(restored?.contactIds || draft.email.contactIds);
  const [contacts, setContacts] = useState(options?.contacts || []);
  const [search, setSearch] = useState('');
  const [targets, setTargets] = useState(restored?.targets ?? draft.site.targets.join('\n'));
  const [emailTracking, setEmailTracking] = useState(
    restored?.emailTracking ?? draft.email.replyTracking,
  );
  const [siteTracking, setSiteTracking] = useState(
    restored?.siteTracking ?? draft.site.replyTracking,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const email = session.pendingChannels.includes('email');
  const site = session.pendingChannels.includes('site');
  const analysis = normalizeSiteTargets(targets);
  useEffect(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          sender,
          audienceMethod,
          groupId,
          tag,
          contactIds,
          targets,
          emailTracking,
          siteTracking,
        }),
      );
    } catch {
      /* Saving to the server is still available. */
    }
  }, [
    storageKey,
    sender,
    audienceMethod,
    groupId,
    tag,
    contactIds,
    targets,
    emailTracking,
    siteTracking,
  ]);
  useEffect(() => {
    if (audienceMethod !== 'contacts' || search.trim().length < 2) return;
    let active = true;
    const timer = window.setTimeout(() => {
      assistantApi
        .options(search)
        .then((result) => {
          if (active) {
            setContacts(result.contacts);
            setError('');
          }
        })
        .catch(() => {
          if (active) setError('联系人查询暂时失败，请重试。');
        });
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, audienceMethod]);
  return (
    <form
      className="wr-lazy-card"
      aria-label="必要发送资料"
      onSubmit={(event) => {
        event.preventDefault();
        if (site && (analysis.invalid.length || analysis.normalized.size > 500)) {
          setError('请先修正无效网址，每次最多 500 个网站。');
          return;
        }
        onSave({
          sender,
          ...(email
            ? {
                email: {
                  groupId: audienceMethod === 'group' ? groupId : '',
                  tag: audienceMethod === 'tag' ? tag : '',
                  contactIds: audienceMethod === 'contacts' ? contactIds : [],
                  replyTracking: emailTracking,
                },
              }
            : {}),
          ...(site
            ? {
                site: {
                  targets: Array.from(analysis.normalized.values()).map((item) => item.url),
                  replyTracking: siteTracking,
                },
              }
            : {}),
        });
      }}
    >
      <h2>补充发送所需的资料</h2>
      <p>这些信息会用于本次任务；邮件和留言内容可以继续在聊天里调整。</p>
      {email && (
        <>
          <h3>选择客户名单</h3>
          <div className="wr-lazy-pills" aria-label="选择名单方式">
            {[
              ['group', '已有分组'],
              ['tag', '联系人标签'],
              ['contacts', '指定联系人'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={audienceMethod === value}
                onClick={() => setAudienceMethod(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {audienceMethod === 'group' && (
            <label className="wr-lazy-field">
              客户分组
              <select
                aria-label="客户分组"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">请选择客户名单</option>
                {options?.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} · {group.contactCount} 位联系人
                  </option>
                ))}
              </select>
            </label>
          )}
          {audienceMethod === 'tag' && (
            <label className="wr-lazy-field">
              标签
              <select value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="">请选择标签</option>
                {options?.tags.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          )}
          {audienceMethod === 'contacts' && (
            <>
              <label className="wr-lazy-field">
                搜索联系人
                <input
                  placeholder="输入姓名或邮箱，至少 2 个字符"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <p>已选择 {contactIds.length} 位联系人</p>
              <div className="wr-lazy-contact-list">
                {contacts.map((contact) => (
                  <label key={contact.id} className="wr-lazy-check">
                    <input
                      type="checkbox"
                      checked={contactIds.includes(contact.id)}
                      onChange={() =>
                        setContactIds((ids) =>
                          ids.includes(contact.id)
                            ? ids.filter((id) => id !== contact.id)
                            : [...ids, contact.id],
                        )
                      }
                    />
                    <span>
                      {contact.name || contact.email}
                      <small className="wr-lazy-muted"> {contact.name ? contact.email : ''}</small>
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
          <p className="wr-lazy-muted">
            名单来自当前工作区，发送时仍会排除已退订客户。
            <a href="/?view=edm&edmTab=contacts" target="_blank" rel="noreferrer">
              导入新名单
            </a>
          </p>
          <Button
            kind="quiet"
            type="button"
            disabled={refreshing || busy}
            onClick={async () => {
              setRefreshing(true);
              try {
                const next = await onRefreshOptions();
                setContacts(next.contacts);
                setError('');
              } catch {
                setError('客户名单暂时无法更新，请重试。');
              } finally {
                setRefreshing(false);
              }
            }}
          >
            {refreshing ? '正在更新名单…' : '刷新客户名单'}
          </Button>
        </>
      )}
      {site && (
        <label className="wr-lazy-field">
          目标网站
          <textarea
            aria-label="目标网站"
            rows={4}
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
            placeholder="每行一个网站，例如 https://example.com/contact"
          />
          <small>
            有效 {analysis.normalized.size} 个 · 重复 {analysis.duplicates.length} 个 · 无效{' '}
            {analysis.invalid.length} 个
          </small>
          {analysis.invalid.length > 0 && (
            <small role="alert">请检查：{analysis.invalid.slice(0, 5).join('、')}</small>
          )}
        </label>
      )}
      <h3>对方看到的联系信息</h3>
      <div className="wr-lazy-fields">
        <label className="wr-lazy-field">
          姓名 / 发件人名称
          <input
            aria-label="发件人名称"
            required
            value={sender.name}
            maxLength={100}
            onChange={(e) => setSender({ ...sender, name: e.target.value })}
          />
        </label>
        <label className="wr-lazy-field">
          邮箱
          <input
            aria-label="发件人邮箱"
            type="email"
            required
            value={sender.email}
            onChange={(e) => setSender({ ...sender, email: e.target.value })}
            placeholder={
              email && options?.senderDomains[0]
                ? `sales@${options.senderDomains[0].domain}`
                : 'you@company.com'
            }
          />
        </label>
      </div>
      {email && (
        <p>
          {options?.senderDomains.length
            ? `已验证发信域名：${options.senderDomains.map((item) => '@' + item.domain).join('、')}`
            : '尚未取得可用发信域名。可以保存资料，发送前需要管理员完成配置。'}
        </p>
      )}
      {email && (options?.replyTracking.email || emailTracking) && (
        <label className="wr-lazy-check">
          <input
            type="checkbox"
            checked={emailTracking}
            onChange={(e) => setEmailTracking(e.target.checked)}
          />
          <span>
            将本次邮件的回复汇入客户收件箱
            {!options?.replyTracking.email ? '（配置已停用，请关闭后发送）' : ''}
          </span>
        </label>
      )}
      {site && (options?.replyTracking.site || siteTracking) && (
        <label className="wr-lazy-check">
          <input
            type="checkbox"
            checked={siteTracking}
            onChange={(e) => setSiteTracking(e.target.checked)}
          />
          <span>
            将本次网站留言的回复汇入客户收件箱
            {!options?.replyTracking.site ? '（配置已停用，请关闭后提交）' : ''}
          </span>
        </label>
      )}
      <details>
        <summary>更多联系资料（选填）</summary>
        <label className="wr-lazy-field">
          公司名称
          <input
            value={sender.company}
            maxLength={200}
            onChange={(e) => setSender({ ...sender, company: e.target.value })}
          />
        </label>
        {site && (
          <div className="wr-lazy-fields">
            {(['phone', 'country', 'city', 'address'] as const).map((key) => (
              <label key={key} className="wr-lazy-field">
                {{ phone: '电话', country: '国家 / 地区', city: '城市', address: '地址' }[key]}
                <input
                  value={sender[key]}
                  onChange={(e) => setSender({ ...sender, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
        )}
      </details>
      {error && (
        <p role="alert" className="wr-lazy-error">
          {error}
        </p>
      )}
      <div className="wr-lazy-actions">
        <Button type="submit" disabled={busy}>
          {busy ? '正在保存…' : '保存资料，继续聊天'}
        </Button>
        <Button kind="quiet" type="button" disabled={busy} onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

export function DraftPreview({
  session,
  options,
  busy,
  writable,
  onConfirm,
  onEdit,
}: {
  session: AssistantSession;
  options: AssistantOptions | null;
  busy: boolean;
  writable: boolean;
  onConfirm: (siteAuthorized: boolean) => void;
  onEdit: () => void;
}) {
  const [authorized, setAuthorized] = useState(false);
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
      <h2>{incomplete ? '内容已准备，继续完善这次任务' : '发送前，最后看一眼'}</h2>
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
            <h3>EDM 邮件 · {count} 位客户</h3>
            <details>
              <summary>查看本次收件名单</summary>
              <div className="wr-lazy-contact-list">
                {session.preview.email.recipients.map((person) => (
                  <p key={person.id}>
                    {person.name ? person.name + ' · ' : ''}
                    {person.email}
                  </p>
                ))}
              </div>
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
            <h3>网站留言 · {sites} 个网站</h3>
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
