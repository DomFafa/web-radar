import { expect, it, vi } from 'vitest';
import { createMaterialSelectionHost } from '../src/client/material-selection-host';
const requestId='254bcd7e-c77c-435a-a76d-28ebd33ad934', operationId='37ecfa9d-8478-4c0d-8c94-13126df3058f';
function fixture() {
  const listeners=new Set<(event:MessageEvent)=>void>(),target={postMessage:vi.fn()};
  const surface={addEventListener:(_type:string,fn:(event:MessageEvent)=>void)=>listeners.add(fn),removeEventListener:(_type:string,fn:(event:MessageEvent)=>void)=>listeners.delete(fn)};
  const source={load:vi.fn().mockResolvedValue({products:[{id:'a',name:'Bottle',version:'v1'}],total:1}),resolve:vi.fn().mockResolvedValue([{id:'a',name:'Bottle',version:'v1'}]),thumbnail:vi.fn().mockResolvedValue(new TextEncoder().encode('RIFF0000WEBPtest').buffer)};
  const choose=vi.fn(),cancel=vi.fn();
  const host=createMaterialSelectionHost(surface,target,'https://radar.example.test',requestId,{limit:2,excludedIds:['old']},source,choose,cancel);
  const send=(message:Record<string,unknown>,origin='https://radar.example.test',sender:unknown=target)=>listeners.forEach(fn=>fn({data:{protocolVersion:1,requestId,...message},origin,source:sender} as MessageEvent));
  return {target,source,choose,cancel,host,send,listeners};
}
async function flush(){for(let i=0;i<8;i++)await Promise.resolve();}
it('initializes only the exact configured iframe with a strict credential-free message',()=>{
  const f=fixture();f.send({type:'ready'},'https://attacker.test');f.send({type:'ready'},undefined,{});f.send({type:'ready',token:'private'});expect(f.target.postMessage).not.toHaveBeenCalled();
  f.send({type:'ready'});expect(f.target.postMessage).toHaveBeenCalledWith({protocolVersion:1,requestId,type:'init',limit:2,excludedIds:['old']},'https://radar.example.test');f.host.destroy();
});
it('accepts choose only after the latest current-version resolve and never imports arbitrary IDs',async()=>{
  const f=fixture();f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['a']}});expect(f.choose).not.toHaveBeenCalled();
  f.send({type:'request',operationId,request:{kind:'resolve',products:[{id:'a',name:'Bottle',version:'v1'}]}});await flush();
  f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['other']}});expect(f.choose).not.toHaveBeenCalled();f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['a']}});expect(f.choose).toHaveBeenCalledExactlyOnceWith(['a']);
  f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['a']}});expect(f.choose).toHaveBeenCalledTimes(1);await flush();expect(f.listeners.size).toBe(0);
});
it('rejects stale versions, excluded IDs and replays before any import',async()=>{
  const f=fixture();f.source.resolve.mockResolvedValue([{id:'a',name:'Bottle',version:'v2'}]);
  f.send({type:'request',operationId,request:{kind:'resolve',products:[{id:'a',name:'Bottle',version:'v1'}]}});await flush();
  expect(f.target.postMessage.mock.calls.at(-1)![0].type).toBe('error');f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['a']}});expect(f.choose).not.toHaveBeenCalled();
  f.send({type:'request',operationId,request:{kind:'resolve',products:[{id:'a',name:'Bottle',version:'v2'}]}});await flush();expect(f.source.resolve).toHaveBeenCalledTimes(1);
  f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'resolve',products:[{id:'old',name:'Old',version:'v1'}]}});await flush();expect(f.source.resolve).toHaveBeenCalledTimes(1);f.host.destroy();
});
it('cancels pending requests and ignores late responses when the dialog closes',async()=>{
  const f=fixture();let resolve!:(value:unknown)=>void;f.source.load.mockImplementation(()=>new Promise(done=>resolve=done));
  f.send({type:'request',operationId,request:{kind:'load',page:1,pageSize:24,q:''}});expect(f.source.load).toHaveBeenCalledOnce();
  const signal=f.source.load.mock.calls[0][1] as AbortSignal;f.send({type:'cancel'});expect(signal.aborted).toBe(true);expect(f.cancel).toHaveBeenCalledOnce();
  resolve({products:[],total:0});await flush();expect(f.target.postMessage).not.toHaveBeenCalled();expect(f.choose).not.toHaveBeenCalled();
});
it('bounds thumbnail concurrency and validates WebP bytes before forwarding',async()=>{
  const f=fixture();const done:Array<(bytes:ArrayBuffer)=>void>=[];f.source.thumbnail.mockImplementation(()=>new Promise(resolve=>done.push(resolve)));
  for(let i=0;i<6;i++)f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'thumbnail',id:String(i),version:'v1'}});
  expect(f.source.thumbnail).toHaveBeenCalledTimes(4);done[0](new TextEncoder().encode('invalid-data').buffer);await flush();
  expect(f.source.thumbnail).toHaveBeenCalledTimes(5);expect(f.target.postMessage.mock.calls[0][0].type).toBe('error');f.host.destroy();
});

it('keeps the selected IDs available after a rejected import and waits for an explicit retry before closing',async()=>{
 const f=fixture();f.choose.mockRejectedValueOnce(new Error('Version conflict')).mockResolvedValueOnce(undefined);
 const resolve=()=>f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'resolve',products:[{id:'a',name:'Bottle',version:'v1'}]}});
 resolve();await flush();f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['a']}});await flush();
 expect(f.listeners.size).toBe(1);expect(f.cancel).not.toHaveBeenCalled();expect(f.target.postMessage.mock.calls.at(-1)![0]).toMatchObject({type:'error',message:'Version conflict'});
 resolve();await flush();f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['a']}});await flush();expect(f.choose).toHaveBeenNthCalledWith(2,['a']);expect(f.cancel).toHaveBeenCalledOnce();expect(f.listeners.size).toBe(0);
});
it.each(['resolve','reject'])('ignores late import %s after the customer closes the frame',async outcome=>{
 const f=fixture();let done!:(value?:unknown)=>void;f.choose.mockImplementation(()=>new Promise((resolve,reject)=>{done=outcome==='resolve'?resolve:reject;}));
 f.send({type:'request',operationId,request:{kind:'resolve',products:[{id:'a',name:'Bottle',version:'v1'}]}});await flush();f.send({type:'request',operationId:crypto.randomUUID(),request:{kind:'choose',ids:['a']}});
 const count=f.target.postMessage.mock.calls.length;f.send({type:'cancel'});done(outcome==='reject'?new Error('Late failure'):undefined);await flush();expect(f.target.postMessage).toHaveBeenCalledTimes(count);expect(f.cancel).toHaveBeenCalledOnce();expect(f.listeners.size).toBe(0);
});
