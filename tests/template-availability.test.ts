import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TemplateSelector, { TEMPLATES } from '../src/client/TemplateSelector';
import { defaultDraft, validateDraft } from '../src/worker/domain';
import { renderSite } from '../src/templates';

const selector = (draft = defaultDraft()) => renderToStaticMarkup(createElement(TemplateSelector, {
  draft, onUpdateDraft() {}, onProceedToPublish() {}, onBackToBasics() {}, onPreview() {},
}));
describe('reduced template library', () => {
  it('defaults new projects to Candy and lists the active template catalog', () => {
    expect(defaultDraft()).toMatchObject({ template: 'senseng-candy', brandColor: '#ff6b8b' });
    expect(TEMPLATES.map(t => t.englishName)).toEqual(['Auravell Yoga & Mindful Living', 'Careflow Healthcare', 'Toorun Early Learning', 'Lumi Business & Strategy', 'Pawfect Groom', 'Good Boy Supply Co.', 'Mello Coffee & Bakery', 'Candy Pop & Play', 'Immersive Video', 'Botanical & Forest', 'PaperNote']);
    const html = selector();
    expect((html.match(/class="template-card /g) || [])).toHaveLength(11);
    expect(html).not.toContain('模板分类');
    expect(html).not.toContain('Single Device');
    expect(html).not.toContain('模板已下架');
  });
  it('requires an explicit choice when a retired project opens the selector', () => {
    const html = selector({ ...defaultDraft(), template: 'single-device-showcase' });
    expect(html).toContain('模板已下架');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>生成并进入预览发布/);
  });
  it('preserves saved retired projects and their rendering', () => {
    const draft = validateDraft({ ...defaultDraft(), template: 'single-device-showcase', company: { ...defaultDraft().company, name: 'Existing Brand' } });
    expect(draft.template).toBe('single-device-showcase');
    expect(renderSite(draft, { projectId: 'legacy', lang: 'en', page: 'home', preview: true, assetUrl: id => id, inquiryUrl: '' })).toContain('Existing Brand');
  });
});
