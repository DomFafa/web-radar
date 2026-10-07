import { useCallback, useEffect, useRef, useState } from 'react';
import type { Principal } from '../../../shared/model';
import { writeBusiness } from '../../../shared/access';
import { Button, Icon } from '../../../client/components';
import type {
  AssistantChannel,
  AssistantDraftPatch,
  AssistantOptions,
  AssistantResults,
  AssistantSession,
  AssistantSessionSummary,
} from '../../shared/assistant';
import { assistantApi } from './api';
import { DraftPreview, ResultCards } from './AssistantCards';
import { GuidedDraft } from './GuidedDraft';
import './assistant.css';

const statusLabel: Record<AssistantSession['status'], string> = {
  draft: '正在准备',
  ready: '等待确认',
  dispatching: '正在处理',
  submitted: '查看结果',
  needs_attention: '需要处理',
};
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : '暂时没有连接成功，请重试。';
const isConflict = (error: unknown) =>
  error instanceof Error && 'status' in error && error.status === 409;
const generationFailed = (error: unknown) =>
  error instanceof Error &&
  'code' in error &&
  ['ai_generation_failed', 'ai_unconfigured'].includes(String(error.code));
const summary = (session: AssistantSession): AssistantSessionSummary => ({
  id: session.id,
  title: session.title,
  version: session.version,
  status: session.status,
  channels: session.draft.channels,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
});

