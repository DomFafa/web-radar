import { assertPublicReference } from '../../../worker/reference-fetch';
// Validate every redirect; never forward provider credentials to a different origin.
export async function publicFetch(input:string|URL|Request,init?:RequestInit):Promise<Response> {
  let request=new Request(input,init);
  for(let attempt=0;attempt<4;attempt++) {
    await assertPublicReference(new URL(request.url));
    const response=await globalThis.fetch(request,{redirect:'manual'});
    if(![301,302,303,307,308].includes(response.status)||!response.headers.get('location'))return response;
    const next=new URL(response.headers.get('location')!,request.url);
    if(next.origin!==new URL(request.url).origin || request.method!=='GET') {await response.body?.cancel();throw new Error('服务重定向地址不受支持');}
    await response.body?.cancel();request=new Request(next,request);
  }
  throw new Error('服务重定向次数过多');
}
