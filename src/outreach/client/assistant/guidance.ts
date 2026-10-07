import type {
  AssistantChannel,
  AssistantDraft,
  AssistantDraftPatch,
  AssistantOptions,
} from '../../shared/assistant';
import { MAX_SITE_TARGETS, normalizeSiteTargets } from '../../shared/site-targets';
import { z } from 'zod';

export type GuidanceStep =
  | 'emailAudience'
  | 'siteTargets'
  | 'senderName'
  | 'senderEmail'
  | 'contentSource'
  | 'emailSubject'
  | 'emailBody'
  | 'siteSubject'
  | 'siteBody'
  | 'review';

export const guidedSteps: Record<GuidanceStep, { label: string; question: string }> = {
  emailAudience: { label: '选择客户', question: '这封邮件发给哪些客户？' },
  siteTargets: { label: '目标网站', question: '要向哪些网站留言？' },
  senderName: { label: '发件人姓名', question: '客户看到的发件人是谁？' },
  senderEmail: { label: '联系邮箱', question: '使用哪个邮箱联系客户？' },
  contentSource: { label: '准备内容', question: '这次内容怎么准备？' },
  emailSubject: { label: '邮件主题', question: '邮件主题写什么？' },
  emailBody: { label: '邮件正文', question: '邮件里要告诉客户什么？' },
  siteSubject: { label: '留言主题', question: '需要给留言加一个主题吗？' },
  siteBody: { label: '留言正文', question: '要向网站客户留言什么？' },
  review: { label: '预览确认', question: '以上对象、身份和内容确认无误吗？' },
};

export function guidanceSteps(channels: AssistantChannel[]): GuidanceStep[] {
  if (!channels.length) return [];
  const steps: GuidanceStep[] = [];
  if (channels.includes('email')) steps.push('emailAudience');
  if (channels.includes('site')) steps.push('siteTargets');
  steps.push('senderName', 'senderEmail', 'contentSource');
  if (channels.includes('email')) steps.push('emailSubject', 'emailBody');
  if (channels.includes('site')) steps.push('siteSubject', 'siteBody');
  return [...steps, 'review'];
}

export function validateGuidanceStep(
  step: GuidanceStep,
  draft: AssistantDraft,
  options: AssistantOptions | null,
): string | null {
  switch (step) {
    case 'emailAudience':
      return draft.email.contactIds.length || draft.email.groupId || draft.email.tag
        ? null
        : '请选择至少一位联系人、一个分组或一个标签。';
    case 'siteTargets': {
      const targets = normalizeSiteTargets(draft.site.targets);
      if (targets.invalid.length) return '请修改无效网址，仅支持有效的公网 HTTP/HTTPS 网站。';
      if (!targets.normalized.size) return '请填写至少一个目标网站。';
      return targets.normalized.size > MAX_SITE_TARGETS
        ? `每次最多向 ${MAX_SITE_TARGETS} 个网站留言。`
        : null;
    }
    case 'senderName':
      if (!draft.sender.name.trim()) return '请填写客户看到的发件人姓名。';
      return draft.sender.name.length > 100 ? '发件人姓名最多 100 个字符。' : null;
    case 'senderEmail':
      return z.email().safeParse(draft.sender.email).success ? null : '请填写有效的联系邮箱。';
    case 'contentSource': {
      const hasContent =
        draft.channels.length > 0 &&
        draft.channels.every((channel) =>
          channel === 'email'
            ? !validateGuidanceStep('emailBody', draft, options)
            : !validateGuidanceStep('siteBody', draft, options),
        );
      return draft.brief.trim() || hasContent ? null : '请说明本次内容要求，或填写要使用的内容。';
    }
    case 'emailSubject':
      if (!draft.email.subject.trim()) return '请填写邮件主题。';
      return draft.email.subject.length > 500 ? '邮件主题最多 500 个字符。' : null;
    case 'emailBody': {
      const text =
        draft.email.bodyText.trim() ||
        draft.email.bodyHtml
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;|&#160;|&#x0*a0;/gi, ' ')
          .trim();
      return text ? null : '请填写邮件正文。';
    }
    case 'siteSubject':
      return draft.site.subject.length > 500 ? '留言主题最多 500 个字符。' : null;
    case 'siteBody':
      return draft.site.message.trim().length < 10 || draft.site.message.length > 5000
        ? '留言正文须为 10–5000 个字符。'
        : null;
    case 'review':
      if (!draft.channels.length) return '请选择发送渠道。';
      for (const current of guidanceSteps(draft.channels)) {
        if (current === 'contentSource' || current === 'review') continue;
        const error = validateGuidanceStep(current, draft, options);
        if (error) return error;
      }
      return null;
  }
}

export function firstIncompleteGuidanceStep(
  draft: AssistantDraft,
  options: AssistantOptions | null,
): GuidanceStep {
  return (
    guidanceSteps(draft.channels).find(
      (step) =>
        step !== 'contentSource' &&
        step !== 'siteSubject' &&
        step !== 'review' &&
        validateGuidanceStep(step, draft, options),
    ) || 'review'
  );
}

export function stepDraftPatch(step: GuidanceStep, draft: AssistantDraft): AssistantDraftPatch {
  if (!draft.channels.length) return {};
  switch (step) {
    case 'emailAudience':
      return {
        email: {
          contactIds: [...draft.email.contactIds],
          groupId: draft.email.groupId,
          tag: draft.email.tag,
        },
      };
    case 'siteTargets':
      return { site: { targets: [...draft.site.targets] } };
    case 'senderName':
      return { sender: { name: draft.sender.name, company: draft.sender.company } };
    case 'senderEmail':
      return {
        sender: {
          email: draft.sender.email,
          phone: draft.sender.phone,
          address: draft.sender.address,
          country: draft.sender.country,
          city: draft.sender.city,
        },
        ...(draft.channels.includes('email')
          ? { email: { replyTo: draft.email.replyTo, replyTracking: draft.email.replyTracking } }
          : {}),
        ...(draft.channels.includes('site')
          ? { site: { replyTracking: draft.site.replyTracking } }
          : {}),
      };
    case 'contentSource':
      return { brief: draft.brief };
    case 'emailSubject':
      return { email: { subject: draft.email.subject } };
    case 'emailBody':
      return { email: { bodyHtml: draft.email.bodyHtml, bodyText: draft.email.bodyText } };
    case 'siteSubject':
      return { site: { subject: draft.site.subject } };
    case 'siteBody':
      return { site: { message: draft.site.message } };
    case 'review':
      return {};
  }
}
