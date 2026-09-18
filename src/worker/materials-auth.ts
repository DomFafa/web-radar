import type { Principal } from '../shared/model';
import { isMaterialsAccount } from '../shared/materials';
import type { AppEnv } from './env';
import { ApiError, sha256 } from './http';
import { integrationConfig, prService } from './product-radar';

export function assertMaterialsAccount(principal:Principal){
  if(!isMaterialsAccount(principal))throw new ApiError(403,'materials_feature_forbidden','当前账号尚未开放新版建站资料交接。');
}
export async function currentMaterialsPrincipal(env:AppEnv,identity:Pick<Principal,'userId'|'workspaceId'>):Promise<Principal>{
  if(!identity.userId||!identity.workspaceId||identity.userId.length>200||identity.workspaceId.length>200)throw new ApiError(400,'invalid_identity','缺少账号和工作区标识。');
  const context=await prService<{principal:Principal}>(env,{...identity,authSubject:'untrusted',email:'untrusted@example.invalid',displayName:'',systemRole:'user',workspaceRole:'member',workspaceName:''},'context');
  assertMaterialsAccount(context.principal);return context.principal;
}
export async function verifyMaterialsSecret(request:Request,env:AppEnv):Promise<void>{
  const {secret}=integrationConfig(env);
  if(await sha256(request.headers.get('X-Web-Radar-Secret')||'')!==await sha256(secret))throw new ApiError(401,'integration_key_invalid','集成凭据无效。');
}
