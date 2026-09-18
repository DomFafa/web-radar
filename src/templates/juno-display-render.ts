import {parseFragment,serialize,type DefaultTreeAdapterMap} from 'parse5';
import type {Draft} from '../shared/model';
import {buildThemeContext,esc,productPath,type RenderOptions} from './themes/types';

/** Only v3 calls this renderer. Product identity and order come from the saved snapshot. */
export function renderJunoDisplay(markup:string,draft:Draft,options:RenderOptions):string{
  const ctx=buildThemeContext(draft,options),m=draft.materials!,selection=m.displaySelection!;
  const copy=(id:string)=>esc(m.textBindings.find(b=>b.slotId===id&&b.locale===ctx.lang)?.text||'');
  const cards=(role:'scene'|'front'|'packaging',ids:string[])=>`<div class="wr-display-grid" style="--wr-display-count:${ids.length}">${ids.map(id=>{
    const product=draft.products.find(p=>p.id===id)!;
    const link=`href="${esc(ctx.path(productPath(id)))}" ${ctx.navAttrs('detail',id)}`;
    return `<article class="wr-display-card" data-wr-display-role="${role}" data-wr-product-id="${esc(id)}"><a class="wr-display-photo" ${link}><img data-wr-material-image="${role}-card" data-wr-material-product="${esc(id)}"></a><div class="wr-display-caption"><h3><a ${link}>${esc(ctx.translateProduct(product).name)}</a></h3><a class="wr-display-link" ${link}>${copy('display-card-cta')} <span aria-hidden="true">↗</span></a></div></article>`;
  }).join('')}</div>`;
  const contents:Record<string,string>={
    '6e37763':cards('scene',selection.sceneProductIds),
    'b51d430':cards('front',selection.featuredProductIds),
    '0b4ff1c':`<div class="wr-display-row"><h3 class="wr-display-row-title">${copy('front-row-label')}</h3>${cards('front',selection.featuredProductIds)}</div><div class="wr-display-row"><h3 class="wr-display-row-title">${copy('packaging-row-label')}</h3>${cards('packaging',selection.featuredProductIds)}</div>`,
    '6f48de11':`<div class="wr-collection-media"><img data-wr-material-image="collection-banner-mid"></div><div class="wr-collection-copy"><h2>${copy('mid-banner-headline')}</h2><p>${copy('mid-banner-subtitle')}</p><a class="sc_button" href="${esc(ctx.path(ctx.navPath('contact')))}" ${ctx.navAttrs('contact')}>${copy('mid-banner-cta')}</a></div>`,
  };
  const root=parseFragment(markup);
  function visit(node:DefaultTreeAdapterMap['node']){
    if('tagName'in node&&node.tagName==='section'){
      const id=node.attrs.find(a=>a.name==='data-id')?.value||'';
      if(contents[id]){
        // Discard the old Elementor sizing/background attributes along with its cards.
        node.attrs=[{name:'data-id',value:id},{name:'class',value:'wr-juno-display'+(id==='6f48de11'?' wr-collection-banner':'')}];
        node.childNodes=parseFragment(contents[id]).childNodes;
        for(const child of node.childNodes)child.parentNode=node;
        return;
      }
    }
    if('childNodes'in node)node.childNodes.forEach(visit);
  }
  visit(root);return serialize(root);
}

export const junoDisplayStyle=`
.wr-materials-site.juno-toys .wr-juno-display{width:min(1170px,calc(100% - 48px));margin:0 auto;box-sizing:border-box}
.wr-juno-display .wr-display-grid{display:grid;grid-template-columns:repeat(var(--wr-display-count),minmax(0,1fr));gap:24px;max-width:calc(var(--wr-display-count) * 300px);margin:0 auto}
.wr-juno-display .wr-display-card{min-width:0;background:var(--wr-surface);border-radius:16px;overflow:hidden;border:1px solid color-mix(in srgb,var(--wr-muted) 15%,transparent)}
.wr-juno-display .wr-display-photo{display:block;aspect-ratio:1;background:var(--wr-background);overflow:hidden}
.wr-juno-display [data-wr-display-role="scene"] .wr-display-photo{aspect-ratio:4/3}
.wr-juno-display .wr-display-photo img{display:block;width:100%;height:100%!important;margin:0}
.wr-juno-display .wr-display-caption{padding:18px 20px 22px}
.wr-juno-display .wr-display-caption h3{font-size:20px;line-height:1.35;margin:0 0 12px;font-weight:700}
.wr-juno-display .wr-display-caption h3 a{color:var(--wr-ink)}
.wr-juno-display .wr-display-link{font-size:14px;font-weight:600;color:var(--wr-accent)}
.wr-juno-display .wr-display-row+.wr-display-row{margin-top:32px}
.wr-juno-display .wr-display-row-title{text-align:center;margin:0 0 20px;font-size:22px}
.wr-materials-site.juno-toys .wr-collection-banner{position:relative;margin:48px auto 0;border-radius:24px;overflow:hidden;background:var(--wr-surface)}
.wr-collection-banner .wr-collection-media{aspect-ratio:1920/650}
.wr-collection-banner .wr-collection-media img{display:block;width:100%;height:100%!important}
.wr-collection-banner .wr-collection-copy{position:relative;padding:28px 36px;max-width:100%;box-sizing:border-box}
.wr-collection-banner .wr-collection-copy h2{margin:0 0 16px;font-size:clamp(26px,2.6vw,38px);line-height:1.15}
.wr-collection-banner .wr-collection-copy p{margin:0 0 22px;font-size:16px;line-height:1.6}
.wr-collection-banner .sc_button{display:inline-block;padding:16px 24px;border-radius:30px;font-size:14px;line-height:1.4;white-space:normal}
@media(min-width:1024px){.wr-collection-banner .wr-collection-copy{position:absolute;left:0;top:50%;transform:translateY(-50%);width:45%;padding:24px 32px}}
@media(max-width:767px){
 .wr-materials-site.juno-toys .wr-juno-display{width:calc(100% - 32px)}
 .wr-juno-display .wr-display-grid{grid-template-columns:repeat(min(var(--wr-display-count),2),minmax(0,1fr));gap:14px}
 .wr-juno-display .wr-display-caption{padding:12px}
 .wr-juno-display .wr-display-caption h3{font-size:16px;margin-bottom:10px}
 .wr-juno-display .wr-display-link{font-size:12px}
 .wr-materials-site.juno-toys .wr-collection-banner{margin-top:24px;border-radius:16px}
 .wr-collection-banner .wr-collection-copy{padding:24px}
 .wr-collection-banner .wr-collection-copy h2{font-size:28px}
}
`;
