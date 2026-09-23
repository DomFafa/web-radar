import { test, expect } from 'vitest';
import { seal, unseal, redactConfig } from '../../src/outreach/server/lib/credentials';
import { selectEmailProviderForSender } from '../../src/outreach/server/lib/email-provider-selection';
import type { Bindings } from '../../src/outreach/shared/types';
const env={CREDENTIAL_KEY:'unit-test-only'} as Bindings;
test('EDM credentials are encrypted and bound to their record id',async()=>{
 const value=await seal('provider-secret','account1',env);
 expect(value).not.toContain('provider-secret');
 expect(await unseal(value,'account1',env)).toBe('provider-secret');
 await expect(unseal(value,'account2',env)).rejects.toThrow();
 expect(redactConfig(JSON.stringify({host:'mail.example.com',secretAccessKey:'private',password:'private'}))).not.toContain('private');
});
test('provider selection never falls back to another workspace',()=>{
 const foreign={id:'foreign',userId:'other',provider:'sendgrid',apiKey:'secret',isDefault:true,config:null,status:'active'};
 expect(selectEmailProviderForSender([foreign],'mine','me@example.com').provider).toBeUndefined();
});
