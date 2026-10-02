import { displayProducts } from '../../shared/product-display';
import { materialsRuntime } from '../../shared/materials-runtime';
import { withBanner } from '../../shared/banner';
import type { Draft, Product } from '../../shared/model';
import { buildThemeContext, esc, productPath, safeUrl, type RenderOptions } from './types';
import { lumiSnapshots } from './lumi/snapshots';
import { lumiReferenceStyles } from './lumi/styles';
import { lumiRuntime } from './lumi/runtime';

export { lumiRuntime };
const extraStyles = `
.lumi-preview-mode [data-framer-name="Navbar"]{translate:0 38px}html{scroll-behavior:smooth}body{background:#f9fbfd;color:#1a3b50;overflow-x:clip}.lumi-brand{display:flex;align-items:center;gap:5px;font:700 32px/1 'Satoshi Variable',sans-serif;color:#1a3b50;letter-spacing:-1.4px}.lumi-brand-icon{font-size:33px;line-height:1;letter-spacing:-7px;margin-right:9px}.lumi-brand-image{max-width:140px;max-height:40px;object-fit:contain}.lumi-form-status{font:14px/1.5 'Satoshi Variable',sans-serif;width:100%}.lumi-honeypot{position:absolute;left:-10000px;opacity:0;pointer-events:none}.lumi-video-toggle{position:absolute;bottom:20px;right:20px;border:0;border-radius:50%;width:44px;height:44px;color:white;background:#1a3b50;cursor:pointer;z-index:5}.framer-slideshow:hover .framer--slideshow-controls>div{opacity:1!important}.lumi-private-bar{text-align:center;padding:10px;background:#e8f2fc;color:#1a3b50;font:13px/1.4 'Satoshi Variable',sans-serif}.lumi-customer-services{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px;padding:60px 0}.lumi-service{background:white;border-radius:16px;box-shadow:0 3px 9px #1a3b500b;padding:38px;text-align:center;min-width:0}.lumi-service img{width:128px;height:128px;object-fit:contain;border-radius:14px;margin:0 auto 24px;display:block}.lumi-service h3{font:700 26px/1.2 'Satoshi Variable',sans-serif;margin:0 0 14px}.lumi-service p{font:18px/1.6 'Satoshi Variable',sans-serif;margin:0 0 20px}.lumi-service a{color:#1a3b50;font:700 16px 'Satoshi Variable',sans-serif}.lumi-customer-headline{font:500 72px/1.07 'Satoshi Variable',sans-serif;letter-spacing:-3px}.lumi-customer-headline em{font-family:'Playfair Display Variable',serif;font-weight:400}.lumi-detail{max-width:1240px;margin:auto;padding:150px 30px 120px;display:grid;grid-template-columns:1fr 1fr;gap:70px}.lumi-detail h1{font:500 54px/1.1 'Satoshi Variable',sans-serif;letter-spacing:-2px;margin:24px 0}.lumi-detail p,.lumi-detail li{font:20px/1.6 'Satoshi Variable',sans-serif;margin:18px 0}.lumi-detail img{width:100%;border-radius:18px;object-fit:contain}.lumi-detail-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:20px}.lumi-button{display:inline-flex;align-items:center;gap:10px;border:0;background:#1a3b50;color:white;border-radius:10px;padding:17px 26px;text-decoration:none;font:700 18px 'Satoshi Variable',sans-serif;box-shadow:0 7px 12px #1a3b501a}.lumi-cta{font:700 18px/1.4 'Satoshi Variable',sans-serif}.lumi-neutral{padding:40px;font:20px/1.6 'Satoshi Variable',sans-serif;text-align:center;background:white;border-radius:15px}.lumi-mobile-toggle,.lumi-mobile-menu{display:none}[data-lumi-tab]{cursor:pointer}[data-lumi-tab]:focus-visible{outline:2px solid #48a7ff;outline-offset:4px}[data-lumi-tab][aria-selected=true]{background:#eaf4ff!important;border-radius:12px}.lumi-tab-panel{margin-top:24px;padding:24px;background:#edf2f6;border-radius:12px;font:18px/1.5 'Satoshi Variable',sans-serif}.lumi-tab-panel h3{font-size:24px;margin-bottom:15px}.lumi-tab-panel[hidden]{display:none}.lumi-static-note{font:13px 'Satoshi Variable',sans-serif;text-align:center;padding:12px;background:#eaf3fc}.lumi-preview-mode form button[type=submit]{opacity:.65;cursor:not-allowed}#lumi-root [data-lumi-headline]{overflow:visible}
.lumi-customer [data-lumi-example]{display:none!important}.lumi-customer [data-lumi-services],.lumi-customer [data-lumi-pricing]{height:auto!important;min-height:0!important}.lumi-customer-services{width:100%;max-width:1240px;margin:auto}.lumi-brand-image{display:block}.lumi-customer [data-lumi-brand]{text-decoration:none;color:#1a3b50}
@media(max-width:1299px){.lumi-customer-headline{font-size:58px}.lumi-service{padding:26px}.lumi-detail{gap:36px;padding-top:110px}}
@media(max-width:809px){.lumi-customer-headline{font-size:42px;letter-spacing:-1.5px}.lumi-customer-services{grid-template-columns:1fr;padding:30px 0}.lumi-detail{grid-template-columns:1fr;padding:110px 22px 65px;gap:36px}.lumi-detail h1{font-size:40px}.lumi-mobile-toggle{display:block;position:static;z-index:90;width:38px;height:38px;border:0;border-radius:8px;background:transparent;color:white;font-size:24px}.lumi-mobile-menu:not([hidden]){display:flex;position:fixed;top:83px;left:16px;right:16px;z-index:100;flex-direction:column;gap:0;background:white;border-radius:12px;padding:14px;box-shadow:0 12px 40px #1a3b5033}.lumi-preview-mode .lumi-mobile-menu:not([hidden]){top:121px}.lumi-mobile-menu a{font:600 18px 'Satoshi Variable',sans-serif;text-decoration:none;color:#1a3b50;padding:13px 10px}.lumi-brand{font-size:28px}.lumi-detail-gallery{gap:12px}}
.lumi-detail-gallery button{min-width:0;border:1px solid #cbd7e1;background:white;border-radius:12px;padding:8px;cursor:pointer}.lumi-detail-gallery button[aria-pressed=true]{border:2px solid #1a3b50}.lumi-detail-gallery button img{aspect-ratio:1;object-fit:contain}.lumi-product-choice{display:block;width:100%;font:16px 'Satoshi Variable',sans-serif}.lumi-product-choice select{display:block;width:100%;padding:16px;margin-top:8px;border:1px solid #cbd7e1;border-radius:10px;background:white}.lumi-languages{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;padding:20px;font:14px 'Satoshi Variable',sans-serif}.lumi-languages a{color:#1a3b50}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
const region=(html:string,key:string,content:string)=>html.replace(new RegExp(`<!--LUMI_${key}_START-->[\\s\\S]*?<!--LUMI_${key}_END-->`,'g'),()=>content);
const translated=(p:Product,lang:string)=>({name:p.translations?.[lang as 'en']?.name||p.name,description:p.translations?.[lang as 'en']?.description||p.description});

/** A local, reusable theme built from the reference geometry with project-owned content and forms. */
export function renderLumiSite(draft:Draft,options:RenderOptions):string {
  const page=options.page==='detail'?'catalog':lumiSnapshots[options.page]?options.page:'home';
  const text=(id:string)=>draft.materials?.textBindings.find(b=>b.slotId===id&&b.locale===options.lang)?.text;
  if(draft.materials){const old=draft.copy[options.lang]||draft.copy.en;draft={...draft,copy:{...draft.copy,[options.lang]:{headline:text('hero-headline')||old?.headline||'',subtitle:text('hero-subtitle')||old?.subtitle||'',cta:text('primary-cta')||old?.cta||'',about:text('company-about')||old?.about||''}},company:{...draft.company,aboutHeadline:text('about-headline')||draft.company.aboutHeadline,aboutStory:text('about-story')||text('company-about')||draft.company.aboutStory},products:draft.products.map(p=>{const main=draft.materials!.imageBindings.find(b=>b.slotId==='product-main'&&b.productId===p.id);const gallery=draft.materials!.imageBindings.filter(b=>b.slotId==='product-gallery'&&b.productId===p.id).sort((a,b)=>(a.itemIndex||0)-(b.itemIndex||0));return {...p,imageAssetId:main?.assetId||p.imageAssetId,...(gallery.length?{gallery:gallery.map(b=>({assetId:b.assetId,sourceImageId:b.assetId,kind:'original' as const,caption:b.alt[options.lang]||p.name}))}:{})}})};}
  const ctx=buildThemeContext(draft,options);
  const products=displayProducts(draft);
  const demo=['preview','lumi-demo','materials-demo'].includes(options.projectId);
  const name=draft.company.name||'Lumi';const copy=draft.copy[options.lang]||draft.copy.en;
  const depth=options.page==='home'?'':options.page==='detail'?'../../':'../';
  const path=(p:string)=>depth+(p==='home'?'index.html':`${p}/index.html`);
  const logo=ctx.asset(draft.company.logoAssetId);
  const brand=logo?`<img class="lumi-brand-image" src="${esc(logo)}" alt="${esc(name)}">`:`<span class="lumi-brand"><span class="lumi-brand-icon" aria-hidden="true">⌑</span>${esc(name.toLowerCase()==='lumi'?'lumi':name)}</span>`;
  const menu=`<nav class="lumi-mobile-menu" data-lumi-mobile-menu aria-label="Mobile navigation" hidden>${[['home','Home I'],['about','Home II'],['catalog','Services'],['extra-blog','Blog'],['extra-pricing','Pricing'],['extra-career','Career'],['contact','Contact']].map(([p,label])=>`<a href="${esc(path(p))}" data-wr-page="${p}">${label}</a>`).join('')}</nav>`;
  const services=draft.products.length?`<div class="lumi-customer-services" data-wr-product-list="${esc(options.page)}">${products.slice(0,options.page==='home'?8:undefined).map(p=>{const text=translated(p,options.lang);const image=ctx.asset(p.imageAssetId);return `<article class="lumi-service" data-product-card data-wr-product-card data-wr-product-id="${esc(p.id)}" data-product-name="${esc(text.name)}">${image?`<img src="${esc(image)}" alt="${esc(text.name)}" width="128" height="128" loading="lazy">`:''}<h3>${esc(text.name)}</h3>${p.tagline?`<p>${esc(p.tagline)}</p>`:''}<a href="${esc(depth+productPath(p.id))}" data-wr-page="detail" data-wr-product-id="${esc(p.id)}">Learn More ↗</a></article>`}).join('')}</div>`:'';
  const selected=draft.products.find(p=>p.id===options.productId)||ctx.mainProduct;
  const detail=()=>{
    if(!selected)return '<section class="lumi-detail"><h1>Service details</h1><p>No service has been added yet.</p></section>';
    const p=translated(selected,options.lang);const photo=ctx.asset(selected.imageAssetId);return `<section class="lumi-detail"><div>${photo?`<img id="wr-detail-main-img" data-wr-material-image="product-main" data-wr-material-product="${esc(selected.id)}" src="${esc(photo)}" alt="${esc(p.name)}" loading="eager" fetchpriority="high">`:''}<div class="lumi-detail-gallery senseng-detail-thumbs">${[{assetId:selected.imageAssetId,caption:p.name},...(selected.gallery||[])].filter((g,i,all)=>g.assetId&&all.findIndex(other=>other.assetId===g.assetId)===i).map((g,i)=>`<button type="button" class="wr-detail-thumb" data-wr-material-thumb data-src="${esc(ctx.asset(g.assetId))}" aria-label="View image ${i+1}" aria-pressed="${i===0}"><img src="${esc(ctx.asset(g.assetId))}" alt="${esc(g.caption||p.name)}" loading="lazy"></button>`).join('')}</div></div><div><a href="${esc(path('catalog'))}" data-wr-page="catalog">← All services</a><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p>${selected.sellingPoints?.length?`<ul>${selected.sellingPoints.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:''}${selected.material?`<p>${esc(selected.material)}</p>`:''}${selected.dimensions?`<p>${esc(selected.dimensions)}</p>`:''}<a class="lumi-button" href="${esc(path('contact')+'?productId='+encodeURIComponent(selected.id))}" data-wr-page="contact" data-wr-product-id="${esc(selected.id)}">Discuss this service ↗</a></div></section>`;
  };
  let bannerStyles='';
  const transform=(source:string,screen:string)=>{
    let body=source;
    if(logo||name.toLowerCase()!=='lumi')body=region(body,'BRAND',brand);
    body=body.replace(/__LUMI_LINK_([\w-]+)__/g,(_,p:string)=>esc(path(p)));
    const values:Record<string,string>={BRAND:brand,NAME:esc(name),EMAIL:esc(draft.company.email||(demo?'contact@lumi.com':'')),PHONE:esc(draft.company.phone||(demo?'00 (123) 456 78 90':'')),ADDRESS:esc(draft.company.address||(demo?'Moonshine Street 14/05 London, United Kingdom':'')),YEAR:String(new Date().getFullYear()),INQUIRY_URL:esc(safeUrl(options.inquiryUrl)),PREVIEW:String(!!options.preview),PRODUCT_ID:esc(options.productId||'')};
    body=body.replace(/__LUMI_([A-Z_]+)__/g,(_,k:string)=>values[k]||'');
    if(!demo){
      body=region(body,'EXAMPLE','');
      body=body.replace(/\sdata-(?:counter|count|suffix|prefix|progress|percent|percentage|purecounter(?:-[\w-]+)?)="[^"]*"/g,'');
      body=region(body,'PRICING','<div class="lumi-neutral">Every project is different. <a href="'+esc(path('contact'))+'" data-wr-page="contact">Contact us for a tailored proposal ↗</a></div>');
      if(copy?.headline&&options.page==='home')body=region(body,'HEADLINE',`<span class="lumi-customer-headline">${esc(copy.headline)}</span>`);
      if(options.page==='about'&&(draft.company.aboutHeadline||draft.company.name))body=region(body,'HEADLINE',`<span class="lumi-customer-headline">${esc(draft.company.aboutHeadline||'About '+name)}</span>`);
      if(services&&options.page!=='detail')body=region(body,'SERVICES',services);
      const subtitle=options.page==='about'?(draft.company.aboutStory||draft.company.description):copy?.subtitle||draft.company.description;
      if(subtitle){body=body.replace(/We help businesses define clear direction,[^<]+|We help brands unlock growth[^<]+/g,()=>esc(subtitle))}
      // Reference editorial and hiring content is clearly identified until real company copy is supplied.
      if(/^extra-(?:article|blog|career)/.test(options.page))body='<div class="lumi-static-note">Template example content — replace this editorial or hiring copy before publication.</div>'+body;
    }
    for(const b of draft.materials?.textBindings||[]){if(b.locale!==options.lang)continue;body=body.replace(new RegExp('<!--LUMI_COPY_'+b.slotId.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'_START-->[\\s\\S]*?<!--LUMI_COPY_'+b.slotId.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'_END-->','g'),()=>esc(b.text));}
    body=body.replace(/<img\b[^>]*data-lumi-image="([^"]+)"[^>]*>/g,(tag,id:string)=>{
      const b=draft.materials?.imageBindings.find(b=>b.slotId===id);if(!b)return tag;
      const url=ctx.asset(screen==='mobile'&&b.mobileAssetId?b.mobileAssetId:b.assetId);if(!url)return tag;
      const point=screen==='mobile'&&b.mobileFocalPoint?b.mobileFocalPoint:b.focalPoint;
      const originalStyle=tag.match(/\sstyle="([^"]*)"/)?.[1]||'';
      const fit=b.fit==='contain'?'contain':'cover';
      return tag.replace(/\s(?:src|srcset|sizes|alt|style)="[^"]*"/g,'').replace(/>$/,` src="${esc(url)}" alt="${esc(b.alt[options.lang]||'')}" style="${originalStyle};object-fit:${fit};object-position:${point.x*100}% ${point.y*100}%">`);
    });
    const poster=draft.materials?.imageBindings.find(b=>b.slotId==='hero-video-poster');if(poster){const url=ctx.asset(screen==='mobile'&&poster.mobileAssetId?poster.mobileAssetId:poster.assetId);body=body.replace(/<video\b[^>]*data-lumi-poster="hero-video-poster"[^>]*>/g,tag=>tag.replace(/\sposter="[^"]*"/,'').replace(/>$/,` poster="${esc(url)}">`));}
    if(!demo&&copy?.cta)body=body.replace(/>Get Started</g,()=>`>${esc(copy.cta)}<`);
    if(options.page==='detail'){
      // Keep the reference header and footer, replacing the central services section with the selected record.
      const heroStart=body.indexOf('<!--LUMI_HEADLINE_START-->');
      body=region(body,'HEADLINE','Service details');
      body=region(body,'SERVICES',detail());
      if(heroStart<0)body=detail()+body;
    }
    if(options.page==='detail')body=body.replace(/<h1\b/g,'<h2').replace(/<\/h1>/g,'</h2>').replace(/<h2>([^]*?)<\/h2>/,(_whole,content:string)=>`<h1>${content}</h1>`);
    if(options.page==='contact')body=body.replace(/(<form\b[^>]*data-lumi-form[^>]*>)/g,tag=>tag+`<label class="lumi-product-choice">${esc(ctx.ui.product)}<select name="productId"><option value="">—</option>${products.map(p=>`<option value="${esc(p.id)}"${p.id===options.productId?' selected':''}>${esc(translated(p,options.lang).name)}</option>`).join('')}</select></label>`);
    body+=menu;
    const bannerHtml=withBanner('<!doctype html><html><head></head><body class="wr-materials-site">'+body+'</body></html>',draft,options.assetUrl,{page:options.page,productId:options.productId});
    const customStyles=bannerHtml.match(/<head>([\s\S]*?)<\/head>/)?.[1]||'';
    if(customStyles)bannerStyles=customStyles;
    return (bannerHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1]||body).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  };
  const variants=lumiSnapshots[page];
  const title=text(`${options.page}-seo-title`)||(options.page==='home'?name:`${options.page==='detail'&&selected?translated(selected,options.lang).name:options.page.replace('extra-','').replace(/-/g,' ')} · ${name}`);
  const description=text(`${options.page}-seo-description`)||copy?.subtitle||draft.company.description||'Clear strategy, thoughtful design and useful services for growing businesses.';
  const desktop=transform(variants.desktop,'desktop'),tablet=transform(variants.tablet,'tablet'),mobile=transform(variants.mobile,'mobile');
  const palette=draft.materials?.visual.palette;
  const accent=/^#[a-f0-9]{6}$/i.test(draft.brandColor)?draft.brandColor:'#4facfe';
  const paletteStyle=palette?`body.lumi-business{--token-dd80e8ea-932b-470e-a52c-c12274622b13:${palette.primary};--token-76e093c1-e079-4b0e-9f9d-65ae3a36e2e4:${palette.text};--token-625c9590-2804-4340-9278-d7c4a75e2573:${palette.background}}`:!demo&&accent!=='#48a7ff'?`body.lumi-business{--token-dd80e8ea-932b-470e-a52c-c12274622b13:${accent}}`:'';
  const styles=lumiReferenceStyles[page]+extraStyles+paletteStyle;
  return `<!doctype html><html lang="${esc(options.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${options.preview?'<meta name="robots" content="noindex,nofollow">':''}<style>${styles}</style>${bannerStyles}</head><body data-template="lumi-business" class="lumi-business${draft.materials?' wr-materials-site':''}${demo?'':' lumi-customer'}${options.preview?' lumi-preview-mode':''}">${options.preview?'<div class="lumi-private-bar">Private preview · enquiry sending is disabled</div>':''}<div id="lumi-root" data-lumi-preview="${!!options.preview}">${desktop}</div>${draft.languages.length>1?`<nav class="lumi-languages" aria-label="${esc(ctx.ui.language)}">${ctx.languageLinks}</nav>`:''}<template data-lumi-screen="tablet">${tablet}</template><template data-lumi-screen="mobile">${mobile}</template><template data-lumi-screen="desktop">${desktop}</template><script>var __name=(value)=>value;(${lumiRuntime.toString()})();(${materialsRuntime.toString()})();</script></body></html>`;
}
