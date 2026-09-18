import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {getMaterialsTemplate,validateMaterialsPositions} from '../src/templates/materials';
import {junoDisplayFixture} from './fixtures/juno-display';
import {materialsSubmissionSchema} from '../src/shared/materials';
import {draftFromMaterials} from '../src/worker/materials-service';
import {editDraft} from '../src/worker/domain';
import {renderSite} from '../src/templates';
import type {Asset} from '../src/shared/model';
import {parse,serialize,type DefaultTreeAdapterMap} from 'parse5';

const legacy='2026-09-17.juno-materials.2';
const revision='2026-09-18.juno-materials.3';
describe('versioned Juno display contracts',()=>{
  it('retains the entire accepted v2 contract and discovers v3 separately',()=>{
    const frozen=JSON.parse(readFileSync(new URL('../docs/materials-requirements/juno-toys.json',import.meta.url),'utf8'));
    expect(getMaterialsTemplate('juno-toys',legacy)).toEqual(frozen);
    expect(getMaterialsTemplate('juno-toys')?.contractRevision).toBe(revision);
    expect(getMaterialsTemplate('juno-toys','invented')).toBeUndefined();
  });
  it('describes selection-bound card roles and a real middle collection banner',()=>{
    const profile=getMaterialsTemplate('juno-toys',revision)!;
    for(const [id,role,selectionGroup]of [['scene-card','scene','scene'],['front-card','front','featured'],['packaging-card','packaging','featured']]){
      expect(profile.imageSlots.find(s=>s.id===id)).toMatchObject({role,selectionGroup,repeat:'per-selection',min:1,max:1});
    }
    expect(profile.imageSlots.find(s=>s.id==='collection-banner-mid')).toMatchObject({role:'collection',required:true,page:'home'});
  });
});

