import{useEffect,useState}from'react';
import type{Asset,Draft}from'../shared/model';
import type{AppliedMaterials,MaterialsTemplateContract}from'../shared/materials';
import{api,errorMessage}from'./api';
import{AssetView,Button,Field,Notice,SectionTitle}from'./components';

const pages={home:'首页',catalog:'产品目录',detail:'产品详情',about:'关于我们',contact:'联系我们'};
const colors={primary:'主色',secondary:'辅助色',background:'页面背景',surface:'卡片背景',text:'标题文字',mutedText:'正文文字'};
const copyFields={'hero-headline':'headline','hero-subtitle':'subtitle','primary-cta':'cta','company-about':'about'}as const;
export function MaterialsEditor({projectId,draft,disabled,onChange,onUpload,onPreview}:{projectId:string;draft:Draft;disabled:boolean;onChange:(patch:Partial<Draft>)=>void;onUpload:(file:File,apply:(asset:Asset)=>void)=>Promise<void>;onPreview:()=>void}){
  const[profile,setProfile]=useState<MaterialsTemplateContract>();const[error,setError]=useState('');
  const materials=draft.materials!;
  useEffect(()=>{let active=true;setProfile(undefined);setError('');api<MaterialsTemplateContract>(`/api/internal/template-guides/materials/${encodeURIComponent(materials.templateId)}?contractRevision=${encodeURIComponent(materials.contractRevision)}`).then(p=>{if(active)setProfile(p)}).catch(e=>{if(active)setError(errorMessage(e))});return()=>{active=false}},[materials.templateId,materials.contractRevision]);
  const change=(next:AppliedMaterials)=>onChange({materials:next,brandColor:next.visual.palette.primary});
  const image=(index:number,patch:Partial<AppliedMaterials['imageBindings'][number]>)=>change({...materials,imageBindings:materials.imageBindings.map((b,i)=>i===index?{...b,...patch}:b)});
  const copy=(index:number,text:string)=>{
    const binding=materials.textBindings[index],field=copyFields[binding.slotId as keyof typeof copyFields];
    const patch:Partial<Draft>={materials:{...materials,textBindings:materials.textBindings.map((b,i)=>i===index?{...b,text}:b)}};
    if(field)patch.copy={...draft.copy,[binding.locale]:{...draft.copy[binding.locale]!,[field]:text}};
    onChange(patch);
  };
  return <><SectionTitle title="已确认的网站资料" description="修改页面文案、配色和图片后，可直接检查电脑与手机效果。"/>
    {error&&<Notice tone="error">{error}</Notice>}
    <section className="panel"><h3>整站视觉</h3><div className="form-grid">
      {Object.entries(colors).map(([key,label])=><Field key={key} label={label}><input type="color" value={materials.visual.palette[key as keyof typeof colors]} disabled={disabled} onChange={e=>change({...materials,visual:{...materials.visual,palette:{...materials.visual.palette,[key]:e.target.value}}})}/></Field>)}
      <Field label="背景"><select disabled={disabled} value={materials.visual.backgroundStyle} onChange={e=>change({...materials,visual:{...materials.visual,backgroundStyle:e.target.value as AppliedMaterials['visual']['backgroundStyle']}})}><option value="plain">纯色</option><option value="soft-gradient">柔和渐变</option><option value="subtle-shapes">淡色图形</option></select></Field>
      <Field label="图片观感"><select disabled={disabled} value={materials.visual.imageTreatment} onChange={e=>change({...materials,visual:{...materials.visual,imageTreatment:e.target.value as AppliedMaterials['visual']['imageTreatment']}})}><option value="natural">自然</option><option value="soft">柔和</option><option value="crisp">清晰</option></select></Field>
    </div></section>
    {Object.entries(pages).map(([page,label])=><details key={page} className="optional-setup"><summary>{label}文案</summary><div className="panel form-grid">
      {materials.textBindings.map((binding,index)=>{const spec=profile?.textSlots.find(s=>s.id===binding.slotId);if(spec?.page!==page)return null;return <Field key={`${binding.slotId}-${binding.locale}`} label={`${binding.locale.toUpperCase()} · ${binding.slotId.endsWith('seo-title')?'搜索标题':binding.slotId.endsWith('seo-description')?'搜索简介':spec.purpose.split(':')[0]}`}>
        <textarea rows={binding.text.length>100?4:2} value={binding.text} disabled={disabled} onChange={e=>copy(index,e.target.value)}/><small>{[...binding.text].length} / {spec.maxCodePoints} 字符</small>
      </Field>})}
    </div></details>)}
    <details className="optional-setup"><summary>页面图片与手机裁切</summary><div className="panel">
      {materials.imageBindings.map((binding,index)=>{if(binding.slotId==='product-main'||binding.slotId==='product-gallery')return null;const spec=profile?.imageSlots.find(s=>s.id===binding.slotId);const role=binding.role?{scene:'场景图',front:'单品正面图',packaging:'包装图',collection:'产品集合图',main:'主图',detail:'细节图',facility:'企业流程配图',logistics:'物流配图'}[binding.role]:'';const product=draft.products.find(p=>p.id===binding.productId);return <section key={`${binding.slotId}:${binding.productId||''}`} style={{borderBottom:'1px solid var(--border)',padding:'20px 0'}}>
        <h4>{spec?pages[spec.page]:''} · {role||`图片 ${index+1}`}{product?` · ${product.name}`:''}</h4><div className="brand-upload-grid"><AssetView projectId={projectId} assetId={binding.assetId} alt={binding.alt.en||''}/><div className="form-grid">
          <Field label="替换图片"><input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={e=>{const file=e.target.files?.[0];if(file)void onUpload(file,asset=>image(index,{assetId:asset.id}));e.target.value=''}}/></Field>
          <Field label="手机专用图片（选填）"><input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={e=>{const file=e.target.files?.[0];if(file)void onUpload(file,asset=>image(index,{mobileAssetId:asset.id}));e.target.value=''}}/></Field>
          <Field label="显示方式"><select value={binding.fit} disabled={disabled} onChange={e=>image(index,{fit:e.target.value as 'cover'|'contain'})}><option value="contain">显示完整图片</option><option value="cover">铺满图片位置</option></select></Field>
          {(['x','y']as const).map(axis=><Field key={axis} label={axis==='x'?'水平焦点':'垂直焦点'}><input type="range" min="0" max="1" step="0.05" disabled={disabled} value={binding.focalPoint[axis]} onChange={e=>image(index,{focalPoint:{...binding.focalPoint,[axis]:Number(e.target.value)}})}/></Field>)}
          {(['x','y']as const).map(axis=><Field key={'mobile-'+axis} label={axis==='x'?'手机水平焦点':'手机垂直焦点'}><input type="range" min="0" max="1" step="0.05" disabled={disabled} value={(binding.mobileFocalPoint||binding.focalPoint)[axis]} onChange={e=>image(index,{mobileFocalPoint:{...(binding.mobileFocalPoint||binding.focalPoint),[axis]:Number(e.target.value)}})}/></Field>)}
          {binding.mobileAssetId&&<Button disabled={disabled} kind="quiet" onClick={()=>image(index,{mobileAssetId:undefined,mobileFocalPoint:undefined})}>移除手机专用图</Button>}
        </div></div>
      </section>})}
    </div></details><Button kind="primary" disabled={disabled} onClick={onPreview}>保存并检查网站预览</Button></>;
}
