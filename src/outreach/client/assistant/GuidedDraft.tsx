import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../client/components';
import type {
  AssistantDraft,
  AssistantDraftPatch,
  AssistantOptions,
  AssistantSession,
} from '../../shared/assistant';
import { normalizeSiteTargets } from '../../shared/site-targets';
import { assistantApi } from './api';
import { DraftPreview } from './AssistantCards';
import {
  firstIncompleteGuidanceStep,
  guidanceSteps,
  guidedSteps,
  stepDraftPatch,
  validateGuidanceStep,
  type GuidanceStep,
} from './guidance';

type ContentSource = 'ai' | 'manual';
function applyLocal(current: AssistantDraft, patch: AssistantDraftPatch): AssistantDraft {
  return {
    ...current,
    ...patch,
    sender: { ...current.sender, ...patch.sender },
    email: { ...current.email, ...patch.email },
    site: { ...current.site, ...patch.site },
  };
}
function textHtml(value: string) {
  return value
    .split(/\n\s*\n/)
    .map(
      (paragraph) =>
        `<p>${paragraph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`,
    )
    .join('');
}
function emailText(draft: AssistantDraft) {
  if (draft.email.bodyText) return draft.email.bodyText;
  return typeof DOMParser === 'undefined'
    ? draft.email.bodyHtml.replace(/<[^>]*>/g, ' ')
    : new DOMParser().parseFromString(draft.email.bodyHtml, 'text/html').body.textContent || '';
}
function stepSummary(step: GuidanceStep, draft: AssistantDraft, options: AssistantOptions | null) {
  switch (step) {
    case 'emailAudience':
      return draft.email.contactIds.length
        ? `已选 ${draft.email.contactIds.length} 位联系人`
        : draft.email.tag
          ? `标签：${draft.email.tag}`
          : options?.groups.find((item) => item.id === draft.email.groupId)?.name ||
            '已选择客户分组';
    case 'siteTargets':
      return `${normalizeSiteTargets(draft.site.targets).normalized.size} 个目标网站`;
    case 'senderName':
      return draft.sender.name;
    case 'senderEmail':
      return draft.sender.email;
    case 'contentSource':
      return draft.brief ? '已按你的要求准备内容' : '使用已填写的内容';
    case 'emailSubject':
      return draft.email.subject;
    case 'emailBody':
      return '邮件正文已准备，可在预览中查看';
    case 'siteSubject':
      return draft.site.subject || '不填写主题';
    case 'siteBody':
      return '网站留言已准备，可在预览中查看';
    case 'review':
      return '发送前确认';
  }
}

