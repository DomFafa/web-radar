import{afterEach,describe,expect,it,vi}from'vitest';
import{previewNavigationBridge,previewRequestQuery,restorePreviewFragment,rewriteMaterialsPreviewMedia}from'../src/client/Preview';
import{projectPreviewHtml}from'../src/worker/project-preview';
import{parse,type DefaultTreeAdapterMap}from'parse5';
afterEach(()=>vi.unstubAllGlobals());
describe('site preview request selection',()=>{
  it.each(['detail','contact'] as const)('keeps the selected product in %s requests',page=>{
    const query=previewRequestQuery(page,'en','product-b');
    expect(Object.fromEntries(query)).toEqual({page,lang:'en',productId:'product-b'});
  });
  it.each(['home','catalog','about'] as const)('does not attach product selection to %s requests',page=>{
    expect(previewRequestQuery(page,'en','product-b').has('productId')).toBe(false);
  });
  it('does not invent a product for an unselected contact request',()=>{
    expect(previewRequestQuery('contact','en').has('productId')).toBe(false);
  });
});
describe('authenticated materials preview media',()=>{
  it('captures CSS backgrounds and responsive images without leaving private asset requests active',()=>{
    const attrs:Record<string,string>={style:'background-image:url("/api/projects/p/assets/desktop");--wr-mobile-bg:url("/api/projects/p/assets/mobile");background-position:70% 30%',srcset:'/api/projects/p/assets/mobile','data-wr-desktop-poster':'/api/projects/p/assets/desktop','data-wr-mobile-poster':'/api/projects/p/assets/mobile'};
    const node={getAttribute:(name:string)=>attrs[name]||null,setAttribute:(name:string,value:string)=>{attrs[name]=value},removeAttribute:(name:string)=>{delete attrs[name]}};
    const ids=rewriteMaterialsPreviewMedia(node,'p');expect(ids).toEqual(expect.arrayContaining(['desktop','mobile']));expect(attrs.style.includes('/api/')).toBe(false);expect(attrs.style).toContain('70% 30%');expect(attrs.srcset).toBeUndefined();expect(attrs['data-wr-srcset']).toBe('mobile');expect(attrs['data-wr-material-style']).toContain('/api/projects/p/assets/desktop');
  });
});

describe('archived contact preview product selection',()=>{
  const archive='<html><head></head><body><form id="inquiry" action="/inquiries"><select name="productId"><option value="">—</option><option value="product-a" selected>Product A</option><optgroup label="More"><option value="product-b">Product B</option></optgroup></select><button type="submit" disabled>Send inquiry</button></form></body></html>';
  const archivedPages=Object.freeze({'en/contact/index.html':archive});
  const selectedProducts=(html:string)=>{
    const selected:string[]=[];
    const visit=(node:DefaultTreeAdapterMap['node'])=>{
      if('tagName'in node&&node.tagName==='option'&&node.attrs.some(attribute=>attribute.name==='selected')) selected.push(node.attrs.find(attribute=>attribute.name==='value')?.value||'');
      if('childNodes'in node)node.childNodes.forEach(visit);
    };
    visit(parse(html));return selected;
  };
  const project=(productId?:string,page:'contact'|'about'='contact')=>projectPreviewHtml(archivedPages['en/contact/index.html'],'/api/projects/p','https://wr.example',{page,lang:'en',productId,expectedVersion:1});
  it('selects requested product B from the archived product A contact without changing the archive',()=>{
    expect(selectedProducts(project('product-b'))).toEqual(['product-b']);
    expect(archivedPages['en/contact/index.html']).toBe(archive);
    expect(selectedProducts(project('product-a'))).toEqual(['product-a']);
  });
  it.each(['foreign-product','',undefined])('keeps the archived choice for an unavailable product: %s',productId=>{
    expect(selectedProducts(project(productId))).toEqual(['product-a']);
  });
  it('preserves preview form and submit disabling while switching the selected product',()=>{
    const html=project('product-b');
    expect(html).toContain('action="#"');expect(html).toContain('data-wr-preview-disabled="true"');expect(html).toContain('<button type="submit" disabled="">');
    expect(selectedProducts(html)).toEqual(['product-b']);
  });
  it('does not change a product selector outside the contact page',()=>{
    expect(selectedProducts(project('product-b','about'))).toEqual(['product-a']);
  });
});

describe('sandboxed preview anchors',()=>{
  it('preserves only bounded section fragments when rewriting project page links',()=>{
    const html=projectPreviewHtml('<a data-wr-page="home" href="../index.html#gallery">Gallery</a><a data-wr-page="home" href="../index.html#bad[selector]">Invalid</a>', '/api/projects/p', 'https://wr.example', {page:'contact',lang:'en',expectedVersion:2});
    expect(html).toContain('/preview?page=home&amp;lang=en&amp;expectedVersion=2#gallery');
    expect(html).not.toContain('#bad');
  });
  function navigation(href:string,dataset:Record<string,string>={}){
    let click!:(event:MouseEvent)=>void;
    const scroll=vi.fn(),postMessage=vi.fn(),preventDefault=vi.fn();
    vi.stubGlobal('document',{addEventListener:(_type:string,callback:typeof click)=>{click=callback;},getElementById:(id:string)=>id==='gallery'?{scrollIntoView:scroll}:null});
    vi.stubGlobal('parent',{postMessage});
    previewNavigationBridge('frame-channel','https://app.example','about','p1');
    click({target:{closest:()=>({dataset,getAttribute:()=>href})},preventDefault} as unknown as MouseEvent);
    return{scroll,postMessage,preventDefault};
  }
  it('scrolls a same-page fragment without navigating the iframe',()=>{
    const result=navigation('#gallery');expect(result.preventDefault).toHaveBeenCalled();expect(result.scroll).toHaveBeenCalledWith({block:'start'});expect(result.postMessage).not.toHaveBeenCalled();
  });
  it('sends a bounded cross-page section only with a declared page hook',()=>{
    const result=navigation('../index.html#gallery',{wrPage:'home'});
    expect(result.postMessage).toHaveBeenCalledWith({type:'wr:preview-navigate',channel:'frame-channel',page:'home',lang:undefined,productId:'p1',fragment:'gallery'},'https://app.example');expect(result.scroll).not.toHaveBeenCalled();
  });
  it.each(['https://outside.example/#gallery','javascript:alert(1)','#bad[selector]','#'+'a'.repeat(81)])('blocks arbitrary navigation and invalid fragments: %s',href=>{
    const result=navigation(href);expect(result.preventDefault).toHaveBeenCalled();expect(result.postMessage).not.toHaveBeenCalled();expect(result.scroll).not.toHaveBeenCalled();
  });
  it('restores a destination section only after image decode completes',async()=>{
    let decode!:()=>void;const scroll=vi.fn();
    const image={getAttribute:()=>'/image.jpg',loading:'lazy',decode:()=>new Promise<void>(resolve=>{decode=resolve;})};
    vi.stubGlobal('document',{images:[image],fonts:{ready:Promise.resolve()},getElementById:()=>({scrollIntoView:scroll})});
    const restore=restorePreviewFragment('gallery');expect(scroll).not.toHaveBeenCalled();expect(image.loading).toBe('eager');decode();await restore;expect(scroll).toHaveBeenCalledWith({block:'start'});
  });
});
