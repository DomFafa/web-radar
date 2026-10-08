import { expect, test } from 'vitest';
import type { AssistantDraft, AssistantOptions } from '../../src/outreach/shared/assistant';
import {
  firstIncompleteGuidanceStep,
  guidanceSteps,
  stepDraftPatch,
  validateGuidanceStep,
} from '../../src/outreach/client/assistant/guidance';

function readyDraft(): AssistantDraft {
  return {
    channels: ['email', 'site'],
    brief: '',
    language: 'en',
    sender: {
      name: 'Seller',
      email: 'seller@example.com',
      company: 'Seller Ltd',
      phone: '',
      address: '',
      country: '',
      city: '',
    },
    email: {
      subject: 'Sample proposal',
      bodyHtml: '<p>Would you like a sample?</p>',
      bodyText: 'Would you like a sample?',
      contactIds: ['buyer'],
      groupId: '',
      tag: '',
      replyTo: 'reply@example.com',
      replyTracking: true,
      sendRate: 25,
    },
    site: {
      subject: '',
      message: 'Would your team like a sample?',
      targets: ['buyer.example.com/contact'],
      replyTracking: false,
    },
  };
}
const options: AssistantOptions = {
  groups: [],
  tags: [],
  contacts: [],
  senderDomains: [],
  replyTracking: { enabled: false, email: false, site: false },
  aiConfigured: true,
  testMode: false,
};

test('restored channel order cannot move website steps ahead of email steps', () => {
  expect(guidanceSteps(['site', 'email'])).toEqual([
    'emailAudience',
    'siteTargets',
    'senderName',
    'senderEmail',
    'emailContent',
    'siteContent',
    'review',
  ]);
});

test('a single channel only asks for its own audience and content', () => {
  expect(guidanceSteps(['email', 'email'])).toEqual([
    'emailAudience',
    'senderName',
    'senderEmail',
    'emailContent',
    'review',
  ]);
  expect(guidanceSteps(['site'])).toEqual([
    'siteTargets',
    'senderName',
    'senderEmail',
    'siteContent',
    'review',
  ]);
  expect(guidanceSteps([])).toEqual([]);
});

test.each(['contact', 'group', 'tag'])(
  'email audience accepts an explicit %s selection',
  (selection) => {
    const draft = readyDraft();
    draft.email.contactIds = selection === 'contact' ? ['buyer'] : [];
    draft.email.groupId = selection === 'group' ? 'buyers' : '';
    draft.email.tag = selection === 'tag' ? 'trade-show' : '';
    expect(validateGuidanceStep('emailAudience', draft, options)).toBeNull();
  },
);

test('email audience cannot advance without any selected customers', () => {
  const draft = readyDraft();
  draft.email.contactIds = [];
  expect(validateGuidanceStep('emailAudience', draft, options)).toBeTruthy();
});

test('website validation blocks invalid public targets and accepts duplicates after deduplication', () => {
  const draft = readyDraft();
  draft.site.targets = ['example.com', 'https://www.example.com/contact'];
  expect(validateGuidanceStep('siteTargets', draft, options)).toBeNull();
  draft.site.targets.push('http://127.0.0.1');
  expect(validateGuidanceStep('siteTargets', draft, options)).toBeTruthy();
  draft.site.targets = [];
  expect(validateGuidanceStep('siteTargets', draft, options)).toBeTruthy();
});

test('the website limit uses the normalized domain count', () => {
  const draft = readyDraft();
  draft.site.targets = Array.from({ length: 500 }, (_, index) => `site${index}.example.com`);
  draft.site.targets.push('https://www.site0.example.com/contact');
  expect(validateGuidanceStep('siteTargets', draft, options)).toBeNull();
  draft.site.targets.push('extra.example.com');
  expect(validateGuidanceStep('siteTargets', draft, options)).toBeTruthy();
});

test('sender name is required and limited to 100 characters', () => {
  const draft = readyDraft();
  draft.sender.name = ' ';
  expect(validateGuidanceStep('senderName', draft, options)).toBeTruthy();
  draft.sender.name = '张'.repeat(100);
  expect(validateGuidanceStep('senderName', draft, options)).toBeNull();
  draft.sender.name += '张';
  expect(validateGuidanceStep('senderName', draft, options)).toBeTruthy();
});

test('sender email needs a valid address while missing domain configuration does not block preparation', () => {
  const draft = readyDraft();
  expect(validateGuidanceStep('senderEmail', draft, null)).toBeNull();
  expect(validateGuidanceStep('senderEmail', draft, options)).toBeNull();
  for (const email of ['', 'invalid', 'seller@', 'seller @example.com']) {
    draft.sender.email = email;
    expect(validateGuidanceStep('senderEmail', draft, options)).toBeTruthy();
  }
});

test.each(['emailSubject', 'emailBody'] as const)(
  '%s cannot advance with blank content',
  (step) => {
    const draft = readyDraft();
    if (step === 'emailSubject') draft.email.subject = ' ';
    else {
      draft.email.bodyHtml = ' ';
      draft.email.bodyText = '';
    }
    expect(validateGuidanceStep(step, draft, options)).toBeTruthy();
  },
);

