import { afterEach, expect, it, vi } from 'vitest';
import { ProductImageSelectionFrameHost, materialSelectionFrameUrl } from '../src/client/ProductImageSelectionFrameHost';
import type { MaterialSelectionHostSource } from '../src/client/material-selection-host';
const hooks=vi.hoisted(()=>({cursor:0,effects:[] as Array<()=>void|(()=>void)>,target:{},destroy:vi.fn(),host:vi.fn(),api:vi.fn(),choose:vi.fn(),close:vi.fn()}));
vi.mock('react',async original=>({...await original<typeof import('react')>(),useRef:(value:unknown)=>hooks.cursor++===0?{current:{contentWindow:hooks.target}}:{current:value},useMemo:(factory:()=>unknown)=>factory(),useEffect:(effect:()=>void|(()=>void))=>hooks.effects.push(effect)}));
vi.mock('../src/client/api',()=>({api:hooks.api,sessionHeaders:()=>({Authorization:'Bearer host-account-only'}),ApiError:class extends Error{}}));
vi.mock('../src/client/material-selection-host',()=>({createMaterialSelectionHost:hooks.host}));
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();hooks.cursor=0;hooks.effects=[];});
it('embeds the sole Product Radar picker and forwards only canonical light cards using the current host API',async()=>{
 hooks.host.mockReturnValue({destroy:hooks.destroy,isReady:()=>true});const focus=vi.fn(),active={isConnected:true,focus};
 vi.stubGlobal('window',{addEventListener:vi.fn(),removeEventListener:vi.fn()});vi.stubGlobal('document',{documentElement:{style:{overflow:'auto'}},activeElement:active});
 const result=ProductImageSelectionFrameHost({productRadarOrigin:'https://radar.example.test',limit:18,excludedIds:['old'],onChoose:hooks.choose,onClose:hooks.close});
 expect(result.props.children.type).toBe('iframe');expect(result.props.children.props).toMatchObject({sandbox:'allow-scripts allow-same-origin',title:'我的产品'});expect(result.props.children.props.src).toMatch(/^https:\/\/radar.example.test\/material-selection-frame\?requestId=/);
 const cleanup=hooks.effects[0]()!;const call=hooks.host.mock.calls[0];expect(call[1]).toBe(hooks.target);expect(call[4]).toEqual({limit:18,excludedIds:['old']});
 const source=call[5] as MaterialSelectionHostSource,signal=new AbortController().signal;
 hooks.api.mockResolvedValue({products:[{id:'set',name:'Bottle',version:'v1',description:'private fact',image:{token:'never-copy'}}],total:1});
 expect(await source.load({kind:'load',page:2,pageSize:24,q:'Bottle'},signal)).toEqual({products:[{id:'set',name:'Bottle',version:'v1'}],total:1});
 expect(hooks.api).toHaveBeenLastCalledWith('/api/source-products?offset=24&limit=24&q=Bottle',{signal});
 expect(await source.resolve([{id:'set',name:'Old name',version:'v1'}],signal)).toEqual([{id:'set',name:'Bottle',version:'v1'}]);expect(hooks.api).toHaveBeenLastCalledWith('/api/source-products?productId=set',{signal});
 call[6](['set']);expect(hooks.choose).toHaveBeenCalledWith(['set']);call[7]();expect(hooks.close).toHaveBeenCalledOnce();
 cleanup();expect(hooks.destroy).toHaveBeenCalledOnce();expect(document.documentElement.style.overflow).toBe('auto');expect(focus).toHaveBeenCalledWith({preventScroll:true});
});
it('closes a blocked or unavailable frame through the existing editor error surface',async()=>{
 vi.useFakeTimers();hooks.host.mockReturnValue({destroy:hooks.destroy,isReady:()=>false});const error=vi.fn();
 vi.stubGlobal('window',{addEventListener:vi.fn(),removeEventListener:vi.fn()});vi.stubGlobal('document',{documentElement:{style:{overflow:''}},activeElement:null});
 ProductImageSelectionFrameHost({productRadarOrigin:'https://radar.example.test',limit:18,excludedIds:[],onChoose:hooks.choose,onClose:hooks.close,onError:error});
 const cleanup=hooks.effects[0]()!;await vi.advanceTimersByTimeAsync(20_001);expect(hooks.close).toHaveBeenCalledOnce();expect(error).toHaveBeenCalledWith(expect.stringContaining('无法打开'));expect(hooks.choose).not.toHaveBeenCalled();cleanup();vi.useRealTimers();
});
it.each(['https://radar.example.test/path' ,'https://radar.example.test?token=private','http://attacker.test','https://user:password@radar.example.test'])('rejects an unvalidated frame URL: %s',origin=>{expect(()=>materialSelectionFrameUrl(origin,'session')).toThrow();});
