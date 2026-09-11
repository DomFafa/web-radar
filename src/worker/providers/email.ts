import type { Inquiry } from '../../shared/model';
import type { Secrets } from '../env';
import { ProviderError } from '../provider-contract';
import { jsonRequest, nonempty, requestJson } from './http';
const validEmail = (email: string) =>
  /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(email) && email.length <= 254;
export async function sendInquiry(
  env: Secrets,
  inquiry: Inquiry,
  recipient: string,
  idempotencyKey: string,
): Promise<{ id: string; testMode: boolean }> {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM)
    throw new ProviderError('email_unconfigured', '询盘邮件服务或平台验证发信地址尚未配置');
  if (
    !validEmail(inquiry.email) ||
    !validEmail(recipient) ||
    /[\r\n]/.test(env.MAIL_FROM) ||
    !nonempty(idempotencyKey, 256)
  )
    throw new ProviderError('email_invalid_input', '询盘邮箱或重试标识无效');
  const text = [
    `New website inquiry`,
    `Inquiry: ${inquiry.id}`,
    `Buyer: ${inquiry.name}`,
    `Buyer email: ${inquiry.email}`,
    `Buyer company: ${inquiry.company || '—'}`,
    `Related product: ${inquiry.productId || '—'}`,
    `Source website: ${inquiry.siteUrl}`,
    `Received: ${inquiry.createdAt}`,
    '',
    inquiry.message,
  ].join('\n');
  const data = await requestJson(
    'https://api.resend.com/emails',
    jsonRequest(
      env.RESEND_API_KEY,
      {
        from: env.MAIL_FROM,
        to: [recipient],
        reply_to: inquiry.email,
        subject: `Website inquiry · ${inquiry.name.replace(/[\r\n]/g, ' ').slice(0, 120)}`,
        text,
      },
      idempotencyKey,
    ),
    { provider: 'email', mutation: true },
  );
  if (!nonempty(data?.id, 200))
    throw new ProviderError(
      'email_acceptance_unknown',
      '邮件受理状态不明确，保留询盘记录待核对',
      true,
    );
  return { id: data.id, testMode: false };
}
