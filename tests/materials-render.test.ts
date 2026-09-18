import{describe,expect,it}from'vitest';
import{materialsFixture}from'./fixtures/materials';
import{draftFromMaterials}from'../src/worker/materials-service';
import{renderSite}from'../src/templates';
import type{Asset}from'../src/shared/model';
const options={projectId:'test',lang:'en' as const,page:'home',assetUrl:(id:string)=>'/media/'+id,inquiryUrl:'https://web-radar.net/api/public/sites/test/inquiries',preview:true};
const draft=async(count=10,templateId='juno-toys')=>{const s=await materialsFixture(count,templateId);const assets=Object.fromEntries(s.materials.media.map(m=>[m.id,{id:m.id,projectId:'test',key:m.id,contentType:m.mimeType,size:m.bytes,filename:m.id,origin:'import',createdAt:'2026-09-17'}as Asset]));return draftFromMaterials(s,assets);};
describe('approved materials rendering',()=>{
  it('omits the unsupported Juno promo and orphaned end spacers while retaining content spacing',async()=>{
    const d=await draft();const before=structuredClone(d);const html=renderSite(d,options);
    for(const id of ['6f48de11','67fddce','7b2b7e3','87636bb','54828a1'])expect(html).not.toContain(`data-id="${id}"`);
    for(const id of ['13c15a5c','102fa52','64e05a1'])expect(html).toContain(`data-id="${id}"`);
    expect(html).toContain('wr-products');expect(html).toContain('data-wr-slider');
    expect(d).toEqual(before);
  });
  it('routes the confirmed inquiry CTA to contact in every Juno hero slide',async()=>{
    const d=await draft();d.copy.en!.cta='Send Product Inquiry';
    const links=[...renderSite(d,options).matchAll(/<a\b([^>]*)>Send Product Inquiry<\/a>/g)];
    expect(links).toHaveLength(3);
    for(const link of links){expect(link[1]).toContain('href="contact/index.html"');expect(link[1]).toContain('data-wr-page="contact"');}
  });
  it.each(['senseng-clean','senseng-video'])('binds %s across all pages with no demo padding and a complete catalog',async(templateId)=>{
    const d=await draft(10,templateId);
    for(const page of ['home','catalog','detail','about','contact']){
      const html=renderSite(d,{...options,page,productId:'p9'});
      expect(html.includes('True Brand')).toBe(true);expect(html.includes('Approved copy')).toBe(true);
      expect(html.includes('Character-led squishy')).toBe(false);expect(html.includes('/templates/senseng/logo.png')).toBe(false);expect(html.includes('__WR_MATERIAL')).toBe(false);
      expect(html.includes('/templates/senseng/hero-video.mp4')).toBe(false);
      expect(html.includes('/templates/senseng/hero-sky-v2.png')).toBe(false);
      if(page==='catalog')for(let i=0;i<10;i++)expect(html.includes(`data-wr-product-id="p${i}"`)).toBe(true);
    }
    const one=renderSite(await draft(1,templateId),options);expect(one.includes('Kids Squishy')).toBe(false);expect(one.includes('senseng-2/index')).toBe(false);
  });
  it('binds approved content and visual decisions without source demo claims',async()=>{
    const d=await draft();const html=renderSite(d,options);
    expect(html).toContain('Approved copy');expect(html).toContain('True Brand');expect(html).toContain('#112233');expect(html).toContain('#446655');
    expect(html).not.toContain('Mandy Mathers');expect(html).not.toContain('Dolls Trailer');expect(html).not.toContain('320.00');expect(html).not.toContain('__WR_MATERIAL');
    for(const filename of ['3acad0ba1ade35505b6f.jpg','d944810805584d4c4a83.jpg','c09aa8b0c60785450022.jpg','133693d2cf04aed02165.jpg','503cf47ed16d2a148e35.jpg'])expect(html.includes(filename)).toBe(false);
    expect(html).toContain('data-wr-slider');
  });
  it('uses exact media positions and responsive focal points rather than cycling product photos',async()=>{
    const d=await draft();const b=d.materials!.imageBindings.find(b=>b.slotId==='hero-slide-0')!;b.assetId='hero-approved';b.mobileAssetId='hero-mobile';b.focalPoint={x:0.7,y:0.3};
    const html=renderSite(d,options);expect(html).toContain('/media/hero-approved');expect(html).toContain('/media/hero-mobile');expect(html).toContain('70% 30%');
  });
  it('includes all ten selected products and reads edited draft values instead of frozen import copy',async()=>{
    const d=await draft();d.company.name='Edited Brand';d.products[9].name='Edited product';d.copy.en!.headline='Edited headline';
    const home=renderSite(d,options),catalog=renderSite(d,{...options,page:'catalog'}),detail=renderSite(d,{...options,page:'detail',productId:'p9'});
    expect(home).toContain('Edited Brand');expect(home).toContain('Edited headline');expect(catalog).toContain('Edited product');expect(detail).toContain('Edited product');
    for(let i=0;i<10;i++)expect(catalog).toContain(`data-wr-product-id="p${i}"`);
  });
  it('does not apply the new branch to ordinary drafts and keeps their original template defaults',async()=>{
    const d=await draft();delete d.materials;const html=renderSite(d,options);expect(html).toContain('Mandy Mathers');expect(html).toContain('Dolls Trailer');expect(html).not.toContain('wr-materials-site');
    for(const id of ['6f48de11','67fddce','7b2b7e3','87636bb','54828a1'])expect(html).toContain(`data-id="${id}"`);
  });
});
