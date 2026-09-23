import { eq } from 'drizzle-orm';
import { providers } from '../../db/schema';
import type { createDb } from '../../db';
import type { Bindings } from '../../shared/types';

async function key(env: Bindings) {
  if (!env.CREDENTIAL_KEY) throw new Error('尚未配置凭据加密密钥');
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('web-radar/outreach/v1:' + env.CREDENTIAL_KEY));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function seal(value: string, id: string, env: Bindings) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({name:'AES-GCM', iv, additionalData:new TextEncoder().encode(id)}, await key(env), new TextEncoder().encode(value));
  return JSON.stringify({iv:[...iv],data:[...new Uint8Array(data)]});
}
export async function unseal(value: string, id: string, env: Bindings) {
  const record = JSON.parse(value);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(record.iv),additionalData:new TextEncoder().encode(id)},await key(env),new Uint8Array(record.data)));
}
export async function decodeProvider<T extends {id:string;apiKey:string;config:string|null}>(row:T, env:Bindings):Promise<T> {
  return {...row,apiKey:await unseal(row.apiKey,row.id,env),config:row.config ? await unseal(row.config,row.id+':config',env) : null};
}
export async function loadProviders(db:ReturnType<typeof createDb>,env:Bindings,workspaceId:string) {
  return Promise.all((await db.select().from(providers).where(eq(providers.userId,workspaceId))).map(row=>decodeProvider(row,env)));
}
export function redactConfig(config:string|null) {
  if (!config) return null;
  const value=JSON.parse(config);
  for(const k of Object.keys(value)) if(/secret|password|token|key/i.test(k)) value[k]='********';
  return JSON.stringify(value);
}
