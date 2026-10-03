import { describe, expect, it } from 'vitest';
import { getTemplateGuide } from '../src/worker/template-guides/catalog';
import { getMaterialsTemplate } from '../src/templates/materials';
import { currentMaterialsTemplate } from '../src/worker/template-guides/current-materials';
import { renderSite } from '../src/templates';
import { defaultDraft } from '../src/worker/domain';

describe('new native template material guides', () => {
  it.each([['papernote', 1200, 1400], ['mello-coffee', 1200, 1000]] as const)(
    '%s binds its documented portrait to the native image', (template, width, height) => {
      const guide = getTemplateGuide(template)!;
      const contract = getMaterialsTemplate(template)!;
      expect(currentMaterialsTemplate(template)!.guideRevision).toBe(guide.revision);
      expect(contract.guideRevision).toBe(template === 'papernote' ? '2026-09-30.1' : '2026-10-02.1');
      expect(contract.imageSlots.find(s => s.id === 'hero-portrait')).toMatchObject({width, height, binding: 'supported'});
      const draft = {...defaultDraft(), template};
      draft.company.name = 'Confirmed Brand';
      draft.products = [{id:'p1', name:'Confirmed Item',description:'Provided description',material:'',dimensions:'',imageAssetId:'main'}];
      draft.materials = {templateId:template,contractRevision:contract.contractRevision,
        visual:{palette:{primary:'#112233',secondary:'#eeeeee',background:'#ffffff',surface:'#ffffff',text:'#222222',mutedText:'#666666'},backgroundStyle:'plain',imageTreatment:'natural',compositionSummary:'Approved source'},
        imageBindings:[{slotId:'hero-portrait',assetId:'approved-hero',fit:'cover',focalPoint:{x:.5,y:.5},alt:{en:'Approved photograph'}}],textBindings:[],omittedSectionIds:[]};
      const html = renderSite(draft,{projectId:'guide-test',page:'home',lang:'en',assetUrl:id=>'/test-assets/'+id,inquiryUrl:'/inquiry',preview:true});
      expect(html).toMatch(/<img[^>]+src="\/test-assets\/approved-hero"/);
    });
  it('Mello describes actual product assets without imposing its demonstration subject', () => {
    const guide = getTemplateGuide('mello-coffee')!;
    expect(JSON.stringify(guide)).not.toMatch(/pet.shop|pet-category|宠物|洗护/);
    expect(guide.assets.find(a=>a.id==='product-main')).toMatchObject({dimensions:{width:1200,height:1200},quantity:{recommended:4}});
    expect(guide.inventory.reuseRule).toContain('不要求额外造图');
    for (const asset of guide.assets) expect(asset.promptTemplate).not.toMatch(/golden retriever|coffee favorites|strawberry matcha|dog-care scene/i);
  });
  it('PaperNote describes six projects and marks shared detail artwork binding explicitly', () => {
    const guide=getTemplateGuide('papernote')!;
    expect(guide.layoutImageSlots).toHaveLength(6);
    expect(guide.assets.find(a=>a.id==='project-showcase')).toMatchObject({dimensions:{width:1920,height:1080},binding:{strategy:'manual-template-edit'}});
    expect(guide.inventory.bundledVideoCount).toBe(0);
    expect(guide.textSlots.some(s=>s.id==='project-metadata')).toBe(true);
  });
});