test.each(['<p></p>', '<p><br></p>', '<p>&nbsp; &#160; &#xA0; </p>'])(
  'empty HTML body %s cannot advance or pass final review',
  (bodyHtml) => {
    const draft = readyDraft();
    draft.channels = ['email'];
    draft.email.bodyHtml = bodyHtml;
    draft.email.bodyText = '';
    expect(validateGuidanceStep('emailBody', draft, options)).toBeTruthy();
    expect(validateGuidanceStep('review', draft, options)).toBeTruthy();
    expect(firstIncompleteGuidanceStep(draft, options)).toBe('emailContent');
  },
);

test('email body accepts actual HTML text and a plain-text draft', () => {
  const draft = readyDraft();
  draft.email.bodyText = '';
  expect(validateGuidanceStep('emailBody', draft, options)).toBeNull();
  draft.email.bodyHtml = '<p></p>';
  draft.email.bodyText = 'Would you like a sample?';
  expect(validateGuidanceStep('emailBody', draft, options)).toBeNull();
});

test('optional website subject can be skipped but stays within the existing limit', () => {
  const draft = readyDraft();
  expect(validateGuidanceStep('siteSubject', draft, options)).toBeNull();
  draft.site.subject = 'a'.repeat(501);
  expect(validateGuidanceStep('siteSubject', draft, options)).toBeTruthy();
});

test('website message requires 10 to 5000 non-padding characters', () => {
  const draft = readyDraft();
  for (const [message, valid] of [
    [' '.repeat(10), false],
    ['a'.repeat(9), false],
    ['a'.repeat(10), true],
    ['a'.repeat(5000), true],
    ['a'.repeat(5001), false],
  ] as const) {
    draft.site.message = message;
    expect(validateGuidanceStep('siteBody', draft, options) === null).toBe(valid);
  }
});

test('review requires the selected channels and every channel content, without requiring an AI brief', () => {
  const draft = readyDraft();
  expect(validateGuidanceStep('review', draft, options)).toBeNull();
  draft.email.subject = '';
  expect(validateGuidanceStep('review', draft, options)).toBeTruthy();
  draft.channels = ['site'];
  expect(validateGuidanceStep('review', draft, options)).toBeNull();
  draft.channels = [];
  expect(validateGuidanceStep('review', draft, options)).toBeTruthy();
});

test('restored drafts resume at the first real missing field instead of content source or an optional subject', () => {
  const draft = readyDraft();
  expect(firstIncompleteGuidanceStep(draft, options, { email: 'ready', site: 'ready' })).toBe(
    'review',
  );
  draft.site.message = '';
  expect(firstIncompleteGuidanceStep(draft, options, { email: 'ready' })).toBe('siteContent');
  draft.sender.name = '';
  expect(firstIncompleteGuidanceStep(draft, options)).toBe('senderName');
  draft.email.contactIds = [];
  expect(firstIncompleteGuidanceStep(draft, options)).toBe('emailAudience');
});

test('each Next patch submits only its own confirmed field', () => {
  const draft = readyDraft();
  expect(stepDraftPatch('emailAudience', draft)).toEqual({
    email: { contactIds: ['buyer'], groupId: '', tag: '' },
  });
  expect(stepDraftPatch('siteTargets', draft)).toEqual({
    site: { targets: ['buyer.example.com/contact'] },
  });
  expect(stepDraftPatch('senderName', draft)).toEqual({
    sender: { name: 'Seller', company: 'Seller Ltd' },
  });
  expect(stepDraftPatch('senderEmail', draft)).toEqual({
    sender: { email: 'seller@example.com', phone: '', address: '', country: '', city: '' },
    email: { replyTo: 'reply@example.com', replyTracking: true },
    site: { replyTracking: false },
  });
  expect(stepDraftPatch('emailContent', draft)).toEqual({
    email: {
      subject: 'Sample proposal',
      bodyHtml: '<p>Would you like a sample?</p>',
      bodyText: 'Would you like a sample?',
    },
  });
  expect(stepDraftPatch('siteContent', draft)).toEqual({
    site: { subject: '', message: 'Would your team like a sample?' },
  });
  expect(stepDraftPatch('review', draft)).toEqual({});
});

test('Next without a selected channel cannot submit draft fields', () => {
  const draft = readyDraft();
  draft.channels = [];
  expect(stepDraftPatch('senderName', draft)).toEqual({});
});

test('optional reply settings are only submitted for active channels', () => {
  const draft = readyDraft();
  draft.channels = ['site'];
  expect(stepDraftPatch('senderEmail', draft)).toEqual({
    sender: { email: 'seller@example.com', phone: '', address: '', country: '', city: '' },
    site: { replyTracking: false },
  });
  draft.channels = ['email'];
  expect(stepDraftPatch('senderEmail', draft)).toEqual({
    sender: { email: 'seller@example.com', phone: '', address: '', country: '', city: '' },
    email: { replyTo: 'reply@example.com', replyTracking: true },
  });
});

test('an AI follow-up blocks old complete content from review and resumes at that content step', () => {
  const draft = readyDraft();
  expect(validateGuidanceStep('review', draft, options, { email: 'needs_facts' })).toBeTruthy();
  expect(firstIncompleteGuidanceStep(draft, options, { email: 'needs_facts', site: 'ready' })).toBe(
    'emailContent',
  );
  expect(firstIncompleteGuidanceStep(draft, options, { email: 'ready', site: 'needs_facts' })).toBe(
    'siteContent',
  );
});
test('a legacy saved email is shown for explicit use instead of assuming AI completed it', () => {
  const draft = readyDraft();
  expect(firstIncompleteGuidanceStep(draft, options)).toBe('emailContent');
});
