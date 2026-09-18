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
