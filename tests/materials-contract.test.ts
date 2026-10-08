import { describe, expect, it } from 'vitest';
import { materialsSubmissionSchema } from '../src/shared/materials';

const submission = () => ({
  schemaVersion: 'wr-materials-v1', submissionId: '12345678-1234-4234-8234-123456789012',
  principal: { userId: 'owner', authSubject: 'owner', email: 'vc.ddom@gmail.com', displayName: 'Owner', systemRole: 'user', workspaceId: 'w', workspaceRole: 'admin', workspaceName: 'Work' },
  parentOrigin: 'https://product.example.com', target: {mode:'create',name:'My site'},
  source: {materialsId:'m1',revision:1}, confirmation:{status:'confirmed',confirmedAt:'2026-09-17T10:00:00.000Z',contentSha256:'a'.repeat(64)},
  materials: {
    template:{id:'juno-toys',guideRevision:'2026-09-17.1',contractRevision:'juno-v1'}, country:'US',locales:['en'],primaryProductId:'p1',
    brand:{profileId:'brand',profileVersion:'1',name:'Brand',description:'A brand'},contact:{cardId:'c',cardVersion:'1',name:'Dom',email:'sales@example.com'},
    products:[{id:'p1',sourceVersion:'1',name:'Toy',description:'Wood toy',material:'Wood',dimensions:'10 cm',primaryMediaId:'m1',galleryMediaIds:['m1'],factReferences:['f1']}],
    facts:[{id:'f1',text:'Wood toy',source:'product:p1'}],
    visual:{palette:{primary:'#112233',secondary:'#445566',background:'#ffffff',surface:'#eeeeee',text:'#112233',mutedText:'#778899'},backgroundStyle:'plain',imageTreatment:'natural',compositionSummary:'Product centered'},
    media:[{id:'m1',sourceAssetId:'asset',sourceVersion:'1',sha256:'b'.repeat(64),mimeType:'image/png',bytes:100,width:100,height:100}],
    imageBindings:[{slotId:'home-image-0',mediaId:'m1',fit:'contain',focalPoint:{x:0.5,y:0.5},alt:{en:'Wood toy'}}],
    textBindings:[],omittedSectionIds:[],
  },
});
describe('confirmed materials wire contract', () => {
  it('accepts an explicit confirmed snapshot without changing legacy product types', () => {
    expect(materialsSubmissionSchema.safeParse(submission()).success).toBe(true);
  });
  it.each(['linkedin','facebook','instagram','x'])('preserves %s social links through 2048 Unicode characters, including multibyte content', field => {
    for(const length of [300,301,2048])for(const character of ['a','汉']){
      const value:any=submission(),prefix='https://social.example/';
      const link=prefix+character.repeat(length-prefix.length);
      value.materials.brand[field]=link;
      const parsed=materialsSubmissionSchema.safeParse(value);
      expect(parsed.success,`${field}:${character}:${length}`).toBe(true);
      if(parsed.success)expect(parsed.data.materials.brand[field as 'linkedin']).toBe(link);
    }
    const value:any=submission(),link='🧸'.repeat(2048);
    expect([...link]).toHaveLength(2048);
    value.materials.brand[field]=link;
    const parsed=materialsSubmissionSchema.safeParse(value);
    expect(parsed.success).toBe(true);
    if(parsed.success)expect(parsed.data.materials.brand[field as 'linkedin']).toBe(link);
  });
  it.each(['linkedin','facebook','instagram','x'])('rejects %s above 2048 Unicode characters at its exact wire path', field => {
    for(const link of ['a'.repeat(2049),'汉'.repeat(2049),'🧸'.repeat(2048)+'a']){
      const value:any=submission();value.materials.brand[field]=link;
      const parsed=materialsSubmissionSchema.safeParse(value);
      expect(parsed.success).toBe(false);
      if(!parsed.success)expect(parsed.error.issues.some(issue=>issue.code==='too_big'&&issue.path.join('.')===`materials.brand.${field}`)).toBe(true);
    }
  });
  it.each(['unknown media','duplicate product','unknown fact','missing locale','extra field','bad palette','unconfirmed','gallery order'])('rejects %s', (kind) => {
    const value:any = submission();
    if(kind==='unknown media') value.materials.imageBindings[0].mediaId='missing';
    if(kind==='duplicate product') value.materials.products.push(value.materials.products[0]);
    if(kind==='unknown fact') value.materials.products[0].factReferences=['missing'];
    if(kind==='missing locale') value.materials.locales.push('de');
    if(kind==='extra field') value.materials.publish=true;
    if(kind==='bad palette') value.materials.visual.palette.primary='red;display:none';
    if(kind==='unconfirmed') value.confirmation.status='draft';
    if(kind==='gallery order') value.materials.products[0].galleryMediaIds=[];
    expect(materialsSubmissionSchema.safeParse(value).success).toBe(false);
  });
});
