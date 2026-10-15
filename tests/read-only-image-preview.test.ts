import { afterEach, expect, it, vi } from 'vitest';
import { readOnlyImagePreview } from '../src/worker/asset-preview';
import type { AppEnv } from '../src/worker/env';
const env={SITE_BUILDER_URL:'https://builder.example.test',SITE_BUILDER_KEY:'server-secret'} as AppEnv;
const webp=new TextEncoder().encode('RIFF0000WEBPtest');
const original=(body:BodyInit=new Uint8Array([137,80,78,71]))=>new Response(body,{headers:{'Content-Type':'image/png'}});
afterEach(()=>vi.unstubAllGlobals());
it('uses only the existing bounded preview transform and keeps the service credential server-side',async()=>{
 const fetcher=vi.fn(async()=>new Response(webp,{headers:{'Content-Type':'image/webp'}}));vi.stubGlobal('fetch',fetcher);
 expect(await readOnlyImagePreview(env,original())).toEqual(webp);
 expect(fetcher).toHaveBeenCalledWith('https://builder.example.test/v1/media/preview',expect.objectContaining({redirect:'manual',headers:{Authorization:'Bearer server-secret','Content-Type':'image/png'}}));
});
it('rejects unknown-length oversized source streams before contacting the transform',async()=>{
 const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);let cancelled=false;
 const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(20*1024*1024));controller.enqueue(new Uint8Array(1));},cancel(){cancelled=true;}});
 await expect(readOnlyImagePreview(env,original(stream))).rejects.toMatchObject({code:'preview_size'});expect(cancelled).toBe(true);expect(fetcher).not.toHaveBeenCalled();
});
it('rejects redirected, forged or oversized preview output',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(new Response(null,{status:302,headers:{Location:'https://attacker.test'}})).mockResolvedValueOnce(new Response('not-a-webp!',{headers:{'Content-Type':'image/webp'}})).mockResolvedValueOnce(new Response(new Uint8Array(1024*1024+1),{headers:{'Content-Type':'image/webp'}}));vi.stubGlobal('fetch',fetcher);
 await expect(readOnlyImagePreview(env,original())).rejects.toMatchObject({code:'preview_unavailable'});
 await expect(readOnlyImagePreview(env,original())).rejects.toMatchObject({code:'preview_invalid'});
 await expect(readOnlyImagePreview(env,original())).rejects.toMatchObject({code:'preview_size'});
});
it('rejects an unsupported source and an insecure production preview origin',async()=>{
 const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
 await expect(readOnlyImagePreview(env,new Response('video',{headers:{'Content-Type':'video/mp4'}}))).rejects.toMatchObject({code:'preview_unsupported'});
 await expect(readOnlyImagePreview({...env,ENVIRONMENT:'production',SITE_BUILDER_URL:'http://builder.example.test'},original())).rejects.toMatchObject({code:'preview_unavailable'});expect(fetcher).not.toHaveBeenCalled();
});
