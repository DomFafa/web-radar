import type {MaterialsSubmission} from '../../src/shared/materials';
import {getMaterialsTemplate} from '../../src/templates/materials';
import {canonical,sha256} from '../../src/worker/http';
export const materialsPng=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64'));
export async function materialsFixture(productCount=1,templateId='juno-toys'):Promise<MaterialsSubmission>{
  const profile=getMaterialsTemplate(templateId)!;
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',materialsPng))].map(v=>v.toString(16).padStart(2,'0')).join('');
  const products=Array.from({length:productCount},(_,i)=>({id:`p${i}`,sourceVersion:'1',name:`Actual toy ${i}`,description:`A confirmed wooden toy ${i}`,material:'Wood',dimensions:'10 cm',primaryMediaId:`m${i}`,galleryMediaIds:[`m${i}`],factReferences:['f1']}));
  const m:MaterialsSubmission={
    schemaVersion:'wr-materials-v1',submissionId:crypto.randomUUID(),principal:{userId:'materials-owner',authSubject:'owner',email:'vc.ddom@gmail.com',displayName:'Owner',systemRole:'user',workspaceId:'materials-workspace',workspaceRole:'admin',workspaceName:'Work'},
    parentOrigin:'https://product.example.com',target:{mode:'create',name:'Approved site'},source:{materialsId:'material-source',revision:1},confirmation:{status:'confirmed',confirmedAt:'2026-09-17T10:00:00.000Z',contentSha256:'0'.repeat(64)},
    materials:{template:{id:profile.templateId,guideRevision:profile.guideRevision,contractRevision:profile.contractRevision},country:'US',locales:['en'],primaryProductId:'p0',brand:{profileId:'brand',profileVersion:'1',name:'True Brand',description:'A confirmed brand'},contact:{cardId:'card',cardVersion:'1',name:'Sales',email:'sales@example.com'},products,
      facts:[{id:'f1',text:'Wooden products',source:'product:p0'}],visual:{palette:{primary:'#112233',secondary:'#446655',background:'#fdfaf0',surface:'#ffffff',text:'#223344',mutedText:'#667788'},backgroundStyle:'soft-gradient',imageTreatment:'soft',compositionSummary:'Full real products centered, text left'},
      media:products.map((p,i)=>({id:p.primaryMediaId,sourceAssetId:`source-${i}`,sourceVersion:'1',sha256:hash,mimeType:'image/png',bytes:materialsPng.length,width:1,height:1})),
      imageBindings:profile.imageSlots.flatMap(s=>s.repeat==='per-product-gallery'?[]:(s.repeat==='per-product'?products:[undefined]).map(p=>({slotId:s.id,mediaId:p?.primaryMediaId||'m0',...(p?{productId:p.id}:{}),fit:s.fit,focalPoint:{x:0.5,y:0.5},alt:{en:p?.name||'Real wooden product'}}))),
      textBindings:profile.textSlots.map((s,i)=>({slotId:s.id,locale:'en',text:s.id==='company-about'?'A confirmed brand':`Approved copy ${i}`,factReferences:['f1']})),omittedSectionIds:profile.optionalSections.map(s=>s.id),
    },
  };
  m.confirmation.contentSha256=await sha256(canonical({source:m.source,materials:m.materials}));return m;
}
