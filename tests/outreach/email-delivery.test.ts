import { expect, test } from 'vitest';
import { emailDeliveryPresentation } from '../../src/outreach/shared/email-delivery';

test('a queued provider receipt never claims sending or delivery success', () => {
  const view = emailDeliveryPresentation({ status: 'sent', providerStatus: 'queued', queuedReason: 'user-paused', sesMessageId: 'id' });
  expect(view.label).toBe('服务商排队中');
  expect(view.detail).toContain('user-paused');
  expect(view.detail).toContain('尚未发出');
  expect(view.tone).toBe('warning');
});

test('scheduled and legacy accepted messages remain distinct from confirmed delivery', () => {
  expect(emailDeliveryPresentation({ status: 'sent', providerStatus: 'scheduled' }).label).toBe('服务商定时发送');
  const legacy = emailDeliveryPresentation({ status: 'sent', sesMessageId: 'old-id' });
  expect(legacy.label).toBe('已受理');
  expect(legacy.detail).toContain('送达待确认');
  expect(legacy.tone).not.toBe('success');
  const sent = emailDeliveryPresentation({ status: 'sent', providerStatus: 'sent' });
  expect(sent.label).toBe('服务商已发出');
  expect(sent.detail).toContain('送达待确认');
  expect(sent.tone).not.toBe('success');
});

test('later confirmed delivery and negative results take precedence over an old queue response', () => {
  expect(emailDeliveryPresentation({ status: 'delivered', providerStatus: 'queued' })).toMatchObject({ label: '已送达', tone: 'success' });
  expect(emailDeliveryPresentation({ status: 'delivered' }).detail).toContain('收件方邮件服务器');
  expect(emailDeliveryPresentation({ status: 'clicked', providerStatus: 'queued' }).label).toBe('已点击');
  expect(emailDeliveryPresentation({ status: 'bounced', providerStatus: 'queued' }).label).toBe('退信');
  expect(emailDeliveryPresentation({ status: 'failed', errorMessage: '待核实：请求超时' })).toMatchObject({ label: '待核实', tone: 'warning' });
  expect(emailDeliveryPresentation({ status: 'queued' }).tone).not.toBe('success');
});
