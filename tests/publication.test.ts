import { expect, it } from 'vitest';
import { defaultDraft } from '../src/worker/domain';
import { samePublishedDraft } from '../src/shared/publication';
it('ignores generation workflow metadata while comparing actual generated pages', () => {
  const a=defaultDraft();a.buildBranch='clone';a.cloneConfig={generatedHtml:'<main>A</main>',taskId:'old',status:'ready'};
  const b=structuredClone(a);b.cloneConfig={...b.cloneConfig,taskId:'new',status:'generating',autoPublish:false,enhancementMode:'smart',instructions:'New future instructions'};
  expect(samePublishedDraft(a,b)).toBe(true);
  b.cloneConfig.generatedHtml='<main>B</main>';expect(samePublishedDraft(a,b)).toBe(false);
});
it('detects changed product and contact information',()=>{
  const a=defaultDraft(),b=structuredClone(a);b.company.email='new@example.com';expect(samePublishedDraft(a,b)).toBe(false);
});
