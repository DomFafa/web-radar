import { expect, it } from 'vitest';
import { defaultDraft, editDraft } from '../src/worker/domain';
import { withSiteContacts, siteContacts } from '../src/shared/site-contacts';
it('preserves finished layout and replaces contact text/links without touching code', () => {
  const old = defaultDraft();
  old.buildBranch = 'custom';
  old.company.email = 'old@example.com';
  old.company.phone = '+86 123456';
  old.company.whatsapp = '+86 777777';
  old.siteDesign = { revision: 2, pages: {}, build: { jobId: 'job', artifactKey: 'artifact' } };
  const next = editDraft(old, {
    ...old,
    company: { ...old.company, email: 'new@example.com', phone: '+1 654321', whatsapp: '' },
  });
  expect(next.siteDesign?.build?.artifactKey).toBe('artifact');
  expect(next.siteDesign?.build?.contacts).toEqual(siteContacts(old.company));
  const html = withSiteContacts(
    '<p>old@example.com +86 123456</p><a href="mailto:old@example.com">Email</a><a href="tel:+86123456">Call</a><a href="https://wa.me/86777777">Chat</a><script>const email="old@example.com"</script>',
    next,
  );
  expect(html).toContain('new@example.com +1 654321');
  expect(html).toContain('href="mailto:new@example.com"');
  expect(html).toContain('href="tel:+1654321"');
  expect(html).toContain('<a>Chat</a>');
  expect(html).toContain('const email="old@example.com"');
});
it('escapes inserted contact text and keeps original snapshot across subsequent saves', () => {
  const old = defaultDraft();
  old.buildBranch = 'clone';
  old.company.email = 'old@example.com';
  old.cloneConfig = {
    generation: {
      mode: 'vision',
      imageCount: 1,
      pageCount: 4,
      visuallyVerified: false,
      contacts: siteContacts(old.company),
    },
  };
  const next = { ...old, company: { ...old.company, email: '<img onerror=alert(1)>' } };
  const result = withSiteContacts('<p>old@example.com</p>', next);
  expect(result).toContain('&lt;img onerror=alert(1)&gt;');
  expect(result).not.toContain('<img');
});
it('binds reference email links when the owner fills contact details after a URL-only preview', () => {
  const draft = defaultDraft();
  draft.buildBranch = 'clone';
  draft.company.email = 'owner@example.com';
  draft.cloneConfig = {
    referenceCapture: {
      url: 'https://example.com',
      contextKey: 'key',
      assets: [],
      pageCount: 1,
      screenshotCount: 2,
      warnings: [],
      capturedAt: '',
    },
    generation: {
      mode: 'vision',
      imageCount: 2,
      pageCount: 4,
      visuallyVerified: false,
      contacts: { email: '', phone: '', whatsapp: '' },
    },
  };
  const result = withSiteContacts(
    '<a href="mailto:reference@example.com">reference@example.com</a>',
    draft,
  );
  expect(result).toContain('href="mailto:owner@example.com"');
  expect(result).not.toContain('reference@example.com');
});