export default function AssistantPage({
  principal,
  testMode,
  onWorkbench,
}: {
  principal: Principal;
  testMode: boolean;
  onWorkbench: (channel: AssistantChannel, taskId?: string) => void;
}) {
  const writable = writeBusiness(principal);
  const [activeId, setActiveId] = useState<string | null>(() =>
    new URL(location.href).searchParams.get('conversationId'),
  );
  const [session, setSession] = useState<AssistantSession | null>(null);
  const [sessions, setSessions] = useState<AssistantSessionSummary[]>([]);
  const [options, setOptions] = useState<AssistantOptions | null>(null);
  const [results, setResults] = useState<AssistantResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [composer, setComposer] = useState('');
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const pending = useRef(false);
  const mounted = useRef(true);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scope = `wr:assistant:${principal.workspaceId}:${principal.userId}`;
  const [pendingMessage, setPendingMessage] = useState<{
    id: string;
    text: string;
    sessionId: string;
  } | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    try {
      setComposer(sessionStorage.getItem(`${scope}:${activeId || 'new'}:input`) || '');
    } catch {
      setComposer('');
    }
  }, [scope, activeId]);
  const changeComposer = (value: string) => {
    setComposer(value);
    try {
      sessionStorage.setItem(`${scope}:${activeId || 'new'}:input`, value);
    } catch {
      /* Server drafts remain available without browser storage. */
    }
  };
  const remember = useCallback((next: AssistantSession) => {
    if (!mounted.current) return;
    setSessions((current) => [summary(next), ...current.filter((item) => item.id !== next.id)]);
    if (activeRef.current === next.id)
      setSession((current) =>
        current && current.id === next.id && current.version > next.version ? current : next,
      );
  }, []);
  const choose = (id: string | null) => {
    activeRef.current = id;
    setActiveId(id);
    setSession(null);
    setResults(null);
    setError('');
    setListOpen(false);
    setPendingMessage(null);
    const url = new URL(location.href);
    if (id) url.searchParams.set('conversationId', id);
    else url.searchParams.delete('conversationId');
    history.replaceState({}, '', url);
  };
  const loadResults = useCallback(async (id: string) => {
    try {
      const next = await assistantApi.results(id);
      if (mounted.current && activeRef.current === id) setResults(next);
    } catch (error) {
      if (mounted.current && activeRef.current === id)
        setError('结果暂时无法更新。' + errorText(error));
    }
  }, []);
  useEffect(() => {
    let active = true;
    Promise.allSettled([assistantApi.list(), assistantApi.options()]).then(([history, config]) => {
      if (!active) return;
      if (history.status === 'fulfilled') setSessions(history.value);
      else setError(errorText(history.reason));
      if (config.status === 'fulfilled') setOptions(config.value);
      else setError('暂时无法读取发送配置。' + errorText(config.reason));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!activeId) return;
    let active = true;
    setLoading(true);
    assistantApi
      .get(activeId)
      .then((next) => {
        if (active) {
          remember(next);
          if (next.operations.length) void loadResults(activeId);
        }
      })
      .catch((error) => {
        if (active) setError(errorText(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeId, remember, loadResults]);
  useEffect(() => {
    if (!session || (!session.operations.length && session.status !== 'dispatching')) return;
    const id = session.id;
    const timer = window.setInterval(() => {
      if (!document.hidden && !pending.current) {
        void loadResults(id);
        assistantApi
          .get(id)
          .then(remember)
          .catch(() => {});
      }
    }, 10000);
    return () => window.clearInterval(timer);
  }, [session?.id, session?.operations.length, session?.status, loadResults, remember]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
  }, [session?.messages.length, busy]);

  async function start(channels: AssistantChannel[], message = '') {
    if (pending.current || !writable) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      let requestId = crypto.randomUUID();
      try {
        const saved = JSON.parse(sessionStorage.getItem(`${scope}:new:create`) || 'null');
        if (
          typeof saved?.id === 'string' &&
          JSON.stringify(saved.channels) === JSON.stringify(channels) &&
          saved.message === message
        )
          requestId = saved.id;
        sessionStorage.setItem(
          `${scope}:new:create`,
          JSON.stringify({ id: requestId, channels, message }),
        );
      } catch {
        /* The server still protects each known request ID. */
      }
      let next = await assistantApi.create(channels, requestId);
      try {
        sessionStorage.removeItem(`${scope}:new:create`);
      } catch {
        /* Creation is complete. */
      }
      if (!mounted.current) return;
      choose(next.id);
      remember(next);
      if (message) {
        const request = { id: crypto.randomUUID(), text: message, sessionId: next.id };
        setPendingMessage(request);
        try {
          sessionStorage.setItem(`${scope}:${next.id}:input`, message);
        } catch {
          /* The request stays in memory. */
        }
        setComposer(message);
        next = await assistantApi.message(next, message, request.id);
        remember(next);
        setPendingMessage(null);
        setComposer('');
        try {
          sessionStorage.removeItem(`${scope}:${next.id}:input`);
          sessionStorage.removeItem(`${scope}:new:input`);
        } catch {
          /* Server history is saved. */
        }
      }
    } catch (error) {
      if (mounted.current) {
        setError(errorText(error));
        if (generationFailed(error))
          setPendingMessage((current) =>
            current ? { ...current, id: crypto.randomUUID() } : null,
          );
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function sendMessage(retry = false, content?: string): Promise<AssistantSession | null> {
    const text = content ?? (retry ? pendingMessage?.text : composer.trim());
    if (!text || pending.current || !writable) return null;
    if (!session) {
      await start([], text);
      return null;
    }
    const current = session;
    const request =
      retry && pendingMessage?.sessionId === current.id
        ? pendingMessage
        : { id: crypto.randomUUID(), text, sessionId: current.id };
    setPendingMessage(request);
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const next = await assistantApi.message(current, text, request.id);
      remember(next);
      if (activeRef.current === current.id) {
        changeComposer('');
        setPendingMessage(null);
      }
      return next;
    } catch (error) {
      if (activeRef.current === current.id) {
        setError(errorText(error));
        if (generationFailed(error)) setPendingMessage({ ...request, id: crypto.randomUUID() });
        if (isConflict(error)) {
          try {
            remember(await assistantApi.get(current.id));
            setPendingMessage(null);
          } catch {
            /* Keep the original failure visible. */
          }
        }
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
    return null;
  }
  async function saveInputs(draft: AssistantDraftPatch): Promise<AssistantSession | null> {
    if (!session || pending.current || !writable) return null;
    pending.current = true;
    setBusy(true);
    setError('');
    const current = session;
    try {
      const next = await assistantApi.patch(current, draft, crypto.randomUUID());
      remember(next);
      return activeRef.current === current.id ? next : null;
    } catch (error) {
      if (activeRef.current === current.id) {
        setError(errorText(error));
        if (isConflict(error))
          assistantApi
            .get(current.id)
            .then(remember)
            .catch(() => {});
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
    return null;
  }
  async function confirm(siteAuthorized: boolean) {
    if (!session || !session.confirmationToken || pending.current || !writable) return;
    const current = session;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const next = await assistantApi.confirm(current, siteAuthorized, crypto.randomUUID());
      remember(next);
      await loadResults(current.id);
    } catch (error) {
      if (activeRef.current === current.id) {
        setError(errorText(error));
        try {
          remember(await assistantApi.get(current.id));
          await loadResults(current.id);
        } catch {
          /* Never repeat an uncertain confirmation automatically. */
        }
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function retryChannel(channel: AssistantChannel) {
    if (!session || pending.current || !writable) return;
    const current = session;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      remember(await assistantApi.retry(current, channel, crypto.randomUUID()));
      await loadResults(current.id);
    } catch (error) {
      if (activeRef.current === current.id) {
        setError(errorText(error));
        try {
          remember(await assistantApi.get(current.id));
          await loadResults(current.id);
        } catch {
          /* Recover before offering another retry. */
        }
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const hasContent =
    !!session &&
    ((session.pendingChannels.includes('email') && !!session.draft.email.bodyHtml) ||
      (session.pendingChannels.includes('site') && !!session.draft.site.message));
  const processing = busy || session?.status === 'dispatching';
  return (
    <section className="wr-lazy" aria-label="懒人模式">
      <aside className={`wr-lazy-rail ${listOpen ? 'is-open' : ''}`} aria-label="会话列表">
        <strong>
          懒人模式<span className="wr-lazy-beta">Beta</span>
        </strong>
        <Button kind="secondary" disabled={busy || !writable} onClick={() => choose(null)}>
          <Icon name="plus" size={15} />
          新建会话
        </Button>
        <div className="wr-lazy-rail-label">
          <span>我的会话</span>
          <span>{sessions.length}</span>
        </div>
        <nav aria-label="我的会话">
          {sessions.map((item) => (
            <button
              className="wr-lazy-chat-row"
              key={item.id}
              type="button"
              disabled={busy}
              aria-current={item.id === activeId ? 'page' : undefined}
              onClick={() => choose(item.id)}
            >
              <Icon name={item.channels.includes('email') ? 'mail' : 'message'} size={17} />
              <span>
                <strong>{item.title}</strong>
                <small>
                  {new Date(item.updatedAt).toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                  })}{' '}
                  · {statusLabel[item.status]}
                </small>
              </span>
            </button>
          ))}
          {!sessions.length && !loading && (
            <p className="wr-lazy-empty-rail">
              选一个目标，
              <br />
              开始你的第一段会话。
            </p>
          )}
        </nav>
        <p className="wr-lazy-rail-note">
          资料、内容和结果都留在会话里。
          <br />
          你可以随时回来继续。
        </p>
      </aside>
      <div className="wr-lazy-main">
        <div className="wr-lazy-conversation">
          <div className="wr-lazy-mobile-bar">
            <Button
              kind="quiet"
              aria-expanded={listOpen}
              onClick={() => setListOpen((value) => !value)}
            >
              会话列表
            </Button>
            <span>懒人模式</span>
            <Button kind="quiet" disabled={busy} onClick={() => choose(null)}>
              新建
            </Button>
          </div>
          {!activeId && (
            <section className="wr-lazy-welcome">
              <span className="wr-lazy-eyebrow">WEB RADAR · 懒人模式</span>
              <h1>今天想完成什么？</h1>
              <p>选一个目标，开启一段专属会话。一步一步，把结果做出来。</p>
              <div className="wr-lazy-home-options">
                <button disabled={busy || !writable} onClick={() => void start(['email'])}>
                  <span className="wr-lazy-option-icon">
                    <Icon name="mail" size={22} />
                  </span>
                  <span>
                    <strong>给客户发一封邮件</strong>
                    <small>聊聊产品和沟通目的，准备邮件，选择客户并发送。</small>
                  </span>
                  <Icon name="external" size={16} />
                </button>
                <button disabled={busy || !writable} onClick={() => void start(['site'])}>
                  <span className="wr-lazy-option-icon">
                    <Icon name="message" size={22} />
                  </span>
                  <span>
                    <strong>向客户网站留言</strong>
                    <small>提供网站和联系资料，准备留言，提交后查看结果。</small>
                  </span>
                  <Icon name="external" size={16} />
                </button>
              </div>
              <p className="wr-lazy-muted">
                也可以直接告诉我你的想法。邮件、网站留言和结果下载，都在这里完成。
              </p>
            </section>
          )}
          {session && (
            <header className="wr-lazy-header">
              <div>
                <span className="wr-lazy-eyebrow">懒人模式 · Beta</span>
                <h1>{session.title}</h1>
                <p>说说你的想法，资料和结果都留在这段会话里。</p>
              </div>
              <span className="wr-lazy-status">{statusLabel[session.status]}</span>
            </header>
          )}
          {!writable && (
            <p className="wr-lazy-note">当前角色仅可查看会话和结果，不能生成内容或发送。</p>
          )}
          {testMode && (
            <p className="wr-lazy-note">本地测试环境：可验证对话和草稿，不会向真实客户发送。</p>
          )}
          {options && !options.aiConfigured && (
            <p className="wr-lazy-note">
              文字服务尚未配置，请联系管理员启用。已保存的会话与发送结果仍可查看。
            </p>
          )}
          {loading && activeId && (
            <p role="status" className="wr-lazy-note">
              正在恢复会话…
            </p>
          )}
          {session && (
            <div className="wr-lazy-transcript" role="log" aria-label="聊天记录" aria-live="polite">
              {session.messages.map((message) => (
                <div
                  key={message.id}
                  className={`wr-lazy-message ${message.role === 'user' ? 'is-user' : ''}`}
                >
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
          )}
          {session && writable && session.pendingChannels.length > 0 && (
            <GuidedDraft
              key={`${session.id}:${session.pendingChannels.join(',')}`}
              session={session}
              options={options}
              busy={processing}
              storageKey={`${scope}:${session.id}:${session.pendingChannels.join(',')}:guidance`}
              onRefreshOptions={async () => {
                const next = await assistantApi.options();
                setOptions(next);
                return next;
              }}
              onSave={saveInputs}
              onGenerate={(content) => sendMessage(false, content)}
              onConfirm={(authorized) => void confirm(authorized)}
            />
          )}
          {session && hasContent && !writable && (
            <DraftPreview
              key={`${session.id}:${session.version}`}
              session={session}
              options={options}
              busy={processing}
              writable={writable}
              onConfirm={(authorized) => void confirm(authorized)}
              onEdit={() => {}}
            />
          )}
          {results && results.channels.length > 0 && (
            <ResultCards
              results={results}
              busy={busy}
              writable={writable}
              onRetry={(channel) => void retryChannel(channel)}
              onRefresh={() => void loadResults(results.sessionId)}
              onWorkbench={onWorkbench}
              onError={setError}
            />
          )}
          {error && (
            <div className="wr-lazy-error" role="alert">
              {error}
              {pendingMessage && (
                <div>
                  <Button kind="secondary" disabled={busy} onClick={() => void sendMessage(true)}>
                    重试这条消息
                  </Button>
                </div>
              )}
              {activeId && (
                <div>
                  <Button
                    kind="quiet"
                    disabled={busy}
                    onClick={() => {
                      setError('');
                      assistantApi
                        .get(activeId)
                        .then(remember)
                        .then(() => loadResults(activeId))
                        .catch((e) => setError(errorText(e)));
                    }}
                  >
                    恢复已保存状态
                  </Button>
                </div>
              )}
            </div>
          )}
          {processing && (
            <p className="wr-lazy-note" role="status">
              正在整理这一步，请稍候…
            </p>
          )}
          <div ref={bottomRef} />
          {writable && (
            <form
              className="wr-lazy-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <div className="wr-lazy-composer-box">
                <textarea
                  ref={composerRef}
                  aria-label="给助手的消息"
                  placeholder={
                    session?.operations.length
                      ? '继续告诉我下一步想做什么…'
                      : '例如：帮我给客户介绍我们的新品，语气自然一些…'
                  }
                  value={composer}
                  onChange={(e) => changeComposer(e.target.value)}
                  maxLength={8000}
                  disabled={processing}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                />
                <div className="wr-lazy-composer-footer">
                  <small>Enter 发送 · Shift + Enter 换行</small>
                  <Button
                    type="submit"
                    disabled={processing || !composer.trim() || (!!activeId && !session)}
                  >
                    发送
                    <Icon name="arrow" size={15} />
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
