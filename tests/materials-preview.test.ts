import{describe,expect,it}from'vitest';
import{rewriteMaterialsPreviewMedia}from'../src/client/Preview';
describe('authenticated materials preview media',()=>{
  it('captures CSS backgrounds and responsive images without leaving private asset requests active',()=>{
    const attrs:Record<string,string>={style:'background-image:url("/api/projects/p/assets/desktop");--wr-mobile-bg:url("/api/projects/p/assets/mobile");background-position:70% 30%',srcset:'/api/projects/p/assets/mobile','data-wr-desktop-poster':'/api/projects/p/assets/desktop','data-wr-mobile-poster':'/api/projects/p/assets/mobile'};
    const node={getAttribute:(name:string)=>attrs[name]||null,setAttribute:(name:string,value:string)=>{attrs[name]=value},removeAttribute:(name:string)=>{delete attrs[name]}};
    const ids=rewriteMaterialsPreviewMedia(node,'p');expect(ids).toEqual(expect.arrayContaining(['desktop','mobile']));expect(attrs.style.includes('/api/')).toBe(false);expect(attrs.style).toContain('70% 30%');expect(attrs.srcset).toBeUndefined();expect(attrs['data-wr-srcset']).toBe('mobile');expect(attrs['data-wr-material-style']).toContain('/api/projects/p/assets/desktop');
  });
});
