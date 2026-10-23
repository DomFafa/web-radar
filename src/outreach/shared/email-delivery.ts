export type EmailDeliveryFacts = {
  status: string;
  sesMessageId?: string | null;
  providerStatus?: string | null;
  queuedReason?: string | null;
  errorMessage?: string | null;
};

export const deliverySuccessHelp = '已受理表示服务商接收了请求，可能仍在排队。服务商已发出仍需等待投递回执；已送达表示收件方邮件服务器已接收，不保证进入收件箱或已被阅读。';

/** Recipient events are newer evidence than the initial provider response. */
export function emailDeliveryPresentation(facts: EmailDeliveryFacts): {
  label: string; detail: string; tone: 'success' | 'warning' | 'neutral' | 'danger';
} {
  const { status, errorMessage, providerStatus, queuedReason } = facts;
  if (errorMessage?.startsWith('待核实')) return { label: '待核实', detail: errorMessage, tone: 'warning' };
  if (status === 'bounced') return { label: '退信', detail: errorMessage || '收件方未接受邮件，请查看退信原因。', tone: 'danger' };
  if (status === 'failed') return { label: '失败', detail: errorMessage || '发送未完成，请核实结果后处理。', tone: 'danger' };
  if (status === 'delivered') return { label: '已送达', detail: '收件方邮件服务器已接收；不保证进入收件箱或已被阅读。', tone: 'success' };
  if (status === 'opened' || status === 'clicked' || status === 'replied') return {
    label: status === 'clicked' ? '已点击' : status === 'replied' ? '已回复' : '已打开',
    detail: '已记录邮件互动；打开和点击记录可能由邮件客户端自动触发。', tone: 'success',
  };
  if (status === 'complained') return { label: '已投诉', detail: '已收到投诉记录。', tone: 'danger' };
  if (status === 'unsubscribed') return { label: '已退订', detail: '联系人已退订。', tone: 'neutral' };
  if (status === 'sent') {
    if (providerStatus === 'queued' || providerStatus === 'scheduled') return {
      label: providerStatus === 'scheduled' ? '服务商定时发送' : '服务商排队中',
      detail: `服务商已受理，尚未发出。${queuedReason ? `排队原因：${queuedReason}` : '等待服务商投递。'}`,
      tone: 'warning',
    };
    return {
      label: providerStatus === 'sent' ? '服务商已发出' : '已受理',
      detail: providerStatus === 'sent' ? '服务商已发出，送达待确认。' : '服务商已受理，送达待确认。',
      tone: 'neutral',
    };
  }
  if (status === 'queued') return { label: '待提交', detail: errorMessage || '尚未向服务商提交。', tone: 'neutral' };
  if (status === 'sending') return { label: '提交中', detail: errorMessage || '正在提交，受理结果待确认。', tone: 'warning' };
  return { label: '待核实', detail: errorMessage || '尚无可确认的投递结果。', tone: 'warning' };
}
