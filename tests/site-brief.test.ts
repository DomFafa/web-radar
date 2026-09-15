import { describe, expect, it } from 'vitest';
import { defaultDraft, editDraft } from '../src/worker/domain';
import { testBrief } from './fixtures/site-brief';
import {
  consultationInputKey,
  plannedPages,
  parseSiteBrief,
  briefConfirmed,
} from '../src/shared/site-brief';

describe('guided site brief', () => {
  it('retains five base pages for legacy drafts', () => {
    expect(plannedPages(defaultDraft())).toEqual(['home', 'catalog', 'detail', 'about', 'contact']);
  });
  it('ignores translation-only changes when comparing intake facts', () => {
    const d = defaultDraft();
    d.products = [{ id: 'p', name: 'Toy', description: '', material: '', dimensions: '' }];
    const next = structuredClone(d);
    next.products[0].translations = { en: { name: 'Toy', description: 'Translation' } };
    expect(consultationInputKey(next)).toBe(consultationInputKey(d));
  });
  it('rejects arbitrary or incomplete provider briefs', () => {
    expect(() => parseSiteBrief({ pages: [{ id: '../outside' }] }, defaultDraft())).toThrow();
  });
  it('does not let a client forge consultation approval', () => {
    const old = defaultDraft();
    const next = { ...old, consultation: { revision: 0, answers: [], confirmed: true } };
    expect(briefConfirmed(editDraft(old, next))).toBe(false);
  });
  it('accepts bounded complete extra pages and rejects duplicated or unlocalized plans', () => {
    const d = defaultDraft();
    const brief = testBrief(d, true);
    expect(parseSiteBrief(brief, d).pages).toHaveLength(6);
    expect(() =>
      parseSiteBrief({ ...brief, pages: [...brief.pages, brief.pages[5]] }, d),
    ).toThrow();
    delete brief.pages[5].content.en;
    expect(() => parseSiteBrief(brief, d)).toThrow();
  });
  it('preserves server answers on unrelated saves but invalidates approval when words change', () => {
    const d = defaultDraft();
    d.consultation = { revision: 1, answers: [], brief: testBrief(d), confirmed: true };
    expect(briefConfirmed(editDraft(d, { ...d, consultation: undefined }))).toBe(true);
    const edited = structuredClone(d);
    edited.copy.en = { headline: 'Changed', subtitle: '', about: '', cta: '' };
    expect(briefConfirmed(editDraft(d, edited))).toBe(false);
    edited.company.name = 'New company';
    expect(editDraft(d, edited).consultation).toBeUndefined();
  });

  it('requires corresponding section counts across website languages before approval', () => {
    const d = defaultDraft();
    d.languages = ['en', 'de'];
    const brief = testBrief(d, true);
    brief.pages[5].content.de!.sections.push({ heading: 'Extra', body: 'Extra section' });
    expect(() => parseSiteBrief(brief, d)).toThrow(/correspond/);
  });
  it('invalidates approval, not intake history, when a client changes product translations', () => {
    const d = defaultDraft();
    d.products = [
      {
        id: 'p',
        name: 'Product',
        description: 'Original',
        material: '',
        dimensions: '',
        translations: { en: { name: 'Product', description: 'Original' } },
      },
    ];
    d.consultation = { revision: 1, answers: [], brief: testBrief(d), confirmed: true };
    const next = structuredClone(d);
    next.products[0].translations!.en!.description = 'Changed';
    const saved = editDraft(d, next);
    expect(briefConfirmed(saved)).toBe(false);
    expect(saved.consultation?.brief).toEqual(d.consultation.brief);
  });
});