export function GuidedDraft({
  session,
  options,
  busy,
  storageKey,
  onRefreshOptions,
  onSave,
  onGenerate,
  onConfirm,
}: {
  session: AssistantSession;
  options: AssistantOptions | null;
  busy: boolean;
  storageKey: string;
  onRefreshOptions: () => Promise<AssistantOptions>;
  onSave: (patch: AssistantDraftPatch) => Promise<AssistantSession | null>;
  onGenerate: (message: string) => Promise<AssistantSession | null>;
  onConfirm: (authorized: boolean) => void;
}) {
  const steps = guidanceSteps(session.pendingChannels);
  const [restored] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (
        saved?.version !== session.version ||
        !steps.includes(saved.step) ||
        !saved.draft?.sender ||
        !saved.draft.email ||
        !saved.draft.site ||
        !Array.isArray(saved.draft.email.contactIds) ||
        !Array.isArray(saved.draft.site.targets) ||
        !Array.isArray(saved.dirty) ||
        !saved.dirty.every((item: GuidanceStep) => steps.includes(item)) ||
        !Object.keys(session.draft.sender).every(
          (key) => typeof saved.draft.sender[key] === 'string',
        )
      )
        return null;
      return saved as {
        draft: AssistantDraft;
        step: GuidanceStep;
        dirty: GuidanceStep[];
        source: ContentSource;
      };
    } catch {
      return null;
    }
  });
  const scopedDraft = { ...session.draft, channels: session.pendingChannels };
  const [draft, setDraft] = useState<AssistantDraft>(restored?.draft || scopedDraft);
  const [step, setStep] = useState<GuidanceStep>(
    restored?.step || firstIncompleteGuidanceStep(scopedDraft, options),
  );
  const [dirty, setDirty] = useState<GuidanceStep[]>(restored?.dirty || []);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const [source, setSource] = useState<ContentSource>(
    restored?.source || (options?.aiConfigured ? 'ai' : 'manual'),
  );
  const [audienceMethod, setAudienceMethod] = useState(
    draft.email.tag ? 'tag' : draft.email.contactIds.length ? 'contacts' : 'group',
  );
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState(options?.contacts || []);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [htmlMode, setHtmlMode] = useState(false);
  const index = Math.max(0, steps.indexOf(step));
  const email = session.pendingChannels.includes('email');
  const site = session.pendingChannels.includes('site');
  const analysis = normalizeSiteTargets(draft.site.targets);
  const reviewError = validateGuidanceStep('review', scopedDraft, options);

  useEffect(() => {
    setDraft((current) =>
      dirtyRef.current.reduce((next, item) => applyLocal(next, stepDraftPatch(item, current)), {
        ...session.draft,
        channels: session.pendingChannels,
      }),
    );
  }, [session.version]);
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: session.version, draft, step, dirty, source }),
      );
    } catch {
      /* Server saves still work without browser storage. */
    }
  }, [storageKey, session.version, draft, step, dirty, source]);
  useEffect(() => {
    if (step !== 'emailAudience' || audienceMethod !== 'contacts' || search.trim().length < 2)
      return;
    let active = true;
    const timer = window.setTimeout(() => {
      assistantApi
        .options(search)
        .then((next) => {
          if (active) setContacts(next.contacts);
        })
        .catch(() => {
          if (active) setError('联系人查询暂时失败，请重试。');
        });
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, audienceMethod, step]);

  function edit(patch: AssistantDraftPatch) {
    setDraft((current) => applyLocal(current, patch));
    setDirty((current) => (current.includes(step) ? current : [...current, step]));
    setError('');
  }
  function go(next: GuidanceStep) {
    setError('');
    setStep(next);
  }
  async function next() {
    if (busy) return;
    const manualSource = step === 'contentSource' && source === 'manual';
    const invalid = manualSource
      ? null
      : step === 'contentSource' && !draft.brief.trim()
        ? '请说明这次要介绍的产品或服务，以及希望客户采取的行动。'
        : validateGuidanceStep(step, draft, options);
    if (invalid) {
      setError(invalid);
      return;
    }
    const saved = manualSource
      ? dirty.includes(step)
        ? await onSave({ brief: draft.brief })
        : session
      : step === 'contentSource'
        ? await onGenerate(draft.brief.trim())
        : await onSave(stepDraftPatch(step, draft));
    if (!saved) return;
    if (step === 'emailAudience' && !saved.preview.email.count) {
      setError('当前名单没有可发送的联系人，请换一个名单或导入联系人。');
      return;
    }
    const remaining = dirty.filter((item) => item !== step);
    setDirty(remaining);
    setDraft(
      remaining.reduce((value, item) => applyLocal(value, stepDraftPatch(item, draft)), {
        ...saved.draft,
        channels: saved.pendingChannels,
      }),
    );
    go(steps[index + 1]);
  }
  const advancedContact = (
    <details className="wr-lazy-guided-advanced">
      <summary>更多联系资料与回复设置（选填）</summary>
      {site &&
        (['phone', 'country', 'city', 'address'] as const).map((key) => (
          <label key={key} className="wr-lazy-field">
            {{ phone: '电话', country: '国家 / 地区', city: '城市', address: '地址' }[key]}
            <input
              value={draft.sender[key]}
              onChange={(event) => edit({ sender: { [key]: event.target.value } })}
            />
          </label>
        ))}
      {email && (
        <label className="wr-lazy-field">
          回复邮箱
          <input
            aria-label="回复邮箱"
            type="email"
            value={draft.email.replyTo}
            placeholder="不填写则回复至发件邮箱"
            onChange={(event) => edit({ email: { replyTo: event.target.value } })}
          />
        </label>
      )}
      {email && (options?.replyTracking.email || draft.email.replyTracking) && (
        <label className="wr-lazy-check">
          <input
            type="checkbox"
            checked={draft.email.replyTracking}
            onChange={(event) => edit({ email: { replyTracking: event.target.checked } })}
          />
          <span>
            邮件回复汇入客户收件箱{!options?.replyTracking.email ? '（配置已停用，请关闭）' : ''}
          </span>
        </label>
      )}
      {site && (options?.replyTracking.site || draft.site.replyTracking) && (
        <label className="wr-lazy-check">
          <input
            type="checkbox"
            checked={draft.site.replyTracking}
            onChange={(event) => edit({ site: { replyTracking: event.target.checked } })}
          />
          <span>
            网站留言回复汇入客户收件箱{!options?.replyTracking.site ? '（配置已停用，请关闭）' : ''}
          </span>
        </label>
      )}
    </details>
  );
  return (
    <section className="wr-lazy-guidance" aria-label="逐步准备发送" data-guidance-step={step}>
      <div className="wr-lazy-guided-progress" aria-label="发送准备进度">
        <span>
          步骤 {index + 1} / {steps.length}
        </span>
        <strong>{guidedSteps[step].label}</strong>
        <progress max={steps.length} value={index + 1} aria-label="当前步骤" />
      </div>
      {index > 0 && (
        <div className="wr-lazy-guided-summaries" aria-label="已完成的步骤">
          {steps.slice(0, index).map((item) => (
            <button
              key={item}
              type="button"
              disabled={busy}
              onClick={() => go(item)}
              aria-label={`修改${guidedSteps[item].label}`}
            >
              <span className="wr-lazy-guided-tick">✓</span>
              <span>
                <small>{guidedSteps[item].label}</small>
                <strong>{stepSummary(item, draft, options)}</strong>
              </span>
              <span className="wr-lazy-guided-edit">修改</span>
            </button>
          ))}
        </div>
      )}
      {step === 'review' ? (
        <>
          <Button kind="quiet" disabled={busy} onClick={() => go(steps[index - 1])}>
            上一步
          </Button>
          {dirty.length > 0 && (
            <p className="wr-lazy-note">还有未保存的修改。请点击上方对应步骤，保存后再确认发送。</p>
          )}
          {reviewError && (
            <p role="alert" className="wr-lazy-note">
              {reviewError} 请点击上方对应步骤补齐。
            </p>
          )}
          <DraftPreview
            key={`${session.id}:${session.version}`}
            session={session}
            options={options}
            busy={busy}
            writable={dirty.length === 0 && !reviewError}
            onConfirm={(authorized) => {
              if (!reviewError && !dirty.length) onConfirm(authorized);
            }}
            onEdit={() =>
              go(
                firstIncompleteGuidanceStep(scopedDraft, options) === 'review'
                  ? steps[0]
                  : firstIncompleteGuidanceStep(scopedDraft, options),
              )
            }
          />
        </>
      ) : (
        <form
          className="wr-lazy-card wr-lazy-guided-card"
          onSubmit={(event) => {
            event.preventDefault();
            void next();
          }}
        >
          <fieldset disabled={busy}>
            <h2>{guidedSteps[step].question}</h2>
            {step === 'emailAudience' && (
              <>
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
                      onClick={() => {
                        setAudienceMethod(value);
                        edit({ email: { groupId: '', tag: '', contactIds: [] } });
                      }}
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
                      value={draft.email.groupId}
                      onChange={(event) =>
                        edit({ email: { groupId: event.target.value, tag: '', contactIds: [] } })
                      }
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
                    联系人标签
                    <select
                      aria-label="联系人标签"
                      value={draft.email.tag}
                      onChange={(event) =>
                        edit({ email: { tag: event.target.value, groupId: '', contactIds: [] } })
                      }
                    >
                      <option value="">请选择标签</option>
                      {options?.tags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
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
                        aria-label="搜索联系人"
                        placeholder="输入姓名或邮箱，至少 2 个字符"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </label>
                    <p>已选择 {draft.email.contactIds.length} 位联系人</p>
                    <div className="wr-lazy-contact-list">
                      {contacts.map((contact) => (
                        <label key={contact.id} className="wr-lazy-check">
                          <input
                            type="checkbox"
                            checked={draft.email.contactIds.includes(contact.id)}
                            onChange={() =>
                              edit({
                                email: {
                                  contactIds: draft.email.contactIds.includes(contact.id)
                                    ? draft.email.contactIds.filter((id) => id !== contact.id)
                                    : [...draft.email.contactIds, contact.id],
                                  groupId: '',
                                  tag: '',
                                },
                              })
                            }
                          />
                          <span>
                            {contact.name || contact.email}
                            <small className="wr-lazy-muted">
                              {' '}
                              {contact.name ? contact.email : ''}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
                <p className="wr-lazy-muted">
                  发送前会核对有效人数并排除已退订客户。
                  <a href="/?view=edm&edmTab=contacts" target="_blank" rel="noreferrer">
                    导入新名单
                  </a>
                </p>
                <Button
                  kind="quiet"
                  type="button"
                  disabled={busy || refreshing}
                  onClick={async () => {
                    setRefreshing(true);
                    try {
                      const refreshed = await onRefreshOptions();
                      setContacts(refreshed.contacts);
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
            {step === 'siteTargets' && (
              <label className="wr-lazy-field">
                目标网站
                <textarea
                  aria-label="目标网站"
                  rows={5}
                  value={draft.site.targets.join('\n')}
                  onChange={(event) => edit({ site: { targets: event.target.value.split('\n') } })}
                  placeholder="每行一个网站，例如 https://example.com/contact"
                />
                <small>
                  有效 {analysis.normalized.size} 个 · 重复 {analysis.duplicates.length} 个 · 无效{' '}
                  {analysis.invalid.length} 个
                </small>
                <small>提交外部网站的联系表单，每次最多 500 个网站。</small>
              </label>
            )}
            {step === 'senderName' && (
              <>
                <label className="wr-lazy-field">
                  姓名 / 发件人名称
                  <input
                    aria-label="发件人名称"
                    value={draft.sender.name}
                    maxLength={100}
                    onChange={(event) => edit({ sender: { name: event.target.value } })}
                    placeholder="对方看到的姓名或团队名称"
                  />
                </label>
                <details className="wr-lazy-guided-advanced">
                  <summary>公司名称（选填）</summary>
                  <label className="wr-lazy-field">
                    公司名称
                    <input
                      aria-label="公司名称"
                      value={draft.sender.company}
                      maxLength={200}
                      onChange={(event) => edit({ sender: { company: event.target.value } })}
                    />
                  </label>
                </details>
              </>
            )}
            {step === 'senderEmail' && (
              <>
                <label className="wr-lazy-field">
                  {email ? '发件邮箱' : '联系邮箱'}
                  <input
                    aria-label="发件人邮箱"
                    type="email"
                    value={draft.sender.email}
                    onChange={(event) => edit({ sender: { email: event.target.value } })}
                    placeholder={
                      email && options?.senderDomains[0]
                        ? `sales@${options.senderDomains[0].domain}`
                        : 'you@company.com'
                    }
                  />
                </label>
                {email && options?.senderDomains.length ? (
                  <p className="wr-lazy-muted">
                    已验证域名：{options.senderDomains.map((item) => '@' + item.domain).join('、')}
                  </p>
                ) : email ? (
                  <p className="wr-lazy-muted">
                    最终发送前会按现有服务商规则检查发件配置；管理员可在工作台管理。
                  </p>
                ) : (
                  <p className="wr-lazy-muted">对方可通过这个邮箱回复你，无需配置 EDM 发信域名。</p>
                )}
                {advancedContact}
              </>
            )}
            {step === 'contentSource' && (
              <>
                <div className="wr-lazy-pills" aria-label="内容来源">
                  <button
                    type="button"
                    aria-pressed={source === 'ai'}
                    disabled={!options?.aiConfigured}
                    onClick={() => setSource('ai')}
                  >
                    让助手起草
                  </button>
                  <button
                    type="button"
                    aria-pressed={source === 'manual'}
                    onClick={() => setSource('manual')}
                  >
                    自己填写
                  </button>
                </div>
                {source === 'ai' ? (
                  <label className="wr-lazy-field">
                    告诉助手这次想介绍什么
                    <textarea
                      aria-label="内容要求"
                      rows={4}
                      maxLength={12000}
                      value={draft.brief}
                      onChange={(event) => edit({ brief: event.target.value })}
                      placeholder="例如：介绍我们的不锈钢水杯，邀请客户回复索取目录。请只填写真实资料。"
                    />
                    <small>复用现有文字服务起草；这一步不会发送。</small>
                  </label>
                ) : (
                  <p>下一步分别填写主题和正文；已有内容会保留供你修改。</p>
                )}
              </>
            )}
            {(step === 'emailSubject' || step === 'siteSubject') && (
              <label className="wr-lazy-field">
                {step === 'emailSubject' ? '邮件主题' : '留言主题（选填）'}
                <input
                  aria-label={step === 'emailSubject' ? '邮件主题' : '留言主题'}
                  maxLength={500}
                  value={step === 'emailSubject' ? draft.email.subject : draft.site.subject}
                  onChange={(event) =>
                    edit(
                      step === 'emailSubject'
                        ? { email: { subject: event.target.value } }
                        : { site: { subject: event.target.value } },
                    )
                  }
                />
              </label>
            )}
            {step === 'emailBody' && (
              <>
                <label className="wr-lazy-field">
                  邮件正文
                  <textarea
                    aria-label="邮件正文"
                    rows={8}
                    maxLength={htmlMode ? 50000 : 20000}
                    value={htmlMode ? draft.email.bodyHtml : emailText(draft)}
                    onChange={(event) =>
                      edit({
                        email: htmlMode
                          ? { bodyHtml: event.target.value, bodyText: '' }
                          : {
                              bodyText: event.target.value,
                              bodyHtml: textHtml(event.target.value),
                            },
                      })
                    }
                  />
                </label>
                <label className="wr-lazy-check">
                  <input
                    type="checkbox"
                    checked={htmlMode}
                    onChange={(event) => setHtmlMode(event.target.checked)}
                  />
                  <span>编辑 HTML（高级）</span>
                </label>
                <p className="wr-lazy-muted">
                  可以继续在聊天里调整语气；下一步会展示实际邮件预览。
                </p>
              </>
            )}
            {step === 'siteBody' && (
              <label className="wr-lazy-field">
                网站留言
                <textarea
                  aria-label="网站留言"
                  rows={8}
                  minLength={10}
                  maxLength={5000}
                  value={draft.site.message}
                  onChange={(event) => edit({ site: { message: event.target.value } })}
                />
                <small>同一任务使用这份留言，10–5000 个字符。</small>
              </label>
            )}
            {error && (
              <p role="alert" className="wr-lazy-error">
                {error}
              </p>
            )}
            <div className="wr-lazy-actions wr-lazy-guided-navigation">
              <Button
                kind="quiet"
                type="button"
                disabled={busy || index === 0}
                onClick={() => go(steps[index - 1])}
              >
                上一步
              </Button>
              <Button kind="primary" type="submit" disabled={busy}>
                {busy
                  ? '正在保存…'
                  : step === 'contentSource' && source === 'ai'
                    ? '起草内容，下一步'
                    : step === 'siteSubject' && !draft.site.subject
                      ? '跳过，下一步'
                      : '下一步'}
              </Button>
            </div>
            <p className="wr-lazy-muted wr-lazy-guided-footer">
              此处只准备和保存草稿，最后确认后才会发送。
            </p>
          </fieldset>
        </form>
      )}
    </section>
  );
}
