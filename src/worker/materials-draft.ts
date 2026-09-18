import type{Draft}from'../shared/model';
import{getMaterialsTemplate,validateMaterialsPositions}from'../templates/materials';
import{ApiError}from'./http';

export function materialsImageAssetIds(draft:Draft):string[]{
  const bindings=draft.materials?.imageBindings||[];
  return [...new Set([...bindings.flatMap(b=>[b.assetId,...(b.mobileAssetId?[b.mobileAssetId]:[])]),...draft.products.flatMap(p=>[p.imageAssetId||'',...(p.gallery||[]).map(g=>g.assetId)])].filter(Boolean))];
}
export function validateMaterialsDraft(draft:Draft,verifiedHashes?:ReadonlyMap<string,string>){
  const m=draft.materials;if(!m)return;
  const profile=getMaterialsTemplate(m.templateId,m.contractRevision);
  if(!profile||draft.template!==m.templateId||draft.buildBranch!=='template'||!draft.templateConfirmed)throw new ApiError(409,'materials_template_conflict','已确认资料仅可使用匹配的模板；更换模板请在 Product Radar 重新准备资料。');
  const ids=materialsImageAssetIds(draft);
  const issues=validateMaterialsPositions({template:{id:m.templateId,contractRevision:m.contractRevision,guideRevision:profile.guideRevision},locales:draft.languages,omittedSectionIds:m.omittedSectionIds,displaySelection:m.displaySelection,
    products:draft.products.map(p=>({id:p.id,primaryMediaId:p.imageAssetId||'',galleryMediaIds:p.gallery?.map(g=>g.assetId)||[p.imageAssetId||'']})),media:ids.map(id=>({id,mimeType:'image/png',...(verifiedHashes?.has(id)?{sha256:verifiedHashes.get(id)}:{})})),
    imageBindings:m.imageBindings.map(({assetId,mobileAssetId,evidenceAssetIds,...b})=>({...b,mediaId:assetId,mobileMediaId:mobileAssetId,...(evidenceAssetIds?{evidenceMediaIds:evidenceAssetIds}:{})})),textBindings:m.textBindings});
  if(issues.length)throw new ApiError(422,issues[0].code,`资料位置校验未通过：${issues[0].message}`);
  return profile;
}
export function preserveMaterialsEdit(previous:Draft,next:Draft){
  if(!previous.materials){if(next.materials)throw new ApiError(403,'materials_receipt_required','新版建站资料必须通过已确认的资料接收入口创建。');return;}
  if(!next.materials)next.materials=structuredClone(previous.materials);
  const m=next.materials;
  if(previous.materials.displaySelection){
    if(!m.displaySelection)m.displaySelection=structuredClone(previous.materials.displaySelection);
    if(JSON.stringify(m.displaySelection)!==JSON.stringify(previous.materials.displaySelection))throw new ApiError(409,'materials_rebind_required','更换展示产品或顺序请在 Product Radar 重新确认资料。');
  }
  if(m.templateId!==previous.materials.templateId||m.contractRevision!==previous.materials.contractRevision||JSON.stringify(next.languages)!==JSON.stringify(previous.languages))throw new ApiError(409,'materials_rebind_required','更换模板、规范或语言请重新确认对应资料。');
  if(next.brandColor!==previous.brandColor)m.visual.palette.primary=next.brandColor;else next.brandColor=m.visual.palette.primary;
  if(next.company.description!==previous.company.description&&next.copy.en?.about===previous.copy.en?.about&&next.copy.en)next.copy.en.about=next.company.description;
  const fields={ 'hero-headline':'headline','hero-subtitle':'subtitle','primary-cta':'cta','company-about':'about'}as const;
  for(const binding of m.textBindings){const field=fields[binding.slotId as keyof typeof fields];if(field)binding.text=next.copy[binding.locale]?.[field]||'';}
  m.imageBindings=m.imageBindings.filter(b=>!['product-main','product-gallery'].includes(b.slotId)||next.products.some(p=>p.id===b.productId));
  for(const p of next.products){
    const gallery=p.gallery||[];if(gallery.length&&p.imageAssetId)gallery[0]={...gallery[0],assetId:p.imageAssetId};
    for(const [index,assetId]of [...new Set([p.imageAssetId,...(p.gallery||[]).map(g=>g.assetId)].filter((id):id is string=>!!id))].entries()){
      const slotId=index===0?'product-main':'product-gallery';let binding=m.imageBindings.find(b=>b.slotId===slotId&&b.productId===p.id&&(index===0||b.itemIndex===index));
      if(!binding){binding={slotId,productId:p.id,...(index?{itemIndex:index}:{}),assetId,fit:'contain',focalPoint:{x:.5,y:.5},alt:Object.fromEntries(next.languages.map(l=>[l,p.translations?.[l]?.name||p.name]))};m.imageBindings.push(binding);}
      else if(binding.assetId!==assetId){binding.assetId=assetId;delete binding.mobileAssetId;}
    }
    m.imageBindings=m.imageBindings.filter(b=>b.productId!==p.id||b.slotId!=='product-gallery'||(b.itemIndex!==undefined&&b.itemIndex<gallery.length));
  }
  validateMaterialsDraft(next);
}
