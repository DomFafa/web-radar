import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../client/components';
import type {
  AssistantChannel,
  AssistantDraft,
  AssistantDraftPatch,
  AssistantOptions,
  AssistantSession,
} from '../../shared/assistant';
import { ASSISTANT_EMAIL_RECIPIENT_LIMIT } from '../../shared/assistant';
import { normalizeSiteTargets } from '../../shared/site-targets';
import { assistantApi, type AssistantMailTemplate } from './api';
import { EmailPreview } from '../components/EmailPreview';
import { DraftPreview } from './AssistantCards';
import {
  firstIncompleteGuidanceStep,
  guidanceSteps,
  guidedSteps,
  stepDraftPatch,
  validateGuidanceStep,
  type GuidanceStep,
} from './guidance';

export type ComposerContext = {
  step: GuidanceStep;
  source: 'ai' | 'template' | 'manual';
  channel?: AssistantChannel;
};
type ContentSource = ComposerContext['source'];
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
    case 'emailContent':
      return draft.email.subject || '邮件已准备';
    case 'siteContent':
      return draft.site.subject || '网站留言已准备';
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
  onComposerContext,
  onTemplate,
  onConfirm,
  onManageContacts,
}: {
  session: AssistantSession;
  options: AssistantOptions | null;
  busy: boolean;
  storageKey: string;
  onRefreshOptions: () => Promise<AssistantOptions>;
  onSave: (
    patch: AssistantDraftPatch,
    contentChannel?: AssistantChannel,
  ) => Promise<AssistantSession | null>;
  onComposerContext: (context: ComposerContext) => void;
  onTemplate?: (templateId: string) => Promise<AssistantSession | null>;
  onConfirm: (authorized: boolean) => void;
  onManageContacts?: (action: 'add' | 'import' | 'groups') => void;
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
  const audienceMissing = session.pendingChannels.includes('email') &&
    session.missingFields.some((field) => field.key === 'email.audience');
  const audienceTooLarge = audienceMissing && session.preview.email.count > ASSISTANT_EMAIL_RECIPIENT_LIMIT;
  const requiredStep = audienceMissing ? 'emailAudience' :
    firstIncompleteGuidanceStep(scopedDraft, options, session.draftingStates);
  const [draft, setDraft] = useState<AssistantDraft>(restored?.draft || scopedDraft);
  const [step, setStep] = useState<GuidanceStep>(
    audienceTooLarge ? 'emailAudience' : restored?.step || requiredStep,
  );
  const [dirty, setDirty] = useState<GuidanceStep[]>(restored?.dirty || []);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const [source, setSource] = useState<ContentSource>(
    restored?.source || (options?.aiConfigured === false ? 'manual' : 'ai'),
  );
  const [audienceMethod, setAudienceMethod] = useState(
    draft.email.tag ? 'tag' : draft.email.contactIds.length ? 'contacts' : 'group',
  );
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState(options?.contacts || []);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [htmlMode, setHtmlMode] = useState(false);
  const [templates, setTemplates] = useState<AssistantMailTemplate[] | null>(null);
  const [templateType, setTemplateType] = useState<'builtin' | 'mine'>('builtin');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);
  const contentChannel: AssistantChannel | undefined =
    step === 'emailContent' ? 'email' : step === 'siteContent' ? 'site' : undefined;
  const contentReady =
    !!contentChannel && !validateGuidanceStep(step, draft, options, session.draftingStates);
  const showSavedContent = contentReady && (source === 'ai' || (source === 'template' && !!draft.email.templateId));
  const lastMessageId = session.messages.at(-1)?.id;
  const seenMessage = useRef(lastMessageId);
  const selected = source === 'template' ? templates?.find((item) => item.id === selectedTemplate) : undefined;
  const visibleTemplates =
    templates?.filter((item) => (templateType === 'builtin' ? item.isBuiltIn : !item.isBuiltIn)) ||
    [];

  const index = Math.max(0, steps.indexOf(step));
  const email = session.pendingChannels.includes('email');
  const site = session.pendingChannels.includes('site');
  const analysis = normalizeSiteTargets(draft.site.targets);
  const reviewError = validateGuidanceStep('review', scopedDraft, options, session.draftingStates);

  useEffect(() => {
    onComposerContext({ step, source, channel: contentChannel });
  }, [step, source, contentChannel, onComposerContext]);
  useEffect(() => {
    if (source !== 'template' || step !== 'emailContent' || templates) return;
    let active = true;
    setTemplateLoading(true);
    assistantApi
      .templates()
      .then((items) => {
        if (active) setTemplates(items);
      })
      .catch(() => {
        if (active) setError('邮件模板暂时无法读取，请重新选择模板入口重试。');
      })
      .finally(() => {
        if (active) setTemplateLoading(false);
      });
    return () => {
      active = false;
    };
  }, [source, step, templates]);
  useEffect(() => {
    const changed = seenMessage.current !== lastMessageId;
    seenMessage.current = lastMessageId;
    const message = session.messages.at(-1);
    if (
      changed &&
      message?.draftingStatus === 'ready' &&
      contentChannel &&
      message.draftingChannels?.includes(contentChannel) &&
      source === 'ai'
    ) {
      const remaining = dirtyRef.current.filter((item) => item !== step);
      dirtyRef.current = remaining;
      setDirty(remaining);
      go(requiredStep);
    } else if (step === 'review' && (reviewError || audienceMissing)) {
      go(requiredStep);
    }
  }, [session.version, lastMessageId, audienceMissing]);
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
    if (search.trim().length < 2) setContacts(options?.contacts || []);
  }, [options?.contacts, search]);
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
    if (next !== step) setSelectedTemplate('');
    if (next !== step && (next === 'emailContent' || next === 'siteContent')) {
      setSource(
        next === 'emailContent' && session.draft.email.templateId
          ? 'template'
          : options?.aiConfigured === false
            ? 'manual'
            : 'ai',
      );
    }
    setStep(next);
  }
  function accept(saved: AssistantSession) {
    const remaining = dirtyRef.current.filter((item) => item !== step);
    dirtyRef.current = remaining;
    setDirty(remaining);
    setDraft(
      remaining.reduce((value, item) => applyLocal(value, stepDraftPatch(item, draft)), {
        ...saved.draft,
        channels: saved.pendingChannels,
      }),
    );
    go(steps[index + 1] || 'review');
  }
  async function next() {
    if (busy) return;
    const invalid = validateGuidanceStep(
      step,
      draft,
      options,
      source === 'manual' && contentChannel ? {} : session.draftingStates,
    );
    if (invalid) {
      setError(invalid);
      return;
    }
    const saved =
      contentChannel &&
      source !== 'manual' &&
      session.draftingStates?.[contentChannel] === 'ready' &&
      !dirty.includes(step)
        ? session
        : await onSave(stepDraftPatch(step, draft), contentChannel);
    if (!saved) return;
    if (step === 'emailAudience' && !saved.preview.email.count) {
      setError('当前名单没有可发送的联系人，请换一个名单或导入联系人。');
      return;
    }
    accept(saved);
  }
  async function useTemplate() {
    if (!selectedTemplate || busy || !onTemplate) return;
    const saved = await onTemplate(selectedTemplate);
    if (saved) accept(saved);
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
            邮件回复汇入客户管理系统的客户回复{!options?.replyTracking.email ? '（配置已停用，请关闭）' : ''}
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
            网站留言回复汇入客户管理系统的客户回复{!options?.replyTracking.site ? '（配置已停用，请关闭）' : ''}
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
            onEditContent={(channel) => go(channel === 'email' ? 'emailContent' : 'siteContent')}
            onEdit={() =>
              go(
                requiredStep === 'review' ? steps[0] : requiredStep,
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
                {audienceTooLarge && (
                  <p role="alert" className="wr-lazy-note">
                    当前名单有 {session.preview.email.count.toLocaleString('en-US')} 位可发送客户，
                    每次最多 {ASSISTANT_EMAIL_RECIPIENT_LIMIT.toLocaleString('en-US')} 位。请换一个较小的分组或缩小名单。
                  </p>
                )}
                {onManageContacts && (
                  <div className="wr-lazy-contact-management">
                    <p>名单还没准备好？先添加客户或上传 CSV / Excel，再选择要发送的分组。</p>
                    <div className="wr-lazy-actions">
                      <Button kind="secondary" type="button" onClick={() => onManageContacts('add')}>
                        添加联系人
                      </Button>
                      <Button kind="primary" type="button" onClick={() => onManageContacts('import')}>
                        批量导入名单
                      </Button>
                      <Button kind="quiet" type="button" onClick={() => onManageContacts('groups')}>
                        管理分组
                      </Button>
                    </div>
                  </div>
                )}
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
                  批量发送时选择分组，无需逐个勾选客户。
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
            {contentChannel && (
              <>
                <div className="wr-lazy-pills" aria-label="内容来源">
                  <button
                    type="button"
                    data-content-source="ai"
                    aria-pressed={source === 'ai'}
                    disabled={options?.aiConfigured === false}
                    onClick={() => {
                      setSource('ai');
                      setSelectedTemplate('');
                      setError('');
                    }}
                  >
                    {contentChannel === 'email' ? '让助手写邮件' : '让助手写留言'}
                  </button>
                  {contentChannel === 'email' && (
                    <button
                      type="button"
                      data-content-source="template"
                      aria-pressed={source === 'template'}
                      onClick={() => {
                        setSource('template');
                        setError('');
                      }}
                    >
                      选择邮件模板
                    </button>
                  )}
                  <button
                    type="button"
                    data-content-source="manual"
                    aria-pressed={source === 'manual'}
                    onClick={() => {
                      setSource('manual');
                      setSelectedTemplate('');
                      setError('');
                    }}
                  >
                    {contentChannel === 'email' ? '自己填写邮件' : '自己填写留言'}
                  </button>
                </div>
                {source === 'ai' && (
                  <p className="wr-lazy-note">
                    {session.draftingStates?.[contentChannel] === 'needs_facts'
                      ? '助手还需要一些资料，请在下方对话框回答。补齐后会生成完整内容，接着展示发送前预览。'
                      : contentReady
                        ? '已保存的内容展示在下方。可以直接使用，或在对话框告诉助手要怎样修改。'
                        : contentChannel === 'email'
                          ? '在下方对话框告诉助手邮件目的和产品资料，助手会一起生成主题和正文，再展示完整预览。'
                          : '在下方对话框告诉助手留言目的和产品资料，助手会生成完整留言，再展示发送前预览。'}
                  </p>
                )}
                {source === 'template' && (
                  <div className="wr-lazy-template-picker">
                    <div className="wr-lazy-pills" aria-label="模板类型">
                      <button
                        type="button"
                        aria-pressed={templateType === 'builtin'}
                        onClick={() => {
                          setTemplateType('builtin');
                          setSelectedTemplate('');
                        }}
                      >
                        内置模板
                      </button>
                      <button
                        type="button"
                        aria-pressed={templateType === 'mine'}
                        onClick={() => {
                          setTemplateType('mine');
                          setSelectedTemplate('');
                        }}
                      >
                        我的模板
                      </button>
                    </div>
                    <p className="wr-lazy-muted">
                      选择后先查看邮件样式，使用模板后进入发送前预览。不会立即发送。
                    </p>
                    {templateLoading && <p role="status">正在读取邮件模板…</p>}
                    {templates && !visibleTemplates.length && (
                      <p>这里还没有模板，可以让助手代写或自己填写。</p>
                    )}
                    <div className="wr-lazy-template-list" aria-label="可选邮件模板">
                      {visibleTemplates.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          data-template-id={item.id}
                          aria-pressed={selectedTemplate === item.id}
                          onClick={() => setSelectedTemplate(item.id)}
                        >
                          <strong>{item.name}</strong>
                          <small>{item.category || '邮件模板'}</small>
                          <span>{item.subject}</span>
                        </button>
                      ))}
                    </div>
                    {selected && (
                      <div className="wr-lazy-prepared-content" aria-label="所选模板预览">
                        <h3>{selected.name}</h3>
                        <p>
                          <strong>邮件主题：</strong>
                          {selected.subject}
                        </p>
                        <EmailPreview html={selected.bodyHtml} height={320} />
                        <p className="wr-lazy-muted">
                          姓名、公司等联系人变量会在发送时替换；请先确认模板内容适合本次邮件。
                        </p>
                        <Button
                          type="button"
                          kind="primary"
                          disabled={busy}
                          onClick={() => void useTemplate()}
                        >
                          使用这个模板，查看预览
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {source === 'manual' && (
                  <>
                    <p className="wr-lazy-muted">
                      这里填写的就是客户收到的内容。保存后会展示完整预览。
                    </p>
                    <label className="wr-lazy-field">
                      {contentChannel === 'email' ? '邮件主题' : '留言主题（选填）'}
                      <input
                        aria-label={contentChannel === 'email' ? '邮件主题' : '留言主题'}
                        maxLength={500}
                        value={
                          contentChannel === 'email' ? draft.email.subject : draft.site.subject
                        }
                        onChange={(event) =>
                          edit(
                            contentChannel === 'email'
                              ? { email: { subject: event.target.value } }
                              : { site: { subject: event.target.value } },
                          )
                        }
                      />
                    </label>
                    {contentChannel === 'email' ? (
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
                        <details className="wr-lazy-guided-advanced">
                          <summary>高级编辑</summary>
                          <label className="wr-lazy-check">
                            <input
                              type="checkbox"
                              checked={htmlMode}
                              onChange={(event) => setHtmlMode(event.target.checked)}
                            />
                            <span>编辑 HTML 源码</span>
                          </label>
                        </details>
                      </>
                    ) : (
                      <label className="wr-lazy-field">
                        网站留言
                        <textarea
                          aria-label="网站留言"
                          rows={8}
                          maxLength={5000}
                          value={draft.site.message}
                          onChange={(event) => edit({ site: { message: event.target.value } })}
                        />
                        <small>同一任务使用这份留言，10–5000 个字符。</small>
                      </label>
                    )}
                  </>
                )}
                {showSavedContent && !selected && (
                  <div className="wr-lazy-prepared-content" aria-label="已保存的发送内容">
                    <h3>{contentChannel === 'email' ? '已保存的邮件' : '已保存的网站留言'}</h3>
                    <p>
                      <strong>{contentChannel === 'email' ? '邮件主题：' : '留言主题：'}</strong>
                      {contentChannel === 'email'
                        ? draft.email.subject
                        : draft.site.subject || '业务咨询'}
                    </p>
                    {contentChannel === 'email' ? (
                      <EmailPreview html={draft.email.bodyHtml} height={260} />
                    ) : (
                      <div className="wr-lazy-preview-message">{draft.site.message}</div>
                    )}
                  </div>
                )}
              </>
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
              {(!contentChannel || source === 'manual' || (showSavedContent && !selectedTemplate)) && (
                <Button kind="primary" type="submit" disabled={busy}>
                  {busy
                    ? '正在保存…'
                    : !contentChannel
                      ? '下一步'
                      : source === 'manual'
                        ? contentChannel === 'email'
                          ? '保存邮件，继续'
                          : '保存留言，继续'
                        : contentChannel === 'email'
                          ? '使用这封邮件，继续'
                          : '使用这份留言，继续'}
                </Button>
              )}
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
