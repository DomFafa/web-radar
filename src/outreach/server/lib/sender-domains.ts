import {listResendDomains} from './resend';
import {parseProviderConfig} from './email-provider-selection';
export type SenderDomain = {domain:string;providerId:string;providerName:string;providerType:string;isDefault:boolean};
/** Read account-scoped verification state; never fabricate a fallback domain. */
export async function resolveSenderDomains<T extends {id:string;name:string;provider:string;status:string;apiKey:string;config:string|null;isDefault:boolean}>(configured:T[]) {
  const domains:SenderDomain[]=[],errors:{providerId:string;providerName:string;message:string}[]=[],providers:T[]=[];
  // Sequential calls avoid bursting through Resend's account API rate limit.
  for(const provider of [...configured].filter(p=>p.status==='active').sort((a,b)=>Number(b.isDefault)-Number(a.isDefault))) {
    const config=parseProviderConfig(provider.config);
    let items:any[]=[];
    if(provider.provider==='resend') {
      try {
        items=(await listResendDomains(provider.apiKey)).filter(d=>d.status==='verified' && d.capabilities?.sending!=='disabled').map(d=>({domain:d.name,status:d.status}));
        providers.push({...provider,config:JSON.stringify({...config,resendDomains:items})});
      }catch(error:any){errors.push({providerId:provider.id,providerName:provider.name,message:error.message});continue;}
    }else {
      providers.push(provider);
      if(provider.provider==='mailchimp')items=Array.isArray(config.mailchimpDomains)?config.mailchimpDomains.filter((d:any)=>d.status==='verified'||d.validSigning):[];
    }
    const seen=new Set<string>();
    for(const item of items){const domain=String(item.domain||'').trim().toLowerCase();if(!domain||seen.has(domain))continue;seen.add(domain);domains.push({domain,providerId:provider.id,providerName:provider.name,providerType:provider.provider,isDefault:provider.isDefault});}
  }
  return {domains,errors,providers};
}
