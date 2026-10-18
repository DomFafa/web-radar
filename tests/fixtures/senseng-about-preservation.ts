import {createHash} from 'node:crypto';
import type {Asset} from '../../src/shared/model';
import {renderSite} from '../../src/templates';
import {getMaterialsTemplate} from '../../src/templates/materials';
import {projectPreviewRuntimeForDraft} from '../../src/worker/project-preview';
import {draftFromMaterials} from '../../src/worker/materials-service';
import {typedMaterialsFixture} from './materials-typed';

export async function sensengAboutPreviousHashes(){
 const result:Record<string,unknown>={};
 const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
 for(const id of ['senseng-candy','senseng-video','senseng-nature']){
  const revision=`2026-10-02.${id}-materials.1`,contract=getMaterialsTemplate(id,revision)!;
  const input=await typedMaterialsFixture(id,3,revision);
  const draft=draftFromMaterials(input,Object.fromEntries(input.materials.media.map(media=>[media.id,{id:media.id} as Asset])));
  result[id]={contract:hash(JSON.stringify(contract)),runtime:hash(projectPreviewRuntimeForDraft(draft)),pages:Object.fromEntries(['home','catalog','detail','about','contact'].map(page=>[page,hash(renderSite(draft,{projectId:'senseng-about-preservation',lang:'en',page,productId:'p0',assetUrl:id=>`/confirmed/${id}`,inquiryUrl:'/inquiry',preview:true}))]))};
 }
 return result;
}