async function displayDraft(count=5){const s=await junoDisplayFixture(count);return draftFromMaterials(s,Object.fromEntries(s.materials.media.map(m=>[m.id,{id:'asset-'+m.id}as Asset])));}
type Element=DefaultTreeAdapterMap['element'];
function elements(html:string){const list:Element[]=[];function visit(node:DefaultTreeAdapterMap['node']){if('tagName'in node)list.push(node);if('childNodes'in node)node.childNodes.forEach(visit);}visit(parse(html));return list;}
const attr=(n:Element,key:string)=>n.attrs.find(a=>a.name===key)?.value;
const options={projectId:'display-test',lang:'en' as const,page:'home',assetUrl:(id:string)=>'/media/'+id,inquiryUrl:'',preview:true};
describe('Juno display rendering and persistence',()=>{
  it.each([1,2,3,4,5])('renders %i products with consistent image, name, link and saved selection',async(count)=>{
    const draft=await displayDraft(count),before=structuredClone(draft),html=renderSite(draft,options),nodes=elements(html);
    for(const [sectionId,role,group]of [['6e37763','scene','sceneProductIds'],['b51d430','front','featuredProductIds'],['0b4ff1c','front','featuredProductIds'],['0b4ff1c','packaging','featuredProductIds']]as const){
      const section=nodes.find(n=>n.tagName==='section'&&attr(n,'data-id')===sectionId)!;
      const cards=elements(serialize(section)).filter(n=>attr(n,'data-wr-display-role')===role);
      expect(cards.map(n=>attr(n,'data-wr-product-id'))).toEqual(draft.materials!.displaySelection![group]);
      for(const card of cards){
        const id=attr(card,'data-wr-product-id')!,children=elements(serialize(card));
        const binding=draft.materials!.imageBindings.find(b=>b.slotId===`${role}-card`&&b.productId===id)!;
        expect(children.find(n=>n.tagName==='img')?.attrs).toEqual(expect.arrayContaining([{name:'src',value:options.assetUrl(binding.assetId)}]));
        const links=children.filter(n=>n.tagName==='a');expect(links.length).toBeGreaterThan(0);
        for(const link of links){expect(attr(link,'href')).toBe(`products/${id}/index.html`);expect(attr(link,'data-wr-product-id')).toBe(id);}
        expect(serialize(card)).toContain(draft.products.find(p=>p.id===id)!.name);
      }
    }
    const middle=nodes.find(n=>n.tagName==='section'&&attr(n,'data-id')==='6f48de11')!;
    expect(serialize(middle)).toContain('data-wr-material-image="collection-banner-mid"');
    expect(serialize(middle)).not.toContain('spacer');
    for(const id of ['67fddce','7b2b7e3','87636bb','54828a1'])expect(html).not.toContain(`data-id="${id}"`);
    expect(html).not.toContain('__WR_MATERIAL');expect(html).not.toContain('Dolls Trailer');
    expect(renderSite(draft,options)).toBe(html);expect(draft).toEqual(before);
  });
  it('persists media evidence and preserves selections through edits and serialization',async()=>{
    const draft=await displayDraft(),m=draft.materials!;
    expect(m.imageBindings.find(b=>b.slotId==='packaging-card')?.evidenceAssetIds).toEqual(['asset-m4']);
    const next=JSON.parse(JSON.stringify(draft));delete next.materials.displaySelection;
    next.products[4].name='Edited product name';
    const edited=editDraft(draft,next);expect(edited.materials!.displaySelection).toEqual(m.displaySelection);
    expect(renderSite(edited,options)).toContain('Edited product name');
    const changed=structuredClone(draft);changed.materials!.displaySelection!.featuredProductIds.reverse();
    expect(()=>editDraft(draft,changed)).toThrow(/展示产品或顺序/);
  });
});
describe('purpose-specific Juno bindings',()=>{
  it.each([1,2,3,4,5,20])('accepts %i products with fixed real selections and no fillers',async(count)=>{
    const s=await junoDisplayFixture(count);expect(materialsSubmissionSchema.safeParse(s).success).toBe(true);
    expect(validateMaterialsPositions(s.materials)).toEqual([]);
  });
  it.each(['missing selection','duplicate selection','unknown selection','short selection','missing scene','missing front','missing packaging','wrong role','swapped identity','foreign evidence','missing evidence','subset banner','same banner','copied banner bytes','extra card','card index','editorial mismatch','reused role image','reused identity image','copied role bytes','wrong mobile identity'])('rejects %s',async(kind)=>{
    const m=(await junoDisplayFixture()).materials;
    const front=m.imageBindings.find(b=>b.slotId==='front-card')!,pack=m.imageBindings.find(b=>b.slotId==='packaging-card')!,mid=m.imageBindings.find(b=>b.slotId==='collection-banner-mid')!,hero=m.imageBindings.find(b=>b.slotId==='hero-slide-0')!;
    if(kind==='missing selection')delete m.displaySelection;
    if(kind==='duplicate selection')m.displaySelection!.featuredProductIds[1]=m.displaySelection!.featuredProductIds[0];
    if(kind==='unknown selection')m.displaySelection!.sceneProductIds[0]='foreign';
    if(kind==='short selection')m.displaySelection!.sceneProductIds.pop();
    if(kind==='missing scene')m.imageBindings=m.imageBindings.filter(b=>b.slotId!=='scene-card');
    if(kind==='missing front')m.imageBindings=m.imageBindings.filter(b=>b.slotId!=='front-card');
    if(kind==='missing packaging')m.imageBindings=m.imageBindings.filter(b=>b.slotId!=='packaging-card');
    if(kind==='wrong role')front.role='scene';
    if(kind==='swapped identity')front.depictedProductIds=['p0'];
    if(kind==='foreign evidence')pack.evidenceMediaIds=['m0'];
    if(kind==='missing evidence')delete pack.evidenceMediaIds;
    if(kind==='subset banner')mid.depictedProductIds!.pop();
    if(kind==='same banner')mid.mediaId=hero.mediaId;
    if(kind==='copied banner bytes')m.media.find(a=>a.id===mid.mediaId)!.sha256=m.media.find(a=>a.id===hero.mediaId)!.sha256;
    if(kind==='extra card')m.imageBindings.push({...front,productId:'p0',depictedProductIds:['p0']});
    if(kind==='card index')front.itemIndex=0;
    if(kind==='editorial mismatch'){const b=m.imageBindings.find(b=>b.slotId==='home-image-9')!;b.productId='p0';b.depictedProductIds=['p0'];}
    if(kind==='reused role image')front.mediaId=pack.mediaId;
    if(kind==='reused identity image')m.imageBindings.filter(b=>b.slotId==='front-card')[1].mediaId=front.mediaId;
    if(kind==='copied role bytes')m.media.find(a=>a.id===front.mediaId)!.sha256=m.media.find(a=>a.id===pack.mediaId)!.sha256;
    if(kind==='wrong mobile identity')m.imageBindings.filter(b=>b.slotId==='front-card')[1].mobileMediaId=front.mediaId;
    expect(validateMaterialsPositions(m).length).toBeGreaterThan(0);
  });
});
